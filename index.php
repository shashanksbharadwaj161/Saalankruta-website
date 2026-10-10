<?php
defined('ABSPATH') || exit;
$route = saalankruta_built_route();
if (!$route) {
    status_header(404);
    $route = ['file'=>get_template_directory().'/index.html'];
}
header('Content-Type: text/html; charset=utf-8');
readfile($route['file']);
