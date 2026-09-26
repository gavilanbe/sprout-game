'use strict';
/* ============================================================
   EL ANILLO DEL AÑO y LOS ANILLOS DEL ROBLE (docs/TERCERA-PASADA.md §7.2-7.3). El motor.
   · Región 'anillos' (x 22..26): las salas de la mazmorra final son recuerdos del valle, pintados con el arte
     de siempre y la estación que les toca. Cada sala guarda su estación ('SE'+sala+':'+s en opened).
   · El ANILLO DEL AÑO (X): hace girar la estación de la sala donde estás: primavera → verano → otoño →
     invierno → primavera. El cambio sale de Sprout como una onda de color. Fuera del Roble no gira.
   · Casillas de estación (el mapa guarda la casilla «neutra»; la estación decide qué es):
       'W' agua ........ invierno: hielo de verdad (se resbala, como en el Templo; los bloques también)
       'Ꞥ' nenúfar ..... verano: abierto (se pisa) · invierno: hielo · si no: agua con un capullo
       'Ꞓ' semillero ... primavera: ENREDADERA (y tiende puente sobre la sima de al lado) · verano: arbusto en flor
                          (sólido; cortado da bayas) · otoño: rama seca (el farol la quema) · invierno: brote dormido (se pisa)
       'Ꞔ' barro ....... verano: seco · invierno: helado (los dos se pisan) · si no: barro que traga
       'Ꞗ' hojas-placa . otoño: un montón de hojarasca que pisa la placa · si no: la placa, vacía
       'ꞗ' hojas-hoyo .. otoño: la hojarasca tapa el agujero · si no: agujero
       'Ꞙ' ventisquero . invierno: nieve dura (sólida; el molinillo la barre) · si no: hierba
       'Ꞛ' seda gris ... nunca cambia: el gris no tiene estación. El farol la quema.
       'Ꞝ' roído ....... un agujero gris donde la polilla se comió el recuerdo: la primavera lo cubre de raíces;
                          el invierno lo hiela; si no, se cae
   · Un bloque empujado sobre el hielo resbala; si el hielo se funde bajo él, se hunde y deja una PIEDRA ('Ꞣ').
   ============================================================ */
const RING_X0=22, RING_X1=26;
const SEASON_NAME=['PRIMAVERA','VERANO','OTOÑO','INVIERNO'], SEASON_TINT=['#f8a0d0','#f8d030','#e8803a','#dff0ff'];
['Ꞓ','ꞓ','Ꞔ','ꞔ','ꞕ','Ꞗ','ꞗ','Ꞙ','Ꞝ','Ꞟ','Ꞣ'].forEach(c=>GROUND.add(c));           // lo que se pisa (o por donde se cae)
['Ꞥ','Ꞧ','Ꞡ','ꞡ','Ꞛ','Ꝡ','Ꞻ','Ꞵ'].forEach(c=>SOLID.add(c)); GROUND.add('ꞻ');                // Ꞧ el capullo helado · Ꝡ el Roble joven · Ꞻ el desgarro (ꞻ, abierto)                                          // lo que no
/* las salas de los Anillos: su estación de recuerdo (la que tienen al llegar) */
const RING_ROOMS={
  '22,4':{ring:3,season:3,name:'La plaza del último invierno'},
  '23,4':{ring:3,season:3,name:'El estanque de las dos estaciones'},
  '23,3':{ring:3,season:3,name:'El desgarro del invierno',oruga:{tear:[4,0],hits:4,segs:7,spd:1.05,next:[23,2,7*16,6*16-4]}},
  '23,2':{ring:2,season:2,name:'La plaza de las escobas'},
  '22,2':{ring:2,season:2,name:'El barrizal'},
  '22,1':{ring:2,season:2,name:'El desgarro del otoño',oruga:{tear:[4,0],hits:5,segs:9,spd:1.25,next:[25,2,5*16,5*16-4]}},
  '25,2':{ring:1,season:1,name:'El prado de la Reina',sun:true},
  '24,2':{ring:1,season:1,name:'El claro del sol',sun:true},
  '24,3':{ring:1,season:1,name:'El desgarro del verano',oruga:{tear:[4,7],hits:6,segs:11,spd:1.4,next:[24,1,6*16,6*16-4]}},
  '24,1':{ring:0,season:0,name:'El primer día'},
  '24,0':{ring:0,season:0,name:'El último desgarro',oruga:{tear:[4,0],hits:7,segs:13,spd:1.55,next:null}},
};
function inRings(){ return regionOf(sx,sy)==='anillos'; }
{ const R0=regionOf; regionOf=function(nx,ny){ if(nx>=RING_X0&&nx<=RING_X1&&ny>=-6&&ny<=6) return 'anillos'; return R0(nx,ny); }; }
function hasRing(){ return opened.has('ANILLO'); }
function roomSeason(key){ for(let s=0;s<4;s++) if(opened.has('SE'+key+':'+s)) return s; const R=RING_ROOMS[key]; return R?R.season:0; }
function setRoomSeason(key,s){ for(let q=0;q<4;q++) opened.delete('SE'+key+':'+q); opened.add('SE'+key+':'+s); }
{ const B0=screenBiome; screenBiome=function(nx,ny){ if(regionOf(nx,ny)==='anillos') return seasonBio(roomSeason(nx+','+ny)); return B0(nx,ny); }; }
{ const F0=regionFloor; regionFloor=function(){ return inRings()?'.':F0(); }; }
{ const S0=screenStyle; screenStyle=function(nx,ny){ return regionOf(nx,ny)==='anillos'?'cave':S0(nx,ny); }; } // los agujeros, con su pared

/* ---------- qué es cada casilla de estación en cada estación ---------- */
function seasonTile(c,s){
  switch(c){
    case 'W': return s===3?'i':'W';
    case 'Ꞥ': return s===1?'@':s===3?'Ꞧ':'Ꞥ';   // en invierno el capullo se hiela: un bulto en el hielo (el gancho y los bloques chocan)
    case 'Ꞓ': return ['ꞓ','Ꞡ','ꞡ','Ꞓ'][s];   // (quemado en otoño: ya no está; ver applySeason)
    case 'Ꞔ': return s===1?'ꞔ':s===3?'ꞕ':'Ꞔ';
    case 'Ꞗ': return s===2?'Ꞗ':'_';
    case 'ꞗ': return s===2?'ꞗ':'°';
    case 'Ꞙ': return s===3?'∩':'.';
    case 'Ꞝ': return s===0?'Ꞟ':s===3?'i':'Ꞝ';
  } return null; }
