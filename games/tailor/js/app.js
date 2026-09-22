/**
 * 一起做裙子 (Let's Tailor!) - 主程序调度与全局胶水控制器
 * 单步渐进工序、百宝箱抽屉、外婆开篇剧情、统一成交模态与古典BGM联动
 */

class TailorApp {
    constructor() {
        this.store = window.tailorStore;
        this.audio = window.tailorAudio;

        this.mannequin = null;
        this.fabricSys = null;
        this.cuttingWs = null;
        this.sewingWs = null;
        this.accessoriesSys = null;
        this.runway = null;
        this.auction = null;
        this.salon = null;

        this.stepDescriptions = [
            { title: '工序 1 / 调整人台尺寸', desc: '拖动胸、腰、臀部；每项与客人尺寸相差不超过 1 cm。' },
            { title: '工序 2 / 选布', desc: '固定无袖腰节连衣裙；上身另有里布。' },
            { title: '工序 3 / 裁剪', desc: '按纸样裁出面布与里布，保留缝份。' },
            { title: '工序 4 / 缝制组装', desc: '按省道、肩缝、开口、侧缝、腰节、拉链、下摆依次完成。' },
            { title: '工序 5 / 试穿检查', desc: '检查尺寸与拼接，确认领口、袖窿和拉链开口。' }
        ];

        this.init();
    }

    init() {
        this.mannequin = new MannequinViewer('canvas3d', 'container3d');
        this.fabricSys = new FabricSystem();
        this.cuttingWs = new CuttingWorkspace('canvasCutting');
        this.sewingWs = new SewingWorkspace('canvasSewing', 'btnSewingPedal');
        this.accessoriesSys = new AccessoriesSystem();
        this.runway = new RunwayStudio('canvasRunway');
        this.auction = new AuctionHouse();
        this.salon = new SalonGallery();

        this.setupNavigation();
        this.setupWorkshopDrawer();
        this.setupMusicPlayer();
        this.setupMoldingSliders();
        this.setupStepFlow();
        this.setupModals();
        this.setupCommission();


        const btnResetSewing = document.getElementById('btnResetSewing');
        if (btnResetSewing) {
            btnResetSewing.addEventListener('click', () => {
                if (this.sewingWs) {
                    this.sewingWs.resetWorkspace();
                    this.audio.playScissorCut();
                }
            });
        }

        this.updateHeaderUI();
        this.syncStepUI(this.store.currentStep);

        this.store.on('currency:updated', () => this.updateHeaderUI());
        this.store.on('step:changed', (step) => this.syncStepUI(step));
        this.store.on('dress:updated', (dress) => this.syncDressDisplay(dress));
        this.syncDressDisplay(this.store.currentDress);
    }

    /**
     * 初次进入弹出外婆的信笺温情剧情
     */
    checkPrologueStory() {
        const hasReadStory = localStorage.getItem('lets_tailor_prologue_read');
        if (!hasReadStory) {
            setTimeout(() => {
                const modal = document.getElementById('modalPrologue');
                if (modal) modal.classList.add('show');
            }, 500);
        }
    }

    /**
     * 顶部极简导航
     */
    setupNavigation() {
        const btnReset = document.getElementById('btnResetView');
        if (btnReset) {
            btnReset.addEventListener('click', () => {
                this.mannequin.resetView();
                this.audio.playTapeSnap();
            });
        }

        const btnWind = document.getElementById('btnToggleWind');
        const textWind = document.getElementById('textWindStatus');
        if (btnWind) {
            btnWind.addEventListener('click', () => {
                const on = this.mannequin.toggleWind();
                if (textWind) textWind.innerText = on ? '自然风' : '静止';
                this.audio.playTapeTick(1.2);
            });
        }


    }

