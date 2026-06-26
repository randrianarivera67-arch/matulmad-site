const CACHE='matulmada-v3';
const SHELL=['/','/index.html','/manifest.json','/icon-192.png','/icon-512.png','/apple-touch-icon.png','/yas.png','/orange.png','/airtel.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>Promise.all(SHELL.map(u=>c.add(u).catch(()=>{})))).then(()=>self.skipWaiting()));});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.map(k=>k!==CACHE?caches.delete(k):0))).then(()=>self.clients.claim()));});
self.addEventListener('fetch',e=>{
  const req=e.request; if(req.method!=='GET') return;
  const url=new URL(req.url);
  if(url.pathname.indexOf('/api/')!==-1) return;            // jamais cacher l'API
  if(url.origin!==self.location.origin) return;             // laisser passer fonts, backends
  e.respondWith(caches.match(req).then(hit=>hit||fetch(req).then(res=>{
    const copy=res.clone(); caches.open(CACHE).then(c=>c.put(req,copy)).catch(()=>{}); return res;
  }).catch(()=>caches.match('/index.html'))));
});
