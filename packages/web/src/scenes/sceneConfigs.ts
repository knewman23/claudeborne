// ============================================
// Per-scene configuration data — pure data, no classes
// ============================================

import type { SceneId, AnimationState } from '@claudeborne/shared';
import type { Light, ParticleEmitterConfig, Point } from '../engine/types';
import { PARTICLE_PRESETS } from '../engine/particles';
import { WORLD_WIDTH, WORLD_HEIGHT } from '../engine/camera';

// ============================================
// Scene color palettes
// ============================================

export interface ScenePalette {
  /** Background (wall/ceiling) color */
  bg: string;
  /** Floor color */
  floor: string;
  /** Accent color (props, details) */
  accent: string;
  /** Primary light color */
  light: string;
  /** Fog color */
  fog: string;
  /** Fog density (0..1) */
  fogDensity: number;
  /** Vignette intensity (0..1) */
  vignetteIntensity: number;
  /** Ambient darkness for lighting (0..1) */
  ambientDarkness: number;
}

export const SCENE_PALETTES: Record<SceneId, ScenePalette> = {
  'hunters-dream': {
    bg: '#1a1420',
    floor: '#2a2030',
    accent: '#8b6914',
    light: '#d4a017',
    fog: '#1a1420',
    fogDensity: 0.06,
    vignetteIntensity: 0.6,
    ambientDarkness: 0.35,
  },
  'firelink-shrine': {
    bg: '#1a1a10',
    floor: '#2a2820',
    accent: '#c25a00',
    light: '#ff8c00',
    fog: '#332200',
    fogDensity: 0.05,
    vignetteIntensity: 0.5,
    ambientDarkness: 0.3,
  },
  'site-of-grace': {
    bg: '#101a20',
    floor: '#1a2a20',
    accent: '#c8a832',
    light: '#ffd700',
    fog: '#223322',
    fogDensity: 0.04,
    vignetteIntensity: 0.45,
    ambientDarkness: 0.3,
  },
};

// ============================================
// Character action positions per scene
// (where to walk for each AnimationState, in world pixel coords)
// ============================================

export const SCENE_ACTION_POSITIONS: Record<SceneId, Partial<Record<AnimationState, Point>>> = {
  'hunters-dream': {
    inscribe:  { x: 100, y: 182 },   // left, near tombstones/candelabras
    read:      { x: 250, y: 180 },   // right, near red-cloaked figure
    forge:     { x: 300, y: 182 },   // far right, near building pillars
    meditate:  { x: 192, y: 184 },   // center courtyard, sitting
    rest:      { x: 192, y: 186 },   // center courtyard, resting
    idle:      { x: 192, y: 182 },   // center courtyard standing
    stagger:   { x: 192, y: 182 },   // stumble in place
    victory:   { x: 192, y: 180 },   // center, triumphant
    enter:     { x: 192, y: 182 },   // walk to center
    exit:      { x: 370, y: 182 },   // walk off right
  },
  'firelink-shrine': {
    inscribe:  { x: 110, y: 188 },   // left, near rocks
    read:      { x: 240, y: 186 },   // right of bonfire
    forge:     { x: 280, y: 186 },   // far right
    meditate:  { x: 165, y: 186 },   // near bonfire
    rest:      { x: 160, y: 188 },   // sitting at bonfire
    idle:      { x: 165, y: 185 },   // standing near bonfire
    stagger:   { x: 165, y: 185 },
    victory:   { x: 175, y: 183 },
    enter:     { x: 165, y: 185 },
    exit:      { x: 370, y: 185 },   // walk off right
  },
  'site-of-grace': {
    inscribe:  { x: 110, y: 178 },   // left, near ruins/gravestones
    read:      { x: 260, y: 175 },   // right, near ruined columns
    forge:     { x: 310, y: 176 },   // far right, smithing area
    meditate:  { x: 192, y: 176 },   // at the grace
    rest:      { x: 192, y: 178 },   // sitting at grace
    idle:      { x: 192, y: 176 },   // center, on grassy ground
    stagger:   { x: 192, y: 176 },
    victory:   { x: 192, y: 174 },
    enter:     { x: 192, y: 176 },
    exit:      { x: 370, y: 176 },   // walk off right
  },
};

// ============================================
// Light configurations per scene
// (positions in world coordinates)
// ============================================

export const SCENE_LIGHTS: Record<SceneId, Light[]> = {
  'hunters-dream': [
    // Warm lantern on the left (workbench area)
    { x: 85, y: 110, radius: 80, color: '#d4a017', intensity: 0.8, flicker: 0.3 },
    // Dim lamp center
    { x: 192, y: 120, radius: 60, color: '#8b6914', intensity: 0.4, flicker: 0.15 },
  ],
  'firelink-shrine': [
    // Bonfire — strong, flickery
    { x: 175, y: 178, radius: 100, color: '#ff6600', intensity: 0.9, flicker: 0.5 },
    // Dim ambient glow from tower
    { x: 210, y: 100, radius: 60, color: '#ff8c00', intensity: 0.15, flicker: 0.1 },
  ],
  'site-of-grace': [
    // Golden grace light at ground level
    { x: 192, y: 170, radius: 100, color: '#ffd700', intensity: 0.7, flicker: 0.2 },
    // Faint Erdtree glow from above
    { x: 192, y: 40, radius: 150, color: '#ffd700', intensity: 0.15, flicker: 0.05 },
  ],
};

