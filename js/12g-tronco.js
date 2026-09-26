'use strict';
/* ============================================================
   EL TRONCO HUECO, REHECHO: la luz del verano (docs/TERCERA-PASADA.md §5.2). La Reina selló el verano en
   cera; dentro está oscuro y dulce, y el sol entra por los nudos de la madera... cuando no están tapados.
   · NUDOS ('Ꝋ' taponado, 'Ꝍ' abierto) en las paredes: al quitar el tapón (la Hoja, de cerca; el gancho,
     desde lejos) entra un rayo de sol que avanza en línea recta hasta chocar con algo. Alumbra lo oscuro,
     y cruza la miel, el agua y los fosos.
   · Lo que toca el rayo: derrite la CERA ('Ѡ') y la MIEL CRISTALIZADA ('Ӂ'); el Soldado de Cera que lo
     cruza en picado se ablanda; las polillas acuden a la luz y se queman.
   · LENTES DE ROCÍO ('⟋' y '⟍'): tuercen el rayo 90°. Se empujan como las rocas-raíz; la Hoja las gira.
   · LA COLUMNA: el nudo grande de la Colmena Alta (11,-1) manda luz hacia abajo por la puerta del sur, a la
     Galería del Enjambre (11,0) y, cuando su sello de cera se derrite, a la Sala de la Miel (11,1).
   · La miel del Tronco ('~') es miel: no se pisa; el gancho la cruza.
   · LA REINA, DESLUMBRADA (10,2): su sala entra con el sol de cuatro nudos y su enjambre los tapa al empezar.
     Vuela demasiado rápido para el gancho... salvo si cruza un rayo: deslumbrada, el gancho la baja. Herida,
     manda abejas a tapar lo abierto (se pueden cazar por el camino); al final sella tres nudos con cera dura
     y deja uno: hay que hacer que se lance a través de él.
   ============================================================ */
SOLID.add('Ꝋ'); SOLID.add('Ꝍ'); SOLID.add('Ѡ'); SOLID.add('Ӂ'); SOLID.add('⟋'); SOLID.add('⟍');
const TRONCO_FEED={'11,0':{need:['KN11,-1:4,0'],x:4},'11,1':{need:['KN11,-1:4,0','WX11,0:4,7'],x:4}}; // la Columna: qué hace falta para que baje la luz
const BEAM_PASS=new Set(['~','W','°','@']); // la luz cruza la miel, el agua y los fosos
const MELT_T=46, BEAM_SPD=7;               // lo que tarda en derretirse; lo que avanza la luz por fotograma
let beams=[], beamDirty=true, beamReach={}, melting={}, plugFx=[], hookPlug=null, lensCut={k:null,t:-99};
function knotDir(x,y){ return x===0?[1,0]:x===SW-1?[-1,0]:y===0?[0,1]:[0,-1]; }
function inTronco(){ return regionOf(sx,sy)==='tronco'||(typeof ringLit==='function'&&ringLit()); } // también las salas de sol de los Anillos (12i)
{ const M0=markDirty; markDirty=function(){ M0(); beamDirty=true; }; }

/* ---------- al entrar: lo abierto sigue abierto, y la luz ya está ahí ---------- */
{ const I0=initRoomRules; initRoomRules=function(){ I0(); initTronco(); }; }
function initTronco(){ beams=[]; beamReach={}; melting={}; plugFx=[]; hookPlug=null; plugBees=[]; const key=sx+','+sy, queen=key===QUEEN_ROOM;
  for(let y=0;y<SH;y++) for(let x=0;x<SW;x++){ const c=grid[y][x];
    if(c==='Ꝋ'&&(queen||opened.has('KN'+key+':'+x+','+y))) grid[y][x]='Ꝍ'; // la sala de la Reina siempre entra llena de sol: antes de que llegue ella, y cuando ya se ha rendido
    if((c==='Ѡ'||c==='Ӂ')&&opened.has('WX'+key+':'+x+','+y)) grid[y][x]=regionFloor(); }
  beamDirty=true; if(inTronco()){ traceBeams(); for(const b of beams) beamReach[b.key]=b.len; } }

/* ---------- el rayo: desde cada nudo abierto (y desde arriba, si la Columna alumbra) hasta chocar ---------- */
function traceBeams(){ const prev=beams, key=sx+','+sy, starts=[]; beams=[];
  for(let y=0;y<SH;y++) for(let x=0;x<SW;x++) if(grid[y][x]==='Ꝍ'||(grid[y][x]==='Ꞵ'&&typeof ringSun==='function'&&ringSun())){ const [dx,dy]=knotDir(x,y); starts.push([x,y,dx,dy,false]); } // Ꞵ: un claro en la copa, en los Anillos: solo alumbra en verano
  const F=TRONCO_FEED[key]; if(F&&F.need.every(n=>opened.has(n))) starts.push([F.x,-1,0,1,true]);
  for(const [x0,y0,dx0,dy0,col] of starts){ let x=x0, y=y0, dx=dx0, dy=dy0, hit=null; const cells=[[x,y]];
    for(let i=0;i<48;i++){ x+=dx; y+=dy; cells.push([x,y]);
      if(x<0||y<0||x>=SW||y>=SH) break;
      const ch=grid[y][x];
      if(ch==='⟋'){ [dx,dy]=[-dy,-dx]; continue; } // «/»: lo que baja sale al oeste; lo que va al este, sube
      if(ch==='⟍'){ [dx,dy]=[dy,dx]; continue; }   // «\»: lo que baja sale al este; lo que va al oeste, sube
      if(blockSolidAt(x,y)||(isSolid(ch)&&!BEAM_PASS.has(ch))){ hit=[x,y,ch]; break; } }
    const bk=col?'col':x0+','+y0, o=prev.find(p=>p.key===bk);
    if(o){ let n=0; while(n<o.cells.length&&n<cells.length&&o.cells[n][0]===cells[n][0]&&o.cells[n][1]===cells[n][1]) n++; beamReach[bk]=Math.min(beamReach[bk]||0,(n-1)*16); } // si el camino cambia, la luz sigue desde donde coincidía
    else if(beamReach[bk]===undefined) beamReach[bk]=0;                                                  // un nudo recién abierto: la luz entra desde el nudo
    beams.push({key:bk,cells,hit,col,len:(cells.length-1)*16}); }
  for(const k in beamReach) if(!beams.some(b=>b.key===k)) delete beamReach[k];
  beamDirty=false; }
