/**
 * 一起做裙子 (Let's Tailor!) - 解压触感、音效与公版古典BGM合成系统
 * 涵盖：卷尺/布料/剪刀/缝纫机音效 + 萨蒂《Gymnopédie No.1》古典钢琴纯算法伴奏引擎 + 公版古典曲目流
 */

class TailorAudio {
    constructor() {
        this.ctx = null;
        this.isMuted = false;
        this.vibrationEnabled = 'vibrate' in navigator;

        // 缝纫机
        this.sewingInterval = null;
        this.isSewingRunning = false;

        // BGM 音乐系统
        this.bgmPlaying = false;
        this.bgmVolume = 0.38;
        this.currentTrackIndex = 0;
        this.audioElement = null; // 本地/外部音频回放
        this.synthBgmTimer = null; // 纯算法萨蒂钢琴伴奏定时器
        this.activeScene = 'workshop'; // 'workshop' | 'runway' | 'auction'

        // 听觉编年史：15 首公版大师经典曲库 (本地高质音频)
        this.fullCatalog = [
            // 1. 乡间小风 (田园、自然织造、亚麻触感)
            {
                id: 'country_tchaikovsky_barcarolle',
                title: '柴可夫斯基 - 六月：船歌',
                composer: '柴可夫斯基',
                era: '乡间小风',
                eraKey: 'country',
                scene: ['workshop'],
                desc: '柔和舒缓的水波与微风感，适合初入工坊与棉麻织造',
                url: 'assets/audio/1_1_tchaikovsky_june_barcarolle.mp3'
            },
            {
                id: 'country_beethoven_pastoral',
                title: '贝多芬 - 田园交响曲第一乐章',
                composer: '贝多芬',
                era: '乡间小风',
                eraKey: 'country',
                scene: ['workshop'],
                desc: '极其纯粹明朗的自然生机，弦乐木管交织，工坊清晨挑选原色亚麻布',
                url: 'assets/audio/1_2_beethoven_pastoral_mvt1.ogg'
            },
            {
                id: 'country_tarrega_guitar',
                title: '阿尔罕布拉宫的回忆 (原声吉他)',
                composer: '塔雷加',
                era: '乡间小风',
                eraKey: 'country',
                scene: ['workshop'],
                desc: '草木清香与空气流动感，宫崎骏风格原声吉他轮指，新手引导放松背景',
                url: 'assets/audio/1_3_tarrega_recuerdos_guitar.ogg'
            },

            // 2. 古希腊 (垂坠、纯白基同、哲学与神性)
            {
                id: 'greek_seikilos_epitaph',
                title: '塞基洛斯的墓志铭 (纯器乐版)',
                composer: '古希腊佚名',
                era: '古希腊',
                eraKey: 'greek',
                scene: ['workshop', 'auction'],
                desc: '人类现存最早完整记谱音乐（纯器乐复原版，无任何歌词人声），神庙石柱神圣感',
                url: 'assets/audio/2_1_seikilos_epitaph.mp3'
            },
            {
                id: 'greek_debussy_syrinx',
                title: '德彪西 - 潘神笛 (独奏长笛)',
                composer: '德彪西',
                era: '古希腊',
                eraKey: 'greek',
                scene: ['workshop'],
                desc: '印象派长笛滑音空灵飘渺，贴合单块白布依附身体垂坠流动',
                url: 'assets/audio/2_2_debussy_syrinx.ogg'
            },
            {
                id: 'greek_satie_gymnopedie1',
                title: '萨蒂 - 裸体歌舞第一号',
                composer: '萨蒂',
                era: '古希腊',
                eraKey: 'greek',
                scene: ['workshop'],
                synthFallback: true,
                desc: '极简低音跳跃与空灵旋律，营造安静雕刻维纳斯神像般的立裁氛围',
                url: 'assets/audio/2_3_satie_gymnopedie1.mp3'
            },

            // 3. 洛可可 (蕾丝层叠、马卡龙色、宫廷华丽)
            {
                id: 'rococo_boccherini_minuet',
                title: '博凯里尼 - 小步舞曲',
                composer: '博凯里尼',
                era: '洛可可',
                eraKey: 'rococo',
                scene: ['auction', 'workshop'],
                desc: '欧洲宫廷代名词，弦乐拨弦顿音轻盈俏皮，像往裙摆缝制珍珠与缎带',
                url: 'assets/audio/3_1_boccherini_minuet.mp3'
            },
            {
                id: 'rococo_rameau_gavotte',
                title: '拉莫 - 加沃特变奏曲 (羽管键琴)',
                composer: '拉莫',
                era: '洛可可',
                eraKey: 'rococo',
                scene: ['auction', 'workshop'],
                desc: '羽管键琴独特金属拨弦质感，极具凡尔赛宫沙龙下午茶的甜美与贵气',
                url: 'assets/audio/3_2_rameau_gavotte_harpsichord.mp3'
            },
            {
                id: 'rococo_mozart_romance',
                title: '莫扎特 - 弦乐小夜曲：第二乐章浪漫曲',
                composer: '莫扎特',
                era: '洛可可',
                eraKey: 'rococo',
                scene: ['auction'],
                desc: '优雅温婉华美，贴合洛可可鱼骨撑与重磅织锦的贵族竞价氛围',
                url: 'assets/audio/3_3_mozart_nachtmusik_romance.ogg'
            },

            // 4. 50年代 Dior / New Look (优雅沙龙、收腰大伞裙、法式摩登)
            {
                id: 'dior_satie_je_te_veux',
                title: '萨蒂 - 我要你 (沙龙圆舞曲)',
                composer: '萨蒂',
                era: '50年代 Dior',
                eraKey: 'dior',
                scene: ['runway', 'workshop'],
                desc: '巴黎咖啡馆沙龙圆舞曲，花冠线条大伞裙款款转身',
                url: 'assets/audio/4_1_satie_je_te_veux.ogg'
            },
            {
                id: 'dior_gershwin_swanee',
                title: '格什温 - 天鹅 (战后爵士)',
                composer: '格什温',
                era: '50年代 Dior',
                eraKey: 'dior',
                scene: ['auction', 'runway'],
                desc: '战后巴黎蒙田大道复兴，大乐团摇摆爵士与名流狂欢',
                url: 'assets/audio/4_2_gershwin_swanee.ogg'
            },
            {
                id: 'dior_cool_jazz',
                title: '50年代沙龙爵士 - 慢步酷猫',
                composer: 'Kevin MacLeod',
                era: '50年代 Dior',
                eraKey: 'dior',
                scene: ['runway'],
                desc: '轻柔爵士鼓刷声、行进贝斯与慵懒钢琴，名模手持号码牌在沙龙走秀',
                url: 'assets/audio/4_3_cool_jazz_kool_kats.ogg'
            },

            // 5. 现代与先锋高定 (解构主义、几何线条、未来感走秀)
            {
                id: 'avant_vivaldi_spring',
                title: '维瓦尔第 - 四季：春 第一乐章',
                composer: '维瓦尔第',
                era: '先锋高定',
                eraKey: 'avantgarde',
                scene: ['runway'],
                desc: '现代古典与环境律动的融合，时装周秀场最标志性的大秀推进乐章',
                url: 'assets/audio/5_1_vivaldi_spring_allegro.ogg'
            },
            {
                id: 'avant_modern_chamber',
                title: '现代室内乐三人奏 (Experience)',
                composer: 'Kevin MacLeod',
                era: '先锋高定',
                eraKey: 'avantgarde',
                scene: ['runway'],
                desc: '层层递进的情绪张力，成衣完成、镁光灯亮起、模特走向T台高潮',
                url: 'assets/audio/5_2_modern_chamber_trio.mp3'
            },
            {
                id: 'avant_minimalist_glassworks',
                title: '极简主义钢琴 (Glassworks)',
                composer: 'Kevin MacLeod',
                era: '先锋高定',
                eraKey: 'avantgarde',
                scene: ['runway'],
                desc: '绵延不绝的机械式交替琶音，极具现代建筑感设计的秩序感与工业美感',
                url: 'assets/audio/5_3_minimalist_waterford.ogg'
            }
        ];

        // 当前激活播放列表（默认工坊推荐）
        this.playlist = this.fullCatalog.filter(t => t.scene.includes('workshop'));
    }

