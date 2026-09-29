import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
// Chỉ nạp subset cần dùng để bản build (và cache offline của PWA) nhẹ hơn
import '@fontsource/pixelify-sans/latin-400.css';
import '@fontsource/pixelify-sans/latin-700.css';
// Font cho màn "game làm bánh" giả (có dấu tiếng Việt)
import '@fontsource/baloo-2/latin-500.css';
import '@fontsource/baloo-2/latin-700.css';
import '@fontsource/baloo-2/latin-800.css';
import '@fontsource/baloo-2/vietnamese-500.css';
import '@fontsource/baloo-2/vietnamese-700.css';
import '@fontsource/baloo-2/vietnamese-800.css';
import '@/app/styles.css';
import App from '@/app/App';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