const SEASON_BASE=new Set(['W','Ꞥ','Ꞓ','Ꞔ','Ꞗ','ꞗ','Ꞙ','Ꞝ']);
function applySeason(s){ const key=sx+','+sy, M=MAPS[key]; if(!M) return;
  for(let y=0;y<SH;y++){ const row=[...M[y]]; for(let x=0;x<SW;x++){ const c=row[x]; if(!SEASON_BASE.has(c)) continue;
    if(c==='Ꞙ'&&opened.has('SD'+key+':'+x+','+y)&&s===3){ grid[y][x]='n'; continue; }             // barrido este invierno
    if(grid[y][x]==='#'||grid[y][x]==='Ꞣ') continue;                                              // un bloque encima (o la piedra que dejó)
    if(grid[y][x]==='Ꞝ'&&oruga&&oruga.eaten.some(e=>e[0]===x&&e[1]===y)) continue;              // lo que ha roído la Oruga solo lo repara la estación del anillo
    if(c==='Ꞓ'&&opened.has('SB'+key+':'+x+','+y)){ grid[y][x]='.'; continue; }                 // un semillero quemado ya no vuelve
    grid[y][x]=seasonTile(c,s); } }
  if(s===0) for(let y=0;y<SH;y++) for(let x=0;x<SW;x++) if(grid[y][x]==='ꞓ') vineBridge(x,y);   // la enredadera tiende su puente
  for(const k of stonesOf(key)){ const [x,y]=k; grid[y][x]='Ꞣ'; }                                // las piedras que dejaron los bloques hundidos
  for(let y=0;y<SH;y++) for(let x=0;x<SW;x++) if(grid[y][x]==='Ꞛ'&&opened.has('SK'+key+':'+x+','+y)) grid[y][x]='.'; // la seda quemada
  // el hielo de verdad: en invierno, el agua helada resbala (el plano del Templo, 12e)
  if(s===3){ TRUE_ICE.add(key); icePlan=grid.map((r,y)=>r.map((c,x)=>c==='#'?(seasonTile([...M[y]][x],s)||'.'):c)); } else { TRUE_ICE.delete(key); icePlan=null; } // lo que hay debajo de cada bloque: hielo, barro helado o hierba
  ringPlatesCheck(true); }
function vineBridge(x,y){ for(const [dx,dy] of [[0,-1],[1,0],[0,1],[-1,0]]){ let cx=x+dx, cy=y+dy; if(!isPitRing(grid[cy]&&grid[cy][cx])) continue;
    while(isPitRing(grid[cy]&&grid[cy][cx])){ grid[cy][cx]='Ꞟ'; cx+=dx; cy+=dy; } return; } }
function isPitRing(c){ return c==='°'||c==='Ꞝ'; }
function stonesOf(key){ const out=[], pre='ST'+key+':'; for(const k of opened) if(k.startsWith(pre)) out.push(k.slice(pre.length).split(',').map(Number)); return out; }

/* ---------- al entrar en una sala de los Anillos ---------- */
{ const I0=initRoomRules; initRoomRules=function(){ I0(); if(inRings()) initRing(); else ringTurn=null; }; }
let ringTurn=null;
function initRing(){ ringTurn=null; applySeason(roomSeason(sx+','+sy)); }

/* ---------- el Anillo: X hace girar la estación de la sala ---------- */
function useRing(){ if(!inRings()){ SFX.bump(); showToast('EL ANILLO NO GIRA','solo dentro del Roble'); return; }
  if(ringTurn&&ringTurn.t<20) return;
  const key=sx+','+sy, s0=roomSeason(key), s1=(s0+1)&3;
  if(bgDirty||!bgCanvas[0]) rebuildBg(); bgEnsure(bgFrame()); const snap=mkCanvas(160,128); snap.getContext('2d').drawImage(bgCanvas[bgFrame()],0,0);
  sinkBlocks(s0,s1);
  setRoomSeason(key,s1); applySeason(s1); markDirty(); rebuildBg(); save();
  const [tx,ty]=playerTile(), under=grid[ty][tx]; if(isSolid(under)){ if(under==='W'||under==='Ꞥ'){ state='fall'; deathT=40; SFX.fall(); player.atk=0; } else [player.x,player.y]=findFree(player.x,player.y,'x'); } // el hielo se funde bajo sus pies: al agua · si le brota algo debajo, se aparta
  if(RING_ROOMS[key]&&s1===RING_ROOMS[key].ring) repairEaten();
  ringTurn={t:0,snap,cx:player.x+8,cy:player.y+8,s:s1}; player.squash=-.2; shake=Math.max(shake,3);
  if(AC){ const a=AC.currentTime, root=[60,62,65,59][s1]; [0,4,7,12].forEach((m,i)=>beep('triangle',f(root+m),0,.6,.028,a+i*.07)); noise(.3,.02,true,a,[5000,6500,2400,8000][s1]); }
  for(let i=0;i<18;i++){ const a=i/18*6.283; parts.push({k:s1===2?'blade':'mote',x:player.x+8,y:player.y+8,vx:Math.cos(a)*1.5,vy:Math.sin(a)*1.2,life:36,max:36,sway:Math.random()*6,rot:Math.random()*6,vr:.3,col:i&1?SEASON_TINT[s1]:'#ffffff',nog:true}); }
  showToast(SEASON_NAME[s1],['la enredadera despierta','se abren los nenúfares','caen las hojas','el agua se hiela'][s1]); }
/* un bloque sobre el hielo que se funde: se hunde y deja una piedra para siempre */
function sinkBlocks(s0,s1){ const key=sx+','+sy, M=MAPS[key], thaw=s0===3&&s1!==3, soften=(s0===1||s0===3)&&(s1===0||s1===2); if(!thaw&&!soften) return;
  for(let y=0;y<SH;y++) for(let x=0;x<SW;x++){ if(grid[y][x]!=='#') continue; const base=[...M[y]][x]; if(!((thaw&&(base==='W'||base==='Ꞥ'))||(soften&&base==='Ꞔ'))) continue; // el hielo que se funde, o el barro que se ablanda: lo que pesa se hunde
    opened.add('ST'+key+':'+x+','+y); grid[y][x]='Ꞣ';
    for(let i=0;i<10;i++){ const a=Math.random()*6.283; parts.push({k:'dust',x:x*16+8,y:y*16+10,vx:Math.cos(a)*1,vy:Math.sin(a)*.6-.3,life:20,max:20,r:1+(i&1),col:i&1?'#a8d8f0':'#ffffff',nog:true}); }
    if(AC){ noise(.4,.04,false,undefined,700); beep('triangle',f(48),f(36),.4,.04); } } }

