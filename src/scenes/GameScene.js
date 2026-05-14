// ============================================================
// GameScene - Main gameplay scene
// ============================================================

import Phaser from 'phaser';
import {
  GAME_WIDTH,
  GAME_HEIGHT,
  GROUND_Y,
  JUMP_VELOCITY,
  JUMP_HOLD_VELOCITY,
  JUMP_HOLD_DURATION,
  SCORE_PER_METER,
  SCORE_PER_SMALL_PREY,
  SCORE_PER_LARGE_PREY,
  MULTIPLIER_THRESHOLDS,
  BUFFALO_MIN_LIONS,
} from '../config.js';
import Horde from '../entities/Horde.js';
import SpawnManager from '../systems/SpawnManager.js';
import ParallaxBg from '../systems/ParallaxBg.js';
import DifficultyManager from '../systems/DifficultyManager.js';
import AudioManager from '../systems/AudioManager.js';
import HUD from '../ui/HUD.js';

export default class GameScene extends Phaser.Scene {
  constructor() {
    super({ key: 'GameScene' });
  }

  create() {
    this.isGameOver = false;
    this.distance = 0;
    this.score = 0;
    this.jumpHeldTime = 0;
    this.isJumpPressed = false;
    this.jumpTriggered = false;
    this._lastObstacleHitTime = 0; // debounce

    // Audio
    this.audio = new AudioManager();
    this.audio.init();

    // Systems (order matters — ground must exist before horde setup)
    this.difficulty = new DifficultyManager();
    this.parallax = new ParallaxBg(this);
    this.spawnManager = new SpawnManager(this);
    this.horde = new Horde(this);

    // Initialize horde with 1 lion
    this.horde.init(150, GROUND_Y - 30);

    // Ground collision (dynamic group — collider works on all children)
    this.physics.add.collider(this.horde.group, this.spawnManager.groundGroup);

    // HUD
    this.hud = new HUD(this);

    // Setup input
    this.setupInput();

    // Camera fade in
    this.cameras.main.fadeIn(300, 0, 0, 0);

    // Dust particles
    this.dustEmitter = this.add.particles(0, 0, 'particle', {
      speed: { min: 10, max: 30 },
      scale: { start: 0.5, end: 0 },
      tint: 0xc4903d,
      lifespan: 300,
      frequency: 80,
      emitting: false,
      angle: { min: 160, max: 200 },
    });
    this.dustEmitter.setDepth(50);
  }

  setupInput() {
    this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    this.upKey    = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.UP);

