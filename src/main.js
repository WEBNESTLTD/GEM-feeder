import { GAME_WIDTH, GAME_HEIGHT } from './config/gameConfig.js';
import { BootScene } from './scenes/BootScene.js';
import { PreloadScene } from './scenes/PreloadScene.js';
import { HomeScene } from './scenes/HomeScene.js';
import { TutorialScene } from './scenes/TutorialScene.js';
import { GameScene } from './scenes/GameScene.js';
import { GameOverScene } from './scenes/GameOverScene.js';
import { WorldSelectScene } from './scenes/WorldSelectScene.js';
import { LevelSelectScene } from './scenes/LevelSelectScene.js';
import { ShopScene } from './scenes/ShopScene.js';
import { MissionScene } from './scenes/MissionScene.js';

const config = {
  type: Phaser.AUTO,
  parent: 'game-container',
  width: GAME_WIDTH,
  height: GAME_HEIGHT,
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH
  },
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 },
      debug: false
    }
  },
  fps: {
    target: 60,
    forceSetTimeOut: true
  },
  render: {
    antialias: true,
    antialiasGL: true,
    roundPixels: false,
    powerPreference: 'high-performance'
  },
  backgroundColor: '#2D1452',
  scene: [
    BootScene,
    PreloadScene,
    HomeScene,
    WorldSelectScene,
    LevelSelectScene,
    TutorialScene,
    GameScene,
    GameOverScene,
    ShopScene,
    MissionScene
  ]
};

window.addEventListener('load', () => {
  const game = new Phaser.Game(config);
  window.__gemFeederGame = game;
});
