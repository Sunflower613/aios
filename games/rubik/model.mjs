// Facelets occupy fixed integer coordinates. Moves permute slots, never colors.
export const FACES = {
  U: { axis: 1, side: 1, name: '上', color: '#f4efdf' },
  R: { axis: 0, side: 1, name: '右', color: '#e87358' },
  F: { axis: 2, side: 1, name: '前', color: '#4a9c86' },
  D: { axis: 1, side: -1, name: '下', color: '#f2c653' },
  L: { axis: 0, side: -1, name: '左', color: '#ed9b52' },
  B: { axis: 2, side: -1, name: '后', color: '#639ccc' },
};
export const NAMES = Object.keys(FACES);
export const MOVES = NAMES.flatMap(face => [face, face + "'"]);
export function rotate(v, axis, angle) {
  const out = [...v], a = (axis + 1) % 3, b = (axis + 2) % 3;
  out[a] = v[a] * Math.cos(angle) - v[b] * Math.sin(angle);
  out[b] = v[a] * Math.sin(angle) + v[b] * Math.cos(angle);
  return out;
}
export const SLOTS = NAMES.flatMap(face => {
  const { axis, side } = FACES[face], slots = [];
  for (let a = -1; a <= 1; a++) for (let b = -1; b <= 1; b++) {
    const p = [0, 0, 0], n = [0, 0, 0];
    p[axis] = side; p[(axis + 1) % 3] = a; p[(axis + 2) % 3] = b; n[axis] = side;
    slots.push({ p, n, face });
  }
  return slots;
});
const slotKey = (p, n) => [...p, ...n].map(Math.round).join(',');
const indices = new Map(SLOTS.map((s, i) => [slotKey(s.p, s.n), i]));
export const PERMUTATIONS = Object.fromEntries(MOVES.map(move => {
  const { axis, side } = FACES[move[0]], angle = -side * (move.endsWith("'") ? -1 : 1) * Math.PI / 2;
  return [move, SLOTS.map(({ p, n }, i) => p[axis] === side
    ? indices.get(slotKey(rotate(p, axis, angle), rotate(n, axis, angle))) : i)];
}));
export const solved = () => Uint8Array.from(SLOTS, (_, i) => Math.floor(i / 9));
export function apply(state, move) {
  const permutation = PERMUTATIONS[move];
  if (!permutation) throw new Error('Unknown move: ' + move);
  const next = new Uint8Array(54);
  permutation.forEach((destination, source) => { next[destination] = state[source]; });
  return next;
}
export const key = state => Array.from(state).join('');
export const isSolved = state => state.every((c, i) => c === Math.floor(i / 9));
export const inverse = move => move.endsWith("'") ? move[0] : move + "'";
export const reverse = moves => [...moves].reverse().map(inverse);
export function simplify(moves) {
  const out = [];
  for (const move of moves) {
    if (out.length && out.at(-1) === inverse(move)) out.pop();
    else out.push(move);
  }
  return out;
}
// Bidirectional BFS: three layers from each endpoint. Quarter turns count as edges.
// An intersection gives a shortest solution of at most six quarter turns.
export function shortestPath(start, maxDepth = 6) {
  if (isSolved(start)) return { moves: [], visited: 1 };
  const maps = [new Map([[key(start), []]]), new Map([[key(solved()), []]])];
  let fronts = [[start], [solved()]];
  for (let depth = 0; depth < maxDepth; depth++) {
    const side = depth % 2, nextFront = [];
    for (const state of fronts[side]) {
      const path = maps[side].get(key(state));
      for (const move of MOVES) {
        if (path.length && move === inverse(path.at(-1))) continue;
        const next = apply(state, move), id = key(next);
        if (maps[side].has(id)) continue;
        const newPath = [...path, move];
        maps[side].set(id, newPath);
        if (maps[1 - side].has(id)) {
          const other = maps[1 - side].get(id);
          return { moves: side === 0 ? [...newPath, ...reverse(other)] : [...other, ...reverse(newPath)], visited: maps[0].size + maps[1].size };
        }
        nextFront.push(next);
      }
    }
    fronts[side] = nextFront;
  }
  return { moves: null, visited: maps[0].size + maps[1].size };
}
