import { COLORS } from '../config/gameConfig.js';
import { audioManager } from '../systems/AudioManager.js';

export class PauseMenu extends Phaser.GameObjects.Container {
  constructor(scene, options = {}) {
    super(scene, 0, 0);
    this.scene = scene;
    this.onResume = options.onResume || (() => {});
    this.onRestart = options.onRestart || (() => {});
    this.onHome = options.onHome || (() => {});

    this.createOverlay();
    this.createDialog();

    this.setDepth(100);
    this.setVisible(false);
    scene.add.existing(this);
  }

  createOverlay() {
    const overlay = this.scene.add.graphics();
    overlay.fillStyle(0x2D1452, 0.65);
    overlay.fillRect(0, 0, 390, 844);
    overlay.setInteractive(new Phaser.Geom.Rectangle(0, 0, 390, 844), Phaser.Geom.Rectangle.Contains);
    this.add(overlay);
  }

  createDialog() {
    this.dialog = this.scene.add.container(195, 420);

    // Dialog card shadow and background
    const shadow = this.scene.add.graphics();
    shadow.fillStyle(0xE3D0F5, 1);
    shadow.fillRoundedRect(-140, -156, 280, 320, 24);
    this.dialog.add(shadow);

    const bg = this.scene.add.graphics();
    bg.fillStyle(0xFFFFFF, 1);
    bg.fillRoundedRect(-140, -160, 280, 320, 24);
    this.dialog.add(bg);

    const title = this.scene.add.text(0, -115, 'PAUSED', {
      fontFamily: 'Fredoka, sans-serif',
      fontSize: '32px',
      fontWeight: '700',
      color: COLORS.ink
    }).setOrigin(0.5);
    this.dialog.add(title);

    // Resume button
    const resumeBtn = this.createButton(0, -45, 220, 56, 'Resume', 0xD81B7A, 0x9C0F56, 0xFFFFFF, () => {
      this.onResume();
    });
    this.dialog.add(resumeBtn);

    // Restart button
    const restartBtn = this.createButton(0, 25, 220, 52, 'Restart', 0xFFFFFF, 0xCDB8EE, 0x4B1F86, () => {
      this.onRestart();
    });
    this.dialog.add(restartBtn);

    // Home button
    const homeBtn = this.createButton(0, 90, 220, 52, 'Home', 0xFFFFFF, 0xCDB8EE, 0x4B1F86, () => {
      this.onHome();
    });
    this.dialog.add(homeBtn);

    this.add(this.dialog);
  }

  createButton(x, y, w, h, text, bgColor, shadowColor, textColor, onClick) {
    const btn = this.scene.add.container(x, y);

    const shadow = this.scene.add.graphics();
    shadow.fillStyle(shadowColor, 1);
    shadow.fillRoundedRect(-w / 2, -h / 2 + 4, w, h, h / 2);
    btn.add(shadow);

    const bg = this.scene.add.graphics();
    bg.fillStyle(bgColor, 1);
    bg.fillRoundedRect(-w / 2, -h / 2, w, h, h / 2);
    btn.add(bg);

    const label = this.scene.add.text(0, 0, text, {
      fontFamily: 'Fredoka, sans-serif',
      fontSize: '20px',
      fontWeight: '700',
      color: textColor === 0xFFFFFF ? '#FFFFFF' : COLORS.ink
    }).setOrigin(0.5);
    btn.add(label);

    btn.setSize(w, h);
    btn.setInteractive({ useHandCursor: true });
    btn.on('pointerdown', () => {
      audioManager.playButtonClick();
      this.scene.tweens.add({
        targets: btn,
        scale: 0.94,
        duration: 80,
        yoyo: true,
        onComplete: () => onClick()
      });
    });

    return btn;
  }

  show() {
    this.setVisible(true);
    this.dialog.setScale(0.85);
    this.scene.tweens.add({
      targets: this.dialog,
      scale: 1,
      duration: 180,
      ease: 'Back.easeOut'
    });
  }

  hide() {
    this.setVisible(false);
  }
}
