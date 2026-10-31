import { deviceSongs, hiddenSongs, removeSong, songKey, listFolders, createFolder, songPlacements, moveSongs } from './device-library.mjs';
import { makeChart, layoutChart, Round, RhythmRound, ratingFor } from './engine.mjs?v=9';
import { Transport } from './transport.mjs';
import { MenuAudio } from './menu-audio.mjs';
import { initCatalogSearch } from './library-search.mjs';
import { catalogApi } from './service.mjs';

const $ = id => document.getElementById(id);
const palettes = { sunshine: '#ff94b8', rain: '#65c9d8', dream: '#aa8cef' };
let transport, library = [], selected, alignment, round;
let managing = false, chosen = new Set(), placements = new Map(), folders = [], dragging = false;
let mode = 'score', state = 'library';
let pendingMode = mode;
const icon = name => `<svg class="icon" aria-hidden="true"><use href="#i-${name}"/></svg>`;
const menuAudio = new MenuAudio();
let menuPreference = true;
let start = 0, end = 0, offset = 0, generation = 0, frame = 0, countdownUntil = 0, lastLine = -1, action;
const elements = new Map(), beatElements = new Map();
const fmt = seconds => `${Math.floor(Math.max(0, seconds) / 60)}:${String(Math.floor(Math.max(0, seconds) % 60)).padStart(2, '0')}`;
const escape = text => String(text).replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
const modeName = () => mode === 'score' ? '计分模式' : '节奏模式';
function bestKey() { return `melody:${selected.id}:${mode}:full:v3`; }
function readBest() { try { return Number(localStorage.getItem(bestKey())) || 0; } catch { return 0; } }
const ratings = ['F', 'C', 'B', 'A', 'S', 'V', 'φ'];
function bestRating(song = selected, currentMode = mode) {
  try { const value = localStorage.getItem(`melody:${song.id}:${currentMode}:rating:v1`); return ratings.includes(value) ? value : '—'; } catch { return '—'; }
}
function saveBest(score) {
  try {
    localStorage.setItem(bestKey(), String(Math.max(readBest(), score)));
    const grade = ratingFor(round);
    if (ratings.indexOf(grade) > ratings.indexOf(bestRating())) localStorage.setItem(`melody:${selected.id}:${mode}:rating:v1`, grade);
  } catch { /* Storage is optional. */ }
}
function coverUrl(song) {
  try { const url = new URL(song.cover || '', location.href); return song.cover && ['http:', 'https:'].includes(url.protocol) ? url.href : ''; } catch { return ''; }
}
function applyCover(target, song) {
  target.querySelector('.cover-image')?.remove(); target.classList.remove('has-cover');
  const url = coverUrl(song); if (!url) return;
  const img = new Image(); img.className = 'cover-image'; img.alt = ''; img.referrerPolicy = 'no-referrer';
  img.onload = () => target.classList.add('has-cover'); img.onerror = () => { img.remove(); target.classList.remove('has-cover'); };
  img.src = url; target.prepend(img);
}
function showGrade(grade) { $('overlay-label').textContent = grade; $('overlay-label').dataset.grade = grade; }
function updateCardScores() {
  $('song-list').querySelectorAll('[data-index]').forEach(button => {
    const song = library[Number(button.dataset.index)];
    let best = 0; try { best = Number(localStorage.getItem(`melody:${song.id}:score:full:v3`)) || 0; } catch {}
    let badge = button.closest('.song-content').querySelector('.song-best');
    if (!badge) { badge = document.createElement('div'); badge.className = 'song-best'; button.closest('.song-content').append(badge); }
    badge.textContent = `${bestRating(song, 'score')} · ${best.toLocaleString()}`;
  });
}
async function request(url) { const r = await fetch(url, { credentials: 'include', signal: AbortSignal.timeout(30000), cache: url.includes('.json') ? 'no-store' : 'default' }); if (!r.ok) throw new Error(`无法读取 ${url}`); return r; }

