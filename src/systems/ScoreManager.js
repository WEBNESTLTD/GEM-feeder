import { SCORING } from '../config/gameConfig.js';

export class ScoreManager {
  constructor(options = {}) {
    this.score = 0;
    this.highScore = options.initialHighScore || 0;
    this.isNewRecord = false;
  }

  reset() {
    this.score = 0;
    this.isNewRecord = false;
  }

  getScore() {
    return this.score;
  }

  getHighScore() {
    return this.highScore;
  }

  isNewHighScore() {
    return this.isNewRecord;
  }

  addHit({ perfect = false, comboMultiplier = 1 }) {
    const basePoints = perfect ? (SCORING.NORMAL_HIT + SCORING.PERFECT_HIT_BONUS) : SCORING.NORMAL_HIT;
    const addedPoints = basePoints * comboMultiplier;
    this.score += addedPoints;

    if (this.score > this.highScore) {
      this.highScore = this.score;
      this.isNewRecord = true;
    }

    return {
      addedPoints,
      totalScore: this.score,
      isNewRecord: this.isNewRecord,
      perfect
    };
  }
}
