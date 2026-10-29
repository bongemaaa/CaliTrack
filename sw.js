/* CaliTrack offline cache v2.
   Pages: always ask the network first and bypass the browser's HTTP cache (GitHub Pages caches ~10 min),
   so a new index.html shows at the next launch; offline, the last saved copy is used. Other files: cache first. */
const CACHE="calitrack-v2";
const FILES=["./","./index.html","./manifest.webmanifest","./icon-180.png","./icon-192.png","./icon-512.png"];
self.addEventListener("install",e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(FILES.map(f=>new Request(f,{cache:"reload"})))).then(()=>self.skipWaiting()))});
self.addEventListener("activate",e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
self.addEventListener("fetch",e=>{
  const r=e.request;if(r.method!=="GET")return;
  if(r.mode==="navigate"){
    e.respondWith(fetch(r.url,{cache:"no-store",credentials:"same-origin"}).then(res=>{const cp=res.clone();caches.open(CACHE).then(c=>c.put("./index.html",cp));return res}).catch(()=>caches.match("./index.html")));
    return;
  }
  e.respondWith(caches.match(r).then(hit=>hit||fetch(r)));
});
