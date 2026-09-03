/**
 * 治愈系拍立得特调分享卡片渲染与高清图片保存导出引擎 (Share Card & Canvas Exporter)
 */

class ShareCardManager {
    constructor() {
        this.dom = {
            modalOverlay: document.getElementById("modalOverlay"),
            resultCard: document.getElementById("resultCard"),
            btnCloseModal: document.getElementById("btnCloseModal")
        };
        this.onCloseCallback = null;
        this.initEvents();
    }

    initEvents() {
        // 右上角 X 按钮关闭
        if (this.dom.btnCloseModal) {
            this.dom.btnCloseModal.addEventListener("click", () => {
                this.close();
            });
        }

        // 点击遮罩外部关闭
        if (this.dom.modalOverlay) {
            this.dom.modalOverlay.addEventListener("click", (e) => {
                if (e.target === this.dom.modalOverlay) {
                    this.close();
                }
            });
        }
    }

    close() {
        if (this.dom.modalOverlay) {
            this.dom.modalOverlay.classList.remove("active");
            window.soundEngine.playBubble();
            if (this.onCloseCallback) {
                this.onCloseCallback();
                this.onCloseCallback = null;
            }
        }
    }

    showCard(drinkData, modeData, callbacks = {}) {
        const isLevel = modeData.mode === "level";
        const targetRecipe = modeData.recipe || window.DRINK_RECIPES[0];
        let drinkName = isLevel ? targetRecipe.name : (drinkData.customName || "我的专属奇迹特调");
        const subtitle = isLevel ? targetRecipe.subtitle : "Signature Cozy Drink";
        const poem = isLevel ? targetRecipe.desc : "在微风与灯火之间，调制专属于此刻的治愈风味。";
        const score = modeData.score || 100;
        const stars = modeData.stars || 3;
        const earnedCoins = modeData.earnedCoins || 0;

        this.onCloseCallback = callbacks.onClose || null;

        let starsHtml = "";
        for (let i = 1; i <= 3; i++) {
            starsHtml += `<span class="star-icon ${i <= stars ? 'active-star' : ''}">★</span>`;
        }

        // 获取当前特调的完整 SVG 代码
        const drinkSvgHtml = window.SVG_ASSETS.renderCompleteDrink(drinkData, {
            width: 240,
            height: 270,
            prefix: "polaroid"
        });

        // 自由模式下允许用户就地自由修改饮品名称
        const titleHtml = isLevel ? `
            <div class="polaroid-drink-title">${drinkName}</div>
        ` : `
            <div class="polaroid-drink-title-editable" id="polaroidEditableTitleWrap" title="点击可自由修改专属特调名称">
                <input type="text" 
                       class="polaroid-title-input" 
                       id="polaroidTitleInput" 
                       value="${drinkName}" 
                       maxlength="20" 
                       placeholder="输入专属特调名字..." />
                <span class="polaroid-edit-icon" id="polaroidEditIcon" title="点击修改名称">✏️</span>
            </div>
        `;

        this.dom.resultCard.innerHTML = `
            <div class="polaroid-card" id="polaroidCardNode">
                <!-- 上半部：特调大图特写 -->
                <div class="polaroid-image-frame">
                    <div class="polaroid-drink-svg-box">
                        ${drinkSvgHtml}
                    </div>
                    <div class="polaroid-sparkle-decor">✨</div>
                </div>

                <!-- 下半部：手绘风排版与品名评分 -->
                <div class="polaroid-info-box">
                    <div class="polaroid-title-row">
                        ${titleHtml}
                        ${isLevel ? `<div class="polaroid-stars-badge">${starsHtml}</div>` : `<div class="polaroid-free-tag">🎨 独家特调</div>`}
                    </div>
                    <div class="polaroid-sub-title">${subtitle}</div>
                    <div class="polaroid-poem-quote">“${poem}”</div>

                    <div class="polaroid-reward-row">
                        <span class="reward-title">🎁 特调报酬：</span>
                        <span class="reward-coin-badge">+${earnedCoins} 💰</span>
                    </div>

                    ${modeData.perfectBonus ? `
                    <div class="polaroid-perfect-bonus-row">
                        <span class="perfect-bonus-title">🎉 首次完美特别奖励：</span>
                        <div class="perfect-bonus-badges">
                            <span class="bonus-diam">+${modeData.perfectBonus.diamonds} 💎</span>
                            <span class="bonus-coin">+${modeData.perfectBonus.coins} 💰</span>
                        </div>
                    </div>
                    ` : ''}

                    <div class="polaroid-footer-meta">
                        <div class="polaroid-score-tag">
                            <span class="score-bold">${isLevel ? score + ' 分' : '治愈满分'}</span>
                            <span class="score-level-text">${isLevel ? `· 第 ${window.formatLevelCode ? window.formatLevelCode(modeData.level) : modeData.level} 关 ${score === 100 ? '完美还原' : score >= 80 ? '极佳品味' : '通关合格'}` : '· 自由创造'}</span>
                        </div>
                        <div class="polaroid-footer-badges">
                            <div class="polaroid-seal">
                                <span>COZY BAR</span>
                                <span>治愈特调馆</span>
                            </div>
                            <!-- 右下角当前网址二维码 -->
                            <div class="polaroid-qr-badge" title="当前网址二维码：扫码即可在线品尝同款特调">
                                <canvas class="polaroid-qr-canvas" id="polaroidQrCanvas" width="46" height="46"></canvas>
                                <span class="polaroid-qr-sub">扫码同玩</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- 操作按钮栏 (前3个采用标准 Lucide 矢量图标，彻底释放空间；第4个为主操作按钮) -->
            <div class="card-action-buttons">
                <!-- 1. 保存图片 (Lucide Camera 矢量相机图标) -->
                <button class="btn card-icon-btn btn-save-img" id="btnSaveCardImg" title="保存特调拍立得到相册" aria-label="保存图片">
                    <svg class="btn-icon-svg" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
                        <circle cx="12" cy="13" r="4"/>
                    </svg>
                </button>

                <!-- 2. 分享 (Lucide Share-2 矢量分享节点图标) -->
                <button class="btn card-icon-btn btn-share-action" id="btnShareCardAction" title="调出手机系统原生分享" aria-label="分享特调">
                    <svg class="btn-icon-svg" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                        <circle cx="18" cy="5" r="3"/>
                        <circle cx="6" cy="12" r="3"/>
                        <circle cx="18" cy="19" r="3"/>
                        <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/>
                        <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
                    </svg>
                </button>

                <!-- 3. 重玩 (Lucide Rotate-Ccw 矢量重调图标) -->
                <button class="btn card-icon-btn btn-retry-action" id="btnCardRetryAction" title="清空杯子重玩本关" aria-label="重玩本关">
                    <svg class="btn-icon-svg" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                        <polyline points="1 4 1 10 7 10"/>
                        <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/>
                    </svg>
                </button>

                <!-- 4. 下一关 / 再调一杯 (主行动按钮，保留文本) -->
                <button class="btn btn-primary btn-next-action" id="btnCardNextAction" title="进入下一关或调下一杯">
                    <span>${isLevel ? (modeData.level < 9 ? '下一关 ➔' : '再调一杯 🍹') : '调下一杯 🍹'}</span>
                </button>
            </div>
        `;

        // 自由模式下绑定特调名称就地编辑事件
        const titleInput = document.getElementById("polaroidTitleInput");
        const editIcon = document.getElementById("polaroidEditIcon");
        if (titleInput) {
            const commitNameChange = () => {
                const newName = titleInput.value.trim() || "我的专属奇迹特调";
                drinkName = newName;
                drinkData.customName = newName;
                // 名称变更时使缓存失效以便重新生成
                this.cachedShareFile = null;
                this.cachedShareCanvas = null;
            };
            titleInput.addEventListener("input", commitNameChange);
            titleInput.addEventListener("change", commitNameChange);
            titleInput.addEventListener("blur", () => {
                if (!titleInput.value.trim()) {
                    titleInput.value = "我的专属奇迹特调";
                }
                commitNameChange();
            });
            titleInput.addEventListener("keydown", (e) => {
                if (e.key === "Enter") {
                    titleInput.blur();
                    window.soundEngine.playBubble();
                }
            });
            if (editIcon) {
                editIcon.addEventListener("click", () => {
                    titleInput.focus();
                    titleInput.select();
                    window.soundEngine.playBubble();
                });
            }
        }

        // 渲染拍立得卡片右下角当前网址二维码
        const qrCanvas = document.getElementById("polaroidQrCanvas");
        if (qrCanvas && window.QRCodeEngine) {
            try {
                window.QRCodeEngine.drawToCanvas(qrCanvas, window.location.href, {
                    size: 46,
                    margin: 1,
                    darkColor: "#2c221a",
                    lightColor: "#ffffff"
                });
            } catch (err) {
                console.error("卡片右下角二维码渲染失败", err);
            }
        }

        // 🚀 后台静默预热：在卡片弹出的第一时间将高清 Canvas 与分享 File 缓存就绪
        // 这样在移动端点击【分享】时能直接在原生同步手势栈中触发 navigator.share，绝不丢失用户手势凭证！
        this.cachedShareFile = null;
        this.cachedShareCanvas = null;
        const prepareData = {
            drinkName,
            subtitle,
            poem,
            score,
            stars,
            isLevel,
            drinkSvgHtml
        };
        setTimeout(() => {
            this.generateCardCanvas(prepareData, (canvas) => {
                this.cachedShareCanvas = canvas;
                if (canvas.toBlob) {
                    canvas.toBlob((blob) => {
                        if (blob) {
                            try {
                                this.cachedShareFile = new File([blob], `${drinkName}_治愈特调.png`, { type: "image/png" });
                            } catch (e) {
                                console.log("File 对象预封装", e);
                            }
                        }
                    }, "image/png");
                }
            });
        }, 30);

        // 1. 保存图片
        document.getElementById("btnSaveCardImg").addEventListener("click", () => {
            const finalDrinkName = (!isLevel && titleInput) ? (titleInput.value.trim() || "我的专属奇迹特调") : drinkName;
            this.exportToCanvasAndDownload({
                drinkName: finalDrinkName,
                subtitle,
                poem,
                score,
                stars,
                isLevel,
                drinkSvgHtml
            });
        });

        // 2. 📤 分享当前图片与网址 (同步直达移动端系统原生分享面板)
        document.getElementById("btnShareCardAction").addEventListener("click", () => {
            const finalDrinkName = (!isLevel && titleInput) ? (titleInput.value.trim() || "我的专属奇迹特调") : drinkName;
            this.shareCardImage({
                drinkName: finalDrinkName,
                subtitle,
                poem,
                score,
                stars,
                isLevel,
                drinkSvgHtml
            });
        });

        // 3. 重玩本关
        document.getElementById("btnCardRetryAction").addEventListener("click", () => {
            if (this.dom.modalOverlay) {
                this.dom.modalOverlay.classList.remove("active");
            }
            if (callbacks.onRetry) {
                callbacks.onRetry();
            }
        });

        // 4. 下一关 / 再调一杯
        document.getElementById("btnCardNextAction").addEventListener("click", () => {
            if (this.dom.modalOverlay) {
                this.dom.modalOverlay.classList.remove("active");
            }
            if (callbacks.onNext) {
                callbacks.onNext();
            }
        });

        this.dom.modalOverlay.classList.add("active");
    }

