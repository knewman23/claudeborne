// ============================================
// Engine-specific types
// ============================================

/** A 2D point */
export interface Point {
  x: number;
  y: number;
}

/** A single pixel-art sprite: 2D array of color strings (null = transparent) */
export interface Sprite {
  /** Row-major pixel data: pixels[y][x] */
  pixels: (string | null)[][];
  width: number;
  height: number;
}

/** A named collection of sprites (e.g., animation frames) */
export interface SpriteSheet {
  sprites: Record<string, Sprite>;
}

/** A 2D grid of tile indices referencing a tileset */
export interface Tilemap {
  /** Row-major grid: grid[y][x] = tile index (-1 for empty) */
  grid: number[][];
  tileWidth: number;
  tileHeight: number;
  cols: number;
  rows: number;
}

/** A tileset is simply an array of sprites indexed by tile id */
export type Tileset = Sprite[];

/** A single particle in the system */
export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  alpha: number;
  life: number;      // 0..1, decreases over time
  maxLife: number;    // total lifetime in seconds
  size: number;
  alphaMax: number;
  active: boolean;
}

/** Configuration for spawning particles */
export interface ParticleEmitterConfig {
  /** Spawn position (world coords) */
  x: number;
  y: number;
  /** Spawn rate: particles per second */
  rate: number;
  /** Spread angle in radians around the base direction */
  spread: number;
  /** Base direction angle in radians (0 = right, -PI/2 = up) */
  angle: number;
  /** Min/max initial speed */
  speedMin: number;
  speedMax: number;
  /** Pool of colors to randomly pick from */
  colors: string[];
  /** Lifetime range in seconds */
  lifetimeMin: number;
  lifetimeMax: number;
  /** Gravity (positive = down) */
  gravity: number;
  /** Size range */
  sizeMin: number;
  sizeMax: number;
  /** Max active particles for this emitter */
  maxParticles: number;
  /** Max alpha (opacity) for particles from this emitter (0..1, default 1) */
  alphaMax?: number;
}

/** An animation definition: which frames to play, timing, and looping */
export interface AnimationDef {
  /** Ordered list of sprite keys from a SpriteSheet */
  frames: string[];
  /** Duration of each frame in seconds */
  frameDuration: number;
  /** Whether this animation loops */
  loop: boolean;
}

/** A point light source for the lighting system */
export interface Light {
  x: number;
  y: number;
  radius: number;
  color: string;
  intensity: number;
  /** Flicker amount (0 = none, 1 = max) */
  flicker: number;
}
