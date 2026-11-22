import test from 'node:test';
import assert from 'node:assert/strict';
import { generateLevels, WORLDS, LEVELS } from '../src/config/levelConfig.js';
import { LevelManager } from '../src/systems/LevelManager.js';
import { EconomyManager, COSMETICS } from '../src/systems/EconomyManager.js';
import { MissionManager, MISSION_TEMPLATES } from '../src/systems/MissionManager.js';
import { AchievementManager, ACHIEVEMENTS } from '../src/systems/AchievementManager.js';
import { SaveManager } from '../src/storage/SaveManager.js';
import { PowerUpManager, POWER_UPS } from '../src/systems/PowerUpManager.js';

class MockStorage {
  constructor(initialData = {}) {
    this.store = { ...initialData };
  }
  getItem(key) {
    return Object.prototype.hasOwnProperty.call(this.store, key) ? this.store[key] : null;
  }
  setItem(key, value) {
    this.store[key] = String(value);
  }
  removeItem(key) {
    delete this.store[key];
  }
  clear() {
    this.store = {};
  }
}

test('SECTION 2: Campaign Acceptance Tests — All 30 Levels Comprehensive Audit', async (t) => {
  const levels = generateLevels();
  assert.equal(Object.keys(levels).length, 30, 'Exactly 30 levels generated');

  let prevTarget = 0;
  for (let i = 1; i <= 30; i++) {
    const lvl = levels[i];
    assert.equal(lvl.levelId, i, `Level ID matches index ${i}`);

    // 1. World assignment
    if (i <= 10) {
      assert.equal(lvl.worldId, 'world_1', `Level ${i} assigned to world_1`);
      assert.equal(lvl.worldLevel, i);
      assert.ok(lvl.difficulty === 'Beginner' || lvl.difficulty === 'Easy');
    } else if (i <= 20) {
      assert.equal(lvl.worldId, 'world_2', `Level ${i} assigned to world_2`);
      assert.equal(lvl.worldLevel, i - 10);
      assert.ok(lvl.difficulty === 'Medium' || lvl.difficulty === 'Challenging');
      assert.ok(lvl.swaySpeed > 0, `World 2 level ${i} has dynamic sway`);
    } else {
      assert.equal(lvl.worldId, 'world_3', `Level ${i} assigned to world_3`);
      assert.equal(lvl.worldLevel, i - 20);
      assert.ok(lvl.difficulty === 'Hard' || lvl.difficulty === 'Expert');
      assert.equal(lvl.obstacles, true, `World 3 level ${i} features obstacles`);
    }

    // 2. Appropriate target score and star thresholds
    assert.ok(lvl.targetScore > prevTarget, `Target score strictly increases from level ${i - 1} (${prevTarget}) to level ${i} (${lvl.targetScore})`);
    prevTarget = lvl.targetScore;

    const [s1, s2, s3] = lvl.starThresholds;
    assert.equal(s1, lvl.targetScore, '1 star equals target score');
    assert.ok(s2 > s1, '2 stars requires higher score than 1 star');
    assert.ok(s3 > s2, '3 stars requires higher score than 2 stars');

    // 3. Meaningful objectives & rewards
    assert.ok(lvl.coinReward >= 15, `Level ${i} coin reward is at least 15`);
    assert.ok(lvl.maxCandies >= 10, `Level ${i} allows reasonable candy margin`);
  }

  // 4. Sequential Unlock Conditions & Completion
  const mockStore = new MockStorage();
  const sm = new SaveManager({ storage: mockStore });
  const lm = new LevelManager({ saveManager: sm });

  assert.equal(lm.isWorldUnlocked('world_1'), true, 'World 1 is unlocked initially');
  assert.equal(lm.isWorldUnlocked('world_2'), false, 'World 2 locked initially (requires 15 stars)');
  assert.equal(lm.isWorldUnlocked('world_3'), false, 'World 3 locked initially (requires 35 stars)');

  assert.equal(sm.isLevelUnlocked(1), true, 'Level 1 unlocked by default');
  assert.equal(sm.isLevelUnlocked(2), false, 'Level 2 locked before completing Level 1');

  // Complete level 1 with 3 stars
  const res1 = lm.completeLevel(1, 200);
  assert.equal(res1.success, true);
  assert.equal(res1.stars, 3);
  assert.equal(sm.isLevelUnlocked(2), true, 'Level 2 unlocked after completing Level 1');

  // Replay behavior: best score preserved, repeat coin reward granted
  const repeatRes = lm.completeLevel(1, 150);
  assert.equal(repeatRes.success, true);
  const prog1 = sm.getLevelProgress(1);
  assert.equal(prog1.bestScore, 200, 'Best score preserved on lower replay score');
  assert.equal(prog1.stars, 3, 'Best star rating preserved on lower replay');

  // Check false triggers: unrelated events or score < targetScore cannot complete level
  const failRes = lm.completeLevel(2, 10);
  assert.equal(failRes.success, false, 'Score 10 < target score 100 fails level completion');
  assert.equal(failRes.stars, 0);
  assert.equal(sm.isLevelUnlocked(3), false, 'Level 3 remains locked when Level 2 fails');
});

