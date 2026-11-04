import cloud from 'NeteaseCloudMusicApi';

const pending = new Map(), sessions = new Map();
const cleanup = setInterval(() => {
  for (const store of [pending, sessions]) for (const [device, entry] of store) {
    if (entry.until <= Date.now()) store.delete(device);
  }
}, 60000);
cleanup.unref();

export function accountCookie(device) {
  const session = sessions.get(device);
  return session?.until > Date.now() ? session.cookie : '';
}
export async function loginAction(action, device) {
  if (action === 'logout') {
    pending.delete(device); sessions.delete(device);
    return { loggedIn: false };
  }
  if (action === 'start') {
    const key = (await cloud.login_qr_key()).body.data.unikey;
    if (!key) throw new Error('网易云暂未返回登录二维码');
    const { qrimg, qrurl } = (await cloud.login_qr_create({ key, qrimg: true, platform: 'web' })).body.data;
    pending.set(device, { key, until: Date.now() + 180000 });
    return { qrimg, qrurl };
  }
  if (action === 'state') return { loggedIn: Boolean(accountCookie(device)) };
  const entry = pending.get(device);
  if (!entry || entry.until <= Date.now()) return { code: 800 };
  const { body, cookie } = await cloud.login_qr_check({ key: entry.key });
  if (pending.get(device) !== entry) return { code: 800 };
  if (body.code === 803) {
    const value = cookie.map(item => item.split(';')[0]).join('; ');
    if (!/(^|; )MUSIC_U=.+/.test(value)) throw new Error('网易云未返回有效登录凭据');
    sessions.set(device, { cookie: value, until: Date.now() + 24 * 3600000 });
    pending.delete(device);
  }
  if (![800,801,802,803].includes(body.code)) throw new Error('网易云登录状态查询失败');
  return { code: body.code };
}
export async function downloadUrl(id, cookie) {
  const { body } = await cloud.song_download_url_v1({ id, cookie, level: 'standard' });
  const track = body.data;
  if (!track?.url || track.freeTrialInfo || (track.code && track.code !== 200)) return null;
  const url = new URL(track.url);
  if (!/\.(126\.net|163\.com)$/.test(url.hostname) || !['http:', 'https:'].includes(url.protocol)) return null;
  url.protocol = 'https:';
  return url.href;
}
export async function memberLyrics(id, cookie) {
  return (await cloud.lyric_new({ id, cookie })).body;
}
