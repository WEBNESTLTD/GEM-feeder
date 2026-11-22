import { COLORS } from '../config/gameConfig.js';
import { saveManager } from '../storage/SaveManager.js';
import { audioManager } from '../systems/AudioManager.js';
import { economyManager, COSMETICS } from '../systems/EconomyManager.js';
import { POWER_UPS } from '../systems/PowerUpManager.js';

export class ShopScene extends Phaser.Scene {
  constructor() {
    super('ShopScene');
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

    this.add.text(195, 50, 'SWEET SHOP', {
      fontFamily: 'Fredoka, sans-serif',
      fontSize: '28px',
      fontWeight: '700',
      color: COLORS.ink
    }).setOrigin(0.5);

    // Coin Balance Pill
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

    // Tab Switcher: "Power-Ups" vs "Wardrobe"
    this.currentTab = 'powerups';
    this.tabContainer = this.add.container(195, 150);
    this.createTabButtons();

    // Content container
    this.contentContainer = this.add.container(0, 0);
    this.renderTabContent();

    // Back to Main Menu Button
    this.createBackButton();
  }

  createTabButtons() {
    // Powerups Tab Btn
    this.tabPowerupsBtn = this.add.container(-70, 0);
    this.tabPowerupsBg = this.add.graphics();
    this.tabPowerupsText = this.add.text(0, 0, 'Power-Ups', {
      fontFamily: 'Fredoka, sans-serif',
      fontSize: '15px',
      fontWeight: '700'
    }).setOrigin(0.5);
    this.tabPowerupsBtn.add(this.tabPowerupsBg);
    this.tabPowerupsBtn.add(this.tabPowerupsText);
    this.tabPowerupsBtn.setSize(120, 34);
    this.tabPowerupsBtn.setInteractive(new Phaser.Geom.Rectangle(-60, -17, 120, 34), Phaser.Geom.Rectangle.Contains);
    this.tabPowerupsBtn.input.cursor = 'pointer';
    this.tabPowerupsBtn.on('pointerdown', () => {
      audioManager.playButtonClick();
      this.currentTab = 'powerups';
      this.updateTabStyles();
      this.renderTabContent();
    });
    this.tabContainer.add(this.tabPowerupsBtn);

    // Wardrobe Tab Btn
    this.tabWardrobeBtn = this.add.container(70, 0);
    this.tabWardrobeBg = this.add.graphics();
    this.tabWardrobeText = this.add.text(0, 0, 'Wardrobe', {
      fontFamily: 'Fredoka, sans-serif',
      fontSize: '15px',
      fontWeight: '700'
    }).setOrigin(0.5);
    this.tabWardrobeBtn.add(this.tabWardrobeBg);
    this.tabWardrobeBtn.add(this.tabWardrobeText);
    this.tabWardrobeBtn.setSize(120, 34);
    this.tabWardrobeBtn.setInteractive(new Phaser.Geom.Rectangle(-60, -17, 120, 34), Phaser.Geom.Rectangle.Contains);
    this.tabWardrobeBtn.input.cursor = 'pointer';
    this.tabWardrobeBtn.on('pointerdown', () => {
      audioManager.playButtonClick();
      this.currentTab = 'wardrobe';
      this.updateTabStyles();
      this.renderTabContent();
    });
    this.tabContainer.add(this.tabWardrobeBtn);

    this.updateTabStyles();
  }

  updateTabStyles() {
    const isPowerups = this.currentTab === 'powerups';

    this.tabPowerupsBg.clear();
    this.tabPowerupsBg.fillStyle(isPowerups ? 0xD81B7A : 0xFFFFFF, 1);
    this.tabPowerupsBg.fillRoundedRect(-60, -17, 120, 34, 17);
    this.tabPowerupsText.setColor(isPowerups ? '#FFFFFF' : COLORS.ink);

    this.tabWardrobeBg.clear();
    this.tabWardrobeBg.fillStyle(!isPowerups ? 0xD81B7A : 0xFFFFFF, 1);
    this.tabWardrobeBg.fillRoundedRect(-60, -17, 120, 34, 17);
    this.tabWardrobeText.setColor(!isPowerups ? '#FFFFFF' : COLORS.ink);
  }

  renderTabContent() {
    this.contentContainer.removeAll(true);

    if (this.currentTab === 'powerups') {
      this.renderPowerUps();
    } else {
      this.renderWardrobe();
    }
  }

