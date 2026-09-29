import test from 'node:test';
import assert from 'node:assert/strict';
import { mineProbabilities, probabilityLabel } from './probability.mjs';

const hidden = () => ({ open: false, flag: false, marked: false, number: null });
function fixture(groups, counts, unknowns) {
  const cells = [...counts.map(number => ({ open: true, flag: false, number })), ...Array.from({ length: unknowns }, hidden)];
  return { cells, neighbors: i => (groups[i] || []).map(n => n + counts.length) };
}

test('death 50/50 and unconstrained cells use the global mine count', () => {
  const { cells, neighbors } = fixture([[0, 1]], [1], 4);
  assert.deepEqual(mineProbabilities(cells, neighbors, 2).probabilities, [null, .5, .5, .5, .5]);
  assert.deepEqual(mineProbabilities(cells, neighbors, 1).probabilities, [null, .5, .5, 0, 0]);
});

test('weights frontier layouts by the number of compatible outside layouts', () => {
  // a+b=1, b+c=1: b=1 leaves one mine in three outside cells;
  // b=0 leaves none, so the two frontier assignments have weights 3:1.
  const { cells, neighbors } = fixture([[0, 1], [1, 2]], [1, 1], 6);
  assert.deepEqual(mineProbabilities(cells, neighbors, 2).probabilities.slice(2), [.25, .75, .25, .25, .25, .25]);
});

test('component convolution matches independent exhaustive enumeration', () => {
  const { cells, neighbors } = fixture([[0, 1], [1, 2], [3, 4], [4, 5]], [1, 1, 1, 1], 8);
  for (const mines of [2, 3, 4, 5]) {
    let total = 0;
    const hits = Array(8).fill(0);
    for (let mask = 0; mask < 256; mask++) {
      const bits = hits.map((_, i) => (mask >> i) & 1);
      if (bits.reduce((a, b) => a + b) !== mines) continue;
      if (![0, 1, 2, 3].every(i => neighbors(i).reduce((sum, n) => sum + bits[n - 4], 0) === 1)) continue;
      total++;
      bits.forEach((b, i) => { hits[i] += b; });
    }
    const answer = mineProbabilities(cells, neighbors, mines);
    assert.equal(answer.status, 'exact');
    hits.forEach((n, i) => assert.ok(Math.abs(answer.probabilities[i + 4] - n / total) < .000002));
  }
});

test('manual flags do not count as mines, proven flags do', () => {
  const { cells, neighbors } = fixture([[0, 1]], [1], 2);
  cells[1].marked = true;
  assert.equal(mineProbabilities(cells, neighbors, 1).probabilities[1], .5);
  cells[1].flag = true;
  assert.deepEqual(mineProbabilities(cells, neighbors, 1).probabilities, [null, 1, 0]);
});

test('budget exhaustion and conflicting clues never produce guessed probabilities', () => {
  const { cells, neighbors } = fixture([[0, 1]], [1], 2);
  assert.deepEqual(mineProbabilities(cells, neighbors, 1, 0), { status: 'limited', probabilities: [null, null, null] });
  assert.equal(mineProbabilities(cells, neighbors, 0).status, 'inconsistent');
});

test('large combinatorial counts remain finite and rounding never implies certainty', () => {
  const answer = mineProbabilities(Array.from({ length: 480 }, hidden), () => [], 99);
  assert.ok(Math.abs(answer.probabilities[0] - 99 / 480) < .000002);
  assert.equal(probabilityLabel(.000001), '<0.1%');
  assert.equal(probabilityLabel(.999999), '>99.9%');
  assert.equal(probabilityLabel(0), '0%');
  assert.equal(probabilityLabel(1), '100%');
});
