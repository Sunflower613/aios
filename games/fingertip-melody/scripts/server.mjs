import http from 'node:http';
import path from 'node:path';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';
import { readFile, writeFile, mkdir, mkdtemp, rename, stat, realpath, rm } from 'node:fs/promises';
import { randomUUID, randomBytes, createHash } from 'node:crypto';
import { createReadStream } from 'node:fs';
import { spawn, execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { details, lyrics, search, validId, remote } from './netease.mjs';

const gameRoot = fileURLToPath(new URL('../', import.meta.url));
const workspace = path.resolve(gameRoot, '../..'), media = path.resolve(process.env.MELODY_MEDIA_DIR || path.join(gameRoot, 'media'));
const publicOrigins = (process.env.MELODY_ORIGINS || '').split(',').map(s => s.trim()).filter(Boolean).map(s => new URL(s).origin);
const jobs = new Map();
let active = false;
let persistence = Promise.resolve();
function persistJobs() {
  persistence = persistence.catch(() => {}).then(async () => {
    await mkdir(media, { recursive: true });
    const file = path.join(media, 'jobs-state.json');
    await writeFile(file + '.tmp', JSON.stringify([...jobs.values()])); await rename(file + '.tmp', file);
  });
  return persistence;
}
async function restoreJobs() {
  try {
    for (const job of JSON.parse(await readFile(path.join(media, 'jobs-state.json'), 'utf8')).slice(-100)) {
      if (['queued', 'downloading', 'aligning'].includes(job.stage)) { job.stage = 'error'; job.message = '服务重启中断了任务，请重新提交'; }
      jobs.set(job.id, job);
    }
  } catch (error) { if (error.code !== 'ENOENT') throw error; }
}
function registerJob(job) {
  jobs.set(job.id, job);
  if (jobs.size > 100) { const old = [...jobs.values()].find(j => ['ready', 'error', 'downloaded'].includes(j.stage)); if (old) jobs.delete(old.id); }
}
const pythonPath = () => process.env.MELODY_PYTHON || path.join(gameRoot, '.venv', process.platform === 'win32' ? 'Scripts/python.exe' : 'bin/python');
const coverCache = new Map();
async function withCovers(songs) {
  return Promise.all(songs.map(async song => {
    if (song.cover || song.source !== 'netease') return song;
    if (!coverCache.has(song.sourceId)) coverCache.set(song.sourceId, details(song.sourceId).then(track => track.cover).catch(() => ''));
    return { ...song, cover: await coverCache.get(song.sourceId) };
  }));
}
export async function readLibrary() {
  try { return JSON.parse(await readFile(path.join(media, 'library.json'), 'utf8')); }
  catch (e) { if (e.code === 'ENOENT') return []; throw e; }
}
async function publish(song) {
  const library = await readLibrary(), index = library.findIndex(s => s.source === song.source && s.sourceId === song.sourceId);
  if (index < 0) library.push(song); else library[index] = song;
  await writeFile(path.join(media, 'library.api.tmp.json'), JSON.stringify(library, null, 2));
  await rename(path.join(media, 'library.api.tmp.json'), path.join(media, 'library.json'));
}
async function downloadAudio(id, destination) {
  const r = await remote(`https://music.163.com/song/media/outer/url?id=${id}.mp3`);
  if (!r.headers.get('content-type')?.startsWith('audio/')) { await r.body?.cancel(); throw new Error('此版本暂不提供公开音频，可能需要会员或已下架'); }
  const chunks = []; let size = 0;
  for await (const chunk of r.body) {
    size += chunk.length;
    if (size > 80 * 1024 * 1024) throw new Error('音频超过下载大小上限');
    chunks.push(chunk);
  }
  if (size < 10000) throw new Error('音频下载不完整');
  await writeFile(destination + '.tmp', Buffer.concat(chunks));
  await rename(destination + '.tmp', destination);
}
function align(job, audio, lrc, output) {
  return new Promise((resolve, reject) => {
    const python = pythonPath();
    const child = spawn(python, ['-u', path.join(gameRoot, 'scripts/align.py'), '--audio', audio, '--lyrics', lrc, '--output', output], { cwd: gameRoot, windowsHide: true });
    const timer = setTimeout(() => { child.kill(); reject(new Error('制谱超时，音频已保留，可重试')); }, 30 * 60 * 1000);
    child.stdout.on('data', bytes => {
      const match = bytes.toString().match(/aligned line (\d+)\/(\d+)/);
      if (match) job.message = `正在制谱 ${match[1]}/${match[2]}`;
      const vocalProgress = bytes.toString().match(/Separating vocals (\d+%)/);
      if (vocalProgress) job.message = `正在分析句尾延音 ${vocalProgress[1]}`;
    });
    let diagnostics = '';
    child.stderr.on('data', chunk => { diagnostics = (diagnostics + chunk).slice(-8000); });
    child.on('error', () => { clearTimeout(timer); reject(new Error('制谱环境未就绪，请先运行安装脚本')); });
    child.on('close', code => { clearTimeout(timer); if (code !== 0) console.error(diagnostics); code === 0 ? resolve() : reject(new Error('逐字对齐未完成，音频已保留；可重试或校正歌词')); });
  });
}
async function work(job) {
  if (job.source === 'upload') return workUpload(job);
  const existing = (await readLibrary()).find(s => s.source === 'netease' && s.sourceId === job.songId && s.chart && s.playable !== false);
  if (existing) { job.stage = 'ready'; job.message = '歌曲已下载，可以演奏'; return; }
  job.stage = 'downloading'; job.message = '正在下载';
  await mkdir(media, { recursive: true });
  const track = await details(job.songId), data = await lyrics(job.songId);
  const audio = path.join(media, `${job.songId}.mp3`), lrc = path.join(media, `${job.songId}.lrc`), output = path.join(media, `${job.songId}.download.chart.json`);
  await downloadAudio(job.songId, audio);
  const song = { ...track, available: true, mood: 'dream', label: '新发现', audio: `./media/${job.songId}.mp3`, lyrics: `./media/${job.songId}.lrc`,
    hasYrc: Boolean(data.yrc?.lyric), fetchedAt: new Date().toISOString(), timing: 'unprocessed' };
  if (!data.lrc?.lyric?.match(/\[\d+:\d+/)) {
    song.playable = false; song.downloadNote = '已下载，暂无可用歌词'; await publish(song);
    job.stage = 'downloaded'; job.message = song.downloadNote; return;
  }
  await writeFile(lrc, data.lrc.lyric);
  if (data.yrc?.lyric) await writeFile(path.join(media, `${job.songId}.yrc`), data.yrc.lyric);
  else await rm(path.join(media, `${job.songId}.yrc`), { force: true });
  job.stage = 'aligning'; job.message = song.hasYrc ? '正在生成逐字谱面' : '已下载，正在逐字制谱';
  try { await align(job, audio, lrc, output); }
  catch (error) { song.playable = false; song.downloadNote = error.message; await publish(song); throw error; }
  const chart = JSON.parse(await readFile(output, 'utf8'));
  if (chart.duration < track.duration - Math.max(5, track.duration * .03)) throw new Error('音源仅提供试听片段，未加入可玩曲库');
  song.chart = `./media/${path.basename(output)}`; song.timing = chart.method; song.bpm = chart.bpm; song.playable = true;
  await publish(song); job.stage = 'ready'; job.message = '已加入本地曲库，可以演奏';
}
async function drain() {
  if (active) return;
  active = true;
  try {
    for (;;) {
      const job = [...jobs.values()].find(j => j.stage === 'queued');
      if (!job) break;
      try { await work(job); } catch (error) { job.stage = 'error'; job.message = error.message; }
      await persistJobs();
    }
  } finally { active = false; }
}
export function enqueue(id, owner = 'local') {
  id = validId(id);
  const previous = [...jobs.values()].find(j => j.owner === owner && j.songId === id && ['queued', 'downloading', 'aligning'].includes(j.stage));
  if (previous) return previous;
  if ([...jobs.values()].filter(j => j.stage === 'queued').length >= 20) throw new Error('下载队列已满，请稍后重试');
  const job = { id: randomUUID(), owner, songId: id, source: 'netease', stage: 'queued', message: '等待下载' };
  registerJob(job);
  void persistJobs().then(drain).catch(console.error); return job;
}
export function yrcToLrc(text) {
  return text.split(/\r?\n/).flatMap(line => {
    const head = line.match(/^\[(\d+),\d+\]/);
    if (!head) return [];
    const seconds = Number(head[1]) / 1000;
    return [`[${String(Math.floor(seconds / 60)).padStart(2, '0')}:${(seconds % 60).toFixed(3).padStart(6, '0')}]${line.slice(head[0].length).replace(/\(\d+,\d+,\d+\)/g, '')}`];
  }).join('\n');
}
export async function receiveUpload(form, owner = 'local') {
  const file = form.get('audio'), lyric = form.get('lyrics');
  if (!file || typeof file.arrayBuffer !== 'function' || !file.size || file.size > 80 * 1024 * 1024) throw new Error('请选择 80MB 以内的音频文件');
  const ext = path.extname(file.name).toLowerCase();
  if (!['.mp3', '.wav', '.flac', '.m4a', '.ogg', '.aac', '.opus', '.webm', '.wma'].includes(ext)) throw new Error('不支持此音频格式');
  let lyricText = '', native = false;
  if (lyric?.size) {
    if (lyric.size > 2 * 1024 * 1024) throw new Error('歌词文件过大');
    const lyricExt = path.extname(lyric.name).toLowerCase();
    if (!['.lrc', '.yrc'].includes(lyricExt)) throw new Error('请选择 LRC 或 YRC 歌词');
    lyricText = (await lyric.text()).replace(/^\uFEFF/, ''); native = lyricExt === '.yrc';
    if (!(native ? /^\[\d+,\d+\].*\(\d+,\d+,\d+\)/m : /\[\d+:\d+/).test(lyricText)) throw new Error('歌词文件缺少有效时间轴，请使用 UTF-8 编码');
  }
  if ([...jobs.values()].filter(j => ['queued', 'aligning', 'downloading'].includes(j.stage)).length >= 20) throw new Error('队列已满，请稍后导入');
  const bytes = Buffer.from(await file.arrayBuffer()), id = 'local-' + createHash('sha256').update(owner).update(bytes).digest('hex').slice(0, 32);
  const previous = [...jobs.values()].find(j => j.songId === id && ['queued', 'aligning'].includes(j.stage));
  if (previous) return previous;
  await mkdir(media, { recursive: true });
  await writeFile(path.join(media, id + ext), bytes);
  if (lyricText) {
    await writeFile(path.join(media, id + '.lrc'), native ? yrcToLrc(lyricText) : lyricText);
    if (native) await writeFile(path.join(media, id + '.yrc'), lyricText);
    else await rm(path.join(media, id + '.yrc'), { force: true });
  }
  const job = { id: randomUUID(), owner, songId: id, source: 'upload', extension: ext, title: String(form.get('title') || path.basename(file.name, ext)).slice(0, 80), hasLyrics: Boolean(lyricText), hasYrc: native, stage: 'queued', message: '已收到音频，等待导入' };
  registerJob(job); await persistJobs(); void drain(); return job;
}
async function workUpload(job) {
  job.stage = 'aligning'; job.message = '正在检查音频';
  const original = path.join(media, job.songId + job.extension), audio = path.join(media, job.songId + '.mp3'), lrc = path.join(media, job.songId + '.lrc'), output = path.join(media, job.songId + '.upload.chart.json');
  let duration;
  try {
    const { stdout } = await promisify(execFile)(pythonPath(), [path.join(gameRoot, 'scripts/align.py'), '--inspect-audio', original, '--output', audio], { windowsHide: true, timeout: 120000 });
    duration = JSON.parse(stdout).duration;
  } catch { throw new Error('无法解码此音频，请检查格式或先安装制谱环境'); }
  const song = { id: job.songId, sourceId: job.songId, source: 'upload', owner: job.owner, title: job.title, artist: '我的上传', duration, available: true, mood: 'dream', label: '我的音乐', audio: `./media/${path.basename(audio)}`, lyrics: `./media/${path.basename(lrc)}`, hasYrc: job.hasYrc, playable: false };
  if (!job.hasLyrics) {
    const existing = (await readLibrary()).find(s => s.sourceId === job.songId && s.chart);
    if (!existing) { song.downloadNote = '已导入音频 · 请重新导入同一音频并附上歌词'; await publish(song); }
    job.stage = existing ? 'ready' : 'downloaded'; job.message = existing ? '此音频已在本地曲库' : song.downloadNote; return;
  }
  job.message = '正在生成逐字谱面';
  try { await align(job, audio, lrc, output); }
  catch (error) { song.downloadNote = error.message; await publish(song); throw error; }
  const chart = JSON.parse(await readFile(output, 'utf8'));
  Object.assign(song, { chart: `./media/${path.basename(output)}`, timing: chart.method, bpm: chart.bpm, playable: true });
  await publish(song); job.stage = 'ready'; job.message = '导入完成，可以演奏';
}
const loopback = name => ['127.0.0.1', 'localhost', '[::1]'].includes(name);
export function allowedOrigin(origin, origins = publicOrigins) { try { return origins.length ? origins.includes(new URL(origin).origin) : loopback(new URL(origin).hostname); } catch { return false; } }
export function visibleSongs(songs, owner) { return songs.filter(s => s.source !== 'upload' || s.owner === owner); }
export function clientSong(song) {
  const { owner, ...clean } = song;
  for (const key of ['audio', 'lyrics', 'chart']) if (clean[key]) clean[key] = '/api/melody/media/' + encodeURIComponent(path.basename(clean[key]));
  return clean;
}
function send(res, status, data) { res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' }); res.end(JSON.stringify(data)); }
export async function safeStaticPath(root, pathname) {
  const decoded = decodeURIComponent(pathname);
  if (decoded.includes('\\') || decoded.split('/').some(s => s.startsWith('.'))) return null;
  if (decoded.includes('/scripts/') || decoded.startsWith('/game-api/')) return null;
  const file = path.resolve(root, '.' + decoded + (decoded.endsWith('/') ? 'index.html' : ''));
  if (!file.startsWith(root + path.sep)) return null;
  const resolved = await realpath(file);
  return resolved.startsWith(root + path.sep) ? resolved : null;
}
export function createServer({ origins = publicOrigins, readCatalog = readLibrary, mediaRoot = media } = {}) {
  const limits = new Map(); let uploads = 0;
  return http.createServer(async (req, res) => {
    try {
      const host = new URL('http://' + req.headers.host);
      if (!loopback(host.hostname) && !origins.some(origin => new URL(origin).host === host.host)) return send(res, 403, { error: '站点地址不允许' });
      if ((req.headers.origin && !allowedOrigin(req.headers.origin, origins)) || (origins.length && req.method === 'POST' && !req.headers.origin)) return send(res, 403, { error: '来源不允许' });
      if (req.headers.origin) { res.setHeader('Access-Control-Allow-Origin', req.headers.origin); res.setHeader('Access-Control-Allow-Credentials', 'true'); res.setHeader('Vary', 'Origin'); }
      if (req.method === 'OPTIONS') { res.writeHead(204, { 'Access-Control-Allow-Methods': 'GET, POST', 'Access-Control-Allow-Headers': 'Content-Type' }); return res.end(); }
      const url = new URL(req.url, host);
      let owner = req.headers.cookie?.match(/(?:^|;\s*)melody_device=([a-f0-9]{64})(?:;|$)/)?.[1];
      if (!owner) { owner = randomBytes(32).toString('hex'); res.setHeader('Set-Cookie', `melody_device=${owner}; Path=/api/melody; HttpOnly; SameSite=Lax; Max-Age=31536000${origins.length ? '; Secure' : ''}`); }
      if (url.pathname.startsWith('/api/melody/') && (req.method === 'POST' || ['/search', '/resource', '/audio'].some(route => url.pathname.endsWith(route)))) {
        const peer = origins.length && loopback(req.socket.remoteAddress?.replace('::ffff:', '')) ? req.headers['x-real-ip'] || req.socket.remoteAddress : req.socket.remoteAddress;
        const key = `${peer}:${req.method === 'POST' ? 'write' : 'search'}`, now = Date.now();
        let entry = limits.get(key); if (!entry || now > entry.until) { entry = { count: 0, until: now + (req.method === 'POST' ? 600000 : 60000) }; limits.set(key, entry); }
        if (++entry.count > (req.method === 'POST' ? 12 : 60)) return send(res, 429, { error: '操作太频繁，请稍后再试' });
        if (limits.size > 2000) for (const [key, value] of limits) if (value.until < now) limits.delete(key);
      }
      if (url.pathname === '/api/melody/health') return send(res, 200, { ok: true, service: 'fingertip-melody', scope: origins.length ? 'server' : 'development' });
      if (url.pathname === '/api/melody/search' && req.method === 'GET') {
        const q = url.searchParams.get('q') || '';
        if (q.length > 80) return send(res, 400, { error: '搜索词过长' });
        return send(res, 200, { songs: await search(q), provider: 'netease' });
      }
      if (url.pathname === '/api/melody/jobs' && req.method === 'GET') return send(res, 200, { jobs: [...jobs.values()].filter(j => j.owner === owner).map(({ owner, ...job }) => job) });
      if (url.pathname === '/api/melody/library' && req.method === 'GET') return send(res, 200, { songs: (await withCovers(visibleSongs(await readCatalog(), owner))).map(clientSong) });
      if (url.pathname.startsWith('/api/melody/media/') && ['GET', 'HEAD'].includes(req.method)) {
        const name = decodeURIComponent(url.pathname.slice('/api/melody/media/'.length));
        const songs = visibleSongs(await readCatalog(), owner);
        if (name !== path.basename(name) || !songs.some(song => ['audio', 'lyrics', 'chart'].some(key => song[key] && path.basename(song[key]) === name))) return send(res, 404, { error: '文件不存在' });
        const file = path.join(mediaRoot, name), info = await stat(file);
        res.writeHead(200, { 'Content-Type': name.endsWith('.mp3') ? 'audio/mpeg' : name.endsWith('.json') ? 'application/json' : 'text/plain; charset=utf-8', 'Content-Length': info.size, 'Cache-Control': 'private, no-store', 'X-Content-Type-Options': 'nosniff' });
        if (req.method === 'HEAD') return res.end();
        return createReadStream(file).on('error', () => res.destroy()).pipe(res);
      }
      if (url.pathname === '/api/melody/resource' && req.method === 'GET') {
        const id = validId(url.searchParams.get('id'));
        const [song, data] = await Promise.all([details(id), lyrics(id)]);
        return send(res, 200, { song, yrc: data.yrc?.lyric || '', lrc: data.lrc?.lyric || '' });
      }
      if (url.pathname === '/api/melody/audio' && req.method === 'GET') {
        const id = validId(url.searchParams.get('id'));
        const upstream = await remote(`https://music.163.com/song/media/outer/url?id=${id}.mp3`);
        if (!upstream.headers.get('content-type')?.startsWith('audio/')) { await upstream.body?.cancel(); return send(res, 404, { error: '没有可下载音频' }); }
        res.writeHead(200, { 'Content-Type': 'audio/mpeg', 'Cache-Control': 'no-store' });
        let size = 0;
        for await (const chunk of upstream.body) { size += chunk.length; if (size > 80 * 1024 * 1024 || res.destroyed) { res.destroy(); break; } if (!res.write(chunk)) await new Promise(resolve => { const done = () => { res.off('drain', done); res.off('close', done); resolve(); }; res.once('drain', done); res.once('close', done); }); }
        return res.end();
      }
      if (url.pathname === '/api/melody/prepare' && req.method === 'POST') {
        if (!req.headers['content-type']?.startsWith('multipart/form-data;')) return send(res, 415, { error: '需要音频和 LRC 文件' });
        if (uploads || active) return send(res, 429, { error: '制谱服务忙，请稍后重新导入' });
        uploads++; let folder;
        try {
          let size = 0; const chunks = [];
          for await (const chunk of req) { size += chunk.length; if (size > 83 * 1024 * 1024) return send(res, 413, { error: '文件过大' }); chunks.push(chunk); }
          const form = await new Response(Buffer.concat(chunks), { headers: { 'Content-Type': req.headers['content-type'] } }).formData();
          const file = form.get('audio'), lyric = form.get('lyrics');
          if (!file?.size || file.size > 80 * 1024 * 1024 || (lyric?.size || 0) > 2 * 1024 * 1024) return send(res, 400, { error: '请选择音频和歌词' });
          folder = await mkdtemp(path.join(tmpdir(), 'melody-prepare-'));
          const original = path.join(folder, 'input'), audio = path.join(folder, 'song.mp3'), lrc = path.join(folder, 'song.lrc'), output = path.join(folder, 'song.chart.json');
          await writeFile(original, Buffer.from(await file.arrayBuffer())); if (lyric?.size) await writeFile(lrc, await lyric.text());
          const inspected = await promisify(execFile)(pythonPath(), [path.join(gameRoot, 'scripts/align.py'), '--inspect-audio', original, '--output', audio], { timeout: 120000, windowsHide: true });
          if (lyric?.size) await align({}, audio, lrc, output);
          return send(res, 200, { duration: JSON.parse(inspected.stdout.trim()).duration, chart: lyric?.size ? JSON.parse(await readFile(output, 'utf8')) : null, audio: (await readFile(audio)).toString('base64') });
        } finally {
          uploads--;
          if (folder && path.dirname(path.resolve(folder)) === path.resolve(tmpdir()) && path.basename(folder).startsWith('melody-prepare-')) await rm(folder, { recursive: true, force: true });
        }
      }
      // Old clients must not mutate the shared seed library.
      if (['/api/melody/download', '/api/melody/upload'].includes(url.pathname)) return send(res, 410, { error: '请刷新页面，歌曲现在仅保存在此设备' });
      if (url.pathname.startsWith('/api/')) return send(res, 404, { error: '接口不存在' });
      if (origins.length) return send(res, 404, { error: '静态文件由站点提供' });
      if (url.pathname.includes('/media/')) return send(res, 404, { error: '请通过曲库接口读取媒体' });
      if (!['GET', 'HEAD'].includes(req.method)) return send(res, 405, { error: '方法不支持' });
      let file;
      try { file = await safeStaticPath(workspace, url.pathname); } catch { return send(res, 404, { error: '文件不存在' }); }
      if (!file) return send(res, 403, { error: '路径不允许' });
      const info = await stat(file);
      if (!info.isFile()) return send(res, 404, { error: '文件不存在' });
      const mime = { '.html': 'text/html; charset=utf-8', '.mjs': 'text/javascript', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml', '.mp3': 'audio/mpeg', '.png': 'image/png' };
      res.writeHead(200, { 'Content-Type': mime[path.extname(file)] || 'application/octet-stream', 'Content-Length': info.size, 'Cache-Control': 'no-cache' });
      if (req.method === 'HEAD') return res.end();
      createReadStream(file).on('error', () => res.destroy()).pipe(res);
    } catch (error) { if (!res.headersSent) send(res, 400, { error: error.message }); else res.destroy(); }
  });
}
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const port = Number(process.env.MELODY_PORT || 8765);
  await restoreJobs();
  createServer().listen(port, '127.0.0.1', () => console.log(`Melody: http://127.0.0.1:${port}/games/fingertip-melody/`));
}
