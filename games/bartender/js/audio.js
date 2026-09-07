/**
 * 治愈系调饮经营吧台 - 音效与背景音乐引擎 (Sound & BGM Engine)
 * 特色：
 * 1. 真实高保真音频素材（倒水、冰块、糖果小料、云朵奶盖、魔法星光、摆件放置、成功出杯、清空冲水）
 * 2. 悠闲清吧傍晚 BGM（木吉他独奏指弹 + 盛夏傍晚蝉鸣与微风自然白噪声）
 * 3. Web Audio API 动态合成 Fallback 双重保障
 */

class SoundEngine {
    constructor() {
        this.ctx = null;
        this.soundEnabled = true;
        this.bgmEnabled = true;
        this.bgmAudio = null;
        this.bgmVolume = 0.85;
        this.audioCache = {};
        this.userInteracted = false;

        // 音效素材列表
        this.sfxUrls = {
            pour: "assets/audio/pour.wav",
            ice: "assets/audio/ice.wav",
            jelly: "assets/audio/jelly.wav",
            cloud: "assets/audio/cloud.wav",
            magic: "assets/audio/magic.wav",
            place: "assets/audio/place.wav",
            success: "assets/audio/success.wav",
            dump: "assets/audio/dump.wav",
            coin: "assets/audio/coin.wav"
        };

        this.bgmUrl = "assets/audio/bgm_guitar_cicada.wav";

        // Web Audio 程序化治愈系背景音乐合成器状态 (0外部音频文件依赖)
        this.synthBgmState = {
            isPlaying: false,
            stepIndex: 0,
            timer: null,
            masterGain: null,
            ambientSource: null,
            ambientGain: null
        };

        this.preloadAudio();
        this.initBGM();
        this.setupUserInteractionListener();
    }

    init() {
        if (!this.ctx) {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            if (AudioContext) {
                this.ctx = new AudioContext();
            }
        }
    }

    // 针对 Safari / iOS WebKit 的专属音频通道解锁机制
    unlockAudioContext() {
        this.init();
        if (this.ctx) {
            if (this.ctx.state === "suspended") {
                this.ctx.resume().catch(() => {});
            }
            // 播放一个样本的微弱静音缓冲区，彻底激活 Safari 硬件音频总线
            if (!this._unlockedBuffer) {
                try {
                    const buffer = this.ctx.createBuffer(1, 1, 22050);
                    const source = this.ctx.createBufferSource();
                    source.buffer = buffer;
                    source.connect(this.ctx.destination);
                    source.start(0);
                    this._unlockedBuffer = true;
                } catch (e) {}
            }
        }
    }

    ensureContext() {
        this.unlockAudioContext();
    }

    // 预加载音效池
    preloadAudio() {
        Object.entries(this.sfxUrls).forEach(([key, url]) => {
            const audio = new Audio(url);
            audio.preload = "auto";
            audio.volume = 0.7;
            audio.setAttribute("playsinline", "true");
            audio.setAttribute("webkit-playsinline", "true");
            this.audioCache[key] = audio;
        });
    }

    // 初始化背景音乐
    initBGM() {
        try {
            this.bgmAudio = new Audio(this.bgmUrl);
            this.bgmAudio.loop = true;
            this.bgmAudio.volume = this.bgmVolume;
            this.bgmAudio.preload = "auto";
            this.bgmAudio.setAttribute("playsinline", "true");
            this.bgmAudio.setAttribute("webkit-playsinline", "true");
        } catch (e) {
            console.warn("BGM Audio 初始化失败", e);
        }
    }

    // 监听用户交互以唤醒 Safari 音频上下文并播放 BGM (支持持续尝试，直至真正播放成功)
    setupUserInteractionListener() {
        const events = ["pointerdown", "touchstart", "touchend", "click", "keydown"];
        const tryUnlockAndPlay = () => {
            this.unlockAudioContext();
            if (this.bgmEnabled) {
                this.playBGM();
            }
            // 只要 BGM 已经成功处于非暂停状态（真实音频或合成器），即可安全解绑事件监听器
            if ((this.bgmAudio && !this.bgmAudio.paused) || (this.synthBgmState && this.synthBgmState.isPlaying)) {
                events.forEach(ev => {
                    document.removeEventListener(ev, tryUnlockAndPlay, true);
                    window.removeEventListener(ev, tryUnlockAndPlay, true);
                });
            }
        };

        // 使用捕获阶段 (capture: true)，确保在任何元素阻止冒泡前优先截获手势
        events.forEach(ev => {
            document.addEventListener(ev, tryUnlockAndPlay, { capture: true, passive: true });
            window.addEventListener(ev, tryUnlockAndPlay, { capture: true, passive: true });
        });
    }

