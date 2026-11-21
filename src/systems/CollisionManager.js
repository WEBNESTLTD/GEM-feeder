export class CollisionManager {
  constructor(options = {}) {
    // Default mouth collision zone roughly matching mouth frames (x: 195, y: 235, w: 70, h: 50)
    this.mouthZone = options.mouthZone || {
      x: 195,
      y: 235,
      width: 70,
      height: 50
    };
    this.perfectRadius = options.perfectRadius || 20;
  }

  setMouthZone(zone) {
    this.mouthZone = { ...this.mouthZone, ...zone };
  }

  getMouthZone() {
    return this.mouthZone;
  }

  checkMouthCollision(candyX, candyY) {
    const halfW = this.mouthZone.width / 2;
    const halfH = this.mouthZone.height / 2;

    const minX = this.mouthZone.x - halfW;
    const maxX = this.mouthZone.x + halfW;
    const minY = this.mouthZone.y - halfH;
    const maxY = this.mouthZone.y + halfH;

    const isInside = candyX >= minX && candyX <= maxX && candyY >= minY && candyY <= maxY;

    if (!isInside) {
      return { hit: false, perfect: false };
    }

    const distFromCenter = Math.hypot(candyX - this.mouthZone.x, candyY - this.mouthZone.y);
    const perfect = distFromCenter <= this.perfectRadius;

    return {
      hit: true,
      perfect,
      distance: distFromCenter
    };
  }

  isOutOfBounds({ x, y, width = 390, height = 844, margin = 20 }) {
    return (
      x < -margin ||
      x > width + margin ||
      y <= -margin ||
      y >= height + margin
    );
  }
}
