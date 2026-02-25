// ============================================
// Character state machine — walks between action
// positions and plays the appropriate animation.
// Supports both programmatic (ASCII) sprites and
// LPC image-based spritesheets.
// ============================================

import type { Point } from '../engine/types';
import type { AnimationState, CharacterType } from '@claudeborne/shared';
import { AnimationController } from '../engine/animation';
import { drawSprite } from '../engine/renderer';
import { flipSpriteH } from '../engine/spriteUtils';
import { getCharacterAssets } from './index';
import {
  ImageSpriteManager,
  LpcAnimator,
  LpcDirection,
  type LpcAnimationDef,
} from '../engine/imageSprite';

/** Pixels per second in world coordinates — deliberate FromSoft pace */
const WALK_SPEED = 60;

/** Distance threshold (in world pixels) to consider "arrived" */
const ARRIVE_THRESHOLD = 2;

export class CharacterController {
  /** Current position in world coordinates */
  position: Point;
  /** Target position (character walks towards this) */
  targetPosition: Point;
  /** Current animation state */
  currentState: AnimationState;
  /** Character type */
  type: CharacterType;
  /** Facing direction */
  facing: 'left' | 'right';
  /** Animation controller — programmatic fallback */
  animator: AnimationController;

  /** Whether the character is currently walking to a target */
  private walking: boolean = false;
  /** Per-state target positions */
  private actionPositions: Partial<Record<AnimationState, Point>> = {};

  // --- LPC image sprite fields (optional) ---
  private lpcManager: ImageSpriteManager | null = null;
  private lpcAnimator: LpcAnimator | null = null;
  private lpcFrameSize: number = 64;
  /** Scale factor for rendering LPC frames in world space */
  private lpcScale: number = 1;
  /** Sheet key prefix for this character (e.g. "hunter_") */
  private lpcSheetPrefix: string = '';
  /** Base animation definitions (before direction override) */
  private lpcBaseAnims: Record<string, LpcAnimationDef> = {};

  constructor(type: CharacterType, startPosition: Point) {
    this.type = type;
    this.position = { ...startPosition };
    this.targetPosition = { ...startPosition };
    this.currentState = 'idle';
    this.facing = 'right';

    const assets = getCharacterAssets(type);
    this.animator = new AnimationController(assets.spriteSheet, assets.animations);
    this.animator.play('idle');
  }

  /**
   * Initialize LPC image-based sprites for this character.
   * Once loaded, LPC sprites take priority over programmatic sprites.
   */
  initLpc(
    manager: ImageSpriteManager,
    sheetPrefix: string,
    frameSize: number,
    scale: number,
    animations: Record<AnimationState, LpcAnimationDef>,
  ): void {
    this.lpcManager = manager;
    this.lpcSheetPrefix = sheetPrefix;
    this.lpcFrameSize = frameSize;
    this.lpcScale = scale;
    this.lpcBaseAnims = { ...animations };

    const animator = new LpcAnimator();
    for (const [name, def] of Object.entries(animations)) {
      // Store with prefixed sheet key so the manager can find it
      animator.defineAnimation(name, {
        ...def,
        sheet: `${sheetPrefix}${def.sheet}`,
      });
    }
    this.lpcAnimator = animator;
    this.lpcAnimator.play('idle');
  }

  /** Whether LPC sprites are active and loaded */
  private get useLpc(): boolean {
    return !!(this.lpcManager?.isLoaded() && this.lpcAnimator);
  }

  /**
   * Set the prop positions map — where the character walks for each state.
   */
  setActionPositions(positions: Partial<Record<AnimationState, Point>>): void {
    this.actionPositions = positions;
  }

  /**
   * Set a new animation state. The character walks to the associated
   * prop position, then plays the state's animation.
   */
  setState(state: AnimationState): void {
    this.currentState = state;

    // Look up the target position for this state
    const target = this.actionPositions[state];
    if (target) {
      this.targetPosition = { ...target };
      const dx = this.targetPosition.x - this.position.x;
      const dy = this.targetPosition.y - this.position.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist > ARRIVE_THRESHOLD) {
        // Need to walk there first
        this.walking = true;
        if (dx !== 0) {
          this.facing = dx > 0 ? 'right' : 'left';
        }
        this.animator.play('walk');
        this.playLpcWalk();
        return;
      }
    }