    initContext() {
        if (!this.ctx) {
            const AudioContextClass = window.AudioContext || window.webkitAudioContext;
            if (AudioContextClass) {
                this.ctx = new AudioContextClass();
            }
        }
        if (this.ctx && this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
    }

    vibrate(pattern = 15) {
        if (this.vibrationEnabled && !this.isMuted) {
            try {
                navigator.vibrate(pattern);
            } catch (e) {}
        }
    }

    /* ==========================================================================
       解压触觉物理音效
       ========================================================================== */

    playTapeTick(pitchFactor = 1.0) {
        if (this.isMuted) return;
        this.initContext();
        if (!this.ctx) return;

        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const filter = this.ctx.createBiquadFilter();

        osc.type = 'square';
        const baseFreq = 950 * pitchFactor;
        osc.frequency.setValueAtTime(baseFreq, now);
        osc.frequency.exponentialRampToValueAtTime(baseFreq * 1.8, now + 0.015);

        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(1400, now);
        filter.Q.setValueAtTime(4.0, now);

        gain.gain.setValueAtTime(0.08, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.02);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now);
        osc.stop(now + 0.025);
        this.vibrate(4);
    }

    playTapeSnap() {
        if (this.isMuted) return;
        this.initContext();
        if (!this.ctx) return;

        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(280, now);
        osc.frequency.exponentialRampToValueAtTime(1200, now + 0.07);

        gain.gain.setValueAtTime(0.12, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.07);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.08);

