type Listener = () => void;

const SCALE = [261.63, 293.66, 349.23, 392, 440, 523.25];
const MELODY = [0, 2, 4, 2, 3, 1, 0, 4, 3, 2, 4, 5, 3, 1, 2, 0];

class Soundboard {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private muted = false;
  private musicOn = false;
  private cursor = 0;
  private timer: number | null = null;
  private listeners = new Set<Listener>();

  constructor() {
    try {
      this.muted = localStorage.getItem('lsd-mute') === '1';
    } catch {
      this.muted = false;
    }
  }

  subscribe = (listener: Listener) => {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  };

  getMuted = () => this.muted;

  private emit() {
    this.listeners.forEach((listener) => listener());
  }

  private ensure() {
    if (!this.ctx) {
      const ctx = new AudioContext();
      const master = ctx.createGain();
      master.gain.value = this.muted ? 0 : 0.9;
      master.connect(ctx.destination);
      this.ctx = ctx;
      this.master = master;
    }
    if (this.ctx.state === 'suspended') void this.ctx.resume();
    return this.ctx;
  }

  unlock() {
    this.ensure();
    if (!this.muted) this.startMusic();
  }

  toggle() {
    this.muted = !this.muted;
    try {
      localStorage.setItem('lsd-mute', this.muted ? '1' : '0');
    } catch {
      /* ignore private mode */
    }
    if (this.master) this.master.gain.setValueAtTime(this.muted ? 0 : 0.9, this.ctx?.currentTime ?? 0);
    if (!this.muted) this.unlock();
    this.emit();
  }

  startMusic() {
    if (this.musicOn || this.muted) return;
    this.ensure();
    this.musicOn = true;
    this.timer = window.setInterval(() => this.stepMusic(), 420);
  }

  stopMusic() {
    this.musicOn = false;
    if (this.timer) window.clearInterval(this.timer);
    this.timer = null;
  }

  private stepMusic() {
    if (!this.musicOn || this.muted || !this.ctx) return;
    const degree = MELODY[this.cursor % MELODY.length];
    this.cursor += 1;
    const freq = SCALE[degree];
    this.tone(freq, 0.34, 'triangle', 0.035);
    if (this.cursor % 4 === 0) this.tone(SCALE[0] / 2, 0.4, 'sine', 0.03);
  }

  correct() {
    this.blip([523.25, 659.25, 783.99], 0.09, 'sine', 0.07);
  }

  wrong() {
    this.ensure();
    this.tone(196, 0.16, 'triangle', 0.05);
    this.tone(155, 0.22, 'sine', 0.04, 0.08);
  }

  combo() {
    this.blip([523.25, 659.25, 783.99, 1046.5], 0.08, 'triangle', 0.07);
  }

  tick() {
    this.tone(880, 0.05, 'square', 0.03);
  }

  join() {
    this.blip([392, 523.25], 0.07, 'sine', 0.05);
  }

  whoosh() {
    this.tone(240, 0.18, 'sawtooth', 0.02);
    this.tone(480, 0.14, 'triangle', 0.03, 0.05);
  }

  fanfare() {
    this.blip([392, 523.25, 659.25, 783.99, 1046.5], 0.16, 'triangle', 0.08);
  }

  private blip(freqs: number[], dur: number, type: OscillatorType, gain: number) {
    this.ensure();
    freqs.forEach((freq, index) => this.tone(freq, dur, type, gain, index * dur * 0.85));
  }

  private tone(freq: number, dur: number, type: OscillatorType, gain: number, delay = 0) {
    if (!this.ctx || !this.master) return;
    const at = this.ctx.currentTime + delay;
    const osc = this.ctx.createOscillator();
    const amp = this.ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, at);
    amp.gain.setValueAtTime(0.0001, at);
    amp.gain.exponentialRampToValueAtTime(Math.max(0.0002, gain), at + 0.02);
    amp.gain.exponentialRampToValueAtTime(0.0001, at + dur);
    osc.connect(amp);
    amp.connect(this.master);
    osc.start(at);
    osc.stop(at + dur + 0.03);
  }
}

export const sounds = new Soundboard();
