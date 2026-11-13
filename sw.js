'use strict';
// v6: finish job, client-ready report, not-rated conditions, glove-friendly layout. Network-first for the app page so updates arrive; cache fallback keeps it working offline.
const CACHE='stripnote-shell-v6';
const SHELL=['./','./index.html','./manifest.json','./icon.svg'];
self.addEventListener('install',event=>{self.skipWaiting();event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(SHELL.map(u=>new Request(u,{cache:'reload'})))));});
self.addEventListener('activate',event=>event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith('stripnote-shell-')&&k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
function fromNetwork(request){return new Promise((resolve,reject)=>{const timer=setTimeout(()=>reject(Error('timeout')),5000);fetch(request).then(res=>{clearTimeout(timer);if(res.ok){const copy=res.clone();caches.open(CACHE).then(c=>c.put(request,copy)).catch(()=>{});}resolve(res);},err=>{clearTimeout(timer);reject(err);});});}
// Local app shell only. No report, photo, audio or dictation traffic is intercepted.
self.addEventListener('fetch',event=>{const req=event.request,url=new URL(req.url);if(req.method!=='GET'||url.origin!==self.location.origin)return;event.respondWith(fromNetwork(req).catch(()=>caches.match(req).then(hit=>hit||(req.mode==='navigate'?caches.match('./index.html'):Promise.reject(Error('offline'))))));});
