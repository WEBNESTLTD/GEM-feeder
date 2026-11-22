import { COLORS } from '../config/gameConfig.js';
import { saveManager } from '../storage/SaveManager.js';

const randInt = (min, max) => Math.floor(min + Math.random() * (max - min + 1));
const randFloat = (min, max) => min + Math.random() * (max - min);

export class EnvironmentManager {
  constructor(scene, options = {}) {
    this.scene = scene;
    this.worldId = options.worldId || 'world_1';
    this._reducedMotion = options.reducedMotion !== undefined ? options.reducedMotion : null;
    this.container = scene.add.container(0, 0);
    this.container.setDepth(-10); // Sit behind characters, shelf, and gameplay objects

    this.ambientParticles = [];
    this.clouds = [];
    this.hills = [];
    this.props = [];
    this.swayTime = 0;

    this.initWorldTheme(this.worldId);
  }

  get theme() {
    const names = {
      world_1: 'Candy Garden',
      world_2: 'Sugar Mountain',
      world_3: 'Chocolate Kingdom'
    };
    return {
      id: this.worldId,
      name: names[this.worldId] || 'Sweet Realm'
    };
  }

  get reducedMotion() {
    return this._reducedMotion !== null ? this._reducedMotion : saveManager.getReducedMotion();
  }

  setReducedMotion(enabled) {
    this._reducedMotion = enabled;
  }

  initWorldTheme(worldId) {
    this.worldId = worldId || 'world_1';
    this.container.removeAll(true);
    this.ambientParticles = [];
    this.clouds = [];
    this.hills = [];
    this.props = [];

    // 1. Sky Gradient & Atmospheric Base
    this.createSky();

    // 2. Distant Horizon & Mountains/Hills
    this.createHorizon();

    // 3. Midground Elements & Props
    this.createMidground();

    // 4. Foreground Ambient Particles
    this.createAmbientAtmosphere();
  }

  createSky() {
    const sky = this.scene.add.graphics();
    const w = 390;
    const h = 844;

    if (this.worldId === 'world_2') {
      // Sugar Mountain: Cool crisp alpine winter sky
      sky.fillGradientStyle(0xDFEBF7, 0xDFEBF7, 0xB6D4ED, 0xB6D4ED, 1);
      sky.fillRect(0, 0, w, h);

      // Pale winter sun glow
      const sun = this.scene.add.graphics();
      sun.fillStyle(0xFFFFFF, 0.4);
      sun.fillCircle(300, 160, 70);
      sun.fillStyle(0xFFFFFF, 0.8);
      sun.fillCircle(300, 160, 40);
      this.container.add(sun);
    } else if (this.worldId === 'world_3') {
      // Chocolate Kingdom: Regal twilight caramel / deep royal purple
      sky.fillGradientStyle(0x3B1854, 0x3B1854, 0x240E36, 0x240E36, 1);
      sky.fillRect(0, 0, w, h);

      // Golden moon / kingdom glow
      const moon = this.scene.add.graphics();
      moon.fillStyle(0xFFD93D, 0.25);
      moon.fillCircle(90, 150, 75);
      moon.fillStyle(0xFFEAA7, 0.85);
      moon.fillCircle(90, 150, 42);
      this.container.add(moon);
    } else {
      // Candy Garden (Default): Warm pastel violet/pink morning sky
      sky.fillGradientStyle(0xFCEFF9, 0xFCEFF9, 0xEBD6FA, 0xEBD6FA, 1);
      sky.fillRect(0, 0, w, h);

      // Warm morning sun glow
      const sun = this.scene.add.graphics();
      sun.fillStyle(0xFFE2F0, 0.5);
      sun.fillCircle(195, 130, 85);
      sun.fillStyle(0xFFFFFF, 0.85);
      sun.fillCircle(195, 130, 45);
      this.container.add(sun);
    }

    this.container.add(sky);
  }

