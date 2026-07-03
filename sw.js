const CACHE = 'matulmad-v11';
const ASSETS = ['/', '/index.html', '/logo.svg', '/icon-192.png', '/icon-512.png', '/manifest.json'];
self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== location.origin) return;
  // Network-first ho an'ny HTML/navigation (mahazo vaovao foana)
  if (req.mode === 'navigate' || req.destination === 'document' || url.pathname === '/' || url.pathname.endsWith('.html') || url.pathname.includes('-bg.jpg') || url.pathname.endsWith('.jpg') || url.pathname.endsWith('.png')) {
    e.respondWith(
      fetch(req).then((res) => { const copy = res.clone(); caches.open(CACHE).then((c) => c.put(req, copy)).catch(()=>{}); return res; })
        .catch(() => caches.match(req).then((h) => h || caches.match('/index.html')))
    );
    return;
  }
  // Cache-first ho an'ny assets hafa
  e.respondWith(
    caches.match(req).then((hit) => hit || fetch(req).then((res) => { const copy = res.clone(); caches.open(CACHE).then((c) => c.put(req, copy)).catch(()=>{}); return res; }))
  );
});
