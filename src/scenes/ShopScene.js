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

    this.add.image(GAME_WIDTH / 2, GAME_HEIGHT / 2, 'bg_sky').setDisplaySize(GAME_WIDTH, GAME_HEIGHT);
    const overlay = this.add.graphics();
    overlay.fillStyle(0x000000, 0.6);
    overlay.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

    this.add.text(GAME_WIDTH / 2, 30, '🛒 LOJA DE SKINS', {
      fontFamily: '"Arial Black", Arial, sans-serif', fontSize: '32px',
      color: '#ffd700', stroke: '#000', strokeThickness: 5,
    }).setOrigin(0.5);

    this.coinsText = this.add.text(GAME_WIDTH / 2, 65, `🪙 ${this.coins} moedas`, {
      fontFamily: 'Arial, sans-serif', fontSize: '18px',
      color: '#ffd700', stroke: '#000', strokeThickness: 3,
    }).setOrigin(0.5);

    const cols = 4;
    const cardW = 160, cardH = 120, gap = 16;
    const totalW = cols * cardW + (cols - 1) * gap;
    const startX = (GAME_WIDTH - totalW) / 2;
    const startY = 100;

    SKINS.forEach((skin, i) => {
      const col = i % cols;
      const row = Math.floor(i / cols);
      const cx = startX + col * (cardW + gap) + cardW / 2;
      const cy = startY + row * (cardH + gap) + cardH / 2;
      this._createSkinCard(cx, cy, cardW, cardH, skin);
    });

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

  _hexToNum(hex) {
    return parseInt(hex.replace('#', ''), 16);
  }

  _createSkinCard(cx, cy, w, h, skin) {
    const owned = this.ownedSkins.includes(skin.id);
    const active = this.activeSkin === skin.id;
    const canBuy = this.coins >= skin.price;

    const bg = this.add.graphics();
    const borderColor = active ? 0x44ff88 : (owned ? 0xe8a628 : 0x555555);
    bg.fillStyle(0x1a1a2e, 0.9);
    bg.fillRoundedRect(cx - w/2, cy - h/2, w, h, 10);
    bg.lineStyle(2, borderColor, 1);
    bg.strokeRoundedRect(cx - w/2, cy - h/2, w, h, 10);

    // Lion preview
    const preview = this.add.graphics();
    const bodyCol = this._hexToNum(skin.bodyColor);
    const maneCol = this._hexToNum(skin.maneColor);
    preview.fillStyle(bodyCol, 1);
    preview.fillCircle(cx, cy - 18, 18);
    preview.fillStyle(maneCol, 1);
    preview.fillCircle(cx + 6, cy - 26, 12);

    this.add.text(cx, cy + 14, skin.name, {
      fontFamily: 'Arial, sans-serif', fontSize: '11px', color: '#fff',
    }).setOrigin(0.5);

    if (active) {
      this.add.text(cx, cy + 34, '✅ EQUIPADA', {
        fontFamily: 'Arial, sans-serif', fontSize: '11px', color: '#44ff88', fontStyle: 'bold',
      }).setOrigin(0.5);
    } else if (owned) {
      const equipText = this.add.text(cx, cy + 34, 'EQUIPAR', {
        fontFamily: 'Arial, sans-serif', fontSize: '12px', color: '#e8a628', fontStyle: 'bold',
      }).setOrigin(0.5).setInteractive({ useHandCursor: true });
      equipText.on('pointerdown', () => {
        localStorage.setItem('lionTsunamiSkin', skin.id);
        this.scene.restart();
      });
      equipText.on('pointerover', () => equipText.setColor('#fff'));
      equipText.on('pointerout',  () => equipText.setColor('#e8a628'));
    } else {
      const color = canBuy ? '#ffd700' : '#ff4444';
      const buyText = this.add.text(cx, cy + 34, `🪙 ${skin.price}`, {
        fontFamily: 'Arial, sans-serif', fontSize: '12px', color, fontStyle: 'bold',
      }).setOrigin(0.5);
      if (canBuy) {
        buyText.setInteractive({ useHandCursor: true });
        buyText.on('pointerdown', () => {
          this.coins -= skin.price;
          localStorage.setItem('lionTsunamiCoins', this.coins.toString());
          this.ownedSkins.push(skin.id);
          localStorage.setItem('lionTsunamiOwned', JSON.stringify(this.ownedSkins));
          localStorage.setItem('lionTsunamiSkin', skin.id);
          this.audio.resume();
          this.audio.playPurchase();
          this.scene.restart();
        });
        buyText.on('pointerover', () => buyText.setColor('#fff'));
        buyText.on('pointerout',  () => buyText.setColor(color));
      }
    }
  }
}
