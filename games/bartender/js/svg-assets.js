/**
 * 治愈系手绘风 SVG 矢量资产库 (SVG Asset Generator)
 * 严格按照参考图手绘风格：2~4px 粗黑边描线、圆润形状、高饱和暖润色彩、精致笑脸
 * 统一采用 0 -70 240 290 的扩展 viewBox，彻底避免顶部顶饰被截断，并保证严格的渲染图层顺序
 */

// 杯型物理容器几何参数 (定义各杯型盛液容器内腔实际底部、顶部及安全宽度，确保流体物理严格自适应)
const GLASS_PHYSICS = {
    classic: { bottom: 205, top: 30, width: 190, rimWidth: 196, bottomWidth: 190 },
    hourglass: { bottom: 205, top: 25, width: 170, rimWidth: 192, bottomWidth: 182 },
    martini: { bottom: 140, top: 25, width: 190, rimWidth: 196, bottomWidth: 20 },
    sphere: { bottom: 182, top: 56, width: 140, rimWidth: 84, bottomWidth: 120 },
    milk_carton: { bottom: 202, top: 28, width: 150, rimWidth: 150, bottomWidth: 150 },
    tulip: { bottom: 205, top: 28, width: 160, rimWidth: 170, bottomWidth: 140 },
    cup_medium: { bottom: 204, top: 40, width: 132, rimWidth: 132, bottomWidth: 98 },
    cup_large: { bottom: 208, top: 20, width: 150, rimWidth: 156, bottomWidth: 136 },
    cup_bucket: { bottom: 208, top: 32, width: 190, rimWidth: 190, bottomWidth: 160 },
    holy_grail: { bottom: 155, top: 25, width: 170, rimWidth: 172, bottomWidth: 110 },
    burgundy: { bottom: 140, top: 25, width: 180, rimWidth: 180, bottomWidth: 120 },
    champagne: { bottom: 146, top: 22, width: 120, rimWidth: 64, bottomWidth: 58 },
    flower_tea: { bottom: 158, top: 36, width: 176, rimWidth: 176, bottomWidth: 76 },
    // 🌟 十二星座专属全新手绘杯型物理参数
    fishbowl: { bottom: 188, top: 48, width: 180, rimWidth: 140, bottomWidth: 110 },
    ice_goblet: { bottom: 152, top: 26, width: 170, rimWidth: 176, bottomWidth: 90 },
    wave_goblet: { bottom: 160, top: 30, width: 160, rimWidth: 168, bottomWidth: 110 },
    lantern_coupe: { bottom: 146, top: 42, width: 185, rimWidth: 190, bottomWidth: 60 }
};

