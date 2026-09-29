import test from 'node:test';
import assert from 'node:assert/strict';
import { Minesweeper, chooseMove, applyMove, generateSolvable, levels } from './engine.mjs';

function seeded(seed = 42) {
  return () => { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed / 2 ** 32; };
}

test('all difficulties plant exact mine counts and protect the first neighborhood', () => {
  for (const level of Object.keys(levels)) {
    for (const first of [0, 40, levels[level].rows * levels[level].cols - 1]) {
      const game = new Minesweeper(level, seeded(first));
      game.reveal(first);
      assert.equal(game.cells.filter(c => c.mine).length, game.mines);
      for (const i of [first, ...game.neighbors(first)]) assert.equal(game.cells[i].mine, false);
      for (const [i, cell] of game.cells.entries()) assert.equal(cell.number, game.neighbors(i).filter(n => game.cells[n].mine).length);
      assert.notEqual(game.state, 'lost');
    }
  }
});

test('flags block opening, safe cells win, and terminal boards cannot change', () => {
  const game = new Minesweeper('easy', seeded());
  game.toggleFlag(0);
  assert.equal(game.reveal(0), false);
  assert.equal(game.state, 'ready');
  game.toggleFlag(0);
  game.reveal(0);
  game.cells.forEach((cell, i) => { if (!cell.mine) game.reveal(i); });
  assert.equal(game.state, 'won');
  assert.equal(game.flags, game.mines);
  assert.equal(game.toggleFlag(0), false);
  assert.equal(game.reveal(game.cells.findIndex(c => c.mine)), false);
});

test('a mine ends the game, and hidden views do not expose mine locations', () => {
  const game = new Minesweeper('easy', seeded());
  game.reveal(0);
  game.visible().forEach(cell => { assert.equal('mine' in cell, false); if (!cell.open) assert.equal(cell.number, null); });
  const mine = game.cells.findIndex(c => c.mine);
  game.reveal(mine);
  assert.equal(game.state, 'lost');
  assert.equal(game.exploded, mine);
});

test('chording opens neighbors with correct flags and loses with incorrect ones', () => {
  for (const wrong of [false, true]) {
    const game = new Minesweeper('easy', seeded());
    game.plant(0);
    const index = game.cells.findIndex((c, i) => !c.mine && c.number === 1 && game.neighbors(i).some(n => !game.cells[n].mine));
    game.reveal(index);
    const around = game.neighbors(index);
    const flag = around.find(i => wrong ? !game.cells[i].mine && !game.cells[i].open : game.cells[i].mine);
    assert.notEqual(flag, undefined);
    game.toggleFlag(flag);
    assert.equal(game.chord(index), true);
    assert.equal(game.state === 'lost', wrong);
  }
});

test('solver infers flags and safe cells from visible constraints', () => {
  const hidden = () => ({ open: false, flag: false, number: null });
  let view = [{ open: true, flag: false, number: 1 }, hidden(), hidden()];
  assert.deepEqual(chooseMove(view, () => [1], 2).type, 'flag');
  view[1].flag = true;
  assert.equal(chooseMove(view, () => [1, 2], 1).index, 2);
  assert.equal(chooseMove(view, () => [1, 2], 1).type, 'reveal');
});

test('subset constraints identify a safe cell without looking at mines', () => {
  const cells = [
    { open: true, flag: false, number: 1 },
    { open: true, flag: false, number: 1 },
    ...Array.from({ length: 4 }, () => ({ open: false, flag: false, number: null })),
  ];
  const move = chooseMove(cells, i => i === 0 ? [2, 3] : [2, 3, 4], 2);
  assert.equal(move.index, 4);
  assert.equal(move.type, 'reveal');
});

test('automated games only make valid deductions and stop when stuck', () => {
  for (const level of Object.keys(levels)) for (let seed = 1; seed <= 10; seed++) {
    const random = seeded(seed), game = new Minesweeper(level, random);
    let steps = 0;
    while (!game.finished && steps++ <= game.cells.length * 2) {
      const move = chooseMove(game.visible(), i => game.neighbors(i), game.mines);
      if (!move) break;
      if (move.reason.startsWith('数字推理')) assert.equal(game.cells[move.index].mine, move.type === 'flag');
      assert.equal(applyMove(game, move), true);
    }
    assert.notEqual(game.state, 'lost');
    assert.ok(steps <= game.cells.length * 2);
  }
});

test('a death 50/50 returns no move and never chooses either hidden cell', () => {
  const view = [{ open: true, flag: false, number: 1 }, ...Array.from({ length: 2 }, () => ({ open: false, flag: false, number: null }))];
  assert.equal(chooseMove(view, () => [1, 2], 1), null);
});

test('manual flags are not evidence; proven safe misflags are removed', () => {
  const game = new Minesweeper('easy', seeded());
  game.toggleFlag(1);
  assert.equal(game.visible()[1].flag, false);
  assert.equal(game.visible()[1].marked, true);
  const view = [{ open: true, flag: false, number: 0 }, { open: false, flag: false, marked: true, number: null }];
  assert.equal(chooseMove(view, () => [1], 0).type, 'unflag');
  applyMove(game, { index: 1, type: 'flag' });
  assert.equal(game.visible()[1].flag, true);
  game.toggleFlag(1);
  game.toggleFlag(1);
  assert.equal(game.visible()[1].flag, false);
});

test('generated maps solve from the requested start without guesses or changed mines', async () => {
  for (const level of Object.keys(levels)) for (const first of [0, Math.floor(levels[level].rows * levels[level].cols / 2)]) {
    const game = await generateSolvable(level, first, { random: seeded(123 + first), yieldControl: async () => {} });
    assert.ok(game, `${level} first ${first} generation failed`);
    assert.equal(game.cells.filter(c => c.mine).length, game.mines);
    assert.ok(game.cells.every(c => !c.open && !c.flag));
    const mines = game.cells.map(c => c.mine);
    game.reveal(first);
    while (!game.finished) {
      const move = chooseMove(game.visible(), i => game.neighbors(i), game.mines);
      assert.ok(move);
      applyMove(game, move);
    }
    assert.equal(game.state, 'won');
    assert.deepEqual(game.cells.map(c => c.mine), mines);
  }
});

test('generation has a finite budget and supports cancellation without fallback', async () => {
  assert.equal(await generateSolvable('easy', 0, { maxAttempts: 0 }), null);
  assert.equal(await generateSolvable('hard', 0, { cancelled: () => true }), null);
  let attempts = 0;
  const result = await generateSolvable('hard', 0, {
    random: seeded(1), onProgress: () => attempts++,
    yieldControl: async () => {}, cancelled: () => attempts > 0,
  });
  assert.equal(result, null);
  assert.equal(attempts, 1);
});
