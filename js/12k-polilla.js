'use strict';
/* ============================================================
   EL NIVEL 3 DEL JEFE FINAL: LA POLILLA (docs/TERCERA-PASADA.md §7.4).
   · LA SUBIDA (23,-2): por dentro del tronco, hueco. Una rejilla sopla si le da el tornadito del Remolino (o una
     ráfaga del molinillo); salta encima con el vilano y la corriente te sube hasta la repisa de arriba.
   · LA COPA (23,-3): ramas sobre el vacío y cuatro braseros. La Polilla va a la luz: se lanza en picado contra el
     brasero encendido (o contra ti, si no hay ninguno), lo apaga y se posa un momento. Ahí el gancho le clava un
     ala y la Hoja le da en el cuerpo. Su polvo gris vuelve grises las ramas: pisarlo te borra.
   · Cada estación contra el polvo, cada una con su precio: el invierno lo hiela y cae como nieve (pero las ramas
     resbalan); el verano lo quema (pero ella va más rápida); el otoño se lo lleva (pero la ráfaga te empuja a ti);
     la primavera no lo limpia, pero hace crecer brotes donde se posa y la retiene más rato.
   · Con cada clavada el HUD se olvida de algo: primero el color, luego el objeto. Al final huye al cielo.
   ============================================================ */
const POL_CLIMB='23,-2', POL_COPA='23,-3';
RING_ROOMS[POL_CLIMB]={ring:-1,season:0,name:'El tronco por dentro',style:'wood',floor:'q'};
RING_ROOMS[POL_COPA]={ring:-1,season:0,name:'La copa'};
['Ꝭ','Ꝯ'].forEach(c=>GROUND.add(c));   // Ꝭ una rama de la copa (en invierno, helada: 'i') · Ꝯ una rama gris de polvo
{ const S0=screenStyle; screenStyle=function(nx,ny){ const R=RING_ROOMS[nx+','+ny]; return R&&R.style?R.style:S0(nx,ny); }; }
{ const F0=regionFloor; regionFloor=function(){ const R=RING_ROOMS[sx+','+sy]; return R&&R.floor?R.floor:F0(); }; }
{ const T0=seasonTile; seasonTile=function(c,s){ if(c==='Ꝭ') return s===3?'i':'Ꝭ'; return T0(c,s); }; }
SEASON_BASE.add('Ꝭ');
{ const A0=applySeason; applySeason=function(s){ const cop=sx+','+sy===POL_COPA; if(cop&&s!==0&&countDust()) clearDust(s); A0(s); // al girar el año, el polvo arde, vuela o nieva (antes de que la estación rehaga las ramas)
  if(cop){ TRUE_ICE.delete(POL_COPA); icePlan=null; } }; }                                                                     // la rama helada resbala, pero se deja llevar: no es el hielo del Templo
let pol=null, polHud={hearts:0,x:0,z:0,rest:0}, polDustT=0;
function inCopa(){ return sx+','+sy===POL_COPA; }

/* ---------- la subida: la corriente que sube (12e: rejillas 'Ш') ---------- */
{ const G0=drawGround; drawGround=function(g,rows,x,y,ch,opts,f){ if(ch==='Ш'&&regionOf(opts.sx,opts.sy)==='anillos'){ G0(g,rows,x,y,'q',opts,f); g.drawImage(grateTile(),x*16,y*16); return; }
  if(ch==='°'&&opts.sx+','+opts.sy===POL_CLIMB){ g.drawImage(hollowTile(edgesOf(rows,x,y,c=>c!=='°')&15,(x*5+y*3)&3,y),x*16,y*16); return; }
  return G0(g,rows,x,y,ch,opts,f); }; }
