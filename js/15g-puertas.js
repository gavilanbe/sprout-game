'use strict';
/* ============================================================
   PUERTAS, CUEVAS Y ESCALERAS: entrar y salir con peso.
   Antes, placeAt te soltaba de golpe en la otra pantalla. Ahora cada
   travesía es una coreografía corta (~1 s) con el control bloqueado:
   1) ENTRAR. Sprout camina solo hasta el hueco: la puerta se abre con su
      crujido y él se mete en el vano, que lo recorta y se lo traga en
      sombra; en la escalera baja escalón a escalón hasta hundirse; por la
      salida de una sala o de una mazmorra baja hasta perderse por el borde.
   2) La pantalla se cierra en ese sitio: iris sobre la puerta, fundido
      tramado a negro (cueva, escalera) o a blanco (salir a la luz del día).
   3) LLEGAR. La pantalla nueva se abre desde el hueco por el que sale y, a
      media apertura, él ya asoma: por el vano de la puerta (que se cierra
      detrás), por la boca de la cueva, subiendo la escalera o entrando por
      el borde de abajo de la sala. Unos pasos con polvo, el cartel del
      sitio entrando, y vuelve el control.
   Cada sitio suena y se ve distinto: crujido y luz cálida en las casas,
   eco y frío en las cuevas, fogonazo de día al salir de una mazmorra.
   startDoor(nx,ny,px,py,dir) lo llama placeAt (09) en pleno juego.
   ============================================================ */
let door=null;
const DOOR_T={walk:16,out:15,in:14,lead:5,overlap:6}; // entrar · cierre · apertura · la salida arranca con la apertura a medias · el cierre empieza antes de que acabe de entrar
const DOOR_OPEN={door:{x:4,y:3,w:8,bottom:14},cave:{x:4,y:5,w:8,bottom:16},mat:{x:1,y:0,w:14,bottom:16}}; // el vano de cada hueco dentro de su casilla
const DOOR_FX={plain:['iris','iris'],door:['iris','iris'],room:['iris','iris'],cave:['dark','dark'],stairs:['dark','dark'],inner:['dark','dark'],up:['dark','dark'],daylight:['light','light'],climb:['light','light']};
const DOOR_WALK_TINT={door:1,cave:1,stairs:1,inner:1,up:1,daylight:1,climb:.5}; // cuánto se lo traga el hueco al entrar
const DOOR_TINT={room:.7,cave:.8,stairs:.8,inner:.8,up:.7,daylight:.8,climb:.6}; // con cuánta sombra (o deslumbre) llega
const doorBright=k=>k==='daylight'||k==='climb'; // al salir al día deslumbra: blanco en vez de sombra
const DOOR_IN=k=>k*(1.5-k*.5); // entra andando (ya traía el paso) y se asienta

/* ¿qué clase de sitio es? se mira lo que tienes delante o bajo los pies */
function doorKind(nx,ny){ const ft=facingTile(), tx=(player.x+8)>>4, ty=(player.y+13)>>4, here=grid[ty]&&grid[ty][tx], r=regionOf(sx,sy), out=['valle','norte','marisma'].includes(regionOf(nx,ny)); // la misma casilla que mira updExits
  if(ft&&ft[2]==='D') return {kind:'door',tile:[ft[0],ft[1]]};
  if(ft&&ft[2]==='G') return {kind:'cave',tile:[ft[0],ft[1]]};
  if(here==='>') return {kind:'stairs',tile:[tx,ty]};
  if(here==='x'){ if(r==='casa') return {kind:'room',tile:[tx,ty]}; if(!out) return {kind:'inner',tile:[tx,ty]}; return {kind:r==='secreto'?'up':'daylight',tile:[tx,ty]}; }
  if((sx===15&&sy===0)||(sx===1&&sy===-3)) return {kind:'climb',tile:null};
  return {kind:'plain',tile:null}; }