        setTimeout(() => {
            if (!this.ctx) return;
            const clickNow = this.ctx.currentTime;
            const clickOsc = this.ctx.createOscillator();
            const clickGain = this.ctx.createGain();
            clickOsc.type = 'sine';
            clickOsc.frequency.setValueAtTime(160, clickNow);
            clickOsc.frequency.exponentialRampToValueAtTime(40, clickNow + 0.05);

            clickGain.gain.setValueAtTime(0.22, clickNow);
            clickGain.gain.exponentialRampToValueAtTime(0.001, clickNow + 0.06);

            clickOsc.connect(clickGain);
            clickGain.connect(this.ctx.destination);
            clickOsc.start(clickNow);
            clickOsc.stop(clickNow + 0.07);

            this.vibrate([8, 15, 12]);
        }, 50);
    }

    playFabricRub(fabricType = 'cotton', speed = 1.0) {
        if (this.isMuted) return;
        this.initContext();
        if (!this.ctx) return;

        const now = this.ctx.currentTime;
        const bufferSize = Math.floor(this.ctx.sampleRate * 0.07);
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const output = buffer.getChannelData(0);

        let b0 = 0, b1 = 0, b2 = 0;
        for (let i = 0; i < bufferSize; i++) {
            const white = Math.random() * 2 - 1;
            b0 = 0.99886 * b0 + white * 0.0555179;
            b1 = 0.99332 * b1 + white * 0.0750759;
            b2 = 0.96900 * b2 + white * 0.1538520;
            output[i] = (b0 + b1 + b2) * 0.3;
        }

        const whiteNoise = this.ctx.createBufferSource();
        whiteNoise.buffer = buffer;

        const filter = this.ctx.createBiquadFilter();
        const gain = this.ctx.createGain();

        let centerFreq = 1200 * speed;
        let qVal = 2.0;
        let volume = 0.12;

        if (fabricType === 'silk') {
            centerFreq = 2200 * speed;
            volume = 0.08;
        } else if (fabricType === 'velvet') {
            centerFreq = 480 * speed;
            volume = 0.14;
        }

        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(centerFreq, now);
        filter.Q.setValueAtTime(qVal, now);

        gain.gain.setValueAtTime(volume, now);
        gain.gain.exponentialRampToValueAtTime(0.005, now + 0.06);

        whiteNoise.connect(filter);
        filter.connect(gain);
        gain.connect(this.ctx.destination);

        whiteNoise.start(now);
        whiteNoise.stop(now + 0.07);
    }

    playScissorCut() {
        if (this.isMuted) return;
        this.initContext();
        if (!this.ctx) return;

        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(2400, now);
        osc.frequency.exponentialRampToValueAtTime(680, now + 0.08);

        gain.gain.setValueAtTime(0.18, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.09);

        // 高频咔嚓破裂
        const bufferSize = Math.floor(this.ctx.sampleRate * 0.04);
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.2));
        }
        const noise = this.ctx.createBufferSource();
        noise.buffer = buffer;

        const filter = this.ctx.createBiquadFilter();
        filter.type = 'highpass';
        filter.frequency.setValueAtTime(1800, now);

        const noiseGain = this.ctx.createGain();
        noiseGain.gain.setValueAtTime(0.20, now);
        noiseGain.gain.exponentialRampToValueAtTime(0.01, now + 0.04);

        noise.connect(filter);
        filter.connect(noiseGain);
        noiseGain.connect(this.ctx.destination);
        noise.start(now);
        noise.stop(now + 0.05);

        this.vibrate(18);
    }

    playTearCloth() {
        if (this.isMuted) return;
        this.initContext();
        if (!this.ctx) return;

        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(300, now);
        osc.frequency.linearRampToValueAtTime(130, now + 0.11);

        gain.gain.setValueAtTime(0.14, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.11);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.12);

        this.vibrate([12, 25, 15]);
    }

    startSewingMachine(speedRatio = 0.5) {
        if (this.isMuted) return;
        this.initContext();
        if (!this.ctx) return;

        this.isSewingRunning = true;
        this.updateSewingSpeed(speedRatio);
    }

    updateSewingSpeed(speedRatio) {
        if (!this.isSewingRunning || !this.ctx) return;
        const rateHz = 3 + speedRatio * 11;
        const intervalMs = 1000 / rateHz;

        if (this.sewingInterval) clearInterval(this.sewingInterval);

        this.sewingInterval = setInterval(() => {
            if (!this.isSewingRunning) {
                clearInterval(this.sewingInterval);
                return;
            }
            this.playSingleStitch(speedRatio);
        }, intervalMs);
    }

    playSingleStitch(speedRatio = 0.5) {
        if (this.isMuted || !this.ctx) return;
        const now = this.ctx.currentTime;

        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'square';
        osc.frequency.setValueAtTime(260 + speedRatio * 70, now);
        osc.frequency.exponentialRampToValueAtTime(60, now + 0.025);

        gain.gain.setValueAtTime(0.11, now);
        gain.gain.exponentialRampToValueAtTime(0.005, now + 0.03);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.035);
        this.vibrate(6);
    }

    stopSewingMachine() {
        this.isSewingRunning = false;
        if (this.sewingInterval) {
            clearInterval(this.sewingInterval);
            this.sewingInterval = null;
        }
    }

    playPerfectSnap() {
        if (this.isMuted) return;
        this.initContext();
        if (!this.ctx) return;

        const now = this.ctx.currentTime;
        const osc1 = this.ctx.createOscillator();
        const osc2 = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc1.type = 'sine';
        osc1.frequency.setValueAtTime(880, now);
        osc1.frequency.exponentialRampToValueAtTime(1760, now + 0.08);

        osc2.type = 'triangle';
        osc2.frequency.setValueAtTime(1320, now);
        osc2.frequency.exponentialRampToValueAtTime(2640, now + 0.08);

        gain.gain.setValueAtTime(0.16, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

        osc1.connect(gain);
        osc2.connect(gain);
        gain.connect(this.ctx.destination);

        osc1.start(now);
        osc2.start(now);
        osc1.stop(now + 0.12);
        osc2.stop(now + 0.12);
        this.vibrate([10, 20, 15]);
    }

    playAccessoryAttach() {
        if (this.isMuted) return;
        this.initContext();
        if (!this.ctx) return;

        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(520, now);
        osc.frequency.exponentialRampToValueAtTime(1040, now + 0.06);

        gain.gain.setValueAtTime(0.14, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.09);
        this.vibrate(8);
    }

    playGavelHit() {
        if (this.isMuted) return;
        this.initContext();
        if (!this.ctx) return;

        const now = this.ctx.currentTime;
        const subOsc = this.ctx.createOscillator();
        const subGain = this.ctx.createGain();
        subOsc.type = 'sine';
        subOsc.frequency.setValueAtTime(130, now);
        subOsc.frequency.exponentialRampToValueAtTime(32, now + 0.15);

        subGain.gain.setValueAtTime(0.35, now);
        subGain.gain.exponentialRampToValueAtTime(0.001, now + 0.16);

        subOsc.connect(subGain);
        subGain.connect(this.ctx.destination);
        subOsc.start(now);
        subOsc.stop(now + 0.18);

        const woodOsc = this.ctx.createOscillator();
        const woodGain = this.ctx.createGain();
        woodOsc.type = 'triangle';
        woodOsc.frequency.setValueAtTime(580, now);
        woodOsc.frequency.exponentialRampToValueAtTime(120, now + 0.06);

        woodGain.gain.setValueAtTime(0.25, now);
        woodGain.gain.exponentialRampToValueAtTime(0.005, now + 0.07);

        woodOsc.connect(woodGain);
        woodGain.connect(this.ctx.destination);
        woodOsc.start(now);
        woodOsc.stop(now + 0.08);

        this.vibrate([25, 35, 20]);
    }

    playCoinReward() {
        if (this.isMuted) return;
        this.initContext();
        if (!this.ctx) return;

        const notes = [987.77, 1318.51, 1975.53];
        notes.forEach((freq, idx) => {
            const now = this.ctx.currentTime + idx * 0.06;
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();

            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, now);
            gain.gain.setValueAtTime(0.15, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);

            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start(now);
            osc.stop(now + 0.2);
        });
        this.vibrate([8, 25, 12]);
    }

    /**
     * 拍卖成交 / 大秀谢幕：现场名流热烈鼓掌音效 (Web Audio 算法大厅回响)
     */
    playApplause(durationSec = 2.4) {
        if (this.isMuted) return;
        this.initContext();
        if (!this.ctx) return;

        const bufferSize = this.ctx.sampleRate * durationSec;
        const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const output = noiseBuffer.getChannelData(0);
        let b0 = 0, b1 = 0, b2 = 0;
        for (let i = 0; i < bufferSize; i++) {
            const white = Math.random() * 2 - 1;
            b0 = 0.99 * b0 + white * 0.05;
            b1 = 0.96 * b1 + white * 0.11;
            b2 = 0.86 * b2 + white * 0.25;
            // 拍击突发脉冲调制
            const claps = (Math.random() > 0.985 ? (Math.random() * 0.8) : 0);
            output[i] = (b0 + b1 + b2) * 0.18 + claps;
        }

        const whiteNoise = this.ctx.createBufferSource();
        whiteNoise.buffer = noiseBuffer;

        const filter = this.ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(1600, this.ctx.currentTime);
        filter.Q.setValueAtTime(1.2, this.ctx.currentTime);

        const gain = this.ctx.createGain();
        const now = this.ctx.currentTime;
        gain.gain.setValueAtTime(0.01, now);
        gain.gain.linearRampToValueAtTime(0.35, now + 0.25);
        gain.gain.linearRampToValueAtTime(0.28, now + durationSec * 0.7);
        gain.gain.exponentialRampToValueAtTime(0.001, now + durationSec);

        whiteNoise.connect(filter);
        filter.connect(gain);
        gain.connect(this.ctx.destination);

        whiteNoise.start(now);
        whiteNoise.stop(now + durationSec + 0.1);
        this.vibrate([30, 40, 30, 50, 20]);
    }

    /* ==========================================================================
       公版古典名曲与萨蒂钢琴算法合成 BGM 系统
       ========================================================================== */

    /**
     * 设定当前场景专属歌单 ('runway' | 'auction' | 'workshop')
     */
    setScene(sceneName, autoPlay = false) {
        this.activeScene = sceneName;
        const matched = this.fullCatalog.filter(t => t.scene.includes(sceneName));
        if (matched.length > 0) {
            this.playlist = matched;
        } else {
            this.playlist = this.fullCatalog;
        }
        this.currentTrackIndex = 0;
        if (autoPlay && !this.isMuted) {
            this.startBgm();
        }
        return this.playlist;
    }

    /**
     * 按时代风格筛选歌单 ('country' | 'greek' | 'rococo' | 'dior' | 'avantgarde')
     */
    setEra(eraKey, autoPlay = false) {
        const matched = this.fullCatalog.filter(t => t.eraKey === eraKey);
        if (matched.length > 0) {
            this.playlist = matched;
            this.currentTrackIndex = 0;
            if (autoPlay && !this.isMuted) {
                this.startBgm();
            }
        }
        return this.playlist;
    }

    /**
     * 播放指定 ID 的曲目
     */
    playTrackById(trackId) {
        const idx = this.playlist.findIndex(t => t.id === trackId);
        if (idx !== -1) {
            this.currentTrackIndex = idx;
            this.startBgm();
            return this.playlist[idx];
        }
        // 若在当前歌单未找到，则在全集寻找并设为主曲
        const globalIdx = this.fullCatalog.findIndex(t => t.id === trackId);
        if (globalIdx !== -1) {
            this.playlist = [this.fullCatalog[globalIdx], ...this.playlist];
            this.currentTrackIndex = 0;
            this.startBgm();
            return this.playlist[0];
        }
        return null;
    }

    /**
     * 启动/播放 BGM
     */
    startBgm() {
        if (this.isMuted) return;
        this.initContext();
        this.bgmPlaying = true;

        if (!this.playlist || this.playlist.length === 0) {
            this.playlist = this.fullCatalog;
        }
        const track = this.playlist[this.currentTrackIndex % this.playlist.length];

        this.playStreamAudio(track.url, () => {
            // 如果外部/本地文件加载受阻，回退至纯算法合成萨蒂钢琴伴奏
            this.startGymnopedieSynth();
        });
    }

    /**
     * 暂停 BGM
     */
    pauseBgm() {
        this.bgmPlaying = false;
        if (this.synthBgmTimer) {
            clearInterval(this.synthBgmTimer);
            this.synthBgmTimer = null;
        }
        if (this.audioElement) {
            this.audioElement.pause();
        }
    }

    toggleBgm() {
        if (this.bgmPlaying) {
            this.pauseBgm();
        } else {
            this.startBgm();
        }
        return this.bgmPlaying;
    }

    /**
     * 切歌 (下一个)
     */
    nextTrack() {
        this.pauseBgm();
        this.currentTrackIndex = (this.currentTrackIndex + 1) % this.playlist.length;
        this.startBgm();
        return this.playlist[this.currentTrackIndex];
    }

    getCurrentTrack() {
        if (!this.playlist || this.playlist.length === 0) return this.fullCatalog[0];
        return this.playlist[this.currentTrackIndex % this.playlist.length];
    }

    /**
     * 纯算法程序化合成萨蒂《Gymnopédie No. 1》极简古典钢琴琶音伴奏
     * 3/4 拍：第一拍低音和弦，第二三拍空灵中音伴奏
     */
    startGymnopedieSynth() {
        if (this.synthBgmTimer) clearInterval(this.synthBgmTimer);

        // 萨蒂经典和弦进阶序列 (频率Hz)
        // Gmaj7 (G2: 98, B3: 246.9, D4: 293.6, F#4: 369.9)
        // Dmaj7 (D2: 73.4, A3: 220.0, C#4: 277.1, F#4: 369.9)
        const progression = [
            { bass: 98.0,  chord: [246.94, 293.66, 369.99], melody: 440.0 }, // A4
            { bass: 73.42, chord: [220.00, 277.18, 369.99], melody: 392.0 }, // G4
            { bass: 98.0,  chord: [246.94, 293.66, 369.99], melody: 369.9 }, // F#4
            { bass: 73.42, chord: [220.00, 277.18, 369.99], melody: 329.6 }  // E4
        ];

        let bar = 0;
        const beatMs = 850; // 极简舒缓慢速三拍子 (约 70 BPM)

        const playMeasure = () => {
            if (!this.bgmPlaying || this.isMuted || !this.ctx) return;
            const currentChord = progression[bar % progression.length];
            bar++;

            // 第一拍：深沉温暖低音
            this.playPianoNote(currentChord.bass, 0.0, 1.8, 0.18);

            // 第二拍：空灵柔和和弦
            setTimeout(() => {
                if (!this.bgmPlaying || !this.ctx) return;
                currentChord.chord.forEach(freq => this.playPianoNote(freq, 0.0, 1.4, 0.09));
            }, beatMs);

            // 第三拍：高音空灵单音旋律
            setTimeout(() => {
                if (!this.bgmPlaying || !this.ctx) return;
                currentChord.chord.forEach(freq => this.playPianoNote(freq * 0.99, 0.0, 1.2, 0.06));
                if (currentChord.melody) {
                    this.playPianoNote(currentChord.melody, 0.0, 2.0, 0.12);
                }
            }, beatMs * 2);
        };

        playMeasure();
        this.synthBgmTimer = setInterval(playMeasure, beatMs * 3);
    }

    /**
     * 单个仿古钢琴音符算法合成 (双正弦微调 + 指数衰减)
     */
    playPianoNote(freq, delaySec, durationSec, volume) {
        if (!this.ctx || this.isMuted) return;
        const now = this.ctx.currentTime + delaySec;

        const osc1 = this.ctx.createOscillator();
        const osc2 = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const filter = this.ctx.createBiquadFilter();

        osc1.type = 'sine';
        osc1.frequency.setValueAtTime(freq, now);

        osc2.type = 'triangle';
        osc2.frequency.setValueAtTime(freq * 2.002, now); // 二次泛音

        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(freq * 3.5, now);
        filter.frequency.exponentialRampToValueAtTime(freq * 1.2, now + durationSec);

        const targetVol = volume * this.bgmVolume;
        gain.gain.setValueAtTime(0.001, now);
        gain.gain.linearRampToValueAtTime(targetVol, now + 0.03); // 柔和触键
        gain.gain.exponentialRampToValueAtTime(0.0001, now + durationSec);

        osc1.connect(filter);
        osc2.connect(filter);
        filter.connect(gain);
        gain.connect(this.ctx.destination);

        osc1.start(now);
        osc2.start(now);
        osc1.stop(now + durationSec + 0.1);
        osc2.stop(now + durationSec + 0.1);
    }

    /**
     * 播放高保真公版音频 (带自动唤醒与算法回退)
     */
    playStreamAudio(url, onFallback) {
        if (this.audioElement) {
            this.audioElement.pause();
            this.audioElement = null;
        }

        try {
            const audio = new Audio(url);
            this.audioElement = audio;
            audio.volume = this.bgmVolume;

            // 曲末自动切入下一首 (连续编年史沉浸听感)
            audio.addEventListener('ended', () => {
                if (this.bgmPlaying && !this.isMuted) {
                    this.nextTrack();
                }
            });

            const playPromise = audio.play();
            if (playPromise !== undefined) {
                playPromise.then(() => {
                    // 播放成功
                }).catch(() => {
                    // 浏览器策略阻断时：监听首次用户点击交互并唤醒播放
                    const unlockHandler = () => {
                        if (this.bgmPlaying && this.audioElement && !this.isMuted) {
                            this.audioElement.play().catch(() => {});
                        }
                        document.removeEventListener('pointerdown', unlockHandler);
                        document.removeEventListener('keydown', unlockHandler);
                    };
                    document.addEventListener('pointerdown', unlockHandler, { once: true });
                    document.addEventListener('keydown', unlockHandler, { once: true });

                    // 同时启动算法钢琴伴奏以确保始终有乐声
                    if (typeof onFallback === 'function') {
                        onFallback();
                    }
                });
            }
        } catch (e) {
            if (typeof onFallback === 'function') onFallback();
        }
    }

    toggleMute() {
        this.isMuted = !this.isMuted;
        if (this.isMuted) {
            this.stopSewingMachine();
            this.pauseBgm();
        } else {
            this.startBgm();
        }
        return this.isMuted;
    }
}

window.tailorAudio = new TailorAudio();
