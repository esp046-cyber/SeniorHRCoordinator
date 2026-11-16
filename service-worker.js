/* Service worker — precache app shell, cache-first for static assets,
 * stale-while-revalidate for the HTML shell, offline.html fallback for navigations. */
const VERSION = "v1.0.0";
const CACHE = "hr-command-center-" + VERSION;
const PRECACHE = [
  "./",
  "./index.html",
  "./style.css",
  "./script.js",
  "./manifest.json",
  "./offline.html",
  "./favicon.ico",
  "./icon-192.png",
  "./icon-512.png",
  "./assets/logo.svg",
  "./assets/og-image.png",
  "./screenshots/mobile-view.png",
  "./screenshots/desktop-view.png"
];

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE).then(cache => cache.addAll(PRECACHE)).then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k.startsWith("hr-command-center-") && k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("message", event => {
  if (event.data === "SKIP_WAITING") self.skipWaiting();
});

self.addEventListener("fetch", event => {
  const req = event.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;

  // Page navigations: stale-while-revalidate with offline fallback
  if (req.mode === "navigate") {
    event.respondWith(
      caches.match(req, { ignoreSearch: true }).then(cached => {
        const network = fetch(req).then(res => {
          if (res && res.ok) { const copy = res.clone(); caches.open(CACHE).then(c => c.put(req, copy)); }
          return res;
        }).catch(() => cached || caches.match("./index.html") || caches.match("./offline.html"));
        return cached || network.then(r => r || caches.match("./offline.html"));
      }).catch(() => caches.match("./offline.html"))
    );
    return;
  }

  // Static assets: cache-first, then network, then update cache
  event.respondWith(
    caches.match(req).then(cached => {
      if (cached) return cached;
      return fetch(req).then(res => {
        if (res && res.ok) { const copy = res.clone(); caches.open(CACHE).then(c => c.put(req, copy)); }
        return res;
      }).catch(() => {
        if (req.destination === "document") return caches.match("./offline.html");
        return new Response("", { status: 504, statusText: "Offline" });
      });
    })
  );
});
