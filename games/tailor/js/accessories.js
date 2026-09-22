/**
 * 一起做裙子 (Let's Tailor!) - 第一篇章古希腊配饰与自由拖拽定位系统
 * 纤布拉 (Fibula) 别针、编织腰带、月桂发冠在人台上自由移动、磁吸与定位 (全矢量图标，无Emoji)
 */

class AccessoriesSystem {
    constructor() {
        this.itemsDatabase = {
            fibula: [
                {
                    id: 'fibula_sun_bronze',
                    name: '太阳纹青铜纤布拉',
                    icon: 'lucide:sun',
                    type: 'fibula',
                    cost: 0,
                    scale: 1.0,
                    defaultPos: { x: 32, y: 22 }, // 百分比
                    desc: '古希腊标志性肩部搭扣，固定前后片织物。'
                },
                {
                    id: 'fibula_gold_disk',
                    name: '浮雕金盘纤布拉',
                    icon: 'lucide:disc',
                    type: 'fibula',
                    cost: 30,
                    scale: 1.1,
                    defaultPos: { x: 68, y: 22 },
                    desc: '贵族专享锻金别针，刻有奥林匹斯回形纹。'
                }
            ],
            belt: [
                {
                    id: 'greek_belt_cord',
                    name: '双股流苏编织腰绳',
                    icon: 'lucide:link',
                    type: 'belt',
                    cost: 0,
                    scale: 1.0,
                    defaultPos: { x: 50, y: 52 },
                    desc: '系束于胸下或腰间，提拉出松弛自然的波浪浪褶(Kolpos)。'
                },
                {
                    id: 'court_corset_belt',
                    name: '青铜雕花宽饰带',
                    icon: 'lucide:shield',
                    type: 'belt',
                    cost: 35,
                    scale: 1.0,
                    defaultPos: { x: 50, y: 55 },
                    desc: '硬质金属腰带，勾勒分明轮廓。'
                }
            ],
            headwear: [
                {
                    id: 'laurel_crown',
                    name: '阿波罗月桂金叶发冠',
                    icon: 'lucide:sparkles',
                    type: 'headwear',
                    cost: 40,
                    scale: 0.9,
                    defaultPos: { x: 50, y: 10 },
                    desc: '象征胜利与荣耀的月桂枝蔓。'
                },
                {
                    id: 'greek_shawl',
                    name: '古希腊垂褶挽披',
                    icon: 'lucide:feather',
                    type: 'shawl',
                    cost: 45,
                    scale: 1.2,
                    defaultPos: { x: 40, y: 35 },
                    desc: '搭在左肩自然下垂的典雅披帛。'
                }
            ],
            classic: [
                { id: 'pearl_row', name: '珍珠排饰', icon: 'lucide:circle-dot', type: 'button', cost: 0, scale: 1.0, defaultPos: { x: 50, y: 38 } },
                { id: 'lace_hem', name: '希腊几何回纹边', icon: 'lucide:flower-2', type: 'lace', cost: 25, scale: 1.0, defaultPos: { x: 50, y: 85 } }
            ]
        };

        this.currentCategory = 'fibula';
        this.draggingAccessoryId = null;
        this.dragOffset = { x: 0, y: 0 };

        this.initUI();
        this.setupOverlayDraggable();
    }

