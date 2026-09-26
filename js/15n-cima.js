'use strict';
/* ============================================================
   LA CIMA: el rescate de Cierzo (docs/TERCERA-PASADA.md §6)
   · El Viento no pelea: está envuelto en un capullo gris (la tormenta del Olvido) atado con cuatro hilos a las
     rocas de la cima. Sus barridos, sus carámbanos y los soplidos que apagan braseros son involuntarios.
   · Los hilos están cubiertos de polillas que los zurcen. Las polillas van a la luz: enciende un brasero con el
     farol y se lanzan a él; el hilo se queda solo y la Hoja (o el tornadito, o la llamarada) lo corta. Una bomba
     cerca de un hilo también las espanta, un momento.
   · Al principio las polillas se queman en el fuego. Cuando quedan dos hilos, aprenden: apagan el brasero y
     vuelven. Hay que encender uno de cebo en la otra punta y cortar mientras vuelan hacia allí.
   · Con el cuarto hilo el capullo se abre: Cierzo cae, sin nombre. Pantalla de nombre: se escribe, letra a letra.
   · Al oírlo, la revelación (BOSS_BYE.viento): la tormenta no se va; en ella se abren dos ocelos. EL OLVIDO sale
     y baja al valle. El último soplo de Cierzo te lleva a la plaza (BOSS_OUTRO.viento, 15l, con otro destino).
   Solo para el Viento de verdad: su eco (post-juego) sigue siendo la pelea de siempre (12-bosses).
   ============================================================ */
const CIMA_ANCH=[[40,22],[120,22],[56,86],[104,86]];   // las rocas donde se clavan los hilos (px): arriba a la izq., arriba a la dcha., abajo…
const CIMA_BRAZ=[[1,1],[8,1],[1,6],[8,6]];              // los cuatro braseros (casillas)
const COC={x:80,y:50};                                   // el centro del capullo
const CIMA_NOTES=[76,79,76,74];                          // cada hilo cortado suena a una nota de la nana: mi sol mi re
const CIMA_SFX={
  snap(){ if(!AC) return; const t=AC.currentTime; noise(.06,.06,true,t,5200); beep('square',f(88),f(64),.1,.03,t); noise(.18,.03,false,t+.03,900); },
  fizz(){ if(!AC) return; noise(.25,.03,true,undefined,3000); },
  smother(){ if(!AC) return; const t=AC.currentTime; noise(.3,.035,false,t,500); beep('triangle',f(48),f(36),.3,.04,t); },
  unravel(){ if(!AC) return; const t=AC.currentTime; swish(1.2,.04,700,2600,900); [64,67,71,76].forEach((m,i)=>beep('triangle',f(m),0,.5,.028,t+.3+i*.12)); },
  carve(i){ if(!AC) return; const t=AC.currentTime; noise(.05,.04,true,t,6000); beep('triangle',f(NANA_NOTES[i%NANA_NOTES.length][0]),0,.45,.034,t+.02); },
  blowLetter(){ if(!AC) return; swish(.4,.035,900,2400,1200); },
};
/* ---------- el capullo ---------- */
function makeCocoon(b){ Object.assign(b,{cocoon:true,x:COC.x-16,y:COC.y-20,st:'capullo',t:0,left:4,hp:4,maxHp:4,fly:[],spawnT:200,ice:90,blowT:380,sweepT:190,sweep:null,calmT:0,openT:0,hits:0,
  threads:CIMA_ANCH.map((a,i)=>({i,a,cut:0,m:[.34,.58,.82].map(t=>({t,dir:(i+t*10)&1?1:-1,sp:.0016+Math.random()*.0016}))}))}); }
function cocPhase(b){ return b.left>=3?1:b.left===2?2:3; }
function threadRoot(th){ const dx=th.a[0]-COC.x, dy=th.a[1]-COC.y, d=Math.hypot(dx,dy); return [COC.x+dx/d*15,COC.y+dy/d*12]; }
function threadAt(th,t){ const [x0,y0]=threadRoot(th), [x1,y1]=th.a, sag=6+Math.sin(tick*.05+th.i*1.7)*2, mx=(x0+x1)/2, my=(y0+y1)/2+sag, u=1-t;
  return [u*u*x0+2*u*t*mx+t*t*x1, u*u*y0+2*u*t*my+t*t*y1]; }
function brazierPos(j){ const [x,y]=CIMA_BRAZ[j]; return [x*16+8,y*16+3]; }
function brazierLit(j){ const [x,y]=CIMA_BRAZ[j]; return grid[y]&&grid[y][x]===';'; }
function cocMothCount(b){ let n=b.fly.length; for(const th of b.threads) if(!th.cut) n+=th.m.length; return n; }
/* al encender un brasero (lightTorch, 09): todas las polillas de los hilos se lanzan a la luz más cercana */
function cocoonBrazierLit(tx,ty){ const b=boss; if(!b||!b.cocoon) return; SFX.brazier();
  for(const th of b.threads){ if(th.cut) continue; for(const m of th.m){ const [x,y]=threadAt(th,m.t); b.fly.push({x,y,vx:0,vy:-.6,home:th.i,st:'fly',t:0,ph:(Math.random()*16)|0}); } th.m=[]; }
  const j=CIMA_BRAZ.findIndex(([x,y])=>x===tx&&y===ty); if(j>=0) b['smo'+j]=0;
  if(!b.lightToast){ b.lightToast=true; showToast('¡LA LUZ!','las polillas sueltan los hilos'); } } // el aviso, solo la primera vez
