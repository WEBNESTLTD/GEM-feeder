import { saveManager } from '../storage/SaveManager.js';

const randInt = (min, max) => Math.floor(min + Math.random() * (max - min + 1));
const randFloat = (min, max) => min + Math.random() * (max - min);

export class ParticleEngine {
  constructor(scene, options = {}) {
    this.scene = scene;
    this.container = scene.add.container(0, 0);
    this.container.setDepth(25); // Sit above candies and character

    this.poolSize = (options && options.poolSize) || 80;
    this.pool = [];
    this.activeParticles = [];

    this.initPool();
  }

  get active() {
    return this.activeParticles;
  }

  initPool() {
    for (let i = 0; i < this.poolSize; i++) {
      const g = this.scene.add.graphics();
      g.setVisible(false);
      this.container.add(g);
      const p = {
        graphic: g,
        active: false,
        x: 0,
        y: 0,
        vx: 0,
        vy: 0,
        gravity: 0,
        life: 0,
        maxLife: 1,
        color: 0xFFFFFF,
        shape: 'circle',
        size: 4,
        scale: 1,
        alpha: 1,
        fadeSpeed: 1,
        rotation: 0,
        vRot: 0
      };
      p.render = () => this.renderParticle(p);
      this.pool.push(p);
    }
  }

  getParticle() {
    if (this.pool.length > 0) {
      const p = this.pool.pop();
      p.active = true;
      p.graphic.setVisible(true);
      this.activeParticles.push(p);
      return p;
    }
    // If pool empty, steal the oldest active particle
    if (this.activeParticles.length > 0) {
      const p = this.activeParticles.shift();
      this.activeParticles.push(p);
      return p;
    }
    return null;
  }

  recycle(p) {
    p.active = false;
    p.graphic.setVisible(false);
    p.graphic.clear();
    const idx = this.activeParticles.indexOf(p);
    if (idx !== -1) {
      this.activeParticles.splice(idx, 1);
    }
    this.pool.push(p);
  }

  clear() {
    while (this.activeParticles.length > 0) {
      this.recycle(this.activeParticles[this.activeParticles.length - 1]);
    }
  }

  emitBurst(x, y, count = 10, options = {}) {
    const color = options.color !== undefined ? options.color : 0xFF5CAA;
    const minSpeed = options.minSpeed || 40;
    const maxSpeed = options.maxSpeed || 120;
    const shape = options.shape || 'circle';

    for (let i = 0; i < count; i++) {
      const p = this.getParticle();
      if (!p) break;
      const angle = (i / count) * Math.PI * 2;
      const speed = minSpeed + Math.random() * (maxSpeed - minSpeed);
      p.x = x;
      p.y = y;
      p.vx = Math.cos(angle) * speed;
      p.vy = Math.sin(angle) * speed;
      p.gravity = options.gravity || 120;
      p.life = 0;
      p.maxLife = options.maxLife || 450;
      p.color = color;
      p.shape = shape;
      p.size = options.size || 4;
      p.alpha = 1;
      p.render();
    }
  }

  emitPickup(x, y) {
    if (saveManager.getReducedMotion()) return;
    for (let i = 0; i < 4; i++) {
      const p = this.getParticle();
      if (!p) break;
      const angle = (i / 4) * Math.PI * 2;
      p.x = x;
      p.y = y;
      p.vx = Math.cos(angle) * 35;
      p.vy = Math.sin(angle) * 35;
      p.gravity = 0;
      p.life = 0;
      p.maxLife = 220;
      p.color = 0xFFFFFF;
      p.shape = 'circle';
      p.size = 3;
      p.alpha = 0.8;
      p.render();
    }
  }

