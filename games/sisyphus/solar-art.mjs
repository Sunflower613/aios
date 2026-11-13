// Paper-cut / enamel illustrations following the supplied solar-term reference.
const p = (d, fill, stroke='#fff4', width=.6) => `<path d="${d}" fill="${fill}" stroke="${stroke}" stroke-width="${width}" stroke-linejoin="round" stroke-linecap="round"/>`;
const c = (x,y,r,fill,stroke='none',w=.6) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${fill}" stroke="${stroke}" stroke-width="${w}"/>`;
const e = (x,y,rx,ry,fill,stroke='#fff6') => `<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" fill="${fill}" stroke="${stroke}" stroke-width=".6"/>`;
const turn = (body,n,offset=0) => Array.from({length:n},(_,i)=>`<g transform="rotate(${offset+i*360/n} 50 50)">${body}</g>`).join('');
const ring=(r,col,w=1)=>c(50,50,r,'none',col,w);
function illustration(id, colors, draw) {
 const [base,light,petal,deep]=colors;
 const ref=name=>`url(#solar-${id}-${name})`;
 const gradient=(name,a,b)=>`<radialGradient id="solar-${id}-${name}" cx="32%" cy="22%" r="85%"><stop stop-color="${a}"/><stop offset="1" stop-color="${b}"/></radialGradient>`;
 const defs=gradient('base',light,base)+gradient('petal',petal,deep)+gradient('gold','#fff0b5','#e99921')+gradient('leaf','#c3dc6b','#46854b')+gradient('water','#f3ffff','#75bcca');
 const flecks=Array.from({length:75},(_,i)=>c((i*37+7)%100,(i*61+12)%100,.12+i%3*.1,'#fff4')).join('');
 return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" aria-hidden="true"><defs>${defs}</defs>${c(50,50,50,ref('base'))}${draw(ref)}${flecks}${ring(48.7,'#fff5',.7)}</svg>`;
}
const petal='M50 50C35 40 25 20 42 10Q50 1 58 10C75 20 65 40 50 50Z';
const flower=(r,n=5,scale=1,offset=0)=>`<g transform="translate(${50*(1-scale)} ${50*(1-scale)}) scale(${scale})">${turn(p(petal,r('petal'),'#ffe9df',.7),n,offset)}</g>`;
const stamens=(r,n=12)=>turn(p('M50 50 50 35','none','#f6cf69',.7)+c(50,34,1.7,r('gold')),n)+c(50,50,3,r('gold'));
const droplet=(r,x=50,y=50,size=1)=>`<g transform="translate(${x-50*size} ${y-50*size}) scale(${size})">${p('M50 19C46 32 33 42 33 56a17 17 0 0 0 34 0c0-14-13-24-17-37Z',r('water'),'#f1ffff',.8)}${e(44,52,3,5,'#fff9','none')}</g>`;
const dew=(r,x,y,size)=>c(x,y,size,r('water'),'#e8ffff',.8)+c(x-size*.28,y-size*.38,size*.22,'#fff');
const wheat=(r)=>p('M50 91Q18 64 31 20','none','#d8a148',1.2)+Array.from({length:7},(_,i)=>`<g transform="translate(${26+Math.pow(i-2,2)*.55} ${24+i*8}) rotate(${-10+i*7})">${p('M0 0Q-14-3-10-13Q1-10 0 0Z',r('gold'),'#ffe6a0')}${p('M0 0Q14-5 11-14Q1-11 0 0Z',r('gold'),'#ffe6a0')}</g>`).join('');
const leaf=(r,d)=>p(d,r('leaf'),'#deedac',.7);
const pine=(r)=>p('M15 62Q42 39 75 32','none','#667949',1.2)+Array.from({length:12},(_,i)=>p(`M${22+i*4} ${55-i*1.7}l${-6+i*.3} -15m${6-i*.3} 15 13 6`,'none',i%2?'#719548':'#426e43',1)).join('');
export const solarArt = {
 lichun:illustration('lichun',['#cf3d35','#ff9b66','#ef6a43','#cf3931'],r=>p('M50 4V96M50 4C10 10 10 90 50 96M50 4C90 10 90 90 50 96','none','#f2cb74',1)+e(50,8,17,4,r('gold'))+e(50,92,17,4,r('gold'))+turn(p('M50 50C30 28 17 44 30 49C45 55 53 35 46 27C35 12 29 31 50 50Z','none','#ffe18b',1.8),4)+c(50,3,3,r('gold'))),
 yushui:illustration('yushui',['#459ec7','#c4edfa','#a9e1ed','#5aa9cb'],r=>ring(39,'#c5f2ff',.8)+turn(droplet(r,50,28,.65)+p('M24 28Q50 4 76 28','none','#d5f5ff',1),2)+ring(12,'#e4faff',.8)),
 jingzhe:illustration('jingzhe',['#76569e','#c8a6de','#dbc7ef','#8a62ac'],r=>turn(p('M10 33C21 6 49 4 41 18c-7 12-22 0-11-3C19 16 17 32 10 33Z',r('petal'),'#ead8f5',.6),4)+p('M62 16 31 53h19L40 83 73 43H54Z',r('gold'),'#fff0b6',.8)),
 chunfen:illustration('chunfen',['#d77b87','#ffd3cc','#ffe4dc','#e88e9b'],r=>flower(r)+stamens(r)),
 qingming:illustration('qingming',['#d4dca4','#f4f1cc','#bdd56a','#6a9c3f'],r=>turn(p('M22 55Q12 28 45 13','none','#819343',.9)+Array.from({length:5},(_,i)=>p(`M${23+i*3} ${42-i*6}q-13-3-9-15 9 3 9 15Z`,r('petal'),'#eaf0c2',.6)).join(''),4)+ring(10,'#f0f0bf',.5)),
 guyu:illustration('guyu',['#8cac62','#e3eaa9','#cae27d','#5a953f'],r=>turn(p('M50 43Q27 27 50 9Q73 27 50 43Z',r('petal'),'#e9efb6',.9)+p('M50 40V17','none','#eaf2bd',.7)+dew(r,26,26,3),4)+dew(r,50,50,6)),
 lixia:illustration('lixia',['#d68598','#ffd2d8','#ffe5e8','#db839b'],r=>flower(r,8,1,22.5)+flower(r,8,.72)+c(50,50,9,r('gold'))+turn(c(50,45,1,'#fff5cd'),8)),
 xiaoman:illustration('xiaoman',['#e8b355','#ffedbc','#ffdf87','#c88a24'],r=>turn(`<g transform="translate(8 2) scale(.78)">${wheat(r)}</g>`,2)+ring(41,'#ffe6ad',.8)+ring(12,'#efd294',.6)),
 mangzhong:illustration('mangzhong',['#edbc63','#fff0bf','#ffdd83','#d49729'],r=>turn(`<g transform="translate(18 -1) scale(.65)">${wheat(r)}</g>`,4)+ring(9,'#fbe3a6',.6)),
 xiazhi:illustration('xiazhi',['#87a746','#d4db80','#97b750','#417c41'],r=>Array.from({length:6},(_,i)=>p(`M${-3+i*20} -10Q${18+i*20} 15 ${5+i*20} 40T${5+i*20} 110L${15+i*20} 110Q${-5+i*20} 65 ${15+i*20} 40T${7+i*20} -10Z`,'#4c8142','none')).join('')),
 xiaoshu:illustration('xiaoshu',['#619452','#b6cf7c','#c5db89','#5d954c'],r=>turn(p('M50 50Q39 34 41 5Q50 0 59 5Q62 34 50 50Z',r('leaf'),'#d7e29c',.6),9)+dew(r,72,28,6)+dew(r,31,74,5)+c(50,50,2,'#e7d984')),
 dashu:illustration('dashu',['#e99b38','#ffdc8c','#ffeaa4','#f1b64c'],r=>turn(p('M50 24Q32 18 43 3Q42 14 55 16L57 26Z',r('petal'),'#ffeebc',.6),12)+c(50,50,27,r('gold'),'#fff0b9',1)),
 liqiu:illustration('liqiu',['#d5a44d','#ffe1a0','#ffe39b','#dea842'],r=>turn(p('M50 50C43 41 18 44 12 27Q6 10 20 14Q22 1 32 12Q45 6 45 20Q53 33 50 50Z',r('petal'),'#fff0bc',.8)+p('M50 50 24 18M50 50 15 28M50 50 35 15','none','#ffe6a2',.5),4)),
 chushu:illustration('chushu',['#a497c1','#e6d7e9','#ffe8bd','#c2a078'],r=>turn(`<g transform="translate(8 2) scale(.78)">${wheat(r)}</g>`+p('M18 55Q4 25 38 14','none','#f5e9e6',1),2)+ring(38,'#e9d8e6',.5)),
 bailu:illustration('bailu',['#7e9e62','#c7d49c','#d0df96','#7f9c53'],r=>turn(p('M50 50V0m0 19-13-7m13 22 18-11','none','#d4dca4',.7),7)+dew(r,50,50,14)+turn(dew(r,50,19,4.5),6)),
 qiufen:illustration('qiufen',['#db953b','#ffe4a0','#ffe0a0','#d69336'],r=>turn(e(50,12,9,10,r('gold')),12)+c(50,50,37,r('petal'),'#f9d38d',1.2)+ring(32,'#ad6d28',1.2)+turn(p('M50 50Q31 37 38 29Q50 24 50 50Z',r('gold'),'#ffe2a3',.7),8)+c(50,50,5,r('gold'))),
 hanlu:illustration('hanlu',['#d6a04a','#ffdf92','#ffebb5','#dfad4c'],r=>flower(r,16,1,11)+flower(r,14,.76)+flower(r,12,.54,15)+c(50,50,7,r('gold'))),
 shuangjiang:illustration('shuangjiang',['#e98736','#ffbc6d','#bbc96d','#6d8b43'],r=>p('M22 77Q50 91 79 73','none','#f8b25c',1)+`<g transform="translate(10 -8) scale(.8)">${turn(p('M50 50Q28 51 24 31Q43 29 50 14Q59 31 50 50Z',r('petal'),'#e2dc8e',.7),4)}${c(50,50,5,r('gold'))}</g>`),
 lidong:illustration('lidong',['#f0d2b4','#fff0db','#ff8b65','#cd4c3f'],r=>turn(p('M50 50 44 34 34 34 39 28 30 22 40 23 37 10 46 19 50 4 54 19 63 10 60 23 70 22 61 28 66 34 56 34Z',r('petal'),'#f6c2a3',.7)+p('M50 50V13','none','#ffd5b7',.5),6)),
 xiaoxue:illustration('xiaoxue',['#80b8d0','#d4edf2','#e9f7ed','#aad7e2'],r=>turn(p('M50 50V10m0 10-8-7m8 15 12-10m-12 20-10-8','none','#f3ffff',2.1),6)+ring(13,'#d6f1f4',.7)),
 daxue:illustration('daxue',['#c3d4c7','#edf2de','#b5d18c','#57824b'],r=>turn(c(50,20,16,'#eef0e3')+`<g transform="translate(-6 6) scale(.8)">${pine(r)}</g>`,4)),
 dongzhi:illustration('dongzhi',['#b94c36','#ebaa78','#fff0cc','#e8c18b'],r=>ring(46,'#f9e9cb',2)+turn(p('M47 3h6v6h-4v-3h-5v8h9','none','#ffedcc',1),24)+c(50,50,38,'#ad673d')+turn(c(50,27,11.4,r('petal'),'#fff0cf',.5),6)+c(50,50,11.4,r('petal'))),
 xiaohan:illustration('xiaohan',['#e2969b','#ffd7cd','#f6817d','#d9565b'],r=>flower(r,5,1,36)+stamens(r,15)),
 dahan:illustration('dahan',['#8a9ccb','#d9e3f5','#f2f7ff','#a3bce5'],r=>turn(p('M50 50 40 28 50 7 60 28Z',r('petal'),'#eef6ff',.7)+p('M50 50 50 7 60 28Z','#b0c5e9','#e4efff',.4),8)+turn(p('M50 50 61 32 78 22Z','#eff5ff88','#eff7ff',.4),8)),
};
