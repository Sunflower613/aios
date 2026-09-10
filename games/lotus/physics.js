/**
 * physics.js - 荷叶刚体物理运动、阻尼拖拽与弹性碰撞引擎
 * 包含荷叶形态生成、水流动力阻尼、露珠表面张力滚动与相互冲击冲量结算
 */

export class WaterDroplet {
  constructor(leafRadius) {
    this.leafRadius = leafRadius;
    // 露珠在荷叶局部坐标系内的位置
    const angle = Math.random() * Math.PI * 2;
    const dist = (0.2 + Math.random() * 0.5) * leafRadius;
    this.localX = Math.cos(angle) * dist;
    this.localY = Math.sin(angle) * dist;
    this.vx = 0;
    this.vy = 0;
    this.radius = 2.5 + Math.random() * 3.5;
  }

  update(leafAx, leafAy, leafRadius) {
    this.leafRadius = leafRadius;
    // 荷叶加速度传递给露珠（惯性反向力）
    this.vx -= leafAx * 0.4;
    this.vy -= leafAy * 0.4;

    // 向荷叶中心轻微回落的表面张力趋势
    this.vx -= this.localX * 0.015;
    this.vy -= this.localY * 0.015;

    // 露珠粘滞阻尼
    this.vx *= 0.88;
    this.vy *= 0.88;

    this.localX += this.vx;
    this.localY += this.vy;

    // 限制露珠不滑出荷叶边缘
    const maxDist = this.leafRadius * 0.78;
    const currentDist = Math.hypot(this.localX, this.localY);
    if (currentDist > maxDist) {
      const angle = Math.atan2(this.localY, this.localX);
      this.localX = Math.cos(angle) * maxDist;
      this.localY = Math.sin(angle) * maxDist;
      this.vx = -this.vx * 0.3;
      this.vy = -this.vy * 0.3;
    }
  }

  draw(ctx, worldX, worldY, leafAngle, theme = 'moonlight') {
    // 转换至世界坐标
    const cos = Math.cos(leafAngle);
    const sin = Math.sin(leafAngle);
    const wx = worldX + (this.localX * cos - this.localY * sin);
    const wy = worldY + (this.localX * sin + this.localY * cos);

    ctx.save();
    // 露珠投影 (水墨主题采用淡灰墨影，其余采用水潭墨绿影)
    ctx.beginPath();
    ctx.arc(wx + 1.2, wy + 1.8, this.radius, 0, Math.PI * 2);
    ctx.fillStyle = theme === 'ink' ? 'rgba(15, 23, 42, 0.25)' : 'rgba(2, 28, 20, 0.45)';
    ctx.fill();

    // 露珠晶莹水体
    const grad = ctx.createRadialGradient(
      wx - this.radius * 0.3, wy - this.radius * 0.3, this.radius * 0.1,
      wx, wy, this.radius
    );

    if (theme === 'ink') {
      // 墨韵纯白透亮晶莹露珠 (无任何杂色与绿调)
      grad.addColorStop(0, '#ffffff');
      grad.addColorStop(0.35, 'rgba(255, 255, 255, 0.95)');
      grad.addColorStop(0.75, 'rgba(241, 245, 249, 0.7)');
      grad.addColorStop(1, 'rgba(203, 213, 225, 0.5)');
    } else {
      // 经典常青露珠
      grad.addColorStop(0, 'rgba(255, 255, 255, 0.95)');
      grad.addColorStop(0.3, 'rgba(230, 255, 245, 0.7)');
      grad.addColorStop(0.8, 'rgba(74, 222, 128, 0.35)');
      grad.addColorStop(1, 'rgba(6, 78, 59, 0.6)');
    }

    ctx.beginPath();
    ctx.arc(wx, wy, this.radius, 0, Math.PI * 2);
    ctx.fillStyle = grad;
    ctx.fill();

    // 高光亮点
    ctx.beginPath();
    ctx.arc(wx - this.radius * 0.35, wy - this.radius * 0.35, this.radius * 0.32, 0, Math.PI * 2);
    ctx.fillStyle = '#ffffff';
    ctx.fill();
    ctx.restore();
  }
}

