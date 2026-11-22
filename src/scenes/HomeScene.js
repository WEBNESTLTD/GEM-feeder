import { COLORS } from '../config/gameConfig.js';
import { saveManager } from '../storage/SaveManager.js';
import { audioManager } from '../systems/AudioManager.js';
import { EnvironmentManager } from '../systems/EnvironmentManager.js';
import { SettingsMenu } from '../ui/SettingsMenu.js';

export class HomeScene extends Phaser.Scene {
  constructor() {
    super('HomeScene');
  }

  create() {
    // Layered Animated Parallax Environment
    this.environmentManager = new EnvironmentManager(this, {
      worldId: 'world_1',
      reducedMotion: saveManager.getReducedMotion()
    });
    // Hide foreground gameplay counter on home menu so character portrait is clean and unobstructed
    if (this.environmentManager.counterContainer) {
      this.environmentManager.counterContainer.setVisible(false);
    }

    // Background decorative candy circles (matching reference)
    this.createDecorations();

    // GEM FEEDER Logo (top: 44, text-shadow 3D purple effect)
    this.createLogo();

    // Center character portrait illustration (width: 280, height: 325)
    this.character = this.add.image(195, 362, 'mouth_0');
    this.character.setDisplaySize(280, 325);

    const equipped = saveManager.getEquipped();
    if (equipped.accessory === 'acc_glasses') {
      const glasses = this.add.text(195, 305, '👓', { fontSize: '42px', resolution: 2 }).setOrigin(0.5);
      glasses.setDepth(10);
      this.tweens.add({
        targets: glasses,
        y: 299,
        duration: 1800,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
      });
    } else if (equipped.outfit === 'outfit_royal') {
      const crown = this.add.text(195, 230, '👑', { fontSize: '40px', resolution: 2 }).setOrigin(0.5);
      crown.setDepth(10);
      this.tweens.add({
        targets: crown,
        y: 224,
        duration: 1800,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
      });
    }

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

    // Scattered candy dots with glossy dimensional highlights
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
      // Outer rim
      deco.lineStyle(2, 0x000000, 0.15);
      if (deco.strokeCircle) deco.strokeCircle(c.x, c.y, c.r);
      // Specular highlight
      deco.fillStyle(0xFFFFFF, 0.7);
      deco.fillEllipse(c.x - c.r * 0.3, c.y - c.r * 0.38, c.r * 0.4, c.r * 0.22);
      deco.fillStyle(0xFFFFFF, 0.9);
      deco.fillCircle(c.x - c.r * 0.45, c.y - c.r * 0.45, c.r * 0.12);
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
      lineSpacing: -12,
      resolution: 2
    }).setOrigin(0.5);
    logoContainer.add(shadow1);

    const gemText = this.add.text(0, -28, 'GEM', {
      fontFamily: 'Fredoka, sans-serif',
      fontSize: '62px',
      fontWeight: '700',
      color: '#FFD93D',
      align: 'center',
      stroke: '#4B1F86',
      strokeThickness: 8,
      resolution: 2
    }).setOrigin(0.5);
    logoContainer.add(gemText);

    const feederText = this.add.text(0, 30, 'FEEDER', {
      fontFamily: 'Fredoka, sans-serif',
      fontSize: '62px',
      fontWeight: '700',
      color: '#FF7DB8',
      align: 'center',
      stroke: '#4B1F86',
      strokeThickness: 8,
      resolution: 2
    }).setOrigin(0.5);
    logoContainer.add(feederText);

    // Decorative sparkle stars
    const star1 = this.add.text(-120, -35, '✦', {
      fontSize: '28px',
      color: '#FFD93D',
      resolution: 2
    }).setOrigin(0.5);
    logoContainer.add(star1);

    const star2 = this.add.text(125, 25, '✦', {
      fontSize: '24px',
      color: '#FFFFFF',
      resolution: 2
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

    const shadow = this.add.graphics();
    shadow.fillStyle(0x2D1452, 0.25);
    shadow.fillRoundedRect(-110, -13, 220, 32, 16);
    statsPill.add(shadow);

    const bg = this.add.graphics();
    bg.fillStyle(0x562394, 0.95);
    bg.fillRoundedRect(-110, -16, 220, 32, 16);
    // Gloss highlight
    bg.fillStyle(0xFFFFFF, 0.22);
    bg.fillRoundedRect(-108, -14, 216, 12, 6);
    // Gold rim
    bg.lineStyle(1.5, 0xFFD93D, 0.85);
    if (bg.strokeRoundedRect) bg.strokeRoundedRect(-110, -16, 220, 32, 16);
    statsPill.add(bg);

    const statsText = this.add.text(0, 0, `🪙 ${saveManager.getCoins()}  •  ★ ${saveManager.getTotalStars()}/90`, {
      fontFamily: 'Fredoka, sans-serif',
      fontSize: '15px',
      fontWeight: '700',
      color: '#FFFFFF',
      resolution: 2
    }).setOrigin(0.5);
    statsPill.add(statsText);
  }

  createCampaignButton() {
    const btn = this.add.container(195, 545);

    const shadow = this.add.graphics();
    shadow.fillStyle(0x7A0C44, 1);
    shadow.fillRoundedRect(-140, -28, 280, 64, 32);
    btn.add(shadow);

    const bg = this.add.graphics();
    bg.fillStyle(0xD81B7A, 1);
    bg.fillRoundedRect(-140, -32, 280, 64, 32);
    // Glossy top glass highlight
    bg.fillStyle(0xFFFFFF, 0.26);
    bg.fillRoundedRect(-136, -30, 272, 22, 11);
    // Gold accent border
    bg.lineStyle(2, 0xFFD93D, 0.9);
    if (bg.strokeRoundedRect) bg.strokeRoundedRect(-140, -32, 280, 64, 32);
    btn.add(bg);

    const icon = this.add.image(-68, -2, 'play_icon');
    icon.setDisplaySize(24, 24);
    btn.add(icon);

    const label = this.add.text(14, -2, 'Campaign', {
      fontFamily: 'Fredoka, sans-serif',
      fontSize: '26px',
      fontWeight: '700',
      color: '#FFFFFF',
      resolution: 2
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
    shadow.fillStyle(0x2D1452, 0.4);
    shadow.fillRoundedRect(-140, -22, 280, 52, 26);
    btn.add(shadow);

    const bg = this.add.graphics();
    bg.fillStyle(0x562394, 1);
    bg.fillRoundedRect(-140, -26, 280, 52, 26);
    // Gloss highlight
    bg.fillStyle(0xFFFFFF, 0.22);
    bg.fillRoundedRect(-136, -24, 272, 18, 9);
    // Gold rim
    bg.lineStyle(2, 0xFFD93D, 0.85);
    if (bg.strokeRoundedRect) bg.strokeRoundedRect(-140, -26, 280, 52, 26);
    btn.add(bg);

    const label = this.add.text(0, -2, 'Endless Arcade', {
      fontFamily: 'Fredoka, sans-serif',
      fontSize: '20px',
      fontWeight: '700',
      color: '#FFFFFF',
      resolution: 2
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
    sShadow.fillStyle(0x2D1452, 0.35);
    sShadow.fillRoundedRect(-65, -18, 130, 42, 21);
    shopBtn.add(sShadow);

    const sBg = this.add.graphics();
    sBg.fillStyle(0x461C7C, 1);
    sBg.fillRoundedRect(-65, -22, 130, 42, 21);
    // Gloss highlight
    sBg.fillStyle(0xFFFFFF, 0.22);
    sBg.fillRoundedRect(-63, -20, 126, 14, 7);
    sBg.lineStyle(1.5, 0xFFD93D, 0.85);
    if (sBg.strokeRoundedRect) sBg.strokeRoundedRect(-65, -22, 130, 42, 21);
    shopBtn.add(sBg);

    const sLabel = this.add.text(0, -2, '🛍️ Shop', {
      fontFamily: 'Fredoka, sans-serif',
      fontSize: '16px',
      fontWeight: '700',
      color: '#FFFFFF',
      resolution: 2
    }).setOrigin(0.5);
    shopBtn.add(sLabel);

    shopBtn.setSize(130, 42);
    shopBtn.setInteractive(new Phaser.Geom.Rectangle(-65, -22, 130, 42), Phaser.Geom.Rectangle.Contains);
    shopBtn.input.cursor = 'pointer';
    shopBtn.on('pointerdown', () => {
      audioManager.playButtonClick();
      this.tweens.add({
        targets: shopBtn,
        scale: 0.92,
        duration: 70,
        yoyo: true,
        onComplete: () => this.scene.start('ShopScene')
      });
    });

    // Right: Quests & Missions (x: 265, y: 685)
    const questBtn = this.add.container(265, 685);
    const qShadow = this.add.graphics();
    qShadow.fillStyle(0x2D1452, 0.35);
    qShadow.fillRoundedRect(-65, -18, 130, 42, 21);
    questBtn.add(qShadow);

    const qBg = this.add.graphics();
    qBg.fillStyle(0x461C7C, 1);
    qBg.fillRoundedRect(-65, -22, 130, 42, 21);
    qBg.fillStyle(0xFFFFFF, 0.22);
    qBg.fillRoundedRect(-63, -20, 126, 14, 7);
    qBg.lineStyle(1.5, 0xFFD93D, 0.85);
    if (qBg.strokeRoundedRect) qBg.strokeRoundedRect(-65, -22, 130, 42, 21);
    questBtn.add(qBg);

    const qLabel = this.add.text(0, -2, '📋 Quests', {
      fontFamily: 'Fredoka, sans-serif',
      fontSize: '16px',
      fontWeight: '700',
      color: '#FFFFFF',
      resolution: 2
    }).setOrigin(0.5);
    questBtn.add(qLabel);

    questBtn.setSize(130, 42);
    questBtn.setInteractive(new Phaser.Geom.Rectangle(-65, -22, 130, 42), Phaser.Geom.Rectangle.Contains);
    questBtn.input.cursor = 'pointer';
    questBtn.on('pointerdown', () => {
      audioManager.playButtonClick();
      this.tweens.add({
        targets: questBtn,
        scale: 0.92,
        duration: 70,
        yoyo: true,
        onComplete: () => this.scene.start('MissionScene')
      });
    });
  }

  createTutorialLink() {
    const link = this.add.text(195, 735, 'How to Play?', {
      fontFamily: 'Fredoka, sans-serif',
      fontSize: '14px',
      fontWeight: '700',
      color: '#FFD93D',
      resolution: 2
    }).setOrigin(0.5);
    link.setInteractive({ useHandCursor: true });
    link.on('pointerdown', () => {
      audioManager.playButtonClick();
      this.scene.start('TutorialScene');
    });
  }

  createSoundButton() {
    this.soundBtn = this.add.container(46, 784);

    const shadow = this.add.graphics();
    shadow.fillStyle(0x2D1452, 0.35);
    shadow.fillCircle(0, 4, 24);
    this.soundBtn.add(shadow);

    const bg = this.add.graphics();
    bg.fillStyle(0x562394, 1);
    bg.fillCircle(0, 0, 24);
    // Gloss highlight
    bg.fillStyle(0xFFFFFF, 0.28);
    bg.fillEllipse(0, -8, 16, 7);
    bg.lineStyle(2, 0xFFD93D, 0.85);
    if (bg.strokeCircle) bg.strokeCircle(0, 0, 24);
    this.soundBtn.add(bg);

    const isEnabled = saveManager.getSoundEnabled();
    this.soundIcon = this.add.image(0, 0, isEnabled ? 'sound_on' : 'sound_off');
    this.soundIcon.setDisplaySize(24, 24);
    this.soundBtn.add(this.soundIcon);

    this.soundBtn.setSize(48, 48);
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
    this.settingsBtn = this.add.container(104, 784);

    const shadow = this.add.graphics();
    shadow.fillStyle(0x2D1452, 0.35);
    shadow.fillCircle(0, 4, 24);
    this.settingsBtn.add(shadow);

    const bg = this.add.graphics();
    bg.fillStyle(0x562394, 1);
    bg.fillCircle(0, 0, 24);
    bg.fillStyle(0xFFFFFF, 0.28);
    bg.fillEllipse(0, -8, 16, 7);
    bg.lineStyle(2, 0xFFD93D, 0.85);
    if (bg.strokeCircle) bg.strokeCircle(0, 0, 24);
    this.settingsBtn.add(bg);

    const gearText = this.add.text(0, 0, '⚙', {
      fontFamily: 'Fredoka, sans-serif',
      fontSize: '22px',
      color: '#FFFFFF',
      resolution: 2
    }).setOrigin(0.5);
    this.settingsBtn.add(gearText);

    this.settingsBtn.setSize(48, 48);
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
    shadow.fillStyle(0x2D1452, 0.35);
    shadow.fillRoundedRect(-68, -22, 136, 52, 26);
    bestContainer.add(shadow);

    const bg = this.add.graphics();
    bg.fillStyle(0x461C7C, 1);
    bg.fillRoundedRect(-68, -26, 136, 52, 26);
    bg.fillStyle(0xFFFFFF, 0.22);
    bg.fillRoundedRect(-65, -24, 130, 16, 8);
    bg.lineStyle(2, 0xFFD93D, 0.85);
    if (bg.strokeRoundedRect) bg.strokeRoundedRect(-68, -26, 136, 52, 26);
    bestContainer.add(bg);

    const label = this.add.text(-22, 0, 'BEST', {
      fontFamily: 'Fredoka, sans-serif',
      fontSize: '11px',
      fontWeight: '700',
      color: '#FFD93D',
      letterSpacing: 1.5,
      resolution: 2
    }).setOrigin(0.5);
    bestContainer.add(label);

    const highScore = saveManager.getHighScore();
    const val = this.add.text(22, 0, highScore.toLocaleString(), {
      fontFamily: 'Fredoka, sans-serif',
      fontSize: '22px',
      fontWeight: '700',
      color: '#FFFFFF',
      resolution: 2
    }).setOrigin(0.5);
    bestContainer.add(val);
  }

  update(time, delta) {
    if (this.environmentManager) {
      this.environmentManager.update(time, delta);
    }
  }
}
