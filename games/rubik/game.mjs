import { FACES, NAMES, MOVES, SLOTS, solved, apply, isSolved, inverse, reverse, simplify, rotate } from './model.mjs';
import { createGraph } from './graph.mjs';

const $ = id => document.getElementById(id);
const canvas = $('cube'), ctx = canvas.getContext('2d');
let state = solved(), history = [], undoStack = [], turns = 0;
let busy = false, searching = false, playing = false, animation = null;
let solution = [], solutionIndex = 0, worker = null;
let started = null, elapsed = 0, yaw = -.57, pitch = .43, playbackRun = 0;
let width = 0, height = 0, frame = 0;
const graph = createGraph($('graph'));
let graphFace = null;
let hitFaces = [];
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
const status = text => { $('status').textContent = text; };

function updateUI() {
  const complete = isSolved(state), locked = busy || searching || playing;
  $('move-count').textContent = String(turns).padStart(2, '0');
  $('matched').innerHTML = `${state.filter((c, i) => c === Math.floor(i / 9)).length}<span> / 54</span>`;
  $('state-label').textContent = complete ? '已还原' : '探索中';
  $('scramble').disabled = locked;
  $('difficulty').disabled = locked;
  $('undo').disabled = locked || !undoStack.length;
  $('solve').disabled = searching || (busy && !playing) || (complete && !playing);
  $('solve').textContent = searching ? '寻找路线…' : playing && solution.length ? '暂停还原' : solutionIndex < solution.length ? '继续还原' : '自动还原';
  if (playing && !solution.length) $('solve').disabled = true;
  if (complete && started !== null) { elapsed += Date.now() - started; started = null; }
  updateTimer();
}
function updateTimer() {
  const seconds = Math.floor((elapsed + (started === null ? 0 : Date.now() - started)) / 1000);
  $('timer').textContent = `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`;
}
setInterval(updateTimer, 500);

function camera(v) { return rotate(rotate(v, 1, yaw), 0, pitch); }
function project(v) {
  const distance = 9, scale = Math.min(width * .14, height * .18);
  const factor = distance / (distance - v[2]);
  return [width / 2 + v[0] * scale * factor, height * .48 - v[1] * scale * factor];
}
function draw(now = performance.now()) {
  ctx.clearRect(0, 0, width, height);
  // A soft ground shadow anchors the floating cube.
  ctx.save(); ctx.translate(width / 2, height * .81); ctx.scale(1, .17);
  const shadow = ctx.createRadialGradient(0, 0, 5, 0, 0, width * .23);
  shadow.addColorStop(0, '#33483925'); shadow.addColorStop(1, '#33483900');
  ctx.fillStyle = shadow; ctx.beginPath(); ctx.arc(0, 0, width * .24, 0, Math.PI * 2); ctx.fill(); ctx.restore();
  let progress = animation ? Math.min(1, (now - animation.start) / animation.duration) : 0;
  const eased = progress * progress * (3 - 2 * progress);
  graph.update(state, animation?.move, eased, graphFace);
  const polygons = [];
  SLOTS.forEach(({ p, n }, i) => {
    const axis = n.findIndex(value => value !== 0), a = (axis + 1) % 3, b = (axis + 2) % 3;
    const center = p.map((value, j) => value + n[j] * .5);
    const corners = [[-1, -1], [1, -1], [1, 1], [-1, 1]].map(([u, v]) => {
      const point = [...center]; point[a] += u * .475; point[b] += v * .475; return point;
    });
    let normal = n;
    if (animation && p[animation.axis] === animation.side) {
      for (let j = 0; j < 4; j++) corners[j] = rotate(corners[j], animation.axis, animation.angle * eased);
      normal = rotate(n, animation.axis, animation.angle * eased);
    }
    const camNormal = camera(normal), camCorners = corners.map(camera);
    const camCenter = camCorners.reduce((sum, v) => sum.map((x, j) => x + v[j] / 4), [0, 0, 0]);
    if (camNormal[0] * -camCenter[0] + camNormal[1] * -camCenter[1] + camNormal[2] * (9 - camCenter[2]) <= 0) return;
    polygons.push({ index: i, points: camCorners.map(project), depth: camCenter[2], color: FACES[NAMES[state[i]]].color, shade: Math.max(0, .16 - camNormal[1] * .1 - camNormal[2] * .08), center: i % 9 === 4, face: NAMES[state[i]] });
  });
  polygons.sort((a, b) => a.depth - b.depth);
  hitFaces = polygons;
  for (const polygon of polygons) {
    ctx.beginPath(); polygon.points.forEach(([x, y], i) => i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)); ctx.closePath();
    ctx.fillStyle = polygon.color; ctx.fill(); ctx.strokeStyle = '#263c37'; ctx.lineWidth = 3.5; ctx.lineJoin = 'round'; ctx.stroke();
    ctx.fillStyle = `rgba(22,38,31,${polygon.shade})`; ctx.fill();
    if (polygon.center) {
      const center = polygon.points.reduce((sum, v) => [sum[0] + v[0] / 4, sum[1] + v[1] / 4], [0, 0]);
      ctx.fillStyle = '#243e3677'; ctx.font = '600 11px monospace'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(polygon.face, ...center);
    }
  }
  if (animation) {
    if (progress < 1) frame = requestAnimationFrame(draw);
    else { const resolve = animation.resolve; animation = null; resolve(); }
  }
}
function resize() {
  const rect = canvas.getBoundingClientRect(); width = rect.width; height = rect.height;
  const dpr = Math.min(devicePixelRatio || 1, 2); canvas.width = Math.round(width * dpr); canvas.height = Math.round(height * dpr);
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0); render();
}
function render() { cancelAnimationFrame(frame); frame = requestAnimationFrame(draw); }
new ResizeObserver(resize).observe(canvas);

