'use strict';
/* ---------- INPUT ---------- */
const KEYMAP={ArrowLeft:'left',ArrowRight:'right',ArrowUp:'up',ArrowDown:'down',a:'left',d:'right',w:'up',s:'down',
  z:'fire',Z:'fire',' ':'fire',Enter:'menu',Escape:'menu',x:'alt',X:'alt'};
const ONESHOT=new Set(['fire','alt','menu']);
window.addEventListener('keydown',e=>{
  if(e.key==='m'||e.key==='M'){ musicOn=!musicOn; try{ localStorage.setItem('sprout.music',musicOn?'1':'0'); }catch(_){} return; }
  const k=KEYMAP[e.key]; if(!k) return; e.preventDefault();
  if(ONESHOT.has(k)){ if(!e.repeat) keys[k]=true; } else keys[k]=true;
  if(k==='fire') keys.fireHeld=true; audio();
});
window.addEventListener('keyup',e=>{ const k=KEYMAP[e.key]; if(!k) return; if(k==='fire') keys.fireHeld=false; if(!ONESHOT.has(k)) keys[k]=false; });
window.addEventListener('blur',()=>{ for(const k in keys) keys[k]=false; });
/* táctil */
if(window.matchMedia('(pointer: coarse)').matches){
  document.body.classList.add('touch');
  const bind=(id,k)=>{ const el=document.getElementById(id); if(!el) return;
    el.addEventListener('pointerdown',e=>{e.preventDefault(); keys[k]=true; if(k==='fire')keys.fireHeld=true; audio();});
    el.addEventListener('pointerup',e=>{e.preventDefault(); if(k==='fire')keys.fireHeld=false; if(!ONESHOT.has(k))keys[k]=false;});
    el.addEventListener('pointerleave',()=>{ if(k==='fire')keys.fireHeld=false; if(!ONESHOT.has(k))keys[k]=false;}); };
  bind('tU','up');bind('tD','down');bind('tL','left');bind('tR','right');bind('tA','fire');bind('tB','alt');bind('tM','menu');
  let lastTap=0;
  document.addEventListener('touchend',e=>{ const t=e.timeStamp||performance.now(); if(t-lastTap<=350) e.preventDefault(); lastTap=t; },{passive:false});
  document.addEventListener('touchmove',e=>{ if(e.touches.length>1||(e.scale&&e.scale!==1)) e.preventDefault(); },{passive:false});
  ['gesturestart','gesturechange','gestureend'].forEach(ev=>document.addEventListener(ev,e=>e.preventDefault()));
  document.addEventListener('dblclick',e=>e.preventDefault());
}
/* mando */
const GP_ONESHOT={fire:[0],alt:[1,2],menu:[8,9,3]};
const gpHeld={left:false,right:false,up:false,down:false}, gpPrev={fire:false,alt:false,menu:false};
function pollGamepad(){
  if(!navigator.getGamepads) return; let gp=null; for(const g of navigator.getGamepads()){ if(g&&g.connected){ gp=g; break; } } if(!gp) return;
  const ax=gp.axes[0]||0, ay=gp.axes[1]||0, D=.4, btn=i=>!!(gp.buttons[i]&&gp.buttons[i].pressed);
  const dir={left:ax<-D||btn(14), right:ax>D||btn(15), up:ay<-D||btn(12), down:ay>D||btn(13)};
  for(const k in dir){ if(dir[k]){ if(!gpHeld[k]){ gpHeld[k]=true; keys[k]=true; } } else if(gpHeld[k]){ gpHeld[k]=false; keys[k]=false; } }
  for(const k in GP_ONESHOT){ const p=GP_ONESHOT[k].some(btn); if(p&&!gpPrev[k]){ keys[k]=true; try{ audio(); }catch(_){} } if(k==='fire'&&(p||gpPrev[k])) keys.fireHeld=p; gpPrev[k]=p; }
}
/* escalado */
function fit(){
  if(document.body.classList.contains('touch')){
    const controls=window.innerHeight>window.innerWidth?200:0, side=controls?0:320;
    const s=Math.min((window.innerWidth-side)/VW,(window.innerHeight-controls)/VH); cv.style.width=VW*s+'px'; cv.style.height=VH*s+'px'; return; }
  const headRoom=190;
  const s=Math.max(1,Math.min(Math.floor((window.innerWidth-60)/VW),Math.floor((window.innerHeight-headRoom)/VH)));
  cv.style.width=VW*s+'px'; cv.style.height=VH*s+'px';
}
window.addEventListener('resize',fit); window.addEventListener('orientationchange',()=>setTimeout(fit,100)); fit();
