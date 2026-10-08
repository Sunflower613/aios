import test from 'node:test';
import assert from 'node:assert/strict';
import { dailyDate, generateDaily } from './daily.mjs';
import { solve, neighbors } from './engine.mjs';
import { Session, CHALLENGE_MS } from './session.mjs';
import { readDailyResult, saveDailyResult } from './daily-score.mjs';

test('daily date changes at Beijing midnight regardless of host timezone', () => {
  assert.equal(dailyDate(new Date('2026-10-08T15:59:59Z')), '2026-10-08');
  assert.equal(dailyDate(new Date('2026-10-08T16:00:00Z')), '2026-10-09');
});

test('daily puzzles are reproducible, change with the date and have 12 connected regions and one solution', () => {
  const puzzle = generateDaily('2026-10-09');
  assert.deepEqual(generateDaily('2026-10-09'), puzzle);
  assert.notDeepEqual(generateDaily('2026-10-10'), puzzle);
  assert.equal(puzzle.size, 12); assert.equal(puzzle.regions.length, 144);
  assert.deepEqual(solve(puzzle.regions, 12), [puzzle.solution]);
  for (let color = 0; color < 12; color++) {
    const cells = puzzle.regions.flatMap((value, cell) => value === color ? [cell] : []);
    assert.ok(cells.length > 0);
    const seen = new Set([cells[0]]), queue = [cells[0]];
    for (let i = 0; i < queue.length; i++) for (const next of neighbors(queue[i], 12)) {
      if (puzzle.regions[next] === color && !seen.has(next)) { seen.add(next); queue.push(next); }
    }
    assert.equal(seen.size, cells.length);
  }
});

test('daily challenge ends after one board, retains its date, and enforces 180 seconds', () => {
  const run = new Session('daily', 'easy', '2026-10-09');
  assert.equal(run.size, 12); assert.equal(run.timed, true); assert.equal(run.lives, 3);
  run.resume(0); assert.equal(run.remaining(1000), 179000);
  assert.equal(run.finishBoard({state:'won',lives:2,found:new Set(Array.from({length:12},(_,i)=>i))}, 90000), 'end');
  assert.equal(run.state, 'won'); assert.equal(run.completed, 1); assert.equal(run.day, '2026-10-09');
  const expired = new Session('daily'); expired.resume(0);
  assert.equal(expired.expire(CHALLENGE_MS - 1), false);
  assert.equal(expired.expire(CHALLENGE_MS), true); assert.equal(expired.state, 'timeout');
  const lost = new Session('daily'); lost.resume(0);
  assert.equal(lost.finishBoard({state:'lost',lives:0,found:new Set()},1000), 'end');
  assert.equal(lost.state, 'lost');
});

test('overtime and any lost hearts each deduct only one star, including two lost hearts', () => {
  for (const overtime of [false, true]) for (const lives of [3, 2, 1]) {
    const run = new Session('daily'); run.resume(0);
    if (overtime) {
      assert.equal(run.expire(180000), true);
      assert.equal(run.continueOvertime(200000), true);
      assert.equal(run.duration(210000), 190000);
      assert.equal(run.expire(210000), false);
    }
    run.finishBoard({state:'won',lives,found:new Set(Array.from({length:12},(_,i)=>i))}, overtime ? 210000 : 10000);
    assert.equal(run.stars, 3 - Number(overtime) - Number(lives < 3));
    assert.equal(run.continueOvertime(300000), false);
  }
  const timed = new Session('timed'); timed.resume(0); timed.expire(180000);
  assert.equal(timed.continueOvertime(200000), false);
});

test('daily completion crossing the deadline is still recorded, with the timeout penalty', () => {
  const run = new Session('daily'); run.resume(0);
  run.finishBoard({state:'won',lives:3,found:new Set(Array.from({length:12},(_,i)=>i))},180001);
  assert.equal(run.state, 'won'); assert.equal(run.stars, 2);
});

test('daily results persist the best stars and time independently for each date, including zero stars', () => {
  const data = new Map();
  const storage = {getItem:k=>data.get(k)??null,setItem:(k,v)=>data.set(k,v)};
  const day = '2030-01-01';
  saveDailyResult(day, {stars:0,elapsed:240000}, storage);
  assert.equal(readDailyResult(day, storage).stars, 0);
  saveDailyResult(day, {stars:2,elapsed:220000}, storage);
  saveDailyResult(day, {stars:1,elapsed:120000}, storage);
  saveDailyResult(day, {stars:2,elapsed:200000}, storage);
  assert.deepEqual(readDailyResult(day, storage), {stars:2,elapsed:200000});
  assert.equal(readDailyResult('2030-01-02', storage), null);
  assert.equal(JSON.parse([...data.values()][0]).stars, 2);
});
