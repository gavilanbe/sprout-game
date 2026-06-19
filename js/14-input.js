'use strict';
/* ---------- INPUT ---------- */
const KEYMAP={ArrowLeft:'left',ArrowRight:'right',ArrowUp:'up',ArrowDown:'down',
  a:'left',d:'right',w:'up',s:'down',
  z:'fire',Z:'fire',' ':'fire',Enter:'menu',x:'alt',X:'alt'};
const ONESHOT=new Set(['fire','alt','menu']);
window.addEventListener('keydown',e=>{
  if(e.key==='m'||e.key==='M'){ musicOn=!musicOn;
    try{ localStorage.setItem('sprout.music',musicOn?'1':'0'); }catch(_){}
    return; }
  const k=KEYMAP[e.key]; if(!k) return;
  e.preventDefault();
  if(ONESHOT.has(k)){ if(!e.repeat) keys[k]=true; } else keys[k]=true;
  if(k==='fire') keys.fireHeld=true; // Z mantenido: carga el remolino
  audio();
});
window.addEventListener('keyup',e=>{ const k=KEYMAP[e.key]; if(!k) return;
  if(k==='fire') keys.fireHeld=false;
  if(!ONESHOT.has(k)) keys[k]=false; });

/* táctil */
if('ontouchstart' in window){
  document.body.classList.add('touch');
  const oneShot=k=>k==='fire'||k==='alt'||k==='menu';
  const bind=(id,k)=>{ const el=document.getElementById(id);
    el.addEventListener('pointerdown',e=>{e.preventDefault(); keys[k]=true; if(k==='fire')keys.fireHeld=true; audio();});
    el.addEventListener('pointerup',e=>{e.preventDefault(); if(k==='fire')keys.fireHeld=false; if(!oneShot(k))keys[k]=false;});
    el.addEventListener('pointerleave',()=>{ if(k==='fire')keys.fireHeld=false; if(!oneShot(k))keys[k]=false;}); };
  bind('tU','up');bind('tD','down');bind('tL','left');bind('tR','right');bind('tA','fire');bind('tB','alt');bind('tM','menu');

  /* nada de zoom del navegador al jugar: ni doble-tap, ni pinza, ni gesto.
     (touch-action:none ya lo bloquea en Chrome/Android; esto cubre también iOS/WebKit,
     que ignora user-scalable y necesita cancelar los gestos a mano) */
  let lastTap=0;
  document.addEventListener('touchend',e=>{
    const t=e.timeStamp||performance.now();
    if(t-lastTap<=350) e.preventDefault(); // doble-tap
    lastTap=t;
  },{passive:false});
  document.addEventListener('touchmove',e=>{
    if(e.touches.length>1||(e.scale&&e.scale!==1)) e.preventDefault(); // pinza
  },{passive:false});
  ['gesturestart','gesturechange','gestureend'].forEach(ev=>
    document.addEventListener(ev,e=>e.preventDefault()));
  document.addEventListener('dblclick',e=>e.preventDefault());
}

/* mando (Gamepad API): stick/cruceta mueven, A=Z, B=X, start/select=zurrón */
const GP_ONESHOT={fire:[0,2],alt:[1,3],menu:[8,9]};
const gpHeld={left:false,right:false,up:false,down:false};
const gpPrev={fire:false,alt:false,menu:false};
function pollGamepad(){
  if(!navigator.getGamepads) return;
  let gp=null; for(const g of navigator.getGamepads()){ if(g&&g.connected){ gp=g; break; } }
  if(!gp) return;
  const ax=gp.axes[0]||0, ay=gp.axes[1]||0, D=.4;
  const btn=i=>!!(gp.buttons[i]&&gp.buttons[i].pressed);
  const dir={left:ax<-D||btn(14), right:ax>D||btn(15), up:ay<-D||btn(12), down:ay>D||btn(13)};
  for(const k in dir){
    if(dir[k]){ if(!gpHeld[k]){ gpHeld[k]=true; keys[k]=true; } }
    else if(gpHeld[k]){ gpHeld[k]=false; keys[k]=false; }
  }
  for(const k in GP_ONESHOT){
    const p=GP_ONESHOT[k].some(btn);
    if(p&&!gpPrev[k]){ keys[k]=true; try{ audio(); }catch(_){} }
    if(k==='fire'&&(p||gpPrev[k])) keys.fireHeld=p; // solo en transiciones: no pisa al teclado
    gpPrev[k]=p;
  }
}

/* ---------- ESCALADO ---------- */
function fit(){
  if(document.body.classList.contains('touch')){
    // móvil: el lienzo agarra toda la pantalla manteniendo proporción
    // (los mandos quedan en los márgenes, sin tapar el HUD de abajo)
    const s=Math.min(window.innerWidth/VW, window.innerHeight/VH);
    cv.style.width=VW*s+'px'; cv.style.height=VH*s+'px';
    return;
  }
  // escritorio: escalado ENTERO (píxeles nítidos), dejando hueco para cabecera y pistas
  const headRoom=200;
  const s=Math.max(1,Math.min(
    Math.floor((window.innerWidth-60)/VW),
    Math.floor((window.innerHeight-headRoom)/VH)));
  cv.style.width=VW*s+'px'; cv.style.height=VH*s+'px';
}
window.addEventListener('resize',fit);
window.addEventListener('orientationchange',()=>setTimeout(fit,100));
fit();

