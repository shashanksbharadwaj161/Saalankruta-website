<?php
require __DIR__.'/../server/private-path.php';
$cases = [
    '/home/account/domains/store/public_html' => '/home/account/domains/store',
    '/home/account/domains/store/public_html/saal-preview' => '/home/account/domains/store',
    '/home/account/domains/store/public_html/preview/nested/' => '/home/account/domains/store',
    '/srv/store/dist' => '/srv/store',
    'C:\\sites\\public_html\\preview' => 'C:/sites',
];
foreach ($cases as $documentRoot => $expected) {
    if (saalPrivateBase($documentRoot) !== $expected) throw new RuntimeException('Private path escaped into a public website: '.$documentRoot);
}
foreach (['', '.', 'public_html/preview', '/'] as $invalid) {
    try {saalPrivateBase($invalid);}
    catch (RuntimeException $e) {continue;}
    throw new RuntimeException('Invalid document root accepted.');
}
echo "Private storage stays outside main and nested preview webroots.\n";
