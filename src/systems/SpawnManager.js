// ============================================================
// SpawnManager - Procedural generation of obstacles, animals, and coins
// ============================================================

import {
  GAME_WIDTH,
  GAME_HEIGHT,
  GROUND_Y,
  TILE_SIZE,
  SPAWN_INTERVAL_MIN,
  SPAWN_INTERVAL_MAX,
  HOLE_WIDTH_MIN,
  HOLE_WIDTH_MAX,
  EAGLE_START_DISTANCE,
  HUNTER_START_DISTANCE,
  RIVER_START_DISTANCE,
  LARGE_HOLES_DISTANCE,
  BUFFALO_START_DISTANCE,
  ZEBRA_START_DISTANCE,
  GIRAFFE_START_DISTANCE,
  ELEPHANT_START_DISTANCE,
  MIN_GAP_BETWEEN_HOLES,
  HARE_MIN_LIONS,
  MEERKAT_MIN_LIONS,
  ZEBRA_MIN_LIONS,
  GIRAFFE_MIN_LIONS,
  BUFFALO_MIN_LIONS,
  ELEPHANT_MIN_LIONS,
  HARE_LIONS_GAINED,
  MEERKAT_LIONS_GAINED,
  ZEBRA_LIONS_GAINED,
  GIRAFFE_LIONS_GAINED,
  BUFFALO_LIONS_GAINED,
  ELEPHANT_LIONS_GAINED,
  SCORE_PER_SMALL_PREY,
  SCORE_PER_MEDIUM_PREY,
  SCORE_PER_LARGE_PREY,
  SCORE_PER_HUGE_PREY,
  COIN_SPAWN_CHANCE,
} from '../config.js';

export default class SpawnManager {
  constructor(scene) {
    this.scene = scene;
    this.groundTiles = [];
    this.obstacles = [];
    this.animals = [];     // { sprite, type, minLions, lionsGained, scoreValue, label }
    this.projectiles = [];
    this.hunters = [];
    this.coins = [];       // { sprite }
    this.nextSpawnX = GAME_WIDTH + 300;
    this.lastHoleEndX = -9999;
    this.worldX = 0;

    this.groundGroup = scene.physics.add.staticGroup();
    this.initGround();
  }

  initGround() {
    for (let x = -TILE_SIZE; x < GAME_WIDTH + TILE_SIZE * 5; x += TILE_SIZE) {
      this._addGroundTile(x + TILE_SIZE / 2);
    }
  }

  _addGroundTile(cx) {
    const tileH = TILE_SIZE * 1.5;
    const cy = GROUND_Y + tileH / 2;
    const tile = this.groundGroup.create(cx, cy, 'ground_tile');
    tile.setDisplaySize(TILE_SIZE, tileH);
    tile.refreshBody();
    tile.body.setSize(TILE_SIZE, tileH, true);
    this.groundTiles.push(tile);
    return tile;
  }

  update(speed, distance) {
    const dt = this.scene.game.loop.delta / 1000;
    const dx = speed * dt;
    this.worldX += dx;

    this._scrollGround(dx);
    this._scrollExtras(dx);
    this._scrollProjectiles(speed, dt);
    this._scrollCoins(dx);
    this._updateHunters(dx, distance);

    this.nextSpawnX -= dx;
    if (this.nextSpawnX <= GAME_WIDTH + 64) {
      this._spawnSegment(distance);
      this.nextSpawnX += SPAWN_INTERVAL_MIN + Math.random() * (SPAWN_INTERVAL_MAX - SPAWN_INTERVAL_MIN);
    }
  }

  _scrollGround(dx) {
    const toDestroy = [];
    for (const tile of this.groundTiles) {
      tile.x -= dx;
      if (tile.x < -TILE_SIZE * 2) toDestroy.push(tile);
    }
    for (const tile of toDestroy) {
      this.groundTiles.splice(this.groundTiles.indexOf(tile), 1);
      tile.destroy();
    }
    const rightMost = this.groundTiles.length
      ? Math.max(...this.groundTiles.map(t => t.x))
      : GAME_WIDTH;
    if (rightMost < GAME_WIDTH + TILE_SIZE * 4) {
      this._addGroundTile(rightMost + TILE_SIZE);
    }
    this.groundGroup.refresh();
  }

