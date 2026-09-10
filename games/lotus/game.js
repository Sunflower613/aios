/**
 * game.js - 「荷塘月色」视触觉小游戏主控制器
 * 协调物理刚体、动态水体光影、锦鲤 AI、触感震动与 Web Audio 合成音
 */

import { LotusAudio } from './audio.js';
import { LotusLeaf, LotusPhysicsSystem } from './physics.js';
import { KoiPondFishManager } from './fish.js';
import { WaterSystem } from './water.js';

export class MoonlitLotusGame {
  constructor() {
    this.canvas = document.getElementById('pondCanvas');
    this.ctx = this.canvas.getContext('2d');

    this.dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.width = 0;
    this.height = 0;

    // 子系统
    this.audio = new LotusAudio();
    this.physics = new LotusPhysicsSystem();
    this.fishManager = new KoiPondFishManager(6);
    this.water = new WaterSystem();

    // 触觉开关与状态
    this.hapticEnabled = true;
    this.currentTheme = 'moonlight';
    this.activePointerId = null;
    this.draggedLeaf = null;
    this.lastPointerX = 0;
    this.lastPointerY = 0;
    this.pointerVelX = 0;
    this.pointerVelY = 0;
    this.dragTrailTimer = 0;

    // 性能循环
    this.lastTime = performance.now();
    this.isPaused = false;

    // 双击判定计时
    this.lastTapTime = 0;

    this.init();
  }

  init() {
    this.handleResize();
    window.addEventListener('resize', () => this.handleResize());

    // 绑定物理碰撞回调
    this.physics.onCollision = (leafA, leafB, impactSpeed, hitX, hitY) => {
      this.handleLeafCollision(leafA, leafB, impactSpeed, hitX, hitY);
    };

    // 初始化荷叶群
    this.spawnLeaves();

    // 初始化小鱼与萤火虫
    this.fishManager.init(this.width, this.height);
    this.water.init(this.width, this.height);

    // 绑定指针与触控事件
    this.bindEvents();

    // 启动动画循环
    requestAnimationFrame((t) => this.loop(t));
  }

  handleResize() {
    const rect = this.canvas.parentElement.getBoundingClientRect();
    this.width = rect.width;
    this.height = rect.height;

    this.canvas.width = Math.floor(this.width * this.dpr);
    this.canvas.height = Math.floor(this.height * this.dpr);
    this.ctx.resetTransform?.();
    this.ctx.scale(this.dpr, this.dpr);

    if (this.physics.leaves.length === 0) {
      this.spawnLeaves();
    } else {
      // 屏幕尺寸缩放时保持荷叶在可视区域内
      for (const leaf of this.physics.leaves) {
        const margin = leaf.radius + 10;
        leaf.x = Math.max(margin, Math.min(this.width - margin, leaf.x));
        leaf.y = Math.max(margin, Math.min(this.height - margin, leaf.y));
      }
    }
  }

  /**
   * 生成散布在水面的多片荷叶（带部分荷花）
   */
  spawnLeaves() {
    const leaves = [];
    const minDim = Math.min(this.width, this.height);
    // 根据屏幕尺寸动态计算荷叶数量与半径
    const isSmallScreen = this.width < 600;
    const count = isSmallScreen ? 5 : 7;
    const baseRadius = Math.max(45, Math.min(75, minDim * 0.14));

    for (let i = 0; i < count; i++) {
      const radius = baseRadius * (0.8 + Math.random() * 0.42);
      // 分散在水面中心区域
      const angle = (i / count) * Math.PI * 2 + (Math.random() - 0.5) * 0.4;
      const dist = (0.2 + Math.random() * 0.3) * minDim;
      const x = Math.max(radius + 20, Math.min(this.width - radius - 20, this.width * 0.5 + Math.cos(angle) * dist));
      const y = Math.max(radius + 20, Math.min(this.height - radius - 20, this.height * 0.5 + Math.sin(angle) * dist));

      // 仅部分荷叶开放荷花
      const hasFlower = i === 1 || i === 3 || (i === 5 && !isSmallScreen);
      leaves.push(new LotusLeaf(i, x, y, radius, hasFlower));
    }

    this.physics.setLeaves(leaves);
  }

  /**
   * 触发设备轻微震动反馈
   * @param {number|number[]} pattern
   */
  triggerHaptic(pattern) {
    if (!this.hapticEnabled) return;
    try {
      if ('vibrate' in navigator) {
        navigator.vibrate(pattern);
      }
    } catch (e) {
      // 忽略部分浏览器对 vibrate 的策略限制
    }
  }

