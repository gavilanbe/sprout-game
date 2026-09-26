'use strict';
/* ============================================================
   LA CUEVA DEL TOPO, REHECHA: la primavera empieza bajo tierra (docs/TERCERA-PASADA.md §5.1).
   Dos pisos: arriba las GALERÍAS (y -1..1) y abajo las HONDONADAS (y 2..3). No se pasa de uno a otro andando:
   se baja por una grieta y se sube (o se baja) por una raíz.
   · FOGONES de tierra ('Ҩ' frío, 'ҩ' encendido): el estallido de una bellota los enciende y ya no se apagan.
     Su calor derrite el HIELO de la sala ('Ҳ') y despierta los NUDOS DE RAÍZ ('Ҝ' dormido, 'ҝ' despierto).
   · Una RAÍZ despierta crece casilla a casilla: puente sobre la sima ('Ҏ'), raíz por el suelo ('ҏ') y escalera
     entre pisos ('ѱ' el pozo de arriba, 'Ѱ' la raíz que sube desde abajo). Cruza salas y pisos: al despertar,
     cambia todas las salas por las que pasa. Cada raíz despierta es un atajo para siempre.
   · GRIETAS DEL SUELO ('Ӻ'): una bellota las abre ('Ӝ') y por ahí se cae al piso de abajo.
   · Las bellotas RUEDAN por las rampas de raíz ('ᐅᐊᐃᐁ') y por los raíles sobre la sima ('⇢⇠⇡⇣', que a Sprout
     no lo aguantan); en el cruce, una roca sobre la placa cambia la rama. La mecha decide dónde estalla.
   · La RAÍZ MADRE solo despierta con los dos fogones encendidos, y el primero abre el camino al segundo.
   · En las Cuestas la bellota rueda hasta un fogón al otro lado de la sima: su calor despierta la raíz que la cruza.
   ============================================================ */
['Ҩ','ҩ','Ҝ','ҝ','Ҳ'].forEach(c=>SOLID.add(c));
['Ҏ','ҏ','Ѱ','ѱ','Ӻ','Ӝ','ᐅ','ᐊ','ᐃ','ᐁ','⇢','⇠','⇡','⇣','ӂ','ӝ'].forEach(c=>GROUND.add(c)); // ӂ un charco helado; ӝ el mismo, derretido
const CV_RAMP={'ᐅ':[1,0],'ᐊ':[-1,0],'ᐃ':[0,-1],'ᐁ':[0,1]}, CV_RAIL={'⇢':[1,0],'⇠':[-1,0],'⇡':[0,-1],'⇣':[0,1]};
/* las raíces: dónde está el nudo, qué fogones la despiertan y por qué casillas crece (en orden, sala a sala) */
const CV_ROOTS={
  R1:{knot:['7,1',6,7], need:['7,1'], grow:{'7,1':[[6,6,'ҏ'],[5,6,'ҏ'],[4,6,'Ҏ'],[3,6,'Ҏ'],[2,6,'ҏ'],[1,6,'ѱ']], '7,2':[[5,1,'Ѱ']]}},
  R2:{knot:['7,2',1,7], need:['7,2'], grow:{'7,2':[[1,6,'ҏ'],[1,5,'ҏ'],[1,4,'ҏ'],[0,4,'ҏ']], '6,2':[[9,4,'ҏ'],[8,4,'ҏ'],[7,4,'ҏ'],[6,4,'ҏ'],[5,4,'ҏ'],[4,4,'ҏ'],[3,4,'ҏ'],[2,4,'ҏ'],[1,4,'ҏ'],[1,3,'ҏ'],[1,2,'ҏ'],[1,1,'Ѱ']], '6,1':[[1,1,'ѱ']]}},
  R3:{knot:['7,3',5,7], need:['7,1','7,2'], mother:true, grow:{'7,3':[[5,6,'ҏ'],[5,5,'ҏ'],[5,4,'Ҏ'],[5,3,'Ҏ']]}},
  R4:{knot:['6,3',9,4], need:['6,3'], grow:{'6,3':[[8,4,'ҏ'],[7,4,'Ҏ'],[6,4,'Ҏ'],[5,4,'Ҏ'],[4,4,'ҏ']]}},        // las Cuestas: el fogón del otro lado tiende el puente
};
/* las escaleras de raíz: el pozo de arriba y la raíz de abajo, y dónde se aparece al llegar a cada lado */
const CV_LINKS=[
  {up:['7,1',1,6], upOut:[1,5], down:['7,2',5,1], downOut:[5,2]},
  {up:['6,1',1,1], upOut:[2,1], down:['6,2',1,1], downOut:[2,1]},
];
const CV_DROPS={'6,1:4,6':['6,2',4,6]};                       // la grieta del Taller cae en la Bajada
const CV_FORKS={'6,3:5,3':{a:[1,0],b:[0,1],plate:[4,5]}};     // el cruce de las Cuestas: con la roca en la placa, al sur
const CV_BOSS='8,2', ROLL_SPD=1.25;
let cvGrow=[], cvMelt=[], via=null, viaLatch=null, cvAnnounce=0;
function inCueva(){ return regionOf(sx,sy)==='cueva'; }
function cvLit(room){ return opened.has('FG'+room); }
function rootAwake(id){ return CV_ROOTS[id].need.every(cvLit); }
function cvWarm(){ return sx+','+sy!==CV_BOSS&&cvLit(sx+','+sy); }

/* ---------- al entrar: lo encendido sigue encendido, lo derretido derretido y lo crecido crecido ---------- */
{ const I0=initRoomRules; initRoomRules=function(){ I0(); initCueva(); }; }
function initCueva(){ cvGrow=[]; cvMelt=[]; topoHeat=[]; if(!inCueva()) return; const key=sx+','+sy, warm=cvWarm()||(key===CV_BOSS&&bossDone); // el Refugio, con su Topo ya en paz: los fogones arden
  for(let y=0;y<SH;y++) for(let x=0;x<SW;x++){ const c=grid[y][x];
    if(c==='Ҩ'&&warm) grid[y][x]='ҩ';
    if(c==='Ҳ'&&warm) grid[y][x]='q';
    if(c==='ӂ'&&warm) grid[y][x]='ӝ';
    if(c==='Ӻ'&&opened.has('FC'+key+':'+x+','+y)) grid[y][x]='Ӝ'; }
  for(const id in CV_ROOTS){ const R=CV_ROOTS[id]; if(!opened.has('RT'+id)) continue;
    if(R.knot[0]===key) grid[R.knot[2]][R.knot[1]]='ҝ';
    for(const [x,y,ch] of R.grow[key]||[]) grid[y][x]=ch; }
  for(const k in CV_FORKS){ const [room,xy]=k.split(':'); if(room===key) plateCells.delete(CV_FORKS[k].plate.join(',')); } // la placa del cruce es solo del cruce (no suelta llave ni cierra puzle)
  viaLatch=playerTile().join(','); }

