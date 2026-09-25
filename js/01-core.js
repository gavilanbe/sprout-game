'use strict';
/* ============================================================
   SPROUT — Zelda-like estilo Link's Awakening DX
   160×144 (resolución GB real) · tiles 16px · UI inferior 16px
   ============================================================ */
const cv = document.getElementById('cv');
let ctx = cv.getContext('2d'); // let: el zurrón (15b) lo cambia un momento para pintar en su propio lienzo
ctx.imageSmoothingEnabled = false;

const TILE=16, SW=10, SH=8, VW=160, VH=144, PLAY_H=128;

/* ---------- PALETA DE SPRITES (GBC, vibras Link's Awakening DX) ---------- */
const PAL = {
  k:'#1a1410',  w:'#fffbe8',  e:'#ffffff',
  s:'#f8d090',  S:'#d89858',          // piel / sombra de piel
  l:'#70d838',  L:'#b0f068',  d:'#2e8038', D:'#1d4f22', // hoja: media, clara, oscura, muy oscura
  b:'#c06a38',  B:'#e8945a',  m:'#7a4020',  // peto, peto claro, botas/madera oscura
  g:'#58b048',  G:'#2e7830',          // verde blob
  p:'#9858c8',  P:'#5c3080',          // púrpura
  R:'#e84848',  r:'#f89090',          // rojo, rosa
  a:'#d09040',  A:'#8a5028',          // bellota
  y:'#f8d030',  Y:'#fff0a0',          // oro
  c:'#58c8e8',  C:'#2878b8',          // celeste / azul
  o:'#f8a030',  O:'#c04818',          // fuego
  n:'#e8f0f8',  N:'#a8c0d8',  M:'#6a7a98', // nieve, hielo, hielo oscuro
  t:'#b8b0a0',  T:'#6a6458',          // piedra clara / oscura
  x:'#3a3448',  X:'#221c2c',          // sombra de mazmorra
  v:'#e8d0a0',  V:'#b89868',          // pergamino
  q:'#f8f8e8',                        // blanco hueso (ojos)
  z:'#f050a0',                        // rosa flor
};
/* ---------- COLORES DEL MUNDO (por bioma) ---------- */
const C = {
  grass:'#78c050', grassD:'#5ca040', grassDD:'#4a8838', grassL:'#98d868',
  flower1:'#e84848', flower2:'#f8f8e8', flower3:'#f0a0d0', flowerC:'#e8b050',
  path:'#e8d8a0', pathD:'#cdb878', pathL:'#f4e8c0',
  sand:'#ecd494', sandD:'#d2b870', sandL:'#f8ecb8',
  water:'#3878d8', waterD:'#2858b0', waterL:'#78b8f0', foam:'#e8f4ff',
  trunk:'#8a5028', trunkL:'#b07040', canopy:'#1e6830', canopyL:'#359045', canopyLL:'#58b058',
  rock:'#b0a890', rockD:'#7a7464', rockL:'#d0c8b0', rockDD:'#4e4a40',
  cliff:'#b8a888', cliffD:'#8a7a60', cliffDD:'#5a4e3c', cliffL:'#d8c8a8', cliffTop:'#c8b898',
  wood:'#c08850', woodD:'#8a5828', woodL:'#e0a868',
  wall:'#e8d0a0', wallD:'#b89868', wallL:'#f8ecc8', roof:'#d84838', roofD:'#982818', roofL:'#f07060',
  snow:'#e8f0f8', snowD:'#c8d8e8', snowDD:'#a8c0d8', ice:'#a8d8f0', iceL:'#d8f0ff',
  mount:'#8a8aa0', mountD:'#5a5a78', mountL:'#b8c0d0', mountDD:'#3a3a50',
  leaf:'#c8a850', leafD:'#a88838', leafDD:'#8a7838', leafL:'#e0c068',
  aut:'#c87830', autL:'#e8a040', autD:'#a05820',
  dfloor:'#5a4a40', dfloorD:'#4a3c34', dfloorL:'#6e5a4c',
  dwall:'#3a3448', dwallD:'#262030', dwallL:'#5a5470', dwallLL:'#7a7490',
  wilt:'#a8a858', wiltD:'#90904c', wiltDD:'#7a7a40',
  mud:'#6a5a3a', mudD:'#4e4228', mudL:'#8a7a50',
  ui:'#101810', uiText:'#f8e8c8', uiDim:'#7fae8c',
};

