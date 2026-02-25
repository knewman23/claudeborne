// ============================================
// Scene orchestrator — owns the character,
// particles, lights, and draws everything in
// the correct layer order.
// ============================================

import type { SceneId, AnimationState } from '@claudeborne/shared';
import { SCENES } from '@claudeborne/shared';
import { Camera, WORLD_WIDTH, WORLD_HEIGHT } from '../engine/camera';
import { ParticleSystem } from '../engine/particles';
import { drawVignette, drawFog, drawLighting, drawScreenFlash } from '../engine/effects';
import type { Light } from '../engine/types';
import { CharacterController } from '../characters/CharacterController';
import { loadCharacterSprites } from '../characters/index';
import { ImageSpriteManager } from '../engine/imageSprite';
import { HUNTER_ANIMATIONS, HUNTER_FRAME_SIZE } from '../characters/hunterLpc';
import { KNIGHT_ANIMATIONS, KNIGHT_FRAME_SIZE } from '../characters/knightLpc';
import { SceneTransition } from './SceneTransition';
import {
  SCENE_PALETTES,
  SCENE_ACTION_POSITIONS,
  SCENE_LIGHTS,
  SCENE_PROPS,
  FLOOR_Y,
  getSceneParticleEmitters,
  type SceneProp,
} from './sceneConfigs';

/**
 * SceneManager orchestrates all visual elements of a scene:
 * background, fog, props, character, particles, lighting, vignette, UI text.
 *
 * Drawing order (back to front):
 * 1. Background fill (walls/ceiling)
 * 2. Floor fill
 * 3. Floor grid lines
 * 4. Fog effect
 * 5. Background props (behind character)
 * 6. Character
 * 7. Foreground props (in front of character)
 * 8. Particles
 * 9. Lighting overlay
 * 10. Screen flash (stagger)
 * 11. Vignette
 * 12. UI text (scene name, animation state)
 * 13. Scene transition overlay
 */
export class SceneManager {
  sceneId: SceneId;
  character: CharacterController;
  particles: ParticleSystem;
  lights: Light[];
  transition: SceneTransition;

  lastEventType: string = '';

  private time: number = 0;
  private frame: number = 0;
  private currentAnimState: AnimationState = 'idle';
  private sceneConfig: (typeof SCENES)[number];
  private spriteManager: ImageSpriteManager;
  private backgroundImage: HTMLImageElement | null = null;
  /** For animated background spritesheets (e.g. bonfire) */
  private bgFrameCount: number = 0;
  private bgFrameHeight: number = 0;
  private bgFrameInterval: number = 0.1; // seconds per frame
  private bgFrameTimer: number = 0;
  private bgCurrentFrame: number = 0;

  constructor(sceneId: SceneId) {
    this.sceneId = sceneId;
    this.sceneConfig = SCENES.find((s) => s.id === sceneId) ?? SCENES[0];
    this.particles = new ParticleSystem(500);
    this.lights = [];
    this.transition = new SceneTransition();
    this.spriteManager = new ImageSpriteManager();

    // Create character at start position (off left edge for entrance)
    const charType = this.sceneConfig.character;
    const idlePos = SCENE_ACTION_POSITIONS[this.sceneId]?.idle ?? { x: 192, y: 172 };
    const startPos = { x: -20, y: idlePos.y };
    this.character = new CharacterController(charType, startPos);

    // Load background image if available
    this.loadBackgroundImage();

    // Asynchronously load LPC spritesheets — the character will
    // use programmatic fallback sprites until loading completes.
    this.loadLpcSprites();
  }

  /**
   * Load a background image for the scene if one exists.
   */
  private loadBackgroundImage(): void {
    // Animated backgrounds use a vertical spritesheet (pre-extracted from GIF).
    // Static backgrounds use a single image.
    const bgMap: Partial<Record<SceneId, { src: string; frames?: number; interval?: number }>> = {
      'hunters-dream': { src: '/sprites/hunter/hunters_dream.png' },
      'firelink-shrine': { src: '/sprites/knight/bonfire_frames.png', frames: 22, interval: 0.1 },
      'site-of-grace': { src: '/sprites/knight/grace.png' },
    };
    const entry = bgMap[this.sceneId];
    if (!entry) return;

    const img = new Image();
    img.onload = () => {
      this.backgroundImage = img;
      if (entry.frames && entry.frames > 1) {
        this.bgFrameCount = entry.frames;
        this.bgFrameHeight = img.height / entry.frames;
        this.bgFrameInterval = entry.interval ?? 0.1;
      }
    };
    img.onerror = () => {
      // Silently fall back to procedural background
    };
    img.src = entry.src;
  }