function updateBulk() {
  $('bulk-bar').hidden = !managing;
  $('manage-songs').textContent = managing ? '完成管理' : '批量管理';
  $('song-list').classList.toggle('managing', managing);
  $('selected-count').textContent = `已选 ${chosen.size} 首`;
  for (const id of ['bulk-move', 'bulk-delete']) $(id).disabled = !chosen.size;
}
async function deleteSongs(songs) {
  try {
    for (const song of songs) await removeSong(song);
    songs.forEach(song => chosen.delete(songKey(song)));
    await loadLibrary(); document.dispatchEvent(new Event('melody-library-changed'));
  } catch (error) { $('catalog-status').textContent = error.message; }
}
$('folder-filter').onchange = () => loadLibrary();
$('manage-songs').onclick = () => { managing = !managing; chosen.clear(); loadLibrary(); };
$('bulk-cancel').onclick = () => { managing = false; chosen.clear(); loadLibrary(); };
$('bulk-select-all').onclick = () => { $('song-list').querySelectorAll('[data-choose]').forEach(input => { input.checked = true; chosen.add(songKey(library[Number(input.dataset.choose)])); }); updateBulk(); };
$('folder-create').onclick = async () => { const name = prompt('新文件夹名称'); if (name === null) return; try { const created = await createFolder(name); await loadLibrary(); $('bulk-folder').value = created; } catch (error) { $('catalog-status').textContent = error.message; } };
$('bulk-move').onclick = async () => { try { await moveSongs(library.filter(song => chosen.has(songKey(song))), $('bulk-folder').value); chosen.clear(); await loadLibrary(); } catch (error) { $('catalog-status').textContent = error.message; } };
$('bulk-delete').onclick = () => deleteSongs(library.filter(song => chosen.has(songKey(song))));
$('song-trash').addEventListener('dragover', event => { event.preventDefault(); $('song-trash').classList.add('over'); });
$('song-trash').addEventListener('dragleave', () => $('song-trash').classList.remove('over'));
$('song-trash').addEventListener('drop', event => { event.preventDefault(); const key = event.dataTransfer.getData('text/plain'); $('song-trash').classList.remove('visible', 'over'); dragging = false; const song = library.find(item => songKey(item) === key); if (song) deleteSongs([song]); });
async function loadLibrary(nextLibrary) {
  try {
    if (Array.isArray(nextLibrary)) library = nextLibrary;
    else {
      try { library = (await catalogApi('library')).songs; }
      catch { try { library = await (await request('./media/library.json')).json(); } catch { library = []; } }
    }
    const cached = await deviceSongs(), hidden = await hiddenSongs(), cachedKeys = new Set(cached.map(songKey));
    library = [...cached, ...library.filter(song => !cachedKeys.has(songKey(song)))].filter(song => song.available !== false && !hidden.has(songKey(song)));
    if (!Array.isArray(library)) throw new Error('invalid');
    placements = await songPlacements(); folders = await listFolders();
    const filter = $('folder-filter'), oldFilter = filter.value;
    filter.innerHTML = '<option value="all">全部歌曲</option><option value="">未分类</option>' + folders.map(name => `<option value="${escape(name)}">${escape(name)}</option>`).join('');
    filter.value = [...filter.options].some(item => item.value === oldFilter) ? oldFilter : 'all';
    $('bulk-folder').innerHTML = '<option value="">未分类</option>' + folders.map(name => `<option value="${escape(name)}">${escape(name)}</option>`).join('');
    const visible = library.map((song, i) => ({song, i})).filter(({song}) => filter.value === 'all' || (placements.get(songKey(song)) || '') === filter.value);
    $('library-count').textContent = `${visible.length} 首歌 · 已下载曲库`;
    $('song-list').innerHTML = visible.map(({song, i}) => `<div class="song-shell" data-key="${escape(songKey(song))}"><button class="swipe-delete" type="button" aria-label="删除 ${escape(song.title)}">删除</button><article class="song-card" draggable="${!managing}" style="--cover:${palettes[song.mood] || palettes.sunshine}"><label class="song-check" ${managing ? '' : 'hidden'}><input type="checkbox" data-choose="${i}" ${chosen.has(songKey(song)) ? 'checked' : ''} aria-label="选择 ${escape(song.title)}"></label><div class="song-art" aria-hidden="true"><span class="tag">${escape(song.label)}</span><strong>${icon(song.mood === 'sunshine' ? 'sun' : song.mood === 'rain' ? 'cloud' : 'star')}</strong></div><div class="song-content"><div class="song-info"><div><h3>${escape(song.title)}</h3><p>${escape(song.artist)}</p></div><button class="song-play" data-index="${i}" aria-label="演奏${escape(song.title)}" ${song.available === false ? 'disabled title="音源暂不可用"' : ''}>${icon('play')}</button></div><div class="song-meta"><span>${fmt(song.duration)}${song.bpm ? ` · ${Math.round(song.bpm)} BPM` : ''}</span><span>${song.available === false ? '音源暂不可用' : song.chart ? '逐字谱面' : '等待制谱'}</span></div><div class="song-best"></div></div></article></div>`).join('');
    $('song-list').querySelectorAll('button[data-index]').forEach(button => {
      const song = library[Number(button.dataset.index)];
      if (!song.chart || song.playable === false) { button.disabled = true; button.title = song.downloadNote || '等待制谱'; }
      button.onclick = () => selectSong(song);
    });
    $('song-list').querySelectorAll('.song-art').forEach((art, i) => applyCover(art, library[i]));
    $('song-list').querySelectorAll('.song-shell').forEach((shell, i) => {
      const song = library[visible[i].i], card = shell.querySelector('.song-card');
      shell.querySelector('.swipe-delete').onclick = async () => { await deleteSongs([song]); };
      shell.querySelector('[data-choose]').onchange = event => { event.target.checked ? chosen.add(songKey(song)) : chosen.delete(songKey(song)); updateBulk(); };
      card.addEventListener('dragstart', event => { if (managing) { event.preventDefault(); return; } dragging = true; event.dataTransfer.setData('text/plain', songKey(song)); event.dataTransfer.effectAllowed = 'move'; $('song-trash').classList.add('visible'); });
      card.addEventListener('dragend', () => { dragging = false; $('song-trash').classList.remove('visible', 'over'); });
      let startX = 0, startY = 0;
      card.addEventListener('touchstart', event => { startX = event.touches[0].clientX; startY = event.touches[0].clientY; }, {passive:true});
      card.addEventListener('touchend', event => { if (managing) return; const dx = event.changedTouches[0].clientX - startX, dy = event.changedTouches[0].clientY - startY; if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy) * 1.3) shell.classList.toggle('swiped', dx < 0); }, {passive:true});
    });
    if (!library.length) $('song-list').innerHTML = '<p>此设备暂无歌曲，搜索下载或导入喜欢的音乐吧。</p>';
    else if (!visible.length) $('song-list').innerHTML = '<p>这个文件夹还是空的。</p>';
    updateBulk();
    updateCardScores();
  } catch {
    library = [];
    $('library-count').textContent = '曲库未就绪';
    $('song-list').innerHTML = '<div class="error-card">尚未找到已下载曲库，请先下载歌曲并运行制谱工具。<button class="plain-button" id="reload-library">重新加载</button></div>';
    $('reload-library').onclick = loadLibrary;
  }
}
function setState(value) { state = value; $('board').dataset.state = value; $('menu-sound').hidden = value !== 'library'; if (value === 'library') updateCardScores(); }
function overlay(label, title, copy, button, callback) {
  delete $('overlay-label').dataset.grade;
  $('overlay-label').removeAttribute('aria-label');
  $('pause-settings').hidden = true;
  for (const id of ['overlay-label', 'overlay-title', 'overlay-copy']) $(id).hidden = false;
  $('overlay').hidden = false;
  $('overlay-song').hidden = !selected || !['ready', 'result'].includes(state);
  if (selected) $('overlay-song').innerHTML = `<strong>${escape(selected.title)}</strong><span>${escape(selected.artist)}</span>`;
  $('overlay-label').textContent = label; $('overlay-title').textContent = title; $('overlay-copy').textContent = copy;
  $('overlay-action').textContent = button || ''; $('overlay-action').hidden = !button; $('overlay-action').disabled = false; action = callback;
}
$('overlay-action').onclick = () => action?.();
function clearNotes() { for (const map of [elements, beatElements]) { map.forEach(el => el.remove()); map.clear(); } }
function stop() { generation++; transport?.pause(); cancelAnimationFrame(frame); $('pause').disabled = true; }

