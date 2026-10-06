<?php
declare(strict_types=1);
/* Install as /api/index.php. Configuration lives outside the document root. */
header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store, private');
header('X-Content-Type-Options: nosniff');
header('Referrer-Policy: no-referrer');
ini_set('display_errors', '0');
require __DIR__.'/private-path.php';
try {$privateBase=saalPrivateBase($_SERVER['DOCUMENT_ROOT']??'');}
catch (RuntimeException $e) {http_response_code(503);echo json_encode(['message'=>'The private store storage is not configured.']);exit;}
session_name('saal_session');
ini_set('session.use_strict_mode','1');
ini_set('session.use_only_cookies','1');
ini_set('session.gc_maxlifetime','2592000');
$sessionPath=getenv('SAALANKRUTA_SESSION_PATH')?:$privateBase.'/saal-sessions';
if(!is_dir($sessionPath)&&!mkdir($sessionPath,0700,true)){http_response_code(503);echo json_encode(['message'=>'The store session could not be opened.']);exit;}
session_save_path($sessionPath);
$local=getenv('SAALANKRUTA_ENV')==='local'&&in_array($_SERVER['REMOTE_ADDR']??'',['127.0.0.1','::1'],true);
session_set_cookie_params(['lifetime'=>2592000,'path'=>'/','secure'=>!$local,'httponly'=>true,'samesite'=>'Lax']);
session_start();
function fail(int $status,string $message): never {http_response_code($status);echo json_encode(['message'=>$message]);exit;}
$_SESSION['csrf'] ??= bin2hex(random_bytes(32));
$_SESSION['checkout_session'] ??= bin2hex(random_bytes(32));
if ($_SERVER['REQUEST_METHOD']==='GET' && ($_GET['action']??'')==='bootstrap') {echo json_encode(['csrf'=>$_SESSION['csrf']]);exit;}
if ($_SERVER['REQUEST_METHOD']!=='POST') fail(405,'Method not allowed.');
if (!hash_equals($_SESSION['csrf'],(string)($_SERVER['HTTP_X_CSRF_TOKEN']??''))) fail(403,'Your session has expired. Refresh the page and try again.');
$origin=$local?(getenv('SAALANKRUTA_LOCAL_ORIGIN')?:'http://127.0.0.1:5174'):'https://'.$_SERVER['HTTP_HOST'];
if (isset($_SERVER['HTTP_ORIGIN']) && $_SERVER['HTTP_ORIGIN']!==$origin) fail(403,'Invalid request origin.');
if ((int)($_SERVER['CONTENT_LENGTH']??0)>65536) fail(413,'Request too large.');
$request=json_decode(file_get_contents('php://input'),true);
if (!is_array($request)||!is_array($request['data']??null)) fail(400,'Invalid request.');
$action=(string)($request['action']??'');
$allowed=['catalogue','product','categories','me','cart','add-item','update-item','remove-item','apply-coupon','remove-coupon','update-customer','select-shipping-rate','checkout','payment-config','login','register','logout','password-reset','complete-reset','address','orders','wishlist','track','contact'];
if (!in_array($action,$allowed,true)) fail(404,'Unknown operation.');
$configPath=getenv('SAALANKRUTA_CONFIG') ?: $privateBase.'/saalankruta-config.php';
if (!is_file($configPath)) fail(503,'The store service is not connected yet. Please contact the boutique.');
$config=require $configPath;
if (!is_array($config)||empty($config['backend'])||strlen($config['secret']??'')<32) fail(503,'The store service configuration is incomplete.');
$url=rtrim($config['backend'],'/').'/wp-json/saalankruta/v1/bridge';
if (!str_starts_with($url,'https://')&&!($local&&parse_url($url,PHP_URL_HOST)==='127.0.0.1')) fail(503,'Secure backend connection required.');
if ($action==='checkout' && empty($config['ordering_enabled'])) fail(409,'Online ordering is not open yet. Please contact the boutique.');
$window=(int)(time()/60);
if (($_SESSION['rate_window']??0)!==$window){$_SESSION['rate_window']=$window;$_SESSION['rate_count']=0;}
if (++$_SESSION['rate_count']>90) fail(429,'Too many requests. Please wait a moment.');
$payload=json_encode(['action'=>$action,'data'=>$request['data'],'user_token'=>$_SESSION['user_token']??'','cart_token'=>$_SESSION['cart_token']??'','checkout_session'=>$_SESSION['checkout_session'],'client'=>hash_hmac('sha256',$_SERVER['REMOTE_ADDR']??'unknown',$config['secret'])],JSON_UNESCAPED_SLASHES);
$timestamp=(string)time();$nonce=bin2hex(random_bytes(16));
$signature=hash_hmac('sha256',$timestamp.'.'.$nonce.'.'.$payload,$config['secret']);
$curl=curl_init($url);
curl_setopt_array($curl,[CURLOPT_POST=>true,CURLOPT_POSTFIELDS=>$payload,CURLOPT_HTTPHEADER=>['Content-Type: application/json','X-Saal-Timestamp: '.$timestamp,'X-Saal-Nonce: '.$nonce,'X-Saal-Signature: '.$signature],CURLOPT_RETURNTRANSFER=>true,CURLOPT_CONNECTTIMEOUT=>8,CURLOPT_TIMEOUT=>40,CURLOPT_FOLLOWLOCATION=>false,CURLOPT_SSL_VERIFYPEER=>true,CURLOPT_SSL_VERIFYHOST=>2]);
$response=curl_exec($curl);$status=(int)curl_getinfo($curl,CURLINFO_HTTP_CODE);$err=curl_errno($curl);curl_close($curl);
if ($err||$status===0) fail(502,'The boutique is temporarily unavailable. Please try again.');
$body=json_decode((string)$response,true);
if (!is_array($body)&&!($action==='me'&&$body===null&&$status===200)) fail(502,'The store service returned an invalid response.');
if (isset($body['_cart_token'])){$_SESSION['cart_token']=$body['_cart_token'];unset($body['_cart_token']);}
if (isset($body['_user_token'])){session_regenerate_id(true);$_SESSION['user_token']=$body['_user_token'];unset($body['_user_token']);}
if ($action==='logout'&&$status<400){unset($_SESSION['user_token'],$_SESSION['cart_token']);$_SESSION['checkout_session']=bin2hex(random_bytes(32));session_regenerate_id(true);}
http_response_code($status);echo json_encode($body,JSON_UNESCAPED_SLASHES);
