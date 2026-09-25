'use strict';
/* ============================================================
   EL EQUIPO DE SPROUT: que cada arma y cada herramienta se note.
   · La Hoja cambia con cada filo (verde, afilada, templada) y, templada
     y con el vigor lleno, lanza un RAYO DE HOJA.
   · Remolino con carga visible (anillo, tono que sube) y GRAN REMOLINO:
     dos vueltas, más alcance, carga rápida y tornado grande.
   · Escudo a la vista; con el ESCUDO DE ROBLE, lo que bloqueas justo al
     girarte (o lo que golpeas con la Hoja) REBOTA hacia quien lo lanzó.
   · Bellotas-bomba con mecha viva, metralla, fuego y quemadura en el suelo.
   · La raíz-gancho agarra bichos pequeños (aturdidos) y bayas o corazones.
   · La Vaina se carga manteniendo X: vuela más lejos y atraviesa.
   · El farol lanza una llamarada: quema matorrales y hierba (el fuego se
     propaga) y derrite golemitos.
   · El vilano planea si mantienes X en lo alto del salto.
   · Los amuletos se ven cuando actúan.
   ============================================================ */
let hasBigSpin=false, shieldLvl=1;               // mejoras nuevas (se guardan)
let leafBeams=[], grabRope=null, boomerCharge=0, glideT=0, glideUsed=false, scorches=[], burnFires=[], flares=[];
let lastDirG=0, lastTurnT=-99, shieldFlashT=0, gearRoom='';
function gearRm(){ return sx+','+sy; }
/* ---------- la Hoja: un color por filo ---------- */
const BLADE_TIERS=[null,
  {pal:['#1d5a22','#2e8a34','#78d838','#b8f070','#e8ffc8'], smear:['#2e8a34','#78d838','#b8f070','#ffffe8'], glow:null, notch:'#3a9a2a'},
  {pal:['#0e4a44','#1a8a78','#40c8a0','#a0f0d8','#eafff8'], smear:['#1a8a78','#40c8a0','#a0f0d8','#ffffff'], glow:'rgba(160,255,230,.30)', notch:'#1a9a88'},
  {pal:['#6a3a08','#b87818','#f0c040','#ffe890','#fffbe0'], smear:['#b87818','#f0c040','#ffe890','#ffffff'], glow:'rgba(255,220,120,.42)', notch:'#c88a10'}];
function retintLum(img,pal){ // recolorea por luminancia los píxeles verdes (la hoja); deja el contorno y el peciolo
  const c=mkCanvas(img.width,img.height), g=c.getContext('2d'); g.drawImage(img,0,0);
  const d=g.getImageData(0,0,c.width,c.height), a=d.data, idx=[];
  for(let i=0;i<a.length;i+=4){ if(!a[i+3]) continue; if(a[i+1]>a[i]+12&&a[i+1]>a[i+2]+12) idx.push(i); }
  if(!idx.length) return c;
  const lum=idx.map(i=>a[i]*.3+a[i+1]*.59+a[i+2]*.11), lo=Math.min(...lum), hi=Math.max(...lum);
  idx.forEach((i,k)=>{ const t=hi>lo?(lum[k]-lo)/(hi-lo):.5, [r,gg,b]=hex2rgb(pal[Math.min(pal.length-1,Math.round(t*(pal.length-1)))]); a[i]=r; a[i+1]=gg; a[i+2]=b; });
  g.putImageData(d,0,0); return c; }
/* la Hoja por filos, con leafBladeArt (02): el primero verde, «afilada» con rocío, «templada» de otoño
   con los nervios rojizos. Recta (rayo, tienda, HUD) y, para el tajo, doblada (±4 px) y de las tres caras */
const LEAF_TIER_OPT=[null,{},{dew:true},{veins:'#c8541c'}];
const LEAF_TIER=[null,LEAF_SWING,leafBladeArt(BLADE_TIERS[2].pal,LEAF_TIER_OPT[2]),leafBladeArt(BLADE_TIERS[3].pal,LEAF_TIER_OPT[3])];
const LEAF_BENT=[null,1,2,3].map(t=>t&&[0,1,2].map(face=>[-4,-3,-2,-1,0,1,2,3,4].map(bend=>leafBladeArt(BLADE_TIERS[t].pal,{...LEAF_TIER_OPT[t],pad:4,bend,face}))));
const BLADE_HUD=[null,1,2,3].map(t=>t&&leafBladeArt(BLADE_TIERS[t].pal,{len:13,half:2.2,stem:2,serr:false}));  // iconos pequeños: sin dientes ni nervios laterales
const BLADE_SHOP=[null,1,2,3].map(t=>t&&leafBladeArt(BLADE_TIERS[t].pal,{len:10,half:2.2,stem:2,serr:false}));
function bladeTier(){ return BLADE_TIERS[Math.max(1,Math.min(3,bladeLvl))]; }
function bladeSpr(){ return LEAF_TIER[Math.max(1,Math.min(3,bladeLvl))]; }
function bladeGlow(x,y){ const T=bladeTier(); if(T.glow) glowAt(x,y,9+Math.sin(tick*.4),T.glow); }
/* pinta la Hoja desde el peciolo (cx,cy) hacia `ang`; cara 0 haz · 1 envés · 2 canto; bend: la punta se dobla (+ hacia donde va el tajo) */
function drawLeafBlade(cx,cy,ang,face,bend,alpha,tint){
  const mir=Math.cos(ang)<-.2; // apuntando a la izquierda se refleja en vez de ponerse boca abajo: la luz sigue arriba
  const img=LEAF_BENT[Math.max(1,Math.min(3,bladeLvl))][face|0][clamp(Math.round((mir?-1:1)*(bend||0)),-4,4)+4], im=tint?tintCached(img,tint):img;
  ctx.save(); if(alpha!=null) ctx.globalAlpha=alpha; ctx.translate(Math.round(cx),Math.round(cy)); ctx.rotate(ang); if(mir) ctx.scale(1,-1); ctx.drawImage(im,2,-(img.height>>1)); ctx.restore(); }
/* el tajo, fotograma a fotograma (ph = 14-player.atk): [barrido, doblez de la punta, cara].
   Coge impulso hacia atrás, barre con la punta rezagada y girándose (se le ve el envés), latiguea
   al final y tiembla un poco. La caja de golpe y los tiempos no cambian (09 y 13) */
