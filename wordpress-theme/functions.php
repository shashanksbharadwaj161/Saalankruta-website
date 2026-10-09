<?php
defined('ABSPATH') || exit;
if (!defined('SAALANKRUTA_STOREFRONT_URL')) define('SAALANKRUTA_STOREFRONT_URL', home_url('/'));

function saalankruta_built_route(): ?array {
    static $routes = null;
    $root = get_template_directory();
    $routes ??= json_decode((string)file_get_contents($root.'/storefront-routes.json'), true) ?: [];
    $path = rawurldecode((string)(wp_parse_url($_SERVER['REQUEST_URI'] ?? '/', PHP_URL_PATH) ?? '/'));
    $path = '/'.trim($path, '/');
    if ($path !== '/') $path .= '/';
    if (!array_key_exists($path, $routes)) return null;
    $file = realpath($root.$path.'index.html');
    $base = realpath($root);
    if (!$file || !$base || !str_starts_with($file, $base.DIRECTORY_SEPARATOR)) return null;
    return ['file'=>$file, 'private'=>(bool)$routes[$path]];
}

add_filter('template_include', function($template) {
    return get_template_directory().'/index.php';
}, PHP_INT_MAX);

// The compiled pages provide canonical tags; WordPress must not guess app URLs.
add_filter('redirect_canonical', fn($redirect) => false);

// WordPress 6.6 redirects sitemap.xml during 404 handling, before
// template_redirect. Let the compiled sitemap reach our handler below.
add_filter('pre_handle_404', function($preempt) {
    if ($preempt) return $preempt;
    $path = wp_parse_url($_SERVER['REQUEST_URI'] ?? '/', PHP_URL_PATH);
    return $path === '/sitemap.xml' && is_file(get_template_directory().'/sitemap.xml')
        ? true
        : $preempt;
}, 0);

add_action('template_redirect', function() {
    $path = wp_parse_url($_SERVER['REQUEST_URI'] ?? '/', PHP_URL_PATH);
    if ($path === '/wp-sitemap.xml') {
        wp_safe_redirect(home_url('/sitemap.xml'), 301);
        exit;
    }
    $publicFiles = ['/sitemap.xml'=>'application/xml', '/robots.txt'=>'text/plain'];
    if (isset($publicFiles[$path])) {
        $file = get_template_directory().$path;
        if (is_file($file)) {
            status_header(200);
            header('Content-Type: '.$publicFiles[$path].'; charset=utf-8');
            readfile($file);
            exit;
        }
    }
    if (isset($_GET['p']) && ctype_digit((string)$_GET['p'])) {
        $products = json_decode((string)file_get_contents(get_template_directory().'/catalogue.json'), true) ?: [];
        foreach ($products as $product) {
            if ((int)$product['id'] === (int)$_GET['p']) {
                wp_safe_redirect(home_url('/product/'.rawurlencode($product['slug']).'/'), 301);
                exit;
            }
        }
    }
    $route = saalankruta_built_route();
    if ($route) {
        global $wp_query;
        $wp_query->is_404 = false;
        status_header(200);
        if ($route['private']) {
            nocache_headers();
            header('X-Robots-Tag: noindex, nofollow');
        }
    }
}, 0);
