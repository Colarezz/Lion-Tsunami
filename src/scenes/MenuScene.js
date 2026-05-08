// ============================================================
// MenuScene - Title screen with animated title and Play button
// ============================================================

import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../config.js';

export default class MenuScene extends Phaser.Scene {
  constructor() {
    super({ key: 'MenuScene' });
  }

  create() {
    const cx = GAME_WIDTH / 2;
    const cy = GAME_HEIGHT / 2;

    // Background - reuse sky
    this.add.image(GAME_WIDTH / 2, GAME_HEIGHT / 2, 'bg_sky').setDisplaySize(GAME_WIDTH, GAME_HEIGHT);

    // Ground strip
    for (let x = 0; x < GAME_WIDTH; x += 64) {
      this.add.image(x + 32, GAME_HEIGHT - 40, 'ground_tile').setDisplaySize(64, 80);
    }

    // Title shadow
    this.add.text(cx + 3, 83, '🦁 LION TSUNAMI', {
      fontFamily: '"Arial Black", Arial, sans-serif',
      fontSize: '52px',
      color: '#000000',
      fontStyle: 'bold',
    }).setOrigin(0.5).setAlpha(0.3);

    // Title text
    const title = this.add.text(cx, 80, '🦁 LION TSUNAMI', {
      fontFamily: '"Arial Black", Arial, sans-serif',
      fontSize: '52px',
      color: '#e8a628',
      fontStyle: 'bold',
      stroke: '#5a2d00',
      strokeThickness: 6,
    }).setOrigin(0.5);

    // Title animation
    this.tweens.add({
      targets: title,
      y: 90,
      duration: 1500,
      ease: 'Sine.easeInOut',
      yoyo: true,
      repeat: -1,
    });

    // Subtitle
    this.add.text(cx, 135, 'Controle a horda. Domine a savana.', {
      fontFamily: 'Arial, sans-serif',
      fontSize: '16px',
      color: '#fff8e0',
      fontStyle: 'italic',
    }).setOrigin(0.5).setAlpha(0.8);

    // Play button background
    const btnW = 200, btnH = 56;
    const btnY = cy + 40;

    const btnBg = this.add.graphics();
    btnBg.fillStyle(0xe8a628, 1);
    btnBg.fillRoundedRect(cx - btnW / 2, btnY - btnH / 2, btnW, btnH, 16);
    btnBg.lineStyle(3, 0x5a2d00, 1);
    btnBg.strokeRoundedRect(cx - btnW / 2, btnY - btnH / 2, btnW, btnH, 16);

    const btnText = this.add.text(cx, btnY, '▶  JOGAR', {
      fontFamily: '"Arial Black", Arial, sans-serif',
      fontSize: '26px',
      color: '#3d1a00',
      fontStyle: 'bold',
    }).setOrigin(0.5);

    // Make button interactive
    const btnZone = this.add.zone(cx, btnY, btnW, btnH).setInteractive({ useHandCursor: true });

    // Hover effect
    btnZone.on('pointerover', () => {
      btnBg.clear();
      btnBg.fillStyle(0xf5b942, 1);
      btnBg.fillRoundedRect(cx - btnW / 2, btnY - btnH / 2, btnW, btnH, 16);
      btnBg.lineStyle(3, 0x5a2d00, 1);
      btnBg.strokeRoundedRect(cx - btnW / 2, btnY - btnH / 2, btnW, btnH, 16);
      this.tweens.add({
        targets: [btnBg, btnText],
        scaleX: 1.05,
        scaleY: 1.05,
        duration: 100,
      });
    });

    btnZone.on('pointerout', () => {
      btnBg.clear();
      btnBg.fillStyle(0xe8a628, 1);
      btnBg.fillRoundedRect(cx - btnW / 2, btnY - btnH / 2, btnW, btnH, 16);
      btnBg.lineStyle(3, 0x5a2d00, 1);
      btnBg.strokeRoundedRect(cx - btnW / 2, btnY - btnH / 2, btnW, btnH, 16);
      this.tweens.add({
        targets: [btnBg, btnText],
        scaleX: 1,
        scaleY: 1,
        duration: 100,
      });
    });

    btnZone.on('pointerdown', () => {
      this.cameras.main.fadeOut(400, 0, 0, 0);
      this.time.delayedCall(400, () => {
        this.scene.start('GameScene');
      });
    });

    // Pulse animation on button
    this.tweens.add({
      targets: btnZone,
      scaleX: 1.02,
      scaleY: 1.02,
      duration: 800,
      ease: 'Sine.easeInOut',
      yoyo: true,
      repeat: -1,
    });

    // High Score
    const highScore = localStorage.getItem('lionTsunamiHighScore') || 0;
    this.add.text(cx, btnY + 60, `🏆 Recorde: ${highScore}m`, {
      fontFamily: 'Arial, sans-serif',
      fontSize: '18px',
      color: '#fff',
      stroke: '#000',
      strokeThickness: 3,
    }).setOrigin(0.5);

    // Instructions
    this.add.text(cx, GAME_HEIGHT - 40, 'Clique / Toque / Espaço para pular', {
      fontFamily: 'Arial, sans-serif',
      fontSize: '13px',
      color: '#ffffff80',
    }).setOrigin(0.5);

    // Decorative lions running across
    this.spawnDecoLions();

    // Fade in
    this.cameras.main.fadeIn(500, 0, 0, 0);
  }

  spawnDecoLions() {
    const y = GAME_HEIGHT - 80;
    for (let i = 0; i < 5; i++) {
      const lion = this.add.sprite(-50 - i * 40, y, 'lion_run', 0);
      lion.play('lion_run_anim');
      lion.setScale(1.2);

      this.tweens.add({
        targets: lion,
        x: GAME_WIDTH + 50,
        duration: 5000 + i * 200,
        delay: i * 300,
        repeat: -1,
        onRepeat: () => {
          lion.x = -50;
        },
      });
    }
  }
}
