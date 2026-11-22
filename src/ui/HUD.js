import { COLORS } from '../config/gameConfig.js';
import { audioManager } from '../systems/AudioManager.js';
import { saveManager } from '../storage/SaveManager.js';
import { POWER_UPS } from '../systems/PowerUpManager.js';

export class HUD extends Phaser.GameObjects.Container {
  constructor(scene, options = {}) {
    super(scene, 0, 0);
    this.scene = scene;
    this.levelData = options.levelData || null;
    this.onPauseClick = options.onPauseClick || (() => {});
    this.onPowerUpClick = options.onPowerUpClick || (() => {});

    this.createScoreCard(options.score || 0, options.highScore || 0);
    this.createPauseButton();
    this.createLifeHearts(options.lives !== undefined ? options.lives : 3);
    this.createComboBanner();
    this.createPacket();
    this.createNextPreview(options.nextCandyKey || 'candy_green');
    this.createFirstThrowGuidance();

    if (this.levelData) {
      this.createLevelGoalBanner(this.levelData);
    }
    this.createPowerUpBar();

    scene.add.existing(this);
  }

  createScoreCard(initialScore, initialHighScore) {
    // White rounded card (left: 16, top: 16, width: 145, height: 74)
    this.scoreCard = this.scene.add.graphics();
    this.scoreCard.fillStyle(0xE3D0F5, 1);
    this.scoreCard.fillRoundedRect(16, 20, 145, 72, 20);
    this.scoreCard.fillStyle(0xFFFFFF, 1);
    this.scoreCard.fillRoundedRect(16, 16, 145, 72, 20);
    this.add(this.scoreCard);

    // Labels
    this.scoreTitle = this.scene.add.text(30, 24, 'SCORE', {
      fontFamily: 'Fredoka, sans-serif',
      fontSize: '11px',
      fontWeight: '600',
      color: COLORS.inkSoft,
      letterSpacing: 1.5
    });
    this.add(this.scoreTitle);

    this.scoreValueText = this.scene.add.text(30, 36, initialScore.toLocaleString(), {
      fontFamily: 'Fredoka, sans-serif',
      fontSize: '32px',
      fontWeight: '700',
      color: COLORS.ink
    });
    this.add(this.scoreValueText);

    this.highScoreText = this.scene.add.text(30, 68, `Best ${initialHighScore.toLocaleString()}`, {
      fontFamily: 'Fredoka, sans-serif',
      fontSize: '12px',
      fontWeight: '500',
      color: COLORS.inkSoft
    });
    this.add(this.highScoreText);
  }

  createLevelGoalBanner(levelData) {
    this.levelGoalContainer = this.scene.add.container(195, 42);

    const bgShadow = this.scene.add.graphics();
    bgShadow.fillStyle(0xE3D0F5, 1);
    bgShadow.fillRoundedRect(-55, -20, 110, 44, 18);
    this.levelGoalContainer.add(bgShadow);

    const bg = this.scene.add.graphics();
    bg.fillStyle(0xFFFFFF, 1);
    bg.fillRoundedRect(-55, -24, 110, 44, 18);
    this.levelGoalContainer.add(bg);

    const lvlLabel = this.scene.add.text(0, -14, `LV ${levelData.levelId}`, {
      fontFamily: 'Fredoka, sans-serif',
      fontSize: '14px',
      fontWeight: '700',
      color: COLORS.ink
    }).setOrigin(0.5);
    this.levelGoalContainer.add(lvlLabel);

    // 3 mini stars
    this.miniStars = [];
    [-24, 0, 24].forEach((sx) => {
      const st = this.scene.add.text(sx, 3, '☆', {
        fontSize: '15px',
        color: '#CDB8EE'
      }).setOrigin(0.5);
      this.levelGoalContainer.add(st);
      this.miniStars.push(st);
    });

    this.add(this.levelGoalContainer);
  }

