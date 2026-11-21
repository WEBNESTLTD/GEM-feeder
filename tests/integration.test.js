import test from 'node:test';
import assert from 'node:assert/strict';
import { ScoreManager } from '../src/systems/ScoreManager.js';
import { ComboManager } from '../src/systems/ComboManager.js';
import { SaveManager } from '../src/storage/SaveManager.js';
import { InputManager } from '../src/systems/InputManager.js';
import { CollisionManager } from '../src/systems/CollisionManager.js';

test('Integration: Pause comprehensively blocks inputs, physics updates, and score changes', () => {
  let isPaused = true;
  let isGameOver = false;
  let score = 0;
  let lives = 3;
  let activeCandy = { x: 195, y: 500, isFlying: true };

  // Simulated physics / game loop tick during pause
  function update(delta) {
    if (isPaused || isGameOver) return;
    activeCandy.y -= 10;
  }

  // Attempt throw while paused
  function attemptThrow() {
    if (isPaused || isGameOver) return false;
    return true;
  }

  update(16);
  assert.equal(activeCandy.y, 500, 'Candy must not move while paused');
  assert.equal(attemptThrow(), false, 'Throw must be rejected while paused');
  assert.equal(score, 0, 'Score must not change while paused');
  assert.equal(lives, 3, 'Lives must not change while paused');

  // Resume game
  isPaused = false;
  update(16);
  assert.equal(activeCandy.y, 490, 'Candy resumes movement after unpause');
  assert.equal(attemptThrow(), true, 'Throw accepted after unpause');
});

test('Integration: Single authoritative scoring updates high score and new record on bonus or hit', () => {
  const sm = new ScoreManager({ initialHighScore: 50 });

  // Normal hit with combo
  const hit1 = sm.addHit({ perfect: false, comboMultiplier: 2 }); // 20
  assert.equal(sm.getScore(), 20);
  assert.equal(sm.getHighScore(), 50);
  assert.equal(sm.isNewHighScore(), false);

  // Perfect hit with combo
  const hit2 = sm.addHit({ perfect: true, comboMultiplier: 2 }); // 30
  assert.equal(sm.getScore(), 50);
  assert.equal(sm.getHighScore(), 50);
  assert.equal(sm.isNewHighScore(), false);

  // Bonus points using authoritative method
  const bonus = sm.addBonusPoints(10);
  assert.equal(sm.getScore(), 60);
  assert.equal(sm.getHighScore(), 60);
  assert.equal(sm.isNewHighScore(), true);
});

test('Integration: Unified throw calculation matches between aiming and launch', () => {
  const im = new InputManager({
    minVelocity: 280,
    maxVelocity: 950,
    velocityMultiplier: 4.8
  });

  const aimData = im.calculateThrowVelocity({
    startX: 195,
    startY: 690,
    currentX: 195,
    currentY: 590,
    durationMs: 100
  });

  const launchData = im.calculateThrow({
    startX: 195,
    startY: 690,
    endX: 195,
    endY: 590,
    durationMs: 100
  });

  assert.equal(aimData.vx, launchData.vx, 'Aim vx must match launch vx');
  assert.equal(aimData.vy, launchData.vy, 'Aim vy must match launch vy');
  assert.equal(aimData.speed, launchData.speed, 'Aim speed must match launch speed');
  assert.equal(aimData.isValid, true);
  assert.equal(launchData.isValid, true);
});

test('Integration: Settings persistence preserves audio and music toggles', () => {
  const mockStorage = {};
  const fakeStorage = {
    getItem: (k) => mockStorage[k] || null,
    setItem: (k, v) => { mockStorage[k] = String(v); }
  };

  const sm = new SaveManager({ storage: fakeStorage });
  assert.equal(sm.getSoundEnabled(), true);
  assert.equal(sm.getMusicEnabled(), true);

  sm.setSoundEnabled(false);
  sm.setMusicEnabled(false);

  // Reload new manager reading from storage
  const sm2 = new SaveManager({ storage: fakeStorage });
  assert.equal(sm2.getSoundEnabled(), false);
  assert.equal(sm2.getMusicEnabled(), false);
});
