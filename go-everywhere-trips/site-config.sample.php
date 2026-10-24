<?php
// Server settings for Go Everywhere Trips (enquiry emails + PayU payments).
//
// HOW TO USE (Hostinger):
//   1. Copy this file and name the copy  site-config.php  (or use the one already prepared for you)
//   2. Fill in the values below.
//   3. Upload it with File Manager to the folder ABOVE public_html,
//      e.g. /home/u123456789/domains/yourdomain.com/site-config.php
//      — never inside public_html, and never commit real keys to git.
return [
    // Every website enquiry (contact form, custom trip, popup) and every paid booking is emailed here.
    'notify_email' => '',

    // Optional — e.g. https://www.yourdomain.com (auto-detected if empty)
    'site_url' => '',

    // Admin panel login (yourdomain.com/admin/login)
    'admin_email'    => 'you@example.com',
    'admin_password' => 'choose-a-long-password',

    'payu' => [
        'mode' => 'test',               // 'test' while testing, 'live' to take real payments
        'test' => ['key' => 'YOUR_TEST_KEY', 'salt' => 'YOUR_TEST_SALT'],
        'live' => ['key' => 'YOUR_LIVE_KEY', 'salt' => 'YOUR_LIVE_SALT'],
        'advance_percent' => 30,        // keep in sync with ADVANCE_PERCENT in src/site.config.js
    ],
];
