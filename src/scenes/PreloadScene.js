import { CANDIES } from '../config/gameConfig.js';

export class PreloadScene extends Phaser.Scene {
  constructor() {
    super('PreloadScene');
  }

  preload() {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    // Loading bar background
    const bgBar = this.add.graphics();
    bgBar.fillStyle(0xE3D0F5, 1);
    bgBar.fillRoundedRect(width / 2 - 120, height / 2 - 8, 240, 16, 8);

    const progressBar = this.add.graphics();

    this.load.on('progress', (value) => {
      progressBar.clear();
      progressBar.fillStyle(0xD81B7A, 1);
      progressBar.fillRoundedRect(width / 2 - 120, height / 2 - 8, 240 * value, 16, 8);
    });

    // 1. Load character mouth frames 0 through 8
    for (let i = 0; i <= 8; i++) {
      this.load.image(`mouth_${i}`, `./assets/characters/mouth_${i}.png`);
    }

    // 2. Load candy SVGs
    for (const candy of CANDIES) {
      this.load.svg(candy.key, `./assets/candies/${candy.key}.svg`, {
        width: 120,
        height: 120
      });
    }

    // 3. Load UI SVGs
    this.load.svg('packet_ui', './assets/ui/packet.svg', { width: 360, height: 255 });
    this.load.svg('heart_full', './assets/ui/heart_full.svg', { width: 48, height: 48 });
    this.load.svg('heart_empty', './assets/ui/heart_empty.svg', { width: 48, height: 48 });
    this.load.svg('play_icon', './assets/ui/play.svg', { width: 48, height: 48 });
    this.load.svg('pause_icon', './assets/ui/pause.svg', { width: 48, height: 48 });
    this.load.svg('sound_on', './assets/ui/sound_on.svg', { width: 48, height: 48 });
    this.load.svg('sound_off', './assets/ui/sound_off.svg', { width: 48, height: 48 });
  }

  create() {
    // Generate reusable gradient texture for vertical pastel background
    const bgCanvas = this.textures.createCanvas('pastel_bg', 390, 844);
    const ctx = bgCanvas.getContext();
    const grad = ctx.createLinearGradient(0, 0, 0, 844);
    grad.addColorStop(0, '#F3E6FF');
    grad.addColorStop(0.55, '#FFE9F3');
    grad.addColorStop(1, '#FFF3D6');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 390, 844);
    bgCanvas.refresh();

    this.scene.start('HomeScene');
  }
}
