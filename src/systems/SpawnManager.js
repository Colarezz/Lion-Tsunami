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
  RIVER_START_DISTANCE,
  LARGE_HOLES_DISTANCE,
  MIN_GAP_BETWEEN_HOLES,
} from '../config.js';

export default class SpawnManager {
  constructor(scene) {
    this.scene = scene;
    this.groundTiles = [];
    this.obstacles = []; // { sprite, type }
    this.animals = [];
    this.nextSpawnX = GAME_WIDTH + 200;
    this.lastHoleEndX = -9999;

    // Ground group for physics
    this.groundGroup = scene.physics.add.group();
    this.obstacleGroup = scene.physics.add.group();
    this.animalGroup = scene.physics.add.group();

    // Initial ground
    this.initGround();
  }

  initGround() {
    // Fill screen with ground tiles + some extra
    for (let x = 0; x < GAME_WIDTH + 256; x += TILE_SIZE) {
      this.addGroundTile(x);
    }
  }

  addGroundTile(x) {
    const tile = this.groundGroup.create(x + TILE_SIZE / 2, GROUND_Y + TILE_SIZE / 2, 'ground_tile');
    tile.setDisplaySize(TILE_SIZE, TILE_SIZE * 1.5);
    tile.body.setAllowGravity(false);
    tile.body.setImmovable(true);
    tile.body.setSize(TILE_SIZE, TILE_SIZE * 1.5);
    tile.spawnX = x;
    this.groundTiles.push(tile);
    return tile;
  }

  /**
   * Main update - scroll world and spawn new content
   */
  update(speed, distance) {
    const dt = this.scene.game.loop.delta / 1000;
    const dx = speed * dt;

    // Scroll ground tiles
    this.scrollGround(dx);

    // Scroll obstacles
    this.scrollObstacles(dx);

    // Scroll animals
    this.scrollAnimals(dx);

    // Spawn new content
    this.nextSpawnX -= dx;
    if (this.nextSpawnX <= GAME_WIDTH) {
      this.spawnSegment(distance);
      this.nextSpawnX += SPAWN_INTERVAL_MIN + Math.random() * (SPAWN_INTERVAL_MAX - SPAWN_INTERVAL_MIN);
    }
  }

  scrollGround(dx) {
    const toRecycle = [];

    for (const tile of this.groundTiles) {
      tile.x -= dx;
      tile.body.x = tile.x - TILE_SIZE / 2;

      if (tile.x < -TILE_SIZE) {
        toRecycle.push(tile);
      }
    }

    // Remove off-screen tiles
    for (const tile of toRecycle) {
      const idx = this.groundTiles.indexOf(tile);
      if (idx !== -1) this.groundTiles.splice(idx, 1);
      tile.destroy();
    }

    // Ensure ground extends past screen
    if (this.groundTiles.length > 0) {
      const rightMost = Math.max(...this.groundTiles.map(t => t.x));
      if (rightMost < GAME_WIDTH + 128) {
        this.addGroundTile(rightMost + TILE_SIZE);
      }
    }
  }

  scrollObstacles(dx) {
    for (let i = this.obstacles.length - 1; i >= 0; i--) {
      const obs = this.obstacles[i];
      obs.sprite.x -= dx;
      if (obs.sprite.body) obs.sprite.body.x = obs.sprite.x - obs.sprite.displayWidth / 2;

      if (obs.sprite.x < -100) {
        obs.sprite.destroy();
        this.obstacles.splice(i, 1);
      }
    }
  }

  scrollAnimals(dx) {
    for (let i = this.animals.length - 1; i >= 0; i--) {
      const animal = this.animals[i];
      animal.x -= dx;
      if (animal.body) animal.body.x = animal.x - animal.displayWidth / 2;

      if (animal.x < -100) {
        animal.destroy();
        this.animals.splice(i, 1);
      }
    }
  }