// ============================================
// Particle emitter configurations per scene
// (returns an array of emitter configs to add)
// ============================================

export function getSceneParticleEmitters(sceneId: SceneId): ParticleEmitterConfig[] {
  switch (sceneId) {
    case 'hunters-dream':
      return [
        PARTICLE_PRESETS.souls(340, 170),
      ];
    case 'firelink-shrine':
      return [];
    case 'site-of-grace':
      return [
        // Right arc — golden particles arcing up and to the right
        {
          x: 192, y: 96,
          rate: 10, spread: 0.3,
          angle: -Math.PI * 0.3,  // up-right
          speedMin: 25, speedMax: 45,
          colors: ['#ffd700', '#ffec80', '#c8a832', '#fff5cc'],
          lifetimeMin: 1.2, lifetimeMax: 2.0,
          gravity: 25,
          sizeMin: 1, sizeMax: 2,
          maxParticles: 30,
          alphaMax: 0.6,
        },
        // Gentle center wisps rising straight up
        {
          x: 192, y: 96,
          rate: 6, spread: 0.4,
          angle: -Math.PI / 2,
          speedMin: 8, speedMax: 18,
          colors: ['#ffd700', '#fff5cc', '#ffec80'],
          lifetimeMin: 1.5, lifetimeMax: 3.0,
          gravity: -3,
          sizeMin: 1, sizeMax: 2,
          maxParticles: 20,
          alphaMax: 0.45,
        },
      ];
  }
}

// ============================================
// Floor line configuration (for tile-like grid)
// ============================================

export const FLOOR_Y = 0.63 * WORLD_HEIGHT; // ~136 pixels from top in world coords

// ============================================
// Scene prop definitions (background/foreground decorations)
// These are drawn procedurally until Phase 4 tile assets arrive.
// ============================================

export interface SceneProp {
  /** World position (top-left corner) */
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
  /** If true, drawn in front of the character (foreground) */
  foreground: boolean;
  /** Optional label for debugging */
  label?: string;
}

export const SCENE_PROPS: Record<SceneId, SceneProp[]> = {
  'hunters-dream': [
    // Workbench (left, behind character)
    { x: 50, y: FLOOR_Y - 24, width: 48, height: 24, color: '#3d2b1f', foreground: false, label: 'workbench' },
    { x: 50, y: FLOOR_Y - 26, width: 48, height: 3, color: '#5a3d2b', foreground: false, label: 'workbench-top' },
    // Weapon rack (right)
    { x: 290, y: FLOOR_Y - 60, width: 8, height: 60, color: '#4a3520', foreground: false, label: 'rack-post' },
    { x: 282, y: FLOOR_Y - 48, width: 24, height: 3, color: '#666666', foreground: false, label: 'rack-bar1' },
    { x: 282, y: FLOOR_Y - 36, width: 20, height: 3, color: '#777777', foreground: false, label: 'rack-bar2' },
    // Vial shelf (center-right, background)
    { x: 200, y: FLOOR_Y - 30, width: 40, height: 3, color: '#4a3520', foreground: false, label: 'shelf' },
    { x: 202, y: FLOOR_Y - 42, width: 6, height: 12, color: '#882020', foreground: false, label: 'vial1' },
    { x: 210, y: FLOOR_Y - 42, width: 6, height: 12, color: '#882020', foreground: false, label: 'vial2' },
    { x: 218, y: FLOOR_Y - 42, width: 6, height: 12, color: '#882020', foreground: false, label: 'vial3' },
    { x: 226, y: FLOOR_Y - 42, width: 6, height: 12, color: '#882020', foreground: false, label: 'vial4' },
    { x: 234, y: FLOOR_Y - 42, width: 6, height: 12, color: '#882020', foreground: false, label: 'vial5' },
  ],
  'firelink-shrine': [
    // Central bonfire base
    { x: 180, y: FLOOR_Y - 8, width: 24, height: 8, color: '#555555', foreground: false, label: 'bonfire-base' },
    // Stone pillars (left and right)
    { x: 55, y: FLOOR_Y - 70, width: 12, height: 70, color: '#444444', foreground: false, label: 'pillar-left' },
    { x: 320, y: FLOOR_Y - 70, width: 12, height: 70, color: '#444444', foreground: false, label: 'pillar-right' },
    // Crumbling wall (far left)
    { x: 0, y: FLOOR_Y - 50, width: 25, height: 50, color: '#3a3a2a', foreground: false, label: 'wall' },
  ],
  'site-of-grace': [
    // Grace stake (center)
    { x: 189, y: FLOOR_Y - 40, width: 6, height: 40, color: '#c8a832', foreground: false, label: 'grace-stake' },
    // Ruined columns
    { x: 90, y: FLOOR_Y - 48, width: 12, height: 48, color: '#5a5a4a', foreground: false, label: 'column-left' },
    { x: 82, y: FLOOR_Y - 54, width: 28, height: 6, color: '#6a6a5a', foreground: false, label: 'column-left-cap' },
    { x: 270, y: FLOOR_Y - 36, width: 12, height: 36, color: '#5a5a4a', foreground: false, label: 'column-right' },
  ],
};
