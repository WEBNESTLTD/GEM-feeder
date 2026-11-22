import { saveManager } from '../storage/SaveManager.js';

export class Character extends Phaser.GameObjects.Container {
  constructor(scene, x, y) {
    super(scene, x, y);
    this.scene = scene;

    // 1. Sprite displaying the 9 mouth frames (mouth_0.png through mouth_8.png)
    this.sprite = scene.add.image(0, 0, 'mouth_0');
    this.sprite.setDisplaySize(300, 349);
    this.add(this.sprite);
    this.setDepth(2); // Character stands behind the foreground candy-shop counter (depth 3)

    // 2. Procedural Eyelids for Natural Blinking
    this.eyelids = scene.add.graphics();
    this.eyelids.setVisible(false);
    this.add(this.eyelids);

    // 3. Emotive Expression Overlay (Sweat drop on miss, sparkles on perfect)
    this.emotionIcon = scene.add.text(50, -80, '', {
      fontSize: '28px',
      resolution: 2
    }).setOrigin(0.5);
    this.add(this.emotionIcon);

    // 4. Accessory overlay container
    this.accessoryText = scene.add.text(0, -130, '', {
      fontSize: '48px',
      resolution: 2
    }).setOrigin(0.5);
    this.add(this.accessoryText);

    scene.add.existing(this);

    this.currentFrameIndex = 0;
    this.isChewing = false;
    this.isAnticipating = false;
    this.isDisappointed = false;
    this.blinkTimer = null;

    // Apply equipped cosmetics
    this.applyCosmetics();

    // Subtle idle breathing motion
    if (!saveManager.getReducedMotion()) {
      this.idleTween = scene.tweens.add({
        targets: this.sprite,
        y: -4,
        duration: 1800,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
      });
      this.startBlinkCycle();
    }
  }

  startBlinkCycle() {
    if (saveManager.getReducedMotion() || !this.scene || !this.scene.time) return;

    const nextBlink = Phaser.Math.Between(3200, 5200);
    this.blinkTimer = this.scene.time.delayedCall(nextBlink, () => {
      this.triggerBlink();
      this.startBlinkCycle();
    });
  }