/* ---------- las placas de hojarasca: en otoño, el montón pesa ---------- */
function ringPlatesCheck(silent){ if(!inRings()) return; const key=sx+','+sy; if(opened.has('PZ'+key)) return; let n=0, on=0;
  const M=MAPS[key]; for(let y=0;y<SH;y++){ const row=[...M[y]]; for(let x=0;x<SW;x++){ const b=row[x]; if(b!=='_'&&b!=='Ꞗ') continue; n++; const c=grid[y][x]; if(c==='#'||c==='Ꞗ') on++; } }
  if(!n||on<n) return; opened.add('PZ'+key); if(!silent){ SFX.puzzle(); shake=4; } openGates(); save(); }
{ const C0=checkPlates; checkPlates=function(){ if(inRings()){ ringPlatesCheck(false); return; } C0(); }; }

/* ---------- el farol quema la seda gris y las ramas secas del otoño ---------- */
function updRingFire(){ for(const q of flares){ const tx=q.x>>4, ty=(q.y-2)>>4, c=grid[ty]&&grid[ty][tx]; if(c!=='Ꞛ'&&c!=='ꞡ') continue;
    const key=sx+','+sy; grid[ty][tx]='.'; opened.add((c==='Ꞛ'?'SK':'SB')+key+':'+tx+','+ty); markDirty(); save(); // la seda y la rama seca, quemadas para siempre
    for(let i=0;i<12;i++) parts.push({k:'dust',x:tx*16+4+Math.random()*8,y:ty*16+4+Math.random()*8,vx:(Math.random()-.5)*.6,vy:-.4-Math.random()*.5,life:26,max:26,r:1+(i&1),col:c==='Ꞛ'?(i&1?OLV.dust:OLV.dustD):(i&1?'#f8a030':'#6a4a28'),nog:true});
    if(AC) noise(.3,.03,false,undefined,c==='Ꞛ'?3200:1800); } }
/* el molinillo barre el ventisquero de invierno (sin el aviso de la grieta del norte) */
{ const B0=blowDrift; blowDrift=function(x,y){ if(!inRings()){ B0(x,y); return; } const key=sx+','+sy; for(let dx=-2;dx<=2;dx++){ const xx=x+dx; if(grid[y][xx]!=='∩') continue;
    grid[y][xx]='n'; opened.add('SD'+key+':'+xx+','+y); puff(xx*16+8,y*16+8,'#ffffff',10,1.4); } SFX.secret(); shake=4; markDirty(); save(); }; }
/* el barro traga: pisarlo es caer (y volver a la entrada) */
{ const U0=updRoomRules; updRoomRules=function(){ U0(); if(!inRings()) return; updRingFire(); if(ringTurn&&++ringTurn.t>34) ringTurn=null;
  if(state==='play'&&jumpT===0){ const [tx,ty]=playerTile(), c=grid[ty]&&grid[ty][tx]; if(c==='Ꞝ'||c==='Ꞔ'){ state='fall'; deathT=40; SFX.fall(); player.atk=0; } } }; }

/* ---------- el Anillo como objeto de X ---------- */
const RING_SPR=mkTile(g=>{ // un corte del tronco: cuatro cuartos de color y los anillos del año
  for(let y=0;y<16;y++) for(let x=0;x<16;x++){ const dx=x-7.5, dy=y-7.5, d=Math.hypot(dx,dy); if(d>7.4) continue;
    const q=dx<0?(dy<0?0:3):(dy<0?1:2), band=Math.floor(d)%2;
    PX(g,x,y,d>6.5?PAL.k:d<1.5?'#6a4424':band?shade(SEASON_TINT[q],-.18):SEASON_TINT[q]); }
  PX(g,7,7,'#3a2410'); PX(g,8,8,'#3a2410'); PX(g,5,3,'#ffffff'); PX(g,4,4,'#ffffff'); },16,16);
addEventListener('DOMContentLoaded',()=>{ X_ITEMS.push('anillo'); // 13 carga después
  X_ICON.anillo=RING_SPR; X_NAME.anillo='ANILLO DEL AÑO';
  if(typeof X_DESC==='object') X_DESC.anillo='Dentro del Roble: hace girar la estación de la sala.';
  const O0=ownedX; ownedX=function(){ const L=O0(); if(hasRing()&&!L.includes('anillo')) L.push('anillo'); return L; };
  const U0=useItem; useItem=function(){ if(xItem==='anillo'&&hasRing()){ xFlash=10; useRing(); return; } U0(); }; });

