# BREAD CATCHER — GAME DEVELOPMENT PLAN

> **Phiên bản:** V1  
> **Engine:** Phaser.js 3.x  
> **Thể loại:** Casual / Arcade / Catching Game  
> **Phong cách:** Pixel Art — Cute Bakery — Cozy Arcade  
> **Nền tảng ưu tiên:** Web HTML5, chạy tốt trên mobile và desktop  
> **Mục tiêu gameplay:** Hứng bánh mì → ghi điểm → combo → lên level → bánh/rổ/background đẹp hơn → độ khó tăng dần.

---

# 1. CONCEPT CHỐT

Người chơi điều khiển một chiếc rổ ở đáy màn hình để hứng bánh mì và các vật phẩm tốt rơi từ trên xuống.

Điểm đặc trưng của game không chỉ là “hứng bánh để cộng điểm” mà là **tiến trình nâng cấp trực quan ngay trong một lượt chơi**:

```text
Hứng bánh
   ↓
Tăng điểm
   ↓
Combo
   ↓
Progress Bar
   ↓
Level Up
   ↓
Mở bánh mới / rổ mới / background mới
   ↓
Tăng độ khó
   ↓
Tiếp tục chơi
```

Khi đủ điểm, người chơi sẽ thấy:
- bánh mì đẹp và cao cấp hơn;
- rổ hứng được nâng cấp;
- bối cảnh tiệm bánh thay đổi;
- item hiếm xuất hiện;
- tốc độ và mật độ vật thể tăng.

---

# 2. THÔNG SỐ GAME

## 2.1. Viewport

Khuyến nghị:

```js
width: 360,
height: 640,
pixelArt: true,
roundPixels: true
```

Phaser Scale:

```js
mode: Phaser.Scale.FIT,
autoCenter: Phaser.Scale.CENTER_BOTH
```

Game ưu tiên màn hình dọc để phù hợp điện thoại.

---

# 3. SCENE STRUCTURE

```text
BootScene
PreloadScene
MenuScene
GameScene
GameOverScene
```

Có thể bổ sung sau V1:

```text
UpgradeScene
CollectionScene
SettingsScene
```

---

# 4. GAME FLOW

```text
Loading
  ↓
Main Menu
  ↓
PLAY
  ↓
Gameplay
  ↓
Catch / Miss / Bonus / Hazard
  ↓
Score + Combo + Progress
  ↓
Level Up
  ↓
Upgrade Visual
  ↓
Difficulty tăng
  ↓
Life = 0
  ↓
Game Over
  ↓
Retry / Home
```

---

# 5. PLAYER — BASKET

Rổ chỉ di chuyển ngang.

## Desktop
- Arrow Left / Right
- A / D
- Mouse

## Mobile
- Touch
- Drag ngang

Không để basket ra khỏi màn hình.

---

# 6. BASKET UPGRADE

| Tier | Asset | Đặc điểm | Hitbox đề xuất |
|---|---|---|---:|
| 1 | basket_01 | Rổ mây đơn giản | 74 px |
| 2 | basket_02 | Rổ khăn caro | 82 px |
| 3 | basket_03 | Rổ trang trí nơ | 90 px |
| 4 | basket_04 | Rổ premium vàng/hồng | 100 px |

Upgrade basket vừa đổi ngoại hình vừa tăng vùng hứng để người chơi cảm nhận được sức mạnh.

---

# 7. BREAD SYSTEM

| Tier | Asset | Loại bánh | Base Score |
|---|---|---|---:|
| 1 | bread_01 | Bánh tròn | +10 |
| 2 | bread_02 | Baguette | +15 |
| 3 | bread_03 | Sandwich loaf | +20 |
| 4 | bread_04 | Premium pastry | +30 |

Khi unlock tier mới, tier cũ **không biến mất**.

Ví dụ Level 4 có thể spawn cả Bread Tier 1–3.

---

# 8. ITEM SYSTEM

## Item tốt

