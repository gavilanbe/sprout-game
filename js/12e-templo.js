'use strict';
/* ============================================================
   EL TEMPLO DE LA CIMA, REHECHO (docs/TERCERA-PASADA.md §5.4): los antiguos pedían que volviera la nieve,
   y sus puzles son ritos.
   · HIELO DE VERDAD (salas de TRUE_ICE): al pisar hielo te deslizas hasta chocar con algo o hasta pisar
     suelo. Los bloques también: empujado, un bloque resbala hasta el tope (o hasta pararse en suelo o en una
     placa). La Pista (14,0) y la Galería de bloques (14,1) están comprobadas con un resolvedor.
   · EL FREÑO DEL VILANO: si saltas mientras resbalas, al caer te quedas quieto donde caes.
   · BLOQUES DE HIELO ('Ж'): sólidos; la llamarada del farol los derrite y dejan hielo. Cambian los topes de
     una pista. Vuelven a estar al salir y entrar (como los bloques de un puzle sin resolver).
   · CAMPANAS ('ᛟ'): cada una da una nota de la nana (la, do, re, mi, sol). La verja del rito tiene la
     melodía tallada en runas; se tocan en ese orden con la Hoja, la vaina (lejos) o una ráfaga (varias en
     fila, de la más cercana a la más lejana). Al acabar, las campanas cantan solas la nana entera.
   · CORRIENTES ('Ш'): una ráfaga del molinillo (o el tornadito del Remolino) hace soplar la rejilla hacia
     arriba un rato. Salta encima con el vilano y planearás muy lejos. En el Puente Roto (16,-1) el aire baja
     y el vilano no planea... salvo en la corriente.
   ============================================================ */
const TRUE_ICE=new Set(['14,0','14,1','15,2']);
const BELLS={'15,0':{cells:{'2,1':69,'7,1':79,'4,4':76,'2,6':74,'7,6':72},seq:[76,79,76,74,72],gap:300}}; // la, sol, mi, re, do · la frase: mi sol mi re do
const BELL_W={69:12,72:11,74:10,76:9,79:8}; // cuanto más grave, más grande
const NO_GLIDE=new Set(['16,-1']);           // en el Puente Roto el aire baja: solo planea la corriente
const DRAFT_T=360;
GROUND.add('Ш'); SOLID.add('Ж'); SOLID.add('ᛟ');
function trueIce(){ return TRUE_ICE.has(sx+','+sy); }
let icePlan=null, iceSlide=null, iceBlockAnim=null, melts=[], bellSt=null, drafts={}, updraftJump=false, riteSong=null, iceHold=false;

/* ---------- el plano: qué hay debajo de cada bloque, objeto o bicho (hielo o suelo) ---------- */
function planFor(key){ const M=MAPS[key]; if(!M) return null; const rows=M.map(r=>[...r]);
  const SW_=rows[0].length, SH_=rows.length, keep=c=>c==='i'||c==='q'||c==='_'||c==='°'||c==='Ш';
  for(let y=0;y<SH_;y++) for(let x=0;x<SW_;x++){ const c=rows[y][x]; if(keep(c)||c==='v'||c==='r'||c==='='||c==='Ł'||c===')'||c==='ᛟ') continue;
    if(c==='#'||c==='Ж'){ rows[y][x]='i'; continue; }
    if(x===0||y===0||x===SW_-1||y===SH_-1){ rows[y][x]='q'; continue; } // las puertas, suelo
    let ice=0, flo=0; for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){ const n=M[y+dy]&&[...M[y+dy]][x+dx]; if(n==='i'||n==='#'||n==='Ж') ice++; else if(n==='q'||n==='_') flo++; }
    rows[y][x]=ice>=flo?'i':'q'; }
  return rows; }
function underOf(x,y){ return icePlan&&icePlan[y]?icePlan[y][x]:regionFloor(); }
function iceCell(x,y){ return !!(grid[y]&&grid[y][x]==='i'); }

