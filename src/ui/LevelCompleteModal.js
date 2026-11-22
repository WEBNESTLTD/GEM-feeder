import { COLORS } from '../config/gameConfig.js';
import { audioManager } from '../systems/AudioManager.js';

export class LevelCompleteModal extends Phaser.GameObjects.Container {
  constructor(scene, options = {}) {
    super(scene, 0, 0);
    this.scene = scene;
    this.onNext = options.onNext || (() => {});
    this.onReplay = options.onReplay || (() => {});
    this.onMap = options.onMap || (() => {});

    this.createOverlay();
    this.createDialog();

    this.setDepth(130);
    this.setVisible(false);
    scene.add.existing(this);
  }

  createOverlay() {
    const overlay = this.scene.add.graphics();
    overlay.fillStyle(0x2D1452, 0.75);
    overlay.fillRect(0, 0, 390, 844);
    this.add(overlay);
  }

  createDialog() {
    this.dialog = this.scene.add.container(195, 420);

    const shadow = this.scene.add.graphics();
    shadow.fillStyle(0xE3D0F5, 1);
    shadow.fillRoundedRect(-145, -200, 290, 400, 24);
    this.dialog.add(shadow);

    const bg = this.scene.add.graphics();
    bg.fillStyle(0xFFFFFF, 1);
    bg.fillRoundedRect(-145, -204, 290, 400, 24);
    this.dialog.add(bg);

    // Title (VICTORY or TRY AGAIN)
    this.headerText = this.scene.add.text(0, -165, 'LEVEL COMPLETE!', {
      fontFamily: 'Fredoka, sans-serif',
      fontSize: '26px',
      fontWeight: '700',
      color: COLORS.ink
    }).setOrigin(0.5);
    this.dialog.add(this.headerText);

    // 3 Stars Container
    this.starsContainer = this.scene.add.container(0, -115);
    this.starTexts = [];
    [-45, 0, 45].forEach((sx) => {
      const st = this.scene.add.text(sx, 0, '☆', {
        fontSize: '38px',
        color: '#E3D0F5'
      }).setOrigin(0.5);
      this.starsContainer.add(st);
      this.starTexts.push(st);
    });
    this.dialog.add(this.starsContainer);

    // Final Score
    this.scoreText = this.scene.add.text(0, -55, 'Score: 0', {
      fontFamily: 'Fredoka, sans-serif',
      fontSize: '24px',
      fontWeight: '700',
      color: COLORS.pink
    }).setOrigin(0.5);
    this.dialog.add(this.scoreText);

    // Coins Earned Pill
    this.coinsPill = this.scene.add.container(0, -10);
    const cBg = this.scene.add.graphics();
    cBg.fillStyle(0xFFF3D6, 1);
    cBg.fillRoundedRect(-85, -16, 170, 32, 16);
    this.coinsPill.add(cBg);

    this.coinsLabel = this.scene.add.text(0, 0, '🪙 +0 Coins', {
      fontFamily: 'Fredoka, sans-serif',
      fontSize: '16px',
      fontWeight: '700',
      color: COLORS.ink
    }).setOrigin(0.5);
    this.coinsPill.add(this.coinsLabel);
    this.dialog.add(this.coinsPill);

    // Primary CTA: Next Level
    this.nextBtn = this.scene.add.container(0, 50);
    const nShadow = this.scene.add.graphics();
    nShadow.fillStyle(0x9C0F56, 1);
    nShadow.fillRoundedRect(-110, -20, 220, 46, 23);
    this.nextBtn.add(nShadow);

    const nBg = this.scene.add.graphics();
    nBg.fillStyle(0xD81B7A, 1);
    nBg.fillRoundedRect(-110, -24, 220, 46, 23);
    this.nextBtn.add(nBg);

    this.nextBtnLabel = this.scene.add.text(0, -2, 'Next Level', {
      fontFamily: 'Fredoka, sans-serif',
      fontSize: '20px',
      fontWeight: '700',
      color: '#FFFFFF'
    }).setOrigin(0.5);
    this.nextBtn.add(this.nextBtnLabel);

    this.nextBtn.setSize(220, 46);
    this.nextBtn.setInteractive(new Phaser.Geom.Rectangle(-110, -24, 220, 46), Phaser.Geom.Rectangle.Contains);
    this.nextBtn.input.cursor = 'pointer';

    const triggerNext = () => {
      audioManager.playButtonClick();
      this.hide();
      this.onNext();
    };

    this.nextBtn.on('pointerdown', triggerNext);
    nBg.setInteractive(new Phaser.Geom.Rectangle(-110, -24, 220, 46), Phaser.Geom.Rectangle.Contains);
    nBg.input.cursor = 'pointer';
    nBg.on('pointerdown', triggerNext);
    this.dialog.add(this.nextBtn);

    // Secondary CTA: Replay
    this.replayBtn = this.scene.add.container(0, 110);
    const rShadow = this.scene.add.graphics();
    rShadow.fillStyle(0xCDB8EE, 1);
    rShadow.fillRoundedRect(-110, -18, 220, 40, 20);
    this.replayBtn.add(rShadow);

    const rBg = this.scene.add.graphics();
    rBg.fillStyle(0xFFFFFF, 1);
    rBg.fillRoundedRect(-110, -22, 220, 40, 20);
    this.replayBtn.add(rBg);

    const rLabel = this.scene.add.text(0, -2, 'Replay', {
      fontFamily: 'Fredoka, sans-serif',
      fontSize: '18px',
      fontWeight: '600',
      color: COLORS.ink
    }).setOrigin(0.5);
    this.replayBtn.add(rLabel);

    this.replayBtn.setSize(220, 40);
    this.replayBtn.setInteractive(new Phaser.Geom.Rectangle(-110, -22, 220, 40), Phaser.Geom.Rectangle.Contains);
    this.replayBtn.input.cursor = 'pointer';
    this.replayBtn.on('pointerdown', () => {
      audioManager.playButtonClick();
      this.hide();
      this.onReplay();
    });
    this.dialog.add(this.replayBtn);

    // Map Button
    const mapBtn = this.scene.add.text(0, 160, 'Level Select', {
      fontFamily: 'Fredoka, sans-serif',
      fontSize: '16px',
      fontWeight: '600',
      color: COLORS.inkSoft
    }).setOrigin(0.5);
    mapBtn.setInteractive(new Phaser.Geom.Rectangle(-60, -15, 120, 30), Phaser.Geom.Rectangle.Contains);
    mapBtn.input.cursor = 'pointer';
    mapBtn.on('pointerdown', () => {
      audioManager.playButtonClick();
      this.hide();
      this.onMap();
    });
    this.dialog.add(mapBtn);

    this.add(this.dialog);
  }

