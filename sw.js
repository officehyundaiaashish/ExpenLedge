// ─── ExpenLedge Service Worker ───────────────────────────────────────────────
// Strategy: NETWORK FIRST for all app files.
// Every GitHub commit is served immediately — cache is only a fallback
// when the user is offline. Old caches are wiped on every SW update.
// ─────────────────────────────────────────────────────────────────────────────

const CACHE_VERSION = 'expenledge-v1';

// Files to pre-cache for offline fallback only
const PRECACHE_URLS = [
  './',
  './index.html',
  './app.js',
  './manifest.json',
  './icon.png'
];

// ── Install ───────────────────────────────────────────────────────────────────
self.addEventListener('install', event => {
  // Skip waiting so the new SW activates immediately on every deploy
  self.skipWaiting();

  event.waitUntil(
    caches.open(CACHE_VERSION).then(cache => {
      return Promise.allSettled(
        PRECACHE_URLS.map(url =>
          cache.add(url).catch(err => console.warn('[SW] Pre-cache failed:', url, err))
        )
      );
    })
  );
});

// ── Activate ──────────────────────────────────────────────────────────────────
self.addEventListener('activate', event => {
  // Delete ALL old caches — ensures no stale files survive a GitHub commit
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(key => key !== CACHE_VERSION)
          .map(key => {
            console.log('[SW] Deleting old cache:', key);
            return caches.delete(key);
          })
      )
    ).then(() => self.clients.claim())  // Take control of all open tabs immediately
  );
});

// ── Fetch ─────────────────────────────────────────────────────────────────────
self.addEventListener('fetch', event => {
  // Only handle GET requests
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);

  // Skip cross-origin requests (Google Fonts, CDN, etc.)
  if (url.origin !== location.origin) return;

  event.respondWith(networkFirst(event.request));
});

// Network First: always try network, update cache, fall back to cache if offline
async function networkFirst(request) {
  const cache = await caches.open(CACHE_VERSION);

  try {
    // Always fetch fresh from network
    const networkResponse = await fetch(request, {
      // Bypass browser HTTP cache to ensure we get the latest from GitHub Pages
      cache: 'no-store'
    });

    // Cache the fresh response for offline fallback
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone());
    }

    return networkResponse;
  } catch (err) {
    // Network failed — serve from cache (offline mode)
    console.log('[SW] Network failed, serving from cache:', request.url);
    const cached = await cache.match(request);
    if (cached) return cached;

    // Ultimate fallback: serve index.html for navigation requests
    if (request.mode === 'navigate') {
      const fallback = await cache.match('./index.html');
      if (fallback) return fallback;
    }

    return new Response('Offline - No cached version available', {
      status: 503,
      statusText: 'Service Unavailable'
    });
  }
}

// ── Message: force update check ───────────────────────────────────────────────
// Called from app when user returns to tab — checks for new SW version
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
