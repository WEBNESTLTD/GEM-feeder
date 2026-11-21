import { SCORING } from '../config/gameConfig.js';

export class ComboManager {
  constructor() {
    this.combo = 0;
    this.maxCombo = 0;
  }

  reset() {
    this.combo = 0;
  }

  getCombo() {
    return this.combo;
  }

  getMaxCombo() {
    return this.maxCombo;
  }

  getMultiplier() {
    for (const tier of SCORING.COMBO_TIERS) {
      if (this.combo >= tier.min) {
        return tier.multiplier;
      }
    }
    return 1;
  }

  registerHit() {
    this.combo += 1;
    if (this.combo > this.maxCombo) {
      this.maxCombo = this.combo;
    }
    return {
      combo: this.combo,
      multiplier: this.getMultiplier(),
      isMilestone: this.combo === 3 || this.combo === 5 || this.combo === 10
    };
  }

  registerMiss() {
    const previousCombo = this.combo;
    this.combo = 0;
    return {
      previousCombo,
      combo: 0,
      multiplier: 1
    };
  }
}
