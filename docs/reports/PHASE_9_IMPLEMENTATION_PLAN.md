# Gem Feeder — Phase 9 Implementation Plan

## Phase A: Audit & Skill Integration — [COMPLETED]
- [x] Create `PHASE_9_AUDIT.md`.
- [x] Create `PHASE_9_SKILLS_REPORT.md`.
- [x] Create `PHASE_9_IMPLEMENTATION_PLAN.md`.

## Phase B: Visual & Environmental Polish (Layering & Lighting)
- [ ] Implement layered background system in `GameScene.js` and `HomeScene.js`:
  - Soft ambient radial glow behind the character.
  - Floating ambient pastel bokeh/particle motes.
  - Polished shelf divider with soft layered shadows.
- [ ] Upgrade Candy rendering in `Candy.js`:
  - Dynamic squash-and-stretch on pullback and launch.
  - Glossy highlight specular reflection.
  - Rotation speed proportional to launch velocity.

## Phase C: Character Animation & Emotion
- [ ] In `Character.js`:
  - Implement dynamic anticipation opening as candies fly into mouth proximity.
  - Multi-frame eating crunch with head bounce and chewing sound synchronization.
  - Expressive Perfect Hit celebration with confetti burst.
  - Expressive Miss twitch with clean recovery to idle.
  - Prevent tween stacking and guarantee memory cleanup.

## Phase D: Game Physics & Throwing "Juice"
- [ ] In `InputManager.js` & `GameScene.js`:
  - Elastic slingshot pullback with double-line banded tension and anchor pegs.
  - Unified trajectory simulation matching active launch physics down to subpixel precision.
  - Luminous green trajectory lock indicator when shot is guaranteed on target.
  - Dynamic drag resistance feel.

## Phase E: Sound & Haptics Atmosphere
- [ ] In `AudioManager.js`:
  - Richer synthetic audio profiles (throw whoosh, juicy crunch, multi-note perfect chord, combo fanfare).
  - Layered BGM responding dynamically to combo multiplier.
  - Vibration toggle support in `SaveManager` (`vibrationEnabled`) with safe navigator check.

## Phase F: Complete UI/UX Redesign
- [ ] Upgrade `HUD.js`:
  - Tactile score card, pulsating combo badge, heart poof and refill animations.
- [ ] Upgrade `HomeScene.js`:
  - Sparkling logo, responsive 3D buttons with active state depressions.
- [ ] Upgrade `TutorialScene.js`:
  - Visual animated swipe hand/arrow demonstration.
- [ ] Upgrade `SettingsMenu.js`:
  - Toggles for Sound FX, BGM, Vibration, and Reduced Motion.
- [ ] Upgrade `GameOverScene.js`:
  - Score rollup counter tween, starburst high-score celebration, working clipboard/native share.

## Phase G: Responsiveness & Performance Benchmarking
- [ ] Verify viewports: 375x667, 390x844, 412x915, 768x1024, 1024x768.
- [ ] Particle pool recycling and zero memory leaks.
- [ ] Verify 60 FPS performance.

## Phase H: Verification & Documentation
- [ ] Run full automated test suite (`npm test`).
- [ ] Run Playwright automated browser verification and capture screenshots.
- [ ] Build production distribution (`npm run build`).
- [ ] Generate `PHASE_9_IMPLEMENTATION_REPORT.md`, `PHASE_9_TEST_REPORT.md`, and `PHASE_9_VISUAL_QA.md`.
