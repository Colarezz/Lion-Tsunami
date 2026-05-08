// ============================================================
// Horde - Manages the group of lions following the leader
// ============================================================

import Lion from './Lion.js';
import {
  LION_SPACING,
  JUMP_VELOCITY,
  JUMP_HOLD_VELOCITY,
  CASCADE_JUMP_DELAY,
  GROUND_Y,
  MAX_HORDE_SIZE,
} from '../config.js';

export default class Horde {
  constructor(scene) {
    this.scene = scene;
    this.lions = [];
    this.group = scene.physics.add.group();
    this.leader = null;
    this.frameCount = 0;

    // Global trail: the leader records positions, followers replay them
    this.globalTrail = [];
  }

  /**
   * Initialize the horde with a single lion
   */
  init(x, y) {
    this.globalTrail = [];
    this.lions = [];
    this.addLion(x, y);
    this.leader = this.lions[0];
  }

  /**
   * Add a new lion at the back of the horde
   */
  addLion(x, y) {
    if (this.lions.length >= MAX_HORDE_SIZE) return;

    const lion = new Lion(this.scene, x, y);
    lion.setDepth(100 - this.lions.length);
    this.group.add(lion);

    // If there are existing lions, position behind the last one
    if (this.lions.length > 0) {
      const lastLion = this.lions[this.lions.length - 1];
      lion.x = lastLion.x - LION_SPACING;
      lion.y = lastLion.y;
    }

    this.lions.push(lion);

    // Flash effect on new lion
    this.scene.tweens.add({
      targets: lion,
      alpha: { from: 0.3, to: 1 },
      scaleX: { from: 1.5, to: 1 },
      scaleY: { from: 1.5, to: 1 },
      duration: 300,
      ease: 'Back.easeOut',
    });

    return lion;
  }

  /**
   * Make all lions jump with cascade delay
   */
  jump(isHolding) {
    const velocity = isHolding ? JUMP_HOLD_VELOCITY : JUMP_VELOCITY;

    this.lions.forEach((lion, index) => {
      if (lion.isDead) return;

      if (index === 0) {
        lion.jump(velocity);
      } else {
        this.scene.time.delayedCall(index * CASCADE_JUMP_DELAY, () => {
          if (!lion.isDead && lion.active) {
            lion.jump(velocity);
          }
        });
      }
    });
  }

  /**
   * Remove a lion at the given index.
   * If cascade is true, remove all lions from index onward (hole death).
   */
  removeLion(index, cascade = false) {
    if (index < 0 || index >= this.lions.length) return;

    if (cascade) {
      // Remove from index to end
      const removed = this.lions.splice(index);
      removed.forEach((lion, i) => {
        this.scene.time.delayedCall(i * 50, () => {
          lion.die(this.scene);
        });
      });
    } else {
      const lion = this.lions.splice(index, 1)[0];
      if (lion) lion.die(this.scene);
    }

    // Update leader reference
    if (this.lions.length > 0) {
      this.leader = this.lions[0];
    }
  }

  /**
   * Remove a specific lion sprite
   */
  removeLionSprite(lionSprite, cascade = false) {
    const index = this.lions.indexOf(lionSprite);
    if (index !== -1) {
      this.removeLion(index, cascade);
    }
  }

  /**
   * Update all lions - handle following logic
   */
  update() {
    this.frameCount++;

    if (this.lions.length === 0) return;

    const leader = this.lions[0];
    if (!leader || leader.isDead) return;

    // Leader records position
    this.globalTrail.push({
      x: leader.x,
      y: leader.y,
      onGround: leader.body.blocked.down || leader.body.touching.down,
    });

    // Keep trail manageable
    if (this.globalTrail.length > 2000) {
      this.globalTrail.splice(0, 500);
    }

    // Each follower replays the leader's trail with offset
    const trailSpacing = Math.round(LION_SPACING / 2.5); // frames of delay per lion

    for (let i = 1; i < this.lions.length; i++) {
      const lion = this.lions[i];
      if (lion.isDead || !lion.active) continue;

      const trailIndex = this.globalTrail.length - 1 - (i * trailSpacing);

      if (trailIndex >= 0 && trailIndex < this.globalTrail.length) {
        const pos = this.globalTrail[trailIndex];
        // Only follow X, let physics handle Y (gravity + jumps)
        lion.x = pos.x - (i * LION_SPACING * 0.3);
      } else {
        // Not enough trail data yet, just space out behind
        lion.x = leader.x - (i * LION_SPACING);
      }

      lion.update();
    }

    // Update leader
    leader.update();
  }

  /**
   * Get the number of alive lions
   */
  get count() {
    return this.lions.filter(l => !l.isDead && l.active).length;
  }

  /**
   * Check if horde is dead
   */
  get isDead() {
    return this.count === 0;
  }

  /**
   * Get all lion sprites for collision detection
   */
  getSprites() {
    return this.lions.filter(l => !l.isDead && l.active);
  }
}
