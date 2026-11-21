import { Candy } from './Candy.js';
import { CANDIES } from '../config/gameConfig.js';

export class CandySpawner {
  constructor(scene, spawnX, spawnY) {
    this.scene = scene;
    this.spawnX = spawnX;
    this.spawnY = spawnY;
    this.activeCandy = null;
    this.nextCandyData = this.getRandomCandyData();
  }

  getRandomCandyData() {
    const idx = Phaser.Math.Between(0, CANDIES.length - 1);
    return CANDIES[idx];
  }

  spawnActiveCandy() {
    const currentData = this.nextCandyData;
    this.nextCandyData = this.getRandomCandyData();

    this.activeCandy = new Candy(this.scene, this.spawnX, this.spawnY + 30, currentData);
    this.activeCandy.setScale(0.3);
    this.activeCandy.setAlpha(0);

    // Pop up from packet animation
    this.scene.tweens.add({
      targets: this.activeCandy,
      y: this.spawnY,
      scale: 1,
      alpha: 1,
      duration: 280,
      ease: 'Back.easeOut'
    });

    return {
      activeCandy: this.activeCandy,
      nextCandyData: this.nextCandyData
    };
  }

  getActiveCandy() {
    return this.activeCandy;
  }

  getNextCandyData() {
    return this.nextCandyData;
  }

  clearActiveCandy() {
    this.activeCandy = null;
  }
}