| Item | File | Hiệu ứng |
|---|---|---|
| Butter | butter.png | +25 |
| Jam | jam.png | +30 |
| Cheese | cheese.png | +20 |
| Wheat | wheat.png | +20 |
| Coin | coin.png | +50 |
| Star | star.png | x2 Score trong 5 giây |
| Heart | heart.png | +1 Life, tối đa 3 |

## Item xấu

| Item | File | Hiệu ứng |
|---|---|---|
| Burnt Bread | bread_burnt.png | -20 score |
| Moldy Bread | bread_moldy.png | Basket speed còn 70% trong 3 giây |
| Broken Egg | egg_broken.png | -1 Heart |

---

# 9. LIFE SYSTEM

Khởi đầu:

```text
❤️ ❤️ ❤️
```

Mất 1 life khi:
- bỏ lỡ bánh thường;
- hứng Broken Egg.

Không mất life khi bỏ lỡ:
- Coin;
- Star;
- Heart;
- Bonus item.

Khi:

```text
Life = 0
```

→ Game Over.

---

# 10. SCORE & COMBO

## Base Combo

```text
5 catch liên tục  → x2
10 catch          → x3
20 catch          → x4
```

Ví dụ:

```text
Bread Tier 1 = 10
Combo x3
Score nhận = 30
```

Miss một bánh thường:

```text
combo = 0
```

Hiển thị gần basket:

```text
COMBO x3
+30
```

---

# 11. LEVEL PROGRESSION

| Level | Tổng điểm yêu cầu |
|---:|---:|
| 1 | 0 |
| 2 | 100 |
| 3 | 300 |
| 4 | 600 |
| 5 | 1,000 |
| 6 | 1,500 |
| 7 | 2,100 |
| 8 | 2,800 |
| 9 | 3,600 |
| 10 | 4,500 |

## Unlock đề xuất

```text
LV1  → Basket 1 + Bread 1
LV2  → Bread 2
LV3  → Basket 2
LV4  → Background 2
LV5  → Bread 3
LV6  → Basket 3
LV7  → Rare Items tăng
LV8  → Background 3
LV9  → Bread 4
LV10 → Basket 4
```

---

# 12. DIFFICULTY CURVE

| Level | Fall Speed | Spawn Interval |
|---:|---:|---:|
| 1 | 100 | 1200 ms |
| 2 | 115 | 1100 ms |
| 3 | 130 | 1000 ms |
| 4 | 145 | 900 ms |
| 5 | 160 | 850 ms |
| 6 | 175 | 800 ms |
| 7 | 190 | 750 ms |
| 8+ | 205+ | 700 ms |

Không giảm spawn interval xuống dưới khoảng:

```text
550 ms
```

---

# 13. SPAWN PROBABILITY

## Early Game

```text
Bread       85%
Bonus        8%
Bad Item     5%
Rare         2%
```

## Sau Level 5

```text
Bread       75%
Bonus       10%
Bad Item    10%
Rare         5%
```

Rare:
- Star
- Heart
- Coin
- Premium Bread

---

# 14. BACKGROUND PROGRESSION

## Stage 1 — Cozy Bakery Kitchen
Dùng cho:

```text
LV1–LV3
```

## Stage 2 — Village Bakery
Dùng cho:

```text
LV4–LV7
```

## Stage 3 — Premium Pastry Shop
Dùng cho:

```text
LV8+
```

Transition:

```text
fade out
→ đổi background
→ fade in
```

Khoảng 500–700 ms.

---

# 15. LEVEL-UP SEQUENCE

Khi đủ điểm:

```text
Game slow ngắn
↓
Sparkle
↓
Catch Burst
↓
LEVEL UP!
↓
Hiện unlock mới
↓
Đổi bread / basket / background nếu có
↓
SFX Level Up
↓
Tiếp tục game
```

Tổng thời gian:

```text
1.0–1.5 giây
```

---

# 16. HUD

Layout gợi ý:

```text
❤️❤️❤️                 LV 03

             SCORE
              245

       [=======-------]
            245 / 300
```

`BEST` không cần hiện liên tục trong gameplay.

Best Score chỉ hiển thị:
- Menu
- Game Over

---

# 17. GAME OVER