function litCells(b){ const r=beamReach[b.key]||0, out=[]; for(let i=1;i<b.cells.length;i++){ if(i*16-8>r) break; out.push(b.cells[i]); } return out; }
function inBeam(px,py){ const X=px>>4, Y=py>>4; for(const b of beams) for(const [x,y] of litCells(b)) if(x===X&&y===Y) return true; return false; }
function updBeams(){ if(!inTronco()){ if(beams.length) beams=[]; return; } if(beamDirty) traceBeams();
  for(const b of beams){ const r0=beamReach[b.key]||0; beamReach[b.key]=Math.min(b.len,r0+BEAM_SPD);
    if(r0<b.len&&beamReach[b.key]>=b.len&&b.hit&&AC) beep('triangle',f(91),f(96),.08,.012); } // la luz llega: un tintineo
  // lo que el rayo toca se derrite (y la luz sigue)
  const hot=new Set();
  for(const b of beams){ if(!b.hit||beamReach[b.key]<b.len) continue; const [x,y,ch]=b.hit;
    if(ch==='Ѡ'||ch==='Ӂ'){ const k=x+','+y; hot.add(k); if(melting[k]===undefined){ melting[k]=0; if(AC){ noise(.6,.02,true,undefined,3400); beep('triangle',f(79),f(72),.4,.015); } } } }
  for(const k in melting){ if(!hot.has(k)){ delete melting[k]; continue; } const t=++melting[k], [x,y]=k.split(',').map(Number), honey=grid[y][x]==='Ӂ';
    if((t&3)===0) parts.push({k:'dust',x:x*16+3+Math.random()*10,y:y*16+12+Math.random()*3,vx:(Math.random()-.5)*.3,vy:.3,life:18,max:18,r:1,col:honey?'#f8c848':'#f4e2a0',nog:true}); // gotea
    if((t%9)===0) parts.push({k:'smoke',x:x*16+8,y:y*16+6,vx:(Math.random()-.5)*.3,vy:-.4,life:20,max:20,r:2,col:'#fff6d8',nog:true});
    if(t>=MELT_T){ delete melting[k]; meltWax(x,y); } }
  // el Soldado de Cera, si cruza el rayo en picado, se ablanda
  const m=midboss; if(m&&m.type==='drone'&&m.st==='dive'&&!m.dead){ const mb=[m.x+3,m.y+4,18,18];
    hit: for(const b of beams) for(const [x,y] of litCells(b)){ if(!rectsHit(mb,[x*16+4,y*16+4,8,8])) continue;
      m.st='stunned'; m.t=100; m.beamSoft=true; m.flash=6; shake=Math.max(shake,4); hitStop=Math.max(hitStop,3); screenFlash(4,'#fff6c0');
      if(AC){ noise(.5,.04,true,undefined,3000); beep('triangle',f(64),f(52),.4,.04); }
      for(let q=0;q<12;q++) parts.push({k:'dust',x:m.x+4+Math.random()*16,y:m.y+8+Math.random()*12,vx:(Math.random()-.5)*.9,vy:.4+Math.random()*.7,life:26,max:26,r:1+(q&1),col:q&1?'#f8d878':'#e8b848',nog:true});
      if(!opened.has('SOFT')){ opened.add('SOFT'); showToast('¡LA CERA SE ABLANDA!','ahora la Hoja entra'); } break hit; } }
  // las polillas que cruzan el rayo, se queman
  if(typeof moths!=='undefined'&&beams.length) for(const q of moths){ if(q.st==='husk'||q.dead) continue; if(inBeam(q.x,q.y)){ q.dead=true; olvPoof(q.x,q.y); sparkle(q.x,q.y-2,'#fff6c0'); } }
  for(const p of plugFx){ p.t++; p.x+=p.vx; p.y+=p.vy; p.vy+=.18; if(p.t===14) puff(p.x,p.y+2,'#c89030',3,.6); } plugFx=plugFx.filter(p=>p.t<16); }
function meltWax(x,y){ const key=sx+','+sy, honey=grid[y][x]==='Ӂ'; grid[y][x]=regionFloor(); opened.add('WX'+key+':'+x+','+y); markDirty(); save(); shake=Math.max(shake,3);
  if(AC){ beep('triangle',f(76),f(64),.3,.03); noise(.3,.03,false,undefined,900); }
  for(let i=0;i<14;i++){ const a=Math.random()*6.283; parts.push({k:'shard',x:x*16+8,y:y*16+8,vx:Math.cos(a)*1.3,vy:Math.sin(a)*1.1-.5,life:18,max:18,col:i&1?'#fff6c0':honey?'#f0a828':'#e8b040',nog:true}); }
  for(let i=0;i<5;i++) parts.push({k:'dust',x:x*16+3+i*2.5,y:y*16+14,vx:(i-2)*.25,vy:.1,life:30,max:30,r:2,col:honey?'#d89a28':'#c89030',nog:true}); } // un charquito que se seca