  showResult({ success, score = 0, stars = 0, coinsEarned = 0, hasNextLevel = true }) {
    this.headerText.setText(success ? 'LEVEL COMPLETE!' : 'TRY AGAIN');
    this.scoreText.setText(`Score: ${score.toLocaleString()}`);
    this.coinsLabel.setText(`🪙 +${coinsEarned} Coins`);

    if (success) {
      audioManager.playLevelComplete();
    } else {
      audioManager.playMiss();
    }

    // Animate star stamps
    this.starTexts.forEach((st, idx) => {
      if (idx < stars) {
        st.setText('★').setColor('#FFD93D').setScale(0);
        this.scene.tweens.add({
          targets: st,
          scale: 1.25,
          duration: 250,
          delay: 200 + (idx * 200),
          ease: 'Back.easeOut',
          onComplete: () => {
            audioManager.playStarEarn();
            st.setScale(1);
          }
        });
      } else {
        st.setText('☆').setColor('#E3D0F5').setScale(1);
      }
    });

    this.nextBtn.setVisible(success && hasNextLevel);

    this.setVisible(true);
    this.dialog.setScale(0.85);
    this.scene.tweens.add({
      targets: this.dialog,
      scale: 1,
      duration: 200,
      ease: 'Back.easeOut'
    });
  }

  hide() {
    this.setVisible(false);
  }
}
