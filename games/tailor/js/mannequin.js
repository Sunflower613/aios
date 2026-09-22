/**
 * 一起做裙子 (Let's Tailor!) - 3D 参数化人台与直接触控拉胚塑形模块
 * 包含：明亮清透高定布料光照、图2历史廓形放样、在人台上直接滑动调版型、金色控制环与毫米标尺
 */

class MannequinViewer {
    constructor(canvasId, containerId) {
        this.canvas = document.getElementById(canvasId);
        this.container = document.getElementById(containerId);

        this.scene = null;
        this.camera = null;
        this.renderer = null;

        this.mannequinGroup = null;
        this.dressMesh = null;
        this.standMesh = null;
        this.accessoriesGroup = null;

        // 触控拉胚塑形控制
        this.activeMoldingRing = null; // 实时高亮控制光环
        this.floatingMeasureLabel = null; // 浮动尺寸读数
        this.isMoldingTouch = false;
        this.moldingSection = null; // 'shoulder', 'bust', 'waist', 'hips', 'hemWidth'
        this.touchStartX = 0;
        this.touchStartY = 0;
        this.initialSectionValue = 1.0;

        // 旋转交互
        this.isRotating = false;
        this.previousMousePosition = { x: 0, y: 0 };
        this.targetRotationY = 0;
        this.autoRotate = false;

        // 微风物理
        this.windEnabled = true;
        this.windIntensity = 1.0;
        this.textureCache = new Map();
        this.clock = new THREE.Clock();

        this.init();
    }

    init() {
        if (!window.THREE) return;

        const width = this.container.clientWidth || window.innerWidth;
        const height = this.container.clientHeight || (window.innerHeight * 0.55);

        // 1. 场景
        this.scene = new THREE.Scene();

        // 2. 相机
        this.camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
        this.camera.position.set(0, 1.05, 4.4);
        this.camera.lookAt(0, 0.58, 0);

        // 3. 渲染器
        this.renderer = new THREE.WebGLRenderer({
            canvas: this.canvas,
            antialias: true,
            alpha: true,
            preserveDrawingBuffer: true
        });
        this.renderer.setSize(width, height);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

        // 4. 高定三点明亮光照系统 (彻底解决发黑暗泥)
        this.setupLighting();

        // 5. 构建人台与裙身
        this.mannequinGroup = new THREE.Group();
        this.accessoriesGroup = new THREE.Group();
        this.mannequinGroup.add(this.accessoriesGroup);
        this.scene.add(this.mannequinGroup);

        this.buildStand();
        this.buildMoldingRing();
        this.buildDressMesh(window.tailorStore.currentDress);

        // 6. 触控拉胚与交互事件
        this.setupTouchInteractions();

        // 7. 渲染循环
        this.animate = this.animate.bind(this);
        requestAnimationFrame(this.animate);

        window.tailorStore.on('dress:updated', (dress) => {
            this.updateDress(dress);
        });
    }

    /**
     * 高定清透漫射光照 (消除死黑，展现象牙白/粉金丝光)
     */
    setupLighting() {
        // 半球光：天花板暖粉白光 + 地面金粉反射光
        const hemiLight = new THREE.HemisphereLight(0xfff6f8, 0xf2e4e8, 1.45);
        hemiLight.position.set(0, 10, 0);
        this.scene.add(hemiLight);

        // 主光：前上方45度柔白聚光
        const mainDirLight = new THREE.DirectionalLight(0xfffaf0, 1.5);
        mainDirLight.position.set(2.5, 4.5, 3.2);
        mainDirLight.castShadow = true;
        mainDirLight.shadow.mapSize.width = 1024;
        mainDirLight.shadow.mapSize.height = 1024;
        mainDirLight.shadow.bias = -0.0005;
        this.scene.add(mainDirLight);

        // 侧向柔和补光：驱散暗面阴影
        const fillLight = new THREE.DirectionalLight(0xfce8ec, 1.0);
        fillLight.position.set(-3, 2, 2.5);
        this.scene.add(fillLight);

        // 轮廓光：突出面料边缘毛羽与织物细微折褶
        const rimLight = new THREE.DirectionalLight(0xffffff, 0.85);
        rimLight.position.set(0, 3, -3.5);
        this.scene.add(rimLight);

        // 承托地面
        const floorGeo = new THREE.CircleGeometry(2.4, 32);
        const floorMat = new THREE.ShadowMaterial({ opacity: 0.12 });
        const floor = new THREE.Mesh(floorGeo, floorMat);
        floor.rotation.x = -Math.PI / 2;
        floor.position.y = -0.55;
        floor.receiveShadow = true;
        this.scene.add(floor);
    }

