# 🍞 Phonics Bread Catcher

Game phonics cho lớp mẫu giáo (~5 tuổi): bánh chữ rơi xuống, di chuyển rổ để **hứng đúng thứ tự
các chữ** ghép thành từ mục tiêu. Chạy trên web, cài được như app nhờ PWA; bố cục **dọc** cho điện thoại
và **ngang** cho máy chiếu lớp học / máy tính / tablet.
Giao diện trong game hoàn toàn bằng tiếng Anh.

Thiết kế chi tiết: [Phonics_Bread_Catcher_Game_Plan.md](Phonics_Bread_Catcher_Game_Plan.md)
(từ *Phonics Bread Catcher Full Resource Pack*).

## Tech stack

| Hạng mục      | Công nghệ                                                             |
| ------------- | --------------------------------------------------------------------- |
| Game engine   | Phaser 3 (WebGL / Canvas, Arcade Physics, Sound Manager + Web Audio)  |
| Ngôn ngữ      | TypeScript (strict)                                                   |
| App shell     | React 19 — màn Home / Setup / Results                                 |
| Bundler / dev | Vite                                                                  |
| PWA           | vite-plugin-pwa (manifest + service worker, chơi offline)             |
| Giọng đọc     | Web Speech API (đọc từ mục tiêu, không cần file ghi âm)               |
| Format code   | Prettier + EditorConfig                                               |
| Lưu dữ liệu   | localStorage (cài đặt âm thanh, form Setup gần nhất, điểm cao Solo)   |
| Asset         | PNG (hình), OGG + MP3 fallback (audio)                                |
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

## Cách chơi

- **Home:** `PLAY CLASS MODE` (3 đội) hoặc `PLAY SOLO MODE` (1 người) + bật/tắt SOUND · MUSIC · VOICE.
- **Setup:** chế độ, gói từ (Blending Words / Early Blending / Picture Vocabulary / Mixed Review),
  cấp độ, thời gian (AUTO / 45–120s, hoặc **tự nhập** 15–600 giây ở ô CUSTOM), tên đội
  (bỏ trống = LIONS / TIGERS / PANDAS). Lựa chọn được nhớ cho lần sau.
- **Magic Dice** (Class): thứ tự lượt được xáo **một lần** đầu buổi, xúc xắc chỉ hé lộ đội kế tiếp
  → mỗi đội chơi đúng 1 lần.
- **Một lượt:** `GET READY! 3-2-1-GO!` → tối đa **5 từ**. Hứng đúng lần lượt từng chữ; hứng nhầm
  **một** chữ là sang từ khác (từ sai được giữ lại để luyện sau). Đúng cả từ **+100**.
  Hết giờ thì lượt kết thúc ngay.
- **Pause** che tối sân chơi (chữ rơi bị ẩn); **Resume** luôn đếm ngược 3-2-1-GO.
  **Back / End Game** có hộp thoại xác nhận; kết thúc khi chưa đủ 3 đội thì về Setup,
  không hiện thống kê so sánh.
- **Final Results:** xếp hạng theo điểm → ít lần hứng nhầm hơn → còn nhiều thời gian hơn →
  đồng hạng. Mọi đội hạng nhất đều được mở **Winner's Gift** (nội dung quà đang là placeholder
  trong `src/session/rewards.ts`).

**Điều khiển:** mobile kéo ngang ở bất kỳ đâu (kéo tương đối, ngón tay không che rổ);
desktop dùng chuột hoặc ← → / A D, `P` / `Esc` để tạm dừng. Game tự dừng khi chuyển app.

### Từ vựng

Lấy toàn bộ phần **Phonics** của bảng học (M A S P T I N C O D) trong `src/data/phonics_word_bank.json`;
phần ESL của bảng không dùng.

| Gói                | Nội dung                                                          |
| ------------------ | ----------------------------------------------------------------- |
| BLENDING WORDS     | map, mop, man… + miss, cast (mặc định)                            |
| EARLY BLENDING     | am, at, it, in, on, ma                                            |
| PICTURE VOCABULARY | 68 từ tranh theo chữ cái (monkey, alligator, astronaut, dinosaur…) |
| MIXED REVIEW       | tất cả các gói trên                                               |

Từ dài (tới 9 chữ) tự thu nhỏ ô chữ cho vừa màn hình; nên chọn thời gian dài hơn cho gói từ tranh.

