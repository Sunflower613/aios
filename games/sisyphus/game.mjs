import { dailyEvents, freeSkinIds, localDateKey } from './festivals.mjs';
import { skinArt } from './skin-designs.mjs';
import { skins, attributes, achievementGroups, achievementProgress, claimAchievement, avatars, updateProfile, restore, goal, reward, power, duration, stamina, interval, price, motion, push, coast, equip, claimDailySkin, upgrade, trackTime, thinkingRatio, holdSpeed, burstChance, redeemCode, restart } from './state.mjs';
import { createAudio } from './audio.mjs';
import { createWorld } from './world.mjs';
import { compact } from './format.mjs';
import { createTerrain } from './terrain.mjs';
import { createSummary } from './summary.mjs';

const $ = id => document.getElementById(id);
const KEY = 'sisyphus-save-v2';
let raw;
try { raw = localStorage.getItem(KEY) ?? localStorage.getItem('sisyphus-save-v1'); }
catch { $('save-status').textContent = '浏览器无法保存进度，本次仍可游玩'; }
const state = restore(raw), movement = motion();
const audio = createAudio(state.settings);
const world = createWorld(state, () => save());
const terrain = createTerrain();
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
let active = 'play', held = null, elapsed = 0, nextPulse = 0, exhausted = false;
let lastFrame = performance.now(), lastSave = 0, dirty = false, rotation = 0, targetRotation = 0, lastDistance = state.totalDistance, toastTimer, rewardTimer;
let lastGiftCheck = 0;
let lastHUD = 0, renderedSkin = null, giftDateKey = null;
let pointerId = null, keyboardHeld = false;
const format = compact;
const summary = createSummary(state, attributeValue, requestRestart);
function save() {
  try { localStorage.setItem(KEY, JSON.stringify(state)); dirty = false; }
  catch { $('save-status').textContent = '进度暂时无法保存，本次仍可游玩'; }
}
function toast(message) {
  $('toast').textContent = message; $('toast').classList.add('visible');
  clearTimeout(toastTimer); toastTimer = setTimeout(() => $('toast').classList.remove('visible'), 2300);
}
function result(event) {
  if (event.points) {
    const badge = $('journey-gain');
    badge.textContent = `+${format(event.points)}`;
    badge.classList.remove('visible'); void badge.offsetWidth; badge.classList.add('visible');
    clearTimeout(rewardTimer); rewardTimer = setTimeout(() => badge.classList.remove('visible'), 2200);
  }
  dirty = true;
  if (event.rounds && state.round >= 100) { pause(); summary.show(); }
}
function step(now) {
  if (state.round >= 100) { summary.show(); return; }
  result(push(state, movement, now));
  if (state.round < 100) audio.push();
  if (state.settings.vibration && navigator.vibrate) navigator.vibrate(10);
  renderHUD();
}
function begin(source) {
  if (!$('summary-screen').hidden) return;
  if (state.round >= 100) { summary.show(); return; }
  if (active !== 'play' || held || document.hidden) return;
  held = source; elapsed = 0; exhausted = false; nextPulse = interval(state);
  step(performance.now() / 1000);
  $('hint').textContent = '再向前一点。';
}
function stop() {
  held = null; pointerId = null; keyboardHeld = false; exhausted = false; elapsed = 0;
  $('hint').textContent = '点击任意空白处，向前一步。';
  $('endurance').style.width = '100%';
}
function pause() {
  stop(); Object.assign(movement, motion()); save(); lastFrame = performance.now();
  targetRotation = rotation; lastDistance = state.totalDistance;
  audio.stopRolling();
}
const control = target => target.closest('#tab-play') && active === 'play' ? false : target.closest('a, button, input, select, textarea, dialog, #summary-screen, #panel, .tabs');
document.addEventListener('pointerdown', event => {
  if (active !== 'play' || event.button !== 0 || !event.isPrimary || control(event.target) || held) return;
  event.preventDefault(); pointerId = event.pointerId;
  event.target.setPointerCapture?.(event.pointerId); begin('pointer');
});
window.addEventListener('pointerup', event => { if (event.pointerId === pointerId) { stop(); save(); } });
window.addEventListener('pointercancel', event => { if (event.pointerId === pointerId) { stop(); save(); } });
document.addEventListener('lostpointercapture', event => { if (event.pointerId === pointerId) stop(); });
document.addEventListener('keydown', event => {
  if (event.code !== 'Space' || active !== 'play' || event.ctrlKey || event.altKey || event.metaKey || control(event.target)) return;
  event.preventDefault();
  if (!event.repeat && !keyboardHeld && !held) { keyboardHeld = true; begin('keyboard'); }
});
document.addEventListener('keyup', event => { if (event.code === 'Space' && keyboardHeld) { stop(); save(); } });
function backgroundPause() { pause(); audio.pause(); document.body.dataset.paused = 'true'; }
window.addEventListener('blur', backgroundPause);
window.addEventListener('pagehide', backgroundPause);
function foreground() { document.body.dataset.paused = 'false'; lastFrame = performance.now(); }
window.addEventListener('focus', foreground);
document.addEventListener('visibilitychange', () => { if (document.hidden) backgroundPause(); else foreground(); });
// A trusted gesture unlocks both audio buses; toggles never trigger a push.
document.addEventListener('pointerdown', () => { foreground(); void audio.unlock(); }, { capture: true });
document.addEventListener('keydown', () => { foreground(); void audio.unlock(); }, { capture: true });

