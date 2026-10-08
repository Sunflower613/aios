import { neighbors } from './engine.mjs?v=2';

export const sizes = [6, 8, 10, 12];
export const colors = ['#eda573','#74b8d0','#e0c56f','#ab95ca','#65b8ac','#809fca','#dca0b6','#a8bd77','#bd9a82','#a5bac4','#c88879','#849c70'];
export function blockedByCow(cell, cows, size) {
  return cows.some(cow => {
    const dr = Math.abs(Math.floor(cell / size) - Math.floor(cow / size));
    const dc = Math.abs(cell % size - cow % size);
    return dr === 0 || dc === 0 || (dr <= 1 && dc <= 1);
  });
}
export function checkCows(cows, size) {
  if (!sizes.includes(size) || cows.length !== size || new Set(cows).size !== size) throw Error(`请放置 ${size} 头牛。`);
  const sorted = [...cows].sort((a,b)=>a-b);
  for (let i=0; i<sorted.length; i++) {
    if (!Number.isInteger(sorted[i]) || sorted[i]<0 || sorted[i]>=size*size || blockedByCow(sorted[i], sorted.slice(0,i), size)) throw Error('牛的位置不符合每行每列一头、互不相邻的规则。');
  }
  return sorted;
}

// Imported data is untrusted. Bound the search and stop at two solutions.
export function findSolutions(regions, size, budget = 500000) {
  const path = Array(size).fill(-1), solutions = [], columns = new Set(), used = new Set();
  let nodes = 0;
  function visit(count) {
    if (++nodes > budget) throw Error('地图过于复杂，暂时无法验证，请调整颜色区域后重试。');
    if (count === size) { solutions.push([...path]); return; }
    let row = -1, candidates = null;
    for (let r=0; r<size; r++) {
      if (path[r] !== -1) continue;
      const options=[];
      for (let c=0; c<size; c++) {
        const cell=r*size+c;
        if (columns.has(c)||used.has(regions[cell])) continue;
        if (r>0 && path[r-1]!==-1 && Math.abs(path[r-1]%size-c)<=1) continue;
        if (r+1<size && path[r+1]!==-1 && Math.abs(path[r+1]%size-c)<=1) continue;
        options.push(cell);
      }
      if (!options.length) return;
      if (candidates===null || options.length<candidates.length) {row=r;candidates=options;}
    }
    for (const cell of candidates) {
      path[row]=cell; columns.add(cell%size); used.add(regions[cell]); visit(count+1);
      path[row]=-1; columns.delete(cell%size); used.delete(regions[cell]);
      if (solutions.length===2) return;
    }
  }
  visit(0); return solutions;
}

export function validatePuzzle({ size, regions, solution }) {
  if (!sizes.includes(size) || !Array.isArray(regions) || regions.length!==size*size) throw Error('地图尺寸不正确，仅支持 6、8、10、12。');
  if (regions.some(c=>!Number.isInteger(c)||c<0||c>=size)) throw Error('还有格子未填色，或颜色编号不正确。');
  for (let color=0;color<size;color++) {
    const cells=regions.flatMap((c,i)=>c===color?[i]:[]);
    if (!cells.length) throw Error(`缺少第 ${color+1} 个颜色区域。`);
    const seen=new Set([cells[0]]), queue=[cells[0]];
    for (let k=0;k<queue.length;k++) for(const next of neighbors(queue[k],size)) {
      if(regions[next]===color&&!seen.has(next)){seen.add(next);queue.push(next);}
    }
    if(seen.size!==cells.length) throw Error(`第 ${color+1} 个颜色区域不连通，请把它们连起来。`);
  }
  if (solution?.length) {
    const cows=checkCows(solution,size);
    if(new Set(cows.map(i=>regions[i])).size!==size) throw Error('每个颜色区域需要恰好一头牛。');
  }
  const answers=findSolutions(regions,size);
  if (!answers.length) throw Error('这张地图无解，请检查颜色区域。');
  if (answers.length!==1) throw Error('这张地图存在多个解，请调整颜色区域，使答案唯一。');
  return {size,regions:[...regions],solution:answers[0]};
}

