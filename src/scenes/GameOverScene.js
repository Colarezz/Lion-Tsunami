// ============================================================
// GameOverScene - Shows final score and restart option
// ============================================================

import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../config.js';

export default class GameOverScene extends Phaser.Scene {
  constructor() {
    super({ key: 'GameOverScene' });
  }

  init(data) {
    this.finalDistance = data.distance || 0;
    this.highScore = data.highScore || 0;
    this.isNewRecord = this.finalDistance >= this.highScore && this.finalDistance > 0;
  }

  create() {
    const cx = GAME_WIDTH / 2;

    // Dark overlay background
    const bg = this.add.graphics();
    bg.fillStyle(0x000000, 0.85);
    bg.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

    // Game Over title
    const title = this.add.text(cx, 80, 'GAME OVER', {
      fontFamily: '"Arial Black", Arial, sans-serif',
      fontSize: '48px',
      color: '#ff4444',
      fontStyle: 'bold',
      stroke: '#000',
      strokeThickness: 6,
    }).setOrigin(0.5).setAlpha(0);

    // Animate title in
    this.tweens.add({
      targets: title,
      alpha: 1,
      y: 90,
      duration: 600,
      ease: 'Back.easeOut',
    });

    // Distance panel
    const panelY = 170;
    const panelW = 300, panelH = 120;

    const panel = this.add.graphics();
    panel.fillStyle(0x1a1a2e, 0.9);
    panel.fillRoundedRect(cx - panelW / 2, panelY, panelW, panelH, 12);
    panel.lineStyle(2, 0xe8a628, 0.8);
    panel.strokeRoundedRect(cx - panelW / 2, panelY, panelW, panelH, 12);

    // Distance text
    this.add.text(cx, panelY + 20, 'DISTÂNCIA', {
      fontFamily: 'Arial, sans-serif',
      fontSize: '14px',
      color: '#aaa',
    }).setOrigin(0.5);

    this.add.text(cx, panelY + 50, `${this.finalDistance} m`, {
      fontFamily: '"Arial Black", Arial, sans-serif',
      fontSize: '32px',
      color: '#fff',
      fontStyle: 'bold',
    }).setOrigin(0.5);

    // High score
    const hsColor = this.isNewRecord ? '#ffd700' : '#e8a628';
    const hsPrefix = this.isNewRecord ? '🏆 NOVO RECORDE!' : '🏆 Recorde';

    this.add.text(cx, panelY + 85, `${hsPrefix}: ${this.highScore} m`, {
      fontFamily: 'Arial, sans-serif',
      fontSize: '16px',
      color: hsColor,
      fontStyle: this.isNewRecord ? 'bold' : 'normal',
    }).setOrigin(0.5);

    // New record animation
    if (this.isNewRecord) {
      const recordText = this.add.text(cx, panelY + 85, `${hsPrefix}: ${this.highScore} m`, {
        fontFamily: 'Arial, sans-serif',
        fontSize: '16px',
        color: '#ffd700',
        fontStyle: 'bold',
      }).setOrigin(0.5);

      this.tweens.add({
        targets: recordText,
        scaleX: 1.15,
        scaleY: 1.15,
        duration: 500,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut',
      });
    }

    // Restart button
    const btnY = 340;
    const btnW = 200, btnH = 50;

    const btnBg = this.add.graphics();
    btnBg.fillStyle(0xe8a628, 1);
    btnBg.fillRoundedRect(cx - btnW / 2, btnY - btnH / 2, btnW, btnH, 14);
    btnBg.lineStyle(3, 0x5a2d00, 1);
    btnBg.strokeRoundedRect(cx - btnW / 2, btnY - btnH / 2, btnW, btnH, 14);

    const btnText = this.add.text(cx, btnY, '🔄  JOGAR DE NOVO', {
      fontFamily: '"Arial Black", Arial, sans-serif',
      fontSize: '16px',
      color: '#3d1a00',
      fontStyle: 'bold',
    }).setOrigin(0.5);

    const btnZone = this.add.zone(cx, btnY, btnW, btnH).setInteractive({ useHandCursor: true });

    btnZone.on('pointerover', () => {
      btnBg.clear();
      btnBg.fillStyle(0xf5b942, 1);
      btnBg.fillRoundedRect(cx - btnW / 2, btnY - btnH / 2, btnW, btnH, 14);
      btnBg.lineStyle(3, 0x5a2d00, 1);
      btnBg.strokeRoundedRect(cx - btnW / 2, btnY - btnH / 2, btnW, btnH, 14);
    });

    btnZone.on('pointerout', () => {
      btnBg.clear();
      btnBg.fillStyle(0xe8a628, 1);
      btnBg.fillRoundedRect(cx - btnW / 2, btnY - btnH / 2, btnW, btnH, 14);
      btnBg.lineStyle(3, 0x5a2d00, 1);
      btnBg.strokeRoundedRect(cx - btnW / 2, btnY - btnH / 2, btnW, btnH, 14);
    });

    btnZone.on('pointerdown', () => {
      this.cameras.main.fadeOut(300, 0, 0, 0);
      this.time.delayedCall(300, () => {
        this.scene.start('GameScene');
      });
    });

    // Menu button
    const menuBtnY = 400;
    const menuText = this.add.text(cx, menuBtnY, 'Menu Inicial', {
      fontFamily: 'Arial, sans-serif',
      fontSize: '14px',
      color: '#aaa',
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    menuText.on('pointerover', () => menuText.setColor('#fff'));
    menuText.on('pointerout', () => menuText.setColor('#aaa'));
    menuText.on('pointerdown', () => {
      this.cameras.main.fadeOut(300, 0, 0, 0);
      this.time.delayedCall(300, () => {
        this.scene.start('MenuScene');
      });
    });

    // Also allow space/click to restart after a short delay
    this.time.delayedCall(1000, () => {
      this.input.keyboard.once('keydown-SPACE', () => {
        this.cameras.main.fadeOut(300, 0, 0, 0);
        this.time.delayedCall(300, () => {
          this.scene.start('GameScene');
        });
      });
    });

    // Fade in
    this.cameras.main.fadeIn(400, 0, 0, 0);
  }
}