  _scrollExtras(dx) {
    for (let i = this.obstacles.length - 1; i >= 0; i--) {
      const obs = this.obstacles[i];
      obs.sprite.x -= dx;
      // Handle both static and dynamic bodies
      if (obs.sprite.body) {
        if (obs.sprite.body.isStatic) {
          obs.sprite.body.position.x = obs.sprite.x - obs.sprite.body.width / 2;
          obs.sprite.body.updateCenter();
        } else {
          obs.sprite.body.reset(obs.sprite.x, obs.sprite.y);
        }
      }
      if (obs.extras) {
        for (const e of obs.extras) { if (e.active) e.x -= dx; }
      }
      if (obs.sprite.x < -300) {
        obs.sprite.destroy();
        if (obs.extras) obs.extras.forEach(e => { if (e.active) e.destroy(); });
        this.obstacles.splice(i, 1);
      }
    }

    for (let i = this.animals.length - 1; i >= 0; i--) {
      const a = this.animals[i];
      a.sprite.x -= dx;
      if (a.sprite.body) a.sprite.body.reset(a.sprite.x, a.sprite.y);
      // Move the label with the animal
      if (a.label && a.label.active) {
        a.label.x = a.sprite.x;
        a.label.y = a.sprite.y - a.labelOffsetY;
      }
      if (a.sprite.x < -200) {
        a.sprite.destroy();
        if (a.label && a.label.active) a.label.destroy();
        this.animals.splice(i, 1);
      }
    }
  }

  _scrollCoins(dx) {
    for (let i = this.coins.length - 1; i >= 0; i--) {
      const c = this.coins[i];
      if (!c.sprite.active) { this.coins.splice(i, 1); continue; }
      c.sprite.x -= dx;
      if (c.sprite.body) c.sprite.body.reset(c.sprite.x, c.sprite.y);
      if (c.sprite.x < -50) {
        c.sprite.destroy();
        this.coins.splice(i, 1);
      }
    }
  }

  _scrollProjectiles(speed, dt) {
    for (let i = this.projectiles.length - 1; i >= 0; i--) {
      const p = this.projectiles[i];
      if (!p.active) { this.projectiles.splice(i, 1); continue; }
      p.x -= speed * dt;
      if (p.x < -50) { p.destroy(); this.projectiles.splice(i, 1); }
    }
  }

  _updateHunters(dx) {
    for (const h of this.hunters) {
      h.shootTimer -= dx;
      if (h.shootTimer <= 0) {
        h.shootTimer = 180 + Math.random() * 120;
        this._fireProjectile(h.sprite.x - 20, h.sprite.y - 10);
      }
    }
  }

  _fireProjectile(x, y) {
    const bullet = this.scene.add.rectangle(x, y, 10, 4, 0xffdd00);
    this.scene.physics.add.existing(bullet);
    bullet.body.setAllowGravity(false);
    bullet.body.setVelocityX(-280);
    bullet.setDepth(90);
    this.projectiles.push(bullet);
  }