    /**
     * 工坊百宝箱侧边抽屉
     */
    setupWorkshopDrawer() {
        const btnOpen = document.getElementById('btnOpenDrawer');
        const btnClose = document.getElementById('btnCloseDrawer');
        const drawer = document.getElementById('drawerBackdrop');

        const openDrawer = () => {
            if (drawer) drawer.classList.add('show');
            this.audio.playTapeTick(1.2);
            this.updateDrawerMusicInfo();
        };

        const closeDrawer = () => {
            if (drawer) drawer.classList.remove('show');
            this.audio.playTapeSnap();
        };

        if (btnOpen) btnOpen.addEventListener('click', openDrawer);
        if (btnClose) btnClose.addEventListener('click', closeDrawer);
        if (drawer) {
            drawer.addEventListener('click', (e) => {
                if (e.target === drawer) closeDrawer();
            });
        }

        // 抽屉子菜单绑定
        const bindDrawerItem = (id, targetModalId, onOpen) => {
            const el = document.getElementById(id);
            const modal = document.getElementById(targetModalId);
            if (el && modal) {
                el.addEventListener('click', () => {
                    closeDrawer();
                    modal.classList.add('show');
                    if (onOpen) onOpen();
                });
            }
        };

        bindDrawerItem('btnDrawerOpenLore', 'modalLore', () => this.renderLoreBook());
        bindDrawerItem('btnDrawerOpenSalon', 'modalSalon', () => this.salon.render());
        bindDrawerItem('btnDrawerOpenAlbum', 'modalAlbum', () => this.renderAlbum());
        bindDrawerItem('btnDrawerOpenPrologue', 'modalPrologue');

        // 直达独立全屏走秀台与拍卖行
        const btnRunway = document.getElementById('btnDrawerOpenRunway');
        if (btnRunway) {
            btnRunway.addEventListener('click', () => {
                this.store.persistCurrentDraft();
                window.location.href = 'runway.html';
            });
        }
        const btnAuction = document.getElementById('btnDrawerOpenAuction');
        if (btnAuction) {
            btnAuction.addEventListener('click', () => {
                this.store.persistCurrentDraft();
                window.location.href = 'auction.html';
            });
        }
    }

    /**
     * 古典留声机音乐控制
     */
    setupMusicPlayer() {
        const btnToggleBgm = document.getElementById('btnToggleBgm');
        const textBgmPlay = document.getElementById('textBgmPlay');
        const iconBgmPlay = document.getElementById('iconBgmPlay');
        const btnNextBgm = document.getElementById('btnNextBgm');
        const btnToggleAudio = document.getElementById('btnToggleAudioInDrawer');
        const iconAudio = document.getElementById('iconAudioInDrawer');

        if (btnToggleBgm) {
            btnToggleBgm.addEventListener('click', () => {
                const isPlaying = this.audio.toggleBgm();
                if (textBgmPlay) textBgmPlay.innerText = isPlaying ? '暂停' : '播放';
                if (iconBgmPlay) iconBgmPlay.setAttribute('data-icon', isPlaying ? 'lucide:pause' : 'lucide:play');
                this.updateDrawerMusicInfo();
            });
        }

        if (btnNextBgm) {
            btnNextBgm.addEventListener('click', () => {
                this.audio.nextTrack();
                if (textBgmPlay) textBgmPlay.innerText = '暂停';
                if (iconBgmPlay) iconBgmPlay.setAttribute('data-icon', 'lucide:pause');
                this.updateDrawerMusicInfo();
            });
        }

        if (btnToggleAudio) {
            btnToggleAudio.addEventListener('click', () => {
                const isMuted = this.audio.toggleMute();
                if (iconAudio) {
                    iconAudio.setAttribute('data-icon', isMuted ? 'lucide:volume-x' : 'lucide:volume-2');
                }
            });
        }

        // 首次与页面任意交互时，自动伴随柔和的萨蒂极简钢琴曲
        const startMusicOnFirstTouch = () => {
            this.audio.startBgm();
            this.updateDrawerMusicInfo();
            window.removeEventListener('pointerdown', startMusicOnFirstTouch);
        };
        window.addEventListener('pointerdown', startMusicOnFirstTouch, { once: true });
    }

    updateDrawerMusicInfo() {
        const trackText = document.getElementById('textCurrentTrackName');
        const cur = this.audio.getCurrentTrack();
        if (trackText && cur) {
            trackText.innerText = `正在播放：${cur.title} (${cur.era})`;
        }
    }

