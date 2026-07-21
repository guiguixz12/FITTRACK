/* FitTracker Service Worker */
const CACHE  = 'fittracker-v5';
const STATIC = [
  '/icons/icon-192.png',
  '/icons/icon-512.png',
  '/icons/apple-touch-icon.png',
];

// Install: pre-cache only icons (JS/CSS/HTML are network-first)
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
// - API calls → network only (never cache)
// - JS / CSS / HTML → network-first, cache fallback (always fresh on update)
// - Icons / uploads → cache-first
self.addEventListener('fetch', e => {
  const { url, method } = e.request;
  if (method !== 'GET') return;

  // API → never cache
  if (url.includes('/api/')) {
    e.respondWith(fetch(e.request));
    return;
  }

  // Fonts & CDN → network-first, cache on success
  if (url.includes('fonts.googleapis') || url.includes('cdn.jsdelivr') || url.includes('unpkg.com')) {
    e.respondWith(
      fetch(e.request)
        .then(r => {
          caches.open(CACHE).then(c => c.put(e.request, r.clone()));
          return r;
        })
        .catch(() => caches.match(e.request))
    );
    return;
  }

  // JS / CSS / HTML → network-first so deploys always take effect
  if (url.match(/\.(js|css|html)$/) || url.endsWith('/app') || url.endsWith('/login')) {
    e.respondWith(
      fetch(e.request)
        .then(r => {
          if (r.ok) caches.open(CACHE).then(c => c.put(e.request, r.clone()));
          return r;
        })
        .catch(() => caches.match(e.request))
    );
    return;
  }

  // Icons & uploads → cache-first
  e.respondWith(
    caches.match(e.request).then(cached => {
      if (cached) return cached;
      return fetch(e.request).then(r => {
        if (r.ok) caches.open(CACHE).then(c => c.put(e.request, r.clone()));
        return r;
      });
    })
  );
});
