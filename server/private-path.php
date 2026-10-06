<?php
declare(strict_types=1);

/* A subdomain can be nested inside the main site's public_html on Hostinger. */
function saalPrivateBase(string $documentRoot): string {
    $root = rtrim(str_replace('\\', '/', $documentRoot), '/');
    if ($root === '' || $root === '.' || !preg_match('~^(?:/|[A-Za-z]:/)~', $root)) {
        throw new RuntimeException('An absolute document root is required.');
    }
    for ($candidate = $root; ; $candidate = $parent) {
        if (basename($candidate) === 'public_html') return dirname($candidate);
        $parent = dirname($candidate);
        if ($parent === $candidate || $parent === '.') break;
    }
    return dirname($root);
}