/* ---------- lo que se pinta ---------- */
function ringTileArt(c,bio){ return cached('ring'+c+bio,g=>{ const P=BIOMES[bio]||BIOMES.valley, gr=P.grass;
  if(c==='Ꞓ'){ R(g,3,11,10,3,'#5a3a1c'); R(g,4,10,8,1,'#7a5028'); for(const [x,y] of [[5,9],[8,8],[10,9]]){ PX(g,x,y,'#78d838'); PX(g,x,y-1,'#a8ec78'); } return; } // brote dormido en su semillero
  if(c==='ꞓ'){ R(g,3,11,10,3,'#5a3a1c'); for(let i=0;i<16;i++){ const x=7+Math.round(Math.sin(i*.7)*2); PX(g,x,15-i,'#3c8a34'); PX(g,x+1,15-i,'#78c850'); } for(const [x,y] of [[4,4],[10,7],[5,10]]){ R(g,x,y,3,2,'#58a840'); PX(g,x+1,y,'#a4e070'); } return; } // la enredadera
  if(c==='Ꞡ'){ for(let y=0;y<16;y++) for(let x=0;x<16;x++){ const d=Math.hypot(x-7.5,y-8.5); if(d>7) continue; PX(g,x,y,d>6.2?PAL.k:(x+y)%3?'#3a9a40':'#68c058'); } for(const [x,y] of [[5,5],[10,6],[7,10],[4,9],[11,11]]){ R(g,x,y,2,2,'#f8a0d0'); PX(g,x,y,'#ffffff'); } return; } // arbusto en flor
  if(c==='ꞡ'){ for(let i=0;i<7;i++){ const a=-1.3+i*.45; for(let r=2;r<8;r++){ const x=Math.round(8+Math.cos(a)*r), y=Math.round(14-Math.abs(Math.sin(a))*r*1.2-r*.3); PX(g,x,y,r<3?'#5a3a1c':'#8a6438'); } } R(g,6,13,4,2,'#4a2e14'); return; } // rama seca
  if(c==='Ꞔ'||c==='ꞔ'||c==='ꞕ'){ const dry=c==='ꞔ', ice=c==='ꞕ'; for(let y=0;y<16;y++) for(let x=0;x<16;x++){ const d=Math.hypot((x-7.5)/7.2,(y-8)/6.4); if(d>1) continue; // la charca de barro: blanda, seca o helada
      PX(g,x,y,d>.9?(ice?'#6a90b8':'#3a2410'):ice?(y<6?'#dff0ff':'#a8d0f0'):dry?((x*3+y)%7===0?'#6a4a28':'#9a7448'):((x+y*2)%5===0?'#5a3a1c':'#4a2e14')); }
    if(dry) for(const [x,y,w] of [[3,6,4],[8,9,5],[5,11,3]]) R(g,x,y,w,1,'#5a3a1c'); else if(!ice) for(const [x,y] of [[5,6],[10,9]]) PX(g,x,y,'#7a5a38'); else { PX(g,5,5,'#ffffff'); PX(g,6,5,'#ffffff'); } return; }
  if(c==='Ꞗ'||c==='ꞗ'){ for(let i=0;i<34;i++){ const a=i*2.39, r=Math.sqrt(i)*1.25, x=Math.round(7.5+Math.cos(a)*r), y=Math.round(9+Math.sin(a)*r*.75); R(g,x,y,2,1,['#c86424','#e8a040','#a04818','#f0c060'][i&3]); } R(g,3,13,10,1,'#6a3a14'); return; } // el montón de hojarasca
  if(c==='Ꞛ'){ R(g,0,0,16,16,OLV.ink); for(let i=0;i<6;i++){ const y=1+i*3; for(let x=0;x<16;x++) if(((x+i*3)%7)<5) PX(g,x,y+((x>>2)&1),i&1?OLV.dust:OLV.dustD); } R(g,0,0,16,1,OLV.wingL); return; } // seda gris
  if(c==='Ꞝ'){ R(g,0,0,16,16,'#141018'); for(let y=0;y<16;y++) for(let x=0;x<16;x++){ const n=(x*7+y*13)%11; if(n===0) PX(g,x,y,OLV.dustD); else if(n===5) PX(g,x,y,'#2a2230'); } // roído: un agujero gris, sin fondo
    for(let x=0;x<16;x++){ PX(g,x,0,OLV.dust); if(x%3) PX(g,x,1,OLV.dustD); } return; }
  if(c==='Ꞟv'){ R(g,6,0,4,16,'#3c8a34'); R(g,6,0,1,16,'#78c850'); R(g,9,0,1,16,'#1e5a28'); for(let y=1;y<16;y+=4){ R(g,4,y,2,2,'#58a840'); PX(g,4,y,'#a4e070'); R(g,10,y+2,2,2,'#58a840'); } return; } // la enredadera, de arriba abajo
  if(c==='Ꞟ'){ R(g,0,6,16,4,'#3c8a34'); R(g,0,6,16,1,'#78c850'); R(g,0,9,16,1,'#1e5a28'); for(let x=1;x<16;x+=4){ R(g,x,4,2,2,'#58a840'); PX(g,x,4,'#a4e070'); R(g,x+2,10,2,2,'#58a840'); } return; } // enredadera sobre el hueco
  if(c==='Ꞣ'){ for(let y=0;y<16;y++) for(let x=0;x<16;x++){ const d=Math.hypot((x-7.5)/6.6,(y-8.5)/5.6); if(d>1) continue; PX(g,x,y,d>.86?PAL.k:y<7?'#a8a098':(x+y)%4?'#7a726a':'#8a8278'); } PX(g,5,5,'#d0c8c0'); PX(g,6,5,'#d0c8c0'); return; } // la piedra que dejó el bloque
  if(c==='Ꞥ'){ for(const [x,y] of [[7,6],[8,6],[7,7],[8,7],[7,8]]) PX(g,x,y,'#58a840'); PX(g,7,5,'#f8a0d0'); PX(g,8,5,'#f8c0e0'); return; } // un capullo de nenúfar, cerrado
  if(c==='Ꞧ'){ for(let y=0;y<16;y++) for(let x=0;x<16;x++){ const d=Math.hypot((x-7.5)/5.2,(y-9)/4.2); if(d>1) continue; PX(g,x,y,d>.82?'#5a88b8':y<8?'#f0f8ff':(x+y)&1?'#c8e4f8':'#a8d0f0'); } // el capullo, preso en un bulto de hielo
    for(const [x,y] of [[7,7],[8,7],[7,8]]) PX(g,x,y,'#6a9a60'); PX(g,7,6,'#d8a0c0'); PX(g,5,6,'#ffffff'); PX(g,6,5,'#ffffff'); return; }
}); }
{ const G0=drawGround; drawGround=function(g,rows,x,y,ch,opts,f){ if(regionOf(opts.sx,opts.sy)!=='anillos') return G0(g,rows,x,y,ch,opts,f);
  const px=x*16, py=y*16, grass=()=>G0(g,rows,x,y,'.',opts,f), water=()=>G0(g,rows,x,y,'W',opts,f);
  if(ch==='Ꞓ'||ch==='ꞓ'){ grass(); g.drawImage(ringTileArt(ch,opts.bio),px,py); return; }
  if(ch==='Ꞔ'||ch==='ꞔ'||ch==='ꞕ'){ grass(); const e=edgesOf(rows,x,y,c=>c!=='Ꞔ'&&c!=='ꞔ'&&c!=='ꞕ'&&c!=='Ꞣ'); g.drawImage(mudTile(ch==='Ꞔ'?0:ch==='ꞔ'?1:2,e&15,(x*5+y*3)&3),px,py); return; }
  if(ch==='Ꞗ'){ grass(); g.drawImage(plateTile(1),px,py); g.drawImage(ringTileArt('Ꞗ',opts.bio),px,py); return; }
  if(ch==='ꞗ'){ const e=edgesOf(rows,x,y,c=>c!=='ꞗ'&&c!=='°'&&c!=='Ꞟ'); g.drawImage(leafPitTile(e&15,(x*7+y*5)&3),px,py); return; }
  if(ch==='°'){ g.drawImage(simaTile(edgesOf(rows,x,y,c=>c!=='°'&&c!=='ꞗ'&&c!=='Ꞟ')&15),px,py); return; }
  if(ch==='Ꞝ'){ g.drawImage(ringTileArt('Ꞝ',opts.bio),px,py); return; }
  if(ch==='Ꞟ'){ g.drawImage(simaTile(edgesOf(rows,x,y,c=>c!=='°'&&c!=='ꞗ'&&c!=='Ꞟ')&15),px,py); const v=c=>c==='Ꞟ'||c==='ꞓ'; const vert=(rows[y-1]&&v(rows[y-1][x]))||(rows[y+1]&&v(rows[y+1][x])); g.drawImage(ringTileArt(vert?'Ꞟv':'Ꞟ',opts.bio),px,py); return; }
  if(ch==='Ꞣ'){ const b=[...(MAPS[opts.sx+','+opts.sy]||[])[y]||''][x]; if(b==='Ꞔ'){ grass(); g.drawImage(ringTileArt('Ꞔ',opts.bio),px,py); } else water(); g.drawImage(ringTileArt('Ꞣ',opts.bio),px,py); return; } // la piedra, en el agua o en el barro
  if(ch==='Ꞥ'){ water(); g.drawImage(ringTileArt('Ꞥ',opts.bio),px,py); return; }
  if(ch==='i'||ch==='Ꞧ'){ const e=edgesOf(rows,x,y,c=>c!=='i'&&c!=='Ꞧ'&&c!=='#'&&c!=='Ꞣ'); g.drawImage(pondIceTile(e&15,(x*7+y*3)&3),px,py); if(ch==='Ꞧ') g.drawImage(ringTileArt('Ꞧ',opts.bio),px,py); return; }
  if(ch==='Ꞡ'||ch==='ꞡ'||ch==='Ꞛ'){ grass(); return; }
  return G0(g,rows,x,y,ch,opts,f); }; }
{ const O0=drawObject; drawObject=function(g,rows,x,y,ch,opts,f,fg){ if(ch==='Ꞧ') return; if(ch==='Ꞡ'||ch==='ꞡ'||ch==='Ꞛ'){ g.drawImage(ringTileArt(ch,opts.bio),x*16,y*16); return; } if(ch==='Ꞥ') return; return O0(g,rows,x,y,ch,opts,f,fg); }; }
/* el giro: la estación nueva sale de Sprout en un círculo de píxeles; fuera, todavía la vieja */
function drawRingTurn(){ const T=ringTurn; if(!T) return; const k=CA_EASE.out(Math.min(1,T.t/26)), r=Math.round(k*190), cx=Math.round(T.cx), cy=Math.round(T.cy);
  for(let y=0;y<128;y++){ const dy=y-cy, w=r*r-dy*dy; if(w<=0){ ctx.drawImage(T.snap,0,y,160,1,0,y,160,1); continue; } const h=Math.floor(Math.sqrt(w)), a=Math.max(0,cx-h), b=Math.min(160,cx+h+1);
    if(a>0) ctx.drawImage(T.snap,0,y,a,1,0,y,a,1); if(b<160) ctx.drawImage(T.snap,b,y,160-b,1,b,y,160-b,1);
    ctx.fillStyle=SEASON_TINT[T.s]; if(a>0) ctx.fillRect(a,y,1,1); if(b<160) ctx.fillRect(b-1,y,1,1); } } // el borde de la onda, del color de la estación
{ const D0=drawScorches; drawScorches=function(){ D0(); if(inRings()) drawRingTurn(); }; }

