import { rollingDistance } from './terrain.mjs';
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { siteConfig } from '../../site-config.js';
import { restore, push, motion, coast, goal, power, stamina, duration, interval, attributes, skins, upgrade, equip, addDistance, reward, price, achievementGroups, achievementProgress, claimAchievement, updateProfile, think, thinkingRatio, holdSpeed, trackTime, randomizeSkin, burstChance, restart, redeemCode } from './state.mjs';
const near = (actual, expected) => assert.ok(Math.abs(actual - expected) < 1e-7, `${actual} ≠ ${expected}`);

test('clicks earn meters only; completed exponential journeys award points and carry excess', () => {
  const s = restore(null), m = motion();
  assert.equal(power(s), 1); assert.equal(duration(s), 0); assert.equal(stamina(s), 1);
  for (let i = 0; i < 59; i++) push(s, m, i);
  assert.equal(s.distance, 59); assert.equal(s.points, 0);
  push(s, m, 60); assert.equal(s.points, 10); assert.equal(s.distance, 0); assert.equal(goal(s), 120);
  addDistance(s, 121); assert.equal(s.points, 24); near(s.distance, 1); near(goal(s), 240);
  const result = addDistance(s, 750);
  assert.equal(result.rounds, 2); assert.equal(result.points, 44); near(s.distance, 31);
  const late = restore(null); late.round = 99;
  assert.equal(addDistance(late, goal(late)).rounds, 1);
  assert.equal(late.round, 100);
  assert.equal(addDistance(late, 100).rounds, 0);
});
test('inertia integrates declining current velocity, stops exactly, and is frame-rate independent', () => {
  const s = restore(null), m = motion(); push(s, m, 0); coast(s, m, 100); assert.equal(s.totalDistance, 1);
  s.levels.inertia = 1;
  push(s, m, 2); assert.equal(m.speed, 1);
  coast(s, m, 1.5); near(m.speed, .5); near(s.totalDistance, 3.125);
  coast(s, m, 10); near(s.totalDistance, 3.5); assert.equal(m.speed, 0);
  const a = restore(null), b = restore(null), ma = motion(), mb = motion();
  a.levels.inertia = b.levels.inertia = 4;
  push(a, ma, 0); push(b, mb, 0); coast(a, ma, 2);
  for (let i = 0; i < 120; i++) coast(b, mb, 1 / 60);
  near(a.totalDistance, b.totalDistance);
});
test('attributes have effects, purchases enforce cost/limit, skins charge once', () => {
  const s = restore(null); assert.equal(upgrade(s, 'strength'), false); s.points = 1000;
  for (const a of attributes) assert.ok(upgrade(s, a.id));
  near(power(s), 2); assert.equal(stamina(s), 3); assert.equal(duration(s), 3); near(interval(s), 2 / 3);
  near(goal(s), 58.8);
  const m = motion();
  near(push(s, m, 0, () => 0).meters, 4);
  near(push(s, m, 1, () => 1).meters, 2.01);
  near(push(s, m, 4, () => 1).meters, 2);
  s.distance = goal(s) - .01; const reward = addDistance(s, .01); assert.equal(reward.points, 11);
  s.levels.burst = 10; assert.equal(upgrade(s, 'burst'), false); assert.equal(upgrade(s, 'fake'), false);
  const before = s.points; equip(s, 'moss'); equip(s, 'plain'); equip(s, 'moss'); assert.equal(s.points, before - 30);
  assert.equal(equip(s, 'fake'), false);
  assert.deepEqual(restore(JSON.stringify(s)), s);
});
test('lightness settles an already reached target once without inventing mileage', () => {
  const s = restore(null); s.points = 14; addDistance(s, 59.9);
  const result = upgrade(s, 'lightness'); assert.equal(result.points, 10); assert.equal(s.round, 1);
  near(s.distance, 1.1); near(s.totalDistance, 59.9);
  assert.deepEqual(addDistance(s, 0), {rounds: 0, points: 0});
});
test('legacy saves preserve balance and skins; malformed saves safely recover', () => {
  const s = restore(JSON.stringify({total: 40, points: 10, owned: ['plain', 'moss'], selected: 'moss'}));
  assert.equal(s.points, 10); assert.equal(s.selected, 'moss'); assert.equal(s.round, 0); assert.equal(s.distance, 0);
  for (const raw of ['{', 'null', '{"owned":{"includes":1}}', '{"version":2,"points":-1,"levels":{"strength":999,"inertia":-3},"distance":-1}']) {
    const parsed = restore(raw); assert.ok(parsed.points >= 0); assert.ok(parsed.distance >= 0); assert.ok(parsed.levels.strength <= 1000);
  }
});
test('120 skins remain selectable after reload and audio preferences persist independently', () => {
  assert.equal(skins.length, 120); assert.equal(new Set(skins.map(s => s.id)).size, 120);
  const s = restore(null); s.points = 1000000;
  for (const skin of skins) { assert.ok(equip(s, skin.id)); assert.equal(restore(JSON.stringify(s)).selected, skin.id); }
  s.settings.sound = false; s.settings.music = true;
  assert.deepEqual(restore(JSON.stringify(s)).settings, s.settings);
  assert.equal(restore('{"version":2,"settings":{"motion":false}}').settings.sound, true);
});
test('Sisyphus remains last in both configuration and fallback homepage', () => {
  assert.equal(siteConfig.games.at(-1).id, 'sisyphus');
  const home = readFileSync(new URL('../../index.html', import.meta.url), 'utf8');
  assert.equal([...home.matchAll(/class="game-button" href="([^"]+)"/g)].at(-1)[1], './games/sisyphus/index.html');
});

test('achievement stages are ordered, claimable once, and survive reload', () => {
  const s = restore(null), group = achievementGroups[0];
  assert.equal(claimAchievement(s, group.id), 0);
  addDistance(s, 100);
  assert.equal(achievementProgress(s, group).ready, true);
  assert.equal(claimAchievement(s, group.id), 3);
  assert.equal(claimAchievement(s, group.id), 8);
  assert.equal(claimAchievement(s, group.id), 0);
  assert.equal(restore(JSON.stringify(s)).claimed.distance, 2);
});
test('profile stores a safe bounded name and only supported avatars', () => {
  const s = restore(null); updateProfile(s, '  山间旅人  ', '🦊');
  assert.deepEqual(restore(JSON.stringify(s)).profile, {name:'山间旅人',avatar:'🦊'});
  updateProfile(s, 'a'.repeat(100), 'invalid'); assert.equal(s.profile.name.length,16); assert.equal(s.profile.avatar,'🧗');
});
test('30 journeys remain affordable with strength spending; inertia speed is capped', () => {
  const s = restore(null);
  for (let round = 0; round < 30; round++) {
    assert.ok(goal(s) / power(s) <= 80, `journey ${round + 1} became a grind`);
    addDistance(s, goal(s));
    while (s.points >= price(s, attributes[0])) upgrade(s, 'strength');
  }
  s.levels.inertia = 20; const m = motion(); push(s,m,0);push(s,m,.001);
  assert.ok(m.speed <= power(s) * 4); assert.equal(duration(s),60);
});

test('thinking starts disabled, runs at one tenth then one half speed, and pacing targets a minute', () => {
  const s = restore(null); assert.equal(thinkingRatio(s),0);
  near(goal(s) / holdSpeed(s),60); think(s,600); assert.equal(s.totalDistance,0);
  s.levels.thinking=1; near(thinkingRatio(s),.1); think(s,600); assert.equal(s.round,1);
  const max=restore(null);max.levels.thinking=17;near(thinkingRatio(max),.5);think(max,120);assert.equal(max.round,1);
});
test('journey 100 freezes distance and timestamp; restart retains only preferences/profile', () => {
  const s=restore(null);s.round=99;s.elapsedSeconds=500;s.points=30;s.levels.thinking=1;
  addDistance(s,goal(s)+123);assert.equal(s.round,100);assert.equal(s.distance,0);assert.ok(s.finishedAt>0);
  const snapshot=JSON.stringify(s);push(s,motion(),1);think(s,100);assert.equal(JSON.stringify(s),snapshot);
  s.profile.name='旅人';s.settings.stoneVolume=63;const settings=s.settings;restart(s);
  assert.equal(s.round,0);assert.equal(s.elapsedSeconds,0);assert.equal(s.points,0);assert.equal(s.levels.thinking,0);
  assert.equal(s.profile.name,'旅人');assert.equal(s.settings,settings);assert.equal(s.settings.stoneVolume,63);
});
test('code grants exact balance once per run; replaced skins migrate ownership', () => {
  const s=restore(null);const before=s.points;assert.match(redeemCode(s,'wrong'),/不正确/);assert.equal(s.points,before);
  assert.match(redeemCode(s,'Sunflower613'),/成功/);assert.equal(s.points,999999999999);
  redeemCode(s,'Sunflower613');assert.equal(s.points,999999999999);
  const copy=restore(JSON.stringify(s));redeemCode(copy,'Sunflower613');assert.equal(copy.points,999999999999);
  const migrated=restore('{"version":2,"owned":["plain","triangle","diamond"],"selected":"triangle"}');
  assert.equal(migrated.selected,'blossom');assert.ok(migrated.owned.includes('balloon'));assert.equal(skins.some(s=>s.id==='triangle'||s.id==='diamond'),false);
});

 test('attribute caps and thinking remain independent of tapping bonuses', () => {
  const s=restore(null); s.levels.rhythm=18;s.levels.stamina=30;s.levels.inertia=20;s.levels.burst=10;
  near(interval(s),.1);near(stamina(s),60);near(duration(s),60);near(burstChance(s),1);
  near(push(s,motion(),0,()=>.999999).meters,2);
  s.levels.strength=4;s.levels.focus=10;s.levels.thinking=1;
  const before=s.totalDistance;think(s,1);near(s.totalDistance-before,1.6);
  s.levels.thinking=17;const second=s.totalDistance;think(s,1);near(s.totalDistance-second,8);
});

test('random skins default off, use owned alternatives on new journeys, and persist', () => {
 const s=restore(null);s.owned=['plain','moss','gold'];
 assert.equal(s.settings.randomSkin,false);addDistance(s,goal(s));assert.equal(s.selected,'plain');
 s.settings.randomSkin=true;addDistance(s,goal(s));assert.notEqual(s.selected,'plain');assert.ok(s.owned.includes(s.selected));
 assert.equal(restore(JSON.stringify(s)).settings.randomSkin,true);
 const chosen=s.selected;addDistance(s,1);assert.equal(s.selected,chosen);
 s.owned=['plain'];s.selected='plain';randomizeSkin(s);assert.equal(s.selected,'plain');
 s.owned=['plain','moss'];s.round=99;addDistance(s,goal(s));assert.equal(s.selected,'plain');
});

test('inertia joins the thinking floor continuously and independently of frame rate', () => {
 const a=restore(null),b=restore(null);a.levels.inertia=b.levels.inertia=1;
 const ma=motion(),mb=motion();push(a,ma,0);push(b,mb,0);
 coast(a,ma,10,.1);for(let i=0;i<600;i++)coast(b,mb,1/60,.1);
 near(ma.speed,.1);near(mb.speed,.1);near(a.totalDistance,b.totalDistance);near(a.totalDistance,3.215);
 const before=a.totalDistance;coast(a,ma,2,.1);near(a.totalDistance-before,.2);
 const idle=restore(null),mi=motion();coast(idle,mi,3,.5);near(idle.totalDistance,1.5);near(mi.speed,.5);
});
test('time and night achievements persist through restarts; only full runs count as rebirth', () => {
 const s=restore(null);trackTime(s,600,new Date(2026,0,1,23));trackTime(s,120,new Date(2026,0,2,12));
 near(s.nightSeconds,600);near(s.lifetimeSeconds,720);near(s.elapsedSeconds,720);
 assert.equal(claimAchievement(s,'night'),3);assert.equal(claimAchievement(s,'time'),5);
 restart(s);near(s.elapsedSeconds,0);near(s.nightSeconds,600);near(s.lifetimeSeconds,720);assert.equal(s.completedRuns,0);assert.equal(s.claimed.night,1);
 s.round=99;addDistance(s,goal(s));assert.equal(s.completedRuns,1);addDistance(s,1);assert.equal(s.completedRuns,1);
 trackTime(s,100,new Date());near(s.lifetimeSeconds,720);assert.equal(claimAchievement(s,'rebirth'),100);
 restart(s);assert.equal(s.completedRuns,1);assert.equal(s.claimed.rebirth,1);assert.equal(claimAchievement(s,'rebirth'),0);
 assert.deepEqual(restore(JSON.stringify(s)),s);
});

test('rolling distance follows the ball circumference at every screen size', () => {
 for(const radius of [52.27,63.7,140]){near(rollingDistance(360,radius),2*Math.PI*radius);near(rollingDistance(90,radius)*4,rollingDistance(360,radius));}
});

test('skin phrase unlocks the complete collection without spending or changing the equipped skin', () => {
 const s=restore(null);s.points=55;s.owned=['plain','moss'];s.selected='moss';
 assert.match(redeemCode(s,'必须想象西西弗斯是快乐的'),/120/);assert.equal(s.owned.length,120);assert.equal(s.points,55);assert.equal(s.selected,'moss');
 const copy=restore(JSON.stringify(s));assert.equal(copy.skinCodeRedeemed,true);assert.equal(copy.owned.length,120);assert.match(redeemCode(copy,'必须想象西西弗斯是快乐的'),/已解锁/);
 assert.match(redeemCode(copy,'Sunflower613'),/成功/);restart(copy);assert.equal(copy.skinCodeRedeemed,false);assert.equal(copy.owned.length,1);
});

test('contemplation tracks active thinking time and preserves claims across runs', () => {
 const s=restore(null);trackTime(s,30,new Date(),false);assert.equal(s.thinkingSeconds,0);
 trackTime(s,60,new Date(),true);assert.equal(s.thinkingSeconds,60);assert.equal(claimAchievement(s,'contemplation'),3);assert.equal(claimAchievement(s,'contemplation'),0);
 restart(s);assert.equal(s.thinkingSeconds,60);assert.equal(s.claimed.contemplation,1);assert.deepEqual(restore(JSON.stringify(s)),s);
 s.round=100;trackTime(s,10,new Date(),true);assert.equal(s.thinkingSeconds,60);
 assert.equal(achievementGroups.reduce((n,g)=>n+g.targets.length,0),45);
});