    /**
     * 高清 Canvas 拍立得卡片离线合成器 (720x980 纯净拍立得比例，无任何外层大黑框)
     */
    generateCardCanvas(data, callback) {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        const width = 720;
        const height = 980;
        canvas.width = width;
        canvas.height = height;

        // 1. 纯净米白拍立得卡片主体与经典黑色手绘轮廓线 (全幅铺满，无外层深色背景，保留手绘黑边)
        ctx.fillStyle = "#faf6ed";
        ctx.strokeStyle = "#2c221a";
        ctx.lineWidth = 5;
        this.roundRect(ctx, 3, 3, width - 6, height - 6, 16, true, true);

        const cardX = 0;
        const cardY = 0;
        const cardW = width;
        const cardH = height;

        // 2. 绘制照片框背景 (拍立得特调特写区，恢复内部经典黑色手绘框线)
        const photoX = 26;
        const photoY = 26;
        const photoW = width - 52;
        const photoH = 540;

        ctx.fillStyle = "#eddcc7";
        ctx.strokeStyle = "#2c221a";
        ctx.lineWidth = 5;
        this.roundRect(ctx, photoX, photoY, photoW, photoH, 14, true, true);

        // 照片框内部柔和温润光晕
        const grad = ctx.createRadialGradient(photoX + photoW / 2, photoY + photoH / 2, 20, photoX + photoW / 2, photoY + photoH / 2, photoW / 1.5);
        grad.addColorStop(0, "#f9f2e7");
        grad.addColorStop(1, "#dfcca8");
        ctx.fillStyle = grad;
        this.roundRect(ctx, photoX + 3, photoY + 3, photoW - 6, photoH - 6, 11, true, false);

        // 3. 将 SVG 转换为图片绘制到照片框中
        const svgEl = document.querySelector(".polaroid-drink-svg-box svg") || document.querySelector("#drinkStage svg");
        const onSvgDrawn = () => {
            this.drawCardTypography(ctx, data, cardX, cardY, cardW, cardH);
            callback(canvas);
        };

        if (svgEl) {
            const svgData = new XMLSerializer().serializeToString(svgEl);
            const svgBlob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" });
            const url = URL.createObjectURL(svgBlob);
            const img = new Image();

            img.onload = () => {
                const targetW = 460;
                const targetH = 518;
                const imgX = photoX + (photoW - targetW) / 2;
                const imgY = photoY + (photoH - targetH) / 2 + 12;
                ctx.drawImage(img, imgX, imgY, targetW, targetH);
                URL.revokeObjectURL(url);
                onSvgDrawn();
            };

            img.onerror = () => {
                onSvgDrawn();
            };

            img.src = url;
        } else {
            onSvgDrawn();
        }
    }

