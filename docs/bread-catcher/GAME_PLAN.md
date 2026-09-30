# PHONICS BREAD CATCHER — GAME DESIGN & IMPLEMENTATION PLAN

**Version:** V2 — Classroom + Solo  
**Engine:** Phaser 3  
**Recommended app shell:** Vue 3 + TypeScript + Vite  
**Game UI language:** English only  
**Audience:** Kindergarten / approximately age 5  
**Learning focus:** phonics blending, letter recognition, sound-to-letter mapping, word building  
**Visual direction:** cute pixel-art bakery, warm colors, large readable UI, low visual clutter

---

## 1. Core game idea

Phonics Bread Catcher is a classroom-friendly phonics game. A target word is selected from the lesson bank. Letter-breads fall from the top of the screen, and the learner moves a basket to catch the letters in the correct order.

Example:

```text
Target: MAP

[M] [ _ ] [ _ ]

      A
     🍞
            T
           🥐
 M
🍞

        🧺
```

The correct sequence is:

```text
M → A → P
```

A correct letter fills the next slot. One wrong letter immediately ends that word attempt and moves to another target. Failed words remain in the practice pool so they can return later.

---

## 2. Game modes

### Class Mode

- Exactly 3 teams.
- Teacher can edit each team name.
- Empty names fall back to English animal names:
  - Lions
  - Tigers
  - Pandas
- A reusable Magic Dice / Turn Picker chooses the starting team.
- After each turn, the same picker selects the next remaining team.
- All 3 teams must finish before the final scoreboard is shown.
- The highest-scoring team enters the Gift Box screen.

### Solo Mode

- One player.
- No team picker.
- Same word, timer, difficulty and phonics logic.
- End screen shows personal performance.
- Gift reward can remain disabled until the reward system is defined.

---

## 3. Main menu / setup

The setup screen combines the main session options:

```text
PHONICS BREAD CATCHER

GAME MODE
CLASS MODE / SOLO MODE

PHONICS PACK
Blending Words / Picture Vocabulary / Mixed Review

LEVEL
Gentle / Easy / Normal / Fast

TIME
Auto / 45 / 60 / 75 / 90 / 120 sec

TEAM 1
TEAM 2
TEAM 3

START
```

Class Mode shows all 3 team fields.  
Solo Mode hides Team 2 and Team 3.

All visible game text is English.

---

## 4. Default settings for age 5

Default configuration:

```text
Mode: Class
Level: Easy
Time: 75 seconds per team
Words per turn: 5
Teams: 3
Countdown: 3 seconds
```

This gives children enough time to scan the falling letters without making the round too long.

---

## 5. Speed levels

| Level | Fall Speed | Spawn Interval | Suggested Time | Target Support |
|---|---:|---:|---:|---|
| Gentle | 58 px/s | 1750 ms | 90 s | Full word + image + audio |
| Easy | 72 px/s | 1450 ms | 75 s | Full word + image |
| Normal | 92 px/s | 1200 ms | 60 s | Image + first-letter hint |
| Fast | 115 px/s | 1000 ms | 50 s | Image/audio + blank slots |

**Easy** is the default.

Difficulty must remain unchanged during a team's 5-word turn so every team receives comparable conditions.

---

## 6. Magic Dice / reusable turn picker

Use a reusable Phaser scene:

```text
TurnPickerScene
```

Visual elements:
- bakery stage/table;
- large animated die;
- three team mascot tokens;
- selected-team glow;
- short reveal animation.

### Fairness logic

At session start:

```text
turnOrder = shuffle([team1, team2, team3])
```

The dice animation reveals the next team in the randomized order rather than repeatedly selecting from all teams.

This guarantees:
- each team plays exactly once;
- no duplicate team selection;
- easy reuse in future classroom games.

Suggested reusable interface:

```ts
type TurnPickerConfig = {
  candidates: Team[];
  title: string;
  revealLabel: string;
  onSelected: (team: Team) => void;
};
```

---

## 7. Countdown

After a team is selected:

```text
GET READY!
3
2
1
GO!
```

Suggested timing:

```text
GET READY  600 ms
3          700 ms
2          700 ms
1          700 ms
GO         500 ms
```

