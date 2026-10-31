let base = '';
const local = typeof location !== 'undefined' && ['127.0.0.1', 'localhost', '[::1]'].includes(location.hostname);
export async function catalogApi(route, options = {}) {
  const candidates = local && location.port !== '8765' ? [...new Set([base, 'http://127.0.0.1:8765'])] : [base];
  for (const candidate of candidates) {
    let response;
    try { response = await fetch(`${candidate}/api/melody/${route}`, { cache: 'no-store', credentials: 'include', signal: AbortSignal.timeout(60000), ...options }); }
    catch (error) { if (error.name === 'AbortError') throw error; continue; }
    if (!response.headers.get('content-type')?.includes('application/json') || response.status === 404) continue;
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || '曲库服务暂时不可用');
    base = candidate;
    if (route === 'library' && base) data.songs = data.songs.map(song => ({ ...song, ...Object.fromEntries(['audio', 'lyrics', 'chart'].filter(key => song[key]).map(key => [key, new URL(song[key], base + '/games/fingertip-melody/').href])) }));
    return data;
  }
  throw new Error(local ? '开发曲库服务未启动，请运行“启动曲库.cmd”' : '站点曲库服务暂不可用，请稍后重试');
}

export async function catalogBlob(route) {
  const response = await fetch(`${base}/api/melody/${route}`, { credentials: 'include', signal: AbortSignal.timeout(120000) });
  if (!response.ok) throw new Error('音频下载失败，请稍后重试');
  if (!response.headers.get('content-type')?.startsWith('audio/')) throw new Error('音源没有返回可下载音频');
  const blob = await response.blob(); if (blob.size > 80 * 1024 * 1024) throw new Error('音频超过 80MB'); return blob;
}
