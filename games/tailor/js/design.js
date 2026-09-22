/**
 * 一起做裙子 (Let's Tailor!) - 外婆的裁缝手记与剪裁纸样设计图库
 * 包含四大篇章演化史、古希腊基同裙 (Chiton) 纸样参数与工艺科普
 */

const CHAPTER_DESIGNS = [
    {
        id: 1,
        eraKey: 'greek_chiton',
        name: '第一篇章：古希腊基同裙',
        latinName: 'Chiton',
        subtitle: '以布为形 · 自然垂坠',
        tagline: '结构最原始，强调布料的垂坠与流动',
        unlocked: true,
        bgmTrack: 'gymnopedie',
        storyIntro: {
            title: '外婆的手记 · 卷一：希腊拂风',
            content: '“我的孩子，翻开手记第一页，你会发现最早的人类衣裳从不强行裁剪肢体。古希腊人用两幅最质朴的长方形亚麻布，仅借由双肩各一枚青铜纤布拉别针与一根细腰绳，便让布料在重力下流淌出如多立克神庙石柱般庄严而柔和的自然垂褶。做这条裙子，心要静，手要顺应布料的性子。”'
        },
        patternData: {
            type: 'rectangle_drape',
            pieces: [
                { id: 'front', name: '前片 (矩形布片)', widthCm: 140, heightCm: 155, fold: true },
                { id: 'back', name: '后片 (矩形布片)', widthCm: 140, heightCm: 155, fold: true }
            ],
            // 裁剪引导：矩形布匹裁剪线与对折中线
            cutLines: [
                { from: { x: 0.15, y: 0.18 }, to: { x: 0.85, y: 0.18 }, label: '上端边缘平齐线' },
                { from: { x: 0.50, y: 0.18 }, to: { x: 0.50, y: 0.82 }, label: '前后片裁开中线 (剪刀下落)' },
                { from: { x: 0.15, y: 0.82 }, to: { x: 0.85, y: 0.82 }, label: '下摆齐边线' }
            ],
            // 车缝引导：侧边缝合线 (自下而上车合侧边)
            sewLines: [
                { from: { x: 0.5, y: 0.95 }, to: { x: 0.5, y: 0.15 }, label: '侧缝合缝线 (自下而上)' }
            ],
            // 结构装配标点
            attachments: [
                { id: 'pin_left', name: '左肩纤布拉别针', defaultPos: { x: -0.16, y: 1.40, z: 0.05 }, snapRadius: 0.08 },
                { id: 'pin_right', name: '右肩纤布拉别针', defaultPos: { x: 0.16, y: 1.40, z: 0.05 }, snapRadius: 0.08 },
                { id: 'belt_waist', name: '腰带系束线 (形成浪褶)', defaultPos: { x: 0.0, y: 0.95, z: 0.0 }, snapRadius: 0.10 }
            ]
        },
        features: [
            { num: 1, title: '以矩形布片为主', desc: '裁剪极少，保持整匹织物的完整与神圣感。' },
            { num: 2, title: '几乎不依赖省道', desc: '不作人体曲面分割，纯粹通过别针与系带塑形。' },
            { num: 3, title: '肩部完全开放', desc: '左右肩以纤布拉 (Fibula) 别针固定连结。' },
            { num: 4, title: '重重褶裙自然下坠', desc: '利用天然重力形成流动的柱状立体垂褶。' },
            { num: 5, title: '结构最原始纯粹', desc: '强调布料与人体呼吸共振的流动古典美。' },
            { num: 6, title: '侧边自由选择', desc: '可只缝合身体单侧或双侧，亦可完全敞开。' }
        ],
        recommendedFabrics: ['linen', 'organza', 'cotton'],
        silhouette: 'chiton'
    },
    {
        id: 2,
        eraKey: 'rococo_pannier',
        name: '第二篇章：洛可可大裙撑',
        latinName: 'Pannier & Corset',
        subtitle: '宫廷奢华 · 鲸骨塑腰',
        tagline: '横向夸张两米大跨，极致蜂腰与蕾丝层叠',
        unlocked: false,
        unlockCondition: '完成第一篇章拍卖且金币达到 260',
        bgmTrack: 'barcarolle',
        storyIntro: {
            title: '外婆的手记 · 卷二：凡尔赛的喧嚣',
            content: '“告别了质朴自然，18世纪的凡尔赛宫廷将制衣推向了建筑式的工程学极致。工匠们用鲸须勒紧细腰，用柳条与钢圈支起两米宽的横向裙撑。这里需要层层叠叠的法式蕾丝与深红天鹅绒。”'
        },
        recommendedFabrics: ['velvet', 'silk'],
        silhouette: 'ballgown'
    },
    {
        id: 3,
        eraKey: 'new_look',
        name: '第三篇章：巴黎黄金剪裁',
        latinName: 'New Look 1947',
        subtitle: '花冠盛放 · 45°斜裁',
        tagline: '玛德琳·维奥内的斜裁神话与迪奥的新风貌',
        unlocked: false,
        unlockCondition: '完成第二篇章且工坊声望达到 60',
        bgmTrack: 'clair_de_lune',
        storyIntro: {
            title: '外婆的手记 · 卷三：斜裁的神迹',
            content: '“这是高定史上最耀眼的黄金时代。将布料以45度角斜向裁剪，原本僵硬的织物瞬间获得了像弹力丝一般的柔顺延展。下摆如盛开的花冠，那是对战后灰暗世界的最美致敬。”'
        },
        recommendedFabrics: ['silk', 'tweed'],
        silhouette: 'a_line'
    },
    {
        id: 4,
        eraKey: 'deconstructivism',
        name: '第四篇章：现代先锋解构',
        latinName: 'Deconstructivism',
        subtitle: '打破对称 · 自由诗意',
        tagline: '打破传统剪裁法则，星空纱与立体雕塑',
        unlocked: false,
        unlockCondition: '完成第三篇章且声望达到 120',
        bgmTrack: 'air_on_g_string',
        storyIntro: {
            title: '外婆的手记 · 卷四：未完的自由之诗',
            content: '“裙子最终要回到自我。不必迎合任何人的目光，你可以剪碎规整的对称，用不对称的悬垂、透明的星空纱与硬挺的现代线条，重构属于这个时代的锋芒与诗意。”'
        },
        recommendedFabrics: ['organza', 'silk', 'velvet'],
        silhouette: 'column'
    }
];

window.CHAPTER_DESIGNS = CHAPTER_DESIGNS;