Gameplay begins immediately after GO.

---

## 8. One team turn

Each team receives a maximum of **5 target words**.

```text
WORD 1 / 5
WORD 2 / 5
...
WORD 5 / 5
```

A word attempt finishes when:
- the word is completed correctly; or
- the child catches one wrong letter.

If time expires before 5 attempts, the team's turn ends immediately.

---

## 9. Letter-catching mechanic

For a target word:

```text
targetWord = "MAP"
currentLetterIndex = 0
expectedLetter = "M"
```

Easy mode can show:

```text
MAP
[_] [_] [_]
```

Gentle mode can show the word plus picture and audio.  
Normal/Fast progressively remove visual hints.

---

## 10. Falling letter generation

Rules:
- the expected letter must appear regularly;
- do not let the learner wait more than about 2–3 spawn events for the required letter;
- distractors should primarily come from the current lesson pack;
- do not spawn excessive duplicates;
- clear all falling letters whenever a word ends.

Example for expected `A`:

```text
T
A
M
S
A
P
```

---

## 11. Correct letter feedback

When a correct letter is caught:

1. bread pops;
2. small sparkle effect;
3. soft positive SFX;
4. next word slot fills;
5. filled letter briefly scales up;
6. optional letter sound plays;
7. current letter index advances.

Short feedback may rotate between:

```text
YES!
NICE!
GREAT!
```

---

## 12. Complete word feedback

When the entire word is correct:

- larger sparkle burst;
- basket bounce;
- target panel glow;
- whole-word pronunciation;
- praise message;
- +100 score.

Praise pool:

```text
GREAT!
AMAZING!
WELL DONE!
SUPER!
```

Pause the action for about 900–1200 ms, then load the next word.

---

## 13. Wrong letter logic

One wrong catch ends that word attempt.

Sequence:

1. freeze current falling objects;
2. soft red/gray puff;
3. short gentle error SFX;
4. small basket shake;
5. display `TRY THE NEXT WORD!`;
6. keep the failed target in the practice pool;
7. move to the next target after about 700 ms.

Do not use harsh buzzers or strong negative effects.

---

## 14. Word pool logic

Maintain:

```text
SOURCE BANK
ACTIVE SESSION POOL
FAILED / RETRY QUEUE
```

### Correct word

Temporarily remove it from the active rotation to minimize repetition between teams.

### Wrong word

Keep it in the active rotation and set a retry delay:

```text
retryAfter >= 2 draws
```

### Reserve floor

Never permanently empty the practice source. When the active pool falls below 30% of the original eligible pool, re-enable the least recently seen mastered words.

Selection priority:

```text
1. unseen words
2. failed words ready for retry
3. least recently seen mastered words
```

Avoid words used by the immediately previous team whenever possible.

---

## 15. Scoring

Use normalized word scoring so different word lengths remain fair.

```text
Correct complete word = +100
Wrong word            = +0
Correct letter        = visual reward only
```

Maximum base score per full turn:

```text
500
```

Tie breakers:

```text
1. fewer wrong catches
2. more time remaining
3. shared first place if still tied
```

---

## 16. Timer

Timer starts after GO.

Timer pauses during:
- complete-word celebration;
- wrong-word transition;
- teacher Pause;
- resume countdown.

When it reaches zero:

```text
TIME'S UP!
```

The current team turn ends.

---

## 17. Gameplay HUD

Suggested layout:

```text
┌──────────────────────────────────┐
│ LIONS       WORD 2/5      01:03 │
│ SCORE 100                  ⏸ ↩ ■ │
├──────────────────────────────────┤
│                                  │
│            [ DOG ]               │
│          D [ O ] [ _ ]           │
│                                  │
│       falling letter breads      │
│                                  │
│              🧺                  │
└──────────────────────────────────┘
```

Teacher controls:
- Pause
- Back
- End Game

---

## 18. Teacher Pause

When Pause is pressed:

- freeze Arcade Physics;
- pause spawning;
- pause the round timer;
- darken the play field about 85%;
- hide or heavily obscure falling letters.

Visible overlay:

```text
PAUSED
RESUME
BACK
END GAME
```

The dark overlay prevents students from studying letter positions while paused.

---

