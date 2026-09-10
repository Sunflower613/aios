/**
 * audio.js - 「荷塘月色」纯程序化 Web Audio 音效与禅意音乐引擎
 * 无需任何外部音频资源，通过振荡器、噪声发生器与多级滤波器纯代码合成水声与五音泛音。
 */

export class LotusAudio {
  constructor() {
    this.ctx = null;
    this.isMuted = false;
    this.isAudioStarted = false;
    this.masterGain = null;

    // 中国传统五声音阶频率 (宫、商、角、徵、羽，跨越第 4 与第 5 八度)
    // C4, D4, E4, G4, A4, C5, D5, E5, G5, A5
    this.pentatonicScale = [
      261.63, 293.66, 329.63, 392.00, 440.00,
      523.25, 587.33, 659.25, 783.99, 880.00
    ];
  }

  /**
   * 初始化并解锁 AudioContext（需用户交互触发）
   */
  init() {
    if (this.ctx) return;
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioCtx();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : 0.6, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);
      this.isAudioStarted = true;
    } catch (e) {
      console.warn("Web Audio API 不可用或被禁用", e);
    }
  }

  /**
   * 唤醒 AudioContext
   */
  resume() {
    if (!this.ctx) {
      this.init();
    } else if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  /**
   * 切换静音状态
   */
  toggleMute() {
    this.isMuted = !this.isMuted;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setTargetAtTime(this.isMuted ? 0 : 0.6, this.ctx.currentTime, 0.05);
    }
    return this.isMuted;
  }

  /**
   * 播放点击水面涟漪清脆水滴声 (Droplet Plop)
   * @param {number} intensity - 强度 0 ~ 1
   */
  playWaterDrop(intensity = 1) {
    if (this.isMuted || !this.ctx) return;
    this.resume();

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    // 水滴声典型特征：正弦波快速向上跃升后瞬时衰减
    const baseFreq = 300 + Math.random() * 260 + intensity * 150;
    const targetFreq = baseFreq * (1.6 + Math.random() * 0.4);
    const duration = 0.12 + Math.random() * 0.06;

    osc.type = 'sine';
    osc.frequency.setValueAtTime(baseFreq, now);
    osc.frequency.exponentialRampToValueAtTime(targetFreq, now + duration * 0.4);

    gain.gain.setValueAtTime(0.001, now);
    gain.gain.exponentialRampToValueAtTime(0.35 * intensity, now + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(now);
    osc.stop(now + duration + 0.01);

    // 随机微弱伴随五音泛音
    if (Math.random() > 0.4) {
      this.playPentatonicNote(intensity * 0.6);
    }
  }

  /**
   * 荷叶碰撞沉闷水阻木质音与微澜声 (Leaf Impact Bump)
   * @param {number} force - 碰撞相对冲量 (0 ~ 1)
   */
  playLeafCollision(force = 0.5) {
    if (this.isMuted || !this.ctx) return;
    this.resume();

    const clampedForce = Math.min(Math.max(force, 0.1), 1.0);
    const now = this.ctx.currentTime;

    // 1. 低频沉闷振动分量（水体排开与叶肉弹性）
    const osc = this.ctx.createOscillator();
    const oscGain = this.ctx.createGain();
    const lowFreq = 85 + Math.random() * 35;

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(lowFreq, now);
    osc.frequency.exponentialRampToValueAtTime(40, now + 0.22);

    oscGain.gain.setValueAtTime(0.4 * clampedForce, now);
    oscGain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

    osc.connect(oscGain);
    oscGain.connect(this.masterGain);
    osc.start(now);
    osc.stop(now + 0.26);

    // 2. 柔和水花拍击噪音（带通滤波）
    this.playWaterSplashNoise(now, clampedForce);

    // 3. 产生清雅的古典五音共鸣
    this.playPentatonicNote(clampedForce);
  }

  /**
   * 柔和水花拍击噪声分量
   */
  playWaterSplashNoise(startTime, force) {
    const bufferSize = this.ctx.sampleRate * 0.18;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.25));
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(800, startTime);
    filter.Q.setValueAtTime(1.2, startTime);

    const noiseGain = this.ctx.createGain();
    noiseGain.gain.setValueAtTime(0.25 * force, startTime);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.18);

    noise.connect(filter);
    filter.connect(noiseGain);
    noiseGain.connect(this.masterGain);

    noise.start(startTime);
    noise.stop(startTime + 0.19);
  }

  /**
   * 小鱼受惊摆尾逃窜时的轻微水声 (Fish Swish)
   */
  playFishEscape() {
    if (this.isMuted || !this.ctx) return;
    this.resume();

    const now = this.ctx.currentTime;
    const bufferSize = Math.floor(this.ctx.sampleRate * 0.15);
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.sin((i / bufferSize) * Math.PI);
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(600, now);
    filter.frequency.linearRampToValueAtTime(250, now + 0.14);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    noise.start(now);
    noise.stop(now + 0.15);
  }

  /**
   * 触发古典空灵五音阶纯音泛音 (Pentatonic Chime)
   * @param {number} volume - 音量
   */
  playPentatonicNote(volume = 1) {
    if (this.isMuted || !this.ctx) return;

    const noteFreq = this.pentatonicScale[Math.floor(Math.random() * this.pentatonicScale.length)];
    const now = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(noteFreq, now);

    // 模拟空灵编钟/古琴泛音长余韵
    const duration = 1.2 + Math.random() * 0.8;
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.linearRampToValueAtTime(0.18 * volume, now + 0.04);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(now);
    osc.stop(now + duration + 0.05);
  }
}
