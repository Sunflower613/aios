// Count equally likely layouts consistent with visible clues and the total mine
// count. Only proven flags are evidence; manual marks remain unknown variables.
export function mineProbabilities(cells, neighbors, totalMines, maxNodes = 150000) {
  const probabilities = cells.map(c => c.open ? null : c.flag ? 1 : null);
  const unknown = cells.flatMap((c, i) => !c.open && !c.flag ? [i] : []);
  const remaining = totalMines - cells.filter(c => c.flag).length;
  const rules = cells.flatMap((c, i) => !c.open ? [] : [{
    vars: neighbors(i).filter(n => !cells[n].open && !cells[n].flag),
    count: c.number - neighbors(i).filter(n => cells[n].flag).length,
  }]);
  const result = status => ({ probabilities, status });
  if (remaining < 0 || remaining > unknown.length || rules.some(r => r.count < 0 || r.count > r.vars.length)) return result('inconsistent');
  const membership = new Map();
  rules.forEach((r, ri) => r.vars.forEach(i => {
    if (!membership.has(i)) membership.set(i, []);
    membership.get(i).push(ri);
  }));
  const outside = unknown.filter(i => !membership.has(i));
  const unseen = new Set(membership.keys()), components = [];
  let nodes = 0;
  while (unseen.size) {
    const queue = [unseen.values().next().value], vars = [], ruleIds = new Set();
    while (queue.length) {
      const i = queue.pop();
      if (!unseen.delete(i)) continue;
      vars.push(i);
      for (const ri of membership.get(i)) if (!ruleIds.has(ri)) {
        ruleIds.add(ri);
        queue.push(...rules[ri].vars);
      }
    }
    vars.sort((a, b) => membership.get(b).length - membership.get(a).length);
    const local = [...ruleIds].map(ri => ({ ...rules[ri], left: rules[ri].vars.length, sum: 0 }));
    const affected = vars.map(i => local.filter(r => r.vars.includes(i)));
    const ways = new Map(), hits = vars.map(() => new Map()), assignment = [];
    let exhausted = false;
    function visit(depth, mines) {
      if (++nodes > maxNodes) { exhausted = true; return; }
      if (mines > remaining) return;
      if (depth === vars.length) {
        ways.set(mines, (ways.get(mines) || 0n) + 1n);
        assignment.forEach((value, j) => { if (value) hits[j].set(mines, (hits[j].get(mines) || 0n) + 1n); });
        return;
      }
      for (const value of [0, 1]) {
        for (const r of affected[depth]) { r.left--; r.sum += value; }
        assignment[depth] = value;
        if (affected[depth].every(r => r.sum <= r.count && r.sum + r.left >= r.count)) visit(depth + 1, mines + value);
        for (const r of affected[depth]) { r.left++; r.sum -= value; }
        if (exhausted) return;
      }
    }
    visit(0, 0);
    // Never present a truncated enumeration as a probability.
    if (exhausted) return result('limited');
    if (!ways.size) return result('inconsistent');
    components.push({ vars, ways, hits });
  }
  function convolve(a, b) {
    const output = new Map();
    for (const [i, x] of a) for (const [j, y] of b) if (i + j <= remaining) output.set(i + j, (output.get(i + j) || 0n) + x * y);
    return output;
  }
  const combinations = new Map();
  function choose(n, k) {
    if (k < 0 || k > n) return 0n;
    k = Math.min(k, n - k);
    const key = `${n},${k}`;
    if (combinations.has(key)) return combinations.get(key);
    let value = 1n;
    for (let i = 1; i <= k; i++) value = value * BigInt(n - i + 1) / BigInt(i);
    combinations.set(key, value);
    return value;
  }
  const unit = new Map([[0, 1n]]), prefix = [unit], suffix = [];
  for (const c of components) prefix.push(convolve(prefix.at(-1), c.ways));
  suffix[components.length] = unit;
  for (let i = components.length - 1; i >= 0; i--) suffix[i] = convolve(components[i].ways, suffix[i + 1]);
  const completions = (distribution, used, n = outside.length) => [...distribution].reduce((sum, [k, count]) => sum + count * choose(n, remaining - used - k), 0n);
  const total = completions(prefix.at(-1), 0);
  if (!total) return result('inconsistent');
  const ratio = value => value === 0n ? 0 : value === total ? 1 : Math.max(0.000001, Math.min(0.999999, Number(value * 1000000n / total) / 1000000));
  components.forEach((c, i) => {
    const others = convolve(prefix[i], suffix[i + 1]);
    c.vars.forEach((index, j) => {
      const numerator = [...c.hits[j]].reduce((sum, [k, count]) => sum + count * completions(others, k), 0n);
      probabilities[index] = ratio(numerator);
    });
  });
  if (outside.length) {
    const probability = ratio(completions(prefix.at(-1), 1, outside.length - 1));
    outside.forEach(i => { probabilities[i] = probability; });
  }
  return result('exact');
}

export function probabilityLabel(value) {
  if (value === null) return '?';
  if (value === 0 || value === 1) return `${value * 100}%`;
  if (value < 0.001) return '<0.1%';
  if (value > 0.999) return '>99.9%';
  return `${(value * 100).toFixed(1).replace(/\.0$/, '')}%`;
}
