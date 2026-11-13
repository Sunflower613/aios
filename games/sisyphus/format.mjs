export function compact(n) {
  if (!Number.isFinite(n)) return '—';
  const suffixes = ['', 'K', 'M', 'B', 'T', 'Qa', 'Qi', 'Sx', 'Sp', 'Oc', 'No', 'Dc'];
  if (Math.abs(n) < 1000) return n.toLocaleString('zh-CN', { maximumFractionDigits: Math.abs(n) < 1 ? 2 : 1 });
  let index = Math.min(suffixes.length - 1, Math.floor(Math.log10(Math.abs(n)) / 3));
  let amount = n / 1000 ** index;
  if (Math.abs(Number(amount.toFixed(1))) >= 1000 && index < suffixes.length - 1) { index++; amount /= 1000; }
  return `${amount.toFixed(1)}${suffixes[index]}`;
}
export function elapsed(seconds) {
  const whole = Math.floor(seconds), hours = Math.floor(whole / 3600), minutes = Math.floor(whole / 60) % 60;
  return `${hours ? `${hours} 小时 ` : ''}${minutes} 分 ${whole % 60} 秒`;
}
