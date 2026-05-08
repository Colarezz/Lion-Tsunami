// ============================================================
// Savanna Stampede - Game Configuration Constants
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
export const MAX_SPEED = 520;
export const SPEED_INCREMENT = 8; // per 500m
export const GROUND_Y = 370; // top of ground tiles
export const TILE_SIZE = 64;

// Horde
export const LION_SPACING = 38;
export const TRAIL_BUFFER_SIZE = 600;
export const MAX_HORDE_SIZE = 30;
export const CASCADE_JUMP_DELAY = 60; // ms between each lion's jump

// Spawn
export const SPAWN_INTERVAL_MIN = 400; // px
export const SPAWN_INTERVAL_MAX = 700; // px
export const MIN_GAP_BETWEEN_HOLES = 250; // px
export const HOLE_WIDTH_MIN = 80;
export const HOLE_WIDTH_MAX = 200;

// Difficulty thresholds (in distance)
export const TREE_START_DISTANCE = 0;       // Trees from the start
export const EAGLE_START_DISTANCE = 300;
export const HUNTER_START_DISTANCE = 600;
export const RIVER_START_DISTANCE = 800;
export const LARGE_HOLES_DISTANCE = 1000;
export const BUFFALO_START_DISTANCE = 400;

// Large prey requirements
export const BUFFALO_MIN_LIONS = 4;

// Scoring
export const SCORE_PER_METER = 1;
export const SCORE_PER_SMALL_PREY = 50;
export const SCORE_PER_LARGE_PREY = 200;
export const MULTIPLIER_THRESHOLDS = [
  { count: 1, multiplier: 1 },
  { count: 3, multiplier: 1.5 },
  { count: 5, multiplier: 2 },
  { count: 8, multiplier: 2.5 },
  { count: 12, multiplier: 3 },
  { count: 20, multiplier: 4 },
];

// Hunter projectile
export const PROJECTILE_SPEED = 300;

// Colors (for procedural generation)
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