  updateLevelStars(score) {
    if (!this.levelData || !this.miniStars) return;
    const [s1, s2, s3] = this.levelData.starThresholds;
    if (this.miniStars[0]) this.miniStars[0].setText(score >= s1 ? '★' : '☆').setColor(score >= s1 ? '#FFD93D' : '#CDB8EE');
    if (this.miniStars[1]) this.miniStars[1].setText(score >= s2 ? '★' : '☆').setColor(score >= s2 ? '#FFD93D' : '#CDB8EE');
    if (this.miniStars[2]) this.miniStars[2].setText(score >= s3 ? '★' : '☆').setColor(score >= s3 ? '#FFD93D' : '#CDB8EE');
  }

  createPowerUpBar() {
    this.powerUpBarContainer = this.scene.add.container(195, 411);
    this.powerUpBtns = {};

    const types = ['magnet', 'slowmo', 'multiplier', 'shield', 'precision'];
    const startX = -130;
    const spacing = 65;

    types.forEach((type, idx) => {
      const x = startX + (idx * spacing);
      const conf = POWER_UPS[type];
      const btn = this.scene.add.container(x, 0);

      const circle = this.scene.add.graphics();
      circle.fillStyle(0xFFFFFF, 0.95);
      circle.fillCircle(0, 0, 19);
      circle.lineStyle(2, 0xE3D0F5, 1);
      circle.strokeCircle(0, 0, 19);
      btn.add(circle);

      const icon = this.scene.add.text(0, -1, conf.icon, {
        fontSize: '18px'
      }).setOrigin(0.5);
      btn.add(icon);

      // Badge count
      const count = saveManager.getPowerUpCount(type);
      const badge = this.scene.add.graphics();
      badge.fillStyle(parseInt(conf.color.replace('#', '0x'), 16), 1);
      badge.fillCircle(12, 10, 8);
      btn.add(badge);

      const badgeText = this.scene.add.text(12, 10, String(count), {
        fontFamily: 'Fredoka, sans-serif',
        fontSize: '10px',
        fontWeight: '700',
        color: '#FFFFFF'
      }).setOrigin(0.5);
      btn.add(badgeText);

      btn.setSize(38, 38);
      btn.setInteractive(new Phaser.Geom.Circle(0, 0, 19), Phaser.Geom.Circle.Contains);
      btn.input.cursor = 'pointer';
      btn.on('pointerdown', () => {
        this.onPowerUpClick(type);
        this.refreshPowerUpCounts();
      });

      btn.badgeText = badgeText;
      btn.circle = circle;
      btn.conf = conf;
      this.powerUpBtns[type] = btn;
      this.powerUpBarContainer.add(btn);
    });

    this.add(this.powerUpBarContainer);
  }

  refreshPowerUpCounts() {
    if (!this.powerUpBtns) return;
    for (const type in this.powerUpBtns) {
      const count = saveManager.getPowerUpCount(type);
      if (this.powerUpBtns[type].badgeText) {
        this.powerUpBtns[type].badgeText.setText(String(count));
      }
    }
  }

  highlightActivePowerUp(type, isActive) {
    if (!this.powerUpBtns || !this.powerUpBtns[type]) return;
    const btn = this.powerUpBtns[type];
    const circle = btn.circle;
    circle.clear();
    circle.fillStyle(0xFFFFFF, 0.95);
    circle.fillCircle(0, 0, 19);
    if (isActive) {
      const activeColor = parseInt((btn.conf.color || '#38C964').replace('#', '0x'), 16);
      circle.lineStyle(3, activeColor, 1);
    } else {
      circle.lineStyle(2, 0xE3D0F5, 1);
    }
    circle.strokeCircle(0, 0, 19);
  }

