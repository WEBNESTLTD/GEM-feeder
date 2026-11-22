import { COLORS } from '../config/gameConfig.js';
import { audioManager } from '../systems/AudioManager.js';

export class LevelIntroModal extends Phaser.GameObjects.Container {
  constructor(scene, options = {}) {
    super(scene, 0, 0);
    this.scene = scene;
    this.levelData = options.levelData || null;
    this.onStart = options.onStart || (() => {});
    this.onBack = options.onBack || (() => {});

    this.createOverlay();
    this.createDialog();

    this.setDepth(120);
    this.setVisible(false);
    scene.add.existing(this);
  }

  createOverlay() {
    const overlay = this.scene.add.graphics();
    overlay.fillStyle(0x2D1452, 0.7);
    overlay.fillRect(0, 0, 390, 844);
    this.add(overlay);
  }

  createDialog() {
    this.dialog = this.scene.add.container(195, 420);

    const shadow = this.scene.add.graphics();
    shadow.fillStyle(0xE3D0F5, 1);
    shadow.fillRoundedRect(-145, -175, 290, 350, 24);
    this.dialog.add(shadow);

    const bg = this.scene.add.graphics();
    bg.fillStyle(0xFFFFFF, 1);
    bg.fillRoundedRect(-145, -180, 290, 350, 24);
    this.dialog.add(bg);

    // World & Level Header
    const lvlNum = this.levelData ? this.levelData.levelId : 1;
    this.titleText = this.scene.add.text(0, -135, `LEVEL ${lvlNum}`, {
      fontFamily: 'Fredoka, sans-serif',
      fontSize: '32px',
      fontWeight: '700',
      color: COLORS.ink
    }).setOrigin(0.5);
    this.dialog.add(this.titleText);

    // Target Score Pill
    const targetScore = this.levelData ? this.levelData.targetScore : 100;
    const targetContainer = this.scene.add.container(0, -80);
    const tBg = this.scene.add.graphics();
    tBg.fillStyle(0xF3E6FF, 1);
    tBg.fillRoundedRect(-110, -20, 220, 40, 20);
    targetContainer.add(tBg);

    const tLabel = this.scene.add.text(0, 0, `🎯 Target: ${targetScore.toLocaleString()} pts`, {
      fontFamily: 'Fredoka, sans-serif',
      fontSize: '16px',
      fontWeight: '700',
      color: COLORS.ink
    }).setOrigin(0.5);
    targetContainer.add(tLabel);
    this.dialog.add(targetContainer);

    // Star thresholds preview
    const thresholds = this.levelData ? this.levelData.starThresholds : [100, 150, 200];
    const starRow = this.scene.add.text(0, -25, `★ ${thresholds[0]}  ★★ ${thresholds[1]}  ★★★ ${thresholds[2]}`, {
      fontFamily: 'Fredoka, sans-serif',
      fontSize: '13px',
      fontWeight: '600',
      color: COLORS.inkSoft
    }).setOrigin(0.5);
    this.dialog.add(starRow);

    // Special Objective
    const objText = (this.levelData && this.levelData.specialObjective) || 'Feed the character and score points!';
    this.objectiveText = this.scene.add.text(0, 20, objText, {
      fontFamily: 'Fredoka, sans-serif',
      fontSize: '14px',
      fontWeight: '600',
      color: COLORS.pinkDark,
      align: 'center',
      wordWrap: { width: 230 }
    }).setOrigin(0.5);
    this.dialog.add(this.objectiveText);

    // Play CTA Button
    const playBtn = this.scene.add.container(0, 85);
    const pShadow = this.scene.add.graphics();
    pShadow.fillStyle(0x9C0F56, 1);
    pShadow.fillRoundedRect(-110, -22, 220, 50, 25);
    playBtn.add(pShadow);

    const pBg = this.scene.add.graphics();
    pBg.fillStyle(0xD81B7A, 1);
    pBg.fillRoundedRect(-110, -26, 220, 50, 25);
    playBtn.add(pBg);

    const pLabel = this.scene.add.text(0, -2, 'Start Level', {
      fontFamily: 'Fredoka, sans-serif',
      fontSize: '22px',
      fontWeight: '700',
      color: '#FFFFFF'
    }).setOrigin(0.5);
    playBtn.add(pLabel);

    playBtn.setSize(220, 50);
    playBtn.setInteractive(new Phaser.Geom.Rectangle(-110, -26, 220, 50), Phaser.Geom.Rectangle.Contains);
    playBtn.input.cursor = 'pointer';

    const triggerStart = () => {
      audioManager.playButtonClick();
      this.hide();
      this.onStart();
    };

    playBtn.on('pointerdown', triggerStart);
    pBg.setInteractive(new Phaser.Geom.Rectangle(-110, -26, 220, 50), Phaser.Geom.Rectangle.Contains);
    pBg.input.cursor = 'pointer';
    pBg.on('pointerdown', triggerStart);
    this.dialog.add(playBtn);

    // Back / Close
    const closeBtn = this.scene.add.text(0, 140, 'Back to Map', {
      fontFamily: 'Fredoka, sans-serif',
      fontSize: '16px',
      fontWeight: '600',
      color: COLORS.inkSoft
    }).setOrigin(0.5);
    closeBtn.setInteractive(new Phaser.Geom.Rectangle(-60, -15, 120, 30), Phaser.Geom.Rectangle.Contains);
    closeBtn.input.cursor = 'pointer';
    closeBtn.on('pointerdown', () => {
      audioManager.playButtonClick();
      this.hide();
      this.onBack();
    });
    this.dialog.add(closeBtn);

    this.add(this.dialog);
  }

  show(levelData) {
    if (levelData) {
      this.levelData = levelData;
      this.titleText.setText(`LEVEL ${levelData.levelId}`);
    }
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
