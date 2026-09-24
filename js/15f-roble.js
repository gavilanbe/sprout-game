'use strict';
/* ============================================================
   EL GRAN ROBLE Y LAS ESTACIONES
   · El Roble de la plaza está vivo. Sin sus semillas está gris y callado
     (las que ya llevas laten en sus huecos: las oye llegar). Con ellas
     respira, se mece y viste la estación del valle: flor, verano, ámbar
     o nieve. Cuando habla Raíz, el hueco de su tronco se enciende: la voz
     es suya.
   · Del tronco salen cuatro raíces, una a cada altar. La de un altar
     lleno brilla con su estación y le lleva savia al Roble.
   · El rito de entrega: la reliquia sale de las manos de Sprout y vuela a
     su altar; la raíz lleva la luz al tronco; el Roble se estremece y la
     estación se extiende desde él por la plaza... y luego por el valle.
   ============================================================ */

/* ---------- el Roble, en cada estado ---------- */
const ROBLE_X=37, ROBLE_Y=-2; // dónde cae su lienzo (86×82) en la plaza
const ROBLE_ART=(()=>{ const leaf=to=>{ const m={}; OAK_LEAF.forEach((c,i)=>m[c]=to[i]); return m; };
  const ashBark={}; OAK_BARK.forEach((c,i)=>ashBark[c]=['#2a2320','#40362e','#584c42','#706458','#8a7e70'][i]);
  return {
    ash:recolor(OAK_GRAND,Object.assign(leaf(['#2c3228','#434a3a','#59624c','#6f785e','#878f74','#a3a88e']),ashBark)), // dormido: hojas mustias, gris verdoso
    base:OAK_GRAND,                                                                                                  // despierto, el año atascado
    spring:OAK_SEASON[0], summer:recolor(OAK_GRAND,leaf(['#0e3616','#1c6626','#31902e','#56b83a','#8cdc50','#caf48a'])),
    autumn:OAK_SEASON[2], winter:OAK_SEASON[3] }; })();
const ROBLE_LOOKS=['spring','summer','autumn','winter'];
function robleLook(){ if(!won) return 'ash'; const s=valleySeason(); return s<0?'base':ROBLE_LOOKS[s]; }
/* los ocho huecos de sus semillas (en el lienzo) */
const ROBLE_SEEDS=[[20,22],[48,14],[62,28],[30,34],[12,28],[40,24],[56,38],[28,8]];
/* las cuatro estaciones y sus altares: casilla, luz, reliquia */
const ROBLE_ALTARS=[
  {k:'primavera',si:0,tx:2,ty:3,col:'#ffb060',rgb:'255,176,96',spr:()=>EMBER_SPR,done:()=>thawed,has:()=>hasEmber},
  {k:'verano',si:1,tx:7,ty:3,col:'#8ad8ff',rgb:'138,216,255',spr:()=>TEAR_SPR,done:()=>summered,has:()=>hasTear},
  {k:'otono',si:2,tx:6,ty:6,col:'#ffd070',rgb:'255,208,112',spr:()=>AMBER_SPR,done:()=>autumned,has:()=>hasAmber},
  {k:'invierno',si:3,tx:3,ty:6,col:'#e8f4ff',rgb:'232,244,255',spr:()=>FLAKE_SPR,done:()=>cycled,has:()=>hasFlake}];
const altarOf=k=>ROBLE_ALTARS.find(A=>A.k===k);

/* ---------- las raíces: venas bajo la tierra, del pie del tronco a cada altar ----------
   Apagadas apenas se adivinan; la de un altar lleno se enciende con su estación y lleva pulsos de savia. */
function rootPath(A){ const x=A.tx*16+8, y=A.ty*16+13, left=x<80, low=A.ty>4, s=left?-1:1; // curva en S: sale del pie, gira y llega al altar
  return {p0:[80+s*6,low?77:75],c1:[80+s*20,low?80:79],c2:[x-s*4,low?y-18:y+10],p3:[x,y]}; }
function rootAt(P,t){ const u=1-t, a=u*u*u, b=3*u*u*t, c=3*u*t*t, d=t*t*t; return [a*P.p0[0]+b*P.c1[0]+c*P.c2[0]+d*P.p3[0],a*P.p0[1]+b*P.c1[1]+c*P.c2[1]+d*P.p3[1]]; }
const ROBLE_ROOTS=(()=>{ const c=mkCanvas(160,128), g=c.getContext('2d');
  for(const A of ROBLE_ALTARS){ const P=rootPath(A); let last='';
    for(let i=0;i<=120;i++){ const t=i/120, [x,y]=rootAt(P,t), X=Math.round(x), Y=Math.round(y), key=X+','+Y; if(key===last) continue; last=key;
      if(((X+Y)&1)&&t>.12) continue; // tramada: bajo tierra solo asoma a medias
      g.fillStyle=t<.12?'rgba(58,36,18,.5)':'rgba(58,36,18,.2)'; g.fillRect(X,Y,1,1); } }
  return c; })();
