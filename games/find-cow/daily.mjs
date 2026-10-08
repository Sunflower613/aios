import { generate } from './engine.mjs?v=2';

// Every player gets the same puzzle for the same Beijing calendar date.
export function dailyDate(date = new Date()) {
  const parts = new Intl.DateTimeFormat('en', { timeZone: 'Asia/Shanghai', year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(date);
  const get = type => parts.find(part => part.type === type).value;
  return `${get('year')}-${get('month')}-${get('day')}`;
}

export function generateDaily(day) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(day)) throw new TypeError('Expected a calendar date');
  let seed = 2166136261;
  for (const char of `find-cow-daily-v1:${day}`) seed = Math.imul(seed ^ char.charCodeAt(0), 16777619) >>> 0;
  const random = () => { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed / 2 ** 32; };
  return generate(12, random);
}
