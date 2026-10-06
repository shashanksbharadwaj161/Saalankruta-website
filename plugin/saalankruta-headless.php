<?php
/**
 * Plugin Name: Saalankruta Headless Commerce
 * Description: Signed, scoped storefront bridge, customer sessions, wishlist and tracking.
 * Version: 1.0.0
 * Requires PHP: 8.1
 * Requires Plugins: woocommerce
 */
defined('ABSPATH') || exit;
final class Saalankruta_Headless {
 private const TOKEN_TTL=604800;
 public static function init():void {
  add_action('rest_api_init',function(){register_rest_route('saalankruta/v1','/bridge',['methods'=>'POST','callback'=>[self::class,'bridge'],'permission_callback'=>[self::class,'verify']]);});
  add_action('woocommerce_admin_order_data_after_shipping_address',[self::class,'tracking_field']);
  add_action('woocommerce_process_shop_order_meta',[self::class,'save_tracking']);
  add_action('woocommerce_update_product',[self::class,'catalogue_changed']);
  add_action('woocommerce_new_product',[self::class,'catalogue_changed']);
  add_action('before_delete_post',function($id){if(get_post_type($id)==='product')self::catalogue_changed();});
  add_action('saalankruta_catalogue_rebuild',[self::class,'rebuild']);
  add_filter('retrieve_password_message',[self::class,'reset_message'],10,4);
  add_action('admin_notices',function(){if(!defined('SAALANKRUTA_BRIDGE_SECRET')&&get_template()!=='saalankruta')echo '<div class="notice notice-info"><p>Saalankruta commerce: activate the coded storefront theme for this WordPress installation, or configure a private bridge secret for a separate storefront.</p></div>';});
 }
 public static function verify(WP_REST_Request $r) {
  if(!defined('SAALANKRUTA_BRIDGE_SECRET')||strlen(SAALANKRUTA_BRIDGE_SECRET)<32)return new WP_Error('unconfigured','Store service is not configured.',['status'=>503]);
  $stamp=$r->get_header('x-saal-timestamp');$nonce=$r->get_header('x-saal-nonce');$sig=$r->get_header('x-saal-signature');
  if(!ctype_digit($stamp)||abs(time()-(int)$stamp)>90||!preg_match('/^[a-f0-9]{32}$/',$nonce))return new WP_Error('forbidden','Invalid request.',['status'=>403]);
  $expected=hash_hmac('sha256',$stamp.'.'.$nonce.'.'.$r->get_body(),SAALANKRUTA_BRIDGE_SECRET);
  if(!hash_equals($expected,$sig))return new WP_Error('forbidden','Invalid request.',['status'=>403]);
  $key='saal_nonce_'.hash('sha256',$nonce);
  if(!add_option($key,time(),'','no'))return new WP_Error('replay','Request already used.',['status'=>403]);
  // Bound nonce storage; only expired entries are removed.
  global $wpdb;$wpdb->query($wpdb->prepare("DELETE FROM {$wpdb->options} WHERE option_name LIKE %s AND CAST(option_value AS UNSIGNED) < %d",$wpdb->esc_like('saal_nonce_').'%',time()-180));
  return true;
 }
 private static function error(string $message,int $status=400){return new WP_Error('saal_error',$message,['status'=>$status]);}
 private static function limited(string $name,string $client,int $limit,int $seconds):bool {$key='saal_rate_'.hash('sha256',$name.$client);$count=(int)get_transient($key);set_transient($key,$count+1,$seconds);return $count<$limit;}
 private static function user(string $token):int {
  if(!preg_match('/^([0-9]+)\.([a-f0-9]{64})$/',$token,$parts))return 0;
  $id=(int)$parts[1];$sessions=get_user_meta($id,'_saal_sessions',true);$hash=hash('sha256',$parts[2]);
  return is_array($sessions)&&($sessions[$hash]??0)>time()?$id:0;
 }
 private static function issue(int $id):string {$token=bin2hex(random_bytes(32));$sessions=get_user_meta($id,'_saal_sessions',true);$sessions=is_array($sessions)?array_filter($sessions,fn($exp)=>$exp>time()):[];if(count($sessions)>10)$sessions=array_slice($sessions,-10,null,true);$sessions[hash('sha256',$token)]=time()+self::TOKEN_TTL;update_user_meta($id,'_saal_sessions',$sessions);return $id.'.'.$token;}
 private static function customer(int $id):array {$c=new WC_Customer($id);return ['id'=>$id,'name'=>$c->get_display_name(),'email'=>$c->get_email(),'billing'=>$c->get_billing(),'shipping'=>$c->get_shipping(),'wishlist'=>array_values((array)get_user_meta($id,'_saal_wishlist',true))];}
 private static function order(WC_Order $order):array {$items=[];foreach($order->get_items()as$item)$items[]=['name'=>$item->get_name(),'quantity'=>$item->get_quantity()];return ['id'=>$order->get_id(),'status'=>$order->get_status(),'date'=>$order->get_date_created()?->date('c'),'total'=>$order->get_total(),'tracking_url'=>$order->get_meta('_saal_tracking_url'),'items'=>$items];}
 public static function bridge(WP_REST_Request $r) {
  if(!class_exists('WooCommerce'))return self::error('Commerce service unavailable.',503);
  $p=$r->get_json_params();$d=$p['data']??[];$action=$p['action']??'';$client=(string)($p['client']??'');$uid=self::user((string)($p['user_token']??''));
  if(!is_array($d))return self::error('Invalid request.');
  wp_set_current_user($uid);
  if(!self::limited('all',$client,200,60))return self::error('Please wait a moment before trying again.',429);
  switch($action){
   case 'me':return $uid?self::customer($uid):['authenticated'=>false];
   case 'product':
    $item=wc_get_product(absint($d['id']??0));$parent=$item&&$item->is_type('variation')?wc_get_product($item->get_parent_id()):$item;
    if(!$item||!$parent||$item->get_status()!=='publish'||$parent->get_status()!=='publish')return self::error('Product not found.',404);
    return rest_do_request(new WP_REST_Request('GET','/wc/store/v1/products/'.$item->get_id()));
   case 'catalogue':case 'categories':
    $resource=$action==='catalogue'?'products':'products/categories';$all=[];
    for($page=1;$page<=100;$page++){$request=new WP_REST_Request('GET','/wc/store/v1/'.$resource);$request->set_query_params(['per_page'=>100,'page'=>$page]);$response=rest_do_request($request);if($response->get_status()>=400)return $response;$batch=$response->get_data();$all=array_merge($all,$batch);if(count($batch)<100)return $all;}return self::error('Catalogue is too large to load.',503);
   case 'login':case 'register':
    if(!self::limited('auth',$client,10,900))return self::error('Too many attempts. Please try again later.',429);
    $email=sanitize_email($d['email']??'');$password=(string)($d['password']??'');
    if($action==='register'){
     if(!is_email($email)||strlen($password)<12)return self::error('Enter a valid email and a password of at least 12 characters.');
     $created=wc_create_new_customer($email,'',$password,['display_name'=>sanitize_text_field($d['name']??'')]);
     if(is_wp_error($created))return self::error('Unable to create an account. If you already have one, sign in or reset your password.');
     $uid=$created;
    }else{$user=wp_authenticate($email,$password);if(is_wp_error($user))return self::error('Email or password is incorrect.',401);$uid=$user->ID;}
    $result=self::customer($uid);$result['_user_token']=self::issue($uid);return $result;
   case 'logout':
    if($uid){$sessions=(array)get_user_meta($uid,'_saal_sessions',true);$parts=explode('.',$p['user_token']);unset($sessions[hash('sha256',$parts[1])]);update_user_meta($uid,'_saal_sessions',$sessions);}return ['ok'=>true];
   case 'password-reset':
    if(!self::limited('reset',$client,5,900))return self::error('Please try again later.',429);
    $user=get_user_by('email',sanitize_email($d['email']??''));if($user)retrieve_password($user->user_login);return ['ok'=>true];
   case 'complete-reset':
    if(!self::limited('reset-confirm',$client,10,900))return self::error('Please try again later.',429);
    $user=check_password_reset_key((string)($d['key']??''),(string)($d['login']??''));if(is_wp_error($user)||strlen($d['password']??'')<12)return self::error('The reset link is invalid or the password is too short.');
    reset_password($user,$d['password']);delete_user_meta($user->ID,'_saal_sessions');return ['ok'=>true];
   case 'wishlist':
    if(!$uid)return self::error('Please sign in.',401);$ids=array_slice(array_unique(array_map('absint',(array)($d['ids']??[]))),0,200);$ids=array_values(array_filter($ids,fn($id)=>get_post_status($id)==='publish'&&get_post_type($id)==='product'));update_user_meta($uid,'_saal_wishlist',$ids);return ['wishlist'=>$ids];
   case 'address':
    if(!$uid)return self::error('Please sign in.',401);$customer=new WC_Customer($uid);$billing=self::address((array)($d['billing']??[]));if(is_wp_error($billing))return $billing;foreach($billing as$field=>$value){$setter='set_billing_'.$field;if(is_callable([$customer,$setter]))$customer->$setter($value);}$customer->save();return self::customer($uid);
   case 'orders':
    if(!$uid)return self::error('Please sign in.',401);return array_map([self::class,'order'],wc_get_orders(['customer_id'=>$uid,'limit'=>50,'orderby'=>'date','order'=>'DESC','status'=>array_keys(wc_get_order_statuses())]));
   case 'track':
    if(!self::limited('track',$client,20,900))return self::error('Please try again later.',429);
    $order=wc_get_order(absint($d['id']??0));$key=(string)($d['key']??'');
    if(!$order||!(($uid&&$order->get_customer_id()===$uid)||($key!==''&&hash_equals($order->get_order_key(),$key))))return self::error('Order not found. Check your confirmation link or sign in.',404);return self::order($order);
   case 'contact':
    if(!self::limited('contact',$client,5,900))return self::error('Please try again later.',429);
    if(!empty($d['website']))return ['ok'=>true];$email=sanitize_email($d['email']??'');$name=sanitize_text_field($d['name']??'');$message=sanitize_textarea_field($d['message']??'');
    if(!is_email($email)||strlen($message)<10||strlen($message)>5000)return self::error('Please enter a valid email and message.');
    $ok=wp_mail('saalankruta@gmail.com','Boutique enquiry: '.substr($name,0,100),$message."\n\nFrom: ".$name.' <'.$email.'>',['Reply-To: '.$email]);if(!$ok)return self::error('Message delivery failed. Please email the boutique directly.',502);return ['ok'=>true];
   case 'payment-config':
    $enabled=defined('SAALANKRUTA_ORDERING_ENABLED')&&SAALANKRUTA_ORDERING_ENABLED;$ids=defined('SAALANKRUTA_PAYMENT_METHODS')?SAALANKRUTA_PAYMENT_METHODS:[];$methods=[];
    foreach(WC()->payment_gateways()->payment_gateways()as$id=>$gateway)if($gateway->enabled==='yes'&&in_array($id,$ids,true))$methods[]=['id'=>$id,'title'=>$gateway->get_title()];return ['enabled'=>$enabled&&!empty($methods),'methods'=>$methods];
  }
  $routes=['cart'=>['GET','cart'],'add-item'=>['POST','cart/add-item'],'update-item'=>['POST','cart/update-item'],'remove-item'=>['POST','cart/remove-item'],'apply-coupon'=>['POST','cart/apply-coupon'],'remove-coupon'=>['POST','cart/remove-coupon'],'update-customer'=>['POST','cart/update-customer'],'select-shipping-rate'=>['POST','cart/select-shipping-rate'],'checkout'=>['POST','checkout']];
  if(!isset($routes[$action]))return self::error('Unknown operation.',404);
  if($action==='update-customer'||$action==='checkout')foreach(['billing_address','shipping_address']as$field){$validated=self::address((array)($d[$field]??[]));if(is_wp_error($validated))return $validated;$d[$field]=$validated;}
  $lock='';
  if($action==='checkout'){
   if(!defined('SAALANKRUTA_ORDERING_ENABLED')||!SAALANKRUTA_ORDERING_ENABLED)return self::error('Online ordering is not open yet.',409);
   if(!defined('SAALANKRUTA_PAYMENT_METHODS')||!in_array($d['payment_method']??'',SAALANKRUTA_PAYMENT_METHODS,true))return self::error('Select an available payment method.');
   if(!preg_match('/^[a-f0-9-]{36}$/',$d['idempotency_key']??''))return self::error('Invalid checkout request.');
   // Cart JWTs are renewed by WooCommerce; bind retries to a stable private storefront session.
   if(!preg_match('/^[a-f0-9]{64}$/',$p['checkout_session']??''))return self::error('Invalid checkout session.',403);
   $lock='saal_checkout_'.hash('sha256',$p['checkout_session'].$d['idempotency_key']);
   $fingerprint=hash('sha256',wp_json_encode($d));
   $existing=get_option($lock);if(is_array($existing)&&isset($existing['result'])){if(!hash_equals($existing['fingerprint']??'',$fingerprint))return self::error('This checkout request was already used. Review your existing order before submitting again.',409);return $existing['result'];}
   if($existing||!add_option($lock,['created'=>time(),'fingerprint'=>$fingerprint],'','no'))return self::error('This order is already being processed. Check your orders before retrying.',409);
   unset($d['idempotency_key'],$d['customer_password']);$d['create_account']=!empty($d['create_account']);
  }
  [$method,$path]=$routes[$action];$request=new WP_REST_Request($method,'/wc/store/v1/'.$path);$request->set_body_params($d);
  $request->set_header('Nonce',wp_create_nonce('wc_store_api'));
  $token=(string)($p['cart_token']??'');if($token){$request->set_header('Cart-Token',$token);$_SERVER['HTTP_CART_TOKEN']=$token;}else{unset($_SERVER['HTTP_CART_TOKEN']);}
  if($action==='checkout'){
   if(!$token){delete_option($lock);return self::error('Your bag session has expired. Refresh it before placing an order.',409);}
   if(!is_email($d['billing_address']['email']??'')){delete_option($lock);return self::error('Enter a valid billing email.');}
   $current=new WP_REST_Request('GET','/wc/store/v1/cart');$current->set_header('Cart-Token',$token);$current->set_header('Nonce',wp_create_nonce('wc_store_api'));
   $currentResponse=rest_do_request($current);$currentCart=json_decode(wp_json_encode($currentResponse->get_data()),true);
   if($currentResponse->get_status()>=400){delete_option($lock);return $currentResponse;}
   if((string)($d['expected_total']??'')!==(string)($currentCart['totals']['total_price']??'')){delete_option($lock);return self::error('Your order total has changed. Refresh your bag and review the updated total.',409);}
  }
  $response=rest_do_request($request);$body=json_decode(wp_json_encode($response->get_data()),true);$headers=$response->get_headers();
  foreach($headers as$h=>$v)if(strtolower($h)==='cart-token'&&is_array($body))$body['_cart_token']=$v;
  if($lock){if($response->get_status()<400)update_option($lock,['result'=>$body,'created'=>time(),'fingerprint'=>$fingerprint],false);else delete_option($lock);}
  return new WP_REST_Response($body,$response->get_status());
 }
 private static function address(array $d){
  if(($d['country']??'IN')!=='IN')return self::error('Delivery is available within India only.');
  if(!preg_match('/^[1-9][0-9]{5}$/',(string)($d['postcode']??'')))return self::error('Enter a valid six-digit Indian PIN code.');
  $states=WC()->countries->get_states('IN');if(!isset($states[$d['state']??'']))return self::error('Select a valid Indian state or union territory.');
  foreach(['first_name','last_name','address_1','city']as$field)if(empty($d[$field]))return self::error('Complete all required address fields.');
  $allowed=['first_name','last_name','company','address_1','address_2','city','state','postcode','country','email','phone'];$address=[];foreach($allowed as$field)if(isset($d[$field]))$address[$field]=sanitize_text_field($d[$field]);$address['country']='IN';if(!empty($address['email'])&&!is_email($address['email']))return self::error('Enter a valid email.');return $address;
 }
 public static function tracking_field($order):void {if(!$order instanceof WC_Order)return;woocommerce_wp_text_input(['id'=>'_saal_tracking_url','label'=>'Courier tracking URL','value'=>$order->get_meta('_saal_tracking_url'),'type'=>'url']);wp_nonce_field('saal_tracking','saal_tracking_nonce');}
 public static function save_tracking($id):void {if(!isset($_POST['saal_tracking_nonce'])||!wp_verify_nonce(sanitize_text_field(wp_unslash($_POST['saal_tracking_nonce'])),'saal_tracking')||!current_user_can('edit_shop_orders'))return;$url=esc_url_raw(wp_unslash($_POST['_saal_tracking_url']??''),['https']);$order=wc_get_order($id);if($order){$order->update_meta_data('_saal_tracking_url',$url);$order->save();}}
 public static function catalogue_changed():void {if(!wp_next_scheduled('saalankruta_catalogue_rebuild'))wp_schedule_single_event(time()+120,'saalankruta_catalogue_rebuild');}
 public static function rebuild():void {if(!defined('SAALANKRUTA_GITHUB_TOKEN'))return;$result=wp_remote_post('https://api.github.com/repos/shashanksbharadwaj161/Saalankruta-website/dispatches',['timeout'=>15,'headers'=>['Authorization'=>'Bearer '.SAALANKRUTA_GITHUB_TOKEN,'Accept'=>'application/vnd.github+json','Content-Type'=>'application/json'],'body'=>wp_json_encode(['event_type'=>'catalogue-update'])]);if(is_wp_error($result)||wp_remote_retrieve_response_code($result)!==204){if(!wp_next_scheduled('saalankruta_catalogue_rebuild'))wp_schedule_single_event(time()+600,'saalankruta_catalogue_rebuild');}}
 public static function reset_message($message,$key,$login,$user):string {if(!defined('SAALANKRUTA_STOREFRONT_URL'))return $message;return "Reset your Saalankruta password:\n".trailingslashit(SAALANKRUTA_STOREFRONT_URL).'reset-password/?key='.rawurlencode($key).'&login='.rawurlencode($login)."\nIf you did not request this, ignore this email.";}
}
Saalankruta_Headless::init();
// The gateway is deliberately absent from production unless explicitly enabled on staging.
add_action('plugins_loaded',function(){
 if(!class_exists('WC_Payment_Gateway')||!defined('SAALANKRUTA_TEST_GATEWAY')||!SAALANKRUTA_TEST_GATEWAY||wp_get_environment_type()==='production')return;
 class Saalankruta_Test_Gateway extends WC_Payment_Gateway {
  public function __construct(){$this->id='saal_test';$this->method_title='Saalankruta staging test';$this->title='Staging test payment — no charge';$this->enabled='yes';$this->supports=['products'];}
  public function process_payment($order_id){$order=wc_get_order($order_id);$order->payment_complete('saal-test-'.$order_id);return ['result'=>'success','redirect'=>trailingslashit(SAALANKRUTA_STOREFRONT_URL).'order-confirmation/?order='.$order_id.'&key='.$order->get_order_key()];}
 }
 add_filter('woocommerce_payment_gateways',function($gateways){$gateways[]=Saalankruta_Test_Gateway::class;return $gateways;});
});
