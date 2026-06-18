// ==========================================
// Cute Slingshot Billiards - Macaron Theme
// Core Game Script with Physics Bug Fix
// ==========================================

// Web Audio API 声音合成器
class SoundSynthesizer {
  constructor() {
    this.ctx = null;
    this.muted = false;
  }

  init() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  playShot() {
    if (this.muted || !this.ctx) return;
    this.init();
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(160, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(50, this.ctx.currentTime + 0.12);
    
    gain.gain.setValueAtTime(0.25, this.ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.01, this.ctx.currentTime + 0.12);
    
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    
    osc.start();
    osc.stop(this.ctx.currentTime + 0.12);
  }

  playBounce() {
    if (this.muted || !this.ctx) return;
    this.init();
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(120, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(80, this.ctx.currentTime + 0.08);
    
    gain.gain.setValueAtTime(0.15, this.ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.01, this.ctx.currentTime + 0.08);
    
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    
    osc.start();
    osc.stop(this.ctx.currentTime + 0.08);
  }

  playCollision() {
    if (this.muted || !this.ctx) return;
    this.init();
    // 清脆的撞球声 (高频短促正弦波)
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(1400, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(900, this.ctx.currentTime + 0.025);
    
    gain.gain.setValueAtTime(0.12, this.ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.001, this.ctx.currentTime + 0.025);
    
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    
    osc.start();
    osc.stop(this.ctx.currentTime + 0.025);
  }

  playBreak(isBoss = false) {
    if (this.muted || !this.ctx) return;
    this.init();
    const bufferSize = this.ctx.sampleRate * (isBoss ? 0.35 : 0.18);
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    
    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;
    
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(isBoss ? 450 : 850, this.ctx.currentTime);
    filter.frequency.exponentialRampToValueAtTime(120, this.ctx.currentTime + (isBoss ? 0.35 : 0.18));
    
    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(isBoss ? 0.35 : 0.18, this.ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.01, this.ctx.currentTime + (isBoss ? 0.35 : 0.18));
    
    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);
    
    noise.start();
    noise.stop(this.ctx.currentTime + (isBoss ? 0.35 : 0.18));
  }

  playPocket() {
    if (this.muted || !this.ctx) return;
    this.init();
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(260, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(70, this.ctx.currentTime + 0.22);
    
    gain.gain.setValueAtTime(0.2, this.ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.01, this.ctx.currentTime + 0.22);
    
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    
    osc.start();
    osc.stop(this.ctx.currentTime + 0.22);
  }

  playLevelComplete() {
    if (this.muted || !this.ctx) return;
    this.init();
    const notes = [293.66, 349.23, 440.00, 587.33]; // D4, F4, A4, D5 (D小调上行)
    notes.forEach((freq, i) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime + i * 0.08);
      
      gain.gain.setValueAtTime(0, this.ctx.currentTime + i * 0.08);
      gain.gain.linearRampToValueAtTime(0.12, this.ctx.currentTime + i * 0.08 + 0.04);
      gain.gain.linearRampToValueAtTime(0.001, this.ctx.currentTime + i * 0.08 + 0.2);
      
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      
      osc.start(this.ctx.currentTime + i * 0.08);
      osc.stop(this.ctx.currentTime + i * 0.08 + 0.25);
    });
  }
}

// 可爱气泡粒子系统
class Particle {
  constructor(x, y, color, type = 'spark') {
    this.x = x;
    this.y = y;
    this.vx = (Math.random() - 0.5) * (type === 'explosion' ? 5 : 2.5);
    this.vy = (Math.random() - 0.5) * (type === 'explosion' ? 5 : 2.5);
    this.color = color;
    this.life = 1.0;
    this.decay = Math.random() * 0.03 + 0.015;
    this.type = type; // spark, explosion, trail, text
    this.size = type === 'explosion' ? Math.random() * 6 + 3 : Math.random() * 3.5 + 2;
    this.text = '';
  }

  update() {
    this.x += this.vx;
    this.y += this.vy;
    this.life -= this.decay;
    if (this.type === 'text') {
      this.vy = -0.7; // 飘字缓慢向上
    } else {
      this.vx *= 0.96; // 阻力
      this.vy *= 0.96;
    }
  }

  draw(ctx) {
    if (this.life <= 0) return;
    ctx.save();
    ctx.globalAlpha = this.life;
    
    if (this.type === 'text') {
      ctx.fillStyle = this.color;
      ctx.font = 'bold 12px sans-serif';
      ctx.fillText(this.text, this.x - 10, this.y);
    } else {
      ctx.fillStyle = this.color;
      ctx.beginPath();
      // 画小圆泡
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fill();
      
      // 加个微小的气泡高光
      ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
      ctx.beginPath();
      ctx.arc(this.x - this.size * 0.3, this.y - this.size * 0.3, this.size * 0.2, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }
}

// 漂浮马卡龙气泡背景线
class BubbleField {
  constructor(width, height) {
    this.width = width;
    this.height = height;
    this.bubbles = [];
    const colors = [
      'rgba(255, 179, 186, 0.22)', // 浅粉
      'rgba(186, 225, 255, 0.22)', // 浅蓝
      'rgba(255, 255, 186, 0.22)', // 浅黄
      'rgba(232, 206, 248, 0.22)', // 浅紫
      'rgba(186, 255, 201, 0.22)'  // 浅绿
    ];
    for (let i = 0; i < 20; i++) {
      this.bubbles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        radius: Math.random() * 12 + 6,
        color: colors[Math.floor(Math.random() * colors.length)],
        vy: -(Math.random() * 0.4 + 0.15),
        wiggle: Math.random() * 100,
        wiggleSpeed: Math.random() * 0.02 + 0.01
      });
    }
  }

  update() {
    this.bubbles.forEach(b => {
      b.y += b.vy;
      b.wiggle += b.wiggleSpeed;
      b.x += Math.sin(b.wiggle) * 0.15;
      
      // 出顶端后重置到最底
      if (b.y + b.radius < 0) {
        b.y = this.height + b.radius;
        b.x = Math.random() * this.width;
      }
    });
  }

  draw(ctx) {
    ctx.clearRect(0, 0, this.width, this.height);
    
    // 渲染马卡龙暖桃到淡天蓝线性渐变
    const bgGrad = ctx.createLinearGradient(0, 0, 0, this.height);
    bgGrad.addColorStop(0, '#fef9f6');
    bgGrad.addColorStop(1, '#eaf2ff');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, this.width, this.height);

    // 绘制缓缓上升的气泡
    this.bubbles.forEach(b => {
      ctx.fillStyle = b.color;
      ctx.beginPath();
      ctx.arc(b.x, b.y, b.radius, 0, Math.PI * 2);
      ctx.fill();
      
      // 气泡半透明反光高光
      ctx.fillStyle = 'rgba(255, 255, 255, 0.35)';
      ctx.beginPath();
      ctx.arc(b.x - b.radius * 0.3, b.y - b.radius * 0.3, b.radius * 0.22, 0, Math.PI * 2);
      ctx.fill();
    });
  }
}