async function selectSong(song) {
  stop(); const token = generation;
  menuAudio.stop(); updateMenuButton();
  selected = song; applyCover($('overlay'), song); setState('loading'); round = null;
  $('playing-title').textContent = song.title;
  document.body.dataset.mood = song.mood;
  $('library').hidden = true; $('play-screen').hidden = false;
  $('playing-mood').textContent = song.label;
  $('mode-title').textContent = mode === 'score' ? '跟上音乐，\n打出高分。' : '你的速度，\n你的旋律。';
  $('mode-help').textContent = mode === 'score' ? '字块下沿到达判定线时点一下。音乐保持原速，漏按或点错只影响得分，歌曲会继续。' : '依次点亮最下面的歌词字。点击会放行下一段音乐，快点就加速；停手后音乐在下一个字前等你。';
  $('offset').disabled = mode === 'rhythm';
  clearNotes(); $('score').textContent = '000000'; $('combo').textContent = '0'; $('metric').textContent = '—';
  $('feedback').textContent = ''; $('lyric-line').textContent = ''; $('progress-fill').style.width = '0%';
  overlay('LOADING', '准备音乐…', '正在读取音频与逐字谱面。');
  window.scrollTo({ top: 0, behavior: 'instant' });
  try {
    if (!song.chart) throw new Error('这首歌还没有逐字谱面，请先运行 scripts/align.py。');
    const [data, bytes] = await Promise.all([request(song.chart).then(r => r.json()), request(song.audio).then(r => r.arrayBuffer())]);
    if (generation !== token) return;
    const hash = [...new Uint8Array(await crypto.subtle.digest('SHA-256', bytes))].map(b => b.toString(16).padStart(2, '0')).join('');
    if (data.audioSha256 !== hash) throw new Error('谱面与音频版本不一致，请为当前音频重新制谱。');
    transport?.dispose();
    const nextTransport = new Transport();
    await nextTransport.load(bytes);
    if (generation !== token) { nextTransport.dispose(); return; }
    transport = nextTransport; transport.volume = Number($('volume').value); alignment = data;
    transport.audio.id = 'song-audio'; transport.audio.hidden = true; document.body.append(transport.audio);
    transport.onError = () => { pause(); overlay('TRY AGAIN', '音乐暂时停住了', '点一下继续演奏。', '继续', begin); };
    $('timing-note').textContent = `${data.method === 'provider-character-timestamps' ? '原生逐字谱面' : '音频逐字对齐'}${data.bpm ? ` · ${Math.round(data.bpm)} BPM` : ''}${data.review?.required ? ' · 部分字需听校' : ''}`;
    prepare();
  } catch (error) {
    if (generation !== token) return;
    setState('error'); overlay('TRY AGAIN', '音乐还没准备好', error.message, '重新加载', () => selectSong(song));
  }
}