function cocScare(b,x,y){ for(const th of b.threads){ if(th.cut) continue; const keep=[]; for(const m of th.m){ const [mx,my]=threadAt(th,m.t); if(Math.hypot(mx-x,my-y)<34) b.fly.push({x:mx,y:my,vx:(mx-x)*.06,vy:(my-y)*.06-.5,home:th.i,st:'scare',t:0,ph:(Math.random()*16)|0}); else keep.push(m); } th.m=keep; } }
function cocCutThread(b,th,x,y){ th.cut=tick; b.left--; b.hp=b.left; b.calmT=28; hitStop=Math.max(hitStop,5); shake=Math.max(shake,7); screenFlash(4,'#ece6f4'); CIMA_SFX.snap();
  if(AC){ const t=AC.currentTime+.08; beep('triangle',f(CIMA_NOTES[3-b.left]||76),0,.6,.035,t); beep('p125',f((CIMA_NOTES[3-b.left]||76)+12),0,.3,.008,t); }
  for(let i=0;i<14;i++){ const a=Math.random()*6.283, s=.8+Math.random()*1.8; parts.push({k:'dust',x,y,vx:Math.cos(a)*s,vy:Math.sin(a)*s-.4,life:26,max:26,r:1+(i%3===0?1:0),col:i&1?OLV.dust:OLV.wingL,nog:true}); }
  parts.push({x,y,vx:0,vy:0,life:12,col:'#ffffff',ring:true,r:14,nog:true});
  showToast(b.left?'¡UN HILO MENOS!':'¡EL ÚLTIMO HILO!',b.left?(b.left+(b.left===1?' hilo':' hilos')+' todavía'):'el capullo se abre');
  if(b.left===2) pendingSay=["(Las polillas han aprendido: ahora apagan el fuego en cuanto llegan, y vuelven a su hilo.)"];
  if(b.left===0){ b.st='abre'; b.openT=0; CIMA_SFX.unravel(); enemies=[]; projs=[]; b.sweep=null; } }
function cocTryCut(b,box){ for(const th of b.threads){ if(th.cut||th.m.length) continue;
  for(let t=.14;t<=1;t+=.04){ const [x,y]=threadAt(th,t); if(rectsHit(box,[x-2,y-2,4,4])){ cocCutThread(b,th,x,y); return true; } } } return false; }
