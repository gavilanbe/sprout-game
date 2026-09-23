'use strict';
/* ============================================================
   LA CONSOLA: cómo se ve y cómo se toca el juego en la página.
   · El juego pinta en `cv` (160×144, oculto). Cada fotograma present()
     lo copia a la pantalla (#screen) con píxeles exactos: con escala entera
     va directo; si no (móvil), primero a un múltiplo entero y luego
     suavizado al tamaño real, así todos los píxeles miden lo mismo. Encima,
     la rejilla fina de una pantalla LCD.
   · fit() elige la consola en horizontal (cruceta a la izquierda, botones a
     la derecha) o en vertical (como una GBC). En escritorio todo escala por
     píxeles enteros (--u); en el móvil la consola es la pantalla entera y
     los mandos tienen tamaño de pulgar.
   · Los mandos valen para el dedo y el ratón: la cruceta se desliza entre
     direcciones (8, con más margen para las rectas), los botones no se
     sueltan si el dedo se desvía y vibran un pelín. Se hunden también
     cuando pulsas el teclado o el mando.
   · El logotipo gavilanbe, el logo de SPROUT y las etiquetas se pintan con
     los píxeles del juego. El LED de la savia late al guardar y se pone
     rojo con poca vida. Cuatro colores de carcasa en AJUSTES.
   ============================================================ */
const SHELL=document.getElementById('console'), SCR=document.getElementById('screen'), SG=SCR.getContext('2d');
const DPAD=document.getElementById('dpad'), LED=document.getElementById('led');
const TOUCH=window.matchMedia('(pointer: coarse)').matches;
if(TOUCH) document.body.classList.add('touch');
const SHELL_THEMES=[['marfil','MARFIL','#e6dcc5'],['salvia','SALVIA','#b5cca1'],['baya','BAYA','#d2495f'],['uva','UVA','#6f5bbd']];
let MID=null, MIDG=null, midN=0, GRID=null, gridN=0, shellU=4, shellLay='wide', selT=0;
const SHELL_T0=performance.now();

/* ---------- la pantalla: píxeles iguales a cualquier tamaño, con rejilla LCD ---------- */
function lcdGrid(W,H){ // la rejilla, a píxeles físicos exactos en cada borde entre píxeles del juego (sin muaré al reescalar)
  const key=W+'x'+H; if(GRID&&gridN===key) return GRID; gridN=key; GRID=mkCanvas(W,H); const g=GRID.getContext('2d'), k=W/VW;
  if(k<3) return GRID;
  g.fillStyle='rgba(0,0,0,'+(k>=6?.09:k>=4?.07:.05)+')';
  for(let i=1;i<=VW;i++) g.fillRect(Math.round(i*W/VW)-1,0,1,H); for(let j=1;j<=VH;j++) g.fillRect(0,Math.round(j*H/VH)-1,W,1);
  g.fillStyle='rgba(255,255,255,.03)'; for(let j=0;j<VH;j++) g.fillRect(0,Math.round(j*H/VH),W,1);
  return GRID; }
function present(){
  const W=SCR.width, H=SCR.height;
  if(W&&H){ const N=Math.max(1,Math.ceil(W/VW-1e-6));
    if(W===VW*N&&H===VH*N){ SG.imageSmoothingEnabled=false; SG.drawImage(cv,0,0,W,H); }
    else { if(!MID||midN!==N){ midN=N; MID=mkCanvas(VW*N,VH*N); MIDG=MID.getContext('2d'); }
      MIDG.imageSmoothingEnabled=false; MIDG.drawImage(cv,0,0,VW*N,VH*N);
      SG.imageSmoothingEnabled=true; SG.imageSmoothingQuality='high'; SG.drawImage(MID,0,0,W,H); }
    SG.drawImage(lcdGrid(W,H),0,0); }
  shellFeedback(); }

