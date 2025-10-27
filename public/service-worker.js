// Service Worker for caching static assets
const CACHE_NAME = "wedding-invitation-v1";
const urlsToCache = [
  "/",
  "/index.html",
  "/static/css/main.css",
  "/static/js/main.js",
  "/assets/images/couple-main.webp",
  "/assets/images/couple-main.jpg",
  "/manifest.json",
  "/favicon.png",
];

// Install event - cache static assets
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => {
        console.log("Opened cache");
        return cache.addAll(urlsToCache);
      })
      .catch((error) => {
        console.log("Cache install failed:", error);
      })
  );
  self.skipWaiting();
});

// Fetch event - serve from cache, fallback to network
self.addEventListener("fetch", (event) => {
  // Skip non-http(s) requests like chrome-extension://
  if (!event.request.url.startsWith("http")) {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((response) => {
      // Cache hit - return response
      if (response) {
        return response;
      }

      return fetch(event.request)
        .then((response) => {
          // Check if we received a valid response
          if (
            !response ||
            response.status !== 200 ||
            response.type !== "basic"
          ) {
            return response;
          }

          // Clone the response
          const responseToCache = response.clone();

          caches.open(CACHE_NAME).then((cache) => {
            // Cache GET requests only
            if (event.request.method === "GET") {
              cache.put(event.request, responseToCache);
            }
          });

          return response;
        })
        .catch(() => {
          // Network request failed, return a default response or handle gracefully
          return new Response("Network error", { status: 503 });
        });
    })
  );
});

// Activate event - clean up old caches
self.addEventListener("activate", (event) => {
  const cacheWhitelist = [CACHE_NAME];

  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );

  return self.clients.claim();
});
