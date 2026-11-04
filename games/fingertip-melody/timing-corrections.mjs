import corrections from './timing-corrections.json' with { type: 'json' };

// Only the verified recording and exact broken sequence qualify. Keep user edits.
export function repairKnownTiming(chart) {
  let changed = false;
  for (const fix of corrections) {
    if (chart.audioSha256 !== fix.audioSha256) continue;
    const first = chart.words.findIndex(word => [fix.original[0], fix.corrected[0]].includes(Math.round(word.start * 1000)));
    if (first < 0) continue;
    const words = chart.words.slice(first, first + [...fix.text].length);
    const matches = times => words.every((word, i) => word.line === words[0].line &&
      Math.round(word.start * 1000) === times[i] && Math.round(word.end * 1000) === times[i + 1]);
    if (words.map(word => word.char).join('') !== fix.text || !(matches(fix.original) || matches(fix.corrected))) continue;
    if (words.every(word => word.timingCorrection === fix.method) && chart.review?.required) continue;
    words.forEach((word, i) => {
      word.start = fix.corrected[i] / 1000;
      word.end = fix.corrected[i + 1] / 1000;
      word.timingCorrection = fix.method;
    });
    chart.lines[words[0].line].time = fix.corrected[0] / 1000;
    chart.review = { ...chart.review, required: true, correctedTimingIndices: words.map((_, i) => first + i) };
    changed = true;
  }
  return changed;
}
