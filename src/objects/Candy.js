import { CANDIES, PHYSICS } from '../config/gameConfig.js';
import { saveManager } from '../storage/SaveManager.js';

export class Candy extends Phaser.GameObjects.Container {
  constructor(scene, x, y, candyData = null) {
    super(scene, x, y);
    this.scene = scene;
    this.candyData = candyData || CANDIES[0];
    this.isFlying = false;
    this.isConsumed = false;
    this.flightTime = 0;

    // 1. Soft Drop Shadow (rendered behind the candy)
    this.shadow = scene.add.graphics();
    this.shadow.fillStyle(0x2D1452, 0.25);
    this.shadow.fillEllipse(0, 26, 38, 14);
    this.add(this.shadow);

    // 2. Main Candy Sprite
    this.sprite = scene.add.image(0, 0, this.candyData.key);
    this.sprite.setDisplaySize(60, 60);
    this.add(this.sprite);

    // 3. Glossy Specular Highlight (subtle curved white reflection)
    this.shine = scene.add.graphics();
    this.shine.fillStyle(0xFFFFFF, 0.4);
    this.shine.fillEllipse(-10, -12, 14, 7);
    this.shine.fillCircle(-14, -14, 3);
    this.add(this.shine);

    // Subtle idle floating / breathing
    if (!saveManager.getReducedMotion()) {
      this.idleTween = scene.tweens.add({
        targets: [this.sprite, this.shine],
        scaleX: 1.05,
        scaleY: 0.95,
        duration: 650,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
      });
    }

    scene.add.existing(this);
    scene.physics.world.enable(this);

    this.body.setAllowGravity(false);
    this.body.setCircle(26, -26, -26);

    this.targetScaleX = 1;
    this.targetScaleY = 1;
  }

  setSquash(scaleX, scaleY) {
    this.sprite.setScale(scaleX, scaleY);
    this.shine.setScale(scaleX, scaleY);
    if (this.shadow) {
      this.shadow.setScale(scaleX * 1.1, scaleY * 0.9);
      this.shadow.setAlpha(0.25 * (2 - scaleY));
    }
  }

  resetSquash() {
    this.scene.tweens.add({
      targets: [this.sprite, this.shine],
      scaleX: 1,
      scaleY: 1,
      duration: 140,
      ease: 'Back.easeOut'
    });
    if (this.shadow) {
      this.scene.tweens.add({
        targets: this.shadow,
        scaleX: 1,
        scaleY: 1,
        alpha: 0.25,
        duration: 140
      });
    }
  }

  launch(vx, vy) {
    if (this.isFlying) return;
    this.isFlying = true;

    if (this.idleTween) {
      this.idleTween.stop();
    }

    // Hide ground shadow upon lift-off
    if (this.shadow) {
      this.scene.tweens.add({
        targets: this.shadow,
        alpha: 0,
        scale: 0.2,
        duration: 180
      });
    }

    // Launch stretch burst aligned to velocity
    this.sprite.setScale(0.85, 1.25);
    this.shine.setScale(0.85, 1.25);
    this.scene.tweens.add({
      targets: [this.sprite, this.shine],
      scaleX: 1,
      scaleY: 1,
      duration: 220,
      ease: 'Quad.easeOut'
    });

    this.body.setAllowGravity(true);
    this.body.setGravityY(PHYSICS.GRAVITY_Y);
    this.body.setVelocity(vx, vy);

    // Dynamic rotation during flight proportional to velocity
    if (!saveManager.getReducedMotion()) {
      const rotationSpeed = (vx >= 0 ? 1 : -1) * Phaser.Math.Clamp(Math.abs(vx) * 0.5 + 260, 260, 600);
      this.rotationTween = this.scene.tweens.add({
        targets: [this.sprite, this.shine],
        angle: rotationSpeed,
        duration: 1000,
        repeat: -1,
        ease: 'Linear'
      });
    }
  }

  update(delta) {
    if (!this.isFlying || this.isConsumed) return;

    this.flightTime += delta;

    // Slight aerodynamic elongation along velocity
    if (this.body && this.body.velocity) {
      const vx = this.body.velocity.x;
      const vy = this.body.velocity.y;
      const speed = Math.hypot(vx, vy);
      if (speed > 200 && !saveManager.getReducedMotion()) {
        const stretch = Math.min(1.2, 1 + (speed / 3500));
        this.sprite.setScale(1 / stretch, stretch);
        this.shine.setScale(1 / stretch, stretch);
      }
    }

    // Emit light flight trail dots
    if (this.scene && typeof this.scene.emitTrailDot === 'function') {
      if (Math.random() < 0.45) {
        this.scene.emitTrailDot(this.x, this.y, this.candyData.color);
      }
    }
  }

  consume() {
    this.isConsumed = true;
    if (this.body) {
      this.body.setVelocity(0, 0);
      this.body.setAllowGravity(false);
    }
    if (this.rotationTween) {
      this.rotationTween.stop();
    }

    // Shrink into mouth animation
    this.scene.tweens.add({
      targets: this,
      scale: 0.1,
      alpha: 0,
      duration: 160,
      ease: 'Back.easeIn',
      onComplete: () => {
        this.destroy();
      }
    });
  }

  preDestroy() {
    if (this.idleTween) this.idleTween.stop();
    if (this.rotationTween) this.rotationTween.stop();
    super.preDestroy();
  }
}
