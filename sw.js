const V = "pokertutor-efc5d36ebb";
const ASSETS = ["./","./index.html","./manifest.webmanifest",
  "./icon-192.png","./icon-512.png","./icon-maskable-512.png","./apple-touch-icon.png"];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(V).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", e => {
  e.waitUntil(caches.keys()
    .then(ks => Promise.all(ks.filter(k => k !== V).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});

self.addEventListener("fetch", e => {
  const r = e.request;
  if (r.method !== "GET") return;
  if (new URL(r.url).origin !== location.origin) return;

  // La pagina: primero la red (para que veas la ultima version),
  // y si no hay conexion, la copia guardada.
  if (r.mode === "navigate") {
    e.respondWith(
      fetch(r).then(resp => {
        const copia = resp.clone();
        caches.open(V).then(c => c.put("./index.html", copia));
        return resp;
      }).catch(() => caches.match("./index.html").then(x => x || caches.match("./")))
    );
    return;
  }

  // Iconos y manifest: primero la copia guardada.
  e.respondWith(caches.match(r).then(x => x || fetch(r)));
});
