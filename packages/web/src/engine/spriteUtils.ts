// ============================================
// Sprite creation and manipulation utilities
// ============================================

import type { Sprite } from './types';

/** Default palette mapping for createSprite character parsing */
const DEFAULT_PALETTE: Record<string, string> = {
  '#': '#ffffff',
  '@': '#888888',
  '*': '#ffcc00',
  '+': '#ff4400',
  '~': '#4488ff',
  '=': '#44aa44',
  '%': '#aa4400',
  '&': '#aa00aa',
  '^': '#ffaa00',
};

/**
 * Parse a multi-line pixel-art string into a Sprite.
 *
 * Format: each character maps to a color via palette, '.' is transparent.
 * Leading/trailing blank lines are stripped. Lines are padded to max width.
 *
 * @param pixelArt Multi-line string defining the sprite
 * @param palette Optional character-to-color mapping (defaults to DEFAULT_PALETTE)
 */
export function createSprite(
  pixelArt: string,
  palette: Record<string, string> = DEFAULT_PALETTE,
): Sprite {
  const lines = pixelArt.split('\n').filter((line, i, arr) => {
    // Strip leading/trailing empty lines but keep internal ones
    if (i === 0 && line.trim() === '') return false;
    if (i === arr.length - 1 && line.trim() === '') return false;
    return true;
  });

  if (lines.length === 0) {
    return { pixels: [], width: 0, height: 0 };
  }

  // Find the minimum leading whitespace (for indentation stripping)
  const minIndent = lines.reduce((min, line) => {
    if (line.trim() === '') return min;
    const match = line.match(/^(\s*)/);
    return match ? Math.min(min, match[1].length) : min;
  }, Infinity);

  const stripped = minIndent === Infinity
    ? lines
    : lines.map((l) => l.slice(minIndent));

  const width = Math.max(...stripped.map((l) => l.length));
  const height = stripped.length;

  const pixels: (string | null)[][] = [];

  for (let y = 0; y < height; y++) {
    const row: (string | null)[] = [];
    const line = stripped[y] || '';
    for (let x = 0; x < width; x++) {
      const ch = line[x] ?? '.';
      if (ch === '.' || ch === ' ') {
        row.push(null);
      } else {
        row.push(palette[ch] ?? ch);
      }
    }
    pixels.push(row);
  }

  return { pixels, width, height };
}

/**
 * Create a Sprite directly from a 2D color array.
 */
export function createSpriteFromColors(data: (string | null)[][]): Sprite {
  const height = data.length;
  const width = height > 0 ? Math.max(...data.map((r) => r.length)) : 0;

  // Normalize rows to the same width
  const pixels = data.map((row) => {
    const padded = [...row];
    while (padded.length < width) {
      padded.push(null);
    }
    return padded;
  });

  return { pixels, width, height };
}

/**
 * Horizontally flip a sprite.
 */
export function flipSpriteH(sprite: Sprite): Sprite {
  const pixels = sprite.pixels.map((row) => [...row].reverse());
  return { pixels, width: sprite.width, height: sprite.height };
}

/**
 * Apply a color tint to a sprite.
 * Blends each pixel color toward the tint color by the given amount (0..1).
 */
export function tintSprite(sprite: Sprite, tintColor: string, amount: number): Sprite {
  const tr = parseInt(tintColor.slice(1, 3), 16) || 0;
  const tg = parseInt(tintColor.slice(3, 5), 16) || 0;
  const tb = parseInt(tintColor.slice(5, 7), 16) || 0;

  const clamp = (v: number) => Math.max(0, Math.min(255, Math.round(v)));
  const t = Math.max(0, Math.min(1, amount));

  const pixels = sprite.pixels.map((row) =>
    row.map((color) => {
      if (color === null) return null;
      const r = parseInt(color.slice(1, 3), 16) || 0;
      const g = parseInt(color.slice(3, 5), 16) || 0;
      const b = parseInt(color.slice(5, 7), 16) || 0;

      const nr = clamp(r + (tr - r) * t);
      const ng = clamp(g + (tg - g) * t);
      const nb = clamp(b + (tb - b) * t);

      return `#${nr.toString(16).padStart(2, '0')}${ng.toString(16).padStart(2, '0')}${nb.toString(16).padStart(2, '0')}`;
    }),
  );

  return { pixels, width: sprite.width, height: sprite.height };
}