/* ---------- al entrar en una sala ---------- */
{ const I0=initRoomRules; initRoomRules=function(){ I0(); initTemplo(); }; }
function initTemplo(){ const key=sx+','+sy;
  iceSlide=null; iceBlockAnim=null; melts=[]; drafts={}; updraftJump=false; riteSong=null; iceHold=false;
  icePlan=TRUE_ICE.has(key)?planFor(key):null;
  if(icePlan) for(let y=0;y<SH;y++) for(let x=0;x<SW;x++) if(grid[y][x]==='q'&&icePlan[y][x]==='i') grid[y][x]='i'; // debajo de lo que había: hielo
  if(icePlan&&opened.has('PZ'+key)){ let ok=true; for(const c of plateCells){ const [x,y]=c.split(',').map(Number); if(grid[y][x]!=='#') ok=false; } // resuelta con otro plano: los bloques, en sus placas
    if(!ok){ for(let y=0;y<SH;y++) for(let x=0;x<SW;x++) if(grid[y][x]==='#') grid[y][x]=underOf(x,y); for(const c of plateCells){ const [x,y]=c.split(',').map(Number); grid[y][x]='#'; } } }
  const B=BELLS[key]; bellSt=B?{B,i:0,t:0,swing:{},lit:0,done:opened.has('G'+key)}:null; if(bellSt&&bellSt.done) bellSt.lit=B.seq.length; }

/* ============================================================
   HIELO DE VERDAD: Sprout resbala hasta chocar
   ============================================================ */
function onTrueIce(){ if(!icePlan) return false; const [tx,ty]=playerTile(); return iceCell(tx,ty); }
function iceBlocked(tx,ty){ if(tx<0||ty<0||tx>=SW||ty>=SH) return false; return isSolid(grid[ty][tx])||blockSolidAt(tx,ty); }
function startIceSlide(dx,dy){ if(dx&&dy){ dx=0; } // en diagonal manda lo vertical
  const [tx,ty]=playerTile(); if(iceBlocked(tx+dx,ty+dy)) return false; // pegado a algo: no resbala (quizá empuja)
  iceSlide={dx,dy,t:0}; if(dx) player.y=ty*16-4; else player.x=tx*16; player.dir=dy<0?1:dy>0?0:(dx<0?2:3); player.ivx=player.ivy=0; player.frame=0;
  if(AC){ noise(.18,.018,true,undefined,5200); beep('triangle',f(88),f(84),.08,.012); } return true; }
/* cada fotograma en el que no resbala: si pisas hielo y te mueves, arrancas (y ya no andas) */
function iceWalk(dx,dy){ if(iceHold){ if(dx||dy) return true; iceHold=false; } // tras empujar sobre hielo, Sprout se queda quieto hasta soltar la cruceta
  if(!onTrueIce()||jumpT>0||!(dx||dy)) return false; return startIceSlide(dx,dy); }
function updIceSlide(){ const S=iceSlide; if(!S) return false; S.t++;
  if(keys.alt&&xItem==='feather'){ keys.alt=false; iceSlide=null; // el freno: saltas y al caer te quedas quieto
    jumpDir=[S.dx,S.dy]; jumpT=26; glideT=0; glideUsed=false; SFX.jump(); puff(player.x+8,player.y+14,'#e8f4ff',6,.8); return true; }
  keys.fire=false; keys.alt=false;
  let left=2.4; const ax=S.dx?'x':'y', d=S.dx||S.dy;
  while(left>0){ const c=ax==='x'?player.x+8:player.y+12, rel=c-8, onC=Math.abs(rel/16-Math.round(rel/16))<1e-6;
    if(onC){ const tx=(player.x+8)>>4, ty=(player.y+12)>>4;
      if(!iceCell(tx,ty)){ iceStop(false); return true; }                      // suelo: se para
      if(iceBlocked(tx+S.dx,ty+S.dy)){ iceStop(true); return true; } }          // choca
    const next=d>0?(Math.floor(rel/16)+1)*16+8:(Math.ceil(rel/16)-1)*16+8, step=Math.min(left,Math.abs(next-c));
    if(ax==='x') player.x+=step*d; else player.y+=step*d; left-=step;
    if(player.x<-8||player.x>152||player.y<-12||player.y>124){ iceSlide=null; return false; } } // sale por una puerta
  if((S.t&1)===0) parts.push({k:'shard',x:player.x+8-S.dx*6+(Math.random()-.5)*4,y:player.y+14-S.dy*4,vx:-S.dx*.4+(Math.random()-.5)*.3,vy:-S.dy*.4-.2,life:10,max:10,col:(S.t&2)?'#ffffff':'#bfe6fa',nog:true}); // polvo de escarcha
  return true; }