function hollowTile(e,v,row){ return cached('hollow'+e+v+row,g=>{ // el tronco hueco, visto desde arriba: madera en vetas que baja hasta perderse
  const deep=['#140c08','#110a07','#0e0807','#0c0708','#0a0608','#090508','#08050a','#08050a'][row]||'#08050a', gr=['#24160c','#1f130b','#1a100a','#160d09','#130b09','#110a09','#100909','#100909'][row]||'#100909';
  R(g,0,0,16,16,deep); const rnd=seeded(v*41+row*7+3);
  for(let i=0;i<5;i++){ const x=(rnd()*16)|0, y=(rnd()*14)|0; R(g,x,y,1,2+((rnd()*4)|0),gr); } // las vetas de dentro, a trozos, casi a oscuras
  if(v===2) PX(g,9,11,'#2a1a10');                                           // algún nudo
  if(e&1){ R(g,0,0,16,7,'#4a3018'); R(g,0,0,16,1,'#8a6438'); R(g,0,1,16,1,'#6a4a28'); for(let x=1+v;x<16;x+=4){ R(g,x,2,1,4,'#3a2410'); PX(g,x+1,2,'#5a3c22'); }
    R(g,0,6,16,1,'#2a1a0c'); R(g,0,7,16,1,'#140c08'); }                     // la pared del pozo que se ve al asomarse
  if(e&8){ R(g,0,0,2,16,PAL.k); R(g,0,0,1,16,'#3a2410'); }
  if(e&2){ R(g,14,0,2,16,PAL.k); R(g,15,0,1,16,'#3a2410'); }
  if(e&4){ R(g,0,14,16,2,'#3a2410'); R(g,0,15,16,1,'#6a4a28'); } }); }
{ const U0=updRoomRules; updRoomRules=function(){ U0(); if(sx+','+sy!==POL_CLIMB||state!=='play') return; // la savia que sube, a motas, desde la médula
  if(tick%9===0){ const x=20+Math.random()*120, y=24+Math.random()*80, [tx,ty]=[x>>4,y>>4]; if(grid[ty]&&grid[ty][tx]==='°') parts.push({k:'mote',x,y,vx:(Math.random()-.5)*.2,vy:-.25-Math.random()*.2,life:70,max:70,sway:Math.random()*6,col:Math.random()<.3?'#ffe8a0':'#c89858',nog:true}); } }; }

/* ---------- la copa: ramas y vacío ---------- */
function branchTile(e,v,ice,dust){ return cached('branch'+e+v+(ice?1:0)+(dust?1:0),g=>{ const c=dust?[OLV.ink,OLV.dustD,OLV.dust,OLV.wingL]:ice?['#3a5a78','#8ab8e0','#c8e4f8','#ffffff']:['#3a2410','#6a4424','#8a5a30','#b07a44'];
  R(g,0,0,16,16,c[1]); for(let y=1;y<16;y+=3) for(let x=((y*5+v)%6);x<16;x+=6) R(g,x,y,3,1,c[2]); // la corteza, en vetas
  if(v&1) PX(g,5,8,c[0]); else PX(g,11,5,c[0]); if(ice){ PX(g,4,4,c[3]); PX(g,12,11,c[3]); }
  if(e&1){ R(g,0,0,16,2,c[0]); R(g,0,2,16,1,c[3]); } if(e&4){ R(g,0,14,16,2,c[0]); } if(e&8) R(g,0,0,2,16,c[0]); if(e&2) R(g,14,0,2,16,c[0]);
  if(dust) for(const [x,y] of [[3,5],[9,3],[12,10],[6,12]]) PX(g,x,y,'#ffffff'); }); }
function abyssTile(e,v,bio){ return cached('abyss'+e+v+bio,g=>{ const P=(BIOMES[bio]||BIOMES.valley).canopy; R(g,0,0,16,16,'#0a1410'); // allá abajo, muy lejos, el valle entre las hojas
  for(let i=0;i<7;i++){ const x=(i*7+v*3)%15, y=(i*11+v*5)%15; R(g,x,y,2,1,i&1?P[0]:'#14281c'); }
  if(e&1){ R(g,0,0,16,3,shade(P[1],-.2)); R(g,0,3,16,1,'#0a1410'); } }); }
{ const G0=drawGround; drawGround=function(g,rows,x,y,ch,opts,f){ if(opts.sx+','+opts.sy!==POL_COPA) return G0(g,rows,x,y,ch,opts,f); const v=(x*7+y*3)&3;
  if(ch==='Ꝭ'||ch==='i'||ch==='Ꝯ'){ const e=edgesOf(rows,x,y,c=>c!=='Ꝭ'&&c!=='i'&&c!=='Ꝯ'&&c!==':'&&c!==';'); g.drawImage(branchTile(e&15,v,ch==='i',ch==='Ꝯ'),x*16,y*16); return; }
  if(ch==='°'){ g.drawImage(abyssTile(edgesOf(rows,x,y,c=>c!=='°')&15,v,opts.bio),x*16,y*16); return; }
  if(ch===':'||ch===';'){ g.drawImage(branchTile(15,v,false,false),x*16,y*16); return; }
  return G0(g,rows,x,y,ch,opts,f); }; }