  _spawnSegment(distance) {
    const canEagle   = distance > EAGLE_START_DISTANCE;
    const canHunter  = distance > HUNTER_START_DISTANCE;
    const canRiver   = distance > RIVER_START_DISTANCE;
    const canBigHole = distance > LARGE_HOLES_DISTANCE;

    const diff = Math.min(distance / 3000, 1);

    const W = {
      empty:   Math.max(0.05, 0.30 - diff * 0.2),
      animal:  0.30,
      tree:    0.10 + diff * 0.05,
      hole:    0.12 + diff * 0.08,
      eagle:   canEagle  ? 0.06 + diff * 0.04 : 0,
      hunter:  canHunter ? 0.05 + diff * 0.03 : 0,
      river:   canRiver  ? 0.05 + diff * 0.03 : 0,
    };

    const total = Object.values(W).reduce((a, b) => a + b, 0);
    let roll = Math.random() * total;
    let chosen = 'empty';
    for (const [key, w] of Object.entries(W)) {
      roll -= w;
      if (roll <= 0) { chosen = key; break; }
    }

    const spawnX = GAME_WIDTH + 80;

    switch (chosen) {
      case 'animal':
        this._ensureGroundAt(spawnX);
        this._spawnAnimal(spawnX, distance);
        break;
      case 'tree':
        this._ensureGroundAt(spawnX);
        this._spawnTree(spawnX);
        break;
      case 'hole': {
        if (spawnX - this.lastHoleEndX > MIN_GAP_BETWEEN_HOLES) {
          const w = canBigHole
            ? HOLE_WIDTH_MIN + Math.random() * (HOLE_WIDTH_MAX - HOLE_WIDTH_MIN)
            : HOLE_WIDTH_MIN + Math.random() * 40;
          this._spawnHole(spawnX, w);
        } else {
          this._ensureGroundAt(spawnX);
        }
        break;
      }
      case 'eagle':
        this._ensureGroundAt(spawnX);
        this._spawnEagle(spawnX);
        break;
      case 'hunter':
        this._ensureGroundAt(spawnX);
        this._spawnHunter(spawnX);
        break;
      case 'river':
        this._spawnRiver(spawnX);
        break;
      default:
        this._ensureGroundAt(spawnX);
        break;
    }

    // Chance to also spawn coins nearby
    if (Math.random() < COIN_SPAWN_CHANCE) {
      this._spawnCoinCluster(spawnX + 40 + Math.random() * 100);
    }
  }

  _ensureGroundAt(untilX) {
    const rightMost = this.groundTiles.length
      ? Math.max(...this.groundTiles.map(t => t.x))
      : 0;
    for (let cx = rightMost + TILE_SIZE; cx <= untilX + TILE_SIZE; cx += TILE_SIZE) {
      this._addGroundTile(cx);
    }
  }

  // ── Animals ──
  _spawnAnimal(x, distance) {
    const canZebra    = distance > ZEBRA_START_DISTANCE;
    const canGiraffe  = distance > GIRAFFE_START_DISTANCE;
    const canBuffalo  = distance > BUFFALO_START_DISTANCE;
    const canElephant = distance > ELEPHANT_START_DISTANCE;

    // Weighted random pick
    const pool = [
      { type: 'hare',    weight: 20 },
      { type: 'meerkat', weight: 20 },
    ];
    if (canZebra)    pool.push({ type: 'zebra',    weight: 18 });
    if (canGiraffe)  pool.push({ type: 'giraffe',  weight: 14 });
    if (canBuffalo)  pool.push({ type: 'buffalo',  weight: 10 });
    if (canElephant) pool.push({ type: 'elephant', weight: 6 });

    const totalW = pool.reduce((a, b) => a + b.weight, 0);
    let r = Math.random() * totalW;
    let picked = pool[0].type;
    for (const p of pool) {
      r -= p.weight;
      if (r <= 0) { picked = p.type; break; }
    }

    const ANIMAL_CONFIG = {
      hare:     { minLions: HARE_MIN_LIONS,     gained: HARE_LIONS_GAINED,     score: SCORE_PER_SMALL_PREY,  anim: 'hare_idle',     yOff: 14, bw: 20, bh: 24, labelOff: 20 },
      meerkat:  { minLions: MEERKAT_MIN_LIONS,   gained: MEERKAT_LIONS_GAINED,  score: SCORE_PER_SMALL_PREY,  anim: 'meerkat_idle',  yOff: 14, bw: 20, bh: 24, labelOff: 22 },
      zebra:    { minLions: ZEBRA_MIN_LIONS,     gained: ZEBRA_LIONS_GAINED,    score: SCORE_PER_MEDIUM_PREY, anim: 'zebra_idle',    yOff: 28, bw: 32, bh: 40, labelOff: 32 },
      giraffe:  { minLions: GIRAFFE_MIN_LIONS,   gained: GIRAFFE_LIONS_GAINED,  score: SCORE_PER_MEDIUM_PREY, anim: 'giraffe_idle',  yOff: 32, bw: 32, bh: 48, labelOff: 38 },
      buffalo:  { minLions: BUFFALO_MIN_LIONS,   gained: BUFFALO_LIONS_GAINED,  score: SCORE_PER_LARGE_PREY,  anim: 'buffalo_idle',  yOff: 28, bw: 40, bh: 50, labelOff: 32 },
      elephant: { minLions: ELEPHANT_MIN_LIONS,  gained: ELEPHANT_LIONS_GAINED, score: SCORE_PER_HUGE_PREY,   anim: 'elephant_idle', yOff: 36, bw: 50, bh: 56, labelOff: 42 },
    };

    const cfg = ANIMAL_CONFIG[picked];
    const sprite = this.scene.add.sprite(x, GROUND_Y - cfg.yOff, picked, 0);
    sprite.play(cfg.anim);
    this.scene.physics.add.existing(sprite, false);
    sprite.body.setAllowGravity(false);
    sprite.body.setImmovable(true);
    sprite.body.setSize(cfg.bw, cfg.bh);
    sprite.setDepth(75);

    // Label showing required lions above the animal's head
    const label = this.scene.add.text(x, GROUND_Y - cfg.yOff - cfg.labelOff, `🦁${cfg.minLions}`, {
      fontFamily: '"Arial Black", Arial, sans-serif',
      fontSize: '13px',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 3,
    }).setOrigin(0.5).setDepth(200);

    this.animals.push({
      sprite, type: picked,
      minLions: cfg.minLions,
      lionsGained: cfg.gained,
      scoreValue: cfg.score,
      label,
      labelOffsetY: cfg.labelOff,
    });
  }

