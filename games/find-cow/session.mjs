import { levels } from './engine.mjs?v=2';
import { dailyDate } from './daily.mjs?v=2';

export const CHALLENGE_MS = 180_000;

// Generation pauses the clock; opening settings does not.
export class Session {
  constructor(mode = 'classic', level = 'easy', day = dailyDate()) {
    this.mode = mode; this.level = level; this.completed = 0;
    this.day = mode === 'daily' ? day : null;
    this.overtime = false;
    this.cows = 0; this.lives = 3; this.elapsed = 0;
    this.started = null; this.state = 'playing';
    this.finishedBoards = new WeakSet();
  }
  get size() {
    if (this.mode === 'custom') return this.customSize || 6;
    if (this.mode === 'daily') return 12;
    if (this.mode === 'timed') return 8;
    if (this.mode === 'survival') return this.completed < 2 ? 6 : this.completed < 5 ? 8 : 10;
    return levels[this.level];
  }
  get timed() { return this.mode === 'timed' || this.mode === 'daily'; }
  get stars() { return this.mode === 'daily' && this.state === 'won' ? 3 - Number(this.overtime) - Number(this.lives < 3) : null; }
  continueOvertime(now) {
    if (this.mode !== 'daily' || this.state !== 'timeout') return false;
    this.state = 'playing'; this.resume(now); return true;
  }
  resume(now) { if (this.state === 'playing' && this.started === null) this.started = now; }
  pause(now) {
    if (this.started !== null) { this.elapsed += Math.max(0, now - this.started); this.started = null; }
  }
  duration(now) { return this.elapsed + (this.started === null ? 0 : Math.max(0, now - this.started)); }
  remaining(now) { return Math.max(0, CHALLENGE_MS - this.duration(now)); }
  expire(now) {
    if (this.state !== 'playing' || !this.timed || this.overtime || this.remaining(now) > 0) return false;
    if (this.mode === 'daily') this.overtime = true;
    this.pause(now); this.elapsed = CHALLENGE_MS; this.state = 'timeout'; return true;
  }
  finishBoard(game, now) {
    if (this.state !== 'playing' || game.state === 'playing' || this.finishedBoards.has(game)) return 'ignored';
    if (this.expire(now)) {
      if (this.mode === 'daily' && game.state === 'won') this.state = 'playing';
      else return 'end';
    }
    this.finishedBoards.add(game);
    this.pause(now); this.cows += game.found.size; this.lives = game.lives;
    if (game.state === 'lost') { this.state = 'lost'; return 'end'; }
    this.completed++;
    if (['classic', 'daily', 'custom'].includes(this.mode)) { this.state = 'won'; return 'end'; }
    if (this.mode === 'timed') this.lives = 3;
    return 'next';
  }
}
