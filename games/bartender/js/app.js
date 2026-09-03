/**
 * 治愈调饮吧台核心业务逻辑 (App.js)
 * 特色：
 * 1. 顶部极简三列布局 (左:菜单设置 | 中:关卡名称 | 右:钻石+金币货币组)
 * 2. 菜单设置弹窗：统一整齐的长条条状按钮排版
 * 3. 独立可翻页配方手账 (Recipe Book)：
 *    - 支持第一章与第二章全部 18 款手绘特调秘方
 *    - 顾客栏右侧常驻手绘悬浮小书入口，关卡卡片内部独立小书直达入口
 * 4. 🧪 量杯渐变分层系统 (Measuring Cup System)：
 *    - 支持 1/1 全杯、1/2 半杯量杯 (默认拥有)
 *    - 支持金币解锁 1/3 量杯 (300💰)、1/4 量杯 (600💰)
 *    - 打造大师级绝美双色、三色、四色彩虹渐变特调
 * 5. 🔮 章节系统与第二章解锁：
 *    - 第一章：晨曦与晚风 (第 1~9 关)
 *    - 第二章：微醺与星芒 (第 10~18 关，消耗 300 💎 钻石解锁)
 * 6. 🏆 成就系统 (保留 9 阶星级阶梯，每 9 颗星奖励 100 💎 + 1000 💰；关卡首次完美再奖 10 💎 + 200 💰)
 * 7. 彻底淘汰原生 alert，统一手绘牛皮纸通知弹窗
 * 8. 自动调配按钮：满分100分通关后解锁，支持单色与多层渐变自动调制
 */

// 全局杯型名称与图标格式化 (支持第三章中杯、大杯、吨吨桶与前两章玻璃杯)
window.formatGlassName = function(glassType) {
    const map = {
        classic: "圆柱矮杯",
        hourglass: "沙漏杯",
        martini: "高脚杯",
        sphere: "球形杯",
        milk_carton: "牛奶盒杯",
        tulip: "郁金香杯",
        holy_grail: "奇迹圣杯",
        cup_medium: "中杯",
        cup_large: "大杯",
        cup_bucket: "吨吨桶"
    };
    return map[glassType] || glassType;
};

window.formatGlassIcon = function(glassType) {
    const map = {
        classic: "🥛",
        hourglass: "⏳",
        martini: "🍸",
        sphere: "🔮",
        milk_carton: "🧃",
        tulip: "🌷",
        holy_grail: "🏆",
        cup_medium: "🥤",
        cup_large: "🧋",
        cup_bucket: "🪣"
    };
    return map[glassType] || "🥤";
};

class BartenderApp {
    constructor() {
        this.gameMode = "level"; // 'level' | 'free'
        this.currentLevel = 1;
        this.selectedChapter = 1;
        this.recipeBookPage = 1; // 配方手账当前页码
        this.currentMeasuringCup = "half"; // 默认使用 1/2 量杯

        // 🏪 第三章模拟经营专属状态机
        this.c3State = {
            active: false,
            levelConfig: null,
            totalCustomers: 5,
            currentCustomerIndex: 0,
            currentCustomer: null,
            customerTimer: null,
            levelTimer: null,
            timeLeft: 150,
            totalRevenue: 0,
            materialCosts: 0,
            penaltyCosts: 0,
            netProfit: 0,
            ordersCompleted: 0,
            ordersFailed: 0
        };

        this.currentDrink = {
            glassType: "classic",
            liquid: null,
            liquids: [], // 支持多层渐变分层 [{ id, name, colorTop, colorBottom, ratio }]
            inCupItems: [],
            foamLayer: "none",
            topper: "none",
            customName: ""
        };

        this.currentStep = "glass";

        this.dom = {};
        this.initDOM();
        this.loadSaveData();
        this.bindEvents();
        this.updateCurrencyDisplay();
        this.initModeView();
        this.renderIngredientsPanel();
        this.updateDrinkView();
    }

    initDOM() {
        // 顶部极简导航
        this.dom.btnOpenSettings = document.getElementById("btnOpenSettings");
        this.dom.navLevelBadge = document.getElementById("navLevelBadge");
        this.dom.diamondAmountText = document.getElementById("diamondAmountText");
        this.dom.coinAmountText = document.getElementById("coinAmountText");

        // 中部顾客与悬浮入口
        this.dom.targetInfo = document.getElementById("targetInfo");
        this.dom.btnOpenRecipeBook = document.getElementById("btnOpenRecipeBook");
        this.dom.btnOpenAchievements = document.getElementById("btnOpenAchievements");
        this.dom.achRedDot = document.getElementById("achRedDot");
        this.dom.drinkStage = document.getElementById("drinkStage");
        this.dom.categoryTabs = document.querySelectorAll(".category-tab");
        this.dom.ingredientsGrid = document.getElementById("ingredientsGrid");

        // 🧪 量杯选择器 DOM
        this.dom.measuringCupBar = document.getElementById("measuringCupBar");
        this.dom.measuringCupsGroup = document.getElementById("measuringCupsGroup");
        this.dom.liquidCupProgressText = document.getElementById("liquidCupProgressText");

        // 底部工具栏
        this.dom.btnDump = document.getElementById("btnDump");
        this.dom.btnAutoBrew = document.getElementById("btnAutoBrew");
        this.dom.autoBrewIcon = document.getElementById("autoBrewIcon");
        this.dom.autoBrewText = document.getElementById("autoBrewText");
        this.dom.btnFinish = document.getElementById("btnFinish");

        // 弹窗系统
        this.dom.modalOverlay = document.getElementById("modalOverlay");
        this.dom.levelSelectModal = document.getElementById("levelSelectModal");
        this.dom.levelGrid = document.getElementById("levelGrid");
        this.dom.btnCloseLevelModal = document.getElementById("btnCloseLevelModal");
        this.dom.btnLevelStarsTrophy = document.getElementById("btnLevelStarsTrophy");
        this.dom.levelStarsRatioText = document.getElementById("levelStarsRatioText");
        this.dom.effectLayer = document.getElementById("effectLayer");

        // 🚩 章节切换与第二章解锁 DOM
        this.dom.btnTabChapter1 = document.getElementById("btnTabChapter1");
        this.dom.btnTabChapter2 = document.getElementById("btnTabChapter2");
        this.dom.chap2SubText = document.getElementById("chap2SubText");
        this.dom.chapterLockPanel = document.getElementById("chapterLockPanel");
        this.dom.btnUnlockChapter2 = document.getElementById("btnUnlockChapter2");
        this.dom.chapUnlockDiamondTip = document.getElementById("chapUnlockDiamondTip");

        // ⚙️ 设置与菜单弹窗 DOM (长条按钮排版)
        this.dom.settingsModal = document.getElementById("settingsModal");
        this.dom.settingsModalTitleText = document.getElementById("settingsModalTitleText");
        this.dom.settingsModalTitleIcon = document.getElementById("settingsModalTitleIcon");
        this.dom.btnCloseSettingsModal = document.getElementById("btnCloseSettingsModal");
        this.dom.btnSettingToggleMode = document.getElementById("btnSettingToggleMode");
        this.dom.settingsModeBadge = document.getElementById("settingsModeBadge");
        this.dom.btnSettingOpenLevels = document.getElementById("btnSettingOpenLevels");
        this.dom.settingsLevelValueText = document.getElementById("settingsLevelValueText");
        this.dom.btnSettingOpenRecipes = document.getElementById("btnSettingOpenRecipes");
        this.dom.btnSettingToggleBgm = document.getElementById("btnSettingToggleBgm");
        this.dom.settingsBgmIcon = document.getElementById("settingsBgmIcon");
        this.dom.settingsBgmBadge = document.getElementById("settingsBgmBadge");
        this.dom.btnSettingResetCup = document.getElementById("btnSettingResetCup");
        this.dom.btnResumeGame = document.getElementById("btnResumeGame");

        // 📖 独立配方手账书 DOM
        this.dom.recipeBookModal = document.getElementById("recipeBookModal");
        this.dom.btnCloseRecipeBookModal = document.getElementById("btnCloseRecipeBookModal");
        this.dom.btnBookPrevPage = document.getElementById("btnBookPrevPage");
        this.dom.btnBookNextPage = document.getElementById("btnBookNextPage");
        this.dom.bookPageIndicator = document.getElementById("bookPageIndicator");
        this.dom.recipeBookPageContent = document.getElementById("recipeBookPageContent");

        // 🏆 成就勋章馆弹窗 DOM
        this.dom.achievementModal = document.getElementById("achievementModal");
        this.dom.btnCloseAchievementModal = document.getElementById("btnCloseAchievementModal");
        this.dom.achTotalStarsDisplay = document.getElementById("achTotalStarsDisplay");
        this.dom.achTotalStarsBarFill = document.getElementById("achTotalStarsBarFill");
        this.dom.achievementListContainer = document.getElementById("achievementListContainer");

        // 🏪 统一手绘风购买弹窗 DOM
        this.dom.shopModal = document.getElementById("shopModal");
        this.dom.btnCloseShopModal = document.getElementById("btnCloseShopModal");
        this.dom.btnCancelShop = document.getElementById("btnCancelShop");
        this.dom.btnConfirmBuy = document.getElementById("btnConfirmBuy");
        this.dom.shopModalIcon = document.getElementById("shopModalIcon");
        this.dom.shopModalTitle = document.getElementById("shopModalTitle");
        this.dom.shopModalCat = document.getElementById("shopModalCat");
        this.dom.shopModalDesc = document.getElementById("shopModalDesc");
        this.dom.shopModalCost = document.getElementById("shopModalCost");
        this.dom.shopModalCurrentCoins = document.getElementById("shopModalCurrentCoins");
        this.dom.shopModalAfterRow = document.getElementById("shopModalAfterRow");
        this.dom.shopModalAfterCoins = document.getElementById("shopModalAfterCoins");
        this.dom.shopModalShortageTip = document.getElementById("shopModalShortageTip");
        this.dom.shopShortageAmount = document.getElementById("shopShortageAmount");

        // 💡 统一手绘通知提示弹窗 DOM (替代原生 alert)
        this.dom.noticeModal = document.getElementById("noticeModal");
        this.dom.btnCloseNoticeModal = document.getElementById("btnCloseNoticeModal");
        this.dom.noticeModalIcon = document.getElementById("noticeModalIcon");
        this.dom.noticeModalTitle = document.getElementById("noticeModalTitle");
        this.dom.noticeModalMessage = document.getElementById("noticeModalMessage");
        this.dom.btnConfirmNotice = document.getElementById("btnConfirmNotice");

        // 🏪 第三章模拟经营与店铺 DOM
        this.dom.btnTabChapter3 = document.getElementById("btnTabChapter3");
        this.dom.chap3SubText = document.getElementById("chap3SubText");
        this.dom.chapter3LockPanel = document.getElementById("chapter3LockPanel");
        this.dom.btnUnlockChapter3 = document.getElementById("btnUnlockChapter3");
        this.dom.chap3UnlockDiamondTip = document.getElementById("chap3UnlockDiamondTip");

        this.dom.targetSection = document.getElementById("targetSection");
        this.dom.c3DashboardSection = document.getElementById("c3DashboardSection");
        this.dom.c3ShopBrandTag = document.getElementById("c3ShopBrandTag");
        this.dom.c3ShopNameDisplay = document.getElementById("c3ShopNameDisplay");
        this.dom.c3BrandSubDisplay = document.getElementById("c3BrandSubDisplay");
        this.dom.btnC3CloseShop = document.getElementById("btnC3CloseShop");
        this.dom.c3CloseShopText = document.getElementById("c3CloseShopText");
        this.dom.c3TimerValText = document.getElementById("c3TimerValText");
        this.dom.c3CustAvatar = document.getElementById("c3CustAvatar");
        this.dom.c3CustName = document.getElementById("c3CustName");
        this.dom.c3OrderCounter = document.getElementById("c3OrderCounter");
        this.dom.c3CupDemandBadge = document.getElementById("c3CupDemandBadge");
        this.dom.c3DrinkDemandName = document.getElementById("c3DrinkDemandName");
        this.dom.c3DrinkPricePill = document.getElementById("c3DrinkPricePill");
        this.dom.btnC3QuickRecipe = document.getElementById("btnC3QuickRecipe");
        this.dom.c3PatienceBarFill = document.getElementById("c3PatienceBarFill");
        this.dom.c3PatienceText = document.getElementById("c3PatienceText");
        this.dom.c3TotalRevenue = document.getElementById("c3TotalRevenue");
        this.dom.c3MaterialCosts = document.getElementById("c3MaterialCosts");
        this.dom.c3NetProfit = document.getElementById("c3NetProfit");
        this.dom.c3TargetProfitSub = document.getElementById("c3TargetProfitSub");

        // 开业命名弹窗
        this.dom.shopNameModal = document.getElementById("shopNameModal");
        this.dom.btnCloseShopNameModal = document.getElementById("btnCloseShopNameModal");
        this.dom.shopNameInput = document.getElementById("shopNameInput");
        this.dom.btnConfirmOpenShop = document.getElementById("btnConfirmOpenShop");

        // 公开配方抽屉弹窗
        this.dom.quickRecipeModal = document.getElementById("quickRecipeModal");
        this.dom.btnCloseQuickRecipeModal = document.getElementById("btnCloseQuickRecipeModal");
        this.dom.quickRecipeBrandTitle = document.getElementById("quickRecipeBrandTitle");
        this.dom.quickRecipeList = document.getElementById("quickRecipeList");

        // 第三章经营打烊结算弹窗
        this.dom.c3ResultModal = document.getElementById("c3ResultModal");
        this.dom.c3ResTitle = document.getElementById("c3ResTitle");
        this.dom.c3ResBrand = document.getElementById("c3ResBrand");
        this.dom.c3StarRow1 = document.getElementById("c3StarRow1");
        this.dom.c3StarRow2 = document.getElementById("c3StarRow2");
        this.dom.c3StarRow3 = document.getElementById("c3StarRow3");
        this.dom.c3StarValOrders = document.getElementById("c3StarValOrders");
        this.dom.c3StarValTime = document.getElementById("c3StarValTime");
        this.dom.c3StarValProfit = document.getElementById("c3StarValProfit");
        this.dom.c3SumRevenue = document.getElementById("c3SumRevenue");
        this.dom.c3SumCosts = document.getElementById("c3SumCosts");
        this.dom.c3SumPenaltyRow = document.getElementById("c3SumPenaltyRow");
        this.dom.c3SumPenalty = document.getElementById("c3SumPenalty");
        this.dom.c3SumFinalProfit = document.getElementById("c3SumFinalProfit");
        this.dom.c3EarnedStarsCount = document.getElementById("c3EarnedStarsCount");
        this.dom.btnC3Replay = document.getElementById("btnC3Replay");
        this.dom.btnC3NextLevel = document.getElementById("btnC3NextLevel");

        // 飘字容器
        this.dom.floatingTextContainer = document.getElementById("floatingTextContainer");
    }