function drawGraph() { graph.update(state, null, 0, graphFace); }

function drawSolution() {
  $('solution').innerHTML = solution.length ? solution.map((move, i) => `<span class="move-chip ${i < solutionIndex ? 'done' : i === solutionIndex ? 'active' : ''}">${move}</span>`).join('') : '';
}
function clearSolution() {
  solution = []; solutionIndex = 0; drawSolution();
  $('solve-description').textContent = '';
}
async function turn(move, { recordUndo = true, count = true, duration = 460 } = {}) {
  busy = true; updateUI();
  const { axis, side } = FACES[move[0]];
  if (count && started === null) started = Date.now();
  await new Promise(resolve => {
    graphFace = move[0];
    $('graph-count').textContent = `${move} · 20 个色块，5 组循环`;
    animation = { move, axis, side, angle: -side * (move.endsWith("'") ? -1 : 1) * Math.PI / 2, start: performance.now(), duration: reducedMotion ? 1 : duration, resolve };
    render();
  });
  state = apply(state, move);
  history = simplify([...history, move]);
  if (recordUndo) undoStack.push(move);
  if (count) turns++;
  if (isSolved(state)) history = [];
  busy = false; render(); drawGraph(); updateUI();
  if (isSolved(state) && count) status(`还原成功！本局操作 ${turns} 步。每条走过的路，都算数。`);
}
async function manualMove(move) {
  if (busy || searching || playing) return;
  clearSolution(); status(`正在转动 ${move}…`);
  await turn(move);
  if (!isSolved(state)) status(`${move} · 新的状态，新的可能。`);
}
document.addEventListener('keydown', event => {
  if (event.ctrlKey || event.metaKey || event.altKey || /INPUT|SELECT|TEXTAREA|BUTTON/.test(event.target.tagName) || event.repeat) return;
  const face = event.key.toUpperCase();
  if (FACES[face]) { event.preventDefault(); manualMove(face + (event.shiftKey ? "'" : '')); }
});

let drag = null;
function pointerPosition(event) {
  const rect = canvas.getBoundingClientRect(); return [event.clientX - rect.left, event.clientY - rect.top];
}
function inside(point, polygon) {
  // Include the dark seams in the cube hit area, so dragging a tile boundary
  // cannot accidentally orbit the camera.
  const center = polygon.reduce((sum, p) => [sum[0] + p[0] / 4, sum[1] + p[1] / 4], [0, 0]);
  polygon = polygon.map(p => p.map((value, axis) => center[axis] + (value - center[axis]) * 1.055));
  let sign = 0;
  for (let i = 0; i < polygon.length; i++) {
    const a = polygon[i], b = polygon[(i + 1) % polygon.length];
    const cross = (b[0] - a[0]) * (point[1] - a[1]) - (b[1] - a[1]) * (point[0] - a[0]);
    if (Math.abs(cross) < .001) continue;
    if (sign && Math.sign(cross) !== sign) return false;
    sign = Math.sign(cross);
  }
  return true;
}
function touchedPoint(screenPoint, slot) {
  const scale = Math.min(width * .14, height * .18);
  const uncamera = v => rotate(rotate(v, 0, -pitch), 1, -yaw);
  const origin = uncamera([0, 0, 9]);
  const direction = uncamera([(screenPoint[0] - width / 2) / scale, -(screenPoint[1] - height * .48) / scale, -9]);
  const axis = slot.n.findIndex(n => n !== 0);
  const t = (slot.n[axis] * 1.5 - origin[axis]) / direction[axis];
  return origin.map((value, i) => value + direction[i] * t);
}
function swipeMove(start, delta) {
  const slot = SLOTS[start.hit.index], candidates = [];
  for (const face of NAMES) {
    const { axis, side } = FACES[face];
    if (slot.p[axis] !== side) continue;
    const a = project(camera(start.world));
    const b = project(camera(rotate(start.world, axis, -side * .08)));
    const tangent = [b[0] - a[0], b[1] - a[1]], length = Math.hypot(...tangent);
    if (length < .01) continue;
    const alignment = (tangent[0] * delta[0] + tangent[1] * delta[1]) / (length * Math.hypot(...delta));
    candidates.push({ move: face + (alignment < 0 ? "'" : ''), score: Math.abs(alignment) * (slot.n[axis] ? .94 : 1) });
  }
  return candidates.sort((a, b) => b.score - a.score)[0]?.move || slot.face + (delta[0] < 0 ? "'" : '');
}
canvas.addEventListener('pointerdown', event => {
  if (!event.isPrimary || event.button !== 0) return;
  const point = pointerPosition(event);
  const hit = [...hitFaces].reverse().find(face => inside(point, face.points));
  if (hit && (busy || searching || playing)) return;
  drag = { point, hit, world: hit ? touchedPoint(point, SLOTS[hit.index]) : null, yaw, pitch, consumed: false };
  canvas.focus({ preventScroll: true }); canvas.setPointerCapture(event.pointerId);
});
canvas.addEventListener('pointermove', event => {
  if (!drag || drag.consumed) return;
  const point = pointerPosition(event), delta = [point[0] - drag.point[0], point[1] - drag.point[1]];
  if (drag.hit) {
    if (Math.hypot(...delta) < 16) return;
    drag.consumed = true; manualMove(swipeMove(drag, delta));
  } else {
    yaw = drag.yaw + delta[0] * .008;
    pitch = Math.max(-1.35, Math.min(1.35, drag.pitch + delta[1] * .008)); render();
  }
});
for (const type of ['pointerup', 'pointercancel', 'lostpointercapture']) canvas.addEventListener(type, () => { drag = null; });

