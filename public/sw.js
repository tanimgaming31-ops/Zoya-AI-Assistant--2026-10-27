// PWA app-shell caching only. Gemini calls require Internet and are never cached.
const CACHE = 'zoya-app-shell-v1';
self.addEventListener('install',event=>{
 event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(['./','./index.html','./manifest.webmanifest','./icon-192.png','./icon-512.png'])));
 self.skipWaiting();
});
self.addEventListener('activate',event=>{
 event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith('zoya-app-shell-')&&k!==CACHE).map(k=>caches.delete(k)))));
 self.clients.claim();
});
self.addEventListener('fetch',event=>{
 const req=event.request;
 if(req.method!=='GET')return;
 const url=new URL(req.url);
 if(url.origin!==self.location.origin)return;
 event.respondWith(fetch(req).then(resp=>{
  if(resp.ok && (url.pathname.includes('/assets/')||url.pathname.endsWith('.png')||url.pathname.endsWith('.svg')||url.pathname.endsWith('.css')||url.pathname.endsWith('.js')||req.mode==='navigate')){
   const copy=resp.clone();void caches.open(CACHE).then(cache=>cache.put(req,copy));
  }
  return resp;
 }).catch(()=>caches.match(req).then(cached=>cached||(req.mode==='navigate'?caches.match('./index.html'):Response.error()))));
});
