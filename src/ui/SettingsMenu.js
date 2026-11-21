import { COLORS } from '../config/gameConfig.js';
import { audioManager } from '../systems/AudioManager.js';

export class SettingsMenu extends Phaser.GameObjects.Container {
  constructor(scene, options = {}) {
    super(scene, 0, 0);
    this.scene = scene;
    this.onClose = options.onClose || (() => {});

    this.createOverlay();
    this.createDialog();

    this.setDepth(110);
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

    const shadow = this.scene.add.graphics();
    shadow.fillStyle(0xE3D0F5, 1);
    shadow.fillRoundedRect(-140, -146, 280, 300, 24);
    this.dialog.add(shadow);

    const bg = this.scene.add.graphics();
    bg.fillStyle(0xFFFFFF, 1);
    bg.fillRoundedRect(-140, -150, 280, 300, 24);
    this.dialog.add(bg);

    const title = this.scene.add.text(0, -105, 'SETTINGS', {
      fontFamily: 'Fredoka, sans-serif',
      fontSize: '28px',
      fontWeight: '700',
      color: COLORS.ink
    }).setOrigin(0.5);
    this.dialog.add(title);

    // Sound effects toggle
    this.soundToggleText = this.scene.add.text(0, -40, `Sound FX: ${audioManager.isSoundEnabled() ? 'ON' : 'OFF'}`, {
      fontFamily: 'Fredoka, sans-serif',
      fontSize: '20px',
      fontWeight: '600',
      color: COLORS.ink
    }).setOrigin(0.5);
    this.dialog.add(this.soundToggleText);

    const soundBtn = this.createPillBtn(0, -5, 'Toggle Sound', () => {
      const active = audioManager.toggleSound();
      this.soundToggleText.setText(`Sound FX: ${active ? 'ON' : 'OFF'}`);
    });
    this.dialog.add(soundBtn);

    // Music toggle
    this.musicToggleText = this.scene.add.text(0, 45, `Music: ${audioManager.isMusicEnabled() ? 'ON' : 'OFF'}`, {
      fontFamily: 'Fredoka, sans-serif',
      fontSize: '20px',
      fontWeight: '600',
      color: COLORS.ink
    }).setOrigin(0.5);
    this.dialog.add(this.musicToggleText);

    const musicBtn = this.createPillBtn(0, 80, 'Toggle Music', () => {
      const active = audioManager.toggleMusic();
      this.musicToggleText.setText(`Music: ${active ? 'ON' : 'OFF'}`);
    });
    this.dialog.add(musicBtn);

    // Close button
    const closeBtn = this.scene.add.text(0, 130, 'Done', {
      fontFamily: 'Fredoka, sans-serif',
      fontSize: '18px',
      fontWeight: '700',
      color: COLORS.pink
    }).setOrigin(0.5);
    closeBtn.setInteractive({ useHandCursor: true });
    closeBtn.on('pointerdown', () => {
      audioManager.playButtonClick();
      this.hide();
      this.onClose();
    });
    this.dialog.add(closeBtn);

    this.add(this.dialog);
  }

  createPillBtn(x, y, text, onClick) {
    const btn = this.scene.add.container(x, y);

    const shadow = this.scene.add.graphics();
    shadow.fillStyle(0xE3D0F5, 1);
    shadow.fillRoundedRect(-80, -16, 160, 36, 18);
    btn.add(shadow);

    const bg = this.scene.add.graphics();
    bg.fillStyle(0xFFFFFF, 1);
    bg.fillRoundedRect(-80, -18, 160, 36, 18);
    btn.add(bg);

    const label = this.scene.add.text(0, 0, text, {
      fontFamily: 'Fredoka, sans-serif',
      fontSize: '16px',
      fontWeight: '600',
      color: COLORS.ink
    }).setOrigin(0.5);
    btn.add(label);

    btn.setSize(160, 36);
    btn.setInteractive({ useHandCursor: true });
    btn.on('pointerdown', () => {
      audioManager.playButtonClick();
      onClick();
    });

    return btn;
  }

  show() {
    this.soundToggleText.setText(`Sound FX: ${audioManager.isSoundEnabled() ? 'ON' : 'OFF'}`);
    this.musicToggleText.setText(`Music: ${audioManager.isMusicEnabled() ? 'ON' : 'OFF'}`);
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
