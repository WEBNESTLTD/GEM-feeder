import test from 'node:test';
import assert from 'node:assert/strict';
import { TrajectoryPhysics } from '../src/systems/TrajectoryPhysics.js';
import { EnvironmentManager } from '../src/systems/EnvironmentManager.js';
import { ParticleEngine } from '../src/systems/ParticleEngine.js';
import { SaveManager } from '../src/storage/SaveManager.js';
import { audioManager } from '../src/systems/AudioManager.js';
import { PHYSICS } from '../src/config/gameConfig.js';

// Mock Storage Helper
function createMockStorage() {
  const store = {};
  return {
    getItem(key) { return store[key] || null; },
    setItem(key, val) { store[key] = String(val); },
    removeItem(key) { delete store[key]; },
    clear() { for (const k in store) delete store[k]; }
  };
}

function createMockGraphics() {
  let x = 0, y = 0, alpha = 1, scale = 1, visible = true, depth = 0, rotation = 0;
  return {
    x, y, alpha, scale, visible, depth, rotation,
    clear() { return this; },
    fillStyle() { return this; },
    lineStyle() { return this; },
    fillRect() { return this; },
    fillCircle() { return this; },
    fillRoundedRect() { return this; },
    fillGradientStyle() { return this; },
    fillTriangle() { return this; },
    beginPath() { return this; },
    moveTo() { return this; },
    lineTo() { return this; },
    closePath() { return this; },
    fillPath() { return this; },
    strokePath() { return this; },
    arc() { return this; },
    setDepth(d) { depth = d; return this; },
    setVisible(v) { visible = v; return this; },
    setAlpha(a) { alpha = a; return this; },
    setScale(s) { scale = s; return this; },
    setPosition(px, py) { this.x = px; this.y = py; return this; },
    setRotation(r) { rotation = r; return this; }
  };
}

test('Phase 11: TrajectoryPhysics single step calculation matches arcade physics exactly', () => {
  const dt = 0.04;
  const gravity = PHYSICS.GRAVITY_Y;
  const initial = { x: 195, y: 690, vx: 50, vy: -450 };

  const next = TrajectoryPhysics.step(initial.x, initial.y, initial.vx, initial.vy, dt, gravity);

  const expectedX = 195 + 50 * dt;
  const expectedY = 690 + (-450) * dt + 0.5 * gravity * dt * dt;
  const expectedVy = -450 + gravity * dt;

  assert.equal(next.x, expectedX);
  assert.equal(next.y, expectedY);
  assert.equal(next.vy, expectedVy);
});

test('Phase 11: TrajectoryPhysics generateTrajectory detects mouth collision lock and respects slowmo', () => {
  const mouthZone = { x: 195, y: 240, width: 75, height: 55 };

  // Trajectory directly aimed at mouth
  const trajAimed = TrajectoryPhysics.generateTrajectory({
    startX: 195,
    startY: 690,
    vx: 0,
    vy: -850,
    count: 28,
    timeScale: 1.0,
    mouthZone
  });

  assert.equal(trajAimed.points.length, 28);
  assert.equal(trajAimed.hitsMouth, true, 'Trajectory aimed vertically toward mouth should hit mouthZone');

  // Trajectory thrown sideways out of mouth zone
  const trajMiss = TrajectoryPhysics.generateTrajectory({
    startX: 195,
    startY: 690,
    vx: 600,
    vy: -200,
    count: 28,
    timeScale: 1.0,
    mouthZone
  });

  assert.equal(trajMiss.hitsMouth, false, 'Sideways throw should not hit mouthZone');

  // Slowmo timescale 0.55 should scale step dt
  const trajSlow = TrajectoryPhysics.generateTrajectory({
    startX: 195,
    startY: 690,
    vx: 0,
    vy: -850,
    count: 28,
    timeScale: 0.55,
    mouthZone
  });

  assert.equal(trajSlow.points.length, 28);
  // With slower timescale, distance traveled after 16 steps is noticeably smaller
  const distNormal = 690 - trajAimed.points[15].y;
  const distSlow = 690 - trajSlow.points[15].y;
  assert.ok(distSlow < distNormal, 'Slowmo trajectory should advance distance slower per step');
});

