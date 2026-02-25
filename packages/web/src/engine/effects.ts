// ============================================
// Post-processing visual effects
// ============================================

import type { Light } from './types';

/**
 * Draw a radial vignette (darkening at edges).
 */
export function drawVignette(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  intensity: number = 0.6,
): void {
  const cx = w / 2;
  const cy = h / 2;
  const maxDim = Math.max(w, h);
  const gradient = ctx.createRadialGradient(cx, cy, maxDim * 0.2, cx, cy, maxDim * 0.7);
  gradient.addColorStop(0, 'rgba(0,0,0,0)');
  gradient.addColorStop(1, `rgba(0,0,0,${intensity})`);
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, w, h);
}

/**
 * Draw animated fog overlay using layered sine waves.
 */
export function drawFog(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  density: number = 0.1,
  color: string = '#888888',
  time: number = 0,
): void {
  // Parse the color into rgb components
  const r = parseInt(color.slice(1, 3), 16) || 0;
  const g = parseInt(color.slice(3, 5), 16) || 0;
  const b = parseInt(color.slice(5, 7), 16) || 0;

  const prevAlpha = ctx.globalAlpha;

  // Draw several horizontal fog bands at different speeds
  const bands = 4;
  for (let i = 0; i < bands; i++) {
    const bandY = h * (0.3 + i * 0.15);
    const bandHeight = h * 0.2;
    const speed = 0.3 + i * 0.15;
    const phase = time * speed + i * 1.7;

    // Sine-wave modulated horizontal band
    const alpha = density * (0.5 + 0.5 * Math.sin(phase));
    ctx.globalAlpha = alpha;
    ctx.fillStyle = `rgb(${r},${g},${b})`;

    // Draw as a series of rects with varying opacity for a wavy feel
    const segments = 8;
    for (let s = 0; s < segments; s++) {
      const sx = (w / segments) * s;
      const sw = w / segments;
      const waveOffset = Math.sin(phase + s * 0.8) * 10;
      ctx.fillRect(
        Math.round(sx),
        Math.round(bandY + waveOffset),
        Math.round(sw),
        Math.round(bandHeight),
      );
    }
  }

  ctx.globalAlpha = prevAlpha;
}

/**
 * Draw point-based lighting using multiply-blend style.
 * Creates a dark overlay and punches light holes through it.
 */
export function drawLighting(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  lights: Light[],
  ambientDarkness: number = 0.5,
): void {
  if (lights.length === 0) return;

  // Save state
  const prevComposite = ctx.globalCompositeOperation;
  const prevAlpha = ctx.globalAlpha;

  // Draw a dark overlay
  ctx.globalAlpha = ambientDarkness;
  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, w, h);

  // Punch light holes using 'destination-out' blending
  ctx.globalCompositeOperation = 'destination-out';

  for (const light of lights) {
    // Apply flicker
    const flickerAmount = light.flicker > 0
      ? 1 - light.flicker * 0.3 * (Math.random())
      : 1;
    const effectiveIntensity = light.intensity * flickerAmount;
    const effectiveRadius = light.radius * (1 + light.flicker * 0.1 * (Math.random() - 0.5));

    const gradient = ctx.createRadialGradient(
      light.x, light.y, 0,
      light.x, light.y, effectiveRadius,
    );
    gradient.addColorStop(0, `rgba(0,0,0,${effectiveIntensity})`);
    gradient.addColorStop(1, 'rgba(0,0,0,0)');

    ctx.fillStyle = gradient;
    ctx.fillRect(
      light.x - effectiveRadius,
      light.y - effectiveRadius,
      effectiveRadius * 2,
      effectiveRadius * 2,
    );
  }

  // Restore and add color tint from lights
  ctx.globalCompositeOperation = 'source-over';

  for (const light of lights) {
    const flickerAmount = light.flicker > 0
      ? 1 - light.flicker * 0.3 * Math.random()
      : 1;
    const effectiveIntensity = light.intensity * flickerAmount * 0.15;
    const effectiveRadius = light.radius * 0.8;

    ctx.globalAlpha = effectiveIntensity;
    const gradient = ctx.createRadialGradient(
      light.x, light.y, 0,
      light.x, light.y, effectiveRadius,
    );
    gradient.addColorStop(0, light.color);
    gradient.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = gradient;
    ctx.fillRect(
      light.x - effectiveRadius,
      light.y - effectiveRadius,
      effectiveRadius * 2,
      effectiveRadius * 2,
    );
  }

  // Restore
  ctx.globalCompositeOperation = prevComposite;
  ctx.globalAlpha = prevAlpha;
}

/**
 * Draw a full-screen color flash (for stagger/damage effects).
 */
export function drawScreenFlash(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  color: string = '#ff0000',
  alpha: number = 0.3,
): void {
  const prevAlpha = ctx.globalAlpha;
  ctx.globalAlpha = alpha;
  ctx.fillStyle = color;
  ctx.fillRect(0, 0, w, h);
  ctx.globalAlpha = prevAlpha;
}
