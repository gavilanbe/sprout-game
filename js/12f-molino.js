'use strict';
/* ============================================================
   EL MOLINO, AMPLIADO (docs/TERCERA-PASADA.md §5.3): el molino entero gira, y el viento lo pones tú.
   · LA RUEDA MAYOR ('Я', 2×2) en la Sala de los Engranajes: cada ráfaga la gira un cuarto de vuelta. Su aspa
     roja señala una de cuatro compuertas, lejos de allí: N, la de la puerta del guardián (Sala de las Aspas);
     E, la de la Sala del Viento; S, la del rincón del Granero; O, el paso al Laberinto. Cada compuerta lleva su
     flecha grabada. Al girar, el aviso dice cuál se ha abierto.
   · EL EJE: el molinete del norte de la Sala del Viento mueve un eje que entra en la Cámara de la Llave. Los
     tres molinetes de allí solo abren la verja si el eje aún gira: hay que llegar a tiempo.
   · EL FOSO DE LOS SACOS ('ш' foso, 'Ю' placa, 'Ѫ' saco, 'Ѳ' poste) en la Despensa: Sprout no baja al foso;
     sopla desde la pasarela y la ráfaga empuja el primer saco de su fila o columna, que resbala hasta chocar
     con el borde, un poste u otro saco. Un saco en cada placa abre la verja del norte. Resolvedor: 6 ráfagas.
   ============================================================ */
const WHEEL_ROOM='19,1', WHEEL_C=[80,64], WHEEL_NAME=['NORTE','ESTE','SUR','OESTE'], WHEEL_ARROW=['↑','→','↓','←'];
const WHEEL_GATES=[ // lo que abre cada posición: [sala, x, y]
  [['19,0',4,1],['19,0',5,1]],
  [['20,0',4,3],['20,0',5,3]],
  [['18,2',7,1],['18,2',8,2]],
  [['19,0',0,3],['19,0',0,4]]];
const WHEEL_WHERE=['la puerta del guardián','la Sala del Viento','el rincón del Granero','el Laberinto'];
const AXLE_T=380;
let wheelPos=2, wheelAnim=null, millAxle=0, sackAnims=[], sackPlan=null;
SOLID.add('Я'); SOLID.add('Ѳ'); GROUND.add('ш'); GROUND.add('Ю'); GROUND.add('Ѫ');
delete ROOM_RULES['20,1']; delete MILL_RULES['19,1']; delete MILL_RULES['20,0']; delete MILL_RULES['20,-1']; // la Despensa ya no es emboscada; los molinetes de antes, ahora eje y rueda
delete CHESTS['20,1:4,4']; Object.assign(CHESTS,{'20,2:7,3':{kind:'map',dk:'molino'},'18,2:8,1':{kind:'berries',n:50}});
Object.assign(ROOM_HINTS,{
  '19,1':["(En el centro, la RUEDA MAYOR del molino. Cuando gira, algo se mueve lejos de aquí.)","(Su aspa roja señala hacia dónde.)"],
  '20,1':["(El foso de la harina. Los sacos resbalan por él como si fuera hielo.)","(Dos placas en el fondo. Tú no llegas... pero el viento sí.)"],
  '20,0':["(La compuerta tiene una flecha grabada hacia el ESTE.)","(Y ese molinete del norte mueve un eje que se mete en el muro.)"],
  '20,-1':["(Tres molinetes en fila. En la pared, el extremo de un eje, quieto.)"] });
Object.assign(PLACE_NAMES,{'20,1':'El Foso de los Sacos'});
/* guardado: la rueda, con los trueques y la pesca (12c) */
{ const S0=sideSave; sideSave=function(){ const o=S0(); o.wheel=wheelPos; return o; }; }
{ const L0=sideLoad; sideLoad=function(d){ L0(d); wheelPos=(d&&d.wheel!==undefined)?d.wheel:2; }; }

