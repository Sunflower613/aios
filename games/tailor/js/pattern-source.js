// Bella is an MIT-licensed parametric bodice block by FreeSewing.
// Import only its two bodice parts: the published entry also imports an unused sleeve.
import { Design, Path, Point } from '@freesewing/core';
import { back } from '../node_modules/@freesewing/bella/src/back.mjs';
import { frontSideDart } from '../node_modules/@freesewing/bella/src/front-side-dart.mjs';
import { cisFemaleAdult34 } from '@freesewing/models';

const Bodice = new Design({ parts: [back, frontSideDart] });
export const version = 2;
export const customer = { bust: 92.5, waist: 75, hips: 101, shoulder: 41.5, backLength: 39.5, frontLength: 40, bustHeight: 27.5, bustSpan: 16, neck: 34, highBust: 86.5, underbust: 78, shoulderSlope: 13, skirtLength: 60 };
export const limits = { bust: [84, 104], waist: [66, 88], hips: [90, 116], shoulder: [37, 45], backLength: [36, 44], frontLength: [37, 46], bustHeight: [24, 31], bustSpan: [14, 21], neck: [31, 39], highBust: [78, 100], underbust: [70, 94], shoulderSlope: [8, 20], skirtLength: [45, 75] };
const xy = p => ({ x: p.x, y: p.y });
const line = (a, b) => new Path().move(a).line(b);
export const distance = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);

export function flatten(path, spacing = 3) {
    const result = []; let last, start;
    for (const op of path.ops) {
        if (op.type === 'move') { last = op.to; start = op.to; result.push(xy(last)); continue; }
        const end = op.type === 'close' ? start : op.to;
        const len = op.type === 'curve' ? distance(last, op.cp1) + distance(op.cp1, op.cp2) + distance(op.cp2, end) : distance(last, end);
        const count = Math.max(1, Math.ceil(len / spacing));
        for (let i = 1; i <= count; i++) {
            const t = i / count, u = 1 - t;
            result.push(op.type === 'curve' ? {
                x: u ** 3 * last.x + 3 * u * u * t * op.cp1.x + 3 * u * t * t * op.cp2.x + t ** 3 * end.x,
                y: u ** 3 * last.y + 3 * u * u * t * op.cp1.y + 3 * u * t * t * op.cp2.y + t ** 3 * end.y
            } : { x: last.x + (end.x - last.x) * t, y: last.y + (end.y - last.y) * t });
        }
        last = end;
    }
    return result;
}

function mark(label, path, type = 'seam') { return { label, points: flatten(path), type }; }
function bodicePiece(part, front) {
    const p = part.points;
    // saBase bridges dart mouths: darts are sewn, never cut out as wedges.
    const outline = flatten(part.paths.saBase);
    const cut = flatten(part.paths.saBase.offset(15));
    const waist = front
        ? [line(p.cfHem, p.waistDartLeft), line(p.waistDartRight, p.sideHem)]
        : [line(p.waistCenter, p.dartBottomLeft), line(p.dartBottomRight, p.waistSide)];
    const neckline = front
        ? new Path().move(p.hps).curve(p.hpsCp2, p.cfNeckCp1, p.cfNeck)
        : new Path().move(p.hps)._curve(p.cbNeckCp1, p.cbNeck);
    const side = front
        ? [line(p.armhole, p.bustDartTop), line(p.bustDartBottom, p.sideHem)]
        : [new Path().move(p.waistSide).curve_(p.waistSideCp2, p.armhole)];
    const darts = front ? [
        mark('胸省 · 缝合不剪开', new Path().move(p.bustDartBottom)._curve(p.bustDartCpBottom, p.bustDartTip).curve_(p.bustDartCpTop, p.bustDartTop), 'dart'),
        mark('腰省 · 缝合不剪开', new Path().move(p.waistDartLeft).curve_(p.waistDartLeftCp, p.waistDartTip)._curve(p.waistDartRightCp, p.waistDartRight), 'dart')
    ] : [mark('背腰省 · 缝合不剪开', new Path().move(p.dartBottomLeft).curve_(p.dartLeftCp, p.dartTip)._curve(p.dartRightCp, p.dartBottomRight), 'dart')];
    return {
        outline, cut, fold: front ? [xy(p.cfHem), xy(p.cfNeck)] : null,
        waistLength: waist.reduce((sum, path) => sum + path.length(), 0),
        sideLength: side.reduce((sum, path) => sum + path.length(), 0),
        marks: [mark('A · 肩缝', line(p.shoulder, p.hps)), ...side.map(path => mark('B · 上身侧缝', path)),
            ...waist.map(path => mark('C · 腰节接缝', path)), mark('领口 · 保留开口', neckline, 'opening'),
            mark('袖窿 · 保留开口', part.paths.armhole, 'opening'), ...darts,
            ...(!front ? [mark('D · 后中拉链开口', new Path().move(p.cbNeck).curve_(p.cbNeckCp2, p.waistCenter), 'opening')] : [])],
        notch: xy(p.armholePitch), grain: [xy(front ? p.cfBust : p.bustCenter), xy(front ? p.cfHem : p.waistCenter)]
    };
}

