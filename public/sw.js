// public/sw.js — Service Worker untuk Laundria Driver PWA
const CACHE_NAME = "laundria-driver-cache-v1";
const ASSETS_TO_CACHE = [
  "/",
  "/driver",
  "/manifest.json",
];

// Install: Simpan shell app dan aset penting ke cache
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE).catch(() => {
        // Abaikan jika ada rute dinamis yang belum terjangkau saat install
      });
    })
  );
  self.skipWaiting();
});

// Activate: Bersihkan cache versi terdahulu
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            return caches.delete(cache);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch: Strategi Network-First dengan Fallback ke Cache saat Offline
self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        if (response && response.status === 200 && response.type === "basic") {
          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return response;
      })
      .catch(async () => {
        const cachedResponse = await caches.match(event.request);
        if (cachedResponse) {
          return cachedResponse;
        }
        if (event.request.mode === "navigate") {
          return caches.match("/driver");
        }
      })
  );
});
