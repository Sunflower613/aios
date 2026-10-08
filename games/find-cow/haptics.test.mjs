import test from 'node:test';
import assert from 'node:assert/strict';
import {Haptics} from './haptics.mjs';

test('vibration defaults on, throttles dragging, and stops when disabled',t=>{
  const calls=[],descriptor=Object.getOwnPropertyDescriptor(globalThis,'navigator');
  Object.defineProperty(globalThis,'navigator',{configurable:true,value:{vibrate:pattern=>calls.push(pattern)}});
  t.after(()=>descriptor?Object.defineProperty(globalThis,'navigator',descriptor):delete globalThis.navigator);
  let now=0;t.mock.method(performance,'now',()=>now);
  const h=new Haptics();assert.equal(h.enabled,true);
  h.play('mark');h.play('mark');assert.deepEqual(calls,[25]);
  now=80;h.play('mark');h.play('wrong');assert.deepEqual(calls,[25,25,[50,45,50]]);
  h.setEnabled(false);h.play('correct');assert.equal(calls.at(-1),0);assert.equal(calls.length,4);
  h.setEnabled(true);h.play('correct');assert.equal(calls.at(-1),50);
  h.play('test');assert.equal(calls.at(-1),120);
});
test('unsupported or blocked vibration does not interrupt gameplay',t=>{
  const descriptor=Object.getOwnPropertyDescriptor(globalThis,'navigator');
  t.after(()=>descriptor?Object.defineProperty(globalThis,'navigator',descriptor):delete globalThis.navigator);
  Object.defineProperty(globalThis,'navigator',{configurable:true,value:{}});
  const h=new Haptics();assert.doesNotThrow(()=>h.play('win'));assert.match(h.description,/不支持/);
  Object.defineProperty(globalThis,'navigator',{configurable:true,value:{vibrate(){throw Error('blocked');}}});
  assert.doesNotThrow(()=>h.play('wrong'));assert.match(h.description,/拦截/);
  Object.defineProperty(globalThis,'navigator',{configurable:true,value:{vibrate:()=>false}});
  assert.equal(h.play('correct'),false);assert.match(h.description,/拦截/);
  Object.defineProperty(globalThis,'navigator',{configurable:true,value:{vibrate:()=>true}});
  assert.equal(h.play('correct'),true);assert.doesNotMatch(h.description,/拦截/);
});