    loadSaveData() {
        this.saveData = window.StorageManager.getData();
    }

    updateCurrencyDisplay() {
        this.loadSaveData();
        if (this.dom.coinAmountText) {
            this.dom.coinAmountText.textContent = this.saveData.coins || 0;
        }
        if (this.dom.diamondAmountText) {
            this.dom.diamondAmountText.textContent = this.saveData.diamonds || 0;
        }
        this.updateAchievementRedDot();
        this.updateLevelStarsRatio();
    }

    updateLevelStarsRatio() {
        if (this.dom.levelStarsRatioText) {
            const total = window.StorageManager.getTotalStars();
            this.dom.levelStarsRatioText.textContent = `${total}/81`;
        }
    }

    updateAchievementRedDot() {
        if (!this.dom.achRedDot) return;
        const hasUnclaimed = window.StorageManager.hasUnclaimedAchievements();
        this.dom.achRedDot.style.display = hasUnclaimed ? "block" : "none";
    }

    bindEvents() {
        // 打开与关闭设置菜单
        if (this.dom.btnOpenSettings) {
            this.dom.btnOpenSettings.addEventListener("click", () => {
                this.openSettingsModal();
            });
        }
        if (this.dom.btnCloseSettingsModal) {
            this.dom.btnCloseSettingsModal.addEventListener("click", () => {
                this.closeSettingsModal();
            });
        }
        if (this.dom.btnResumeGame) {
            this.dom.btnResumeGame.addEventListener("click", () => {
                this.closeSettingsModal();
            });
        }
        if (this.dom.settingsModal) {
            this.dom.settingsModal.addEventListener("click", (e) => {
                if (e.target === this.dom.settingsModal) {
                    this.closeSettingsModal();
                }
            });
        }

        // 设置长条按钮 1：模式切换
        if (this.dom.btnSettingToggleMode) {
            this.dom.btnSettingToggleMode.addEventListener("click", () => {
                this.gameMode = this.gameMode === "level" ? "free" : "level";
                window.soundEngine.playBubble();
                this.initModeView();
                this.resetCup();
                this.updateSettingsView();
            });
        }

        // 设置长条按钮 2：打开关卡列表 (在暂停状态下打开，依然保持暂停)
        if (this.dom.btnSettingOpenLevels) {
            this.dom.btnSettingOpenLevels.addEventListener("click", () => {
                this.closeSettingsModal();
                this.openLevelSelect();
            });
        }

        // 设置长条按钮 3：查阅关卡配方表 (在暂停状态下安心翻看配方，保持暂停)
        if (this.dom.btnSettingOpenRecipes) {
            this.dom.btnSettingOpenRecipes.addEventListener("click", () => {
                this.closeSettingsModal();
                this.openRecipeBook(this.currentLevel);
            });
        }

        // 设置长条按钮 3：BGM 切换
        if (this.dom.btnSettingToggleBgm) {
            this.dom.btnSettingToggleBgm.addEventListener("click", () => {
                const isPlaying = window.soundEngine.toggleBGM();
                if (isPlaying) {
                    this.dom.settingsBgmIcon.innerHTML = `
                        <svg class="settings-svg-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M9 18V5l12-2v13"></path>
                            <circle cx="6" cy="18" r="3"></circle>
                            <circle cx="18" cy="16" r="3"></circle>
                        </svg>
                    `;
                    this.dom.settingsBgmBadge.textContent = "开启中";
                    this.dom.settingsBgmBadge.style.background = "#fee6cb";
                } else {
                    this.dom.settingsBgmIcon.innerHTML = `
                        <svg class="settings-svg-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                            <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
                            <line x1="22" y1="9" x2="16" y2="15"></line>
                            <line x1="16" y1="9" x2="22" y2="15"></line>
                        </svg>
                    `;
                    this.dom.settingsBgmBadge.textContent = "已静音";
                    this.dom.settingsBgmBadge.style.background = "#e2e8f0";
                }
            });
        }

        // 设置长条按钮 4：重置清空吧台
        if (this.dom.btnSettingResetCup) {
            this.dom.btnSettingResetCup.addEventListener("click", () => {
                window.soundEngine.playDump();
                this.triggerCupShake();
                this.resetCup();
                this.closeSettingsModal();
            });
        }

        // 📖 客人栏正下方悬浮配方按钮 (与成就按钮统一并排)
        if (this.dom.btnOpenRecipeBook) {
            this.dom.btnOpenRecipeBook.addEventListener("click", () => {
                if (this.c3State.active) {
                    this.openQuickRecipeModal();
                } else {
                    this.openRecipeBook();
                }
            });
        }

        // 🏆 客人栏下方靠左悬浮成就按钮
        if (this.dom.btnOpenAchievements) {
            this.dom.btnOpenAchievements.addEventListener("click", () => {
                this.openAchievementModal();
            });
        }

        // 关卡弹窗标题后的 0/27 🏆 徽章按钮
        if (this.dom.btnLevelStarsTrophy) {
            this.dom.btnLevelStarsTrophy.addEventListener("click", () => {
                this.dom.levelSelectModal.classList.remove("active");
                this.openAchievementModal();
            });
        }

        // 🚩 关卡弹窗章节选项卡切换 (第一章、第二章、第三章)
        if (this.dom.btnTabChapter1) {
            this.dom.btnTabChapter1.addEventListener("click", () => {
                this.selectedChapter = 1;
                this.dom.btnTabChapter1.classList.add("active");
                if (this.dom.btnTabChapter2) this.dom.btnTabChapter2.classList.remove("active");
                if (this.dom.btnTabChapter3) this.dom.btnTabChapter3.classList.remove("active");
                window.soundEngine.playBubble();
                this.renderLevelGrid();
            });
        }
        if (this.dom.btnTabChapter2) {
            this.dom.btnTabChapter2.addEventListener("click", () => {
                this.selectedChapter = 2;
                this.dom.btnTabChapter2.classList.add("active");
                if (this.dom.btnTabChapter1) this.dom.btnTabChapter1.classList.remove("active");
                if (this.dom.btnTabChapter3) this.dom.btnTabChapter3.classList.remove("active");
                window.soundEngine.playBubble();
                this.renderLevelGrid();
            });
        }
        if (this.dom.btnTabChapter3) {
            this.dom.btnTabChapter3.addEventListener("click", () => {
                this.selectedChapter = 3;
                this.dom.btnTabChapter3.classList.add("active");
                if (this.dom.btnTabChapter1) this.dom.btnTabChapter1.classList.remove("active");
                if (this.dom.btnTabChapter2) this.dom.btnTabChapter2.classList.remove("active");
                window.soundEngine.playBubble();
                this.renderLevelGrid();
            });
        }

        // 🔮 消耗 300 钻石解锁第二章
        if (this.dom.btnUnlockChapter2) {
            this.dom.btnUnlockChapter2.addEventListener("click", () => {
                this.loadSaveData();
                const currentDiamonds = this.saveData.diamonds || 0;
                if (currentDiamonds >= 300) {
                    const res = window.StorageManager.unlockChapter(2, 300);
                    if (res && res.success) {
                        window.soundEngine.playSparkle();
                        window.soundEngine.playCoin();
                        this.triggerEffect("star_shower");
                        this.updateCurrencyDisplay();
                        this.showNotice({
                            title: "🎉 第二章成功解锁！",
                            message: "恭喜开启【第二章：微醺与星芒】！\n\n全新量杯渐变分层系统与 9 款绝美网红特调已就绪，快去一探究竟吧！🔮",
                            icon: "✨",
                            btnText: "立即探索 🍹"
                        });
                        this.renderLevelGrid();
                    }
                } else {
                    const shortage = 300 - currentDiamonds;
                    this.showNotice({
                        title: "钻石不足",
                        message: `解锁第二章需要 300 💎 钻石，当前还差 ${shortage} 💎！\n\n💡 提示：可以通过达成关卡星级成就或关卡首次 100 分挑战来获取丰厚钻石哦~ ⭐`,
                        icon: "🔒",
                        btnText: "去集星挑战 🚀"
                    });
                }
            });
        }

        // 🏪 消耗 1000 钻石盘下店铺解锁第三章
        if (this.dom.btnUnlockChapter3) {
            this.dom.btnUnlockChapter3.addEventListener("click", () => {
                this.loadSaveData();
                const currentDiamonds = this.saveData.diamonds || 0;
                if (currentDiamonds >= 1000) {
                    const res = window.StorageManager.unlockChapter(3, 1000);
                    if (res && res.success) {
                        window.soundEngine.playSparkle();
                        window.soundEngine.playCoin();
                        this.triggerEffect("star_shower");
                        this.updateCurrencyDisplay();
                        // 弹出开业与店铺命名弹窗
                        this.openShopNameModal(true);
                    }
                } else {
                    const shortage = 1000 - currentDiamonds;
                    this.showNotice({
                        title: "钻石不足",
                        message: `盘下茶饮小店开业需要 1000 💎 钻石，当前还差 ${shortage} 💎！\n\n💡 提示：可以通过达成集星阶梯成就或关卡首次满分 100 分来获取大量钻石哦~ ⭐`,
                        icon: "🏪",
                        btnText: "去赚钻石 🚀"
                    });
                }
            });
        }

        // 店铺开业/改名弹窗交互
        if (this.dom.btnCloseShopNameModal) {
            this.dom.btnCloseShopNameModal.addEventListener("click", () => {
                this.closeShopNameModal();
            });
        }
        if (this.dom.btnConfirmOpenShop) {
            this.dom.btnConfirmOpenShop.addEventListener("click", () => {
                const name = this.dom.shopNameInput.value.trim() || "治愈特调吧";
                window.StorageManager.setShopName(name);
                this.loadSaveData();
                if (this.dom.c3ShopNameDisplay) this.dom.c3ShopNameDisplay.textContent = name;
                window.soundEngine.playSparkle();
                this.closeShopNameModal();
                this.renderLevelGrid();
                this.showNotice({
                    title: "🎉 开启【第三章：烟火与茶香】！",
                    message: `恭喜店长！【${name}】今日正式挂牌开业！\n\n9 家知名经典茶饮名店（蜜雪冰冰、亿点点、谷茗...）订单汹涌而来，小料无需解锁放一次仅 10💰，祝您生意兴隆，出杯大卖！🍹`,
                    icon: "🏮",
                    btnText: "前往迎客 👨‍🍳"
                });
            });
        }

        // 点击吧台店名招牌可再次修改店名
        if (this.dom.c3ShopBrandTag) {
            this.dom.c3ShopBrandTag.addEventListener("click", () => {
                this.openShopNameModal(false);
            });
        }

        // 快捷配方抽屉按钮与关闭
        if (this.dom.btnC3QuickRecipe) {
            this.dom.btnC3QuickRecipe.addEventListener("click", () => {
                this.openQuickRecipeModal();
            });
        }
        if (this.dom.btnCloseQuickRecipeModal) {
            this.dom.btnCloseQuickRecipeModal.addEventListener("click", () => {
                this.closeQuickRecipeModal();
            });
        }

        // 🏪 提前打烊结算按钮 (需满足最少订单量可点击)
        if (this.dom.btnC3CloseShop) {
            this.dom.btnC3CloseShop.addEventListener("click", () => {
                const minOrders = this.c3State.minOrders || 5;
                const completed = this.c3State.ordersCompleted || 0;
                if (completed < minOrders) {
                    window.soundEngine.playBubble();
                    this.showNotice({
                        title: "尚未达成最少订单量",
                        message: `至少需要成功出杯 ${minOrders} 单客人的特调需求才能打烊盘点哦！\n\n当前已出杯 ${completed} 单，还需完成 ${minOrders - completed} 单，加油店长！🍹`,
                        icon: "🛎️",
                        btnText: "继续迎客 🏃"
                    });
                    return;
                }
                // 确认提前打烊
                if (window.soundEngine.playBell) window.soundEngine.playBell();
                else window.soundEngine.playSuccess();
                this.clearC3Timers();
                this.showNotice({
                    title: "🛎️ 今日营业打烊结算！",
                    message: `太棒了店长！今日营业总计成功接待出杯 ${completed} 单（已达标最少 ${minOrders} 单）！\n\n让我们一同查看今日的丰厚营业额与星级评价吧！📋`,
                    icon: "🎉",
                    btnText: "查看营业清单 📋",
                    onConfirm: () => {
                        this.finishC3Level();
                    }
                });
            });
        }

        // 第三章结算弹窗重来与下一关
        if (this.dom.btnC3Replay) {
            this.dom.btnC3Replay.addEventListener("click", () => {
                this.closeC3ResultModal();
                this.startC3Level(this.currentLevel);
            });
        }
        if (this.dom.btnC3NextLevel) {
            this.dom.btnC3NextLevel.addEventListener("click", () => {
                this.closeC3ResultModal();
                if (this.currentLevel < window.DRINK_RECIPES.length) {
                    this.currentLevel++;
                    this.initModeView();
                } else {
                    this.openLevelSelect();
                }
            });
        }

        // 成就弹窗关闭
        if (this.dom.btnCloseAchievementModal) {
            this.dom.btnCloseAchievementModal.addEventListener("click", () => {
                this.closeAchievementModal();
            });
        }
        if (this.dom.achievementModal) {
            this.dom.achievementModal.addEventListener("click", (e) => {
                if (e.target === this.dom.achievementModal) {
                    this.closeAchievementModal();
                }
            });
        }

        // 配方手账关闭与翻页
        if (this.dom.btnCloseRecipeBookModal) {
            this.dom.btnCloseRecipeBookModal.addEventListener("click", () => {
                this.closeRecipeBook();
            });
        }
        if (this.dom.recipeBookModal) {
            this.dom.recipeBookModal.addEventListener("click", (e) => {
                if (e.target === this.dom.recipeBookModal) {
                    this.closeRecipeBook();
                }
            });
        }
        if (this.dom.btnBookPrevPage) {
            this.dom.btnBookPrevPage.addEventListener("click", () => {
                if (this.recipeBookPage > 1) {
                    this.recipeBookPage--;
                    this.recipeSubIndex = 0;
                    window.soundEngine.playBubble();
                    this.renderRecipeBookPage();
                }
            });
        }
        if (this.dom.btnBookNextPage) {
            this.dom.btnBookNextPage.addEventListener("click", () => {
                if (this.recipeBookPage < window.DRINK_RECIPES.length) {
                    this.recipeBookPage++;
                    this.recipeSubIndex = 0;
                    window.soundEngine.playBubble();
                    this.renderRecipeBookPage();
                }
            });
        }

        // 关卡选择弹窗关闭
        if (this.dom.btnCloseLevelModal) {
            this.dom.btnCloseLevelModal.addEventListener("click", () => {
                this.closeLevelSelect();
            });
        }
        if (this.dom.levelSelectModal) {
            this.dom.levelSelectModal.addEventListener("click", (e) => {
                if (e.target === this.dom.levelSelectModal) {
                    this.closeLevelSelect();
                }
            });
        }

        // 购买弹窗关闭
        if (this.dom.btnCloseShopModal) {
            this.dom.btnCloseShopModal.addEventListener("click", () => {
                this.closeShopModal();
            });
        }
        if (this.dom.btnCancelShop) {
            this.dom.btnCancelShop.addEventListener("click", () => {
                this.closeShopModal();
            });
        }
        if (this.dom.shopModal) {
            this.dom.shopModal.addEventListener("click", (e) => {
                if (e.target === this.dom.shopModal) {
                    this.closeShopModal();
                }
            });
        }

        // 💡 统一通知提示弹窗关闭
        if (this.dom.btnCloseNoticeModal) {
            this.dom.btnCloseNoticeModal.addEventListener("click", () => {
                this.closeNotice();
            });
        }
        if (this.dom.btnConfirmNotice) {
            this.dom.btnConfirmNotice.addEventListener("click", () => {
                this.closeNotice();
            });
        }
        if (this.dom.noticeModal) {
            this.dom.noticeModal.addEventListener("click", (e) => {
                if (e.target === this.dom.noticeModal) {
                    this.closeNotice();
                }
            });
        }

        // 分类标签切换
        this.dom.categoryTabs.forEach(tab => {
            tab.addEventListener("click", () => {
                this.dom.categoryTabs.forEach(t => t.classList.remove("active"));
                tab.classList.add("active");
                this.currentStep = tab.dataset.step;
                this.renderIngredientsPanel();
            });
        });

        // 清空
        this.dom.btnDump.addEventListener("click", () => {
            window.soundEngine.playDump();
            this.triggerCupShake();
            setTimeout(() => {
                this.resetCup();
            }, 200);
        });

        // 自动调配 (满分通关解锁)
        this.dom.btnAutoBrew.addEventListener("click", () => {
            const isLevel = this.gameMode === "level";
            if (!isLevel) return;

            this.loadSaveData();
            const record = this.saveData.levelRecords[this.currentLevel];
            const isPerfect = record && record.score === 100;

            if (isPerfect) {
                const recipe = this.getCurrentTargetRecipe();
                this.autoBrewRecipe(recipe);
            } else {
                const levelCode = window.formatLevelCode ? window.formatLevelCode(this.currentLevel) : this.currentLevel;
                this.showNotice({
                    title: "自动调配未解锁",
                    message: `需要在第 ${levelCode} 关取得 100 满分神作评价后解锁自动调配哦！\n\n快去亲手调制一杯满分特调吧 ⭐⭐⭐`,
                    icon: "🔒",
                    btnText: "去挑战满分 🍹"
                });
            }
        });

        // 调制完成
        this.dom.btnFinish.addEventListener("click", () => {
            this.finishDrink();
        });

        // 页面可见性变化监听 (浏览器切标签页或手机切后台自动暂停/恢复)
        document.addEventListener("visibilitychange", () => {
            if (document.hidden) {
                this.pauseC3Timers();
            } else {
                this.resumeC3Timers();
            }
        });
    }