/* ---------- el estallido: enciende fogones y abre grietas del suelo ---------- */
addEventListener('DOMContentLoaded',()=>{ const B0=updBombs; updBombs=function(){ const boom=bombs.filter(b=>b.t<=1&&!b.dud).map(b=>[b.x+8,b.y+8]); B0(); if(inCueva()) for(const [x,y] of boom) cuevaBlast(x,y); }; }); // 13 carga después
function cuevaBlast(bx,by){ const R0=hasAmulet('topo')?46:38, key=sx+','+sy; let crack=false;
  for(let y=0;y<SH;y++) for(let x=0;x<SW;x++){ if(Math.hypot(x*16+8-bx,y*16+8-by)>=R0) continue; const c=grid[y][x];
    if(c==='Ҩ') lightFogon(x,y);
    else if(c==='Ӻ'){ grid[y][x]='Ӝ'; opened.add('FC'+key+':'+x+','+y); crack=true;
      for(let i=0;i<10;i++){ const a=Math.random()*6.283; parts.push({k:'dust',x:x*16+8+Math.cos(a)*6,y:y*16+8+Math.sin(a)*5,vx:-Math.cos(a)*.5,vy:-Math.sin(a)*.4,life:22,max:22,r:1+(i&1),col:i&1?'#5a4a40':'#8a7a68',nog:true}); } } }
  if(crack){ markDirty(); save(); SFX.secret(); if(!opened.has('FCfirst')){ opened.add('FCfirst'); showToast('¡EL SUELO SE ABRE!','abajo hay otro piso'); } } }

/* ---------- un fogón que prende: fuego, y el calor corre por la sala ---------- */
function lightFogon(x,y){ const key=sx+','+sy; grid[y][x]='ҩ'; markDirty(); shake=Math.max(shake,5); screenFlash(3,'#ffd8a0');
  if(AC){ const a=AC.currentTime; noise(.5,.06,false,a,1400); beep('triangle',f(55),f(67),.35,.04,a); [67,71,74,79].forEach((m,i)=>beep('triangle',f(m),0,.5,.025,a+.12+i*.06)); } // fuuum... y un acorde que calienta
  for(let i=0;i<16;i++){ const a=i/16*6.283; parts.push({k:'mote',x:x*16+8,y:y*16+8,vx:Math.cos(a)*1.3,vy:Math.sin(a)*1-.6,life:34,max:34,sway:Math.random()*6,col:i&1?'#ffb040':'#fff0a0',nog:true}); }
  if(key===CV_BOSS){ if(typeof topoFogonLit==='function') topoFogonLit(x,y); return; } // en el Refugio los fogones son del Topo (su pelea)
  opened.add('FG'+key); save(); heatRoom(x,y);
  if(!opened.has('FGfirst')){ opened.add('FGfirst'); showToast('¡EL FOGÓN PRENDE!','su calor despierta la cueva'); } }
function heatRoom(fx,fy){ const key=sx+','+sy;
  for(let y=0;y<SH;y++) for(let x=0;x<SW;x++){ const c=grid[y][x]; if(c==='Ҳ'||c==='ӂ') cvMelt.push({x,y,t:-Math.round(Math.hypot(x-fx,y-fy)*7),pool:c==='ӂ'}); } // el hielo se derrite: primero el que está más cerca
  for(const id in CV_ROOTS){ const R=CV_ROOTS[id]; if(opened.has('RT'+id)||!rootAwake(id)) continue;
    opened.add('RT'+id); save();
    if(R.knot[0]===key) cvGrow.push({id,t:-24,i:0});                       // su nudo está aquí: se la ve crecer
    else { const here=R.grow[key]; if(here) cvGrow.push({id,t:-24,i:0,noKnot:true}); if(R.mother) motherWakes(); } } }
/* la raíz madre despierta lejos: se nota en toda la cueva, y Raíz lo dice por sus raíces */
function motherWakes(){ cvAnnounce=90; shake=Math.max(shake,10); if(typeof rumble==='function') rumble(500,.7,.5);
  if(AC){ const a=AC.currentTime; beep('sine',f(31),f(28),1.6,.07,a); beep('triangle',f(43),f(40),1.4,.04,a+.1); [55,62,67,74].forEach((m,i)=>beep('triangle',f(m),0,.9,.022,a+.5+i*.15)); }
  pendingSay=CV_T.mother.slice(); }
