import { COLORS } from '../config/gameConfig.js';
import { saveManager } from '../storage/SaveManager.js';
import { audioManager } from '../systems/AudioManager.js';
import { SettingsMenu } from '../ui/SettingsMenu.js';

export class HomeScene extends Phaser.Scene {
  constructor() {
    super('HomeScene');
  }

  create() {
    // Background
    this.add.image(195, 422, 'pastel_bg');

    // Background decorative candy circles (matching reference)
    this.createDecorations();

    // GEM FEEDER Logo (top: 44, text-shadow 3D purple effect)
    this.createLogo();

    // Center character portrait illustration (width: 280, height: 325)
    this.character = this.add.image(195, 362, 'mouth_0');
    this.character.setDisplaySize(280, 325);

    // Idle floating animation
    this.tweens.add({
      targets: this.character,
      y: 356,
      duration: 1800,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });

    // Top Header Stats (Coins & Stars)
    this.createTopStats();

    // 1. Campaign Mode Button (Primary CTA)
    this.createCampaignButton();

    // 2. Endless Arcade Button
    this.createArcadeButton();

    // 3. Middle Features Row: Shop and Quests
    this.createFeaturesRow();

    // Bottom Sound Toggle (left: 24, top: 765, width: 52, height: 52)
    this.createSoundButton();

    // Bottom Settings Button (left: 88, top: 765, width: 52, height: 52)
    this.createSettingsButton();

    // Bottom How to play text link
    this.createTutorialLink();

    // Bottom Best Score Pill (right: 24, top: 765, height: 52)
    this.createBestScoreCard();

    // Settings Modal
    this.settingsMenu = new SettingsMenu(this, {
      onClose: () => {
        // Update sound icon in case toggled inside settings modal
        const isEnabled = saveManager.getSoundEnabled();
        if (this.soundIcon) {
          this.soundIcon.setTexture(isEnabled ? 'sound_on' : 'sound_off');
        }
      }
    });
  }

  createDecorations() {
    const deco = this.add.graphics();
    // Halo circle behind character
    deco.fillStyle(0xFFD0E6, 0.8);
    deco.fillCircle(195, 360, 150);

    // Scattered candy dots
    const candies = [
      { x: 46, y: 230, r: 20, fill: 0xF0364B },
      { x: 346, y: 210, r: 24, fill: 0xFFD93D },
      { x: 330, y: 420, r: 16, fill: 0x3D8BFF },
      { x: 52, y: 440, r: 22, fill: 0x38C964 },
      { x: 300, y: 330, r: 12, fill: 0x9B5DE5 },
      { x: 90, y: 330, r: 13, fill: 0xFF8A2B },
      { x: 350, y: 500, r: 14, fill: 0xFF5CAA },
      { x: 36, y: 520, r: 12, fill: 0xFFD93D }
    ];

    for (const c of candies) {
      deco.fillStyle(c.fill, 1);
      deco.fillCircle(c.x, c.y, c.r);
      // Specular highlight
      deco.fillStyle(0xFFFFFF, 0.6);
      deco.fillEllipse(c.x - c.r * 0.3, c.y - c.r * 0.38, c.r * 0.38, c.r * 0.2);
    }
  }

  createLogo() {
    const logoContainer = this.add.container(195, 100);

    const shadow1 = this.add.text(0, 4, 'GEM\nFEEDER', {
      fontFamily: 'Fredoka, sans-serif',
      fontSize: '62px',
      fontWeight: '700',
      color: '#3E1675',
      align: 'center',
      lineSpacing: -12
    }).setOrigin(0.5);
    logoContainer.add(shadow1);

    const gemText = this.add.text(0, -28, 'GEM', {
      fontFamily: 'Fredoka, sans-serif',
      fontSize: '62px',
      fontWeight: '700',
      color: '#FFD93D',
      align: 'center',
      stroke: '#4B1F86',
      strokeThickness: 8
    }).setOrigin(0.5);
    logoContainer.add(gemText);

    const feederText = this.add.text(0, 30, 'FEEDER', {
      fontFamily: 'Fredoka, sans-serif',
      fontSize: '62px',
      fontWeight: '700',
      color: '#FF7DB8',
      align: 'center',
      stroke: '#4B1F86',
      strokeThickness: 8
    }).setOrigin(0.5);
    logoContainer.add(feederText);

    // Decorative sparkle stars
    const star1 = this.add.text(-120, -35, '✦', {
      fontSize: '28px',
      color: '#FFD93D'
    }).setOrigin(0.5);
    logoContainer.add(star1);

    const star2 = this.add.text(125, 25, '✦', {
      fontSize: '24px',
      color: '#FFFFFF'
    }).setOrigin(0.5);
    logoContainer.add(star2);

    this.tweens.add({
      targets: [star1, star2],
      scale: 1.3,
      alpha: 0.6,
      duration: 700,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });
  }

