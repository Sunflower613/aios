const colorful=(r,g,b)=>Math.max(r,g,b)-Math.min(r,g,b)>22&&Math.max(r,g,b)>80;
// Score regular gutters against cell centers in both directions. A low score
// leaves the choice to the player instead of confidently importing a wrong grid.
export function detectSize(image,rect) {
  const profiles=[[],[]];
  for(let axis=0;axis<2;axis++){
    const length=Math.floor(axis?rect.height:rect.width),cross=Math.floor(axis?rect.width:rect.height);
    for(let i=0;i<length;i++){
      let blank=0;
      for(let j=0;j<cross;j++){
        const x=Math.min(image.width-1,Math.max(0,Math.floor(rect.x+(axis?j:i))));
        const y=Math.min(image.height-1,Math.max(0,Math.floor(rect.y+(axis?i:j))));
        const p=(y*image.width+x)*4;
        if(!colorful(image.data[p],image.data[p+1],image.data[p+2]))blank++;
      }
      profiles[axis].push(blank/cross);
    }
  }
  const candidates=[];
  for(let size=6;size<=12;size++){
    const scores=profiles.map(profile=>{
      let best=-1;
      for(let gap=1;gap<=Math.min(12,profile.length/size/3);gap+=0.5){
        const step=(profile.length+gap)/size;
        const sample=x=>profile[Math.max(0,Math.min(profile.length-1,Math.round(x)))]||0;
        let borders=0,centers=0;
        for(let k=1;k<size;k++)borders+=sample(k*step-gap/2-0.5);
        for(let k=0;k<size;k++)centers+=sample((k+0.5)*step-gap/2);
        best=Math.max(best,borders/(size-1)-centers/size);
      }
      return best;
    });
    candidates.push({size,score:Math.min(...scores)});
  }
  candidates.sort((a,b)=>b.score-a.score);
  return candidates[0].score>0.45 && candidates[0].score-candidates[1].score>0.12 ? candidates[0].size : null;
}
const distance=(a,b)=>a.reduce((sum,v,i)=>sum+(v-b[i])**2,0);
function feature([r,g,b]) {
  r/=255;g/=255;b/=255;
  const max=Math.max(r,g,b),min=Math.min(r,g,b),delta=max-min;
  let hue=0;
  if(delta) hue=max===r?((g-b)/delta+6)%6:max===g?(b-r)/delta+2:(r-g)/delta+4;
  const saturation=max?delta/max:0;
  return [Math.cos(hue*Math.PI/3)*saturation*100,Math.sin(hue*Math.PI/3)*saturation*100,saturation*55,max*35];
}
export function detectBoard({data,width,height}) {
  const rows=Array(height).fill(0);
  for(let y=0;y<height;y++) for(let x=0;x<width;x++) {
    const p=(y*width+x)*4;if(colorful(data[p],data[p+1],data[p+2]))rows[y]++;
  }
  const threshold=Math.max(8,Math.max(...rows)*0.45);
  let start=-1,last=-1,best=[0,0];
  for(let y=0;y<=height+8;y++) {
    if(y<height&&rows[y]>=threshold){if(start<0)start=y;last=y;}
    else if(start>=0&&y-last>8){if(last-start>best[1]-best[0])best=[start,last];start=-1;}
  }
  if(best[1]-best[0]<20) return {x:0,y:0,width,height};
  const cols=Array(width).fill(0);
  for(let y=best[0];y<=best[1];y++)for(let x=0;x<width;x++){
    const p=(y*width+x)*4;if(colorful(data[p],data[p+1],data[p+2]))cols[x]++;
  }
  const xs=cols.flatMap((n,x)=>n>(best[1]-best[0])*0.15?[x]:[]);
  return xs.length?{x:xs[0],y:best[0],width:xs.at(-1)-xs[0]+1,height:best[1]-best[0]+1}:{x:0,y:0,width,height};
}
export function recognizeRegions(image,rect,size) {
  if(!Number.isInteger(size)||size<6||size>12||rect.width<2*size||rect.height<2*size)throw Error('请框选完整棋盘，并选择正确尺寸。');
  const samples=[];
  for(let row=0;row<size;row++)for(let col=0;col<size;col++){
    const pixels=[];
    // Avoid cow faces and × marks in the center; sample several corner patches.
    for(const fy of [.17,.23,.29,.71,.77,.83])for(const fx of [.17,.23,.29,.71,.77,.83]){
      const x=Math.max(0,Math.min(image.width-1,Math.floor(rect.x+(col+fx)*rect.width/size)));
      const y=Math.max(0,Math.min(image.height-1,Math.floor(rect.y+(row+fy)*rect.height/size)));
      const p=(y*image.width+x)*4,rgb=[image.data[p],image.data[p+1],image.data[p+2]];
      if(colorful(...rgb))pixels.push(rgb);
    }
    if(pixels.length<4)throw Error(`第 ${row+1} 行、第 ${col+1} 列颜色不清楚，请调整框选范围或使用更清晰的截图。`);
    samples.push(feature([0,1,2].map(c=>pixels.map(p=>p[c]).sort((a,b)=>a-b)[Math.floor(pixels.length/2)])));
  }
  const centers=[[...samples[0]]];
  while(centers.length<size){
    let farthest=samples[0],max=-1;
    for(const sample of samples){const d=Math.min(...centers.map(c=>distance(sample,c)));if(d>max){max=d;farthest=sample;}}
    if(max<0.01)throw Error('识别到的颜色不足，请检查棋盘尺寸与框选范围。');
    centers.push([...farthest]);
  }
  let regions=[];
  for(let iteration=0;iteration<30;iteration++){
    regions=samples.map(sample=>{let best=0;centers.forEach((c,i)=>{if(distance(sample,c)<distance(sample,centers[best]))best=i;});return best;});
    centers.forEach((center,color)=>{const group=samples.filter((_,i)=>regions[i]===color);if(group.length)centers[color]=center.map((_,k)=>group.reduce((sum,v)=>sum+v[k],0)/group.length);});
  }
  return regions;
}