function updCueva(){
  if(cvAnnounce>0){ cvAnnounce--; if((cvAnnounce&3)===0) parts.push({k:'dust',x:Math.random()*160,y:-2,vx:0,vy:.6+Math.random()*.6,life:60,max:60,r:1,col:'#8a7a68',nog:true}); } // cae tierra del techo
  for(const M of cvMelt){ M.t++; if(M.t<=0||M.fog) continue;
    if((M.t&3)===0) parts.push({k:'dust',x:M.x*16+3+Math.random()*10,y:M.y*16+10+Math.random()*4,vx:0,vy:.5,life:14,max:14,r:1,col:'#a8d8f0',nog:true}); // gotea
    if(M.t%10===0) parts.push({k:'smoke',x:M.x*16+8,y:M.y*16+4,vx:(Math.random()-.5)*.3,vy:-.5,life:22,max:22,r:2,col:'#e8f4ff',nog:true}); // vapor
    if(M.pool&&M.t>=20){ M.done=true; grid[M.y][M.x]='ӝ'; markDirty(); if(AC) noise(.1,.02,false,undefined,3000); continue; } // el charco se deshiela
    if(M.t>=36){ M.done=true; grid[M.y][M.x]='q'; markDirty(); if(AC) noise(.2,.03,false,undefined,2400); for(let i=0;i<6;i++) parts.push({k:'shard',x:M.x*16+8,y:M.y*16+8,vx:(Math.random()-.5)*1.6,vy:-Math.random()*1.2,life:14,max:14,col:i&1?'#ffffff':'#a8d8f0',nog:true}); } }
  cvMelt=cvMelt.filter(M=>!M.done);
  for(const G of cvGrow){ G.t++; const R=CV_ROOTS[G.id], key=sx+','+sy;
    if(G.t===0&&!G.noKnot){ const [,kx,ky]=R.knot; grid[ky][kx]='ҝ'; markDirty(); shake=Math.max(shake,4); // el nudo despierta
      if(AC){ const a=AC.currentTime; beep('triangle',f(48),f(55),.3,.05,a); noise(.25,.04,false,a,500); }
      for(let i=0;i<10;i++) parts.push({k:'blade',x:kx*16+8,y:ky*16+8,vx:(Math.random()-.5)*1.4,vy:-.6-Math.random()*.8,life:24,max:24,col:i&1?'#78d838':'#a8ec78',rot:Math.random()*6,vr:.3}); }
    if(G.t>0&&G.t%7===0){ const cells=R.grow[key]||[], c=cells[G.i++]; if(!c){ G.done=true; continue; } const [x,y,ch]=c; grid[y][x]=ch; markDirty(); // crece una casilla
      shake=Math.max(shake,2); if(AC){ noise(.12,.03,false,undefined,700+G.i*60); beep('triangle',f(50+G.i),f(53+G.i),.1,.02); }
      for(let i=0;i<6;i++) parts.push({k:'dust',x:x*16+8,y:y*16+8,vx:(Math.random()-.5)*1.2,vy:-Math.random()*.8,life:18,max:18,r:1+(i&1),col:i&1?'#6a4424':'#8a7a68',nog:true});
      if(ch==='ѱ'||ch==='Ѱ'){ shake=Math.max(shake,5); if(AC) beep('triangle',f(62),f(74),.4,.035); sparkle(x*16+8,y*16+4,'#a8ec78'); } } }
  cvGrow=cvGrow.filter(G=>!G.done);
  updRolls();
  if(state!=='play'||jumpT>0) return;
  const [tx,ty]=playerTile(), k=tx+','+ty, ch=grid[ty]&&grid[ty][tx];
  if(viaLatch!==k) viaLatch=null;
  if(CV_RAIL[ch]){ state='fall'; deathT=40; SFX.fall(); player.atk=0; return; } // el raíl de raíz aguanta una bellota, no a Sprout
  if(!viaLatch&&ch==='Ӝ'){ const to=CV_DROPS[sx+','+sy+':'+k]; if(to) startVia('drop',[tx,ty],to); return; }
  if(!viaLatch&&(ch==='ѱ'||ch==='Ѱ')){ const here=[sx+','+sy,tx,ty].join(), L=CV_LINKS.find(l=>l.up.join()===here||l.down.join()===here); if(!L) return;
    if(ch==='ѱ') startVia('down',[tx,ty],[L.down[0],...L.downOut]); else startVia('up',[tx,ty],[L.up[0],...L.upOut]); } }
{ const U0=updRoomRules; updRoomRules=function(){ U0(); if(inCueva()) updCueva(); }; }

/* ---------- las bellotas ruedan ---------- */
function cvRollDir(x,y,prev){ const ch=grid[y]&&grid[y][x], F=CV_FORKS[sx+','+sy+':'+x+','+y];
  if(F){ const [px,py]=F.plate; return grid[py][px]==='#'?F.b:F.a; }
  return CV_RAMP[ch]||CV_RAIL[ch]||null; }
function updRolls(){ for(const b of bombs){ if(b.dud) continue; const tx=(b.x+8)>>4, ty=(b.y+8)>>4;
    if(!b.roll){ if(b.stop||(b.x&15)||(b.y&15)) continue; const d=cvRollDir(tx,ty); if(!d) continue; b.roll=d; b.prog=0; b.spin=0; SFX.blip(); }
    if(b.prog===0){ const nx=tx+b.roll[0], ny=ty+b.roll[1], nc=grid[ny]&&grid[ny][nx];
      if(nc===undefined||(isSolid(nc)&&!CV_RAIL[nc])||blockSolidAt(nx,ny)){ b.roll=null; b.stop=true; if(AC) noise(.06,.03,false,undefined,900); continue; } } // tope: se queda ahí
    b.x+=b.roll[0]*ROLL_SPD; b.y+=b.roll[1]*ROLL_SPD; b.prog+=ROLL_SPD; b.spin+=ROLL_SPD;
    if((tick&7)===0) parts.push({k:'dust',x:b.x+8,y:b.y+14,vx:-b.roll[0]*.3,vy:-.1,life:10,max:10,r:1,col:'#6a5a48',nog:true});
    if(b.prog>=16){ const nx=Math.round((b.x)/16), ny=Math.round((b.y)/16); b.x=nx*16; b.y=ny*16; b.prog=0;
      const d=cvRollDir(nx,ny), c=grid[ny][nx];
      if(d) b.roll=d;
      else if(c==='°'||c==='Ӝ'){ b.dud=true; b.t=0; puff(b.x+8,b.y+10,'#5a4a40',6,.8); if(AC){ noise(.2,.03,false,undefined,500); beep('triangle',f(52),f(40),.3,.03); } } // plof: se la traga la sima
      else { b.roll=null; b.stop=true; } } }
  bombs=bombs.filter(b=>!b.dud); }
{ const D0=drawBomb; drawBomb=function(b){ if(!b.roll){ D0(b); return; } // rodando: da tumbos (se voltea a cada cuarto de vuelta)
  const q=((b.spin||0)/4|0)&3, fx=(q===1||q===3)?-1:1, fy=(q>=2)?-1:1; drawShadow(b.x+8,b.y+13,4);
  ctx.save(); ctx.translate(b.x+8,b.y+8); ctx.scale(fx,fy); ctx.drawImage(ACORN,-4,-4); ctx.restore();
  if(tick&2){ ctx.fillStyle='#ffd040'; ctx.fillRect(b.x+8+fx*2,b.y+4+(fy<0?8:0),1,1); } }; }

/* ---------- entre pisos: caer por la grieta, subir o bajar por la raíz ---------- */
const VIA_T={drop:{out:18,dark:14,in:20},up:{out:22,dark:14,in:18},down:{out:20,dark:14,in:20}};
function startVia(kind,from,to){ via={kind,ph:'out',t:0,from,to,x0:player.x,y0:player.y}; state='via'; playerHidden=true;
  player.atk=player.spin=player.charge=0; keys.fire=keys.alt=false;
  if(AC){ if(kind==='drop'){ SFX.fall(); noise(.3,.04,false,undefined,600); } else { noise(.2,.03,false,undefined,1100); beep('triangle',f(kind==='up'?55:62),f(kind==='up'?62:55),.25,.03); } } }
