# 🎮 Phonics Arcade

Bộ game phonics cho lớp mẫu giáo (~5 tuổi) chạy trên web, cài được như app nhờ PWA; bố cục **dọc** cho
điện thoại và **ngang** cho máy chiếu lớp học / máy tính / tablet. Mở app là **màn chọn game**; mỗi game
là một module độc lập, thêm game mới không phải sửa game cũ.

| Game | Mô tả | Tài liệu |
| --- | --- | --- |
| 🍞 **Bread Catcher** | Di chuyển rổ hứng bánh chữ theo đúng thứ tự để ghép từ. Class 3 đội / Solo. | [docs/bread-catcher](docs/bread-catcher/README.md) |
| 🍩 **Food Stream** | Livestream ăn uống: nghe âm / từ, cho streamer ăn đúng món chữ cái / tranh. Classroom 2 đội / Solo, 7 kiểu câu hỏi. | [docs/food-stream](docs/food-stream/README.md) |

Giao diện trong game hoàn toàn bằng tiếng Anh; riêng phần **Hướng dẫn** (nút GUIDE ở màn chính của mỗi game,
nút "?" cạnh từng mục ở Setup) viết bằng tiếng Việt cho giáo viên / phụ huynh.

## Tech stack

| Hạng mục      | Công nghệ                                                              |
| ------------- | ---------------------------------------------------------------------- |
| Game engine   | Phaser 3 (WebGL / Canvas, Arcade Physics, Sound Manager + Web Audio)   |
| Ngôn ngữ      | TypeScript (strict)                                                    |
| App shell     | React 19 — màn chọn game + màn Home / Setup / Results của từng game    |
| Bundler / dev | Vite (mỗi game một chunk tải động)                                     |
| PWA           | vite-plugin-pwa (manifest + service worker, chơi offline)              |
| Nội dung      | JSON + Zod (kiểm tra gói nội dung của Food Stream)                     |
| Giọng đọc     | Web Speech API (đọc âm / từ, không cần file ghi âm)                    |
| Format code   | Prettier + EditorConfig                                                |
| Lưu dữ liệu   | localStorage (`phonics-arcade:prefs`, `phonics-arcade:<game-id>`)       |
| Asset         | PNG (hình), OGG + MP3 fallback (audio) — sinh bằng script Python        |
| Font          | Baloo 2 (giao diện), Andika (chữ cái / từ vựng — font cho trẻ tập đọc) |

## Chạy

```bash
pnpm install
pnpm dev          # http://localhost:5173 (có --host để mở từ điện thoại cùng mạng LAN)
pnpm build        # typecheck + build vào dist/
pnpm preview      # chạy thử bản build (có service worker)
pnpm typecheck
pnpm format       # Prettier
```

Link mở thẳng một game: `/#/bread-catcher`, `/#/food-stream` (nút Back của trình duyệt / Android quay về
màn chọn game).

## Kiến trúc

```text
src/
├── main.tsx                 # font, CSS chung, <PlatformApp games={GAMES} />
├── shared/                  # tiện ích thuần TS: createStore, random, speech (Web Speech), format
├── platform/                # KHUNG DÙNG CHUNG — không biết gì về từng game
│   ├── PlatformApp.tsx      #   màn chọn game ↔ game đang mở (React.lazy, báo lỗi khi tải hỏng)
│   ├── platformStore.ts     #   game đang mở, đồng bộ URL hash
│   ├── types.ts             #   GameManifest: hợp đồng giữa platform và một game
│   ├── hub/                 #   màn chọn game
│   ├── prefs.ts, storage.ts #   cài đặt âm thanh chung, localStorage an toàn theo từng game
│   ├── audio/               #   1 AudioContext cho cả app, thư viện SFX chung, phát SFX từ React
│   ├── phaser/              #   PhaserHost (mount / khoá input), createPhaserGame, viewport + view
│   │                        #   (toạ độ logic, render ×2), AudioSystem (nhạc + duck), font, chữ sắc nét
│   ├── ui/                  #   Button, OptionGroup, Field, NameInput, AudioToggles, RotateHint, GuideDialog
│   ├── pwa/                 #   nút cập nhật khi có bản deploy mới
│   └── styles/              #   CSS chung (theme bằng biến CSS, game ghi đè trên class gốc)
└── games/
    ├── index.ts             # danh sách game ở màn chọn game
    ├── bread-catcher/       # xem docs/bread-catcher
    └── food-stream/         # xem docs/food-stream
```

Mỗi game tự chứa: `manifest.ts` (thẻ game + `load: () => import(root)`), root component (Phaser + màn React),
store / luật chơi thuần TS (`session/`), màn React (`app/`), Phaser (`game/`), CSS riêng (class có tiền tố
của game), nội dung, dữ liệu lưu riêng. React và Phaser của một game chỉ nói chuyện qua store của game đó.

