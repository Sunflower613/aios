import { downloadSong, importSong } from './device-library.mjs';
import { mergeResults, resourceGroup } from './catalog.mjs';
import { catalogApi as api } from './service.mjs';

export function initCatalogSearch({ getLibrary, selectSong, reloadLibrary }) {
  const input = document.getElementById('catalog-query'), results = document.getElementById('catalog-results');
  const status = document.getElementById('catalog-status'), cards = document.getElementById('song-list');
  const titles = { local: '已下载曲库', yrc: '网络 · 逐字歌曲', audio: '网络 · 普通歌曲', member: '会员与付费歌曲', unavailable: '暂不可用' };
  const escape = value => String(value ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const icon = name => `<svg class="icon" aria-hidden="true"><use href="#i-${name}"/></svg>`;
  let shown = {};
  let remote = [], jobs = [], timer, polling, version = 0, controller;
  const busy = job => ['queued', 'downloading', 'aligning'].includes(job?.stage);
  function render() {
    const query = input.value.trim();
    cards.hidden = Boolean(query); results.hidden = !query;
    if (!query) { results.replaceChildren(); return; }
    const songs = mergeResults(getLibrary(), remote, query);
    let group; const counts = {}, totals = {};
    songs.forEach(song => { const key = resourceGroup(song); totals[key] = (totals[key] || 0) + 1; });
    results.innerHTML = songs.map((song, index) => {
      const next = resourceGroup(song);
      counts[next] = (counts[next] || 0) + 1;
      if (counts[next] > (shown[next] || 10)) return '';
      const heading = next !== group ? `<h3 class="search-group">${titles[next]}</h3>` : ''; group = next;
      const job = jobs.findLast(j => j.songId === song.sourceId);
      const playable = song.local && song.chart && song.playable !== false;
      const downloadable = song.access === 'public' || (song.local && !playable && song.source !== 'upload');
      const label = busy(job) ? job.message : playable ? '演奏' : downloadable ? (job?.stage === 'error' ? '重试' : song.local ? '重新制谱' : '下载') : song.source === 'upload' ? '待制谱' : song.access === 'member' ? '需会员' : song.access === 'purchase' ? '需购买' : '不可用';
      const note = busy(job) ? '' : job?.stage === 'error' ? job.message : song.local ? (playable ? '已下载 · 可演奏' : song.downloadNote || '已下载 · 等待制谱') : song.hasLyrics ? '网易云音乐' : '网易云音乐 · 暂无可用歌词';
      return `${heading}<article class="search-row"><div class="search-cover">${icon(playable ? 'music' : 'cloud')}</div><div class="search-info"><strong>${escape(song.title)}</strong>${song.hasYrc || song.timing === 'provider-character-timestamps' ? '<span class="word-badge">逐字</span>' : ''}<p>${escape(song.artist)} · ${Math.floor(song.duration / 60)}:${String(Math.floor(song.duration % 60)).padStart(2, '0')}</p><small>${escape(note)}</small></div><button class="search-action" data-song="${index}" ${busy(job) || (!playable && !downloadable) ? 'disabled' : ''} aria-label="${escape(label + ' ' + song.title)}">${icon(playable ? 'play' : 'download')}<span>${escape(label)}</span></button></article>${counts[next] === (shown[next] || 10) && totals[next] > counts[next] ? `<button class="load-more plain-button" data-more="${next}">加载更多 · ${titles[next]}</button>` : ''}`;
    }).join('') || '<p class="search-empty">暂时没有匹配的歌曲</p>';
    results.querySelectorAll('[data-more]').forEach(button => button.onclick = () => { shown[button.dataset.more] = (shown[button.dataset.more] || 10) + 10; render(); });
    results.querySelectorAll('button[data-song]').forEach(button => button.onclick = async () => {
      const song = songs[Number(button.dataset.song)];
      if (song.local && song.chart && song.playable !== false) { selectSong(song); return; }
      button.disabled = true;
      try {
        await downloadSong(song, message => { status.textContent = message; });
        await reloadLibrary(); render();
      } catch (error) { status.textContent = error.message; button.disabled = false; await reloadLibrary(); render(); }
    });
  }
  function runSearch() {
    clearTimeout(timer); controller?.abort(); const current = ++version;
    shown = {}; remote = []; render(); status.textContent = input.value.trim() ? '正在查找网络歌曲…' : '已下载优先 · 网络音源：网易云音乐';
    if (!input.value.trim()) return;
    timer = setTimeout(async () => {
      controller = new AbortController();
      try {
        const data = await api('search?q=' + encodeURIComponent(input.value.trim()), { signal: controller.signal });
        if (current !== version) return;
        remote = data.songs; status.textContent = '已下载 → 网络逐字 → 网络普通 → 会员 · 下载后自动制谱'; render();
      } catch (error) { if (current === version && error.name !== 'AbortError') status.textContent = error.message + '，本地歌曲仍可搜索'; }
    }, 350);
  }
  input.addEventListener('input', runSearch);
  document.getElementById('catalog-search').onsubmit = event => { event.preventDefault(); runSearch(); };
  document.getElementById('song-upload').onsubmit = async event => {
    event.preventDefault(); const form = event.currentTarget, button = form.querySelector('button');
    const output = document.getElementById('upload-status'); button.disabled = true; output.textContent = '正在导入…';
    try {
      const data = new FormData(form);
      await importSong(data.get('audio'), data.get('lyrics'), data.get('title')?.trim() ? { title: data.get('title').trim() } : {}, message => { output.textContent = message; });
      await reloadLibrary(); render();
    } catch (error) { output.textContent = error.message; }
    finally { button.disabled = false; await reloadLibrary(); render(); }
  };
  document.addEventListener('melody-library-changed', render);
}