/* ---------- al entrar ---------- */
{ const I0=initMill; initMill=function(){ I0(); initMolino2(); }; }
function initMolino2(){ const key=sx+','+sy; wheelAnim=null; sackAnims=[];
  WHEEL_GATES.forEach((L,p)=>{ for(const [k,x,y] of L) if(k===key) grid[y][x]=p===wheelPos?'q':'='; }); // las compuertas de la rueda
  sackPlan=null; if(key==='20,1'){ sackPlan=MAPS[key].map(r=>[...r].map(c=>c==='Ѫ'?'ш':c));
    if(opened.has('G20,1')){ for(let y=0;y<SH;y++) for(let x=0;x<SW;x++){ if(grid[y][x]==='Ѫ') grid[y][x]='ш'; if(sackPlan[y][x]==='Ю') grid[y][x]='Ѫ'; } } } } // resuelto: los sacos, en sus placas
/* el foso no se pisa: ni el foso, ni sus placas, ni los sacos */
{ const S0=solidAt; solidAt=function(px,py){ if(S0(px,py)) return true; const r=grid[py>>4], ch=r&&r[px>>4]; return ch==='ш'||ch==='Ю'||ch==='Ѫ'; }; }

/* ---------- la ráfaga: gira la rueda y empuja sacos (antes de que siga su camino) ---------- */
{ const G0=updGusts; updGusts=function(){ if(gusts.length) gusts=gusts.filter(g=>!gustMill(g)); G0(); }; }
function gustMill(g){ const nx=g.x+g.vx, ny=g.y+g.vy, tx=nx>>4, ty=ny>>4, ch=grid[ty]&&grid[ty][tx]; if(!ch) return false;
  if(ch==='Я'&&!wheelAnim){ turnWheel(g); puff(nx,ny,'#fff6d8',8,1.2); return true; }
  if(ch==='Ѫ'){ const dx=Math.sign(g.vx), dy=Math.sign(g.vy); if(pushSack(tx,ty,dx,dy)){ puff(nx,ny,'#f4ecd8',8,1.2); return true; } puff(nx,ny,'#fff6d8',5,.8); return true; }
  return false; }
/* el tornadito del Remolino también gira la rueda y empuja sacos */
function tornadoMill(){ for(const w of windProjs){ const tx=w.x>>4, ty=w.y>>4, ch=grid[ty]&&grid[ty][tx], k='mill'+tx+','+ty; if(!ch||w.hits.has(k)) continue;
  if(ch==='Я'&&!wheelAnim){ w.hits.add(k); turnWheel({vx:w.vx,vy:w.vy}); w.t=0; }
  else if(ch==='Ѫ'){ w.hits.add(k); const ax=Math.abs(w.vx)>Math.abs(w.vy); pushSack(tx,ty,ax?Math.sign(w.vx):0,ax?0:Math.sign(w.vy)); w.t=0; } } }

/* ============================================================
   LA RUEDA MAYOR
   ============================================================ */
function turnWheel(g){ const from=wheelPos, to=(wheelPos+1)%4; wheelAnim={from,to,t:0}; shake=Math.max(shake,5); hitStop=Math.max(hitStop,3);
  if(AC){ const a=AC.currentTime; beep('triangle',f(36),f(31),.5,.12,a); noise(.5,.06,false,a,260); [0,.18,.36].forEach((d,i)=>{ beep('square',f(48-i*2),f(44-i*2),.08,.03,a+.1+d); noise(.06,.04,true,a+.1+d,1400); }); } // clonc-clonc-clonc
  for(let i=0;i<14;i++) parts.push({k:'dust',x:Math.random()*160,y:6+Math.random()*10,vx:(Math.random()-.5)*.3,vy:.6+Math.random()*.5,life:40,max:40,r:1+(i&1),col:i&1?'#e8dcc0':'#b8a080',nog:false}); } // cae polvo del techo
function updWheel(){ const A=wheelAnim; if(!A) return; A.t++;
  if(A.t%6===0&&AC) beep('square',f(40+((A.t/6)|0)),0,.04,.02);
  if(A.t>=26){ wheelAnim=null; wheelPos=A.to; save(); shake=Math.max(shake,3); if(AC) beep('triangle',f(55),f(43),.3,.08);
    showToast('LA RUEDA SEÑALA '+WHEEL_NAME[wheelPos]+' '+WHEEL_ARROW[wheelPos],'se abre '+WHEEL_WHERE[wheelPos]); } }
