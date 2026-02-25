// ============================================
// Pool-based particle system
// ============================================

import type { Particle, ParticleEmitterConfig } from './types';

/**
 * Preset emitter configurations for common FromSoftware-themed effects.
 * These return partial configs that can be spread with a position override.
 */
export const PARTICLE_PRESETS = {
  /** Orange/red fire that rises and flickers */
  fire: (x: number, y: number): ParticleEmitterConfig => ({
    x,
    y,
    rate: 30,
    spread: 0.5,
    angle: -Math.PI / 2,
    speedMin: 20,
    speedMax: 60,
    colors: ['#ff4400', '#ff6600', '#ff8800', '#ffaa00', '#ffcc00'],
    lifetimeMin: 0.3,
    lifetimeMax: 0.8,
    gravity: -10,
    sizeMin: 2,
    sizeMax: 5,
    maxParticles: 60,
  }),

  /** Small embers drifting slowly upward */
  embers: (x: number, y: number): ParticleEmitterConfig => ({
    x,
    y,
    rate: 8,
    spread: 1.0,
    angle: -Math.PI / 2,
    speedMin: 5,
    speedMax: 20,
    colors: ['#ff6600', '#ff8800', '#ffaa00'],
    lifetimeMin: 1.0,
    lifetimeMax: 3.0,
    gravity: -5,
    sizeMin: 1,
    sizeMax: 3,
    maxParticles: 40,
  }),

  /** Blue/white ethereal souls floating */
  souls: (x: number, y: number): ParticleEmitterConfig => ({
    x,
    y,
    rate: 5,
    spread: Math.PI,
    angle: -Math.PI / 2,
    speedMin: 3,
    speedMax: 12,
    colors: ['#6688ff', '#88aaff', '#aaccff', '#ffffff'],
    lifetimeMin: 2.0,
    lifetimeMax: 4.0,
    gravity: -3,
    sizeMin: 1,
    sizeMax: 3,
    maxParticles: 30,
  }),

  /** Gold grace particles spiraling upward */
  grace: (x: number, y: number): ParticleEmitterConfig => ({
    x,
    y,
    rate: 12,
    spread: 0.8,
    angle: -Math.PI / 2,
    speedMin: 10,
    speedMax: 30,
    colors: ['#ffd700', '#ffec80', '#c8a832', '#fff5cc'],
    lifetimeMin: 1.0,
    lifetimeMax: 2.5,
    gravity: -8,
    sizeMin: 1,
    sizeMax: 3,
    maxParticles: 50,
  }),

  /** Red blood droplets that fall with gravity */
  blood: (x: number, y: number): ParticleEmitterConfig => ({
    x,
    y,
    rate: 20,
    spread: 1.2,
    angle: -Math.PI / 4,
    speedMin: 30,
    speedMax: 80,
    colors: ['#880000', '#aa0000', '#cc0000', '#660000'],
    lifetimeMin: 0.4,
    lifetimeMax: 1.0,
    gravity: 120,
    sizeMin: 1,
    sizeMax: 4,
    maxParticles: 40,
  }),
} as const;

/**
 * Pool-based particle system. Preallocates particle objects
 * and reuses them to avoid GC pressure.
 */
export class ParticleSystem {
  private pool: Particle[];
  private emitters: ParticleEmitterConfig[] = [];
  private accumulators: number[] = [];

  constructor(maxPoolSize: number = 500) {
    this.pool = [];
    for (let i = 0; i < maxPoolSize; i++) {
      this.pool.push(this.createDeadParticle());
    }
  }

  private createDeadParticle(): Particle {
    return {
      x: 0,
      y: 0,
      vx: 0,
      vy: 0,
      color: '#fff',
      alpha: 1,
      life: 0,
      maxLife: 1,
      size: 1,
      alphaMax: 1,
      active: false,
    };
  }

  /** Add an emitter configuration. Returns the emitter index. */
  addEmitter(config: ParticleEmitterConfig): number {
    this.emitters.push(config);
    this.accumulators.push(0);
    return this.emitters.length - 1;
  }

  /** Remove all emitters */
  clearEmitters(): void {
    this.emitters.length = 0;
    this.accumulators.length = 0;
  }

  /** Update emitter position */
  updateEmitter(index: number, x: number, y: number): void {
    const emitter = this.emitters[index];
    if (emitter) {
      emitter.x = x;
      emitter.y = y;
    }
  }

  /** Manually emit a burst of particles from a config */
  burst(config: ParticleEmitterConfig, count: number): void {
    for (let i = 0; i < count; i++) {
      this.spawnParticle(config);
    }
  }

  private spawnParticle(config: ParticleEmitterConfig): void {
    // Find an inactive particle in the pool
    let p: Particle | null = null;
    for (let i = 0; i < this.pool.length; i++) {
      if (!this.pool[i].active) {
        p = this.pool[i];
        break;
      }
    }
    if (!p) return; // pool exhausted

    const angle = config.angle + (Math.random() - 0.5) * config.spread;
    const speed = config.speedMin + Math.random() * (config.speedMax - config.speedMin);
    const lifetime = config.lifetimeMin + Math.random() * (config.lifetimeMax - config.lifetimeMin);

    p.x = config.x + (Math.random() - 0.5) * 4;
    p.y = config.y + (Math.random() - 0.5) * 4;
    p.vx = Math.cos(angle) * speed;
    p.vy = Math.sin(angle) * speed;
    p.color = config.colors[Math.floor(Math.random() * config.colors.length)];
    p.alpha = 1;
    p.alphaMax = config.alphaMax ?? 1;
    p.life = 1;
    p.maxLife = lifetime;
    p.size = config.sizeMin + Math.random() * (config.sizeMax - config.sizeMin);
    p.active = true;
  }

  /** Update all particles and emit new ones. dt is in seconds. */
  update(dt: number): void {
    // Emit from active emitters
    for (let i = 0; i < this.emitters.length; i++) {
      const config = this.emitters[i];
      this.accumulators[i] += config.rate * dt;
      while (this.accumulators[i] >= 1) {
        this.accumulators[i] -= 1;
        this.spawnParticle(config);
      }
    }

    // Update active particles
    for (let i = 0; i < this.pool.length; i++) {
      const p = this.pool[i];
      if (!p.active) continue;

      p.life -= dt / p.maxLife;
      if (p.life <= 0) {
        p.active = false;
        continue;
      }

      // Apply gravity from the emitter that spawned it.
      // Since particles don't track their emitter, apply a general gravity.
      // We use the first emitter's gravity as default, or 0.
      const gravity = this.emitters.length > 0 ? this.emitters[0].gravity : 0;
      p.vy += gravity * dt;

      p.x += p.vx * dt;
      p.y += p.vy * dt;

      // Fade alpha with life, capped by alphaMax
      p.alpha = p.life * p.alphaMax;
    }
  }

  /** Draw all active particles */
  draw(ctx: CanvasRenderingContext2D): void {
    const prevAlpha = ctx.globalAlpha;

    for (let i = 0; i < this.pool.length; i++) {
      const p = this.pool[i];
      if (!p.active) continue;

      ctx.globalAlpha = p.alpha;
      ctx.fillStyle = p.color;
      const rx = Math.round(p.x);
      const ry = Math.round(p.y);
      const rs = Math.round(p.size);
      ctx.fillRect(rx, ry, rs, rs);
    }

    ctx.globalAlpha = prevAlpha;
  }

  /** Get the count of active particles (for debugging) */
  get activeCount(): number {
    let count = 0;
    for (let i = 0; i < this.pool.length; i++) {
      if (this.pool[i].active) count++;
    }
    return count;
  }
}
