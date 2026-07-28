import type { SoundId, SoundPort } from '$lib/services/ports/SoundPort';

/**
 * Procedural sound manager using the Web Audio API.
 * All sounds are synthesised at runtime — no external audio files needed.
 */
export class LocalSoundManager implements SoundPort {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private muted = false;
  private ambientSource: AudioBufferSourceNode | null = null;
  private ambientGain: GainNode | null = null;

  constructor() {
    // AudioContext is created lazily on first user interaction to comply with
    // browser autoplay policies. Call ensureContext() before any play() call.
  }

  private ensureContext(): AudioContext {
    if (!this.ctx) {
      const Ctor =
        window.AudioContext ??
        (window as unknown as { webkitAudioContext: typeof AudioContext })
          .webkitAudioContext;
      this.ctx = new Ctor();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.value = 0.45;
      this.masterGain.connect(this.ctx.destination);
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  setMuted(muted: boolean): void {
    this.muted = muted;
    if (this.masterGain) {
      this.masterGain.gain.value = muted ? 0 : 0.45;
    }
    if (muted) {
      this.stopAmbient();
    } else {
      // Ambient will restart on next startAmbient call
    }
  }

  play(id: SoundId): void {
    if (this.muted) return;
    const ctx = this.ensureContext();
    switch (id) {
      case 'shot':
        this.playShot(ctx);
        break;
      case 'collision':
        this.playCollision(ctx);
        break;
      case 'goal':
        this.playGoal(ctx);
        break;
      case 'whistle_start':
        this.playWhistle(ctx, true);
        break;
      case 'whistle_end':
        this.playWhistle(ctx, false);
        break;
      default:
        break;
    }
  }

  startAmbient(): void {
    if (this.muted || this.ambientSource) return;
    const ctx = this.ensureContext();
    this.stopAmbient();

    // Ambient crowd noise: filtered noise with slow modulation
    const bufSize = ctx.sampleRate * 4; // 4 second loop
    const buffer = ctx.createBuffer(1, bufSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufSize; i++) {
      // Band-limited noise with slow volume modulation (crowd "wave")
      const t = i / ctx.sampleRate;
      const mod = 0.5 + 0.5 * Math.sin(t * 0.15); // slow 0.15 Hz modulation
      data[i] = (Math.random() * 2 - 1) * mod * 0.3;
    }

    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.loop = true;

    const bandpass = ctx.createBiquadFilter();
    bandpass.type = 'bandpass';
    bandpass.frequency.value = 350;
    bandpass.Q.value = 0.5;

    const gain = ctx.createGain();
    gain.gain.value = 0.12;
    this.ambientGain = gain;

    source.connect(bandpass);
    bandpass.connect(gain);
    gain.connect(this.masterGain!);
    source.start();
    this.ambientSource = source;
  }

  stopAmbient(): void {
    if (this.ambientSource) {
      try {
        this.ambientSource.stop();
      } catch {
        // already stopped
      }
      this.ambientSource = null;
    }
    this.ambientGain = null;
  }

  destroy(): void {
    this.stopAmbient();
    if (this.ctx) {
      this.ctx.close();
      this.ctx = null;
    }
  }

  // ── Individual sound generators ──────────────────────────────────

  private playShot(ctx: AudioContext): void {
    // Slingshot "twang": filtered noise burst with fast pitch drop
    const dur = 0.15;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(400, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(120, ctx.currentTime + dur);
    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + dur);
    osc.connect(gain);
    gain.connect(this.masterGain!);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + dur + 0.05);
  }

  private playCollision(ctx: AudioContext): void {
    // Short click: bandpass noise burst
    const dur = 0.06;
    const bufSize = Math.floor(ctx.sampleRate * dur);
    const buffer = ctx.createBuffer(1, bufSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufSize; i++) {
      const env = 1 - i / bufSize;
      data[i] = (Math.random() * 2 - 1) * env;
    }
    const source = ctx.createBufferSource();
    source.buffer = buffer;

    const bandpass = ctx.createBiquadFilter();
    bandpass.type = 'bandpass';
    bandpass.frequency.value = 1800;
    bandpass.Q.value = 2;

    const gain = ctx.createGain();
    gain.gain.value = 0.2;

    source.connect(bandpass);
    bandpass.connect(gain);
    gain.connect(this.masterGain!);
    source.start();
  }

  private playGoal(ctx: AudioContext): void {
    // Celebratory rising tones
    const notes = [523, 659, 784, 1047]; // C5, E5, G5, C6
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'square';
      osc.frequency.value = freq;
      const start = ctx.currentTime + i * 0.12;
      gain.gain.setValueAtTime(0.15, start);
      gain.gain.exponentialRampToValueAtTime(0.001, start + 0.25);
      osc.connect(gain);
      gain.connect(this.masterGain!);
      osc.start(start);
      osc.stop(start + 0.3);
    });

    // Add a "cheer" noise burst after the tones
    const cheerDur = 0.6;
    const bufSize = Math.floor(ctx.sampleRate * cheerDur);
    const buffer = ctx.createBuffer(1, bufSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufSize; i++) {
      const env = Math.sin((i / bufSize) * Math.PI);
      data[i] = (Math.random() * 2 - 1) * env * 0.4;
    }
    const source = ctx.createBufferSource();
    source.buffer = buffer;

    const lp = ctx.createBiquadFilter();
    lp.type = 'lowpass';
    lp.frequency.value = 1200;

    const g = ctx.createGain();
    g.gain.value = 0.15;

    source.connect(lp);
    lp.connect(g);
    g.connect(this.masterGain!);
    source.start(ctx.currentTime + 0.4);
  }

  private playWhistle(ctx: AudioContext, start: boolean): void {
    // Referee whistle: sine sweep
    const dur = start ? 0.6 : 0.4;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    if (start) {
      osc.frequency.setValueAtTime(800, ctx.currentTime);
      osc.frequency.linearRampToValueAtTime(1200, ctx.currentTime + 0.15);
      osc.frequency.linearRampToValueAtTime(900, ctx.currentTime + dur);
    } else {
      osc.frequency.setValueAtTime(900, ctx.currentTime);
      osc.frequency.linearRampToValueAtTime(600, ctx.currentTime + dur);
    }
    gain.gain.setValueAtTime(0.25, ctx.currentTime);
    gain.gain.setValueAtTime(0.25, ctx.currentTime + dur * 0.7);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + dur);
    osc.connect(gain);
    gain.connect(this.masterGain!);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + dur + 0.05);
  }
}
