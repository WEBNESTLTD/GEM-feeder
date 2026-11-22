const STORAGE_KEY_V1 = 'gem_feeder_save_v1';
const STORAGE_KEY_V2 = 'gem_feeder_save_v2';

export class SaveManager {
  constructor(options = {}) {
    this.storage = options.storage || (typeof window !== 'undefined' ? window.localStorage : null);
    this.state = this.load();
  }

  getDefaultState() {
    return {
      version: 2,
      highScore: 0,
      soundEnabled: true,
      musicEnabled: true,
      musicVolume: 0.7,
      sfxVolume: 0.85,
      vibrationEnabled: true,
      reducedMotion: false,
      coins: 50, // Starter bonus
      unlockedWorlds: ['world_1'],
      unlockedLevels: [1],
      levels: {
        1: { completed: false, stars: 0, bestScore: 0 }
      },
      inventory: {
        magnet: 2,
        slowmo: 1,
        multiplier: 1,
        shield: 1,
        precision: 2
      },
      equipped: {
        outfit: 'default',
        accessory: 'none',
        tint: 'default'
      },
      purchasedCosmetics: ['outfit_default', 'acc_none'],
      missions: {
        date: '',
        list: []
      },
      achievements: {}
    };
  }

  load() {
    const defaults = this.getDefaultState();
    if (!this.storage) return defaults;

    try {
      // 1. Check for v2 data
      const rawV2 = this.storage.getItem(STORAGE_KEY_V2);
      if (rawV2) {
        const parsedV2 = JSON.parse(rawV2);
        return {
          ...defaults,
          ...parsedV2,
          inventory: { ...defaults.inventory, ...(parsedV2.inventory || {}) },
          equipped: { ...defaults.equipped, ...(parsedV2.equipped || {}) },
          levels: { ...defaults.levels, ...(parsedV2.levels || {}) },
          achievements: { ...(parsedV2.achievements || {}) },
          missions: { ...defaults.missions, ...(parsedV2.missions || {}) }
        };
      }

      // 2. Backward compatibility: check for v1 data and migrate
      const rawV1 = this.storage.getItem(STORAGE_KEY_V1);
      if (rawV1) {
        const parsedV1 = JSON.parse(rawV1);
        const migrated = {
          ...defaults,
          highScore: Number(parsedV1.highScore) || 0,
          soundEnabled: parsedV1.soundEnabled !== false,
          musicEnabled: parsedV1.musicEnabled !== false,
          vibrationEnabled: parsedV1.vibrationEnabled !== false,
          reducedMotion: Boolean(parsedV1.reducedMotion)
        };
        // Save migrated v2
        this.state = migrated;
        this.save();
        return migrated;
      }

      return defaults;
    } catch {
      return defaults;
    }
  }

  save() {
    if (!this.storage) return;
    try {
      this.storage.setItem(STORAGE_KEY_V2, JSON.stringify(this.state));
    } catch (err) {
      console.warn('Failed to save to storage:', err);
    }
  }

  // --- High Score & Settings (Preserved from Phase 9) ---
  getHighScore() {
    return this.state.highScore || 0;
  }

  saveHighScore(score) {
    if (score > (this.state.highScore || 0)) {
      this.state.highScore = score;
      this.save();
      return true;
    }
    return false;
  }

  getSoundEnabled() {
    return this.state.soundEnabled !== false;
  }

  setSoundEnabled(enabled) {
    this.state.soundEnabled = Boolean(enabled);
    this.save();
  }

  getMusicEnabled() {
    return this.state.musicEnabled !== false;
  }

  setMusicEnabled(enabled) {
    this.state.musicEnabled = Boolean(enabled);
    this.save();
  }

  getMusicVolume() {
    return this.state.musicVolume !== undefined ? this.state.musicVolume : 0.7;
  }

  setMusicVolume(volume) {
    const vol = Math.max(0, Math.min(1, Number(volume) || 0));
    this.state.musicVolume = vol;
    this.save();
    return vol;
  }

  getSFXVolume() {
    return this.state.sfxVolume !== undefined ? this.state.sfxVolume : 0.85;
  }

  setSFXVolume(volume) {
    const vol = Math.max(0, Math.min(1, Number(volume) || 0));
    this.state.sfxVolume = vol;
    this.save();
    return vol;
  }

  getVibrationEnabled() {
    return this.state.vibrationEnabled !== false;
  }

  setVibrationEnabled(enabled) {
    this.state.vibrationEnabled = Boolean(enabled);
    this.save();
  }

  getReducedMotion() {
    return Boolean(this.state.reducedMotion);
  }

  setReducedMotion(enabled) {
    this.state.reducedMotion = Boolean(enabled);
    this.save();
  }

