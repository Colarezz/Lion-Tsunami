// ============================================================
// ShopScene - Buy lion skins with coins
// ============================================================

import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT, SKINS } from '../config.js';
import AudioManager from '../systems/AudioManager.js';

export default class ShopScene extends Phaser.Scene {
  constructor() { super({ key: 'ShopScene' }); }

  create() {
    this.coins = parseInt(localStorage.getItem('lionTsunamiCoins') || '0');
    this.ownedSkins = JSON.parse(localStorage.getItem('lionTsunamiOwned') || '["default"]');
    this.activeSkin = localStorage.getItem('lionTsunamiSkin') || 'default';
    this.audio = new AudioManager();
    this.audio.init();

    // Background
    this.add.image(GAME_WIDTH / 2, GAME_HEIGHT / 2, 'bg_sky').setDisplaySize(GAME_WIDTH, GAME_HEIGHT);
    const overlay = this.add.graphics();
    overlay.fillStyle(0x000000, 0.6);
    overlay.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

    // Title
    this.add.text(GAME_WIDTH / 2, 30, '🛒 LOJA DE SKINS', {
      fontFamily: '"Arial Black", Arial, sans-serif', fontSize: '32px',
      color: '#ffd700', stroke: '#000', strokeThickness: 5,
    }).setOrigin(0.5);

    // Coins display
    this.coinsText = this.add.text(GAME_WIDTH / 2, 65, `🪙 ${this.coins} moedas`, {
      fontFamily: 'Arial, sans-serif', fontSize: '18px',
      color: '#ffd700', stroke: '#000', strokeThickness: 3,
    }).setOrigin(0.5);

    // Skin cards
    const cols = 4;
    const cardW = 160, cardH = 120, gap = 16;
    const startX = (GAME_WIDTH - (cols * cardW + (cols - 1) * gap)) / 2;
    const startY = 100;

    SKINS.forEach((skin, i) => {
      const col = i % cols;
      const row = Math.floor(i / cols);
      const cx = startX + col * (cardW + gap) + cardW / 2;
      const cy = startY + row * (cardH + gap) + cardH / 2;
      this._createSkinCard(cx, cy, cardW, cardH, skin);
    });

    // Back button
    const backText = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT - 30, '← Voltar ao Menu', {
      fontFamily: 'Arial, sans-serif', fontSize: '16px', color: '#aaa',
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });
    backText.on('pointerover', () => backText.setColor('#fff'));
    backText.on('pointerout',  () => backText.setColor('#aaa'));
    backText.on('pointerdown', () => {
      this.cameras.main.fadeOut(300, 0, 0, 0);
      this.time.delayedCall(300, () => this.scene.start('MenuScene'));
    });

    this.cameras.main.fadeIn(400, 0, 0, 0);
  }

  _createSkinCard(cx, cy, w, h, skin) {
    const owned = this.ownedSkins.includes(skin.id);
    const active = this.activeSkin === skin.id;
    const canBuy = this.coins >= skin.price;

    // Card background
    const bg = this.add.graphics();
    const borderColor = active ? 0x44ff88 : (owned ? 0xe8a628 : 0x555555);
    bg.fillStyle(0x1a1a2e, 0.9);
    bg.fillRoundedRect(cx - w/2, cy - h/2, w, h, 10);
    bg.lineStyle(2, borderColor, 1);
    bg.strokeRoundedRect(cx - w/2, cy - h/2, w, h, 10);

    // Lion preview (colored circle)
    const preview = this.add.graphics();
    preview.fillStyle(Phaser.Display.Color.HexStringToColor(skin.bodyColor).color, 1);
    preview.fillCircle(cx, cy - 18, 18);
    preview.fillStyle(Phaser.Display.Color.HexStringToColor(skin.maneColor).color, 1);
    preview.fillCircle(cx + 6, cy - 26, 12);

    // Name
    this.add.text(cx, cy + 14, skin.name, {
      fontFamily: 'Arial, sans-serif', fontSize: '11px', color: '#fff',
    }).setOrigin(0.5);

    // Status / Button
    let statusText;
    if (active) {
      statusText = this.add.text(cx, cy + 34, '✅ EQUIPADA', {
        fontFamily: 'Arial, sans-serif', fontSize: '11px', color: '#44ff88', fontStyle: 'bold',
      }).setOrigin(0.5);
    } else if (owned) {
      statusText = this.add.text(cx, cy + 34, 'EQUIPAR', {
        fontFamily: 'Arial, sans-serif', fontSize: '12px', color: '#e8a628', fontStyle: 'bold',
      }).setOrigin(0.5).setInteractive({ useHandCursor: true });
      statusText.on('pointerdown', () => {
        this.activeSkin = skin.id;
        localStorage.setItem('lionTsunamiSkin', skin.id);
        this.scene.restart();
      });
      statusText.on('pointerover', () => statusText.setColor('#fff'));
      statusText.on('pointerout',  () => statusText.setColor('#e8a628'));
    } else if (skin.price === 0) {
      // Free skin, auto-own
    } else {
      const color = canBuy ? '#ffd700' : '#ff4444';
      statusText = this.add.text(cx, cy + 34, `🪙 ${skin.price}`, {
        fontFamily: 'Arial, sans-serif', fontSize: '12px', color, fontStyle: 'bold',
      }).setOrigin(0.5);
      if (canBuy) {
        statusText.setInteractive({ useHandCursor: true });
        statusText.on('pointerdown', () => {
          this.coins -= skin.price;
          localStorage.setItem('lionTsunamiCoins', this.coins.toString());
          this.ownedSkins.push(skin.id);
          localStorage.setItem('lionTsunamiOwned', JSON.stringify(this.ownedSkins));
          this.activeSkin = skin.id;
          localStorage.setItem('lionTsunamiSkin', skin.id);
          this.audio.playPurchase();
          this.scene.restart();
        });
        statusText.on('pointerover', () => statusText.setColor('#fff'));
        statusText.on('pointerout',  () => statusText.setColor(color));
      }
    }
  }
}
