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
} from '../config.js';
import Horde from '../entities/Horde.js';
import SpawnManager from '../systems/SpawnManager.js';
import ParallaxBg from '../systems/ParallaxBg.js';
import DifficultyManager from '../systems/DifficultyManager.js';
import HUD from '../ui/HUD.js';

export default class GameScene extends Phaser.Scene {
  constructor() {
    super({ key: 'GameScene' });
  }

  create() {
    this.isGameOver = false;
    this.distance = 0;
    this.jumpHeldTime = 0;
    this.isJumpPressed = false;
    this.jumpTriggered = false;

    // Systems
    this.difficulty = new DifficultyManager();
    this.parallax = new ParallaxBg(this);
    this.spawnManager = new SpawnManager(this);
    this.horde = new Horde(this);

    // Initialize horde with 1 lion
    this.horde.init(150, GROUND_Y - 30);

    // HUD
    this.hud = new HUD(this);

    // Setup collisions
    this.setupCollisions();

    // Setup input
    this.setupInput();

    // Camera fade in
    this.cameras.main.fadeIn(300, 0, 0, 0);

    // Dust particles behind horde
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

  setupCollisions() {
    // Ground collision
    this.physics.add.collider(this.horde.group, this.spawnManager.groundGroup);
  }

  setupInput() {
    // Keyboard: Space bar or Up Arrow
    this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    this.upKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.UP);

    // Pointer (click/tap)
    this.input.on('pointerdown', () => {
      this.onJumpStart();
    });

    this.input.on('pointerup', () => {
      this.onJumpEnd();
    });
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

    // Update speed
    const speed = this.difficulty.update(this.distance);

    // Update distance
    this.distance += speed * dt / 10; // Convert pixels to "meters"

    // Handle jump input
    this.handleJumpInput(delta);

    // Update parallax
    this.parallax.update(speed);

    // Update spawn manager
    this.spawnManager.update(speed, this.distance);

    // Update horde
    this.horde.update();

    // Check collisions manually
    this.checkCollisions();

    // Update HUD
    this.hud.update(this.horde.count, this.distance, speed);

    // Update dust particles
    this.updateDust();

    // Check game over
    if (this.horde.isDead) {
      this.gameOver();
    }
  }

  handleJumpInput(delta) {
    // Space or Up key handling
    const isKeyDown = this.spaceKey.isDown || this.upKey.isDown;
    const isKeyUp = this.spaceKey.isUp && this.upKey.isUp;
    
    if (isKeyDown && !this.isJumpPressed) {
      this.onJumpStart();
    } else if (isKeyUp && this.isJumpPressed && !this.input.activePointer.isDown) {
      this.onJumpEnd();
    }

    if (this.isJumpPressed) {
      this.jumpHeldTime += delta;

      if (!this.jumpTriggered) {
        // Trigger jump on first frame
        const isHolding = this.jumpHeldTime > JUMP_HOLD_DURATION;
        this.horde.jump(isHolding);
        this.jumpTriggered = true;

        // Play jump sound
        try {
          this.sound.play('sfx_jump', { volume: 0.3 });
        } catch (e) { /* Audio may not be ready */ }
      } else if (this.jumpHeldTime > 50 && this.jumpHeldTime < JUMP_HOLD_DURATION) {
        // Apply extra upward force while holding (for long jump)
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

    // (Ground collisions are handled automatically by the collider setup in create)

    // Check lions falling off screen (fell into hole)
    for (let i = lions.length - 1; i >= 0; i--) {
      const lion = lions[i];
      if (lion.y > GAME_HEIGHT + 50) {
        // This lion fell into a hole - cascade death from this point
        this.horde.removeLionSprite(lion, true);

        try {
          this.sound.play('sfx_death', { volume: 0.4 });
        } catch (e) { /* Audio may not be ready */ }
        break; // Process one death per frame to avoid index issues
      }
    }

    // Check lion vs obstacles (eagles, rivers)
    for (const obs of this.spawnManager.obstacles) {
      if (obs.type === 'hole') continue; // Holes are handled by falling

      for (let i = lions.length - 1; i >= 0; i--) {
        const lion = lions[i];
        if (!lion.active || lion.isDead) continue;

        if (this.physics.overlap(lion, obs.sprite)) {
          if (obs.type === 'river') {
            // River: cascade death
            this.horde.removeLionSprite(lion, true);
          } else {
            // Eagle: single death
            this.horde.removeLionSprite(lion, false);
          }

          try {
            this.sound.play('sfx_death', { volume: 0.4 });
          } catch (e) { /* Audio may not be ready */ }

          // Screen shake
          this.cameras.main.shake(150, 0.005);
          break;
        }
      }
    }

    // Check lion vs animals (conversion)
    for (let i = this.spawnManager.animals.length - 1; i >= 0; i--) {
      const animal = this.spawnManager.animals[i];
      if (!animal.active) continue;

      const leader = lions[0];
      if (!leader || !leader.active) continue;

      if (this.physics.overlap(leader, animal)) {
        this.convertAnimal(animal);
        break; // One conversion per frame
      }
    }
  }

  convertAnimal(animal) {
    // Flash effect on animal
    const flashX = animal.x;
    const flashY = animal.y;

    // Conversion particles
    const particles = this.add.particles(flashX, flashY, 'particle', {
      speed: { min: 80, max: 200 },
      scale: { start: 1.2, end: 0 },
      tint: [0xe8a628, 0xffd700, 0xff8c00],
      lifespan: 400,
      quantity: 12,
      emitting: false,
    });
    particles.explode(12);
    this.time.delayedCall(500, () => particles.destroy());

    // Remove animal
    this.spawnManager.removeAnimal(animal);
    animal.destroy();

    // Add new lion to horde
    const lastLion = this.horde.lions[this.horde.lions.length - 1];
    this.horde.addLion(
      lastLion ? lastLion.x - 38 : 120,
      GROUND_Y - 30
    );

    // Collide new lion with ground
    const newLion = this.horde.lions[this.horde.lions.length - 1];
    if (newLion) {
      this.physics.collide(newLion, this.spawnManager.groundGroup);
    }

    // Play bite sound
    try {
      this.sound.play('sfx_bite', { volume: 0.5 });
    } catch (e) { /* Audio may not be ready */ }
  }

  updateDust() {
    const leader = this.horde.leader;
    if (leader && leader.active && !leader.isDead) {
      if (leader.body.blocked.down || leader.body.touching.down) {
        this.dustEmitter.setPosition(leader.x - 20, leader.y + 16);
        this.dustEmitter.emitting = true;
      } else {
        this.dustEmitter.emitting = false;
      }
    } else {
      this.dustEmitter.emitting = false;
    }
  }

  gameOver() {
    if (this.isGameOver) return;
    this.isGameOver = true;

    // Play roar
    try {
      this.sound.play('sfx_roar', { volume: 0.6 });
    } catch (e) { /* Audio may not be ready */ }

    // Screen flash
    this.cameras.main.flash(300, 255, 0, 0, true);
    this.cameras.main.shake(300, 0.01);

    // Save high score
    const highScore = parseInt(localStorage.getItem('lionTsunamiHighScore') || '0');
    const finalDistance = Math.floor(this.distance);
    if (finalDistance > highScore) {
      localStorage.setItem('lionTsunamiHighScore', finalDistance.toString());
    }

    // Transition to game over
    this.time.delayedCall(800, () => {
      this.scene.start('GameOverScene', {
        distance: finalDistance,
        highScore: Math.max(finalDistance, highScore),
      });
    });
  }
}