### Bố cục ngang (máy chiếu lớp học)

- Tự bật khi màn hình rộng hơn cao (máy tính nối máy chiếu, TV, tablet nằm ngang).
  Điện thoại xoay ngang vẫn chơi dọc và hiện lời nhắc xoay máy.
- Game: toạ độ cao 540, rộng 720–960 (4:3 → 16:9); HUD gọn 1 hàng, ô từ ở giữa, ảnh nền bản ngang;
  màn mở quà chia 2 cột.
- Màn React: Home / Setup chia 2 cột, Final Results xếp 3 đội nằm ngang; màn hình ≥ 1280×700 tự phóng to UI.
- Đổi hướng màn hình khi đang ở Home / Setup / Results thì game tự chuyển bố cục; đang chơi dở thì
  chờ hết phiên mới chuyển.

### Cấp độ

| Level  | Rơi (px/s) | Nhịp rơi | AUTO | Gợi ý                                 |
| ------ | ---------: | -------: | ---: | ------------------------------------- |
| GENTLE |         58 |  1750 ms |  90s | Hiện từ + chữ mờ trong từng ô          |
| EASY   |         72 |  1450 ms |  75s | Hiện từ, ô trống (mặc định)            |
| NORMAL |         92 |  1200 ms |  60s | Nghe phát âm, chỉ gợi ý chữ đầu        |
| FAST   |        115 |  1000 ms |  50s | Nghe phát âm, ô trống                  |
| HARD   |        100 |  1100 ms |  90s | Hiện từ + **logic troll**              |

Trình duyệt không có giọng đọc (hoặc tắt VOICE) thì NORMAL / FAST tự hiện từ để vẫn chơi được.

### Level HARD — logic troll

Giữ lại toàn bộ logic troll của bản Bread Catcher cũ, chỉnh cho game ghép chữ:

- Prank liên tục (hồi chiêu 3–6s): đảo điều khiển, rổ teo, `+500 BONUS!` giả, lộn ngược màn hình,
  tắt đèn, `TIME'S UP!` giả, gió thổi, động đất, mưa trứng, turbo.
- Nhân vật brainrot phá game: **Tung Tung Tung Sahur** (đập văng rổ), **Lirili Larila**
  (đóng băng rổ + ăn vụng chữ), **Tralalero Tralala** (đá văng chữ), **Bombardiro Crocodilo** (thả bom).
- 60% chữ "láo": chữ cần hứng né rổ, nảy ra khỏi rổ, lắc lư, tăng tốc, đổi thành chữ khác, dịch chuyển,
  tàng hình; chữ nhiễu bám theo rổ hoặc giả dạng chữ cần hứng rồi lộ mặt giữa đường.
- Hứng trứng / bom chỉ làm rổ choáng, **không** tính là hứng sai. Đã bỏ trò "thu thuế điểm" để
  kết quả giữa các đội vẫn công bằng.

Thông số ở `src/game/config/troll.ts`, logic ở `src/game/systems/troll/`.

## Cấu trúc

```text
src/
├── main.tsx
├── data/                    # JSON từ resource pack: game_config, phonics_word_bank, ui_text.en
├── shared/                  # tiện ích không phụ thuộc framework: store, random, speech, format
├── session/                 # "classroom shell" — logic buổi học, KHÔNG phụ thuộc React/Phaser
│   ├── sessionStore.ts      #   màn hiện tại + phiên chơi (React và Phaser cùng đọc)
│   ├── settings.ts          #   cấp độ, thời gian, luật
│   ├── content.ts           #   gói từ, bộ chữ nhiễu
│   ├── WordPool.ts          #   chọn từ ít lặp (từ đúng rút ra, từ sai luyện lại, sàn dự trữ 30%)
│   ├── ranking.ts           #   xếp hạng + tie-breaker, đội thắng
│   ├── teams.ts, rewards.ts, storage.ts, text.ts, types.ts
├── app/                     # React: Home / Setup / Results + component dùng chung
└── game/                    # Phaser
    ├── createGame.ts        #   config + danh sách scene
    ├── SceneDirector.ts     #   đổi scene theo màn hiện tại của sessionStore
    ├── bridge.ts            #   GameBridge: khoá input khi React mở, SFX cho nút React
    ├── config/              #   ⚙️ gameConfig, assets (SFX/nhạc/volume), stages, hazards, troll
    ├── core/                #   event bus của lượt chơi, key scene, service, view (toạ độ logic)
    ├── scenes/              #   Boot → Preload → Shell | TurnPicker → Game (+ Pause, TurnComplete) | Gift
    ├── objects/             #   PlayerBasket, FallingItem (pool), texture bánh chữ, brainrot
    ├── systems/             #   LetterSpawn, TurnTimer, Input, Effects, Audio, troll/
    └── ui/                  #   HUD, ô từ mục tiêu, đếm ngược, nút
```

