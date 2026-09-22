/**
 * 一起做裙子 (Let's Tailor!) - 苏富比式高定拍卖行系统
 * 依据立裁、车缝精度与历史考究度评分，AI买家动态叫价，统一成交弹窗
 */

class AuctionHouse {
    constructor() {
        this.currentBid = 0;
        this.highestBidder = null;
        this.isAuctionActive = false;
        this.bidInterval = null;

        this.biddersPool = [
            {
                name: '安娜·时尚主编',
                role: 'Vogue 欧洲版主编',
                icon: 'lucide:glasses',
                bias: 'cutting',
                quotes: ['“线迹处理得相当规整，这才是工坊的水准。”', '“我加价！下一期杂志封面需要这种利落轮廓。”']
            },
            {
                name: '玛格丽特公爵夫人',
                role: '摩纳哥王室名媛',
                icon: 'lucide:crown',
                bias: 'luxury',
                quotes: ['“亲爱的，我的私人舞会就缺这么一件！出价翻倍。”', '“我势在必得，这件礼服属于我的衣橱！”']
            },
            {
                name: '亨利·大都会馆长',
                role: '国家服饰博物馆策展人',
                icon: 'lucide:landmark',
                bias: 'history',
                quotes: ['“完美！这种折褶结构忠实地继承了古典制衣传统。”', '“博物馆已批准专项典藏预算，追加出价！”']
            },
            {
                name: '艾丽卡·先锋设计师',
                role: '米兰买手店主理人',
                icon: 'lucide:palette',
                bias: 'modern',
                quotes: ['“这个下摆比例很有先锋建筑的张力，我看好它！”', '“继续跟进，年轻客户一定会抢疯！”']
            }
        ];

        this.initEvents();
    }

    initEvents() {
        const btnAccept = document.getElementById('btnAcceptBid');
        if (btnAccept) {
            btnAccept.addEventListener('click', () => {
                this.hammerDown();
            });
        }
    }

    startAuction(dress) {
        this.isAuctionActive = true;

        const cutAcc = dress.cutting.accuracy || 95;
        const sewAcc = dress.sewing.accuracy || 95;
        const decorBonus = (dress.accessories || []).length * 25;
        const fabricMultiplier = dress.fabric.id === 'silk' || dress.fabric.id === 'velvet' ? 1.4 : 1.0;

        const baseVal = Math.round(((cutAcc + sewAcc) * 0.7 + decorBonus) * fabricMultiplier);
        this.currentBid = Math.max(80, baseVal);

        const titleEl = document.getElementById('auctionDressTitle');
        const currentBidEl = document.getElementById('auctionCurrentBid');
        const infoEl = document.getElementById('auctionScoresInfo');

        if (titleEl) titleEl.innerText = dress.name;
        if (currentBidEl) currentBidEl.innerText = this.currentBid;
        if (infoEl) {
            infoEl.innerHTML = `
                <div>用料：<b style="color:var(--pink-primary)">${dress.fabric.name}</b></div>
                <div>剪裁平整：<b style="color:var(--pink-primary)">${cutAcc}%</b></div>
                <div>车缝咬合：<b style="color:var(--pink-primary)">${sewAcc}%</b></div>
                <div>配饰图层：<b style="color:var(--pink-primary)">${(dress.accessories || []).length} 件</b></div>
            `;
        }

        this.renderBiddersList();
        this.startBiddingRounds();
    }

    renderBiddersList() {
        const container = document.getElementById('biddersListContainer');
        if (!container) return;
        container.innerHTML = '';

        this.biddersPool.forEach((b, idx) => {
            const card = document.createElement('div');
            card.className = 'bidder-card';
            card.id = `bidder_card_${idx}`;
            card.innerHTML = `
                <div style="width: 32px; height: 32px; border-radius: 50%; background: var(--pink-subtle); display:flex; align-items:center; justify-content:center; color: var(--pink-primary);">
                    <span class="iconify" data-icon="${b.icon}"></span>
                </div>
                <div style="flex: 1;">
                    <div style="font-size: 13px; font-weight: 700;">${b.name} <span style="font-size:11px; font-weight:normal; color:var(--text-muted);">(${b.role})</span></div>
                    <div class="bidder-quote" style="font-size: 11px; color: var(--text-secondary); margin-top:2px;">“静待叫价...”</div>
                </div>
                <div class="bidder-tag" style="font-size: 11px; font-weight: 700; color: var(--gold-primary);">准备出价</div>
            `;
            container.appendChild(card);
        });
    }

