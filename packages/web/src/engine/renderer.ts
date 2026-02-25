// ============================================
// Core rendering utilities
// ============================================

import type { Sprite, Tilemap, Tileset } from './types';

/**
 * Ensures the canvas context uses nearest-neighbor scaling
 * for crisp pixel art rendering.
 */
export function setPixelated(ctx: CanvasRenderingContext2D): void {
  ctx.imageSmoothingEnabled = false;
}

/**
 * Draws a pixel-art sprite from its color array data.
 * Each non-null pixel is drawn as a scale x scale rectangle.
 */
export function drawSprite(
  ctx: CanvasRenderingContext2D,
  sprite: Sprite,
  x: number,
  y: number,
  scale: number = 1,
): void {
  const rx = Math.round(x);
  const ry = Math.round(y);
  const s = Math.round(scale);

  for (let py = 0; py < sprite.height; py++) {
    const row = sprite.pixels[py];
    if (!row) continue;
    for (let px = 0; px < sprite.width; px++) {
      const color = row[px];
      if (color === null) continue;
      ctx.fillStyle = color;
      ctx.fillRect(rx + px * s, ry + py * s, s, s);
    }
  }
}

/**
 * Draws a tile-based background from a tilemap and tileset.
 */
export function drawTilemap(
  ctx: CanvasRenderingContext2D,
  tilemap: Tilemap,
  tileset: Tileset,
  offsetX: number,
  offsetY: number,
  scale: number = 1,
): void {
  const ox = Math.round(offsetX);
  const oy = Math.round(offsetY);
  const tw = tilemap.tileWidth;
  const th = tilemap.tileHeight;

  for (let row = 0; row < tilemap.rows; row++) {
    const gridRow = tilemap.grid[row];
    if (!gridRow) continue;
    for (let col = 0; col < tilemap.cols; col++) {
      const tileIndex = gridRow[col];
      if (tileIndex < 0 || tileIndex >= tileset.length) continue;
      const sprite = tileset[tileIndex];
      if (!sprite) continue;
      const tx = ox + col * tw * scale;
      const ty = oy + row * th * scale;
      drawSprite(ctx, sprite, tx, ty, scale);
    }
  }
}