const LEAF_SWING_FR=[[-2.05,1,0],[-2.15,2,0],[-1.55,-2,0],[-.85,-4,2],[-.15,-4,1],[.38,-3,1],[.66,1,2],[.72,4,0],[.64,3,0],[.56,1,0],[.52,-1,0],[.5,-1,0],[.49,0,0],[.48,0,0]];
function leafSwingAt(ph){ return LEAF_SWING_FR[Math.max(0,Math.min(13,ph|0))]; }
function leafSwingTick(){ // en update: el filo suena al arrancar y del tajo se desprenden briznas y rocío
  const ph=14-player.atk, base=[Math.PI/2,-Math.PI/2,Math.PI,0][player.dir], T=bladeTier();
  if(ph===1&&bladeLvl>=2){ const a=audio(),t=a.currentTime; if(bladeLvl>=3) beep('triangle',f(93),0,.18,.016,t); else beep('triangle',f(88),0,.1,.011,t); } // el temple tintinea
  if(ph<3||ph>7) return;
  const a=base+leafSwingAt(ph)[0], tx=player.x+8+Math.cos(a)*18, ty=player.y+10+Math.sin(a)*18;
  if(ph===4||ph===6){ const va=a+Math.PI/2; parts.push({k:'blade',x:tx,y:ty,vx:Math.cos(va)*1.1+Math.cos(a)*.5,vy:Math.sin(va)*1.1+Math.sin(a)*.5-.35,life:22,max:22,col:ph===4?T.pal[3]:T.pal[2],rot:Math.random()*6,vr:.35}); }
  if(ph===5) parts.push({x:tx,y:ty,vx:Math.cos(a)*.3,vy:-.25,life:12,col:bladeLvl>=3?'#fff0a0':'#e8fff8',star:true,nog:true}); } // un destello de rocío
function leafHitFx(x,y){ // cuando la Hoja da en un bicho: un «chas» y savia verde que salpica
  SFX.leafHit(); const T=bladeTier();
  for(let i=0;i<6;i++){ const a=Math.random()*6.283, s=1+Math.random()*1.6; parts.push({k:'shard',x,y,vx:Math.cos(a)*s,vy:Math.sin(a)*s-.4,life:10+(i&3),max:14,col:i&1?T.pal[3]:'#eaffb0',nog:true}); }
  bladeBits(x,y,[T.pal[2],T.pal[3],T.pal[1]],3); }
/* ---------- quién es vulnerable ahora (mismas reglas que el tornadito) ---------- */
function bossVulnerable(b){ return (b.type==='topo'&&b.st==='dazed')||(b.type==='avispa'&&b.st==='pinned')||(b.type==='viento'&&b.st==='rest')||(b.type==='ciervo'&&b.mantle===0&&b.st!=='yield'); }
function midVulnerable(m){ return (m.type==='king'&&m.st==='stuck')||(m.type==='drone'&&m.st==='stunned')||(m.type==='iceguard'&&m.soft>0)||(m.type==='scare'&&m.st==='dizzy'); }
function rangedHitMid(dmg,x,y){ const m=midboss; if(!m||m.dead||presentAwaiting()) return; if(midVulnerable(m)){ m.hp-=dmg; m.flash=8; SFX.ehit(); flyText.push({x:m.x+12,y:m.y-4,txt:''+dmg,t:24,col:'#fffbe8'}); hitSpark(x,y); } else { SFX.block(); sparkle(x,y,'#c8d8ff'); } }
function rangedHitBoss(dmg,x,y){ if(!boss||boss.dying||presentAwaiting()) return; if(bossVulnerable(boss)) bossHit(boss,dmg); else { SFX.block(); for(let i=0;i<3;i++) sparkle(x+(Math.random()-.5)*8,y+(Math.random()-.5)*8,'#c8d8ff'); } }
/* ---------- RAYO DE HOJA: Hoja templada y vigor lleno ---------- */
function leafBeamTry(){
  if(bladeLvl<3||player.hp<player.maxHp||leafBeams.length) return;
  const D=DIRV[player.dir]; leafBeams.push({x:player.x+8+D[0]*8,y:player.y+10+D[1]*8,vx:D[0]*3.4,vy:D[1]*3.4,t:52,dir:player.dir,rm:gearRm()});
  const t=audio().currentTime; swish(.24,.1,1200,5200,2400,t,1.3); beep('triangle',f(93),f(100),.2,.022,t); beep('triangle',1320,1980,.1,.02,t+.03); // la hoja sale volando: aire y un tintineo
}
function beamBurst(b){ for(let i=0;i<8;i++){ const a=i/8*6.283; parts.push({k:'shard',x:b.x,y:b.y,vx:Math.cos(a)*1.6,vy:Math.sin(a)*1.6,life:10,max:12,col:i&1?'#fff6c0':'#f0c040',nog:true}); } }
function updLeafBeams(){
  for(const b of leafBeams){ b.x+=b.vx; b.y+=b.vy; b.t--;
    if((tick&1)===0) parts.push({k:'shard',x:b.x-b.vx*1.5,y:b.y-b.vy*1.5,vx:-b.vx*.1,vy:-b.vy*.1,life:8,max:8,col:(tick&2)?'#fff0a0':'#f0c040',nog:true});
    const ch=tileAt(b.x|0,b.y|0);
    if(ch===undefined||b.x<-4||b.x>164||b.y<-4||b.y>132||(isSolid(ch)&&!WATER.has(ch))){ if(ch!==undefined) cutAt([b.x-6,b.y-6,12,12]); beamBurst(b); b.t=0; continue; }
    for(const e of enemies){ if(e.flash>0||Math.hypot(e.x+8-b.x,e.y+8-b.y)>=10) continue;
      if(e.type==='golem'||(e.type==='ghost'&&e.phase>=110)){ SFX.block(); sparkle(b.x,b.y,'#c8d8ff'); } else damageEnemy(e,bladeLvl,b.x-b.vx*4,b.y-b.vy*4);
      beamBurst(b); b.t=0; break; }
    if(b.t>0&&midboss&&Math.hypot(midboss.x+12-b.x,midboss.y+12-b.y)<14){ rangedHitMid(bladeLvl,b.x,b.y); beamBurst(b); b.t=0; }
    if(b.t>0&&boss&&Math.hypot(boss.x+16-b.x,boss.y+16-b.y)<18){ rangedHitBoss(bladeLvl,b.x,b.y); beamBurst(b); b.t=0; }
  }
  leafBeams=leafBeams.filter(b=>b.t>0);
}
/* ---------- REMOLINO y GRAN REMOLINO ---------- */
function spinNeed(){ const s=hasAmulet('susurro'); return hasBigSpin?(s?8:22):(s?12:36); }
function spinMax(){ return hasBigSpin?32:18; }
function spinChargeTick(){ const need=spinNeed(), c=player.charge;
  if(c<need&&(c%5)===0) beep('square',240+(c/need)*760,0,.03,.016);
  if(c===need){ const cx=player.x+8, cy=player.y+10; parts.push({x:cx,y:cy,vx:0,vy:0,life:12,col:hasBigSpin?'#ffe070':'#dfffc0',ring:true,r:16,nog:true});
    for(let i=0;i<8;i++) sparkle(cx+(Math.random()-.5)*20,cy+(Math.random()-.5)*16,hasBigSpin?'#ffe070':'#e0ffa0'); }
}
function spinFx(){ const cx=player.x+8, cy=player.y+13, col=groundDustCol();
  for(let i=0;i<14;i++){ const a=i/14*6.283; parts.push({k:'dust',x:cx+Math.cos(a)*6,y:cy+Math.sin(a)*3,vx:Math.cos(a)*1.4,vy:Math.sin(a)*.6,life:16,max:16,r:1+(i&1),col,nog:true}); }
  parts.push({x:cx,y:cy-3,vx:0,vy:0,life:12,col:hasBigSpin?'#ffe890':'#dfffc0',ring:true,r:hasBigSpin?34:24,nog:true});
  if(hasBigSpin){ parts.push({x:cx,y:cy-3,vx:0,vy:0,life:12,col:'#ffffff',ring:true,r:46,nog:true}); screenFlash(3,'#fff6c0'); beep('sawtooth',180,520,.25,.04); }
}
function drawSpinCharge(py){
  if(player.spin>0){ drawSpinPass(py,false); return; } // durante el giro: la mitad de atrás de la estela, antes que Sprout
  if(!hasSpin||!hasBlade||player.charge<6) return;
  const need=spinNeed(), k=Math.min(1,player.charge/need), cx=player.x+8, cy=py+10, N=16, r=hasBigSpin?15:13, lit=Math.round(k*N), full=k>=1;
  const hi=hasBigSpin?'#fff0a0':'#d8ffa8', lo=hasBigSpin?'#e8b030':'#58c030';
  if(full){ ctx.save(); ctx.globalAlpha=.16+.1*Math.sin(tick*.5); ctx.fillStyle=hasBigSpin?'#ffe070':'#a8ec78'; ctx.beginPath(); ctx.ellipse(cx,cy,r,r*.8,0,0,6.283); ctx.fill(); ctx.restore(); }
  for(let i=0;i<N;i++){ const a=-Math.PI/2+i/N*6.283, x=Math.round(cx+Math.cos(a)*r)-1, y=Math.round(cy+Math.sin(a)*r*.8)-1; // cuentas de un collar que se llena
    if(i<lit){ ctx.fillStyle=PAL.k; ctx.fillRect(x-1,y,4,2); ctx.fillRect(x,y-1,2,4);
      const chase=full&&((i+(tick>>1))&3)===0, lead=!full&&i===lit-1;
      ctx.fillStyle=full?(chase?hi:'#ffffff'):lead?'#ffffff':hi; ctx.fillRect(x,y,2,2); ctx.fillStyle=full?(chase?lo:hi):lo; ctx.fillRect(x+1,y+1,1,1); }
    else { ctx.fillStyle='rgba(10,30,14,.45)'; ctx.fillRect(x,y,2,2); } }
}
function drawSpinBlade(py){ drawSpinPass(py,true); } // y la mitad de delante, después
function spinAngle(){ const M=spinMax(), turns=hasBigSpin?2:1, base=[Math.PI/2,-Math.PI/2,Math.PI,0][player.dir]; return (1-player.spin/M)*6.283*turns+base; }
function spinFacing(){ const a=((spinAngle()%6.283)+6.283)%6.283; return a<.785||a>=5.498?3:a<2.356?0:a<3.927?2:1; } // Sprout mira hacia su Hoja
/* la estela del giro: una media luna que da la vuelta entera detrás de la Hoja, con el filo de la
   Hoja de su temple, el borde oscuro, la cabeza blanca y la cola deshecha en tramado */
