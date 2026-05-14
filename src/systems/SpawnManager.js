// ============================================================
// SpawnManager - Procedural generation of obstacles and animals
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
  MIN_GAP_BETWEEN_HOLES,
  BUFFALO_MIN_LIONS,
} from '../config.js';

export default class SpawnManager {
  constructor(scene) {
    this.scene = scene;
    this.groundTiles = [];
    this.obstacles = [];   // { sprite, type, extras? }
    this.animals = [];     // { sprite, type, minLions }
    this.projectiles = []; // bullet sprites
    this.hunters = [];     // hunter data for shooting
    this.nextSpawnX = GAME_WIDTH + 300;
    this.lastHoleEndX = -9999;
    this.worldX = 0;       // total world scroll offset

    // Static ground group — tiles are immovable and manually scrolled
    this.groundGroup = scene.physics.add.staticGroup();

    // Initial ground fill
    this.initGround();
  }

  initGround() {
    for (let x = -TILE_SIZE; x < GAME_WIDTH + TILE_SIZE * 5; x += TILE_SIZE) {
      this._addGroundTile(x + TILE_SIZE / 2);
    }
  }

  /** Create a ground tile at centre-x position */
  _addGroundTile(cx) {
    // Ground tile texture is 64×80. We display it at 64×96 (TILE_SIZE × 1.5).
    // Centre the tile so its TOP edge sits exactly at GROUND_Y.
    const tileH = TILE_SIZE * 1.5; // 96
    const cy = GROUND_Y + tileH / 2; // centre = GROUND_Y + 48 = 418
    const tile = this.groundGroup.create(cx, cy, 'ground_tile');
    tile.setDisplaySize(TILE_SIZE, tileH);
    // Physics body: full width, full visual height, no extra offset
    tile.refreshBody(); // sync static body after display-size change
    tile.body.setSize(TILE_SIZE, tileH, true); // true = centre offset
    this.groundTiles.push(tile);
    return tile;
  }

  // ─────────────────────────────────────────────────────────────
  //  Main update
  // ─────────────────────────────────────────────────────────────
  update(speed, distance) {
    const dt = this.scene.game.loop.delta / 1000;
    const dx = speed * dt;
    this.worldX += dx;

    this._scrollGround(dx);
    this._scrollExtras(dx);
    this._scrollProjectiles(speed, dt);
    this._updateHunters(dx, distance);

    // Spawn trigger
    this.nextSpawnX -= dx;
    if (this.nextSpawnX <= GAME_WIDTH + 64) {
      this._spawnSegment(distance);
      this.nextSpawnX += SPAWN_INTERVAL_MIN + Math.random() * (SPAWN_INTERVAL_MAX - SPAWN_INTERVAL_MIN);
    }
  }

  // ─────────────────────────────────────────────────────────────
  //  Ground scrolling
  // ─────────────────────────────────────────────────────────────
  _scrollGround(dx) {
    const toDestroy = [];
    for (const tile of this.groundTiles) {
      tile.x -= dx;

      if (tile.x < -TILE_SIZE * 2) {
        toDestroy.push(tile);
      }
    }

    for (const tile of toDestroy) {
      this.groundTiles.splice(this.groundTiles.indexOf(tile), 1);
      tile.destroy();
    }

    // Fill to the right
    const rightMost = this.groundTiles.length
      ? Math.max(...this.groundTiles.map(t => t.x))
      : GAME_WIDTH;

    if (rightMost < GAME_WIDTH + TILE_SIZE * 4) {
      this._addGroundTile(rightMost + TILE_SIZE);
    }

    // Sync all static bodies to their new visual positions
    this.groundGroup.refresh();
  }

  // Scroll obstacle extras (visual tiles for rivers/holes) and animals
  _scrollExtras(dx) {
    for (let i = this.obstacles.length - 1; i >= 0; i--) {
      const obs = this.obstacles[i];

      obs.sprite.x -= dx;
      if (obs.sprite.body) obs.sprite.body.reset(obs.sprite.x, obs.sprite.y);

      if (obs.extras) {
        for (const e of obs.extras) {
          if (e.active) e.x -= dx;
        }
      }

      if (obs.sprite.x < -200) {
        obs.sprite.destroy();
        if (obs.extras) obs.extras.forEach(e => { if (e.active) e.destroy(); });
        this.obstacles.splice(i, 1);
      }
    }

    for (let i = this.animals.length - 1; i >= 0; i--) {
      const a = this.animals[i];
      a.sprite.x -= dx;
      if (a.sprite.body) a.sprite.body.reset(a.sprite.x, a.sprite.y);

      if (a.sprite.x < -200) {
        a.sprite.destroy();
        this.animals.splice(i, 1);
      }
    }
  }

