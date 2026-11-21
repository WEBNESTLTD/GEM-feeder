import { CANDIES, PHYSICS } from '../config/gameConfig.js';

export class Candy extends Phaser.GameObjects.Container {
  constructor(scene, x, y, candyData = null) {
    super(scene, x, y);
    this.scene = scene;
    this.candyData = candyData || CANDIES[0];
    this.isFlying = false;
    this.isConsumed = false;
    this.flightTime = 0;

    // Sprite visual
    this.sprite = scene.add.image(0, 0, this.candyData.key);
    this.sprite.setDisplaySize(60, 60);
    this.add(this.sprite);

    // Subtle idle floating / breathing
    this.idleTween = scene.tweens.add({
      targets: this.sprite,
      scaleX: 1.05,
      scaleY: 0.95,
      duration: 650,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });

    scene.add.existing(this);
    scene.physics.world.enable(this);

    this.body.setAllowGravity(false);
    this.body.setCircle(26, -26, -26);
  }

  launch(vx, vy) {
    if (this.isFlying) return;
    this.isFlying = true;

    if (this.idleTween) {
      this.idleTween.stop();
    }

    this.body.setAllowGravity(true);
    // Blue/Mint candy has lower gravity for floaty precision trick shots
    const effectiveGravity = this.candyData.key === 'candy_blue' ? (PHYSICS.GRAVITY_Y * 0.72) : PHYSICS.GRAVITY_Y;
    this.body.setGravityY(effectiveGravity);
    this.body.setVelocity(vx, vy);

    // Dynamic rotation during flight
    const rotationSpeed = (vx >= 0 ? 1 : -1) * Phaser.Math.Between(260, 480);
    this.rotationTween = this.scene.tweens.add({
      targets: this.sprite,
      angle: rotationSpeed,
      duration: 1000,
      repeat: -1,
      ease: 'Linear'
    });
  }

  update(delta) {
    if (!this.isFlying || this.isConsumed) return;

    this.flightTime += delta;

    // Emit light flight trail dots
    if (Math.random() < 0.45) {
      this.scene.emitTrailDot(this.x, this.y, this.candyData.color);
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
