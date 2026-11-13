import { catalogApi } from './service.mjs';
import { stripSingerPrefix, makeChart } from './engine.mjs';

export function alignmentLyrics(lines, words, duration) {
  const usable = lines.map((line,i)=>({text:stripSingerPrefix(line.text).trim(),time:words.find(word=>word?.line===i)?.start ?? line.time})).filter(line=>line.text);
  if (!usable.length) throw new Error('请先填写歌词');
  const total = usable.reduce((sum,line)=>sum+line.text.length,0); let consumed=0, previous=-.01;
  return usable.map(line=>{
    const time = Number.isFinite(line.time) ? line.time : duration*consumed/total; consumed+=line.text.length;
    if(time<=previous || time>=duration) throw new Error('句子时间顺序不正确，请先调整句首字点'); previous=time;
    return `[${String(Math.floor(time/60)).padStart(2,'0')}:${(time%60).toFixed(3).padStart(6,'0')}]${line.text}`;
  }).join('\n');
}
export async function regenerateChart(bytes, lines, words, duration, api = catalogApi) {
  const lyric=alignmentLyrics(lines,words,duration);
  if (/[\p{Script=Hiragana}\p{Script=Katakana}]/u.test(lyric)) throw new Error('日文自动制谱暂未支持，请使用 YRC 或手动制谱');
  const form = new FormData(); form.set('audio',new Blob([bytes]),'song.audio'); form.set('lyrics',new Blob([lyric]),'song.lrc');
  let backend='lite';
  try { if(localStorage.getItem('melody-advanced-chart')==='1')backend='whisperx'; } catch {}
  form.set('backend',backend); form.set('preserveAudio','1');
  const result=await api('prepare',{method:'POST',body:form,signal:AbortSignal.timeout(31*60*1000)});
  const hash=[...new Uint8Array(await crypto.subtle.digest('SHA-256',bytes))].map(value=>value.toString(16).padStart(2,'0')).join('');
  if(result.chart?.audioSha256!==hash) throw new Error('制谱服务返回了不同音频的谱面，请更新并重启曲库服务后重试');
  makeChart(result.chart,duration);
  return {chart:result.chart,lyric};
}
