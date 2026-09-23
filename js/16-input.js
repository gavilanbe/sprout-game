'use strict';
/* ---------- INPUT ----------
   Teclado reasignable (opts.keys guarda la tecla principal de cada acción;
   WASD, espacio y Esc siguen valiendo mientras no choquen), táctil y mando
   con vibración (opts.vib). */
const ACTIONS=['up','down','left','right','fire','alt','menu'];
const ACTION_NAMES={up:'Arriba',down:'Abajo',left:'Izquierda',right:'Derecha',fire:'Hoja · hablar',alt:'Objeto',menu:'Zurrón'};
const DEFAULT_KEYS={up:'ArrowUp',down:'ArrowDown',left:'ArrowLeft',right:'ArrowRight',fire:'z',alt:'x',menu:'Enter'};
const ALT_KEYS={w:'up',s:'down',a:'left',d:'right',' ':'fire',Escape:'menu'};
const ONESHOT=new Set(['fire','alt','menu']);
let KEYMAP={}, remapWait=null, optRemap=false, remapSel=0, remapUD=0;
function normKey(k){ return k&&k.length===1?k.toLowerCase():k; }
function keysNow(){ return {...DEFAULT_KEYS,...((typeof opts!=='undefined'&&opts&&opts.keys)||{})}; }
function buildKeymap(){
  KEYMAP={}; const K=keysNow(), used=new Set();
  for(const a of ACTIONS){ const k=normKey(K[a]); KEYMAP[k]=a; used.add(k); }
  for(const k in ALT_KEYS) if(!used.has(k)) KEYMAP[k]=ALT_KEYS[k];
}
buildKeymap();
function keyName(k){ return ({' ':'ESPACIO',Enter:'ENTER',Escape:'ESC',ArrowUp:'↑',ArrowDown:'↓',ArrowLeft:'←',ArrowRight:'→',Shift:'MAYÚS',Control:'CTRL',Alt:'ALT',Tab:'TAB',Backspace:'BORRAR',CapsLock:'BLOQ'})[k]||String(k).toUpperCase(); }
function assignKey(action,key){ // si la tecla ya era de otra acción, se intercambian
  const K=keysNow(), k=normKey(key); opts.keys={...(opts.keys||{})};
  for(const a of ACTIONS) if(a!==action&&normKey(K[a])===k) opts.keys[a]=K[action];
  opts.keys[action]=k; saveOpts(); buildKeymap();
}
function resetKeys(){ opts.keys=null; saveOpts(); buildKeymap(); }
window.addEventListener('keydown',e=>{
  if(remapWait){ e.preventDefault(); if(e.repeat) return;
    if(e.key==='Escape'){ remapWait=null; SFX.bump(); return; }
    assignKey(remapWait,e.key); remapWait=null; SFX.equip(); return; }
  const nk=normKey(e.key);
  if(nk==='m'&&KEYMAP.m===undefined){ musicOn=!musicOn; try{ localStorage.setItem('sprout.music',musicOn?'1':'0'); }catch(_){} return; }
  const k=KEYMAP[nk]; if(!k) return; e.preventDefault();
  if(ONESHOT.has(k)){ if(!e.repeat) keys[k]=true; } else keys[k]=true;
  if(k==='fire') keys.fireHeld=true; if(k==='alt') keys.altHeld=true; audio();
});
window.addEventListener('keyup',e=>{ const k=KEYMAP[normKey(e.key)]; if(!k) return; if(k==='fire') keys.fireHeld=false; if(k==='alt') keys.altHeld=false; if(!ONESHOT.has(k)) keys[k]=false; });
window.addEventListener('blur',()=>{ for(const k in keys) keys[k]=false; });
/* la pantalla de controles (dentro de AJUSTES): acciones + restaurar + volver */
function updRemap(){
  const n=ACTIONS.length+2, ud=(keys.down?1:0)-(keys.up?1:0);
  if(ud!==remapUD){ remapUD=ud; if(ud){ remapSel=(remapSel+ud+n)%n; SFX.blip(); } }
  if(keys.menu||keys.alt){ keys.menu=false; keys.alt=false; optRemap=false; SFX.menu(); return; }
  if(keys.fire){ keys.fire=false;
    if(remapSel<ACTIONS.length){ remapWait=ACTIONS[remapSel]; SFX.blip(); }
    else if(remapSel===ACTIONS.length){ resetKeys(); SFX.equip(); showToast('CONTROLES','por defecto'); }
    else { optRemap=false; SFX.menu(); } }
}
/* vibración del mando (si lo permite y está activada) */
function rumble(ms,strong,weak){
  if(typeof opts!=='undefined'&&opts.vib===0) return; if(!navigator.getGamepads) return;
  try{ for(const g of navigator.getGamepads()){ const va=g&&g.connected&&g.vibrationActuator;
    if(va&&va.playEffect) va.playEffect(va.type||'dual-rumble',{duration:ms,strongMagnitude:strong??.5,weakMagnitude:weak??.5}).catch(()=>{}); } }catch(_){}
}
/* táctil */
if(window.matchMedia('(pointer: coarse)').matches){
  document.body.classList.add('touch');
  const bind=(id,k)=>{ const el=document.getElementById(id); if(!el) return;
    el.addEventListener('pointerdown',e=>{e.preventDefault(); keys[k]=true; if(k==='fire')keys.fireHeld=true; if(k==='alt')keys.altHeld=true; el.classList.add('down'); audio();});
    el.addEventListener('pointerup',e=>{e.preventDefault(); if(k==='fire')keys.fireHeld=false; if(k==='alt')keys.altHeld=false; if(!ONESHOT.has(k))keys[k]=false; el.classList.remove('down');});
    el.addEventListener('pointerleave',()=>{ if(k==='fire')keys.fireHeld=false; if(k==='alt')keys.altHeld=false; if(!ONESHOT.has(k))keys[k]=false; el.classList.remove('down');});
    el.addEventListener('pointercancel',()=>{ if(k==='fire')keys.fireHeld=false; if(k==='alt')keys.altHeld=false; if(!ONESHOT.has(k))keys[k]=false; el.classList.remove('down');}); };
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
  for(const k in GP_ONESHOT){ const p=GP_ONESHOT[k].some(btn); if(p&&!gpPrev[k]){ keys[k]=true; try{ audio(); }catch(_){} } if((k==='fire'||k==='alt')&&(p||gpPrev[k])) keys[k+'Held']=p; gpPrev[k]=p; }
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
/* ---------- AJUSTES (pestaña del zurrón) ---------- */
const OPT_ROWS=['texto','temblor','musica','efectos','dificultad','vibracion','controles','titulo'];
const OPT_NAMES={texto:'Texto',temblor:'Temblor',musica:'Música',efectos:'Efectos',dificultad:'Dificultad',vibracion:'Vibración',controles:'Controles',titulo:'Volver al título'};
const DIFF_NAMES=['RELAJADA','NORMAL','DIFÍCIL'];
function optAction(id,dir){ // dir: -1/+1 con ←→, 0 con Z
  if(id==='texto'){ opts.textSpeed=opts.textSpeed===1?2:1; SFX.blip(); }
  else if(id==='temblor'){ opts.shake=opts.shake?0:1; if(opts.shake) shake=6; SFX.blip(); }
  else if(id==='musica'){ if(dir){ opts.musVol=Math.max(0,Math.min(10,(opts.musVol??7)+dir)); musicOn=opts.musVol>0; } else musicOn=!musicOn;
    try{ localStorage.setItem('sprout.music',musicOn?'1':'0'); }catch(_){} applyVolumes(); SFX.blip(); }
  else if(id==='efectos'){ opts.sfxVol=Math.max(0,Math.min(10,(opts.sfxVol??8)+(dir||1)*(dir?1:0))); applyVolumes(); SFX.chime(); }
  else if(id==='dificultad'){ const d=opts.diff??1; opts.diff=dir?Math.max(0,Math.min(2,d+dir)):(d+1)%3; SFX.blip(); }
  else if(id==='vibracion'){ opts.vib=opts.vib===0?1:0; if(opts.vib) rumble(160,.6,.6); SFX.blip(); }
  else if(id==='controles'){ if(!dir){ optRemap=true; remapSel=0; remapUD=0; remapWait=null; SFX.menu(); } return; }
  else if(id==='titulo'){ if(!dir){ save(); state='title'; titleT=TITLE_MENU; parts=[]; setTrack('titulo'); SFX.menu(); } return; }
  saveOpts();
}
function updOptions(lr,ud){
  const N=OPT_ROWS.length;
  if(ud!==pauseUD){ pauseUD=ud; if(ud){ optSel=(optSel+ud+N)%N; SFX.blip(); } }
  const edge=lr!==pauseLR&&lr!==0; pauseLR=lr; const fire=keys.fire; keys.fire=false;
  if(fire) optAction(OPT_ROWS[optSel],0); else if(edge) optAction(OPT_ROWS[optSel],lr);
}
