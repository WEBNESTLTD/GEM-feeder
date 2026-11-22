# Gem Feeder — Casual 2D Candy-Throwing Browser Game

A casual 2D candy-throwing browser game built with **Phaser.js 3.90**, **HTML5/CSS3**, **Phaser Arcade Physics**, **Web Audio API**, and **LocalStorage**.

---

## 🎮 Gameplay & Features

### 🌟 Game Modes
- **Campaign Mode (Progression):** 30 handcrafted levels spanning 3 vibrant worlds:
  - **World 1: Candy Garden** (Levels 1–10) — Foundational trajectory aiming, gentle target scores.
  - **World 2: Sugar Mountain** (Levels 11–20) — Steeper score thresholds and dynamic character sway.
  - **World 3: Chocolate Kingdom** (Levels 21–30) — Fast pendulum sway and mastery trick-shot goals.
- **Endless Arcade Mode:** Classic high-score survival mode with scaling difficulty and combo multipliers.

### 🍬 Core Mechanics & Game Juice
- **Aim & Flick / Slingshot:** Touch/click the active candy above the candy packet; drag up to flick forward OR pull back in slingshot mode with an elastic rubber band.
- **Trajectory Lock:** Dashed prediction arc turns luminous green when aligned for a direct mouth bullseye hit.
- **Scoring & Combos:**
  - Normal Hit: **+10 points**
  - Perfect Hit: **+15 points** with character celebration hop and gold sparkle burst.
  - Consecutive Combos: **x2**, **x3**, **x4 Multipliers** on 3, 5, and 10+ streak hits.
- **5 Special Power-Ups:**
  - 🧲 **Candy Magnet:** Pulls nearby flying candies straight toward the mouth.
  - ⏳ **Slow Motion:** Scales physics delta to 0.55x for precision trick-shots.
  - ✨ **2x Multiplier:** Doubles all catch points for 15 seconds.
  - 🛡️ **Protective Shield:** Absorbs 1 miss to save your life and combo.
  - 🎯 **Precision Assist:** Extends trajectory guidance arc for easier targeting.
- **Candy Coin Economy & Sweet Shop:**
  - Earn coins through gameplay catches, 1–3 star level completions, daily quests, and achievements.
  - Purchase power-up inventory and unlock character wardrobe cosmetics.
- **Character Wardrobe Customization:**
  - Equip head accessories (Pink Ribbon Bow, Star Sunglasses, Golden Crown).
  - Equip custom outfit color themes (Classic Pink, Mint Breeze, Bubblegum Violet).
- **Daily Quests & Achievements:**
  - Deterministic daily quests with reward claims generated using local calendar date (`YYYY-MM-DD`).
  - 9 lifetime achievement badges rewarding mastery milestones.
- **Audio & Haptics:**
  - Procedural Web Audio synthesizer BGM melody, bell chime, and crunch chewing sound effects.
  - Multi-tier haptic vibration pulses (`navigator.vibrate`) with settings toggle.

---

## 🚀 Quick Start

### 1. Prerequisites
- Node.js (v18+)

### 2. Development Server
Run the local development server:
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 3. Run Automated Tests
Execute the full 25-test unit and progression test suite:
```bash
npm test
```

### 4. Build for Production
Bundle the production static distribution into `dist/`:
```bash
npm run build
```

---

## 📁 Project Structure

```
gem-feeder/
├── assets/
│   ├── candies/        # 8 SVG vector candies
│   ├── characters/     # 9 PNG character mouth animation frames (mouth_0..8.png)
│   └── ui/             # SVG UI icons (packet, hearts, pause, play, sound)
├── design/
│   ├── design-tokens.json  # Logical dimensions (390x844), colors, radii
│   └── reference/          # Reference layout files
├── dist/               # Standalone production build
├── screenshots/        # Visual verification screenshots across all modes & viewports
├── src/
│   ├── config/
│   │   ├── gameConfig.js   # Game dimensions, scoring rules, physics constants
│   │   └── levelConfig.js  # 30 level definitions across 3 themed worlds
│   ├── objects/
│   │   ├── Candy.js        # Candy object with physics, rotation & trail
│   │   ├── CandySpawner.js # Active & next candy preview queue
│   │   └── Character.js    # 9-frame character animations & cosmetic overlay layers
│   ├── scenes/
│   │   ├── BootScene.js
│   │   ├── PreloadScene.js
│   │   ├── HomeScene.js
│   │   ├── WorldSelectScene.js
│   │   ├── LevelSelectScene.js
│   │   ├── TutorialScene.js
│   │   ├── GameScene.js
│   │   ├── GameOverScene.js
│   │   ├── ShopScene.js
│   │   └── MissionScene.js
│   ├── storage/
│   │   └── SaveManager.js  # Schema v2 persistence with v1 automatic migration
│   ├── styles/
│   │   └── main.css        # Responsive styling and viewport constraints
│   ├── systems/
│   │   ├── AchievementManager.js # 9 lifetime achievements & rewards
│   │   ├── AudioManager.js       # Procedural Web Audio synthesizer & sound FX
│   │   ├── CollisionManager.js   # Calibrated mouth hitbox detection
│   │   ├── ComboManager.js       # Combo multipliers and milestones
│   │   ├── EconomyManager.js     # Candy Coin soft currency & store catalog
│   │   ├── InputManager.js       # Flick swipe & slingshot tension calculations
│   │   ├── LevelManager.js       # Campaign progression, stars, and unlocks
│   │   ├── MissionManager.js     # Deterministic daily quest generator & claims
│   │   ├── PowerUpManager.js     # Power-up active effects & physics hooks
│   │   └── ScoreManager.js       # Score calculation & record tracking
│   └── ui/
│       ├── HUD.js               # Score, goal banner, power-up shelf, and coin pill
│       ├── LevelIntroModal.js   # Pre-level target score & star requirements
│       ├── LevelCompleteModal.js# Post-level victory modal & star stamp animations
│       ├── PauseMenu.js         # Modal pause dialog
│       └── SettingsMenu.js      # Audio, vibration, and motion toggles
├── tests/
│   ├── gameplay.test.js           # Scoring, combo, and physics unit tests
│   ├── integration.test.js        # Pause, input, and settings integration
│   ├── lifecycle.test.js          # Lives depletion and game over lifecycle
│   ├── phase9.test.js             # Slingshot, haptics, and moving target
│   └── phase10_progression.test.js# Save migration, economy, levels, quests
├── index.html
├── package.json
├── server.js
└── build.js
```

---

## 📱 Responsive Display
The game is built with logical dimensions of **390 × 844** using Phaser's `Scale.FIT` and `autoCenter: Phaser.Scale.CENTER_BOTH`. It scales cleanly across mobile screens (iPhone, Android) and centers automatically on tablet and desktop displays with responsive touch controls.
