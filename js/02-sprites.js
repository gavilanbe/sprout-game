'use strict';
/* ---------- utilidades sprite ---------- */
function spr(rows, extra){
  const c=document.createElement('canvas'); c.width=16; c.height=16;
  const g=c.getContext('2d');
  rows.forEach((r,y)=>{
    if(r.length!==16) console.error('fila mala ('+r.length+'):', r);
    for(let x=0;x<r.length;x++){
      const ch=r[x]; if(ch==='.') continue;
      g.fillStyle=(extra&&extra[ch])||PAL[ch]||'#ff00ff';
      g.fillRect(x,y,1,1);
    }
  });
  return c;
}
function sprN(rows,extra){ // como spr() pero de tamaño libre
  const c=document.createElement('canvas'); c.width=rows[0].length; c.height=rows.length;
  const g=c.getContext('2d');
  rows.forEach((r,y)=>{
    if(r.length!==rows[0].length) console.error('fila mala ('+r.length+'):', r);
    for(let x=0;x<r.length;x++){
      const ch=r[x]; if(ch==='.') continue;
      g.fillStyle=(extra&&extra[ch])||PAL[ch]||'#ff00ff';
      g.fillRect(x,y,1,1);
    }
  });
  return c;
}
function flipH(c){const n=document.createElement('canvas');n.width=c.width;n.height=c.height;
  const g=n.getContext('2d');g.translate(c.width,0);g.scale(-1,1);g.drawImage(c,0,0);return n;}
function flipV(c){const n=document.createElement('canvas');n.width=c.width;n.height=c.height;
  const g=n.getContext('2d');g.translate(0,c.height);g.scale(1,-1);g.drawImage(c,0,0);return n;}
function whiten(c){const n=document.createElement('canvas');n.width=c.width;n.height=c.height;
  const g=n.getContext('2d');g.drawImage(c,0,0);g.globalCompositeOperation='source-in';
  g.fillStyle='#fff';g.fillRect(0,0,c.width,c.height);return n;}
function hash(x,y){let h=(x*374761393+y*668265263)|0;h=(h^(h>>13))*1274126177;return ((h^(h>>16))>>>0);}