/* ============================================================
   LOS RECUERDOS: figuras del pasado, como fantasmas dorados, mientras la sala está en su estación
   ============================================================ */
const RING_GHOSTS={
  '22,4':[{kind:'wind',x:92,y:50,mood:'happy',notes:true}],   // Cierzo le canta la nana al Roble dormido
  '25,2':[{kind:'queen',x:88,y:18}], // la Reina le pide descanso al Roble, que dice que no
  '24,1':[{kind:'seeds',x:80,y:22}],   // la Tierra planta dos semillas: una será el Roble; la otra, el viento
  '23,2':[{kind:'npc',ch:'g',x:112,y:24,sweep:1},{kind:'npc',ch:'ö',x:24,y:88,sweep:-1},{kind:'npc',ch:'h',x:128,y:88,sweep:1}], // el valle barre las hojas, con rabia
};
let GHOST_TINT=new Map();
function ghostImg(img){ let t=GHOST_TINT.get(img); if(!t){ const fill=tintTo(img,'#fff4d8'), edge=tintTo(img,'#6a5238'); t=mkCanvas(img.width+2,img.height+2); const g=t.getContext('2d'); // el recuerdo: claro, con un contorno cálido para que se lea
    for(const [dx,dy] of [[0,1],[2,1],[1,0],[1,2]]) g.drawImage(edge,dx,dy); g.drawImage(fill,1,1); GHOST_TINT.set(img,t); } return t; }
function drawRingGhosts(){ const key=sx+','+sy, G=RING_GHOSTS[key], R=RING_ROOMS[key]; if(!G||!R||roomSeason(key)!==R.season) return;
  for(const q of G){ const bob=Math.round(Math.sin(tick*.05)*2), a=.56+.1*Math.sin(tick*.07);
    if(q.kind==='wind'){ const img=windArt({s:1,mood:q.mood,f:(tick>>3)&7,flip:true}); ctx.globalAlpha=a; ctx.drawImage(ghostImg(img),Math.round(q.x-(img.width-22))-1,Math.round(q.y-17+bob)-1); ctx.globalAlpha=1;
      if(q.notes&&(tick%40)===0) parts.push({k:'mote',x:q.x-10,y:q.y-10,vx:-.25,vy:-.35,life:60,max:60,sway:Math.random()*6,col:'#fff6c0',nog:true}); }
    else if(q.kind==='queen'){ const img=BOSS_SPR.avispa, bow=Math.max(0,Math.sin(tick*.03))*3; ctx.globalAlpha=a; ctx.drawImage(ghostImg(img),Math.round(q.x)-1,Math.round(q.y+bob+bow)-1); ctx.globalAlpha=1; // se inclina, pide... y espera
      if((tick%70)<35){ const tx=Math.round(q.x-6), ty=Math.round(q.y+8); ctx.fillStyle='rgba(255,244,216,'+(a*.9).toFixed(2)+')'; ctx.fillRect(tx-10,ty-6,11,7); ctx.fillStyle='#6a5238'; txtS('zz',tx-8,ty-1,'#6a5238'); } } // «descanso»
    else if(q.kind==='seeds'){ const T=(tick%240), k=Math.min(1,T/80), grow=Math.max(0,Math.min(1,(T-100)/70)); ctx.globalAlpha=a; // dos manos de tierra bajan las semillas; brotan: un roble y un remolino
      for(const s of [-1,1]){ const x=Math.round(q.x+s*16), y=Math.round(q.y+bob*.3);
        const hy=Math.round(y-18+k*10); if(T<110){ ctx.fillStyle='#fff4d8'; ctx.fillRect(x-4,hy,8,5); ctx.fillRect(x-5,hy+2,1,3); ctx.fillRect(x+4,hy+2,1,3); ctx.fillStyle='#6a5238'; ctx.fillRect(x-4,hy+5,8,1); }
        ctx.fillStyle='#fff0a0'; ctx.fillRect(x-1,y-2,3,3); if((tick&15)<8){ ctx.fillStyle='#ffffff'; ctx.fillRect(x,y-2,1,1); }
        if(grow>0){ const h=Math.round(grow*10); if(s<0){ ctx.fillStyle='#fff4d8'; ctx.fillRect(x,y-2-h,1,h); ctx.fillRect(x-2,y-2-h,5,2); } // el roble
          else for(let i=0;i<h;i++){ ctx.fillStyle='#e8f0ff'; ctx.fillRect(x+Math.round(Math.sin(i*.9+tick*.1)*2),y-2-i,1,1); } } } // el viento
      ctx.globalAlpha=1; }
    else if(q.kind==='npc'){ const N=NPCS[q.ch]; if(!N) continue; const sw=q.sweep?Math.round(Math.sin(tick*.12+q.x)*6):0, x=Math.round(q.x+sw), y=Math.round(q.y+bob*.5);
      ctx.globalAlpha=a+.12; ctx.drawImage(ghostImg(N.img),x-1,y-1);
      if(q.sweep){ const bx=x+(q.sweep>0?14:-2), ph=Math.sin(tick*.24+q.x); ctx.fillStyle='#fff0c8'; for(let i=0;i<9;i++) ctx.fillRect(Math.round(bx+ph*i*.35*q.sweep),y+4+i,1,1); ctx.fillRect(Math.round(bx+ph*3*q.sweep)-2,y+13,5,2); // la escoba, a zarpazos
        if((tick%9)===0) parts.push({k:'blade',x:bx,y:y+14,vx:(Math.random()-.2)*q.sweep*1.4,vy:-.6-Math.random()*.6,life:24,max:24,col:['#c86424','#e8a040','#a04818'][tick%3],rot:Math.random()*6,vr:.3}); }
      ctx.globalAlpha=1; } } }
