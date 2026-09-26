'use strict';
/* ============================================================
   LA MÉDULA DEL ROBLE: el jefe final, niveles 1 y 2 (docs/TERCERA-PASADA.md §7.4).
   · NIVEL 1 · LA CRISÁLIDA: cuelga en el centro de la médula. La seda no se corta con la Hoja. Asoman de las paredes
     cuatro puntas de raíz, las de los altares, cada una de su estación: con la sala en esa estación, un tajo a la
     punta y la raíz azota el capullo: cae una capa. Las orugas del capullo envuelven las puntas en seda (el farol la
     quema; en invierno la seda es quebradiza y también la rompe una bellota).
   · NIVEL 2 · LOS ECOS: de cada capa cae el eco del guardián de esa estación (el Topo, la Reina, el Ciervo y
     Cierzo). Solo se acuerda —y solo se le puede herir— en su estación, y se vence con su objeto, como entonces.
     Al disolverse se oye, muy lejos, la voz del guardián de verdad.
   · Con las cuatro capas, el capullo revienta y la polilla sube por el tronco, hacia la copa (nivel 3).
   ============================================================ */
const MED_ROOM='23,-1';
const MED_TIPS=[{s:0,x:0,y:4},{s:1,x:9,y:3},{s:2,x:5,y:7},{s:3,x:4,y:0}]; // primavera al oeste, verano al este, otoño al sur, invierno al norte
const MED_ECHO=['topo','avispa','ciervo','viento'];
const MED_COC={x:80,y:18,w:26,h:40};           // el capullo: cuelga de un hilo desde el techo
['Ꝑ'].forEach(c=>SOLID.add(c));                 // Ꝑ: una punta de raíz en la pared
RING_ROOMS[MED_ROOM]={ring:-1,season:0,name:'La médula'};
let med=null;
function inMedula(){ return sx+','+sy===MED_ROOM; }
function medLayer(s){ return opened.has('MEDL'+s); }
function medEcho(s){ return opened.has('MEDE'+s); }
function medDone(){ return [0,1,2,3].every(s=>medLayer(s)&&medEcho(s)); }
{ const I0=initRoomRules; initRoomRules=function(){ I0(); med=null; if(inMedula()) initMedula(); }; }
function initMedula(){ med={silk:[false,false,false,false],larvae:[],st:'idle',t:0,beat:0,lash:null,gust:0,gustT:200,spawnT:140,burst:null,intro:!opened.has('MEDin')};
  if(!opened.has('MEDin')){ opened.add('MEDin'); pendingSay=MED_T.intro.slice(); }
  // si se fue a medias de un eco: vuelve el mismo eco
  for(let s=0;s<4;s++) if(medLayer(s)&&!medEcho(s)){ spawnEcho(s,true); break; } }
function tipAt(x,y){ return MED_TIPS.find(t=>t.x===x&&t.y===y); }

/* ---------- el tajo a la punta: en su estación, la raíz azota el capullo ---------- */
function medHitTip(T){ const s=T.s, cur=roomSeason(MED_ROOM);
  if(medLayer(s)){ SFX.bump(); return; }
  if(med.silk[s]){ SFX.block(); sparkle(T.x*16+8,T.y*16+8,OLV.dust); if(!opened.has('MEDsilk')){ opened.add('MEDsilk'); showToast('LA SEDA LA ENVUELVE','el farol la quema'); } return; }
  if(cur!==s){ SFX.bump(); for(let i=0;i<3;i++) sparkle(T.x*16+4+Math.random()*8,T.y*16+4+Math.random()*8,SEASON_TINT[s]);
    if(!opened.has('MEDseason')){ opened.add('MEDseason'); showToast('LA RAÍZ DUERME','despierta en '+SEASON_NAME[s].toLowerCase()); } return; }
  if(med.st!=='idle') return;
  med.st='lash'; med.t=0; med.lash={s,x0:T.x*16+8,y0:T.y*16+8}; shake=Math.max(shake,4); hitStop=Math.max(hitStop,4);
  if(AC){ const a=AC.currentTime, root=[60,62,65,59][s]; [0,7,12].forEach((m,i)=>beep('triangle',f(root+m),0,.5,.03,a+i*.05)); noise(.3,.04,false,a,600); } }
{ const A0=attack; attack=function(){ if(inMedula()&&med&&state==='play'){ const ft=facingTile(); const T=ft&&tipAt(ft[0],ft[1]); if(T&&hasBlade){ player.atk=14; SFX.sword(); player.squash=.28; medHitTip(T); return; } } A0(); }; }
/* el farol quema la seda de una punta; en invierno, una bellota también la rompe */
function medBurnSilk(s){ if(!med.silk[s]) return; med.silk[s]=false; const T=MED_TIPS[s];
  for(let i=0;i<12;i++) parts.push({k:'dust',x:T.x*16+8,y:T.y*16+8,vx:(Math.random()-.5)*1.4,vy:-.4-Math.random()*.6,life:26,max:26,r:1+(i&1),col:i&1?OLV.dust:OLV.dustD,nog:true});
  if(AC) noise(.3,.03,false,undefined,3000); }
