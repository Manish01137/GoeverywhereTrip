<?php
// Admin API — session login, publishing site content, and reading enquiries/payments.
// Credentials live in site-config.php (outside public_html): admin_email + admin_password.
require __DIR__ . '/payu/lib.php';

header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');
header('X-Robots-Tag: noindex');

function reply(int $code, array $body): never { http_response_code($code); echo json_encode($body, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES); exit; }
function body(): array { $b = json_decode((string) file_get_contents('php://input'), true); return is_array($b) ? $b : []; }

$https = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') || (($_SERVER['HTTP_X_FORWARDED_PROTO'] ?? '') === 'https');
session_name('GETADMIN');
session_set_cookie_params(['lifetime' => 0, 'path' => '/api/', 'secure' => $https, 'httponly' => true, 'samesite' => 'Strict']);
session_start();

$cfg = site_config();
$action = $_GET['action'] ?? '';
$method = $_SERVER['REQUEST_METHOD'];
$authed = !empty($_SESSION['admin']) && ($_SESSION['exp'] ?? 0) > time();
if ($authed) $_SESSION['exp'] = time() + 8 * 3600; // sliding 8-hour session

function require_auth(bool $authed): void {
    if (!$authed) reply(401, ['ok' => false, 'error' => 'Please log in again']);
    // CSRF: state-changing calls must echo the token we issued at login.
    if ($_SERVER['REQUEST_METHOD'] === 'POST' && !hash_equals($_SESSION['csrf'] ?? '', $_SERVER['HTTP_X_CSRF'] ?? '')) {
        reply(403, ['ok' => false, 'error' => 'Session expired — please refresh']);
    }
}

