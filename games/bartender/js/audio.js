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
        this.bgmVolume = 0.45;
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
            // 只要 BGM 已经成功处于非暂停状态，即可安全解绑事件监听器
            if (this.bgmAudio && !this.bgmAudio.paused) {
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

    // 🎵 BGM 控制 (针对 Safari / WebKit 增强)
    playBGM() {
        if (!this.bgmEnabled) return;
        this.unlockAudioContext();
        if (!this.bgmAudio) {
            this.initBGM();
        }
        if (this.bgmAudio) {
            const playPromise = this.bgmAudio.play();
            if (playPromise !== undefined) {
                playPromise.then(() => {
                    this.userInteracted = true;
                }).catch(e => {
                    console.log("Safari 等待手势交互或解除系统静音模式后播放背景音乐:", e.message);
                });
            }
        }
    }

    pauseBGM() {
        if (this.bgmAudio) {
            this.bgmAudio.pause();
        }
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

    // ==========================================
    // Web Audio 合成器 (完全自给自足的物理 Fallback)
    // ==========================================
    synthPour(duration = 0.8) {
        if (!this.ctx) return;
        const offsets = [0.03, 0.15, 0.28, 0.42, 0.56, 0.70];
        const freqs = [260, 320, 290, 370, 340, 420];
        const now = this.ctx.currentTime;

        offsets.forEach((off, idx) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            const f = freqs[idx];

            osc.type = "sine";
            osc.frequency.setValueAtTime(f, now + off);
            osc.frequency.exponentialRampToValueAtTime(f + 160, now + off + 0.1);

            gain.gain.setValueAtTime(0.18, now + off);
            gain.gain.exponentialRampToValueAtTime(0.001, now + off + 0.1);

            osc.connect(gain);
            gain.connect(this.ctx.destination);

            osc.start(now + off);
            osc.stop(now + off + 0.1);
        });
    }

    synthIce() {
        if (!this.ctx) return;
        const now = this.ctx.currentTime;
        [2200, 2900, 3800].forEach((freq, idx) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = "triangle";
            osc.frequency.setValueAtTime(freq, now + idx * 0.015);
            osc.frequency.exponentialRampToValueAtTime(freq * 0.55, now + idx * 0.015 + 0.12);

            gain.gain.setValueAtTime(0.15 / (idx + 1), now + idx * 0.015);
            gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.015 + 0.12);

            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start(now + idx * 0.015);
            osc.stop(now + idx * 0.015 + 0.12);
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

    synthSuccess() {
        if (!this.ctx) return;
        const now = this.ctx.currentTime;
        [523.25, 659.25, 783.99, 1046.5, 1318.5].forEach((freq, idx) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = "triangle";
            osc.frequency.setValueAtTime(freq, now + idx * 0.06);

            gain.gain.setValueAtTime(0.15, now + idx * 0.06);
            gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.06 + 0.5);

            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start(now + idx * 0.06);
            osc.stop(now + idx * 0.06 + 0.5);
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