function updMedFire(){ for(const q of flares){ const tx=q.x>>4, ty=(q.y-2)>>4; for(const T of MED_TIPS) if(Math.abs(T.x-tx)<=1&&Math.abs(T.y-ty)<=1&&med.silk[T.s]) medBurnSilk(T.s); } }
addEventListener('DOMContentLoaded',()=>{ const B0=updBombs; updBombs=function(){ const boom=bombs.filter(b=>b.t<=1).map(b=>[b.x+8,b.y+8]); B0(); if(!inMedula()||!med||roomSeason(MED_ROOM)!==3) return;
  for(const [x,y] of boom) for(const T of MED_TIPS) if(med.silk[T.s]&&Math.hypot(T.x*16+8-x,T.y*16+8-y)<40) medBurnSilk(T.s); }; }); // la seda helada, quebradiza

/* ---------- las orugas del capullo ---------- */
function updLarvae(){ const L=med.larvae, busy=med.st!=='idle';
  if(!busy&&--med.spawnT<=0){ const sum=roomSeason(MED_ROOM)===1; med.spawnT=sum?150:220; // en verano el capullo late más deprisa
    const free=MED_TIPS.filter(T=>!medLayer(T.s)&&!med.silk[T.s]&&!L.some(q=>q.to===T.s)); if(free.length&&L.length<3){ const T=free[(Math.random()*free.length)|0];
      L.push({x:MED_COC.x,y:MED_COC.y+MED_COC.h-4,to:T.s,t:0}); if(AC) noise(.15,.03,false,undefined,500); } }
  for(const q of L){ q.t++; const T=MED_TIPS[q.to], tx=T.x*16+8, ty=T.y*16+8, dx=tx-q.x, dy=ty-q.y, d=Math.hypot(dx,dy)||1; q.x+=dx/d*.55; q.y+=dy/d*.55;
    if(d<10){ q.dead=true; if(!medLayer(q.to)){ med.silk[q.to]=true; if(AC) noise(.2,.03,false,undefined,1600); for(let i=0;i<6;i++) sparkle(tx-6+Math.random()*12,ty-6+Math.random()*12,OLV.dust); } continue; }
    if(meleeActive()&&rectsHit(meleeBox(),[q.x-5,q.y-4,10,8])){ q.dead=true; olvPoof(q.x,q.y); SFX.edie(); continue; }
    if(player.inv===0&&jumpT===0&&rectsHit([q.x-4,q.y-3,8,6],hitPlayerBox())) hurt(1,q.x,q.y); }
  med.larvae=L.filter(q=>!q.dead); }

/* ---------- el azote, la capa que cae y el eco ---------- */
function updLash(){ const M=med; M.t++; const s=M.lash.s;
  if(M.t===18){ opened.add('MEDL'+s); save(); shake=Math.max(shake,8); screenFlash(6,SEASON_TINT[s]); // ¡zas!: la capa se rasga
    if(AC){ noise(.6,.06,false,undefined,900); beep('square',f(40),f(28),.5,.05); }
    for(let i=0;i<22;i++){ const a=Math.random()*6.283; parts.push({k:'blade',x:MED_COC.x,y:MED_COC.y+14+Math.random()*20,vx:Math.cos(a)*1.6,vy:Math.sin(a)*1.2-.6,life:36,max:36,col:i&1?SEASON_TINT[s]:OLV.wingL,rot:Math.random()*6,vr:.3}); } }
  if(M.t===54) spawnEcho(s,false); }
