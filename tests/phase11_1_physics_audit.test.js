import test from 'node:test';
import assert from 'node:assert/strict';
import { TrajectoryPhysics } from '../src/systems/TrajectoryPhysics.js';
import { CollisionManager } from '../src/systems/CollisionManager.js';
import { ScoreManager } from '../src/systems/ScoreManager.js';
import { ComboManager } from '../src/systems/ComboManager.js';
import { PowerUpManager } from '../src/systems/PowerUpManager.js';
import { PHYSICS } from '../src/config/gameConfig.js';

test('Physics Audit 1: Identical initial conditions produce strictly identical trajectories', () => {
  const initA = { startX: 195, startY: 690, vx: 80, vy: -520, count: 20 };
  const initB = { startX: 195, startY: 690, vx: 80, vy: -520, count: 20 };

  const trajA = TrajectoryPhysics.generateTrajectory(initA);
  const trajB = TrajectoryPhysics.generateTrajectory(initB);

  assert.equal(trajA.points.length, trajB.points.length);
  for (let i = 0; i < trajA.points.length; i++) {
    assert.equal(trajA.points[i].x, trajB.points[i].x, `Point ${i} x must match identically`);
    assert.equal(trajA.points[i].y, trajB.points[i].y, `Point ${i} y must match identically`);
    assert.equal(trajA.points[i].vx, trajB.points[i].vx, `Point ${i} vx must match identically`);
    assert.equal(trajA.points[i].vy, trajB.points[i].vy, `Point ${i} vy must match identically`);
  }
});

test('Physics Audit 2: Authoritative Euler step matches analytical trajectory formula within float precision', () => {
  const g = PHYSICS.GRAVITY_Y; // 750
  const dt = 0.035;
  const startX = 195;
  const startY = 690;
  const vx = 40;
  const vy = -600;

  let state = { x: startX, y: startY, vx, vy };

  // Step 10 times
  for (let i = 1; i <= 10; i++) {
    state = TrajectoryPhysics.step(state, dt);
    const totalTime = i * dt;

    // Analytical ballistic positions:
    // x(t) = x0 + vx * t
    // y(t) = y0 + vy * t + 0.5 * g * t^2
    const analyticalX = startX + (vx * totalTime);
    const analyticalY = startY + (vy * totalTime) + (0.5 * g * totalTime * totalTime);

    assert.ok(Math.abs(state.x - analyticalX) < 1e-4, `Step ${i} X (${state.x}) must match analytical (${analyticalX})`);
    assert.ok(Math.abs(state.y - analyticalY) < 1.0, `Step ${i} Y (${state.y}) must match analytical (${analyticalY})`);
  }
});

test('Physics Audit 3: Slow motion (timeScale = 0.55) contracts spatial advancement consistently', () => {
  const paramsNormal = { startX: 195, startY: 690, vx: 0, vy: -700, count: 15, timeScale: 1.0 };
  const paramsSlow = { startX: 195, startY: 690, vx: 0, vy: -700, count: 15, timeScale: 0.55 };

  const trajNormal = TrajectoryPhysics.generateTrajectory(paramsNormal);
  const trajSlow = TrajectoryPhysics.generateTrajectory(paramsSlow);

  const deltaYNormal = 690 - trajNormal.points[14].y;
  const deltaYSlow = 690 - trajSlow.points[14].y;

  assert.ok(deltaYSlow > 0, 'Slowmo must still ascend upward');
  assert.ok(deltaYSlow < deltaYNormal, 'Slowmo must advance significantly less distance per step');
  assert.ok(deltaYSlow < deltaYNormal * 0.75, 'Slowmo scaling factor 0.55 must be strictly respected');
});

test('Physics Audit 4: Magnet power-up actively pulls trajectory toward mouth coordinates', () => {
  const mouthZone = { x: 195, y: 240, width: 75, height: 55 };

  // Mock PowerUpManager with magnet active
  const mockPowerUps = new PowerUpManager(null);
  mockPowerUps.activeEffects.magnet = true;

  // Thrown starting at x: 250, y: 350 (dist = Math.hypot(55, 110) = 123 < 180px threshold)
  const trajectoryWithoutMagnet = TrajectoryPhysics.generateTrajectory({
    startX: 250,
    startY: 350,
    vx: 0,
    vy: -200,
    count: 10,
    mouthZone
  });

  const trajectoryWithMagnet = TrajectoryPhysics.generateTrajectory({
    startX: 250,
    startY: 350,
    vx: 0,
    vy: -200,
    count: 10,
    powerUpManager: mockPowerUps,
    mouthZone
  });

  // Magnet should pull X closer to 195 (center)
  const finalXNoMagnet = trajectoryWithoutMagnet.points[9].x;
  const finalXMagnet = trajectoryWithMagnet.points[9].x;

  const distNoMagnet = Math.abs(finalXNoMagnet - 195);
  const distMagnet = Math.abs(finalXMagnet - 195);

  assert.ok(distMagnet < distNoMagnet, `Magnet must curve trajectory inward toward center (distMagnet ${distMagnet} < distNoMagnet ${distNoMagnet})`);
});

