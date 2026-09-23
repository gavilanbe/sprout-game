'use strict';
/* ============================================================
   LA APLICACIÓN (PWA): instalarla, jugar sin red y actualizarse sin
   perder nada.
   · Registra sw.js. La primera vez avisa de que ya funciona sin conexión.
   · Actualizaciones: la versión nueva se instala sola en segundo plano (se
     busca al abrir, al volver a la app y cada 20 minutos). Si estás en el
     arranque, el título o las partidas, se aplica al momento; si estás
     jugando, un aviso («versión nueva: toca para actualizar») y se aplica al
     tocarlo o en cuanto vuelvas al título, guardando antes. Tras recargar,
     un aviso breve con la versión nueva.
   · Instalar: el botón del navegador (Android, escritorio) se ofrece en el
     título; en iPhone, una pista de cómo añadirlo a la pantalla de inicio.
   · En el móvil: la pantalla no se apaga mientras juegas; al salir de la
     app el juego se pausa en el zurrón, guarda y calla la música, y al
     volver sigue donde estaba. Se pide almacenamiento persistente para que
     el navegador no borre las partidas.
   ============================================================ */
const PWA={reg:null,updateReady:false,install:null,notice:null,noticeT:0,dismissed:{}};
function pwaStandalone(){ return matchMedia('(display-mode: standalone)').matches||matchMedia('(display-mode: fullscreen)').matches||navigator.standalone===true; }
function pwaIOS(){ return /iphone|ipad|ipod/i.test(navigator.userAgent)||(navigator.platform==='MacIntel'&&navigator.maxTouchPoints>1); }
function pwaCanSave(){ return introDone&&!['boot','title','file','cine','dying','over','ending','seasoncine','credits'].includes(state); }
function pwaCalm(){ return ['boot','title','file'].includes(state); } // aquí recargar no pierde nada
function pwaApply(){ if(pwaCanSave()) try{ save(); }catch(_){} try{ sessionStorage.setItem('sprout.updated',GAME_VERSION); }catch(_){} location.reload(); }

/* ---------- el aviso: una pastilla con dos líneas en píxeles del juego ---------- */
const NOTICE=document.getElementById('notice'), NOTICE_TXT={ // la segunda línea, en la fuente con tildes y eñes
  update:()=>['VERSIÓN NUEVA',TOUCH?'Toca para actualizar':'Haz clic para actualizar'],
  updated:()=>['¡ACTUALIZADO!','Versión '+GAME_VERSION.slice(0,10)],
  ready:()=>['LISTO SIN CONEXIÓN','SPROUT ya funciona sin red'],
  install:()=>['INSTALAR SPROUT',TOUCH?'En tu pantalla de inicio':'Como aplicación'],
  ios:()=>['A PANTALLA COMPLETA','Compartir → Añadir a inicio']};
function noticeArt(k){ const [a,b]=NOTICE_TXT[k](), A=textArt(a,'#fff6d8',FONT_M,'#0a100c'), B=textArt(b,'#9ec7aa',FONT_M), c=mkCanvas(Math.max(A.width,B.width),A.height+B.height-2), g=c.getContext('2d');
  g.drawImage(A,(c.width-A.width)>>1,0); g.drawImage(B,(c.width-B.width)>>1,A.height-2); return c; }
function placeNotice(){ // en el móvil, encima del logotipo gavilanbe (sin tapar los mandos); en escritorio, arriba al centro
  if(!NOTICE||!TOUCH) return; const r=document.getElementById('brand').getBoundingClientRect();
  NOTICE.style.left=(r.left+r.width/2)+'px'; NOTICE.style.top=(r.top+r.height/2)+'px'; }
function showNotice(k,secs){ if(!NOTICE) return; PWA.notice=k; PWA.noticeT=secs?performance.now()+secs*1000:0;
  pixCanvas(document.getElementById('noticeTxt'),noticeArt(k),TOUCH?1.25:1.5); NOTICE.dataset.k=k; placeNotice(); NOTICE.hidden=false; requestAnimationFrame(()=>NOTICE.classList.add('show')); }
window.addEventListener('resize',()=>setTimeout(placeNotice,50));
function hideNotice(k){ if(!NOTICE||(k&&PWA.notice!==k)) return; PWA.notice=null; NOTICE.classList.remove('show'); setTimeout(()=>{ if(!PWA.notice) NOTICE.hidden=true; },400); }
if(NOTICE){ NOTICE.tabIndex=-1; NOTICE.addEventListener('pointerdown',e=>e.preventDefault());
  NOTICE.addEventListener('click',async()=>{ const k=PWA.notice; NOTICE.blur();
    if(k==='update') pwaApply();
    else if(k==='install'&&PWA.install){ hideNotice('install'); PWA.dismissed.install=true; try{ PWA.install.prompt(); await PWA.install.userChoice; }catch(_){} PWA.install=null; }
    else if(k==='ios'){ hideNotice('ios'); try{ localStorage.setItem('sprout.iosHint',String(Date.now())); }catch(_){} }
    else hideNotice(k); }); }

