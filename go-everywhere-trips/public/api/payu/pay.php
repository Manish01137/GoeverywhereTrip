<?php
// Starts a PayU payment: validates the booking, prices it from the server-side catalog,
// signs the request and auto-submits the customer to PayU's hosted checkout.
require __DIR__ . '/lib.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') { header('Location: /trips', true, 303); exit; }

$cfg = payu_config();
if (!$cfg) fail_page('Online payments are not set up yet. Please book on WhatsApp and we will share payment details.');

$catalog = payu_catalog();
$slug   = (string) ($_POST['trip'] ?? '');
$date   = (string) ($_POST['date'] ?? '');
$people = (int) ($_POST['people'] ?? 0);
$plan   = ($_POST['plan'] ?? '') === 'full' ? 'full' : 'advance';
$name   = clean((string) ($_POST['name'] ?? ''), 60);
$email  = trim((string) ($_POST['email'] ?? ''));
$phone  = preg_replace('/\D/', '', (string) ($_POST['phone'] ?? ''));
if (strlen($phone) === 12 && str_starts_with($phone, '91')) $phone = substr($phone, 2);

$trip = $catalog[$slug] ?? null;
if (!$trip) fail_page('That trip could not be found. Please refresh the page and try again.');
// Any real calendar date from tomorrow up to 18 months ahead: a group departure or the traveller's own start date.
$d = DateTime::createFromFormat('!Y-m-d', $date);
if (!$d || $d->format('Y-m-d') !== $date) fail_page('Please pick a start date on the calendar.');
if ($date <= date('Y-m-d') || $date > date('Y-m-d', strtotime('+18 months'))) fail_page('Please pick a start date between tomorrow and the next 18 months.');
$isDeparture = in_array($date, $trip['departures'], true);
if ($people < 1 || $people > 20) fail_page('Number of travellers must be between 1 and 20.');
if (mb_strlen($name) < 2) fail_page('Please enter your full name.');
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) fail_page('Please enter a valid email address.');
if (!preg_match('/^[6-9]\d{9}$/', $phone)) fail_page('Please enter a valid 10-digit Indian mobile number.');

// Room sharing: price per person comes from the server catalog, never from the browser.
$sharingNames = ['quad' => 'Quad sharing', 'triple' => 'Triple sharing', 'double' => 'Double sharing', 'single' => 'Single room'];
$sharing = (string) ($_POST['sharing'] ?? '');
$prices = $trip['sharing'] ?? ['quad' => $trip['price'], 'triple' => $trip['price'], 'double' => null, 'single' => null];
if (!isset($sharingNames[$sharing])) fail_page('Please choose a room sharing option.');
if (empty($prices[$sharing])) fail_page($sharingNames[$sharing] . ' is available on request — please message us on WhatsApp.');
$total  = $prices[$sharing] * $people;
$amount = $plan === 'full' ? $total : round($total * ((int) $cfg['advance_percent']) / 100); // whole rupees, same as the website
$amount = number_format($amount, 2, '.', '');

$base  = site_base($cfg);
$txnid = 'GET' . date('ymdHis') . strtoupper(bin2hex(random_bytes(3)));
$params = [
    'key'         => $cfg['key'],
    'txnid'       => $txnid,
    'amount'      => $amount,
    'productinfo' => clean($trip['name'], 100),
    'firstname'   => $name,
    'email'       => $email,
    'phone'       => $phone,
    'udf1'        => $slug,
    'udf2'        => $date,
    'udf3'        => (string) $people,
    'udf4'        => $plan . '-' . $sharing, // e.g. "advance-double"
    'udf5'        => $isDeparture ? 'group' : 'own-date',
    'surl'        => $base . '/api/payu/response.php',
    'furl'        => $base . '/api/payu/response.php',
];
$params['hash'] = payu_request_hash($params, $cfg['salt']);

payu_log(['time' => date('c'), 'event' => 'initiated', 'txnid' => $txnid, 'amount' => $amount, 'trip' => $slug,
          'date' => $date, 'people' => $people, 'plan' => $plan . '-' . $sharing, 'name' => $name, 'email' => $email, 'phone' => $phone,
          'note' => $isDeparture ? 'group departure' : 'own start date']);

$action = PAYU_URLS[$cfg['mode'] === 'live' ? 'live' : 'test'];
$fields = '';
foreach ($params as $k => $v) $fields .= '<input type="hidden" name="' . e($k) . '" value="' . e((string) $v) . '">';

page('Redirecting to PayU',
    '<div class="s"></div><h1>Taking you to secure payment…</h1>'
    . '<p>' . e($trip['name']) . '<br>₹' . e(number_format((float) $amount, 0)) . ($plan === 'advance' ? ' advance' : '') . '</p>'
    . '<form id="payu" method="post" action="' . e($action) . '">' . $fields
    . '<noscript><button type="submit">Continue to PayU</button></noscript></form>'
    . '<script>document.getElementById("payu").submit()</script>');
