/**
 * fish.js - 灵动水墨锦鲤群系统与受惊逃逸 AI
 * 具备骨骼节段柔顺摆尾算法、Boids 群聚、危险波源感知与惊散逃逸
 */

export class FishFood {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.life = 1.0; // 寿命
    this.radius = 2.2;
    this.eaten = false;
  }

  update() {
    this.life -= 0.0025;
  }

  draw(ctx) {
    ctx.save();
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(251, 191, 36, ${Math.max(0, this.life * 0.85)})`;
    ctx.fill();
    ctx.restore();
  }
}

export class KoiFish {
  constructor(x, y, type = 'kohaku') {
    this.x = x;
    this.y = y;
    this.type = type; // 'kohaku'(红白), 'tancho'(丹顶), 'golden'(黄金), 'sanke'(三色)
    this.angle = Math.random() * Math.PI * 2;
    this.speed = 1.2 + Math.random() * 0.8;
    this.targetSpeed = this.speed;
    this.maxSpeed = 5.2;

    // 身体骨骼节段（前段大，后段小）
    this.length = 28 + Math.random() * 10;
    this.segmentCount = 12;
    this.segmentDist = this.length / this.segmentCount;
    this.segments = [];
    for (let i = 0; i < this.segmentCount; i++) {
      this.segments.push({
        x: this.x - i * this.segmentDist * Math.cos(this.angle),
        y: this.y - i * this.segmentDist * Math.sin(this.angle),
        angle: this.angle
      });
    }

    // 摆尾相位与频率
    this.swimCycle = Math.random() * Math.PI * 2;
    this.swimSpeed = 0.12;

    // 巡游目标点
    this.targetX = x;
    this.targetY = y;
    this.targetTimer = 0;

    // 受惊状态
    this.isPanicking = false;
    this.panicTimer = 0;

    // 颜色配置
    this.setupColors();
  }

  setupColors(theme = 'moonlight') {
    if (theme === 'ink') {
      // 水墨国风场景：墨鲤与宣纸白
      if (this.type === 'tancho') {
        this.baseColor = 'rgba(241, 245, 249, 0.9)';
        this.accentColor = 'rgba(225, 29, 72, 0.95)'; // 水墨画中的朱砂一点红
      } else {
        this.baseColor = 'rgba(248, 250, 252, 0.88)';
        this.accentColor = 'rgba(24, 24, 27, 0.95)'; // 焦墨斑纹
        this.blackSpots = true;
      }
    } else if (theme === 'dawn') {
      // 晨曦朝霞场景：金鳞与珊瑚暖色
      if (this.type === 'tancho') {
        this.baseColor = 'rgba(254, 243, 199, 0.95)';
        this.accentColor = 'rgba(239, 68, 68, 0.95)';
      } else if (this.type === 'golden') {
        this.baseColor = 'rgba(253, 224, 71, 0.95)';
        this.accentColor = 'rgba(245, 158, 11, 0.9)';
      } else {
        this.baseColor = 'rgba(255, 251, 235, 0.92)';
        this.accentColor = 'rgba(249, 115, 22, 0.95)';
      }
    } else {
      // 经典月夜场景
      if (this.type === 'tancho') {
        this.baseColor = 'rgba(255, 255, 255, 0.9)';
        this.accentColor = 'rgba(239, 68, 68, 0.95)';
      } else if (this.type === 'golden') {
        this.baseColor = 'rgba(250, 204, 21, 0.92)';
        this.accentColor = 'rgba(234, 88, 12, 0.85)';
      } else if (this.type === 'sanke') {
        this.baseColor = 'rgba(248, 250, 252, 0.9)';
        this.accentColor = 'rgba(225, 29, 72, 0.9)';
        this.blackSpots = true;
      } else {
        this.baseColor = 'rgba(255, 255, 255, 0.9)';
        this.accentColor = 'rgba(249, 115, 22, 0.92)';
      }
    }
  }

  /**
   * 被外界水波或猛击惊吓
   * @param {number} dangerX - 危险源坐标
   * @param {number} dangerY
   * @param {number} radius - 影响半径
   */
  scare(dangerX, dangerY, radius = 220) {
    const dx = this.x - dangerX;
    const dy = this.y - dangerY;
    const dist = Math.hypot(dx, dy);

    if (dist < radius) {
      this.isPanicking = true;
      this.panicTimer = 80 + Math.random() * 40; // 惊慌持续帧数

      // 瞬间背向危险点猛烈逃窜
      const escapeAngle = Math.atan2(dy, dx) + (Math.random() - 0.5) * 0.5;
      this.angle = escapeAngle;
      this.speed = this.maxSpeed * (1 - dist / (radius * 1.5) + 0.3);
      this.swimSpeed = 0.38; // 快速疯狂甩尾

      return true;
    }
    return false;
  }

  update(width, height, foods = []) {
    // 1. 状态衰减与目标选取
    if (this.isPanicking) {
      this.panicTimer--;
      if (this.panicTimer <= 0) {
        this.isPanicking = false;
        this.targetSpeed = 1.2 + Math.random() * 0.8;
      }
    } else {
      // 平静状态下恢复正常巡游速度与摆动频率
      this.targetSpeed = 1.3 + Math.sin(this.swimCycle * 0.5) * 0.4;
      this.swimSpeed = 0.11;

      // 寻找附近的鱼食（食物优先）
      let nearestFood = null;
      let minDist = Math.hypot(width, height);
      for (const food of foods) {
        if (food.eaten || food.life <= 0) continue;
        const d = Math.hypot(food.x - this.x, food.y - this.y);
        if (d < minDist) {
          minDist = d;
          nearestFood = food;
        }
      }

      if (nearestFood) {
        // 朝鱼食游动并啄食
        const fAngle = Math.atan2(nearestFood.y - this.y, nearestFood.x - this.x);
        this.angle += this.getAngleDiff(fAngle, this.angle) * 0.08;
        this.speed = 2.4;
        if (minDist < 12) {
          nearestFood.eaten = true;
          this.speed = 1.0;
        }
      } else {
        // 定期选取巡游目标点（75%概率选在屏幕内，25%概率漫游至屏幕外）
        this.targetTimer--;
        if (this.targetTimer <= 0) {
          this.targetTimer = 140 + Math.random() * 180;
          const chooseScreenInside = Math.random() < 0.75;
          if (chooseScreenInside) {
            // 屏幕内可见水域
            this.targetX = width * 0.12 + Math.random() * (width * 0.76);
            this.targetY = height * 0.12 + Math.random() * (height * 0.76);
          } else {
            // 2倍范围内屏幕外水域 (游出屏幕)
            const side = Math.floor(Math.random() * 4);
            if (side === 0) { // 左外
              this.targetX = -width * (0.1 + Math.random() * 0.35);
              this.targetY = Math.random() * height;
            } else if (side === 1) { // 右外
              this.targetX = width + width * (0.1 + Math.random() * 0.35);
              this.targetY = Math.random() * height;
            } else if (side === 2) { // 上外
              this.targetX = Math.random() * width;
              this.targetY = -height * (0.1 + Math.random() * 0.35);
            } else { // 下外
              this.targetX = Math.random() * width;
              this.targetY = height + height * (0.1 + Math.random() * 0.35);
            }
          }
        }

        const tAngle = Math.atan2(this.targetY - this.y, this.targetX - this.x);
        this.angle += this.getAngleDiff(tAngle, this.angle) * 0.025;
      }
    }

    // 速度平滑拟合
    this.speed += (this.targetSpeed - this.speed) * 0.05;

    // 屏幕外巡游导引：若在屏幕外漫游较远，施加温和回流向心力游回屏幕
    const centerX = width * 0.5;
    const centerY = height * 0.5;
    const isOutsideScreen = this.x < 0 || this.x > width || this.y < 0 || this.y > height;

    if (isOutsideScreen && !this.isPanicking) {
      const toCenterAngle = Math.atan2(centerY - this.y, centerX - this.x);
      const angleDiff = this.getAngleDiff(toCenterAngle, this.angle);
      this.angle += angleDiff * 0.035; // 温和游回可见荷塘
    }

    // 2. 头部前行更新
    this.x += Math.cos(this.angle) * this.speed;
    this.y += Math.sin(this.angle) * this.speed;

    // 两倍屏幕活动范围的边界控制 (总宽度 2*width, 总高度 2*height)
    const minBoundX = -width * 0.5;
    const maxBoundX = width * 1.5;
    const minBoundY = -height * 0.5;
    const maxBoundY = height * 1.5;

    // 触及两倍边界时强制掉头朝屏幕中心游回
    if (this.x < minBoundX + 20) {
      this.x = minBoundX + 20;
      this.angle = Math.atan2(centerY - this.y, centerX - this.x);
    } else if (this.x > maxBoundX - 20) {
      this.x = maxBoundX - 20;
      this.angle = Math.atan2(centerY - this.y, centerX - this.x);
    }

    if (this.y < minBoundY + 20) {
      this.y = minBoundY + 20;
      this.angle = Math.atan2(centerY - this.y, centerX - this.x);
    } else if (this.y > maxBoundY - 20) {
      this.y = maxBoundY - 20;
      this.angle = Math.atan2(centerY - this.y, centerX - this.x);
    }

    // 摆动推进
    this.swimCycle += this.swimSpeed;
    const wiggle = Math.sin(this.swimCycle) * 0.22 * (this.speed / 2);

    // 3. 骨骼跟随链更新 (Inverse Kinematics Forward)
    this.segments[0].x = this.x;
    this.segments[0].y = this.y;
    this.segments[0].angle = this.angle + wiggle;

    for (let i = 1; i < this.segmentCount; i++) {
      const prev = this.segments[i - 1];
      const cur = this.segments[i];

      const dx = cur.x - prev.x;
      const dy = cur.y - prev.y;

      // 后节跟随前节
      const segA = Math.atan2(dy, dx);
      cur.x = prev.x + Math.cos(segA) * this.segmentDist;
      cur.y = prev.y + Math.sin(segA) * this.segmentDist;
      cur.angle = segA;
    }
  }

  getAngleDiff(target, current) {
    let diff = target - current;
    while (diff > Math.PI) diff -= Math.PI * 2;
    while (diff < -Math.PI) diff += Math.PI * 2;
    return diff;
  }

  draw(ctx, theme = 'moonlight', waterSystem = null) {
    if (this.currentTheme !== theme) {
      this.currentTheme = theme;
      this.setupColors(theme);
    }

    ctx.save();

    // 1. 水底微弱投影（受水波折射产生晃动倒影）
    ctx.save();
    ctx.translate(6, 12);
    const shadowColor = theme === 'ink' ? 'rgba(71, 85, 105, 0.22)' : 'rgba(1, 15, 12, 0.32)';
    this.drawBodyPath(ctx, shadowColor, shadowColor, waterSystem);
    ctx.restore();

    // 2. 锦鲤鱼鳍（胸鳍与腹鳍）
    this.drawFins(ctx, waterSystem);

    // 3. 锦鲤鱼身轮廓与花纹 (全顶点受波面梯度折射)
    this.drawBody(ctx, waterSystem);

    // 4. 尾鳍与薄纱摆动
    this.drawTailFin(ctx, waterSystem);

    ctx.restore();
  }

  drawFins(ctx, waterSystem = null) {
    const seg2 = this.segments[2];
    const nextSeg = this.segments[3];
    // 胸鳍始终以身体后方为基准，避免摆动时其中一侧翻到鱼头前面。
    const backAngle = Math.atan2(nextSeg.y - seg2.y, nextSeg.x - seg2.x);
    const normalA = backAngle + Math.PI / 2;

    const finLength = this.length * 0.42;
    const finWiggle = Math.sin(this.swimCycle - 0.4) * finLength * 0.1;

    for (const side of [-1, 1]) {
      let startX = seg2.x + Math.cos(normalA) * (side * 5.5);
      let startY = seg2.y + Math.sin(normalA) * (side * 5.5);
      if (waterSystem) {
        const refr = waterSystem.getRefractionOffset(startX, startY);
        startX += refr.dx;
        startY += refr.dy;
      }

      ctx.save();
      ctx.translate(startX, startY);
      ctx.rotate(backAngle);

      const tipX = finLength * 0.78;
      const tipY = side * finLength * 0.52 + side * finWiggle;

      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.quadraticCurveTo(finLength * 0.32, side * finLength * 0.22, tipX, tipY);
      ctx.quadraticCurveTo(finLength * 0.5, side * finLength * 0.04, 0, 0);

      ctx.fillStyle = 'rgba(255, 255, 255, 0.42)';
      ctx.fill();
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
      ctx.lineWidth = 0.6;
      ctx.stroke();
      ctx.restore();
    }
  }

  drawBody(ctx, waterSystem = null) {
    // 渲染鱼身主骨架轮廓
    this.drawBodyPath(ctx, this.baseColor, this.accentColor, waterSystem);

    // 丹顶特色：头顶朱砂红斑
    const head = this.segments[1];
    let hx = head.x;
    let hy = head.y;
    if (waterSystem) {
      const r = waterSystem.getRefractionOffset(hx, hy);
      hx += r.dx;
      hy += r.dy;
    }

    if (this.type === 'tancho') {
      ctx.beginPath();
      ctx.arc(hx, hy, 4.2, 0, Math.PI * 2);
      ctx.fillStyle = this.accentColor;
      ctx.fill();
    }

    // 三色黑斑
    if (this.blackSpots) {
      const seg5 = this.segments[5];
      let s5x = seg5.x + 1;
      let s5y = seg5.y - 1;
      if (waterSystem) {
        const r = waterSystem.getRefractionOffset(s5x, s5y);
        s5x += r.dx;
        s5y += r.dy;
      }
      ctx.beginPath();
      ctx.ellipse(s5x, s5y, 4.5, 2.5, seg5.angle, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(24, 24, 27, 0.85)';
      ctx.fill();
    }

    // 鱼眼
    const headSeg = this.segments[0];
    const eyeDist = 4.2;
    const eyeNorm = headSeg.angle + Math.PI / 2;

    for (const side of [-1, 1]) {
      let ex = headSeg.x + Math.cos(eyeNorm) * (side * eyeDist) + Math.cos(headSeg.angle) * 2;
      let ey = headSeg.y + Math.sin(eyeNorm) * (side * eyeDist) + Math.sin(headSeg.angle) * 2;
      if (waterSystem) {
        const r = waterSystem.getRefractionOffset(ex, ey);
        ex += r.dx;
        ey += r.dy;
      }

      ctx.beginPath();
      ctx.arc(ex, ey, 1.2, 0, Math.PI * 2);
      ctx.fillStyle = '#0f172a';
      ctx.fill();

      ctx.beginPath();
      ctx.arc(ex + 0.3, ey - 0.3, 0.4, 0, Math.PI * 2);
      ctx.fillStyle = '#ffffff';
      ctx.fill();
    }
  }

  drawBodyPath(ctx, baseCol, accentCol, waterSystem = null) {
    const leftPts = [];
    const rightPts = [];
    const widths = [4.5, 6.5, 7.5, 7.8, 7.2, 6.4, 5.4, 4.2, 3.2, 2.2, 1.4, 0.8];

    for (let i = 0; i < this.segmentCount; i++) {
      const seg = this.segments[i];
      const w = widths[i] * (this.length / 32);
      const na = seg.angle + Math.PI / 2;

      let lx = seg.x + Math.cos(na) * w;
      let ly = seg.y + Math.sin(na) * w;
      let rx = seg.x - Math.cos(na) * w;
      let ry = seg.y - Math.sin(na) * w;

      // 实时水波物理折射偏移！
      if (waterSystem) {
        const rL = waterSystem.getRefractionOffset(lx, ly);
        lx += rL.dx;
        ly += rL.dy;
        const rR = waterSystem.getRefractionOffset(rx, ry);
        rx += rR.dx;
        ry += rR.dy;
      }

      leftPts.push({ x: lx, y: ly });
      rightPts.push({ x: rx, y: ry });
    }

    // 头部折射起点
    let headX = this.segments[0].x + Math.cos(this.segments[0].angle) * 5;
    let headY = this.segments[0].y + Math.sin(this.segments[0].angle) * 5;
    if (waterSystem) {
      const r = waterSystem.getRefractionOffset(headX, headY);
      headX += r.dx;
      headY += r.dy;
    }

    ctx.beginPath();
    ctx.moveTo(headX, headY);

    for (let i = 0; i < leftPts.length; i++) {
      ctx.lineTo(leftPts[i].x, leftPts[i].y);
    }

    // 尾部折射收合
    const tail = this.segments[this.segmentCount - 1];
    let tailX = tail.x;
    let tailY = tail.y;
    if (waterSystem) {
      const r = waterSystem.getRefractionOffset(tailX, tailY);
      tailX += r.dx;
      tailY += r.dy;
    }
    ctx.lineTo(tailX, tailY);

    for (let i = rightPts.length - 1; i >= 0; i--) {
      ctx.lineTo(rightPts[i].x, rightPts[i].y);
    }
    ctx.closePath();

    ctx.fillStyle = baseCol;
    ctx.fill();

    // 斑块纹理
    if (this.type === 'kohaku' || this.type === 'sanke') {
      ctx.save();
      ctx.clip();

      const b1 = this.segments[3];
      let b1x = b1.x;
      let b1y = b1.y;
      if (waterSystem) {
        const r = waterSystem.getRefractionOffset(b1x, b1y);
        b1x += r.dx;
        b1y += r.dy;
      }
      ctx.beginPath();
      ctx.ellipse(b1x, b1y, 7, 5, b1.angle, 0, Math.PI * 2);
      ctx.fillStyle = accentCol;
      ctx.fill();

      const b2 = this.segments[7];
      let b2x = b2.x;
      let b2y = b2.y;
      if (waterSystem) {
        const r = waterSystem.getRefractionOffset(b2x, b2y);
        b2x += r.dx;
        b2y += r.dy;
      }
      ctx.beginPath();
      ctx.ellipse(b2x, b2y, 5, 3.5, b2.angle, 0, Math.PI * 2);
      ctx.fillStyle = accentCol;
      ctx.fill();

      ctx.restore();
    }
  }

  drawTailFin(ctx, waterSystem = null) {
    const tail = this.segments[this.segmentCount - 1];
    const prev = this.segments[this.segmentCount - 2];
    const tailAngle = Math.atan2(tail.y - prev.y, tail.x - prev.x);

    const tailLen = this.length * 0.7;
    const tailSpread = 12;

    let tx = tail.x;
    let ty = tail.y;
    if (waterSystem) {
      const r = waterSystem.getRefractionOffset(tx, ty);
      tx += r.dx;
      ty += r.dy;
    }

    ctx.save();
    ctx.translate(tx, ty);
    ctx.rotate(tailAngle);

    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.bezierCurveTo(tailLen * 0.4, tailSpread, tailLen * 0.8, tailSpread * 1.3, tailLen, 0);
    ctx.bezierCurveTo(tailLen * 0.8, -tailSpread * 1.3, tailLen * 0.4, -tailSpread, 0, 0);

    ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
    ctx.fill();

    // 细薄鱼尾纹理
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.65)';
    ctx.lineWidth = 0.7;
    ctx.stroke();

    ctx.restore();
  }
}

export class KoiPondFishManager {
  constructor(count = 6) {
    this.fishList = [];
    this.foods = [];
    this.count = count;
  }

  init(width, height) {
    this.fishList = [];
    const types = ['kohaku', 'tancho', 'golden', 'sanke', 'kohaku'];
    for (let i = 0; i < this.count; i++) {
      // 散布在可见屏幕中央与各方
      const x = width * 0.15 + Math.random() * (width * 0.7);
      const y = height * 0.15 + Math.random() * (height * 0.7);
      const type = types[i % types.length];
      this.fishList.push(new KoiFish(x, y, type));
    }
  }

  addFood(x, y) {
    if (this.foods.length > 15) {
      this.foods.shift();
    }
    this.foods.push(new FishFood(x, y));
  }

  /**
   * 当水面涟漪或荷叶撞击时吓跑附近小鱼
   * @param {number} x
   * @param {number} y
   * @param {number} radius
   * @returns {boolean} 是否有小鱼被惊跑
   */
  scareNearbyFish(x, y, radius = 200) {
    let scaredCount = 0;
    for (const fish of this.fishList) {
      if (fish.scare(x, y, radius)) {
        scaredCount++;
      }
    }
    return scaredCount > 0;
  }

  update(width, height) {
    // 鱼群数量自愈保底：若意外缺失则补充
    if (this.fishList.length < this.count) {
      const types = ['kohaku', 'tancho', 'golden', 'sanke', 'kohaku'];
      const type = types[this.fishList.length % types.length];
      const fish = new KoiFish(width * 0.5 + (Math.random() - 0.5) * 60, height * 0.5 + (Math.random() - 0.5) * 60, type);
      this.fishList.push(fish);
    }

    // 更新鱼食
    for (let i = this.foods.length - 1; i >= 0; i--) {
      const food = this.foods[i];
      food.update();
      if (food.life <= 0 || food.eaten) {
        this.foods.splice(i, 1);
      }
    }

    // 更新鱼群
    for (const fish of this.fishList) {
      fish.update(width, height, this.foods);
    }
  }

  draw(ctx, theme = 'moonlight', waterSystem = null) {
    // 先绘制水底鱼食
    for (const food of this.foods) {
      food.draw(ctx);
    }

    // 绘制小鱼 (实时接入水面折射场)
    for (const fish of this.fishList) {
      fish.draw(ctx, theme, waterSystem);
    }
  }
}
