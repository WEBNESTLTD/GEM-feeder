import { COLORS } from '../config/gameConfig.js';
import { saveManager } from '../storage/SaveManager.js';
import { audioManager } from '../systems/AudioManager.js';
import { missionManager } from '../systems/MissionManager.js';
import { achievementManager } from '../systems/AchievementManager.js';

export class MissionScene extends Phaser.Scene {
  constructor() {
    super('MissionScene');
  }

  create() {
    this.add.image(195, 422, 'pastel_bg');

    // Title Card
    const headerShadow = this.add.graphics();
    headerShadow.fillStyle(0xE3D0F5, 1);
    headerShadow.fillRoundedRect(35, 24, 320, 60, 20);

    const headerBg = this.add.graphics();
    headerBg.fillStyle(0xFFFFFF, 1);
    headerBg.fillRoundedRect(35, 20, 320, 60, 20);

    this.add.text(195, 50, 'QUESTS & REWARDS', {
      fontFamily: 'Fredoka, sans-serif',
      fontSize: '24px',
      fontWeight: '700',
      color: COLORS.ink
    }).setOrigin(0.5);

    // Coins balance display
    this.coinContainer = this.add.container(195, 105);
    const cBg = this.add.graphics();
    cBg.fillStyle(0xFFFFFF, 0.9);
    cBg.fillRoundedRect(-80, -16, 160, 32, 16);
    this.coinContainer.add(cBg);

    this.coinText = this.add.text(0, 0, `🪙 ${saveManager.getCoins()} Coins`, {
      fontFamily: 'Fredoka, sans-serif',
      fontSize: '16px',
      fontWeight: '700',
      color: COLORS.ink
    }).setOrigin(0.5);
    this.coinContainer.add(this.coinText);

    // Tab Switcher: "Daily Missions" vs "Achievements"
    this.currentTab = 'missions';
    this.tabContainer = this.add.container(195, 150);
    this.createTabButtons();

    // Content container
    this.contentContainer = this.add.container(0, 0);
    this.renderTabContent();

    // Back to Main Menu Button
    this.createBackButton();
  }

  createTabButtons() {
    // Missions Tab Btn
    this.tabMissionsBtn = this.add.container(-70, 0);
    this.tabMissionsBg = this.add.graphics();
    this.tabMissionsText = this.add.text(0, 0, 'Daily Quests', {
      fontFamily: 'Fredoka, sans-serif',
      fontSize: '15px',
      fontWeight: '700'
    }).setOrigin(0.5);
    this.tabMissionsBtn.add(this.tabMissionsBg);
    this.tabMissionsBtn.add(this.tabMissionsText);
    this.tabMissionsBtn.setSize(120, 34);
    this.tabMissionsBtn.setInteractive(new Phaser.Geom.Rectangle(-60, -17, 120, 34), Phaser.Geom.Rectangle.Contains);
    this.tabMissionsBtn.input.cursor = 'pointer';
    this.tabMissionsBtn.on('pointerdown', () => {
      audioManager.playButtonClick();
      this.currentTab = 'missions';
      this.updateTabStyles();
      this.renderTabContent();
    });
    this.tabContainer.add(this.tabMissionsBtn);

    // Achievements Tab Btn
    this.tabAchBtn = this.add.container(70, 0);
    this.tabAchBg = this.add.graphics();
    this.tabAchText = this.add.text(0, 0, 'Achievements', {
      fontFamily: 'Fredoka, sans-serif',
      fontSize: '15px',
      fontWeight: '700'
    }).setOrigin(0.5);
    this.tabAchBtn.add(this.tabAchBg);
    this.tabAchBtn.add(this.tabAchText);
    this.tabAchBtn.setSize(120, 34);
    this.tabAchBtn.setInteractive(new Phaser.Geom.Rectangle(-60, -17, 120, 34), Phaser.Geom.Rectangle.Contains);
    this.tabAchBtn.input.cursor = 'pointer';
    this.tabAchBtn.on('pointerdown', () => {
      audioManager.playButtonClick();
      this.currentTab = 'achievements';
      this.updateTabStyles();
      this.renderTabContent();
    });
    this.tabContainer.add(this.tabAchBtn);

    this.updateTabStyles();
  }

