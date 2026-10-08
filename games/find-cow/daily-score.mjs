const memory = new Map();
const key = day => `find-cow-daily-result:${day}`;
function valid(result) {
  return result && Number.isInteger(result.stars) && result.stars >= 0 && result.stars <= 3 && Number.isFinite(result.elapsed) && result.elapsed >= 0;
}
export function readDailyResult(day, storage) {
  try {
    const result = JSON.parse((storage ?? globalThis.localStorage)?.getItem(key(day)) ?? 'null');
    if (valid(result)) { memory.set(day, result); return result; }
  } catch { /* Storage may be blocked or contain invalid data. */ }
  return memory.get(day) ?? null;
}
export function saveDailyResult(day, result, storage) {
  if (!valid(result)) throw new TypeError('Invalid daily result');
  const previous = readDailyResult(day, storage);
  const best = previous && (previous.stars > result.stars || (previous.stars === result.stars && previous.elapsed <= result.elapsed)) ? previous : result;
  memory.set(day, best);
  try { (storage ?? globalThis.localStorage)?.setItem(key(day), JSON.stringify(best)); } catch { /* Keep this visit's result. */ }
  return best;
}
