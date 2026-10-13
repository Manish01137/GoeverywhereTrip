<?php
// PayU settings for Go Everywhere Trips.
//
// HOW TO USE (Hostinger):
//   1. Copy this file and name the copy  payu-config.php
//   2. Fill in your Merchant Key and Salt from the PayU dashboard
//      (Developer → API Keys). Use the TEST key/salt while testing.
//   3. Upload it with File Manager to the folder ABOVE public_html,
//      e.g. /home/u123456789/domains/yourdomain.com/payu-config.php
//      — never inside public_html, and never commit real keys to git.
return [
    'mode'            => 'test',      // 'test' while testing, 'live' to take real payments
    'key'             => 'YOUR_MERCHANT_KEY',
    'salt'            => 'YOUR_MERCHANT_SALT',  // Salt v1 (the 32-char "salt" in the dashboard)
    'advance_percent' => 30,          // keep in sync with ADVANCE_PERCENT in src/site.config.js
    'notify_email'    => '',          // e.g. bookings@yourdomain.com — gets an email for every paid booking
    'site_url'        => '',          // optional, e.g. https://www.yourdomain.com (auto-detected if empty)
];
