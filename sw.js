// Semainier — cache applicatif (v20260905)
const CACHE = "semainier-v20260905";
const COQUILLE = ["./", "./index.html", "./manifest.webmanifest", "./icone-192.png", "./icone-512.png", "./icone-apple.png"];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(COQUILLE)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys()
      .then(noms => Promise.all(noms.filter(n => n !== CACHE).map(n => caches.delete(n))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", e => {
  const req = e.request;
  if (req.method !== "GET") return;

  // navigation : réseau d'abord pour prendre la mise à jour, la page en cache sinon
  if (req.mode === "navigate") {
    e.respondWith(
      fetch(req).then(r => {
        const copie = r.clone();
        caches.open(CACHE).then(c => c.put("./index.html", copie));
        return r;
      }).catch(() => caches.match("./index.html"))
    );
    return;
  }

  // polices Google : on sert le cache et on rafraîchit en fond
  const url = new URL(req.url);
  const police = url.hostname.endsWith("googleapis.com") || url.hostname.endsWith("gstatic.com");

  e.respondWith(
    caches.match(req).then(cache => {
      const reseau = fetch(req).then(r => {
        if (r && (r.ok || r.type === "opaque")) {
          const copie = r.clone();
          caches.open(CACHE).then(c => c.put(req, copie));
        }
        return r;
      }).catch(() => cache);
      return police ? (cache || reseau) : (cache || reseau);
    })
  );
});