  createPauseButton() {
    this.pauseBtnContainer = this.scene.add.container(348, 42);

    const shadow = this.scene.add.graphics();
    shadow.fillStyle(0xE3D0F5, 1);
    shadow.fillCircle(0, 4, 26);
    this.pauseBtnContainer.add(shadow);

    const circle = this.scene.add.graphics();
    circle.fillStyle(0xFFFFFF, 1);
    circle.fillCircle(0, 0, 26);
    this.pauseBtnContainer.add(circle);

    const icon = this.scene.add.image(0, 0, 'pause_icon');
    icon.setDisplaySize(20, 20);
    this.pauseBtnContainer.add(icon);

    this.pauseBtnContainer.setSize(52, 52);
    this.pauseBtnContainer.setInteractive({ useHandCursor: true });
    this.pauseBtnContainer.on('pointerdown', () => {
      audioManager.playButtonClick();
      this.scene.tweens.add({
        targets: this.pauseBtnContainer,
        scale: 0.9,
        duration: 80,
        yoyo: true,
        onComplete: () => {
          this.onPauseClick();
        }
      });
    });

    this.add(this.pauseBtnContainer);
  }

  createLifeHearts(livesCount) {
    this.heartsContainer = this.scene.add.container(348, 97);

    this.heartShadow = this.scene.add.graphics();
    this.heartShadow.fillStyle(0xE3D0F5, 1);
    this.heartShadow.fillRoundedRect(-55, -15, 110, 38, 19);
    this.heartsContainer.add(this.heartShadow);

    this.heartBg = this.scene.add.graphics();
    this.heartBg.fillStyle(0xFFFFFF, 1);
    this.heartBg.fillRoundedRect(-55, -19, 110, 38, 19);
    this.heartsContainer.add(this.heartBg);

    this.hearts = [];
    const spacing = 32;
    for (let i = 0; i < 3; i++) {
      const hX = -spacing + (i * spacing);
      const heart = this.scene.add.image(hX, 0, i < livesCount ? 'heart_full' : 'heart_empty');
      heart.setDisplaySize(24, 24);
      this.heartsContainer.add(heart);
      this.hearts.push(heart);
    }

    this.add(this.heartsContainer);
  }

  updateLives(livesCount) {
    for (let i = 0; i < 3; i++) {
      if (i < livesCount) {
        this.hearts[i].setTexture('heart_full');
      } else {
        if (this.hearts[i].texture.key === 'heart_full') {
          this.scene.tweens.add({
            targets: this.hearts[i],
            scale: 1.4,
            duration: 120,
            yoyo: true,
            onComplete: () => {
              this.hearts[i].setTexture('heart_empty');
              this.hearts[i].setScale(1);
            }
          });
        } else {
          this.hearts[i].setTexture('heart_empty');
        }
      }
    }
  }

  createComboBanner() {
    this.comboContainer = this.scene.add.container(65, 126);
    this.comboContainer.setAngle(-5);
    this.comboContainer.setAlpha(0);

    const shadow = this.scene.add.graphics();
    shadow.fillStyle(0xD9AE00, 1);
    shadow.fillRoundedRect(-50, 4, 100, 32, 16);
    this.comboContainer.add(shadow);

    const bg = this.scene.add.graphics();
    bg.fillStyle(0xFFD93D, 1);
    bg.fillRoundedRect(-50, 0, 100, 32, 16);
    this.comboContainer.add(bg);

    this.comboText = this.scene.add.text(0, 16, 'COMBO x2', {
      fontFamily: 'Fredoka, sans-serif',
      fontSize: '17px',
      fontWeight: '700',
      color: COLORS.ink
    }).setOrigin(0.5);
    this.comboContainer.add(this.comboText);

    this.add(this.comboContainer);
  }

  showCombo(multiplier) {
    if (multiplier <= 1) {
      this.comboContainer.setAlpha(0);
      return;
    }
    this.comboText.setText(`COMBO x${multiplier}`);
    this.comboContainer.setAlpha(1);
    this.comboContainer.setScale(1.35);

    this.scene.tweens.killTweensOf(this.comboContainer);
    this.scene.tweens.add({
      targets: this.comboContainer,
      scale: 1,
      duration: 220,
      ease: 'Back.easeOut',
      onComplete: () => {
        if (multiplier >= 3) {
          this.scene.tweens.add({
            targets: this.comboContainer,
            scale: 1.08,
            duration: 400,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
          });
        }
      }
    });
  }