  createHorizon() {
    this.horizonLayer = this.scene.add.container(0, 0);

    if (this.worldId === 'world_2') {
      // Sugar Mountain: Snowy peaks
      const peaks = this.scene.add.graphics();
      peaks.fillStyle(0x9EBFDC, 0.9);
      // Background mountains
      peaks.beginPath();
      peaks.moveTo(-20, 400);
      peaks.lineTo(70, 240);
      peaks.lineTo(160, 380);
      peaks.lineTo(250, 210);
      peaks.lineTo(340, 370);
      peaks.lineTo(410, 270);
      peaks.lineTo(410, 420);
      peaks.lineTo(-20, 420);
      peaks.closePath();
      peaks.fillPath();

      // Frosted white snowcaps
      peaks.fillStyle(0xFFFFFF, 0.95);
      peaks.fillTriangle(70, 240, 50, 280, 90, 280);
      peaks.fillTriangle(250, 210, 220, 260, 280, 260);
      peaks.fillTriangle(410, 270, 390, 310, 430, 310);

      this.horizonLayer.add(peaks);
    } else if (this.worldId === 'world_3') {
      // Chocolate Kingdom: Chocolate castle towers & candy spires
      const castle = this.scene.add.graphics();
      castle.fillStyle(0x4E2269, 0.85);

      // Towers
      castle.fillRoundedRect(30, 230, 60, 190, 12);
      castle.fillRoundedRect(300, 220, 65, 200, 12);
      castle.fillRoundedRect(160, 260, 70, 160, 10);

      // Golden spire caps
      castle.fillStyle(0xFFD93D, 0.9);
      castle.fillTriangle(60, 185, 25, 230, 95, 230);
      castle.fillTriangle(332, 175, 295, 220, 370, 220);
      castle.fillTriangle(195, 220, 155, 260, 235, 260);

      this.horizonLayer.add(castle);
    } else {
      // Candy Garden: Rolling pastel marshmallow hills
      const hills = this.scene.add.graphics();
      hills.fillStyle(0xDEC5F7, 0.7);
      hills.fillCircle(70, 360, 130);
      hills.fillCircle(320, 350, 140);
      hills.fillStyle(0xEDD9FC, 0.85);
      hills.fillCircle(195, 380, 160);

      this.horizonLayer.add(hills);
    }

    this.container.add(this.horizonLayer);
  }

  createMidground() {
    this.midgroundLayer = this.scene.add.container(0, 0);

    // Drifting puffy clouds
    const cloudCount = 3;
    for (let i = 0; i < cloudCount; i++) {
      const cx = 50 + (i * 130);
      const cy = 90 + (i * 45);
      const cloud = this.scene.add.graphics();
      cloud.fillStyle(0xFFFFFF, this.worldId === 'world_3' ? 0.25 : 0.65);
      cloud.fillCircle(0, 0, 22);
      cloud.fillCircle(-16, 4, 16);
      cloud.fillCircle(16, 4, 16);
      cloud.fillRoundedRect(-22, 6, 44, 14, 7);

      const cloudObj = {
        graphic: cloud,
        x: cx,
        y: cy,
        speed: 0.15 + (i * 0.08),
        baseY: cy
      };
      cloud.setPosition(cx, cy);
      this.midgroundLayer.add(cloud);
      this.clouds.push(cloudObj);
    }

    // World Props (flowers, candies, ice crystals)
    if (this.worldId === 'world_1') {
      // Candy flowers / lollipops along shelf
      const prop1 = this.createCandyFlower(45, 375, 0xFF5CAA);
      const prop2 = this.createCandyFlower(345, 375, 0x38C964);
      this.midgroundLayer.add(prop1);
      this.midgroundLayer.add(prop2);
      this.props.push({ obj: prop1, phase: 0 }, { obj: prop2, phase: Math.PI });
    } else if (this.worldId === 'world_2') {
      // Frosted icicles & candy trees
      const prop1 = this.createFrostedPine(45, 370);
      const prop2 = this.createFrostedPine(345, 370);
      this.midgroundLayer.add(prop1);
      this.midgroundLayer.add(prop2);
      this.props.push({ obj: prop1, phase: 0 }, { obj: prop2, phase: 1.5 });
    } else {
      // Chocolate Kingdom candy cane pillars
      const pillar1 = this.createCaramelPillar(35, 365);
      const pillar2 = this.createCaramelPillar(355, 365);
      this.midgroundLayer.add(pillar1);
      this.midgroundLayer.add(pillar2);
      this.props.push({ obj: pillar1, phase: 0 }, { obj: pillar2, phase: 2 });
    }

    this.container.add(this.midgroundLayer);
  }

  createCandyFlower(x, y, color) {
    const c = this.scene.add.container(x, y);
    const stem = this.scene.add.graphics();
    stem.lineStyle(3, 0x38C964, 0.9);
    stem.beginPath();
    stem.moveTo(0, 0);
    stem.lineTo(0, -22);
    stem.strokePath();

    const flower = this.scene.add.graphics();
    flower.fillStyle(color, 0.95);
    flower.fillCircle(0, -24, 10);
    flower.fillStyle(0xFFD93D, 1);
    flower.fillCircle(0, -24, 4);

    c.add(stem);
    c.add(flower);
    return c;
  }

