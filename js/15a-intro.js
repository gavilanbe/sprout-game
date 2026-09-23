'use strict';
/* ============================================================
   INTRO CINEMATOGRÁFICA DEL TÍTULO (a lo Oracle of Seasons)
   A · noche: cae una semilla-estrella             0 … INTRO_A
   B · carrera: Sprout corre y las estaciones
       cambian a su paso (barrida de luz)           INTRO_A … TITLE_INTRO
   C · el Roble: la cámara sube y las 8 semillas
       vuelven a la copa; luego cae el logo         TITLE_INTRO …
   En el menú las estaciones siguen girando tras el logo.
   ============================================================ */
const INTRO_A=170, SEASON_LEN=80;
const SEASONS=[
  {name:'PRIMAVERA', sky:['#5aa0ec','#8cc4f8','#c8e8ff'], mount:['#6a80b8','#8ea4d4','#e8f0ff'], hill:'valley', ground:['#78c850','#58a840','#3c8a34','#a4e070'], flowers:['#f8a0d0','#fffbe8','#f04848'], cloud:'#ffffff', sun:'#fff6d0', part:'petal', partCol:['#f8c8e0','#ffffff']},
  {name:'VERANO', sky:['#2c78e0','#58a8f4','#a8dcff'], mount:['#5a72a8','#7e96c8','#d8e4f8'], hill:'summer', ground:['#8cd04a','#6aac3a','#4c8e30','#bcea68'], flowers:['#f8d030','#fffbe8','#f07030'], cloud:'#ffffff', sun:'#fffbe0', part:'mote', partCol:['#fff7a0','#ffffff']},
  {name:'OTOÑO', sky:['#c86050','#f09860','#ffd8a0'], mount:['#8a5a70','#b07a80','#f8d8c0'], hill:'autumn', ground:['#d0a850','#b08838','#8a6c30','#ecc870'], flowers:['#e87040','#fff0c0','#c83828'], cloud:'#ffe8d0', sun:'#fff0b0', part:'leafF', partCol:['#e8a040','#c86424']},
  {name:'INVIERNO', sky:['#7890c0','#a0b4dc','#dce8f8'], mount:['#8a98c0','#b0bedc','#ffffff'], hill:'snow', ground:['#e8f0f8','#cddcec','#b0c4dc','#ffffff'], flowers:['#e8f0f8','#ffffff','#cddcec'], cloud:'#f4f8ff', sun:'#ffffff', part:'flake', partCol:['#ffffff','#dff0ff']},
];
/* degradado en bandas con tramado entre ellas (sin suavizado) */
function bandSky(g,w,h,cols){ const n=cols.length-1;
  for(let y=0;y<h;y++){ const t=y/(h-1)*n, i=Math.min(n-1,t|0), f=t-i;
    for(let x=0;x<w;x++){ const pick=f>BAYER4[y&3][x&3]/16?cols[i+1]:cols[i]; g.fillStyle=pick; g.fillRect(x,y,1,1); } } }