/* la luz que corre por una raíz: desde el altar (t=1) hasta donde diga k; con un pulso de savia */
function rootLight(A,k,alpha,pulse){ const P=rootPath(A); let last='';
  for(let i=0;i<=120;i++){ const t=i/120; if(t<1-k) continue; const [x,y]=rootAt(P,t), X=Math.round(x), Y=Math.round(y), key=X+','+Y; if(key===last) continue; last=key;
    ctx.fillStyle='rgba('+A.rgb+','+(alpha*((i%3)?.7:1)).toFixed(2)+')'; ctx.fillRect(X,Y,1,1); }
  if(pulse!==undefined){ const t=1-pulse; for(let j=0;j<5;j++){ const [x,y]=rootAt(P,clamp(t+j*.014,0,1)); ctx.fillStyle=j?'rgba('+A.rgb+','+(.9-j*.15).toFixed(2)+')':'#ffffff'; ctx.fillRect(Math.round(x),Math.round(y),1,1); } } }

/* ---------- vivo: se mece, respira, suelta hojas; su voz ---------- */
const ROBLE={amp:0,rustle:0,shake:0,breath:0,glow:0,wave:null};
function robleTick(){ // cada fotograma en la plaza
  const talk=state==='dialog'&&dlg&&dlg.who==='RAÍZ';
  ROBLE.rustle=talk?Math.min(1,ROBLE.rustle+.04):ROBLE.rustle*.97;
  ROBLE.glow=talk?Math.min(1,ROBLE.glow+.08):Math.max(0,ROBLE.glow-.05);
  const target=(won?1.3:0)+ROBLE.rustle*1.5+ROBLE.shake;
  ROBLE.amp+=(target-ROBLE.amp)*.06; ROBLE.shake*=.93;
  if(won){ ROBLE.breath=(ROBLE.breath+1)%330; } // respira: cada 5,5 s las semillas se encienden a la vez
  const look=robleLook(), R=Math.random, cx=()=>ROBLE_X+14+R()*58, cy=()=>ROBLE_Y+10+R()*36;
  // lo que cae de la copa, según la estación
  if(look==='ash'&&(tick%97)===0) parts.push({k:'leafF',x:cx(),y:cy(),vx:(R()-.5)*.3,vy:.35,life:110,max:110,sway:R()*6,col:(tick&1)?'#6a7068':'#8a8a78',nog:true});
  if(look==='base'&&(tick%61)===0) parts.push({k:'leafF',x:cx(),y:cy(),vx:(R()-.5)*.3,vy:.35,life:110,max:110,sway:R()*6,col:(tick&1)?'#58b048':'#96dc68',nog:true});
  if(look==='spring'&&(tick%17)===0) parts.push({k:'petal',x:cx(),y:cy(),vx:.15+(R()-.5)*.3,vy:.3+R()*.15,life:140,max:140,sway:R()*6,col:(tick&16)?'#f8c8e0':'#ffe0f0',nog:true});
  if(look==='summer'&&(tick%19)===0) parts.push({k:'mote',x:cx(),y:cy()+10,vx:(R()-.5)*.2,vy:-.08-R()*.1,life:110,max:110,sway:R()*6,col:(tick&32)?'#fff7c0':'#ffffff',nog:true});
  if(look==='autumn'&&(tick%13)===0) parts.push({k:'leafF',x:cx(),y:cy(),vx:(R()-.5)*.5,vy:.4,life:120,max:120,sway:R()*6,col:['#e8a040','#c86830','#fcd878'][tick%3],nog:true});
  if(look==='winter'&&(tick%11)===0) parts.push({k:'flake',x:cx(),y:cy(),vx:(R()-.5)*.25,vy:.35,life:120,max:120,r:(tick&8)?1:0,col:'#ffffff',nog:true});
  if(talk&&(tick%23)===0) parts.push({k:'leafF',x:ROBLE_X+20+R()*46,y:ROBLE_Y+44+R()*8,vx:(R()-.5)*.4,vy:.3,life:90,max:90,sway:R()*6,col:look==='autumn'?'#fcd878':look==='spring'?'#f8c8e0':'#96dc68',nog:true}); // cuando habla, se le caen hojas
  if(ROBLE.breath===300) for(let i=0;i<3;i++) parts.push({k:'leafF',x:cx(),y:cy(),vx:(R()-.5)*.5,vy:.3,life:110,max:110,sway:R()*6,col:look==='autumn'?'#fcd878':'#96dc68',nog:true});
  // la savia de cada altar lleno sube como chispas
  for(const A of ROBLE_ALTARS) if(A.done()&&((tick+A.si*5)%18)===0) parts.push({x:A.tx*16+5+R()*6,y:A.ty*16-2,vx:0,vy:-.3,life:14,col:A.col,nog:true});
}
/* la copa en tiras de 2 px con un vaivén que se apaga hacia el tronco */
function robleSwayOff(yy,amp,ph){ const k=Math.max(0,1-yy/56); return Math.round(Math.sin(ph+yy*.09)*amp*k); }
function roblePaint(img,x,y,amp,ph,clip){ for(let yy=0;yy<img.height;yy+=2){ if(clip&&!clip(yy)) continue; ctx.drawImage(img,0,yy,img.width,2,x+robleSwayOff(yy,amp,ph),y+yy,img.width,2); } }
function drawRoble(ox,oy){ const ph=tick*.03, amp=ROBLE.amp, W=ROBLE.wave;
  if(W&&W.k<1&&W.from!==W.to){ // una estación que se extiende desde el tronco por la copa
    roblePaint(ROBLE_ART[W.from],ox,oy,amp,ph);
    const cx=ox+43, cy=oy+62, R=W.k*110; ctx.save(); ctx.beginPath();
    for(let y=0;y<82;y++){ const dy=oy+y+.5-cy, h=R*R-dy*dy; if(h>0){ const w=Math.sqrt(h); ctx.rect(Math.round(cx-w)-6,oy+y,Math.round(w*2)+12,1); } }
    ctx.clip(); roblePaint(ROBLE_ART[W.to],ox,oy,amp,ph); ctx.restore();
    // el filo de la ola: chispas de su color sobre la copa
    ctx.fillStyle=W.col||'#ffffff'; for(let i=0;i<26;i++){ const a=-Math.PI*(i/25), x=Math.round(cx+Math.cos(a)*R), y=Math.round(cy+Math.sin(a)*R*.9); if(y>oy&&y<oy+60&&((i+tick)&1)) ctx.fillRect(x,y,1,1); } }
  else roblePaint(ROBLE_ART[W?W.to:robleLook()],ox,oy,amp,ph);
  // los huecos de las semillas
  const bright=won&&ROBLE.breath>=276&&ROBLE.breath<318?Math.sin((ROBLE.breath-276)/42*Math.PI):0, lit=(W&&W.seeds!==undefined)?W.seeds:(won?8:-1);
  ROBLE_SEEDS.forEach(([ax,ay],i)=>{ const x=ox+ax+robleSwayOff(ay,amp,ph), y=oy+ay;
    if(i<lit){ ctx.fillStyle='#7a4a10'; ctx.fillRect(x,y+1,2,1); ctx.fillStyle=bright>.3||((((tick>>4)+i)&7)===0)?'#fff4b0':'#f8c848'; ctx.fillRect(x,y,2,1); ctx.fillStyle='#e0a030'; ctx.fillRect(x+1,y+1,1,1);
      if(bright>.5||(((tick>>3)+i*5)%37)===0) caStar(x+1,y,bright>.5?2:1,'#fffbe0'); }
    else { ctx.fillStyle='#120c08'; ctx.fillRect(x,y,2,2); // hueco vacío: si ya la llevas, late
      if(!won&&i<seeds){ ctx.fillStyle='rgba(255,200,90,'+(.35+.3*Math.sin(tick*.08+i)).toFixed(2)+')'; ctx.fillRect(x,y,2,2); } } });
  // la voz: cuando habla Raíz, el hueco del tronco se enciende (y parpadea al compás de las letras)
  if(ROBLE.glow>0){ const typing=state==='dialog'&&dlg&&dlg.chars<(dlg.pages[dlg.page]||'').length, a=ROBLE.glow*(typing&&(tick&4)?.95:.6);
    glowAt(ox+43,oy+62,9+ROBLE.glow*5,'rgba(255,196,110,'+(a*.6).toFixed(2)+')'); ctx.fillStyle='rgba(255,214,130,'+a.toFixed(2)+')'; ctx.fillRect(ox+42,oy+59,2,6); ctx.fillStyle='rgba(255,246,200,'+a.toFixed(2)+')'; ctx.fillRect(ox+42,oy+61,1,2); } }
