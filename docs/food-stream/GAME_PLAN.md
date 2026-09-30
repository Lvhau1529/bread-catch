# PHONICS FOOD STREAM — Web Game Production Plan

## 1. Product vision

**Phonics Food Stream** is a touch-first, portrait-oriented 2D pixel web game for Kindergarten phonics practice.  
The experience borrows the *livestream/mukbang fantasy* as a reward wrapper, but all characters, art, naming, UI, audio, progression, and learning content are original.

Core fantasy:

> Listen → identify the target sound/word → choose the correct food/letter → feed the streamer → hear the phoneme again → gain viewers/hearts → build streak → unlock new foods/rooms/word packs.

Primary platforms:
- Mobile browser first: 360×640 → 430×932.
- Tablet: portrait preferred, landscape supported.
- Classroom display / laptop: responsive centered game viewport.
- PWA installable later.
- Optional backend for student profiles, class reports, and cloud progress.

---

## 2. Recommended tech stack

### Core stack — recommended
- **Vite**
- **TypeScript**
- **Phaser 3**
- **React**
- **Zustand**
- **Zod**
- **i18next**
- **Vitest**
- **Playwright**
- **vite-plugin-pwa**

### Why this stack

**Phaser 3**
- Mature for 2D games.
- Sprite sheets, atlases, tweens, particles, cameras, WebAudio, touch input.
- Handles pixel-art rendering well.
- Easy to deploy as static web content.

**React**
- Use only for non-game shell UI: login, settings, pack selection, teacher dashboard, accessibility, PWA prompts.
- Keep moment-to-moment gameplay inside Phaser.

**Zustand**
- Small, fast, simple state store.
- Good bridge between React shell and Phaser runtime.

**Zod**
- Validates JSON word packs and level data.
- Prevents broken content from crashing the game.
- Later allows teacher/admin CMS to generate the same schema.

### Optional scale-up stack
- **Supabase**: auth, Postgres, cloud save, classroom data.
- **Cloudflare Pages / Vercel**: frontend deployment.
- **Cloudflare R2 / Supabase Storage**: future asset packs.
- **Sentry**: runtime error tracking.
- **PostHog**: product analytics, not student-identifying data by default.

---

## 3. Architecture principle

Keep the project in 4 independent layers:

1. **Game runtime**
   - Phaser scenes
   - animation
   - collision/input
   - audio
   - particles
   - round flow

2. **Learning content**
   - JSON word packs
   - phoneme data
   - picture/letter mapping
   - difficulty rules

3. **App shell**
   - React
   - mode/pack selection
   - settings
   - profiles
   - teacher features

4. **Persistence**
   - localStorage/IndexedDB initially
   - optional Supabase later

The game must never hard-code `dog`, `duck`, `d`, etc. inside scene files.  
All learning content comes from data packs.

---

# 4. Core gameplay loop

## 4.1 Session flow

```text
BOOT
  ↓
PRELOAD
  ↓
MAIN MENU
  ↓
MODE SELECT
  ├── SOLO
  └── CLASSROOM
  ↓
WORD PACK SELECT
  ↓
LEVEL SELECT
  ↓
ROUND INTRO
  ↓
3–2–1 GO
  ↓
PROMPT
  ↓
ITEM SPAWN
  ↓
PLAYER INPUT
  ↓
CORRECT / WRONG FEEDBACK
  ↓
FEED + EAT ANIMATION
  ↓
PHONEME / WORD REPLAY
  ↓
SCORE + VIEWERS + COMBO
  ↓
NEXT QUESTION
  ↓
ROUND COMPLETE
  ↓
REWARD / UNLOCK
  ↓
NEXT LEVEL / MENU
```

---

# 5. Main game modes

## 5.1 Solo Mode

Goal:
- independent phonics practice
- low-pressure
- 45–90 second rounds

Default:
- 10 questions per level
- 3 hearts optional
- no harsh failure screen
- wrong answer → gentle correction → retry

Scoring:
- Correct: +10
- First-try correct: +5 bonus
- 3 correct streak: combo x2
- 5 correct streak: combo x3
- perfect level: bonus chest