function arc(radius, from, to, originY) {
    const count = Math.max(2, Math.ceil(Math.abs(to - from) * radius / 3));
    return Array.from({ length: count + 1 }, (_, i) => {
        const angle = from + (to - from) * i / count;
        return { x: Math.sin(angle) * radius, y: Math.cos(angle) * radius + originY };
    });
}
function interpolate(a, b) { return flatten(line(new Point(a.x, a.y), new Point(b.x, b.y))); }
function skirtPiece(waistLength, radius, length, front) {
    const angle = waistLength / radius, rOuter = radius + length;
    const waist = arc(radius, angle, 0, -radius), hem = arc(rOuter, 0, angle, -radius);
    const outline = [...hem, ...interpolate(hem.at(-1), waist[0]), ...waist];
    // Exact sector offsets: 15 mm seams, 30 mm hem; the front fold has zero allowance.
    const rCutHem = rOuter + 30, rCutWaist = radius - 15;
    const cutHem = arc(rCutHem, front ? 0 : -Math.asin(15 / rCutHem), angle + Math.asin(15 / rCutHem), -radius);
    const cutWaist = arc(rCutWaist, angle + Math.asin(15 / rCutWaist), front ? 0 : -Math.asin(15 / rCutWaist), -radius);
    const cut = [...cutHem, ...interpolate(cutHem.at(-1), cutWaist[0]), ...cutWaist];
    if (!front) cut.push(...interpolate(cut.at(-1), cut[0]));
    const side = [hem.at(-1), waist[0]];
    return { outline, cut, fold: front ? [waist.at(-1), hem[0]] : null, waistLength, sideLength: length,
        marks: [{ label: 'C · 腰节接缝', points: waist, type: 'seam' }, { label: 'E · 裙侧缝', points: side, type: 'seam' },
            { label: 'F · 下摆折边 3 cm', points: hem, type: 'hem' },
            ...(!front ? [{ label: 'D · 拉链延长 20 cm', points: [{ x: 0, y: 0 }, { x: 0, y: 200 }], type: 'opening' },
                { label: 'G · 后中缝', points: [{ x: 0, y: 200 }, { x: 0, y: length }], type: 'seam' }] : [])],
        notch: waist[Math.floor(waist.length / 2)], grain: [{ x: 20, y: 60 }, { x: 20, y: length - 60 }] };
}