function iceStop(hit){ const S=iceSlide; iceSlide=null; player.ivx=player.ivy=0;
  if(hit){ player.squash=-.3; shake=Math.max(shake,1); if(AC){ beep('triangle',f(64),f(58),.08,.03); noise(.05,.03,false,undefined,1600); }
    for(let i=0;i<5;i++) parts.push({k:'shard',x:player.x+8+S.dx*7,y:player.y+12+S.dy*5,vx:-S.dx*(.3+Math.random()*.6)+(Math.random()-.5)*.6,vy:-.6-Math.random()*.5,life:12,max:12,col:i&1?'#ffffff':'#bfe6fa',nog:true}); }
  else if(AC) beep('triangle',f(76),0,.05,.012); }
/* el freno: al caer sobre hielo no se arranca a resbalar (solo si vuelves a moverte) */

/* ============================================================
   BLOQUES QUE RESBALAN
   ============================================================ */
{ const P0=tryPushBlock; tryPushBlock=function(){ if(icePlan){ icePushBlock(); return; } P0(); }; }
function icePushBlock(){ const ft=facingTile(); if(!ft||ft[2]!=='#'||iceBlockAnim){ pushHold=0; return; }
  if(pushLatch) return; const [tx,ty]=ft;
  const dxc=(player.x+8)-(tx*16+8), dyc=(player.y+12)-(ty*16+10), off=(player.dir<2)?Math.abs(dxc):Math.abs(dyc); if(off>9){ pushHold=0; return; }
  if(player.dir<2) player.x+=(tx*16-player.x)*0.4; else player.y+=(ty*16-4-player.y)*0.4;
  if(++pushHold<9) return;
  const D=DIRV[player.dir], free=(x,y)=>!(x<0||y<0||x>=SW||y>=SH)&&!isSolid(grid[y][x])&&!enemies.some(e=>Math.abs(e.x-x*16)<10&&Math.abs(e.y-y*16)<10)&&!(((player.x+8)>>4)===x&&((player.y+12)>>4)===y);
  let x=tx+D[0], y=ty+D[1]; if(!free(x,y)){ pushHold=0; return; }
  while(iceCell(x,y)&&free(x+D[0],y+D[1])){ x+=D[0]; y+=D[1]; } // resbala hasta el tope (o se para en el suelo)
  pushHold=0; pushLatch=true; iceHold=true; grid[ty][tx]=underOf(tx,ty); markDirty();
  iceBlockAnim={fx:tx,fy:ty,tx:x,ty:y,D,px:tx*16,py:ty*16,t:0};
  SFX.push(); player.squash=-.2; stepDustAt(player.x+8,player.y+15,1); if(AC&&(x!==tx+D[0]||y!==ty+D[1])) noise(.3,.02,true,undefined,4200); }
