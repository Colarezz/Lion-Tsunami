// ============================================================
// HUD - Heads-Up Display (with coins)
// ============================================================

import { GAME_WIDTH } from '../config.js';

export default class HUD {
  constructor(scene) {
    this.scene = scene;

    const bar = scene.add.graphics();
    bar.fillStyle(0x000000, 0.35);
    bar.fillRect(0, 0, GAME_WIDTH, 44);
    bar.setDepth(199);

    // Lion counter
    this.lionIcon = scene.add.sprite(28, 22, 'lion_run', 0).setScale(0.7).setDepth(201);
    this.lionIcon.play('lion_run_anim');
    this.lionCountText = scene.add.text(54, 10, 'x 1', {
      fontFamily: '"Arial Black", Arial, sans-serif', fontSize: '20px',
      color: '#ffffff', stroke: '#000', strokeThickness: 4,
    }).setDepth(201);

    // Score
    this.scoreText = scene.add.text(GAME_WIDTH / 2, 6, '0', {
      fontFamily: '"Arial Black", Arial, sans-serif', fontSize: '22px',
      color: '#ffd700', stroke: '#000', strokeThickness: 4,
    }).setOrigin(0.5, 0).setDepth(201);

    // Multiplier
    this.multText = scene.add.text(GAME_WIDTH / 2 + 60, 10, '', {
      fontFamily: '"Arial Black", Arial, sans-serif', fontSize: '14px',
      color: '#ff8c00', stroke: '#000', strokeThickness: 3,
    }).setDepth(201);

    // Coins
    this.coinText = scene.add.text(GAME_WIDTH - 12, 26, '🪙 0', {
      fontFamily: '"Arial Black", Arial, sans-serif', fontSize: '14px',
      color: '#ffd700', stroke: '#000', strokeThickness: 3,
    }).setOrigin(1, 0).setDepth(201);

    // Distance
    this.distanceText = scene.add.text(GAME_WIDTH - 12, 8, '0 m', {
      fontFamily: 'Arial, sans-serif', fontSize: '13px',
      color: '#ffffffaa', stroke: '#000', strokeThickness: 2,
    }).setOrigin(1, 0).setDepth(201);

    this._lastCount = -1;
  }

  update(lionCount, distance, speed, score, multiplier, coins) {
    this.lionCountText.setText(`x ${lionCount}`);
    this.scoreText.setText(score.toLocaleString());
    this.distanceText.setText(`${Math.floor(distance)} m`);
    this.coinText.setText(`🪙 ${coins}`);
    this.multText.setText(multiplier > 1 ? `x${multiplier}` : '');

    if (this._lastCount !== lionCount) {
      this.scene.tweens.add({
        targets: this.lionCountText,
        scaleX: 1.5, scaleY: 1.5,
        duration: 120, yoyo: true, ease: 'Quad.easeOut',
      });
      if (lionCount < this._lastCount) {
        this.lionCountText.setColor('#ff4444');
        this.scene.time.delayedCall(300, () => this.lionCountText.setColor('#ffffff'));
      } else if (this._lastCount >= 0) {
        this.lionCountText.setColor('#44ff88');
        this.scene.time.delayedCall(300, () => this.lionCountText.setColor('#ffffff'));
      }
    }
    this._lastCount = lionCount;
  }
}
