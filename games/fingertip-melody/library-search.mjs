import { downloadSong, importSong } from './device-library.mjs';
import { mergeResults, resourceGroup } from './catalog.mjs';
import { catalogApi as api } from './service.mjs';
import { importArchive } from './song-archive.mjs';

export function initCatalogSearch({ getLibrary, selectSong, reloadLibrary }) {
  const input = document.getElementById('catalog-query'), results = document.getElementById('catalog-results');
  const status = document.getElementById('catalog-status'), cards = document.getElementById('song-list');
  const titles = { local: '已下载曲库', yrc: '网络 · 逐字歌曲', audio: '网络 · 普通歌曲', member: '会员与付费歌曲', unavailable: '暂不可用' };
  const escape = value => String(value ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const icon = name => `<svg class="icon" aria-hidden="true"><use href="#i-${name}"/></svg>`;
  const spinner = document.getElementById('search-loading'), memberDialog = document.getElementById('member-login');
  let shown = {};
  let downloading = new Set();
  let remote = [], jobs = [], timer, polling, version = 0, controller;
  const busy = job => ['queued', 'downloading', 'aligning'].includes(job?.stage);
  let loggedIn = false, attempt = 0;
  const logout = document.getElementById('cloud-logout');
  function setAccount(value) { loggedIn = value; logout.hidden = !value; }
  api('login/state').then(data => setAccount(data.loggedIn)).catch(() => {});
  logout.onclick = async () => { await api('login/logout', {method:'POST'}); setAccount(false); runSearch(); };
  const openLogin = document.getElementById('login-open');
  function clearLink() { openLogin.hidden = true; openLogin.removeAttribute('href'); }
  memberDialog.onclose = () => { attempt++; clearLink(); };
  const retry = document.getElementById('login-retry');
  retry.onclick = startLogin;
  async function startLogin() {
    const token = ++attempt, message = document.getElementById('login-message'), image = document.getElementById('login-qr');
    clearLink(); retry.hidden = true; image.hidden = true; message.textContent = '正在获取二维码…';
    try {
      const data = await api('login/start', {method:'POST'});
      if (token !== attempt) return;
      if (!data.qrurl) throw new Error('曲库服务版本过旧，请双击启动曲库.cmd重启');
      const url = new URL(data.qrurl);
        if (url.origin !== 'https://music.163.com' || url.pathname !== '/login') throw new Error('授权链接无效，请刷新二维码');
      openLogin.href = url.href; openLogin.hidden = false;
      image.src = data.qrimg; image.hidden = false; message.textContent = data.qrurl ? '用网易云音乐 App 扫码，或点下方按钮授权后返回游戏。' : '可使用 App 扫码。重启曲库服务后可在本设备直接打开授权链接。';
      while (token === attempt) {
        await new Promise(resolve => setTimeout(resolve, 2000));
        if (token !== attempt) return;
        const {code} = await api('login/check');
        if (token !== attempt) return;
        if (code === 803) { setAccount(true); memberDialog.close(); runSearch(); return; }
        if (code === 800) throw new Error('二维码已过期');
        if (code === 802) message.textContent = '已扫码，请在手机上确认';
      }
    } catch (error) { if (token === attempt) { clearLink(); image.hidden = true; message.textContent = error.message; retry.hidden = false; } }
  }
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
      const playable = song.local && Boolean(song.audio);
      const member = song.access === 'member' || song.access === 'purchase';
      const loading = downloading.has(song.sourceId);
      const downloadable = ['authorized','public'].includes(song.access) || (song.local && !playable && song.source !== 'upload');
      const label = loading ? '下载中' : busy(job) ? job.message : playable ? '播放' : downloadable ? (job?.stage === 'error' ? '重试' : song.local ? '重新制谱' : '下载') : song.source === 'upload' ? '待制谱' : song.access === 'member' ? '需会员' : song.access === 'purchase' ? '需购买' : '不可用';
      const note = busy(job) ? '' : job?.stage === 'error' ? job.message : song.local ? (playable ? (song.chart ? '已下载 · 可演奏' : '已下载 · 仅音频') : song.downloadNote || '已下载 · 等待制谱') : song.hasLyrics ? '网易云音乐' : '网易云音乐 · 暂无可用歌词';
      return `${heading}<article class="search-row"><div class="search-cover">${icon(playable ? 'music' : 'cloud')}</div><div class="search-info"><strong>${escape(song.title)}</strong>${song.hasYrc || song.timing === 'provider-character-timestamps' ? '<span class="word-badge">逐字</span>' : ''}<p>${escape(song.artist)} · ${Math.floor(song.duration / 60)}:${String(Math.floor(song.duration % 60)).padStart(2, '0')}</p><small>${escape(note)}</small></div><button class="search-action" data-song="${index}" ${loading || (!playable && !downloadable && !member) ? 'disabled' : ''} aria-label="${escape(label + ' ' + song.title)}">${loading ? '<span class="spinner"></span>' : icon(playable ? 'play' : 'download')}<span>${escape(label)}</span></button></article>${counts[next] === (shown[next] || 10) && totals[next] > counts[next] ? `<button class="load-more plain-button" data-more="${next}">加载更多 · ${titles[next]}</button>` : ''}`;
    }).join('') || '<p class="search-empty">暂时没有匹配的歌曲</p>';
    results.querySelectorAll('[data-more]').forEach(button => button.onclick = () => { shown[button.dataset.more] = (shown[button.dataset.more] || 10) + 10; render(); });
    results.querySelectorAll('button[data-song]').forEach(button => button.onclick = async () => {
      const song = songs[Number(button.dataset.song)];
      if (song.local && song.audio) { selectSong(song); return; }
      if (song.local && song.audio) {
        const preview = document.getElementById('audio-preview'), audio = preview.querySelector('audio');
        preview.querySelector('h2').textContent = song.title;
        audio.src = song.audio; preview.onclose = () => { audio.pause(); audio.removeAttribute('src'); audio.load(); };
        preview.showModal(); audio.play().catch(() => {}); return;
      }
      if (['member','purchase'].includes(song.access)) {
        if (loggedIn) { status.textContent = '当前账号未获得此录音的下载权限'; return; }
        memberDialog.showModal(); startLogin(); return;
      }
      button.disabled = true; downloading.add(song.sourceId); render();
      try {
        await downloadSong(song, message => { status.textContent = message; });
        await reloadLibrary(); downloading.delete(song.sourceId); render();
      } catch (error) { status.textContent = error.message; downloading.delete(song.sourceId); button.disabled = false; await reloadLibrary(); render(); }
    });
  }
  function runSearch() {
    clearTimeout(timer); controller?.abort(); const current = ++version;
    shown = {}; remote = []; spinner.hidden = !input.value.trim(); render(); status.textContent = input.value.trim() ? '正在查找网络歌曲…' : '已下载优先 · 网络音源：网易云音乐';
    if (!input.value.trim()) return;
    timer = setTimeout(async () => {
      controller = new AbortController();
      try {
        const data = await api('search?q=' + encodeURIComponent(input.value.trim()), { signal: controller.signal });
        if (current !== version) return;
        spinner.hidden = true; remote = data.songs; status.textContent = '已下载 → 网络逐字 → 网络普通 → 会员 · 下载后自动制谱'; render();
      } catch (error) { if (current === version && error.name !== 'AbortError') { spinner.hidden = true; status.textContent = error.message + '，本地歌曲仍可搜索'; } }
    }, 350);
  }
  input.addEventListener('input', runSearch);
  document.getElementById('catalog-search').onsubmit = event => { event.preventDefault(); runSearch(); };
  document.getElementById('song-upload').onsubmit = async event => {
    event.preventDefault(); const form = event.currentTarget, button = form.querySelector('button');
    const output = document.getElementById('upload-status'); button.disabled = true; output.textContent = '正在导入…';
    try {
      const data = new FormData(form);
      if (data.get('archive')?.size) await importArchive(data.get('archive'), message => { output.textContent = message; });
      else await importSong(data.get('audio'), data.get('lyrics'), data.get('title')?.trim() ? { title: data.get('title').trim() } : {}, message => { output.textContent = message; });
      await reloadLibrary(); render();
    } catch (error) { output.textContent = error.message; }
    finally { button.disabled = false; await reloadLibrary(); render(); }
  };
  document.addEventListener('melody-library-changed', render);
}