/* ---------- SPRITES ---------- */
const SPROUT_DOWN_ROWS = [
"......k.k.......",
".....klklk......",
"......klk.......",
"....kkkkkkkk....",
"...kssssssssk...",
"...kskssssksk...",
"...kskssssksk...",
"...kssssssssk...",
"....kssssssk....",
".....kkkkkk.....",
"....kbbbbbbk....",
"...ksbbbbbbbk...",
"....kbbbbbbk....",
"....kbbbbbbk....",
"....kmmk..kmk...",
"................",
];
const SPROUT_DOWN = spr(SPROUT_DOWN_ROWS);
const SPROUT_UP = spr([
"......k.k.......",
".....klklk......",
"......klk.......",
"....kkkkkkkk....",
"...kssssssssk...",
"...kssssssssk...",
"...kssssssssk...",
"...kssssssssk...",
"....kssssssk....",
".....kkkkkk.....",
"....kbbbbbbk....",
"...ksbbbbbbbk...",
"....kbbbbbbk....",
"....kbbbbbbk....",
"....kmmk..kmk...",
"................",
]);
const SPROUT_SIDE = spr([   // mirando a la DERECHA
"......k.k.......",
".....klklk......",
"......klk.......",
"....kkkkkkkk....",
"...kssssssssk...",
"...kssssssksk...",
"...kssssssksk...",
"...kssssssssk...",
"....kssssssk....",
".....kkkkkk.....",
"....kbbbbbbk....",
"....kbbsbbbk....",
"....kbbbbbbk....",
"....kbbbbbbk....",
".....kmmkmk.....",
"................",
]);
const SPROUT_SIDE_B = spr([ // paso, piernas abiertas
"................",
"......k.k.......",
".....klklk......",
"......klk.......",
"....kkkkkkkk....",
"...kssssssssk...",
"...kssssssksk...",
"...kssssssksk...",
"...kssssssssk...",
"....kssssssk....",
".....kkkkkk.....",
"....kbbbbbbk....",
"....kbbsbbbk....",
"....kbbbbbbk....",
"....kmk..kmk....",
"................",
]);
const BLOB_ROWS=[
"................",
"................",
"................",
"................",
".....kkkkkk.....",
"....kggggggk....",
"...kggggggggk...",
"...kgwkggwkgk...",
"...kggggggggk...",
"...kGggggggGk...",
"....kGGGGGGk....",
".....kkkkkk.....",
"................",
"................",
"................",
"................",
];
const BLOB = spr(BLOB_ROWS);
const BLOB_FAST = spr(BLOB_ROWS,{g:'#58a8c8',G:'#2e6890'}); // blob de escarcha (variante rápida)
const BAT_ROWS=[
"................",
"................",
"................",
"..kk........kk..",
".kppk......kppk.",
".kpppkkddkkpppk.",
"..kppkdwdwkppk..",
"...kkkdddddkkk..",  // cuerpo
"......kdddk.....",
".......kkk......",
"................",
"................",
"................",
"................",
"................",
"................",
];
const BAT = spr(BAT_ROWS,{d:'#5c3080'});
const BAT_FAST = spr(BAT_ROWS,{p:'#c84848',P:'#802020',d:'#802020'}); // murciélago carmesí (variante rápida)
const BEETLE = spr([ // escarabajo acorazado — mira a la derecha; el frente (dcha) blinda
"................",
"................",
"......kkkkk.....",
".....khhhhhk....",
"....khHHHHhkk...",
"...kkhHHHHhBBk..",  // B = pinza/morro blindado
"...kAhHHHHhBBk..",  // A = patita trasera
"...kkhHHHHhBBk..",
"....khHHHHhkk...",
".....khhhhhk....",
"......kkkkk.....",
"................",
"................",
"................",
"................",
"................",
],{h:'#3a7a3a',H:'#56a04a',B:'#7a6a4a',A:'#2a2a2a'});
const ROLLER = spr([ // erizo en reposo (erizado)
"................",
"......kkkk......",
".....kbbbbk.....",
"...k.kbbbbk.k...",
"..kbkkbbbbkkbk..",
"...kbbwbbwbbk...",
"..kkbbbbbbbbkk..",
".k.kbbbbbbbbk.k.",
"...kbbbbbbbbk...",
"..kkbbbbbbbbkk..",
".k.kkbbbbbbkk.k.",
"....kkkkkkkk....",
"................",
"................",
"................",
"................",
],{b:'#9a6a8a'});
const ROLLER_BALL = spr([ // erizo cargando (bola con púas girando)
"................",
"......kkkk......",
".....kbbbbk.....",
"..k.kbBBBBk.k...",
".kbkbBBBBBBkbk..",
"..kbBBwBBwBBbk..",
".kbBBBBBBBBBBk..",
".kBBBBBBBBBBBk..",
".kbBBBBBBBBBBk..",
"..kbBBBBBBBBbk..",
".kbkkBBBBBBkkbk.",
"..k.kkkkkkkk.k..",
"................",
"................",
"................",
"................",
],{b:'#9a6a8a',B:'#c89ab8'});
const GHOST = spr([ // espíritu — atraviesa paredes
"................",
"......kkkk......",
".....kwwwwk.....",
"....kwwwwwwk....",
"...kwwwwwwwwk...",
"...kwAwwwwAwk...",
"...kwwwwwwwwk...",
"...kwwwwwwwwk...",
"...kwwwwwwwwk...",
"...kwwwwwwwwk...",
"...kw.kw.kw.k...",  // borde fantasmal
"....k..k..k.....",
"................",
"................",
"................",
"................",
],{w:'#bfe8ff',A:'#2a3a6a'});
const FROG = spr([ // sapo en reposo
"................",
"................",
"...kk....kk.....",
"..kwwk..kwwk....",
"..kwAk..kwAk....",
".kkggkkkkggkk...",
".kgggggggggggk..",
".kggGggggGgggk..",
".kgggggggggggk..",
"..kgggggggggk...",
"...kk.kk.kk.....",  // patas
"................",
"................",
"................",
"................",
"................",
],{g:'#6aa84a',G:'#4a8838',w:'#f0f0e0',A:'#1a1410'});
const FROG_JUMP = spr([ // sapo en salto (estirado)
"................",
"...kk....kk.....",
"..kwwk..kwwk....",
"..kwAk..kwAk....",
".kkggkkkkggkk...",
".kgggggggggggk..",
".kggGggggGgggk..",
".kgggggggggggk..",
".kgggggggggggk..",
".kgggggggggggk..",
"..kgggggggggk...",
".kk.kkkkkk.kk...",  // patas extendidas
"kk..........kk..",
"................",
"................",
"................",
],{g:'#6aa84a',G:'#4a8838',w:'#f0f0e0',A:'#1a1410'});
const THORN = spr([ // planta-pincho en reposo
"................",
"................",
"................",
"................",
"......kkkk......",
".....kmmmmk.....",
"....kmGGGGmk....",
"....kGGGGGGk....",
"....kGwGGwGk....",
"....kGGGGGGk....",
".....kmmmmk.....",
"......kmmk......",
".....kkmmkk.....",
"................",
"................",
"................",
],{m:'#3a5a2a',G:'#56843a'});
const THORN_OPEN = spr([ // planta-pincho mordiendo (púas fuera)
".......kk.......",
"...k...kk...k...",
"...kk..||..kk...",
"....kk.||.kk....",
"..kk.kmmmmk.kk..",
"...kkmGGGGmkk...",
"k--kmRRRRRRmk--k",  // R = fauces
"..kmRRwwwwRRmk..",
"k--kmRRRRRRmk--k",
"...kkmGGGGmkk...",
"..kk.kmmmmk.kk..",
"....kk.||.kk....",
"...kk..||..kk...",
"...k...kk...k...",
".......kk.......",
"................",
],{m:'#3a5a2a',G:'#56843a',R:'#a83838','|':'#6a8a3a','-':'#6a8a3a'});
const ELDER = spr([   // RAÍZ, el sabio del Roble: corona de hojas, barba de musgo,
"......klk.......",  // túnica de corteza con anillos dorados y bastón con brote vivo
".....kdldk......",
"....kkkkkkk.kl..",
"...kssssssk.kdk.",
"..ksWssssWsk.kAk",
"..kskssssksk.kAk",
"..kssssssssk.kAk",
"..kWWssssWWkkkAk",
"...kWWWWWWk..kAk",
"..kbkWWWWWWk.kAk",
"..kbbkWWkbbk.kAk",
"..kbbbkkkbbk.kAk",
"..kbabbbbbak.kAk",
"...kbbbbbbk..kAk",
"....kmmkmmk..kAk",
"................",
],{W:'#e8f0dc'});
function spr8(rows,extra){
  const c=document.createElement('canvas');c.width=8;c.height=8;
  const g=c.getContext('2d');
  rows.forEach((r,y)=>{for(let x=0;x<8;x++){const ch=r[x];if(ch==='.')continue;
    g.fillStyle=(extra&&extra[ch])||PAL[ch]||'#f0f';g.fillRect(x,y,1,1);}});
  return c;
}
const HEART_ROWS = [
".kk..kk.",
"kRwkkRRk",
"kRRRRRRk",
"kRRRRRRk",
".kRRRRk.",
"..kRRk..",
"...kk...",
"........"];
const HEART_FULL = spr8(HEART_ROWS);
const HEART_EMPTY = spr8(HEART_ROWS,{R:'#384038',w:'#384038'});
const HEART_HALF = (()=>{ // mitad izquierda llena
  const c=document.createElement('canvas');c.width=8;c.height=8;const g=c.getContext('2d');
  g.drawImage(HEART_EMPTY,0,0);
  g.save();g.beginPath();g.rect(0,0,4,8);g.clip();g.drawImage(HEART_FULL,0,0);g.restore();
  return c;})();
