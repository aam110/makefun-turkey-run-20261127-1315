// SoundEngine: every sound is a WebAudio oscillator, no audio files.
export class SoundEngine {
  constructor() {
    this.ctx = null;
    this.muted = false;
    this.master = null;
  }

  ensure() {
    if (this.ctx) return;
    try {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return;
      this.ctx = new AC();
      this.master = this.ctx.createGain();
      this.master.gain.value = 0.22;
      this.master.connect(this.ctx.destination);
    } catch (e) { this.ctx = null; }
  }

  toggleMute() {
    this.muted = !this.muted;
    if (this.master) this.master.gain.value = this.muted ? 0 : 0.22;
    return this.muted;
  }

  tone(freq, dur, type, vol, slideTo) {
    if (!this.ctx || this.muted) return;
    try {
      const t0 = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const g = this.ctx.createGain();
      osc.type = type || 'sine';
      osc.frequency.setValueAtTime(freq, t0);
      if (slideTo) osc.frequency.exponentialRampToValueAtTime(Math.max(20, slideTo), t0 + dur);
      g.gain.setValueAtTime(vol || 0.5, t0);
      g.gain.exponentialRampToValueAtTime(0.001, t0 + dur);
      osc.connect(g); g.connect(this.master);
      osc.start(t0); osc.stop(t0 + dur + 0.02);
    } catch (e) { /* audio is decoration, never fatal */ }
  }

  gobble() {
    // Comic turkey gobble: three fast descending blips.
    if (!this.ctx || this.muted) return;
    [520, 430, 340].forEach((f, i) => {
      setTimeout(() => this.tone(f, 0.09, 'square', 0.35, f * 0.7), i * 90);
    });
  }

  pickup() { this.tone(880, 0.12, 'triangle', 0.5, 1320); }
  sprint() { this.tone(300, 0.25, 'sawtooth', 0.25, 900); }
  decoy() { this.tone(660, 0.1, 'square', 0.3, 660); this.tone(660, 0.1, 'square', 0.3, 520); }
  smoke() { this.tone(180, 0.5, 'sine', 0.4, 60); }
  alarmTick() { this.tone(1200, 0.07, 'square', 0.3, 1200); }
  hurt() { this.tone(220, 0.3, 'sawtooth', 0.5, 90); }
  caught() { [400, 300, 200, 120].forEach((f, i) => setTimeout(() => this.tone(f, 0.22, 'sawtooth', 0.5, f * 0.8), i * 160)); }
  zoneClear() { [523, 659, 784, 1047].forEach((f, i) => setTimeout(() => this.tone(f, 0.18, 'triangle', 0.45, f), i * 110)); }
  escaped() { [523, 659, 784, 1047, 1319].forEach((f, i) => setTimeout(() => this.tone(f, 0.25, 'triangle', 0.5, f), i * 130)); }
  step() { this.tone(140, 0.05, 'sine', 0.12, 110); }
}
