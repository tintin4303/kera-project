const CACHE_NAME = "kera-pwa-v4";
const ASSETS = ["/", "/pricing", "/signin", "/signup", "/favicon.ico", "/pwa-icon.svg"];

// Strategy: Stale-While-Revalidate for static assets
// Strategy: Network-First for HTML (to ensure fresh content on refresh)

self.addEventListener("install", (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS);
    })
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    Promise.all([
      self.clients.claim(),
      caches.keys().then((keys) =>
        Promise.all(
          keys.map((key) => {
            if (key !== CACHE_NAME) {
              return caches.delete(key);
            }
            return undefined;
          })
        )
      ),
    ])
  );
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") {
    return;
  }

  const url = new URL(event.request.url);

  // Only handle same-origin requests
  if (url.origin !== self.location.origin) {
    return;
  }

  // Always bypass cache for protected/dynamic routes
  const protectedPrefixes = ["/api", "/admin", "/carer", "/dashboard", "/_next"];
  if (protectedPrefixes.some((prefix) => url.pathname.startsWith(prefix))) {
    return;
  }

  // For HTML pages, use Network-First to ensure freshness, falling back to cache
  const isHtml = event.request.headers.get("accept")?.includes("text/html");

  if (isHtml) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          const resClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, resClone));
          return response;
        })
        .catch(() => caches.match(event.request))
    );
    return;
  }

  // For other assets (JS, CSS, Images), use Stale-While-Revalidate
  event.respondWith(
    caches.match(event.request).then((cached) => {
      const networked = fetch(event.request)
        .then((response) => {
          const resClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, resClone));
          return response;
        })
        .catch(() => undefined);

      return cached || networked;
    })
  );
});
