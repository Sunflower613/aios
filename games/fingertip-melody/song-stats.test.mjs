import test from 'node:test';
import assert from 'node:assert/strict';
import {libraryBest,songDifficulty,chartCharacterCount} from './song-stats.mjs';

test('library shows partial-chart score without mixing rhythm records',()=>{
  const values=new Map([
    ['melody:duet:score:full:v3:partial','920000'],
    ['melody:duet:score:rating:v1:partial','S'],
    ['melody:duet:rhythm:full:v3','1000000'],
  ]),storage={getItem:key=>values.get(key)};
  assert.deepEqual(libraryBest(storage,{id:'duet'}),{score:920000,grade:'S'});
  values.set('melody:duet:score:full:v3','990000');
  values.set('melody:duet:score:rating:v1','V');
  assert.deepEqual(libraryBest(storage,{id:'duet'}),{score:990000,grade:'V'});
  assert.deepEqual(libraryBest(storage,{id:'new'}),{score:0,grade:'—'});
});
test('difficulty is mostly character count with a density adjustment',()=>{
  assert.deepEqual([200,400,650,900].map(count=>songDifficulty(count,240)),['EZ','HD','IN','AT']);
  assert.equal(songDifficulty(400,120),'HD');
  assert.equal(songDifficulty(400,60),'IN');
  assert.equal(songDifficulty(0,240),null);
  assert.equal(chartCharacterCount({lines:[{}, {playable:false}],words:[{char:'きみ好',line:0},{char:'词',line:1}]}),3);
});