    this.input.on('pointerdown', () => { this.audio.resume(); this.onJumpStart(); });
    this.input.on('pointerup',   () => this.onJumpEnd());
  }

  onJumpStart() {
    if (this.isGameOver) return;
    this.isJumpPressed = true;
    this.jumpHeldTime = 0;
    this.jumpTriggered = false;
  }

  onJumpEnd() {
    this.isJumpPressed = false;
    this.jumpHeldTime = 0;
  }

  update(time, delta) {
    if (this.isGameOver) return;

    const dt = delta / 1000;
    const speed = this.difficulty.update(this.distance);

    this.distance += speed * dt / 10;

    // Score: distance + multiplier
    const multiplier = this._getMultiplier();
    this.score += speed * dt / 10 * SCORE_PER_METER * multiplier;

    this.handleJumpInput(delta);
    this.parallax.update(speed);
    this.spawnManager.update(speed, this.distance);
    this.horde.update();
    this.checkCollisions();
    this.hud.update(this.horde.count, this.distance, speed, Math.floor(this.score), multiplier);
    this.updateDust();

    if (this.horde.isDead) this.gameOver();
  }

  _getMultiplier() {
    const count = this.horde.count;
    let mult = 1;
    for (const t of MULTIPLIER_THRESHOLDS) {
      if (count >= t.count) mult = t.multiplier;
    }
    return mult;
  }

  handleJumpInput(delta) {
    const isKeyDown = this.spaceKey.isDown || this.upKey.isDown;
    const isKeyUp   = this.spaceKey.isUp   && this.upKey.isUp;

    if (isKeyDown && !this.isJumpPressed) {
      this.audio.resume();
      this.onJumpStart();
    } else if (isKeyUp && this.isJumpPressed && !this.input.activePointer.isDown) {
      this.onJumpEnd();
    }

    if (this.isJumpPressed) {
      this.jumpHeldTime += delta;

      if (!this.jumpTriggered) {
        this.horde.jump(false);
        this.jumpTriggered = true;
        this.audio.playJump();
      } else if (this.jumpHeldTime > 50 && this.jumpHeldTime < JUMP_HOLD_DURATION) {
        const leader = this.horde.leader;
        if (leader && leader.body && leader.body.velocity.y < 0) {
          leader.body.velocity.y = Math.max(leader.body.velocity.y, JUMP_HOLD_VELOCITY);
        }
      }
    }
  }

  checkCollisions() {
    const lions = this.horde.getSprites();
    if (lions.length === 0) return;
    const now = this.time.now;

    // ── Lions falling off screen into holes ──
    for (let i = lions.length - 1; i >= 0; i--) {
      const lion = lions[i];
      if (lion.y > GAME_HEIGHT + 50) {
        this.horde.removeLionSprite(lion, true);
        this.audio.playDeath();
        this.cameras.main.shake(150, 0.006);
        break;
      }
    }

    // ── Obstacles ──
    for (let oi = this.spawnManager.obstacles.length - 1; oi >= 0; oi--) {
      const obs = this.spawnManager.obstacles[oi];
      if (obs.type === 'hole') continue; // handled by fall detection

      for (let li = lions.length - 1; li >= 0; li--) {
        const lion = lions[li];
        if (!lion.active || lion.isDead) continue;

        if (this.physics.overlap(lion, obs.sprite)) {
          if (now - this._lastObstacleHitTime < 300) break; // debounce
          this._lastObstacleHitTime = now;

          if (obs.type === 'river') {
            this.horde.removeLionSprite(lion, true);
          } else {
            // tree / eagle / hunter — remove 1 lion
            this.horde.removeLionSprite(lion, false);
          }

          if (obs.type === 'hunter') {
            this.spawnManager.removeHunter(obs.sprite);
          }

          this.audio.playDeath();
          this.cameras.main.shake(180, 0.006);
          break;
        }
      }
    }

    // ── Projectiles from hunters ──
    for (let pi = this.spawnManager.projectiles.length - 1; pi >= 0; pi--) {
      const bullet = this.spawnManager.projectiles[pi];
      if (!bullet.active) continue;

      for (let li = lions.length - 1; li >= 0; li--) {
        const lion = lions[li];
        if (!lion.active || lion.isDead) continue;

        if (this.physics.overlap(lion, bullet)) {
          this.horde.removeLionSprite(lion, false);
          bullet.destroy();
          this.spawnManager.projectiles.splice(pi, 1);
          this.audio.playDeath();
          this.cameras.main.shake(100, 0.004);
          break;
        }
      }
    }

    // ── Animals ──
    const leader = lions[0];
    if (!leader || !leader.active) return;

    for (let ai = this.spawnManager.animals.length - 1; ai >= 0; ai--) {
      const animalData = this.spawnManager.animals[ai];
      if (!animalData.sprite.active) continue;

      if (this.physics.overlap(leader, animalData.sprite)) {
        const lionCount = this.horde.count;
        if (lionCount >= animalData.minLions) {
          this._convertAnimal(animalData);
        } else {
          // Buffalo blocks like an obstacle
          if (now - this._lastObstacleHitTime < 300) continue;
          this._lastObstacleHitTime = now;
          this.horde.removeLionSprite(leader, false);
          this.audio.playBuffaloBlock();
          this.cameras.main.shake(200, 0.008);
        }
        break;
      }
    }
  }

  _convertAnimal(animalData) {
    const { sprite, type } = animalData;
    const isLarge = (type === 'buffalo');
    const scoreGain = isLarge ? SCORE_PER_LARGE_PREY : SCORE_PER_SMALL_PREY;
    this.score += scoreGain;

    // Burst particles
    const particles = this.add.particles(sprite.x, sprite.y, 'particle', {
      speed: { min: 80, max: 200 },
      scale: { start: 1.2, end: 0 },
      tint: [0xe8a628, 0xffd700, 0xff8c00],
      lifespan: 400,
      quantity: isLarge ? 20 : 10,
      emitting: false,
    });
    particles.explode(isLarge ? 20 : 10);
    this.time.delayedCall(500, () => particles.destroy());

    this.spawnManager.removeAnimal(animalData);
    sprite.destroy();

    // Add lion(s) to horde
    const count = isLarge ? 3 : 1;
    for (let i = 0; i < count; i++) {
      const last = this.horde.lions[this.horde.lions.length - 1];
      this.horde.addLion(last ? last.x - 38 : 120, GROUND_Y - 30);
    }

    this.audio.playBite();
  }

  updateDust() {
    const leader = this.horde.leader;
    if (leader && leader.active && !leader.isDead &&
        (leader.body.blocked.down || leader.body.touching.down)) {
      this.dustEmitter.setPosition(leader.x - 20, leader.y + 16);
      this.dustEmitter.emitting = true;
    } else {
      this.dustEmitter.emitting = false;
    }
  }

  gameOver() {
    if (this.isGameOver) return;
    this.isGameOver = true;

    this.audio.playRoar();
    this.cameras.main.flash(300, 255, 0, 0, true);
    this.cameras.main.shake(300, 0.01);

    const finalScore    = Math.floor(this.score);
    const finalDistance = Math.floor(this.distance);
    const highScore     = parseInt(localStorage.getItem('savannaHighScore') || '0');
    if (finalScore > highScore) {
      localStorage.setItem('savannaHighScore', finalScore.toString());
    }

    this.time.delayedCall(800, () => {
      this.scene.start('GameOverScene', {
        distance: finalDistance,
        score: finalScore,
        highScore: Math.max(finalScore, highScore),
      });
    });
  }
}