function prepare() {
  stop(); setState('ready'); clearNotes(); lastLine = -1;
  $('feedback').textContent = ''; $('feedback').classList.remove('pop');
  const seed = Number(selected.sourceId) || 1;
  const chart = layoutChart(makeChart(alignment, transport.duration, seed), seed);
  start = 0;
  end = transport.duration;
  const notes = chart.filter(note => note.time >= start && note.time < end - .25);
  round = mode === 'score' ? new Round(notes, .24) : new RhythmRound(notes);
  transport.seek(start);
  $('elapsed').textContent = '0:00'; $('total').textContent = fmt(end - start); $('progress-fill').style.width = '0%';
  $('transport-status').textContent = modeName(); $('lyric-line').textContent = '一个字，一次点击。';
  updateScore(); draw(start);
  overlay(bestRating(), readBest().toLocaleString(), `${modeName()} · ${notes.length} 个字\n${mode === 'score' ? '跟着原曲节奏点击，失误不会结束。' : '点击最下面的歌词，音乐才会往前走。'}`, '开始', begin);
  showGrade(bestRating());
  $('overlay-label').setAttribute('aria-label', `最高评级 ${bestRating()}`);
}
async function begin() {
  if (!['ready', 'paused'].includes(state)) return;
  const token = ++generation;
  setState('starting'); $('overlay-action').disabled = true;
  try {
    await transport.unlock();
    if (token !== generation) return;
    round.resume?.();
    countdownUntil = performance.now() + 3000; setState('countdown');
    $('pause').disabled = false; $('pause').innerHTML = icon('pause'); $('pause').setAttribute('aria-label', '暂停'); $('pause').title = '暂停';
    overlay('GET READY', '3', mode === 'rhythm' ? '等你点下第一个字。' : '跟着音乐，找到节拍。');
    frame = requestAnimationFrame(tick);
  } catch { if (token !== generation) return; setState('paused'); overlay('TRY AGAIN', '点一下唤醒音乐', '浏览器未允许音频播放。', '继续', begin); }
}
function tick(now) {
  if (state === 'countdown') {
    const remaining = Math.max(0, countdownUntil - now);
    $('overlay-title').textContent = String(Math.max(1, Math.ceil(remaining / 1000)));
    if (!remaining) {
      setState('playing'); $('overlay').hidden = true; $('board').focus({ preventScroll: true });
      if (mode === 'score') transport.play(end, 1);
      else if (transport.time < (round.next?.time ?? end)) transport.play(round.next?.time ?? end, round.rate);
    }
  } else if (state === 'playing') {
    const time = transport.time - (mode === 'score' ? offset : 0);
    if (mode === 'score' && round.expire(time)) { feedback('MISS', false); updateScore(); }
    draw(time); updateLyrics(time);
    const beat = (alignment.beats || []).findLast(b => b <= time) ?? -10;
    document.body.style.setProperty('--pulse', String(Math.max(0, 1 - (time - beat) * 5)));
    const elapsed = Math.max(0, Math.min(end - start, transport.time - start));
    $('elapsed').textContent = fmt(elapsed); $('progress-fill').style.width = `${elapsed / (end - start) * 100}%`;
    $('transport-status').textContent = mode === 'rhythm' ? (transport.playing ? `${round.rate.toFixed(2)}×` : '点下一个字，继续音乐') : '原曲速度 · 1.00×';
    if (transport.time >= end - .001) { finish(); return; }
  } else return;
  frame = requestAnimationFrame(tick);
}