function updCocoon(){
  const b=boss; b.t++; if(b.flash>0) b.flash--; if(b.calmT>0) b.calmT--;
  if(b.st==='abre'){ updCocoonOpen(b); return; }
  if(b.st==='caido'){ return; }
  const ph=cocPhase(b), cx=COC.x, cy=COC.y;
  // las polillas de los hilos van y vienen, zurciendo
  for(const th of b.threads){ if(th.cut) continue; for(const m of th.m){ m.t+=m.sp*m.dir; if(m.t>.9||m.t<.16) m.dir*=-1; } }
  // las que vuelan: a la luz más cercana; ahí se queman (al principio) o la apagan y vuelven (después)
  const lit=[0,1,2,3].filter(brazierLit);
  for(const m of b.fly){ m.t++;
    let tx, ty;
    if(m.st==='scare'){ m.vx*=.94; m.vy*=.94; if(m.t>50) m.st=lit.length?'fly':'return'; }
    if(m.st==='fly'||m.st==='orbit'){ if(!lit.length){ m.st='return'; }
      else { let best=lit[0], bd=1e9; for(const j of lit){ const [bx,by]=brazierPos(j), d=Math.hypot(bx-m.x,by-m.y); if(d<bd){ bd=d; best=j; } }
        const [bx,by]=brazierPos(best); m.j=best; if(bd<11) m.st='orbit';
        if(m.st==='orbit'){ m.a=(m.a||Math.random()*6)+.14; tx=bx+Math.cos(m.a)*6; ty=by-3+Math.sin(m.a*1.3)*4; m.burn=(m.burn||0)+1;
          if(ph===1&&m.burn>70+(m.ph*5)){ m.dead=true; olvPoof(m.x,m.y); CIMA_SFX.fizz(); } // al principio, se queman
          else if(ph>=2) b['smo'+best]=(b['smo'+best]||0)+1; }                                 // después, lo ahogan
        else { tx=bx; ty=by; } } }
    if(m.st==='return'){ let th=b.threads[m.home]; if(!th||th.cut){ th=b.threads.find(q=>!q.cut); if(!th){ m.dead=true; continue; } m.home=th.i; }
      const [hx,hy]=threadAt(th,.5); tx=hx; ty=hy; if(Math.hypot(hx-m.x,hy-m.y)<5){ th.m.push({t:.5,dir:1,sp:.0016+Math.random()*.0016}); m.dead=true; continue; } }
    if(tx!==undefined){ const ax=tx-m.x, ay=ty-m.y, ad=Math.hypot(ax,ay)||1, acc=m.st==='orbit'?.16:.09; m.vx+=ax/ad*acc; m.vy+=ay/ad*acc; }
    m.vy+=Math.sin((tick+m.ph*9)*.35)*.05; const sp=Math.hypot(m.vx,m.vy), max=m.st==='orbit'?1:1.25; if(sp>max){ m.vx*=max/sp; m.vy*=max/sp; } m.vx*=.97; m.vy*=.97; m.x+=m.vx; m.y+=m.vy; }
  b.fly=b.fly.filter(m=>!m.dead);
  for(const j of [0,1,2,3]){ if(ph>=2&&brazierLit(j)&&(b['smo'+j]||0)>=150){ const [x,y]=CIMA_BRAZ[j]; grid[y][x]=':'; markDirty(); b['smo'+j]=0; CIMA_SFX.smother(); // las polillas lo apagan
      for(let i=0;i<8;i++) parts.push({k:'smoke',x:x*16+8,y:y*16+2,vx:(Math.random()-.5)*.6,vy:-.4-Math.random()*.3,life:24,max:26,r:2+(i%2),col:i&1?'#8a8098':'#5a5068',nog:true});
      for(const m of b.fly) if(m.j===j) m.st='return'; } }
  // el capullo suelta polillas nuevas a los hilos
  if(--b.spawnT<=0){ b.spawnT=ph===1?230:ph===2?170:140; const open=b.threads.filter(q=>!q.cut&&q.m.length<3);
    if(open.length&&cocMothCount(b)<12){ const th=open[(Math.random()*open.length)|0]; th.m.push({t:.16,dir:1,sp:.0018+Math.random()*.0014}); const [x,y]=threadAt(th,.16); for(let i=0;i<4;i++) parts.push({k:'mote',x,y,vx:(Math.random()-.5)*.4,vy:-.2,life:30,max:30,sway:Math.random()*6,col:OLV.dust,nog:true}); OLV_SFX.flutter(.5); } }
  // cortar: la Hoja, el tornadito, la llamarada del farol; una bomba espanta a las polillas de un hilo
  if(meleeActive()) cocTryCut(b,meleeBox());
  for(const w of windProjs){ if(cocTryCut(b,[w.x-6,w.y-6,12,12])) w.t=0; }
  for(const q of flares) cocTryCut(b,[q.x-5,q.y-8,10,10]);
  for(const bo of bombs) if(bo.t===1) cocScare(b,bo.x+8,bo.y+8);
  // lo involuntario: barre tu fila (salta), caen carámbanos, sus soplos apagan braseros
  if(!b.sweep&&--b.sweepT<=0){ b.sweep={st:'aim',t:ph===1?42:ph===2?34:28,y:clamp(player.y-6,8,96)}; }
  if(b.sweep){ const S=b.sweep; S.t--;
    if(S.st==='aim'){ S.y+=(clamp(player.y-6,8,96)-S.y)*.08; if(S.t<=0){ S.st='go'; S.x=player.x<80?-20:180; S.vx=player.x<80?(ph===1?3.4:4.2):-(ph===1?3.4:4.2); SFX.ehit(); } }
    else { S.x+=S.vx; if((tick&1)===0) parts.push({x:S.x,y:S.y+4+Math.random()*16,vx:-S.vx*.4,vy:(Math.random()-.5)*.4,life:12,col:(tick&2)?'#ffffff':'#cfe8ff',nog:true});
      if(player.inv===0&&jumpT===0&&Math.abs(player.x+8-S.x)<10&&player.y+12>S.y&&player.y+4<S.y+22) hurt(2,S.x-S.vx*4,player.y+8);
      if(S.x<-30||S.x>190){ b.sweep=null; b.sweepT=ph===1?200:ph===2?160:130; } } }
  if(ph>=2&&--b.ice<=0){ b.ice=ph===3?40:60; for(let i=0;i<(ph===3?3:2);i++) fallAt(player.x+8+(Math.random()-.5)*40,player.y+12+(Math.random()-.5)*28,44,true,2); }
  if(ph>=2&&--b.blowT<=0){ b.blowT=ph===3?260:340; vientoBlowOut(1); }
  // no se toca: el capullo empuja y hace daño
  const dx=player.x+8-cx, dy=player.y+10-cy, d=Math.hypot(dx,dy)||1;
  if(d<20&&player.inv===0&&jumpT===0){ hurt(2,cx,cy); player.kx=dx/d*3; player.ky=dy/d*3; }
  if((tick&1)===0){ const a=Math.random()*6.283; parts.push({x:cx+Math.cos(a)*22,y:cy+Math.sin(a)*16,vx:-Math.sin(a)*.8,vy:Math.cos(a)*.6,life:18,col:(tick&2)?OLV.dust:'#dff0ff',nog:true}); } // la ventisca gris gira
}
function updCocoonOpen(b){ b.openT++; const t=b.openT;
  for(const m of b.fly){ m.x+=m.vx=(m.vx||0)*1.02+(m.x<80?-.2:.2); m.y+=m.vy=(m.vy||0)-.05; } // se van
  if(t===2){ olvShakeOff(b); for(let i=0;i<30;i++){ const a=i/30*6.283, s=1+Math.random()*2; parts.push({k:'dust',x:COC.x,y:COC.y,vx:Math.cos(a)*s,vy:Math.sin(a)*s-.3,life:34,max:34,r:2,col:i&1?OLV.dust:OLV.wingL,nog:true}); } }
  if(t===40){ shake=Math.max(shake,4); SFX.bump(); for(let i=0;i<10;i++) parts.push({k:'dust',x:COC.x+(Math.random()-.5)*20,y:COC.y+22,vx:(Math.random()-.5)*1.4,vy:-.3,life:20,max:20,r:2,col:'#ffffff',nog:true}); }
  if(t===70){ b.st='caido'; b.fly=[];
    say(["(La ventisca gris se deshilacha. El Viento cae en la nieve, encogido.)"],()=>say(["—¿...Quién...?","—No me acuerdo de quién soy."],()=>startNombre(),'EL VIENTO')); } }