  /**
   * Load LPC image sprites in the background. Once loaded, the
   * CharacterController switches from programmatic to image-based rendering.
   */
  private loadLpcSprites(): void {
    const charType = this.sceneConfig.character;
    loadCharacterSprites(this.spriteManager)
      .then(() => {
        // Wire up LPC sprites to the character controller
        if (charType === 'hunter') {
          this.character.initLpc(
            this.spriteManager,
            'hunter_',
            HUNTER_FRAME_SIZE,
            0.75,
            HUNTER_ANIMATIONS,
          );
        } else if (charType === 'knight') {
          this.character.initLpc(
            this.spriteManager,
            'knight_',
            KNIGHT_FRAME_SIZE,
            0.75,
            KNIGHT_ANIMATIONS,
          );
        }
      })
      .catch((err) => {
        // Silently fall back to programmatic sprites
        console.warn('Failed to load LPC sprites, using fallback:', err);
      });
  }

  /**
   * Initialize the scene — set up particles, lights, character, props.
   * Triggers the scene entrance transition.
   */
  init(): void {
    // Set up particle emitters
    this.particles.clearEmitters();
    const emitters = getSceneParticleEmitters(this.sceneId);
    for (const emitter of emitters) {
      this.particles.addEmitter(emitter);
    }

    // Set up lights
    this.lights = [...SCENE_LIGHTS[this.sceneId]];

    // Set up character action positions
    this.character.setActionPositions(SCENE_ACTION_POSITIONS[this.sceneId]);

    // Start scene entrance transition
    const gameNames: Record<string, string> = {
      'bloodborne': 'Bloodborne',
      'dark-souls': 'Dark Souls',
      'elden-ring': 'Elden Ring',
    };
    this.transition.startSceneEntry(
      this.sceneConfig.name,
      gameNames[this.sceneConfig.game] ?? this.sceneConfig.game,
      () => {
        // When transition completes, character walks to idle position
        this.character.setState('enter');
        // After a beat, switch to idle
        setTimeout(() => {
          if (this.currentAnimState === 'enter' || this.currentAnimState === 'idle') {
            this.character.setState('idle');
          }
        }, 800);
      },
    );
  }

  /**
   * Clean up resources when this scene is replaced.
   */
  destroy(): void {
    // Nothing to clean up currently — spritesheet is just an Image element
  }

  /**
   * Handle a new animation state from an event.
   */
  handleAnimationState(state: AnimationState): void {
    this.currentAnimState = state;

    // Special transitions
    if (state === 'exit') {
      this.transition.startDeath(this.sceneConfig.deathText);
      this.character.setState('exit');
      return;
    }

    if (state === 'victory') {
      this.character.setState('victory');
      // Delay the banner slightly so the victory animation plays first
      setTimeout(() => {
        this.transition.startVictory(this.sceneConfig.victoryText);
      }, 500);
      return;
    }

    if (state === 'enter') {
      // Re-init the scene (new session)
      const idlePos = SCENE_ACTION_POSITIONS[this.sceneId]?.idle ?? { x: 192, y: 172 };
      this.character.position = { x: -20, y: idlePos.y };
      this.init();
      return;
    }

    // Normal state changes
    this.character.setState(state);
  }

  /**
   * Update all scene systems.
   */
  update(dt: number): void {
    this.time += dt;
    this.frame++;

    // Advance animated background frame
    if (this.bgFrameCount > 0) {
      this.bgFrameTimer += dt;
      if (this.bgFrameTimer >= this.bgFrameInterval) {
        this.bgFrameTimer -= this.bgFrameInterval;
        this.bgCurrentFrame = (this.bgCurrentFrame + 1) % this.bgFrameCount;
      }
    }

    this.character.update(dt);
    this.particles.update(dt);
    this.transition.update(dt);
  }