    setupMoldingSliders() {
        const labels = { bust: '胸围', waist: '腰围', hips: '臀围', shoulder: '肩宽', backLength: '肩颈点到后腰', frontLength: '肩颈点到前腰', bustHeight: '肩颈点到胸高', bustSpan: '胸距', neck: '颈围', highBust: '上胸围', underbust: '下胸围', shoulderSlope: '肩斜角度', skirtLength: '腰至裙长' };
        for (const [key, label] of Object.entries(labels)) {
            const [min, max] = TailorPattern.limits[key];
            const field = document.createElement('label'); field.className = 'size-field';
            field.innerHTML = `<span>${label} <b id="sizeVal_${key}"></b></span><input id="size_${key}" type="range" min="${min}" max="${max}" step="0.1" aria-label="${label}"><small>客人 ${this.store.currentDress.customer[key]}${key === 'shoulderSlope' ? '°' : ' cm'}</small>`;
            document.getElementById(['bust', 'waist', 'hips'].includes(key) ? 'sizePrimary' : 'sizeAdvanced').appendChild(field);
            field.querySelector('input').oninput = e => this.store.setMeasurement(key, Number(e.target.value));
        }
    }

    setupStepFlow() {
        const dots = document.querySelectorAll('.step-indicator-dot');
        dots.forEach(dot => {
            dot.addEventListener('click', () => {
                const step = parseInt(dot.dataset.step, 10);
                if (step <= this.store.currentStep) {
                    this.store.goToStep(step);
                    this.audio.playTapeTick(1.0);
                }
            });
        });

        const btnNext = document.getElementById('btnNextStep');
        const btnPrev = document.getElementById('btnPrevStep');
        const btnFinish = document.getElementById('btnFinishDress');

        if (btnNext) btnNext.addEventListener('click', () => {
            if (this.store.currentStep < 4) this.store.nextStep();
            this.updateStepAvailability();
        });
        if (btnPrev) btnPrev.addEventListener('click', () => this.store.prevStep());

        if (btnFinish) {
            btnFinish.addEventListener('click', () => {
                this.celebrateFinishDress();
            });
        }
    }