  // ── Coins ──
  _spawnCoinCluster(x) {
    const count = 1 + Math.floor(Math.random() * 4);
    for (let i = 0; i < count; i++) {
      const cx = x + i * 28;
      const cy = GROUND_Y - 30 - Math.random() * 60;
      const sprite = this.scene.add.sprite(cx, cy, 'coin', 0);
      sprite.play('coin_spin');
      this.scene.physics.add.existing(sprite, false);
      sprite.body.setAllowGravity(false);
      sprite.body.setImmovable(true);
      sprite.body.setSize(16, 16);
      sprite.setDepth(85);
      this.coins.push({ sprite });
    }
  }

  // ── Obstacles ──
  _spawnTree(x) {
    const sprite = this.scene.add.sprite(x, GROUND_Y - 28, 'tree');
    this.scene.physics.add.existing(sprite, false);
    sprite.body.setAllowGravity(false);
    sprite.body.setImmovable(true);
    sprite.body.setSize(20, 56);
    sprite.setDepth(80);
    this.obstacles.push({ sprite, type: 'tree' });
  }

  _spawnEagle(x) {
    const eagleY = GROUND_Y - 80 - Math.random() * 60;
    const sprite = this.scene.add.sprite(x, eagleY, 'eagle', 0);
    sprite.play('eagle_fly');
    this.scene.physics.add.existing(sprite, false);
    sprite.body.setAllowGravity(false);
    sprite.body.setImmovable(true);
    sprite.body.setSize(36, 20);
    sprite.setDepth(85);
    try { this.scene.audio && this.scene.audio.playEagle(); } catch (e) {}
    this.obstacles.push({ sprite, type: 'eagle' });
  }

  _spawnHunter(x) {
    const sprite = this.scene.add.sprite(x, GROUND_Y - 28, 'hunter');
    this.scene.physics.add.existing(sprite, false);
    sprite.body.setAllowGravity(false);
    sprite.body.setImmovable(true);
    sprite.body.setSize(20, 56);
    sprite.setDepth(80);
    const hunterData = { sprite, shootTimer: 60 + Math.random() * 60 };
    this.hunters.push(hunterData);
    this.obstacles.push({ sprite, type: 'hunter', hunterData });
  }