/* ---------- utilidades ---------- */
function hash(x,y){let h=(x*374761393+y*668265263)|0;h=(h^(h>>13))*1274126177;return ((h^(h>>16))>>>0);}
function mkCanvas(w,h){const c=document.createElement('canvas');c.width=w;c.height=h;return c;}
function mkTile(fn,w,h){const c=mkCanvas(w||16,h||16);fn(c.getContext('2d'));return c;}
function clamp(v,a,b){return v<a?a:v>b?b:v;}
function lerp(a,b,k){return a+(b-a)*k;}
function rectsHit(a,b){ return a[0]<b[0]+b[2]&&a[0]+a[2]>b[0]&&a[1]<b[1]+b[3]&&a[1]+a[3]>b[1]; }
function easeOutBack(k){ const c=1.70158, t=k-1; return 1+(c+1)*t*t*t+c*t*t; }
function smooth(k){ return k*k*(3-2*k); }
/* rgb helpers para tintar paletas */
function hex2rgb(h){return [parseInt(h.slice(1,3),16),parseInt(h.slice(3,5),16),parseInt(h.slice(5,7),16)];}
function rgb2hex(r,g,b){return '#'+[r,g,b].map(v=>Math.round(clamp(v,0,255)).toString(16).padStart(2,'0')).join('');}
function mix(a,b,k){const A=hex2rgb(a),B=hex2rgb(b);return rgb2hex(lerp(A[0],B[0],k),lerp(A[1],B[1],k),lerp(A[2],B[2],k));}
function shade(h,k){ return k<0?mix(h,'#101018',-k):mix(h,'#ffffff',k); }
const BAYER4=[[0,8,2,10],[12,4,14,6],[3,11,1,9],[15,7,13,5]];
/* ---------- píxeles a mano, deprisa ----------
   El arte se genera píxel a píxel; miles de fillRect de 1×1 son lentos. pxBuf guarda los píxeles en un búfer
   de 32 bits y los vuelca de una vez: con colores opacos el resultado es idéntico al de fillRect. */
const PX_LE=new Uint8Array(new Uint32Array([1]).buffer)[0]===1, PX_COL=new Map();
function pxCol(c){ let v=PX_COL.get(c); if(v!==undefined) return v; // '#rrggbb' → el entero de 32 bits del píxel; null si no es opaco
  const m=typeof c==='string'&&/^#[0-9a-fA-F]{6}$/.test(c)?parseInt(c.slice(1),16):null;
  v=m===null?null:PX_LE?(0xff000000|((m&0xff)<<16)|(m&0xff00)|((m>>16)&0xff))>>>0:((m<<8)|0xff)>>>0; PX_COL.set(c,v); return v; }
function rgb32(c){ return PX_LE?(0xff000000|(c[2]<<16)|(c[1]<<8)|c[0])>>>0:((c[0]<<24)|(c[1]<<16)|(c[2]<<8)|0xff)>>>0; } // [r,g,b] → el píxel opaco de 32 bits
function pxBuf(w,h,bg){ const img=new ImageData(w,h), d=new Uint32Array(img.data.buffer); if(bg) d.fill(pxCol(bg));
  return {w,h,d,img,
    set(x,y,c){ if(x>=0&&y>=0&&x<w&&y<h) d[y*w+x]=pxCol(c); },
    rect(x,y,rw,rh,c){ const v=pxCol(c), x0=Math.max(0,x), y0=Math.max(0,y), x1=Math.min(w,x+rw), y1=Math.min(h,y+rh); for(let yy=y0;yy<y1;yy++) d.fill(v,yy*w+x0,yy*w+x1); },
    canvas(){ const c=mkCanvas(w,h); c.getContext('2d').putImageData(img,0,0); return c; },
    into(g,ox,oy){ if(!this.cv){ this.cv=mkCanvas(w,h); this.cx=this.cv.getContext('2d'); } this.cx.putImageData(img,0,0); g.drawImage(this.cv,ox||0,oy||0); } }; } // su propio lienzo, de su tamaño exacto (ver pxStamp)
/* vuelca un ImageData sobre g con source-over (lo transparente no toca lo que hay debajo): a través de un lienzo nuevo, de su tamaño exacto.
   Nada de un lienzo auxiliar compartido y reutilizado: en el iPhone (WebKit con la GPU) copiarlo tras cada putImageData
   daba basura (recuadros negros, trozos de otros dibujos) aunque en el ordenador saliera perfecto */
function pxStamp(g,img,ox,oy){ const c=mkCanvas(img.width,img.height); c.getContext('2d').putImageData(img,0,0); g.drawImage(c,ox,oy); }
/* un contexto de bolsillo para generar arte: fillStyle/fillRect/drawImage como los de verdad, pero los rectángulos
   opacos van al búfer y se vuelcan juntos (en orden: cualquier otra cosa vuelca primero lo pendiente) */
function pxCtx(c){ const real=c.getContext('2d'), w=c.width, h=c.height, plain=pxPlain(real); let B=null, dirty=false, style='#000000', v=pxCol(style);
  const flush=()=>{ if(dirty){ pxStamp(real,B.img,0,0); B.d.fill(0); dirty=false; } };
  return { canvas:c,
    get fillStyle(){ return style; }, set fillStyle(s){ style=s; v=pxCol(s); },
    fillRect(x,y,rw,rh){ if(plain&&v!==null&&Number.isInteger(x)&&Number.isInteger(y)&&Number.isInteger(rw)&&Number.isInteger(rh)&&rw>0&&rh>0){
        if(!B) B=pxBuf(w,h); const x0=Math.max(0,x), y0=Math.max(0,y), x1=Math.min(w,x+rw), y1=Math.min(h,y+rh); for(let yy=y0;yy<y1;yy++) if(x1>x0) B.d.fill(v,yy*w+x0,yy*w+x1); dirty=true; }
      else { flush(); real.fillStyle=style; real.fillRect(x,y,rw,rh); } },
    drawImage(...a){ flush(); real.drawImage(...a); },
    done(){ flush(); return c; } }; }