function doorHole(ch,tx,ty){ const o=DOOR_OPEN[ch==='D'?'door':ch==='G'?'cave':'mat']; return {x:tx*16+o.x,y:ty*16+o.y,w:o.w,bottom:ty*16+o.bottom}; }

function startDoor(nx,ny,px,py,dir){ if(!MAPS[nx+','+ny]) return false;
  const K=doorKind(nx,ny), T=K.tile;
  const P=door={nx,ny,px,py,dir,kind:K.kind,tile:T,ph:'walk',t:0,ct:0,at:-1,x0:player.x,y0:player.y,walkT:DOOR_T.walk,hole:null,floor:null,lip:null,step:0,walked:0};
  if((K.kind==='door'||K.kind==='cave')&&T){ // se mete en el vano
    P.hole=doorHole(K.kind==='door'?'D':'G',T[0],T[1]); P.x1=T[0]*16; P.y1=T[1]*16+(K.kind==='door'?-4:-3); P.cx=T[0]*16+8; P.cy=T[1]*16+10; }
  else if(K.kind==='stairs'&&T){ // se alinea con el primer peldaño y baja
    P.x1=T[0]*16; P.ya=T[1]*16-9; P.lip=P.ya+16; P.walkT=17; P.cx=T[0]*16+8; P.cy=T[1]*16+8; }
  else if(T&&(K.kind==='room'||K.kind==='daylight'||K.kind==='up'||K.kind==='inner')){ // las salidas están abajo: baja por el hueco hasta perderse
    let a=T[0], b=T[0]; while(grid[T[1]][a-1]==='x') a--; while(grid[T[1]][b+1]==='x') b++;
    P.x1=clamp(player.x,a*16,b*16); P.floor=Math.min(128,T[1]*16+16); P.y1=P.floor-3; P.walkT=18; player.dir=0;
    P.cx=P.x1+8; P.cy=Math.min(124,P.floor-6); }
  else { const d=DIRV[player.dir]; P.x1=player.x+d[0]*14; P.y1=player.y+d[1]*14; P.cx=clamp(player.x+8,8,152); P.cy=clamp(player.y+10,8,120); }
  state='door'; keys.fire=keys.alt=false; player.atk=player.spin=player.charge=0;
  doorSfx(K.kind,'go'); return true; }

/* por dónde sale en la pantalla nueva: el hueco que hay junto a su punto de llegada */
function doorArrive(P){ const px=P.px, py=P.py, col=(px+8)>>4, feet=(py+12)>>4, at=(x,y)=>grid[y]&&grid[y][x];
  P.hole=P.floor=P.lip=P.outDoor=null; P.mode='plain'; P.step=0; let x0=px, y0=py, wx, wy;
  if(P.dir===0) for(let k=1;k<=2;k++){ const ty=feet-k, ch=at(col,ty); // sale hacia abajo por una puerta, una cueva o un vano
    if(ch==='D'||ch==='G'||ch==='x'){ P.mode='hole'; P.hole=doorHole(ch,col,ty); P.outDoor=ch==='D'?[col,ty]:null; x0=col*16; y0=ty*16+(ch==='D'?0:ch==='G'?1:-2); break; } }
  if(P.mode==='plain') for(const [dx,dy] of [[0,-1],[0,-2],[1,0],[-1,0],[1,-1],[-1,-1]]){ const tx=col+dx, ty=feet+dy; // sube por una escalera de al lado
    if(at(tx,ty)==='>'){ P.mode='rise'; P.rx=tx*16; P.ry=ty*16-9; P.lip=P.ry+16; x0=P.rx; y0=P.lip; break; } }
  if(P.mode==='plain'&&P.dir===1){ let fl=128; for(let k=0;k<=2;k++) if(at(col,feet+k)==='x'){ fl=Math.min(128,(feet+k+1)*16); break; } // entra por el hueco de abajo: asoma por el borde
    if(fl-7-py<=48){ P.mode='floor'; P.floor=fl; y0=fl-7; } }
  if(P.mode==='plain'&&P.dir===0&&py<=24){ P.mode='edge'; y0=-12; } // baja desde el borde de arriba
  if(P.mode==='plain'){ const d=DIRV[P.dir]; x0=px-d[0]*10; y0=py-d[1]*10; }
  P.sx0=x0; P.sy0=y0; [wx,wy]=P.mode==='rise'?[P.rx,P.ry]:[x0,y0];
  P.exitT=clamp(Math.round(8+Math.hypot(px-wx,py-wy)*.4),16,26);
  P.cx=clamp(wx+8,4,156); P.cy=clamp(wy+10,4,124); }