  _spawnHole(x, width) {
    this.lastHoleEndX = x + width;
    const toDestroy = [];
    for (const tile of this.groundTiles) {
      const tL = tile.x - TILE_SIZE / 2, tR = tile.x + TILE_SIZE / 2;
      if (tR > x && tL < x + width) toDestroy.push(tile);
    }
    for (const tile of toDestroy) {
      this.groundTiles.splice(this.groundTiles.indexOf(tile), 1);
      tile.destroy();
    }
    this._ensureGroundAt(x - TILE_SIZE);
    for (let cx = x + width; cx <= x + width + TILE_SIZE * 5; cx += TILE_SIZE) {
      this._addGroundTile(cx);
    }
    // Dark void filling the gap from ground level to screen bottom
    const voidH = GAME_HEIGHT - GROUND_Y;
    const void1 = this.scene.add.rectangle(
      x + width / 2, GROUND_Y + voidH / 2,
      width + 4, voidH, 0x0a0500
    ).setDepth(5);
    // Crumbling edge effect at top
    const edge = this.scene.add.rectangle(
      x + width / 2, GROUND_Y + 2,
      width + 4, 6, 0x5a3a10
    ).setDepth(6);
    // Invisible sensor is not needed — lions fall and die via y > GAME_HEIGHT check
    // But we keep a reference for cleanup
    const sensor = this.scene.add.rectangle(x + width / 2, GAME_HEIGHT + 40, width, 20, 0xff0000, 0);
    this.scene.physics.add.existing(sensor, false);
    sensor.body.setAllowGravity(false);
    sensor.body.setImmovable(true);
    sensor.body.setSize(width, 20);
    this.obstacles.push({ sprite: sensor, type: 'hole', extras: [void1, edge] });
  }

  _spawnRiver(x) {
    const width = 100 + Math.random() * 60;
    this.lastHoleEndX = x + width;
    const toDestroy = [];
    for (const tile of this.groundTiles) {
      const tL = tile.x - TILE_SIZE / 2, tR = tile.x + TILE_SIZE / 2;
      if (tR > x && tL < x + width) toDestroy.push(tile);
    }
    for (const tile of toDestroy) {
      this.groundTiles.splice(this.groundTiles.indexOf(tile), 1);
      tile.destroy();
    }
    this._ensureGroundAt(x - TILE_SIZE);
    const extras = [];
    // River tiles fill from GROUND_Y downward (same as ground tiles)
    const riverH = GAME_HEIGHT - GROUND_Y;
    for (let rx = x; rx < x + width; rx += TILE_SIZE) {
      const rt = this.scene.add.image(
        rx + TILE_SIZE / 2, GROUND_Y + riverH / 2, 'river_tile'
      ).setDisplaySize(TILE_SIZE, riverH).setDepth(10);
      extras.push(rt);
    }
    for (let cx = x + width; cx <= x + width + TILE_SIZE * 5; cx += TILE_SIZE) {
      this._addGroundTile(cx);
    }
    // Kill sensor sits at ground level — lions land on it and die
    const sensor = this.scene.add.rectangle(
      x + width / 2, GROUND_Y + 10, width - 6, 24, 0x0000ff, 0
    );
    this.scene.physics.add.existing(sensor, true); // static body
    sensor.body.setSize(width - 6, 24);
    this.obstacles.push({ sprite: sensor, type: 'river', extras });
  }

  // ── Public helpers ──
  removeAnimal(animalData) {
    const idx = this.animals.indexOf(animalData);
    if (idx !== -1) this.animals.splice(idx, 1);
  }

  removeHunter(sprite) {
    const idx = this.hunters.findIndex(h => h.sprite === sprite);
    if (idx !== -1) this.hunters.splice(idx, 1);
  }

  removeCoin(coinData) {
    const idx = this.coins.indexOf(coinData);
    if (idx !== -1) this.coins.splice(idx, 1);
  }

  destroy() {
    this.groundTiles.forEach(t => t.destroy());
    this.obstacles.forEach(o => {
      o.sprite.destroy();
      if (o.extras) o.extras.forEach(e => { if (e.active) e.destroy(); });
    });
    this.animals.forEach(a => {
      a.sprite.destroy();
      if (a.label && a.label.active) a.label.destroy();
    });
    this.coins.forEach(c => { if (c.sprite.active) c.sprite.destroy(); });
    this.projectiles.forEach(p => { if (p.active) p.destroy(); });
    this.hunters = [];
    this.groundTiles = [];
    this.obstacles = [];
    this.animals = [];
    this.coins = [];
    this.projectiles = [];
  }
}
