/**
 * 治愈系手绘风 SVG 矢量资产库 (SVG Asset Generator)
 * 严格按照参考图手绘风格：2~4px 粗黑边描线、圆润形状、高饱和暖润色彩、精致笑脸
 * 统一采用 0 -70 240 290 的扩展 viewBox，彻底避免顶部顶饰被截断，并保证严格的渲染图层顺序
 */

const SVG_ASSETS = {
    // 渲染完整的单体特调 SVG (核心通用方法，保证吧台、卡片、Canvas 三端层级 100% 正确且不截断)
    renderCompleteDrink: (drinkData, options = {}) => {
        const width = options.width || 240;
        const height = options.height || 270;
        const prefix = options.prefix || "stage_" + Math.random().toString(36).substring(2, 7);
        const glassType = drinkData.glassType || "classic";
        const clipId = `cupClip_${prefix}_${glassType}`;

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

        const isPouring = !!options.isPouring;

        // 1. 液体 SVG (支持多层渐变分层、注水升起动画与动态液位高度)
        let liquidSvg = "";
        if (hasLiquid) {
            const heightFill = 210 * 0.85 * totalRatio;
            const yPos = 210 - heightFill;
            const pourClass = isPouring ? "liquid-pouring-anim" : "";
            const topLayer = layers[layers.length - 1];
            const topWaveColor = topLayer.colorTop || topLayer.colorBottom || "#84d8ff";
            liquidSvg = `
                <g class="liquid-layer-group ${pourClass}">
                    <rect class="liquid-rect" x="0" y="${yPos}" width="240" height="${heightFill + 15}" fill="url(#${gradId})" />
                    <path class="liquid-wave" d="M 0 ${yPos + 2} Q 60 ${yPos - 3}, 120 ${yPos + 2} T 240 ${yPos + 2} L 240 ${yPos + 12} L 0 ${yPos + 12} Z" fill="${topWaveColor}" opacity="0.6"/>
                    <path d="M 0 ${yPos + 2} Q 60 ${yPos - 3}, 120 ${yPos + 2} T 240 ${yPos + 2}" stroke="#222" stroke-width="2.5" fill="none" opacity="0.3"/>
                </g>
            `;
        }

        // 2. 杯内小料 SVG (支持无液体沉底、有液体浮水与注水浮力升腾动画)
        let itemsSvg = "";
        if (drinkData.inCupItems && drinkData.inCupItems.length > 0) {
            let innerItems = "";
            drinkData.inCupItems.forEach(itemId => {
                const renderer = SVG_ASSETS.inCupItems[itemId];
                if (renderer) {
                    if (itemId === "heart_ice" || itemId === "classic_ice") {
                        innerItems += renderer(hasLiquid, isPouring);
                    } else {
                        innerItems += renderer();
                    }
                }
            });

            if (glassType === "martini") {
                // 马天尼倒三角杯肚向上平移 78px 并微调比例，完美落在倒三角杯肚黄金视觉区！
                itemsSvg = `<g class="martini-items-adapted" transform="translate(0, -78) scale(0.88) translate(14, 15)">${innerItems}</g>`;
            } else if (glassType === "holy_grail") {
                itemsSvg = `<g class="grail-items-adapted" transform="translate(0, -25) scale(0.92) translate(10, 10)">${innerItems}</g>`;
            } else if (glassType === "cup_bucket") {
                itemsSvg = `<g class="bucket-items-adapted" transform="translate(0, 4)">${innerItems}</g>`;
            } else {
                itemsSvg = innerItems;
            }
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
                clipPathD = `M 24 18 L 40 85 C 65 110, 85 105, 105 110 C 85 115, 65 110, 40 135 L 24 202 A 10 10 0 0 0 34 212 L 206 212 A 10 10 0 0 0 216 202 L 200 135 C 175 110, 155 115, 135 110 C 155 105, 175 110, 200 85 L 216 18 Z`;
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
                clipPathD = `M 70 18 L 60 65 A 72 72 0 1 0 180 65 L 170 18 Z`;
                cupBodySvg = `
                    <circle cx="120" cy="120" r="70" fill="url(#glassReflection_${prefix})" opacity="0.3" pointer-events="none"/>
                    <g class="cup-smile-face" pointer-events="none">
                        <circle cx="106" cy="115" r="3.2" fill="#1e1e1e" />
                        <circle cx="134" cy="115" r="3.2" fill="#1e1e1e" />
                        <path d="M 107 124 Q 120 133 133 124" stroke="#1e1e1e" stroke-width="3.5" stroke-linecap="round" fill="none" />
                    </g>
                    <!-- 水晶球轮廓 -->
                    <path d="M 70 16 L 58 65 A 74 74 0 1 0 182 65 L 170 16" stroke="#222" stroke-width="5.5" stroke-linecap="round" fill="none"/>
                    <!-- 底部小底座 -->
                    <path d="M 90 204 Q 120 207 150 204" stroke="#222" stroke-width="4.5" fill="none"/>
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
                // 🥤 中杯 (标准 500ml 经典奶茶纸杯，温润适中)
                clipPathD = `M 38 24 L 54 196 A 14 14 0 0 0 68 210 L 172 210 A 14 14 0 0 0 186 196 L 202 24 Z`;
                cupBodySvg = `
                    <rect x="40" y="26" width="160" height="182" rx="10" fill="url(#glassReflection_${prefix})" opacity="0.35" pointer-events="none"/>
                    <!-- 中杯杯身手绘小治愈笑脸 -->
                    <g class="cup-smile-face" pointer-events="none">
                        <circle cx="106" cy="116" r="3.2" fill="#1e1e1e" />
                        <circle cx="134" cy="116" r="3.2" fill="#1e1e1e" />
                        <path d="M 107 125 Q 120 134 133 125" stroke="#1e1e1e" stroke-width="3.5" stroke-linecap="round" fill="none" />
                        <circle cx="98" cy="120" r="3.5" fill="#f43f5e" opacity="0.5"/>
                        <circle cx="142" cy="120" r="3.5" fill="#f43f5e" opacity="0.5"/>
                    </g>
                    <!-- 中杯杯身质感外框 -->
                    <path d="M 36 22 L 54 196 A 14 14 0 0 0 68 210 L 172 210 A 14 14 0 0 0 186 196 L 204 22" stroke="#222" stroke-width="5.5" stroke-linecap="round" fill="none"/>
                    <!-- 顶部杯沿翻边封口 -->
                    <rect x="30" y="16" width="180" height="8" rx="4" fill="#fdfbf7" stroke="#222" stroke-width="3.5"/>
                    <text x="120" y="152" font-size="9" font-weight="900" fill="#a8a29e" text-anchor="middle" letter-spacing="1" opacity="0.7">MEDIUM 500ML</text>
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

        // 4. 顶层奶盖/积雪/白云/沙顶 (Foam)
        let foamSvg = "";
        if (drinkData.foamLayer && drinkData.foamLayer !== "none") {
            const renderer = SVG_ASSETS.foams[drinkData.foamLayer];
            if (renderer) foamSvg = renderer();
        }

        // 5. 核心立体顶饰 (Topper) - 居于最上层
        let topperSvg = "";
        if (drinkData.topper && drinkData.topper !== "none") {
            const renderer = SVG_ASSETS.toppers[drinkData.topper];
            if (renderer) topperSvg = renderer();
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

                <!-- 1. 剪裁区：液体与杯内小料 (最底层) -->
                <g clip-path="url(#${clipId})" class="cup-clipped-content">
                    <g class="cup-liquid-box">${liquidSvg}</g>
                    <g class="cup-items-box">${itemsSvg}</g>
                </g>

                <!-- 2. 杯身外框、厚度与笑脸 (中层) -->
                <g class="cup-body-box">${cupBodySvg}</g>

                <!-- 3. 杯口奶盖/积雪/封层 (上层) -->
                <g class="cup-foam-box">${foamSvg}</g>

                <!-- 4. 核心立体顶饰 (最顶层) -->
                <g class="cup-topper-box">${topperSvg}</g>
            </svg>
        `;
    },

    // 3. 杯内小料与沉浸物 (In-Cup Ingredients)
    inCupItems: {
        // 🧊 普通方形冰块 (默认基础小料，支持无水沉底、有水浮起与注水浮力升腾动画)
        classic_ice: (hasLiquid = true, isPouring = false) => {
            const yOffset = hasLiquid ? 0 : 55;
            const animClass = isPouring ? "ice-floating-rise-anim" : (hasLiquid ? "ice-floating-gentle" : "ice-at-bottom");
            return `
                <g class="in-cup-item classic-ice-item ${animClass}" transform="translate(0, ${yOffset})">
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
            `;
        },
        // 💙 心形冰块 (冬之息，支持无水沉底、有水浮起与注水浮力升腾动画)
        heart_ice: (hasLiquid = true, isPouring = false) => {
            const yOffset = hasLiquid ? 0 : 55;
            const animClass = isPouring ? "ice-floating-rise-anim" : (hasLiquid ? "ice-floating-gentle" : "ice-at-bottom");
            return `
                <g class="in-cup-item heart-ice-item ${animClass}" transform="translate(0, ${yOffset})">
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
        // 沉底流沙珠 (指间沙)
        sand_beads: () => `
            <g class="in-cup-item sand-beads-group">
                <circle cx="75" cy="190" r="7.5" fill="#bd8546" stroke="#222" stroke-width="2.5"/>
                <circle cx="120" cy="182" r="8.5" fill="#bd8546" stroke="#222" stroke-width="2.5"/>
                <circle cx="160" cy="192" r="7" fill="#bd8546" stroke="#222" stroke-width="2.5"/>
                <path d="M 60 205 Q 120 198 180 205" stroke="#bd8546" stroke-width="4" stroke-linecap="round" fill="none"/>
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
        // 金色弯月 (灰姑娘)
        crescent_moon: (x = 175, y = 165) => `
            <g class="in-cup-item crescent-moon-group" transform="translate(${x}, ${y})">
                <path d="M 12 -22 C 30 -6, 26 24, 0 32 C 22 20, 20 -4, -4 -16 C 2 -20, 8 -22, 12 -22 Z" 
                      fill="#fed439" stroke="#222" stroke-width="3" stroke-linejoin="round"/>
                <path d="M 10 -15 C 22 -2, 18 16, 2 24 C 15 14, 14 -2, -1 -10 Z" 
                      fill="#fff194"/>
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
        // 幽灵微光 (双生)
        ghost_particles: () => `
            <g class="in-cup-item ghost-particles-group">
                <path d="M 22 170 Q 120 166 218 170 L 218 210 L 22 210 Z" fill="#9f96bf" opacity="0.5"/>
                <circle cx="65" cy="185" r="6" fill="#c3beea" stroke="#222" stroke-width="1.8"/>
                <circle cx="175" cy="185" r="6" fill="#8cbcf5" stroke="#222" stroke-width="1.8"/>
                <path d="M 120 180 L 120 190 M 115 185 L 125 185" stroke="#ffffff" stroke-width="2" stroke-linecap="round"/>
            </g>
        `,
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
        `
    },

    // 4. 顶层封层与奶盖 (Foams & Top Layers)
    foams: {
        none: () => ``,
        // 浮木积雪 (冬之息)
        snow_wood: () => `
            <g class="foam-layer-group snow-wood-group">
                <!-- 深色浮木圆木桩 -->
                <g class="wood-log">
                    <rect x="26" y="24" width="188" height="22" rx="11" fill="#586f86" stroke="#222" stroke-width="4.5"/>
                    <ellipse cx="204" cy="35" rx="8" ry="11" fill="#425567" stroke="#222" stroke-width="3"/>
                    <path d="M 60 30 Q 110 32 170 30" stroke="#3b4d5e" stroke-width="2.5" fill="none"/>
                </g>
                <!-- 覆盖在木桩上的波浪纯白积雪 -->
                <path d="M 22 28 
                         C 35 15, 60 12, 80 18 
                         C 105 10, 140 10, 165 16 
                         C 185 12, 210 18, 220 28 
                         L 218 36 
                         C 195 38, 170 34, 140 38 
                         C 100 34, 70 38, 24 36 Z" 
                      fill="#ffffff" stroke="#222" stroke-width="4.2" stroke-linejoin="round"/>
            </g>
        `,
        // 金色沙顶底盘 (指间沙)
        sand_plate: () => `
            <g class="foam-layer-group sand-plate-group">
                <path d="M 24 24 
                         C 60 18, 180 18, 216 24 
                         L 212 38 
                         C 170 44, 70 44, 28 38 Z" 
                      fill="#f3cd93" stroke="#222" stroke-width="4.5"/>
            </g>
        `,
        // 南瓜奶油底 (灰姑娘)
        pumpkin_cream: () => `
            <g class="foam-layer-group pumpkin-cream-group">
                <path d="M 22 26 
                         Q 50 18 80 25 
                         Q 120 16 160 25 
                         Q 195 18 218 26 
                         L 218 38 
                         Q 120 44 22 38 Z" 
                      fill="#fed458" stroke="#222" stroke-width="4"/>
            </g>
        `,
        // 落雨白云 (耳边雨)
        rain_cloud: () => `
            <g class="foam-layer-group rain-cloud-group">
                <g class="fluffy-cloud" transform="translate(0, -25)">
                    <path d="M 40 35 
                             C 25 35, 20 18, 38 10 
                             C 35 -10, 65 -15, 80 -2 
                             C 95 -25, 145 -25, 160 -2 
                             C 180 -12, 210 -5, 205 15 
                             C 225 22, 215 42, 195 42 
                             L 45 42 Z" 
                          fill="#ffffff" stroke="#222" stroke-width="4.8" stroke-linejoin="round"/>
                    <path d="M 75 8 Q 85 -2 100 5" stroke="#222" stroke-width="2.5" fill="none" opacity="0.3"/>
                    <path d="M 140 5 Q 155 -5 170 5" stroke="#222" stroke-width="2.5" fill="none" opacity="0.3"/>
                </g>
                <g class="cloud-rain-drops">
                    <line x1="60" y1="20" x2="60" y2="40" stroke="#ff7e94" stroke-width="2.5" stroke-linecap="round"/>
                    <line x1="100" y1="22" x2="100" y2="48" stroke="#b0dc56" stroke-width="2.5" stroke-linecap="round"/>
                    <line x1="140" y1="18" x2="140" y2="42" stroke="#f69fe3" stroke-width="2.5" stroke-linecap="round"/>
                    <line x1="180" y1="22" x2="180" y2="45" stroke="#fed43f" stroke-width="2.5" stroke-linecap="round"/>
                </g>
            </g>
        `,
        // 夜幕星云 (云里星)
        night_cloud: () => `
            <g class="foam-layer-group night-cloud-group">
                <path d="M 22 28 
                         C 35 12, 70 8, 90 20 
                         C 115 5, 155 5, 175 18 
                         C 195 10, 215 18, 220 28 
                         L 218 42 
                         C 170 48, 70 48, 22 42 Z" 
                      fill="#20407a" stroke="#222" stroke-width="4.5" stroke-linejoin="round"/>
            </g>
        `,
        // 黑色玄武岩玫瑰膏 (双生)
        black_rose_cream: () => `
            <g class="foam-layer-group black-rose-cream-group">
                <path d="M 20 28 
                         C 35 15, 60 10, 80 20 
                         C 95 8, 130 8, 145 18 
                         C 165 8, 200 12, 220 28 
                         L 218 42 
                         C 160 48, 80 48, 20 42 Z" 
                      fill="#262628" stroke="#222" stroke-width="4.5" stroke-linejoin="round"/>
                <path d="M 50 22 C 70 12, 90 28, 80 34" stroke="#48484e" stroke-width="3" fill="none"/>
                <path d="M 110 18 C 130 8, 150 24, 140 32" stroke="#48484e" stroke-width="3" fill="none"/>
                <path d="M 170 20 C 190 12, 205 26, 195 32" stroke="#48484e" stroke-width="3" fill="none"/>
            </g>
        `,
        // 浮冰奶盖 (海之梦)
        ocean_ice_cap: () => `
            <g class="foam-layer-group ocean-ice-cap-group">
                <path d="M 20 26 
                         C 40 12, 80 10, 110 20 
                         C 140 10, 185 10, 220 26 
                         L 218 42 
                         C 170 46, 70 46, 20 42 Z" 
                      fill="#ffffff" stroke="#222" stroke-width="4.5" stroke-linejoin="round"/>
            </g>
        `,
        // 深褐花泥 (幸运盆栽)
        soil_top: () => `
            <g class="foam-layer-group soil-top-group">
                <path d="M 22 26 
                         Q 60 20 120 20 
                         Q 180 20 218 26 
                         L 218 42 
                         Q 120 48 22 42 Z" 
                      fill="#693c2a" stroke="#222" stroke-width="4.5"/>
            </g>
        `,
        // 🍬 梦幻棉花糖顶 (新增高级封层)
        cotton_candy: () => `
            <g class="foam-layer-group cotton-candy-group" transform="translate(0, -10)">
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
                <path d="M 22 28 
                         C 40 18, 70 14, 100 20 
                         C 130 14, 170 14, 218 28 
                         L 218 42 
                         C 180 50, 140 44, 100 48 
                         C 60 44, 40 50, 22 42 Z" 
                      fill="#fef9c3" stroke="#222" stroke-width="4.2" stroke-linejoin="round"/>
                <path d="M 35 24 C 65 20, 100 22, 130 20" stroke="#fef08a" stroke-width="3" stroke-linecap="round" fill="none"/>
            </g>
        `,
        // 🍦 鲜奶油雪顶 (茶颜悦色幽兰拿铁 / 星巴克星冰乐)
        whipped_cream: () => `
            <g class="foam-layer-group whipped-cream-group" transform="translate(0, -28)">
                <!-- 底层绵密大奶油波浪 -->
                <path d="M 25 45 C 30 25, 75 22, 90 38 C 110 20, 150 20, 170 38 C 185 24, 215 30, 215 45 Z" 
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
        // 盛放粉玫瑰 (王妃鬼藤)
        pink_rose: () => `
            <g class="topper-group pink-rose-topper" transform="translate(130, -35) rotate(14)">
                <path d="M 0 35 Q -10 50 -15 65" stroke="#4c911b" stroke-width="5.5" stroke-linecap="round" fill="none"/>
                <path d="M -8 32 C -18 30 -16 20 -5 26 Z" fill="#69b828" stroke="#222" stroke-width="2.5"/>
                <path d="M -26 15 
                         C -35 -10, -10 -28, 10 -25 
                         C 35 -22, 40 5, 25 24 
                         C 10 35, -15 32, -26 15 Z" 
                      fill="#ff8da1" stroke="#222" stroke-width="4.5" stroke-linejoin="round"/>
                <path d="M -15 5 
                         C -18 -8, -2 -16, 8 -12 
                         C 20 -8, 18 10, 6 15 
                         C -6 20, -12 14, -6 6 
                         C 0 0, 8 2, 4 8" 
                      stroke="#e64c6d" stroke-width="3.8" stroke-linecap="round" fill="none"/>
                <path d="M -16 -4 C -8 -16, 6 -14, 14 -6" fill="none" stroke="#ffffff" stroke-width="2.5" stroke-linecap="round" opacity="0.6"/>
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
        `
    }
};

window.SVG_ASSETS = SVG_ASSETS;