function drawAltarRelic(A,lift){ const x=A.tx*16, y=A.ty*16, bob=Math.round(Math.sin(tick*.06+A.si*1.7)*1.2)-(lift||0);
  glowAt(x+8,y-2,11+Math.sin(tick*.08+A.si)*2,'rgba('+A.rgb+',.32)'); ctx.drawImage(A.spr(),x,y-10+bob); }
/* la plaza entera: raíces, Roble y reliquias en sus altares (lo llama drawScene) */
function drawPlaza(){ ctx.drawImage(ROBLE_ROOTS,0,0);
  for(const A of ROBLE_ALTARS) if(A.done()&&!(rite&&rite.A===A)) rootLight(A,1,.55+.25*Math.sin(tick*.05+A.si),((tick*.7+A.si*40)%150)/150);
  if(rite&&rite.A) riteRoot(rite);
  drawRoble(ROBLE_X,ROBLE_Y);
  for(const A of ROBLE_ALTARS){ const mine=rite&&rite.A===A; if(mine?rite.t>=RITE_T.land:A.done()) drawAltarRelic(A); } }

/* ---------- EL RITO DE ENTREGA ----------
   startRite('semillas'|'primavera'|'verano'|'otono'|'invierno', cb): la entrega se ve entera, en la plaza.
   · Las 8 semillas suben de Sprout en corro y vuelan, una a una, a sus huecos de la copa: el Roble despierta.
   · Una reliquia: Sprout la alza, vuela a su altar, la raíz lleva su luz al tronco y el Roble se estremece.
   En los dos, la estación nueva se extiende desde el tronco por la copa y por la plaza. Después, la
   cinemática del valle (playSeasonCinematic) y al final cb: las palabras de Raíz. Z lo acelera. */