function checksum(text) {
  let n=2166136261;
  for(const char of text) n=Math.imul(n^char.charCodeAt(0),16777619)>>>0;
  return n.toString(16).padStart(8,'0');
}
const alphabet='ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_';
const bits=(n,width)=>n.toString(2).padStart(width,'0');
function pack(binary){return binary.match(/.{1,6}/g).map(chunk=>alphabet[parseInt(chunk.padEnd(6,'0'),2)]).join('');}
const shortCheck=text=>pack(bits(parseInt(checksum(text),16)>>>8,24));
// Predict neighboring colors, falling back to fixed-width cells for busy maps.
// The decoder derives the answer; no solution or player progress is included.
export function encodePuzzle(puzzle) {
  const {size,regions}=validatePuzzle(puzzle);
  const width=Math.ceil(Math.log2(size));
  const raw=regions.map(c=>bits(c,width)).join('');
  const predicted=regions.map((c,i)=>i%size&&c===regions[i-1]?'0':i>=size&&c===regions[i-size]?'10':`11${bits(c,width)}`).join('');
  const compressed=predicted.length<raw.length;
  const payload='C2'+pack(bits(sizes.indexOf(size),2)+Number(compressed)+(compressed?predicted:raw));
  return `${payload}.${shortCheck(payload)}`;
}
export function decodePuzzle(text) {
  if(typeof text!=='string'||text.length>2048) throw Error('关卡字符串无效或过长。');
  const code=text.replace(/\s/g,''), parts=code.split('.');
  if(code.startsWith('C2')){
    const broken=()=>{throw Error('关卡字符串不完整或已损坏，请重新复制。');};
    if(parts.length!==2||!/^C2[A-Za-z0-9_-]+$/.test(parts[0])||shortCheck(parts[0])!==parts[1])broken();
    const binary=[...parts[0].slice(2)].map(c=>bits(alphabet.indexOf(c),6)).join('');let cursor=0;
    const read=n=>{if(cursor+n>binary.length)broken();const v=parseInt(binary.slice(cursor,cursor+n),2);cursor+=n;return v;};
    const size=sizes[read(2)],compressed=read(1),width=Math.ceil(Math.log2(size)),regions=[];
    for(let i=0;i<size*size;i++){
      let color;
      if(!compressed)color=read(width);
      else if(read(1)===0){if(i%size===0)broken();color=regions[i-1];}
      else if(read(1)===0){if(i<size)broken();color=regions[i-size];}
      else color=read(width);
      if(color>=size)broken();regions.push(color);
    }
    if(binary.length-cursor>=6||/1/.test(binary.slice(cursor)))broken();
    return validatePuzzle({size,regions});
  }
  throw Error('关卡码格式不支持，请使用 C2 开头的关卡码。');
}

export function autoColor(size, positions, random=Math.random) {
  const solution=checkCows(positions,size), seeds=new Set(solution);
  const regions=Array(size*size).fill(0);
  solution.forEach((cell,color)=>{regions[cell]=color;});
  for(let step=0;step<size*size*12;step++) {
    const cell=Math.floor(random()*regions.length); if(seeds.has(cell)) continue;
    const color=regions[cell],counts=Array(size).fill(0); regions.forEach(c=>counts[c]++);
    const targets=neighbors(cell,size).filter(i=>regions[i]!==color&&counts[regions[i]]<counts[color]);
    if(!targets.length) continue;
    const seen=new Set([solution[color]]),queue=[solution[color]];
    for(let k=0;k<queue.length;k++) for(const next of neighbors(queue[k],size)) {
      if(next!==cell&&regions[next]===color&&!seen.has(next)){seen.add(next);queue.push(next);}
    }
    if(seen.size!==counts[color]-1) continue;
    regions[cell]=regions[targets[Math.floor(random()*targets.length)]];
    try {if(findSolutions(regions,size,30000).length!==1) regions[cell]=color;} catch {regions[cell]=color;}
  }
  return {size,regions,solution};
}
