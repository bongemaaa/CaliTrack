/* CaliTrack offline cache v2.
   Page: shown at once from the saved copy (no wait on a weak gym connection); meanwhile the network is asked for the
   latest index.html, bypassing the browser's HTTP cache (GitHub Pages caches ~10 min), and the copy is refreshed in
   the background. A new version therefore shows at the launch after the one that downloaded it. With no saved copy
   yet (first launch), the network answers directly.
   Other files: cache first. */
const CACHE="calitrack-v2";
const FILES=["./","./index.html","./manifest.webmanifest","./icon-180.png","./icon-192.png","./icon-512.png"];
self.addEventListener("install",e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(FILES.map(f=>new Request(f,{cache:"reload"})))).then(()=>self.skipWaiting()))});
self.addEventListener("activate",e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
self.addEventListener("fetch",e=>{
  const r=e.request;if(r.method!=="GET")return;
  if(r.mode==="navigate"){
    const net=fetch(r.url,{cache:"no-store",credentials:"same-origin"}).then(res=>{
      if(res.ok){const cp=res.clone();return caches.open(CACHE).then(c=>c.put("./index.html",cp)).then(()=>res)}
      return res});
    e.waitUntil(net.catch(()=>{}));   /* the copy is refreshed even once the page is shown */
    e.respondWith(caches.match("./index.html").then(hit=>hit||net.catch(()=>Response.error())));
    return;
  }
  e.respondWith(caches.match(r).then(hit=>hit||fetch(r)));
});
