// ForemanOS Service Worker for Offline-First Capabilities
const CACHE_NAME = 'foremanos-v1';
const STATIC_CACHE = 'foremanos-static-v1';
const API_CACHE = 'foremanos-api-v1';

// Assets to cache immediately
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/src/main.jsx',
  '/foremanos-icon.svg'
];

// API endpoints to cache with stale-while-revalidate
const API_ENDPOINTS = [
  '/rest/v1/projects_fos2025',
  '/rest/v1/tasks_fos2025',
  '/rest/v1/clients_fos2025',
  '/rest/v1/daily_logs_fos2025'
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => cache.addAll(STATIC_ASSETS))
      .then(() => self.skipWaiting())
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== STATIC_CACHE && cacheName !== API_CACHE) {
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => self.clients.claim())
  );
});

// Fetch event - implement caching strategies
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Handle API requests with stale-while-revalidate
  if (API_ENDPOINTS.some(endpoint => url.pathname.includes(endpoint))) {
    event.respondWith(staleWhileRevalidate(request));
    return;
  }

  // Handle static assets with cache-first
  if (request.destination === 'script' || 
      request.destination === 'style' || 
      request.destination === 'image') {
    event.respondWith(cacheFirst(request));
    return;
  }

  // Handle navigation requests
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .catch(() => caches.match('/index.html'))
    );
    return;
  }
});

// Cache-first strategy for static assets
async function cacheFirst(request) {
  const cachedResponse = await caches.match(request);
  if (cachedResponse) {
    return cachedResponse;
  }

  try {
    const response = await fetch(request);
    const cache = await caches.open(STATIC_CACHE);
    cache.put(request, response.clone());
    return response;
  } catch (error) {
    console.error('Cache-first failed:', error);
    throw error;
  }
}

// Stale-while-revalidate strategy for API calls
async function staleWhileRevalidate(request) {
  const cache = await caches.open(API_CACHE);
  const cachedResponse = await cache.match(request);

  // Fetch fresh data in the background
  const fetchPromise = fetch(request)
    .then((response) => {
      if (response.ok) {
        cache.put(request, response.clone());
      }
      return response;
    })
    .catch((error) => {
      console.error('Background fetch failed:', error);
      return cachedResponse;
    });

  // Return cached data immediately if available, otherwise wait for fetch
  return cachedResponse || fetchPromise;
}

// Handle background sync for offline actions
self.addEventListener('sync', (event) => {
  if (event.tag === 'foremanos-sync') {
    event.waitUntil(syncOfflineActions());
  }
});

async function syncOfflineActions() {
  // This will be implemented to sync pending changes when back online
  console.log('Syncing offline actions...');
}