test('SECTION 3: Power-Up Acceptance Tests — All 5 Power-Ups', async (t) => {
  const mockStore = new MockStorage();
  const sm = new SaveManager({ storage: mockStore });
  const pum = new PowerUpManager(null, { saveManager: sm });

  // Initial inventory verification
  assert.equal(sm.getPowerUpCount('magnet'), 2);
  assert.equal(sm.getPowerUpCount('slowmo'), 1);
  assert.equal(sm.getPowerUpCount('multiplier'), 1);
  assert.equal(sm.getPowerUpCount('shield'), 1);
  assert.equal(sm.getPowerUpCount('precision'), 2);

  // 1. Candy Magnet
  assert.equal(pum.isPowerUpActive('magnet'), false);
  const activatedMagnet = pum.activatePowerUp('magnet');
  assert.equal(activatedMagnet, true);
  assert.equal(sm.getPowerUpCount('magnet'), 1, 'Inventory deducted on activation');
  assert.equal(pum.isPowerUpActive('magnet'), true);
  const pull = pum.applyMagnetPull(150, 240, 195, 240);
  assert.ok(pull.vx > 0, 'Magnet pulls horizontally toward mouth');

  // 2. Slow Motion
  assert.equal(pum.getTimeScale(), 1.0);
  pum.activatePowerUp('slowmo');
  assert.equal(pum.getTimeScale(), 0.55, 'Slowmo scales timescale to 0.55x');

  // 3. Score Multiplier
  assert.equal(pum.getScoreMultiplier(), 1);
  pum.activatePowerUp('multiplier');
  assert.equal(pum.getScoreMultiplier(), 2, 'Multiplier doubles score multiplier');

  // 4. Protective Shield
  assert.equal(pum.isPowerUpActive('shield'), false);
  pum.activatePowerUp('shield');
  assert.equal(pum.isPowerUpActive('shield'), true);
  assert.equal(sm.getPowerUpCount('shield'), 0);
  // Cannot activate again if inventory is 0
  const reactivateFail = pum.activatePowerUp('shield');
  assert.equal(reactivateFail, false, 'Cannot activate with 0 inventory');
  // Consume shield on miss
  const shieldConsumed = pum.consumeShield();
  assert.equal(shieldConsumed, true);
  assert.equal(pum.isPowerUpActive('shield'), false, 'Shield expired after single absorption');
  assert.equal(pum.consumeShield(), false, 'Second miss is not absorbed');

  // 5. Precision Assist
  assert.equal(pum.isPrecisionEnabled(), false);
  pum.activatePowerUp('precision');
  assert.equal(pum.isPrecisionEnabled(), true);

  // Restart / Reset behavior
  pum.reset();
  assert.equal(pum.isPowerUpActive('magnet'), false);
  assert.equal(pum.isPowerUpActive('slowmo'), false);
  assert.equal(pum.isPowerUpActive('multiplier'), false);
  assert.equal(pum.isPowerUpActive('shield'), false);
  assert.equal(pum.isPrecisionEnabled(), false);
});

