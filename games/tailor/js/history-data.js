/**
 * 一起做裙子 (Let's Tailor!) - 服饰文明演变与裁缝手账知识库
 * 涵盖4大历史时期、核心工艺解锁树、高定订单与深度历史科普 (无原生Emoji，全面矢量化)
 */

const TAILOR_HISTORY_STAGES = [
    {
        id: 0,
        name: '古典与质朴',
        eraTitle: '公元前5世纪 - 公元14世纪',
        badge: '古典与质朴',
        iconName: 'lucide:landmark',
        bgTheme: '#fdf2f4',
        description: '人类最早的制衣智慧：顺应织物重力与天然垂坠，无需繁复裁剪。',
        unlockRequirement: '初入工坊，自由开启',
        unlockedSilhouettes: ['chiton', 'a_line'],
        unlockedFabrics: ['cotton', 'linen'],
        unlockedAccessories: ['greek_rope', 'pearl_row'],
        orders: [
            {
                id: 'order_1',
                client: '雅典娜祭司',
                name: '雅典卫城的白亚麻托加',
                silhouette: 'chiton',
                fabric: 'linen',
                color: '#d6c6ad',
                rewardCoins: 120,
                rewardInfluence: 15,
                dialogue: '“神庙的大风吹拂时，裙褶应当如帕特农神庙的多立克柱般挺拔庄严。”'
            }
        ],
        lore: {
            id: 'lore_chiton_drape',
            title: '打褶是人类最早的塑形魔法',
            subtitle: '古希腊基同（Chiton）与几何垂坠',
            icon: 'lucide:landmark',
            content: `在剪刀与精细打板尚未出现的古典时代，古希腊人仅用一块长方形亚麻或羊毛织物，配合两枚金属别针（Fibula）固定在双肩，便创造了西方服饰史上最纯粹的垂褶美学。

古希腊哲人认为，衣物不该束缚或切割身体，而应顺应肉体行动的韵律。微风吹过时，重力使松弛的织物自然下坠形成起伏跌宕的阴影，宛如大理石雕塑一般永恒优雅。这种“以布就人”的理念，至今仍是现代高级定制的立裁灵感源泉。`
        }
    },
    {
        id: 1,
        name: '宫廷繁复期',
        eraTitle: '17世纪 - 19世纪晚期',
        badge: '宫廷繁复期',
        iconName: 'lucide:crown',
        bgTheme: '#fce8eb',
        description: '巴洛克与洛可可极尽奢华：鱼骨胸衣重塑蜂腰，巨型裙撑构筑建筑感奇观。',
        unlockRequirement: '完成古典时期作品并获得 200 金币',
        unlockedSilhouettes: ['ballgown', 'a_line'],
        unlockedFabrics: ['velvet', 'cotton', 'linen'],
        unlockedAccessories: ['lace_hem', 'bow_velvet_red', 'court_corset_belt'],
        orders: [
            {
                id: 'order_2',
                client: '蓬巴杜侯爵夫人',
                name: '凡尔赛玫瑰天鹅绒蓬裙',
                silhouette: 'ballgown',
                fabric: 'velvet',
                color: '#631d2b',
                rewardCoins: 240,
                rewardInfluence: 35,
                dialogue: '“让裙撑横向张开两米！所有的缎带与蕾丝都要极尽精美，路易的舞会只属于夺目之人。”'
            }
        ],
        lore: {
            id: 'lore_rococo_corset',
            title: '鲸须与裙撑的力学奇迹',
            subtitle: '洛可可（Rococo）物理骨架的体态重塑',
            icon: 'lucide:crown',
            content: `18世纪欧洲宫廷对女性沙漏型身材的狂热，促使了早期服装工程学的爆发。

裁缝们采用坚韧兼具弹性的深海弓头鲸鲸须（Whalebone）缝入紧身胸衣（Corset），将腰围强力压缩至惊人的三四十厘米；同时下身借助竹篾、柳条与金属钢圈构筑庞大的侧撑裙架（Pannier）。
虽然这种结构极大限制了行动，却让服装首次脱离了人体原本轮廓，成为展示手工刺绣、昂贵蕾丝与天鹅绒的移动三维画廊。`
        }
    },
    {
        id: 2,
        name: '黄金剪裁期',
        eraTitle: '1920年代 - 1950年代',
        badge: '黄金剪裁期',
        iconName: 'lucide:scissors',
        bgTheme: '#fbf0f2',
        description: '身体大解放与高定黄金年代：45度斜裁如水银泻地，Dior新风貌优雅复苏。',
        unlockRequirement: '完成宫廷时期作品并获得 380 金币',
        unlockedSilhouettes: ['mermaid', 'column', 'a_line'],
        unlockedFabrics: ['silk', 'tweed', 'velvet', 'cotton', 'linen'],
        unlockedAccessories: ['bow_gold_satin', 'vintage_frogs', 'pearl_row'],
        orders: [
            {
                id: 'order_3',
                client: '巴黎时尚主编',
                name: '盖茨比流金夜宴鱼尾裙',
                silhouette: 'mermaid',
                fabric: 'silk',
                color: '#f6f3eb',
                rewardCoins: 360,
                rewardInfluence: 60,
                dialogue: '“摆脱那些沉重的铁圈！我们要的是爵士乐般的轻快，真丝从肩头滑落到脚踝的绝对贴合。”'
            }
        ],
        lore: {
            id: 'lore_bias_cut',
            title: '斜裁之母Madeleine Vionnet',
            subtitle: '为什么45度对角剪裁能像液体般抚平身体？',
            icon: 'lucide:scissors',
            content: `在20世纪初，法国时装大师玛德琳·维奥内（Madeleine Vionnet）发现了布料隐藏的几何秘密：通常平行于经线或纬线裁剪的面料缺乏弹性；但只要顺应经纬45度对角线（Bias Cut）下剪，原本僵硬的织物就会产生奇迹般的自然拉伸！

在没有弹力纤维（氨纶）与拉链的时代，维奥内的45度斜裁真丝裙不需要任何纽扣，就能像液体一般柔顺地顺应女性起伏，被世人誉为“时装界的欧几里得几何革命”。`
        }
    },
    {
        id: 3,
        name: '现代解构与自由',
        eraTitle: '1970年代至今',
        badge: '现代解构与自由',
        iconName: 'lucide:sparkles',
        bgTheme: '#fff0f3',
        description: '打破身体常规与材料跨界：星空透明欧根纱、烫钻激光雕花与无性别纯粹表达。',
        unlockRequirement: '声望达到 80 并解锁前三时代',
        unlockedSilhouettes: ['a_line', 'chiton', 'ballgown', 'mermaid', 'column'],
        unlockedFabrics: ['organza', 'silk', 'tweed', 'velvet', 'linen', 'cotton'],
        unlockedAccessories: ['lace_guipure', 'star_gem', 'gold_vine'],
        orders: [
            {
                id: 'order_4',
                client: '先锋建筑艺术家',
                name: '星际云雾立体折纸高定裙',
                silhouette: 'a_line',
                fabric: 'organza',
                color: '#e4ebf5',
                rewardCoins: 500,
                rewardInfluence: 100,
                dialogue: '“裙子就是行走的建筑雕塑。让硬纱与光影互动，模糊衣服与空间的边界。”'
            }
        ],
        lore: {
            id: 'lore_modern_deconstruct',
            title: '解构主义与无性别自由剪裁',
            subtitle: '从三宅一生“一块布”到先锋哲学',
            icon: 'lucide:sparkles',
            content: `进入现代高定时装周，设计师们不再局限于传统的女性曲线迎合。

从三宅一生的“A-POC（一块布）”计算机一体针织技术，到川久保玲打破对称的非几何缝合，时装成为独立于身体的艺术哲学载体。新材料的介入——如发光光纤、记忆金属丝与环保可降解凝胶，让现代裙装成为表达自我意识与文化包容的最佳画布。`
        }
    }
];

window.TAILOR_HISTORY_STAGES = TAILOR_HISTORY_STAGES;
