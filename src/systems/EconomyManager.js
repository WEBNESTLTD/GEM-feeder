import { saveManager } from '../storage/SaveManager.js';
import { POWER_UPS } from './PowerUpManager.js';

export const COSMETICS = {
  outfits: [
    { id: 'outfit_default', name: 'Classic Plum', cost: 0, previewColor: '#6B2FB3' },
    { id: 'outfit_strawberry', name: 'Strawberry Swirl', cost: 150, previewColor: '#FF5CAA' },
    { id: 'outfit_mint', name: 'Cool Mint', cost: 200, previewColor: '#38C964' },
    { id: 'outfit_golden', name: 'Royal Gold', cost: 400, previewColor: '#FFD93D' }
  ],
  accessories: [
    { id: 'acc_none', name: 'None', cost: 0, icon: '—' },
    { id: 'acc_bow', name: 'Ribbon Bow', cost: 120, icon: '🎀' },
    { id: 'acc_glasses', name: 'Star Shades', cost: 180, icon: '🕶️' },
    { id: 'acc_crown', name: 'Candy Crown', cost: 350, icon: '👑' }
  ]
};

export class EconomyManager {
  constructor(options = {}) {
    this.saveManager = options.saveManager || saveManager;
  }

  getBalance() {
    return this.saveManager.getCoins();
  }

  addReward(amount) {
    return this.saveManager.addCoins(amount);
  }

  buyPowerUp(type) {
    const item = POWER_UPS[type];
    if (!item) return { success: false, reason: 'Invalid power-up' };

    const balance = this.saveManager.getCoins();
    if (balance < item.cost) {
      return { success: false, reason: 'Insufficient coins' };
    }

    const spent = this.saveManager.spendCoins(item.cost);
    if (!spent) return { success: false, reason: 'Transaction failed' };

    this.saveManager.addPowerUp(type, 1);
    return { success: true, newBalance: this.saveManager.getCoins() };
  }

  buyCosmetic(category, itemId) {
    const list = COSMETICS[category];
    if (!list) return { success: false, reason: 'Invalid category' };

    const item = list.find(c => c.id === itemId);
    if (!item) return { success: false, reason: 'Item not found' };

    if (this.saveManager.isCosmeticOwned(itemId)) {
      return { success: true, alreadyOwned: true };
    }

    const balance = this.saveManager.getCoins();
    if (balance < item.cost) {
      return { success: false, reason: 'Insufficient coins' };
    }

    const spent = this.saveManager.spendCoins(item.cost);
    if (!spent) return { success: false, reason: 'Transaction failed' };

    this.saveManager.unlockCosmetic(itemId);
    return { success: true, newBalance: this.saveManager.getCoins() };
  }

  purchasePowerUp(type) {
    return this.buyPowerUp(type);
  }

  purchaseCosmetic(category, itemId) {
    return this.buyCosmetic(category, itemId);
  }
}

export const economyManager = new EconomyManager();