function spawnEcho(s,quiet){ const t=MED_ECHO[s], b=t==='ciervo'?makeCiervo(4,3):makeBoss(t,4,3);
  b.echo=true; b.medula=true; b.season=s; b.hp=b.maxHp=Math.round(b.maxHp*.6); b.x=MED_COC.x-16; b.y=Math.min(60,MED_COC.y+20); if(t==='avispa') b.y=16;
  boss=b; med.st='echo'; bossCard={txt:MED_T.echoName[s],t:130}; if(AC&&!quiet) SFX.boss(); setTrack(typeof TRACKS!=='undefined'&&TRACKS.desafio?'desafio':'jefe');
  if(!quiet){ for(let i=0;i<16;i++){ const a=i/16*6.283; parts.push({k:'mote',x:b.x+16,y:b.y+16,vx:Math.cos(a)*1.4,vy:Math.sin(a)*1,life:40,max:40,sway:Math.random()*6,col:i&1?'#c8b0ff':'#fffbe8',nog:true}); } screenFlash(6,'#e8e0ff'); } }
/* los ecos de la médula: fuera de su estación no se acuerdan (ni la Hoja, ni las bellotas, ni el gancho les hacen nada) */
function echoAsleep(b){ return !!b&&!!b.medula&&roomSeason(MED_ROOM)!==b.season; }
function echoNudge(b){ if(b.clangT>0) return; b.clangT=14; SFX.clang(); for(let i=0;i<5;i++) sparkle(b.x+8+Math.random()*16,b.y+Math.random()*12,SEASON_TINT[b.season]);
  if(!opened.has('MEDsleep')){ opened.add('MEDsleep'); showToast('NO SE ACUERDA','solo en '+SEASON_NAME[b.season].toLowerCase()); } }
{ const H0=bossHit; bossHit=function(b,n){ if(echoAsleep(b)){ echoNudge(b); return false; } return H0(b,n); }; }
{ const D0=topoDaze; topoDaze=function(b,dmg){ if(echoAsleep(b)){ echoNudge(b); return; } D0(b,dmg); }; }
{ const K0=hookBoss; hookBoss=function(D){ if(echoAsleep(boss)){ return false; } return K0(D); }; }
/* el eco se disuelve: su despedida en violeta y, muy lejos, la voz del guardián de verdad */
{ const E0=updEcho; updEcho=function(){ const b=boss; if(!b||!b.medula){ E0(); return; } if(b.hp>2||b.dying) return;
  b.dying=true; enemies=[]; projs=[]; pendingSay=null; const s=b.season;
  queueBye(b.type,fb=>{ if(fb){ for(let i=0;i<3;i++) puff(b.x+16,b.y+16,['#c8b0ff','#fffbe8','#8a78d8'][i],12,1.6); shake=10; screenFlash(10,'#e8e0ff'); }
    boss=null; enemies=[]; projs=[]; opened.add('MEDE'+s); save(); player.hp=Math.min(player.maxHp,player.hp+4); med.st='idle'; med.spawnT=200; setTrack('olvido');
    say(MED_T.voice[s],()=>{ if(medDone()) medBurst(); },MED_T.voiceWho[s]); },{echo:true}); }; }

/* ---------- las cuatro capas: el capullo revienta y la polilla sube ---------- */
function medBurst(){ med.st='burst'; med.t=0; shake=Math.max(shake,12); if(AC){ const a=AC.currentTime; noise(1.2,.07,false,a,500); [48,55,60,67].forEach((m,i)=>beep('triangle',f(m),0,1.2,.04,a+.2+i*.12)); } }
function updBurst(){ const M=med; M.t++;
  if(M.t<60&&(M.t&3)===0) parts.push({k:'blade',x:MED_COC.x+(Math.random()-.5)*20,y:MED_COC.y+Math.random()*MED_COC.h,vx:(Math.random()-.5)*2,vy:-Math.random(),life:40,max:40,col:OLV.wingL,rot:Math.random()*6,vr:.3});
  if(M.t===60){ screenFlash(10,'#ffffff'); shake=Math.max(shake,10); }
  if(M.t===170){ opened.add('MEDdone'); save(); say(MED_T.rise,()=>{ ringsFinish(); }); } }