function updDoor(){ const P=door; if(!P){ state='play'; return; } P.t++; updParts();
  const ox=player.x, oy=player.y;
  if(P.ph==='walk'){
    if(P.kind==='stairs'&&P.lip!==null){ // baja escalón a escalón: se alinea con la escalera y se hunde
      if(P.t<=5){ const k=CA_EASE.io(P.t/5); player.x=lerp(P.x0,P.x1,k); player.y=lerp(P.y0,P.ya,k); }
      else { player.dir=0; const s=Math.min(4,1+Math.floor((P.t-6)/3)); if(s!==P.step){ P.step=s; player.y=P.ya+s*4; player.frame=s&1?1:3; doorSfx('stairs','stair',s); } } }
    else { const k=(P.hole?CA_EASE.io:CA_EASE.lin)(Math.min(1,P.t/P.walkT)); player.x=lerp(P.x0,P.x1,k); player.y=lerp(P.y0,P.y1,k); }
    if(P.t===3&&P.kind==='door') doorSfx('door','open');
    if(P.t>P.walkT-DOOR_T.overlap&&++P.ct===1) doorSfx(P.kind,'close'); // la pantalla se va cerrando mientras acaba de entrar
    if(P.t>=P.walkT){ P.ph='out'; P.t=0; } }
  else if(P.ph==='out'){ if(++P.ct>=DOOR_T.out){ // a oscuras (o en blanco): se cambia de pantalla
      placeAtNow(P.nx,P.ny,P.px,P.py,P.dir); if(bgDirty) rebuildBg(); doorArrive(P);
      player.x=P.sx0; player.y=P.sy0; player.dir=P.mode==='rise'?0:P.dir; player.frame=0; P.walked=0;
      P.ph='in'; P.t=0; P.at=0; doorSfx(P.kind,'arrive'); if(P.outDoor) doorSfx('door','open'); } }
  else { P.at++;
    if(P.ph==='in'){ if(P.t>=DOOR_T.lead){ P.ph=P.mode==='rise'?'rise':'exit'; P.t=0; } }
    else if(P.ph==='rise'){ const s=Math.min(4,1+Math.floor((P.t-1)/3)); // sube escalón a escalón
      if(s!==P.step){ P.step=s; player.y=P.lip-s*4; player.frame=s&1?1:3; doorSfx('stairs','stair',4-s); }
      if(P.t>=12){ P.ph='exit'; P.t=0; P.sx0=P.rx; P.sy0=P.ry; } }
    else if(P.ph==='exit'){ const k=(P.mode==='floor'||P.mode==='edge'?DOOR_IN:CA_EASE.io)(Math.min(1,P.t/P.exitT)), dx=P.px-P.sx0, dy=P.py-P.sy0;
      player.x=P.sx0+dx*k; player.y=P.sy0+dy*k; player.dir=Math.abs(dx)>Math.abs(dy)?(dx>0?3:2):(dy>0?0:1);
      if(!P.dusted&&dy<=0&&(P.mode==='floor'?player.y+12<=P.floor-6:P.t>=Math.round(P.exitT*.4))){ P.dusted=true; stepDustAt(player.x+8,player.y+15,.5); } // el primer paso fuera del hueco levanta polvo (si baja hacia nosotros no: le taparía el cuerpo)
      if(P.t===P.exitT-2) stepDustAt(player.x+8,player.y+15,1); // y al pararse
      if(placeBanner&&P.at>DOOR_T.in&&placeBanner.t>1) placeBanner.t--; // el cartel del sitio entra mientras sale
      if(P.outDoor&&P.t===P.exitT-2) doorSfx('door','shut');
      if(P.t>=P.exitT){ player.x=P.px; player.y=P.py; player.dir=P.dir; player.frame=0; door=null; state='play'; saveFlash=45; } } } // loadScreen ya guardó: la bellota avisa al llegar, como siempre
  if(door&&(P.ph==='exit'||(P.ph==='walk'&&P.lip===null))){ const d=Math.hypot(player.x-ox,player.y-oy); // el paso sigue al camino andado
    if(d>.05){ P.walked+=d; const fr=Math.floor(P.walked/5)&3; if(fr!==player.frame&&!(fr&1)) doorSfx(P.kind,'step'); player.frame=fr; } }
  keys.fire=keys.alt=false; }
