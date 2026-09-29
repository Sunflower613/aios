export const levels = {
  easy: { rows: 9, cols: 9, mines: 10 },
  medium: { rows: 16, cols: 16, mines: 40 },
  hard: { rows: 16, cols: 30, mines: 99 },
};

export class Minesweeper {
  constructor(level = 'easy', random = Math.random) {
    Object.assign(this, levels[level]);
    this.random = random;
    this.state = 'ready';
    this.cells = Array.from({ length: this.rows * this.cols }, () => ({ mine: false, open: false, flag: false, number: 0 }));
    this.exploded = -1;
  }
  neighbors(index) {
    const row = Math.floor(index / this.cols), col = index % this.cols, result = [];
    for (let y = -1; y <= 1; y++) for (let x = -1; x <= 1; x++) {
      if ((!x && !y) || row + y < 0 || row + y >= this.rows || col + x < 0 || col + x >= this.cols) continue;
      result.push((row + y) * this.cols + col + x);
    }
    return result;
  }
  get finished() { return this.state === 'won' || this.state === 'lost'; }
  get flags() { return this.cells.filter(cell => cell.flag).length; }
  plant(first) {
    const safe = new Set([first, ...this.neighbors(first)]);
    const candidates = this.cells.map((_, i) => i).filter(i => !safe.has(i));
    for (let i = candidates.length - 1; i > 0; i--) {
      const j = Math.floor(this.random() * (i + 1));
      [candidates[i], candidates[j]] = [candidates[j], candidates[i]];
    }
    candidates.slice(0, this.mines).forEach(i => { this.cells[i].mine = true; });
    this.cells.forEach((cell, i) => { cell.number = this.neighbors(i).filter(n => this.cells[n].mine).length; });
    this.state = 'playing';
  }
  toggleFlag(index, proven = false) {
    const cell = this.cells[index];
    if (!cell || cell.open || this.finished) return false;
    cell.flag = !cell.flag;
    cell.proven = cell.flag && proven;
    return true;
  }
  reveal(index) {
    const cell = this.cells[index];
    if (!cell || cell.open || cell.flag || this.finished) return false;
    if (this.state === 'ready') this.plant(index);
    const queue = [index];
    while (queue.length) {
      const current = queue.pop(), next = this.cells[current];
      if (next.open || next.flag) continue;
      next.open = true;
      if (next.mine) { this.state = 'lost'; this.exploded = current; return true; }
      if (!next.number) queue.push(...this.neighbors(current).filter(i => !this.cells[i].open));
    }
    if (this.cells.every(c => c.mine || c.open)) {
      this.state = 'won';
      this.cells.forEach(c => { if (c.mine) c.flag = true; });
    }
    return true;
  }
  chord(index) {
    const cell = this.cells[index];
    if (!cell?.open || !cell.number || this.finished) return false;
    const around = this.neighbors(index);
    if (around.filter(i => this.cells[i].flag).length !== cell.number) return false;
    let changed = false;
    for (const i of around) { changed = this.reveal(i) || changed; if (this.finished) break; }
    return changed;
  }
  // Only public information reaches the solver; hidden mines are never inspected.
  visible() {
    return this.cells.map(c => ({ open: c.open, flag: c.flag && !!c.proven, marked: c.flag, number: c.open ? c.number : null }));
  }
}

export function chooseMove(cells, neighbors, totalMines) {
  const hidden = cells.flatMap((c, i) => !c.open && !c.flag ? [i] : []);
  if (!hidden.length) return null;
  if (!cells.some(c => c.open)) {
    const first = hidden.find(i => !cells[i].marked);
    return first === undefined ? null : { index: first, type: 'reveal', reason: '安全开局' };
  }
  const rules = cells.flatMap((c, i) => {
    if (!c.open) return [];
    const around = neighbors(i);
    const unknown = around.filter(n => !cells[n].open && !cells[n].flag);
    return unknown.length ? [{ unknown, count: c.number - around.filter(n => cells[n].flag).length }] : [];
  });
  rules.push({ unknown: hidden, count: totalMines - cells.filter(c => c.flag).length });
  if (rules.some(r => r.count < 0 || r.count > r.unknown.length)) return null;
  const infer = ({ unknown, count }) => {
    if (!unknown.length) return null;
    if (count === 0) return { index: unknown[0], type: cells[unknown[0]].marked ? 'unflag' : 'reveal', reason: '数字推理：此格安全' };
    if (count === unknown.length) return { index: unknown[0], type: 'flag', reason: '数字推理：此格有雷' };
    return null;
  };
  for (const rule of rules) { const move = infer(rule); if (move) return move; }
  for (const a of rules) for (const b of rules) {
    if (a === b || a.unknown.length >= b.unknown.length) continue;
    const set = new Set(b.unknown);
    if (a.unknown.every(i => set.has(i))) {
      const small = new Set(a.unknown);
      const move = infer({ unknown: b.unknown.filter(i => !small.has(i)), count: b.count - a.count });
      if (move) return move;
    }
  }
  return null;
}

export function applyMove(game, move) {
  if (move.type === 'flag') {
    if (!game.cells[move.index].flag) game.toggleFlag(move.index, true);
    else game.cells[move.index].proven = true;
    return true;
  }
  return move.type === 'unflag' ? game.toggleFlag(move.index) : game.reveal(move.index);
}

// Validate on a separate board, then return the untouched layout. Never change
// mines during play, and never accept a layout that this solver cannot finish.
export async function generateSolvable(level, first, {
  random = Math.random, maxAttempts = 300, cancelled = () => false,
  yieldControl = () => new Promise(resolve => setTimeout(resolve, 0)),
  onProgress = () => {},
} = {}) {
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    if (cancelled()) return null;
    const candidate = new Minesweeper(level, random);
    candidate.plant(first);
    const original = candidate.cells.map(c => ({ ...c }));
    candidate.reveal(first);
    while (!candidate.finished) {
      const move = chooseMove(candidate.visible(), i => candidate.neighbors(i), candidate.mines);
      if (!move) break;
      applyMove(candidate, move);
    }
    if (candidate.state === 'won') {
      candidate.cells = original;
      candidate.state = 'playing';
      return candidate;
    }
    onProgress(attempt);
    await yieldControl();
  }
  return null;
}