function iceBlockAt(cx,cy){ const A=iceBlockAnim; if(!A) return false; return (cx===((A.px+8)>>4)&&cy===((A.py+8)>>4))||(cx===A.tx&&cy===A.ty); }
{ const B0=blockSolidAt; blockSolidAt=function(cx,cy){ return B0(cx,cy)||iceBlockAt(cx,cy); }; }
function updIceBlock(){ const A=iceBlockAnim; if(!A) return; A.t++;
  const gx=A.tx*16, gy=A.ty*16, sp=A.t<4?1.2:3.2;
  A.px+=Math.sign(gx-A.px)*Math.min(sp,Math.abs(gx-A.px)); A.py+=Math.sign(gy-A.py)*Math.min(sp,Math.abs(gy-A.py));
  if((A.t&1)===0) parts.push({k:'shard',x:A.px+8-A.D[0]*8+(Math.random()-.5)*6,y:A.py+14,vx:-A.D[0]*.3,vy:-.3,life:10,max:10,col:(A.t&2)?'#ffffff':'#cfe8f4',nog:true});
  if(A.px===gx&&A.py===gy){ iceBlockAnim=null; grid[A.ty][A.tx]='#'; markDirty(); SFX.pushLand(); shake=Math.max(shake,2);
    const cx=gx+8, cy=gy+14; for(const s of [-1,1]) for(let i=0;i<3;i++) parts.push({k:'shard',x:cx+s*(6+i*2),y:cy,vx:s*(.5+i*.25),vy:-.3-i*.1,life:14,max:14,col:i&1?'#ffffff':'#bfe6fa',nog:true});
    if(plateCells.has(A.tx+','+A.ty)){ let n=0; for(const c of plateCells){ const [x,y]=c.split(',').map(Number); if(grid[y][x]==='#') n++; } SFX.plate(n); parts.push({x:cx,y:cy-6,vx:0,vy:0,life:12,col:'#fff6c0',ring:true,r:12,nog:true}); }
    if(opened.has('PZ'+sx+','+sy)) saveBlocks(); checkPlates(); } }
function drawIceBlock(){ const A=iceBlockAnim; if(!A) return; drawShadow(A.px+8,A.py+15,7); ctx.drawImage(blockTile(),Math.round(A.px),Math.round(A.py)); }

/* ============================================================
   BLOQUES DE HIELO: el farol los derrite
   ============================================================ */
function iceBlockTile(){ return cached('iceblock',g=>{ grid16(g,[
"................",
".kkkkkkkkkkkkkk.",
".kWWWWWWWWWWWLk.",
".kWLLLLLLLLLLbk.",
".kWLlllclllLLbk.",
".kWLllclllllLbk.",
".kWLlclllllLLbk.",
".kWLllllcllLLbk.",
".kWLlllllclLLbk.",
".kWLLLLLLLLLLbk.",
".kbbbbbbbbbbbbk.",
".kdddddddddddmk.",
".kdmmmdddmmmdmk.",
".kmmmmmmmmmmmmk.",
".kkkkkkkkkkkkkk.",
"................"],{W:'#f4fcff',L:'#c8ecfc',l:'#a0d4f0',c:'#e8f8ff',b:'#6aa4d0',d:'#4a7cb0',m:'#34608e'}); PX(g,3,3,'#ffffff'); PX(g,4,3,'#ffffff'); PX(g,3,4,'#ffffff'); }); }
function updMelt(){ for(const q of flares){ const tx=q.x>>4, ty=(q.y-2)>>4; if(grid[ty]&&grid[ty][tx]==='Ж') meltAt(tx,ty); }
  for(const m of melts) m.t++; melts=melts.filter(m=>m.t<22); }
function meltAt(x,y){ grid[y][x]=icePlan?underOf(x,y):regionFloor(); markDirty(); melts.push({x,y,t:0}); shake=Math.max(shake,2);
  if(AC){ noise(.5,.035,true,undefined,4800); beep('triangle',f(91),f(84),.25,.02); }
  for(let i=0;i<10;i++) parts.push({k:'smoke',x:x*16+4+Math.random()*8,y:y*16+6+Math.random()*6,vx:(Math.random()-.5)*.5,vy:-.5-Math.random()*.5,life:26,max:26,r:2,col:i&1?'#ffffff':'#dff0ff',nog:true});
  for(let i=0;i<6;i++) parts.push({k:'shard',x:x*16+8,y:y*16+8,vx:(Math.random()-.5)*1.4,vy:-.8-Math.random(),life:14,max:14,col:'#bfe6fa',nog:true}); }
