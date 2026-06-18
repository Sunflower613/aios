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
        seaWater: 0x00e5ff,   // Bright glowing turquoise ocean
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
  }
};