  createTopStats() {
    const statsPill = this.add.container(195, 185);
    const bg = this.add.graphics();
    bg.fillStyle(0xFFFFFF, 0.9);
    bg.fillRoundedRect(-110, -16, 220, 32, 16);
    statsPill.add(bg);

    const statsText = this.add.text(0, 0, `🪙 ${saveManager.getCoins()}  •  ★ ${saveManager.getTotalStars()}/90`, {
      fontFamily: 'Fredoka, sans-serif',
      fontSize: '15px',
      fontWeight: '700',
      color: COLORS.ink
    }).setOrigin(0.5);
    statsPill.add(statsText);
  }

  createCampaignButton() {
    const btn = this.add.container(195, 545);

    const shadow = this.add.graphics();
    shadow.fillStyle(0x9C0F56, 1);
    shadow.fillRoundedRect(-140, -28, 280, 64, 32);
    btn.add(shadow);

    const bg = this.add.graphics();
    bg.fillStyle(0xD81B7A, 1);
    bg.fillRoundedRect(-140, -32, 280, 64, 32);
    btn.add(bg);

    const icon = this.add.image(-55, -2, 'play_icon');
    icon.setDisplaySize(26, 26);
    btn.add(icon);

    const label = this.add.text(5, -2, 'Campaign', {
      fontFamily: 'Fredoka, sans-serif',
      fontSize: '26px',
      fontWeight: '700',
      color: '#FFFFFF'
    }).setOrigin(0.5);
    btn.add(label);

    btn.setSize(280, 64);
    btn.setInteractive(new Phaser.Geom.Rectangle(-140, -32, 280, 64), Phaser.Geom.Rectangle.Contains);
    btn.input.cursor = 'pointer';

    // Subtle breathing pulse
    this.tweens.add({
      targets: btn,
      scale: 1.03,
      duration: 1000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });

    btn.on('pointerdown', () => {
      audioManager.playButtonClick();
      audioManager.startBGM();
      this.tweens.add({
        targets: btn,
        scale: 0.94,
        duration: 80,
        yoyo: true,
        onComplete: () => {
          this.scene.start('WorldSelectScene');
        }
      });
    });
  }

