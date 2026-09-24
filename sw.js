const CACHE="targetku-cache-v6";
const STATIC_ASSETS=["/","/index.html","/styles.css","/app.js","/manifest.webmanifest","/icon.svg","/icon-192.png","/icon-512.png"];

self.addEventListener("install",event=>{
  event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(STATIC_ASSETS)).then(()=>self.skipWaiting()));
});
self.addEventListener("activate",event=>{
  event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));
});
self.addEventListener("fetch",event=>{
  if(event.request.method!=="GET") return;
  const url=new URL(event.request.url);
  if(url.origin!==self.location.origin||url.pathname.startsWith("/api/")) return;
  if(event.request.mode==="navigate"){
    event.respondWith(fetch(event.request).catch(()=>caches.match("/index.html")));
    return;
  }
  event.respondWith(caches.match(event.request).then(cached=>{
    const network=fetch(event.request).then(response=>{
      if(response&&response.ok&&response.type==="basic"){
        const copy=response.clone(); caches.open(CACHE).then(c=>c.put(event.request,copy)).catch(()=>{});
      }
      return response;
    }).catch(()=>cached);
    return cached||network;
  }));
});
self.addEventListener("push",event=>{
  let data={};
  try{data=event.data?event.data.json():{};}catch(_){data={body:event.data?event.data.text():""};}
  const title=String(data.title||"TARGETKU").slice(0,80);
  const body=String(data.body||"Ada pengingat dari TARGETKU.").slice(0,250);
  const url=typeof data.url==="string"&&data.url.startsWith("/")?data.url:"/";
  event.waitUntil(self.registration.showNotification(title,{
    body,icon:"/icon-192.png",badge:"/icon-192.png",
    tag:String(data.tag||"targetku-push").slice(0,64),renotify:Boolean(data.renotify),requireInteraction:false,
    data:{url,targetId:data.targetId||null,type:data.type||"notification"}
  }));
});
self.addEventListener("notificationclick",event=>{
  event.notification.close();
  const target=event.notification.data?.url;
  const url=new URL(typeof target==="string"&&target.startsWith("/")?target:"/",self.location.origin).href;
  event.waitUntil(self.clients.matchAll({type:"window",includeUncontrolled:true}).then(async list=>{
    for(const client of list){
      if("navigate" in client&&client.url.startsWith(self.location.origin)){
        try{await client.navigate(url);}catch(_){}
        if("focus" in client) return client.focus();
      }
    }
    if(self.clients.openWindow) return self.clients.openWindow(url);
    return undefined;
  }));
});