/* el Soldado de Cera: al estrellarse ya no se aturde (la cera dura aguanta) y vuelve arriba volando; solo el sol lo ablanda */
{ const U0=updMidboss; updMidboss=function(){ const m=midboss, dr=!!m&&m.type==='drone'&&!m.dead;
  if(dr&&m.st==='rise'){ const hy=16+Math.sin(tick*.09)*7; m.y+=(hy-m.y)*.12; m.t=999; if(Math.abs(m.y-hy)<1.5){ m.st='hover'; m.t=m.hp<=5?50:70; } } // sube sin saltos
  const was=dr?m.st:null; U0();
  if(!dr||midboss!==m||m.dead) return;
  if(was==='dive'&&m.st==='stunned'&&!m.beamSoft){ m.st='rise'; m.t=999; // ¡clonc! y ni se inmuta
    for(let i=0;i<5;i++) parts.push({k:'shard',x:m.x+12,y:m.y+16,vx:(Math.random()-.5)*2,vy:-Math.random()*1.4,life:12,max:12,col:i&1?'#fff6c0':'#c89030',nog:true}); sparkle(m.x+12,m.y+2,'#fff0c0'); }
  if(was==='stunned'&&m.st==='hover'){ m.beamSoft=false; if(m.y>30){ m.st='rise'; m.t=999; } }
  if(m.st==='stunned'&&m.beamSoft&&(tick%5)===0) parts.push({k:'dust',x:m.x+5+Math.random()*14,y:m.y+19,vx:0,vy:.5,life:16,max:16,r:1,col:(tick&8)?'#e8b848':'#f8d878',nog:true}); }; } // gotea cera

/* ---------- quitar el tapón: la Hoja (de cerca) o el gancho (de lejos) ---------- */
function unplug(x,y){ const key=sx+','+sy, col=key==='11,-1'&&x===4&&y===0;
  if(knotSealed(x,y)){ sealBounce(x,y); return; }
  grid[y][x]='Ꝍ'; if(key!==QUEEN_ROOM){ opened.add('KN'+key+':'+x+','+y); save(); } markDirty();
  const [dx,dy]=knotDir(x,y); shake=Math.max(shake,col?8:4); hitStop=Math.max(hitStop,4); screenFlash(col?8:3,'#fff6c0');
  if(AC){ const a=AC.currentTime; beep('square',f(84),f(96),.08,.03,a); [79,84,88,91].forEach((m,i)=>beep('triangle',f(m),0,.5,.025,a+.06+i*.05)); noise(.4,.02,true,a,6000);
    if(col) [67,74,79,86].forEach((m,i)=>beep('triangle',f(m),0,1.2,.03,a+.3+i*.12)); }
  plugFx.push({x:x*16+8+dx*4,y:y*16+8+dy*4,vx:dx*1.4+(Math.random()-.5),vy:dy*1.4-1.6,t:0}); // el tapón de cera sale volando
  for(let i=0;i<(col?18:10);i++) parts.push({k:'mote',x:x*16+8+dx*8,y:y*16+8+dy*8,vx:dx*(.6+Math.random())+(Math.random()-.5)*.4,vy:dy*(.6+Math.random())+(Math.random()-.5)*.4,life:40,max:40,sway:Math.random()*6,col:i&1?'#fff6c0':'#ffffff',nog:true});
  if(col) showToast('¡LA COLUMNA DE LUZ!','baja por el corazón del Tronco');
  else if(!opened.has('KNfirst')) showToast('¡UN RAYO DE SOL!','derrite la cera que toca');
  opened.add('KNfirst'); }
function nearPlayer(sb){ return Math.abs(sb[0]+sb[2]/2-(player.x+8))<22&&Math.abs(sb[1]+sb[3]/2-(player.y+10))<22; } // la Hoja y el giro sí; un tornadito o una hoja voladora a lo lejos, no
{ const C0=cutAt; cutAt=function(sb){ C0(sb); if(!inTronco()||!nearPlayer(sb)) return; // la Hoja: tapones y lentes
  for(let y=0;y<SH;y++) for(let x=0;x<SW;x++){ const ch=grid[y][x]; if(!rectsHit(sb,[x*16+2,y*16+2,12,12])) continue;
    if(ch==='Ꝋ') unplug(x,y);
    else if((ch==='⟋'||ch==='⟍')&&!(lensCut.k===x+','+y&&tick-lensCut.t<14)){ lensCut={k:x+','+y,t:tick}; turnLens(x,y); } } }; }
function turnLens(x,y){ const ch=grid[y][x]; grid[y][x]=ch==='⟋'?'⟍':'⟋'; markDirty(); SFX.block(); shake=Math.max(shake,2);
  if(AC) beep('square',f(88),f(91),.05,.02); for(let i=0;i<4;i++) sparkle(x*16+3+Math.random()*10,y*16+2+Math.random()*10,'#e8f8ff');
  parts.push({x:x*16+8,y:y*16+8,vx:0,vy:0,life:8,col:'#e8f8ff',ring:true,r:9,nog:true}); }
