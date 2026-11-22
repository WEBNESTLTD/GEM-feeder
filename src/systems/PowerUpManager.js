import { saveManager } from '../storage/SaveManager.js';

export const POWER_UPS = {
  magnet: {
    id: 'magnet',
    name: 'Candy Magnet',
    desc: 'Pulls flying candy gently toward the open mouth.',
    cost: 40,
    durationMs: 9000,
    color: '#38C964',
    icon: '🧲'
  },
  slowmo: {
    id: 'slowmo',
    name: 'Slow Motion',
    desc: 'Slows flight time by 50% for pinpoint accuracy.',
    cost: 35,
    durationMs: 8000,
    color: '#3D8BFF',
    icon: '⏱️'
  },
  multiplier: {
    id: 'multiplier',
    name: 'Score 2x Boost',
    desc: 'Doubles all points earned during its active window.',
    cost: 45,
    durationMs: 10000,
    color: '#FFD93D',
    icon: '⚡'
  },
  shield: {
    id: 'shield',
    name: 'Protective Shield',
    desc: 'Protects against one missed catch without losing a life.',
    cost: 50,
    durationMs: 30000,
    color: '#9B5DE5',
    icon: '🛡️'
  },
  precision: {
    id: 'precision',
    name: 'Precision Assist',
    desc: 'Extends aiming trajectory curve with target lock guide.',
    cost: 35,
    durationMs: 12000,
    color: '#FF5CAA',
    icon: '🎯'
  }
};

export class PowerUpManager {
  constructor(scene, options = {}) {
    this.scene = scene;
    this.saveManager = options.saveManager || saveManager;
    this.activeEffects = {
      magnet: false,
      slowmo: false,
      multiplier: false,
      shield: false,
      precision: false
    };
    this.shieldCharges = 0;
    this.timers = {};
  }

  isPowerUpActive(type) {
    if (type === 'shield') return this.shieldCharges > 0;
    return Boolean(this.activeEffects[type]);
  }

  activatePowerUp(type) {
    const config = POWER_UPS[type];
    if (!config) return false;

    // Deduct from save inventory
    const used = this.saveManager.usePowerUp(type);
    if (!used) return false;

    if (type === 'shield') {
      this.shieldCharges = 1;
      this.activeEffects.shield = true;
      if (this.scene && this.scene.hud) {
        this.scene.hud.highlightActivePowerUp('shield', true);
      }
    } else {
      // Clear any existing timer for this power-up
      if (this.timers[type]) {
        this.timers[type].remove(false);
        delete this.timers[type];
      }

      this.activeEffects[type] = true;
      if (this.scene && this.scene.hud) {
        this.scene.hud.highlightActivePowerUp(type, true);
      }

      if (this.scene && this.scene.time) {
        this.timers[type] = this.scene.time.delayedCall(config.durationMs, () => {
          this.activeEffects[type] = false;
          delete this.timers[type];
          if (this.scene && this.scene.hud) {
            this.scene.hud.highlightActivePowerUp(type, false);
          }
        });
      }
    }

    return true;
  }

  consumeShield() {
    if (this.shieldCharges > 0) {
      this.shieldCharges--;
      if (this.shieldCharges <= 0) {
        this.activeEffects.shield = false;
        if (this.scene && this.scene.hud) {
          this.scene.hud.highlightActivePowerUp('shield', false);
        }
      }
      return true;
    }
    return false;
  }

  reset() {
    for (const type in this.timers) {
      if (this.timers[type]) {
        this.timers[type].remove(false);
      }
    }
    this.timers = {};
    for (const key in this.activeEffects) {
      this.activeEffects[key] = false;
    }
    this.shieldCharges = 0;
  }

  getTimeScale() {
    return this.activeEffects.slowmo ? 0.55 : 1.0;
  }

  getScoreMultiplier() {
    return this.activeEffects.multiplier ? 2 : 1;
  }

  isPrecisionEnabled() {
    return Boolean(this.activeEffects.precision);
  }

  applyMagnetPull(candyX, candyY, targetX, targetY) {
    if (!this.activeEffects.magnet) return { vx: 0, vy: 0 };
    const dx = targetX - candyX;
    const dy = targetY - candyY;
    const dist = Math.hypot(dx, dy);
    if (dist < 180 && dist > 15) {
      const strength = 180 / dist;
      return {
        vx: (dx / dist) * strength * 25,
        vy: (dy / dist) * strength * 20
      };
    }
    return { vx: 0, vy: 0 };
  }
}
