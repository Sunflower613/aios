/**
 * 一起做裙子 (Let's Tailor!) - 拟真3D走秀台与摄影棚系统
 * 支持模特T台回旋步态、聚光灯调节、风速物理检验与拍立得快照
 */

class RunwayStudio {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        if (!this.canvas) return;

        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.modelGroup = null;
        this.dressMesh = null;
        this.spotLight = null;

        this.windStrength = 0.8;
        this.clock = new THREE.Clock();

        this.init();
    }

    init() {
        if (!window.THREE) return;

        const rect = this.canvas.parentElement.getBoundingClientRect();
        const width = rect.width || 800;
        const height = rect.height || 380;

        this.scene = new THREE.Scene();
        this.scene.fog = new THREE.FogExp2(0x0c1017, 0.08);

        this.camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
        this.camera.position.set(0, 1.3, 4.5);
        this.camera.lookAt(0, 0.8, 0);

        this.renderer = new THREE.WebGLRenderer({
            canvas: this.canvas,
            antialias: true,
            preserveDrawingBuffer: true
        });
        this.renderer.setSize(width, height);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.shadowMap.enabled = true;

        this.setupLights();
        this.setupRunwayStage();

        this.modelGroup = new THREE.Group();
        this.scene.add(this.modelGroup);

        this.setupEvents();

        this.animate = this.animate.bind(this);
        requestAnimationFrame(this.animate);
    }

    setupLights() {
        const ambient = new THREE.AmbientLight(0x223042, 0.6);
        this.scene.add(ambient);

        this.spotLight = new THREE.SpotLight(0xfff5e6, 2.2);
        this.spotLight.position.set(0, 5, 2.5);
        this.spotLight.angle = Math.PI / 5;
        this.spotLight.penumbra = 0.5;
        this.spotLight.castShadow = true;
        this.scene.add(this.spotLight);

        // 秀场霓虹背光
        const backNeon = new THREE.DirectionalLight(0x4287f5, 1.0);
        backNeon.position.set(0, 2, -4);
        this.scene.add(backNeon);
    }

    setupRunwayStage() {
        // T 台地板 (反光高定镜面漆黑木板)
        const stageGeo = new THREE.BoxGeometry(2.4, 0.2, 12);
        const stageMat = new THREE.MeshStandardMaterial({
            color: 0x111620,
            roughness: 0.2,
            metalness: 0.6
        });
        const stage = new THREE.Mesh(stageGeo, stageMat);
        stage.position.set(0, -0.6, 0);
        stage.receiveShadow = true;
        this.scene.add(stage);

        // T 台两侧发光地灯带
        const stripMat = new THREE.MeshBasicMaterial({ color: 0xc5a059 });
        const leftStrip = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.02, 12), stripMat);
        leftStrip.position.set(-1.18, -0.49, 0);
        const rightStrip = leftStrip.clone();
        rightStrip.position.x = 1.18;
        this.scene.add(leftStrip, rightStrip);
    }

    setupEvents() {
        // 灯光滤镜选择
        const selectLight = document.getElementById('selectRunwayLight');
        if (selectLight) {
            selectLight.addEventListener('change', (e) => {
                const val = e.target.value;
                if (val === 'spotlight') {
                    this.spotLight.color.setHex(0xfff5e6);
                    this.spotLight.intensity = 2.2;
                } else if (val === 'warm') {
                    this.spotLight.color.setHex(0xff8c42);
                    this.spotLight.intensity = 2.0;
                } else if (val === 'neon') {
                    this.spotLight.color.setHex(0x00f0ff);
                    this.spotLight.intensity = 2.4;
                }
                window.tailorAudio.playTapeTick(1.2);
            });
        }

        // 风速调节
        const sliderWind = document.getElementById('sliderRunwayWind');
        if (sliderWind) {
            sliderWind.addEventListener('input', (e) => {
                this.windStrength = parseFloat(e.target.value);
            });
        }

        // 拍照快门
        const btnSnap = document.getElementById('btnSnapPhoto');
        if (btnSnap) {
            btnSnap.addEventListener('click', () => {
                this.captureRunwayPhoto();
            });
        }
    }

    /**
     * 将当前制作好的裙子模型载入 T 台并附着于虚拟模特
     */
    loadDress(dress) {
        // 清理旧模型
        while (this.modelGroup.children.length > 0) {
            const child = this.modelGroup.children[0];
            this.modelGroup.remove(child);
            if (child.geometry) child.geometry.dispose();
            if (child.material) child.material.dispose();
        }

        const m = dress.mannequin;
        const f = dress.fabric;
        const hemY = -0.35 * m.length;

        // 模特优美体态与裙装网格
        const profilePoints = [
            new THREE.Vector2(0.08, 1.55),
            new THREE.Vector2(0.18 * m.shoulder, 1.40),
            new THREE.Vector2(0.24 * m.bust, 1.22),
            new THREE.Vector2(0.17 * m.waist, 0.95),
            new THREE.Vector2(0.26 * m.hips, 0.68),
            new THREE.Vector2(0.35 * m.hemWidth * 0.8, 0.15),
            new THREE.Vector2(0.48 * m.hemWidth, hemY)
        ];

        const geometry = new THREE.LatheGeometry(profilePoints, 48);
        const pos = geometry.attributes.position;
        geometry.userData = {
            originalPositions: new Float32Array(pos.array),
            hemY: hemY
        };

        const mat = new THREE.MeshStandardMaterial({
            color: new THREE.Color(f.color || '#ece6d8'),
            roughness: f.roughness || 0.7,
            metalness: f.metalness || 0.1,
            side: THREE.DoubleSide
        });

        this.dressMesh = new THREE.Mesh(geometry, mat);
        this.dressMesh.castShadow = true;
        this.modelGroup.add(this.dressMesh);

        // 模特头部素体剪影
        const headGeo = new THREE.SphereGeometry(0.12, 24, 24);
        const headMat = new THREE.MeshStandardMaterial({ color: 0xd9c5b2, roughness: 0.5 });
        const head = new THREE.Mesh(headGeo, headMat);
        head.position.y = 1.72;
        this.modelGroup.add(head);
    }

    /**
     * 拍照并生成设计师签名拍立得
     */
    captureRunwayPhoto() {
        window.tailorAudio.playTapeSnap();

        this.renderer.render(this.scene, this.camera);
        const base64 = this.canvas.toDataURL('image/png');

        // 保存到画册
        const dressName = window.tailorStore.currentDress.name;
        window.tailorStore.savePhotoToAlbum(base64, dressName);

        alert(`抓拍成功！已收录至【高定摄影画册】`);
    }

    animate() {
        requestAnimationFrame(this.animate);

        const delta = this.clock.getDelta();
        const time = this.clock.getElapsedTime();

        // 模特在 T 台前行的优雅律动与回旋
        if (this.modelGroup) {
            this.modelGroup.rotation.y = Math.sin(time * 0.6) * 0.45; // 慢速左右回眸
            this.modelGroup.position.y = Math.sin(time * 2.2) * 0.015; // 步伐微起伏
        }

        // 裙摆受风机吹拂的飘逸物理波浪
        if (this.dressMesh && this.dressMesh.geometry) {
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
                    const windWave = Math.sin(time * 5.0 + origY * 7 + origX * 5) * 0.04 * dist * this.windStrength;

                    pos.setXYZ(i, origX + windWave * 0.5, origY, origZ + windWave);
                }
                pos.needsUpdate = true;
            }
        }

        this.renderer.render(this.scene, this.camera);
    }
}