/* ---------- capas del paralaje, precalculadas por estación (320 px de ancho: repiten) ---------- */
const PARA=SEASONS.map((S,si)=>{
  const sky=mkCanvas(160,128); bandSky(sky.getContext('2d'),160,100,S.sky);
  { const g=sky.getContext('2d'); g.fillStyle=S.sky[2]; g.fillRect(0,100,160,28); }
  // nubes
  const clouds=mkCanvas(320,40); { const g=clouds.getContext('2d'); const rnd=seeded(11+si);
    for(let i=0;i<5;i++){ const x=10+i*64+((rnd()*20)|0), y=4+((rnd()*18)|0);
      blobArt(g,x,y,40,16,[{x:10,y:10,r:7},{x:20,y:7,r:8},{x:30,y:10,r:6.5},{x:20,y:11,r:7}],[shade(S.cloud,-.18),shade(S.cloud,-.08),S.cloud,S.cloud,'#ffffff'],{outline:false,grad:.8,dither:.6}); } }
  // montañas lejanas: crestas por suma de senos, con nieve en las cumbres
  const mount=mkCanvas(320,60); { const g=mount.getContext('2d');
    for(let x=0;x<320;x++){ const a=x/320*6.283; const h=Math.round(30+Math.sin(a*2)*12+Math.sin(a*5+1)*7+Math.sin(a*11)*3);
      for(let y=60-h;y<60;y++){ const d=y-(60-h); const lit=(Math.sin(a*2)*12+Math.sin(a*5+1)*7)-(Math.sin((a+.02)*2)*12+Math.sin((a+.02)*5+1)*7)>0;
        g.fillStyle=d<(si===3?9:4)?S.mount[2]:(lit?S.mount[1]:S.mount[0]); g.fillRect(x,y,1,1); } } }
  // colinas con árboles del bioma
  const hills=mkCanvas(320,48); { const g=hills.getContext('2d'); const G=BIOMES[S.hill].grass;
    for(let x=0;x<320;x++){ const a=x/320*6.283; const h=Math.round(18+Math.sin(a*3+.5)*6+Math.sin(a*7)*2);
      for(let y=48-h;y<48;y++){ const d=y-(48-h); g.fillStyle=d===0?G[3]:d<3?G[0]:(((x+y)&1)&&d<5)?G[0]:G[1]; g.fillRect(x,y,1,1); } }
    for(let i=0;i<14;i++){ const x=(i*23+((i*37)%11))%320, a=x/320*6.283, top=48-Math.round(18+Math.sin(a*3+.5)*6+Math.sin(a*7)*2);
      const t=treeArt(S.hill,i&1); g.drawImage(t,x-8,top-16); if(x<16) g.drawImage(t,x+320-8,top-16); } }
  // suelo cercano: hierba con matas, flores y postes de valla
  const ground=mkCanvas(320,30); { const g=ground.getContext('2d'); const G=S.ground, F=S.flowers;
    g.fillStyle=G[0]; g.fillRect(0,4,320,26); g.fillStyle=G[3]; g.fillRect(0,4,320,1); g.fillStyle=G[1]; g.fillRect(0,5,320,1);
    for(let x=0;x<320;x+=2){ const h=hash(x,si)%4; if(h===0){ g.fillStyle=G[0]; g.fillRect(x,3,1,1); g.fillRect(x+1,2,1,2); } }
    const rnd=seeded(77+si);
    for(let i=0;i<40;i++){ const x=(rnd()*318)|0, y=8+((rnd()*20)|0); g.fillStyle=G[1]; g.fillRect(x,y,1,1); g.fillRect(x+2,y,1,1); g.fillStyle=G[2]; g.fillRect(x+1,y+1,1,1); }
    for(let i=0;i<16;i++){ const x=(rnd()*316)|0, y=9+((rnd()*18)|0), c=F[i%3]; g.fillStyle=c; g.fillRect(x+1,y,1,1); g.fillRect(x,y+1,3,1); g.fillRect(x+1,y+2,1,1); g.fillStyle=C.flowerC; g.fillRect(x+1,y+1,1,1); }
    for(let x=6;x<320;x+=80){ g.fillStyle=PAL.k; g.fillRect(x,0,4,14); g.fillStyle=si===3?'#9a8a78':'#a06a38'; g.fillRect(x+1,1,2,12); g.fillStyle=si===3?'#ffffff':'#c89058'; g.fillRect(x+1,1,1,12); if(si===3){ g.fillStyle='#ffffff'; g.fillRect(x,0,4,2); } } }
  // primer plano: matas altas que pasan rápidas por delante
  const fore=mkCanvas(320,30); { const g=fore.getContext('2d'); const G=S.ground, dk=shade(G[2],-.25);
    for(let c=0;c<6;c++){ const cx=20+c*53+(hash(c,si)%20);
      for(let i=0;i<9;i++){ const x=cx+i*2-8, h=18+((hash(i,c+si)%11)); g.fillStyle=dk; g.fillRect(x,30-h,2,h); g.fillStyle=G[2]; g.fillRect(x,30-h,1,h-2); g.fillStyle=G[1]; g.fillRect(x,30-h,1,2); }
      if(si===3){ g.fillStyle='#ffffff'; g.fillRect(cx-8,14,18,2); } } }
  return {sky,clouds,mount,hills,ground,fore};
});
/* ---------- plano A: la noche y la semilla-estrella ---------- */
const NIGHT=(()=>{ const c=mkCanvas(160,144), g=c.getContext('2d');
  bandSky(g,160,110,['#05051a','#0c0c2c','#1e1c48','#3e2e5a']); g.fillStyle='#3e2e5a'; g.fillRect(0,110,160,34);
  // luna creciente
  for(let y=-10;y<=10;y++) for(let x=-10;x<=10;x++){ const d=x*x+y*y, d2=(x-4)*(x-4)+(y+2)*(y+2); if(d<=90&&d2>70){ g.fillStyle=d>60?'#e8d8a0':'#fff4c8'; g.fillRect(30+x,26+y,1,1); } }
  // montes y el Roble en silueta
  for(let x=0;x<160;x++){ const a=x/160*6.283, h=Math.round(26+Math.sin(a*1.5+1)*9+Math.sin(a*4)*3); g.fillStyle='#1a1a3a'; g.fillRect(x,144-h-18,1,h+18); }
  for(let x=0;x<160;x++){ const a=x/160*6.283, h=Math.round(16+Math.sin(a*2.3)*5); g.fillStyle='#0e1426'; g.fillRect(x,144-h,1,h); }
  g.drawImage(tintTo(OAK,'#0c1224'),58,86,44,42);
  g.fillStyle='#0e1426'; g.fillRect(40,128,80,16);
  g.fillStyle='#f8d070'; g.fillRect(108,124,2,2); g.fillRect(122,127,2,2); // ventanas encendidas
  return c; })();
