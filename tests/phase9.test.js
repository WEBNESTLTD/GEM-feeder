import test from 'node:test';
import assert from 'node:assert/strict';
import { SaveManager } from '../src/storage/SaveManager.js';
import { InputManager } from '../src/systems/InputManager.js';
import { CollisionManager } from '../src/systems/CollisionManager.js';
import { PHYSICS } from '../src/config/gameConfig.js';

test('Phase 9: SaveManager persists vibration and reduced motion flags', () => {
  const store = {};
  const mockStorage = {
    getItem: (key) => store[key] || null,
    setItem: (key, val) => { store[key] = String(val); },
    removeItem: (key) => { delete store[key]; }
  };

  const sm = new SaveManager({ storage: mockStorage });
  assert.equal(sm.getVibrationEnabled(), true, 'Default vibration should be true');
  assert.equal(sm.getReducedMotion(), false, 'Default reduced motion should be false');

  sm.setVibrationEnabled(false);
  sm.setReducedMotion(true);

  assert.equal(sm.getVibrationEnabled(), false);
  assert.equal(sm.getReducedMotion(), true);

  // Re-read in a fresh instance
  const sm2 = new SaveManager({ storage: mockStorage });
  assert.equal(sm2.getVibrationEnabled(), false, 'Persisted vibration should be false');
  assert.equal(sm2.getReducedMotion(), true, 'Persisted reduced motion should be true');
});

test('Phase 9: InputManager handles slingshot pull-back mode', () => {
  const im = new InputManager({
    minVelocity: PHYSICS.MIN_VELOCITY,
    maxVelocity: PHYSICS.MAX_VELOCITY,
    velocityMultiplier: PHYSICS.VELOCITY_MULTIPLIER,
    minDragDistance: PHYSICS.MIN_DRAG_DISTANCE,
    maxDragDistance: PHYSICS.MAX_DRAG_DISTANCE
  });

  // Pulling down from (195, 690) to (195, 760) -> dy = +70 (downward pull)
  const throwData = im.calculateThrowVelocity({
    startX: 195,
    startY: 690,
    currentX: 195,
    currentY: 760,
    durationMs: 250
  });

  assert.equal(throwData.isValid, true);
  assert.equal(throwData.isSlingshot, true);
  assert.ok(throwData.vy < 0, 'Slingshot pull-down must invert to negative (upward) launch velocity');
  assert.ok(Math.abs(throwData.vx) < 20, 'Straight down pull must result in minimal horizontal velocity');
});

test('Phase 9: Forward flick vs slingshot throw consistency', () => {
  const im = new InputManager({
    minVelocity: PHYSICS.MIN_VELOCITY,
    maxVelocity: PHYSICS.MAX_VELOCITY,
    velocityMultiplier: PHYSICS.VELOCITY_MULTIPLIER,
    minDragDistance: PHYSICS.MIN_DRAG_DISTANCE,
    maxDragDistance: PHYSICS.MAX_DRAG_DISTANCE
  });

  // Forward flick (upward swipe): start (195, 690) to current (195, 620)
  const flick = im.calculateThrowVelocity({
    startX: 195,
    startY: 690,
    currentX: 195,
    currentY: 620,
    durationMs: 120
  });

  assert.equal(flick.isValid, true);
  assert.equal(flick.isSlingshot, false);
  assert.ok(flick.vy < 0, 'Forward flick must produce upward launch velocity');
});

test('Phase 9: Dynamic collision check with sways at higher scores', () => {
  const cm = new CollisionManager({
    mouthZone: { x: 195, y: 240, width: 75, height: 55 },
    perfectRadius: 22
  });

  // Default center check
  assert.equal(cm.checkMouthCollision(195, 240).hit, true);
  assert.equal(cm.checkMouthCollision(195, 240).perfect, true);

  // Dynamic shift when character sways to x = 250
  cm.setMouthZone({ x: 250, y: 240, width: 75, height: 55 });
  assert.equal(cm.checkMouthCollision(195, 240).hit, false, 'Old center should no longer be a hit when mouth sways to 250');
  assert.equal(cm.checkMouthCollision(250, 240).hit, true, 'New shifted center must register hit');
  assert.equal(cm.checkMouthCollision(250, 240).perfect, true, 'New shifted center must register perfect');
});