function stepDustAt(x,y,spread){ for(let i=0;i<2;i++) parts.push({k:'dust',x:x+(i?3:-3),y,vx:(i?1:-1)*(.15+spread*.25),vy:-.06,life:14,max:14,r:1+(i&1),col:groundDustCol(),nog:true}); } // hacia los lados, a ras de suelo: no le sube por el cuerpo

/* ---------- el jugador durante la travesía: recortado por el hueco y tragado por la sombra ---------- */
const DOOR_TMP=mkCanvas(16,16), DOOR_TG=DOOR_TMP.getContext('2d');
function doorDepth(P){ const PH=P.ph; // 0 a la vista · 1 tragado del todo (sombra, o blanco al salir al día)
  if(PH==='walk'){ const w=DOOR_WALK_TINT[P.kind]||0; if(!w) return 0;
    if(P.kind==='stairs'&&P.lip!==null) return w*P.step/4;
    if(P.hole) return w*clamp((P.hole.bottom-(player.y+12))/8,0,1);
    if(P.floor) return w*clamp((player.y+16-P.floor)/14,0,1);
    return w*Math.min(1,P.t/P.walkT)*.5; }
  if(PH==='out') return DOOR_WALK_TINT[P.kind]||0;
  const a=DOOR_TINT[P.kind]||0;
  if(PH==='in') return a;
  if(PH==='rise') return a*(1-P.step/8);
  return (P.mode==='rise'?a*.5:a)*(1-Math.min(1,P.t/(P.exitT*.7))); }
function drawDoorPlayer(){ const P=door; if(!P) return false; const PH=P.ph, arriving=PH!=='walk'&&PH!=='out';
  if(P.outDoor&&arriving) drawDoorOpen(P.outDoor[0],P.outDoor[1],PH==='exit'?clamp((P.exitT-1-P.t)/4,0,1):1,true); // la puerta de la calle, abierta mientras sale; se cierra detrás
  if(P.kind==='door'&&!arriving&&P.tile) drawDoorOpen(P.tile[0],P.tile[1],PH==='out'?1:Math.min(1,P.t/5),true);
  if(P.ct>DOOR_T.out-3&&!arriving) return true; // a oscuras ya no se ve
  const s=P_SPRITES[player.dir][player.frame||0], x=Math.round(player.x), y=Math.round(player.y), dep=doorDepth(P), H=P.hole;
  ctx.save(); ctx.beginPath(); // lo de delante del muro tapa: solo se le ve por el vano, o por encima del borde por el que entra o sale
  if(H){ ctx.rect(0,H.bottom,160,128-H.bottom); ctx.rect(H.x,H.y,H.w,H.bottom-H.y); }
  else if(P.lip!==null&&PH!=='exit') ctx.rect(0,0,160,P.lip);
  else if(P.floor) ctx.rect(0,0,160,P.floor);
  else ctx.rect(0,0,160,128);
  ctx.clip();
  if(dep<.6&&PH!=='rise'&&!(P.lip!==null&&PH!=='exit')) drawShadow(x+8,y+15,Math.max(2,Math.round(6*(1-dep))));
  DOOR_TG.clearRect(0,0,16,16); DOOR_TG.drawImage(s,0,0);
  if(dep>0){ DOOR_TG.globalCompositeOperation='source-atop'; DOOR_TG.fillStyle=doorBright(P.kind)?'rgba(255,250,232,'+(dep*.75).toFixed(2)+')':'rgba(12,8,16,'+(dep*.85).toFixed(2)+')'; DOOR_TG.fillRect(0,0,16,16); DOOR_TG.globalCompositeOperation='source-over'; }
  ctx.drawImage(DOOR_TMP,x,y); ctx.restore();
  return true; }
