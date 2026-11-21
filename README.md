# Gem Feeder — Casual 2D Candy-Throwing Browser Game

A casual 2D candy-throwing browser game built with **Phaser.js 3.90**, **HTML5/CSS3**, **Phaser Arcade Physics**, **Web Audio API**, and **LocalStorage**.

---

## 🎮 Gameplay Overview

- **Aim & Flick:** Touch/click the active candy above the bottom candy packet, drag upward toward the character's open mouth, and release to throw.
- **Scoring:**
  - Normal Hit: **+10 points**
  - Perfect Hit (direct bullseye): **+15 points**
- **Combos:**
  - 3 Consecutive Hits: **x2 Multiplier**
  - 5 Consecutive Hits: **x3 Multiplier**
  - 10+ Consecutive Hits: **x4 Multiplier**
- **Lives:** You start with 3 hearts. Each miss resets your combo and removes 1 heart. Game over occurs at 0 hearts.
- **High Scores:** High scores persist automatically across sessions in `localStorage`.

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
Execute the unit and lifecycle test suite:
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
├── screenshots/        # Visual verification screenshots
├── src/
│   ├── config/
│   │   └── gameConfig.js   # Game dimensions, scoring rules, physics constants
│   ├── objects/
│   │   ├── Candy.js        # Candy object with physics, rotation & trail
│   │   ├── CandySpawner.js # Active & next candy preview queue
│   │   └── Character.js    # 9-frame character mouth animations & reactions
│   ├── scenes/
│   │   ├── BootScene.js
│   │   ├── PreloadScene.js
│   │   ├── HomeScene.js
│   │   ├── TutorialScene.js
│   │   ├── GameScene.js
│   │   └── GameOverScene.js
│   ├── storage/
│   │   └── SaveManager.js  # LocalStorage persistence for high scores & sound
│   ├── styles/
│   │   └── main.css        # Responsive styling and viewport constraints
│   ├── systems/
│   │   ├── AudioManager.js    # Procedural Web Audio synthesizer & BGM
│   │   ├── CollisionManager.js# Calibrated mouth hitbox detection
│   │   ├── ComboManager.js    # Combo multipliers and milestones
│   │   ├── InputManager.js    # Swipe distance and velocity clamping
│   │   └── ScoreManager.js    # Score calculation & record tracking
│   └── ui/
│       ├── HUD.js          # In-game score card, hearts, combo banner & next preview
│       ├── PauseMenu.js    # Modal pause dialog
│       └── SettingsMenu.js # Audio configuration modal
├── tests/
│   ├── gameplay.test.js    # Automated unit tests for managers & physics
│   └── lifecycle.test.js   # Automated integration tests for game lifecycle
├── index.html
├── package.json
├── server.js
├── build.js
├── PROJECT_AUDIT.md
├── ASSET_INVENTORY.md
├── DEVELOPMENT_PLAN.md
└── DEVELOPMENT_REPORT.md
```

---

## 📱 Responsive Display
The game is built with logical dimensions of **390 × 844** using Phaser's `Scale.FIT` and `autoCenter: Phaser.Scale.CENTER_BOTH`. It scales cleanly across mobile screens (iPhone, Android) and centers automatically on desktop displays.
