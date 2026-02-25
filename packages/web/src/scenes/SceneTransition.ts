// ============================================
// Scene transitions — FromSoftware-style fades
// and banner text.
// ============================================

export type TransitionPhase =
  | 'none'
  | 'fade_out'       // Fade to black
  | 'title_display'  // Show scene name on black
  | 'fade_in'        // Fade scene in
  | 'death_flash'    // Brief red flash
  | 'death_text'     // "YOU DIED" fading in
  | 'death_hold'     // Hold then fade to black
  | 'victory_banner' // Victory text banner
  | 'victory_hold';  // Hold victory text

interface TransitionState {
  phase: TransitionPhase;
  elapsed: number;
  /** Duration of the current phase in seconds */
  duration: number;
  /** Text to display during title/death/victory phases */
  text: string;
  /** Secondary text line (game name etc) */
  subText: string;
  /** Callback when the transition completes fully */
  onComplete: (() => void) | null;
  /** Text color */
  textColor: string;
}

// Phase durations
const FADE_OUT_DURATION = 0.5;
const TITLE_DISPLAY_DURATION = 1.5;
const FADE_IN_DURATION = 0.5;
const DEATH_FLASH_DURATION = 0.3;
const DEATH_TEXT_DURATION = 2.0;
const DEATH_HOLD_DURATION = 1.5;
const VICTORY_BANNER_DURATION = 2.5;
const VICTORY_HOLD_DURATION = 1.5;

/**
 * Manages FromSoftware-style scene transitions:
 * - Scene entry: fade to black -> show title -> fade in
 * - Death: red flash -> "YOU DIED" -> fade to black
 * - Victory: banner text -> hold
 */
export class SceneTransition {
  private state: TransitionState = {
    phase: 'none',
    elapsed: 0,
    duration: 0,
    text: '',
    subText: '',
    onComplete: null,
    textColor: '#ffffff',
  };

  /** Whether any transition is currently active */
  get isActive(): boolean {
    return this.state.phase !== 'none';
  }

  /** Current phase */
  get phase(): TransitionPhase {
    return this.state.phase;
  }

  /**
   * Start a scene-entry transition (fade out -> title -> fade in).
   */
  startSceneEntry(sceneName: string, gameName: string, onComplete?: () => void): void {
    this.state = {
      phase: 'title_display',
      elapsed: 0,
      duration: TITLE_DISPLAY_DURATION,
      text: sceneName,
      subText: gameName,
      onComplete: onComplete ?? null,
      textColor: '#d4a017',
    };
  }

  /**
   * Start a "YOU DIED" transition.
   */
  startDeath(deathText: string, onComplete?: () => void): void {
    this.state = {
      phase: 'death_flash',
      elapsed: 0,
      duration: DEATH_FLASH_DURATION,
      text: deathText,
      subText: '',
      onComplete: onComplete ?? null,
      textColor: '#8b0000',
    };
  }

  /**
   * Start a victory banner transition.
   */
  startVictory(victoryText: string, onComplete?: () => void): void {
    this.state = {
      phase: 'victory_banner',
      elapsed: 0,
      duration: VICTORY_BANNER_DURATION,
      text: victoryText,
      subText: '',
      onComplete: onComplete ?? null,
      textColor: '#ffd700',
    };
  }

  /**
   * Advance the transition timer.
   */
  update(dt: number): void {
    if (this.state.phase === 'none') return;

    this.state.elapsed += dt;

    // Check if current phase is done
    if (this.state.elapsed >= this.state.duration) {
      this.advancePhase();
    }
  }

  private advancePhase(): void {
    const s = this.state;

    switch (s.phase) {
      case 'fade_out':
        s.phase = 'title_display';
        s.elapsed = 0;
        s.duration = TITLE_DISPLAY_DURATION;
        break;

      case 'title_display':
        s.phase = 'fade_in';
        s.elapsed = 0;
        s.duration = FADE_IN_DURATION;
        break;

      case 'fade_in':
        s.phase = 'none';
        s.onComplete?.();
        break;

      case 'death_flash':
        s.phase = 'death_text';
        s.elapsed = 0;
        s.duration = DEATH_TEXT_DURATION;
        break;

      case 'death_text':
        s.phase = 'death_hold';
        s.elapsed = 0;
        s.duration = DEATH_HOLD_DURATION;
        break;

      case 'death_hold':
        s.phase = 'none';
        s.onComplete?.();
        break;

      case 'victory_banner':
        s.phase = 'victory_hold';
        s.elapsed = 0;
        s.duration = VICTORY_HOLD_DURATION;
        break;

      case 'victory_hold':
        s.phase = 'none';
        s.onComplete?.();
        break;

      default:
        s.phase = 'none';
        break;
    }
  }

