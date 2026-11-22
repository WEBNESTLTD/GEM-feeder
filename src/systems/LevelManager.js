import { LEVELS, WORLDS } from '../config/levelConfig.js';
import { saveManager } from '../storage/SaveManager.js';

export class LevelManager {
  constructor(options = {}) {
    this.saveManager = options.saveManager || saveManager;
    this.currentLevel = null;
  }

  getLevel(levelId) {
    return LEVELS[levelId] || null;
  }

  getWorld(worldId) {
    return WORLDS[worldId] || null;
  }

  getAllWorlds() {
    return Object.values(WORLDS);
  }

  getWorldLevels(worldId) {
    const world = WORLDS[worldId];
    if (!world) return [];
    const [start, end] = world.levelRange;
    const list = [];
    for (let i = start; i <= end; i++) {
      if (LEVELS[i]) {
        const progress = this.saveManager.getLevelProgress(i);
        const unlocked = this.saveManager.isLevelUnlocked(i);
        list.push({
          ...LEVELS[i],
          progress,
          isUnlocked: unlocked
        });
      }
    }
    return list;
  }

  isWorldUnlocked(worldId) {
    const world = WORLDS[worldId];
    if (!world) return false;
    if (world.requiredStarsToUnlock === 0) return true;
    return this.saveManager.getTotalStars() >= world.requiredStarsToUnlock;
  }

  getWorldProgress(worldId) {
    const levels = this.getWorldLevels(worldId);
    let completedCount = 0;
    let starsEarned = 0;
    const totalPossibleStars = levels.length * 3;

    for (const lvl of levels) {
      if (lvl.progress.completed) completedCount++;
      starsEarned += (lvl.progress.stars || 0);
    }

    const percent = levels.length > 0 ? Math.round((completedCount / levels.length) * 100) : 0;

    return {
      completedCount,
      totalLevels: levels.length,
      starsEarned,
      totalPossibleStars,
      percent
    };
  }

  calculateStars(levelId, score) {
    const level = this.getLevel(levelId);
    if (!level) return 0;

    const [star1, star2, star3] = level.starThresholds;
    if (score >= star3) return 3;
    if (score >= star2) return 2;
    if (score >= star1) return 1;
    return 0;
  }

  completeLevel(levelId, score) {
    const level = this.getLevel(levelId);
    if (!level) return { success: false, stars: 0, coinsEarned: 0 };

    const stars = this.calculateStars(levelId, score);
    const completed = stars >= 1;

    let coinsEarned = 0;
    if (completed) {
      const existing = this.saveManager.getLevelProgress(levelId);
      // First-time base reward
      if (!existing.completed) {
        coinsEarned += level.coinReward;
      } else {
        // Repeat play farming reward
        coinsEarned += 5;
      }

      // Bonus coins for new stars earned
      const newStars = Math.max(0, stars - (existing.stars || 0));
      coinsEarned += (newStars * 10);

      this.saveManager.addCoins(coinsEarned);
      this.saveManager.saveLevelResult(levelId, { score, stars, completed: true });
    }

    return {
      success: completed,
      stars,
      score,
      coinsEarned,
      level
    };
  }
}

export const levelManager = new LevelManager();