const STARS=(()=>{ const r=seeded(5), out=[]; for(let i=0;i<70;i++) out.push([(r()*160)|0,(r()*100)|0,r()<.12,(r()*60)|0]); return out; })();
function seedFallPos(t){ const k=clamp((t-40)/110,0,1), e=k*k; return [150-e*96+Math.sin(k*3)*8, -10+e*122]; }
function drawShotA(t){
  ctx.drawImage(NIGHT,0,0);
  for(const [x,y,big,ph] of STARS){ const tw=((tick+ph*7)>>3)%8; if(tw===0) continue; ctx.fillStyle=tw<3?'#8888b8':'#fffbe8';
    ctx.fillRect(x,y,1,1); if(big&&tw>4){ ctx.fillStyle='rgba(255,251,232,.5)'; ctx.fillRect(x-1,y,3,1); ctx.fillRect(x,y-1,1,3); } }
  if(t>=40&&t<150){ const [x,y]=seedFallPos(t); glowAt(x,y,16,'rgba(255,230,140,.45)'); ctx.drawImage(ACORN_GOLD,(x-4)|0,(y-4)|0); }
  if(t>=150){ const k=(t-150)/20; glowAt(52,112,20+k*80,'rgba(255,240,180,'+(0.9-k*.2).toFixed(2)+')'); }
}
/* ---------- plano B: la carrera por las cuatro estaciones ---------- */
function drawSeasonScene(si,t,scroll){
  const P=PARA[si], S=SEASONS[si];
  ctx.drawImage(P.sky,0,0);
  const sunY=si===2?40:22, sunX=si===2?118:120; glowAt(sunX,sunY,20,'rgba(255,250,220,.35)'); ctx.drawImage(disc(7,S.sun),sunX-7,sunY-7);
  const L=(img,sp,y)=>{ const w=img.width, o=Math.round((scroll*sp)%w); ctx.drawImage(img,-o,y); ctx.drawImage(img,w-o,y); };
  L(P.clouds,.25,16); L(P.mount,.5,40); L(P.hills,1.2,50); L(P.ground,3,94);
  ctx.fillStyle=shade(S.ground[1],-.12); ctx.fillRect(0,124,160,20);
}
function drawShotB(t){
  const u=t-INTRO_A, si=Math.min(3,(u/SEASON_LEN)|0), w=u-si*SEASON_LEN, scroll=u*1.4;
  drawSeasonScene(si,t,scroll);
  // barrida de luz: la estación nueva entra de derecha a izquierda
  if(si<3&&w>SEASON_LEN-18){ const k=(w-(SEASON_LEN-18))/18, wx=Math.round(160-k*176);
    ctx.save(); ctx.beginPath(); ctx.rect(wx,0,160,144); ctx.clip(); drawSeasonScene(si+1,t,scroll); ctx.restore();
    ctx.fillStyle='rgba(255,255,240,.85)'; ctx.fillRect(wx-1,0,2,144); ctx.fillStyle='rgba(255,255,240,.35)'; ctx.fillRect(wx-4,0,3,144); }
  // Sprout corriendo, a doble tamaño, con rebote y polvo
  const f=(u>>2)&3, bob=(f&1)?-2:0, px=56, py=84+bob;
  drawShadow(px+16,115,9);
  ctx.drawImage(P_SPRITES[3][f],px,py,32,32);
  if(u<SEASON_LEN*4-10&&(u&7)===0) parts.push({k:'dust',x:px+10,y:114,vx:-1.6,vy:-.2,life:16,max:16,r:2,col:SEASONS[si].ground[3],nog:true});
}
function spawnIntroParts(t){
  if(t>=40&&t<150){ const [x,y]=seedFallPos(t); if((t&1)===0) parts.push({k:'shard',x:x+(Math.random()-.5)*4,y:y-2,vx:(Math.random()-.5)*.3,vy:-.2,life:18,max:18,col:(t&2)?'#fff0a0':'#ffffff',nog:true}); }
  if(t===150){ parts.length=0; for(let i=0;i<14;i++){ const a=i/14*6.283; parts.push({k:'shard',x:52,y:112,vx:Math.cos(a)*2.6,vy:Math.sin(a)*2.6,life:18,max:18,col:'#fff6c0',nog:true}); } }
  if(t>=INTRO_A&&t<TITLE_INTRO){ const si=Math.min(3,((t-INTRO_A)/SEASON_LEN)|0), S=SEASONS[si];
    if((t&3)===0){ const k=S.part; parts.push({k,x:170,y:Math.random()*100,vx:-1.6-Math.random()*1.4,vy:(Math.random()-.3)*.5,life:120,max:120,sway:Math.random()*6,r:(t&8)?1:0,col:S.partCol[(t>>2)&1],nog:true}); } }
  if(t===INTRO_A||t===TITLE_INTRO) parts.length=0;
}
function introSfx(t){ if(!AC) return;
  if(t===40) SFX.shing(); if(t===150){ SFX.chime(); noise(.3,.05,false); }
  if(t>INTRO_A&&t<TITLE_INTRO){ const w=(t-INTRO_A)%SEASON_LEN; if(w===SEASON_LEN-18&&t<INTRO_A+SEASON_LEN*3) SFX.swoosh(); if(w===SEASON_LEN-1&&t<INTRO_A+SEASON_LEN*3) SFX.ping(); }
  if(t===TITLE_INTRO) SFX.chime();
}
/* franjas de cine y rótulos */
const INTRO_CAPS=[[8,140,'UNA NOCHE, CAYÓ UNA SEMILLA DEL CIELO'],[INTRO_A+6,INTRO_A+150,'Y EL VALLE DESPERTÓ CON ELLA'],[INTRO_A+170,TITLE_INTRO-8,'PRIMAVERA, VERANO, OTOÑO, INVIERNO']];
function drawLetterbox(t,k){ const h=Math.round(14*k); ctx.fillStyle='#000'; ctx.fillRect(0,0,160,h); ctx.fillRect(0,144-h,160,h);
  for(const [a,b,s] of INTRO_CAPS) if(t>=a&&t<b){ const al=Math.min(1,(t-a)/14,(b-t)/14); ctx.globalAlpha=al; txtS(s,80,135,'#e8dcc0','center'); ctx.globalAlpha=1; } }