test('Phase 11: ParticleEngine object pool allocates fixed pool and recycles without unbounded growth', () => {
  // Mock Phaser Scene
  const mockScene = {
    add: {
      graphics: () => createMockGraphics(),
      container: (x, y) => ({
        x, y,
        depth: 0,
        setDepth(d) { this.depth = d; return this; },
        setPosition(px, py) { this.x = px; this.y = py; return this; },
        add() { return this; },
        removeAll() { return this; }
      })
    }
  };

  const engine = new ParticleEngine(mockScene, { poolSize: 40 });
  assert.equal(engine.pool.length, 40, 'Pool should initialize with requested capacity');
  assert.equal(engine.active.length, 0, 'No active particles initially');

  // Emit 10 particles
  engine.emitBurst(195, 240, 10, { color: 0xFF5CAA, minSpeed: 50, maxSpeed: 100 });
  assert.equal(engine.active.length, 10, '10 particles should be active');
  assert.equal(engine.pool.length, 30, '30 particles should remain available in pool');

  // Fast forward delta time to expire particles (life is 400-800ms)
  engine.update(1000);
  assert.equal(engine.active.length, 0, 'All particles should be expired and recycled');
  assert.equal(engine.pool.length, 40, 'All 40 particles should be back in pool');

  // Verify pool does not grow beyond max size
  engine.emitCatch(195, 240, '#FFD93D');
  engine.clear();
  assert.equal(engine.active.length, 0);
  assert.equal(engine.pool.length, 40);
});

test('Phase 11: EnvironmentManager configures distinctive world themes and respects reducedMotion', () => {
  // Mock Phaser Scene
  const mockScene = {
    add: {
      graphics: () => createMockGraphics(),
      container: (x, y) => ({
        x, y,
        depth: 0,
        setDepth(d) { this.depth = d; return this; },
        setPosition(px, py) { this.x = px; this.y = py; return this; },
        add() { return this; },
        removeAll() { return this; }
      })
    }
  };

  const envW1 = new EnvironmentManager(mockScene, { worldId: 'world_1', reducedMotion: false });
  assert.equal(envW1.theme.id, 'world_1');
  assert.equal(envW1.theme.name, 'Candy Garden');
  assert.ok(envW1.clouds.length > 0);
  assert.equal(envW1.reducedMotion, false);

  const envW2 = new EnvironmentManager(mockScene, { worldId: 'world_2', reducedMotion: true });
  assert.equal(envW2.theme.id, 'world_2');
  assert.equal(envW2.theme.name, 'Sugar Mountain');
  assert.equal(envW2.reducedMotion, true);

  const envW3 = new EnvironmentManager(mockScene, { worldId: 'world_3', reducedMotion: false });
  assert.equal(envW3.theme.id, 'world_3');
  assert.equal(envW3.theme.name, 'Chocolate Kingdom');

  // Updating environment with reduced motion maintains static positions
  const cloudInitialX = envW2.clouds[0].x;
  envW2.update(1000, 16);
  assert.equal(envW2.clouds[0].x, cloudInitialX, 'Clouds should remain stationary when reducedMotion is true');
});

test('Phase 11: SaveManager and AudioManager volume gain controls persist and clamp accurately', () => {
  const storage = createMockStorage();
  const sm = new SaveManager({ storage });

  // Default values
  assert.equal(sm.getMusicVolume(), 0.7);
  assert.equal(sm.getSFXVolume(), 0.85);

  // Set and clamp
  sm.setMusicVolume(0.45);
  sm.setSFXVolume(0.9);
  assert.equal(sm.getMusicVolume(), 0.45);
  assert.equal(sm.getSFXVolume(), 0.9);

  // Clamp above 1 and below 0
  sm.setMusicVolume(1.8);
  assert.equal(sm.getMusicVolume(), 1.0);
  sm.setMusicVolume(-0.5);
  assert.equal(sm.getMusicVolume(), 0.0);

  // New instance re-loads persisted volume
  const sm2 = new SaveManager({ storage });
  assert.equal(sm2.getMusicVolume(), 0.0);
  assert.equal(sm2.getSFXVolume(), 0.9);

  // AudioManager volume wrappers
  audioManager.setMusicVolume(0.65);
  assert.equal(audioManager.getMusicVolume(), 0.65);
  audioManager.setSFXVolume(0.75);
  assert.equal(audioManager.getSFXVolume(), 0.75);

  // Synthesizer methods execute cleanly without throwing
  assert.doesNotThrow(() => {
    audioManager.playPickup();
    audioManager.playLaunch();
    audioManager.playGoldenBell();
    audioManager.playMissThud();
    audioManager.playFanfare();
  });
});