    startBiddingRounds() {
        if (this.bidInterval) clearInterval(this.bidInterval);

        let rounds = 0;
        const maxRounds = 6;

        this.bidInterval = setInterval(() => {
            if (!this.isAuctionActive) {
                clearInterval(this.bidInterval);
                return;
            }

            rounds++;
            const bidderIdx = Math.floor(Math.random() * this.biddersPool.length);
            const bidder = this.biddersPool[bidderIdx];
            this.highestBidder = bidder;

            let raise = Math.floor(Math.random() * 25) + 15;
            let quote = bidder.quotes[Math.floor(Math.random() * bidder.quotes.length)];

            if (bidder.bias === 'luxury' && Math.random() < 0.25) {
                raise += 60;
                quote = '“公爵夫人掷出重金加码，全场惊呼！”';
            }

            this.currentBid += raise;
            window.tailorAudio.playTapeTick(1.5);

            const bidText = document.getElementById('auctionCurrentBid');
            if (bidText) bidText.innerText = this.currentBid;

            document.querySelectorAll('.bidder-card').forEach(c => c.classList.remove('highlight'));
            const card = document.getElementById(`bidder_card_${bidderIdx}`);
            if (card) {
                card.classList.add('highlight');
                const qEl = card.querySelector('.bidder-quote');
                const tEl = card.querySelector('.bidder-tag');
                if (qEl) qEl.innerText = quote;
                if (tEl) tEl.innerText = `出价 ${this.currentBid} 币`;
            }

            if (rounds >= maxRounds) {
                clearInterval(this.bidInterval);
            }
        }, 1600);
    }

    /**
     * 拍卖落槌成交：唤起全系统统一的成交结果模态框 (告别原生 alert)
     */
    hammerDown() {
        if (!this.isAuctionActive) return;
        this.isAuctionActive = false;
        if (this.bidInterval) clearInterval(this.bidInterval);

        window.tailorAudio.playGavelHit();
        setTimeout(() => {
            window.tailorAudio.playCoinReward();
        }, 200);

        const buyerName = this.highestBidder ? this.highestBidder.name : '现场贵宾';
        const earnedCoins = this.currentBid;
        const earnedInfluence = Math.round(earnedCoins / 12);

        window.tailorStore.addCoins(earnedCoins);
        window.tailorStore.addInfluence(earnedInfluence);

        // 关闭拍卖竞价框
        const modalAuction = document.getElementById('modalAuction');
        if (modalAuction) modalAuction.classList.remove('show');

        // 检查时代晋升
        const unlockInfo = this.checkEraProgression();

        // 呼出统一成交结果弹窗
        this.showDealResultModal(buyerName, earnedCoins, earnedInfluence, unlockInfo);
    }

    showDealResultModal(buyerName, coins, influence, unlockInfo) {
        const modal = document.getElementById('modalDealResult');
        if (!modal) return;

        const dressNameEl = document.getElementById('dealDressName');
        const speechEl = document.getElementById('dealBuyerSpeech');
        const coinsEl = document.getElementById('dealCoinsEarned');
        const infEl = document.getElementById('dealInfluenceEarned');
        const unlockCard = document.getElementById('eraUnlockCard');
        const unlockTitle = document.getElementById('eraUnlockTitle');
        const unlockDesc = document.getElementById('eraUnlockDesc');

        if (dressNameEl) dressNameEl.innerText = window.tailorStore.currentDress.name;
        if (speechEl) speechEl.innerText = `经激烈举牌，由【${buyerName}】以 ${coins} 金币成功竞得！`;
        if (coinsEl) coinsEl.innerText = `+${coins}`;
        if (infEl) infEl.innerText = `+${influence}`;

        if (unlockInfo && unlockCard && unlockTitle && unlockDesc) {
            unlockCard.style.display = 'block';
            unlockTitle.innerText = `文明晋升：已解锁【${unlockInfo.name}】！`;
            unlockDesc.innerText = unlockInfo.desc;
        } else if (unlockCard) {
            unlockCard.style.display = 'none';
        }

        modal.classList.add('show');
    }

    checkEraProgression() {
        const store = window.tailorStore;
        if (store.state.coins >= 200 && !store.state.unlockedStages.includes(1)) {
            store.unlockStage(1);
            store.unlockLore('lore_rococo_corset');
            return { name: '宫廷繁复期', desc: '解锁了鱼骨裙撑(Pannier)、凡尔赛天鹅绒与紧身胸衣！' };
        } else if (store.state.coins >= 380 && !store.state.unlockedStages.includes(2)) {
            store.unlockStage(2);
            store.unlockLore('lore_bias_cut');
            return { name: '黄金剪裁期', desc: '解锁了45度斜裁法(Bias Cut)、重绉真丝与优雅鱼尾裙！' };
        } else if (store.state.influence >= 80 && !store.state.unlockedStages.includes(3)) {
            store.unlockStage(3);
            store.unlockLore('lore_modern_deconstruct');
            return { name: '现代解构与自由高定', desc: '解锁了星芒硬纱、烫钻与先锋无性别立体雕花！' };
        }
        return null;
    }
}
