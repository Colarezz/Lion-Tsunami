// ============================================================
// Lion Entity - Individual lion in the horde
// ============================================================

import Phaser from 'phaser';

export default class Lion extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y) {
    super(scene, x, y, 'lion_run', 0);

    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.setSize(32, 32);
    this.setOffset(8, 14);
    this.play('lion_run_anim');

    this.isJumping = false;
    this.isDead = false;

    // Trail buffer: stores past positions for followers to replicate
    this.trailBuffer = [];
    this.trailIndex = 0;
  }

  /**
   * Record current position into the trail buffer.
   */
  recordPosition() {
    this.trailBuffer.push({ x: this.x, y: this.y, vy: this.body.velocity.y });
    // Keep buffer manageable
    if (this.trailBuffer.length > 1200) {
      this.trailBuffer.splice(0, 200);
    }
  }

  /**
   * Jump with given velocity
   */
  jump(velocity) {
    if (this.body.blocked.down || this.body.touching.down) {
      this.body.setVelocityY(velocity);
      this.isJumping = true;
      this.setTexture('lion_jump');
    }
  }

  /**
   * Called every frame
   */
  update() {
    if (this.isDead) return;

    // Switch back to run animation when landing
    if (this.isJumping && (this.body.blocked.down || this.body.touching.down)) {
      this.isJumping = false;
      this.play('lion_run_anim', true);
    }
  }

  /**
   * Kill this lion with an effect
   */
  die(scene) {
    if (this.isDead) return;
    this.isDead = true;

    // Death particles
    const particles = scene.add.particles(this.x, this.y, 'particle', {
      speed: { min: 50, max: 150 },
      scale: { start: 1, end: 0 },
      tint: [0xe8a628, 0xb06810, 0xff6600],
      lifespan: 400,
      quantity: 8,
      emitting: false,
    });
    particles.explode(8);
    scene.time.delayedCall(500, () => particles.destroy());

    this.destroy();
  }
}
