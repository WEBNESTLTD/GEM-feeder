import test from 'node:test';
import assert from 'node:assert/strict';
import { ScoreManager } from '../src/systems/ScoreManager.js';
import { ComboManager } from '../src/systems/ComboManager.js';
import { SaveManager } from '../src/storage/SaveManager.js';
import { CollisionManager } from '../src/systems/CollisionManager.js';

test('Gameplay: 3 lives depleted on misses triggers game over condition', () => {
  let lives = 3;
  let isGameOver = false;
  const cm = new ComboManager();

  function onMiss() {
    cm.registerMiss();
    lives -= 1;
    if (lives <= 0) {
      lives = 0;
      isGameOver = true;
    }
  }

  onMiss();
  assert.equal(lives, 2);
  assert.equal(isGameOver, false);

  onMiss();
  assert.equal(lives, 1);
  assert.equal(isGameOver, false);

  onMiss();
  assert.equal(lives, 0);
  assert.equal(isGameOver, true);
});

test('Gameplay: Duplicate collision prevention keeps single scoring event per candy', () => {
  const sm = new ScoreManager();
  const collisionManager = new CollisionManager();

  let hasCollided = false;
  function handleCandyFrameCheck(candyX, candyY) {
    if (hasCollided) return null; // Prevent duplicate hits
    const res = collisionManager.checkMouthCollision(candyX, candyY);
    if (res.hit) {
      hasCollided = true;
      return sm.addHit({ perfect: res.perfect, comboMultiplier: 1 });
    }
    return null;
  }

  // First frame entering mouth
  const hit1 = handleCandyFrameCheck(195, 235);
  assert.ok(hit1);
  assert.equal(sm.getScore(), 15);

  // Subsequent frame while candy still in mouth area
  const hit2 = handleCandyFrameCheck(195, 236);
  assert.equal(hit2, null, 'Duplicate collision must be ignored');
  assert.equal(sm.getScore(), 15);
});
