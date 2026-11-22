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
    this.bokehLights = [];
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
    this.bokehLights = [];

    // 1. Candy-Shop Wall & Atmospheric Gradient Base
    this.createSky();

    // 2. Distant Candy Shelves & Themed Horizon
    this.createHorizon();

    // 3. Candy Jars, Fairy Lights & Midground Props
    this.createMidground();

    // 4. Foreground Ambient Sugar/Dust Particles
    this.createAmbientAtmosphere();

    // 5. Foreground Candy-Shop Counter
    this.createCounter();
  }

  createSky() {
    const sky = this.scene.add.graphics();
    const w = 390;
    const h = 844;

    if (this.worldId === 'world_2') {
      // Sugar Mountain: Cool crisp alpine winter confectioner
      sky.fillGradientStyle(0xDFEBF7, 0xDFEBF7, 0xB6D4ED, 0xB6D4ED, 1);
      sky.fillRect(0, 0, w, h);

      // Pale winter sun & warm lantern halo behind character
      const sun = this.scene.add.graphics();
      sun.fillStyle(0xFFFFFF, 0.45);
      sun.fillCircle(195, 230, 95);
      sun.fillStyle(0xFFF0D0, 0.7);
      sun.fillCircle(195, 230, 55);
      this.container.add(sun);
    } else if (this.worldId === 'world_3') {
      // Chocolate Kingdom: Regal twilight caramel / deep royal chocolatier
      sky.fillGradientStyle(0x3B1854, 0x3B1854, 0x240E36, 0x240E36, 1);
      sky.fillRect(0, 0, w, h);

      // Golden chandelier / royal candy glow behind character
      const moon = this.scene.add.graphics();
      moon.fillStyle(0xFFD93D, 0.35);
      moon.fillCircle(195, 230, 100);
      moon.fillStyle(0xFFEAA7, 0.75);
      moon.fillCircle(195, 230, 60);
      this.container.add(moon);
    } else {
      // Candy Garden (Default): Warm pastel strawberry cream & violet candy shop
      sky.fillGradientStyle(0xFDF0F7, 0xFDF0F7, 0xEEDCF8, 0xEEDCF8, 1);
      sky.fillRect(0, 0, w, h);

      // Delicate vertical candy-shop wallpaper stripes
      const stripes = this.scene.add.graphics();
      stripes.fillStyle(0xFFFFFF, 0.28);
      for (let x = 10; x < w; x += 30) {
        stripes.fillRect(x, 0, 14, 400);
      }
      this.container.add(stripes);

      // Warm radial ambient halo behind character (frames character beautifully)
      const halo = this.scene.add.graphics();
      halo.fillStyle(0xFFEBF3, 0.65);
      halo.fillCircle(195, 230, 110);
      halo.fillStyle(0xFFFFFF, 0.85);
      halo.fillCircle(195, 230, 65);
      this.container.add(halo);
    }

    this.container.add(sky);
  }

  createHorizon() {
    this.horizonLayer = this.scene.add.container(0, 0);

    // Decorative Left and Right Candy Shelves (retaining clear center throw corridor)
    const shelves = this.scene.add.graphics();
    const shelfY = [120, 185, 255, 325];

    shelfY.forEach(y => {
      // Left shelf bracket & board
      shelves.fillStyle(this.worldId === 'world_3' ? 0x5C2E16 : (this.worldId === 'world_2' ? 0x8AA8C4 : 0xEBD4C0), 0.9);
      shelves.fillRoundedRect(0, y, 68, 8, 4);
      // Shelf highlight
      shelves.fillStyle(0xFFFFFF, 0.4);
      shelves.fillRect(0, y, 68, 2);

      // Right shelf bracket & board
      shelves.fillStyle(this.worldId === 'world_3' ? 0x5C2E16 : (this.worldId === 'world_2' ? 0x8AA8C4 : 0xEBD4C0), 0.9);
      shelves.fillRoundedRect(322, y, 68, 8, 4);
      // Shelf highlight
      shelves.fillStyle(0xFFFFFF, 0.4);
      shelves.fillRect(322, y, 68, 2);
    });
    this.horizonLayer.add(shelves);

    if (this.worldId === 'world_2') {
      // Sugar Mountain snowy mountain backdrop
      const peaks = this.scene.add.graphics();
      peaks.fillStyle(0x9EBFDC, 0.6);
      peaks.beginPath();
      peaks.moveTo(-20, 390);
      peaks.lineTo(70, 270);
      peaks.lineTo(160, 380);
      peaks.lineTo(250, 250);
      peaks.lineTo(340, 370);
      peaks.lineTo(410, 290);
      peaks.lineTo(410, 400);
      peaks.lineTo(-20, 400);
      peaks.closePath();
      peaks.fillPath();
      this.horizonLayer.add(peaks);
    } else if (this.worldId === 'world_3') {
      // Chocolate Kingdom spires backdrop
      const castle = this.scene.add.graphics();
      castle.fillStyle(0x4E2269, 0.6);
      castle.fillRoundedRect(20, 260, 45, 140, 8);
      castle.fillRoundedRect(325, 250, 45, 150, 8);
      this.horizonLayer.add(castle);
    } else {
      // Candy Garden soft marshmallow hills in far distance
      const hills = this.scene.add.graphics();
      hills.fillStyle(0xDEC5F7, 0.45);
      hills.fillCircle(50, 380, 110);
      hills.fillCircle(340, 370, 120);
      this.horizonLayer.add(hills);
    }

    this.container.add(this.horizonLayer);
  }

  createMidground() {
    this.midgroundLayer = this.scene.add.container(0, 0);

    // Drifting puffy clouds (Required for test assertions)
    const cloudCount = 3;
    for (let i = 0; i < cloudCount; i++) {
      const cx = 50 + (i * 130);
      const cy = 85 + (i * 35);
      const cloud = this.scene.add.graphics();
      cloud.fillStyle(0xFFFFFF, this.worldId === 'world_3' ? 0.22 : 0.55);
      cloud.fillCircle(0, 0, 18);
      cloud.fillCircle(-13, 3, 13);
      cloud.fillCircle(13, 3, 13);
      cloud.fillRoundedRect(-18, 5, 36, 11, 5);

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

    // Candy Jars on Background Shelves (Left & Right)
    const jars = this.scene.add.graphics();
    const jarColors = [0xFF5CAA, 0x38C964, 0xFFD93D, 0x3D8BFF, 0x9B5DE5, 0xFF8A2B];

    // Left Shelf Jars
    [120, 185, 255].forEach((sy, idx) => {
      const jx = 24 + (idx % 2) * 16;
      const jy = sy - 28;
      // Glass body
      jars.fillStyle(0xFFFFFF, 0.35);
      jars.fillRoundedRect(jx - 14, jy, 28, 28, 6);
      jars.lineStyle(1.5, 0xFFFFFF, 0.8);
      if (jars.strokeRoundedRect) {
        jars.strokeRoundedRect(jx - 14, jy, 28, 28, 6);
      }
      // Colored candy balls inside
      jars.fillStyle(jarColors[idx % jarColors.length], 0.9);
      jars.fillCircle(jx - 5, jy + 18, 5);
      jars.fillStyle(jarColors[(idx + 2) % jarColors.length], 0.9);
      jars.fillCircle(jx + 5, jy + 18, 5);
      jars.fillStyle(jarColors[(idx + 4) % jarColors.length], 0.9);
      jars.fillCircle(jx, jy + 10, 5);
      // Jar lid (gold/brass)
      jars.fillStyle(0xFFD93D, 1);
      jars.fillRoundedRect(jx - 11, jy - 4, 22, 5, 2);
    });

    // Right Shelf Jars
    [120, 185, 255].forEach((sy, idx) => {
      const jx = 346 + (idx % 2) * 16;
      const jy = sy - 28;
      // Glass body
      jars.fillStyle(0xFFFFFF, 0.35);
      jars.fillRoundedRect(jx - 14, jy, 28, 28, 6);
      jars.lineStyle(1.5, 0xFFFFFF, 0.8);
      if (jars.strokeRoundedRect) {
        jars.strokeRoundedRect(jx - 14, jy, 28, 28, 6);
      }
      // Colored candy balls inside
      jars.fillStyle(jarColors[(idx + 1) % jarColors.length], 0.9);
      jars.fillCircle(jx - 5, jy + 18, 5);
      jars.fillStyle(jarColors[(idx + 3) % jarColors.length], 0.9);
      jars.fillCircle(jx + 5, jy + 18, 5);
      jars.fillStyle(jarColors[(idx + 5) % jarColors.length], 0.9);
      jars.fillCircle(jx, jy + 10, 5);
      // Jar lid
      jars.fillStyle(0xFFD93D, 1);
      jars.fillRoundedRect(jx - 11, jy - 4, 22, 5, 2);
    });
    this.midgroundLayer.add(jars);

    // Warm Decorative Fairy Lights / Bokeh along top
    const fairyLights = this.scene.add.graphics();
    const lightXs = [40, 95, 150, 240, 295, 350];
    lightXs.forEach((lx, i) => {
      const ly = 55 + Math.sin(i * 1.2) * 8;
      // Soft blurred warm glow
      fairyLights.fillStyle(0xFFEAA7, 0.35);
      fairyLights.fillCircle(lx, ly, 14);
      // Bright core light
      fairyLights.fillStyle(0xFFFFFF, 0.9);
      fairyLights.fillCircle(lx, ly, 4);
    });
    this.midgroundLayer.add(fairyLights);

    // World Props (retained for backward compatibility and visual flair)
    if (this.worldId === 'world_1') {
      const prop1 = this.createCandyFlower(45, 385, 0xFF5CAA);
      const prop2 = this.createCandyFlower(345, 385, 0x38C964);
      this.midgroundLayer.add(prop1);
      this.midgroundLayer.add(prop2);
      this.props.push({ obj: prop1, phase: 0 }, { obj: prop2, phase: Math.PI });
    } else if (this.worldId === 'world_2') {
      const prop1 = this.createFrostedPine(45, 380);
      const prop2 = this.createFrostedPine(345, 380);
      this.midgroundLayer.add(prop1);
      this.midgroundLayer.add(prop2);
      this.props.push({ obj: prop1, phase: 0 }, { obj: prop2, phase: 1.5 });
    } else {
      const pillar1 = this.createCaramelPillar(35, 375);
      const pillar2 = this.createCaramelPillar(355, 375);
      this.midgroundLayer.add(pillar1);
      this.midgroundLayer.add(pillar2);
      this.props.push({ obj: pillar1, phase: 0 }, { obj: pillar2, phase: 2 });
    }

    this.container.add(this.midgroundLayer);
  }

  createCounter() {
    // Candy-Shop Counter (Sits in front of character bust, giving natural shop depth)
    this.counterContainer = this.scene.add.container(0, 0);
    this.counterContainer.setDepth(3); // In front of character (depth 2), behind candy/play objects (depth 4+)

    const counter = this.scene.add.graphics();
    const w = 390;
    const topY = 404;

    // 1. Soft Drop Shadow cast onto lower gameplay arena
    counter.fillStyle(0x2D1452, 0.16);
    counter.fillRect(0, topY + 28, w, 14);

    // 2. Counter Front Bevel / Base Panel (Warm polished candy-shop wood/cream)
    const panelColor = this.worldId === 'world_3' ? 0x3D1B0A : (this.worldId === 'world_2' ? 0x7A9AB8 : 0xF3DFD0);
    counter.fillStyle(panelColor, 1);
    counter.fillRect(0, topY + 14, w, 22);

    // Decorative wainscot vertical grooves
    counter.fillStyle(0xFFFFFF, 0.2);
    for (let x = 15; x < w; x += 25) {
      counter.fillRect(x, topY + 16, 2, 18);
    }

    // 3. Countertop Slab (Polished Marble / Glossy Enamel)
    const slabColor = this.worldId === 'world_3' ? 0x542612 : (this.worldId === 'world_2' ? 0xDBE9F4 : 0xFFFAF5);
    counter.fillStyle(slabColor, 1);
    counter.fillRoundedRect(0, topY, w, 16, 3);

    // 4. Specular Top Highlight Stripe (Gleaming reflections)
    counter.fillStyle(0xFFFFFF, 0.7);
    counter.fillRect(0, topY, w, 2.5);

    // 5. Brass / Rose-Gold Trim Strip along front edge
    const trimColor = this.worldId === 'world_3' ? 0xFFD93D : 0xE5B892;
    counter.fillStyle(trimColor, 0.9);
    counter.fillRect(0, topY + 14, w, 2);

    this.counterContainer.add(counter);
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
    const particleCount = this.worldId === 'world_2' ? 28 : (this.worldId === 'world_3' ? 22 : 16);
    const w = 390;
    const h = 844;

    for (let i = 0; i < particleCount; i++) {
      const px = randInt(10, w - 10);
      const py = randInt(40, h - 100);
      const g = this.scene.add.graphics();

      let radius = randFloat(2.0, 4.2);
      let color = 0xFFFFFF;
      let alpha = randFloat(0.3, 0.7);

      if (this.worldId === 'world_2') {
        color = 0xFFFFFF;
        radius = randFloat(1.5, 3.5);
      } else if (this.worldId === 'world_3') {
        color = Math.random() > 0.4 ? 0xFFD93D : 0xFFA07A;
        radius = randFloat(2.0, 4.5);
      } else {
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
        vy: this.worldId === 'world_2' ? randFloat(0.3, 0.8) : randFloat(-0.25, -0.55),
        vx: this.worldId === 'world_2' ? randFloat(-0.25, 0.25) : randFloat(-0.12, 0.12),
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
      if (c.graphic && c.graphic.setPosition) {
        c.graphic.setPosition(c.x, c.baseY + Math.sin(this.swayTime + c.x) * 3);
      }
    }

    // 2. Props gentle breathing
    for (const p of this.props) {
      const angle = Math.sin(this.swayTime * 2 + p.phase) * 3;
      if (p.obj && p.obj.setAngle) {
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
        if (p.y > h - 40) {
          p.y = 30;
          p.x = randInt(10, w - 10);
        }
      } else {
        if (p.y < 30) {
          p.y = h - 60;
          p.x = randInt(10, w - 10);
        }
      }

      if (p.graphic && p.graphic.setPosition) {
        p.graphic.setPosition(p.x, p.y);
      }
    }
  }

  setParallaxOffset(normX) {
    if (saveManager.getReducedMotion()) return;
    if (this.horizonLayer && this.horizonLayer.setX) {
      this.horizonLayer.setX(normX * -8);
    }
    if (this.midgroundLayer && this.midgroundLayer.setX) {
      this.midgroundLayer.setX(normX * -18);
    }
  }
}