    getCurrentTargetRecipe() {
        return window.DRINK_RECIPES.find(r => r.level === this.currentLevel) || window.DRINK_RECIPES[0];
    }

    // 判断当前模式/关卡是否开放量杯分层系统 (第一章关卡 1~9 绝不显示量杯)
    isMeasuringCupAvailable() {
        if (this.gameMode === "level") {
            const recipe = this.getCurrentTargetRecipe();
            return (recipe?.chapter || 1) >= 2;
        } else {
            // 自由模式：只有解锁了第二章才开放量杯
            const unlockedChaps = this.saveData?.unlockedChapters || [1];
            return unlockedChaps.includes(2);
        }
    }

    initModeView() {
        const isLevel = this.gameMode === "level";
        this.loadSaveData();

        // 量杯状态自适应初始化：第一章强制使用 1/1 全杯且不显示量杯
        if (!this.isMeasuringCupAvailable()) {
            this.currentMeasuringCup = "full";
            if (this.dom.measuringCupBar) {
                this.dom.measuringCupBar.style.display = "none";
            }
        } else {
            const recipe = this.getCurrentTargetRecipe();
            if (recipe && recipe.requiredCup && this.saveData.unlockedMeasuringCups?.includes(recipe.requiredCup)) {
                this.currentMeasuringCup = recipe.requiredCup;
            } else if (this.currentMeasuringCup === "full") {
                this.currentMeasuringCup = "half";
            }
        }

        if (isLevel) {
            const recipe = this.getCurrentTargetRecipe();
            const isChapter3 = (recipe.chapter || 1) === 3;

            if (isChapter3) {
                // 🏪 激活第三章连锁模拟经营模式
                this.c3State.active = true;
                if (this.dom.targetSection) this.dom.targetSection.style.display = "none";
                if (this.dom.c3DashboardSection) this.dom.c3DashboardSection.style.display = "flex";
                if (this.dom.btnAutoBrew) this.dom.btnAutoBrew.style.display = "none"; // 经营模式纯手速比拼

                const brandLogo = recipe.brandLogo || "🏪";
                const levelCode = window.formatLevelCode ? window.formatLevelCode(this.currentLevel) : this.currentLevel;
                this.dom.navLevelBadge.textContent = `${brandLogo} 第 ${levelCode} 关 · ${recipe.name}`;

                // 启动本关经营状态
                this.startC3Level(this.currentLevel);
            } else {
                // 🚩 第一章与第二章传统特调模式
                this.c3State.active = false;
                this.clearC3Timers();
                if (this.dom.c3DashboardSection) this.dom.c3DashboardSection.style.display = "none";
                if (this.dom.targetSection) this.dom.targetSection.style.display = "flex";

                const chapIcon = recipe.chapter === 2 ? "🔮" : "🚩";
                const levelCode = window.formatLevelCode ? window.formatLevelCode(this.currentLevel) : this.currentLevel;
                this.dom.navLevelBadge.textContent = `${chapIcon} 第 ${levelCode} 关 · ${recipe.name}`;

                this.dom.targetInfo.innerHTML = `
                    <div class="customer-bubble">
                        <span class="cust-avatar">${recipe.customer.avatar}</span>
                        <div class="cust-text">
                            <span class="cust-name">${recipe.customer.name}：</span>
                            ${recipe.customer.dialogue}
                        </div>
                    </div>
                `;

                // 自动按钮状态判定 (满分100分通关解锁)
                this.dom.btnAutoBrew.style.display = "inline-flex";
                const record = this.saveData.levelRecords[this.currentLevel];
                const isPerfect = record && record.score === 100;

                if (isPerfect) {
                    this.dom.btnAutoBrew.classList.remove("locked-btn");
                    this.dom.btnAutoBrew.classList.add("unlocked-btn");
                    this.dom.autoBrewIcon.textContent = "⚡";
                    this.dom.btnAutoBrew.title = "已满分通关！点击一键自动精确调制";
                } else {
                    this.dom.btnAutoBrew.classList.remove("unlocked-btn");
                    this.dom.btnAutoBrew.classList.add("locked-btn");
                    this.dom.autoBrewIcon.textContent = "🔒";
                    this.dom.btnAutoBrew.title = "需在本关达成 100 满分评价后解锁自动功能";
                }
            }
        } else {
            // 🎨 自由工坊模式
            this.c3State.active = false;
            this.clearC3Timers();
            if (this.dom.c3DashboardSection) this.dom.c3DashboardSection.style.display = "none";
            if (this.dom.targetSection) this.dom.targetSection.style.display = "flex";

            this.dom.navLevelBadge.textContent = "🎨 自由特调工坊";
            this.dom.btnAutoBrew.style.display = "none";

            const hasCups = this.isMeasuringCupAvailable();
            this.dom.targetInfo.innerHTML = `
                <div class="free-mode-banner">
                    <span class="free-icon">🎨</span>
                    <div class="free-text">
                        <strong>自由特调工坊</strong>：${hasCups ? '使用 1/2、1/3、1/4 量杯自由调配梦幻分层与专属特调！' : '随心所欲调制独一无二的专属特调，静享惬意调饮时光！'}
                    </div>
                </div>
            `;
        }

        this.updateSettingsView();
        this.updateCurrencyDisplay();
    }

    // 更新设置长条菜单视图
    updateSettingsView() {
        if (!this.dom.settingsModeBadge) return;
        const isLevel = this.gameMode === "level";
        this.dom.settingsModeBadge.textContent = isLevel ? "关卡挑战" : "自由工坊";
        const levelCode = window.formatLevelCode ? window.formatLevelCode(this.currentLevel) : this.currentLevel;
        this.dom.settingsLevelValueText.textContent = isLevel ? `第 ${levelCode} 关` : "自由模式";

        if (this.dom.settingsModalTitleText) {
            const isC3Active = this.c3State && this.c3State.active;
            this.dom.settingsModalTitleText.textContent = isC3Active ? "营业已暂停 · 吧台菜单" : "调饮吧台设置";
            if (this.dom.settingsModalTitleIcon) {
                this.dom.settingsModalTitleIcon.innerHTML = isC3Active ? `
                    <svg class="lucide-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round">
                        <rect x="6" y="4" width="4" height="16" rx="1.5"></rect>
                        <rect x="14" y="4" width="4" height="16" rx="1.5"></rect>
                    </svg>
                ` : `
                    <svg class="lucide-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/>
                        <circle cx="12" cy="12" r="3"/>
                    </svg>
                `;
            }
        }
    }

    openSettingsModal() {
        if (this.c3State && this.c3State.active) {
            this.c3State.isManualPaused = true;
        }
        this.pauseC3Timers();
        window.soundEngine.playBubble();
        this.updateSettingsView();
        this.dom.settingsModal.classList.add("active");
    }

    closeSettingsModal() {
        if (this.dom.settingsModal) {
            this.dom.settingsModal.classList.remove("active");
            window.soundEngine.playBubble();
        }
        this.resumeC3Timers();
    }

    // 🏆 打开成就勋章馆弹窗
    openAchievementModal() {
        this.pauseC3Timers();
        window.soundEngine.playBubble();
        this.loadSaveData();
        this.renderAchievements();
        this.dom.achievementModal.classList.add("active");
    }

    closeAchievementModal() {
        if (this.dom.achievementModal) {
            this.dom.achievementModal.classList.remove("active");
            window.soundEngine.playBubble();
        }
        this.resumeC3Timers();
    }

    // 渲染成就列表与进度
    renderAchievements() {
        const totalStars = window.StorageManager.getTotalStars();
        const maxStars = 81; // 81 颗星全满级神祇
        const percent = Math.min(100, Math.round((totalStars / maxStars) * 100));

        this.dom.achTotalStarsDisplay.textContent = `${totalStars} / ${maxStars}`;
        this.dom.achTotalStarsBarFill.style.width = `${percent}%`;

        const list = window.ACHIEVEMENTS_CONFIG;
        this.dom.achievementListContainer.innerHTML = list.map(ach => {
            const prog = window.StorageManager.getAchievementProgress(ach);

            let actionHtml = "";
            let cardClass = "";

            if (prog.isClaimed) {
                actionHtml = `<span class="ach-claimed-badge">已达成 ✔</span>`;
                cardClass = "claimed";
            } else if (prog.isCompleted) {
                actionHtml = `<button class="ach-claim-btn" data-id="${ach.id}">领取奖励 🎁</button>`;
                cardClass = "completed";
            } else {
                actionHtml = `<span class="ach-uncompleted-badge">${prog.current}/${prog.target}</span>`;
            }

            return `
                <div class="ach-card ${cardClass}">
                    <div class="ach-card-left">
                        <div class="ach-card-icon">${ach.icon}</div>
                        <div class="ach-card-info">
                            <div class="ach-card-title">${ach.title}</div>
                            <div class="ach-card-desc">${ach.desc}</div>
                            <div class="ach-card-rewards">
                                <span class="reward-tag">💎 +${ach.rewardDiamonds}</span>
                                <span class="reward-tag">💰 +${ach.rewardCoins}</span>
                            </div>
                        </div>
                    </div>
                    <div class="ach-card-right">
                        ${actionHtml}
                    </div>
                </div>
            `;
        }).join("");

        // 绑定领取按钮
        this.dom.achievementListContainer.querySelectorAll(".ach-claim-btn").forEach(btn => {
            btn.addEventListener("click", () => {
                const achId = btn.dataset.id;
                const res = window.StorageManager.claimAchievement(achId);
                if (res) {
                    window.soundEngine.playCoin();
                    window.soundEngine.playSparkle();
                    this.triggerEffect("star_shower");
                    this.updateCurrencyDisplay();
                    this.renderAchievements();
                    this.showNotice({
                        title: "🎉 成就达成领取成功！",
                        message: `恭喜获得调饮师勋章奖励：\n\n💎 +${res.diamonds} 钻石\n💰 +${res.coins} 金币！\n\n继续加油调制更多绝美特调吧~ 🍹`,
                        icon: "🎁",
                        btnText: "开心收下 ✨"
                    });
                }
            });
        });
    }

    // 📖 打开独立配方手账书
    openRecipeBook(targetLevel = null) {
        this.pauseC3Timers();
        window.soundEngine.playBubble();
        this.loadSaveData();
        this.recipeSubIndex = 0;
        if (targetLevel) {
            this.recipeBookPage = targetLevel;
        } else {
            this.recipeBookPage = this.gameMode === "level" ? this.currentLevel : 1;
        }
        this.renderRecipeBookPage();
        this.dom.recipeBookModal.classList.add("active");
    }

    closeRecipeBook() {
        if (this.dom.recipeBookModal) {
            this.dom.recipeBookModal.classList.remove("active");
            window.soundEngine.playBubble();
        }
        this.resumeC3Timers();
    }