/* hasta que exista la subida (nivel 3): de la médula, al Nombre */
function ringsFinish(){ opened.add('RINGSDONE'); save(); placeAt(1,1,72,76,0); }

/* ---------- cada fotograma ---------- */
{ const U0=updRoomRules; updRoomRules=function(){ U0(); if(!inMedula()||!med||state!=='play') return; med.beat++;
  if(med.st==='idle'||med.st==='echo'){ updLarvae(); updMedFire(); }
  if(med.st==='lash') updLash(); else if(med.st==='burst') updBurst();
  if(roomSeason(MED_ROOM)===2&&med.st!=='burst'){ if(--med.gustT<=0){ med.gust=40; med.gustT=220; if(AC) noise(.8,.03,true,undefined,1800); } // el otoño: un vendaval de hojas que también te empuja
    if(med.gust>0){ med.gust--; player.kx=(player.kx||0)*.6+1.1; if((tick&1)===0) parts.push({k:'blade',x:-4,y:Math.random()*128,vx:3+Math.random(),vy:(Math.random()-.5)*.6,life:50,max:50,col:['#c86424','#e8a040','#a04818'][tick%3],rot:Math.random()*6,vr:.3}); } } }; }

/* ---------- lo que se pinta ---------- */
function tipArt(s,awake,silk){ return cached('mtip'+s+(awake?1:0)+(silk?1:0),g=>{ const c=SEASON_TINT[s]; // la punta de una raíz de altar, que asoma de la pared
  for(let y=0;y<16;y++) for(let x=0;x<16;x++){ const d=Math.hypot(x-7.5,y-7.5); if(d>6.8) continue; PX(g,x,y,d>6?PAL.k:d>4.4?'#5a3a1c':d>2.6?(awake?c:'#7a5a38'):(awake?'#ffffff':'#8a6a48')); }
  for(const [x,y] of [[3,3],[12,4],[4,12],[11,11]]) PX(g,x,y,'#3a2410');
  if(silk){ for(let i=0;i<5;i++){ const y=3+i*2; for(let x=2;x<14;x++) if(Math.hypot(x-7.5,y-7.5)<6.6) PX(g,x,y+((x>>2)&1),i&1?OLV.dust:OLV.wingL); } } }); }
{ const O0=drawObject; drawObject=function(g,rows,x,y,ch,opts,f,fg){ if(ch==='Ꝑ'){ O0(g,rows,x,y,'T',opts,f,fg); return; } return O0(g,rows,x,y,ch,opts,f,fg); }; }
{ const G0=drawGround; drawGround=function(g,rows,x,y,ch,opts,f){ if(ch==='Ꝑ'){ G0(g,rows,x,y,'.',opts,f); return; } return G0(g,rows,x,y,ch,opts,f); }; }
function drawChrysalis(){ const M=med; if(!M||M.st==='burst'&&M.t>60) return; const C=MED_COC, sum=roomSeason(MED_ROOM)===1, pulse=Math.sin(M.beat*(sum?.2:.12))>.82?1:0, cx=C.x, top=C.y, sway=Math.round(Math.sin(M.beat*.03)*1.5);
  ctx.fillStyle='#e8e0f0'; ctx.fillRect(cx,0,1,top+2); ctx.fillStyle=OLV.dustD; ctx.fillRect(cx+1,0,1,top); // el hilo del que cuelga
  const left=[0,1,2,3].filter(s=>!medLayer(s));
  for(let y=0;y<C.h;y++){ const k=y/C.h, prof=k<.12?.28+k*3:Math.pow(Math.sin(Math.PI*Math.min(1,(k-.04)*1.02)),.55), w=Math.max(1,Math.round(prof*(C.w/2+pulse))); // cuello, panza y la punta redonda
    const xo=cx+Math.round(sway*k), ridge=(y%7)===3;
    for(let x=-w;x<=w;x++){ const edge=Math.abs(x)>=w-1||(y===C.h-1); let c=edge?OLV.ink:ridge?OLV.wingD:x<-w*.35?OLV.wingL:x<w*.2?OLV.wing:OLV.body;
      if(!edge&&!ridge&&left.length&&((x*3+y*5+40)%11)===0) c=SEASON_TINT[left[(y>>3)%left.length]]; // las estaciones que se comió, atrapadas en la seda
      ctx.fillStyle=c; ctx.fillRect(xo+x,top+y,1,1); } }
  if(pulse){ glowAt(cx,top+C.h*.55,14,'rgba(200,180,230,.25)'); }
  if(M.st==='burst'&&M.t<60){ const k=M.t/60; ctx.fillStyle='rgba(255,255,255,'+(k*.6).toFixed(2)+')'; ctx.fillRect(cx-16,top,33,C.h); } }
