// ============================================================
// Lion Tsunami - Procedural Asset Generator
// Generates all game sprites using Canvas API (no external files needed)
// ============================================================

import { COLORS } from '../config.js';

/**
 * Generate all game textures procedurally.
 * Call this in BootScene.create() before any other scene.
 */
export function generateAssets(scene) {
  generateLionSprite(scene);
  generateLionJumpSprite(scene);
  generateZebraSprite(scene);
  generateGiraffeSprite(scene);
  generateEagleSprite(scene);
  generateGroundTile(scene);
  generateHoleTile(scene);
  generateRiverTile(scene);
  generateParallaxLayers(scene);
  generateParticle(scene);
  generateTreeSprite(scene);
  generateHunterSprite(scene);
  generateMeerkatSprite(scene);
  generateHareSprite(scene);
  generateBuffaloSprite(scene);
}

// ---- Lion (running) ----
function generateLionSprite(scene) {
  const frames = 4;
  const w = 48, h = 48;
  const canvas = scene.textures.createCanvas('lion_run', w * frames, h);
  const ctx = canvas.getContext();

  for (let f = 0; f < frames; f++) {
    const ox = f * w;
    const bounce = Math.sin((f / frames) * Math.PI * 2) * 3;

    ctx.save();
    ctx.translate(ox, 0);

    // Body
    ctx.fillStyle = '#e8a628';
    ctx.beginPath();
    ctx.ellipse(24, 28 + bounce, 16, 12, 0, 0, Math.PI * 2);
    ctx.fill();

    // Mane
    ctx.fillStyle = '#b06810';
    ctx.beginPath();
    ctx.arc(32, 22 + bounce, 12, 0, Math.PI * 2);
    ctx.fill();

    // Head
    ctx.fillStyle = '#e8a628';
    ctx.beginPath();
    ctx.arc(34, 20 + bounce, 8, 0, Math.PI * 2);
    ctx.fill();

    // Eyes
    ctx.fillStyle = '#111';
    ctx.beginPath();
    ctx.arc(37, 18 + bounce, 2, 0, Math.PI * 2);
    ctx.fill();

    // Nose
    ctx.fillStyle = '#8b5a10';
    ctx.beginPath();
    ctx.arc(40, 21 + bounce, 1.5, 0, Math.PI * 2);
    ctx.fill();

    // Ears
    ctx.fillStyle = '#b06810';
    ctx.beginPath();
    ctx.arc(30, 13 + bounce, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(36, 12 + bounce, 3, 0, Math.PI * 2);
    ctx.fill();

    // Tail
    ctx.strokeStyle = '#b06810';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(8, 24 + bounce);
    ctx.quadraticCurveTo(3, 16 + bounce + Math.sin(f * 1.5) * 4, 5, 12 + bounce);
    ctx.stroke();

    // Tail tuft
    ctx.fillStyle = '#8b5a10';
    ctx.beginPath();
    ctx.arc(5, 12 + bounce, 3, 0, Math.PI * 2);
    ctx.fill();

    // Legs (animated)
    ctx.fillStyle = '#c48e20';
    const legPhase = (f / frames) * Math.PI * 2;
    // Front legs
    const fl1 = Math.sin(legPhase) * 6;
    const fl2 = Math.sin(legPhase + Math.PI) * 6;
    ctx.fillRect(28 + fl1, 36 + bounce, 4, 10);
    ctx.fillRect(22 + fl2, 36 + bounce, 4, 10);
    // Back legs
    ctx.fillRect(14 + fl2, 36 + bounce, 4, 10);
    ctx.fillRect(10 + fl1, 36 + bounce, 4, 10);

    // Paws
    ctx.fillStyle = '#8b5a10';
    ctx.fillRect(27 + fl1, 44 + bounce, 6, 3);
    ctx.fillRect(21 + fl2, 44 + bounce, 6, 3);
    ctx.fillRect(13 + fl2, 44 + bounce, 6, 3);
    ctx.fillRect(9 + fl1, 44 + bounce, 6, 3);

    ctx.restore();
  }

  canvas.refresh();

  // Add frames to animation
  scene.textures.get('lion_run').add(0, 0, 0, 0, w, h);
  scene.textures.get('lion_run').add(1, 0, w, 0, w, h);
  scene.textures.get('lion_run').add(2, 0, w * 2, 0, w, h);
  scene.textures.get('lion_run').add(3, 0, w * 3, 0, w, h);

  scene.anims.create({
    key: 'lion_run_anim',
    frames: [
      { key: 'lion_run', frame: 0 },
      { key: 'lion_run', frame: 1 },
      { key: 'lion_run', frame: 2 },
      { key: 'lion_run', frame: 3 },
    ],
    frameRate: 10,
    repeat: -1,
  });
}

// ---- Lion (jumping) ----
function generateLionJumpSprite(scene) {
  const w = 48, h = 48;
  const canvas = scene.textures.createCanvas('lion_jump', w, h);
  const ctx = canvas.getContext();

  // Body - stretched upward
  ctx.fillStyle = '#e8a628';
  ctx.beginPath();
  ctx.ellipse(24, 26, 15, 14, -0.2, 0, Math.PI * 2);
  ctx.fill();

  // Mane
  ctx.fillStyle = '#b06810';
  ctx.beginPath();
  ctx.arc(32, 18, 12, 0, Math.PI * 2);
  ctx.fill();

  // Head
  ctx.fillStyle = '#e8a628';
  ctx.beginPath();
  ctx.arc(35, 16, 8, 0, Math.PI * 2);
  ctx.fill();

  // Eyes
  ctx.fillStyle = '#111';
  ctx.beginPath();
  ctx.arc(38, 14, 2, 0, Math.PI * 2);
  ctx.fill();

  // Nose
  ctx.fillStyle = '#8b5a10';
  ctx.beginPath();
  ctx.arc(41, 17, 1.5, 0, Math.PI * 2);
  ctx.fill();

  // Ears
  ctx.fillStyle = '#b06810';
  ctx.beginPath();
  ctx.arc(30, 9, 3, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(36, 8, 3, 0, Math.PI * 2);
  ctx.fill();

  // Legs - extended
  ctx.fillStyle = '#c48e20';
  // Front - forward
  ctx.save();
  ctx.translate(30, 35);
  ctx.rotate(-0.4);
  ctx.fillRect(0, 0, 4, 12);
  ctx.restore();
  ctx.save();
  ctx.translate(24, 36);
  ctx.rotate(-0.2);
  ctx.fillRect(0, 0, 4, 11);
  ctx.restore();
  // Back - backward
  ctx.save();
  ctx.translate(14, 34);
  ctx.rotate(0.4);
  ctx.fillRect(0, 0, 4, 12);
  ctx.restore();
  ctx.save();
  ctx.translate(10, 36);
  ctx.rotate(0.3);
  ctx.fillRect(0, 0, 4, 11);
  ctx.restore();

  // Tail
  ctx.strokeStyle = '#b06810';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(8, 22);
  ctx.quadraticCurveTo(2, 28, 4, 34);
  ctx.stroke();

  // Tail tuft
  ctx.fillStyle = '#8b5a10';
  ctx.beginPath();
  ctx.arc(4, 34, 3, 0, Math.PI * 2);
  ctx.fill();

  canvas.refresh();
}

// ---- Zebra ----
function generateZebraSprite(scene) {
  const frames = 2;
  const w = 48, h = 48;
  const canvas = scene.textures.createCanvas('zebra', w * frames, h);
  const ctx = canvas.getContext();

  for (let f = 0; f < frames; f++) {
    const ox = f * w;
    const bounce = f * 2;

    ctx.save();
    ctx.translate(ox, 0);

    // Body
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.ellipse(24, 28 + bounce, 16, 11, 0, 0, Math.PI * 2);
    ctx.fill();

    // Stripes
    ctx.fillStyle = '#222';
    for (let i = 0; i < 5; i++) {
      ctx.fillRect(12 + i * 6, 20 + bounce, 3, 18);
    }

    // Head
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.ellipse(36, 20 + bounce, 7, 9, 0.3, 0, Math.PI * 2);
    ctx.fill();

    // Head stripe
    ctx.fillStyle = '#222';
    ctx.fillRect(34, 14 + bounce, 2, 14);

    // Eye
    ctx.fillStyle = '#111';
    ctx.beginPath();
    ctx.arc(38, 18 + bounce, 2, 0, Math.PI * 2);
    ctx.fill();

    // Muzzle
    ctx.fillStyle = '#ddd';
    ctx.beginPath();
    ctx.ellipse(40, 24 + bounce, 4, 3, 0, 0, Math.PI * 2);
    ctx.fill();

    // Mane
    ctx.fillStyle = '#333';
    ctx.fillRect(28, 12 + bounce, 8, 4);

    // Legs
    ctx.fillStyle = '#fff';
    const lp = f * Math.PI;
    ctx.fillRect(28 + Math.sin(lp) * 3, 36 + bounce, 3, 10);
    ctx.fillRect(22 + Math.sin(lp + Math.PI) * 3, 36 + bounce, 3, 10);
    ctx.fillRect(14 + Math.sin(lp + Math.PI) * 3, 36 + bounce, 3, 10);
    ctx.fillRect(10 + Math.sin(lp) * 3, 36 + bounce, 3, 10);

    // Hooves
    ctx.fillStyle = '#333';
    ctx.fillRect(27 + Math.sin(lp) * 3, 44 + bounce, 5, 3);
    ctx.fillRect(21 + Math.sin(lp + Math.PI) * 3, 44 + bounce, 5, 3);
    ctx.fillRect(13 + Math.sin(lp + Math.PI) * 3, 44 + bounce, 5, 3);
    ctx.fillRect(9 + Math.sin(lp) * 3, 44 + bounce, 5, 3);

    // Tail
    ctx.strokeStyle = '#222';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(8, 22 + bounce);
    ctx.lineTo(4, 18 + bounce);
    ctx.stroke();

    ctx.restore();
  }

  canvas.refresh();

  scene.textures.get('zebra').add(0, 0, 0, 0, w, h);
  scene.textures.get('zebra').add(1, 0, w, 0, w, h);

  scene.anims.create({
    key: 'zebra_idle',
    frames: [
      { key: 'zebra', frame: 0 },
      { key: 'zebra', frame: 1 },
    ],
    frameRate: 3,
    repeat: -1,
  });
}

// ---- Giraffe ----
function generateGiraffeSprite(scene) {
  const frames = 2;
  const w = 48, h = 56;
  const canvas = scene.textures.createCanvas('giraffe', w * frames, h);
  const ctx = canvas.getContext();

  for (let f = 0; f < frames; f++) {
    const ox = f * w;
    const bounce = f * 1.5;

    ctx.save();
    ctx.translate(ox, 0);

    // Body
    ctx.fillStyle = '#d4a843';
    ctx.beginPath();
    ctx.ellipse(22, 36 + bounce, 14, 10, 0, 0, Math.PI * 2);
    ctx.fill();

    // Spots
    ctx.fillStyle = '#7a5520';
    const spots = [[16, 32], [22, 30], [28, 34], [18, 38], [26, 38]];
    spots.forEach(([sx, sy]) => {
      ctx.beginPath();
      ctx.arc(sx, sy + bounce, 3, 0, Math.PI * 2);
      ctx.fill();
    });

    // Neck
    ctx.fillStyle = '#d4a843';
    ctx.fillRect(28, 8 + bounce, 8, 28);

    // Neck spots
    ctx.fillStyle = '#7a5520';
    ctx.beginPath(); ctx.arc(32, 14 + bounce, 2, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(30, 22 + bounce, 2, 0, Math.PI * 2); ctx.fill();

    // Head
    ctx.fillStyle = '#d4a843';
    ctx.beginPath();
    ctx.ellipse(34, 8 + bounce, 7, 6, 0.2, 0, Math.PI * 2);
    ctx.fill();

    // Ossicones (horns)
    ctx.fillStyle = '#7a5520';
    ctx.fillRect(30, 1 + bounce, 2, 6);
    ctx.fillRect(35, 1 + bounce, 2, 6);
    ctx.fillStyle = '#d4a843';
    ctx.beginPath(); ctx.arc(31, 1 + bounce, 2, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(36, 1 + bounce, 2, 0, Math.PI * 2); ctx.fill();

    // Eye
    ctx.fillStyle = '#111';
    ctx.beginPath();
    ctx.arc(37, 7 + bounce, 1.5, 0, Math.PI * 2);
    ctx.fill();

    // Legs
    ctx.fillStyle = '#c49a38';
    const lp = f * Math.PI;
    ctx.fillRect(24 + Math.sin(lp) * 2, 43 + bounce, 3, 12);
    ctx.fillRect(18 + Math.sin(lp + Math.PI) * 2, 43 + bounce, 3, 12);
    ctx.fillRect(12 + Math.sin(lp + Math.PI) * 2, 43 + bounce, 3, 12);
    ctx.fillRect(8 + Math.sin(lp) * 2, 43 + bounce, 3, 12);

    // Tail
    ctx.strokeStyle = '#7a5520';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(8, 32 + bounce);
    ctx.lineTo(3, 26 + bounce);
    ctx.stroke();
    ctx.fillStyle = '#5a3a10';
    ctx.beginPath();
    ctx.arc(3, 26 + bounce, 2, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  canvas.refresh();

  scene.textures.get('giraffe').add(0, 0, 0, 0, w, h);
  scene.textures.get('giraffe').add(1, 0, w, 0, w, h);

  scene.anims.create({
    key: 'giraffe_idle',
    frames: [
      { key: 'giraffe', frame: 0 },
      { key: 'giraffe', frame: 1 },
    ],
    frameRate: 3,
    repeat: -1,
  });
}

// ---- Eagle ----
function generateEagleSprite(scene) {
  const frames = 4;
  const w = 48, h = 32;
  const canvas = scene.textures.createCanvas('eagle', w * frames, h);
  const ctx = canvas.getContext();

  for (let f = 0; f < frames; f++) {
    const ox = f * w;
    const wingAngle = Math.sin((f / frames) * Math.PI * 2) * 0.5;

    ctx.save();
    ctx.translate(ox, 0);

    // Wings
    ctx.fillStyle = '#5c3a1e';
    // Left wing
    ctx.save();
    ctx.translate(24, 16);
    ctx.rotate(-wingAngle - 0.3);
    ctx.beginPath();
    ctx.ellipse(-12, 0, 14, 5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    // Right wing
    ctx.save();
    ctx.translate(24, 16);
    ctx.rotate(wingAngle + 0.3);
    ctx.beginPath();
    ctx.ellipse(12, 0, 14, 5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // Body
    ctx.fillStyle = '#3d2510';
    ctx.beginPath();
    ctx.ellipse(24, 16, 8, 6, 0, 0, Math.PI * 2);
    ctx.fill();

    // Head
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(32, 12, 5, 0, Math.PI * 2);
    ctx.fill();

    // Beak
    ctx.fillStyle = '#f5a623';
    ctx.beginPath();
    ctx.moveTo(37, 11);
    ctx.lineTo(42, 13);
    ctx.lineTo(37, 14);
    ctx.fill();

    // Eye
    ctx.fillStyle = '#111';
    ctx.beginPath();
    ctx.arc(34, 11, 1.5, 0, Math.PI * 2);
    ctx.fill();

    // Tail feathers
    ctx.fillStyle = '#3d2510';
    ctx.beginPath();
    ctx.moveTo(12, 16);
    ctx.lineTo(6, 14);
    ctx.lineTo(6, 18);
    ctx.fill();

    ctx.restore();
  }

  canvas.refresh();

  scene.textures.get('eagle').add(0, 0, 0, 0, w, h);
  scene.textures.get('eagle').add(1, 0, w, 0, w, h);
  scene.textures.get('eagle').add(2, 0, w * 2, 0, w, h);
  scene.textures.get('eagle').add(3, 0, w * 3, 0, w, h);

  scene.anims.create({
    key: 'eagle_fly',
    frames: [
      { key: 'eagle', frame: 0 },
      { key: 'eagle', frame: 1 },
      { key: 'eagle', frame: 2 },
      { key: 'eagle', frame: 3 },
    ],
    frameRate: 8,
    repeat: -1,
  });
}

// ---- Ground tile ----
function generateGroundTile(scene) {
  const w = 64, h = 80;
  const canvas = scene.textures.createCanvas('ground_tile', w, h);
  const ctx = canvas.getContext();

  // Dirt
  ctx.fillStyle = '#a67832';
  ctx.fillRect(0, 0, w, h);

  // Top grass
  ctx.fillStyle = '#7ab648';
  ctx.fillRect(0, 0, w, 8);

  // Grass tufts
  ctx.fillStyle = '#8ec455';
  for (let i = 0; i < 6; i++) {
    const gx = Math.random() * w;
    ctx.beginPath();
    ctx.moveTo(gx, 8);
    ctx.lineTo(gx - 3, 0);
    ctx.lineTo(gx + 3, 0);
    ctx.fill();
  }

  // Dirt texture
  ctx.fillStyle = '#9a6e2a';
  for (let i = 0; i < 10; i++) {
    const dx = Math.random() * w;
    const dy = 12 + Math.random() * (h - 16);
    ctx.fillRect(dx, dy, 3 + Math.random() * 4, 2);
  }

  // Rock details
  ctx.fillStyle = '#8a6428';
  for (let i = 0; i < 3; i++) {
    const rx = Math.random() * w;
    const ry = 15 + Math.random() * (h - 20);
    ctx.beginPath();
    ctx.arc(rx, ry, 2 + Math.random() * 3, 0, Math.PI * 2);
    ctx.fill();
  }

  canvas.refresh();
}

// ---- Hole tile ----
function generateHoleTile(scene) {
  const w = 64, h = 80;
  const canvas = scene.textures.createCanvas('hole_tile', w, h);
  const ctx = canvas.getContext();

  // Dark abyss
  ctx.fillStyle = '#1a0a00';
  ctx.fillRect(0, 0, w, h);

  // Left edge
  ctx.fillStyle = '#6d4e22';
  ctx.fillRect(0, 0, 4, h);

  // Right edge
  ctx.fillRect(w - 4, 0, 4, h);

  // Dirt drips
  ctx.fillStyle = '#3d2a10';
  for (let i = 0; i < 4; i++) {
    const dx = 4 + Math.random() * (w - 8);
    ctx.fillRect(dx, 0, 2, 8 + Math.random() * 15);
  }

  canvas.refresh();
}

// ---- River tile ----
function generateRiverTile(scene) {
  const w = 64, h = 80;
  const canvas = scene.textures.createCanvas('river_tile', w, h);
  const ctx = canvas.getContext();

  // Water
  const gradient = ctx.createLinearGradient(0, 0, 0, h);
  gradient.addColorStop(0, '#2196f3');
  gradient.addColorStop(0.5, '#1976d2');
  gradient.addColorStop(1, '#0d47a1');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, w, h);

  // Waves
  ctx.strokeStyle = '#64b5f680';
  ctx.lineWidth = 2;
  for (let i = 0; i < 4; i++) {
    const wy = 10 + i * 18;
    ctx.beginPath();
    ctx.moveTo(0, wy);
    ctx.quadraticCurveTo(w / 4, wy - 4, w / 2, wy);
    ctx.quadraticCurveTo(w * 3 / 4, wy + 4, w, wy);
    ctx.stroke();
  }

  // Foam at top
  ctx.fillStyle = '#bbdefb80';
  ctx.fillRect(0, 0, w, 4);

  canvas.refresh();
}

// ---- Parallax backgrounds ----
function generateParallaxLayers(scene) {
  // Sky
  {
    const w = 800, h = 450;
    const canvas = scene.textures.createCanvas('bg_sky', w, h);
    const ctx = canvas.getContext();
    const gradient = ctx.createLinearGradient(0, 0, 0, h);
    gradient.addColorStop(0, '#3a7bd5');
    gradient.addColorStop(0.4, '#6db3f2');
    gradient.addColorStop(0.7, '#ffd89b');
    gradient.addColorStop(1, '#f7c273');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, w, h);

    // Sun
    ctx.fillStyle = '#fff4c8';
    ctx.shadowBlur = 40;
    ctx.shadowColor = '#ffd700';
    ctx.beginPath();
    ctx.arc(650, 80, 35, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    // Clouds
    ctx.fillStyle = '#ffffff60';
    drawCloud(ctx, 100, 60, 60);
    drawCloud(ctx, 350, 100, 45);
    drawCloud(ctx, 550, 50, 50);
    drawCloud(ctx, 720, 120, 40);

    canvas.refresh();
  }

  // Mountains
  {
    const w = 1200, h = 200;
    const canvas = scene.textures.createCanvas('bg_mountains', w, h);
    const ctx = canvas.getContext();

    ctx.clearRect(0, 0, w, h);

    // Far mountains
    ctx.fillStyle = '#8e7c5a88';
    drawMountainRange(ctx, w, h, 0.6, 120);

    // Near mountains
    ctx.fillStyle = '#6d5e3faa';
    drawMountainRange(ctx, w, h, 0.8, 80);

    canvas.refresh();
  }

  // Trees
  {
    const w = 1600, h = 180;
    const canvas = scene.textures.createCanvas('bg_trees', w, h);
    const ctx = canvas.getContext();

    ctx.clearRect(0, 0, w, h);

    for (let i = 0; i < 20; i++) {
      const tx = i * 80 + Math.random() * 40;
      const ty = h - 20;
      const th = 60 + Math.random() * 80;
      drawTree(ctx, tx, ty, th);
    }

    canvas.refresh();
  }
}

function drawCloud(ctx, x, y, size) {
  ctx.beginPath();
  ctx.arc(x, y, size * 0.5, 0, Math.PI * 2);
  ctx.arc(x + size * 0.4, y - size * 0.15, size * 0.4, 0, Math.PI * 2);
  ctx.arc(x + size * 0.7, y, size * 0.35, 0, Math.PI * 2);
  ctx.arc(x + size * 0.35, y + size * 0.1, size * 0.3, 0, Math.PI * 2);
  ctx.fill();
}

function drawMountainRange(ctx, w, h, amplitude, baseOffset) {
  ctx.beginPath();
  ctx.moveTo(0, h);
  const segments = 12;
  for (let i = 0; i <= segments; i++) {
    const x = (i / segments) * w;
    const y = h - baseOffset - Math.sin(i * 0.8) * h * amplitude * 0.4 - Math.random() * 20;
    if (i === 0) ctx.lineTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.lineTo(w, h);
  ctx.closePath();
  ctx.fill();
}

function drawTree(ctx, x, y, height) {
  // Trunk
  ctx.fillStyle = '#5d4037';
  ctx.fillRect(x - 3, y - height * 0.4, 6, height * 0.4);

  // Canopy (acacia-like flat top)
  ctx.fillStyle = '#558b2f';
  ctx.beginPath();
  ctx.ellipse(x, y - height * 0.5, height * 0.4, height * 0.2, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#7cb342';
  ctx.beginPath();
  ctx.ellipse(x + 5, y - height * 0.55, height * 0.3, height * 0.15, 0, 0, Math.PI * 2);
  ctx.fill();
}

// ---- Particle ----
function generateParticle(scene) {
  const w = 8, h = 8;
  const canvas = scene.textures.createCanvas('particle', w, h);
  const ctx = canvas.getContext();

  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(4, 4, 3, 0, Math.PI * 2);
  ctx.fill();

  canvas.refresh();
}

// ---- Tree ----
function generateTreeSprite(scene) {
  const w = 64, h = 100;
  const canvas = scene.textures.createCanvas('tree', w, h);
  const ctx = canvas.getContext();
  
  // Trunk
  ctx.fillStyle = '#5d4037';
  ctx.fillRect(28, 40, 8, 60);
  
  // Leaves
  ctx.fillStyle = '#558b2f';
  ctx.beginPath();
  ctx.ellipse(32, 30, 30, 20, 0, 0, Math.PI * 2);
  ctx.fill();
  
  ctx.fillStyle = '#7cb342';
  ctx.beginPath();
  ctx.ellipse(36, 25, 20, 12, 0, 0, Math.PI * 2);
  ctx.fill();
  
  canvas.refresh();
}

// ---- Hunter ----
function generateHunterSprite(scene) {
  const w = 32, h = 48;
  const canvas = scene.textures.createCanvas('hunter', w, h);
  const ctx = canvas.getContext();
  
  // Legs
  ctx.fillStyle = '#4a3728';
  ctx.fillRect(10, 30, 4, 18);
  ctx.fillRect(18, 30, 4, 18);
  
  // Body
  ctx.fillStyle = '#5b7553';
  ctx.fillRect(8, 14, 16, 16);
  
  // Head
  ctx.fillStyle = '#c68642';
  ctx.beginPath();
  ctx.arc(16, 8, 6, 0, Math.PI * 2);
  ctx.fill();
  
  // Hat
  ctx.fillStyle = '#4a3728';
  ctx.fillRect(6, 0, 20, 4);
  ctx.fillRect(10, -4, 12, 4);
  
  // Gun
  ctx.fillStyle = '#444';
  ctx.fillRect(2, 20, 24, 3);
  
  canvas.refresh();
}

// ---- Meerkat ----
function generateMeerkatSprite(scene) {
  const frames = 2;
  const w = 24, h = 32;
  const canvas = scene.textures.createCanvas('meerkat', w * frames, h);
  const ctx = canvas.getContext();

  for (let f = 0; f < frames; f++) {
    const ox = f * w;
    const bounce = f * 2;
    ctx.save();
    ctx.translate(ox, 0);

    // Body standing
    ctx.fillStyle = '#d4a060';
    ctx.beginPath();
    ctx.ellipse(12, 20 + bounce, 6, 10, 0, 0, Math.PI * 2);
    ctx.fill();

    // Head
    ctx.beginPath();
    ctx.arc(12, 8 + bounce, 5, 0, Math.PI * 2);
    ctx.fill();
    
    // Eyes
    ctx.fillStyle = '#111';
    ctx.fillRect(10, 6 + bounce, 2, 2);
    ctx.fillRect(14, 6 + bounce, 2, 2);

    ctx.restore();
  }
  canvas.refresh();
  scene.textures.get('meerkat').add(0, 0, 0, 0, w, h);
  scene.textures.get('meerkat').add(1, 0, w, 0, w, h);
  scene.anims.create({
    key: 'meerkat_idle',
    frames: [{ key: 'meerkat', frame: 0 }, { key: 'meerkat', frame: 1 }],
    frameRate: 4,
    repeat: -1
  });
}

// ---- Hare ----
function generateHareSprite(scene) {
  const frames = 2;
  const w = 24, h = 24;
  const canvas = scene.textures.createCanvas('hare', w * frames, h);
  const ctx = canvas.getContext();

  for (let f = 0; f < frames; f++) {
    const ox = f * w;
    const bounce = f * 2;
    ctx.save();
    ctx.translate(ox, 0);

    // Body
    ctx.fillStyle = '#c9a872';
    ctx.beginPath();
    ctx.ellipse(12, 16 + bounce, 8, 6, 0, 0, Math.PI * 2);
    ctx.fill();

    // Ears
    ctx.fillRect(14, 4 + bounce, 2, 8);
    ctx.fillRect(18, 4 + bounce, 2, 8);

    // Eye
    ctx.fillStyle = '#111';
    ctx.fillRect(18, 12 + bounce, 2, 2);

    ctx.restore();
  }
  canvas.refresh();
  scene.textures.get('hare').add(0, 0, 0, 0, w, h);
  scene.textures.get('hare').add(1, 0, w, 0, w, h);
  scene.anims.create({
    key: 'hare_idle',
    frames: [{ key: 'hare', frame: 0 }, { key: 'hare', frame: 1 }],
    frameRate: 5,
    repeat: -1
  });
}

// ---- Buffalo ----
function generateBuffaloSprite(scene) {
  const frames = 2;
  const w = 56, h = 48;
  const canvas = scene.textures.createCanvas('buffalo', w * frames, h);
  const ctx = canvas.getContext();

  for (let f = 0; f < frames; f++) {
    const ox = f * w;
    const bounce = f * 2;
    ctx.save();
    ctx.translate(ox, 0);

    // Body
    ctx.fillStyle = '#3e2723';
    ctx.beginPath();
    ctx.ellipse(28, 26 + bounce, 20, 14, 0, 0, Math.PI * 2);
    ctx.fill();

    // Head
    ctx.beginPath();
    ctx.arc(42, 20 + bounce, 10, 0, Math.PI * 2);
    ctx.fill();

    // Horns
    ctx.fillStyle = '#555';
    ctx.beginPath();
    ctx.moveTo(38, 12 + bounce);
    ctx.lineTo(44, 4 + bounce);
    ctx.lineTo(46, 12 + bounce);
    ctx.fill();

    // Legs
    ctx.fillStyle = '#2d1a11';
    const lp = f * Math.PI;
    ctx.fillRect(32 + Math.sin(lp) * 4, 38 + bounce, 6, 10);
    ctx.fillRect(24 + Math.sin(lp + Math.PI) * 4, 38 + bounce, 6, 10);
    ctx.fillRect(16 + Math.sin(lp + Math.PI) * 4, 38 + bounce, 6, 10);
    ctx.fillRect(12 + Math.sin(lp) * 4, 38 + bounce, 6, 10);

    ctx.restore();
  }
  canvas.refresh();
  scene.textures.get('buffalo').add(0, 0, 0, 0, w, h);
  scene.textures.get('buffalo').add(1, 0, w, 0, w, h);
  scene.anims.create({
    key: 'buffalo_idle',
    frames: [{ key: 'buffalo', frame: 0 }, { key: 'buffalo', frame: 1 }],
    frameRate: 3,
    repeat: -1
  });
}