const SPIN_CV=mkCanvas(60,52), SPIN_G=SPIN_CV.getContext('2d'); let spinCvTick=-1;
function renderSpinSmear(){ if(spinCvTick===tick) return; spinCvTick=tick;
  const W=60, H=52, cx=30, cy=26, big=hasBigSpin, a=spinAngle(), prog=1-player.spin/spinMax(), rIn=big?12:10, rOut=big?22:19;
  const trail=Math.min(big?3:2.6,prog*6.283*(big?2:1)+.35), fade=player.spin<6?player.spin/6:1, rgb=bladeTier().smear.map(hex2rgb), wh=[255,255,255];
  const im=SPIN_G.createImageData(W,H), d=im.data;
  for(let y=0;y<H;y++) for(let x=0;x<W;x++){ const dx=x+.5-cx, dy=y+.5-cy, dist=Math.hypot(dx,dy); if(dist<rIn||dist>rOut) continue;
    const back=(((a-Math.atan2(dy,dx))%6.283)+6.283)%6.283; if(back>trail) continue;   // cuánto va por detrás de la Hoja
    const along=1-back/trail;                                                             // 1 = la Hoja, 0 = la cola
    if(along<.34&&((x+y)&1)) continue; if(along<.14&&(((x>>1)+(y>>1))&1)) continue; if(fade<1&&((x*7+y*3)%10)/10>fade) continue;
    const edge=dist>rOut-1.3, inner=dist>rOut-4.6&&!edge, col=back<.22?wh:edge?rgb[0]:inner?(along>.4?rgb[3]:rgb[2]):(along>.6?rgb[2]:rgb[1]);
    const i=(y*W+x)*4; d[i]=col[0]; d[i+1]=col[1]; d[i+2]=col[2]; d[i+3]=dist<rIn+2.5?120:235; }
  SPIN_G.putImageData(im,0,0); }
function drawSpinPass(py,front){
  renderSpinSmear(); const cx=Math.round(player.x+8), cy=Math.round(py+10), a=spinAngle(), h=26;
  if(front) ctx.drawImage(SPIN_CV,0,h,60,52-h,cx-30,cy-26+h,60,52-h); else ctx.drawImage(SPIN_CV,0,0,60,h,cx-30,cy-26,60,h);
  if((Math.sin(a)>=0)!==front) return;                                                  // la Hoja, en su mitad
  drawLeafBlade(cx,cy,a,[0,2,1,2][(tick>>1)&3],-3); // la Hoja gira con la punta rezagada, dándose la vuelta
  bladeGlow(cx+Math.cos(a)*14,cy+Math.sin(a)*14); }