function updVia(){ const V=via; if(!V){ state='play'; playerHidden=false; return; } const T=VIA_T[V.kind]; V.t++; updParts();
  if(V.ph==='out'){ const [fx,fy]=V.from; if(V.kind==='up'){ player.x+=(fx*16-player.x)*.3; } else { player.x+=(fx*16-player.x)*.25; player.y+=(fy*16-4-player.y)*.25; }
    if((V.t&3)===0) parts.push({k:'dust',x:fx*16+4+Math.random()*8,y:fy*16+12,vx:(Math.random()-.5)*.6,vy:-.3,life:14,max:14,r:1,col:'#6a5a48',nog:true});
    if(V.t>=T.out){ V.ph='dark'; V.t=0; } return; }
  if(V.ph==='dark'){ if(V.t===Math.floor(T.dark/2)){ const [room,tx,ty]=V.to, [nx,ny]=room.split(',').map(Number); loadScreen(nx,ny); player.x=tx*16; player.y=ty*16-4; player.dir=V.kind==='up'?1:0; lastEntry={sx:nx,sy:ny,x:player.x,y:player.y}; }
    if(V.t>=T.dark){ V.ph='in'; V.t=0; } return; }
  if(V.t>=T.in){ via=null; playerHidden=false; state='play'; viaLatch=playerTile().join(','); player.squash=.3; shake=Math.max(shake,V.kind==='drop'?6:2);
    if(V.kind==='drop'){ SFX.land(); if(typeof rumble==='function') rumble(120,.5,.3); for(let i=0;i<10;i++){ const s=i<5?-1:1; parts.push({k:'dust',x:player.x+8+s*(3+i%5*2),y:player.y+15,vx:s*(.4+(i%5)*.2),vy:-.2,life:18,max:18,r:1+(i&1),col:'#6a5a48',nog:true}); } }
    else SFX.land(); } }
/* Sprout, dibujado a mano durante el viaje (recortado por el borde del agujero o por el techo; nada se gira ni se escala) */
function drawVia(){ const V=via; if(!V) return; const T=VIA_T[V.kind], k=V.t/(V.ph==='out'?T.out:V.ph==='in'?T.in:T.dark);
  const spr=(d,fr)=>P_SPRITES[d][fr], clip=(y0,y1,fn)=>{ ctx.save(); ctx.beginPath(); ctx.rect(0,y0,160,y1-y0); ctx.clip(); fn(); ctx.restore(); };
  const px=Math.round(player.x), py=Math.round(player.y);
  if(V.ph==='out'){
    if(V.kind==='drop'||V.kind==='down'){ const [fx,fy]=V.from, rim=fy*16+14, sink=Math.round(CA_EASE.in(k)*18); // se hunde en el agujero
      clip(0,rim,()=>ctx.drawImage(spr(V.kind==='drop'?0:1,V.kind==='down'?((V.t>>2)&1?1:3):0),px,py+sink)); }
    else { const [fx,fy]=V.from, top=fy*16-2, rise=Math.round(CA_EASE.in(k)*22); // trepa por la raíz y se pierde por el agujero del techo
      clip(top,128,()=>ctx.drawImage(spr(1,(V.t>>2)&1?1:3),px,py-rise)); } }
  else if(V.ph==='in'){
    if(V.kind==='drop'){ const h=Math.round((1-CA_EASE.in(k))*56); drawShadow(px+8,py+15,Math.max(2,Math.round(6*k))); ctx.drawImage(spr(0,0),px,py-h); } // cae desde el techo
    else if(V.kind==='up'){ const [,tx,ty]=V.to, L=CV_LINKS.find(l=>l.upOut[0]===tx&&l.upOut[1]===ty&&l.up[0]===sx+','+sy), hx=L?L.up[1]*16:px, hy=L?L.up[2]*16:py, e=CA_EASE.out(k); // asoma por el pozo y sale a su lado
      const x=Math.round(lerp(hx,px,Math.max(0,k*2-1))), y=Math.round(lerp(hy+10,py,e)); clip(0,hy+14,()=>ctx.drawImage(spr(0,(V.t>>2)&1?1:3),x,y)); }
    else { const [,tx,ty]=V.to, L=CV_LINKS.find(l=>l.downOut[0]===tx&&l.downOut[1]===ty&&l.down[0]===sx+','+sy), hx=L?L.down[1]*16:px, hy=L?L.down[2]*16:py; // baja por la raíz desde el techo
      const x=Math.round(lerp(hx,px,Math.max(0,k*2-1))), y=Math.round(lerp(hy-16,py,CA_EASE.out(Math.min(1,k*1.4)))); drawShadow(x+8,py+15,Math.round(2+4*k)); clip(hy-2,128,()=>ctx.drawImage(spr(1,(V.t>>2)&1?1:3),x,y)); } } }
addEventListener('DOMContentLoaded',()=>{ const D0=draw; draw=function(){ D0(); const V=via; if(!V||V.ph!=='dark') return; // el fundido entre pisos, solo en la zona de juego
  const T=VIA_T[V.kind], a=1-Math.abs(V.t/T.dark*2-1); ctx.fillStyle='rgba(4,4,10,'+Math.min(1,a*1.6).toFixed(2)+')'; ctx.fillRect(0,0,160,PLAY_H); }; });

/* ---------- lo que se pinta ---------- */
const CV_ROOT=['#2a1606','#4a2e14','#6a4424','#8a5a30','#b07a44'], CV_ROOTG=['#2a2826','#4a4644','#66605c','#86807a','#a8a29c'];
function fogonTile(lit){ return cached('fogon'+(lit?1:0),g=>{ // un corro de piedras gordas con leña: frío y escarchado, o con brasas
  const cx=7.5, cy=9.5, P=[]; for(let i=0;i<8;i++){ const a=i/8*6.283+.39; P.push([cx+Math.cos(a)*5.3,cy+Math.sin(a)*4]); }
  const hollow=(x,y)=>Math.hypot((x-cx)/3.6,(y-cy)/2.5)<=1, stone=(x,y)=>P.some(([px,py])=>Math.hypot(x-px,(y-py)*1.2)<=2.25);
  for(let y=0;y<16;y++) for(let x=0;x<16;x++) if(hollow(x,y)) PX(g,x,y,lit?((x+y)&1?'#a83010':'#e05818'):((x*3+y)&3?'#1e1814':'#2a221c'));
  for(let i=-2;i<=2;i++){ PX(g,7+i,10+(i>>1),lit?'#2a0e04':'#4a3220'); PX(g,8+i,9-(i>>1),lit?'#3a1606':'#5a3e26'); } // dos leños cruzados
  if(lit){ PX(g,6,10,'#fff0a0'); PX(g,9,9,'#ffd060'); PX(g,8,11,'#ffb040'); PX(g,5,9,'#ff8030'); }
  for(let y=0;y<16;y++) for(let x=0;x<16;x++){ if(!stone(x,y)) continue; const top=!stone(x,y-1), bot=!stone(x,y+1), lft=!stone(x-1,y);
    PX(g,x,y,top?(lit?'#d0a07c':'#dcecf8'):bot?'#3e342c':lft?'#8a7e72':'#6e6258'); }
  for(let y=0;y<16;y++) for(let x=0;x<16;x++) if(!stone(x,y)&&!hollow(x,y)&&(stone(x-1,y)||stone(x+1,y)||stone(x,y-1)||stone(x,y+1))) PX(g,x,y,PAL.k); // contorno
  if(!lit){ for(const [x,y] of [[3,6],[12,6],[7,4],[2,11],[13,11]]) PX(g,x,y,'#ffffff'); PX(g,8,15,'#a8d8f0'); PX(g,4,14,'#a8d8f0'); } // escarcha y dos carámbanos
  else { for(const [x,y] of [[4,7],[11,7]]) PX(g,x,y,'#ffd8a0'); } }); }   // la piedra, caliente por dentro
