// ============================================
// Knight LPC spritesheet configuration
// Maps AnimationState to LPC sprite animations.
// ============================================

import { LpcDirection, type LpcAnimationDef } from '../engine/imageSprite';
import type { AnimationState } from '@claudeborne/shared';

// Spritesheet paths (relative to public/)
export const KNIGHT_SHEETS: Record<string, string> = {
  idle: '/sprites/knight/idle.png',
  walk: '/sprites/knight/walk.png',
  spellcast: '/sprites/knight/spellcast.png',
  slash: '/sprites/knight/slash.png',
  '1h_slash': '/sprites/knight/1h_slash.png',
  thrust: '/sprites/knight/thrust.png',
  hurt: '/sprites/knight/hurt.png',
  sit: '/sprites/knight/sit.png',
  combat: '/sprites/knight/combat.png',
  emote: '/sprites/knight/emote.png',
  run: '/sprites/knight/run.png',
};

export const KNIGHT_FRAME_SIZE = 64;

// Map our AnimationState to LPC animation definitions
export const KNIGHT_ANIMATIONS: Record<AnimationState, LpcAnimationDef> = {
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
    direction: LpcDirection.Right,
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
    frameDuration: 0.25,
    loop: true,
  },
  forge: {
    sheet: 'thrust',
    direction: LpcDirection.Down,
    startFrame: 0,
    frameCount: 8,
    frameDuration: 0.12,
    loop: true,
  },
  meditate: {
    sheet: 'idle',
    direction: LpcDirection.Down,
    startFrame: 0,
    frameCount: 2,
    frameDuration: 0.8,
    loop: true,
  },
  stagger: {
    sheet: 'hurt',
    direction: LpcDirection.Up, // hurt only has 1 row
    startFrame: 0,
    frameCount: 6,
    frameDuration: 0.1,
    loop: false,
  },
  victory: {
    sheet: 'spellcast',
    direction: LpcDirection.Down,
    startFrame: 0,
    frameCount: 7,
    frameDuration: 0.15,
    loop: false,
  },
  rest: {
    sheet: 'idle',
    direction: LpcDirection.Down,
    startFrame: 0,
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