/* ---------- el TORNADITO que sale del giro: un remolino de viento de verdad ---------- */
const TORNADO={s:[],b:[]};
for(let f=0;f<8;f++){ const ph=f/8*6.283;
  TORNADO.s.push(tornadoArt(20,22,7.6,1.6,ph,['#1d4f3a','#5aa87a','#a8e0bc','#dcf6e6','#ffffff'],1.4));
  TORNADO.b.push(tornadoArt(30,32,11.6,2.2,ph,['#4a3a10','#c8a040','#f0dc90','#fff6d8','#ffffff'],2)); }
function tornadoFoot(w){ const age=w.age||0, wob=Math.sin(age*.22)*1.5; // dónde toca el suelo (se bambolea de lado a lado)
  return [Math.round(w.x+(w.vx?0:wob)),Math.round(w.y+(w.big?9:7)+(w.vx?wob*.6:0))]; }
function drawTornado(w){
  const F=w.big?TORNADO.b:TORNADO.s, age=w.age||0, img=F[(age>>1)&7], W=img.width, H=img.height;
  const grow=Math.min(1,age/7), k=Math.min(grow<1?easeOutBack(grow):1,Math.min(1,w.t/9)); if(k<=.05) return;
  const [bx,by]=tornadoFoot(w), dw=Math.max(3,Math.round(W*(.55+.45*k))), dh=Math.max(2,Math.round(H*k)), top=by-dh+1;
  drawShadow(bx,by,w.big?8:6);
  const n=w.big?5:3, tH=w.big?11.6:7.6, bH=w.big?2.2:1.6, leaf=(front)=>{ // hojas y rayas de aire que giran alrededor, delante o detrás del embudo
    for(let i=0;i<n+2;i++){ const air=i>=n, al=age*(air?.45:.33)+i*6.283/n+(air?1:0), hf=air?(i===n?.3:.66):.16+.62*((i*.37+.1)%1), r=(bH+(tH-bH)*Math.pow(hf,1.45))*(.55+.45*k)+(air?1.5:2.5);
      if((Math.sin(al)>0)!==front) continue; const x=Math.round(bx+Math.cos(al)*r), y=Math.round(by-dh*hf+Math.sin(al)*1.5);
      if(air){ ctx.fillStyle=front?'#ffffff':'#cfe8dc'; const sgn=Math.cos(al)>0?-1:1; ctx.fillRect(x-1,y,3,1); ctx.fillRect(x+sgn*2,y-1,1,1); continue; } // una raya de aire curvada
      const L=w.big?(i&1?['#c89030','#ffe070','#fffbe0']:['#4a8a2a','#b8f070','#eaffc8']):['#2e8038',front?'#78d838':'#4aa040','#c8f890'], f=((age>>2)+i)&1;
      ctx.fillStyle=L[0]; ctx.fillRect(x+(f?2:-1),y+1,1,1); ctx.fillStyle=L[1]; ctx.fillRect(x,y,2,1); ctx.fillRect(x+(f?1:0),y+1,1,1); if(front){ ctx.fillStyle=L[2]; ctx.fillRect(x+(f?1:0),y,1,1); } } }; // una hojita de 3 px que da vueltas
  leaf(false);
  ctx.drawImage(img,0,0,W,H,bx-(dw>>1),top,dw,dh);
  ctx.fillStyle=w.big?'#fff6d8':'#e8f8ee'; for(let j=0;j<3;j++){ const b=age*.4+j*2.1, x=Math.round(bx+Math.cos(b)*(w.big?8:6)); ctx.globalAlpha=.75; ctx.fillRect(x-1,by+Math.round(Math.sin(b)),3,1); } ctx.globalAlpha=1; // remolino de polvo al pie
  leaf(true);
  if(w.big&&(age&7)<2){ ctx.fillStyle='#ffffff'; const s=(age>>3)%4; ctx.fillRect(bx-6+s*4,top+4+s*3,1,1); } }
function tornadoTrail(w){ // polvo del suelo al pie y alguna hoja que sale despedida
  const [bx,by]=tornadoFoot(w), age=w.age||0;
  if((age&1)===0) parts.push({k:'dust',x:bx+(Math.random()-.5)*8,y:by,vx:-w.vx*.25+(Math.random()-.5)*.5,vy:-.15,life:12,max:12,r:1+(age&2?1:0),col:groundDustCol(),nog:true});
  if((age%9)===4) bladeBits(bx,by-(w.big?18:12),w.big?['#ffe070','#b8f070']:['#78d838','#b8f070'],1); }
function tornadoPoof(w){ // se deshace: polvo, hojas y un aro de aire
  const [bx,by]=tornadoFoot(w), cy=by-(w.big?14:10);
  for(let i=0;i<8;i++){ const a=i/8*6.283; parts.push({k:'smoke',x:bx+Math.cos(a)*4,y:cy+Math.sin(a)*5,vx:Math.cos(a)*.7,vy:Math.sin(a)*.5-.3,life:18,max:24,r:2+(i%2),col:i&1?'#f4fff8':'#d8f0e0',nog:true}); }
  bladeBits(bx,cy,w.big?['#ffe070','#b8f070','#78d838']:['#78d838','#b8f070'],w.big?7:5);
  parts.push({x:bx,y:cy,vx:0,vy:0,life:10,col:'#ffffff',ring:true,r:w.big?16:11,nog:true}); }
/* ---------- ESCUDO: a la vista, y con el de Roble, parada ---------- */
const SHIELD_MINI=(()=>{ const mk=(rows,rim)=>sprN(rows,{b:'#8a5a2c',B:'#b88048',L:'#8ae048',l:'#2e8a34',y:rim});
  const r1=["kkkkkk","kbBBbk","kbLlbk","kblLbk","kbBBbk","kbbbbk",".kbbk.","..kk.."], r2=["yyyyyy","ybBBby","ybLlby","yblLby","ybBBby","ybbbby",".ybby.","..yy.."];
  const s1=mk(r1,'#1a1410'), s2=(()=>{ const c=mkCanvas(8,10), g=c.getContext('2d'); g.fillStyle=PAL.k; g.fillRect(0,1,8,8); g.fillRect(1,0,6,10); g.drawImage(mk(r2,'#e8b848'),1,1); return c; })();
  // destello al parar: la cara se enciende pero el contorno sigue ahí
  const fl=(rows,rim)=>sprN(rows,{b:'#fff0c8',B:'#ffffff',L:'#ffffff',l:'#e0ffc0',y:rim});
  const f1=fl(r1,'#1a1410'), f2=(()=>{ const c=mkCanvas(8,10), g=c.getContext('2d'); g.fillStyle=PAL.k; g.fillRect(0,1,8,8); g.fillRect(1,0,6,10); g.drawImage(fl(r2,'#ffffff'),1,1); return c; })();
  return [null,s1,s2,f1,f2]; })();