function drawMelts(){ for(const m of melts){ const k=m.t/22, h=Math.round(14*(1-k)); if(h<=0) continue; ctx.globalAlpha=1-k*.6; // el bloque se encoge en su charco
    ctx.drawImage(iceBlockTile(),0,16-h,16,h,m.x*16,m.y*16+16-h,16,h); ctx.globalAlpha=1; } }

/* ============================================================
   LAS CAMPANAS DEL RITO
   ============================================================ */
const BELL_ART={};
function bellArt(w){ if(BELL_ART[w]) return BELL_ART[w]; const h=w+2, B=pxBuf(w+2,h+3), cx=(w+2)/2;
  for(let y=0;y<h;y++){ const u=y/(h-1), hw=Math.max(1.5,(1.6+(w/2-1.6)*Math.pow(u,.55)))+(y===h-2?1:y===h-1?1:0);
    for(let x=0;x<w+2;x++){ const dx=x+.5-cx; if(Math.abs(dx)>hw) continue; const edge=Math.abs(dx)>hw-1||y===0||y===h-1, t=(dx+hw)/(2*hw);
      B.set(x,y,edge?'#1a3050':y>=h-2?'#4a7cb0':t<.3?'#e8f8ff':t<.62?'#a8d8f0':'#6aa4d0'); } }
  B.set(Math.round(cx)-1,h,'#1a3050'); B.set(Math.round(cx),h,'#1a3050'); B.set(Math.round(cx)-1,h+1,'#34608e'); B.set(Math.round(cx),h+1,'#34608e'); // el badajo
  return BELL_ART[w]=B.canvas(); }
function bellFrameTile(){ return cached('bellframe',g=>{ // dos postes de piedra y un travesaño
  R(g,2,3,2,12,'#3a4458'); R(g,12,3,2,12,'#3a4458'); R(g,2,3,1,12,'#6a7898'); R(g,12,3,1,12,'#6a7898');
  R(g,1,2,14,2,'#2a3244'); R(g,2,2,12,1,'#8a98b8'); R(g,1,14,4,2,'#2a3244'); R(g,11,14,4,2,'#2a3244');
  R(g,7,4,2,1,'#1a2030'); }); }
{ const O0=drawObject; drawObject=function(g,rows,x,y,ch,opts,f,fg){
  if(ch==='Ж'){ g.drawImage(iceBlockTile(),x*16,y*16); return; }
  if(ch==='ᛟ'){ g.drawImage(bellFrameTile(),x*16,y*16); return; } // la campana, en vivo (se mece)
  return O0(g,rows,x,y,ch,opts,f,fg); }; }
{ const G0=drawGround; drawGround=function(g,rows,x,y,ch,opts,f){ if(ch==='Ш'){ G0(g,rows,x,y,'q',opts,f); g.drawImage(grateTile(),x*16,y*16); return; } return G0(g,rows,x,y,ch,opts,f); }; }
function bellCells(){ const L=[]; if(!bellSt) return L; for(const k in bellSt.B.cells){ const [x,y]=k.split(',').map(Number); if(grid[y]&&grid[y][x]==='ᛟ') L.push([x,y,bellSt.B.cells[k],k]); } return L; }
function ringBell(x,y,note,k,by){ const S=bellSt; if(!S) return; S.swing[k]={t:0,a:by==='gust'?3:2};
  if(AC){ const a=AC.currentTime; beep('triangle',f(note),0,.9,.05,a); beep('p125',f(note+12),0,.5,.012,a); beep('triangle',f(note+19),0,.25,.006,a+.02); }
  for(let i=0;i<6;i++) parts.push({k:'shard',x:x*16+8+(Math.random()-.5)*8,y:y*16+6,vx:(Math.random()-.5)*1.2,vy:-.6-Math.random()*.6,life:14,max:14,col:i&1?'#ffffff':'#bfe6fa',nog:true});
  bellNotes.push({x:x*16+8,y:y*16-2,t:0,note});
  if(S.done||riteSong) return;
  const want=S.B.seq[S.i];
  if(note===want){ S.i++; S.t=0; S.lit=S.i; if(S.i>=S.B.seq.length) riteDone(); }
  else { if(S.i>0){ S.i=0; S.lit=0; if(AC){ beep('square',f(58),f(57),.3,.03); beep('square',f(61),f(60),.3,.025); } flyText.push({x:80,y:30,txt:'…',t:30,col:'#8ab0d8'}); }
    if(note===S.B.seq[0]){ S.i=1; S.t=0; S.lit=1; } } }
