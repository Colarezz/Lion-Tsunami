// ============================================================
// HUD - Heads-Up Display (lion counter + distance)
// ============================================================

import { GAME_WIDTH } from '../config.js';

export default class HUD {
  constructor(scene) {
    this.scene = scene;

    // Lion counter (top-left)
    this.lionIcon = scene.add.sprite(30, 28, 'lion_run', 0)
      .setScale(0.8)
      .setDepth(200);
    this.lionIcon.play('lion_run_anim');

    this.lionCountText = scene.add.text(55, 18, 'x 1', {
      fontFamily: '"Arial Black", Arial, sans-serif',
      fontSize: '22px',
      color: '#fff',
      stroke: '#000',
      strokeThickness: 4,
    }).setDepth(200);

    // Distance (top-center)
    this.distanceText = scene.add.text(GAME_WIDTH / 2, 18, '0 m', {
      fontFamily: '"Arial Black", Arial, sans-serif',
      fontSize: '20px',
      color: '#fff',
      stroke: '#000',
      strokeThickness: 4,
    }).setOrigin(0.5, 0).setDepth(200);

    // Speed indicator (top-right, subtle)
    this.speedText = scene.add.text(GAME_WIDTH - 15, 18, '', {
      fontFamily: 'Arial, sans-serif',
      fontSize: '12px',
      color: '#ffffff80',
      stroke: '#000',
      strokeThickness: 2,
    }).setOrigin(1, 0).setDepth(200);
  }

  update(lionCount, distance, speed) {
    this.lionCountText.setText(`x ${lionCount}`);
    this.distanceText.setText(`${Math.floor(distance)} m`);
    this.speedText.setText(`${Math.floor(speed)} px/s`);

    // Pulse effect when lion count changes
    if (this._lastCount !== undefined && this._lastCount !== lionCount) {
      this.scene.tweens.add({
        targets: this.lionCountText,
        scaleX: 1.4,
        scaleY: 1.4,
        duration: 150,
        yoyo: true,
        ease: 'Quad.easeOut',
      });

      // Flash red if losing lions
      if (lionCount < this._lastCount) {
        this.lionCountText.setColor('#ff4444');
        this.scene.time.delayedCall(300, () => {
          this.lionCountText.setColor('#fff');
        });
      } else {
        // Flash green if gaining
        this.lionCountText.setColor('#44ff44');
        this.scene.time.delayedCall(300, () => {
          this.lionCountText.setColor('#fff');
        });
      }
    }
    this._lastCount = lionCount;
  }
}