const DIARY_SPR = spr8([
"kkkkkk..",
"kppppk..",
"kpAApk..",
"kppppk..",
"kpAApk..",
"kppppk..",
"kkkkkk..",
"........"],{p:'#e8d0a0'});
const ACORN = spr8([
"..kkkk..",
".kAAAAk.",
"kAAAAAAk",
"kaawaaak",
".kaaaak.",
"..kaak..",
"...kk...",
"........"]);
const BERRY_SPR = spr8([
"...kl...",
"..klk...",
".kBBRk..",
"kBRRRRk.",
"kRRwRRk.",
"kRRRRRk.",
".kRRRk..",
"..kkk..."],{B:'#a83858',R:'#d84878'});

/* ---------- LOGO del título: letras propias con bisel, a lo Zelda ---------- */
function silRects(w,h,rects,cuts){ // silueta por rectángulos + cortes diagonales
  const g=Array.from({length:h},()=>Array(w).fill(false));
  for(const [x,y,rw,rh] of rects) for(let yy=y;yy<Math.min(h,y+rh);yy++)
    for(let xx=x;xx<Math.min(w,x+rw);xx++) g[yy][xx]=true;
  for(const [x,y,rw,rh] of (cuts||[])) for(let yy=y;yy<Math.min(h,y+rh);yy++)
    for(let xx=x;xx<Math.min(w,x+rw);xx++) g[yy][xx]=false;
  return g;
}
function glyphC(g,light,mid,dark){ // contorno negro + bisel (luz arriba-izq, sombra abajo-dcha)
  const h=g.length, w=g[0].length;
  const c=document.createElement('canvas'); c.width=w+2; c.height=h+2;
  const q=c.getContext('2d');
  const at=(x,y)=>y>=0&&y<h&&x>=0&&x<w&&g[y][x];
  for(let y=-1;y<=h;y++) for(let x=-1;x<=w;x++){
    if(at(x,y)) continue;
    let edge=false;
    for(let dy=-1;dy<=1&&!edge;dy++) for(let dx=-1;dx<=1;dx++) if(at(x+dx,y+dy)){edge=true;break;}
    if(edge){ q.fillStyle=PAL.k; q.fillRect(x+1,y+1,1,1); }
  }
  for(let y=0;y<h;y++) for(let x=0;x<w;x++){
    if(!g[y][x]) continue;
    let col=mid;
    if(!at(x,y-1)||(!at(x-1,y)&&!at(x-1,y-1))) col=light;
    else if(!at(x,y+1)||!at(x+1,y)) col=dark;
    q.fillStyle=col; q.fillRect(x+1,y+1,1,1);
  }
  return c;
}
function glyph(g){ return glyphC(g,'#b0f068','#70d838','#2e8038'); }
function darken(c){ const n=document.createElement('canvas'); n.width=c.width; n.height=c.height;
  const g=n.getContext('2d'); g.drawImage(c,0,0); g.globalCompositeOperation='source-in';
  g.fillStyle='#0c1810'; g.fillRect(0,0,n.width,n.height); return n; }