function newSession() {
  playbackRun++;
  worker?.terminate(); worker = null; searching = false; playing = false;
  state = solved(); history = []; undoStack = []; turns = 0; elapsed = 0; started = null;
  graphFace = null; $('graph-count').textContent = '48 个色块节点 · 中心块省略'; clearSolution();
  drawGraph(); render(); updateUI();
}
$('scramble').addEventListener('click', async () => {
  if (busy || searching || playing) return;
  newSession(); playing = true; updateUI();
  const length = Number($('difficulty').value), moves = [];
  for (let i = 0; i < length; i++) {
    const options = MOVES.filter(move => move[0] !== moves.at(-1)?.[0]);
    const random = crypto.getRandomValues(new Uint32Array(1))[0] / 4294967296;
    moves.push(options[Math.floor(random * options.length)]);
  }
  status('正在打乱，准备出发…');
  for (const move of moves) await turn(move, { recordUndo: false, count: false, duration: 85 });
  playing = false; updateUI(); status(`已打乱 ${length} 步。试着自己还原，或寻找一条回家的路。`);
});
$('undo').addEventListener('click', async () => {
  if (busy || searching || playing || !undoStack.length) return;
  clearSolution(); const move = undoStack.pop();
  await turn(inverse(move), { recordUndo: false, count: false }); turns = Math.max(0, turns - 1); updateUI();
  status(isSolved(state) ? '已撤销，魔方回到了还原状态。' : `已撤销 ${move}。`);
});

function acceptSolution(result) {
  searching = false; worker?.terminate(); worker = null;
  const exact = Array.isArray(result.moves);
  solution = exact ? result.moves : reverse(history); solutionIndex = 0;
  $('solve-description').textContent = exact
    ? `双向广度优先搜索 · 找到 ${solution.length} 步最短路（每次 90° 转动算一步）。`
    : `操作记录回溯 · ${solution.length} 步可达还原状态，这条路线不保证最短。`;
  status(exact ? `找到 ${solution.length} 步还原路线，正在自动还原。` : '沿本局操作记录，自动还原中。');
  drawSolution(); updateUI();
  playSolution();
}
$('solve').addEventListener('click', () => {
  if (playing && solution.length) { playing = false; playbackRun++; updateUI(); return; }
  if (busy || playing || searching || isSolved(state)) return;
  if (solutionIndex < solution.length) { playSolution(); return; }
  searching = true; updateUI(); status('从两端扩展状态图，搜索六步以内的最短路线…');
  try {
    worker = new Worker(new URL('./solver.mjs', import.meta.url), { type: 'module' });
    worker.onmessage = ({ data }) => acceptSolution(data);
    worker.onerror = () => acceptSolution({ error: true });
    worker.postMessage(Array.from(state));
  } catch { acceptSolution({ error: true }); }
});
async function solutionStep() {
  if (solutionIndex >= solution.length) return;
  const move = solution[solutionIndex];
  await turn(move); solutionIndex++; drawSolution(); updateUI();
  if (solutionIndex === solution.length) status('抵达终点，魔方已还原。再探索一条不同的路吧！');
  else status(`还原路径 ${solutionIndex} / ${solution.length} · 已转动 ${move}`);
}
async function playSolution() {
  if (busy || searching || solutionIndex >= solution.length) return;
  playing = true; const run = ++playbackRun; updateUI();
  while (playing && run === playbackRun && solutionIndex < solution.length) {
    await solutionStep();
    if (playing) await new Promise(resolve => setTimeout(resolve, 180));
  }
  if (run === playbackRun) { playing = false; updateUI(); }
}
newSession();