function draw(time) {
  const height = $('board').clientHeight, speed = height * .78 / 2.6;
  $('board').dataset.time = time.toFixed(4);
  const visible = new Set();
  round.notes.forEach((note, i) => {
    if (note.time - time > 3.2 || time - note.displayEnd > .5) return;
    visible.add(i);
    let element = elements.get(i);
    if (!element) {
      element = document.createElement('div'); element.className = 'note'; element.dataset.lane = note.lane;
      element.dataset.start = note.time; element.dataset.end = note.end;
      element.style.background = `var(--${['a', 'b', 'c', 'd'][note.color]})`;
      const label = document.createElement('span'); label.textContent = note.char; element.append(label);
      element.style.left = `${note.lane * 25}%`; element.style.zIndex = String(round.notes.length - i); $('notes').append(element); elements.set(i, element);
    }
    // Keep the lower edge on the exact onset; only the visual tail is extended.
    const lengthPx = Math.max(20, (note.end - note.time) * speed);
    element.style.height = `${lengthPx}px`;
    element.firstElementChild.style.height = `${Math.min(36, lengthPx)}px`;
    element.firstElementChild.style.fontSize = `${Math.min(25, lengthPx - 2)}px`;
    element.style.transform = `translateY(${height * .78 - (note.time - time) * speed - lengthPx}px)`;
    element.classList.toggle('played', ['perfect', 'good'].includes(note.status));
    element.classList.toggle('missed', note.status === 'miss');
    element.classList.toggle('target', mode === 'rhythm' && note === round.next);
    element.style.zIndex = note.status === 'pending' ? String(round.notes.length - i) : '0';
  });
  for (const [i, element] of elements) if (!visible.has(i)) { element.remove(); elements.delete(i); }
  const visibleBeats = new Set();
  for (const [i, beat] of (alignment.beats || []).entries()) {
    if (beat < time - .6 || beat > time + 3) continue;
    visibleBeats.add(i);
    if (!beatElements.has(i)) { const el = document.createElement('div'); el.className = 'beat-line'; $('beats').append(el); beatElements.set(i, el); }
    beatElements.get(i).style.transform = `translateY(${height * .78 - (beat - time) * speed}px)`;
  }
  for (const [i, el] of beatElements) if (!visibleBeats.has(i)) { el.remove(); beatElements.delete(i); }
}
function updateScore() {
  $('score').textContent = String(round.score).padStart(6, '0'); $('combo').textContent = round.combo;
  $('metric-label').textContent = 'RATE';
  const judged = round.perfect + round.good + round.misses + round.wrong;
  $('combo').classList.toggle('gold', round.combo > 0 && round.misses === 0 && round.wrong === 0);
  $('metric').textContent = mode === 'rhythm' ? `${round.rate.toFixed(2)}×` : `${judged ? Math.round((round.perfect + round.good * .6) / judged * 100) : 100}%`;
  $('metric').classList.toggle('gold', mode === 'score' && judged > 0 && round.perfect === judged && !round.good && !round.misses && !round.wrong);
}
function feedback(text, success = true) {
  const el = $('feedback'); el.textContent = text; el.style.color = success ? 'var(--accent)' : '#eb6695';
  el.classList.remove('pop'); void el.offsetWidth; el.classList.add('pop');
}
function hit(lane) {
  if (state !== 'playing') return;
  const track = $('board').querySelectorAll('.tracks i')[lane]; track.classList.add('pressed');
  setTimeout(() => track.classList.remove('pressed'), 100);
  const result = mode === 'score' ? round.hit(lane, transport.time - offset) : round.tap(lane, performance.now() / 1000, transport.time);
  if (result.grade === 'done') return;
  if (result.grade === 'early') { feedback('等这个字靠近'); return; }
  feedback(result.grade === 'perfect' ? (mode === 'score' ? 'PERFECT' : 'NICE') : result.grade === 'good' ? 'GOOD' : '点错了', result.grade !== 'wrong');
  if (mode === 'rhythm' && result.note) transport.play(round.next?.time ?? end, round.rate);
  updateScore(); draw(transport.time - (mode === 'score' ? offset : 0));
}
function updateLyrics(time) {
  const index = alignment.lines.findLastIndex(line => line.playable && line.time <= time + .15);
  if (index !== lastLine) { lastLine = index; $('lyric-line').textContent = index >= 0 ? alignment.lines[index].text : '听，节奏正在靠近。'; }
}
function pause() {
  if (!['playing', 'countdown', 'starting'].includes(state)) return;
  stop(); setState('paused'); $('pause').disabled = false; $('pause').innerHTML = icon('play'); $('pause').setAttribute('aria-label', '继续游戏'); $('pause').title = '继续游戏';
  overlay('', '', '', '');
  for (const id of ['overlay-label', 'overlay-title', 'overlay-copy']) $(id).hidden = true;
  pendingMode = mode; updatePauseMode(); $('pause-volume').value = $('volume').value;
  $('pause-settings').hidden = false;
}
function finish() {
  if (state !== 'playing') return;
  if (mode === 'score') round.expire(end + 1);
  stop(); setState('result'); updateScore(); const previous = readBest(); saveBest(round.score);
  $('progress-fill').style.width = '100%';
  overlay(ratingFor(round), round.score.toLocaleString(), `${round.accuracy}% 准确率\n最佳连击 ${round.maxCombo} · PERFECT ${round.perfect} · GOOD ${round.good}\n漏字 ${round.misses} · 点错 ${round.wrong}\n${round.score > previous ? '新的本地纪录' : `本地最高 ${previous.toLocaleString()} 分`}`, '再弹一次', prepare);
  showGrade(ratingFor(round));
  $('overlay-label').setAttribute('aria-label', ratingFor(round));
}
$('board').addEventListener('pointerdown', event => {
  if (event.target.closest('button') || state !== 'playing') return;
  event.preventDefault(); const bounds = $('board').getBoundingClientRect();
  hit(Math.max(0, Math.min(3, Math.floor((event.clientX - bounds.left) / bounds.width * 4))));
});
document.addEventListener('keydown', event => {
  if (event.repeat || event.ctrlKey || event.altKey || event.metaKey || event.target.matches('input,select,textarea')) return;
  const lane = ['KeyD', 'KeyF', 'KeyJ', 'KeyK'].indexOf(event.code);
  if (lane >= 0 && state === 'playing') { event.preventDefault(); hit(lane); }
  if (['Space', 'Escape'].includes(event.code) && ['playing', 'countdown', 'paused'].includes(state)) { event.preventDefault(); state === 'paused' ? resume() : pause(); }
});
document.addEventListener('visibilitychange', () => { if (document.hidden) pause(); });
window.addEventListener('blur', pause);
$('pause').onclick = () => state === 'paused' ? resume() : pause();
function updatePauseMode() {
  $('pause-mode').querySelectorAll('button').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.value === pendingMode)));
  $('offset').disabled = pendingMode === 'rhythm';
}
function applyPendingMode() {
  mode = pendingMode;
  $('mode')?.querySelectorAll('button').forEach(button => { button.classList.toggle('active', button.dataset.value === mode); button.setAttribute('aria-pressed', String(button.dataset.value === mode)); });
  $('mode-title').textContent = mode === 'score' ? '跟上音乐，\n打出高分。' : '你的速度，\n你的旋律。';
  $('mode-help').textContent = mode === 'score' ? '下沿抵达判定线时点击，失误不会结束。' : '依次点击歌词，音乐跟着你的速度走。';
}
function resume() { if (pendingMode !== mode) { applyPendingMode(); prepare(); } begin(); }
$('resume').onclick = resume;
$('pause-mode').querySelectorAll('button').forEach(button => button.onclick = () => { pendingMode = button.dataset.value; updatePauseMode(); });
$('restart').onclick = () => { if (round && state === 'paused') { applyPendingMode(); prepare(); begin(); } };
$('leave').onclick = () => { stop(); mode = pendingMode = 'score'; setState('library'); clearNotes(); $('play-screen').hidden = true; $('library').hidden = false; document.body.dataset.mood = 'sunshine'; if (menuPreference) menuAudio.start().then(updateMenuButton).catch(() => {}); };
$('pause-leave').onclick = () => $('leave').onclick();
for (const id of ['volume', 'pause-volume']) $(id).oninput = event => { const volume = Number(event.target.value); $('volume').value = $('pause-volume').value = volume; menuAudio.volume = volume; if (transport) transport.volume = volume; };
$('offset').oninput = event => { offset = Number(event.target.value) / 1000; $('offset-value').textContent = `${event.target.value} ms`; };
for (const id of ['mode']) {
  $(id)?.querySelectorAll('button').forEach(button => button.onclick = () => {
    $(id).querySelectorAll('button').forEach(item => { item.classList.toggle('active', item === button); item.setAttribute('aria-pressed', String(item === button)); });
    mode = button.dataset.value;
    updateCardScores();
  });
}
function updateMenuButton() {
  $('menu-sound').innerHTML = icon('music') + `<span>${menuAudio.enabled ? '音乐已开' : '开启音乐'}</span>`;
  $('menu-sound').setAttribute('aria-pressed', String(menuAudio.enabled));
}
$('menu-sound').onclick = async () => {
  menuPreference = !menuAudio.enabled;
  if (menuPreference) await menuAudio.start(); else menuAudio.stop();
  updateMenuButton();
};
document.addEventListener('pointerdown', event => {
  if (!event.target.closest('button') || !menuPreference) return;
  if (!event.target.closest('#board')) menuAudio.click().catch(() => {});
  if (state === 'library' && !event.target.closest('#menu-sound,.song-play')) menuAudio.start().then(updateMenuButton).catch(() => {});
});
document.addEventListener('visibilitychange', () => {
  if (document.hidden) { menuAudio.stop(); updateMenuButton(); }
  else if (state === 'library' && menuPreference) menuAudio.start().then(updateMenuButton).catch(() => {});
});
loadLibrary().then(() => initCatalogSearch({ getLibrary: () => library, selectSong, reloadLibrary: loadLibrary }));