function wheelAngle(){ const A=wheelAnim, base=p=>-Math.PI/2+p*Math.PI/2; if(!A) return base(wheelPos);
  const k=clamp(A.t/26,0,1); return base(A.from)+CA_EASE.back(k)*Math.PI/2; } // se pasa un pelo y vuelve
/* la rueda, pintada a píxeles en cualquier ángulo (nada se rota ni se escala) */
function drawWheel(){ if(sx+','+sy!==WHEEL_ROOM) return; const [cx,cy]=WHEEL_C, a=wheelAngle(), px=(x,y,c)=>{ ctx.fillStyle=c; ctx.fillRect(Math.round(x),Math.round(y),1,1); };
  glowAt(cx,cy,26,'rgba(60,40,20,.35)');
  for(let i=0;i<64;i++){ const u=i/64*6.283, r=15; px(cx+Math.cos(u)*r,cy+Math.sin(u)*r,(i&1)?'#3a2410':'#5a3a1a'); px(cx+Math.cos(u)*(r-1),cy+Math.sin(u)*(r-1),'#7a5230'); } // el aro
  for(let k=0;k<4;k++){ const u=a+k*Math.PI/2, c=Math.cos(u), s=Math.sin(u), red=k===0;
    for(let r=5;r<=14;r++){ px(cx+c*r,cy+s*r,'#5a3a1a'); px(cx+c*r-s*.8,cy+s*r+c*.8,'#8a6034'); } // el radio
    for(let r=6;r<=13;r++) for(let w=1;w<=4;w++){ const x=cx+c*r+(-s)*(w+.5), y=cy+s*r+c*(w+.5); px(x,y,red?(w===4||r===13?'#8a2a20':'#c84a3a'):(w===4||r===13?'#a89878':'#e8dcc0')); } } // el aspa (la roja señala)
  for(let yy=-5;yy<=5;yy++) for(let xx=-5;xx<=5;xx++){ const d=xx*xx+yy*yy; if(d>25) continue; px(cx+xx,cy+yy,d>16?'#3a2410':d>6?'#7a5230':'#b08050'); } // el cubo
  px(cx-1,cy-1,'#e8c890');
  if(wheelAnim&&(wheelAnim.t&3)===0) parts.push({k:'mote',x:cx+(Math.random()-.5)*30,y:cy+(Math.random()-.5)*30,vx:0,vy:.3,life:24,max:24,sway:Math.random()*6,col:'#e8dcc0',nog:true}); }
/* las compuertas de la rueda llevan su flecha grabada (y brilla cuando la rueda las abre) */
function drawWheelGates(){ const key=sx+','+sy;
  WHEEL_GATES.forEach((L,p)=>{ const cells=L.filter(c=>c[0]===key); if(!cells.length) return; const open=p===wheelPos;
    let mx=0,my=0; for(const [,x,y] of cells){ mx+=x*16+8; my+=y*16+8; } mx/=cells.length; my/=cells.length;
    const x=Math.round(mx)-3, y=Math.round(my)-4; roundBox(x-2,y-2,11,12,open?'#fff6c0':'#2a1a0c'); roundBox(x-1,y-1,9,10,open?'#c84a3a':'#5a3a1a');
    drawText(ctx,WHEEL_ARROW[p],x+1,y+1,open?'#ffffff':'#c8a878','left',FONT_M); }); }

