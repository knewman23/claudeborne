// ============================================
// Sprite animation controller
// ============================================

import type { Sprite, SpriteSheet, AnimationDef } from './types';

/**
 * Manages sprite animation playback with frame timing,
 * looping, and animation transitions.
 */
export class AnimationController {
  private sheet: SpriteSheet;
  private animations: Record<string, AnimationDef>;
  private currentAnim: string | null = null;
  private currentFrameIndex: number = 0;
  private elapsed: number = 0;
  private finished: boolean = false;

  /** Optional transition animation to play before switching */
  private pendingAnim: string | null = null;
  private transitionMap: Record<string, string> = {};

  constructor(sheet: SpriteSheet, animations: Record<string, AnimationDef>) {
    this.sheet = sheet;
    this.animations = animations;
  }

  /**
   * Register a transition: when switching from any animation to `targetAnim`,
   * play `transitionAnim` first.
   */
  setTransition(targetAnim: string, transitionAnim: string): void {
    this.transitionMap[targetAnim] = transitionAnim;
  }

  /**
   * Start playing an animation by name. If a transition is registered
   * for this animation, the transition plays first.
   */
  play(animName: string): void {
    if (animName === this.currentAnim && !this.finished) return;

    // Check if there's a transition to play first
    const transition = this.transitionMap[animName];
    if (transition && transition !== this.currentAnim && this.animations[transition]) {
      this.pendingAnim = animName;
      this.switchTo(transition);
    } else {
      this.pendingAnim = null;
      this.switchTo(animName);
    }
  }

  private switchTo(animName: string): void {
    if (!this.animations[animName]) return;
    this.currentAnim = animName;
    this.currentFrameIndex = 0;
    this.elapsed = 0;
    this.finished = false;
  }

  /**
   * Advance the animation by dt seconds.
   */
  update(dt: number): void {
    if (!this.currentAnim || this.finished) return;

    const anim = this.animations[this.currentAnim];
    if (!anim || anim.frames.length === 0) return;

    this.elapsed += dt;

    while (this.elapsed >= anim.frameDuration) {
      this.elapsed -= anim.frameDuration;
      this.currentFrameIndex++;

      if (this.currentFrameIndex >= anim.frames.length) {
        if (anim.loop) {
          this.currentFrameIndex = 0;
        } else {
          this.currentFrameIndex = anim.frames.length - 1;
          this.finished = true;

          // If there's a pending animation, switch to it now
          if (this.pendingAnim) {
            const next = this.pendingAnim;
            this.pendingAnim = null;
            this.switchTo(next);
          }
          return;
        }
      }
    }
  }

  /**
   * Get the current frame's Sprite, or null if no animation is playing.
   */
  getCurrentFrame(): Sprite | null {
    if (!this.currentAnim) return null;
    const anim = this.animations[this.currentAnim];
    if (!anim || anim.frames.length === 0) return null;

    const frameKey = anim.frames[this.currentFrameIndex];
    return this.sheet.sprites[frameKey] ?? null;
  }

  /** Get the name of the currently playing animation */
  getCurrentAnimationName(): string | null {
    return this.currentAnim;
  }

  /** Check if the current animation has finished (non-looping only) */
  isFinished(): boolean {
    return this.finished;
  }
}
