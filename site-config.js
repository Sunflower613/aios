// site-config.js - Unified Configuration for 2D Homepage and 3D Scenes

export const siteConfig = {
  // Developer details integrated into 2D and 3D scenes
  developer: {
    name: "Sunflower",
    tagline: "大三学生一枚啦~ 🪐 热爱创意编程与视觉交互",
    bio: "你好！欢迎光临我的个人主页。我是一名大三学生，热衷于创造有趣、灵动且具备卓越交互体验的网页与 3D 数字化空间。在这里，你可以四处探索，查看我的技术栈，或者在复古街机前坐下，畅玩我搜集和制作的小游戏！",
    avatar: "🌻",
    email: "2963707761@qq.com",
    github: "https://github.com/Sunflower613",
    contacts: [
      { name: "个人简介", action: "alert", value: "大三学生一枚啦~" },
      { name: "我的课表", action: "link", value: "class.html" },
      { name: "我的相册", action: "link", value: "album.html" },
      { name: "和我联系", action: "confirm", value: "2963707761@qq.com" }
    ]
  },

  // Games listed in the "韭菜盒子" (Leek Box) board and interactive arcade machines
  games: [
    { 
      id: "paint",
      name: "调色盘", 
      path: "./games/paint/paint2.html", 
      icon: "./games/paint/point.png", 
      color: "#e1f5fe",
      emoji: "🎨"
    },
    { 
      id: "divine",
      name: "小六壬", 
      path: "./games/divine/xiaoLiuRen.html", 
      icon: "./games/divine/img/hand.jpg", 
      color: "#ede7f6",
      emoji: "🔮"
    },
    { 
      id: "particles",
      name: "随心粒子", 
      path: "./games/particles/magicParticles.html", 
      icon: "./games/particles/particles.png", 
      color: "#e0f2f1",
      emoji: "✨"
    },
    { 
      id: "firework",
      name: "烟花", 
      path: "./games/particles/firework.html", 
      icon: "./games/particles/firework.png", 
      color: "#fff3e0",
      emoji: "🎆"
    },
    { 
      id: "shang",
      name: "赏", 
      path: "./games/animation/shang.html", 
      icon: "./games/animation/huang.jpg", 
      color: "#fbe9e7",
      emoji: "🍂"
    },
    { 
      id: "color",
      name: "#color", 
      path: "./games/color/colorTrasfer.html", 
      icon: "./games/color/color.png", 
      color: "#ffffff",
      emoji: "🌈"
    },
    { 
      id: "lottery",
      name: "抽奖", 
      path: "./games/lottery/prizeDraw.html", 
      icon: "./games/lottery/wheel.png", 
      color: "#fffde7",
      emoji: "🎡"
    },
    { 
      id: "watermelon",
      name: "合西瓜", 
      path: "./games/watermelon/watermelon.html", 
      icon: "./games/watermelon/watermelon.png", 
      color: "green",
      emoji: "🍉"
    },
    { 
      id: "toilet",
      name: "沉淀", 
      path: "./games/toilet/cal-toilet.html", 
      icon: "./games/toilet/toilet.jpg", 
      color: "#eceff1",
      emoji: "🚽"
    },
    { 
      id: "21dian",
      name: "21点", 
      path: "./games/21dian/index.html", 
      icon: "data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22white%22%20stroke%3D%22white%22%20stroke-width%3D%220.5%22%3E%3Cpath%20d%3D%22M12%2018v4%22/%3E%3Cpath%20d%3D%22M2%2014.499a5.5%205.5%200%200%200%209.591%203.675.6.6%200%200%201%20.818.001A5.5%205.5%200%200%200%2022%2014.5c0-2.29-1.5-4-3-5.5l-5.492-5.312a2%202%200%200%200-3-.02L5%208.999c-1.5%201.5-3%203.2-3%205.5%22/%3E%3C/svg%3E", 
      color: "#146b3a",
      emoji: "🃏"
    },
    { 
      id: "note",
      name: "备忘清单", 
      path: "./note.html", 
      icon: "data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22white%22%20stroke-width%3D%222.5%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpath%20d%3D%22M16%204h2a2%202%200%200%201%202%202%20v14a2%202%200%200%201-2%202H6a2%202%200%200%201-2-2V6a2%202%200%200%201%202-2h2%22%3E%3C/path%3E%3Crect%20x%3D%228%22%20y%3D%222%22%20width%3D%228%22%20height%3D%224%22%20rx%3D%221%22%20ry%3D%221%22%3E%3C/rect%3E%3Cline%20x1%3D%229%22%20y1%3D%2212%22%20x2%3D%2215%22%20y2%3D%2212%22%3E%3C/line%3E%3Cline%20x1%3D%229%22%20y1%3D%2216%22%20x2%3D%2215%22%20y2%3D%2216%22%3E%3C/line%3E%3C/svg%3E",
      color: "#ffa726",
      emoji: "📝"
    },
    { 
      id: "billiards",
      name: "可爱台球", 
      path: "./games/billiards/index.html", 
      icon: "data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22white%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Ccircle%20cx%3D%2212%22%20cy%3D%2212%22%20r%3D%2210%22%20fill%3D%22%23ffb3ba%22%20stroke%3D%22white%22/%3E%3Ccircle%20cx%3D%2212%22%20cy%3D%2212%22%20r%3D%224%22%20fill%3D%22white%22/%3E%3Ctext%20x%3D%2212%22%20y%3D%2215.5%22%20font-size%3D%227%22%20font-family%3D%22system-ui%22%20font-weight%3D%22bold%22%20fill%3D%22%23ff6b81%22%20text-anchor%3D%22middle%22%3E8%3C/text%3E%3C/svg%3E",
      color: "#ff8fa3",
      emoji: "🎱"
    },
    { 
      id: "svg",
      name: "矢量绘图", 
      path: "./games/SVG/svg.html", 
      icon: "data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22white%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpath%20d%3D%22M12%2022a1%201%200%200%201%200-20%2010%209%200%200%201%2010%209%205%205%200%200%201-5%205h-2.25a1.75%201.75%200%200%200-1.4%202.8l.3.4a1.75%201.75%200%200%201-1.4%202.8z%22%3E%3C/path%3E%3Ccircle%20cx%3D%2213.5%22%20cy%3D%226.5%22%20r%3D%22.5%22%20fill%3D%22white%22%3E%3C/circle%3E%3Ccircle%20cx%3D%2217.5%22%20cy%3D%2210.5%22%20r%3D%22.5%22%20fill%3D%22white%22%3E%3C/circle%3E%3Ccircle%20cx%3D%226.5%22%20cy%3D%2212.5%22%20r%3D%22.5%22%20fill%3D%22white%22%3E%3C/circle%3E%3Ccircle%20cx%3D%228.5%22%20cy%3D%227.5%22%20r%3D%22.5%22%20fill%3D%22white%22%3E%3C/circle%3E%3C/svg%3E", 
      color: "#7c3aed",
      emoji: "🎨"
    }
  ],

  // Active theme controlling the 3D scene aesthetics and models
  // Available themes: "beach", "christmas"
  activeTheme: "beach", 

  // Theme palettes and details
  themes: {
    beach: {
      name: "夏日海滨沙滩",
      colors: {
        sky: 0xb2ebf2,        // Light cyan blue
        sand: 0xffe082,       // Warm yellow sand
        dirt: 0xd7ccc8,       // Sandy brown rim
        seaWater: 0x4fc3f7,   // Light turquoise blue ocean
        fog: 0xb2ebf2
      },
      player: {
        hairColor: 0xff4081,  // Pink hair
        hatColor: 0xfff9c4,   // Straw hat yellow
        clothingColor: 0x4fc3f7 // Light blue overalls
      }
    },
    christmas: {
      name: "冬日雪地圣诞",
      colors: {
        sky: 0x050c18,        // Dark starry navy night sky
        sand: 0xf5fafd,       // Snowy pure white ground
        dirt: 0xb0bec5,       // Frosted blue-grey rim
        seaWater: 0x001020,   // Dark icy navy ocean
        fog: 0x050c18
      },
      player: {
        hairColor: 0xe0f7fa,  // Frosty light blue/silver hair
        hatColor: 0xd50000,   // Bright red Santa hat!
        clothingColor: 0xc62828 // Warm red winter coat
      }
    }
  },

  // Shop goods available in the digital store
  shopGoods: {
    agriculture: [
      {
        id: 'sunflower_seed',
        name: '向日葵种子 🌻',
        price: 10,
        desc: '成熟需要 30 秒。收割可获得 20 金币 + 15 经验。',
        quality: 'green',
        type: 'seed',
        icon: '🌻'
      },
      {
        id: 'strawberry_seed',
        name: '草莓种子 🍓',
        price: 20,
        desc: '成熟需要 60 秒。收割可获得 45 金币 + 35 经验。',
        quality: 'blue',
        type: 'seed',
        icon: '🍓'
      }
    ],
    decorations: [
      { id: 'painting_1', name: '浮空岛日落挂画 🖼️', price: 50, desc: '悬挂在墙壁上的精美装饰，带来悠闲的落日余晖。', type: 'decor', quality: 'purple', icon: '🖼️' },
      { id: 'tree_1', name: '闪烁圣诞树 🎄', price: 100, desc: '闪耀着七彩微光的圣诞树，散发节日温馨氛围。', type: 'decor', quality: 'purple', icon: '🎄' },
      { id: 'sofa_1', name: '粉嫩兔子沙发 🛋️', price: 150, desc: '兔耳设计的粉色单人沙发，触感松软，极度舒适。', type: 'decor', quality: 'purple', icon: '🛋️' },
      { id: 'swing_1', name: '室内网兜秋千 🎪', price: 200, desc: '挂在天花板上的编织网秋千，轻轻摇曳，治愈满满。', type: 'decor', quality: 'purple', icon: '🎪' }
    ],
    topup: [
      { id: 'coin_100', name: '免费金币充值包 🪙', amount: 100, desc: '白嫖小包。免费充值 100 金币，附赠吃到金币声效！', type: 'topup', quality: 'gold', price: 0, icon: '🪙' },
      { id: 'coin_500', name: '金币充值礼包 🎁', amount: 500, desc: '免费大包。点击即刻免费充值 500 金币！', type: 'topup', quality: 'gold', price: 0, icon: '🎁' },
      { id: 'coin_1000', name: '超级金币充值包 💎', amount: 1000, desc: '免费巨包！狂揽 1000 金币，金币爆屏！', type: 'topup', quality: 'gold', price: 0, icon: '💎' }
    ]
  }
};
