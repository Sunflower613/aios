const local = typeof location !== 'undefined' && ['127.0.0.1', 'localhost', '[::1]'].includes(location.hostname);
const base = local && location.port !== '8765'
  ? 'http://' + (location.hostname === 'localhost' ? 'localhost' : '127.0.0.1') + ':8765'
  : '';

export async function catalogApi(route, options = {}) {
  const response = await fetch(base + '/api/melody/' + route, {
    cache: 'no-store', credentials: 'include', signal: AbortSignal.timeout(60000), ...options
  });
  if (!response.headers.get('content-type')?.includes('application/json')) throw new Error('站点曲库接口不可用，请检查服务地址');
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || '曲库服务暂时不可用');
  if (route === 'library' && base) {
    for (const song of data.songs) {
      for (const key of ['audio', 'lyrics', 'chart']) {
        if (song[key]) song[key] = new URL(song[key], base + '/games/fingertip-melody/').href;
      }
    }
  }
  return data;
}

export async function catalogBlob(route) {
  const response = await fetch(`${base}/api/melody/${route}`, { credentials: 'include', signal: AbortSignal.timeout(120000) });
  if (!response.ok) throw new Error('音频下载失败，请稍后重试');
  if (!response.headers.get('content-type')?.startsWith('audio/')) throw new Error('音源没有返回可下载音频');
  const blob = await response.blob(); if (blob.size > 80 * 1024 * 1024) throw new Error('音频超过 80MB'); return blob;
}