```text
GAME OVER

SCORE
1,230

BEST
2,450

LEVEL
06

[ RETRY ]
[ HOME ]
```

Nếu lập kỷ lục mới:

```text
✨ NEW BEST! ✨
```

---

# 18. VFX / GAME FEEL

Mỗi lần catch nên chạy cùng lúc:

```text
basket squash
+
bread disappear animation
+
small sparkle
+
score popup
+
sound effect
```

Basket squash:

```text
scaleY 1
→ 0.90
→ 1.05
→ 1
```

Thời gian:

```text
~150 ms
```

Bad item:

```js
this.cameras.main.shake(100, 0.004);
```

Score popup:
- bay lên khoảng 20 px;
- fade out;
- duration 300–500 ms.

---

# 19. PHYSICS

Dùng:

```text
Phaser.Physics.Arcade
```

Không cần Matter.js.

Basket:

```text
immovable = true
allowGravity = false
```

Collision:

```js
this.physics.add.overlap(
    basket,
    items,
    handleCatch
);
```

---

# 20. OBJECT POOL

Không create/destroy item liên tục.

Dùng Phaser Group và recycle object để mobile chạy ổn định hơn.

---

# 21. SAVE DATA

Dùng:

```text
localStorage
```

V1 lưu:

```json
{
  "bestScore": 1350,
  "highestLevel": 7,
  "sound": true,
  "music": true
}
```

Có thể mở rộng sau:

```text
coins
skins
achievements
collections
```

---

# 22. PROJECT STRUCTURE

```text
src/
│
├── main.js
│
├── scenes/
│   ├── BootScene.js
│   ├── PreloadScene.js
│   ├── MenuScene.js
│   ├── GameScene.js
│   └── GameOverScene.js
│
├── objects/
│   ├── PlayerBasket.js
│   └── FallingItem.js
│
├── systems/
│   ├── SpawnSystem.js
│   ├── ScoreSystem.js
│   ├── LevelSystem.js
│   └── AudioSystem.js
│
└── config/
    ├── gameConfig.js
    ├── levels.js
    └── items.js
```

---

# 23. ASSET STRUCTURE

```text
assets/
│
├── backgrounds/
│   ├── bg_bakery_01.png
│   ├── bg_bakery_02.png
│   └── bg_bakery_03.png
│
├── bread/
│   ├── bread_01.png
│   ├── bread_02.png
│   ├── bread_03.png
│   └── bread_04.png
│
├── basket/
│   ├── basket_01.png
│   ├── basket_02.png
│   ├── basket_03.png
│   └── basket_04.png
│
├── items/
│   ├── butter.png
│   ├── jam.png
│   ├── cheese.png
│   ├── wheat.png
│   ├── coin.png
│   ├── star.png
│   ├── heart.png
│   ├── bread_burnt.png
│   ├── bread_moldy.png
│   └── egg_broken.png
│
├── ui/
│   ├── btn_play.png
│   ├── btn_pause.png
│   ├── btn_retry.png
│   ├── btn_home.png
│   ├── btn_next.png
│   ├── icon_sound.png
│   ├── icon_sound_off.png
│   ├── icon_settings.png
│   ├── score_panel.png
│   ├── level_panel.png
│   ├── progress_frame.png
│   └── level_up.png
│
├── fx/
│   ├── sparkle.png
│   └── catch_flash.png
│
├── audio/
│   └── sfx/
│
└── music/
```

---

# 24. TÀI NGUYÊN ĐỒ HỌA ĐÃ CHỐT

Hiện concept đã có đủ 3 nhóm artwork chính:

1. **Gameplay Sprite Sheet**
   - 4 Bread
   - 4 Basket
   - Bonus Items
   - Hazard Items
   - Sparkle / Catch FX

2. **UI Sprite Sheet**
   - PLAY
   - PAUSE
   - RETRY
   - HOME
   - NEXT
   - Sound
   - Settings
   - Score
   - Best
   - Level
   - Progress Bar
   - LEVEL UP
   - Number 0–9