function rootKnotTile(on){ return cached('rknot'+(on?1:0),g=>{ const c=on?CV_ROOT:CV_ROOTG; // un nudo de raíz que asoma de la pared (con raicillas que se meten en la piedra): dormido y gris, o despierto
  for(const [x0,y0,dx,dy] of [[3,4,-1,-1],[12,4,1,-1],[2,11,-1,1],[13,12,1,1],[8,1,0,-1]]) for(let i=0;i<4;i++){ const x=x0+dx*i, y=y0+dy*i; if(x<0||y<0||x>15||y>15) continue; PX(g,x,y,PAL.k); if(i<3) PX(g,x+(dy?0:0),y+(dx?1:0)*0,c[1]); }
  for(let y=0;y<16;y++) for(let x=0;x<16;x++){ const dx=x-7.5, dy=y-8, d=Math.hypot(dx,dy*1.1); if(d>6) continue; const ring=Math.sin(d*1.7+Math.atan2(dy,dx)*2);
    PX(g,x,y,d>5.2?PAL.k:ring>.55?c[1]:ring>-.2?c[2]:ring>-.7?c[3]:c[0]); }
  if(on){ R(g,7,7,2,2,'#fff6c0'); PX(g,6,6,'#a8ec78'); PX(g,9,5,'#78d838'); PX(g,10,4,'#a8ec78'); PX(g,5,10,'#78d838'); PX(g,11,9,'#a8ec78'); }
  else { for(const [x,y] of [[5,4],[9,3],[12,7],[4,9],[10,11]]) PX(g,x,y,'#dff0ff'); } }); }
function pitLike(c){ return c==='°'||c==='Ҏ'||!!CV_RAIL[c]; }
function simaTile(e){ return cached('sima'+e,g=>{ R(g,0,0,16,16,'#050308'); // la sima, de una pieza: solo tiene borde donde acaba
  for(const [x,y] of [[3,9],[11,12],[7,14],[13,6]]) PX(g,x,y,'#120c14');
  if(e&1){ R(g,0,0,16,6,'#3a2e28'); R(g,0,0,16,1,'#6a5a4e'); R(g,0,1,16,1,'#4e4038'); R(g,0,5,16,1,'#1a1410'); for(let x=1;x<16;x+=5) R(g,x,2,1,3,'#2a221e'); } // la pared de roca que se ve al asomarse
  if(e&8){ R(g,0,0,2,16,PAL.k); R(g,0,0,1,16,'#2a221e'); }
  if(e&2){ R(g,14,0,2,16,PAL.k); R(g,15,0,1,16,'#2a221e'); }
  if(e&4){ R(g,0,14,16,2,'#2a221e'); R(g,0,15,16,1,'#4a3e36'); } }); }
function crackTile(open){ return cached('fcrack'+(open?1:0),g=>{ // una grieta en el suelo; abierta, un agujero de bordes rotos
  if(open){ for(let y=0;y<16;y++) for(let x=0;x<16;x++){ const d=Math.hypot(x-7.5,(y-8)*1.15)+Math.sin(x*2.1+y*1.3)*.9; if(d>7) continue; PX(g,x,y,d>6.1?PAL.k:y<6?'#3a2e28':'#050308'); }
    for(const [x,y] of [[3,5],[11,4],[6,3]]) PX(g,x,y,'#5a4a40'); }
  else { const P=[[1,3],[2,4],[3,5],[4,5],[5,6],[6,7],[7,8],[8,8],[9,9],[10,10],[11,11],[12,12],[13,12],[14,13],[8,7],[9,6],[10,5],[11,4],[12,4],[6,8],[5,9],[4,10],[4,11],[3,12],[10,11],[10,12],[9,13]];
    for(const [x,y] of P){ PX(g,x,y,'#0e0808'); PX(g,x+1,y,'#2a2020'); PX(g,x,y+1,'#6e6258'); }
    for(const [x,y] of [[5,4],[12,9],[3,9],[8,11]]){ PX(g,x,y,'#5a4e46'); PX(g,x,y+1,PAL.k); } } }); } // piedrecillas sueltas
function poolTile(melted){ return cached('pool'+(melted?1:0),g=>{ for(let y=0;y<16;y++) for(let x=0;x<16;x++){ const d=Math.hypot((x-7.5)/6.5,(y-8.5)/4.6)+Math.sin(x*1.3+y)*.06; if(d>1) continue; // un charco: helado, o ya agua
    PX(g,x,y,d>.86?(melted?'#1a2a3a':'#6a90b8'):melted?((x+y*2)%7===0?'#4a78a8':'#2e4a6a'):(y<7?'#dff0ff':'#a8d0f0')); }
  if(!melted){ PX(g,5,6,'#ffffff'); PX(g,6,6,'#ffffff'); PX(g,10,9,'#ffffff'); R(g,4,9,5,1,'#c8e4f8'); } else { R(g,5,7,3,1,'#6a98c8'); R(g,9,10,2,1,'#6a98c8'); } }); }
