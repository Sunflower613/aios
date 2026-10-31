const HAN = /\p{Script=Han}/gu;
export function ratingFor(round) {
  const total = round.notes.length;
  if (total && round.perfect === total && !round.wrong) return 'φ';
  const accuracy = total ? (round.perfect + round.good * .6) / (total + round.wrong) * 100 : 0;
  return accuracy >= 95 ? 'V' : accuracy >= 90 ? 'S' : accuracy >= 80 ? 'A' : accuracy >= 70 ? 'B' : accuracy >= 60 ? 'C' : 'F';
}
const CREDIT = /(?:作词|作曲|编曲|词曲|制作人|制作|录音|混音|母带|发行|出品|版权|原唱|演唱|歌手|监制|和声|合声|小号|弦乐|钢琴|吉他|贝斯|键盘|鼓手|鸣谢|统筹|策划|音乐总监|词|曲)\s*[:：]|(?:本作品|未经许可|著作权|版权所有|有限公司|股份公司|音乐工作室)|^(?:OP|SP|发行|出品|制作|宣传|企划|营销|推广|特别鸣谢|联合发行)\s*[:：/：\s]|^(?:作词|作曲|编曲|制作人|录音|混音|母带|监制|和声|合声)\s+[a-z]|^[《（(](?:海南话|黎族话|方言|独白|间奏|前奏|尾奏)[^》）)]*[》）)]$/i;

export function parseLrc(source) {
  const offset = Number(source.match(/\[offset:([+-]?\d+)\]/i)?.[1] || 0) / 1000;
  const lines = [];
  for (const raw of source.split(/\r?\n/)) {
    const stamps = [...raw.matchAll(/\[(\d+):(\d+(?:\.\d+)?)\]/g)];
    const text = raw.replace(/\[[^\]]*\]/g, '').trim();
    // Keep blank/credit timestamps as interval boundaries, but never make notes from credits.
    for (const stamp of stamps) lines.push({ time: Math.max(0, Number(stamp[1]) * 60 + Number(stamp[2]) + offset), text, playable: !CREDIT.test(text) && (text.match(HAN)?.length || 0) > 0 });
  }
  return lines.sort((a, b) => a.time - b.time).filter((line, i, list) => !i || line.time !== list[i - 1].time || line.text !== list[i - 1].text);
}

// No line interpolation: gameplay accepts measured character intervals only.
export function makeChart(alignment, duration, seed = 1) {
  if (alignment.version !== 2 || !Array.isArray(alignment.words) || !alignment.words.length) throw new Error('需要逐字对齐谱面，请先制谱');
  let previousTime = -1;
  const notes = alignment.words.map((word, i) => {
      const { start, end, char, line } = word;
      if (!/^\p{Script=Han}$/u.test(char) || !Number.isFinite(start) || !Number.isFinite(end) || start < 0 || start < previousTime || end <= start || end > duration + .1) throw new Error(`无效的逐字时间轴：第 ${i + 1} 字`);
      previousTime = start;
      return { char, time: start, end, line, confidence: word.confidence };
  }).filter(note => alignment.lines?.[note.line]?.playable !== false && !CREDIT.test(alignment.lines?.[note.line]?.text || ''));
  const random = () => { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed / 4294967296; };
  const phrases = new Map(), motifs = new Map();
  for (const note of notes) { if (!phrases.has(note.line)) phrases.set(note.line, []); phrases.get(note.line).push(note); }
  for (const [line, phrase] of phrases) {
    const text = phrase.map(n => n.char).join('');
    const melody = alignment.lines?.[line]?.melodyId;
    const key = melody === undefined ? `text:${text}` : `melody:${melody}:${phrase.length}`;
    const previous = motifs.get(key) || motifs.get(`text:${text}`);
    const roll = random();
    let lane = previous?.[0] ?? (roll < .4 ? 0 : roll < .8 ? 3 : roll < .9 ? 1 : 2);
    phrase.forEach((note, index) => {
      if (index > 0 && note.char !== phrase[index - 1].char) {
        const suggested = previous?.[index];
        if (suggested !== undefined && Math.abs(suggested - lane) === 1) lane = suggested;
        else lane = lane === 0 ? 1 : lane === 3 ? 2 : lane + (random() < .5 ? -1 : 1);
      }
      note.lane = lane;
    });
    const pattern = phrase.map(n => n.lane); motifs.set(key, pattern); motifs.set(`text:${text}`, pattern);
  }
  return notes;
}