/* ---------- la escena del título: el Gran Roble en su colina, con la estación del momento ---------- */
const OAK_SEASON=(()=>{ const to=[
    ['#0c2e1a','#1a5a2c','#2c8038','#4aa444','#f0a0c8','#ffd8ec'],   // primavera: el Roble en flor
    null,                                                              // verano: tal cual
    ['#4a1c0c','#8a3a14','#b85a1c','#e08a30','#f4b850','#fce090'],   // otoño
    ['#10302a','#1c5a3a','#2e7a4a','#8ab8a0','#dce8f0','#ffffff']];  // invierno: nieve en la copa
  return to.map(t=>{ if(!t) return OAK_GRAND; const m={}; OAK_LEAF.forEach((c,i)=>m[c]=t[i]); return recolor(OAK_GRAND,m); }); })();
const TITLE_HILL=SEASONS.map(S=>{ const c=mkCanvas(160,50), g=c.getContext('2d'), G=S.ground;
  for(let x=0;x<160;x++){ const top=Math.round(14+Math.pow(Math.abs(x-80)/80,1.6)*18);
    for(let y=top;y<50;y++){ const d=y-top; g.fillStyle=d===0?G[3]:d<3?G[0]:(d<5&&((x+y)&1))?G[0]:y>40?G[1]:G[0]; g.fillRect(x,y,1,1); } }
  const r=seeded(9); for(let i=0;i<26;i++){ const x=(r()*156)|0, y=24+((r()*24)|0); g.fillStyle=G[1]; g.fillRect(x,y,1,1); g.fillRect(x+2,y,1,1); g.fillStyle=G[2]; g.fillRect(x+1,y+1,1,1); }
  for(let i=0;i<10;i++){ const x=(r()*154)|0, y=26+((r()*20)|0), col=S.flowers[i%3]; g.fillStyle=col; g.fillRect(x+1,y,1,1); g.fillRect(x,y+1,3,1); g.fillRect(x+1,y+2,1,1); g.fillStyle=C.flowerC; g.fillRect(x+1,y+1,1,1); }
  return c; });
