import { fileURLToPath, URL } from 'node:url';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  // Đường dẫn tương đối để deploy được ở bất kỳ thư mục con nào (itch.io, GitHub Pages...)
  base: './',
  resolve: {
    // import '@/game/...' thay cho '../../game/...' (khai báo tương ứng trong tsconfig.json > paths)
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icons/favicon.png', 'icons/apple-touch-icon.png'],
      manifest: {
        name: 'Bread Catcher',
        short_name: 'Bread Catcher',
        description: 'Cozy pixel-art bread catching game',
        lang: 'vi',
        display: 'fullscreen',
        orientation: 'portrait',
        start_url: './',
        scope: './',
        background_color: '#3b1a0b',
        theme_color: '#3b1a0b',
        icons: [
          { src: 'icons/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
          { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
          { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        // Precache mọi thứ cần để chơi offline, trừ nhạc nền (lớn)
        globPatterns: ['**/*.{js,css,html,png,json,woff,woff2}', 'assets/audio/**/*.{ogg,mp3}'],
        maximumFileSizeToCacheInBytes: 4 * 1024 * 1024,
        // Nhạc nền được cache khi phát lần đầu
        runtimeCaching: [
          {
            urlPattern: ({ url }) => url.pathname.includes('/assets/music/'),
            handler: 'CacheFirst',
            options: {
              cacheName: 'bread-catcher-music',
              expiration: { maxEntries: 16 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
        ],
      },
    }),
  ],
  build: {
    target: 'es2022',
    chunkSizeWarningLimit: 1600, // Phaser ~1.2MB
    rollupOptions: {
      output: {
        manualChunks: (id) => (id.includes('node_modules/phaser') ? 'phaser' : undefined),
      },
    },
  },
});