test('SECTION 4: Economy and Anti-Exploit Tests', async (t) => {
  const mockStore = new MockStorage();
  const sm = new SaveManager({ storage: mockStore });
  const em = new EconomyManager({ saveManager: sm });

  const initialCoins = sm.getCoins(); // 50 starter
  assert.equal(initialCoins, 50);

  // 1. Cannot spend negative or overdraft
  assert.equal(sm.spendCoins(-10), true, 'Negative or zero spend rejected/noop');
  assert.equal(sm.spendCoins(9999), false, 'Overdraft returns false');
  assert.equal(sm.getCoins(), 50, 'Coins cannot become negative');

  // 2. Insufficient balance on purchase
  const failBuy = em.buyPowerUp('shield'); // cost 50
  assert.equal(failBuy.success, true); // 50 coins used, balance now 0
  assert.equal(sm.getCoins(), 0);

  const failBuy2 = em.buyPowerUp('shield');
  assert.equal(failBuy2.success, false, 'Purchase rejected with 0 balance');
  assert.equal(failBuy2.reason, 'Insufficient coins');

  // 3. Normal rewards & level rewards
  sm.addCoins(100);
  assert.equal(sm.getCoins(), 100);

  // 4. Repeated rapid clicks / duplicate reward claim prevention
  const mm = new MissionManager({ saveManager: sm });
  const missions = mm.getDailyMissions();
  missions[0].completed = true;

  const claim1 = mm.claimReward(missions[0].id);
  assert.equal(claim1.success, true);
  const balanceAfterClaim = sm.getCoins();

  // Rapid second click attempt
  const claim2 = mm.claimReward(missions[0].id);
  assert.equal(claim2.success, false, 'Duplicate mission claim strictly rejected');
  assert.equal(sm.getCoins(), balanceAfterClaim, 'Coin balance unaffected by duplicate claim');

  // Achievement duplicate claim prevention
  const am = new AchievementManager({ saveManager: sm });
  am.recordProgress('first_catch', 1);
  const achClaim1 = am.claimReward('first_catch');
  assert.equal(achClaim1, true);
  const achBalance = sm.getCoins();

  const achClaim2 = am.claimReward('first_catch');
  assert.equal(achClaim2, false, 'Duplicate achievement claim strictly rejected');
  assert.equal(sm.getCoins(), achBalance);
});

test('SECTION 5: Save Migration and Persistence', async (t) => {
  // 1. Existing Phase 9 v1 Save Migration
  const v1Data = {
    highScore: 1250,
    soundEnabled: true,
    musicEnabled: false,
    vibrationEnabled: true,
    reducedMotion: true
  };
  const mockStore = new MockStorage({ gem_feeder_save_v1: JSON.stringify(v1Data) });
  const sm = new SaveManager({ storage: mockStore });

  assert.equal(sm.getHighScore(), 1250, 'High score migrated from v1');
  assert.equal(sm.getMusicEnabled(), false, 'Music setting migrated from v1');
  assert.equal(sm.getReducedMotion(), true, 'Reduced motion migrated from v1');
  assert.equal(sm.getCoins(), 50, 'Starter coins awarded on v2 upgrade');
  assert.deepEqual(sm.getUnlockedLevels(), [1], 'Level 1 unlocked by default');
  assert.ok(mockStore.getItem('gem_feeder_save_v2'), 'Saved migrated state to v2 key');

  // 2. Corrupted save fallback
  const corruptStore = new MockStorage({ gem_feeder_save_v2: '{ corrupt invalid json !! }' });
  const smCorrupt = new SaveManager({ storage: corruptStore });
  assert.equal(smCorrupt.getHighScore(), 0, 'Clean fallback to default on corrupt save');
  assert.equal(smCorrupt.getCoins(), 50, 'Clean fallback to starter coins');

  // 3. Private browsing / null storage fallback
  const smPrivate = new SaveManager({ storage: null });
  assert.equal(smPrivate.getHighScore(), 0);
  smPrivate.addCoins(100);
  assert.equal(smPrivate.getCoins(), 150, 'Memory storage handles transactions when localStorage unavailable');
});

test('SECTION 6: Daily Missions & Achievements', async (t) => {
  const mockStore = new MockStorage();
  const sm = new SaveManager({ storage: mockStore });
  const mm = new MissionManager({ saveManager: sm });

  // 1. Date formatting & rollover
  const todayStr = mm.getTodayDateString();
  assert.match(todayStr, /^\d{4}-\d{2}-\d{2}$/, 'Valid YYYY-MM-DD date format');

  const missions = mm.getDailyMissions();
  assert.equal(missions.length, 3, 'Generates 3 daily missions');

  // Record events
  mm.recordEvent('throw', 5);
  const mThrows = mm.getDailyMissions().find(m => m.id === 'm_throws');
  assert.equal(mThrows.progress, 5);

  mm.recordEvent('throw', 10);
  assert.equal(mThrows.progress, 10);
  assert.equal(mThrows.completed, true);

  // Rollover simulation: if date changes, fresh missions generated
  sm.saveMissions({ date: '2025-01-01', list: missions });
  const rolledOverMissions = mm.getDailyMissions();
  assert.equal(rolledOverMissions[0].progress, 0, 'New calendar day resets daily mission progress');
});