  // --- Coin Economy ---
  getCoins() {
    return this.state.coins || 0;
  }

  addCoins(amount) {
    if (amount <= 0) return this.state.coins;
    this.state.coins = (this.state.coins || 0) + amount;
    this.save();
    return this.state.coins;
  }

  spendCoins(amount) {
    if (amount <= 0) return true;
    if ((this.state.coins || 0) < amount) return false;
    this.state.coins -= amount;
    this.save();
    return true;
  }

  // --- Worlds & Levels Progression ---
  getUnlockedWorlds() {
    return this.state.unlockedWorlds || ['world_1'];
  }

  unlockWorld(worldId) {
    if (!this.state.unlockedWorlds.includes(worldId)) {
      this.state.unlockedWorlds.push(worldId);
      this.save();
      return true;
    }
    return false;
  }

  getUnlockedLevels() {
    return this.state.unlockedLevels || [1];
  }

  isLevelUnlocked(levelId) {
    return (this.state.unlockedLevels || [1]).includes(levelId);
  }

  unlockLevel(levelId) {
    if (!this.state.unlockedLevels.includes(levelId)) {
      this.state.unlockedLevels.push(levelId);
      if (!this.state.levels[levelId]) {
        this.state.levels[levelId] = { completed: false, stars: 0, bestScore: 0 };
      }
      this.save();
      return true;
    }
    return false;
  }

  getLevelProgress(levelId) {
    return this.state.levels[levelId] || { completed: false, stars: 0, bestScore: 0 };
  }

  saveLevelResult(levelId, { score, stars, completed = true }) {
    const existing = this.getLevelProgress(levelId);
    const newBestScore = Math.max(existing.bestScore || 0, score || 0);
    const newBestStars = Math.max(existing.stars || 0, stars || 0);

    this.state.levels[levelId] = {
      completed: existing.completed || completed,
      stars: newBestStars,
      bestScore: newBestScore
    };

    // Unlock next sequential level if completed
    if (completed && levelId < 30) {
      this.unlockLevel(levelId + 1);
    }

    // World unlock check (World 2 unlocks after Lv 10, World 3 after Lv 20)
    if (completed && levelId >= 10 && !this.state.unlockedWorlds.includes('world_2')) {
      this.unlockWorld('world_2');
    }
    if (completed && levelId >= 20 && !this.state.unlockedWorlds.includes('world_3')) {
      this.unlockWorld('world_3');
    }

    this.save();
    return {
      newBestScore: newBestScore > existing.bestScore,
      newBestStars: newBestStars > existing.stars
    };
  }

  getTotalStars() {
    let total = 0;
    for (const lvl in this.state.levels) {
      total += (this.state.levels[lvl].stars || 0);
    }
    return total;
  }

  // --- Power-Up Inventory ---
  getInventory() {
    return { ...this.state.inventory };
  }

  getPowerUpCount(type) {
    return (this.state.inventory && this.state.inventory[type]) || 0;
  }

  usePowerUp(type) {
    if (!this.state.inventory || !this.state.inventory[type] || this.state.inventory[type] <= 0) {
      return false;
    }
    this.state.inventory[type]--;
    this.save();
    return true;
  }

  addPowerUp(type, count = 1) {
    if (!this.state.inventory) this.state.inventory = {};
    this.state.inventory[type] = (this.state.inventory[type] || 0) + count;
    this.save();
    return this.state.inventory[type];
  }

  // --- Character Customization ---
  getEquipped() {
    return { ...this.state.equipped };
  }

  setEquipped(category, itemId) {
    if (!this.state.equipped) this.state.equipped = {};
    this.state.equipped[category] = itemId;
    this.save();
  }

  isCosmeticOwned(itemId) {
    return (this.state.purchasedCosmetics || []).includes(itemId);
  }

  unlockCosmetic(itemId) {
    if (!this.state.purchasedCosmetics) this.state.purchasedCosmetics = [];
    if (!this.state.purchasedCosmetics.includes(itemId)) {
      this.state.purchasedCosmetics.push(itemId);
      this.save();
      return true;
    }
    return false;
  }

  // --- Daily Missions ---
  getMissions() {
    return { ...this.state.missions };
  }

  saveMissions(missionData) {
    this.state.missions = missionData;
    this.save();
  }

  // --- Achievements ---
  getAchievements() {
    return { ...this.state.achievements };
  }

  saveAchievement(achId, data) {
    if (!this.state.achievements) this.state.achievements = {};
    this.state.achievements[achId] = {
      ...(this.state.achievements[achId] || {}),
      ...data
    };
    this.save();
  }
}

export const saveManager = new SaveManager();
