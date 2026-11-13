import { sceneFor, sceneryMarkup, currentWeather, clockFor, weatherNames, fetchLocalWeather } from './environment.mjs';

export function createWorld(state, save) {
  const $ = id => document.getElementById(id);
  let lastBiome, signature, requestId = 0, busy = false, retryAfter = 0;
  const particles = Array.from({ length: 28 }, (_, i) => {
    const particle = document.createElement('i');
    particle.style.cssText = `--x:${(i * 37 + 11) % 100}%;--delay:${-i * .41}s;--duration:${2.5 + i % 7 * .35}s;--size:${2 + i % 4}px`;
    return particle;
  });
  $('weather-particles').append(...particles);
  function controls() {
    $('system-clock').checked = state.settings.clock === 'system';
    $('manual-time-row').hidden = state.settings.clock === 'system';
    $('manual-time').value = state.settings.manualTime;
    $('local-weather').checked = state.settings.localWeather;
  }
  async function refresh() {
    const id = ++requestId; busy = true;
    state.settings.localWeather = true; controls(); save();
    $('refresh-weather').disabled = true; $('weather-status').textContent = '正在获取定位与当地天气…';
    try {
      const cache = await fetchLocalWeather();
      if (id !== requestId) return;
      state.weatherCache = cache; save();
      $('weather-status').textContent = `已更新 · ${cache.temperature}°C · ${new Date(cache.fetchedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    } catch (error) {
      if (id !== requestId) return;
      state.weatherCache = null; save(); retryAfter = Date.now() + 600000;
      $('weather-status').textContent = error.name === 'AbortError' ? '天气请求超时，已使用随机天气。' : error.message || '天气获取失败，已使用随机天气。';
    } finally {
      if (id === requestId) { busy = false; $('refresh-weather').disabled = false; signature = null; update(); }
    }
  }
  $('refresh-weather').addEventListener('click', refresh);
  $('local-weather').addEventListener('change', event => {
    if (event.target.checked) void refresh();
    else {
      requestId++; busy = false; state.settings.localWeather = false;
      $('refresh-weather').disabled = false; $('weather-status').textContent = '当前使用群系随机天气';
      save(); signature = null; update();
    }
  });
  $('system-clock').addEventListener('change', event => {
    state.settings.clock = event.target.checked ? 'system' : 'manual'; controls(); save(); update();
  });
  $('manual-time').addEventListener('change', event => {
    if (!/^(?:[01]\d|2[0-3]):[0-5]\d$/.test(event.target.value)) return;
    state.settings.manualTime = event.target.value; save(); update();
  });
  async function refreshIfPermitted() {
    if (!state.settings.localWeather || busy || Date.now() < retryAfter || !navigator.permissions) return;
    if (state.weatherCache && Date.now() - state.weatherCache.fetchedAt < 1800000) return;
    retryAfter = Date.now() + 600000;
    try {
      const permission = await navigator.permissions.query({ name: 'geolocation' });
      if (permission.state === 'granted' && state.settings.localWeather && !busy) void refresh();
    } catch { /* Only an explicit click may open a permission prompt. */ }
  }
  function update() {
    const scene = sceneFor(state.round, state.environmentSeed), clock = clockFor(state.settings), weather = currentWeather(state);
    const next = `${scene.id}-${clock.text}-${clock.manual}-${weather.weather}-${weather.source}-${weather.temperature}`;
    if (next !== signature) {
      signature = next;
      const body = document.body;
      body.dataset.biome = scene.id; body.dataset.phase = clock.phase; body.dataset.weather = weather.weather;
      for (const key of ['sky', 'horizon', 'hill', 'dark', 'foliage']) body.style.setProperty(`--scene-${key}`, scene[key]);
      body.style.setProperty('--sun-x', `${15 + ((clock.hour + 18) % 24) / 24 * 65}%`);
      if (lastBiome !== scene.id) { $('scenery').innerHTML = sceneryMarkup(scene.kind); lastBiome = scene.id; }
      $('scene-label').textContent = `${scene.name} · ${clock.text} · ${weatherNames[weather.weather]}`;
      $('scene-label').title = `${weather.source}${weather.temperature == null ? '' : ` ${weather.temperature}°C`}`;
      $('clock-status').textContent = `${clock.manual ? '固定时间' : '设备时间'} ${clock.text} · ${({ dawn: '清晨', day: '白天', dusk: '黄昏', night: '夜晚' })[clock.phase]}`;
      void refreshIfPermitted();
    }
    return weather.weather;
  }
  controls();
  if (state.settings.localWeather) $('weather-status').textContent = state.weatherCache ? `最近更新 ${new Date(state.weatherCache.fetchedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} · ${state.weatherCache.temperature}°C` : '未有实况数据，暂用随机天气';
  update(); return { update };
}