export class LotusLeaf {
  constructor(id, x, y, radius, hasFlower = false) {
    this.id = id;
    this.x = x;
    this.y = y;
    this.prevX = x;
    this.prevY = y;
    this.vx = 0;
    this.vy = 0;
    this.ax = 0;
    this.ay = 0;

    this.radius = radius;
    this.mass = radius * radius; // 质量与面积成正比
    this.angle = Math.random() * Math.PI * 2;
    this.vAngle = (Math.random() - 0.5) * 0.005;

    this.isDragging = false;
    this.dragOffsetX = 0;
    this.dragOffsetY = 0;

    this.hasFlower = hasFlower;
    this.flowerScale = 0.55 + Math.random() * 0.25;
    this.flowerAngle = Math.random() * Math.PI * 2;
    this.flowerPetalCount = 8 + Math.floor(Math.random() * 4);

    // 弹性与受撞挤压形变
    this.squeezeScaleX = 1;
    this.squeezeScaleY = 1;

    // 水波轻微浮动相位
    this.floatPhase = Math.random() * Math.PI * 2;
    this.notchAngle = (Math.random() - 0.5) * 0.4; // 荷叶天然缺口夹角

    // 生成有机不规则边缘轮廓顶点
    this.edgePoints = [];
    const segments = 24;
    for (let i = 0; i < segments; i++) {
      const a = (i / segments) * Math.PI * 2;
      // 在正弦波动基础上微调，形成自然荷叶边褶皱
      const rOffset = 1 + Math.sin(a * 5) * 0.035 + Math.cos(a * 3) * 0.025;
      this.edgePoints.push({ a, r: rOffset });
    }

    // 附着露珠
    this.droplets = [];
    const dropletCount = 2 + Math.floor(Math.random() * 3);
    for (let i = 0; i < dropletCount; i++) {
      this.droplets.push(new WaterDroplet(this.radius));
    }
  }

  update(dt, width, height) {
    this.floatPhase += 0.02;

    if (this.isDragging) {
      // 拖拽状态下由外部交互更新速度与位移
      this.ax = (this.vx - (this.x - this.prevX)) / dt;
      this.ay = (this.vy - (this.y - this.prevY)) / dt;
      this.prevX = this.x;
      this.prevY = this.y;
    } else {
      // 计算加速度用于惯性反馈
      this.ax = this.vx;
      this.ay = this.vy;

      // 水流阻尼
      this.vx *= 0.965;
      this.vy *= 0.965;
      this.vAngle *= 0.96;

      this.x += this.vx;
      this.y += this.vy;
      this.angle += this.vAngle;

      // 弹性回弹恢复圆形
      this.squeezeScaleX += (1 - this.squeezeScaleX) * 0.12;
      this.squeezeScaleY += (1 - this.squeezeScaleY) * 0.12;

      // 荷塘四周水岸弹性回弹
      const margin = this.radius * 0.85;
      const restitution = 0.55;

      if (this.x < margin) {
        this.x = margin;
        this.vx = -this.vx * restitution;
      } else if (this.x > width - margin) {
        this.x = width - margin;
        this.vx = -this.vx * restitution;
      }

      if (this.y < margin) {
        this.y = margin;
        this.vy = -this.vy * restitution;
      } else if (this.y > height - margin) {
        this.y = height - margin;
        this.vy = -this.vy * restitution;
      }
    }

    // 更新叶面露珠
    for (const drop of this.droplets) {
      drop.update(this.ax, this.ay, this.radius);
    }
  }

  contains(px, py) {
    return Math.hypot(px - this.x, py - this.y) <= this.radius * 1.05;
  }

  draw(ctx, theme = 'moonlight') {
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.angle);
    ctx.scale(this.squeezeScaleX, this.squeezeScaleY);

    // 水面浮动高度模拟
    const floatY = Math.sin(this.floatPhase) * 1.8;

    // 1. 荷叶水下阴影 (根据水体底色自适应柔和投影)
    ctx.save();
    ctx.translate(4, 7 + floatY);
    this.drawLeafShape(ctx);
    ctx.fillStyle = theme === 'ink' ? 'rgba(71, 85, 105, 0.22)' :
                    theme === 'dawn' ? 'rgba(56, 130, 180, 0.22)' :
                    'rgba(2, 20, 18, 0.48)';
    ctx.fill();
    ctx.restore();