/* ---------- el dibujo ---------- */
function cocSilk(cx,cy,n,a0,alpha){ // la seda gris que lo envuelve: arcos que giran despacio, a píxeles sueltos
  for(let k=0;k<n;k++){ const rx=15+(k%3)*3, ry=11+(k%4)*2, rot=a0*(k&1?1:-1)+k*.8, c=Math.cos(rot), s=Math.sin(rot), col=[OLV.wingL,OLV.dust,OLV.wing,OLV.oceloL][k%4];
    ctx.globalAlpha=alpha; ctx.fillStyle=col;
    for(let i=0;i<48;i++){ const u=i/48*6.283; if(((i+k*5)%11)<3) continue; const ex=Math.cos(u)*rx, ey=Math.sin(u)*ry; ctx.fillRect(Math.round(cx+ex*c-ey*s),Math.round(cy+ex*s+ey*c),1,1); } }
  ctx.globalAlpha=1; }
function drawThread(th){ const pts=[]; for(let t=0;t<=1.0001;t+=.05) pts.push(threadAt(th,t));
  if(th.cut){ const u=tick-th.cut, rec=Math.min(1,u/14); // se parte: las dos mitades se recogen de golpe
    const half=(from,to,side)=>{ const n=Math.max(2,Math.round(pts.length*.5*(1-rec*.7))); for(let i=0;i<n-1;i++){ const a=pts[from+side*i], c=pts[from+side*(i+1)]; if(!a||!c) break;
        const droop=i*i*.08*rec, wig=Math.sin(tick*.2+i)*rec; ctx.fillStyle=OLV.wingD; ctx.fillRect(Math.round(a[0]+wig),Math.round(a[1]+droop)+1,1,1); ctx.fillStyle=OLV.wingL; ctx.fillRect(Math.round(a[0]+wig),Math.round(a[1]+droop),1,1); } };
    half(0,pts.length-1,1); half(pts.length-1,0,-1); return; }
  for(let i=0;i<pts.length-1;i++){ const [x0,y0]=pts[i], [x1,y1]=pts[i+1], n=Math.max(1,Math.round(Math.hypot(x1-x0,y1-y0)));
    for(let j=0;j<n;j++){ const x=Math.round(lerp(x0,x1,j/n)), y=Math.round(lerp(y0,y1,j/n)); ctx.fillStyle=OLV.ink; ctx.fillRect(x,y+1,1,1); ctx.fillStyle=((i+j)&3)?OLV.wingL:OLV.oceloL; ctx.fillRect(x,y,1,1); } }
  const [ax,ay]=th.a; ctx.fillStyle=OLV.wing; ctx.fillRect(ax-2,ay-1,4,3); ctx.fillStyle=OLV.wingL; ctx.fillRect(ax-1,ay-1,2,1); // el nudo en la roca
  for(const m of th.m){ const [x,y]=threadAt(th,m.t); ctx.drawImage(MOTH_S[MOTH_FLAP[((tick>>2)+((m.t*40)|0))&3]],Math.round(x-3),Math.round(y-4)); } }
