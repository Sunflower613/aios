/**
 * 27 款经典手绘特饮配方字典、关卡配置与原料元数据 (分三章 · 每章 9 关)
 */

// 全局关卡编号格式化工具函数 (将 1~9 转为 1-1~1-9，10~18 转为 2-1~2-9，19~27 转为 3-1~3-9)
function formatLevelCode(level) {
    const lvl = parseInt(level, 10) || 1;
    if (lvl <= 9) return `1-${lvl}`;
    if (lvl <= 18) return `2-${lvl - 9}`;
    return `3-${lvl - 18}`;
}
if (typeof window !== "undefined") {
    window.formatLevelCode = formatLevelCode;
}

const DRINK_RECIPES = [
    {
        id: "winter_breath",
        level: 1,
        chapter: 1,
        name: "冬之息",
        subtitle: "Winter's Breath",
        glassType: "classic",
        liquid: {
            id: "ice_blue",
            name: "冰蓝苏打",
            colorTop: "#84d8ff",
            colorBottom: "#288fce",
            hasBubbles: true
        },
        inCupItems: ["heart_ice"],
        foamLayer: "snow_wood",
        topper: "snowman",
        effect: "snow_sparkle",
        colorBadge: "#38a1db",
        desc: "如冬日初雪般清冽甘甜，心形冰块在蓝晶茶汤中微漾，雪人静静守护着纯白思绪。",
        customer: {
            name: "探险家小企鹅",
            avatar: "🐧",
            dialogue: "“冰川的风好大，在雪地里走了好久好久……能为我调一杯清凉入梦的‘冬之息’吗？杯中浮着冻住的纯白心绪，如果还有个围巾小雪人守在身旁，就像回到温暖的家一样。”"
        },
        tags: ["冰蓝", "爱心冰", "小雪人"]
    },
    {
        id: "sands_of_time",
        level: 2,
        chapter: 1,
        name: "指间沙",
        subtitle: "Sands of Time",
        glassType: "hourglass",
        liquid: {
            id: "golden_sand",
            name: "流金沙茶",
            colorTop: "#f9e0b8",
            colorBottom: "#d89c56",
            hasBubbles: false
        },
        inCupItems: ["sand_beads"],
        foamLayer: "sand_plate",
        topper: "sand_castle",
        effect: "sand_glimmer",
        colorBadge: "#dfaa6b",
        desc: "流逝的时间凝聚在沙漏之中，城堡巍峨立于顶端，入口即化，泛起焦糖与坚果香。",
        customer: {
            name: "时间旅人",
            avatar: "⌛",
            dialogue: "“时间如指间细沙，握得越紧，溜得越快。请为我倒一杯沙漏里的‘指间沙’吧，让沉底的金沙记住岁月，让沙雕城堡驻留顶端，静静品味时光流转的温存。”"
        },
        tags: ["沙漏杯", "流金沙", "沙雕堡"]
    },
    {
        id: "queen_thorn",
        level: 3,
        chapter: 1,
        name: "王妃鬼藤",
        subtitle: "Queen's Thorn",
        glassType: "classic",
        liquid: {
            id: "lime_green",
            name: "青柠仙草液",
            colorTop: "#e9f99c",
            colorBottom: "#9ed328",
            hasBubbles: false
        },
        inCupItems: ["queen_vine"],
        foamLayer: "none",
        topper: "pink_rose",
        effect: "green_sparkle",
        colorBadge: "#bada46",
        desc: "带刺的翠绿花藤在青柠汁液中优雅蔓延，盛放的粉玫瑰散发着高贵而微酸的清香。",
        customer: {
            name: "玫瑰伯爵",
            avatar: "🌹",
            dialogue: "“高贵总伴随着荆棘，而优雅亦如是。来一杯清冷高雅的‘王妃鬼藤’吧，任绿蔓在青柠微酸中缠绵，让粉玫瑰静静绽放，今夜是属于克制与芬芳的。”"
        },
        tags: ["青柠绿", "鬼藤蔓", "粉玫瑰"]
    },
    {
        id: "cinderella",
        level: 4,
        chapter: 1,
        name: "灰姑娘",
        subtitle: "Cinderella",
        glassType: "classic",
        liquid: {
            id: "sunset_orange",
            name: "绯红落日液",
            colorTop: "#ff5e62",
            colorBottom: "#dc2626",
            hasBubbles: false
        },
        inCupItems: ["crescent_moon"],
        foamLayer: "pumpkin_cream",
        topper: "pumpkin_flowers",
        effect: "magic_glimmer",
        colorBadge: "#e11d48",
        desc: "午夜十二点不会消失的魔法，南瓜与繁花相拥，金色弯月在绯红落日中甜蜜沉醉。",
        customer: {
            name: "赶路的仙女",
            avatar: "✨",
            dialogue: "“午夜的钟声快要敲响了，可我只想带走天边这抹不散的暮色。请给我一杯‘灰姑娘’，似落日绯红，让弯弯月色与南瓜繁花在梦醒前永不褪色。”"
        },
        tags: ["绯红落日", "弯月亮", "南瓜花"]
    },
    {
        id: "rain_by_ear",
        level: 5,
        chapter: 1,
        name: "耳边雨",
        subtitle: "Rain by the Ear",
        glassType: "classic",
        liquid: {
            id: "peach_pink",
            name: "蜜桃落雨苏打",
            colorTop: "#ffdbe1",
            colorBottom: "#f88195",
            hasBubbles: true
        },
        inCupItems: ["rain_drops"],
        foamLayer: "rain_cloud",
        topper: "none",
        effect: "soft_rain",
        colorBadge: "#f997a5",
        desc: "像听见窗台淅淅沥沥的雨声，云朵下滴落着甜粉色的水珠，温柔抚慰每一处烦躁。",
        customer: {
            name: "雨巷诗人",
            avatar: "🌧️",
            dialogue: "“窗外的雨淅淅沥沥，像落在心坎上的诗行。能给我调一杯‘耳边雨’吗？蜜桃微甜、轻云如雾，听着雨滴落在杯中的声音，便觉得世间皆可原谅。”"
        },
        tags: ["蜜桃粉", "彩雨滴", "落雨云"]
    },
    {
        id: "stars_in_clouds",
        level: 6,
        chapter: 1,
        name: "云里星",
        subtitle: "Stars in Clouds",
        glassType: "classic",
        liquid: {
            id: "midnight_blue",
            name: "深邃星空液",
            colorTop: "#3c6bb8",
            colorBottom: "#15264e",
            hasBubbles: true
        },
        inCupItems: ["constellation_stars"],
        foamLayer: "night_cloud",
        topper: "glowing_big_star",
        effect: "star_glitter",
        colorBadge: "#2e5499",
        desc: "将整片璀璨银河倒进玻璃杯，星云作盖，大黄星在顶端闪耀着明亮光芒。",
        customer: {
            name: "观星小狐狸",
            avatar: "🦊",
            dialogue: "“今晚的夜空深邃得像一口墨蓝的井，我捞了一兜星星来看你！能调一杯‘云里星’吗？把深蓝夜幕与星座都藏进杯里，让最耀眼的那颗星在云端守候着旅人。”"
        },
        tags: ["深蓝夜", "星座星", "发光星"]
    },
    {
        id: "twin_souls",
        level: 7,
        chapter: 1,
        name: "双生",
        subtitle: "Twin Souls",
        glassType: "classic",
        liquid: {
            id: "mist_purple",
            name: "极光雾紫液",
            colorTop: "#d7d2ec",
            colorBottom: "#796d9c",
            hasBubbles: false
        },
        inCupItems: ["ghost_particles"],
        foamLayer: "black_rose_cream",
        topper: "twin_ghosts",
        effect: "ghost_glow",
        colorBadge: "#9a8ebd",
        desc: "一蓝一紫的双生小幽灵在神秘黑玫瑰上嬉戏，芋香与黑巧交织的奇幻特调。",
        customer: {
            name: "夜游小魔女",
            avatar: "🧙‍♀️",
            dialogue: "“在幽暗的森林漫游太久，想念甜甜的灵巧魔法啦。来一杯‘双生’吧，像紫雾深处静静盛开的黑玫瑰，两只爱捉迷藏的小幽灵又在身边绕来绕去啦。”"
        },
        tags: ["雾紫色", "黑玫瑰", "双幽灵"]
    },
    {
        id: "ocean_dream",
        level: 8,
        chapter: 1,
        name: "海之梦",
        subtitle: "Ocean's Dream",
        glassType: "classic",
        liquid: {
            id: "deep_sea",
            name: "清澈海洋液",
            colorTop: "#a5e9ff",
            colorBottom: "#2f96cf",
            hasBubbles: true
        },
        inCupItems: ["coral_seaweed"],
        foamLayer: "ocean_ice_cap",
        topper: "bear_with_shell",
        effect: "ocean_bubbles",
        colorBadge: "#3ba8de",
        desc: "微缩的清凉海洋，海草与珊瑚在杯底摇曳，小白熊抱着心爱贝壳在浮冰上惬意漂浮。",
        customer: {
            name: "白熊船长",
            avatar: "🐻‍❄️",
            dialogue: "“好久没有听见海浪拍打船舷的微风声了……请给我一杯清澈的‘海之梦’。看着珊瑚草在浅海摇曳，自己就像那只抱着贝壳的小白熊，在浮冰上随波惬意漂流。”"
        },
        tags: ["海洋蓝", "珊瑚草", "贝壳熊"]
    },
    {
        id: "lucky_succulent",
        level: 9,
        name: "幸运盆栽",
        subtitle: "Lucky Succulent",
        glassType: "classic",
        liquid: {
            id: "rich_cocoa",
            name: "醇香可可泥土",
            colorTop: "#915a45",
            colorBottom: "#592e1e",
            hasBubbles: false
        },
        inCupItems: ["soil_pebbles"],
        foamLayer: "soil_top",
        topper: "green_succulent",
        effect: "plant_glow",
        colorBadge: "#70412e",
        chapter: 1,
        desc: "看似是一盆生机盎然的多肉植物，实则是层层浓郁丝滑的提拉米苏特饮，带来满满好运。",
        customer: {
            name: "小镇植物学家",
            avatar: "🌱",
            dialogue: "“泥土里藏着大地的呼吸，每一寸绿意都在用力发光。请给我来一杯‘幸运盆栽’，深褐泥土泛着可可的温厚，顶上长出一株胖乎乎的多肉，捧在手心便觉得无比踏实。”"
        },
        tags: ["可可棕", "深花泥", "大多肉"]
    },

    // ==========================================
    // 🔮 第二章：微醺与星芒 (第 10 ~ 18 关 · 网红渐变分层篇)
    // 解锁条件：消耗 300 💎 钻石开启
    // 特色：引入 1/2、1/3、1/4 量杯分层注液系统
    // ==========================================
    {
        id: "sunset_glow",
        level: 10,
        chapter: 2,
        name: "落日熔金",
        subtitle: "Sunset Glow",
        requiredCup: "half",
        glassType: "hourglass",
        liquid: { id: "sunset_orange", name: "绯红落日 + 流金沙茶 (1/2红金晚霞渐变)" },
        liquids: [
            { id: "sunset_orange", name: "绯红落日", colorTop: "#ff5e62", colorBottom: "#dc2626", ratio: 0.5 },
            { id: "golden_sand", name: "流金沙茶", colorTop: "#f9e0b8", colorBottom: "#d89c56", ratio: 0.5 }
        ],
        inCupItems: ["classic_ice"],
        foamLayer: "rain_cloud",
        topper: "pink_rose",
        effect: "star_shower",
        colorBadge: "#e11d48",
        desc: "红与金在黄昏里相拥相融，绯红落日缓缓晕开流金沙茶，晚霞漫天，温柔隽永。",
        customer: {
            name: "落日摄影师",
            avatar: "📸",
            dialogue: "“今天的黄昏把整条地平线都烧透了，红与金在余晖里温柔交融。我想将这一瞬间装进沙漏杯里——像是天边落日融进了流金黄昏，白云慢悠悠飘在上面，玫瑰在暮色中低语。”"
        },
        tags: ["红金渐变", "1/2量杯", "落日红霞"]
    },
    {
        id: "matcha_coconut_island",
        level: 11,
        chapter: 2,
        name: "生椰抹茶半岛",
        subtitle: "Matcha Coconut Wave",
        requiredCup: "half",
        glassType: "classic",
        liquid: { id: "coconut_white", name: "生椰乳 + 浓厚抹茶 (1/2双层渐变)" },
        liquids: [
            { id: "coconut_white", name: "浓纯生椰乳", colorTop: "#ffffff", colorBottom: "#ede5d8", ratio: 0.5 },
            { id: "matcha_deep", name: "浓厚抹茶", colorTop: "#a3d977", colorBottom: "#3e7b27", ratio: 0.5 }
        ],
        inCupItems: ["heart_ice"],
        foamLayer: "snow_wood",
        topper: "green_succulent",
        effect: "plant_glow",
        colorBadge: "#4ade80",
        desc: "甘醇温润的生椰乳铺底，缓缓浮起一抹清幽葱郁的抹茶翠色，分层如静谧竹岛。",
        customer: {
            name: "京都茶道家",
            avatar: "🍵",
            dialogue: "“一期一会，静水深流。若将南国的甘醇椰风，遇上山林清晨的浓绿茶烟，分明又包容。请为我做一杯‘生椰抹茶半岛’，静享这片绿意盎然的避世宁静。”"
        },
        tags: ["生椰抹茶", "1/2量杯", "经典分层"]
    },
    {
        id: "peach_moonlight",
        level: 12,
        chapter: 2,
        name: "粉雾蜜桃乌龙",
        subtitle: "White Peach Oolong",
        requiredCup: "half",
        glassType: "martini",
        liquid: { id: "peach_pink", name: "蜜桃落雨 + 琥珀乌龙 (1/2双层渐变)" },
        liquids: [
            { id: "peach_pink", name: "蜜桃落雨", colorTop: "#ffdbe1", colorBottom: "#f88195", ratio: 0.5 },
            { id: "amber_oolong", name: "琥珀乌龙", colorTop: "#e9bc84", colorBottom: "#a35b1d", ratio: 0.5 }
        ],
        inCupItems: ["rain_drops"],
        foamLayer: "none",
        topper: "pink_rose",
        effect: "snow_sparkle",
        colorBadge: "#fb7185",
        desc: "蜜桃果茸与冷萃琥珀乌龙在细长高脚杯中轻柔相融，浪漫若初恋的心事微漾。",
        customer: {
            name: "纯爱小说家",
            avatar: "📖",
            dialogue: "“故事里男女主角的第一次对视，总带着蜜桃的微甜和乌龙茶的回甘，克制却动人。来一杯细长高脚杯的‘粉雾蜜桃乌龙’吧，像初恋的心事在杯中轻柔晕开。”"
        },
        tags: ["蜜桃乌龙", "1/2量杯", "高脚杯"]
    },
    {
        id: "aurora_dream",
        level: 13,
        chapter: 2,
        name: "极光星夜",
        subtitle: "Galactic Aurora",
        requiredCup: "half",
        glassType: "sphere",
        liquid: { id: "ice_blue", name: "冰蓝苏打 + 极光雾紫 (1/2双层渐变)" },
        liquids: [
            { id: "ice_blue", name: "冰蓝苏打", colorTop: "#84d8ff", colorBottom: "#288fce", ratio: 0.5 },
            { id: "mist_purple", name: "极光雾紫", colorTop: "#d7d2ec", colorBottom: "#796d9c", ratio: 0.5 }
        ],
        inCupItems: ["jellyfish"],
        foamLayer: "night_cloud",
        topper: "glowing_big_star",
        effect: "ocean_bubbles",
        colorBadge: "#818cf8",
        desc: "将极北苍穹凝入水晶球，湛蓝冰海与幻紫极光交相辉映，水母在星光深处浮游。",
        customer: {
            name: "星象占卜师",
            avatar: "🔭",
            dialogue: "“极北之地的夜空正在跳舞，那是冰海与紫色极光的私语。请在圆滚滚的水晶球里盛满这片梦境吧，发光水母在星夜深潜，指引着命运的大星正在闪烁。”"
        },
        tags: ["星空极光", "1/2量杯", "发光水母"]
    },
    {
        id: "tropical_rainbow",
        level: 14,
        chapter: 2,
        name: "热带三色岛",
        subtitle: "Tropical Rainbow Lagoon",
        requiredCup: "third",
        glassType: "hourglass",
        liquid: { id: "sunset_orange", name: "绯红落日 + 流金沙茶 + 清澈海洋 (1/3夏威夷红金蓝渐变)" },
        liquids: [
            { id: "sunset_orange", name: "绯红落日", colorTop: "#ff5e62", colorBottom: "#dc2626", ratio: 1/3 },
            { id: "golden_sand", name: "流金沙茶", colorTop: "#f9e0b8", colorBottom: "#d89c56", ratio: 1/3 },
            { id: "deep_sea", name: "清澈海洋", colorTop: "#a5e9ff", colorBottom: "#2f96cf", ratio: 1/3 }
        ],
        inCupItems: ["classic_ice", "sand_beads"],
        foamLayer: "ocean_ice_cap",
        topper: "bear_with_shell",
        effect: "ocean_bubbles",
        colorBadge: "#e11d48",
        desc: "夏威夷风情顶级神作！底层红如火红落日，中层金沙，顶层海蓝，红金蓝三色分明，宛如热带夏日珊瑚岛屿。",
        customer: {
            name: "夏威夷冲浪手",
            avatar: "🏄",
            dialogue: "“在冲浪板上回望海岸线，夏威夷的落日红霞、金灿灿的沙滩与蔚蓝大浪层层铺展。来一杯‘热带三色岛’吧！把那片海岛的晚霞、金沙和浪花融在一起，喝一口就回到了浪尖！”"
        },
        tags: ["夏威夷三色", "1/3量杯", "红金蓝渐变"]
    },
    {
        id: "violet_twilight_clouds",
        level: 15,
        chapter: 2,
        name: "紫罗兰暮云",
        subtitle: "Violet Twilight Clouds",
        requiredCup: "third",
        glassType: "tulip",
        liquid: { id: "blackcurrant_night", name: "黑加仑 + 生椰乳 + 极光雾紫 (1/3三色渐变)" },
        liquids: [
            { id: "blackcurrant_night", name: "深暮黑加仑", colorTop: "#593574", colorBottom: "#221235", ratio: 1/3 },
            { id: "coconut_white", name: "浓纯生椰乳", colorTop: "#ffffff", colorBottom: "#ede5d8", ratio: 1/3 },
            { id: "mist_purple", name: "极光雾紫", colorTop: "#d7d2ec", colorBottom: "#796d9c", ratio: 1/3 }
        ],
        inCupItems: ["ghost_particles"],
        foamLayer: "cotton_candy",
        topper: "twin_ghosts",
        effect: "ghost_glow",
        colorBadge: "#a855f7",
        desc: "幽秘深暮、纯净奶白与浅雾紫的三重奏，棉花糖顶如晚霞暮云般轻盈蓬松。",
        customer: {
            name: "夜宴调香师",
            avatar: "🕯️",
            dialogue: "“香气的最高境界，是暮色降临时捉摸不透的层次感。深暮的沉稳、乳香的温润与雾紫的轻灵交错，宛如天鹅绒上的晚霞浮云，带我步入那场未完的香气幽梦。”"
        },
        tags: ["紫罗兰三色", "1/3量杯", "棉花糖"]
    },
    {
        id: "mint_choco_freeze",
        level: 16,
        chapter: 2,
        name: "薄荷巧克冰风暴",
        subtitle: "Mint Choco Freeze",
        requiredCup: "third",
        glassType: "classic",
        liquid: { id: "rich_cocoa", name: "醇香可可 + 生椰乳 + 冰爽薄荷 (1/3三色渐变)" },
        liquids: [
            { id: "rich_cocoa", name: "醇香可可", colorTop: "#915a45", colorBottom: "#592e1e", ratio: 1/3 },
            { id: "coconut_white", name: "浓纯生椰乳", colorTop: "#ffffff", colorBottom: "#ede5d8", ratio: 1/3 },
            { id: "mint_green", name: "冰爽薄荷", colorTop: "#b5ffd9", colorBottom: "#41b883", ratio: 1/3 }
        ],
        inCupItems: ["classic_ice"],
        foamLayer: "soil_top",
        topper: "snowman",
        effect: "snow_sparkle",
        colorBadge: "#10b981",
        desc: "可可浓醇、纯白奶香与清凉薄荷层叠碰撞，如冰封雪原里升起的温暖营火。",
        customer: {
            name: "极地探险滑雪手",
            avatar: "⛷️",
            dialogue: "“刚从雪道俯冲下来，风在耳边呼啸！这时候最想要可可的厚重、浓纯的奶香与一阵直冲天灵盖的冰爽薄荷，像在冰封雪原里燃起了一堆暖暖篝火！”"
        },
        tags: ["薄荷巧克", "1/3量杯", "清凉风暴"]
    },
    {
        id: "clover_morning_dew",
        level: 17,
        chapter: 2,
        name: "四叶草晨露",
        subtitle: "Clover Morning Dew",
        requiredCup: "quarter",
        glassType: "tulip",
        liquid: { id: "lime_green", name: "青柠 + 椰乳 + 抹茶 + 冰蓝 (1/4四色层叠)" },
        liquids: [
            { id: "lime_green", name: "青柠仙草", colorTop: "#e9f99c", colorBottom: "#9ed328", ratio: 0.25 },
            { id: "coconut_white", name: "浓纯生椰乳", colorTop: "#ffffff", colorBottom: "#ede5d8", ratio: 0.25 },
            { id: "matcha_deep", name: "浓厚抹茶", colorTop: "#a3d977", colorBottom: "#3e7b27", ratio: 0.25 },
            { id: "ice_blue", name: "冰蓝苏打", colorTop: "#84d8ff", colorBottom: "#288fce", ratio: 0.25 }
        ],
        inCupItems: ["queen_vine"],
        foamLayer: "snow_wood",
        topper: "green_succulent",
        effect: "plant_glow",
        colorBadge: "#84cc16",
        desc: "极致四层森林秘境！青柠、生椰、抹茶与冰蓝层层叠翠，如晨光漫过树梢，生机盎然。",
        customer: {
            name: "森林花仙子",
            avatar: "🧚",
            dialogue: "“清晨林间的第一缕阳光穿透薄雾，青草、露珠、树苔与溪涧苏醒了。能为我调制一杯‘四叶草晨露’吗？让整座森林的层次与生机在郁金香花瓣间静静流淌。”"
        },
        tags: ["四色彩虹", "1/4量杯", "森林晨露"]
    },
    {
        id: "cosmic_infinity_symphony",
        level: 18,
        chapter: 2,
        name: "星辰大海·终曲",
        subtitle: "Cosmic Symphony",
        requiredCup: "quarter",
        glassType: "sphere",
        liquid: { id: "blackcurrant_night", name: "黑加仑 + 雾紫 + 冰蓝 + 蜜桃 (1/4浩瀚星河)" },
        liquids: [
            { id: "blackcurrant_night", name: "深暮黑加仑", colorTop: "#593574", colorBottom: "#221235", ratio: 0.25 },
            { id: "mist_purple", name: "极光雾紫", colorTop: "#d7d2ec", colorBottom: "#796d9c", ratio: 0.25 },
            { id: "ice_blue", name: "冰蓝苏打", colorTop: "#84d8ff", colorBottom: "#288fce", ratio: 0.25 },
            { id: "peach_pink", name: "蜜桃落雨", colorTop: "#ffdbe1", colorBottom: "#f88195", ratio: 0.25 }
        ],
        inCupItems: ["constellation_stars", "gold_flakes"],
        foamLayer: "night_cloud",
        topper: "crown_cat",
        effect: "star_shower",
        colorBadge: "#6366f1",
        desc: "浩瀚星海的四色交响！深暮黑加仑、极光雾紫、湛蓝冰海与晨曦柔粉层层晕染，金箔点缀，猫咪加冕。",
        customer: {
            name: "银河特调宗师",
            avatar: "👑",
            dialogue: "“漫游寰宇千百年，见识过超新星爆发，也穿行过无尽暗夜。今夜我想在水晶球中重温那片璀璨星河：从深邃夜幕到幻紫极光，从海盐湛蓝到初生晨粉，让漫天金箔为这杯终曲加冕。”"
        },
        tags: ["四层终曲", "1/4量杯", "皇冠猫咪"]
    },

    // ==========================================
    // 🏪 第三章：烟火与茶香 (第 3-1 ~ 3-9 关 · 知名茶饮名店篇)
    // 解锁条件：消耗 1000 💎 钻石盘下属于自己的独立店铺，并为店铺命名！
    // 玩法特色：
    // 1. 每关对应经典知名茶饮名店 (蜜雪冰冰、亿点点、谷茗、茶百客、霸道茶姬、禧茶、奶雪的茶、茶言悦色、星巴客)
    // 2. 客人进店只报真实饮品名，配方表完全公开随时查阅
    // 3. 客人头顶带动态彩色耐心倒计时，超时跑单罚款
    // 4. 客人源源不断一直光顾！每关设定获得 1 颗星的最少订单数 (5~30 单保底通关线)
    // 5. 小料无需提前解锁，每次放消耗 10 金币物料成本
    // 6. 三星评定：达成最少订单数(1★) + 规定时间内打烊(1★) + 赚够目标净利润(1★)
    // ==========================================
    {
        id: "mxbc_lemon",
        level: 19,
        chapter: 3,
        brand: "蜜雪冰冰",
        brandLogo: "⛄",
        name: "蜜雪冰冰",
        subtitle: "Mixue Bingbing",
        minOrders: 5,
        customerCount: 5,
        timeLimit: 150,
        targetProfit: 350,
        colorBadge: "#ef4444",
        desc: "你爱我，我爱你，蜜雪冰冰甜蜜蜜！平价茶饮顶流，招牌柠檬水与蜜桃四季春风靡大街小巷。",
        customer: {
            name: "雪王与学生街常客",
            avatar: "⛄",
            dialogue: "“店长好！放学路过来买水啦，速度要快哦！”"
        },
        // 招牌饮品库 (至少3种，含蜜桃四季春)
        availableDrinks: [
            {
                name: "冰鲜柠檬水",
                glassType: "cup_medium",
                liquid: { id: "lime_green", name: "青柠仙草" },
                inCupItems: ["lemon_slice", "classic_ice"],
                foamLayer: "none",
                topper: "none",
                price: 60,
                desc: "【默认中杯】+ 青柠仙草 + 鲜切柠檬片 + 方形冰块"
            },
            {
                name: "珍珠奶茶",
                glassType: "cup_medium",
                liquid: { id: "golden_sand", name: "流金沙茶" },
                inCupItems: ["boba_pearls", "classic_ice"],
                foamLayer: "none",
                topper: "none",
                price: 70,
                desc: "【中杯】+ 流金沙茶 + 黑糖珍珠波霸 + 方形冰块"
            },
            {
                name: "蜜桃四季春",
                glassType: "cup_large",
                liquid: { id: "peach_pink", name: "蜜桃落雨 + 琥珀乌龙 (1/2)" },
                liquids: [
                    { id: "peach_pink", name: "蜜桃落雨", colorTop: "#ffdbe1", colorBottom: "#f88195", ratio: 0.5 },
                    { id: "amber_oolong", name: "琥珀乌龙", colorTop: "#e9bc84", colorBottom: "#a35b1d", ratio: 0.5 }
                ],
                inCupItems: ["peach_jelly", "classic_ice"],
                foamLayer: "none",
                topper: "none",
                price: 85,
                desc: "【大杯】+ 蜜桃乌龙半杯渐变 + 蜜桃晶珠 + 方形冰块"
            }
        ],
        // 默认第一款用于基础展示
        glassType: "cup_medium",
        liquid: { id: "lime_green", name: "青柠仙草" },
        inCupItems: ["lemon_slice", "classic_ice"],
        foamLayer: "none",
        topper: "none",
        tags: ["蜜雪冰冰", "最少5单(1★)", "蜜桃四季春"]
    },
    {
        id: "yidiandian_boba",
        level: 20,
        chapter: 3,
        brand: "亿点点",
        brandLogo: "🟢",
        name: "亿点点",
        subtitle: "YiDianDian Tea",
        minOrders: 7,
        customerCount: 7,
        timeLimit: 200,
        targetProfit: 500,
        colorBadge: "#16a34a",
        desc: "波霸奶茶鼻祖！香草冰淇淋浮顶与浓郁茶汤，一口吸上软糯大珍珠。",
        customer: {
            name: "奶茶重度瘾白领",
            avatar: "🧋",
            dialogue: "“下午茶时间到！我们要喝亿点点波霸大满足，麻烦店长尽快出杯！”"
        },
        availableDrinks: [
            {
                name: "波霸奶茶",
                glassType: "cup_large",
                liquid: { id: "golden_sand", name: "流金沙茶 + 纯牛乳 (1/2)" },
                liquids: [
                    { id: "golden_sand", name: "流金沙茶", colorTop: "#f9e0b8", colorBottom: "#d89c56", ratio: 0.5 },
                    { id: "pure_milk", name: "牧场纯牛乳", colorTop: "#ffffff", colorBottom: "#f1f5f9", ratio: 0.5 }
                ],
                inCupItems: ["boba_pearls", "classic_ice"],
                foamLayer: "none",
                topper: "none",
                price: 75,
                desc: "【大杯】+ 沙茶纯牛乳半杯渐变 + 黑糖珍珠波霸 + 方形冰块"
            },
            {
                name: "冰淇淋红茶",
                glassType: "cup_large",
                liquid: { id: "ceylon_black", name: "锡兰红茶" },
                inCupItems: ["classic_ice"],
                foamLayer: "ice_cream_float",
                topper: "none",
                price: 85,
                desc: "【大杯】+ 锡兰红茶 + 方形冰块 + 香草冰淇淋浮顶"
            },
            {
                name: "四季奶青",
                glassType: "cup_large",
                liquid: { id: "amber_oolong", name: "琥珀乌龙 + 纯牛乳 (1/2)" },
                liquids: [
                    { id: "amber_oolong", name: "琥珀乌龙", colorTop: "#e9bc84", colorBottom: "#a35b1d", ratio: 0.5 },
                    { id: "pure_milk", name: "牧场纯牛乳", colorTop: "#ffffff", colorBottom: "#f1f5f9", ratio: 0.5 }
                ],
                inCupItems: ["classic_ice"],
                foamLayer: "none",
                topper: "none",
                price: 80,
                desc: "【大杯】+ 乌龙牛乳半杯渐变 + 方形冰块"
            }
        ],
        glassType: "cup_large",
        liquid: { id: "golden_sand", name: "流金沙茶" },
        inCupItems: ["boba_pearls", "classic_ice"],
        foamLayer: "none",
        topper: "none",
        tags: ["亿点点", "最少7单(1★)", "波霸奶茶"]
    },
    {
        id: "guming_fruit",
        level: 21,
        chapter: 3,
        brand: "谷茗",
        brandLogo: "🥤",
        name: "谷茗",
        subtitle: "Gu Ming",
        minOrders: 10,
        customerCount: 10,
        timeLimit: 260,
        targetProfit: 750,
        colorBadge: "#d97706",
        desc: "新鲜水果大桶盛装，生椰与金黄芒果的甘露交响，夏日解暑首选！",
        customer: {
            name: "果茶爱好者联盟",
            avatar: "🍹",
            dialogue: "“天气好热！一人一杯谷茗果茶，水果片要新鲜多汁哦！”"
        },
        availableDrinks: [
            {
                name: "超大桶水果茶",
                glassType: "cup_bucket",
                liquid: { id: "mint_green", name: "冰爽薄荷 + 蜜桃落雨 (1/2)" },
                liquids: [
                    { id: "mint_green", name: "冰爽薄荷", colorTop: "#b5ffd9", colorBottom: "#41b883", ratio: 0.5 },
                    { id: "peach_pink", name: "蜜桃落雨", colorTop: "#ffdbe1", colorBottom: "#f88195", ratio: 0.5 }
                ],
                inCupItems: ["lemon_slice", "orange_slice"],
                foamLayer: "none",
                topper: "none",
                price: 90,
                desc: "【吨吨桶】+ 薄荷蜜桃半杯渐变 + 柠檬片 + 鲜橙片"
            },
            {
                name: "杨枝甘露",
                glassType: "cup_large",
                liquid: { id: "mango_puree", name: "浓香芒果浆 + 浓纯生椰乳 (1/2)" },
                liquids: [
                    { id: "mango_puree", name: "浓香芒果浆", colorTop: "#fef08a", colorBottom: "#f59e0b", ratio: 0.5 },
                    { id: "coconut_white", name: "浓纯生椰乳", colorTop: "#ffffff", colorBottom: "#ede5d8", ratio: 0.5 }
                ],
                inCupItems: ["grapefruit_pulp", "classic_ice"],
                foamLayer: "none",
                topper: "none",
                price: 95,
                desc: "【大杯】+ 芒果生椰半杯渐变 + 柚子粒 + 方形冰块"
            },
            {
                name: "云顶水牛乳",
                glassType: "cup_large",
                liquid: { id: "golden_sand", name: "流金沙茶 + 纯牛乳 (1/2)" },
                liquids: [
                    { id: "golden_sand", name: "流金沙茶", colorTop: "#f9e0b8", colorBottom: "#d89c56", ratio: 0.5 },
                    { id: "pure_milk", name: "牧场纯牛乳", colorTop: "#ffffff", colorBottom: "#f1f5f9", ratio: 0.5 }
                ],
                inCupItems: ["classic_ice"],
                foamLayer: "cheese_foam",
                topper: "none",
                price: 85,
                desc: "【大杯】+ 沙茶牛乳半杯渐变 + 芝士厚奶盖"
            }
        ],
        glassType: "cup_bucket",
        liquid: { id: "mint_green", name: "冰爽薄荷" },
        inCupItems: ["lemon_slice", "orange_slice"],
        foamLayer: "none",
        topper: "none",
        tags: ["谷茗", "最少10单(1★)", "杨枝甘露"]
    },
    {
        id: "chabaidao_douru",
        level: 22,
        chapter: 3,
        brand: "茶百客",
        brandLogo: "🐼",
        name: "茶百客",
        subtitle: "Cha Bai Ke",
        minOrders: 13,
        customerCount: 13,
        timeLimit: 320,
        targetProfit: 1000,
        colorBadge: "#0284c7",
        desc: "憨态可掬的熊猫茶饮！豆乳玉麒麟洒满熟香黄豆粉，三色芋圆弹牙香甜。",
        customer: {
            name: "国潮青年团",
            avatar: "🐼",
            dialogue: "“来支持茶百客啦！黄豆粉和芝士奶盖要铺满，小芋圆煮软一点！”"
        },
        availableDrinks: [
            {
                name: "豆乳玉麒麟",
                glassType: "cup_large",
                liquid: { id: "amber_oolong", name: "琥珀乌龙 + 浓纯生椰乳 (1/2)" },
                liquids: [
                    { id: "amber_oolong", name: "琥珀乌龙", colorTop: "#e9bc84", colorBottom: "#a35b1d", ratio: 0.5 },
                    { id: "coconut_white", name: "浓纯生椰乳", colorTop: "#ffffff", colorBottom: "#ede5d8", ratio: 0.5 }
                ],
                inCupItems: ["classic_ice"],
                foamLayer: "cheese_foam",
                topper: "soybean_powder",
                price: 95,
                desc: "【大杯】+ 乌龙生椰半杯渐变 + 芝士厚奶盖 + 熟香黄豆粉"
            },
            {
                name: "招牌芋圆奶茶",
                glassType: "cup_large",
                liquid: { id: "golden_sand", name: "流金沙茶 + 纯牛乳 (1/2)" },
                liquids: [
                    { id: "golden_sand", name: "流金沙茶", colorTop: "#f9e0b8", colorBottom: "#d89c56", ratio: 0.5 },
                    { id: "pure_milk", name: "牧场纯牛乳", colorTop: "#ffffff", colorBottom: "#f1f5f9", ratio: 0.5 }
                ],
                inCupItems: ["taro_balls", "classic_ice"],
                foamLayer: "none",
                topper: "none",
                price: 85,
                desc: "【大杯】+ 沙茶纯牛乳半杯渐变 + 三色小芋圆 + 方形冰块"
            },
            {
                name: "鲜橙双皮奶",
                glassType: "cup_medium",
                liquid: { id: "coconut_white", name: "浓纯生椰乳 + 绯红落日 (1/2)" },
                liquids: [
                    { id: "coconut_white", name: "浓纯生椰乳", colorTop: "#ffffff", colorBottom: "#ede5d8", ratio: 0.5 },
                    { id: "sunset_orange", name: "绯红落日", colorTop: "#ff5e62", colorBottom: "#dc2626", ratio: 0.5 }
                ],
                inCupItems: ["orange_slice", "classic_ice"],
                foamLayer: "none",
                topper: "none",
                price: 85,
                desc: "【中杯】+ 生椰落日半杯渐变 + 鲜切橙片 + 方形冰块"
            },
            {
                name: "茉莉奶绿",
                glassType: "cup_large",
                liquid: { id: "jasmine_tea", name: "茉莉雪芽 + 纯牛乳 (1/2)" },
                liquids: [
                    { id: "jasmine_tea", name: "茉莉雪芽", colorTop: "#fef08a", colorBottom: "#ca8a04", ratio: 0.5 },
                    { id: "pure_milk", name: "牧场纯牛乳", colorTop: "#ffffff", colorBottom: "#f1f5f9", ratio: 0.5 }
                ],
                inCupItems: ["classic_ice"],
                foamLayer: "none",
                topper: "none",
                price: 85,
                desc: "【大杯】+ 茉莉牛乳半杯渐变 + 方形冰块"
            }
        ],
        glassType: "cup_large",
        liquid: { id: "amber_oolong", name: "琥珀乌龙" },
        inCupItems: ["classic_ice"],
        foamLayer: "cheese_foam",
        topper: "soybean_powder",
        tags: ["茶百客", "最少13单(1★)", "豆乳玉麒麟"]
    },
    {
        id: "chagee_boyajuxian",
        level: 23,
        chapter: 3,
        brand: "霸道茶姬",
        brandLogo: "👑",
        name: "霸道茶姬",
        subtitle: "BaDao Tea Bar",
        minOrders: 16,
        customerCount: 16,
        timeLimit: 380,
        targetProfit: 1300,
        colorBadge: "#b91c1c",
        desc: "以东方茶，会世界友！伯牙绝弦原叶鲜奶茶爆单不停，清爽茶香透杯而出。",
        customer: {
            name: "国风品茗行家",
            avatar: "🏮",
            dialogue: "“店长！慕名来喝霸道茶姬，茶味奶味都要平衡，无奶盖清爽出杯！”"
        },
        availableDrinks: [
            {
                name: "伯牙绝弦",
                glassType: "cup_large",
                liquid: { id: "jasmine_tea", name: "茉莉雪芽 + 纯牛乳 (1/2)" },
                liquids: [
                    { id: "jasmine_tea", name: "茉莉雪芽", colorTop: "#fef08a", colorBottom: "#ca8a04", ratio: 0.5 },
                    { id: "pure_milk", name: "牧场纯牛乳", colorTop: "#ffffff", colorBottom: "#f1f5f9", ratio: 0.5 }
                ],
                inCupItems: ["classic_ice"],
                foamLayer: "none",
                topper: "none",
                price: 95,
                desc: "【大杯】+ 茉莉雪芽/纯牛乳半杯渐变 + 方形冰块 (无奶盖)"
            },
            {
                name: "花田乌龙",
                glassType: "cup_large",
                liquid: { id: "peach_pink", name: "蜜桃落雨 + 纯牛乳 (1/2)" },
                liquids: [
                    { id: "peach_pink", name: "蜜桃落雨", colorTop: "#ffdbe1", colorBottom: "#f88195", ratio: 0.5 },
                    { id: "pure_milk", name: "牧场纯牛乳", colorTop: "#ffffff", colorBottom: "#f1f5f9", ratio: 0.5 }
                ],
                inCupItems: ["classic_ice"],
                foamLayer: "none",
                topper: "none",
                price: 95,
                desc: "【大杯】+ 白桃/纯牛乳半杯渐变 + 方形冰块 (无奶盖)"
            },
            {
                name: "青青糯山",
                glassType: "cup_medium",
                liquid: { id: "lime_green", name: "青柠仙草 + 纯牛乳 (1/2)" },
                liquids: [
                    { id: "lime_green", name: "青柠仙草", colorTop: "#e9f99c", colorBottom: "#9ed328", ratio: 0.5 },
                    { id: "pure_milk", name: "牧场纯牛乳", colorTop: "#ffffff", colorBottom: "#f1f5f9", ratio: 0.5 }
                ],
                inCupItems: ["classic_ice"],
                foamLayer: "none",
                topper: "none",
                price: 90,
                desc: "【中杯】+ 青绿仙草/纯牛乳半杯渐变 + 方形冰块"
            },
            {
                name: "万里木兰",
                glassType: "cup_large",
                liquid: { id: "ceylon_black", name: "锡兰红茶 + 纯牛乳 (1/2)" },
                liquids: [
                    { id: "ceylon_black", name: "锡兰红茶", colorTop: "#fdba74", colorBottom: "#9a3412", ratio: 0.5 },
                    { id: "pure_milk", name: "牧场纯牛乳", colorTop: "#ffffff", colorBottom: "#f1f5f9", ratio: 0.5 }
                ],
                inCupItems: ["classic_ice"],
                foamLayer: "none",
                topper: "none",
                price: 95,
                desc: "【大杯】+ 红茶牛乳半杯渐变 + 方形冰块"
            }
        ],
        glassType: "cup_large",
        liquid: { id: "jasmine_tea", name: "茉莉雪芽" },
        inCupItems: ["classic_ice"],
        foamLayer: "none",
        topper: "none",
        tags: ["霸道茶姬", "最少16单(1★)", "伯牙绝弦"]
    },
    {
        id: "heytea_grape",
        level: 24,
        chapter: 3,
        brand: "禧茶",
        brandLogo: "🧋",
        name: "禧茶",
        subtitle: "Xi Tea Studio",
        minOrders: 20,
        customerCount: 20,
        timeLimit: 460,
        targetProfit: 1700,
        colorBadge: "#7c3aed",
        desc: "灵感之茶，中国新茶饮标杆！多肉葡萄粒粒手剥，咸甜芝士厚奶盖香浓丝滑。",
        customer: {
            name: "潮牌设计师与网红",
            avatar: "🕶️",
            dialogue: "“灵感枯竭求续命！禧茶多肉葡萄安排上，芝士奶盖要厚厚一层！”"
        },
        availableDrinks: [
            {
                name: "多肉葡萄",
                glassType: "cup_large",
                liquid: { id: "grape_tea", name: "巨峰葡萄茶" },
                inCupItems: ["grape_pulp", "classic_ice"],
                foamLayer: "cheese_foam",
                topper: "none",
                price: 105,
                desc: "【大杯】+ 巨峰葡萄茶 + 多肉葡萄果肉 + 方形冰块 + 芝士厚奶盖"
            },
            {
                name: "芝芝莓莓",
                glassType: "cup_large",
                liquid: { id: "peach_pink", name: "蜜桃落雨" },
                inCupItems: ["classic_ice"],
                foamLayer: "cheese_foam",
                topper: "dried_rose_petals",
                price: 100,
                desc: "【大杯】+ 蜜桃落雨 + 方形冰块 + 芝士厚奶盖 + 干红玫瑰碎"
            },
            {
                name: "烤黑糖波波牛乳",
                glassType: "cup_medium",
                liquid: { id: "pure_milk", name: "牧场纯牛乳" },
                inCupItems: ["boba_pearls", "classic_ice"],
                foamLayer: "none",
                topper: "caramel_drizzle",
                price: 95,
                desc: "【中杯】+ 牧场纯牛乳 + 黑糖珍珠波霸 + 方形冰块 + 焦糖淋酱"
            },
            {
                name: "多肉芒芒甘露",
                glassType: "cup_large",
                liquid: { id: "mango_puree", name: "浓香芒果浆 + 浓纯生椰乳 (1/2)" },
                liquids: [
                    { id: "mango_puree", name: "浓香芒果浆", colorTop: "#fef08a", colorBottom: "#f59e0b", ratio: 0.5 },
                    { id: "coconut_white", name: "浓纯生椰乳", colorTop: "#ffffff", colorBottom: "#ede5d8", ratio: 0.5 }
                ],
                inCupItems: ["grapefruit_pulp", "classic_ice"],
                foamLayer: "none",
                topper: "none",
                price: 105,
                desc: "【大杯】+ 芒果生椰半杯渐变 + 柚子粒 + 方形冰块"
            }
        ],
        glassType: "cup_large",
        liquid: { id: "grape_tea", name: "巨峰葡萄茶" },
        inCupItems: ["grape_pulp", "classic_ice"],
        foamLayer: "cheese_foam",
        topper: "none",
        tags: ["禧茶", "最少20单(1★)", "多肉葡萄"]
    },
    {
        id: "nayuki_strawberry",
        level: 25,
        chapter: 3,
        brand: "奶雪的茶",
        brandLogo: "🍵",
        name: "奶雪的茶",
        subtitle: "Nai Xue Tea",
        minOrders: 23,
        customerCount: 23,
        timeLimit: 530,
        targetProfit: 2000,
        colorBadge: "#ea580c",
        desc: "一杯好茶，一口软欧包！霸气芝士草莓与鲜橙，果香馥郁，治愈都市疲惫。",
        customer: {
            name: "都市优雅丽人",
            avatar: "👒",
            dialogue: "“店长！今天客流爆满吧，赶紧来杯霸气草莓与鲜橙，速度跟上哦！”"
        },
        availableDrinks: [
            {
                name: "霸气芝士草莓",
                glassType: "cup_large",
                liquid: { id: "peach_pink", name: "蜜桃落雨" },
                inCupItems: ["classic_ice"],
                foamLayer: "cheese_foam",
                topper: "none",
                price: 105,
                desc: "【大杯】+ 蜜桃落雨 + 方形冰块 + 芝士厚奶盖"
            },
            {
                name: "霸气鲜橙",
                glassType: "cup_large",
                liquid: { id: "jasmine_tea", name: "茉莉雪芽" },
                inCupItems: ["orange_slice", "classic_ice"],
                foamLayer: "none",
                topper: "none",
                price: 95,
                desc: "【大杯】+ 茉莉雪芽 + 鲜切橙片 + 方形冰块"
            },
            {
                name: "鸭屎香宝藏茶",
                glassType: "cup_large",
                liquid: { id: "amber_oolong", name: "琥珀乌龙 + 纯牛乳 (1/2)" },
                liquids: [
                    { id: "amber_oolong", name: "琥珀乌龙", colorTop: "#e9bc84", colorBottom: "#a35b1d", ratio: 0.5 },
                    { id: "pure_milk", name: "牧场纯牛乳", colorTop: "#ffffff", colorBottom: "#f1f5f9", ratio: 0.5 }
                ],
                inCupItems: ["boba_pearls", "classic_ice"],
                foamLayer: "whipped_cream",
                topper: "none",
                price: 110,
                desc: "【大杯】+ 乌龙牛乳半杯渐变 + 黑糖珍珠 + 方形冰块 + 鲜奶油雪顶"
            },
            {
                name: "霸气玉油柑",
                glassType: "cup_medium",
                liquid: { id: "lime_green", name: "青柠仙草" },
                inCupItems: ["classic_ice"],
                foamLayer: "none",
                topper: "none",
                price: 90,
                desc: "【中杯】+ 青柠仙草 + 方形冰块"
            },
            {
                name: "芝士蜜桃乌龙",
                glassType: "cup_large",
                liquid: { id: "peach_pink", name: "蜜桃落雨 + 琥珀乌龙 (1/2)" },
                liquids: [
                    { id: "peach_pink", name: "蜜桃落雨", colorTop: "#ffdbe1", colorBottom: "#f88195", ratio: 0.5 },
                    { id: "amber_oolong", name: "琥珀乌龙", colorTop: "#e9bc84", colorBottom: "#a35b1d", ratio: 0.5 }
                ],
                inCupItems: ["peach_jelly", "classic_ice"],
                foamLayer: "cheese_foam",
                topper: "none",
                price: 105,
                desc: "【大杯】+ 蜜桃乌龙半杯渐变 + 蜜桃晶珠 + 方形冰块 + 芝士厚奶盖"
            }
        ],
        glassType: "cup_large",
        liquid: { id: "peach_pink", name: "蜜桃落雨" },
        inCupItems: ["classic_ice"],
        foamLayer: "cheese_foam",
        topper: "none",
        tags: ["奶雪的茶", "最少23单(1★)", "霸气鲜橙"]
    },
    {
        id: "chayan_youlan",
        level: 26,
        chapter: 3,
        brand: "茶言悦色",
        brandLogo: "🏮",
        name: "茶言悦色",
        subtitle: "ChaYan Yuese",
        minOrders: 26,
        customerCount: 26,
        timeLimit: 600,
        targetProfit: 2400,
        colorBadge: "#be123c",
        desc: "幽兰拿铁名动天下！高耸鲜奶油雪顶与酥脆碧根果碎，一口惊艳新中式风骨。",
        customer: {
            name: "长沙文旅排队长龙",
            avatar: "👘",
            dialogue: "“排队两小时终于到我们了！幽兰拿铁奶油要立挺，碧根果碎多撒点！”"
        },
        availableDrinks: [
            {
                name: "幽兰拿铁",
                glassType: "cup_large",
                liquid: { id: "ceylon_black", name: "锡兰红茶 + 纯牛乳 (1/2)" },
                liquids: [
                    { id: "ceylon_black", name: "锡兰红茶", colorTop: "#fdba74", colorBottom: "#9a3412", ratio: 0.5 },
                    { id: "pure_milk", name: "牧场纯牛乳", colorTop: "#ffffff", colorBottom: "#f1f5f9", ratio: 0.5 }
                ],
                inCupItems: ["classic_ice"],
                foamLayer: "whipped_cream",
                topper: "pecan_nuts",
                price: 115,
                desc: "【大杯】+ 锡兰红茶牛乳半杯渐变 + 鲜奶油雪顶 + 碧根果坚果碎"
            },
            {
                name: "声声乌龙",
                glassType: "cup_large",
                liquid: { id: "amber_oolong", name: "琥珀乌龙 + 纯牛乳 (1/2)" },
                liquids: [
                    { id: "amber_oolong", name: "琥珀乌龙", colorTop: "#e9bc84", colorBottom: "#a35b1d", ratio: 0.5 },
                    { id: "pure_milk", name: "牧场纯牛乳", colorTop: "#ffffff", colorBottom: "#f1f5f9", ratio: 0.5 }
                ],
                inCupItems: ["classic_ice"],
                foamLayer: "whipped_cream",
                topper: "none",
                price: 105,
                desc: "【大杯】+ 乌龙牛乳半杯渐变 + 鲜奶油雪顶"
            },
            {
                name: "蔓越阑珊",
                glassType: "cup_medium",
                liquid: { id: "ceylon_black", name: "锡兰红茶 + 纯牛乳 (1/2)" },
                liquids: [
                    { id: "ceylon_black", name: "锡兰红茶", colorTop: "#fdba74", colorBottom: "#9a3412", ratio: 0.5 },
                    { id: "pure_milk", name: "牧场纯牛乳", colorTop: "#ffffff", colorBottom: "#f1f5f9", ratio: 0.5 }
                ],
                inCupItems: ["classic_ice"],
                foamLayer: "whipped_cream",
                topper: "dried_rose_petals",
                price: 110,
                desc: "【中杯】+ 红茶牛乳半杯渐变 + 鲜奶油雪顶 + 干红玫瑰碎"
            },
            {
                name: "风栖绿桂",
                glassType: "cup_large",
                liquid: { id: "jasmine_tea", name: "茉莉雪芽 + 纯牛乳 (1/2)" },
                liquids: [
                    { id: "jasmine_tea", name: "茉莉雪芽", colorTop: "#fef08a", colorBottom: "#ca8a04", ratio: 0.5 },
                    { id: "pure_milk", name: "牧场纯牛乳", colorTop: "#ffffff", colorBottom: "#f1f5f9", ratio: 0.5 }
                ],
                inCupItems: ["classic_ice"],
                foamLayer: "whipped_cream",
                topper: "none",
                price: 105,
                desc: "【大杯】+ 茉莉牛乳半杯渐变 + 鲜奶油雪顶"
            },
            {
                name: "筝筝纸鸢",
                glassType: "cup_medium",
                liquid: { id: "amber_oolong", name: "琥珀乌龙 + 纯牛乳 (1/2)" },
                liquids: [
                    { id: "amber_oolong", name: "琥珀乌龙", colorTop: "#e9bc84", colorBottom: "#a35b1d", ratio: 0.5 },
                    { id: "pure_milk", name: "牧场纯牛乳", colorTop: "#ffffff", colorBottom: "#f1f5f9", ratio: 0.5 }
                ],
                inCupItems: ["classic_ice"],
                foamLayer: "none",
                topper: "none",
                price: 95,
                desc: "【中杯】+ 乌龙牛乳半杯渐变 + 方形冰块"
            }
        ],
        glassType: "cup_large",
        liquid: { id: "ceylon_black", name: "锡兰红茶" },
        inCupItems: ["classic_ice"],
        foamLayer: "whipped_cream",
        topper: "pecan_nuts",
        tags: ["茶言悦色", "最少26单(1★)", "幽兰拿铁"]
    },
    {
        id: "starbucks_frappuccino",
        level: 27,
        chapter: 3,
        brand: "星巴客",
        brandLogo: "☕",
        name: "星巴客",
        subtitle: "Starbucks Reserve",
        minOrders: 30,
        customerCount: 30,
        timeLimit: 700,
        targetProfit: 3000,
        colorBadge: "#047857",
        desc: "终极商业巅峰挑战！30位客人狂潮涌入，经典抹茶星冰乐、焦糖玛奇朵，考验手速极限！",
        customer: {
            name: "金融街跨国精英群",
            avatar: "💼",
            dialogue: "“早八会议快开始了！30 杯特饮连环点单，店长看你的极限神速了！”"
        },
        availableDrinks: [
            {
                name: "抹茶星冰乐",
                glassType: "cup_large",
                liquid: { id: "matcha_deep", name: "浓厚抹茶 + 纯牛乳 (1/2)" },
                liquids: [
                    { id: "matcha_deep", name: "浓厚抹茶", colorTop: "#a3d977", colorBottom: "#3e7b27", ratio: 0.5 },
                    { id: "pure_milk", name: "牧场纯牛乳", colorTop: "#ffffff", colorBottom: "#f1f5f9", ratio: 0.5 }
                ],
                inCupItems: ["classic_ice"],
                foamLayer: "whipped_cream",
                topper: "none",
                price: 120,
                desc: "【大杯】+ 抹茶牛乳半杯渐变 + 方形冰块 + 鲜奶油雪顶"
            },
            {
                name: "焦糖玛奇朵",
                glassType: "cup_medium",
                liquid: { id: "rich_cocoa", name: "醇香可可 + 纯牛乳 (1/2)" },
                liquids: [
                    { id: "rich_cocoa", name: "醇香可可", colorTop: "#915a45", colorBottom: "#592e1e", ratio: 0.5 },
                    { id: "pure_milk", name: "牧场纯牛乳", colorTop: "#ffffff", colorBottom: "#f1f5f9", ratio: 0.5 }
                ],
                inCupItems: ["classic_ice"],
                foamLayer: "none",
                topper: "caramel_drizzle",
                price: 115,
                desc: "【中杯】+ 可可牛乳半杯渐变 + 方形冰块 + 焦糖淋酱"
            },
            {
                name: "馥芮白",
                glassType: "cup_medium",
                liquid: { id: "rich_cocoa", name: "醇香可可 + 纯牛乳 (1/2)" },
                liquids: [
                    { id: "rich_cocoa", name: "醇香可可", colorTop: "#915a45", colorBottom: "#592e1e", ratio: 0.5 },
                    { id: "pure_milk", name: "牧场纯牛乳", colorTop: "#ffffff", colorBottom: "#f1f5f9", ratio: 0.5 }
                ],
                inCupItems: [],
                foamLayer: "snow_wood",
                topper: "none",
                price: 110,
                desc: "【中杯】+ 可可牛乳半杯渐变 + 浮木积雪奶泡"
            },
            {
                name: "摩卡星冰乐",
                glassType: "cup_large",
                liquid: { id: "rich_cocoa", name: "醇香可可 + 纯牛乳 (1/2)" },
                liquids: [
                    { id: "rich_cocoa", name: "醇香可可", colorTop: "#915a45", colorBottom: "#592e1e", ratio: 0.5 },
                    { id: "pure_milk", name: "牧场纯牛乳", colorTop: "#ffffff", colorBottom: "#f1f5f9", ratio: 0.5 }
                ],
                inCupItems: ["classic_ice"],
                foamLayer: "whipped_cream",
                topper: "caramel_drizzle",
                price: 125,
                desc: "【大杯】+ 可可牛乳半杯渐变 + 方形冰块 + 鲜奶油雪顶 + 焦糖淋酱"
            },
            {
                name: "红茶拿铁",
                glassType: "cup_large",
                liquid: { id: "ceylon_black", name: "锡兰红茶 + 纯牛乳 (1/2)" },
                liquids: [
                    { id: "ceylon_black", name: "锡兰红茶", colorTop: "#fdba74", colorBottom: "#9a3412", ratio: 0.5 },
                    { id: "pure_milk", name: "牧场纯牛乳", colorTop: "#ffffff", colorBottom: "#f1f5f9", ratio: 0.5 }
                ],
                inCupItems: ["classic_ice"],
                foamLayer: "cheese_foam",
                topper: "none",
                price: 115,
                desc: "【大杯】+ 红茶牛乳半杯渐变 + 芝士厚奶盖"
            }
        ],
        glassType: "cup_large",
        liquid: { id: "matcha_deep", name: "浓厚抹茶" },
        inCupItems: ["classic_ice"],
        foamLayer: "whipped_cream",
        topper: "none",
        tags: ["星巴客", "最少30单(1★)", "星冰乐巅峰"]
    }
];