    // 2. 荷叶叶面渐变渲染
    this.drawLeafShape(ctx);
    const leafGrad = ctx.createRadialGradient(
      0, floatY, this.radius * 0.1,
      0, floatY, this.radius
    );

    if (theme === 'dawn') {
      // 晨曦清荷：嫩绿清翠 (彻底去除橙色包边，回归清透纯翠)
      leafGrad.addColorStop(0, '#86efac');
      leafGrad.addColorStop(0.35, '#22c55e');
      leafGrad.addColorStop(0.75, '#16a34a');
      leafGrad.addColorStop(1, '#14532d');
      ctx.fillStyle = leafGrad;
      ctx.fill();

      ctx.lineWidth = 1.4;
      ctx.strokeStyle = 'rgba(134, 239, 172, 0.45)'; // 清新嫩绿边缘
      ctx.stroke();
    } else if (theme === 'ink') {
      // 水墨国风荷叶：浓墨淡墨晕染
      leafGrad.addColorStop(0, '#64748b');
      leafGrad.addColorStop(0.4, '#334155');
      leafGrad.addColorStop(0.8, '#1e293b');
      leafGrad.addColorStop(1, '#0f172a');
      ctx.fillStyle = leafGrad;
      ctx.fill();

      ctx.lineWidth = 1.6;
      ctx.strokeStyle = 'rgba(241, 245, 249, 0.65)';
      ctx.stroke();
    } else {
      // 经典月夜荷叶：青翠幽碧
      leafGrad.addColorStop(0, '#38a169');
      leafGrad.addColorStop(0.35, '#2f855a');
      leafGrad.addColorStop(0.75, '#22543d');
      leafGrad.addColorStop(1, '#1c4532');
      ctx.fillStyle = leafGrad;
      ctx.fill();

      ctx.lineWidth = 1.4;
      ctx.strokeStyle = 'rgba(110, 231, 183, 0.45)';
      ctx.stroke();
    }

    // 3. 绘制清晰舒展的荷叶叶脉 (Venation)
    ctx.save();
    ctx.beginPath();
    const veinsCount = 14;
    for (let i = 0; i < veinsCount; i++) {
      const vAngle = (i / veinsCount) * Math.PI * 2 + 0.15;
      if (Math.abs(vAngle - Math.PI) < 0.25) continue;

      const rEnd = this.radius * 0.88;
      const ex = Math.cos(vAngle) * rEnd;
      const ey = Math.sin(vAngle) * rEnd;
      const cpx = Math.cos(vAngle + 0.08) * (rEnd * 0.5);
      const cpy = Math.sin(vAngle + 0.08) * (rEnd * 0.5);

      ctx.moveTo(0, 0);
      ctx.quadraticCurveTo(cpx, cpy, ex, ey);

      const subEx1 = ex * 0.7 + Math.sin(vAngle) * 8;
      const subEy1 = ey * 0.7 - Math.cos(vAngle) * 8;
      ctx.moveTo(cpx, cpy);
      ctx.lineTo(subEx1, subEy1);
    }

    if (theme === 'dawn') {
      ctx.strokeStyle = 'rgba(187, 247, 208, 0.45)'; // 嫩绿叶脉
    } else if (theme === 'ink') {
      ctx.strokeStyle = 'rgba(241, 245, 249, 0.4)';
    } else {
      ctx.strokeStyle = 'rgba(167, 243, 208, 0.35)';
    }
    ctx.lineWidth = 0.9;
    ctx.stroke();

    // 叶柄中心基座小圆圈
    ctx.beginPath();
    ctx.arc(0, 0, 3.2, 0, Math.PI * 2);
    ctx.fillStyle = theme === 'ink' ? '#cbd5e1' : theme === 'dawn' ? '#86efac' : '#6ee7b7';
    ctx.fill();
    ctx.restore();

    // 4. 绘制荷叶上的滚动露珠 (传入theme以支持水墨白色露珠)
    for (const drop of this.droplets) {
      drop.draw(ctx, 0, 0, 0, theme);
    }

    // 5. 绘制绽放的荷花/睡莲 (若该荷叶生有荷花)
    if (this.hasFlower) {
      this.drawFlower(ctx, theme);
    }

