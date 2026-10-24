<?php
// Receives enquiries from the website (contact form, custom-trip planner, welcome popup),
// emails them to `notify_email` from site-config.php and appends them to site-logs/leads.csv.
require __DIR__ . '/payu/lib.php';

header('Content-Type: application/json; charset=utf-8');
header('X-Robots-Tag: noindex');
function out(int $code, array $body): never { http_response_code($code); echo json_encode($body); exit; }

if ($_SERVER['REQUEST_METHOD'] !== 'POST') out(405, ['ok' => false, 'error' => 'POST only']);

$in = json_decode((string) file_get_contents('php://input'), true);
if (!is_array($in)) $in = $_POST;

// Bots fill every field; humans never see this one.
if (!empty($in['website'])) out(200, ['ok' => true]);

// WhatsApp button clicks: lightweight analytics row, no email.
if (($in['source'] ?? '') === 'whatsapp') {
    $rateFile = log_dir() . '/.clk-' . md5($_SERVER['REMOTE_ADDR'] ?? '');
    $hits = array_filter(array_map('intval', @file($rateFile, FILE_IGNORE_NEW_LINES) ?: []), fn($t) => $t > time() - 600);
    if (count($hits) >= 30) out(200, ['ok' => true]);
    $hits[] = time(); @file_put_contents($rateFile, implode("\n", $hits));
    $file = log_dir() . '/clicks.csv';
    $new = !is_file($file);
    if ($fh = @fopen($file, 'a')) {
        flock($fh, LOCK_EX);
        if ($new) fputcsv($fh, ['time', 'button', 'page'], ',', '"', '');
        fputcsv($fh, [date('c'), mb_substr(strip_tags((string) ($in['enquiry'] ?? '')), 0, 200), mb_substr(strip_tags((string) ($in['page'] ?? '')), 0, 200)], ',', '"', '');
        flock($fh, LOCK_UN); fclose($fh);
    }
    out(200, ['ok' => true]);
}

$field = fn(string $k, int $max = 200) => mb_substr(trim(strip_tags((string) ($in[$k] ?? ''))), 0, $max);
$lead = [
    'time'    => date('c'),
    'source'  => in_array($in['source'] ?? '', ['contact', 'custom', 'popup'], true) ? $in['source'] : 'other',
    'name'    => $field('name', 80),
    'phone'   => preg_replace('/[^\d+ ]/', '', $field('phone', 20)),
    'email'   => $field('email', 120),
    'enquiry' => $field('enquiry', 1500),
    'page'    => $field('page', 200),
    'ip'      => $_SERVER['REMOTE_ADDR'] ?? '',
];

$digits = preg_replace('/\D/', '', $lead['phone']);
if (mb_strlen($lead['name']) < 2) out(422, ['ok' => false, 'error' => 'Please enter your name']);
if (strlen($digits) < 10 && !filter_var($lead['email'], FILTER_VALIDATE_EMAIL)) out(422, ['ok' => false, 'error' => 'Please enter a valid phone number or email']);

// Simple per-IP rate limit: 5 submissions per 10 minutes.
$rateFile = log_dir() . '/.rate-' . md5($lead['ip']);
$hits = array_filter(array_map('intval', @file($rateFile, FILE_IGNORE_NEW_LINES) ?: []), fn($t) => $t > time() - 600);
if (count($hits) >= 5) out(429, ['ok' => false, 'error' => 'Too many requests — please WhatsApp us instead']);
$hits[] = time();
@file_put_contents($rateFile, implode("\n", $hits));

// Save
$file = log_dir() . '/leads.csv';
$new = !is_file($file);
if ($fh = @fopen($file, 'a')) {
    flock($fh, LOCK_EX);
    if ($new) fputcsv($fh, array_keys($lead), ',', '"', '');
    fputcsv($fh, array_values($lead), ',', '"', '');
    flock($fh, LOCK_UN);
    fclose($fh);
}

// Notify
$to = site_config()['notify_email'] ?? '';
$mailed = false;
if ($to) {
    $label = ['contact' => 'Contact form', 'custom' => 'Custom trip request', 'popup' => 'Website popup', 'other' => 'Website'][$lead['source']];
    $host = preg_replace('/^www\./', '', parse_url('http://' . ($_SERVER['HTTP_HOST'] ?? 'localhost'), PHP_URL_HOST));
    $wa = $digits ? 'https://wa.me/' . (strlen($digits) === 10 ? '91' . $digits : $digits) : '';
    $body = "New enquiry from the website ($label)\n\n"
        . "Name:    {$lead['name']}\nPhone:   {$lead['phone']}\nEmail:   {$lead['email']}\n\n"
        . "{$lead['enquiry']}\n\n" . ($wa ? "Reply on WhatsApp: $wa\n" : '') . "Page: {$lead['page']}\nTime: {$lead['time']}\n";
    $headers = "From: Go Everywhere Trips <no-reply@$host>\r\nContent-Type: text/plain; charset=utf-8"
        . (filter_var($lead['email'], FILTER_VALIDATE_EMAIL) ? "\r\nReply-To: {$lead['email']}" : '');
    $mailed = @mail($to, "New enquiry: {$lead['name']} ($label)", $body, $headers);
}

out(200, ['ok' => true, 'emailed' => $mailed]);
