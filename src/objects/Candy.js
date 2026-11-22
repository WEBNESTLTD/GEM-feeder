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
    this.setDepth(12); // In front of packet (depth 10) and counter (depth 3)

    // 1. Soft Drop Shadow underneath candy
    this.shadow = scene.add.graphics();
    this.shadow.fillStyle(0x2D1452, 0.22);
    this.shadow.fillEllipse(0, 22, 32, 9);
    this.add(this.shadow);

    // 2. Main Candy Button Sprite (Strictly locked to 48x48, zero zooming in/out)
    this.sprite = scene.add.image(0, 0, this.candyData.key);
    this.sprite.setDisplaySize(48, 48);
    this.add(this.sprite);

    scene.add.existing(this);
    scene.physics.world.enable(this);

    this.body.setAllowGravity(false);
    this.body.setCircle(24, -24, -24);

    // Rock-solid stationary at spawner - ZERO idle zooming, bobbing, or scaling!
  }

  setSquash(scaleX, scaleY) {
    this.setScale(scaleX, scaleY);
    if (this.shadow) {
      this.shadow.setAlpha(0.22 * (2 - scaleY));
    }
  }

  resetSquash() {
    this.scene.tweens.add({
      targets: this,
      scaleX: 1,
      scaleY: 1,
      duration: 120,
      ease: 'Back.easeOut'
    });
    if (this.shadow) {
      this.scene.tweens.add({
        targets: this.shadow,
        alpha: 0.22,
        duration: 120
      });
    }
  }

  launch(vx, vy) {
    if (this.isFlying) return;
    this.isFlying = true;
    this.setScale(1, 1);

    // Hide ground shadow upon lift-off
    if (this.shadow) {
      this.scene.tweens.add({
        targets: this.shadow,
        alpha: 0,
        scale: 0.2,
        duration: 150
      });
    }

    this.body.setAllowGravity(true);
    this.body.setGravityY(PHYSICS.GRAVITY_Y);
    this.body.setVelocity(vx, vy);

    // Dynamic rotation during flight proportional to velocity
    if (!saveManager.getReducedMotion()) {
      const rotationSpeed = (vx >= 0 ? 1 : -1) * Phaser.Math.Clamp(Math.abs(vx) * 0.5 + 260, 260, 600);
      this.rotationTween = this.scene.tweens.add({
        targets: this.sprite,
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

    // Aerodynamic velocity-proportional stretch on Container
    if (this.body && this.body.velocity) {
      const vx = this.body.velocity.x;
      const vy = this.body.velocity.y;
      const speed = Math.hypot(vx, vy);
      if (speed > 250 && !saveManager.getReducedMotion()) {
        const stretch = Math.min(1.14, 1 + (speed / 4500));
        this.setScale(1 / stretch, stretch);
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
      this.rotationTween = null;
    }

    // Delicious chomp squash-and-shrink into mouth animation
    this.scene.tweens.add({
      targets: this,
      scaleX: 1.15,
      scaleY: 0.8,
      duration: 50,
      ease: 'Quad.easeOut',
      onComplete: () => {
        this.scene.tweens.add({
          targets: this,
          scale: 0.05,
          alpha: 0,
          duration: 120,
          ease: 'Back.easeIn',
          onComplete: () => {
            this.destroy();
          }
        });
      }
    });
  }

  preDestroy() {
    if (this.idleTween) this.idleTween.stop();
    if (this.rotationTween) this.rotationTween.stop();
    super.preDestroy();
  }
}