export function generate(input) {
    const size = {};
    for (const [key, [min, max]] of Object.entries(limits)) {
        const value = Number(input[key] ?? customer[key]);
        if (!Number.isFinite(value) || value < min || value > max) throw new Error(`量体值超出本原型范围：${key}`);
        size[key] = value;
    }
    if (size.highBust > size.bust || size.underbust >= size.bust || size.waist >= size.bust || size.hips <= size.waist) throw new Error('请检查胸围、上胸围、下胸围、腰围和臀围的关系');
    const m = { ...cisFemaleAdult34, chest: size.bust * 10, waist: size.waist * 10, waistBack: size.waist * 10 * 380 / 750,
        shoulderToShoulder: size.shoulder * 10, hpsToWaistBack: size.backLength * 10, hpsToWaistFront: size.frontLength * 10,
        hpsToBust: size.bustHeight * 10, bustSpan: size.bustSpan * 10, neck: size.neck * 10, highBust: size.highBust * 10,
        underbust: size.underbust * 10, shoulderSlope: size.shoulderSlope };
    const drafted = new Bodice({ measurements: m, sa: 0, options: { chestEase: .08, fullChestEaseReduction: .03, waistEase: .04, bustDartCurve: 0, waistDartCurve: 0 } }).draft();
    const parts = drafted.parts[0];
    const front = bodicePiece(parts['bella.frontSideDart'], true), rear = bodicePiece(parts['bella.back'], false);
    const waistTotal = (front.waistLength + rear.waistLength) * 2;
    const totalAngle = Math.max(1, (size.hips * 10 + 60 - waistTotal) / 200);
    const radius = waistTotal / totalAngle;
    const skirtFront = skirtPiece(front.waistLength, radius, size.skirtLength * 10, true);
    const skirtBack = skirtPiece(rear.waistLength, radius, size.skirtLength * 10, false);
    const pieces = [
        { id: 'front', name: '前上身', material: '面布', quantity: 1, layout: '对折裁 1 片', ...front },
        { id: 'back', name: '后上身', material: '面布', quantity: 2, layout: '双层镜像裁 2 片', ...rear },
        { id: 'skirtFront', name: '前裙片', material: '面布', quantity: 1, layout: '对折裁 1 片', ...skirtFront },
        { id: 'skirtBack', name: '后裙片', material: '面布', quantity: 2, layout: '双层镜像裁 2 片', ...skirtBack },
        { id: 'liningFront', name: '前上身里布', material: '里布', quantity: 1, layout: '对折裁 1 片', ...front },
        { id: 'liningBack', name: '后上身里布', material: '里布', quantity: 2, layout: '双层镜像裁 2 片', ...rear }
    ];
    for (const p of pieces) {
        if (p.cut.some(pt => !Number.isFinite(pt.x + pt.y))) throw new Error('原型生成失败，请检查补充量体值');
        p.bounds = { minX: Math.min(...p.cut.map(pt => pt.x)), minY: Math.min(...p.cut.map(pt => pt.y)), maxX: Math.max(...p.cut.map(pt => pt.x)), maxY: Math.max(...p.cut.map(pt => pt.y)) };
    }
    return { version, signature: JSON.stringify(size), size, pieces, waistTotal, hipCircumference: totalAngle * (radius + 200), seamAllowance: 15, hemAllowance: 30 };
}

export const operations = [
    { id: 'darts', name: '缝胸省与腰省', pieces: ['front', 'back', 'liningFront', 'liningBack'], type: 'dart', hint: '面布、里布分别对折省道，沿两条省缝线车到省尖；省道内的布不要剪掉。', action: '对折省道', duration: 220 },
    { id: 'shoulders', name: '拼合肩缝 A', pieces: ['front', 'back', 'liningFront', 'liningBack'], type: 'A', hint: '面布前后片正面相对拼肩缝，里布也分别拼肩缝。', action: '对齐 A 标记', duration: 180 },
    { id: 'neck', name: '领口与里布贴合', pieces: ['front', 'back', 'liningFront', 'liningBack'], type: '领口', hint: '面布与里布正面相对，沿橙色领口边界缝一圈；修剪缝份、剪牙口并压衬线，保持领口开放。', action: '面布与里布对齐', duration: 240 },
    { id: 'armholes', name: '袖窿翻缝', pieces: ['front', 'back', 'liningFront', 'liningBack'], type: '袖窿', hint: '用卷包法分别缝两侧袖窿，修剪缝份后翻回正面；不要把袖窿两边缝死。', action: '卷包并对齐袖窿', duration: 240 },
    { id: 'sides', name: '拼上身侧缝 B', pieces: ['front', 'back', 'liningFront', 'liningBack'], type: 'B', hint: '对齐腋下接缝，把同侧面布与里布连续缝合；另一侧同样处理。', action: '对齐 B 标记', duration: 220 },
    { id: 'skirt', name: '拼裙片 E / G', pieces: ['skirtFront', 'skirtBack'], type: 'E', hint: '前裙与左右后裙拼侧缝；后中只缝拉链止点以下，保留腰下 20 cm 开口。', action: '对齐 E 与 G 标记', duration: 280 },
    { id: 'waist', name: '上身接裙片 C', pieces: ['front', 'back', 'skirtFront', 'skirtBack'], type: 'C', hint: '省道先缝合，再对齐前中、后中、侧缝与腰节对位点。只接面布，里布腰口暂留。', action: '对齐 C 腰节点', duration: 260 },
    { id: 'zip', name: '装后中隐形拉链 D', pieces: ['back', 'skirtBack'], type: 'D', hint: '拉链跨过腰节，两边腰缝对齐。缝好后，将里布后中与腰口包住缝份。', action: '对齐拉链与腰节', duration: 240 },
    { id: 'hem', name: '下摆折边与整烫 F', pieces: ['skirtFront', 'skirtBack'], type: 'F', hint: '下摆预留 3 cm，先折 1 cm 再折 2 cm，沿内折边压线；整烫后检查领口、袖窿和拉链能正常打开。', action: '折好下摆', duration: 280 }
];