  /**
   * 荷叶碰撞处理逻辑
   */
  handleLeafCollision(leafA, leafB, impactSpeed, hitX, hitY) {
    // 1. 生成撞击光环涟漪与飞溅水花
    const intensity = Math.min(impactSpeed * 0.35 + 0.3, 1.5);
    this.water.addRipple(hitX, hitY, 130 + impactSpeed * 40, intensity);
    this.water.addSplash(hitX, hitY, Math.min(Math.floor(impactSpeed * 6) + 4, 18), impactSpeed * 0.8);

    // 2. 播放碰撞水声与五音泛音
    this.audio.playLeafCollision(Math.min(impactSpeed * 0.4, 1.0));

    // 3. 触觉震颤反馈
    if (impactSpeed > 0.8) {
      this.triggerHaptic([30, 20, 40]);
    } else {
      this.triggerHaptic(18);
    }

    // 4. 碰撞波浪震慑并吓跑附近游鱼
    const scared = this.fishManager.scareNearbyFish(hitX, hitY, 240 + impactSpeed * 60);
    if (scared) {
      this.audio.playFishEscape();
    }

    // 5. 显示轻微提示或诗意反馈
    this.showFloatingNote("波摇残月，叶击清漪", hitX, hitY);
  }

  /**
   * 绑定 Pointer 手势与点击事件
   */
  bindEvents() {
    const canvas = this.canvas;

    canvas.addEventListener('pointerdown', (e) => {
      e.preventDefault();
      canvas.setPointerCapture?.(e.pointerId);

      // 解锁音频环境
      this.audio.resume();

      const rect = canvas.getBoundingClientRect();
      const px = e.clientX - rect.left;
      const py = e.clientY - rect.top;

      const now = performance.now();
      const isDoubleTap = now - this.lastTapTime < 320;
      this.lastTapTime = now;

      // 双击投放鱼食彩蛋
      if (isDoubleTap) {
        this.fishManager.addFood(px, py);
        this.water.addRipple(px, py, 90, 0.6);
        this.audio.playWaterDrop(0.4);
        this.triggerHaptic(12);
        this.showFloatingNote("撒一抹素食，引群鱼逐波", px, py);
        return;
      }

      // 检查是否点中了某片荷叶
      let hitLeaf = null;
      // 从上到下倒序检索
      for (let i = this.physics.leaves.length - 1; i >= 0; i--) {
        const leaf = this.physics.leaves[i];
        if (leaf.contains(px, py)) {
          hitLeaf = leaf;
          break;
        }
      }

      if (hitLeaf) {
        // 捕获拖动该荷叶
        this.draggedLeaf = hitLeaf;
        this.activePointerId = e.pointerId;
        hitLeaf.isDragging = true;
        hitLeaf.dragOffsetX = hitLeaf.x - px;
        hitLeaf.dragOffsetY = hitLeaf.y - py;
        hitLeaf.vx = 0;
        hitLeaf.vy = 0;
        this.lastPointerX = px;
        this.lastPointerY = py;

        // 触碰荷叶轻微震动与微水纹
        this.triggerHaptic(14);
        this.water.addRipple(px, py, 80, 0.5);
      } else {
        // 点击了开阔水面：激起涟漪、飞溅水珠、吓跑小鱼、清脆水滴声
        this.water.addRipple(px, py, 170, 1.2);
        this.water.addSplash(px, py, 7, 0.8);
        this.audio.playWaterDrop(0.85);
        this.triggerHaptic(8);

        // 惊吓游鱼
        const scared = this.fishManager.scareNearbyFish(px, py, 210);
        if (scared) {
          this.audio.playFishEscape();
        }
      }
    });

    canvas.addEventListener('pointermove', (e) => {
      if (!this.draggedLeaf || e.pointerId !== this.activePointerId) return;
      e.preventDefault();

      const rect = canvas.getBoundingClientRect();
      const px = e.clientX - rect.left;
      const py = e.clientY - rect.top;

      // 记录手势速度用于松手时甩飞
      this.pointerVelX = px - this.lastPointerX;
      this.pointerVelY = py - this.lastPointerY;
      this.lastPointerX = px;
      this.lastPointerY = py;

      // 更新荷叶坐标
      this.draggedLeaf.x = px + this.draggedLeaf.dragOffsetX;
      this.draggedLeaf.y = py + this.draggedLeaf.dragOffsetY;
      this.draggedLeaf.vx = this.pointerVelX;
      this.draggedLeaf.vy = this.pointerVelY;

      // 拖拽过程中周期性产生划水波纹
      this.dragTrailTimer++;
      if (this.dragTrailTimer % 6 === 0) {
        const speed = Math.hypot(this.pointerVelX, this.pointerVelY);
        if (speed > 2.5) {
          this.water.addRipple(this.draggedLeaf.x, this.draggedLeaf.y, 90, 0.4);
          // 移动时也可以微扰驱散周围小鱼
          this.fishManager.scareNearbyFish(this.draggedLeaf.x, this.draggedLeaf.y, this.draggedLeaf.radius + 30);
        }
      }
    });

    const endDrag = (e) => {
      if (this.draggedLeaf && e.pointerId === this.activePointerId) {
        this.draggedLeaf.isDragging = false;
        // 赋予甩出的初速度与角动量
        this.draggedLeaf.vx = Math.max(-18, Math.min(18, this.pointerVelX * 1.3));
        this.draggedLeaf.vy = Math.max(-18, Math.min(18, this.pointerVelY * 1.3));
        this.draggedLeaf.vAngle = (this.pointerVelX - this.pointerVelY) * 0.002;

        const throwSpeed = Math.hypot(this.draggedLeaf.vx, this.draggedLeaf.vy);
        if (throwSpeed > 3.0) {
          this.water.addRipple(this.draggedLeaf.x, this.draggedLeaf.y, 140, 0.9);
          this.triggerHaptic(12);
        }

        this.draggedLeaf = null;
        this.activePointerId = null;
      }
    };

    canvas.addEventListener('pointerup', endDrag);
    canvas.addEventListener('pointercancel', endDrag);

    // 避免移动端下拉刷新或拖拽滚动
    canvas.addEventListener('touchmove', (e) => e.preventDefault(), { passive: false });
  }