function scale2(c,sw,sh){ const n=document.createElement('canvas'); n.width=sw*2; n.height=sh*2;
  const g=n.getContext('2d'); g.imageSmoothingEnabled=false;
  g.drawImage(c,0,0,sw,sh,0,0,sw*2,sh*2); return n; }
/* letras 13×16 con esquinas achaflanadas */
const LG_S=glyph(silRects(13,16,
  [[0,0,13,5],[0,0,5,9],[0,7,13,4],[8,7,5,9],[0,11,13,5]],
  [[0,0,2,2],[11,3,2,2],[0,11,2,2],[11,14,2,2]]));
const LG_P=glyph(silRects(13,16,
  [[0,0,5,16],[0,0,13,5],[8,0,5,11],[0,7,13,4]],
  [[11,0,2,2],[11,8,2,3]]));
const LG_R=glyph(silRects(13,16,
  [[0,0,5,16],[0,0,13,5],[8,0,5,11],[0,7,13,4],[5,9,4,3],[7,11,3,3],[9,13,4,3]],
  [[11,0,2,2],[11,8,2,3]]));
const LG_U=glyph(silRects(13,16,
  [[0,0,5,13],[8,0,5,13],[0,11,13,5]],
  [[0,13,2,3],[11,13,2,3]]));
const LG_T=glyph(silRects(13,16,
  [[0,0,13,5],[4,0,5,16]],
  [[0,0,1,2],[12,0,1,2],[4,14,1,2],[8,14,1,2]]));
const ACORN2=scale2(ACORN,8,7);            // la O es la bellota dorada
const LOGO_GLYPHS=[
  {img:LG_S,dy:0,w:16},{img:LG_P,dy:0,w:16},{img:LG_R,dy:0,w:16},
  {img:ACORN2,dy:4,w:18},{img:LG_U,dy:0,w:16},{img:LG_T,dy:0,w:16},
];
LOGO_GLYPHS.forEach(g=>{ g.dark=darken(g.img); g.white=whiten(g.img); });
const LOGO_X=31, LOGO_Y=26;
const LOGO_POS=(()=>{ let x=LOGO_X; return LOGO_GLYPHS.map(g=>{ const p=x; x+=g.w; return p; }); })();
function gridNew(w,h){ return Array.from({length:h},()=>Array(w).fill(false)); }
function discOn(g,cx,cy,r){ const r2=r*r;
  for(let y=0;y<g.length;y++) for(let x=0;x<g[0].length;x++){
    const dx=x-cx, dy=y-cy; if(dx*dx+dy*dy<=r2) g[y][x]=true; } }
/* la Hoja Ancestral del logo: LA hoja del juego, en grande.
   Ovalada con peciolo, vena central, nervaduras y borde dentado.
   Se dibuja horizontal con detalle y se inclina por cizalla entera:
   píxel nítido, sin rotaciones borrosas. */
function shearUp(c,k){ // las columnas suben hacia la derecha
  const drift=Math.ceil(c.width*k);
  const n=document.createElement('canvas'); n.width=c.width; n.height=c.height+drift;
  const g=n.getContext('2d');
  for(let x=0;x<c.width;x++) g.drawImage(c,x,0,1,c.height,x,drift-((x*k)|0),1,c.height);
  return n;
}
const LEAF_BLADE=(()=>{
  const W=54,H=17,CY=8;
  const prof=t=>{ if(t<0||t>43) return -1;       // perfil de hoja: panza redonda, punta fina
    return Math.max(0,Math.round(6.2*Math.pow(Math.sin(Math.PI*t/43),0.7))); };
  const bg=gridNew(W,H);
  for(let t=0;t<=43;t++){ const h=prof(t);
    for(let y=CY-h;y<=CY+h;y++) if(y>=0&&y<H) bg[y][8+t]=true; }
  for(let x=2;x<=8;x++){ bg[CY][x]=true; if(x<5) bg[CY+1][x]=true; } // peciolo
  const c=glyphC(bg,'#a8ec78','#70d838','#2e8038');  // paleta de la hoja del juego
  const q=c.getContext('2d');
  q.fillStyle='#1d4f22';                        // vena central
  for(let t=3;t<=40;t++) q.fillRect(9+t,CY+1,1,1);
  for(const t of [8,16,24,32]){                 // nervaduras laterales
    q.fillRect(9+t,CY,1,1);  q.fillRect(10+t,CY-1,1,1); q.fillRect(11+t,CY-2,1,1);
    q.fillRect(11+t,CY+2,1,1); q.fillRect(12+t,CY+3,1,1);
  }
  q.fillStyle='#2e8038';                        // borde dentado sutil
  for(const t of [10,17,24,31,38]) q.fillRect(9+t,CY-prof(t)+2,1,1);
  q.fillStyle='#ffffff';                        // brillo
  q.fillRect(43,CY-3,2,1); q.fillRect(44,CY-4,1,1);
  const sh=shearUp(c,0.26);
  return scale2(sh,sh.width,sh.height);
})();
/* la HOJA-PERGAMINO de la cinemática: una hoja ancha y curada como papiro.
   Cuerpo panzudo (el texto SIEMPRE cabe), extremos enrollados de pergamino,
   fibras horizontales, manchas de viejo y borde dentado de hoja.
   Se dobla por la vena al pasar de página. */
