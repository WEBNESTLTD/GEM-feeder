import test from 'node:test';
import assert from 'node:assert/strict';
import { SaveManager } from '../src/storage/SaveManager.js';
import { LevelManager } from '../src/systems/LevelManager.js';
import { EconomyManager } from '../src/systems/EconomyManager.js';
import { MissionManager } from '../src/systems/MissionManager.js';
import { AchievementManager } from '../src/systems/AchievementManager.js';
import { PowerUpManager } from '../src/systems/PowerUpManager.js';

test('Phase 10: SaveManager migrates v1 data into v2 schema seamlessly', () => {
  const store = {
    gem_feeder_save_v1: JSON.stringify({
      highScore: 1250,
      soundEnabled: true,
      musicEnabled: false,
      vibrationEnabled: true,
      reducedMotion: false
    })
  };
  const mockStorage = {
    getItem: (key) => store[key] || null,
    setItem: (key, val) => { store[key] = String(val); },
    removeItem: (key) => { delete store[key]; }
  };

  const sm = new SaveManager({ storage: mockStorage });
  assert.equal(sm.getHighScore(), 1250, 'High score must be preserved');
  assert.equal(sm.getMusicEnabled(), false, 'Music setting must be preserved');
  assert.equal(sm.getCoins(), 50, 'Welcome bonus coins should be granted');
  assert.equal(sm.isLevelUnlocked(1), true, 'Level 1 must be unlocked by default');
  assert.equal(sm.isLevelUnlocked(2), false, 'Level 2 must be locked by default');

  // Verify v2 was saved
  assert.ok(store.gem_feeder_save_v2, 'gem_feeder_save_v2 must be created');
});

test('Phase 10: LevelManager computes stars and unlocks next levels sequentially', () => {
  const store = {};
  const mockStorage = {
    getItem: (key) => store[key] || null,
    setItem: (key, val) => { store[key] = String(val); },
    removeItem: (key) => { delete store[key]; }
  };
  const sm = new SaveManager({ storage: mockStorage });
  const lm = new LevelManager({ saveManager: sm });

  const lvl1 = lm.getLevel(1);
  assert.ok(lvl1, 'Level 1 must exist');
  assert.equal(lvl1.worldId, 'world_1');

  // Score below threshold -> 0 stars
  assert.equal(lm.calculateStars(1, 30), 0);

  // Score meeting 1 star
  assert.equal(lm.calculateStars(1, lvl1.starThresholds[0]), 1);

  // Score meeting 3 stars
  assert.equal(lm.calculateStars(1, lvl1.starThresholds[2] + 20), 3);

  // Complete level 1 with 3 stars
  const res = lm.completeLevel(1, lvl1.starThresholds[2] + 20);
  assert.equal(res.success, true);
  assert.equal(res.stars, 3);
  assert.ok(res.coinsEarned > 0, 'Coins must be awarded');

  // Level 2 should now be unlocked
  assert.equal(sm.isLevelUnlocked(2), true, 'Level 2 must be unlocked after beating Level 1');
  assert.equal(sm.getLevelProgress(1).completed, true);
  assert.equal(sm.getLevelProgress(1).stars, 3);
});

test('Phase 10: EconomyManager validates coin balance and purchases', () => {
  const store = {};
  const mockStorage = {
    getItem: (key) => store[key] || null,
    setItem: (key, val) => { store[key] = String(val); },
    removeItem: (key) => { delete store[key]; }
  };
  const sm = new SaveManager({ storage: mockStorage });
  const em = new EconomyManager({ saveManager: sm });

  // Starting balance: 50
  assert.equal(em.getBalance(), 50);

  // Buy magnet (cost: 40)
  const buyRes = em.buyPowerUp('magnet');
  assert.equal(buyRes.success, true);
  assert.equal(em.getBalance(), 10);
  assert.equal(sm.getPowerUpCount('magnet'), 3); // initial 2 + 1

  // Try to buy another magnet with 10 coins -> should fail
  const failRes = em.buyPowerUp('magnet');
  assert.equal(failRes.success, false);
  assert.equal(em.getBalance(), 10, 'Balance must remain unchanged on failure');
});

test('Phase 10: MissionManager records event progress and claims rewards', () => {
  const store = {};
  const mockStorage = {
    getItem: (key) => store[key] || null,
    setItem: (key, val) => { store[key] = String(val); },
    removeItem: (key) => { delete store[key]; }
  };
  const sm = new SaveManager({ storage: mockStorage });
  const mm = new MissionManager({ saveManager: sm });

  const missions = mm.getDailyMissions();
  assert.equal(missions.length, 3);

  // Record 10 throws
  mm.recordEvent('throw', 10);
  const updatedMissions = mm.getDailyMissions();
  const throwMission = updatedMissions.find(m => m.id === 'm_throws');
  assert.equal(throwMission.completed, true);
  assert.equal(throwMission.claimed, false);

  const initialCoins = sm.getCoins();
  const claimRes = mm.claimReward('m_throws');
  assert.equal(claimRes.success, true);
  assert.equal(sm.getCoins(), initialCoins + throwMission.reward);

  // Claim again must fail
  const doubleClaim = mm.claimReward('m_throws');
  assert.equal(doubleClaim.success, false);
});

test('Phase 10: AchievementManager unlocks achievements and prevents duplicate claims', () => {
  const store = {};
  const mockStorage = {
    getItem: (key) => store[key] || null,
    setItem: (key, val) => { store[key] = String(val); },
    removeItem: (key) => { delete store[key]; }
  };
  const sm = new SaveManager({ storage: mockStorage });
  const am = new AchievementManager({ saveManager: sm });

  const unlocked = am.recordProgress('first_catch', 1);
  assert.ok(unlocked, 'First catch should unlock on 1');
  assert.equal(unlocked.id, 'first_catch');

  const initialCoins = sm.getCoins();
  const claimRes = am.claimReward('first_catch');
  assert.equal(claimRes, true);
  assert.equal(sm.getCoins(), initialCoins + unlocked.reward);

  // Double claim
  assert.equal(am.claimReward('first_catch'), false);
});

test('Phase 10: PowerUpManager handles shield absorption and slow motion scale', () => {
  const store = {};
  const mockStorage = {
    getItem: (key) => store[key] || null,
    setItem: (key, val) => { store[key] = String(val); },
    removeItem: (key) => { delete store[key]; }
  };
  const sm = new SaveManager({ storage: mockStorage });
  const pum = new PowerUpManager(null, { saveManager: sm });

  assert.equal(pum.getTimeScale(), 1.0);
  assert.equal(pum.consumeShield(), false);

  // Activate shield
  const activated = pum.activatePowerUp('shield');
  assert.equal(activated, true);
  assert.equal(pum.isPowerUpActive('shield'), true);

  // Consume shield
  assert.equal(pum.consumeShield(), true);
  assert.equal(pum.isPowerUpActive('shield'), false);
});