    initUI() {
        const catButtons = document.querySelectorAll('.decor-cat-btn');
        catButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                catButtons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.currentCategory = btn.dataset.cat;
                this.renderShelf();
                window.tailorAudio.playTapeTick(1.2);
            });
        });

        this.renderShelf();
    }

    renderShelf() {
        const shelf = document.getElementById('decorItemsShelf');
        if (!shelf) return;
        shelf.innerHTML = '';

        const items = this.itemsDatabase[this.currentCategory] || [];
        const attachedIds = (window.tailorStore.currentDress.accessories || []).map(a => a.id);

        items.forEach(item => {
            const isAttached = attachedIds.includes(item.id);
            const chip = document.createElement('div');
            chip.className = `decor-item-chip ${isAttached ? 'attached' : ''}`;
            chip.innerHTML = `
                <div class="decor-item-icon">
                    <span class="iconify" data-icon="${item.icon}"></span>
                </div>
                <div class="decor-item-name">${item.name}</div>
                <div style="font-size:10px; color:${item.cost > 0 ? 'var(--pink-primary)' : 'var(--text-muted)'}; font-weight:600;">
                    ${isAttached ? '已佩戴 · 可拖动' : (item.cost > 0 ? `${item.cost} 币` : '免费佩戴')}
                </div>
            `;

            chip.addEventListener('click', () => {
                this.toggleAccessory(item);
            });

            shelf.appendChild(chip);
        });

        this.renderDraggablePinsOnDress();
    }

    toggleAccessory(item) {
        let list = window.tailorStore.currentDress.accessories;
        const index = list.findIndex(a => a.id === item.id);

        if (index >= 0) {
            list.splice(index, 1);
            window.tailorAudio.playTapeSnap();
        } else {
            if (item.cost > 0) {
                if (window.tailorStore.state.coins < item.cost) {
                    alert(`金币不足！购买【${item.name}】需要 ${item.cost} 金币`);
                    return;
                }
                window.tailorStore.addCoins(-item.cost);
            }

            // 加入具有初始位置的配饰对象
            list.push({
                ...item,
                posPercent: { ...item.defaultPos }
            });
            window.tailorAudio.playAccessoryAttach();
        }

        this.renderShelf();
        window.tailorStore.emit('dress:updated', window.tailorStore.currentDress);
    }

    /**
     * 在人台视窗上方渲染可自由拖动的配饰手柄
     */
    renderDraggablePinsOnDress() {
        let overlay = document.getElementById('accessoriesDragOverlay');
        const stageContainer = document.getElementById('container3d');
        if (!stageContainer) return;

        if (!overlay) {
            overlay = document.createElement('div');
            overlay.id = 'accessoriesDragOverlay';
            overlay.className = 'accessories-drag-overlay';
            stageContainer.appendChild(overlay);
        }

        // 仅在配饰步骤 (Step 4) 激活显示
        const isDecorStep = window.tailorStore.currentStep === 4;
        overlay.style.display = isDecorStep ? 'block' : 'none';
        overlay.innerHTML = '';

        if (!isDecorStep) return;

        const list = window.tailorStore.currentDress.accessories || [];
        list.forEach((item, idx) => {
            const pinEl = document.createElement('div');
            pinEl.className = 'dress-accessory-pin';
            pinEl.dataset.id = item.id;
            pinEl.style.left = `${item.posPercent.x}%`;
            pinEl.style.top = `${item.posPercent.y}%`;

            pinEl.innerHTML = `
                <div class="pin-badge">
                    <span class="iconify" data-icon="${item.icon}"></span>
                </div>
                <div class="pin-tag-label">${item.name}</div>
                <button class="pin-remove-btn" title="卸下配饰">
                    <span class="iconify" data-icon="lucide:x"></span>
                </button>
            `;

            // 卸下配饰
            const btnRemove = pinEl.querySelector('.pin-remove-btn');
            if (btnRemove) {
                btnRemove.addEventListener('click', (e) => {
                    e.stopPropagation();
                    this.toggleAccessory(item);
                });
            }

            overlay.appendChild(pinEl);
        });
    }

    /**
     * 核心突破：让配饰在衣服上自由拖拽移动并支持肩腰智能磁吸
     */
    setupOverlayDraggable() {
        let activeTarget = null;
        let activeItem = null;
        let overlay = null;

        const onPointerDown = (e) => {
            overlay = document.getElementById('accessoriesDragOverlay');
            if (!overlay || window.tailorStore.currentStep !== 4) return;

            const pin = e.target.closest('.dress-accessory-pin');
            if (pin && !e.target.closest('.pin-remove-btn')) {
                activeTarget = pin;
                const id = pin.dataset.id;
                activeItem = (window.tailorStore.currentDress.accessories || []).find(a => a.id === id);
                if (activeItem) {
                    activeTarget.classList.add('is-dragging');
                    window.tailorAudio.initContext();
                    window.tailorAudio.playTapeTick(1.4);
                }
            }
        };

        const onPointerMove = (e) => {
            if (!activeTarget || !activeItem || !overlay) return;

            const rect = overlay.getBoundingClientRect();
            const clientX = e.clientX || (e.touches && e.touches[0].clientX) || 0;
            const clientY = e.clientY || (e.touches && e.touches[0].clientY) || 0;

            let pctX = ((clientX - rect.left) / rect.width) * 100;
            let pctY = ((clientY - rect.top) / rect.height) * 100;

            // 限制在人台视野范围内
            pctX = Math.max(10, Math.min(90, pctX));
            pctY = Math.max(8, Math.min(90, pctY));

            // 智能磁吸判断 (肩部别针吸附与腰带吸附)
            if (activeItem.type === 'fibula') {
                // 左肩磁吸区
                if (Math.hypot(pctX - 34, pctY - 22) < 8) {
                    pctX = 34; pctY = 22;
                    activeTarget.classList.add('snapped');
                } else if (Math.hypot(pctX - 66, pctY - 22) < 8) {
                    // 右肩磁吸区
                    pctX = 66; pctY = 22;
                    activeTarget.classList.add('snapped');
                } else {
                    activeTarget.classList.remove('snapped');
                }
            } else if (activeItem.type === 'belt') {
                // 腰线自然水平磁吸
                if (Math.abs(pctY - 52) < 6) {
                    pctY = 52;
                    pctX = 50;
                    activeTarget.classList.add('snapped');
                } else {
                    activeTarget.classList.remove('snapped');
                }
            }

            activeItem.posPercent.x = Math.round(pctX * 10) / 10;
            activeItem.posPercent.y = Math.round(pctY * 10) / 10;

            activeTarget.style.left = `${pctX}%`;
            activeTarget.style.top = `${pctY}%`;
        };

        const onPointerUp = () => {
            if (activeTarget) {
                activeTarget.classList.remove('is-dragging');
                if (activeTarget.classList.contains('snapped')) {
                    window.tailorAudio.playPerfectSnap();
                } else {
                    window.tailorAudio.playAccessoryAttach();
                }
                activeTarget = null;
                activeItem = null;
                window.tailorStore.emit('dress:updated', window.tailorStore.currentDress);
            }
        };

        window.addEventListener('mousedown', onPointerDown);
        window.addEventListener('mousemove', onPointerMove);
        window.addEventListener('mouseup', onPointerUp);

        window.addEventListener('touchstart', onPointerDown, { passive: true });
        window.addEventListener('touchmove', onPointerMove, { passive: true });
        window.addEventListener('touchend', onPointerUp);

        // 监听工序切换与裙子更新
        window.tailorStore.on('step:changed', () => {
            this.renderDraggablePinsOnDress();
        });
        window.tailorStore.on('dress:updated', () => {
            this.renderDraggablePinsOnDress();
        });
    }
}

window.AccessoriesSystem = AccessoriesSystem;