/* ---------- pintar con los píxeles del juego en la página ---------- */
function pixCanvas(el,src,cssPx){ if(!el) return; // src a 1 px por píxel; cada uno ocupa cssPx en la página (redondeado a píxeles físicos)
  const dpr=window.devicePixelRatio||1, k=Math.max(1,Math.round(cssPx*dpr));
  el.width=src.width*k; el.height=src.height*k; const g=el.getContext('2d'); g.imageSmoothingEnabled=false; g.clearRect(0,0,el.width,el.height); g.drawImage(src,0,0,el.width,el.height);
  el.style.width=(el.width/dpr)+'px'; el.style.height=(el.height/dpr)+'px'; }
function textArt(s,col,F,shadow){ F=F||FONT_S; const sh=shadow?1:0, w=Math.max(1,textW(s,F))+sh, h=F.h+F.asc+sh, c=mkCanvas(w,h), g=c.getContext('2d');
  if(shadow) drawText(g,s,1,F.asc+1,shadow,'left',F); drawText(g,s,0,F.asc,col,'left',F); return c; }
function labelArt(s,col,key){ // la etiqueta y, en escritorio, la tecla debajo en pequeño
  const a=textArt(s,col,FONT_M); if(!key) return a; const k=textArt(key,col,FONT_S), c=mkCanvas(Math.max(a.width,k.width),a.height+k.height+1), g=c.getContext('2d');
  g.drawImage(a,(c.width-a.width)>>1,0); g.globalAlpha=.6; g.drawImage(k,(c.width-k.width)>>1,a.height+1); return c; }
function brandArt(col){ // «gavilanbe» a doble tamaño y la ® a escala 1, como en el arranque
  const w=gaviMark(col), r=gaviR(col), c=mkCanvas(w.width*2+9,20), g=c.getContext('2d'); g.imageSmoothingEnabled=false;
  g.drawImage(w,0,0,w.width*2,20); g.drawImage(r,w.width*2+2,0); return c; }
let SPROUT_ART=null;
function sproutArt(){ if(SPROUT_ART) return SPROUT_ART; // el logo del título, con su sombra
  const last=LOGO_GLYPHS.length-1, W=LOGO_POS[last]+LOGO_GLYPHS[last].w-LOGO_X+6, c=mkCanvas(W,33), g=c.getContext('2d');
  LOGO_GLYPHS.forEach((gl,i)=>{ const x=LOGO_POS[i]-LOGO_X+1, y=gl.dy+3; g.globalAlpha=.4; g.drawImage(gl.dark,x+2,y+3); g.globalAlpha=1; g.drawImage(gl.img,x,y); });
  return SPROUT_ART=c; }
function fsArt(col){ const c=mkCanvas(7,7), g=c.getContext('2d'); g.fillStyle=col;
  for(const [x,y] of [[0,0],[1,0],[0,1],[5,0],[6,0],[6,1],[0,5],[0,6],[1,6],[6,5],[6,6],[5,6]]) g.fillRect(x,y,1,1); return c; }