// ==========================================
// 核心游戏类
// ==========================================
class NeonPoolGame {
  constructor() {
    this.canvas = document.getElementById('gameCanvas');
    this.ctx = this.canvas.getContext('2d');
    this.bgCanvas = document.getElementById('bgCanvas');
    this.bgCtx = this.bgCanvas.getContext('2d');
    
    // 逻辑分辨率设为固定 1:2 比例 (400 x 800)
    this.logicWidth = 400;
    this.logicHeight = 800;
    this.scale = 1;

    // 台球桌边界物理区
    this.cushion = 25;
    this.tableLeft = this.cushion;
    this.tableRight = this.logicWidth - this.cushion;
    this.tableTop = this.cushion;
    this.tableBottom = this.logicHeight - this.cushion;
    this.pocketRadius = 22;

    // 六个袋口中心坐标
    this.pockets = [
      { x: this.tableLeft, y: this.tableTop, isCorner: true }, // 左上
      { x: this.tableRight, y: this.tableTop, isCorner: true }, // 右上
      { x: this.tableLeft - 5, y: this.logicHeight / 2, isCorner: false }, // 左中
      { x: this.tableRight + 5, y: this.logicHeight / 2, isCorner: false }, // 右中
      { x: this.tableLeft, y: this.tableBottom, isCorner: true }, // 左下
      { x: this.tableRight, y: this.tableBottom, isCorner: true } // 右下
    ];

    // 游戏状态
    this.score = 0;
    this.highScore = parseInt(localStorage.getItem('pool_highScore') || '0');
    this.shotsLeft = 10;
    this.currentLevel = 1;
    this.gameMode = 'classic'; // classic, endless
    this.gameState = 'menu'; // menu, playing, paused, gameover
    
    this.isTransitioning = false;
    this.isTurnProcessing = false; // 强壮的回合控制标志位，解决球不动的卡死BUG

    // 物理实体
    this.balls = [];
    this.cueBall = null;
    this.particles = [];

    // 拖拽与瞄准状态
    this.dragStart = null;
    this.dragCurrent = null;
    this.isDragging = false;
    this.maxDragDistance = 110;
    this.shootForceMultiplier = 0.22;

    // 经典模式关卡数据定义 (纯球关卡，不含砖块)
    this.levels = [
      {
        id: 1,
        title: "大试身手",
        shots: 8,
        balls: [
          { x: 200, y: 240, hp: 3, color: '#ffb3ba' }, // 顶点
          { x: 190, y: 257.32, hp: 2, color: '#ffdfba' },
          { x: 210, y: 257.32, hp: 2, color: '#ffffba' }
        ]
      },
      {
        id: 2,
        title: "小试钻石",
        shots: 10,
        balls: [
          { x: 200, y: 200, hp: 5, color: '#bae1ff' }, // 钻石阵
          { x: 180, y: 230, hp: 3, color: '#e8cef8' },
          { x: 220, y: 230, hp: 3, color: '#e8cef8' },
          { x: 160, y: 260, hp: 3, color: '#ffb3ba' },
          { x: 240, y: 260, hp: 3, color: '#ffb3ba' },
          { x: 200, y: 260, hp: 6, color: '#baffc9' },
          { x: 200, y: 320, hp: 8, color: '#ffdfba' }
        ]
      },
      {
        id: 3,
        title: "袋口包围战",
        shots: 10,
        balls: [
          // 放在袋口附近的危机球
          { x: 50, y: 50, hp: 4, color: '#ffb3ba' },
          { x: 350, y: 50, hp: 4, color: '#ffb3ba' },
          { x: 40, y: 400, hp: 5, color: '#ffffba' },
          { x: 360, y: 400, hp: 5, color: '#ffffba' },
          { x: 50, y: 750, hp: 4, color: '#bae1ff' },
          { x: 350, y: 750, hp: 4, color: '#bae1ff' },
          { x: 200, y: 240, hp: 8, color: '#e8cef8' }
        ]
      },
      {
        id: 4,
        title: "梅花三弄",
        shots: 12,
        balls: [
          // 3组小三角
          { x: 130, y: 180, hp: 6, color: '#ffb3ba' },
          { x: 120, y: 197.3, hp: 4, color: '#baffc9' },
          { x: 140, y: 197.3, hp: 4, color: '#baffc9' },
          
          { x: 270, y: 180, hp: 6, color: '#ffdfba' },
          { x: 260, y: 197.3, hp: 4, color: '#baffc9' },
          { x: 280, y: 197.3, hp: 4, color: '#baffc9' },
          
          { x: 200, y: 300, hp: 8, color: '#e8cef8' },
          { x: 190, y: 317.3, hp: 6, color: '#ffffba' },
          { x: 210, y: 317.3, hp: 6, color: '#ffffba' }
        ]
      },
      {
        id: 5,
        title: "终极大魔王",
        shots: 15,
        balls: [
          { x: 200, y: 230, hp: 40, color: '#ff6b81', radius: 20, isBoss: true }, // 巨大主怪
          { x: 200, y: 120, hp: 5, color: '#baffc9' }, // 守卫小球
          { x: 100, y: 220, hp: 5, color: '#baffc9' },
          { x: 300, y: 220, hp: 5, color: '#baffc9' },
          { x: 140, y: 320, hp: 8, color: '#bae1ff' },
          { x: 260, y: 320, hp: 8, color: '#bae1ff' }
        ]
      }
    ];

    // 初始化声音
    this.sound = new SoundSynthesizer();
    
    // 初始化背景漂浮气泡
    this.starfield = null;

    // API 网关配置
    this.apiHost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' 
      ? `http://${window.location.hostname}:3001`
      : 'http://111.229.107.228:3001';

    // 事件绑定
    this.initEvents();
    this.resizeCanvas();
    // 延迟进行再次 resize，防止移动端/转屏/首帧样式未应用时高度计算为 0 导致台球桌压缩成窄条
    setTimeout(() => this.resizeCanvas(), 100);
    setTimeout(() => this.resizeCanvas(), 300);

    // 初始化 SSO 登录界面
    this.initSSOWidget();

    // 同步云端数据
    this.checkUrlSSOToken();
    this.syncCloudData();
    this.loadLeaderboard();
  }

