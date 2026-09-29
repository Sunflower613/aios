import { Minesweeper, chooseMove, applyMove, generateSolvable } from './engine.mjs';
import { mineProbabilities, probabilityLabel } from './probability.mjs';

const $ = id => document.getElementById(id);
let game, buttons, autoInterval = null, startedAt = null, timerInterval = null, flagMode = false, last = -1;
let generating = false, generation = 0;
let round = 0;
let assist = false;
const history = [];
const stuckMessage = '没有能确定的下一步，已停止。若遇到“死亡二选一”，请手动选择后再继续解题。';
const digits = n => n < 0 ? '-' + String(Math.min(99, -n)).padStart(2, '0') : String(Math.min(999, n)).padStart(3, '0');
function renderHistory() {
  $('log-list').replaceChildren(...history.map(entry => {
    const item = document.createElement('li');
    item.textContent = entry;
    return item;
  }));
  $('log-list').scrollTop = $('log-list').scrollHeight;
}
function message(text) {
  $('status').textContent = text;
  const seconds = startedAt === null ? 0 : Math.floor((Date.now() - startedAt) / 1000);
  history.push(`第 ${round} 局 · ${seconds} 秒 — ${text}`);
  if (history.length > 1000) history.shift();
  $('log-hint').textContent = `历史日志 (${history.length}) · 点击${$('log-panel').hidden ? '展开' : '收起'}`;
  if (!$('log-panel').hidden) renderHistory();
}
const position = index => `${Math.floor(index / game.cols) + 1} 行 ${index % game.cols + 1} 列`;
function stopAuto() {
  clearInterval(autoInterval);
  autoInterval = null;
  $('auto').textContent = '▶ 开启自动';
  $('auto').setAttribute('aria-pressed', 'false');
  $('indicator').classList.remove('running');
}
function render() {
  const analysis = assist && game.state === 'playing' ? mineProbabilities(game.visible(), i => game.neighbors(i), game.mines) : null;
  $('assist-note').hidden = !assist;
  $('assist-note').textContent = game.finished ? '本局已结束，概率提示已隐藏。' : game.state === 'ready' ? '首步总是安全，开局后显示有雷概率。' : analysis?.status === 'limited' ? '局面较复杂，? 表示暂未算出；不会用猜测数值代替。' : analysis?.status === 'inconsistent' ? '当前线索存在矛盾，暂无法计算。' : '有雷概率：绿 0% 安全，红 100% 有雷，其余为可能性。';
  $('mines').textContent = digits(game.mines - game.flags);
  $('restart').textContent = game.state === 'lost' ? '☹' : game.state === 'won' ? '😎' : '☺';
  buttons.forEach((button, i) => {
    const cell = game.cells[i];
    const showMine = game.state === 'lost' && cell.mine;
    const wrong = game.state === 'lost' && cell.flag && !cell.mine;
    button.className = ['cell', cell.open || showMine ? 'open' : '', cell.flag ? 'flag' : '', i === game.exploded ? 'exploded' : '', wrong ? 'wrong' : '', i === last ? 'last' : ''].filter(Boolean).join(' ');
    button.dataset.number = cell.open && !cell.mine ? cell.number : '';
    button.textContent = wrong ? '×' : cell.flag ? '⚑' : showMine || (cell.open && cell.mine) ? '✹' : cell.open && cell.number ? cell.number : '';
    const label = wrong ? '错误标记' : cell.flag ? '已插旗' : showMine ? '地雷' : cell.open ? (cell.number ? `周围 ${cell.number} 颗雷` : '空白') : '未翻开';
    button.setAttribute('aria-label', `${Math.floor(i / game.cols) + 1} 行 ${i % game.cols + 1} 列，${label}`);
    button.title = '';
    if (analysis && !cell.open) {
      const probability = analysis.probabilities[i], text = probabilityLabel(probability);
      const hint = probability === null ? '有雷概率暂未算出' : `有雷概率 ${text}`;
      button.className += ` probability ${probability === 0 ? 'safe' : probability === 1 ? 'certain-mine' : ''}`;
      button.textContent = text;
      button.title = hint;
      button.setAttribute('aria-label', `${position(i)}，${label}，${hint}`);
    }
  });
  if (game.finished) {
    stopAuto();
    clearInterval(timerInterval);
    $('auto').disabled = true;
    $('solve').disabled = true;
    message(game.state === 'won' ? '恭喜！所有安全方格都已找到。点击笑脸再来一局。' : '踩到地雷了！点击笑脸再试一次。');
  }
}
function act(index, type, reason, automated = false, paint = true) {
  const changed = automated ? applyMove(game, { index, type }) : type === 'flag' ? game.toggleFlag(index) : game.cells[index].open ? game.chord(index) : game.reveal(index);
  if (!changed) return;
  last = index;
  if (startedAt === null && game.state !== 'ready') {
    startedAt = Date.now();
    timerInterval = setInterval(() => { $('timer').textContent = digits(Math.floor((Date.now() - startedAt) / 1000)); }, 250);
  }
  message(reason || `手动 · ${type === 'flag' ? (game.cells[index].flag ? '插旗' : '取消旗子') : '翻开方格'}（${position(index)}）`);
  if (paint) render();
}
async function prepare(index) {
  if (game.state !== 'ready' || $('mode').value !== 'no-guess') return true;
  const token = ++generation;
  generating = true;
  $('auto').disabled = true;
  $('solve').disabled = true;
  message('正在生成并验证无猜推理地图…可点击笑脸取消。');
  try {
    // Yield once so the generation status paints before validation begins.
    await new Promise(resolve => setTimeout(resolve, 0));
    const board = await generateSolvable($('difficulty').value, index, {
      cancelled: () => token !== generation,
      onProgress: attempt => message(`正在验证无猜推理地图…已尝试 ${attempt} 张，可点击笑脸取消。`),
    });
    if (token !== generation) return false;
    if (!board) {
      stopAuto();
      message('本次未找到通过验证的地图，请重试或切换难度；没有使用需要猜测的地图。');
      return false;
    }
    // Preserve user marks, but never treat them as proven mines.
    board.cells.forEach((cell, i) => { cell.flag = game.cells[i].flag; });
    game = board;
    return true;
  } catch (error) {
    if (token === generation) { stopAuto(); message('地图生成失败，请重新开始。'); }
    console.error(error);
    return false;
  } finally {
    if (token === generation) {
      generating = false;
      $('auto').disabled = false;
      $('solve').disabled = false;
    }
  }
}
function manual(index, type) {
  if (autoInterval !== null || game.finished || generating) return;
  if (type === 'reveal' && game.cells[index].flag) return;
  if (type === 'reveal' && game.state === 'ready' && $('mode').value === 'no-guess') {
    void prepare(index).then(ready => { if (ready) act(index, type); });
    return;
  }
  act(index, type);
}
function reset() {
  round++;
  generation++;
  generating = false;
  stopAuto();
  clearInterval(timerInterval);
  startedAt = null;
  last = -1;
  game = new Minesweeper($('difficulty').value);
  $('timer').textContent = '000';
  $('auto').disabled = false;
  $('solve').disabled = false;
  $('game-window').style.width = `calc(${game.cols} * var(--cell) + 28px)`;
  $('board').style.gridTemplateColumns = `repeat(${game.cols}, minmax(var(--cell), 1fr))`;
  buttons = game.cells.map((_, index) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.tabIndex = index === 0 ? 0 : -1;
    button.addEventListener('focus', () => { buttons.forEach(b => { b.tabIndex = b === button ? 0 : -1; }); });
    button.addEventListener('click', () => manual(index, flagMode ? 'flag' : 'reveal'));
    button.addEventListener('contextmenu', event => { event.preventDefault(); manual(index, 'flag'); });
    button.addEventListener('keydown', event => {
      if (event.key.toLowerCase() === 'f') { event.preventDefault(); manual(index, 'flag'); return; }
      const row = Math.floor(index / game.cols), col = index % game.cols;
      const targets = { ArrowLeft: row * game.cols + Math.max(0, col - 1), ArrowRight: row * game.cols + Math.min(game.cols - 1, col + 1), ArrowUp: Math.max(0, row - 1) * game.cols + col, ArrowDown: Math.min(game.rows - 1, row + 1) * game.cols + col };
      if (event.key in targets) { event.preventDefault(); buttons[targets[event.key]].focus(); }
    });
    return button;
  });
  $('board').replaceChildren(...buttons);
  message($('mode').value === 'no-guess' ? '无猜推理：点击首格后生成可纯推理解完的地图。' : '点击任意方格开始，第一步总是安全。');
  render();
}
$('restart').addEventListener('click', reset);
$('difficulty').addEventListener('change', reset);
$('mode').addEventListener('change', reset);
$('assist').addEventListener('click', () => {
  assist = !assist;
  $('assist').setAttribute('aria-pressed', String(assist));
  $('assist').textContent = assist ? '辅助：开' : '辅助模式';
  render();
});
$('log-toggle').addEventListener('click', () => {
  $('log-panel').hidden = !$('log-panel').hidden;
  $('log-toggle').setAttribute('aria-expanded', String(!$('log-panel').hidden));
  $('log-hint').textContent = `历史日志 (${history.length}) · 点击${$('log-panel').hidden ? '展开' : '收起'}`;
  if (!$('log-panel').hidden) renderHistory();
});
$('flag-mode').addEventListener('click', () => {
  flagMode = !flagMode;
  $('flag-mode').setAttribute('aria-pressed', String(flagMode));
  $('flag-mode').textContent = flagMode ? '⚑ 插旗中' : '⚑ 插旗模式';
});
$('help').addEventListener('click', () => {
  $('instructions').hidden = !$('instructions').hidden;
  $('help').setAttribute('aria-expanded', String(!$('instructions').hidden));
});
$('auto').addEventListener('click', () => {
  if (autoInterval !== null) { stopAuto(); message('自动模式已暂停，可以手动操作。'); return; }
  if (game.finished || generating) return;
  $('auto').textContent = 'Ⅱ 暂停自动';
  $('auto').setAttribute('aria-pressed', 'true');
  $('indicator').classList.add('running');
  message('自动模式已开启，每秒操作一次；点击暂停可手动接管。');
  autoInterval = setInterval(async () => {
    if (generating) return;
    const move = chooseMove(game.visible(), i => game.neighbors(i), game.mines);
    if (!move) { stopAuto(); message(stuckMessage); return; }
    if (game.state === 'ready' && $('mode').value === 'no-guess' && !await prepare(move.index)) return;
    act(move.index, move.type, `自动 · ${move.reason}（${position(move.index)}）`, true);
    buttons[move.index].scrollIntoView({ block: 'nearest', inline: 'nearest' });
  }, 1000);
});
$('solve').addEventListener('click', async () => {
  if (game.finished || generating) return;
  stopAuto();
  const first = chooseMove(game.visible(), i => game.neighbors(i), game.mines);
  if (!first) { message(stuckMessage); return; }
  if (game.state === 'ready' && $('mode').value === 'no-guess' && !await prepare(first.index)) return;
  // No per-move delay or intermediate rendering. The board has at most 480 cells.
  let steps = 0;
  while (!game.finished) {
    const move = chooseMove(game.visible(), i => game.neighbors(i), game.mines);
    if (!move) break;
    act(move.index, move.type, `一键解题 · ${move.reason}（${position(move.index)}）`, true, false);
    steps++;
  }
  message(`一键解题完成 ${steps} 步。${game.finished ? '' : stuckMessage}`);
  render();
});
reset();
