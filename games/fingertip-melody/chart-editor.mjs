import { deviceRecords, songKey, chartVersions, changeChartVersion } from './device-library.mjs';
import { parseLrc, makeChart, stripSingerPrefix } from './engine.mjs';

const chars = text => stripSingerPrefix(text).normalize('NFC').match(/[\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}ー]/gu) || [];
export function editableLyrics(text) {
  if (/\[\d+,\d+\]/.test(text)) return text.split(/\r?\n/).filter(line => /^\[\d+,\d+\]/.test(line)).map(line => line.replace(/^\[\d+,\d+\]/, '').replace(/\(\d+,\d+,\d+\)/g, '')).map(stripSingerPrefix).join('\n');
  const lines = parseLrc(text);
  return lines.length ? lines.filter(line => line.playable).map(line => line.text).join('\n') : text.split(/\r?\n/).map(stripSingerPrefix).join('\n');
}
export function reconcileLyrics(text, recorded) {
  const lines = text.split(/\r?\n/).map(text => ({text, playable:true})).filter(line => chars(line.text).length);
  const tokens = lines.flatMap((line, index) => chars(line.text).map(char => ({char, line:index})));
  let prefix = 0;
  while (prefix < recorded.length && tokens[prefix]?.char === recorded[prefix].char) prefix++;
  return { lines, tokens, words: recorded.slice(0, prefix).map((word, i) => ({...word, line:tokens[i].line})) };
}

