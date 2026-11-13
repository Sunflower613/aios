export function libraryBest(storage, song) {
  const grades = ['—','F','C','B','A','S','V','φ'];
  let score = 0, grade = '—';
  for (const suffix of ['', ':partial']) {
    const value = Number(storage.getItem(`melody:${song.id}:score:full:v3${suffix}`)) || 0;
    const rating = storage.getItem(`melody:${song.id}:score:rating:v1${suffix}`) || '—';
    if (value > score || value === score && grades.indexOf(rating) > grades.indexOf(grade)) { score=value; grade=grades.includes(rating)?rating:'—'; }
  }
  return {score,grade};
}
export function songDifficulty(count, duration) {
  if (!Number.isFinite(count) || count <= 0) return null;
  // Character count dominates; dense songs get a modest increase.
  const density = count / Math.max(60, Number(duration) || 240) * 60;
  const value = count * .8 + density * .8;
  return value < 300 ? 'EZ' : value < 500 ? 'HD' : value < 750 ? 'IN' : 'AT';
}
export function chartCharacterCount(chart) {
  return (chart.words || []).filter(word => chart.lines?.[word.line]?.playable !== false)
    .reduce((sum,word)=>sum+(word.char.match(/[\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}ー]/gu)?.length || 0),0);
}
