import test from 'node:test';
import assert from 'node:assert/strict';
import {detectBoard,detectSize,recognizeRegions} from './recognition.mjs';
import {colors} from './puzzle.mjs';
test('automatic dimensions cover 6 through 12, different gutters, and marked cells',()=>{
  for(let size=6;size<=12;size++)for(const gap of [2,5,8]){
    const step=30,width=size*step+40,height=size*step+90;
    const data=new Uint8ClampedArray(width*height*4).fill(255);
    for(let row=0;row<size;row++)for(let col=0;col<size;col++){
      const rgb=colors[(row+col)%size].slice(1).match(/../g).map(v=>parseInt(v,16));
      for(let y=0;y<step-gap;y++)for(let x=0;x<step-gap;x++){
        if((row+col)%3===0 && Math.abs(x-y)<2)continue;
        const p=((45+row*step+y)*width+20+col*step+x)*4;data.set([...rgb,255],p);
      }
    }
    const image={data,width,height},rect=detectBoard(image);
    assert.equal(detectSize(image,rect),size,`${size} grid, ${gap}px gap`);
    assert.equal(new Set(recognizeRegions(image,rect,size)).size,size);
  }
});
test('a blank image does not invent a board size',()=>{
  const image={width:300,height:300,data:new Uint8ClampedArray(300*300*4).fill(255)};
  assert.equal(detectSize(image,{x:0,y:0,width:300,height:300}),null);
});