async function sessionStore(mode, action) {
  const db = await new Promise((resolve, reject) => { const request = indexedDB.open('melody-chart-sessions', 1); request.onupgradeneeded = () => request.result.createObjectStore('sessions'); request.onsuccess = () => resolve(request.result); request.onerror = () => reject(request.error); });
  return new Promise((resolve, reject) => { const transaction = db.transaction('sessions', mode), request = action(transaction.objectStore('sessions')); transaction.oncomplete = () => { db.close(); resolve(request.result); }; transaction.onerror = () => { db.close(); reject(transaction.error); }; });
}
export async function openChartEditor({song, bytes, alignment, volume}) {
  const id = crypto.randomUUID();
  await sessionStore('readwrite', store => store.put({song, bytes, alignment, volume}, id));
  location.assign(`./chart-editor.html?session=${encodeURIComponent(id)}`);
}
export function replaceLyricLine(lines, tokens, words, line, text) {
  const nextLines = lines.map((item,i) => i === line ? {...item,text} : item);
  const nextTokens = [], nextWords = [];
  nextLines.forEach((item,i) => {
    if (i === line) chars(text).forEach(char => { nextTokens.push({char,line:i}); nextWords.push(null); });
    else tokens.forEach((token,j) => { if (token.line === i) { nextTokens.push(token); nextWords.push(words[j] || null); } });
  });
  return {lines:nextLines,tokens:nextTokens,words:nextWords};
}
export function fillWithinLines(words) {
  return words.map((word,i) => word ? {...word, end: words[i+1]?.line === word.line ? words[i+1].start : word.end} : null);
}
export function previousLineEnd(words, line) {
  return words.filter(word => word && word.line < line).at(-1)?.end || 0;
}
export async function mountChartEditor() {
  const id = new URLSearchParams(location.search).get('session');
  const session = id && await sessionStore('readonly', store => store.get(id));
  const $ = selector => document.querySelector(selector);
  $('[data-action="close"]').onclick = () => location.assign('./index.html');
  if (!session) { $('.studio-status').textContent = '请从歌曲设置进入制谱模式'; return; }
  const {song,bytes,alignment,volume} = session;
  const audio = new Audio(URL.createObjectURL(new Blob([bytes]))); audio.volume = volume;
  $('h2').textContent = `${song.title} · ${song.artist}`;
  let lines = [], tokens = [], words = [], cursor = 0, selectedLine = 0, held = null, saving = false, frame = 0, dirty = false, visualIndex = 0, activeName = '新谱面';
  let targetedWord = false;
  const history = [], future = [];
  const snapshot = () => structuredClone({lines,tokens,words,cursor,selectedLine,activeName});
  const remember = () => { history.push(snapshot()); if(history.length>100)history.shift(); future.length=0; };
  const restore = value => { ({lines,tokens,words,cursor,selectedLine,activeName}=value); held=null; seek((words[cursor]?.start ?? previousLineEnd(words,selectedLine))-.3); render(); };
  $('.auto-fill').checked = session.autoFill !== false;
  $('.auto-fill').onchange = () => { session.autoFill=$('.auto-fill').checked; persist(); };
  const status = text => { $('.studio-status').textContent = text; };
  function toast(text) { $('.studio-toast').textContent = text; $('.studio-toast').hidden = false; clearTimeout(toast.timer); toast.timer = setTimeout(() => { $('.studio-toast').hidden = true; },4500); }
  function pause() { audio.pause(); const button = $('[data-action="play"]'); button.innerHTML = '<svg viewBox="0 0 32 32"><path d="m11 6 15 10-15 10Z"/></svg>'; button.setAttribute('aria-label','继续录制'); button.title = '继续录制'; }
  function persist() {
    session.editor = {lines,tokens,words,cursor,selectedLine,activeName};
    sessionStore('readwrite', store => store.put(session,id)).catch(() => status('草稿保存失败'));
  }
  function seek(time) { if (Number.isFinite(time)) audio.currentTime = Math.max(0,time); }
  function release() {
    if (held !== null && words[held]) {
      const following = words.slice(held+1).find(Boolean)?.start ?? audio.duration;
      words[held].end = $('.auto-fill').checked && words[held+1]?.line===words[held].line ? words[held+1].start : Math.min(following,audio.duration,Math.max(words[held].start+.04,audio.currentTime));
    }
    const stopAfter = held !== null && (cursor === tokens.length || words[cursor]);
    held = null; if (stopAfter) pause();
  }
  function selectWord(index) { release(); pause(); cursor=index; targetedWord=true; selectedLine=tokens[index].line; seek((words[index]?.start ?? lines[selectedLine]?.time ?? 0)-.5); render(); }
  function render() {
    const container = $('.studio-words'); container.replaceChildren();
    lines.forEach((line,lineIndex) => {
      const row = document.createElement('div'); row.className='studio-phrase';
      const select = document.createElement('button'); select.className='phrase-select'; select.textContent=String(lineIndex+1); select.title='选择这一句'; select.setAttribute('aria-label',`选择第 ${lineIndex+1} 句`);
      select.onclick=() => { const i=tokens.findIndex(token=>token.line===lineIndex); if(i>=0)selectWord(i); }; row.append(select);
      tokens.forEach((token,i) => { if(token.line!==lineIndex)return; const button=document.createElement('button'); button.textContent=token.char; button.className=(words[i]?'recorded ':'')+(i===cursor?'next':''); button.title=`第 ${i+1} 字：${token.char}`; button.onclick=()=>selectWord(i); row.append(button); });
      container.append(row);
    });
    const next=container.querySelector('.next'); if(next)container.scrollTop=Math.max(0,next.offsetTop-container.offsetTop-35);
    $('.line-number').textContent=`第 ${selectedLine+1} 句`;
    $('.line-text').value=lines[selectedLine]?.text || '';
    $('.studio-lyrics').value=lines.map(line=>line.text).join('\n');
    $('.chart-name').textContent=activeName;
    status(`已录 ${words.filter(Boolean).length}/${tokens.length} · ${tokens[cursor] ? `当前：${tokens[cursor].char}` : '可保存或选择歌词修改'}`);
    persist();
  }
  function loadChart(chart, name) {
    release(); pause();
    const usedLines = [...new Set((chart.words || []).map(word=>word.line))].sort((a,b)=>a-b);
    const lineMap = new Map(usedLines.map((old,i)=>[old,i]));
    lines = usedLines.map(old=>structuredClone(chart.lines[old]));
    tokens=(chart.words || []).map(word=>({char:word.char,line:lineMap.get(word.line)}));
    words=(chart.words || []).map((word,i)=>({...word,line:lineMap.get(word.line),lane:Number.isInteger(word.lane)?word.lane:[0,1,2,3,2,1][i%6]}));
    history.length=0; future.length=0; cursor=tokens.length; visualIndex=cursor; selectedLine=0; activeName=name; dirty=false; seek(0); render();
  }
  function tap(lane) {
    if(audio.paused || !tokens[cursor] || saving)return;
    release(); const time=audio.currentTime, before=words.slice(0,cursor).findLast(Boolean), after=words.slice(cursor+1).find(Boolean);
    if((before && time<=before.start+.03)||(after && time>=after.start-.04)){status('字点超出相邻字的范围，请回到所选字或句的时间重录');return;}
    targetedWord=false; remember();
    if(before)before.end=$('.auto-fill').checked && before.line===tokens[cursor].line ? time : Math.min(before.end,time);
    words[cursor]={...tokens[cursor],start:time,end:Math.min(audio.duration,after?.start ?? audio.duration,time+.15),lane}; held=cursor;
    cursor++; dirty=true;
    render();
  }
  function tick() {
    const time=audio.currentTime,duration=audio.duration||1;
    const fmt=n=>`${Math.floor(n/60)}:${String(Math.floor(n%60)).padStart(2,'0')}`;
    $('.studio-time').textContent=`${fmt(time)} / ${fmt(duration)}`; $('.studio-seek').max=duration; $('.studio-seek').value=time;
    visualIndex+=(cursor-visualIndex)*.25;
    const height=$('.studio-board').clientHeight,speed=height*.3,hitY=height*.78,layer=$('.studio-notes');layer.replaceChildren();
    function paint(char,lane,bottom,length,recorded){const note=document.createElement('div');note.className='studio-note'+(recorded?' recorded-note':'');note.style.left=`${lane*25}%`;note.style.top=`${bottom-length}px`;note.style.height=`${length}px`;const label=document.createElement('span');label.textContent=char;note.append(label);layer.append(note);}
    words.forEach(word=>{if(!word)return;const bottom=hitY+(time-word.start)*speed,length=Math.max(20,(word.end-word.start)*speed);if(bottom-length<height&&bottom>0)paint(word.char,word.lane,bottom,length,true);});
    tokens.slice(cursor,cursor+7).forEach((token,i)=>{if(!words[cursor+i])paint(token.char,[0,1,2,3,2,1][(cursor+i)%6],hitY-(cursor+i-visualIndex)*65,48,false);});
    frame=requestAnimationFrame(tick);
  }
  function undoWord() {
    release();pause();
    if(history.length && !targetedWord){future.push(snapshot());restore(history.pop());return;}
    targetedWord=false;
    future.push(snapshot());let index=words[cursor]?cursor:words.findLastIndex((word,i)=>word&&i<cursor);
    if(index<0)return;const old=words[index];words[index]=null;cursor=index;selectedLine=tokens[index].line;seek(old.start-.5);dirty=true;render();toast('已撤销这一个字，其余字点保留');
  }
  function redoLine(text) {
    release();pause();remember();const first=previousLineEnd(words,selectedLine);
    ({lines,tokens,words}=replaceLyricLine(lines,tokens,words,selectedLine,text));
    cursor=tokens.findIndex(token=>token.line===selectedLine);if(cursor<0)cursor=tokens.findIndex((token,i)=>!words[i]);if(cursor<0)cursor=tokens.length;
    seek(first);dirty=true;render();toast('当前句已准备重录，其他句保留');
  }
  $('[data-action="undo"]').onclick=undoWord;
  $('[data-action="redo"]').onclick=()=>{release();pause();if(future.length){history.push(snapshot());restore(future.pop());}};
  $('[data-action="reset"]').onclick=()=>{release();pause();$('.reset-confirm').showModal();};
  $('[data-action="reset-cancel"]').onclick=()=>$('.reset-confirm').close();
  $('[data-action="reset-confirm"]').onclick=()=>{remember();words=tokens.map(()=>null);cursor=0;selectedLine=0;seek(0);render();$('.reset-confirm').close();toast('本次录制已重置，已保存谱面保留');};
  $('[data-action="redo-line"]').onclick=()=>redoLine($('.line-text').value);
  $('.line-text').onfocus=()=>{release();pause();};
  $('.line-text').onchange=()=>redoLine($('.line-text').value);
  $('.studio-lyrics').onfocus=()=>{release();pause();};
  $('.studio-lyrics').onchange=()=>{
    release();pause();remember();const nextLines=$('.studio-lyrics').value.split(/\r?\n/).map(text=>({text,playable:true})).filter(line=>chars(line.text).length);
    // Match unchanged sentences in order, preserving their measured words even when another sentence changes.
    const nextTokens=[],nextWords=[];let oldStart=0;
    nextLines.forEach((line,i)=>{const match=lines.findIndex((old,j)=>j>=oldStart&&old.text===line.text);if(match>=0){oldStart=match+1;tokens.forEach((token,j)=>{if(token.line===match){nextTokens.push({...token,line:i});nextWords.push(words[j]?{...words[j],line:i}:null);}});}else chars(line.text).forEach(char=>{nextTokens.push({char,line:i});nextWords.push(null);});});
    lines=nextLines;tokens=nextTokens;words=nextWords;cursor=words.findIndex(word=>!word);if(cursor<0)cursor=tokens.length;selectedLine=tokens[cursor]?.line||0;dirty=true;render();
  };
  $('.studio-file input').onchange=async event=>{const file=event.target.files[0];if(file){$('.studio-lyrics').value=editableLyrics(await file.text());$('.studio-lyrics').onchange();}};
  $('[data-action="lyrics"]').onclick=()=>document.querySelector('.studio-page').classList.toggle('lyrics-open');
  $('.studio-seek').oninput=event=>{release();pause();seek(Number(event.target.value));};
  document.querySelectorAll('[data-lane]').forEach(button=>{button.onpointerdown=event=>{event.preventDefault();button.setPointerCapture(event.pointerId);tap(Number(button.dataset.lane));};button.onpointerup=button.onpointercancel=()=>{release();persist();};});
  $('[data-action="play"]').onclick=async()=>{if(!audio.paused){release();pause();persist();}else{try{await audio.play();const button=$('[data-action="play"]');button.innerHTML='<svg viewBox="0 0 32 32"><path d="M11 7v18M22 7v18"/></svg>';button.setAttribute('aria-label','暂停录制');button.title='暂停录制';}catch{status('音频暂时无法播放');}}};
  document.addEventListener('keydown',event=>{if(event.target.matches('input,textarea')||event.repeat||$('.chart-manager').open||$('.reset-confirm').open)return;const lane=['KeyD','KeyF','KeyJ','KeyK'].indexOf(event.code);if(lane>=0){event.preventDefault();tap(lane);}if(event.code==='Space'){event.preventDefault();$('[data-action="play"]').click();}});
  document.addEventListener('keyup',event=>{if(['KeyD','KeyF','KeyJ','KeyK'].includes(event.code)){release();persist();}});
  document.addEventListener('visibilitychange',()=>{if(document.hidden){release();pause();persist();}});
  audio.onended=()=>{release();pause();status('播放结束，可选择单字或单句重录');};
  window.addEventListener('pagehide',()=>{audio.pause();cancelAnimationFrame(frame);URL.revokeObjectURL(audio.src);});
  $('[data-action="save"]').onclick=async()=>{
    release();pause();if(!tokens.length||words.filter(Boolean).length!==tokens.length){toast('还有未录字点，请补录后保存');return;}
    saving=true;$('[data-action="save"]').disabled=true;
    try{
      const hash=[...new Uint8Array(await crypto.subtle.digest('SHA-256',bytes))].map(v=>v.toString(16).padStart(2,'0')).join('');
      const chart={version:2,method:'manual',audioSha256:hash,duration:audio.duration,words:$('.auto-fill').checked ? fillWithinLines(words) : structuredClone(words),lines:lines.map((line,i)=>({...line,time:words.find(word=>word.line===i)?.start||0})),beats:[]};makeChart(chart,audio.duration);
      const name=`${activeName.replace(/ · 修改.*$/,'')} · 修改 ${new Date().toLocaleTimeString('zh-CN',{hour:'2-digit',minute:'2-digit',second:'2-digit'})}`;
      await changeChartVersion(song,'save',null,{id:crypto.randomUUID(),name,chart,lyric:lines.map(line=>line.text).join('\n'),created:Date.now()});
      words=structuredClone(chart.words);activeName=name;dirty=false;session.alignment=chart;render();toast('保存成功 · 已新增谱面并设为当前演奏谱面');status('保存成功，可在右上角管理谱面');
    }catch(error){toast(`保存失败：${error.message}`);}finally{saving=false;$('[data-action="save"]').disabled=false;}
  };
  async function renderManager(){
    const record=await chartVersions(song),container=$('.chart-list');container.replaceChildren();
    for(const version of record.charts || []){
      const row=document.createElement('div');row.className='chart-version';const input=document.createElement('input');input.value=version.name;input.maxLength=60;input.setAttribute('aria-label','谱面名称');row.append(input);
      const info=document.createElement('small');info.textContent=`${version.chart.words.length} 字${version.id===record.activeChart?' · 当前演奏':''}`;row.append(info);
      for(const [label,action] of [['载入修改','select'],['重命名','rename'],['删除','delete']]){const button=document.createElement('button');button.setAttribute('aria-label',label);button.title=label;const paths={select:'m11 6 15 10-15 10Z',rename:'m7 24 2-7L23 3l6 6-14 14-8 1ZM18 8l6 6',delete:'M5 8h22M12 8V4h8v4M8 8l1 20h14l1-20M13 13v10M19 13v10'};button.innerHTML=`<svg viewBox="0 0 32 32"><path d="${paths[action]}"/></svg>`;button.onclick=async()=>{button.disabled=true;try{await changeChartVersion(song,action,version.id,input.value);if(action==='select'){loadChart(version.chart,version.name);$('.chart-manager').close();toast('谱面已载入，点击歌词可选择单字或句');}else await renderManager();}catch(error){toast(error.message);button.disabled=false;}};row.append(button);}
      container.append(row);
    }
    if(!record.charts?.length)container.textContent='暂无已保存谱面';
  }
  $('[data-action="manage"]').onclick=async()=>{release();pause();persist();await renderManager();$('.chart-manager').showModal();};
  $('[data-action="manager-close"]').onclick=()=>$('.chart-manager').close();
  $('[data-action="new-chart"]').onclick=()=>{release();pause();words=tokens.map(()=>null);cursor=0;selectedLine=0;activeName='新谱面';dirty=true;seek(0);render();$('.chart-manager').close();};
  let text='';try{text=(await deviceRecords(new Set([songKey(song)])))[0]?.lyric||'';if(!text&&song.lyrics){const response=await fetch(song.lyrics);if(response.ok)text=await response.text();}}catch{}
  const record=await chartVersions(song,{audio:new Blob([bytes]),chart:alignment.words?.length?alignment:undefined,lyric:text});
  if(session.editor){({lines,tokens,words,cursor,selectedLine,activeName}=session.editor);words=words.map(word=>word||null);render();}
  else if(record.chart?.words?.length)loadChart(record.chart,record.charts.find(item=>item.id===record.activeChart)?.name||'原始谱面');
  else{lines=editableLyrics(text).split(/\r?\n/).map(text=>({text,playable:true})).filter(line=>chars(line.text).length);tokens=lines.flatMap((line,i)=>chars(line.text).map(char=>({char,line:i})));words=tokens.map(()=>null);render();}
  tick();
}