let bellNotes=[];
function riteDone(){ const S=bellSt, key=sx+','+sy; S.done=true; opened.add('G'+key); SFX.puzzle(); shake=5; screenFlash(8,'#e8f4ff');
  riteSong={t:0,i:0,at:0}; save(); showToast('¡EL RITO DE LA NIEVE!','las campanas cantan solas'); }
function updRiteSong(){ const R=riteSong; if(!R) return; R.t++;
  if(R.t===40){ openGates(); shake=4; for(let i=0;i<14;i++) parts.push({k:'shard',x:72+Math.random()*16,y:20+Math.random()*16,vx:(Math.random()-.5)*2,vy:-1-Math.random(),life:20,max:20,col:i&1?'#ffffff':'#bfe6fa',nog:true}); } // la verja: sus runas se hacen añicos
  if(R.t>=60&&R.i<NANA_NOTES.length&&R.t>=R.at){ const [m,d]=NANA_NOTES[R.i]; const b=bellCells().find(c=>c[2]===m); if(b) ringBellSolo(b); R.at=R.t+Math.round(d*4.5); R.i++; } // la nana entera, campana a campana
  if(R.i>=NANA_NOTES.length&&R.t>R.at+60) riteSong=null; }
function ringBellSolo(b){ const [x,y,note,k]=b; bellSt.swing[k]={t:0,a:2}; if(AC){ const a=AC.currentTime; beep('triangle',f(note),0,.7,.045,a); beep('p125',f(note+12),0,.4,.01,a); } bellNotes.push({x:x*16+8,y:y*16-2,t:0,note,gold:true}); }
function updBells(){ const S=bellSt; if(!S) return; if(!S.done&&S.i>0&&++S.t>S.B.gap){ S.i=0; S.lit=0; if(AC) beep('triangle',f(64),f(60),.4,.02); } // tardaste mucho: vuelve a empezar
  for(const k in S.swing){ if(++S.swing[k].t>60) delete S.swing[k]; }
  for(const n of bellNotes) n.t++; bellNotes=bellNotes.filter(n=>n.t<50);
  const cells=bellCells(); if(!cells.length) return;
  const hitBox=(bx,by)=>[bx*16+2,by*16+2,12,14];
  if(meleeActive()){ const mb=meleeBox(), sw=player.atk+'|'+player.spin; for(const c of cells){ if(rectsHit(mb,hitBox(c[0],c[1]))){ const id='m'+c[3]; if(S.lastSwing!==sw+id&&!(S.swing[c[3]]&&S.swing[c[3]].t<8)){ S.lastSwing=sw+id; ringBell(c[0],c[1],c[2],c[3],'blade'); } } } }
  if(boomer){ for(const c of cells){ if(!boomer.hits.has('bell'+c[3])&&rectsHit([boomer.x-4,boomer.y-4,8,8],hitBox(c[0],c[1]))){ boomer.hits.add('bell'+c[3]); boomer.ret=true; ringBell(c[0],c[1],c[2],c[3],'boomer'); } } }
  for(const g of gusts){ const near=cells.filter(c=>!g.hits.has('bell'+c[3])&&rectsHit([g.x-6,g.y-6,12,12],hitBox(c[0],c[1]))); for(const c of near){ g.hits.add('bell'+c[3]); ringBell(c[0],c[1],c[2],c[3],'gust'); } }
  for(const w of windProjs){ for(const c of cells){ if(!w.hits.has('bell'+c[3])&&rectsHit([w.x-6,w.y-6,12,12],hitBox(c[0],c[1]))){ w.hits.add('bell'+c[3]); ringBell(c[0],c[1],c[2],c[3],'gust'); } } } }