    /**
     * 高清 Canvas 离线合成并触发直接下载保存
     */
    exportToCanvasAndDownload(data) {
        window.soundEngine.playSparkle();
        this.generateCardCanvas(data, (canvas) => {
            this.triggerDownload(canvas, data.drinkName);
            this.showToast("📸 拍立得特调卡片已保存到本地！✨");
        });
    }

    /**
     * 辅助方法：安全将文本复制到剪贴板
     */
    copyTextToClipboard(text) {
        if (!text) return false;
        let success = false;
        try {
            const textarea = document.createElement("textarea");
            textarea.value = text;
            textarea.style.position = "fixed";
            textarea.style.top = "-9999px";
            textarea.style.left = "-9999px";
            textarea.style.opacity = "0";
            textarea.setAttribute("readonly", "");
            document.body.appendChild(textarea);
            textarea.select();
            textarea.setSelectionRange(0, textarea.value.length);
            success = document.execCommand("copy");
            document.body.removeChild(textarea);
        } catch (e) {
            success = false;
        }

        if (!success && typeof navigator !== "undefined" && navigator.clipboard && typeof navigator.clipboard.writeText === "function") {
            navigator.clipboard.writeText(text).catch(() => {});
            success = true;
        }
        return success;
    }

    /**
     * 📤 唤起分享 (点击即自动复制链接到剪贴板，并调起原生分享)
     */
    shareCardImage(data) {
        window.soundEngine.playSparkle();
        const currentUrl = window.location.href;
        const shareTitle = `${data.drinkName} · 治愈特调`;
        const shareText = `我在治愈特调吧亲手调配了一杯【${data.drinkName}】，快来扫码品尝吧！🍹`;

        // 🔗 核心：在用户点击手势的第一时间，立即同步自动将特调链接写入剪贴板！
        const copyOk = this.copyTextToClipboard(currentUrl);
        if (copyOk) {
            this.showToast("已自动复制特调链接！快分享给好友吧~ 🍹");
        }

        // 📱 核心：如果手机浏览器支持 Web Share API，进一步唤起系统分享面板
        if (typeof navigator !== "undefined" && navigator.share) {
            // 1. 如果已预先缓存好带二维码的图片文件且支持文件分享，优先分享图片文件
            if (this.cachedShareFile && navigator.canShare) {
                try {
                    if (navigator.canShare({ files: [this.cachedShareFile] })) {
                        navigator.share({
                            title: shareTitle,
                            text: shareText,
                            url: currentUrl,
                            files: [this.cachedShareFile]
                        }).then(() => {
                            this.showToast("🎉 分享成功！感谢将治愈特调传递给好友~ ✨");
                        }).catch((err) => {
                            if (err && err.name !== "AbortError") {
                                console.log("图片文件分享受限，降级为原生纯文本/网址分享", err);
                                // 快速降级尝试纯链接分享
                                navigator.share({
                                    title: shareTitle,
                                    text: shareText,
                                    url: currentUrl
                                }).catch(() => {});
                            }
                        });
                        return;
                    }
                } catch (e) {
                    console.log("canShare 检测跳过", e);
                }
            }

            // 2. 若不支持文件或文件未就绪：在同步手势栈中立刻唤起系统原生分享面板！
            navigator.share({
                title: shareTitle,
                text: shareText,
                url: currentUrl
            }).then(() => {
                this.showToast("🎉 分享成功！感谢将治愈特调传递给好友~ ✨");
            }).catch((err) => {
                if (err && err.name !== "AbortError") {
                    this.fallbackShare(data.drinkName, currentUrl);
                }
            });
            return;
        }

        // 💻 3. 桌面端或无原生分享 API 环境：自动下载图片 + 复制链接 + 手绘 Toast 提示
        this.fallbackShare(data.drinkName, currentUrl);
    }