function shellInk(){ return (getComputedStyle(SHELL).getPropertyValue('--ink')||'#34335e').trim(); }
function shellLabels(){ // todas las etiquetas, al tamaño de ahora y con la tinta de la carcasa
  if(typeof FONT_S==='undefined') return;
  const u=shellU, m=TOUCH, ink=shellInk(), lp=m?1.4:Math.max(1.5,u*.45), K=(typeof keysNow==='function')?keysNow():{fire:'z',alt:'x',menu:'Enter'};
  const kn=k=>(typeof keyName==='function'?keyName(k):String(k).toUpperCase());
  pixCanvas(document.getElementById('labTop'),textArt('MATRIZ DE HOJAS · SONIDO DE VIENTO','#c9d3d6'),Math.max(1,u*.3));
  pixCanvas(document.getElementById('labLed'),textArt('SAVIA','#c9d3d6'),Math.max(1,u*.28));
  const L=(id,s,key)=>pixCanvas(document.getElementById(id),labelArt(s,ink,m?null:key),lp); // la fuente mediana lleva tildes
  L('labA','HOJA'); L('labB','OBJETO'); L('labM','ZURRÓN',kn(K.menu)); L('labS','MÚSICA','M');
  const ab=parseFloat(SHELL.style.getPropertyValue('--ab'))||60, capPx=Math.max(1,ab*.36/7);
  pixCanvas(document.getElementById('capA'),textArt(kn(K.fire),'#6a3c0c',FONT_M,'#fff6d0'),capPx);
  pixCanvas(document.getElementById('capB'),textArt(kn(K.alt),'#5a2208',FONT_M,'#ffe0c8'),capPx);
  pixCanvas(document.getElementById('fsIco'),fsArt(ink),m?2:Math.max(1,u*.45));
  const brandPx=m?1:(shellLay==='wide'?Math.min(u*.4,(parseFloat(SHELL.style.getPropertyValue('--padw'))||180)*.82/117):u*.34);
  pixCanvas(document.getElementById('brand'),brandArt(ink),brandPx);
  const bb=parseFloat(SHELL.style.getPropertyValue('--bb'))||52;
  pixCanvas(document.getElementById('bzLogo'),sproutArt(),Math.max(.5,bb*.74/33));
  pixCanvas(document.getElementById('footLink'),textArt('Nuevo · La primera semilla: demo con sprites generados >','#b9d67d',FONT_M),1.5);
  pixCanvas(document.getElementById('footLine'),textArt('OCHO SEMILLAS · CUATRO ESTACIONES · NINGÚN GUARDIÁN MUERE','#5d8a6b',FONT_M),1.5); }
function applyShellTheme(){ const t=SHELL_THEMES[((opts.shell|0)%SHELL_THEMES.length+SHELL_THEMES.length)%SHELL_THEMES.length]; SHELL.dataset.color=t[0]; shellLabels(); }

/* ---------- el tamaño: la pantalla tan grande como quepa ---------- */
function safeInsets(){ const p=document.getElementById('safe'); if(!p) return [0,0,0,0]; const s=getComputedStyle(p); return ['paddingTop','paddingRight','paddingBottom','paddingLeft'].map(k=>parseFloat(s[k])||0); }
function fit(){
  const dpr=window.devicePixelRatio||1, [st,sr,sb,sl]=safeInsets(), vw=window.innerWidth-sl-sr, vh=window.innerHeight-st-sb;
  let lay, u, V;
  if(TOUCH){
    const tall=vh>=vw*1.05; lay=tall?'tall':'wide';
    if(tall){ const bp=4, brandh=28, ctrl=clamp(vh*.36,236,340); u=Math.min((vw-2*bp)/164,(vh-2*bp-brandh-ctrl)/158);
      V={bt:3,bs:2,bb:11,bp,brandh,ctrlh:ctrl,dp:clamp(vw*.4,132,176),ab:clamp(vw*.19,60,80),pw:clamp(vw*.15,50,64),ph:18,padw:0}; }
    else { const bp=4, padw=clamp(vw*.21,148,204); u=Math.min((vw-2*bp-2*padw)/164,(vh-2*bp)/146);
      V={bt:1,bs:2,bb:1,bp,brandh:0,ctrlh:0,dp:Math.min(padw-12,160),ab:clamp(padw*.36,54,72),pw:clamp(padw*.3,46,58),ph:16,padw}; }
    u=Math.max(.5,u);
  } else { // escritorio: la escala entera más grande que quepa, en horizontal o en vertical
    const U={wide:[286,177],tall:[194,257]}; let best=null;
    for(let s=12;s>=1&&!best;s--) for(const L of ['wide','tall']) if(U[L][0]*s<=vw-28&&U[L][1]*s<=vh-28){ best=[L,s]; break; }
    [lay,u]=best||['wide',1];
    V={bt:8,bs:11,bb:13,bp:6*u,brandh:18*u,ctrlh:62*u,dp:34*u,ab:15*u,pw:12*u,ph:3.6*u,padw:46*u};
  }
  const W=Math.max(VW,Math.round(VW*u*dpr)), H=Math.round(W*VH/VW); u=W/dpr/VW; // la pantalla, a píxeles físicos enteros
  SCR.width=W; SCR.height=H; SCR.style.width=(W/dpr)+'px'; SCR.style.height=(H/dpr)+'px';
  shellU=u; shellLay=lay; SHELL.className='console '+lay+(TOUCH?' m':'')+(SHELL.classList.contains('ready')?' ready':'');
  const S=SHELL.style, px=v=>(+v).toFixed(2)+'px';
  S.setProperty('--u',px(u)); S.setProperty('--bt',px(V.bt*u)); S.setProperty('--bs',px(V.bs*u)); S.setProperty('--bb',px(V.bb*u)); S.setProperty('--bp',px(V.bp));
  for(const k of ['brandh','ctrlh','dp','ab','pw','ph','padw']) S.setProperty('--'+k,px(V[k]));
  shellLabels();
  const foot=document.getElementById('foot'); if(foot){ const room=window.innerHeight-SHELL.getBoundingClientRect().height; foot.classList.toggle('off',TOUCH||room<110); }
}

