// construit index.html (version PWA autonome) à partir de la source de l'artifact
const fs = require("fs");
const SRC = "C:/Users/Shibakun/AppData/Local/Temp/claude/C--/137a3141-12f6-4161-9f09-035cc06c0a6f/scratchpad/semainier.html";
const corps = fs.readFileSync(SRC, "utf8");

const VERSION = process.argv[2] || ("v" + new Date().toISOString().slice(0, 10).replace(/-/g, ""));

const tete = `<!doctype html>
<html lang="fr">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<meta name="description" content="Le calendrier des repas et la liste de courses qui en découle. 151 recettes, dont les classiques français vérifiés.">
<meta name="theme-color" content="#F2F1EC" media="(prefers-color-scheme: light)">
<meta name="theme-color" content="#14151A" media="(prefers-color-scheme: dark)">
<link rel="manifest" href="manifest.webmanifest">
<link rel="icon" href="icone-192.png" sizes="192x192">
<link rel="apple-touch-icon" href="icone-apple.png">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-title" content="Semainier">
<meta name="apple-mobile-web-app-status-bar-style" content="default">
<style>
  :root{color-scheme:light dark}
  html{-webkit-text-size-adjust:100%}
  body{margin:0;font:14px system-ui,-apple-system,"Segoe UI",sans-serif}
  img{max-width:100%}
  [hidden]{display:none!important}
  .wrap{padding-top:max(26px,env(safe-area-inset-top));padding-bottom:max(90px,env(safe-area-inset-bottom))}
  #installer{position:fixed;right:14px;bottom:calc(14px + env(safe-area-inset-bottom));z-index:25;border:0;border-radius:8px;padding:10px 16px;font:600 14px Archivo,system-ui,sans-serif;background:#2B4A7A;color:#FCFBF7;box-shadow:0 10px 24px -10px rgba(0,0,0,.5)}
</style>
</head>
<body>
`;

const pied = `
<button id="installer" hidden>Installer l'app</button>
<script>
// installation Android : on garde l'invite pour l'offrir au bon moment
let invite = null;
addEventListener("beforeinstallprompt", e => {
  e.preventDefault();
  invite = e;
  document.getElementById("installer").hidden = false;
});
document.getElementById("installer").addEventListener("click", async () => {
  document.getElementById("installer").hidden = true;
  if (!invite) return;
  invite.prompt();
  await invite.userChoice;
  invite = null;
});
addEventListener("appinstalled", () => { document.getElementById("installer").hidden = true; });

if ("serviceWorker" in navigator) {
  addEventListener("load", () => navigator.serviceWorker.register("sw.js").catch(() => {}));
}
</script>
</body>
</html>
`;

fs.writeFileSync("index.html", tete + corps + pied, "utf8");

const manifest = {
  name: "Semainier — menus et courses",
  short_name: "Semainier",
  description: "Le calendrier des repas et la liste de courses qui en découle.",
  start_url: "./",
  scope: "./",
  display: "standalone",
  orientation: "portrait-primary",
  background_color: "#F2F1EC",
  theme_color: "#2B4A7A",
  lang: "fr",
  icons: [
    { src: "icone-192.png", sizes: "192x192", type: "image/png", purpose: "any maskable" },
    { src: "icone-512.png", sizes: "512x512", type: "image/png", purpose: "any maskable" }
  ]
};
fs.writeFileSync("manifest.webmanifest", JSON.stringify(manifest, null, 2), "utf8");

const sw = `// Semainier — cache applicatif (${VERSION})
const CACHE = "semainier-${VERSION}";
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
`;
fs.writeFileSync("sw.js", sw, "utf8");

console.log("index.html " + Math.round(fs.statSync("index.html").size / 1024) + " Ko");
console.log("manifest.webmanifest + sw.js (" + VERSION + ")");
