# Go Everywhere Trips

Travel website for Go Everywhere Trips, Dehradun. Built with React 18, Vite, Tailwind CSS v3, Framer Motion and React Router v6.

## Run it

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # output goes to dist/
```

## Admin panel

Go to `yourdomain.com/admin/login`. The email and password are in `site-config.php` (`admin_email`, `admin_password`), and you can change them by editing that file on the server.

Everything you change in the admin panel is saved on the server and goes **live for all visitors** within about a second. The top bar shows "Live on website" when the save is done.
- **Trips:** the full package editor. It has basics, photos, a brochure PDF and an optional YouTube video (all from Google Drive links), a day-by-day itinerary, inclusions and exclusions, stays, FAQs, and departure dates with seats. New trips start as **Draft**; switch them to "Live on website" when they're ready. Use Duplicate to start a new package from an existing one.
- **Google Drive links:** share the *file* as "Anyone with the link", then paste the link. Folder links don't work, and the editor warns you if you paste one.
- **Leads:** shows real enquiries from the custom-trip form, the popup and the contact form, plus payments and WhatsApp clicks. Statuses are saved, and you can export to CSV.
- **Settings → Version history:** every save keeps the previous version (the last 30). Restore one if something goes wrong.

Checkout always charges the price saved in the admin panel. Content lives in `site-data/content.json`, next to `site-config.php` and outside the website folder.

## Content

- Built-in content is in `src/data/`. After the first save from the admin panel, the server copy is used instead. `npm run zip` downloads it from `SITE_URL` first (`scripts/sync-content.mjs`), so Google's pre-built pages and the sitemap match what you set in admin.
- Logo files are in `public/brand/`.
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

## Server settings: `site-config.php` (do this once)

Enquiry emails and PayU payments need one private settings file, `site-config.php`. A ready-to-use copy with your PayU test and live keys is in the project folder. Git ignores it, so it is never committed, and it is never part of the upload zip.

1. Open `site-config.php` and set `notify_email` to the inbox that should receive enquiries and booking alerts.
2. In File Manager, upload it to the folder **above** `public_html`, for example `/home/u123456789/domains/yourdomain.com/site-config.php`. It must not go inside `public_html`. Deploys never touch it.
3. Make a test booking. `'mode' => 'test'` uses PayU's test keys, so no real money moves.
4. When you're happy, edit that file on the server and change `'mode'` to `'live'`. Payments are then real.
5. Recommended: in the PayU dashboard set a **Webhook** to `https://yourdomain.com/api/payu/response.php?webhook=1`. Then a payment is still recorded if the customer closes the tab before getting back to your site.

`site-config.sample.php` is a blank template if you ever need to start over.

## Enquiries (contact form, custom trip, welcome popup)

All three forms post to `public/api/lead.php`, which:
- emails each enquiry to `notify_email`; replying to the email replies to the customer, and the email includes a one-tap WhatsApp link
- appends it to `site-logs/leads.csv`, next to `site-config.php` and outside the website, which you can open in Excel or Google Sheets
- blocks bots with a hidden honeypot field and limits each visitor to 5 submissions in 10 minutes

If you don't receive the emails, check spam first. For the best delivery, create a mailbox for your domain in hPanel → Emails.

The welcome popup is controlled from **Admin → Popup**:
- turn it on or off, and set the delay in seconds
- how often: **every visit** (the default, so returning visitors see it again on every new visit) or at most once every N days; optionally stop showing it to people who already submitted
- all the text, the side photo (Drive link) and the bullet points
- which questions to ask: your own destination list, or **upcoming departures** pulled automatically from Admin → Departures; month; number of travellers
- pages where it shouldn't appear (admin and payment pages are always excluded)
- **Preview** shows exactly what visitors will see, without sending anything

It shows once per visit, so it doesn't pop up again on every page during the same visit.

## PayU payments

"Book Now" on a trip opens a checkout. The customer picks the 30% advance or the full amount, then pays on PayU's secure page (UPI, cards, net banking, wallets, EMI).

`public/api/payu/pay.php` takes the price from `catalog.json`, which is generated from `src/data/trips.js` at build time, so the browser can never change the amount. It signs the request with your salt and sends the customer to PayU. `response.php` checks PayU's signature on the result, logs it to `site-logs/payments.csv`, emails you, and shows the success or failure page. The PayU dashboard has the full record of every payment.

Local testing: run `npm run php` (PHP on port 8000) together with `npm run dev`. The `site-config.php` in the project root is used automatically.

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