/* ---------- la Polilla ---------- */
function initPolilla(){ pol=null; if(!inCopa()) return; if(opened.has('POLdone')) return; polHud={hearts:0,x:0,z:0,rest:0};
  boss={type:'polilla',hp:16,maxHp:16,x:80,y:-30,st:'in',t:0,k:1,vx:0,vy:0,pins:0,hits:0,flash:0,clangT:0,w:48,h:30,tx:0,ty:0,a:0};
  if(!opened.has('POLin')){ opened.add('POLin'); pendingSay=POL_T.intro.slice(); } bossCard={txt:'LA POLILLA DEL OLVIDO',t:140}; setTrack(typeof TRACKS!=='undefined'&&TRACKS.desafio?'desafio':'jefe'); }
{ const I0=initRoomRules; initRoomRules=function(){ I0(); polMusicForget(0); initPolilla(); }; }
addEventListener('DOMContentLoaded',()=>{ const U0=updBoss; updBoss=function(){ if(boss&&boss.type==='polilla'){ updPolilla(); return; } U0(); };
  const D0=drawBoss; drawBoss=function(){ if(boss&&boss.type==='polilla'){ drawPolilla(); return; } D0(); };
  const H0=drawUI; drawUI=function(){ H0(); if(inCopa()&&boss&&boss.type==='polilla'&&typeof c5HudForget==='function') c5HudForget({hud:polHud,hudFlash:polHud.flash||{}}); }; }); // el HUD que se olvida (15o)
function polBox(b){ return [b.x-16,b.y-10,32,20]; }
function polTarget(b){ let best=null, bd=1e9; for(let y=0;y<SH;y++) for(let x=0;x<SW;x++) if(grid[y][x]===';'){ const d=Math.hypot(x*16+8-b.x,y*16+8-b.y); if(d<bd){ bd=d; best=[x*16+8,y*16+4,x,y]; } }
  return best||[player.x+8,player.y+6,-1,-1]; }                                                         // va a la luz; si no hay, a ti
