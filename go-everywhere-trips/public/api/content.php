<?php
// Public, read-only: the site content published from the admin panel.
// 404 means "nothing published yet" and the website falls back to its built-in content.
require __DIR__ . '/payu/lib.php';

header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-cache');
header('X-Robots-Tag: noindex');

$file = data_dir() . '/content.json';
if (!is_file($file)) { http_response_code(404); echo '{"ok":false,"error":"no content published"}'; exit; }

$etag = '"' . md5_file($file) . '"';
header('ETag: ' . $etag);
if (($_SERVER['HTTP_IF_NONE_MATCH'] ?? '') === $etag) { http_response_code(304); exit; }
readfile($file);
