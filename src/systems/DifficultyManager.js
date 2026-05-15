// ============================================================
// DifficultyManager - Controls game speed progression
// ============================================================

import { BASE_SPEED, MAX_SPEED, SPEED_INCREMENT } from '../config.js';

export default class DifficultyManager {
  constructor() {
    this.currentSpeed = BASE_SPEED;
  }

  update(distance) {
    // Speed increases every 300m (was 500m) for faster ramp
    const speedSteps = Math.floor(distance / 300);
    this.currentSpeed = Math.min(
      BASE_SPEED + speedSteps * SPEED_INCREMENT,
      MAX_SPEED
    );
    return this.currentSpeed;
  }

  reset() {
    this.currentSpeed = BASE_SPEED;
  }
}