  /**
   * Draw everything in correct layer order.
   * The camera's transform should already be applied before calling this,
   * or the camera is used internally to set up world-space rendering.
   */
  draw(ctx: CanvasRenderingContext2D, camera: Camera): void {
    const palette = SCENE_PALETTES[this.sceneId];
    const viewport = camera.getViewport();
    const screenW = viewport.width;
    const screenH = viewport.height;

    // ---- World-space drawing ----
    camera.applyTransform(ctx);

    if (this.backgroundImage) {
      if (this.bgFrameCount > 0) {
        // Animated spritesheet: draw current frame slice
        const sy = this.bgCurrentFrame * this.bgFrameHeight;
        ctx.drawImage(
          this.backgroundImage,
          0, sy, this.backgroundImage.width, this.bgFrameHeight,
          0, 0, WORLD_WIDTH, WORLD_HEIGHT,
        );
      } else {
        // Static background image
        ctx.drawImage(this.backgroundImage, 0, 0, WORLD_WIDTH, WORLD_HEIGHT);
      }
    } else {
      // Fallback: procedural background
      // 1. Background fill (walls/ceiling)
      ctx.fillStyle = palette.bg;
      ctx.fillRect(0, 0, WORLD_WIDTH, WORLD_HEIGHT);

      // 2. Floor fill
      ctx.fillStyle = palette.floor;
      ctx.fillRect(0, FLOOR_Y, WORLD_WIDTH, WORLD_HEIGHT - FLOOR_Y);

      // 3. Floor grid lines (subtle tile feel)
      ctx.strokeStyle = palette.bg;
      ctx.lineWidth = 0.5;
      const tileSize = 16;
      for (let y = FLOOR_Y; y < WORLD_HEIGHT; y += tileSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(WORLD_WIDTH, y);
        ctx.stroke();
      }
      for (let x = 0; x < WORLD_WIDTH; x += tileSize) {
        ctx.beginPath();
        ctx.moveTo(x, FLOOR_Y);
        ctx.lineTo(x, WORLD_HEIGHT);
        ctx.stroke();
      }

      // 4. Fog effect (in world space)
      drawFog(ctx, WORLD_WIDTH, WORLD_HEIGHT, palette.fogDensity, palette.fog, this.time);

      // 5. Scene-specific procedural decorations (behind character)
      this.drawSceneDecorations(ctx);

      // 5b. Background props
      const props = SCENE_PROPS[this.sceneId];
      for (const prop of props) {
        if (!prop.foreground) {
          this.drawProp(ctx, prop);
        }
      }
    }

    // 6. Character
    this.character.draw(ctx, 1);

    // 7. Foreground props (only for procedural scenes)
    if (!this.backgroundImage) {
      const fgProps = SCENE_PROPS[this.sceneId];
      for (const prop of fgProps) {
        if (prop.foreground) {
          this.drawProp(ctx, prop);
        }
      }
    }

    // 8. Particles (in world space)
    this.particles.draw(ctx);

    // 9. Lighting overlay (in world space)
    drawLighting(ctx, WORLD_WIDTH, WORLD_HEIGHT, this.lights, palette.ambientDarkness);

    // 10. Stagger screen flash (world space)
    if (this.currentAnimState === 'stagger') {
      const flashAlpha = 0.25 * Math.abs(Math.sin(this.frame * 0.2));
      drawScreenFlash(ctx, WORLD_WIDTH, WORLD_HEIGHT, '#ff0000', flashAlpha);
    }

    // 11. Vignette (world space)
    drawVignette(ctx, WORLD_WIDTH, WORLD_HEIGHT, palette.vignetteIntensity);

    // ---- Screen-space drawing ----
    camera.resetTransform(ctx);

    // Letterbox bars
    camera.drawLetterbox(ctx);

    // 12. UI text (after letterbox, positioned inside game viewport)
    const offset = camera.getOffset();
    const scale = camera.getScale();
    const gameW = WORLD_WIDTH * scale;
    const gameH = WORLD_HEIGHT * scale;
    this.drawUI(ctx, gameW, gameH, offset.x, offset.y);

    // 13. Scene transition overlay (always on top, screen space)
    this.transition.draw(ctx, screenW, screenH);
  }

