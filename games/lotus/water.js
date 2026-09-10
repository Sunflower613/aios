/**
 * water.js - 荷塘水体波动、柔和物理折射场、水中天体倒影与流萤系统
 * 具备基于波面梯度斜率的光学折射场 (Refraction Normal Field)，
 * 支持水下锦鲤、水中日月倒影在水波经过时的柔和折射扭曲与碎光焦散。
 */

export class WaterSplashParticle {
  constructor(x, y, vx, vy, theme = 'moonlight') {
    this.x = x;
    this.y = y;
    this.vx = vx;
    this.vy = vy;
    this.theme = theme;
    this.life = 1.0;
    this.decay = 0.035 + Math.random() * 0.03;
    this.radius = 1.5 + Math.random() * 2.2;
  }

  update() {
    this.x += this.vx;
    this.y += this.vy;
    this.vy += 0.12; // 重力
    this.vx *= 0.94;
    this.vy *= 0.94;
    this.life -= this.decay;
  }

  draw(ctx) {
    if (this.life <= 0) return;
    ctx.save();
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius * this.life, 0, Math.PI * 2);

    if (this.theme === 'dawn') {
      ctx.fillStyle = `rgba(186, 230, 253, ${this.life * 0.9})`;
    } else if (this.theme === 'ink') {
      ctx.fillStyle = `rgba(100, 116, 139, ${this.life * 0.65})`;
    } else {
      ctx.fillStyle = `rgba(186, 230, 253, ${this.life * 0.85})`;
    }
    ctx.fill();
    ctx.restore();
  }
}

export class WaterRipple {
  constructor(x, y, maxRadius = 170, intensity = 1.0, theme = 'moonlight') {
    this.x = x;
    this.y = y;
    this.maxRadius = maxRadius;
    this.intensity = intensity;
    this.theme = theme;
    this.currentRadius = 2;
    this.life = 1.0;
    this.speed = 2.4 + intensity * 1.3;
    this.wavelength = 32 + intensity * 12; // 波前影响波长带宽
  }

  update() {
    this.currentRadius += this.speed;
    this.life = Math.max(0, 1 - (this.currentRadius / this.maxRadius));
    return this.life > 0;
  }

  /**
   * 计算水波在特定点 (px, py) 产生的物理法线梯度折射位移
   * @param {number} px
   * @param {number} py
   * @returns {{dx: number, dy: number}}
   */
  getRefractionAt(px, py) {
    const rx = px - this.x;
    const ry = py - this.y;
    const dist = Math.hypot(rx, ry);
    if (dist < 1) return { dx: 0, dy: 0 };

    const diff = dist - this.currentRadius;
    if (Math.abs(diff) < this.wavelength) {
      // 真实波动余弦包络斜率 (波面一阶导数)
      const phase = (diff / this.wavelength) * Math.PI;
      const envelope = (1 + Math.cos(phase)) * 0.5; // Hanning 窗平滑衰减
      // 凸起波峰汇聚光线，波谷发散光线
      const slope = -Math.sin(phase) * envelope * this.life * this.intensity;
      const factor = slope * 18.0; // 折射率位移系数

      return {
        dx: (rx / dist) * factor,
        dy: (ry / dist) * factor
      };
    }
    return { dx: 0, dy: 0 };
  }