  triggerBlink() {
    if (this.isChewing || this.currentFrameIndex >= 7) return;

    // Draw closed eyelids matching character skin/eye position
    this.eyelids.clear();
    this.eyelids.fillStyle(0xF4C2C2, 1); // Matching character skin tone
    this.eyelids.fillRoundedRect(-52, -54, 38, 14, 7);
    this.eyelids.fillRoundedRect(14, -54, 38, 14, 7);

    // Dark eyelash lines
    this.eyelids.lineStyle(2.5, 0x3D1E47, 1);
    if (this.eyelids.strokeRoundedRect) {
      this.eyelids.strokeRoundedRect(-52, -50, 38, 2, 1);
      this.eyelids.strokeRoundedRect(14, -50, 38, 2, 1);
    } else if (this.eyelids.beginPath) {
      this.eyelids.beginPath();
      this.eyelids.moveTo(-52, -50);
      this.eyelids.lineTo(-14, -50);
      this.eyelids.moveTo(14, -50);
      this.eyelids.lineTo(52, -50);
      this.eyelids.strokePath();
    }

    this.eyelids.setVisible(true);

    this.scene.time.delayedCall(120, () => {
      this.eyelids.setVisible(false);
      this.eyelids.clear();
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
    this.sprite.setDisplaySize(300, 349);
  }

  setAnticipation(active) {
    if (this.isChewing || this.isDisappointed) return;
    if (active && !this.isAnticipating) {
      this.isAnticipating = true;
      if (this.currentFrameIndex === 0) {
        this.setMouthFrame(1); // Slightly open mouth in anticipation
      }
    } else if (!active && this.isAnticipating) {
      this.isAnticipating = false;
      if (this.currentFrameIndex === 1) {
        this.setMouthFrame(0);
      }
    }
  }

  openMouthGradual(normalizedProgress) {
    if (this.isChewing || this.isDisappointed) return;
    const frame = Math.floor(normalizedProgress * 8);
    this.setMouthFrame(frame);
  }

  playEatingAnimation(onComplete) {
    this.isChewing = true;
    this.isAnticipating = false;
    this.isDisappointed = false;
    this.emotionIcon.setText('');

    // Ensure display size is strictly locked at 300x349
    this.sprite.setDisplaySize(300, 349);

    // Frame sequence: 8 -> 6 -> 4 -> 1 -> 0 -> 3 -> 0 (eating chew)
    const chewSequence = [8, 6, 4, 1, 0, 3, 0];
    let step = 0;

    const chewTimer = this.scene.time.addEvent({
      delay: 75,
      repeat: chewSequence.length - 1,
      callback: () => {
        this.setMouthFrame(chewSequence[step]);
        step++;
        if (step >= chewSequence.length) {
          this.isChewing = false;
          this.setMouthFrame(0);
          this.sprite.setDisplaySize(300, 349);
          if (onComplete) onComplete();
        }
      }
    });
  }

  playCelebrationAnimation() {
    this.isChewing = true;
    this.isAnticipating = false;
    this.isDisappointed = false;
    this.setMouthFrame(8);
    this.emotionIcon.setText('✨');

    // Triumphant double hop (vertical hop only, NO zooming in and out)
    if (!saveManager.getReducedMotion()) {
      this.scene.tweens.add({
        targets: this.sprite,
        y: -14,
        duration: 120,
        yoyo: true,
        repeat: 1,
        ease: 'Quad.easeOut',
        onComplete: () => {
          this.sprite.y = 0;
          this.sprite.setDisplaySize(300, 349);
          this.emotionIcon.setText('');
          this.playEatingAnimation();
        }
      });
    } else {
      this.playEatingAnimation();
    }
  }

  playMissReaction() {
    if (this.isChewing) return;
    this.isDisappointed = true;
    this.setMouthFrame(0);
    this.emotionIcon.setText('💧');

    // Subtle sad droop
    if (!saveManager.getReducedMotion()) {
      this.scene.tweens.add({
        targets: this.sprite,
        y: 8,
        rotation: 0.03,
        duration: 250,
        yoyo: true,
        ease: 'Sine.easeOut',
        onComplete: () => {
          this.sprite.y = 0;
          this.sprite.rotation = 0;
          this.sprite.setDisplaySize(300, 349);
          this.isDisappointed = false;
          this.emotionIcon.setText('');
        }
      });
    } else {
      this.scene.time.delayedCall(400, () => {
        this.isDisappointed = false;
        this.emotionIcon.setText('');
      });
    }
  }

  showEmoteBadge(type) {
    const emojis = {
      sparkle: '✨',
      crown: '👑',
      sweat: '💧',
      heart: '💖'
    };
    this.emotionIcon.setText(emojis[type] || type || '');
    this.scene.time.delayedCall(1200, () => {
      if (this.emotionIcon && this.emotionIcon.active) {
        this.emotionIcon.setText('');
      }
    });
  }

  playCelebration() {
    this.playVictoryDance();
  }

  playVictoryDance() {
    this.setMouthFrame(8);
    this.emotionIcon.setText('👑');
    if (!saveManager.getReducedMotion()) {
      this.scene.tweens.add({
        targets: this.sprite,
        y: -12,
        duration: 250,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
      });
    }
  }

  resetToIdle() {
    this.isChewing = false;
    this.isAnticipating = false;
    this.isDisappointed = false;
    this.emotionIcon.setText('');
    this.setMouthFrame(0);
    if (this.aimTween) {
      this.aimTween.stop();
      this.aimTween = null;
    }
    this.sprite.y = 0;
    this.sprite.rotation = 0;
    this.sprite.setDisplaySize(300, 349);
  }

  trackAim(pointerX, pointerY) {
    if (this.isChewing || this.isDisappointed) return;
    const dx = pointerX - 195;
    const targetAngle = Phaser.Math.Clamp(dx / 300, -1, 1) * 0.08;
    this.sprite.rotation = Phaser.Math.Linear(this.sprite.rotation, targetAngle, 0.4);
  }

  preDestroy() {
    if (this.idleTween) this.idleTween.stop();
    if (this.aimTween) this.aimTween.stop();
    if (this.blinkTimer) this.blinkTimer.remove(false);
    super.preDestroy();
  }
}