  createArcadeButton() {
    const btn = this.add.container(195, 620);

    const shadow = this.add.graphics();
    shadow.fillStyle(0xCDB8EE, 1);
    shadow.fillRoundedRect(-140, -22, 280, 52, 26);
    btn.add(shadow);

    const bg = this.add.graphics();
    bg.fillStyle(0xFFFFFF, 1);
    bg.fillRoundedRect(-140, -26, 280, 52, 26);
    btn.add(bg);

    const label = this.add.text(0, -2, 'Endless Arcade', {
      fontFamily: 'Fredoka, sans-serif',
      fontSize: '20px',
      fontWeight: '700',
      color: COLORS.ink
    }).setOrigin(0.5);
    btn.add(label);

    btn.setSize(280, 52);
    btn.setInteractive(new Phaser.Geom.Rectangle(-140, -26, 280, 52), Phaser.Geom.Rectangle.Contains);
    btn.input.cursor = 'pointer';

    btn.on('pointerdown', () => {
      audioManager.playButtonClick();
      audioManager.startBGM();
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

  createFeaturesRow() {
    // Left: Sweet Shop (x: 125, y: 685)
    const shopBtn = this.add.container(125, 685);
    const sShadow = this.add.graphics();
    sShadow.fillStyle(0xCDB8EE, 1);
    sShadow.fillRoundedRect(-65, -18, 130, 42, 21);
    shopBtn.add(sShadow);

    const sBg = this.add.graphics();
    sBg.fillStyle(0xFFFFFF, 1);
    sBg.fillRoundedRect(-65, -22, 130, 42, 21);
    shopBtn.add(sBg);

    const sLabel = this.add.text(0, -2, '🛍️ Shop', {
      fontFamily: 'Fredoka, sans-serif',
      fontSize: '16px',
      fontWeight: '700',
      color: COLORS.ink
    }).setOrigin(0.5);
    shopBtn.add(sLabel);

    shopBtn.setSize(130, 42);
    shopBtn.setInteractive(new Phaser.Geom.Rectangle(-65, -22, 130, 42), Phaser.Geom.Rectangle.Contains);
    shopBtn.input.cursor = 'pointer';
    shopBtn.on('pointerdown', () => {
      audioManager.playButtonClick();
      this.scene.start('ShopScene');
    });

    // Right: Quests & Missions (x: 265, y: 685)
    const questBtn = this.add.container(265, 685);
    const qShadow = this.add.graphics();
    qShadow.fillStyle(0xCDB8EE, 1);
    qShadow.fillRoundedRect(-65, -18, 130, 42, 21);
    questBtn.add(qShadow);

    const qBg = this.add.graphics();
    qBg.fillStyle(0xFFFFFF, 1);
    qBg.fillRoundedRect(-65, -22, 130, 42, 21);
    questBtn.add(qBg);

    const qLabel = this.add.text(0, -2, '📋 Quests', {
      fontFamily: 'Fredoka, sans-serif',
      fontSize: '16px',
      fontWeight: '700',
      color: COLORS.ink
    }).setOrigin(0.5);
    questBtn.add(qLabel);

    questBtn.setSize(130, 42);
    questBtn.setInteractive(new Phaser.Geom.Rectangle(-65, -22, 130, 42), Phaser.Geom.Rectangle.Contains);
    questBtn.input.cursor = 'pointer';
    questBtn.on('pointerdown', () => {
      audioManager.playButtonClick();
      this.scene.start('MissionScene');
    });
  }

  createTutorialLink() {
    const link = this.add.text(195, 735, 'How to Play?', {
      fontFamily: 'Fredoka, sans-serif',
      fontSize: '14px',
      fontWeight: '600',
      color: COLORS.inkSoft
    }).setOrigin(0.5);
    link.setInteractive({ useHandCursor: true });
    link.on('pointerdown', () => {
      audioManager.playButtonClick();
      this.scene.start('TutorialScene');
    });
  }

  createSoundButton() {
    this.soundBtn = this.add.container(50, 784);

    const shadow = this.add.graphics();
    shadow.fillStyle(0xE3D0F5, 1);
    shadow.fillCircle(0, 4, 26);
    this.soundBtn.add(shadow);

    const bg = this.add.graphics();
    bg.fillStyle(0xFFFFFF, 1);
    bg.fillCircle(0, 0, 26);
    this.soundBtn.add(bg);

    const isEnabled = saveManager.getSoundEnabled();
    this.soundIcon = this.add.image(0, 0, isEnabled ? 'sound_on' : 'sound_off');
    this.soundIcon.setDisplaySize(26, 26);
    this.soundBtn.add(this.soundIcon);

    this.soundBtn.setSize(52, 52);
    this.soundBtn.setInteractive({ useHandCursor: true });
    this.soundBtn.on('pointerdown', () => {
      const active = audioManager.toggleSound();
      this.soundIcon.setTexture(active ? 'sound_on' : 'sound_off');
      this.tweens.add({
        targets: this.soundBtn,
        scale: 0.88,
        duration: 80,
        yoyo: true
      });
    });
  }

  createSettingsButton() {
    this.settingsBtn = this.add.container(92, 784);

    const shadow = this.add.graphics();
    shadow.fillStyle(0xE3D0F5, 1);
    shadow.fillCircle(0, 4, 26);
    this.settingsBtn.add(shadow);

    const bg = this.add.graphics();
    bg.fillStyle(0xFFFFFF, 1);
    bg.fillCircle(0, 0, 26);
    this.settingsBtn.add(bg);

    const gearText = this.add.text(0, 0, '⚙', {
      fontFamily: 'Fredoka, sans-serif',
      fontSize: '24px',
      color: COLORS.ink
    }).setOrigin(0.5);
    this.settingsBtn.add(gearText);

    this.settingsBtn.setSize(52, 52);
    this.settingsBtn.setInteractive({ useHandCursor: true });
    this.settingsBtn.on('pointerdown', () => {
      audioManager.playButtonClick();
      this.tweens.add({
        targets: this.settingsBtn,
        scale: 0.88,
        duration: 80,
        yoyo: true,
        onComplete: () => {
          this.settingsMenu.show();
        }
      });
    });
  }

  createBestScoreCard() {
    const bestContainer = this.add.container(295, 784);

    const shadow = this.add.graphics();
    shadow.fillStyle(0xE3D0F5, 1);
    shadow.fillRoundedRect(-68, -22, 136, 52, 26);
    bestContainer.add(shadow);

    const bg = this.add.graphics();
    bg.fillStyle(0xFFFFFF, 1);
    bg.fillRoundedRect(-68, -26, 136, 52, 26);
    bestContainer.add(bg);

    const label = this.add.text(-22, 0, 'BEST', {
      fontFamily: 'Fredoka, sans-serif',
      fontSize: '11px',
      fontWeight: '600',
      color: COLORS.inkSoft,
      letterSpacing: 1.5
    }).setOrigin(0.5);
    bestContainer.add(label);

    const highScore = saveManager.getHighScore();
    const val = this.add.text(22, 0, highScore.toLocaleString(), {
      fontFamily: 'Fredoka, sans-serif',
      fontSize: '22px',
      fontWeight: '700',
      color: COLORS.ink
    }).setOrigin(0.5);
    bestContainer.add(val);
  }
}