    // 渲染配方手账当前页 (支持1-3章全关卡、分层配方详解与第三章多配方子分页)
    renderRecipeBookPage() {
        const totalPages = window.DRINK_RECIPES.length;
        const recipe = window.DRINK_RECIPES[this.recipeBookPage - 1];
        if (!recipe) return;

        const isChapter3 = recipe.chapter === 3;
        const chapLabel = isChapter3 ? "🏪 烟火与茶香" : (recipe.chapter === 2 ? "🔮 微醺与星芒" : "🚩 晨曦与晚风");
        const pageCode = window.formatLevelCode ? window.formatLevelCode(this.recipeBookPage) : this.recipeBookPage;
        this.dom.btnBookPrevPage.disabled = this.recipeBookPage <= 1;
        this.dom.btnBookNextPage.disabled = this.recipeBookPage >= totalPages;

        // 检查关卡是否可进入与通关记录
        this.loadSaveData();
        const record = this.saveData.levelRecords[this.recipeBookPage];
        const isCurrentLevelAccessible = this.recipeBookPage <= (this.saveData.unlockedLevel || 1);

        // 核心规则：第三章解锁关卡即显示公开名店配方秘籍（无需得60分！）；第一二章通关(≥60分)收录
        const isUnlocked = isChapter3 ? isCurrentLevelAccessible : (record && record.score >= 60);

        if (isUnlocked) {
            // 获取该关卡的所有可用配方列表 (第三章一关有好几个配方表)
            const drinks = (recipe.availableDrinks && recipe.availableDrinks.length > 0) ? recipe.availableDrinks : [recipe];
            this.recipeSubIndex = Math.max(0, Math.min(drinks.length - 1, this.recipeSubIndex || 0));
            const curDrink = drinks[this.recipeSubIndex];

            this.dom.bookPageIndicator.textContent = `第 ${pageCode} 关 · ${recipe.brand || recipe.name}${drinks.length > 1 ? ` · ${curDrink.name}` : ''}`;

            // 多配方子分页切换栏
            let subDrinksBarHtml = "";
            if (drinks.length > 1) {
                subDrinksBarHtml = `
                    <div class="book-sub-drinks-bar">
                        <div class="book-sub-tabs-list">
                            ${drinks.map((d, idx) => `
                                <button class="book-sub-tab-btn ${idx === this.recipeSubIndex ? 'active' : ''}" data-sub-idx="${idx}">
                                    <span class="sub-tab-name">${idx + 1}. ${d.name}</span>
                                    <span class="sub-tab-price">+${d.price}💰</span>
                                </button>
                            `).join("")}
                        </div>
                    </div>
                `;
            }

            const targetGlass = curDrink.glassType || recipe.glassType || "classic";
            let glassName = window.formatGlassName(targetGlass);
            if (curDrink.name === "冰鲜柠檬水") {
                glassName += " (客人亦可要求大杯+40%、吨吨桶双倍价)";
            }

            // 液体分层与原液指南
            let liquidGuideHtml = "";
            const liquidsList = curDrink.liquids || recipe.liquids;
            const singleLiquid = curDrink.liquid || recipe.liquid;

            if (liquidsList && liquidsList.length > 1) {
                liquidGuideHtml = `
                    <div class="book-step-row" style="flex-direction: column; align-items: flex-start;">
                        <span class="book-step-tag">2. 特调原液 (由底至顶分层注液)：</span>
                        <div style="padding-left: 8px; font-size: 0.74rem; color: #574438; line-height: 1.5; margin-top: 2px;">
                            ${liquidsList.map((l, i) => `· 第 ${i + 1} 层 (1/${liquidsList.length})：<strong>${l.name}</strong>`).join("<br>")}
                        </div>
                    </div>
                `;
            } else if (singleLiquid) {
                liquidGuideHtml = `
                    <div class="book-step-row">
                        <span class="book-step-tag">2. 特调原液：</span>
                        <span>${singleLiquid.name}</span>
                    </div>
                `;
            } else {
                liquidGuideHtml = `
                    <div class="book-step-row">
                        <span class="book-step-tag">2. 特调原液：</span>
                        <span>无液体</span>
                    </div>
                `;
            }

            // 杯内小料指南
            const itemsList = curDrink.inCupItems || recipe.inCupItems || [];
            const itemsText = itemsList.length > 0 
                ? itemsList.map(it => {
                    const itemObj = window.INGREDIENTS_CATALOG.inCupItems.find(i => i.id === it);
                    return itemObj ? `${itemObj.emoji} ${itemObj.name}` : it;
                }).join(' + ')
                : '无小料';

            // 顶层奶盖/封层指南
            const targetFoam = curDrink.foamLayer || recipe.foamLayer || "none";
            const foamText = targetFoam !== 'none' 
                ? (window.INGREDIENTS_CATALOG.foams.find(f => f.id === targetFoam)?.name || targetFoam) 
                : '无需封层';

            // 核心顶饰指南
            const targetTopper = curDrink.topper || recipe.topper || "none";
            const topperText = targetTopper !== 'none' 
                ? (window.INGREDIENTS_CATALOG.toppers.find(t => t.id === targetTopper)?.name || targetTopper) 
                : '无顶饰';

            // 历史成绩徽章
            let recordBadgeHtml = "";
            if (isChapter3) {
                const profit = record?.profit || 0;
                let starsText = "";
                for (let i = 1; i <= 3; i++) starsText += i <= (record?.stars || 0) ? "★" : "☆";
                recordBadgeHtml = `
                    <div class="book-record-badge">
                        <span style="color: #ea580c; font-weight: 800;">🏪 名店秘传公开中 · ${record ? `最高盈利 +${profit} 💰 (${starsText})` : '营业秘籍直接公开'}</span>
                        <span style="color: #65a30d; font-size: 0.72rem;">直接出单</span>
                    </div>
                `;
            } else {
                let starsText = "";
                for (let i = 1; i <= 3; i++) starsText += i <= (record?.stars || 0) ? "★" : "☆";
                recordBadgeHtml = `
                    <div class="book-record-badge">
                        <span style="color: #15803d; font-weight: 800;">⭐ 历史最高：${record?.score || 0} 分 (${starsText})</span>
                        <span style="color: #65a30d; font-size: 0.72rem;">已录入手账</span>
                    </div>
                `;
            }

            this.dom.recipeBookPageContent.innerHTML = `
                <div class="book-page-unlocked">
                    ${subDrinksBarHtml}
                    <div class="book-page-header">
                        <div>
                            <div class="book-drink-name" style="color: ${recipe.colorBadge || '#ea580c'};">🍹 ${curDrink.name}</div>
                            <div class="book-drink-subtitle">${isChapter3 ? `${recipe.brand}招牌 · 售价 +${curDrink.price}💰` : `${recipe.subtitle} · 顾客点单秘传`}</div>
                        </div>
                        <span style="font-size: 1.4rem;">${recipe.customer.avatar}</span>
                    </div>

                    <div class="book-quote-box">
                        ${isChapter3 ? `“${curDrink.desc || recipe.desc}”` : `“${recipe.customer.dialogue}”`}
                    </div>

                    <div class="book-recipe-steps">
                        <div class="book-step-row">
                            <span class="book-step-tag">1. 推荐杯型：</span>
                            <span>${glassName}</span>
                        </div>
                        ${liquidGuideHtml}
                        <div class="book-step-row">
                            <span class="book-step-tag">3. 杯内小料：</span>
                            <span>${itemsText}</span>
                        </div>
                        <div class="book-step-row">
                            <span class="book-step-tag">4. 顶层封层：</span>
                            <span>${foamText}</span>
                        </div>
                        <div class="book-step-row">
                            <span class="book-step-tag">5. 核心顶饰：</span>
                            <span>${topperText}</span>
                        </div>
                    </div>

                    ${recordBadgeHtml}
                </div>

                <div class="book-page-footer">
                    <button class="btn btn-primary book-jump-level-btn" id="btnBookPlayThis">
                        🍹 调制这杯特调 (第 ${pageCode} 关)
                    </button>
                </div>
            `;

            // 绑定子分页标签切换
            this.dom.recipeBookPageContent.querySelectorAll(".book-sub-tab-btn").forEach(btn => {
                btn.addEventListener("click", () => {
                    this.recipeSubIndex = parseInt(btn.dataset.subIdx);
                    window.soundEngine.playBubble();
                    this.renderRecipeBookPage();
                });
            });

            const btnPlay = this.dom.recipeBookPageContent.querySelector("#btnBookPlayThis");
            if (btnPlay) {
                btnPlay.addEventListener("click", () => {
                    this.gameMode = "level";
                    this.currentLevel = this.recipeBookPage;
                    this.initModeView();
                    this.resetCup();
                    this.closeRecipeBook();
                });
            }
        } else {
            // 未解锁状态 (针对前置关卡尚未通关)
            this.dom.bookPageIndicator.textContent = `第 ${pageCode} 关 · ${recipe.brand || recipe.name}`;
            const lockDesc = isChapter3
                ? `通关前置关卡（第 ${window.formatLevelCode ? window.formatLevelCode(this.recipeBookPage - 1) : (this.recipeBookPage - 1)} 关）后，即可直接解锁【${recipe.brand}】全套公开配方秘籍！`
                : `需在【第 ${pageCode} 关 · ${recipe.name}】取得 <strong>≥ 60 分</strong>（首次通关）后，顾客才会将这页亲笔特调秘籍赠予你收录哦！`;

            this.dom.recipeBookPageContent.innerHTML = `
                <div class="book-page-locked">
                    <div class="book-lock-icon">🔒</div>
                    <div class="book-lock-title">第 ${pageCode} 关 · 秘卷封存中</div>
                    <div class="book-lock-desc">
                        ${lockDesc}
                    </div>
                </div>

                <div class="book-page-footer">
                    ${isCurrentLevelAccessible ? `
                        <button class="btn btn-primary book-jump-level-btn" id="btnBookChallengeThis">
                            🚀 立即挑战此关卡
                        </button>
                    ` : `
                        <button class="btn btn-secondary book-jump-level-btn" disabled>
                            🔒 需通关前置关卡后解锁
                        </button>
                    `}
                </div>
            `;

            const btnChallenge = this.dom.recipeBookPageContent.querySelector("#btnBookChallengeThis");
            if (btnChallenge) {
                btnChallenge.addEventListener("click", () => {
                    this.gameMode = "level";
                    this.currentLevel = this.recipeBookPage;
                    this.initModeView();
                    this.resetCup();
                    this.closeRecipeBook();
                });
            }
        }
    }

    // 打开关卡选择弹窗
    openLevelSelect() {
        this.pauseC3Timers();
        window.soundEngine.playBubble();
        this.loadSaveData();
        this.updateLevelStarsRatio();

        // 默认定位当前关卡所在章节
        if (this.currentLevel >= 19) {
            this.selectedChapter = 3;
            if (this.dom.btnTabChapter3) this.dom.btnTabChapter3.classList.add("active");
            if (this.dom.btnTabChapter2) this.dom.btnTabChapter2.classList.remove("active");
            if (this.dom.btnTabChapter1) this.dom.btnTabChapter1.classList.remove("active");
        } else if (this.currentLevel >= 10) {
            this.selectedChapter = 2;
            if (this.dom.btnTabChapter2) this.dom.btnTabChapter2.classList.add("active");
            if (this.dom.btnTabChapter1) this.dom.btnTabChapter1.classList.remove("active");
            if (this.dom.btnTabChapter3) this.dom.btnTabChapter3.classList.remove("active");
        } else {
            this.selectedChapter = 1;
            if (this.dom.btnTabChapter1) this.dom.btnTabChapter1.classList.add("active");
            if (this.dom.btnTabChapter2) this.dom.btnTabChapter2.classList.remove("active");
            if (this.dom.btnTabChapter3) this.dom.btnTabChapter3.classList.remove("active");
        }

        this.renderLevelGrid();
        this.dom.levelSelectModal.classList.add("active");
    }

    closeLevelSelect() {
        if (this.dom.levelSelectModal) {
            this.dom.levelSelectModal.classList.remove("active");
            window.soundEngine.playBubble();
        }
        this.resumeC3Timers();
    }

    // 渲染关卡九宫格与章节锁定状态
    renderLevelGrid() {
        this.loadSaveData();
        const isChap2Unlocked = window.StorageManager.isChapterUnlocked(2);
        const isChap3Unlocked = window.StorageManager.isChapterUnlocked(3);
        const unlockedLevel = this.saveData.unlockedLevel || 1;

        // 如果选择第二章且第二章未解锁，显示 300 钻石解锁卡片
        if (this.selectedChapter === 2 && !isChap2Unlocked) {
            this.dom.levelGrid.style.display = "none";
            this.dom.chapterLockPanel.style.display = "flex";
            if (this.dom.chapter3LockPanel) this.dom.chapter3LockPanel.style.display = "none";
            this.dom.chapUnlockDiamondTip.textContent = `当前拥有：${this.saveData.diamonds || 0} 💎`;
            return;
        }

        // 如果选择第三章且第三章未解锁，显示 1000 钻石盘店解锁卡片
        if (this.selectedChapter === 3 && !isChap3Unlocked) {
            this.dom.levelGrid.style.display = "none";
            this.dom.chapterLockPanel.style.display = "none";
            if (this.dom.chapter3LockPanel) {
                this.dom.chapter3LockPanel.style.display = "flex";
                this.dom.chap3UnlockDiamondTip.textContent = `当前拥有：${this.saveData.diamonds || 0} 💎`;
            }
            return;
        }

        this.dom.chapterLockPanel.style.display = "none";
        if (this.dom.chapter3LockPanel) this.dom.chapter3LockPanel.style.display = "none";
        this.dom.levelGrid.style.display = "grid";

        // 过滤当前章节关卡
        const chapterRecipes = window.DRINK_RECIPES.filter(r => (r.chapter || 1) === this.selectedChapter);

        this.dom.levelGrid.innerHTML = chapterRecipes.map(r => {
            const isUnlocked = r.level <= unlockedLevel;
            const record = this.saveData.levelRecords[r.level] || { score: 0, stars: 0, profit: 0 };
            const isCurrent = r.level === this.currentLevel;

            let starsText = "";
            for (let i = 1; i <= 3; i++) {
                starsText += i <= record.stars ? "★" : "☆";
            }

            const isChapter3 = (r.chapter || 1) === 3;
            const levelCode = window.formatLevelCode ? window.formatLevelCode(r.level) : r.level;
            const minOrders = r.minOrders || r.customerCount || 5;

            return `
                <div class="level-card ${isUnlocked ? 'unlocked' : 'locked'} ${isCurrent ? 'current' : ''} ${isChapter3 ? 'c3-level-card' : ''}" data-level="${r.level}">
                    <div class="level-badge" style="background: ${isUnlocked ? r.colorBadge : '#888'}">
                        ${isUnlocked ? (isChapter3 ? `${r.brandLogo || '🏪'} 第 ${levelCode} 关` : `第 ${levelCode} 关`) : '🔒 待解锁'}
                    </div>
                    <div class="level-name">${isUnlocked ? r.name : '???'}</div>
                    <div class="level-sub">${isUnlocked ? (isChapter3 ? `最少${minOrders}单⭐ · 目标${r.targetProfit}💰` : r.subtitle) : '通关上一关解锁'}</div>
                    ${isUnlocked ? `
                        <div class="level-score-info">
                            <span class="level-stars">${starsText}</span>
                            <span class="level-high-score">${isChapter3 ? (record.profit ? `利+${record.profit}💰` : '未营业') : (record.score > 0 ? record.score + '分' : '未挑战')}</span>
                        </div>
                    ` : ''}
                    <button class="level-card-book-btn" data-level="${r.level}" title="翻阅此关配方">
                        <span>📖 ${isChapter3 ? '公开配方' : '配方'}</span>
                    </button>
                </div>
            `;
        }).join("");

        // 关卡卡片选关
        this.dom.levelGrid.querySelectorAll(".level-card.unlocked").forEach(card => {
            card.addEventListener("click", (e) => {
                if (e.target.closest(".level-card-book-btn")) return; // 避开小书
                const lvl = parseInt(card.dataset.level);
                this.currentLevel = lvl;
                this.dom.levelSelectModal.classList.remove("active");
                window.soundEngine.playBubble();
                this.initModeView();
                this.resetCup();
            });
        });

        // 关卡独立书籍按钮直达该页手账
        this.dom.levelGrid.querySelectorAll(".level-card-book-btn").forEach(btn => {
            btn.addEventListener("click", (e) => {
                e.stopPropagation();
                const lvl = parseInt(btn.dataset.level);
                this.dom.levelSelectModal.classList.remove("active");
                this.openRecipeBook(lvl);
            });
        });
    }

