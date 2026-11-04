import test from 'node:test';
import assert from 'node:assert/strict';
import { editableLyrics, reconcileLyrics, replaceLyricLine, fillWithinLines, previousLineEnd } from './chart-editor.mjs';
test('loads timed Japanese and Chinese lyrics into editable lines', () => {
  assert.equal(editableLyrics('[0,1000](0,500,0)きみ(500,500,0)好'), 'きみ好');
  assert.equal(editableLyrics('[00:01]你好\n[00:02]世界'), '你好\n世界');
});
test('editing retains only matching prefix and updates line ownership', () => {
  const words = [{char:'你',line:0,start:1,end:2},{char:'好',line:0,start:2,end:3},{char:'呀',line:0,start:3,end:4}];
  const result = reconcileLyrics('你\n好啊', words);
  assert.equal(result.words.length,2);
  assert.equal(result.words[1].line,1);
  assert.equal(result.words[1].start,2);
  assert.equal(result.tokens[2].char,'啊');
});

test('replacing one sentence clears only that sentence and retains later timings', () => {
  const lines = [{text:'你好'},{text:'世界'},{text:'再见'}];
  const tokens = [...'你好世界再见'].map((char,i)=>({char,line:Math.floor(i/2)}));
  const words = tokens.map((token,i)=>({...token,start:i+1,end:i+1.5,lane:i%4}));
  const result = replaceLyricLine(lines,tokens,words,1,'星空啊');
  assert.equal(result.tokens.length,7);
  assert.deepEqual(result.words.slice(2,5),[null,null,null]);
  assert.deepEqual(result.words.slice(5),words.slice(4));
  assert.deepEqual(result.words.slice(0,2),words.slice(0,2));
});

test('automatic fill extends within sentence only and rewind uses prior sentence end', () => {
  const words=[{line:0,start:1,end:1.2},{line:0,start:2,end:2.5},{line:1,start:5,end:5.2}];
  const filled=fillWithinLines(words);
  assert.equal(filled[0].end,2);
  assert.equal(filled[1].end,2.5);
  assert.equal(previousLineEnd(words,1),2.5);
  assert.equal(previousLineEnd(words,0),0);
  assert.equal(words[0].end,1.2);
});
test('singer prefixes are excluded from editable lyric text', () => {
  assert.equal(editableLyrics('男：凉凉月色\n女：化作春泥\n【芳】阳光微凉\n【红】琴弦微凉\n【合】堕入尘网'), '凉凉月色\n化作春泥\n阳光微凉\n琴弦微凉\n堕入尘网');
});
