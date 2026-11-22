# GEM FEEDER — PHASE 10 IMPLEMENTATION PLAN
## Advanced Single-Player Arcade Experience & Progression System

**Branch:** `feature/phase-10-single-player-progression`  
**Status:** In Progress  

---

## Phase Breakdown & Execution Milestones

### Milestone 1: Save System v2 & Data Migration
- [ ] Create `SaveManager` v2 schema migration supporting:
  - `coins`: Current coin balance (default: 50 welcome bonus).
  - `unlockedWorlds`: Array of unlocked world IDs (`['world_1']`).
  - `levels`: Map of level progress (`{ [levelId]: { completed, stars, bestScore } }`).
  - `inventory`: Map of power-up quantities (`{ magnet: 2, slowmo: 1, multiplier: 1, shield: 1, precision: 2 }`).
  - `equipped`: Cosmetic setup (`{ outfit: 'default', accessory: 'none', tint: 'default' }`).
  - `purchasedCosmetics`: Array of owned cosmetic IDs.
  - `missions`: Daily mission state with date tracking (`{ lastDate, list: [...] }`).
  - `achievements`: Map of achievement progress (`{ [achId]: { progress, unlocked, claimed } }`).
- [ ] Write unit tests verifying migration from v1 to v2 without data loss in `tests/progression.test.js`.

### Milestone 2: Level Progression Architecture & Configuration
- [ ] Create `src/config/levelConfig.js`:
  - 30 levels defined across 3 worlds:
    - **World 1: Candy Garden (Lv 1–10):** Gentle curve, stationary target, teaches mechanics.
    - **World 2: Sugar Mountain (Lv 11–20):** Lateral sway, higher target scores, combo requirements.
    - **World 3: Chocolate Kingdom (Lv 21–30):** Obstacles, demanding target scores, precision trick shots.
- [ ] Create `src/systems/LevelManager.js`:
  - Query unlocked levels, calculate stars (1–3 stars based on score thresholds), unlock next level upon completion, record best score and stars.
- [ ] Write unit tests for `LevelManager`.

### Milestone 3: Reward Economy, Daily Missions & Achievements
- [ ] Create `src/systems/EconomyManager.js`:
  - Atomic transactions, earn coins, spend coins, validate balances, prevent double claims.
- [ ] Create `src/systems/MissionManager.js`:
  - Generate 3 daily missions based on local calendar date (`YYYY-MM-DD`).
  - Track events (`throws`, `catches`, `perfects`, `levels_completed`).
  - Claim mission rewards.
- [ ] Create `src/systems/AchievementManager.js`:
  - 9 achievements (First Catch, Perfect Aim, Combo Master, Candy Collector, Three-Star Champion, World Explorer, Power-Up Expert, No Miss Challenge, Arcade Legend).
- [ ] Create `src/systems/CustomizationManager.js`:
  - Catalog of accessories and cosmetic tints.
- [ ] Write unit tests covering economy, missions, achievements, and customization.

### Milestone 4: Power-Up System Implementation
- [ ] Create `src/systems/PowerUpManager.js`:
  - 5 Power-ups:
    1. **Candy Magnet:** Pulls candy toward mouth zone when close.
    2. **Slow Motion:** Scales physics time delta by 0.5x for precision aiming.
    3. **Score Multiplier:** 2x points during active window.
    4. **Protective Shield:** Absorbs 1 miss without deduction of life or combo break.
    5. **Precision Assist:** Extends trajectory line to 24 pips with guaranteed lock guide.
- [ ] Integrate power-up activation and HUD buttons into `GameScene`.

### Milestone 5: UI/UX Navigation Upgrades
- [ ] Create `src/scenes/WorldSelectScene.js`:
  - 3 interactive world cards (Candy Garden, Sugar Mountain, Chocolate Kingdom) with completion percentages and star counters.
- [ ] Create `src/scenes/LevelSelectScene.js`:
  - Scrollable level node map displaying level numbers, 0–3 stars, locked/unlocked states, and high scores.
- [ ] Create `src/scenes/ShopScene.js`:
  - Power-up restock store and Character customization salon (preview animations, coin purchases).
- [ ] Create `src/ui/LevelIntroModal.js` & `src/ui/LevelCompleteModal.js`:
  - Clean animated modals displaying target score, star milestones, coin earnings, and Next Level / Replay buttons.
- [ ] Update `HomeScene.js`:
  - New "Campaign" button leading to World Select, "Arcade" button for classic endless mode, "Shop" button, and "Missions" modal.
- [ ] Update `HUD.js`:
  - Level progress bar (current score vs 3-star thresholds), coin counter, and in-game power-up tray.

### Milestone 6: Gameplay Juice & Audio Synthesizer Polish
- [ ] Update `AudioManager.js`:
  - Procedural sound effects for coin collection, star fanfare, power-up activate, and world unlock.
- [ ] Polish particle celebrations on level completion and star reveals.

### Milestone 7: Testing, Visual QA & Documentation
- [ ] Run full automated test suite (`npm test`).
- [ ] Playwright visual inspection across 6 standard viewports.
- [ ] Create:
  - `PHASE_10_IMPLEMENTATION_REPORT.md`
  - `PHASE_10_TEST_REPORT.md`
  - `PHASE_10_VISUAL_QA.md`
  - `PHASE_10_PERFORMANCE_REPORT.md`
  - `PHASE_10_RELEASE_CHECKLIST.md`
  - Update `README.md`.