// 量杯系统全量配置 (默认拥有 1/1 与 1/2，可用金币解锁 1/3 与 1/4)
const MEASURING_CUPS_CATALOG = [
    { id: "full", name: "1/1 全杯", fractionText: "1/1", ratio: 1.0, price: 0, desc: "经典全满量杯，单次直接注满全杯 (单色模式)", icon: "🥛" },
    { id: "half", name: "1/2 量杯", fractionText: "1/2", ratio: 0.5, price: 0, desc: "半杯刻度量杯，注两次调出绝美双色渐变！", icon: "🍶" },
    { id: "third", name: "1/3 量杯", fractionText: "1/3", ratio: 1/3, price: 300, desc: "三分之一量杯，注入三次呈现梦幻三层渐变！", icon: "🧪" },
    { id: "quarter", name: "1/4 量杯", fractionText: "1/4", ratio: 0.25, price: 600, desc: "四分之一微调量杯，注入四次调制极致星河！", icon: "🍸" }
];

// 原料全量库分类定义 (支持金币解锁与 10000💰 奇迹圣杯，新增第二章网红分层原液)
const INGREDIENTS_CATALOG = {
    glasses: [
        { id: "classic", name: "玻璃杯", price: 0, desc: "经典厚底手绘玻璃杯", icon: "🥃" },
        { id: "hourglass", name: "沙漏杯", price: 0, desc: "流沙时光双层收腰杯", icon: "⏳" },
        { id: "martini", name: "高脚杯", price: 150, desc: "优雅倒三角广口高脚杯", icon: "🍸" },
        { id: "sphere", name: "球形杯", price: 200, desc: "圆滚滚的水晶球魔法瓶", icon: "🔮" },
        { id: "milk_carton", name: "牛奶杯", price: 250, desc: "萌趣可爱的倒角玻璃牛奶杯", icon: "🥛" },
        { id: "tulip", name: "郁金香杯", price: 300, desc: "花瓣微翘的优雅花型杯", icon: "🌷" },
        { id: "burgundy", name: "勃艮第杯", price: 350, desc: "大肚子广口收腰红酒高脚杯，聚拢浓郁酒香", icon: "🍷" },
        { id: "champagne", name: "香槟杯", price: 400, desc: "高挑优雅细长笛型高脚杯，气泡升腾如星", icon: "🥂" },
        { id: "flower_tea", name: "花茶杯", price: 300, desc: "典雅敞口欧式骨瓷茶杯配托碟，手绘复古玫瑰花，浪漫下午茶之选", icon: "🫖" },
        { id: "cup_medium", name: "中杯", chapter: 3, price: 0, desc: "标准 500ml 经典奶茶纸杯，温润适中", icon: "🥤" },
        { id: "cup_large", name: "大杯", chapter: 3, price: 0, desc: "畅饮 700ml 高挑大杯，茶饮店出单之王", icon: "🧋" },
        { id: "cup_bucket", name: "吨吨桶", chapter: 3, price: 0, desc: "超大 1000ml 宽口手提吨吨水果桶，畅快过瘾", icon: "🪣" },
        { id: "holy_grail", name: "奇迹圣杯", price: 1000000, desc: "✨ 可能会触发神奇的效果哦。", icon: "🏆" }
    ],
    liquids: [
        { id: "ice_blue", name: "冰蓝苏打", price: 0, colorTop: "#84d8ff", colorBottom: "#288fce" },
        { id: "golden_sand", name: "流金沙茶", price: 0, colorTop: "#f9e0b8", colorBottom: "#d89c56" },
        { id: "lime_green", name: "青柠仙草", price: 0, colorTop: "#e9f99c", colorBottom: "#9ed328" },
        { id: "sunset_orange", name: "绯红落日", price: 80, colorTop: "#ff5e62", colorBottom: "#dc2626", desc: "如夏威夷火红晚霞般的落日原液，分层绝配！" },
        { id: "peach_pink", name: "蜜桃落雨", price: 120, colorTop: "#ffdbe1", colorBottom: "#f88195" },
        { id: "mist_purple", name: "极光雾紫", price: 150, colorTop: "#d7d2ec", colorBottom: "#796d9c" },
        { id: "midnight_blue", name: "深邃星空", price: 200, colorTop: "#3c6bb8", colorBottom: "#15264e" },
        { id: "deep_sea", name: "清澈海洋", price: 260, colorTop: "#a5e9ff", colorBottom: "#2f96cf" },
        { id: "rich_cocoa", name: "醇香可可", price: 320, colorTop: "#915a45", colorBottom: "#592e1e" },
        // 🔮 第二章专享高阶原液
        { id: "coconut_white", name: "浓纯生椰乳", price: 200, colorTop: "#ffffff", colorBottom: "#ede5d8" },
        { id: "matcha_deep", name: "浓厚抹茶", price: 240, colorTop: "#a3d977", colorBottom: "#3e7b27" },
        { id: "amber_oolong", name: "琥珀乌龙", price: 280, colorTop: "#e9bc84", colorBottom: "#a35b1d" },
        { id: "blackcurrant_night", name: "深暮黑加仑", price: 350, colorTop: "#593574", colorBottom: "#221235" },
        { id: "mint_green", name: "冰爽薄荷", price: 300, colorTop: "#b5ffd9", colorBottom: "#41b883" },
        // 🏪 第三章真实茶饮店招牌原液 (专属于第三章连锁经营)
        { id: "jasmine_tea", name: "茉莉雪芽", chapter: 3, price: 200, colorTop: "#fef08a", colorBottom: "#ca8a04", desc: "清雅高扬的茉莉绿茶，霸道茶姬伯牙绝弦之魂！" },
        { id: "ceylon_black", name: "锡兰红茶", chapter: 3, price: 200, colorTop: "#fdba74", colorBottom: "#9a3412", desc: "香醇甘润的锡兰红茶，亿点点与茶言悦色招牌茶底！" },
        { id: "pure_milk", name: "牧场纯牛乳", chapter: 3, price: 180, colorTop: "#ffffff", colorBottom: "#f1f5f9", desc: "优质高乳蛋白鲜牛乳，奶茶店丝滑核心！" },
        { id: "mango_puree", name: "浓香芒果浆", chapter: 3, price: 260, colorTop: "#fef08a", colorBottom: "#f59e0b", desc: "热带金黄鲜甜芒果果蓉，杨枝甘露必备！" },
        { id: "grape_tea", name: "巨峰葡萄茶", chapter: 3, price: 280, colorTop: "#c084fc", colorBottom: "#6b21a8", desc: "馥郁多汁的巨峰紫葡萄鲜果茶，禧茶招牌！" }
    ],
    inCupItems: [
        { id: "classic_ice", name: "方形冰块", price: 0, emoji: "🧊" },
        { id: "heart_ice", name: "心形冰块", price: 0, emoji: "💙" },
        { id: "sand_beads", name: "沉底金沙", price: 0, emoji: "⏳" },
        { id: "queen_vine", name: "鬼藤花枝", price: 100, emoji: "🌿" },
        { id: "crescent_moon", name: "弯月软糖", price: 120, emoji: "🌙" },
        { id: "rain_drops", name: "彩雨凝珠", price: 160, emoji: "💧" },
        { id: "soil_pebbles", name: "落叶彩石", price: 200, emoji: "🍂" },
        { id: "constellation_stars", name: "星座小星", price: 240, emoji: "✨" },
        { id: "ghost_particles", name: "幽灵微光", price: 300, emoji: "🔮" },
        { id: "coral_seaweed", name: "珊瑚海草", price: 350, emoji: "🪸" },
        { id: "jellyfish", name: "发光水母", price: 450, emoji: "🪼" },
        { id: "gold_flakes", name: "黄金金箔", price: 600, emoji: "🌟" },
        { id: "heart_jelly", name: "爱心果冻", price: 180, emoji: "💖", desc: "晶莹剔透粉嫩Q弹的手作心形果冻块" },
        // 🏪 第三章真实茶饮小料 (专属于第三章连锁经营)
        { id: "boba_pearls", name: "黑糖珍珠波霸", chapter: 3, price: 0, emoji: "🧋", desc: "Q弹软糯的黑糖熬煮波霸珍珠！" },
        { id: "lemon_slice", name: "鲜切柠檬片", chapter: 3, price: 0, emoji: "🍋", desc: "蜜雪冰冰冰鲜柠檬水灵魂！" },
        { id: "orange_slice", name: "鲜切橙片", chapter: 3, price: 0, emoji: "🍊", desc: "现切多汁甜橙切片！" },
        { id: "taro_balls", name: "三色小芋圆", chapter: 3, price: 0, emoji: "🍠", desc: "软糯弹牙的手工芋圆！" },
        { id: "grape_pulp", name: "多肉葡萄果肉", chapter: 3, price: 0, emoji: "🍇", desc: "颗颗手剥爆汁晶莹葡萄果肉！" },
        { id: "peach_jelly", name: "蜜桃晶珠", chapter: 3, price: 0, emoji: "🍑", desc: "脆嫩多汁的蜜桃果肉凝珠，蜜桃四季春必备！" },
        { id: "grapefruit_pulp", name: "柚子粒", chapter: 3, price: 0, emoji: "🍊", desc: "粒粒爆汁金黄红心西柚果肉粒，杨枝甘露灵魂小料！" }
    ],
    foams: [
        { id: "none", name: "无封层", price: 0, emoji: "🚫" },
        { id: "snow_wood", name: "寒冬积雪", price: 0, emoji: "❄️" },
        { id: "sand_plate", name: "金色沙顶", price: 0, emoji: "🏖️" },
        { id: "pumpkin_cream", name: "南瓜奶油", price: 150, emoji: "🎃" },
        { id: "rain_cloud", name: "落雨白云", price: 180, emoji: "☁️" },
        { id: "night_cloud", name: "夜幕星云", price: 220, emoji: "🌌" },
        { id: "black_rose_cream", name: "黑玫瑰膏", price: 280, emoji: "🖤" },
        { id: "ocean_ice_cap", name: "浮冰奶盖", price: 320, emoji: "🌊" },
        { id: "soil_top", name: "巧克力花泥", price: 360, emoji: "🍫", desc: "浓郁巧克力碎铺面的手作花泥奶盖" },
        { id: "cotton_candy", name: "棉花糖顶", price: 500, emoji: "🍬" },
        // 🏪 第三章茶饮经典封层 (专属于第三章连锁经营)
        { id: "cheese_foam", name: "芝士厚奶盖", chapter: 3, price: 0, emoji: "🧀", desc: "咸甜浓郁的禧茶风海盐芝士厚奶盖！" },
        { id: "whipped_cream", name: "鲜奶油雪顶", chapter: 3, price: 0, emoji: "🍦", desc: "高耸云端的动物淡奶油雪顶，茶言悦色招牌！" },
        { id: "ice_cream_float", name: "冰淇淋浮顶", chapter: 3, price: 0, emoji: "🍨", desc: "亿点点经典香草冰淇淋大冰球！" }
    ],
    toppers: [
        { id: "none", name: "无装饰", price: 0, emoji: "🚫" },
        { id: "snowman", name: "小雪人", price: 0, emoji: "⛄" },
        { id: "sand_castle", name: "沙雕城堡", price: 0, emoji: "🏰" },
        { id: "pink_rose", name: "盛放粉玫瑰", price: 200, emoji: "🌹" },
        { id: "pumpkin_flowers", name: "南瓜繁花", price: 240, emoji: "💐" },
        { id: "glowing_big_star", name: "发光大星", price: 300, emoji: "⭐" },
        { id: "twin_ghosts", name: "双生小幽灵", price: 350, emoji: "👻" },
        { id: "bear_with_shell", name: "贝壳白熊", price: 400, emoji: "🐻" },
        { id: "green_succulent", name: "胖胖多肉", price: 450, emoji: "🌱" },
        { id: "crown_cat", name: "皇冠猫咪", price: 800, emoji: "👑" },
        // 🌟 新增趣味精致装饰
        { id: "lemon_wedge", name: "鲜切柠檬片", price: 150, emoji: "🍋", desc: "挂在杯沿的一弯金黄鲜柠檬片" },
        { id: "glass_straw", name: "玻璃吸管", price: 180, emoji: "🥤", desc: "晶莹剔透的高透玻璃直吸管" },
        { id: "heart_straw", name: "爱心吸管", price: 200, emoji: "💖", desc: "浪漫粉嫩的心形扭扭吸管" },
        { id: "fresh_mint", name: "鲜薄荷叶", price: 160, emoji: "🌿", desc: "带着晶莹露珠的清新双生薄荷叶" },
        { id: "ruby_cherry", name: "晶红车厘子", price: 220, emoji: "🍒", desc: "鲜红欲滴带翠绿果梗的双生小樱桃" },
        { id: "biscuit_waffle", name: "焦糖脆饼", price: 260, emoji: "🧇", desc: "金黄酥脆的迷你手作华夫焦糖脆饼" },
        { id: "paper_umbrella", name: "小黄遮阳伞", price: 280, emoji: "⛱️", desc: "度假海滩经典鸡尾酒折叠迷你纸伞" },
        { id: "marshmallow_skewer", name: "炙烤棉花糖串", price: 320, emoji: "🍡", desc: "微焦拉丝的竹签手串软糯棉花糖" },
        { id: "rainbow_lollipop", name: "彩虹波板糖", price: 260, emoji: "🍭", desc: "梦幻旋转彩虹漩涡大棒棒糖，甜蜜加倍" },
        // 🏪 第三章茶饮特色装饰 (专属于第三章连锁经营)
        { id: "pecan_nuts", name: "碧根果坚果碎", chapter: 3, price: 0, emoji: "🥜", desc: "香脆喷香的碧根果碎，幽兰拿铁装饰灵魂！" },
        { id: "caramel_drizzle", name: "焦糖淋酱", chapter: 3, price: 0, emoji: "🍯", desc: "金黄诱人的焦糖拉花淋酱！" },
        { id: "soybean_powder", name: "熟香黄豆粉", chapter: 3, price: 0, emoji: "🌾", desc: "茶百客豆乳玉麒麟灵魂黄豆粉！" },
        { id: "dried_rose_petals", name: "干红玫瑰碎", chapter: 3, price: 0, emoji: "🥀", desc: "天然芬芳的干玫瑰花碎！" }
    ]
};

