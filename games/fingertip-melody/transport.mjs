/** One continuous audio element: browser time stretching preserves pitch and prevents stacked voices. */
export class Transport {
  constructor(audio = new Audio(), timers = globalThis) {
    this.audio = audio; this.timers = timers; this.until = Infinity; this.rate = 1; this.timer = null; this.epoch = 0;
    audio.preload = 'auto'; audio.preservesPitch = true; audio.mozPreservesPitch = true; audio.webkitPreservesPitch = true;
  }
  get time() { return Math.min(this.until, this.audio.currentTime); }
  get playing() { return !this.audio.paused && this.time < this.until; }
  get duration() { return this.audio.duration || 0; }
  set volume(value) { this.audio.volume = value; }
  async load(data) {
    this.pause(); if (this.url) URL.revokeObjectURL(this.url);
    this.url = URL.createObjectURL(new Blob([data], { type: 'audio/mpeg' }));
    await new Promise((resolve, reject) => {
      const timer = setTimeout(() => done(new Error('音频加载超时')), 15000);
      const ready = () => done(); const error = () => done(new Error('音频无法解码'));
      const done = err => { clearTimeout(timer); this.audio.removeEventListener('loadedmetadata', ready); this.audio.removeEventListener('error', error); err ? reject(err) : resolve(); };
      this.audio.addEventListener('loadedmetadata', ready); this.audio.addEventListener('error', error);
      this.audio.src = this.url; this.audio.load();
    });
  }
  async unlock() {
    const time = this.audio.currentTime;
    this.audio.muted = true;
    try { await this.audio.play(); } finally { this.audio.pause(); this.audio.currentTime = time; this.audio.muted = false; }
  }
  seek(time) { this.pause(); this.until = Infinity; this.audio.currentTime = Math.max(0, Math.min(this.duration, time)); }
  play(until = this.duration, rate = 1) {
    this.until = Math.min(this.duration, until); this.rate = rate;
    this.audio.preservesPitch = true; this.audio.playbackRate = rate;
    this.timers.clearTimeout(this.timer);
    const epoch = ++this.epoch;
    if (this.time >= this.until) { this.audio.pause(); return; }
    // Changing speed/gate never restarts or seeks the active audio stream.
    this.audio.play().then(() => { if (epoch === this.epoch) this.checkGate(); }).catch(error => {
      if (epoch === this.epoch) { this.pause(); this.onError?.(error); }
    });
  }
  checkGate() {
    this.timers.clearTimeout(this.timer);
    if (this.audio.paused) return;
    if (this.audio.currentTime >= this.until) {
      this.audio.pause(); this.audio.currentTime = this.until;
      return;
    }
    const remaining = (this.until - this.audio.currentTime) / this.rate * 1000;
    this.timer = this.timers.setTimeout(() => this.checkGate(), Math.max(4, Math.min(25, remaining)));
  }
  pause() { this.epoch++; this.timers.clearTimeout(this.timer); this.audio.pause(); }
  dispose() { this.pause(); this.audio.removeAttribute('src'); this.audio.load(); this.audio.remove(); if (this.url) URL.revokeObjectURL(this.url); }
}
