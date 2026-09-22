/**
 * 一起做裙子 (Let's Tailor!) - 游戏核心状态管理器
 * 支持 LocalStorage 自动持久化、事件发布订阅与工坊工序流转
 */

class TailorStore {
    constructor() {
        this.STORAGE_KEY = 'lets_tailor_game_save_v1';
        this.listeners = {};

        // 默认全局存档数据
        this.state = {
            coins: 180,              // 初始启动金币
            influence: 10,           // 声望点数
            currentChapterId: 1,     // 1: 古希腊, 2: 洛可可, 3: 黄金剪裁, 4: 现代解构
            unlockedChapters: [1],   // 默认仅解锁第一篇章！
            currentStageIndex: 0,
            unlockedStages: [0],
            unlockedFabrics: ['linen', 'cotton', 'organza'],
            unlockedSilhouettes: ['chiton'],
            unlockedAccessories: ['fibula_sun_bronze', 'greek_belt_cord'],
            unlockedLores: ['lore_chiton_drape'],
            completedOrders: [],
            salonExhibits: [],       // 展厅已陈列作品
            album: [],               // 走秀摄影相册快照
            audioMuted: false
        };

        // 当前正在制作的单件裙子实时工序草稿
        this.currentStep = 0; // 0: 塑形(Shape), 1: 选料(Fabric), 2: 裁剪(Cut), 3: 缝纫(Sew), 4: 配饰(Decor), 5: 完工结算(Finish)
        this.currentDress = this.createEmptyDressDraft();

        this.loadFromStorage();
        this.currentDress = this.createEmptyDressDraft();
        const draft = this.getActiveDraft();
        if (draft && draft.patternVersion === 2 && draft.measurements && draft.mannequin && draft.fabric && draft.cutting && draft.sewing) {
            this.currentDress = draft;
            this.currentStep = Math.max(0, Math.min(4, draft.currentStep || 0));
            if (!draft.cutting.completed) this.currentStep = Math.min(this.currentStep, 2);
            else if (!draft.sewing.completed) this.currentStep = Math.min(this.currentStep, 3);
        }
        this.on('dress:updated', () => this.persistCurrentDraft());
        if (this.state.completedOrders.some(item => item.id === this.currentDress.id)) this.startNewDress();
        window.addEventListener('pagehide', () => this.persistCurrentDraft());
    }

    /**
     * 创建一件全新裙子的初始草稿
     */
    createEmptyDressDraft() {
        return {
            id: 'dress_' + Date.now() + '_' + Math.floor(Math.random() * 1000),
            name: '经典无袖连衣裙',
            patternVersion: 2,
            measurements: { ...TailorPattern.customer, bust: 88, waist: 72, hips: 96 },
            customer: { ...TailorPattern.customer },
            chapterId: this.state ? (this.state.currentChapterId || 1) : 1,
            stageId: 0,
            silhouette: 'a_line',
            // 人台关键截面比例系数 (0.6 ~ 1.8)
            mannequin: {
                shoulder: 41.5 / 38,
                bust: 88 / 86,
                waist: 72 / 64,
                hips: 96 / 92,
                hemWidth: 1.45,
                length: 1.35,
                waistHeight: 1.0
            },
            fabric: {
                id: 'cotton',
                name: '平纹棉布',
                color: '#faf7f0',
                textureUrl: 'assets/textures/fabric_knit_chevron_cream.jpg',
                roughness: 0.75,
                metalness: 0.05,
                stiffness: 0.65
            },
            cutting: {
                accuracy: 0,
                completed: false,
                cutLinesDone: 0,
                totalLines: 3
            },
            sewing: {
                accuracy: 0,
                completed: false,
                perfectCorners: 0
            },
            accessories: [],   // 放置的配饰与刺绣图层列表
            embroideryStrokes: [], // 金线手绘笔触
            createdAt: new Date().toLocaleDateString('zh-CN'),
            snapshotImage: null
        };
    }

    /**
     * 重置并开始新裙子制作
     */
    startNewDress(orderConfig = null) {
        this.currentDress = this.createEmptyDressDraft();
        if (orderConfig) {
            this.currentDress.name = orderConfig.name;
            this.currentDress.orderRequirement = orderConfig;
        }
        this.currentStep = 0;
        this.persistCurrentDraft();
        this.emit('dress:updated', this.currentDress);
        this.emit('step:changed', this.currentStep);
    }