    // Already at target or no target defined — play the state animation directly
    this.walking = false;
    this.animator.play(state);
    this.playLpcState(state);
  }

  /**
   * Play a walk animation on the LPC animator with correct direction.
   */
  private playLpcWalk(): void {
    if (!this.lpcAnimator) return;
    // Override the walk direction based on current facing
    const walkKey = this.facing === 'left' ? 'exit' : 'enter';
    this.lpcAnimator.play(walkKey);
  }

  /**
   * Play a state animation on the LPC animator.
   */
  private playLpcState(state: AnimationState): void {
    if (!this.lpcAnimator) return;
    this.lpcAnimator.play(state);
  }

  /**
   * Update position (walk towards target) and animation.
   */
  update(dt: number): void {
    if (this.walking) {
      const dx = this.targetPosition.x - this.position.x;
      const dy = this.targetPosition.y - this.position.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist <= ARRIVE_THRESHOLD) {
        // Arrived
        this.position.x = this.targetPosition.x;
        this.position.y = this.targetPosition.y;
        this.walking = false;
        this.animator.play(this.currentState);
        this.playLpcState(this.currentState);
      } else {
        // Move towards target
        const step = WALK_SPEED * dt;
        if (step >= dist) {
          this.position.x = this.targetPosition.x;
          this.position.y = this.targetPosition.y;
          this.walking = false;
          this.animator.play(this.currentState);
          this.playLpcState(this.currentState);
        } else {
          this.position.x += (dx / dist) * step;
          this.position.y += (dy / dist) * step;
          // Update facing based on movement direction
          if (dx !== 0) {
            this.facing = dx > 0 ? 'right' : 'left';
          }
        }
      }
    }

    this.animator.update(dt);
    this.lpcAnimator?.update(dt);
  }

  /**
   * Draw the character at its current position.
   * Position is the character's feet (bottom-center).
   */
  draw(ctx: CanvasRenderingContext2D, scale: number): void {
    if (this.useLpc) {
      this.drawLpc(ctx);
      return;
    }

    let frame = this.animator.getCurrentFrame();
    if (!frame) return;

    // Flip sprite if facing left
    if (this.facing === 'left') {
      frame = flipSpriteH(frame);
    }

    // Position is bottom-center, so offset to top-left
    const drawX = Math.round(this.position.x - (frame.width / 2));
    const drawY = Math.round(this.position.y - frame.height);

    drawSprite(ctx, frame, drawX, drawY, scale);
  }

  /**
   * Draw the character using LPC image sprites.
   * The 64x64 LPC frame has the character roughly centered
   * in the lower portion. We offset so the character's feet
   * align with this.position.
   */
  private drawLpc(ctx: CanvasRenderingContext2D): void {
    if (!this.lpcManager || !this.lpcAnimator) return;

    const sheetKey = this.lpcAnimator.getCurrentSheetKey();
    if (!sheetKey) return;

    const col = this.lpcAnimator.getCurrentColumn();
    const row = this.lpcAnimator.getCurrentRow();
    const fs = this.lpcFrameSize;
    const s = this.lpcScale;

    // The LPC character occupies roughly the center-bottom of the 64x64 frame.
    // The character's actual feet are at about y=60 in the frame (4px above bottom).
    // The character body is roughly 32px wide, centered horizontally.
    // Position is bottom-center (feet), so offset to frame top-left:
    const feetOffsetY = 4 * s; // 4px from bottom of frame to feet
    const drawX = Math.round(this.position.x - (fs * s) / 2);
    const drawY = Math.round(this.position.y - fs * s + feetOffsetY);

    this.lpcManager.drawFrame(
      ctx,
      sheetKey,
      fs,
      fs,
      col,
      row,
      drawX,
      drawY,
      s,
      false, // no flipH needed — we use direction rows instead
    );
  }
}
