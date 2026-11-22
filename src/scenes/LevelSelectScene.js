import { COLORS } from '../config/gameConfig.js';
import { WORLDS } from '../config/levelConfig.js';
import { levelManager } from '../systems/LevelManager.js';
import { audioManager } from '../systems/AudioManager.js';
import { LevelIntroModal } from '../ui/LevelIntroModal.js';

export class LevelSelectScene extends Phaser.Scene {
  constructor() {
    super('LevelSelectScene');
  }

  create(data) {
    this.worldId = (data && data.worldId) || 'world_1';
    this.world = WORLDS[this.worldId] || WORLDS.world_1;

    this.add.image(195, 422, 'pastel_bg');

    // Header Card
    const headerShadow = this.add.graphics();
    headerShadow.fillStyle(0xE3D0F5, 1);
    headerShadow.fillRoundedRect(25, 24, 340, 70, 20);

    const headerBg = this.add.graphics();
    headerBg.fillStyle(0xFFFFFF, 1);
    headerBg.fillRoundedRect(25, 20, 340, 70, 20);

    this.add.text(195, 44, this.world.name.toUpperCase(), {
      fontFamily: 'Fredoka, sans-serif',
      fontSize: '24px',
      fontWeight: '700',
      color: COLORS.ink
    }).setOrigin(0.5);

    const progress = levelManager.getWorldProgress(this.worldId);
    this.add.text(195, 72, `Completed: ${progress.completedCount}/${progress.totalLevels}  •  ★ ${progress.starsEarned}/${progress.totalPossibleStars}`, {
      fontFamily: 'Fredoka, sans-serif',
      fontSize: '13px',
      fontWeight: '600',
      color: this.world.accentColor
    }).setOrigin(0.5);

    // 10 Level Nodes Grid (5 rows x 2 cols or 4 rows x 3 cols)
    const levels = levelManager.getWorldLevels(this.worldId);
    this.createLevelGrid(levels);

    // Level Intro Modal
    this.introModal = new LevelIntroModal(this, {
      onStart: () => {
        if (this.selectedLevel) {
          this.scene.start('GameScene', { levelId: this.selectedLevel.levelId });
        }
      },
      onBack: () => {
        this.selectedLevel = null;
      }
    });

    // Back to World Map Button
    this.createBackButton();
  }

  createLevelGrid(levels) {
    this.levelButtons = [];
    const colX = [80, 195, 310];
    const startY = 160;
    const spacingY = 120;

    levels.forEach((lvl, idx) => {
      const col = idx % 3;
      const row = Math.floor(idx / 3);
      const x = colX[col];
      const y = startY + (row * spacingY);

      const node = this.createLevelNode(x, y, lvl);
      this.levelButtons.push(node);
    });
    return this.levelButtons;
  }

  createLevelNode(x, y, lvl) {
    const node = this.add.container(x, y);

    const shadow = this.add.graphics();
    shadow.fillStyle(0xE3D0F5, 1);
    shadow.fillCircle(0, 4, 34);
    node.add(shadow);

    const circle = this.add.graphics();
    const isUnlocked = lvl.isUnlocked;
    const isCompleted = lvl.progress.completed;

    if (isCompleted) {
      circle.fillStyle(0xFFD93D, 1); // Gold for completed
    } else if (isUnlocked) {
      circle.fillStyle(0xFFFFFF, 1); // White for ready
    } else {
      circle.fillStyle(0xECE5F3, 1); // Grayed out for locked
    }
    circle.fillCircle(0, 0, 34);
    node.add(circle);

    // Level number or Lock icon
    if (isUnlocked) {
      const num = this.add.text(0, -4, String(lvl.levelId), {
        fontFamily: 'Fredoka, sans-serif',
        fontSize: '22px',
        fontWeight: '700',
        color: COLORS.ink
      }).setOrigin(0.5);
      node.add(num);

      // Stars under circle
      const starsEarned = lvl.progress.stars || 0;
      let starsStr = '';
      for (let s = 0; s < 3; s++) {
        starsStr += s < starsEarned ? '★' : '☆';
      }
      const starsDisplay = this.add.text(0, 46, starsStr, {
        fontSize: '15px',
        color: starsEarned > 0 ? '#FFD93D' : '#CDB8EE'
      }).setOrigin(0.5);
      node.add(starsDisplay);

      node.setSize(68, 68);
      node.setInteractive(new Phaser.Geom.Rectangle(-34, -34, 68, 68), Phaser.Geom.Rectangle.Contains);
      node.input.cursor = 'pointer';
      node.on('pointerdown', () => {
        audioManager.playButtonClick();
        this.selectedLevel = lvl;
        this.introModal.show(lvl);
      });
    } else {
      const lock = this.add.text(0, 0, '🔒', {
        fontSize: '22px'
      }).setOrigin(0.5);
      node.add(lock);
    }
    return node;
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

    const label = this.add.text(0, 0, '← Worlds', {
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
      this.scene.start('WorldSelectScene');
    });
  }
}