    /**
     * 降级分享：自动下载保存图片 + 复制链接到剪贴板 + 弹出手绘 Toast
     */
    fallbackShare(drinkName, url) {
        if (this.cachedShareCanvas) {
            this.triggerDownload(this.cachedShareCanvas, drinkName);
        } else {
            // 现场极速合成并下载
            this.exportToCanvasAndDownload({
                drinkName,
                subtitle: "Signature Cozy Drink",
                poem: "在微风与灯火之间，调制专属于此刻的治愈风味。",
                score: 100,
                stars: 3,
                isLevel: false
            });
        }

        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(url).then(() => {
                this.showToast("📸 特调图片已保存！网址已复制到剪贴板，快分享给好友吧~ ✨");
            }).catch(() => {
                this.showToast("📸 特调图片已保存！可直接发送给好友一起品尝~ ✨");
            });
        } else {
            this.showToast("📸 特调图片已保存！快把图片发送给好友吧~ ✨");
        }
    }

    /**
     * 弹出手绘风悬浮温馨提示气泡
     */
    showToast(msg) {
        let toast = document.getElementById("shareToastNode");
        if (!toast) {
            toast = document.createElement("div");
            toast.id = "shareToastNode";
            toast.className = "share-toast-bubble";
            document.body.appendChild(toast);
        }
        toast.textContent = msg;
        toast.classList.add("show");
        clearTimeout(this.toastTimer);
        this.toastTimer = setTimeout(() => {
            toast.classList.remove("show");
        }, 3200);
    }

    drawCardTypography(ctx, data, cardX, cardY, cardW, cardH) {
        const textStartY = 616;

        // 特调名称大标题 (根据名称字数动态自适应字号，确保无论用户起的名字多长都完美展现)
        ctx.fillStyle = "#2c221a";
        const nameLen = (data.drinkName || "").length;
        const fontSize = nameLen > 10 ? Math.max(26, 44 - (nameLen - 10) * 1.8) : 44;
        ctx.font = `900 ${fontSize}px -apple-system, 'PingFang SC', 'Microsoft YaHei', sans-serif`;
        ctx.textAlign = "left";
        ctx.fillText(data.drinkName, 32, textStartY);

        // 英文副标题
        ctx.fillStyle = "#8a7566";
        ctx.font = "bold 20px sans-serif";
        ctx.fillText(data.subtitle, 34, textStartY + 35);

        // 星级或独家创意标签
        if (data.isLevel) {
            ctx.fillStyle = "#f59e0b";
            ctx.font = "bold 30px sans-serif";
            let starStr = "★".repeat(data.stars) + "☆".repeat(3 - data.stars);
            ctx.textAlign = "right";
            ctx.fillText(starStr, cardW - 32, textStartY - 5);
        } else {
            ctx.fillStyle = "#ea580c";
            ctx.font = "bold 22px -apple-system, 'PingFang SC', sans-serif";
            ctx.textAlign = "right";
            ctx.fillText("🎨 独家创意特调", cardW - 32, textStartY - 5);
        }

        // 诗意风味文案
        ctx.fillStyle = "#5c483a";
        ctx.font = "italic 22px -apple-system, 'PingFang SC', 'Microsoft YaHei', sans-serif";
        ctx.textAlign = "left";
        this.wrapText(ctx, `“${data.poem}”`, 32, textStartY + 88, cardW - 64, 32);

        // 分割虚线
        ctx.strokeStyle = "#d6c4b2";
        ctx.lineWidth = 2.5;
        ctx.setLineDash([7, 7]);
        ctx.beginPath();
        ctx.moveTo(32, textStartY + 175);
        ctx.lineTo(cardW - 32, textStartY + 175);
        ctx.stroke();
        ctx.setLineDash([]);

        // 底部左侧：得分与评价
        ctx.fillStyle = "#2c221a";
        ctx.font = "900 24px sans-serif";
        ctx.textAlign = "left";
        ctx.fillText(data.isLevel ? `得分：${data.score} 分` : "治愈满分", 32, textStartY + 232);

        ctx.fillStyle = "#8a7566";
        ctx.font = "bold 17px -apple-system, 'PingFang SC', sans-serif";
        ctx.fillText(data.isLevel ? (data.score === 100 ? "· 奇迹调饮大师 S+" : "· 完美通关") : "· 自由灵感之作", 195, textStartY + 232);

        // 底部中间偏右：复古手绘印章
        const sealX = cardW - 225;
        const sealY = textStartY + 232;
        ctx.strokeStyle = "#c2410c";
        ctx.lineWidth = 3.5;
        ctx.fillStyle = "rgba(194, 65, 12, 0.08)";
        this.roundRect(ctx, sealX, sealY - 40, 92, 50, 10, true, true);

        ctx.fillStyle = "#c2410c";
        ctx.font = "900 12px sans-serif";
        ctx.textAlign = "center";
        ctx.fillText("COZY BAR", sealX + 46, sealY - 21);
        ctx.font = "bold 14px -apple-system, 'PingFang SC', sans-serif";
        ctx.fillText("治愈特调", sealX + 46, sealY - 4);

        // 底部最右侧：当前网址二维码
        const qrSize = 74;
        const qrX = cardW - 110;
        const qrY = textStartY + 182;

        // 二维码外层白色底托与手绘圆角边框
        ctx.fillStyle = "#ffffff";
        ctx.strokeStyle = "#2c221a";
        ctx.lineWidth = 2.5;
        this.roundRect(ctx, qrX, qrY, qrSize, qrSize, 8, true, true);

        // 绘制二维码黑白模块矩阵
        if (window.QRCodeEngine) {
            try {
                const qr = window.QRCodeEngine.generate(window.location.href);
                const count = qr.getModuleCount();
                const margin = 1;
                const totalMod = count + margin * 2;
                const cellSize = qrSize / totalMod;

                ctx.fillStyle = "#2c221a";
                for (let r = 0; r < count; r++) {
                    for (let c = 0; c < count; c++) {
                        if (qr.isDark(r, c)) {
                            ctx.fillRect(
                                Math.round(qrX + (c + margin) * cellSize),
                                Math.round(qrY + (r + margin) * cellSize),
                                Math.ceil(cellSize),
                                Math.ceil(cellSize)
                            );
                        }
                    }
                }
            } catch (err) {
                console.error("Canvas 绘制二维码异常", err);
            }
        }

        // 二维码下方微小提示文字
        ctx.fillStyle = "#8a7566";
        ctx.font = "bold 12px -apple-system, 'PingFang SC', sans-serif";
        ctx.textAlign = "center";
        ctx.fillText("扫码同玩 🍹", qrX + qrSize / 2, qrY + qrSize + 16);
    }

    roundRect(ctx, x, y, width, height, radius, fill, stroke) {
        ctx.beginPath();
        ctx.moveTo(x + radius, y);
        ctx.lineTo(x + width - radius, y);
        ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
        ctx.lineTo(x + width, y + height - radius);
        ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
        ctx.lineTo(x + radius, y + height);
        ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
        ctx.lineTo(x, y + radius);
        ctx.quadraticCurveTo(x, y, x + radius, y);
        ctx.closePath();
        if (fill) ctx.fill();
        if (stroke) ctx.stroke();
    }

    wrapText(ctx, text, x, y, maxWidth, lineHeight) {
        const words = text.split("");
        let line = "";
        for (let n = 0; n < words.length; n++) {
            const testLine = line + words[n];
            const metrics = ctx.measureText(testLine);
            if (metrics.width > maxWidth && n > 0) {
                ctx.fillText(line, x, y);
                line = words[n];
                y += lineHeight;
            } else {
                line = testLine;
            }
        }
        ctx.fillText(line, x, y);
    }

    triggerDownload(canvas, name) {
        try {
            const link = document.createElement("a");
            link.download = `${name}_治愈特调.png`;
            link.href = canvas.toDataURL("image/png");
            link.click();
        } catch (e) {
            console.error("下载失败，尝试新窗口打开", e);
            const win = window.open();
            if (win) {
                win.document.write(`<img src="${canvas.toDataURL('image/png')}" style="max-width:100%"/>`);
            }
        }
    }
}

window.shareCardManager = new ShareCardManager();
