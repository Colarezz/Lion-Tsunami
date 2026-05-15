// ============================================================
// Lion Tsunami - Game Configuration Constants
// ============================================================

export const GAME_WIDTH = 800;
export const GAME_HEIGHT = 450;

// Physics
export const GRAVITY = 1400;
export const JUMP_VELOCITY = -550;
export const JUMP_HOLD_VELOCITY = -680;
export const JUMP_HOLD_DURATION = 250; // ms

// World
export const BASE_SPEED = 220;
export const MAX_SPEED = 620;
export const SPEED_INCREMENT = 12; // per 500m (was 8, now faster ramp)
export const GROUND_Y = 370;
export const TILE_SIZE = 64;

// Horde
export const LION_SPACING = 38;
export const TRAIL_BUFFER_SIZE = 600;
export const MAX_HORDE_SIZE = 30;
export const CASCADE_JUMP_DELAY = 60;

// Spawn
export const SPAWN_INTERVAL_MIN = 350;
export const SPAWN_INTERVAL_MAX = 650;
export const MIN_GAP_BETWEEN_HOLES = 250;
export const HOLE_WIDTH_MIN = 80;
export const HOLE_WIDTH_MAX = 200;

// Difficulty thresholds (in distance)
export const TREE_START_DISTANCE = 0;
export const EAGLE_START_DISTANCE = 300;
export const HUNTER_START_DISTANCE = 600;
export const RIVER_START_DISTANCE = 800;
export const LARGE_HOLES_DISTANCE = 1000;
export const BUFFALO_START_DISTANCE = 400;
export const ZEBRA_START_DISTANCE = 100;
export const GIRAFFE_START_DISTANCE = 200;
export const ELEPHANT_START_DISTANCE = 800;

// Prey requirements (lions needed to eat)
export const HARE_MIN_LIONS = 1;
export const MEERKAT_MIN_LIONS = 1;
export const ZEBRA_MIN_LIONS = 2;
export const GIRAFFE_MIN_LIONS = 3;
export const BUFFALO_MIN_LIONS = 5;
export const ELEPHANT_MIN_LIONS = 8;

// Prey rewards (lions gained)
export const HARE_LIONS_GAINED = 1;
export const MEERKAT_LIONS_GAINED = 1;
export const ZEBRA_LIONS_GAINED = 2;
export const GIRAFFE_LIONS_GAINED = 2;
export const BUFFALO_LIONS_GAINED = 3;
export const ELEPHANT_LIONS_GAINED = 5;

// Scoring
export const SCORE_PER_METER = 1;
export const SCORE_PER_SMALL_PREY = 50;
export const SCORE_PER_MEDIUM_PREY = 100;
export const SCORE_PER_LARGE_PREY = 200;
export const SCORE_PER_HUGE_PREY = 500;
export const MULTIPLIER_THRESHOLDS = [
  { count: 1, multiplier: 1 },
  { count: 3, multiplier: 1.5 },
  { count: 5, multiplier: 2 },
  { count: 8, multiplier: 2.5 },
  { count: 12, multiplier: 3 },
  { count: 20, multiplier: 4 },
];

// Coins
export const COIN_VALUE = 1;
export const COIN_SPAWN_CHANCE = 0.35;

// Hunter projectile
export const PROJECTILE_SPEED = 300;

// Lion Skins
export const SKINS = [
  { id: 'default', name: 'Leão Clássico', price: 0, bodyColor: '#e8a628', maneColor: '#b06810', darkColor: '#8b5a10', legColor: '#c48e20' },
  { id: 'white', name: 'Leão Branco', price: 50, bodyColor: '#f0ece0', maneColor: '#d4cfc0', darkColor: '#b0a890', legColor: '#e0dcd0' },
  { id: 'shadow', name: 'Leão Sombrio', price: 100, bodyColor: '#2a2a3a', maneColor: '#1a1a28', darkColor: '#101018', legColor: '#222232' },
  { id: 'golden', name: 'Leão Dourado', price: 200, bodyColor: '#ffd700', maneColor: '#daa520', darkColor: '#b8860b', legColor: '#f0c420' },
  { id: 'fire', name: 'Leão de Fogo', price: 300, bodyColor: '#ff4500', maneColor: '#cc3700', darkColor: '#992900', legColor: '#e03e00' },
  { id: 'ice', name: 'Leão de Gelo', price: 300, bodyColor: '#87ceeb', maneColor: '#5bb5d8', darkColor: '#3a9cc0', legColor: '#6dc0e0' },
  { id: 'neon', name: 'Leão Neon', price: 500, bodyColor: '#39ff14', maneColor: '#20cc08', darkColor: '#109900', legColor: '#30ee10' },
  { id: 'galaxy', name: 'Leão Galáctico', price: 500, bodyColor: '#9b59b6', maneColor: '#7d3c98', darkColor: '#5b2c6f', legColor: '#8e44ad' },
];

// Colors
export const COLORS = {
  SKY_TOP: 0x5bc0f7,
  SKY_BOTTOM: 0x87ceeb,
  GROUND: 0xc4903d,
  GROUND_DARK: 0xa67832,
  GROUND_GRASS: 0x7ab648,
  LION_BODY: 0xe8a628,
  LION_MANE: 0xb06810,
  LION_DARK: 0x8b5a10,
  ZEBRA_WHITE: 0xffffff,
  ZEBRA_BLACK: 0x222222,
  GIRAFFE_BODY: 0xd4a843,
  GIRAFFE_SPOTS: 0x7a5520,
  EAGLE_BODY: 0x5c3a1e,
  EAGLE_WING: 0x3d2510,
  RIVER_BLUE: 0x2196f3,
  RIVER_LIGHT: 0x64b5f6,
  MOUNTAIN_FAR: 0x8e7c5a,
  MOUNTAIN_NEAR: 0x6d5e3f,
  TREE_TRUNK: 0x5d4037,
  TREE_LEAVES: 0x558b2f,
  TREE_LEAVES_LIGHT: 0x7cb342,
  HUNTER_SHIRT: 0x5b7553,
  HUNTER_PANTS: 0x4a3728,
  HUNTER_SKIN: 0xc68642,
  HUNTER_GUN: 0x444444,
  BUFFALO_BODY: 0x3e2723,
  BUFFALO_HORN: 0x555555,
  MEERKAT_BODY: 0xd4a060,
  HARE_BODY: 0xc9a872,
  UI_BG: 0x000000,
  UI_TEXT: 0xffffff,
  UI_ACCENT: 0xe8a628,
};