/* ¿pintar en g con drawImage da lo mismo que con fillRect? (sin transparencia global, sin mezclas raras, sin escalas ni giros, sin sombras) */
function pxPlain(g){ if(g.globalAlpha!==1||g.globalCompositeOperation!=='source-over'||(g.filter&&g.filter!=='none')||g.shadowBlur||g.shadowOffsetX||g.shadowOffsetY) return false;
  const m=g.getTransform?g.getTransform():null; return !m||(m.a===1&&m.b===0&&m.c===0&&m.d===1&&Number.isInteger(m.e)&&Number.isInteger(m.f)); }
/* ---------- trabajo para los ratos libres ----------
   Tareas cortas (generar arte, preparar la pantalla de al lado...) que el bucle hace cuando al fotograma le sobra
   tiempo, para que no lo tenga que hacer de golpe el fotograma que lo necesita. key: no repetir la misma tarea. */
const IDLE_Q=[], IDLE_KEYS=new Set();
function idleTask(fn,key){ if(key!==undefined){ if(IDLE_KEYS.has(key)) return; IDLE_KEYS.add(key); } IDLE_Q.push(fn); }
function runIdle(until){ while(IDLE_Q.length&&performance.now()<until){ const fn=IDLE_Q.shift(); try{ fn(); }catch(e){ console.error(e); } } }
/* ---------- volúmenes por lóbulos: copas, arbustos, rocas ----------
   Cada lóbulo es una esfera; el de delante gana. La luz viene de
   arriba-izquierda; entre lóbulos hay sombra de contacto; el paso
   entre tonos va tramado (Bayer 4×4) y todo lleva contorno. */
function blobArt(g,ox,oy,w,h,lobes,pal,o){
  o=o||{}; const n=pal.length, own=new Int16Array(w*h).fill(-1);
  for(let y=0;y<h;y++) for(let x=0;x<w;x++) for(let i=lobes.length-1;i>=0;i--){ const L=lobes[i], dx=(x+.5-L.x)/L.r, dy=(y+.5-L.y)/(L.ry||L.r); if(dx*dx+dy*dy<=1){ own[y*w+x]=i; break; } }
  const at=(x,y)=>x<0||y<0||x>=w||y>=h?-1:own[y*w+x];
  const lx=-.5, ly=-.72, lz=.48, dith=o.dither===undefined?.9:o.dither, bias=o.bias||0, grad=o.grad===undefined?.35:o.grad;
  // la vía rápida: colores opacos, origen entero y un lienzo sin transformaciones raras → a un búfer y de una vez
  const PC=pal.map(pxCol), fast=Number.isInteger(ox)&&Number.isInteger(oy)&&PC.every(v=>v!==null)&&(o.outline===false||pxCol(o.outline||PAL.k)!==null)&&pxPlain(g), B=fast?pxBuf(w+2,h+2):null;
  for(let y=0;y<h;y++) for(let x=0;x<w;x++){ const i=own[y*w+x]; if(i<0) continue;
    const L=lobes[i], nx=(x+.5-L.x)/L.r, ny=(y+.5-L.y)/(L.ry||L.r), nz=Math.sqrt(Math.max(0,1-nx*nx-ny*ny));
    let d=nx*lx+ny*ly+nz*lz+bias-(y/h-.5)*grad;
    // sombra de contacto bajo/tras los lóbulos de delante
    if(at(x,y-1)>i||at(x-1,y)>i) d-=.55; else if(at(x,y-2)>i||at(x+1,y)>i) d-=.28;
    const v=(d+.9)/1.8*(n-1)+(BAYER4[y&3][x&3]/16-.47)*dith;
    const c=clamp(Math.round(v),0,n-1); if(B) B.d[(y+1)*(w+2)+x+1]=PC[c]; else { g.fillStyle=pal[c]; g.fillRect(ox+x,oy+y,1,1); } }
  if(o.outline!==false){ const oc=o.outline||PAL.k, ov=B?pxCol(oc):0; if(!B) g.fillStyle=oc;
    for(let y=-1;y<=h;y++) for(let x=-1;x<=w;x++){ if(at(x,y)>=0) continue; if(at(x+1,y)>=0||at(x-1,y)>=0||at(x,y+1)>=0||at(x,y-1)>=0){ if(B) B.d[(y+1)*(w+2)+x+1]=ov; else g.fillRect(ox+x,oy+y,1,1); } } }
  if(B) B.into(g,ox-1,oy-1); // de una vez: los mismos píxeles que con un fillRect por píxel
  return own;
}
function shadowBlob(g,cx,cy,rx,ry,a){ g.fillStyle='rgba(18,26,14,'+(a||.26)+')'; for(let y=-ry;y<=ry;y++){ const w=Math.round(rx*Math.sqrt(Math.max(0,1-(y*y)/(ry*ry)))); g.fillRect(cx-w,cy+y,w*2,1); } }


