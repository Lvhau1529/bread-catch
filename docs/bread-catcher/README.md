# 🍞 Bread Catcher

Bánh chữ rơi xuống, di chuyển rổ để **hứng đúng thứ tự các chữ** ghép thành từ mục tiêu.
Thiết kế chi tiết: [GAME_PLAN.md](GAME_PLAN.md) (từ *Phonics Bread Catcher Full Resource Pack*).
Code: `src/games/bread-catcher/` — khung chung (màn chọn game, âm thanh, nút...) xem [README gốc](../../README.md).

## Cách chơi

- **Home:** `PLAY` (vào Setup, chọn CLASS MODE 3 đội hoặc SOLO MODE 1 người) + bật/tắt SOUND · MUSIC · VOICE.
- **Setup:** chế độ, gói từ (Blending Words / Early Blending / Picture Vocabulary / Mixed Review),
  cấp độ, thời gian (AUTO / 45–120s, hoặc **tự nhập** 15–600 giây ở ô CUSTOM), tên đội
  (bỏ trống = LIONS / TIGERS / PANDAS). Lựa chọn được nhớ cho lần sau.
- **Magic Dice** (Class): thứ tự lượt được xáo **một lần** đầu buổi, xúc xắc chỉ hé lộ đội kế tiếp
  → mỗi đội chơi đúng 1 lần. Lượt cuối chỉ còn 1 đội nên không đổ: hiện luôn `LAST TEAM` + `START`.
- **Một lượt:** `GET READY! 3-2-1-GO!` → tối đa **5 từ**. Hứng đúng lần lượt từng chữ; hứng nhầm
  **một** chữ là sang từ khác (từ sai được giữ lại để luyện sau). Đúng cả từ **+100**.
  Hết giờ thì lượt kết thúc ngay.
- **Pause** che tối sân chơi (chữ rơi bị ẩn); **Resume** luôn đếm ngược 3-2-1-GO.
  **Back / End Game** có hộp thoại xác nhận; kết thúc khi chưa đủ 3 đội thì về Setup,
  không hiện thống kê so sánh.
- **Final Results:** xếp hạng theo điểm → ít lần hứng nhầm hơn → còn nhiều thời gian hơn →
  đồng hạng. Mọi đội hạng nhất đều được mở **Winner's Gift** (nội dung quà đang là placeholder
  trong `src/games/bread-catcher/session/rewards.ts`).
- **Class Leaderboard:** tổng điểm các đội qua nhiều buổi được lưu localStorage (theo vị trí TEAM 1/2/3,
  đổi tên vẫn giữ điểm). Ở Final Results bảng hiện thứ tự cũ rồi trượt sang thứ tự mới — đội vượt hạng
  có "▲ RANK UP!". Nút **RESET SCORES** (có xác nhận) ở Final Results và Setup.
- Tên đội / cài đặt Setup được lưu ngay khi gõ, mở lại app vẫn còn. Tên quá dài tự cắt "…" ở mọi màn.

**Điều khiển:** mobile kéo ngang ở bất kỳ đâu (kéo tương đối, ngón tay không che rổ);
desktop dùng chuột hoặc ← → / A D, `P` / `Esc` để tạm dừng. Game tự dừng khi chuyển app.

### Từ vựng

Lấy toàn bộ phần **Phonics** của bảng học (M A S P T I N C O D) trong `src/games/bread-catcher/data/phonics_word_bank.json`;
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

Thông số ở `game/config/troll.ts`, logic ở `game/systems/troll/`.

## Cấu trúc module

```text
src/games/bread-catcher/
├── manifest.ts              # thẻ game ở màn chọn game + import động
├── BreadCatcherGame.tsx     # root: Phaser + màn React phủ lên
├── styles.css
├── data/                    # JSON từ resource pack: game_config, phonics_word_bank, ui_text.en
├── session/                 # logic buổi học, KHÔNG phụ thuộc React/Phaser
│   ├── sessionStore.ts      #   màn hiện tại + phiên chơi (React và Phaser cùng đọc)
│   ├── settings.ts          #   cấp độ, thời gian, luật
│   ├── content.ts           #   gói từ, bộ chữ nhiễu
│   ├── WordPool.ts          #   chọn từ ít lặp (từ đúng rút ra, từ sai luyện lại, sàn dự trữ 30%)
│   ├── ranking.ts           #   xếp hạng + tie-breaker, đội thắng
│   ├── leaderboard.ts, teams.ts, rewards.ts, storage.ts, text.ts, types.ts
├── app/                     # React: Home / Setup / Results, Leaderboard, TimeInput, nội dung Hướng dẫn
└── game/                    # Phaser
    ├── createGame.ts, SceneDirector.ts
    ├── config/              #   gameConfig, assets (nhạc), stages, hazards, troll
    ├── core/                #   event bus của lượt chơi, key scene, service
    ├── scenes/              #   Boot → Preload → Shell | TurnPicker → Game (+ Pause, TurnComplete) | Gift
    ├── objects/, systems/ (troll/), ui/
```

**Luồng màn hình:** `home → setup → play → results → gift`. React vẽ home / setup / results
(Phaser vẽ nền động phía sau), `SceneDirector` chạy các scene Phaser cho play / gift.

### Chỉnh game thường gặp (đường dẫn trong `src/games/bread-catcher/`)

| Muốn…                               | Sửa                                              |
| ----------------------------------- | ------------------------------------------------ |
| Tốc độ / nhịp / thời gian mỗi level | `data/game_config.json`, HARD ở `session/settings.ts` |
| Thêm / sửa từ vựng                  | `data/phonics_word_bank.json`, gói ở `session/content.ts` |
| Chữ hiển thị                        | `data/ui_text.en.json`                           |
| Phần thưởng trong hộp quà           | `session/rewards.ts`                             |
| Nhịp rơi chữ cần hứng / chữ nhiễu   | `game/config/gameConfig.ts` (`SPAWN`)            |
| Trò troll của level HARD            | `game/config/troll.ts`                           |
| Nhạc nền / volume                   | `game/config/assets.ts` (SFX dùng chung: `src/platform/audio/sfx.ts`) |