    syncStepUI(stepIndex) {
        document.body.dataset.step = stepIndex;
        if (this.mannequin) this.mannequin.buildDressMesh(this.store.currentDress);
        this.updateStepAvailability();
        document.querySelectorAll('.step-indicator-dot').forEach((dot, idx) => {
            dot.classList.remove('active', 'completed');
            if (idx === stepIndex) dot.classList.add('active');
            else if (idx < stepIndex) dot.classList.add('completed');
        });

        // 底部各步骤参数面板切换
        for (let i = 0; i < 5; i++) {
            const panel = document.getElementById(`panelStep${i}`);
            if (panel) panel.style.display = i === stepIndex ? 'block' : 'none';
        }

        const hudTitle = document.getElementById('hudStepTitle');
        const hudDesc = document.getElementById('hudStepDesc');
        const info = this.stepDescriptions[stepIndex] || this.stepDescriptions[0];
        if (hudTitle) hudTitle.innerText = info.title;
        if (hudDesc) hudDesc.innerText = info.desc;

        const btnPrev = document.getElementById('btnPrevStep');
        const btnNext = document.getElementById('btnNextStep');
        const btnFinish = document.getElementById('btnFinishDress');

        if (btnPrev) btnPrev.style.visibility = stepIndex === 0 ? 'hidden' : 'visible';

        if (stepIndex === 4) {
            if (btnNext) btnNext.style.display = 'none';
            if (btnFinish) btnFinish.style.display = 'inline-flex';
        } else {
            if (btnNext) btnNext.style.display = 'inline-flex';
            if (btnFinish) btnFinish.style.display = 'none';
        }

        // 核心突破：工序 3 (裁剪) 与 工序 4 (缝纫) 隐藏人台，铺满全屏！
        const container3d = document.getElementById('container3d');
        const containerCutting = document.getElementById('containerCuttingFull');
        const containerSewing = document.getElementById('containerSewingFull');

        if (stepIndex === 2) {
            // 裁剪步骤：隐藏人台，铺满全屏大案板
            if (container3d) container3d.style.display = 'none';
            if (containerCutting) containerCutting.classList.add('active');
            if (containerSewing) containerSewing.classList.remove('active');
            if (this.cuttingWs) {
                setTimeout(() => {
                    if (this.store.currentStep !== 2) return;
                    this.cuttingWs.resize();
                    this.cuttingWs.prepareWorkspace();
                }, 60);
            }
        } else if (stepIndex === 3) {
            // 缝纫步骤：隐藏人台，铺满全屏简约缝纫机台
            if (container3d) container3d.style.display = 'none';
            if (containerCutting) containerCutting.classList.remove('active');
            if (containerSewing) containerSewing.classList.add('active');
            if (this.sewingWs) {
                setTimeout(() => {
                    if (this.store.currentStep !== 3) return;
                    this.sewingWs.resize();
                    this.sewingWs.restoreWorkspace();
                }, 60);
            }
        } else {
            // 步骤 0(塑形)、步骤 1(选料)、步骤 4(配饰)：展示人台，隐藏全屏容器
            if (container3d) container3d.style.display = 'block';
            if (containerCutting) containerCutting.classList.remove('active');
            if (containerSewing) containerSewing.classList.remove('active');
            if (this.mannequin && this.mannequin.renderer && container3d) {
                setTimeout(() => {
                    const w = container3d.clientWidth;
                    const h = container3d.clientHeight;
                    this.mannequin.camera.aspect = w / h;
                    this.mannequin.camera.updateProjectionMatrix();
                    this.mannequin.renderer.setSize(w, h);
                }, 60);
            }
            if (stepIndex === 4 && this.accessoriesSys) {
                this.accessoriesSys.renderDraggablePinsOnDress();
            }
        }
    }

    celebrateFinishDress() {
        if (!this.store.currentDress.cutting.completed || !this.store.currentDress.sewing.completed) return;
        this.audio.playPerfectSnap();
        setTimeout(() => this.audio.playCoinReward(), 200);

        const snapshot = this.mannequin ? this.mannequin.takeSnapshot() : null;
        this.store.currentDress.snapshotImage = snapshot;
        this.store.persistCurrentDraft();

        // 完工直接前往全屏走秀台 (runway.html)，彻底告别弹窗！
        window.location.href = 'runway.html';
    }

