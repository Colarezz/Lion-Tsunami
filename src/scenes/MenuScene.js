// ============================================================
// MenuScene - Title screen with shop button
// ============================================================

import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../config.js';

export default class MenuScene extends Phaser.Scene {
  constructor() { super({ key: 'MenuScene' }); }

  create() {
    const cx = GAME_WIDTH / 2;
    const cy = GAME_HEIGHT / 2;
    const coins = parseInt(localStorage.getItem('lionTsunamiCoins') || '0');

    this.add.image(cx, GAME_HEIGHT / 2, 'bg_sky').setDisplaySize(GAME_WIDTH, GAME_HEIGHT);

    for (let x = 0; x < GAME_WIDTH; x += 64) {
      this.add.image(x + 32, GAME_HEIGHT - 36, 'ground_tile').setDisplaySize(64, 72);
    }

    this.add.text(cx + 3, 83, '🦁 LION TSUNAMI', {
      fontFamily: '"Arial Black", Arial, sans-serif',
      fontSize: '38px', color: '#000', fontStyle: 'bold',
    }).setOrigin(0.5).setAlpha(0.25);

    const title = this.add.text(cx, 80, '🦁 LION TSUNAMI', {
      fontFamily: '"Arial Black", Arial, sans-serif',
      fontSize: '38px', color: '#e8a628', fontStyle: 'bold',
      stroke: '#5a2d00', strokeThickness: 6,
    }).setOrigin(0.5);

    this.tweens.add({
      targets: title, y: 90, duration: 1600,
      ease: 'Sine.easeInOut', yoyo: true, repeat: -1,
    });

    this.add.text(cx, 128, 'Controle a horda. Domine a savana.', {
      fontFamily: 'Arial, sans-serif', fontSize: '15px',
      color: '#fff8e0', fontStyle: 'italic',
    }).setOrigin(0.5).setAlpha(0.85);

    // Play button
    this._makeButton(cx, cy + 20, '▶  JOGAR', 0xe8a628, () => {
      this.cameras.main.fadeOut(400, 0, 0, 0);
      this.time.delayedCall(400, () => this.scene.start('GameScene'));
    });

    // Shop button
    this._makeButton(cx, cy + 80, '🛒  LOJA', 0x9b59b6, () => {
      this.cameras.main.fadeOut(300, 0, 0, 0);
      this.time.delayedCall(300, () => this.scene.start('ShopScene'));
    });

    // Coins display
    this.add.text(cx + 130, cy + 80, `🪙 ${coins}`, {
      fontFamily: '"Arial Black", Arial, sans-serif', fontSize: '14px',
      color: '#ffd700', stroke: '#000', strokeThickness: 3,
    }).setOrigin(0, 0.5);

    const highScore = localStorage.getItem('savannaHighScore') || 0;
    this.add.text(cx, cy + 130, `🏆 Recorde: ${parseInt(highScore).toLocaleString()} pts`, {
      fontFamily: 'Arial, sans-serif', fontSize: '15px',
      color: '#fff', stroke: '#000', strokeThickness: 3,
    }).setOrigin(0.5);

    this.add.text(cx, GAME_HEIGHT - 38, '⎵ Espaço / ↑ Seta / Toque para pular  •  Segure para pular mais alto', {
      fontFamily: 'Arial, sans-serif', fontSize: '12px', color: '#ffffff80',
    }).setOrigin(0.5);

    this._spawnDecoLions();
    this.cameras.main.fadeIn(500, 0, 0, 0);
  }

  _makeButton(cx, y, label, color, cb) {
    const W = 200, H = 48;
    const bg = this.add.graphics();
    const draw = (c) => {
      bg.clear();
      bg.fillStyle(c, 1);
      bg.fillRoundedRect(cx - W/2, y - H/2, W, H, 14);
      bg.lineStyle(3, 0x3d1a00, 1);
      bg.strokeRoundedRect(cx - W/2, y - H/2, W, H, 14);
    };
    draw(color);
    const txt = this.add.text(cx, y, label, {
      fontFamily: '"Arial Black", Arial, sans-serif', fontSize: '20px', color: '#fff',
      stroke: '#000', strokeThickness: 3,
    }).setOrigin(0.5);
    const zone = this.add.zone(cx, y, W, H).setInteractive({ useHandCursor: true });
    zone.on('pointerover', () => { draw(0xf5b942); this.tweens.add({ targets: [bg, txt], scaleX: 1.05, scaleY: 1.05, duration: 100 }); });
    zone.on('pointerout',  () => { draw(color); this.tweens.add({ targets: [bg, txt], scaleX: 1, scaleY: 1, duration: 100 }); });
    zone.on('pointerdown', cb);
  }

  _spawnDecoLions() {
    const y = GAME_HEIGHT - 72;
    for (let i = 0; i < 6; i++) {
      const lion = this.add.sprite(-60 - i * 40, y, 'lion_run', 0).setScale(1.2);
      lion.play('lion_run_anim');
      this.tweens.add({
        targets: lion, x: GAME_WIDTH + 60,
        duration: 4800 + i * 180, delay: i * 280, repeat: -1,
        onRepeat: () => { lion.x = -60; },
      });
    }
  }
}