/* la puerta de madera abierta (k 0..1): el vano oscuro con la luz de la casa, que se derrama al suelo, y la hoja girando */
function drawDoorOpen(tx,ty,k,warm){ if(k<=0) return; const x=tx*16, y=ty*16, w=Math.max(1,Math.round(6*k));
  ctx.fillStyle='#1c1008'; ctx.fillRect(x+5,y+3,w,10);
  if(warm&&w>2){ ctx.fillStyle='rgba(255,196,110,.35)'; ctx.fillRect(x+5,y+9,w,4); ctx.fillStyle='rgba(255,220,150,.5)'; ctx.fillRect(x+5,y+12,w,1);
    for(let i=0;i<5;i++){ ctx.fillStyle='rgba(255,210,130,'+((.24-i*.045)*k).toFixed(3)+')'; ctx.fillRect(x+5-(i>>1),y+14+i,w+(i>>1)*2,1); } } // la luz de dentro, en el umbral
  if(k<1){ ctx.fillStyle='#9a6434'; ctx.fillRect(x+5+w,y+3,Math.max(1,6-w),10); ctx.fillStyle='#6a3c1c'; ctx.fillRect(x+10,y+3,1,10); } // la hoja, aún girando
  else { ctx.fillStyle='#6a4020'; ctx.fillRect(x+4,y+3,1,10); } } // plegada contra la jamba

/* ---------- el cierre y la apertura de la pantalla ---------- */
const DOOR_PAT=[];
function doorPattern(level,col){ const key=col+level; let p=DOOR_PAT[key]; if(p) return p; const c=mkCanvas(4,4), g=c.getContext('2d'); g.fillStyle=col;
  for(let y=0;y<4;y++) for(let x=0;x<4;x++) if(BAYER4[y][x]<level) g.fillRect(x,y,1,1); p=ctx.createPattern(c,'repeat'); DOOR_PAT[key]=p; return p; }
function doorScreen(fx,k,cx,cy){ if(k<=0) return; k=Math.min(1,k);
  if(fx==='iris'){ const far=Math.hypot(Math.max(cx,160-cx),Math.max(cy,128-cy))+2, R=(1-k)*far; ctx.fillStyle='#000';
    for(let y=0;y<128;y++){ const dy=y+.5-cy, h=R*R-dy*dy; if(h<=0){ ctx.fillRect(0,y,160,1); continue; } const w=Math.sqrt(h), a=Math.round(cx-w), b=Math.round(cx+w); if(a>0) ctx.fillRect(0,y,a,1); if(b<160) ctx.fillRect(b,y,160-b,1);
      if(R>3&&k>.04){ ctx.fillStyle='rgba(255,214,140,.55)'; if(a>=0) ctx.fillRect(a,y,1,1); if(b<=159) ctx.fillRect(b-1,y,1,1); ctx.fillStyle='#000'; } } // el filo del iris, cálido
    return; }
  const level=Math.round(k*16), light=fx==='light', col=light?'#fffbee':'#06040a'; if(level>=16){ ctx.fillStyle=col; ctx.fillRect(0,0,160,128); return; }
  ctx.fillStyle=light?'rgba(255,251,238,'+(k*.3).toFixed(3)+')':'rgba(6,4,10,'+(k*.4).toFixed(3)+')'; ctx.fillRect(0,0,160,128); // se apaga (o se enciende) de fondo…
  ctx.fillStyle=doorPattern(level,col); ctx.fillRect(0,0,160,128); } // …y la trama se come los píxeles
