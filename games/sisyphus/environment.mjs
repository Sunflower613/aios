export const biomes = [
  { id: 'highland', name: '荒山旷野', sky: '#d9bc91', horizon: '#f8e6c4', hill: '#a58b64', dark: '#70634b', foliage: '#81765a', kind: 'mountain', weather: ['clear', 'cloudy', 'wind', 'fog'] },
  { id: 'snow', name: '雪峰山脉', sky: '#aecbdf', horizon: '#eef5f6', hill: '#dee8e9', dark: '#8cabb9', foliage: '#7894a3', kind: 'snow', weather: ['snow', 'clear', 'cloudy', 'fog'] },
  { id: 'desert', name: '金色沙漠', sky: '#e6bf88', horizon: '#ffedc9', hill: '#dbb372', dark: '#a57a43', foliage: '#b9955d', kind: 'dunes', weather: ['clear', 'wind', 'clear', 'cloudy'] },
  { id: 'jungle', name: '热带雨林', sky: '#94b6a8', horizon: '#d2e4c8', hill: '#77956b', dark: '#3d634b', foliage: '#416f56', kind: 'forest', weather: ['rain', 'fog', 'cloudy', 'clear'] },
  { id: 'coast', name: '潮汐海岸', sky: '#a6ced8', horizon: '#e9eee0', hill: '#c1b793', dark: '#7b8b82', foliage: '#518d9c', kind: 'sea', weather: ['wind', 'clear', 'rain', 'cloudy'] },
  { id: 'volcano', name: '玄武岩谷', sky: '#c3a195', horizon: '#e4c4a8', hill: '#7e716a', dark: '#443f3e', foliage: '#775e57', kind: 'volcano', weather: ['cloudy', 'wind', 'clear', 'fog'] },
  { id: 'bamboo', name: '青竹秘境', sky: '#a8c4aa', horizon: '#e3edcc', hill: '#97a77a', dark: '#526e46', foliage: '#4c7754', kind: 'bamboo', weather: ['fog', 'rain', 'clear', 'cloudy'] },
  { id: 'cherry', name: '樱花山谷', sky: '#d9bbcf', horizon: '#f9e6d9', hill: '#c8aa9a', dark: '#947c74', foliage: '#d993af', kind: 'cherry', weather: ['clear', 'wind', 'cloudy', 'rain'] },
  { id: 'meadow', name: '高山草甸', sky: '#afcdd6', horizon: '#e8efcf', hill: '#a5b47b', dark: '#647d4f', foliage: '#8ca371', kind: 'meadow', weather: ['clear', 'cloudy', 'wind', 'rain'] },
  { id: 'badlands', name: '赤陶恶地', sky: '#d5b39c', horizon: '#f3dec1', hill: '#ba805c', dark: '#805444', foliage: '#ab7354', kind: 'mesa', weather: ['wind', 'clear', 'cloudy', 'clear'] },
  { id: 'swamp', name: '幽光沼泽', sky: '#9eaca4', horizon: '#ced2b9', hill: '#88927a', dark: '#4d5b4e', foliage: '#566f59', kind: 'swamp', weather: ['fog', 'rain', 'cloudy', 'clear'] },
  { id: 'icefield', name: '冰刺原野', sky: '#9fc9d6', horizon: '#e6f3f1', hill: '#b9d7da', dark: '#729ba9', foliage: '#7caebd', kind: 'ice', weather: ['snow', 'wind', 'clear', 'cloudy'] },
];
export const weatherNames = { clear: '晴朗', cloudy: '多云', wind: '起风', fog: '薄雾', rain: '降雨', snow: '飘雪', storm: '雷雨' };
export function sceneFor(round, seed) {
  const biome = biomes[round % biomes.length];
  let hash = (seed ^ Math.imul(round + 1, 2654435761)) >>> 0;
  hash = Math.imul(hash ^ (hash >>> 16), 2246822507) >>> 0;
  return { ...biome, weather: biome.weather[hash % biome.weather.length] };
}
export function weatherFromCode(code) {
  if (code >= 95) return 'storm';
  if ([71, 73, 75, 77, 85, 86].includes(code)) return 'snow';
  if (code >= 51) return 'rain';
  if (code === 45 || code === 48) return 'fog';
  return code === 0 ? 'clear' : 'cloudy';
}
export function clockFor(settings, date = new Date()) {
  const manual = settings.clock === 'manual';
  const [h, m] = manual ? settings.manualTime.split(':').map(Number) : [date.getHours(), date.getMinutes()];
  const hour = h + m / 60;
  const phase = hour < 5 || hour >= 20 ? 'night' : hour < 8 ? 'dawn' : hour < 17 ? 'day' : 'dusk';
  return { hour, phase, text: `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`, manual };
}
export function currentWeather(state, now = Date.now()) {
  const cache = state.weatherCache;
  if (state.settings.localWeather && cache && now >= cache.fetchedAt && now - cache.fetchedAt < 3600000) {
    return { weather: weatherFromCode(cache.code), source: '当地天气', temperature: cache.temperature };
  }
  return { weather: sceneFor(state.round, state.environmentSeed).weather, source: state.settings.localWeather ? '随机天气 · 实况待更新' : '随机天气' };
}
export async function fetchLocalWeather(geolocation = navigator.geolocation, fetcher = fetch) {
  if (!geolocation) throw new Error('此浏览器不支持定位，请继续使用随机天气。');
  const position = await new Promise((resolve, reject) => geolocation.getCurrentPosition(resolve,
    error => reject(new Error(error.code === 1 ? '未获定位许可，已保留随机天气。' : '暂时无法定位，请稍后重试。')),
    { enableHighAccuracy: false, timeout: 10000, maximumAge: 300000 }));
  const latitude = position.coords.latitude.toFixed(2), longitude = position.coords.longitude.toFixed(2);
  const controller = new AbortController(), timer = setTimeout(() => controller.abort(), 10000);
  try {
    const response = await fetcher(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,weather_code&timezone=auto`, { signal: controller.signal });
    if (!response.ok) throw new Error('天气服务暂不可用，已保留随机天气。');
    const data = (await response.json()).current;
    if (!Number.isInteger(data?.weather_code) || !Number.isFinite(data?.temperature_2m)) throw new Error('天气数据不完整，请稍后重试。');
    return { code: data.weather_code, temperature: data.temperature_2m, fetchedAt: Date.now() };
  } finally { clearTimeout(timer); }
}

const mountain = '<path d="M0 470 130 180 270 410 430 100 600 400 750 140 1000 440V700H0Z"/>';
function trees(kind) {
  return Array.from({ length: 18 }, (_, i) => {
    const x = i * 64 - 30, y = 340 + Math.sin(i * 2) * 80, h = 80 + (i * 31 % 100);
    if (kind === 'bamboo') return `<g transform="translate(${x} ${y})"><path d="M0 180V-${h}m18 180V-${h - 20}" stroke="currentColor" stroke-width="8"/><path d="m0 0-30-20 30 6 35-40-25 43m10-60-40-20 40 4 25-25-15 35"/></g>`;
    const crown = kind === 'cherry' ? `<ellipse cy="-${h / 3}" rx="45" ry="38"/><circle cx="-25" cy="-${h / 2}" r="25"/>`
      : kind === 'swamp' ? `<ellipse cy="-${h / 3}" rx="50" ry="23"/><path d="m-40-${h / 3}v80m20-80v100m45-100v80" stroke="currentColor" stroke-width="3" fill="none"/>`
        : `<ellipse cy="-${h / 3}" rx="40" ry="55"/><circle cx="20" cy="-${h / 2}" r="35"/>`;
    return `<g transform="translate(${x} ${y})"><path d="M-5 160 0-${h} 7 160Z"/>${crown}</g>`;
  }).join('');
}
export function sceneryMarkup(kind) {
  let shape = mountain;
  if (['forest', 'bamboo', 'cherry', 'swamp'].includes(kind)) shape = trees(kind);
  if (kind === 'dunes') shape = '<path d="M0 410Q180 210 350 410T700 390T1100 370V700H0Z"/><path d="M0 500Q250 300 470 490T1000 400V700H0Z" opacity=".55"/>';
  if (kind === 'snow') shape += '<path d="m130 180-47 100 49-22 27 25 16-27Zm300-80-78 132 67-37 24 32 45-42Zm320 40-62 116 62-35 40 30Z" fill="#f4f8f5" opacity=".9"/>';
  if (kind === 'sea') shape = '<path d="M0 330h1000v370H0Z" opacity=".3"/><path d="M0 390q120-20 240 0t240 0t240 0t280 0m-900 50q180-20 360 0t420 0" stroke="currentColor" stroke-width="3" fill="none"/><path d="M0 470 80 260 160 250 230 470Zm740 0 80-220 110 10 70 210Z"/>';
  if (kind === 'volcano') shape = '<path d="m0 530 340-320 80 20 70-20 380 320Z"/><path d="m340 210 80 20 70-20-42 70-20-28-15 72-25-80Z" fill="#df9263"/>';
  if (kind === 'mesa') shape = '<path d="M0 530 90 310 220 310 280 500 410 250 590 250 670 500 800 340 940 340 1000 530V700H0Z"/><path d="M40 420h220m120-70h250m-260 60h280m100 40h220" stroke="#f3d3aa" stroke-width="12" opacity=".4"/>';
  if (kind === 'meadow') shape = '<path d="M0 440Q160 230 350 400T700 420T1100 310V700H0Z"/>';
  if (kind === 'ice') shape = Array.from({ length: 14 }, (_, i) => `<path d="m${i * 80 - 40} 600 35-${180 + i * 43 % 220} 38 ${180 + i * 43 % 220}Z"/>`).join('');
  return `<svg viewBox="0 0 1000 700" preserveAspectRatio="xMidYMid slice" aria-hidden="true"><g fill="currentColor">${shape}</g></svg>`;
}
