export class Character extends Phaser.GameObjects.Container {
  constructor(scene, x, y) {
    super(scene, x, y);
    this.scene = scene;

    // Sprite displaying the 9 mouth frames (mouth_0.png through mouth_8.png)
    this.sprite = scene.add.image(0, 0, 'mouth_0');
    this.sprite.setDisplaySize(300, 349);
    this.add(this.sprite);

    scene.add.existing(this);

    this.currentFrameIndex = 0;
    this.isChewing = false;

    // Subtle idle breathing motion
    this.idleTween = scene.tweens.add({
      targets: this.sprite,
      y: -4,
      duration: 1800,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });
  }

  setMouthFrame(index) {
    const clamped = Math.max(0, Math.min(8, Math.round(index)));
    this.currentFrameIndex = clamped;
    this.sprite.setTexture(`mouth_${clamped}`);
  }

  openMouthGradual(normalizedProgress) {
    if (this.isChewing) return;
    // Map progress 0..1 to frames 0..8
    const frame = Math.floor(normalizedProgress * 8);
    this.setMouthFrame(frame);
  }

  playEatingAnimation(onComplete) {
    this.isChewing = true;

    // Frame sequence: 8 -> 5 -> 2 -> 0 -> 4 -> 0 (eating chew)
    const chewSequence = [8, 6, 4, 1, 0, 3, 0];
    let step = 0;

    // Crunchy munch sound effect
    if (this.scene && this.scene.sound) {
      // Trigger through AudioManager in GameScene
    }

    const chewTimer = this.scene.time.addEvent({
      delay: 70,
      repeat: chewSequence.length - 1,
      callback: () => {
        this.setMouthFrame(chewSequence[step]);
        step++;
        if (step >= chewSequence.length) {
          this.isChewing = false;
          this.setMouthFrame(0);
          if (onComplete) onComplete();
        }
      }
    });

    // Happy character bounce
    this.scene.tweens.add({
      targets: this.sprite,
      scaleX: 1.05,
      scaleY: 0.95,
      duration: 120,
      yoyo: true,
      repeat: 2,
      ease: 'Quad.easeOut'
    });
  }

  playMissReaction() {
    if (this.isChewing) return;
    // Reset to closed mouth with slight disappointed twitch
    this.setMouthFrame(0);
    this.scene.tweens.add({
      targets: this.sprite,
      x: -6,
      duration: 60,
      yoyo: true,
      repeat: 3,
      ease: 'Sine.easeInOut',
      onComplete: () => {
        this.sprite.x = 0;
      }
    });
  }

  resetToIdle() {
    this.isChewing = false;
    this.setMouthFrame(0);
    if (this.aimTween) {
      this.aimTween.stop();
      this.aimTween = null;
    }
    this.sprite.rotation = 0;
  }

  trackAim(pointerX, pointerY) {
    if (this.isChewing) return;
    // Eye tracking / subtle head tilt towards the aiming position
    // Center is 195; clamp target rotation smoothly
    const dx = pointerX - 195;
    const targetAngle = Phaser.Math.Clamp(dx / 300, -1, 1) * 0.08;

    // Use direct interpolation (LERP) instead of creating unbounded tweens on every pointermove
    this.sprite.rotation = Phaser.Math.Linear(this.sprite.rotation, targetAngle, 0.4);
  }

  preDestroy() {
    if (this.idleTween) this.idleTween.stop();
    if (this.aimTween) this.aimTween.stop();
    super.preDestroy();
  }
}
