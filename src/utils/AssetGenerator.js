// ============================================================
// Lion Tsunami - Procedural Asset Generator
// Pixel-Art style sprites with outlines, shading and detail
// ============================================================

import { COLORS } from '../config.js';

// ── Outline drawing helpers ──────────────────────────────────

const OL = '#1a1a2e'; // default outline color

function oEllipse(ctx, x, y, rx, ry, fill, outline = OL, lw = 1.5, rot = 0) {
  ctx.beginPath();
  ctx.ellipse(x, y, rx + lw * 0.6, ry + lw * 0.6, rot, 0, Math.PI * 2);
  ctx.fillStyle = outline;
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(x, y, rx, ry, rot, 0, Math.PI * 2);
  ctx.fillStyle = fill;
  ctx.fill();
}

function oCircle(ctx, x, y, r, fill, outline = OL, lw = 1.5) {
  oEllipse(ctx, x, y, r, r, fill, outline, lw);
}

function oRect(ctx, x, y, w, h, fill, outline = OL, lw = 1.5) {
  ctx.fillStyle = outline;
  ctx.fillRect(x - lw * 0.5, y - lw * 0.5, w + lw, h + lw);
  ctx.fillStyle = fill;
  ctx.fillRect(x, y, w, h);
}

function eye(ctx, x, y, r, dir = 1) {
  // White sclera
  oEllipse(ctx, x, y, r * 1.4, r, '#fff', OL, 1);
  // Pupil
  ctx.beginPath();
  ctx.arc(x + dir * r * 0.3, y + r * 0.1, r * 0.6, 0, Math.PI * 2);
  ctx.fillStyle = '#111';
  ctx.fill();
  // Shine
  ctx.beginPath();
  ctx.arc(x + dir * r * 0.5, y - r * 0.3, r * 0.25, 0, Math.PI * 2);
  ctx.fillStyle = '#fff';
  ctx.fill();
}

function nose(ctx, x, y, w, h, color = '#2a1a08') {
  ctx.beginPath();
  ctx.ellipse(x, y, w, h, 0, 0, Math.PI * 2);
  ctx.fillStyle = color;
  ctx.fill();
}

function leg(ctx, x, y, w, h, mainColor, darkColor, pawColor) {
  // Upper leg (main color)
  oRect(ctx, x, y, w, h * 0.55, mainColor);
  // Lower leg (slightly darker)
  oRect(ctx, x, y + h * 0.5, w, h * 0.5, darkColor);
  // Paw / hoof
  oRect(ctx, x - 1, y + h - 3, w + 2, 4, pawColor);
}

// ── Main export ──────────────────────────────────────────────

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

