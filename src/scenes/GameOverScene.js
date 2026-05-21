// ============================================================
// GameOverScene
// ============================================================

import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../config.js';

export default class GameOverScene extends Phaser.Scene {
  constructor() { super({ key: 'GameOverScene' }); }

  init(data) {
    this.finalScore    = data.score || 0;
    this.finalDistance = data.distance || 0;
    this.highScore     = data.highScore || 0;
    this.isNewRecord   = this.finalScore >= this.highScore && this.finalScore > 0;
  }

  create() {
    const cx = GAME_WIDTH / 2;

    // Background overlay
    const bg = this.add.graphics();
    bg.fillStyle(0x000000, 0.82);
    bg.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

    // GAME OVER title
    const title = this.add.text(cx, 70, 'GAME OVER', {
      fontFamily: '"Arial Black", Arial, sans-serif',
      fontSize: '52px',
      color: '#ff4444',
      stroke: '#000',
      strokeThickness: 7,
    }).setOrigin(0.5).setAlpha(0);

    this.tweens.add({ targets: title, alpha: 1, y: 82, duration: 600, ease: 'Back.easeOut' });

    // Score panel
    const panelY = 160;
    const panel = this.add.graphics();
    panel.fillStyle(0x1a1a2e, 0.92);
    panel.fillRoundedRect(cx - 160, panelY, 320, 140, 14);
    panel.lineStyle(2, 0xe8a628, 0.9);
    panel.strokeRoundedRect(cx - 160, panelY, 320, 140, 14);

    this.add.text(cx, panelY + 20, 'PONTUAÇÃO', {
      fontFamily: 'Arial, sans-serif', fontSize: '13px', color: '#aaa',
    }).setOrigin(0.5);

    this.add.text(cx, panelY + 48, this.finalScore.toLocaleString(), {
      fontFamily: '"Arial Black", Arial, sans-serif', fontSize: '36px', color: '#ffd700',
    }).setOrigin(0.5);

    this.add.text(cx, panelY + 92, `📏 Distância: ${this.finalDistance} m`, {
      fontFamily: 'Arial, sans-serif', fontSize: '15px', color: '#ddd',
    }).setOrigin(0.5);

    const hsColor  = this.isNewRecord ? '#ffd700' : '#e8a628';
    const hsPrefix = this.isNewRecord ? '🏆 NOVO RECORDE!' : '🏆 Recorde';
    const hsText = this.add.text(cx, panelY + 118, `${hsPrefix}: ${this.highScore.toLocaleString()}`, {
      fontFamily: 'Arial, sans-serif', fontSize: '14px', color: hsColor,
      fontStyle: this.isNewRecord ? 'bold' : 'normal',
    }).setOrigin(0.5);

    if (this.isNewRecord) {
      this.tweens.add({ targets: hsText, scaleX: 1.1, scaleY: 1.1, yoyo: true, repeat: -1, duration: 500 });
    }

    // Restart button
    this._makeButton(cx, 340, '🔄  JOGAR DE NOVO', () => {
      this.cameras.main.fadeOut(300, 0, 0, 0);
      this.time.delayedCall(300, () => this.scene.start('GameScene'));
    });

    // Menu link
    const menuText = this.add.text(cx, 400, 'Menu Inicial', {
      fontFamily: 'Arial, sans-serif', fontSize: '14px', color: '#aaa',
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });
    menuText.on('pointerover', () => menuText.setColor('#fff'));
    menuText.on('pointerout',  () => menuText.setColor('#aaa'));
    menuText.on('pointerdown', () => {
      this.cameras.main.fadeOut(300, 0, 0, 0);
      this.time.delayedCall(300, () => this.scene.start('MenuScene'));
    });

    // Space to restart
    this.time.delayedCall(1000, () => {
      this.input.keyboard.once('keydown-SPACE', () => {
        this.cameras.main.fadeOut(300, 0, 0, 0);
        this.time.delayedCall(300, () => this.scene.start('GameScene'));
      });
    });

    this.cameras.main.fadeIn(400, 0, 0, 0);
  }

  _makeButton(cx, y, label, cb) {
    const W = 220, H = 52;
    const bg = this.add.graphics();
    const draw = (color) => {
      bg.clear();
      bg.fillStyle(color, 1);
      bg.fillRoundedRect(cx - W/2, y - H/2, W, H, 14);
      bg.lineStyle(3, 0x5a2d00, 1);
      bg.strokeRoundedRect(cx - W/2, y - H/2, W, H, 14);
    };
    draw(0xe8a628);
    const txt = this.add.text(cx, y, label, {
      fontFamily: '"Arial Black", Arial, sans-serif', fontSize: '16px', color: '#3d1a00',
    }).setOrigin(0.5);
    const zone = this.add.zone(cx, y, W, H).setInteractive({ useHandCursor: true });
    zone.on('pointerover',  () => draw(0xf5b942));
    zone.on('pointerout',   () => draw(0xe8a628));
    zone.on('pointerdown',  cb);
  }
}
