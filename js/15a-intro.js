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
const INTRO_CAPS=[[8,140,'UNA SEMILLA QUE EL VIENTO NO ENCONTRÓ'],[INTRO_A+6,INTRO_A+150,'UN BROTE PARA DESPERTAR AL ROBLE'],[INTRO_A+170,TITLE_INTRO-8,'Y HACER GIRAR LAS ESTACIONES']];
function drawLetterbox(t,k){ const h=Math.round(14*k); ctx.fillStyle='#000'; ctx.fillRect(0,0,160,h); ctx.fillRect(0,144-h,160,h);
  for(const [a,b,s] of INTRO_CAPS) if(t>=a&&t<b){ const al=Math.min(1,(t-a)/14,(b-t)/14); ctx.globalAlpha=al; txtS(s,80,135,'#e8dcc0','center'); ctx.globalAlpha=1; } }
/* ---------- la escena del título: el Gran Roble en su colina, con la estación del momento ---------- */
const OAK_SEASON=(()=>{ const to=[
    ['#0c2e1a','#1a5a2c','#2c8038','#4aa444','#f0a0c8','#ffd8ec'],   // primavera: el Roble en flor
    null,                                                              // verano: tal cual
    ['#4a1c0c','#8a3a14','#b85a1c','#e08a30','#f4b850','#fce090'],   // otoño
    ['#10302a','#1c5a3a','#2e7a4a','#8ab8a0','#dce8f0','#ffffff']];  // invierno: nieve en la copa
  return to.map(t=>{ if(!t) return OAK_GRAND; const m={}; OAK_LEAF.forEach((c,i)=>m[c]=t[i]); return recolor(OAK_GRAND,m); }); })();
/* la colina y el prado de delante (96 px: el selector de partida baja la cámara y lo enseña) */
const TITLE_HILL=SEASONS.map((S,si)=>{ const c=mkCanvas(160,96), g=c.getContext('2d'), G=S.ground, r=seeded(9+si);
  for(let x=0;x<160;x++){ const top=Math.round(14+Math.pow(Math.abs(x-80)/80,1.6)*18);
    for(let y=top;y<96;y++){ const d=y-top; g.fillStyle=d===0?G[3]:(d<5&&((x+y)&1)&&d>2)?G[3]:G[0]; g.fillRect(x,y,1,1); } }
  for(let i=0;i<12;i++){ const cx=(r()*160)|0, cy=44+((r()*48)|0), rw=7+((r()*12)|0); // manchas de hierba en sombra
    for(let y=-3;y<=3;y++) for(let x=-rw;x<=rw;x++) if((x*x)/(rw*rw)+(y*y)/10<1&&(((x+y)&1)||(x*x)/(rw*rw)+(y*y)/10<.45)){ g.fillStyle=G[1]; g.fillRect(cx+x,cy+y,1,1); } }
  for(let i=0;i<70;i++){ const x=(r()*156)|0, y=24+((r()*70)|0); g.fillStyle=G[3]; g.fillRect(x,y,1,1); g.fillRect(x+2,y,1,1); g.fillStyle=G[1]; g.fillRect(x,y+1,1,1); g.fillRect(x+2,y+1,1,1); g.fillStyle=G[2]; g.fillRect(x+1,y+2,1,1); }
  for(let i=0;i<30;i++){ const x=(r()*154)|0, y=26+((r()*68)|0), col=S.flowers[i%3]; g.fillStyle=col; g.fillRect(x+1,y,1,1); g.fillRect(x,y+1,3,1); g.fillRect(x+1,y+2,1,1); g.fillStyle=C.flowerC; g.fillRect(x+1,y+1,1,1); g.fillStyle=G[2]; g.fillRect(x+1,y+3,1,1); }
  return c; });
/* el Roble se mece: la copa va en tiras de 2 px con un vaivén que se apaga hacia el tronco */
function drawOakSway(img,x,y){ for(let yy=0;yy<img.height;yy+=2){ const k=Math.max(0,1-yy/52), off=Math.round(Math.sin(tick*.03+yy*.09)*1.4*k); ctx.drawImage(img,0,yy,img.width,2,x+off,y+yy,img.width,2); } }
function godRays(cx,cy,warm){ ctx.save(); ctx.globalCompositeOperation='lighter';
  for(let i=0;i<5;i++){ const a=2.05+i*.2+Math.sin(tick*.004+i*1.7)*.03, w=.035+(i&1)*.02, L=220;
    ctx.fillStyle=warm?'rgba(255,236,190,.05)':'rgba(255,252,230,.045)'; ctx.beginPath(); ctx.moveTo(cx,cy); ctx.lineTo(cx+Math.cos(a-w)*L,cy+Math.sin(a-w)*L); ctx.lineTo(cx+Math.cos(a+w)*L,cy+Math.sin(a+w)*L); ctx.fill(); }
  ctx.restore(); }
function drawBirds(si,oy){ if(si===3) return; const vee=si===2, n=vee?5:3;
  for(let i=0;i<n;i++){ const T=(tick*.3+(vee?0:i*97))%300, x=Math.round(172-T+(vee?Math.abs(i-2)*7:0)), y=Math.round((vee?30+Math.abs(i-2)*4:26+i*11)+Math.sin((tick+i*23)*.06)*2)+oy;
    if(x<-8||x>164) continue; const f=((tick>>3)+i)&1; ctx.fillStyle='#2a3448';
    if(f){ ctx.fillRect(x,y,1,1); ctx.fillRect(x+1,y+1,1,1); ctx.fillRect(x+2,y,1,1); } else ctx.fillRect(x,y+1,3,1); } }
/* Sprout en el título: mira al Roble, se vuelve a saludar, y brinca cuando cambia la estación */
function drawTitleHero(hy,alpha){
  if(alpha<=0) return; const ph=tick%600, front=ph>=300&&ph<430, sw=titleT>=TITLE_MENU+MENU_SEASON?(titleT-TITLE_MENU)%MENU_SEASON:999;
  let hop=0; if(front&&ph>=340&&ph<358) hop=Math.round(Math.sin((ph-340)/18*Math.PI)*5); if(sw<22) hop=Math.round(Math.sin(sw/22*Math.PI)*7);
  const dir=front?0:3, blink=((tick+40)%180)<6, s=blink?P_BLINK[dir]:(hop>2?P_SPRITES[dir][1]:P_SPRITES[dir][0]), bob=hop?0:(((tick>>5)&1)?1:0);
  ctx.save(); ctx.globalAlpha=alpha; drawShadow(28,hy+36,Math.max(4,8-hop*.7));
  const land=sw>=22&&sw<30?(30-sw)/8:0; if(land>0){ ctx.translate(28,hy+38); ctx.scale(1+land*.18,1-land*.18); ctx.drawImage(s,-16,-32,32,32); }
  else ctx.drawImage(s,12,hy+6+bob-hop,32,32);
  ctx.restore();
  if(sw>1&&sw<34&&alpha>.5){ const b=sw<8?8-sw:0; txtOL('!',28,hy-8-hop-b,'#ffe070','center'); }
}
function drawTitleScene(si,crane,cam,hero){
  cam=cam||0; const S=SEASONS[si], P=PARA[si], d=k=>Math.round((1-crane)*k), c=k=>Math.round(cam*k);
  ctx.drawImage(P.sky,0,d(-6)-c(4));
  const sunY=17+d(8)-c(6); glowAt(128,sunY+7,22,'rgba(255,250,220,.35)'); ctx.drawImage(disc(7,S.sun),121,sunY);
  const drift=Math.round((tick*.12)%320); ctx.drawImage(P.clouds,-drift,20+d(10)-c(8)); ctx.drawImage(P.clouds,320-drift,20+d(10)-c(8));
  drawBirds(si,-c(10));
  ctx.drawImage(P.mount,-40,52+d(24)-c(16)); ctx.drawImage(P.hills,-90,66+d(40)-c(24));
  if(si<3) godRays(128,sunY+7,si===2);
  const hy=94+d(64)-c(36); ctx.drawImage(TITLE_HILL[si],0,hy);
  const oy=hy-58; drawShadow(80,hy+24,26); drawOakSway(OAK_SEASON[si],37,oy);
  if(hero!==false) drawTitleHero(hy,1-cam);
  return hy;
}
/* el año gira: primavera y verano los trae el Roble (florece desde la copa);
   otoño e invierno los trae el Viento (una ráfaga barre de derecha a izquierda) */