**Luồng màn hình:** `home → setup → play → results → gift`. React vẽ home / setup / results
(Phaser vẽ nền động phía sau), `SceneDirector` chạy các scene Phaser cho play / gift.
Hai bên chỉ nói chuyện qua `appStore` và `GameBridge`.

**Độ phân giải:** toạ độ game là 360 × (640–800) khi dọc, (720–960) × 540 khi ngang, nhưng canvas
render gấp đôi (`RENDER_SCALE`) qua camera zoom → chữ học sắc nét, sprite pixel-art vẫn giữ chất pixel.
Code layout luôn dùng `view(scene)` / `isLandscape(scene)` (toạ độ logic), không dùng `scene.scale`;
vị trí HUD / ô từ ở `src/game/ui/layout.ts`.

**Import:** alias `@/` trỏ tới `src/` (khai báo ở `tsconfig.json` và `vite.config.ts`).

### Chỉnh game thường gặp

| Muốn…                               | Sửa                                              |
| ----------------------------------- | ------------------------------------------------ |
| Tốc độ / nhịp / thời gian mỗi level | `src/data/game_config.json`, HARD ở `session/settings.ts` |
| Thêm / sửa từ vựng                  | `src/data/phonics_word_bank.json`, gói ở `session/content.ts` |
| Chữ hiển thị                        | `src/data/ui_text.en.json`                       |
| Phần thưởng trong hộp quà           | `src/session/rewards.ts`                         |
| Nhịp rơi chữ cần hứng / chữ nhiễu   | `src/game/config/gameConfig.ts` (`SPAWN`)        |
| Trò troll của level HARD            | `src/game/config/troll.ts`                       |
| Volume                              | `src/game/config/assets.ts` (`VOLUME`)           |

## Asset pipeline

Tài nguyên gốc trong `_source/` (sprite sheet, WAV master của resource pack) — **không** đưa vào build.
Script Python sinh file dùng trong game ở `public/`:

```bash
pip install -r tools/requirements.txt
pnpm assets:sprites   # cắt sprite sheet + vẽ pixel-art bằng code -> public/assets/**.png + sprites.json + icon PWA
pnpm assets:audio     # WAV master -> public/assets/**/*.ogg + .mp3
```

- `tools/build_sprites.py`: toạ độ cắt từng sprite, kích thước, viền "sticker" cho vật rơi.
  Chỉ dùng khung / icon **không có chữ in sẵn** — chữ cái, tên đội, nhãn nút đều vẽ live trong game.
- `tools/phonics_art.py`: mascot 4 đội, xúc xắc, hộp quà, vương miện (vẽ bằng code).
- `tools/brainrot_art.py`: nhân vật brainrot của level HARD.
- `tools/build_audio.py`: encode BGM / SFX của resource pack (đã mix sẵn, không normalize lại).

## Deploy (Vercel)

Cấu hình sẵn trong `vercel.json`: cài bằng `pnpm install --frozen-lockfile`, build bằng
`pnpm run build`, xuất ra `dist/`. Chỉ cần import repo GitHub vào Vercel (hoặc chạy `vercel --prod`).

- Dùng **pnpm** (chỉ giữ `pnpm-lock.yaml`). Thêm / đổi package xong nhớ commit lại `pnpm-lock.yaml`,
  nếu không Vercel báo `ERR_PNPM_OUTDATED_LOCKFILE`.
- Vercel không chạy Python: ảnh / âm thanh trong `public/assets/` phải được sinh sẵn
  (`pnpm assets`) và commit lên.
- Cache: bundle JS/CSS/font có hash ở `/static` (cache 1 năm); tài nguyên game ở `/assets`
  (1 ngày, nhạc 7 ngày); `sw.js` và manifest luôn kiểm tra bản mới để PWA tự cập nhật.

## Credits

Xem [CREDITS.md](CREDITS.md).
