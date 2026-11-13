import test from 'node:test';
import assert from 'node:assert/strict';
import { dailyEvents, freeSkinIds, localDateKey } from './festivals.mjs';
import { skins, restore, claimDailySkin, equip } from './state.mjs';
const day = text => new Date(`${text}T12:00:00`);
test('calendar matches traditional dates and solar terms, without conflating equinox and mid-autumn',()=>{
 // 2026 reference: Hong Kong Observatory Gregorian–Lunar conversion table.
 // https://www.hko.gov.hk/en/gts/time/calendar/pdf/files/2026e.pdf
 for(const [date,id] of [['2026-02-04','lichun'],['2026-02-17','springfestival'],['2026-03-03','lanternfestival'],['2026-06-19','dragonboat'],['2026-09-25','midautumn'],['2026-12-25','christmas']]) assert.ok(freeSkinIds(day(date)).includes(id));
 assert.ok(freeSkinIds(day('2026-09-25')).includes('qiufen'));
 assert.equal(dailyEvents(day('2026-09-23')).some(e=>e.name==='中秋节'),false);
 assert.equal(freeSkinIds(day('2026-12-24')).includes('christmas'),false);
 assert.equal(localDateKey(day('2026-12-25')),'2026-12-25');
 assert.deepEqual(dailyEvents(new Date(NaN)),[]);
});
test('all 24 term dates have a unique skin; every event reward exists',()=>{
 const found=new Set();
 for(let m=0;m<12;m++)for(let d=1;d<=new Date(2026,m+1,0).getDate();d++) {
  for(const id of freeSkinIds(new Date(2026,m,d,12))) {
   const skin=skins.find(s=>s.id===id);assert.ok(skin);if(skin.category==='节气')found.add(id);
  }
 }
 assert.equal(found.size,24);
});
test('daily claim is free and idempotent, validates the date, and shares ownership across categories',()=>{
 const s=restore(null);s.points=3;s.settings.clock='manual';s.settings.manualTime='00:00';
 assert.equal(claimDailySkin(s,'christmas',day('2026-12-24')),false);
 assert.equal(claimDailySkin(s,'christmas',day('2026-12-25')),true);assert.equal(s.points,3);assert.equal(s.selected,'plain');
 assert.equal(claimDailySkin(s,'christmas',day('2026-12-25')),false);assert.equal(claimDailySkin(s,'fake',day('2026-12-25')),false);
 assert.ok(restore(JSON.stringify(s)).owned.includes('christmas'));
 const lotus=skins.find(s=>s.id==='lixia');assert.ok(lotus.categories.includes('节气'));assert.ok(lotus.categories.includes('花朵'));
 s.points=10000;assert.ok(equip(s,'lixia'));const remaining=s.points;assert.ok(equip(s,'lixia'));assert.equal(s.points,remaining);assert.equal(s.owned.filter(id=>id==='lixia').length,1);
 assert.equal(skins.length,120);assert.equal(skins.filter(s=>s.category==='花朵').length,12);
});