let rite=null;
const RITE_T={bars:16,fly:50,land:92,tree:140,out:258,end:278}; // semillas: vuelan de 56 en adelante y el Roble despierta en 140
const RITE_NOTES=[72,74,76,77,79,81,83,84];
function startRite(kind,cb){ const A=altarOf(kind)||null;
  rite={kind,A,t:0,cb:cb||null,from:robleLook(),bgOld:null,done:false,hx:player.x+8,hy:player.y-6};
  state='rite'; toast=null; player.dir=0; player.atk=player.spin=player.charge=0; }
/* el momento en que la estación vuelve de verdad: se marca, se guarda y el Roble cambia */
function riteCommit(R){ if(R.done) return; R.done=true;
  if(bgDirty||!bgCanvas[0]) rebuildBg(); R.bgOld=bgCanvas.map(c=>{ const k=mkCanvas(160,128); if(c) k.getContext('2d').drawImage(c,0,0); return k; }); // la plaza de antes
  if(R.kind==='semillas'){ won=true; bloom(); } else if(R.kind==='primavera') thawed=true; else if(R.kind==='verano') summered=true; else if(R.kind==='otono') autumned=true; else cycled=true;
  for(const k in THUMBS) delete THUMBS[k]; // el mapa se repinta con la estación nueva
  markDirty(); save(); R.tCommit=R.t;
  ROBLE.wave={from:R.from,to:robleLook(),k:0,col:R.A?R.A.col:'#fff4b0',seeds:R.kind==='semillas'?8:undefined}; ROBLE.shake=3.5; }
function riteSeedAt(R,i){ // dónde está la semilla i: en corro sobre Sprout, volando, o ya en su hueco
  const t=R.t, t0=56+i*10, [ax,ay]=ROBLE_SEEDS[i], tx=ROBLE_X+ax+robleSwayOff(ay,ROBLE.amp,tick*.03), ty=ROBLE_Y+ay;
  const a=i/8*6.283+t*.06, rr=Math.min(1,Math.max(0,(t-16-i*3)/14))*22, ox=R.hx+Math.cos(a)*rr, oy=R.hy-14+Math.sin(a)*rr*.35-Math.min(1,t/40)*6;
  if(t<t0) return [ox,oy,0]; const k=Math.min(1,(t-t0)/16), e=CA_EASE.io(k);
  return [lerp(ox,tx,e),lerp(oy,ty,e)-Math.sin(Math.PI*k)*14,k]; }
function updRite(){ const R=rite; if(!R){ state='play'; return; } R.t++; const t=R.t, A=R.A, Rn=Math.random;
  updParts();
  if(keys.fire&&t>12&&t<RITE_T.out){ keys.fire=false; riteCommit(R); R.t=RITE_T.out; if(ROBLE.wave) ROBLE.wave.k=1; R.skip=true; } // Z: al grano
  if(A){
    if(t===18) beep('triangle',330,660,.4,.04); // la reliquia despierta en sus manos
    if(t===RITE_T.fly) swish(.34,.07,500,1800,900);
    if(t===RITE_T.land){ riteLandSfx(A.k); const x=A.tx*16+8, y=A.ty*16+2; parts.push({x,y,r:6,life:12,col:A.col,ring:true,nog:true}); for(let i=0;i<12;i++){ const a=i/12*6.283; parts.push({k:'shard',x,y:y-6,vx:Math.cos(a)*1.6,vy:Math.sin(a)*1.6-.4,life:14,max:14,col:i&1?'#ffffff':A.col}); } }
    if(t===RITE_T.land+6) beep('triangle',140,560,.8,.035); // la luz baja por la raíz
    if(t>RITE_T.land&&t<RITE_T.tree&&(t%3)===0){ const [x,y]=rootAt(rootPath(A),1-(t-RITE_T.land)/(RITE_T.tree-RITE_T.land)); parts.push({k:'shard',x,y,vx:(Rn()-.5)*.8,vy:-.4-Rn()*.5,life:12,max:12,col:A.col}); }
  } else {
    if(t===18) beep('triangle',262,524,.5,.035);
    for(let i=0;i<8;i++) if(t===56+i*10+16){ beep('square',f(RITE_NOTES[i]),0,.18,.03); const [x,y]=riteSeedAt(R,i); parts.push({k:'spark',x,y,vx:0,vy:0,life:8,max:8,col:'#fff4b0',nog:true}); }
  }
  if(t===RITE_T.tree&&!R.done){ riteCommit(R); const a=audio(), T=a.currentTime; beep('triangle',92,40,.9,.12,T); noise(.7,.05,false,T,600); SFX.secret(); }
  if(R.done&&ROBLE.wave) ROBLE.wave.k=Math.min(1,ROBLE.wave.k+1/56);
  // la estación sale de la copa: lo suyo por el aire
  if(R.done&&!R.skip&&t<RITE_T.tree+70&&(t%2)===0) for(let i=0;i<2;i++) parts.push(riteBurst(R.kind,ROBLE_X+14+Rn()*58,ROBLE_Y+8+Rn()*34));
  if(t>=RITE_T.end){ const cb=R.cb, kind=R.kind; rite=null; ROBLE.wave=null;
    const back=()=>{ state='play'; fadeIn=20; if(cb) cb(); };
    if(typeof playSeasonCinematic==='function') playSeasonCinematic(kind,back); else back(); } }