  updateTabStyles() {
    const isMissions = this.currentTab === 'missions';

    this.tabMissionsBg.clear();
    this.tabMissionsBg.fillStyle(isMissions ? 0xD81B7A : 0xFFFFFF, 1);
    this.tabMissionsBg.fillRoundedRect(-60, -17, 120, 34, 17);
    this.tabMissionsText.setColor(isMissions ? '#FFFFFF' : COLORS.ink);

    this.tabAchBg.clear();
    this.tabAchBg.fillStyle(!isMissions ? 0xD81B7A : 0xFFFFFF, 1);
    this.tabAchBg.fillRoundedRect(-60, -17, 120, 34, 17);
    this.tabAchText.setColor(!isMissions ? '#FFFFFF' : COLORS.ink);
  }

  renderTabContent() {
    this.contentContainer.removeAll(true);

    if (this.currentTab === 'missions') {
      this.renderMissions();
    } else {
      this.renderAchievements();
    }
  }

  renderMissions() {
    const missions = missionManager.getDailyMissions();
    missions.forEach((m, idx) => {
      const y = 220 + (idx * 130);
      const row = this.add.container(195, y);

      const shadow = this.add.graphics();
      shadow.fillStyle(0xE3D0F5, 1);
      shadow.fillRoundedRect(-160, -50, 320, 110, 20);
      row.add(shadow);

      const bg = this.add.graphics();
      bg.fillStyle(0xFFFFFF, 1);
      bg.fillRoundedRect(-160, -54, 320, 110, 20);
      row.add(bg);

      // Title & Description
      const title = this.add.text(-135, -36, m.title, {
        fontFamily: 'Fredoka, sans-serif',
        fontSize: '18px',
        fontWeight: '700',
        color: COLORS.ink
      });
      row.add(title);

      const desc = this.add.text(-135, -12, m.desc, {
        fontFamily: 'Fredoka, sans-serif',
        fontSize: '13px',
        fontWeight: '500',
        color: COLORS.inkSoft,
        wordWrap: { width: 180 }
      });
      row.add(desc);

      // Progress bar
      const pBarBg = this.add.graphics();
      pBarBg.fillStyle(0xE3D0F5, 1);
      pBarBg.fillRoundedRect(-135, 20, 150, 10, 5);
      row.add(pBarBg);

      const ratio = Math.min(1, m.progress / m.target);
      if (ratio > 0) {
        const pBarFill = this.add.graphics();
        pBarFill.fillStyle(0x38C964, 1);
        pBarFill.fillRoundedRect(-135, 20, 150 * ratio, 10, 5);
        row.add(pBarFill);
      }

      const progText = this.add.text(25, 25, `${m.progress}/${m.target}`, {
        fontFamily: 'Fredoka, sans-serif',
        fontSize: '12px',
        fontWeight: '700',
        color: COLORS.inkSoft
      }).setOrigin(0, 0.5);
      row.add(progText);

      // Claim / Completed Button
      const claimBtn = this.add.container(105, 0);
      const cBg = this.add.graphics();
      const canClaim = m.completed && !m.claimed;
      cBg.fillStyle(canClaim ? 0x38C964 : (m.claimed ? 0xE3D0F5 : 0xFFD93D), 1);
      cBg.fillRoundedRect(-44, -18, 88, 36, 18);
      claimBtn.add(cBg);

      const cText = this.add.text(0, 0, m.claimed ? 'Claimed' : (canClaim ? 'Claim!' : `🪙 ${m.reward}`), {
        fontFamily: 'Fredoka, sans-serif',
        fontSize: '13px',
        fontWeight: '700',
        color: m.claimed ? COLORS.inkSoft : (canClaim ? '#FFFFFF' : COLORS.ink)
      }).setOrigin(0.5);
      claimBtn.add(cText);

      if (canClaim) {
        claimBtn.setSize(88, 36);
        claimBtn.setInteractive(new Phaser.Geom.Rectangle(-44, -18, 88, 36), Phaser.Geom.Rectangle.Contains);
        claimBtn.input.cursor = 'pointer';
        claimBtn.on('pointerdown', () => {
          const res = missionManager.claimReward(m.id);
          if (res.success) {
            audioManager.playCoinCollect();
            this.coinText.setText(`🪙 ${saveManager.getCoins()} Coins`);
            this.renderTabContent();
          }
        });
      }
      row.add(claimBtn);

      this.contentContainer.add(row);
    });
  }

