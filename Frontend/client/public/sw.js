const CACHE = 'ipp-client-v1';
const ASSETS = ['/IPP/', '/IPP/index.html', '/IPP/manifest.json'];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS).catch(()=>{})).then(()=>self.skipWaiting()));
});
self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));
});
self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;
  // Ne jamais cacher les appels API / Supabase / push
  if (/\/api\/|supabase\.co|fcm\.googleapis|updates\.push\.services\.mozilla/.test(e.request.url)) return;
  e.respondWith(
    caches.match(e.request).then(cached => {
      if (cached) return cached;
      return fetch(e.request).then(res => {
        if (res.ok && e.request.url.startsWith(self.location.origin)) {
          const clone = res.clone();
          caches.open(CACHE).then(c => c.put(e.request, clone));
        }
        return res;
      }).catch(()=> cached);
    })
  );
});

// --- Web Push IPP (barre système Android / Windows / iOS installé) ---
self.addEventListener('push', (e) => {
  let data = {};
  try { data = e.data ? e.data.json() : {}; } catch (_) { data = { body: e.data ? e.data.text() : '' }; }
  const title = data.title || 'IPP La Paix';
  const options = {
    body: data.body || 'Nouvelle notification',
    icon: data.icon || '/IPP/favicon.svg',
    badge: data.badge || '/IPP/favicon.svg',
    tag: data.tag || 'ipp',
    renotify: true,
    vibrate: data.vibrate || [200, 100, 200],
    data: { url: data.url || '/IPP/' },
  };
  // Son custom si fourni (Android/Windows ; iOS joue le son système)
  if (data.sound) options.sound = data.sound;
  e.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', (e) => {
  e.notification.close();
  const url = (e.notification.data && e.notification.data.url) || '/IPP/';
  e.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clients) => {
      for (const c of clients) {
        if (c.url.includes('/IPP')) { c.navigate(url); return c.focus(); }
      }
      return self.clients.openWindow(url);
    })
  );
});