function updPolilla(){ const b=boss, s=roomSeason(POL_COPA), fast=s===1?1.45:1; if(b.flash>0) b.flash--; if(b.clangT>0) b.clangT--; b.t++;
  if(b.st==='in'){ b.y+=1.2; b.k=.6+.4*Math.abs(Math.sin(b.t*.25)); if(b.y>=34){ b.st='fly'; b.t=0; } return; }
  if(b.st==='flee'){ if(b.t===1) polMusicForget(0); b.y-=2.2; b.x+=Math.sin(b.t*.2)*1.5; b.k=.4+.6*Math.abs(Math.sin(b.t*.4)); if(b.t===80){ opened.add('POLdone'); save(); boss=null; say(POL_T.flee,()=>ringsFinish()); } return; }
  if(b.st==='fly'){ const a=b.t*.022*fast; b.x+=(80+Math.cos(a)*48-b.x)*.06; b.y+=(40+Math.sin(a*2)*18-b.y)*.06; b.k=.55+.45*Math.abs(Math.sin(b.t*.22*fast));
    if(b.t%Math.round(26/fast)===0) polDust(b);
    if(b.t>(b.pins>=2?110:150)/fast){ b.st='aim'; b.t=0; const T=polTarget(b); b.tx=T[0]; b.ty=T[1]; b.tb=T[2]>=0?[T[2],T[3]]:null; if(AC) beep('square',f(62),f(58),.2,.03); } }
  else if(b.st==='aim'){ b.k=.3+.1*Math.sin(b.t*.6); if(b.t>30){ b.st='dive'; b.t=0; const d=Math.hypot(b.tx-b.x,b.ty-b.y)||1, sp=3*fast; b.vx=(b.tx-b.x)/d*sp; b.vy=(b.ty-b.y)/d*sp; SFX.ehit(); } }
  else if(b.st==='dive'){ b.x+=b.vx; b.y+=b.vy; b.k=.25; if(Math.hypot(b.tx-b.x,b.ty-b.y)<4||b.t>60){ b.st='perch'; b.t=0; shake=Math.max(shake,4); SFX.bump();
      if(b.tb&&grid[b.tb[1]][b.tb[0]]===';'){ grid[b.tb[1]][b.tb[0]]=':'; markDirty(); puff(b.tb[0]*16+8,b.tb[1]*16+4,'#6a6058',8,1.2); if(AC) SFX.brazierOut&&SFX.brazierOut(); } // apaga la luz a la que vino
      for(let i=0;i<10;i++) parts.push({k:'dust',x:b.x+(Math.random()-.5)*24,y:b.y+6,vx:(Math.random()-.5)*1.2,vy:-.3,life:22,max:22,r:1+(i&1),col:i&1?OLV.dust:OLV.dustD,nog:true}); } }
  else if(b.st==='perch'){ b.k=.5+.04*Math.sin(b.t*.08);  // posada, con las alas medio abiertas y quietas if(s===0&&(b.t&7)===0) parts.push({k:'blade',x:b.x+(Math.random()-.5)*20,y:b.y+8,vx:0,vy:-.3,life:30,max:30,col:'#78d838',rot:Math.random()*6,vr:.2}); // brotes que la retienen
    if(b.t>(s===0?190:110)){ b.st='fly'; b.t=0; SFX.ehit(); } }
  else if(b.st==='pinned'){ b.k=.42+.1*Math.sin(tick*.9); if((tick&7)<4) sparkle(b.x-10+Math.random()*20,b.y-6,'#fff0c0');
    if(b.hits>=4||b.t>130){ polFree(b); } }
  // tocarla (en el aire o en picado) hace daño; posada o clavada, no
  if((b.st==='fly'||b.st==='aim'||b.st==='dive')&&player.inv===0&&jumpT===0&&rectsHit(polBox(b),hitPlayerBox())) hurt(2,b.x,b.y);
  if(b.flash===0&&meleeActive()&&rectsHit(meleeBox(),polBox(b))){ if(b.st==='pinned'){ b.hp--; b.hits++; b.flash=8; SFX.ehit(); hitStop=Math.max(hitStop,4); shake=Math.max(shake,3); flyText.push({x:b.x,y:b.y-12,txt:'1',t:24,col:'#fffbe8'});
      for(let i=0;i<8;i++) parts.push({k:'dust',x:b.x,y:b.y,vx:(Math.random()-.5)*1.6,vy:-Math.random()*1.2,life:20,max:20,r:1,col:OLV.dust,nog:true}); if(b.hp<=0){ b.st='flee'; b.t=0; bossRope=null; SFX.edie(); } }
    else if(b.clangT===0){ b.clangT=14; SFX.clang(); sparkle(b.x,b.y-8,OLV.wingL); } }
  if(bossRope&&--bossRope.t<=0&&b.st!=='pinned') bossRope=null; }
function polFree(b){ b.st='fly'; b.t=0; b.hits=0; b.pins++; bossRope=null; shake=Math.max(shake,6); screenFlash(4,'#e8e0f0'); if(AC){ noise(.5,.05,false,undefined,900); beep('triangle',f(52),f(44),.5,.04); }
  for(let i=0;i<20;i++){ const a=Math.random()*6.283; parts.push({k:'dust',x:b.x,y:b.y,vx:Math.cos(a)*1.6,vy:Math.sin(a)*1.2,life:30,max:30,r:1+(i&1),col:i&1?OLV.dust:OLV.dustD,nog:true}); }
  polHud.flash=polHud.flash||{}; if(b.pins===1){ polHud.hearts=1; polHud.flash.hearts=16; showToast('SE LLEVA EL COLOR','de tus corazones'); } // el HUD se olvida
  if(b.pins===2){ polHud.x=1; polHud.flash.x=16; showToast('SE LLEVA TU OBJETO','de la vista: sigue en tu mano'); }
  if(b.pins===3){ polMusicForget(1); showToast('SE LLEVA LA MÚSICA','solo queda la melodía'); } }