3. **Background Pack**
   - Cozy Bakery Kitchen
   - Village Bakery
   - Premium Pastry Shop

## Việc cần làm với artwork

Không dùng trực tiếp nguyên sprite sheet trong game.

Cần:
- crop từng sprite;
- giữ PNG alpha;
- thống nhất padding;
- resize về kích thước game;
- đặt tên theo cấu trúc asset ở mục 23.

---

# 25. BGM — CHỐT CHO V1

## BGM CHÍNH: cute/cozy music pack 2 — 1144ghost

**Đây là lựa chọn mặc định cho V1.**

Nguồn:

https://1144ghost.itch.io/cutycozy-music-pack-2

Pack gồm 10 track WAV.

Tác giả cho phép dùng trong game, kể cả thương mại, với yêu cầu credit:

```text
Music by 1144ghost on itch.io
```

Tác giả ghi rõ không dùng generative AI cho music pack.

### Việc cần tải

Tải toàn bộ:

```text
track 1.wav
track 2.wav
track 3.wav
track 4.wav
track 5.wav
track 6.wav
track 7.wav
track 8.wav
track 9.wav
track 10.wav
```

Sau khi nghe thử, chọn 4 track:

```text
bgm_menu
bgm_stage_01
bgm_stage_02
bgm_stage_03
```

Không cần đưa cả 10 track vào build.

### File cuối cùng trong game

Convert track được chọn sang `.ogg`:

```text
assets/music/
├── bgm_menu.ogg
├── bgm_stage_01.ogg
├── bgm_stage_02.ogg
└── bgm_stage_03.ogg
```

### Volume

```text
BGM = 0.18–0.28
```

Mặc định đề xuất:

```js
volume: 0.22
```

---

# 26. BGM DỰ PHÒNG MIỄN PHÍ

## cute/cozy music pack — 1144ghost

Nguồn:

https://1144ghost.itch.io/cutecozy-music-pack

Có 6 track WAV.

Dùng khi cần thêm nhạc cho:
- Menu;
- Pause;
- Collection;
- Stage phụ.

Credit:

```text
Music by 1144ghost on itch.io
```

**Không bắt buộc tải cho V1 nếu pack 2 đã đủ.**

---

# 27. BGM PREMIUM — OPTIONAL

## Café Cozy — Wholesome Shop Music

Nguồn:

https://wobwobrob.itch.io/cafe-cozy

Giá hiện tại trên trang nguồn:

```text
$10 USD hoặc hơn
```

Pack có:
- 16 music loops;
- 12 musical stingers.

Rất phù hợp nếu sau này muốn soundtrack thống nhất hoàn toàn theo chủ đề bakery/shop.

Các track đáng chú ý:

```text
Opening Hour
Family Recipe
Pop Shop
Sweet Tooth
Star Buy
New Day
Coffee Trail
```

Map gợi ý:

```text
Menu      → Opening Hour
Stage 1   → Family Recipe
Stage 2   → Pop Shop
Stage 3   → Sweet Tooth
Unlock    → Star Buy
```

Credit đề xuất của tác giả:

```text
Music by Wob Wob Rob
```

**Không cần mua cho MVP/V1.**

---

# 28. SFX — CHỐT CHO V1

Mục tiêu là chỉ dùng khoảng 12–15 SFX để game gọn nhưng vẫn có feedback tốt.

---

## 28.1. Bread Catch

Nguồn:

https://pixabay.com/sound-effects/search/item-collect/

Tìm và tải:

```text
Item Pickup – Game UI Collect SFX
```

Dùng làm sound gốc.

Tạo 3 variation:

```text
bread_catch_01.ogg
bread_catch_02.ogg
bread_catch_03.ogg
```

Có thể tạo variation bằng pitch:

```text
0.95
1.00
1.05
```

---

# 29. COIN

Nguồn:

https://pixabay.com/sound-effects/search/coin%20collect/

Ưu tiên:

```text
Retro Coin 1
```

hoặc:

```text
Coin Collect (3)
```

File cuối:

```text
coin_collect.ogg
```

---

# 30. STAR / RARE ITEM

Nguồn:

https://pixabay.com/sound-effects/search/sparkle%20magic/

Ưu tiên:

```text
Sound Effect: Twinkle/Sparkle
```

hoặc:

```text
Magic Twinkle
```

File cuối:

```text
star_collect.ogg
```

Có thể dùng cùng nhóm âm này cho rare item.

---

# 31. HEART

Có thể dùng một variation cao tone hơn của Magic Twinkle.

File:

```text
heart_collect.ogg
```

Không cần tải một source riêng nếu muốn giảm số lượng tài nguyên.

---

# 32. UI CLICK

Nguồn:

https://mixkit.co/free-sound-effects/click/

Tải:

```text
Select click
```

File:

```text
ui_click.ogg
```

Dùng cho:
- Settings
- Pause
- Home
- các button nhỏ.

---

# 33. UI CONFIRM

Cùng nguồn:

https://mixkit.co/free-sound-effects/click/

Ưu tiên:

```text
Quick positive video game notification interface
```

File:

```text
ui_confirm.ogg
```

Dùng cho:
- PLAY
- NEXT
- Confirm.

---

# 34. UI CANCEL

Cùng nguồn:

https://mixkit.co/free-sound-effects/click/

Tải:

```text
Negative tone interface tap
```

File:

```text
ui_cancel.ogg
```

Dùng cho:
- Close
- Cancel
- Back.

---

# 35. LEVEL UP

Nguồn:

https://mixkit.co/free-sound-effects/game/

Tải:

```text
Game level completed
```

File:

```text
level_up.ogg
```

Kết hợp với sparkle visual.

---

# 36. BAD ITEM

Nguồn:

https://mixkit.co/free-sound-effects/wrong/

Ưu tiên:

```text
Funny fail low tone
```

hoặc:

```text
Failure arcade alert notification
```

File:

```text
bad_item.ogg
```

---

# 37. GAME OVER

Nguồn:

https://mixkit.co/free-sound-effects/wrong/

Tải:

```text
Player losing or failing
```

File:

```text
game_over.ogg
```

---

# 38. COMBO

Không nhất thiết cần tải riêng.

Có thể reuse `bread_catch` và tăng pitch theo combo:

```text
Normal → pitch 1.00
Combo x2 → 1.05
Combo x3 → 1.10
Combo x4 → 1.15
```

Nếu muốn sound riêng, chọn một short positive notification từ:

https://mixkit.co/free-sound-effects/game/

File:

```text
combo.ogg
```

---

# 39. MISS BREAD

V1 có thể dùng sound nhẹ tự tạo từ:
- soft tap;
- low pop;
- short muted thud.

Không dùng buzzer lớn vì sẽ phá vibe cozy.

File:

```text
miss.ogg
```

Nếu chưa tìm được sound phù hợp, V1 có thể **không phát âm miss**, chỉ:
- giảm life;
- shake nhẹ;
- heart animation.

---

# 40. AUDIO DIRECTORY CUỐI CÙNG

Sau khi tải và convert:

```text
assets/
│
├── music/
│   ├── bgm_menu.ogg
│   ├── bgm_stage_01.ogg
│   ├── bgm_stage_02.ogg
│   └── bgm_stage_03.ogg
│
└── audio/
    └── sfx/
        ├── ui_click.ogg
        ├── ui_confirm.ogg
        ├── ui_cancel.ogg
        │
        ├── bread_catch_01.ogg
        ├── bread_catch_02.ogg
        ├── bread_catch_03.ogg
        │
        ├── coin_collect.ogg
        ├── star_collect.ogg
        ├── heart_collect.ogg
        │
        ├── bad_item.ogg
        ├── miss.ogg
        ├── combo.ogg
        ├── level_up.ogg
        └── game_over.ogg
```

---

# 41. AUDIO MIX

Volume đề xuất:

| Audio | Volume |
|---|---:|
| BGM | 0.22 |
| Bread Catch | 0.45 |
| UI Click | 0.35 |
| Coin | 0.65 |
| Star | 0.75 |
| Heart | 0.70 |
| Combo | 0.65 |
| Bad Item | 0.60 |
| Level Up | 0.80 |
| Game Over | 0.70 |