    /**
     * 切换当前制作工序步骤
     * @param {number} stepIndex 0 - 5
     */
    goToStep(stepIndex) {
        if (stepIndex > this.currentStep) {
            if (this.currentStep === 0 && this.fittingError() > 1) return false;
            if (stepIndex >= 3 && !this.currentDress.cutting.completed) return false;
            if (stepIndex >= 4 && !this.currentDress.sewing.completed) return false;
        }
        this.currentStep = Math.max(0, Math.min(4, stepIndex));
        this.emit('step:changed', this.currentStep);
        this.emit('dress:updated', this.currentDress);
    }

    /**
     * 下一步工序
     */
    nextStep() {
        if (this.currentStep < 5) {
            this.goToStep(this.currentStep + 1);
        }
    }

    /**
     * 上一步工序
     */
    prevStep() {
        if (this.currentStep > 0) {
            this.goToStep(this.currentStep - 1);
        }
    }

    /**
     * 修改金币
     */
    addCoins(amount) {
        this.state.coins = Math.max(0, this.state.coins + amount);
        this.saveToStorage();
        this.emit('currency:updated', { coins: this.state.coins, influence: this.state.influence });
    }

    /**
     * 修改声望
     */
    addInfluence(amount) {
        this.state.influence = Math.max(0, this.state.influence + amount);
        this.saveToStorage();
        this.emit('currency:updated', { coins: this.state.coins, influence: this.state.influence });
    }

    /**
     * 解锁时代阶段与篇章
     */
    unlockStage(stageIndex) {
        if (!this.state.unlockedStages.includes(stageIndex)) {
            this.state.unlockedStages.push(stageIndex);
            this.state.currentStageIndex = stageIndex;
            this.saveToStorage();
            this.emit('stage:unlocked', stageIndex);
        }
    }

    /**
     * 解锁指定篇章 (1-4)
     */
    unlockChapter(chapterId) {
        if (!this.state.unlockedChapters) this.state.unlockedChapters = [1];
        if (!this.state.unlockedChapters.includes(chapterId)) {
            this.state.unlockedChapters.push(chapterId);
            this.state.currentChapterId = chapterId;
            this.saveToStorage();
            this.emit('chapter:unlocked', chapterId);
        }
    }

    /**
     * 切换当前活跃篇章
     */
    switchChapter(chapterId) {
        if (!this.state.unlockedChapters) this.state.unlockedChapters = [1];
        if (this.state.unlockedChapters.includes(chapterId)) {
            this.state.currentChapterId = chapterId;
            this.saveToStorage();
            this.emit('chapter:changed', chapterId);
        }
    }

    /**
     * 保存当前设计草稿至本地缓存供走秀页 (runway.html) 与拍卖页 (auction.html) 调取
     */
    persistCurrentDraft() {
        try {
            this.currentDress.currentStep = this.currentStep;
            localStorage.setItem('lets_tailor_active_dress_draft', JSON.stringify(this.currentDress));
        } catch (e) {
            console.warn('持久化当前设计草稿失败:', e);
        }
    }

    /**
     * 从本地读取活跃设计草稿
     */
    getActiveDraft() {
        try {
            const raw = localStorage.getItem('lets_tailor_active_dress_draft');
            if (raw) return JSON.parse(raw);
        } catch (e) {
            console.warn('读取草稿失败:', e);
        }
        return this.currentDress;
    }

    /**
     * 解锁手账知识彩蛋
     */
    unlockLore(loreId) {
        if (!this.state.unlockedLores.includes(loreId)) {
            this.state.unlockedLores.push(loreId);
            this.saveToStorage();
            this.emit('lore:unlocked', loreId);
        }
    }