    setupModals() {
        const setupModalToggle = (btnId, modalId, closeId, onOpen) => {
            const btn = document.getElementById(btnId);
            const modal = document.getElementById(modalId);
            const close = document.getElementById(closeId);

            if (btn && modal) {
                btn.addEventListener('click', () => {
                    modal.classList.add('show');
                    this.audio.playTapeTick(1.2);
                    if (onOpen) onOpen();
                });
            }
            if (close && modal) {
                close.addEventListener('click', () => {
                    modal.classList.remove('show');
                    this.audio.playTapeSnap();
                });
            }
        };

        // 外婆信笺弹窗
        const btnClosePrologue = document.getElementById('btnClosePrologue');
        const btnEnterFromStory = document.getElementById('btnEnterWorkshopFromStory');
        const modalPrologue = document.getElementById('modalPrologue');
        const dismissStory = () => {
            if (modalPrologue) modalPrologue.classList.remove('show');
            localStorage.setItem('lets_tailor_prologue_read', 'true');
            this.audio.playPerfectSnap();
        };
        if (btnClosePrologue) btnClosePrologue.addEventListener('click', dismissStory);
        if (btnEnterFromStory) btnEnterFromStory.addEventListener('click', dismissStory);

        // 走秀模态框
        const closeRunway = document.getElementById('btnCloseRunway');
        const modalRunway = document.getElementById('modalRunway');
        if (closeRunway && modalRunway) {
            closeRunway.addEventListener('click', () => modalRunway.classList.remove('show'));
        }

        // 前往拍卖
        const btnEnterAuction = document.getElementById('btnEnterAuction');
        const modalAuction = document.getElementById('modalAuction');
        if (btnEnterAuction && modalAuction) {
            btnEnterAuction.addEventListener('click', () => {
                modalRunway.classList.remove('show');
                modalAuction.classList.add('show');
                this.auction.startAuction(this.store.currentDress);
            });
        }

        const closeAuction = document.getElementById('btnCloseAuction');
        if (closeAuction && modalAuction) {
            closeAuction.addEventListener('click', () => modalAuction.classList.remove('show'));
        }

        // 珍藏入沙龙
        const btnKeepToSalon = document.getElementById('btnKeepToSalon');
        if (btnKeepToSalon) {
            btnKeepToSalon.addEventListener('click', () => {
                const exhibit = this.store.saveToSalon(this.store.currentDress, this.store.currentDress.snapshotImage);
                modalRunway.classList.remove('show');
                this.audio.playPerfectSnap();
                alert(`恭喜！【${exhibit.name}】已成功珍藏于私人藏衣馆！`);
                this.store.startNewDress();
            });
        }

        // 成交结算弹窗 (modalDealResult)
        const modalDeal = document.getElementById('modalDealResult');
        const closeDeal = document.getElementById('btnCloseDealResult');
        const btnDealKeep = document.getElementById('btnDealKeepToSalon');
        const btnDealNext = document.getElementById('btnDealNextDress');

        if (closeDeal && modalDeal) {
            closeDeal.addEventListener('click', () => {
                modalDeal.classList.remove('show');
                this.store.startNewDress();
            });
        }
        if (btnDealKeep && modalDeal) {
            btnDealKeep.addEventListener('click', () => {
                this.store.saveToSalon(this.store.currentDress, this.store.currentDress.snapshotImage);
                modalDeal.classList.remove('show');
                this.audio.playPerfectSnap();
                alert(`恭喜！作品已永久珍藏于私人高定沙龙展厅！`);
                this.store.startNewDress();
            });
        }
        if (btnDealNext && modalDeal) {
            btnDealNext.addEventListener('click', () => {
                modalDeal.classList.remove('show');
                this.audio.playTapeSnap();
                this.store.startNewDress();
            });
        }

        setupModalToggle(null, 'modalSalon', 'btnCloseSalon', () => this.salon.render());
        setupModalToggle(null, 'modalLore', 'btnCloseLore', () => this.renderLoreBook());
        setupModalToggle(null, 'modalAlbum', 'btnCloseAlbum', () => this.renderAlbum());
    }

    renderLoreBook() {
        const grid = document.getElementById('loreCardsGrid');
        if (!grid) return;
        grid.innerHTML = '';

        window.TAILOR_HISTORY_STAGES.forEach((stage, idx) => {
            const isUnlocked = this.store.state.unlockedStages.includes(idx);
            const lore = stage.lore;

            const card = document.createElement('div');
            card.className = `lore-card ${!isUnlocked ? 'locked' : ''}`;

            card.innerHTML = `
                <div style="display:flex; justify-content:space-between; align-items:center;">
                    <span class="lore-card-badge">${stage.eraTitle}</span>
                    <span class="iconify" data-icon="${lore.icon}" style="color:var(--pink-primary);"></span>
                </div>
                <div class="lore-card-title">${lore.title}</div>
                <div style="font-size:11px; font-weight:600; color:var(--text-muted);">${lore.subtitle}</div>
                <div class="lore-card-content" style="white-space: pre-line;">
                    ${isUnlocked ? lore.content : `时代尚未解锁。\n解锁条件：${stage.unlockRequirement}`}
                </div>
            `;
            grid.appendChild(card);
        });
    }

