import { unzipSync, zipSync, strFromU8, strToU8 } from './vendor/fflate.mjs';
import { deviceRecords, importSong, songKey } from './device-library.mjs';

const AUDIO = /\.(mp3|wav|flac|m4a|ogg|aac|opus|webm|wma)$/i;
const LYRIC = /\.(yrc|lrc)$/i;
const safeName = value => String(value || 'song').replace(/[\\/<>:"|?*\x00-\x1f]/g, '_').slice(0, 90);
const basename = path => path.split('/').pop();
const stem = path => basename(path).replace(/\.[^.]+$/, '').toLowerCase();
const mime = path => ({ mp3: 'audio/mpeg', wav: 'audio/wav', m4a: 'audio/mp4', ogg: 'audio/ogg', flac: 'audio/flac' })[path.split('.').pop().toLowerCase()] || 'application/octet-stream';

export async function importArchive(file, progress = () => {}, importer = importSong) {
  if (!file?.size || file.size > 250 * 1024 * 1024) throw new Error('请选择 250MB 以内的 ZIP 压缩包');
  progress('正在解压并检查歌曲…');
  let count = 0, total = 0;
  const files = unzipSync(new Uint8Array(await file.arrayBuffer()), { filter(entry) {
    if (++count > 1000 || (total += entry.originalSize) > 400 * 1024 * 1024) throw new Error('压缩包文件过多或解压后超过 400MB');
    return !entry.name.includes('..') && !entry.name.startsWith('/') && !entry.name.endsWith('/');
  } });
  const names = Object.keys(files);
  const manifestName = names.find(name => /(^|\/)melody-manifest\.json$/i.test(name));
  let songs;
  if (manifestName) {
    const manifest = JSON.parse(strFromU8(files[manifestName]));
    if (!Array.isArray(manifest.songs)) throw new Error('压缩包曲目清单格式错误');
    songs = manifest.songs;
  } else {
    songs = names.filter(name => AUDIO.test(name)).map(audio => {
      const peers = names.filter(name => name.slice(0, name.lastIndexOf('/') + 1) === audio.slice(0, audio.lastIndexOf('/') + 1));
      const match = pattern => peers.find(name => stem(name) === stem(audio) && pattern.test(name));
      const infoPath = match(/\.json$/i);
      let info = {};
      if (infoPath) { try { info = JSON.parse(strFromU8(files[infoPath])); } catch { throw new Error(`${basename(infoPath)} 不是有效 JSON`); } }
      return { audio, lyrics: match(LYRIC) || info.lyrics, song: info.song || (info.words ? {} : info), chart: info.chart || info.chartPath || (info.words ? infoPath : undefined) };
    });
    // A JSON info file can contain an audio link instead of an audio file.
    for (const name of names.filter(name => /\.json$/i.test(name) && name !== manifestName)) {
      const info = JSON.parse(strFromU8(files[name]));
      const audioUrl = info.audioUrl || (/^https?:\/\//.test(info.audio || '') ? info.audio : '');
      if (audioUrl && !songs.some(song => song.audioUrl === audioUrl)) songs.push({ song: info.song || info, audioUrl, lyrics: info.lyrics, chart: info.chart });
    }
    for (const name of names.filter(name => /\.(url|txt)$/i.test(name))) {
      const url = strFromU8(files[name]).trim();
      if (/^https?:\/\/\S+$/.test(url) && !songs.some(song => song.audioUrl === url)) {
        const lyric = names.find(peer => stem(peer) === stem(name) && LYRIC.test(peer));
        songs.push({ song: { title: basename(name).replace(/\.[^.]+$/, '') }, audioUrl: url, lyrics: lyric });
      }
    }
  }
  if (!songs.length) throw new Error('压缩包中没有可识别的音频或音频链接');
  const errors = []; let imported = 0;
  for (const [index, entry] of songs.entries()) {
    try {
      progress(`正在导入 ${index + 1}/${songs.length}：${entry.song?.title || basename(entry.audio || entry.audioUrl || '歌曲')}`);
      let audio;
      if (entry.audio && Object.hasOwn(files, entry.audio)) audio = new File([files[entry.audio]], basename(entry.audio), { type: mime(entry.audio) });
      else if (entry.audioUrl || entry.song?.audioUrl) {
        const url = new URL(entry.audioUrl || entry.song.audioUrl);
        if (!['https:', 'http:'].includes(url.protocol)) throw new Error('音频链接仅支持 HTTP(S)');
        const response = await fetch(url.href, { signal: AbortSignal.timeout(120000) });
        if (!response.ok) throw new Error('音频链接不可下载');
        const blob = await response.blob();
        audio = new File([blob], safeName(entry.song?.title || `歌曲${index + 1}`) + (AUDIO.exec(url.pathname)?.[0] || '.mp3'), { type: blob.type || mime(url.pathname) });
      } else throw new Error('缺少音频文件');
      let lyric;
      if (entry.lyrics && Object.hasOwn(files, entry.lyrics)) lyric = new File([files[entry.lyrics]], basename(entry.lyrics));
      else if (typeof entry.lyrics === 'string' && /\[\d/.test(entry.lyrics)) lyric = new File([entry.lyrics], /\[\d+,\d+\]/.test(entry.lyrics) ? 'song.yrc' : 'song.lrc');
      let chart = typeof entry.chart === 'string' && Object.hasOwn(files, entry.chart) ? JSON.parse(strFromU8(files[entry.chart])) : entry.chart;
      if (typeof chart === 'string') chart = undefined;
      await importer(audio, lyric, { ...entry.song, ...(chart?.words ? { chart } : {}) }, progress);
      imported++;
    } catch (error) { errors.push(`${entry.song?.title || index + 1}：${error.message}`); }
  }
  progress(`已导入 ${imported}/${songs.length} 首${errors.length ? `；失败：${errors.slice(0, 3).join('；')}` : ''}`);
  if (!imported) throw new Error(errors.join('；'));
  return { imported, errors };
}

export async function exportArchive(songs, progress = () => {}) {
  const keys = new Set(songs.map(songKey));
  const records = await deviceRecords(keys);
  if (!records.length) throw new Error('请选择此设备已导入或下载的歌曲');
  const files = {}, manifest = { format: 'fingertip-melody', version: 1, songs: [] };
  for (const [index, record] of records.entries()) {
    progress(`正在打包 ${index + 1}/${records.length} 首…`);
    const folder = `songs/${String(index + 1).padStart(3, '0')}-${safeName(record.song.title)}/`;
    const ext = AUDIO.exec(record.audio.name || '')?.[0] || ({ 'audio/wav': '.wav', 'audio/mp4': '.m4a', 'audio/ogg': '.ogg' })[record.audio.type] || '.mp3';
    const audio = folder + 'audio' + ext;
    files[audio] = new Uint8Array(await record.audio.arrayBuffer());
    const entry = { song: record.song, audio };
    if (record.lyric) { entry.lyrics = folder + (/\[\d+,\d+\]/.test(record.lyric) ? 'lyrics.yrc' : 'lyrics.lrc'); files[entry.lyrics] = strToU8(record.lyric); }
    if (record.chart) { entry.chart = folder + 'chart.json'; files[entry.chart] = strToU8(JSON.stringify(record.chart)); }
    manifest.songs.push(entry);
  }
  files['melody-manifest.json'] = strToU8(JSON.stringify(manifest, null, 2));
  const blob = new Blob([zipSync(files, { level: 1 })], { type: 'application/zip' });
  const url = URL.createObjectURL(blob), link = document.createElement('a');
  link.href = url; link.download = `指尖旋律曲库-${new Date().toISOString().slice(0, 10)}.zip`;
  document.body.append(link); link.click(); link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 60000);
  progress(`已导出 ${records.length} 首歌曲`);
  return records.length;
}