Reward:
- viewers
- hearts
- stars
- cosmetic food
- room decorations
- badges

---

## 5.2 Classroom Mode

Designed for projector / interactive screen.

Features:
- Team A vs Team B
- turn indicator
- large tap targets
- teacher-controlled pause/next
- optional random first-team animation
- no student account required

Round:
```text
Team A turn
→ prompt
→ one answer
→ points awarded
→ Team B turn
→ repeat
```

Teacher options:
- 5 / 10 / 15 questions
- timer on/off
- sound on/off
- allow steal answer
- automatic team switch
- random team start
- difficulty

Winner screen:
- celebratory only
- show both scores
- no negative character reaction for losing team

---

# 6. Learning modes

## Mode A — Hear & Tap

Prompt:
- audio `/d/`

Choices:
- d
- b
- m

Target skill:
- phoneme → grapheme

---

## Mode B — Picture → Beginning Sound

Prompt:
- dog picture

Choices:
- d
- b
- g

Target skill:
- initial sound identification

---

## Mode C — Find the Word

Prompt:
- `/d/ words`

Choices:
- dog
- duck
- drum
- cat

Target:
- sound categorization

---

## Mode D — Build the CVC Word

Prompt:
- dog image/audio

Tiles:
- d
- o
- g
- t

Expected:
- d → o → g

Feedback:
- pronounce phoneme per tile
- blend completed word

---

## Mode E — Missing Letter

Prompt:
- d _ g

Choices:
- o
- a
- u

Target:
- medial vowel recognition

---

## Mode F — Listen & Build

Prompt:
- audio only: “dog”

No spelling displayed.

Target:
- auditory decoding

---

# 7. Initial content packs

## Letter D pack

Words:
- dog
- duck
- drum
- desk
- doll
- dinosaur
- dig
- dirt
- den
- day

Recommended level order:

1. recognize `d`
2. picture → d
3. distinguish d/b/m
4. find D words
5. build simple words
6. timed review

---

## Letter O pack

Words:
- octopus
- olive
- ostrich
- oven
- otter
- onion

CVC review:
- on
- top
- tot
- pot
- mom
- not
- hop
- dot

---

# 8. Question generation rules

Every generated question has:

```ts
type Question = {
  id: string
  mode: QuestionMode
  targetId: string
  promptAudio?: string
  promptImage?: string
  promptText?: string
  choices: Choice[]
  correctChoiceIds: string[]
  phoneme?: string
  feedbackAudio?: string
  difficulty: 1 | 2 | 3 | 4 | 5
}
```

Rules:
- Never show duplicate choice IDs.
- Distractors should be plausible but not visually identical.
- Kindergarten default: 3 choices.
- Maximum mobile choice count: 4.
- Avoid timer pressure in early levels.
- Repeat missed targets within the same session.
- Do not repeat the exact same answer position twice too often.
- Shuffle positions independently from learning target order.

---

# 9. Round state machine

Use an explicit state machine.

```ts
type RoundState =
  | "intro"
  | "countdown"
  | "prompt"
  | "awaiting-input"
  | "correct"
  | "wrong"
  | "feeding"
  | "eating"
  | "reward"
  | "next-question"
  | "complete"
```

Why:
- prevents accidental double taps
- prevents score duplication
- makes animation sequencing predictable
- makes QA easier
- works well with classroom pause

---

# 10. Character animation system

## Character A / Character B animation keys

Required:

```text
idle
blink
happy
excited
surprised
thinking
talk
point
pick
hold-food
open-mouth
bite-1
bite-2
chew-1
chew-2
swallow
clap
win
oops
```

Recommended frame rate:
- idle: 4–6 fps
- eating: 8–10 fps
- reaction: 8–12 fps

Character logic:

```text
question starts
→ idle

correct answer
→ happy
→ pick
→ hold-food
→ open-mouth
→ bite
→ chew
→ swallow
→ clap

wrong answer
→ surprised/oops
→ thinking
→ return idle
```

---

# 11. Food animation

Each edible item should support:

```text
FULL
BITE_1
BITE_2
FINISHED
```

