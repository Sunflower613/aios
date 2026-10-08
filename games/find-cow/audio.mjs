// Locally synthesized sound: no downloads, external tracks or autoplay needed.
export class PastureAudio {
  constructor(createContext = () => new (globalThis.AudioContext || globalThis.webkitAudioContext)()) {
    this.createContext = createContext;
    this.effects = true; this.music = false; this.visible = true;
    this.context = null; this.loop = null; this.step = 0; this.lastTick = -Infinity;
  }
  async unlock() {
    if (!this.visible || (!this.effects && !this.music)) return;
    try {
      if (!this.context) {
        this.context = this.createContext();
        this.fx = this.context.createGain(); this.bgm = this.context.createGain();
        this.fx.connect(this.context.destination); this.bgm.connect(this.context.destination);
        this.updateVolumes();
      }
      if (this.context.state === 'suspended') await this.context.resume();
      this.syncMusic();
    } catch { /* Audio must never prevent the puzzle from running. */ }
  }
  setEffects(enabled) { this.effects = enabled; this.updateVolumes(); }
  setMusic(enabled) { this.music = enabled; this.updateVolumes(); this.syncMusic(); }
  setVisible(visible) {
    this.visible = visible; this.updateVolumes(); this.syncMusic();
    if (!visible) this.context?.suspend().catch(() => {});
    else this.unlock();
  }
  updateVolumes() {
    if (!this.context) return;
    this.fx.gain.setValueAtTime(this.effects && this.visible ? 0.13 : 0, this.context.currentTime);
    this.bgm.gain.setValueAtTime(this.music && this.visible ? 0.075 : 0, this.context.currentTime);
  }
  note(frequency, duration, bus, delay = 0, type = 'sine', volume = 1) {
    const start = this.context.currentTime + delay;
    const oscillator = this.context.createOscillator(), envelope = this.context.createGain();
    oscillator.type = type; oscillator.frequency.setValueAtTime(frequency, start);
    envelope.gain.setValueAtTime(0, start);
    envelope.gain.linearRampToValueAtTime(volume, start + 0.015);
    envelope.gain.exponentialRampToValueAtTime(0.001, start + duration);
    oscillator.connect(envelope); envelope.connect(bus);
    oscillator.onended = () => { oscillator.disconnect(); envelope.disconnect(); };
    oscillator.start(start); oscillator.stop(start + duration + 0.02);
  }
  play(kind) {
    if (!this.effects || !this.visible || this.context?.state !== 'running') return;
    const melodies = { mark: [620], correct: [523.25, 783.99], wrong: [220, 164.81], win: [523.25, 659.25, 783.99, 1046.5], lost: [329.63, 261.63, 196], clear: [440, 587.33] };
    const notes = melodies[kind]; if (!notes) return;
    // A swipe can cross many cells in one frame; keep the feedback gentle.
    if (kind === 'mark') {
      if (this.context.currentTime - this.lastTick < 0.055) return;
      this.lastTick = this.context.currentTime;
    }
    notes.forEach((frequency, i) => this.note(frequency, kind === 'mark' ? 0.06 : 0.23, this.fx, i * 0.105, 'sine', kind === 'mark' ? 0.45 : 0.8));
  }
  syncMusic() {
    const shouldPlay = this.music && this.visible && this.context?.state === 'running';
    if (!shouldPlay) { clearInterval(this.loop); this.loop = null; return; }
    if (this.loop !== null) return;
    const melody = [523.25, 659.25, 783.99, 659.25, 587.33, 659.25, 783.99, 0, 659.25, 523.25, 440, 523.25, 587.33, 440, 392, 0];
    const bass = [130.81, 146.83, 110, 98];
    const beat = () => {
      if (this.context.state !== 'running') return;
      const note = melody[this.step % melody.length];
      if (note) this.note(note, 0.65, this.bgm, 0, 'sine', 0.45);
      if (this.step % 4 === 0) this.note(bass[Math.floor(this.step / 4) % bass.length], 1.7, this.bgm, 0, 'sine', 0.4);
      this.step++;
    };
    beat(); this.loop = setInterval(beat, 450);
  }
  dispose() { clearInterval(this.loop); this.loop = null; this.context?.close().catch(() => {}); }
}