    // 自动调配 (支持单层与多层分层渐变)
    autoBrewRecipe(recipe) {
        this.resetCup();
        window.soundEngine.playSparkle();
        window.StorageManager.recordStat("autoServes");

        this.currentDrink.glassType = recipe.glassType;
        this.updateDrinkView();

        setTimeout(() => {
            if (recipe.liquids && recipe.liquids.length > 0) {
                this.currentDrink.liquids = JSON.parse(JSON.stringify(recipe.liquids));
                this.currentDrink.liquid = { ...recipe.liquid };
            } else {
                this.currentDrink.liquid = { ...recipe.liquid };
                this.currentDrink.liquids = [{ ...recipe.liquid, ratio: 1.0 }];
            }
            window.soundEngine.playPour(0.5);
            this.updateDrinkView(true);
            setTimeout(() => this.updateDrinkView(false), 700);
            this.updateLiquidProgressText();
        }, 280);

        setTimeout(() => {
            this.currentDrink.inCupItems = [...recipe.inCupItems];
            if (recipe.inCupItems.includes("heart_ice") || recipe.inCupItems.includes("classic_ice")) {
                window.soundEngine.playIceDrop();
            } else {
                window.soundEngine.playSoftDrop();
            }
            this.updateDrinkView();
        }, 600);

        setTimeout(() => {
            if (recipe.foamLayer !== "none") {
                this.currentDrink.foamLayer = recipe.foamLayer;
                window.soundEngine.playFoam();
                this.updateDrinkView();
            }
        }, 950);

        setTimeout(() => {
            if (recipe.topper !== "none") {
                this.currentDrink.topper = recipe.topper;
                window.soundEngine.playTopperPlace();
                this.updateDrinkView();
            }
            this.triggerEffect(recipe.effect);
        }, 1250);
    }

    // 🧪 渲染量杯选择栏
    renderMeasuringCups() {
        this.loadSaveData();
        const catalog = window.MEASURING_CUPS_CATALOG;
        
        this.dom.measuringCupsGroup.innerHTML = catalog.map(cup => {
            const isUnlocked = window.StorageManager.isMeasuringCupUnlocked(cup.id);
            const isActive = this.currentMeasuringCup === cup.id;
            return `
                <button class="measuring-cup-pill ${isActive ? 'active' : ''} ${!isUnlocked ? 'locked' : ''}" data-id="${cup.id}" title="${cup.desc}">
                    <span class="cup-pill-icon">${cup.icon}</span>
                    <span class="cup-pill-name">${cup.fractionText}</span>
                    ${!isUnlocked ? `<span class="cup-pill-price-badge">🔒${cup.price}💰</span>` : ''}
                </button>
            `;
        }).join("");

        this.dom.measuringCupsGroup.querySelectorAll(".measuring-cup-pill").forEach(btn => {
            btn.addEventListener("click", () => {
                const cupId = btn.dataset.id;
                const isUnlocked = window.StorageManager.isMeasuringCupUnlocked(cupId);
                const cupObj = catalog.find(c => c.id === cupId);
                if (!isUnlocked && cupObj) {
                    this.openMeasuringCupShopModal(cupObj);
                    return;
                }
                this.currentMeasuringCup = cupId;
                window.soundEngine.playBubble();
                this.renderMeasuringCups();
            });
        });

        this.updateLiquidProgressText();
    }

    // 更新量杯进度文字
    updateLiquidProgressText() {
        if (!this.dom.liquidCupProgressText) return;
        const total = (this.currentDrink.liquids || []).reduce((acc, l) => acc + (l.ratio || 0), 0);
        if (total <= 0) {
            this.dom.liquidCupProgressText.textContent = "已注入：0/1";
        } else if (total >= 0.98) {
            this.dom.liquidCupProgressText.textContent = `已注满：1/1 (共${this.currentDrink.liquids.length}层)`;
        } else {
            this.dom.liquidCupProgressText.textContent = `已注入：${Math.round(total * 100)}% (共${this.currentDrink.liquids.length}层)`;
        }
    }

    renderIngredientsPanel() {
        const catalog = window.INGREDIENTS_CATALOG;
        this.loadSaveData();
        let html = "";

        // 控制量杯选择器栏显示与隐藏 (第一章绝不显示量杯，第二章及已解锁第二章的自由工坊才显示)
        if (this.currentStep === "liquid" && this.isMeasuringCupAvailable()) {
            this.dom.measuringCupBar.style.display = "flex";
            this.renderMeasuringCups();
        } else {
            this.dom.measuringCupBar.style.display = "none";
        }

        // 过滤物料：第二章与第一章（以及未解锁第三章的自由模式）绝对不显示第三章的液体、小料、奶盖与顶饰
        const isChapter3Active = this.c3State.active;
        const isChap3Unlocked = window.StorageManager.isChapterUnlocked(3);

        const filterItemsByChapter = (items, category) => {
            if (isChapter3Active) {
                // 第三章连锁经营吧台：聚焦展示茶饮店所用的原液、小料、奶盖与顶饰（屏蔽无关的奇幻物料）
                if (category === "glass") {
                    return items.filter(g => ["cup_medium", "cup_large", "cup_bucket"].includes(g.id));
                }
                if (category === "liquid") {
                    const c3Liquids = ["lime_green", "golden_sand", "peach_pink", "amber_oolong", "mint_green", "coconut_white", "sunset_orange", "rich_cocoa", "matcha_deep", "jasmine_tea", "ceylon_black", "pure_milk", "mango_puree", "grape_tea"];
                    return items.filter(l => c3Liquids.includes(l.id));
                }
                if (category === "item") {
                    const c3Items = ["classic_ice", "boba_pearls", "lemon_slice", "orange_slice", "taro_balls", "grape_pulp", "peach_jelly"];
                    return items.filter(i => c3Items.includes(i.id));
                }
                if (category === "foam") {
                    const c3Foams = ["none", "cheese_foam", "whipped_cream", "ice_cream_float", "snow_wood"];
                    return items.filter(f => c3Foams.includes(f.id));
                }
                if (category === "topper") {
                    const c3Toppers = ["none", "pecan_nuts", "caramel_drizzle", "soybean_powder", "dried_rose_petals"];
                    return items.filter(t => c3Toppers.includes(t.id));
                }
                return items;
            } else if (this.gameMode === "level" || !isChap3Unlocked) {
                // 第一章、第二章关卡，或未解锁第三章的自由工坊：坚决不显示第三章专属物料 (chapter === 3)
                return items.filter(item => item.chapter !== 3);
            } else {
                // 自由工坊且已解锁第三章：开放全部物料
                return items;
            }
        };

        const renderList = (rawItems, category, isSelectedFn, iconFn) => {
            const items = filterItemsByChapter(rawItems, category);
            return items.map(item => {
                const isC3Active = this.c3State.active;
                // 第三章模式：液体、奶盖、顶饰、小料、杯型全部免解锁直接使用
                const isUnlocked = isC3Active ? true : window.StorageManager.isUnlocked(category, item.id);
                const isSelected = isSelectedFn(item);
                
                // 第三章成本规则：小料与核心顶饰(非none)每次消耗 10 金币；液体与奶盖完全白给 (0金币)
                const isChargedC3 = isC3Active && (category === "item" || (category === "topper" && item.id !== "none"));
                const displayPrice = item.price >= 10000 ? `${item.price / 10000}w` : item.price;
                const priceBadge = isChargedC3 
                    ? `<div class="lock-price-badge" style="background:#fee2e2; color:#b91c1c; border-color:#fca5a5;">10💰/次</div>`
                    : (!isUnlocked ? `<div class="lock-price-badge">🔒 ${displayPrice}💰</div>` : '');

                return `
                    <button class="ing-item-btn ${isSelected ? 'active-ing' : ''} ${(!isUnlocked && !isC3Active) ? 'locked-item' : ''}" 
                            data-cat="${category}" data-id="${item.id}" title="${item.desc || item.name}">
                        ${iconFn(item)}
                        <div class="ing-label">${item.name}</div>
                        ${priceBadge}
                    </button>
                `;
            }).join("");
        };

        switch (this.currentStep) {
            case "glass":
                html = renderList(
                    catalog.glasses,
                    "glass",
                    g => this.currentDrink.glassType === g.id,
                    g => `<div class="ing-icon">${g.icon || '🥛'}</div>`
                );
                break;

            case "liquid":
                html = renderList(
                    catalog.liquids,
                    "liquid",
                    liq => (this.currentDrink.liquids || []).some(l => l.id === liq.id),
                    liq => `<div class="ing-color-bubble" style="background: linear-gradient(180deg, ${liq.colorTop}, ${liq.colorBottom})"></div>`
                );
                break;

            case "items":
                html = renderList(
                    catalog.inCupItems,
                    "item",
                    item => this.currentDrink.inCupItems.includes(item.id),
                    item => `<div class="ing-icon">${item.emoji}</div>`
                );
                break;

            case "foam":
                html = renderList(
                    catalog.foams,
                    "foam",
                    foam => this.currentDrink.foamLayer === foam.id,
                    foam => `<div class="ing-icon">${foam.emoji}</div>`
                );
                break;

            case "topper":
                html = renderList(
                    catalog.toppers,
                    "topper",
                    topper => this.currentDrink.topper === topper.id,
                    topper => `<div class="ing-icon">${topper.emoji}</div>`
                );
                break;
        }

        this.dom.ingredientsGrid.innerHTML = html;

        this.dom.ingredientsGrid.querySelectorAll(".ing-item-btn").forEach(btn => {
            btn.addEventListener("click", () => {
                const cat = btn.dataset.cat;
                const id = btn.dataset.id;
                this.handleIngredientClick(cat, id);
            });
        });
    }

    handleIngredientClick(category, id) {
        this.loadSaveData();
        const catalogMap = {
            glass: window.INGREDIENTS_CATALOG.glasses,
            liquid: window.INGREDIENTS_CATALOG.liquids,
            item: window.INGREDIENTS_CATALOG.inCupItems,
            foam: window.INGREDIENTS_CATALOG.foams,
            topper: window.INGREDIENTS_CATALOG.toppers
        };

        const itemObj = catalogMap[category]?.find(i => i.id === id);
        if (!itemObj) return;

        // 非第三章模式下严禁使用第三章专属材料
        const isChap3Unlocked = window.StorageManager.isChapterUnlocked(3);
        if (!this.c3State.active && itemObj.chapter === 3 && (this.gameMode === "level" || !isChap3Unlocked)) {
            return;
        }

        // 🏪 第三章模式下物料规则：小料与顶饰每次消耗 10 金币，撤回退还 10 金币；液体与奶盖完全白给且免解锁
        if (this.c3State.active) {
            if (category === "item") {
                const idx = this.currentDrink.inCupItems.indexOf(id);
                if (idx > -1) {
                    // 撤回小料，返还 10 金币
                    this.currentDrink.inCupItems.splice(idx, 1);
                    window.StorageManager.addCoins(10);
                    this.c3State.materialCosts = Math.max(0, this.c3State.materialCosts - 10);
                    this.updateC3Financials();
                    this.updateCurrencyDisplay();
                    this.showFloatingText("+10 💰 退料", "gain");
                    window.soundEngine.playBubble();
                    this.updateDrinkView();
                    this.renderIngredientsPanel();
                } else {
                    // 放入小料，检查并扣除 10 金币
                    if ((this.saveData.coins || 0) < 10) {
                        this.showNotice({
                            title: "金币不足",
                            message: "放入小料每次需要消耗 10 💰 物料成本！\n\n当前金币不足，可通过挑战之前的关卡赚取金币哦~ 🍹",
                            icon: "💰"
                        });
                        return;
                    }
                    window.StorageManager.spendCoins(10);
                    this.c3State.materialCosts += 10;
                    this.updateC3Financials();
                    this.updateCurrencyDisplay();
                    this.showFloatingText("-10 💰", "cost");
                    this.currentDrink.inCupItems.push(id);
                    if (id === "heart_ice" || id === "classic_ice") {
                        window.soundEngine.playIceDrop();
                    } else {
                        window.soundEngine.playCoin();
                    }
                    this.updateDrinkView();
                    this.renderIngredientsPanel();
                }
                return;
            } else if (category === "topper") {
                // 顶饰：一个也是 10 金币！撤回返还 10 金币
                const prevTopper = this.currentDrink.topper;
                if (id === "none" || prevTopper === id) {
                    // 撤回/取消顶饰
                    if (prevTopper && prevTopper !== "none") {
                        window.StorageManager.addCoins(10);
                        this.c3State.materialCosts = Math.max(0, this.c3State.materialCosts - 10);
                        this.updateC3Financials();
                        this.updateCurrencyDisplay();
                        this.showFloatingText("+10 💰 退料", "gain");
                        window.soundEngine.playBubble();
                    }
                    this.currentDrink.topper = "none";
                } else {
                    // 放入或更换顶饰
                    if (!prevTopper || prevTopper === "none") {
                        // 首次放入顶饰，消耗 10 💰
                        if ((this.saveData.coins || 0) < 10) {
                            this.showNotice({
                                title: "金币不足",
                                message: "加入核心顶饰每次需要消耗 10 💰 物料成本！\n\n当前金币不足，可通过出杯赚取更多金币哦~ 🍹",
                                icon: "💰"
                            });
                            return;
                        }
                        window.StorageManager.spendCoins(10);
                        this.c3State.materialCosts += 10;
                        this.updateC3Financials();
                        this.updateCurrencyDisplay();
                        this.showFloatingText("-10 💰", "cost");
                    }
                    // 替换顶饰 (若之前已有顶饰，已付过10金币，无需二次扣除)
                    this.currentDrink.topper = id;
                    window.soundEngine.playTopperPlace();
                }
                this.updateDrinkView();
                this.renderIngredientsPanel();
                return;
            }

            // 液体 (liquid)、奶盖 (foam)、杯型 (glass) 在第三章免解锁直接使用且完全白给 (0 成本)
            this.applyIngredient(category, id, itemObj);
            return;
        }

        // 第一、二章及自由模式：检查物料解锁状态
        const isUnlocked = window.StorageManager.isUnlocked(category, id);

        // 如果未解锁，弹出统一手绘风购买弹窗
        if (!isUnlocked) {
            this.openShopModal(category, itemObj);
            return;
        }

        // 已解锁直接应用
        this.applyIngredient(category, id, itemObj);
    }