    // 播放指定音效 (优先真实音频，失败自动回退 Web Audio 合成)
    playSFX(name, fallbackFn) {
        if (!this.soundEnabled) return;
        this.ensureContext();

        const cached = this.audioCache[name];
        if (cached) {
            try {
                // 克隆节点避免连点被截断
                const clone = cached.cloneNode();
                clone.volume = cached.volume;
                clone.play().catch(() => {
                    if (fallbackFn) fallbackFn.call(this);
                });
                return;
            } catch (e) {
                if (fallbackFn) fallbackFn.call(this);
            }
        } else if (fallbackFn) {
            fallbackFn.call(this);
        }
    }

    // 1. 倒水声 (Pour)
    playPour(duration = 0.6) {
        this.playSFX("pour", () => {
            this.synthPour(duration);
        });
    }

    // 2. 冰块碰撞声 (Ice)
    playIceDrop() {
        this.playSFX("ice", () => {
            this.synthIce();
        });
    }

    // 3. 糖果/软料落水 (Jelly/Item)
    playSoftDrop() {
        this.playSFX("jelly", () => {
            this.synthSoftDrop();
        });
    }

    // 4. 云朵/奶盖挤压 (Cloud/Foam)
    playFoam() {
        this.playSFX("cloud", () => {
            this.synthFoam();
        });
    }

    // 5. 魔法星光 (Magic)
    playSparkle() {
        this.playSFX("magic", () => {
            this.synthSparkle();
        });
    }

    // 6. 摆件放置 (Place)
    playTopperPlace() {
        this.playSFX("place", () => {
            this.synthPlace();
        });
    }

    // 7. 成功出杯 (Success)
    playSuccess() {
        this.playSFX("success", () => {
            this.synthSuccess();
        });
    }

    // 8. 倒掉冲水 (Dump)
    playDump() {
        this.playSFX("dump", () => {
            this.synthDump();
        });
    }