  draw(ctx) {
    if (this.life <= 0) return;
    ctx.save();

    const alpha = this.life * this.intensity * 0.75;

    if (this.theme === 'dawn') {
      // 晨曦淡蓝清波折射光环
      // 1. 波谷微暗折射带
      ctx.beginPath();
      ctx.arc(this.x, this.y, Math.max(1, this.currentRadius - 3.5), 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(56, 189, 248, ${alpha * 0.35})`;
      ctx.lineWidth = 3.5;
      ctx.stroke();

      // 2. 聚光波峰明亮反射环
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.currentRadius, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(254, 240, 138, ${alpha * 0.8})`;
      ctx.lineWidth = 2.2;
      ctx.stroke();

      // 3. 次级回荡环
      if (this.currentRadius > 30) {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.currentRadius * 0.72, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(255, 255, 255, ${alpha * 0.4})`;
        ctx.lineWidth = 1.4;
        ctx.stroke();
      }
    } else if (this.theme === 'ink') {
      // 墨韵水墨浅灰折射水纹
      // 1. 浅灰波谷阴影
      ctx.beginPath();
      ctx.arc(this.x, this.y, Math.max(1, this.currentRadius - 3), 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(148, 163, 184, ${alpha * 0.32})`;
      ctx.lineWidth = 3.2;
      ctx.stroke();

      // 2. 浅灰微澜波峰
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.currentRadius, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(100, 116, 139, ${alpha * 0.65})`;
      ctx.lineWidth = 2.0;
      ctx.stroke();

      // 3. 次级晕染环
      if (this.currentRadius > 30) {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.currentRadius * 0.72, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(203, 213, 225, ${alpha * 0.35})`;
        ctx.lineWidth = 1.2;
        ctx.stroke();
      }
    } else {
      // 月夜幽蓝聚光波环
      // 1. 暗色凹折射环
      ctx.beginPath();
      ctx.arc(this.x, this.y, Math.max(1, this.currentRadius - 3.5), 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(2, 24, 28, ${alpha * 0.65})`;
      ctx.lineWidth = 3.6;
      ctx.stroke();

      // 2. 凸透镜波峰聚光亮环
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.currentRadius, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(125, 211, 252, ${alpha * 0.95})`;
      ctx.lineWidth = 2.2;
      ctx.stroke();

      // 3. 次级回荡环
      if (this.currentRadius > 30) {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.currentRadius * 0.72, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(186, 230, 253, ${alpha * 0.45})`;
        ctx.lineWidth = 1.4;
        ctx.stroke();
      }
    }

    ctx.restore();
  }
}

export class AtmosphereParticle {
  constructor(width, height) {
    this.reset(width, height, true);
  }

  reset(width, height, randomLife = false) {
    this.x = Math.random() * width;
    this.y = Math.random() * height;
    this.vx = (Math.random() - 0.5) * 0.5;
    this.vy = (Math.random() - 0.5) * 0.5;
    this.baseRadius = 1.2 + Math.random() * 2.0;
    this.phase = randomLife ? Math.random() * Math.PI * 2 : 0;
    this.glowSpeed = 0.025 + Math.random() * 0.035;
  }

  update(width, height, theme = 'moonlight') {
    this.phase += this.glowSpeed;

    if (theme === 'dawn') {
      this.x += this.vx + 0.25 + Math.sin(this.phase) * 0.15;
      this.y += this.vy + Math.cos(this.phase * 0.7) * 0.15;
    } else {
      this.x += this.vx + Math.sin(this.phase) * 0.2;
      this.y += this.vy + Math.cos(this.phase * 0.8) * 0.2;
    }

    if (this.x < -20) this.x = width + 20;
    if (this.x > width + 20) this.x = -20;
    if (this.y < -20) this.y = height + 20;
    if (this.y > height + 20) this.y = -20;
  }

  draw(ctx, theme = 'moonlight') {
    const glow = (Math.sin(this.phase) + 1) * 0.5;
    const r = this.baseRadius * (0.8 + glow * 0.6);

    ctx.save();
    if (theme === 'dawn') {
      // 晨曦金色浮尘
      const grad = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, r * 3.5);
      grad.addColorStop(0, `rgba(254, 240, 138, ${0.9 * glow})`);
      grad.addColorStop(0.4, `rgba(249, 115, 22, ${0.3 * glow})`);
      grad.addColorStop(1, 'rgba(249, 115, 22, 0)');
      ctx.beginPath();
      ctx.arc(this.x, this.y, r * 3.5, 0, Math.PI * 2);
      ctx.fillStyle = grad;
      ctx.fill();

      ctx.beginPath();
      ctx.arc(this.x, this.y, r * 0.8, 0, Math.PI * 2);
      ctx.fillStyle = '#fffbeb';
      ctx.fill();
    } else if (theme === 'ink') {
      // 水墨烟雨飞沫 (浅灰素雅)
      ctx.beginPath();
      ctx.arc(this.x, this.y, r * 1.2, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(100, 116, 139, ${0.25 + glow * 0.25})`;
      ctx.fill();
    } else {
      // 月夜夏夜流萤 (黄绿荧光)
      const grad = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, r * 4.2);
      grad.addColorStop(0, `rgba(217, 249, 157, ${0.9 * glow})`);
      grad.addColorStop(0.4, `rgba(163, 230, 53, ${0.4 * glow})`);
      grad.addColorStop(1, 'rgba(163, 230, 53, 0)');
      ctx.beginPath();
      ctx.arc(this.x, this.y, r * 4.2, 0, Math.PI * 2);
      ctx.fillStyle = grad;
      ctx.fill();

      ctx.beginPath();
      ctx.arc(this.x, this.y, r, 0, Math.PI * 2);
      ctx.fillStyle = '#fef08a';
      ctx.fill();
    }
    ctx.restore();
  }
}

export class WaterSystem {
  constructor() {
    this.ripples = [];
    this.splashes = [];
    this.particles = [];
    this.time = 0;
    this.theme = 'moonlight'; // 'moonlight' | 'dawn' | 'ink'
  }

  init(width, height) {
    this.particles = [];
    const count = Math.min(Math.floor((width * height) / 28000), 50);
    for (let i = 0; i < count; i++) {
      this.particles.push(new AtmosphereParticle(width, height));
    }
  }

  setTheme(themeName) {
    this.theme = themeName;
  }

  addRipple(x, y, maxRadius = 160, intensity = 1.0) {
    if (this.ripples.length > 30) {
      this.ripples.shift();
    }
    this.ripples.push(new WaterRipple(x, y, maxRadius, intensity, this.theme));
  }

  addSplash(x, y, count = 10, speedMultiplier = 1.0) {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = (1.5 + Math.random() * 3.5) * speedMultiplier;
      const vx = Math.cos(angle) * speed;
      const vy = Math.sin(angle) * speed - 1.2;
      this.splashes.push(new WaterSplashParticle(x, y, vx, vy, this.theme));
    }
  }

  /**
   * 获取全场任意一点 (px, py) 由于水波产生的综合光学折射偏移向量
   * @param {number} px
   * @param {number} py
   * @returns {{dx: number, dy: number}}
   */
  getRefractionOffset(px, py) {
    let totalDx = 0;
    let totalDy = 0;

    // 1. 活跃涟漪折射累加 (波面导数斜率投影)
    const count = this.ripples.length;
    for (let i = 0; i < count; i++) {
      const rip = this.ripples[i];
      const refr = rip.getRefractionAt(px, py);
      totalDx += refr.dx;
      totalDy += refr.dy;
    }

    // 2. 荷塘自然环境微波涟漪扰动 (柔和多频正弦叠加)
    const wave1 = px * 0.015 + py * 0.01 + this.time * 1.4;
    const wave2 = px * 0.008 - py * 0.018 - this.time * 1.1;
    totalDx += Math.sin(wave1) * 1.6 + Math.cos(wave2) * 1.1;
    totalDy += Math.cos(wave1) * 1.5 + Math.sin(wave2) * 1.2;

    return { dx: totalDx, dy: totalDy };
  }

  update(width, height) {
    this.time += 0.02;

    // 更新涟漪
    for (let i = this.ripples.length - 1; i >= 0; i--) {
      if (!this.ripples[i].update()) {
        this.ripples.splice(i, 1);
      }
    }

    // 更新水花
    for (let i = this.splashes.length - 1; i >= 0; i--) {
      const sp = this.splashes[i];
      sp.update();
      if (sp.life <= 0) {
        this.splashes.splice(i, 1);
      }
    }

    // 更新环境微粒
    for (const p of this.particles) {
      p.update(width, height, this.theme);
    }
  }

  /**
   * 渲染三大场景的专属背景、天空天体与水面折射倒影
   */
  drawBackground(ctx, width, height) {
    ctx.save();

    if (this.theme === 'dawn') {
      this.drawDawnScene(ctx, width, height);
    } else if (this.theme === 'ink') {
      this.drawInkScene(ctx, width, height);
    } else {
      this.drawMoonlightScene(ctx, width, height);
    }

    // 绘制随水波自然折射起伏的水面粼粼微光（绝无多余圆形倒影，纯粹柔和水波光影）
    this.drawWaterLightShimmer(ctx, width, height);

    ctx.restore();
  }

  /**
   * 绘制受实时水面法线物理折射的闭合圆形/椭圆轮廓路径
   * 水面平静时为圆润倒影，涟漪荡过时随波峰波谷自然产生真实的折射拉伸、扭曲与波动
   */
  buildRefractedPath(ctx, centerX, centerY, radiusX, radiusY = radiusX, segments = 72, scale = 1.8) {
    ctx.beginPath();
    for (let i = 0; i <= segments; i++) {
      const theta = (i / segments) * Math.PI * 2;
      const ox = centerX + Math.cos(theta) * radiusX;
      const oy = centerY + Math.sin(theta) * radiusY;
      const refr = this.getRefractionOffset(ox, oy);
      const rx = ox + refr.dx * scale;
      const ry = oy + refr.dy * scale;
      if (i === 0) {
        ctx.moveTo(rx, ry);
      } else {
        ctx.lineTo(rx, ry);
      }
    }
    ctx.closePath();
  }

  /**
   * 计算中心点的实时水波法线折射偏移
   */
  getRefractedCenter(centerX, centerY, scale = 1.8) {
    const refr = this.getRefractionOffset(centerX, centerY);
    return {
      x: centerX + refr.dx * scale,
      y: centerY + refr.dy * scale
    };
  }

  /**
   * 日/月水中倒影内部穿透的水波微澜折射纹理
   */
  drawRefractedInnerTexture(ctx, cx, cy, r, strokeStyle) {
    ctx.save();
    this.buildRefractedPath(ctx, cx, cy, r, r, 64, 1.8);
    ctx.clip();

    const lines = 7;
    for (let l = -lines; l <= lines; l++) {
      const offsetY = (l / lines) * (r * 0.85);
      const y0 = cy + offsetY;
      const span = Math.sqrt(Math.max(0, r * r - offsetY * offsetY));
      if (span < 6) continue;

      ctx.beginPath();
      const segs = 16;
      let started = false;
      for (let s = 0; s <= segs; s++) {
        const u = s / segs;
        const ox = cx - span + u * (span * 2);
        const oy = y0;
        const refr = this.getRefractionOffset(ox, oy);
        const wave = Math.sin(this.time * 2.2 + l * 0.8 + u * 4.0) * 1.5;
        const px = ox + refr.dx * 1.6;
        const py = oy + refr.dy * 1.6 + wave;
        if (!started) {
          ctx.moveTo(px, py);
          started = true;
        } else {
          ctx.lineTo(px, py);
        }
      }
      ctx.strokeStyle = strokeStyle;
      ctx.lineWidth = 1.1;
      ctx.stroke();
    }
    ctx.restore();
  }

  /**
   * 水墨太阳飞白折射外环
   */
  drawRefractedInkArc(ctx, cx, cy, r, startAngle, endAngle, strokeStyle, lineWidth) {
    ctx.save();
    ctx.beginPath();
    const segments = 40;
    let started = false;
    for (let i = 0; i <= segments; i++) {
      const theta = startAngle + (i / segments) * (endAngle - startAngle);
      const ox = cx + Math.cos(theta) * r;
      const oy = cy + Math.sin(theta) * r;
      const refr = this.getRefractionOffset(ox, oy);
      const px = ox + refr.dx * 1.8;
      const py = oy + refr.dy * 1.8;
      if (!started) {
        ctx.moveTo(px, py);
        started = true;
      } else {
        ctx.lineTo(px, py);
      }
    }
    ctx.strokeStyle = strokeStyle;
    ctx.lineWidth = lineWidth;
    ctx.stroke();
    ctx.restore();
  }

  /**
   * 水墨印章在水中的微澜折射
   */
  drawRefractedSeal(ctx, baseLeft, baseTop) {
    ctx.save();
    const sealRefr = this.getRefractionOffset(baseLeft + 10, baseTop + 10);
    const x = baseLeft + sealRefr.dx * 1.6;
    const y = baseTop + sealRefr.dy * 1.6;

    ctx.fillStyle = 'rgba(225, 29, 72, 0.92)';
    ctx.fillRect(x, y, 20, 20);
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1.2;
    ctx.strokeRect(x + 2, y + 2, 16, 16);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 11px "STKaiti", "KaiTi", serif';
    ctx.fillText('荷', x + 4.5, y + 14.5);
    ctx.restore();
  }

  /**
   * 🌙 场景一：经典月夜 (俯视水面，池中唯有一轮倒映的清冷明月，受水波实时折射)
   */
  drawMoonlightScene(ctx, width, height) {
    // 1. 深水墨蓝渐变水体
    const bgGrad = ctx.createLinearGradient(0, 0, 0, height);
    bgGrad.addColorStop(0, '#03121b');
    bgGrad.addColorStop(0.45, '#06262e');
    bgGrad.addColorStop(1, '#021013');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, width, height);

    // 2. 倒映在水中的月影 (受水波法线实时折射)
    const moonX = width * 0.82;
    const moonY = height * 0.16;
    const moonR = Math.min(width, height) * 0.08 + 14;

    const center = this.getRefractedCenter(moonX, moonY, 1.6);

    // 月影水面晕开的柔和月华 (随水面折射波动)
    const moonGlow = ctx.createRadialGradient(center.x, center.y, moonR * 0.3, center.x, center.y, moonR * 3.5);
    moonGlow.addColorStop(0, 'rgba(240, 253, 250, 0.45)');
    moonGlow.addColorStop(0.4, 'rgba(125, 211, 252, 0.18)');
    moonGlow.addColorStop(1, 'rgba(3, 18, 27, 0)');
    this.buildRefractedPath(ctx, moonX, moonY, moonR * 3.5, moonR * 3.5, 48, 1.2);
    ctx.fillStyle = moonGlow;
    ctx.fill();

    // 水中月影轮廓主体 (水波经过时边缘产生生动的波峰波谷撕扯折射)
    this.buildRefractedPath(ctx, moonX, moonY, moonR, moonR, 72, 1.8);
    ctx.fillStyle = '#fffdfa';
    ctx.shadowColor = 'rgba(254, 240, 138, 0.6)';
    ctx.shadowBlur = 24;
    ctx.fill();
    ctx.shadowBlur = 0;

    // 月影内部水波透射清波纹
    this.drawRefractedInnerTexture(ctx, moonX, moonY, moonR, 'rgba(186, 230, 253, 0.28)');
  }

