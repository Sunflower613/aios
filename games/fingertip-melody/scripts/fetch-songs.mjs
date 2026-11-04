// Listen1 reference: js/provider/netease.js (metadata / lyrics / playback separated).
// Use the public media redirect; unavailable songs fail instead of bypassing access rules.
import { mkdir, writeFile, rename, rm, readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = fileURLToPath(new URL('../media/', import.meta.url));
const seeds = [
  { id: 1436709403, mood: 'sunshine', label: '晴朗汽水', description: '把夏天的微风，轻轻弹在指尖。', shape: 'sun' },
  { id: 1472877518, mood: 'rain', label: '蓝色心事', description: '有些告别，适合慢慢唱。', shape: 'rain' },
  { id: 28707594, mood: 'dream', label: '星光漫游', description: '跟着那束光，走进温柔的夜。', shape: 'star' },
  { id: 3436855494, mood: 'dream', label: '自由生长', description: '跟着旋律，走向自由的自己。', shape: 'star' },
  { id: 2077620214, mood: 'rain', label: '生活的涟漪', shape: 'rain' },
  { id: 1957866769, mood: 'dream', label: '光年漫游', shape: 'star' },
  { id: 2655771946, mood: 'rain', label: '时间回声', shape: 'rain' },
];
async function request(url) {
  const response = await fetch(url, { signal: AbortSignal.timeout(45000) });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return response;
}
await mkdir(root, { recursive: true });
let existing = [];
try { existing = JSON.parse(await readFile(path.join(root, 'library.json'), 'utf8')); } catch (error) { if (error.code !== 'ENOENT') throw error; }
const songs = existing.filter(song => !seeds.some(seed => seed.id === song.id));
for (const seed of seeds) {
  const id = seed.id;
  const cached = existing.find(song => song.id === id);
  if (cached && cached.available !== false && !process.argv.includes('--refresh')) { songs.push(cached); continue; }
  const detail = await (await request(`https://music.163.com/api/song/detail/?id=${id}&ids=[${id}]`)).json();
  const track = detail.songs?.[0];
  if (!track) throw new Error(`Missing track ${id}`);
  const lyric = await (await request(`https://music.163.com/api/song/lyric/v1?id=${id}&lv=-1&kv=-1&tv=-1&rv=-1&yv=-1&ytv=-1&yrv=-1`)).json();
  if (!lyric.lrc?.lyric?.match(/\[\d+:\d+/)) throw new Error(`Missing timed lyrics: ${id}`);
  const response = await request(`https://music.163.com/song/media/outer/url?id=${id}.mp3`);
  const available = response.headers.get('content-type')?.startsWith('audio/') || false;
  const audio = available ? Buffer.from(await response.arrayBuffer()) : Buffer.alloc(0);
  if (!available) await response.body?.cancel();
  if (available && audio.length < 10000) throw new Error(`Invalid audio: ${id}`);
  if (available) await writeFile(path.join(root, `${id}.mp3`), audio);
  await writeFile(path.join(root, `${id}.lrc`), lyric.lrc.lyric, 'utf8');
  if (lyric.yrc?.lyric) await writeFile(path.join(root, `${id}.yrc`), lyric.yrc.lyric, 'utf8');
  else await rm(path.join(root, `${id}.yrc`), { force: true });
  songs.push({ ...seed, title: track.name, cover: (track.album?.picUrl || '').replace(/^http:/, 'https:'), artist: track.artists.map(a => a.name).join(' / '), duration: track.duration / 1000,
    audio: `./media/${id}.mp3`, lyrics: `./media/${id}.lrc`, available, source: 'netease', sourceId: String(id),
    sourceUrl: `https://music.163.com/#/song?id=${id}`, timing: 'unprocessed', fetchedAt: new Date().toISOString() });
  console.log(`${available ? 'Saved' : 'Audio unavailable; lyrics cached'} ${track.name} · ${songs.at(-1).artist} (${(audio.length / 1048576).toFixed(1)} MB)`);
}
// Keep user-downloaded tracks when refreshing the bundled selection.
await writeFile(path.join(root, 'library.tmp.json'), JSON.stringify(songs, null, 2));
await rename(path.join(root, 'library.tmp.json'), path.join(root, 'library.json'));
console.log('Local library ready.');
