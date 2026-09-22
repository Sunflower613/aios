import test from 'node:test';
import assert from 'node:assert/strict';
import { MOVES, PERMUTATIONS, solved, apply, key, inverse, reverse, isSolved, shortestPath } from './model.mjs';
import { VERTICES, CYCLES, ORBITS, position, screen } from './graph.mjs';
const execute = moves => moves.reduce(apply, solved());
test('ring graph has 48 facelets and five four-cycles per face turn', () => {
  assert.equal(VERTICES.length, 48);
  for (const [face, cycles] of Object.entries(CYCLES)) {
    assert.equal(cycles.length, 5);
    assert.equal(new Set(cycles.flat()).size, 20);
    for (const cycle of cycles) {
      assert.equal(cycle.length, 4);
      cycle.forEach((index, i) => assert.equal(PERMUTATIONS[face][index], cycle[(i + 1) % 4]));
    }
  }
});
test('graph animation ends exactly at the cube permutation for all 12 moves', () => {
  for (const move of MOVES) for (const { index } of VERTICES) {
    const actual = position(index, move, 1), expected = position(PERMUTATIONS[move][index]);
    assert.ok(Math.hypot(actual[0] - expected[0], actual[1] - expected[1]) < 1e-10);
  }
  for (const orbit of ORBITS) for (const point of orbit.samples) {
    const [x, y] = screen(point);
    assert.ok(Number.isFinite(x) && Number.isFinite(y) && x >= 40 && x <= 500 && y >= 30 && y <= 490);
  }
});
test('every face turn is a bijection, preserves centers, and has order four', () => {
  for (const move of MOVES) {
    assert.equal(new Set(PERMUTATIONS[move]).size, 54);
    for (let i = 4; i < 54; i += 9) assert.equal(PERMUTATIONS[move][i], i);
    assert.ok(isSolved(execute([move, move, move, move])));
    assert.ok(isSolved(execute([move, inverse(move)])));
    assert.ok(!isSolved(execute([move])));
  }
});
test('standard noncommuting sexy move returns to identity after six repetitions', () => {
  assert.ok(!isSolved(execute(['R', 'U', "R'", "U'"])));
  assert.ok(isSolved(execute(Array(6).fill(['R', 'U', "R'", "U'"]).flat())));
});
test('scramble and reverse restore all stickers, preserving nine of each color', () => {
  let seed = 13579;
  for (let trial = 0; trial < 20; trial++) {
    const moves = Array.from({ length: 40 }, () => { seed = (seed * 1664525 + 1013904223) >>> 0; return MOVES[seed % 12]; });
    const state = execute(moves);
    for (let c = 0; c < 6; c++) assert.equal(state.filter(x => x === c).length, 9);
    assert.ok(isSolved(reverse(moves).reduce(apply, state)));
  }
});
test('BFS returns shortest solutions and correctly fails beyond its search radius', () => {
  for (const moves of [[], ['R'], ['R', 'R'], ['U', 'R', 'F'], ['R', 'U', 'F', 'L', 'D', 'B']]) {
    const state = execute(moves), result = shortestPath(state);
    assert.ok(result.moves);
    assert.ok(result.moves.length <= moves.length);
    assert.ok(isSolved(result.moves.reduce(apply, state)));
    if (result.moves.length) assert.equal(shortestPath(state, result.moves.length - 1).moves, null);
  }
  assert.equal(shortestPath(execute(['R', 'U', 'F']), 2).moves, null);
});
test('all states within two moves have solutions at their true BFS distance', () => {
  let frontier = [solved()]; const seen = new Set([key(solved())]);
  for (let depth = 1; depth <= 2; depth++) {
    const next = [];
    for (const state of frontier) for (const move of MOVES) {
      const child = apply(state, move), id = key(child); if (seen.has(id)) continue;
      seen.add(id); next.push(child);
      assert.equal(shortestPath(child).moves.length, depth);
    }
    frontier = next;
  }
});