function drawBells(){ const S=bellSt; if(!S) return;
  for(const [x,y,note,k] of bellCells()){ const sw=S.swing[k], w=BELL_W[note]||10, img=bellArt(w), amp=sw?sw.a*Math.max(0,1-sw.t/60):0, dx=sw?Math.round(Math.sin(sw.t*.45)*amp):0;
    const bx=x*16+8-(img.width>>1)+dx, by=y*16+4; if(sw&&sw.t<12) glowAt(x*16+8,y*16+9,12,'rgba(200,236,255,'+(.5*(1-sw.t/12)).toFixed(2)+')');
    ctx.fillStyle='#1a2030'; ctx.fillRect(x*16+7,y*16+3,2,2); ctx.drawImage(img,bx,by); }
  if(!S.done||riteSong) drawRunes(S);
  for(const n of bellNotes){ const a=Math.min(1,(50-n.t)/20); ctx.globalAlpha=a; proNote(n.x-2+Math.sin(n.t*.2)*2,n.y-n.t*.5,n.gold?'#ffe070':'#dff0ff'); ctx.globalAlpha=1; } }
/* la melodía tallada en la verja: cinco notas en un pentagrama de hielo; la que ya sonó bien, encendida */
const RUNE_Y={79:0,76:3,74:5,72:7,69:9};
function drawRunes(S){ let gx=null, gy=null; for(let y=0;y<SH;y++) for(let x=0;x<SW;x++) if(grid[y][x]==='='&&gx===null){ gx=x; gy=y; }
  if(gx===null){ if(!riteSong||riteSong.t>40) return; gx=4; gy=1; }
  const x0=gx*16+2, y0=gy*16+6, n=S.B.seq.length, shatter=riteSong?Math.min(1,riteSong.t/40):0;
  roundBox(x0-3,y0-6,34,21,'#0a1428'); roundBox(x0-2,y0-5,32,19,'#1c2c48'); ctx.fillStyle='#4a6a98'; ctx.fillRect(x0-1,y0-5,30,1); ctx.fillStyle='#101c34'; ctx.fillRect(x0-1,y0+13,30,1); // una tablilla de piedra azul
  ctx.fillStyle='#34507a'; for(let l=0;l<3;l++) ctx.fillRect(x0,y0+l*4,28,1);
  S.B.seq.forEach((m,i)=>{ const x=x0+2+i*5, y=y0-2+RUNE_Y[m], on=i<S.lit, j=shatter?Math.round((Math.random()-.5)*shatter*3):0;
    if(on) glowAt(x+1,y+1,6,'rgba(200,236,255,.55)'); ctx.fillStyle=on?'#ffffff':'#7a98c0'; ctx.fillRect(x+j,y,3,2); ctx.fillRect(x+1+j,y-1,1,1); ctx.fillRect(x+2+j,y-4,1,4); if(!on){ ctx.fillStyle='#0e1a30'; ctx.fillRect(x+j,y+2,3,1); } }); } // cada nota, tallada (y encendida cuando suena bien)

/* ============================================================
   LAS CORRIENTES: rejillas que soplan hacia arriba
   ============================================================ */
function grateTile(){ return cached('grate',g=>{ R(g,2,2,12,12,'#1a2030'); R(g,2,2,12,1,'#6a7898'); R(g,2,13,12,1,'#8a98b8');
  for(let i=0;i<3;i++){ R(g,3+i*4,3,2,10,'#0a0e18'); R(g,5+i*4,3,1,10,'#4a5670'); } R(g,2,2,1,12,'#4a5670'); R(g,13,2,1,12,'#2a3244'); }); }