  /**
   * Draw the transition overlay. Should be drawn on top of everything.
   * Operates in screen space (not world space).
   */
  draw(ctx: CanvasRenderingContext2D, screenW: number, screenH: number): void {
    if (this.state.phase === 'none') return;

    const s = this.state;
    const t = Math.min(s.elapsed / s.duration, 1); // 0..1 progress

    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);

    switch (s.phase) {
      case 'fade_out':
        this.drawBlackOverlay(ctx, screenW, screenH, t);
        break;

      case 'title_display':
        this.drawBlackOverlay(ctx, screenW, screenH, 1);
        this.drawTitleText(ctx, screenW, screenH, s.text, s.subText, s.textColor, t);
        break;

      case 'fade_in':
        this.drawBlackOverlay(ctx, screenW, screenH, 1 - t);
        break;

      case 'death_flash':
        this.drawRedFlash(ctx, screenW, screenH, 1 - t);
        break;

      case 'death_text':
        this.drawBlackOverlay(ctx, screenW, screenH, 0.7);
        this.drawCenterText(ctx, screenW, screenH, s.text, s.textColor, t);
        break;

      case 'death_hold': {
        const fadeOut = Math.min(t * 1.5, 1);
        this.drawBlackOverlay(ctx, screenW, screenH, 0.7 + 0.3 * fadeOut);
        this.drawCenterText(ctx, screenW, screenH, s.text, s.textColor, 1 - fadeOut * 0.5);
        break;
      }

      case 'victory_banner':
        this.drawBlackOverlay(ctx, screenW, screenH, 0.4 * t);
        this.drawCenterText(ctx, screenW, screenH, s.text, s.textColor, t);
        break;

      case 'victory_hold': {
        const fade = Math.max(0, (t - 0.5) * 2);
        this.drawBlackOverlay(ctx, screenW, screenH, 0.4 * (1 - fade));
        this.drawCenterText(ctx, screenW, screenH, s.text, s.textColor, 1 - fade);
        break;
      }
    }

    ctx.restore();
  }

  private drawBlackOverlay(
    ctx: CanvasRenderingContext2D,
    w: number,
    h: number,
    alpha: number,
  ): void {
    ctx.globalAlpha = Math.max(0, Math.min(1, alpha));
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, w, h);
    ctx.globalAlpha = 1;
  }

  private drawRedFlash(
    ctx: CanvasRenderingContext2D,
    w: number,
    h: number,
    alpha: number,
  ): void {
    ctx.globalAlpha = Math.max(0, Math.min(1, alpha * 0.5));
    ctx.fillStyle = '#440000';
    ctx.fillRect(0, 0, w, h);
    ctx.globalAlpha = 1;
  }

  private drawTitleText(
    ctx: CanvasRenderingContext2D,
    w: number,
    h: number,
    text: string,
    subText: string,
    color: string,
    alpha: number,
  ): void {
    // Ease in-out for the text appearance
    const eased = alpha < 0.5
      ? 2 * alpha * alpha
      : 1 - Math.pow(-2 * alpha + 2, 2) / 2;

    ctx.globalAlpha = eased;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // Main title — gothic feel via spacing
    ctx.fillStyle = color;
    ctx.font = '28px "Times New Roman", serif';
    ctx.letterSpacing = '6px';
    ctx.fillText(text.toUpperCase(), w / 2, h / 2 - 10);
    ctx.letterSpacing = '0px';

    // Subtitle (game name)
    if (subText) {
      ctx.fillStyle = '#888888';
      ctx.font = '14px "Times New Roman", serif';
      ctx.letterSpacing = '3px';
      ctx.fillText(subText, w / 2, h / 2 + 20);
      ctx.letterSpacing = '0px';
    }

    ctx.globalAlpha = 1;
  }

  private drawCenterText(
    ctx: CanvasRenderingContext2D,
    w: number,
    h: number,
    text: string,
    color: string,
    alpha: number,
  ): void {
    const eased = alpha < 0.5
      ? 2 * alpha * alpha
      : 1 - Math.pow(-2 * alpha + 2, 2) / 2;

    ctx.globalAlpha = eased;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = color;
    ctx.font = '36px "Times New Roman", serif';
    ctx.letterSpacing = '8px';
    ctx.fillText(text.toUpperCase(), w / 2, h / 2);
    ctx.letterSpacing = '0px';
    ctx.globalAlpha = 1;
  }
}