    renderAlbum() {
        const grid = document.getElementById('albumGrid');
        if (!grid) return;
        grid.innerHTML = '';

        const album = this.store.state.album || [];
        if (album.length === 0) {
            grid.innerHTML = `
                <div style="grid-column: 1 / -1; text-align: center; padding: 36px 20px; color: var(--text-muted);">
                    <div style="width: 44px; height: 44px; border-radius: 50%; background: var(--pink-subtle); display: inline-flex; align-items: center; justify-content: center; color: var(--pink-primary); margin-bottom: 8px;">
                        <span class="iconify" data-icon="lucide:camera" style="font-size: 22px;"></span>
                    </div>
                    <p style="font-size: 13px; font-weight: 600; color: var(--text-secondary);">画册暂无大片</p>
                    <p style="font-size: 11px; margin-top: 4px;">完工进入走秀台后点击“抓拍”，照片将保存于此。</p>
                </div>
            `;
            return;
        }

        album.forEach(photo => {
            const card = document.createElement('div');
            card.className = 'lore-card';
            card.style.background = '#fff';
            card.innerHTML = `
                <div style="height: 150px; border-radius: 6px; overflow: hidden; background: #1f1a20; display:flex; align-items:center; justify-content:center;">
                    <img src="${photo.url}" style="max-height: 100%; object-fit: contain;">
                </div>
                <div class="lore-card-title" style="margin-top: 6px;">${photo.title}</div>
                <div style="font-size: 10px; color: var(--text-muted);">${photo.time}</div>
            `;
            grid.appendChild(card);
        });
    }

    updateHeaderUI() {
        const textCoins = document.getElementById('textCoins');
        const textInf = document.getElementById('textInfluence');
        const curEra = document.getElementById('badgeStageEraText');

        if (textCoins) textCoins.innerText = this.store.state.coins;
        if (textInf) textInf.innerText = this.store.state.influence;

        const curChapter = (window.CHAPTER_DESIGNS || []).find(c => c.id === (this.store.state.currentChapterId || 1));
        if (curEra) {
            curEra.innerText = '基础样衣';
        }
    }

    syncDressDisplay(dress) {
        const result = this.store.evaluateDress(dress);
        for (const [key, value] of Object.entries(dress.measurements)) {
            const input = document.getElementById(`size_${key}`), label = document.getElementById(`sizeVal_${key}`);
            if (input) input.value = value;
            if (label) label.textContent = `${value.toFixed(1)}${key === 'shoulderSlope' ? '°' : ' cm'}`;
        }
        const score = document.getElementById('commissionScore');
        if (score) score.textContent = this.store.currentStep === 0 ? `最大尺寸偏差 ${this.store.fittingError().toFixed(1)} cm · 允许 ±1 cm` : `量体符合 ${result.match}% · 裁剪 ${result.cut} · 缝制 ${result.sew}`;
        document.getElementById('inspectionResult').textContent = `实裁 9 片 · 缝制 ${Object.keys(dress.sewing.operations || {}).length} / 9 道 · 制作评分 ${result.total}`;
        this.updateStepAvailability();
    }

    updateStepAvailability() {
        const step = this.store.currentStep;
        const blocked = (step === 0 && this.store.fittingError() > 1) || (step === 2 && !this.store.currentDress.cutting.completed) || (step === 3 && !this.store.currentDress.sewing.completed);
        const next = document.getElementById('btnNextStep'); next.disabled = blocked; next.style.opacity = blocked ? '.5' : '1'; next.style.pointerEvents = 'auto';
        document.getElementById('nextStepLabel').textContent = step === 0 ? (blocked ? '先对齐三围' : '挑选面布') : step === 1 ? '生成纸样' : step === 2 ? (blocked ? '裁齐 9 片再继续' : '开始缝制') : '试穿检查';
    }

    setupCommission() {
        const card = document.createElement('section'); card.className = 'commission-card';
        card.innerHTML = '<div><span class="commission-label">样衣工作台 / DRESS 01</span><h2>经典无袖连衣裙</h2><p>腰节拼接 · 后中拉链 · 上身里布 · 6 份纸样 / 9 块裁片</p></div><div class="commission-details"><span>客人胸围 92.5 · 腰围 75 · 臀围 101 cm</span><strong id="commissionScore" aria-live="polite"></strong></div>';
        document.querySelector('.top-header').after(card);
    }

}

window.addEventListener('DOMContentLoaded', () => {
    window.tailorApp = new TailorApp();
});
