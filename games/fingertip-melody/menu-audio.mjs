/** Small original pentatonic instrumental, synthesized locally; no remote music or samples. */
export class MenuAudio {
  constructor() { this.enabled = false; this.nodes = new Set(); this.step = 0; this.timer = null; this.level = .7; }
  set volume(value) { this.level = value; if (this.master) this.master.gain.value = value; }
  async activate() {
    this.context ||= new AudioContext();
    if (!this.master) { this.master = this.context.createGain(); this.master.gain.value = this.level; this.master.connect(this.context.destination); }
    await this.context.resume();
  }
  tone(midi, time, duration, level = .035, type = 'triangle') {
    const osc = this.context.createOscillator(), gain = this.context.createGain();
    osc.type = type; osc.frequency.value = 440 * 2 ** ((midi - 69) / 12);
    gain.gain.setValueAtTime(0, time); gain.gain.linearRampToValueAtTime(level, time + .012);
    gain.gain.exponentialRampToValueAtTime(.0001, time + duration);
    osc.connect(gain); gain.connect(this.master); this.nodes.add(osc);
    osc.onended = () => { this.nodes.delete(osc); osc.disconnect(); gain.disconnect(); };
    osc.start(time); osc.stop(time + duration + .02);
  }
  async start() {
    this.enabled = true; await this.activate();
    if (!this.enabled || this.timer) return;
    this.next = this.context.currentTime + .03;
    const schedule = () => {
      if (!this.enabled) return;
      const melody = [72,76,79,76,74,76,81,79,76,79,84,81,79,76,74,67];
      const bass = [48,53,57,55];
      while (this.next < this.context.currentTime + .16) {
        this.tone(melody[this.step % 16], this.next, .48);
        if (this.step % 4 === 0) this.tone(bass[Math.floor(this.step / 4) % 4], this.next, 1.1, .045, 'sine');
        this.next += .375; this.step++;
      }
      this.timer = setTimeout(schedule, 80);
    };
    schedule();
  }
  stop() {
    this.enabled = false; clearTimeout(this.timer); this.timer = null;
    for (const osc of this.nodes) { try { osc.stop(); } catch { /* Already ended. */ } }
    this.nodes.clear();
  }
  async click() { await this.activate(); this.tone(84, this.context.currentTime, .07, .025, 'sine'); }
}
