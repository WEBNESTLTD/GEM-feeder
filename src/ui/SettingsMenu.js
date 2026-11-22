import { COLORS } from '../config/gameConfig.js';
import { audioManager } from '../systems/AudioManager.js';
import { saveManager } from '../storage/SaveManager.js';

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
    this.add(overlay);
  }

  createDialog() {
    this.dialog = this.scene.add.container(195, 420);

    const shadow = this.scene.add.graphics();
    shadow.fillStyle(0xE3D0F5, 1);
    shadow.fillRoundedRect(-145, -236, 290, 472, 24);
    this.dialog.add(shadow);

    const bg = this.scene.add.graphics();
    bg.fillStyle(0xFFFFFF, 1);
    bg.fillRoundedRect(-145, -240, 290, 472, 24);
    this.dialog.add(bg);

    const title = this.scene.add.text(0, -200, 'SETTINGS', {
      fontFamily: 'Fredoka, sans-serif',
      fontSize: '26px',
      fontWeight: '700',
      color: COLORS.ink
    }).setOrigin(0.5);
    this.dialog.add(title);

    // 1. Sound FX Section
    this.soundToggleText = this.scene.add.text(0, -155, `Sound FX: ${audioManager.isSoundEnabled() ? 'ON' : 'OFF'} (${Math.round(audioManager.getSFXVolume() * 100)}%)`, {
      fontFamily: 'Fredoka, sans-serif',
      fontSize: '15px',
      fontWeight: '600',
      color: COLORS.ink
    }).setOrigin(0.5);
    this.dialog.add(this.soundToggleText);

    const soundRow = this.createSettingRow(0, -125, 'Toggle', () => {
      const active = audioManager.toggleSound();
      this.updateTexts();
    }, () => {
      const current = audioManager.getSFXVolume();
      audioManager.setSFXVolume(Math.max(0, current - 0.2));
      this.updateTexts();
    }, () => {
      const current = audioManager.getSFXVolume();
      audioManager.setSFXVolume(Math.min(1, current + 0.2));
      audioManager.playButtonClick();
      this.updateTexts();
    });
    this.dialog.add(soundRow);

    // 2. Music Section
    this.musicToggleText = this.scene.add.text(0, -70, `Music: ${audioManager.isMusicEnabled() ? 'ON' : 'OFF'} (${Math.round(audioManager.getMusicVolume() * 100)}%)`, {
      fontFamily: 'Fredoka, sans-serif',
      fontSize: '15px',
      fontWeight: '600',
      color: COLORS.ink
    }).setOrigin(0.5);
    this.dialog.add(this.musicToggleText);

    const musicRow = this.createSettingRow(0, -40, 'Toggle', () => {
      const active = audioManager.toggleMusic();
      this.updateTexts();
    }, () => {
      const current = audioManager.getMusicVolume();
      audioManager.setMusicVolume(Math.max(0, current - 0.2));
      this.updateTexts();
    }, () => {
      const current = audioManager.getMusicVolume();
      audioManager.setMusicVolume(Math.min(1, current + 0.2));
      this.updateTexts();
    });
    this.dialog.add(musicRow);

    // 3. Vibration Section
    this.vibToggleText = this.scene.add.text(0, 15, `Haptic Feedback: ${saveManager.getVibrationEnabled() ? 'ON' : 'OFF'}`, {
      fontFamily: 'Fredoka, sans-serif',
      fontSize: '15px',
      fontWeight: '600',
      color: COLORS.ink
    }).setOrigin(0.5);
    this.dialog.add(this.vibToggleText);

    const vibBtn = this.createPillBtn(0, 45, 'Toggle Vibration', () => {
      const current = saveManager.getVibrationEnabled();
      saveManager.setVibrationEnabled(!current);
      if (!current) audioManager.triggerHaptic(30);
      this.updateTexts();
    });
    this.dialog.add(vibBtn);

    // 4. Reduced Motion Section
    this.motionToggleText = this.scene.add.text(0, 95, `Reduced Motion: ${saveManager.getReducedMotion() ? 'ON' : 'OFF'}`, {
      fontFamily: 'Fredoka, sans-serif',
      fontSize: '15px',
      fontWeight: '600',
      color: COLORS.ink
    }).setOrigin(0.5);
    this.dialog.add(this.motionToggleText);

    const motionBtn = this.createPillBtn(0, 125, 'Toggle Motion', () => {
      const current = saveManager.getReducedMotion();
      saveManager.setReducedMotion(!current);
      this.updateTexts();
    });
    this.dialog.add(motionBtn);

    // Close button
    const closeBtn = this.scene.add.text(0, 190, 'Done', {
      fontFamily: 'Fredoka, sans-serif',
      fontSize: '20px',
      fontWeight: '700',
      color: COLORS.pink
    }).setOrigin(0.5);
    closeBtn.setInteractive(new Phaser.Geom.Rectangle(-45, -15, 90, 30), Phaser.Geom.Rectangle.Contains);
    closeBtn.input.cursor = 'pointer';
    closeBtn.on('pointerdown', () => {
      audioManager.playButtonClick();
      this.hide();
      this.onClose();
    });
    this.dialog.add(closeBtn);

    this.add(this.dialog);
  }

  createSettingRow(x, y, toggleLabel, onToggle, onVolDown, onVolUp) {
    const row = this.scene.add.container(x, y);

    // Vol down button
    const downBtn = this.createMiniBtn(-90, 0, '–', onVolDown);
    row.add(downBtn);

    // Main toggle button
    const toggleBtn = this.createPillBtn(0, 0, toggleLabel, onToggle, 110);
    row.add(toggleBtn);

    // Vol up button
    const upBtn = this.createMiniBtn(90, 0, '+', onVolUp);
    row.add(upBtn);

    return row;
  }

  createMiniBtn(x, y, label, onClick) {
    const btn = this.scene.add.container(x, y);

    const shadow = this.scene.add.graphics();
    shadow.fillStyle(0xE3D0F5, 1);
    shadow.fillCircle(0, 2, 16);
    btn.add(shadow);

    const bg = this.scene.add.graphics();
    bg.fillStyle(0xF7F2FC, 1);
    bg.fillCircle(0, 0, 16);
    btn.add(bg);

    const txt = this.scene.add.text(0, -1, label, {
      fontFamily: 'Fredoka, sans-serif',
      fontSize: '18px',
      fontWeight: '700',
      color: COLORS.ink
    }).setOrigin(0.5);
    btn.add(txt);

    btn.setSize(32, 32);
    btn.setInteractive(new Phaser.Geom.Circle(0, 0, 16), Phaser.Geom.Circle.Contains);
    btn.input.cursor = 'pointer';
    btn.on('pointerdown', () => {
      onClick();
    });

    return btn;
  }

  createPillBtn(x, y, text, onClick, width = 150) {
    const btn = this.scene.add.container(x, y);

    const shadow = this.scene.add.graphics();
    shadow.fillStyle(0xE3D0F5, 1);
    shadow.fillRoundedRect(-width / 2, -14, width, 30, 15);
    btn.add(shadow);

    const bg = this.scene.add.graphics();
    bg.fillStyle(0xFFFFFF, 1);
    bg.fillRoundedRect(-width / 2, -16, width, 30, 15);
    btn.add(bg);

    const label = this.scene.add.text(0, -1, text, {
      fontFamily: 'Fredoka, sans-serif',
      fontSize: '14px',
      fontWeight: '600',
      color: COLORS.ink
    }).setOrigin(0.5);
    btn.add(label);

    btn.setSize(width, 30);
    btn.setInteractive(new Phaser.Geom.Rectangle(-width / 2, -16, width, 30), Phaser.Geom.Rectangle.Contains);
    btn.input.cursor = 'pointer';
    btn.on('pointerdown', () => {
      audioManager.playButtonClick();
      onClick();
    });

    return btn;
  }

  updateTexts() {
    this.soundToggleText.setText(`Sound FX: ${audioManager.isSoundEnabled() ? 'ON' : 'OFF'} (${Math.round(audioManager.getSFXVolume() * 100)}%)`);
    this.musicToggleText.setText(`Music: ${audioManager.isMusicEnabled() ? 'ON' : 'OFF'} (${Math.round(audioManager.getMusicVolume() * 100)}%)`);
    this.vibToggleText.setText(`Haptic Feedback: ${saveManager.getVibrationEnabled() ? 'ON' : 'OFF'}`);
    this.motionToggleText.setText(`Reduced Motion: ${saveManager.getReducedMotion() ? 'ON' : 'OFF'}`);
  }

  show() {
    this.updateTexts();
    this.setVisible(true);
    this.dialog.setScale(0.85);
    this.dialog.setAlpha(0);

    this.scene.tweens.add({
      targets: this.dialog,
      scaleX: 1,
      scaleY: 1,
      alpha: 1,
      duration: 200,
      ease: 'Back.easeOut'
    });
  }

  hide() {
    this.scene.tweens.add({
      targets: this.dialog,
      scaleX: 0.9,
      scaleY: 0.9,
      alpha: 0,
      duration: 150,
      ease: 'Quad.easeIn',
      onComplete: () => {
        this.setVisible(false);
      }
    });
  }
}
