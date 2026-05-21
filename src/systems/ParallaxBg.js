// ============================================================
// ParallaxBg - Multi-layer scrolling background
// ============================================================

import { GAME_WIDTH, GAME_HEIGHT } from '../config.js';

export default class ParallaxBg {
  constructor(scene) {
    this.scene = scene;
    this.layers = [];

    // Layer 0: Sky (static, no scroll)
    const sky = scene.add.image(GAME_WIDTH / 2, GAME_HEIGHT / 2, 'bg_sky');
    sky.setDisplaySize(GAME_WIDTH, GAME_HEIGHT);
    sky.setScrollFactor(0);
    sky.setDepth(-100);

    // Layer 1: Mountains (slow scroll)
    this.addScrollLayer('bg_mountains', GAME_HEIGHT - 220, 0.1, -90, 200);

    // Layer 2: Trees (medium scroll)
    this.addScrollLayer('bg_trees', GAME_HEIGHT - 130, 0.3, -80, 180);
  }

  addScrollLayer(key, y, speedFactor, depth, height) {
    const texture = this.scene.textures.get(key);
    const frame = texture.get(0);
    const texWidth = frame.width;

    // We need at least 2 copies to tile seamlessly
    const copies = Math.ceil(GAME_WIDTH / texWidth) + 2;
    const images = [];

    for (let i = 0; i < copies; i++) {
      const img = this.scene.add.image(i * texWidth, y, key);
      img.setOrigin(0, 0.5);
      img.setDisplaySize(texWidth, height);
      img.setDepth(depth);
      images.push(img);
    }

    this.layers.push({
      images,
      speedFactor,
      texWidth,
      offset: 0,
    });
  }

  update(speed) {
    const dt = this.scene.game.loop.delta / 1000;

    for (const layer of this.layers) {
      layer.offset += speed * layer.speedFactor * dt;

      // Keep offset within bounds to prevent infinite growth
      const totalWidth = layer.texWidth * layer.images.length;
      if (totalWidth > 0) {
        layer.offset = ((layer.offset % totalWidth) + totalWidth) % totalWidth;
      }

      for (let i = 0; i < layer.images.length; i++) {
        let x = i * layer.texWidth - layer.offset;

        // Wrap around to keep on screen
        if (x + layer.texWidth < 0) {
          x += totalWidth;
        }

        layer.images[i].x = x;
      }
    }
  }
}