function drawCocoon(b){
  const cx=COC.x, cy=COC.y;
  if(b.st!=='abre'&&b.st!=='caido') for(const th of b.threads) drawThread(th);
  if(b.st==='caido'||(b.st==='abre'&&b.openT>=40)){ const fy=Math.min(20,(b.st==='caido'?20:(b.openT-40)*.7)); drawShadow(cx,cy+22,10); drawWind(cx,cy+fy,{s:1,mood:'sad',f:(tick>>3)&7,flip:player.x+8>cx}); return; }
  const fall=b.st==='abre'?Math.min(20,Math.max(0,b.openT-20)*.6):0;
  drawShadow(cx,cy+24,14);
  const mood=b.calmT>0?'calm':(b.sweep&&b.sweep.st==='aim')?'blow':(((tick>>5)&3)===0?'sad':'howl');
  drawWind(cx,cy-2+fall+Math.round(Math.sin(tick*.1)),{s:1,mood,f:(tick>>2)&7,flip:player.x+8>cx,blink:((tick+17)%150)<6?1:0});
  const n=b.st==='abre'?Math.max(0,8-Math.floor(b.openT/5)):3+b.left*2, grow=b.st==='abre'?1+b.openT*.04:1;
  ctx.save(); ctx.translate(cx,cy); ctx.scale(grow,grow); cocSilk(0,0,n,tick*.012,b.st==='abre'?Math.max(0,1-b.openT/40):.95); ctx.restore(); // (la seda se abre: se aleja y se deshace)
  if(b.st!=='abre') for(let i=0;i<3;i++){ const u=tick*.02+i*2.1; ctx.drawImage(MOTH_S[MOTH_FLAP[(tick>>2)&3]],Math.round(cx+Math.cos(u)*16-3),Math.round(cy+Math.sin(u)*11-2)); } // polillas que la zurcen
}
function drawCocoonFx(b){ // por encima de la escena: las polillas que vuelan, el aviso y la pared del barrido, la barra de hilos
  for(const m of b.fly){ const near=m.st==='orbit'; if(near) glowAt(m.x,m.y,5,'rgba(255,200,120,.25)'); ctx.drawImage(MOTH_S[MOTH_FLAP[((tick+m.ph*3)>>1)&3]],Math.round(m.x-3),Math.round(m.y-2)); }
  const S=b.sweep; if(S){ if(S.st==='aim'){ ctx.fillStyle='rgba(232,80,80,'+(0.22+0.18*Math.sin(tick*.4)).toFixed(2)+')'; ctx.fillRect(0,Math.round(S.y+8),160,6); }
    else { ctx.globalAlpha=.8; for(let i=0;i<9;i++){ const y=Math.round(S.y+2+i*2.4), L=10+(i%3)*8; ctx.fillStyle=i&1?'#ffffff':'#cfe8ff'; ctx.fillRect(Math.round(S.x-(S.vx>0?L:0)),y,L,1); } ctx.globalAlpha=1; } }
  if(b.st==='capullo'&&!presentAwaiting()){ const x0=58, y0=3; ctx.fillStyle=PAL.k; ctx.fillRect(x0-2,y0-1,48,11); ctx.fillStyle='#1a1624'; ctx.fillRect(x0-1,y0,46,9);
    for(let i=0;i<4;i++){ const th=b.threads[i], x=x0+2+i*11; ctx.fillStyle=th.cut?OLV.wingD:OLV.wingL;
      if(th.cut){ ctx.fillRect(x,y0+2,3,1); ctx.fillRect(x+5,y0+6,3,1); ctx.fillRect(x+3,y0+3,1,1); } else { for(let k=0;k<8;k++) ctx.fillRect(x+k,y0+2+Math.round(Math.sin((k+tick*.1)*.9)),1,1); if(th.m.length) ctx.drawImage(MOTH_S[MOTH_FLAP[(tick>>2)&3]],x+1,y0+3); } } }
}
/* ---------- la pantalla del nombre ---------- */
const NOMBRE='CIERZO', NOMBRE_GRID=['ABCDEFGHI','JKLMNÑOPQ','RSTUVWXYZ'];
let nom=null;
function startNombre(){ nom={t:0,sel:0,typed:'',blown:[],done:0,lr:0,ud:0}; state='nombre'; keys.fire=keys.alt=false; toast=null; toastQ=[]; if(AC) setTrack('silencio'); OLV_SFX.whisper(); }
function nomLetter(i){ const r=(i/9)|0, c=i%9; return NOMBRE_GRID[r][c]; }
function updNombre(){ const N=nom; N.t++; updParts();
  if((tick&3)===0){ const calm=N.typed.length/6; parts.push({k:'flake',x:Math.random()*170-5,y:-4,vx:(Math.random()-.5)*.3-(1-calm)*1.2,vy:.4+(1-calm)*.5,life:120,max:120,r:(tick&8)?1:0,col:(tick&16)?'#ffffff':'#dff0ff',nog:true}); } // la nieve amaina con cada letra
  for(const L of N.blown){ L.t++; L.x+=L.vx; L.y+=L.vy; L.vy-=.04; L.rot+=.3; } N.blown=N.blown.filter(L=>L.t<50);
  if(N.done){ N.done++; if(N.done===70) finishNombre(); return; }
  if(N.t<20) return;
  const lr=(keys.right?1:0)-(keys.left?1:0), ud=(keys.down?1:0)-(keys.up?1:0);
  if(lr!==N.lr){ N.lr=lr; if(lr){ N.sel=(Math.floor(N.sel/9)*9)+((N.sel%9+lr+9)%9); SFX.menu&&SFX.menu(); } }
  if(ud!==N.ud){ N.ud=ud; if(ud){ N.sel=(N.sel+ud*9+27)%27; SFX.menu&&SFX.menu(); } }
  if(keys.alt){ keys.alt=false; if(N.typed.length){ N.typed=N.typed.slice(0,-1); SFX.bump(); } }
  if(keys.fire){ keys.fire=false; const ch=nomLetter(N.sel), i=N.typed.length;
    if(ch===NOMBRE[i]){ N.typed+=ch; CIMA_SFX.carve(i); shake=Math.max(shake,1);
      const sx=nomSlotX(i)+6; for(let k=0;k<6;k++) parts.push({k:'shard',x:sx,y:44,vx:(Math.random()-.5)*1.6,vy:-.8-Math.random(),life:14,max:14,col:k&1?'#ffffff':'#a8e0ff',nog:true});
      if(N.typed.length===NOMBRE.length){ N.done=1; olvNana(9,.034); screenFlash(10,'#eaf6ff'); } }
    else { N.blown.push({ch,x:nomSlotX(i)+6,y:44,vx:(Math.random()<.5?-1:1)*(1.6+Math.random()),vy:-1.2,rot:0,t:0}); CIMA_SFX.blowLetter(); } } // no es: una ráfaga se la lleva
}
/* la última fila con tinta de un glifo (se mide una vez): la letra se asienta en su raya */
function glyphFoot(g){ if(g.foot!==undefined) return g.foot; const d=g.getContext('2d').getImageData(0,0,g.width,g.height).data; let f=g.height-1; for(;f>0;f--){ let any=false; for(let x=0;x<g.width;x++) if(d[(f*g.width+x)*4+3]>0){ any=true; break; } if(any) break; } return g.foot=f; }
function nomSlotX(i){ return 80-6*13/2+i*13-3; }
function drawNombre(){ const N=nom; if(!N) return; drawScene(); drawUI();
  ctx.fillStyle='rgba(8,16,36,.62)'; ctx.fillRect(0,0,VW,VH); drawParts();
  const k=Math.min(1,N.t/16), y0=Math.round(10-(1-easeOutBack(k))*30);
  roundBox(8,y0,144,110,PAL.k); roundBox(9,y0+1,142,108,'#16284a'); ctx.fillStyle='#2e4a78'; ctx.fillRect(10,y0+2,140,1); ctx.fillStyle='#0c1830'; ctx.fillRect(10,y0+106,140,1);
  ctx.fillStyle='#8cc8f0'; for(const [cxp,cyp] of [[12,y0+4],[147,y0+4],[12,y0+105],[147,y0+105]]) tlStar(cxp,cyp,1+((tick>>4)&1),'#dff0ff'); // escarcha en las esquinas
  txtOL('¿CÓMO SE LLAMA?',80,y0+6,'#e8f4ff','center','#0a1428');
  for(let i=0;i<6;i++){ const x=nomSlotX(i), ch=N.typed[i]; ctx.fillStyle='#4a78b0'; ctx.fillRect(x,y0+40,11,1);
    if(ch){ const g=tlGlyph(ch,TL_ICE); ctx.drawImage(g,x+6-(g.width>>1),y0+39-glyphFoot(g)); } else if(i===N.typed.length&&(tick&16)){ ctx.fillStyle='#dff0ff'; ctx.fillRect(x,y0+39,11,1); } } // la letra, tallada encima de su raya
  for(const L of N.blown){ ctx.save(); ctx.globalAlpha=Math.max(0,1-L.t/50); ctx.translate(L.x,L.y+y0-10); ctx.rotate(L.rot); txtOL(L.ch,0,-4,'#a8c8f0','center','#0a1428'); ctx.restore(); }
  if(!N.done){ for(let i=0;i<27;i++){ const r=(i/9)|0, c=i%9, x=18+c*14, y=y0+50+r*12, sel=i===N.sel;
      if(sel){ roundBox(x-4,y-2,13,11,'#3a6aa8'); tlStar(x+2,y-4+Math.round(Math.sin(tick*.2)),1,'#ffffff'); }
      txt(nomLetter(i),x,y,sel?'#ffffff':'#9cc4ec'); }
    txtS('LO QUE RECUERDAS:',80,y0+84,'#6a90c0','center');
    const bits=[['CIER','EL TOPO REAL'],['Z','LA REINA'],['O','EL CIERVO']]; let bx=48; for(const [s] of bits){ txtOL(s,bx,y0+90,'#ffe070','left','#2a1804'); bx+=textW(s)+10; }
    txtS('Z ESCRIBE · X BORRA',80,y0+101,(tick&63)<44?'#8ab0d8':'#5a7aa8','center'); }
  else { const u=N.done; if(u>18){ const a=Math.min(1,(u-18)/10); ctx.globalAlpha=a; txtOL('—CIERZO.',80,y0+70,'#ffffff','center','#0a1428'); ctx.globalAlpha=1; } } }