function drawShieldOn(px,py){
  if(!hasShield||player.atk>0||player.spin>0||state==='itemget') return;
  const lv=shieldLvl>=2?2:1, img=SHIELD_MINI[shieldFlashT>0&&(tick&2)?lv+2:lv], o=[[10,8],[1,8],[-1,7],[11,7]][player.dir], x=(px+o[0])|0, y=(py+o[1])|0;
  ctx.drawImage(img,x,y);
  if(shieldLvl>=2&&((tick>>4)%9)===0) { ctx.fillStyle='#fff6c0'; ctx.fillRect(x+1,y+1,1,1); }
}
function shieldBlock(p){
  if(shieldLvl>=2&&tick-lastTurnT<16){ reflectProj(p); return; }
  p.t=0; SFX.block(); shieldFlashT=8; hitSpark(p.x,p.y,'#c8d8ff'); const D=DIRV[player.dir]; player.kx-=D[0]*1.2; player.ky-=D[1]*1.2;
}
function reflectProj(p){
  p.reflected=true; p.vx=-p.vx*1.5; p.vy=-p.vy*1.5; p.t=80; shieldFlashT=10;
  SFX.block(); beep('square',1320,1980,.08,.05); hitSpark(p.x,p.y,'#fff6c0'); hitStop=Math.max(hitStop,3);
  flyText.push({x:p.x,y:p.y-4,txt:'¡PARADA!',t:26,col:'#ffe070'});
}
function updReflected(){
  for(const p of projs){ if(!p.reflected||p.t<=0) continue;
    if((tick&1)===0) parts.push({x:p.x,y:p.y,vx:0,vy:0,life:6,col:'#fff6c0',nog:true});
    for(const e of enemies){ if(Math.hypot(e.x+8-p.x,e.y+8-p.y)<9){ damageEnemy(e,2,p.x-p.vx*3,p.y-p.vy*3); p.t=0; break; } }
    if(p.t>0&&midboss&&Math.hypot(midboss.x+12-p.x,midboss.y+12-p.y)<13){ rangedHitMid(2,p.x,p.y); p.t=0; }
    if(p.t>0&&boss&&Math.hypot(boss.x+16-p.x,boss.y+16-p.y)<16){ rangedHitBoss(2,p.x,p.y); p.t=0; } }
}
/* ---------- BELLOTAS-BOMBA: mecha, estallido y quemadura ---------- */
function drawBomb(b){
  const k=b.t, near=k<30, blink=near&&((tick>>(k<14?1:2))&1), sw=near?1+(30-k)/30*.2:1;
  drawShadow(b.x+8,b.y+13,4);
  const img=blink?tintCached(ACORN,'#ff6048'):ACORN;
  ctx.save(); ctx.translate(b.x+8,b.y+12); ctx.scale(sw,2-sw); ctx.drawImage(img,-4,-8); ctx.restore();
  const fx=b.x+8+((tick>>1)&1), fy=b.y+3-((tick>>2)&1); ctx.fillStyle=(tick&2)?'#ffffff':'#ffd040'; ctx.fillRect(fx,fy,1,1);
  if(tick&4){ ctx.fillStyle='#ff8030'; ctx.fillRect(fx-1,fy+1,1,1); } if(near&&(tick&1)){ ctx.fillStyle='#fff0a0'; ctx.fillRect(fx+1,fy-1,1,1); }
}
function bombFx(x,y,big){
  const n=big?18:12;
  for(let i=0;i<n;i++){ const a=Math.random()*6.283, s=1.4+Math.random()*2.4; parts.push({x,y,vx:Math.cos(a)*s,vy:Math.sin(a)*s-1.3,life:18+Math.random()*12,col:['#5a4430','#8a7460','#3a2a1a','#c8a878'][i%4]}); }
  const m=big?12:8; // bola de fuego irregular: centro claro, borde naranja
  for(let i=0;i<m;i++){ const a=i/m*6.283+Math.random()*.6, s=.35+Math.random()*.7, d=2+Math.random()*5;
    parts.push({k:'smoke',x:x+Math.cos(a)*d,y:y+Math.sin(a)*d*.7,vx:Math.cos(a)*s,vy:Math.sin(a)*s*.6-.4,life:18+((Math.random()*12)|0),max:30,r:2+((Math.random()*3)|0),col:['#fff0a0','#f8c048','#e86030','#f8c048'][i&3],nog:true}); }
  for(let i=0;i<(big?5:3);i++) parts.push({k:'smoke',x:x+(Math.random()-.5)*10,y:y+(Math.random()-.5)*6,vx:(Math.random()-.5)*.3,vy:-.3-Math.random()*.3,life:34+((Math.random()*10)|0),max:44,r:2+(i&1),col:i&1?'#b8b0b8':'#9890a0',nog:true}); // humo que queda
  parts.push({x,y,vx:0,vy:0,life:12,col:'#fff6c0',ring:true,r:big?30:20,nog:true});
  if(big){ parts.push({x,y,vx:0,vy:0,life:12,col:'#ffb040',ring:true,r:42,nog:true}); for(let i=0;i<6;i++) sparkle(x+(Math.random()-.5)*30,y+(Math.random()-.5)*24,'#ffe070'); }
  scorches.push({x:x|0,y:(y+4)|0,r:big?13:9,t:420,seed:(Math.random()*1000)|0,rm:gearRm()});
  screenFlash(big?5:3,'#fff0c0');
}
const SCORCH_CACHE={};
function scorchSpr(r,seed){ const key=r+'_'+(seed%4); let c=SCORCH_CACHE[key]; if(c) return c; const h=Math.round(r*.55);
  c=mkCanvas(r*2+1,h*2+1); const g=c.getContext('2d'), rnd=seeded(seed%4+7);
  for(let y=-h;y<=h;y++){ const w=Math.round(r*Math.sqrt(Math.max(0,1-(y*y)/((h+.5)*(h+.5))))*(0.85+rnd()*.2)); g.fillStyle=Math.abs(y)<h*.5?'#1a1008':'#2e2012'; g.fillRect(r-w,h+y,w*2+1,1); }
  for(let i=0;i<5;i++){ g.fillStyle=i&1?'#e86030':'#5a3a1a'; g.fillRect(r+Math.round((rnd()-.5)*r*1.2),h+Math.round((rnd()-.5)*h),1,1); }
  return SCORCH_CACHE[key]=c; }
