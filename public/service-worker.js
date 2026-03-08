const CACHE_NAME = 'diba-cache-v2';
const urlsToCache = [
  '/',
  '/index.html',
  '/styles/styles.css',
  '/images/ESCUDO.png',
  '/scripts/main.js'
];

self.addEventListener('install', (event) => {
  self.skipWaiting(); // Fuerza al Service Worker a activarse inmediatamente
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(urlsToCache);
    })
  );
});

self.addEventListener('activate', (event) => {
  // Borra cachés antiguas que no coincidan con la versión actual
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim()) // Toma el control de la página de inmediato
  );
});
  
self.addEventListener('fetch', (event) => {
  // Estrategia: "Network First, falling back to cache" 
  // Siempre intenta ir por la red (vercel) para asegurar cambios frescos.
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Actualiza el cache si la petición fue exitosa
        if (event.request.method === 'GET' && response && response.status === 200 && response.type === 'basic') {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone);
          });
        }
        return response;
      })
      .catch(() => {
        // Si hay error en red (ej. offline), usamos lo del cache
        return caches.match(event.request);
      })
  );
});