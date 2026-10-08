import test from 'node:test';
import assert from 'node:assert/strict';
import {autoColor,validatePuzzle,encodePuzzle,decodePuzzle,blockedByCow,colors} from './puzzle.mjs';
import {detectBoard,recognizeRegions} from './recognition.mjs';
import {Session} from './session.mjs';

test('custom maps preserve cows and uniquely connected regions at every supported size; codes round-trip',()=>{
  let seed=12345;const random=()=>((seed=Math.imul(seed,1664525)+1013904223>>>0)/4294967296);
  for(const size of [6,8,10,12]){
    const cols=[...Array.from({length:size/2},(_,i)=>i*2+1),...Array.from({length:size/2},(_,i)=>i*2)];
    const cows=cols.map((c,r)=>r*size+c),map=autoColor(size,cows,random);
    assert.deepEqual(validatePuzzle(map).solution,cows);
    const code=encodePuzzle(map);assert.deepEqual(decodePuzzle(` \n${code}\n `),map);
    assert.ok(code.startsWith('C2'));
    assert.ok(code.length < size*size+16);
    assert.throws(()=>decodePuzzle(code.slice(0,-1)+'z'),/损坏/);
  }
});
test('obsolete share codes and unsupported versions are rejected',()=>{
  const old='COW1.6.001002001102000002304442004545004555.9f120a06';
  assert.throws(()=>decodePuzzle(old),/格式不支持/);
  assert.throws(()=>decodePuzzle('C3OGcNSVBbuFhduyg.11Pf'),/格式不支持/);
  assert.throws(()=>decodePuzzle('C2OGcNSVBbuFhduyg.11Pf.extra'),/损坏/);
});
test('invalid and ambiguous imported maps are rejected; cow placement excludes conflicts',()=>{
  assert.throws(()=>decodePuzzle('C2.bad'),/损坏/);
  assert.throws(()=>validatePuzzle({size:6,regions:Array(36).fill(-1)}),/填色/);
  assert.throws(()=>validatePuzzle({size:6,regions:Array.from({length:36},(_,i)=>Math.floor(i/6))}),/多个解/);
  assert.throws(()=>autoColor(6,[0,7,14,21,28,35]),/相邻/);
  assert.equal(blockedByCow(7,[0],6),true);
  assert.equal(blockedByCow(8,[0],6),false);
});
test('screenshot recognition detects a board and preserves color groups despite white center marks',()=>{
  const size=12,cell=24,width=320,height=400,data=new Uint8ClampedArray(width*height*4).fill(255);
  for(let r=0;r<size;r++)for(let c=0;c<size;c++){
    const rgb=colors[(r+c)%size].slice(1).match(/../g).map(v=>parseInt(v,16));
    for(let y=0;y<cell-2;y++)for(let x=0;x<cell-2;x++){
      if(x>8&&x<15&&y>8&&y<15)continue;
      const p=((50+r*cell+y)*width+16+c*cell+x)*4;data.set([...rgb,255],p);
    }
  }
  const image={data,width,height},rect=detectBoard(image),regions=recognizeRegions(image,rect,size);
  assert.equal(rect.x,16);assert.equal(rect.y,50);
  assert.equal(new Set(regions).size,size);
  for(let r=0;r<size;r++)for(let c=0;c<size;c++)assert.equal(regions[r*size+c],regions[(r+c)%size]);
});
test('custom sessions end after one map and never award daily stars',()=>{
  const s=new Session('custom');s.customSize=12;s.resume(0);
  assert.equal(s.size,12);assert.equal(s.timed,false);
  assert.equal(s.finishBoard({state:'won',found:new Set([1]),lives:3},1000),'end');
  assert.equal(s.state,'won');assert.equal(s.stars,null);
});