function riteBurst(kind,x,y){ const Rn=Math.random, a=Rn()*6.283, s=.4+Rn()*1.1;
  if(kind==='primavera') return {k:'petal',x,y,vx:Math.cos(a)*s,vy:Math.sin(a)*s*.6+.2,life:120,max:120,sway:Rn()*6,col:Rn()<.5?'#f8c8e0':'#ffe0f0',nog:true};
  if(kind==='verano') return {k:'mote',x,y,vx:Math.cos(a)*s*.6,vy:-.2-Rn()*.3,life:110,max:110,sway:Rn()*6,col:Rn()<.5?'#fff7c0':'#ffffff',nog:true};
  if(kind==='otono') return {k:'leafF',x,y,vx:Math.cos(a)*s,vy:Math.sin(a)*s*.5+.3,life:130,max:130,sway:Rn()*6,col:['#e8a040','#c86830','#fcd878'][(Rn()*3)|0],nog:true};
  if(kind==='invierno') return {k:'flake',x,y,vx:Math.cos(a)*s*.5,vy:.3+Rn()*.3,life:130,max:130,r:Rn()<.4?1:0,col:'#ffffff',nog:true};
  return {k:'leafF',x,y,vx:Math.cos(a)*s,vy:Math.sin(a)*s*.5+.2,life:120,max:120,sway:Rn()*6,col:Rn()<.5?'#96dc68':'#58b048',nog:true}; } // semillas: el Roble reverdece
function riteLandSfx(k){ const a=audio(), t=a.currentTime;
  if(k==='primavera'){ SFX.torch(); beep('triangle',180,720,.3,.05,t); }
  else if(k==='verano'){ [84,88,91].forEach((m,i)=>beep('triangle',f(m),f(m)*.98,.3,.03,t+i*.06)); noise(.2,.02,true,t,5000); }
  else if(k==='otono'){ swish(.4,.05,600,1400,500,t); beep('triangle',f(76),0,.35,.03,t+.05); }
  else { SFX.crystal(); }
  SFX.chime(); }
/* bajo el Roble: la luz que corre por la raíz del altar hasta el tronco */
function riteRoot(R){ const A=R.A, t=R.t; if(t<RITE_T.land) return;
  const k=Math.min(1,(t-RITE_T.land)/(RITE_T.tree-RITE_T.land)); rootLight(A,k,.9,k<1?k:((tick*.7)%150)/150);
  if(k<1){ const [x,y]=rootAt(rootPath(A),1-k); glowAt(x,y,7,'rgba('+A.rgb+',.6)'); } }
/* detrás de todo, en cuanto vuelve: la plaza de antes, fuera del círculo que crece desde el tronco */
function riteBgOld(){ const R=rite; if(!R||!R.bgOld||!R.done) return; const k=Math.min(1,(R.t-R.tCommit)/84); if(k>=1) return;
  const cx=80, cy=72, r=CA_EASE.in(k)*200; ctx.save(); ctx.beginPath();
  for(let y=0;y<128;y++){ const dy=y+.5-cy, h=r*r-dy*dy; if(h<=0){ ctx.rect(0,y,160,1); continue; } const w=Math.sqrt(h), a=Math.round(cx-w), b=Math.round(cx+w); if(a>0) ctx.rect(0,y,a,1); if(b<160) ctx.rect(b,y,160-b,1); }
  ctx.clip(); ctx.drawImage(R.bgOld[bgFrame()],0,0); ctx.restore();
  const col=R.A?R.A.col:'#d8f8a0'; ctx.fillStyle=col; // el filo de la estación que llega
  for(let i=0;i<64;i++){ const a=i/64*6.283, x=Math.round(cx+Math.cos(a)*r), y=Math.round(cy+Math.sin(a)*r); if(x>=0&&x<160&&y>=0&&y<128&&((i+(tick>>1))%3)) ctx.fillRect(x,y,1,1); } }