// Render intervals are independent of the vocal timestamps used for scoring/audio.
// 90px/s is the minimum board speed (300px * .78 / 2.6), so all screen sizes
// retain a readable head without changing lanes when the viewport is resized.
export function layoutChart(notes, seed = 1) {
  const occupied = Array(4).fill(-Infinity);
  const random = () => { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed / 4294967296; };
  let previous;
  return notes.map(note => {
    const displayEnd = Math.max(note.end, note.time + 20 / 90);
    const free = [0, 1, 2, 3].filter(lane => occupied[lane] <= note.time - .04);
    const repeated = previous?.line === note.line && previous.char === note.char;
    const preferred = repeated ? previous.lane : note.lane;
    let lane = preferred;
    if (!repeated && !free.includes(lane)) {
      const choices = free.length ? free : [0, 1, 2, 3];
      lane = choices.sort((a, b) => {
        if (!free.length) return occupied[a] - occupied[b];
        const origin = previous?.line === note.line ? previous.lane : preferred;
        return Math.abs(a - origin) - Math.abs(b - origin) || Math.abs(a - preferred) - Math.abs(b - preferred);
      })[0];
    }
    const color = repeated ? previous.color : Math.floor(random() * 4);
    occupied[lane] = Math.max(occupied[lane], displayEnd);
    previous = { ...note, lane, color, displayEnd };
    return previous;
  });
}

export class Round {
  constructor(notes, window = 0.28) {
    this.notes = notes.map(note => ({ ...note, status: 'pending' }));
    this.window = window;
    this.score = 0; this.combo = 0; this.maxCombo = 0;
    this.perfect = 0; this.good = 0; this.misses = 0; this.wrong = 0;
  }
  expire(time) {
    let count = 0;
    for (const note of this.notes) {
      if (note.status === 'pending' && time - note.time > this.window) { note.status = 'miss'; this.misses++; count++; }
    }
    if (count) this.combo = 0;
    return count;
  }
  hit(lane, time) {
    this.expire(time);
    const note = this.notes.find(n => n.status === 'pending' && n.lane === lane && Math.abs(n.time - time) <= this.window);
    if (!note) { this.wrong++; this.combo = 0; return { grade: 'wrong' }; }
    return this.accept(note, Math.abs(note.time - time) <= 0.11 ? 'perfect' : 'good');
  }
  accept(note, grade = 'perfect') {
    note.status = grade; this[grade]++; this.combo++;
    this.maxCombo = Math.max(this.maxCombo, this.combo);
    this.score += (grade === 'perfect' ? 100 : 60) + Math.min(50, Math.floor(this.combo / 10) * 5);
    return { grade, note };
  }
  get accuracy() { return this.notes.length ? Math.round((this.perfect + this.good * 0.6) / (this.notes.length + this.wrong) * 100) : 0; }
  get errors() { return this.misses + this.wrong; }
}

export class RhythmRound extends Round {
  constructor(notes) { super(notes); this.lastTap = null; this.lastNoteTime = null; this.rate = 1; }
  expire() { return 0; }
  get next() { return this.notes.find(note => note.status === 'pending'); }
  tap(lane, wallTime, mediaTime) {
    const note = this.next;
    if (!note) return { grade: 'done' };
    if (note.lane !== lane) { this.wrong++; this.combo = 0; return { grade: 'wrong' }; }
    // At most one second of music can be unlocked ahead; fast tapping cannot queue the whole song.
    if (note.time - mediaTime > 1) return { grade: 'early' };
    if (this.lastTap !== null) {
      const elapsed = wallTime - this.lastTap;
      this.rate = elapsed > 2 ? 1 : Math.max(.65, Math.min(2, (note.time - this.lastNoteTime) / Math.max(.08, elapsed)));
    }
    this.lastTap = wallTime; this.lastNoteTime = note.time;
    return { ...this.accept(note), rate: this.rate };
  }
  resume() { this.lastTap = null; this.lastNoteTime = null; }
}
