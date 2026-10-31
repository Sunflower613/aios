import { parseLrc, makeChart } from './engine.mjs';
import { catalogApi, catalogBlob } from './service.mjs';
const urls = new Map();
function db() { return new Promise((resolve, reject) => { const r = indexedDB.open('melody-device-library', 2); r.onupgradeneeded = () => { for (const name of ['songs', 'hidden', 'folders', 'placements']) if (!r.result.objectStoreNames.contains(name)) r.result.createObjectStore(name, name === 'songs' ? { keyPath: 'key' } : undefined); }; r.onsuccess = () => resolve(r.result); r.onerror = () => reject(r.error); }); }
async function transaction(store, mode, action) { const d = await db(); return new Promise((resolve, reject) => { const t = d.transaction(store, mode), r = action(t.objectStore(store)); t.oncomplete = () => { d.close(); resolve(r.result); }; t.onerror = t.onabort = () => { d.close(); reject(t.error || new Error('浏览器存储失败')); }; }); }
export const songKey = song => `${song.source}:${song.sourceId || song.id}`;
function revoke(key) { (urls.get(key) || []).forEach(URL.revokeObjectURL); urls.delete(key); }
export async function deviceSongs() {
  const records = await transaction('songs', 'readonly', s => s.getAll());
  return records.map(record => { revoke(record.key); const audio = URL.createObjectURL(record.audio), chart = record.chart ? URL.createObjectURL(new Blob([JSON.stringify(record.chart)], { type: 'application/json' })) : ''; urls.set(record.key, [audio, chart].filter(Boolean)); return { ...record.song, device: true, audio, chart, playable: !!chart }; });
}
export async function hiddenSongs() { return new Set(await transaction('hidden', 'readonly', s => s.getAllKeys())); }
export async function listFolders() { return transaction('folders', 'readonly', s => s.getAllKeys()); }
export async function createFolder(name) { name = String(name).trim().slice(0, 40); if (!name || /[\\/<>]/.test(name)) throw new Error('请输入有效文件夹名称'); await transaction('folders', 'readwrite', s => s.put(true, name)); return name; }
export async function songPlacements() { return new Map(await transaction('placements', 'readonly', s => s.getAll()).then(items => items.map(item => [item.key, item.folder]))); }
export async function moveSongs(songs, folder) { await Promise.all(songs.map(song => transaction('placements', 'readwrite', s => s.put({ key: songKey(song), folder }, songKey(song))))); }
export async function removeSong(song) { const key = songKey(song); await transaction('placements', 'readwrite', s => s.delete(key)); await transaction('hidden', 'readwrite', s => s.put(true, key)); await transaction('songs', 'readwrite', s => s.delete(key)); revoke(key); }
export async function saveSong(song, audio, chart, lyric = '') {
  const key = songKey(song); await transaction('songs', 'readwrite', s => s.put({ key, song, audio, chart, lyric })); await transaction('hidden', 'readwrite', s => s.delete(key));
}
export function yrcChart(text, duration, hash) {
  const lines = [], words = [];
  for (const raw of text.split(/\r?\n/)) {
    const head = raw.match(/^\[(\d+),(\d+)\]/); if (!head) continue;
    const tokens = [...raw.matchAll(/\((\d+),(\d+),\d+\)([^()]+)/g)];
    const content = tokens.map(t => t[3]).join(''), time = Number(head[1]) / 1000;
    const line = lines.length, playable = parseLrc(`[${Math.floor(time / 60)}:${time % 60}]${content}`)[0]?.playable ?? false;
    lines.push({ text: content, time, playable }); if (!playable) continue;
    for (const token of tokens) {
      const chars = token[3].match(/\p{Script=Han}/gu) || []; if (!chars.length) continue;
      if (chars.length !== 1) throw new Error('该 YRC 不是逐字时间轴，不能均分汉字时间');
      words.push({ char: chars[0], start: Number(token[1]) / 1000, end: (Number(token[1]) + Number(token[2])) / 1000, line });
    }
  }
  words.sort((a, b) => a.start - b.start);
  const chart = { version: 2, method: 'provider-character-timestamps', audioSha256: hash, duration, lines, words, beats: [], bpm: 0, beatMethod: 'none', review: { required: false } };
  makeChart(chart, duration); return chart;
}
async function inspectAudio(audio) {
  const url = URL.createObjectURL(audio), element = new Audio(); element.preload = 'metadata';
  try { return await new Promise((resolve, reject) => { const timer = setTimeout(() => reject(new Error('音频读取超时')), 15000); element.onloadedmetadata = () => { clearTimeout(timer); Number.isFinite(element.duration) && element.duration > 0 ? resolve(element.duration) : reject(new Error('音频时长无效')); }; element.onerror = () => { clearTimeout(timer); reject(new Error('浏览器不支持此音频，请转换成 MP3 或 WAV')); }; element.src = url; }); }
  finally { element.removeAttribute('src'); element.load(); URL.revokeObjectURL(url); }
}
export async function importSong(audio, lyric, metadata = {}, progress = () => {}, convertedOnce = false) {
  if (!audio?.size || audio.size > 80 * 1024 * 1024) throw new Error('请选择 80MB 以内的音频');
  if (lyric?.size > 2 * 1024 * 1024) throw new Error('歌词不能超过 2MB');
  progress('正在保存到此设备…');
  const bytes = await audio.arrayBuffer(), hash = [...new Uint8Array(await crypto.subtle.digest('SHA-256', bytes))].map(v => v.toString(16).padStart(2, '0')).join('');
  const text = lyric?.size ? await lyric.text() : ''; let chart, duration;
  try { duration = await inspectAudio(audio); } catch {
    if (convertedOnce) throw new Error('转换后的音频仍无法播放，请使用 MP3 或 WAV');
    progress('浏览器不支持此格式，正在临时转换…');
    const form = new FormData(); form.set('audio', audio, audio.name || 'song.audio');
    const converted = await catalogApi('prepare', { method: 'POST', body: form, signal: AbortSignal.timeout(130000) });
    const file = new File([Uint8Array.from(atob(converted.audio), c => c.charCodeAt(0))], audio.name || 'song.mp3', { type: 'audio/mpeg' });
    return importSong(file, lyric, { ...metadata, id: metadata.id || `device-${hash.slice(0, 24)}` }, progress, true);
  }
  if (metadata.duration && duration && duration < metadata.duration - Math.max(5, metadata.duration * .03)) throw new Error('音源仅提供试听片段，不能导入为完整歌曲');
  if (text && /\[\d+,\d+\]/.test(text)) chart = yrcChart(text, duration, hash);
  const id = metadata.id || `device-${hash.slice(0, 24)}`;
  const song = { id, sourceId: String(id), source: 'upload', artist: '我的导入', title: audio.name?.replace(/\.[^.]+$/, '') || '我的歌曲', mood: 'dream', label: '此设备', ...metadata, duration: duration || 0, available: true };
  // Save the original first; a failed remote alignment must not lose the local import.
  await saveSong(song, audio, chart, text);
  if (text && !chart) {
    progress('音频已保存在此设备，正在临时制谱…');
    const form = new FormData(); form.set('audio', audio, audio.name || 'song.mp3'); form.set('lyrics', lyric, 'song.lrc');
    const result = await catalogApi('prepare', { method: 'POST', body: form, signal: AbortSignal.timeout(31 * 60 * 1000) });
    chart = result.chart; audio = new Blob([Uint8Array.from(atob(result.audio), c => c.charCodeAt(0))], { type: 'audio/mpeg' }); song.duration = chart.duration;
    await saveSong(song, audio, chart, text);
  }
  progress(chart ? '已保存到此设备，可以演奏' : '音频已保存；再次导入同一文件并附歌词即可制谱');
  return song;
}
export async function downloadSong(song, progress) {
  progress('正在获取音频与歌词…');
  const data = await catalogApi(`resource?id=${encodeURIComponent(song.sourceId)}`);
  const audio = await catalogBlob(`audio?id=${encodeURIComponent(song.sourceId)}`);
  const text = data.yrc || data.lrc || '';
  return importSong(audio, new File([text], data.yrc ? 'song.yrc' : 'song.lrc'), { ...song, ...data.song }, progress);
}