Optional later:
- bounce
- glow
- selected outline
- wrong shake
- fly-to-mouth
- crumbs particles

Do not generate every bite state as a separate gameplay entity.  
Use one `FoodItem` object and swap texture frames.

---

# 12. Livestream reward layer

HUD:

```text
LIVE
viewers
hearts
timer
combo
progress
```

Viewer system is cosmetic progression, not real networking.

Example:

```text
Correct        +50 viewers
First try      +25 viewers
Combo x3       +100 viewers
Perfect round  +500 viewers
```

Comments:
- “Great sound!”
- “D! D! D!”
- “Yummy word!”
- “Amazing!”
- “Try again!”
- “So close!”

Comments should be selected from a local pool and must not expose real chat/network features.

---

# 13. Audio design

## Current BGM mapping

```text
01_main_menu_loop.wav
→ Main Menu
→ Mode Select
→ Word Pack Select

02_gameplay_loop.wav
→ Solo gameplay
→ standard learning levels

03_classroom_battle_loop.wav
→ Classroom team battle

04_reward_room_loop.wav
→ reward
→ collection
→ unlock
→ customization

05_level_complete_jingle.wav
→ one-shot after level completion
```

## Required SFX later

```text
ui_tap.wav
ui_back.wav
countdown_tick.wav
go.wav

correct.wav
wrong_soft.wav
combo.wav
perfect.wav
star_gain.wav
coin_gain.wav
unlock.wav

food_pick.wav
food_place.wav
bite_soft.wav
crunch_01.wav
crunch_02.wav
swallow.wav

heart_pop.wav
viewer_pop.wav
comment_pop.wav
```

## Voice rules

Voice should be separate from BGM/SFX.

Audio buses:

```text
MASTER
├── BGM
├── SFX
└── VOICE
```

On voice playback:
- reduce BGM to ~35–50%
- restore BGM after voice completes

This is essential for phonics clarity.

---

# 14. Scene architecture

Recommended Phaser scenes:

```text
BootScene
PreloadScene
MainMenuScene
ModeSelectScene
PackSelectScene
LevelSelectScene

GameplayScene
ClassroomGameplayScene

RewardScene
ResultsScene
CollectionScene
```

Do not make one giant `GameScene.ts`.

---

# 15. System architecture

Recommended systems:

```text
AudioSystem
QuestionSystem
RoundSystem
ScoringSystem
ProgressionSystem
AnimationSystem
FeedbackSystem
SaveSystem
ContentSystem
ClassroomSystem
AnalyticsSystem
```

Example relationship:

```text
GameplayScene
   ↓
RoundSystem
   ↓
QuestionSystem
   ↓
ContentSystem

RoundSystem
   ├── ScoringSystem
   ├── AnimationSystem
   ├── FeedbackSystem
   └── AudioSystem
```

---

# 16. Asset pipeline

## Important

The generated PNG boards in:

```text
assets/source-sheets/
```

are **master art/reference boards**, not final production atlases.

They contain:
- labels
- panel backgrounds
- multiple unrelated sprites
- non-transparent areas

Before production use, export individual transparent sprites.

Recommended pipeline:

```text
Generated art board
↓
Manual cleanup / Aseprite
↓
transparent PNG sprites
↓
TexturePacker
↓
PNG atlas + JSON
↓
Phaser preload
```

Example final files:

```text
assets/game/characters/player.png
assets/game/characters/player.json

assets/game/characters/streamer.png
assets/game/characters/streamer.json

assets/game/food/food-atlas.png
assets/game/food/food-atlas.json

assets/game/ui/ui-atlas.png
assets/game/ui/ui-atlas.json
```

---

# 17. Asset keys

Use stable string keys.

```ts
export const ASSET = {
  PLAYER: "character.player",
  STREAMER: "character.streamer",

  FOOD_ATLAS: "food.atlas",
  UI_ATLAS: "ui.atlas",

  BG_STREAMING: "bg.streaming",
  BG_KITCHEN: "bg.kitchen",
  BG_CAFE: "bg.cafe",
  BG_CLASSROOM: "bg.classroom",
  BG_RAMEN: "bg.ramen",
  BG_DESSERT: "bg.dessert",
}
```

