import { COLORS } from '../config/gameConfig.js';
import { audioManager } from '../systems/AudioManager.js';

export class GameOverScene extends Phaser.Scene {
  constructor() {
    super('GameOverScene');
  }

  create(data) {
    const finalScore = data.finalScore || 0;
    const highScore = data.highScore || 0;
    const maxCombo = data.maxCombo || 0;
    const isNewHighScore = Boolean(data.isNewHighScore);

    // Background
    this.add.image(195, 422, 'pastel_bg');

    // Decorative halo
    const deco = this.add.graphics();
    deco.fillStyle(0xFFD0E6, 0.7);
    deco.fillCircle(195, 340, 150);

    // Header Title
    const title = this.add.text(195, 90, 'GAME OVER', {
      fontFamily: 'Fredoka, sans-serif',
      fontSize: '44px',
      fontWeight: '700',
      color: COLORS.ink,
      stroke: '#FFFFFF',
      strokeThickness: 6
    }).setOrigin(0.5);

    // New High Score Banner if achieved
    if (isNewHighScore && finalScore > 0) {
      const recordBadge = this.add.container(195, 142);
      const badgeBg = this.add.graphics();
      badgeBg.fillStyle(0xFFD93D, 1);
      badgeBg.fillRoundedRect(-90, -18, 180, 36, 18);
      recordBadge.add(badgeBg);

      const recordText = this.add.text(0, 0, '★ NEW RECORD! ★', {
        fontFamily: 'Fredoka, sans-serif',
        fontSize: '16px',
        fontWeight: '700',
        color: COLORS.ink
      }).setOrigin(0.5);
      recordBadge.add(recordText);

      this.tweens.add({
        targets: recordBadge,
        scale: 1.08,
        duration: 450,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
      });
    }

    // Results Card (x: 195, y: 300)
    this.createResultsCard(195, 290, finalScore, highScore, maxCombo);

    // Share Score Button (x: 195, y: 440)
    this.createShareButton(195, 435, finalScore, maxCombo);

    // Character Reaction Portrait (x: 195, y: 535)
    const char = this.add.image(195, 540, 'mouth_0');
    char.setDisplaySize(160, 185);

    // Play Again Button (x: 195, y: 670)
    this.createPlayAgainButton(195, 665);

    // Home Button (x: 195, y: 745)
    this.createHomeButton(195, 740);
  }

  createShareButton(x, y, score, maxCombo) {
    const btn = this.add.container(x, y);

    const shadow = this.add.graphics();
    shadow.fillStyle(0xE3D0F5, 1);
    shadow.fillRoundedRect(-110, -18, 220, 42, 21);
    btn.add(shadow);

    const bg = this.add.graphics();
    bg.fillStyle(0xFFFFFF, 1);
    bg.fillRoundedRect(-110, -21, 220, 42, 21);
    btn.add(bg);

    const label = this.add.text(0, 0, '📤 Share Score', {
      fontFamily: 'Fredoka, sans-serif',
      fontSize: '18px',
      fontWeight: '700',
      color: COLORS.ink
    }).setOrigin(0.5);
    btn.add(label);

    btn.setSize(220, 42);
    btn.setInteractive({ useHandCursor: true });
    btn.on('pointerdown', () => {
      audioManager.playButtonClick();
      const shareText = `🍬 I scored ${score.toLocaleString()} points (max combo: ${maxCombo}x) in Gem Feeder! Can you beat my score?`;

      if (navigator.share) {
        navigator.share({
          title: 'Gem Feeder',
          text: shareText,
          url: window.location.href
        }).catch(() => {});
      } else if (navigator.clipboard) {
        navigator.clipboard.writeText(shareText).then(() => {
          label.setText('Copied to Clipboard! ✓');
          this.time.delayedCall(1600, () => {
            label.setText('📤 Share Score');
          });
        }).catch(() => {});
      }

      this.tweens.add({
        targets: btn,
        scale: 0.94,
        duration: 80,
        yoyo: true
      });
    });
  }