/* ---------- los mandos: dedo y ratón ---------- */
function buzz(ms){ if(TOUCH&&opts.vib!==0&&navigator.vibrate) try{ navigator.vibrate(ms||8); }catch(_){} }
function press(k,on){ if(k==='fire') keys.fireHeld=on; if(k==='alt') keys.altHeld=on; if(k==='menu') keys.menuHeld=on;
  if(on) keys[k]=true; else if(!ONESHOT.has(k)) keys[k]=false; }
function toggleMusic(){ musicOn=!musicOn; try{ localStorage.setItem('sprout.music',musicOn?'1':'0'); }catch(_){} shellSelect(); if(musicOn&&typeof SFX!=='undefined') SFX.blip(); }
function shellSelect(){ selT=10; }
function bindBtn(id,k,fn){ const el=document.getElementById(id); if(!el) return; let pid=null;
  el.addEventListener('pointerdown',e=>{ e.preventDefault(); if(pid!==null) return; pid=e.pointerId; try{ el.setPointerCapture(pid); }catch(_){}
    try{ audio(); }catch(_){} if(fn) fn(); else press(k,true); buzz(10); });
  const up=e=>{ if(e.pointerId!==pid) return; pid=null; if(!fn) press(k,false); };
  el.addEventListener('pointerup',up); el.addEventListener('pointercancel',up); el.addEventListener('lostpointercapture',up); }
bindBtn('tA','fire'); bindBtn('tB','alt'); bindBtn('tM','menu'); bindBtn('tS',null,toggleMusic);
/* la cruceta: una sola pieza que sigue al dedo; las rectas ganan (±30°), las diagonales en medio */
const dpHeld={up:false,down:false,left:false,right:false}; let dpId=null;
function dpDir(e){ const r=DPAD.getBoundingClientRect(), x=e.clientX-(r.left+r.width/2), y=e.clientY-(r.top+r.height/2);
  if(Math.hypot(x,y)<r.width*.12) return [0,0];
  let a=Math.atan2(y,x)*180/Math.PI; if(a<0) a+=360;
  const near=Math.round(a/90)%4, off=Math.abs(((a-near*90)+540)%360-180);
  if(off<=30) return [[1,0],[0,1],[-1,0],[0,-1]][near];
  return [[1,1],[-1,1],[-1,-1],[1,-1]][Math.floor(a/90)%4]; }
