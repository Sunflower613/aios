/**
 * 一起做裙子 (Let's Tailor!) - 简约高定缝纫机车线系统
 * 隐藏人台，极简车台特写，布料从上到下平移送布，金色机针高频上下穿刺 (纯Canvas矢量绘制，无Emoji)
 */

class SewingWorkspace {
    constructor(canvasId, pedalBtnId) {
        this.canvas = document.getElementById(canvasId);
        this.pedalBtn = document.getElementById(pedalBtnId);
        if (!this.canvas || !this.pedalBtn) return;
        this.ctx = this.canvas.getContext('2d');

        this.isPedalDown = false;
        this.sewSpeed = 0;
        this.needleBounce = 0;

        // 布料推进偏移量 (从上往下送布)
        this.clothOffsetY = 0;
        this.totalDistance = 600;
        this.sewProgress = 0;

        this.stitches = [];
        this.accuracyScore = 98;
        this.lastStitchDistance = 0;

        this.currentOp = 0;
        this.init();
    }

    init() {
        this.resize();
        this.setupPedalEvents();
        document.getElementById('btnAlignSeam').onclick = () => {
            this.aligned = true;
            this.persistOperation();
            this.updateOperationUI();
        };
        document.getElementById('btnNextSeam').onclick = () => this.nextOperation();
        this.render();

        window.addEventListener('resize', () => {
            this.resize();
        });
    }

    resize() {
        const container = this.canvas.parentElement;
        const rect = container ? container.getBoundingClientRect() : { width: window.innerWidth, height: window.innerHeight * 0.65 };
        this.canvas.width = Math.max(340, rect.width || window.innerWidth);
        this.canvas.height = Math.max(320, rect.height || (window.innerHeight * 0.65));
        this.totalDistance = TailorPattern.operations[this.currentOp || 0].duration;
    }

    get operation() { return TailorPattern.operations[this.currentOp || 0]; }

    resetWorkspace() {
        this.releasePedal(); this.sewSpeed = 0; this.clothOffsetY = 0; this.sewProgress = 0; this.stitches = [];
        this.accuracyScore = 0; this.qualityDistance = 0; this.lastStitchDistance = 0; this.aligned = false;
        const saved = window.tailorStore.currentDress.sewing;
        saved.operations ||= {};
        for (let i = this.currentOp; i < TailorPattern.operations.length; i++) delete saved.operations[TailorPattern.operations[i].id];
        saved.completed = false;
        this.persistOperation(); this.updateOperationUI();
        window.tailorStore.emit('dress:updated', window.tailorStore.currentDress);
    }

    restoreWorkspace() {
        this.releasePedal(); this.sewSpeed = 0;
        const saved = window.tailorStore.currentDress.sewing;
        this.currentOp = saved.currentOp || 0;
        this.totalDistance = this.operation.duration;
        this.sewProgress = saved.operations?.[this.operation.id] ? 100 : (saved.progress || 0);
        this.clothOffsetY = this.totalDistance * this.sewProgress / 100;
        this.accuracyScore = saved.operationAccuracy || 0;
        this.qualityDistance = this.clothOffsetY * this.accuracyScore / 100;
        this.lastStitchDistance = this.clothOffsetY;
        this.stitches = []; this.aligned = saved.aligned || this.sewProgress > 0;
        this.pattern = TailorPattern.generate(window.tailorStore.currentDress.measurements);
        this.updateOperationUI();
    }

    nextOperation() {
        if (!window.tailorStore.currentDress.sewing.operations?.[this.operation.id] || this.currentOp >= TailorPattern.operations.length - 1) return;
        this.currentOp++;
        this.totalDistance = this.operation.duration;
        this.resetWorkspace();
    }

    persistOperation() {
        const saved = window.tailorStore.currentDress.sewing;
        Object.assign(saved, { currentOp: this.currentOp, progress: this.sewProgress, operationAccuracy: Math.round(this.accuracyScore), aligned: this.aligned });
        saved.operations ||= {};
        saved.accuracy = Math.round(Object.values(saved.operations).reduce((sum, op) => sum + op.accuracy, 0) / TailorPattern.operations.length);
        window.tailorStore.persistCurrentDraft();
    }