/* encima de todo: franjas de cine, la reliquia (o las semillas) en vuelo, el haz del altar y el fundido */
function drawRite(){ const R=rite; if(!R) return; const t=R.t, A=R.A;
  if(A){ const [hx,hy]=[R.hx,R.hy], ax=A.tx*16+8, ay=A.ty*16-2, img=A.spr();
    if(t<RITE_T.fly){ const up=Math.min(1,Math.max(0,(t-10)/30)), y=hy-10-up*6; glowAt(hx,y,10+Math.sin(t*.3)*2,'rgba('+A.rgb+',.5)'); ctx.drawImage(img,Math.round(hx-8),Math.round(y-8)); if(t>14&&(t&7)===0) caStar(hx+(t&8?6:-6),y-6,2,'#ffffff'); }
    else if(t<RITE_T.land){ const k=(t-RITE_T.fly)/(RITE_T.land-RITE_T.fly), e=CA_EASE.io(k), x=lerp(hx,ax,e), y=lerp(hy-16,ay-8,e)-Math.sin(Math.PI*k)*30;
      for(let i=1;i<=6;i++){ const k2=Math.max(0,k-i*.035), e2=CA_EASE.io(k2); ctx.fillStyle=i<3?'#ffffff':'rgba('+A.rgb+','+(.8-i*.1).toFixed(2)+')'; ctx.fillRect(Math.round(lerp(hx,ax,e2)),Math.round(lerp(hy-16,ay-8,e2)-Math.sin(Math.PI*k2)*30),i<3?2:1,i<3?2:1); }
      glowAt(x,y,10,'rgba('+A.rgb+',.5)'); ctx.drawImage(img,Math.round(x-8),Math.round(y-8)); }
    if(t>=RITE_T.land&&t<RITE_T.land+30){ const k=(t-RITE_T.land)/30, w=Math.max(1,Math.round(5*(1-k))); ctx.fillStyle='rgba(255,255,255,'+(.9*(1-k)).toFixed(2)+')'; ctx.fillRect(ax-(w>>1),0,w,ay+4); ctx.fillStyle='rgba('+A.rgb+','+(.6*(1-k)).toFixed(2)+')'; ctx.fillRect(ax-(w>>1)-1,0,w+2,ay+4); } } // el haz del altar
  else for(let i=0;i<8;i++){ if(t<16+i*3) continue; const [x,y,k]=riteSeedAt(R,i); if(k>=1) continue; glowAt(x,y,5,'rgba(255,230,140,.5)'); ctx.drawImage(ACORN_GOLD,Math.round(x-4),Math.round(y-4)); }
  const bh=Math.round(12*CA_EASE.out(Math.min(1,t/RITE_T.bars))); ctx.fillStyle='#000'; ctx.fillRect(0,0,160,bh); ctx.fillRect(0,128-bh,160,bh); // franjas de cine
  if(t>RITE_T.out){ ctx.fillStyle='rgba(255,255,244,'+Math.min(1,(t-RITE_T.out)/(RITE_T.end-RITE_T.out)).toFixed(2)+')'; ctx.fillRect(0,0,160,144); } }

/* ============================================================
   LAS CINEMÁTICAS DEL VALLE: la estación sale del Roble y recorre las
   pantallas de verdad del valle (las mismas que luego pisarás cambiadas).
   playSeasonCinematic('semillas'|'primavera'|'verano'|'otono'|'invierno', cb)
   Cada guion (SC[kind]) vive entre sus rayas: len, title, sub, prep(c), cues{t:fn}, tick(t,c), draw(t,c).
   Z salta al final. Las partículas del guion van en c.parts (las pinta caParts, de 15e).
   ============================================================ */
let seasonCine=null;
function relicSprite(kind){ return kind==='primavera'?EMBER_SPR:kind==='verano'?TEAR_SPR:kind==='otono'?AMBER_SPR:kind==='invierno'?FLAKE_SPR:ACORN_GOLD; }
/* el bioma y el suelo de una pantalla con unas banderas concretas (sin tocar la partida): st={won,thawed,summered,autumned,cycled,force} */
function scState(key,st){ const [x,y]=key.split(',').map(Number), keep=[won,thawed,summered,autumned,cycled,SEASON_FORCE];
  won=!!st.won; thawed=!!st.thawed; summered=!!st.summered; autumned=!!st.autumned; cycled=!!st.cycled; SEASON_FORCE=st.force===undefined?null:st.force;
  const r=regionOf(x,y), out=[screenBiome(x,y),r==='norte'?((thawed&&y===-1)?'.':'n'):r==='marisma'?(summered?'.':'·'):'.'];
  [won,thawed,summered,autumned,cycled,SEASON_FORCE]=keep; return out; }