function drawScorches(){ for(const s of scorches){ const img=scorchSpr(s.r,s.seed); ctx.globalAlpha=Math.min(1,s.t/120)*.5; ctx.drawImage(img,s.x-s.r,s.y-(img.height>>1)); } ctx.globalAlpha=1; }
/* ---------- RAÍZ-GANCHO: también agarra ---------- */
const GRAB_OK=new Set(['blob','bat','bee','beetle','crab','frog','ghost','squirrel','snail','wisp','rodahoja']);
function hookGrab(D){
  const x0=player.x+8, y0=player.y+10;
  for(let s=10;s<=80;s+=3){ const px=x0+D[0]*s, py=y0+D[1]*s, ch=tileAt(px|0,py|0);
    if(ch===undefined||ch==='k'||(isSolid(ch)&&!WATER.has(ch))) return false;
    for(const e of enemies){ if(!GRAB_OK.has(e.type)||(e.type==='ghost'&&e.phase>=110)) continue;
      if(Math.hypot(e.x+8-px,e.y+8-py)<9){ const tx=x0+D[0]*16-8, ty=y0+D[1]*16-8; e.stun=Math.max(e.stun,100); e.pull={vx:(tx-e.x)/12,vy:(ty-e.y)/12,t:12};
        grabRope={t:14,tgt:e,rm:gearRm()}; SFX.sword(); SFX.stun(); noise(.08,.04,true); hitSpark(e.x+8,e.y+8,'#b8f070'); return true; } }
    for(const p of pickups){ if(!['berry','heart','bombs'].includes(p.kind)) continue;
      if(Math.hypot(p.x+4-px,p.y+4-py)<8){ p.pull={vx:(x0-4-p.x)/10,vy:(y0-4-p.y)/10,t:10}; p.drop=0; grabRope={t:12,tgt:p,rm:gearRm()}; SFX.sword(); return true; } } }
  return false;
}
/* ---------- VAINA: cargada, atraviesa ---------- */
function boomerCatch(b){ puff(player.x+8,player.y+10,b.pow?'#ffe070':'#d09040',6,1); SFX.blip(); player.squash=-.18; }
function drawBoomer(){ if(!boomer) return; const b=boomer;
  if(b.pow){ glowAt(b.x,b.y,12,'rgba(255,224,112,.42)'); if(!b.ret){ ctx.save(); ctx.globalAlpha=.22; ctx.translate((b.x-b.vx*4)|0,(b.y-b.vy*4)|0); ctx.rotate(b.ang-1.2); ctx.drawImage(tintCached(BOOMER_SPR,'#ffe070'),-8,-8); ctx.restore(); } }
  ctx.save(); ctx.translate(b.x|0,b.y|0); ctx.rotate(b.ang); ctx.drawImage(BOOMER_SPR,-8,-8); ctx.restore(); }
function updBoomerCharge(){
  if(boomerCharge<=0) return;
  if(keys.altHeld&&xItem==='boomer'&&!boomer){ boomerCharge=Math.min(60,boomerCharge+1);
    if(boomerCharge===30){ SFX.charge(); for(let i=0;i<6;i++) sparkle(player.x+8+(Math.random()-.5)*16,player.y+6+(Math.random()-.5)*12,'#ffe070'); }
    else if(boomerCharge<30&&(boomerCharge%5)===0) beep('square',320+boomerCharge*22,0,.025,.015); }
  else { const pow=boomerCharge>=30; boomerCharge=0; if(!boomer&&state==='play') throwBoomer(pow); }
}
/* ---------- FAROL: llamarada que quema y se propaga ---------- */
const FLAME_CACHE={};
function flameSpr(H,f){ // llama de píxeles: lágrima con alma blanca que se mece (4 fotogramas por tamaño)
  f&=3; const key=H+'_'+f; let c=FLAME_CACHE[key]; if(c) return c;
  const W=Math.ceil(H*.75)+3, A=[0,1.3,.4,-1.2][f], Hf=Math.round(H*[1,1.08,.92,1.04][f]), mid=W/2, COL=['#b02c10','#f06020','#f8a030','#f8e060','#fffbe0'];
  c=mkCanvas(W,H+2); const g=c.getContext('2d');
  for(let k=0;k<Hf;k++){ const t=k/Hf, xc=mid+A*Math.pow(t,1.5)*(H/10), hw=(t<.3?.55+t*1.5:(1-t)/.7)*H*.36;
    for(let x=0;x<W;x++){ const d=Math.abs(x+.5-xc)/Math.max(.5,hw); if(d>1) continue;
      const heat=(1-d)*(1-t*.7)-(k===0?.15:0); g.fillStyle=COL[heat<.18?0:heat<.38?1:heat<.55?2:heat<.72?3:4]; g.fillRect(x,H+1-k,1,1); } }
  return FLAME_CACHE[key]=c; }
