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
        name: 'Phonics Bread Catcher',
        short_name: 'Phonics Bread',
        description: 'Classroom phonics game: catch the letter breads in order to build each word',
        lang: 'en',
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
        // Precache mọi thứ cần để chơi offline (nhạc của resource pack nhỏ nên cache luôn)
        globPatterns: ['**/*.{js,css,html,png,json,woff2}', 'assets/{audio,music}/**/*.{ogg,mp3}'],
        maximumFileSizeToCacheInBytes: 4 * 1024 * 1024,
      },
    }),
  ],
  build: {
    target: 'es2022',
    // Bundle JS/CSS/font (tên có hash) để riêng ở /static — cache vĩnh viễn được (xem vercel.json).
    // /assets giữ cho ảnh / âm thanh của game (tên cố định, sinh bởi tools/).
    assetsDir: 'static',
    chunkSizeWarningLimit: 1600, // Phaser ~1.2MB
    rollupOptions: {
      output: {
        manualChunks: (id) => (id.includes('node_modules/phaser') ? 'phaser' : undefined),
      },
    },
  },
});
