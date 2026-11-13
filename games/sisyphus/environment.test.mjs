import test from 'node:test';
import assert from 'node:assert/strict';
import { biomes, sceneFor, clockFor, weatherFromCode, currentWeather, fetchLocalWeather } from './environment.mjs';
import { restore } from './state.mjs';

test('journeys cycle through 12 distinct biomes and keep weather stable across reload', () => {
  assert.equal(biomes.length, 12);
  assert.equal(new Set(biomes.map(b => b.id)).size, 12);
  const s = restore(null), loaded = restore(JSON.stringify(s));
  for (let i = 0; i < 30; i++) {
    assert.notEqual(sceneFor(i, s.environmentSeed).id, sceneFor(i + 1, s.environmentSeed).id);
    assert.deepEqual(sceneFor(i, s.environmentSeed), sceneFor(i, loaded.environmentSeed));
  }
});
test('system time follows the device clock; manual time supports day/night boundaries', () => {
  const settings = restore(null).settings;
  assert.equal(clockFor(settings, new Date(2026, 10, 12, 22, 30)).phase, 'night');
  for (const [time, phase] of [['05:00','dawn'],['08:00','day'],['17:00','dusk'],['20:00','night'],['00:00','night']]) {
    assert.equal(clockFor({...settings,clock:'manual',manualTime:time}).phase,phase);
  }
  assert.equal(restore('{"version":2,"settings":{"manualTime":"25:99"}}').settings.manualTime,'12:00');
});
test('local weather takes priority, while stale/future/disabled weather safely falls back', () => {
  const s = restore(null); s.settings.localWeather = true;
  s.weatherCache = { code:75,temperature:-2,fetchedAt:10000 };
  assert.equal(currentWeather(s,10001).weather,'snow');
  assert.match(currentWeather(s,36010001).source,/随机/);
  assert.match(currentWeather(s,9999).source,/随机/);
  s.settings.localWeather=false; assert.match(currentWeather(s,10001).source,/随机/);
  assert.equal(weatherFromCode(95),'storm'); assert.equal(weatherFromCode(61),'rain'); assert.equal(weatherFromCode(45),'fog');
});
test('weather fetch rounds coordinates, validates output and handles denied location', async () => {
  let url;
  const geo = {getCurrentPosition: ok => ok({coords:{latitude:31.23456,longitude:121.45678}})};
  const cache = await fetchLocalWeather(geo, async input => {url=input;return {ok:true,json:async()=>({current:{weather_code:61,temperature_2m:18}})};});
  assert.ok(url.includes('latitude=31.23')); assert.ok(url.includes('longitude=121.46'));
  assert.equal(cache.code,61); assert.equal('latitude' in cache,false);
  await assert.rejects(fetchLocalWeather({getCurrentPosition: (_,fail)=>fail({code:1})}),/许可/);
  await assert.rejects(fetchLocalWeather(geo,async()=>({ok:false})),/不可用/);
});