/* los nudos de las paredes quedan fuera del tajo (la caja de la Hoja apenas roza la pared): se prueba la casilla de delante */
{ const A0=attack; attack=function(){ const ft=facingTile(); if(inTronco()&&ft&&ft[2]==='Ꝋ'&&hasBlade&&state==='play'&&!inBed){ player.atk=14; SFX.sword(); player.squash=.28; unplug(ft[0],ft[1]); return; } A0(); }; }
{ const H0=throwHook; throwHook=function(){ if(inTronco()){ const D=DIRV[player.dir], [ptx,pty]=playerTile(); if(boss&&hookBoss(D)) return;
    for(let i=1;i<=5;i++){ const tx=ptx+D[0]*i, ty=pty+D[1]*i, ch=grid[ty]&&grid[ty][tx]; if(ch===undefined) break;
      if(ch==='Ꝋ'){ hook={fx:player.x,fy:player.y,tx:player.x+D[0]*16*i,ty:player.y+D[1]*16*i,t:0,fail:true,dir:player.dir}; state='hook'; SFX.sword(); noise(.08,.04,true); hookPlug={x:tx,y:ty,t:0}; return; } // la raíz agarra el tapón y lo arranca
      if(BEAM_PASS.has(ch)||!isSolid(ch)) continue; break; } }
  H0(); }; }
function updHookPlug(){ if(!hookPlug) return; if(++hookPlug.t===7){ unplug(hookPlug.x,hookPlug.y); hookPlug=null; } }

/* ---------- las lentes se empujan como las rocas-raíz (09: blockSlide), Sprout detrás ---------- */
{ const P0=tryPushBlock; tryPushBlock=function(){ const ft=facingTile(); if(ft&&(ft[2]==='⟋'||ft[2]==='⟍')){ lensPush(ft); return; } P0(); }; }
function lensPush(ft){ if(pushLatch||blockSlide) return; const [tx,ty,ch]=ft;
  const off=player.dir<2?Math.abs(player.x+8-(tx*16+8)):Math.abs(player.y+12-(ty*16+10)); if(off>9){ pushHold=0; return; }
  if(player.dir<2) player.x+=(tx*16-player.x)*.4; else player.y+=(ty*16-4-player.y)*.4;
  if(++pushHold<9) return; pushHold=0;
  const D=DIRV[player.dir], x=tx+D[0], y=ty+D[1];
  if(x<1||y<1||x>SW-2||y>SH-2||grid[y][x]!=='q'||enemies.some(e=>Math.abs(e.x-x*16)<10&&Math.abs(e.y-y*16)<10)) return; // ni a una puerta ni fuera de la sala
  pushLatch=true; grid[ty][tx]='q'; markDirty();
  let ex=player.x, ey=player.y; if(player.dir===0){ ex=tx*16; ey=ty*16-4; } else if(player.dir===1){ ex=tx*16; ey=ty*16+4; } else if(player.dir===2){ ey=ty*16-4; ex=tx*16+4; } else { ey=ty*16-4; ex=tx*16-4; }
  blockSlide={fx:tx,fy:ty,tx:x,ty:y,t:0,land:0,p0:[player.x,player.y],p1:[ex,ey],dir:player.dir,ch,img:()=>lensTile(ch)};
  SFX.push(); player.squash=-.18; stepDustAt(player.x+8,player.y+15,1); }

/* ---------- lo que se pinta ---------- */
function lensTile(ch){ return cached('lens'+ch,g=>{ const sl=ch==='⟋'; // un marco de madera con una lámina de rocío en diagonal: espejo
  R(g,1,1,14,14,PAL.k); R(g,2,2,12,12,'#8a6436'); R(g,2,2,12,1,'#c09458'); R(g,2,3,1,10,'#a07a44'); R(g,2,13,12,1,'#5a3c1c'); R(g,13,3,1,10,'#6a4a26');
  R(g,4,4,8,8,'#1c1826'); R(g,4,4,8,1,'#0e0c14');
  for(let i=-1;i<10;i++){ const x=sl?3+i:12-i, y=12-i;
    for(const [o,c] of [[-1,'#e8f8ff'],[0,'#9ad4f0'],[1,'#4a88b8']]){ const X=x+(sl?o:-o), Y=y; if(X>=4&&X<=11&&Y>=4&&Y<=11) PX(g,X,Y,c); } }
  PX(g,sl?6:9,8,'#ffffff'); PX(g,sl?7:8,7,'#ffffff'); PX(g,sl?10:5,5,'#ffffff');
  for(const [x,y] of [[3,3],[12,3],[3,12],[12,12]]) PX(g,x,y,'#f0c860'); }); } // remaches de latón
function knotArt(open){ return cached('knot'+(open?1:0),g=>{ // un nudo de la madera: anillos oscuros; tapado con cera, o abierto a la luz
  for(let y=0;y<16;y++) for(let x=0;x<16;x++){ const d=Math.hypot(x-7.5,y-7.5); if(d>6.5) continue; PX(g,x,y,d>5.5?'#2a1a0c':d>4.2?'#6a4424':d>3?'#3a2410':open?'#fff6c0':'#e8b848'); }
  if(!open){ R(g,6,5,3,1,'#fff0b0'); PX(g,5,6,'#fff0b0'); R(g,5,9,5,1,'#b88020'); } else { R(g,6,6,3,3,'#ffffff'); } }); }
function waxTile(){ return cached('wax',g=>{ R(g,0,0,16,16,'#c89030'); for(let y=0;y<16;y+=4) for(let x=((y>>2)&1)*4;x<16;x+=8){ R(g,x,y,8,4,'#e8b848'); R(g,x,y,8,1,'#f8d878'); R(g,x+7,y,1,4,'#a87018'); } // panal de cera
  R(g,0,15,16,1,'#8a5a10'); for(const [x,y] of [[3,2],[11,6],[6,10]]) PX(g,x,y,'#fff4c0'); }); }