    // 🧪 量杯金币购买弹窗 (1/3量杯 300💰, 1/4量杯 600💰)
    openMeasuringCupShopModal(cupObj) {
        window.soundEngine.playBubble();
        this.loadSaveData();
        const currentCoins = this.saveData.coins || 0;
        const price = cupObj.price || 0;
        const canAfford = currentCoins >= price;
        const afterCoins = currentCoins - price;
        const shortage = price - currentCoins;

        this.dom.shopModalIcon.innerHTML = `<span style="font-size: 2.2rem;">${cupObj.icon}</span>`;
        this.dom.shopModalTitle.textContent = cupObj.name;
        this.dom.shopModalCat.textContent = "精准量杯工坊";
        this.dom.shopModalDesc.textContent = cupObj.desc;

        this.dom.shopModalCost.textContent = `💰 ${price}`;
        this.dom.shopModalCurrentCoins.textContent = `💰 ${currentCoins}`;

        if (canAfford) {
            this.dom.shopModalAfterRow.style.display = "flex";
            this.dom.shopModalAfterCoins.textContent = `💰 ${afterCoins}`;
            this.dom.shopModalShortageTip.style.display = "none";
            this.dom.btnConfirmBuy.disabled = false;
            this.dom.btnConfirmBuy.classList.remove("disabled");
            this.dom.btnConfirmBuy.textContent = "立即购买 💰";
        } else {
            this.dom.shopModalAfterRow.style.display = "none";
            this.dom.shopModalShortageTip.style.display = "block";
            this.dom.shopShortageAmount.textContent = shortage;
            this.dom.btnConfirmBuy.disabled = true;
            this.dom.btnConfirmBuy.classList.add("disabled");
            this.dom.btnConfirmBuy.textContent = "金币不足";
        }

        this.dom.btnConfirmBuy.onclick = () => {
            if (!canAfford) return;
            const ok = window.StorageManager.unlockMeasuringCup(cupObj.id);
            if (ok) {
                this.loadSaveData();
                this.updateCurrencyDisplay();
                window.soundEngine.playCoin();
                window.soundEngine.playSparkle();
                this.closeShopModal();
                this.currentMeasuringCup = cupObj.id;
                this.renderMeasuringCups();
                this.showNotice({
                    title: "量杯解锁成功！",
                    message: `恭喜解锁【${cupObj.name}】！\n\n现在你可以使用它精准调制多层梦幻渐变特饮啦！🧪`,
                    icon: "✨"
                });
            }
        };

        this.dom.shopModal.classList.add("active");
    }

    // 🏪 开启统一手绘风材料购买弹窗 (含重复通关赚金币提示)
    openShopModal(category, itemObj) {
        window.soundEngine.playBubble();
        this.loadSaveData();
        const currentCoins = this.saveData.coins || 0;
        const price = itemObj.price || 0;
        const canAfford = currentCoins >= price;
        const afterCoins = currentCoins - price;
        const shortage = price - currentCoins;

        const categoryNames = {
            glass: "杯型工坊",
            liquid: "特调原液",
            item: "杯内小料",
            foam: "顶层封层",
            topper: "立体顶饰"
        };

        // 填充图标
        let iconHtml = itemObj.emoji || itemObj.icon || "✨";
        if (category === "liquid") {
            iconHtml = `<div style="width: 38px; height: 38px; border-radius: 50%; border: 3px solid #222; background: linear-gradient(180deg, ${itemObj.colorTop}, ${itemObj.colorBottom});"></div>`;
        }
        this.dom.shopModalIcon.innerHTML = iconHtml;

        // 填充文字
        this.dom.shopModalTitle.textContent = itemObj.name;
        this.dom.shopModalCat.textContent = categoryNames[category] || "魔法材料";
        
        let desc = itemObj.desc;
        if (!desc) {
            if (category === "liquid") desc = `高品质治愈原液，为特调注入丰富渐变与风味。`;
            else if (category === "item") desc = `沉浸在杯中的特色小料，提升层次感与美感。`;
            else if (category === "foam") desc = `绵密细腻的封层奶盖，带来丝滑丰盈口感。`;
            else if (category === "topper") desc = `精致的手绘立体顶饰，让特调作品脱颖而出！`;
        }
        this.dom.shopModalDesc.textContent = desc;

        // 价格计算行
        const formattedPrice = price >= 10000 ? `${price.toLocaleString()} (${price / 10000}W)` : price;
        this.dom.shopModalCost.textContent = `💰 ${formattedPrice}`;
        this.dom.shopModalCurrentCoins.textContent = `💰 ${currentCoins.toLocaleString()}`;

        if (canAfford) {
            this.dom.shopModalAfterRow.style.display = "flex";
            this.dom.shopModalAfterCoins.textContent = `💰 ${afterCoins.toLocaleString()}`;
            this.dom.shopModalShortageTip.style.display = "none";
            this.dom.btnConfirmBuy.disabled = false;
            this.dom.btnConfirmBuy.classList.remove("disabled");
            this.dom.btnConfirmBuy.textContent = "立即购买 💰";
        } else {
            this.dom.shopModalAfterRow.style.display = "none";
            this.dom.shopModalShortageTip.style.display = "block";
            this.dom.shopShortageAmount.textContent = shortage.toLocaleString();
            this.dom.btnConfirmBuy.disabled = true;
            this.dom.btnConfirmBuy.classList.add("disabled");
            this.dom.btnConfirmBuy.textContent = "金币不足";
        }

        // 绑定单次购买确认
        this.dom.btnConfirmBuy.onclick = () => {
            if (!canAfford) return;
            const success = window.StorageManager.unlockIngredient(category, itemObj.id);
            if (success) {
                this.loadSaveData();
                this.updateCurrencyDisplay();
                window.soundEngine.playCoin();
                window.soundEngine.playSparkle();
                if (itemObj.id === "holy_grail") {
                    this.triggerEffect("star_shower");
                }
                this.closeShopModal();
                this.applyIngredient(category, itemObj.id, itemObj);
            }
        };

        this.pauseC3Timers();
        this.dom.shopModal.classList.add("active");
    }

    closeShopModal() {
        if (this.dom.shopModal) {
            this.dom.shopModal.classList.remove("active");
            window.soundEngine.playBubble();
        }
        this.resumeC3Timers();
    }

    // 💡 统一手绘风通知弹窗 (替代浏览器原生 alert)
    showNotice({ title = "温馨提示", message = "", icon = "💡", btnText = "我知道啦 🍹", onConfirm = null }) {
        this.pauseC3Timers();
        window.soundEngine.playBubble();
        this.dom.noticeModalTitle.textContent = title;
        this.dom.noticeModalMessage.textContent = message;
        this.dom.noticeModalIcon.textContent = icon;
        this.dom.btnConfirmNotice.textContent = btnText;
        this.noticeConfirmCallback = onConfirm;
        this.dom.noticeModal.classList.add("active");
    }

    closeNotice() {
        if (this.dom.noticeModal) {
            this.dom.noticeModal.classList.remove("active");
            window.soundEngine.playBubble();
            if (this.noticeConfirmCallback) {
                this.noticeConfirmCallback();
                this.noticeConfirmCallback = null;
            }
        }
        this.resumeC3Timers();
    }

    // 应用原料 (支持量杯多层注液)
    applyIngredient(category, id, itemObj) {
        if (category === "glass") {
            this.currentDrink.glassType = id;
            window.soundEngine.playBubble();
            if (id === "holy_grail") {
                window.soundEngine.playSparkle();
            }
            this.updateDrinkView();
        } else if (category === "liquid") {
            if (!this.currentDrink.liquids) this.currentDrink.liquids = [];
            const cupCatalog = window.MEASURING_CUPS_CATALOG;
            // 第一章或未开放量杯时强制使用 1/1 全杯 (一次性注满)
            const cupId = this.isMeasuringCupAvailable() ? this.currentMeasuringCup : "full";
            const currentCup = cupCatalog.find(c => c.id === cupId) || cupCatalog[0];

            if (currentCup.id === "full") {
                // 1/1 全杯：直接填满整个杯子
                this.currentDrink.liquids = [{ ...itemObj, ratio: 1.0 }];
                this.currentDrink.liquid = { ...itemObj };
            } else {
                // 分层量杯 (1/2, 1/3, 1/4)
                const currentRatioSum = this.currentDrink.liquids.reduce((sum, l) => sum + l.ratio, 0);
                if (currentRatioSum + currentCup.ratio > 1.001) {
                    this.showNotice({
                        title: "杯中液体已满",
                        message: "杯中的液体已经注满（100%）啦！\n\n如需重新调配分层渐变，可以点击下方【🧹 清空】重新注液哦~ 🍹",
                        icon: "🥛"
                    });
                    return;
                }
                // 加入新的一层
                this.currentDrink.liquids.push({ ...itemObj, ratio: currentCup.ratio });
                this.currentDrink.liquid = {
                    id: itemObj.id,
                    name: this.currentDrink.liquids.map(l => l.name).join(" + ")
                };
            }

            window.soundEngine.playPour(0.5);
            const hasIce = this.currentDrink.inCupItems.includes("heart_ice") || this.currentDrink.inCupItems.includes("classic_ice");
            if (hasIce) {
                setTimeout(() => {
                    window.soundEngine.playIceDrop();
                }, 220);
            }
            this.updateDrinkView(true);
            setTimeout(() => {
                this.updateDrinkView(false);
            }, 750);
            this.updateLiquidProgressText();
        } else if (category === "item") {
            const idx = this.currentDrink.inCupItems.indexOf(id);
            if (idx > -1) {
                this.currentDrink.inCupItems.splice(idx, 1);
                window.soundEngine.playBubble();
            } else {
                this.currentDrink.inCupItems.push(id);
                if (id === "heart_ice" || id === "classic_ice") {
                    window.soundEngine.playIceDrop();
                } else {
                    window.soundEngine.playSoftDrop();
                }
            }
            this.updateDrinkView();
        } else if (category === "foam") {
            this.currentDrink.foamLayer = id;
            if (id !== "none") {
                window.soundEngine.playFoam();
            } else {
                window.soundEngine.playBubble();
            }
            this.updateDrinkView();
        } else if (category === "topper") {
            this.currentDrink.topper = id;
            if (id !== "none") {
                window.soundEngine.playTopperPlace();
            } else {
                window.soundEngine.playBubble();
            }
            this.updateDrinkView();
        }

        this.renderIngredientsPanel();
    }

    updateDrinkView(isPouring = false) {
        const svgMarkup = window.SVG_ASSETS.renderCompleteDrink(this.currentDrink, {
            width: 250,
            height: 280,
            prefix: "workbench",
            isPouring
        });

        this.dom.drinkStage.innerHTML = `
            <div class="drink-render-wrapper">
                ${svgMarkup}
            </div>
        `;
    }

    triggerEffect(effectName) {
        if (!effectName || effectName === "none") return;
        this.dom.effectLayer.className = "effect-layer " + effectName;
        setTimeout(() => {
            this.dom.effectLayer.className = "effect-layer";
        }, 2500);
    }

    triggerCupShake() {
        this.dom.drinkStage.classList.add("cup-shaking");
        setTimeout(() => {
            this.dom.drinkStage.classList.remove("cup-shaking");
        }, 400);
    }

    resetCup() {
        const isC3 = this.c3State.active;
        const isLevel = this.gameMode === "level";
        const recipe = this.getCurrentTargetRecipe();
        let defaultGlass = "classic";
        if (isC3) {
            defaultGlass = "cup_medium";
        } else if (isLevel && recipe) {
            defaultGlass = recipe.glassType || "classic";
        }
        this.currentDrink = {
            glassType: defaultGlass,
            liquid: null,
            liquids: [],
            inCupItems: [],
            foamLayer: "none",
            topper: "none",
            customName: ""
        };
        this.updateDrinkView();
        this.renderIngredientsPanel();
        this.updateLiquidProgressText();
    }

    finishDrink() {
        // 🏪 第三章模拟经营专属出杯
        if (this.c3State.active) {
            this.finishC3Drink();
            return;
        }

        window.soundEngine.playSuccess();
        const isLevel = this.gameMode === "level";
        const target = this.getCurrentTargetRecipe();

        const isHolyGrail = this.currentDrink.glassType === "holy_grail";
        const hasAnyLiquid = (this.currentDrink.liquids && this.currentDrink.liquids.length > 0) || !!this.currentDrink.liquid;
        const isCupEmpty = (!hasAnyLiquid && this.currentDrink.inCupItems.length === 0 && this.currentDrink.foamLayer === "none" && this.currentDrink.topper === "none");

        // 记录统计
        window.StorageManager.recordStat("totalServes");
        if (!isLevel) window.StorageManager.recordStat("freeServes");
        if (this.currentDrink.inCupItems.includes("classic_ice") || this.currentDrink.inCupItems.includes("heart_ice")) {
            window.StorageManager.recordStat("iceUsed");
        }
        if (isHolyGrail) {
            window.StorageManager.recordStat("holyUsed");
        }

        let score = 100;
        let stars = 3;
        let earnedCoins = 25;
        let perfectBonus = null;

        // 🌟 奇迹圣杯核心判定机制
        if (isHolyGrail) {
            if (isCupEmpty) {
                // 空杯 0 分
                score = 0;
                stars = 0;
                earnedCoins = 0;
            } else {
                // 只要加了任意原料，100分神作！
                score = 100;
                stars = 3;
                earnedCoins = 80;
                this.triggerEffect("star_shower");
            }
            if (isLevel) {
                const saveRes = window.StorageManager.saveLevelResult(this.currentLevel, score, stars);
                if (saveRes && saveRes.perfectBonus) {
                    perfectBonus = saveRes.perfectBonus;
                }
            }
        } else if (isLevel) {
            score = 0;
            // 1. 杯型匹配 (20分)
            if (this.currentDrink.glassType === target.glassType) score += 20;

            // 2. 液体匹配 (30分，支持多层分层精确判定)
            if (target.liquids && target.liquids.length > 1) {
                // 目标是分层配方
                const curLayers = this.currentDrink.liquids || [];
                if (curLayers.length === target.liquids.length) {
                    let matchAll = true;
                    for (let i = 0; i < target.liquids.length; i++) {
                        if (curLayers[i].id !== target.liquids[i].id) {
                            matchAll = false;
                            break;
                        }
                    }
                    if (matchAll) score += 30;
                    else score += 15;
                } else if (curLayers.length > 0) {
                    score += 10;
                }
            } else {
                // 目标是单色配方
                if (this.currentDrink.liquid?.id === target.liquid.id) score += 30;
                else if (hasAnyLiquid) score += 10;
            }

            // 3. 杯内小料匹配 (20分)
            let itemMatch = 0;
            target.inCupItems.forEach(it => {
                if (this.currentDrink.inCupItems.includes(it)) itemMatch++;
            });
            score += target.inCupItems.length > 0 ? Math.round((itemMatch / target.inCupItems.length) * 20) : 20;

            // 4. 封层奶盖匹配 (15分)
            if (this.currentDrink.foamLayer === target.foamLayer) score += 15;

            // 5. 顶饰匹配 (15分)
            if (this.currentDrink.topper === target.topper) score += 15;

            // 根据得分奖励金币 (满分 80，二星 50，一星 30，未达标 10)
            if (score === 100) {
                stars = 3;
                earnedCoins = 80;
            } else if (score >= 80) {
                stars = 2;
                earnedCoins = 50;
            } else if (score >= 60) {
                stars = 1;
                earnedCoins = 30;
            } else {
                stars = 0;
                earnedCoins = 10;
            }

            const saveRes = window.StorageManager.saveLevelResult(this.currentLevel, score, stars);
            if (saveRes && saveRes.perfectBonus) {
                perfectBonus = saveRes.perfectBonus;
            }
        } else {
            // 自由模式
            earnedCoins = isCupEmpty ? 0 : 25;
        }

        // 增加普通金币并播放音效
        if (earnedCoins > 0) {
            window.StorageManager.addCoins(earnedCoins);
            setTimeout(() => {
                window.soundEngine.playCoin();
            }, 350);
        }

        // 如果触发了首次完美通关奖励，额外播放清脆音效与星雨特效
        if (perfectBonus) {
            setTimeout(() => {
                window.soundEngine.playSparkle();
                this.triggerEffect("star_shower");
            }, 450);
        }

        // 刷新界面状态与成就红点
        this.updateCurrencyDisplay();
        this.initModeView();

        window.shareCardManager.showCard(
            this.currentDrink,
            {
                mode: this.gameMode,
                level: this.currentLevel,
                score,
                stars,
                earnedCoins,
                perfectBonus,
                recipe: isHolyGrail ? { ...target, desc: isCupEmpty ? "圣杯空空如也，魔法未能显现..." : "✨【奇迹圣杯之力】点石成金的魔法降临，无论随心加入什么，皆成千古绝唱的满分神作！" } : target
            },
            {
                onNext: () => {
                    if (isLevel && this.currentLevel < window.DRINK_RECIPES.length) {
                        this.currentLevel++;
                        this.initModeView();
                    }
                    this.resetCup();
                },
                onRetry: () => {
                    this.resetCup();
                    window.soundEngine.playBubble();
                },
                onClose: () => {
                    window.soundEngine.playBubble();
                }
            }
        );
    }