Nguyên tắc:

```text
BGM < Normal SFX < Rare / Level Up SFX
```

---

# 42. PHASER AUDIO EXAMPLE

Preload:

```js
this.load.audio('bgm_stage_01', [
  'assets/music/bgm_stage_01.ogg'
]);

this.load.audio('bread_catch_01', [
  'assets/audio/sfx/bread_catch_01.ogg'
]);
```

Play BGM:

```js
this.bgm = this.sound.add('bgm_stage_01', {
  loop: true,
  volume: 0.22
});

this.bgm.play();
```

Random bread catch:

```js
const sounds = [
  'bread_catch_01',
  'bread_catch_02',
  'bread_catch_03'
];

this.sound.play(
  Phaser.Utils.Array.GetRandom(sounds),
  { volume: 0.45 }
);
```

---

# 43. DANH SÁCH TẢI XUỐNG — BẮT BUỘC

## MUSIC

### [ ] 1. cute/cozy music pack 2
https://1144ghost.itch.io/cutycozy-music-pack-2

Tải cả pack → nghe → chọn 4 track.

---

## SFX

### [ ] 2. Bread Catch
https://pixabay.com/sound-effects/search/item-collect/

Tìm:

```text
Item Pickup – Game UI Collect SFX
```

---

### [ ] 3. Coin
https://pixabay.com/sound-effects/search/coin%20collect/

Tìm:

```text
Retro Coin 1
```

hoặc:

```text
Coin Collect (3)
```

---

### [ ] 4. Star / Rare
https://pixabay.com/sound-effects/search/sparkle%20magic/

Tìm:

```text
Sound Effect: Twinkle/Sparkle
```

hoặc:

```text
Magic Twinkle
```

---

### [ ] 5. UI Click / Confirm / Cancel
https://mixkit.co/free-sound-effects/click/

Tải:

```text
Select click
Quick positive video game notification interface
Negative tone interface tap
```

---

### [ ] 6. Level Up
https://mixkit.co/free-sound-effects/game/

Tìm:

```text
Game level completed
```

---

### [ ] 7. Bad Item
https://mixkit.co/free-sound-effects/wrong/

Tìm:

```text
Funny fail low tone
```

---

### [ ] 8. Game Over
https://mixkit.co/free-sound-effects/wrong/

Tìm:

```text
Player losing or failing
```

---

# 44. TÀI NGUYÊN KHÔNG BẮT BUỘC

### [ ] cute/cozy music pack 1
https://1144ghost.itch.io/cutecozy-music-pack

Chỉ tải nếu cần thêm BGM.

### [ ] Triple Bubble Music
https://opengameart.org/content/triple-bubble-music

Có intro + loop point rõ ràng, phù hợp nếu muốn bổ sung nhạc arcade/casual.

License:

```text
CC-BY 4.0
```

### [ ] Café Cozy
https://wobwobrob.itch.io/cafe-cozy

Premium soundtrack dành riêng vibe shop / café / bakery.

Không cần cho V1.

---

# 45. CREDIT FILE

Nên tạo:

```text
CREDITS.md
```

Ví dụ:

```md
# Music

Music by 1144ghost on itch.io
https://1144ghost.itch.io/

# Sound Effects

Selected sound effects from:
Pixabay
https://pixabay.com/

Mixkit
https://mixkit.co/
```

Với mỗi asset tải xuống, giữ lại:
- tên file gốc;
- tên tác giả;
- URL nguồn;
- license tại thời điểm tải.

Không chỉ giữ file đã rename.

---

# 46. QUY TRÌNH XỬ LÝ AUDIO SAU KHI TẢI

1. Giữ nguyên file gốc trong:

```text
_source/audio/
```

2. Convert bản dùng trong game sang `.ogg`.

3. Trim silence đầu/cuối.

4. Normalize vừa phải.

5. Không boost quá mạnh.

6. Với SFX:
   - ưu tiên mono nếu phù hợp;
   - sample rate 44.1 kHz;
   - file càng ngắn càng tốt.

