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
import { SettingsMenu } from '../ui/SettingsMenu.js';

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

    // Ambient floating dust particles
    this.createAmbientParticles();

    // 7. Spawn Initial Candy
    this.spawnNextCandy();

    // 8. Pause Menu
    this.pauseMenu = new PauseMenu(this, {
      onResume: () => this.resumeGame(),
      onRestart: () => this.restartGame(),
      onHome: () => this.goToHome(),
      onSettings: () => this.openSettings()
    });

    // 8b. Settings Menu
    this.settingsMenu = new SettingsMenu(this, {
      onClose: () => {
        // Return to pause menu if still paused
        if (this.isPaused) {
          this.pauseMenu.show();
        }
      }
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

      const readyCandy = this.spawner.getActiveCandy();
      if (readyCandy) {
        readyCandy.resetSquash();
      }

      if (this.isPaused || this.isGameOver || this.activeFlyingCandy) return;

      const candy = this.spawner.getActiveCandy();
      if (!candy || candy.isFlying) return;

      const duration = this.time.now - this.pointerStartTime;
      const throwData = this.inputManager.calculateThrowVelocity({
        startX: this.pointerStartX,
        startY: this.pointerStartY,
        currentX: pointer.x,
        currentY: pointer.y,
        durationMs: duration
      });

      // Launch candy using unified calculation
      if (throwData.isValid && throwData.vy < -50) {
        this.launchActiveCandy(candy, throwData.vx, throwData.vy);
        audioManager.triggerHaptic(25);
      }
    });
  }

  drawAimLine(startX, startY, currentX, currentY) {
    this.aimGraphics.clear();
    this.slingGraphics.clear();
    const candy = this.spawner.getActiveCandy();
    if (!candy) return;

    // Use unified velocity and angle calculation
    const duration = this.time.now - this.pointerStartTime;
    const throwData = this.inputManager.calculateThrowVelocity({
      startX,
      startY,
      currentX,
      currentY,
      durationMs: duration
    });

    // Squash candy slightly along pull distance
    const dragDist = Math.hypot(currentX - startX, currentY - startY);
    const squashFactor = Math.min(0.2, dragDist / 350);
    candy.setSquash(1 + squashFactor * 0.35, 1 - squashFactor * 0.5);

    // If pulling down in slingshot mode, draw visible elastic rubber band
    if (throwData.isSlingshot) {
      this.slingGraphics.lineStyle(4, 0x6B2FB3, 0.85);
      this.slingGraphics.beginPath();
      this.slingGraphics.moveTo(145, 750);
      this.slingGraphics.lineTo(currentX, currentY);
      this.slingGraphics.lineTo(245, 750);
      this.slingGraphics.strokePath();
    }

    if (!throwData.isValid) return;

    // Simulate forward path using the exact launch velocity and standard gravity
    const dt = 0.04;
    const gravity = PHYSICS.GRAVITY_Y;
    let currX = candy.x;
    let currY = candy.y;
    let simVx = throwData.vx;
    let simVy = throwData.vy;

    let isAimedAtMouth = false;
    let testX = candy.x;
    let testY = candy.y;
    let testVx = throwData.vx;
    let testVy = throwData.vy;

    for (let j = 0; j < 30; j++) {
      testX += testVx * dt;
      testY += testVy * dt + 0.5 * gravity * dt * dt;
      testVy += gravity * dt;
      const collisionCheck = this.collisionManager.checkMouthCollision(testX, testY);
      if (collisionCheck.hit) {
        isAimedAtMouth = true;
        break;
      }
    }

    const arcColor = isAimedAtMouth ? 0x38C964 : 0x8E5BD6; // Luminous green on trajectory lock
    const dotColor = isAimedAtMouth ? 0xFFFFFF : 0xFFD93D;
    this.aimGraphics.lineStyle(4, arcColor, isAimedAtMouth ? 0.95 : 0.7);

    for (let i = 0; i < 12; i++) {
      const nextX = currX + simVx * dt;
      const nextY = currY + simVy * dt + 0.5 * gravity * dt * dt;
      simVy += gravity * dt;

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

    // Haptic feedback for successful catch
    if (isPerfect) {
      audioManager.triggerHaptic([45, 50, 60]);
    } else {
      audioManager.triggerHaptic([35, 40]);
    }

    // Crunchy munch chewing sound
    audioManager.playCrunch();

    // Combo system update
    const comboInfo = this.comboManager.registerHit();
    this.hud.showCombo(comboInfo.multiplier);
    audioManager.setComboLevel(comboInfo.multiplier);

    // Scoring system update (single authoritative calculation)
    const scoreInfo = this.scoreManager.addHit({
      perfect: isPerfect,
      comboMultiplier: comboInfo.multiplier
    });

    this.hud.updateScore(this.scoreManager.getScore(), this.scoreManager.getHighScore());

    // Character eating or celebration animation
    if (isPerfect) {
      this.character.playCelebrationAnimation();
    } else {
      this.character.playEatingAnimation();
    }

    // Audio & Visual popups
    if (isPerfect) {
      audioManager.playPerfectHit();
      this.showFloatingPopup(candy.x, candy.y - 20, `+${scoreInfo.addedPoints} Perfect!`, 0xD81B7A);
    } else {
      audioManager.playHit();
      this.showFloatingPopup(candy.x, candy.y - 20, `+${scoreInfo.addedPoints}`, 0x4B1F86);
    }

    if (comboInfo.isMilestone) {
      audioManager.playCombo();
    }

    // Spawn celebration particle burst
    this.spawnHitParticles(candy.x, candy.y, candy.candyData.color, isPerfect);

    // Save high score if beaten
    saveManager.saveHighScore(this.scoreManager.getHighScore());

    // Spawn next candy after short delay
    const spawnDelay = isPerfect ? 600 : 450;
    this.time.delayedCall(spawnDelay, () => {
      if (!this.isGameOver && !this.isPaused) {
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
    audioManager.triggerHaptic(120);

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
        if (!this.isGameOver && !this.isPaused) {
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

  spawnHitParticles(x, y, hexColor, isPerfect = false) {
    const count = isPerfect ? 24 : 14;
    const colorVal = parseInt(hexColor.replace('#', '0x'), 16);

    for (let i = 0; i < count; i++) {
      const p = this.add.graphics();
      const isGoldSparkle = isPerfect && (i % 3 === 0);
      p.fillStyle(isGoldSparkle ? 0xFFD93D : colorVal, 1);
      p.fillCircle(0, 0, isGoldSparkle ? 7 : Phaser.Math.Between(3, 6));
      p.x = x;
      p.y = y;
      p.setDepth(40);

      const angle = (i / count) * Math.PI * 2 + Phaser.Math.FloatBetween(-0.2, 0.2);
      const speed = isPerfect ? Phaser.Math.Between(100, 260) : Phaser.Math.Between(70, 190);
      const targetX = x + Math.cos(angle) * speed;
      const targetY = y + Math.sin(angle) * speed;

      this.tweens.add({
        targets: p,
        x: targetX,
        y: targetY,
        alpha: 0,
        scale: 0.15,
        duration: Phaser.Math.Between(450, 750),
        ease: 'Cubic.easeOut',
        onComplete: () => p.destroy()
      });
    }
  }

  createAmbientParticles() {
    // Ambient floating dust motes for gentle atmospheric depth
    for (let i = 0; i < 8; i++) {
      const mote = this.add.graphics();
      mote.fillStyle(0xFFFFFF, Phaser.Math.FloatBetween(0.2, 0.45));
      mote.fillCircle(0, 0, Phaser.Math.Between(2, 4));
      mote.x = Phaser.Math.Between(20, 370);
      mote.y = Phaser.Math.Between(150, 750);
      mote.setDepth(5);

      this.tweens.add({
        targets: mote,
        y: mote.y - Phaser.Math.Between(60, 120),
        x: mote.x + Phaser.Math.Between(-30, 30),
        alpha: { from: mote.alpha, to: 0.05 },
        duration: Phaser.Math.Between(3500, 6000),
        repeat: -1,
        yoyo: true,
        ease: 'Sine.easeInOut'
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
    if (this.isGameOver || this.isPaused) return;
    this.isPaused = true;

    // 1. Freeze Arcade Physics
    this.physics.pause();

    // 2. Comprehensive tween freeze
    this.tweens.pauseAll();

    // 3. Pause scene timer pool to prevent delayed callbacks from executing
    this.time.paused = true;

    // 4. Pause audio BGM
    audioManager.pauseBGM();

    // 5. Clear aiming/slingshot overlays
    this.isPointerDown = false;
    this.aimGraphics.clear();
    this.slingGraphics.clear();

    // 6. Show pause dialog
    this.pauseMenu.show();
  }

  resumeGame() {
    if (!this.isPaused || this.isGameOver) return;
    this.isPaused = false;

    // 1. Resume Arcade Physics
    this.physics.resume();

    // 2. Resume scene tweens
    this.tweens.resumeAll();

    // 3. Resume scene timer pool
    this.time.paused = false;

    // 4. Resume audio BGM
    audioManager.resumeBGM();

    // 5. Hide pause dialog
    this.pauseMenu.hide();
  }

  openSettings() {
    this.pauseMenu.hide();
    this.settingsMenu.show();
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