function drawYoungOak(x,y,bio){ const P=BIOMES[bio]||BIOMES.valley, c=P.canopy, sn=bio==='snow'; // el Roble joven: un arbolito de tronco fino
  const X=x*16, Y=y*16; ctx.fillStyle=PAL.k; ctx.fillRect(X+6,Y+6,4,10); ctx.fillStyle='#6a4424'; ctx.fillRect(X+7,Y+6,2,10); ctx.fillStyle='#8a5a30'; ctx.fillRect(X+7,Y+6,1,10);
  for(let yy=-10;yy<8;yy++) for(let xx=-8;xx<8;xx++){ const d=Math.hypot(xx+.5,(yy+1)*1.1); if(d>7.6) continue; ctx.fillStyle=d>6.8?PAL.k:sn?((xx+yy)&1?'#dff0ff':'#ffffff'):(yy<-3?c[2]:(xx+yy)%3?c[1]:c[0]); ctx.fillRect(X+8+xx,Y+2+yy,1,1); } }

/* ============================================================
   LA ORUGA DEL OLVIDO: una larva gris de segmentos que se come el suelo del recuerdo y deja agujeros.
   Solo le duele la cola. Al final huye por el desgarro, más adentro. La estación del anillo repara lo roído.
   ============================================================ */
let oruga=null;
function oruKey(){ const R=RING_ROOMS[sx+','+sy]; return R&&R.oruga?'ORU'+sx+','+sy:null; }
function initOruga(){ oruga=null; const key=sx+','+sy, R=RING_ROOMS[key]; if(!R||!R.oruga) return; const O=R.oruga, [tx,ty]=O.tear;
  if(opened.has(oruKey())){ grid[ty][tx]='ꞻ'; return; }
  const dir=ty===0?1:-1; oruga={x:tx*16+8,y:ty===0?ty*16+20:ty*16-4,a:dir*Math.PI/2,dir,hist:[],segs:O.segs,hp:O.hits,spd:O.spd,flash:0,hurtT:0,eatT:60,st:'in',t:0,eaten:[],flee:null,O};
  for(let i=0;i<O.segs*6;i++) oruga.hist.push([oruga.x,oruga.y-i*.6*dir]); }
{ const I0=initRing; initRing=function(){ I0(); initOruga(); NO_GLIDE.add(sx+','+sy); }; } // en los recuerdos el aire no sostiene al vilano
function oruSeg(i){ const O=oruga, k=Math.min(O.hist.length-1,i*6); return O.hist[k]; }
function oruFree(x,y){ const c=tileAt(x|0,y|0); return c!==undefined&&(!isSolid(c)||c==='W')&&x>18&&x<142&&y>18&&y<110; } // repta sobre lo que ha roído (y sobre el agua: no se hunde)
function updOruga(){ const O=oruga; if(!O) return; O.t++; if(O.flash>0) O.flash--; if(O.hurtT>0) O.hurtT--;
  if(O.st==='in'){ O.y+=.8*O.dir; if(O.t>40){ O.st='crawl'; if(!opened.has('ORUfirst')){ opened.add('ORUfirst'); showToast('LA ORUGA DEL OLVIDO','solo le duele la cola'); } } }
  else if(O.st==='crawl'){ const sp=O.spd*(O.hurtT>0?1.8:1), wig=Math.sin(O.t*.09)*.05;
    O.a+=wig+(Math.random()-.5)*.08; let nx=O.x+Math.cos(O.a)*sp, ny=O.y+Math.sin(O.a)*sp;
    if(!oruFree(nx,ny)){ O.a+=Math.PI*(.5+Math.random()*.6); nx=O.x; ny=O.y; } // da la vuelta
    O.x=nx; O.y=ny;
    if(--O.eatT<=0){ O.eatT=70+(Math.random()*40|0); const tx=(O.x)>>4, ty=(O.y)>>4, c=grid[ty]&&grid[ty][tx], [ptx,pty]=playerTile();
      if((c==='.'||c==='i'||c==='n'||c==='f'||c==='t')&&!(Math.abs(tx-ptx)<=1&&Math.abs(ty-pty)<=1)&&O.eaten.length<12){ grid[ty][tx]='Ꞝ'; O.eaten.push([tx,ty,c]); markDirty(); // ñam: un agujero gris
        for(let i=0;i<8;i++) parts.push({k:'dust',x:tx*16+8,y:ty*16+8,vx:(Math.random()-.5)*1.2,vy:-Math.random()*.8,life:22,max:22,r:1+(i&1),col:i&1?OLV.dust:OLV.dustD,nog:true});
        if(AC){ noise(.15,.04,false,undefined,900); beep('square',f(40),f(34),.1,.03); } } } }
  else if(O.st==='flee'){ const [tx,ty]=O.O.tear, gx=tx*16+8, gy=ty*16+8, d=Math.hypot(gx-O.x,gy-O.y); if(d<3){ O.st='gone'; oruGone(); return; } O.x+=(gx-O.x)/d*2.6; O.y+=(gy-O.y)/d*2.6; O.a=Math.atan2(gy-O.y,gx-O.x); }
  O.hist.unshift([O.x,O.y]); if(O.hist.length>O.segs*6+2) O.hist.pop();
  if(O.st==='gone') return;
  // tocarla hace daño; la Hoja solo hiere la cola
  const hb=hitPlayerBox(); for(let i=0;i<O.segs;i++){ const [x,y]=oruSeg(i), r=i===0?6:5; if(player.inv===0&&jumpT===0&&rectsHit([x-r,y-r,r*2,r*2],hb)){ hurt(1,x,y); break; } }
  if(O.flash===0&&meleeActive()&&O.st==='crawl'){ const mb=meleeBox(), [tx,ty]=oruSeg(O.segs-1);
    if(rectsHit(mb,[tx-6,ty-6,12,12])){ O.hp--; O.flash=12; O.hurtT=50; SFX.ehit(); hitStop=Math.max(hitStop,4); shake=Math.max(shake,4); flyText.push({x:tx,y:ty-6,txt:'1',t:24,col:'#fffbe8'});
      for(let i=0;i<8;i++) parts.push({k:'dust',x:tx,y:ty,vx:(Math.random()-.5)*1.6,vy:-Math.random()*1.2,life:20,max:20,r:1,col:OLV.dustD,nog:true});
      if(O.hp<=0){ O.st='flee'; SFX.edie(); if(AC) beep('square',f(52),f(64),.4,.04); } }
    else for(let i=0;i<O.segs-1;i++){ const [x,y]=oruSeg(i); if(rectsHit(mb,[x-5,y-5,10,10])){ SFX.block(); O.flash=4; sparkle(x,y-4,OLV.dust); break; } } } }
