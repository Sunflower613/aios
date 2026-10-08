import { blockedByCow, colors } from './puzzle.mjs';
import { detectBoard, recognizeRegions } from './recognition.mjs';

export function setupWorkshop({ getPuzzle, playPuzzle, showHome }) {
  const $=id=>document.getElementById(id);
  let size=6,regions=Array(36).fill(-1),cows=[],mode='cow',brush=0,showCows=true,busy=false;
  let revision=0,drag=null,imageData=null,sourceCanvas=null,crop=null,cropStart=null;
  const jobs=new Set();
  function cancel() {
    revision++; drag=null; busy=false;
    for(const job of [...jobs])job.cancel();
  }
  function run(type,payload) {
    return new Promise((resolve,reject)=>{
      const worker=new Worker(new URL('./workshop-worker.mjs?v=3',import.meta.url),{type:'module'});
      let timer;
      const finish=(error,result)=>{clearTimeout(timer);worker.terminate();jobs.delete(job);error?reject(Error(error)):resolve(result);};
      const job={cancel:()=>finish('操作已取消。')};jobs.add(job);
      worker.onmessage=({data})=>finish(data.error,data.result);
      worker.onerror=()=>finish('处理失败，请稍后重试。');
      timer=setTimeout(()=>finish('验证时间较长，请调整地图后重试。'),20000);
      worker.postMessage({type,...payload});
    });
  }
  const draft=()=>({size,regions:[...regions],solution:[...cows]});
  function renderEditor() {
    $('editor-size').value=String(size);
    $('editor-board').style.setProperty('--size',size);
    $('editor-board').setAttribute('aria-label',`${size}乘${size}编辑棋盘`);
    $('edit-cows').setAttribute('aria-pressed',String(mode==='cow'));
    $('edit-colors').setAttribute('aria-pressed',String(mode==='color'));
    $('editor-palette').hidden=mode!=='color';
    $('editor-palette').replaceChildren(...colors.slice(0,size).map((color,index)=>{
      const b=document.createElement('button'); b.textContent=index+1;
      b.style.setProperty('--color',color); b.setAttribute('aria-label',`区域 ${index+1}`);
      b.setAttribute('aria-pressed',String(brush===index));b.disabled=busy;
      b.addEventListener('click',()=>{brush=index;renderEditor();});return b;
    }));
    $('editor-board').replaceChildren(...regions.map((color,cell)=>{
      const b=document.createElement('button'),isCow=showCows&&cows.includes(cell);
      const blocked=mode==='cow'&&!isCow&&blockedByCow(cell,cows,size);
      b.dataset.cell=cell;b.type='button';
      b.style.setProperty('--color',color<0?'#edf0e7':colors[color]);b.style.setProperty('--angle',`${color%2?45:90}deg`);
      b.className=`cell${color<0?' unpainted':''}${isCow?' found':''}${blocked?' excluded blocked':''}`;
      b.textContent=isCow?'🐮':'';
      b.disabled=busy;
      b.setAttribute('aria-label',`第${Math.floor(cell/size)+1}行，第${cell%size+1}列，${color<0?'未填色':`区域${color+1}`}，${isCow?'牛':blocked?'不能放牛':'可编辑'}`);
      if(mode==='color'&&color>=0){const n=document.createElement('span');n.className='region-number';n.textContent=color+1;b.append(n);}
      return b;
    }));
    for(const id of ['editor-size','edit-cows','edit-colors','auto-color','clear-colors','editor-share','editor-play'])$(id).disabled=busy;
  }
  function info(text) {$('editor-info').textContent=text;}
  function openEditor(puzzle=null,hiddenCows=false) {
    cancel();
    if(puzzle){size=puzzle.size;regions=[...puzzle.regions];cows=[...(puzzle.solution||[])];}
    else {size=Number($('editor-size').value)||6;regions=Array(size*size).fill(-1);cows=[];}
    showCows=!hiddenCows;mode=hiddenCows?'color':'cow';brush=0;
    $('home').hidden=true;$('play').hidden=true;$('editor').hidden=false;
    document.body.classList.add('playing');
    renderEditor();info(`先放置 ${size} 头牛，再手动填色或自动填色。`);
  }
  async function editorJob(action) {
    if(busy)return;
    const token=revision;busy=true;renderEditor();info('正在检查地图…');
    try {await action(token);}catch(error){if(token===revision)info(error.message);}
    finally {if(token===revision){busy=false;renderEditor();}}
  }
  async function share(puzzle) {
    $('share-dialog').showModal();$('share-code').value='';$('copy-code').disabled=true;
    $('share-message').textContent='正在生成关卡字符串…';
    const token=revision;
    try {
      const code=await run('encode',{puzzle});if(token!==revision)return;
      $('share-code').value=code;$('copy-code').disabled=false;
      $('share-message').textContent=`${puzzle.size} × ${puzzle.size} · 唯一解已验证`;
    } catch(error){if(token===revision)$('share-message').textContent=error.message;}
  }
  $('open-editor').addEventListener('click',()=>openEditor());
  $('editor-back').addEventListener('click',()=>{cancel();$('editor').hidden=true;showHome();});
  $('editor-size').addEventListener('change',()=>openEditor());
  $('edit-cows').addEventListener('click',()=>{mode='cow';showCows=true;renderEditor();info(`已放 ${cows.length} / ${size} 头牛；叉号格不能放牛。`);});
  $('edit-colors').addEventListener('click',()=>{mode='color';renderEditor();info('选择颜色后点击或滑动涂色；每个颜色区域需要连通。');});
  function edit(cell) {
    if(busy||cell===null)return;
    if(mode==='cow'){
      if(cows.includes(cell))cows=cows.filter(i=>i!==cell);
      else if(!blockedByCow(cell,cows,size))cows.push(cell);
      else {info('这格与已有的牛冲突，请选择没有叉号的格子。');return;}
      info(`已放 ${cows.length} / ${size} 头牛；冲突位置已自动排除。`);
    } else {regions[cell]=brush;info(`区域 ${brush+1} · 还有 ${regions.filter(c=>c<0).length} 格未填色。`);}
    renderEditor();
  }
  function cellAt(x,y){const e=document.elementFromPoint(x,y)?.closest('[data-cell]');return e&&$('editor-board').contains(e)?Number(e.dataset.cell):null;}
  $('editor-board').addEventListener('pointerdown',event=>{
    if(busy||!event.isPrimary||event.button>0)return;
    const cell=event.target.closest('[data-cell]');if(!cell)return;
    event.preventDefault();$('editor-board').setPointerCapture(event.pointerId);
    drag={id:event.pointerId,x:event.clientX,y:event.clientY,seen:new Set([Number(cell.dataset.cell)])};
    edit(Number(cell.dataset.cell));
  });
  $('editor-board').addEventListener('pointermove',event=>{
    if(!drag||drag.id!==event.pointerId||mode!=='color')return;
    event.preventDefault();
    const dx=event.clientX-drag.x,dy=event.clientY-drag.y,steps=Math.max(1,Math.ceil(Math.hypot(dx,dy)/5));
    for(let i=1;i<=steps;i++){
      const cell=cellAt(drag.x+dx*i/steps,drag.y+dy*i/steps);
      if(cell!==null&&!drag.seen.has(cell)){drag.seen.add(cell);regions[cell]=brush;}
    }
    drag.x=event.clientX;drag.y=event.clientY;renderEditor();
  });
  for(const type of ['pointerup','pointercancel','lostpointercapture'])$('editor-board').addEventListener(type,()=>{drag=null;});
  $('editor-board').addEventListener('click',event=>{if(event.detail===0){const b=event.target.closest('[data-cell]');if(b)edit(Number(b.dataset.cell));}});
  $('auto-color').addEventListener('click',()=>editorJob(async token=>{
    const p=await run('color',{size,cows});if(token!==revision)return;
    regions=p.regions;cows=p.solution;mode='color';info('已按牛的位置自动填色，区域连通且答案唯一。可继续手动调整。');
  }));
  $('clear-colors').addEventListener('click',()=>{regions.fill(-1);renderEditor();info('颜色已清空，牛的位置保留。');});
  $('editor-play').addEventListener('click',()=>editorJob(async token=>{
    const p=await run('validate',{puzzle:draft()});if(token!==revision)return;
    $('editor').hidden=true;playPuzzle(p);
  }));
  $('editor-share').addEventListener('click',()=>share(draft()));
  $('share-level').addEventListener('click',()=>{const p=getPuzzle();if(p)share(p);});
  $('close-share').addEventListener('click',()=>$('share-dialog').close());
  $('share-dialog').addEventListener('close',cancel);
  $('copy-code').addEventListener('click',async()=>{
    try {await navigator.clipboard.writeText($('share-code').value);$('share-message').textContent='关卡已复制，可以发给朋友了。';}
    catch {$('share-code').focus();$('share-code').select();$('share-message').textContent='已选中关卡字符串，请长按或按 Ctrl+C 复制。';}
  });
  $('open-load').addEventListener('click',()=>{cancel();$('load-dialog').showModal();$('load-message').textContent='载入前会检查地图和唯一解。';$('load-play').disabled=false;});
  $('close-load').addEventListener('click',()=>$('load-dialog').close());
  $('load-dialog').addEventListener('close',cancel);
  $('load-play').addEventListener('click',async()=>{
    const token=revision;$('load-play').disabled=true;$('load-message').textContent='正在验证关卡…';
    try {
      const p=await run('decode',{code:$('load-code').value});if(token!==revision)return;
      $('load-dialog').close();playPuzzle(p);
    }catch(error){if(token===revision)$('load-message').textContent=error.message;}
    finally {if(token===revision)$('load-play').disabled=false;}
  });

  const preview=$('image-preview');
  function drawPreview(){
    if(!sourceCanvas)return;
    const ctx=preview.getContext('2d');ctx.drawImage(sourceCanvas,0,0);
    if(crop){ctx.strokeStyle='#ed4160';ctx.lineWidth=3;ctx.strokeRect(crop.x,crop.y,crop.width,crop.height);}
  }
  function imagePoint(event){
    const r=preview.getBoundingClientRect();
    // Canvas may be constrained by both width and height; object-fit centers it.
    const scale=Math.min(r.width/preview.width,r.height/preview.height);
    return {x:Math.max(0,Math.min(preview.width,(event.clientX-r.left-(r.width-preview.width*scale)/2)/scale)),y:Math.max(0,Math.min(preview.height,(event.clientY-r.top-(r.height-preview.height*scale)/2)/scale))};
  }
  $('open-recognize').addEventListener('click',()=>{cancel();$('recognize-dialog').showModal();$('recognize-image').disabled=!imageData;});
  $('close-recognize').addEventListener('click',()=>$('recognize-dialog').close());
  $('recognize-dialog').addEventListener('close',cancel);
  $('level-image').addEventListener('change',async()=>{
    cancel();const token=revision,file=$('level-image').files[0];if(!file)return;
    $('upload-title').textContent='更换棋盘截图';
    $('upload-filename').textContent=file.name;
    $('upload-filename').title=file.name;
    $('recognize-image').disabled=true;imageData=null;sourceCanvas=null;preview.hidden=true;
    $('image-message').textContent='正在读取截图…';
    try {
      if(file.size>20*1024*1024)throw Error('图片过大，请选择 20 MB 以内的截图。');
      const bitmap=await createImageBitmap(file);
      if(token!==revision){bitmap.close();return;}
      const scale=Math.min(1,1000/Math.max(bitmap.width,bitmap.height));
      sourceCanvas=document.createElement('canvas');sourceCanvas.width=Math.max(1,Math.round(bitmap.width*scale));sourceCanvas.height=Math.max(1,Math.round(bitmap.height*scale));
      const ctx=sourceCanvas.getContext('2d',{willReadFrequently:true});ctx.drawImage(bitmap,0,0,sourceCanvas.width,sourceCanvas.height);bitmap.close();
      imageData=ctx.getImageData(0,0,sourceCanvas.width,sourceCanvas.height);crop=detectBoard(imageData);
      preview.width=sourceCanvas.width;preview.height=sourceCanvas.height;preview.hidden=false;drawPreview();
      $('recognize-image').disabled=false;$('image-message').textContent='红框是自动检测范围，可拖动重新框选。请确认棋盘尺寸。';
    }catch(error){if(token===revision)$('image-message').textContent=error.message||'图片无法读取，请换一张截图。';}
  });
  preview.addEventListener('pointerdown',event=>{if(!imageData||!event.isPrimary)return;event.preventDefault();cropStart=imagePoint(event);preview.setPointerCapture(event.pointerId);});
  preview.addEventListener('pointermove',event=>{if(!cropStart)return;event.preventDefault();const p=imagePoint(event);crop={x:Math.min(p.x,cropStart.x),y:Math.min(p.y,cropStart.y),width:Math.abs(p.x-cropStart.x),height:Math.abs(p.y-cropStart.y)};drawPreview();});
  for(const type of ['pointerup','pointercancel','lostpointercapture'])preview.addEventListener(type,()=>{cropStart=null;});
  $('recognize-image').addEventListener('click',async()=>{
    if(!imageData)return;
    const token=revision;$('recognize-image').disabled=true;$('image-message').textContent='正在识别颜色并检查地图…';
    try {
      const n=Number($('image-size').value),p={size:n,regions:recognizeRegions(imageData,crop,n)};
      let checked=p,message='已识别颜色。请校对区域边界，再验证并开始。';
      try {checked=await run('validate',{puzzle:p});message='识别成功，唯一解已验证。牛位暂不展示，可校对颜色后直接开始。';}
      catch(error){message=`颜色识别完成，但${error.message}请手动校正。`;}
      if(token!==revision)return;
      $('recognize-dialog').close();openEditor(checked,true);info(message);
    }catch(error){if(token===revision)$('image-message').textContent=error.message;}
    finally {if(token===revision)$('recognize-image').disabled=false;}
  });
}