  emitLaunch(x, y, vx, vy) {
    if (saveManager.getReducedMotion()) return;
    const speed = Math.hypot(vx, vy);
    const count = Math.min(6, Math.floor(speed / 150));
    for (let i = 0; i < count; i++) {
      const p = this.getParticle();
      if (!p) break;
      p.x = x + randInt(-8, 8);
      p.y = y + randInt(-5, 5);
      p.vx = (Math.random() - 0.5) * 60 - (vx * 0.05);
      p.vy = (Math.random() - 0.5) * 40 - (vy * 0.05);
      p.gravity = 40;
      p.life = 0;
      p.maxLife = 280;
      p.color = 0xFFD0E6;
      p.shape = 'circle';
      p.size = randFloat(2.5, 4.5);
      p.alpha = 0.7;
      p.render();
    }
  }

  emitCatch(x, y, color = 0xFF5CAA) {
    const count = saveManager.getReducedMotion() ? 6 : 14;
    for (let i = 0; i < count; i++) {
      const p = this.getParticle();
      if (!p) break;
      const angle = Math.random() * Math.PI * 2;
      const speed = randFloat(70, 180);
      p.x = x;
      p.y = y;
      p.vx = Math.cos(angle) * speed;
      p.vy = Math.sin(angle) * speed - 40;
      p.gravity = 250;
      p.life = 0;
      p.maxLife = randInt(350, 500);
      p.color = Math.random() > 0.3 ? (typeof color === 'string' ? parseInt(color.replace('#', '0x'), 16) : color) : 0xFFFFFF;
      p.shape = Math.random() > 0.5 ? 'sparkle' : 'circle';
      p.size = randFloat(3, 5.5);
      p.alpha = 1;
      p.render();
    }
  }

  emitPerfectCatch(x, y) {
    const count = saveManager.getReducedMotion() ? 10 : 26;
    for (let i = 0; i < count; i++) {
      const p = this.getParticle();
      if (!p) break;
      const angle = (i / count) * Math.PI * 2 + (Math.random() * 0.2);
      const speed = randFloat(120, 260);
      p.x = x;
      p.y = y;
      p.vx = Math.cos(angle) * speed;
      p.vy = Math.sin(angle) * speed - 60;
      p.gravity = 300;
      p.life = 0;
      p.maxLife = randInt(450, 700);
      p.color = i % 2 === 0 ? 0xFFD93D : 0xFFFFFF; // Gold and brilliant white
      p.shape = 'star';
      p.size = randFloat(4, 7);
      p.rotation = Math.random() * Math.PI;
      p.vRot = randFloat(-5, 5);
      p.alpha = 1;
      p.render();
    }
  }

  emitGoldenCatch(x, y) {
    this.emitPerfectCatch(x, y);
  }

  emitMiss(x, y) {
    const count = 5;
    for (let i = 0; i < count; i++) {
      const p = this.getParticle();
      if (!p) break;
      p.x = x + randInt(-12, 12);
      p.y = y + randInt(-8, 8);
      p.vx = (Math.random() - 0.5) * 50;
      p.vy = randFloat(30, 90);
      p.gravity = 80;
      p.life = 0;
      p.maxLife = 350;
      p.color = 0xCDB8EE;
      p.shape = 'circle';
      p.size = randFloat(2.5, 4.5);
      p.alpha = 0.6;
      p.render();
    }
  }

  emitCoinCollect(startX, startY, targetX = 195, targetY = 35) {
    const count = 4;
    for (let i = 0; i < count; i++) {
      const p = this.getParticle();
      if (!p) break;
      p.x = startX + randInt(-15, 15);
      p.y = startY + randInt(-15, 15);
      const dx = targetX - p.x;
      const dy = targetY - p.y;
      p.vx = dx * 1.8 + randInt(-40, 40);
      p.vy = dy * 1.8 + randInt(-40, 40);
      p.gravity = 0;
      p.life = 0;
      p.maxLife = 400;
      p.color = 0xFFD93D;
      p.shape = 'circle';
      p.size = 5;
      p.alpha = 1;
      p.render();
    }
  }

  emitCoin(x, y) {
    this.emitCoinCollect(x, y);
  }

