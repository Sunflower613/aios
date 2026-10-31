export function resourceGroup(song) {
  if (song.local) return 'local';
  if (song.access === 'public') return song.hasYrc ? 'yrc' : 'audio';
  if (song.access === 'member' || song.access === 'purchase') return 'member';
  return 'unavailable';
}
export function mergeResults(local, remote, query) {
  const needle = query.trim().toLocaleLowerCase();
  const matches = local.filter(s => s.available !== false && `${s.title} ${s.artist}`.toLocaleLowerCase().includes(needle)).map(s => ({ ...s, local: true }));
  const keys = new Set(matches.map(s => `${s.source}:${s.sourceId}`));
  const result = [...matches, ...remote.filter(s => !keys.has(`${s.source}:${s.sourceId}`))];
  const ranks = { local: 0, yrc: 1, audio: 2, member: 3, unavailable: 4 };
  return result.sort((a, b) => ranks[resourceGroup(a)] - ranks[resourceGroup(b)]);
}