  hideCombo() {
    this.scene.tweens.killTweensOf(this.comboContainer);
    this.comboContainer.setAlpha(0);
  }

  createPacket() {
    this.packetImage = this.scene.add.image(195, 770, 'packet_ui');
    this.packetImage.setDisplaySize(240, 170);
    this.add(this.packetImage);
  }

  createNextPreview(nextKey) {
    this.nextContainer = this.scene.add.container(330, 785);

    const bgShadow = this.scene.add.graphics();
    bgShadow.fillStyle(0xE3D0F5, 1);
    bgShadow.fillCircle(0, 4, 34);
    this.nextContainer.add(bgShadow);

    const bg = this.scene.add.graphics();
    bg.fillStyle(0xFFFFFF, 0.95);
    bg.fillCircle(0, 0, 34);
    this.nextContainer.add(bg);

    const label = this.scene.add.text(0, -22, 'NEXT', {
      fontFamily: 'Fredoka, sans-serif',
      fontSize: '11px',
      fontWeight: '700',
      color: COLORS.inkSoft
    }).setOrigin(0.5);
    this.nextContainer.add(label);

    this.nextPreviewCandy = this.scene.add.image(0, 4, nextKey);
    this.nextPreviewCandy.setDisplaySize(38, 38);
    this.nextContainer.add(this.nextPreviewCandy);

    this.add(this.nextContainer);
  }

  updateNextPreview(nextKey) {
    if (this.nextPreviewCandy) {
      this.nextPreviewCandy.setTexture(nextKey);
      this.nextPreviewCandy.setScale(0.5);
      this.scene.tweens.add({
        targets: this.nextPreviewCandy,
        scale: 1,
        duration: 200,
        ease: 'Back.easeOut'
      });
    }
  }

  createFirstThrowGuidance() {
    this.guideContainer = this.scene.add.container(60, 760);

    const arrow = this.scene.add.graphics();
    arrow.lineStyle(4, 0x4B1F86, 0.85);
    arrow.beginPath();
    arrow.moveTo(0, 0);
    arrow.lineTo(0, -22);
    arrow.moveTo(-8, -13);
    arrow.lineTo(0, -22);
    arrow.lineTo(8, -13);
    arrow.strokePath();
    this.guideContainer.add(arrow);

    const text1 = this.scene.add.text(0, 16, 'Swipe up', {
      fontFamily: 'Fredoka, sans-serif',
      fontSize: '14px',
      fontWeight: '700',
      color: COLORS.ink
    }).setOrigin(0.5);
    this.guideContainer.add(text1);

    const text2 = this.scene.add.text(0, 32, 'to feed!', {
      fontFamily: 'Fredoka, sans-serif',
      fontSize: '14px',
      fontWeight: '700',
      color: COLORS.ink
    }).setOrigin(0.5);
    this.guideContainer.add(text2);

    this.scene.tweens.add({
      targets: this.guideContainer,
      y: 752,
      duration: 650,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });

    this.add(this.guideContainer);
  }

  dismissGuidance() {
    if (this.guideContainer && this.guideContainer.alpha > 0) {
      this.scene.tweens.add({
        targets: this.guideContainer,
        alpha: 0,
        duration: 300,
        onComplete: () => {
          this.guideContainer.destroy();
        }
      });
    }
  }

  updateScore(score, highScore) {
    this.scoreValueText.setText(score.toLocaleString());
    this.highScoreText.setText(`Best ${highScore.toLocaleString()}`);

    this.scene.tweens.killTweensOf(this.scoreValueText);
    this.scoreValueText.setScale(1.18);
    this.scene.tweens.add({
      targets: this.scoreValueText,
      scale: 1,
      duration: 160,
      ease: 'Back.easeOut'
    });

    if (this.levelData) {
      this.updateLevelStars(score);
    }
  }
}