  // 绑定交互事件
  initEvents() {
    window.addEventListener('resize', () => this.resizeCanvas());

    // 声音开关
    const btnSound = document.getElementById('soundToggle');
    btnSound.addEventListener('click', (e) => {
      e.stopPropagation();
      this.sound.muted = !this.sound.muted;
      const soundIcon = btnSound.querySelector('.sound-icon');
      if (this.sound.muted) {
        soundIcon.setAttribute('icon', 'lucide:volume-x');
      } else {
        soundIcon.setAttribute('icon', 'lucide:volume-2');
      }
      if (!this.sound.muted) this.sound.init();
    });

    // 暂停/继续
    document.getElementById('pauseBtn').addEventListener('click', (e) => {
      e.stopPropagation();
      if (this.gameState === 'playing') {
        this.pauseGame();
      }
    });

    document.getElementById('btnResume').addEventListener('click', () => this.resumeGame());
    document.getElementById('btnRestart').addEventListener('click', () => {
      this.hideAllModals();
      this.startGame(this.gameMode, this.currentLevel);
    });
    
    const quitButtons = ['btnQuit', 'btnGameOverQuit'];
    quitButtons.forEach(id => {
      document.getElementById(id).addEventListener('click', () => {
        this.hideAllModals();
        this.gameState = 'menu';
        document.getElementById('menuOverlay').style.display = 'flex';
      });
    });

    // 模式选择
    document.getElementById('btnClassicMode').addEventListener('click', () => {
      document.getElementById('menuOverlay').style.display = 'none';
      this.showLevelGrid();
    });
    
    document.getElementById('btnEndlessMode').addEventListener('click', () => {
      this.sound.init();
      document.getElementById('menuOverlay').style.display = 'none';
      this.startGame('endless');
    });

    document.getElementById('btnBackToMenu').addEventListener('click', () => {
      document.getElementById('levelOverlay').style.display = 'none';
      document.getElementById('menuOverlay').style.display = 'flex';
    });

    // 打开排行榜 (添加安全保护)
    const btnLdb = document.getElementById('btnLeaderboard');
    if (btnLdb) {
      btnLdb.addEventListener('click', () => {
        this.sound.init();
        const overlay = document.getElementById('leaderboardOverlay');
        if (overlay) overlay.style.display = 'flex';
        this.loadLeaderboard();
      });
    }

    // 关闭排行榜 (添加安全保护)
    const btnHideLdb = document.getElementById('btnHideLeaderboard');
    if (btnHideLdb) {
      btnHideLdb.addEventListener('click', () => {
        const overlay = document.getElementById('leaderboardOverlay');
        if (overlay) overlay.style.display = 'none';
      });
    }

    document.getElementById('btnReplay').addEventListener('click', () => {
      this.hideAllModals();
      this.startGame(this.gameMode, this.currentLevel);
    });

    document.getElementById('btnNextLevel').addEventListener('click', () => {
      this.hideAllModals();
      this.startGame('classic', this.currentLevel + 1);
    });

    // 触摸/鼠标弹射控制
    const handleStart = (clientX, clientY) => {
      if (this.gameState !== 'playing' || this.isDragging || !this.cueBall) return;
      if (this.isTurnProcessing || !this.areBallsStopped()) return; // 运动过程中不允许弹射
      
      this.sound.init();

      const rect = this.canvas.getBoundingClientRect();
      const clickX = (clientX - rect.left) / this.scale;
      const clickY = (clientY - rect.top) / this.scale;

      this.dragStart = { x: this.cueBall.x, y: this.cueBall.y };
      this.dragCurrent = { x: clickX, y: clickY };
      this.isDragging = true;
      document.getElementById('tipText').textContent = "反向拉伸并释放以进行击打";
    };

    const handleMove = (clientX, clientY) => {
      if (!this.isDragging) return;
      const rect = this.canvas.getBoundingClientRect();
      const clickX = (clientX - rect.left) / this.scale;
      const clickY = (clientY - rect.top) / this.scale;
      this.dragCurrent = { x: clickX, y: clickY };
    };

    const handleEnd = () => {
      if (!this.isDragging) return;
      this.isDragging = false;

      const dx = this.dragCurrent.x - this.cueBall.x;
      const dy = this.dragCurrent.y - this.cueBall.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance > 10) { // 拖动大于 10px 发射
        const power = Math.min(distance, this.maxDragDistance) / this.maxDragDistance;
        const angle = Math.atan2(dy, dx);
        
        // 往拖拽相反的方向弹射 (Sling-shot)
        this.cueBall.vx = -Math.cos(angle) * power * 22;
        this.cueBall.vy = -Math.sin(angle) * power * 22;
        
        this.shotsLeft--;
        this.updateHUD();
        this.sound.playShot();
        
        // 冲击圈特效
        this.spawnShockwave(this.cueBall.x, this.cueBall.y, '#ffffff');
        
        // 启动回合物理运动处理阀门
        this.isTurnProcessing = true;
        document.getElementById('tipText').textContent = "等待小球完全静止";
      } else {
        document.getElementById('tipText').textContent = "拖拽白色母球反向拉伸进行弹射";
      }

      this.dragStart = null;
      this.dragCurrent = null;
    };

    // 鼠标监听
    this.canvas.addEventListener('mousedown', e => handleStart(e.clientX, e.clientY));
    window.addEventListener('mousemove', e => {
      if (this.isDragging) handleMove(e.clientX, e.clientY);
    });
    window.addEventListener('mouseup', () => handleEnd());

    // 触摸监听 (移动端，修复上下滑动)
    let touchStartX = 0;
    let touchStartY = 0;

    this.canvas.addEventListener('touchstart', e => {
      if (this.gameState === 'playing' && this.cueBall && !this.isTurnProcessing && this.areBallsStopped()) {
        if (e.cancelable) {
          e.preventDefault();
        }
      }
      if (e.touches.length > 0) {
        handleStart(e.touches[0].clientX, e.touches[0].clientY);
      }
    }, { passive: false });

    window.addEventListener('touchstart', e => {
      if (e.touches && e.touches.length > 0) {
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
      }
    }, { passive: true });
    
    window.addEventListener('touchmove', e => {
      // 允许排行榜列表内正常滑动
      if (e.target.closest('.leaderboard-list') || e.target.closest('.modal-body') || e.target.closest('.leaderboard-container')) {
        return;
      }

      // 完全禁用下拉刷新、页面滚动和左右滑动返回手势
      if (e.cancelable) {
        e.preventDefault();
      }

      // 如果正在拖拽，优先处理拖拽事件
      if (this.isDragging && e.touches.length > 0) {
        handleMove(e.touches[0].clientX, e.touches[0].clientY);
      }
    }, { passive: false });
    
