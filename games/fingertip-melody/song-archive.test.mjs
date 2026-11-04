import test from 'node:test';
import assert from 'node:assert/strict';
import { zipSync, strToU8 } from './vendor/fflate.mjs';
import { importArchive } from './song-archive.mjs';

const archive = files => new File([zipSync(Object.fromEntries(Object.entries(files).map(([name, value]) => [name, value instanceof Uint8Array ? value : strToU8(value)])))], 'songs.zip', { type: 'application/zip' });

test('ZIP manifest imports multiple audio files with their own lyric and chart', async () => {
  const chart = { version: 2, words: [{ char: '你', start: 0, end: 1, line: 0 }] };
  const file = archive({
    'melody-manifest.json': JSON.stringify({ songs: [
      { song: { title: '一' }, audio: 'one.mp3', lyrics: 'one.yrc', chart: 'one.chart.json' },
      { song: { title: '二' }, audio: 'two.wav', lyrics: 'two.lrc' }
    ] }),
    'one.mp3': new Uint8Array([1, 2]), 'one.yrc': '[0,1000](0,1000,0)你',
    'one.chart.json': JSON.stringify(chart), 'two.wav': new Uint8Array([3, 4]), 'two.lrc': '[00:00]你好'
  });
  const received = [];
  const result = await importArchive(file, () => {}, async (audio, lyric, metadata) => received.push({ name: audio.name, lyric: await lyric.text(), metadata }));
  assert.equal(result.imported, 2);
  assert.deepEqual(received.map(item => item.name), ['one.mp3', 'two.wav']);
  assert.equal(received[0].metadata.chart.words[0].char, '你');
  assert.equal(received[1].lyric, '[00:00]你好');
});

test('ZIP without manifest pairs same-name files and song JSON', async () => {
  const file = archive({ 'a/歌.mp3': new Uint8Array([1]), 'a/歌.yrc': '[0,100](0,100,0)好', 'a/歌.json': '{"artist":"某歌手","mood":"rain"}' });
  let metadata;
  const result = await importArchive(file, () => {}, async (_audio, _lyric, info) => { metadata = info; });
  assert.equal(result.imported, 1);
  assert.equal(metadata.artist, '某歌手');
  assert.equal(metadata.mood, 'rain');
});
