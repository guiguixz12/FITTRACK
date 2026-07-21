/* FitTracker Service Worker */
const CACHE  = 'fittracker-v1';
const STATIC = [
  '/',
  '/app.html',
  '/login.html',
  '/css/style.css',
  '/js/api.js',
  '/js/app.js',
  '/js/dashboard.js',
  '/js/diet.js',
  '/js/workouts.js',
  '/js/evolution.js',
  '/js/photos.js',
  '/js/progress.js',
  '/js/settings.js',
  '/js/scanner.js',
  '/js/plans.js',
  '/manifest.json',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
  '/icons/apple-touch-icon.png',
];

// Install: pre-cache static assets
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE)
      .then(c => c.addAll(STATIC))
      .then(() => self.skipWaiting())
  );
});

// Activate: delete old caches
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys.filter(k => k !== CACHE).map(k => caches.delete(k))
      ))
      .then(() => self.clients.claim())
  );
});

// Fetch strategy:
// - API calls → network-first (always fresh data)
// - /uploads/ photos → cache-first
// - Everything else → cache-first, network fallback
self.addEventListener('fetch', e => {
  const { url, method } = e.request;
  if (method !== 'GET') return;

  // API → always network, no cache
  if (url.includes('/api/')) {
    e.respondWith(fetch(e.request));
    return;
  }

  // Fonts & CDN → network-first, cache on success
  if (url.includes('fonts.googleapis') || url.includes('cdn.jsdelivr') || url.includes('unpkg.com')) {
    e.respondWith(
      caches.open(CACHE).then(c =>
        fetch(e.request)
          .then(r => { c.put(e.request, r.clone()); return r; })
          .catch(() => c.match(e.request))
      )
    );
    return;
  }

  // Static assets + photos → cache-first
  e.respondWith(
    caches.match(e.request).then(cached => {
      if (cached) return cached;
      return fetch(e.request).then(r => {
        if (r.ok) {
          caches.open(CACHE).then(c => c.put(e.request, r.clone()));
        }
        return r;
      });
    })
  );
});