  /**
   * 🌅 场景二：破晓晨曦 (俯视水面，池中倒映的淡黄温润朝阳，受水波实时折射)
   */
  drawDawnScene(ctx, width, height) {
    // 1. 淡蓝色的清晨水体渐变
    const dawnGrad = ctx.createLinearGradient(0, 0, 0, height);
    dawnGrad.addColorStop(0, '#bae6fd');   // 天际淡天蓝
    dawnGrad.addColorStop(0.35, '#cce7fb'); // 柔和晨蓝
    dawnGrad.addColorStop(0.7, '#e0f2fe');  // 透亮浅蓝
    dawnGrad.addColorStop(1, '#93c5fd');   // 水底微蓝
    ctx.fillStyle = dawnGrad;
    ctx.fillRect(0, 0, width, height);

    // 2. 倒映在水中的初升温润太阳 (受水波法线实时折射)
    const sunX = width * 0.82;
    const sunY = height * 0.18;
    const sunR = Math.min(width, height) * 0.08 + 14;

    const center = this.getRefractedCenter(sunX, sunY, 1.6);

    // 太阳水中倒影外围柔光
    const sunGlow = ctx.createRadialGradient(center.x, center.y, sunR * 0.2, center.x, center.y, sunR * 2.8);
    sunGlow.addColorStop(0, 'rgba(254, 240, 138, 0.65)');
    sunGlow.addColorStop(0.5, 'rgba(253, 224, 71, 0.2)');
    sunGlow.addColorStop(1, 'rgba(186, 230, 253, 0)');
    this.buildRefractedPath(ctx, sunX, sunY, sunR * 2.8, sunR * 2.8, 48, 1.2);
    ctx.fillStyle = sunGlow;
    ctx.fill();

    // 淡黄色太阳水面倒影主体 (随水波涟漪物理折射)
    const sunBody = ctx.createRadialGradient(
      center.x - sunR * 0.2, center.y - sunR * 0.2, sunR * 0.1,
      center.x, center.y, sunR
    );
    sunBody.addColorStop(0, '#ffffff');
    sunBody.addColorStop(0.6, '#fef9c3');
    sunBody.addColorStop(1, '#fde047');

    this.buildRefractedPath(ctx, sunX, sunY, sunR, sunR, 72, 1.8);
    ctx.fillStyle = sunBody;
    ctx.shadowColor = 'rgba(253, 224, 71, 0.45)';
    ctx.shadowBlur = 18;
    ctx.fill();
    ctx.shadowBlur = 0;

    // 晨阳水影内部金白折射水纹
    this.drawRefractedInnerTexture(ctx, sunX, sunY, sunR, 'rgba(255, 255, 255, 0.35)');
  }

