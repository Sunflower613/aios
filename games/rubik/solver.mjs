import { shortestPath } from './model.mjs';
self.onmessage = ({ data }) => {
  try { self.postMessage(shortestPath(new Uint8Array(data))); }
  catch (error) { self.postMessage({ error: error.message }); }
};