    /**
     * 构建人台黄铜底座
     */
    buildStand() {
        const standGroup = new THREE.Group();

        // 典雅黄铜底座
        const baseGeo = new THREE.CylinderGeometry(0.32, 0.38, 0.05, 32);
        const brassMat = new THREE.MeshStandardMaterial({
            color: 0xd4af37,
            metalness: 0.8,
            roughness: 0.28
        });
        const base = new THREE.Mesh(baseGeo, brassMat);
        base.position.y = -0.52;
        base.castShadow = true;
        standGroup.add(base);

        // 金属支杆
        const poleGeo = new THREE.CylinderGeometry(0.022, 0.022, 1.85, 16);
        const pole = new THREE.Mesh(poleGeo, brassMat);
        pole.position.y = 0.38;
        pole.castShadow = true;
        standGroup.add(pole);

        // 顶部圆润黄铜端子
        const finial = new THREE.Mesh(new THREE.SphereGeometry(0.055, 16, 16), brassMat);
        finial.position.y = 1.62;
        standGroup.add(finial);

        this.standMesh = standGroup;
        this.mannequinGroup.add(standGroup);
    }

    /**
     * 构建触控拉胚时实时高亮的金色控制光环
     */
    buildMoldingRing() {
        const ringGeo = new THREE.TorusGeometry(0.28, 0.012, 16, 48);
        const ringMat = new THREE.MeshBasicMaterial({
            color: 0xd4af37,
            transparent: true,
            opacity: 0.0
        });
        this.activeMoldingRing = new THREE.Mesh(ringGeo, ringMat);
        this.activeMoldingRing.rotation.x = Math.PI / 2;
        this.activeMoldingRing.visible = false;
        this.mannequinGroup.add(this.activeMoldingRing);
    }

