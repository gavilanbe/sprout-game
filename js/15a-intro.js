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
   PRÓLOGO DE PARTIDA NUEVA: siete planos a pantalla completa
   (franjas de cine, texto a máquina abajo, iris entre páginas)
   ============================================================ */
let cineT=0;
const CINE_TOP=8, CINE_BOT=106;
const OAK_NIGHT=tintTo(OAK_GRAND,'#0c1224');
const POT_BIG=(()=>{ const c=mkCanvas(40,30), g=c.getContext('2d');
  blobArt(g,2,2,36,26,[{x:18,y:6,r:17,ry:4},{x:18,y:16,r:14,ry:10}],['#5a2410','#8a3818','#b85a28','#d88040','#f0a868'],{grad:.5,dither:.6});
  g.fillStyle='#3a2410'; g.fillRect(6,5,28,3); g.fillStyle='#5a3a1c'; g.fillRect(8,5,24,1); return c; })();
/* un plano de día sin Sprout (reutiliza la escena del título) */
function dayScene(si){ const S=SEASONS[si], P=PARA[si];
  ctx.drawImage(P.sky,0,0); glowAt(128,24,22,'rgba(255,250,220,.35)'); ctx.drawImage(disc(7,S.sun),121,17);
  const drift=Math.round((tick*.12)%320); ctx.drawImage(P.clouds,-drift,20); ctx.drawImage(P.clouds,320-drift,20);
  ctx.drawImage(P.mount,-40,40); ctx.drawImage(P.hills,-90,52);
  ctx.drawImage(TITLE_HILL[si],0,78); drawShadow(80,102,26); ctx.drawImage(OAK_SEASON[si],37,20); }
function nightSky(){ ctx.drawImage(NIGHT,0,-10);
  for(const [x,y,big,ph] of STARS){ const tw=((tick+ph*7)>>3)%8; if(tw===0) continue; ctx.fillStyle=tw<3?'#8888b8':'#fffbe8'; ctx.fillRect(x,y-10,1,1); } }
