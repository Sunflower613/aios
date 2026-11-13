// Layered movement stays separate from progression and the fixed rock/shadow.
export const rollingDistance = (degrees, radius) => Math.max(0, degrees) * Math.PI / 180 * radius;
export function createTerrain() {
  const lines = document.getElementById('ground-lines');
  const ridge = document.getElementById('ground-ridge');
  const stones = document.getElementById('ground-stones');
  const scenery = document.getElementById('scenery');
  ridge.innerHTML = '<svg width="100%" height="36" aria-hidden="true"><defs><pattern id="ridge-pattern" width="240" height="36" patternUnits="userSpaceOnUse"><path d="M0 18Q14 18 25 12Q32 5 41 12Q48 18 63 17Q81 13 94 16Q108 19 120 11Q133 2 145 12Q155 20 174 17Q186 15 193 10Q200 8 210 15Q222 20 240 18V36H0Z" fill="currentColor"/><path d="M0 18Q14 18 25 12Q32 5 41 12Q48 18 63 17Q81 13 94 16Q108 19 120 11Q133 2 145 12Q155 20 174 17Q186 15 193 10Q200 8 210 15Q222 20 240 18" fill="none" stroke="var(--ridge-edge)" stroke-width="2"/></pattern></defs><rect width="100%" height="36" fill="url(#ridge-pattern)"/></svg>';
  function populate() {
    const count = Math.ceil(Math.max(innerWidth, innerHeight) * 2 / 50) + 24;
    stones.replaceChildren(...Array.from({ length: count }, (_, i) => {
      const seed = i % 12, rock = document.createElement('i');
      rock.style.cssText = `left:${i * 50 + seed * 13 % 27}px;top:${6 + seed * 17 % 66}px;width:${5 + seed * 7 % 13}px;height:${3 + seed * 3 % 7}px;transform:rotate(${seed * 23 % 45 - 22}deg)`;
      return rock;
    }));
  }
  populate(); window.addEventListener('resize', populate);
  let travel = 0;
  const stone = document.getElementById('stone');
  let radius = stone.clientWidth * .49;
  function resizeScale() {
    radius = stone.clientWidth * .49;
    lines.style.setProperty('--tick-gap', `${2 * Math.PI * radius}px`);
  }
  resizeScale(); new ResizeObserver(resizeScale).observe(stone);
  function update(degrees, dt) {
    if (dt <= 0) return;
    const advance = rollingDistance(degrees, radius);
    travel += advance;
    lines.style.backgroundPosition = `${-travel}px 0`;
    ridge.style.transform = `translate3d(${-travel % 240}px,0,0)`;
    stones.style.transform = `translate3d(${-travel % 600}px,0,0)`;
    scenery.style.transform = `translate3d(${-Math.sin(travel / 1800) * 20}px,${Math.sin(travel / 2600) * 2}px,0)`;
  }
  return { update };
}