    /**
     * 依据用户《服装演化图》(图2) 重构参数化裙身几何网格
     */
    buildDressMesh(dressData) {
        if (this.dressMesh) {
            this.mannequinGroup.remove(this.dressMesh);
            if (this.dressMesh.geometry) this.dressMesh.geometry.dispose();
            if (this.dressMesh.material) this.dressMesh.material.dispose();
        }

        const m = dressData.mannequin;
        const sil = dressData.silhouette || 'a_line';
        const hemY = -0.32 * m.length;

        const isFitting = window.tailorStore.currentStep === 0;
        const profile = isFitting ? [
            { radius: .10, y: 1.55 }, { radius: .21 * m.shoulder, y: 1.38 },
            { radius: .23 * m.bust, y: 1.2 }, { radius: .18 * m.waist, y: .96 },
            { radius: .25 * m.hips, y: .68 }, { radius: .22 * m.hips, y: .42 }
        ] : window.tailorStore.getDressProfile(dressData);
        const points = window.tailorStore.smoothProfile(profile).map(p => new THREE.Vector2(p.radius, p.y));
        const geometry = new THREE.LatheGeometry(points, 64);

        // 注入图2中描述的立体自然重力折褶 (Drapery & Pleats)
        const posAttr = geometry.attributes.position;
        const vertex = new THREE.Vector3();

        geometry.userData = {
            originalPositions: new Float32Array(posAttr.array),
            hemY: hemY,
            sil: sil
        };

        for (let i = 0; i < posAttr.count; i++) {
            vertex.fromBufferAttribute(posAttr, i);
            const angle = Math.atan2(vertex.z, vertex.x);
            const heightRatio = Math.max(0, (1.1 - vertex.y) / (1.1 - hemY));

            let pleatCount = 14;
            let pleatAmp = 0.035;

            if (sil === 'chiton') {
                // 古希腊多立克细密垂直重力褶
                pleatCount = 20;
                pleatAmp = 0.025;
            } else if (sil === 'ballgown') {
                // 洛可可大波浪层叠褶
                pleatCount = 12;
                pleatAmp = 0.055;
            } else if (sil === 'mermaid') {
                pleatCount = 16;
                pleatAmp = heightRatio > 0.7 ? 0.06 : 0.015;
            }

            const pleatWave = isFitting ? 0 : Math.sin(angle * pleatCount) * pleatAmp * heightRatio;
            const radius = Math.sqrt(vertex.x * vertex.x + vertex.z * vertex.z);
            const newRadius = radius + pleatWave;

            vertex.x = Math.cos(angle) * newRadius;
            vertex.z = Math.sin(angle) * newRadius;
            posAttr.setXYZ(i, vertex.x, vertex.y, vertex.z);
        }

        geometry.computeVertexNormals(); // 平滑法线重算，告别死黑棱角！
        geometry.userData.originalPositions = new Float32Array(posAttr.array);

        const material = isFitting ? new THREE.MeshStandardMaterial({ color: '#dbc7a7', roughness: .92, side: THREE.DoubleSide }) : this.createFabricMaterial(dressData.fabric);

        this.dressMesh = new THREE.Mesh(geometry, material);
        this.dressMesh.castShadow = true;
        this.dressMesh.receiveShadow = true;
        this.mannequinGroup.add(this.dressMesh);
    }

    /**
     * 高定面料 PBR 材质 (清透象牙丝光，彻底拒绝暗黑，支持外部真实纹理)
     */
    createFabricMaterial(fabric) {
        let colorHex = fabric.color || '#faf7f2';
        if (colorHex === '#ece6d8' || colorHex === '#d8cbb5') {
            colorHex = '#faf7f2'; // 升级为透光象牙白
        }

        let roughness = fabric.roughness !== undefined ? fabric.roughness : 0.65;
        let metalness = fabric.metalness !== undefined ? fabric.metalness : 0.08;
        let opacity = 1.0;
        let transparent = false;

        if (fabric.id === 'silk') {
            roughness = 0.22;
            metalness = 0.28;
        } else if (fabric.id === 'velvet') {
            roughness = 0.85;
            metalness = 0.02;
        } else if (fabric.id === 'organza') {
            roughness = 0.28;
            opacity = 0.82;
            transparent = true;
        }

        const mat = new THREE.MeshStandardMaterial({
            color: new THREE.Color(colorHex),
            roughness: roughness,
            metalness: metalness,
            transparent: transparent,
            opacity: opacity,
            side: THREE.DoubleSide
        });

        // 引入真实外部材质贴图 (如白欧根纱、奶油米白人字纹粗织)
        if (fabric.textureUrl && window.THREE) {
            let texture = this.textureCache.get(fabric.textureUrl);
            if (!texture) {
                texture = new THREE.TextureLoader().load(fabric.textureUrl);
                texture.wrapS = THREE.RepeatWrapping;
                texture.wrapT = THREE.RepeatWrapping;
                texture.repeat.set(3.5, 3.5);
                this.textureCache.set(fabric.textureUrl, texture);
            }
            mat.map = texture;
        }

        return mat;
    }

    updateDress(dress) {
        this.buildDressMesh(dress);
        this.renderAccessories(dress.accessories);
    }

