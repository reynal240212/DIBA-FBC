// ============================================================
//  DIBA FBC — Service Worker v3
//  Estrategias: Cache-First (assets) | Network-First (HTML)
//  + Soporte completo de Web Push Notifications
// ============================================================

const CACHE_VERSION = 'diba-v3';
const CACHE_STATIC = `${CACHE_VERSION}-static`;
const CACHE_PAGES = `${CACHE_VERSION}-pages`;

// Assets estáticos que se pre-cachean en la instalación
const PRECACHE_ASSETS = [
  '/offline.html',
  '/images/ESCUDO.png',
  '/images/ESCUDO.ico',
  '/manifest.json',
  '/scripts/config.js',
  '/scripts/loadComponents.js',
  '/scripts/main.js',
  '/scripts/navbar.js',
  '/scripts/auth.js',
  '/scripts/supabaseClient.js',
  '/scripts/search.js',
  '/layout/navbar.html',
  '/layout/footer.html',
  '/layout/hero.html',
  '/layout/fab.html',
  '/layout/stats_counter.html',
  '/layout/patrocinadores.html',
  '/layout/testimonials.html',
];

// URLs que nunca deben cachearse (APIs externas, Supabase, auth)
const NEVER_CACHE = [
  'supabase.co',
  'accounts.google.com',
  'firebase',
  'analytics',
  'cdn.tailwindcss.com',
];

// ── INSTALL: pre-caché de assets estáticos ──────────────────
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_STATIC)
      .then((cache) => cache.addAll(PRECACHE_ASSETS))
      .then(() => self.skipWaiting())
  );
});

// ── ACTIVATE: limpia cachés antiguas ───────────────────────
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((k) => k !== CACHE_STATIC && k !== CACHE_PAGES)
          .map((k) => caches.delete(k))
      )
    ).then(() => self.clients.claim())
  );
});

// ── Helpers ─────────────────────────────────────────────────
function shouldNeverCache(url) {
  return NEVER_CACHE.some((pattern) => url.includes(pattern));
}

function isHTMLRequest(request) {
  return request.headers.get('Accept')?.includes('text/html');
}

function isStaticAsset(url) {
  return /\.(js|css|png|jpg|jpeg|gif|svg|ico|webp|woff2?|mp4|webm)(\?.*)?$/.test(url);
}

// ── FETCH: estrategia por tipo de recurso ──────────────────
self.addEventListener('fetch', (event) => {
  // Ignorar peticiones que no son GET
  if (event.request.method !== 'GET') return;

  const url = event.request.url;

  // Nunca cachear APIs externas / Supabase
  if (shouldNeverCache(url)) return;

  // Solo manejar peticiones del mismo origen o assets conocidos
  if (!url.startsWith(self.location.origin) && !isStaticAsset(url)) return;

  if (isHTMLRequest(event.request)) {
    // Páginas HTML → Network-First (siempre frescas), fallback a caché, luego offline.html
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          if (response && response.status === 200) {
            const clone = response.clone();
            caches.open(CACHE_PAGES).then((cache) => cache.put(event.request, clone));
          }
          return response;
        })
        .catch(async () => {
          const cached = await caches.match(event.request);
          return cached || caches.match('/offline.html');
        })
    );
  } else if (isStaticAsset(url)) {
    // Assets estáticos → Cache-First (rendimiento máximo)
    event.respondWith(
      caches.match(event.request).then((cached) => {
        if (cached) return cached;
        return fetch(event.request).then((response) => {
          if (response && response.status === 200) {
            const clone = response.clone();
            caches.open(CACHE_STATIC).then((cache) => cache.put(event.request, clone));
          }
          return response;
        });
      })
    );
  } else {
    // Otros recursos (layout HTML partials, etc.) → Network-First con caché de respaldo
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          if (response && response.status === 200) {
            const clone = response.clone();
            caches.open(CACHE_PAGES).then((cache) => cache.put(event.request, clone));
          }
          return response;
        })
        .catch(() => caches.match(event.request))
    );
  }
});

// ── WEB PUSH: mostrar notificación ─────────────────────────
self.addEventListener('push', (event) => {
  let data = { title: 'DIBA FBC', body: '¡Tienes una nueva notificación!', url: '/' };
  try {
    if (event.data) data = { ...data, ...event.data.json() };
  } catch (e) { /* payload vacío */ }

  const options = {
    body: data.body,
    icon: '/images/ESCUDO.png',
    badge: '/images/ESCUDO.png',
    vibrate: [200, 100, 200],
    data: { url: data.url || '/' },
    actions: [
      { action: 'open', title: 'Ver más' },
      { action: 'close', title: 'Cerrar' }
    ],
    requireInteraction: false,
  };

  event.waitUntil(self.registration.showNotification(data.title, options));
});

// ── WEB PUSH: clic en notificación ─────────────────────────
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'close') return;

  const targetUrl = event.notification.data?.url || '/';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // Si ya hay una pestaña abierta con la URL, la enfocamos
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          client.navigate(targetUrl);
          return client.focus();
        }
      }
      // Si no hay pestaña abierta, abrimos una nueva
      if (clients.openWindow) return clients.openWindow(targetUrl);
    })
  );
});