// 🏆 阶梯式成就系统全量配置 (同类型成就聚合展示，领奖后自动切换下一阶段)
const ACHIEVEMENT_GROUPS_CONFIG = [
    // 1. 🍹 调饮出杯系列 (1, 10, 100, 1000 杯)
    {
        groupId: "group_serves",
        icon: "🍹",
        title: "调饮出杯",
        tiers: [
            { id: "serve_1", aliasIds: ["first_serve"], name: "初出茅庐", desc: "成功调制并完成出杯第 1 杯特调", target: 1, type: "totalServes", rewardDiamonds: 20, rewardCoins: 200 },
            { id: "serve_10", name: "吧台熟手", desc: "熟能生巧！累计调制出杯达到 10 杯", target: 10, type: "totalServes", rewardDiamonds: 50, rewardCoins: 800 },
            { id: "serve_100", name: "调饮名家", desc: "顾客盈门！累计调制出杯达到 100 杯", target: 100, type: "totalServes", rewardDiamonds: 150, rewardCoins: 3000 },
            { id: "serve_1000", name: "特调宗师", desc: "震烁全城！累计调制出杯突破 1000 杯", target: 1000, type: "totalServes", rewardDiamonds: 500, rewardCoins: 20000 }
        ]
    },

    // 2. 🛍️ 物料大满贯系列 (小料、原液、奶盖、装饰、杯具)
    {
        groupId: "group_collect_items",
        icon: "🧊",
        title: "小料收集",
        tiers: [
            { id: "items_all", name: "小料大满贯", desc: "购买解锁货架上的全部在售特色小料", target: 1, type: "collect_items", rewardDiamonds: 60, rewardCoins: 1200 }
        ]
    },
    {
        groupId: "group_collect_liquids",
        icon: "🧪",
        title: "原液收集",
        tiers: [
            { id: "liquids_all", name: "原液大满贯", desc: "购买解锁货架上的全部在售特调原液", target: 1, type: "collect_liquids", rewardDiamonds: 60, rewardCoins: 1200 }
        ]
    },
    {
        groupId: "group_collect_foams",
        icon: "☁️",
        title: "奶盖收集",
        tiers: [
            { id: "foams_all", name: "奶盖大满贯", desc: "购买解锁货架上的全部在售云朵与特色奶盖", target: 1, type: "collect_foams", rewardDiamonds: 60, rewardCoins: 1200 }
        ]
    },
    {
        groupId: "group_collect_toppers",
        icon: "🌹",
        title: "装饰收集",
        tiers: [
            { id: "toppers_all", name: "装饰大满贯", desc: "购买解锁货架上的全部在售艺术摆件与装饰", target: 1, type: "collect_toppers", rewardDiamonds: 100, rewardCoins: 2500 }
        ]
    },
    {
        groupId: "group_collect_glasses",
        icon: "🥂",
        title: "杯具鉴赏",
        tiers: [
            { id: "glasses_all", name: "杯具大全套", desc: "集齐全部在售常规杯型、进阶量杯及终极奇迹圣杯", target: 1, type: "collect_glasses", rewardDiamonds: 200, rewardCoins: 5000 }
        ]
    },

    // 3. 💰 财富宝盆系列 (100, 1k, 1w, 10w, 100w)
    {
        groupId: "group_wealth_coins",
        icon: "💰",
        title: "财富宝盆",
        tiers: [
            { id: "coin_100", name: "初获积蓄", desc: "赚取第一桶金，当前金币达到 100 💰", target: 100, type: "coins", rewardDiamonds: 10, rewardCoins: 50 },
            { id: "coin_1k", name: "小有积蓄", desc: "钱包渐鼓！当前金币达到 1,000 (1k) 💰", target: 1000, type: "coins", rewardDiamonds: 30, rewardCoins: 300 },
            { id: "coin_1w", name: "吧台小富", desc: "日进斗金！当前金币达到 10,000 (1w) 💰", target: 10000, type: "coins", rewardDiamonds: 80, rewardCoins: 1500 },
            { id: "coin_10w", name: "黄金掌柜", desc: "大商巨擘！当前金币达到 100,000 (10w) 💰", target: 100000, type: "coins", rewardDiamonds: 200, rewardCoins: 6000 },
            { id: "coin_100w", name: "百万巨富", desc: "富可敌国！当前金币突破 1,000,000 (100w) 💰", target: 1000000, type: "coins", rewardDiamonds: 500, rewardCoins: 50000 }
        ]
    },

    // 4. 📖 配方大全系列 (3, 9, 18, 27, 54全部)
    {
        groupId: "group_recipes",
        icon: "📖",
        title: "配方大全",
        tiers: [
            { id: "recipe_3", aliasIds: ["recipe_5", "book_collector"], name: "秘方初窥", desc: "配方大全中累计解锁收录 3 款特调秘方", target: 3, type: "recipesUnlocked", rewardDiamonds: 20, rewardCoins: 300 },
            { id: "recipe_9", aliasIds: ["recipe_10"], name: "晨曦集册", desc: "第一章全收录！配方大全累计收录 9 款特调秘方", target: 9, type: "recipesUnlocked", rewardDiamonds: 50, rewardCoins: 800 },
            { id: "recipe_18", aliasIds: ["recipe_20"], name: "微醺博览", desc: "前两章大满贯！配方大全累计收录 18 款特调秘方", target: 18, type: "recipesUnlocked", rewardDiamonds: 100, rewardCoins: 2000 },
            { id: "recipe_27", name: "特调百科", desc: "连锁品牌初窥！配方大全累计收录 27 款特调秘方", target: 27, type: "recipesUnlocked", rewardDiamonds: 200, rewardCoins: 5000 },
            { id: "recipe_54", aliasIds: ["recipe_all"], name: "全知全能", desc: "大满贯！配方大全收录全部 54 款神作特调秘方", target: 54, type: "recipesUnlocked", rewardDiamonds: 500, rewardCoins: 20000 }
        ]
    },

    // 5. 🌟 星河璀璨系列 (9阶: 9, 18, 27, 36, 45, 54, 63, 72, 81★)
    {
        groupId: "group_stars",
        icon: "🌟",
        title: "星河璀璨",
        tiers: [
            { id: "star_9", name: "初入吧台", desc: "关卡中累计集齐 9 颗星星 ★", target: 9, type: "stars", rewardDiamonds: 20, rewardCoins: 300 },
            { id: "star_18", name: "渐入佳境", desc: "关卡中累计集齐 18 颗星星 ★", target: 18, type: "stars", rewardDiamonds: 40, rewardCoins: 600 },
            { id: "star_27", name: "晨曦大师", desc: "第一章全满星！关卡累计集齐 27 颗星星 ★", target: 27, type: "stars", rewardDiamonds: 80, rewardCoins: 1200 },
            { id: "star_36", name: "巧手调和", desc: "关卡中累计集齐 36 颗星星 ★", target: 36, type: "stars", rewardDiamonds: 120, rewardCoins: 2000 },
            { id: "star_45", name: "风味先锋", desc: "关卡中累计集齐 45 颗星星 ★", target: 45, type: "stars", rewardDiamonds: 160, rewardCoins: 3000 },
            { id: "star_54", name: "微醺宗师", desc: "第二章全满星！关卡累计集齐 54 颗星星 ★", target: 54, type: "stars", rewardDiamonds: 220, rewardCoins: 5000 },
            { id: "star_63", name: "商业领航", desc: "关卡中累计集齐 63 颗星星 ★", target: 63, type: "stars", rewardDiamonds: 300, rewardCoins: 8000 },
            { id: "star_72", name: "调饮宗师", desc: "关卡中累计集齐 72 颗星星 ★", target: 72, type: "stars", rewardDiamonds: 400, rewardCoins: 12000 },
            { id: "star_81", name: "特调神祇", desc: "集齐全部 81 颗星星！成就全关卡终极神祇 ★★★", target: 81, type: "stars", rewardDiamonds: 600, rewardCoins: 25000 }
        ]
    },

    // 6. 🎨 灵感工坊系列 (3, 9, 21, 100, 365)
    {
        groupId: "group_free_creations",
        icon: "🎨",
        title: "灵感工坊",
        tiers: [
            { id: "free_3", aliasIds: ["free_creator"], name: "灵感萌芽", desc: "在自由模式中不受拘束随心创作 3 次", target: 3, type: "freeServes", rewardDiamonds: 20, rewardCoins: 300 },
            { id: "free_9", name: "妙笔生花", desc: "灵感泉涌！在自由模式中创作达到 9 次", target: 9, type: "freeServes", rewardDiamonds: 40, rewardCoins: 800 },
            { id: "free_21", name: "自成一派", desc: "独具匠心！在自由模式中创作达到 21 次", target: 21, type: "freeServes", rewardDiamonds: 80, rewardCoins: 1800 },
            { id: "free_100", name: "艺术狂想", desc: "千姿百态！在自由模式中累计创作达到 100 次", target: 100, type: "freeServes", rewardDiamonds: 200, rewardCoins: 5000 },
            { id: "free_365", name: "一日一调", desc: "年度里程碑！自由创作突破 365 次", target: 365, type: "freeServes", rewardDiamonds: 500, rewardCoins: 25000 }
        ]
    },

    // 7. 🏮 商业大亨系列 (500, 1000, 10000)
    {
        groupId: "group_c3_profit",
        icon: "🏮",
        title: "商业大亨",
        tiers: [
            { id: "c3_profit_500", name: "初露锋芒", desc: "第三章连锁经营单关净利润达到 500 💰", target: 500, type: "c3MaxProfit", rewardDiamonds: 50, rewardCoins: 800 },
            { id: "c3_profit_1000", name: "生意兴隆", desc: "客似云来！第三章单关净利润达到 1,000 💰", target: 1000, type: "c3MaxProfit", rewardDiamonds: 100, rewardCoins: 2000 },
            { id: "c3_profit_1w", name: "商业奇迹", desc: "传奇经营！第三章单关净利润突破 10,000 (1w) 💰", target: 10000, type: "c3MaxProfit", rewardDiamonds: 300, rewardCoins: 10000 }
        ]
    },

    // 8. 🏆 通关征程系列 (第一章、第二章、第三章全通关大奖)
    {
        groupId: "group_chapter_clear",
        icon: "🚩",
        title: "通关征程",
        tiers: [
            { id: "chap1_clear", chapter: 1, name: "晨曦破晓", desc: "通关第一章（海风与晨曦）全部 9 关！", target: 9, type: "chapter_clear", rewardDiamonds: 100, rewardCoins: 2000 },
            { id: "chap2_clear", chapter: 2, name: "微醺落幕", desc: "通关第二章（晚霞与微醺）全部 9 关！", target: 9, type: "chapter_clear", rewardDiamonds: 200, rewardCoins: 5000 },
            { id: "chap3_clear", chapter: 3, name: "商业圆满", desc: "通关第三章（连锁经营篇）全部 9 关！特调全盘大通关！", target: 9, type: "chapter_clear", rewardDiamonds: 500, rewardCoins: 20000 }
        ]
    },

    // 9. 🧊 冰爽透心系列 (5, 30, 100, 500 次)
    {
        groupId: "group_ice",
        icon: "🧊",
        title: "冰爽透心",
        tiers: [
            { id: "ice_5", aliasIds: ["ice_lover"], name: "冰爽初尝", desc: "特调中累计放入经典冰块或心形冰块 5 次", target: 5, type: "iceUsed", rewardDiamonds: 20, rewardCoins: 300 },
            { id: "ice_30", name: "吧台碎冰手", desc: "清爽加倍！特调中累计放入冰块达到 30 次", target: 30, type: "iceUsed", rewardDiamonds: 50, rewardCoins: 800 },
            { id: "ice_100", name: "冰封王座", desc: "透心清凉！特调中累计放入冰块达到 100 次", target: 100, type: "iceUsed", rewardDiamonds: 150, rewardCoins: 3000 },
            { id: "ice_500", name: "冰河世纪", desc: "冰爽神话！特调中累计放入冰块达到 500 次", target: 500, type: "iceUsed", rewardDiamonds: 300, rewardCoins: 10000 }
        ]
    },

    // 10. 🌈 层层渐变系列 (3, 15, 50 杯分层特调)
    {
        groupId: "group_layer",
        icon: "🌈",
        title: "层层渐变",
        tiers: [
            { id: "layer_3", name: "色彩初试", desc: "成功调制并出杯 3 杯分层渐变特调", target: 3, type: "layeredDrinks", rewardDiamonds: 20, rewardCoins: 300 },
            { id: "layer_15", name: "调色大师", desc: "层层流光！累计出杯 15 杯分层渐变特调", target: 15, type: "layeredDrinks", rewardDiamonds: 60, rewardCoins: 1000 },
            { id: "layer_50", name: "视觉宗师", desc: "奇迹极光！累计出杯 50 杯梦幻分层特调", target: 50, type: "layeredDrinks", rewardDiamonds: 150, rewardCoins: 4000 }
        ]
    },

    // 11. ☁️ 云朵厚乳系列 (5, 25, 100 次奶盖/雪顶)
    {
        groupId: "group_foam",
        icon: "☁️",
        title: "云朵厚乳",
        tiers: [
            { id: "foam_5", name: "云朵初盖", desc: "特调中累计注入云朵奶盖或雪顶 5 次", target: 5, type: "foamUsed", rewardDiamonds: 20, rewardCoins: 300 },
            { id: "foam_25", name: "厚乳狂热", desc: "绵密咸甜！累计注入奶盖达到 25 次", target: 25, type: "foamUsed", rewardDiamonds: 60, rewardCoins: 1000 },
            { id: "foam_100", name: "绵密王国", desc: "雪顶仙境！特调中累计注入奶盖达到 100 次", target: 100, type: "foamUsed", rewardDiamonds: 150, rewardCoins: 4000 }
        ]
    },

    // 12. 🚿 吧台断舍离系列 (3, 10, 30 次清空重置)
    {
        groupId: "group_dump",
        icon: "🚿",
        title: "断舍离",
        tiers: [
            { id: "dump_3", name: "精益求精", desc: "不满意就重来！累计清空重置杯子 3 次", target: 3, type: "cupDumped", rewardDiamonds: 10, rewardCoins: 200 },
            { id: "dump_10", name: "完美主义者", desc: "追求完美！累计清空重置杯子达到 10 次", target: 10, type: "cupDumped", rewardDiamonds: 30, rewardCoins: 600 },
            { id: "dump_30", name: "从容归零", desc: "精工细作！累计清空重置杯子达到 30 次", target: 30, type: "cupDumped", rewardDiamonds: 100, rewardCoins: 2000 }
        ]
    },

    // 13. ⚡ 极速魔法系列 (1, 20, 100 次自动特调)
    {
        groupId: "group_auto",
        icon: "⚡",
        title: "极速魔法",
        tiers: [
            { id: "auto_1", aliasIds: ["auto_master"], name: "极速初体验", desc: "首次使用【⚡ 自动出单】完成特调调配", target: 1, type: "autoServes", rewardDiamonds: 30, rewardCoins: 300 },
            { id: "auto_20", name: "省心掌柜", desc: "全神贯注！累计使用自动出餐 20 次", target: 20, type: "autoServes", rewardDiamonds: 60, rewardCoins: 1000 },
            { id: "auto_100", name: "流光工厂", desc: "神速出单！累计使用自动出餐达到 100 次", target: 100, type: "autoServes", rewardDiamonds: 150, rewardCoins: 3000 }
        ]
    },

    // 14. 🏆 奇迹圣杯系列 (单阶压轴)
    {
        groupId: "group_holy_miracle",
        icon: "🏆",
        title: "奇迹圣杯",
        tiers: [
            { id: "holy_miracle", name: "点石成金", desc: "使用 100W💰【奇迹圣杯】调制特调，见证奇迹", target: 1, type: "holyUsed", rewardDiamonds: 200, rewardCoins: 5000 }
        ]
    }
];