    renderAccessories(accessoriesList = []) {
        while (this.accessoriesGroup.children.length > 0) {
            const child = this.accessoriesGroup.children[0];
            this.accessoriesGroup.remove(child);
            if (child.geometry) child.geometry.dispose();
            if (child.material) child.material.dispose();
        }

        accessoriesList.forEach(item => {
            const mesh = this.createAccessoryMesh(item);
            if (mesh) this.accessoriesGroup.add(mesh);
        });
    }

    createAccessoryMesh(item) {
        const group = new THREE.Group();
        const goldMat = new THREE.MeshStandardMaterial({ color: 0xd4af37, metalness: 0.88, roughness: 0.22 });
        const bronzeMat = new THREE.MeshStandardMaterial({ color: 0xa87948, metalness: 0.75, roughness: 0.35 });
        const pearlMat = new THREE.MeshStandardMaterial({ color: 0xfffaf5, roughness: 0.15, metalness: 0.05 });
        const ropeMat = new THREE.MeshStandardMaterial({ color: 0xd4c2a5, roughness: 0.9, metalness: 0.02 });

        const m = window.tailorStore.currentDress.mannequin;
        const posPct = item.posPercent || item.defaultPos || { x: 50, y: 50 };

        // 将百分比坐标 (0-100) 映射为 3D 人台表面坐标
        // X: 50 为中心，范围约 -0.35 ~ 0.35
        const posX = ((posPct.x - 50) / 50) * 0.38;
        // Y: 顶部 10 为 1.62，底部 90 为 0.15
        const posY = 1.62 - (posPct.y / 100) * 1.50;

        if (item.type === 'fibula') {
            // 古希腊纤布拉别针：立体太阳圆盘与中央凸起凸纹
            const isGold = item.id === 'fibula_gold_disk';
            const curMat = isGold ? goldMat : bronzeMat;

            const diskGeo = new THREE.CylinderGeometry(0.045 * (item.scale || 1), 0.048 * (item.scale || 1), 0.012, 24);
            const disk = new THREE.Mesh(diskGeo, curMat);
            disk.rotation.x = Math.PI / 2;

            const bossGeo = new THREE.SphereGeometry(0.022, 16, 16);
            const boss = new THREE.Mesh(bossGeo, curMat);
            boss.position.z = 0.008;

            // 纤布拉弯钩别针 (后部)
            const pinGeo = new THREE.TorusGeometry(0.032, 0.005, 8, 24, Math.PI);
            const pin = new THREE.Mesh(pinGeo, curMat);
            pin.rotation.z = Math.PI;
            pin.position.z = -0.01;

            group.add(disk, boss, pin);
            group.position.set(posX, posY, 0.22);
        } else if (item.type === 'belt') {
            // 古希腊双股编织腰绳 (根据高度自动环绕腰围)
            const waistR = (0.18 * m.waist) + 0.025;
            const beltTorus = new THREE.Mesh(
                new THREE.TorusGeometry(waistR, 0.015, 12, 48),
                item.id === 'court_corset_belt' ? bronzeMat : ropeMat
            );
            beltTorus.rotation.x = Math.PI / 2;
            group.add(beltTorus);

            // 垂挂流苏绳结
            const knot = new THREE.Mesh(new THREE.SphereGeometry(0.022, 12, 12), ropeMat);
            knot.position.set(0, -0.01, waistR);
            const tassel = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.018, 0.22, 12), ropeMat);
            tassel.position.set(0, -0.12, waistR);
            group.add(knot, tassel);

