// ============================================
// Scene Registry
// ============================================

import type { SceneId } from '@claudeborne/shared';
import type { Tileset, Tilemap } from '../engine/types';
import { SCENE_PALETTES, type ScenePalette } from './sceneConfigs';
import { workshopTileset, firelinkTileset, graceTileset } from './tilesets';
import { workshopTilemap, firelinkTilemap, graceTilemap } from './tilemaps';
import {
  workshopProps, firelinkProps, graceProps,
  type ScenePropDef,
} from './props';

export interface SceneAssets {
  tileset: Tileset;
  tilemap: Tilemap;
  props: ScenePropDef[];
  palette: ScenePalette;
}

const sceneRegistry: Record<SceneId, SceneAssets> = {
  'hunters-dream': {
    tileset: workshopTileset,
    tilemap: workshopTilemap,
    props: workshopProps,
    palette: SCENE_PALETTES['hunters-dream'],
  },
  'firelink-shrine': {
    tileset: firelinkTileset,
    tilemap: firelinkTilemap,
    props: firelinkProps,
    palette: SCENE_PALETTES['firelink-shrine'],
  },
  'site-of-grace': {
    tileset: graceTileset,
    tilemap: graceTilemap,
    props: graceProps,
    palette: SCENE_PALETTES['site-of-grace'],
  },
};

/**
 * Get all tile and prop assets for a given scene.
 */
export function getSceneAssets(sceneId: SceneId): SceneAssets {
  return sceneRegistry[sceneId];
}
