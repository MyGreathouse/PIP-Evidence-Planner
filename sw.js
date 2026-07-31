// PIP Evidence Builder™ — Service Worker v3 (v1.1)
// Caches the entire app shell for full offline use.
// All user data is encrypted in localStorage — zero server contact.

const CACHE = 'pip-eb-v3';
const ASSETS = [
  './', './index.html', './manifest.json', './sw.js',
  './icons/icon-72.png','./icons/icon-96.png','./icons/icon-128.png',
  './icons/icon-144.png','./icons/icon-152.png','./icons/icon-192.png',
  './icons/icon-192-maskable.png','./icons/icon-384.png',
  './icons/icon-512.png','./icons/icon-512-maskable.png'
];

self.addEventListener('install',  e => {
  self.skipWaiting();
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)));
});
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(ks =>
      Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    caches.match(e.request).then(cached => cached ||
      fetch(e.request).then(r => {
        if (r && r.status === 200 && r.type === 'basic') {
          const c = r.clone();
          caches.open(CACHE).then(cache => cache.put(e.request, c));
        }
        return r;
      }).catch(() => caches.match('./index.html'))
    )
  );
});