function honeyBlockTile(){ return cached('honeyblk',g=>{ R(g,1,1,14,14,PAL.k); R(g,2,2,12,12,'#d89a28'); R(g,2,2,12,2,'#f8c848'); R(g,2,12,12,2,'#a86a10');
  for(const [x,y] of [[4,5],[9,4],[7,9],[11,10]]){ PX(g,x,y,'#fff0a0'); PX(g,x+1,y+1,'#b87818'); } }); }
function honeyTile(e,f){ return cached('honey'+e+f,g=>{ R(g,0,0,16,16,'#c88a20'); const ph=f*2;
  for(let y=0;y<16;y+=4) for(let x=0;x<16;x++){ if(((x+y*3+ph)%11)<2) PX(g,x,y+1,'#e8a838'); }
  for(const [x,y] of [[3+f,4],[11-f,9],[7,13-f]]){ PX(g,x,y,'#fff0a0'); PX(g,x+1,y,'#f8c848'); }
  if(e&1) R(g,0,0,16,2,'#7a4a10'); if(e&4) R(g,0,14,16,2,'#e8b848'); if(e&8) R(g,0,0,2,16,'#8a5a14'); if(e&2) R(g,14,0,2,16,'#8a5a14'); }); }
{ const O0=drawObject; drawObject=function(g,rows,x,y,ch,opts,f,fg){
  if(ch==='Ꝋ'||ch==='Ꝍ'){ O0(g,rows,x,y,'v',opts,f,fg); g.drawImage(knotArt(ch==='Ꝍ'),x*16,y*16); return; }
  if(ch==='Ѡ'){ g.drawImage(waxTile(),x*16,y*16); return; }
  if(ch==='Ӂ'){ g.drawImage(honeyBlockTile(),x*16,y*16); return; }
  if(ch==='⟋'||ch==='⟍'){ g.drawImage(lensTile(ch),x*16,y*16); return; }
  return O0(g,rows,x,y,ch,opts,f,fg); }; }
{ const G0=drawGround; drawGround=function(g,rows,x,y,ch,opts,f){ if(ch==='~'&&(opts.style==='wood'||opts.style==='hive')){ const e=edgesOf(rows,x,y,c=>c!=='~'); g.drawImage(honeyTile(e&15,(f||0)&3),x*16,y*16); return; } return G0(g,rows,x,y,ch,opts,f); }; }
function drawBeams(){ const t=tick;
  for(const b of beams){ const C=b.cells, r=beamReach[b.key]||0; let tip=null;
    for(let i=0;i<C.length-1;i++){ const d0=i*16; if(d0>=r) break; const k=Math.min(1,(r-d0)/16);
      const [x0,y0]=C[i], [x1,y1]=C[i+1], ax=x0*16+8, ay=y0*16+8, bx=Math.round(ax+(x1-x0)*16*k), by=Math.round(ay+(y1-y0)*16*k), hz=y0===y1;
      const x=Math.min(ax,bx), y=Math.min(ay,by), w=Math.abs(bx-ax), h=Math.abs(by-ay);
      ctx.fillStyle='rgba(255,226,130,.16)'; if(hz) ctx.fillRect(x,y-4,w+1,9); else ctx.fillRect(x-4,y,9,h+1);
      ctx.fillStyle='rgba(255,240,180,.3)'; if(hz) ctx.fillRect(x,y-2,w+1,5); else ctx.fillRect(x-2,y,5,h+1);
      ctx.fillStyle='rgba(255,255,236,.55)'; if(hz) ctx.fillRect(x,y,w+1,1); else ctx.fillRect(x,y,1,h+1);
      const L=Math.max(w,h), n=Math.max(1,(L/10)|0); for(let q=0;q<n;q++){ const u=(t*.6+q*37+i*13)%Math.max(1,L), mx=hz?x+u:x+((q*5)%5)-2, my=hz?y+((q*3)%5)-2:y+u; ctx.fillStyle=((q+t)>>3)&1?'#ffffff':'#fff0b0'; ctx.fillRect(Math.round(mx),Math.round(my),1,1); } // motas en el rayo
      if(k<1) tip=[bx,by]; }
    const [sx0,sy0]=C[0]; if(!b.col) glowAt(sx0*16+8,sy0*16+8,12+Math.sin(t*.15)*2,'rgba(255,240,170,.45)');
    if(tip) glowAt(tip[0],tip[1],9,'rgba(255,252,220,.75)'); // la punta de la luz, abriéndose paso
    else if(b.hit){ const [hx,hy]=b.hit, ex=hx*16+8, ey=hy*16+8; glowAt(ex,ey,10+Math.sin(t*.3)*2,'rgba(255,230,150,.5)'); if((t&3)===0) sparkle(ex-6+Math.random()*12,ey-6+Math.random()*12,'#fff6c0'); } } }
function drawTroncoFx(){ if(!inTronco()) return; drawBeams();
  for(const k in melting){ const [x,y]=k.split(',').map(Number), q=melting[k]/MELT_T; ctx.fillStyle='rgba(255,240,190,'+(.4*q).toFixed(2)+')'; ctx.fillRect(x*16,y*16+Math.round(q*3),16,16-Math.round(q*3)); } // se derrite: brilla y se hunde
  for(let y=0;y<SH;y++) for(let x=0;x<SW;x++) if(grid[y][x]==='Ꝋ'&&((tick+x*37+y*53)%70)===0) sparkle(x*16+6+Math.random()*4,y*16+6,'#fff6c0'); // por la rendija del tapón brilla el sol
  for(const p of plugFx){ const X=Math.round(p.x), Y=Math.round(p.y), s2=(p.t>>2)&1; ctx.fillStyle=PAL.k; ctx.fillRect(X-3,Y-2,7,5); ctx.fillRect(X-2,Y-3,5,7); // el tapón: un corcho de cera que da vueltas
    ctx.fillStyle='#c88a20'; ctx.fillRect(X-2,Y-2,5,5); ctx.fillStyle='#f8d878'; ctx.fillRect(X-2,Y-2,s2?3:5,s2?5:2); ctx.fillStyle='#fff6c0'; ctx.fillRect(X-1,Y-1,1,1); }
  if(state==='play'&&inBeam(player.x+8,player.y+10)&&(tick&7)===0) sparkle(player.x+4+Math.random()*8,player.y-2,'#fff6c0'); } // Sprout, al sol: la hoja contenta
