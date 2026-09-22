/**
 * 一起做裙子 (Let's Tailor!) - 面料质感与色彩系统
 * 涵盖6大时代面料、物理特性参数、手感白噪音与调色盘
 */

class FabricSystem {
    constructor() {
        // 6 大经典面料配置库 (接入真实外部材质图片)
        this.fabricLibrary = [
            {
                id: 'linen',
                name: '古希腊手织原麻',
                era: '古典第一篇章',
                cost: 0,
                color: '#faf7f0',
                textureUrl: 'assets/textures/fabric_knit_chevron_cream.jpg',
                roughness: 0.72,
                metalness: 0.04,
                stiffness: 0.65,
                desc: '粗梳原麻人字织纹，透气微凉，重力垂坠感极佳。',
                swatchCss: "url('assets/textures/fabric_knit_chevron_cream.jpg')"
            },
            {
                id: 'organza',
                name: '古希腊薄纱欧根纱',
                era: '古典与现代通用',
                cost: 0,
                color: '#ffffff',
                textureUrl: 'assets/textures/fabric_organza_white.jpg',
                roughness: 0.28,
                metalness: 0.12,
                stiffness: 0.45,
                desc: '透光柔白轻纱，如晨雾拂面，随风飘逸流淌。',
                swatchCss: "url('assets/textures/fabric_organza_white.jpg')"
            },
            {
                id: 'cotton',
                name: '象牙白编织纯棉',
                era: '古典工坊经典',
                cost: 0,
                color: '#f6f3eb',
                textureUrl: 'assets/textures/fabric_knit_cable_white.jpg',
                roughness: 0.82,
                metalness: 0.02,
                stiffness: 0.75,
                desc: '象牙白密织肌理，挺括柔和，天然棉线清香。',
                swatchCss: "url('assets/textures/fabric_knit_cable_white.jpg')"
            },
            {
                id: 'rope_linen',
                name: '原色粗麻绳织',
                era: '古希腊系带专用',
                cost: 25,
                color: '#e2d3be',
                textureUrl: 'assets/textures/fabric_rope_cable_beige.jpg',
                roughness: 0.90,
                metalness: 0.05,
                stiffness: 0.85,
                desc: '原生态手搓麻绳纹理，质朴有力。',
                swatchCss: "url('assets/textures/fabric_rope_cable_beige.jpg')"
            },
            {
                id: 'silk',
                name: '流光暗纹真丝',
                era: '黄金剪裁期',
                cost: 60,
                color: '#f9f6f0',
                textureUrl: 'assets/textures/fabric_weave_dark.jpg',
                roughness: 0.25,
                metalness: 0.22,
                stiffness: 0.35,
                desc: '如流水般顺滑贴身，斜裁时拥有如液体般流动的下垂感。',
                swatchCss: "url('assets/textures/fabric_weave_dark.jpg')"
            },
            {
                id: 'velvet',
                name: '皇家密织天鹅绒',
                era: '宫廷繁复期',
                cost: 90,
                color: '#4a1525',
                textureUrl: 'assets/textures/fabric_long_pile.jpg',
                roughness: 0.92,
                metalness: 0.02,
                stiffness: 0.85,
                desc: '浓郁深邃吸光绒毛质感，受光处泛出高贵光晕。',
                swatchCss: "url('assets/textures/fabric_long_pile.jpg')"
            }
        ];

        // 高定经典色盘
        this.colorPalette = [
            { name: '象牙法白', hex: '#f6f3eb' },
            { name: '古典羊皮纸', hex: '#d6c6ad' },
            { name: '晨曦暖杏', hex: '#f8eee2' },
            { name: '凡尔赛酒红', hex: '#631d2b' },
            { name: '鼠尾草淡绿', hex: '#7b8d76' },
            { name: '法式裸粉', hex: '#dfb4aa' },
            { name: '香槟淡金', hex: '#d4b77f' },
            { name: '曜石酷黑', hex: '#1e1c1b' }
        ];

        this.initUI();
    }

