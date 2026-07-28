import type { SoundPort } from '$lib/services/ports/SoundPort';

type OscillatorType = 'sine' | 'square' | 'triangle' | 'sawtooth';

/**
 * Sound manager using Web Audio API to generate all sounds programmatically.
 * No external audio files needed. Falls back silently if AudioContext unavailable.
 */
export class LocalSoundManager implements SoundPort {
  private ctx: AudioContext | null = null;
  private muted = false;
  private ambientGain: GainNode | null = null;
  private ambientInterval: ReturnType<typeof setInterval> | null = null;

  private getCtx(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      try {
        this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      } catch {
        return null;
      }
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  private tone(
    freq: number,
    duration: number,
    type: OscillatorType = 'sine',
    volume = 0.15,
    delay = 0
  ): void {
    const ctx = this.getCtx();
    if (!ctx || this.muted) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, ctx.currentTime + delay);
    gain.gain.setValueAtTime(volume, ctx.currentTime + delay);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + delay + duration);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(ctx.currentTime + delay);
    osc.stop(ctx.currentTime + delay + duration);
  }

  private noise(duration: number, volume = 0.08): void {
    const ctx = this.getCtx();
    if (!ctx || this.muted) return;
    const bufferSize = ctx.sampleRate * duration;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(volume, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
    source.connect(gain);
    gain.connect(ctx.destination);
    source.start();
  }

  play(name: string): void {
    switch (name) {
      case 'whistle_start':
        this.tone(800, 0.5, 'sine', 0.12);
        setTimeout(() => this.tone(1000, 0.6, 'sine', 0.12), 150);
        break;
      case 'whistle_end':
        this.tone(1000, 0.3, 'sine', 0.12);
        setTimeout(() => this.tone(700, 0.5, 'sine', 0.12), 120);
        break;
      case 'shot':
        this.tone(200, 0.08, 'square', 0.06);
        this.noise(0.04, 0.04);
        break;
      case 'goal':
        this.tone(523, 0.15, 'triangle', 0.15);
        setTimeout(() => this.tone(659, 0.15, 'triangle', 0.15), 120);
        setTimeout(() => this.tone(784, 0.25, 'triangle', 0.15), 240);
        this.noise(0.1, 0.06);
        break;
      case 'collision':
        this.tone(120, 0.04, 'square', 0.04);
        this.noise(0.03, 0.03);
        break;
      default:
        this.tone(440, 0.1, 'sine', 0.05);
    }
  }

  startAmbient(): void {
    const ctx = this.getCtx();
    if (!ctx || this.muted) return;
    this.stopAmbient();
    this.ambientGain = ctx.createGain();
    this.ambientGain.gain.setValueAtTime(0.015, ctx.currentTime);
    this.ambientGain.connect(ctx.destination);

    // Low crowd hum
    const oscLow = ctx.createOscillator();
    oscLow.type = 'sawtooth';
    oscLow.frequency.setValueAtTime(80, ctx.currentTime);
    const lowGain = ctx.createGain();
    lowGain.gain.setValueAtTime(0.015, ctx.currentTime);
    oscLow.connect(lowGain);
    lowGain.connect(this.ambientGain);
    oscLow.start();

    this.ambientInterval = setInterval(() => {
      if (this.muted || !this.ambientGain) return;
      // Random crowd swell
      const swell = ctx.createGain();
      swell.gain.setValueAtTime(0.01, ctx.currentTime);
      swell.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1);
      const osc = ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(100 + Math.random() * 50, ctx.currentTime);
      osc.connect(swell);
      swell.connect(this.ambientGain);
      osc.start();
      osc.stop(ctx.currentTime + 1);
    }, 3000);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (this.ambientInterval as any)?.unref?.();
  }

  stopAmbient(): void {
    if (this.ambientInterval) {
      clearInterval(this.ambientInterval);
      this.ambientInterval = null;
    }
    if (this.ambientGain) {
      this.ambientGain.gain.setValueAtTime(0, (this.ctx?.currentTime ?? 0) + 0.1);
      this.ambientGain = null;
    }
  }

  setMuted(muted: boolean): void {
    this.muted = muted;
    if (muted) this.stopAmbient();
  }

  isMuted(): boolean {
    return this.muted;
  }
}