function emberAt(x,y){ parts.push({x,y,vx:(Math.random()-.5)*.35,vy:-.45-Math.random()*.45,life:12+((Math.random()*8)|0),col:Math.random()<.5?'#f8a030':'#f8e060',nog:true}); }
function lanternFlame(){
  const D=DIRV[player.dir], fx=player.x+8+D[0]*14, fy=player.y+11+D[1]*14;
  SFX.torch(); beep('sawtooth',160,80,.18,.035);
  flares.push({x:fx,y:fy,t:18,d:player.dir,rm:gearRm()});
  for(let i=0;i<8;i++) emberAt(fx+(Math.random()-.5)*10,fy+(Math.random()-.5)*6);
  const tx=fx>>4, ty=fy>>4, ch=grid[ty]&&grid[ty][tx];
  if(ch==='b'||ch==='t'||ch==='zd'||ch==='Q') igniteTile(tx,ty);
  for(const e of enemies){ if(Math.hypot(e.x+8-fx,e.y+8-fy)<13){ if(e.type==='wisp'){ sparkle(e.x+8,e.y+4,'#f8a030'); continue; }
    damageEnemy(e,e.type==='golem'?2:1,player.x+8,player.y+10); } }
}
const BURN_T=40;
function igniteTile(x,y){ if(burnFires.some(f=>f.x===x&&f.y===y)) return; burnFires.push({x,y,t:BURN_T,ph:(Math.random()*4)|0,rm:gearRm()}); }
function updBurn(){
  for(const f of flares){ f.t--; if((tick&1)===0) emberAt(f.x+(Math.random()-.5)*8,f.y-2); }
  flares=flares.filter(f=>f.t>0);
  for(const f of burnFires){ f.t--;
    if((tick&3)===0) emberAt(f.x*16+3+Math.random()*10,f.y*16+4+Math.random()*4);
    const ch=grid[f.y][f.x];
    if(f.t===BURN_T>>1&&ch==='t') for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){ const r=grid[f.y+dy]; if(r&&r[f.x+dx]==='t') igniteTile(f.x+dx,f.y+dy); } // la hierba alta prende la de al lado
    if(player.inv===0&&jumpT===0&&Math.hypot(player.x+8-(f.x*16+8),player.y+12-(f.y*16+8))<9) hurt(1,f.x*16+8,f.y*16+8);
    if(f.t<=0){
      if(ch==='zd'){ grid[f.y][f.x]=regionFloor(); markDirty(); }
      else if(ch==='b'||ch==='t'||ch==='Q') cutAt([f.x*16,f.y*16,16,16]);
      for(let i=0;i<3;i++) parts.push({k:'smoke',x:f.x*16+4+Math.random()*8,y:f.y*16+4+Math.random()*4,vx:(Math.random()-.5)*.3,vy:-.5-Math.random()*.3,life:18,max:22,r:1+(i&1),col:i&1?'#f4f0e8':'#d8d0d8',nog:true}); // humo que se va
      scorches.push({x:f.x*16+8,y:f.y*16+9,r:7,t:300,seed:(Math.random()*1000)|0,rm:gearRm()}); } }
  burnFires=burnFires.filter(f=>f.t>0);
}
function drawFlames(){
  for(const f of burnFires){ const x=f.x*16, y=f.y*16, fr=(tick>>2)+f.ph, k=f.t>BURN_T-6?(BURN_T-f.t+1)/6:f.t<10?f.t/10:1; // prende, arde y se apaga
    glowAt(x+8,y+8,16,'rgba(248,140,40,.3)');
    const s0=flameSpr(Math.max(3,Math.round(12*k)),fr), s1=flameSpr(Math.max(2,Math.round(8*k)),fr+1), s2=flameSpr(Math.max(2,Math.round(7*k)),fr+3);
    ctx.drawImage(s1,x,y+15-s1.height); ctx.drawImage(s2,x+16-s2.width,y+14-s2.height); ctx.drawImage(s0,x+8-(s0.width>>1),y+16-s0.height); }
  for(const f of flares){ const p=1-f.t/18, H=Math.max(3,Math.round(3+10*Math.sin(p*Math.PI))), fr=tick>>1, D=DIRV[f.d];
    glowAt(f.x,f.y-3,18,'rgba(255,170,60,.38)');
    const s=flameSpr(H,fr), a=flameSpr(Math.max(2,H-4),fr+2);
    ctx.drawImage(a,(f.x-D[1]*6-(a.width>>1))|0,(f.y+3-a.height+D[0]*2)|0); ctx.drawImage(a,(f.x+D[1]*6-(a.width>>1))|0,(f.y+3-a.height-D[0]*2)|0);
    ctx.drawImage(s,(f.x-(s.width>>1))|0,(f.y+4-s.height)|0); }
}
function lightRadius(deep){ const base=hasLantern?(xItem==='lantern'?100:92):(deep?30:58); return base+Math.sin(tick*.2)*2+((tick>>2)%3===0?1:0)+(hasLantern&&((tick*37)%23)===0?-3:0); }
/* ---------- VILANO: planeo ---------- */
function glideStart(){ glideT=36; glideUsed=true; beep('triangle',660,990,.2,.03); puff(player.x+8,player.y+2,'#ffffff',6,.6); }
function glideStep(){
  glideT=keys.altHeld?glideT-1:0; let dx=(keys.right?1:0)-(keys.left?1:0), dy=(keys.down?1:0)-(keys.up?1:0); // sueltas X y vuelves a caer
  if(dx||dy){ const d=Math.hypot(dx,dy); jumpDir=[jumpDir[0]*.85+dx/d*.15,jumpDir[1]*.85+dy/d*.15]; const n=Math.hypot(jumpDir[0],jumpDir[1])||1; jumpDir=[jumpDir[0]/n,jumpDir[1]/n]; }
  tryMove(jumpDir[0]*1.5,jumpDir[1]*1.5); jumpZ=13+Math.sin(tick*.25)*1.5;
  if((tick&3)===0) parts.push({k:'mote',x:player.x+8+(Math.random()-.5)*10,y:player.y-jumpZ-8,vx:(Math.random()-.5)*.2,vy:.25,life:40,max:40,sway:Math.random()*6,col:'#ffffff',nog:true});
}
/* ---------- amuletos que se ven ---------- */
function amuletFx(id){
  if(id==='musgo'){ sparkle(player.x+8,player.y-2,'#a8e878'); flyText.push({x:player.x+8,y:player.y-4,txt:'+♥',t:26,col:'#b8f070'});
    for(let i=0;i<6;i++) parts.push({k:'leafF',x:player.x+2+Math.random()*12,y:player.y+14,vx:(Math.random()-.5)*.3,vy:-.5-Math.random()*.4,life:40,max:40,sway:Math.random()*6,col:i&1?'#78d838':'#b0f068',nog:true}); }
  else if(id==='raiz'){ for(let i=0;i<10;i++){ const a=i/10*6.283; parts.push({x:player.x+8+Math.cos(a)*9,y:player.y+9+Math.sin(a)*9,vx:Math.cos(a)*.6,vy:Math.sin(a)*.6,life:12,col:i&1?'#a86a38':'#e8b050',nog:true}); } }
}
/* ---------- cada fotograma ---------- */
function updGear(){
  const room=gearRm(); if(room!==gearRoom){ gearRoom=room; const keep=o=>o.rm===room; // lo de la sala anterior se queda allí
    leafBeams=leafBeams.filter(keep); burnFires=burnFires.filter(keep); scorches=scorches.filter(keep); flares=flares.filter(keep); if(grabRope&&!keep(grabRope)) grabRope=null; }
  if(jumpT===0) glideT=0;
  if(player.dir!==lastDirG){ lastDirG=player.dir; lastTurnT=tick; }
  if(shieldFlashT>0) shieldFlashT--;
  updLeafBeams(); updReflected(); updBoomerCharge(); updBurn();
  if(grabRope&&--grabRope.t<=0) grabRope=null;
  for(const e of enemies) if(e.pull){ moveBlocked(e,e.x+e.pull.vx,e.y+e.pull.vy); if(--e.pull.t<=0) e.pull=null; }
  for(const p of pickups) if(p.pull){ p.x+=p.pull.vx; p.y+=p.pull.vy; if(--p.pull.t<=0) p.pull=null; }
  for(const s of scorches) s.t--; scorches=scorches.filter(s=>s.t>0);
  if(jumpT>0&&glideT===0) player.squash=jumpT>18?.16:jumpT<6?-.1:player.squash;
  if(hasAmulet('savia')&&(tick&3)===0) for(const p of pickups){ if((p.kind==='berry'||p.kind==='heart')&&Math.hypot(player.x+8-p.x-4,player.y+10-p.y-4)<48) parts.push({x:p.x+4,y:p.y+4,vx:0,vy:0,life:8,col:p.kind==='berry'?'#ff7aa8':'#ff9090',nog:true}); }
  if(hasAmulet('viento')&&(Math.abs(player.ivx)>.5||Math.abs(player.ivy)>.5)&&(tick&7)===0) parts.push({x:player.x+8-player.ivx*5,y:player.y+5+Math.random()*9,vx:-player.ivx*.7,vy:-player.ivy*.7,life:10,col:'#dff0ff',nog:true});
}
/* ---------- lo que se pinta encima de los actores ---------- */
function drawGearFx(){
  for(const b of leafBeams){ const ang=[Math.PI/2,-Math.PI/2,Math.PI,0][b.dir], fl=Math.sin(tick*.55+b.t)*.28; glowAt(b.x,b.y,11,'rgba(255,230,140,.4)');
    drawLeafBlade(b.x-Math.cos(ang)*11,b.y-Math.sin(ang)*11,ang+fl,[0,2,1,2][(tick>>2)&3],Math.round(Math.sin(tick*.4)*2)); } // el rayo: una hoja que vuela revoloteando
  if(grabRope&&grabRope.tgt){ const t=grabRope.tgt, x0=player.x+8, y0=player.y+10, x1=t.x+(t.type?8:4), y1=t.y+(t.type?8:4), n=Math.max(2,(Math.hypot(x1-x0,y1-y0)/4)|0);
    for(let i=0;i<=n;i++){ ctx.fillStyle=i%2?PAL.l:PAL.d; ctx.fillRect((x0+(x1-x0)*i/n-1)|0,(y0+(y1-y0)*i/n-1)|0,2,2); }
    ctx.drawImage(HOOK_SPR,0,2,8,6,(x1-4)|0,(y1-3)|0,8,6); }
  if(boomerCharge>0){ const k=Math.min(1,boomerCharge/30), hx=player.x+8+[3,-3,-4,4][player.dir], hy=player.y-5-jumpZ; // la Vaina gira sobre la cabeza, cada vez más rápido
    if(k>=1){ glowAt(hx,hy,11+Math.sin(tick*.4)*2,'rgba(255,224,112,.5)'); if((tick&7)===0) sparkle(hx+(Math.random()-.5)*14,hy+(Math.random()-.5)*10,'#ffe070'); }
    ctx.save(); ctx.translate(hx|0,hy|0); ctx.rotate(boomerCharge*(.12+k*.3)); ctx.drawImage(k>=1&&(tick&4)?tintCached(BOOMER_SPR,'#fff0a0'):BOOMER_SPR,-8,-8); ctx.restore(); }
  if(glideT>0&&jumpT>0){ const py=player.y-jumpZ; ctx.save(); ctx.translate(player.x+8,py-2); ctx.rotate(Math.sin(tick*.15)*.15); ctx.drawImage(FEATHER_SPR,-8,-16); ctx.restore(); }
  drawFlames();
}
/* ---------- HUD: el filo de la Hoja y la carga del remolino ---------- */
function hudBladeMeter(Y){
  if(hasSpin&&player.charge>0&&player.spin===0){ const k=Math.min(1,player.charge/spinNeed()), full=k>=1;
    ctx.fillStyle=HUD.wellD; ctx.fillRect(12,Y+12,13,2); ctx.fillStyle=full?(((tick>>2)&1)?'#ffffff':(hasBigSpin?'#e8c040':'#3a9a2a')):(hasBigSpin?'#c89020':'#3a9a2a'); ctx.fillRect(12,Y+12,Math.round(13*k),2); return; }
  const T=bladeTier(); for(let i=0;i<3;i++){ ctx.fillStyle=i<bladeLvl?T.notch:HUD.wellD; ctx.fillRect(13+i*4,Y+12,3,1); }
  if(hasBigSpin){ ctx.fillStyle='#e8c040'; ctx.fillRect(25,Y+4,1,1); }
}
/* ---------- iconos de las mejoras nuevas ---------- */
const BIGSPIN_ICON=(()=>{ const c=mkCanvas(16,16), g=c.getContext('2d'); // el Gran Remolino: el tornado dorado, más ancho, con chispas
  g.drawImage(tornadoArt(16,16,7.4,1.4,2.2,['#1a1410','#c89030','#f0d880','#fff6d0','#ffffff'],1),0,0);
  g.fillStyle='#fff6b0'; g.fillRect(1,2,1,3); g.fillRect(0,3,3,1); g.fillRect(14,10,1,1); g.fillStyle='#ffffff'; g.fillRect(1,3,1,1); return c; })();
const OAKSHIELD_ICON=(()=>{ const c=mkCanvas(16,16), g=c.getContext('2d');
  g.fillStyle=PAL.k; g.fillRect(2,1,12,11); g.fillRect(3,12,10,2); g.fillRect(5,14,6,1);
  g.fillStyle='#e8b848'; g.fillRect(3,2,10,9); g.fillRect(4,11,8,2); g.fillRect(6,13,4,1);
  g.fillStyle='#8a5a2c'; g.fillRect(4,3,8,7); g.fillRect(5,10,6,2); g.fillStyle='#b88048'; g.fillRect(4,3,8,1); g.fillRect(4,3,1,6);
  g.fillStyle='#8ae048'; g.fillRect(7,4,2,6); g.fillRect(6,6,4,2); g.fillStyle='#2e8a34'; g.fillRect(8,5,1,5); g.fillStyle='#fff6c0'; g.fillRect(3,2,2,1); return c; })();