const LEAF_PAGE=(()=>{
  const W=156,H=110,CX=78,CY=55,A=75,B=51,N=3; // superelipse: panza casi rectangular
  const inside=(x,y)=>Math.pow(Math.abs((x-CX)/A),N)+Math.pow(Math.abs((y-CY)/B),N)<=1;
  const bg=gridNew(W,H);
  for(let y=0;y<H;y++) for(let x=0;x<W;x++) if(inside(x,y)) bg[y][x]=true;
  for(let x=6;x<W-6;x+=7){ // muescas dentadas arriba y abajo, como hoja de verdad
    for(let y=0;y<H;y++){ if(bg[y][x]){ bg[y][x]=false; if(((x/7)|0)&1) bg[y+1][x]=false; break; } }
    for(let y=H-1;y>=0;y--){ if(bg[y][x]){ bg[y][x]=false; break; } }
  }
  for(let x=0;x<6;x++){ bg[CY][x]=true; if(x<3) bg[CY+1][x]=true; } // peciolo
  const c=glyphC(bg,'#f2ecbc','#e2dc9e','#b0a868'); // verde curado, tinte pergamino
  const q=c.getContext('2d');
  q.globalCompositeOperation='source-atop';         // todo lo demás, recortado a la hoja
  q.fillStyle='rgba(110,100,50,.10)';               // fibras de papiro
  for(let y=3;y<H;y+=3) q.fillRect(0,y,W+2,1);
  q.fillStyle='rgba(255,255,235,.08)';
  for(let y=5;y<H;y+=6) q.fillRect(0,y,W+2,1);
  // extremos enrollados: el canuto del pergamino a cada lado
  for(const x0 of [3,W-9]){
    q.fillStyle='rgba(95,88,42,.30)';  q.fillRect(x0,0,8,H+2);
    q.fillStyle='rgba(255,252,230,.30)'; q.fillRect(x0+2,0,2,H+2); // brillo del rollo
    q.fillStyle='rgba(70,64,28,.40)';  q.fillRect(x0+7,0,1,H+2);  // pliegue interior
  }
  q.fillStyle='rgba(130,110,40,.12)';               // manchas de esquina (envejecido)
  q.beginPath(); q.arc(26,14,13,0,6.29); q.fill();
  q.beginPath(); q.arc(W-26,H-12,15,0,6.29); q.fill();
  q.beginPath(); q.arc(20,H-16,9,0,6.29); q.fill();
  const vg=q.createRadialGradient(CX,CY,34,CX,CY,86); // ribete verde: la hoja sigue viva en las orillas
  vg.addColorStop(0,'rgba(122,154,72,0)'); vg.addColorStop(1,'rgba(96,138,56,.42)');
  q.fillStyle=vg; q.fillRect(0,0,W+2,H+2);
  q.globalCompositeOperation='source-over';
  return c;
})();
/* (el antiguo retrato grande del título se retiró: en su lugar, el sprite
   del juego contempla el Gran Roble — la escala pequeña ES el póster) */
/* el Gran Roble del fondo (nuestro huevo del Pez Viento) */
const OAK=(()=>{
  const W=40,H=42, c=document.createElement('canvas'); c.width=W+2; c.height=H+2;
  const q=c.getContext('2d');
  const tg=silRects(W,H,[[17,20,6,18],[14,35,12,3],[12,37,16,2],[14,23,4,3],[23,25,4,3]]);
  q.drawImage(glyphC(tg,'#a8744c','#8a5028','#5a3418'),0,0);
  const cg=gridNew(W,H);
  discOn(cg,13,13,10); discOn(cg,27,12,10); discOn(cg,20,8,8); discOn(cg,20,16,10);
  q.drawImage(glyphC(cg,'#359045','#1e6830','#143c20'),0,0);
  q.fillStyle='#4ab058'; // motas de luz en la copa
  [[8,10],[15,6],[24,5],[31,10],[12,17],[27,18],[20,12],[33,15]].forEach(([x,y])=>q.fillRect(x+1,y+1,2,1));
  return c;
})();
const OAK_DARK=darken(OAK); // el Roble apagado, mientras sus semillas anden lejos
/* el GRAN ROBLE de la plaza: majestuoso, generado a resolución nativa (nada de escalados) */
const OAK_GRAND=(()=>{
  const W=84,H=80, c=document.createElement('canvas'); c.width=W+2; c.height=H+2;
  const q=c.getContext('2d');
  const tg=silRects(W,H,[[36,36,12,38],[30,66,24,6],[26,72,32,4],[28,42,8,5],[48,46,8,5]]);
  q.drawImage(glyphC(tg,'#a8744c','#8a5028','#5a3418'),0,0);   // tronco anciano con raíces
  const cg=gridNew(W,H);
  discOn(cg,26,24,19); discOn(cg,57,22,19); discOn(cg,41,13,15);
  discOn(cg,41,30,19); discOn(cg,12,32,11); discOn(cg,71,33,11);
  q.drawImage(glyphC(cg,'#359045','#1e6830','#143c20'),0,0);   // copa enorme
  q.fillStyle='#4ab058'; // motas de luz
  [[14,26],[28,12],[44,8],[60,14],[72,28],[20,36],[38,24],[54,34],[66,38],[32,30],[48,20],[10,34]]
    .forEach(([x,y])=>q.fillRect(x+1,y+1,2,1));
  return c;
})();
const OAK_GRAND_DARK=darken(OAK_GRAND);

