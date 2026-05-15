// ============================================================
// AudioManager - Procedural sound effects + background music
// ============================================================

export default class AudioManager {
  constructor() {
    this.ctx = null;
    this.enabled = true;
    this.musicNodes = [];
    this.musicPlaying = false;
  }

  init() {
    try {
      this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    } catch (e) {
      this.enabled = false;
    }
  }

  resume() {
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  // ── Background Music (energetic loop) ──
  startMusic() {
    if (!this.ctx || !this.enabled || this.musicPlaying) return;
    this.musicPlaying = true;
    this._playMusicLoop();
  }

  stopMusic() {
    this.musicPlaying = false;
    this.musicNodes.forEach(n => { try { n.stop(); } catch(e) {} });
    this.musicNodes = [];
  }

  _playMusicLoop() {
    if (!this.musicPlaying || !this.ctx) return;
    const t = this.ctx.currentTime;
    const bpm = 140;
    const beatLen = 60 / bpm;
    const barLen = beatLen * 4;

    // Bass line
    const bassNotes = [65, 65, 82, 82, 73, 73, 87, 82];
    const masterGain = this.ctx.createGain();
    masterGain.gain.setValueAtTime(0.08, t);
    masterGain.connect(this.ctx.destination);

    bassNotes.forEach((freq, i) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(freq, t + i * beatLen);
      gain.gain.setValueAtTime(0.06, t + i * beatLen);
      gain.gain.exponentialRampToValueAtTime(0.01, t + (i + 0.8) * beatLen);
      osc.connect(gain).connect(masterGain);
      osc.start(t + i * beatLen);
      osc.stop(t + (i + 0.9) * beatLen);
      this.musicNodes.push(osc);
    });

    // Melody
    const melodyNotes = [262, 330, 392, 330, 349, 294, 262, 392];
    melodyNotes.forEach((freq, i) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, t + i * beatLen);
      gain.gain.setValueAtTime(0.04, t + i * beatLen);
      gain.gain.exponentialRampToValueAtTime(0.005, t + (i + 0.7) * beatLen);
      osc.connect(gain).connect(masterGain);
      osc.start(t + i * beatLen);
      osc.stop(t + (i + 0.8) * beatLen);
      this.musicNodes.push(osc);
    });

    // Hi-hat rhythm
    for (let i = 0; i < 16; i++) {
      const buf = this.ctx.createBuffer(1, this.ctx.sampleRate * 0.03, this.ctx.sampleRate);
      const d = buf.getChannelData(0);
      for (let j = 0; j < d.length; j++) d[j] = (Math.random() * 2 - 1) * 0.15;
      const src = this.ctx.createBufferSource();
      src.buffer = buf;
      const g = this.ctx.createGain();
      g.gain.setValueAtTime(i % 2 === 0 ? 0.05 : 0.025, t + i * beatLen / 2);
      g.gain.exponentialRampToValueAtTime(0.001, t + i * beatLen / 2 + 0.04);
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'highpass';
      filter.frequency.value = 8000;
      src.connect(filter).connect(g).connect(masterGain);
      src.start(t + i * beatLen / 2);
      this.musicNodes.push(src);
    }

    // Schedule next loop
    const loopDuration = barLen * 2;
    setTimeout(() => this._playMusicLoop(), loopDuration * 950);
  }

  // ── SFX ──
  playJump() {
    if (!this.ctx || !this.enabled) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(250, t);
    osc.frequency.exponentialRampToValueAtTime(500, t + 0.1);
    gain.gain.setValueAtTime(0.15, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.15);
    osc.connect(gain).connect(this.ctx.destination);
    osc.start(t); osc.stop(t + 0.15);
  }

  playBite() {
    if (!this.ctx || !this.enabled) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(200, t);
    osc.frequency.exponentialRampToValueAtTime(80, t + 0.08);
    gain.gain.setValueAtTime(0.2, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.1);
    osc.connect(gain).connect(this.ctx.destination);
    osc.start(t); osc.stop(t + 0.1);
    const osc2 = this.ctx.createOscillator();
    const gain2 = this.ctx.createGain();
    osc2.type = 'sawtooth';
    osc2.frequency.setValueAtTime(120, t + 0.05);
    osc2.frequency.exponentialRampToValueAtTime(90, t + 0.2);
    gain2.gain.setValueAtTime(0.12, t + 0.05);
    gain2.gain.exponentialRampToValueAtTime(0.01, t + 0.25);
    osc2.connect(gain2).connect(this.ctx.destination);
    osc2.start(t + 0.05); osc2.stop(t + 0.25);
  }

  playDeath() {
    if (!this.ctx || !this.enabled) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(400, t);
    osc.frequency.exponentialRampToValueAtTime(100, t + 0.3);
    gain.gain.setValueAtTime(0.2, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.35);
    osc.connect(gain).connect(this.ctx.destination);
    osc.start(t); osc.stop(t + 0.35);
  }

  playRoar() {
    if (!this.ctx || !this.enabled) return;
    const t = this.ctx.currentTime;
    for (let i = 0; i < 3; i++) {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = i === 0 ? 'sawtooth' : 'square';
      osc.frequency.setValueAtTime(80 + i * 30, t);
      osc.frequency.exponentialRampToValueAtTime(50 + i * 20, t + 0.5);
      gain.gain.setValueAtTime(0.1, t);
      gain.gain.exponentialRampToValueAtTime(0.01, t + 0.6);
      osc.connect(gain).connect(this.ctx.destination);
      osc.start(t); osc.stop(t + 0.6);
    }
  }

  playEagle() {
    if (!this.ctx || !this.enabled) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(1200, t);
    osc.frequency.exponentialRampToValueAtTime(800, t + 0.15);
    osc.frequency.exponentialRampToValueAtTime(1400, t + 0.3);
    gain.gain.setValueAtTime(0.1, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.35);
    osc.connect(gain).connect(this.ctx.destination);
    osc.start(t); osc.stop(t + 0.35);
  }

  playCoin() {
    if (!this.ctx || !this.enabled) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(880, t);
    osc.frequency.exponentialRampToValueAtTime(1760, t + 0.08);
    gain.gain.setValueAtTime(0.15, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.12);
    osc.connect(gain).connect(this.ctx.destination);
    osc.start(t); osc.stop(t + 0.12);
    // Second chime
    const osc2 = this.ctx.createOscillator();
    const gain2 = this.ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(1320, t + 0.06);
    gain2.gain.setValueAtTime(0.1, t + 0.06);
    gain2.gain.exponentialRampToValueAtTime(0.01, t + 0.2);
    osc2.connect(gain2).connect(this.ctx.destination);
    osc2.start(t + 0.06); osc2.stop(t + 0.2);
  }

  playBuffaloBlock() {
    if (!this.ctx || !this.enabled) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'square';
    osc.frequency.setValueAtTime(60, t);
    osc.frequency.exponentialRampToValueAtTime(40, t + 0.2);
    gain.gain.setValueAtTime(0.2, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.25);
    osc.connect(gain).connect(this.ctx.destination);
    osc.start(t); osc.stop(t + 0.25);
  }

  playPurchase() {
    if (!this.ctx || !this.enabled) return;
    const t = this.ctx.currentTime;
    [523, 659, 784].forEach((freq, i) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t + i * 0.1);
      gain.gain.setValueAtTime(0.12, t + i * 0.1);
      gain.gain.exponentialRampToValueAtTime(0.01, t + i * 0.1 + 0.15);
      osc.connect(gain).connect(this.ctx.destination);
      osc.start(t + i * 0.1); osc.stop(t + i * 0.1 + 0.15);
    });
  }
}
