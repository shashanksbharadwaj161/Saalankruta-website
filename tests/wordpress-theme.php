<?php
/* Route and legacy-link checks use only temporary files, never a WooCommerce DB. */
define('ABSPATH', __DIR__);
$root=sys_get_temp_dir().'/saal-theme-'.bin2hex(random_bytes(8));
mkdir($root.'/shop',0700,true);mkdir($root.'/checkout',0700,true);
file_put_contents($root.'/index.html','home');file_put_contents($root.'/shop/index.html','shop');file_put_contents($root.'/checkout/index.html','checkout');
file_put_contents($root.'/storefront-routes.json',json_encode(['/' => false,'/shop/' => false,'/checkout/' => true]));
file_put_contents($root.'/catalogue.json',json_encode([['id'=>1688,'slug'=>'original-product']]));
file_put_contents($root.'/sitemap.xml','<urlset></urlset>');
$filters=[];$filterPriorities=[];$actions=[];
function get_template_directory(){global $root;return $root;}
function wp_parse_url($url,$component){return parse_url($url,$component);}
function add_filter($hook,$callback,$priority=10){global $filters,$filterPriorities;$filters[$hook]=$callback;$filterPriorities[$hook]=$priority;}
function add_action($hook,$callback,$priority=10){global $actions;$actions[$hook]=$callback;}
function status_header($status){global $responseStatus;$responseStatus=$status;}
function nocache_headers(){global $privateCache;$privateCache=true;}
function home_url($path){return 'https://saalankruta.com'.$path;}
function wp_safe_redirect($url,$status){throw new RuntimeException($status.' '.$url);}
require __DIR__.'/../wordpress-theme/functions.php';
function check($condition,$message){if(!$condition)throw new RuntimeException($message);}
$_SERVER['REQUEST_URI']='/';check(saalankruta_built_route()['file']===realpath($root.'/index.html'),'Homepage failed');
$_SERVER['REQUEST_URI']='/shop/?sort=price';check(saalankruta_built_route()['file']===realpath($root.'/shop/index.html'),'Collection query failed');
check($filters['redirect_canonical']('wrong-location')===false,'WordPress must preserve catalogue URLs');
// Core 6.6's pre_handle_404 callback redirects /sitemap.xml to /wp-sitemap.xml.
// Our exact-route bypass must run first to prevent a loop with the theme redirect.
check($filterPriorities['pre_handle_404']<10,'Compiled sitemap must run before the core sitemap redirect');
$_SERVER['REQUEST_URI']='/sitemap.xml';
check($filters['pre_handle_404'](false)===true,'Compiled sitemap must bypass the early WordPress redirect');
$_SERVER['REQUEST_URI']='/missing/';
check($filters['pre_handle_404'](false)===false,'Other routes must retain ordinary WordPress 404 handling');
check($filters['pre_handle_404'](true)===true,'Another plugin\'s 404 bypass must be preserved');
$_SERVER['REQUEST_URI']='/sitemap.xml';unlink($root.'/sitemap.xml');
check($filters['pre_handle_404'](false)===false,'A missing compiled sitemap must not suppress WordPress handling');
file_put_contents($root.'/sitemap.xml','<urlset></urlset>');
$_SERVER['REQUEST_URI']='/shop/';
$wp_query=(object)['is_404'=>true];$actions['template_redirect']();check($responseStatus===200&&!$wp_query->is_404,'Known routes must clear WordPress 404');
$_SERVER['REQUEST_URI']='/checkout/';check(saalankruta_built_route()['private']===true,'Customer routes must stay private');
foreach(['/wp-admin/','/wp-json/','/../shop/','/%2e%2e/shop/','/shop/%00/','/missing/'] as $path){$_SERVER['REQUEST_URI']=$path;check(saalankruta_built_route()===null,'Unexpected route accepted: '.$path);}
$_SERVER['REQUEST_URI']='/?p=1688';$_GET['p']='1688';
try{$actions['template_redirect']();throw new RuntimeException('Legacy redirect missing');}
catch(RuntimeException $e){check($e->getMessage()==='301 https://saalankruta.com/product/original-product/','Legacy product ID lost');}
unset($_GET['p']);$_SERVER['REQUEST_URI']='/wp-sitemap.xml';
try{$actions['template_redirect']();throw new RuntimeException('Sitemap redirect missing');}
catch(RuntimeException $e){check($e->getMessage()==='301 https://saalankruta.com/sitemap.xml','Sitemap URL changed');}
foreach(['index.html','shop/index.html','checkout/index.html','storefront-routes.json','catalogue.json','sitemap.xml'] as $file)unlink($root.'/'.$file);
rmdir($root.'/shop');rmdir($root.'/checkout');rmdir($root);
echo "WordPress routes, private pages, path boundaries and original product IDs passed.\n";