    /**
     * 保存裙子到私人沙龙展厅
     */
    saveToSalon(dress, photoUrl = null) {
        const existing = this.state.salonExhibits.find(item => item.id === dress.id);
        if (existing) return existing;
        const exhibit = {
            ...dress,
            snapshot: photoUrl || dress.snapshotImage,
            exhibitId: 'salon_' + Date.now(),
            savedAt: new Date().toLocaleDateString('zh-CN'),
            views: Math.floor(Math.random() * 20) + 5,
            likes: Math.floor(Math.random() * 8) + 1,
            guestComments: [
                { author: '巴黎时尚观察家', text: '这一件的立裁比例充满了古典韵律感。' }
            ]
        };
        this.state.salonExhibits.unshift(exhibit);
        this.saveToStorage();
        this.emit('salon:updated', this.state.salonExhibits);
        return exhibit;
    }

    /**
     * 拍照保存到相册
     */
    savePhotoToAlbum(photoDataUrl, title) {
        const item = {
            id: 'photo_' + Date.now(),
            url: photoDataUrl,
            title: title || this.currentDress.name,
            time: new Date().toLocaleString('zh-CN')
        };
        this.state.album.unshift(item);
        this.saveToStorage();
        this.emit('album:updated', this.state.album);
    }

    /**
     * 简单的事件分发系统
     */
    on(event, callback) {
        if (!this.listeners[event]) {
            this.listeners[event] = [];
        }
        this.listeners[event].push(callback);
    }

    emit(event, data) {
        if (this.listeners[event]) {
            this.listeners[event].forEach(cb => {
                try {
                    cb(data);
                } catch (e) {
                    console.error('事件监听执行异常:', event, e);
                }
            });
        }
    }

