<?php
// PayU posts the result here (surl/furl). We verify PayU's signature before trusting anything,
// log it, email the team on success, then send the customer to the success/failure page.
// Also usable as the PayU webhook URL: /api/payu/response.php?webhook=1
require __DIR__ . '/lib.php';

$webhook = isset($_GET['webhook']);
if ($_SERVER['REQUEST_METHOD'] !== 'POST') { header('Location: /', true, 303); exit; }

$cfg = payu_config();
$r = $_POST;
$txnid  = preg_replace('/[^A-Za-z0-9]/', '', (string) ($r['txnid'] ?? ''));
$status = strtolower((string) ($r['status'] ?? ''));

$valid = $cfg
    && hash_equals((string) $cfg['key'], (string) ($r['key'] ?? ''))
    && hash_equals(payu_response_hash($r, $cfg['salt']), strtolower((string) ($r['hash'] ?? '')));

$row = ['time' => date('c'), 'txnid' => $txnid, 'status' => $status, 'amount' => $r['amount'] ?? '',
        'trip' => $r['udf1'] ?? '', 'date' => $r['udf2'] ?? '', 'people' => $r['udf3'] ?? '', 'plan' => $r['udf4'] ?? '',
        'name' => $r['firstname'] ?? '', 'email' => $r['email'] ?? '', 'phone' => $r['phone'] ?? '',
        'payu_id' => $r['mihpayid'] ?? '', 'note' => $webhook ? 'webhook' : 'browser'];

if (!$valid) {
    payu_log($row + ['event' => 'rejected']);
    if ($webhook) { http_response_code(400); exit('invalid'); }
    header('Location: /payment/failed?reason=verification&txnid=' . rawurlencode($txnid), true, 303);
    exit;
}

$event = $status === 'success' ? 'success' : 'failed';
$first = !already_logged($txnid, $event); // browser redirect and webhook can both arrive
if ($first) payu_log($row + ['event' => $event]);

if ($event === 'success' && $first && !empty($cfg['notify_email'])) {
    $host = parse_url(site_base($cfg), PHP_URL_HOST);
    $body = "New paid booking 🎉\n\n"
        . "Trip: {$r['productinfo']} ({$r['udf1']})\nDeparture: {$r['udf2']}\nTravellers: {$r['udf3']}\n"
        . "Paid: ₹{$r['amount']} ({$r['udf4']})\n\nName: {$r['firstname']}\nEmail: {$r['email']}\nPhone: " . ($r['phone'] ?? '') . "\n\n"
        . "Transaction: $txnid\nPayU ID: " . ($r['mihpayid'] ?? '') . "\n";
    @mail($cfg['notify_email'], "Paid booking: {$r['productinfo']} — ₹{$r['amount']}", $body,
        "From: Go Everywhere Trips <no-reply@$host>\r\nReply-To: {$r['email']}\r\nContent-Type: text/plain; charset=utf-8");
}

if ($webhook) { exit('OK'); }

$q = http_build_query(['txnid' => $txnid, 'amount' => $r['amount'] ?? '', 'trip' => $r['udf1'] ?? '',
                       'date' => $r['udf2'] ?? '', 'people' => $r['udf3'] ?? '', 'plan' => $r['udf4'] ?? '',
                       'reason' => $event === 'failed' ? $status : null]);
header('Location: /payment/' . ($event === 'success' ? 'success' : 'failed') . '?' . $q, true, 303);