function drawForkSwitch(x,y,F,on){ const X=x*16, Y=y*16; // el cruce: un nudo de raíz con dos flechas; la que manda, encendida
  ctx.fillStyle=PAL.k; ctx.fillRect(X+5,Y+5,6,6); ctx.fillStyle=CV_ROOT[3]; ctx.fillRect(X+6,Y+6,4,4); ctx.fillStyle=CV_ROOT[4]; ctx.fillRect(X+6,Y+6,4,1);
  for(const [d,act] of [[F.a,!on],[F.b,on]]){ const c=act?((tick>>3)&1?'#fff0a0':'#ffd060'):'#5a4a3a', bx=X+8+d[0]*6, by=Y+8+d[1]*6;
    ctx.fillStyle=c; for(let s=-1;s<=1;s++){ const k=1-Math.abs(s); if(d[0]) ctx.fillRect(bx+d[0]*k,by+s,1,1); else ctx.fillRect(bx+s,by+d[1]*k,1,1); } } }
function rootOrient(rows,x,y){ const r=c=>c==='Ҏ'||c==='ҏ'||c==='ѱ'||c==='Ѱ'||c==='ҝ'||c==='Ҝ'; const L=rows[y]&&r(rows[y][x-1]), Rt=rows[y]&&r(rows[y][x+1]);
  return L||Rt?'h':'v'; }
function rootSegTile(o,thick){ return cached('rseg'+o+thick,g=>{ const c=CV_ROOT, w=[4,8,10][thick], a=8-(w>>1); // un tramo de raíz con su corteza: por el suelo, de puente, o la raíz madre
  for(let i=0;i<16;i++) for(let j=0;j<w;j++){ const x=o==='h'?i:a+j, y=o==='h'?a+j:i, streak=((i+j*5)%7===0)||((i*3+j)%11===0);
    PX(g,x,y,j===0||j===w-1?PAL.k:j===1?c[4]:j===w-2?c[1]:streak?c[2]:c[3]); }
  if(w>=8) for(let i=3;i<16;i+=7){ const x=o==='h'?i:a+3, y=o==='h'?a+3:i; R(g,x,y,2,2,c[1]); PX(g,x,y,c[0]); } // nudillos
  if(thick===2) for(let i=1;i<16;i+=5){ const x=o==='h'?i:a+w-3, y=o==='h'?a+w-3:i; PX(g,x,y,'#a8ec78'); } }); } // la madre, con brotes
function rootLadderTile(up){ return cached('rlad'+(up?1:0),g=>{ const c=CV_ROOT; // abajo: la raíz trepa por la pared hasta el agujero del techo · arriba: asoma del pozo
  if(up){ R(g,4,0,8,3,'#06040a'); R(g,4,0,8,1,PAL.k); for(let y=0;y<16;y++){ const x=6+Math.round(Math.sin(y*.5)); R(g,x-1,y,6,1,PAL.k); R(g,x,y,4,1,y%5===0?c[2]:c[3]); PX(g,x+1,y,c[4]); }
    for(let y=3;y<16;y+=4){ const s=(y>>2)&1?1:-1; R(g,s>0?11:2,y,3,1,c[2]); PX(g,s>0?13:2,y,PAL.k); } } // la raíz con sus nudillos (se trepa por ellos)
  else { R(g,2,2,12,12,PAL.k); R(g,3,3,10,10,'#06040a'); R(g,3,3,10,3,'#3a2e28'); for(let i=0;i<4;i++){ R(g,6+i,1+i,4,1,c[3]); PX(g,6+i,1+i,PAL.k); } R(g,7,4,3,10,c[3]); R(g,8,4,1,10,c[4]); R(g,6,4,1,10,PAL.k); R(g,10,4,1,10,PAL.k); } }); }
function crackTile(open){ return cached('fcrack'+(open?1:0),g=>{ // una grieta en el suelo; abierta, un agujero de bordes rotos
  if(open){ for(let y=0;y<16;y++) for(let x=0;x<16;x++){ const d=Math.hypot(x-7.5,(y-8)*1.15)+Math.sin(x*2.1+y*1.3)*.9; if(d>7) continue; PX(g,x,y,d>6.1?PAL.k:y<6?'#3a2e28':'#06040a'); }
    for(const [x,y] of [[3,5],[11,4],[6,3]]) PX(g,x,y,'#5a4a40'); }
  else { const P=[[2,4],[3,5],[4,5],[5,6],[6,8],[7,8],[8,9],[9,9],[10,10],[11,12],[12,12],[7,7],[8,6],[9,5],[10,4],[5,9],[4,10],[4,11],[9,10],[9,11]];
    for(const [x,y] of P){ PX(g,x,y,'#161010'); PX(g,x,y+1,'#6a5e54'); } } }); }
function iceTile(){ return cached('cvice',g=>{ R(g,1,1,14,15,PAL.k); R(g,2,2,12,13,'#8ab8e0'); R(g,2,2,12,4,'#c8e4f8'); R(g,2,2,12,1,'#ffffff'); // un bloque de hielo gris de invierno
  for(const [x,y,w] of [[4,7,5],[9,10,3],[3,12,4]]) R(g,x,y,w,1,'#a8d0f0'); PX(g,4,4,'#ffffff'); PX(g,11,5,'#ffffff'); R(g,2,14,12,1,'#5a88b8'); R(g,13,2,1,13,'#6a98c8'); }); }
