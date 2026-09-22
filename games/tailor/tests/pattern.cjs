const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
const context = { console };
vm.createContext(context);
vm.runInContext(fs.readFileSync(path.join(__dirname, '../js/pattern-engine.js'), 'utf8'), context);
const engine = context.TailorPattern;
const designs = [engine.customer, { ...engine.customer, bust: 100, highBust: 94, underbust: 84, waist: 82, hips: 110 }, { ...engine.customer, bust: 86, highBust: 81, underbust: 73, waist: 68, hips: 94 }];
for (const size of designs) {
    const pattern = engine.generate(size);
    const [front, back, skirtFront, skirtBack, liningFront, liningBack] = pattern.pieces;
    assert.equal(pattern.pieces.reduce((sum, p) => sum + p.quantity, 0), 9);
    assert.ok(Math.abs(front.sideLength - back.sideLength) < .01, 'Side seams must walk after closing the bust dart');
    assert.equal(front.waistLength, skirtFront.waistLength);
    assert.equal(back.waistLength, skirtBack.waistLength);
    assert.equal(skirtFront.sideLength, skirtBack.sideLength);
    assert.ok(pattern.hipCircumference >= size.hips * 10 + 60 - .001);
    assert.deepEqual(front.cut, liningFront.cut);
    assert.deepEqual(back.cut, liningBack.cut);
    assert.ok(front.fold && !back.fold);
    assert.equal(front.marks.filter(m => m.type === 'dart').length, 2);
    assert.equal(back.marks.filter(m => m.type === 'dart').length, 1);
    // At the fold, front skirt seam starts at waist=0, while cut begins 15 mm above it.
    assert.ok(Math.abs(skirtFront.cut.at(-1).y + 15) < .001);
    assert.ok(Math.abs(skirtFront.cut[0].y - size.skirtLength * 10 - 30) < .001);
    assert.ok(Math.abs(skirtBack.bounds.minX + 15) < .001);
    for (const piece of pattern.pieces) {
        assert.ok(piece.bounds.maxX - piece.bounds.minX > 100);
        assert.ok(piece.bounds.maxX - piece.bounds.minX < 800);
        assert.ok(piece.cut.every(p => Number.isFinite(p.x + p.y)));
    }
}
assert.throws(() => engine.generate({ ...engine.customer, bust: NaN }));
assert.throws(() => engine.generate({ ...engine.customer, highBust: 99 }));
assert.notEqual(engine.generate(engine.customer).signature, engine.generate({ ...engine.customer, hips: 105 }).signature);
console.log('PASS: 3 sizes, 9 physical pieces, dart-aware seam matching, hip ease, 15 mm seams / 30 mm hem / zero fold allowance, lining consistency, invalid measurements');
