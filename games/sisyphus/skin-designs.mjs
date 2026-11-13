import { collectionAdditions, christmasArtwork } from './flora-festive.mjs';
import { solarArt } from './solar-art.mjs';
// Small, vector-built materials: texture rotates, lighting stays on the outer ball.
const ring = (r, color, width = .6) => `<circle cx="50" cy="50" r="${r}" fill="none" stroke="${color}" stroke-width="${width}"/>`;
const dots = (color, count = 85) => Array.from({length:count},(_,i)=>`<circle cx="${(i*37+13)%100}" cy="${(i*61+7)%100}" r="${.12+i%3*.12}" fill="${color}" opacity=".24"/>`).join('');
const path = (d, stroke, width=1, fill='none') => `<path d="${d}" fill="${fill}" stroke="${stroke}" stroke-width="${width}" stroke-linecap="round" stroke-linejoin="round"/>`;
const repeat = (body, count=2, offset=0) => Array.from({length:count},(_,i)=>`<g transform="rotate(${offset+i*360/count} 50 50)">${body}</g>`).join('');
const waves = (color, count=6, step=12) => Array.from({length:count},(_,i)=>path(`M-15 ${15+i*step}Q12 ${-4+i*step} 40 ${15+i*step}T95 ${15+i*step}T145 ${15+i*step}`,color,.8)).join('');
const svg = (base, body, texture='#fff') => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" aria-hidden="true"><circle cx="50" cy="50" r="50" fill="${base}"/>${body}${dots(texture)}</svg>`;
const sprig = (color) => path('M23 56Q21 29 43 19',color,.8)+[0,1,2,3].map(i=>`<ellipse cx="${25+i*4}" cy="${43-i*6}" rx="2.6" ry="6" transform="rotate(${-55+i*9} ${25+i*4} ${43-i*6})" fill="${color}" opacity="${.5+i*.1}"/>`).join('');
export const skinArt = { ...solarArt, christmas: christmasArtwork };
const petals = color => repeat('<ellipse cx="50" cy="21" rx="7" ry="12" fill="none" stroke="'+color+'" stroke-width=".7"/>',4,45);
const ball = (base, seams) => svg(base,seams);
const seam = (d,w=1.5,c='#343732') => path(d,c,w);
const polygon = (cx,cy,r,n=5,rotation=-90) => Array.from({length:n},(_,i)=>{const a=(rotation+i*360/n)*Math.PI/180;return `${cx+Math.cos(a)*r},${cy+Math.sin(a)*r}`}).join(' ');
const pentagon = (x,y,r) => `<polygon points="${polygon(x,y,r)}" fill="#353c3b" stroke="#59615b" stroke-width=".6"/>`;
const continents = path('M13 25 23 16 38 19 43 29 35 37 31 49 20 44 16 34Zm20 27 13 6 2 12-9 17-6-20Zm23-30 17-9 15 13-3 14-12 3-5 15-9-8-4-16Zm16 47 14 3 4 9-16 1Z','#75947f',.6,'#91ac8b');
const bands = (colors) => colors.map((c,i)=>path(`M-10 ${5+i*100/colors.length}Q25 ${18+i*100/colors.length} 55 ${6+i*100/colors.length}T110 ${12+i*100/colors.length}`,c,8)).join('');
const crater = (x,y,r) => `<circle cx="${x}" cy="${y}" r="${r}" fill="#0001" stroke="#fff2" stroke-width=".7"/><path d="M${x-r*.6} ${y}a${r*.6} ${r*.6} 0 0 1 ${r*.8} ${-r*.6}" fill="none" stroke="#0002" stroke-width="1"/>`;
const craters = () => [[23,27,9],[65,22,5],[74,67,11],[36,76,6],[48,48,13],[17,59,4]].map(a=>crater(...a)).join('');
const terrain = (colors) => colors.map((c,i)=>path(`M-5 ${25+i*12}Q20 ${-6+i*17} 46 ${25+i*12}T105 ${25+i*12}V105H-5Z`,'none',0,c)).join('');
const fern = color => repeat(sprig(color),4,15);
const marble = color => [0,1,2,3].map(i=>path(`M${-10+i*23} -10Q${45+i*8} 25 ${20+i*20} 47T${40+i*24} 110`,color,i%2?1.1:.4)).join('');
const lattice = (color) => '<g transform="rotate(45 50 50)">'+[10,30,50,70,90].map(v=>path(`M${v} -30v160M-30 ${v}h160`,color,.5)).join('')+'</g>';
export const additionalSkins = [
  { id: 'football', name: '足球·绿茵', color: '#dadbd0', category: '运动', note: '黑白拼片，奔向下一场', cost: 150, art: svg('#dadbd0',pentagon(50,50,15)+repeat(pentagon(50,8,12),5)+repeat(seam('M50 35 50 17M64 55 80 65',.8),5)) },
  { id: 'basketball', name: '篮球·落日', color: '#b77142', category: '运动', note: '细颗粒皮革与弧形球缝', cost: 155, art: svg('#b77142',seam('M0 50h100M50 0v100M16 0Q79 50 16 100M84 0Q21 50 84 100',1.6)+dots('#422c21',220)) },
  { id: 'tennis', name: '网球·青柠', color: '#a8b65c', category: '运动', note: '羊毛绒面的温柔弧线', cost: 160, art: svg('#a8b65c',seam('M10-5C90 10 90 90 10 105M90-5C10 10 10 90 90 105',3,'#e8e5cf')+dots('#eeedc6',170)) },
  { id: 'volleyball', name: '排球·海岸', color: '#d5cbb1', category: '运动', note: '六片弯曲的海蓝拼接', cost: 165, art: svg('#d5cbb1',repeat(seam('M50 50Q70 27 49 0M50 50Q77 53 100 43',1,'#616e79'),3)+repeat(path('M50 50Q72 22 49 0L67 0Q91 31 50 50Z','none',0,'#70889a'),3)) },
  { id: 'baseball', name: '棒球·回家', color: '#ded6c4', category: '运动', note: '一针一线缝住夏天', cost: 170, art: svg('#ded6c4',seam('M18 0Q79 50 18 100M82 0Q21 50 82 100',1.4,'#9d5d55')+Array.from({length:9},(_,i)=>seam(`M${23+Math.sin(i/8*Math.PI)*25} ${7+i*11}l5 3m${44-Math.sin(i/8*Math.PI)*50} -3-5 3`,.8,'#a45e55')).join('')) },
  { id: 'billiard', name: '台球·黑八', color: '#303b3b', category: '运动', note: '哑光黑与象牙白的默契', cost: 175, art: svg('#303b3b','<circle cx="50" cy="50" r="20" fill="#d9d7c6"/>'+seam('M50 49c-15 0-14-20 0-20s15 20 0 20c-16 0-16 22 0 22s16-22 0-22',2.6,'#35413e')) },
  { id: 'golf', name: '高尔夫·晨雾', color: '#d4ddd5', category: '运动', note: '细小凹窝，收集清晨微光', cost: 180, art: svg('#d4ddd5',Array.from({length:64},(_,i)=>crater(5+i%8*13,5+Math.floor(i/8)*13,3)).join('')) },
  { id: 'bowling', name: '保龄球·靛蓝', color: '#485771', category: '运动', note: '深蓝树脂里的慢流云纹', cost: 185, art: svg('#485771',marble('#9fa9b94d')+[[43,34,4],[58,34,4],[50,49,6]].map(([x,y,r])=>`<circle cx="${x}" cy="${y}" r="${r}" fill="#1c2e43" stroke="#8592a3"/>`).join('')) },
  { id: 'handball', name: '手球·赤陶', color: '#b58269', category: '运动', note: '磨砂拼片与低饱和赤陶', cost: 190, art: svg('#b58269',repeat(seam('M50 50 16 21M50 50 82 20',1,'#e2c2a0'),3)+ring(32,'#805c4f',1)) },
  { id: 'waterpolo', name: '水球·浪花', color: '#c8b779', category: '运动', note: '暖沙与浅海编织的球面', cost: 195, art: svg('#c8b779',repeat(path('M50 50Q20 35 0 48V20Q29 4 50 50Z','#5f8e97',1,'#6c9aa1'),3)+repeat(seam('M50 50Q69 22 49 0',1,'#ede1b8'),3)) },
  { id: 'mercury', name: '水星·古老回声', color: '#8b8981', category: '行星', note: '无声陨坑，保存太阳系的记忆', cost: 200, art: svg('#8b8981',craters()+marble('#bbb6a02b')) },
  { id: 'venus', name: '金星·浓云', color: '#b7a27a', category: '行星', note: '云层裹住一整个黄昏', cost: 205, art: svg('#b7a27a',bands(['#d1bd91','#a79670','#d9c8a4','#b6a17a','#c7b797','#a6906d','#cdbc97'])) },
  { id: 'earth', name: '地球·蓝色故乡', color: '#4e7e93', category: '行星', note: '海洋、陆地，与很薄的云', cost: 210, art: svg('#4e7e93',continents+path('M7 39Q30 25 47 35M55 61q20-10 38-4M28 85q28 10 54-2','#edf0df88',2.5)) },
  { id: 'mars', name: '火星·赤色荒原', color: '#ad7059', category: '行星', note: '风蚀峡谷与遥远的归途', cost: 215, art: svg('#ad7059',craters()+path('M14 49Q40 61 81 40M17 53Q44 66 85 44','#774f42',1.5)+'<ellipse cx="50" cy="4" rx="23" ry="6" fill="#d9c4ac"/>') },
  { id: 'jupiter', name: '木星·风暴之眼', color: '#baa084', category: '行星', note: '条带云海中的百年风暴', cost: 220, art: svg('#baa084',bands(['#d5c4a6','#ad8264','#cdb89a','#e0ceac','#a78066','#ceaf88','#b99578','#dfc7a0'])+'<ellipse cx="68" cy="67" rx="14" ry="7" fill="#a76c55"/>'+path('M56 67q12-8 24 0q-12 5-24 0','#ce9973',1)) },
  { id: 'saturn', name: '土星·环之诗', color: '#c3b38f', category: '行星', note: '冰与尘埃写成的同心诗', cost: 225, art: svg('#c3b38f',bands(['#d0c6a5','#ae9f7d','#d5c6a4','#b6a785','#d4c29c'])) },
  { id: 'uranus', name: '天王星·静蓝', color: '#90b9b8', category: '行星', note: '淡青色的寂静远方', cost: 230, art: svg('#90b9b8',bands(['#a9cbca','#95bfc1','#a6c6c4','#81aab1','#a0c1c1'])) },
  { id: 'neptune', name: '海王星·深潮', color: '#4d6e98', category: '行星', note: '遥远蓝调里的疾风', cost: 235, art: svg('#4d6e98',bands(['#6484a6','#506e98','#718da9','#41618b','#6d8ba8'])+'<ellipse cx="63" cy="57" rx="12" ry="5" fill="#385879"/>') },
  { id: 'pluto', name: '冥王星·心之原', color: '#a79a89', category: '行星', note: '边缘世界，也有柔软的心', cost: 240, art: svg('#a79a89',craters()+path('M49 48C23 13 10 58 50 80 90 58 77 13 49 48Z','none',0,'#d0c1a9')) },
  { id: 'titan', name: '泰坦·雾海', color: '#b19a6d', category: '行星', note: '朦胧大气下的琥珀色湖泊', cost: 245, art: svg('#b19a6d',marble('#ddc89b66')+path('M17 28q17-12 24 4l-8 15-16-7Zm39 32q18-15 25 0l-3 14-16 5Z','none',0,'#797957')) },
  { id: 'biome_highland', name: '荒山·岩脊', color: '#8c8b79', category: '群系', note: '层叠岩脊，岁月沉积', cost: 250, art: svg('#8c8b79',terrain(['#9e9e89','#828b7c','#646f64'])) },
  { id: 'biome_snow', name: '雪山·银岭', color: '#a5bbc2', category: '群系', note: '雪线以上，万物安静', cost: 255, art: svg('#a5bbc2',terrain(['#d5e0db','#b7cdd1','#8ba5af'])) },
  { id: 'biome_desert', name: '沙漠·沙时', color: '#b9a17a', category: '群系', note: '风将流沙写成等高线', cost: 260, art: svg('#b9a17a',waves('#dfc7a0',8,10)+terrain(['#b59a6b55','#987b5155'])) },
  { id: 'biome_jungle', name: '雨林·翡翠', color: '#45685a', category: '群系', note: '重叠叶脉里的湿润呼吸', cost: 265, art: svg('#45685a',fern('#9bb490')+ring(30,'#6e8b71',.5)) },
  { id: 'biome_coast', name: '海岸·潮汐', color: '#6e9799', category: '群系', note: '海水留在石头里的回声', cost: 270, art: svg('#6e9799',terrain(['#a8c4bb','#7ca8a7','#537b86'])+waves('#dbdfcb88',5,18)) },
  { id: 'biome_volcano', name: '火山·余烬', color: '#514b49', category: '群系', note: '冷却玄武岩，暗处仍有火', cost: 275, art: svg('#514b49',marble('#c88b5c')+marble('#d7a17166')) },
  { id: 'biome_bamboo', name: '竹林·听风', color: '#718a69', category: '群系', note: '风过竹节，声落青石', cost: 280, art: svg('#718a69',repeat(path('M24 10v60m-4-44h8m-8 22h8m-8 19h8','#c3d0a5',1.8),2)+sprig('#adb991')) },
  { id: 'biome_cherry', name: '樱林·花筏', color: '#b89ca5', category: '群系', note: '花瓣在浅水里缓慢相逢', cost: 285, art: svg('#b89ca5',petals('#e5c9cb')+waves('#e5d4cf55',4,26)) },
  { id: 'biome_meadow', name: '草甸·风痕', color: '#91a17e', category: '群系', note: '细草与浅金色的风', cost: 290, art: svg('#91a17e',fern('#ccd1a4')+dots('#ebe2bb',40)) },
  { id: 'biome_badlands', name: '恶地·层年', color: '#a6806b', category: '群系', note: '每一层岩色都是一个年代', cost: 295, art: svg('#a6806b',bands(['#d0af90','#aa7e68','#c49a7b','#996d5c','#d3b392','#ad8570'])) },
  { id: 'biome_swamp', name: '沼泽·幽潭', color: '#526d65', category: '群系', note: '深水倒映沉默的枝桠', cost: 300, art: svg('#526d65',waves('#8aa49a',4,23)+repeat(sprig('#9da58a'))) },
  { id: 'biome_icefield', name: '冰原·蓝裂', color: '#91b2bc', category: '群系', note: '冰下的蓝，细如瓷裂', cost: 305, art: svg('#91b2bc',marble('#e0eeea')+repeat(path('M8 18 31 42 25 64 44 85M31 42l22-7','#bcd6da',.8))) },
  { id: 'celadon', name: '汝窑·天青', color: '#97b3ae', category: '雅物', note: '雨过天青，冰裂细如丝', cost: 310, art: svg('#97b3ae',marble('#617f7955')+ring(42,'#c1d0bd',.4)) },
  { id: 'bluewhite', name: '青花·缠枝', color: '#d8dfd4', category: '雅物', note: '釉白与钴蓝，留一圈余白', cost: 315, art: svg('#d8dfd4',repeat(sprig('#4c7090'),4)+ring(42,'#4c7090',.7)+ring(39,'#6f8da0',.3)) },
  { id: 'kintsugi', name: '金缮·重逢', color: '#535f5e', category: '雅物', note: '裂痕也可以是金色的路', cost: 320, art: svg('#535f5e',marble('#c0a575')) },
  { id: 'jade', name: '碧玉·含烟', color: '#699087', category: '雅物', note: '半透明的绿，温润不争', cost: 325, art: svg('#699087',marble('#c5d7bd66')+waves('#416e6429',4,28)) },
  { id: 'agate', name: '玛瑙·层梦', color: '#a5847c', category: '雅物', note: '一层一层，把时间包裹', cost: 330, art: svg('#a5847c',[12,19,22,31,35,43].map((r,i)=>ring(r,['#e0c9b5','#765f5f','#c4a38c'][i%3],i%2?1:2)).join('')) },
  { id: 'obsidian', name: '黑曜·镜湖', color: '#3d474a', category: '雅物', note: '沉静表面，藏着微光', cost: 335, art: svg('#3d474a',marble('#7a8e9444')+path('M14 65Q30 20 66 18','#b3c0bd55',.6)) },
  { id: 'amber', name: '琥珀·封存', color: '#b38b53', category: '雅物', note: '一小段森林，留在金色里', cost: 340, art: svg('#b38b53',repeat(sprig('#7d6a47'),2)+marble('#e1bd7455')) },
  { id: 'pearl', name: '珍珠·月晕', color: '#d0c8c0', category: '雅物', note: '柔和珠光，不必刺眼', cost: 345, art: svg('#d0c8c0',waves('#a9afb33b',5,20)+ring(38,'#e5dcd0',.3)) },
  { id: 'copper', name: '铜绿·古意', color: '#6f9182', category: '雅物', note: '氧化的青绿覆盖旧日铜金', cost: 350, art: svg('#6f9182',repeat(sprig('#baa979'),4)+ring(43,'#c0ac79',.6)) },
  { id: 'wood', name: '木纹·年轮', color: '#9c8166', category: '雅物', note: '树记得每一年的风', cost: 355, art: svg('#9c8166',[9,16,23,29,36,42,47].map(r=>ring(r,'#69574488',.8)).join('')+marble('#bca38666')) },
  { id: 'linen', name: '亚麻·素织', color: '#b7af99', category: '雅物', note: '经纬之间，朴素而轻盈', cost: 360, art: svg('#b7af99',lattice('#e0d7be')+dots('#736f5d',170)) },
  { id: 'ink', name: '水墨·远岫', color: '#c4c9bd', category: '雅物', note: '不画满，山水自有回响', cost: 365, art: svg('#c4c9bd',terrain(['#9aa59d66','#788b8588','#596f6c88'])+repeat(path('M20 17q7-4 14 0','#586d6a',.5))) },
  { id: 'lapis', name: '青金·碎星', color: '#435e7d', category: '雅物', note: '深蓝石面，散落细金', cost: 370, art: svg('#435e7d',marble('#8c9daa44')+dots('#e4c78b',70)) },
  { id: 'rosequartz', name: '蔷薇石·柔光', color: '#c2a3a4', category: '雅物', note: '玫瑰色矿物里的清晨', cost: 375, art: svg('#c2a3a4',marble('#ecdad1aa')+marble('#9e7e8733')) },
  { id: 'mosaic', name: '马赛克·旧庭', color: '#8f9c91', category: '雅物', note: '低饱和的小块旧时光', cost: 380, art: svg('#8f9c91',Array.from({length:49},(_,i)=>`<rect x="${i%7*15-2}" y="${Math.floor(i/7)*15-2}" width="13" height="13" rx="1" fill="${['#bdb99e','#8caaa2','#698888','#c6ad98'][(i*13)%4]}"/>`).join('')) },
  { id: 'enamel', name: '珐琅·海棠', color: '#547e80', category: '雅物', note: '细金描边，温润釉彩', cost: 385, art: svg('#547e80',petals('#c8b889')+repeat(sprig('#b8bd9b'),4)+ring(43,'#ccb983',.8)) },
  { id: 'porcelain', name: '白瓷·留白', color: '#d5d8ce', category: '雅物', note: '让空白也成为一种纹样', cost: 390, art: svg('#d5d8ce',ring(41,'#a7b8ad',.5)+repeat(sprig('#a3b4a8'),2)) },
  { id: 'meteorite', name: '陨铁·来信', color: '#646d73', category: '雅物', note: '来自远方的交错晶纹', cost: 395, art: svg('#646d73',lattice('#a4b0ac55')+craters()) },
  ...collectionAdditions,
];
for (const skin of additionalSkins) skinArt[skin.id] = skin.art;
