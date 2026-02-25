// ============================================
// Camera / viewport management
// ============================================

import type { Point } from './types';

/** Game world logical dimensions (16px tiles, 24 x 13.5 tiles) */
export const WORLD_WIDTH = 384;
export const WORLD_HEIGHT = 216;

/**
 * Manages the mapping between a fixed-size logical game world
 * and the actual browser viewport. Handles:
 * - Nearest-neighbor scaling to fill viewport
 * - Letterboxing when aspect ratios don't match
 * - Coordinate transforms between world and screen space
 */
export class Camera {
  /** Logical game world size */
  readonly worldWidth: number;
  readonly worldHeight: number;

  /** Current viewport (browser canvas) size */
  private viewportWidth: number = 0;
  private viewportHeight: number = 0;

  /** Computed scale and offset for rendering */
  private scale: number = 1;
  private offsetX: number = 0;
  private offsetY: number = 0;

  constructor(worldWidth: number = WORLD_WIDTH, worldHeight: number = WORLD_HEIGHT) {
    this.worldWidth = worldWidth;
    this.worldHeight = worldHeight;
  }

  /**
   * Update when the viewport resizes. Recomputes scale and letterbox offsets.
   */
  resize(viewportWidth: number, viewportHeight: number): void {
    this.viewportWidth = viewportWidth;
    this.viewportHeight = viewportHeight;

    const scaleX = viewportWidth / this.worldWidth;
    const scaleY = viewportHeight / this.worldHeight;

    // Use the smaller scale to fit entirely, maintaining aspect ratio
    // Use floor to get integer scaling for crispest pixels when possible
    const rawScale = Math.min(scaleX, scaleY);
    // If the scale is >= 1, use floor for integer scaling; otherwise use the raw value
    this.scale = rawScale >= 1 ? Math.max(1, Math.floor(rawScale)) : rawScale;

    // Center the game world in the viewport
    const scaledWidth = this.worldWidth * this.scale;
    const scaledHeight = this.worldHeight * this.scale;
    this.offsetX = Math.round((viewportWidth - scaledWidth) / 2);
    this.offsetY = Math.round((viewportHeight - scaledHeight) / 2);
  }

  /**
   * Transform world coordinates to screen (canvas pixel) coordinates.
   */
  worldToScreen(wx: number, wy: number): Point {
    return {
      x: Math.round(wx * this.scale + this.offsetX),
      y: Math.round(wy * this.scale + this.offsetY),
    };
  }

  /**
   * Transform screen coordinates to world coordinates.
   */
  screenToWorld(sx: number, sy: number): Point {
    return {
      x: (sx - this.offsetX) / this.scale,
      y: (sy - this.offsetY) / this.scale,
    };
  }

  /** Get the computed pixel scale factor */
  getScale(): number {
    return this.scale;
  }

  /** Get the letterbox offset */
  getOffset(): Point {
    return { x: this.offsetX, y: this.offsetY };
  }

  /** Get the viewport dimensions */
  getViewport(): { width: number; height: number } {
    return { width: this.viewportWidth, height: this.viewportHeight };
  }

  /**
   * Apply the camera transform to a canvas context.
   * After this call, drawing in world coordinates will be
   * correctly scaled and positioned on screen.
   */
  applyTransform(ctx: CanvasRenderingContext2D): void {
    ctx.setTransform(this.scale, 0, 0, this.scale, this.offsetX, this.offsetY);
  }

  /**
   * Reset the context transform back to identity (screen space).
   */
  resetTransform(ctx: CanvasRenderingContext2D): void {
    ctx.setTransform(1, 0, 0, 1, 0, 0);
  }

  /**
   * Draw black letterbox bars to cover any area outside the game world.
   */
  drawLetterbox(ctx: CanvasRenderingContext2D): void {
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.fillStyle = '#000';

    // Top bar
    if (this.offsetY > 0) {
      ctx.fillRect(0, 0, this.viewportWidth, this.offsetY);
    }
    // Bottom bar
    const bottomY = this.offsetY + this.worldHeight * this.scale;
    if (bottomY < this.viewportHeight) {
      ctx.fillRect(0, bottomY, this.viewportWidth, this.viewportHeight - bottomY);
    }
    // Left bar
    if (this.offsetX > 0) {
      ctx.fillRect(0, 0, this.offsetX, this.viewportHeight);
    }
    // Right bar
    const rightX = this.offsetX + this.worldWidth * this.scale;
    if (rightX < this.viewportWidth) {
      ctx.fillRect(rightX, 0, this.viewportWidth - rightX, this.viewportHeight);
    }
  }
}