    updateOperationUI() {
        const saved = window.tailorStore.currentDress.sewing;
        document.getElementById('seamOperations').replaceChildren(...TailorPattern.operations.map((op, i) => {
            const tag = document.createElement('span'); tag.className = `seam-tag ${i === this.currentOp ? 'active' : ''}`;
            tag.textContent = `${saved.operations?.[op.id] ? '✓' : i + 1} ${op.name}`; return tag;
        }));
        document.getElementById('seamHint').textContent = this.operation.hint;
        const align = document.getElementById('btnAlignSeam');
        align.textContent = this.aligned ? '已对齐' : this.operation.action; align.disabled = this.aligned;
        document.getElementById('btnSewingPedal').disabled = !this.aligned || this.sewProgress >= 100;
        const next = document.getElementById('btnNextSeam'); next.disabled = this.sewProgress < 100 || this.currentOp === 8;
        next.textContent = this.currentOp === 8 ? '缝制完成' : '下一道缝制';
        this.updateStatusText(this.sewProgress >= 100 ? '本工序完成 · 可重做或继续' : '先对齐裁片，再按住车线；松开踏板减速。');
    }

    releasePedal() {
        this.isPedalDown = false;
        this.pedalBtn.classList.remove('pedal-down');
        window.tailorAudio.stopSewingMachine();
    }

    setupPedalEvents() {
        const press = e => {
            if (window.tailorStore.currentStep !== 3 || this.sewProgress >= 100 || !this.aligned) return;
            e.preventDefault();
            if (e.pointerId !== undefined) e.currentTarget.setPointerCapture(e.pointerId);
            this.isPedalDown = true;
            this.pedalBtn.classList.add('pedal-down');
            window.tailorAudio.initContext();
            window.tailorAudio.startSewingMachine(.35);
        };
        [this.pedalBtn, this.canvas].forEach(el => {
            el.addEventListener('pointerdown', press);
            el.addEventListener('pointerup', () => this.releasePedal());
            el.addEventListener('pointercancel', () => this.releasePedal());
            el.addEventListener('lostpointercapture', () => this.releasePedal());
        });
        this.pedalBtn.addEventListener('keydown', e => {
            if ((e.code === 'Space' || e.code === 'Enter') && !e.repeat) press(e);
        });
        this.pedalBtn.addEventListener('keyup', e => {
            if (e.code === 'Space' || e.code === 'Enter') this.releasePedal();
        });
        const stop = () => { this.releasePedal(); this.sewSpeed = 0; };
        window.addEventListener('blur', stop);
        document.addEventListener('visibilitychange', () => { if (document.hidden) stop(); });
        window.tailorStore.on('step:changed', stop);
    }

    targetSpeed() {
        return this.sewProgress >= 35 && this.sewProgress <= 55 ? .32 : .60;
    }

    update(deltaTime) {
        if (window.tailorStore.currentStep !== 3 || this.sewProgress >= 100 || !this.aligned) return;
        this.sewSpeed = Math.max(0, Math.min(1, this.sewSpeed + (this.isPedalDown ? .65 : -1.1) * deltaTime));
        if (this.sewSpeed <= .01) { this.needleBounce = 0; return; }
        window.tailorAudio.updateSewingSpeed(this.sewSpeed);
        const move = Math.min(this.totalDistance - this.clothOffsetY, this.sewSpeed * 100 * deltaTime);
        const error = Math.max(0, Math.abs(this.sewSpeed - this.targetSpeed()) - .16);
        const quality = Math.max(.1, 1 - error * 2.3);
        this.qualityDistance = (this.qualityDistance || 0) + quality * move;
        this.clothOffsetY += move;
        this.sewProgress = Math.min(100, this.clothOffsetY / this.totalDistance * 100);
        this.accuracyScore = this.qualityDistance / this.clothOffsetY * 100;
        this.needleBounce = Math.sin(performance.now() * .045) * 14;
        if (this.clothOffsetY - this.lastStitchDistance >= 8) {
            this.stitches.push({ y: this.clothOffsetY, offsetShake: Math.sin(this.clothOffsetY) * (1 - quality) * 15 });
            this.lastStitchDistance = this.clothOffsetY;
        }
        const saved = window.tailorStore.currentDress.sewing;
        saved.operationAccuracy = Math.round(this.accuracyScore);
        saved.progress = this.sewProgress;
        this.updateStatusText(`${Math.floor(this.sewProgress)}% · 平整 ${saved.operationAccuracy}% · ${this.targetSpeed() < .4 ? '弯道减速' : '匀速车线'}`);
        // Persist at most once a second, including progress when the player leaves the page.
        if (!this.lastSave || performance.now() - this.lastSave > 1000) {
            this.lastSave = performance.now();
            this.persistOperation();
        }
        if (this.sewProgress >= 100) this.finishSewing();
    }

