import { COLORS } from '../config/gameConfig.js';
import { WORLDS } from '../config/levelConfig.js';
import { levelManager } from '../systems/LevelManager.js';
import { saveManager } from '../storage/SaveManager.js';
import { audioManager } from '../systems/AudioManager.js';

export class WorldSelectScene extends Phaser.Scene {
  constructor() {
    super('WorldSelectScene');
  }

  create() {
    this.add.image(195, 422, 'pastel_bg');

    // Header Title
    const titleShadow = this.add.graphics();
    titleShadow.fillStyle(0xE3D0F5, 1);
    titleShadow.fillRoundedRect(35, 34, 320, 60, 20);

    const titleBg = this.add.graphics();
    titleBg.fillStyle(0xFFFFFF, 1);
    titleBg.fillRoundedRect(35, 30, 320, 60, 20);

    this.add.text(195, 60, 'SELECT WORLD', {
      fontFamily: 'Fredoka, sans-serif',
      fontSize: '28px',
      fontWeight: '700',
      color: COLORS.ink
    }).setOrigin(0.5);

    // Coin & Star Pill (top subheader)
    const statsPill = this.add.container(195, 115);
    const sBg = this.add.graphics();
    sBg.fillStyle(0xFFFFFF, 0.9);
    sBg.fillRoundedRect(-120, -16, 240, 32, 16);
    statsPill.add(sBg);

    const statsText = this.add.text(0, 0, `🪙 ${saveManager.getCoins()}   ★ ${saveManager.getTotalStars()}/90`, {
      fontFamily: 'Fredoka, sans-serif',
      fontSize: '15px',
      fontWeight: '700',
      color: COLORS.ink
    }).setOrigin(0.5);
    statsPill.add(statsText);

    // 3 World Cards
    const worldsList = levelManager.getAllWorlds();
    worldsList.forEach((world, idx) => {
      const y = 220 + (idx * 180);
      this.createWorldCard(195, y, world);
    });

    // Back to Home Button
    this.createBackButton();
  }

  createWorldCard(x, y, world) {
    const isUnlocked = levelManager.isWorldUnlocked(world.id);
    const progress = levelManager.getWorldProgress(world.id);

    const card = this.add.container(x, y);

    const shadow = this.add.graphics();
    shadow.fillStyle(0xE3D0F5, 1);
    shadow.fillRoundedRect(-160, -70, 320, 150, 24);
    card.add(shadow);

    const bg = this.add.graphics();
    bg.fillStyle(isUnlocked ? 0xFFFFFF : 0xF3EEF8, 1);
    bg.fillRoundedRect(-160, -74, 320, 150, 24);
    card.add(bg);

    // Left accent strip
    const strip = this.add.graphics();
    strip.fillStyle(parseInt(world.accentColor.replace('#', '0x'), 16), 1);
    strip.fillRoundedRect(-160, -74, 16, 150, { tl: 24, bl: 24, tr: 0, br: 0 });
    card.add(strip);

    // Title
    const title = this.add.text(-125, -50, world.name, {
      fontFamily: 'Fredoka, sans-serif',
      fontSize: '22px',
      fontWeight: '700',
      color: isUnlocked ? COLORS.ink : COLORS.inkSoft
    });
    card.add(title);

    // Description
    const desc = this.add.text(-125, -20, world.description, {
      fontFamily: 'Fredoka, sans-serif',
      fontSize: '13px',
      fontWeight: '500',
      color: COLORS.inkSoft,
      wordWrap: { width: 260 }
    });
    card.add(desc);

    if (isUnlocked) {
      // Progress indicators
      const progText = this.add.text(-125, 30, `Progress: ${progress.completedCount}/${progress.totalLevels}  •  ★ ${progress.starsEarned}/${progress.totalPossibleStars}`, {
        fontFamily: 'Fredoka, sans-serif',
        fontSize: '14px',
        fontWeight: '600',
        color: world.accentColor
      });
      card.add(progText);

      card.setSize(320, 150);
      card.setInteractive(new Phaser.Geom.Rectangle(-160, -74, 320, 150), Phaser.Geom.Rectangle.Contains);
      card.input.cursor = 'pointer';
      card.on('pointerdown', () => {
        audioManager.playButtonClick();
        this.scene.start('LevelSelectScene', { worldId: world.id });
      });
    } else {
      // Locked state
      const lockPill = this.add.container(0, 35);
      const lBg = this.add.graphics();
      lBg.fillStyle(0xE3D0F5, 1);
      lBg.fillRoundedRect(-100, -14, 200, 28, 14);
      lockPill.add(lBg);

      const lText = this.add.text(0, 0, `🔒 Requires ${world.requiredStarsToUnlock} Stars`, {
        fontFamily: 'Fredoka, sans-serif',
        fontSize: '13px',
        fontWeight: '700',
        color: COLORS.ink
      }).setOrigin(0.5);
      lockPill.add(lText);
      card.add(lockPill);
    }
  }

  createBackButton() {
    const btn = this.add.container(195, 785);

    const shadow = this.add.graphics();
    shadow.fillStyle(0xCDB8EE, 1);
    shadow.fillRoundedRect(-120, -22, 240, 48, 24);
    btn.add(shadow);

    const bg = this.add.graphics();
    bg.fillStyle(0xFFFFFF, 1);
    bg.fillRoundedRect(-120, -26, 240, 48, 24);
    btn.add(bg);

    const label = this.add.text(0, 0, '← Main Menu', {
      fontFamily: 'Fredoka, sans-serif',
      fontSize: '18px',
      fontWeight: '700',
      color: COLORS.ink
    }).setOrigin(0.5);
    btn.add(label);

    btn.setSize(240, 48);
    btn.setInteractive(new Phaser.Geom.Rectangle(-120, -26, 240, 48), Phaser.Geom.Rectangle.Contains);
    btn.input.cursor = 'pointer';
    btn.on('pointerdown', () => {
      audioManager.playButtonClick();
      this.scene.start('HomeScene');
    });
  }
}