/* una pantalla del mundo pintada en frío (sin bichos ni objetos), y tiras de varias seguidas para pasearlas */
const SC_CACHE=new Map();
function scScreen(key,bio,floor,f){ const k=key+'|'+bio+'|'+floor+'|'+(f||0); let c=SC_CACHE.get(k); if(c) return c; if(!MAPS[key]) return null;
  const [x,y]=key.split(',').map(Number), rows=MAPS[key].map(r=>[...r].map(ch=>(ENEMY_MARK[ch]||MIDBOSS_MARK[ch]||BOSS_MARK[ch]||ITEM_MARK[ch]||/[1-8]/.test(ch))?'.':ch));
  c=mkCanvas(160,128); renderScreenTo(c.getContext('2d'),rows,0,0,{bio,style:'cave',floor:floor||'.',sx:x,sy:y,crystal:false,openChests:new Set()},f||0);
  SC_CACHE.set(k,c); if(SC_CACHE.size>48) SC_CACHE.delete(SC_CACHE.keys().next().value); return c; }
function scStrip(keys,st,vertical,f){ const k='S|'+keys.join(';')+'|'+JSON.stringify(st)+'|'+(vertical?1:0)+'|'+(f||0); let c=SC_CACHE.get(k); if(c) return c;
  c=mkCanvas(vertical?160:160*keys.length,vertical?128*keys.length:128); const g=c.getContext('2d');
  keys.forEach((key,i)=>{ const [bio,floor]=scState(key,st), s=scScreen(key,bio,floor,f); if(s) g.drawImage(s,vertical?0:i*160,vertical?i*128:0); });
  SC_CACHE.set(k,c); return c; }
/* el Roble dentro de una tira (si la plaza sale en ella), con su estación y su vaivén */
function scOak(look,x,y){ roblePaint(ROBLE_ART[look],x+ROBLE_X,y+ROBLE_Y,1.3,tick*.03); }
/* dos estados de una tira separados por un frente (horizontal: 'up' sube por la tira) con su filo dibujado por el guion */
function scFrontY(img0,img1,sx,sy,frontY,edge){ // img1 (lo nuevo) por debajo de frontY (en coords de la tira), img0 por encima
  ctx.drawImage(img1,-sx,12-sy); const cut=Math.round(frontY-sy+12); if(cut>12){ ctx.save(); ctx.beginPath();
    for(let y=12;y<Math.min(132,cut+4);y++){ const wob=Math.round(Math.sin((y+tick*.2)*.5)*1.5+Math.sin(y*1.7)*1); if(y<cut+wob) ctx.rect(0,y,160,1); }
    ctx.clip(); ctx.drawImage(img0,-sx,12-sy); ctx.restore(); }
  if(edge) edge(cut); }
function playSeasonCinematic(kind,cb){ const S=SC[kind]||SC.primavera;
  seasonCine={kind:SC[kind]?kind:'primavera',t:0,cb:cb||null,parts:[],len:S.len||420,rng:seeded(kind.length*31+7)}; state='seasoncine'; parts=[]; toast=null;
  if(AC&&typeof TRACKS!=='undefined'&&TRACKS.estacion) setTrack('estacion');
  if(S.prep) S.prep(seasonCine); }
function updSeasonCine(){ const c=seasonCine; if(!c){ state='play'; return; } const S=SC[c.kind]; c.t++;
  const cue=S.cues&&S.cues[c.t]; if(cue) try{ cue(c); }catch(_){}
  if(S.tick) S.tick(c.t,c);
  if(c.t===(S.titleAt||c.len-160)){ if(AC) SFX.fanfare(); }
  for(const p of c.parts){ p.x+=p.vx; p.y+=p.vy; p.vy+=p.g||0; if(p.fr){ p.vx*=p.fr; p.vy*=p.fr; } if(p.k==='petal') p.vx+=Math.sin((p.t+(p.ph||0)*9)*.15)*.03; p.t++; if(p.rot!==undefined) p.rot+=p.vr||0; }
  c.parts=c.parts.filter(p=>p.t<p.life&&p.y<VH+8&&p.x>-20&&p.x<VW+20);
  if(keys.fire&&c.t>30){ keys.fire=false; c.t=Math.max(c.t,c.len-20); }
  if(c.t>=c.len){ const cb=c.cb; seasonCine=null; state='play'; parts=[]; fadeIn=24; if(cb) cb(); } }