/* ---------- el service worker: sin red y actualizaciones ---------- */
if('serviceWorker' in navigator&&location.protocol.startsWith('http')){
  let hadCtrl=!!navigator.serviceWorker.controller;
  navigator.serviceWorker.addEventListener('controllerchange',()=>{
    if(!hadCtrl){ hadCtrl=true; try{ if(!localStorage.getItem('sprout.offline')){ localStorage.setItem('sprout.offline','1'); showNotice('ready',5); } }catch(_){} return; }
    PWA.updateReady=true; if(pwaCalm()) pwaApply();
    else { showNotice('update'); if(typeof showToast==='function') showToast('¡VERSIÓN NUEVA!','se aplica al volver al título'); } });
  const reg=()=>navigator.serviceWorker.register('sw.js',{updateViaCache:'none'}).then(r=>{ PWA.reg=r;
    setInterval(()=>{ if(document.visibilityState==='visible') r.update().catch(()=>{}); },20*60*1000); }).catch(()=>{});
  if(document.readyState==='complete') reg(); else window.addEventListener('load',reg);
}
try{ const v=sessionStorage.getItem('sprout.updated'); if(v){ sessionStorage.removeItem('sprout.updated'); setTimeout(()=>showNotice('updated',5),600); } }catch(_){}

/* ---------- instalar ---------- */
window.addEventListener('beforeinstallprompt',e=>{ e.preventDefault(); PWA.install=e; });
window.addEventListener('appinstalled',()=>{ PWA.install=null; hideNotice('install'); });
setInterval(()=>{ // cada segundo: qué aviso toca según dónde estés
  if(PWA.noticeT&&performance.now()>PWA.noticeT) hideNotice(PWA.notice);
  if(PWA.updateReady&&pwaCalm()) { pwaApply(); return; }
  if(PWA.notice==='update'||PWA.notice==='updated'||PWA.notice==='ready') return;
  const title=state==='title'&&!pwaStandalone();
  let iosOld=true; try{ iosOld=Date.now()-(+localStorage.getItem('sprout.iosHint')||0)>7*864e5; }catch(_){}
  const want=title&&PWA.install&&!PWA.dismissed.install?'install':title&&pwaIOS()&&iosOld&&!PWA.dismissed.ios?'ios':null;
  if(want&&PWA.notice!==want) showNotice(want); else if(!want&&(PWA.notice==='install'||PWA.notice==='ios')) hideNotice(PWA.notice);
},1000);
/* en pantalla completa de verdad, el botón de pantalla completa sobra */
if(matchMedia('(display-mode: fullscreen)').matches){ const b=document.getElementById('fsBtn'); if(b) b.remove(); }

/* ---------- el móvil: pantalla encendida, pausa al salir, almacenamiento que no se borra ---------- */
let pwaWake=null, pwaPersist=false;
async function pwaKeepAwake(){ if(!TOUCH||!('wakeLock' in navigator)||pwaWake||document.visibilityState!=='visible') return;
  try{ pwaWake=await navigator.wakeLock.request('screen'); pwaWake.addEventListener('release',()=>{ pwaWake=null; }); }catch(_){} }
document.addEventListener('pointerdown',()=>{ pwaKeepAwake();
  if(!pwaPersist){ pwaPersist=true; try{ if(navigator.storage&&navigator.storage.persist) navigator.storage.persist().catch(()=>{}); }catch(_){} } },{passive:true});
document.addEventListener('visibilitychange',()=>{
  if(document.visibilityState==='hidden'){
    if(state==='play'&&typeof openZurron==='function') openZurron(0); // al volver, el juego te espera en pausa
    if(pwaCanSave()) try{ save(); }catch(_){}
    try{ if(AC&&AC.state==='running') AC.suspend(); }catch(_){}
  } else {
    try{ if(AC&&AC.state!=='running'&&AC.state!=='closed') AC.resume(); }catch(_){}
    pwaKeepAwake(); if(PWA.reg) PWA.reg.update().catch(()=>{});
  } });
window.addEventListener('pagehide',()=>{ if(pwaCanSave()) try{ save(); }catch(_){} });
