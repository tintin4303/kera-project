const CACHE_NAME = "kera-pwa-v5";
const ASSETS = ["/", "/pricing", "/signin", "/signup", "/favicon.ico", "/pwa-icon.svg"];
const OFFLINE_QUEUE_NAME = "kera-offline-queue-v1";

// Strategy: Stale-While-Revalidate for static assets
// Strategy: Network-First for HTML (to ensure fresh content on refresh)
// Strategy: Background Sync for API POST/PUT requests when offline

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
            if (key !== CACHE_NAME && key !== OFFLINE_QUEUE_NAME) {
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
  const url = new URL(event.request.url);

  // Only handle same-origin requests
  if (url.origin !== self.location.origin) {
    return;
  }

  // Handle offline sync requests
  if (url.pathname === "/api/sync") {
    event.respondWith(handleSyncRequest(event.request));
    return;
  }

  // For API POST/PUT requests, try to queue if offline
  if ((event.request.method === "POST" || event.request.method === "PUT") &&
    url.pathname.startsWith("/api/")) {
    event.respondWith(handleApiRequest(event.request));
    return;
  }

  if (event.request.method !== "GET") {
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

// Handle API requests - queue offline if needed
async function handleApiRequest(request) {
  try {
    // Try to make the request
    const response = await fetch(request);
    return response;
  } catch (error) {
    // If offline, queue the request for later sync
    if (!navigator.onLine) {
      const clonedRequest = request.clone();
      const body = await clonedRequest.text();

      // Store in IndexedDB via the sync endpoint
      const queueItem = {
        url: request.url,
        method: request.method,
        headers: Object.fromEntries(request.headers.entries()),
        body: body,
        timestamp: Date.now()
      };

      // Store in cache (as a simple queue)
      const cache = await caches.open(OFFLINE_QUEUE_NAME);
      const existingQueue = await cache.match("/queue") || new Response(JSON.stringify([]));
      const queue = await existingQueue.json();
      queue.push(queueItem);
      await cache.put("/queue", new Response(JSON.stringify(queue)));

      // Return a pending response
      return new Response(JSON.stringify({
        queued: true,
        message: "Request queued for sync when back online"
      }), {
        status: 202,
        headers: { "Content-Type": "application/json" }
      });
    }

    // If online but failed, rethrow
    throw error;
  }
}

// Handle sync requests - process queued items when back online
async function handleSyncRequest(request) {
  try {
    const queueCache = await caches.open(OFFLINE_QUEUE_NAME);
    const queueResponse = await queueCache.match("/queue");

    if (!queueResponse) {
      return new Response(JSON.stringify({ synced: 0 }), {
        status: 200,
        headers: { "Content-Type": "application/json" }
      });
    }

    const queue = await queueResponse.json();
    let synced = 0;
    const failed = [];

    for (const item of queue) {
      try {
        const response = await fetch(item.url, {
          method: item.method,
          headers: item.headers,
          body: item.body
        });

        if (response.ok) {
          synced++;
        } else {
          failed.push(item);
        }
      } catch (error) {
        failed.push(item);
      }
    }

    // Update queue with only failed items
    await queueCache.put("/queue", new Response(JSON.stringify(failed)));

    return new Response(JSON.stringify({
      synced,
      remaining: failed.length
    }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}

// Listen for online event to trigger sync
self.addEventListener("sync", (event) => {
  if (event.tag === "kera-sync") {
    event.waitUntil(syncQueuedRequests());
  }
});

async function syncQueuedRequests() {
  try {
    const response = await fetch("/api/sync", {
      method: "POST",
      headers: { "Content-Type": "application/json" }
    });

    const result = await response.json();

    // Notify clients about sync status
    const clients = await self.clients.matchAll();
    clients.forEach(client => {
      client.postMessage({
        type: "SYNC_COMPLETE",
        data: result
      });
    });

    return result;
  } catch (error) {
    console.error("Sync failed:", error);
  }
}