function finishNombre(){ nom=null; state='play'; const b=boss; if(b) b.st='caido';
  say(["—...Cierzo.","—Me llamo Cierzo.","—Hace tanto que nadie lo decía... ¿Tú lo has dicho, semillita?"],()=>queueBye('viento',()=>{ // la revelación (BOSS_BYE.viento): lo que vivía en su tormenta
    say(["—Esa cosa vivía en mi pena.","—Se comió mi nombre tanto tiempo que ya no sabía quién era.","—Y ahora va a por mi hermano.","—Toma mi Copo, semillita. Y corre.","—Cuando todo el valle diga mi nombre, bajaré."],()=>{
      const bb=boss; pickups.push({kind:'flake',x:(bb?bb.x:64)+8,y:(bb?bb.y:40)+8,t:0}); boss=null; boss3Done=true; enemies=[]; projs=[]; save(); setTrack('cima'); },'CIERZO'); }),'EL VIENTO'); } // tras decirlo, ya es Cierzo
/* ---------- la nana comida: el tema del Olvido es la nana de casa con notas que faltan (§9.1) ---------- */
function nanaEaten(seq,frac,seed){ return seq.map(([m,l],i)=>m&&(hash(i,seed)%100)<frac*100?[0,l]:[m,l]); }
if(typeof TRACKS!=='undefined'&&TRACKS.casa) TRACKS.olvido=Object.assign({},TRACKS.casa,{bpm:80,leadM:nanaEaten(TRACKS.casa.leadM,.42,7),harmVol:.006,bassVol:.03,space:.3});
/* ---------- la entrada del Viento de verdad: al acabar, lo que se ve es el capullo ---------- */
function tlSubViento(eco){ return eco?'lo que el viento recuerda':'preso en su propia ventisca'; }
{ const OLD=BOSS_INTRO.viento, draw=OLD.draw;
  OLD.draw=function(t,P){ draw.call(this,t,P); if(P.Q.echo) return; const T=tlVT(t,P), B=P.st.b; if(T<184) return;
    const hx=B.x+16, hy=tlVY(T,B), k=presentSeg(T,184,214); cocSilk(hx,hy+2,3+Math.round(k*8),T*.012,k*.95);
    for(let i=0;i<3;i++){ const u=T*.02+i*2.1; ctx.globalAlpha=k; ctx.drawImage(MOTH_S[MOTH_FLAP[(T>>2)&3]],Math.round(hx+Math.cos(u)*16-3),Math.round(hy+2+Math.sin(u)*11-2)); ctx.globalAlpha=1; } }; }
