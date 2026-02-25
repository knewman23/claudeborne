// ============================================
// LPC-format spritesheet loader and renderer.
// Loads PNG images, extracts animation frames by
// row/column, renders them to canvas at any scale
// with pixelated rendering.
// ============================================

export interface LpcSheetConfig {
  /** Path to the PNG spritesheet (relative to public/) */
  src: string;
  /** Width of each frame in pixels */
  frameWidth: number;
  /** Height of each frame in pixels */
  frameHeight: number;
  /** Number of frames (columns) in this sheet */
  frameCount: number;
  /** Number of direction rows (usually 4: up, left, down, right) */
  directionCount: number;
}

export enum LpcDirection {
  Up = 0,
  Left = 1,
  Down = 2,
  Right = 3,
}

export interface LpcAnimationDef {
  /** Which spritesheet to use (key into loaded sheets) */
  sheet: string;
  /** Which row (direction) to use */
  direction: LpcDirection;
  /** Start frame index (column) */
  startFrame: number;
  /** Number of frames to play */
  frameCount: number;
  /** Duration per frame in seconds */
  frameDuration: number;
  /** Whether to loop */
  loop: boolean;
}

export class ImageSpriteManager {
  private sheets: Map<string, HTMLImageElement> = new Map();
  private loadPromises: Map<string, Promise<HTMLImageElement>> = new Map();
  private loaded = false;

  /**
   * Register a spritesheet to be loaded.
   * Call loadAll() after registering all sheets.
   */
  register(key: string, src: string): void {
    // Don't re-register
    if (this.loadPromises.has(key)) return;

    const promise = new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        this.sheets.set(key, img);
        resolve(img);
      };
      img.onerror = reject;
      img.src = src;
    });
    this.loadPromises.set(key, promise);
  }

  async loadAll(): Promise<void> {
    await Promise.all(this.loadPromises.values());
    this.loaded = true;
  }

  isLoaded(): boolean {
    return this.loaded;
  }

  getSheet(key: string): HTMLImageElement | undefined {
    return this.sheets.get(key);
  }

  /**
   * Draw a specific frame from a spritesheet.
   */
  drawFrame(
    ctx: CanvasRenderingContext2D,
    sheetKey: string,
    frameWidth: number,
    frameHeight: number,
    column: number,
    row: number,
    destX: number,
    destY: number,
    scale: number,
    flipH?: boolean,
  ): void {
    const sheet = this.sheets.get(sheetKey);
    if (!sheet) return;

    const sx = column * frameWidth;
    const sy = row * frameHeight;
    const dw = frameWidth * scale;
    const dh = frameHeight * scale;

    if (flipH) {
      ctx.save();
      ctx.translate(destX + dw, destY);
      ctx.scale(-1, 1);
      ctx.drawImage(sheet, sx, sy, frameWidth, frameHeight, 0, 0, dw, dh);
      ctx.restore();
    } else {
      ctx.drawImage(sheet, sx, sy, frameWidth, frameHeight, destX, destY, dw, dh);
    }
  }
}

/**
 * Animator that plays LPC animation definitions.
 */
export class LpcAnimator {
  private currentAnim: LpcAnimationDef | null = null;
  private currentAnimName: string = '';
  private animTime: number = 0;
  private currentFrame: number = 0;
  private animations: Map<string, LpcAnimationDef> = new Map();
  private finished: boolean = false;

  defineAnimation(name: string, def: LpcAnimationDef): void {
    this.animations.set(name, def);
  }

  play(name: string): void {
    if (name === this.currentAnimName && !this.finished) return;
    const anim = this.animations.get(name);
    if (!anim) return;
    this.currentAnim = anim;
    this.currentAnimName = name;
    this.animTime = 0;
    this.currentFrame = 0;
    this.finished = false;
  }

  update(dt: number): void {
    if (!this.currentAnim || this.finished) return;
    this.animTime += dt;
    const frameDur = this.currentAnim.frameDuration;
    const totalFrames = this.currentAnim.frameCount;

    if (this.animTime >= frameDur) {
      this.animTime -= frameDur;
      this.currentFrame++;
      if (this.currentFrame >= totalFrames) {
        if (this.currentAnim.loop) {
          this.currentFrame = 0;
        } else {
          this.currentFrame = totalFrames - 1;
          this.finished = true;
        }
      }
    }
  }

  getCurrentSheetKey(): string | null {
    return this.currentAnim?.sheet ?? null;
  }

  getCurrentColumn(): number {
    if (!this.currentAnim) return 0;
    return this.currentAnim.startFrame + this.currentFrame;
  }

  getCurrentRow(): number {
    return this.currentAnim?.direction ?? LpcDirection.Down;
  }

  getCurrentAnimName(): string {
    return this.currentAnimName;
  }

  isFinished(): boolean {
    return this.finished;
  }
}
