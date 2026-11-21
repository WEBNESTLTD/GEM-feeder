import { COLORS } from '../config/gameConfig.js';
import { audioManager } from '../systems/AudioManager.js';

export class TutorialScene extends Phaser.Scene {
  constructor() {
    super('TutorialScene');
  }

  create() {
    // Background
    this.add.image(195, 422, 'pastel_bg');

    // Title Card
    const titleShadow = this.add.graphics();
    titleShadow.fillStyle(0xE3D0F5, 1);
    titleShadow.fillRoundedRect(35, 64, 320, 64, 24);

    const titleBg = this.add.graphics();
    titleBg.fillStyle(0xFFFFFF, 1);
    titleBg.fillRoundedRect(35, 60, 320, 64, 24);

    this.add.text(195, 92, 'HOW TO PLAY', {
      fontFamily: 'Fredoka, sans-serif',
      fontSize: '30px',
      fontWeight: '700',
      color: COLORS.ink
    }).setOrigin(0.5);

    // 3 Instruction Step Cards
    const steps = [
      {
        num: '1',
        title: 'Select Candy',
        desc: 'Touch or click the candy resting above the bottom candy packet.',
        color: 0xF0364B
      },
      {
        num: '2',
        title: 'Swipe Up & Aim',
        desc: 'Drag and flick upward toward her open mouth. Swipe faster for more speed!',
        color: 0x3D8BFF
      },
      {
        num: '3',
        title: 'Feed & Combo!',
        desc: 'Score points for feeding! Chain consecutive hits to build massive x2, x3, and x4 combos.',
        color: 0x38C964
      }
    ];

    steps.forEach((step, idx) => {
      const y = 175 + (idx * 155);
      this.createStepCard(195, y, step);
    });

    // Start Playing Button (bottom: 690)
    this.createStartButton();
  }

  createStepCard(x, y, step) {
    const container = this.add.container(x, y);

    const shadow = this.add.graphics();
    shadow.fillStyle(0xE3D0F5, 1);
    shadow.fillRoundedRect(-160, -56, 320, 125, 20);
    container.add(shadow);

    const bg = this.add.graphics();
    bg.fillStyle(0xFFFFFF, 1);
    bg.fillRoundedRect(-160, -60, 320, 125, 20);
    container.add(bg);

    // Number Badge
    const badge = this.add.graphics();
    badge.fillStyle(step.color, 1);
    badge.fillCircle(-115, 0, 24);
    container.add(badge);

    const numText = this.add.text(-115, 0, step.num, {
      fontFamily: 'Fredoka, sans-serif',
      fontSize: '24px',
      fontWeight: '700',
      color: '#FFFFFF'
    }).setOrigin(0.5);
    container.add(numText);

    // Title & Description
    const title = this.add.text(-75, -28, step.title, {
      fontFamily: 'Fredoka, sans-serif',
      fontSize: '20px',
      fontWeight: '700',
      color: COLORS.ink
    });
    container.add(title);

    const desc = this.add.text(-75, 2, step.desc, {
      fontFamily: 'Fredoka, sans-serif',
      fontSize: '14px',
      fontWeight: '500',
      color: COLORS.inkSoft,
      wordWrap: { width: 220 }
    });
    container.add(desc);

    // Animated swipe arrow on step 2
    if (step.num === '2') {
      const swipeDot = this.add.graphics();
      swipeDot.fillStyle(0x3D8BFF, 0.9);
      swipeDot.fillCircle(120, 25, 8);
      container.add(swipeDot);

      this.tweens.add({
        targets: swipeDot,
        y: -15,
        alpha: { from: 1, to: 0.2 },
        duration: 900,
        repeat: -1,
        ease: 'Cubic.easeOut'
      });
    }
  }

  createStartButton() {
    const btn = this.add.container(195, 730);

    const shadow = this.add.graphics();
    shadow.fillStyle(0x9C0F56, 1);
    shadow.fillRoundedRect(-140, -30, 280, 68, 34);
    btn.add(shadow);

    const bg = this.add.graphics();
    bg.fillStyle(0xD81B7A, 1);
    bg.fillRoundedRect(-140, -34, 280, 68, 34);
    btn.add(bg);

    const label = this.add.text(0, 0, 'Start Playing', {
      fontFamily: 'Fredoka, sans-serif',
      fontSize: '26px',
      fontWeight: '700',
      color: '#FFFFFF'
    }).setOrigin(0.5);
    btn.add(label);

    btn.setSize(280, 68);
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
}
