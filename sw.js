// ═══════════════════════════════════════════
// 翡冷翠宅配系統 · Service Worker（推播通知）
// 放在 GitHub 根目錄，與 index.html 同層
// ═══════════════════════════════════════════

const SW_VERSION = 'v1';

self.addEventListener('install', (event) => {
  // 立即接手，不等舊 SW
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

// 收到推播 → 顯示通知
self.addEventListener('push', (event) => {
  let data = {};
  try {
    data = event.data ? event.data.json() : {};
  } catch (e) {
    // 若不是 JSON，就當純文字
    data = { title: '宅配系統通知', body: event.data ? event.data.text() : '' };
  }

  const title = data.title || '📦 宅配系統通知';
  const options = {
    body: data.body || '',
    icon: 'icon-192.png',
    badge: 'icon-192.png',
    data: { url: data.url || '/' },
    vibrate: [100, 50, 100],
    requireInteraction: false,
    tag: data.tag || 'delivery-notify'
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

// 點通知 → 開啟/聚焦對應頁面
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const targetUrl = (event.notification.data && event.notification.data.url) || '/';

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // 若已有開著的視窗，聚焦它
      for (const client of clientList) {
        if ('focus' in client) {
          client.focus();
          if ('navigate' in client && targetUrl !== '/') {
            client.navigate(targetUrl).catch(() => {});
          }
          return;
        }
      }
      // 否則開新視窗
      if (self.clients.openWindow) {
        return self.clients.openWindow(targetUrl);
      }
    })
  );
});