  /**
   * 🖌️ 场景三：幽泉墨韵 (俯视宣纸水面，水中倒映的焦墨黑日与印章，受水波实时折射)
   */
  drawInkScene(ctx, width, height) {
    // 1. 白色的水 (宣纸留白纯白底色)
    const inkGrad = ctx.createLinearGradient(0, 0, 0, height);
    inkGrad.addColorStop(0, '#ffffff');
    inkGrad.addColorStop(0.4, '#f8fafc');
    inkGrad.addColorStop(0.8, '#f1f5f9');
    inkGrad.addColorStop(1, '#e2e8f0');
    ctx.fillStyle = inkGrad;
    ctx.fillRect(0, 0, width, height);

    // 2. 倒映在水中的水墨黑日倒影 (受水波法线实时折射)
    const sunX = width * 0.82;
    const sunY = height * 0.18;
    const sunR = Math.min(width, height) * 0.08 + 14;

    const center = this.getRefractedCenter(sunX, sunY, 1.6);

    // 黑色太阳外围淡墨水晕 (折射波形)
    const inkGlow = ctx.createRadialGradient(center.x, center.y, sunR * 0.5, center.x, center.y, sunR * 2.2);
    inkGlow.addColorStop(0, 'rgba(15, 23, 42, 0.35)');
    inkGlow.addColorStop(0.5, 'rgba(71, 85, 105, 0.12)');
    inkGlow.addColorStop(1, 'rgba(248, 250, 252, 0)');
    this.buildRefractedPath(ctx, sunX, sunY, sunR * 2.2, sunR * 2.2, 48, 1.2);
    ctx.fillStyle = inkGlow;
    ctx.fill();

    // 焦墨纯黑太阳倒影主体 (受水波折射形变)
    this.buildRefractedPath(ctx, sunX, sunY, sunR, sunR, 72, 1.8);
    ctx.fillStyle = '#09090b';
    ctx.shadowColor = 'rgba(15, 23, 42, 0.4)';
    ctx.shadowBlur = 10;
    ctx.fill();
    ctx.shadowBlur = 0;

    // 浓墨毛笔枯笔飞白水墨折射外环
    this.drawRefractedInkArc(ctx, sunX, sunY, sunR + 3.5, 0.15, Math.PI * 1.88, '#020617', 3.2);
    this.drawRefractedInkArc(ctx, sunX, sunY, sunR + 1.8, 0.8, Math.PI * 1.45, 'rgba(30, 41, 59, 0.75)', 1.8);

    // 水墨黑日内部淡墨水纹
    this.drawRefractedInnerTexture(ctx, sunX, sunY, sunR, 'rgba(71, 85, 105, 0.25)');

    // 3. 经典国风朱砂红印章「荷」置于画面右下角（水中微澜折射）
    const sealMargin = Math.max(22, Math.min(width, height) * 0.04);
    this.drawRefractedSeal(ctx, width - sealMargin - 20, height - sealMargin - 20);
  }