7. BGM:
   - stereo;
   - loop sạch;
   - không có khoảng im lặng khi lặp.

---

# 47. THỨ TỰ TRIỂN KHAI

## Phase 1 — Core MVP

- [ ] Setup Phaser
- [ ] Viewport / Scale
- [ ] Background
- [ ] Basket movement
- [ ] Spawn Bread
- [ ] Collision
- [ ] Score
- [ ] Life
- [ ] Game Over
- [ ] Retry

**Kết quả:** game đã chơi được.

---

## Phase 2 — Progression

- [ ] 4 Bread Tier
- [ ] 4 Basket Tier
- [ ] Level System
- [ ] Progress Bar
- [ ] Level Up
- [ ] 3 Background Stage
- [ ] Difficulty Curve

---

## Phase 3 — Game Depth

- [ ] Coin
- [ ] Star
- [ ] Heart
- [ ] Bonus Items
- [ ] Burnt Bread
- [ ] Moldy Bread
- [ ] Broken Egg
- [ ] Combo

---

## Phase 4 — Polish

- [ ] BGM
- [ ] SFX
- [ ] Catch FX
- [ ] Camera Shake
- [ ] Score Popup
- [ ] Basket Squash
- [ ] Background Transition
- [ ] Pause
- [ ] Settings
- [ ] Local Save

---

## Phase 5 — Final QA

- [ ] Mobile touch test
- [ ] Desktop keyboard test
- [ ] Resize test
- [ ] Audio toggle
- [ ] Restart test
- [ ] Level transition test
- [ ] LocalStorage test
- [ ] Performance test
- [ ] Spawn balancing
- [ ] Difficulty balancing
- [ ] Check asset licenses / credits

---

# 48. DEFINITION OF DONE — V1

V1 được xem là hoàn chỉnh khi có:

```text
✓ 3 Background
✓ 4 Basket
✓ 4 Bread Tier
✓ 10 Level
✓ Bonus Items
✓ 3 Hazard Items
✓ 3 Life
✓ Score
✓ Best Score
✓ Combo
✓ Progress Bar
✓ Level Up
✓ BGM
✓ Sound Effects
✓ Pause
✓ Retry
✓ Mobile Touch
✓ Keyboard Controls
✓ Local Save
```

---

# 49. CHỐT TÀI NGUYÊN CHO V1

Để tránh tải lan man, **V1 chỉ cần lấy tài nguyên bên ngoài từ 3 nguồn chính**:

## 1 — MUSIC
**1144ghost — cute/cozy music pack 2**

https://1144ghost.itch.io/cutycozy-music-pack-2

→ BGM Menu + Stage 1 + Stage 2 + Stage 3.

## 2 — GENERAL GAME SFX
**Mixkit**

https://mixkit.co/free-sound-effects/game/

https://mixkit.co/free-sound-effects/click/

https://mixkit.co/free-sound-effects/wrong/

→ UI + Level Up + Fail + Game Over.

## 3 — PICKUP / MAGIC SFX
**Pixabay**

https://pixabay.com/sound-effects/search/item-collect/

https://pixabay.com/sound-effects/search/coin%20collect/

https://pixabay.com/sound-effects/search/sparkle%20magic/

→ Bread Catch + Coin + Star + Heart.

---

# 50. FINAL DIRECTION

Phong cách audio + visual cuối cùng:

```text
Pixel Art
+
Warm Bakery
+
Cute Casual Arcade
+
Cozy Music
+
Soft Pickup SFX
+
Bright Coin / Star Chime
+
Strong but Short Level-Up Feedback
```

Không dùng:
- SFX quá điện tử;
- buzzer game show lớn;
- soundtrack quá 8-bit;
- sound quá dài khi catch;
- quá nhiều sound cùng lúc.

Mục tiêu là tạo cảm giác:

> **“Một game pixel hứng bánh cực đơn giản nhưng càng chơi, tiệm bánh và vật phẩm càng đẹp lên, mỗi lần hứng đều có feedback vui và dễ chịu.”**

