// Central image library. Swapped from the original brief:
//  - 404s on Unsplash: spiti, kedarnath, trip2, blog1
//  - wrong subject: manali (a man with a tool), rajasthan (Taj Mahal, which is in Agra),
//    rishikesh (empty blue sky), blog4 (US desert road on a Harshil article)
const u = (id, w) => `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}&q=80`

export const IMAGES = {
  // Heroes
  heroMain:     u('1506905925346-21bda4d32df4', 1600),
  heroAlt:      u('1501854140801-50d01698950b', 1600),

  // Categories
  groupTours:   u('1527631746610-bca00a040d60', 800),
  treks:        u('1464822759023-fed622ff2c3b', 800),
  customTrips:  u('1476514525535-07fb3b4ae5f1', 800),
  spiritual:    u('1605649487212-47bdab064df7', 800),
  weekend:      u('1504280390367-361c6d9f38f4', 800),
  corporate:    u('1522202176988-66273c2fd55f', 800),

  // Destinations
  uttarakhand:  u('1597655601841-214a4cfe8b2c', 600),
  himachal:     u('1570641963303-92ce4845ed4c', 600),
  rajasthan:    u('1477587458883-47145ed94245', 600),
  jaipurFort:   u('1599661046289-e31897846e41', 600),
  hawaMahal:    u('1603262110263-fb0112e7cc33', 600),
  spiti:        u('1544735716-392fe2489ffa', 600),
  manali:       u('1626621331169-5f34be280ed9', 600),
  kasolRiver:   u('1581791534721-e599df4417f7', 600),
  harshil:      u('1626621341517-bbf3d9990a23', 600),
  andaman:      u('1507525428034-b723cf961d3e', 600),
  rishikesh:    u('1581791534721-e599df4417f7', 600),
  kedarnath:    u('1519904981063-b0cf448d479e', 600),
  chopta:       u('1434394354979-a235cd36269d', 600),

  // Trip cards
  trip1:        u('1551632811-561732d1e306', 600),
  trip2:        u('1486911278844-a81c5267e227', 600),
  trip3:        u('1434394354979-a235cd36269d', 600),
  trip4:        u('1478827536114-da961b7f86d2', 600),
  trip5:        u('1469474968028-56623f02e42e', 600),
  trip6:        u('1506197603052-3cc9c3a201bd', 600),

  // Trip detail gallery
  detailHero:   u('1626621341517-bbf3d9990a23', 1200),
  detailThumb1: u('1464822759023-fed622ff2c3b', 400),
  detailThumb2: u('1506197603052-3cc9c3a201bd', 400),
  detailThumb3: u('1478827536114-da961b7f86d2', 400),
  detailThumb4: u('1469474968028-56623f02e42e', 400),
  detailExtra1: u('1483728642387-6c3bdd6c93e5', 1200),
  detailExtra2: u('1470071459604-3b5ec3a7fe05', 1200),

  // Blogs
  blog1:        u('1454496522488-7a8e488e8606', 700),
  blog2:        u('1488646953014-85cb44e25828', 700),
  blog3:        u('1464822759023-fed622ff2c3b', 700),
  blog4:        u('1470071459604-3b5ec3a7fe05', 700),

  // Instagram grid
  ig1: u('1508739773434-c26b3d09e071', 400),
  ig2: u('1455156218388-5e61b526818b', 400),
  ig3: u('1526772662000-3f88f10405ff', 400),
  ig4: u('1500534314209-a25ddb2bd429', 400),
  ig5: u('1551918120-9739cb430c6d', 400),
  ig6: u('1519681393784-d120267933ba', 400),

  // About
  aboutHero:    u('1539635278303-d4002c07eae3', 1200),
  team1:        u('1508739773434-c26b3d09e071', 300),
  team2:        u('1500534314209-a25ddb2bd429', 300),
  team3:        u('1526772662000-3f88f10405ff', 300),
  team4:        u('1455156218388-5e61b526818b', 300),
}

// ── Google Drive links ──────────────────────────────────────────────────────────
// Admins paste normal share links (https://drive.google.com/file/d/<ID>/view?usp=sharing).
// The file must be shared as "Anyone with the link".
const DRIVE_ID = /(?:drive\.google\.com\/(?:file\/d\/|open\?id=|uc\?(?:export=\w+&)?id=|thumbnail\?id=)|docs\.google\.com\/(?:uc\?(?:export=\w+&)?id=|file\/d\/))([\w-]{20,})/
export const driveId = (url = '') => (String(url).match(DRIVE_ID) || [])[1] || null
export const isDriveFolder = (url = '') => /drive\.google\.com\/drive\/(u\/\d\/)?folders\//.test(url)
/** Direct image URL for a Drive file (served by Google's image CDN). */
export const driveImage = (url, w = 1600) => {
  const id = driveId(url)
  return id ? `https://lh3.googleusercontent.com/d/${id}=w${w}` : url
}
/** Viewer / download links for a Drive file such as a PDF brochure. */
export const driveView = (url) => (driveId(url) ? `https://drive.google.com/file/d/${driveId(url)}/view` : url)
export const driveDownload = (url) => (driveId(url) ? `https://drive.google.com/uc?export=download&id=${driveId(url)}` : url)

// Resolve an IMAGES key, a Google Drive link or any image URL.
export const img = (keyOrUrl) => IMAGES[keyOrUrl] || driveImage(keyOrUrl) || IMAGES.heroAlt

// Request a larger version for big placements (gallery, lightbox) — Unsplash (?w=) and Drive (=w).
export const large = (url, w = 1400) => url.replace(/([?&]w=)\d+/, `$1${w}`).replace(/=w\d+$/, `=w${w}`)