  /**
   * 🌊 水面波光折射 (Water Light Shimmer)
   * 绝不绘制任何圆形倒影实体，仅模拟天际天体（太阳/月亮）倾泻在水面的自然粼粼碎光
   * 碎光完全依托于实时水波法线场 (getRefractionOffset) 呈现真实的物理折射形变
   */
  drawWaterLightShimmer(ctx, width, height) {
    ctx.save();

    // 天体正下方光影扩散通道
    const lightSourceX = width * 0.82;
    const startY = height * 0.28;
    const endY = height * 0.88;
    const rows = 14;

    for (let i = 0; i < rows; i++) {
      const progress = i / rows;
      const yBase = startY + progress * (endY - startY);
      // 光线向下延展时的横向梯形弥散宽度
      const spread = 28 + progress * (width * 0.22);
      const segments = 18;

      ctx.beginPath();
      let hasDrawn = false;

      for (let s = 0; s <= segments; s++) {
        const u = s / segments;
        const rawX = lightSourceX - spread + u * (spread * 2);
        const rawY = yBase;

        // 获取该点的水波法线物理折射置换
        const refr = this.getRefractionOffset(rawX, rawY);
        // 叠加环境微波呼吸起伏
        const microWave = Math.sin(this.time * 2.0 + i * 0.9 + u * 4.5) * 1.8;

        const px = rawX + refr.dx * 1.2;
        const py = rawY + refr.dy * 1.2 + microWave;

        if (!hasDrawn) {
          ctx.moveTo(px, py);
          hasDrawn = true;
        } else {
          ctx.lineTo(px, py);
        }
      }

      // 根据主题定制极其柔和的折射水光透明度（绝无圆形突兀感）
      if (this.theme === 'dawn') {
        // 晨曦金白水波微光
        ctx.strokeStyle = `rgba(255, 255, 255, ${0.15 + (1 - progress) * 0.15})`;
        ctx.lineWidth = 1.3;
      } else if (this.theme === 'ink') {
        // 墨韵淡墨水波微纹 (极淡灰黑写意)
        ctx.strokeStyle = `rgba(100, 116, 139, ${0.08 + (1 - progress) * 0.12})`;
        ctx.lineWidth = 1.1;
      } else {
        // 月夜银蓝清波微光
        ctx.strokeStyle = `rgba(186, 230, 253, ${0.12 + (1 - progress) * 0.14})`;
        ctx.lineWidth = 1.2;
      }

      ctx.stroke();
    }

    ctx.restore();
  }

  drawSurface(ctx) {
    for (const rip of this.ripples) {
      rip.draw(ctx);
    }
    for (const sp of this.splashes) {
      sp.draw(ctx);
    }
  }

  drawOverhead(ctx) {
    for (const p of this.particles) {
      p.draw(ctx, this.theme);
    }
  }
}