    ctx.restore();
  }

  drawLeafShape(ctx) {
    ctx.beginPath();
    const len = this.edgePoints.length;
    // 带有经典扇形缺口 (Notch)
    const notchStart = Math.PI - 0.22 + this.notchAngle;
    const notchEnd = Math.PI + 0.22 + this.notchAngle;

    let started = false;
    for (let i = 0; i < len; i++) {
      const pt = this.edgePoints[i];
      if (pt.a >= notchStart && pt.a <= notchEnd) {
        if (!started) {
          ctx.moveTo(0, 0);
          started = true;
        }
        continue;
      }
      const x = Math.cos(pt.a) * (this.radius * pt.r);
      const y = Math.sin(pt.a) * (this.radius * pt.r);
      if (!started) {
        ctx.moveTo(0, 0);
        ctx.lineTo(x, y);
        started = true;
      } else {
        ctx.lineTo(x, y);
      }
    }
    ctx.closePath();
  }

  drawFlower(ctx, theme = 'moonlight') {
    ctx.save();
    // 荷花偏置于荷叶侧上方
    ctx.translate(this.radius * 0.42, -this.radius * 0.38);
    ctx.rotate(this.flowerAngle);
    ctx.scale(this.flowerScale, this.flowerScale);

    // 阴影
    ctx.beginPath();
    ctx.ellipse(2, 4, 18, 14, 0, 0, Math.PI * 2);
    ctx.fillStyle = theme === 'ink' ? 'rgba(0, 0, 0, 0.45)' : 'rgba(1, 20, 15, 0.4)';
    ctx.fill();

    // 外层花瓣
    for (let i = 0; i < this.flowerPetalCount; i++) {
      const a = (i / this.flowerPetalCount) * Math.PI * 2;
      ctx.save();
      ctx.rotate(a);
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.quadraticCurveTo(-9, -24, 0, -32);
      ctx.quadraticCurveTo(9, -24, 0, 0);

      const pGrad = ctx.createLinearGradient(0, 0, 0, -32);
      if (theme === 'ink') {
        pGrad.addColorStop(0, 'rgba(248, 250, 252, 0.95)');
        pGrad.addColorStop(0.6, 'rgba(203, 213, 225, 0.9)');
        pGrad.addColorStop(1, 'rgba(225, 29, 72, 0.95)'); // 朱砂红尖端
      } else if (theme === 'dawn') {
        pGrad.addColorStop(0, 'rgba(255, 247, 237, 0.95)');
        pGrad.addColorStop(0.5, 'rgba(251, 113, 133, 0.9)');
        pGrad.addColorStop(1, 'rgba(225, 29, 72, 1)');
      } else {
        pGrad.addColorStop(0, 'rgba(255, 241, 242, 0.95)');
        pGrad.addColorStop(0.5, 'rgba(251, 113, 133, 0.85)');
        pGrad.addColorStop(1, 'rgba(244, 63, 94, 0.95)');
      }
      ctx.fillStyle = pGrad;
      ctx.fill();
      ctx.restore();
    }

    // 内层精致小花瓣
    for (let i = 0; i < this.flowerPetalCount - 2; i++) {
      const a = (i / (this.flowerPetalCount - 2)) * Math.PI * 2 + 0.25;
      ctx.save();
      ctx.rotate(a);
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.quadraticCurveTo(-6, -16, 0, -22);
      ctx.quadraticCurveTo(6, -16, 0, 0);

      const pGrad = ctx.createLinearGradient(0, 0, 0, -22);
      if (theme === 'ink') {
        pGrad.addColorStop(0, '#ffffff');
        pGrad.addColorStop(0.7, '#cbd5e1');
        pGrad.addColorStop(1, '#e11d48');
      } else {
        pGrad.addColorStop(0, '#ffffff');
        pGrad.addColorStop(0.7, '#f472b6');
        pGrad.addColorStop(1, '#db2777');
      }
      ctx.fillStyle = pGrad;
      ctx.fill();
      ctx.restore();
    }

    // 金黄色莲蓬与花蕊
    ctx.beginPath();
    ctx.arc(0, 0, 8.5, 0, Math.PI * 2);
    ctx.fillStyle = theme === 'ink' ? '#fef08a' : '#fef08a';
    ctx.fill();

    ctx.beginPath();
    for (let s = 0; s < 6; s++) {
      const sa = (s / 6) * Math.PI * 2;
      ctx.arc(Math.cos(sa) * 4.5, Math.sin(sa) * 4.5, 1.2, 0, Math.PI * 2);
    }
    ctx.fillStyle = '#eab308';
    ctx.fill();

    ctx.restore();
  }
}