const BLADE_SPR = spr([   // la Hoja Ancestral: una hoja de verdad, plantada en la arena
"................",
".......kk.......",
"......kllk......",
".....klldlk.....",
".....klldlk.....",
"....kllldllk....",
"....kllldllk....",
".....klldlk.....",
".....klldlk.....",
"......kldk......",
".......kAk......",
".......kAk......",
"....kmmkAkmmk...",
".....kkkkkkk....",
"................",
"................",
]);
const LEAF_SWING = spr([  // hoja de combate apuntando a la derecha; el peciolo (2,8) va en la mano
"................",
"................",
"................",
"................",
"................",
"......kkkkk.....",
"....kklllllkk...",
"...kllldllllk...",
".kAkddddddddlk..",
"...klllldlllk...",
"....kklllllkk...",
"......kkkkk.....",
"................",
"................",
"................",
"................",
]);
const SPROUT_SLEEP = spr([ // dormido, plantado en su maceta (ojos cerrados)
"................",
"................",
"................",
"......k.k.......",
".....klklk......",
"......klk.......",
"....kkkkkkkk....",
"...kssssssssk...",
"...kssssssssk...",
"...kskksskksk...",
"...kssssssssk...",
"....kssssssk....",
".....kkkkkk.....",
"................",
"................",
"................",
]);
const SPROUT_WAKE = spr([  // recién despierto, aún en la maceta (ojos abiertos)
"................",
"................",
"................",
"......k.k.......",
".....klklk......",
"......klk.......",
"....kkkkkkkk....",
"...kssssssssk...",
"...kskssssksk...",
"...kskssssksk...",
"...kssssssssk...",
"....kssssssk....",
".....kkkkkk.....",
"................",
"................",
"................",
]);
const SPROUT_WILT = spr([ // marchito: hoja caída, cabeza gacha, color mustio
"................",
"................",
"...k............",
"..klk...........",  // hojita caída a un lado
"...k............",
"....kkkkkkk.....",
"...kSSSSSSSk....",
"...kS><SS<>Sk...",  // ojos cerrados ><
"...kSSSSSSSk....",
"....kSSSSSk.....",
".....kkkkk......",
"....kmmmmmk.....",
"....kmmmmmk.....",
"....kmk.kmk.....",
"................",
"................",
],{S:'#c8b070','>':'#3a2a10','<':'#3a2a10',m:'#6a4020'});
const SEEDLING_SPR = spr([ // el brote que renace de la semilla
"................",
"................",
"................",
"................",
"................",
"................",
"................",
"......klk.......",  // tallito + hojita
".....klllk......",
"......klk.......",
"......kAk.......",  // semilla
".....kAAAk......",
"......kAk.......",
".......k........",
"................",
"................",
]);
const BOMB_SPR = spr([    // la Bellota-bomba
"................",
"........kk......",
".......k........",
"....kkkkkk......",
"...kAAAAAAk.....",
"..kAAAAAAAAk....",
"..kaaaaaaaak....",
"..kaawaaaaak....",
"...kaaaaaak.....",
"....kaaaak......",
".....kaak.......",
"......kk........",
"................",
"................",
"................",
"................",
]);
const EMBER_SPR = spr([   // la Brasa de Primavera
"................",
"................",
"................",
".......k........",
"......kok.......",
".....koook......",
".....koYok......",
"....koYYYok.....",
"....koYYYok.....",
".....koook......",
"......kkk.......",
"................",
"................",
"................",
"................",
"................",
],{o:'#f8a030',Y:'#f8e060'});
const TOPO_SPR = spr([    // el TOPO REAL — con su coronita de oro
".....C.C.C......",
".....CCCCC......",
".....kkkkkk.....",
"...kkbbbbbbkk...",
"..kbbbbbbbbbbk..",
".kbbkbbbbbbkbbk.",
".kbbbbnnnnbbbbk.",
".kbbbnnnnnnbbbk.",
".kbbbbnnnnbbbbk.",
".kcbbbbbbbbbbck.",
".kccbbbbbbbbcck.",
"..kkbbbbbbbbkk..",
"....kkkkkkkk....",
"................",
"................",
"................",
],{b:'#7a5a38',n:'#e89cb8',c:'#e8d8c0',C:'#f8d030'});
const HOOK_SPR = spr([    // la Raíz-Gancho
"................",
"................",
"....kkk.........",
"...kdldk........",
"...kldlk........",
"....klk.........",
"....klk..kkk....",
".....klkkdldk...",
"......klkdldk...",
".......kklkk....",
"......kdlk......",
".....kdlk.......",
"....kdlkk.......",
"....kkk.........",
"................",
"................",
]);
const TEAR_SPR = spr([    // la Lágrima de Verano
"................",
"................",
"................",
".......k........",
"......kbk.......",
"......kbk.......",
".....kbBbk......",
"....kbBwBbk.....",
"....kbBBBbk.....",
".....kbBbk......",
"......kkk.......",
"................",
"................",
"................",
"................",
"................",
],{b:'#3878d8',B:'#78c8f8'});
const WASP_SPR = spr([    // la REINA AVISPA — tiara de oro entre las alas
"......C.C.......",
"..kk..CCC..kk...",
".kwwk.....kwwk..",
".kwwwk...kwwwk..",
"..kwwwk.kwwwk...",
"...kkayyakk.....",
"...kayayayk.....",
"..kyayayayak....",
"..kayayayayk....",
"...kyayayyk.....",
"....kayayk......",
".....kyak.......",
"......kk........",
".......k........",
"................",
"................",
],{a:'#1a1410',y:'#f8d030',w:'#d8e8f0',C:'#ffe9a0'});
const WIND_SPR = spr([    // EL VIENTO DEL NORTE — espíritu de tormenta
"....wwwwww......",
"..wwccccccww....",
".wccccccccccw...",
"wcckaccccakccw..",  // ojos
"wccccccccccccw..",
"wcccckaakccccw..",  // boca abierta (aúlla)
".wccccaaccccw...",
"..wcccccccccw...",
"...wwccccww.w...",
"w....wwww...ww..",
".ww........w....",  // jirones de viento
"...www...ww.....",
"......www.......",
".w.....w...ww...",
"...ww.....w.....",
"................",
],{w:'#aaccdd',c:'#e8f4ff',a:'#3a5a8a'});
const FLAKE_SPR = spr([   // el COPO ETERNO
"................",
"......k.k.......",
".....kwkwk......",
"......kwk.......",
"..k.kkwwwkk.k...",
"...kwwwwwwwk....",
"kkwwwwwwwwwwwkk.",
".kwwwkwwwkwwwk..",
"kkwwwwwwwwwwwkk.",
"...kwwwwwwwk....",
"..k.kkwwwkk.k...",
"......kwk.......",
".....kwkwk......",
"......k.k.......",
"................",
"................",
],{w:'#dff0ff'});
/* --- los vecinos, cada uno con su silueta (el diálogo manda sobre el diseño) --- */
const PETRA_SPR = spr([ // la niña del diente de león: bajita, con su vilano
"................",
"......kwwk......",
".....kwwwwk.....",
"......kdk.......",
"....kkkkkkkk....",
"...kssssssssk...",
"...kskssssksk...",
"...kssssssssk...",
"....kssssssk....",
".....kkkkkk.....",
"....kbbbbbbk....",
"....kbbbbbbk....",
"....kbbbbbbk....",
"....kmk..kmk....",
"................",
"................",
],{b:'#d84878',w:'#f0f0e0'});
const LUPA_SPR = spr([ // la jardinera: pamela de paja con flor
"......kRk.......",
".....kyyyyyk....",
"....kyyyyyyyk...",
"...kssssssssk...",
"...kskssssksk...",
"...kskssssksk...",
"...kssssssssk...",
"....kssssssk....",
".....kkkkkk.....",
"....kbbbbbbk....",
"...ksbbbbbbbk...",
"....kbbbbbbk....",
"....kbbbbbbk....",
"....kmmk..kmk...",
"................",
"................",
],{b:'#3878d8',y:'#e8c860',R:'#e84848'});
const MOSS_SPR = spr([ // el pescador: gorra de musgo y caña al hombro
"................",
"....kcccccck....",
"...kcccccccck...",
"....kkkkkkkk..w.",
"...kssssssssk.A.",
"...kskssssksk.A.",
"...kskssssksk.A.",
"...kssssssssk.A.",
"....kssssssk..A.",
".....kkkkkk...A.",
"....kbbbbbbk..A.",
"...ksbbbbbbbk.A.",
"....kbbbbbbk..A.",
"....kbbbbbbk....",
"....kmmk..kmk...",
"................",
],{b:'#6a5838',c:'#3a5a2a',w:'#d8e8f0'});
const TILO_SPR = spr([ // el tendero: hoja de tilo (corazón) y delantal
".....kl.lk......",
"....klllllk.....",
"......klk.......",
"....kkkkkkkk....",
"...kssssssssk...",
"...kskssssksk...",
"...kskssssksk...",
"...kssssssssk...",
"....kssssssk....",
".....kkkkkk.....",
"....kbwwwwbk....",
"...ksbwwwwbbk...",
"....kbwwwwbk....",
"....kbwwwwbk....",
"....kmmk..kmk...",
"................",
],{b:'#e8b050',l:'#3a7a30',w:'#f0e8d0'});
const NPCS={
  h:{name:'Petra', img:PETRA_SPR},
  j:{name:'Lupa',  img:LUPA_SPR},
  y:{name:'Moss',  img:MOSS_SPR},
  g:{name:'Tilo',  img:TILO_SPR}, // el tendero
};
/* retratos del diálogo (a lo Golden Sun): el sprite del hablante, en grande */
const PORTRAITS={
  'RAÍZ':ELDER, 'PETRA':PETRA_SPR, 'LUPA':LUPA_SPR, 'MOSS':MOSS_SPR, 'TILO':TILO_SPR,
  'EL VIENTO':WIND_SPR, 'EL TOPO REAL':TOPO_SPR, 'LA REINA':WASP_SPR,
};
/* --- fauna nueva: la ardilla ladrona y el carámbano --- */
const SQUIRREL_ROWS=[
"................",
"................",
"...........kk...",
"..........kqqk..",
".....kk..kqqqqk.",
"....kqqk.kqqqqk.",
"...kqqqqkkqqqk..",
"...kqwqqqqqqk...",
"...kqqqqqqqk....",
"....kqqqqqqk....",
".....kqqqqk.....",
"....kqk..kqk....",
"................",
"................",
"................",
"................",
];
const SQUIRREL = spr(SQUIRREL_ROWS,{q:'#b07840',w:'#1a1410'});
const SQUIRREL_L = flipH(SQUIRREL);
const SQUIRREL_WHITE = whiten(SQUIRREL);
const ICICLE_SPR = spr([ // carámbano colgante
"....kwwwwwk.....",
"....kwiiiwk.....",
".....kwiiwk.....",
".....kwiiwk.....",
"......kwiwk.....",
"......kwiwk.....",
".......kwik.....",
".......kwik.....",
"........kwk.....",
"........kwk.....",
".........k......",
"................",
"................",
"................",
"................",
"................",
],{w:'#dff0ff',i:'#a8d0e8'});
const ICICLE_WHITE = whiten(ICICLE_SPR);
const SPIN_ICON=(()=>{ // icono del Remolino para zurrón y tienda
  const c=document.createElement('canvas'); c.width=16; c.height=16;
  const g=c.getContext('2d');
  g.strokeStyle=PAL.l; g.lineWidth=1.5;
  g.beginPath(); g.arc(8,8,5.5,0.4,5.2); g.stroke();
  g.strokeStyle='#a8ec78';
  g.beginPath(); g.arc(8,8,3,2.4,7.2); g.stroke();
  g.fillStyle='#a8ec78'; g.fillRect(12,3,2,2);
  return c;
})();
const P_SPRITES = { // [dir][frame] — 0 abajo, 1 arriba, 2 izq, 3 dcha
  0:[SPROUT_DOWN, flipH(SPROUT_DOWN)],
  1:[SPROUT_UP,   flipH(SPROUT_UP)],
  3:[SPROUT_SIDE, SPROUT_SIDE_B],
  2:[flipH(SPROUT_SIDE), flipH(SPROUT_SIDE_B)],
};
const P_WHITE = {0:whiten(SPROUT_DOWN),1:whiten(SPROUT_UP),2:whiten(flipH(SPROUT_SIDE)),3:whiten(SPROUT_SIDE)};
const TOPO_WHITE = whiten(TOPO_SPR);
const WASP_WHITE = whiten(WASP_SPR);
const WIND_WHITE = whiten(WIND_SPR);
const BLOB_WHITE = whiten(BLOB), BAT_WHITE = whiten(BAT);
const BEETLE_L = flipH(BEETLE);                 // mira a la izquierda
const E_SPR = { // [tipo] → {img, white} (algunos con orientación se resuelven en draw)
  beetle:{a:BEETLE, b:BEETLE_L, w:whiten(BEETLE)},
  roller:{a:ROLLER, ball:ROLLER_BALL, w:whiten(ROLLER), wball:whiten(ROLLER_BALL)},
  ghost:{a:GHOST, w:whiten(GHOST)},
  frog:{a:FROG, jump:FROG_JUMP, w:whiten(FROG), wjump:whiten(FROG_JUMP)},
  thorn:{a:THORN, open:THORN_OPEN, w:whiten(THORN), wopen:whiten(THORN_OPEN)},
  squirrel:{a:SQUIRREL, b:SQUIRREL_L, w:SQUIRREL_WHITE},
  icicle:{a:ICICLE_SPR, w:ICICLE_WHITE},
};

