import { attributes, achievementGroups } from './state.mjs';
import { compact, elapsed } from './format.mjs';

const medalTotal = achievementGroups.reduce((n, g) => n + g.targets.length, 0);
const reflections = [
  '山的意义，也许不是山顶，而是你一次次选择出发。',
  '有些路，双手推着走；有些路，在思考中向前。',
  '你无法让每一次起点都不同，却可以让每一次自己都不同。',
];
const escape = text => String(text).replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
export function createSummary(state, attributeValue, requestRestart) {
  const $ = id => document.getElementById(id);
  function medals() { return achievementGroups.map(group => ({ name: group.name, count: group.targets.filter(target => group.value(state) >= target).length })); }
  function show() {
    if (state.round < 100 || !$('summary-screen').hidden) return;
    const groups = medals(), count = groups.reduce((sum, group) => sum + group.count, 0);
    $('summary-content').innerHTML = `<div class="summary-geometry" aria-hidden="true"><i></i><i></i><i></i><i></i></div><div class="summary-cover"><p class="eyebrow">A HUNDRED JOURNEYS. ONE YOU.</p><span class="summary-avatar">${escape(state.profile.avatar)}</span><p>${escape(state.profile.name)}的山海年鉴</p><h1 id="summary-title">山路没有终点，<br>这一程有了答案。</h1><span class="summary-seal">100 / 100 段旅程</span></div><section class="summary-stats"><div><small>你推着世界走过</small><strong>${compact(state.totalDistance / 1000)}<em> km</em></strong></div><div><small>有效游玩时间</small><strong>${elapsed(state.elapsedSeconds)}</strong></div><div><small>亲手推动</small><strong>${compact(state.pushes)} 次</strong></div><div><small>达成勋章</small><strong>${count} / ${medalTotal}</strong></div></section><blockquote>${reflections[0]}</blockquote><section class="summary-section"><h2>你成为了怎样的旅人</h2><div class="summary-attributes">${attributes.map(a => `<div><span>${a.icon} ${a.name} · Lv.${state.levels[a.id]}</span><strong>${attributeValue(a.id)}</strong></div>`).join('')}</div></section><blockquote>${reflections[1]}</blockquote><section class="summary-section"><h2>沿途拾起的勋章</h2>${groups.map(group => `<div class="summary-medal"><span>${group.name}</span><strong>${'✦'.repeat(group.count)}${'◇'.repeat(5 - group.count)}</strong></div>`).join('')}</section><div class="summary-ending"><p>${reflections[2]}</p><strong>必须想象西西弗斯是快乐的。</strong><small>西西弗斯 · 韭菜盒子<br>${new Date(state.finishedAt || Date.now()).toLocaleDateString('zh-CN')}</small></div>`;
    $('summary-screen').hidden = false; $('summary-screen').scrollTop = 0;
    $('summary-content').querySelectorAll('.summary-stats strong').forEach((element, i) => {
      element.style.setProperty('--reveal-delay', `${i * 120 + 180}ms`);
      element.classList.add('summary-number');
    });
  }
  async function exportImage() {
    await document.fonts.ready;
    const canvas = document.createElement('canvas'); canvas.width = 900; canvas.height = 2580;
    const ctx = canvas.getContext('2d');
    const paper = ctx.createLinearGradient(0, 0, 900, 2580); paper.addColorStop(0, '#e6edde'); paper.addColorStop(.5, '#f5e6d5'); paper.addColorStop(1, '#e5e4f1'); ctx.fillStyle = paper; ctx.fillRect(0, 0, 900, 2580);
    const sky = ctx.createLinearGradient(0, 0, 900, 540); sky.addColorStop(0, '#173b3c'); sky.addColorStop(.6, '#486653'); sky.addColorStop(1, '#807362'); ctx.fillStyle = sky; ctx.fillRect(0, 0, 900, 540);
    ctx.strokeStyle = '#d5e5b755'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(720, 120, 125, 0, Math.PI * 2); ctx.stroke(); ctx.strokeRect(620, 320, 95, 95);
    ctx.fillStyle = '#e7c889'; ctx.beginPath(); ctx.arc(720, 120, 95, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#3c5542'; ctx.beginPath(); ctx.moveTo(0, 540); ctx.lineTo(360, 340); ctx.lineTo(900, 500); ctx.lineTo(900, 540); ctx.fill();
    function text(value, x, y, size = 24, color = '#304837', weight = 400) {
      ctx.font = `${weight} ${size}px "Segoe UI", "Microsoft YaHei", sans-serif`; ctx.fillStyle = color; ctx.fillText(value, x, y);
    }
    function wrap(value, x, y, width, size = 25, color = '#66735d') {
      ctx.font = `${size}px "Segoe UI", "Microsoft YaHei", sans-serif`; let line = '';
      for (const char of value) { if (ctx.measureText(line + char).width > width) { text(line, x, y, size, color); y += size * 1.7; line = char; } else line += char; }
      text(line, x, y, size, color); return y + size * 1.7;
    }
    text('A HUNDRED JOURNEYS. ONE YOU.', 65, 76, 18, '#c8d5b7');
    text(state.profile.avatar, 65, 167, 58, '#fff');
    text(`${state.profile.name}的山海年鉴`, 65, 229, 26, '#e6e3cf');
    text('山路没有终点，', 65, 319, 51, '#fff7df', 600);
    text('这一程有了答案。', 65, 390, 51, '#fff7df', 600);
    text('100 / 100 段旅程', 65, 475, 26, '#e7c889');
    const metrics = [['累计公里', `${compact(state.totalDistance / 1000)} km`], ['有效游玩时间', elapsed(state.elapsedSeconds)], ['亲手推动', `${compact(state.pushes)} 次`], ['达成勋章', `${medals().reduce((n, m) => n + m.count, 0)} / ${medalTotal}`]];
    metrics.forEach(([label, value], index) => { const x = 65 + index % 2 * 410, y = 615 + Math.floor(index / 2) * 120; text(label, x, y, 19, '#7e8976'); text(value, x, y + 46, index === 1 ? 23 : 31, '#304837', 600); });
    wrap(reflections[0], 65, 910, 770, 26);
    text('你成为了怎样的旅人', 65, 1045, 31, '#304837', 600);
    attributes.forEach((a, i) => {
      const x = 65 + i % 2 * 410, y = 1110 + Math.floor(i / 2) * 94;
      text(`${a.icon} ${a.name} · Lv.${state.levels[a.id]}`, x, y, 20, '#7a886e'); text(attributeValue(a.id), x, y + 36, 25, '#304837', 600);
    });
    wrap(reflections[1], 65, 1620, 770, 25);
    text('沿途拾起的勋章', 65, 1740, 31, '#304837', 600);
    medals().forEach((group, i) => { text(group.name, 65, 1805 + i * 57, 23); text(`${group.count} / 5`, 740, 1805 + i * 57, 23, '#a18649', 600); });
    wrap(reflections[2], 65, 2335, 770, 23);
    text('必须想象西西弗斯是快乐的。', 65, 2450, 28, '#304837', 600);
    text(`西西弗斯 · 韭菜盒子   ${new Date(state.finishedAt || Date.now()).toLocaleDateString('zh-CN')}`, 65, 2520, 19, '#7a886e');
    return new Promise((resolve, reject) => canvas.toBlob(blob => blob ? resolve(blob) : reject(new Error('图片生成失败')), 'image/png'));
  }
  $('share-summary').addEventListener('click', async () => {
    const button = $('share-summary'); button.disabled = true; $('share-status').textContent = '正在绘制你的长图…';
    try {
      const blob = await exportImage(), file = new File([blob], '西西弗斯-山海年鉴.png', { type: 'image/png' });
      if (navigator.canShare?.({ files: [file] })) {
        try { await navigator.share({ files: [file], title: '我的西西弗斯山海年鉴' }); $('share-status').textContent = '已打开系统分享'; return; }
        catch (error) { if (error.name === 'AbortError') { $('share-status').textContent = '已取消分享，旅程总结仍在这里'; return; } }
      }
      const url = URL.createObjectURL(blob), anchor = document.createElement('a'); anchor.href = url; anchor.download = file.name; anchor.click();
      setTimeout(() => URL.revokeObjectURL(url), 60000); $('share-status').textContent = '长图已下载，可保存或分享给朋友';
    } catch { $('share-status').textContent = '长图生成失败，请重试'; }
    finally { button.disabled = false; }
  });
  $('summary-restart').addEventListener('click', requestRestart);
  $('summary-back').addEventListener('click', () => { $('summary-screen').hidden = true; });
  return { show };
}
