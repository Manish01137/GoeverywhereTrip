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

## Deploy

- **Vercel**: `vercel.json` rewrites every route to the SPA.
- **Netlify**: `public/_redirects` handles routing.
- **cPanel / Apache**: `public/.htaccess` handles routing. Upload the contents of `dist/`.