    window.addEventListener('touchend', () => handleEnd());
  }

  // 尺寸调整，维持 1:2 比例
  resizeCanvas() {
    const parent = this.canvas.parentElement;
    const parentWidth = parent.clientWidth;
    const parentHeight = parent.clientHeight;
    
    let w = parentWidth;
    let h = parentWidth * 2;
    
    if (h > parentHeight) {
      h = parentHeight;
      w = parentHeight / 2;
    }
    
    this.canvas.width = w;
    this.canvas.height = h;
    this.scale = w / this.logicWidth; // 缩放因子

    // 背景气泡自适应窗口大小
    this.bgCanvas.width = window.innerWidth;
    this.bgCanvas.height = window.innerHeight;
    
    this.starfield = new BubbleField(this.bgCanvas.width, this.bgCanvas.height);
  }

  // 展示关卡选择界面
  showLevelGrid() {
    const grid = document.getElementById('levelGrid');
    grid.innerHTML = '';
    
    const maxUnlocked = parseInt(localStorage.getItem('pool_maxUnlockedLevel') || '1');

    this.levels.forEach(lvl => {
      const btn = document.createElement('button');
      btn.className = `level-btn ${lvl.id <= maxUnlocked ? 'unlocked' : 'locked'}`;
      btn.textContent = lvl.id;
      
      if (lvl.id <= maxUnlocked) {
        btn.addEventListener('click', () => {
          this.sound.init();
          document.getElementById('levelOverlay').style.display = 'none';
          this.startGame('classic', lvl.id);
        });
      } else {
        btn.innerHTML = '🔒';
      }
      grid.appendChild(btn);
    });

    document.getElementById('levelOverlay').style.display = 'flex';
  }

  // 开始新游戏
  startGame(mode = 'classic', levelId = 1) {
    this.resizeCanvas(); // 重新校准 Canvas 宽高比，应对可能存在的转屏和视口刷新
    this.gameMode = mode;
    this.score = 0;
    this.particles = [];
    this.isTransitioning = false;
    this.isTurnProcessing = false; // 重置回合处理标记
    this.hideAllModals();

    if (mode === 'classic') {
      this.currentLevel = levelId;
      const levelData = this.levels[levelId - 1];
      this.shotsLeft = levelData.shots;
      
      // 生成球，移除方块
      this.balls = [];
      
      // 1. 生成白球 (母球)
      this.cueBall = {
        x: 200,
        y: 600,
        vx: 0,
        vy: 0,
        radius: 10,
        color: '#ffffff',
        type: 'cue'
      };
      this.balls.push(this.cueBall);

      // 2. 加载关卡目标球
      levelData.balls.forEach(b => {
        this.balls.push({
          x: b.x,
          y: b.y,
          vx: 0,
          vy: 0,
          radius: b.radius || 10,
          color: b.color,
          hp: b.hp,
          maxHp: b.hp,
          type: 'brick-ball',
          isBoss: b.isBoss || false
        });
      });
      
      document.getElementById('tipText').textContent = `关卡 ${levelId}: ${levelData.title} - 准备击球`;
    } else {
      // 无尽挑战模式：摆放10个三角排列的目标球
      this.shotsLeft = 10;
      this.balls = [];
      
      this.cueBall = {
        x: 200,
        y: 600,
        vx: 0,
        vy: 0,
        radius: 10,
        color: '#ffffff',
        type: 'cue'
      };
      this.balls.push(this.cueBall);

      // 摆放10个球，初始生命值为 3
      this.endlessRackCount = 1;
      this.spawnTriangleRack(3);
      
      document.getElementById('tipText').textContent = "无尽模式：清台会自动重新摆球";
    }

    this.updateHUD();
    this.gameState = 'playing';
  }

  // 无尽模式/摆球辅助：完美摆放10个球的三角形排列
  spawnTriangleRack(startHP) {
    // 过滤掉原有的目标球，保留白球
    this.balls = this.balls.filter(b => b.type === 'cue');

    const r = 10;
    const dy = r * Math.sqrt(3); // 17.3205

    // 三角顶点在 x=200, y=200 处
    const apexX = 200;
    const apexY = 180;

    // 10 个球的数学排列坐标
    const rackCoords = [
      // 第一排 (1个)
      { x: apexX, y: apexY },
      // 第二排 (2个)
      { x: apexX - r, y: apexY + dy },
      { x: apexX + r, y: apexY + dy },
      // 第三排 (3个)
      { x: apexX - 2 * r, y: apexY + 2 * dy },
      { x: apexX, y: apexY + 2 * dy },
      { x: apexX + 2 * r, y: apexY + 2 * dy },
      // 第四排 (4个)
      { x: apexX - 3 * r, y: apexY + 3 * dy },
      { x: apexX - r, y: apexY + 3 * dy },
      { x: apexX + r, y: apexY + 3 * dy },
      { x: apexX + 3 * r, y: apexY + 3 * dy }
    ];

    // 马卡龙色系颜色池
    const pastelColors = [
      '#ffb3ba', // 樱花粉
      '#ffdfba', // 杏橘
      '#ffffba', // 柠檬黄
      '#baffc9', // 薄荷绿
      '#bae1ff', // 浅空蓝
      '#e8cef8'  // 丁香紫
    ];

    rackCoords.forEach((coord, i) => {
      // 最后一排血量略高，增加梯度趣味
      let hp = startHP + Math.floor(i / 3);
      const color = pastelColors[i % pastelColors.length];

      this.balls.push({
        x: coord.x,
        y: coord.y,
        vx: 0,
        vy: 0,
        radius: r,
        color: color,
        hp: hp,
        maxHp: hp,
        type: 'brick-ball'
      });
    });
  }

  // 暂停游戏
  pauseGame() {
    this.gameState = 'paused';
    document.getElementById('pauseOverlay').style.display = 'flex';
  }

  // 恢复游戏
  resumeGame() {
    this.gameState = 'playing';
    document.getElementById('pauseOverlay').style.display = 'none';
  }

  // 隐藏所有弹层
  hideAllModals() {
    const overlays = ['menuOverlay', 'levelOverlay', 'pauseOverlay', 'gameOverOverlay'];
    overlays.forEach(id => {
      document.getElementById(id).style.display = 'none';
    });
  }

  // 更新 HUD 显示
  updateHUD() {
    document.getElementById('scoreVal').textContent = this.score;
    document.getElementById('shotsVal').textContent = this.shotsLeft;
  }

  // 辅助检测：所有球是否已静止
  areBallsStopped() {
    return this.balls.every(b => {
      // 速度的平方小于 0.02 且没有 NaN
      const speedSq = b.vx * b.vx + b.vy * b.vy;
      return speedSq < 0.02 && !isNaN(speedSq);
    });
  }

  // 游戏主更新逻辑 (60fps)
  update() {
    this.starfield.update();

    if (this.gameState !== 'playing') return;

    // 1. 更新所有球的位置与球球弹性碰撞
    this.updateBallsPhysics();

    // 2. 检查球落袋
    this.checkPocketSink();

    // 3. 过滤已标记移除的球 (被击碎或落袋)
    this.balls = this.balls.filter(b => !b.toRemove);

    // 4. 摩擦力慢速停止
    this.balls.forEach(b => {
      b.x += b.vx;
      b.y += b.vy;
      b.vx *= 0.99; // 桌布摩擦阻尼
      b.vy *= 0.99;
      
      // 极限完全停稳
      if (b.vx * b.vx + b.vy * b.vy < 0.02) {
        b.vx = 0;
        b.vy = 0;
      }
    });

    // 5. 更新粒子与飘字
    this.particles.forEach(p => p.update());
    this.particles = this.particles.filter(p => p.life > 0);

    // 6. 关卡状态判定：当发射动作完成，且小球完全停稳时触发
    if (this.isTurnProcessing && this.areBallsStopped()) {
      this.isTurnProcessing = false; // 关闭阀门
      this.handleTurnEnd();
    }
  }

  // 处理回合结束 (球都停下后)
  handleTurnEnd() {
    // 回收白球如果白球落袋了
    if (!this.balls.includes(this.cueBall)) {
      this.cueBall = {
        x: 200,
        y: 600,
        vx: 0,
        vy: 0,
        radius: 10,
        color: '#ffffff',
        type: 'cue'
      };
      this.balls.push(this.cueBall);
    }

    // 获取剩余目标球数量
    const remainingTargets = this.balls.filter(b => b.type === 'brick-ball').length;

    if (this.gameMode === 'classic') {
      // 经典闯关模式
      if (remainingTargets === 0 && !this.isTransitioning) {
        this.winLevel();
      } else if (this.shotsLeft <= 0 && !this.isTransitioning) {
        this.gameOver(false);
      } else {
        document.getElementById('tipText').textContent = "拖拽母球进行下一次击打";
      }
    } else {
      // 无尽重摆挑战模式
      if (remainingTargets === 0 && !this.isTransitioning) {
        // 全清，重新摆球并奖励 5 次击球数
        this.endlessRackCount++;
        this.spawnTriangleRack(3 + this.endlessRackCount * 2); // 血量递增
        this.shotsLeft += 5;
        this.score += 1000; // 通台大奖
        this.updateHUD();
        this.sound.playLevelComplete();
        this.spawnConfetti();
        
        this.spawnTextFloat(200, 300, '完美清台! +5球', '#ff6b81');
        document.getElementById('tipText').textContent = `第 ${this.endlessRackCount} 轮摆球：清盘补给 +5 击球数！`;
      } else if (this.shotsLeft <= 0 && !this.isTransitioning) {
        this.gameOver(true);
      } else {
        document.getElementById('tipText').textContent = "拖拽母球进行下一次击打";
      }
    }
  }

  // 关卡胜利
  winLevel() {
    this.isTransitioning = true;
    this.gameState = 'paused';
    this.sound.playLevelComplete();

    // 记录解锁进度
    const currentMax = parseInt(localStorage.getItem('pool_maxUnlockedLevel') || '1');
    if (this.currentLevel === currentMax && this.currentLevel < this.levels.length) {
      localStorage.setItem('pool_maxUnlockedLevel', this.currentLevel + 1);
    }

    // 飘屏特效
    this.spawnConfetti();

    setTimeout(() => {
      const overlay = document.getElementById('gameOverOverlay');
      document.getElementById('resultEmoji').textContent = '🧸';
      document.getElementById('resultTitle').textContent = `关卡 ${this.currentLevel} 通关！`;
      document.getElementById('resultText').textContent = `只用了 ${this.levels[this.currentLevel - 1].shots - this.shotsLeft} 杆，太厉害了！`;
      
      // 分数计算
      const levelBonus = this.currentLevel * 1000;
      const shotsBonus = this.shotsLeft * 200;
      this.score += levelBonus + shotsBonus;
      
      if (this.score > this.highScore) {
        this.highScore = this.score;
        localStorage.setItem('pool_highScore', this.highScore);
      }

      document.getElementById('finalScore').textContent = this.score;
      document.getElementById('bestScore').textContent = this.highScore;

      // 保存进度与分数到云端
      this.saveCloudData(this.highScore, {
        maxUnlockedLevel: parseInt(localStorage.getItem('pool_maxUnlockedLevel') || '1')
      });

      // 是否显示下一关按钮
      const btnNext = document.getElementById('btnNextLevel');
      if (this.currentLevel < this.levels.length) {
        btnNext.style.display = 'block';
      } else {
        btnNext.style.display = 'none';
        document.getElementById('resultTitle').textContent = '恭喜通关全关卡！';
      }

      overlay.style.display = 'flex';
    }, 1200);
  }

  // 游戏结束
  gameOver(isEndless = false) {
    this.gameState = 'paused';
    
    if (this.score > this.highScore) {
      this.highScore = this.score;
      localStorage.setItem('pool_highScore', this.highScore);
    }

    // 保存进度与分数到云端
    this.saveCloudData(this.highScore, {
      maxUnlockedLevel: parseInt(localStorage.getItem('pool_maxUnlockedLevel') || '1')
    });

    setTimeout(() => {
      const overlay = document.getElementById('gameOverOverlay');
      document.getElementById('resultEmoji').textContent = '💔';
      document.getElementById('resultTitle').textContent = '游戏结束';
      document.getElementById('resultText').textContent = "你的击球数耗光了！";
      
      document.getElementById('finalScore').textContent = this.score;
      document.getElementById('bestScore').textContent = this.highScore;
      document.getElementById('btnNextLevel').style.display = 'none';
      
      overlay.style.display = 'flex';
    }, 800);
  }

  // 粒子飘花特效
  spawnConfetti() {
    for (let i = 0; i < 40; i++) {
      const colors = ['#ffb3ba', '#bae1ff', '#ffffba', '#e8cef8'];
      const p = new Particle(Math.random() * this.logicWidth, -10, colors[Math.floor(Math.random() * colors.length)], 'explosion');
      p.vy = Math.random() * 2 + 1.5;
      p.vx = (Math.random() - 0.5) * 3;
      p.decay = 0.012;
      this.particles.push(p);
    }
  }

  // 物理碰撞更新
  updateBallsPhysics() {
    // 运行 4 次解算迭代，确保多球叠状碰撞被彻底推开，防止单次解算残余微小重叠
    for (let iter = 0; iter < 4; iter++) {
      const len = this.balls.length;
      
      // 1. 球与球弹性碰撞 (双重循环)
      for (let i = 0; i < len; i++) {
        for (let j = i + 1; j < len; j++) {
          const b1 = this.balls[i];
          const b2 = this.balls[j];
          
          if (!b1 || !b2 || b1.toRemove || b2.toRemove) continue;
          
          let dx = b2.x - b1.x;
          let dy = b2.y - b1.y;
          let dist = Math.sqrt(dx * dx + dy * dy);
          const minDist = b1.radius + b2.radius;

          // 强力修复 NaN/Infinity 卡死 BUG：如果距离过小 (小于 0.01)，给予微小错位防止除以极小值溢出
          if (dist < 0.01) {
            b1.x -= 0.1;
            b2.x += 0.1;
            dx = b2.x - b1.x;
            dy = b2.y - b1.y;
            dist = Math.sqrt(dx * dx + dy * dy);
          }

          if (dist < minDist) {
            // 弹性小球碰撞
            this.resolveBallBallCollision(b1, b2, dx, dy, dist, minDist);
          }
        }
      }
    }

    // 2. 球与库边边界碰撞
    this.balls.forEach(b => {
      if (!b.toRemove) {
        this.resolveBallCushionCollision(b);
      }
    });
  }

  // 球与球碰撞结算
  resolveBallBallCollision(b1, b2, dx, dy, dist, minDist) {
    // 1. 重叠排除 (排斥推开以防粘连)
    const overlap = minDist - dist;
    const nx = dx / dist; // 法方向
    const ny = dy / dist;

    b1.x -= nx * overlap * 0.5;
    b1.y -= ny * overlap * 0.5;
    b2.x += nx * overlap * 0.5;
    b2.y += ny * overlap * 0.5;

    // 2. 动量合成
    const tx = -ny; // 切线方向
    const ty = nx;

    // 投影法向与切向速度
    const v1n = b1.vx * nx + b1.vy * ny;
    const v1t = b1.vx * tx + b1.vy * ty;
    const v2n = b2.vx * nx + b2.vy * ny;
    const v2t = b2.vx * tx + b2.vy * ty;

    // 只有在两球迎面碰撞且相对法向速度大于阈值 0.15 时才发生动量交换与生命扣减，防止静止叠加或分离接触反复判定
    const relVel = v1n - v2n;
    if (relVel > 0.15) {
      // 交换法向速度 (弹性势能完全互换)
      const newV1n = v2n;
      const newV2n = v1n;

      // 合成 Cartesian 分量
      b1.vx = newV1n * nx + v1t * tx;
      b1.vy = newV1n * ny + v1t * ty;
      b2.vx = newV2n * nx + v2t * tx;
      b2.vy = newV2n * ny + v2t * ty;

      // 3. 血量扣减规则 (仅在回合运动中才扣减生命和放特效/声音，防止摆盘微小重叠判定消分)
      this.handleEntityHit(b1);
      this.handleEntityHit(b2);

      if (this.isTurnProcessing) {
        this.sound.playCollision();
        
        // 火花气泡特效
        this.spawnHitParticles((b1.x + b2.x) / 2, (b1.y + b2.y) / 2, '#ffffff', 4);
      }
    }
  }

  // 目标球受击生命减少
  handleEntityHit(ball) {
    if (!this.isTurnProcessing) return; // 仅在回合进行中（击打后）才生效，防止摆盘时微小重叠判定扣血
    if (ball.type === 'brick-ball' && ball.hp > 0 && !ball.toRemove) {
      ball.hp--;
      this.score += 10;
      this.updateHUD();
      
      this.spawnTextFloat(ball.x, ball.y, '+10', '#ff6b81');
      
      if (ball.hp <= 0) {
        // 消亡
        this.sound.playBreak(ball.isBoss);
        this.spawnHitParticles(ball.x, ball.y, ball.color, 18);
        this.score += 100;
        this.spawnTextFloat(ball.x, ball.y, '+100', '#ffa502');
        this.updateHUD();
        
        // 标记移除
        ball.toRemove = true;
      }
    }
  }

  // 球与库边碰撞反弹
  resolveBallCushionCollision(b) {
    // 如果临近袋口范围，跳过库边反弹，交由袋口吸入检测
    const inPocketZone = this.pockets.some(p => {
      const d = Math.sqrt((b.x - p.x) * (b.x - p.x) + (b.y - p.y) * (b.y - p.y));
      return d < this.pocketRadius + 4;
    });

    if (inPocketZone) return;

    // 左边界
    if (b.x - b.radius < this.tableLeft) {
      b.x = this.tableLeft + b.radius;
      b.vx = -b.vx * 0.95;
      this.sound.playBounce();
      this.spawnHitParticles(this.tableLeft, b.y, '#ffffff', 2);
    }
    // 右边界
    if (b.x + b.radius > this.tableRight) {
      b.x = this.tableRight - b.radius;
      b.vx = -b.vx * 0.95;
      this.sound.playBounce();
      this.spawnHitParticles(this.tableRight, b.y, '#ffffff', 2);
    }
    // 上边界
    if (b.y - b.radius < this.tableTop) {
      b.y = this.tableTop + b.radius;
      b.vy = -b.vy * 0.95;
      this.sound.playBounce();
      this.spawnHitParticles(b.x, this.tableTop, '#ffffff', 2);
    }
    // 下边界
    if (b.y + b.radius > this.tableBottom) {
      b.y = this.tableBottom - b.radius;
      b.vy = -b.vy * 0.95;
      this.sound.playBounce();
      this.spawnHitParticles(b.x, this.tableBottom, '#ffffff', 2);
    }
  }

  // 袋口落袋检测
  checkPocketSink() {
    this.balls.forEach(b => {
      if (!b.toRemove) {
        this.pockets.forEach(p => {
          const dx = b.x - p.x;
          const dy = b.y - p.y;
          const d = Math.sqrt(dx * dx + dy * dy);
          
          if (d < this.pocketRadius) {
            this.handleBallPocketed(b, p);
          }
        });
      }
    });
  }

  // 小球落袋结算
  handleBallPocketed(ball, pocket) {
    ball.toRemove = true;

    this.sound.playPocket();
    this.spawnShockwave(pocket.x, pocket.y, ball.type === 'cue' ? '#ff6b81' : '#bae1ff');

    if (ball.type === 'cue') {
      // 处罚母球落袋
      this.shotsLeft--;
      this.updateHUD();
      this.spawnTextFloat(pocket.x, pocket.y, '罚杆 -1', '#ff6b81');
      document.getElementById('tipText').textContent = "母球落袋！扣减击球机会";
    } else {
      // 目标球落袋：获得大爆炸和额外击球奖励！
      this.score += 200;
      this.shotsLeft++; // 进一个球，补回一杆 (free shot 机制!)
      this.updateHUD();
      
      this.spawnTextFloat(pocket.x, pocket.y, '进球! 杆数+1', '#ffa502');
      this.triggerPocketExplosion(pocket.x, pocket.y);
    }
  }

  // 落袋爆炸范围打击
  triggerPocketExplosion(ex, ey) {
    const explosionRadius = 110;
    
    this.balls.forEach(b => {
      if (b.type === 'brick-ball' && !b.toRemove) {
        const d = Math.sqrt((b.x - ex) * (b.x - ex) + (b.y - ey) * (b.y - ey));
        if (d < explosionRadius) {
          const damage = Math.floor((1 - d / explosionRadius) * 6) + 2;
          b.hp -= damage;
          this.score += damage * 10;
          this.updateHUD();
          this.spawnTextFloat(b.x, b.y - 8, `-${damage} HP`, '#ff6b81');
          
          // 受余波推力散开
          const angle = Math.atan2(b.y - ey, b.x - ex);
          b.vx += Math.cos(angle) * (1 - d / explosionRadius) * 10;
          b.vy += Math.sin(angle) * (1 - d / explosionRadius) * 10;

          if (b.hp <= 0) {
            this.sound.playBreak(b.isBoss);
            this.spawnHitParticles(b.x, b.y, b.color, 10);
            b.toRemove = true;
          }
        }
      }
    });

    // 爆炸烟雾气泡
    for (let i = 0; i < 20; i++) {
      const p = new Particle(ex, ey, 'rgba(255, 179, 186, 0.6)', 'explosion');
      this.particles.push(p);
    }
  }

  // 特效：气泡冲击波
  spawnShockwave(x, y, color) {
    for (let i = 0; i < 12; i++) {
      const p = new Particle(x, y, color, 'spark');
      const angle = (i / 12) * Math.PI * 2;
      const speed = 3.5;
      p.vx = Math.cos(angle) * speed;
      p.vy = Math.sin(angle) * speed;
      p.decay = 0.04;
      this.particles.push(p);
    }
  }

  // 特效：击中气泡粒子
  spawnHitParticles(x, y, color, count = 6) {
    for (let i = 0; i < count; i++) {
      this.particles.push(new Particle(x, y, color, 'spark'));
    }
  }

  // 特效：浮空文字
  spawnTextFloat(x, y, text, color) {
    const p = new Particle(x, y, color, 'text');
    p.text = text;
    p.decay = 0.025;
    this.particles.push(p);
  }

  // 绘制瞄准射线和反弹预测
  drawSlingshotGuide() {
    if (!this.isDragging || !this.cueBall) return;

    const startX = this.cueBall.x;
    const startY = this.cueBall.y;
    const endX = this.dragCurrent.x;
    const endY = this.dragCurrent.y;

    const dx = endX - startX;
    const dy = endY - startY;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist < 10) return;

    const power = Math.min(dist, this.maxDragDistance) / this.maxDragDistance;
    const angle = Math.atan2(dy, dx);

    // 1. 绘制拖拽的奶油粉“皮筋”
    this.ctx.save();
    this.ctx.strokeStyle = `rgba(255, 107, 129, ${0.4 + power * 0.6})`;
    this.ctx.lineWidth = 5 * (1 - power * 0.3);
    this.ctx.beginPath();
    this.ctx.moveTo(startX, startY);
    this.ctx.lineTo(startX + Math.cos(angle) * Math.min(dist, this.maxDragDistance), startY + Math.sin(angle) * Math.min(dist, this.maxDragDistance));
    this.ctx.stroke();
    
    // 皮筋末梢圆圈
    this.ctx.fillStyle = '#ff6b81';
    this.ctx.beginPath();
    this.ctx.arc(startX + Math.cos(angle) * Math.min(dist, this.maxDragDistance), startY + Math.sin(angle) * Math.min(dist, this.maxDragDistance), 5, 0, Math.PI * 2);
    this.ctx.fill();
    this.ctx.restore();

    // 2. 绘制前方瞄准线段
    const launchAngle = angle + Math.PI;
    const laserVx = Math.cos(launchAngle);
    const laserVy = Math.sin(launchAngle);
    
    this.ctx.save();
    this.ctx.setLineDash([5, 5]);
    this.ctx.strokeStyle = `rgba(255, 255, 255, ${0.5 + power * 0.5})`;
    this.ctx.lineWidth = 2.5;

    // 模拟第一个交叉碰撞反弹
    let curX = startX;
    let curY = startY;
    let stepVx = laserVx;
    let stepVy = laserVy;
    let pathPoints = [{ x: curX, y: curY }];

    let hitFound = false;
    let maxLaserDistance = 420 * power;
    let traveled = 0;

    while (!hitFound && traveled < maxLaserDistance) {
      curX += stepVx * 4;
      curY += stepVy * 4;
      traveled += 4;

      if (curX - this.cueBall.radius <= this.tableLeft) {
        curX = this.tableLeft + this.cueBall.radius;
        stepVx = -stepVx;
        hitFound = true;
      }
      else if (curX + this.cueBall.radius >= this.tableRight) {
        curX = this.tableRight - this.cueBall.radius;
        stepVx = -stepVx;
        hitFound = true;
      }
      else if (curY - this.cueBall.radius <= this.tableTop) {
        curY = this.tableTop + this.cueBall.radius;
        stepVy = -stepVy;
        hitFound = true;
      }
      else if (curY + this.cueBall.radius >= this.tableBottom) {
        curY = this.tableBottom - this.cueBall.radius;
        stepVy = -stepVy;
        hitFound = true;
      }
    }
    pathPoints.push({ x: curX, y: curY });

    if (hitFound && traveled < maxLaserDistance) {
      pathPoints.push({
        x: curX + stepVx * (maxLaserDistance - traveled),
        y: curY + stepVy * (maxLaserDistance - traveled)
      });
    }

    this.ctx.beginPath();
    this.ctx.moveTo(pathPoints[0].x, pathPoints[0].y);
    for (let i = 1; i < pathPoints.length; i++) {
      this.ctx.lineTo(pathPoints[i].x, pathPoints[i].y);
    }
    this.ctx.stroke();

    if (hitFound) {
      this.ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
      this.ctx.beginPath();
      this.ctx.arc(curX, curY, 6, 0, Math.PI * 2);
      this.ctx.fill();
    }

    this.ctx.restore();
  }

  // 绘制渲染画布
  draw() {
    this.ctx.save();
    this.ctx.scale(this.scale, this.scale);
    this.ctx.clearRect(0, 0, this.logicWidth, this.logicHeight);

    // 1. 绘制台球面绿色桌布 (柔和桌绿渐变)
    const tableGrad = this.ctx.createRadialGradient(
      this.logicWidth / 2, this.logicHeight / 2, 50,
      this.logicWidth / 2, this.logicHeight / 2, 400
    );
    tableGrad.addColorStop(0, '#2e6b4e'); // 马卡龙深绿
    tableGrad.addColorStop(1, '#1b4430');
    this.ctx.fillStyle = tableGrad;
    this.ctx.fillRect(0, 0, this.logicWidth, this.logicHeight);

    // 2. 绘制台面六个发光网袋袋口
    this.pockets.forEach(p => {
      this.ctx.save();
      // 袋底巧克力深色
      this.ctx.fillStyle = '#26190f';
      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, this.pocketRadius, 0, Math.PI * 2);
      this.ctx.fill();

      // 奶油金色口袋环
      this.ctx.strokeStyle = '#e6c48e';
      this.ctx.lineWidth = 3.5;
      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, this.pocketRadius + 1, 0, Math.PI * 2);
      this.ctx.stroke();
      this.ctx.restore();
    });

    // 3. 绘制台球围墙木边 (Cushions)
    this.ctx.save();
    
    // 绘制温润木质围边 (奶油木)
    this.ctx.strokeStyle = '#ebdcc7';
    this.ctx.lineWidth = 5;
    
    const dOff = this.pocketRadius + 8;

    // 顶线
    this.ctx.beginPath();
    this.ctx.moveTo(this.tableLeft + dOff, this.tableTop);
    this.ctx.lineTo(this.tableRight - dOff, this.tableTop);
    this.ctx.stroke();

    // 底线
    this.ctx.beginPath();
    this.ctx.moveTo(this.tableLeft + dOff, this.tableBottom);
    this.ctx.lineTo(this.tableRight - dOff, this.tableBottom);
    this.ctx.stroke();

    // 左侧两段
    this.ctx.beginPath();
    this.ctx.moveTo(this.tableLeft, this.tableTop + dOff);
    this.ctx.lineTo(this.tableLeft, this.logicHeight / 2 - dOff);
    this.ctx.stroke();

    this.ctx.beginPath();
    this.ctx.moveTo(this.tableLeft, this.logicHeight / 2 + dOff);
    this.ctx.lineTo(this.tableLeft, this.tableBottom - dOff);
    this.ctx.stroke();

    // 右侧两段
    this.ctx.beginPath();
    this.ctx.moveTo(this.tableRight, this.tableTop + dOff);
    this.ctx.lineTo(this.tableRight, this.logicHeight / 2 - dOff);
    this.ctx.stroke();

    this.ctx.beginPath();
    this.ctx.moveTo(this.tableRight, this.logicHeight / 2 + dOff);
    this.ctx.lineTo(this.tableRight, this.tableBottom - dOff);
    this.ctx.stroke();
    
    this.ctx.restore();

    // 4. 绘制小球
    this.balls.forEach(b => {
      this.ctx.save();
      
      // 球体 3D 奶油渐变渲染
      const radGrad = this.ctx.createRadialGradient(
        b.x - b.radius * 0.3, b.y - b.radius * 0.3, b.radius * 0.1,
        b.x, b.y, b.radius
      );

      if (b.type === 'cue') {
        // 母球：米白奶油色
        radGrad.addColorStop(0, '#ffffff');
        radGrad.addColorStop(1, '#e3ded5');
        this.ctx.fillStyle = radGrad;
        
        // 软投影
        this.ctx.shadowColor = 'rgba(0,0,0,0.25)';
        this.ctx.shadowBlur = 5;
        this.ctx.shadowOffsetY = 3;
      } else {
        // 目标球：马卡龙糖果色
        radGrad.addColorStop(0, '#ffffff');
        radGrad.addColorStop(0.25, b.color);
        radGrad.addColorStop(1, this.shadeColor(b.color, -30));
        this.ctx.fillStyle = radGrad;
        
        this.ctx.shadowColor = 'rgba(0,0,0,0.2)';
        this.ctx.shadowBlur = 4;
        this.ctx.shadowOffsetY = 2;
      }

      this.ctx.beginPath();
      this.ctx.arc(b.x, b.y, b.radius, 0, Math.PI * 2);
      this.ctx.fill();

      // 在目标球球体上渲染可爱的中心白圆数字标签 (类似真实黑八)
      if (b.type === 'brick-ball') {
        const tagRadius = b.isBoss ? 9 : 4.5;
        this.ctx.fillStyle = '#ffffff';
        this.ctx.beginPath();
        this.ctx.arc(b.x, b.y, tagRadius, 0, Math.PI * 2);
        this.ctx.fill();

        // 绘制标签数字
        this.ctx.fillStyle = '#2d3748';
        this.ctx.font = `bold ${b.isBoss ? '12px' : '7px'} sans-serif`;
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText(b.hp, b.x, b.y + (b.isBoss ? 0.5 : 0.2));
      }
      
      this.ctx.restore();
    });

    // 5. 绘制瞄准牵引皮筋
    this.drawSlingshotGuide();

    // 6. 绘制碎片爆破粒子与飘字
    this.particles.forEach(p => p.draw(this.ctx));
    
    this.ctx.restore();
  }

  // 辅助颜色亮度微调函数
  shadeColor(color, percent) {
    let R = parseInt(color.substring(1, 3), 16);
    let G = parseInt(color.substring(3, 5), 16);
    let B = parseInt(color.substring(5, 7), 16);

    R = parseInt(R * (100 + percent) / 100);
    G = parseInt(G * (100 + percent) / 100);
    B = parseInt(B * (100 + percent) / 100);

    R = (R < 255) ? R : 255;
    G = (G < 255) ? G : 255;
    B = (B < 255) ? B : 255;

    const rHex = R.toString(16).padStart(2, '0');
    const gHex = G.toString(16).padStart(2, '0');
    const bHex = B.toString(16).padStart(2, '0');

    return `#${rHex}${gHex}${bHex}`;
  }

  checkUrlSSOToken() {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('sso_access_token');
    const userStr = urlParams.get('sso_user');
    if (token && userStr) {
      localStorage.setItem('sso_access_token', token);
      localStorage.setItem('sso_user', userStr);
      
      // 清理 URL 参数
      urlParams.delete('sso_access_token');
      urlParams.delete('sso_user');
      const cleanQuery = urlParams.toString();
      const cleanUrl = window.location.pathname + (cleanQuery ? '?' + cleanQuery : '') + window.location.hash;
      window.history.replaceState({}, document.title, cleanUrl);
    }
  }

  // ==================== SSO 登录界面处理 ====================
  initSSOWidget() {
    const avatarBtn = document.getElementById('account-avatar-btn');
    
    const updateUI = () => {
      const token = localStorage.getItem('sso_access_token');
      const userStr = localStorage.getItem('sso_user');
      
      if (token && userStr) {
        try {
          const user = JSON.parse(userStr);
          if (avatarBtn) {
            avatarBtn.textContent = user.username.slice(0, 1).toUpperCase();
            avatarBtn.setAttribute('aria-label', `账号：${user.username}`);
            avatarBtn.title = `账号：${user.username}`;
          }
        } catch(e) {
          if (avatarBtn) avatarBtn.textContent = '👤';
        }
      } else {
        if (avatarBtn) {
          avatarBtn.textContent = '👤';
          avatarBtn.setAttribute('aria-label', '账号登录');
          avatarBtn.title = '账号登录';
        }
      }
    };

    // 全局暴露弹窗操作
    window.showLoginModal = () => {
      const token = localStorage.getItem('sso_access_token');
      const userStr = localStorage.getItem('sso_user');
      const loggedInPanel = document.getElementById('sso-logged-in-panel');
      const loggedOutPanel = document.getElementById('sso-logged-out-panel');
      
      if (token && userStr) {
        try {
          const user = JSON.parse(userStr);
          document.getElementById('sso-modal-avatar').src = user.avatar || 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%23718096"%3E%3Ccircle cx="12" cy="8" r="4"/%3E%3Cpath d="M12 14c-4 0-6 2-6 4v2h12v-2c0-2-2-4-6-4z"/%3E%3C/svg%3E';
          document.getElementById('sso-modal-username').textContent = user.username;
          
          if (loggedInPanel) loggedInPanel.style.display = 'block';
          if (loggedOutPanel) loggedOutPanel.style.display = 'none';
        } catch (e) {
          if (loggedInPanel) loggedInPanel.style.display = 'none';
          if (loggedOutPanel) loggedOutPanel.style.display = 'block';
        }
      } else {
        if (loggedInPanel) loggedInPanel.style.display = 'none';
        if (loggedOutPanel) loggedOutPanel.style.display = 'block';
      }
      
      const loginModal = document.getElementById('login-modal');
      if (loginModal) {
        loginModal.style.display = 'flex';
        loginModal.classList.remove('hidden');
      }
    };

    window.hideLoginModal = () => {
      const loginModal = document.getElementById('login-modal');
      if (loginModal) {
        loginModal.style.display = 'none';
        loginModal.classList.add('hidden');
      }
    };

    window.closeLoginModal = (e) => {
      if (e.target === e.currentTarget) window.hideLoginModal();
    };

    window.loginWithSSO = () => {
      const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
      let homeUrl = isLocal ? 'http://127.0.0.1:8000/index.html' : '/index.html';
      if (document.referrer && (document.referrer.includes('index.html') || document.referrer.endsWith('/'))) {
        try {
          const refUrl = new URL(document.referrer);
          if (refUrl.pathname === '/' || refUrl.pathname.endsWith('/index.html')) {
            homeUrl = refUrl.origin + refUrl.pathname;
          }
        } catch(e) {}
      }
      
      const returnUrl = window.location.href;
      window.location.href = `${homeUrl}?sso_return_url=${encodeURIComponent(returnUrl)}`;
    };

    window.logoutSSO = () => {
      localStorage.removeItem('sso_access_token');
      localStorage.removeItem('sso_user');
      updateUI();
      window.hideLoginModal();
      window.location.reload();
    };

    updateUI();
  }

  // ==================== 云端跨域保存 ====================
  async syncCloudData() {
    const token = localStorage.getItem('sso_access_token');
    if (!token) return;

    try {
      const response = await fetch(`${this.apiHost}/api/game/data?game_id=billiards`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const resData = await response.json();
      if (resData && resData.success && resData.data) {
        const cloudScore = resData.data.score || 0;
        const cloudSave = resData.data.save_data;

        if (cloudScore > this.highScore) {
          this.highScore = cloudScore;
          localStorage.setItem('pool_highScore', this.highScore);
          this.updateHUD();
        } else if (this.highScore > cloudScore) {
          this.saveCloudData(this.highScore, {
            maxUnlockedLevel: parseInt(localStorage.getItem('pool_maxUnlockedLevel') || '1')
          });
        }

        if (cloudSave && cloudSave.maxUnlockedLevel) {
          const localMax = parseInt(localStorage.getItem('pool_maxUnlockedLevel') || '1');
          if (cloudSave.maxUnlockedLevel > localMax) {
            localStorage.setItem('pool_maxUnlockedLevel', cloudSave.maxUnlockedLevel);
          } else if (localMax > cloudSave.maxUnlockedLevel) {
            this.saveCloudData(this.highScore, {
              maxUnlockedLevel: localMax
            });
          }
        }
      }
    } catch (err) {
      console.error('Failed to sync cloud data:', err);
    }
  }

  async saveCloudData(score, saveData) {
    const token = localStorage.getItem('sso_access_token');
    if (!token) return;

    try {
      await fetch(`${this.apiHost}/api/game/score`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          game_id: 'billiards',
          score: score,
          save_data: saveData
        })
      });
    } catch (err) {
      console.error('Failed to save cloud data:', err);
    }
  }

  async loadLeaderboard() {
    const listEl = document.getElementById('leaderboard-list');
    if (!listEl) return;
    listEl.textContent = '加载中...';

    try {
      const response = await fetch(`${this.apiHost}/api/game/leaderboard?game_id=billiards`);
      const data = await response.json();

      if (data && data.success && data.leaderboard && data.leaderboard.length > 0) {
        listEl.innerHTML = data.leaderboard.map((row, index) => `
          <div class="leaderboard-item">
            <span>${index + 1}. ${row.username}</span>
            <strong>${row.score} 分</strong>
          </div>
        `).join('');
      } else {
        listEl.textContent = '暂无排行记录';
      }
    } catch (err) {
      console.error('Failed to load leaderboard:', err);
      listEl.textContent = '加载失败';
    }
  }
}

// ==========================================
// 游戏初始化和自循环
// ==========================================
const game = new NeonPoolGame();

function gameLoop() {
  game.update();
  game.draw();
  
  if (game.starfield) {
    game.starfield.draw(game.bgCtx);
  }
  
  requestAnimationFrame(gameLoop);
}

// 启动循环
requestAnimationFrame(gameLoop);