function updDrafts(){ const cell=(x,y)=>{ const tx=x>>4, ty=y>>4; return grid[ty]&&grid[ty][tx]==='Ш'?tx+','+ty:null; };
  for(const g of gusts){ const c=cell(g.x,g.y); if(c&&!g.hits.has('draft'+c)){ g.hits.add('draft'+c); draftOn(c); } }
  for(const w of windProjs){ const c=cell(w.x,w.y); if(c&&!w.hits.has('draft'+c)){ w.hits.add('draft'+c); draftOn(c); } }
  for(const k in drafts){ if(--drafts[k]<=0) delete drafts[k]; else { const [x,y]=k.split(',').map(Number); if((tick&1)===0) parts.push({k:'streak',x:x*16+3+Math.random()*10,y:y*16+12,vx:0,vy:-1.4-Math.random(),life:22,max:22,len:3+((Math.random()*4)|0),col:(tick&2)?'#ffffff':'#dff0ff',nog:true}); } }
  if(jumpT>0&&!updraftJump){ const [tx,ty]=playerTile(), c=tx+','+ty; if(drafts[c]){ updraftJump=true; draftLift(); } } // pasas por encima: te coge
  if(jumpT===0) updraftJump=false; }
function draftOn(c){ const was=!!drafts[c]; drafts[c]=DRAFT_T; if(!was){ if(AC){ swish(1.2,.04,300,1400,600); beep('triangle',f(67),f(79),.5,.02); } const [x,y]=c.split(',').map(Number); puff(x*16+8,y*16+8,'#ffffff',8,1); } }
function draftLift(){ glideT=130; glideUsed=true; if(AC){ swish(.8,.05,500,2200,900); beep('triangle',f(79),f(91),.4,.03); } for(let i=0;i<10;i++) parts.push({k:'mote',x:player.x+8+(Math.random()-.5)*12,y:player.y+8,vx:(Math.random()-.5)*.4,vy:-1-Math.random(),life:30,max:30,sway:Math.random()*6,col:'#ffffff',nog:true}); }
{ const J0=startJump; startJump=function(){ J0(); if(jumpT>0){ const [tx,ty]=playerTile(); if(drafts[tx+','+ty]){ updraftJump=true; } } }; } // saltar desde la rejilla
{ const S0=glideStart; glideStart=function(){ if(NO_GLIDE.has(sx+','+sy)&&!updraftJump) return; S0(); if(updraftJump) draftLift(); }; }
{ const G0=glideStep; glideStep=function(){ if(updraftJump){ const h=keys.altHeld; keys.altHeld=true; G0(); keys.altHeld=h; tryMove(jumpDir[0]*.7,jumpDir[1]*.7); jumpZ=18+Math.sin(tick*.2)*2; // en la corriente se planea sin soltar y más lejos
      if((tick&3)===0) parts.push({k:'streak',x:player.x+4+Math.random()*8,y:player.y+14-jumpZ,vx:0,vy:1.2,life:12,max:12,len:3,col:'#ffffff',nog:true}); } else G0(); }; }
/* en el salto de la corriente, el planeo arranca solo en lo alto */
function updUpdraftJump(){ if(updraftJump&&jumpT===13&&glideT===0&&!glideUsed) glideStart(); }

/* ============================================================
   CADA FOTOGRAMA Y LO QUE SE PINTA EN VIVO
   ============================================================ */
{ const U0=updRoomRules; updRoomRules=function(){ U0(); updTemplo(); }; }
function updTemplo(){ updIceBlock(); updMelt(); updBells(); updRiteSong(); updDrafts(); updUpdraftJump(); }
{ const D0=drawScorches; drawScorches=function(){ D0(); drawMelts(); drawBells(); drawIceBlock(); }; } // a ras de suelo, bajo los actores
