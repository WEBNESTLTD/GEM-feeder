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
    this.setDepth(10); // Sit on top of gameplay objects and counter

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
    // Glossy arcade score card (left: 16, top: 16, width: 116, height: 72)
    this.scoreCard = this.scene.add.graphics();
    // Drop shadow
    this.scoreCard.fillStyle(0x2D1452, 0.35);
    this.scoreCard.fillRoundedRect(16, 20, 116, 72, 18);
    // Rich royal violet body
    this.scoreCard.fillStyle(0x461C7C, 1);
    this.scoreCard.fillRoundedRect(16, 16, 116, 72, 18);
    // Glossy top glass reflection
    this.scoreCard.fillStyle(0xFFFFFF, 0.22);
    this.scoreCard.fillRoundedRect(18, 18, 112, 26, 12);
    // Golden accent border
    this.scoreCard.lineStyle(2, 0xFFD93D, 0.85);
    if (this.scoreCard.strokeRoundedRect) {
      this.scoreCard.strokeRoundedRect(16, 16, 116, 72, 18);
    }
    this.add(this.scoreCard);

    // Labels with crisp 2x resolution
    this.scoreTitle = this.scene.add.text(26, 23, 'SCORE', {
      fontFamily: 'Fredoka, sans-serif',
      fontSize: '11px',
      fontWeight: '700',
      color: '#FFD93D',
      letterSpacing: 1.5,
      resolution: 2
    });
    this.add(this.scoreTitle);

    this.scoreValueText = this.scene.add.text(26, 35, initialScore.toLocaleString(), {
      fontFamily: 'Fredoka, sans-serif',
      fontSize: '28px',
      fontWeight: '700',
      color: '#FFFFFF',
      resolution: 2
    });
    this.add(this.scoreValueText);

    this.highScoreText = this.scene.add.text(26, 66, `Best ${initialHighScore.toLocaleString()}`, {
      fontFamily: 'Fredoka, sans-serif',
      fontSize: '11px',
      fontWeight: '600',
      color: '#D8C7EE',
      resolution: 2
    });
    this.add(this.highScoreText);
  }

  createLevelGoalBanner(levelData) {
    this.levelGoalContainer = this.scene.add.container(195, 42);

    const bgShadow = this.scene.add.graphics();
    bgShadow.fillStyle(0x2D1452, 0.3);
    bgShadow.fillRoundedRect(-48, -18, 96, 40, 16);
    this.levelGoalContainer.add(bgShadow);

    const bg = this.scene.add.graphics();
    bg.fillStyle(0x562394, 1);
    bg.fillRoundedRect(-48, -22, 96, 40, 16);
    // Top highlight
    bg.fillStyle(0xFFFFFF, 0.2);
    bg.fillRoundedRect(-46, -20, 92, 14, 8);
    // Gold rim
    bg.lineStyle(2, 0xFFD93D, 0.85);
    if (bg.strokeRoundedRect) {
      bg.strokeRoundedRect(-48, -22, 96, 40, 16);
    }
    this.levelGoalContainer.add(bg);

    const lvlLabel = this.scene.add.text(0, -12, `LV ${levelData.levelId}`, {
      fontFamily: 'Fredoka, sans-serif',
      fontSize: '13px',
      fontWeight: '700',
      color: '#FFD93D',
      resolution: 2
    }).setOrigin(0.5);
    this.levelGoalContainer.add(lvlLabel);

    // 3 mini stars
    this.miniStars = [];
    [-20, 0, 20].forEach((sx) => {
      const st = this.scene.add.text(sx, 5, '☆', {
        fontSize: '15px',
        color: '#D8C7EE',
        resolution: 2
      }).setOrigin(0.5);
      this.levelGoalContainer.add(st);
      this.miniStars.push(st);
    });

    this.add(this.levelGoalContainer);
  }

  updateLevelStars(score) {
    if (!this.levelData || !this.miniStars) return;
    const [s1, s2, s3] = this.levelData.starThresholds;
    if (this.miniStars[0]) this.miniStars[0].setText(score >= s1 ? '★' : '☆').setColor(score >= s1 ? '#FFD93D' : '#D8C7EE');
    if (this.miniStars[1]) this.miniStars[1].setText(score >= s2 ? '★' : '☆').setColor(score >= s2 ? '#FFD93D' : '#D8C7EE');
    if (this.miniStars[2]) this.miniStars[2].setText(score >= s3 ? '★' : '☆').setColor(score >= s3 ? '#FFD93D' : '#D8C7EE');
  }

  createPowerUpBar() {
    this.powerUpBarContainer = this.scene.add.container(352, 440);
    this.powerUpBtns = {};

    const types = ['magnet', 'slowmo', 'multiplier', 'shield', 'precision'];
    const spacingY = 48;

    types.forEach((type, idx) => {
      const y = idx * spacingY;
      const conf = POWER_UPS[type];
      const btn = this.scene.add.container(0, y);

      const shadow = this.scene.add.graphics();
      shadow.fillStyle(0x2D1452, 0.3);
      shadow.fillCircle(0, 3, 21);
      btn.add(shadow);

      const circle = this.scene.add.graphics();
      // Tactile arcade token base
      circle.fillStyle(0x461C7C, 1);
      circle.fillCircle(0, 0, 20);
      // Glossy top bevel
      circle.fillStyle(0xFFFFFF, 0.28);
      circle.fillEllipse(0, -7, 14, 6);
      // Colored accent ring
      const accentColor = parseInt(conf.color.replace('#', '0x'), 16);
      circle.lineStyle(2, accentColor, 0.9);
      if (circle.strokeCircle) {
        circle.strokeCircle(0, 0, 20);
      }
      btn.add(circle);

      const icon = this.scene.add.text(0, -1, conf.icon, {
        fontSize: '18px',
        resolution: 2
      }).setOrigin(0.5);
      btn.add(icon);

      // Badge count
      const count = saveManager.getPowerUpCount(type);
      const badge = this.scene.add.graphics();
      badge.fillStyle(accentColor, 1);
      badge.fillCircle(13, 10, 8);
      badge.lineStyle(1.5, 0xFFFFFF, 0.9);
      if (badge.strokeCircle) {
        badge.strokeCircle(13, 10, 8);
      }
      btn.add(badge);

      const badgeText = this.scene.add.text(13, 10, String(count), {
        fontFamily: 'Fredoka, sans-serif',
        fontSize: '10px',
        fontWeight: '700',
        color: '#FFFFFF',
        resolution: 2
      }).setOrigin(0.5);
      btn.add(badgeText);

      btn.setSize(44, 44);
      btn.setInteractive(new Phaser.Geom.Circle(0, 0, 22), Phaser.Geom.Circle.Contains);
      btn.input.cursor = 'pointer';
      btn.on('pointerdown', () => {
        // Tactile spring press feedback
        this.scene.tweens.add({
          targets: btn,
          scale: 0.88,
          duration: 70,
          yoyo: true,
          ease: 'Back.easeOut'
        });
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
    circle.fillStyle(0x461C7C, 1);
    circle.fillCircle(0, 0, 20);
    circle.fillStyle(0xFFFFFF, 0.28);
    circle.fillEllipse(0, -7, 14, 6);

    const activeColor = parseInt((btn.conf.color || '#38C964').replace('#', '0x'), 16);
    if (isActive) {
      circle.lineStyle(3.5, 0xFFD93D, 1);
    } else {
      circle.lineStyle(2, activeColor, 0.9);
    }
    if (circle.strokeCircle) {
      circle.strokeCircle(0, 0, 20);
    }
  }

  createPauseButton() {
    this.pauseBtnContainer = this.scene.add.container(348, 42);

    const shadow = this.scene.add.graphics();
    shadow.fillStyle(0x2D1452, 0.35);
    shadow.fillCircle(0, 4, 26);
    this.pauseBtnContainer.add(shadow);

    const circle = this.scene.add.graphics();
    // Chunky tactile button
    circle.fillStyle(0x562394, 1);
    circle.fillCircle(0, 0, 26);
    // Top bevel gloss
    circle.fillStyle(0xFFFFFF, 0.28);
    circle.fillEllipse(0, -9, 18, 8);
    // Gold rim
    circle.lineStyle(2, 0xFFD93D, 0.85);
    if (circle.strokeCircle) {
      circle.strokeCircle(0, 0, 26);
    }
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
        scale: 0.88,
        y: 45,
        duration: 70,
        yoyo: true,
        ease: 'Quad.easeInOut',
        onComplete: () => {
          this.pauseBtnContainer.y = 42;
          this.onPauseClick();
        }
      });
    });

    this.add(this.pauseBtnContainer);
  }

  createLifeHearts(livesCount) {
    this.heartsContainer = this.scene.add.container(319, 97);

    this.heartShadow = this.scene.add.graphics();
    this.heartShadow.fillStyle(0x2D1452, 0.25);
    this.heartShadow.fillRoundedRect(-55, -15, 110, 38, 19);
    this.heartsContainer.add(this.heartShadow);

    this.heartBg = this.scene.add.graphics();
    this.heartBg.fillStyle(0xFFFFFF, 0.95);
    this.heartBg.fillRoundedRect(-55, -19, 110, 38, 19);
    // Top highlight
    this.heartBg.fillStyle(0xFFFFFF, 0.5);
    this.heartBg.fillRoundedRect(-53, -17, 106, 12, 6);
    // Golden border
    this.heartBg.lineStyle(2, 0xFFD93D, 0.9);
    if (this.heartBg.strokeRoundedRect) {
      this.heartBg.strokeRoundedRect(-55, -19, 110, 38, 19);
    }
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
        this.hearts[i].setDisplaySize(24, 24);
      } else {
        if (this.hearts[i].texture.key === 'heart_full') {
          // Tactile heart break pop (scale gently relative to 24px)
          this.scene.tweens.add({
            targets: this.hearts[i],
            displayWidth: 32,
            displayHeight: 32,
            duration: 120,
            yoyo: true,
            ease: 'Back.easeOut',
            onComplete: () => {
              this.hearts[i].setTexture('heart_empty');
              this.hearts[i].setDisplaySize(24, 24);
            }
          });
        } else {
          this.hearts[i].setTexture('heart_empty');
          this.hearts[i].setDisplaySize(24, 24);
        }
      }
    }
  }

  createComboBanner() {
    this.comboContainer = this.scene.add.container(65, 126);
    this.comboContainer.setAngle(-5);
    this.comboContainer.setAlpha(0);

    const shadow = this.scene.add.graphics();
    shadow.fillStyle(0x2D1452, 0.3);
    shadow.fillRoundedRect(-50, 4, 100, 32, 16);
    this.comboContainer.add(shadow);

    const bg = this.scene.add.graphics();
    bg.fillStyle(0xFFD93D, 1);
    bg.fillRoundedRect(-50, 0, 100, 32, 16);
    // Gloss highlight
    bg.fillStyle(0xFFFFFF, 0.4);
    bg.fillRoundedRect(-48, 2, 96, 12, 6);
    // Outline
    bg.lineStyle(2, 0xD9AE00, 1);
    if (bg.strokeRoundedRect) {
      bg.strokeRoundedRect(-50, 0, 100, 32, 16);
    }
    this.comboContainer.add(bg);

    this.comboText = this.scene.add.text(0, 16, 'COMBO x2', {
      fontFamily: 'Fredoka, sans-serif',
      fontSize: '17px',
      fontWeight: '700',
      color: COLORS.ink,
      resolution: 2
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
    this.packetImage = this.scene.add.image(195, 782, 'packet_ui');
    this.packetImage.setDisplaySize(240, 180);
    this.packetImage.setAngle(0);

    this.add(this.packetImage);
  }

  createNextPreview(nextKey) {
    this.nextContainer = this.scene.add.container(330, 785);

    const bgShadow = this.scene.add.graphics();
    bgShadow.fillStyle(0x2D1452, 0.3);
    bgShadow.fillCircle(0, 4, 34);
    this.nextContainer.add(bgShadow);

    const bg = this.scene.add.graphics();
    bg.fillStyle(0xFFFFFF, 0.95);
    bg.fillCircle(0, 0, 34);
    // Gold rim
    bg.lineStyle(2.5, 0xFFD93D, 0.9);
    if (bg.strokeCircle) {
      bg.strokeCircle(0, 0, 34);
    }
    // Specular bubble shine
    bg.fillStyle(0xFFFFFF, 0.6);
    bg.fillEllipse(-8, -12, 14, 6);
    this.nextContainer.add(bg);

    const label = this.scene.add.text(0, -20, 'NEXT', {
      fontFamily: 'Fredoka, sans-serif',
      fontSize: '11px',
      fontWeight: '700',
      color: COLORS.inkSoft,
      resolution: 2
    }).setOrigin(0.5);
    this.nextContainer.add(label);

    this.nextPreviewCandy = this.scene.add.image(0, 4, nextKey);
    this.nextPreviewCandy.setDisplaySize(36, 36);
    this.nextContainer.add(this.nextPreviewCandy);

    // Subtle gentle bobbing
    if (!saveManager.getReducedMotion()) {
      this.scene.tweens.add({
        targets: this.nextContainer,
        y: 781,
        duration: 1400,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
      });
    }

    this.add(this.nextContainer);
  }

  updateNextPreview(nextKey) {
    if (this.nextPreviewCandy) {
      this.nextPreviewCandy.setTexture(nextKey);
      this.nextPreviewCandy.setDisplaySize(18, 18);
      this.scene.tweens.killTweensOf(this.nextPreviewCandy);
      this.scene.tweens.add({
        targets: this.nextPreviewCandy,
        displayWidth: 36,
        displayHeight: 36,
        duration: 200,
        ease: 'Back.easeOut'
      });
    }
  }

  createFirstThrowGuidance() {
    this.guideContainer = this.scene.add.container(55, 545);

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
      fontSize: '12px',
      fontWeight: '700',
      color: COLORS.ink,
      resolution: 2
    }).setOrigin(0.5);
    this.guideContainer.add(text1);

    const text2 = this.scene.add.text(0, 30, 'to feed!', {
      fontFamily: 'Fredoka, sans-serif',
      fontSize: '12px',
      fontWeight: '700',
      color: COLORS.ink,
      resolution: 2
    }).setOrigin(0.5);
    this.guideContainer.add(text2);

    this.scene.tweens.add({
      targets: this.guideContainer,
      y: 537,
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
    this.scoreValueText.setScale(1.22);
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
