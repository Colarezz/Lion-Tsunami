// ============================================================
// GameScene - Main gameplay scene
// ============================================================

import Phaser from 'phaser';
import {
  GAME_WIDTH, GAME_HEIGHT, GROUND_Y,
  JUMP_VELOCITY, JUMP_HOLD_VELOCITY, JUMP_HOLD_DURATION,
  SCORE_PER_METER, MULTIPLIER_THRESHOLDS, COIN_VALUE,
} from '../config.js';
import Horde from '../entities/Horde.js';
import SpawnManager from '../systems/SpawnManager.js';
import ParallaxBg from '../systems/ParallaxBg.js';
import DifficultyManager from '../systems/DifficultyManager.js';
import AudioManager from '../systems/AudioManager.js';
import HUD from '../ui/HUD.js';

export default class GameScene extends Phaser.Scene {
  constructor() { super({ key: 'GameScene' }); }

  create() {
    this.isGameOver = false;
    this.distance = 0;
    this.score = 0;
    this.coinsCollected = 0;
    this.jumpHeldTime = 0;
    this.isJumpPressed = false;
    this.jumpTriggered = false;
    this._lastObstacleHitTime = 0;

    // Load saved coins
    this.totalCoins = parseInt(localStorage.getItem('lionTsunamiCoins') || '0');

    this.audio = new AudioManager();
    this.audio.init();

    this.difficulty = new DifficultyManager();
    this.parallax = new ParallaxBg(this);
    this.spawnManager = new SpawnManager(this);
    this.horde = new Horde(this);
    this.horde.init(150, GROUND_Y - 30);
    this.physics.add.collider(this.horde.group, this.spawnManager.groundGroup);
    this.hud = new HUD(this);
    this.setupInput();
    this.cameras.main.fadeIn(300, 0, 0, 0);

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

    // Start background music
    this.audio.startMusic();
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

    const multiplier = this._getMultiplier();
    this.score += speed * dt / 10 * SCORE_PER_METER * multiplier;

    this.handleJumpInput(delta);
    this.parallax.update(speed);
    this.spawnManager.update(speed, this.distance);
    this.horde.update();
    this.checkCollisions();
    this.checkCoinCollisions();
    this.hud.update(this.horde.count, this.distance, speed, Math.floor(this.score), multiplier, this.totalCoins + this.coinsCollected);
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

  checkCoinCollisions() {
    const lions = this.horde.getSprites();
    if (lions.length === 0) return;
    const leader = lions[0];
    if (!leader || !leader.active) return;

    for (let i = this.spawnManager.coins.length - 1; i >= 0; i--) {
      const coinData = this.spawnManager.coins[i];
      if (!coinData.sprite.active) continue;

      if (this.physics.overlap(leader, coinData.sprite)) {
        this.coinsCollected += COIN_VALUE;
        // Sparkle effect
        const particles = this.add.particles(coinData.sprite.x, coinData.sprite.y, 'particle', {
          speed: { min: 40, max: 100 },
          scale: { start: 0.8, end: 0 },
          tint: [0xffd700, 0xffec8b, 0xffa500],
          lifespan: 250,
          quantity: 5,
          emitting: false,
        });
        particles.explode(5);
        this.time.delayedCall(300, () => particles.destroy());

        coinData.sprite.destroy();
        this.spawnManager.removeCoin(coinData);
        this.audio.playCoin();
      }
    }
  }

  checkCollisions() {
    const lions = this.horde.getSprites();
    if (lions.length === 0) return;
    const now = this.time.now;

    // Lions falling into holes
    for (let i = lions.length - 1; i >= 0; i--) {
      const lion = lions[i];
      if (lion.y > GAME_HEIGHT + 50) {
        this.horde.removeLionSprite(lion, true);
        this.audio.playDeath();
        this.cameras.main.shake(150, 0.006);
        break;
      }
    }

    // Obstacles
    for (let oi = this.spawnManager.obstacles.length - 1; oi >= 0; oi--) {
      const obs = this.spawnManager.obstacles[oi];
      if (obs.type === 'hole') continue;

      for (let li = lions.length - 1; li >= 0; li--) {
        const lion = lions[li];
        if (!lion.active || lion.isDead) continue;

        if (this.physics.overlap(lion, obs.sprite)) {
          if (now - this._lastObstacleHitTime < 300) break;
          this._lastObstacleHitTime = now;

          if (obs.type === 'river') {
            this.horde.removeLionSprite(lion, true);
          } else {
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

    // Projectiles
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

    // Animals - use the new unified system
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
          // Not enough lions - blocks like obstacle
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
    const { sprite, scoreValue, lionsGained } = animalData;
    this.score += scoreValue;

    const particles = this.add.particles(sprite.x, sprite.y, 'particle', {
      speed: { min: 80, max: 200 },
      scale: { start: 1.2, end: 0 },
      tint: [0xe8a628, 0xffd700, 0xff8c00],
      lifespan: 400,
      quantity: lionsGained > 2 ? 20 : 10,
      emitting: false,
    });
    particles.explode(lionsGained > 2 ? 20 : 10);
    this.time.delayedCall(500, () => particles.destroy());

    // Destroy label
    if (animalData.label && animalData.label.active) animalData.label.destroy();

    this.spawnManager.removeAnimal(animalData);
    sprite.destroy();

    for (let i = 0; i < lionsGained; i++) {
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

    this.audio.stopMusic();
    this.audio.playRoar();
    this.cameras.main.flash(300, 255, 0, 0, true);
    this.cameras.main.shake(300, 0.01);

    // Save coins
    const newTotal = this.totalCoins + this.coinsCollected;
    localStorage.setItem('lionTsunamiCoins', newTotal.toString());

    const finalScore = Math.floor(this.score);
    const finalDistance = Math.floor(this.distance);
    const highScore = parseInt(localStorage.getItem('savannaHighScore') || '0');
    if (finalScore > highScore) {
      localStorage.setItem('savannaHighScore', finalScore.toString());
    }

    this.time.delayedCall(800, () => {
      this.scene.start('GameOverScene', {
        distance: finalDistance,
        score: finalScore,
        highScore: Math.max(finalScore, highScore),
        coinsCollected: this.coinsCollected,
      });
    });
  }
}
