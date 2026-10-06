<?php
declare(strict_types=1);
defined('SAALANKRUTA_GATEWAY') || exit;

function saalWordPressConfig(): array {
    // This file is packaged only inside wp-content/themes/saalankruta/api/.
    $bootstrap = dirname(__DIR__, 4).'/wp-load.php';
    if (!is_file($bootstrap)) fail(503, 'The WordPress storefront is not installed in its expected folder.');
    // WooCommerce must defer cart initialization to its Store API token session.
    // Ordinary frontend initialization would create a new cookie cart first.
    if (!defined('REST_REQUEST')) define('REST_REQUEST', true);
    require_once dirname($bootstrap).'/wp-includes/plugin.php';
    add_filter('woocommerce_is_rest_api_request', static fn()=>true);
    if (!empty($_SESSION['cart_token'])) $_SERVER['HTTP_CART_TOKEN']=$_SESSION['cart_token'];
    require_once $bootstrap;
    if (!class_exists('Saalankruta_Headless') || !class_exists('WooCommerce')) fail(503, 'Activate the Saalankruta commerce plugin to connect this store.');
    return [
        'secret'=>wp_salt('auth'),
        'ordering_enabled'=>defined('SAALANKRUTA_ORDERING_ENABLED') && SAALANKRUTA_ORDERING_ENABLED,
    ];
}

function saalWordPressRequest(string $payload): array {
    $request = new WP_REST_Request('POST', '/saalankruta/v1/bridge');
    $request->set_header('content-type', 'application/json');
    $request->set_body($payload);
    // Internal PHP invocation follows the gateway's CSRF/origin/allowlist checks.
    // It never exposes a signed remote endpoint or credentials to the browser.
    $result = Saalankruta_Headless::bridge($request);
    $response = is_wp_error($result) ? rest_convert_error_to_response($result) : rest_ensure_response($result);
    return ['status'=>$response->get_status(), 'body'=>$response->get_data()];
}
