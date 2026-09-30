import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
// Chỉ nạp subset cần dùng để bản build (và cache offline của PWA) nhẹ hơn
// Baloo 2: chữ giao diện
import '@fontsource/baloo-2/latin-600.css';
import '@fontsource/baloo-2/latin-700.css';
import '@fontsource/baloo-2/latin-800.css';
// Có dấu tiếng Việt cho phần Hướng dẫn (chỉ tải khi trang thật sự dùng chữ tiếng Việt)
import '@fontsource/baloo-2/vietnamese-600.css';
import '@fontsource/baloo-2/vietnamese-700.css';
import '@fontsource/baloo-2/vietnamese-800.css';
// Andika: chữ học (chữ cái, từ vựng) — font dành cho trẻ tập đọc
import '@fontsource/andika/latin-700.css';
import '@/app/styles.css';
import App from '@/app/App';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