// 向下兼容的扁平成就列表
const ACHIEVEMENTS_CONFIG = ACHIEVEMENT_GROUPS_CONFIG.flatMap(g => g.tiers.map(t => ({
    ...t,
    groupId: g.groupId,
    icon: g.icon,
    groupTitle: g.title,
    title: t.name
})));

// 本地存档管理器 (支持 3 个独立存档位，默认使用槽位 1，支持保存、切换与删除)
const StorageManager = {
    BASE_KEY: "cozy_bartender_data_v1",
    SLOT_KEY: "cozy_bartender_active_slot",

    // 获取当前激活的存档槽位 (1, 2, 3，默认 1)
    getActiveSlot() {
        try {
            const s = parseInt(localStorage.getItem(this.SLOT_KEY) || "1", 10);
            return (s >= 1 && s <= 3) ? s : 1;
        } catch (e) {
            return 1;
        }
    },

    // 设置当前激活的存档槽位
    setActiveSlot(slot) {
        slot = Math.max(1, Math.min(3, parseInt(slot, 10) || 1));
        localStorage.setItem(this.SLOT_KEY, slot.toString());
        return slot;
    },

    // 获取指定槽位的存储键名 (槽位 1 沿用原键名，确保老玩家无缝兼容)
    getSlotStorageKey(slot) {
        slot = parseInt(slot, 10) || 1;
        return slot === 1 ? this.BASE_KEY : `${this.BASE_KEY}_slot${slot}`;
    },

    // 获取当前激活槽位的存储键名
    getCurrentKey() {
        return this.getSlotStorageKey(this.getActiveSlot());
    },

    // 兼容原有的 KEY 属性
    get KEY() {
        return this.getCurrentKey();
    },

    getDefaultUnlocked() {
        return {
            unlockedGlasses: ["classic", "hourglass"],
            unlockedLiquids: ["ice_blue", "golden_sand", "lime_green"],
            unlockedItems: ["classic_ice", "heart_ice", "sand_beads"],
            unlockedFoams: ["none", "snow_wood", "sand_plate"],
            unlockedToppers: ["none", "snowman", "sand_castle"]
        };
    },

    getDefaultData() {
        const defaults = this.getDefaultUnlocked();
        return {
            coins: 0,
            diamonds: 0,
            shopName: "治愈特调吧",
            ...defaults,
            currentLevel: 1,
            unlockedLevel: 1,
            unlockedChapters: [1],
            unlockedMeasuringCups: ["full", "half"],
            levelRecords: {},
            claimedAchievements: [],
            perfectRewardedLevels: [],
            stats: { totalServes: 0, freeServes: 0, autoServes: 0, iceUsed: 0, holyUsed: 0 },
            updatedAt: Date.now()
        };
    },

    getData(slot = null) {
        const defaults = this.getDefaultUnlocked();
        const key = slot ? this.getSlotStorageKey(slot) : this.getCurrentKey();
        try {
            const raw = localStorage.getItem(key);
            if (raw) {
                const parsed = JSON.parse(raw);
                if (parsed.coins === undefined) parsed.coins = 0;
                if (parsed.diamonds === undefined) parsed.diamonds = 0;
                if (!parsed.shopName) parsed.shopName = "治愈特调吧";
                if (!parsed.claimedAchievements) parsed.claimedAchievements = [];
                if (!parsed.perfectRewardedLevels) parsed.perfectRewardedLevels = [];
                if (!parsed.unlockedChapters) parsed.unlockedChapters = [1];
                if (!parsed.unlockedMeasuringCups) parsed.unlockedMeasuringCups = ["full", "half"];
                if (!parsed.stats) {
                    parsed.stats = { totalServes: 0, freeServes: 0, autoServes: 0, iceUsed: 0, holyUsed: 0 };
                }
                
                // 确保默认前两关基础材料全部包含且为数组
                if (!Array.isArray(parsed.unlockedGlasses)) parsed.unlockedGlasses = [...defaults.unlockedGlasses];
                if (!Array.isArray(parsed.unlockedLiquids)) parsed.unlockedLiquids = [...defaults.unlockedLiquids];
                if (!Array.isArray(parsed.unlockedItems)) parsed.unlockedItems = [...defaults.unlockedItems];
                if (!Array.isArray(parsed.unlockedFoams)) parsed.unlockedFoams = [...defaults.unlockedFoams];
                if (!Array.isArray(parsed.unlockedToppers)) parsed.unlockedToppers = [...defaults.unlockedToppers];

                defaults.unlockedGlasses.forEach(id => { if (!parsed.unlockedGlasses.includes(id)) parsed.unlockedGlasses.push(id); });
                defaults.unlockedLiquids.forEach(id => { if (!parsed.unlockedLiquids.includes(id)) parsed.unlockedLiquids.push(id); });
                defaults.unlockedItems.forEach(id => { if (!parsed.unlockedItems.includes(id)) parsed.unlockedItems.push(id); });
                defaults.unlockedFoams.forEach(id => { if (!parsed.unlockedFoams.includes(id)) parsed.unlockedFoams.push(id); });
                defaults.unlockedToppers.forEach(id => { if (!parsed.unlockedToppers.includes(id)) parsed.unlockedToppers.push(id); });
                
                return parsed;
            }
        } catch (e) {
            console.error("读取存档失败", e);
        }
        return this.getDefaultData();
    },

    saveData(data, slot = null) {
        const key = slot ? this.getSlotStorageKey(slot) : this.getCurrentKey();
        try {
            data.updatedAt = Date.now();
            localStorage.setItem(key, JSON.stringify(data));
        } catch (e) {
            console.error("保存存档失败", e);
        }
    },

    // 获取指定槽位的摘要信息 (用于存档面板展示)
    getSlotSummary(slot) {
        slot = Math.max(1, Math.min(3, parseInt(slot, 10) || 1));
        const key = this.getSlotStorageKey(slot);
        const isActive = this.getActiveSlot() === slot;
        try {
            const raw = localStorage.getItem(key);
            if (!raw) {
                return {
                    slot,
                    isEmpty: true,
                    isActive,
                    level: 1,
                    levelCode: "1-1",
                    levelName: "新吧台启程",
                    stars: 0,
                    coins: 0,
                    diamonds: 0,
                    updatedAt: null
                };
            }
            const data = JSON.parse(raw);
            const level = data.currentLevel || 1;
            const recipe = (window.DRINK_RECIPES || []).find(r => r.level === level) || window.DRINK_RECIPES?.[0];
            const levelCode = window.formatLevelCode ? window.formatLevelCode(level) : `1-${level}`;
            let totalStars = 0;
            if (data.levelRecords) {
                Object.values(data.levelRecords).forEach(rec => {
                    if (rec && rec.stars) totalStars += rec.stars;
                });
            }
            return {
                slot,
                isEmpty: false,
                isActive,
                level,
                levelCode,
                levelName: recipe ? recipe.name : "调饮之旅",
                stars: totalStars,
                coins: data.coins || 0,
                diamonds: data.diamonds || 0,
                updatedAt: data.updatedAt || null
            };
        } catch (e) {
            return {
                slot,
                isEmpty: true,
                isActive,
                level: 1,
                levelCode: "1-1",
                levelName: "新吧台启程",
                stars: 0,
                coins: 0,
                diamonds: 0,
                updatedAt: null
            };
        }
    },

    // 将当前游玩数据保存覆盖到指定槽位
    saveCurrentToSlot(slot) {
        slot = Math.max(1, Math.min(3, parseInt(slot, 10) || 1));
        const curData = this.getData();
        curData.updatedAt = Date.now();
        const key = this.getSlotStorageKey(slot);
        localStorage.setItem(key, JSON.stringify(curData));
        return this.getSlotSummary(slot);
    },

    // 删除清空指定槽位
    deleteSlot(slot) {
        slot = Math.max(1, Math.min(3, parseInt(slot, 10) || 1));
        const key = this.getSlotStorageKey(slot);
        localStorage.removeItem(key);
        // 若删除的是当前正激活的槽位，则写入干净的全新开局存档
        if (this.getActiveSlot() === slot) {
            const fresh = this.getDefaultData();
            fresh.updatedAt = Date.now();
            localStorage.setItem(key, JSON.stringify(fresh));
        }
        return true;
    },

    // 切换当前激活的存档槽位
    switchToSlot(slot) {
        slot = Math.max(1, Math.min(3, parseInt(slot, 10) || 1));
        this.setActiveSlot(slot);
        return this.getData();
    },

    addCoins(amount) {
        const data = this.getData();
        data.coins = Math.max(0, (data.coins || 0) + amount);
        this.saveData(data);
        return data.coins;
    },

    addDiamonds(amount) {
        const data = this.getData();
        data.diamonds = Math.max(0, (data.diamonds || 0) + amount);
        this.saveData(data);
        return data.diamonds;
    },

    recordStat(statKey, increment = 1) {
        const data = this.getData();
        if (!data.stats) data.stats = { totalServes: 0, freeServes: 0, autoServes: 0, iceUsed: 0, holyUsed: 0 };
        data.stats[statKey] = (data.stats[statKey] || 0) + increment;
        this.saveData(data);
    },

    getTotalStars() {
        const data = this.getData();
        let total = 0;
        if (data.levelRecords) {
            Object.values(data.levelRecords).forEach(rec => {
                if (rec && rec.stars) total += rec.stars;
            });
        }
        return total;
    },

    // 检查某一个阶梯是否已被领取 (支持别名平滑兼容历史存档)
    isTierClaimed(tier, data) {
        if (!data) data = this.getData();
        const claimed = data.claimedAchievements || [];
        if (claimed.includes(tier.id)) return true;
        if (tier.aliasIds && tier.aliasIds.some(aid => claimed.includes(aid))) return true;
        return false;
    },

    // 计算单个阶梯的进度数值与达成状态
    getTierProgress(tier, data) {
        if (!data) data = this.getData();
        let current = 0;
        let target = tier.target || 1;

        if (tier.type === "stars") {
            current = this.getTotalStars();
        } else if (tier.type === "recipesUnlocked") {
            let unlockedCount = 0;
            const records = data.levelRecords || {};
            const recipes = window.DRINK_RECIPES || [];
            recipes.forEach(r => {
                const count = (r.availableDrinks && r.availableDrinks.length > 0) ? r.availableDrinks.length : 1;
                const isC3 = (r.chapter === 3 || r.level >= 19);
                if (isC3) {
                    // 第三章：解锁一关就加上该关卡的配方数
                    if (this.isLevelUnlocked(r.level)) {
                        unlockedCount += count;
                    }
                } else {
                    // 第一、二章：通关达标收录
                    const rec = records[r.level];
                    if (rec && (rec.score >= 60 || (rec.stars && rec.stars >= 1))) {
                        unlockedCount += count;
                    }
                }
            });
            current = unlockedCount;
        } else if (tier.type === "collect_items") {
            const required = (window.INGREDIENTS_CATALOG.inCupItems || []).filter(i => (i.price || 0) > 0 && !i.chapter).map(i => i.id);
            const unlocked = data.unlockedItems || [];
            current = required.filter(id => unlocked.includes(id)).length;
            target = required.length;
        } else if (tier.type === "collect_liquids") {
            const required = (window.INGREDIENTS_CATALOG.liquids || []).filter(i => (i.price || 0) > 0 && !i.chapter).map(i => i.id);
            const unlocked = data.unlockedLiquids || [];
            current = required.filter(id => unlocked.includes(id)).length;
            target = required.length;
        } else if (tier.type === "collect_foams") {
            const required = (window.INGREDIENTS_CATALOG.foams || []).filter(i => (i.price || 0) > 0 && !i.chapter).map(i => i.id);
            const unlocked = data.unlockedFoams || [];
            current = required.filter(id => unlocked.includes(id)).length;
            target = required.length;
        } else if (tier.type === "collect_toppers") {
            const required = (window.INGREDIENTS_CATALOG.toppers || []).filter(i => (i.price || 0) > 0 && !i.chapter).map(i => i.id);
            const unlocked = data.unlockedToppers || [];
            current = required.filter(id => unlocked.includes(id)).length;
            target = required.length;
        } else if (tier.type === "collect_glasses") {
            const reqGlasses = (window.INGREDIENTS_CATALOG.glasses || []).filter(i => (i.price || 0) > 0 && !i.chapter).map(i => i.id);
            const reqCups = (window.MEASURING_CUPS_CATALOG || []).filter(c => (c.price || 0) > 0).map(c => c.id);
            const unlockedG = data.unlockedGlasses || [];
            const unlockedC = data.unlockedMeasuringCups || [];
            current = reqGlasses.filter(id => unlockedG.includes(id)).length + reqCups.filter(id => unlockedC.includes(id)).length;
            target = reqGlasses.length + reqCups.length;
        } else if (tier.type === "coins") {
            current = data.coins || 0;
            target = tier.target;
        } else if (tier.type === "c3MaxProfit") {
            let maxP = (data.stats && data.stats.maxC3Profit) || 0;
            if (data.levelRecords) {
                Object.values(data.levelRecords).forEach(rec => {
                    if (rec && rec.profit) maxP = Math.max(maxP, rec.profit);
                });
            }
            current = maxP;
            target = tier.target;
        } else if (tier.type === "chapter_clear") {
            const chap = tier.chapter || 1;
            const startLevel = (chap - 1) * 9 + 1;
            const endLevel = chap * 9;
            let clearedCount = 0;
            if (data.levelRecords) {
                for (let lvl = startLevel; lvl <= endLevel; lvl++) {
                    const rec = data.levelRecords[lvl];
                    if (rec && (rec.score >= 60 || (rec.stars && rec.stars >= 1))) {
                        clearedCount++;
                    }
                }
            }
            current = clearedCount;
            target = 9;
        } else {
            current = (data.stats && data.stats[tier.type]) || 0;
        }

        const isClaimed = this.isTierClaimed(tier, data);
        const isCompleted = current >= target;

        return {
            current: Math.min(current, target),
            rawCurrent: current,
            target,
            isCompleted,
            isClaimed
        };
    },

    // 🏆 获取一个成就分组当前的激活展示阶梯
    getGroupProgress(group, data) {
        if (!data) data = this.getData();
        const tiers = group.tiers || [];
        if (tiers.length === 0) return null;

        // 寻找第一个未领奖的阶梯
        let activeIndex = -1;
        for (let i = 0; i < tiers.length; i++) {
            if (!this.isTierClaimed(tiers[i], data)) {
                activeIndex = i;
                break;
            }
        }

        let currentTier;
        let isAllClaimed = false;

        if (activeIndex !== -1) {
            currentTier = tiers[activeIndex];
        } else {
            // 全部阶段均已领取完毕，展示最后一个阶梯并标记为全部达成
            activeIndex = tiers.length - 1;
            currentTier = tiers[activeIndex];
            isAllClaimed = true;
        }

        const prog = this.getTierProgress(currentTier, data);

        return {
            group,
            currentTier,
            tierIndex: activeIndex + 1,
            totalTiers: tiers.length,
            current: prog.current,
            rawCurrent: prog.rawCurrent,
            target: prog.target,
            isCompleted: prog.isCompleted,
            isClaimed: prog.isClaimed,
            isAllClaimed
        };
    },

    // 领取某个成就分组当前阶段的奖励，并返回更新后自动升阶的状态
    claimGroupAchievement(groupId) {
        const group = (window.ACHIEVEMENT_GROUPS_CONFIG || []).find(g => g.groupId === groupId);
        if (!group) return null;

        const groupProg = this.getGroupProgress(group);
        if (!groupProg || !groupProg.isCompleted || groupProg.isClaimed) return null;

        const curTier = groupProg.currentTier;
        const data = this.getData();
        if (!data.claimedAchievements) data.claimedAchievements = [];
        data.claimedAchievements.push(curTier.id);
        data.coins = (data.coins || 0) + (curTier.rewardCoins || 0);
        data.diamonds = (data.diamonds || 0) + (curTier.rewardDiamonds || 0);
        this.saveData(data);

        // 获取领奖后该分组自动升阶的最新状态
        const nextGroupProg = this.getGroupProgress(group, data);

        return {
            claimedTier: curTier,
            rewardCoins: curTier.rewardCoins || 0,
            rewardDiamonds: curTier.rewardDiamonds || 0,
            totalCoins: data.coins,
            totalDiamonds: data.diamonds,
            nextGroupProg
        };
    },

    // 检查是否有任何未领取的成就奖励 (支持阶梯动态检测)
    hasUnclaimedAchievements() {
        const groups = window.ACHIEVEMENT_GROUPS_CONFIG || [];
        const data = this.getData();
        for (const g of groups) {
            const p = this.getGroupProgress(g, data);
            if (p && p.isCompleted && !p.isClaimed) {
                return true;
            }
        }
        return false;
    },

    // 向下兼容单个成就的查询与领取
    getAchievementProgress(ach) {
        return this.getTierProgress(ach);
    },

    claimAchievement(achId) {
        const ach = (window.ACHIEVEMENTS_CONFIG || []).find(a => a.id === achId);
        if (!ach) return null;
        return this.claimGroupAchievement(ach.groupId);
    },

    isUnlocked(category, id) {
        const data = this.getData();
        const map = {
            glass: data.unlockedGlasses,
            liquid: data.unlockedLiquids,
            item: data.unlockedItems,
            foam: data.unlockedFoams,
            topper: data.unlockedToppers
        };
        const list = map[category] || [];
        return list.includes(id);
    },

    unlockIngredient(category, id) {
        const data = this.getData();
        const catMap = {
            glass: { list: data.unlockedGlasses, catalog: INGREDIENTS_CATALOG.glasses },
            liquid: { list: data.unlockedLiquids, catalog: INGREDIENTS_CATALOG.liquids },
            item: { list: data.unlockedItems, catalog: INGREDIENTS_CATALOG.inCupItems },
            foam: { list: data.unlockedFoams, catalog: INGREDIENTS_CATALOG.foams },
            topper: { list: data.unlockedToppers, catalog: INGREDIENTS_CATALOG.toppers }
        };

        const target = catMap[category];
        if (!target) return false;
        const itemObj = target.catalog.find(i => i.id === id);
        if (!itemObj) return false;
        if (target.list.includes(id)) return true;
        if (data.coins < itemObj.price) return false;

        data.coins -= itemObj.price;
        target.list.push(id);
        this.saveData(data);
        return true;
    },

    unlockGlass(glassId) {
        return this.unlockIngredient("glass", glassId);
    },

    isChapterUnlocked(chapterId) {
        const data = this.getData();
        if (chapterId === 1) return true;
        return (data.unlockedChapters || [1]).includes(chapterId);
    },

    // 检查关卡是否已解锁：
    // 规则：除每章第 1 关(1-1、2-1、3-1)外，章内其他所有关卡严格必须通关前一关(≥60分或≥1星)才解锁！
    isLevelUnlocked(level) {
        const recipes = window.DRINK_RECIPES || DRINK_RECIPES;
        const r = recipes[level - 1];
        if (!r) return false;
        const chap = r.chapter || 1;

        // 1. 所属章节未解锁，关卡不可进入
        if (!this.isChapterUnlocked(chap)) return false;

        // 2. 每一章的第 1 关（第 1 关 1-1、第 10 关 2-1、第 19 关 3-1）：只要该章节已解锁即可直接进入
        if (level === 1 || level === 10 || level === 19) {
            return true;
        }

        // 3. 章内其他所有关卡：严格检测前一关是否已通关 (得分≥60 或 星级≥1)
        const data = this.getData();
        const prevRec = data.levelRecords && data.levelRecords[level - 1];
        if (prevRec && (prevRec.score >= 60 || prevRec.stars >= 1)) {
            return true;
        }

        return false;
    },

    isMeasuringCupUnlocked(cupId) {
        if (cupId === "full" || cupId === "half") return true;
        const data = this.getData();
        return (data.unlockedMeasuringCups || ["full", "half"]).includes(cupId);
    },

    unlockMeasuringCup(cupId) {
        const cup = MEASURING_CUPS_CATALOG.find(c => c.id === cupId);
        if (!cup) return false;
        const data = this.getData();
        if (!data.unlockedMeasuringCups) data.unlockedMeasuringCups = ["full", "half"];
        if (data.unlockedMeasuringCups.includes(cupId)) return true;
        if ((data.coins || 0) < cup.price) return false;

        data.coins -= cup.price;
        data.unlockedMeasuringCups.push(cupId);
        this.saveData(data);
        return true;
    },

    checkAndClaimFirstPerfectReward(level, score) {
        if (score !== 100) return null;
        const data = this.getData();
        if (!data.perfectRewardedLevels) data.perfectRewardedLevels = [];
        if (data.perfectRewardedLevels.includes(level)) {
            return null; // 此关已经领取过首次完美通关奖励
        }
        data.perfectRewardedLevels.push(level);
        const bonus = { diamonds: 10, coins: 200 };
        data.diamonds = (data.diamonds || 0) + bonus.diamonds;
        data.coins = (data.coins || 0) + bonus.coins;
        this.saveData(data);
        return bonus;
    },

    setShopName(name) {
        const data = this.getData();
        data.shopName = (name && name.trim()) ? name.trim() : "治愈特调吧";
        this.saveData(data);
        return data.shopName;
    },

    getShopName() {
        const data = this.getData();
        return data.shopName || "治愈特调吧";
    },

    unlockChapter(chapId, costDiamonds = 0) {
        const data = this.getData();
        if (!data.unlockedChapters) data.unlockedChapters = [1];
        if (data.unlockedChapters.includes(chapId)) return { success: true, already: true };
        if ((data.diamonds || 0) < costDiamonds) return { success: false, reason: "diamonds_shortage" };

        data.diamonds -= costDiamonds;
        data.unlockedChapters.push(chapId);
        this.saveData(data);
        return { success: true, already: false, balanceDiamonds: data.diamonds };
    },

    spendCoins(amount) {
        const data = this.getData();
        if ((data.coins || 0) < amount) return false;
        data.coins -= amount;
        this.saveData(data);
        return true;
    },

    // 🌟 关卡持久化：记录和恢复当前停留关卡 (刷新页面不丢失当前关卡)
    getCurrentLevel() {
        const data = this.getData();
        return data.currentLevel || 1;
    },

    setCurrentLevel(level) {
        if (!level || typeof level !== "number" || level < 1) return;
        const data = this.getData();
        if (data.currentLevel !== level) {
            data.currentLevel = level;
            this.saveData(data);
        }
    },

    // 🧑‍🍳 检查第三章关卡是否已雇佣金牌店员 (自动出杯)
    isStaffHired(level) {
        const data = this.getData();
        if (!data.hiredStaff) data.hiredStaff = [];
        return data.hiredStaff.includes(level) || data.hiredStaff.includes("all");
    },

    // 🧑‍🍳 花费 100 钻雇佣金牌店员
    hireStaff(level, costDiamonds = 100) {
        const data = this.getData();
        if (!data.hiredStaff) data.hiredStaff = [];
        if (data.hiredStaff.includes(level)) return true;
        if ((data.diamonds || 0) < costDiamonds) return false;

        data.diamonds -= costDiamonds;
        data.hiredStaff.push(level);
        this.saveData(data);
        return true;
    },

    saveLevelResult(level, score, stars) {
        const data = this.getData();
        const prev = data.levelRecords[level] || { score: 0, stars: 0 };
        // 🌟 始终保留历史最高分与最高星级，重玩低分绝对不会覆盖历史最佳战绩！
        const bestScore = Math.max(prev.score || 0, score);
        const bestStars = Math.max(prev.stars || 0, stars);
        data.levelRecords[level] = { score: bestScore, stars: bestStars };

        if (bestScore >= 60 && level >= (data.unlockedLevel || 1) && level < DRINK_RECIPES.length) {
            data.unlockedLevel = Math.max(data.unlockedLevel || 1, level + 1);
        }
        this.saveData(data);
        
        // 首次完美通关 (100分) 奖励 10 钻石 + 200 金币
        const perfectBonus = this.checkAndClaimFirstPerfectReward(level, score);
        return { data, perfectBonus };
    },

    saveChapter3Result(level, { stars = 1, profit = 0, timeUsed = 0, ordersCompleted = 0, totalOrders = 0 }) {
        const data = this.getData();
        const prev = data.levelRecords[level] || { score: 0, stars: 0, profit: 0 };
        // 第三章分数换算：1星=70分，2星=85分，3星=100分
        const virtualScore = stars === 3 ? 100 : (stars === 2 ? 85 : (stars === 1 ? 70 : 50));
        
        if (stars > prev.stars || (stars === prev.stars && profit > (prev.profit || 0))) {
            data.levelRecords[level] = {
                score: virtualScore,
                stars: Math.max(prev.stars, stars),
                profit: Math.max(prev.profit || 0, profit),
                timeUsed,
                ordersCompleted,
                totalOrders
            };
        }

        // 只要获得至少 1 颗星 (完成所有订单) 即解锁下一关
        if (stars >= 1 && level >= data.unlockedLevel && level < DRINK_RECIPES.length) {
            data.unlockedLevel = Math.max(data.unlockedLevel, level + 1);
        }

        this.saveData(data);
        const perfectBonus = stars === 3 ? this.checkAndClaimFirstPerfectReward(level, 100) : null;
        return { data, perfectBonus };
    }
};

// 为所有关卡自动挂载统一编号 code 属性 (如 '1-1', '2-1', '3-1')
DRINK_RECIPES.forEach(r => {
    r.code = formatLevelCode(r.level);
});

window.formatLevelCode = formatLevelCode;
window.DRINK_RECIPES = DRINK_RECIPES;
window.MEASURING_CUPS_CATALOG = MEASURING_CUPS_CATALOG;
window.INGREDIENTS_CATALOG = INGREDIENTS_CATALOG;
window.ACHIEVEMENT_GROUPS_CONFIG = ACHIEVEMENT_GROUPS_CONFIG;
window.ACHIEVEMENTS_CONFIG = ACHIEVEMENTS_CONFIG;
window.StorageManager = StorageManager;


