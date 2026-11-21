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

  addHit({ perfect = false, comboMultiplier = 1, bonusPoints = 0 }) {
    const basePoints = perfect ? (SCORING.NORMAL_HIT + SCORING.PERFECT_HIT_BONUS) : SCORING.NORMAL_HIT;
    const addedPoints = (basePoints * comboMultiplier) + bonusPoints;
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

  addBonusPoints(points) {
    if (points <= 0) return { addedPoints: 0, totalScore: this.score, isNewRecord: this.isNewRecord };
    this.score += points;
    if (this.score > this.highScore) {
      this.highScore = this.score;
      this.isNewRecord = true;
    }
    return {
      addedPoints: points,
      totalScore: this.score,
      isNewRecord: this.isNewRecord
    };
  }
}