    finishSewing() {
        this.releasePedal(); this.sewSpeed = 0;
        window.tailorAudio.playPerfectSnap();
        const saved = window.tailorStore.currentDress.sewing;
        saved.operations ||= {};
        saved.operations[this.operation.id] = { accuracy: Math.round(this.accuracyScore) };
        saved.completed = TailorPattern.operations.every(op => saved.operations[op.id]);
        this.persistOperation(); this.updateOperationUI();
        window.tailorStore.emit('dress:updated', window.tailorStore.currentDress);
    }

    updateStatusText(msg) {
        const text = document.getElementById('sewingStatusText');
        if (text) text.innerText = msg;
    }

    /**
     * 绘制居中精细压脚与金属机针
     */
    drawNeedleAndPresserFoot(cx, cy) {
        const ctx = this.ctx;
        ctx.save();
        ctx.translate(cx, cy);

        // 1. 金属针板 (Needle Plate)
        ctx.fillStyle = '#e8e5e8';
        ctx.strokeStyle = '#c4bfc4';
        ctx.lineWidth = 1.5;
        ctx.fillRect(-38, -25, 76, 50);
        ctx.strokeRect(-38, -25, 76, 50);

        // 针板圆孔
        ctx.beginPath();
        ctx.arc(0, 0, 4, 0, Math.PI * 2);
        ctx.fillStyle = '#2a1f24';
        ctx.fill();

        // 送布牙齿凹槽标线
        ctx.strokeStyle = '#9e979e';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(-18, -18); ctx.lineTo(-18, 18);
        ctx.moveTo(18, -18); ctx.lineTo(18, 18);
        ctx.stroke();

        // 2. 压脚 (Presser Foot - 左右双爪)
        ctx.fillStyle = 'rgba(215, 210, 215, 0.95)';
        ctx.strokeStyle = '#8a858a';
        ctx.lineWidth = 1.5;

        // 左压脚爪
        ctx.fillRect(-14, -20, 8, 38);
        ctx.strokeRect(-14, -20, 8, 38);
        // 右压脚爪
        ctx.fillRect(6, -20, 8, 38);
        ctx.strokeRect(6, -20, 8, 38);
        // 压脚横梁
        ctx.fillRect(-14, -26, 28, 6);
        ctx.strokeRect(-14, -26, 28, 6);

        // 3. 金色机针 (高频上下穿刺)
        const bounce = this.needleBounce;
        ctx.save();
        ctx.translate(0, bounce - 18);

        // 针杆
        ctx.fillStyle = '#6a656a';
        ctx.fillRect(-2.5, -45, 5, 42);

        // 镀金针身
        ctx.fillStyle = '#d4af37';
        ctx.fillRect(-1.5, -3, 3, 20);

        // 针尖
        ctx.beginPath();
        ctx.moveTo(-1.5, 17);
        ctx.lineTo(1.5, 17);
        ctx.lineTo(0, 25);
        ctx.closePath();
        ctx.fillStyle = '#b88d22';
        ctx.fill();

        // 针眼
        ctx.beginPath();
        ctx.arc(0, 19, 1.2, 0, Math.PI * 2);
        ctx.fillStyle = '#fff';
        ctx.fill();

        // 金黄色缝纫线
        ctx.strokeStyle = '#ffd700';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(0, -45);
        ctx.lineTo(0, 19);
        ctx.stroke();

        ctx.restore();
        ctx.restore();
    }