switch ($action) {
    case 'me':
        reply(200, ['ok' => true, 'admin' => $authed, 'csrf' => $authed ? $_SESSION['csrf'] : null,
                    'configured' => !empty($cfg['admin_email']) && !empty($cfg['admin_password']),
                    'email' => $authed ? ($cfg['admin_email'] ?? '') : null]);

    case 'login':
        if ($method !== 'POST') reply(405, ['ok' => false]);
        if (empty($cfg['admin_email']) || empty($cfg['admin_password'])) reply(503, ['ok' => false, 'error' => 'Admin login is not set up — add admin_email and admin_password to site-config.php']);
        // Brute-force guard: 8 failed attempts per IP per 15 minutes.
        $rate = log_dir() . '/.login-' . md5($_SERVER['REMOTE_ADDR'] ?? '');
        $fails = array_filter(array_map('intval', @file($rate, FILE_IGNORE_NEW_LINES) ?: []), fn($t) => $t > time() - 900);
        if (count($fails) >= 8) reply(429, ['ok' => false, 'error' => 'Too many attempts — try again in 15 minutes']);
        $b = body();
        $emailOk = hash_equals(strtolower(trim($cfg['admin_email'])), strtolower(trim((string) ($b['email'] ?? ''))));
        $pw = (string) ($b['password'] ?? '');
        $pwOk = str_starts_with($cfg['admin_password'], '$2y$') ? password_verify($pw, $cfg['admin_password']) : hash_equals((string) $cfg['admin_password'], $pw);
        if (!$emailOk || !$pwOk) {
            $fails[] = time(); @file_put_contents($rate, implode("\n", $fails));
            usleep(400000);
            reply(401, ['ok' => false, 'error' => 'Incorrect email or password']);
        }
        @unlink($rate);
        session_regenerate_id(true);
        $_SESSION['admin'] = true;
        $_SESSION['exp'] = time() + 8 * 3600;
        $_SESSION['csrf'] = bin2hex(random_bytes(24));
        reply(200, ['ok' => true, 'csrf' => $_SESSION['csrf'], 'email' => $cfg['admin_email']]);

    case 'logout':
        $_SESSION = [];
        session_destroy();
        reply(200, ['ok' => true]);

    case 'save':
        require_auth($authed);
        $raw = (string) file_get_contents('php://input');
        if (strlen($raw) > 5_000_000) reply(413, ['ok' => false, 'error' => 'Content too large']);
        $in = json_decode($raw, true);
        if (!is_array($in) || !is_array($in['trips'] ?? null) || !is_array($in['blogs'] ?? null)) reply(422, ['ok' => false, 'error' => 'Invalid content']);
        $slugs = [];
        foreach ($in['trips'] as $t) {
            $slug = (string) ($t['slug'] ?? '');
            if (!preg_match('/^[a-z0-9-]{2,120}$/', $slug)) reply(422, ['ok' => false, 'error' => "Invalid trip URL: $slug"]);
            if (isset($slugs[$slug])) reply(422, ['ok' => false, 'error' => "Two trips share the URL: $slug"]);
            if (!is_numeric($t['price'] ?? null) || $t['price'] < 0) reply(422, ['ok' => false, 'error' => 'Invalid price for ' . ($t['name'] ?? $slug)]);
            $slugs[$slug] = true;
        }
        $content = ['version' => time(), 'savedAt' => date('c'),
                    'trips' => $in['trips'], 'blogs' => $in['blogs'],
                    'reviews' => is_array($in['reviews'] ?? null) ? $in['reviews'] : [],
                    'settings' => is_array($in['settings'] ?? null) ? $in['settings'] : new stdClass()];
        $dir = data_dir();
        $file = "$dir/content.json";
        // Keep the last 30 versions so a mistake can always be undone.
        if (is_file($file)) {
            @mkdir("$dir/backups", 0750, true);
            @copy($file, "$dir/backups/content-" . date('Ymd-His') . '.json');
            $old = glob("$dir/backups/content-*.json") ?: [];
            sort($old);
            foreach (array_slice($old, 0, max(0, count($old) - 30)) as $f) @unlink($f);
        }
        $tmp = "$file.tmp";
        if (file_put_contents($tmp, json_encode($content, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_PRETTY_PRINT)) === false || !rename($tmp, $file)) {
            reply(500, ['ok' => false, 'error' => 'Could not save on the server (folder permissions?)']);
        }
        reply(200, ['ok' => true, 'version' => $content['version'], 'savedAt' => $content['savedAt']]);

    case 'backups':
        require_auth($authed);
        $files = glob(data_dir() . '/backups/content-*.json') ?: [];
        rsort($files);
        reply(200, ['ok' => true, 'backups' => array_map(fn($f) => ['id' => basename($f, '.json'), 'size' => filesize($f)], array_slice($files, 0, 30))]);

    case 'restore':
        require_auth($authed);
        $id = preg_replace('/[^a-z0-9-]/', '', (string) (body()['id'] ?? ''));
        $src = data_dir() . "/backups/$id.json";
        if (!$id || !is_file($src)) reply(404, ['ok' => false, 'error' => 'Backup not found']);
        copy(data_dir() . '/content.json', data_dir() . '/backups/content-' . date('Ymd-His') . '-before-restore.json');
        copy($src, data_dir() . '/content.json');
        reply(200, ['ok' => true]);

    case 'leads':
        require_auth($authed);
        $statuses = json_decode((string) @file_get_contents(data_dir() . '/lead-status.json'), true) ?: [];
        $read = function (string $name) {
            $file = log_dir() . "/$name";
            if (!is_file($file) || !($fh = fopen($file, 'r'))) return [];
            $head = fgetcsv($fh, null, ',', '"', '');
            $rows = [];
            while (($r = fgetcsv($fh, null, ',', '"', '')) !== false) if ($head && count($r) === count($head)) $rows[] = array_combine($head, $r);
            fclose($fh);
            return array_reverse($rows);
        };
        $leads = array_map(function ($l) use ($statuses) {
            $l['id'] = substr(md5(($l['time'] ?? '') . ($l['phone'] ?? '') . ($l['name'] ?? '')), 0, 16);
            $l['status'] = $statuses[$l['id']] ?? 'New';
            unset($l['ip']);
            return $l;
        }, $read('leads.csv'));
        $clicks = $read('clicks.csv');
        // One row per checkout attempt (txnid), showing its final result:
        // success > failed > initiated ("filled in details but didn't finish paying").
        $rank = ['initiated' => 1, 'failed' => 2, 'success' => 3];
        $byTxn = [];
        foreach (array_reverse($read('payments.csv')) as $p) { // oldest first, so details from "initiated" are kept
            $id = $p['txnid'] ?? '';
            $ev = $p['event'] ?? '';
            if (!$id || !isset($rank[$ev])) continue;
            $cur = $byTxn[$id] ?? null;
            if (!$cur) { $byTxn[$id] = $p; continue; }
            $merged = array_merge($cur, array_filter($p, fn($v) => $v !== ''));
            if ($rank[$ev] < $rank[$cur['event']]) { $merged['event'] = $cur['event']; $merged['status'] = $cur['status']; }
            $merged['started'] = $cur['started'] ?? $cur['time'];
            $byTxn[$id] = $merged;
        }
        $payments = array_values(array_reverse($byTxn));
        reply(200, ['ok' => true, 'leads' => $leads, 'clicks' => array_slice($clicks, 0, 500), 'payments' => $payments]);

    case 'lead-status':
        require_auth($authed);
        $b = body();
        $id = preg_replace('/[^a-f0-9]/', '', (string) ($b['id'] ?? ''));
        $status = in_array($b['status'] ?? '', ['New', 'Contacted', 'Converted', 'Closed'], true) ? $b['status'] : null;
        if (!$id || !$status) reply(422, ['ok' => false]);
        $file = data_dir() . '/lead-status.json';
        $all = json_decode((string) @file_get_contents($file), true) ?: [];
        $all[$id] = $status;
        file_put_contents($file, json_encode($all));
        reply(200, ['ok' => true]);

    default:
        reply(404, ['ok' => false, 'error' => 'Unknown action']);
}