/* ---------- la revelación: lo que vivía en su tormenta ---------- */
const RV={clear:10,dark:60,eyes:110,card:170,eat:212,rise:262,dive:290,gone:330,end:390};
const RV_PAL=['#f0e8f8','#b8aec8','#5a5070','#ffffff','#140e1c']; // el cartel, en su gris lila
{ const OLD=BOSS_BYE.viento;
  BOSS_BYE.viento={ dur:RV.end,
    start(P){ if(P.Q.echo){ P.old=true; P.dur=OLD.dur; OLD.start(P); return; }
      const b=boss; P.st.b={x:b?b.x+16:COC.x,y:b?b.y+36:COC.y+18}; P.st.pT=0; bossHidden=true; player.dir=1; player.atk=0;
      P.st.bites=[]; const L=tlLineW('EL OLVIDO'), vx=80-L/2+L*5.5/9; for(let i=0;i<4;i++) P.st.bites.push([vx+(i-1.5)*3,4+(i&1)*5,RV.eat+i*3,3]); // primero la V: «EL OL▒IDO»
      for(let i=0;i<30;i++) P.st.bites.push([80-L/2+hash(i,5)%Math.max(1,L),(hash(5,i)%18)-2,RV.eat+16+(hash(i,9)%34),2+hash(i,3)%2]); },
    tick(t,P){ if(P.old) return OLD.tick(t,P); const B=P.st.b;
      if(t===RV.clear&&AC){ const a=AC.currentTime; [72,76,79,84].forEach((m,i)=>beep('triangle',f(m),0,.9,.028,a+i*.1)); }
      if(t===RV.dark){ setTrack('olvido'); if(AC) swish(1.6,.04,300,900,200); }
      if(t===RV.eyes||t===RV.eyes+16){ shake=Math.max(shake,3); if(AC){ beep('triangle',f(33),f(28),.4,.09); noise(.2,.05,false,undefined,180); } } // un latido
      if(t===RV.card){ setTrack('silencio'); if(AC) beep('square',f(40),f(34),.8,.04); }
      if(t>=RV.eat&&t<RV.eat+44&&(t%5)===0&&AC) noise(.03,.03,true,undefined,2600); // la polilla se come las letras
      if(t===RV.dive){ shake=Math.max(shake,10); screenFlash(10,'#d8d0e8'); if(AC){ noise(.9,.08,false,undefined,140); swish(1.1,.05,1600,300,120); } }
      if(t>=RV.dark&&t<RV.dive&&(t&1)===0){ const a=Math.random()*6.283, R=60+Math.random()*30; parts.push({k:'mote',x:80+Math.cos(a)*R,y:30+Math.sin(a)*R*.5,vx:-Math.cos(a)*1.1,vy:-Math.sin(a)*.6,life:50,max:50,sway:Math.random()*6,col:(t&2)?OLV.dust:OLV.dustD,nog:true}); } // el polvo se junta arriba
      if(t>RV.dive&&t<RV.gone&&(t&1)===0) parts.push({k:'dust',x:120+(t-RV.dive)*1.4+Math.random()*10,y:40+(t-RV.dive)*2.2,vx:-.4,vy:-.2,life:30,max:30,r:2,col:OLV.dust,nog:true});
      P.st.pT=t; },
    draw(t,P){ if(P.old) return OLD.draw(t,P); const B=P.st.b, bars=Math.min(presentSeg(t,0,14),1-presentSeg(t,RV.end-14,RV.end));
      // la tormenta se cierra (y al final se aclara un poco)
      const dk=presentSeg(t,RV.dark,RV.dark+40)*(1-.55*presentSeg(t,RV.gone,RV.end)); if(dk>0) for(let y=0;y<VH;y+=2){ const a=dk*(.8-y/VH*.4); ctx.fillStyle='rgba(20,16,34,'+a.toFixed(3)+')'; ctx.fillRect(-4,y,VW+8,2); }
      // en la tormenta, detrás de Cierzo, algo del tamaño del cielo: se oscurece y abre dos ocelos como párpados
      if(t>=RV.eyes&&t<RV.dive+34){ const fade=presentSeg(t,RV.eyes-10,RV.eyes+14), open=presentEase.out(presentSeg(t,RV.eyes+10,RV.eyes+30)), rise=presentEase.in(presentSeg(t,RV.rise,RV.dive)), dive=presentEase.in(presentSeg(t,RV.dive,RV.dive+34));
        const mx=80+dive*120, my=32-rise*12+dive*130, flap=.6+.4*Math.cos(t*(t>=RV.rise?.32:.05)), c=bigMothArt(2,flap,{sil:'#0e0a18'});
        ctx.globalAlpha=.9*fade; ctx.drawImage(c,Math.round(mx-c.cx),Math.round(my-c.cy)); ctx.globalAlpha=1;
        if(open>0&&dive<.6) for(const sd of [-1,1]){ const ex=Math.round(mx+sd*19*2*flap), ey=Math.round(my-5*2), rx=8, ry=Math.max(1,Math.round(9*open)); // los ocelos: un anillo pálido y un hueco negro que te mira
          for(let yy=-ry;yy<=ry;yy++){ const w=Math.round(rx*Math.sqrt(1-(yy*yy)/(ry*ry))); ctx.fillStyle='#d8d0e8'; ctx.fillRect(ex-w,ey+yy,w*2+1,1); const w2=Math.round(w*.55); if(w2>0){ ctx.fillStyle='#07040c'; ctx.fillRect(ex-w2,ey+yy,w2*2+1,1); } }
          if(open>.8){ ctx.fillStyle='#ffffff'; ctx.fillRect(ex-2,ey-3,1,1); } glowAt(ex,ey,12,'rgba(216,208,232,'+(.18*open).toFixed(2)+')'); } }
      // Cierzo: se levanta, abre los ojos claros... y se queda mirando arriba (por delante de la sombra)
      const mood=t<RV.clear+20?'sad':t<RV.dark?'happy':t<RV.gone?'calm':'sad', lift=Math.round(presentEase.out(presentSeg(t,RV.clear,RV.clear+30))*8);
      drawShadow(B.x,B.y+2,10); drawWind(B.x,B.y-16-lift+Math.round(Math.sin(t*.08)),{s:1,mood,f:(t>>3)&7,flip:player.x+8>B.x});
      if(t>=RV.clear&&t<RV.dark) glowAt(B.x,B.y-18,22,'rgba(220,240,255,'+(.2*presentSeg(t,RV.clear,RV.clear+20)).toFixed(2)+')');
      // el cartel: EL OLVIDO, y la polilla se come sus letras
      if(t>=RV.card&&t<RV.dive){ const a=Math.min(1,presentSeg(t,RV.card,RV.card+10))*(1-presentSeg(t,RV.rise,RV.dive)), y0=86;
        ctx.globalAlpha=a*.85; ctx.fillStyle='#0a0612'; ctx.fillRect(0,y0-10,VW,34); ctx.fillStyle='#5a5070'; ctx.fillRect(0,y0-10,VW,1); ctx.fillRect(0,y0+23,VW,1); ctx.globalAlpha=1;
        tlBigLine('EL OLVIDO',80,y0,RV_PAL,i=>{ const u=t-(RV.card+i*2); if(u<0) return null; return {dx:0,dy:Math.round((1-presentEase.out(Math.min(1,u/8)))*-6),a:Math.min(1,u/3)*a}; });
        for(const [bx,by,t0,r] of P.st.bites){ if(t<t0) continue; const g=Math.min(r,1+((t-t0)>>2)); ctx.globalAlpha=a; ctx.fillStyle='#0a0612'; for(let yy=-g;yy<=g;yy++){ const w=Math.round(Math.sqrt(g*g-yy*yy)); ctx.fillRect(Math.round(bx-w),Math.round(y0+by+yy),w*2+1,1); } ctx.globalAlpha=1; } // mordiscos
        if(t>=RV.card+30){ const s='la polilla gris', n=Math.min(s.length,Math.floor((t-RV.card-30)*.8)); ctx.globalAlpha=a; txtOL(s.slice(0,n),80,y0+14,'#b8aec8','center','#0a0612'); ctx.globalAlpha=1; } }
      presentBars(bars,12); },
    end(P){ if(P.old) return OLD.end(P); bossHidden=false; } }; }
/* ---------- la salida: el último soplo de Cierzo te lleva a la plaza, donde el Olvido ha llegado primero ---------- */
Object.assign(TL_OUT_DEST,{sx:1,sy:1,x:72,y:98,dir:1});