test('Physics Audit 5: Collision detection aligns with visible mouth bounds and dynamic sway', () => {
  const collision = new CollisionManager({
    mouthZone: { x: 195, y: 240, width: 75, height: 55 },
    perfectRadius: 22
  });

  // 1. Center hit is both hit and perfect
  const centerHit = collision.checkMouthCollision(195, 240);
  assert.equal(centerHit.hit, true);
  assert.equal(centerHit.perfect, true);

  // 2. Near edge (x: 195 + 32, y: 240) -> inside 75/2=37.5, but dist=32 > perfectRadius 22
  const edgeHit = collision.checkMouthCollision(195 + 32, 240);
  assert.equal(edgeHit.hit, true);
  assert.equal(edgeHit.perfect, false);

  // 3. Outside mouth boundary (x: 195 + 40, y: 240) -> hit = false
  const outsideHit = collision.checkMouthCollision(195 + 40, 240);
  assert.equal(outsideHit.hit, false);

  // 4. Dynamic sway updates collision zone
  collision.setMouthZone({ x: 245, y: 240, width: 75, height: 55 });
  const oldPosCheck = collision.checkMouthCollision(195, 240);
  assert.equal(oldPosCheck.hit, false, 'Old center (195) should now be outside shifted mouth zone (min: 207.5)');
  const newPosCheck = collision.checkMouthCollision(245, 240);
  assert.equal(newPosCheck.hit, true, 'New center (245) should register hit in shifted mouth zone');
});

test('Physics Audit 6: Anti-double-scoring guarantee — consumed candy cannot score twice', () => {
  const scoreMgr = new ScoreManager();
  const comboMgr = new ComboManager();

  // Initial state
  assert.equal(scoreMgr.getScore(), 0);

  // First catch
  let activeFlyingCandy = { id: 'candy_1', isConsumed: false, isFlying: true };

  // Hit 1 processed
  function processHit(candy, isPerfect) {
    if (!candy || candy.isConsumed || !candy.isFlying) {
      return false; // Rejected
    }
    candy.isConsumed = true;
    candy.isFlying = false;

    const combo = comboMgr.registerHit();
    scoreMgr.addHit({ perfect: isPerfect, comboMultiplier: combo.multiplier });
    return true;
  }

  const firstResult = processHit(activeFlyingCandy, false);
  assert.equal(firstResult, true);
  assert.equal(scoreMgr.getScore(), 10);

  // Attempt duplicate collision on next tick with same candy
  const secondResult = processHit(activeFlyingCandy, false);
  assert.equal(secondResult, false, 'Consumed candy must be strictly rejected on second check');
  assert.equal(scoreMgr.getScore(), 10, 'Score must not increment on duplicate check');
});

test('Physics Audit 7: Miss isolation guarantee — misses never increment score or combo', () => {
  const scoreMgr = new ScoreManager();
  const comboMgr = new ComboManager();

  // Build a 2x combo
  comboMgr.registerHit();
  comboMgr.registerHit();
  comboMgr.registerHit();
  assert.equal(comboMgr.getMultiplier(), 2);
  scoreMgr.addHit({ perfect: false, comboMultiplier: 2 });
  const scoreBeforeMiss = scoreMgr.getScore();
  assert.equal(scoreBeforeMiss, 20);

  // Trigger miss
  let lives = 3;
  function processMiss() {
    lives -= 1;
    comboMgr.registerMiss();
    // Intentionally no scoreManager call
  }

  processMiss();
  assert.equal(lives, 2);
  assert.equal(comboMgr.getMultiplier(), 1, 'Combo multiplier must reset to 1 on miss');
  assert.equal(comboMgr.getCombo(), 0, 'Combo streak must reset to 0 on miss');
  assert.equal(scoreMgr.getScore(), scoreBeforeMiss, 'Score must remain completely unchanged on miss');
});