function drawSeasonCine(){ const c=seasonCine; if(!c) return; const S=SC[c.kind], t=c.t, L=c.len, ta=S.titleAt||L-160;
  ctx.fillStyle='#000'; ctx.fillRect(0,0,160,144);
  S.draw(t,c); caParts(c);
  ctx.fillStyle='#000'; ctx.fillRect(0,0,160,12); ctx.fillRect(0,132,160,12); // franjas de cine
  if(t>=ta){ const k=Math.min(1,(t-ta)/18), a=Math.min(1,(t-ta)/12,(L-t)/14), y=Math.round(18-(1-easeOutBack(k))*14); // el rótulo
    ctx.globalAlpha=a; ribbon(80,y,textW(S.title)+14,S.title); if(S.sub) txtSO(S.sub.toUpperCase(),80,135,'#fff6d0','center','#1a1408'); ctx.globalAlpha=1; }
  if(t<22){ ctx.fillStyle='rgba(255,255,244,'+(1-t/22).toFixed(2)+')'; ctx.fillRect(0,0,160,144); } // venimos del fogonazo del rito
  if(t>L-18){ ctx.fillStyle='rgba(6,12,7,'+((t-(L-18))/18).toFixed(2)+')'; ctx.fillRect(0,0,160,144); } }

const SC={
  /* ═════════ semillas ═════════ */
  // (guion: las ocho semillas vuelven y el valle revive)
  /* ═════════ primavera ═════════ */
  primavera:{ len:440, title:'VUELVE LA PRIMAVERA', sub:'la Brasa late en su altar', titleAt:306,
    // la cámara sube desde el Roble en flor, por el bosque, hasta el campo helado del norte; el deshielo sube con ella
    keys:['1,-1','1,0','1,1'],
    prep(c){ c.old=scStrip(this.keys,{won:true},true); c.nu=scStrip(this.keys,{won:true,thawed:true},true); },
    camY(t){ return caK(t,[[0,262],[40,262],[196,6,'io']]); },            // arriba de la vista, en y de la tira (la plaza empieza en 256)
    front(t){ return t<196?this.camY(t)+96:caK(t,[[196,102],[300,-36,'io']]); }, // la línea del deshielo sube con la cámara y, al llegar, cruza el campo
    cues:{ 24:()=>SFX.chime(), 150:()=>noise(1.2,.02,false,undefined,900), 214:()=>{ const a=audio(),t=a.currentTime; [72,76,79,84].forEach((m,i)=>beep('triangle',f(m),0,.3,.03,t+i*.08)); } },
    tick(t,c){ const R=c.rng, sy=this.camY(t), fy=this.front(t)-sy+12;
      if(fy>12&&(t%3)===0) c.parts.push({k:'dot',x:R()*160,y:12+R()*Math.min(120,fy-12),vx:(R()-.5)*.2,vy:.5+R()*.4,g:0,t:0,life:60,col:'#ffffff'}); // nieve que aún cae arriba
      if(fy<132&&(t%2)===0) for(let i=0;i<2;i++){ const x=R()*160; c.parts.push({k:'smoke',x,y:fy+R()*3,vx:(R()-.5)*.2,vy:-.35-R()*.3,t:0,life:26,r0:1,r1:4,col:'#f4f8ff',a:.6}); } // vaho del deshielo
      if(fy<132&&(t%4)===0) c.parts.push({k:'petal',x:R()*160,y:Math.max(14,fy+6+R()*20),vx:.2+R()*.4,vy:-.2,g:.004,fr:1,t:0,life:120,ph:(R()*4)|0,col:R()<.5?'#f8c8e0':'#fffbe8'});
      if(t>296&&(t%6)===0) c.parts.push({k:'petal',x:-4,y:20+R()*100,vx:.6+R()*.6,vy:.1,g:.002,fr:1,t:0,life:240,ph:(R()*4)|0,col:R()<.6?'#f8a8d0':'#fff4f8'}); },
    draw(t,c){ const sy=Math.round(this.camY(t)), fy=this.front(t);
      scFrontY(c.old,c.nu,0,sy,fy,cut=>{ if(cut<12||cut>132) return; // el filo: luz tibia y chispas
        ctx.fillStyle='rgba(255,236,190,.35)'; ctx.fillRect(0,cut-3,160,3); ctx.fillStyle='rgba(255,248,220,.7)'; for(let x=(tick*2)%6;x<160;x+=6) ctx.fillRect(x,cut-1+((x>>3)&1),2,1); });
      // el Roble en flor (y Sprout y Raíz mirándolo) mientras la plaza está en plano
      const oy=256-sy+12; if(oy<132){ scOak('spring',0,oy); ctx.drawImage(ELDER,64,oy+64); ctx.drawImage(P_SPRITES[1][0],64,oy+74); }
      if(t>=290){ const k=Math.min(1,(t-290)/40); glowAt(80,72,40+k*50,'rgba(255,240,200,'+(.18*k).toFixed(2)+')'); } } }, // el campo, al sol
  /* ═════════ verano ═════════ */
  // (guion: vuelve el verano)
  /* ═════════ otono ═════════ */
  // (guion: vuelve el otoño)
  /* ═════════ invierno ═════════ */
  // (guion: vuelve el invierno y las cuatro estaciones giran)
  /* ═════════ fin ═════════ */
};
