export class Haptics {
  constructor(){this.enabled=true;this.lastMark=-Infinity;this.blocked=false;}
  get supported(){return typeof globalThis.navigator?.vibrate==='function';}
  get description(){
    if(!this.supported)return '当前浏览器不支持振动';
    if(!this.enabled)return '已关闭振动反馈';
    if(this.blocked)return '振动被拦截，请检查浏览器设置';
    return '操作触感反馈 · 开启时试振';
  }
  setEnabled(enabled){this.enabled=enabled;if(!enabled)this.vibrate(0);}
  vibrate(pattern){
    if(!this.supported)return false;
    try{const accepted=globalThis.navigator.vibrate(pattern)!==false;if(pattern!==0)this.blocked=!accepted;return accepted;}
    catch{if(pattern!==0)this.blocked=true;return false;}
  }
  play(kind){
    if(!this.enabled)return;
    const stamp=performance.now();
    if(kind==='mark'){if(stamp-this.lastMark<70)return;this.lastMark=stamp;}
    return this.vibrate({mark:25,correct:50,wrong:[50,45,50],clear:25,win:[35,45,35,45,70],lost:90,test:120}[kind]||25);
  }
}
