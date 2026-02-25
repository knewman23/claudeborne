// ============================================
// Hunter LPC spritesheet configuration
// Maps AnimationState to LPC sprite animations.
// ============================================

import { LpcDirection, type LpcAnimationDef } from '../engine/imageSprite';
import type { AnimationState } from '@claudeborne/shared';

// Spritesheet paths (relative to public/)
export const HUNTER_SHEETS: Record<string, string> = {
  idle: '/sprites/hunter/idle.png',
  walk: '/sprites/hunter/walk.png',
  spellcast: '/sprites/hunter/spellcast.png',
  slash: '/sprites/hunter/slash.png',
  '1h_slash': '/sprites/hunter/1h_slash.png',
  hurt: '/sprites/hunter/hurt.png',
  sit: '/sprites/hunter/sit.png',
  combat: '/sprites/hunter/combat.png',
  emote: '/sprites/hunter/emote.png',
};

export const HUNTER_FRAME_SIZE = 64;

// Map our AnimationState to LPC animation definitions
export const HUNTER_ANIMATIONS: Record<AnimationState, LpcAnimationDef> = {
  idle: {
    sheet: 'idle',
    direction: LpcDirection.Down,
    startFrame: 0,
    frameCount: 2,
    frameDuration: 0.6,
    loop: true,
  },
  walk: {
    sheet: 'walk',
    direction: LpcDirection.Right, // overridden by facing
    startFrame: 0,
    frameCount: 9,
    frameDuration: 0.1,
    loop: true,
  },
  inscribe: {
    sheet: 'spellcast',
    direction: LpcDirection.Down,
    startFrame: 0,
    frameCount: 7,
    frameDuration: 0.15,
    loop: true,
  },
  read: {
    sheet: 'spellcast',
    direction: LpcDirection.Down,
    startFrame: 0,
    frameCount: 7,
    frameDuration: 0.25, // slower = contemplative reading
    loop: true,
  },
  forge: {
    sheet: '1h_slash',
    direction: LpcDirection.Down,
    startFrame: 0,
    frameCount: 6,
    frameDuration: 0.12,
    loop: true,
  },
  meditate: {
    sheet: 'sit',
    direction: LpcDirection.Down,
    startFrame: 0,
    frameCount: 3,
    frameDuration: 0.8, // very slow, meditative
    loop: true,
  },
  stagger: {
    sheet: 'hurt',
    direction: LpcDirection.Up, // hurt only has 1 row (row 0)
    startFrame: 0,
    frameCount: 6,
    frameDuration: 0.1,
    loop: false,
  },
  victory: {
    sheet: 'emote',
    direction: LpcDirection.Down,
    startFrame: 0,
    frameCount: 3,
    frameDuration: 0.2,
    loop: false,
  },
  rest: {
    sheet: 'sit',
    direction: LpcDirection.Down,
    startFrame: 2, // last frame of sit = fully seated
    frameCount: 1,
    frameDuration: 1.0,
    loop: true,
  },
  enter: {
    sheet: 'walk',
    direction: LpcDirection.Right,
    startFrame: 0,
    frameCount: 9,
    frameDuration: 0.1,
    loop: true,
  },
  exit: {
    sheet: 'walk',
    direction: LpcDirection.Left,
    startFrame: 0,
    frameCount: 9,
    frameDuration: 0.1,
    loop: true,
  },
};
