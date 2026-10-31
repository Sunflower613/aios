import test from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { mkdtemp, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { mergeResults, resourceGroup } from './catalog.mjs';
import { accessFor, validId } from './scripts/netease.mjs';
import { createServer, allowedOrigin, safeStaticPath, yrcToLrc, receiveUpload } from './scripts/server.mjs';

test('local > public YRC > public LRC > membership, with recording-specific deduplication', () => {
  const track = (id, props = {}) => ({ source: 'netease', sourceId: id, title: '光年之外', artist: '甲', ...props });
  const local = [track('1'), track('5', { available: false }), track('6', { title: '其他歌' })];
  const remote = [track('4', { access: 'member', hasYrc: true }), track('3', { access: 'public' }), track('2', { access: 'public', hasYrc: true }), track('1'), track('1', { source: 'other', access: 'public' })];
  const result = mergeResults(local, remote, ' 光年 ');
  assert.deepEqual(result.map(s => resourceGroup(s)), ['local', 'yrc', 'audio', 'audio', 'member']);
  assert.equal(result.filter(s => s.sourceId === '1').length, 2);
});
test('unavailable audio is not automatically labelled membership', () => {
  assert.equal(accessFor(true, 8), 'public');
  assert.equal(accessFor(true, 1), 'public');
  assert.equal(accessFor(false, 0), 'unavailable');
  assert.equal(accessFor(false, 1), 'member');
  assert.equal(accessFor(false, 4), 'purchase');
  assert.throws(() => validId('../secret'));
});
test('YRC import keeps sentence timing; invalid uploads are rejected before file writes', async () => {
  assert.equal(yrcToLrc('[61234,800](61234,300,0)花(61534,500,0)开'), '[01:01.234]花开');
  const form = new FormData();
  form.set('audio', new Blob(['invalid']), 'secret.exe');
  await assert.rejects(receiveUpload(form), /格式/);
  form.set('audio', new Blob(['invalid']), 'song.mp3'); form.set('lyrics', new Blob(['untimed text']), 'song.lrc');
  await assert.rejects(receiveUpload(form), /时间轴/);
});
test('local server denies traversal, model folders and remote origins', async () => {
  const root = path.resolve(fileURLToPath(new URL('../../', import.meta.url)));
  for (const pathname of ['/../secret', '/%2e%2e/secret', '/games/fingertip-melody/.venv/a', '/game-api/server.js', '/games/fingertip-melody/scripts/align.py']) assert.equal(await safeStaticPath(root, pathname), null);
  assert.equal(await safeStaticPath(root, '/games/fingertip-melody/index.html'), path.join(root, 'games/fingertip-melody/index.html'));
  assert.equal(allowedOrigin('https://localhost.evil.test'), false);
  assert.equal(allowedOrigin('http://127.0.0.1:8765'), true);
});
test('legacy download API rejects cross-site requests and cannot change the shared library', async t => {
  const server = createServer();
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  t.after(() => new Promise(resolve => server.close(resolve)));
  const url = `http://127.0.0.1:${server.address().port}/api/melody/download`;
  const post = headers => fetch(url, { method: 'POST', headers, body: '{}' });
  assert.equal((await post({ Origin: 'https://evil.test', 'Content-Type': 'application/json' })).status, 403);
  assert.equal((await post({ 'Content-Type': 'text/plain' })).status, 410);
  assert.equal((await post({ 'Content-Type': 'application/json' })).status, 410);
  assert.equal((await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({source: 'netease', id: '../foo'}) })).status, 410);
});
test('deployed API accepts the configured site and isolates uploaded catalog/media by browser cookie', async t => {
  const folder = await mkdtemp(path.join(tmpdir(), 'melody-http-'));
  const owner = 'a'.repeat(64), stranger = 'b'.repeat(64);
  await writeFile(path.join(folder, 'private.mp3'), 'audio fixture');
  const songs = [{source:'netease',sourceId:'1',audio:'./media/public.mp3'}, {source:'upload',sourceId:'private',owner,title:'Private title',audio:'./media/private.mp3'}];
  const server = createServer({origins:['https://game.example'],readCatalog:async()=>songs,mediaRoot:folder});
  await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
  t.after(async()=>{await new Promise(resolve=>server.close(resolve)); assert.equal(path.dirname(path.resolve(folder)),path.resolve(tmpdir())); await rm(folder,{recursive:true});});
  const base=`http://127.0.0.1:${server.address().port}/api/melody/`;
  const headers={Origin:'https://game.example',Cookie:`melody_device=${owner}`};
  const allowed=await fetch(base+'library',{headers});
  assert.equal(allowed.status,200); assert.equal(allowed.headers.get('access-control-allow-credentials'),'true');
  const library=(await allowed.json()).songs;
  assert.equal(library.length,2); assert.equal(library[1].owner,undefined); assert.equal(library[1].audio,'/api/melody/media/private.mp3');
  assert.equal((await fetch(base+'media/private.mp3',{headers})).status,200);
  const other={...headers,Cookie:`melody_device=${stranger}`};
  assert.equal((await (await fetch(base+'library',{headers:other})).json()).songs.length,1);
  assert.equal((await fetch(base+'media/private.mp3',{headers:other})).status,404);
  assert.equal((await fetch(base+'library',{headers:{Origin:'https://evil.example'}})).status,403);
  assert.equal((await fetch(base+'download',{method:'POST',headers:{'Content-Type':'application/json'},body:'{}'})).status,403);
  const fresh=await fetch(base+'health'); assert.match(fresh.headers.get('set-cookie'),/HttpOnly; SameSite=Lax/); assert.match(fresh.headers.get('set-cookie'),/Secure/);
});
