import { PHYSICS } from '../config/gameConfig.js';

export class TrajectoryPhysics {
  /**
   * Authoritative single-source physics calculation shared between
   * aiming prediction and actual arcade physics movement.
   */

  static getGravity() {
    return PHYSICS.GRAVITY_Y || 750;
  }

  /**
   * Advances a physics state by dt seconds using the exact arcade physics integration.
   * Supports both object-based step({ x, y, vx, vy }, dt, options) and scalar step(x, y, vx, vy, dt, gravity).
   */
  static step(...args) {
    let state, dt, options, customGravity;
    if (typeof args[0] === 'object' && args[0] !== null) {
      state = args[0];
      dt = args[1];
      options = args[2] || {};
      customGravity = options.gravity;
    } else {
      state = { x: args[0], y: args[1], vx: args[2], vy: args[3] };
      dt = args[4];
      customGravity = args[5];
      options = args[6] || {};
    }

    const timeScale = options.timeScale !== undefined ? options.timeScale : 1.0;
    const gravity = customGravity !== undefined ? customGravity : TrajectoryPhysics.getGravity();

    let vx = state.vx;
    let vy = state.vy;

    // Apply magnet pull if active
    if (options.magnetPull) {
      vx += options.magnetPull.vx * dt;
      vy += options.magnetPull.vy * dt;
    }

    // Apply wind drift if present
    if (options.windVx) {
      vx += options.windVx * dt;
    }

    // Position integration with Euler dt & 0.5 * g * dt^2
    const x = state.x + (vx * dt * timeScale);
    const y = state.y + (vy * dt * timeScale) + (0.5 * gravity * dt * dt * timeScale * timeScale);

    // Parabolic vertical gravity integration
    vy += gravity * dt;

    return { x, y, vx, vy };
  }

  /**
   * Generates discrete trajectory points for aiming line render and collision prediction.
   * Accepts both (startX, startY, vx, vy, options) and ({ startX, startY, vx, vy, count, timeScale, mouthZone }).
   */
  static generateTrajectory(...args) {
    let startX, startY, initialVx, initialVy, options;

    if (typeof args[0] === 'object' && args[0] !== null) {
      const cfg = args[0];
      startX = cfg.startX;
      startY = cfg.startY;
      initialVx = cfg.vx;
      initialVy = cfg.vy;
      options = {
        maxSteps: cfg.count || cfg.maxSteps || 16,
        dt: cfg.dt || 0.035,
        timeScale: cfg.timeScale || 1.0,
        mouthZone: cfg.mouthZone || null,
        powerUpManager: cfg.powerUpManager,
        windVx: cfg.windVx || 0
      };
    } else {
      startX = args[0];
      startY = args[1];
      initialVx = args[2];
      initialVy = args[3];
      options = args[4] || {};
    }

    const points = [];
    const dt = options.dt || 0.035;
    const maxSteps = options.maxSteps || 16;
    const timeScale = options.timeScale || 1.0;
    const mouthZone = options.mouthZone || null;

    let curr = { x: startX, y: startY, vx: initialVx, vy: initialVy };
    let hasHitMouth = false;
    let hitStep = -1;

    for (let i = 0; i < maxSteps; i++) {
      let magnetPull = null;
      if (options.powerUpManager && options.powerUpManager.isPowerUpActive('magnet') && mouthZone) {
        magnetPull = options.powerUpManager.applyMagnetPull(curr.x, curr.y, mouthZone.x, mouthZone.y);
      }

      curr = TrajectoryPhysics.step(curr, dt, {
        timeScale,
        magnetPull,
        windVx: options.windVx || 0
      });

      let hit = false;
      if (mouthZone && !hasHitMouth) {
        const dx = Math.abs(curr.x - mouthZone.x);
        const dy = Math.abs(curr.y - mouthZone.y);
        if (dx <= mouthZone.width / 2 && dy <= mouthZone.height / 2) {
          hit = true;
          hasHitMouth = true;
          hitStep = i;
        }
      }

      points.push({
        x: curr.x,
        y: curr.y,
        vx: curr.vx,
        vy: curr.vy,
        isHit: hit
      });
    }

    return {
      points,
      hasHitMouth,
      hitsMouth: hasHitMouth,
      hitStep
    };
  }

  /**
   * Fast collision prediction check along trajectory
   */
  static testMouthHit(startX, startY, vx, vy, mouthZone, options = {}) {
    const dt = 0.03;
    const steps = options.isPrecision ? 50 : 35;
    let curr = { x: startX, y: startY, vx, vy };

    for (let i = 0; i < steps; i++) {
      curr = TrajectoryPhysics.step(curr, dt, options);
      const dx = Math.abs(curr.x - mouthZone.x);
      const dy = Math.abs(curr.y - mouthZone.y);
      if (dx <= (mouthZone.width / 2) && dy <= (mouthZone.height / 2)) {
        return {
          hit: true,
          step: i,
          x: curr.x,
          y: curr.y
        };
      }
    }

    return { hit: false };
  }
}
