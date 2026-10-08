// Gesture state is independent of the DOM so quick taps, swipes and cancellation
// can be tested with a deterministic clock.
export class TouchInput {
  constructor(act, clock) { this.act = act; this.clock = clock; this.reset(); }
  reset() { this.gesture = null; this.lastTap = null; }
  begin(id, cell, x, y) {
    this.gesture = { id, cell, x, y, startX: x, startY: y, moved: false, seen: new Set() };
  }
  paint(cell) {
    if (cell === null || !this.gesture || this.gesture.seen.has(cell)) return;
    this.gesture.seen.add(cell); this.act(cell, 'exclude');
  }
  move(id, x, y, cellAt) {
    if (!this.gesture || this.gesture.id !== id) return;
    if (!this.gesture.moved && Math.hypot(x - this.gesture.startX, y - this.gesture.startY) < 7) return;
    if (!this.gesture.moved) { this.gesture.moved = true; this.lastTap = null; this.paint(this.gesture.cell); }
    if (!this.gesture) return;
    const fromX = this.gesture.x, fromY = this.gesture.y;
    const steps = Math.max(1, Math.ceil(Math.hypot(x - fromX, y - fromY) / 5));
    for (let i = 1; i <= steps && this.gesture; i++) this.paint(cellAt(fromX + (x - fromX) * i / steps, fromY + (y - fromY) * i / steps));
    if (this.gesture) { this.gesture.x = x; this.gesture.y = y; }
  }
  end(id, cell) {
    if (!this.gesture || this.gesture.id !== id) return;
    const completed = this.gesture; this.gesture = null;
    if (completed.moved || cell !== completed.cell) { this.lastTap = null; return; }
    const stamp = this.clock();
    if (this.lastTap?.cell === cell && stamp - this.lastTap.time <= 320) {
      this.lastTap = null; this.act(cell, 'cow');
    } else {
      this.lastTap = { cell, time: stamp }; this.act(cell, 'toggle');
    }
  }
}