  renderPowerUps() {
    const items = Object.values(POWER_UPS);
    items.forEach((item, idx) => {
      const y = 220 + (idx * 105);
      const row = this.add.container(195, y);

      const shadow = this.add.graphics();
      shadow.fillStyle(0xE3D0F5, 1);
      shadow.fillRoundedRect(-160, -42, 320, 88, 20);
      row.add(shadow);

      const bg = this.add.graphics();
      bg.fillStyle(0xFFFFFF, 1);
      bg.fillRoundedRect(-160, -46, 320, 88, 20);
      row.add(bg);

      // Icon & Name
      const icon = this.add.text(-130, -10, item.icon, { fontSize: '30px' }).setOrigin(0.5);
      row.add(icon);

      const name = this.add.text(-95, -28, item.name, {
        fontFamily: 'Fredoka, sans-serif',
        fontSize: '18px',
        fontWeight: '700',
        color: COLORS.ink
      });
      row.add(name);

      const desc = this.add.text(-95, -4, item.desc, {
        fontFamily: 'Fredoka, sans-serif',
        fontSize: '12px',
        fontWeight: '500',
        color: COLORS.inkSoft,
        wordWrap: { width: 155 }
      });
      row.add(desc);

      // Count badge
      const count = saveManager.getPowerUpCount(item.id);
      const countLabel = this.add.text(-95, 20, `Owned: ${count}`, {
        fontFamily: 'Fredoka, sans-serif',
        fontSize: '12px',
        fontWeight: '700',
        color: COLORS.pinkDark
      });
      row.add(countLabel);

      // Buy button
      const buyBtn = this.add.container(105, 0);
      const bBg = this.add.graphics();
      bBg.fillStyle(0xFFD93D, 1);
      bBg.fillRoundedRect(-42, -18, 84, 36, 18);
      buyBtn.add(bBg);

      const bText = this.add.text(0, 0, `🪙 ${item.cost}`, {
        fontFamily: 'Fredoka, sans-serif',
        fontSize: '14px',
        fontWeight: '700',
        color: COLORS.ink
      }).setOrigin(0.5);
      buyBtn.add(bText);

      buyBtn.setSize(84, 36);
      buyBtn.setInteractive(new Phaser.Geom.Rectangle(-42, -18, 84, 36), Phaser.Geom.Rectangle.Contains);
      buyBtn.input.cursor = 'pointer';
      buyBtn.on('pointerdown', () => {
        const res = economyManager.buyPowerUp(item.id);
        if (res.success) {
          audioManager.playCoinCollect();
          this.coinText.setText(`🪙 ${saveManager.getCoins()} Coins`);
          countLabel.setText(`Owned: ${saveManager.getPowerUpCount(item.id)}`);
        } else {
          audioManager.playMiss();
        }
      });
      row.add(buyBtn);

      this.contentContainer.add(row);
    });
  }

  renderWardrobe() {
    const accessories = COSMETICS.accessories;
    accessories.forEach((item, idx) => {
      const y = 225 + (idx * 115);
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
      const icon = this.add.text(-125, -10, item.icon, { fontSize: '32px' }).setOrigin(0.5);
      row.add(icon);

      const name = this.add.text(-85, -25, item.name, {
        fontFamily: 'Fredoka, sans-serif',
        fontSize: '18px',
        fontWeight: '700',
        color: COLORS.ink
      });
      row.add(name);

      const isOwned = saveManager.isCosmeticOwned(item.id) || item.cost === 0;
      const equipped = saveManager.getEquipped().accessory === item.id;

      const statusText = this.add.text(-85, 2, equipped ? '★ EQUIPPED' : (isOwned ? 'Unlocked' : `Cost: 🪙 ${item.cost}`), {
        fontFamily: 'Fredoka, sans-serif',
        fontSize: '13px',
        fontWeight: '700',
        color: equipped ? COLORS.pinkDark : COLORS.inkSoft
      });
      row.add(statusText);

      // Action Button (Equip / Unequip / Buy)
      const actionBtn = this.add.container(105, 0);
      const aBg = this.add.graphics();
      aBg.fillStyle(equipped ? 0xE3D0F5 : (isOwned ? 0x38C964 : 0xFFD93D), 1);
      aBg.fillRoundedRect(-44, -18, 88, 36, 18);
      actionBtn.add(aBg);

      const aLabel = this.add.text(0, 0, equipped ? 'Equipped' : (isOwned ? 'Equip' : 'Buy'), {
        fontFamily: 'Fredoka, sans-serif',
        fontSize: '14px',
        fontWeight: '700',
        color: equipped ? COLORS.inkSoft : COLORS.ink
      }).setOrigin(0.5);
      actionBtn.add(aLabel);

      actionBtn.setSize(88, 36);
      actionBtn.setInteractive(new Phaser.Geom.Rectangle(-44, -18, 88, 36), Phaser.Geom.Rectangle.Contains);
      actionBtn.input.cursor = 'pointer';
      actionBtn.on('pointerdown', () => {
        if (!isOwned) {
          const buyRes = economyManager.buyCosmetic('accessories', item.id);
          if (buyRes.success) {
            audioManager.playCoinCollect();
            this.coinText.setText(`🪙 ${saveManager.getCoins()} Coins`);
            this.renderTabContent();
          } else {
            audioManager.playMiss();
          }
        } else {
          // Equip or unequip
          audioManager.playButtonClick();
          saveManager.setEquipped('accessory', equipped ? 'acc_none' : item.id);
          this.renderTabContent();
        }
      });
      row.add(actionBtn);

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