**Độ phân giải:** toạ độ game là 360 × (640–800) khi dọc, (720–960) × 540 khi ngang, canvas render gấp đôi
(`RENDER_SCALE`) qua camera zoom → chữ học sắc nét. Code layout luôn dùng `view(scene)` / `isLandscape(scene)`
(`src/platform/phaser/view.ts`). Đổi hướng màn hình ở màn React thì game tự dựng lại theo bố cục mới;
đang chơi dở thì chờ hết phiên.

**Import:** alias `@/` trỏ tới `src/` (khai báo ở `tsconfig.json` và `vite.config.ts`).

### Thêm một game mới

1. Tạo `src/games/<id>/` với root component (dùng `PhaserHost` + `createPhaserGame`, `useGameOrientation`,
   `GuideDialog`...) và `manifest.ts` (`id` dùng cho URL và key lưu trữ — không đổi sau khi phát hành).
2. Thêm manifest vào `src/games/index.ts`.
3. Asset vào `public/assets/<id>/` (script sinh ở `tools/<id>/`), ảnh bìa 16:9 `public/assets/<id>/cover.png`.
4. Lưu dữ liệu bằng `gameStorageKey('<id>')`; âm thanh / giọng đọc theo `prefsStore` chung.

## Asset pipeline

Tài nguyên gốc trong `_source/<game>/` (sprite sheet / art board, WAV master của resource pack) — **không** đưa
vào build. Script Python sinh file dùng trong game ở `public/assets/`:

```bash
pip install -r tools/requirements.txt
pnpm assets:bread         # Bread Catcher: cắt sprite + vẽ pixel-art bằng code -> public/assets/bread-catcher
pnpm assets:food-stream   # Food Stream: cắt art board -> public/assets/food-stream + src/games/food-stream/sprites.json
pnpm assets:audio         # mọi WAV master -> .ogg + .mp3 (SFX chung -> public/assets/shared/sfx)
pnpm assets:icons         # icon PWA / favicon "Ab" (font Baloo 2, màu màn chọn game) -> public/icons
pnpm assets               # chạy cả bốn
```

- `tools/common/`: xử lý ảnh dùng chung (làm sạch alpha, cắt sát, resize, viền sticker), đường dẫn.
- `tools/bread_catcher/`: `build_sprites.py` (toạ độ cắt, ảnh bìa), `phonics_art.py`, `brainrot_art.py`.
- `tools/food_stream/build_sprites.py`: toạ độ cắt nhân vật / món ăn / đạo cụ / tranh, huy hiệu che chữ in sẵn,
  frame cắn, ảnh bìa.
- `tools/build_audio.py`: bảng nguồn -> đích cho mọi game (đã mix sẵn, không normalize lại).
- `tools/build_app_icons.py`: icon app của cả Phonics Arcade (cần `pnpm install` trước để có font Baloo 2).
- Chỉ dùng khung / icon **không có chữ in sẵn** (hoặc che chữ in sẵn) — chữ cái, tên đội, nhãn nút vẽ live.

## Deploy (Vercel)

Cấu hình sẵn trong `vercel.json`: cài bằng `pnpm install --frozen-lockfile`, build bằng
`pnpm run build`, xuất ra `dist/`. Chỉ cần import repo GitHub vào Vercel (hoặc chạy `vercel --prod`).

- Dùng **pnpm** (chỉ giữ `pnpm-lock.yaml`). Thêm / đổi package xong nhớ commit lại `pnpm-lock.yaml`,
  nếu không Vercel báo `ERR_PNPM_OUTDATED_LOCKFILE`.
- Vercel không chạy Python: ảnh / âm thanh trong `public/assets/` phải được sinh sẵn
  (`pnpm assets`) và commit lên.
- Cache: bundle JS/CSS/font có hash ở `/static` (cache 1 năm); ảnh / SFX ở `/assets` (1 ngày),
  nhạc 7 ngày; `sw.js` và manifest luôn kiểm tra bản mới. Service worker precache mọi game để chơi offline.
- Cập nhật PWA (`src/platform/pwa/`): deploy xong, máy người dùng phát hiện `sw.js` mới khi mở / tải lại
  trang, quay lại tab, hoặc mỗi 30 phút → màn chọn game hiện nút **NEW VERSION! UPDATE** (không tự reload
  giữa ván). Mã bản build (`version · commit`) ghi ở cuối phần Hướng dẫn của mỗi game.

## Credits

Xem [CREDITS.md](CREDITS.md).