    render() {
        const now = performance.now(), delta = Math.min(.05, (now - (this.lastFrame || now)) / 1000);
        this.lastFrame = now;
        requestAnimationFrame(() => this.render());
        if (document.hidden || window.tailorStore.currentStep !== 3) return;
        this.update(delta);
        const ctx = this.ctx, w = this.canvas.width, h = this.canvas.height;
        ctx.clearRect(0, 0, w, h); ctx.fillStyle = '#f4efe5'; ctx.fillRect(0, 0, w, h);
        ctx.fillStyle = '#665541'; ctx.font = 'bold 15px sans-serif'; ctx.textAlign = 'center';
        ctx.fillText(`${this.currentOp + 1} / 9 · ${this.operation.name}`, w / 2, 26);
        const pieces = this.pattern?.pieces.filter(p => this.operation.pieces.includes(p.id)) || [];
        const tileW = Math.min(w / pieces.length, 230), previewH = Math.min(h * .31, 155);
        pieces.forEach((piece, i) => {
            const b = piece.bounds, scale = Math.min((tileW - 20) / (b.maxX - b.minX), (previewH - 25) / (b.maxY - b.minY));
            const x = w / 2 - pieces.length * tileW / 2 + tileW * i + tileW / 2 - (b.minX + b.maxX) / 2 * scale;
            const y = 50 - b.minY * scale;
            const draw = (points, color, fill = null) => {
                ctx.beginPath(); points.forEach((p, j) => j ? ctx.lineTo(x + p.x * scale, y + p.y * scale) : ctx.moveTo(x + p.x * scale, y + p.y * scale));
                if (fill) { ctx.closePath(); ctx.fillStyle = fill; ctx.fill(); }
                ctx.strokeStyle = color; ctx.lineWidth = 1.5; ctx.stroke();
            };
            draw(piece.outline, '#b7aa95', piece.material === '里布' ? '#e9e2d4' : window.tailorStore.currentDress.fabric.color);
            piece.marks.filter(mark => this.operation.type === 'dart' ? mark.type === 'dart' : mark.label.startsWith(this.operation.type)).forEach(mark => draw(mark.points, this.aligned ? '#368575' : '#c65755'));
            ctx.fillStyle = '#665541'; ctx.font = '11px sans-serif'; ctx.fillText(piece.name, x + (b.minX + b.maxX) / 2 * scale, 50 + previewH);
        });
        const cy = Math.max(235, h * .65);
        ctx.fillStyle = window.tailorStore.currentDress.fabric.color; ctx.fillRect(w / 2 - 78, cy - 40, 156, Math.max(70, h - cy - 62));
        ctx.strokeStyle = '#aa8a54'; ctx.lineWidth = 2; ctx.setLineDash([5, 4]); ctx.beginPath(); ctx.moveTo(w / 2, cy); ctx.lineTo(w / 2, Math.min(h - 70, cy + this.sewProgress)); ctx.stroke(); ctx.setLineDash([]);
        this.drawNeedleAndPresserFoot(w / 2, cy);
        const barX = w * .18, barW = w * .64;
        ctx.fillStyle = '#ddd4c6'; ctx.fillRect(barX, h - 48, barW, 12);
        ctx.fillStyle = '#73ad95'; ctx.fillRect(barX + (this.targetSpeed() - .16) * barW, h - 48, barW * .32, 12);
        ctx.fillStyle = '#563647'; ctx.fillRect(barX + this.sewSpeed * barW - 2, h - 53, 4, 22);
        ctx.font = '11px sans-serif'; ctx.fillText(this.targetSpeed() < .4 ? '弯道 · 松开踏板减速' : '按住加速，松开减速 · 让指针留在绿色区间', w / 2, h - 15);
        ctx.textAlign = 'start';
    }
}
window.SewingWorkspace = SewingWorkspace;
