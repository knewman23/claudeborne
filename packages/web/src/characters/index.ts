// ============================================
// Character asset registry
// ============================================

import { hunterSpriteSheet, hunterAnimations } from './hunterSprites';
import { knightSpriteSheet, knightAnimations } from './knightSprites';
import type { SpriteSheet, AnimationDef } from '../engine/types';
import type { CharacterType } from '@claudeborne/shared';
import { ImageSpriteManager } from '../engine/imageSprite';
import { HUNTER_SHEETS } from './hunterLpc';
import { KNIGHT_SHEETS } from './knightLpc';

export interface CharacterAssets {
  spriteSheet: SpriteSheet;
  animations: Record<string, AnimationDef>;
}

const characterRegistry: Record<CharacterType, CharacterAssets> = {
  hunter: {
    spriteSheet: hunterSpriteSheet,
    animations: hunterAnimations,
  },
  knight: {
    spriteSheet: knightSpriteSheet,
    animations: knightAnimations,
  },
};

export function getCharacterAssets(type: CharacterType): CharacterAssets {
  return characterRegistry[type];
}

/**
 * Register and load all LPC spritesheets for characters.
 * Hunter sheets are loaded immediately; knight sheets will be
 * registered here once available.
 */
export async function loadCharacterSprites(manager: ImageSpriteManager): Promise<void> {
  // Register hunter sheets
  for (const [key, src] of Object.entries(HUNTER_SHEETS)) {
    manager.register(`hunter_${key}`, src);
  }
  // Register knight sheets
  for (const [key, src] of Object.entries(KNIGHT_SHEETS)) {
    manager.register(`knight_${key}`, src);
  }

  await manager.loadAll();
}