  createResultsCard(x, y, finalScore, highScore, maxCombo) {
    const card = this.add.container(x, y);

    const shadow = this.add.graphics();
    shadow.fillStyle(0xE3D0F5, 1);
    shadow.fillRoundedRect(-150, -100, 300, 208, 24);
    card.add(shadow);

    const bg = this.add.graphics();
    bg.fillStyle(0xFFFFFF, 1);
    bg.fillRoundedRect(-150, -104, 300, 208, 24);
    card.add(bg);

    // Final Score
    const scoreLabel = this.add.text(0, -78, 'FINAL SCORE', {
      fontFamily: 'Fredoka, sans-serif',
      fontSize: '13px',
      fontWeight: '600',
      color: COLORS.inkSoft,
      letterSpacing: 1.5
    }).setOrigin(0.5);
    card.add(scoreLabel);

    const scoreVal = this.add.text(0, -42, finalScore.toLocaleString(), {
      fontFamily: 'Fredoka, sans-serif',
      fontSize: '44px',
      fontWeight: '700',
      color: COLORS.pink
    }).setOrigin(0.5);
    card.add(scoreVal);

    // Divider line
    const div = this.add.graphics();
    div.lineStyle(1.5, 0xE3D0F5, 1);
    div.lineBetween(-120, -5, 120, -5);
    card.add(div);

    // Best Score row
    const bestLabel = this.add.text(-100, 24, 'Best Score', {
      fontFamily: 'Fredoka, sans-serif',
      fontSize: '16px',
      fontWeight: '600',
      color: COLORS.inkSoft
    });
    card.add(bestLabel);

    const bestVal = this.add.text(100, 24, highScore.toLocaleString(), {
      fontFamily: 'Fredoka, sans-serif',
      fontSize: '18px',
      fontWeight: '700',
      color: COLORS.ink
    }).setOrigin(1, 0);
    card.add(bestVal);

    // Highest Combo row
    const comboLabel = this.add.text(-100, 60, 'Highest Combo', {
      fontFamily: 'Fredoka, sans-serif',
      fontSize: '16px',
      fontWeight: '600',
      color: COLORS.inkSoft
    });
    card.add(comboLabel);

    const comboVal = this.add.text(100, 60, `${maxCombo} Hits`, {
      fontFamily: 'Fredoka, sans-serif',
      fontSize: '18px',
      fontWeight: '700',
      color: COLORS.ink
    }).setOrigin(1, 0);
    card.add(comboVal);

    // card is already added to scene via this.add.container(x, y)
  }

  createPlayAgainButton(x, y) {
    const btn = this.add.container(x, y);

    const shadow = this.add.graphics();
    shadow.fillStyle(0x9C0F56, 1);
    shadow.fillRoundedRect(-140, -28, 280, 62, 31);
    btn.add(shadow);

    const bg = this.add.graphics();
    bg.fillStyle(0xD81B7A, 1);
    bg.fillRoundedRect(-140, -32, 280, 62, 31);
    btn.add(bg);

    const label = this.add.text(0, 0, 'Play Again', {
      fontFamily: 'Fredoka, sans-serif',
      fontSize: '24px',
      fontWeight: '700',
      color: '#FFFFFF'
    }).setOrigin(0.5);
    btn.add(label);

    btn.setSize(280, 62);
    btn.setInteractive({ useHandCursor: true });
    btn.on('pointerdown', () => {
      audioManager.playButtonClick();
      this.tweens.add({
        targets: btn,
        scale: 0.94,
        duration: 80,
        yoyo: true,
        onComplete: () => {
          this.scene.start('GameScene');
        }
      });
    });
  }

  createHomeButton(x, y) {
    const btn = this.add.container(x, y);

    const shadow = this.add.graphics();
    shadow.fillStyle(0xCDB8EE, 1);
    shadow.fillRoundedRect(-140, -22, 280, 50, 25);
    btn.add(shadow);

    const bg = this.add.graphics();
    bg.fillStyle(0xFFFFFF, 1);
    bg.fillRoundedRect(-140, -26, 280, 50, 25);
    btn.add(bg);

    const label = this.add.text(0, 0, 'Home', {
      fontFamily: 'Fredoka, sans-serif',
      fontSize: '20px',
      fontWeight: '600',
      color: COLORS.ink
    }).setOrigin(0.5);
    btn.add(label);

    btn.setSize(280, 50);
    btn.setInteractive({ useHandCursor: true });
    btn.on('pointerdown', () => {
      audioManager.playButtonClick();
      this.tweens.add({
        targets: btn,
        scale: 0.94,
        duration: 80,
        yoyo: true,
        onComplete: () => {
          this.scene.start('HomeScene');
        }
      });
    });
  }
}