    // =========================================================
    // 🏪 第三章 · 连锁模拟经营专有业务逻辑 (Chapter 3 Business Logic)
    // =========================================================

    // 启动第三章关卡经营状态
    startC3Level(level) {
        this.clearC3Timers();
        this.loadSaveData();
        const levelConfig = window.DRINK_RECIPES[level - 1];
        if (!levelConfig) return;

        const shopName = window.StorageManager.getShopName();
        if (this.dom.c3ShopNameDisplay) this.dom.c3ShopNameDisplay.textContent = shopName;
        if (this.dom.c3BrandSubDisplay) this.dom.c3BrandSubDisplay.textContent = `${levelConfig.brand}分店`;
        if (this.dom.c3TargetProfitSub) this.dom.c3TargetProfitSub.textContent = `/ 目标 ${levelConfig.targetProfit}💰`;

        const minOrders = levelConfig.minOrders || levelConfig.customerCount || 5;
        this.c3State.active = true;
        this.c3State.isPaused = false;
        this.c3State.levelConfig = levelConfig;
        this.c3State.minOrders = minOrders;
        this.c3State.totalCustomers = minOrders; // 保留兼容
        this.c3State.currentCustomerIndex = 0;
        this.c3State.timeLeft = levelConfig.timeLimit || 150;
        this.c3State.totalRevenue = 0;
        this.c3State.materialCosts = 0;
        this.c3State.penaltyCosts = 0;
        this.c3State.netProfit = 0;
        this.c3State.ordersCompleted = 0;
        this.c3State.ordersFailed = 0;

        this.updateC3Financials();
        this.updateC3CloseShopBtn();
        this.resetCup();

        // 启动营业打烊倒计时
        if (this.dom.c3TimerValText) this.dom.c3TimerValText.textContent = `${this.c3State.timeLeft}s`;
        this.c3State.levelTimer = setInterval(() => {
            if (this.c3State.isPaused) return;
            this.c3State.timeLeft--;
            if (this.dom.c3TimerValText) {
                this.dom.c3TimerValText.textContent = `${Math.max(0, this.c3State.timeLeft)}s`;
            }
            if (this.c3State.timeLeft <= 0) {
                this.clearC3Timers();
                this.showNotice({
                    title: "⏰ 今日营业打烊！",
                    message: "营业时间已耗尽！让我们一同核算今天的经营收支与客人口碑吧！",
                    icon: "🛎️",
                    btnText: "查看结算清单 📋",
                    onConfirm: () => {
                        this.finishC3Level();
                    }
                });
            }
        }, 1000);

        // 迎进第一位客人
        this.spawnC3Customer(0);
    }

    // 检查当前是否有任何前台阻塞弹窗正处于激活展示状态
    isAnyModalActive() {
        const modals = [
            this.dom.settingsModal,
            this.dom.recipeBookModal,
            this.dom.levelSelectModal,
            this.dom.achievementModal,
            this.dom.shopModal,
            this.dom.shopNameModal,
            this.dom.noticeModal,
            this.dom.c3ResultModal,
            this.dom.modalOverlay
        ];
        return modals.some(m => m && m.classList.contains("active"));
    }

    // 🏪 暂停第三章经营计时器 (打烊倒计时与当前客人耐心计时)
    pauseC3Timers() {
        if (!this.c3State || !this.c3State.active) return;
        if (this.c3State.isPaused) return;

        this.c3State.isPaused = true;

        // 1. 暂停营业总打烊倒计时
        if (this.c3State.levelTimer) {
            clearInterval(this.c3State.levelTimer);
            this.c3State.levelTimer = null;
        }

        // 2. 暂停当前客人的耐心倒计时，精准记录剩余毫秒数
        if (this.c3State.customerTimer) {
            clearInterval(this.c3State.customerTimer);
            this.c3State.customerTimer = null;
        }
        if (this.c3State.currentCustomer) {
            const curSec = typeof this.c3State.currentCustomer.currentTime === "number"
                ? this.c3State.currentCustomer.currentTime
                : this.c3State.currentCustomer.maxTime;
            this.c3State.currentCustomer.remainMs = Math.max(0, curSec * 1000);
        }

        // 界面状态微调 (倒计时框显示暂停灰色与提示)
        if (this.dom.c3TimerBox) {
            this.dom.c3TimerBox.classList.add("paused");
            this.dom.c3TimerBox.title = "已暂停 (关闭菜单或弹窗后自动恢复)";
        }
    }

    // 🏪 恢复第三章经营计时器
    resumeC3Timers() {
        if (!this.c3State || !this.c3State.active) return;
        if (!this.c3State.isPaused) return;

        // 若当前仍有阻塞弹窗激活，暂不恢复计时
        if (this.isAnyModalActive()) return;

        this.c3State.isPaused = false;
        this.c3State.isManualPaused = false;

        if (this.dom.c3TimerBox) {
            this.dom.c3TimerBox.classList.remove("paused");
            this.dom.c3TimerBox.title = "关卡营业打烊倒计时";
        }

        // 1. 恢复营业总打烊倒计时
        if (!this.c3State.levelTimer && this.c3State.timeLeft > 0) {
            if (this.dom.c3TimerValText) {
                this.dom.c3TimerValText.textContent = `${this.c3State.timeLeft}s`;
            }
            this.c3State.levelTimer = setInterval(() => {
                if (this.c3State.isPaused) return;
                this.c3State.timeLeft--;
                if (this.dom.c3TimerValText) {
                    this.dom.c3TimerValText.textContent = `${Math.max(0, this.c3State.timeLeft)}s`;
                }
                if (this.c3State.timeLeft <= 0) {
                    this.clearC3Timers();
                    this.showNotice({
                        title: "⏰ 今日营业打烊！",
                        message: "营业时间已耗尽！让我们一同核算今天的经营收支与客人口碑吧！",
                        icon: "🛎️",
                        btnText: "查看结算清单 📋",
                        onConfirm: () => {
                            this.finishC3Level();
                        }
                    });
                }
            }, 1000);
        }

        // 2. 恢复当前客人的耐心倒计时 (基于恢复时刻与剩余毫秒数精确续接)
        const cust = this.c3State.currentCustomer;
        if (cust && (cust.remainMs > 0 || cust.currentTime > 0) && !this.c3State.customerTimer) {
            const startRemain = cust.remainMs || (cust.currentTime * 1000);
            const totalMs = (cust.maxTime || 30) * 1000;
            const resumeStamp = Date.now();

            this.c3State.customerTimer = setInterval(() => {
                if (this.c3State.isPaused) return;
                const elapsedSinceResume = Date.now() - resumeStamp;
                const remain = Math.max(0, startRemain - elapsedSinceResume);
                const ratio = remain / totalMs;
                cust.currentTime = remain / 1000;
                cust.remainMs = remain;
                this.updateC3PatienceBar(ratio);

                if (remain <= 0) {
                    clearInterval(this.c3State.customerTimer);
                    this.c3State.customerTimer = null;
                    this.onC3CustomerTimeout();
                }
            }, 100);
        }
    }

    // 动态刷新提前打烊按钮外观与交互状态
    updateC3CloseShopBtn() {
        if (!this.dom.btnC3CloseShop || !this.dom.c3CloseShopText) return;
        const minOrders = this.c3State.minOrders || 5;
        const completed = this.c3State.ordersCompleted || 0;
        if (completed >= minOrders) {
            this.dom.btnC3CloseShop.className = "c3-close-shop-btn ready";
            this.dom.btnC3CloseShop.title = `已达成 1★ 基础指标(出杯${completed}单)！随时可点击打烊结算`;
            this.dom.c3CloseShopText.textContent = `打烊结算 ⭐ (${completed})`;
        } else {
            this.dom.btnC3CloseShop.className = "c3-close-shop-btn disabled";
            this.dom.btnC3CloseShop.title = `达成最少 ${minOrders} 单后可提前打烊盘点 (当前 ${completed}/${minOrders})`;
            this.dom.c3CloseShopText.textContent = `打烊(需≥${minOrders}单)`;
        }
    }

    // 清除第三章运行中的定时器
    clearC3Timers() {
        if (this.c3State.customerTimer) {
            clearInterval(this.c3State.customerTimer);
            this.c3State.customerTimer = null;
        }
        if (this.c3State.levelTimer) {
            clearInterval(this.c3State.levelTimer);
            this.c3State.levelTimer = null;
        }
    }

    // 迎进下一位客人 (客人源源不断一直来，无上限！)
    spawnC3Customer(index) {
        if (this.c3State.customerTimer) {
            clearInterval(this.c3State.customerTimer);
            this.c3State.customerTimer = null;
        }

        // 如果营业时间已用完，则不再迎客
        if (this.c3State.timeLeft <= 0) {
            return;
        }

        this.c3State.currentCustomerIndex = index;
        const cfg = this.c3State.levelConfig;
        const drinkList = cfg.availableDrinks || [cfg];
        // 轮换分配当前客人所点基准饮品
        const baseDrink = drinkList[index % drinkList.length];

        // 🌟 饮品杯型规格与价格衍生机制：
        // 规则：名字里带桶的才默认吨吨桶；默认中杯的柠檬水（及中杯饮品）客人也可以要吨吨桶（价格翻倍），要大杯（价格+40%）
        let selectedDrink = { ...baseDrink };

        if (baseDrink.name === "冰鲜柠檬水" || (baseDrink.glassType === "cup_medium" && !baseDrink.name.includes("桶"))) {
            // 规格衍生判定：客人有不同容量偏好
            const specVariant = index % 3; // 0: 默认中杯, 1: 大杯(+40%), 2: 吨吨桶(价格翻倍)
            if (specVariant === 1) {
                // 升级大杯：价格 +40%
                const largePrice = Math.round(baseDrink.price * 1.4);
                selectedDrink = {
                    ...baseDrink,
                    glassType: "cup_large",
                    price: largePrice,
                    displayName: `${baseDrink.name} (大杯)`,
                    specNote: "加量大杯"
                };
            } else if (specVariant === 2) {
                // 升级吨吨桶：价格翻倍！
                const bucketPrice = baseDrink.price * 2;
                selectedDrink = {
                    ...baseDrink,
                    glassType: "cup_bucket",
                    price: bucketPrice,
                    displayName: `${baseDrink.name} (吨吨桶)`,
                    specNote: "豪饮吨吨桶"
                };
            } else {
                // 默认标准中杯
                selectedDrink = {
                    ...baseDrink,
                    glassType: "cup_medium",
                    price: baseDrink.price,
                    displayName: baseDrink.name,
                    specNote: "标准中杯"
                };
            }
        }

        const avatars = ["⛄", "🧋", "🕶️", "🐼", "🏮", "👒", "💼", "👑", "🦊", "🐱", "🐰", "🐻", "🦄", "🐶", "🦁", "🐨", "🐵", "🐯", "🐹", "🐸"];
        const custAvatar = avatars[index % avatars.length];
        const custName = `第 ${index + 1} 位顾客`;

        // 耐心时长递减机制：关卡越靠后客人越急促 (从 38s 逐步降至 22s)
        const basePatience = Math.max(22, 38 - Math.floor((this.currentLevel - 19) * 1.8));
        this.c3State.currentCustomer = {
            index,
            avatar: custAvatar,
            name: custName,
            drink: selectedDrink,
            maxTime: basePatience,
            currentTime: basePatience,
            remainMs: basePatience * 1000
        };

        // 更新客人 UI 与订单计数器 (显示当前客人序号与最少达标订单目标)
        const minOrders = this.c3State.minOrders || 5;
        const completed = this.c3State.ordersCompleted || 0;

        if (this.dom.c3CustAvatar) this.dom.c3CustAvatar.textContent = custAvatar;
        if (this.dom.c3CustName) this.dom.c3CustName.textContent = custName;
        if (this.dom.c3OrderCounter) {
            if (completed < minOrders) {
                this.dom.c3OrderCounter.textContent = `👨‍🍳 客人 #${index + 1} · 进度 ${completed}/${minOrders}单⭐`;
            } else {
                this.dom.c3OrderCounter.textContent = `⭐ 客人 #${index + 1} · 目标已达成(${completed}单🔥)`;
            }
        }
        if (this.dom.c3CupDemandBadge) {
            const gType = selectedDrink.glassType || "cup_medium";
            const gIcon = window.formatGlassIcon ? window.formatGlassIcon(gType) : "🥤";
            const gName = window.formatGlassName ? window.formatGlassName(gType) : gType;
            this.dom.c3CupDemandBadge.textContent = `${gIcon} ${gName}`;
        }
        if (this.dom.c3DrinkDemandName) this.dom.c3DrinkDemandName.textContent = selectedDrink.displayName || selectedDrink.name;
        if (this.dom.c3DrinkPricePill) this.dom.c3DrinkPricePill.textContent = `+${selectedDrink.price} 💰`;

        // 启动该客人的耐心倒计时 (每 100ms 更新)
        this.updateC3PatienceBar(1.0);
        const startTime = Date.now();
        const totalMs = basePatience * 1000;

        this.c3State.customerTimer = setInterval(() => {
            if (this.c3State.isPaused) return;
            const elapsed = Date.now() - startTime;
            const remain = Math.max(0, totalMs - elapsed);
            const ratio = remain / totalMs;
            this.c3State.currentCustomer.currentTime = remain / 1000;
            this.c3State.currentCustomer.remainMs = remain;
            this.updateC3PatienceBar(ratio);

            if (remain <= 0) {
                clearInterval(this.c3State.customerTimer);
                this.c3State.customerTimer = null;
                this.onC3CustomerTimeout();
            }
        }, 100);
    }

