// ============================================================
// BootScene - Generates procedural assets then transitions to menu
// ============================================================

import Phaser from 'phaser';
import { generateAssets } from '../utils/AssetGenerator.js';

export default class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BootScene' });
  }

  preload() {
    // Show loading text
    const { width, height } = this.cameras.main;

    this.add.graphics()
      .fillStyle(0x1a0a00, 1)
      .fillRect(0, 0, width, height);

    this.add.text(width / 2, height / 2, '🦁 Carregando...', {
      fontFamily: 'Arial, sans-serif',
      fontSize: '24px',
      color: '#e8a628',
    }).setOrigin(0.5);
  }

  create() {
    // Generate all procedural textures
    generateAssets(this);

    // Transition to menu after a brief moment
    this.time.delayedCall(200, () => {
      this.scene.start('MenuScene');
    });
  }
}
