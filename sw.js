const CACHE_NAME = 'dr-r-v1';
const ASSETS = [
  './',
  './index.html',
  './manifest.json'
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    caches.match(e.request).then((cached) => {
      const networked = fetch(e.request)
        .then((response) => {
          const cacheCopy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(e.request, cacheCopy));
          return response;
        })
        .catch(() => cached);
      return cached || networked;
    })
  );
});