/* EA Portal Chassis™ service worker.
 * Conservative by design:
 *  - Only same-origin GET requests are touched.
 *  - Auth, API, and dynamic app routes always go to the network.
 *  - Static build assets are cache-first.
 *  - Navigations are network-first with an offline fallback shell.
 */

const VERSION = 'ea-pwa-v2';
const STATIC_CACHE = `${VERSION}-static`;
const OFFLINE_URL = '/offline';

// Never intercept these — they must always be live (auth, data, SSO).
const BYPASS_PREFIXES = [
  '/api',
  '/admin',
  '/portal/login',
  '/portal/sign-in',
  '/portal/forgot-password',
  '/portal/reset-password',
  '/sso-callback',
  '/_next/data',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => cache.addAll([OFFLINE_URL])).catch(() => {}),
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => !k.startsWith(VERSION)).map((k) => caches.delete(k))),
    ),
  );
  self.clients.claim();
});

function shouldBypass(url) {
  return BYPASS_PREFIXES.some((p) => url.pathname === p || url.pathname.startsWith(`${p}/`));
}

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;
  if (shouldBypass(url)) return;

  // Cache-first for immutable build assets and static files.
  if (url.pathname.startsWith('/_next/static') || /\.(?:js|css|woff2?|png|jpg|jpeg|svg|gif|webp|ico)$/.test(url.pathname)) {
    event.respondWith(
      caches.match(request).then((cached) => {
        if (cached) return cached;
        return fetch(request).then((res) => {
          if (res.ok && res.type === 'basic') {
            const copy = res.clone();
            caches.open(STATIC_CACHE).then((cache) => cache.put(request, copy)).catch(() => {});
          }
          return res;
        });
      }),
    );
    return;
  }

  // Network-first for page navigations, with offline fallback.
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request).catch(() =>
        caches.match(OFFLINE_URL).then((cached) => cached || Response.error()),
      ),
    );
  }
});

// Push notifications (infrastructure ready; only fires when a push is sent).
self.addEventListener('push', (event) => {
  if (!event.data) return;
  let payload = {};
  try {
    payload = event.data.json();
  } catch {
    payload = { title: 'Update', body: event.data.text() };
  }
  const title = payload.title || 'New update';
  const options = {
    body: payload.body || '',
    icon: payload.icon || '/cpr-logo.png',
    badge: payload.badge || '/cpr-logo.png',
    data: { url: payload.url || '/' },
  };
  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const target = (event.notification.data && event.notification.data.url) || '/';
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clients) => {
      for (const client of clients) {
        if ('focus' in client) {
          client.navigate(target);
          return client.focus();
        }
      }
      return self.clients.openWindow(target);
    }),
  );
});
