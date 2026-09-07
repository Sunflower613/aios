/**
 * 治愈系拍立得特调分享卡片渲染与图片保存导出引擎 (Share Card & Canvas Exporter)
 * 智能自适应架构：当存在 QRCodeEngine 时自动启用二维码渲染与扫码导流；
 * 当无 QRCodeEngine (如小红书小工具环境) 时自动降级为手绘独家特调印章与原生相册知情授权保存。
 */

class ShareCardManager {
    constructor() {
        this.dom = {
            modalOverlay: document.getElementById("modalOverlay"),
            resultCard: document.getElementById("resultCard"),
            btnCloseModal: document.getElementById("btnCloseModal")
        };
        this.onCloseCallback = null;
        this.cachedShareFile = null;
        this.cachedShareCanvas = null;
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
            if (window.soundEngine && window.soundEngine.playBubble) {
                window.soundEngine.playBubble();
            }
            if (this.onCloseCallback) {
                const cb = this.onCloseCallback;
                this.onCloseCallback = null;
                cb();
            }
        }
    }

    /**
     * 核心弹窗展示方法 (双端统一)
     */
    showCard(drinkData, modeData, callbacks = {}) {
        if (!modeData) modeData = {};
        if (!callbacks) callbacks = {};
        const isLevel = modeData.mode === "level";
        const targetRecipe = modeData.recipe || (window.DRINK_RECIPES && window.DRINK_RECIPES[0]) || {};
        let drinkName = isLevel ? targetRecipe.name : (drinkData.customName || "我的专属奇迹特调");
        const subtitle = isLevel ? targetRecipe.subtitle : "Signature Cozy Drink";
        const poem = isLevel ? targetRecipe.desc : "在微风与灯火之间，调制专属于此刻的治愈风味。";
        const score = (typeof modeData.score === "number") ? modeData.score : 100;
        const stars = (typeof modeData.stars === "number") ? modeData.stars : (isLevel ? 0 : 3);
        const earnedCoins = (typeof modeData.earnedCoins === "number") ? modeData.earnedCoins : 0;

        // 动态计算主行动按钮文案与标题
        let nextBtnText = "调下一杯";
        let nextBtnTitle = "清空杯子调下一杯";
        const historyRecord = (isLevel && window.StorageManager) ? (window.StorageManager.getData().levelRecords[modeData.level] || null) : null;
        const isHistoryPassed = Boolean(historyRecord && (historyRecord.score >= 60 || historyRecord.stars >= 1));
        const isPass = !isLevel || score >= 60 || isHistoryPassed;
        if (isLevel) {
            const lvl = modeData.level;
            if (!isPass) {
                nextBtnText = "重新挑战";
                nextBtnTitle = "得分未达及格线 (需≥60分通关)，清空杯子重新挑战本关";
            } else if (lvl === 9) {
                const isC2Unlocked = window.StorageManager ? window.StorageManager.isChapterUnlocked(2) : false;
                nextBtnText = isC2Unlocked ? "进入第二章" : "解锁第2章 💎";
                nextBtnTitle = isC2Unlocked ? "前往第二章第一关" : "消耗 300 钻石解锁开启第二章";
            } else if (lvl === 18) {
                const isC3Unlocked = window.StorageManager ? window.StorageManager.isChapterUnlocked(3) : false;
                nextBtnText = isC3Unlocked ? "进入第三章" : "盘店开业第3章 🏮";
                nextBtnTitle = isC3Unlocked ? "前往第三章连锁经营第一关" : "盘下小店开启第三章连锁经营";
            } else if (lvl === 27 || (window.DRINK_RECIPES && lvl >= window.DRINK_RECIPES.length)) {
                nextBtnText = "圆满通关 🏆";
                nextBtnTitle = "已通关全部关卡！";
            } else {
                nextBtnText = "下一关";
                nextBtnTitle = "进入下一关";
            }
        }

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

        if (!this.dom.resultCard) {
            this.dom.resultCard = document.getElementById("resultCard");
        }
        if (!this.dom.modalOverlay) {
            this.dom.modalOverlay = document.getElementById("modalOverlay");
        }

        // 二维码条件化渲染解耦 (存在 QRCodeEngine 时渲染，小红书等无二维码环境自动为空)
        const hasQr = Boolean(window.QRCodeEngine);
        const footerBadgeHtml = hasQr ? `
            <div class="polaroid-qr-badge" title="当前网址二维码：扫码即可在线品尝同款特调">
                <canvas class="polaroid-qr-canvas" id="polaroidQrCanvas" width="46" height="46"></canvas>
                <span class="polaroid-qr-sub">扫码同玩</span>
            </div>
        ` : "";

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
                            <span class="score-level-text">${isLevel ? `· 第 ${window.formatLevelCode ? window.formatLevelCode(modeData.level) : modeData.level} 关 ${score === 100 ? '完美还原' : score >= 80 ? '极佳品味' : score >= 60 ? '通关合格' : '差强人意(未过关)'}` : '· 自由创造'}</span>
                        </div>
                        <div class="polaroid-footer-badges">
                            <div class="polaroid-seal">
                                <span>COZY BAR</span>
                                <span>治愈特调馆</span>
                            </div>
                            ${footerBadgeHtml}
                        </div>
                    </div>
                </div>
            </div>

            <!-- 操作按钮栏 (前3个矢量图标按钮 + 1个主行动按钮) -->
            <div class="card-action-buttons">
                <!-- 1. 保存图片 -->
                <button class="btn card-icon-btn btn-save-img" id="btnSaveCardImg" title="保存特调拍立得到相册" aria-label="保存图片">
                    <svg class="btn-icon-svg" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
                        <circle cx="12" cy="13" r="4"/>
                    </svg>
                </button>

                <!-- 2. 分享 -->
                <button class="btn card-icon-btn btn-share-action" id="btnShareCardAction" title="调出分享选项" aria-label="分享特调">
                    <svg class="btn-icon-svg" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                        <circle cx="18" cy="5" r="3"/>
                        <circle cx="6" cy="12" r="3"/>
                        <circle cx="18" cy="19" r="3"/>
                        <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/>
                        <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
                    </svg>
                </button>

                <!-- 3. 重玩 -->
                <button class="btn card-icon-btn btn-retry-action" id="btnCardRetryAction" title="清空杯子重玩本关" aria-label="重玩本关">
                    <svg class="btn-icon-svg" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                        <polyline points="1 4 1 10 7 10"/>
                        <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/>
                    </svg>
                </button>

                <!-- 4. 主行动按钮 -->
                <button class="btn btn-primary btn-orange btn-next-action" id="btnCardNextAction" title="${nextBtnTitle}">
                    <span>${nextBtnText}</span>
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
                this.cachedShareCanvas = null;
                this.cachedShareFile = null;
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
                    if (window.soundEngine && window.soundEngine.playBubble) {
                        window.soundEngine.playBubble();
                    }
                }
            });
            if (editIcon) {
                editIcon.addEventListener("click", () => {
                    titleInput.focus();
                    titleInput.select();
                    if (window.soundEngine && window.soundEngine.playBubble) {
                        window.soundEngine.playBubble();
                    }
                });
            }
        }

        // 条件化渲染二维码 DOM
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
                console.error("二维码渲染失败", err);
            }
        }

        // 绑定按钮交互事件
        this.bindCardActions(drinkName, subtitle, poem, score, stars, isLevel, drinkSvgHtml, titleInput, callbacks);

        // 激活展示弹窗
        if (this.dom.modalOverlay) {
            this.dom.modalOverlay.classList.add("active");
        }
        if (window.soundEngine && window.soundEngine.playSuccess) {
            window.soundEngine.playSuccess();
        }
    }

    bindCardActions(drinkName, subtitle, poem, score, stars, isLevel, drinkSvgHtml, titleInput, callbacks) {
        const btnSave = document.getElementById("btnSaveCardImg");
        if (btnSave) {
            btnSave.addEventListener("click", () => {
                const finalDrinkName = (!isLevel && titleInput) ? (titleInput.value.trim() || "我的专属奇迹特调") : drinkName;
                this.exportToCanvasAndDownload({
                    drinkName: finalDrinkName,
                    subtitle: subtitle,
                    poem: poem,
                    score: score,
                    stars: stars,
                    isLevel: isLevel,
                    drinkSvgHtml: drinkSvgHtml
                });
            });
        }

        const btnShare = document.getElementById("btnShareCardAction");
        if (btnShare) {
            btnShare.addEventListener("click", () => {
                const finalDrinkName = (!isLevel && titleInput) ? (titleInput.value.trim() || "我的专属奇迹特调") : drinkName;
                this.shareCardImage({
                    drinkName: finalDrinkName,
                    subtitle: subtitle,
                    poem: poem,
                    score: score,
                    stars: stars,
                    isLevel: isLevel,
                    drinkSvgHtml: drinkSvgHtml
                });
            });
        }

        const btnRetry = document.getElementById("btnCardRetryAction");
        if (btnRetry) {
            btnRetry.addEventListener("click", () => {
                this.close();
                if (callbacks.onRetry) {
                    callbacks.onRetry();
                }
            });
        }

        const btnNext = document.getElementById("btnCardNextAction");
        if (btnNext) {
            btnNext.addEventListener("click", () => {
                this.close();
                if (isLevel && score < 60) {
                    if (callbacks.onRetry) {
                        callbacks.onRetry();
                    } else if (callbacks.onNext) {
                        callbacks.onNext();
                    }
                    return;
                }
                if (callbacks.onNext) {
                    callbacks.onNext();
                }
            });
        }
    }

    generateCardCanvas(data, callback) {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        const width = 720;
        const height = 980;
        canvas.width = width;
        canvas.height = height;

        // 1. 拍立得卡片底托与边框
        ctx.fillStyle = "#faf6ed";
        ctx.strokeStyle = "#2c221a";
        ctx.lineWidth = 5;
        this.roundRect(ctx, 3, 3, width - 6, height - 6, 16, true, true);

        const cardX = 0;
        const cardY = 0;
        const cardW = width;
        const cardH = height;

        // 2. 特调照片框
        const photoX = 26;
        const photoY = 26;
        const photoW = width - 52;
        const photoH = 540;

        ctx.fillStyle = "#eddcc7";
        ctx.strokeStyle = "#2c221a";
        ctx.lineWidth = 5;
        this.roundRect(ctx, photoX, photoY, photoW, photoH, 14, true, true);

        const grad = ctx.createRadialGradient(photoX + photoW / 2, photoY + photoH / 2, 20, photoX + photoW / 2, photoY + photoH / 2, photoW / 1.5);
        grad.addColorStop(0, "#f9f2e7");
        grad.addColorStop(1, "#dfcca8");
        ctx.fillStyle = grad;
        this.roundRect(ctx, photoX + 3, photoY + 3, photoW - 6, photoH - 6, 11, true, false);

        // 3. 绘制 SVG 特调图形
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
     * 保存图片：自适应小红书相册授权与普通环境下载/预览
     */
    exportToCanvasAndDownload(data) {
        if (window.soundEngine && window.soundEngine.playSparkle) {
            window.soundEngine.playSparkle();
        }

        this.generateCardCanvas(data, (canvas) => {
            const hasXhsBridge = typeof window.xhs !== "undefined" && window.xhs && window.xhs.miniTool && typeof window.xhs.miniTool.saveImageToPhotosAlbum === "function";

            if (hasXhsBridge) {
                // 检查是否已经获得过用户主动授权，若已授权过一次则无需重复询问
                let hasGranted = false;
                try {
                    hasGranted = window.localStorage && window.localStorage.getItem("xhs_photo_permission_granted") === "1";
                } catch (e) {}

                if (hasGranted) {
                    this.executeXhsSave(canvas);
                } else {
                    this.showPhotoPermissionModal(() => {
                        try {
                            if (window.localStorage) {
                                window.localStorage.setItem("xhs_photo_permission_granted", "1");
                            }
                        } catch (e) {}
                        this.executeXhsSave(canvas);
                    });
                }
            } else {
                // 普通浏览器直接下载
                this.triggerDownload(canvas, data.drinkName);
            }
        });
    }

    showPhotoPermissionModal(onConfirm) {
        let permModal = document.getElementById("photoPermModal");
        if (!permModal) {
            permModal = document.createElement("div");
            permModal.className = "modal-overlay photo-perm-modal";
            permModal.id = "photoPermModal";
            permModal.style.display = "none";
            permModal.innerHTML = `
                <div class="modal-content-box perm-modal-box">
                    <button class="modal-close-btn" id="btnClosePermModal" aria-label="关闭">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round">
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                    </button>
                    <div class="perm-modal-badge-wrapper">
                        <div class="perm-modal-icon-badge">
                            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                                <rect width="18" height="18" x="3" y="3" rx="2" ry="2"/>
                                <circle cx="9" cy="9" r="2"/>
                                <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/>
                            </svg>
                        </div>
                    </div>
                    <div class="perm-modal-title">保存拍立得到相册</div>
                    <div class="perm-modal-desc">
                        需要使用手机<strong>相册存储权限</strong>，将您亲手调配的独家特调拍立得卡片存入相册留念，方便随时翻阅回味与好友分享。
                    </div>
                    <div class="perm-privacy-tip">
                        <span class="tip-dot">🔒</span> 仅用于将本次特调图片写入您的系统相册，我们绝不读取任何私密照片
                    </div>
                    <div class="perm-modal-actions">
                        <button class="btn btn-secondary perm-btn-cancel" id="btnCancelPerm">暂不保存</button>
                        <button class="btn btn-primary btn-orange perm-btn-confirm" id="btnConfirmPerm">同意并保存</button>
                    </div>
                </div>
            `;
            document.body.appendChild(permModal);
        }

        const btnCancel = permModal.querySelector("#btnCancelPerm");
        const btnConfirm = permModal.querySelector("#btnConfirmPerm");
        const btnClose = permModal.querySelector("#btnClosePermModal");

        const dismiss = () => {
            permModal.classList.remove("active");
            try {
                permModal.style.setProperty("display", "none", "important");
            } catch (e) {
                permModal.style.display = "none";
            }
        };

        if (btnCancel) btnCancel.onclick = dismiss;
        if (btnClose) btnClose.onclick = dismiss;
        permModal.onclick = (e) => {
            if (e.target === permModal) dismiss();
        };

        if (btnConfirm) {
            btnConfirm.onclick = () => {
                dismiss();
                if (onConfirm) onConfirm();
            };
        }

        permModal.classList.add("active");
        try {
            permModal.style.setProperty("display", "flex", "important");
        } catch (e) {
            permModal.style.display = "flex";
        }
    }

    executeXhsSave(canvas) {
        try {
            const base64Data = canvas.toDataURL("image/png");
            const tempFileName = `cozy_bar_${Date.now()}.png`;

            if (typeof window.xhs.miniTool.writeTempFile === "function") {
                window.xhs.miniTool.writeTempFile({
                    filePath: tempFileName,
                    data: base64Data,
                    encoding: "base64",
                    success: (res) => {
                        const savedPath = (res && res.filePath) ? res.filePath : tempFileName;
                        window.xhs.miniTool.saveImageToPhotosAlbum({
                            filePath: savedPath,
                            success: () => {
                                this.showToast("📸 拍立得已成功保存到手机相册！✨");
                            },
                            fail: (err) => {
                                console.warn("相册保存未成功", err);
                                this.showToast("保存已取消或未获得相册权限");
                            }
                        });
                    },
                    fail: (err) => {
                        console.error("写入临时文件失败", err);
                        this.showToast("图片生成失败，请稍后重试");
                    }
                });
            } else {
                this.showToast("当前环境暂不支持直接写入相册");
            }
        } catch (err) {
            console.error("相册存储流程异常", err);
            this.showToast("相册保存异常，请稍后重试");
        }
    }

    triggerDownload(canvas, name) {
        try {
            const link = document.createElement("a");
            link.download = `${name}_治愈特调.png`;
            link.href = canvas.toDataURL("image/png");
            link.click();
            this.showToast("📸 拍立得特调卡片已保存到本地！✨");
        } catch (e) {
            console.error("下载失败", e);
            this.showToast("图片下载失败，请稍后重试");
        }
    }

    shareCardImage(data) {
        if (window.soundEngine && window.soundEngine.playSparkle) {
            window.soundEngine.playSparkle();
        }

        const drinkName = data.drinkName || "治愈奇迹特调";
        const hasQr = Boolean(window.QRCodeEngine);
        const shareText = hasQr
            ? `我在治愈特调吧亲手调配了一杯【${drinkName}】，快来扫码品尝吧！🍹`
            : `我在治愈特调吧亲手调配了一杯【${drinkName}】，快来品尝这杯治愈特调吧！🍹`;
        this.copyTextToClipboard(shareText);

        const hasXhsShare = typeof window.xhs !== "undefined" && window.xhs && window.xhs.miniTool && typeof window.xhs.miniTool.share === "function";

        if (hasXhsShare) {
            window.xhs.miniTool.share({
                title: `治愈特调 · ${drinkName}`,
                desc: shareText,
                success: () => {
                    this.showToast("分享成功！✨");
                },
                fail: () => {
                    this.showToast("若未弹出分享面板，请点击右上角【...】分享哦 🍹");
                }
            });
        } else if (typeof navigator !== "undefined" && typeof navigator.share === "function") {
            navigator.share({
                title: `治愈特调 · ${drinkName}`,
                text: shareText
            }).catch(() => {
                this.showToast("文案已复制！请点击右上角【...】分享给好友 🍹");
            });
        } else {
            this.showToast("分享文案已复制！可直接粘贴发给好友 🍹");
        }
    }

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
        }
        return success;
    }

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

        // 特调名称大标题
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
            let starStr = "";
            for (let i = 0; i < 3; i++) {
                starStr += i < data.stars ? "★" : "☆";
            }
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

        // 底部右侧：自适应渲染印章与二维码
        if (window.QRCodeEngine) {
            // Web 环境：左侧为 COZY BAR 印章，右侧为二维码
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
            ctx.font = "bold 13px -apple-system, 'PingFang SC', sans-serif";
            ctx.fillText("治愈特调馆", sealX + 46, sealY - 4);

            // 右侧二维码
            const qrSize = 74;
            const qrX = cardW - 110;
            const qrY = textStartY + 182;

            ctx.fillStyle = "#ffffff";
            ctx.strokeStyle = "#2c221a";
            ctx.lineWidth = 2.5;
            this.roundRect(ctx, qrX, qrY, qrSize, qrSize, 8, true, true);

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

            ctx.fillStyle = "#8a7566";
            ctx.font = "bold 12px -apple-system, 'PingFang SC', sans-serif";
            ctx.textAlign = "center";
            ctx.fillText("扫码同玩 🍹", qrX + qrSize / 2, qrY + qrSize + 16);
        } else {
            // 小红书/轻量环境：无二维码，只有 COZY BAR 治愈特调馆 印章自动靠在最右侧
            const sealW = 106;
            const sealH = 50;
            const sealX = cardW - sealW - 28;
            const sealY = textStartY + 232;

            ctx.strokeStyle = "#c2410c";
            ctx.lineWidth = 3.5;
            ctx.fillStyle = "rgba(194, 65, 12, 0.08)";
            this.roundRect(ctx, sealX, sealY - 40, sealW, sealH, 10, true, true);

            ctx.fillStyle = "#c2410c";
            ctx.font = "900 13px sans-serif";
            ctx.textAlign = "center";
            ctx.fillText("COZY BAR", sealX + sealW / 2, sealY - 21);
            ctx.font = "bold 14px -apple-system, 'PingFang SC', sans-serif";
            ctx.fillText("治愈特调馆", sealX + sealW / 2, sealY - 4);
        }
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
}

window.shareCardManager = new ShareCardManager();
