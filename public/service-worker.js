
self.addEventListener('install', (event) => {
    event.waitUntil(
      caches.open('diba-cache-v1').then((cache) => {
        return cache.addAll([
          '/',
          '/index.html',
          '/styles/styles.css',
          '/images/ESCUDO.png',
          '/scripts/main.js'
          // Agrega más archivos si es necesario
        ]);
      })
    );
  });
  
  self.addEventListener('fetch', (event) => {
    event.respondWith(
      caches.match(event.request).then((response) => {
        return response || fetch(event.request);
      })
    );
  });
  