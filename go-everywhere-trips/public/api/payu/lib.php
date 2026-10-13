<?php
// Shared helpers for the PayU checkout. Not meant to be opened directly.
if (basename($_SERVER['SCRIPT_FILENAME'] ?? '') === 'lib.php') { http_response_code(404); exit; }

date_default_timezone_set('Asia/Kolkata');

const PAYU_URLS = [
    'test' => 'https://test.payu.in/_payment',
    'live' => 'https://secure.payu.in/_payment',
];

/**
 * Config lives OUTSIDE public_html so deploys never overwrite it and it can never be downloaded:
 *   /home/<user>/domains/<domain>/payu-config.php   (one level above public_html)
 * In local dev (`npm run php`, docroot = public/) that is the project root.
 */
function payu_config(): ?array {
    $docRoot = rtrim($_SERVER['DOCUMENT_ROOT'] ?? dirname(__DIR__, 2), '/');
    foreach ([dirname($docRoot) . '/payu-config.php'] as $file) {
        if (is_file($file)) {
            $cfg = require $file;
            if (is_array($cfg) && !empty($cfg['key']) && !empty($cfg['salt'])) {
                return $cfg + ['mode' => 'test', 'advance_percent' => 30, 'notify_email' => '', 'site_url' => ''];
            }
        }
    }
    return null;
}

/** Trip prices and dates exported from src/data/trips.js at build time — the browser never decides the amount. */
function payu_catalog(): array {
    $json = @file_get_contents(__DIR__ . '/catalog.json');
    return $json ? (json_decode($json, true) ?: []) : [];
}

function site_base(array $cfg): string {
    if (!empty($cfg['site_url'])) return rtrim($cfg['site_url'], '/');
    $https = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off')
        || (($_SERVER['HTTP_X_FORWARDED_PROTO'] ?? '') === 'https');
    return ($https ? 'https' : 'http') . '://' . $_SERVER['HTTP_HOST'];
}

// PayU request hash: key|txnid|amount|productinfo|firstname|email|udf1|udf2|udf3|udf4|udf5||||||SALT
function payu_request_hash(array $p, string $salt): string {
    $seq = [$p['key'], $p['txnid'], $p['amount'], $p['productinfo'], $p['firstname'], $p['email'],
            $p['udf1'], $p['udf2'], $p['udf3'], $p['udf4'], $p['udf5'], '', '', '', '', '', $salt];
    return strtolower(hash('sha512', implode('|', $seq)));
}

// PayU response hash: [additionalCharges|]SALT|status||||||udf5|udf4|udf3|udf2|udf1|email|firstname|productinfo|amount|txnid|key
function payu_response_hash(array $r, string $salt): string {
    $seq = [$salt, $r['status'] ?? '', '', '', '', '', '',
            $r['udf5'] ?? '', $r['udf4'] ?? '', $r['udf3'] ?? '', $r['udf2'] ?? '', $r['udf1'] ?? '',
            $r['email'] ?? '', $r['firstname'] ?? '', $r['productinfo'] ?? '', $r['amount'] ?? '',
            $r['txnid'] ?? '', $r['key'] ?? ''];
    $str = implode('|', $seq);
    if (!empty($r['additionalCharges'])) $str = $r['additionalCharges'] . '|' . $str;
    return strtolower(hash('sha512', $str));
}

/** PayU rejects pipes and some symbols in text fields. */
function clean(string $s, int $max): string {
    $s = preg_replace('/[^\p{L}\p{N} .,&()\'-]/u', '', $s);
    return mb_substr(trim(preg_replace('/\s+/', ' ', $s)), 0, $max);
}

/** Transaction log (CSV) kept outside public_html when possible. */
function log_dir(): string {
    $docRoot = rtrim($_SERVER['DOCUMENT_ROOT'] ?? dirname(__DIR__, 2), '/');
    $outside = dirname($docRoot) . '/payu-logs';
    if (is_dir($outside) || @mkdir($outside, 0750, true)) return $outside;
    $inside = __DIR__ . '/data';
    if (!is_dir($inside)) @mkdir($inside, 0750, true);
    return $inside;
}

function payu_log(array $row): void {
    $file = log_dir() . '/transactions.csv';
    $new = !is_file($file);
    $fh = @fopen($file, 'a');
    if (!$fh) return;
    flock($fh, LOCK_EX);
    if ($new) fputcsv($fh, ['time', 'event', 'txnid', 'status', 'amount', 'trip', 'date', 'people', 'plan', 'name', 'email', 'phone', 'payu_id', 'note'], ',', '"', '');
    fputcsv($fh, array_map(fn($k) => $row[$k] ?? '', ['time', 'event', 'txnid', 'status', 'amount', 'trip', 'date', 'people', 'plan', 'name', 'email', 'phone', 'payu_id', 'note']), ',', '"', '');
    flock($fh, LOCK_UN);
    fclose($fh);
}

function already_logged(string $txnid, string $event): bool {
    $file = log_dir() . '/transactions.csv';
    if (!is_file($file)) return false;
    $needle = ',' . $event . ',' . $txnid . ',';
    return str_contains((string) file_get_contents($file), $needle);
}

function e(string $s): string { return htmlspecialchars($s, ENT_QUOTES, 'UTF-8'); }

/** Small branded page used for redirects and errors. */
function page(string $title, string $body, int $code = 200): never {
    http_response_code($code);
    header('Content-Type: text/html; charset=utf-8');
    header('X-Robots-Tag: noindex');
    echo '<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">'
        . '<meta name="robots" content="noindex"><title>' . e($title) . ' | Go Everywhere Trips</title>'
        . '<style>body{margin:0;font-family:Inter,system-ui,sans-serif;background:#F0F9FF;color:#0f172a;display:flex;min-height:100vh;align-items:center;justify-content:center;padding:16px}'
        . '.c{background:#fff;border-radius:16px;box-shadow:0 8px 40px rgba(14,165,233,.15);padding:32px;max-width:440px;width:100%;text-align:center}'
        . 'h1{color:#0C4A6E;font-size:22px;margin:12px 0 8px}p{color:#475569;line-height:1.6}a.b,button{display:inline-block;margin-top:16px;background:#0EA5E9;color:#fff;border:0;border-radius:999px;padding:12px 24px;font-weight:700;font-size:15px;text-decoration:none;cursor:pointer}'
        . '.s{width:36px;height:36px;border:4px solid #E0F2FE;border-top-color:#0EA5E9;border-radius:50%;animation:r 1s linear infinite;margin:0 auto}@keyframes r{to{transform:rotate(360deg)}}</style></head>'
        . '<body><div class="c">' . $body . '</div></body></html>';
    exit;
}

function fail_page(string $msg): never {
    page('Payment problem', '<div style="font-size:40px">⚠️</div><h1>We couldn\'t start your payment</h1><p>' . e($msg) . '</p>'
        . '<a class="b" href="javascript:history.back()">Go back</a> '
        . '<a class="b" style="background:#22c55e" href="https://wa.me/919410776387?text=' . rawurlencode('Hi! I had trouble paying online.') . '">WhatsApp us</a>', 400);
}