function drawTitleScene(si,crane){
  const S=SEASONS[si], P=PARA[si], d=k=>Math.round((1-crane)*k);
  ctx.drawImage(P.sky,0,d(-6)); glowAt(128,24+d(8),22,'rgba(255,250,220,.35)'); ctx.drawImage(disc(7,S.sun),121,17+d(8));
  const drift=Math.round((tick*.12)%320); ctx.drawImage(P.clouds,-drift,20+d(10)); ctx.drawImage(P.clouds,320-drift,20+d(10));
  ctx.drawImage(P.mount,-40,52+d(24)); ctx.drawImage(P.hills,-90,66+d(40));
  const hy=94+d(64); ctx.drawImage(TITLE_HILL[si],0,hy);
  const oy=hy-58; drawShadow(80,hy+24,26); ctx.drawImage(OAK_SEASON[si],37,oy);
  // Sprout mira al Roble, a doble tamaño, con parpadeo
  const blink=((tick+40)%180)<6, spr=blink?P_BLINK[3]:P_SPRITES[3][0], bob=((tick>>5)&1)?1:0;
  drawShadow(28,hy+36,8); ctx.drawImage(spr,12,hy+6+bob,32,32);
}
function drawSeasonWorld(){
  const crane=titleT<TITLE_INTRO?0:1-Math.pow(1-clamp((titleT-TITLE_INTRO)/TITLE_PAN_D,0,1),3);
  if(titleT<TITLE_MENU){ drawTitleScene(0,crane); return; }
  const si=menuSeason(), w=(titleT-TITLE_MENU)%MENU_SEASON, prev=(si+3)%4;
  if(w<26&&titleT>=TITLE_MENU+MENU_SEASON){ drawTitleScene(prev,1); const r=Math.round(w*8), cx=LOGO_POS[3]+11, cy=LOGO_Y+14;
    ctx.save(); ctx.beginPath(); ctx.arc(cx,cy,r,0,6.283); ctx.clip(); drawTitleScene(si,1); ctx.restore();
    ctx.strokeStyle='rgba(255,255,240,.9)'; ctx.lineWidth=2; ctx.beginPath(); ctx.arc(cx,cy,r,0,6.283); ctx.stroke(); }
  else drawTitleScene(si,1);
}
/* ---------- plano C: las 8 semillas vuelven a la copa ---------- */
function drawSeedsHome(){
  const t=titleT-TITLE_INTRO; if(t<0||t>TITLE_PAN_D+40) return;
  for(let i=0;i<8;i++){ const k=clamp((t-i*6)/(TITLE_PAN_D-10),0,1), e=1-(1-k)*(1-k);
    const a=i/8*6.283+t*.06, rad=(1-e)*46+12, x=80+Math.cos(a)*rad, y=150-e*96+Math.sin(a)*rad*.4;
    if(k>=1){ if(((t+i*5)&15)<8) sparkle(80+Math.cos(a)*18,62+Math.sin(a)*8,'#fff0a0'); continue; }
    glowAt(x,y,8,'rgba(255,230,140,.45)'); ctx.drawImage(ACORN_GOLD,(x-4)|0,(y-4)|0); }
}
/* ---------- tras el logo: las estaciones giran ---------- */
const MENU_SEASON=300;
function menuSeason(){ return titleT<TITLE_MENU?0:(((titleT-TITLE_MENU)/MENU_SEASON)|0)%4; }
function drawSeasonTint(){
  if(titleT<TITLE_MENU) return; const si=menuSeason(), w=(titleT-TITLE_MENU)%MENU_SEASON;
  if(w<10&&(w&1)===0) for(let i=0;i<3;i++) sparkle(LOGO_POS[3]+4+Math.random()*16,LOGO_Y+4+Math.random()*16,'#fff6c0');
}
function menuSeasonParts(){
  if(titleT<TITLE_MENU) return; const si=menuSeason(), S=SEASONS[si], w=(titleT-TITLE_MENU)%MENU_SEASON;
  if(w===0){ parts=parts.filter(p=>p.k!==SEASONS[(si+3)%4].part); if(AC) SFX.chime(); }
  if((titleT%(si===3?4:9))===0) parts.push({k:S.part,x:Math.random()*170-5,y:-4,vx:(si===2?.4:.1)+(Math.random()-.5)*.3,vy:.3+Math.random()*.35,life:260,max:260,sway:Math.random()*6,r:(titleT&8)?1:0,col:S.partCol[(titleT>>3)&1],nog:true});
}
/* ---------- orquestación ---------- */
function updIntro(){
  const t=titleT; spawnIntroParts(t); introSfx(t); menuSeasonParts();
  if(titleT>TITLE_MENU+MENU_SEASON*4+60){ titleT=0; parts=[]; } // modo demostración: vuelve a empezar
}
function drawIntro(){ // devuelve true si el plano ocupa toda la pantalla
  const t=titleT;
  if(t<TITLE_INTRO){
    if(t<INTRO_A) drawShotA(t); else drawShotB(t);
    drawParts();
    if(t>=INTRO_A){ const u=t-INTRO_A, si=Math.min(3,(u/SEASON_LEN)|0), F=PARA[si].fore, o=Math.round((u*1.4*5.5)%320); ctx.drawImage(F,-o,104); ctx.drawImage(F,320-o,104); }
    const lb=t<TITLE_INTRO-20?Math.min(1,t/20):Math.max(0,(TITLE_INTRO-t)/20); drawLetterbox(t,lb);
    // fundidos: de negro al empezar, de blanco tras el impacto y hacia el Roble
    let fade=null; if(t<30) fade=['#000',1-t/30]; else if(t>=150&&t<INTRO_A) fade=['#fff',(t-150)/20]; else if(t>=INTRO_A&&t<INTRO_A+16) fade=['#fff',1-(t-INTRO_A)/16]; else if(t>TITLE_INTRO-16) fade=['#fff',(t-(TITLE_INTRO-16))/16];
    if(fade){ ctx.globalAlpha=clamp(fade[1],0,1); ctx.fillStyle=fade[0]; ctx.fillRect(0,0,160,144); ctx.globalAlpha=1; }
    return true; }
  return false;
}