  /**
   * Spawn a segment of content at the right edge
   */
  spawnSegment(distance) {
    // Determine what can spawn based on distance
    const canSpawnEagle = distance > EAGLE_START_DISTANCE;
    const canSpawnRiver = distance > RIVER_START_DISTANCE;
    const largerholes = distance > LARGE_HOLES_DISTANCE;

    // Weighted random selection
    const roll = Math.random();
    const difficultyFactor = Math.min(distance / 3000, 1); // 0-1 over 3km

    const emptyWeight = 0.35 - difficultyFactor * 0.2;
    const animalWeight = 0.25;
    const holeWeight = 0.2 + difficultyFactor * 0.1;
    const eagleWeight = canSpawnEagle ? 0.12 + difficultyFactor * 0.05 : 0;
    const riverWeight = canSpawnRiver ? 0.08 + difficultyFactor * 0.05 : 0;

    const total = emptyWeight + animalWeight + holeWeight + eagleWeight + riverWeight;
    const norm = roll * total;

    let cumulative = 0;

    // Empty
    cumulative += emptyWeight;
    if (norm < cumulative) {
      // Add ground and nothing else
      this.ensureGroundTo(this.nextSpawnX + TILE_SIZE * 3);
      return;
    }

    // Animal
    cumulative += animalWeight;
    if (norm < cumulative) {
      this.ensureGroundTo(this.nextSpawnX + TILE_SIZE * 3);
      this.spawnAnimal(this.nextSpawnX);
      return;
    }

    // Hole
    cumulative += holeWeight;
    if (norm < cumulative) {
      // Check minimum gap from last hole
      if (this.nextSpawnX - this.lastHoleEndX > MIN_GAP_BETWEEN_HOLES) {
        const holeWidth = largerholes
          ? HOLE_WIDTH_MIN + Math.random() * (HOLE_WIDTH_MAX - HOLE_WIDTH_MIN)
          : HOLE_WIDTH_MIN + Math.random() * 40;
        this.spawnHole(this.nextSpawnX, holeWidth);
        return;
      }
      // Too close to last hole, spawn ground instead
      this.ensureGroundTo(this.nextSpawnX + TILE_SIZE * 3);
      return;
    }

    // Eagle
    cumulative += eagleWeight;
    if (norm < cumulative) {
      this.ensureGroundTo(this.nextSpawnX + TILE_SIZE * 3);
      this.spawnEagle(this.nextSpawnX);
      return;
    }

    // River
    this.spawnRiver(this.nextSpawnX);
  }

  /**
   * Ensure ground tiles exist up to x position
   */
  ensureGroundTo(targetX) {
    if (this.groundTiles.length === 0) return;

    const rightMost = Math.max(...this.groundTiles.map(t => t.x));
    for (let x = rightMost + TILE_SIZE; x <= targetX; x += TILE_SIZE) {
      this.addGroundTile(x);
    }
  }

  /**
   * Spawn a hole (gap in ground)
   */
  spawnHole(x, width) {
    // Don't add ground tiles in the gap
    const holeStart = x;
    const holeEnd = x + width;
    this.lastHoleEndX = holeEnd;

    // Add ground before and after the hole
    const rightMost = this.groundTiles.length > 0
      ? Math.max(...this.groundTiles.map(t => t.x))
      : x - TILE_SIZE;

    // Fill up to hole
    for (let gx = rightMost + TILE_SIZE; gx < holeStart; gx += TILE_SIZE) {
      this.addGroundTile(gx);
    }

    // Resume ground after hole
    for (let gx = holeEnd; gx < holeEnd + TILE_SIZE * 5; gx += TILE_SIZE) {
      this.addGroundTile(gx);
    }

    // Visual hole markers (dark edge tiles)
    const leftEdge = this.scene.add.image(holeStart, GROUND_Y + 20, 'hole_tile')
      .setDisplaySize(8, TILE_SIZE);
    const rightEdge = this.scene.add.image(holeEnd, GROUND_Y + 20, 'hole_tile')
      .setDisplaySize(8, TILE_SIZE);

    // Add a kill zone at the bottom
    const killZone = this.obstacleGroup.create(
      holeStart + width / 2,
      GAME_HEIGHT + 20,
      null
    );
    killZone.setDisplaySize(width, 40);
    killZone.setVisible(false);
    killZone.body.setAllowGravity(false);
    killZone.body.setImmovable(true);
    killZone.obstacleType = 'hole';

    this.obstacles.push({
      sprite: killZone,
      type: 'hole',
      extras: [leftEdge, rightEdge],
    });

    // Scroll extras too
    this.scene.events.on('update', () => {
      if (leftEdge.active) leftEdge.x = killZone.x - width / 2;
      if (rightEdge.active) rightEdge.x = killZone.x + width / 2;
    });
  }

