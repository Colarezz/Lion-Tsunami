// ============================================================
// DifficultyManager - Controls game speed progression
// ============================================================

import { BASE_SPEED, MAX_SPEED, SPEED_INCREMENT } from '../config.js';

export default class DifficultyManager {
  constructor() {
    this.currentSpeed = BASE_SPEED;
    this.lastSpeedIncreaseDistance = 0;
  }

  update(distance) {
    const speedSteps = Math.floor(distance / 500);
    this.currentSpeed = Math.min(
      BASE_SPEED + speedSteps * SPEED_INCREMENT,
      MAX_SPEED
    );
    return this.currentSpeed;
  }

  reset() {
    this.currentSpeed = BASE_SPEED;
    this.lastSpeedIncreaseDistance = 0;
  }
}