  /**
   * Draw scene-specific procedural decorations (glow effects, special props).
   */
  private drawSceneDecorations(ctx: CanvasRenderingContext2D): void {
    const prevAlpha = ctx.globalAlpha;

    switch (this.sceneId) {
      case 'hunters-dream': {
        // Lantern glow on workbench
        const lanternGlow = 0.6 + 0.3 * Math.sin(this.frame * 0.05);
        ctx.globalAlpha = lanternGlow * 0.15;
        ctx.fillStyle = '#d4a017';
        ctx.beginPath();
        ctx.arc(85, FLOOR_Y - 30, 25, 0, Math.PI * 2);
        ctx.fill();
        break;
      }

      case 'firelink-shrine': {
        // Animated bonfire flames
        const fireFlicker = Math.sin(this.frame * 0.1) * 2;
        const colors = ['#ff4400', '#ff6600', '#ff8800', '#ffaa00', '#ffcc00'];
        for (let i = 0; i < 5; i++) {
          const fx = 186 + i * 3 + Math.sin(this.frame * 0.15 + i) * 2;
          const fy = FLOOR_Y - 12 - i * 4 - fireFlicker;
          const size = 5 - i * 0.6;
          ctx.fillStyle = colors[i];
          ctx.fillRect(Math.round(fx), Math.round(fy), Math.round(size), Math.round(size));
        }
        // Bonfire glow
        ctx.globalAlpha = 0.1 + 0.04 * Math.sin(this.frame * 0.08);
        ctx.fillStyle = '#ff6600';
        ctx.beginPath();
        ctx.arc(192, FLOOR_Y - 10, 50, 0, Math.PI * 2);
        ctx.fill();
        break;
      }

      case 'site-of-grace': {
        // Grace glow
        const graceGlow = 0.2 + 0.15 * Math.sin(this.frame * 0.04);
        ctx.globalAlpha = graceGlow;
        ctx.fillStyle = '#ffd700';
        ctx.beginPath();
        ctx.arc(192, FLOOR_Y - 25, 30, 0, Math.PI * 2);
        ctx.fill();

        // Erdtree in background (very subtle)
        ctx.globalAlpha = 0.08;
        ctx.fillStyle = '#ffd700';
        ctx.beginPath();
        ctx.moveTo(192, 0);
        ctx.lineTo(140, FLOOR_Y * 0.7);
        ctx.lineTo(244, FLOOR_Y * 0.7);
        ctx.closePath();
        ctx.fill();
        // Trunk
        ctx.fillStyle = '#8b7500';
        ctx.fillRect(185, FLOOR_Y * 0.5, 14, FLOOR_Y * 0.5);
        break;
      }
    }

    ctx.globalAlpha = prevAlpha;
  }

  /**
   * Draw a single prop rectangle.
   */
  private drawProp(ctx: CanvasRenderingContext2D, prop: SceneProp): void {
    ctx.fillStyle = prop.color;
    ctx.fillRect(
      Math.round(prop.x),
      Math.round(prop.y),
      Math.round(prop.width),
      Math.round(prop.height),
    );
  }

  /**
   * Draw UI text (scene name, animation state) in screen space.
   */
  private drawUI(ctx: CanvasRenderingContext2D, w: number, h: number, ox: number = 0, oy: number = 0): void {
    // Scene title (bottom-left, inside game viewport)
    ctx.globalAlpha = 0.6;
    ctx.fillStyle = '#aaaaaa';
    ctx.font = '12px monospace';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'alphabetic';
    const gameDisplayName: Record<string, string> = {
      'bloodborne': 'Bloodborne',
      'dark-souls': 'Dark Souls',
      'elden-ring': 'Elden Ring',
    };
    const gameName = gameDisplayName[this.sceneConfig.game] ?? this.sceneConfig.game;
    const titleText = `${this.sceneConfig.name} \u2014 ${gameName}`;
    ctx.fillText(titleText, ox + 16, oy + h - 16);

    // Cycle arrow next to scene title
    const titleWidth = ctx.measureText(titleText).width;
    ctx.globalAlpha = 0.35;
    ctx.fillText('\u25B6', ox + 24 + titleWidth, oy + h - 16);

    // Animation state + Claude event (bottom-right)
    ctx.textAlign = 'right';
    ctx.font = '11px monospace';

    // Claude state (e.g. "thinking", "tool_use", etc.)
    if (this.lastEventType) {
      ctx.globalAlpha = 0.35;
      ctx.fillStyle = '#aaaaaa';
      ctx.fillText(this.lastEventType, ox + w - 16, oy + h - 30);
    }

    // Animation state
    ctx.globalAlpha = 0.5;
    ctx.fillStyle = '#aaaaaa';
    ctx.fillText(this.currentAnimState, ox + w - 16, oy + h - 16);

    ctx.globalAlpha = 1;
    ctx.textAlign = 'left';
  }
}
