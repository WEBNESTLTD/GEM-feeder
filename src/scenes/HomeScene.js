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

    // Play Button (left: 55, top: 548, width: 280, height: 72, radius: 36)
    this.createPlayButton();

    // How to Play Button (left: 55, top: 644, width: 280, height: 56, radius: 28)
    this.createHowToPlayButton();

    // Bottom Sound Toggle (left: 24, top: 758, width: 52, height: 52)
    this.createSoundButton();

    // Bottom Settings Button (left: 88, top: 758, width: 52, height: 52)
    this.createSettingsButton();

    // Bottom Best Score Pill (right: 24, top: 758, height: 52)
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
  }

  createPlayButton() {
    const btn = this.add.container(195, 584);

    const shadow = this.add.graphics();
    shadow.fillStyle(0x9C0F56, 1);
    shadow.fillRoundedRect(-140, -30, 280, 72, 36);
    btn.add(shadow);

    const bg = this.add.graphics();
    bg.fillStyle(0xD81B7A, 1);
    bg.fillRoundedRect(-140, -36, 280, 72, 36);
    btn.add(bg);

    const icon = this.add.image(-45, 0, 'play_icon');
    icon.setDisplaySize(28, 28);
    btn.add(icon);

    const label = this.add.text(10, 0, 'Play', {
      fontFamily: 'Fredoka, sans-serif',
      fontSize: '30px',
      fontWeight: '700',
      color: '#FFFFFF'
    }).setOrigin(0.5);
    btn.add(label);

    btn.setSize(280, 72);
    btn.setInteractive({ useHandCursor: true });
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

  createHowToPlayButton() {
    const btn = this.add.container(195, 672);

    const shadow = this.add.graphics();
    shadow.fillStyle(0xCDB8EE, 1);
    shadow.fillRoundedRect(-140, -24, 280, 56, 28);
    btn.add(shadow);

    const bg = this.add.graphics();
    bg.fillStyle(0xFFFFFF, 1);
    bg.fillRoundedRect(-140, -28, 280, 56, 28);
    btn.add(bg);

    const label = this.add.text(0, 0, 'How to Play', {
      fontFamily: 'Fredoka, sans-serif',
      fontSize: '22px',
      fontWeight: '600',
      color: COLORS.ink
    }).setOrigin(0.5);
    btn.add(label);

    btn.setSize(280, 56);
    btn.setInteractive({ useHandCursor: true });
    btn.on('pointerdown', () => {
      audioManager.playButtonClick();
      this.tweens.add({
        targets: btn,
        scale: 0.94,
        duration: 80,
        yoyo: true,
        onComplete: () => {
          this.scene.start('TutorialScene');
        }
      });
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