function rampTile(d,rail){ const key='ramp'+d.join('')+(rail?1:0); return cached(key,g=>{ const c=CV_ROOT, h=d[1]===0; // la rampa de raíz: tablas con su canal · el raíl: una raíz fina sobre la sima
  if(rail){ const a=6; for(let i=0;i<16;i++) for(let j=0;j<4;j++){ const x=h?i:a+j, y=h?a+j:i; PX(g,x,y,(j===0||j===3)?PAL.k:j===1?c[4]:c[3]); } }
  else { for(let i=0;i<16;i++) for(let j=0;j<12;j++){ const x=h?i:2+j, y=h?2+j:i; PX(g,x,y,(j===0||j===11)?PAL.k:(j===1||j===10)?c[1]:(i%6===0)?c[2]:c[3]); }
    for(let i=0;i<16;i++){ const x=h?i:7, y=h?7:i; PX(g,x,y,c[1]); if(h) PX(g,x,y+1,c[0]); else PX(g,x+1,y,c[0]); } } // el canal por donde rueda
  const V=[[0,-2],[1,-1],[2,0],[1,1],[0,2]]; // una flecha en V que apunta hacia donde rueda
  for(const o of [3,10]) for(const [u,w] of V){ const along=d[0]+d[1]>0?o+u:o+2-u, x=h?along:8+w, y=h?8+w:along; PX(g,x,y,rail?'#fff0b0':'#d8b070'); } }); }
{ const G0=drawGround; drawGround=function(g,rows,x,y,ch,opts,f){
  if(opts.style==='cave'&&regionOf(opts.sx,opts.sy)==='cueva'){ const v=hash(x+opts.sx*SW,y+opts.sy*SH), base=()=>g.drawImage(dfloorTile(v%3,'cave'),x*16,y*16), pit=()=>g.drawImage(simaTile(edgesOf(rows,x,y,c=>!pitLike(c))&15),x*16,y*16);
    if(ch==='°'){ g.drawImage(simaTile(edgesOf(rows,x,y,c=>!pitLike(c))&15),x*16,y*16); return; }
    if(ch==='Ҏ'){ pit(); g.drawImage(rootSegTile(rootOrient(rows,x,y),opts.sx===7&&opts.sy===3?2:1),x*16,y*16); return; }
    if(ch==='ӂ'||ch==='ӝ'){ base(); g.drawImage(poolTile(ch==='ӝ'),x*16,y*16); return; }
    if(ch==='ҏ'){ base(); g.drawImage(rootSegTile(rootOrient(rows,x,y),0),x*16,y*16); return; }
    if(ch==='Ѱ'){ base(); g.drawImage(rootLadderTile(true),x*16,y*16); return; }
    if(ch==='ѱ'){ base(); g.drawImage(rootLadderTile(false),x*16,y*16); return; }
    if(ch==='Ӻ'||ch==='Ӝ'){ base(); g.drawImage(crackTile(ch==='Ӝ'),x*16,y*16); return; }
    if(CV_RAMP[ch]){ base(); g.drawImage(rampTile(CV_RAMP[ch],false),x*16,y*16); return; }
    if(CV_RAIL[ch]){ pit(); g.drawImage(rampTile(CV_RAIL[ch],true),x*16,y*16); return; }
    if(ch==='Ҩ'||ch==='ҩ'||ch==='Ҳ'){ base(); return; } }
  return G0(g,rows,x,y,ch,opts,f); }; }
{ const O0=drawObject; drawObject=function(g,rows,x,y,ch,opts,f,fg){
  if(ch==='Ҩ'||ch==='ҩ'){ g.drawImage(fogonTile(ch==='ҩ'),x*16,y*16); return; }
  if(ch==='Ҳ'){ g.drawImage(iceTile(),x*16,y*16); return; }
  if(ch==='Ҝ'||ch==='ҝ'){ O0(g,rows,x,y,'v',opts,f,fg); g.drawImage(rootKnotTile(ch==='ҝ'),x*16,y*16); return; }
  return O0(g,rows,x,y,ch,opts,f,fg); }; }
function drawFogonFire(x,y){ const t=tick, cx=x*16+8, cy=y*16+9; // tres lenguas de fuego que tiemblan, y chispas
  for(let i=0;i<3;i++){ const ph=t*.23+i*2.1, h=4+Math.round((Math.sin(ph)+1)*1.6)+(i===1?2:0), fx=cx-3+i*3;
    for(let k=0;k<h;k++){ const w=Math.max(1,Math.round((h-k)/2)), sway=Math.round(Math.sin(ph*1.7+k*.8)*.7); ctx.fillStyle=k===0?'#fff4c0':k<2?'#ffd060':k<h-1?'#f89030':'#d04818'; ctx.fillRect(fx-(w>>1)+sway,cy-k,w,1); } }
  if((t&7)===((x*3+y)&7)) parts.push({x:cx-2+Math.random()*4,y:cy-6,vx:(Math.random()-.5)*.3,vy:-.5-Math.random()*.4,life:18,col:(t&8)?'#ffd060':'#ff7020',nog:true}); }
function drawCueva(){ if(!inCueva()) return;
  for(let y=0;y<SH;y++) for(let x=0;x<SW;x++){ const c=grid[y][x];
    if(c==='ҩ'){ glowAt(x*16+8,y*16+8,18+Math.sin(tick*.27+x)*2,'rgba(255,150,60,.3)'); drawFogonFire(x,y); }
    else if(c==='ҝ'&&(tick&31)===((x*5+y*3)&31)) sparkle(x*16+8,y*16+6,'#a8ec78'); }
  for(const M of cvMelt){ if(M.t<=0||M.pool) continue; const k=Math.min(1,M.t/36), cut=Math.round(k*13); ctx.drawImage(iceTile(),0,cut,16,16-cut,M.x*16,M.y*16+cut,16,16-cut); } // el hielo se hunde al derretirse
  for(const k in CV_FORKS){ const [room,xy]=k.split(':'); if(room!==sx+','+sy) continue; const [x,y]=xy.split(',').map(Number), F=CV_FORKS[k], on=grid[F.plate[1]][F.plate[0]]==='#'; drawForkSwitch(x,y,F,on); }
  drawVia(); }
{ const D0=drawScorches; drawScorches=function(){ D0(); drawCueva(); }; }
/* la luz del fuego abre la oscuridad (14: drawDark) */
function cuevaHoles(hole){ if(!inCueva()) return; for(let y=0;y<SH;y++) for(let x=0;x<SW;x++){ const c=grid[y][x]; if(c==='ҩ') hole(x*16+8,y*16+8,44+((tick>>2)&1)*2); else if(c==='ҝ') hole(x*16+8,y*16+8,16); }
  if(via) hole(player.x+8,player.y+8,40); }
function cuevaGlow(){ if(!inCueva()) return; for(let y=0;y<SH;y++) for(let x=0;x<SW;x++) if(grid[y][x]==='ҩ') glowAt(x*16+8,y*16+8,40,'rgba(200,90,20,.14)'); }
/* las polillas del Olvido también acuden al fuego (12d) */
{ const L0=olvLights; olvLights=function(){ const L=L0(); if(inCueva()) for(let y=0;y<SH;y++) for(let x=0;x<SW;x++) if(grid[y][x]==='ҩ') L.push([x*16+8,y*16+2]); return L; }; }
/* la placa del cruce: la roca que sale de ella no se lleva la placa */
{ const P0=tryPushBlock; tryPushBlock=function(){ const had=blockSlide; P0(); const B=blockSlide; if(!had&&B&&inCueva()){ for(const k in CV_FORKS){ const [room]=k.split(':'), F=CV_FORKS[k]; if(room===sx+','+sy&&F.plate[0]===B.fx&&F.plate[1]===B.fy){ grid[B.fy][B.fx]='_'; markDirty(); } } } }; }