function oruGone(){ const O=oruga, [tx,ty]=O.O.tear; opened.add(oruKey()); grid[ty][tx]='ꞻ'; markDirty(); save(); shake=Math.max(shake,8); screenFlash(6,'#e8e0f0');
  if(AC){ noise(.6,.05,false,undefined,700); beep('triangle',f(55),f(43),.8,.04); }
  for(let i=0;i<20;i++){ const a=Math.random()*6.283; parts.push({k:'dust',x:tx*16+8,y:ty*16+10,vx:Math.cos(a)*1.4,vy:Math.sin(a)*1-.4,life:30,max:30,r:1+(i&1),col:i&1?OLV.dust:OLV.dustD,nog:true}); }
  oruga=null; showToast('SE HA IDO MÁS ADENTRO','por el desgarro'); }
/* la estación del anillo repara lo roído */
function repairEaten(){ if(!oruga&&!opened.has(oruKey()||'')) return; const L=oruga?oruga.eaten:[]; if(!L.length) return;
  const key=sx+','+sy, s=roomSeason(key); for(const [x,y] of L){ const b=[...MAPS[key][y]][x]; grid[y][x]=SEASON_BASE.has(b)?seasonTile(b,s):b; for(let i=0;i<5;i++) sparkle(x*16+3+Math.random()*10,y*16+3+Math.random()*10,SEASON_TINT[s]); }
  oruga.eaten=[]; markDirty(); if(AC) [72,76,79].forEach((m,i)=>beep('triangle',f(m),0,.4,.02,AC.currentTime+i*.05)); showToast('EL RECUERDO SE REPARA','la estación del anillo');
}
function drawOruga(){ const O=oruga; if(!O||O.st==='gone') return; const n=O.segs;
  for(let i=n-1;i>=0;i--){ const [x,y]=oruSeg(i), r=i===0?7:i===n-1?5:6, tail=i===n-1, X=Math.round(x), Y=Math.round(y);
    drawShadow(X,Y+r-1,r);
    for(let yy=-r;yy<=r;yy++) for(let xx=-r;xx<=r;xx++){ const d=Math.hypot(xx,yy); if(d>r+.4) continue; let c=d>r-.8?OLV.ink:yy<-r*.3?OLV.wingL:(xx+yy)&1?OLV.body:OLV.wing;
      if(O.flash>6) c=d>r-.8?OLV.ink:'#ffffff'; if(tail&&d<=r-.8) c=(tick>>3)&1?'#e8e0f0':'#c6bfd2'; ctx.fillStyle=c; ctx.fillRect(X+xx,Y+yy,1,1); }
    if(tail&&(tick&15)===0) sparkle(X,Y-4,'#f0e8ff'); }
  const [hx,hy]=oruSeg(0), ex=Math.cos(O.a), ey=Math.sin(O.a); ctx.fillStyle=OLV.ink; // la cara: dos ojos y las mandíbulas
  for(const s of [-1,1]){ const x=Math.round(hx+ex*3-ey*3*s), y=Math.round(hy+ey*3+ex*3*s); ctx.fillRect(x,y,2,2); ctx.fillStyle='#ffffff'; ctx.fillRect(x,y,1,1); ctx.fillStyle=OLV.ink; }
  ctx.fillRect(Math.round(hx+ex*7)-1,Math.round(hy+ey*7)-1,3,3); }
{ const U0=updRoomRules; updRoomRules=function(){ U0(); if(inRings()&&state==='play') updOruga(); }; }
{ const D0=drawScorches; drawScorches=function(){ D0(); if(!inRings()) return; drawRingGhosts(); drawOruga();
  const key=sx+','+sy; for(let y=0;y<SH;y++) for(let x=0;x<SW;x++){ const c=grid[y][x]; if(c==='Ꝡ') drawYoungOak(x,y,screenBiome(sx,sy)); } }; }
/* el desgarro: gris, latiendo; abierto, lleva más adentro */
function tearArt(open){ return cached('tear'+(open?1:0),g=>{ for(let y=0;y<16;y++) for(let x=0;x<16;x++){ const w=open?5.5:3.2, d=Math.abs(x-7.5+Math.sin(y*.9)*1.4); if(d>w) continue;
    PX(g,x,y,d>w-1?OLV.ink:open?(y<5?'#2a2230':'#141018'):((x+y)&1?OLV.wing:OLV.body)); } }); }
{ const O0=drawObject; drawObject=function(g,rows,x,y,ch,opts,f,fg){ if(ch==='Ꞻ'){ g.drawImage(tearArt(false),x*16,y*16); return; } if(ch==='Ꝡ') return; return O0(g,rows,x,y,ch,opts,f,fg); }; }
{ const G0=drawGround; drawGround=function(g,rows,x,y,ch,opts,f){ if(ch==='ꞻ'){ G0(g,rows,x,y,'.',opts,f); g.drawImage(tearArt(true),x*16,y*16); return; } if(ch==='Ꝡ'||ch==='Ꞻ'){ G0(g,rows,x,y,'.',opts,f); return; } return G0(g,rows,x,y,ch,opts,f); }; }

/* ============================================================
   ENTRAR Y SALIR: el hueco del tronco, en la plaza; el desgarro abierto lleva más adentro
   ============================================================ */