/* ============================================================
   EL EJE: del molinete de la Sala del Viento a la Cámara de la Llave
   ============================================================ */
{ const W0=spinSwitch; spinSwitch=function(x,y){ W0(x,y); if(sx===20&&sy===0&&x===7&&y===2){ const was=millAxle>0; millAxle=AXLE_T; if(!was&&AC){ beep('triangle',f(43),f(50),.5,.06); noise(.4,.03,false,undefined,500); } } }; }
function updAxle(){ if(millAxle>0){ millAxle--; if(millAxle===0&&sx===20&&(sy===0||sy===-1)&&AC) beep('triangle',f(45),f(33),.6,.05); } // se para
  if(sx===20&&sy===-1&&!opened.has('G20,-1')){ const sw=millSwitches(); if(sw.length&&sw.every(k=>millSpin[k]>0)){
      if(millAxle>0){ opened.add('G20,-1'); openGates(); SFX.puzzle(); shake=4; showToast('¡EJE Y MOLINETES!','la verja se abre'); save(); }
      else if(!updAxle.warn){ updAxle.warn=true; flyText.push({x:120,y:96,txt:'…',t:40,col:'#e8c890'}); } } else updAxle.warn=false; } }
function gearAt(x,y,r,a,col,dark){ // un engranaje macizo, a píxeles, en cualquier ángulo: contorno, cuerpo, ocho dientes y el cubo
  for(let yy=-r-3;yy<=r+3;yy++) for(let xx=-r-3;xx<=r+3;xx++){ const d=Math.hypot(xx,yy), u=Math.atan2(yy,xx)-a, tooth=Math.cos(u*8)>.35;
    const R=tooth?r+2:r; if(d>R+.5) continue; ctx.fillStyle=d>R-.7?PAL.k:d<2.2?dark:(xx+yy<0?shade(col,.25):col); ctx.fillRect(Math.round(x+xx),Math.round(y+yy),1,1); }
  ctx.fillStyle=PAL.k; ctx.fillRect(Math.round(x),Math.round(y),1,1); }
function drawAxle(){ const k=millAxle/AXLE_T, sp=millAxle>0?(.08+.22*k):0; drawAxle.a=(drawAxle.a||0)+sp;
  if(sx===20&&sy===0){ const x=7*16+8; for(let y=2;y<34;y+=2){ ctx.fillStyle=((y>>1)+Math.round(drawAxle.a*3))&1?'#7a5230':'#3a2410'; ctx.fillRect(x-1,y,3,2); } } // el eje que sube hacia el muro
  if(sx===20&&sy===-1){ const x=7*16+8, y=6*16+8; glowAt(x,y,12,millAxle>0?'rgba(255,220,150,'+(.25*k).toFixed(2)+')':'rgba(0,0,0,0)'); gearAt(x,y,4,drawAxle.a,millAxle>0?'#c89058':'#8a6a4a','#3a2410');
    if(millAxle>0&&millAxle<120&&(tick&15)<8){ ctx.fillStyle='#ffe070'; ctx.fillRect(x-1,y-12,3,2); } } } // se le acaba el giro: parpadea

/* ============================================================
   EL FOSO DE LOS SACOS
   ============================================================ */
function sackFree(x,y){ const c=grid[y]&&grid[y][x]; return (c==='ш'||c==='Ю')&&!sackAnims.some(a=>a.tx===x&&a.ty===y); }
function pushSack(x,y,dx,dy){ if(!dx&&!dy) return false; let tx=x, ty=y; while(sackFree(tx+dx,ty+dy)){ tx+=dx; ty+=dy; } if(tx===x&&ty===y){ if(AC) beep('triangle',f(50),f(48),.08,.03); return false; }
  grid[y][x]=sackPlan?sackPlan[y][x]:'ш'; markDirty(); sackAnims.push({x:x*16,y:y*16,tx,ty,dx,dy,t:0});
  if(AC){ swish(.4,.04,500,1100,500); noise(.5,.02,false,undefined,900); } return true; }
