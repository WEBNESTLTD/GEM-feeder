import { saveManager } from '../storage/SaveManager.js';

export class Character extends Phaser.GameObjects.Container {
  constructor(scene, x, y) {
    super(scene, x, y);
    this.scene = scene;

    // Sprite displaying the 9 mouth frames (mouth_0.png through mouth_8.png)
    this.sprite = scene.add.image(0, 0, 'mouth_0');
    this.sprite.setDisplaySize(300, 349);
    this.add(this.sprite);

    // Accessory overlay container
    this.accessoryText = scene.add.text(0, -130, '', {
      fontSize: '48px'
    }).setOrigin(0.5);
    this.add(this.accessoryText);

    scene.add.existing(this);

    this.currentFrameIndex = 0;
    this.isChewing = false;

    // Apply equipped cosmetics
    this.applyCosmetics();

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

  applyCosmetics() {
    const equipped = saveManager.getEquipped();

    // 1. Accessory
    if (equipped.accessory === 'acc_bow') {
      this.accessoryText.setText('🎀').setY(-130);
    } else if (equipped.accessory === 'acc_glasses') {
      this.accessoryText.setText('🕶️').setY(-50);
    } else if (equipped.accessory === 'acc_crown') {
      this.accessoryText.setText('👑').setY(-135);
    } else {
      this.accessoryText.setText('');
    }

    // 2. Outfit tint
    if (equipped.outfit === 'outfit_strawberry') {
      this.sprite.setTint(0xFFD0E6);
    } else if (equipped.outfit === 'outfit_mint') {
      this.sprite.setTint(0xD4F8D4);
    } else if (equipped.outfit === 'outfit_golden') {
      this.sprite.setTint(0xFFF0B3);
    } else {
      this.sprite.clearTint();
    }
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

  playCelebrationAnimation() {
    this.isChewing = true;
    this.setMouthFrame(8);

    // Triumphant double hop
    this.scene.tweens.add({
      targets: this.sprite,
      y: -18,
      scaleX: 1.08,
      scaleY: 0.92,
      duration: 140,
      yoyo: true,
      repeat: 2,
      ease: 'Back.easeOut',
      onComplete: () => {
        this.playEatingAnimation();
      }
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