export class LotusPhysicsSystem {
  constructor() {
    this.leaves = [];
    this.onCollision = null; // 碰撞发生回调 (leafA, leafB, impactSpeed, hitX, hitY)
  }

  setLeaves(leaves) {
    this.leaves = leaves;
  }

  update(dt, width, height) {
    // 1. 更新所有荷叶独立位置与阻尼
    for (const leaf of this.leaves) {
      leaf.update(dt, width, height);
    }

    // 2. 荷叶相互弹性刚体碰撞结算 (Circle-Circle Impulse Resolution)
    const count = this.leaves.length;
    for (let i = 0; i < count; i++) {
      for (let j = i + 1; j < count; j++) {
        this.resolveLeafCollision(this.leaves[i], this.leaves[j]);
      }
    }
  }

  resolveLeafCollision(a, b) {
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    const dist = Math.hypot(dx, dy);
    const minDist = (a.radius + b.radius) * 0.92; // 允许极小边缘自然重合

    if (dist <= 0 || dist >= minDist) return;

    // 碰撞法线与重叠穿透距离
    const nx = dx / dist;
    const ny = dy / dist;
    const penetration = minDist - dist;

    // 位置纠正 (Positional Correction)，防止两叶重叠吸附
    if (a.isDragging && !b.isDragging) {
      b.x += nx * penetration * 0.95;
      b.y += ny * penetration * 0.95;
    } else if (!a.isDragging && b.isDragging) {
      a.x -= nx * penetration * 0.95;
      a.y -= ny * penetration * 0.95;
    } else if (!a.isDragging && !b.isDragging) {
      const percent = 0.55;
      const totalMass = a.mass + b.mass;
      a.x -= (nx * penetration * (b.mass / totalMass)) * percent;
      a.y -= (ny * penetration * (b.mass / totalMass)) * percent;
      b.x += (nx * penetration * (a.mass / totalMass)) * percent;
      b.y += (ny * penetration * (a.mass / totalMass)) * percent;
    }

    // 计算相对速度沿法线的投影
    const rvx = b.vx - a.vx;
    const rvy = b.vy - a.vy;
    const velAlongNormal = rvx * nx + rvy * ny;

    // 正向分离中则无需碰撞冲量计算
    if (velAlongNormal > 0) return;

    // 弹性恢复系数
    const restitution = 0.72;
    const impulseMag = -(1 + restitution) * velAlongNormal / (1 / a.mass + 1 / b.mass);

    // 施加法向冲量
    const impulseX = impulseMag * nx;
    const impulseY = impulseMag * ny;

    if (!a.isDragging) {
      a.vx -= impulseX / a.mass;
      a.vy -= impulseY / a.mass;
    }
    if (!b.isDragging) {
      b.vx += impulseX / b.mass;
      b.vy += impulseY / b.mass;
    }

    // 撞击力计算与形变挤压
    const impactSpeed = Math.abs(velAlongNormal);
    const squeezeFactor = Math.min(impactSpeed * 0.05, 0.28);
    a.squeezeScaleX = 1 - squeezeFactor;
    a.squeezeScaleY = 1 + squeezeFactor * 0.5;
    b.squeezeScaleX = 1 - squeezeFactor;
    b.squeezeScaleY = 1 + squeezeFactor * 0.5;

    // 撞击促发轻微角旋转动量
    const tangentX = -ny;
    const tangentY = nx;
    const rvt = rvx * tangentX + rvy * tangentY;
    a.vAngle += rvt * 0.0003;
    b.vAngle -= rvt * 0.0003;

    // 碰撞接触点世界坐标
    const hitX = a.x + nx * a.radius;
    const hitY = a.y + ny * a.radius;

    // 触发碰撞事件，联动音效、水花涟漪与触觉
    if (this.onCollision && impactSpeed > 0.15) {
      this.onCollision(a, b, impactSpeed, hitX, hitY);
    }
  }
}