/* la música también se olvida: se apagan las voces de acompañamiento y queda la melodía sola (vuelven al acabar o al salir) */
let polMusic=0;
function polMusicForget(on){ if(polMusic===on) return; polMusic=on; if(!AC||!VOICE.harm) return; const T=AC.currentTime;
  for(const k of ['harm','arp','duet','drum']) if(VOICE[k]){ VOICE[k].gain.cancelScheduledValues(T); VOICE[k].gain.setTargetAtTime(on?0:1,T,on?.8:.3); } }
/* el gancho: solo si está posada, le clava un ala */
{ const K0=hookBoss; hookBoss=function(D){ const b=boss; if(!b||b.type!=='polilla') return K0(D); if(b.st!=='perch') return false;
  const x0=player.x+8, y0=player.y+10, bb=polBox(b); for(let s=8;s<=120;s+=4){ const px=x0+D[0]*s, py=y0+D[1]*s; if(px>bb[0]-4&&px<bb[0]+bb[2]+4&&py>bb[1]-4&&py<bb[1]+bb[3]+4){
      b.st='pinned'; b.t=0; b.hits=0; bossRope={t:24}; SFX.hookYank&&SFX.hookYank(); shake=Math.max(shake,5); if(!opened.has('POLpin')){ opened.add('POLpin'); showToast('¡CLAVADA!','ahora, la Hoja'); } return true; } }
  return false; }; }
/* el polvo: cae de sus alas y vuelve gris la rama donde cae (pisarlo te borra); cada estación lo trata a su manera */
function polDust(b){ const s=roomSeason(POL_COPA); for(let i=0;i<3;i++) parts.push({k:'mote',x:b.x+(Math.random()-.5)*30,y:b.y+4,vx:(Math.random()-.5)*.4,vy:.5,life:50,max:50,sway:Math.random()*6,col:s===3?'#ffffff':OLV.dust,nog:true});
  if(s!==0) return; // en invierno cae como nieve, en verano arde, en otoño se lo lleva el viento
  const tx=(b.x+(Math.random()-.5)*36)>>4, ty=((b.y+30+Math.random()*30))>>4; if(grid[ty]&&grid[ty][tx]==='Ꝭ'&&countDust()<14){ grid[ty][tx]='Ꝯ'; markDirty(); } }
