import { COLORS, PHYSICS } from '../config/gameConfig.js';
import { Character } from '../objects/Character.js';
import { CandySpawner } from '../objects/CandySpawner.js';
import { InputManager } from '../systems/InputManager.js';
import { CollisionManager } from '../systems/CollisionManager.js';
import { ScoreManager } from '../systems/ScoreManager.js';
import { ComboManager } from '../systems/ComboManager.js';
import { audioManager } from '../systems/AudioManager.js';
import { saveManager } from '../storage/SaveManager.js';
import { HUD } from '../ui/HUD.js';
import { PauseMenu } from '../ui/PauseMenu.js';

export class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
  }

  create() {
    // 1. Scene State
    this.isPaused = false;
    this.isGameOver = false;
    this.lives = 3;
    this.hasMadeFirstThrow = false;
    this.isPointerDown = false;
    this.pointerStartTime = 0;
    this.pointerStartX = 0;
    this.pointerStartY = 0;
    this.activeFlyingCandy = null;

    // 2. Systems
    this.scoreManager = new ScoreManager({ initialHighScore: saveManager.getHighScore() });
    this.comboManager = new ComboManager();
    this.inputManager = new InputManager({
      minVelocity: PHYSICS.MIN_VELOCITY,
      maxVelocity: PHYSICS.MAX_VELOCITY,
      velocityMultiplier: PHYSICS.VELOCITY_MULTIPLIER,
      minDragDistance: PHYSICS.MIN_DRAG_DISTANCE,
      maxDragDistance: PHYSICS.MAX_DRAG_DISTANCE
    });
    this.collisionManager = new CollisionManager({
      mouthZone: { x: 195, y: 240, width: 75, height: 55 },
      perfectRadius: 22
    });

    // 3. Background and Shelf Divider (matching reference)
    this.add.image(195, 422, 'pastel_bg');

    // Reference shelf divider (left: -10, top: 392, width: 410, height: 38)
    const shelfShadow = this.add.graphics();
    shelfShadow.fillStyle(0xE3D0F5, 0.9);
    shelfShadow.fillRoundedRect(-10, 396, 410, 38, 19);
    const shelf = this.add.graphics();
    shelf.fillStyle(0xFFFFFF, 0.9);
    shelf.fillRoundedRect(-10, 392, 410, 38, 19);

    // Dynamic moving character variables for difficulty ramp (score >= 500)
    this.characterBaseX = 195;
    this.characterBaseY = 240;
    this.swayTime = 0;

    // Slingshot rubber band graphics
    this.slingGraphics = this.add.graphics();
    this.slingGraphics.setDepth(18);

    // Decorative background bubbles
    const bgBubbles = this.add.graphics();
    bgBubbles.fillStyle(0xFFFFFF, 0.35);
    bgBubbles.fillCircle(40, 520, 90);
    bgBubbles.fillStyle(0xFFD0E6, 0.5);
    bgBubbles.fillCircle(360, 600, 70);
    bgBubbles.fillStyle(0xFFFFFF, 0.35);
    bgBubbles.fillCircle(330, 140, 50);

    // 4. Character (positioned at x: 195, y: 240)
    this.character = new Character(this, 195, 240);

    // 5. Candy Spawner (anchored above packet: x: 195, y: 690)
    this.spawner = new CandySpawner(this, 195, 690);

    // 6. HUD UI Layer
    this.hud = new HUD(this, {
      score: this.scoreManager.getScore(),
      highScore: this.scoreManager.getHighScore(),
      lives: this.lives,
      nextCandyKey: this.spawner.getNextCandyData().key,
      onPauseClick: () => this.pauseGame()
    });

    // Trajectory Aiming Line Graphic
    this.aimGraphics = this.add.graphics();
    this.aimGraphics.setDepth(20);

    // Particles group for hit celebrations and trails
    this.trailGroup = this.add.group();

    // 7. Spawn Initial Candy
    this.spawnNextCandy();

    // 8. Pause Menu
    this.pauseMenu = new PauseMenu(this, {
      onResume: () => this.resumeGame(),
      onRestart: () => this.restartGame(),
      onHome: () => this.goToHome()
    });

    // 9. Input Listeners
    this.setupInput();
  }

  setupInput() {
    this.input.on('pointerdown', (pointer) => {
      if (this.isPaused || this.isGameOver || this.activeFlyingCandy) return;

      const candy = this.spawner.getActiveCandy();
      if (!candy || candy.isFlying) return;

      // Check if tap was on or near the ready candy (radius 60)
      const dist = Math.hypot(pointer.x - candy.x, pointer.y - candy.y);
      if (dist <= 75) {
        this.isPointerDown = true;
        this.pointerStartX = pointer.x;
        this.pointerStartY = pointer.y;
        this.pointerStartTime = this.time.now;
      }
    });

    this.input.on('pointermove', (pointer) => {
      if (!this.isPointerDown || this.isPaused || this.isGameOver || this.activeFlyingCandy) return;

      // Character eye/head tilt tracking
      this.character.trackAim(pointer.x, pointer.y);

      // Draw dashed trajectory prediction curve and slingshot band
      this.drawAimLine(this.pointerStartX, this.pointerStartY, pointer.x, pointer.y);
    });

    this.input.on('pointerup', (pointer) => {
      if (!this.isPointerDown) return;
      this.isPointerDown = false;
      this.aimGraphics.clear();
      this.slingGraphics.clear();
      this.character.resetToIdle();

      if (this.isPaused || this.isGameOver || this.activeFlyingCandy) return;

      const candy = this.spawner.getActiveCandy();
      if (!candy || candy.isFlying) return;

      const duration = this.time.now - this.pointerStartTime;
      const throwData = this.inputManager.calculateThrow({
        startX: this.pointerStartX,
        startY: this.pointerStartY,
        endX: pointer.x,
        endY: pointer.y,
        durationMs: duration
      });

      // Swipe must have an upward velocity intent (throwData.vy < 0)
      if (throwData.isValid && throwData.vy < -50) {
        this.launchActiveCandy(candy, throwData.vx, throwData.vy);
        // Haptic feedback pulse on throw release
        if (typeof navigator !== 'undefined' && navigator.vibrate) {
          try { navigator.vibrate(25); } catch {}
        }
      }
    });
  }

  drawAimLine(startX, startY, currentX, currentY) {
    this.aimGraphics.clear();
    this.slingGraphics.clear();
    const candy = this.spawner.getActiveCandy();
    if (!candy) return;

    let dx = currentX - startX;
    let dy = currentY - startY;

    // Slingshot pull-back mode (pulling down launches up)
    const isSlingshot = dy > 10;
    if (isSlingshot) {
      // Draw visible elastic rubber band from packet anchors to pull position
      this.slingGraphics.lineStyle(4, 0x6B2FB3, 0.85);
      this.slingGraphics.beginPath();
      this.slingGraphics.moveTo(145, 750);
      this.slingGraphics.lineTo(currentX, currentY);
      this.slingGraphics.lineTo(245, 750);
      this.slingGraphics.strokePath();

      // Invert vector for upward trajectory projection
      dx = -dx;
      dy = -dy;
    }

    if (dy >= 0) return; // Only draw when launch trajectory points upward

    // Predict parabolic arc points
    const vx = dx * 3.5;
    const vy = dy * 4.2;
    const effectiveGravity = (candy.candyData && candy.candyData.key === 'candy_blue') ? (PHYSICS.GRAVITY_Y * 0.72) : PHYSICS.GRAVITY_Y;
    const dt = 0.04;
    let currX = candy.x;
    let currY = candy.y;
    let simVx = vx;
    let simVy = vy;

    // Simulate forward path to test if it hits the mouth hitbox (Trajectory Lock!)
    let isAimedAtMouth = false;
    let testX = candy.x;
    let testY = candy.y;
    let testVx = vx;
    let testVy = vy;

    for (let j = 0; j < 30; j++) {
      testX += testVx * dt;
      testY += testVy * dt + 0.5 * effectiveGravity * dt * dt;
      testVy += effectiveGravity * dt;
      const collisionCheck = this.collisionManager.checkMouthCollision(testX, testY);
      if (collisionCheck.hit) {
        isAimedAtMouth = true;
        break;
      }
    }

    const arcColor = isAimedAtMouth ? 0x38C964 : 0x8E5BD6; // Bright green when trajectory locks onto mouth!
    const dotColor = isAimedAtMouth ? 0xFFFFFF : 0xFFD93D;
    this.aimGraphics.lineStyle(4, arcColor, isAimedAtMouth ? 0.95 : 0.7);

    for (let i = 0; i < 12; i++) {
      const nextX = currX + simVx * dt;
      const nextY = currY + simVy * dt + 0.5 * effectiveGravity * dt * dt;
      simVy += effectiveGravity * dt;

      // Draw glowing dotted dash
      if (i % 2 === 0) {
        this.aimGraphics.fillStyle(dotColor, isAimedAtMouth ? 1 : 0.85);
        this.aimGraphics.fillCircle(nextX, nextY, (isAimedAtMouth ? 6.5 : 5) - (i * 0.25));
      }

      currX = nextX;
      currY = nextY;
    }
  }

  launchActiveCandy(candy, vx, vy) {
    this.activeFlyingCandy = candy;
    this.spawner.clearActiveCandy();

    if (!this.hasMadeFirstThrow) {
      this.hasMadeFirstThrow = true;
      this.hud.dismissGuidance();
    }

    candy.launch(vx, vy);
    audioManager.playThrow();

    // Prepare character mouth gradual opening as candy ascends
    this.character.openMouthGradual(0.65);
  }

  update(time, delta) {
    if (this.isPaused || this.isGameOver) return;

    // Difficulty ramp: character gently sways side to side once score reaches 500
    const currentScore = this.scoreManager.getScore();
    if (currentScore >= 500) {
      this.swayTime += delta * 0.0018;
      // Sway amplitude scales from 15px to 35px
      const amplitude = Math.min(35, 15 + ((currentScore - 500) / 500) * 20);
      const swayOffset = Math.sin(this.swayTime) * amplitude;
      this.character.x = this.characterBaseX + swayOffset;
      this.collisionManager.setMouthZone({
        x: this.character.x,
        y: this.characterBaseY,
        width: 75,
        height: 55
      });
    }

    if (this.activeFlyingCandy) {
      this.activeFlyingCandy.update(delta);

      const candyX = this.activeFlyingCandy.x;
      const candyY = this.activeFlyingCandy.y;

      // 1. Character mouth anticipation when candy approaches
      if (candyY < 380 && candyY > 200 && !this.character.isChewing) {
        const proximity = Phaser.Math.Clamp(1 - Math.abs(candyY - 240) / 140, 0, 1);
        this.character.openMouthGradual(proximity);
      }

      // 2. Collision with mouth detection
      const collision = this.collisionManager.checkMouthCollision(candyX, candyY);
      if (collision.hit) {
        this.handleHit(collision.perfect);
        return;
      }

      // 3. Out-of-bounds or max flight duration -> Miss
      if (
        this.collisionManager.isOutOfBounds({ x: candyX, y: candyY }) ||
        this.activeFlyingCandy.flightTime >= PHYSICS.MAX_FLIGHT_TIME_MS
      ) {
        this.handleMiss();
        return;
      }
    }
  }

  handleHit(isPerfect) {
    const candy = this.activeFlyingCandy;
    this.activeFlyingCandy = null;

    candy.consume();

    // Haptic feedback for successful catch: crisp double-tap
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      try { navigator.vibrate([35, 40, 45]); } catch {}
    }

    // Crunch / munch chewing sound
    audioManager.playCrunch();

    // Combo system update
    const comboInfo = this.comboManager.registerHit();
    this.hud.showCombo(comboInfo.multiplier);
    audioManager.setComboLevel(comboInfo.multiplier);

    // Special candy effects!
    const candyKey = candy.candyData ? candy.candyData.key : '';
    let isFrenzyActive = false;

    // Rainbow Candy Perk: Restores 1 life (if < 3) or triggers double frenzy!
    if (candyKey === 'candy_rainbow') {
      if (this.lives < 3) {
        this.lives += 1;
        this.hud.restoreLifeAnimation(this.lives);
        audioManager.playLifeUp();
        this.showFloatingPopup(candy.x, candy.y - 45, '+1 HEART!', 0xFF5CAA);
      } else {
        isFrenzyActive = true;
      }
    }

    // Check if 10 consecutive hits milestone reached -> restore 1 life!
    if (comboInfo.combo > 0 && comboInfo.combo % 10 === 0 && this.lives < 3) {
      this.lives += 1;
      this.hud.restoreLifeAnimation(this.lives);
      audioManager.playLifeUp();
      this.showFloatingPopup(candy.x, candy.y - 45, '+1 HEART!', 0xFF5CAA);
    }

    // Yellow Star candy bonus points (+10 bonus)
    let extraPoints = 0;
    if (candyKey === 'candy_yellow') {
      extraPoints = 10;
    }

    // Scoring system update
    const baseMultiplier = isFrenzyActive ? comboInfo.multiplier * 2 : comboInfo.multiplier;
    const scoreInfo = this.scoreManager.addHit({
      perfect: isPerfect,
      comboMultiplier: baseMultiplier
    });

    if (extraPoints > 0) {
      this.scoreManager.score += extraPoints;
    }

    this.hud.updateScore(this.scoreManager.getScore(), this.scoreManager.getHighScore());

    // Character eating animation
    this.character.playEatingAnimation();

    // Audio & Visual popups
    if (isPerfect) {
      audioManager.playPerfectHit();
      const popupText = isFrenzyActive ? `+${scoreInfo.addedPoints} 2X FRENZY!` : `+${scoreInfo.addedPoints} Perfect!`;
      this.showFloatingPopup(candy.x, candy.y - 20, popupText, 0xD81B7A);
    } else {
      audioManager.playHit();
      const popupText = extraPoints > 0 ? `+${scoreInfo.addedPoints + extraPoints} Star!` : `+${scoreInfo.addedPoints}`;
      this.showFloatingPopup(candy.x, candy.y - 20, popupText, 0x4B1F86);
    }

    if (comboInfo.isMilestone) {
      audioManager.playCombo();
    }

    // Spawn celebration particle burst
    this.spawnHitParticles(candy.x, candy.y, candy.candyData.color);

    // Save high score if beaten
    saveManager.saveHighScore(this.scoreManager.getHighScore());

    // Spawn next candy after short delay
    this.time.delayedCall(450, () => {
      if (!this.isGameOver) {
        this.spawnNextCandy();
      }
    });
  }

  handleMiss() {
    const candy = this.activeFlyingCandy;
    this.activeFlyingCandy = null;

    if (candy) {
      candy.destroy();
    }

    // Haptic feedback for miss: heavy buzz
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      try { navigator.vibrate(120); } catch {}
    }

    audioManager.playMiss();
    this.character.playMissReaction();

    // Combo reset
    this.comboManager.registerMiss();
    this.hud.hideCombo();
    audioManager.setComboLevel(1);

    // Screen shake
    this.cameras.main.shake(200, 0.015);

    // Life loss
    this.lives -= 1;
    this.hud.updateLives(this.lives);

    if (this.lives <= 0) {
      this.triggerGameOver();
    } else {
      this.time.delayedCall(500, () => {
        if (!this.isGameOver) {
          this.character.resetToIdle();
          this.spawnNextCandy();
        }
      });
    }
  }

  spawnNextCandy() {
    const spawned = this.spawner.spawnActiveCandy();
    this.hud.updateNextPreview(spawned.nextCandyData.key);
    this.character.resetToIdle();
  }

  showFloatingPopup(x, y, text, colorHex) {
    const container = this.add.container(x, y);

    const shadow = this.add.text(1, 1, text, {
      fontFamily: 'Fredoka, sans-serif',
      fontSize: '22px',
      fontWeight: '700',
      color: '#FFFFFF',
      stroke: '#3E1675',
      strokeThickness: 5
    }).setOrigin(0.5);
    container.add(shadow);

    const label = this.add.text(0, 0, text, {
      fontFamily: 'Fredoka, sans-serif',
      fontSize: '22px',
      fontWeight: '700',
      color: colorHex === 0xD81B7A ? '#FFD93D' : '#FFFFFF'
    }).setOrigin(0.5);
    container.add(label);

    container.setDepth(50);
    this.tweens.add({
      targets: container,
      y: y - 45,
      alpha: 0,
      scale: 1.25,
      duration: 750,
      ease: 'Quad.easeOut',
      onComplete: () => container.destroy()
    });
  }

  spawnHitParticles(x, y, hexColor) {
    const count = 12;
    for (let i = 0; i < count; i++) {
      const p = this.add.graphics();
      const colorVal = parseInt(hexColor.replace('#', '0x'), 16);
      p.fillStyle(colorVal, 1);
      p.fillCircle(0, 0, Phaser.Math.Between(3, 7));
      p.x = x;
      p.y = y;
      p.setDepth(40);

      const angle = (i / count) * Math.PI * 2;
      const speed = Phaser.Math.Between(80, 220);
      const targetX = x + Math.cos(angle) * speed;
      const targetY = y + Math.sin(angle) * speed;

      this.tweens.add({
        targets: p,
        x: targetX,
        y: targetY,
        alpha: 0,
        scale: 0.2,
        duration: Phaser.Math.Between(400, 650),
        ease: 'Quad.easeOut',
        onComplete: () => p.destroy()
      });
    }
  }

  emitTrailDot(x, y, hexColor) {
    const dot = this.add.graphics();
    const colorVal = parseInt(hexColor.replace('#', '0x'), 16);
    dot.fillStyle(colorVal, 0.65);
    dot.fillCircle(0, 0, 4);
    dot.x = x;
    dot.y = y;
    dot.setDepth(15);

    this.tweens.add({
      targets: dot,
      alpha: 0,
      scale: 0.1,
      duration: 350,
      ease: 'Linear',
      onComplete: () => dot.destroy()
    });
  }

  pauseGame() {
    if (this.isGameOver) return;
    this.isPaused = true;
    this.physics.pause();
    this.pauseMenu.show();
  }

  resumeGame() {
    this.isPaused = false;
    this.physics.resume();
    this.pauseMenu.hide();
  }

  restartGame() {
    this.pauseMenu.hide();
    this.scene.restart();
  }

  goToHome() {
    this.pauseMenu.hide();
    this.scene.start('HomeScene');
  }

  triggerGameOver() {
    this.isGameOver = true;
    audioManager.playGameOver();
    saveManager.saveHighScore(this.scoreManager.getHighScore());

    this.time.delayedCall(700, () => {
      this.scene.start('GameOverScene', {
        finalScore: this.scoreManager.getScore(),
        highScore: this.scoreManager.getHighScore(),
        maxCombo: this.comboManager.getMaxCombo(),
        isNewHighScore: this.scoreManager.isNewHighScore()
      });
    });
  }
}