/* ---------- el mapa de la cueva: un piso cada vez ---------- */
const CV_FLOORS=[{name:'GALERÍAS',y0:-1,y1:1},{name:'HONDONADAS',y0:2,y1:3}];
function cvFloorOf(y){ return y>=2?1:0; }
addEventListener('DOMContentLoaded',()=>{ const R0=dungeonRooms; dungeonRooms=function(dk){ const L=R0(dk); if(dk!=='cueva') return L; const fl=cvFloorOf(sy); return L.filter(k=>cvFloorOf(+k.split(',')[1])===fl); }; }); // 15b carga después
addEventListener('DOMContentLoaded',()=>{ const M0=drawDungeonMap; drawDungeonMap=function(dk){ M0(dk); if(dk!=='cueva') return; const fl=cvFloorOf(sy);
  for(let i=0;i<2;i++){ const x=146, y=31+i*6, on=i===fl; ctx.fillStyle=PAL.k; ctx.fillRect(x-1,y-1,10,6); ctx.fillStyle=on?'#8fc39a':'#2e5a3a'; ctx.fillRect(x,y,8,4); } // los dos pisos, uno encima del otro
  txtS('PISO '+(fl+1)+' · '+CV_FLOORS[fl].name,142,35,'#9ec7aa','right'); }; });

/* ============================================================
   EL TOPO REAL BUSCA EL CALOR (8,2): cuatro fogones helados. Con uno encendido, cava hacia él y asoma a su lado:
   si le esperas con la bellota, sale aturdido. Herido, apaga fogones echándoles tierra; al final le cae polvo gris
   del techo y los fogones se hielan solos. Es la misma pelea, pero se gana leyendo al Topo.
   ============================================================ */
let topoHeat=[];                                                   // los fogones que arden en el Refugio (no se guardan: al volver, helados)
function topoFogonLit(x,y){ topoHeat=topoHeat.filter(h=>!(h.x===x&&h.y===y)); topoHeat.push({x,y,t:tick});
  const b=boss; if(b&&b.type==='topo'&&b.st==='burrow') for(let i=0;i<6;i++) parts.push({x:b.mx+16,y:b.my+24,vx:(Math.random()-.5)*1.2,vy:-1-Math.random(),life:14,col:'#8a7460',nog:true}); // el montículo se gira, olfatea
  if(!opened.has('TOPOheat')){ opened.add('TOPOheat'); showToast('¡HUELE EL CALOR!','asomará junto al fogón'); } }
function topoTarget(){ const lit=topoHeat.filter(h=>grid[h.y]&&grid[h.y][h.x]==='ҩ'); if(!lit.length) return null; const h=lit[lit.length-1]; // el calor más nuevo
  const fx=h.x*16+8, fy=h.y*16+8, dx=80-fx, dy=64-fy, d=Math.hypot(dx,dy)||1; return {x:Math.max(12,Math.min(116,fx+dx/d*22-16)),y:Math.max(12,Math.min(84,fy+dy/d*22-24)),h}; } // asoma a su lado, hacia el centro
function topoSmother(h){ grid[h.y][h.x]='Ҩ'; markDirty(); topoHeat=topoHeat.filter(q=>q!==h); shake=Math.max(shake,4); // ¡tierra encima!
  if(AC){ noise(.35,.05,false,undefined,500); beep('triangle',f(45),f(38),.3,.04); }
  const b=boss; for(let i=0;i<14;i++){ const k=i/14; parts.push({k:'dust',x:lerp(b.x+16,h.x*16+8,k)+(Math.random()-.5)*6,y:lerp(b.y+16,h.y*16+8,k)-Math.sin(k*3.14)*14,vx:(Math.random()-.5)*.6,vy:.3,life:18+i,max:18+i,r:1+(i&1),col:i&1?'#6a5440':'#8a7460',nog:true}); }
  for(let i=0;i<6;i++) parts.push({k:'smoke',x:h.x*16+8,y:h.y*16+6,vx:(Math.random()-.5)*.4,vy:-.5,life:24,max:24,r:2,col:'#6a6058',nog:true}); }
function topoFreeze(h){ grid[h.y][h.x]='Ҩ'; markDirty(); topoHeat=topoHeat.filter(q=>q!==h); if(AC){ noise(.25,.03,true,undefined,5000); beep('triangle',f(84),f(79),.3,.02); } // se hiela solo
  for(let i=0;i<8;i++) parts.push({k:'shard',x:h.x*16+8,y:h.y*16+8,vx:(Math.random()-.5)*1.4,vy:-Math.random()*1.2,life:16,max:16,col:i&1?'#ffffff':'#a8d8f0',nog:true}); }
{ const T0=updTopo; updTopo=function(){ const b=boss; if(!b||b.echo||sx+','+sy!==CV_BOSS){ T0(); return; }
  const mx0=b.mx, my0=b.my, was=b.st; T0(); if(boss!==b) return; const ph=bossPhase(b), tg=topoTarget();
  if(b.st==='burrow'&&was==='burrow'&&tg){ const d=Math.hypot(tg.x-mx0,tg.y-my0), sp=ph===1?1.1:ph===2?1.3:1.5; // cava hacia el calor, no hacia Sprout
    if(d>sp){ b.mx=mx0+(tg.x-mx0)/d*sp; b.my=my0+(tg.y-my0)/d*sp; } else { b.mx=tg.x; b.my=tg.y; } }
  if(b.st==='up'&&ph>=2&&!b.smother){ const near=topoHeat.find(h=>grid[h.y][h.x]==='ҩ'&&Math.hypot(h.x*16+8-(b.x+16),h.y*16+8-(b.y+20))<44); if(near&&b.t<40){ b.smother=true; topoSmother(near); } }
  if(b.st!=='up') b.smother=false;
  if(ph===3&&b.st!=='yield'){ for(const h of [...topoHeat]) if(tick-h.t>240&&grid[h.y][h.x]==='ҩ') topoFreeze(h); // al final, los fogones se hielan solos
    if((tick&3)===0) parts.push({k:'mote',x:Math.random()*160,y:-2,vx:0,vy:.35+Math.random()*.3,life:120,max:120,sway:Math.random()*6,col:(tick&4)?OLV.dust:OLV.dustD,nog:true}); } // y cae polvo gris del techo
  if(b.st==='yield'&&!b.warmth){ b.warmth=true; for(let y=0;y<SH;y++) for(let x=0;x<SW;x++) if(grid[y][x]==='Ҩ') cvMelt.push({x,y,t:-20-((x+y)&3)*8,fog:true}); } }; } // rendido: los cuatro fogones prenden solos
{ const U0=updCueva; updCueva=function(){ for(const M of cvMelt) if(M.fog&&M.t===0&&grid[M.y][M.x]==='Ҩ'){ grid[M.y][M.x]='ҩ'; markDirty(); M.done=true; if(AC) noise(.3,.04,false,undefined,1400); } U0(); }; }
