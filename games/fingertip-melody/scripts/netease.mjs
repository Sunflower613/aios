// Public NetEase metadata/lyrics/media, following Listen1's separated provider responsibilities.
const cache = new Map();
export function validId(value) {
  if (!/^\d{1,15}$/.test(String(value))) throw new Error('无效的歌曲编号');
  return String(value);
}
export async function remote(url) {
  const r = await fetch(url, { signal: AbortSignal.timeout(20000) });
  if (!r.ok) { await r.body?.cancel(); throw new Error('音源服务暂时不可用'); }
  return r;
}
export function normalizeTrack(t) {
  return { id: Number(t.id), sourceId: String(t.id), source: 'netease', title: t.name,
    artist: (t.artists || t.ar || []).map(a => a.name).join(' / '), duration: (t.duration || t.dt || 0) / 1000,
    cover: (t.album?.picUrl || t.al?.picUrl || '').replace(/^http:/, 'https:'), fee: t.fee ?? null, sourceUrl: `https://music.163.com/#/song?id=${t.id}` };
}
export async function details(id) {
  id = validId(id);
  const data = await (await remote(`https://music.163.com/api/song/detail/?id=${id}&ids=[${id}]`)).json();
  if (!data.songs?.[0]) throw new Error('找不到这首歌');
  return normalizeTrack(data.songs[0]);
}
export async function lyrics(id) {
  id = validId(id);
  return (await remote(`https://music.163.com/api/song/lyric/v1?id=${id}&lv=-1&kv=-1&tv=-1&rv=-1&yv=-1&ytv=-1&yrv=-1`)).json();
}
export function accessFor(audioAvailable, fee) {
  if (audioAvailable) return 'public';
  if (fee === 1) return 'member';
  if (fee === 4) return 'purchase';
  return 'unavailable'; // Unavailability alone is not evidence of membership restrictions.
}
export async function inspect(track) {
  const old = cache.get(track.sourceId);
  if (old && old.until > Date.now()) return { ...track, ...await old.promise };
  const promise = (async () => {
    const [lyricResult, audioResult] = await Promise.allSettled([
      lyrics(track.sourceId), remote(`https://music.163.com/song/media/outer/url?id=${validId(track.sourceId)}.mp3`),
    ]);
    const data = lyricResult.status === 'fulfilled' ? lyricResult.value : null;
    const audio = audioResult.status === 'fulfilled' ? audioResult.value : null;
    const publicAudio = Boolean(audio?.headers.get('content-type')?.startsWith('audio/'));
    await audio?.body?.cancel();
    return { access: audioResult.status === 'rejected' ? 'unknown' : accessFor(publicAudio, track.fee),
      hasYrc: Boolean(data?.yrc?.lyric?.match(/\(\d+,\d+,\d+\)/)), hasLyrics: Boolean(data?.lrc?.lyric?.match(/\[\d+:\d+/)),
      lyricsChecked: Boolean(data), availabilityCheckedAt: new Date().toISOString() };
  })();
  cache.set(track.sourceId, { promise, until: Date.now() + 180000 });
  if (cache.size > 500) cache.delete(cache.keys().next().value);
  return { ...track, ...await promise };
}
export async function search(query, limit = 30) {
  if (!query.trim()) return [];
  const { default: cloud } = await import('NeteaseCloudMusicApi');
  const { body: data } = await cloud.cloudsearch({ keywords: query.slice(0, 80), type: 1, limit });
  if (data.code !== 200) throw new Error('网络搜索暂时不可用');
  const tracks = (data.result?.songs || []).map(normalizeTrack), results = new Array(tracks.length);
  let next = 0;
  await Promise.all(Array.from({ length: Math.min(4, tracks.length) }, async () => {
    while (next < tracks.length) { const index = next++; results[index] = await inspect(tracks[index]); }
  }));
  return results;
}
