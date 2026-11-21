export class BootScene extends Phaser.Scene {
  constructor() {
    super('BootScene');
  }

  preload() {
    // Show a clean initial loading text if needed
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    const loadingText = this.add.text(width / 2, height / 2, 'Loading Gem Feeder...', {
      fontFamily: 'Fredoka, sans-serif',
      fontSize: '20px',
      color: '#4B1F86',
      fontWeight: '600'
    }).setOrigin(0.5);
  }

  create() {
    this.scene.start('PreloadScene');
  }
}