  /**
   * 飘逸古风诗意微气泡文字
   */
  showFloatingNote(text, x, y) {
    const tipEl = document.getElementById('pondPoemTip');
    if (!tipEl) return;
    tipEl.textContent = text;
    tipEl.classList.add('visible');

    clearTimeout(this.tipTimeout);
    this.tipTimeout = setTimeout(() => {
      tipEl.classList.remove('visible');
    }, 2400);
  }

  /**
   * 投喂鱼食
   */
  feedFish() {
    this.audio.resume();
    for (let i = 0; i < 4; i++) {
      const x = this.width * 0.35 + Math.random() * (this.width * 0.3);
      const y = this.height * 0.35 + Math.random() * (this.height * 0.3);
      this.fishManager.addFood(x, y);
      this.water.addRipple(x, y, 70, 0.4);
    }
    this.audio.playWaterDrop(0.4);
    this.triggerHaptic(15);
    this.showFloatingNote("素饵入水，锦鲤竞聚", this.width * 0.5, this.height * 0.5);
  }

  /**
   * 重置荷叶与鱼群
   */
  resetPond() {
    this.audio.resume();
    this.spawnLeaves();
    this.fishManager.init(this.width, this.height); // 重新生成整池游鱼！
    this.water.addRipple(this.width * 0.5, this.height * 0.5, 260, 1.4);
    this.triggerHaptic([15, 30, 20]);
    this.audio.playWaterDrop(0.8);
    this.showFloatingNote("清风拂水，锦鲤荷叶尽归位", this.width * 0.5, this.height * 0.5);
  }

  /**
   * 切换音效静音
   */
  toggleAudio() {
    this.audio.resume();
    const isMuted = this.audio.toggleMute();
    return !isMuted;
  }

  /**
   * 切换触觉振动
   */
  toggleHaptic() {
    this.hapticEnabled = !this.hapticEnabled;
    if (this.hapticEnabled) {
      this.triggerHaptic(20);
    }
    return this.hapticEnabled;
  }

  /**
   * 切换视觉模式
   */
  switchTheme(theme) {
    this.currentTheme = theme;
    this.water.setTheme(theme);

    if (theme === 'dawn') {
      this.showFloatingNote("淡蓝碧水，温润旭日暖晨光", this.width * 0.5, this.height * 0.5);
    } else if (theme === 'ink') {
      this.showFloatingNote("素白水色，焦墨黑日染浅波", this.width * 0.5, this.height * 0.5);
    } else {
      this.showFloatingNote("月华清冷，流萤飞舞动清池", this.width * 0.5, this.height * 0.5);
    }

    this.water.addRipple(this.width * 0.5, this.height * 0.5, 200, 1.0);
    this.audio.playWaterDrop(0.6);
  }

  /**
   * 主渲染与物理更新循环
   */
  loop(currentTime) {
    const dt = Math.min((currentTime - this.lastTime) / 1000, 0.1);
    this.lastTime = currentTime;

    if (!this.isPaused) {
      // 1. 物理更新
      this.physics.update(dt, this.width, this.height);
      this.fishManager.update(this.width, this.height);
      this.water.update(this.width, this.height);

      // 2. 渲染分层
      this.ctx.clearRect(0, 0, this.width, this.height);

      // 2.1 底层：夜色/晨曦/水墨背景与天体
      this.water.drawBackground(this.ctx, this.width, this.height);

      // 2.2 水下游鱼层：锦鲤在水面下受到波面梯度实时物理折射！
      this.fishManager.draw(this.ctx, this.currentTheme, this.water);

      // 2.3 水面层：荷叶实体、露珠、盛放睡莲
      for (const leaf of this.physics.leaves) {
        leaf.draw(this.ctx, this.currentTheme);
      }

      // 2.4 水面波纹层：点击水面与碰撞扩散的涟漪、飞溅水珠
      this.water.drawSurface(this.ctx);

      // 2.5 空气顶层：空中摇曳的荧光流萤/朝阳金尘/水墨游丝
      this.water.drawOverhead(this.ctx);
    }

    requestAnimationFrame((t) => this.loop(t));
  }
}
