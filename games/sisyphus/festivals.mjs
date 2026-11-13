import calendar from '../divine/calendar.js';

const termIds = ['xiaohan','dahan','lichun','yushui','jingzhe','chunfen','qingming','guyu','lixia','xiaoman','mangzhong','xiazhi','xiaoshu','dashu','liqiu','chushu','bailu','qiufen','hanlu','shuangjiang','lidong','xiaoxue','daxue','dongzhi'];
const solarHolidays = { '1-1':['元旦','newyear'], '10-1':['国庆节','nationalday'], '10-31':['万圣节','halloween'], '12-25':['圣诞节','christmas'] };
const lunarHolidays = { '1-1':['春节','springfestival'], '1-15':['元宵节','lanternfestival'], '5-5':['端午节','dragonboat'], '7-7':['七夕','qixi'], '8-15':['中秋节','midautumn','qiufen'] };
export function localDateKey(date = new Date()) { return `${date.getFullYear()}-${date.getMonth()+1}-${date.getDate()}`; }
// Rewards follow the device's calendar date, never the manually selected scene clock.
// Traditional lunar dates and term-day tables reuse the site's 1900–2100 calendar.
export function dailyEvents(date = new Date()) {
  if (!Number.isFinite(date.getTime())) return [];
  const y=date.getFullYear(), m=date.getMonth()+1, d=date.getDate(), result=[];
  const add = event => { if(event) result.push({name:event[0], skinIds:event.slice(1)}); };
  add(solarHolidays[`${m}-${d}`]);
  if(y>=1900 && y<=2100) {
    const lunar=calendar.solar2lunar(y,m,d);
    if(lunar && lunar !== -1 && !lunar.isLeap) add(lunarHolidays[`${lunar.lMonth}-${lunar.lDay}`]);
    for(const n of [m*2-1,m*2]) if(Number(calendar.getTerm(y,n))===d) result.push({name:calendar.solarTerm[n-1],skinIds:[termIds[n-1]]});
  }
  return result;
}
export function freeSkinIds(date = new Date()) { return [...new Set(dailyEvents(date).flatMap(event=>event.skinIds))]; }
