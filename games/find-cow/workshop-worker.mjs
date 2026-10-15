import { autoColor, validatePuzzle, encodePuzzle, decodePuzzle } from './puzzle.mjs?v=4';
self.onmessage=({data})=>{
  try {
    let result;
    if(data.type==='decode') result=decodePuzzle(data.code);
    else if(data.type==='encode') result=encodePuzzle(data.puzzle);
    else if(data.type==='color') result=autoColor(data.size,data.cows);
    else if(data.type==='validate') result=validatePuzzle(data.puzzle);
    else throw Error('未知操作。');
    self.postMessage({result});
  } catch(error) {self.postMessage({error:error.message});}
};