  _scrollProjectiles(speed, dt) {
    for (let i = this.projectiles.length - 1; i >= 0; i--) {
      const p = this.projectiles[i];
      if (!p.active) { this.projectiles.splice(i, 1); continue; }
      // Projectiles fly left relative to world
      p.x -= speed * dt; // world scroll
      if (p.x < -50) { p.destroy(); this.projectiles.splice(i, 1); }
    }
  }

  _updateHunters(dx, distance) {
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
    bullet.body.setVelocityX(-280); // flies left toward lions
    bullet.setDepth(90);
    this.projectiles.push(bullet);
  }

  // ─────────────────────────────────────────────────────────────
  //  Spawn segment
  // ─────────────────────────────────────────────────────────────
  _spawnSegment(distance) {
    const canEagle   = distance > EAGLE_START_DISTANCE;
    const canHunter  = distance > HUNTER_START_DISTANCE;
    const canRiver   = distance > RIVER_START_DISTANCE;
    const canBigHole = distance > LARGE_HOLES_DISTANCE;
    const canBuffalo = distance > BUFFALO_START_DISTANCE;

    const diff = Math.min(distance / 3000, 1);

    const W = {
      empty:   Math.max(0.05, 0.35 - diff * 0.2),
      animal:  0.25,
      tree:    0.10 + diff * 0.05,
      hole:    0.15 + diff * 0.08,
      eagle:   canEagle  ? 0.08 + diff * 0.04 : 0,
      hunter:  canHunter ? 0.06 + diff * 0.03 : 0,
      river:   canRiver  ? 0.06 + diff * 0.03 : 0,
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
      case 'animal': {
        this._ensureGroundAt(spawnX);
        // Pick type: 60% small, 40% large (if distance allows)
        const isLarge = canBuffalo && Math.random() < 0.4;
        if (isLarge) {
          this._spawnBuffalo(spawnX);
        } else {
          this._spawnSmallPrey(spawnX);
        }
        break;
      }
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
  }

  // ─────────────────────────────────────────────────────────────
  //  Ground helpers
  // ─────────────────────────────────────────────────────────────
  _ensureGroundAt(untilX) {
    const rightMost = this.groundTiles.length
      ? Math.max(...this.groundTiles.map(t => t.x))
      : 0;
    for (let cx = rightMost + TILE_SIZE; cx <= untilX + TILE_SIZE; cx += TILE_SIZE) {
      this._addGroundTile(cx);
    }
  }

  // ─────────────────────────────────────────────────────────────
  //  Obstacles
  // ─────────────────────────────────────────────────────────────
  _spawnTree(x) {
    const sprite = this.scene.add.sprite(x, GROUND_Y - 28, 'tree_obs');
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

    // Warn sound
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

    // Remove existing ground tiles that overlap the hole
    const toDestroy = [];
    for (const tile of this.groundTiles) {
      const tileLeft = tile.x - TILE_SIZE / 2;
      const tileRight = tile.x + TILE_SIZE / 2;
      if (tileRight > x && tileLeft < x + width) {
        toDestroy.push(tile);
      }
    }
    for (const tile of toDestroy) {
      this.groundTiles.splice(this.groundTiles.indexOf(tile), 1);
      tile.destroy();
    }

    // Fill ground up to hole start
    this._ensureGroundAt(x - TILE_SIZE);

    // Fill ground after hole
    for (let cx = x + width; cx <= x + width + TILE_SIZE * 5; cx += TILE_SIZE) {
      this._addGroundTile(cx);
    }

    // Visual dark void
    const void1 = this.scene.add.rectangle(
      x + width / 2, GAME_HEIGHT - 20, width, 40, 0x0a0500
    ).setDepth(5);

    // Invisible kill sensor — sits below ground level
    const sensor = this.scene.add.rectangle(
      x + width / 2, GAME_HEIGHT + 40, width, 20, 0xff0000, 0
    );
    this.scene.physics.add.existing(sensor, false);
    sensor.body.setAllowGravity(false);
    sensor.body.setImmovable(true);
    sensor.body.setSize(width, 20);

    this.obstacles.push({ sprite: sensor, type: 'hole', extras: [void1] });
  }

  _spawnRiver(x) {
    const width = 100 + Math.random() * 60;
    this.lastHoleEndX = x + width;

    // Remove existing ground tiles that overlap the river
    const toDestroy = [];
    for (const tile of this.groundTiles) {
      const tileLeft = tile.x - TILE_SIZE / 2;
      const tileRight = tile.x + TILE_SIZE / 2;
      if (tileRight > x && tileLeft < x + width) {
        toDestroy.push(tile);
      }
    }
    for (const tile of toDestroy) {
      this.groundTiles.splice(this.groundTiles.indexOf(tile), 1);
      tile.destroy();
    }

    this._ensureGroundAt(x - TILE_SIZE);

    // River visual tiles
    const extras = [];
    for (let rx = x; rx < x + width; rx += TILE_SIZE) {
      const rt = this.scene.add.image(rx + TILE_SIZE / 2, GROUND_Y + 20, 'river_tile')
        .setDisplaySize(TILE_SIZE, TILE_SIZE * 1.2).setDepth(10);
      extras.push(rt);
    }

    for (let cx = x + width; cx <= x + width + TILE_SIZE * 5; cx += TILE_SIZE) {
      this._addGroundTile(cx);
    }

    // Kill zone at ground level (touching ground surface)
    const sensor = this.scene.add.rectangle(
      x + width / 2, GROUND_Y + 2, width - 10, 20, 0x0000ff, 0
    );
    this.scene.physics.add.existing(sensor, false);
    sensor.body.setAllowGravity(false);
    sensor.body.setImmovable(true);
    sensor.body.setSize(width - 10, 20);

    this.obstacles.push({ sprite: sensor, type: 'river', extras });
  }

  // ─────────────────────────────────────────────────────────────
  //  Animals / Prey
  // ─────────────────────────────────────────────────────────────
  _spawnSmallPrey(x) {
    const type = Math.random() > 0.5 ? 'meerkat' : 'hare';
    const sprite = this.scene.add.sprite(x, GROUND_Y - 14, type, 0);
    sprite.play(type + '_idle');
    this.scene.physics.add.existing(sprite, false);
    sprite.body.setAllowGravity(false);
    sprite.body.setImmovable(true);
    sprite.body.setSize(20, 24);
    sprite.setDepth(75);
    this.animals.push({ sprite, type, minLions: 1 });
  }

  _spawnBuffalo(x) {
    const sprite = this.scene.add.sprite(x, GROUND_Y - 28, 'buffalo', 0);
    sprite.play('buffalo_idle');
    this.scene.physics.add.existing(sprite, false);
    sprite.body.setAllowGravity(false);
    sprite.body.setImmovable(true);
    sprite.body.setSize(40, 50);
    sprite.setDepth(75);
    this.animals.push({ sprite, type: 'buffalo', minLions: BUFFALO_MIN_LIONS });
  }

  // ─────────────────────────────────────────────────────────────
  //  Public helpers
  // ─────────────────────────────────────────────────────────────
  removeAnimal(animalData) {
    const idx = this.animals.indexOf(animalData);
    if (idx !== -1) this.animals.splice(idx, 1);
  }

  removeHunter(sprite) {
    const idx = this.hunters.findIndex(h => h.sprite === sprite);
    if (idx !== -1) this.hunters.splice(idx, 1);
  }

  destroy() {
    this.groundTiles.forEach(t => t.destroy());
    this.obstacles.forEach(o => {
      o.sprite.destroy();
      if (o.extras) o.extras.forEach(e => { if (e.active) e.destroy(); });
    });
    this.animals.forEach(a => a.sprite.destroy());
    this.projectiles.forEach(p => { if (p.active) p.destroy(); });
    this.hunters = [];
    this.groundTiles = [];
    this.obstacles = [];
    this.animals = [];
    this.projectiles = [];
  }
}
