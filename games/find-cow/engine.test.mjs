import test from 'node:test';
import assert from 'node:assert/strict';
import { CowGame, generate, solve, neighbors, levels } from './engine.mjs';
test('batch erasing preserves cows, mistakes and untouched cells',()=>{
  const game=new CowGame({size:6,regions:Array(36).fill(0),solution:[1,9,17,18,26,34]});
  game.guess(1);game.guess(0);game.exclude(2);game.exclude(3);
  assert.equal(game.unexclude(2),true);assert.equal(game.unexclude(2),false);
  for(const cell of [0,1,4])assert.equal(game.unexclude(cell),false);
  assert.ok(game.found.has(1));assert.ok(game.mistakes.has(0));assert.ok(game.marks.has(3));
  game.state='lost';assert.equal(game.unexclude(3),false);
});

function seeded(seed) {
  return () => { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed / 2 ** 32; };
}

test('all sizes generate unique puzzles with connected regions and non-touching cows', () => {
  for (const size of Object.values(levels)) for (let seed = 1; seed <= 25; seed++) {
    const puzzle = generate(size, seeded(seed));
    assert.equal(puzzle.regions.length, size ** 2);
    assert.deepEqual(solve(puzzle.regions, size), [puzzle.solution]);
    assert.equal(new Set(puzzle.solution.map(cell => cell % size)).size, size);
    for (let row = 1; row < size; row++) assert.ok(Math.abs(puzzle.solution[row] % size - puzzle.solution[row - 1] % size) > 1);
    for (let color = 0; color < size; color++) {
      const cells = puzzle.regions.flatMap((value, cell) => value === color ? [cell] : []);
      const visited = new Set([cells[0]]), queue = [cells[0]];
      for (let i = 0; i < queue.length; i++) for (const cell of neighbors(queue[i], size)) {
        if (puzzle.regions[cell] === color && !visited.has(cell)) { visited.add(cell); queue.push(cell); }
      }
      assert.equal(visited.size, cells.length);
      assert.equal(puzzle.solution.filter(cell => puzzle.regions[cell] === color).length, 1);
    }
  }
});

test('marking, clearing, mistakes and repeated clicks preserve progress', () => {
  const game = new CowGame(generate(6, seeded(42)), { autoExclude: true });
  const cow = game.solution[0], empty = game.regions.findIndex((_, cell) => !game.solution.includes(cell));
  game.mark(cow); assert.ok(game.marks.has(cow));
  game.mark(cow); assert.ok(!game.marks.has(cow));
  assert.equal(game.guess(cow), 'correct');
  assert.ok(game.marks.size > 0);
  assert.ok(game.solution.every(cell => !game.marks.has(cell)));
  assert.equal(game.guess(cow), 'ignored');
  assert.equal(game.guess(empty), 'wrong');
  assert.equal(game.lives, 2);
  assert.equal(game.guess(empty), 'ignored');
  assert.equal(game.lives, 2);
  game.clear(); assert.equal(game.marks.size, 0);
  assert.ok(game.found.has(cow)); assert.ok(game.mistakes.has(empty));
  assert.equal(game.guess(-1), 'ignored'); assert.equal(game.mark(36), false);
});

test('three distinct mistakes end the game and freeze actions', () => {
  const game = new CowGame(generate(8, seeded(12)));
  const empty = game.regions.flatMap((_, cell) => game.solution.includes(cell) ? [] : [cell]);
  empty.slice(0, 3).forEach(cell => game.guess(cell));
  assert.equal(game.state, 'lost'); assert.equal(game.lives, 0);
  assert.equal(game.guess(game.solution[0]), 'ignored');
  assert.equal(game.hint(), null); assert.equal(game.mark(empty[3]), false);
});

test('hints recover incorrectly excluded cows and complete a game exactly once', () => {
  const game = new CowGame(generate(10, seeded(9)));
  game.solution.forEach(cell => game.mark(cell));
  for (let i = 0; i < 10; i++) assert.equal(game.hint(), game.solution[i]);
  assert.equal(game.state, 'won'); assert.equal(game.hints, 10);
  assert.equal(game.lives, 3); assert.equal(game.found.size, 10);
  assert.equal(game.hint(), null); assert.equal(game.guess(0), 'ignored');
});

test('confirming cows leaves other cells untouched by default; convenience can be toggled', () => {
  const game = new CowGame(generate(6, seeded(24)));
  game.guess(game.solution[0]);
  assert.equal(game.marks.size, 0);
  game.autoExclude = true;
  game.guess(game.solution[1]);
  assert.ok(game.marks.size > 0);
  game.clear(); game.autoExclude = false;
  game.guess(game.solution[2]);
  assert.equal(game.marks.size, 0);
});

test('drag exclusion is idempotent and never replaces a cow or a mistake', () => {
  const game = new CowGame(generate(6, seeded(24)), { lives: 2 });
  const cow = game.solution[0];
  game.exclude(0); game.exclude(0); assert.ok(game.marks.has(0));
  game.guess(cow); assert.equal(game.exclude(cow), false);
  const empty = game.regions.findIndex((_, cell) => !game.solution.includes(cell));
  game.guess(empty); assert.equal(game.lives, 1);
  assert.equal(game.exclude(empty), false); assert.equal(game.exclude(-1), false);
});