/* el Soldado de Cera, blando: se le escurre la cera (a tiras de 2 px, sin girar ni escalar nada) */
addEventListener('DOMContentLoaded',()=>{ const D0=drawMidboss; drawMidboss=function(){ const m=midboss; if(m&&m.type==='drone'&&m.st==='stunned'&&m.beamSoft){ drawSoftDrone(m); return; } D0(); }; }); // 14 carga después
let SOFT_DRONE=null; // el Soldado, caliente: su silueta en color cera, para encenderlo por encima
function drawSoftDrone(m){ const img=m.flash>4?BOSS_WHITE.drone:BOSS_SPR.drone, x=Math.round(m.x), y=Math.round(m.y), age=100-m.t, k=Math.min(1,age/12)*Math.min(1,m.t/18);
  drawShadow(x+12,y+23,11); glowAt(x+12,y+13,18,'rgba(255,214,120,'+(.32*k).toFixed(2)+')');
  ctx.drawImage(img,x,y);
  for(let c=2;c<img.width-2;c+=2){ const d=Math.round(k*(1+2.5*(.5+.5*Math.sin(c*.45+age*.05)))); if(d<1) continue; ctx.drawImage(img,c,13,2,11,x+c,y+13+d,2,11); } // la barriga se le escurre a goterones
  if(!SOFT_DRONE) SOFT_DRONE=tintTo(BOSS_SPR.drone,'#ffd878'); ctx.globalAlpha=(.22+.14*Math.sin(age*.3))*k; ctx.drawImage(SOFT_DRONE,x,y); ctx.globalAlpha=1;
  if((tick&7)<4) sparkle(x+6+Math.random()*12,y+2,'#fff0a0'); }
/* la luz del rayo abre la oscuridad del Tronco (14: drawDark), y la tiñe de sol */
function beamHoles(hole){ if(!inTronco()) return;
  for(let y=0;y<SH;y++) for(let x=0;x<SW;x++) if(grid[y][x]==='Ꝋ') hole(x*16+8,y*16+8,11); // un hilo de sol por la rendija: el nudo se ve
  for(const b of beams){ const [x0,y0]=b.cells[0]; hole(x0*16+8,Math.max(0,y0*16+8),20); for(const [x,y] of litCells(b)) if(x>=0&&y>=0&&x<SW&&y<SH) hole(x*16+8,y*16+8,18); } }
function beamGlow(){ if(!inTronco()) return; for(const b of beams) for(const [x,y] of litCells(b)) if(x>=0&&y>=0&&x<SW&&y<SH) glowAt(x*16+8,y*16+8,14,'rgba(255,196,90,.09)'); }
/* las polillas del Olvido acuden a la luz del rayo... y se queman (12d) */
{ const L0=olvLights; olvLights=function(){ const L=L0(); if(inTronco()) for(const b of beams){ const lc=litCells(b); if(lc.length){ const [x,y]=lc[lc.length-1]; L.push([x*16+8,y*16+8]); } } return L; }; }

/* ---------- cada fotograma ---------- */
{ const U0=updRoomRules; updRoomRules=function(){ U0(); updBeams(); }; }
{ const T0=tickFx; tickFx=function(){ T0(); updHookPlug(); }; } // también mientras el gancho vuela
{ const D0=drawScorches; drawScorches=function(){ D0(); drawTroncoFx(); }; }

/* ============================================================
   LA REINA, DESLUMBRADA (10,2)
   ============================================================ */
const QUEEN_ROOM='10,2', QUEEN_LAST=[0,3]; // el nudo que queda al final: su rayo cruza la sala a lo ancho
let plugBees=[];
function queenLit(b){ return !!b&&b.type==='avispa'&&!b.echo&&sx+','+sy===QUEEN_ROOM; }
function knotSealed(x,y){ const b=boss; return queenLit(b)&&!!b.sealed&&!(x===QUEEN_LAST[0]&&y===QUEEN_LAST[1]); }
function sealBounce(x,y){ SFX.clang(); shake=Math.max(shake,2); for(let i=0;i<5;i++) sparkle(x*16+3+Math.random()*10,y*16+3+Math.random()*10,'#fff0c0');
  if(!opened.has('SEALfirst')){ opened.add('SEALfirst'); showToast('¡CERA DURA!','ese nudo ya no cede'); } }
/* el enjambre sale de la Reina hacia cada nudo abierto con una bola de cera; si llega, lo tapa */
function sendPlugBees(b){ let n=0;
  for(let y=0;y<SH;y++) for(let x=0;x<SW;x++) if(grid[y][x]==='Ꝍ'&&!plugBees.some(p=>p.kx===x&&p.ky===y)){ const a=n*1.9;
    plugBees.push({x:b.x+16+Math.cos(a)*6,y:b.y+6+Math.sin(a)*4,kx:x,ky:y,t:-n*6,f:0}); n++; }
  if(n&&AC){ const a=AC.currentTime; for(let i=0;i<3;i++) beep('square',f(62+i*3),f(66+i*3),.12,.018,a+i*.05); } } // la Reina ordena: un zumbido que sube