## 19. Resume fairness countdown

When RESUME is pressed:

```text
3
2
1
GO!
```

During the countdown:
- game remains frozen;
- playfield stays obscured;
- timer remains stopped.

At GO:
- overlay disappears;
- physics resumes;
- timer resumes.

---

## 20. Back and End Game

### Back

Confirmation:

```text
LEAVE THIS GAME?
CANCEL
LEAVE
```

Leaving returns to setup and does not show class statistics.

### End Game

Confirmation:

```text
END GAME?
CANCEL
END
```

If all three teams already completed:
- go to Final Results.

If fewer than three teams completed:
- terminate the session;
- return to setup;
- **do not show final team statistics**.

---

## 21. Between team turns

After a team finishes:

```text
TEAM TURN COMPLETE

LIONS
3 / 5 WORDS
300 POINTS
```

Pressing:

```text
NEXT TEAM
```

opens the same reusable TurnPickerScene with only remaining teams.

---

## 22. Final Results

Only shown when all 3 teams complete their turns.

Example:

```text
FINAL RESULTS

1  LIONS    500
2  PANDAS   400
3  TIGERS   300
```

Per team, retain:
- correct words;
- wrong words;
- accuracy;
- remaining time;
- score.

---

## 23. Winner Gift

The highest-scoring team enters:

```text
WINNER'S GIFT
```

Show:
- winning mascot;
- crown;
- three closed gift boxes.

The winning team chooses one box.

Reward contents remain placeholders until reward data is provided later.

Suggested data model:

```ts
type Reward = {
  id: string;
  title: string;
  description: string;
  iconKey?: string;
};
```

For unresolved first-place ties, allow all tied winners to receive a gift rather than randomly demoting one.

---

## 24. Phonics source content

The uploaded sheet contains phonics material for:

```text
M A S P T I N C O D
```

The default game pack should prioritize the blending words.

### Early blending

```text
am
at
it
in
on
```

### Core CVC / simple blending

```text
map mop man mad mat him men Sam
pit pat tap tip Pam sap sat Tam
sit sip Tim bin nap tin pan ant
can cap cat top tot pot Mom not
hop dot dip cod dad Dan dam rod pad hid
```

### Longer review

```text
miss
cast
```

---

## 25. Picture vocabulary from the uploaded sheet

### M
```text
monkey milk money mouse moon mop muffin mittens
```

### A
```text
apple ant ax alligator angel arm astronaut anchor
```

### S
```text
seal soap sun socks square spider sink salad
```

### P
```text
pen pineapple panda pizza parrot pumpkin puzzle
```

### T
```text
turtle tent teacher tiger table two
```

### I
```text
insect igloo ink iguana in Italy infant
```

### N
```text
nest nut net nose nine ninja
```

### C
```text
cat cup car computer cake carrot
```

### O
```text
octopus olive ostrich oven otter onion
```

### D
```text
dog desk doll duck drum dinosaur
```

---

## 26. Optional ESL review pack

The right side of the uploaded sheet can be retained as an optional later pack:

```text
marble
mop
drum
broom
map
pen
panda
apple
ant
bird
pot
ball
nut
ice cream
fire truck
firefighter
hose
hat
dig
dirt
den
```

It should not be enabled by default in the phonics blending mode.

---

## 27. Target support by difficulty

### Gentle
```text
DOG
[D] [O] [G]
picture
audio
```

### Easy
```text
DOG
[_] [_] [_]
picture
audio
```

### Normal
```text
picture
[D] [_] [_]
audio
```

### Fast
```text
picture
[_] [_] [_]
audio
```

---

## 28. Learning audio

Prepare:
- letter/phoneme audio;
- whole-word pronunciation;
- correct-letter SFX;
- complete-word SFX;
- wrong-letter SFX;
- countdown SFX;
- dice roll;
- team reveal.

When a target word loads, play its pronunciation once.  
Provide a speaker button to replay it.  
When completed, pronounce it again.

---

## 29. New art asset groups

Reuse the existing:
- 4 bread tiers;
- 4 basket tiers;
- 3 bakery backgrounds;
- bakery UI;
- sparkle/catch effects.

Add:

### Team & Setup
```text
mascot_lion
mascot_tiger
mascot_panda
team_token_01
team_token_02
team_token_03
dice_1 ... dice_6
icon_class_mode
icon_solo_mode
icon_timer
icon_level
icon_phonics
setup_panel_large
setup_panel_small
input_frame
selector_frame
start_button_frame
```

### Gameplay Phonics
```text
letter_bread_round
letter_bread_baguette
letter_bread_loaf
letter_bread_premium
target_word_panel
letter_slot_empty
letter_slot_correct
word_progress_panel
icon_audio
icon_pause
icon_back
icon_end
correct_letter_fx
wrong_letter_fx
word_complete_fx
praise_badge_small
praise_badge_large
```

Letters and words must be rendered dynamically, not baked into artwork.

### Turn Picker
```text
turn_picker_stage
dice_shadow
team_selector_frame
selected_team_glow
```

### Pause
```text
pause_panel
resume_button_frame
```

The dark fairness overlay is generated in code.

### Results
```text
scoreboard_frame
podium_1
podium_2
podium_3
winner_crown
result_team_card
stats_icon_correct
stats_icon_wrong
stats_icon_accuracy
stats_icon_time
```

### Gifts
```text
gift_closed_01
gift_closed_02
gift_closed_03
gift_open_01
gift_open_02
gift_open_03
gift_reveal_panel
reward_placeholder_icon
```

### Vocabulary
Create clean picture icons for the uploaded vocabulary. Do not bake text into these images.

---

## 30. English UI text

```text
PHONICS BREAD CATCHER
CLASS MODE
SOLO MODE
TEAM 1
TEAM 2
TEAM 3
PHONICS PACK
LEVEL
TIME
GENTLE
EASY
NORMAL
FAST
AUTO
START
ROLL THE DICE!
WHO GOES FIRST?
NEXT TEAM
GET READY!
GO!
WORD
SCORE
YES!
NICE!
GREAT!
AMAZING!
WELL DONE!
SUPER!
TRY THE NEXT WORD!
TIME'S UP!
PAUSED
RESUME
BACK
END GAME
LEAVE THIS GAME?
END GAME?
CANCEL
LEAVE
END
TEAM TURN COMPLETE
FINAL RESULTS
WINNER!
OPEN A GIFT!
CHOOSE A BOX
PLAY AGAIN
HOME
```

---

## 31. Tech stack

Recommended:

```text
Vue 3
TypeScript
Vite
Pinia
Vue Router
Phaser 3
Arcade Physics
Web Audio
localStorage
```

Responsibilities:

```text
Vue
├── Main Menu
├── Team Setup
├── Settings
└── Results shell

Phaser
├── Turn Picker
├── Countdown
├── Gameplay
├── Falling letters
├── Basket movement
├── Effects
└── In-game HUD
```

---

## 32. Suggested project structure

```text
src/
├── app/
│   ├── router/
│   └── stores/
│       └── sessionStore.ts
├── views/
│   ├── HomeView.vue
│   ├── SetupView.vue
│   ├── GameView.vue
│   └── ResultsView.vue
├── components/
│   ├── TeamSetup.vue
│   ├── TimerSelector.vue
│   ├── LevelSelector.vue
│   └── ResultTable.vue
├── game/
│   ├── scenes/
│   │   ├── PreloadScene.ts
│   │   ├── TurnPickerScene.ts
│   │   ├── CountdownScene.ts
│   │   ├── PhonicsGameScene.ts
│   │   └── GiftScene.ts
│   ├── objects/
│   │   ├── Basket.ts
│   │   └── LetterBread.ts
│   ├── systems/
│   │   ├── WordPoolSystem.ts
│   │   ├── LetterSpawnSystem.ts
│   │   ├── TurnSystem.ts
│   │   ├── ScoreSystem.ts
│   │   ├── TimerSystem.ts
│   │   └── AudioSystem.ts
│   └── config/
│       ├── difficulty.ts
│       └── phonics.ts
└── data/
    ├── phonics_word_bank.json
    └── ui_text.en.json
```

---

## 33. Classroom fairness rules