function updSacks(){ for(const S of sackAnims){ S.t++; const gx=S.tx*16, gy=S.ty*16, sp=Math.min(3.4,.8+S.t*.35);
    S.x+=Math.sign(gx-S.x)*Math.min(sp,Math.abs(gx-S.x)); S.y+=Math.sign(gy-S.y)*Math.min(sp,Math.abs(gy-S.y));
    if((S.t&1)===0) parts.push({k:'dust',x:S.x+8-S.dx*7,y:S.y+12,vx:-S.dx*.3,vy:-.2,life:16,max:16,r:1,col:'#f4ecd8',nog:true}); // harina
    if(S.x===gx&&S.y===gy){ S.done=true; grid[S.ty][S.tx]='Ѫ'; markDirty(); shake=Math.max(shake,2); if(AC){ beep('triangle',f(40),f(36),.2,.07); noise(.12,.04,false,undefined,700); }
      for(let i=0;i<8;i++){ const a=Math.random()*6.283; parts.push({k:'dust',x:gx+8,y:gy+10,vx:Math.cos(a)*1.2,vy:Math.sin(a)*.8-.4,life:22,max:22,r:1+(i&1),col:i&1?'#ffffff':'#f4ecd8',nog:true}); }
      if(sackPlan&&sackPlan[S.ty][S.tx]==='Ю'){ SFX.plate(1); parts.push({x:gx+8,y:gy+8,vx:0,vy:0,life:12,col:'#fff6c0',ring:true,r:12,nog:true}); } checkSacks(); } }
  sackAnims=sackAnims.filter(S=>!S.done); }
function checkSacks(){ if(!sackPlan||opened.has('G'+sx+','+sy)) return; for(let y=0;y<SH;y++) for(let x=0;x<SW;x++) if(sackPlan[y][x]==='Ю'&&grid[y][x]!=='Ѫ') return;
  opened.add('G'+sx+','+sy); openGates(); SFX.puzzle(); shake=5; showToast('¡LOS SACOS EN SUS PLACAS!','la verja del norte se abre'); save(); }
function drawSacks(){ for(const S of sackAnims){ drawShadow(S.x+8,S.y+15,6); ctx.drawImage(sackTile(),Math.round(S.x),Math.round(S.y)-((S.t>>1)&1)); } }

/* ---------- las baldosas ---------- */
function troughTile(e,plate){ return cached('trough'+e+(plate?1:0),g=>{ R(g,0,0,16,16,'#4a321c'); // el foso: tablones hundidos y harina
  for(let y=1;y<16;y+=5){ R(g,0,y,16,1,'#3a2614'); R(g,0,y+1,16,1,'#5a3e24'); }
  for(const [x,y] of [[3,3],[11,8],[6,12],[13,2]]) PX(g,x,y,'#d8ccb0');
  if(e&1){ R(g,0,0,16,2,'#2a1a0c'); R(g,0,2,16,1,'#7a5a3a'); } if(e&4){ R(g,0,14,16,2,'#8a6a44'); R(g,0,15,16,1,'#2a1a0c'); } // el borde de la pasarela
  if(e&8){ R(g,0,0,2,16,'#2a1a0c'); R(g,2,0,1,16,'#6a4a2a'); } if(e&2){ R(g,14,0,2,16,'#2a1a0c'); R(g,13,0,1,16,'#6a4a2a'); }
  if(plate){ R(g,3,3,10,10,PAL.k); R(g,4,4,8,8,'#8a6a44'); R(g,4,4,8,1,'#b89060'); R(g,5,5,6,6,'#6a4a2a'); R(g,6,7,4,2,'#e8dcc0'); } }); } // la placa, con un saquito pintado