  /**
   * Spawn an eagle obstacle
   */
  spawnEagle(x) {
    const eagleY = GROUND_Y - 60 - Math.random() * 60; // Varying heights

    const eagle = this.obstacleGroup.create(x, eagleY, 'eagle', 0);
    eagle.play('eagle_fly');
    eagle.setSize(36, 20);
    eagle.setOffset(6, 6);
    eagle.body.setAllowGravity(false);
    eagle.body.setImmovable(true);
    eagle.obstacleType = 'eagle';

    this.obstacles.push({ sprite: eagle, type: 'eagle' });
  }

  /**
   * Spawn a river (acts like a hole but visually different)
   */
  spawnRiver(x) {
    const width = 100 + Math.random() * 60;

    // Remove ground and add river tiles
    const rightMost = this.groundTiles.length > 0
      ? Math.max(...this.groundTiles.map(t => t.x))
      : x - TILE_SIZE;

    for (let gx = rightMost + TILE_SIZE; gx < x; gx += TILE_SIZE) {
      this.addGroundTile(gx);
    }

    // River visual tiles
    const riverTiles = [];
    for (let rx = x; rx < x + width; rx += TILE_SIZE) {
      const riverTile = this.scene.add.image(rx + TILE_SIZE / 2, GROUND_Y + 20, 'river_tile')
        .setDisplaySize(TILE_SIZE, TILE_SIZE * 1.2);
      riverTiles.push(riverTile);
    }

    // Ground after river
    for (let gx = x + width; gx < x + width + TILE_SIZE * 5; gx += TILE_SIZE) {
      this.addGroundTile(gx);
    }

    // Kill zone
    const killZone = this.obstacleGroup.create(
      x + width / 2,
      GROUND_Y + 10,
      null
    );
    killZone.setDisplaySize(width - 10, 30);
    killZone.setVisible(false);
    killZone.body.setAllowGravity(false);
    killZone.body.setImmovable(true);
    killZone.obstacleType = 'river';

    this.obstacles.push({
      sprite: killZone,
      type: 'river',
      extras: riverTiles,
    });

    this.lastHoleEndX = x + width;

    // Scroll river tiles with killzone
    this.scene.events.on('update', () => {
      riverTiles.forEach((rt, idx) => {
        if (rt.active) {
          rt.x = killZone.x - width / 2 + idx * TILE_SIZE + TILE_SIZE / 2;
        }
      });
    });
  }

  /**
   * Spawn a neutral animal (zebra or giraffe)
   */
  spawnAnimal(x) {
    const type = Math.random() > 0.5 ? 'zebra' : 'giraffe';
    const animalY = type === 'giraffe' ? GROUND_Y - 24 : GROUND_Y - 16;

    const animal = this.animalGroup.create(x, animalY, type, 0);
    animal.play(type === 'zebra' ? 'zebra_idle' : 'giraffe_idle');
    animal.setSize(30, type === 'giraffe' ? 44 : 32);
    animal.setOffset(9, type === 'giraffe' ? 8 : 12);
    animal.body.setAllowGravity(false);
    animal.body.setImmovable(true);
    animal.animalType = type;

    this.animals.push(animal);
  }

  /**
   * Remove an animal from tracking after conversion
   */
  removeAnimal(animal) {
    const idx = this.animals.indexOf(animal);
    if (idx !== -1) {
      this.animals.splice(idx, 1);
    }
  }

  /**
   * Destroy everything
   */
  destroy() {
    this.groundTiles.forEach(t => t.destroy());
    this.obstacles.forEach(o => {
      o.sprite.destroy();
      if (o.extras) o.extras.forEach(e => e.destroy());
    });
    this.animals.forEach(a => a.destroy());
    this.groundTiles = [];
    this.obstacles = [];
    this.animals = [];
  }
}