    // 更新客人耐心条状态与颜色
    updateC3PatienceBar(ratio) {
        const pct = Math.max(0, Math.min(100, Math.round(ratio * 100)));
        if (this.dom.c3PatienceBarFill) {
            this.dom.c3PatienceBarFill.style.width = `${pct}%`;
            this.dom.c3PatienceBarFill.className = "c3-patience-bar-fill" + (pct <= 25 ? " danger" : (pct <= 50 ? " warning" : ""));
        }
        if (this.dom.c3PatienceText) {
            const emoji = pct <= 25 ? "😡 快点呀！" : (pct <= 50 ? "😐 稍等中..." : "😊 耐心满满");
            this.dom.c3PatienceText.textContent = `客人耐心：${pct}% ${emoji}`;
        }
    }

    // 客人耐心耗尽弃单处理
    onC3CustomerTimeout() {
        window.soundEngine.playDump();
        const custName = this.c3State.currentCustomer?.name || "客人";
        this.showFloatingText("-50 💰 弃单罚款", "penalty");
        window.StorageManager.spendCoins(50);

        this.c3State.penaltyCosts += 50;
        this.c3State.ordersFailed++;
        this.updateC3Financials();
        this.updateCurrencyDisplay();
        this.resetCup();

        this.showNotice({
            title: "💨 客人等太久生气离店！",
            message: `【${custName}】耐心归零愤然离店！\n\n商誉受损，扣除弃单违约金 50 💰！手速要加快哦，快迎进下一位客人吧！`,
            icon: "😤",
            btnText: "迎进下一位 🏃",
            onConfirm: () => {
                this.spawnC3Customer(this.c3State.currentCustomerIndex + 1);
            }
        });
    }

    // 第三章经营出杯核验
    finishC3Drink() {
        if (!this.c3State.currentCustomer) return;
        const target = this.c3State.currentCustomer.drink;

        let score = 0;
        const reasons = [];

        // 1. 杯型匹配 (25分) - 必须与饮品指定的中杯/大杯/吨吨桶一致
        const targetGlass = target.glassType || "cup_medium";
        const curGlass = this.currentDrink.glassType;
        if (curGlass === targetGlass) {
            score += 25;
        } else {
            const targetGlassName = window.formatGlassName ? window.formatGlassName(targetGlass) : targetGlass;
            const curGlassName = window.formatGlassName ? window.formatGlassName(curGlass) : curGlass;
            reasons.push(`杯型规格拿错了（客要【${targetGlassName}】，实际使用了【${curGlassName}】）`);
        }

        // 2. 液体匹配 (35分)
        const hasAnyLiquid = (this.currentDrink.liquids && this.currentDrink.liquids.length > 0) || !!this.currentDrink.liquid;
        if (target.liquids && target.liquids.length > 1) {
            const curLayers = this.currentDrink.liquids || [];
            if (curLayers.length === target.liquids.length) {
                let match = true;
                for (let i = 0; i < target.liquids.length; i++) {
                    if (curLayers[i].id !== target.liquids[i].id) {
                        match = false;
                        break;
                    }
                }
                if (match) score += 35;
                else {
                    score += 15;
                    reasons.push("分层液体种类或顺序不符");
                }
            } else if (curLayers.length > 0) {
                score += 10;
                reasons.push(`分层层数不对（需${target.liquids.length}层，实际${curLayers.length}层）`);
            } else {
                reasons.push("未注入分层原液");
            }
        } else {
            if (this.currentDrink.liquid?.id === target.liquid?.id) score += 35;
            else if (hasAnyLiquid) {
                score += 10;
                reasons.push("选错茶底原液了");
            } else {
                reasons.push("杯中未注入任何原液");
            }
        }

        // 3. 小料匹配 (20分)
        const targetItems = target.inCupItems || [];
        if (targetItems.length === 0) {
            if (this.currentDrink.inCupItems.length === 0) score += 20;
            else reasons.push("客人不需要添加小料哦");
        } else {
            let matched = 0;
            targetItems.forEach(it => {
                if (this.currentDrink.inCupItems.includes(it)) matched++;
            });
            score += Math.round((matched / targetItems.length) * 20);
            if (matched < targetItems.length) {
                reasons.push("小料不齐全或放错了");
            }
        }

        // 4. 封层奶盖匹配 (10分)
        if ((this.currentDrink.foamLayer || "none") === (target.foamLayer || "none")) {
            score += 10;
        } else {
            reasons.push("顶层奶盖封层不符");
        }

        // 5. 顶饰匹配 (10分)
        if ((this.currentDrink.topper || "none") === (target.topper || "none")) {
            score += 10;
        } else {
            reasons.push("核心顶饰不符");
        }

        // 判定结果 (≥70分合格出杯)
        if (score >= 70) {
            window.soundEngine.playSuccess();
            window.soundEngine.playCoin();
            window.StorageManager.recordStat("totalServes");

            if (this.c3State.customerTimer) {
                clearInterval(this.c3State.customerTimer);
                this.c3State.customerTimer = null;
            }

            const earned = target.price || 80;
            this.showFloatingText(`+${earned} 💰 收入`, "gain");
            this.c3State.totalRevenue += earned;
            this.c3State.ordersCompleted++;
            this.updateC3Financials();
            this.updateC3CloseShopBtn();

            // 如果刚好达成最少订单数（即达到 1★ 目标）
            const minOrders = this.c3State.minOrders || 5;
            if (this.c3State.ordersCompleted === minOrders) {
                window.soundEngine.playSparkle();
                this.showFloatingText("⭐ 达成 1 颗星保底订单！", "gain");
            }

            this.resetCup();

            // 提示出杯成功并迎进下一位 (客人一直来)
            this.spawnC3Customer(this.c3State.currentCustomerIndex + 1);
        } else {
            window.soundEngine.playSoftDrop();
            this.triggerCupShake();

            // 扣除客人 25% 耐心
            if (this.c3State.currentCustomer) {
                this.c3State.currentCustomer.currentTime = Math.max(1, this.c3State.currentCustomer.currentTime - 7);
            }

            let failMsg = `客人点的是【${target.name}】，但这杯特调不符合客人的要求！\n\n`;
            if (reasons.length > 0) {
                failMsg += `⚠️ 原因：\n${reasons.map(r => `· ${r}`).join('\n')}\n\n`;
            }
            failMsg += `请点击右上角【📖 本店秘籍】仔细核对杯型与配料重新调制吧！`;

            this.showNotice({
                title: "😣 饮品不符合点单要求！",
                message: failMsg,
                icon: "⚠️",
                btnText: "查阅秘籍重新做 🍹"
            });
        }
    }

    // 更新财务统计数据
    updateC3Financials() {
        const netProfit = this.c3State.totalRevenue - this.c3State.materialCosts - this.c3State.penaltyCosts;
        this.c3State.netProfit = netProfit;

        if (this.dom.c3TotalRevenue) this.dom.c3TotalRevenue.textContent = `+${this.c3State.totalRevenue} 💰`;
        if (this.dom.c3MaterialCosts) this.dom.c3MaterialCosts.textContent = `-${this.c3State.materialCosts} 💰`;
        if (this.dom.c3NetProfit) {
            this.dom.c3NetProfit.textContent = `${netProfit >= 0 ? '+' : ''}${netProfit} 💰`;
            this.dom.c3NetProfit.className = netProfit >= 0 ? "text-gold" : "text-red";
        }
    }

    // 经营关卡结算
    finishC3Level() {
        this.clearC3Timers();
        const cfg = this.c3State.levelConfig;
        const minOrders = this.c3State.minOrders || cfg.minOrders || cfg.customerCount || 5;
        const completed = this.c3State.ordersCompleted;
        const netProfit = this.c3State.netProfit;
        const timeLimit = cfg.timeLimit || 150;
        const timeUsed = Math.max(1, timeLimit - this.c3State.timeLeft);

        // 三星指标判定
        // 1★：达成得到一颗星的最少订单数 (minOrders)
        const star1 = completed >= minOrders;
        // 2★：在规定时限内打烊 (在营业时间耗尽前主动达成打烊)
        const star2 = star1 && (this.c3State.timeLeft > 0);
        // 3★：净利润达到目标值
        const star3 = star1 && (netProfit >= (cfg.targetProfit || 350));

        let stars = (star1 ? 1 : 0) + (star2 ? 1 : 0) + (star3 ? 1 : 0);

        // 利润收益正式入账
        if (netProfit > 0) {
            window.StorageManager.addCoins(netProfit);
            window.soundEngine.playCoin();
        }

        // 保存关卡记录
        const saveRes = window.StorageManager.saveChapter3Result(this.currentLevel, {
            stars,
            profit: netProfit,
            timeUsed,
            ordersCompleted: completed,
            totalOrders: minOrders
        });

        this.updateCurrencyDisplay();

        // 填充结算弹窗
        if (this.dom.c3ResBrand) this.dom.c3ResBrand.textContent = `${cfg.brand}分店 · 今日营业结算清单`;
        if (this.dom.c3StarRow1) {
            this.dom.c3StarRow1.className = "c3-star-check-row" + (star1 ? " achieved" : "");
            this.dom.c3StarValOrders.textContent = `出杯 ${completed} 单 / 最少 ${minOrders} 单 ${star1 ? '✔ 达成' : '❌ 未达'}`;
        }
        if (this.dom.c3StarRow2) {
            this.dom.c3StarRow2.className = "c3-star-check-row" + (star2 ? " achieved" : "");
            this.dom.c3StarValTime.textContent = `耗时 ${timeUsed}s / 限时 ${timeLimit}s ${star2 ? '✔ 达成' : '❌ 超时'}`;
        }
        if (this.dom.c3StarRow3) {
            this.dom.c3StarRow3.className = "c3-star-check-row" + (star3 ? " achieved" : "");
            this.dom.c3StarValProfit.textContent = `净利 ${netProfit}💰 / 目标 ${cfg.targetProfit}💰 ${star3 ? '✔ 达成' : '❌ 未达'}`;
        }

        if (this.dom.c3SumRevenue) this.dom.c3SumRevenue.textContent = `+${this.c3State.totalRevenue} 💰`;
        if (this.dom.c3SumCosts) this.dom.c3SumCosts.textContent = `-${this.c3State.materialCosts} 💰`;
        if (this.dom.c3SumPenaltyRow) {
            this.dom.c3SumPenaltyRow.style.display = this.c3State.penaltyCosts > 0 ? "flex" : "none";
            this.dom.c3SumPenalty.textContent = `-${this.c3State.penaltyCosts} 💰`;
        }
        if (this.dom.c3SumFinalProfit) {
            this.dom.c3SumFinalProfit.textContent = `${netProfit >= 0 ? '+' : ''}${netProfit} 💰`;
            this.dom.c3SumFinalProfit.className = netProfit >= 0 ? "text-gold" : "text-red";
        }
        if (this.dom.c3EarnedStarsCount) {
            this.dom.c3EarnedStarsCount.textContent = stars;
        }

        if (stars >= 1) {
            this.triggerEffect("star_shower");
        }

        if (this.dom.c3ResultModal) {
            this.dom.c3ResultModal.classList.add("active");
        }
    }

    closeC3ResultModal() {
        if (this.dom.c3ResultModal) {
            this.dom.c3ResultModal.classList.remove("active");
            window.soundEngine.playBubble();
        }
    }

    // 开业与店铺改名弹窗
    openShopNameModal(isFirst = false) {
        window.soundEngine.playBubble();
        const currentName = window.StorageManager.getShopName();
        if (this.dom.shopNameInput) this.dom.shopNameInput.value = currentName;
        if (this.dom.shopNameModal) this.dom.shopNameModal.classList.add("active");
    }

    closeShopNameModal() {
        if (this.dom.shopNameModal) {
            this.dom.shopNameModal.classList.remove("active");
            window.soundEngine.playBubble();
        }
    }

    // 打开当前关卡公开配方抽屉 (正常游戏时翻看依旧计时，考验手速与熟练度)
    openQuickRecipeModal() {
        window.soundEngine.playBubble();
        const cfg = this.c3State.levelConfig || this.getCurrentTargetRecipe();
        if (!cfg) return;

        if (this.dom.quickRecipeBrandTitle) {
            this.dom.quickRecipeBrandTitle.textContent = `📖 ${cfg.brand || '本店'} · 招牌特调秘籍 (全公开)`;
        }

        const drinkList = cfg.availableDrinks || [cfg];
        if (this.dom.quickRecipeList) {
            this.dom.quickRecipeList.innerHTML = drinkList.map((d, i) => {
                return `
                    <div class="quick-recipe-card">
                        <div class="qrc-header-row">
                            <div style="display: flex; align-items: center; gap: 6px;">
                                <span class="qrc-drink-title">🍹 ${i + 1}. ${d.name}</span>
                                <span class="qrc-glass-badge" style="background:#eef2ff; color:#4338ca; border:1px solid #c7d2fe; padding:1px 6px; border-radius:8px; font-size:0.72rem; font-weight:800;">${window.formatGlassIcon ? window.formatGlassIcon(d.glassType) : '🥤'} ${window.formatGlassName ? window.formatGlassName(d.glassType) : d.glassType}</span>
                            </div>
                            <span class="qrc-price-tag">售价 +${d.price} 💰</span>
                        </div>
                        <div class="qrc-details-text">
                            <strong>制作秘籍：</strong>${d.desc || '按顾客需求精准调配'}
                        </div>
                    </div>
                `;
            }).join("");
        }

        if (this.dom.quickRecipeModal) {
            this.dom.quickRecipeModal.classList.add("active");
        }
    }

    closeQuickRecipeModal() {
        if (this.dom.quickRecipeModal) {
            this.dom.quickRecipeModal.classList.remove("active");
            window.soundEngine.playBubble();
        }
    }

    // 全局轻量飘字动画
    showFloatingText(text, type = "cost") {
        if (!this.dom.floatingTextContainer) return;
        const el = document.createElement("div");
        el.className = `floating-coin-item ${type}`;
        el.textContent = text;

        // 随机在吧台视口中心附近浮动
        const randomX = window.innerWidth * 0.45 + (Math.random() * 80 - 40);
        const randomY = window.innerHeight * 0.42 + (Math.random() * 40 - 20);

        el.style.left = `${randomX}px`;
        el.style.top = `${randomY}px`;

        this.dom.floatingTextContainer.appendChild(el);
        setTimeout(() => {
            if (el.parentNode) el.parentNode.removeChild(el);
        }, 1250);
    }
}

document.addEventListener("DOMContentLoaded", () => {
    window.app = new BartenderApp();
});