function ringsOpen(){ return olvidoLoose()&&c5.sueno; }
{ const I0=interact; interact=function(ft){ const [tx,ty,ch]=ft; if(sx===1&&sy===1&&ch==='Ñ'&&tx>=4&&tx<=5&&ty===3&&ringsOpen()&&player.dir===1){ SFX.blip(); enterRings(); return true; } return I0(ft); }; }
function enterRings(){ placeAt(22,4,72,76,1); if(!opened.has('RINGin')){ opened.add('RINGin'); pendingSay=RING_T.enter.slice(); } }
{ const X0=exitDungeon; exitDungeon=function(){ if(inRings()){ placeAt(1,1,72,76,0); return; } X0(); }; }
function ringTearStep(){ if(state!=='play'||!inRings()) return; const [tx,ty]=playerTile(); if(grid[ty]&&grid[ty][tx]==='ꞻ'){ const R=RING_ROOMS[sx+','+sy]; if(!R||!R.oruga) return;
    if(R.oruga.next){ const [nx,ny,px,py]=R.oruga.next; placeAt(nx,ny,px,py,1); }
    else { opened.add('RINGSDONE'); save(); placeAt(1,1,72,76,0); } } } // de momento: del primer anillo, al Nombre (la médula y los otros anillos, pendientes)
{ const U0=updRoomRules; updRoomRules=function(){ U0(); ringTearStep(); }; }

/* las pistas de cada sala (08: ROOM_HINTS) */
for(const k in RING_T.hints) ROOM_HINTS[k]=RING_T.hints[k];
/* en la plaza, tras el sueño: el hueco del tronco, abierto y con luz (encima del Roble, 15f) */
addEventListener('DOMContentLoaded',()=>{ const P0=drawPlaza; drawPlaza=function(){ P0(); if(!ringsOpen()) return; const x=ROBLE_X+43, y=ROBLE_Y+62, k=.8+.2*Math.sin(tick*.08);
  glowAt(x,y-2,14+Math.sin(tick*.1)*2,'rgba(255,214,140,'+(.45*k).toFixed(2)+')');
  ctx.fillStyle=PAL.k; ctx.fillRect(x-4,y-9,8,12); ctx.fillStyle='#2a1606'; ctx.fillRect(x-3,y-8,6,11); ctx.fillStyle='rgba(255,226,160,'+(.8*k).toFixed(2)+')'; ctx.fillRect(x-2,y-6,4,9);
  for(let i=0;i<4;i++){ ctx.fillStyle=SEASON_TINT[i]; ctx.fillRect(x-2+(i&1)*3,y-5+(i>>1)*4,1,1); }                       // dentro, los cuatro colores del año
  if((tick&15)===0) parts.push({k:'mote',x:x-2+Math.random()*4,y:y-4,vx:0,vy:-.3,life:40,max:40,sway:Math.random()*6,col:SEASON_TINT[(tick>>4)&3],nog:true}); }; });
/* el Molino (12b) quita los ventisqueros en partidas que ya subieron al Templo: en los Anillos manda la estación de la sala */
{ const M0=initMill; initMill=function(){ M0(); if(inRings()) applySeason(roomSeason(sx+','+sy)); }; }

function pondIceTile(e,v){ return cached('pice'+e+v,g=>{ R(g,0,0,16,16,'#b8dcf4'); // el estanque helado: una lámina de hielo con sus vetas; borde oscuro donde acaba
  for(const [x,y,w] of [[2+v,4,7],[6,9,6-v],[1,13,5],[9+v%2,2,4]]){ R(g,x,y,w,1,'#e8f6ff'); PX(g,x+w,y+1,'#8ab8e0'); }
  if(v&1){ PX(g,11,11,'#ffffff'); PX(g,12,11,'#ffffff'); } else { PX(g,4,7,'#ffffff'); }
  if(e&1){ R(g,0,0,16,1,'#5a88b8'); R(g,0,1,16,1,'#ffffff'); } if(e&4){ R(g,0,15,16,1,'#5a88b8'); R(g,0,14,16,1,'#98c4e8'); }
  if(e&8){ R(g,0,0,1,16,'#5a88b8'); R(g,1,0,1,16,'#e8f6ff'); } if(e&2){ R(g,15,0,1,16,'#5a88b8'); R(g,14,0,1,16,'#98c4e8'); } }); }

/* los bloques se empujan también sobre el barro duro (09: pushDestOk) */
function pushDestOk(c){ return inRings()&&(c==='ꞔ'||c==='ꞕ'); }

function mudTile(k,e,v){ return cached('mud'+k+e+v,g=>{ // el barrizal, de una pieza: blando y brillante, seco y agrietado, o helado
  const base=['#4a2e14','#9a7448','#b8d8f0'][k], dark=['#3a2410','#7a5a38','#8ab8e0'][k], lit=['#6a4a28','#b89468','#e8f6ff'][k]; R(g,0,0,16,16,base);
  if(k===0){ for(const [x,y] of [[3+v,4],[10,9-v],[6,12]]){ R(g,x,y,3,1,lit); PX(g,x+1,y-1,'#8a6a48'); } for(const [x,y] of [[12,3],[2,10]]) PX(g,x,y,dark); } // charcos que brillan
  if(k===1){ for(const [x,y,w] of [[1,5,6],[7,6,1],[8,2,4],[4,11,7],[10,12,1],[11,8,4]]) R(g,x,y,w,1,dark); } // grietas del barro seco
  if(k===2){ for(const [x,y,w] of [[2+v,3,6],[7,10,5]]) R(g,x,y,w,1,lit); PX(g,11,5,'#ffffff'); }
  if(e&1) R(g,0,0,16,2,shade(base,-.35)); if(e&4) R(g,0,14,16,2,shade(base,.18)); if(e&8) R(g,0,0,2,16,shade(base,-.25)); if(e&2) R(g,14,0,2,16,shade(base,-.25)); }); }
function leafPitTile(e,v){ return cached('lpit'+e+v,g=>{ g.drawImage(simaTile(e),0,0); // un hoyo lleno de hojarasca: sostiene... en otoño
  for(let i=0;i<40;i++){ const x=((i*7+v*5)%16), y=((i*11+v*3)%15)+((e&1)&&((i*11+v*3)%15)<5?5:0); if(y>15) continue; R(g,x,y,2,1,['#c86424','#e8a040','#a04818','#f0c060','#8a4a18'][(i+v)%5]); } }); }

/* el sol de los Anillos: los claros de la copa ('Ꞵ') solo alumbran en verano (12g traza el rayo) */
function ringLit(){ const R=RING_ROOMS[sx+','+sy]; return inRings()&&!!R&&!!R.sun; }
function ringSun(){ return ringLit()&&roomSeason(sx+','+sy)===1; }
{ const O0=drawObject; drawObject=function(g,rows,x,y,ch,opts,f,fg){ if(ch!=='Ꞵ') return O0(g,rows,x,y,ch,opts,f,fg); O0(g,rows,x,y,'T',opts,f,fg); // un claro en la copa
  const sum=opts.bio==='summer'; g.fillStyle=PAL.k; g.fillRect(x*16+5,y*16+3,6,6); g.fillStyle=sum?'#fff6c0':'#8aa0b0'; g.fillRect(x*16+6,y*16+4,4,4); if(sum){ g.fillStyle='#ffffff'; g.fillRect(x*16+7,y*16+5,2,2); } }; }