function updPlugBees(){ if(!plugBees.length) return;
  for(const p of plugBees){ p.t++; if(p.t<0) continue; p.f++;
    const tx=p.kx*16+8, ty=p.ky*16+8+(p.ky===SH-1?-4:0), dx=tx-p.x, dy=ty-p.y, d=Math.hypot(dx,dy)||1, sp=1.25;
    if(d<3){ p.done=true; if(grid[p.ky][p.kx]==='Ꝍ'){ grid[p.ky][p.kx]='Ꝋ'; markDirty(); shake=Math.max(shake,2); // ¡plof!: tapado
        if(AC){ noise(.12,.03,false,undefined,700); beep('triangle',f(55),f(48),.12,.03); }
        for(let i=0;i<8;i++){ const a=Math.random()*6.283; parts.push({k:'dust',x:tx,y:ty,vx:Math.cos(a)*1.1,vy:Math.sin(a)*1.1,life:16,max:16,r:1+(i&1),col:i&1?'#f8d878':'#c89030',nog:true}); } }
      continue; }
    p.x+=dx/d*sp+Math.sin(p.f*.35)*.45; p.y+=dy/d*sp+Math.cos(p.f*.28)*.45;
    if(p.f>14&&meleeActive()&&rectsHit(meleeBox(),[p.x-5,p.y-5,10,10])){ p.dead=true; SFX.edie(); puff(p.x,p.y,'#f8d030',6,1); // cazada: la cera cae al suelo
      for(let i=0;i<4;i++) parts.push({k:'dust',x:p.x,y:p.y+3,vx:(Math.random()-.5)*.8,vy:.6+Math.random()*.5,life:18,max:18,r:1,col:'#e8b848',nog:true}); } }
  plugBees=plugBees.filter(p=>!p.done&&!p.dead); }
function drawPlugBees(){ for(const p of plugBees){ if(p.t<0) continue; const x=Math.round(p.x), y=Math.round(p.y), d=(p.kx*16+8)<p.x?-1:1, X=i=>d>0?x+i:x-i, up=(p.f>>1)&1;
    ctx.fillStyle='#eaf6ff'; ctx.fillRect(X(-1),y-3-up,2,2); ctx.fillRect(X(1),y-3-up,2,2);               // alas
    ctx.fillStyle=TK_INK; ctx.fillRect(x-3,y-1,7,4);                                                   // contorno
    ctx.fillStyle='#f8d030'; ctx.fillRect(x-2,y,5,2); ctx.fillStyle=TK_INK; ctx.fillRect(X(0),y,1,2); ctx.fillRect(X(-2),y,1,2); // rayas
    ctx.fillStyle=TK_INK; ctx.fillRect(x-1,y+3,3,3); ctx.fillStyle='#e8b848'; ctx.fillRect(x,y+3,1,2); ctx.fillStyle='#fff0b0'; ctx.fillRect(x,y+3,1,1); } } // la bola de cera, colgando
function sealArt(){ return cached('seal',g=>{ // cera dura sobre el nudo: un goterón grueso con su brillo
  for(let y=0;y<16;y++) for(let x=0;x<16;x++){ const d=Math.hypot(x-7.5,(y-7)*1.1); if(d>7.2) continue; PX(g,x,y,d>6.2?PAL.k:d>5?'#a86a10':(x+y<12?'#f8d878':'#e0a830')); }
  R(g,5,14,2,2,'#a86a10'); PX(g,5,15,PAL.k); R(g,10,13,2,2,'#a86a10'); PX(g,4,4,'#fff6c0'); PX(g,5,3,'#fff6c0'); R(g,9,9,2,1,'#c88a20'); }); }
function queenSeal(b){ b.sealed=true; shake=Math.max(shake,6); screenFlash(4,'#fff0c0'); if(AC){ noise(.35,.05,false,undefined,500); beep('triangle',f(50),f(43),.5,.04); }
  for(let y=0;y<SH;y++) for(let x=0;x<SW;x++){ const c=grid[y][x]; if((c==='Ꝋ'||c==='Ꝍ')&&knotSealed(x,y)){ grid[y][x]='Ꝋ';
    for(let i=0;i<10;i++){ const a=Math.random()*6.283; parts.push({k:'dust',x:x*16+8,y:y*16+8,vx:Math.cos(a)*1.3,vy:Math.sin(a)*1.3-.3,life:20,max:20,r:1+(i&1),col:i&1?'#f8d878':'#a86a10',nog:true}); } } }
  markDirty(); showToast('¡CERA DURA!','solo queda un nudo'); }
function dazzle(b){ b.st='dazzled'; b.t=bossPhase(b)===3?80:100; b.flash=6; shake=Math.max(shake,4); hitStop=Math.max(hitStop,4); screenFlash(3,'#fff6c0');
  if(AC){ const a=AC.currentTime; [84,88,91,96].forEach((m,i)=>beep('triangle',f(m),0,.35,.03,a+i*.04)); noise(.3,.03,true,a,7000); }
  for(let i=0;i<14;i++){ const a=i/14*6.283; parts.push({k:'mote',x:b.x+16+Math.cos(a)*8,y:b.y+14+Math.sin(a)*6,vx:Math.cos(a)*1.2,vy:Math.sin(a)*.9,life:30,max:30,sway:Math.random()*6,col:i&1?'#fff6c0':'#ffffff',nog:true}); }
  if(!opened.has('DAZfirst')){ opened.add('DAZfirst'); showToast('¡DESLUMBRADA!','ahora, el gancho'); } }
