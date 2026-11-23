const CACHE_NAME = 'reyan-tiem-v20';
const ASSETS = [
  './',
  './index.html',
  './manifest.webmanifest',
  './logo.png',
  './clock.png',
  './cal-bg.png',
  './Myfont-Regular.ttf'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS)).catch(() => {})
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  event.respondWith(
    fetch(event.request)
      .then((res) => {
        const copy = res.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy)).catch(() => {});
        return res;
      })
      .catch(() => caches.match(event.request))
  );
});

self.addEventListener('notificationclick', (event) => {
  const action = event.action || 'open';
  const alarmId = (event.notification && event.notification.data && event.notification.data.alarmId) || '';
  if (event.notification) event.notification.close();

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      const msgType = action === 'snooze' ? 'snooze' : 'stop';
      for (const client of clientList) {
        client.postMessage({ type: 'ALARM_ACTION', action: msgType, alarmId });
      }
      if (action === 'open' && clientList.length > 0) {
        return clientList[0].focus();
      }
      if (action === 'open' && self.clients.openWindow) {
        return self.clients.openWindow('./');
      }
    })
  );
});
