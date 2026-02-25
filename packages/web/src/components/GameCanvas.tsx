import { useRef, useEffect } from 'react';
import { useGameStore } from '../stores/gameStore';
import { Camera, WORLD_WIDTH, WORLD_HEIGHT } from '../engine/camera';
import { GameLoop } from '../engine/gameLoop';
import { setPixelated } from '../engine/renderer';
import { drawVignette } from '../engine/effects';
import { SceneManager } from '../scenes/SceneManager';

export function GameCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;

    // Initialize engine systems
    const camera = new Camera(WORLD_WIDTH, WORLD_HEIGHT);
    const gameLoop = new GameLoop();

    // Scene state tracked imperatively (not via React deps)
    let currentSceneId: string | null = null;
    let currentAnimState = 'idle';
    let sceneManager: SceneManager | null = null;
    let waitingFrame = 0;

    // --- Resize handler ---
    function resize() {
      canvas!.width = window.innerWidth;
      canvas!.height = window.innerHeight;
      setPixelated(ctx);
      camera.resize(canvas!.width, canvas!.height);
    }
    resize();
    window.addEventListener('resize', resize);

    // --- Update callback ---
    const update = (dt: number) => {
      waitingFrame++;

      // Read latest state directly from the store (no React re-render needed)
      const { sceneId, animationState, connected, lastEvent } = useGameStore.getState();

      // Detect scene changes
      if (sceneId !== currentSceneId) {
        currentSceneId = sceneId;
        sceneManager?.destroy();
        if (sceneId) {
          sceneManager = new SceneManager(sceneId);
          sceneManager.init();
        } else {
          sceneManager = null;
        }
      }

      // Detect animation state changes
      if (animationState !== currentAnimState) {
        currentAnimState = animationState;
        sceneManager?.handleAnimationState(animationState);
      }

      // Pass last event info for UI display
      if (sceneManager && lastEvent) {
        sceneManager.lastEventType = lastEvent.type;
      }

      // Update scene manager
      sceneManager?.update(dt);
    };

    // --- Render callback ---
    const render = (_dt: number) => {
      const w = canvas!.width;
      const h = canvas!.height;
      const { connected } = useGameStore.getState();

      // Clear entire canvas
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.fillStyle = '#0a0a0a';
      ctx.fillRect(0, 0, w, h);

      if (!sceneManager) {
        drawWaiting(ctx, w, h, waitingFrame);
      } else {
        sceneManager.draw(ctx, camera);
      }

      // Connection indicator (always in screen space)
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      drawConnectionStatus(ctx, w, h, connected);
    };

    gameLoop.onUpdate(update);
    gameLoop.onRender(render);
    gameLoop.start();

    return () => {
      gameLoop.stop();
      sceneManager?.destroy();
      window.removeEventListener('resize', resize);
    };
  }, []); // Empty deps — runs once on mount, reads store imperatively

  // Handle canvas clicks for the scene cycle button
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Convert click to canvas coords
    const rect = canvas.getBoundingClientRect();
    const cx = (e.clientX - rect.left) * (canvas.width / rect.width);
    const cy = (e.clientY - rect.top) * (canvas.height / rect.height);

    // Compute game viewport bounds (same as camera)
    const scaleX = canvas.width / WORLD_WIDTH;
    const scaleY = canvas.height / WORLD_HEIGHT;
    const rawScale = Math.min(scaleX, scaleY);
    const scale = rawScale >= 1 ? Math.max(1, Math.floor(rawScale)) : rawScale;
    const ox = Math.round((canvas.width - WORLD_WIDTH * scale) / 2);
    const oy = Math.round((canvas.height - WORLD_HEIGHT * scale) / 2);
    const gameH = WORLD_HEIGHT * scale;

    // The cycle arrow is drawn at approximately (ox + textWidth + 8, oy + gameH - 16)
    // Check if click is in the bottom-left area near the scene title
    const btnX = ox;
    const btnY = oy + gameH - 40;
    if (cx >= btnX && cx <= btnX + 300 && cy >= btnY && cy <= btnY + 40) {
      useGameStore.getState().cycleScene();
    }
  };

  return <canvas ref={canvasRef} onClick={handleCanvasClick} style={{ cursor: 'pointer' }} />;
}

// ============================================
// Waiting screen (no scene set yet)
// ============================================

function drawWaiting(ctx: CanvasRenderingContext2D, w: number, h: number, frame: number) {
  ctx.fillStyle = '#1a1420';
  ctx.fillRect(0, 0, w, h);

  // Pulsing text
  const alpha = 0.5 + 0.5 * Math.sin(frame * 0.03);
  ctx.globalAlpha = alpha;
  ctx.fillStyle = '#d4a017';
  ctx.font = '24px monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('Awaiting connection...', w / 2, h / 2 - 20);
  ctx.font = '14px monospace';
  ctx.fillStyle = '#888';
  ctx.fillText('Start the CLI server with: npx claudeborne', w / 2, h / 2 + 20);
  ctx.globalAlpha = 1;

  // Vignette even on waiting screen
  drawVignette(ctx, w, h, 0.5);
}

// ============================================
// Connection status indicator
// ============================================

function drawConnectionStatus(
  ctx: CanvasRenderingContext2D,
  w: number,
  _h: number,
  connected: boolean,
) {
  ctx.globalAlpha = 0.7;
  ctx.fillStyle = connected ? '#4a4' : '#a44';
  ctx.beginPath();
  ctx.arc(w - 20, 20, 5, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 1;
}
