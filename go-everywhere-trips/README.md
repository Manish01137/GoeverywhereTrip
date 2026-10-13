# Go Everywhere Trips

Travel website for Go Everywhere Trips, Dehradun. Built with React 18, Vite, Tailwind CSS v3, Framer Motion and React Router v6.

## Run it

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # output goes to dist/
```

## Admin panel

Go to `/admin/login`. The demo login is `admin@get.com` / `admin123`.

The admin panel is a demo CMS. Trips, departures, blogs, reviews, leads and settings are saved in the browser's localStorage, and the public site reads the same data. Because of that:

- Leads only show up in the browser that submitted them. To collect real enquiries, connect the forms to a backend or a form service (Formspree, Google Sheets, Supabase, etc.).
- Anyone who reads the JS bundle can see the demo password. Put real authentication in place before storing anything sensitive.

## Content

- Data files are in `src/data/` (`trips.js`, `destinations.js`, `reviews.js`, `blogs.js`, `images.js`).
- Photos come from Unsplash. `images.js` lists which URLs from the original brief were replaced and why.
- The team names and bios on the About page, the reviews, the office address and the email are sample content. Replace them with real details before launch.

## Before your first production build

Open `src/site.config.js` and set `SITE_URL` to your real domain, for example `https://www.yourdomain.com` (no trailing slash). The sitemap, the canonical links, the social-share previews and Google's structured data all use it.

## Deploy to Hostinger (shared hosting)

1. Run `npm run zip`. It builds the site, pre-renders every page for Google (takes about 2 minutes and uses your installed Chrome), and creates `hostinger-upload.zip`.
2. In hPanel, open **Files → File Manager** and go to `public_html`.
3. First deploy only: delete Hostinger's default `default.php` / `index.php` placeholder.
4. Upload `hostinger-upload.zip`, right-click it, choose **Extract**, and extract into `public_html` itself (not into a subfolder).
5. Delete the zip from `public_html`, then open your domain.

To update the site later: make your changes, run `npm run zip` again, then upload and extract it the same way, replacing existing files.

`.htaccess` (included in the zip) serves the pre-rendered pages, sends `/admin` and unknown URLs to the app, compresses files and makes sure visitors get the newest version after an update. If File Manager hides it, turn on **Show hidden files**.

HTTPS: turn on **Security → SSL** and **Force HTTPS** in hPanel.

## PayU payments

"Book Now" on a trip opens a checkout. The customer picks the 30% advance or the full amount, then pays on PayU's secure page (UPI, cards, net banking, wallets, EMI).

How it works: `public/api/payu/pay.php` takes the trip price from `catalog.json`, which is generated from `src/data/trips.js` at build time, so the browser can never change the amount. It signs the request with your secret salt and sends the customer to PayU. `response.php` checks PayU's signature on the result, logs it, emails you, and shows the success or failure page.

**One-time setup:**
1. Get your **Merchant Key** and **Salt** from the PayU dashboard (Developer → API Keys).
2. Copy `payu-config.sample.php`, rename the copy to `payu-config.php`, and fill in the key, salt and `notify_email`. Keep `'mode' => 'test'` at first.
3. In File Manager, upload `payu-config.php` to the folder **above** `public_html`, for example `/home/u123456789/domains/yourdomain.com/payu-config.php`. It must not go inside `public_html`. Deploys never touch it.
4. Make a test booking. PayU's test mode accepts test cards and UPI from the PayU docs.
5. When it works, change `'mode'` to `'live'` and use your live key and salt.
6. Recommended: in the PayU dashboard set a **Webhook** to `https://yourdomain.com/api/payu/response.php?webhook=1`. Then a payment is still recorded if the customer closes the tab before getting back to your site.

Payment records are saved to `payu-logs/transactions.csv`, next to `payu-config.php` (outside the website). The PayU dashboard has the full record of every payment.

Prices: the server charges what is in `src/data/trips.js`. If you change a price in the admin panel, update `trips.js` and redeploy, otherwise checkout charges the old price.

Local testing: `npm run php` (PHP on port 8000) together with `npm run dev`. Put a test `payu-config.php` in the project root; git ignores it.

## Getting found on Google

After the site is live:
1. **Google Search Console** (search.google.com/search-console): add your domain and verify it (hPanel → DNS → add the TXT record Google gives you). Then go to **Sitemaps** and submit `sitemap.xml`.
2. **Google Business Profile** (business.google.com): create the Go Everywhere Trips listing with the Dehradun address, phone, hours and photos. This is the biggest driver of local searches like "trek operator in Dehradun". Ask happy travellers to leave Google reviews there.
3. Test a trip page in Google's **Rich Results Test** (search.google.com/test/rich-results) to see the trip, breadcrumb and FAQ data.
4. Keep publishing blog posts. Every new trip or blog is added to the sitemap automatically on the next `npm run zip`.

## Other hosts

- **Vercel**: `vercel.json` rewrites every route to the SPA.
- **Netlify**: `public/_redirects` handles routing.
- **cPanel / Apache**: `public/.htaccess` handles routing. Upload the contents of `dist/`.
