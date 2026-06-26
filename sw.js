const CACHE='matulmada-v4';
// FIX: index.html ESORINA amin'ny pre-cache mafy -- HTML page dia tokony
// ho network-first foana mba tsy hisy "mila fafana vao manavao".
const SHELL=['/manifest.json','/icon-192.png','/icon-512.png','/apple-touch-icon.png','/yas.png','/orange.png','/airtel.png'];

self.addEventListener('install',e=>{
  e.waitUntil(caches.open(CACHE).then(c=>Promise.all(SHELL.map(u=>c.add(u).catch(()=>{})))));
});

self.addEventListener('activate',e=>{
  e.waitUntil(caches.keys().then(ks=>Promise.all(ks.map(k=>k!==CACHE?caches.delete(k):0))).then(()=>self.clients.claim()));
});

// FIX: rehefa mandray SKIP_WAITING avy amin'ny page, lasa active avy hatrany
self.addEventListener('message',e=>{
  if(e.data && e.data.type==='SKIP_WAITING') self.skipWaiting();
});

self.addEventListener('fetch',e=>{
  const req=e.request; if(req.method!=='GET') return;
  const url=new URL(req.url);
  if(url.pathname.indexOf('/api/')!==-1) return;
  if(url.origin!==self.location.origin) return;

  // FIX: navigation (HTML pages) -- TOUJOURS network-first, no-store,
  // mba hahazoana ny version farany foana, tsy mila desinstaller.
  if(req.mode==='navigate' || url.pathname.endsWith('.html') || url.pathname==='/'){
    e.respondWith(
      fetch(req,{cache:'no-store'}).catch(()=>caches.match(req).then(hit=>hit||caches.match('/index.html')))
    );
    return;
  }

  e.respondWith(caches.match(req).then(hit=>hit||fetch(req).then(res=>{
    const copy=res.clone(); caches.open(CACHE).then(c=>c.put(req,copy)).catch(()=>{}); return res;
  }).catch(()=>caches.match('/index.html'))));
});
