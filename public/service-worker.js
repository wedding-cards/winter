// Service Worker for caching static assets
const CACHE_NAME = "wedding-invitation-v3"; // 버전 업
const urlsToCache = [
  "/",
  "/index.html",
  "/manifest.json",
  // 정적 파일들은 런타임에 캐시 (초기 캐시에서 제외)
];

// Install event - cache only essential files
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => {
        // 필수 파일들만 안전하게 캐시
        return Promise.allSettled(
          urlsToCache.map((url) =>
            fetch(url)
              .then((response) => {
                if (response.ok) {
                  return cache.put(url, response);
                }
              })
              .catch(() => {
                // Cache failed - continue silently
              })
          )
        );
      })
      .catch(() => {
        // Cache install failed - continue silently
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
    event.request.url.match(/\.(jpg|jpeg|png|gif|webp|svg|ico|css|js)$/i)
  ) {
    // 이미지와 정적 파일은 네트워크 우선, 캐시 폴백
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          // 성공한 응답은 캐시에 저장
          if (response.ok) {
            const responseClone = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseClone);
            });
          }
          return response;
        })
        .catch(() => {
          // 네트워크 실패시 캐시에서 가져오기
          return caches.match(event.request);
        })
    );
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
          return Promise.resolve();
        })
      );
    })
  );

  // clients.claim() 제거 - 자동 새로고침 방지
});
