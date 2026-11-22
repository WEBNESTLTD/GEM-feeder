# Gem Feeder — Development Plan

## 1. Project Overview & Target Architecture

- **Project**: Gem Feeder (Casual 2D Candy-Throwing Browser Game)
- **Engine**: Phaser 3 (v3.80+) + Vite + Vanilla ES Modules
- **Physics**: Phaser Arcade Physics
- **Audio**: Web Audio procedural sound synthesizer (reliable, zero missing assets, autoplay compliant)
- **State/Storage**: LocalStorage (`gem_feeder_save_v1`)
- **Testing**: Vitest unit test suite + Playwright browser automation suite

---

## 2. Phase-by-Phase Roadmap

### Phase 1: Project Foundation & Asset Pipeline
- [ ] Initialize `package.json` with `phaser`, `vite`, `vitest`.
- [ ] Configure `vite.config.js` with static asset handling.
- [ ] Create `index.html` loading Google Font 'Fredoka' and game container.
- [ ] Setup `src/styles/main.css` for full-window viewport, no scrolling, touch-action none.
- [ ] Setup `src/config/gameConfig.js` defining Phaser configuration (390x844 logical size, Scale.FIT, Arcade Physics).
- [ ] Implement `src/scenes/BootScene.js` and `src/scenes/PreloadScene.js` loading all PNG and SVG assets.
- [ ] Verify build and asset loading in dev server.

### Phase 2: Core Gameplay Mechanics & Projectile Physics
- [ ] Implement `src/objects/Candy.js` with Arcade Physics, gravity, rotation, and flight trail.
- [ ] Implement `src/objects/CandySpawner.js` managing active candy and next preview candy.
- [ ] Implement `src/systems/InputManager.js` supporting mouse and touch swipe/drag-release with velocity clamping.
- [ ] Prevent multiple simultaneous throws or throws while paused/inactive.
- [ ] Unit test throw velocity calculation, trajectory math, and throw state machine.

### Phase 3: Character Animations & Hitbox Calibration
- [ ] Implement `src/objects/Character.js` using the 9 mouth frames (`mouth_0` through `mouth_8`).
- [ ] Create mouth animations: idle breathing, anticipation opening as candy approaches, eating chew upon catch, miss sadness/idle reset.
- [ ] Implement `src/systems/CollisionManager.js` with calibrated mouth zone and bounds checking.
- [ ] Differentiate between normal hit (+10) and perfect hit (+15).
- [ ] Unit test collision detection, out-of-bounds miss detection, and duplicate collision prevention.

### Phase 4: Scoring, Combo System, Lives & Game Over
- [ ] Implement `src/systems/ScoreManager.js` (Normal +10, Perfect +15, High score tracking).
- [ ] Implement `src/systems/ComboManager.js` (3 hits -> x2, 5 hits -> x3, 10 hits -> x4; miss resets combo).
- [ ] Implement player lives (3 starting hearts; 1 lost on miss; zero triggers game over).
- [ ] Implement `src/storage/SaveManager.js` persisting high score and sound preferences.
- [ ] TDD: Unit test score calculation, combo multipliers, combo resets, life loss, and high score persistence.

### Phase 5: UI Scenes, Menus & HUD
- [ ] Implement `src/ui/HUD.js` displaying score, high score, 3 hearts, combo banner, candy packet, and next candy preview.
- [ ] Implement `src/scenes/HomeScene.js` with Gem Feeder logo, character portrait, Play button, How to Play button, sound toggle, best score.
- [ ] Implement `src/scenes/TutorialScene.js` with 3 steps (Touch candy, Swipe toward character, Feed character) and Start Playing button.
- [ ] Implement `src/ui/PauseMenu.js` (Resume, Restart, Home, Sound toggle).
- [ ] Implement `src/scenes/GameOverScene.js` (Final score, Best score, Highest combo, New Record badge, Play Again, Home).
- [ ] Implement `src/ui/SettingsMenu.js` / modal settings.

### Phase 6: Audio, Visual Effects & Polish
- [ ] Implement `src/systems/AudioManager.js` using Web Audio API synthesis for throw, hit, perfect hit, miss, combo, button click, and gentle upbeat background melody.
- [ ] Implement hit celebration particles (colored candy stars/bursts).
- [ ] Implement floating text popups (+10, +15 Perfect!, COMBO x2!).
- [ ] Implement screen shake on miss.
- [ ] Implement candy trail particles / arc dots.

### Phase 7: Responsive Verification, Automated Browser Testing & Production Build
- [ ] Run complete automated Vitest suite.
- [ ] Run Playwright browser automation tests across mobile viewports (375x667, 390x844, 412x915) and desktop (1024x768).
- [ ] Capture screenshots of Home, Tutorial, Gameplay, Pause, and GameOver screens.
- [ ] Verify production build (`npm run build`).
- [ ] Generate `DEVELOPMENT_REPORT.md` and complete documentation.
