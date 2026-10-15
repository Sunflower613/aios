export const levels = { easy: 6, medium: 8, hard: 10 };

function shuffle(items, random) {
  for (let i = items.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [items[i], items[j]] = [items[j], items[i]];
  }
  return items;
}

// Enumerate up to the requested number of solutions, pruning by row, column,
// region and the preceding row's diagonal neighbors.
export function solve(regions, size, limit = 2) {
  const results = [], columns = new Set(), colors = new Set(), path = [];
  function visit(row) {
    if (row === size) { results.push([...path]); return; }
    for (let col = 0; col < size && results.length < limit; col++) {
      const cell = row * size + col, color = regions[cell];
      if (columns.has(col) || colors.has(color) || (row && Math.abs(path[row - 1] % size - col) <= 1)) continue;
      columns.add(col); colors.add(color); path.push(cell);
      visit(row + 1);
      path.pop(); columns.delete(col); colors.delete(color);
    }
  }
  visit(0);
  return results;
}

export function neighbors(cell, size) {
  const row = Math.floor(cell / size), col = cell % size;
  return [[row - 1, col], [row + 1, col], [row, col - 1], [row, col + 1]]
    .filter(([r, c]) => r >= 0 && c >= 0 && r < size && c < size).map(([r, c]) => r * size + c);
}

export function generate(size, random = Math.random) {
  if (![...Object.values(levels), 12].includes(size)) throw new RangeError('Unsupported board size');
  let solution;
  function place(cols = []) {
    if (cols.length === size) { solution = cols.map((c, r) => r * size + c); return true; }
    return shuffle(Array.from({ length: size }, (_, i) => i), random).some(col => {
      if (cols.includes(col) || (cols.length && Math.abs(cols.at(-1) - col) <= 1)) return false;
      return place([...cols, col]);
    });
  }
  place();
  if (size === 12) {
    // Start from a unique connected partition and expand the small regions.
    // Each accepted transfer preserves connectivity and uniqueness, avoiding
    // repeated searches through mostly ambiguous large random boards.
    const regions = Array(size * size).fill(0), seeds = new Set(solution);
    solution.forEach((cell, color) => { regions[cell] = color; });
    for (let step = 0; step < size * size * 12; step++) {
      const cell = Math.floor(random() * regions.length);
      if (seeds.has(cell)) continue;
      const color = regions[cell], counts = Array(size).fill(0);
      regions.forEach(value => counts[value]++);
      const targets = neighbors(cell, size).filter(next => regions[next] !== color && counts[regions[next]] < counts[color]);
      if (!targets.length) continue;
      const seen = new Set([solution[color]]), queue = [solution[color]];
      for (let k = 0; k < queue.length; k++) for (const next of neighbors(queue[k], size)) {
        if (next !== cell && regions[next] === color && !seen.has(next)) { seen.add(next); queue.push(next); }
      }
      if (seen.size !== counts[color] - 1) continue;
      regions[cell] = regions[targets[Math.floor(random() * targets.length)]];
      if (solve(regions, size).length !== 1) regions[cell] = color;
    }
    return { size, regions, solution };
  }
  for (let attempt = 0; attempt < 80; attempt++) {
    const regions = Array(size * size).fill(-1), frontier = [];
    solution.forEach((cell, color) => { regions[cell] = color; });
    const add = cell => neighbors(cell, size).forEach(next => {
      if (regions[next] === -1) frontier.push([next, regions[cell]]);
    });
    solution.forEach(add);
    while (frontier.length) {
      const index = Math.floor(random() * frontier.length);
      const [cell, color] = frontier[index];
      frontier[index] = frontier.at(-1); frontier.pop();
      if (regions[cell] !== -1) continue;
      regions[cell] = color; add(cell);
    }
    // Remove alternative solutions by transferring their non-seed boundary
    // cells, preserving both region connectivity and the planted solution.
    for (let refinement = 0; refinement < 160; refinement++) {
      const answers = solve(regions, size);
      if (answers.length === 1) return { size, regions, solution };
      const alternative = answers.find(answer => answer.some((cell, row) => cell !== solution[row]));
      let changed = false;
      for (const cell of shuffle(alternative.filter(cell => !solution.includes(cell)), random)) {
        const color = regions[cell];
        const targets = neighbors(cell, size).filter(next => regions[next] !== color);
        if (!targets.length) continue;
        const seen = new Set([solution[color]]), queue = [solution[color]];
        for (let k = 0; k < queue.length; k++) for (const next of neighbors(queue[k], size)) {
          if (next !== cell && regions[next] === color && !seen.has(next)) { seen.add(next); queue.push(next); }
        }
        if (seen.size !== regions.filter(value => value === color).length - 1) continue;
        regions[cell] = regions[targets[Math.floor(random() * targets.length)]];
        changed = true; break;
      }
      if (!changed) break;
    }
  }
  // Bounded fallback: isolated cows pin all but one row/column. Non-touching
  // single-cell regions leave the surrounding region connected.
  const regions = Array(size * size).fill(0);
  solution.forEach((cell, color) => { regions[cell] = color; });
  return { size, regions, solution };
}

export class CowGame {
  constructor(puzzle, { autoExclude = false, lives = 3 } = {}) {
    Object.assign(this, puzzle);
    this.marks = new Set(); this.found = new Set(); this.mistakes = new Set();
    this.lives = lives; this.autoExclude = autoExclude; this.state = 'playing'; this.hints = 0;
  }
  mark(cell) {
    if (!this.valid(cell) || this.state !== 'playing' || this.found.has(cell) || this.mistakes.has(cell)) return false;
    if (this.marks.has(cell)) this.marks.delete(cell); else this.marks.add(cell);
    return true;
  }
  valid(cell) { return Number.isInteger(cell) && cell >= 0 && cell < this.size ** 2; }
  exclude(cell) {
    if (!this.valid(cell) || this.state !== 'playing' || this.found.has(cell) || this.mistakes.has(cell)) return false;
    this.marks.add(cell);
    return true;
  }
  guess(cell) {
    if (!this.valid(cell) || this.state !== 'playing' || this.found.has(cell) || this.mistakes.has(cell)) return 'ignored';
    this.marks.delete(cell);
    if (!this.solution.includes(cell)) {
      this.mistakes.add(cell); this.lives--;
      if (!this.lives) this.state = 'lost';
      return 'wrong';
    }
    this.found.add(cell);
    if (this.autoExclude) for (let i = 0; i < this.size ** 2; i++) {
      const dr = Math.abs(Math.floor(i / this.size) - Math.floor(cell / this.size));
      const dc = Math.abs(i % this.size - cell % this.size);
      if (!this.found.has(i) && (dr === 0 || dc === 0 || this.regions[i] === this.regions[cell] || (dr <= 1 && dc <= 1))) this.marks.add(i);
    }
    if (this.found.size === this.size) this.state = 'won';
    return 'correct';
  }
  unexclude(cell) {
    if (!this.valid(cell) || this.state !== 'playing' || this.found.has(cell) || this.mistakes.has(cell)) return false;
    return this.marks.delete(cell);
  }
  hint() {
    if (this.state !== 'playing') return null;
    const cell = this.solution.find(i => !this.found.has(i));
    this.hints++; this.guess(cell); return cell;
  }
  clear() { if (this.state === 'playing') this.marks.clear(); }
}