  createFrostedPine(x, y) {
    const c = this.scene.add.container(x, y);
    const trunk = this.scene.add.graphics();
    trunk.fillStyle(0x73482A, 1);
    trunk.fillRect(-4, -12, 8, 14);

    const foliage = this.scene.add.graphics();
    foliage.fillStyle(0x4A7A96, 0.9);
    foliage.fillTriangle(0, -42, -18, -12, 18, -12);
    foliage.fillTriangle(0, -32, -14, -8, 14, -8);

    // Frosting tip
    foliage.fillStyle(0xFFFFFF, 0.95);
    foliage.fillTriangle(0, -42, -7, -28, 7, -28);

    c.add(trunk);
    c.add(foliage);
    return c;
  }

  createCaramelPillar(x, y) {
    const c = this.scene.add.container(x, y);
    const p = this.scene.add.graphics();
    p.fillStyle(0xFFD93D, 0.9);
    p.fillRoundedRect(-8, -48, 16, 50, 6);

    // Dark chocolate stripes
    p.fillStyle(0x421D12, 0.85);
    p.fillRect(-8, -40, 16, 7);
    p.fillRect(-8, -24, 16, 7);

    // Glowing orb top
    p.fillStyle(0xFF7A00, 1);
    p.fillCircle(0, -52, 9);
    p.fillStyle(0xFFFFFF, 0.7);
    p.fillCircle(-2, -54, 3);

    c.add(p);
    return c;
  }

  createAmbientAtmosphere() {
    const particleCount = this.worldId === 'world_2' ? 32 : (this.worldId === 'world_3' ? 24 : 18);
    const w = 390;
    const h = 844;

    for (let i = 0; i < particleCount; i++) {
      const px = randInt(10, w - 10);
      const py = randInt(40, h - 100);
      const g = this.scene.add.graphics();

      let radius = randFloat(2.0, 4.5);
      let color = 0xFFFFFF;
      let alpha = randFloat(0.3, 0.75);

      if (this.worldId === 'world_2') {
        // Sugar snow particle
        color = 0xFFFFFF;
        radius = randFloat(1.5, 3.8);
      } else if (this.worldId === 'world_3') {
        // Magical golden embers
        color = Math.random() > 0.4 ? 0xFFD93D : 0xFFA07A;
        radius = randFloat(2.2, 5.0);
      } else {
        // Warm sugar pollen / bubbles
        color = Math.random() > 0.5 ? 0xFFFFFF : 0xFFD0E6;
      }

      g.fillStyle(color, alpha);
      g.fillCircle(0, 0, radius);
      g.setPosition(px, py);
      this.container.add(g);

      this.ambientParticles.push({
        graphic: g,
        x: px,
        y: py,
        radius,
        vy: this.worldId === 'world_2' ? randFloat(0.3, 0.85) : randFloat(-0.25, -0.6),
        vx: this.worldId === 'world_2' ? randFloat(-0.3, 0.3) : randFloat(-0.15, 0.15),
        phase: Math.random() * Math.PI * 2
      });
    }
  }

  update(time, delta) {
    if (this.reducedMotion) return;

    this.swayTime += delta * 0.0015;

    // 1. Clouds gentle drift
    for (const c of this.clouds) {
      c.x += c.speed * (delta / 16.6);
      if (c.x > 430) {
        c.x = -40;
      }
      c.graphic.setPosition(c.x, c.baseY + Math.sin(this.swayTime + c.x) * 3);
    }

    // 2. Props gentle breathing
    for (const p of this.props) {
      const angle = Math.sin(this.swayTime * 2 + p.phase) * 3;
      if (p.obj.setAngle) {
        p.obj.setAngle(angle);
      }
    }

    // 3. Ambient drifting particles
    const h = 844;
    const w = 390;
    for (const p of this.ambientParticles) {
      p.y += p.vy * (delta / 16.6);
      p.x += Math.sin(this.swayTime * 1.5 + p.phase) * 0.4 + (p.vx * (delta / 16.6));

      if (this.worldId === 'world_2') {
        // Snow drifts downward
        if (p.y > h - 40) {
          p.y = 30;
          p.x = randInt(10, w - 10);
        }
      } else {
        // Pollen/embers float upward
        if (p.y < 30) {
          p.y = h - 60;
          p.x = randInt(10, w - 10);
        }
      }

      p.graphic.setPosition(p.x, p.y);
    }
  }

  setParallaxOffset(normX) {
    if (saveManager.getReducedMotion()) return;
    if (this.horizonLayer) {
      this.horizonLayer.setX(normX * -8);
    }
    if (this.midgroundLayer) {
      this.midgroundLayer.setX(normX * -18);
    }
  }
}
