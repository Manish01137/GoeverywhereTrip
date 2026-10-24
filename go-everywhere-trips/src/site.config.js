// Site-wide settings used by the app AND the build scripts (sitemap, prerender, PayU catalog).
// The one official address of the site (no trailing slash). www / .in visitors are redirected here (public/.htaccess).
export const SITE_URL = 'https://goeverywheretrips.com'

export const SITE_NAME = 'Go Everywhere Trips'

// Share of the trip price charged when a customer picks "Pay advance".
// Must match `advance_percent` in payu-config.php on the server.
export const ADVANCE_PERCENT = 30