  renderAchievements() {
    const list = achievementManager.getAchievements();
    list.slice(0, 4).forEach((ach, idx) => {
      const y = 220 + (idx * 115);
      const row = this.add.container(195, y);

      const shadow = this.add.graphics();
      shadow.fillStyle(0xE3D0F5, 1);
      shadow.fillRoundedRect(-160, -45, 320, 95, 20);
      row.add(shadow);

      const bg = this.add.graphics();
      bg.fillStyle(0xFFFFFF, 1);
      bg.fillRoundedRect(-160, -49, 320, 95, 20);
      row.add(bg);

      // Icon & Name
      const star = this.add.text(-135, -10, ach.unlocked ? '🏆' : '🔒', { fontSize: '26px' }).setOrigin(0.5);
      row.add(star);

      const name = this.add.text(-105, -28, ach.title, {
        fontFamily: 'Fredoka, sans-serif',
        fontSize: '17px',
        fontWeight: '700',
        color: COLORS.ink
      });
      row.add(name);

      const desc = this.add.text(-105, -6, ach.desc, {
        fontFamily: 'Fredoka, sans-serif',
        fontSize: '12px',
        fontWeight: '500',
        color: COLORS.inkSoft,
        wordWrap: { width: 165 }
      });
      row.add(desc);

      // Progress bar
      const pBarBg = this.add.graphics();
      pBarBg.fillStyle(0xE3D0F5, 1);
      pBarBg.fillRoundedRect(-105, 18, 120, 8, 4);
      row.add(pBarBg);

      const ratio = Math.min(1, ach.progress / ach.target);
      if (ratio > 0) {
        const pBarFill = this.add.graphics();
        pBarFill.fillStyle(0x38C964, 1);
        pBarFill.fillRoundedRect(-105, 18, 120 * ratio, 8, 4);
        row.add(pBarFill);
      }

      // Claim button
      const canClaim = ach.unlocked && !ach.claimed;
      const claimBtn = this.add.container(105, 0);
      const cBg = this.add.graphics();
      cBg.fillStyle(canClaim ? 0x38C964 : (ach.claimed ? 0xE3D0F5 : 0xFFD93D), 1);
      cBg.fillRoundedRect(-42, -18, 84, 36, 18);
      claimBtn.add(cBg);

      const cText = this.add.text(0, 0, ach.claimed ? 'Claimed' : (canClaim ? 'Claim!' : `🪙 ${ach.reward}`), {
        fontFamily: 'Fredoka, sans-serif',
        fontSize: '13px',
        fontWeight: '700',
        color: ach.claimed ? COLORS.inkSoft : (canClaim ? '#FFFFFF' : COLORS.ink)
      }).setOrigin(0.5);
      claimBtn.add(cText);

      if (canClaim) {
        claimBtn.setSize(84, 36);
        claimBtn.setInteractive(new Phaser.Geom.Rectangle(-42, -18, 84, 36), Phaser.Geom.Rectangle.Contains);
        claimBtn.input.cursor = 'pointer';
        claimBtn.on('pointerdown', () => {
          const claimed = achievementManager.claimReward(ach.id);
          if (claimed) {
            audioManager.playCoinCollect();
            this.coinText.setText(`🪙 ${saveManager.getCoins()} Coins`);
            this.renderTabContent();
          }
        });
      }
      row.add(claimBtn);

      this.contentContainer.add(row);
    });
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