            group.position.set(0, posY, 0);
        } else if (item.type === 'headwear') {
            // 阿波罗月桂发冠
            const crownRing = new THREE.Mesh(new THREE.TorusGeometry(0.14, 0.01, 12, 32), goldMat);
            crownRing.rotation.x = Math.PI / 2;
            group.add(crownRing);
            // 月桂金叶
            for (let i = 0; i < 8; i++) {
                const angle = (i / 8) * Math.PI * 2;
                const leaf = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.005, 0.04), goldMat);
                leaf.position.set(Math.cos(angle) * 0.14, 0.01, Math.sin(angle) * 0.14);
                leaf.rotation.y = -angle;
                group.add(leaf);
            }
            group.position.set(0, 1.62, 0);
        } else if (item.type === 'shawl') {
            // 古希腊垂褶挽披 (披在左肩)
            const shawlGeo = new THREE.CylinderGeometry(0.08, 0.16, 0.85, 16, 1, true, 0, Math.PI);
            const shawlMat = new THREE.MeshStandardMaterial({
                color: 0xf3e8dc,
                roughness: 0.7,
                side: THREE.DoubleSide
            });
            const shawl = new THREE.Mesh(shawlGeo, shawlMat);
            shawl.rotation.z = -0.15;
            shawl.position.set(-0.25, 0.95, 0.12);
            group.add(shawl);
        } else if (item.type === 'button') {
            for (let i = 0; i < 4; i++) {
                const pearl = new THREE.Mesh(new THREE.SphereGeometry(0.016, 16, 16), pearlMat);
                pearl.position.y = -i * 0.055;
                group.add(pearl);
            }
            group.position.set(posX, posY, 0.24);
        } else if (item.type === 'lace') {
            const lace = new THREE.Mesh(
                new THREE.TorusGeometry(0.48 * m.hemWidth, 0.022, 12, 64),
                new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.8, transparent: true, opacity: 0.85 })
            );
            lace.rotation.x = Math.PI / 2;
            lace.position.y = -0.32 * m.length;
            group.add(lace);
        }
        return group;
    }

    /**
     * 核心突破：在人台上直接滑动调版型 (陶艺拉胚触控交互)
     */
    setupTouchInteractions() {
        const raycaster = new THREE.Raycaster(), plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
        const worldPoint = e => {
            const rect = this.canvas.getBoundingClientRect();
            raycaster.setFromCamera(new THREE.Vector2((e.clientX - rect.left) / rect.width * 2 - 1, 1 - (e.clientY - rect.top) / rect.height * 2), this.camera);
            const point = new THREE.Vector3();
            return raycaster.ray.intersectPlane(plane, point);
        };
        this.canvas.addEventListener('pointerdown', e => {
            if (this.pointerId !== undefined) return;
            this.pointerId = e.pointerId; this.canvas.setPointerCapture(e.pointerId); e.preventDefault();
            const world = worldPoint(e);
            this.touchStartX = e.clientX;
            if (window.tailorStore.currentStep === 0 && world && Math.abs(world.x) < .55 && world.y >= .4 && world.y < 1.4) {
                const levels = [['bust', 1.2], ['waist', .96], ['hips', .68]];
                const section = levels.reduce((a, b) => Math.abs(world.y - a[1]) < Math.abs(world.y - b[1]) ? a : b);
                this.moldingSection = section[0]; this.isMoldingTouch = true;
                this.initialSectionValue = window.tailorStore.currentDress.measurements[this.moldingSection];
                this.showMoldingRing(section[1]);
                window.tailorAudio.initContext();
            } else { this.isRotating = true; this.previousMousePosition.x = e.clientX; }
        });
        this.canvas.addEventListener('pointermove', e => {
            if (e.pointerId !== this.pointerId) return;
            if (this.isMoldingTouch) window.tailorStore.setMeasurement(this.moldingSection, this.initialSectionValue + (e.clientX - this.touchStartX) * .08);
            else if (this.isRotating) { this.targetRotationY += (e.clientX - this.previousMousePosition.x) * .008; this.previousMousePosition.x = e.clientX; }
        });
        const release = () => { this.pointerId = undefined; this.isMoldingTouch = false; this.isRotating = false; this.hideMoldingRing(); };
        for (const event of ['pointerup', 'pointercancel', 'lostpointercapture']) this.canvas.addEventListener(event, release);
        window.addEventListener('blur', release);
        window.addEventListener('resize', () => {
            const width = this.container.clientWidth, height = this.container.clientHeight;
            if (!width || !height) return;
            this.camera.aspect = width / height; this.camera.updateProjectionMatrix(); this.renderer.setSize(width, height);
        });
    }

    /**
     * 在触控高度显示金色发光测量环
     */
    showMoldingRing(worldY) {
        if (!this.activeMoldingRing) return;
        this.activeMoldingRing.position.y = worldY;
        this.activeMoldingRing.visible = true;
        this.activeMoldingRing.material.opacity = 0.85;
    }

    hideMoldingRing() {
        if (!this.activeMoldingRing) return;
        this.activeMoldingRing.visible = false;
        this.activeMoldingRing.material.opacity = 0.0;
    }

    syncSliderUI(prop, val) {
        const propMap = {
            shoulder: { id: 'sliderShoulder', valId: 'valShoulder', base: 38, unit: 'cm' },
            bust:     { id: 'sliderBust',     valId: 'valBust',     base: 86, unit: 'cm' },
            waist:    { id: 'sliderWaist',    valId: 'valWaist',    base: 64, unit: 'cm' },
            hips:     { id: 'sliderHips',     valId: 'valHips',     base: 92, unit: 'cm' },
            hemWidth: { id: 'sliderHem',      valId: 'valHem',      base: 110, unit: 'cm' },
            length:   { id: 'sliderLength',   valId: 'valLength',   base: 95, unit: 'cm' }
        };
        const cfg = propMap[prop];
        if (cfg) {
            const input = document.getElementById(cfg.id);
            const text = document.getElementById(cfg.valId);
            if (input) input.value = val;
            if (text) text.innerText = `${(cfg.base * val).toFixed(1)} ${cfg.unit}`;
        }
    }

    resetView() {
        this.targetRotationY = 0;
        this.mannequinGroup.rotation.y = 0;
        this.camera.position.set(0, 1.05, 4.4);
        this.camera.lookAt(0, 0.58, 0);
    }

    toggleWind() {
        this.windEnabled = !this.windEnabled;
        if (!this.windEnabled && this.dressMesh) {
            const geometry = this.dressMesh.geometry;
            geometry.attributes.position.array.set(geometry.userData.originalPositions);
            geometry.attributes.position.needsUpdate = true;
        }
        return this.windEnabled;
    }

    animate() {
        requestAnimationFrame(this.animate);
        if (document.hidden || window.tailorStore.currentStep === 2 || window.tailorStore.currentStep === 3) return;

        const delta = this.clock.getDelta();
        const time = this.clock.getElapsedTime();

        if (this.mannequinGroup) {
            this.mannequinGroup.rotation.y += (this.targetRotationY - this.mannequinGroup.rotation.y) * 0.12;
            if (this.autoRotate) {
                this.targetRotationY += 0.005;
            }
        }

        // 裙摆微风物理流动
        if (window.tailorStore.currentStep !== 0 && this.windEnabled && this.dressMesh && this.dressMesh.geometry) {
            const geom = this.dressMesh.geometry;
            const pos = geom.attributes.position;
            const original = geom.userData.originalPositions;
            const hemY = geom.userData.hemY || -0.5;

            if (original) {
                for (let i = 0; i < pos.count; i++) {
                    const origX = original[i * 3];
                    const origY = original[i * 3 + 1];
                    const origZ = original[i * 3 + 2];

                    const dist = Math.max(0, (1.0 - origY) / (1.0 - hemY));
                    const wave = Math.sin(time * 3.8 + origY * 6 + origX * 4) * 0.02 * dist * this.windIntensity;

                    pos.setXYZ(i, origX + wave, origY, origZ + wave * 0.7);
                }
                pos.needsUpdate = true;
            }
        }

        this.renderer.render(this.scene, this.camera);
    }

    takeSnapshot() {
        this.renderer.render(this.scene, this.camera);
        return this.canvas.toDataURL('image/png');
    }
}
