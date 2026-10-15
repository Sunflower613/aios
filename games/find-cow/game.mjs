import { CowGame } from './engine.mjs?v=3';
import { Session } from './session.mjs?v=5';
import { setupWorkshop } from './workshop.mjs?v=6';
import { dailyDate } from './daily.mjs?v=2';
import { readDailyResult, saveDailyResult } from './daily-score.mjs';
import { TouchInput } from './touch.mjs?v=2';
import { PastureAudio } from './audio.mjs';
import { Haptics } from './haptics.mjs?v=2';

const $ = id => document.getElementById(id);
const palette = ['#eda573','#74b8d0','#e0c56f','#ab95ca','#65b8ac','#809fca','#dca0b6','#a8bd77','#bd9a82','#a5bac4','#c88879','#849c70'];
const names = { easy: '简单', medium: '中等', hard: '困难', timed: '计时挑战', survival: '生存模式', daily: '每日挑战', custom: '自定义关卡' };
let game, puzzle, session, worker, generation = 0, loading = false;
let autoExclude = false, ignoreClickUntil = 0;
try { autoExclude = localStorage.getItem('find-cow-auto-exclude') === 'true'; } catch { /* Storage may be disabled. */ }
$('auto-exclude').checked = autoExclude;
const audio = new PastureAudio();
const haptics = new Haptics();
try { haptics.setEnabled(localStorage.getItem('find-cow-vibration') !== 'false'); } catch { /* Default on. */ }
$('vibration').checked = haptics.enabled;
const updateVibrationNote = () => { $('vibration-note').textContent = haptics.description; };
updateVibrationNote();
const feedback = kind => { haptics.play(kind); updateVibrationNote(); audio.play(kind); };
try {
  audio.setEffects(localStorage.getItem('find-cow-effects') !== 'false');
  audio.setMusic(localStorage.getItem('find-cow-music') === 'true');
} catch { /* Use defaults if storage is unavailable. */ }
$('sound-effects').checked = audio.effects;
$('background-music').checked = audio.music;
for (const type of ['pointerdown', 'keydown']) document.addEventListener(type, () => audio.unlock(), { capture: true });
document.addEventListener('visibilitychange', () => audio.setVisible(!document.hidden));
window.addEventListener('pagehide', () => audio.setVisible(false));
window.addEventListener('pageshow', () => audio.setVisible(!document.hidden));
const now = () => performance.now();
const touch = new TouchInput(act, now);
const formatTime = ms => { const s = Math.ceil(ms / 1000); return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`; };
const playing = () => session?.state === 'playing' && game?.state === 'playing' && !loading && !$('play').hidden;
const canContinue = () => session?.mode === 'daily' && session.state === 'timeout' && game.state === 'playing';
const starsText = stars => '★'.repeat(stars) + '☆'.repeat(3 - stars);
let displayedDay;
function refreshDailyResult(force = false) {
  const day = dailyDate();
  if (!force && displayedDay === day) return;
  displayedDay = day;
  const result = readDailyResult(day);
  $('daily-stars').hidden = !result;
  $('daily-stars').textContent = result ? starsText(result.stars) : '';
  $('daily-stars').setAttribute('aria-label', result ? `今日已通关，最佳 ${result.stars} 颗星` : '今日未通关');
  $('daily-stars').title = result ? `今日最佳：${result.stars} 星 · ${formatTime(result.elapsed)}` : '';
}

function render() {
  $('remaining').textContent = game.size - game.found.size;
  $('lives').textContent = Array.from({ length: 3 }, (_, i) => i < game.lives ? '♥' : '♡').join(' ');
  $('lives').setAttribute('aria-label', `剩余${game.lives}次机会`);
  for (const button of $('board').children) {
    const cell = Number(button.dataset.cell), found = game.found.has(cell), wrong = game.mistakes.has(cell);
    const reveal = (game.state === 'lost' || (session.state === 'timeout' && session.mode !== 'daily')) && game.solution.includes(cell) && !found;
    const mark = game.marks.has(cell);
    button.textContent = found || reveal ? '🐮' : '';
    button.className = `cell${found ? ' found' : ''}${wrong ? ' wrong' : ''}${reveal ? ' revealed' : ''}${!found && !reveal && (wrong || mark) ? ' excluded' : ''}`;
    button.disabled = !playing();
    button.setAttribute('aria-label', `第${Math.floor(cell / game.size) + 1}行，第${cell % game.size + 1}列，${found ? '已找到牛' : reveal ? '答案位置' : wrong ? '错误位置' : mark ? '已排除' : '未标记'}`);
  }
  for (const id of ['hint', 'retry']) $(id).hidden = !['classic', 'custom'].includes(session.mode);
  $('new').hidden = session.mode !== 'classic';
  $('share-level').disabled = loading;
  for (const id of ['clear', 'hint', 'retry', 'new']) $(id).disabled = !playing();
  const reviewing = session.state !== 'playing' || game.state !== 'playing';
  $('game-tools').hidden = reviewing;
  $('review-tools').hidden = !reviewing;
  $('play-tip').hidden = reviewing;
  $('review-next').textContent = canContinue() ? '继续解题' : session.state === 'playing' && game.state === 'won' ? '下一关' : '再来一局';
}
function clock() {
  if (!session || $('play').hidden) { refreshDailyResult(); return; }
  const stamp = now();
  if (session.expire(stamp)) { showResult(); render(); }
  const timed = session.timed && !session.overtime;
  $('timer').textContent = formatTime(timed ? session.remaining(stamp) : session.duration(stamp));
  $('timer').classList.toggle('urgent', timed && session.remaining(stamp) <= 30_000);
  $('timer').setAttribute('aria-label', session.overtime ? '累计用时（已超时）' : timed ? '挑战剩余时间' : '用时');
}
function resetGesture() { touch.reset(); }
function mount() {
  resetGesture();
  game = new CowGame(puzzle, { autoExclude, lives: session.lives });
  $('mode-title').textContent = names[session.mode === 'classic' ? session.level : session.mode];
  $('round').textContent = `${game.size} × ${game.size}${session.mode === 'daily' ? ` · ${session.day}` : ['timed', 'survival'].includes(session.mode) ? ` · 第 ${session.completed + 1} 关` : ''}`;
  $('board').style.setProperty('--size', game.size);
  $('board').setAttribute('aria-label', `${game.size}乘${game.size}找牛棋盘`);
  $('board').replaceChildren(...game.regions.map((region, cell) => {
    const button = document.createElement('button');
    button.type = 'button'; button.dataset.cell = cell;
    button.style.setProperty('--color', palette[region]);
    button.style.setProperty('--angle', `${region % 2 ? 45 : 90}deg`);
    return button;
  }));
  $('status').textContent = session.completed ? `已过 ${session.completed} 关，继续寻找下一群小牛。` : '每行、每列、每种颜色各一头，牛不能相邻。';
  session.resume(now()); render(); clock();
}
function newPuzzle() {
  const token = ++generation;
  worker?.terminate(); resetGesture();
  session.pause(now()); loading = true; $('share-level').disabled = true;
  $('status').textContent = '正在整理牧场…';
  $('board').inert = true;
  $('board').replaceChildren();
  $('review-tools').hidden = true;
  $('game-tools').hidden = false;
  $('play-tip').hidden = false;
  $('mode-title').textContent = names[session.mode === 'classic' ? session.level : session.mode];
  $('round').textContent = `${session.size} × ${session.size} · 准备中`;
  $('remaining').textContent = session.size;
  $('lives').textContent = '♥'.repeat(session.lives);
  for (const id of ['clear', 'hint', 'retry', 'new']) $(id).disabled = true;
  clock();
  const fail = () => {
    if (token !== generation) return;
    worker?.terminate(); worker = null;
    $('status').textContent = '牧场生成失败，请返回主页后重试。';
  };
  try {
    worker = new Worker(new URL('./generator.mjs?v=2', import.meta.url), { type: 'module' });
    worker.onmessage = ({ data }) => {
      if (token !== generation) return;
      worker.terminate(); worker = null; puzzle = data;
      loading = false; $('board').inert = false; mount();
    };
    worker.onerror = fail;
    worker.postMessage(session.mode === 'daily' ? { day: session.day } : session.size);
  } catch { fail(); }
}
function closeDialogs() { for (const dialog of document.querySelectorAll('dialog[open]')) dialog.close(); }
function start(mode, level = 'easy') {
  closeDialogs(); session = new Session(mode, level);
  $('home').hidden = true; $('play').hidden = false; $('game-tools').hidden = false;
  document.body.classList.add('playing');
  $('settings').focus(); newPuzzle();
}
function home() {
  generation++; worker?.terminate(); worker = null;
  session?.pause(now()); resetGesture(); closeDialogs();
  $('home').hidden = false; $('play').hidden = true; $('editor').hidden = true; $('recognize-screen').hidden = true; $('game-tools').hidden = true;
  document.body.classList.remove('playing'); $('home-settings').focus();
  refreshDailyResult(true);
}
function startCustom(map) {
  closeDialogs(); generation++; worker?.terminate(); worker = null; loading = false;
  session = new Session('custom'); session.customSize = map.size; puzzle = map;
  $('home').hidden = true; $('editor').hidden = true; $('play').hidden = false;
  $('board').inert = false; document.body.classList.add('playing'); mount();
}
function showResult(withSound = true) {
  resetGesture(); closeDialogs();
  // Paint the final cow before focusing a modal. The completed board stays in
  // place, including between challenge rounds, until the player continues.
  render();
  const won = game.state === 'won' && session.state !== 'timeout';
  if (withSound) feedback(won ? 'win' : 'lost');
  $('result-icon').textContent = won ? '🐮' : session.state === 'timeout' ? '◷' : '♡';
  $('result-title').textContent = won ? '牧场全员到齐！' : session.state === 'timeout' ? '时间到！' : '这次旅程结束啦';
  const cows = session.cows + (session.state === 'timeout' ? game.found.size : 0);
  $('result-detail').textContent = ['classic', 'custom'].includes(session.mode)
    ? `用时 ${formatTime(session.duration(now()))} · 找到 ${game.found.size} / ${game.size} 头牛\n${won ? (game.hints ? `使用了 ${game.hints} 次提示` : '独立完成，做得不错！') : '三颗心已用完，再来一次吧。'}`
    : `${names[session.mode]} · 通关 ${session.completed} 关\n共找到 ${cows} 头牛 · 用时 ${formatTime(session.duration(now()))}`;
  if (session.mode === 'daily') $('result-detail').textContent = `${session.day} · 每日挑战\n找到 ${game.found.size} / 12 头牛 · 用时 ${formatTime(session.duration(now()))}`;
  $('continue-daily').hidden = !canContinue();
  if (session.mode === 'daily' && won) {
    $('result-detail').textContent += `\n${starsText(session.stars)} · ${session.stars} 星（超时扣 ${Number(session.overtime)} 星，消耗爱心扣 ${Number(game.lives < 3)} 星）`;
    saveDailyResult(session.day, { stars: session.stars, elapsed: session.duration(now()) });
    refreshDailyResult(true);
  } else if (canContinue()) {
    $('result-detail').textContent += '\n已超时，扣一颗星。可以继续解题，累计用时从 03:00 继续。';
  }
  $('status').textContent = `${won ? '本关完成' : '本局结束'} · 棋盘只读，可复盘${session.state === 'playing' ? '，复盘不计时' : ''}。`;
  if (canContinue()) $('status').textContent = '时间到，已扣一星；可继续解题，保留当前棋盘。';
  $('again').textContent = session.state === 'playing' && won ? '下一关' : '再来一局';
  $('result-dialog').showModal();
}
function afterAction() {
  if (game.state !== 'playing') {
    const action = session.finishBoard(game, now());
    if (action === 'next' || action === 'end') showResult();
  }
  render(); clock();
}
function act(cell, action = 'toggle') {
  clock();
  if (!playing()) return;
  if (action === 'cow') {
    const result = game.guess(cell);
    if (result === 'correct' || result === 'wrong') feedback(result);
    if (result === 'correct') $('status').textContent = autoExclude ? '找到啦，相关格子已自动排除。' : '找到啦！继续看看其他格子。';
    if (result === 'wrong') $('status').textContent = `这里没有牛，还剩 ${game.lives} 颗心。`;
  } else if (action === 'exclude') { if (!game.marks.has(cell) && game.exclude(cell)) feedback('mark'); }
  else if (action === 'unexclude') { if (game.unexclude(cell)) feedback('mark'); }
  else if (game.mark(cell)) feedback('mark');
  afterAction();
}

// Touch uses pointer gestures; ignore its synthetic clicks to avoid double actions.
$('board').addEventListener('click', event => {
  const cell = event.target.closest('[data-cell]');
  if (!cell || event.pointerType === 'touch' || event.pointerType === 'pen' || now() < ignoreClickUntil) return;
  act(Number(cell.dataset.cell));
});
$('board').addEventListener('contextmenu', event => {
  event.preventDefault();
  if (now() < ignoreClickUntil || event.pointerType === 'touch' || event.pointerType === 'pen') return;
  const cell = event.target.closest('[data-cell]');
  if (cell) act(Number(cell.dataset.cell), 'cow');
});
$('board').addEventListener('keydown', event => {
  const cell = event.target.closest('[data-cell]'); if (!cell) return;
  const index = Number(cell.dataset.cell);
  const offsets = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -game.size, ArrowDown: game.size };
  if (event.key in offsets) {
    event.preventDefault();
    $('board').children[Math.max(0, Math.min(game.size ** 2 - 1, index + offsets[event.key]))].focus();
  } else if (event.key.toLowerCase() === 'c') { event.preventDefault(); act(index, 'cow'); }
  else if (event.key === ' ' || event.key === 'Enter') { event.preventDefault(); act(index); }
});
function cellAt(x, y) {
  const target = document.elementFromPoint(x, y)?.closest('[data-cell]');
  return target && $('board').contains(target) ? Number(target.dataset.cell) : null;
}
$('board').addEventListener('pointerdown', event => {
  if (event.pointerType === 'mouse' || !event.isPrimary || !playing()) return;
  const cell = event.target.closest('[data-cell]'); if (!cell) return;
  event.preventDefault(); ignoreClickUntil = now() + 1000;
  touch.begin(event.pointerId, Number(cell.dataset.cell), event.clientX, event.clientY, { erase: game.marks.has(Number(cell.dataset.cell)), pointerType: event.pointerType });
  $('board').setPointerCapture(event.pointerId);
});
$('board').addEventListener('pointermove', event => {
  if (!touch.gesture || touch.gesture.id !== event.pointerId) return;
  event.preventDefault(); ignoreClickUntil = now() + 1000;
  touch.move(event.pointerId, event.clientX, event.clientY, cellAt);
});
$('board').addEventListener('pointerup', event => {
  if (!touch.gesture || touch.gesture.id !== event.pointerId) return;
  event.preventDefault(); ignoreClickUntil = now() + 1000;
  touch.end(event.pointerId, cellAt(event.clientX, event.clientY));
});
$('board').addEventListener('pointercancel', resetGesture);
$('board').addEventListener('lostpointercapture', event => { if (touch.gesture?.id === event?.pointerId) touch.gesture = null; });

document.querySelectorAll('[data-level]').forEach(button => button.addEventListener('click', () => start('classic', button.dataset.level)));
document.querySelectorAll('[data-mode]').forEach(button => button.addEventListener('click', () => start(button.dataset.mode)));
for (const id of ['home-settings', 'settings']) $(id).addEventListener('click', () => { resetGesture(); $('settings-dialog').showModal(); });
for (const id of ['close-settings', 'done-settings']) $(id).addEventListener('click', () => $('settings-dialog').close());
$('help').addEventListener('click', () => $('help-dialog').showModal());
$('close-help').addEventListener('click', () => $('help-dialog').close());
for (const [id, key, setter] of [['sound-effects', 'effects', 'setEffects'], ['background-music', 'music', 'setMusic']]) {
  $(id).addEventListener('change', async () => {
    audio[setter]($(id).checked);
    try { localStorage.setItem(`find-cow-${key}`, String($(id).checked)); } catch { /* Keep this visit's preference. */ }
    await audio.unlock();
    if (key === 'effects' && audio.effects) audio.play('correct');
  });
}
$('auto-exclude').addEventListener('change', () => {
  autoExclude = $('auto-exclude').checked;
  if (game) game.autoExclude = autoExclude;
  try { localStorage.setItem('find-cow-auto-exclude', String(autoExclude)); } catch { /* Keep the preference for this visit. */ }
});
$('vibration').addEventListener('change', () => {
  haptics.setEnabled($('vibration').checked);
  try { localStorage.setItem('find-cow-vibration', String(haptics.enabled)); } catch { /* Keep this visit's preference. */ }
  if(haptics.enabled)haptics.play('test');
  updateVibrationNote();
});
$('clear').addEventListener('click', () => {
  clock(); if (!playing()) return;
  game.clear(); feedback('clear'); $('status').textContent = '排除已清空，找到的牛和错误记录保留。'; render();
});
$('hint').addEventListener('click', () => {
  if (!playing() || !['classic', 'custom'].includes(session.mode)) return;
  game.hint(); feedback('correct'); $('status').textContent = '帮你找到一头牛，继续加油！'; afterAction();
});
$('retry').addEventListener('click', () => {
  if (!playing() || !['classic', 'custom'].includes(session.mode)) return;
  if (session.mode === 'custom') startCustom(puzzle);
  else { session = new Session('classic', session.level); mount(); }
});
$('new').addEventListener('click', () => { if (session.mode === 'classic') start('classic', session.level); });
$('back').addEventListener('click', () => {
  resetGesture();
  if (session.state !== 'playing' || game?.state !== 'playing' || loading) home(); else $('leave-dialog').showModal();
});
$('stay').addEventListener('click', () => $('leave-dialog').close());
$('leave').addEventListener('click', home);
function continueGame() {
  if (canContinue()) {
    closeDialogs(); resetGesture(); session.continueOvertime(now());
    $('status').textContent = '继续解题 · 已超时扣一星，当前显示累计用时。';
    render(); clock();
  } else if (session.state === 'playing' && game.state === 'won') { closeDialogs(); newPuzzle(); }
  else if (session.mode === 'custom') startCustom(puzzle);
  else start(session.mode, session.level);
}
$('again').addEventListener('click', () => canContinue() ? start(session.mode, session.level) : continueGame());
$('continue-daily').addEventListener('click', continueGame);
$('review-next').addEventListener('click', continueGame);
$('review').addEventListener('click', () => $('result-dialog').close());
$('review-result').addEventListener('click', () => showResult(false));
$('result-home').addEventListener('click', home);
setupWorkshop({ getPuzzle: () => !loading && game ? puzzle : null, playPuzzle: startCustom, showHome: home });
refreshDailyResult();
setInterval(clock, 200);
