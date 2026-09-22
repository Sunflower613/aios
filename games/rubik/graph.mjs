import { FACES, NAMES, SLOTS, PERMUTATIONS, rotate } from './model.mjs';

// The graph's vertices are the 48 movable facelets, not whole-cube states.
// Each face turn is five disjoint four-cycles. Keep that topology identical to
// the cube model; the spherical projection changes only the drawing.
export const VERTICES = SLOTS.map((slot, index) => ({ ...slot, index }))
  .filter(({ index }) => index % 9 !== 4);
export const CYCLES = Object.fromEntries(NAMES.map(face => {
  const permutation = PERMUTATIONS[face], seen = new Set(), cycles = [];
  for (const { index } of VERTICES) {
    if (seen.has(index) || permutation[index] === index) continue;
    const cycle = []; let next = index;
    do { cycle.push(next); seen.add(next); next = permutation[next]; } while (next !== index);
    cycles.push(cycle);
  }
  return [face, cycles];
}));

const dot = (a, b) => a.reduce((sum, value, i) => sum + value * b[i], 0);
const normalize = v => { const length = Math.hypot(...v); return v.map(x => x / length); };
// Look toward a cube corner. Stereographic projection turns spherical orbits
// into overlapping circles rather than straight, radial neighbor edges.
const north = normalize([1, 1, 1]);
const horizontal = normalize([1, 0, -1]);
const vertical = normalize([-1, 2, -1]);
const points = SLOTS.map(({ p, n }) => normalize(p.map((value, axis) => value + n[axis] * .8)));
function project(point) {
  const denominator = 1 - dot(point, north);
  const raw = [dot(point, horizontal) / denominator, dot(point, vertical) / denominator];
  // Compress the far side of the stereographic plane so all 48 facelets remain
  // legible, while retaining continuous, closed rotation tracks.
  const radius = Math.hypot(...raw);
  const spread = radius > 0 ? Math.log1p(radius * 3) / radius : 3;
  return raw.map(value => value * spread);
}
export function position(index, move = null, progress = 0) {
  let point = points[index];
  if (move) {
    const { axis, side } = FACES[move[0]];
    if (SLOTS[index].p[axis] === side) point = rotate(point, axis, -side * (move.endsWith("'") ? -1 : 1) * Math.PI / 2 * progress);
  }
  return project(point);
}
export const ORBITS = NAMES.flatMap(face => CYCLES[face].map((cycle, number) => {
  const { axis, side } = FACES[face], point = points[cycle[0]];
  const samples = Array.from({ length: 513 }, (_, i) => project(rotate(point, axis, -side * i / 512 * Math.PI * 2)));
  const faceRing = SLOTS[cycle[0]].face === face;
  return { face, number, cycle, samples, faceRing };
}));
const allPoints = ORBITS.flatMap(orbit => orbit.samples);
const extent = Math.max(...allPoints.flatMap(p => p.map(Math.abs)));
const scale = 220 / extent;
export const screen = point => [270 + point[0] * scale, 260 + point[1] * scale];

export function createGraph(svg) {
  const ns = 'http://www.w3.org/2000/svg';
  function element(tag, attributes, parent = svg) {
    const node = document.createElementNS(ns, tag);
    for (const [name, value] of Object.entries(attributes)) node.setAttribute(name, value);
    parent.append(node); return node;
  }
  svg.replaceChildren();
  const tracks = element('g', { class: 'orbit-tracks', fill: 'none' });
  const paths = ORBITS.map(orbit => {
    const d = orbit.samples.map((point, i) => `${i ? 'L' : 'M'}${screen(point).map(n => n.toFixed(2)).join(',')}`).join(' ') + ' Z';
    return { ...orbit, path: element('path', { d, class: `orbit-track${orbit.faceRing ? ' face-ring' : ''}`, 'data-face': orbit.face }, tracks) };
  });
  const dots = element('g', { class: 'facelet-dots' });
  const nodes = VERTICES.map(({ index }) => {
    const group = element('g', { 'data-slot': index }, dots);
    const title = element('title', {}, group);
    const circle = element('circle', { r: 8.4, stroke: '#343735', 'stroke-width': 3 }, group);
    return { index, group, title, circle };
  });
  let activeFace = null;
  return {
    update(state, move = null, progress = 0, selected = null) {
      const active = move?.[0] || selected;
      if (active !== activeFace) {
        for (const { face, path } of paths) {
          path.classList.toggle('active', face === active);
          path.style.setProperty('--orbit-color', FACES[face].color);
        }
        activeFace = active;
      }
      for (const { index, group, title, circle } of nodes) {
        const [x, y] = screen(position(index, move, progress));
        group.setAttribute('transform', `translate(${x},${y})`);
        circle.setAttribute('fill', FACES[NAMES[state[index]]].color);
        title.textContent = `${FACES[SLOTS[index].face].name}面位置 ${index % 9 + 1} · ${FACES[NAMES[state[index]]].name}面色块`;
      }
    },
  };
}