Never use file names directly throughout the game.

---

# 18. Suggested sprite naming

## Character frames

```text
player_idle_00
player_idle_01

player_blink_00

player_pick_00
player_pick_01

player_bite_00
player_bite_01

player_chew_00
player_chew_01

player_swallow_00
player_happy_00
```

Streamer equivalent:

```text
streamer_idle_00
streamer_pick_00
...
```

---

# 19. Food naming

```text
food_apple_a_full
food_apple_a_bite1
food_apple_a_bite2

food_burger_b_full
food_burger_b_bite1

food_donut_d_full
...
```

Do not bind the learning answer to texture name.

Instead:

```json
{
  "id": "food_donut_01",
  "texture": "food_donut_d_full",
  "letter": "d",
  "phoneme": "/d/"
}
```

---

# 20. Content schema

Each pack should be independent.

```json
{
  "id": "letter-d",
  "title": "Letter D",
  "grapheme": "d",
  "phoneme": "/d/",
  "targets": [
    {
      "id": "dog",
      "word": "dog",
      "imageAsset": "picture.dog",
      "voiceAsset": "voice.word.dog",
      "initialSound": "d"
    }
  ]
}
```

This lets the same gameplay engine support:
- phonics
- sight words
- vocabulary
- ESL sentence patterns later

without rewriting scenes.

---

# 21. Difficulty model

## Difficulty 1
- 2–3 choices
- no timer
- visual prompt + voice
- strong hint

## Difficulty 2
- 3 choices
- visual prompt
- no automatic hint

## Difficulty 3
- 3–4 choices
- optional timer
- closer distractors

## Difficulty 4
- audio-first
- spelling tasks
- fewer hints

## Difficulty 5
- mixed review
- speed challenge
- classroom competition

---

# 22. Responsive design

Virtual game resolution:

```text
720 × 1280
```

Phaser:

```ts
scale: {
  mode: Phaser.Scale.FIT,
  autoCenter: Phaser.Scale.CENTER_BOTH,
  width: 720,
  height: 1280
}
```

Recommended:
- pixelArt: true
- roundPixels: true

Safe zones:
- top HUD: 110 px
- gameplay center: 720 px
- interaction tray: 330 px
- bottom navigation: 120 px

All critical buttons:
- minimum touch target 72×72 virtual pixels

---

# 23. Performance budget

Target:
- 60 FPS modern phone
- graceful 30 FPS fallback
- initial JS payload < 1.5 MB gzip excluding Phaser/assets
- first playable pack < 15 MB
- lazy load additional rooms/packs

Asset strategy:
- one atlas per category
- WebP for static backgrounds
- PNG for pixel sprites requiring alpha
- WAV during production
- encode final audio to OGG + MP3 fallback

---

# 24. Save data

Initial local save:

```ts
type SaveData = {
  version: number
  unlockedPacks: string[]
  unlockedLevels: Record<string, number[]>
  stars: Record<string, number>
  coins: number
  settings: {
    bgm: number
    sfx: number
    voice: number
    language: "en" | "vi"
  }
}
```

Later:
- sync to Supabase
- version migrations required

---

# 25. Classroom architecture

Classroom mode should remain local first.

```ts
type Team = {
  id: "A" | "B"
  name: string
  score: number
  streak: number
}
```

State:

```text
setup
random-start
team-a-turn
team-b-turn
round-end
result
```

Future:
- teacher dashboard on second device
- websocket room
- QR join

Do not build multiplayer networking in V1.

---

# 26. Accessibility / child UX

Required:
- no reading required for core navigation
- voice + icon support
- no punitive sounds
- large buttons
- no flashing effects
- avoid >3 rapid screen flashes/sec
- visual + audio correct feedback
- settings allow BGM off while voice remains on
- no external ads in gameplay
- no open chat

---

# 27. Analytics events

Optional events:

```text
session_start
pack_selected
level_started
question_answered
answer_wrong
answer_correct
hint_used
level_completed
level_quit
classroom_round_started
classroom_round_completed
```

