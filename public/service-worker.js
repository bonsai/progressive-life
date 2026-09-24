/**
 * progressive-life Service Worker
 * Privacy-first: no server storage, all data in IndexedDB
 * Offline-capable: caches shell + critical CDN assets
 */

const CACHE_NAME = 'plife-v1';
const STATIC_ASSETS = [
  '/app.html',
  '/lp.html',
  '/manifest.json',
  'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js',
];

// Install: cache shell
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(STATIC_ASSETS))
  );
  self.skipWaiting();
});

// Activate: clean old caches
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Fetch: cache-first for shell, network-first for API
self.addEventListener('fetch', (e) => {
  const { request } = e;
  const url = new URL(request.url);

  // API proxy: always network (keys are on server)
  if (url.pathname.startsWith('/api/proxy/')) {
    e.respondWith(fetch(request));
    return;
  }

  // Static assets: cache-first
  if (request.method === 'GET') {
    e.respondWith(
      caches.match(request).then(cached => {
        if (cached) return cached;
        return fetch(request).then(res => {
          const clone = res.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(request, clone));
          return res;
        });
      })
    );
    return;
  }

  e.respondWith(fetch(request));
});

// Background sync for deferred operations
self.addEventListener('sync', (e) => {
  if (e.tag === 'stt-sync') {
    e.waitUntil(doPendingSTT());
  }
  if (e.tag === 'mail-sync') {
    e.waitUntil(doPendingMail());
  }
});

async function doPendingSTT() {
  // STT is real-time, but sync is registered as fallback
  const clients = await self.clients.matchAll({ type: 'window' });
  clients.forEach(c => c.postMessage({ type: 'SYNC_STT' }));
}

async function doPendingMail() {
  const clients = await self.clients.matchAll({ type: 'window' });
  clients.forEach(c => c.postMessage({ type: 'SYNC_MAIL' }));
}
