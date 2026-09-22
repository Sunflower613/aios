/**
 * 一起做裙子 (Let's Tailor!) - 私人高定沙龙与藏衣馆系统
 * 永恒珍藏心爱服装杰作，名流访客定期来访留言并积累时尚声望 (全矢量图标，无Emoji)
 */

class SalonGallery {
    constructor() {
        this.container = document.getElementById('salonExhibitsGrid');
        this.init();
    }

    init() {
        window.tailorStore.on('salon:updated', () => {
            this.render();
        });
        this.render();
    }

    render() {
        if (!this.container) return;
        this.container.innerHTML = '';

        const exhibits = window.tailorStore.state.salonExhibits || [];

        if (exhibits.length === 0) {
            this.container.innerHTML = `
                <div style="grid-column: 1 / -1; text-align: center; padding: 36px 20px; color: var(--text-muted);">
                    <div style="width: 48px; height: 48px; border-radius: 50%; background: var(--pink-subtle); display: inline-flex; align-items: center; justify-content: center; color: var(--pink-primary); margin-bottom: 10px;">
                        <span class="iconify" data-icon="lucide:sparkles" style="font-size: 24px;"></span>
                    </div>
                    <p style="font-size: 13px; font-weight: 600; color: var(--text-secondary);">私人藏衣馆尚无珍藏展品</p>
                    <p style="font-size: 11px; margin-top: 4px;">完工走秀后点击“珍藏”，即可将您的得意杰作陈列于此。</p>
                </div>
            `;
            return;
        }

        exhibits.forEach(item => {
            const card = document.createElement('div');
            card.className = 'lore-card';
            card.style.background = '#fff';

            const comment = (item.guestComments && item.guestComments[0]) || { author: '时尚评论家', text: '比例考究，剪裁得体。' };

            card.innerHTML = `
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <span class="lore-card-badge">珍藏作品 #${item.id.slice(-4)}</span>
                    <span style="font-size: 11px; color: var(--text-muted);">${item.savedAt}</span>
                </div>
                <div style="height: 130px; background: radial-gradient(circle, #fff, #fbe8ec); border-radius: 8px; display: flex; align-items: center; justify-content: center; overflow: hidden; position: relative;">
                    ${item.snapshot ? `<img src="${item.snapshot}" style="max-height: 100%; object-fit: contain;">` : '<span class="iconify" data-icon="lucide:sparkles" style="font-size: 40px; color: var(--pink-primary);"></span>'}
                    <div style="position: absolute; bottom: 6px; right: 6px; background: rgba(42,31,36,0.7); color: #fff; padding: 2px 8px; border-radius: 10px; font-size: 10px; display:flex; align-items:center; gap:6px;">
                        <span><span class="iconify" data-icon="lucide:eye"></span> ${item.views}</span>
                        <span><span class="iconify" data-icon="lucide:heart"></span> ${item.likes}</span>
                    </div>
                </div>
                <div class="lore-card-title">${item.name}</div>
                <div style="font-size: 11px; color: var(--text-secondary);">
                    面料：<b>${item.fabric.name}</b> | 骨架：<b>${item.silhouette}</b>
                </div>
                <div style="background: var(--pink-subtle); padding: 8px 10px; border-radius: 6px; font-size: 11px; color: var(--text-secondary); line-height: 1.4; border: 1px solid var(--border-light);">
                    <b>${comment.author}</b>：“${comment.text}”
                </div>
            `;

            this.container.appendChild(card);
        });
    }
}
