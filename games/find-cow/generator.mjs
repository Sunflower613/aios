import { generate } from './engine.mjs?v=2';
import { generateDaily } from './daily.mjs?v=2';

self.onmessage = ({ data }) => {
  self.postMessage(typeof data === 'number' ? generate(data) : generateDaily(data.day));
};
