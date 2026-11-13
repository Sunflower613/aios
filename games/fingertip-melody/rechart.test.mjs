import test from 'node:test';
import assert from 'node:assert/strict';
import {alignmentLyrics,regenerateChart} from './rechart.mjs';

test('rechart uses edited lyrics and measured sentence anchors',()=>{
  assert.equal(alignmentLyrics([{text:'男：你好',time:1},{text:'世界',time:4}],[null,{line:0,start:2}],10),'[00:02.000]你好\n[00:04.000]世界');
  assert.equal(alignmentLyrics([{text:'你'},{text:'好'}],[],10),'[00:00.000]你\n[00:05.000]好');
  assert.throws(()=>alignmentLyrics([{text:'你',time:4},{text:'好',time:2}],[],10),/时间顺序/);
});
test('rechart uploads original audio and validates returned alignment identity',async()=>{
  const bytes=new TextEncoder().encode('original-audio').buffer;
  const hash=Buffer.from(await crypto.subtle.digest('SHA-256',bytes)).toString('hex');
  const chart={version:2,audioSha256:hash,lines:[{text:'你',time:1}],words:[{char:'你',line:0,start:1,end:2}]};
  const result=await regenerateChart(bytes,chart.lines,chart.words,5,async(route,options)=>{
    assert.equal(route,'prepare');assert.equal(options.method,'POST');
    assert.equal(options.body.get('preserveAudio'),'1');
    assert.equal(await options.body.get('audio').text(),'original-audio');
    assert.equal(await options.body.get('lyrics').text(),'[00:01.000]你');
    return {chart};
  });
  assert.equal(result.chart,chart);
  await assert.rejects(regenerateChart(bytes,chart.lines,chart.words,5,async()=>({chart:{...chart,audioSha256:'wrong'}})),/不同音频/);
  await assert.rejects(regenerateChart(bytes,[{text:'きみ',time:1}],[],5,()=>{throw Error('must not upload');}),/日文/);
});