function countDust(){ let n=0; for(let y=0;y<SH;y++) for(let x=0;x<SW;x++) if(grid[y][x]==='Ꝯ') n++; return n; }
function clearDust(s){ let n=0; for(let y=0;y<SH;y++) for(let x=0;x<SW;x++) if(grid[y][x]==='Ꝯ'){ grid[y][x]=seasonTile('Ꝭ',s); n++;
    for(let i=0;i<4;i++) parts.push(s===1?{x:x*16+4+Math.random()*8,y:y*16+8,vx:0,vy:-.6,life:18,col:i&1?'#f8a030':'#ffd060',nog:true}:{k:s===2?'blade':'mote',x:x*16+8,y:y*16+8,vx:s===2?2:(Math.random()-.5)*.4,vy:s===2?-.4:.4,life:30,max:30,sway:3,rot:1,vr:.3,col:s===2?'#e8a040':'#ffffff',nog:true}); }
  if(n) markDirty(); }
{ const U0=updRoomRules; updRoomRules=function(){ U0(); if(!inCopa()||state!=='play') return; const s=roomSeason(POL_COPA);
  if(s!==0&&countDust()) clearDust(s);
  const [tx,ty]=playerTile(); if(grid[ty]&&grid[ty][tx]==='Ꝯ'&&jumpT===0){ if(++polDustT>=50){ polDustT=0; hurt(1,player.x+8,player.y+20); showToast('EL POLVO TE BORRA','el Anillo lo limpia'); } } else polDustT=0;
  if(s===2&&boss&&boss.type==='polilla'){ const G=tick%200, LV=['#c86424','#e8a040','#a04818'];          // el otoño te empuja a ti también
    if(G>=156&&(tick&1)===0){ const a=tick*.3; parts.push({k:'blade',x:6+Math.cos(a)*6+Math.random()*6,y:12+Math.random()*104,vx:.5+Math.random()*.5,vy:Math.sin(a)*.6-.3,life:24,max:24,col:LV[tick%3],rot:Math.random()*6,vr:.35}); } // se arremolina a la izquierda: ya viene
    if(G>=176&&(tick&3)===0) parts.push({k:'streak',x:-2,y:8+Math.random()*112,vx:1.6+Math.random(),vy:0,life:18,max:18,len:3+((Math.random()*4)|0),col:'#fff4e0',nog:true});
    if(G===168&&AC) noise(.7,.03,true,undefined,1500);
    if(G<36){ player.kx=(player.kx||0)*.6+.75; if((tick&1)===0) parts.push({k:'blade',x:-4,y:Math.random()*128,vx:3+Math.random(),vy:(Math.random()-.5)*.6,life:50,max:50,col:LV[tick%3],rot:Math.random()*6,vr:.3});
      if((tick&1)===1) parts.push({k:'streak',x:-4,y:Math.random()*128,vx:4+Math.random()*2,vy:0,life:30,max:30,len:5+((Math.random()*6)|0),col:(tick&2)?'#ffffff':'#f8e8c8',nog:true}); } } }; } // (andando en contra, aguantas)
function drawPolilla(){ const b=boss; if(!b) return; const X=Math.round(b.x), Y=Math.round(b.y);
  if(b.st!=='in'&&b.st!=='flee'){ const sh=b.st==='perch'||b.st==='pinned'?8:Math.round(6+Math.sin(tick*.1)); ctx.fillStyle='rgba(10,10,20,.3)'; ctx.fillRect(X-sh*2,Math.min(118,Y+22),sh*4,3); }
  if(b.st==='aim'){ glowAt(X,Y,20+Math.sin(tick*.5)*3,'rgba(232,224,240,.3)'); }
  ctx.globalAlpha=b.flash>4?.6:1; drawBigMoth(X,Y,.52,b.k); ctx.globalAlpha=1;
  if(b.st==='pinned'){ ctx.fillStyle=PAL.k; ctx.fillRect(X+10,Y-6,3,16); ctx.fillStyle='#8a5a30'; ctx.fillRect(X+11,Y-5,1,14); // la raíz que le clava el ala
    ctx.fillStyle='#78d838'; ctx.fillRect(X+10,Y-7,3,2); }
  if(bossRope){ const x0=player.x+8, y0=player.y+10, n=Math.max(2,(Math.hypot(X+11-x0,Y-x0*0)/4)|0); for(let i=0;i<=n;i++){ ctx.fillStyle=i%2?PAL.l:PAL.d; ctx.fillRect((x0+(X+11-x0)*i/n-1)|0,(y0+(Y-y0)*i/n-1)|0,2,2); } } }
/* en plena pelea, Z frente a un brasero es un tajo (la Polilla se posa encima), no el aviso de «equipa el farol» */
{ const I0=interact; interact=function(ft){ if(boss&&(ft[2]===':'||ft[2]===';')) return false; return I0(ft); }; }
/* los braseros de la copa: se encienden con el farol, sin el aviso de las antorchas de las mazmorras */
{ const L0=lightTorch; lightTorch=function(tx,ty){ if(!inCopa()){ L0(tx,ty); return; } grid[ty][tx]=';'; SFX.torch(); puff(tx*16+8,ty*16+4,'#f8a030',8,1.2); markDirty(); }; }
/* el HUD que parpadea al olvidarse */
{ const U0=updRoomRules; updRoomRules=function(){ U0(); const F=polHud.flash; if(F) for(const k in F) if(--F[k]<=0) delete F[k]; }; }