1. Same difficulty for all three teams.
2. Same timer for all teams.
3. Maximum 5 targets per team.
4. Score per completed word rather than per letter.
5. Correct words are temporarily removed to reduce repetition.
6. Wrong words remain available for later practice.
7. Turn order is randomized once and revealed progressively.
8. Pause obscures the play field.
9. Resume always uses a countdown.
10. Incomplete class sessions never show final comparative statistics.

---

## 34. Age-5 UI requirements

- minimum 48 px touch targets;
- large uppercase falling letters;
- strong contrast;
- short instructions;
- one learning task at a time;
- positive error language;
- no rapid flashing;
- short celebrations;
- clear timer;
- audio replay;
- pointer/touch + keyboard support.

Use a clean classroom font for the actual phonics letters and words. Pixel fonts may be used for decorative UI, but not for the learning text.

---

## 35. Development phases

### Phase 1 — Core learning loop
- basket movement
- letter-bread spawning
- target word
- next-letter validation
- wrong-letter transition
- 5-word turn
- scoring
- timer

### Phase 2 — Classroom session
- 3-team setup
- animal defaults
- randomized order
- Magic Dice
- between-team transitions
- completed-team tracking

### Phase 3 — Teacher controls
- Pause
- fairness overlay
- resume countdown
- Back confirmation
- End Game confirmation
- no results on incomplete sessions

### Phase 4 — Learning content
- word-bank JSON
- content packs
- vocabulary pictures
- letter/word audio
- retry queue
- low-repeat algorithm

### Phase 5 — Results & rewards
- final scoreboard
- tie breakers
- winner
- gift selection
- configurable reward placeholder

### Phase 6 — Polish
- BGM
- SFX
- correct/wrong FX
- word celebration
- classroom projection layout
- mobile Solo layout

---

## 36. Definition of Done

```text
✓ Class Mode
✓ Solo Mode
✓ 3 editable team names
✓ English animal defaults
✓ reusable Magic Dice picker
✓ 4 speed levels
✓ configurable timer
✓ 75-second age-5 default
✓ 3-second countdown
✓ 5 target words per turn
✓ sequential letter catching
✓ correct-letter effect
✓ full-word celebration
✓ one-error word failure
✓ failed words remain in practice pool
✓ correct words reduce repetition
✓ three-team progression
✓ Pause / Back / End Game
✓ dark pause fairness overlay
✓ resume countdown
✓ no final stats for incomplete class sessions
✓ final scoreboard
✓ winner gift screen
✓ English-only interface
✓ picture/audio-ready content
```

---

## 37. Reusable classroom shell

Keep these systems independent of the phonics gameplay:

```text
Team Setup
Magic Dice
Countdown
Teacher Controls
Turn System
Final Results
Gift Reward
```

Future classroom games can reuse the same shell while replacing only the central game scene.


---

# 38. AUDIO PACKAGE INCLUDED IN THIS ZIP

The resource pack includes original synthesized BGM and SFX so the first implementation does not depend on external audio downloads.

## BGM mapping

```text
Main Menu / Setup      -> bgm_menu.ogg
Magic Dice / Turn Pick -> bgm_turn_picker.ogg
Gentle / Easy Gameplay -> bgm_gameplay_easy.ogg
Normal / Fast Gameplay -> bgm_gameplay_normal.ogg
Final Results          -> bgm_results.ogg
Winner Gift            -> bgm_gift.ogg
```

## SFX mapping

```text
Button click     -> ui_click.ogg
Start            -> ui_start.ogg
3 / 2 / 1        -> countdown_tick.ogg
GO!              -> countdown_go.ogg
Dice animation   -> dice_roll.ogg
Team selected    -> team_selected.ogg
Correct letter   -> correct_letter.ogg
Wrong letter     -> wrong_letter.ogg
Word complete    -> word_complete.ogg
Turn complete    -> round_complete.ogg
Pause            -> pause.ogg
Resume           -> resume.ogg
Time up          -> time_up.ogg
Final results    -> final_results.ogg
Open gift        -> gift_open.ogg
```

Runtime files are in `03_AUDIO/bgm` and `03_AUDIO/sfx`. WAV masters are included for later editing. Use `03_AUDIO/audio_manifest.json` as the source of truth for key mapping, looping and recommended volumes.