function dpSet(dx,dy){ const want={left:dx<0,right:dx>0,up:dy<0,down:dy>0}; let moved=false;
  for(const k in want) if(want[k]!==dpHeld[k]){ dpHeld[k]=want[k]; keys[k]=want[k]; if(want[k]) moved=true; }
  if(moved) buzz(6); }
DPAD.addEventListener('pointerdown',e=>{ e.preventDefault(); if(dpId!==null) return; dpId=e.pointerId; try{ DPAD.setPointerCapture(dpId); }catch(_){} try{ audio(); }catch(_){} dpSet(...dpDir(e)); });
DPAD.addEventListener('pointermove',e=>{ if(e.pointerId===dpId) dpSet(...dpDir(e)); });
const dpUp=e=>{ if(e.pointerId!==dpId) return; dpId=null; dpSet(0,0); };
DPAD.addEventListener('pointerup',dpUp); DPAD.addEventListener('pointercancel',dpUp); DPAD.addEventListener('lostpointercapture',dpUp);
/* en el arranque, tocar la pantalla vale por Z */
SCR.addEventListener('pointerdown',e=>{ if(state==='boot'){ e.preventDefault(); keys.fire=true; try{ audio(); }catch(_){} } });
/* pantalla completa (donde el navegador la deja) */
(function(){ const b=document.getElementById('fsBtn'); if(!b) return;
  if(!document.fullscreenEnabled){ b.remove(); return; }
  b.tabIndex=-1; b.addEventListener('pointerdown',e=>e.preventDefault());
  b.addEventListener('click',()=>{ if(document.fullscreenElement) document.exitFullscreen().catch(()=>{}); else document.documentElement.requestFullscreen({navigationUI:'hide'}).catch(()=>{}); b.blur(); });
  document.addEventListener('fullscreenchange',()=>setTimeout(fit,80)); })();
/* en el móvil: nada de zoom, doble toque ni menús de mantener pulsado */
if(TOUCH){
  let lastTap=0;
  document.addEventListener('touchend',e=>{ const t=e.timeStamp||performance.now(); if(t-lastTap<=350) e.preventDefault(); lastTap=t; },{passive:false});
  document.addEventListener('touchmove',e=>{ e.preventDefault(); },{passive:false});
  ['gesturestart','gesturechange','gestureend'].forEach(ev=>document.addEventListener(ev,e=>e.preventDefault()));
  document.addEventListener('dblclick',e=>e.preventDefault());
  document.addEventListener('contextmenu',e=>e.preventDefault());
}

/* ---------- la consola reacciona: botones hundidos (también con teclado y mando) y el LED de la savia ---------- */
const FB={};
function setDown(id,on){ if(FB[id]===on) return; FB[id]=on; const el=document.getElementById(id); if(el) el.classList.toggle('down',on); }
function shellFeedback(){
  setDown('tU',!!keys.up); setDown('tD',!!keys.down); setDown('tL',!!keys.left); setDown('tR',!!keys.right);
  const t=(keys.up?'u':keys.down?'d':'')+(keys.left?'l':keys.right?'r':''); if(FB.dp!==t){ FB.dp=t; DPAD.dataset.t=t; }
  setDown('tA',!!keys.fireHeld); setDown('tB',!!keys.altHeld); setDown('tM',!!keys.menuHeld); if(selT>0) selT--; setDown('tS',selT>0);
  const on=performance.now()-SHELL_T0>260, low=on&&['play','pause','dialog','shop','trans'].includes(state)&&player.hp>0&&player.hp<=2;
  const s=!on?'off':saveFlash>0?'save':low?'low':'on'; if(FB.led!==s){ FB.led=s; LED.dataset.s=s; } }

/* ---------- arranque de la consola ---------- */
window.addEventListener('resize',fit); window.addEventListener('orientationchange',()=>setTimeout(fit,120));
applyShellTheme(); fit(); requestAnimationFrame(()=>SHELL.classList.add('ready'));
