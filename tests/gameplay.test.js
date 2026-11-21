import test from 'node:test';
import assert from 'node:assert/strict';
import { ScoreManager } from '../src/systems/ScoreManager.js';
import { ComboManager } from '../src/systems/ComboManager.js';
import { SaveManager } from '../src/storage/SaveManager.js';
import { CollisionManager } from '../src/systems/CollisionManager.js';
import { InputManager } from '../src/systems/InputManager.js';

test('ScoreManager awards 10 points on normal hit', () => {
  const sm = new ScoreManager();
  assert.equal(sm.getScore(), 0);
  const result = sm.addHit({ perfect: false, comboMultiplier: 1 });
  assert.equal(result.addedPoints, 10);
  assert.equal(sm.getScore(), 10);
});

test('ScoreManager awards 15 points on perfect hit', () => {
  const sm = new ScoreManager();
  const result = sm.addHit({ perfect: true, comboMultiplier: 1 });
  assert.equal(result.addedPoints, 15);
  assert.equal(sm.getScore(), 15);
});

test('ScoreManager applies combo multiplier correctly', () => {
  const sm = new ScoreManager();
  const res1 = sm.addHit({ perfect: false, comboMultiplier: 2 });
  assert.equal(res1.addedPoints, 20);
  assert.equal(sm.getScore(), 20);

  const res2 = sm.addHit({ perfect: true, comboMultiplier: 3 });
  assert.equal(res2.addedPoints, 45); // 15 * 3
  assert.equal(sm.getScore(), 65);
});

test('ScoreManager tracks and updates high score', () => {
  const sm = new ScoreManager({ initialHighScore: 100 });
  assert.equal(sm.getHighScore(), 100);
  assert.equal(sm.isNewHighScore(), false);

  sm.addHit({ perfect: true, comboMultiplier: 10 }); // 150 points
  assert.equal(sm.getScore(), 150);
  assert.equal(sm.getHighScore(), 150);
  assert.equal(sm.isNewHighScore(), true);
});

test('ComboManager updates combo count and multipliers', () => {
  const cm = new ComboManager();
  assert.equal(cm.getCombo(), 0);
  assert.equal(cm.getMultiplier(), 1);

  // 1 hit
  cm.registerHit();
  assert.equal(cm.getCombo(), 1);
  assert.equal(cm.getMultiplier(), 1);

  // 2 hits
  cm.registerHit();
  assert.equal(cm.getCombo(), 2);
  assert.equal(cm.getMultiplier(), 1);

  // 3 hits -> x2
  cm.registerHit();
  assert.equal(cm.getCombo(), 3);
  assert.equal(cm.getMultiplier(), 2);

  // 5 hits -> x3
  cm.registerHit();
  cm.registerHit();
  assert.equal(cm.getCombo(), 5);
  assert.equal(cm.getMultiplier(), 3);

  // 10 hits -> x4
  for (let i = 0; i < 5; i++) cm.registerHit();
  assert.equal(cm.getCombo(), 10);
  assert.equal(cm.getMultiplier(), 4);
  assert.equal(cm.getMaxCombo(), 10);
});

test('ComboManager resets combo on miss', () => {
  const cm = new ComboManager();
  cm.registerHit();
  cm.registerHit();
  cm.registerHit();
  assert.equal(cm.getMultiplier(), 2);

  cm.registerMiss();
  assert.equal(cm.getCombo(), 0);
  assert.equal(cm.getMultiplier(), 1);
  assert.equal(cm.getMaxCombo(), 3);
});

test('CollisionManager detects mouth hit vs miss vs out-of-bounds', () => {
  const mouthZone = { x: 195, y: 235, width: 70, height: 50 };
  const cm = new CollisionManager({ mouthZone });

  // Inside mouth zone center
  const checkCenter = cm.checkMouthCollision(195, 235);
  assert.equal(checkCenter.hit, true);
  assert.equal(checkCenter.perfect, true);

  // Near edge of mouth
  const checkEdge = cm.checkMouthCollision(165, 235);
  assert.equal(checkEdge.hit, true);
  assert.equal(checkEdge.perfect, false);

  // Clearly outside mouth
  const checkOutside = cm.checkMouthCollision(100, 235);
  assert.equal(checkOutside.hit, false);

  // Out of bounds detection
  assert.equal(cm.isOutOfBounds({ x: 195, y: -20, width: 390, height: 844 }), true);
  assert.equal(cm.isOutOfBounds({ x: -30, y: 300, width: 390, height: 844 }), true);
  assert.equal(cm.isOutOfBounds({ x: 420, y: 300, width: 390, height: 844 }), true);
  assert.equal(cm.isOutOfBounds({ x: 195, y: 900, width: 390, height: 844 }), true);
  assert.equal(cm.isOutOfBounds({ x: 195, y: 400, width: 390, height: 844 }), false);
});

test('InputManager calculates clamped velocity and direction from swipe', () => {
  const im = new InputManager({
    minVelocity: 200,
    maxVelocity: 900,
    velocityMultiplier: 4.0
  });

  // Swipe upward: start (195, 690), end (195, 590) -> dy = -100, duration 100ms
  const throwData = im.calculateThrow({
    startX: 195,
    startY: 690,
    endX: 195,
    endY: 590,
    durationMs: 100
  });

  assert.equal(throwData.isValid, true);
  assert.ok(throwData.vy < 0, 'Velocity Y should be negative (upward)');
  assert.ok(Math.abs(throwData.vx) < 50, 'Velocity X should be near zero');
  assert.ok(throwData.speed >= 200 && throwData.speed <= 900, 'Speed must be clamped');
});

test('SaveManager handles LocalStorage mock persistence cleanly', () => {
  const mockStorage = {};
  const fakeLocalStorage = {
    getItem: (key) => mockStorage[key] || null,
    setItem: (key, val) => { mockStorage[key] = String(val); },
    removeItem: (key) => { delete mockStorage[key]; }
  };

  const sm = new SaveManager({ storage: fakeLocalStorage });
  assert.equal(sm.getHighScore(), 0);
  assert.equal(sm.getSoundEnabled(), true);

  sm.saveHighScore(2500);
  assert.equal(sm.getHighScore(), 2500);

  sm.setSoundEnabled(false);
  assert.equal(sm.getSoundEnabled(), false);

  // New instance reads persisted state
  const sm2 = new SaveManager({ storage: fakeLocalStorage });
  assert.equal(sm2.getHighScore(), 2500);
  assert.equal(sm2.getSoundEnabled(), false);
});