    /**
     * 本地存储同步
     */
    saveToStorage() {
        try {
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.state));
        } catch (e) {
            console.warn('LocalStorage 写入失败 (可能是隐身模式或配额超限):', e);
        }
    }

    loadFromStorage() {
        try {
            const raw = localStorage.getItem(this.STORAGE_KEY);
            if (raw) {
                const parsed = JSON.parse(raw);
                this.state = { ...this.state, ...parsed };
            }
        } catch (e) {
            console.warn('LocalStorage 读取失败，使用默认值:', e);
        }
    }

    getDressProfile(dressData = this.currentDress) {
        const m = dressData.mannequin;
        const sil = dressData.silhouette || 'a_line';
        const hemY = -.32 * m.length;
        const point = (radius, y) => ({ radius, y });
        // 截面轮廓序列 (核心：优先读取玩家在裁剪工作台中亲手剪出的 customProfile)
        let profilePoints = [];

        if (dressData.cutting && dressData.cutting.customProfile && dressData.cutting.customProfile.length >= 4) {
            // 真实物理应用玩家自由裁剪的轮廓线！
            profilePoints = dressData.cutting.customProfile.map(p => point(p.radius, p.y));
        } else if (sil === 'chiton') {
            // 1. 古希腊基同 (Chiton)：垂坠折褶，矩形自然下垂，肩部系带，腰带束腰
            profilePoints = [
                point(0.11, 1.55),
                point(0.21 * m.shoulder, 1.38), // 自然落肩
                point(0.23 * m.bust, 1.20),
                point(0.18 * m.waist, 0.96),    // 绳带收束
                point(0.24 * m.hips, 0.68),
                point(0.28 * m.hemWidth * 0.85, 0.1),
                point(0.36 * m.hemWidth, hemY)  // 垂直下垂多立克柱感
            ];
        } else if (sil === 'ballgown') {
            // 2. 洛可可蓬裙 (Rococo & Corset)：极细蜂腰，鱼骨裙撑横向张开两米大摆
            profilePoints = [
                point(0.09, 1.55),
                point(0.17 * m.shoulder, 1.40),
                point(0.25 * m.bust, 1.22),
                point(0.14 * m.waist, 0.94),    // 鲸须紧束蜂腰
                point(0.34 * m.hips, 0.65),     // 侧撑架迅速隆起
                point(0.50 * m.hemWidth, 0.15), // 夸张圆弧大裙撑
                point(0.62 * m.hemWidth, hemY)
            ];
        } else if (sil === 'mermaid') {
            // 3. 优雅鱼尾 (Mermaid)：紧贴胸腰臀部曲线，膝盖处收束，下摆突然花瓣绽开
            profilePoints = [
                point(0.09, 1.55),
                point(0.18 * m.shoulder, 1.40),
                point(0.24 * m.bust, 1.22),
                point(0.16 * m.waist, 0.95),
                point(0.26 * m.hips, 0.68),
                point(0.19 * m.hemWidth * 0.65, 0.15), // 膝盖紧缩
                point(0.48 * m.hemWidth, hemY)          // 鱼尾下摆盛开
            ];
        } else if (sil === 'column') {
            // 4. 20年代直筒裙 (Column / Flapper)：利落H型
            profilePoints = [
                point(0.09, 1.55),
                point(0.18 * m.shoulder, 1.40),
                point(0.22 * m.bust, 1.22),
                point(0.20 * m.waist, 0.95),    // 不强调收腰
                point(0.21 * m.hips, 0.68),
                point(0.22 * m.hemWidth, 0.15),
                point(0.23 * m.hemWidth, hemY)  // 垂直利落
            ];
        } else {
            // 默认：经典A字裙 (A-Line)
            profilePoints = [
                point(0.09, 1.55),
                point(0.18 * m.shoulder, 1.40),
                point(0.24 * m.bust, 1.22),
                point(0.17 * m.waist, 0.95),
                point(0.26 * m.hips, 0.68),
                point(0.36 * m.hemWidth * 0.8, 0.15),
                point(0.48 * m.hemWidth, hemY)
            ];
        }

        return profilePoints;
    }

    smoothProfile(profile) {
        const points = [];
        for (let i = 0; i < profile.length - 1; i++) {
            const a = profile[i], b = profile[i + 1];
            for (let j = 0; j < 8; j++) {
                const t = j / 8, ease = t * t * (3 - 2 * t);
                points.push({ radius: a.radius + (b.radius - a.radius) * ease, y: a.y + (b.y - a.y) * t });
            }
        }
        points.push(profile[profile.length - 1]);
        return points;
    }

    fittingError() {
        return Math.max(...['bust', 'waist', 'hips'].map(key => Math.abs(this.currentDress.measurements[key] - this.currentDress.customer[key])));
    }

    setMeasurement(key, value) {
        const bounds = TailorPattern.limits[key];
        if (!bounds || !Number.isFinite(value)) return;
        this.currentDress.measurements[key] = Math.round(Math.max(bounds[0], Math.min(bounds[1], value)) * 10) / 10;
        const size = this.currentDress.measurements;
        Object.assign(this.currentDress.mannequin, { bust: size.bust / 86, waist: size.waist / 64, hips: size.hips / 92, shoulder: size.shoulder / 38, length: (size.skirtLength + size.frontLength) / 95 });
        this.invalidateCraft();
        this.emit('dress:updated', this.currentDress);
    }

    invalidateCraft() {
        this.currentDress.cutting = { accuracy: 0, completed: false };
        this.currentDress.sewing = { accuracy: 0, completed: false };
    }

    settleDress(dress, coins) {
        if (!dress.cutting.completed || !dress.sewing.completed ||
            this.state.completedOrders.some(item => item.id === dress.id)) return false;
        const reward = Math.max(0, Math.round(Number(coins) || 0));
        this.state.completedOrders.push({ id: dress.id, score: this.evaluateDress(dress).total, chapterId: dress.chapterId });
        this.state.coins += reward;
        this.state.influence += Math.round(reward / 12);
        const next = (dress.chapterId || 1) + 1;
        if (next <= 4 && (next === 2 ? this.state.coins >= 260 : this.state.influence >= (next === 3 ? 60 : 120))) {
            this.unlockChapter(next);
        }
        this.saveToStorage();
        this.emit('currency:updated', this.state);
        return true;
    }

    evaluateDress(dress = this.currentDress) {
        const match = Math.round(Math.max(0, 100 - ['bust', 'waist', 'hips'].reduce((sum, key) => sum + Math.abs(dress.measurements[key] - dress.customer[key]), 0) * 5));
        const cut = Math.round(dress.cutting.accuracy || 0);
        const sew = Math.round(dress.sewing.accuracy || 0);
        const total = Math.round(match * 0.4 + cut * 0.3 + sew * 0.3);
        return { match, cut, sew, total, value: Math.round(60 + total * 2.4), stars: total >= 90 ? 3 : total >= 70 ? 2 : 1 };
    }
}

// 导出全局单例
window.tailorStore = new TailorStore();