function sackTile(){ return cached('sack',g=>{ grid16(g,[
"................",
".......kk.......",
"......kTTk......",
".....kkTTkk.....",
"....kbWWWWbk....",
"...kbWWWWWWbk...",
"...kbWWWWWWbk...",
"..kbWWfWWfWWbk..",
"..kbWWWffWWWbk..",
"..kbWWWffWWWbk..",
"..kbWWfWWfWWbk..",
"..kbbWWWWWWbbk..",
"...kbbbbbbbbk...",
"....kkkkkkkk....",
"................",
"................"],{T:'#6a4a2a',W:'#d8c09a',b:'#a88a62',f:'#8a6a44'}); PX(g,6,4,'#f4ecd8'); PX(g,7,4,'#f4ecd8'); R(g,6,5,1,2,'#efe4cc'); }); }
function millPostTile(){ return cached('millpost',g=>{ R(g,4,1,8,14,PAL.k); R(g,5,2,6,12,'#8a5a30'); R(g,5,2,2,12,'#b07a44'); R(g,9,2,2,12,'#6a4222'); R(g,4,4,8,1,'#3a2410'); R(g,4,11,8,1,'#3a2410'); R(g,3,14,10,2,'#2a1a0c'); }); }
function wheelPitTile(){ return cached('wheelpit',g=>{ R(g,0,0,16,16,'#3a2a1c'); R(g,1,1,14,14,'#2a1c10'); for(let i=0;i<4;i++) PX(g,3+i*3,3+((i*5)%9),'#4a3624'); }); }
{ const G0=drawGround; drawGround=function(g,rows,x,y,ch,opts,f){
  if(ch==='ш'||ch==='Ю'||ch==='Ѫ'){ const t=c=>c==='ш'||c==='Ю'||c==='Ѫ'||c==='Ѳ', e=edgesOf(rows,x,y,c=>!t(c)); g.drawImage(troughTile(e&15,ch==='Ю'||(ch==='Ѫ'&&sackPlan&&sackPlan[y]&&sackPlan[y][x]==='Ю')),x*16,y*16); if(ch==='Ѫ') g.drawImage(sackTile(),x*16,y*16); return; }
  return G0(g,rows,x,y,ch,opts,f); }; }
{ const O0=drawObject; drawObject=function(g,rows,x,y,ch,opts,f,fg){
  if(ch==='Ѳ'){ const t=c=>c==='ш'||c==='Ю'||c==='Ѫ', e=edgesOf(rows,x,y,c=>!t(c)&&c!=='Ѳ'); g.drawImage(troughTile(e&15,false),x*16,y*16); g.drawImage(millPostTile(),x*16,y*16); return; }
  if(ch==='Я'){ g.drawImage(wheelPitTile(),x*16,y*16); return; }
  return O0(g,rows,x,y,ch,opts,f,fg); }; }

/* ---------- cada fotograma ---------- */
{ const U0=updMill; updMill=function(){ U0(); updWheel(); updAxle(); updSacks(); tornadoMill(); }; }
{ const B0=drawMillBack; drawMillBack=function(){ B0(); drawWheel(); drawWheelGates(); drawAxle(); drawSacks(); }; }
/* el mapa del zurrón muestra hacia dónde señala la rueda: en su sala, una ruedecita con el aspa roja */
addEventListener('DOMContentLoaded',()=>{ const M0=drawDungeonMap; drawDungeonMap=function(dk){ M0(dk); if(dk!=='molino'||!(visited.has(WHEEL_ROOM)||dmaps.has('molino'))) return;
  const rooms=dungeonRooms(dk), xs=rooms.map(k=>+k.split(',')[0]), ys=rooms.map(k=>+k.split(',')[1]), x0=Math.min(...xs), x1=Math.max(...xs), y0=Math.min(...ys), y1=Math.max(...ys);
  const cw=24, ch=17, gap=4, W=(x1-x0+1)*cw+(x1-x0)*gap, H=(y1-y0+1)*ch+(y1-y0)*gap, ox=80-(W>>1), oy=32+Math.max(0,(84-H)>>1), [wx,wy]=WHEEL_ROOM.split(',').map(Number);
  const cx=ox+(wx-x0)*(cw+gap)+(cw>>1), cy=oy+(wy-y0)*(ch+gap)+(ch>>1);
  ctx.fillStyle=PAL.k; ctx.fillRect(cx-4,cy-4,9,9); ctx.fillStyle='#5a3a1a'; ctx.fillRect(cx-3,cy-3,7,7);
  const D=[[0,-1],[1,0],[0,1],[-1,0]]; D.forEach(([dx,dy],p)=>{ ctx.fillStyle=p===wheelPos?'#ff6048':'#e8dcc0'; for(let r=1;r<=3;r++) ctx.fillRect(cx+dx*r,cy+dy*r,1,1); });
  ctx.fillStyle='#b08050'; ctx.fillRect(cx,cy,1,1); }; }); // (el zurrón se carga después: se envuelve al acabar de cargar)