Never send raw student names in analytics.

---

# 28. MVP scope

## MVP 0.1

Must have:
- Main menu
- Solo mode
- D pack
- O pack
- Hear & Tap
- Picture → Sound
- basic feeding animation
- correct/wrong feedback
- viewers/hearts
- progress
- results screen
- BGM + SFX + voice
- local save

---

## MVP 0.2

Add:
- CVC build mode
- missing letter
- level select
- stars
- unlocks
- food collection
- second room

---

## MVP 0.3

Add:
- classroom mode
- team scoring
- random first team
- teacher settings
- classroom results

---

# 29. V1 feature set

```text
6 learning modes
2 characters
5–6 rooms
A–Z content structure
CVC packs
Solo Mode
Classroom Mode
local progress
PWA
audio settings
EN/VI interface
cosmetic progression
```

---

# 30. Suggested repository layout

```text
phonics-food-stream/
├─ public/
│  └─ assets/
│     ├─ atlases/
│     ├─ backgrounds/
│     ├─ audio/
│     │  ├─ bgm/
│     │  ├─ sfx/
│     │  └─ voice/
│     └─ pictures/
│
├─ src/
│  ├─ app/
│  │  ├─ App.tsx
│  │  └─ routes/
│  │
│  ├─ game/
│  │  ├─ Game.ts
│  │  ├─ config/
│  │  ├─ scenes/
│  │  ├─ systems/
│  │  ├─ entities/
│  │  └─ assets/
│  │
│  ├─ content/
│  │  ├─ schemas/
│  │  └─ packs/
│  │
│  ├─ store/
│  ├─ ui/
│  ├─ i18n/
│  └─ analytics/
│
├─ tests/
├─ package.json
└─ vite.config.ts
```

---

# 31. Development order

### Sprint 1 — foundation
- Vite + TS + Phaser
- scaling
- preload
- audio buses
- debug scene

### Sprint 2 — gameplay core
- round state machine
- questions
- selection
- feedback
- score

### Sprint 3 — character/food
- animation atlas
- feed animation
- food state swap
- particles

### Sprint 4 — phonics content
- D pack
- O pack
- CVC schema
- voice map

### Sprint 5 — progression
- level select
- save
- rewards
- stars

### Sprint 6 — classroom
- team state
- turn flow
- scoreboard
- classroom result

### Sprint 7 — optimization
- PWA
- lazy loading
- tests
- device QA
- deployment

---

# 32. Definition of “code-ready asset”

An asset is only code-ready when it has:

```text
✓ transparent background when needed
✓ final dimensions
✓ consistent pixel scale
✓ stable asset key
✓ atlas frame name
✓ pivot/origin decision
✓ animation frame order
✓ audio volume category
✓ content ID mapping
```

The current generated boards are intentionally stored as:

```text
assets/source-sheets/
```

Treat them as **source/reference art** until the individual items are cleaned and exported.

---

# 33. Immediate implementation target

Build one vertical slice first:

```text
Main Menu
→ Solo
→ Letter D
→ Level 1
→ 10 Hear & Tap questions
→ feed animation
→ /d/ voice
→ viewers
→ level complete
→ save star result
```

If this slice feels fun and responsive, reuse the engine for all later packs.

Do not build A–Z before the vertical slice is proven.

---

# 34. Success criteria for first playable

A Kindergarten learner should be able to:

1. open the game
2. tap Play without reading instructions
3. understand the target sound from audio
4. choose an answer
5. see a clear consequence
6. hear the phoneme again
7. complete a round in under 2 minutes
8. want to replay to gain stars/viewers

Technical:
- no double-score from repeated taps
- no audio overlap during phoneme instruction
- works at 360×640
- reload preserves progress
- gameplay remains 60 FPS on average Android hardware

---

# 35. Asset source map included in this package

The package contains the generated concept boards under:

```text
assets/source-sheets/
```

and the current chiptune BGM under:

```text
assets/audio/bgm/
```

Use the `ASSET_MANIFEST.json` file for stable code-facing keys and intended mapping.

