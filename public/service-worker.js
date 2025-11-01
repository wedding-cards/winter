// Service Worker for caching static assets
const CACHE_NAME = "wedding-invitation-v2"; // 버전 업
const urlsToCache = [
  "/",
  "/index.html",
  "/static/css/main.css",
  "/static/js/main.js",
  "/assets/images/couple-main.webp",
  "/assets/images/couple-main.jpg",
  "/manifest.json",
  "/favicon.png",
  // 갤러리 이미지들 (우선순위 높은 것들만 초기 캐싱)
  "/assets/images/gallery/1.webp",
  "/assets/images/gallery/1.jpg",
  "/assets/images/gallery/2.webp",
  "/assets/images/gallery/2.jpg",
  "/assets/images/gallery/3.webp",
  "/assets/images/gallery/3.jpg",
  "/assets/images/gallery/4.webp",
  "/assets/images/gallery/4.jpg",
  "/assets/images/gallery/5.webp",
  "/assets/images/gallery/5.jpg",
  "/assets/images/gallery/6.webp",
  "/assets/images/gallery/6.jpg",
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
  // skipWaiting() 제거 - 자동 새로고침 방지
});

// Fetch event - serve from cache, fallback to network
self.addEventListener("fetch", (event) => {
  // Skip non-http(s) requests like chrome-extension://
  if (!event.request.url.startsWith("http")) {
    return;
  }

  // Skip navigation requests for images and assets to prevent SPA redirect issues
  if (
    event.request.destination === "image" ||
    event.request.url.includes("/assets/") ||
    event.request.url.includes("/static/") ||
    event.request.url.match(/\.(jpg|jpeg|png|gif|webp|svg|ico)$/i)
  ) {
    return fetch(event.request);
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

  // clients.claim() 제거 - 자동 새로고침 방지
});
