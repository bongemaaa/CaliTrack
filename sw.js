/* CaliTrack offline cache v2.
   Pages: ask the network first and bypass the browser's HTTP cache (GitHub Pages caches ~10 min),
   so a new index.html shows at the next launch; offline, the last saved copy is used.
   On a weak connection (signal bars but nothing gets through) the network gets 2.5 s, then the saved copy
   is shown; the network request keeps running in the background and refreshes the copy for the next launch.
   Other files: cache first. */
const CACHE="calitrack-v2";
const FILES=["./","./index.html","./manifest.webmanifest","./icon-180.png","./icon-192.png","./icon-512.png"];
const NET_TIMEOUT=2500;
self.addEventListener("install",e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(FILES.map(f=>new Request(f,{cache:"reload"})))).then(()=>self.skipWaiting()))});
self.addEventListener("activate",e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
self.addEventListener("fetch",e=>{
  const r=e.request;if(r.method!=="GET")return;
  if(r.mode==="navigate"){
    const net=fetch(r.url,{cache:"no-store",credentials:"same-origin"}).then(res=>{
      if(res.ok){const cp=res.clone();return caches.open(CACHE).then(c=>c.put("./index.html",cp)).then(()=>res)}
      return res});
    e.waitUntil(net.catch(()=>{}));
    const saved=()=>caches.match("./index.html");
    const timeout=new Promise(ok=>setTimeout(()=>saved().then(hit=>{if(hit)ok(hit)}),NET_TIMEOUT));
    e.respondWith(Promise.race([net.catch(()=>saved().then(hit=>hit||Response.error())),timeout]));
    return;
  }
  e.respondWith(caches.match(r).then(hit=>hit||fetch(r)));
});