    // 金币入袋叮当声 (Coin)
    playCoin() {
        this.playSFX("coin", () => {
            if (!this.soundEnabled) return;
            this.ensureContext();
            if (!this.ctx) return;
            const now = this.ctx.currentTime;
            [1760.0, 2349.32, 2793.83, 3520.0].forEach((freq, idx) => {
                const osc = this.ctx.createOscillator();
                const gain = this.ctx.createGain();
                osc.type = "sine";
                osc.frequency.setValueAtTime(freq, now + idx * 0.04);
                gain.gain.setValueAtTime(0.15, now + idx * 0.04);
                gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.04 + 0.25);
                osc.connect(gain);
                gain.connect(this.ctx.destination);
                osc.start(now + idx * 0.04);
                osc.stop(now + idx * 0.04 + 0.25);
            });
        });
    }

    // 9. 气泡微音 (Bubble)
    playBubble() {
        if (!this.soundEnabled) return;
        this.ensureContext();
        if (!this.ctx) return;
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        const startFreq = 320 + Math.random() * 200;
        osc.type = "sine";
        osc.frequency.setValueAtTime(startFreq, now);
        osc.frequency.exponentialRampToValueAtTime(startFreq + 300, now + 0.08);

        gain.gain.setValueAtTime(0.12, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now);
        osc.stop(now + 0.08);
    }

    // 🎵 BGM 控制 (真实音频 + Web Audio 程序化合成双轨保障)
    playBGM() {
        if (!this.bgmEnabled) return;
        this.unlockAudioContext();
        if (!this.ctx) return;

        let hasAttemptedRealAudio = false;
        if (!this.bgmAudio) {
            this.initBGM();
        }
        if (this.bgmAudio) {
            try {
                const playPromise = this.bgmAudio.play();
                if (playPromise !== undefined) {
                    hasAttemptedRealAudio = true;
                    playPromise.then(() => {
                        this.userInteracted = true;
                    }).catch(e => {
                        // 真实音频播放失败（404 或无权限），立即启用 Web Audio 浏览器原生合成背景音乐
                        this.startSynthBGM();
                    });
                }
            } catch (e) {
                this.startSynthBGM();
            }
        }
        if (!hasAttemptedRealAudio) {
            this.startSynthBGM();
        }
    }

    pauseBGM() {
        if (this.bgmAudio) {
            try { this.bgmAudio.pause(); } catch(e) {}
        }
        this.stopSynthBGM();
    }

    toggleBGM() {
        this.bgmEnabled = !this.bgmEnabled;
        if (this.bgmEnabled) {
            this.playBGM();
        } else {
            this.pauseBGM();
        }
        return this.bgmEnabled;
    }

    setBgmVolume(val) {
        this.bgmVolume = Math.max(0, Math.min(1, val));
        if (this.bgmAudio) {
            try { this.bgmAudio.volume = this.bgmVolume; } catch(e) {}
        }
        if (this.synthBgmState && this.synthBgmState.masterGain && this.ctx) {
            const now = this.ctx.currentTime;
            this.synthBgmState.masterGain.gain.setValueAtTime(this.bgmVolume * 0.85, now);
        }
    }

    // ==========================================
    // 🎵 Web Audio 治愈系背景音乐合成器 (Procedural Ambient BGM)
    // 纯代码算法合成：吉他/电钢清脆琶音 + 温暖低音提琴 + 盛夏傍晚自然微风
    // ==========================================

    startSynthBGM() {
        if (!this.bgmEnabled) return;
        if (this.synthBgmState.isPlaying) return;
        this.ensureContext();
        if (!this.ctx) return;

        this.synthBgmState.isPlaying = true;
        this.userInteracted = true;

        // 1. 创建主音量控制节点 (增益充足饱满)
        if (!this.synthBgmState.masterGain) {
            this.synthBgmState.masterGain = this.ctx.createGain();
            this.synthBgmState.masterGain.connect(this.ctx.destination);
        }
        const now = this.ctx.currentTime;
        this.synthBgmState.masterGain.gain.cancelScheduledValues(now);
        this.synthBgmState.masterGain.gain.setValueAtTime(0.001, now);
        this.synthBgmState.masterGain.gain.exponentialRampToValueAtTime(this.bgmVolume * 0.85, now + 1.2);

        // 2. 启动环境微风氛围
        this.startAmbientBreeze();

        // 3. 调度治愈琶音与和弦
        // 4 和弦循环结构 (Cmaj9 -> Am9 -> Fmaj7 -> Gsus4)
        const chords = [
            // Cmaj9: 根音 C2 (65.41Hz), 琶音音符 [G3, B3, D4, E4]
            { bass: 65.41, arps: [196.00, 246.94, 293.66, 329.63], lead: 392.00 },
            // Am9: 根音 A1 (55.00Hz), 琶音音符 [E3, A3, C4, E4]
            { bass: 55.00, arps: [164.81, 220.00, 261.63, 329.63], lead: 392.00 },
            // Fmaj7: 根音 F2 (87.31Hz), 琶音音符 [C3, F3, A3, C4]
            { bass: 87.31, arps: [130.81, 174.61, 220.00, 261.63], lead: 329.63 },
            // Gsus4 / G7: 根音 G2 (98.00Hz), 琶音音符 [D3, G3, B3, D4]
            { bass: 98.00, arps: [146.83, 196.00, 246.94, 293.66], lead: 349.23 }
        ];

        const beatDuration = 0.82; // 每拍时长 (秒)
        let nextNoteTime = this.ctx.currentTime + 0.1;
        let step = 0;

        const schedule = () => {
            if (!this.synthBgmState.isPlaying || !this.ctx) return;
            const currentTime = this.ctx.currentTime;

            // 前瞻调度：预先计算未来 1.5 秒内的音符
            while (nextNoteTime < currentTime + 1.5) {
                const barIndex = Math.floor(step / 4) % chords.length;
                const beatIndex = step % 4;
                const chord = chords[barIndex];

                // 拍 0: 弹奏低音提琴 + 琶音第 1 个音
                if (beatIndex === 0) {
                    this.playSynthBass(chord.bass, nextNoteTime, beatDuration * 3.2, 0.45);
                    this.playSynthPluck(chord.arps[0], nextNoteTime, beatDuration * 1.5, 0.52);
                } else if (beatIndex === 1) {
                    this.playSynthPluck(chord.arps[1], nextNoteTime, beatDuration * 1.2, 0.45);
                } else if (beatIndex === 2) {
                    this.playSynthPluck(chord.arps[2], nextNoteTime, beatDuration * 1.5, 0.48);
                    // 次低音补充
                    this.playSynthBass(chord.bass * 1.5, nextNoteTime, beatDuration * 1.8, 0.28);
                } else if (beatIndex === 3) {
                    this.playSynthPluck(chord.arps[3], nextNoteTime, beatDuration * 1.0, 0.42);
                    // 偶尔在第 3 拍末尾点缀治愈高音主音
                    if (barIndex % 2 === 1 && chord.lead) {
                        this.playSynthPluck(chord.lead, nextNoteTime + beatDuration * 0.45, beatDuration * 1.2, 0.32);
                    }
                }

                nextNoteTime += beatDuration;
                step++;
            }

            this.synthBgmState.timer = setTimeout(schedule, 300);
        };

        schedule();
    }

    stopSynthBGM() {
        if (!this.synthBgmState.isPlaying) return;
        this.synthBgmState.isPlaying = false;
        if (this.synthBgmState.timer) {
            clearTimeout(this.synthBgmState.timer);
            this.synthBgmState.timer = null;
        }
        if (this.synthBgmState.masterGain && this.ctx) {
            const now = this.ctx.currentTime;
            this.synthBgmState.masterGain.gain.cancelScheduledValues(now);
            this.synthBgmState.masterGain.gain.setValueAtTime(this.synthBgmState.masterGain.gain.value, now);
            this.synthBgmState.masterGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.35);
        }
        this.stopAmbientBreeze();
    }

    // 弹奏柔和温暖的吉他/电钢琶音单音 (Pluck Note)
    playSynthPluck(freq, startTime, duration, velocity) {
        if (!duration) duration = 1.2;
        if (!velocity) velocity = 0.25;
        if (!this.ctx || !this.synthBgmState.masterGain) return;
        try {
            // 主振荡器：正弦波 (纯净基频)
            const osc1 = this.ctx.createOscillator();
            osc1.type = "sine";
            osc1.frequency.setValueAtTime(freq, startTime);

            // 辅振荡器：三角波 (温和木质谐波)
            const osc2 = this.ctx.createOscillator();
            osc2.type = "triangle";
            osc2.frequency.setValueAtTime(freq, startTime);
            osc2.detune.setValueAtTime(4, startTime); // +4 cents 轻微失谐

            // 低通滤波器：柔化高频，打造清吧傍晚氛围
            const filter = this.ctx.createBiquadFilter();
            filter.type = "lowpass";
            filter.frequency.setValueAtTime(1600, startTime);
            filter.frequency.exponentialRampToValueAtTime(800, startTime + duration);

            // 音量包络 (ADSR)
            const noteGain = this.ctx.createGain();
            noteGain.gain.setValueAtTime(0.0001, startTime);
            noteGain.gain.exponentialRampToValueAtTime(velocity, startTime + 0.015);
            noteGain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

            osc1.connect(filter);
            osc2.connect(filter);
            filter.connect(noteGain);
            noteGain.connect(this.synthBgmState.masterGain);

            osc1.start(startTime);
            osc2.start(startTime);
            osc1.stop(startTime + duration + 0.05);
            osc2.stop(startTime + duration + 0.05);
        } catch (e) {}
    }

    // 弹奏低沉醇厚的贝斯/低音提琴 (Upright Bass)
    playSynthBass(freq, startTime, duration, velocity) {
        if (!duration) duration = 2.4;
        if (!velocity) velocity = 0.28;
        if (!this.ctx || !this.synthBgmState.masterGain) return;
        try {
            const osc = this.ctx.createOscillator();
            osc.type = "sine";
            osc.frequency.setValueAtTime(freq, startTime);

            const filter = this.ctx.createBiquadFilter();
            filter.type = "lowpass";
            filter.frequency.setValueAtTime(260, startTime);

            const gain = this.ctx.createGain();
            gain.gain.setValueAtTime(0.0001, startTime);
            gain.gain.exponentialRampToValueAtTime(velocity, startTime + 0.03);
            gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

            osc.connect(filter);
            filter.connect(gain);
            gain.connect(this.synthBgmState.masterGain);

            osc.start(startTime);
            osc.stop(startTime + duration + 0.05);
        } catch (e) {}
    }

    // 盛夏傍晚自然微风环境白噪声 (Gentle Wind Breeze)
    startAmbientBreeze() {
        if (!this.ctx || !this.synthBgmState.masterGain) return;
        try {
            if (this.synthBgmState.ambientSource) return;
            const bufferSize = this.ctx.sampleRate * 2;
            const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
            const output = noiseBuffer.getChannelData(0);
            for (let i = 0; i < bufferSize; i++) {
                output[i] = Math.random() * 2 - 1;
            }

            const whiteNoise = this.ctx.createBufferSource();
            whiteNoise.buffer = noiseBuffer;
            whiteNoise.loop = true;

            const bandpass = this.ctx.createBiquadFilter();
            bandpass.type = "bandpass";
            bandpass.frequency.setValueAtTime(420, this.ctx.currentTime);
            bandpass.Q.setValueAtTime(1.2, this.ctx.currentTime);

            const breezeGain = this.ctx.createGain();
            const now = this.ctx.currentTime;
            breezeGain.gain.setValueAtTime(0.0001, now);
            breezeGain.gain.exponentialRampToValueAtTime(0.055, now + 2.0);

            whiteNoise.connect(bandpass);
            bandpass.connect(breezeGain);
            breezeGain.connect(this.synthBgmState.masterGain);

            whiteNoise.start(now);
            this.synthBgmState.ambientSource = whiteNoise;
            this.synthBgmState.ambientGain = breezeGain;
        } catch (e) {}
    }

    stopAmbientBreeze() {
        try {
            if (this.synthBgmState.ambientSource) {
                this.synthBgmState.ambientSource.stop();
                this.synthBgmState.ambientSource.disconnect();
                this.synthBgmState.ambientSource = null;
            }
            if (this.synthBgmState.ambientGain) {
                this.synthBgmState.ambientGain.disconnect();
                this.synthBgmState.ambientGain = null;
            }
        } catch (e) {}
    }

    // ==========================================
    // Web Audio 合成器 (完全自给自足的物理 Fallback)
    // ==========================================

    // 1. 液体倒水声 (Pour) - 12 连续水流微气泡 + 温润流水带通滤波共振，饱满丰盈
    synthPour(duration = 0.8) {
        if (!this.ctx) return;
        const now = this.ctx.currentTime;
        const offsets = [0.02, 0.08, 0.15, 0.22, 0.30, 0.38, 0.46, 0.54, 0.62, 0.70, 0.76, 0.82];
        const freqs = [320, 420, 360, 480, 400, 520, 380, 460, 340, 500, 430, 390];
        offsets.forEach((off, idx) => {
            if (off > duration) return;
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            const f = freqs[idx];

            osc.type = "sine";
            osc.frequency.setValueAtTime(f, now + off);
            osc.frequency.exponentialRampToValueAtTime(f + 180, now + off + 0.12);

            gain.gain.setValueAtTime(0.36, now + off);
            gain.gain.exponentialRampToValueAtTime(0.001, now + off + 0.12);

            osc.connect(gain);
            gain.connect(this.ctx.destination);

            osc.start(now + off);
            osc.stop(now + off + 0.12);
        });

        // 温润流水共振底噪 (带通滤波水流噪声，增强注水咕噜质感)
        try {
            const bufferSize = Math.floor(this.ctx.sampleRate * Math.min(duration, 0.85));
            const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
            const output = noiseBuffer.getChannelData(0);
            for (let i = 0; i < bufferSize; i++) {
                output[i] = (Math.random() * 2 - 1) * 0.22;
            }
            const noiseSource = this.ctx.createBufferSource();
            noiseSource.buffer = noiseBuffer;

            const bandpass = this.ctx.createBiquadFilter();
            bandpass.type = "bandpass";
            bandpass.frequency.setValueAtTime(520, now);
            bandpass.Q.setValueAtTime(1.8, now);

            const streamGain = this.ctx.createGain();
            streamGain.gain.setValueAtTime(0.18, now);
            streamGain.gain.linearRampToValueAtTime(0.28, now + 0.1);
            streamGain.gain.exponentialRampToValueAtTime(0.001, now + duration);

            noiseSource.connect(bandpass);
            bandpass.connect(streamGain);
            streamGain.connect(this.ctx.destination);

            noiseSource.start(now);
            noiseSource.stop(now + duration);
        } catch (e) {}
    }

    // 2. 冰块碰撞声 (Ice) - 清脆温润落冰声 (降频温润化，消除高频刺耳蜂鸣，音量克制)
    synthIce() {
        if (!this.ctx) return;
        const now = this.ctx.currentTime;
        [1250, 1680, 2150].forEach((freq, idx) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = "sine";
            osc.frequency.setValueAtTime(freq, now + idx * 0.018);
            osc.frequency.exponentialRampToValueAtTime(freq * 0.65, now + idx * 0.018 + 0.08);

            gain.gain.setValueAtTime(0.075 / (idx + 1), now + idx * 0.018);
            gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.018 + 0.08);

            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start(now + idx * 0.018);
            osc.stop(now + idx * 0.018 + 0.08);
        });
    }

    synthSoftDrop() {
        if (!this.ctx) return;
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(480, now);
        osc.frequency.exponentialRampToValueAtTime(160, now + 0.15);

        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.15);
    }

    synthFoam() {
        if (!this.ctx) return;
        const now = this.ctx.currentTime;
        const bufferSize = Math.floor(this.ctx.sampleRate * 0.25);
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = (Math.random() * 2 - 1) * 0.15;
        }
        const noise = this.ctx.createBufferSource();
        noise.buffer = buffer;
        const filter = this.ctx.createBiquadFilter();
        filter.type = "lowpass";
        filter.frequency.setValueAtTime(600, now);
        filter.frequency.linearRampToValueAtTime(220, now + 0.25);

        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(0.18, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

        noise.connect(filter);
        filter.connect(gain);
        gain.connect(this.ctx.destination);
        noise.start(now);
        noise.stop(now + 0.25);
    }

    synthSparkle() {
        if (!this.ctx) return;
        const now = this.ctx.currentTime;
        [1046.5, 1318.5, 1567.98, 2093.0, 2637.0].forEach((freq, idx) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = "sine";
            osc.frequency.setValueAtTime(freq, now + idx * 0.04);

            gain.gain.setValueAtTime(0.1, now + idx * 0.04);
            gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.04 + 0.22);

            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start(now + idx * 0.04);
            osc.stop(now + idx * 0.04 + 0.22);
        });
    }

    synthPlace() {
        if (!this.ctx) return;
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(659.25, now);
        osc.frequency.exponentialRampToValueAtTime(987.77, now + 0.08);

        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.14);
    }

    // 7. 成功出杯 (Success) - 纯正弦波治愈系微风风铃琶音 (音量轻盈舒适，克制温和不刺耳)
    synthSuccess() {
        if (!this.ctx) return;
        const now = this.ctx.currentTime;
        [523.25, 659.25, 783.99, 1046.5, 1318.5].forEach((freq, idx) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = "sine";
            osc.frequency.setValueAtTime(freq, now + idx * 0.07);

            gain.gain.setValueAtTime(0.055, now + idx * 0.07);
            gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.07 + 0.45);

            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start(now + idx * 0.07);
            osc.stop(now + idx * 0.07 + 0.45);
        });
    }

    synthDump() {
        if (!this.ctx) return;
        const now = this.ctx.currentTime;
        const bufferSize = Math.floor(this.ctx.sampleRate * 0.4);
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = (Math.random() * 2 - 1) * 0.35;
        }
        const noise = this.ctx.createBufferSource();
        noise.buffer = buffer;
        const filter = this.ctx.createBiquadFilter();
        filter.type = "lowpass";
        filter.frequency.setValueAtTime(1100, now);
        filter.frequency.exponentialRampToValueAtTime(180, now + 0.4);

        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(0.25, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);

        noise.connect(filter);
        filter.connect(gain);
        gain.connect(this.ctx.destination);
        noise.start(now);
        noise.stop(now + 0.4);
    }
}

window.soundEngine = new SoundEngine();