function drawMedula(){ if(!inMedula()||!med) return; const cur=roomSeason(MED_ROOM);
  for(const T of MED_TIPS){ const awake=cur===T.s&&!medLayer(T.s); ctx.drawImage(tipArt(T.s,awake,med.silk[T.s]),T.x*16,T.y*16);
    if(awake&&!med.silk[T.s]){ glowAt(T.x*16+8,T.y*16+8,12+Math.sin(tick*.2)*2,'rgba(255,255,255,.25)'); if((tick&15)===0) sparkle(T.x*16+4+Math.random()*8,T.y*16+2,SEASON_TINT[T.s]); }
    if(medLayer(T.s)){ ctx.fillStyle=SEASON_TINT[T.s]; ctx.fillRect(T.x*16+7,T.y*16+7,2,2); } }
  drawChrysalis();
  if(med.st==='lash'){ const L=med.lash, k=Math.min(1,med.t/18), back=med.t>22?Math.min(1,(med.t-22)/20):0, ex=MED_COC.x, ey=MED_COC.y+MED_COC.h*.5; // la raíz azota: sale de la punta, se curva, golpea y se recoge
    const n=Math.round(40*k*(1-back)); for(let i=0;i<=n;i++){ const u=i/40, x=lerp(L.x0,ex,u)+Math.sin(u*Math.PI)*16*(L.y0<64?1:-1), y=lerp(L.y0,ey,u)+Math.sin(u*Math.PI*2)*7, th=Math.max(1,Math.round(3-u*2));
      ctx.fillStyle=PAL.k; ctx.fillRect(Math.round(x)-th-1,Math.round(y)-th-1,th*2+3,th*2+3); ctx.fillStyle=(i%5===0)?'#5a3a1c':'#8a5a30'; ctx.fillRect(Math.round(x)-th,Math.round(y)-th,th*2+1,th*2+1);
      if(i%6===3){ ctx.fillStyle=SEASON_TINT[L.s]; ctx.fillRect(Math.round(x),Math.round(y)-th,1,1); } }
    if(n>0&&back===0){ const u=n/40, x=lerp(L.x0,ex,u)+Math.sin(u*Math.PI)*16*(L.y0<64?1:-1), y=lerp(L.y0,ey,u)+Math.sin(u*Math.PI*2)*7; glowAt(x,y,8,'rgba(255,255,255,.5)'); } }
  for(const q of med.larvae){ const X=Math.round(q.x), Y=Math.round(q.y), w=(q.t>>3)&1; ctx.fillStyle=OLV.ink; ctx.fillRect(X-4,Y-2,9,5); ctx.fillStyle=OLV.body; ctx.fillRect(X-3,Y-1,7,3); ctx.fillStyle=OLV.wingL; ctx.fillRect(X-3+w,Y-1,2,1); ctx.fillRect(X+1+w,Y-1,2,1); }
  // las capas que quedan
  for(let s=0;s<4;s++){ const x=62+s*9, y=3; ctx.fillStyle=PAL.k; ctx.fillRect(x-1,y-1,8,6); ctx.fillStyle=medLayer(s)?(medEcho(s)?'#3a3444':'#8a78d8'):SEASON_TINT[s]; ctx.fillRect(x,y,6,4); } }
{ const D0=drawScorches; drawScorches=function(){ D0(); drawMedula(); }; }
