export class InputManager {
  constructor(options = {}) {
    this.minVelocity = options.minVelocity || 250;
    this.maxVelocity = options.maxVelocity || 950;
    this.velocityMultiplier = options.velocityMultiplier || 4.5;
    this.minDragDistance = options.minDragDistance || 20;
    this.maxDragDistance = options.maxDragDistance || 180;
  }

  calculateThrowVelocity({ startX, startY, currentX, currentY, durationMs = 100 }) {
    let dx = currentX - startX;
    let dy = currentY - startY;

    // Support both forward-swipe (dy < 0) and pull-back slingshot mode (dy > 0)
    // In slingshot pull-back mode, pulling down launches UP: invert vector
    const isSlingshot = dy > 15;
    if (isSlingshot) {
      dx = -dx;
      dy = -dy;
    }

    const distance = Math.hypot(dx, dy);

    // If drag was negligible, invalid throw
    if (distance < this.minDragDistance || dy >= 0) {
      return { isValid: false, vx: 0, vy: 0, speed: 0, isSlingshot };
    }

    const clampedDistance = Math.min(Math.max(distance, this.minDragDistance), this.maxDragDistance);
    const effectiveDuration = Math.max(durationMs, 50);

    // Base speed influenced by distance and swipe velocity
    const swipeSpeed = (clampedDistance / effectiveDuration) * 1000 * (this.velocityMultiplier * 0.15);
    const rawSpeed = Math.min(Math.max(swipeSpeed, this.minVelocity), this.maxVelocity);

    const angle = Math.atan2(dy, dx);
    const vx = Math.cos(angle) * rawSpeed;
    const vy = Math.sin(angle) * rawSpeed;

    return {
      isValid: true,
      vx,
      vy,
      speed: rawSpeed,
      angle,
      distance,
      isSlingshot
    };
  }

  calculateThrow({ startX, startY, endX, endY, durationMs = 100 }) {
    return this.calculateThrowVelocity({
      startX,
      startY,
      currentX: endX,
      currentY: endY,
      durationMs
    });
  }
}