/* un charco de luz (o de sombra) en el suelo, en bandas nítidas */
function doorGlow(cx,cy,r,rgb,a){ if(a<=0||r<1) return;
  for(let b=0;b<3;b++){ const R=r*(1-b*.3); ctx.fillStyle='rgba('+rgb+','+(a/3).toFixed(3)+')';
    for(let y=Math.floor(cy-R*.6);y<=Math.ceil(cy+R*.6);y++){ const dy=(y+.5-cy)/.6, h=R*R-dy*dy; if(h<=0||y<0||y>=128) continue; const w=Math.sqrt(h), a0=Math.round(cx-w); ctx.fillRect(a0,y,Math.round(cx+w)-a0,1); } } }
function drawDoor(){ const P=door; if(!P) return; const [fo,fi]=DOOR_FX[P.kind]||DOOR_FX.door;
  if(P.ph==='walk'){ const k=Math.min(1,P.t/P.walkT); // algo de luz o de oscuridad asoma por el hueco antes de entrar
    if((P.kind==='daylight'||P.kind==='room')&&P.floor) doorGlow(player.x+8,P.floor-2,12+k*16,'255,250,220',(P.kind==='room'?.3:.55)*k);
    if(P.kind==='cave'&&P.hole) doorGlow(P.cx,P.hole.bottom-2,8+k*8,'10,8,20',.35*k);
    if(P.kind==='stairs'&&P.lip!==null) doorGlow(P.cx,P.cy+2,6+k*6,'10,8,20',.3*k); }
  if(P.ct>0&&P.at<0) doorScreen(fo,CA_EASE.io(Math.min(1,P.ct/DOOR_T.out)),P.cx,P.cy);
  else if(P.at>=0&&P.at<DOOR_T.in) doorScreen(fi,1-CA_EASE.out(P.at/DOOR_T.in),P.cx,P.cy);
  if(fi==='light'&&P.at>=DOOR_T.in&&P.at<DOOR_T.in+10){ ctx.fillStyle='rgba(255,251,238,'+(.3*(1-(P.at-DOOR_T.in)/10)).toFixed(2)+')'; ctx.fillRect(0,0,160,128); } } // el fogonazo de día se apaga despacio

/* ---------- el sonido de cada sitio ---------- */
function doorSfx(kind,what,i){ const a=audio(), t=a.currentTime;
  if(what==='step'){ noise(.03,kind==='cave'||kind==='stairs'||kind==='inner'?.03:.022,false,t,kind==='room'||kind==='door'?1400:700); return; }
  if(what==='stair'){ beep('triangle',260-(i||0)*30,220-(i||0)*30,.06,.035,t); noise(.03,.02,false,t,600); return; }
  if(what==='open'){ swish(.22,.035,260,620,380,t,2); beep('triangle',190,150,.14,.025,t+.02); return; } // el crujido de la puerta
  if(what==='shut'){ beep('triangle',120,64,.1,.06,t); noise(.05,.05,false,t,500); return; }
  if(what==='go'){ if(kind==='cave'){ noise(.5,.025,false,t,420); [0,.12,.24].forEach((d,k)=>beep('triangle',180-k*20,120-k*16,.18,.03/(k+1),t+d)); } // el eco de la cueva
    else if(kind==='daylight'||kind==='climb'){ swish(.4,.04,500,2600,1600,t); }
    return; }
  if(what==='close'){ if(kind==='door'||kind==='room') swish(.18,.03,700,300,200,t); else noise(.25,.02,false,t,kind==='daylight'?5000:300); return; }
  if(what==='arrive'){ if(kind==='daylight'||kind==='climb'){ beep('square',f(84),0,.08,.018,t); swish(.35,.03,3000,1600,900,t); } else if(kind==='cave'||kind==='stairs'||kind==='up') noise(.4,.02,false,t,380); } }
