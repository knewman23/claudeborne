// ============================================
// Game loop with requestAnimationFrame
// ============================================

export type UpdateCallback = (dt: number) => void;
export type RenderCallback = (dt: number) => void;

/**
 * Core game loop that drives update and render cycles.
 *
 * Features:
 * - Delta time calculation (capped at 100ms to prevent death spirals)
 * - Pauses when the browser tab is not visible
 * - FPS tracking for debug
 * - Clean start/stop lifecycle
 */
export class GameLoop {
  private running: boolean = false;
  private animId: number = 0;
  private lastTimestamp: number = 0;

  private updateCallbacks: UpdateCallback[] = [];
  private renderCallbacks: RenderCallback[] = [];

  // FPS tracking
  private frameCount: number = 0;
  private fpsAccumulator: number = 0;
  private currentFps: number = 0;

  // Visibility handling
  private handleVisibility: () => void;
  private paused: boolean = false;

  constructor() {
    this.handleVisibility = () => {
      if (document.hidden) {
        this.paused = true;
      } else {
        this.paused = false;
        // Reset timestamp so we don't get a huge dt on resume
        this.lastTimestamp = 0;
      }
    };
  }

  /** Register an update callback (called with dt in seconds) */
  onUpdate(callback: UpdateCallback): void {
    this.updateCallbacks.push(callback);
  }

  /** Register a render callback (called with dt in seconds) */
  onRender(callback: RenderCallback): void {
    this.renderCallbacks.push(callback);
  }

  /** Remove an update callback */
  offUpdate(callback: UpdateCallback): void {
    const idx = this.updateCallbacks.indexOf(callback);
    if (idx !== -1) this.updateCallbacks.splice(idx, 1);
  }

  /** Remove a render callback */
  offRender(callback: RenderCallback): void {
    const idx = this.renderCallbacks.indexOf(callback);
    if (idx !== -1) this.renderCallbacks.splice(idx, 1);
  }

  /** Start the game loop */
  start(): void {
    if (this.running) return;
    this.running = true;
    this.lastTimestamp = 0;
    this.paused = false;
    document.addEventListener('visibilitychange', this.handleVisibility);
    this.animId = requestAnimationFrame(this.tick);
  }

  /** Stop the game loop */
  stop(): void {
    this.running = false;
    cancelAnimationFrame(this.animId);
    document.removeEventListener('visibilitychange', this.handleVisibility);
    this.updateCallbacks.length = 0;
    this.renderCallbacks.length = 0;
  }

  /** Get the current FPS (updated once per second) */
  getFps(): number {
    return this.currentFps;
  }

  private tick = (timestamp: number): void => {
    if (!this.running) return;

    // Schedule next frame first
    this.animId = requestAnimationFrame(this.tick);

    if (this.paused) {
      this.lastTimestamp = 0;
      return;
    }

    // Calculate delta time
    if (this.lastTimestamp === 0) {
      this.lastTimestamp = timestamp;
      return;
    }

    let dtMs = timestamp - this.lastTimestamp;
    this.lastTimestamp = timestamp;

    // Cap dt to prevent spiral of death (e.g., after breakpoint or long GC pause)
    if (dtMs > 100) dtMs = 100;

    const dt = dtMs / 1000; // Convert to seconds

    // FPS tracking
    this.frameCount++;
    this.fpsAccumulator += dtMs;
    if (this.fpsAccumulator >= 1000) {
      this.currentFps = this.frameCount;
      this.frameCount = 0;
      this.fpsAccumulator -= 1000;
    }

    // Update
    for (let i = 0; i < this.updateCallbacks.length; i++) {
      this.updateCallbacks[i](dt);
    }

    // Render
    for (let i = 0; i < this.renderCallbacks.length; i++) {
      this.renderCallbacks[i](dt);
    }
  };
}