// ── Lion (running) - 48×48, 4 frames ────────────────────────
function generateLionSprite(scene) {
  const frames = 4;
  const w = 48, h = 48;
  const canvas = scene.textures.createCanvas('lion_run', w * frames, h);
  const ctx = canvas.getContext();
  ctx.imageSmoothingEnabled = false;

  for (let f = 0; f < frames; f++) {
    const ox = f * w;
    const bounce = Math.sin((f / frames) * Math.PI * 2) * 2;
    const legPhase = (f / frames) * Math.PI * 2;

    ctx.save();
    ctx.translate(ox, 0);

    // ── Tail ──
    ctx.strokeStyle = OL;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(9, 24 + bounce);
    ctx.quadraticCurveTo(3, 17 + bounce + Math.sin(f * 1.5) * 3, 5, 11 + bounce);
    ctx.stroke();
    ctx.strokeStyle = '#a06010';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(9, 24 + bounce);
    ctx.quadraticCurveTo(3, 17 + bounce + Math.sin(f * 1.5) * 3, 5, 11 + bounce);
    ctx.stroke();
    // Tail tuft
    oCircle(ctx, 5, 11 + bounce, 3, '#6b3a08');

    // ── Back legs ──
    const bl1 = Math.sin(legPhase + Math.PI) * 5;
    const bl2 = Math.sin(legPhase) * 5;
    leg(ctx, 13 + bl1, 35 + bounce, 4, 11, '#b88020', '#9a6a18', '#5a3a10');
    leg(ctx, 9 + bl2, 35 + bounce, 4, 11, '#b88020', '#9a6a18', '#5a3a10');

    // ── Body ──
    // Shadow under body
    ctx.beginPath();
    ctx.ellipse(24, 30 + bounce, 15, 8, 0, 0, Math.PI * 2);
    ctx.fillStyle = '#a0701880';
    ctx.fill();
    // Main body with outline
    oEllipse(ctx, 24, 27 + bounce, 15, 11, '#e8a628');
    // Belly highlight
    ctx.beginPath();
    ctx.ellipse(24, 31 + bounce, 11, 5, 0, 0, Math.PI * 2);
    ctx.fillStyle = '#f0c858';
    ctx.fill();
    // Back shadow
    ctx.beginPath();
    ctx.ellipse(21, 22 + bounce, 12, 5, -0.1, Math.PI, Math.PI * 2);
    ctx.fillStyle = '#c08820';
    ctx.fill();
    // Shoulder highlight
    ctx.beginPath();
    ctx.arc(28, 24 + bounce, 4, 0, Math.PI * 2);
    ctx.fillStyle = '#f0b838';
    ctx.fill();

    // ── Front legs ──
    const fl1 = Math.sin(legPhase) * 5;
    const fl2 = Math.sin(legPhase + Math.PI) * 5;
    leg(ctx, 27 + fl1, 35 + bounce, 4, 11, '#d49828', '#b88020', '#5a3a10');
    leg(ctx, 22 + fl2, 35 + bounce, 4, 11, '#d49828', '#b88020', '#5a3a10');

    // ── Mane ──
    // Outer mane (darker, bigger)
    oCircle(ctx, 31, 21 + bounce, 12, '#7a4a08');
    // Inner mane layers
    ctx.beginPath();
    ctx.arc(29, 18 + bounce, 7, 0, Math.PI * 2);
    ctx.fillStyle = '#8b5a10';
    ctx.fill();
    ctx.beginPath();
    ctx.arc(34, 19 + bounce, 6, 0, Math.PI * 2);
    ctx.fillStyle = '#8b5a10';
    ctx.fill();
    ctx.beginPath();
    ctx.arc(31, 24 + bounce, 7, 0, Math.PI * 2);
    ctx.fillStyle = '#9a6a18';
    ctx.fill();
    // Mane highlights
    ctx.beginPath();
    ctx.arc(28, 16 + bounce, 4, 0, Math.PI * 2);
    ctx.fillStyle = '#a57820';
    ctx.fill();
    ctx.beginPath();
    ctx.arc(35, 17 + bounce, 3, 0, Math.PI * 2);
    ctx.fillStyle = '#a57820';
    ctx.fill();

    // ── Head ──
    oCircle(ctx, 35, 19 + bounce, 7.5, '#e8a628');
    // Head top highlight
    ctx.beginPath();
    ctx.arc(34, 17 + bounce, 4, 0, Math.PI * 2);
    ctx.fillStyle = '#f0b838';
    ctx.fill();

    // ── Ears ──
    oCircle(ctx, 29, 12 + bounce, 3, '#c48e20');
    ctx.beginPath();
    ctx.arc(29, 12 + bounce, 1.5, 0, Math.PI * 2);
    ctx.fillStyle = '#e0b858';
    ctx.fill();
    oCircle(ctx, 35, 11 + bounce, 3, '#c48e20');
    ctx.beginPath();
    ctx.arc(35, 11 + bounce, 1.5, 0, Math.PI * 2);
    ctx.fillStyle = '#e0b858';
    ctx.fill();

    // ── Muzzle ──
    oEllipse(ctx, 40, 21 + bounce, 4, 3, '#f0c858');
    // Nose
    nose(ctx, 42, 20 + bounce, 2, 1.5, '#3a2008');
    // Mouth line
    ctx.beginPath();
    ctx.moveTo(41, 22 + bounce);
    ctx.lineTo(39, 23.5 + bounce);
    ctx.strokeStyle = '#7a5020';
    ctx.lineWidth = 0.7;
    ctx.stroke();

    // ── Eye ──
    eye(ctx, 37, 17.5 + bounce, 2, 1);

    // ── Whisker dots ──
    ctx.fillStyle = '#5a3a10';
    ctx.fillRect(42, 22 + bounce, 1, 1);
    ctx.fillRect(43, 21 + bounce, 1, 1);
    ctx.fillRect(43, 23 + bounce, 1, 1);

    ctx.restore();
  }

  canvas.refresh();

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

// ── Lion (jumping) - 48×48 ──────────────────────────────────
function generateLionJumpSprite(scene) {
  const w = 48, h = 48;
  const canvas = scene.textures.createCanvas('lion_jump', w, h);
  const ctx = canvas.getContext();
  ctx.imageSmoothingEnabled = false;

  // ── Tail (upward curve) ──
  ctx.strokeStyle = OL;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(8, 22);
  ctx.quadraticCurveTo(2, 28, 4, 34);
  ctx.stroke();
  ctx.strokeStyle = '#a06010';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(8, 22);
  ctx.quadraticCurveTo(2, 28, 4, 34);
  ctx.stroke();
  oCircle(ctx, 4, 34, 3, '#6b3a08');

  // ── Back legs (extended back) ──
  ctx.save();
  ctx.translate(14, 34);
  ctx.rotate(0.4);
  oRect(ctx, 0, 0, 4, 12, '#b88020');
  oRect(ctx, -1, 10, 6, 3, '#5a3a10');
  ctx.restore();
  ctx.save();
  ctx.translate(10, 36);
  ctx.rotate(0.3);
  oRect(ctx, 0, 0, 4, 11, '#b88020');
  oRect(ctx, -1, 9, 6, 3, '#5a3a10');
  ctx.restore();

  // ── Body (stretched, angled) ──
  oEllipse(ctx, 24, 25, 15, 12, '#e8a628', OL, 1.5, -0.15);
  // Belly
  ctx.beginPath();
  ctx.ellipse(24, 29, 11, 5, 0, 0, Math.PI * 2);
  ctx.fillStyle = '#f0c858';
  ctx.fill();
  // Back
  ctx.beginPath();
  ctx.ellipse(22, 20, 12, 5, -0.1, Math.PI, Math.PI * 2);
  ctx.fillStyle = '#c08820';
  ctx.fill();

  // ── Front legs (extended forward) ──
  ctx.save();
  ctx.translate(30, 33);
  ctx.rotate(-0.4);
  oRect(ctx, 0, 0, 4, 12, '#d49828');
  oRect(ctx, -1, 10, 6, 3, '#5a3a10');
  ctx.restore();
  ctx.save();
  ctx.translate(25, 35);
  ctx.rotate(-0.2);
  oRect(ctx, 0, 0, 4, 11, '#d49828');
  oRect(ctx, -1, 9, 6, 3, '#5a3a10');
  ctx.restore();

  // ── Mane ──
  oCircle(ctx, 32, 17, 12, '#7a4a08');
  ctx.beginPath();
  ctx.arc(30, 14, 7, 0, Math.PI * 2);
  ctx.fillStyle = '#8b5a10';
  ctx.fill();
  ctx.beginPath();
  ctx.arc(35, 15, 6, 0, Math.PI * 2);
  ctx.fillStyle = '#8b5a10';
  ctx.fill();
  ctx.beginPath();
  ctx.arc(32, 20, 7, 0, Math.PI * 2);
  ctx.fillStyle = '#9a6a18';
  ctx.fill();
  // Highlights
  ctx.beginPath();
  ctx.arc(29, 12, 4, 0, Math.PI * 2);
  ctx.fillStyle = '#a57820';
  ctx.fill();

  // ── Head ──
  oCircle(ctx, 36, 15, 7.5, '#e8a628');
  ctx.beginPath();
  ctx.arc(35, 13, 4, 0, Math.PI * 2);
  ctx.fillStyle = '#f0b838';
  ctx.fill();

  // ── Ears ──
  oCircle(ctx, 30, 8, 3, '#c48e20');
  ctx.beginPath();
  ctx.arc(30, 8, 1.5, 0, Math.PI * 2);
  ctx.fillStyle = '#e0b858';
  ctx.fill();
  oCircle(ctx, 36, 7, 3, '#c48e20');
  ctx.beginPath();
  ctx.arc(36, 7, 1.5, 0, Math.PI * 2);
  ctx.fillStyle = '#e0b858';
  ctx.fill();

  // ── Muzzle ──
  oEllipse(ctx, 41, 17, 4, 3, '#f0c858');
  nose(ctx, 43, 16, 2, 1.5, '#3a2008');

  // ── Eye ──
  eye(ctx, 38, 13.5, 2, 1);

  // ── Mouth open (roar!) ──
  ctx.beginPath();
  ctx.moveTo(40, 18);
  ctx.lineTo(43, 19);
  ctx.lineTo(39, 20);
  ctx.closePath();
  ctx.fillStyle = '#8a2020';
  ctx.fill();

  canvas.refresh();
}

// ── Zebra - 48×48, 2 frames ────────────────────────────────
function generateZebraSprite(scene) {
  const frames = 2;
  const w = 48, h = 48;
  const canvas = scene.textures.createCanvas('zebra', w * frames, h);
  const ctx = canvas.getContext();
  ctx.imageSmoothingEnabled = false;

  for (let f = 0; f < frames; f++) {
    const ox = f * w;
    const bounce = f * 2;

    ctx.save();
    ctx.translate(ox, 0);

    // ── Tail ──
    ctx.strokeStyle = OL;
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(7, 22 + bounce);
    ctx.quadraticCurveTo(3, 16 + bounce, 4, 12 + bounce);
    ctx.stroke();
    ctx.strokeStyle = '#222';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(7, 22 + bounce);
    ctx.quadraticCurveTo(3, 16 + bounce, 4, 12 + bounce);
    ctx.stroke();
    // Tail tip
    ctx.fillStyle = '#111';
    ctx.fillRect(2, 10 + bounce, 4, 3);

    // ── Back legs ──
    const lp = f * Math.PI;
    leg(ctx, 14 + Math.sin(lp + Math.PI) * 3, 36 + bounce, 3, 10, '#e8e8e8', '#d0d0d0', '#333');
    leg(ctx, 10 + Math.sin(lp) * 3, 36 + bounce, 3, 10, '#e8e8e8', '#d0d0d0', '#333');
    // Leg stripes
    ctx.fillStyle = '#222';
    ctx.fillRect(14 + Math.sin(lp + Math.PI) * 3, 38 + bounce, 3, 2);
    ctx.fillRect(10 + Math.sin(lp) * 3, 40 + bounce, 3, 2);

    // ── Body ──
    oEllipse(ctx, 24, 27 + bounce, 16, 11, '#f0f0f0');
    // Body shadow
    ctx.beginPath();
    ctx.ellipse(24, 31 + bounce, 13, 5, 0, 0, Math.PI * 2);
    ctx.fillStyle = '#d8d8d8';
    ctx.fill();
    // Stripes on body - curved, not straight
    ctx.fillStyle = '#1a1a1a';
    for (let i = 0; i < 6; i++) {
      const sx = 11 + i * 5;
      const sy = 20 + bounce;
      ctx.save();
      ctx.translate(sx, sy);
      ctx.rotate(-0.1 + i * 0.04);
      ctx.fillRect(0, 0, 2.5, 16);
      ctx.restore();
    }

    // ── Front legs ──
    leg(ctx, 28 + Math.sin(lp) * 3, 36 + bounce, 3, 10, '#f0f0f0', '#d8d8d8', '#333');
    leg(ctx, 23 + Math.sin(lp + Math.PI) * 3, 36 + bounce, 3, 10, '#f0f0f0', '#d8d8d8', '#333');
    // Leg stripes
    ctx.fillStyle = '#222';
    ctx.fillRect(28 + Math.sin(lp) * 3, 39 + bounce, 3, 2);
    ctx.fillRect(23 + Math.sin(lp + Math.PI) * 3, 41 + bounce, 3, 2);

    // ── Neck ──
    oRect(ctx, 32, 14 + bounce, 6, 16, '#f0f0f0');
    // Neck stripes
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(33, 16 + bounce, 2, 3);
    ctx.fillRect(33, 21 + bounce, 2, 3);
    ctx.fillRect(33, 26 + bounce, 2, 3);

    // ── Head ──
    oEllipse(ctx, 37, 16 + bounce, 6, 8, '#f0f0f0', OL, 1.5, 0.3);
    // Head stripe
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(35, 12 + bounce, 2, 10);
    // Muzzle
    oEllipse(ctx, 40, 22 + bounce, 4, 3, '#ddd');
    // Nostril
    ctx.beginPath();
    ctx.arc(42, 22 + bounce, 1, 0, Math.PI * 2);
    ctx.fillStyle = '#444';
    ctx.fill();

    // ── Mane (standing up - mohawk) ──
    ctx.fillStyle = '#111';
    for (let i = 0; i < 5; i++) {
      ctx.fillRect(30 + i * 2, 10 + bounce - i * 0.5, 2, 4 + i);
    }

    // ── Eye ──
    eye(ctx, 38, 15 + bounce, 1.8, 1);

    // ── Ears ──
    oEllipse(ctx, 33, 8 + bounce, 2, 4, '#e0e0e0', OL, 1, -0.3);
    oEllipse(ctx, 37, 7 + bounce, 2, 4, '#e0e0e0', OL, 1, 0.1);

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

// ── Giraffe - 48×56, 2 frames ──────────────────────────────
function generateGiraffeSprite(scene) {
  const frames = 2;
  const w = 48, h = 56;
  const canvas = scene.textures.createCanvas('giraffe', w * frames, h);
  const ctx = canvas.getContext();
  ctx.imageSmoothingEnabled = false;

  for (let f = 0; f < frames; f++) {
    const ox = f * w;
    const bounce = f * 1.5;

    ctx.save();
    ctx.translate(ox, 0);

    // ── Tail ──
    ctx.strokeStyle = OL;
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(8, 32 + bounce);
    ctx.lineTo(3, 26 + bounce);
    ctx.stroke();
    ctx.strokeStyle = '#a07828';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(8, 32 + bounce);
    ctx.lineTo(3, 26 + bounce);
    ctx.stroke();
    oCircle(ctx, 3, 25 + bounce, 2, '#5a3a10');

    // ── Back legs ──
    const lp = f * Math.PI;
    leg(ctx, 12 + Math.sin(lp + Math.PI) * 2, 43 + bounce, 3, 12, '#c49a38', '#b08a30', '#5a3a10');
    leg(ctx, 8 + Math.sin(lp) * 2, 43 + bounce, 3, 12, '#c49a38', '#b08a30', '#5a3a10');

    // ── Body ──
    oEllipse(ctx, 22, 36 + bounce, 14, 10, '#d4a843');
    // Body belly
    ctx.beginPath();
    ctx.ellipse(22, 39 + bounce, 11, 5, 0, 0, Math.PI * 2);
    ctx.fillStyle = '#e0b858';
    ctx.fill();
    // Body shadow
    ctx.beginPath();
    ctx.ellipse(20, 32 + bounce, 11, 4, 0, Math.PI, Math.PI * 2);
    ctx.fillStyle = '#b89038';
    ctx.fill();
    // Spots on body
    ctx.fillStyle = '#7a5520';
    const bodySpots = [[16, 33], [21, 31], [27, 34], [18, 38], [25, 37], [13, 36]];
    bodySpots.forEach(([sx, sy]) => {
      ctx.beginPath();
      ctx.ellipse(sx, sy + bounce, 3, 2.5, Math.random() * 0.3, 0, Math.PI * 2);
      ctx.fill();
    });

    // ── Front legs ──
    leg(ctx, 24 + Math.sin(lp) * 2, 43 + bounce, 3, 12, '#d4a843', '#c49a38', '#5a3a10');
    leg(ctx, 18 + Math.sin(lp + Math.PI) * 2, 43 + bounce, 3, 12, '#d4a843', '#c49a38', '#5a3a10');

    // ── Neck ──
    oRect(ctx, 28, 8 + bounce, 8, 28, '#d4a843');
    // Neck lighter center
    ctx.fillStyle = '#e0b858';
    ctx.fillRect(30, 10 + bounce, 4, 24);
    // Neck spots
    ctx.fillStyle = '#7a5520';
    ctx.beginPath(); ctx.ellipse(32, 14 + bounce, 2.5, 2, 0, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(30, 20 + bounce, 2.5, 2, 0, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(33, 26 + bounce, 2.5, 2, 0, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(31, 32 + bounce, 2.5, 2, 0, 0, Math.PI * 2); ctx.fill();

    // ── Head ──
    oEllipse(ctx, 34, 8 + bounce, 7, 6, '#d4a843', OL, 1.5, 0.2);
    // Face highlight
    ctx.beginPath();
    ctx.arc(33, 6 + bounce, 3, 0, Math.PI * 2);
    ctx.fillStyle = '#e0b858';
    ctx.fill();
    // Muzzle
    oEllipse(ctx, 39, 10 + bounce, 3.5, 2.5, '#e0c068');
    // Nostrils
    ctx.fillStyle = '#5a3a10';
    ctx.fillRect(40, 10 + bounce, 1.5, 1);
    ctx.fillRect(41.5, 10 + bounce, 1.5, 1);

    // ── Ossicones (horns) ──
    oRect(ctx, 30, 0 + bounce, 2, 6, '#7a5520');
    oCircle(ctx, 31, 0 + bounce, 2, '#9a7530');
    oRect(ctx, 35, 0 + bounce, 2, 6, '#7a5520');
    oCircle(ctx, 36, 0 + bounce, 2, '#9a7530');

    // ── Eye ──
    eye(ctx, 37, 6.5 + bounce, 1.5, 1);

    // ── Ears ──
    oEllipse(ctx, 29, 5 + bounce, 2, 3, '#c49a38', OL, 1, -0.4);
    oEllipse(ctx, 38, 4 + bounce, 2, 3, '#c49a38', OL, 1, 0.3);

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

// ── Eagle - 48×32, 4 frames ────────────────────────────────
function generateEagleSprite(scene) {
  const frames = 4;
  const w = 48, h = 32;
  const canvas = scene.textures.createCanvas('eagle', w * frames, h);
  const ctx = canvas.getContext();
  ctx.imageSmoothingEnabled = false;

  for (let f = 0; f < frames; f++) {
    const ox = f * w;
    const wingAngle = Math.sin((f / frames) * Math.PI * 2) * 0.6;

    ctx.save();
    ctx.translate(ox, 0);

    // ── Wings ──
    // Left wing (behind body)
    ctx.save();
    ctx.translate(24, 16);
    ctx.rotate(-wingAngle - 0.3);
    // Wing outline
    ctx.beginPath();
    ctx.ellipse(-12, 0, 15, 5.5, 0, 0, Math.PI * 2);
    ctx.fillStyle = OL;
    ctx.fill();
    // Wing main
    ctx.beginPath();
    ctx.ellipse(-12, 0, 14, 5, 0, 0, Math.PI * 2);
    ctx.fillStyle = '#5c3a1e';
    ctx.fill();
    // Wing highlight
    ctx.beginPath();
    ctx.ellipse(-10, -1, 10, 3, 0, 0, Math.PI * 2);
    ctx.fillStyle = '#7a5030';
    ctx.fill();
    // Flight feathers (tips)
    ctx.fillStyle = '#3d2510';
    ctx.fillRect(-26, -2, 8, 2);
    ctx.fillRect(-24, 0, 6, 2);
    ctx.fillRect(-22, 2, 4, 2);
    ctx.restore();

    // Right wing (behind body)
    ctx.save();
    ctx.translate(24, 16);
    ctx.rotate(wingAngle + 0.3);
    ctx.beginPath();
    ctx.ellipse(12, 0, 15, 5.5, 0, 0, Math.PI * 2);
    ctx.fillStyle = OL;
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(12, 0, 14, 5, 0, 0, Math.PI * 2);
    ctx.fillStyle = '#5c3a1e';
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(10, -1, 10, 3, 0, 0, Math.PI * 2);
    ctx.fillStyle = '#7a5030';
    ctx.fill();
    // Flight feathers
    ctx.fillStyle = '#3d2510';
    ctx.fillRect(18, -2, 8, 2);
    ctx.fillRect(18, 0, 6, 2);
    ctx.fillRect(18, 2, 4, 2);
    ctx.restore();

    // ── Tail feathers ──
    oEllipse(ctx, 12, 17, 6, 4, '#3d2510', OL, 1);
    ctx.fillStyle = '#5c3a1e';
    ctx.fillRect(8, 15, 3, 2);
    ctx.fillRect(10, 17, 3, 2);

    // ── Body ──
    oEllipse(ctx, 24, 16, 8, 6.5, '#3d2510');
    // Body highlight
    ctx.beginPath();
    ctx.ellipse(24, 14, 5, 3, 0, 0, Math.PI * 2);
    ctx.fillStyle = '#5c3a1e';
    ctx.fill();
    // Breast (lighter brown)
    ctx.beginPath();
    ctx.ellipse(26, 18, 4, 3, 0, 0, Math.PI * 2);
    ctx.fillStyle = '#7a5030';
    ctx.fill();

    // ── Head (white - bald eagle) ──
    oCircle(ctx, 33, 11, 5.5, '#f8f8f0');
    // Head highlight
    ctx.beginPath();
    ctx.arc(32, 9, 3, 0, Math.PI * 2);
    ctx.fillStyle = '#ffffff';
    ctx.fill();

    // ── Beak ──
    // Beak outline
    ctx.beginPath();
    ctx.moveTo(38, 10);
    ctx.lineTo(44, 12);
    ctx.lineTo(38, 14);
    ctx.closePath();
    ctx.fillStyle = OL;
    ctx.fill();
    // Beak fill
    ctx.beginPath();
    ctx.moveTo(38, 10.5);
    ctx.lineTo(43, 12);
    ctx.lineTo(38, 13.5);
    ctx.closePath();
    ctx.fillStyle = '#f5a623';
    ctx.fill();
    // Beak highlight
    ctx.beginPath();
    ctx.moveTo(38, 10.5);
    ctx.lineTo(41, 11.5);
    ctx.lineTo(38, 12);
    ctx.closePath();
    ctx.fillStyle = '#ffc040';
    ctx.fill();

    // ── Eye ──
    eye(ctx, 35, 10.5, 1.5, 1);

    // ── Talons ──
    ctx.fillStyle = '#f5a623';
    ctx.fillRect(22, 22, 2, 3);
    ctx.fillRect(24, 22, 2, 3);
    ctx.fillRect(26, 22, 2, 3);
    // Claws
    ctx.fillStyle = '#333';
    ctx.fillRect(21, 25, 2, 1);
    ctx.fillRect(24, 25, 2, 1);
    ctx.fillRect(27, 25, 2, 1);

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

// ── Ground tile - 64×80 ────────────────────────────────────
function generateGroundTile(scene) {
  const w = 64, h = 80;
  const canvas = scene.textures.createCanvas('ground_tile', w, h);
  const ctx = canvas.getContext();
  ctx.imageSmoothingEnabled = false;

  // Main dirt
  ctx.fillStyle = '#a67832';
  ctx.fillRect(0, 0, w, h);

  // Dirt layers (lighter at top, darker at bottom)
  ctx.fillStyle = '#b08838';
  ctx.fillRect(0, 8, w, 20);
  ctx.fillStyle = '#9a6e2a';
  ctx.fillRect(0, 50, w, 30);

  // Top grass - thick
  ctx.fillStyle = '#6a9e38';
  ctx.fillRect(0, 0, w, 4);
  ctx.fillStyle = '#7ab648';
  ctx.fillRect(0, 0, w, 2);

  // Grass tufts (pixel-art style)
  ctx.fillStyle = '#8ec455';
  for (let i = 0; i < 8; i++) {
    const gx = 2 + i * 8;
    // Triangle tuft
    ctx.fillRect(gx, 0, 2, -3 - (i % 3) * 2);
    ctx.fillRect(gx + 3, 0, 2, -2 - (i % 2) * 2);
  }

  // Dark grass line
  ctx.fillStyle = '#5a8830';
  ctx.fillRect(0, 4, w, 2);

  // Dirt texture - small pebbles
  ctx.fillStyle = '#9a6e2a';
  for (let i = 0; i < 12; i++) {
    const dx = (i * 7 + 3) % w;
    const dy = 10 + (i * 11 + 5) % (h - 16);
    ctx.fillRect(dx, dy, 2 + (i % 3), 2);
  }

  // Rock details
  ctx.fillStyle = '#8a6428';
  const rocks = [[10, 25], [35, 40], [50, 55], [20, 60], [45, 20]];
  rocks.forEach(([rx, ry]) => {
    ctx.beginPath();
    ctx.arc(rx, ry, 2 + (rx % 3), 0, Math.PI * 2);
    ctx.fill();
  });

  // Root-like lines
  ctx.strokeStyle = '#7a5820';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(5, 30);
  ctx.lineTo(20, 35);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(40, 50);
  ctx.lineTo(55, 48);
  ctx.stroke();

  canvas.refresh();
}

// ── Hole tile - 64×80 ──────────────────────────────────────
function generateHoleTile(scene) {
  const w = 64, h = 80;
  const canvas = scene.textures.createCanvas('hole_tile', w, h);
  const ctx = canvas.getContext();
  ctx.imageSmoothingEnabled = false;

  // Dark abyss gradient
  const grad = ctx.createLinearGradient(0, 0, 0, h);
  grad.addColorStop(0, '#1a0a00');
  grad.addColorStop(0.3, '#0d0500');
  grad.addColorStop(1, '#050200');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, w, h);

  // Left edge (dirt wall)
  ctx.fillStyle = '#6d4e22';
  ctx.fillRect(0, 0, 4, h);
  ctx.fillStyle = '#5a3e18';
  ctx.fillRect(2, 0, 2, h);

  // Right edge
  ctx.fillStyle = '#6d4e22';
  ctx.fillRect(w - 4, 0, 4, h);
  ctx.fillStyle = '#5a3e18';
  ctx.fillRect(w - 4, 0, 2, h);

  // Dirt drips
  ctx.fillStyle = '#3d2a10';
  for (let i = 0; i < 5; i++) {
    const dx = 6 + (i * 13) % (w - 12);
    ctx.fillRect(dx, 0, 2, 6 + (i * 7) % 12);
  }

  // Roots hanging
  ctx.strokeStyle = '#4a3218';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(15, 0);
  ctx.quadraticCurveTo(18, 10, 14, 18);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(42, 0);
  ctx.quadraticCurveTo(44, 8, 40, 14);
  ctx.stroke();

  canvas.refresh();
}

// ── River tile - 64×80 ─────────────────────────────────────
function generateRiverTile(scene) {
  const w = 64, h = 80;
  const canvas = scene.textures.createCanvas('river_tile', w, h);
  const ctx = canvas.getContext();
  ctx.imageSmoothingEnabled = false;

  // Water gradient
  const gradient = ctx.createLinearGradient(0, 0, 0, h);
  gradient.addColorStop(0, '#2196f3');
  gradient.addColorStop(0.3, '#1e88e5');
  gradient.addColorStop(0.6, '#1976d2');
  gradient.addColorStop(1, '#0d47a1');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, w, h);

  // Wave highlights
  ctx.strokeStyle = '#64b5f6';
  ctx.lineWidth = 2;
  for (let i = 0; i < 5; i++) {
    const wy = 6 + i * 16;
    ctx.beginPath();
    ctx.moveTo(0, wy);
    ctx.quadraticCurveTo(w / 4, wy - 4, w / 2, wy);
    ctx.quadraticCurveTo(w * 3 / 4, wy + 4, w, wy);
    ctx.stroke();
  }

  // Sparkle pixels
  ctx.fillStyle = '#bbdefb';
  ctx.fillRect(12, 8, 2, 2);
  ctx.fillRect(38, 24, 2, 2);
  ctx.fillRect(52, 45, 2, 2);
  ctx.fillRect(24, 60, 2, 2);

  // Foam at top
  ctx.fillStyle = '#e3f2fd';
  ctx.fillRect(0, 0, w, 3);
  ctx.fillStyle = '#bbdefb80';
  ctx.fillRect(0, 3, w, 2);

  canvas.refresh();
}

// ── Parallax backgrounds ───────────────────────────────────
function generateParallaxLayers(scene) {
  // ── Sky ──
  {
    const w = 800, h = 450;
    const canvas = scene.textures.createCanvas('bg_sky', w, h);
    const ctx = canvas.getContext();
    ctx.imageSmoothingEnabled = false;

    // Sky gradient - warm sunset savanna
    const gradient = ctx.createLinearGradient(0, 0, 0, h);
    gradient.addColorStop(0, '#1a3a6a');
    gradient.addColorStop(0.15, '#2a5a9a');
    gradient.addColorStop(0.35, '#5a8ac0');
    gradient.addColorStop(0.55, '#8ab8e0');
    gradient.addColorStop(0.7, '#e0c890');
    gradient.addColorStop(0.85, '#e8a050');
    gradient.addColorStop(1, '#d08040');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, w, h);

    // Pixel-art grid overlay (subtle)
    ctx.strokeStyle = 'rgba(255,255,255,0.03)';
    ctx.lineWidth = 1;
    for (let x = 0; x < w; x += 32) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, h);
      ctx.stroke();
    }
    for (let y = 0; y < h; y += 32) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();
    }

    // Sun with glow
    // Outer glow
    const sunGrad = ctx.createRadialGradient(650, 85, 10, 650, 85, 80);
    sunGrad.addColorStop(0, 'rgba(255,220,100,0.6)');
    sunGrad.addColorStop(0.5, 'rgba(255,200,80,0.2)');
    sunGrad.addColorStop(1, 'rgba(255,180,60,0)');
    ctx.fillStyle = sunGrad;
    ctx.fillRect(570, 5, 160, 160);
    // Sun disc
    oCircle(ctx, 650, 85, 30, '#fff4c8', '#ffd700', 2);
    // Sun highlight
    ctx.beginPath();
    ctx.arc(645, 78, 18, 0, Math.PI * 2);
    ctx.fillStyle = '#fffbe8';
    ctx.fill();

    // Clouds - pixel-art style
    drawPixelCloud(ctx, 80, 50, 70);
    drawPixelCloud(ctx, 300, 90, 55);
    drawPixelCloud(ctx, 480, 40, 60);
    drawPixelCloud(ctx, 700, 110, 45);
    drawPixelCloud(ctx, 180, 120, 40);

    canvas.refresh();
  }

  // ── Mountains ──
  {
    const w = 1200, h = 200;
    const canvas = scene.textures.createCanvas('bg_mountains', w, h);
    const ctx = canvas.getContext();
    ctx.imageSmoothingEnabled = false;
    ctx.clearRect(0, 0, w, h);

    // Far mountains (blueish)
    drawPixelMountainRange(ctx, w, h, 0.6, 120, '#6a6080', '#7a708a');
    // Near mountains (brownish)
    drawPixelMountainRange(ctx, w, h, 0.8, 80, '#6d5e3f', '#7a6a4a');

    // Foothills
    ctx.fillStyle = '#8a7a58';
    ctx.beginPath();
    ctx.moveTo(0, h);
    for (let x = 0; x <= w; x += 40) {
      ctx.lineTo(x, h - 20 - Math.sin(x * 0.01) * 15 - Math.random() * 5);
    }
    ctx.lineTo(w, h);
    ctx.closePath();
    ctx.fill();

    canvas.refresh();
  }

  // ── Trees (savanna acacia) ──
  {
    const w = 1600, h = 180;
    const canvas = scene.textures.createCanvas('bg_trees', w, h);
    const ctx = canvas.getContext();
    ctx.imageSmoothingEnabled = false;
    ctx.clearRect(0, 0, w, h);

    // Ground grass line
    ctx.fillStyle = '#7a9a40';
    ctx.fillRect(0, h - 8, w, 8);
    ctx.fillStyle = '#8ab048';
    ctx.fillRect(0, h - 4, w, 4);

    // Grass tufts
    ctx.fillStyle = '#6a8a38';
    for (let x = 0; x < w; x += 6) {
      const gh = 3 + (x * 7 + 11) % 5;
      ctx.fillRect(x, h - 8 - gh, 2, gh);
    }

    for (let i = 0; i < 18; i++) {
      const tx = i * 90 + (i * 37 + 13) % 40;
      const ty = h - 10;
      const th = 50 + (i * 23 + 7) % 70;
      drawAcaciaTree(ctx, tx, ty, th);
    }

    // Small bushes between trees
    ctx.fillStyle = '#5a8028';
    for (let i = 0; i < 30; i++) {
      const bx = (i * 53 + 17) % w;
      const by = h - 10;
      ctx.beginPath();
      ctx.ellipse(bx, by, 8 + i % 5, 5 + i % 3, 0, 0, Math.PI * 2);
      ctx.fill();
    }

    canvas.refresh();
  }
}

function drawPixelCloud(ctx, x, y, size) {
  const s = size;
  // Shadow
  ctx.fillStyle = 'rgba(0,0,0,0.05)';
  ctx.beginPath();
  ctx.arc(x + 2, y + 3, s * 0.5, 0, Math.PI * 2);
  ctx.arc(x + s * 0.4 + 2, y - s * 0.15 + 3, s * 0.4, 0, Math.PI * 2);
  ctx.arc(x + s * 0.7 + 2, y + 3, s * 0.35, 0, Math.PI * 2);
  ctx.fill();
  // Main cloud
  ctx.fillStyle = 'rgba(255,255,255,0.5)';
  ctx.beginPath();
  ctx.arc(x, y, s * 0.5, 0, Math.PI * 2);
  ctx.arc(x + s * 0.4, y - s * 0.15, s * 0.4, 0, Math.PI * 2);
  ctx.arc(x + s * 0.7, y, s * 0.35, 0, Math.PI * 2);
  ctx.arc(x + s * 0.35, y + s * 0.1, s * 0.3, 0, Math.PI * 2);
  ctx.fill();
  // Highlight
  ctx.fillStyle = 'rgba(255,255,255,0.3)';
  ctx.beginPath();
  ctx.arc(x + s * 0.1, y - s * 0.05, s * 0.35, 0, Math.PI * 2);
  ctx.arc(x + s * 0.4, y - s * 0.2, s * 0.25, 0, Math.PI * 2);
  ctx.fill();
}

function drawPixelMountainRange(ctx, w, h, amplitude, baseOffset, mainColor, highlightColor) {
  ctx.beginPath();
  ctx.moveTo(0, h);
  const segments = 20;
  const peaks = [];
  for (let i = 0; i <= segments; i++) {
    const x = (i / segments) * w;
    const y = h - baseOffset - Math.sin(i * 0.8) * h * amplitude * 0.4
              - ((i * 37 + 11) % 30); // deterministic "random"
    ctx.lineTo(x, y);
    peaks.push({ x, y });
  }
  ctx.lineTo(w, h);
  ctx.closePath();
  ctx.fillStyle = mainColor;
  ctx.fill();

  // Snow caps / highlights on peaks
  ctx.fillStyle = highlightColor;
  for (let i = 1; i < peaks.length - 1; i++) {
    if (peaks[i].y < peaks[i - 1].y && peaks[i].y < peaks[i + 1].y) {
      ctx.beginPath();
      ctx.moveTo(peaks[i].x - 15, peaks[i].y + 10);
      ctx.lineTo(peaks[i].x, peaks[i].y);
      ctx.lineTo(peaks[i].x + 15, peaks[i].y + 10);
      ctx.closePath();
      ctx.fill();
    }
  }
}

function drawAcaciaTree(ctx, x, y, height) {
  // Trunk with outline
  ctx.fillStyle = OL;
  ctx.fillRect(x - 4, y - height * 0.45, 8, height * 0.45 + 2);
  ctx.fillStyle = '#5d4037';
  ctx.fillRect(x - 3, y - height * 0.45, 6, height * 0.45);
  // Trunk highlight
  ctx.fillStyle = '#6d5047';
  ctx.fillRect(x - 1, y - height * 0.45, 2, height * 0.45);
  // Bark texture
  ctx.fillStyle = '#4d3027';
  for (let i = 0; i < 3; i++) {
    ctx.fillRect(x - 2, y - height * 0.1 * (i + 1), 4, 1);
  }

  // Canopy (flat top acacia style) - with outline
  ctx.fillStyle = OL;
  ctx.beginPath();
  ctx.ellipse(x, y - height * 0.55, height * 0.42, height * 0.18, 0, 0, Math.PI * 2);
  ctx.fill();
  // Main canopy
  ctx.fillStyle = '#4a7a28';
  ctx.beginPath();
  ctx.ellipse(x, y - height * 0.55, height * 0.4, height * 0.16, 0, 0, Math.PI * 2);
  ctx.fill();
  // Canopy highlight
  ctx.fillStyle = '#6a9a38';
  ctx.beginPath();
  ctx.ellipse(x + 5, y - height * 0.6, height * 0.28, height * 0.1, 0, 0, Math.PI * 2);
  ctx.fill();
  // Dark underside
  ctx.fillStyle = '#3a6a20';
  ctx.beginPath();
  ctx.ellipse(x - 3, y - height * 0.48, height * 0.3, height * 0.08, 0, 0, Math.PI * 2);
  ctx.fill();
}

// ── Particle ───────────────────────────────────────────────
function generateParticle(scene) {
  const w = 8, h = 8;
  const canvas = scene.textures.createCanvas('particle', w, h);
  const ctx = canvas.getContext();
  ctx.imageSmoothingEnabled = false;

  // Pixel-art particle (2x2 blocks)
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(2, 1, 4, 6);
  ctx.fillRect(1, 2, 6, 4);

  canvas.refresh();
}

// ── Tree (obstacle) ────────────────────────────────────────
function generateTreeSprite(scene) {
  const w = 64, h = 100;
  const canvas = scene.textures.createCanvas('tree', w, h);
  const ctx = canvas.getContext();
  ctx.imageSmoothingEnabled = false;

  // Trunk with outline
  ctx.fillStyle = OL;
  ctx.fillRect(26, 38, 12, 62);
  ctx.fillStyle = '#5d4037';
  ctx.fillRect(27, 39, 10, 61);
  // Trunk highlight
  ctx.fillStyle = '#6d5047';
  ctx.fillRect(30, 39, 3, 61);
  // Bark lines
  ctx.fillStyle = '#4d3027';
  for (let i = 0; i < 5; i++) {
    ctx.fillRect(28, 45 + i * 12, 8, 1);
  }

  // Canopy - large acacia
  // Outline
  ctx.fillStyle = OL;
  ctx.beginPath();
  ctx.ellipse(32, 28, 31, 21, 0, 0, Math.PI * 2);
  ctx.fill();
  // Main
  ctx.fillStyle = '#4a7a28';
  ctx.beginPath();
  ctx.ellipse(32, 28, 30, 20, 0, 0, Math.PI * 2);
  ctx.fill();
  // Highlight layer
  ctx.fillStyle = '#6a9a38';
  ctx.beginPath();
  ctx.ellipse(36, 23, 20, 12, 0, 0, Math.PI * 2);
  ctx.fill();
  // Dark underside
  ctx.fillStyle = '#3a6a20';
  ctx.beginPath();
  ctx.ellipse(28, 35, 22, 8, 0, 0, Math.PI * 2);
  ctx.fill();

  // Leaf clusters
  ctx.fillStyle = '#5a8a30';
  for (let i = 0; i < 6; i++) {
    const lx = 10 + (i * 11) % 44;
    const ly = 18 + (i * 7) % 20;
    ctx.beginPath();
    ctx.arc(lx, ly, 5 + i % 3, 0, Math.PI * 2);
    ctx.fill();
  }

  canvas.refresh();
}

// ── Hunter ─────────────────────────────────────────────────
function generateHunterSprite(scene) {
  const w = 32, h = 48;
  const canvas = scene.textures.createCanvas('hunter', w, h);
  const ctx = canvas.getContext();
  ctx.imageSmoothingEnabled = false;

  // ── Legs ──
  oRect(ctx, 10, 30, 4, 16, '#4a3728');
  oRect(ctx, 18, 30, 4, 16, '#4a3728');
  // Boots
  oRect(ctx, 8, 43, 8, 5, '#2d1a10');
  oRect(ctx, 16, 43, 8, 5, '#2d1a10');

  // ── Body ──
  oRect(ctx, 8, 14, 16, 16, '#5b7553');
  // Shirt highlight
  ctx.fillStyle = '#6b8563';
  ctx.fillRect(10, 16, 4, 12);
  // Pockets
  ctx.strokeStyle = '#4a6443';
  ctx.lineWidth = 1;
  ctx.strokeRect(10, 22, 4, 4);
  ctx.strokeRect(18, 22, 4, 4);
  // Belt
  oRect(ctx, 8, 29, 16, 2, '#3a2a18');
  ctx.fillStyle = '#c8a848';
  ctx.fillRect(14, 29, 4, 2);

  // ── Head ──
  oCircle(ctx, 16, 9, 6, '#c68642');
  // Face shadow
  ctx.beginPath();
  ctx.arc(16, 11, 4, 0, Math.PI);
  ctx.fillStyle = '#b07838';
  ctx.fill();

  // ── Eyes ──
  eye(ctx, 13, 8, 1.2, 1);
  eye(ctx, 19, 8, 1.2, -1);

  // ── Nose ──
  ctx.fillStyle = '#a06830';
  ctx.fillRect(15, 10, 2, 2);

  // ── Hat ──
  oRect(ctx, 5, 1, 22, 4, '#4a3728');
  oRect(ctx, 9, -3, 14, 5, '#5a4738');
  // Hat band
  ctx.fillStyle = '#3a2718';
  ctx.fillRect(9, 1, 14, 1);

  // ── Gun ──
  oRect(ctx, 0, 20, 26, 3, '#555');
  // Gun detail
  ctx.fillStyle = '#666';
  ctx.fillRect(2, 20, 3, 3);
  // Barrel
  ctx.fillStyle = '#444';
  ctx.fillRect(0, 20, 2, 3);

  canvas.refresh();
}

// ── Meerkat - 24×32, 2 frames ──────────────────────────────
function generateMeerkatSprite(scene) {
  const frames = 2;
  const w = 24, h = 32;
  const canvas = scene.textures.createCanvas('meerkat', w * frames, h);
  const ctx = canvas.getContext();
  ctx.imageSmoothingEnabled = false;

  for (let f = 0; f < frames; f++) {
    const ox = f * w;
    const bounce = f * 2;
    ctx.save();
    ctx.translate(ox, 0);

    // ── Feet ──
    oRect(ctx, 7, 28 + bounce, 4, 3, '#a08040');
    oRect(ctx, 13, 28 + bounce, 4, 3, '#a08040');

    // ── Body (standing upright) ──
    oEllipse(ctx, 12, 20 + bounce, 6, 10, '#d4a060');
    // Belly (lighter)
    ctx.beginPath();
    ctx.ellipse(12, 22 + bounce, 4, 7, 0, 0, Math.PI * 2);
    ctx.fillStyle = '#e0c080';
    ctx.fill();
    // Back shade
    ctx.beginPath();
    ctx.ellipse(10, 17 + bounce, 3, 6, 0, Math.PI, Math.PI * 2);
    ctx.fillStyle = '#b88848';
    ctx.fill();

    // ── Arms ──
    oRect(ctx, 5, 18 + bounce, 3, 6, '#c49858');
    oRect(ctx, 16, 18 + bounce, 3, 6, '#c49858');

    // ── Head ──
    oCircle(ctx, 12, 8 + bounce, 5.5, '#d4a060');
    // Face lighter area
    ctx.beginPath();
    ctx.ellipse(12, 9 + bounce, 3.5, 4, 0, 0, Math.PI * 2);
    ctx.fillStyle = '#e0c080';
    ctx.fill();

    // ── Dark mask around eyes ──
    ctx.fillStyle = '#6a4a28';
    ctx.fillRect(7, 5 + bounce, 4, 3);
    ctx.fillRect(13, 5 + bounce, 4, 3);

    // ── Eyes ──
    eye(ctx, 9, 6 + bounce, 1.3, 1);
    eye(ctx, 15, 6 + bounce, 1.3, -1);

    // ── Nose ──
    nose(ctx, 12, 9 + bounce, 1.5, 1, '#3a2008');

    // ── Ears ──
    oCircle(ctx, 7, 4 + bounce, 2, '#c49858');
    oCircle(ctx, 17, 4 + bounce, 2, '#c49858');

    ctx.restore();
  }

  canvas.refresh();
  scene.textures.get('meerkat').add(0, 0, 0, 0, w, h);
  scene.textures.get('meerkat').add(1, 0, w, 0, w, h);
  scene.anims.create({
    key: 'meerkat_idle',
    frames: [{ key: 'meerkat', frame: 0 }, { key: 'meerkat', frame: 1 }],
    frameRate: 4,
    repeat: -1,
  });
}

// ── Hare - 24×24, 2 frames ────────────────────────────────
function generateHareSprite(scene) {
  const frames = 2;
  const w = 24, h = 24;
  const canvas = scene.textures.createCanvas('hare', w * frames, h);
  const ctx = canvas.getContext();
  ctx.imageSmoothingEnabled = false;

  for (let f = 0; f < frames; f++) {
    const ox = f * w;
    const bounce = f * 2;
    ctx.save();
    ctx.translate(ox, 0);

    // ── Cotton tail ──
    oCircle(ctx, 4, 16 + bounce, 2.5, '#f0e8e0');

    // ── Back legs (sitting) ──
    oEllipse(ctx, 8, 19 + bounce, 5, 3, '#b8a070');

    // ── Body ──
    oEllipse(ctx, 12, 15 + bounce, 7, 5.5, '#c9a872');
    // Body highlight
    ctx.beginPath();
    ctx.ellipse(12, 13 + bounce, 5, 3, 0, 0, Math.PI * 2);
    ctx.fillStyle = '#d8b880';
    ctx.fill();
    // Belly
    ctx.beginPath();
    ctx.ellipse(12, 17 + bounce, 4, 3, 0, 0, Math.PI * 2);
    ctx.fillStyle = '#e0c898';
    ctx.fill();

    // ── Front paws ──
    oRect(ctx, 16, 18 + bounce, 3, 3, '#d4b480');

    // ── Head ──
    oCircle(ctx, 17, 11 + bounce, 4.5, '#c9a872');
    // Face
    ctx.beginPath();
    ctx.arc(18, 12 + bounce, 3, 0, Math.PI * 2);
    ctx.fillStyle = '#d8b880';
    ctx.fill();
    // Cheek
    ctx.beginPath();
    ctx.arc(19, 13 + bounce, 2, 0, Math.PI * 2);
    ctx.fillStyle = '#e0c898';
    ctx.fill();

    // ── Ears (long!) ──
    // Left ear
    oEllipse(ctx, 14, 3 + bounce, 2, 5, '#c9a872', OL, 1);
    ctx.beginPath();
    ctx.ellipse(14, 3 + bounce, 1, 4, 0, 0, Math.PI * 2);
    ctx.fillStyle = '#e8a0a0';
    ctx.fill(); // inner pink
    // Right ear
    oEllipse(ctx, 18, 2 + bounce, 2, 5, '#c9a872', OL, 1);
    ctx.beginPath();
    ctx.ellipse(18, 2 + bounce, 1, 4, 0, 0, Math.PI * 2);
    ctx.fillStyle = '#e8a0a0';
    ctx.fill();

    // ── Eye ──
    eye(ctx, 19, 10 + bounce, 1.5, 1);

    // ── Nose ──
    nose(ctx, 21, 12 + bounce, 1, 0.8, '#e0808080');

    // ── Whiskers ──
    ctx.strokeStyle = '#8a7a60';
    ctx.lineWidth = 0.5;
    ctx.beginPath();
    ctx.moveTo(20, 12 + bounce);
    ctx.lineTo(23, 11 + bounce);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(20, 13 + bounce);
    ctx.lineTo(23, 13 + bounce);
    ctx.stroke();

    ctx.restore();
  }

  canvas.refresh();
  scene.textures.get('hare').add(0, 0, 0, 0, w, h);
  scene.textures.get('hare').add(1, 0, w, 0, w, h);
  scene.anims.create({
    key: 'hare_idle',
    frames: [{ key: 'hare', frame: 0 }, { key: 'hare', frame: 1 }],
    frameRate: 5,
    repeat: -1,
  });
}

// ── Buffalo - 56×48, 2 frames ──────────────────────────────
function generateBuffaloSprite(scene) {
  const frames = 2;
  const w = 56, h = 48;
  const canvas = scene.textures.createCanvas('buffalo', w * frames, h);
  const ctx = canvas.getContext();
  ctx.imageSmoothingEnabled = false;

  for (let f = 0; f < frames; f++) {
    const ox = f * w;
    const bounce = f * 2;
    ctx.save();
    ctx.translate(ox, 0);

    // ── Tail ──
    ctx.strokeStyle = OL;
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(6, 24 + bounce);
    ctx.quadraticCurveTo(2, 18 + bounce, 3, 14 + bounce);
    ctx.stroke();
    ctx.strokeStyle = '#2d1a11';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(6, 24 + bounce);
    ctx.quadraticCurveTo(2, 18 + bounce, 3, 14 + bounce);
    ctx.stroke();
    // Tail tuft
    ctx.fillStyle = '#1a0a00';
    ctx.fillRect(1, 12 + bounce, 4, 4);

    // ── Back legs ──
    const lp = f * Math.PI;
    leg(ctx, 16 + Math.sin(lp + Math.PI) * 4, 38 + bounce, 6, 10, '#2d1a11', '#241510', '#1a0a05');
    leg(ctx, 10 + Math.sin(lp) * 4, 38 + bounce, 6, 10, '#2d1a11', '#241510', '#1a0a05');

    // ── Body ──
    oEllipse(ctx, 28, 26 + bounce, 20, 14, '#3e2723');
    // Body highlight (shoulder hump)
    ctx.beginPath();
    ctx.ellipse(24, 20 + bounce, 12, 8, -0.2, 0, Math.PI * 2);
    ctx.fillStyle = '#4e3733';
    ctx.fill();
    // Belly shade
    ctx.beginPath();
    ctx.ellipse(28, 32 + bounce, 15, 6, 0, 0, Math.PI * 2);
    ctx.fillStyle = '#321e1a';
    ctx.fill();
    // Shoulder muscle
    ctx.beginPath();
    ctx.arc(22, 22 + bounce, 6, 0, Math.PI * 2);
    ctx.fillStyle = '#4a3028';
    ctx.fill();
    // Shaggy mane area (chest)
    ctx.fillStyle = '#2a1810';
    ctx.beginPath();
    ctx.ellipse(18, 24 + bounce, 8, 10, 0.2, 0, Math.PI * 2);
    ctx.fill();

    // ── Front legs ──
    leg(ctx, 32 + Math.sin(lp) * 4, 38 + bounce, 6, 10, '#3e2723', '#2d1a11', '#1a0a05');
    leg(ctx, 24 + Math.sin(lp + Math.PI) * 4, 38 + bounce, 6, 10, '#3e2723', '#2d1a11', '#1a0a05');

    // ── Head ──
    oCircle(ctx, 42, 20 + bounce, 10, '#3e2723');
    // Head highlight
    ctx.beginPath();
    ctx.arc(40, 18 + bounce, 6, 0, Math.PI * 2);
    ctx.fillStyle = '#4e3733';
    ctx.fill();
    // Muzzle
    oEllipse(ctx, 48, 23 + bounce, 5, 4, '#4e3733');
    // Nostrils
    ctx.fillStyle = '#1a0a00';
    ctx.fillRect(49, 23 + bounce, 2, 1.5);
    ctx.fillRect(51, 23 + bounce, 2, 1.5);

    // ── Horns (curved, wide) ──
    // Left horn
    ctx.beginPath();
    ctx.moveTo(36, 14 + bounce);
    ctx.quadraticCurveTo(30, 6 + bounce, 34, 4 + bounce);
    ctx.quadraticCurveTo(38, 3 + bounce, 40, 10 + bounce);
    ctx.closePath();
    ctx.fillStyle = OL;
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(36, 14 + bounce);
    ctx.quadraticCurveTo(31, 7 + bounce, 35, 5 + bounce);
    ctx.quadraticCurveTo(38, 4 + bounce, 40, 11 + bounce);
    ctx.closePath();
    ctx.fillStyle = '#666';
    ctx.fill();
    // Horn highlight
    ctx.beginPath();
    ctx.moveTo(37, 13 + bounce);
    ctx.quadraticCurveTo(33, 8 + bounce, 36, 6 + bounce);
    ctx.strokeStyle = '#888';
    ctx.lineWidth = 1;
    ctx.stroke();

    // Right horn
    ctx.beginPath();
    ctx.moveTo(44, 14 + bounce);
    ctx.quadraticCurveTo(50, 6 + bounce, 48, 4 + bounce);
    ctx.quadraticCurveTo(44, 3 + bounce, 42, 10 + bounce);
    ctx.closePath();
    ctx.fillStyle = OL;
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(44, 14 + bounce);
    ctx.quadraticCurveTo(49, 7 + bounce, 47, 5 + bounce);
    ctx.quadraticCurveTo(44, 4 + bounce, 42, 11 + bounce);
    ctx.closePath();
    ctx.fillStyle = '#666';
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(43, 13 + bounce);
    ctx.quadraticCurveTo(47, 8 + bounce, 46, 6 + bounce);
    ctx.strokeStyle = '#888';
    ctx.lineWidth = 1;
    ctx.stroke();

    // ── Horn boss (forehead plate) ──
    oRect(ctx, 36, 11 + bounce, 10, 4, '#555');
    ctx.fillStyle = '#666';
    ctx.fillRect(37, 12 + bounce, 8, 2);

    // ── Eye ──
    eye(ctx, 45, 18 + bounce, 1.5, 1);

    // ── Ear ──
    oEllipse(ctx, 48, 13 + bounce, 3, 2, '#3e2723', OL, 1);

    ctx.restore();
  }

  canvas.refresh();
  scene.textures.get('buffalo').add(0, 0, 0, 0, w, h);
  scene.textures.get('buffalo').add(1, 0, w, 0, w, h);
  scene.anims.create({
    key: 'buffalo_idle',
    frames: [{ key: 'buffalo', frame: 0 }, { key: 'buffalo', frame: 1 }],
    frameRate: 3,
    repeat: -1,
  });
}