const names = { skins: ['THE STONE COLLECTION', '皮肤'], attributes: ['A LITTLE STRONGER', '属性'], achievements: ['EVERY STEP COUNTS', '成就'], settings: ['MAKE YOURSELF AT HOME', '设置'] };
function showTab(tab) {
  pause(); active = tab;
  $('play').hidden = tab !== 'play'; $('panel').hidden = tab === 'play';
  document.querySelectorAll('[data-tab]').forEach(button => button.setAttribute('aria-selected', String(button.dataset.tab === tab)));
  for (const key of Object.keys(names)) $(`${key}-page`).hidden = key !== tab;
  if (tab !== 'play') { $('panel-title').textContent = names[tab][1]; $('panel-kicker').textContent = names[tab][0]; $('panel').scrollTop = 0; }
  renderPanels(); renderHUD();
}
document.querySelectorAll('[data-tab]').forEach(button => button.addEventListener('click', event => {
  const tab = button.dataset.tab;
  if (tab === 'play' && active === 'play') {
    // Real pointer/Space presses are handled on down; accessible click/Enter also works.
    if (event.detail === 0) { step(performance.now() / 1000); save(); }
    return;
  }
  showTab(tab);
  if (tab === 'play') button.blur();
}));

document.querySelector('.tabs').addEventListener('keydown', event => {
  if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
  const tabs = [...document.querySelectorAll('[data-tab]')], index = tabs.indexOf(document.activeElement);
  if (index < 0) return;
  event.preventDefault();
  const next = event.key === 'Home' ? 0 : event.key === 'End' ? tabs.length - 1 : (index + (event.key === 'ArrowRight' ? 1 : -1) + tabs.length) % tabs.length;
  showTab(tabs[next].dataset.tab); tabs[next].focus();
});
let artSerial = 0;
const renderArtwork = skin => (skinArt[skin.id] || '').replaceAll('solar-', `solar-${++artSerial}-`);
const seasonalEffect = skin => {
  if (skin.category !== '节气') return '';
  const type = skin.id === 'lichun' ? 'lantern' : skin.id === 'jingzhe' ? 'electric' : ['bailu', 'yushui', 'guyu', 'xiaoshu'].includes(skin.id) ? 'dew' : ['xiaoxue', 'daxue', 'xiaohan', 'dahan', 'dongzhi'].includes(skin.id) ? 'frost' : ['chunfen', 'qingming', 'lixia', 'liqiu', 'hanlu'].includes(skin.id) ? 'petals' : 'glimmer';
  return `<span class="season-fx fx-${type}" aria-hidden="true">${Array.from({length:6},(_,i)=>`<i style="--i:${i}"></i>`).join('')}</span>`;
};
const artContents = skin => `<span class="skin-spin"><span class="skin-surface"><span class="skin-detail">${renderArtwork(skin)}</span>${Array.from({ length: 7 }, (_, i) => `<i class="skin-flower" style="--flower:${i}"></i>`).join('')}</span></span><span class="skin-orbit"></span>${seasonalEffect(skin)}`;
const art = skin => `<span class="skin-art" data-skin="${skin.id}" data-crafted="${!!skinArt[skin.id]}" style="--rock:${skin.color}">${artContents(skin)}</span>`;
const skinCards = skins.map(skin => {
  const card = document.createElement('article'); card.className = 'card skin-card';
  card.innerHTML = `<div class="skin-preview" aria-hidden="true">${art(skin)}</div><h2>${skin.name}</h2><p>${skin.note}</p><button data-skin="${skin.id}"></button>`;
  card.querySelector('button').addEventListener('click', () => {
    if (card.dataset.free === 'true') {
      if (claimDailySkin(state, skin.id)) { save(); renderHUD(); renderPanels(); toast(`已免费领取${skin.name}`); }
      else { renderPanels(); toast('领取日期已更新，请查看今日赠礼'); }
      return;
    }
    if (equip(state, skin.id)) { save(); renderHUD(); renderPanels(); toast(`已换上${skin.name}`); }
  });
  card.dataset.category = skin.category; $('shop').append(card); return card;
});
for (const category of ['全部', ...new Set(skins.flatMap(s => s.categories))]) {
  const button = document.createElement('button'); button.type = 'button';
  button.textContent = category; button.setAttribute('aria-pressed', String(category === '全部'));
  button.addEventListener('click', () => {
    skinCards.forEach(card => { card.hidden = category !== '全部' && !skins[skinCards.indexOf(card)].categories.includes(category); });
    document.querySelectorAll('#skin-filters button').forEach(b => b.setAttribute('aria-pressed', String(b === button)));
  });
  $('skin-filters').append(button);
}
function attributeValue(id) {
  return ({ strength: `${format(power(state))} m / 次`, inertia: `${format(duration(state))} s`, stamina: `${format(stamina(state))} s`, rhythm: `${format(1 / interval(state))} 次 / s`, burst: `${format(burstChance(state) * 100)}%`, focus: `最高 +${state.levels.focus * 5}%`, inspiration: `奖励 +${state.levels.inspiration * 5}%`, lightness: `目标 −${state.levels.lightness * 2}%`, thinking: `${format(power(state) * thinkingRatio(state))} m / s` })[id];
}
const attributeIcons = {
  strength: '<path d="m4 18 3-9 4-4 3 3-3 4 2 2 4-2 3 3-1 5H8z"/>',
  inertia: '<path d="M20 8a8 8 0 1 0 0 8M20 3v5h-5M12 7v5l3 2"/>',
  stamina: '<path d="M12 21 4 13C-2 6 7 0 12 7c5-7 14-1 8 6z"/>',
  rhythm: '<path d="M3 12h3l3-8 6 16 3-8h3"/>',
  burst: '<path d="m14 2-10 12h7l-1 8L21 9h-8z"/>',
  focus: '<circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="3"/><path d="M12 1v3m0 16v3M1 12h3m16 0h3"/>',
  inspiration: '<path d="M8 16a7 7 0 1 1 8 0l-1 3H9zM9 22h6M12 18v-6m-3-2 3 2 3-2"/>',
  lightness: '<path d="M4 20 15 9M7 17c-8-9 9-17 14-14 3 5-5 22-14 14Zm4-4h6m-3-3V5"/>',
  thinking: '<path d="M7 17a5 5 0 1 1 0-10 6 6 0 0 1 11-1 5 5 0 0 1 0 10H7Z"/><circle cx="6" cy="21" r="1"/><path d="M10 10h.1m4 0h.1m4 0h.1"/>',
};
const attributeIcon = id => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${attributeIcons[id]}</svg>`;
const attributeCards = attributes.map(attribute => {
  const card = document.createElement('article'); card.className = 'card attribute-card';
  card.innerHTML = `<span class="level"></span><div class="attribute-icon" aria-hidden="true" data-attribute="${attribute.id}">${attributeIcon(attribute.id)}</div><h2>${attribute.name}</h2><div class="value"></div><p>${attribute.desc}</p><button data-upgrade="${attribute.id}"></button>`;
  card.querySelector('button').addEventListener('click', () => {
    const upgraded = upgrade(state, attribute.id);
    if (upgraded) { result(upgraded); save(); renderHUD(); renderPanels(); if (!upgraded.points) toast(`${attribute.name}提升了`); }
  });
  $('attributes').append(card); return card;
});
const overviewCells = attributes.map(attribute => {
  const cell = document.createElement('div');
  cell.innerHTML = `<span aria-hidden="true">${attributeIcon(attribute.id)}</span><small>${attribute.name}</small><strong></strong>`;
  $('attribute-overview').append(cell); return cell;
});
const achievementCards = achievementGroups.map(group => {
  const card = document.createElement('article'); card.className = 'medal-card'; card.dataset.group = group.id; card.title = group.note || group.name;
  card.innerHTML = `<div class="medal-icon" aria-hidden="true">${group.icon}</div><div class="medal-info"><span class="medal-tier"></span><h2></h2><progress aria-label="${group.name}进度"></progress><small></small></div><button type="button" data-claim="${group.id}"></button>`;
  card.querySelector('button').addEventListener('click', () => {
    const earned = claimAchievement(state, group.id);
    if (earned) { save(); renderHUD(); renderPanels(); toast(`勋章奖励 +${format(earned)} 积分`); }
  });
  $('achievements').append(card); return card;
});
let selectedAvatar = state.profile.avatar;
const avatarButtons = avatars.map(avatar => {
  const button = document.createElement('button'); button.type = 'button'; button.textContent = avatar;
  button.setAttribute('aria-label', `选择 ${avatar} 头像`);
  button.addEventListener('click', () => { selectedAvatar = avatar; $('profile-avatar').textContent = avatar; avatarButtons.forEach(b => b.setAttribute('aria-pressed', String(b.textContent === avatar))); });
  $('avatar-options').append(button); return button;
});
function renderProfile() {
  $('profile-avatar').textContent = state.profile.avatar; $('hud-avatar').textContent = state.profile.avatar;
  $('profile-name').textContent = state.profile.name; $('hud-name').textContent = state.profile.name;
  $('player-name').value = state.profile.name; selectedAvatar = state.profile.avatar;
  avatarButtons.forEach(button => button.setAttribute('aria-pressed', String(button.textContent === selectedAvatar)));
}
$('profile-form').addEventListener('submit', event => {
  event.preventDefault(); updateProfile(state, $('player-name').value, selectedAvatar); save(); renderProfile(); toast('旅人资料已保存');
});
renderProfile();
function renderPanels() {
  const date = new Date(), freeIds = freeSkinIds(date), events = dailyEvents(date);
  giftDateKey = localDateKey(date);
  $('daily-gifts-title').textContent = events.length ? `今日有礼 · ${events.map(e=>e.name).join(' / ')}` : '今日花信';
  $('daily-gifts-note').textContent = events.length ? '按设备真实日期识别，当天可免费领取对应皮肤。' : '节日或节气当天，来这里免费领取对应皮肤。';
  $('daily-gifts-list').replaceChildren(...freeIds.map(id => {
    const skin=skins.find(s=>s.id===id), button=document.createElement('button');
    button.type='button'; button.textContent=state.owned.includes(id) ? `${skin.name} · 已拥有` : `${skin.name} · 免费领取`;
    button.disabled=state.owned.includes(id);
    button.addEventListener('click',()=>{ if(claimDailySkin(state,id)) { save(); renderPanels(); renderHUD(); toast(`已免费领取${skin.name}`); } else { renderPanels(); toast('领取日期已更新，请查看今日赠礼'); } });
    return button;
  }));
  $('tab-skins').classList.toggle('has-gift',freeIds.some(id=>!state.owned.includes(id)));
  skinCards.forEach((card, i) => {
    const skin = skins[i], owned = state.owned.includes(skin.id), selected = state.selected === skin.id, button = card.querySelector('button');
    card.dataset.free = String(!owned && freeIds.includes(skin.id));
    button.textContent = selected ? '使用中 ✓' : owned ? '换上它' : freeIds.includes(skin.id) ? '今日免费领取' : `${format(skin.cost)} 积分 · 兑换`;
    button.setAttribute('aria-label', `${skin.name}，${button.textContent}`);
    button.setAttribute('aria-pressed', String(selected)); button.disabled = !owned && !freeIds.includes(skin.id) && state.points < skin.cost;
  });
  attributeCards.forEach((card, i) => {
    const a = attributes[i], level = state.levels[a.id], button = card.querySelector('button');
    card.querySelector('.level').textContent = `Lv.${level}`;
    card.querySelector('.value').textContent = attributeValue(a.id);
    button.textContent = level >= a.max ? '已满级' : `${format(price(state, a))} 积分 · 升级`;
    button.setAttribute('aria-label', `${a.name}，${button.textContent}`);
    button.disabled = state.round >= 100 || level >= a.max || state.points < price(state, a);
  });
  overviewCells.forEach((cell, i) => { cell.querySelector('strong').textContent = attributeValue(attributes[i].id); });
  achievementCards.map((card, i) => {
    const group = achievementGroups[i], p = achievementProgress(state, group), button = card.querySelector('button');
    card.classList.toggle('ready', p.ready); card.classList.toggle('complete', p.all);
    card.querySelector('.medal-tier').textContent = `${group.name} · ${p.all ? '已集齐' : `${p.tier + 1} / ${group.targets.length}`}`;
    card.querySelector('h2').textContent = group.titles[p.tier];
    card.querySelector('progress').max = p.target; card.querySelector('progress').value = Math.min(p.target, p.current);
    card.querySelector('small').textContent = `${format(Math.min(p.target, p.current))} / ${format(p.target)} ${group.unit}`;
    button.textContent = p.all ? '✓' : p.ready ? `领取 +${format(p.reward)}` : `🔒 +${format(p.reward)}`; button.disabled = !p.ready;
    button.setAttribute('aria-label', `${group.titles[p.tier]}，${p.all ? '全部达成' : p.ready ? '领取奖励' : '挑战中'}`);
    return { card, rank: p.ready ? 0 : p.all ? 2 : 1 };
  }).sort((a, b) => a.rank - b.rank).forEach(({ card }) => $('achievements').append(card));
  const medals = Object.values(state.claimed).reduce((a, b) => a + b, 0);
  $('medal-count').textContent = `${medals} / ${achievementGroups.reduce((n, g) => n + g.targets.length, 0)}`; $('medal-progress').max = achievementGroups.reduce((n, g) => n + g.targets.length, 0); $('medal-progress').value = medals;
  $('achievement-distance').textContent = `${format(state.totalDistance)} m`;
  for (const setting of ['motion', 'vibration', 'randomSkin']) $(`${setting}-toggle`).checked = state.settings[setting];
  for (const channel of ['stone', 'music', 'weather']) { $(`${channel}-volume`).value = state.settings[`${channel}Volume`]; $(`${channel}-volume-value`).textContent = `${state.settings[`${channel}Volume`]}%`; }
  $('lifetime').textContent = `累计 ${format(state.totalDistance)} m · 推动 ${format(state.pushes)} 次 · 完成 ${state.round} 轮`;
}
function renderHUD() {
  if (giftDateKey && giftDateKey !== localDateKey()) renderPanels();
  $('points').textContent = format(state.points); $('round').textContent = state.round >= 100 ? '100 段旅程 · 已完成' : `第 ${state.round + 1} / 100 次旅程`;
  $('distance').textContent = format(state.distance); $('goal').textContent = format(goal(state));
  $('reward').textContent = state.round >= 100 ? '点击查看山海年鉴' : `+${format(reward(state))} 积分`; $('progress').style.width = `${state.round >= 100 ? 100 : Math.min(100, state.distance / goal(state) * 100)}%`;
  $('power').textContent = format(power(state)); $('speed').textContent = format(movement.speed); $('stamina').textContent = format(stamina(state));
  if (renderedSkin !== state.selected) {
    const skin = skins.find(s => s.id === state.selected);
    $('stone').innerHTML = artContents(skin); $('stone').dataset.crafted = String(!!skinArt[skin.id]);
    $('stone').style.setProperty('--rock', skin.color); $('stone').dataset.skin = skin.id;
    $('push-skin').innerHTML = art(skin); renderedSkin = state.selected;
  }
  document.body.dataset.motion = state.settings.motion ? 'on' : 'off';
  $('tab-achievements').classList.toggle('has-reward', achievementGroups.some(g => achievementProgress(state, g).ready));
  audio.weather(world.update(), active === 'play' && state.round < 100 && !document.querySelector('dialog[open]'));
}
for (const setting of ['motion', 'vibration', 'randomSkin']) $(`${setting}-toggle`).addEventListener('change', event => {
  state.settings[setting] = event.target.checked; save();
  if (setting === 'motion') renderHUD();
  if (setting === 'vibration' && state.settings.vibration && navigator.vibrate) navigator.vibrate(20);
});
for (const channel of ['stone', 'music', 'weather']) $(`${channel}-volume`).addEventListener('input', event => {
  state.settings[`${channel}Volume`] = Number(event.target.value);
  $(`${channel}-volume-value`).textContent = `${event.target.value}%`;
  save(); audio.sync(); void audio.unlock();
  if (channel === 'stone') audio.push();
  if (channel === 'weather') audio.weather(world.update());
});
$('redeem-form').addEventListener('submit', event => {
  event.preventDefault(); $('redeem-status').textContent = redeemCode(state, $('redeem-code').value); save(); renderPanels(); renderHUD();
});
for (const name of ['help', 'redeem']) $(`open-${name}`).addEventListener('click', () => { pause(); $(`${name}-dialog`).showModal(); });
document.querySelectorAll('[data-close-dialog]').forEach(button => button.addEventListener('click', () => $(button.dataset.closeDialog).close()));
function requestRestart() { pause(); $('restart-dialog').showModal(); }
$('restart-button').addEventListener('click', requestRestart);
$('cancel-restart').addEventListener('click', () => $('restart-dialog').close());
$('confirm-restart').addEventListener('click', () => {
  pause(); restart(state); $('restart-dialog').close(); $('summary-screen').hidden = true;
  $('redeem-code').value = ''; $('redeem-status').textContent = ''; renderProfile(); showTab('play'); save();
});
$('fullscreen').disabled = !document.fullscreenEnabled;
if (!document.fullscreenEnabled) $('fullscreen').textContent = '浏览器不支持';
$('fullscreen').addEventListener('click', async () => {
  try { if (document.fullscreenElement) await document.exitFullscreen(); else await document.documentElement.requestFullscreen(); }
  catch { toast('当前浏览器暂时无法进入全屏'); }
});
document.addEventListener('fullscreenchange', () => { $('fullscreen').textContent = document.fullscreenElement ? '退出全屏' : '进入全屏'; });

function frame(now) {
  const dt = Math.max(0, Math.min((now - lastFrame) / 1000, .1)); lastFrame = now;
  if (active === 'play' && !document.hidden && !document.querySelector('dialog[open]') && state.round < 100) {
    dirty = true;
    const idleSpeed = (!held || exhausted) ? power(state) * thinkingRatio(state) : 0;
    // Count only the portion of this frame already at the thinking floor.
    const settling = idleSpeed > 0 && movement.deceleration > 0 ? Math.max(0, (movement.speed - idleSpeed) / movement.deceleration) : 0;
    trackTime(state, dt);
    if (idleSpeed > 0) state.thinkingSeconds += Math.max(0, dt - settling);
    result(coast(state, movement, dt, idleSpeed));
    if (held && !exhausted) {
      elapsed += dt;
      // Only pulses strictly within the stamina window are allowed.
      while (nextPulse <= elapsed && nextPulse < stamina(state) - 1e-8) {
        step((now / 1000) - (elapsed - nextPulse)); nextPulse += interval(state);
      }
      $('endurance').style.width = `${Math.max(0, 1 - elapsed / stamina(state)) * 100}%`;
      if (elapsed >= stamina(state)) { exhausted = true; $('hint').textContent = '歇一口气，松开再推。'; }
    }
    const thinking = state.round < 100 && idleSpeed > 0 && movement.speed <= idleSpeed * (1 + 1e-9);
    $('thinking-indicator').hidden = !thinking;
    const moved = state.totalDistance - lastDistance;
    if (state.settings.motion && !reducedMotion.matches) {
      targetRotation += moved / Math.max(power(state), 1) * 120;
      const backlog = Math.max(0, targetRotation - rotation);
      // Spread each held push across its interval instead of snapping on a pulse.
      // On release, ease the remaining visual movement to rest without adding meters.
      const previousRotation = rotation;
      rotation += held && !exhausted
        ? Math.min(backlog, Math.max(120 / interval(state), backlog * 5) * dt)
        : backlog * (1 - Math.exp(-12 * dt));
      $('stone').querySelector('.skin-spin').style.transform = `rotate(${rotation}deg)`;
      terrain.update(rotation - previousRotation, dt);
      $('person').style.transform = `rotate(${held && !exhausted || movement.speed > 0 ? Math.sin(now / (held && !exhausted ? 100 : 240)) * (held && !exhausted ? 4 : 3) : 0}deg)`;
    } else { targetRotation = rotation; $('person').style.transform = ''; }
    lastDistance = state.totalDistance;
    audio.roll(Math.min(1, (held && !exhausted ? .7 : thinking ? .25 : 0) + movement.speed / Math.max(1, power(state)) * .2));
    if (now - lastHUD > 80) { renderHUD(); lastHUD = now; }
  }
  if (now - lastGiftCheck > 1000) { if (giftDateKey !== localDateKey()) renderPanels(); lastGiftCheck = now; }
  if (dirty && now - lastSave > 1000) { save(); lastSave = now; }
  requestAnimationFrame(frame);
}
renderHUD(); renderPanels(); save(); if (state.round >= 100) summary.show(); requestAnimationFrame(frame);