  emitLevelVictory(x = 195, y = 300) {
    const colors = [0xFF5CAA, 0x38C964, 0x3D8BFF, 0xFFD93D, 0x9B5DE5];
    const count = saveManager.getReducedMotion() ? 12 : 36;
    for (let i = 0; i < count; i++) {
      const p = this.getParticle();
      if (!p) break;
      const angle = (Math.random() * Math.PI) - (Math.PI * 0.9); // Upward fountain
      const speed = randFloat(180, 400);
      p.x = x + randInt(-60, 60);
      p.y = y;
      p.vx = Math.cos(angle) * speed;
      p.vy = Math.sin(angle) * speed;
      p.gravity = 420;
      p.life = 0;
      p.maxLife = randInt(700, 1100);
      p.color = colors[i % colors.length];
      p.shape = Math.random() > 0.4 ? 'confetti' : 'star';
      p.size = randFloat(4, 7);
      p.rotation = Math.random() * Math.PI;
      p.vRot = randFloat(-6, 6);
      p.alpha = 1;
      p.render();
    }
  }

  emitConfetti(x = 195, y = 300) {
    this.emitLevelVictory(x, y);
  }

  update(timeOrDelta, delta) {
    if (this.activeParticles.length === 0) return;

    // Handle both update(delta) and update(time, delta)
    const effectiveDelta = delta !== undefined ? delta : timeOrDelta;
    const dt = effectiveDelta / 1000;

    for (let i = this.activeParticles.length - 1; i >= 0; i--) {
      const p = this.activeParticles[i];
      p.life += effectiveDelta;

      if (p.life >= p.maxLife) {
        this.recycle(p);
        continue;
      }

      // Physics integration
      p.vy += p.gravity * dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.rotation += p.vRot * dt;

      const progress = p.life / p.maxLife;
      const currentAlpha = p.alpha * (1 - progress);

      p.graphic.setPosition(p.x, p.y);
      p.graphic.setAlpha(currentAlpha);
      p.graphic.setRotation(p.rotation);
    }
  }
}

// Particle rendering helper attached to prototype for reusability
Object.assign(ParticleEngine.prototype, {
  renderParticle(p) {
    const g = p.graphic;
    g.clear();
    g.fillStyle(p.color, 1);

    if (p.shape === 'star') {
      const r = p.size;
      g.beginPath();
      for (let s = 0; s < 5; s++) {
        const outerAngle = (s * Math.PI * 2) / 5 - Math.PI / 2;
        const innerAngle = outerAngle + Math.PI / 5;
        const ox = Math.cos(outerAngle) * r;
        const oy = Math.sin(outerAngle) * r;
        const ix = Math.cos(innerAngle) * (r * 0.45);
        const iy = Math.sin(innerAngle) * (r * 0.45);
        if (s === 0) g.moveTo(ox, oy);
        else g.lineTo(ox, oy);
        g.lineTo(ix, iy);
      }
      g.closePath();
      g.fillPath();
    } else if (p.shape === 'confetti') {
      g.fillRect(-p.size, -p.size * 0.5, p.size * 2, p.size);
    } else if (p.shape === 'sparkle') {
      g.fillCircle(0, 0, p.size * 0.5);
      g.fillRect(-p.size, -1, p.size * 2, 2);
      g.fillRect(-1, -p.size, 2, p.size * 2);
    } else {
      g.fillCircle(0, 0, p.size);
    }
  }
});
ParticleEngine.prototype.initPool = function() {
  for (let i = 0; i < this.poolSize; i++) {
    const g = this.scene.add.graphics();
    g.setVisible(false);
    this.container.add(g);
    const self = this;
    const p = {
      graphic: g,
      active: false,
      x: 0,
      y: 0,
      vx: 0,
      vy: 0,
      gravity: 0,
      life: 0,
      maxLife: 1,
      color: 0xFFFFFF,
      shape: 'circle',
      size: 4,
      scale: 1,
      alpha: 1,
      rotation: 0,
      vRot: 0,
      render() {
        self.renderParticle(this);
      }
    };
    this.pool.push(p);
  }
};
