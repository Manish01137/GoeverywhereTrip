// Site-wide settings used by the app AND the build scripts (sitemap, prerender, PayU catalog).
// ⚠️ Set SITE_URL to your real domain before building for production (no trailing slash).
export const SITE_URL = 'https://www.goeverywheretrips.com'

export const SITE_NAME = 'Go Everywhere Trips'

// Share of the trip price charged when a customer picks "Pay advance".
// Must match `advance_percent` in payu-config.php on the server.
export const ADVANCE_PERCENT = 30
