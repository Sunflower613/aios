/** Paper coordinates are millimetres; zoom never alters the pattern or cutting tolerance. */
class CuttingWorkspace {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.pointers = new Map();
        this.history = [];
        this.view = { x: 0, y: 0, scale: 1 };
        this.resize(); this.setupEvents();
        window.addEventListener('resize', () => { this.resize(); this.fit(); });
        window.tailorStore.on('step:changed', () => this.cancelPointers());
        for (const [id, action] of Object.entries({ btnResetCut: () => this.resetWorkspace(), btnActionUnfold: () => this.detach(), btnUndoCut: () => this.undo(), btnZoomIn: () => this.zoom(1.35), btnZoomOut: () => this.zoom(1 / 1.35), btnFitPattern: () => this.fit() })) document.getElementById(id).onclick = action;
        window.addEventListener('blur', () => this.cancelPointers());
    }
    resize() {
        const rect = this.canvas.parentElement.getBoundingClientRect();
        this.width = Math.max(240, rect.width || 800); this.height = Math.max(200, rect.height || 450);
        this.dpr = Math.min(devicePixelRatio || 1, 2);
        this.canvas.width = this.width * this.dpr; this.canvas.height = this.height * this.dpr;
    }
    prepareWorkspace() {
        const store = window.tailorStore;
        try {
            const signature = JSON.stringify(store.currentDress.measurements);
            if (this.inputSignature !== signature) { this.pattern = TailorPattern.generate(store.currentDress.measurements); this.inputSignature = signature; }
            const cut = store.currentDress.cutting;
            if (cut.version !== TailorPattern.version || cut.signature !== this.pattern.signature) {
                store.currentDress.cutting = { version: TailorPattern.version, signature: this.pattern.signature, pieces: {}, selected: 0, accuracy: 0, completed: false };
                store.currentDress.sewing = { accuracy: 0, completed: false };
            }
            this.selected = store.currentDress.cutting.selected || 0;
            this.history = []; this.cancelPointers(); this.fit(); this.updateProgressUI();
        } catch (error) {
            this.pattern = null;
            document.getElementById('cutProgressText').textContent = error.message;
            document.getElementById('btnActionUnfold').disabled = true;
            this.draw();
        }
    }
    get piece() { return this.pattern?.pieces[this.selected]; }
    get state() {
        const cut = window.tailorStore.currentDress.cutting;
        if (!cut.pieces[this.piece.id]) cut.pieces[this.piece.id] = { hit: Array(this.piece.cut.length).fill(false), strokes: [], damage: 0, detached: false };
        return cut.pieces[this.piece.id];
    }
    fit() {
        if (!this.piece) return;
        const b = this.piece.bounds;
        const scale = Math.min((this.width - 100) / (b.maxX - b.minX), (this.height - 94) / (b.maxY - b.minY));
        this.fitScale = scale;
        this.view = { scale, x: this.width / 2 - (b.maxX + b.minX) / 2 * scale, y: this.height / 2 + 10 - (b.maxY + b.minY) / 2 * scale };
        this.draw();
    }
    zoom(factor, anchor = { x: this.width / 2, y: this.height / 2 }) {
        if (!this.piece) return;
        const world = this.toWorld(anchor);
        this.view.scale = Math.max(this.fitScale * .7, Math.min(this.fitScale * 6, this.view.scale * factor));
        this.view.x = anchor.x - world.x * this.view.scale; this.view.y = anchor.y - world.y * this.view.scale;
        this.draw();
    }
    toWorld(p) { return { x: (p.x - this.view.x) / this.view.scale, y: (p.y - this.view.y) / this.view.scale }; }
    toScreen(p) { return { x: p.x * this.view.scale + this.view.x, y: p.y * this.view.scale + this.view.y }; }
    eventPoint(e) { const r = this.canvas.getBoundingClientRect(); return { x: e.clientX - r.left, y: e.clientY - r.top }; }
    setupEvents() {
        this.canvas.addEventListener('pointerdown', e => {
            if (!this.piece || window.tailorStore.currentStep !== 2) return;
            e.preventDefault(); this.canvas.setPointerCapture(e.pointerId);
            const p = this.eventPoint(e); this.pointers.set(e.pointerId, p);
            if (this.pointers.size === 2) {
                if (this.beforeStroke) this.restore(this.beforeStroke);
                this.beforeStroke = null; this.stroke = []; this.gesturing = true; this.lastGesture = this.gesture(); this.draw(); return;
            }
            if (this.pointers.size > 2 || this.gesturing) return;
            this.panning = e.button === 1 || e.shiftKey; this.lastPoint = p;
            this.beforeStroke = this.panning ? null : JSON.parse(JSON.stringify(this.state)); this.stroke = [];
            window.tailorAudio.initContext();
        });
        this.canvas.addEventListener('pointermove', e => {
            if (!this.pointers.has(e.pointerId)) return;
            e.preventDefault(); const p = this.eventPoint(e); this.pointers.set(e.pointerId, p);
            if (this.gesturing) {
                if (this.pointers.size === 2) {
                    const next = this.gesture(), anchor = this.toWorld(this.lastGesture.center);
                    this.view.scale = Math.max(this.fitScale * .7, Math.min(this.fitScale * 6, this.view.scale * next.distance / this.lastGesture.distance));
                    this.view.x = next.center.x - anchor.x * this.view.scale; this.view.y = next.center.y - anchor.y * this.view.scale;
                    this.lastGesture = next; this.draw();
                }
                return;
            }
            if (this.panning) { this.view.x += p.x - this.lastPoint.x; this.view.y += p.y - this.lastPoint.y; }
            else if (!this.state.detached && TailorPattern.distance(p, this.lastPoint) > 2) {
                const a = this.toWorld(this.lastPoint), b = this.toWorld(p);
                this.recordSegment(a, b); if (!this.stroke.length) this.stroke.push(a); this.stroke.push(b);
                if (performance.now() - (this.lastSound || 0) > 100) { window.tailorAudio.playScissorCut(); this.lastSound = performance.now(); }
            }
            this.lastPoint = p; this.draw();
        });
        const end = e => {
            if (!this.pointers.has(e.pointerId)) return;
            if (!this.gesturing && this.beforeStroke && this.stroke?.length) {
                this.history.push(this.beforeStroke); if (this.history.length > 20) this.history.shift();
                this.state.strokes.push(this.stroke); if (this.state.strokes.length > 120) this.state.strokes.shift();
                window.tailorStore.currentDress.sewing = { accuracy: 0, completed: false };
            }
            this.beforeStroke = null; this.stroke = []; this.pointers.delete(e.pointerId);
            if (!this.pointers.size) this.gesturing = false;
            this.save(); this.draw();
        };
        this.canvas.addEventListener('pointerup', end);
        this.canvas.addEventListener('pointercancel', () => { this.cancelPointers(); this.draw(); });
        this.canvas.addEventListener('lostpointercapture', end);
        this.canvas.addEventListener('wheel', e => { e.preventDefault(); this.zoom(Math.exp(-e.deltaY * .002), this.eventPoint(e)); }, { passive: false });
    }
    gesture() { const [a, b] = [...this.pointers.values()]; return { center: { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 }, distance: Math.max(1, TailorPattern.distance(a, b)) }; }
    cancelPointers() {
        if (this.beforeStroke && this.piece) this.restore(this.beforeStroke);
        this.beforeStroke = null; this.stroke = []; this.pointers.clear(); this.gesturing = false;
    }
    restore(state) { window.tailorStore.currentDress.cutting.pieces[this.piece.id] = JSON.parse(JSON.stringify(state)); }
    static segmentDistance(p, a, b) {
        const dx = b.x - a.x, dy = b.y - a.y;
        const t = Math.max(0, Math.min(1, ((p.x - a.x) * dx + (p.y - a.y) * dy) / (dx * dx + dy * dy || 1)));
        return Math.hypot(p.x - a.x - t * dx, p.y - a.y - t * dy);
    }
    recordSegment(a, b) {
        const state = this.state, cut = this.piece.cut;
        cut.forEach((p, i) => { if (CuttingWorkspace.segmentDistance(p, a, b) <= 5) state.hit[i] = true; });
        const len = TailorPattern.distance(a, b), n = Math.max(1, Math.ceil(len / 4));
        for (let i = 1; i <= n; i++) {
            const p = { x: a.x + (b.x - a.x) * i / n, y: a.y + (b.y - a.y) * i / n };
            if (Math.min(...cut.map(q => TailorPattern.distance(p, q))) > 6) state.damage += len / n;
        }
        this.updateProgressUI();
    }
    progress(state = this.state) { return state.hit.filter(Boolean).length / state.hit.length; }
    canDetach() {
        let gap = 0, longest = 0;
        for (const hit of this.state.hit) { gap = hit ? 0 : gap + 1; longest = Math.max(longest, gap); }
        return this.progress() >= .98 && longest <= 3;
    }
    detach() {
        if (!this.piece || !this.canDetach() || this.state.detached) return;
        this.state.detached = true; this.save(); window.tailorAudio.playPerfectSnap();
        const next = this.pattern.pieces.findIndex(p => !window.tailorStore.currentDress.cutting.pieces[p.id]?.detached);
        if (next >= 0) this.selectPiece(next); else this.draw();
    }
    selectPiece(index) {
        this.cancelPointers(); this.selected = index; window.tailorStore.currentDress.cutting.selected = index;
        this.history = []; this.fit(); this.updateProgressUI(); window.tailorStore.persistCurrentDraft();
    }
    undo() {
        if (!this.piece || !this.history.length) return;
        this.restore(this.history.pop()); window.tailorStore.currentDress.sewing = { accuracy: 0, completed: false }; this.save(); this.draw();
    }
    resetWorkspace() {
        if (!this.piece) return;
        this.cancelPointers(); delete window.tailorStore.currentDress.cutting.pieces[this.piece.id];
        window.tailorStore.currentDress.sewing = { accuracy: 0, completed: false }; this.history = []; this.save(); this.draw();
    }
    save() {
        if (!this.piece) return;
        const cut = window.tailorStore.currentDress.cutting, states = this.pattern.pieces.map(p => cut.pieces[p.id]);
        cut.completed = states.every(s => s?.detached);
        cut.accuracy = Math.round(states.reduce((sum, s) => sum + (s ? Math.max(0, 100 - s.damage / 5) * this.progress(s) : 0), 0) / states.length);
        window.tailorStore.emit('dress:updated', window.tailorStore.currentDress); this.updateProgressUI();
    }
    updateProgressUI() {
        if (!this.piece) return;
        const states = window.tailorStore.currentDress.cutting.pieces;
        const count = this.pattern.pieces.reduce((sum, p) => sum + (states[p.id]?.detached ? p.quantity : 0), 0);
        document.getElementById('cutProgressText').textContent = `${this.piece.name} · 已剪 ${Math.round(this.progress() * 100)}% · 已取 ${count} / 9 片${this.state.damage > 0 ? ' · 有偏剪，可撤回' : ''}`;
        const detach = document.getElementById('btnActionUnfold'); detach.disabled = !this.canDetach() || this.state.detached; detach.textContent = this.state.detached ? '已收好裁片' : '取下裁片';
        document.getElementById('btnUndoCut').disabled = !this.history.length;
        const list = document.getElementById('patternPieces');
        list.replaceChildren(...this.pattern.pieces.map((p, i) => {
            const button = document.createElement('button'); button.className = `piece-chip ${i === this.selected ? 'active' : ''} ${states[p.id]?.detached ? 'done' : ''}`;
            button.textContent = `${states[p.id]?.detached ? '✓ ' : ''}${p.name} ×${p.quantity}`; button.onclick = () => this.selectPiece(i); return button;
        }));
    }
    drawPath(points, color, width = 1.5, dash = [], close = false, fill = null) {
        if (!points?.length) return;
        const ctx = this.ctx; ctx.beginPath();
        points.forEach((point, i) => { const p = this.toScreen(point); i ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y); });
        if (close) ctx.closePath(); if (fill) { ctx.fillStyle = fill; ctx.fill(); }
        ctx.strokeStyle = color; ctx.lineWidth = width; ctx.setLineDash(dash); ctx.stroke(); ctx.setLineDash([]);
    }
    draw() {
        const ctx = this.ctx; ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0); ctx.clearRect(0, 0, this.width, this.height);
        ctx.fillStyle = '#eee6d9'; ctx.fillRect(0, 0, this.width, this.height); if (!this.piece) return;
        const grid = 10 * this.view.scale; ctx.strokeStyle = '#ddd2bf'; ctx.lineWidth = .5; ctx.beginPath();
        for (let x = this.view.x % grid; x < this.width; x += grid) { ctx.moveTo(x, 0); ctx.lineTo(x, this.height); }
        for (let y = this.view.y % grid; y < this.height; y += grid) { ctx.moveTo(0, y); ctx.lineTo(this.width, y); } ctx.stroke();
        this.drawPath(this.piece.cut, '#baac92', 1, [], true, this.state.detached ? '#e2eee4' : '#fffcf3');
        for (const mark of this.piece.marks) {
            const styles = { seam: ['#2874ae', [7, 4]], opening: ['#bd651c', [3, 3]], dart: ['#3d826c', [6, 3]], hem: ['#2874ae', [7, 4]] };
            const [color, dash] = styles[mark.type]; this.drawPath(mark.points, color, 1.5, dash);
        }
        this.drawPath(this.piece.cut, '#c04455', 2.2);
        for (let i = 1; i < this.piece.cut.length; i++) if (this.state.hit[i - 1] && this.state.hit[i]) this.drawPath([this.piece.cut[i - 1], this.piece.cut[i]], '#52886c', 3);
        if (this.piece.fold) this.drawPath(this.piece.fold, '#8b62ae', 2, [10, 4, 2, 4]);
        for (const stroke of this.state.strokes) this.drawPath(stroke, '#a73d4a99', 1);
        if (this.stroke?.length) this.drawPath(this.stroke, '#a73d4a', 2);
        const b = this.piece.bounds, label = this.toScreen({ x: b.minX + (b.maxX - b.minX) * .43, y: b.minY + (b.maxY - b.minY) * .6 });
        ctx.fillStyle = '#655a4c'; ctx.font = '12px sans-serif'; ctx.textAlign = 'center'; ctx.fillText(this.piece.name, label.x, label.y);
        ctx.font = '10px sans-serif'; ctx.fillText(this.piece.layout, label.x, label.y + 18);
        const notch = this.toScreen(this.piece.notch); ctx.fillStyle = '#2874ae'; ctx.fillRect(notch.x - 3, notch.y - 3, 6, 6);
        const grain = this.toScreen({ x: b.minX + 32, y: (b.minY + b.maxY) * .5 });
        ctx.strokeStyle = '#8b7d68'; ctx.beginPath(); ctx.moveTo(grain.x, grain.y - 24); ctx.lineTo(grain.x, grain.y + 24); ctx.stroke();
        ctx.fillText('↑', grain.x, grain.y - 22); ctx.fillText('布纹', grain.x, grain.y + 38);
        ctx.textAlign = 'left'; ctx.fillStyle = '#fffcf3ef'; ctx.fillRect(0, 0, this.width, 32); ctx.fillStyle = '#64584b'; ctx.font = '12px sans-serif';
        ctx.fillText(`${this.piece.material} · ${this.piece.layout} · 缝份 1.5 cm${this.piece.id.includes('skirt') ? ' / 下摆 3 cm' : ''}`, 12, 21);
        const scaleBar = 50 * this.view.scale; ctx.fillStyle = '#fffcf3ef'; ctx.fillRect(8, this.height - 35, Math.min(scaleBar + 18, this.width - 16), 28);
        ctx.fillStyle = '#64584b'; ctx.fillRect(16, this.height - 20, scaleBar, 2); ctx.font = '10px sans-serif'; ctx.fillText('5 cm', 16, this.height - 24);
        document.getElementById('patternZoom').textContent = `${Math.round(this.view.scale / this.fitScale * 100)}%`;
    }
}
window.CuttingWorkspace = CuttingWorkspace;