function windSpr(x,y,a,flip){ ctx.save(); ctx.globalAlpha=a; ctx.translate(Math.round(x),Math.round(y)); if(flip) ctx.scale(-1,1); ctx.drawImage(WIND_SPR,-32,-32,64,64); ctx.restore(); }
function windLines(n,y0,h,sp){ ctx.fillStyle='rgba(223,240,255,.7)'; for(let i=0;i<n;i++){ const x=((tick*sp+i*53)%200)-20, y=y0+(i*37)%h; ctx.fillRect(160-x,y,10+(i%3)*6,1); } }
function drawCineScene(p,t){
  switch(p){
    case 0: { dayScene(1); // los dos hermanos: el Viento juega alrededor del Roble
      const a=t*.03; windSpr(80+Math.cos(a)*56,34+Math.sin(a)*10,.85,Math.cos(a)<0);
      ctx.strokeStyle='rgba(240,250,255,.6)'; ctx.lineWidth=1; for(let i=0;i<3;i++){ ctx.beginPath(); ctx.arc(80,48,36+i*6,a*2+i,a*2+i+1.6); ctx.stroke(); } break; }
    case 1: { const si=((t/45)|0)%4, w=t%45; // el año gira
      dayScene((si+3)%4); ctx.save(); ctx.beginPath(); ctx.arc(80,50,Math.min(160,w*6),0,6.283); ctx.clip(); dayScene(si); ctx.restore();
      if(w<26){ ctx.strokeStyle='rgba(255,255,240,.9)'; ctx.lineWidth=2; ctx.beginPath(); ctx.arc(80,50,w*6,0,6.283); ctx.stroke(); }
      txtSO(SEASONS[si].name,80,CINE_TOP+4,'#fffbe8','center'); break; }
    case 2: { // olvido: a la izquierda todos cantan al Roble; a la derecha, el Viento solo en el pico
      ctx.save(); ctx.beginPath(); ctx.rect(0,0,80,144); ctx.clip(); dayScene(1);
      [[PETRA_SPR,12,86],[LUPA_SPR,30,90],[TILO_SPR,48,88]].forEach(([s2,x,y],i)=>{ const b=((tick>>3)+i)&1; ctx.drawImage(s2,x,y-b); if(((tick>>4)+i)%3===0){ ctx.fillStyle='#fff6c0'; ctx.fillRect(x+10,y-8-b,2,2); ctx.fillRect(x+12,y-11-b,1,4); } }); ctx.restore();
      ctx.save(); ctx.beginPath(); ctx.rect(80,0,80,144); ctx.clip(); nightSky();
      ctx.fillStyle='#8a98c0'; ctx.beginPath(); ctx.moveTo(84,106); ctx.lineTo(122,40); ctx.lineTo(164,106); ctx.fill(); ctx.fillStyle='#e8f0ff'; ctx.beginPath(); ctx.moveTo(110,60); ctx.lineTo(122,40); ctx.lineTo(134,60); ctx.lineTo(126,56); ctx.lineTo(120,62); ctx.lineTo(115,57); ctx.fill();
      windSpr(122,30+Math.sin(t*.05)*2,.85,false); ctx.restore();
      ctx.fillStyle=PAL.k; ctx.fillRect(79,0,2,144); break; }
    case 3: { nightSky(); ctx.drawImage(OAK_NIGHT,37,24); // el robo
      const k=clamp(t/90,0,1); windSpr(150-k*70+Math.sin(t*.2)*3,34+Math.sin(t*.1)*4,.95,true); windLines(10,20,80,4);
      for(let i=0;i<8;i++){ const a=i/8*6.283+.3, d=clamp((t-30-i*4)/60,0,1), e=d*d; const x=80+Math.cos(a)*(10+e*110), y=52+Math.sin(a)*(6+e*60)-Math.sin(d*3.1)*20;
        if(d>0&&d<1){ glowAt(x,y,7,'rgba(255,230,140,.5)'); ctx.drawImage(ACORN_GOLD,(x-4)|0,(y-4)|0); } else if(d===0){ ctx.drawImage(ACORN_GOLD,(80+Math.cos(a)*18-4)|0,(48+Math.sin(a)*10-4)|0); } }
      break; }
    case 4: { dayScene(1); const k=clamp(t/150,0,1); // el valle se apaga
      ctx.save(); ctx.globalCompositeOperation='saturation'; ctx.globalAlpha=k*.85; ctx.fillStyle='#808080'; ctx.fillRect(0,0,160,144); ctx.restore();
      ctx.globalAlpha=k*.3; ctx.fillStyle='#6a6040'; ctx.fillRect(0,0,160,144); ctx.globalAlpha=k*.45; ctx.drawImage(OAK_GRAND_DARK,37,20); ctx.globalAlpha=1; break; }
    case 5: { ctx.fillStyle='#06060e'; ctx.fillRect(0,0,160,144); // la novena semilla
      const k=clamp(t/110,0,1), e=1-(1-k)*(1-k), y=20+e*52; drawRaysAt(80,y,.6+Math.sin(t*.1)*.1);
      glowAt(80,y,26,'rgba(255,230,140,.35)'); ctx.drawImage(ACORN_GOLD,0,0,8,8,72,(y-8)|0,16,16);
      ctx.drawImage(POT_BIG,60,80); if(k>=1&&(t&15)===0) sparkle(70+Math.random()*20,74,'#fff6c0'); break; }
    case 6: { // la maceta, de cerca, y unos ojos que se abren
      ctx.fillStyle='#b88450'; ctx.fillRect(0,0,160,144); for(let y=0;y<144;y+=6){ ctx.fillStyle='#a07040'; ctx.fillRect(0,y,160,1); ctx.fillStyle='#c89458'; ctx.fillRect(0,y+1,160,1); }
      ctx.fillStyle='#6a4a2a'; ctx.fillRect(18,16,36,40); ctx.fillStyle='#a8d8f8'; ctx.fillRect(21,19,30,34); ctx.fillStyle='#ffffff'; ctx.fillRect(23,21,8,4); ctx.fillStyle='#6a4a2a'; ctx.fillRect(35,19,2,34); ctx.fillRect(21,35,30,2);
      ctx.save(); ctx.globalAlpha=.22; ctx.fillStyle='#fff6c0'; ctx.beginPath(); ctx.moveTo(21,19); ctx.lineTo(51,19); ctx.lineTo(120,106); ctx.lineTo(70,106); ctx.fill(); ctx.restore();
      const awake=t>70, head=awake?H_WAKE:H_SLEEP; ctx.drawImage(head,0,2,16,14,56,34+((tick>>5)&1),48,42); ctx.drawImage(POT_BIG,0,0,40,30,50,70,60,45);
      if(!awake&&(t%40)<30){ txtO('z',100,40-((t%40)>>2),'#e8f0ff'); if((t%40)>12) txtO('z',106,30-((t%40)>>2),'#e8f0ff'); }
      if(awake&&t<110){ txtOL('!',80,20+Math.round(Math.max(0,10-(t-70))),'#ffe070','center'); } break; }
  }
}
function drawRaysAt(cx,cy,k){ ctx.save(); ctx.translate(cx,cy); ctx.rotate(tick*.01); for(let i=0;i<12;i++){ const a=i/12*6.283; ctx.fillStyle=i&1?'rgba(255,240,180,.16)':'rgba(255,220,120,.1)'; ctx.beginPath(); ctx.moveTo(0,0); ctx.lineTo(Math.cos(a-.12)*90*k,Math.sin(a-.12)*90*k); ctx.lineTo(Math.cos(a+.12)*90*k,Math.sin(a+.12)*90*k); ctx.fill(); } ctx.restore(); }
function drawPrologue(){
  const p=Math.min(cinePage,CINE.length-1);
  drawCineScene(p,cineT); drawParts();
  // franjas de cine con el texto a máquina
  ctx.fillStyle='#000'; ctx.fillRect(0,0,160,CINE_TOP); ctx.fillRect(0,CINE_BOT,160,144-CINE_BOT); ctx.fillStyle='#2a2418'; ctx.fillRect(0,CINE_BOT,160,1);
  const lines=wrapPx(CINE[p].replace(/\s*\n\s*/g,' '),148); let budget=cineChars|0;
  lines.forEach((ln,i)=>{ if(budget<=0) return; const s2=ln.slice(0,budget); budget-=ln.length+1; const y=CINE_BOT+6+i*11, x=80-(textW(ln)>>1);
    drawRichLine(s2,x,y,s2.length,{text:'#f4ead0',key:'#ffd060',shadow:'#3a2c18'},false); });
  for(let i=0;i<CINE.length;i++){ ctx.fillStyle=i===p?'#ffd060':i<p?'#8a7a50':'#3a3428'; ctx.fillRect(160-(CINE.length-i)*5,3,3,2); }
  const full=CINE[p].replace(/\s*\n\s*/g,' ');
  if(cineFold===0&&(cineChars|0)>=full.length){ const b=Math.abs(Math.sin(tick*.15))*2; ctx.drawImage(NEXT_SPR,150,(136+b)|0); }
  // iris entre páginas
  if(cineFold>0){ const c=cineFold>12?(24-cineFold)/12:cineFold/12, r=(1-c)*110;
    const R2=Math.max(0,r)*Math.max(0,r); ctx.fillStyle='#000'; for(let y=0;y<144;y++){ const dy=y-56, w=dy*dy<R2?Math.round(Math.sqrt(R2-dy*dy)):0; if(!w){ ctx.fillRect(0,y,160,1); continue; } ctx.fillRect(0,y,Math.max(0,80-w),1); ctx.fillRect(80+w,y,Math.max(0,80-w),1); } }
  if(cinePage===0&&cineT<24){ ctx.globalAlpha=1-cineT/24; ctx.fillStyle='#000'; ctx.fillRect(0,0,160,144); ctx.globalAlpha=1; }
}
function cineParts(){
  const p=cinePage;
  if(p===0&&(tick%9)===0) parts.push({k:'leafF',x:170,y:20+Math.random()*60,vx:-1.2,vy:.2,life:160,max:160,sway:Math.random()*6,col:(tick&16)?'#78d838':'#a4e070',nog:true});
  if(p===2&&(tick&3)===0) parts.push({k:'flake',x:80+Math.random()*80,y:-4,vx:-.2,vy:.6,life:140,max:140,r:(tick&8)?1:0,col:'#ffffff',nog:true});
  if(p===4&&(tick%7)===0) parts.push({k:'leafF',x:Math.random()*160,y:-4,vx:.2,vy:.45,life:220,max:220,sway:Math.random()*6,col:(tick&8)?'#a89048':'#8a7a48',nog:true});
  if(p===6&&(tick%13)===0) parts.push({k:'mote',x:30+Math.random()*60,y:30+Math.random()*60,vx:.05,vy:-.05,life:120,max:120,sway:Math.random()*6,col:'#fff6c0',nog:true});
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