function queenInBeam(b){ const bb=bossBox(b); for(const bm of beams) for(const [x,y] of litCells(bm)) if(rectsHit(bb,[x*16+4,y*16+4,8,8])) return true; return false; }
{ const A0=updAvispa; updAvispa=function(){ const b=boss; if(!queenLit(b)) return A0();
  updPlugBees();
  if(!b.lit0){ b.lit0=true; b.dazImm=tick+100; sendPlugBees(b); } // al empezar: manda a oscurecer la sala (y mientras da la orden, el sol no la ciega)
  if(b.st==='dazzled'||b.st==='rise'){ if(b.flash>0) b.flash--; if(b.clangT>0) b.clangT--; const cx=b.x+16, cy=b.y+16;
    if(b.st==='dazzled'){ b.t--; if((tick&3)===0) sparkle(b.x+6+Math.random()*20,b.y+Math.random()*8,'#fff6c0'); if(b.t<=0){ b.st='rise'; b.t=999; b.dazImm=tick+110; } } // aturdida en el aire; al pasársele, un rato entorna los ojos y el sol no la ciega
    else { const hy=10+Math.sin(tick*.11)*6; b.y+=(hy-b.y)*.1; b.t=999; if(Math.abs(b.y-hy)<1.5){ b.st='hover'; b.t=bossPhase(b)===3?40:70; } }
    if(player.inv===0&&jumpT===0&&b.st==='rise'&&rectsHit(bossBox(b),hitPlayerBox())) hurt(2,cx,cy);
    if(b.flash===0&&meleeActive()&&rectsHit(meleeBox(),bossBox(b))) bossClang(b,cx,cy);
    if(bossRope&&--bossRope.t<=0) bossRope=null; return; }
  const was=b.st, y0=b.y; A0(); if(boss!==b) return;
  if(was==='pinned'&&b.st==='hover'){ b.y=y0; b.st='rise'; b.t=999; b.dazImm=tick+110; sendPlugBees(b); } // se suelta, herida: manda a tapar lo abierto
  if(bossPhase(b)===3&&!b.sealed&&b.st!=='yield'&&b.st!=='pinned'&&b.st!=='yanked'){ queenSeal(b); sendPlugBees(b); } // la última fase: cera dura en todos menos uno
  if((b.st==='hover'||b.st==='aim'||b.st==='dive')&&tick>(b.dazImm||0)&&queenInBeam(b)) dazzle(b);
  if(b.st==='yield'&&!b.sunburst){ b.sunburst=tick; plugBees=[]; } // se rinde: el verano entra por todos los nudos
  if(b.sunburst){ const k=tick-b.sunburst; if(k>0&&k%14===0){ let n=0; for(let y=0;y<SH&&!n;y++) for(let x=0;x<SW&&!n;x++) if(grid[y][x]==='Ꝋ'){ b.sealed=false; unplug(x,y); n++; }
      if(!n) b.sunburst=0; } } }; }
/* el gancho, con la Reina: solo si está deslumbrada; si no, la raíz la roza y resbala */
{ const H0=hookBoss; hookBoss=function(D){ const b=boss; if(!queenLit(b)) return H0(D);
  if(b.st==='dazzled'){ b.st='hover'; const r=H0(D); if(!r) b.st='dazzled'; return r; }
  if(['hover','aim','tired','dive'].includes(b.st)){ const st=b.st; b.st='hover'; const x0=player.x+8, y0=player.y+10, bb=bossBox(b); let hit=false;
    for(let s=8;s<=120&&!hit;s+=4){ const px=x0+D[0]*s, py=y0+D[1]*s; if(px>bb[0]-5&&px<bb[0]+bb[2]+5&&py>bb[1]-5&&py<bb[1]+bb[3]+5) hit=true; } b.st=st;
    if(hit){ sparkle(b.x+16,b.y+12,'#c8d8ff'); if(AC) beep('square',f(76),f(72),.05,.02); if(!opened.has('QFAST')){ opened.add('QFAST'); showToast('¡DEMASIADO RÁPIDA!','el gancho resbala'); } } }
  return false; }; }
/* cómo se ve: deslumbrada, con halo y ojos en espiral; y los nudos sellados */
addEventListener('DOMContentLoaded',()=>{ const D0=drawBoss; drawBoss=function(){ const b=boss; if(!queenLit(b)||(b.st!=='dazzled'&&b.st!=='rise')){ D0(); return; }
  const st=b.st; b.st='hover'; if(st==='dazzled') glowAt(b.x+16,b.y+14,26+Math.sin(tick*.4)*3,'rgba(255,244,190,.45)'); D0(); b.st=st;
  if(st==='dazzled'){ if(!SOFT_QUEEN) SOFT_QUEEN=tintTo(BOSS_SPR.avispa,'#fff6c0'); ctx.globalAlpha=.3+.2*Math.sin(tick*.5); ctx.drawImage(SOFT_QUEEN,Math.round(b.x),Math.round(b.y)); ctx.globalAlpha=1; drawDizzy(b.x+16,b.y+2); } }; });
let SOFT_QUEEN=null;
{ const D0=drawScorches; drawScorches=function(){ D0(); if(!queenLit(boss)) return; const b=boss; drawPlugBees();
  if(b.sealed) for(let y=0;y<SH;y++) for(let x=0;x<SW;x++) if(grid[y][x]==='Ꝋ'&&knotSealed(x,y)) ctx.drawImage(sealArt(),x*16,y*16); }; }
