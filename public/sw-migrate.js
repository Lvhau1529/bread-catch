/**
 * Nạp vào sw.js (vite.config.ts > workbox.importScripts).
 *
 * Bản cũ dùng registerType 'autoUpdate' và không có nút UPDATE: service worker mới (chế độ 'prompt')
 * sẽ nằm chờ mãi trên những máy đó cho tới khi đóng hết tab. Nhận ra bản cũ nhờ precache của nó có
 * `registerSW.js` (bản mới không còn file này) → kích hoạt ngay như trước, lần tải trang sau là bản mới.
 * Xoá được khi chắc mọi máy đã lên bản có nút UPDATE.
 */
self.addEventListener('install', (event) => {
  event.waitUntil(
    (async () => {
      const names = (await caches.keys()).filter((name) => name.startsWith('workbox-precache'));
      for (const name of names) {
        const requests = await (await caches.open(name)).keys();
        if (requests.some((request) => new URL(request.url).pathname.endsWith('/registerSW.js'))) {
          await self.skipWaiting();
          return;
        }
      }
    })(),
  );
});
