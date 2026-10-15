import test from 'node:test';
import assert from 'node:assert/strict';
import {setupWorkshop} from './workshop.mjs';
import {autoColor,validatePuzzle,encodePuzzle} from './puzzle.mjs';

test('editor validates before offering play/share, auto-colors only blank maps, and invalidates edits',async t=>{
  class Element{
    constructor(){this.listeners={};this.children=[];this.dataset={};this.value='6';this.style={setProperty(){}};this.classList={add(){}};}
    addEventListener(type,fn){this.listeners[type]=fn;}
    setAttribute(){} replaceChildren(...children){this.children=children;} append(e){this.children.push(e);}
    showModal(){this.open=true;} close(){this.open=false;this.listeners.close?.();} focus(){}
    closest(){return this;} click(){return this.listeners.click?.();}
  }
  const elements=new Map(),get=id=>{if(!elements.has(id))elements.set(id,new Element());return elements.get(id);};
  const calls=[],played=[];
  const mocks={document:{getElementById:get,createElement:()=>new Element(),body:new Element()},Worker:class{
    terminate(){}
    postMessage(data){calls.push(data.type);queueMicrotask(()=>{
      try{const result=data.type==='color'?autoColor(data.size,data.cows):data.type==='validate'?validatePuzzle(data.puzzle):encodePuzzle(data.puzzle);this.onmessage({data:{result}});}
      catch(error){this.onmessage({data:{error:error.message}});}
    });}
  }};
  for(const [key,value] of Object.entries(mocks)){
    const descriptor=Object.getOwnPropertyDescriptor(globalThis,key);
    Object.defineProperty(globalThis,key,{configurable:true,value});
    t.after(()=>descriptor?Object.defineProperty(globalThis,key,descriptor):delete globalThis[key]);
  }
  setupWorkshop({getPuzzle:()=>null,playPuzzle:p=>played.push(p),showHome(){}});
  const edit=cell=>get('editor-board').listeners.click({detail:0,target:get('editor-board').children[cell]});
  get('open-editor').click();await get('editor-validate').click();
  assert.match(get('editor-info').textContent,/请放置/);assert.ok(!get('validated-dialog').open);
  for(const cell of [1,9,17,18,26,34])edit(cell);
  calls.length=0;await get('editor-validate').click();
  assert.deepEqual(calls,['color','validate']);assert.equal(played.length,0);assert.equal(get('validated-dialog').open,true);
  assert.equal(get('editor-share').disabled,false);assert.equal(get('editor-play').disabled,false);
  await get('editor-share').click();assert.match(get('share-code').value,/^C2/);get('share-dialog').close();
  await get('editor-validate').click();get('editor-play').click();assert.equal(played.length,1);
  get('open-editor').click();for(const cell of [1,9,17,18,26,34])edit(cell);
  get('edit-colors').click();edit(0);calls.length=0;await get('editor-validate').click();
  assert.deepEqual(calls,['validate']);assert.match(get('editor-info').textContent,/填色/);
  get('clear-colors').click();await get('editor-validate').click();get('close-validated').click();
  edit(0);assert.equal(get('editor-play').disabled,true);get('editor-play').click();assert.equal(played.length,1);
  get('clear-colors').click();assert.equal(get('editor-share').disabled,true);
});