    initUI() {
        const shelf = document.getElementById('fabricShelfContainer');
        const colorDots = document.getElementById('colorDotsContainer');
        if (!shelf || !colorDots) return;

        // 渲染面料卡片
        shelf.innerHTML = '';
        const currentFabricId = window.tailorStore.currentDress.fabric.id;

        this.fabricLibrary.forEach(fab => {
            const isUnlocked = window.tailorStore.state.unlockedFabrics.includes(fab.id) || fab.cost === 0;
            const card = document.createElement('div');
            card.className = `fabric-card-item ${fab.id === currentFabricId ? 'active' : ''} ${!isUnlocked ? 'locked' : ''}`;
            card.dataset.id = fab.id;

            card.innerHTML = `
                <div class="fabric-swatch-preview" style="background-image: ${fab.swatchCss}; background-size: cover; background-position: center;">
                    ${!isUnlocked ? `<span style="font-size: 11px; background: rgba(42,31,36,0.75); border-radius:12px; padding:3px 8px; color:#fff; font-weight:700;">${fab.cost} 币</span>` : ''}
                </div>
                <div class="fabric-card-title">${fab.name}</div>
                <div class="fabric-card-prop">${fab.era} · ${fab.desc.slice(0, 18)}...</div>
            `;

            // 手指/鼠标划过体验布料沙沙摩擦音效
            let lastX = 0;
            card.addEventListener('pointerenter', (e) => {
                lastX = e.clientX;
                window.tailorAudio.playFabricRub(fab.id, 1.0);
            });
            card.addEventListener('pointermove', (e) => {
                const speed = Math.min(2.0, Math.max(0.4, Math.abs(e.clientX - lastX) / 10));
                lastX = e.clientX;
                if (Math.random() < 0.25) {
                    window.tailorAudio.playFabricRub(fab.id, speed);
                }
            });

            // 点击选中面料
            card.addEventListener('click', () => {
                this.selectFabric(fab, card);
            });

            shelf.appendChild(card);
        });

        // 渲染色盘圆点
        colorDots.innerHTML = '';
        const currentColor = window.tailorStore.currentDress.fabric.color;

        this.colorPalette.forEach(col => {
            const dot = document.createElement('div');
            dot.className = `color-dot ${col.hex.toLowerCase() === currentColor.toLowerCase() ? 'active' : ''}`;
            dot.style.backgroundColor = col.hex;
            dot.title = col.name;

            dot.addEventListener('click', () => {
                document.querySelectorAll('.color-dot').forEach(d => d.classList.remove('active'));
                dot.classList.add('active');

                window.tailorStore.currentDress.fabric.color = col.hex;
                window.tailorAudio.playTapeTick(1.3);
                window.tailorStore.emit('dress:updated', window.tailorStore.currentDress);
            });

            colorDots.appendChild(dot);
        });
    }

    selectFabric(fabricConfig, cardElement) {
        const isUnlocked = window.tailorStore.state.unlockedFabrics.includes(fabricConfig.id) || fabricConfig.cost === 0;

        // 如果未解锁，提示消耗金币购买
        if (!isUnlocked) {
            if (window.tailorStore.state.coins >= fabricConfig.cost) {
                if (confirm(`是否花费 ${fabricConfig.cost} 金币采购珍稀面料【${fabricConfig.name}】？`)) {
                    window.tailorStore.addCoins(-fabricConfig.cost);
                    window.tailorStore.state.unlockedFabrics.push(fabricConfig.id);
                    window.tailorStore.saveToStorage();
                    window.tailorAudio.playPerfectSnap();
                    this.initUI();
                }
            } else {
                alert(`金币不足！需要 ${fabricConfig.cost} 金币，可通过完成订单或拍卖裙子获取金币。`);
            }
            return;
        }

        // 切换面料
        document.querySelectorAll('.fabric-card-item').forEach(c => c.classList.remove('active'));
        if (cardElement) cardElement.classList.add('active');

        window.tailorStore.currentDress.fabric.id = fabricConfig.id;
        window.tailorStore.currentDress.fabric.name = fabricConfig.name;
        window.tailorStore.currentDress.fabric.roughness = fabricConfig.roughness;
        window.tailorStore.currentDress.fabric.metalness = fabricConfig.metalness;
        window.tailorStore.currentDress.fabric.stiffness = fabricConfig.stiffness;
        window.tailorStore.currentDress.fabric.textureUrl = fabricConfig.textureUrl || null;

        window.tailorAudio.playFabricRub(fabricConfig.id, 1.4);
        window.tailorStore.emit('dress:updated', window.tailorStore.currentDress);
    }
}