const SEASON_WIPE=34;
function drawSeasonWorld(cam){
  const crane=titleT<TITLE_INTRO?0:1-Math.pow(1-clamp((titleT-TITLE_INTRO)/TITLE_PAN_D,0,1),3);
  if(titleT<TITLE_MENU){ drawTitleScene(0,crane,cam); return; }
  const si=menuSeason(), w=(titleT-TITLE_MENU)%MENU_SEASON, prev=(si+3)%4;
  if(state==='file'||w>=SEASON_WIPE||titleT<TITLE_MENU+MENU_SEASON){ drawTitleScene(si,1,cam); return; }
  const hy=drawTitleScene(prev,1,cam), k=w/SEASON_WIPE;
  if(si<=1){ const cx=80, cy=hy-30, r=Math.round(k*k*190);
    ctx.save(); ctx.beginPath(); ctx.arc(cx,cy,r,0,6.283); ctx.clip(); drawTitleScene(si,1,cam); ctx.restore();
    ctx.strokeStyle='rgba(255,255,240,'+(1-k*.6).toFixed(2)+')'; ctx.lineWidth=2; ctx.beginPath(); ctx.arc(cx,cy,r,0,6.283); ctx.stroke();
    ctx.strokeStyle='rgba(255,240,200,.5)'; ctx.lineWidth=1; ctx.beginPath(); ctx.arc(cx,cy,Math.max(0,r-5),0,6.283); ctx.stroke(); }
  else { const wx=Math.round(166-k*190);
    ctx.save(); ctx.beginPath(); ctx.rect(wx,0,200,144); ctx.clip(); drawTitleScene(si,1,cam); ctx.restore();
    ctx.fillStyle='rgba(235,245,255,.75)'; ctx.fillRect(wx,0,1,144);
    for(let i=0;i<9;i++){ const y=(i*17+tick*3)%130, L=8+(i%3)*7; ctx.fillStyle='rgba(235,245,255,'+(.4+(i%2)*.3)+')'; ctx.fillRect(wx+2+((i*13)%20),y,L,1); }
    ctx.save(); ctx.globalAlpha=.95; const by=hy-18+Math.sin(tick*.12)*4; ctx.translate(wx+6,by); ctx.scale(-1,1); ctx.drawImage(WIND_SPR,-16,-16); ctx.restore(); }
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
  if(w===0&&titleT>=TITLE_MENU+MENU_SEASON){ for(const p of parts) if(p.k===SEASONS[(si+3)%4].part) p.life=Math.min(p.life,24);
    if(si<=1){ if(AC) SFX.chime(); const cy=94-30; for(let i=0;i<22;i++){ const a=i/22*6.283, v=1+Math.random()*1.6; parts.push({k:S.part,x:80+Math.cos(a)*10,y:cy+Math.sin(a)*8,vx:Math.cos(a)*v,vy:Math.sin(a)*v*.7-.4,life:120,max:120,sway:Math.random()*6,r:i&1,col:S.partCol[i&1],nog:true}); } }
    else { if(AC) SFX.swoosh(); } }
  if(si>=2&&w<SEASON_WIPE&&titleT>=TITLE_MENU+MENU_SEASON&&(w&1)===0){ const wx=166-w/SEASON_WIPE*190; parts.push({k:S.part,x:wx+4,y:Math.random()*128,vx:-2.5-Math.random()*1.5,vy:(Math.random()-.5)*.6,life:90,max:90,sway:Math.random()*6,r:(w&4)?1:0,col:S.partCol[(w>>1)&1],nog:true}); }
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
/* ============================================================
   PRÓLOGO DE PARTIDA NUEVA: la leyenda del valle, en ocho planos
   (franjas de cine, texto a máquina abajo, Z para pasar, iris entre páginas)
   0 dos hermanos · 1 el año que giraba · 2 el olvido · 3 la tormenta ·
   4 las semillas sembradas y las estaciones presas · 5 el valle gris ·
   6 la semilla que el Viento no encontró · 7 tres primaveras y un despertar.
   Tras la última página el iris se abre sobre la casa y el juego empieza ahí mismo.
   Todo se dibuja a su tamaño: ni sprites estirados ni bordes suavizados.
   ============================================================ */
let cineT=0, cinePause=0; // cinePause: el respiro del narrador en comas y puntos (13-update)
const CINE_TOP=8, CINE_BOT=106;
const POT_BIG=(()=>{ const c=mkCanvas(40,30), g=c.getContext('2d');
  blobArt(g,2,2,36,26,[{x:18,y:6,r:17,ry:4},{x:18,y:16,r:14,ry:10}],['#5a2410','#8a3818','#b85a28','#d88040','#f0a868'],{grad:.5,dither:.6});
  g.fillStyle='#3a2410'; g.fillRect(6,5,28,3); g.fillStyle='#5a3a1c'; g.fillRect(8,5,24,1); return c; })();
const PRO_LOOK=['spring','summer','autumn','winter'];
const PRO_TRACK=['titulo','titulo','titulo','silencio','silencio','marchito','marchito','casa']; // la música de cada página
const PRO_ALL=()=>true, PRO_NONE=()=>false;
/* cuándo arranca el Viento cada semilla: primero las de su lado (ROBLE_SEEDS llega con 15f: se calcula al usarlo) */
let PRO_PLUCK_T=null;
function proPluck(i){ if(!PRO_PLUCK_T){ PRO_PLUCK_T=[]; ROBLE_SEEDS.map((s,k)=>[s[0],k]).sort((a,b)=>b[0]-a[0]).forEach(([,k],j)=>PRO_PLUCK_T[k]=86+j*7); } return PRO_PLUCK_T[i]; }
/* ---------- piezas del prólogo ---------- */
/* el Roble de la leyenda (el mismo lienzo que en la plaza) con su vaivén; seeds(i): true = semilla en su hueco, false = hueco vacío */
function proOak(img,x,y,amp,seeds){ const ph=tick*.03; roblePaint(img,x,y,amp,ph);
  if(seeds) ROBLE_SEEDS.forEach(([ax,ay],i)=>{ const sx=x+ax+robleSwayOff(ay,amp,ph), sy=y+ay;
    if(!seeds(i)){ ctx.fillStyle='#120c08'; ctx.fillRect(sx,sy,2,2); return; }
    const tw=(((tick>>3)+i*5)%23)===0; glowAt(sx+1,sy+1,4,'rgba(255,220,120,.4)');
    ctx.fillStyle='#7a4a10'; ctx.fillRect(sx,sy+1,2,1); ctx.fillStyle=tw?'#fff4b0':'#f8c848'; ctx.fillRect(sx,sy,2,1); ctx.fillStyle='#e0a030'; ctx.fillRect(sx+1,sy+1,1,1);
    if(tw) caStar(sx+1,sy,2,'#fffbe0'); }); }
function proSeedXY(i,x,y,amp){ const [ax,ay]=ROBLE_SEEDS[i]; return [x+ax+robleSwayOff(ay,amp,tick*.03)+1,y+ay]; }
/* el Viento del Norte, anclado por la cabeza (la cola vuela detrás) */
function proWind(x,y,s,mood,flip,blink){ const a=windArt({s,mood,f:(tick>>3)&7,blink:blink||0,flip}); ctx.drawImage(a,Math.round(x-(flip?30:22)*s),Math.round(y-17*s)); }
/* el mismo dibujo a otra luz (multiplica) o gris y apagado; cacheados */
const PRO_ART=new Map();
function proArtCache(img,key,make){ let m=PRO_ART.get(img); if(!m){ m={}; PRO_ART.set(img,m); } return m[key]||(m[key]=make()); }
function proNightArt(img,col){ col=col||'#3e4a80'; if(col==='#ffffff') return img; return proArtCache(img,'n'+col,()=>{ const c=mkCanvas(img.width,img.height), g=c.getContext('2d');
  g.drawImage(img,0,0); g.globalCompositeOperation='multiply'; g.fillStyle=col; g.fillRect(0,0,c.width,c.height); g.globalCompositeOperation='destination-in'; g.drawImage(img,0,0); return c; }); }
function proGreyArt(img){ return proArtCache(img,'g',()=>{ const c=mkCanvas(img.width,img.height), g=c.getContext('2d'); g.drawImage(img,0,0);
  const d=g.getImageData(0,0,c.width,c.height), p=d.data; for(let i=0;i<p.length;i+=4){ if(!p[i+3]) continue; const l=p[i]*.3+p[i+1]*.59+p[i+2]*.11; p[i]=p[i+1]=Math.round(l*.8+28); p[i+2]=Math.round(l*.72+24); }
  g.putImageData(d,0,0); return c; }); }
const PRO_SKY={};
function proSky(k,cols){ return PRO_SKY[k]||(PRO_SKY[k]=(()=>{ const c=mkCanvas(160,112); bandSky(c.getContext('2d'),160,112,cols); return c; })()); }
function proStars(maxY){ for(const [x,y,big,ph] of STARS){ if(y>maxY) continue; const tw=((tick+ph*7)>>3)%8; if(tw===0) continue; const yy=y+CINE_TOP;
  ctx.fillStyle=tw<3?'#6a70a0':'#fffbe8'; ctx.fillRect(x,yy,1,1); if(big&&tw>5){ ctx.fillStyle='rgba(255,251,232,.45)'; ctx.fillRect(x-1,yy,3,1); ctx.fillRect(x,yy-1,1,3); } } }
function proCrescent(x,y,r,cols){ for(let yy=-r;yy<=r;yy++) for(let xx=-r;xx<=r;xx++){ const d=xx*xx+yy*yy, d2=(xx-r*.45)*(xx-r*.45)+(yy+r*.3)*(yy+r*.3); if(d<=r*r-.5&&d2>r*r*.62){ ctx.fillStyle=d>r*r*.7?cols[0]:cols[1]; ctx.fillRect(x+xx,y+yy,1,1); } } }
function proMoon(x,y){ glowAt(x,y,16,'rgba(255,244,200,.14)'); proCrescent(x,y,7,['#e8d8a0','#fff4c8']); }
/* el valle de la leyenda de día, con su estación (el Roble lo pinta cada plano); de noche, el cielo y el suelo van aparte (y el suelo, gris si ya se apagó) */
function proLand(si){ const S=SEASONS[si], P=PARA[si];
  ctx.drawImage(P.sky,0,0); glowAt(128,26,22,'rgba(255,250,220,.35)'); ctx.drawImage(disc(7,S.sun),121,19);
  const drift=Math.round((tick*.12)%320); ctx.drawImage(P.clouds,-drift,22); ctx.drawImage(P.clouds,320-drift,22);
  ctx.drawImage(P.mount,-40,40); ctx.drawImage(P.hills,-90,52); ctx.drawImage(TITLE_HILL[si],0,78); drawShadow(80,102,26); }
function proNightSky(){ ctx.drawImage(proSky('noche',['#060818','#0c1230','#182048','#26305c']),0,0); proStars(56); proMoon(28,30); }
function proNightGround(si,grey){ const P=PARA[si], N=img=>proNightArt(grey?proGreyArt(img):img);
  ctx.drawImage(N(P.mount),-40,40); ctx.drawImage(N(P.hills),-90,52); ctx.drawImage(N(TITLE_HILL[si]),0,78); drawShadow(80,102,26); }
function proHillY(x){ return 92+Math.pow(Math.abs(x-80)/80,1.6)*18; } // la loma del Roble a esa x
/* una montaña de verdad, columna a columna: cresta irregular con su contorno, ladera en sombra y al sol, grietas y nieve que baja por las canales */
const PRO_ROCK=['#2e3460','#5a5a8a','#a8aed8','#f6e6ee','#12162e'], PRO_ROCK_N=['#1a2040','#2c3458','#62709a','#94a4c8','#0a0e20'];
const PRO_PEAKS=new Map();
function proPeakArt(half,H,pal,seed){ const key=[half,H,pal.join(),seed].join('|'); let c=PRO_PEAKS.get(key); if(c) return c;
  const W=half*2+1, ridge=[]; c=mkCanvas(W,H); const g=c.getContext('2d');
  for(let x=0;x<W;x++){ const u=Math.abs(x-half)/half; ridge[x]=Math.min(H-1,Math.max(0,Math.round(H*Math.pow(u,1.12)*.94+(Math.sin(x*.55+seed)*1.4+Math.sin(x*.21+seed*3)*2.4)*u))); }
  for(let x=0;x<W;x++){ const gully=(hash(x>>1,seed)&7)<2, snowY=Math.round(H*(.22+.06*Math.sin(x*.47+seed)+.04*Math.sin(x*1.3+seed*2)+(gully?.12:0)));
    for(let y=ridge[x];y<H;y++){ const lit=x>=half+Math.round(Math.sin(y*.18+seed)*2+y*.14), snow=y<snowY;
      let col=snow?pal[lit?3:2]:pal[lit?1:0]; if(!snow&&(hash(x*3+seed,y)&31)===0) col=pal[lit?0:4]; // grietas
      g.fillStyle=col; g.fillRect(x,y,1,1); }
    const y1=Math.max(ridge[x],Math.max(x>0?ridge[x-1]:0,x<W-1?ridge[x+1]:0)-1); g.fillStyle=pal[4]; g.fillRect(x,ridge[x],1,y1-ridge[x]+1); } // el contorno de la cresta
  PRO_PEAKS.set(key,c); return c; }
function proPeak(cx,top,bot,half,pal,seed){ ctx.drawImage(proPeakArt(half,bot-top,pal,seed||1),cx-half,top); }
/* una corchea: el canto del valle */
function proNote(x,y,col){ x=Math.round(x); y=Math.round(y); ctx.fillStyle=col; ctx.fillRect(x+2,y,1,5); ctx.fillRect(x+3,y,1,1); ctx.fillRect(x+4,y+1,1,2); ctx.fillRect(x,y+4,3,2); }
/* recorte circular nítido (fila a fila) y el filo punteado de una ola */
function proClipCircle(cx,cy,r){ ctx.beginPath(); for(let y=0;y<144;y++){ const dy=y+.5-cy, h=r*r-dy*dy; if(h>0){ const w=Math.sqrt(h); ctx.rect(Math.round(cx-w),y,Math.round(w*2),1); } } ctx.clip(); }
function proRing(cx,cy,r,col,n,t){ ctx.fillStyle=col; for(let i=0;i<n;i++){ const b=i/n*6.283, x=Math.round(cx+Math.cos(b)*r), y=Math.round(cy+Math.sin(b)*r); if(y>=CINE_TOP&&y<CINE_BOT&&((i+(t>>1))%3)) ctx.fillRect(x,y,1,1); } }
/* ---------- los rincones del valle, de noche y en pequeño: el tronco hueco de las marismas, el molino de la Ciénaga y la madriguera del Topo Real ---------- */
const PRO_NP=['#080a16','#161a30','#262c4c','#46507c'], PRO_NPM=['#070a0a','#141c18','#26322a','#465a4a'], PRO_NPT=['#0a0806','#1c1610','#2e241a','#4e4030']; // piedra, musgo y tierra a la luz de la luna
/* un dibujo a partir de filas de texto: '#' cuerpo, 'o' hueco (donde late la estación presa); contorno, luz por arriba a la izquierda y sombra a la derecha, solos */
function proSprite(rows,pal){ const h=rows.length, w=rows[0].length, c=mkCanvas(w,h), g=c.getContext('2d'), at=(x,y)=>y>=0&&y<h&&x>=0&&x<w&&rows[y][x]!=='.'; c.holes=[];
  for(let y=0;y<h;y++) for(let x=0;x<w;x++){ const ch=rows[y][x]; if(ch==='.') continue; if(ch==='o'){ c.holes.push([x,y]); g.fillStyle='#030305'; g.fillRect(x,y,1,1); continue; }
    g.fillStyle=(!at(x-1,y)||!at(x+1,y)||!at(x,y-1)||!at(x,y+1))?pal[0]:(!at(x-2,y)||!at(x,y-2))?pal[3]:!at(x+2,y)?pal[1]:pal[2]; g.fillRect(x,y,1,1); }
  return c; }
const PRO_TRUNKA=proSprite([ // el tronco hueco de las marismas: roto arriba, con dos muñones y raíces en el agua
  '....##......##......','....###....###......','...####.#.####......','...############.....','##.############.##..','################.###',
  '.###############..##','...############.....','...####oooo####.....','...###oooooo###.....','...###oooooo###.....','...###oooooo###.....',
  '...###oooooo###.....','...####oooo####.....','...############.....','...############.....','..##############....','..##############....',
  '.################...','.#################..','###################.','####################','##..####....####..##'],PRO_NPM);
const PRO_MILL=proSprite([ // el molino de la Ciénaga (las aspas giran aparte)
  '......#......','.....###.....','....#####....','...#######...','..#########..','.###########.','...#######...','...#######...','...###o###...','...###o###...',
  '...#######...','..#########..','..#########..','..#########..','..#########..','..#########..','.###########.','.###########.','.####ooo####.','.####ooo####.','.####ooo####.','#############'],PRO_NP);
const PRO_MOUND=proSprite([ // la madriguera del Topo Real
  '.........######.........','......############......','....################....','...##################...','..#######oooooo#######..','.#######oooooooo#######.','########oooooooo########','########oooooooo########'],PRO_NPT);
function proLocked(img,x,y,glow,rgb,only){ ctx.drawImage(img,x,y); if(glow<=0) return; ctx.fillStyle='rgba('+rgb+','+Math.min(1,glow).toFixed(2)+')'; let sx=0,sy=0,n=0;
  for(const [hx,hy] of img.holes){ if(only&&!only(hx,hy)) continue; ctx.fillRect(x+hx,y+hy,1,1); sx+=hx; sy+=hy; n++; } if(n) glowAt(x+sx/n+.5,y+sy/n+.5,8,'rgba('+rgb+','+(.45*glow).toFixed(2)+')'); }
function proTrunkAt(x,y,glow,rgb){ proLocked(PRO_TRUNKA,x-10,y-23,glow,rgb); }
function proMillAt(x,y,glow,rgb){ proLocked(PRO_MILL,x-6,y-22,glow,rgb,(hx,hy)=>hy<12); const hx=x, hy=y-16, a=tick*.012; ctx.fillStyle=PRO_NP[3]; // la luz, en la ventana; la puerta sigue a oscuras; las aspas, a la luz de la luna
  for(let i=0;i<4;i++){ const b=a+i*Math.PI/2, cs=Math.cos(b), sn=Math.sin(b); for(let r=1;r<=11;r++){ ctx.fillRect(Math.round(hx+cs*r),Math.round(hy+sn*r),1,1); if(r>3) ctx.fillRect(Math.round(hx+cs*r-sn*2),Math.round(hy+sn*r+cs*2),1,1); } } // las aspas
  ctx.fillStyle=PRO_NP[0]; ctx.fillRect(hx,hy,1,1); }
function proMoundAt(x,y,glow,rgb){ proLocked(PRO_MOUND,x-12,y-8,glow,rgb); }
function proMarsh(){ for(let y=92;y<CINE_BOT;y++){ const w=Math.round(62-(CINE_BOT-y)*2.8); if(w<=0) continue; ctx.fillStyle='#0e1430'; ctx.fillRect(0,y,w,1); // el agua de las marismas
    if(((y+(tick>>4))%3)===0){ ctx.fillStyle='#2e3c68'; ctx.fillRect(3+((y*13)%22),y,5+(y%4),1); } }
  ctx.fillStyle=PRO_NP[0]; for(const [x,h] of [[33,6],[36,8],[44,5],[49,7],[52,4]]) ctx.fillRect(x,101-h,1,h); } // juncos
/* una casita del pueblo en la loma; lit: su ventana */
function proHouse(x,y,lit){ const k=PRO_NP; ctx.fillStyle=k[0]; ctx.fillRect(x-1,y-9,15,9); for(let i=0;i<7;i++) ctx.fillRect(x-2+i,y-10-i,17-i*2,1); ctx.fillRect(x+10,y-17,3,5);
  ctx.fillStyle=k[2]; ctx.fillRect(x,y-8,13,8); ctx.fillStyle=k[1]; for(let i=0;i<6;i++) ctx.fillRect(x-1+i,y-10-i,15-i*2,1); ctx.fillStyle=k[3]; for(let i=0;i<6;i++) ctx.fillRect(x-1+i,y-10-i,2,1); ctx.fillRect(x,y-8,1,8);
  ctx.fillStyle=k[0]; ctx.fillRect(x+2,y-5,2,5); // la puerta
  ctx.fillStyle=lit>1.2?'#fffbe0':'#f8c860'; ctx.fillRect(x+7,y-6,3,3); glowAt(x+8.5,y-4.5,4+lit*3,'rgba(255,200,110,'+(.25*Math.min(1.5,lit)).toFixed(2)+')'); }
/* la mano vieja, de corteza, que cuelga del brazo (proArm): arriba el puño de hojas, abajo los dedos */
const PRO_HANDP=(()=>{ const c=mkCanvas(16,18), g=c.getContext('2d'), px=(x,y,w,h,col)=>{ g.fillStyle=col; g.fillRect(x,y,w,h); };
  for(let x=1;x<15;x+=2){ px(x,0,2,4,'#16220f'); px(x,0,1,3,'#6a9a48'); }                                      // el puño, de hojas
  px(2,4,12,9,'#241408'); px(3,4,10,8,'#8a5e3a'); px(3,4,3,7,'#a8784a'); px(11,5,2,6,'#6a4228');                  // el dorso
  px(6,5,1,5,'#5a3620'); px(9,6,1,4,'#5a3620'); px(4,10,2,1,'#5a3620'); px(10,10,2,1,'#5a3620');                  // vetas de corteza
  px(1,7,3,6,'#241408'); px(2,7,1,5,'#a8784a');                                                                  // el pulgar
  px(4,12,3,6,'#241408'); px(5,12,1,5,'#8a5e3a'); px(7,12,3,6,'#241408'); px(8,12,1,5,'#a8784a'); px(10,12,3,5,'#241408'); px(11,12,1,4,'#6a4228'); // los dedos
  return c; })();
function proMul(a,b){ const A=hex2rgb(a), B=hex2rgb(b); return 'rgb('+A.map((v,i)=>Math.round(v*B[i]/255)).join(',')+')'; }
/* el brazo: una manga de musgo que entra en diagonal por la derecha y una mano que cuelga hacia la maceta; (wx,wy): la muñeca */
function proArm(wx,wy,tint){ const S=['#16220f','#3a5628','#557636','#2c4220'].map(c=>proMul(c,tint));
  for(let y=wy-1;y>=CINE_TOP-2;y--){ const d=wy-y, x0=wx-7+d; if(x0>=160) break;
    ctx.fillStyle=S[0]; ctx.fillRect(x0,y,15,1); ctx.fillStyle=S[1]; ctx.fillRect(x0+1,y,13,1); ctx.fillStyle=S[2]; ctx.fillRect(x0+2,y,3,1); ctx.fillStyle=S[3]; ctx.fillRect(x0+11,y,2,1);
    if(d%9===4){ ctx.fillStyle=S[3]; ctx.fillRect(x0+6,y,4,1); } } // los pliegues
  ctx.drawImage(proNightArt(PRO_HANDP,tint),wx-8,wy); }
/* dentro de casa. L: luz del cuarto · S: cielo de la ventana (0 noche, 1 alba, 2 día gris, 3 ocaso, 4 la mañana de hoy) */
const PRO_ROOM=[
  {wall:['#2c2840','#201c30','#3a3450','#1a1626'],sky:['#0a1030','#141c44'],land:'#262a3c',tree:['#1c1e2e','#2e3246'],floor:['#231c2c','#2e2638'],tint:'#6a70a8'},
  {wall:['#6a4a3a','#503428','#7e5a44','#40281e'],sky:['#6a5a88','#d0907a'],land:'#5a5a60',tree:['#404048','#62626a'],floor:['#50382c','#624636'],tint:'#d8b8b0'},
  {wall:['#6e4c34','#583a26','#82593c','#4a301e'],sky:['#8e9aa6','#b8c0c6'],land:'#7a7a72',tree:['#56564f','#84847a'],floor:['#523624','#64442c'],tint:'#c8c0b8'},
  {wall:['#5a3a38','#442a2a','#6e4642','#361e20'],sky:['#4a3a6a','#b0707a'],land:'#4e4a52',tree:['#36323c','#56525a'],floor:['#442a26','#56362e'],tint:'#b89090'},
  {wall:['#9a6a40','#7a4c2a','#b07a48','#6a4024'],sky:['#f0a860','#ffe2a0'],land:'#8a8a78',tree:['#646458','#94948a'],floor:['#6e4a2c','#865a34'],tint:'#ffffff'}];
const PRO_WIN={x:16,y:20,w:52,h:42};
/* los detalles del cuarto: una planta en su maceta (como las de casa) y una balda con libros */
const PRO_PLANT=(()=>{ const c=mkCanvas(12,16), g=c.getContext('2d'), px=(x,y,w,h,col)=>{ g.fillStyle=col; g.fillRect(x,y,w,h); };
  px(2,9,8,7,'#3a1a0c'); px(3,9,6,6,'#b85a28'); px(3,9,2,6,'#d88040'); px(2,9,8,1,'#f0a868'); px(4,15,4,1,'#8a3818');
  px(5,3,2,6,'#2e6a24'); px(1,2,4,3,'#46a63c'); px(7,1,4,3,'#46a63c'); px(2,5,3,2,'#7ed64e'); px(8,4,3,2,'#7ed64e'); px(1,2,1,1,'#7ed64e'); return c; })();
const PRO_SHELF=(()=>{ const c=mkCanvas(30,14), g=c.getContext('2d'), px=(x,y,w,h,col)=>{ g.fillStyle=col; g.fillRect(x,y,w,h); };
  [[2,'#a83838',9],[5,'#3a68a8',10],[8,'#e0b040',8],[11,'#3a8a48',10],[15,'#8a4ab0',9]].forEach(([x,col,h])=>{ px(x,11-h,3,h,'#1a0e06'); px(x,12-h,2,h-1,col); px(x,12-h,1,h-1,'#ffffff30'); });
  px(0,11,30,3,'#2a180c'); px(1,11,28,1,'#8a5a30'); return c; })();
function proRoom(L,S){ if(S===undefined) S=L; const R=PRO_ROOM[L], K=PRO_ROOM[S], W=PRO_WIN;
  ctx.fillStyle=R.wall[0]; ctx.fillRect(0,CINE_TOP,160,CINE_BOT-CINE_TOP);
  for(let y=CINE_TOP;y<88;y+=8){ ctx.fillStyle=R.wall[1]; ctx.fillRect(0,y,160,1); ctx.fillStyle=R.wall[2]; ctx.fillRect(0,y+1,160,1); for(let x=(y*7)%41;x<160;x+=41){ ctx.fillStyle=R.wall[3]; ctx.fillRect(x,y+1,1,7); } }
  // la ventana: el cielo de ahora, el valle gris y su árbol gris
  ctx.fillStyle=K.sky[0]; ctx.fillRect(W.x,W.y,W.w,W.h); ctx.fillStyle=K.sky[1]; ctx.fillRect(W.x,W.y+22,W.w,W.h-22); for(let x=W.x;x<W.x+W.w;x+=2) ctx.fillRect(x+((W.y+21)&1),W.y+21,1,1);
  if(S===0){ glowAt(W.x+11,W.y+8,6,'rgba(255,244,200,.22)'); ctx.drawImage(disc(3,'#fff4c8'),W.x+8,W.y+5); ctx.fillStyle='#e8d8a0'; ctx.fillRect(W.x+10,W.y+9,2,1); } // la luna
  if(S===4){ glowAt(W.x+42,W.y+30,12,'rgba(255,240,190,.5)'); ctx.drawImage(disc(5,'#fff6d0'),W.x+37,W.y+25); } // el sol que asoma
  ctx.fillStyle=K.land; for(let x=W.x;x<W.x+W.w;x++){ const h=Math.round(9+Math.sin(x*.21)*2+Math.sin(x*.07)*2); ctx.fillRect(x,W.y+W.h-h,1,h); }
  ctx.fillStyle=K.tree[0]; ctx.fillRect(W.x+37,W.y+W.h-18,3,9); ctx.drawImage(disc(7,K.tree[0]),W.x+32,W.y+W.h-31); ctx.drawImage(disc(6,K.tree[1]),W.x+32,W.y+W.h-31);
  ctx.fillStyle='#2a180c'; ctx.fillRect(W.x-3,W.y-3,W.w+6,3); ctx.fillRect(W.x-3,W.y+W.h,W.w+6,4); ctx.fillRect(W.x-3,W.y,3,W.h); ctx.fillRect(W.x+W.w,W.y,3,W.h); // el marco
  ctx.fillRect(W.x+(W.w>>1)-1,W.y,2,W.h); ctx.fillRect(W.x,W.y+(W.h>>1)-1,W.w,2);
  ctx.fillStyle=L===0?'#3a3040':'#8a5a30'; ctx.fillRect(W.x-3,W.y+W.h,W.w+6,1); ctx.fillStyle='rgba(255,255,255,'+(S===0?.12:.3)+')'; ctx.fillRect(W.x+3,W.y+3,5,1); ctx.fillRect(W.x+3,W.y+4,1,4);
  ctx.drawImage(proNightArt(PRO_SHELF,R.tint),124,38);
  ctx.fillStyle=R.floor[0]; ctx.fillRect(0,88,160,CINE_BOT-88); ctx.fillStyle=R.floor[1]; for(let y=90;y<CINE_BOT;y+=5) ctx.fillRect(0,y,160,1); ctx.fillStyle=R.wall[1]; ctx.fillRect(0,88,160,1);
  ctx.drawImage(proNightArt(PRO_PLANT,R.tint),6,78); }
/* las rayas que alguien marca en la pared, una por primavera */
function proTally(n,L){ for(let i=0;i<n;i++){ const x=84+i*4; ctx.fillStyle=L===0?'#120e1c':'#2e1a0e'; ctx.fillRect(x,28,1,10); ctx.fillStyle=L===0?'#4a4260':'#c0925e'; ctx.fillRect(x+1,29,1,9); } }
/* la maceta (a la luz del cuarto) y la semilla que late bajo la tierra */
function proPot(x,y,L,shake){ ctx.drawImage(proNightArt(POT_BIG,PRO_ROOM[L].tint),x+(shake||0),y); }
function proSoilGlow(x,y,k){ if(k<=0) return; glowAt(x,y,5+k*5,'rgba(255,214,120,'+(.18+.3*k).toFixed(2)+')'); ctx.fillStyle='rgba(255,230,150,'+(.35+.5*k).toFixed(2)+')'; ctx.fillRect(x-1,y,2,1); }
/* el haz de luz de la ventana hasta el suelo (fila a fila) */
function proBeam(a,col){ if(a<=0) return; ctx.save(); ctx.globalAlpha=a; ctx.fillStyle=col; for(let y=PRO_WIN.y+4;y<CINE_BOT;y++){ const w=Math.round(30+(y-PRO_WIN.y)*.15); ctx.fillRect(Math.round(PRO_WIN.x+30+(y-PRO_WIN.y-4)*1.72-w/2),y,w,1); } ctx.restore(); } // cae de lleno sobre la maceta
/* un «!» grande con su contorno */
function proBang(x,y,col){ ctx.fillStyle='#1a0e06'; ctx.fillRect(x-2,y-1,5,11); ctx.fillRect(x-2,y+11,5,5); ctx.fillStyle=col; ctx.fillRect(x-1,y,3,9); ctx.fillRect(x-1,y+12,3,3); ctx.fillStyle='#fffbe0'; ctx.fillRect(x-1,y,1,5); }
/* plano 4: dónde caen las ocho semillas, las cuatro estaciones [dibujo, luz, rincón, cuándo la lanza, cuánto vuela] y por dónde va el Viento */
const PRO_SOWN=[[8,70],[30,66],[48,82],[112,78],[150,76],[122,90],[70,100],[96,97]];
const PRO_RELIC=[[EMBER_SPR,'255,150,80',[112,102],52,22],[TEAR_SPR,'120,200,255',[15,88],64,24],[AMBER_SPR,'255,200,90',[144,84],76,22],[FLAKE_SPR,'232,244,255',null,0,0]];
function proWind4(t){ if(t<104) return [caK(t,[[18,-44],[46,84,'out']]),caK(t,[[18,34],[46,26,'out']])+Math.round(Math.sin(t*.1)*2)];
  const k=CA_EASE.in(caSeg(t,104,140)); return [lerp(84,196,k),lerp(26,-18,k)]; }
function proRelicAt(j,t){ const [wx,wy]=proWind4(t), b=t*.12+j*Math.PI/2, near=j===3&&t>=104; return [wx+Math.cos(b)*(near?9:16),wy+7+Math.sin(b)*(near?5:8),Math.sin(b)]; }
const PRO_WIND6=[[8,-40],[30,70,'out'],[46,80,'lin'],[70,210,'in']]; // el Viento buscando la semilla (plano 6)
/* ---------- los planos ---------- */
function drawCineScene(p,t){
  switch(p){
    case 0: { // dos hermanos: el Roble en su colina y el Viento jugando a su alrededor (por detrás de la copa y otra vez por delante)
      const a=t*.03-.5, wx=80+Math.cos(a)*64, wy=40+Math.sin(a)*14, front=Math.sin(a)>0, near=front?Math.max(0,1-Math.abs(wx-80)/56):0;
      proLand(1);
      const trail=fr=>{ for(let k=3;k<=18;k++){ const b=a-k*.035; if((Math.sin(b)>0)!==fr) continue; const x=Math.round(80+Math.cos(b)*64), y=Math.round(46+Math.sin(b)*14+Math.sin(k*.8+t*.25)*1.5);
        ctx.fillStyle=k<8?'#ffffff':'#cfe6ff'; ctx.fillRect(x,y,k<6?2:1,1); } };
      trail(false); if(!front) proWind(wx,wy,.8,'happy',true);
      proOak(ROBLE_ART.summer,37,20,1.2+near*2.6,PRO_ALL);
      trail(true); if(front) proWind(wx,wy,.8,'happy',false);
      break; }
    case 1: { // el año gira: la primavera y el verano nacen de la copa; el otoño y el invierno los trae el Viento soplando
      const L=56, n=(t/L)|0, si=n%4, w=t-n*L, prev=(si+3)%4, k=Math.min(1,w/30);
      const scene=s=>{ proLand(s); proOak(ROBLE_ART[PRO_LOOK[s]],37,20,1.2,PRO_ALL); };
      if(w>=30) scene(si);
      else if(si<2){ scene(prev); const r=CA_EASE.out(k)*150; ctx.save(); proClipCircle(80,48,r); scene(si); ctx.restore(); proRing(80,48,r,si?'#fff6c0':'#ffd8ec',64,t);
        if(w<14) ROBLE_SEEDS.forEach((_,i)=>{ const [x,y]=proSeedXY(i,37,20,1.2); caStar(x,y,[2,3,4,4,3,3,2,2,2,1,1,1,1,1][w],'#fffbe0'); }); } // las semillas se encienden
      else { scene(prev); const wx=Math.round(186-CA_EASE.io(k)*230);
        ctx.save(); ctx.beginPath(); for(let y=0;y<144;y++){ const e=wx+12+Math.round(Math.sin(y*.3+t*.5)*3); if(e<160) ctx.rect(Math.max(0,e),y,160,1); } ctx.clip(); scene(si); ctx.restore();
        ctx.fillStyle=SEASONS[si].partCol[0]; for(let i=0;i<12;i++){ const y=CINE_TOP+4+((i*29)%90), x=wx-24-((i*13+t*5)%40); ctx.fillRect(x,y,4+(i%3)*4,1); } // su soplido
        proWind(wx,44+Math.round(Math.sin(t*.3)*2),.85,'blow',false); }
      ctx.globalAlpha=Math.min(1,.25+w/8); txtOL(SEASONS[si].name,80,CINE_TOP+4,'#fffbe8','center'); ctx.globalAlpha=1;
      break; }
    case 2: { // el olvido: la cámara deja el canto de la plaza y viaja hasta el pico donde el Viento se quedó solo
      const cam=Math.round(caK(t,[[0,0],[56,0],[140,160,'io']]));
      if(cam<160){ ctx.save(); ctx.beginPath(); ctx.rect(0,0,160-cam,144); ctx.clip(); ctx.translate(-cam,0);
        proLand(1); proOak(ROBLE_ART.summer,37,20,1.2,PRO_ALL);
        [[PETRA_SPR,20],[LUPA_SPR,42],[MOSS_SPR,102],[CORTEZA_SPR,124]].forEach(([spr,x],i)=>{ const y=Math.round(proHillY(x+8))-15, hop=((tick>>3)+i)&1;
          drawShadow(x+8,y+15,5); ctx.drawImage(spr,x,y-hop);
          const u=(t+i*19)%52; if(u<44){ ctx.globalAlpha=Math.min(1,(44-u)/12); proNote(x+5+(x<80?1:-1)*u*.3+Math.sin((u+i*9)*.3)*1.5,y-7-u*.55,i&1?'#fff6c0':'#ffe070'); ctx.globalAlpha=1; } });
        ctx.restore(); }
      if(cam>0){ ctx.save(); ctx.beginPath(); ctx.rect(160-cam,0,cam,144); ctx.clip(); ctx.translate(160-cam,0);
        ctx.drawImage(proSky('ocaso',['#141436','#262656','#4a3c6e','#8a5a7a','#c88478']),0,0); proStars(30);
        proPeak(24,66,108,44,PRO_ROCK_N,2); proPeak(140,58,108,50,PRO_ROCK_N,5); proPeak(82,34,108,74,PRO_ROCK,3); // su pico, entre otros dos
        proWind(84,25+Math.round(Math.sin(t*.05)),.75,'sad',false,(t%170)>160?1:0);
        ctx.restore(); ctx.fillStyle='#000'; ctx.fillRect(159-cam,0,2,144); } // el borde entre las dos viñetas
      break; }
    case 3: { // la tormenta: una noche baja aullando, sopla contra la copa, le arranca las ocho semillas y se va tras ellas
      const howl=t>=40&&t<78, blow=t>=78&&t<150, sh=howl?Math.round(Math.sin(t*1.7)*(t<58?2:1)):0, bolt=(t>=40&&t<44)||(t>=62&&t<64);
      ctx.save(); ctx.translate(sh,0);
      proNightSky();
      const cl=proNightArt(PARA[3].clouds,'#343850'), cx=Math.round(lerp(170,-60,CA_EASE.out(caSeg(t,0,70)))-t*.1); ctx.drawImage(cl,cx,CINE_TOP-8); ctx.drawImage(cl,cx+150,CINE_TOP-14); // las nubes de tormenta tapan la luna
      if(bolt){ const r=seeded(t<50?3:7); let x=t<50?44:116, y=CINE_TOP; ctx.fillStyle='#e8f4ff'; while(y<58){ const nx=x+Math.round((r()-.5)*12); for(let yy=0;yy<6;yy++) ctx.fillRect(Math.round(lerp(x,nx,yy/6)),y+yy,1,1); x=nx; y+=6; } }
      proNightGround(1);
      const amp=1.2+(t>=78?Math.min(1,(t-78)/16)*3.8*Math.max(0,1-Math.max(0,t-150)/24):howl?.6:0);
      proOak(proNightArt(ROBLE_ART.summer),37,20,amp,i=>t<proPluck(i));
      const wx=caK(t,[[8,200],[40,124,'out'],[78,124],[112,112,'io'],[164,112],[204,-70,'in']]), wy=caK(t,[[8,-12],[40,34,'out'],[164,34],[204,20,'in']])+Math.round(Math.sin(t*.12)*2);
      if(blow){ ctx.fillStyle='rgba(225,238,255,.75)'; for(let i=0;i<16;i++){ const y=Math.round(wy-12+((i*11)%36)), L=8+(i%3)*8, x=wx-18-((t*6+i*29)%120); ctx.fillRect(Math.round(x),y,L,1); } } // el soplido
      proWind(wx,wy,1.1,t<40?'storm':howl?'howl':blow?'blow':'storm',false);
      ROBLE_SEEDS.forEach((_,i)=>{ const u=(t-proPluck(i))/44; if(u<0||u>=1) return; const j=(proPluck(i)-86)/7, [sx,sy]=proSeedXY(i,37,20,amp), a=Math.PI+(j-3.5)*.14; // arrancadas, vuelan valle abajo
        const at=v=>[sx+Math.cos(a)*v*v*210,sy+Math.sin(a)*v*v*105-Math.sin(v*Math.PI)*16];
        for(let q=1;q<=4;q++){ const [x,y]=at(Math.max(0,u-q*.03)); ctx.fillStyle='rgba(255,220,120,'+(.8-q*.17).toFixed(2)+')'; ctx.fillRect(Math.round(x),Math.round(y),1,1); }
        const [x,y]=at(u); glowAt(x,y,6,'rgba(255,224,130,.5)'); ctx.drawImage(ACORN_GOLD,Math.round(x-4),Math.round(y-4)); });
      if(t>=30){ ctx.fillStyle='rgba(235,242,255,.85)'; const n=howl?20:blow?12:6; for(let i=0;i<n;i++){ const L=6+(i%4)*6, y=CINE_TOP+2+((i*37)%94), x=((i*53-t*(howl?8:5))%220+220)%220-40; ctx.fillRect(Math.round(x),y,L,1); } } // la ventisca
      ctx.restore();
      if(bolt){ ctx.fillStyle='rgba(235,245,255,'+(t<44?(.7-(t-40)*.15):.3).toFixed(2)+')'; ctx.fillRect(0,0,160,144); }
      break; }
    case 4: { // el valle entero, de noche: las semillas caen por todos lados; cada estación, presa en su rincón (la Brasa bajo tierra, la Lágrima al tronco hueco, el Ámbar al molino) y el invierno se va con él a su pico
      proNightSky();
      const lock=t0=>t<t0?0:.65+.35*Math.sin((t-t0)*.15), peakK=Math.max(0,Math.min(1,(t-132)/10));
      proPeak(124,12,76,42,PRO_ROCK_N,7); if(peakK>0){ glowAt(124,15,10,'rgba(220,236,255,'+(.45*peakK).toFixed(2)+')'); caStar(124,13,Math.round(peakK*3),'#ffffff'); } // su pico; al final brilla el invierno arriba
      const P=PARA[1]; ctx.drawImage(proNightArt(P.mount),-40,50); ctx.drawImage(proNightArt(P.hills),-90,62); ctx.drawImage(proNightArt(TITLE_HILL[1]),0,74);
      ctx.drawImage(proNightArt(OAK,'#5a6aa8'),59,45); // el Roble, lejos y sin semillas
      proMarsh(); proTrunkAt(16,100,lock(88),PRO_RELIC[1][1]); proMillAt(144,97,lock(98),PRO_RELIC[2][1]); proMoundAt(112,105,lock(74),PRO_RELIC[0][1]);
      PRO_SOWN.forEach(([lx,ly],i)=>{ const t0=2+i*5, u=(t-t0)/22; if(u<0) return; // cada semilla, una estrella fugaz que se queda donde cae
        if(u<1){ const x=lerp(lx+30,lx,u), y=lerp(CINE_TOP-6,ly,u*u); for(let q=1;q<=5;q++){ ctx.fillStyle='rgba(255,220,120,'+(.8-q*.14).toFixed(2)+')'; ctx.fillRect(Math.round(x+q*1.3),Math.round(y-q*2*u),1,1); } glowAt(x,y,5,'rgba(255,224,130,.5)'); ctx.drawImage(ACORN_GOLD,Math.round(x-4),Math.round(y-4)); }
        else { const tw=((tick>>2)+i*3)%13; glowAt(lx+.5,ly+.5,3,'rgba(255,214,110,.35)'); ctx.fillStyle=tw<2?'#fff4b0':'#e0b040'; ctx.fillRect(lx,ly,1,1); if(u<1.5) caStar(lx,ly,Math.round((1.5-u)*6),'#fff4b0'); } });
      // el Viento, con las cuatro estaciones girando a su alrededor: las lanza una a una y se lleva el invierno
      const [wx,wy]=proWind4(t);
      if(t>=18&&wx<190){ const relic=(j,back)=>{ const r=PRO_RELIC[j]; if(r[3]&&t>=r[3]) return; const [x,y,z]=proRelicAt(j,t); if((z<0)!==back) return; glowAt(x,y,8,'rgba('+r[1]+',.5)'); ctx.drawImage(r[0],Math.round(x-8),Math.round(y-8)); };
        for(let j=0;j<4;j++) relic(j,true); proWind(wx,wy,.9,'storm',true); for(let j=0;j<4;j++) relic(j,false); }
      PRO_RELIC.forEach(([img,rgb,to,tf,dur],j)=>{ if(!to||t<tf) return; const u=(t-tf)/dur; if(u>=1.3) return; // en vuelo hacia su rincón; al llegar, un anillo la encierra
        const [ox,oy]=proRelicAt(j,tf), at=v=>[lerp(ox,to[0],v),lerp(oy,to[1],v)-Math.sin(v*Math.PI)*22];
        if(u<1){ for(let q=1;q<=4;q++){ const [xx,yy]=at(Math.max(0,u-q*.04)); ctx.fillStyle='rgba('+rgb+','+(.8-q*.18).toFixed(2)+')'; ctx.fillRect(Math.round(xx),Math.round(yy),1,1); }
          const [x,y]=at(u); glowAt(x,y,8,'rgba('+rgb+',.5)'); ctx.drawImage(img,Math.round(x-8),Math.round(y-8)); }
        else { const r=Math.max(1,Math.round(11*(1-(u-1)/.3))); ctx.drawImage(ringArt(r,'rgb('+rgb+')'),Math.round(to[0])-r-1,Math.round(to[1])-r-1); } });
      break; }
    case 5: { // el valle gris: sin semillas el Roble se estremece por última vez y deja de respirar; el gris sale del tronco, cubre la plaza y hasta las hojas se quedan quietas en el aire
      const old=scScreen('1,1','valley','.'), nu=scScreen('1,1','wilt','.'), cx=80, cy=CINE_TOP+62, Rof=u=>u<24?0:210*Math.pow(Math.min(1,(u-24)/150),1.5), R=Rof(t);
      const amp=t<24?1.3+2.2*Math.sin(Math.min(1,t/24)*Math.PI):0; // el último aliento
      if(old) ctx.drawImage(old,0,CINE_TOP); ctx.drawImage(ROBLE_ROOTS,0,CINE_TOP);
      proOak(ROBLE_ART.base,ROBLE_X,ROBLE_Y+CINE_TOP,amp,PRO_NONE);
      if(R>0){ ctx.save(); proClipCircle(cx,cy,R); if(nu) ctx.drawImage(nu,0,CINE_TOP); ctx.drawImage(proGreyArt(ROBLE_ROOTS),0,CINE_TOP); proOak(ROBLE_ART.ash,ROBLE_X,ROBLE_Y+CINE_TOP,0,PRO_NONE); ctx.restore();
        proRing(cx,cy,R,'#d8d8c0',80,t); }
      const inGrey=(x,y,u)=>{ const r=Rof(u); return (x-cx)*(x-cx)+(y-cy)*(y-cy)<r*r; };
      [[PETRA_SPR,18,80],[LUPA_SPR,124,84],[MOSS_SPR,100,86]].forEach(([spr,x,y],i)=>{ const g=inGrey(x+8,y+10,t), hop=g?0:((tick>>4)+i)&1; ctx.drawImage(g?proGreyArt(spr):spr,x,y-hop); });
      for(let i=0;i<12;i++){ const s=i*5, x0=22+((i*37)%114), y0=CINE_TOP+58+((i*23)%16); if(t<s) continue; // hojas que caen… y se quedan quietas en el aire cuando las alcanza el gris
        let fx=null, fy=null; for(let u=s;u<=t;u+=2){ const x=x0+Math.sin((u+i*20)*.06)*3, y=y0+(u-s)*.34; if(inGrey(x,y,u)){ fx=x; fy=y; break; } }
        if(fx===null){ const x=Math.round(x0+Math.sin((t+i*20)*.06)*3), y=Math.round(y0+(t-s)*.34); if(y<CINE_BOT-2){ ctx.fillStyle='#2e6a24'; ctx.fillRect(x,y+1,3,1); ctx.fillStyle=((tick>>3)+i)&1?'#7ed64e':'#46a63c'; ctx.fillRect(x,y,2,1); ctx.fillRect(x+1,y-1,2,1); } }
        else { const x=Math.round(fx), y=Math.round(fy); ctx.fillStyle='rgba(40,40,30,.35)'; ctx.fillRect(x,y+7,3,1); ctx.fillStyle='#6a6a5c'; ctx.fillRect(x,y+1,3,1); ctx.fillStyle='#d8d8c8'; ctx.fillRect(x,y,2,1); ctx.fillRect(x+1,y-1,2,1); } }
      break; }
    case 6: { // la semilla escondida: late en la savia; cuando pasa el Viento buscando, se apaga; luego vuela a una casita del pueblo y una mano vieja la planta en una maceta
      const room=t>=96, hy0=Math.round(proHillY(131))-1, win=[134,hy0-5];
      if(!room||t<114){ // fuera, de noche, en el valle gris
        proNightSky(); proNightGround(1,true); proOak(proNightArt(ROBLE_ART.ash),37,20,0,PRO_NONE);
        const wx=caK(t,PRO_WIND6), near=t<72&&Math.abs(wx-80)<70, beat=t%64;
        let k=Math.max(Math.exp(-beat/5),beat>=10?.7*Math.exp(-(beat-10)/5):0); if(near) k*=.06; if(t>=66) k=Math.max(k,Math.min(1,(t-66)/8));
        if(t<74){ glowAt(80,82,6+k*10,'rgba(255,212,120,'+(.15+.5*k).toFixed(2)+')'); ctx.fillStyle='rgba(255,226,150,'+(.25+.75*k).toFixed(2)+')'; ctx.fillRect(79,80,2,4); ctx.fillStyle='rgba(255,250,220,'+(.6*k).toFixed(2)+')'; ctx.fillRect(79,81,1,1); }
        proHouse(126,hy0,t>=94?2:1);
        if(t>=8&&t<72) proWind(wx,24+Math.round(Math.sin(t*.09)*3),.7,'storm',true); // busca… y pasa de largo
        if(t>=74&&t<96){ const at=v=>[lerp(80,win[0],v),lerp(82,win[1],v)-Math.sin(v*Math.PI)*44], u=(t-74)/22; if(u<1){ // sale del tronco y vuela a la casita
          for(let q=1;q<=6;q++){ const [x,y]=at(Math.max(0,u-q*.03)); ctx.fillStyle='rgba(255,226,140,'+(.8-q*.12).toFixed(2)+')'; ctx.fillRect(Math.round(x),Math.round(y),1,1); }
          const [x,y]=at(u); glowAt(x,y,7,'rgba(255,224,130,.55)'); caStar(x,y,2+((t>>2)&1),'#fff6c8'); } } }
      if(room){ // dentro: la mano la planta en la maceta
        ctx.save(); if(t<114) proClipCircle(win[0],win[1],CA_EASE.in(Math.min(1,(t-96)/18))*190);
        proRoom(0); proPot(100,62,0);
        const k=caK(t,[[100,0],[118,1,'out'],[134,1],[154,0,'in']]), pat=(t>=126&&t<134&&((t>>1)&1))?2:0, wx=Math.round(lerp(196,120,k)), wy=Math.round(lerp(-24,52,k))+pat, held=t<124;
        if(!held) proSoilGlow(120,70,.55+.45*Math.sin(t*.09));
        if(k>0){ if(held){ glowAt(120,wy+19,7,'rgba(255,224,130,.6)'); ctx.drawImage(ACORN_GOLD,116,wy+15); } proArm(wx,wy,'#a8b0e0'); }
        ctx.restore(); }
      break; }
    case 7: { // tres primaveras: los días pasan por la ventana (el valle sigue gris) y alguien marca una raya por primavera; esta mañana entra la luz, asoma un brote… y abre los ojos
      if(t<100){ const lapse=t<56, S=lapse?[0,1,2,3][((t/6)|0)&3]:4, L=lapse?2:4, marks=t>=42?3:t>=26?2:t>=10?1:0;
        proRoom(L,S); proTally(marks,L);
        proBeam(lapse?(S===2?.08:0):Math.min(.3,(t-56)/30),lapse?'#e8ecf0':'#ffe8a8');
        proPot(100,62,L,t>=64&&t<72?((t&1)?1:-1):0);
        const pulse=[10,26,42].some(m=>t>=m&&t<m+12)?1:.35+.25*Math.sin(t*.1); if(t<72) proSoilGlow(120,70,pulse);
        if(t>=72){ const s=t<80?[4,6,3,2,3,4,3,3][t-72]:3; ctx.fillStyle='#1e4a18'; ctx.fillRect(119,70-s,3,s+1); ctx.fillStyle='#46a63c'; ctx.fillRect(120,70-s,1,s+1); // ¡asoma!: un tallito y dos hojas
          ctx.fillStyle='#1e4a18'; ctx.fillRect(114,67-s,6,3); ctx.fillRect(121,66-s,6,3); ctx.fillStyle='#7ed64e'; ctx.fillRect(115,68-s,4,1); ctx.fillRect(122,67-s,4,1); ctx.fillStyle='#46a63c'; ctx.fillRect(116,69-s,3,1); ctx.fillRect(122,68-s,3,1); }
        if(t>=84){ ctx.save(); proClipCircle(120,66,CA_EASE.in(Math.min(1,(t-84)/16))*190); } }
      if(t>=84){ // de cerca: la luz de la mañana en la cara… y los ojos se abren (justo cuando el texto lo dice)
        const T0=126, open=t>=T0, F=2.4, fy=64, fl=t>=T0-12&&t<T0?[1,.6,1,1,.4,.2,.6,1,.5,.2,.05,0][t-T0+12]:open?caBlinkAt(t,T0+78):1, burst=open&&t<T0+20;
        caFaceCU(t,{pal:burst?['#000','#f0d49c','#fff0c8','#ffffff']:['#000','#f0d49c','#f2d8a4','#f4dcaa'],F,dy:fy-96,lid:fl,eyes:open&&t<T0+30?'wide':'open',
          look:open?caStep(t,[[0,0],[T0+30,-1],[T0+44,1],[T0+58,0]]):0,mouth:open&&t<T0+58?'o':'smile',leaf:Math.round(Math.sin(t*.05)*4+(open?caWob(t,T0,-16,.45,9):0)),glint:open?t-T0-2:-1});
        const hwAt=y=>17.5*F*Math.sqrt(Math.max(0,1-Math.pow((y-fy)/(15.5*F),2)))+1; // media anchura de la cara en esa fila
        for(let x=4;x<156;x++){ const u=(x-80)/76, a=Math.sqrt(Math.max(0,1-u*u)), yb=Math.round(88-3*a), yf=Math.round(92+5*a), dx=Math.abs(x-80); // la maceta: la tierra a los lados de la cara y el borde delante
          for(let y=yb;y<yf-1;y++) if(dx>hwAt(y)){ ctx.fillStyle=y===yb?'#8a3818':'#3a200e'; ctx.fillRect(x,y,1,1); }
          ctx.fillStyle='#3a1a0c'; ctx.fillRect(x,yf-1,1,1); ctx.fillStyle='#f0a868'; ctx.fillRect(x,yf,1,1); ctx.fillStyle='#d88040'; ctx.fillRect(x,yf+1,1,2); ctx.fillStyle='#8a3818'; ctx.fillRect(x,yf+3,1,1); ctx.fillStyle=(x&1)&&x>12&&x<148?'#b85a28':'#a04c20'; ctx.fillRect(x,yf+4,1,CINE_BOT-yf-4); }
        if(!open){ const z=t%46; if(z<38){ ctx.globalAlpha=Math.min(1,(38-z)/10); txtOL('z',118+z*.3,46-z*.5,'#e8f0ff','center'); if(z>16) txtOL('z',126+z*.25,36-z*.5,'#e8f0ff','center'); ctx.globalAlpha=1; } }
        else if(t<T0+50) proBang(128,18-Math.max(0,8-(t-T0))+(t<T0+14?caWob(t,T0+8,-3,.9,3)|0:0),'#ffe070');
        if(t<100) ctx.restore(); }
      break; }
  }
}
function drawPrologue(){
  if(cinePage>=CINE.length){ // el iris se abre sobre la casa: Sprout ya tiene los ojos abiertos en su maceta
    drawScene(); drawUI(); const r=Math.max(0,(12-cineFold)/12)*176, cx=player.x+8, cy=player.y+8, R2=r*r; ctx.fillStyle='#000';
    for(let y=0;y<144;y++){ const dy=y+.5-cy; if(dy*dy>=R2){ ctx.fillRect(0,y,160,1); continue; } const w=Math.sqrt(R2-dy*dy), a=Math.round(cx-w), b=Math.round(cx+w); if(a>0) ctx.fillRect(0,y,a,1); if(b<160) ctx.fillRect(b,y,160-b,1); }
    return; }
  const p=cinePage, full=CINE[p].replace(/\s*\n\s*/g,' '), typing=(cineChars|0)<full.length;
  drawCineScene(p,cineT); drawParts();
  // franjas de cine con el texto a máquina (las letras nuevas caen en su sitio)
  ctx.fillStyle='#000'; ctx.fillRect(0,0,160,CINE_TOP); ctx.fillRect(0,CINE_BOT,160,144-CINE_BOT); ctx.fillStyle='#2a2418'; ctx.fillRect(0,CINE_BOT,160,1);
  let budget=cineChars|0;
  wrapPx(full,148).forEach((ln,i)=>{ if(budget<=0) return; const n=Math.min(ln.length,budget); budget-=ln.length+1;
    drawRichLine(ln,80-(textW(ln)>>1),CINE_BOT+6+i*11,n,{text:'#f4ead0',key:'#ffd060',shadow:'#3a2c18'},typing); });
  for(let i=0;i<CINE.length;i++){ ctx.fillStyle=i===p?'#ffd060':i<p?'#8a7a50':'#3a3428'; ctx.fillRect(160-(CINE.length-i)*5,3,3,2); }
  if(cineFold===0&&!typing){ const b=Math.abs(Math.sin(tick*.15))*2; ctx.drawImage(NEXT_SPR,150,(136+b)|0); }
  // iris entre páginas (nítido, fila a fila)
  if(cineFold>0){ const c=cineFold>12?(24-cineFold)/12:cineFold/12, r=(1-c)*112, R2=r*r; ctx.fillStyle='#000';
    for(let y=0;y<144;y++){ const dy=y+.5-57; if(dy*dy>=R2){ ctx.fillRect(0,y,160,1); continue; } const w=Math.round(Math.sqrt(R2-dy*dy)); ctx.fillRect(0,y,Math.max(0,80-w),1); ctx.fillRect(80+w,y,Math.max(0,80-w),1); } }
  if(cinePage===0&&cineT<24){ ctx.globalAlpha=1-cineT/24; ctx.fillStyle='#000'; ctx.fillRect(0,0,160,144); ctx.globalAlpha=1; }
}
/* el ambiente y los sonidos de cada plano (van con la actualización) */
function cineParts(){
  const p=cinePage, t=cineT, R=Math.random; if(p>=CINE.length) return;
  if(t===1) setTrack(PRO_TRACK[p]);
  if(p===0&&(tick%4)===0){ const a=t*.03-.5; if(Math.sin(a)>0) parts.push({k:(tick&8)?'petal':'leafF',x:80+Math.cos(a)*64+12,y:40+Math.sin(a)*14+4,vx:.35+R()*.3,vy:.12+R()*.2,life:90,max:90,sway:R()*6,col:(tick&16)?'#96dc68':'#d8f4b0',nog:true}); }
  if(p===1){ const L=56, si=((t/L)|0)%4, w=t%L, S=SEASONS[si];
    if(w===1){ if(si<2) SFX.chime(); else SFX.swoosh(); }
    if((tick%6)===0) parts.push({k:S.part,x:R()*170-5,y:CINE_TOP-4,vx:(si>=2?-.45:.1)+(R()-.5)*.3,vy:.35+R()*.3,life:200,max:200,sway:R()*6,r:(tick&8)?1:0,col:S.partCol[(tick>>3)&1],nog:true}); }
  if(p===2&&t>110&&(tick&3)===0) parts.push({k:'flake',x:R()*170,y:CINE_TOP-4,vx:-.25,vy:.45,life:170,max:170,r:(tick&8)?1:0,col:'#ffffff',nog:true});
  if(p===3){ if(t===12) noise(1.2,.035,false,undefined,260); // se acerca la tormenta
    if(t===40){ const T=audio().currentTime; noise(1.5,.05,false,T,520); beep('triangle',330,110,1.3,.05,T,true); beep('triangle',440,150,1.1,.03,T+.08,true); noise(.7,.06,false,T,380); } // el aullido y el trueno
    if(t===62) noise(.6,.05,false,undefined,340);
    if(t===78) noise(1.8,.045,false,undefined,900); // el soplido
    if(t===166) SFX.swoosh(); // se va tras ellas
    ROBLE_SEEDS.forEach((_,i)=>{ if(t===proPluck(i)){ const j=(t-86)/7; beep('square',f(84-j*2),f(79-j*2),.12,.022); } }); // cada semilla que arranca
    if(t>80&&t<150&&(tick&1)===0) parts.push({k:'leafF',x:100+R()*24,y:CINE_TOP+16+R()*44,vx:-2.2-R()*2,vy:(R()-.5)*.8,life:80,max:80,sway:R()*6,col:(tick&2)?'#243a30':'#3a5648',nog:true}); }
  if(p===4){ PRO_SOWN.forEach(([x,y],i)=>{ if(t===2+i*5+22){ beep('square',f(88+(i%3)*2),0,.05,.016); for(let q=0;q<4;q++) parts.push({k:'shard',x,y,vx:(R()-.5)*1.4,vy:-R()*1.2,life:10,max:12,col:'#fff0a0',nog:true}); } });
    PRO_RELIC.forEach(([,rgb,to,tf,dur])=>{ if(!to) return; if(t===tf) SFX.swoosh();
      if(t===tf+dur){ const T=audio().currentTime; beep('triangle',160,60,.25,.07,T); noise(.12,.05,false,T,700); beep('square',f(52),0,.14,.03,T+.08); // la encierra
        for(let q=0;q<8;q++){ const b=q/8*6.283; parts.push({k:'shard',x:to[0],y:to[1],vx:Math.cos(b)*1.6,vy:Math.sin(b)*1.6,life:12,max:12,col:'rgb('+rgb+')',nog:true}); } } });
    if(t===104) noise(1,.035,false,undefined,800); if(t===134) SFX.chime(); }
  if(p===5){ if(t===12){ const T=audio().currentTime; [60,57,53,48].forEach((m,i)=>beep('triangle',f(m),0,.5,.04,T+i*.22)); } // el último aliento
    if(t===28) noise(2,.03,false,undefined,300); }
  if(p===6){ const wx=caK(t,PRO_WIND6), near=t<72&&Math.abs(wx-80)<70, beat=t%64;
    if(t<66&&!near&&(beat===0||beat===10)) beep('triangle',beat?62:72,44,.14,.05); // late…
    if(t===16) noise(1.4,.03,false,undefined,600); if(t===74) SFX.chime(); if(t===94) SFX.ping();
    if(t===124) beep('triangle',f(72),f(67),.12,.035); if(t===127||t===131) noise(.05,.035,false,undefined,500); }
  if(p===7){ if(t===10||t===26||t===42){ noise(.06,.03,true,undefined,4200); beep('square',f(76+(t-10)/16*2),0,.08,.02); } // una raya más
    if(t===56) SFX.chime(); if(t===72) SFX.jump(); if(t===126){ SFX.momentCatch(); SFX.ping(); }
    if(t>=56&&t<84&&(tick%9)===0) parts.push({k:'mote',x:60+R()*60,y:CINE_TOP+30+R()*50,vx:.05,vy:-.05,life:90,max:90,sway:R()*6,col:'#fff6c0',nog:true}); }
}
/* ============================================================
   SELECTOR DE PARTIDA: «ELIGE TU BROTE»
   La cámara baja desde el título hasta el prado del Roble, donde
   esperan tres macetas. En cada una duerme un brote (una partida)
   o una semilla (una ranura libre). La elegida se despierta bajo
   un rayo de luz; al borrar, el brote se hunde y vuelve a semilla.
   ============================================================ */
let titleCam=0, fileT=0, fileSpotX=80, fileWake=[0,0,0], fileDelT=[0,0,0];
const FILE_POT_X=[30,80,130], FILE_POT_Y=72;
const POT_PALS=[['#4a1c0c','#7a3414','#b05426','#d8803e','#f4ac6c'],['#12204a','#22407a','#3662aa','#5a8ed4','#a4ccf4'],['#12321a','#225a2a','#358a38','#58b048','#a4dc80']];
const FILE_POTS=POT_PALS.map(pal=>{ const c=mkCanvas(32,26), g=c.getContext('2d');
  blobArt(g,2,6,28,20,[{x:14,y:7,r:12.5,ry:9},{x:14,y:12,r:9.5,ry:6.5}],pal,{grad:.45,dither:.6});
  blobArt(g,0,1,32,9,[{x:16,y:4.5,r:15.5,ry:3.8}],pal,{grad:.15,dither:.4});
  for(let y=3;y<=7;y++){ const dy=(y-5)/2.2, w=Math.round(12.5*Math.sqrt(Math.max(0,1-dy*dy))); g.fillStyle=y<=4?'#1e1208':'#2e1c0c'; g.fillRect(16-w,y,w*2,1); }
  g.fillStyle='#4a3018'; for(const [x,y] of [[9,6],[14,5],[20,6],[23,5],[12,7]]) g.fillRect(x,y,1,1);
  g.fillStyle=pal[4]; g.fillRect(6,15,20,1); g.fillStyle=pal[1]; for(let x=7;x<26;x+=4) g.fillRect(x,16,2,1);
  return c; });
function fileSoilY(){ return FILE_POT_Y+5; }
/* un brote dentro de su maceta: rise = píxeles que asoman por encima de la tierra */
function drawPotSprout(cx,rise,img,dx,squash){
  const soil=fileSoilY(); ctx.save(); ctx.beginPath(); ctx.rect(cx-24,0,48,soil+1); ctx.clip();
  if(squash){ ctx.translate(cx+dx,soil); ctx.scale(1+squash*.15,1-squash*.15); ctx.drawImage(img,-16,-rise,32,32); }
  else ctx.drawImage(img,cx-16+dx,soil-rise,32,32);
  ctx.restore(); }
function drawPots(alpha,sink){
  ctx.save(); ctx.globalAlpha=alpha;
  for(let i=0;i<3;i++){
    const cx=FILE_POT_X[i], sel=i===fileSel&&state==='file', d=slotCache[i];
    const enter=state==='file'?clamp((fileT-6-i*5)/14,0,1):1, drop=Math.round((1-easeOutBack(enter))*46+(sink||0));
    ctx.save(); ctx.translate(0,drop);
    drawShadow(cx,FILE_POT_Y+24,13);
    const pot=FILE_POTS[i], px=cx-16, py=FILE_POT_Y;
    const shakeX=sel&&fileConfirm?((tick>>1)&1?1:-1):0;
    ctx.drawImage(pot,px+shakeX,py);
    const since=tick-fileWake[i], wk=sel?clamp(since/10,0,1):0;
    if(fileDelT[i]>0){ const k=fileDelT[i]/36; drawPotSprout(cx,Math.round(24*k),P_BLINK[0],shakeX,1-k); }
    else if(d){ // un brote: dormido, o despierto si es el elegido
      let rise=Math.round(22+wk*6), img=wk>.3?P_SPRITES[0][0]:P_BLINK[0], sq=0;
      if(sel&&!fileConfirm){ if(since<22&&since>6) img=H_LIFT; const hp=(since-30)%110; if(since>30&&hp<16){ rise+=Math.round(Math.sin(hp/16*Math.PI)*7); img=hp<8?P_SPRITES[0][1]:img; } else if(since>30&&hp<22) sq=(22-hp)/6;
        if(((tick+i*50)%190)<6&&since>30) img=P_BLINK[0]; }
      if(sel&&fileConfirm){ img=P_SPRITES[0][0]; rise=26; }
      if(!sel) rise+=((tick>>5)+i)&1;
      drawPotSprout(cx,rise,img,shakeX,sq);
      if(sel&&fileConfirm&&(tick&15)<11){ ctx.fillStyle=PAL.k; ctx.fillRect(cx+9,fileSoilY()-rise+6,3,4); ctx.fillStyle='#8ad0ff'; ctx.fillRect(cx+10,fileSoilY()-rise+6+((tick>>3)&1),1,2); }
      if(!sel&&((tick+i*40)%120)<70){ const zt=((tick+i*40)%120)/70; txtS('z',cx+10+Math.round(zt*4),fileSoilY()-24-Math.round(zt*10),'#e8f0ff'); } }
    else { // una semilla que espera; la elegida echa un brote
      const soil=fileSoilY(); ctx.save(); ctx.beginPath(); ctx.rect(cx-16,0,32,soil+2); ctx.clip(); ctx.drawImage(ACORN_GOLD,cx-4,soil-5); ctx.restore();
      if(sel){ const g2=easeOutBack(wk), sw=Math.round(Math.sin(tick*.08)*1); ctx.save(); ctx.translate(cx+sw,soil-2); ctx.scale(1,Math.max(.05,g2)); ctx.drawImage(H_SEEDLING,0,0,16,13,-16,-26,32,26); ctx.restore(); }
      if(((tick+i*37)&31)===0) sparkle(cx-3+Math.random()*6,soil-4,'#fff6c0'); }
    txtOL(''+(i+1),cx,py+14,'#fff6d8','center',POT_PALS[i][0]);
    ctx.restore(); }
  ctx.restore();
}
function fileSpot(){ // rayo de luz que se desliza hasta la maceta elegida
  fileSpotX+=(FILE_POT_X[fileSel]-fileSpotX)*.22; const x=fileSpotX, k=Math.min(1,fileT/20);
  ctx.save(); ctx.globalCompositeOperation='lighter';
  ctx.fillStyle='rgba(255,246,200,'+(0.09*k).toFixed(3)+')'; ctx.beginPath(); ctx.moveTo(x-8,0); ctx.lineTo(x+10,0); ctx.lineTo(x+24,FILE_POT_Y+22); ctx.lineTo(x-22,FILE_POT_Y+22); ctx.fill();
  ctx.fillStyle='rgba(255,250,220,'+(0.08*k).toFixed(3)+')'; ctx.beginPath(); ctx.moveTo(x-3,0); ctx.lineTo(x+5,0); ctx.lineTo(x+13,FILE_POT_Y+22); ctx.lineTo(x-11,FILE_POT_Y+22); ctx.fill();
  ctx.restore(); glowAt(x,FILE_POT_Y+22,20,'rgba(255,246,200,'+(0.22*k).toFixed(3)+')'); }
function clockIcon(x,y,col){ ctx.fillStyle=PAL.k; ctx.fillRect(x+1,y,5,7); ctx.fillRect(x,y+1,7,5); ctx.fillStyle='#fff6d8'; ctx.fillRect(x+1,y+1,5,5); ctx.fillStyle=col; ctx.fillRect(x+3,y+2,1,2); ctx.fillRect(x+4,y+3,1,1); }
function drawFileCard(y){
  const i=fileSel, d=slotCache[i], F=drawFrame(6,y,148,31,'wood');
  if(fileConfirm&&d){ roundBox(6,y,148,31,'rgba(200,40,30,.22)');
    txt('¿Arrancar el brote '+(i+1)+'?',80,y+3,'#8a1808','center'); txt('Su aventura se perderá.',80,y+13,F.text,'center');
    txtS('Z SÍ · X NO',80,y+24,(tick&31)<22?'#8a1808':F.inner,'center'); return; }
  badge(''+(i+1),10,y+2);
  if(!d){ txt('NUEVO BROTE',22,y+3,F.key); txt('Una semilla espera.',10,y+13,F.text); txt('¡Pulsa Z y plántala!',10,y+22,F.text); return; }
  const ch=d.cycled?5:d.autumned?4:d.summered?3:d.thawed?2:d.won?1:0;
  txt(CHAPTER_NAMES[ch],22,y+3,F.key); clockIcon(116,y+3,'#8a1808'); txt(timeStr(d.playTime||0).slice(0,-3),150,y+3,F.text,'right');
  const mh=Math.min(10,((d.maxHp||6)/2)|0); for(let h=0;h<mh;h++) ctx.drawImage(HEART_FULL,10+h*7,y+13,7,7);
  ctx.drawImage(ACORN_GOLD,116,y+12); txt(Math.min(8,d.seeds||0)+'/8',150,y+13,F.text,'right');
  [[EMBER_SPR,d.thawed],[TEAR_SPR,d.summered],[AMBER_SPR,d.autumned||d.cycled],[FLAKE_SPR,d.cycled]].forEach(([sp,on],k)=>{ ctx.save(); if(!on) ctx.globalAlpha=.25; ctx.drawImage(sp,0,0,16,16,10+k*11,y+21,10,10); ctx.restore(); });
  const am=(d.amulets||[]).length, lt=(d.collected||[]).filter(c=>c[0]==='✉').length;
  const amT=am+'/'+Object.keys(AMULETS).length, lx=Math.max(92,70+textW(amT)+5);
  ctx.drawImage(AMULET_SPR.raiz,0,0,12,12,58,y+21,10,10); txt(amT,70,y+22,F.text);
  ctx.drawImage(LETTER_SPR,0,0,LETTER_SPR.width,LETTER_SPR.height,lx,y+22,10,8); txt(lt+'/5',lx+12,y+22,F.text);
}
function drawFileSelect(){
  const cam=titleCam;
  drawSeasonWorld(cam); fileSpot(); drawPots(1,0); drawParts();
  if(cam<1) drawLogo(-Math.round(cam*56),1-cam);
  const rk=clamp(fileT/16,0,1); ribbon(80,Math.round(-16+21*easeOutBack(rk)),textW('ELIGE TU BROTE')+14,'ELIGE TU BROTE');
  const ck=clamp((fileT-12)/14,0,1); if(ck>0){ const y=Math.round(104+(1-easeOutBack(ck))*44); drawFileCard(y);
    const fk=clamp((fileT-20)/10,0,1); if(fk>0){ ctx.globalAlpha=fk; txtSO(fileConfirm?'Z ARRANCAR · X CANCELAR':slotCache[fileSel]?'Z JUGAR · X BORRAR · ENTER ATRÁS':'Z PLANTAR · ENTER ATRÁS',80,139,fileConfirm?'#ffd0c0':'#fff6d8','center','#1a1408'); ctx.globalAlpha=1; } }
  if(state==='file'){ const d=slotCache[fileSel], since=tick-fileWake[fileSel], rise=d?(fileConfirm?26:27):26, b=Math.round(Math.abs(Math.sin(tick*.12))*3);
    if(fileT>18&&fileDelT[fileSel]===0) ctx.drawImage(NEXT_SPR,FILE_POT_X[fileSel]-3,fileSoilY()-rise-12-b+(since<10?10-since:0)); }
}
function fileParts(){
  const si=menuSeason(), S=SEASONS[si];
  if((tick%(si===3?5:11))===0) parts.push({k:S.part,x:Math.random()*170-5,y:-4,vx:(si===2?.4:.1)+(Math.random()-.5)*.3,vy:.3+Math.random()*.35,life:260,max:260,sway:Math.random()*6,r:(tick&8)?1:0,col:S.partCol[(tick>>3)&1],nog:true});
  if((tick%14)===0) parts.push({k:'mote',x:fileSpotX-10+Math.random()*20,y:20+Math.random()*60,vx:0,vy:.12,life:90,max:90,sway:Math.random()*6,col:'#fff6c0',nog:true});
}
/* la cinemática de estación (cuando vuelve cada reliquia) vive ahora en 15f-roble.js: el valle cambia de verdad */
/* ============================================================
   EL FINAL: cuatro planos antes de los créditos.
   playEnding(cb) — Z pasa de plano; cb al terminar (créditos)
   ============================================================ */
let ending=null;
const END_SHOTS=[
  {len:300,txt:['Las cuatro estaciones','volvieron a su sitio.']},
  {len:300,txt:['Y el Viento del Norte','bajó a ver a su hermano.']},
  {len:300,txt:['El valle volvió a girar,','y todos salieron a verlo.']},
  {len:330,txt:['La novena semilla','ya no duerme.']},
];
function playEnding(cb){ ending={shot:0,t:0,cb:cb||null}; state='ending'; parts=[]; toast=null; if(AC){ setTrack(typeof TRACKS!=='undefined'&&TRACKS.final?'final':'creditos'); } }
function updEnding(){
  const e=ending; if(!e){ state='credits'; return; } e.t++; const S=END_SHOTS[e.shot];
  const si=e.shot===2?((e.t/75)|0)%4:e.shot===1?3:1, SS=SEASONS[si];
  if((tick%6)===0) parts.push({k:SS.part,x:Math.random()*170-5,y:-4,vx:(Math.random()-.5)*.3,vy:.3+Math.random()*.3,life:240,max:240,sway:Math.random()*6,r:(tick&8)?1:0,col:SS.partCol[(tick>>3)&1],nog:true});
  if(e.shot===1&&(tick%9)===0) parts.push({k:'petal',x:Math.random()*160,y:-4,vx:.2,vy:.4,life:220,max:220,sway:Math.random()*6,col:'#f8c8e0',nog:true});
  updParts();
  if(keys.fire&&e.t>30){ keys.fire=false; e.t=S.len; }
  if(e.t>=S.len){ e.shot++; e.t=0; parts=[]; if(AC) SFX.chime();
    if(e.shot>=END_SHOTS.length){ const cb=e.cb; ending=null; if(cb) cb(); else { state='credits'; creditsT=0; } } }
}
function drawEnding(){
  const e=ending; if(!e) return; const S=END_SHOTS[e.shot], t=e.t;
  if(e.shot===0){ // la plaza: las cuatro raíces se encienden una a una y llevan su estación al Roble
    const keep=SEASON_FORCE; SEASON_FORCE=0; const bg=scScreen('1,1','valley','.'); if(bg) ctx.drawImage(bg,0,8); ctx.save(); ctx.translate(0,8);
    ctx.drawImage(ROBLE_ROOTS,0,0);
    ROBLE_ALTARS.forEach((A,i)=>{ const k=clamp((t-24-i*34)/30,0,1); if(k>0) rootLight(A,k,.85,k<1?k:((tick*.7+i*40)%150)/150); });
    const lit=ROBLE_ALTARS.filter((A,i)=>t>=54+i*34).length; if(lit) glowAt(80,62,16+lit*6+Math.sin(tick*.1)*2,'rgba(255,244,200,'+(.12*lit).toFixed(2)+')');
    drawRoble(ROBLE_X,ROBLE_Y); ROBLE_ALTARS.forEach(A=>drawAltarRelic(A));
    ctx.drawImage(ELDER,64,64); ctx.drawImage(P_SPRITES[1][0],64,80); ctx.restore(); SEASON_FORCE=keep;
  } else if(e.shot===1){ // los hermanos: el Viento baja y rodea al Roble, manso
    drawTitleScene(3,1,0,false); const k=clamp(t/160,0,1), a=t*.02;
    const wx=80+Math.cos(a)*44*(1-k*.3), wy=18+k*22+Math.sin(a)*8;
    ctx.save(); ctx.globalAlpha=.95; ctx.translate(Math.round(wx),Math.round(wy)); if(Math.cos(a)<0) ctx.scale(-1,1); ctx.drawImage(WIND_SPR,-16,-16); ctx.restore();
    if(t>150&&(tick&7)<4) sparkle(80+(Math.random()-.5)*60,40+(Math.random()-.5)*30,'#fff6d0');
  } else if(e.shot===2){ // el año gira, con todos mirando (barrido nítido desde la copa)
    const si=((t/75)|0)%4, w=t%75; drawTitleScene((si+3)%4,1,0,false);
    if(w<30){ ctx.save(); ctx.beginPath(); for(const [y,a,b] of caWipeSpans(w/30,'iris')) ctx.rect(a,y,b-a,1); ctx.clip(); drawTitleScene(si,1,0,false); ctx.restore(); } else drawTitleScene(si,1,0,false);
    const crowd=[PETRA_SPR,LUPA_SPR,MOSS_SPR,TILO_SPR,CORTEZA_SPR,ELDER]; crowd.forEach((sp,i)=>{ const x=6+i*26, hop=((tick>>3)+i*3)%12===0?2:0; drawShadow(x+8,131,6); ctx.drawImage(sp,x,115-hop); });
  } else { // la novena semilla, de cerca: Sprout en grande (el mismo de las cinemáticas), bajo el Roble en flor
    drawTitleScene(0,1,0,false); ctx.fillStyle='rgba(255,246,210,.16)'; ctx.fillRect(0,0,160,144);
    const air=t>=150&&t<168?Math.sin((t-150)/18*Math.PI):0, fy=Math.round(132-air*16);
    const pose={eyes:t<70?'closed':t<104?(t<76?'open':'wide'):t<150?'open':'closed',lid:t>=200?caBlinkAt(t,260):0,mouth:t<70?'smile':t<104?'o':'grin',look:t>=104&&t<150?caStep(t,[[104,-1],[122,1],[138,0]]):0,
      arms:t<150?[[18,44],[46,44]]:[[caK(t,[[150,18],[160,12,'out']]),caK(t,[[150,44],[160,14,'back']])],[caK(t,[[150,46],[160,52,'out']]),caK(t,[[150,44],[160,14,'back']])]],
      leaf:Math.round(Math.sin(t*.09)*5+caWob(t,168,16,.45,9)),sq:t>=150&&t<154?.9:t>=168&&t<174?.86:1+Math.round(Math.sin(t*.07))*.02};
    drawShadow(80,132,14-air*6); caHeroAt(pose,80,fy);
    if(t>170&&(tick&3)===0) sparkle(56+Math.random()*48,70+Math.random()*30,'#fff6c0');
  }
  drawParts();
  const lb=Math.min(1,t/16,(S.len-t)/16), h=Math.round(14*lb); ctx.fillStyle='#000'; ctx.fillRect(0,0,160,h); ctx.fillRect(0,144-h,160,h);
  const a=Math.min(1,Math.max(0,(t-30)/20),(S.len-t)/20); if(a>0){ ctx.globalAlpha=a*.55; const bw=Math.max(...S.txt.map(l=>textW(l)))+14; roundBox(80-(bw>>1),10,bw,S.txt.length*11+5,'#0a120c'); ctx.globalAlpha=a; S.txt.forEach((ln,i)=>{ txtO(ln,80,13+i*11,'#fffbe8','center','#1a1408'); }); ctx.globalAlpha=1; }
  if(t<16){ ctx.globalAlpha=1-t/16; ctx.fillStyle=e.shot===0?'#fff':'#000'; ctx.fillRect(0,0,160,144); ctx.globalAlpha=1; }
}