const SVG_ASSETS = {
    // 导出物理参数供其他模块使用
    GLASS_PHYSICS,

    // 渲染完整的单体特调 SVG (核心通用方法，保证吧台、卡片、Canvas 三端层级 100% 正确且不截断)
    renderCompleteDrink: (drinkData, options = {}) => {
        const width = options.width || 240;
        const height = options.height || 270;
        const prefix = options.prefix || "stage_" + Math.random().toString(36).substring(2, 7);
        const glassType = drinkData.glassType || "classic";
        const clipId = `cupClip_${prefix}_${glassType}`;

        const physics = GLASS_PHYSICS[glassType] || GLASS_PHYSICS.classic;
        const containerBottom = physics.bottom;
        const containerTop = physics.top;
        const containerHeight = containerBottom - containerTop;

        // 解析液体层 (支持单色液体与量杯多层渐变分层液体，自动匹配目录库颜色)
        const rawLayers = (drinkData.liquids && drinkData.liquids.length > 0)
            ? drinkData.liquids
            : (drinkData.liquid ? [drinkData.liquid] : []);
        const layers = rawLayers.map(l => {
            if (l && (!l.colorTop || !l.colorBottom) && window.INGREDIENTS_CATALOG) {
                const found = window.INGREDIENTS_CATALOG.liquids.find(x => x.id === l.id);
                if (found) {
                    return { ...found, ...l };
                }
            }
            return l;
        });
        const hasLiquid = layers.length > 0;
        const totalRatio = Math.min(1.0, layers.reduce((acc, l) => acc + (l.ratio !== undefined ? l.ratio : 1.0), 0));
        const gradId = hasLiquid ? `liqGrad_${prefix}` : "";

        // 精确计算液面 Y 坐标 (无液体时在杯底，有液体时从杯底向上填充)
        let liquidY = containerBottom;
        let heightFill = 0;
        if (hasLiquid) {
            heightFill = containerHeight * totalRatio;
            liquidY = containerBottom - heightFill;
        }

        // 液体是否已满：当液体已满时取消奶盖的溢出裁剪，允许向上蓬松自然溢出；未满时使用杯内裁剪防穿壁
        const isFull = hasLiquid && (totalRatio >= 0.95 || liquidY <= containerTop + 8);
        const isPouring = !!options.isPouring;

        // 1. 液体 SVG (支持多层渐变分层、注水升起动画与动态液位高度，按各杯型容器底精准生长)
        let liquidSvg = "";
        if (hasLiquid) {
            const pourClass = isPouring ? "liquid-pouring-anim" : "";
            const topLayer = layers[layers.length - 1];
            const topWaveColor = topLayer.colorTop || topLayer.colorBottom || "#84d8ff";
            liquidSvg = `
                <g class="liquid-layer-group ${pourClass}">
                    <rect class="liquid-rect" x="0" y="${liquidY}" width="240" height="${heightFill + 15}" fill="url(#${gradId})" />
                    <path class="liquid-wave" d="M 0 ${liquidY + 2} Q 60 ${liquidY - 3}, 120 ${liquidY + 2} T 240 ${liquidY + 2} L 240 ${liquidY + 12} L 0 ${liquidY + 12} Z" fill="${topWaveColor}" opacity="0.6"/>
                    <path d="M 0 ${liquidY + 2} Q 60 ${liquidY - 3}, 120 ${liquidY + 2} T 240 ${liquidY + 2}" stroke="#222" stroke-width="2.5" fill="none" opacity="0.3"/>
                </g>
            `;
        }

        // 2. 杯内小料 SVG (冰块顶部齐平水面，仅小球类小料支持物理碰撞体积向上堆叠，独立景观小料与全杯小料独立分流)
        let itemsSvg = "";
        if (drinkData.inCupItems && drinkData.inCupItems.length > 0) {
            let innerItems = "";
            let bottomStackIndex = 0;

            // 仅小球类小料参与碰撞体积层叠 (黑糖珍珠、三色芋圆、蜜桃晶珠、多肉葡萄、柚子粒、彩雨、泥土落叶、星座小星、黄金金箔、气泡)
            const sphereItemIds = [
                "boba_pearls",
                "taro_balls",
                "peach_jelly",
                "grape_pulp",
                "grapefruit_pulp",
                "rain_drops",
                "soil_pebbles",
                "constellation_stars",
                "gold_flakes",
                "blue_bubbles"
            ];

            drinkData.inCupItems.forEach(itemId => {
                const renderer = SVG_ASSETS.inCupItems[itemId];
                if (!renderer) return;

                if (itemId === "heart_ice" || itemId === "classic_ice") {
                    // 浮力冰块类：由自身根据液面与杯底杯口自适应浮动
                    innerItems += renderer(hasLiquid, isPouring, liquidY, containerBottom, containerTop);
                } else if (itemId === "ghost_particles") {
                    // 幽灵微光：占满整杯空间，传递杯底与杯口
                    innerItems += renderer(containerBottom, containerTop);
                } else if (itemId === "jellyfish" || itemId === "lemon_slice" || itemId === "orange_slice") {
                    // 悬浮在杯身中部的小料，根据杯身高度自适应居中
                    const midYDelta = (containerBottom + containerTop) / 2 - 160;
                    innerItems += `<g transform="translate(0, ${midYDelta.toFixed(1)})">${renderer()}</g>`;
                } else if (sphereItemIds.includes(itemId)) {
                    // 小球类小料：具有碰撞体积，添加多种时自动逐层向上堆叠
                    const baseDelta = containerBottom - 205;
                    const stackHeight = 18;
                    const stackOffsetY = -bottomStackIndex * stackHeight;
                    const staggerX = (bottomStackIndex % 2 === 1) ? 5 : ((bottomStackIndex > 0) ? -5 : 0);
                    const totalDeltaY = baseDelta + stackOffsetY;

                    innerItems += `<g class="in-cup-stacked-item stack-level-${bottomStackIndex}" transform="translate(${staggerX}, ${totalDeltaY.toFixed(1)})">${renderer()}</g>`;
                    bottomStackIndex++;
                } else {
                    // 独立非小球类沉底小料 (大爱心果冻、月牙软糖、沉底金沙、王妃鬼藤、珊瑚海草)：基准底对齐杯底，不参与小球堆叠
                    const baseDelta = containerBottom - 205;
                    innerItems += `<g class="in-cup-independent-item" transform="translate(0, ${baseDelta.toFixed(1)})">${renderer()}</g>`;
                }
            });
            itemsSvg = innerItems;
        }

        // 3. 杯身外框、高光与手绘笑脸 (支持 7 款杯型，包含 10000💰 奇迹圣杯)
        let cupBodySvg = "";
        let clipPathD = "";

        switch (glassType) {
            case "holy_grail":
                clipPathD = `M 34 20 L 42 125 C 55 170, 185 170, 198 125 L 206 20 Z`;
                cupBodySvg = `
                    <!-- 奇迹圣杯流金高光与神圣天使光环 -->
                    <ellipse cx="120" cy="16" rx="88" ry="12" fill="none" stroke="#fde047" stroke-width="4" opacity="0.85" stroke-dasharray="6,4"/>
                    <!-- 圣杯左右华丽手绘双耳把手 -->
                    <path d="M 38 45 C 5 45, 5 115, 42 118" stroke="#ca8a04" stroke-width="6.5" stroke-linecap="round" fill="none"/>
                    <path d="M 38 45 C 5 45, 5 115, 42 118" stroke="#222" stroke-width="2.5" stroke-linecap="round" fill="none"/>
                    <path d="M 202 45 C 235 45, 235 115, 198 118" stroke="#ca8a04" stroke-width="6.5" stroke-linecap="round" fill="none"/>
                    <path d="M 202 45 C 235 45, 235 115, 198 118" stroke="#222" stroke-width="2.5" stroke-linecap="round" fill="none"/>
                    
                    <!-- 圣杯金光浮雕高光 -->
                    <rect x="36" y="22" width="168" height="135" rx="14" fill="url(#glassReflection_${prefix})" opacity="0.4" pointer-events="none"/>
                    
                    <!-- 圣杯自信治愈笑脸 (^ v ^) -->
                    <g class="cup-smile-face" pointer-events="none">
                        <path d="M 102 100 Q 107 92 112 100" stroke="#1e1e1e" stroke-width="3.5" stroke-linecap="round" fill="none"/>
                        <path d="M 128 100 Q 133 92 138 100" stroke="#1e1e1e" stroke-width="3.5" stroke-linecap="round" fill="none"/>
                        <path d="M 109 110 Q 120 122 131 110" stroke="#1e1e1e" stroke-width="3.8" stroke-linecap="round" fill="none"/>
                        <circle cx="98" cy="107" r="4" fill="#f43f5e" opacity="0.6"/>
                        <circle cx="142" cy="107" r="4" fill="#f43f5e" opacity="0.6"/>
                    </g>

                    <!-- 圣杯金色外框与底座 -->
                    <path d="M 32 18 L 42 126 C 55 172, 185 172, 198 126 L 208 18" stroke="#222" stroke-width="5.5" stroke-linecap="round" fill="none"/>
                    <!-- 华丽高脚柱与阶梯底座 -->
                    <rect x="110" y="162" width="20" height="42" rx="4" fill="#facc15" stroke="#222" stroke-width="4.5"/>
                    <path d="M 60 210 Q 120 203 180 210 L 190 215 Q 120 208 50 215 Z" fill="#eab308" stroke="#222" stroke-width="4.5"/>
                    <!-- 闪耀星芒 -->
                    <text x="32" y="15" font-size="16" fill="#facc15">✨</text>
                    <text x="195" y="15" font-size="16" fill="#facc15">✨</text>
                `;
                break;

            case "hourglass":
                // 沙漏杯中间收腰适当调宽至 56px (从 92 到 148)，弧线优美流畅
                clipPathD = `M 24 18 L 40 80 C 60 100, 75 108, 92 110 C 75 112, 60 120, 40 140 L 24 202 A 10 10 0 0 0 34 212 L 206 212 A 10 10 0 0 0 216 202 L 200 140 C 180 120, 165 112, 148 110 C 165 108, 180 100, 200 80 L 216 18 Z`;
                cupBodySvg = `
                    <g class="cup-smile-face" pointer-events="none">
                        <circle cx="106" cy="108" r="3" fill="#1e1e1e" />
                        <circle cx="134" cy="108" r="3" fill="#1e1e1e" />
                        <path d="M 108 116 Q 120 124 132 116" stroke="#1e1e1e" stroke-width="3.2" stroke-linecap="round" fill="none" />
                    </g>
                    <path d="${clipPathD}" stroke="#222222" stroke-width="5.5" stroke-linecap="round" fill="none" />
                `;
                break;

            case "martini":
                clipPathD = `M 22 20 L 110 142 A 12 12 0 0 0 130 142 L 218 20 Z`;
                cupBodySvg = `
                    <rect x="35" y="24" width="170" height="110" fill="url(#glassReflection_${prefix})" opacity="0.4" pointer-events="none"/>
                    <!-- 倒三角杯身与笑脸 -->
                    <g class="cup-smile-face" pointer-events="none">
                        <circle cx="108" cy="75" r="3" fill="#1e1e1e" />
                        <circle cx="132" cy="75" r="3" fill="#1e1e1e" />
                        <path d="M 110 83 Q 120 91 130 83" stroke="#1e1e1e" stroke-width="3" stroke-linecap="round" fill="none" />
                    </g>
                    <!-- 倒三角杯框 -->
                    <path d="M 20 18 L 110 144 A 12 12 0 0 0 130 144 L 220 18" stroke="#222" stroke-width="5.5" stroke-linecap="round" fill="none"/>
                    <!-- 纤细高脚与底座 -->
                    <line x1="120" y1="148" x2="120" y2="204" stroke="#222" stroke-width="5.5" stroke-linecap="round"/>
                    <path d="M 65 210 Q 120 205 175 210" stroke="#222" stroke-width="5.5" stroke-linecap="round" fill="none"/>
                `;
                break;

            case "sphere":
                // 🔮 魔法水晶球杯 (几何数学级正圆水晶球体 R=70 + 84px宽阔大杯口 + 奢华复古雕花底座)
                clipPathD = `M 78 56 A 70 70 0 1 0 162 56 A 42 8 0 0 0 78 56 Z`;
                cupBodySvg = `
                    <!-- 水晶球体通透正圆反光与高光弧面 -->
                    <circle cx="120" cy="112" r="68" fill="url(#glassReflection_${prefix})" opacity="0.32" pointer-events="none"/>
                    <path d="M 74 80 A 56 56 0 0 1 114 66" stroke="#ffffff" stroke-width="5" stroke-linecap="round" fill="none" opacity="0.6" pointer-events="none"/>
                    <circle cx="68" cy="92" r="3.5" fill="#ffffff" opacity="0.7" pointer-events="none"/>
                    
                    <!-- 水晶球治愈微笑脸 (*^▽^*) -->
                    <g class="cup-smile-face" pointer-events="none">
                        <circle cx="106" cy="116" r="3.2" fill="#1e1e1e" />
                        <circle cx="134" cy="116" r="3.2" fill="#1e1e1e" />
                        <path d="M 108 125 Q 120 134 132 125" stroke="#1e1e1e" stroke-width="3.5" stroke-linecap="round" fill="none" />
                        <circle cx="98" cy="120" r="3.8" fill="#f43f5e" opacity="0.5"/>
                        <circle cx="142" cy="120" r="3.8" fill="#f43f5e" opacity="0.5"/>
                    </g>
                    
                    <!-- 水晶球绝对正圆外轮廓 (R=70 正圆弧，从 78,56 顺畅包裹到底座再回到 162,56) -->
                    <path d="M 78 56 A 70 70 0 1 0 162 56" stroke="#222" stroke-width="5.5" stroke-linecap="round" fill="none"/>
                    <!-- 顶部宽阔圆润大杯唇开口 (84px通透大口，完美承托奶盖与吸管) -->
                    <ellipse cx="120" cy="56" rx="42" ry="8" fill="none" stroke="#222" stroke-width="4"/>

                    <!-- 精致雕花复古水晶球托座 (稳稳托起正圆水晶球) -->
                    <path d="M 80 174 Q 120 188 160 174 L 168 203 Q 120 213 72 203 Z" fill="#583b74" stroke="#222" stroke-width="4.5"/>
                    <ellipse cx="120" cy="204" rx="54" ry="7" fill="#754f9a" stroke="#222" stroke-width="3.8"/>
                    <path d="M 84 185 Q 120 197 156 185" stroke="#d8b4fe" stroke-width="2.5" fill="none"/>
                    <circle cx="120" cy="193" r="3.5" fill="#fde047" stroke="#222" stroke-width="1.8"/>
                `;
                break;

            case "milk_carton":
                clipPathD = `M 45 20 L 195 20 L 195 195 A 14 14 0 0 1 181 209 L 59 209 A 14 14 0 0 1 45 195 Z`;
                cupBodySvg = `
                    <rect x="48" y="24" width="144" height="180" rx="10" fill="url(#glassReflection_${prefix})" pointer-events="none"/>
                    <g class="cup-smile-face" pointer-events="none">
                        <circle cx="106" cy="120" r="3.2" fill="#1e1e1e" />
                        <circle cx="134" cy="120" r="3.2" fill="#1e1e1e" />
                        <path d="M 107 129 Q 120 138 133 129" stroke="#1e1e1e" stroke-width="3.5" stroke-linecap="round" fill="none" />
                    </g>
                    <!-- 牛奶盒方形外框 -->
                    <path d="M 45 18 L 45 196 A 14 14 0 0 0 59 210 L 181 210 A 14 14 0 0 0 195 196 L 195 18" stroke="#222" stroke-width="5.5" stroke-linecap="round" fill="none"/>
                    <!-- 侧边折角线条 -->
                    <line x1="45" y1="50" x2="195" y2="50" stroke="#222" stroke-width="2.5" stroke-dasharray="4,4" opacity="0.4"/>
                `;
                break;

            case "tulip":
                clipPathD = `M 35 18 C 50 65, 75 95, 60 145 C 50 185, 70 210, 120 210 C 170 210, 190 185, 180 145 C 165 95, 190 65, 205 18 Z`;
                cupBodySvg = `
                    <g class="cup-smile-face" pointer-events="none">
                        <circle cx="106" cy="115" r="3.2" fill="#1e1e1e" />
                        <circle cx="134" cy="115" r="3.2" fill="#1e1e1e" />
                        <path d="M 107 124 Q 120 133 133 124" stroke="#1e1e1e" stroke-width="3.5" stroke-linecap="round" fill="none" />
                    </g>
                    <path d="${clipPathD}" stroke="#222" stroke-width="5.5" stroke-linecap="round" fill="none"/>
                `;
                break;

            case "cup_medium":
                // 🥤 中杯 (精致 500ml 紧凑奶茶纸杯，比大杯更小巧更治愈)
                clipPathD = `M 54 38 L 68 192 A 12 12 0 0 0 80 204 L 160 204 A 12 12 0 0 0 172 192 L 186 38 Z`;
                cupBodySvg = `
                    <rect x="56" y="40" width="128" height="162" rx="10" fill="url(#glassReflection_${prefix})" opacity="0.35" pointer-events="none"/>
                    <!-- 中杯杯身手绘小治愈笑脸 -->
                    <g class="cup-smile-face" pointer-events="none">
                        <circle cx="108" cy="120" r="3" fill="#1e1e1e" />
                        <circle cx="132" cy="120" r="3" fill="#1e1e1e" />
                        <path d="M 109 128 Q 120 136 131 128" stroke="#1e1e1e" stroke-width="3.2" stroke-linecap="round" fill="none" />
                        <circle cx="100" cy="123" r="3" fill="#f43f5e" opacity="0.5"/>
                        <circle cx="140" cy="123" r="3" fill="#f43f5e" opacity="0.5"/>
                    </g>
                    <!-- 中杯杯身质感外框 -->
                    <path d="M 52 36 L 68 192 A 12 12 0 0 0 80 204 L 160 204 A 12 12 0 0 0 172 192 L 188 36" stroke="#222" stroke-width="5" stroke-linecap="round" fill="none"/>
                    <!-- 顶部杯沿翻边封口 -->
                    <rect x="46" y="30" width="148" height="8" rx="4" fill="#fdfbf7" stroke="#222" stroke-width="3.5"/>
                    <text x="120" y="152" font-size="8.5" font-weight="900" fill="#a8a29e" text-anchor="middle" letter-spacing="1" opacity="0.7">MEDIUM 500ML</text>
                `;
                break;

            case "cup_large":
                // 🧋 大杯 (畅饮 700ml 高挑大杯，茶饮店出单之王)
                clipPathD = `M 38 18 L 52 198 A 14 14 0 0 0 66 212 L 174 212 A 14 14 0 0 0 188 198 L 202 18 Z`;
                cupBodySvg = `
                    <rect x="40" y="20" width="160" height="190" rx="12" fill="url(#glassReflection_${prefix})" opacity="0.3" pointer-events="none"/>
                    <!-- 大杯高挑笑脸 -->
                    <g class="cup-smile-face" pointer-events="none">
                        <path d="M 102 108 Q 107 100 112 108" stroke="#1e1e1e" stroke-width="3.2" stroke-linecap="round" fill="none"/>
                        <path d="M 128 108 Q 133 100 138 108" stroke="#1e1e1e" stroke-width="3.2" stroke-linecap="round" fill="none"/>
                        <path d="M 108 120 Q 120 131 132 120" stroke="#1e1e1e" stroke-width="3.8" stroke-linecap="round" fill="none" />
                        <circle cx="97" cy="116" r="4" fill="#fb7185" opacity="0.5"/>
                        <circle cx="143" cy="116" r="4" fill="#fb7185" opacity="0.5"/>
                    </g>
                    <!-- 高挑大杯轮廓 -->
                    <path d="M 36 16 L 52 198 A 14 14 0 0 0 66 212 L 174 212 A 14 14 0 0 0 188 198 L 204 16" stroke="#222" stroke-width="5.5" stroke-linecap="round" fill="none"/>
                    <!-- 顶部封口盖 -->
                    <rect x="30" y="10" width="180" height="8" rx="4" fill="#ffffff" stroke="#222" stroke-width="3.5"/>
                    <text x="120" y="156" font-size="9" font-weight="900" fill="#a8a29e" text-anchor="middle" letter-spacing="1" opacity="0.7">LARGE 700ML</text>
                `;
                break;

            case "cup_bucket":
                // 🪣 吨吨桶 (超大 1000ml 宽口手提吨吨水果桶，畅快过瘾)
                clipPathD = `M 20 32 L 32 196 A 16 16 0 0 0 48 212 L 192 212 A 16 16 0 0 0 208 196 L 220 32 Z`;
                cupBodySvg = `
                    <!-- 宽阔大桶反光面 -->
                    <rect x="24" y="34" width="192" height="176" rx="14" fill="url(#glassReflection_${prefix})" opacity="0.35" pointer-events="none"/>
                    
                    <!-- 吨吨桶活动提手 (半圆弧形手提把手) -->
                    <path d="M 28 32 C 28 -8, 212 -8, 212 32" stroke="#f59e0b" stroke-width="8" stroke-linecap="round" fill="none"/>
                    <path d="M 28 32 C 28 -8, 212 -8, 212 32" stroke="#222" stroke-width="3" stroke-linecap="round" fill="none"/>
                    <!-- 提手连接铆钉 -->
                    <circle cx="28" cy="32" r="5" fill="#ca8a04" stroke="#222" stroke-width="2.5"/>
                    <circle cx="212" cy="32" r="5" fill="#ca8a04" stroke="#222" stroke-width="2.5"/>

                    <!-- 吨吨桶刻度尺 (300ml - 600ml - 1000ml 暴饮标志) -->
                    <g opacity="0.45" pointer-events="none">
                        <line x1="38" y1="150" x2="52" y2="150" stroke="#444" stroke-width="2.5"/>
                        <text x="56" y="153" font-size="8" font-weight="800" fill="#444">300ml</text>
                        <line x1="36" y1="110" x2="54" y2="110" stroke="#444" stroke-width="2.5"/>
                        <text x="58" y="113" font-size="8" font-weight="800" fill="#444">600ml</text>
                        <line x1="34" y1="70" x2="56" y2="70" stroke="#444" stroke-width="2.5"/>
                        <text x="60" y="73" font-size="8" font-weight="900" fill="#ea580c">1000ml 吨吨桶</text>
                    </g>

                    <!-- 憨厚开心笑脸 (≧▽≦) -->
                    <g class="cup-smile-face" pointer-events="none">
                        <path d="M 100 115 Q 106 106 112 115" stroke="#1e1e1e" stroke-width="3.5" stroke-linecap="round" fill="none"/>
                        <path d="M 128 115 Q 134 106 140 115" stroke="#1e1e1e" stroke-width="3.5" stroke-linecap="round" fill="none"/>
                        <path d="M 106 124 Q 120 140 134 124" stroke="#1e1e1e" stroke-width="4" stroke-linecap="round" fill="#f43f5e"/>
                        <circle cx="94" cy="122" r="4.5" fill="#fb7185" opacity="0.6"/>
                        <circle cx="146" cy="122" r="4.5" fill="#fb7185" opacity="0.6"/>
                    </g>

                    <!-- 宽阔桶身外框 -->
                    <path d="M 18 30 L 32 196 A 16 16 0 0 0 48 212 L 192 212 A 16 16 0 0 0 208 196 L 222 30" stroke="#222" stroke-width="5.5" stroke-linecap="round" fill="none"/>
                    <!-- 宽口桶盖边缘 -->
                    <rect x="14" y="24" width="212" height="10" rx="4" fill="#fef08a" stroke="#222" stroke-width="3.5"/>
                `;
                break;

            case "burgundy":
                // 🍷 勃艮第杯 (大肚子广口收腰红酒高脚杯，聚拢浓郁酒香)
                clipPathD = `M 65 24 C 65 24, 25 65, 25 100 C 25 128, 80 140, 120 140 C 160 140, 215 128, 215 100 C 215 65, 175 24, 175 24 Z`;
                cupBodySvg = `
                    <rect x="30" y="26" width="180" height="110" fill="url(#glassReflection_${prefix})" opacity="0.32" pointer-events="none"/>
                    <g class="cup-smile-face" pointer-events="none">
                        <circle cx="107" cy="85" r="3.2" fill="#1e1e1e" />
                        <circle cx="133" cy="85" r="3.2" fill="#1e1e1e" />
                        <path d="M 109 93 Q 120 101 131 93" stroke="#1e1e1e" stroke-width="3.2" stroke-linecap="round" fill="none" />
                    </g>
                    <!-- 大肚杯身轮廓 -->
                    <path d="M 64 22 C 64 22, 23 65, 23 100 C 23 130, 78 142, 120 142 C 162 142, 217 130, 217 100 C 217 65, 176 22, 176 22" stroke="#222" stroke-width="5.5" stroke-linecap="round" fill="none"/>
                    <!-- 优雅长细高脚与圆形底座 -->
                    <line x1="120" y1="142" x2="120" y2="204" stroke="#222" stroke-width="5.5" stroke-linecap="round"/>
                    <path d="M 65 210 Q 120 205 175 210" stroke="#222" stroke-width="5.5" stroke-linecap="round" fill="none"/>
                `;
                break;

            case "champagne":
                // 🥂 香槟杯 (高挑优雅细长笛型高脚杯，气泡升腾如星)
                clipPathD = `M 90 22 L 92 135 C 92 146, 148 146, 148 135 L 150 22 Z`;
                cupBodySvg = `
                    <rect x="92" y="24" width="56" height="118" fill="url(#glassReflection_${prefix})" opacity="0.3" pointer-events="none"/>
                    <g class="cup-smile-face" pointer-events="none">
                        <circle cx="112" cy="82" r="2.8" fill="#1e1e1e" />
                        <circle cx="128" cy="82" r="2.8" fill="#1e1e1e" />
                        <path d="M 114 89 Q 120 95 126 89" stroke="#1e1e1e" stroke-width="2.8" stroke-linecap="round" fill="none" />
                    </g>
                    <!-- 修长笛型杯身 -->
                    <path d="M 88 20 L 90 135 C 90 148, 150 148, 150 135 L 152 20" stroke="#222" stroke-width="5.5" stroke-linecap="round" fill="none"/>
                    <!-- 高脚与底座 -->
                    <line x1="120" y1="148" x2="120" y2="204" stroke="#222" stroke-width="5.5" stroke-linecap="round"/>
                    <path d="M 75 210 Q 120 205 165 210" stroke="#222" stroke-width="5.5" stroke-linecap="round" fill="none"/>
                `;
                break;

            case "flower_tea":
                // 🍵 欧式典雅花茶杯 (通透纯净半球圆润茶杯 + 杯身杯脚一体成型 + 欧式托碟与高挑耳柄)
                clipPathD = `M 32 36 C 26 72, 42 136, 84 156 Q 120 162 156 156 C 198 136, 214 72, 208 36 Z`;
                cupBodySvg = `
                    <!-- 通透玻璃质感反光面 (圆润饱满半球碗形，无多余花纹，纯净通透) -->
                    <path d="${clipPathD}" fill="url(#glassReflection_${prefix})" opacity="0.32" pointer-events="none"/>
                    <path d="M 46 52 C 40 85, 54 135, 82 150" stroke="#ffffff" stroke-width="4.5" stroke-linecap="round" fill="none" opacity="0.55" pointer-events="none"/>
                    
                    <!-- 欧式高挑通透耳状玻璃把手 -->
                    <path d="M 206 48 C 242 45, 246 95, 216 118 C 196 130, 172 136, 158 136" stroke="#222" stroke-width="6" stroke-linecap="round" fill="none"/>
                    <path d="M 206 48 C 242 45, 246 95, 216 118 C 196 130, 172 136, 158 136" stroke="url(#glassReflection_${prefix})" stroke-width="3" stroke-linecap="round" fill="none" opacity="0.75"/>

                    <!-- 治愈微笑脸 -->
                    <g class="cup-smile-face" pointer-events="none">
                        <circle cx="106" cy="102" r="3.2" fill="#1e1e1e" />
                        <circle cx="134" cy="102" r="3.2" fill="#1e1e1e" />
                        <path d="M 108 111 Q 120 120 132 111" stroke="#1e1e1e" stroke-width="3.5" stroke-linecap="round" fill="none" />
                        <circle cx="98" cy="106" r="3.5" fill="#f43f5e" opacity="0.5"/>
                        <circle cx="142" cy="106" r="3.5" fill="#f43f5e" opacity="0.5"/>
                    </g>

                    <!-- 杯身与杯底的脚 (一体成型，杯底圆足自然承托，绝不分离悬浮) -->
                    <path d="M 32 36 C 26 72, 42 136, 84 156 C 84 162, 85 166, 82 172 Q 120 176 158 172 C 155 166, 156 162, 156 156 C 198 136, 214 72, 208 36" stroke="#222" stroke-width="5.5" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
                    
                    <!-- 杯口圆润杯沿 (平滑轻盈，与顶饰无缝贴合) -->
                    <ellipse cx="120" cy="36" rx="88" ry="6" fill="none" stroke="#222" stroke-width="4.5"/>

                    <!-- 欧式通透茶托碟 (Saucer，托盘中央凹槽稳稳贴合杯脚底部) -->
                    <g class="cup-saucer-group">
                        <path d="M 18 172 Q 120 165 222 172 L 214 186 Q 120 196 26 186 Z" fill="url(#glassReflection_${prefix})" opacity="0.3" stroke="#222" stroke-width="4.5"/>
                        <path d="M 44 176 Q 120 170 196 176" stroke="#222" stroke-width="2" stroke-linecap="round" fill="none" opacity="0.4"/>
                        <!-- 托盘底圈稳稳坐落在吧台桌面 -->
                        <path d="M 68 186 L 70 192 Q 120 196 170 192 L 172 186" stroke="#222" stroke-width="3.5" fill="none"/>
                    </g>
                `;
                break;

            case "fishbowl":
                // 🐠 圆滚鱼缸杯 (巨蟹座专属：圆滚滚扁圆晶莹剔透鱼缸，宽敞弧口与平稳圈足)
                clipPathD = `M 48 48 C 22 75, 14 140, 56 174 Q 120 188 184 174 C 226 140, 218 75, 192 48 Z`;
                cupBodySvg = `
                    <!-- 鱼缸晶莹反光面与玻璃厚度 -->
                    <path d="${clipPathD}" fill="url(#glassReflection_${prefix})" opacity="0.32" pointer-events="none"/>
                    <path d="M 40 68 C 24 95, 24 145, 54 168" stroke="#ffffff" stroke-width="5" stroke-linecap="round" fill="none" opacity="0.65" pointer-events="none"/>
                    <circle cx="36" cy="116" r="3.5" fill="#ffffff" opacity="0.75" pointer-events="none"/>

                    <!-- 鱼缸治愈萌萌笑脸 (*^▽^*) -->
                    <g class="cup-smile-face" pointer-events="none">
                        <circle cx="106" cy="112" r="3.5" fill="#1e1e1e" />
                        <circle cx="134" cy="112" r="3.5" fill="#1e1e1e" />
                        <path d="M 108 121 Q 120 131 132 121" stroke="#1e1e1e" stroke-width="3.5" stroke-linecap="round" fill="none" />
                        <circle cx="97" cy="116" r="4" fill="#fb7185" opacity="0.5"/>
                        <circle cx="143" cy="116" r="4" fill="#fb7185" opacity="0.5"/>
                    </g>

                    <!-- 鱼缸圆滚滚外轮廓 -->
                    <path d="M 48 48 C 22 75, 14 140, 56 174 Q 120 188 184 174 C 226 140, 218 75, 192 48" stroke="#222" stroke-width="5.5" stroke-linecap="round" fill="none"/>
                    <!-- 顶部外翻圆润大杯唇 -->
                    <ellipse cx="120" cy="48" rx="72" ry="7" fill="none" stroke="#222" stroke-width="4.5"/>
                    <!-- 鱼缸平稳圆润圈足底座 -->
                    <path d="M 72 178 Q 120 188 168 178 L 172 192 Q 120 200 68 192 Z" fill="#e0f2fe" opacity="0.7" stroke="#222" stroke-width="4"/>
                `;
                break;

            case "ice_goblet":
                // ❄️ 北山冰雕高脚杯 (摩羯座专属：冰晶雕琢杯口波纹与多棱角冰柱高脚底座)
                clipPathD = `M 32 26 L 40 100 C 44 138, 80 152, 120 152 C 160 152, 196 138, 200 100 L 208 26 Z`;
                cupBodySvg = `
                    <path d="${clipPathD}" fill="url(#glassReflection_${prefix})" opacity="0.35" pointer-events="none"/>
                    <!-- 冰雕杯壁通透反光 -->
                    <path d="M 42 36 L 48 95 C 52 125, 75 142, 100 146" stroke="#ffffff" stroke-width="4" stroke-linecap="round" fill="none" opacity="0.7" pointer-events="none"/>
                    <path d="M 198 36 L 192 95 C 188 125, 165 142, 140 146" stroke="#ffffff" stroke-width="3" stroke-linecap="round" fill="none" opacity="0.4" pointer-events="none"/>

                    <!-- 冰晶杯身治愈微笑脸 -->
                    <g class="cup-smile-face" pointer-events="none">
                        <circle cx="107" cy="98" r="3.2" fill="#1e1e1e" />
                        <circle cx="133" cy="98" r="3.2" fill="#1e1e1e" />
                        <path d="M 109 107 Q 120 116 131 107" stroke="#1e1e1e" stroke-width="3.2" stroke-linecap="round" fill="none" />
                        <circle cx="98" cy="102" r="3.5" fill="#38bdf8" opacity="0.5"/>
                        <circle cx="142" cy="102" r="3.5" fill="#38bdf8" opacity="0.5"/>
                    </g>

                    <!-- 杯身外框 -->
                    <path d="M 30 24 L 40 100 C 44 140, 80 154, 120 154 C 160 154, 196 140, 200 100 L 210 24" stroke="#222" stroke-width="5.5" stroke-linecap="round" fill="none"/>
                    <!-- 杯口波浪冰棱边缘 -->
                    <path d="M 30 24 Q 52 30 75 24 T 120 24 T 165 24 T 210 24" stroke="#222" stroke-width="4.5" fill="none" stroke-linecap="round"/>

                    <!-- 冰雕多棱高脚柱 (带晶石刻痕) -->
                    <polygon points="112,154 128,154 125,188 115,188" fill="#bae6fd" stroke="#222" stroke-width="4"/>
                    <line x1="120" y1="156" x2="120" y2="186" stroke="#ffffff" stroke-width="2"/>
                    <!-- 冰雕阶梯晶座 -->
                    <polygon points="90,188 150,188 165,208 75,208" fill="#e0f2fe" stroke="#222" stroke-width="4.5"/>
                    <path d="M 85 208 Q 120 204 155 208" stroke="#38bdf8" stroke-width="2.5" fill="none"/>
                `;
                break;

            case "wave_goblet":
                // 🌊 双曲海浪杯 (水瓶座专属：中段收腰优美起伏双曲水波杯身配海浪高脚)
                clipPathD = `M 36 30 C 48 70, 68 88, 56 120 C 44 148, 75 160, 120 160 C 165 160, 196 148, 184 120 C 172 88, 192 70, 204 30 Z`;
                cupBodySvg = `
                    <path d="${clipPathD}" fill="url(#glassReflection_${prefix})" opacity="0.32" pointer-events="none"/>
                    <!-- 双曲高光弧线 -->
                    <path d="M 46 45 C 55 75, 70 85, 62 115 C 55 135, 75 150, 100 154" stroke="#ffffff" stroke-width="4.5" stroke-linecap="round" fill="none" opacity="0.65" pointer-events="none"/>
                    
                    <!-- 水波杯身治愈微笑脸 -->
                    <g class="cup-smile-face" pointer-events="none">
                        <circle cx="107" cy="108" r="3.2" fill="#1e1e1e" />
                        <circle cx="133" cy="108" r="3.2" fill="#1e1e1e" />
                        <path d="M 109 116 Q 120 124 131 116" stroke="#1e1e1e" stroke-width="3.2" stroke-linecap="round" fill="none" />
                        <circle cx="98" cy="111" r="3.5" fill="#34d399" opacity="0.5"/>
                        <circle cx="142" cy="111" r="3.5" fill="#34d399" opacity="0.5"/>
                    </g>

                    <!-- 双曲外框轮廓线条 -->
                    <path d="M 34 28 C 48 70, 68 88, 56 120 C 44 148, 75 162, 120 162 C 165 162, 196 148, 184 120 C 172 88, 192 70, 206 28" stroke="#222" stroke-width="5.5" stroke-linecap="round" fill="none"/>
                    <!-- 杯口波浪边缘 -->
                    <ellipse cx="120" cy="28" rx="86" ry="6" fill="none" stroke="#222" stroke-width="4"/>
                    
                    <!-- 海浪卷纹高脚与水滴座 -->
                    <path d="M 116 162 C 114 175, 126 178, 124 192" stroke="#222" stroke-width="6" stroke-linecap="round" fill="none"/>
                    <path d="M 116 162 C 114 175, 126 178, 124 192" stroke="#67e8f9" stroke-width="3" stroke-linecap="round" fill="none"/>
                    <path d="M 70 200 Q 120 188 170 200 L 165 210 Q 120 202 75 210 Z" fill="#bae6fd" stroke="#222" stroke-width="4"/>
                `;
                break;

            case "lantern_coupe":
                // 🏮 星灯浅碟杯 (双鱼座专属：极其优雅宽口的玛格丽特/香槟浅碟杯，配细金高脚)
                clipPathD = `M 24 42 C 22 88, 55 146, 120 146 C 185 146, 218 88, 216 42 Z`;
                cupBodySvg = `
                    <path d="${clipPathD}" fill="url(#glassReflection_${prefix})" opacity="0.32" pointer-events="none"/>
                    <!-- 浅碟弧面高光弧 -->
                    <path d="M 36 55 C 32 90, 60 135, 105 142" stroke="#ffffff" stroke-width="4.5" stroke-linecap="round" fill="none" opacity="0.65" pointer-events="none"/>
                    
                    <!-- 浅碟杯治愈微笑脸 -->
                    <g class="cup-smile-face" pointer-events="none">
                        <circle cx="106" cy="100" r="3.2" fill="#1e1e1e" />
                        <circle cx="134" cy="100" r="3.2" fill="#1e1e1e" />
                        <path d="M 108 109 Q 120 118 132 109" stroke="#1e1e1e" stroke-width="3.5" stroke-linecap="round" fill="none" />
                        <circle cx="97" cy="104" r="3.8" fill="#c084fc" opacity="0.5"/>
                        <circle cx="143" cy="104" r="3.8" fill="#c084fc" opacity="0.5"/>
                    </g>

                    <!-- 浅碟外框轮廓线条 -->
                    <path d="M 22 40 C 20 88, 54 148, 120 148 C 186 148, 220 88, 218 40" stroke="#222" stroke-width="5.5" stroke-linecap="round" fill="none"/>
                    <!-- 宽敞浅碟大杯口 -->
                    <ellipse cx="120" cy="40" rx="98" ry="6.5" fill="none" stroke="#222" stroke-width="4.5"/>
                    
                    <!-- 纤细高挑金色高脚与金圆座 -->
                    <line x1="120" y1="148" x2="120" y2="204" stroke="#222" stroke-width="5.5" stroke-linecap="round"/>
                    <line x1="120" y1="148" x2="120" y2="204" stroke="#facc15" stroke-width="3" stroke-linecap="round"/>
                    <path d="M 70 210 Q 120 205 170 210 L 174 214 Q 120 208 66 214 Z" fill="#facc15" stroke="#222" stroke-width="4"/>
                `;
                break;

            case "classic":
            default:
                clipPathD = `M 22 18 L 22 195 A 15 15 0 0 0 37 210 L 203 210 A 15 15 0 0 0 218 195 L 218 18 Z`;
                cupBodySvg = `
                    <rect x="24" y="20" width="192" height="186" rx="12" fill="url(#glassReflection_${prefix})" pointer-events="none"/>
                    <path d="M 22 192 Q 120 196 218 192" stroke="#222" stroke-width="3" fill="none" opacity="0.4" pointer-events="none"/>
                    <g class="cup-smile-face" pointer-events="none">
                        <circle cx="106" cy="118" r="3.2" fill="#1e1e1e" />
                        <circle cx="134" cy="118" r="3.2" fill="#1e1e1e" />
                        <path d="M 107 127 Q 120 137 133 127" stroke="#1e1e1e" stroke-width="3.5" stroke-linecap="round" fill="none" />
                    </g>
                    <path d="M 20 16 L 20 196 A 16 16 0 0 0 36 212 L 204 212 A 16 16 0 0 0 220 196 L 220 16" stroke="#222222" stroke-width="5.5" stroke-linecap="round" fill="none" />
                `;
                break;
        }

        // 4. 顶层奶盖/积雪/白云/沙顶 (Foam) - 自适应缩放：未满时宽度最小为杯壁(严密贴壁防穿)，满杯溢出时最大为杯口*2
        let foamSvg = "";
        if (drinkData.foamLayer && drinkData.foamLayer !== "none") {
            const renderer = SVG_ASSETS.foams[drinkData.foamLayer];
            if (renderer) {
                const targetFoamBottom = hasLiquid ? liquidY : containerBottom;
                // 统一奶盖基准底为 y = 38 (落雨白云从云朵底开始算，雨丝自然垂入杯内液体)
                const foamDeltaY = targetFoamBottom - 38;

                // 各杯型开口与内腔安全宽度
                const rimWidth = physics.rimWidth || physics.width || 190;
                let foamScaleX = 1.0;

                if (isFull) {
                    // 满杯溢出时：宽口杯和杯口一样宽，窄口杯溢出一点点
                    const isWideRim = rimWidth >= 150;
                    const overflowWidth = isWideRim ? rimWidth : Math.min(rimWidth * 1.18, rimWidth + 18);
                    foamScaleX = overflowWidth / 192;
                } else {
                    // 未满时：宽度最小为杯壁 (覆盖当前杯壁宽度，配合clipPath严密贴壁不穿透)
                    const progress = containerHeight > 0 ? Math.max(0, Math.min(1, (containerBottom - liquidY) / containerHeight)) : 0;
                    const bWidth = physics.bottomWidth || (physics.width * 0.7);
                    const estimatedInnerWidth = bWidth + progress * (rimWidth - bWidth);
                    const minWallWidth = Math.min(rimWidth, Math.max(estimatedInnerWidth, rimWidth * 0.85));
                    foamScaleX = minWallWidth / 192;
                }

                // 围绕中心轴 x=120 进行水平自适应缩放，垂直平移贴合液面
                const transX = 120 * (1 - foamScaleX);
                foamSvg = `<g class="cup-foam-box" transform="translate(${transX.toFixed(2)}, ${foamDeltaY.toFixed(2)}) scale(${foamScaleX.toFixed(3)}, 1)">${renderer()}</g>`;
            }
        }

        // 5. 核心立体装饰 (Toppers) - 将长杆/吸管类与前排装饰严格分层
        const topperList = Array.isArray(drinkData.toppers) && drinkData.toppers.length > 0
            ? drinkData.toppers
            : (drinkData.topper && drinkData.topper !== "none" ? [drinkData.topper] : []);

        // 后排长杆类装饰 (深入杯内，层级位于杯身和奶盖后方：玻璃吸管、爱心吸管、粉玫瑰、彩虹波板糖)
        const backTopperIds = ["glass_straw", "heart_straw", "pink_rose", "rainbow_lollipop"];
        const backTopperList = topperList.filter(t => backTopperIds.includes(t));
        const frontTopperList = topperList.filter(t => !backTopperIds.includes(t));

        // 5.1 后排长杆与吸管类图层 (深入杯内，位于杯身和奶盖后面)
        let backTopperSvg = "";
        if (backTopperList.length > 0) {
            const topperDeltaY = (containerTop - 26) - 6;
            const renderedBack = backTopperList.map(tId => {
                const renderer = SVG_ASSETS.toppers[tId];
                if (!renderer) return "";
                if (tId === "glass_straw" || tId === "heart_straw") {
                    return renderer(containerBottom, containerTop);
                } else {
                    return `<g transform="translate(0, ${topperDeltaY.toFixed(1)})">${renderer(containerBottom, containerTop)}</g>`;
                }
            }).join("");
            backTopperSvg = `<g class="cup-back-toppers-box">${renderedBack}</g>`;
        }

        // 5.2 前排装饰类图层 (严格定位在杯口以上，位于最顶层，自适应各杯型杯口)
        let frontTopperSvg = "";
        if (frontTopperList.length > 0) {
            // 装饰基准杯口为 26。根据当前杯型真实杯口 containerTop 动态调整，并上提 6px 确保完全在杯口以上
            const topperDeltaY = (containerTop - 26) - 6;

            const offsets = [
                { x: 0, r: 0 },
                { x: -24, r: -8 },
                { x: 24, r: 8 },
                { x: -40, r: -14 },
                { x: 40, r: 14 }
            ];
            const renderedToppers = frontTopperList.map((tId, idx) => {
                const renderer = SVG_ASSETS.toppers[tId];
                if (!renderer) return "";
                const content = renderer(containerBottom, containerTop);
                const off = offsets[idx % offsets.length];
                if (frontTopperList.length === 1) {
                    return `<g transform="translate(0, ${topperDeltaY.toFixed(1)})">${content}</g>`;
                }
                return `<g transform="translate(${off.x}, ${topperDeltaY.toFixed(1)}) rotate(${off.r} 120 ${containerTop})">${content}</g>`;
            }).join("");
            frontTopperSvg = `<g class="cup-front-toppers-box">${renderedToppers}</g>`;
        }

        return `
            <svg class="cup-svg-unified" viewBox="0 -70 240 290" width="${width}" height="${height}" style="overflow: visible;" xmlns="http://www.w3.org/2000/svg">
                <defs>
                    <linearGradient id="glassReflection_${prefix}" x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%" stop-color="#ffffff" stop-opacity="0.35"/>
                        <stop offset="12%" stop-color="#ffffff" stop-opacity="0.1"/>
                        <stop offset="85%" stop-color="#ffffff" stop-opacity="0"/>
                        <stop offset="100%" stop-color="#ffffff" stop-opacity="0.2"/>
                    </linearGradient>
                    ${hasLiquid ? (layers.length === 1 ? `
                        <linearGradient id="${gradId}" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stop-color="${layers[0].colorTop || '#84d8ff'}"/>
                            <stop offset="100%" stop-color="${layers[0].colorBottom || '#288fce'}"/>
                        </linearGradient>
                    ` : `
                        <linearGradient id="${gradId}" x1="0" y1="1" x2="0" y2="0">
                            ${(() => {
                                let stopsHtml = "";
                                const n = layers.length;
                                // 提取各层的纯正核心色调
                                const layerColors = layers.map(l => l.colorBottom || l.colorTop || '#84d8ff');

                                // 计算在已注入液体范围内的各层理论交界点百分比
                                const boundaryPcts = [];
                                let acc = 0;
                                for (let i = 0; i < n; i++) {
                                    const ratio = layers[i].ratio !== undefined ? layers[i].ratio : (1 / n);
                                    acc += ratio;
                                    boundaryPcts.push(Math.min(100, (acc / totalRatio) * 100));
                                }

                                // 根据层数智能设置相邻交界渐变带的半宽度 (例如双层各 10%，三层各 7%，四层各 5%)
                                const delta = n === 2 ? 10 : (n === 3 ? 7 : 5);

                                // 杯底起点：纯正最底层颜色
                                stopsHtml += `<stop offset="0%" stop-color="${layerColors[0]}"/>`;

                                for (let i = 0; i < n - 1; i++) {
                                    const boundary = boundaryPcts[i];
                                    const lowerStop = Math.max(0, boundary - delta);
                                    const upperStop = Math.min(100, boundary + delta);
                                    const colorCurrent = layerColors[i];
                                    const colorNext = layerColors[i + 1];

                                    // 保持当前层纯色直到过渡带下沿
                                    stopsHtml += `<stop offset="${lowerStop.toFixed(1)}%" stop-color="${colorCurrent}"/>`;
                                    // 🌟 核心交界渐变段：根据底部相邻颜色平滑晕染过渡至相邻上层颜色！
                                    stopsHtml += `<stop offset="${upperStop.toFixed(1)}%" stop-color="${colorNext}"/>`;
                                }

                                // 杯顶终点：纯正最顶层颜色直到最高液面
                                stopsHtml += `<stop offset="100%" stop-color="${layerColors[n - 1]}"/>`;

                                return stopsHtml;
                            })()}
                        </linearGradient>
                    `) : ''}
                    <clipPath id="${clipId}">
                        <path d="${clipPathD}" />
                    </clipPath>
                </defs>

                <!-- 0. 最底层：深入杯身背后的插杆类装饰与吸管 (位于杯身和奶盖后方) -->
                ${backTopperSvg}

                <!-- 1. 剪裁区：液体、杯内小料与未满时的奶盖 (液体未满时严格使用杯身剪裁，绝不穿透杯壁) -->
                <g clip-path="url(#${clipId})" class="cup-clipped-content">
                    <g class="cup-liquid-box">${liquidSvg}</g>
                    <g class="cup-items-box">${itemsSvg}</g>
                    ${!isFull ? foamSvg : ''}
                </g>

                <!-- 2. 杯身外框、厚度与笑脸 (中层，压在液体与吸管上方) -->
                <g class="cup-body-box">${cupBodySvg}</g>

                <!-- 3. 满杯奶盖 (液体已满，取消溢出剪裁，允许向上蓬松自然溢出) -->
                ${isFull ? foamSvg : ''}

                <!-- 4. 前排核心立体装饰 (最顶层，位于吸管、奶盖和杯子前方) -->
                ${frontTopperSvg}
            </svg>
        `;
    },

    // 3. 杯内小料与沉浸物 (In-Cup Ingredients)
    inCupItems: {
        // 🧊 普通方形冰块 (支持物理悬浮：无液体底部在杯底，有液体顶部与液面齐平)
        classic_ice: (hasLiquid = true, isPouring = false, liquidY = 205, containerBottom = 205, containerTop = 25) => {
            let yOffset = 0;
            if (!hasLiquid) {
                // 无液体时底部坐落在杯底 (三个冰块未平移最低处在 134)
                yOffset = (containerBottom - 2) - 134;
            } else {
                // 有液体时顶部与液面齐平 (三个冰块未平移最高处在 89)
                let targetTop = liquidY;
                // 限制不能穿透杯底
                targetTop = Math.min(targetTop, containerBottom - 45);
                // 限制最高处在杯口安全范围内
                targetTop = Math.max(targetTop, containerTop + 2);
                yOffset = targetTop - 89;
            }
            const animClass = isPouring ? "ice-floating-rise-anim" : (hasLiquid ? "ice-floating-gentle" : "ice-at-bottom");
            return `
                <g class="in-cup-item classic-ice-item" transform="translate(0, ${yOffset})">
                    <g class="${animClass}">
                        <!-- 冰块 1: 左侧微倾方块 -->
                        <g transform="translate(70, 118) rotate(-15)">
                            <rect x="-14" y="-14" width="28" height="28" rx="5" fill="#cbeeff" opacity="0.88" stroke="#222" stroke-width="2.8"/>
                            <path d="M -10 -10 L 10 -10 L 6 -4 L -10 -4 Z" fill="#ffffff" opacity="0.8"/>
                            <circle cx="2" cy="2" r="2.2" fill="#ffffff" opacity="0.85"/>
                        </g>
                        <!-- 冰块 2: 中间主方块 -->
                        <g transform="translate(125, 105) rotate(12)">
                            <rect x="-16" y="-16" width="32" height="32" rx="6" fill="#bde7ff" opacity="0.88" stroke="#222" stroke-width="3"/>
                            <path d="M -12 -12 L 12 -12 L 8 -5 L -12 -5 Z" fill="#ffffff" opacity="0.85"/>
                            <line x1="-8" y1="6" x2="6" y2="6" stroke="#ffffff" stroke-width="2" stroke-linecap="round" opacity="0.75"/>
                        </g>
                        <!-- 冰块 3: 右后侧小方块 -->
                        <g transform="translate(168, 122) rotate(-8)">
                            <rect x="-12" y="-12" width="24" height="24" rx="4" fill="#d9f3ff" opacity="0.88" stroke="#222" stroke-width="2.5"/>
                            <path d="M -8 -8 L 8 -8 L 5 -3 L -8 -3 Z" fill="#ffffff" opacity="0.8"/>
                        </g>
                    </g>
                </g>
            `;
        },
        // 💙 心形冰块 (支持物理悬浮：无液体底部在杯底，有液体顶部与液面齐平)
        heart_ice: (hasLiquid = true, isPouring = false, liquidY = 205, containerBottom = 205, containerTop = 25) => {
            let yOffset = 0;
            if (!hasLiquid) {
                // 无液体时底部坐落在杯底 (心形冰块未平移最低处在 152)
                yOffset = (containerBottom - 2) - 152;
            } else {
                // 有液体时顶部与液面齐平 (心形冰块未平移最高处在 92)
                let targetTop = liquidY;
                targetTop = Math.min(targetTop, containerBottom - 60);
                targetTop = Math.max(targetTop, containerTop + 2);
                yOffset = targetTop - 92;
            }
            const animClass = isPouring ? "ice-floating-rise-anim" : (hasLiquid ? "ice-floating-gentle" : "ice-at-bottom");
            return `
                <g class="in-cup-item heart-ice-item" transform="translate(0, ${yOffset})">
                    <g class="${animClass}">
                        <!-- 主心形冰块 (居中偏右，晶莹透亮带高光与边框) -->
                        <g transform="translate(130, 118) rotate(-10)">
                            <path d="M 0 -10 C -18 -26, -38 2, 0 34 C 38 2, 18 -26, 0 -10 Z" 
                                  fill="#b4ebff" opacity="0.92" stroke="#222" stroke-width="3" stroke-linejoin="round"/>
                            <path d="M -4 -6 C -14 -18, -26 2, 0 24 C 26 2, 14 -18, 4 -6 Z" 
                                  fill="#ffffff" opacity="0.75"/>
                            <line x1="-12" y1="-3" x2="-6" y2="10" stroke="#ffffff" stroke-width="2.8" stroke-linecap="round"/>
                            <circle cx="8" cy="4" r="2.5" fill="#ffffff" opacity="0.85"/>
                        </g>
                        <!-- 伴生小透明心形冰块 (左侧呼应，增加层次) -->
                        <g transform="translate(80, 128) rotate(18) scale(0.68)">
                            <path d="M 0 -10 C -18 -26, -38 2, 0 34 C 38 2, 18 -26, 0 -10 Z" 
                                  fill="#d2f3ff" opacity="0.88" stroke="#222" stroke-width="3.5" stroke-linejoin="round"/>
                            <path d="M -4 -6 C -14 -18, -26 2, 0 24 C 26 2, 14 -18, 4 -6 Z" 
                                  fill="#ffffff" opacity="0.8"/>
                        </g>
                    </g>
                </g>
            `;
        },
        // 蓝色/浅色气泡 (冬之息 / 海之梦)
        blue_bubbles: () => `
            <g class="in-cup-item blue-bubbles-group">
                <circle cx="48" cy="175" r="7" fill="#ffffff" opacity="0.75" stroke="#222" stroke-width="2"/>
                <circle cx="76" cy="188" r="5" fill="#a4e4ff" opacity="0.8" stroke="#222" stroke-width="1.8"/>
                <circle cx="118" cy="180" r="9" fill="#ffffff" opacity="0.7" stroke="#222" stroke-width="2"/>
                <circle cx="140" cy="192" r="4.5" fill="#a4e4ff" opacity="0.9" stroke="#222" stroke-width="1.5"/>
                <circle cx="195" cy="178" r="6.5" fill="#ffffff" opacity="0.8" stroke="#222" stroke-width="1.8"/>
                <circle cx="50" cy="173" r="2" fill="#ffffff"/>
                <circle cx="119" cy="178" r="2.5" fill="#ffffff"/>
            </g>
        `,
        // 沉底金沙 (指间沙 - 起伏流金沙丘，带细密璀璨金砂粒子与高光星芒)
        sand_beads: () => `
            <g class="in-cup-item sand-beads-group">
                <!-- 底层深琥珀暖金沙丘 -->
                <path d="M 20 205 C 55 192, 90 200, 125 194 C 160 188, 195 196, 220 202 L 220 215 L 20 215 Z" 
                      fill="#d97706" opacity="0.65"/>
                <!-- 表层明亮璀璨流金沙丘 (带精致手绘起伏与描边) -->
                <path d="M 22 208 C 50 196, 85 204, 120 198 C 155 192, 185 200, 218 205 L 218 214 L 22 214 Z" 
                      fill="#facc15" stroke="#222" stroke-width="2.2" stroke-linejoin="round"/>
                <!-- 颗粒分明的金砂微粒 -->
                <circle cx="58" cy="201" r="3.2" fill="#ca8a04" stroke="#222" stroke-width="1.2"/>
                <circle cx="92" cy="204" r="2.8" fill="#eab308" stroke="#222" stroke-width="1.2"/>
                <circle cx="126" cy="200" r="3.5" fill="#ca8a04" stroke="#222" stroke-width="1.2"/>
                <circle cx="162" cy="203" r="3.0" fill="#eab308" stroke="#222" stroke-width="1.2"/>
                <circle cx="195" cy="206" r="2.6" fill="#ca8a04" stroke="#222" stroke-width="1.2"/>
                <!-- 闪烁金沙光斑与星芒 ✨ -->
                <circle cx="75" cy="198" r="2" fill="#ffffff" opacity="0.9"/>
                <circle cx="145" cy="196" r="2.2" fill="#ffffff" opacity="0.9"/>
                <path d="M 110 194 L 110 200 M 107 197 L 113 197" stroke="#ffffff" stroke-width="1.8" stroke-linecap="round"/>
                <path d="M 178 198 L 178 204 M 175 201 L 181 201" stroke="#ffffff" stroke-width="1.6" stroke-linecap="round"/>
            </g>
        `,
        // 王妃鬼藤 (翠绿带刺花藤)
        queen_vine: () => `
            <g class="in-cup-item queen-vine-group">
                <path d="M 40 188 Q 80 160, 130 145 T 195 70" 
                      stroke="#4b911c" stroke-width="6.5" stroke-linecap="round" fill="none"/>
                <path d="M 40 188 Q 80 160, 130 145 T 195 70" 
                      stroke="#222" stroke-width="2" stroke-linecap="round" fill="none" opacity="0.4"/>
                <path d="M 85 160 C 70 140, 80 125, 95 140 C 110 155, 100 170, 85 160 Z" 
                      fill="#77c82c" stroke="#222" stroke-width="2.8"/>
                <path d="M 145 130 C 135 110, 155 95, 168 115 C 178 135, 160 145, 145 130 Z" 
                      fill="#77c82c" stroke="#222" stroke-width="2.8"/>
                <path d="M 60 140 Q 65 145 70 140 Q 65 135 60 140 Z" fill="#ffffff" opacity="0.8"/>
                <path d="M 175 160 Q 180 165 185 160 Q 180 155 175 160 Z" fill="#ffffff" opacity="0.8"/>
            </g>
        `,
        // 金色弯月软糖 (灰姑娘 - 单个大号立体晶莹蜜柚软糖，斜卧沉底，带糖晶切角高光与微霜)
        crescent_moon: () => `
            <g class="in-cup-item crescent-moon-group" transform="translate(138, 175) rotate(-14)">
                <!-- 软糖柔光外晕 -->
                <path d="M 16 -24 C 36 -6, 32 26, 2 35 C 26 22, 22 -4, -6 -18 C 0 -22, 8 -24, 16 -24 Z" 
                      fill="#fef08a" opacity="0.4" stroke-width="5" stroke="#fef08a"/>
                <!-- 月牙软糖主体 (金黄多汁Q弹) -->
                <path d="M 14 -22 C 34 -6, 30 24, 0 32 C 24 20, 20 -4, -4 -16 C 2 -20, 8 -22, 14 -22 Z" 
                      fill="#facc15" stroke="#222" stroke-width="3.2" stroke-linejoin="round"/>
                <!-- 内层柔亮透光蜜柚肉质 (立体切角渐变) -->
                <path d="M 12 -16 C 26 -3, 22 17, 4 25 C 18 15, 15 -2, -1 -11 Z" 
                      fill="#fef08a" opacity="0.9"/>
                <!-- 晶莹糖衣边缘高光弧 -->
                <path d="M 16 -18 C 28 -4, 26 14, 8 26" stroke="#ffffff" stroke-width="2.6" stroke-linecap="round" fill="none" opacity="0.9"/>
                <!-- 晶莹白砂糖粒小星点 -->
                <circle cx="18" cy="2" r="1.6" fill="#ffffff"/>
                <circle cx="10" cy="18" r="1.4" fill="#ffffff"/>
                <circle cx="6" cy="-10" r="1.5" fill="#ffffff"/>
            </g>
        `,
        // 彩雨凝珠 (耳边雨)
        rain_drops: () => `
            <g class="in-cup-item rain-drops-group">
                <path d="M 60 145 C 50 160, 70 160, 60 145 Z" fill="#ff7e94" stroke="#222" stroke-width="2.2"/>
                <path d="M 60 145 C 50 160, 70 160, 60 145 Z" fill="#ff7e94" transform="translate(0, 30) scale(1.3)"/>
                <path d="M 140 155 C 130 170, 150 170, 140 155 Z" fill="#fed65e" stroke="#222" stroke-width="2.2"/>
                <path d="M 180 140 C 172 152, 188 152, 180 140 Z" fill="#b1e35a" stroke="#222" stroke-width="2"/>
                <circle cx="100" cy="180" r="4.5" fill="#f899e6" stroke="#222" stroke-width="1.8"/>
                <circle cx="160" cy="185" r="5" fill="#fed65e" stroke="#222" stroke-width="2"/>
            </g>
        `,
        // 星座小星 (云里星)
        constellation_stars: () => `
            <g class="in-cup-item constellation-stars-group">
                <polyline points="45,170 70,185 105,175 145,190 180,165 200,180" 
                          stroke="#ffffff" stroke-width="1.8" stroke-dasharray="3,3" opacity="0.6" fill="none"/>
                <g transform="translate(45, 170)">
                    <polygon points="0,-6 2,-2 6,-2 3,1 4,5 0,3 -4,5 -3,1 -6,-2 -2,-2" fill="#ffd43f" stroke="#222" stroke-width="1.5"/>
                </g>
                <g transform="translate(70, 185)">
                    <polygon points="0,-7 2,-2 7,-2 3,1 5,6 0,3 -5,6 -3,1 -7,-2 -2,-2" fill="#ffd43f" stroke="#222" stroke-width="1.5"/>
                </g>
                <g transform="translate(145, 190)">
                    <polygon points="0,-8 3,-2 8,-2 4,2 6,7 0,4 -6,7 -4,2 -8,-2 -3,-2" fill="#ffd43f" stroke="#222" stroke-width="1.8"/>
                </g>
                <g transform="translate(180, 165)">
                    <polygon points="0,-6 2,-2 6,-2 3,1 4,5 0,3 -4,5 -3,1 -6,-2 -2,-2" fill="#ffd43f" stroke="#222" stroke-width="1.5"/>
                </g>
                <circle cx="105" cy="175" r="3.5" fill="#ffffff" opacity="0.9"/>
                <circle cx="200" cy="180" r="3" fill="#ffffff" opacity="0.9"/>
            </g>
        `,
        // 幽灵微光 (双生 - 纵向占满整杯空间，漫布双生幽蓝淡紫极光雾气与微光十字星尘)
        ghost_particles: (containerBottom = 205, containerTop = 25) => {
            const h = containerBottom - containerTop;
            const midY = (containerBottom + containerTop) / 2;
            return `
            <g class="in-cup-item ghost-particles-group">
                <!-- 占满整杯的纵向微光极光雾 (优雅半透明) -->
                <ellipse cx="95" cy="${(midY - 15).toFixed(1)}" rx="55" ry="${(h * 0.42).toFixed(1)}" fill="#c084fc" opacity="0.18"/>
                <ellipse cx="145" cy="${(midY + 10).toFixed(1)}" rx="50" ry="${(h * 0.42).toFixed(1)}" fill="#818cf8" opacity="0.2"/>
                
                <!-- 上层灵动微光气泡与星芒 -->
                <circle cx="70" cy="${(containerTop + h * 0.22).toFixed(1)}" r="5.5" fill="#e0e7ff" opacity="0.75" stroke="#222" stroke-width="1.6"/>
                <circle cx="170" cy="${(containerTop + h * 0.26).toFixed(1)}" r="6.5" fill="#ede9fe" opacity="0.75" stroke="#222" stroke-width="1.6"/>
                <path d="M 120 ${(containerTop + h * 0.18).toFixed(1)} L 120 ${(containerTop + h * 0.18 + 10).toFixed(1)} M 115 ${(containerTop + h * 0.18 + 5).toFixed(1)} L 125 ${(containerTop + h * 0.18 + 5).toFixed(1)}" stroke="#ffffff" stroke-width="2.2" stroke-linecap="round"/>

                <!-- 中层双色幽灵微光珠 -->
                <g class="glow-pulse-circle">
                    <circle cx="60" cy="${(containerTop + h * 0.52).toFixed(1)}" r="7" fill="#c4b5fd" stroke="#222" stroke-width="1.8"/>
                    <circle cx="58" cy="${(containerTop + h * 0.52 - 2).toFixed(1)}" r="2" fill="#ffffff"/>
                </g>
                <g class="glow-pulse-circle">
                    <circle cx="180" cy="${(containerTop + h * 0.50).toFixed(1)}" r="7" fill="#93c5fd" stroke="#222" stroke-width="1.8"/>
                    <circle cx="178" cy="${(containerTop + h * 0.50 - 2).toFixed(1)}" r="2" fill="#ffffff"/>
                </g>
                <circle cx="120" cy="${(containerTop + h * 0.46).toFixed(1)}" r="4.5" fill="#fbcfe8" opacity="0.8" stroke="#222" stroke-width="1.4"/>
                <path d="M 148 ${(containerTop + h * 0.58).toFixed(1)} L 148 ${(containerTop + h * 0.58 + 8).toFixed(1)} M 144 ${(containerTop + h * 0.58 + 4).toFixed(1)} L 152 ${(containerTop + h * 0.58 + 4).toFixed(1)}" stroke="#ffffff" stroke-width="1.8" stroke-linecap="round"/>

                <!-- 底层沉浸星尘与幽灵光圈 -->
                <path d="M 30 ${(containerBottom - 18).toFixed(1)} Q 120 ${(containerBottom - 26).toFixed(1)} 210 ${(containerBottom - 18).toFixed(1)} L 210 ${(containerBottom + 2).toFixed(1)} L 30 ${(containerBottom + 2).toFixed(1)} Z" fill="#818cf8" opacity="0.32"/>
                <circle cx="85" cy="${(containerBottom - 14).toFixed(1)}" r="5" fill="#ddd6fe" stroke="#222" stroke-width="1.5"/>
                <circle cx="155" cy="${(containerBottom - 12).toFixed(1)}" r="5" fill="#bfdbfe" stroke="#222" stroke-width="1.5"/>
                <circle cx="118" cy="${(containerBottom - 16).toFixed(1)}" r="3" fill="#ffffff" opacity="0.9"/>
                <path d="M 100 ${(containerBottom - 22).toFixed(1)} L 100 ${(containerBottom - 14).toFixed(1)} M 96 ${(containerBottom - 18).toFixed(1)} L 104 ${(containerBottom - 18).toFixed(1)}" stroke="#ffffff" stroke-width="1.8" stroke-linecap="round"/>
            </g>
            `;
        },
        // 珊瑚海草 + 底沙 (海之梦)
        coral_seaweed: () => `
            <g class="in-cup-item coral-seaweed-group">
                <path d="M 22 195 Q 120 192 218 195 L 218 212 L 22 212 Z" fill="#fae1a0" stroke="#222" stroke-width="2.5"/>
                <path d="M 50 196 L 50 170 C 42 165, 40 152, 48 150 C 52 162, 60 165, 60 172 L 60 196" 
                      fill="#ff7b63" stroke="#222" stroke-width="2.5"/>
                <path d="M 60 180 C 68 175, 72 165, 68 160 C 62 162, 58 172, 60 180" 
                      fill="#ff7b63" stroke="#222" stroke-width="2.2"/>
                <path d="M 185 196 L 185 174 C 180 168, 178 158, 185 155 C 190 164, 195 168, 195 196" 
                      fill="#ff7b63" stroke="#222" stroke-width="2.5"/>
                <path d="M 125 196 Q 115 170 130 150 T 115 130" 
                      stroke="#4ebd63" stroke-width="7" stroke-linecap="round" fill="none"/>
                <path d="M 140 196 Q 150 175 140 155" 
                      stroke="#4ebd63" stroke-width="5.5" stroke-linecap="round" fill="none"/>
                <circle cx="100" cy="165" r="4.5" fill="#ffffff" opacity="0.8" stroke="#222" stroke-width="1.8"/>
                <circle cx="148" cy="145" r="3.5" fill="#ffffff" opacity="0.8" stroke="#222" stroke-width="1.5"/>
            </g>
        `,
        // 泥土落叶与咖啡豆 (幸运盆栽)
        soil_pebbles: () => `
            <g class="in-cup-item soil-pebbles-group">
                <ellipse cx="60" cy="188" rx="8" ry="5.5" fill="#915945" stroke="#222" stroke-width="2.2" transform="rotate(-15 60 188)"/>
                <ellipse cx="110" cy="192" rx="7" ry="5" fill="#915945" stroke="#222" stroke-width="2.2"/>
                <ellipse cx="175" cy="186" rx="9" ry="6" fill="#915945" stroke="#222" stroke-width="2.2" transform="rotate(20 175 186)"/>
                <path d="M 80 175 C 65 165, 75 150, 90 165 C 98 175, 90 185, 80 175 Z" 
                      fill="#81bd43" stroke="#222" stroke-width="2.2"/>
                <path d="M 145 175 C 135 160, 150 150, 160 165 C 168 178, 155 185, 145 175 Z" 
                      fill="#81bd43" stroke="#222" stroke-width="2.2"/>
            </g>
        `,
        // 🪼 发光小水母 (新增高级小料)
        jellyfish: () => `
            <g class="in-cup-item jellyfish-group" transform="translate(110, 150)">
                <circle cx="0" cy="0" r="18" fill="#f472b6" opacity="0.25" class="glow-pulse-circle"/>
                <path d="M -16 6 C -18 -16, 18 -16, 16 6 C 10 3, 4 8, 0 4 C -4 8, -10 3, -16 6 Z" 
                      fill="#fbcfe8" stroke="#222" stroke-width="3"/>
                <circle cx="-5" cy="-2" r="1.8" fill="#222"/>
                <circle cx="5" cy="-2" r="1.8" fill="#222"/>
                <path d="M -8 8 Q -10 22 -6 28" stroke="#f472b6" stroke-width="2.2" stroke-linecap="round" fill="none"/>
                <path d="M 0 8 Q 2 24 0 30" stroke="#f472b6" stroke-width="2.2" stroke-linecap="round" fill="none"/>
                <path d="M 8 8 Q 10 22 6 28" stroke="#f472b6" stroke-width="2.2" stroke-linecap="round" fill="none"/>
            </g>
        `,
        // ✨ 黄金金箔片 (新增高级小料)
        gold_flakes: () => `
            <g class="in-cup-item gold-flakes-group">
                <polygon points="55,145 62,140 68,148 58,152" fill="#fde047" stroke="#ca8a04" stroke-width="1.5"/>
                <polygon points="110,160 120,152 125,162 112,168" fill="#fde047" stroke="#ca8a04" stroke-width="1.8"/>
                <polygon points="165,138 178,135 174,148 160,146" fill="#fde047" stroke="#ca8a04" stroke-width="1.8"/>
                <polygon points="85,180 92,175 96,182 88,185" fill="#facc15" stroke="#ca8a04" stroke-width="1.5"/>
                <polygon points="140,185 148,178 152,188 142,192" fill="#facc15" stroke="#ca8a04" stroke-width="1.5"/>
            </g>
        `,
        // 🧋 黑糖珍珠波霸 (蜜雪/一点点/茶百道/喜茶)
        boba_pearls: () => `
            <g class="in-cup-item boba-pearls-group">
                <circle cx="50" cy="188" r="9" fill="#2d1b18" stroke="#110d0c" stroke-width="2.2"/>
                <circle cx="48" cy="185" r="2.5" fill="#ffffff" opacity="0.75"/>
                <circle cx="72" cy="192" r="9.5" fill="#38211d" stroke="#110d0c" stroke-width="2.2"/>
                <circle cx="70" cy="189" r="2.8" fill="#ffffff" opacity="0.75"/>
                <circle cx="95" cy="186" r="9" fill="#251614" stroke="#110d0c" stroke-width="2.2"/>
                <circle cx="93" cy="183" r="2.2" fill="#ffffff" opacity="0.7"/>
                <circle cx="118" cy="190" r="10" fill="#321d19" stroke="#110d0c" stroke-width="2.2"/>
                <circle cx="115" cy="187" r="3" fill="#ffffff" opacity="0.8"/>
                <circle cx="142" cy="187" r="9" fill="#251614" stroke="#110d0c" stroke-width="2.2"/>
                <circle cx="140" cy="184" r="2.5" fill="#ffffff" opacity="0.75"/>
                <circle cx="165" cy="191" r="9.5" fill="#351f1b" stroke="#110d0c" stroke-width="2.2"/>
                <circle cx="162" cy="188" r="2.6" fill="#ffffff" opacity="0.75"/>
                <circle cx="188" cy="187" r="8.5" fill="#2d1b18" stroke="#110d0c" stroke-width="2.2"/>
                <circle cx="186" cy="184" r="2.2" fill="#ffffff" opacity="0.7"/>
                <circle cx="82" cy="174" r="8" fill="#3f2722" stroke="#110d0c" stroke-width="2"/>
                <circle cx="80" cy="172" r="2.2" fill="#ffffff" opacity="0.8"/>
                <circle cx="130" cy="175" r="8.5" fill="#38211d" stroke="#110d0c" stroke-width="2"/>
                <circle cx="128" cy="173" r="2.4" fill="#ffffff" opacity="0.8"/>
            </g>
        `,
        // 🍋 鲜切柠檬片 (蜜雪冰城柠檬水)
        lemon_slice: () => `
            <g class="in-cup-item lemon-slice-group" transform="translate(135, 125) rotate(22)">
                <circle cx="0" cy="0" r="26" fill="#facc15" stroke="#222" stroke-width="3.5"/>
                <circle cx="0" cy="0" r="23" fill="#ffffff" stroke="#eab308" stroke-width="1.5"/>
                <circle cx="0" cy="0" r="20" fill="#fef08a"/>
                <path d="M 0 0 L -12 -16 M 0 0 L 12 -16 M 0 0 L 20 0 M 0 0 L 12 16 M 0 0 L -12 16 M 0 0 L -20 0" 
                      stroke="#ffffff" stroke-width="2.5" stroke-linecap="round"/>
                <circle cx="0" cy="0" r="3" fill="#ffffff"/>
            </g>
        `,
        // 🍊 鲜切橙片 (古茗/奈雪/茶百道)
        orange_slice: () => `
            <g class="in-cup-item orange-slice-group" transform="translate(75, 130) rotate(-18)">
                <circle cx="0" cy="0" r="28" fill="#ea580c" stroke="#222" stroke-width="3.5"/>
                <circle cx="0" cy="0" r="25" fill="#ffffff" stroke="#f97316" stroke-width="1.5"/>
                <circle cx="0" cy="0" r="22" fill="#fed7aa"/>
                <path d="M 0 0 L -14 -18 M 0 0 L 14 -18 M 0 0 L 22 0 M 0 0 L 14 18 M 0 0 L -14 18 M 0 0 L -22 0" 
                      stroke="#ffffff" stroke-width="2.8" stroke-linecap="round"/>
                <circle cx="0" cy="0" r="3.5" fill="#ffffff"/>
            </g>
        `,
        // 🍠 三色小芋圆 (茶百道芋圆奶茶)
        taro_balls: () => `
            <g class="in-cup-item taro-balls-group">
                <!-- 紫色小芋圆 -->
                <rect x="55" y="180" width="16" height="15" rx="5" fill="#c084fc" stroke="#222" stroke-width="2.2" transform="rotate(-10 63 187)"/>
                <rect x="135" y="182" width="16" height="15" rx="5" fill="#c084fc" stroke="#222" stroke-width="2.2" transform="rotate(15 143 189)"/>
                <!-- 金黄小地瓜圆 -->
                <rect x="85" y="184" width="16" height="15" rx="5" fill="#facc15" stroke="#222" stroke-width="2.2" transform="rotate(8 93 191)"/>
                <rect x="165" y="180" width="15" height="15" rx="5" fill="#facc15" stroke="#222" stroke-width="2.2" transform="rotate(-12 172 187)"/>
                <!-- 纯白小圆子 -->
                <rect x="110" y="183" width="15" height="15" rx="5" fill="#f8fafc" stroke="#222" stroke-width="2.2"/>
                <rect x="98" y="170" width="15" height="14" rx="5" fill="#e9d5ff" stroke="#222" stroke-width="2"/>
            </g>
        `,
        // 🍇 多肉葡萄果肉 (喜茶多肉葡萄)
        grape_pulp: () => `
            <g class="in-cup-item grape-pulp-group">
                <ellipse cx="65" cy="186" rx="10" ry="8" fill="#a855f7" opacity="0.88" stroke="#222" stroke-width="2.2" transform="rotate(-15 65 186)"/>
                <circle cx="63" cy="183" r="2.5" fill="#ffffff" opacity="0.75"/>
                <ellipse cx="95" cy="188" rx="11" ry="8.5" fill="#9333ea" opacity="0.88" stroke="#222" stroke-width="2.2"/>
                <ellipse cx="125" cy="185" rx="10" ry="8" fill="#7e22ce" opacity="0.88" stroke="#222" stroke-width="2.2" transform="rotate(12 125 185)"/>
                <circle cx="123" cy="182" r="2.5" fill="#ffffff" opacity="0.8"/>
                <ellipse cx="155" cy="187" rx="11" ry="8.5" fill="#a855f7" opacity="0.88" stroke="#222" stroke-width="2.2"/>
                <ellipse cx="180" cy="185" rx="9" ry="7.5" fill="#9333ea" opacity="0.88" stroke="#222" stroke-width="2" transform="rotate(-10 180 185)"/>
                <ellipse cx="110" cy="173" rx="9" ry="7.5" fill="#c084fc" opacity="0.9" stroke="#222" stroke-width="2"/>
            </g>
        `,
        // 🍑 蜜桃晶珠 (蜜雪蜜桃四季春)
        peach_jelly: () => `
            <g class="in-cup-item peach-jelly-group">
                <circle cx="60" cy="186" r="8.5" fill="#fbcfe8" opacity="0.9" stroke="#222" stroke-width="2"/>
                <circle cx="58" cy="183" r="2.2" fill="#ffffff" opacity="0.9"/>
                <circle cx="85" cy="189" r="9" fill="#f472b6" opacity="0.85" stroke="#222" stroke-width="2"/>
                <circle cx="110" cy="184" r="8.5" fill="#fda4af" opacity="0.9" stroke="#222" stroke-width="2"/>
                <circle cx="108" cy="181" r="2.2" fill="#ffffff" opacity="0.9"/>
                <circle cx="138" cy="188" r="9" fill="#fbcfe8" opacity="0.9" stroke="#222" stroke-width="2"/>
                <circle cx="165" cy="185" r="8.5" fill="#f472b6" opacity="0.85" stroke="#222" stroke-width="2"/>
                <circle cx="122" cy="173" r="7.5" fill="#fda4af" opacity="0.9" stroke="#222" stroke-width="1.8"/>
            </g>
        `,
        // 🍊 柚子粒 (杨枝甘露灵魂小料：粒粒爆汁金黄红心西柚果肉粒，晶莹透亮，带微光纤维与饱满梭形)
        grapefruit_pulp: () => `
            <g class="in-cup-item grapefruit-pulp-group">
                <!-- 红心西柚果粒梭形 1 (左) -->
                <ellipse cx="62" cy="186" rx="9.5" ry="5" fill="#f97316" opacity="0.9" stroke="#c2410c" stroke-width="1.8" transform="rotate(-25 62 186)"/>
                <ellipse cx="61" cy="184" rx="4" ry="2" fill="#fef08a" opacity="0.85" transform="rotate(-25 61 184)"/>
                
                <!-- 蜜柚金黄果粒 2 (中左) -->
                <ellipse cx="88" cy="188" rx="10" ry="5.5" fill="#fb923c" opacity="0.92" stroke="#ea580c" stroke-width="1.8" transform="rotate(15 88 188)"/>
                <circle cx="86" cy="186" r="2" fill="#ffffff" opacity="0.85"/>

                <!-- 红心西柚爆汁果肉 3 (中) -->
                <ellipse cx="118" cy="185" rx="10.5" ry="6" fill="#f87171" opacity="0.92" stroke="#dc2626" stroke-width="1.8" transform="rotate(-10 118 185)"/>
                <ellipse cx="116" cy="183" rx="5" ry="2.2" fill="#fef08a" opacity="0.85" transform="rotate(-10 116 183)"/>
                <circle cx="115" cy="182" r="1.8" fill="#ffffff" opacity="0.9"/>

                <!-- 金黄柚子粒 4 (中右) -->
                <ellipse cx="148" cy="187" rx="10" ry="5.5" fill="#fbbf24" opacity="0.9" stroke="#d97706" stroke-width="1.8" transform="rotate(20 148 187)"/>
                <ellipse cx="146" cy="185" rx="4" ry="2" fill="#ffffff" opacity="0.8" transform="rotate(20 146 185)"/>

                <!-- 红心西柚粒 5 (右) -->
                <ellipse cx="176" cy="185" rx="9" ry="5" fill="#f97316" opacity="0.9" stroke="#c2410c" stroke-width="1.8" transform="rotate(-18 176 185)"/>
                <circle cx="174" cy="183" r="1.8" fill="#ffffff" opacity="0.85"/>

                <!-- 上层叠落细嫩爆汁小果粒 -->
                <ellipse cx="102" cy="174" rx="8.5" ry="4.5" fill="#f43f5e" opacity="0.9" stroke="#be123c" stroke-width="1.6" transform="rotate(8 102 174)"/>
                <ellipse cx="134" cy="173" rx="8" ry="4.5" fill="#f59e0b" opacity="0.9" stroke="#b45309" stroke-width="1.6" transform="rotate(-12 134 173)"/>
            </g>
        `,
        // 💖 爱心果冻 (单个饱满晶莹、粉嫩Q弹的手作大爱心果冻布丁，沉底居中，带切角高光与水润光斑)
        heart_jelly: () => `
            <g class="in-cup-item heart-jelly-group" transform="translate(120, 182)">
                <!-- 果冻布丁柔和粉光外晕 -->
                <path d="M 0 -14 C -24 -36, -46 -4, 0 34 C 46 -4, 24 -36, 0 -14 Z" 
                      fill="#f472b6" opacity="0.3" stroke="#f472b6" stroke-width="5"/>
                <!-- 大爱心果冻主体 (宽约 56px，高约 48px，饱满沉底) -->
                <path d="M 0 -14 C -22 -34, -42 -2, 0 32 C 42 -2, 22 -34, 0 -14 Z" 
                      fill="#f472b6" stroke="#222" stroke-width="3.5" stroke-linejoin="round"/>
                <!-- 果冻侧切面透光质感与层次 (营造手作果冻模具倒扣立体切角) -->
                <path d="M 0 -8 C -16 -24, -32 0, 0 24 C 32 0, 16 -24, 0 -8 Z" 
                      fill="#fb7185" opacity="0.88"/>
                <!-- 果冻内部粉嫩水润半透明心芯 -->
                <path d="M 0 -4 C -10 -16, -20 0, 0 16 C 20 0, 10 -16, 0 -4 Z" 
                      fill="#fda4af" opacity="0.92"/>
                <!-- 左弧形晶亮高光弧线 (展现果冻滑润光泽) -->
                <path d="M -12 -18 C -22 -14, -28 0, -10 16" stroke="#ffffff" stroke-width="3" stroke-linecap="round" fill="none" opacity="0.9"/>
                <!-- 右侧水润切角反光点 -->
                <circle cx="14" cy="-6" r="3.2" fill="#ffffff" opacity="0.9"/>
                <circle cx="8" cy="-14" r="2.2" fill="#ffffff" opacity="0.85"/>
                <circle cx="-2" cy="18" r="2" fill="#ffffff" opacity="0.8"/>
            </g>
        `,
        // 🐚 珍珠白贝 (巨蟹座与小美人鱼爱丽儿专属：柔美米白双层扇形贝壳，中心点缀晶莹微光大白珍珠)
        pearl_shell: () => `
            <g class="in-cup-item pearl-shell-group" transform="translate(120, 185)">
                <!-- 贝壳后背扇贝外壳 (展开的贝壳下壳) -->
                <path d="M -30 15 C -34 -8, -18 -26, 0 -24 C 18 -26, 34 -8, 30 15 C 20 22, -20 22, -30 15 Z" 
                      fill="#fef2f2" stroke="#222" stroke-width="3" stroke-linejoin="round"/>
                <!-- 贝壳内部肉粉珍珠母贝质感内衬 -->
                <path d="M -24 13 C -28 -4, -14 -18, 0 -17 C 14 -18, 28 -4, 24 13 C 15 18, -15 18, -24 13 Z" 
                      fill="#ffe4e6" opacity="0.95"/>
                <!-- 扇形贝壳放射纹路 -->
                <path d="M 0 16 L -16 -12 M 0 16 L -7 -16 M 0 16 L 0 -17 M 0 16 L 7 -16 M 0 16 L 16 -12" 
                      stroke="#f43f5e" stroke-width="1.6" opacity="0.35" stroke-linecap="round"/>
                
                <!-- 珍珠底座小阴影 -->
                <ellipse cx="0" cy="8" rx="14" ry="6" fill="#fb7185" opacity="0.4"/>

                <!-- 🌟 魔法发光大白珍珠 (R=12) -->
                <!-- 珍珠柔和外晕光环 -->
                <circle cx="0" cy="2" r="14" fill="#bae6fd" opacity="0.35"/>
                <!-- 珍珠主体 (纯白至淡蓝粉微光渐变) -->
                <circle cx="0" cy="2" r="11" fill="#ffffff" stroke="#222" stroke-width="2.5"/>
                <circle cx="0" cy="2" r="9.5" fill="#f0fdf4" opacity="0.6"/>
                <circle cx="2" cy="4" r="8" fill="#fbcfe8" opacity="0.4"/>

                <!-- 珍珠晶莹高光弧与星芒反光 -->
                <ellipse cx="-3.5" cy="-2" rx="3.5" ry="2.2" fill="#ffffff" transform="rotate(-30 -3.5 -2)"/>
                <circle cx="-3" cy="-1.5" r="1.5" fill="#ffffff"/>
                <circle cx="3" cy="5" r="1.2" fill="#ffffff" opacity="0.8"/>

                <!-- 珍珠旁的小微光星屑 -->
                <polygon points="16,-6 18,-4 16,-2 14,-4" fill="#38bdf8" opacity="0.85"/>
                <polygon points="-18,-4 -16,-2 -18,0 -20,-2" fill="#f43f5e" opacity="0.75"/>
            </g>
        `,
        // 🧣 苏格兰格子围巾飘带 (白羊座与勇敢传说梅莉达专属：挂在杯沿左侧的经典墨绿黑红细格子呢围巾)
        tartan_scarf: () => `
            <g class="in-cup-item tartan-scarf-group" transform="translate(42, 60)">
                <!-- 围巾挂在杯沿上的厚厚褶皱结 -->
                <path d="M -18 -8 C -10 -16, 12 -16, 20 -8 C 22 2, -2 8, -18 -8 Z" fill="#1e3a2b" stroke="#222" stroke-width="3"/>
                <!-- 围巾垂挂飘带主体 (自然向下舒展卷曲) -->
                <path d="M -16 -6 C -24 25, -34 50, -18 78 L -4 74 C -18 50, -8 25, 4 -4 Z" 
                      fill="#1e3a2b" stroke="#222" stroke-width="3" stroke-linejoin="round"/>
                <!-- 苏格兰红黄格子线条 -->
                <path d="M -18 15 L -2 19 M -22 35 L -6 39 M -26 55 L -10 59" stroke="#dc2626" stroke-width="2" stroke-linecap="round"/>
                <path d="M -10 -4 C -16 25, -26 50, -12 76" stroke="#eab308" stroke-width="1.6" fill="none"/>
                <!-- 围巾下摆流苏细穗 -->
                <line x1="-18" y1="78" x2="-22" y2="86" stroke="#222" stroke-width="2"/>
                <line x1="-14" y1="77" x2="-16" y2="87" stroke="#222" stroke-width="2"/>
                <line x1="-9" y1="75" x2="-10" y2="86" stroke="#222" stroke-width="2"/>
                <line x1="-4" y1="74" x2="-4" y2="85" stroke="#222" stroke-width="2"/>
            </g>
        `,
        // 🌹 散落玫瑰花瓣 (金牛座与美女与野兽贝儿专属：沉浮在金黄茶汤底部的娇嫩红玫瑰花瓣与一朵单瓣浮花)
        scattered_roses: () => `
            <g class="in-cup-item scattered-roses-group" transform="translate(120, 160)">
                <!-- 沉底单朵小玫瑰花 (左下侧) -->
                <g transform="translate(-32, 10)">
                    <circle cx="0" cy="0" r="10" fill="#dc2626" stroke="#222" stroke-width="2.5"/>
                    <path d="M -5 -4 C -2 -8, 4 -8, 6 -3 C 8 2, 2 6, -3 5 Z" fill="#b91c1c" stroke="#222" stroke-width="1.8"/>
                    <path d="M -2 -1 C 2 -4, 4 -1, 3 2 C 1 4, -1 3, -2 -1 Z" fill="#f87171"/>
                    <circle cx="-1" cy="0" r="1.5" fill="#fef2f2"/>
                </g>
                <!-- 散落花瓣 1 (右侧轻扬浮起) -->
                <path d="M 24 -12 C 34 -20, 42 -10, 36 0 C 30 8, 18 -2, 24 -12 Z" 
                      fill="#ef4444" stroke="#222" stroke-width="2.2" opacity="0.9"/>
                <!-- 散落花瓣 2 (中央轻柔沉底) -->
                <path d="M -8 18 C -16 12, -12 2, -2 6 C 6 10, 2 22, -8 18 Z" 
                      fill="#e11d48" stroke="#222" stroke-width="2" opacity="0.85"/>
                <!-- 金色微光微粒 -->
                <circle cx="16" cy="6" r="2" fill="#fde047" opacity="0.8"/>
                <circle cx="-18" cy="-6" r="1.5" fill="#fde047" opacity="0.7"/>
            </g>
        `,
        // 🃏 草花A牌与金怀表 (双子座与爱丽丝梦游仙境茶会专属：斜插扑克牌与杯身复古怀表)
        poker_and_watch: () => `
            <g class="in-cup-item poker-watch-group" transform="translate(120, 120)">
                <!-- 扑克牌 (草花A) 斜插在左侧杯壁 -->
                <g transform="translate(-75, -20) rotate(-16)">
                    <rect x="-16" y="-24" width="32" height="48" rx="3.5" fill="#ffffff" stroke="#222" stroke-width="3"/>
                    <!-- 草花符号 ♣ -->
                    <circle cx="0" cy="-5" r="3.8" fill="#1e1e1e"/>
                    <circle cx="-4" cy="1" r="3.8" fill="#1e1e1e"/>
                    <circle cx="4" cy="1" r="3.8" fill="#1e1e1e"/>
                    <polygon points="-1,1 1,1 2,7 -2,7" fill="#1e1e1e"/>
                    <!-- 牌角 A -->
                    <text x="-12" y="-14" font-size="8" font-weight="bold" fill="#1e1e1e" font-family="sans-serif">A</text>
                </g>
                <!-- 复古金色怀表 (挂在右侧) -->
                <g transform="translate(82, 10)">
                    <!-- 表链环 -->
                    <path d="M 0 -18 C -8 -26, 8 -26, 0 -18" stroke="#ca8a04" stroke-width="3" fill="none"/>
                    <circle cx="0" cy="-15" r="3" fill="#facc15" stroke="#222" stroke-width="2"/>
                    <!-- 怀表金外壳 -->
                    <circle cx="0" cy="0" r="16" fill="#facc15" stroke="#222" stroke-width="3"/>
                    <!-- 白表盘 -->
                    <circle cx="0" cy="0" r="12" fill="#fefce8" stroke="#222" stroke-width="2"/>
                    <!-- 刻度与指针 -->
                    <line x1="0" y1="-9" x2="0" y2="-11" stroke="#222" stroke-width="1.8"/>
                    <line x1="0" y1="9" x2="0" y2="11" stroke="#222" stroke-width="1.8"/>
                    <line x1="-9" y1="0" x2="-11" y2="0" stroke="#222" stroke-width="1.8"/>
                    <line x1="9" y1="0" x2="11" y2="0" stroke="#222" stroke-width="1.8"/>
                    <line x1="0" y1="0" x2="0" y2="-6" stroke="#222" stroke-width="2" stroke-linecap="round"/>
                    <line x1="0" y1="0" x2="5" y2="3" stroke="#222" stroke-width="1.8" stroke-linecap="round"/>
                </g>
            </g>
        `,
        // 🪸 海星珊瑚彩贝 (巨蟹座与小美人鱼专属：杯底粉贝壳、粉红鹿角珊瑚与金黄海星)
        pink_seashell_coral: () => `
            <g class="in-cup-item pink-seashell-coral-group" transform="translate(120, 162)">
                <!-- 左下粉嫩大扇贝 -->
                <g transform="translate(-48, 8)">
                    <path d="M -18 10 C -22 -4, -10 -18, 0 -16 C 10 -18, 22 -4, 18 10 Z" fill="#fda4af" stroke="#222" stroke-width="2.5"/>
                    <path d="M 0 10 L -9 -10 M 0 10 L 0 -14 M 0 10 L 9 -10" stroke="#f43f5e" stroke-width="1.5" opacity="0.6"/>
                    <circle cx="0" cy="4" r="2.5" fill="#ffffff"/>
                </g>
                <!-- 右下粉红鹿角珊瑚 -->
                <g transform="translate(46, -2)">
                    <path d="M -8 18 C -6 6, -14 0, -12 -8 C -10 -14, -4 -12, -2 -6 C 0 4, 4 4, 6 -4 C 8 -10, 14 -8, 12 -2 C 10 6, 12 12, 8 18 Z" 
                          fill="#fb7185" stroke="#222" stroke-width="2.5" stroke-linejoin="round"/>
                </g>
                <!-- 底部金黄萌萌小海星 -->
                <g transform="translate(5, 12)">
                    <polygon points="0,-8 2.5,-2.5 8,-2 4,2.5 5.5,8 0,5 -5.5,8 -4,2.5 -8,-2 -2.5,-2.5" 
                             fill="#facc15" stroke="#222" stroke-width="2"/>
                    <circle cx="0" cy="0" r="1.5" fill="#eab308"/>
                </g>
                <!-- 晶莹上升气泡 -->
                <circle cx="-16" cy="-8" r="4" fill="#ffffff" opacity="0.75" stroke="#38bdf8" stroke-width="1.5"/>
                <circle cx="20" cy="-16" r="3" fill="#ffffff" opacity="0.8" stroke="#38bdf8" stroke-width="1.2"/>
            </g>
        `,
        // 🦁 荣耀石剪影与金箔 (狮子座与狮子王辛巴专属：非洲夕阳下荣耀石悬崖与小辛巴傲立黑剪影)
        savanna_shadow: () => `
            <g class="in-cup-item savanna-shadow-group" transform="translate(120, 108)">
                <!-- 远景落日巨大红日 -->
                <circle cx="-15" cy="-8" r="32" fill="#fef08a" opacity="0.65"/>
                <!-- 荣耀石险峻悬崖 (向右探出尖角) -->
                <path d="M -75 40 L -60 22 L -20 18 L 18 6 L 16 16 L -10 26 L -15 40 Z" fill="#291a10" stroke="#1c120c" stroke-width="2.2"/>
                <!-- 悬崖尖端：幼狮辛巴傲立黑剪影 -->
                <g transform="translate(14, -4) scale(0.75)">
                    <!-- 辛巴身体与四肢 -->
                    <path d="M -8 10 C -12 6, -10 -2, -4 -3 C 0 -4, 4 -2, 6 2 C 7 6, 9 8, 10 10 Z" fill="#291a10"/>
                    <!-- 翘起的可爱小狮尾巴 -->
                    <path d="M 8 7 C 12 5, 14 0, 15 -3" stroke="#291a10" stroke-width="2.5" stroke-linecap="round" fill="none"/>
                    <!-- 昂起的小狮脑袋与耳朵 -->
                    <circle cx="-4" cy="-6" r="4" fill="#291a10"/>
                    <circle cx="-6" cy="-9" r="1.8" fill="#291a10"/>
                    <circle cx="-2" cy="-9" r="1.8" fill="#291a10"/>
                </g>
                <!-- 远方非洲金合欢树剪影 -->
                <g transform="translate(-48, 16)">
                    <path d="M 0 16 L 0 6 C -4 3, -12 4, -14 0 C -16 -4, -4 -3, 0 -2 C 2 -4, 8 -3, 14 0 C 16 4, 6 3, 0 6 Z" fill="#291a10"/>
                </g>
            </g>
        `,
        // 🌲 初雪松林剪影 (处女座与白雪公主专属：深绿雪松林与落雪大红苹果)
        pine_forest_shadow: () => `
            <g class="in-cup-item pine-forest-shadow-group" transform="translate(120, 165)">
                <!-- 左侧松树 -->
                <g transform="translate(-42, 6)">
                    <polygon points="0,-24 8,-12 4,-12 11,0 6,0 14,14 -14,14 -6,0 -11,0 -4,-12 -8,-12" fill="#14532d" stroke="#222" stroke-width="2.2"/>
                    <!-- 松枝上的积雪 -->
                    <path d="M -8 14 Q 0 10 8 14 L 6 12 Q 0 8 -6 12 Z" fill="#ffffff"/>
                </g>
                <!-- 右侧两棵错落松树 -->
                <g transform="translate(36, 4)">
                    <polygon points="0,-28 9,-14 5,-14 12,0 7,0 15,16 -15,16 -7,0 -12,0 -5,-14 -9,-14" fill="#166534" stroke="#222" stroke-width="2.2"/>
                    <path d="M -9 16 Q 0 11 9 16 L 7 13 Q 0 9 -7 13 Z" fill="#ffffff"/>
                </g>
                <g transform="translate(56, 10) scale(0.75)">
                    <polygon points="0,-22 8,-11 4,-11 11,0 6,0 13,13 -13,13 -6,0 -11,0 -4,-11 -8,-11" fill="#14532d" stroke="#222" stroke-width="2"/>
                </g>
                <!-- 林间红苹果 -->
                <g transform="translate(-18, 12)">
                    <circle cx="0" cy="0" r="7.5" fill="#ef4444" stroke="#222" stroke-width="2"/>
                    <path d="M 0 -7 C 2 -10, 5 -10, 4 -7" stroke="#78350f" stroke-width="1.8" fill="none"/>
                    <circle cx="-2.5" cy="-2.5" r="1.8" fill="#ffffff"/>
                </g>
            </g>
        `,
        // 🌸 悬浮玫瑰花瓣 (天秤座与睡美人爱洛专属：层叠漂浮在粉晶露中的娇嫩玫瑰花蕾)
        rose_petals_layer: () => `
            <g class="in-cup-item rose-petals-layer-group" transform="translate(120, 100)">
                <!-- 层叠散布的花苞 1 -->
                <g transform="translate(-15, -28)">
                    <circle cx="0" cy="0" r="8" fill="#fda4af" stroke="#222" stroke-width="2"/>
                    <path d="M -4 -2 C -2 -6, 4 -6, 5 -1 C 5 3, 1 5, -2 4 Z" fill="#f43f5e" stroke="#222" stroke-width="1.5"/>
                    <circle cx="0" cy="0" r="1" fill="#ffffff"/>
                </g>
                <!-- 花苞 2 -->
                <g transform="translate(16, -10)">
                    <circle cx="0" cy="0" r="9" fill="#f43f5e" stroke="#222" stroke-width="2"/>
                    <path d="M -5 -3 C -3 -7, 4 -7, 5 -2 C 6 2, 2 5, -2 4 Z" fill="#fb7185" stroke="#222" stroke-width="1.5"/>
                    <circle cx="-1" cy="-1" r="1.2" fill="#ffffff"/>
                </g>
                <!-- 花苞 3 -->
                <g transform="translate(-8, 14)">
                    <circle cx="0" cy="0" r="8.5" fill="#fb7185" stroke="#222" stroke-width="2"/>
                    <path d="M -4 -2 C -2 -6, 3 -6, 4 -1 C 4 3, 1 5, -2 4 Z" fill="#fda4af" stroke="#222" stroke-width="1.5"/>
                </g>
                <!-- 飘飞花瓣 -->
                <path d="M -22 0 C -28 -6, -24 -12, -18 -8 C -14 -4, -16 4, -22 0 Z" fill="#ffe4e6" stroke="#222" stroke-width="1.8"/>
                <path d="M 24 16 C 30 10, 32 18, 26 22 C 20 22, 20 18, 24 16 Z" fill="#fda4af" stroke="#222" stroke-width="1.8"/>
            </g>
        `,
        // 🏰 荆棘黑城堡剪影 (天蝎座与黑魔女专属：黑色哥特尖塔城堡、尖锐荆棘刺与幽绿鬼火)
        thorn_castle: () => `
            <g class="in-cup-item thorn-castle-group" transform="translate(120, 145)">
                <!-- 幽暗哥特尖顶黑城堡 -->
                <polygon points="0,-36 8,-12 -8,-12" fill="#170d24" stroke="#000" stroke-width="2"/>
                <polygon points="-16,-24 -8,-6 -24,-6" fill="#170d24" stroke="#000" stroke-width="2"/>
                <polygon points="16,-24 24,-6 8,-6" fill="#170d24" stroke="#000" stroke-width="2"/>
                <rect x="-30" y="-6" width="60" height="28" fill="#170d24" stroke="#000" stroke-width="2"/>
                <!-- 城堡城垛 -->
                <rect x="-28" y="-12" width="6" height="8" fill="#170d24"/>
                <rect x="-14" y="-12" width="6" height="8" fill="#170d24"/>
                <rect x="8" y="-12" width="6" height="8" fill="#170d24"/>
                <rect x="22" y="-12" width="6" height="8" fill="#170d24"/>
                <!-- 尖锐蔓延黑荆棘 -->
                <path d="M -48 18 C -36 10, -28 -12, -42 -18" stroke="#170d24" stroke-width="3.5" stroke-linecap="round" fill="none"/>
                <path d="M 48 18 C 36 10, 28 -12, 42 -18" stroke="#170d24" stroke-width="3.5" stroke-linecap="round" fill="none"/>
                <!-- 幽绿魔火荧光微粒 -->
                <circle cx="-18" cy="-2" r="3" fill="#22c55e" opacity="0.85" class="glow-pulse-circle"/>
                <circle cx="18" cy="-2" r="3" fill="#22c55e" opacity="0.85" class="glow-pulse-circle"/>
                <circle cx="0" cy="-20" r="2.5" fill="#4ade80" opacity="0.9"/>
            </g>
        `,
        // 🕌 苏丹金殿与流苏 (射手座与阿拉丁专属：金色穹顶宫殿、椰树剪影与杯侧金流苏)
        arabian_palace_tassel: () => `
            <g class="in-cup-item arabian-palace-tassel-group" transform="translate(120, 110)">
                <!-- 夜空背景金月牙 -->
                <path d="M -45 -22 A 10 10 0 0 0 -35 -8 A 12 12 0 0 1 -45 -22 Z" fill="#fde047" stroke="#222" stroke-width="1.8"/>
                <!-- 金色圆顶宫殿群 (洋葱头穹顶) -->
                <g transform="translate(18, 5)">
                    <!-- 主殿洋葱头大穹顶 -->
                    <path d="M 0 -22 C -6 -14, -10 -10, -10 -2 L 10 -2 C 10 -10, 6 -14, 0 -22 Z" fill="#facc15" stroke="#222" stroke-width="2"/>
                    <rect x="-10" y="-2" width="20" height="22" fill="#eab308" stroke="#222" stroke-width="2"/>
                    <path d="M -5 20 A 5 7 0 0 1 5 20 Z" fill="#1e1e1e"/>
                    <!-- 侧殿小圆顶与宣礼塔 -->
                    <path d="M -18 -14 C -22 -8, -24 -4, -24 0 L -12 0 C -12 -4, -14 -8, -18 -14 Z" fill="#facc15" stroke="#222" stroke-width="1.6"/>
                    <rect x="-24" y="0" width="12" height="20" fill="#ca8a04" stroke="#222" stroke-width="1.8"/>
                    <line x1="22" y1="-26" x2="22" y2="20" stroke="#facc15" stroke-width="3"/>
                </g>
                <!-- 剪影椰子树 -->
                <g transform="translate(-25, 12)">
                    <path d="M 0 14 Q -4 0 2 -12" stroke="#222" stroke-width="2.5" fill="none"/>
                    <path d="M 2 -12 Q -8 -16 -12 -12 M 2 -12 Q -4 -20 0 -22 M 2 -12 Q 10 -18 12 -12 M 2 -12 Q 8 -6 10 -2" stroke="#222" stroke-width="2" fill="none"/>
                </g>
            </g>
        `,
        // ❄️ 冰雪城堡剪影 (摩羯座与艾莎女王专属：阿伦戴尔冰雕尖塔与冰晶)
        ice_castle_shadow: () => `
            <g class="in-cup-item ice-castle-shadow-group" transform="translate(120, 115)">
                <!-- 冰雪大城堡通透尖峰 -->
                <polygon points="0,-42 12,-6 -12,-6" fill="#e0f2fe" opacity="0.8" stroke="#38bdf8" stroke-width="2.5"/>
                <polygon points="0,-40 6,-8 -6,-8" fill="#ffffff" opacity="0.9"/>
                <polygon points="-18,-28 -8,-2 -26,-2" fill="#bae6fd" opacity="0.75" stroke="#38bdf8" stroke-width="2"/>
                <polygon points="18,-28 26,-2 8,-2" fill="#bae6fd" opacity="0.75" stroke="#38bdf8" stroke-width="2"/>
                <!-- 城堡底部冰城墙 -->
                <rect x="-35" y="-2" width="70" height="26" fill="#7dd3fc" opacity="0.7" stroke="#222" stroke-width="2.5"/>
                <!-- 璀璨反光星芒 -->
                <polygon points="-28,-18 -26,-15 -28,-12 -30,-15" fill="#ffffff"/>
                <polygon points="28,-18 30,-15 28,-12 26,-15" fill="#ffffff"/>
                <polygon points="0,-48 2,-44 0,-40 -2,-44" fill="#ffffff"/>
            </g>
        `,
        // 🐚 热带海礁彩贝 (水瓶座与莫阿娜专属：海螺壳、海星与热带海藻团)
        lagoon_shell: () => `
            <g class="in-cup-item lagoon-shell-group" transform="translate(120, 138)">
                <!-- 左侧金黄螺旋海螺壳 -->
                <g transform="translate(-36, 6)">
                    <path d="M -12 8 C -16 -4, -6 -14, 4 -12 C 14 -10, 16 0, 12 8 Z" fill="#fde047" stroke="#222" stroke-width="2.5"/>
                    <path d="M -6 6 C -4 0, 4 -2, 6 6" stroke="#ca8a04" stroke-width="2" fill="none"/>
                </g>
                <!-- 嫩绿水草海藻团 -->
                <g transform="translate(2, 8)">
                    <circle cx="0" cy="0" r="9" fill="#4ade80" stroke="#222" stroke-width="2.2"/>
                    <circle cx="-6" cy="4" r="6" fill="#22c55e" stroke="#222" stroke-width="2"/>
                    <circle cx="6" cy="3" r="6" fill="#16a34a" stroke="#222" stroke-width="2"/>
                </g>
                <!-- 右侧珊瑚与彩贝 -->
                <g transform="translate(38, 2)">
                    <path d="M -8 14 C -6 4, -12 0, -8 -8 C -4 -12, 4 -4, 4 4 C 8 -2, 12 4, 8 14 Z" fill="#fb7185" stroke="#222" stroke-width="2.2"/>
                </g>
            </g>
        `,
        // 🏮 水灯倒影与城堡 (双鱼座与长发公主专属：水波微型孔明灯倒影与王国城堡剪影)
        water_lanterns_castle: () => `
            <g class="in-cup-item water-lanterns-castle-group" transform="translate(120, 110)">
                <!-- 远景科洛纳王国城堡深紫剪影 -->
                <g transform="translate(32, -4)">
                    <polygon points="0,-30 8,-8 -8,-8" fill="#3b0764" stroke="#222" stroke-width="1.8"/>
                    <polygon points="-12,-18 -6,-2 -18,-2" fill="#3b0764" stroke="#222" stroke-width="1.6"/>
                    <rect x="-20" y="-2" width="36" height="24" fill="#3b0764" stroke="#222" stroke-width="1.8"/>
                </g>
                <!-- 水中泛着暖光的天灯倒影 1 (大) -->
                <g transform="translate(-24, 0)">
                    <rect x="-8" y="-10" width="16" height="20" rx="3" fill="#fbbf24" stroke="#222" stroke-width="2.2"/>
                    <!-- 内部火焰光晕 -->
                    <circle cx="0" cy="2" r="5" fill="#fef08a"/>
                    <!-- 天灯顶部提梁 -->
                    <path d="M -8 -8 Q 0 -13 8 -8" stroke="#ca8a04" stroke-width="1.8" fill="none"/>
                </g>
                <!-- 小天灯倒影 2 (右上) -->
                <g transform="translate(-4, -18) scale(0.65)">
                    <rect x="-8" y="-10" width="16" height="20" rx="3" fill="#fde047" stroke="#222" stroke-width="2.5"/>
                    <circle cx="0" cy="2" r="4.5" fill="#ffffff"/>
                </g>
                <!-- 极光水波倒影线 -->
                <ellipse cx="-24" cy="16" rx="14" ry="2.5" fill="#fde047" opacity="0.6"/>
            </g>
        `
    },

    // 4. 顶层封层与奶盖 (Foams & Top Layers) - 左右边缘全圆润曲线，无生硬直线
    foams: {
        none: () => ``,
        // 寒冬积雪 (原浮木积雪重构，移除木桩，重绘为纯净厚实蓬松冬雪)
        snow_wood: () => `
            <g class="foam-layer-group snow-wood-group">
                <!-- 底部蓬松淡蓝雪层阴影 -->
                <path d="M 22 28 
                         C 40 16, 70 12, 95 18 
                         C 120 12, 150 10, 175 16 
                         C 198 12, 214 20, 218 28 
                         C 226 34, 224 44, 214 46 
                         C 190 48, 160 42, 130 46 
                         C 95 42, 60 48, 26 46 
                         C 14 44, 12 34, 22 28 Z" 
                      fill="#e0f2fe" stroke="#222" stroke-width="4.5" stroke-linejoin="round"/>
                <!-- 表层多起伏厚实纯白冬雪 -->
                <path d="M 24 24 
                         C 45 10, 75 8, 100 14 
                         C 125 8, 160 8, 185 14 
                         C 205 10, 216 18, 216 24 
                         C 224 30, 222 38, 212 40 
                         C 185 42, 155 36, 125 40 
                         C 90 36, 55 42, 26 40 
                         C 16 38, 16 28, 24 24 Z" 
                      fill="#ffffff" stroke="#222" stroke-width="3.8" stroke-linejoin="round"/>
                <!-- 细微积雪凹凸弧线与冰晶雪光 -->
                <path d="M 50 24 Q 75 30 100 24" stroke="#bae6fd" stroke-width="2.2" stroke-linecap="round" fill="none"/>
                <path d="M 135 24 Q 165 30 192 24" stroke="#bae6fd" stroke-width="2.2" stroke-linecap="round" fill="none"/>
                <circle cx="82" cy="18" r="2.2" fill="#ffffff"/>
                <circle cx="152" cy="18" r="2.2" fill="#ffffff"/>
            </g>
        `,
        // 金色沙顶底盘 (指间沙)
        sand_plate: () => `
            <g class="foam-layer-group sand-plate-group">
                <!-- 左右圆润饱满沙丘弧线收边，无直线 -->
                <path d="M 26 26 
                         C 60 18, 180 18, 214 26 
                         C 224 30, 224 40, 214 44 
                         C 170 50, 70 50, 26 44 
                         C 16 40, 16 30, 26 26 Z" 
                      fill="#f3cd93" stroke="#222" stroke-width="4.5" stroke-linejoin="round"/>
                <path d="M 45 35 Q 120 42 195 35" stroke="#e0b370" stroke-width="2.5" fill="none"/>
            </g>
        `,
        // 南瓜奶油底 (灰姑娘)
        pumpkin_cream: () => `
            <g class="foam-layer-group pumpkin-cream-group">
                <!-- 左右圆润南瓜奶油泡泡收边，无直线 -->
                <path d="M 26 26 
                         Q 60 18 100 24 
                         Q 140 18 180 24 
                         Q 202 20 214 26 
                         C 225 31, 225 39, 214 44 
                         Q 120 50 26 44 
                         C 15 39, 15 31, 26 26 Z" 
                      fill="#fed458" stroke="#222" stroke-width="4.2" stroke-linejoin="round"/>
            </g>
        `,
        // 落雨白云 (耳边雨) - 雨丝不算作底部，从云朵底部(y=38)坐落算起，雨丝垂落进饮料
        rain_cloud: () => `
            <g class="foam-layer-group rain-cloud-group">
                <!-- 云朵本身：底边在 y=38 与液面严丝合缝对齐，左右圆润气泡无直线 -->
                <g class="fluffy-cloud">
                    <path d="M 42 38 
                             C 22 38, 20 18, 42 12 
                             C 38 -8, 68 -15, 84 -2 
                             C 100 -25, 140 -25, 156 -2 
                             C 172 -14, 202 -6, 198 14 
                             C 220 20, 218 38, 196 38 
                             Q 120 40 42 38 Z" 
                          fill="#ffffff" stroke="#222" stroke-width="4.8" stroke-linejoin="round"/>
                    <path d="M 75 12 Q 85 2 100 9" stroke="#222" stroke-width="2.5" fill="none" opacity="0.3"/>
                    <path d="M 140 9 Q 155 -1 170 9" stroke="#222" stroke-width="2.5" fill="none" opacity="0.3"/>
                </g>
                <!-- 彩色雨滴装饰条：从云朵底部(y=38)自然垂落深入饮料内部，不抬高云朵 -->
                <g class="cloud-rain-drops">
                    <line x1="68" y1="36" x2="68" y2="58" stroke="#ff7e94" stroke-width="2.6" stroke-linecap="round"/>
                    <line x1="102" y1="38" x2="102" y2="68" stroke="#b0dc56" stroke-width="2.6" stroke-linecap="round"/>
                    <line x1="138" y1="36" x2="138" y2="62" stroke="#f69fe3" stroke-width="2.6" stroke-linecap="round"/>
                    <line x1="172" y1="38" x2="172" y2="66" stroke="#fed43f" stroke-width="2.6" stroke-linecap="round"/>
                </g>
            </g>
        `,
        // 夜幕星云 (云里星)
        night_cloud: () => `
            <g class="foam-layer-group night-cloud-group">
                <!-- 左右圆润星云气泡，无直线 -->
                <path d="M 24 28 
                         C 40 12, 70 8, 92 20 
                         C 115 5, 155 5, 175 18 
                         C 195 10, 210 18, 216 26 
                         C 226 31, 226 41, 216 46 
                         C 170 52, 70 52, 24 46 
                         C 14 41, 14 31, 24 28 Z" 
                      fill="#20407a" stroke="#222" stroke-width="4.5" stroke-linejoin="round"/>
            </g>
        `,
        // 黑色玄武岩玫瑰膏 (双生)
        black_rose_cream: () => `
            <g class="foam-layer-group black-rose-cream-group">
                <!-- 左右圆润花膏弧线，无直线 -->
                <path d="M 24 28 
                         C 40 15, 65 10, 85 20 
                         C 100 8, 130 8, 148 18 
                         C 168 8, 200 12, 216 26 
                         C 226 31, 226 41, 216 46 
                         C 160 52, 80 52, 24 46 
                         C 14 41, 14 31, 24 28 Z" 
                      fill="#262628" stroke="#222" stroke-width="4.5" stroke-linejoin="round"/>
                <path d="M 50 22 C 70 12, 90 28, 80 34" stroke="#48484e" stroke-width="3" fill="none"/>
                <path d="M 110 18 C 130 8, 150 24, 140 32" stroke="#48484e" stroke-width="3" fill="none"/>
                <path d="M 170 20 C 190 12, 205 26, 195 32" stroke="#48484e" stroke-width="3" fill="none"/>
            </g>
        `,
        // 浮冰奶盖 (海之梦 - 嵌入清爽晶莹蓝色碎冰颗粒与冰晶折射)
        ocean_ice_cap: () => `
            <g class="foam-layer-group ocean-ice-cap-group">
                <!-- 浮冰厚奶盖底托 (微带冰川浅海淡蓝渐变透光) -->
                <path d="M 24 26 
                         C 45 12, 85 10, 115 20 
                         C 145 10, 185 10, 216 24 
                         C 226 29, 226 39, 216 44 
                         C 170 50, 70 50, 24 44 
                         C 14 39, 14 29, 24 26 Z" 
                      fill="#f0f9ff" stroke="#222" stroke-width="4.5" stroke-linejoin="round"/>
                
                <!-- 嵌入其中的晶莹多棱角蓝色碎冰 (半透明冰川蓝与深浅折射) -->
                <!-- 碎冰块 1 (左侧立体积冰) -->
                <polygon points="46,24 58,16 66,26 54,34" fill="#7dd3fc" stroke="#0284c7" stroke-width="1.8" opacity="0.9"/>
                <polygon points="46,24 58,16 54,22 44,28" fill="#bae6fd" opacity="0.85"/>
                
                <!-- 碎冰块 2 (左中晶莹碎冰) -->
                <polygon points="76,26 88,18 96,28 84,36" fill="#38bdf8" stroke="#0284c7" stroke-width="1.8" opacity="0.92"/>
                <polygon points="76,26 88,18 84,24 74,30" fill="#ffffff" opacity="0.8"/>

                <!-- 碎冰块 3 (中央大冰晶) -->
                <polygon points="110,20 126,12 136,24 120,32" fill="#7dd3fc" stroke="#0284c7" stroke-width="2" opacity="0.95"/>
                <polygon points="110,20 126,12 122,18 108,24" fill="#ffffff" opacity="0.9"/>
                <line x1="122" y1="18" x2="120" y2="32" stroke="#0284c7" stroke-width="1.5" opacity="0.8"/>

                <!-- 碎冰块 4 (右中菱形碎冰) -->
                <polygon points="146,24 158,16 168,26 156,34" fill="#38bdf8" stroke="#0284c7" stroke-width="1.8" opacity="0.9"/>
                <polygon points="146,24 158,16 154,22 144,28" fill="#e0f2fe" opacity="0.85"/>

                <!-- 碎冰块 5 (右侧小碎冰晶) -->
                <polygon points="178,26 190,20 196,28 186,34" fill="#7dd3fc" stroke="#0284c7" stroke-width="1.8" opacity="0.88"/>
                <polygon points="178,26 190,20 186,24 176,30" fill="#ffffff" opacity="0.75"/>

                <!-- 散落细碎冰晶微粒与闪耀折射星芒 -->
                <circle cx="70" cy="32" r="2.2" fill="#38bdf8" opacity="0.85"/>
                <circle cx="102" cy="30" r="2.8" fill="#bae6fd" opacity="0.9"/>
                <circle cx="140" cy="32" r="2.5" fill="#38bdf8" opacity="0.85"/>
                <circle cx="172" cy="32" r="2" fill="#7dd3fc" opacity="0.8"/>
                <path d="M 125 15 L 127 19 L 131 20 L 127 21 L 125 25 L 123 21 L 119 20 L 123 19 Z" fill="#ffffff" opacity="0.95"/>
            </g>
        `,
        // 巧克力花泥 (幸运盆栽)
        soil_top: () => `
            <g class="foam-layer-group soil-top-group">
                <!-- 左右圆润泥土小丘弧线，无直线 -->
                <path d="M 24 26 
                         Q 65 18 120 18 
                         Q 175 18 216 24 
                         C 226 29, 226 39, 216 44 
                         Q 120 52 24 44 
                         C 14 39, 14 29, 24 26 Z" 
                      fill="#693c2a" stroke="#222" stroke-width="4.5" stroke-linejoin="round"/>
            </g>
        `,
        // 🍬 梦幻棉花糖顶 (高级封层)
        cotton_candy: () => `
            <g class="foam-layer-group cotton-candy-group" transform="translate(0, -6)">
                <ellipse cx="65" cy="25" rx="35" ry="22" fill="#fbcfe8" stroke="#222" stroke-width="4"/>
                <ellipse cx="120" cy="18" rx="42" ry="24" fill="#ddd6fe" stroke="#222" stroke-width="4.2"/>
                <ellipse cx="175" cy="25" rx="35" ry="22" fill="#bae6fd" stroke="#222" stroke-width="4"/>
                <circle cx="85" cy="12" r="16" fill="#fbcfe8"/>
                <circle cx="150" cy="12" r="16" fill="#bae6fd"/>
            </g>
        `,
        // 🧀 芝士厚奶盖 (喜茶/茶百道/古茗)
        cheese_foam: () => `
            <g class="foam-layer-group cheese-foam-group">
                <!-- 左右两端完全采用饱满柔滑的奶油圆弧收边，无任何生硬直线 -->
                <path d="M 24 28 
                         C 45 18, 75 14, 105 20 
                         C 135 14, 175 14, 216 26 
                         C 226 31, 226 41, 216 46 
                         C 180 54, 140 48, 100 52 
                         C 60 48, 40 54, 24 46 
                         C 14 41, 14 31, 24 28 Z" 
                      fill="#fef9c3" stroke="#222" stroke-width="4.2" stroke-linejoin="round"/>
                <path d="M 38 25 C 68 21, 100 23, 130 21" stroke="#fef08a" stroke-width="3" stroke-linecap="round" fill="none"/>
            </g>
        `,
        // 🍦 鲜奶油雪顶 (茶颜悦色幽兰拿铁 / 星巴克星冰乐)
        whipped_cream: () => `
            <g class="foam-layer-group whipped-cream-group">
                <!-- 底层绵密大奶油波浪 (两端圆润翻卷，绝无直线平切，基准底稳坐液面) -->
                <path d="M 26 42 
                         C 18 36, 22 26, 36 28 
                         C 50 20, 80 20, 94 34 
                         C 112 18, 148 18, 168 34 
                         C 182 22, 210 26, 216 36 
                         C 222 42, 214 48, 204 46 
                         C 170 48, 70 48, 36 46 
                         C 26 46, 24 44, 26 42 Z" 
                      fill="#ffffff" stroke="#222" stroke-width="4.2" stroke-linejoin="round"/>
                <!-- 中层向内螺旋堆叠 -->
                <path d="M 48 35 C 55 12, 105 8, 120 25 C 135 10, 175 12, 185 35 Z" 
                      fill="#fffbeb" stroke="#222" stroke-width="4" stroke-linejoin="round"/>
                <!-- 顶峰优雅尖角旋转雪顶 -->
                <path d="M 80 22 C 90 -5, 130 -12, 140 5 C 145 15, 125 22, 115 22 Z" 
                      fill="#ffffff" stroke="#222" stroke-width="3.8" stroke-linejoin="round"/>
                <path d="M 125 -6 Q 135 -14 130 -2" stroke="#222" stroke-width="2.5" stroke-linecap="round" fill="none"/>
                <!-- 奶白色高光条纹 -->
                <path d="M 65 28 Q 85 18 105 24" stroke="#fef08a" stroke-width="2.5" stroke-linecap="round" fill="none" opacity="0.6"/>
                <path d="M 135 24 Q 155 18 175 28" stroke="#fef08a" stroke-width="2.5" stroke-linecap="round" fill="none" opacity="0.6"/>
            </g>
        `,
        // 🍨 香草冰淇淋浮顶 (一点点冰淇淋红茶)
        ice_cream_float: () => `
            <g class="foam-layer-group ice-cream-float-group" transform="translate(120, 15)">
                <ellipse cx="0" cy="5" rx="34" ry="24" fill="#fef3c7" stroke="#222" stroke-width="4.5"/>
                <circle cx="-10" cy="-6" r="3" fill="#ffffff" opacity="0.8"/>
                <circle cx="12" cy="0" r="2.5" fill="#ffffff" opacity="0.8"/>
                <path d="M -24 12 Q -12 18 0 12 Q 12 18 24 12" stroke="#222" stroke-width="3.5" fill="none" stroke-linecap="round"/>
            </g>
        `
    },

    // 5. 核心立体顶饰 (Toppers)
    toppers: {
        none: () => ``,
        // 👑 黄金皇冠猫咪 (新增高级顶饰)
        crown_cat: () => `
            <g class="topper-group crown-cat-topper" transform="translate(120, -22)">
                <!-- 纯白猫猫头 -->
                <ellipse cx="0" cy="24" rx="28" ry="22" fill="#ffffff" stroke="#222" stroke-width="4.2"/>
                <!-- 猫耳朵 -->
                <polygon points="-22,10 -15,-10 -5,6" fill="#ffffff" stroke="#222" stroke-width="3.5" stroke-linejoin="round"/>
                <polygon points="-19,8 -15,-4 -8,6" fill="#f472b6"/>
                <polygon points="22,10 15,-10 5,6" fill="#ffffff" stroke="#222" stroke-width="3.5" stroke-linejoin="round"/>
                <polygon points="19,8 15,-4 8,6" fill="#f472b6"/>
                <!-- 黄金小皇冠 -->
                <polygon points="-12,-6 -14,-22 -5,-14 0,-24 5,-14 14,-22 12,-6" fill="#facc15" stroke="#222" stroke-width="3" stroke-linejoin="round"/>
                <circle cx="0" cy="-24" r="2.5" fill="#f43f5e"/>
                <!-- 眯眼笑脸与红晕 -->
                <path d="M -12 22 Q -8 18 -4 22" stroke="#222" stroke-width="3" stroke-linecap="round" fill="none"/>
                <path d="M 4 22 Q 8 18 12 22" stroke="#222" stroke-width="3" stroke-linecap="round" fill="none"/>
                <polygon points="-2,27 2,27 0,29" fill="#f472b6"/>
                <ellipse cx="-16" cy="26" rx="4" ry="2.5" fill="#ffb4c8" opacity="0.8"/>
                <ellipse cx="16" cy="26" rx="4" ry="2.5" fill="#ffb4c8" opacity="0.8"/>
            </g>
        `,
        // 戴红围巾小雪人 (冬之息)
        snowman: () => `
            <g class="topper-group snowman-topper" transform="translate(145, -35)">
                <rect x="-32" y="10" width="12" height="50" rx="4" fill="#3c5268" stroke="#222" stroke-width="3.5" transform="rotate(-18)"/>
                <ellipse cx="12" cy="40" rx="19" ry="17" fill="#ffffff" stroke="#222" stroke-width="4"/>
                <circle cx="12" cy="18" r="14" fill="#ffffff" stroke="#222" stroke-width="4"/>
                <path d="M 0 26 Q 12 30 25 26 Q 16 35 0 26 Z" fill="#e84141" stroke="#222" stroke-width="2.5"/>
                <path d="M 3 27 L -10 32 L -6 44 L 4 34 Z" fill="#e84141" stroke="#222" stroke-width="2.5"/>
                <circle cx="17" cy="15" r="2" fill="#222"/>
                <circle cx="23" cy="16" r="1.5" fill="#222"/>
                <polygon points="21,18 31,19 21,21" fill="#ff7824" stroke="#222" stroke-width="1.8"/>
            </g>
        `,
        // 沙雕城堡 (指间沙)
        sand_castle: () => `
            <g class="topper-group sand-castle-topper" transform="translate(75, -55)">
                <path d="M 10 70 L 10 38 L 22 38 L 22 45 L 32 45 L 32 38 L 45 38 L 45 45 L 55 45 L 55 38 L 78 38 L 78 70 Z" 
                      fill="#e9bf7c" stroke="#222" stroke-width="4" stroke-linejoin="round"/>
                <path d="M 30 40 L 30 18 L 36 18 L 36 12 L 45 2 L 54 12 L 54 18 L 60 18 L 60 40 Z" 
                      fill="#e0b26b" stroke="#222" stroke-width="3.8" stroke-linejoin="round"/>
                <path d="M 38 70 L 38 52 A 6 6 0 0 1 52 52 L 52 70 Z" fill="#b98941" stroke="#222" stroke-width="2.8"/>
                <polygon points="12,38 18,22 24,38" fill="#d9a85c" stroke="#222" stroke-width="2.8"/>
                <polygon points="64,38 70,22 76,38" fill="#d9a85c" stroke="#222" stroke-width="2.8"/>
            </g>
        `,
        // 🌹 盛放粉玫瑰 (精致法式手绘层叠重瓣粉玫瑰，花茎显著加长深入杯内，图层位于杯身和奶盖后方)
        pink_rose: () => `
            <g class="topper-group pink-rose-topper" transform="translate(130, -35) rotate(12)">
                <!-- 1. 加长优雅绿枝花茎 (深入杯内深处) 与双生嫩叶 -->
                <path d="M 0 32 Q -8 80 -18 135" stroke="#222" stroke-width="8" stroke-linecap="round" fill="none"/>
                <path d="M 0 32 Q -8 80 -18 135" stroke="#2d6a12" stroke-width="5.5" stroke-linecap="round" fill="none"/>
                <path d="M -1 32 Q -9 80 -19 135" stroke="#4ade80" stroke-width="1.8" stroke-linecap="round" fill="none" opacity="0.6"/>
                <!-- 左嫩叶 (带清晰叶脉与嫩绿高光) -->
                <path d="M -4 34 C -22 36 -28 22 -14 18 C -6 20 -2 28 -4 34 Z" fill="#4ade80" stroke="#222" stroke-width="2.6" stroke-linejoin="round"/>
                <path d="M -4 34 Q -12 28 -18 20" stroke="#166534" stroke-width="1.8" fill="none" stroke-linecap="round"/>
                <!-- 右嫩叶 -->
                <path d="M 2 38 C 18 42 26 28 14 22 C 6 24 2 32 2 38 Z" fill="#34d399" stroke="#222" stroke-width="2.6" stroke-linejoin="round"/>
                <path d="M 2 38 Q 10 32 18 24" stroke="#065f46" stroke-width="1.8" fill="none" stroke-linecap="round"/>
                <!-- 花托花萼 -->
                <polygon points="-8,28 0,36 8,28 4,24 -4,24" fill="#22c55e" stroke="#222" stroke-width="2.4"/>

                <!-- 2. 外层舒展大花瓣 (柔和外翻，层次分明，暗粉衬托) -->
                <!-- 底层花瓣阴影底衬 -->
                <path d="M -26 20 C -38 0 -22 -24 0 -24 C 22 -24 38 0 26 20 C 12 30 -12 30 -26 20 Z" 
                      fill="#e11d48" stroke="#222" stroke-width="4.5" stroke-linejoin="round"/>
                <!-- 左下外瓣 -->
                <path d="M -24 16 C -34 2 -26 -16 -10 -16 C -4 -4 -6 16 -24 16 Z" 
                      fill="#f472b6" stroke="#222" stroke-width="3" stroke-linejoin="round"/>
                <!-- 右下外瓣 -->
                <path d="M 24 16 C 34 2 26 -16 10 -16 C 4 -4 6 16 24 16 Z" 
                      fill="#f472b6" stroke="#222" stroke-width="3" stroke-linejoin="round"/>
                <!-- 顶后外瓣 -->
                <path d="M -16 -14 C -12 -26 12 -26 16 -14 C 8 -8 -8 -8 -16 -14 Z" 
                      fill="#fb7185" stroke="#222" stroke-width="3" stroke-linejoin="round"/>
                <!-- 正面下托大花瓣 (优雅内凹卷曲弧度) -->
                <path d="M -20 18 C -10 28 10 28 20 18 C 15 8 -15 8 -20 18 Z" 
                      fill="#f472b6" stroke="#222" stroke-width="3.2" stroke-linejoin="round"/>
                <path d="M -14 20 Q 0 24 14 20" stroke="#fdf2f8" stroke-width="2.2" stroke-linecap="round" fill="none"/>

                <!-- 3. 中层抱合旋转花瓣 -->
                <path d="M -16 8 C -22 -6 -8 -16 0 -12 C 10 -16 22 -4 16 8 C 8 16 -8 16 -16 8 Z" 
                      fill="#ec4899" stroke="#222" stroke-width="3.2" stroke-linejoin="round"/>
                <path d="M -14 2 C -12 -10 2 -12 8 -6" stroke="#fbcfe8" stroke-width="2.2" stroke-linecap="round" fill="none"/>
                <path d="M 12 4 C 10 -8 -2 -10 -6 -4" stroke="#fbcfe8" stroke-width="2" stroke-linecap="round" fill="none"/>

                <!-- 4. 核心初绽螺旋花芯 (优雅水滴卷心) -->
                <path d="M -8 -2 C -10 -10 0 -14 6 -8 C 10 -2 4 6 -2 6 C -6 6 -8 2 -8 -2 Z" 
                      fill="#be185d" stroke="#222" stroke-width="2.5" stroke-linejoin="round"/>
                <path d="M -4 -4 C -2 -8 4 -6 3 -2 C 2 2 -2 2 -4 -1" stroke="#fdf2f8" stroke-width="2" stroke-linecap="round" fill="none"/>

                <!-- 5. 花瓣边缘晨露小水滴 -->
                <circle cx="16" cy="12" r="2.2" fill="#ffffff" opacity="0.85"/>
                <circle cx="-16" cy="6" r="1.8" fill="#ffffff" opacity="0.85"/>
            </g>
        `,
        // 南瓜与繁花 (灰姑娘)
        pumpkin_flowers: () => `
            <g class="topper-group pumpkin-flowers-topper" transform="translate(45, -35)">
                <g class="pumpkin-left">
                    <path d="M 38 10 C 35 2, 42 -4, 40 -10" stroke="#3d7221" stroke-width="4.5" stroke-linecap="round" fill="none"/>
                    <ellipse cx="18" cy="20" rx="14" ry="22" fill="#f8921e" stroke="#222" stroke-width="4"/>
                    <ellipse cx="58" cy="20" rx="14" ry="22" fill="#f8921e" stroke="#222" stroke-width="4"/>
                    <ellipse cx="38" cy="22" rx="18" ry="24" fill="#ffa733" stroke="#222" stroke-width="4"/>
                </g>
                <g class="flowers-right" transform="translate(68, 5)">
                    <circle cx="15" cy="0" r="10" fill="#a4dcfa" stroke="#222" stroke-width="2.8"/>
                    <circle cx="15" cy="0" r="3" fill="#ffffff"/>
                    <circle cx="34" cy="8" r="9" fill="#ffaec4" stroke="#222" stroke-width="2.8"/>
                    <circle cx="34" cy="8" r="2.8" fill="#ffffff"/>
                    <circle cx="20" cy="22" r="11" fill="#c9b5f5" stroke="#222" stroke-width="2.8"/>
                    <circle cx="20" cy="22" r="3.2" fill="#ffffff"/>
                    <circle cx="42" cy="25" r="8.5" fill="#fee066" stroke="#222" stroke-width="2.8"/>
                    <circle cx="42" cy="25" r="2.5" fill="#ffffff"/>
                </g>
            </g>
        `,
        // 发光八角大黄星 (云里星)
        glowing_big_star: () => `
            <g class="topper-group glowing-star-topper" transform="translate(120, -18)">
                <circle cx="0" cy="0" r="32" fill="#fed646" opacity="0.3" class="glow-pulse-circle"/>
                <path d="M 0 -28 
                         C 4 -12, 12 -4, 28 0 
                         C 12 4, 4 12, 0 28 
                         C -4 12, -12 4, -28 0 
                         C -12 -4, -4 -12, 0 -28 Z" 
                      fill="#ffe259" stroke="#222" stroke-width="4.5" stroke-linejoin="round"/>
                <path d="M 0 -18 
                         C 2 -8, 8 -2, 18 0 
                         C 8 2, 2 8, 0 18 
                         C -2 8, -8 2, -18 0 
                         C -8 -2, -2 -8, 0 -18 Z" 
                      fill="#ffffff" opacity="0.75"/>
            </g>
        `,
        // 双生小幽灵 (双生)
        twin_ghosts: () => `
            <g class="topper-group twin-ghosts-topper" transform="translate(75, -28)">
                <g class="blue-ghost" transform="translate(0, 0)">
                    <circle cx="0" cy="0" r="16" fill="#8ec5fc" opacity="0.3" class="glow-pulse-circle"/>
                    <path d="M -12 6 C -14 -12, 14 -12, 12 6 C 8 4, 4 8, 0 5 C -4 8, -8 4, -12 6 Z" 
                          fill="#d8ecff" stroke="#222" stroke-width="3.2"/>
                    <circle cx="-3" cy="-1" r="1.5" fill="#222"/>
                    <circle cx="4" cy="-1" r="1.5" fill="#222"/>
                    <ellipse cx="-5" cy="2" rx="1.5" ry="0.8" fill="#a4d2ff"/>
                    <ellipse cx="6" cy="2" rx="1.5" ry="0.8" fill="#a4d2ff"/>
                </g>
                <g class="purple-ghost" transform="translate(90, 5)">
                    <circle cx="0" cy="0" r="16" fill="#e0c3fc" opacity="0.3" class="glow-pulse-circle"/>
                    <path d="M -12 6 C -14 -12, 14 -12, 12 6 C 8 4, 4 8, 0 5 C -4 8, -8 4, -12 6 Z" 
                          fill="#ede4fc" stroke="#222" stroke-width="3.2"/>
                    <circle cx="-3" cy="-1" r="1.5" fill="#222"/>
                    <circle cx="4" cy="-1" r="1.5" fill="#222"/>
                    <ellipse cx="-5" cy="2" rx="1.5" ry="0.8" fill="#d2b8f7"/>
                    <ellipse cx="6" cy="2" rx="1.5" ry="0.8" fill="#d2b8f7"/>
                </g>
            </g>
        `,
        // 泡澡贝壳白熊 (海之梦)
        bear_with_shell: () => `
            <g class="topper-group bear-topper" transform="translate(125, -20)">
                <path d="M -5 18 C -12 5, -8 -15, 12 -15 C 32 -15, 38 5, 30 18 Z" 
                      fill="#ffffff" stroke="#222" stroke-width="4.2"/>
                <circle cx="-2" cy="-14" r="5" fill="#ffffff" stroke="#222" stroke-width="3.5"/>
                <circle cx="24" cy="-14" r="5" fill="#ffffff" stroke="#222" stroke-width="3.5"/>
                <circle cx="4" cy="-4" r="2.2" fill="#222"/>
                <circle cx="16" cy="-4" r="2.2" fill="#222"/>
                <ellipse cx="10" cy="0" rx="3.5" ry="2.2" fill="#222"/>
                <g class="bear-shell" transform="translate(10, 10)">
                    <path d="M -12 6 C -14 -8, 14 -8, 12 6 Z" fill="#ff9eb5" stroke="#222" stroke-width="2.8"/>
                    <line x1="0" y1="-5" x2="0" y2="5" stroke="#e06985" stroke-width="2"/>
                </g>
                <g class="bear-floating-bubbles" transform="translate(-40, -10)">
                    <circle cx="0" cy="0" r="8" fill="#9de6ff" stroke="#222" stroke-width="2.8" opacity="0.9"/>
                    <circle cx="16" cy="-8" r="6" fill="#9de6ff" stroke="#222" stroke-width="2.5" opacity="0.9"/>
                    <circle cx="26" cy="4" r="4.5" fill="#9de6ff" stroke="#222" stroke-width="2" opacity="0.9"/>
                </g>
            </g>
        `,
        // 胖胖多肉植物 (幸运盆栽)
        green_succulent: () => `
            <g class="topper-group succulent-topper" transform="translate(120, 2)">
                <g class="succulent-outer-petals">
                    <path d="M -60 12 C -80 -10, -50 -35, -25 -10 Z" fill="#9ecc65" stroke="#222" stroke-width="4.2"/>
                    <path d="M 60 12 C 80 -10, 50 -35, 25 -10 Z" fill="#9ecc65" stroke="#222" stroke-width="4.2"/>
                    <path d="M -30 22 C 0 38, 30 22, 0 10 Z" fill="#8bc34a" stroke="#222" stroke-width="4"/>
                </g>
                <g class="succulent-mid-petals">
                    <path d="M -45 -8 C -65 -30, -30 -50, -10 -20 Z" fill="#b3de78" stroke="#222" stroke-width="3.8"/>
                    <path d="M 45 -8 C 65 -30, 30 -50, 10 -20 Z" fill="#b3de78" stroke="#222" stroke-width="3.8"/>
                    <path d="M -20 -30 C 0 -60, 20 -30, 0 -15 Z" fill="#b3de78" stroke="#222" stroke-width="3.8"/>
                </g>
                <g class="succulent-inner-core">
                    <path d="M -15 -18 C -25 -32, -5 -40, 0 -22 Z" fill="#d2ed9d" stroke="#222" stroke-width="3.2"/>
                    <path d="M 15 -18 C 25 -32, 5 -40, 0 -22 Z" fill="#d2ed9d" stroke="#222" stroke-width="3.2"/>
                    <circle cx="-16" cy="-32" r="3" fill="#ff8ba0"/>
                    <circle cx="16" cy="-32" r="3" fill="#ff8ba0"/>
                    <circle cx="0" cy="-48" r="3.5" fill="#ff8ba0"/>
                </g>
            </g>
        `,
        // 🥜 碧根果坚果碎 (茶颜悦色幽兰拿铁顶饰)
        pecan_nuts: () => `
            <g class="topper-group pecan-nuts-topper" transform="translate(120, -10)">
                <!-- 坚果碎块 1 (左) -->
                <polygon points="-24,10 -16,4 -18,16 -28,14" fill="#9a3412" stroke="#431407" stroke-width="2"/>
                <circle cx="-20" cy="8" r="1.5" fill="#fdba74"/>
                <!-- 坚果碎块 2 (中主块) -->
                <polygon points="-8,2 6,-2 8,12 -6,14" fill="#78350f" stroke="#431407" stroke-width="2.2"/>
                <path d="M -4 4 Q 0 8 4 6" stroke="#fbbf24" stroke-width="1.8" fill="none"/>
                <!-- 坚果碎块 3 (右) -->
                <polygon points="18,8 28,4 26,14 16,16" fill="#9a3412" stroke="#431407" stroke-width="2"/>
                <!-- 小碎颗粒散落 -->
                <circle cx="-12" cy="18" r="2.2" fill="#b45309" stroke="#431407" stroke-width="1.2"/>
                <circle cx="12" cy="16" r="2.5" fill="#b45309" stroke="#431407" stroke-width="1.2"/>
                <circle cx="0" cy="20" r="1.8" fill="#d97706"/>
            </g>
        `,
        // 🍯 焦糖淋酱 (星巴克焦糖玛奇朵 / 喜茶黑糖波波)
        caramel_drizzle: () => `
            <g class="topper-group caramel-drizzle-topper" transform="translate(120, 10)">
                <path d="M -40 2 C -25 -10, -10 12, 5 -4 C 20 10, 35 -8, 45 4" 
                      stroke="#b45309" stroke-width="6" stroke-linecap="round" fill="none"/>
                <path d="M -40 2 C -25 -10, -10 12, 5 -4 C 20 10, 35 -8, 45 4" 
                      stroke="#f59e0b" stroke-width="3" stroke-linecap="round" fill="none"/>
                <circle cx="-8" cy="8" r="2.5" fill="#f59e0b"/>
                <circle cx="22" cy="6" r="2.2" fill="#f59e0b"/>
            </g>
        `,
        // 🌾 熟香黄豆粉 (茶百道豆乳玉麒麟)
        soybean_powder: () => `
            <g class="topper-group soybean-powder-topper" transform="translate(120, 16)">
                <!-- 一层细腻的金黄粉末 -->
                <ellipse cx="0" cy="0" rx="38" ry="12" fill="#ca8a04" opacity="0.35"/>
                <ellipse cx="0" cy="0" rx="32" ry="8" fill="#fde047" opacity="0.6"/>
                <circle cx="-25" cy="-2" r="1.8" fill="#a16207"/>
                <circle cx="-15" cy="3" r="1.5" fill="#ca8a04"/>
                <circle cx="-5" cy="-3" r="2" fill="#ca8a04"/>
                <circle cx="8" cy="2" r="1.6" fill="#a16207"/>
                <circle cx="20" cy="-2" r="2" fill="#ca8a04"/>
                <circle cx="28" cy="3" r="1.5" fill="#a16207"/>
            </g>
        `,
        // 🥀 干红玫瑰碎 (奈雪/茶颜悦色/喜茶)
        dried_rose_petals: () => `
            <g class="topper-group dried-rose-petals-topper" transform="translate(120, 8)">
                <path d="M -22 -4 C -28 4, -18 8, -14 2 Z" fill="#9f1239" stroke="#4c0519" stroke-width="1.8"/>
                <path d="M -4 -8 C -8 2, 4 6, 2 -4 Z" fill="#be123c" stroke="#4c0519" stroke-width="1.8"/>
                <path d="M 16 -6 C 12 4, 24 6, 20 -2 Z" fill="#9f1239" stroke="#4c0519" stroke-width="1.8"/>
                <circle cx="-10" cy="6" r="2.2" fill="#881337"/>
                <circle cx="10" cy="4" r="2" fill="#881337"/>
            </g>
        `,
        // 🍋 鲜切柠檬片 (挂在杯沿的一弯金黄鲜柠檬片，完美挺立在杯口以上)
        lemon_wedge: () => `
            <g class="topper-group lemon-wedge-topper" transform="translate(68, 16) rotate(-18)">
                <!-- 金黄半月柠檬果皮与白筋 (向上拱起挺立在杯口以上) -->
                <path d="M -28 0 A 28 28 0 0 0 28 0 Z" fill="#facc15" stroke="#222" stroke-width="3.2"/>
                <path d="M -24 0 A 24 24 0 0 0 24 0 Z" fill="#ffffff" opacity="0.85"/>
                <!-- 鲜亮金黄果肉扇形区 -->
                <path d="M -21 0 A 21 21 0 0 0 21 0 Z" fill="#fde047"/>
                <!-- 辐射状果肉筋脉与透光水珠 -->
                <line x1="0" y1="0" x2="-12" y2="-15" stroke="#ffffff" stroke-width="1.6"/>
                <line x1="0" y1="0" x2="0" y2="-19" stroke="#ffffff" stroke-width="1.6"/>
                <line x1="0" y1="0" x2="12" y2="-15" stroke="#ffffff" stroke-width="1.6"/>
                <circle cx="-5" cy="-9" r="1.6" fill="#ffffff" opacity="0.9"/>
                <!-- 挂在杯沿的切口小暗线 (紧扣杯沿) -->
                <line x1="0" y1="0" x2="0" y2="8" stroke="#ca8a04" stroke-width="2.5" stroke-linecap="round"/>
            </g>
        `,
        // 🧋 晶莹高透玻璃直吸管 (深入杯底，自适应各杯型物理底部不穿透)
        glass_straw: (containerBottom = 195, containerTop = 30) => {
            const strawBottom = Math.max(containerTop + 40, Math.min(containerBottom - 10, 195));
            const strawHeight = strawBottom - (-55);
            return `
            <g class="topper-group glass-straw-topper" transform="translate(142, 6) rotate(16)">
                <!-- 晶莹高透玻璃直吸管 (深入杯内深处，绝不穿透杯底) -->
                <rect x="-4.5" y="-55" width="9" height="${strawHeight}" rx="4.5" fill="#e0f2fe" opacity="0.75" stroke="#222" stroke-width="2.6"/>
                <line x1="-2" y1="-50" x2="-2" y2="${strawHeight - 65}" stroke="#ffffff" stroke-width="1.8" stroke-linecap="round" opacity="0.85"/>
                <ellipse cx="0" cy="-55" rx="4.5" ry="2" fill="#bae6fd" stroke="#222" stroke-width="1.8"/>
            </g>
            `;
        },
        // 💖 爱心吸管 (连续单根粉色吸管，左上到右下倾斜，高挺露出，光洁圆润无突刺)
        heart_straw: (containerBottom = 195, containerTop = 30) => {
            const strawBottom = Math.max(containerTop + 40, Math.min(containerBottom - 10, 195));
            const endX = (96 + (strawBottom - 18) * 0.27).toFixed(1);
            return `
            <g class="topper-group heart-straw-topper">
                <!-- 1. 深入杯底的下半截直管 (连续一根，从打结处斜插至右下(${endX}, ${strawBottom})，绝不穿透杯底) -->
                <g class="straw-lower-tube">
                    <line x1="94" y1="16" x2="${endX}" y2="${strawBottom}" stroke="#222" stroke-width="8" stroke-linecap="round"/>
                    <line x1="94" y1="16" x2="${endX}" y2="${strawBottom}" stroke="#fb7185" stroke-width="5.2" stroke-linecap="round"/>
                    <line x1="92.5" y1="16" x2="${endX - 1.5}" y2="${strawBottom - 1}" stroke="#fbcfe8" stroke-width="1.8" stroke-linecap="round" opacity="0.9"/>
                    <ellipse cx="${endX}" cy="${strawBottom}" rx="2.8" ry="1.4" fill="#fda4af" stroke="#222" stroke-width="1.4"/>
                </g>

                <!-- 2. 向左上方高高挺立探出的饮用端吸管 (连续同根管，管口高挺露出在左上方) -->
                <g class="straw-upper-tube">
                    <line x1="94" y1="18" x2="66" y2="4" stroke="#222" stroke-width="8" stroke-linecap="round"/>
                    <line x1="94" y1="18" x2="66" y2="4" stroke="#fb7185" stroke-width="5.2" stroke-linecap="round"/>
                    <line x1="93" y1="16.5" x2="67" y2="3" stroke="#fbcfe8" stroke-width="1.8" stroke-linecap="round" opacity="0.9"/>
                    <ellipse cx="66" cy="4" rx="3.2" ry="1.8" transform="rotate(-26 66 4)" fill="#fda4af" stroke="#222" stroke-width="1.6"/>
                </g>

                <!-- 3. 中间扭成的立体爱心环 (连续一根自然弯折打结，光洁饱满无任何突刺折痕) -->
                <g class="straw-heart-loop">
                    <!-- 爱心黑边底模 -->
                    <path d="M 94 18 C 76 6, 68 -12, 68 -24 C 68 -38, 84 -40, 94 -26 C 104 -40, 120 -38, 120 -24 C 120 -12, 112 6, 94 18 Z" 
                          fill="none" stroke="#222" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"/>
                    <!-- 爱心粉色管身 -->
                    <path d="M 94 18 C 76 6, 68 -12, 68 -24 C 68 -38, 84 -40, 94 -26 C 104 -40, 120 -38, 120 -24 C 120 -12, 112 6, 94 18 Z" 
                          fill="none" stroke="#fb7185" stroke-width="5.2" stroke-linecap="round" stroke-linejoin="round"/>
                    <!-- 爱心通透内侧粉白高光线 -->
                    <path d="M 94 18 C 76 6, 68 -12, 68 -24 C 68 -38, 84 -40, 94 -26 C 104 -40, 120 -38, 120 -24 C 120 -12, 112 6, 94 18 Z" 
                          fill="none" stroke="#fbcfe8" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" opacity="0.9"/>

                    <!-- 4. 晶莹树脂/塑料质感柔和圆弧高光 (完全内嵌，绝不刺破管身) -->
                    <!-- 左瓣拱顶亮光 -->
                    <path d="M 74 -26 C 74 -35, 84 -37, 91 -28" stroke="#ffffff" stroke-width="1.8" stroke-linecap="round" fill="none" opacity="0.85"/>
                    <!-- 右瓣拱顶亮光 -->
                    <path d="M 97 -28 C 104 -37, 114 -35, 114 -26" stroke="#ffffff" stroke-width="1.8" stroke-linecap="round" fill="none" opacity="0.85"/>
                    <!-- 左侧外沿通透光影 -->
                    <path d="M 70 -16 C 70 -8, 76 2, 88 12" stroke="#ffffff" stroke-width="1.4" stroke-linecap="round" fill="none" opacity="0.6"/>
                </g>
            </g>
            `;
        },
        // 🌿 鲜薄荷叶 (带着晶莹露珠的清新双生薄荷叶)
        fresh_mint: () => `
            <g class="topper-group fresh-mint-topper" transform="translate(110, 16)">
                <!-- 双生清新薄荷叶与晶莹露珠 -->
                <path d="M 0 4 C -24 -4, -26 -26, 0 -32 C -5 -18, 0 -4, 0 4 Z" fill="#4ade80" stroke="#222" stroke-width="2.6"/>
                <path d="M 0 4 C -14 -8, -15 -22, 0 -32" stroke="#16a34a" stroke-width="1.6" fill="none"/>
                <path d="M 0 4 C 24 -4, 26 -26, 0 -32 C 5 -18, 0 -4, 0 4 Z" fill="#22c55e" stroke="#222" stroke-width="2.6"/>
                <path d="M 0 4 C 14 -8, 15 -22, 0 -32" stroke="#15803d" stroke-width="1.6" fill="none"/>
                <circle cx="-9" cy="-16" r="1.8" fill="#ffffff" opacity="0.85"/>
                <circle cx="7" cy="-12" r="1.5" fill="#ffffff" opacity="0.85"/>
            </g>
        `,
        // 🍒 晶红车厘子 (鲜红欲滴带翠绿果梗的双生小樱桃)
        ruby_cherry: () => `
            <g class="topper-group ruby-cherry-topper" transform="translate(118, 16)">
                <!-- 鲜亮双生车厘子果梗与果实 -->
                <path d="M 0 -35 C -5 -18, -16 -6, -12 6" stroke="#15803d" stroke-width="2.4" stroke-linecap="round" fill="none"/>
                <path d="M 0 -35 C 7 -18, 15 -6, 11 8" stroke="#15803d" stroke-width="2.4" stroke-linecap="round" fill="none"/>
                <!-- 车厘子 1 (左) -->
                <circle cx="-13" cy="6" r="10" fill="#e11d48" stroke="#222" stroke-width="2.6"/>
                <circle cx="-16" cy="3" r="2.5" fill="#ffffff" opacity="0.85"/>
                <!-- 车厘子 2 (右) -->
                <circle cx="11" cy="8" r="11" fill="#be123c" stroke="#222" stroke-width="2.6"/>
                <circle cx="8" cy="4" r="2.8" fill="#ffffff" opacity="0.85"/>
            </g>
        `,
        // 🧇 焦糖脆饼 (金黄酥脆的迷你手作华夫焦糖脆饼)
        biscuit_waffle: () => `
            <g class="topper-group biscuit-waffle-topper" transform="translate(140, 14) rotate(18)">
                <rect x="-16" y="-16" width="32" height="32" rx="5" fill="#f59e0b" stroke="#222" stroke-width="2.8"/>
                <rect x="-11" y="-11" width="9" height="9" rx="2" fill="#d97706" stroke="#92400e" stroke-width="1.2"/>
                <rect x="2" y="-11" width="9" height="9" rx="2" fill="#d97706" stroke="#92400e" stroke-width="1.2"/>
                <rect x="-11" y="2" width="9" height="9" rx="2" fill="#d97706" stroke="#92400e" stroke-width="1.2"/>
                <rect x="2" y="2" width="9" height="9" rx="2" fill="#d97706" stroke="#92400e" stroke-width="1.2"/>
                <path d="M -14 -14 L 14 14" stroke="#ffffff" stroke-width="1.6" opacity="0.4"/>
            </g>
        `,
        // ⛱️ 小黄遮阳伞 (度假海滩经典鸡尾酒折叠迷你纸伞)
        paper_umbrella: () => `
            <g class="topper-group paper-umbrella-topper" transform="translate(86, 8) rotate(-14)">
                <line x1="0" y1="18" x2="0" y2="-22" stroke="#a16207" stroke-width="2.8" stroke-linecap="round"/>
                <path d="M -28 -12 Q 0 -38 28 -12 Q 16 -15 5 -12 Q -5 -15 -16 -12 Z" fill="#fde047" stroke="#222" stroke-width="2.6"/>
                <line x1="0" y1="-30" x2="-16" y2="-12" stroke="#ea580c" stroke-width="1.5"/>
                <line x1="0" y1="-30" x2="0" y2="-12" stroke="#ea580c" stroke-width="1.5"/>
                <line x1="0" y1="-30" x2="16" y2="-12" stroke="#ea580c" stroke-width="1.5"/>
                <circle cx="0" cy="-31" r="2.2" fill="#f97316" stroke="#222" stroke-width="1.4"/>
            </g>
        `,
        // 🍡 炙烤棉花糖串 (微焦拉丝的竹签手串软糯棉花糖)
        marshmallow_skewer: () => `
            <g class="topper-group marshmallow-skewer-topper" transform="translate(134, 10) rotate(22)">
                <line x1="0" y1="26" x2="0" y2="-42" stroke="#ca8a04" stroke-width="2.4" stroke-linecap="round"/>
                <rect x="-8" y="-38" width="16" height="13" rx="3.5" fill="#fffbeb" stroke="#222" stroke-width="2"/>
                <line x1="-4" y1="-32" x2="4" y2="-32" stroke="#b45309" stroke-width="1.8" stroke-linecap="round" opacity="0.8"/>
                <rect x="-8" y="-21" width="16" height="13" rx="3.5" fill="#fef3c7" stroke="#222" stroke-width="2"/>
                <line x1="-4" y1="-15" x2="4" y2="-15" stroke="#b45309" stroke-width="1.8" stroke-linecap="round" opacity="0.8"/>
                <rect x="-8" y="-4" width="16" height="13" rx="3.5" fill="#fffbeb" stroke="#222" stroke-width="2"/>
                <line x1="-4" y1="2" x2="4" y2="2" stroke="#b45309" stroke-width="1.8" stroke-linecap="round" opacity="0.8"/>
            </g>
        `,
        // 🍭 彩虹波板糖 (梦幻旋转彩虹漩涡大棒棒糖，纯白细糖棍显著加长深入杯内，图层位于杯身和奶盖后方)
        rainbow_lollipop: () => `
            <g class="topper-group rainbow-lollipop-topper" transform="translate(108, -32) rotate(15)">
                <!-- 1. 加长纯白细糖棍 (深入杯身深处，扎实圆润) -->
                <rect x="-3.5" y="16" width="7" height="115" rx="3.5" fill="#f8fafc" stroke="#222" stroke-width="3.2" stroke-linecap="round"/>
                <line x1="-1" y1="20" x2="-1" y2="125" stroke="#ffffff" stroke-width="2" stroke-linecap="round"/>

                <!-- 2. 俏皮亮黄色丝带蝴蝶结 (带飘带) -->
                <g class="lollipop-bow" transform="translate(0, 22)">
                    <path d="M -2 4 C -6 12, -14 18, -12 24 C -9 20, -4 14, 0 6 Z" fill="#fbbf24" stroke="#222" stroke-width="1.8" stroke-linejoin="round"/>
                    <path d="M 2 4 C 6 12, 14 18, 12 24 C 9 20, 4 14, 0 6 Z" fill="#fbbf24" stroke="#222" stroke-width="1.8" stroke-linejoin="round"/>
                    <ellipse cx="-8" cy="0" rx="7" ry="5" fill="#fde047" stroke="#222" stroke-width="2" transform="rotate(-15 -8 0)"/>
                    <ellipse cx="8" cy="0" rx="7" ry="5" fill="#fde047" stroke="#222" stroke-width="2" transform="rotate(15 8 0)"/>
                    <circle cx="0" cy="0" r="3.2" fill="#f59e0b" stroke="#222" stroke-width="1.8"/>
                </g>

                <!-- 3. 经典六彩旋转漩涡大波板糖圆盘 (R=26) -->
                <g class="lollipop-candy-disk">
                    <circle cx="0" cy="0" r="26" fill="#ffffff" stroke="#222" stroke-width="4.5"/>
                    <!-- 炫彩螺旋花纹 (红、橙、黄、绿、青蓝、紫六色相间旋转) -->
                    <path d="M 0 0 C -12 8, -24 -2, -26 0 A 26 26 0 0 1 -18 -18 C -14 -10, -6 -2, 0 0 Z" fill="#ef4444"/>
                    <path d="M 0 0 C -6 -12, 2 -24, 0 -26 A 26 26 0 0 1 18 -18 C 10 -14, 2 -6, 0 0 Z" fill="#f97316"/>
                    <path d="M 0 0 C 12 -6, 24 2, 26 0 A 26 26 0 0 1 18 18 C 14 10, 6 2, 0 0 Z" fill="#facc15"/>
                    <path d="M 0 0 C 6 12, -2 24, 0 26 A 26 26 0 0 1 -18 18 C -10 14, -2 6, 0 0 Z" fill="#22c55e"/>
                    <path d="M 0 0 C -10 10, -22 14, -25 7 A 26 26 0 0 1 -25 -7 C -16 -4, -6 2, 0 0 Z" fill="#06b6d4"/>
                    <path d="M 0 0 C 10 -10, 22 -14, 25 -7 A 26 26 0 0 1 25 7 C 16 4, 6 -2, 0 0 Z" fill="#a855f7"/>

                    <!-- 4. 旋转漩涡线条勾勒 -->
                    <path d="M 0 0 C -12 8, -24 -2, -26 0" stroke="#222" stroke-width="2.2" stroke-linecap="round" fill="none"/>
                    <path d="M 0 0 C -6 -12, 2 -24, 0 -26" stroke="#222" stroke-width="2.2" stroke-linecap="round" fill="none"/>
                    <path d="M 0 0 C 12 -6, 24 2, 26 0" stroke="#222" stroke-width="2.2" stroke-linecap="round" fill="none"/>
                    <path d="M 0 0 C 6 12, -2 24, 0 26" stroke="#222" stroke-width="2.2" stroke-linecap="round" fill="none"/>
                    <circle cx="0" cy="0" r="26" fill="none" stroke="#222" stroke-width="4.2"/>

                    <!-- 5. 晶莹玻璃糖衣高光弧 (营造晶亮反光) -->
                    <path d="M -16 -18 A 22 22 0 0 1 18 -14" stroke="#ffffff" stroke-width="3.5" stroke-linecap="round" fill="none" opacity="0.8"/>
                    <circle cx="-19" cy="-7" r="2.2" fill="#ffffff" opacity="0.85"/>
                    <circle cx="0" cy="0" r="3.5" fill="#ffffff" stroke="#222" stroke-width="1.8"/>
                </g>
            </g>
        `,
        // ❄️ 冰雪晶花 (摩羯座与冰雪奇缘艾莎女王专属：晶莹剔透的高光六角对称手绘冰晶雪花)
        ice_snowflake: () => `
            <g class="topper-group ice-snowflake-topper" transform="translate(120, 6)">
                <!-- 1. 冰雪微光外晕环 -->
                <circle cx="0" cy="0" r="28" fill="#38bdf8" opacity="0.18" class="glow-pulse-circle"/>
                <circle cx="0" cy="0" r="18" fill="#e0f2fe" opacity="0.35"/>

                <!-- 2. 六角冰晶主干与对称分枝 (利用旋转绘制6个对称分支) -->
                ${[0, 60, 120, 180, 240, 300].map(deg => `
                    <g transform="rotate(${deg})">
                        <!-- 主冰柱 (长 26px) -->
                        <line x1="0" y1="0" x2="0" y2="-25" stroke="#222" stroke-width="3" stroke-linecap="round"/>
                        <line x1="0" y1="0" x2="0" y2="-25" stroke="#bae6fd" stroke-width="1.8" stroke-linecap="round"/>
                        
                        <!-- 顶端菱形冰晶尖峰 -->
                        <polygon points="0,-29 3.5,-23 0,-21 -3.5,-23" fill="#e0f2fe" stroke="#222" stroke-width="1.5"/>
                        <polygon points="0,-28 2.2,-23 0,-22 -2.2,-23" fill="#ffffff"/>

                        <!-- 外侧羽状对称冰刺 (离中心约 16px 处) -->
                        <line x1="0" y1="-16" x2="-7" y2="-21" stroke="#222" stroke-width="2.2" stroke-linecap="round"/>
                        <line x1="0" y1="-16" x2="-7" y2="-21" stroke="#38bdf8" stroke-width="1.4" stroke-linecap="round"/>
                        <line x1="0" y1="-16" x2="7" y2="-21" stroke="#222" stroke-width="2.2" stroke-linecap="round"/>
                        <line x1="0" y1="-16" x2="7" y2="-21" stroke="#38bdf8" stroke-width="1.4" stroke-linecap="round"/>

                        <!-- 内侧小对称冰刺 (离中心约 9px 处) -->
                        <line x1="0" y1="-9" x2="-5" y2="-13" stroke="#222" stroke-width="2" stroke-linecap="round"/>
                        <line x1="0" y1="-9" x2="-5" y2="-13" stroke="#e0f2fe" stroke-width="1.2" stroke-linecap="round"/>
                        <line x1="0" y1="-9" x2="5" y2="-13" stroke="#222" stroke-width="2" stroke-linecap="round"/>
                        <line x1="0" y1="-9" x2="5" y2="-13" stroke="#e0f2fe" stroke-width="1.2" stroke-linecap="round"/>
                    </g>
                `).join("")}

                <!-- 3. 中心正六边形晶核 -->
                <polygon points="0,-7 6,-3.5 6,3.5 0,7 -6,3.5 -6,-3.5" fill="#bae6fd" stroke="#222" stroke-width="2"/>
                <polygon points="0,-5 4.2,-2.5 4.2,2.5 0,5 -4.2,2.5 -4.2,-2.5" fill="#ffffff"/>

                <!-- 4. 中心璀璨反光星点 -->
                <circle cx="0" cy="0" r="2" fill="#38bdf8"/>
                <circle cx="-1.5" cy="-1.5" r="1.2" fill="#ffffff"/>
            </g>
        `,
        // 🏹 烈焰金弓箭 (白羊座与勇敢传说梅莉达专属：火焰中搭着金色锐箭的长弓)
        blazing_bow: () => `
            <g class="topper-group blazing-bow-topper" transform="translate(120, 6)">
                <!-- 熊熊燃烧的红橙外层火焰 -->
                <path d="M -45 10 C -55 -15, -35 -25, -25 -42 C -18 -30, -5 -25, -8 -45 C 5 -30, 20 -20, 12 -42 C 25 -32, 45 -18, 42 10 Z" 
                      fill="#ef4444" stroke="#222" stroke-width="3" stroke-linejoin="round"/>
                <!-- 内层明亮金黄火焰 -->
                <path d="M -30 10 C -36 -8, -24 -18, -16 -30 C -10 -20, 0 -18, -2 -34 C 8 -22, 18 -15, 12 -30 C 20 -22, 32 -10, 28 10 Z" 
                      fill="#facc15" opacity="0.9"/>
                <!-- 中央金色长弓 (弧形金色弓臂) -->
                <path d="M -36 -2 C -24 -28, 20 -28, 38 -2" stroke="#ca8a04" stroke-width="6" stroke-linecap="round" fill="none"/>
                <path d="M -36 -2 C -24 -28, 20 -28, 38 -2" stroke="#222" stroke-width="2.2" stroke-linecap="round" fill="none"/>
                <!-- 纯白坚韧弓弦 -->
                <line x1="-36" y1="-2" x2="38" y2="-2" stroke="#ffffff" stroke-width="2.2"/>
                <!-- 搭在弦上的金色锐箭 (斜向右上贯穿飞出) -->
                <g transform="rotate(-28 0 -2)">
                    <line x1="-32" y1="-2" x2="38" y2="-2" stroke="#fef08a" stroke-width="3.5" stroke-linecap="round"/>
                    <line x1="-32" y1="-2" x2="38" y2="-2" stroke="#222" stroke-width="1.8" stroke-linecap="round"/>
                    <!-- 锐利金箭头 -->
                    <polygon points="42,-2 32,-7 34,-2 32,3" fill="#facc15" stroke="#222" stroke-width="1.8"/>
                    <!-- 箭尾羽翎 -->
                    <polygon points="-32,-2 -26,-7 -22,-2 -26,3" fill="#ef4444" stroke="#222" stroke-width="1.6"/>
                </g>
            </g>
        `,
        // 🌹 玻璃罩红玫瑰与古籍 (金牛座与美女与野兽贝儿专属：晶莹透明钟罩下盛开的红玫瑰与深棕皮面古典书)
        rose_cloche: () => `
            <g class="topper-group rose-cloche-topper" transform="translate(120, 2)">
                <!-- 右侧古典精装书 (斜放) -->
                <g transform="translate(28, 12) rotate(14)">
                    <rect x="-18" y="-7" width="36" height="14" rx="2.5" fill="#78350f" stroke="#222" stroke-width="2.4"/>
                    <!-- 书页金边 -->
                    <rect x="-16" y="-5" width="32" height="10" fill="#fefce8"/>
                    <line x1="-16" y1="0" x2="16" y2="0" stroke="#ca8a04" stroke-width="1.2"/>
                </g>
                <!-- 玫瑰花枝与花瓣 (置于罩内) -->
                <g transform="translate(-8, 4)">
                    <!-- 翠绿花茎与小刺叶 -->
                    <path d="M 0 14 Q 3 2 0 -8" stroke="#15803d" stroke-width="3" fill="none"/>
                    <path d="M 2 2 Q 8 0 8 -4 Q 4 -2 2 2 Z" fill="#22c55e" stroke="#222" stroke-width="1.5"/>
                    <!-- 娇艳盛开大红玫瑰 -->
                    <circle cx="0" cy="-10" r="10" fill="#dc2626" stroke="#222" stroke-width="2.4"/>
                    <path d="M -5 -13 C -2 -17, 4 -17, 6 -12 C 8 -7, 2 -3, -3 -4 Z" fill="#991b1b" stroke="#222" stroke-width="1.6"/>
                    <circle cx="-1" cy="-9" r="1.8" fill="#fca5a5"/>
                </g>
                <!-- 晶莹半球形玻璃钟罩 (Cloche) -->
                <g transform="translate(-8, 8)">
                    <!-- 钟罩顶金提手圆珠 -->
                    <circle cx="0" cy="-32" r="4" fill="#facc15" stroke="#222" stroke-width="2"/>
                    <!-- 玻璃罩拱形主体 -->
                    <path d="M -18 8 L -18 -18 C -18 -32, 18 -32, 18 -18 L 18 8 Z" 
                          fill="#bae6fd" opacity="0.4" stroke="#222" stroke-width="2.6"/>
                    <!-- 玻璃罩反光高光弧 -->
                    <path d="M -13 4 L -13 -16 C -13 -26, 0 -28, 6 -28" stroke="#ffffff" stroke-width="3.5" stroke-linecap="round" fill="none" opacity="0.85"/>
                    <!-- 底座木托盘 -->
                    <ellipse cx="0" cy="8" rx="22" ry="5" fill="#ca8a04" stroke="#222" stroke-width="2.4"/>
                </g>
            </g>
        `,
        // 🐰 探头白兔与叠放茶杯 (双子座与爱丽丝茶会专属：萌萌白兔双耳与倾斜碎花迷你小茶杯)
        bunny_and_teacups: () => `
            <g class="topper-group bunny-teacups-topper" transform="translate(120, 6)">
                <!-- 左侧：探头萌萌小白兔 -->
                <g transform="translate(-24, 0)">
                    <!-- 白兔圆圆脑袋 -->
                    <ellipse cx="0" cy="4" rx="14" ry="11" fill="#ffffff" stroke="#222" stroke-width="2.8"/>
                    <!-- 左兔耳 (微弯) -->
                    <path d="M -8 -4 C -18 -20, -18 -38, -8 -42 C -2 -42, 0 -22, -2 -4 Z" fill="#ffffff" stroke="#222" stroke-width="2.6"/>
                    <path d="M -8 -8 C -14 -20, -14 -34, -8 -36 C -4 -36, -3 -22, -4 -8 Z" fill="#fbcfe8"/>
                    <!-- 右兔耳 -->
                    <path d="M 2 -4 C 2 -22, 6 -40, 12 -40 C 18 -38, 14 -20, 6 -4 Z" fill="#ffffff" stroke="#222" stroke-width="2.6"/>
                    <path d="M 4 -8 C 4 -20, 8 -34, 12 -34 C 14 -32, 12 -20, 6 -8 Z" fill="#fbcfe8"/>
                    <!-- 萌萌小黑眼与粉小鼻 -->
                    <circle cx="-4" cy="2" r="1.8" fill="#1e1e1e"/>
                    <circle cx="4" cy="2" r="1.8" fill="#1e1e1e"/>
                    <polygon points="0,5 -2,7 2,7" fill="#f43f5e"/>
                    <circle cx="-8" cy="6" r="2.2" fill="#fb7185" opacity="0.5"/>
                    <circle cx="8" cy="6" r="2.2" fill="#fb7185" opacity="0.5"/>
                </g>
                <!-- 右侧：倾斜叠放迷你印花茶杯 -->
                <g transform="translate(22, -10) rotate(18)">
                    <!-- 下层托碟 -->
                    <ellipse cx="0" cy="14" rx="18" ry="4.5" fill="#fbcfe8" stroke="#222" stroke-width="2.4"/>
                    <!-- 叠放的小茶杯 -->
                    <path d="M -12 -4 C -10 10, 10 10, 12 -4 Z" fill="#e0f2fe" stroke="#222" stroke-width="2.6"/>
                    <ellipse cx="0" cy="-4" rx="12" ry="3.5" fill="#bae6fd" stroke="#222" stroke-width="2"/>
                    <!-- 茶杯手柄 -->
                    <path d="M 12 0 C 18 0, 18 8, 10 8" stroke="#222" stroke-width="2.2" fill="none"/>
                    <!-- 碎花图案 -->
                    <circle cx="-2" cy="3" r="2.2" fill="#f43f5e"/>
                    <circle cx="-2" cy="3" r="0.8" fill="#fef08a"/>
                </g>
            </g>
        `,
        // 🧜‍♀️ 探水人鱼尾 (巨蟹座与小美人鱼爱丽儿专属：青翠微光探水美人鱼尾与贝壳胸衣饰物)
        mermaid_tail: () => `
            <g class="topper-group mermaid-tail-topper" transform="translate(120, 4)">
                <!-- 水面激起浪花沫圈 -->
                <ellipse cx="0" cy="14" rx="36" ry="7" fill="#bae6fd" opacity="0.65" stroke="#222" stroke-width="2.4"/>
                
                <!-- 美人鱼尾巴主体 (优雅弯曲翘出水面) -->
                <g transform="translate(8, 0)">
                    <!-- 鱼尾身躯 -->
                    <path d="M -16 12 C -18 -8, -12 -28, 2 -40 C 8 -30, 4 -10, 0 12 Z" 
                          fill="#34d399" stroke="#222" stroke-width="3" stroke-linejoin="round"/>
                    <!-- 鱼鳞细致光泽 -->
                    <path d="M -10 -6 C -6 -10, 0 -6, 2 -8 M -8 -18 C -4 -22, 2 -18, 4 -20" stroke="#059669" stroke-width="1.8" stroke-linecap="round" fill="none"/>
                    <!-- 优美双裂展开大尾鳍 -->
                    <g transform="translate(2, -40)">
                        <!-- 左尾鳍 -->
                        <path d="M 0 0 C -12 -12, -24 -8, -26 4 C -20 6, -10 2, 0 0 Z" fill="#6ee7b7" stroke="#222" stroke-width="2.6"/>
                        <path d="M -2 0 C -10 -6, -18 -4, -20 2" stroke="#059669" stroke-width="1.4" fill="none"/>
                        <!-- 右尾鳍 (翘向天空) -->
                        <path d="M 0 0 C 8 -16, 22 -14, 26 -2 C 18 2, 8 0, 0 0 Z" fill="#6ee7b7" stroke="#222" stroke-width="2.6"/>
                        <path d="M 2 0 C 8 -8, 16 -6, 18 -2" stroke="#059669" stroke-width="1.4" fill="none"/>
                        <!-- 尾鳍相交处高光小珍珠 -->
                        <circle cx="0" cy="0" r="2.5" fill="#ffffff" stroke="#222" stroke-width="1.4"/>
                    </g>
                </g>
                <!-- 左侧紫色贝壳胸衣饰物 -->
                <g transform="translate(-24, 6)">
                    <circle cx="0" cy="0" r="7" fill="#c084fc" stroke="#222" stroke-width="2.2"/>
                    <path d="M -4 -2 L 4 -2 M -5 2 L 5 2" stroke="#9333ea" stroke-width="1.4"/>
                </g>
                <!-- 晶莹小水珠 -->
                <circle cx="28" cy="-18" r="2.5" fill="#ffffff" opacity="0.8"/>
                <circle cx="-12" cy="-22" r="2" fill="#ffffff" opacity="0.8"/>
            </g>
        `,
        // 👑 金鬃焦糖雪顶与皇冠 (狮子座与狮子王辛巴专属：蓬松雄狮鬃毛奶盖与纯金璀璨王冠)
        lion_crown: () => `
            <g class="topper-group lion-crown-topper" transform="translate(120, 0)">
                <!-- 蓬松焦糖雄狮金鬃奶盖 (多层起伏云团) -->
                <path d="M -48 16 
                         C -58 6, -56 -10, -42 -14 
                         C -40 -26, -20 -28, -8 -22 
                         C 0 -30, 24 -30, 32 -20 
                         C 46 -24, 58 -8, 52 6 
                         C 60 16, 48 24, 38 22 
                         C 20 25, -20 25, -48 16 Z" 
                      fill="#f59e0b" stroke="#222" stroke-width="3.5" stroke-linejoin="round"/>
                <!-- 鬃毛浅金焦糖色高光起伏 -->
                <path d="M -36 10 C -42 0, -32 -10, -18 -8 C -6 -16, 16 -16, 24 -8 C 36 -6, 42 6, 34 14" 
                      stroke="#fde047" stroke-width="3" stroke-linecap="round" fill="none" opacity="0.85"/>
                
                <!-- 端正戴在中央的纯金五峰皇冠 -->
                <g transform="translate(14, -28) rotate(12)">
                    <!-- 皇冠主体 (五峰锯齿金冠) -->
                    <polygon points="-18,12 18,12 18,0 12,-10 6,-3 0,-14 -6,-3 -12,-10 -18,0" 
                             fill="#facc15" stroke="#222" stroke-width="2.6" stroke-linejoin="round"/>
                    <!-- 皇冠底带与宝石 -->
                    <rect x="-18" y="8" width="36" height="5" fill="#eab308" stroke="#222" stroke-width="1.8"/>
                    <circle cx="0" cy="10" r="1.8" fill="#ef4444"/>
                    <circle cx="-10" cy="10" r="1.5" fill="#3b82f6"/>
                    <circle cx="10" cy="10" r="1.5" fill="#3b82f6"/>
                    <!-- 冠顶五颗红宝圆珠 -->
                    <circle cx="-18" cy="0" r="1.8" fill="#ef4444"/>
                    <circle cx="-12" cy="-10" r="1.8" fill="#fde047"/>
                    <circle cx="0" cy="-14" r="2.4" fill="#ef4444" stroke="#222" stroke-width="1.2"/>
                    <circle cx="12" cy="-10" r="1.8" fill="#fde047"/>
                    <circle cx="18" cy="0" r="1.8" fill="#ef4444"/>
                </g>
            </g>
        `,
        // 🍎 雪顶红苹果与红蝴蝶结 (处女座与白雪公主专属：大红鲜苹果、白色苹果花与鲜红波点大蝴蝶结)
        apple_flower_bow: () => `
            <g class="topper-group apple-flower-bow-topper" transform="translate(120, 2)">
                <!-- 纯白初雪奶油雪顶底衬 -->
                <path d="M -45 16 C -50 8, -42 0, -32 2 C -24 -6, -6 -6, 0 2 C 10 -6, 28 -4, 34 4 C 44 2, 48 12, 44 18 Z" 
                      fill="#ffffff" stroke="#222" stroke-width="2.8" stroke-linejoin="round"/>
                
                <!-- 中央大红饱满鲜苹果 -->
                <g transform="translate(6, -14)">
                    <circle cx="-7" cy="0" r="14" fill="#ef4444"/>
                    <circle cx="7" cy="0" r="14" fill="#dc2626"/>
                    <path d="M -16 6 C -18 -8, -6 -14, 0 -8 C 6 -14, 18 -8, 16 6 C 14 16, -14 16, -16 6 Z" 
                          fill="#ef4444" stroke="#222" stroke-width="2.8" stroke-linejoin="round"/>
                    <!-- 苹果翠绿小叶片与深棕果梗 -->
                    <path d="M 0 -8 Q 3 -16 6 -20" stroke="#78350f" stroke-width="2.5" stroke-linecap="round" fill="none"/>
                    <path d="M 2 -14 C 8 -18, 14 -16, 12 -12 C 8 -10, 4 -12, 2 -14 Z" fill="#22c55e" stroke="#222" stroke-width="1.5"/>
                    <!-- 苹果高光弧 -->
                    <path d="M -9 -4 A 9 9 0 0 1 -3 -9" stroke="#ffffff" stroke-width="2.4" stroke-linecap="round" fill="none" opacity="0.85"/>
                </g>
                <!-- 左侧纯白苹果小花朵 -->
                <g transform="translate(-28, 2)">
                    <circle cx="0" cy="0" r="3" fill="#facc15"/>
                    ${[0, 72, 144, 216, 288].map(deg => `
                        <circle cx="${6 * Math.cos(deg * Math.PI / 180)}" cy="${6 * Math.sin(deg * Math.PI / 180)}" r="4" fill="#ffffff" stroke="#222" stroke-width="1.4"/>
                    `).join("")}
                    <circle cx="0" cy="0" r="2.5" fill="#fde047" stroke="#222" stroke-width="1.2"/>
                </g>
                <!-- 右侧鲜红波点大蝴蝶结 (系在杯沿旁) -->
                <g transform="translate(32, 2) rotate(10)">
                    <!-- 左翅 -->
                    <polygon points="0,0 -12,-8 -10,8" fill="#ef4444" stroke="#222" stroke-width="2"/>
                    <circle cx="-6" cy="0" r="1.5" fill="#ffffff"/>
                    <!-- 右翅 -->
                    <polygon points="0,0 12,-8 10,8" fill="#ef4444" stroke="#222" stroke-width="2"/>
                    <circle cx="6" cy="0" r="1.5" fill="#ffffff"/>
                    <!-- 蝴蝶结中心纽扣 -->
                    <circle cx="0" cy="0" r="3.5" fill="#dc2626" stroke="#222" stroke-width="1.8"/>
                    <circle cx="0" cy="0" r="1.2" fill="#ffffff"/>
                </g>
            </g>
        `,
        // 👑 晨曦皇冠与飞舞花瓣 (天秤座与睡美人爱洛专属：悬浮小金冠与漫天纷飞玫瑰花瓣)
        tiara_and_petals: () => `
            <g class="topper-group tiara-petals-topper" transform="translate(120, 2)">
                <!-- 中央悬浮睡美人金色小王冠 -->
                <g transform="translate(0, -6)">
                    <polygon points="-16,8 16,8 14,-2 8,-8 0,-2 -8,-8 -14,-2" 
                             fill="#facc15" stroke="#222" stroke-width="2.5" stroke-linejoin="round"/>
                    <!-- 王冠底边弧与心形粉钻 -->
                    <path d="M -16 8 Q 0 12 16 8" stroke="#ca8a04" stroke-width="2" fill="none"/>
                    <circle cx="0" cy="4" r="2" fill="#f43f5e"/>
                    <circle cx="-8" cy="-8" r="1.5" fill="#fde047"/>
                    <circle cx="0" cy="-2" r="1.5" fill="#fde047"/>
                    <circle cx="8" cy="-8" r="1.5" fill="#fde047"/>
                </g>
                <!-- 漫天轻扬飘落的粉色玫瑰花瓣 -->
                <path d="M -28 -14 C -34 -20, -32 -26, -26 -24 C -20 -22, -22 -16, -28 -14 Z" fill="#fda4af" stroke="#222" stroke-width="1.8"/>
                <path d="M 26 -16 C 32 -10, 36 -16, 32 -22 C 26 -24, 24 -18, 26 -16 Z" fill="#fb7185" stroke="#222" stroke-width="1.8"/>
                <path d="M 24 10 C 30 8, 28 14, 22 16 C 18 16, 20 10, 24 10 Z" fill="#f43f5e" stroke="#222" stroke-width="1.6"/>
                <path d="M -24 8 C -30 6, -28 12, -22 14 C -18 14, -20 8, -24 8 Z" fill="#fda4af" stroke="#222" stroke-width="1.6"/>
            </g>
        `,
        // 🦹‍♀️ 黑魔女双角与绿魔杖 (天蝎座与玛瑟菲森特专属：黑色扭曲恶魔双角与幽绿发光魔杖)
        horns_and_scepter: () => `
            <g class="topper-group horns-scepter-topper" transform="translate(120, 6)">
                <!-- 幽绿魔焰底光云雾 -->
                <ellipse cx="0" cy="10" rx="38" ry="7" fill="#4ade80" opacity="0.3" class="glow-pulse-circle"/>

                <!-- 黑色恶魔左双角 (向左外弯卷曲尖锐) -->
                <path d="M -6 10 C -12 2, -18 -12, -28 -22 C -38 -32, -32 -48, -24 -48 C -24 -36, -14 -22, 2 6 Z" 
                      fill="#1e1328" stroke="#222" stroke-width="3" stroke-linejoin="round"/>
                <!-- 黑色恶魔右双角 (向右外弯卷曲尖锐) -->
                <path d="M 6 10 C 12 2, 18 -12, 28 -22 C 38 -32, 32 -48, 24 -48 C 24 -36, 14 -22, -2 6 Z" 
                      fill="#1e1328" stroke="#222" stroke-width="3" stroke-linejoin="round"/>
                <!-- 角身螺纹细线 -->
                <path d="M -18 -18 C -14 -20, -10 -16, -10 -14 M -26 -30 C -22 -32, -18 -28, -18 -26" stroke="#4c1d95" stroke-width="1.8" fill="none"/>
                <path d="M 18 -18 C 14 -20, 10 -16, 10 -14 M 26 -30 C 22 -32, 18 -28, 18 -26" stroke="#4c1d95" stroke-width="1.8" fill="none"/>

                <!-- 右侧黑金魔法权杖 (顶端镶嵌幽绿魔球) -->
                <g transform="translate(34, -14) rotate(16)">
                    <!-- 权杖黑杖身 -->
                    <line x1="0" y1="24" x2="0" y2="-12" stroke="#222" stroke-width="3.5" stroke-linecap="round"/>
                    <line x1="0" y1="24" x2="0" y2="-12" stroke="#ca8a04" stroke-width="1.8" stroke-linecap="round"/>
                    <!-- 权杖爪形托座 -->
                    <path d="M -6 -10 C -6 -16, 6 -16, 6 -10" stroke="#ca8a04" stroke-width="2.5" fill="none"/>
                    <!-- 顶端幽绿发光魔珠 (大光晕 + 发光球) -->
                    <circle cx="0" cy="-18" r="9" fill="#22c55e" opacity="0.35" class="glow-pulse-circle"/>
                    <circle cx="0" cy="-18" r="6" fill="#86efac" stroke="#222" stroke-width="2"/>
                    <circle cx="-1.5" cy="-19.5" r="1.8" fill="#ffffff"/>
                </g>
            </g>
        `,
        // 🧞 阿拉丁神灯与云月 (射手座与阿拉丁专属：纯金神灯、喷吐蓝烟与金色月牙)
        genie_lamp_moon: () => `
            <g class="topper-group genie-lamp-moon-topper" transform="translate(120, 0)">
                <!-- 天际金色月牙 (左上方) -->
                <g transform="translate(-10, -28)">
                    <path d="M -8 14 A 12 12 0 0 0 10 -4 A 14 14 0 0 1 -8 14 Z" fill="#fde047" stroke="#222" stroke-width="2"/>
                    <circle cx="16" cy="-2" r="1.5" fill="#fde047"/>
                </g>

                <!-- 纯金阿拉丁神灯 (壶身、长壶嘴与金色把手) -->
                <g transform="translate(18, -4)">
                    <!-- 纯金神灯底座与肚身 -->
                    <ellipse cx="0" cy="14" rx="14" ry="4" fill="#ca8a04" stroke="#222" stroke-width="2.4"/>
                    <path d="M -16 12 C -22 6, -18 -4, 0 -6 C 18 -4, 22 6, 16 12 Z" fill="#facc15" stroke="#222" stroke-width="2.6"/>
                    <!-- 弯曲长壶嘴 (向左伸出) -->
                    <path d="M -16 4 C -28 4, -38 -6, -34 -14 L -30 -12 C -32 -6, -24 -2, -14 0 Z" fill="#facc15" stroke="#222" stroke-width="2.4"/>
                    <!-- 神灯提手环 (向右大环) -->
                    <path d="M 14 2 C 28 2, 28 14, 12 12" stroke="#ca8a04" stroke-width="4.5" fill="none"/>
                    <path d="M 14 2 C 28 2, 28 14, 12 12" stroke="#222" stroke-width="2" fill="none"/>
                    <!-- 壶盖金小顶珠 -->
                    <circle cx="0" cy="-9" r="2.5" fill="#fde047" stroke="#222" stroke-width="1.6"/>
                </g>

                <!-- 壶嘴袅袅喷出的梦幻浅蓝祥云烟雾 -->
                <g transform="translate(-20, -18)">
                    <path d="M 0 4 C -6 -2, -14 0, -16 -6 C -18 -12, -10 -18, -4 -16 C -2 -22, 6 -20, 8 -16 C 14 -16, 16 -8, 10 -4 Z" 
                          fill="#bae6fd" opacity="0.8" stroke="#38bdf8" stroke-width="1.8"/>
                    <circle cx="-6" cy="-8" r="3" fill="#ffffff" opacity="0.9"/>
                </g>
            </g>
        `,
        // ❄️ 北山冰冕大晶簇 (摩羯座与艾莎专属：多支高耸错落高透大冰晶王冠与飘雪)
        ice_spire_crown: () => `
            <g class="topper-group ice-spire-crown-topper" transform="translate(120, 2)">
                <!-- 冰雪光晕环 -->
                <ellipse cx="0" cy="14" rx="44" ry="8" fill="#38bdf8" opacity="0.25" class="glow-pulse-circle"/>

                <!-- 多柱层次分明的高耸冰晶簇 (利用尖锐多边形构建) -->
                <!-- 最左小冰晶 -->
                <polygon points="-42,12 -38,-12 -32,-8 -36,12" fill="#bae6fd" stroke="#222" stroke-width="2"/>
                <!-- 次左中冰晶 -->
                <polygon points="-30,12 -26,-28 -18,-22 -22,12" fill="#e0f2fe" stroke="#222" stroke-width="2.4"/>
                <line x1="-24" y1="-26" x2="-22" y2="12" stroke="#ffffff" stroke-width="2"/>
                <!-- 中央大冰晶尖峰 (最高，挺立至 -48) -->
                <polygon points="-12,12 0,-48 12,12" fill="#e0f2fe" stroke="#222" stroke-width="3"/>
                <polygon points="-6,12 0,-46 4,12" fill="#ffffff"/>
                <!-- 次右中冰晶 -->
                <polygon points="22,12 18,-28 26,-22 30,12" fill="#e0f2fe" stroke="#222" stroke-width="2.4"/>
                <line x1="24" y1="-26" x2="22" y2="12" stroke="#ffffff" stroke-width="2"/>
                <!-- 最右小冰晶 -->
                <polygon points="36,12 32,-12 38,-8 42,12" fill="#bae6fd" stroke="#222" stroke-width="2"/>

                <!-- 周围飘舞的小六角雪花 -->
                <text x="-48" y="-12" font-size="12" fill="#38bdf8">❄</text>
                <text x="40" y="-14" font-size="12" fill="#38bdf8">❄</text>
                <text x="-18" y="-36" font-size="9" fill="#bae6fd">❄</text>
                <text x="14" y="-36" font-size="9" fill="#bae6fd">❄</text>
            </g>
        `,
        // 🌊 翻滚海浪与寻航帆船 (水瓶座与莫阿娜专属：翻滚白沫碧浪、红螺旋风帆独木舟与红扶桑花)
        wave_and_canoe: () => `
            <g class="topper-group wave-canoe-topper" transform="translate(120, 2)">
                <!-- 翻滚碧蓝滔天巨浪 (向左卷曲拍击) -->
                <path d="M -45 16 C -50 4, -42 -12, -28 -18 C -14 -24, 0 -8, -12 -2 C -18 2, -22 -4, -18 -8" 
                      stroke="#222" stroke-width="3.5" fill="none" stroke-linecap="round"/>
                <path d="M -45 16 C -50 4, -42 -12, -28 -18 C -14 -24, 0 -8, -12 -2 C -18 2, -22 -4, -18 -8 Z" 
                      fill="#38bdf8" stroke="#222" stroke-width="3" stroke-linejoin="round"/>
                <!-- 浪花雪白泡沫团 -->
                <circle cx="-28" cy="-18" r="5" fill="#ffffff" stroke="#222" stroke-width="1.8"/>
                <circle cx="-20" cy="-14" r="4" fill="#ffffff" stroke="#222" stroke-width="1.6"/>
                <circle cx="-36" cy="-12" r="4" fill="#ffffff" stroke="#222" stroke-width="1.6"/>

                <!-- 寻航独木帆船 (右侧浪头迎风航行) -->
                <g transform="translate(18, -10)">
                    <!-- 木舟船体 -->
                    <path d="M -16 10 Q 0 16 18 8 L 14 5 Q 0 10 -12 7 Z" fill="#78350f" stroke="#222" stroke-width="2"/>
                    <!-- 独木舟桅杆 -->
                    <line x1="0" y1="8" x2="0" y2="-24" stroke="#451a03" stroke-width="2.5" stroke-linecap="round"/>
                    <!-- 三角草织风帆 (带红螺旋图腾) -->
                    <polygon points="0,-22 16,-4 0,-4" fill="#fef3c7" stroke="#222" stroke-width="2"/>
                    <!-- 塔菲缇之心红色螺旋纹 -->
                    <path d="M 6 -12 C 4 -15, 8 -16, 9 -14 C 10 -12, 7 -10, 6 -12 Z" stroke="#dc2626" stroke-width="1.8" fill="none"/>
                </g>

                <!-- 一朵盛开的热带红扶桑花 (木槿花) -->
                <g transform="translate(-2, 10)">
                    <circle cx="0" cy="0" r="4" fill="#facc15"/>
                    ${[0, 72, 144, 216, 288].map(deg => `
                        <circle cx="${7 * Math.cos(deg * Math.PI / 180)}" cy="${7 * Math.sin(deg * Math.PI / 180)}" r="4.5" fill="#ef4444" stroke="#222" stroke-width="1.6"/>
                    `).join("")}
                    <circle cx="0" cy="0" r="2.5" fill="#fef08a" stroke="#222" stroke-width="1.2"/>
                </g>
            </g>
        `,
        // 🏮 金发长辫与飞天天灯 (双鱼座与长发公主专属：金色长发发辫环绕杯沿点缀小花、冉冉升空发光天灯)
        rapunzel_hair_lanterns: () => `
            <g class="topper-group rapunzel-lanterns-topper" transform="translate(120, 0)">
                <!-- 金色长发发辫 (环绕杯沿波浪编织) -->
                <path d="M -48 12 C -32 4, -16 18, 0 10 C 16 4, 32 16, 48 10" stroke="#ca8a04" stroke-width="8" stroke-linecap="round" fill="none"/>
                <path d="M -48 12 C -32 4, -16 18, 0 10 C 16 4, 32 16, 48 10" stroke="#facc15" stroke-width="5.5" stroke-linecap="round" fill="none"/>
                <path d="M -48 12 C -32 4, -16 18, 0 10 C 16 4, 32 16, 48 10" stroke="#222" stroke-width="2" stroke-linecap="round" fill="none"/>
                
                <!-- 发辫间点缀的小花朵 (粉红与小白花) -->
                <circle cx="-28" cy="8" r="3" fill="#f43f5e" stroke="#222" stroke-width="1.2"/>
                <circle cx="-10" cy="14" r="2.5" fill="#ffffff" stroke="#222" stroke-width="1.2"/>
                <circle cx="14" cy="8" r="3" fill="#c084fc" stroke="#222" stroke-width="1.2"/>
                <circle cx="32" cy="14" r="2.5" fill="#f43f5e" stroke="#222" stroke-width="1.2"/>

                <!-- 冉冉升腾的多盏发光孔明灯 (天灯) -->
                <!-- 天灯 1 (最高，中央偏左) -->
                <g transform="translate(-12, -26) scale(0.9)">
                    <rect x="-8" y="-12" width="16" height="20" rx="3" fill="#fef08a" stroke="#222" stroke-width="2"/>
                    <circle cx="0" cy="0" r="5" fill="#f59e0b" opacity="0.85"/>
                    <line x1="-8" y1="8" x2="8" y2="8" stroke="#ca8a04" stroke-width="1.6"/>
                    <circle cx="0" cy="0" r="10" fill="#fde047" opacity="0.3" class="glow-pulse-circle"/>
                </g>
                <!-- 天灯 2 (右上) -->
                <g transform="translate(24, -32) scale(0.75)">
                    <rect x="-8" y="-12" width="16" height="20" rx="3" fill="#fef08a" stroke="#222" stroke-width="2"/>
                    <circle cx="0" cy="0" r="5" fill="#f59e0b" opacity="0.85"/>
                    <circle cx="0" cy="0" r="9" fill="#fde047" opacity="0.3" class="glow-pulse-circle"/>
                </g>
                <!-- 天灯 3 (左下) -->
                <g transform="translate(-36, -14) scale(0.65)">
                    <rect x="-8" y="-12" width="16" height="20" rx="3" fill="#fde047" stroke="#222" stroke-width="2.2"/>
                    <circle cx="0" cy="0" r="4.5" fill="#ea580c"/>
                </g>
                <!-- 天灯 4 (最右下) -->
                <g transform="translate(42, -18) scale(0.6)">
                    <rect x="-8" y="-12" width="16" height="20" rx="3" fill="#fde047" stroke="#222" stroke-width="2.2"/>
                    <circle cx="0" cy="0" r="4.5" fill="#ea580c"/>
                </g>
            </g>
        `
    }
};

window.SVG_ASSETS = SVG_ASSETS;
