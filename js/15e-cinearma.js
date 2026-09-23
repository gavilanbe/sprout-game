'use strict';
/* ============================================================
   LA CINEMÁTICA DE CADA ARMA, con la ambición de la intro de Oracle of
   Seasons: Sprout en grande (dibujado por piezas, sombreado y con poses),
   fondos con paralaje, planos, anticipación, golpe y remate, y el nombre del
   arma con su frase. Después, ya en el juego, el gestito de cogerla (15d).
   ============================================================ */

/* ---------- SPROUT EN GRANDE: un muñeco por piezas ----------
   pose = { arms:[[x,y],[x,y]] (manos, en el lienzo de 64×64), eyes:'open'|'fierce'|'closed'|'wide',
            mouth:'smile'|'open'|'o'|'grin', leaf:grados de balanceo, look:-1..1 (mirada), front:[qué brazo va delante] } */
const BIG_SKIN=['#6a3a1c','#ae643a','#da9056','#f2bc7e','#ffe4b8'];
const BIG_PETO=['#56200c','#983c1a','#ca6634','#ea9052','#ffbe86'];
const BIG_FOOT=['#1c0e06','#3c1e0c','#66381a','#865028','#a66a38'];
const BIG_LEAF=['#103816','#226e2a','#46a63c','#7ed64e','#c6f68e'];
const BIG_CACHE=new Map();
function bigLeaf(g,x0,y0,len,wid,ang,pal){ // hoja con punta, nervio y haz más claro, girada `ang` grados
  const a=ang*Math.PI/180, ca=Math.cos(a), sa=Math.sin(a), R=Math.ceil(len)+2;
  for(let y=-R;y<=R;y++) for(let x=-R;x<=R;x++){ const u=x*ca+y*sa, v=-x*sa+y*ca; if(u<0||u>len) continue;
    const t=u/len, w=wid*Math.pow(Math.sin(Math.PI*Math.min(1,t*1.02+.02)),.75)*(1-.25*t); if(Math.abs(v)>w) continue;
    const d=v/Math.max(.5,w); let c=Math.abs(v)<.55?pal[1]:d<-.45?pal[4]:d<0?pal[3]:d<.6?pal[2]:pal[1];
    if(Math.abs(v)>=.55&&(((u-Math.abs(v)*1.3)%4)+4)%4<.9&&Math.abs(v)<w-.8) c=d<0?pal[3]:pal[1]; // nervios laterales
    g.fillStyle=c; g.fillRect(Math.round(x0+x),Math.round(y0+y),1,1); } }
function bigSprout(pose){
  const key=JSON.stringify(pose); let c=BIG_CACHE.get(key); if(c) return c;
  c=mkCanvas(64,64); const g=c.getContext('2d'), P=pose, [aL,aR]=P.arms||[[18,44],[46,44]], lk=Math.round((P.look||0)*2);
  const arm=([x,y])=>blobArt(g,0,0,64,64,[{x,y,r:3.6,ry:3.2}],BIG_SKIN,{outline:false,grad:.2,dither:.5});
  const front=P.front||[];
  if(!front.includes(0)) arm(aL); if(!front.includes(1)) arm(aR);                       // brazos por detrás del cuerpo
  blobArt(g,0,0,64,64,[{x:25,y:58,r:5.5,ry:3.2},{x:39,y:58,r:5.5,ry:3.2}],BIG_FOOT,{outline:false,grad:.3,dither:.5}); // los pies
  blobArt(g,0,0,64,64,[{x:32,y:48,r:15.5,ry:9}],BIG_PETO,{outline:false,grad:.45,dither:.35}); // el faldón
  blobArt(g,0,0,64,64,[{x:32,y:33,r:17.5,ry:15.5},{x:32,y:19.5,r:6,ry:4.5}],BIG_SKIN,{outline:false,grad:.25,dither:.35}); // el bulbo
  g.fillStyle='#6a3a1c'; for(let x=18;x<=46;x++){ const y=Math.round(45-Math.pow((x-32)/14,2)*3.2); g.fillRect(x,y,1,1); } // la costura con el faldón
  // la cara
  const ex=[25+lk,39+lk], ey=31;
  if(P.eyes==='closed'){ g.fillStyle='#1a1410'; for(const x of ex){ g.fillRect(x-2,ey+3,1,1); g.fillRect(x-1,ey+2,3,1); g.fillRect(x+2,ey+3,1,1); g.fillRect(x-2,ey+4,1,1); g.fillRect(x+2,ey+4,1,1); } }
  else { const tall=P.eyes==='wide'?9:P.eyes==='fierce'?6:8, top=ey+(P.eyes==='fierce'?2:0);
    for(const x of ex){ g.fillStyle='#1a1410'; g.fillRect(x-2,top+1,5,tall-2); g.fillRect(x-1,top,3,tall);
      g.fillStyle='#ffffff'; g.fillRect(x-1,top+1,2,2); g.fillRect(x+1,top+tall-3,1,1);
      if(P.eyes==='wide'){ g.fillStyle='#ffffff'; g.fillRect(x-1,top+1,2,3); } }
    if(P.eyes==='fierce'){ g.fillStyle='#4a2410'; for(let i=0;i<5;i++){ g.fillRect(ex[0]-3+i,ey-1+Math.round(i*.5),1,2); g.fillRect(ex[1]+3-i,ey-1+Math.round(i*.5),1,2); } } }
  g.fillStyle='rgba(240,120,120,.8)'; for(const [x,y] of [[18,39],[42,39]]){ g.fillRect(x,y,5,2); g.fillRect(x+1,y-1,3,1); } // mofletes
  g.fillStyle='rgba(255,220,220,.9)'; g.fillRect(19,39,1,1); g.fillRect(43,39,1,1);
  const mx=32+lk;
  if(P.mouth==='open'){ g.fillStyle='#3a1208'; g.fillRect(mx-3,41,6,4); g.fillRect(mx-2,40,4,6); g.fillStyle='#d84848'; g.fillRect(mx-2,43,4,2); }
  else if(P.mouth==='o'){ g.fillStyle='#3a1208'; g.fillRect(mx-1,41,3,3); }
  else if(P.mouth==='grin'){ g.fillStyle='#3a1208'; g.fillRect(mx-3,41,7,1); g.fillRect(mx-2,42,5,1); g.fillStyle='#ffffff'; g.fillRect(mx-2,41,5,1); }
  else { g.fillStyle='#3a1208'; g.fillRect(mx-2,42,1,1); g.fillRect(mx-1,43,3,1); g.fillRect(mx+2,42,1,1); }
  // brazos por delante
  for(const i of front) arm(i===0?aL:aR);
  // el tallo y las dos hojas, que se mecen
  const sw=P.leaf||0; g.fillStyle=BIG_LEAF[1]; g.fillRect(31,11,2,6); g.fillStyle=BIG_LEAF[3]; g.fillRect(31,11,1,5);
  bigLeaf(g,31,12,15,6,-150+sw,BIG_LEAF); bigLeaf(g,33,11,15,6,-32+sw,BIG_LEAF);
  artOutline(g,64,64);
  BIG_CACHE.set(key,c); return c; }

/* ---------- las armas en grande (y giradas sin perder el píxel) ---------- */
const BIGW={};
function bigWeapon(kind){ if(BIGW[kind]) return BIGW[kind]; let c, g; const mk=(w,h)=>{ c=mkCanvas(w,h); g=c.getContext('2d'); };
  const inE=(x,y,cx,cy,rx,ry)=>((x+.5-cx)/rx)**2+((y+.5-cy)/ry)**2<=1;
  if(kind==='blade') c=leafBladeArt(BLADE_TIERS[1].pal,{len:30,half:6.5,stem:5,dew:true});
  else if(kind==='bomb'){ mk(24,30); // la bellota-bomba: fruto, capuchón escamado, rabito y mecha
    blobArt(g,0,0,24,30,[{x:12,y:19,r:8.5,ry:9.5}],['#5a2808','#9a5214','#d88a2a','#f4bc58','#fff0b0'],{outline:false,grad:.35,dither:.3});
    blobArt(g,0,0,24,30,[{x:12,y:11,r:10.5,ry:5.2}],['#2e1606','#5a3212','#8a5422','#b07a3a','#d4a060'],{outline:false,grad:.45,dither:.3});
    g.fillStyle='rgba(28,12,4,.55)'; for(let y=7;y<16;y+=2) for(let x=2;x<23;x++) if(inE(x,y,12,11,9.5,4.6)&&((x+(y>>1))%3===0)) g.fillRect(x,y,1,1);
    g.fillStyle='#3a2410'; g.fillRect(11,2,2,5); g.fillStyle='#2a1a10'; g.fillRect(13,1,1,2); g.fillRect(14,0,2,1); artOutline(g,24,30); }
  else if(kind==='shield'){ mk(26,30); // el escudo de corteza: vetas, ribete y la hoja del Roble
    blobArt(g,0,0,26,30,[{x:13,y:11,r:11,ry:9.5},{x:13,y:19,r:8,ry:9}],['#3e2210','#6a4020','#9a6634','#c08c50','#e0b878'],{outline:false,grad:.3,dither:.3});
    g.fillStyle='rgba(48,24,8,.5)'; for(const x0 of [6,10,16,20]) for(let y=3;y<27;y++){ const x=x0+Math.round(Math.sin(y*.45+x0)*.9); if((inE(x,y,13,11,10,8.5)||inE(x,y,13,19,7,8))&&(y+x0)%6!==0) g.fillRect(x,y,1,1); }
    bigLeaf(g,13,21,10,3.6,-90,BIG_LEAF); g.fillStyle='#f0d8a0'; for(let x=5;x<22;x++) if(inE(x,3,13,11,11,9.5)) g.fillRect(x,3,1,1); artOutline(g,26,30); }
  else if(kind==='lantern'){ mk(20,32); // el farol de brasa: asa, tapa de hierro, cristal encendido y base
    g.fillStyle='#2e2e36'; for(let a=0;a<=Math.PI;a+=.08) g.fillRect(Math.round(10+Math.cos(a)*5)-1,Math.round(6-Math.sin(a)*5),2,2);
    g.fillStyle='#3c3c48'; g.fillRect(3,6,14,4); g.fillStyle='#62626e'; g.fillRect(3,6,14,1); g.fillRect(8,4,4,2);
    for(let y=10;y<24;y++) for(let x=4;x<16;x++){ const d=Math.hypot((x+.5-10)/6,(y+.5-17)/7.5); g.fillStyle=d<.28?'#ffffff':d<.5?'#fff2a0':d<.75?'#ffd060':'#e88a30'; g.fillRect(x,y,1,1); }
    g.fillStyle='#2e2e36'; g.fillRect(4,10,1,14); g.fillRect(15,10,1,14); g.fillRect(9,10,2,1); g.fillRect(4,16,12,1);
    g.fillStyle='#3c3c48'; g.fillRect(3,24,14,4); g.fillStyle='#62626e'; g.fillRect(3,24,14,1); g.fillRect(5,28,10,2); artOutline(g,20,32); }
  else if(kind==='feather'){ mk(32,44); // el vilano: tallo que se cimbrea y una bola de filamentos con sus semillas
    for(let y=18;y<44;y++){ const x=16+Math.round(Math.sin(y*.16)*1.2); g.fillStyle='#3e7a24'; g.fillRect(x,y,2,1); g.fillStyle='#8ac850'; g.fillRect(x,y,1,1); }
    for(let i=0;i<30;i++){ const a=i/30*6.283+.1; for(let r=2;r<=11;r++){ g.fillStyle=r>9?'#ffffff':'#e4ecf6'; g.fillRect(Math.round(16+Math.cos(a)*r),Math.round(14+Math.sin(a)*r),1,1); }
      g.fillStyle='#ffffff'; g.fillRect(Math.round(16+Math.cos(a)*12),Math.round(14+Math.sin(a)*12),1,1); g.fillStyle='#b8a878'; g.fillRect(Math.round(16+Math.cos(a)*2.5),Math.round(14+Math.sin(a)*2.5),1,1); }
    g.fillStyle='#d8cfa8'; g.fillRect(15,13,3,3); artOutline(g,32,44,'#6a7a90'); }
  else if(kind==='boomer'){ mk(32,20); // la vaina voladora: una media luna de vaina con sus semillas marcadas
    for(let y=0;y<20;y++) for(let x=0;x<32;x++){ const dx=x+.5-16, dy=y+.5-24, r=Math.hypot(dx,dy), a=Math.atan2(dy,dx); if(r<10||r>17||a>-.45||a<-2.7) continue;
      const k=(r-10)/7; g.fillStyle=k<.2?'#4a5a14':k<.45?'#7a8c26':k<.8?'#a8bc40':'#dcea7a'; g.fillRect(x,y,1,1); }
    g.fillStyle='#5a6a1a'; for(let i=0;i<5;i++){ const a=-2.45+i*.47; g.fillRect(Math.round(16+Math.cos(a)*13),Math.round(24+Math.sin(a)*13),2,1); } artOutline(g,32,20); }
  else if(kind==='hook'){ mk(20,20); // la garra de la raíz-gancho
    for(let y=0;y<20;y++) for(let x=0;x<20;x++){ const dx=x+.5-10, dy=y+.5-10, r=Math.hypot(dx,dy), a=Math.atan2(dy,dx); if(r<4.5||r>8.2||(a>-1.2&&a<.6)) continue;
      g.fillStyle=r<5.6?'#5a3418':r<7?'#8a5a2c':'#b8864c'; g.fillRect(x,y,1,1); }
    g.fillStyle='#b8864c'; g.fillRect(15,3,2,3); g.fillRect(16,2,1,1); g.fillStyle='#3e2210'; g.fillRect(8,16,4,4); artOutline(g,20,20); }
  else if(kind==='molinillo'){ mk(28,28); // la cabeza del molinillo: cuatro aspas de papel plegado
    const C4=[['#c02838','#f05858'],['#d8a010','#f8d850'],['#2878c8','#68b0f0'],['#389838','#78d060']];
    for(let y=0;y<28;y++) for(let x=0;x<28;x++){ const dx=x+.5-14, dy=y+.5-14, r=Math.hypot(dx,dy); if(r>12.5||r<1) continue; const a=(Math.atan2(dy,dx)+6.283)%6.283, q=Math.floor(a/(Math.PI/2)), f=(a%(Math.PI/2))/(Math.PI/2);
      if(r>12.5*(1-f*.55)) continue; g.fillStyle=f<.45?C4[q][1]:C4[q][0]; g.fillRect(x,y,1,1); }
    g.fillStyle='#f8f0e0'; g.fillRect(13,13,2,2); g.fillStyle='#8a6a48'; g.fillRect(13,14,1,1); artOutline(g,28,28); }
  else { const s=BLADE_SPR; mk(s.width*2,s.height*2); g.imageSmoothingEnabled=false; g.drawImage(s,0,0,s.width*2,s.height*2); }
  return BIGW[kind]=c; }
const ROTC=new Map();
function rotArt(img,deg){ deg=(((Math.round(deg/6)*6)%360)+360)%360; let m=ROTC.get(img); if(!m){ m=new Map(); ROTC.set(img,m); } let c=m.get(deg); if(c) return c;
  const a=deg*Math.PI/180, W=img.width, H=img.height, R=Math.ceil(Math.hypot(W,H))+2, ca=Math.cos(a), sa=Math.sin(a);
  c=mkCanvas(R,R); const g=c.getContext('2d'), src=img.getContext('2d').getImageData(0,0,W,H).data, out=g.createImageData(R,R), o=out.data;
  for(let y=0;y<R;y++) for(let x=0;x<R;x++){ const dx=x+.5-R/2, dy=y+.5-R/2, sx=Math.floor(dx*ca+dy*sa+W/2), sy=Math.floor(-dx*sa+dy*ca+H/2);
    if(sx<0||sy<0||sx>=W||sy>=H) continue; const i=(sy*W+sx)*4, j=(y*R+x)*4; o[j]=src[i]; o[j+1]=src[i+1]; o[j+2]=src[i+2]; o[j+3]=src[i+3]; }
  g.putImageData(out,0,0); m.set(deg,c); return c; }
/* la Hoja se agarra por el peciolo: gira alrededor de la mano */
function drawBlade(hx,hy,deg){ const img=bigWeapon('blade'), c=rotArt(img,deg), a=deg*Math.PI/180, off=img.width/2-2;
  ctx.drawImage(c,Math.round(hx+Math.cos(a)*off-c.width/2),Math.round(hy+Math.sin(a)*off-c.height/2)); }

/* ---------- el motor: planos, partículas, franjas, título ---------- */
const CA_T=214, CA_TITLE=134;
let cineArm=null;
function caSeg(t,a,b){ return clamp((t-a)/(b-a),0,1); }
function startCineArm(kind){ cineArm={kind,t:0,parts:[],shake:0,chars:0,rng:seeded(kind.length*97+13)}; }
function caHeroAt(pose,fx,fy,o){ o=o||{}; const img=bigSprout(pose), sx=o.sx||1, sy=o.sy||1; // fx,fy: los pies en pantalla
  if(sx===1&&sy===1) ctx.drawImage(img,Math.round(fx-32),Math.round(fy-61));
  else { const w=Math.round(64*sx), h=Math.round(64*sy); ctx.drawImage(img,0,0,64,64,Math.round(fx-w/2),Math.round(fy-61*sy),w,h); }
  return (x,y)=>[fx-32*sx+x*sx,fy-61*sy+y*sy]; } // de coordenadas del muñeco a pantalla
function caShadow(fx,fy,r){ ctx.fillStyle='rgba(10,20,10,.3)'; for(let y=-2;y<=2;y++){ const w=Math.round(r*Math.sqrt(1-(y*y)/6.5)); ctx.fillRect(Math.round(fx-w),Math.round(fy+y),w*2,1); } }
function caLeafPart(x,y,vx,vy,cols){ cineArm.parts.push({k:'leaf',x,y,vx,vy,g:.05,fr:.985,t:0,life:70+((Math.random()*30)|0),rot:Math.random()*6,vr:(Math.random()-.5)*.35,col:cols[(Math.random()*cols.length)|0]}); }
function caSpark(x,y,col){ cineArm.parts.push({k:'spark',x,y,vx:0,vy:0,t:0,life:14,col:col||'#ffffff'}); }
function caParts(C){ for(const p of C.parts){ const x=Math.round(p.x), y=Math.round(p.y), k=p.t/p.life;
  if(p.k==='leaf'){ const c=Math.cos(p.rot), s=Math.sin(p.rot); ctx.fillStyle='#10301a'; ctx.fillRect(x-1,y-1,4,3); ctx.fillStyle=p.col; ctx.fillRect(x,y,2,1); ctx.fillRect(x+Math.round(c),y+Math.round(s),1,1); ctx.fillRect(x-Math.round(c),y-Math.round(s),1,1); }
  else if(p.k==='spark'){ const s=Math.round((1-k)*6)+1; ctx.fillStyle=p.col; ctx.fillRect(x-s,y,s*2+1,1); ctx.fillRect(x,y-s,1,s*2+1); if(k<.5){ ctx.fillRect(x-1,y-1,3,3); } }
  else if(p.k==='dot'){ ctx.globalAlpha=1-k; ctx.fillStyle=p.col; ctx.fillRect(x,y,p.s||1,p.s||1); ctx.globalAlpha=1; } } }
function caBars(h){ ctx.fillStyle='#000'; ctx.fillRect(0,0,VW,h); ctx.fillRect(0,VH-h,VW,h); }
function caBigText(s,col){ const w=textW(s)+2, c=mkCanvas(w+2,14), g=c.getContext('2d'); // texto con contorno grueso, para escalarlo ×2
  for(const [dx,dy] of [[-1,0],[1,0],[0,-1],[0,1],[1,1],[-1,1],[1,-1],[-1,-1]]) drawText(g,s,2+dx,4+dy,'#0a0806','left',FONT_M);
  drawText(g,s,2,5,'#0a0806','left',FONT_M); drawText(g,s,2,4,col,'left',FONT_M); return c; }
const CA_NAMES={blade:['HOJA','ANCESTRAL'],bomb:['BELLOTA','BOMBA'],hook:['RAÍZ','GANCHO'],boomer:['VAINA','VOLADORA'],lantern:['FAROL','DE BRASA'],feather:['VILANO','DE PETRA'],shield:['ESCUDO','DE CORTEZA'],molinillo:['MOLINILLO']};
/* el plano del título: Sprout en su pose de héroe con el arma en alto, el nombre enorme y la frase */
function caTitle(f,C){ const A=MOMENT_ARMS[C.kind], P=A.pal;
  ctx.fillStyle=P[0]; ctx.fillRect(0,0,VW,VH);
  ctx.save(); ctx.translate(80,86); ctx.rotate(f*.012); for(let i=0;i<14;i++){ const a=i/14*6.283; ctx.fillStyle=i&1?P[1]:shade(P[1],-.25); ctx.beginPath(); ctx.moveTo(0,0); ctx.lineTo(Math.cos(a-.12)*130,Math.sin(a-.12)*130); ctx.lineTo(Math.cos(a+.12)*130,Math.sin(a+.12)*130); ctx.closePath(); ctx.fill(); } ctx.restore();
  ctx.fillStyle=P[2]; for(let i=0;i<24;i++){ const a=i/24*6.283+(i%3)*.05, r0=44+((i*7+f)%9); for(let r=r0;r<120;r+=2){ ctx.fillRect(Math.round(80+Math.cos(a)*r),Math.round(86+Math.sin(a)*r*.9),1,1); } } // líneas de velocidad
  const k=easeOutBack(caSeg(f,0,14)), fy=Math.round(124+(1-k)*40);
  caShadow(80,fy,16);
  const S=CA_SCRIPT[C.kind]; if(S.heroTitle) S.heroTitle(f,fy); else { const T=caHeroAt({eyes:'fierce',mouth:'grin',arms:[[16,42],[50,14]],leaf:Math.round(Math.sin(f*.1)*5)},80,fy); const [hx,hy]=T(50,14); caHeld(C.kind,hx,hy,f); }
  // el nombre, enorme, que cae línea a línea
  const N=CA_NAMES[C.kind]||[ITEM_NAMES[C.kind]||''];
  N.forEach((s,i)=>{ const d=caSeg(f,6+i*7,18+i*7); if(d<=0) return; const img=caBigText(s,i?P[3]:'#fffbe8'), w=img.width*2, y=Math.round(16+i*16-(1-easeOutBack(d))*22);
    ctx.globalAlpha=Math.min(1,d*2); ctx.drawImage(img,0,0,img.width,14,Math.round(80-w/2),y,w,28); ctx.globalAlpha=1; });
  // la frase, a máquina, en la franja de abajo
  const bh=Math.round(26*caSeg(f,2,10)); ctx.fillStyle='#000'; ctx.fillRect(0,VH-bh,VW,bh); ctx.fillStyle=P[1]; if(bh>1) ctx.fillRect(0,VH-bh,VW,1);
  if(C.chars>0){ let n=Math.floor(C.chars); wrapPx(A.line,150).slice(0,2).forEach((ln,i)=>{ const s=ln.slice(0,Math.max(0,n)); n-=ln.length+1; if(s) txtOL(s,80,VH-22+i*10,'#fffbe8','center','#000'); }); }
  if((f%70)>=20&&(f%70)<34){ const g=(f%70)-20, s=g<7?g>>1:(14-g)>>1; if(s>0) caSpark(C.gx||0,C.gy||0,'#ffffff'); } }
/* cada arma en la mano, en alto */
function caHeld(kind,hx,hy,f){ const C=cineArm; C.gx=hx; C.gy=hy-18;
  if(kind==='blade'){ drawBlade(hx,hy,-84); C.gx=hx+1; C.gy=hy-26; return; }
  const img=bigWeapon(kind); ctx.drawImage(img,Math.round(hx-img.width/2),Math.round(hy-img.height+6)); }

/* ---------- recursos de rodaje ---------- */
function caFaceCut(f,pose,P,tint){ // primer plano: la cara de Sprout al doble, con líneas de velocidad
  ctx.fillStyle=P[1]; ctx.fillRect(0,0,VW,VH);
  ctx.fillStyle=P[2]; for(let i=0;i<22;i++){ const y=14+((i*37)%116), x=((f*11+i*53)%240)-60; ctx.fillRect(x,y,26+(i%3)*12,1); }
  ctx.drawImage(bigSprout(pose),8,6,48,42,32,24,96,84);
  if(tint){ ctx.fillStyle=tint; ctx.fillRect(32,24,96,84); }
  if(f>=2&&f<12){ const s=f<7?f-1:12-f, ex=32+(39+Math.round((pose.look||0)*2)-8)*2+1, ey=24+(31-6)*2+3; ctx.fillStyle='#ffffff'; ctx.fillRect(ex-s,ey,s*2+1,1); ctx.fillRect(ex,ey-s,1,s*2+1); } }
function caRun(t,t0,t1,x0,x1){ const k=caSeg(t,t0,t1), e=1-(1-k)*(1-k); return [Math.round(lerp(x0,x1,e)),k<1?Math.round(Math.abs(Math.sin(t*.55))*3):0,k<1]; } // corre y frena
function caDust(x,y,n,col){ for(let i=0;i<n;i++) cineArm.parts.push({k:'dot',x:x+(Math.random()-.5)*10,y,vx:(Math.random()-.5)*1.4,vy:-Math.random()*.8,g:.02,t:0,life:18+(Math.random()*10|0),col:col||'#e8dcb8',s:2}); }
const CA_CAVE=(()=>{ const c=mkCanvas(160,144), g=c.getContext('2d'); bandSky(g,160,144,['#0c080e','#181018','#261a22','#34242c']); const r=seeded(31);
  g.fillStyle='#0a0608'; for(let x=0;x<160;x+=5){ const h=6+(r()*22|0); for(let y=0;y<h;y++){ const w=Math.max(0,Math.round(3*(1-y/h))); g.fillRect(x+2-w,y,w*2+1,1); } } // estalactitas
  for(let x=0;x<160;x++){ const h=Math.round(16+Math.sin(x*.07)*4+Math.sin(x*.23)*2); g.fillStyle='#1a1216'; g.fillRect(x,144-h,1,h); g.fillStyle='#2e2228'; g.fillRect(x,144-h,1,1); }
  for(const [x,y] of [[18,50],[140,40],[124,96],[30,98],[84,30]]){ g.fillStyle='#1e6a78'; g.fillRect(x,y-3,2,7); g.fillRect(x-2,y-1,6,3); g.fillStyle='#78f0f8'; g.fillRect(x,y-2,1,4); g.fillStyle='#e0ffff'; g.fillRect(x,y-1,1,1); } // cristales
  return c; })();
const CA_ROCK=(()=>{ const c=mkCanvas(12,11), g=c.getContext('2d'); blobArt(g,0,0,12,11,[{x:6,y:6,r:5,ry:4.2},{x:4.5,y:4.5,r:3}],['#3a3440','#5a5462','#827a88','#aaa2ae','#d6d0d8'],{grad:.3,dither:.4}); return c; })();
function caWind(t,n,y0,h,sp,col){ ctx.fillStyle=col||'rgba(240,248,255,.75)'; for(let i=0;i<n;i++){ const x=((t*sp+i*61)%220)-40, y=y0+(i*37)%h, w=10+(i%4)*6; ctx.fillRect(Math.round(x),y,w,1); if(i%3===0) ctx.fillRect(Math.round(x)+w,y-1,4,1); } }
function caBlast(cx,cy,f){ // la explosión: fogonazo, anillos de fuego y humo que sube
  if(f<0) return; const R=Math.min(44,f*3.2+6);
  if(f<30){ for(const [k,col] of [[1,'#ff5a28'],[.78,'#ffa030'],[.56,'#ffe070'],[.3,'#ffffff']]){ const r=R*k*(f<18?1:1-(f-18)/14); if(r<1) continue; ctx.drawImage(disc(Math.round(r),col),Math.round(cx-r),Math.round(cy-r)); } }
  for(let i=0;i<9;i++){ const a=i/9*6.283+f*.01, d=R*.8+f*.4, r=Math.max(1,Math.round(9-f*.12+(i%3))); if(f<12) continue; ctx.globalAlpha=Math.max(0,1-(f-12)/40); ctx.drawImage(disc(r,i&1?'#8a7a78':'#b0a4a0'),Math.round(cx+Math.cos(a)*d-r),Math.round(cy+Math.sin(a)*d*.7-r-(f-12)*.4)); ctx.globalAlpha=1; } }
function caRope(x0,y0,x1,y1,wig){ const n=Math.max(4,Math.round(Math.hypot(x1-x0,y1-y0)/2)); // la raíz: una cuerda con nudos que ondula
  for(let i=0;i<=n;i++){ const k=i/n, w=Math.sin(k*Math.PI*3+tick*.4)*wig*Math.sin(k*Math.PI), dx=-(y1-y0), dy=x1-x0, L=Math.hypot(dx,dy)||1, x=Math.round(x0+(x1-x0)*k+dx/L*w), y=Math.round(y0+(y1-y0)*k+dy/L*w);
    ctx.fillStyle='#2a1608'; ctx.fillRect(x-1,y-1,3,3); ctx.fillStyle=i%5===0?'#c08c50':'#8a5a2c'; ctx.fillRect(x,y,1,1); } }
function caPost(x,y){ ctx.fillStyle='#1a1008'; ctx.fillRect(x-4,y,9,54); ctx.fillStyle='#8a5a2c'; ctx.fillRect(x-3,y+1,7,53); ctx.fillStyle='#b88048'; ctx.fillRect(x-3,y+1,2,53); ctx.fillStyle='#5a3418'; for(let yy=y+8;yy<y+54;yy+=9) ctx.fillRect(x-3,yy,7,1); ctx.fillStyle='#c09060'; ctx.fillRect(x-4,y,9,2); }

/* ---------- los guiones de cada arma: draw(t) antes del título, sonidos por fotograma ---------- */
const CA_SCRIPT={
  blade:{ // la Hoja: entra corriendo por el valle en primavera, frena, mirada decidida y ¡tajo!
    cues:{ 4:()=>SFX.swoosh(), 26:()=>SFX.land(), 42:()=>SFX.charge(), 58:()=>SFX.sword(), 61:()=>{ SFX.leafHit(); SFX.cut(); }, 112:()=>SFX.chime() },
    tick(t,C){ if(t%9===0) C.parts.push({k:'leaf',x:-4,y:20+Math.random()*60,vx:.8+Math.random()*.6,vy:.2,g:.004,fr:1,t:0,life:220,rot:Math.random()*6,vr:.08,col:Math.random()<.5?'#f8a0d0':'#fffbe8'});
      if(t<24&&t%5===0) caDust(C.fx||40,118,2); if(t===26) caDust(80,118,8);
      if(t===61){ C.shake=10; for(let i=0;i<34;i++){ const a=-2.4+Math.random()*2.6, s=1+Math.random()*2.6; caLeafPart(80+Math.cos(a)*30,92+Math.sin(a)*24,Math.cos(a)*s,Math.sin(a)*s-1,['#46a63c','#7ed64e','#c6f68e','#226e2a']); } } },
    draw(t,C){
      if(t>=40&&t<52){ caFaceCut(t-40,{eyes:'fierce',mouth:'smile',leaf:-6},MOMENT_ARMS.blade.pal); return; }
      drawSeasonScene(0,t,t*.7);
      const strike=caSeg(t,58,64), rel=caSeg(t,100,118);
      let pose={eyes:'open',mouth:'smile',arms:[[18,44],[48,46]],leaf:Math.round(Math.sin(t*.08)*6)}, deg=62, sx=1, sy=1, fx=80, fy=118;
      if(t<26){ const [x,b]=caRun(t,0,26,-34,80), sw=Math.round(Math.sin(t*.55)*3); fx=x; fy=118-b; C.fx=x; pose={eyes:'open',mouth:'open',arms:[[18,44+sw],[48,46-sw]],leaf:-12}; deg=118; }
      else if(t<40){ if(t<30){ sy=.94; sx=1.04; } pose.look=t<34?-1:1; if(t>=36&&t<39) pose.eyes='closed'; }
      else if(t<58){ const k=caSeg(t,52,56); pose={eyes:'fierce',mouth:'smile',arms:[[18,40],[52,18]],leaf:-6}; deg=-118; sy=1-.07*smooth(k); sx=1+.04*smooth(k); }
      else if(t<100){ const e=smooth(strike); pose={eyes:'fierce',mouth:t<76?'open':'grin',arms:[[20,40],[Math.round(52-38*e),Math.round(18+32*e)]],front:[1],leaf:10}; deg=-118+268*e; fx=80-Math.round(10*e); sy=t<66?1.06:1; sx=t<66?.96:1; }
      else { const e=smooth(rel); pose={eyes:'open',mouth:'grin',arms:[[18,44],[Math.round(14+34*e),Math.round(50-4*e)]],leaf:Math.round(Math.sin(t*.08)*6)}; deg=150-88*e; fx=70+Math.round(10*e); }
      caShadow(fx,fy+1,15);
      if(t>=58&&t<96) caSmear(fx,fy-30,-118*Math.PI/180,(deg*Math.PI/180),t<66?1:1-caSeg(t,66,96));
      const T=caHeroAt(pose,fx,fy,{sx,sy}); const [hx,hy]=T(pose.arms[1][0],pose.arms[1][1]);
      drawBlade(hx,hy,deg);
      if(t===56||t===57){ const a=deg*Math.PI/180; caSpark(hx+Math.cos(a)*30,hy+Math.sin(a)*30,'#fffbe0'); }
      if(t>=108&&t<122){ const a=deg*Math.PI/180, g=(t-108)/14; ctx.fillStyle='#ffffff'; for(let i=0;i<3;i++) ctx.fillRect(Math.round(hx+Math.cos(a)*(6+g*26)),Math.round(hy+Math.sin(a)*(6+g*26))-1+i,1,1); }
      const P=PARA[0]; ctx.drawImage(P.fore,-((t*3.2)%320),114); ctx.drawImage(P.fore,320-((t*3.2)%320),114);
      if(t>=61&&t<64){ ctx.fillStyle='rgba(255,255,240,'+(.8-(t-61)*.25).toFixed(2)+')'; ctx.fillRect(0,0,VW,VH); } } },

  bomb:{ // la bellota-bomba: en la cueva enciende la mecha, la lanza, se tapa los oídos y ¡BUM!
    cues:{ 30:()=>noise(.6,.03,true,undefined,5200), 58:()=>SFX.swoosh(), 80:()=>{ const t=audio().currentTime; beep('triangle',96,30,.7,.15,t); noise(.8,.1,false,t,520); noise(.3,.06,true,t,2600); }, 112:()=>SFX.chime() },
    tick(t,C){ if(t>=28&&t<58&&(t&1)===0) C.parts.push({k:'dot',x:C.fuseX||80,y:C.fuseY||60,vx:(Math.random()-.5)*1.6,vy:-Math.random()*1.6,g:.07,t:0,life:12,col:Math.random()<.5?'#ffe070':'#ff9030'});
      if(t<22&&t%6===0) caDust(C.fx||40,118,2,'#6a5a58');
      if(t===80){ C.shake=18; for(let i=0;i<44;i++){ const a=Math.random()*6.283, s=1+Math.random()*3.6; C.parts.push({k:'dot',x:128,y:72,vx:Math.cos(a)*s,vy:Math.sin(a)*s-1.2,g:.09,t:0,life:40+(Math.random()*30|0),col:['#7a5a3a','#5a4030','#a88060','#ffd060'][i%4],s:1+(i%2)}); } }
      if(t>82&&t<124&&t%3===0) C.parts.push({k:'dot',x:14+Math.random()*132,y:13,vx:0,vy:.7+Math.random()*.6,g:.02,t:0,life:70,col:'#8a7058'}); },
    draw(t,C){
      if(t>=46&&t<56){ caFaceCut(t-46,{eyes:'fierce',mouth:'grin',leaf:4},MOMENT_ARMS.bomb.pal,'rgba(255,150,40,.12)'); return; }
      ctx.drawImage(CA_CAVE,0,0);
      let fx=62, fy=118, pose={eyes:'open',mouth:'smile',arms:[[22,44],[42,44]],leaf:0}, bomb=null, sx=1, sy=1;
      if(t<24){ const [x,b]=caRun(t,0,24,-30,62); fx=x; fy=118-b; C.fx=x; bomb=[32,38]; }
      else if(t<46){ const k=smooth(caSeg(t,24,34)); pose={eyes:t>30?'wide':'open',mouth:t>30?'o':'smile',arms:[[Math.round(22-2*k),Math.round(44-30*k)],[Math.round(42+2*k),Math.round(44-30*k)]],leaf:0}; bomb=[32,Math.round(38-32*k)]; }
      else if(t<64){ const k=caSeg(t,56,62); pose={eyes:'fierce',mouth:'open',arms:[[26,30],[Math.round(44+8*k),Math.round(24+6*k)]],leaf:8}; if(t<58) bomb=[36,12]; }
      else if(t<104){ pose={eyes:'closed',mouth:'o',arms:[[13,30],[51,30]],leaf:t>80?14:0}; if(t>=80){ fx=62-Math.round(8*smooth(caSeg(t,80,92))); sy=t<86?.92:1; sx=t<86?1.06:1; } }
      else pose={eyes:t<112?'closed':'open',mouth:'grin',arms:[[13,48],[51,48]],leaf:Math.round(Math.sin(t*.1)*4)};
      if(t>=24&&t<60){ glowAt(fx,fy-60+(bomb?bomb[1]:0),30+Math.sin(t*.9)*3,'rgba(255,170,70,.28)'); }
      caShadow(fx,fy+1,15);
      const T=caHeroAt(pose,fx,fy,{sx,sy});
      if(bomb){ const img=bigWeapon('bomb'), [bx,by]=T(bomb[0],bomb[1]); ctx.drawImage(img,Math.round(bx-12),Math.round(by-15)); C.fuseX=bx+3; C.fuseY=by-15; if(t>=28&&(t&3)<2){ ctx.fillStyle='#fff6c0'; ctx.fillRect(Math.round(bx+2),Math.round(by-16),3,3); } }
      if(t>=58&&t<74){ const k=caSeg(t,58,74), img=rotArt(bigWeapon('bomb'),t*30), [hx,hy]=T(52,24), x=lerp(hx,176,k), y=lerp(hy,72,k)-Math.sin(Math.PI*k)*40; ctx.drawImage(img,Math.round(x-img.width/2),Math.round(y-img.height/2)); }
      caBlast(128,72,t-80);
      if(t>=80&&t<84){ ctx.fillStyle='rgba(255,250,230,'+(.9-(t-80)*.2).toFixed(2)+')'; ctx.fillRect(0,0,VW,VH); } } },

  hook:{ // la raíz-gancho: la voltea sobre la cabeza, la lanza a un poste, muerde y ¡zas!, allá que va
    cues:{ 28:()=>swish(.18,.08,500,1600,700), 36:()=>swish(.18,.08,500,1600,700), 44:()=>swish(.18,.08,500,1600,700), 56:()=>SFX.boomer(), 66:()=>{ SFX.clang(); }, 74:()=>SFX.hookYank(), 100:()=>SFX.land(), 112:()=>SFX.chime() },
    tick(t,C){ if(t===66){ C.shake=6; for(let i=0;i<10;i++) caSpark(138+(Math.random()-.5)*8,74+(Math.random()-.5)*8,i&1?'#ffffff':'#ffe070'); for(let i=0;i<8;i++) C.parts.push({k:'dot',x:138,y:74,vx:-Math.random()*2,vy:(Math.random()-.5)*2,g:.1,t:0,life:24,col:'#b88048',s:2}); }
      if(t>=74&&t<100&&t%3===0) caDust(C.fx||60,118,1); if(t===100) caDust(112,118,9); },
    draw(t,C){
      if(t>=46&&t<54){ caFaceCut(t-46,{eyes:'fierce',mouth:'smile',leaf:-4,look:1},MOMENT_ARMS.hook.pal); return; }
      drawSeasonScene(1,t,t*.4+(t>=74&&t<100?(t-74)*4:0)); caPost(140,66);
      let fx=46, fy=118, pose={eyes:'open',mouth:'smile',arms:[[18,44],[48,44]],leaf:Math.round(Math.sin(t*.08)*5)}, head=null, sx=1, sy=1;
      const T0=(fx0,fy0)=>(x,y)=>[fx0-32+x,fy0-61+y];
      if(t>=24&&t<54){ pose={eyes:'fierce',mouth:'smile',arms:[[18,42],[48,12]],leaf:-6}; }
      else if(t>=54&&t<74){ pose={eyes:'fierce',mouth:'open',arms:[[20,42],[54,34]],front:[1],leaf:6}; }
      else if(t>=74&&t<100){ const k=caSeg(t,74,100), e=k*k; fx=Math.round(46+66*e); pose={eyes:'fierce',mouth:'open',arms:[[20,40],[56,30]],front:[1],leaf:20}; sx=1.12; sy=.9; C.fx=fx;
        ctx.fillStyle='rgba(255,255,255,.7)'; for(let i=0;i<6;i++) ctx.fillRect(fx-40-((t*7+i*13)%30),fy-50+i*8,14,1); }
      else if(t>=100){ fx=112; if(t<106){ sy=.92; sx=1.06; } pose={eyes:t<112?'closed':'open',mouth:'grin',arms:[[18,44],[48,44]],leaf:Math.round(Math.sin(t*.08)*5),look:t>=112?-1:0}; }
      caShadow(fx,fy+1,15);
      const T=caHeroAt(pose,fx,fy,{sx,sy}); const [hx,hy]=T(pose.arms[1][0],pose.arms[1][1]);
      if(t<24||t>=110) head=[hx+4,hy-2];
      else if(t<54){ const a=t*.5; head=[hx+Math.cos(a)*16,hy-6+Math.sin(a)*7]; caRope(hx,hy,head[0],head[1],1); }
      else if(t<66){ const k=caSeg(t,54,66); head=[lerp(hx,136,k),lerp(hy,74,k)-Math.sin(Math.PI*k)*14]; caRope(hx,hy,head[0],head[1],5*(1-k)+1); }
      else if(t<110){ head=[136,74]; caRope(hx,hy,136,74,t<72?2:0); }
      if(head){ const img=bigWeapon('hook'); ctx.drawImage(img,Math.round(head[0]-10),Math.round(head[1]-10)); } } },

  boomer:{ // la vaina voladora: carga, la lanza, da la vuelta a la pantalla entre las hojas y vuelve a su mano
    cues:{ 24:()=>SFX.charge(), 50:()=>SFX.boomer(), 62:()=>SFX.boomer(), 74:()=>SFX.boomer(), 86:()=>SFX.boomer(), 98:()=>SFX.boomer(), 110:()=>SFX.boomer(), 118:()=>{ SFX.blip(); SFX.chime(); } },
    tick(t,C){ if(t%7===0) C.parts.push({k:'leaf',x:Math.random()*160,y:10,vx:(Math.random()-.5)*.4,vy:.5,g:.004,fr:1,t:0,life:200,rot:Math.random()*6,vr:.06,col:['#e8a040','#c86830','#f0c860'][t%3]});
      if(t===118){ C.shake=4; for(let i=0;i<8;i++) caSpark(C.hx||80,C.hy||70,'#fff6c0'); } },
    draw(t,C){
      if(t>=38&&t<48){ caFaceCut(t-38,{eyes:'fierce',mouth:'smile',leaf:6,look:-1},MOMENT_ARMS.boomer.pal); return; }
      drawSeasonScene(2,t,t*.4);
      let fx=72, fy=118, pose={eyes:'open',mouth:'smile',arms:[[18,44],[48,44]],leaf:Math.round(Math.sin(t*.08)*5)}, held=true, sx=1, sy=1;
      if(t>=22&&t<48){ const k=smooth(caSeg(t,22,32)); pose={eyes:'fierce',mouth:'smile',arms:[[20,40],[Math.round(48+8*k),Math.round(44-18*k)]],leaf:-8}; sx=1+.03*k; }
      else if(t>=48&&t<118){ held=false; pose={eyes:t<60?'fierce':'open',mouth:t<60?'open':'o',arms:[[20,44],[t<60?54:48,t<60?34:44]],leaf:0,look:t<60?1:Math.round(Math.cos((t-56)/62*6.283))}; }
      else if(t>=118){ pose={eyes:t<124?'closed':'open',mouth:'grin',arms:[[16,44],[48,20]],leaf:Math.round(Math.sin(t*.1)*5)}; if(t<122){ sy=.94; sx=1.05; } }
      caShadow(fx,fy+1,15);
      let podBehind=null;
      if(!held&&t<118){ const k=caSeg(t,50,118), a=k*6.283-1.1, x=80+Math.cos(a)*64, y=62+Math.sin(a)*26, img=rotArt(bigWeapon('boomer'),t*36); podBehind=[x,y,img,Math.sin(a)<0]; }
      if(podBehind&&podBehind[3]) ctx.drawImage(podBehind[2],Math.round(podBehind[0]-podBehind[2].width/2),Math.round(podBehind[1]-podBehind[2].height/2));
      const T=caHeroAt(pose,fx,fy,{sx,sy}); const [hx,hy]=T(pose.arms[1][0],pose.arms[1][1]); C.hx=hx; C.hy=hy;
      if(held){ const img=bigWeapon('boomer'); ctx.drawImage(img,Math.round(hx-8),Math.round(hy-14)); }
      if(podBehind&&!podBehind[3]){ for(let i=1;i<=3;i++){ const k=caSeg(t-i*2,50,118), a=k*6.283-1.1; ctx.globalAlpha=.25/i; const img=rotArt(bigWeapon('boomer'),(t-i*2)*36); ctx.drawImage(img,Math.round(80+Math.cos(a)*64-img.width/2),Math.round(62+Math.sin(a)*26-img.height/2)); ctx.globalAlpha=1; }
        ctx.drawImage(podBehind[2],Math.round(podBehind[0]-podBehind[2].width/2),Math.round(podBehind[1]-podBehind[2].height/2)); } } },

  lantern:{ // el farol de brasa: en plena noche la luz se abre, y ¡llamarada!
    cues:{ 32:()=>SFX.torch(), 56:()=>SFX.brazier(), 64:()=>noise(.5,.05,false,undefined,900), 112:()=>SFX.chime() },
    tick(t,C){ if(t>=32&&t%4===0) C.parts.push({k:'dot',x:(C.lx||80)+(Math.random()-.5)*6,y:(C.ly||60),vx:(Math.random()-.5)*.5,vy:-.6-Math.random()*.6,g:0,t:0,life:40,col:Math.random()<.5?'#ffd060':'#ff8a30'});
      if(t>=56&&t<92&&t%2===0) for(let i=0;i<2;i++) C.parts.push({k:'dot',x:(C.lx||80)+20+Math.random()*90,y:(C.ly||60)+(Math.random()-.5)*20,vx:1+Math.random(),vy:-.8-Math.random(),g:0,t:0,life:30,col:Math.random()<.5?'#ffe070':'#ff6a28'}); },
    draw(t,C){
      if(t>=44&&t<54){ caFaceCut(t-44,{eyes:'wide',mouth:'o',leaf:4},MOMENT_ARMS.lantern.pal,'rgba(255,140,40,.16)'); return; }
      ctx.drawImage(NIGHT,0,-10); ctx.fillStyle='#10121e'; for(let x=0;x<160;x++){ const h=Math.round(26+Math.sin(x*.05)*6+Math.sin(x*.17)*2); ctx.fillRect(x,144-h,1,h); }
      let fx=70, fy=118, pose={eyes:'closed',mouth:'smile',arms:[[18,44],[48,48]],leaf:0}, lamp=[48,48], flame=0;
      if(t>=30&&t<56){ const k=smooth(caSeg(t,30,40)); pose={eyes:'wide',mouth:'o',arms:[[18,44],[Math.round(48-2*k),Math.round(48-28*k)]],leaf:0}; lamp=[Math.round(48-2*k),Math.round(48-28*k)]; }
      else if(t>=56&&t<92){ pose={eyes:'fierce',mouth:'open',arms:[[20,40],[56,34]],front:[1],leaf:10}; lamp=[56,34]; flame=caSeg(t,56,64)*(1-caSeg(t,82,92)); }
      else if(t>=92){ pose={eyes:t<104?'closed':'open',mouth:'grin',arms:[[18,44],[46,20]],leaf:Math.round(Math.sin(t*.08)*4)}; lamp=[46,20]; }
      caShadow(fx,fy+1,15);
      const T=caHeroAt(pose,fx,fy); const [lx,ly]=T(lamp[0],lamp[1]); C.lx=lx; C.ly=ly-8;
      const img=bigWeapon('lantern'); ctx.drawImage(img,Math.round(lx-10),Math.round(ly-24));
      if(flame>0){ glowAt(lx+50,ly-12,50*flame,'rgba(255,150,50,.35)'); for(let i=0;i<8;i++){ const x=lx+14+i*12, H=Math.round((14+i*3)*flame*(0.8+.2*Math.sin(t*.7+i))), fr=flameSpr(Math.max(3,H),(t>>1)+i); ctx.drawImage(fr,Math.round(x-fr.width/2),Math.round(ly-8-H*.7+Math.sin(i+t*.3)*2)); } }
      // la oscuridad, con el círculo de luz del farol
      const R=t<30?9+Math.sin(t*.5):t<40?9+60*smooth(caSeg(t,30,40)):66+Math.sin(t*.4)*2+(flame>0?16*flame:0);
      const g=ctx.createRadialGradient(lx,ly-10,R*.35,lx,ly-10,R); g.addColorStop(0,'rgba(8,8,20,0)'); g.addColorStop(1,'rgba(8,8,20,.93)'); ctx.fillStyle=g; ctx.fillRect(0,0,VW,VH);
      glowAt(lx,ly-10,R*.55,'rgba(255,170,70,.22)'); } },

  feather:{ // el vilano: desde el risco nevado salta y planea despacio entre las nubes
    cues:{ 34:()=>SFX.jump(), 44:()=>noise(1.2,.018,false,undefined,700), 112:()=>{ SFX.land(); SFX.chime(); } },
    tick(t,C){ if(t>=44&&t<110&&t%3===0) C.parts.push({k:'dot',x:(C.vx0||80)+(Math.random()-.5)*14,y:(C.vy0||40),vx:-.6-Math.random()*.8,vy:-.4-Math.random()*.5,g:0,t:0,life:50,col:'#ffffff'});
      if(t%4===0) C.parts.push({k:'dot',x:Math.random()*170,y:t<44?10:150,vx:-.3,vy:t<44?.6:-1.4,g:0,t:0,life:120,col:'#f4f8ff'}); if(t===110) caDust(80,118,10,'#ffffff'); },
    draw(t,C){
      if(t>=24&&t<34){ caFaceCut(t-24,{eyes:'open',mouth:'grin',leaf:-10,look:1},MOMENT_ARMS.feather.pal); return; }
      let fx=52, fy=100, pose={eyes:'open',mouth:'smile',arms:[[18,44],[48,18]],leaf:Math.round(Math.sin(t*.12)*8)}, sx=1, sy=1;
      if(t<44){ drawSeasonScene(3,t,t*.3); ctx.fillStyle='#1a1410'; ctx.fillRect(0,100,70,44); ctx.fillStyle='#e8f0f8'; ctx.fillRect(0,101,69,43); ctx.fillStyle='#ffffff'; ctx.fillRect(0,101,69,3); ctx.fillStyle='#b0c4dc'; for(let x=4;x<66;x+=7) ctx.fillRect(x,110+(x%3)*6,4,1);
        if(t>=34){ const k=smooth(caSeg(t,34,44)); fy=Math.round(100-54*k); fx=Math.round(52+18*k); sy=1.06; sx=.95; pose.eyes='closed'; pose.mouth='open'; } }
      else if(t<110){ const k=caSeg(t,44,110); ctx.fillStyle=SEASONS[3].sky[2]; ctx.fillRect(0,0,VW,VH); ctx.drawImage(PARA[3].sky,0,0); const P=PARA[3]; const cy=((t-44)*1.4)%120; ctx.drawImage(P.clouds,-((t*.4)%320),150-cy); ctx.drawImage(P.clouds,-((t*.4+160)%320),60-cy); ctx.drawImage(P.clouds,-((t*.4+80)%320),-30-cy+120);
        fx=Math.round(80+Math.sin(t*.07)*18); fy=Math.round(80+Math.sin(t*.05)*4); pose={eyes:k<.5?'closed':'open',mouth:k<.5?'o':'grin',arms:[[18,40],[46,14]],leaf:Math.round(Math.sin(t*.15)*10)}; }
      else { drawSeasonScene(3,t,t*.3); fx=80; fy=118; if(t<116){ sy=.92; sx=1.06; } pose={eyes:t<118?'closed':'open',mouth:'grin',arms:[[18,44],[46,18]],leaf:Math.round(Math.sin(t*.1)*6)}; }
      if(t<34||t>=110) caShadow(fx,fy+1,15);
      const T=caHeroAt(pose,fx,fy,{sx,sy}); const [hx,hy]=T(pose.arms[1][0],pose.arms[1][1]); const img=bigWeapon('feather'); ctx.drawImage(img,Math.round(hx-16),Math.round(hy-40)); C.vx0=hx; C.vy0=hy-30;
      if(t>=44&&t<110) caWind(t,8,20,100,3,'rgba(255,255,255,.5)'); } },

  shield:{ // el escudo de corteza: al atardecer le llueven piedras y todas rebotan
    cues:{ 34:()=>SFX.swoosh(), 44:()=>{ SFX.clang(); SFX.block(); }, 58:()=>SFX.swoosh(), 68:()=>{ SFX.clang(); SFX.block(); }, 82:()=>SFX.swoosh(), 92:()=>{ SFX.clang(); SFX.block(); }, 112:()=>SFX.chime() },
    tick(t,C){ for(const hit of [44,68,92]) if(t===hit){ C.shake=7; for(let i=0;i<10;i++) caSpark((C.sx0||80)+(Math.random()-.5)*10,(C.sy0||80)+(Math.random()-.5)*12,i&1?'#ffffff':'#ffe070'); } },
    draw(t,C){
      if(t>=20&&t<32){ caFaceCut(t-20,{eyes:'fierce',mouth:'smile',leaf:-4},MOMENT_ARMS.shield.pal); return; }
      drawSeasonScene(2,t,t*.3); ctx.fillStyle='rgba(50,10,30,.38)'; ctx.fillRect(0,0,VW,VH);
      const hits=[44,68,92].filter(h=>t>=h).length; let fx=70-hits*4, fy=118, pose={eyes:'fierce',mouth:'smile',arms:[[24,42],[40,42]],leaf:-4}, sx=1, sy=1, up=true;
      for(const h of [44,68,92]) if(t>=h&&t<h+4){ sx=1.05; sy=.95; pose.mouth='open'; }
      if(t>=108){ up=false; pose={eyes:'open',mouth:'grin',arms:[[16,46],[50,40]],leaf:Math.round(Math.sin(t*.1)*4)}; }
      caShadow(fx,fy+1,15);
      const T=caHeroAt(pose,fx,fy,{sx,sy}); const img=bigWeapon('shield');
      if(up){ const [bx,by]=T(32,44); ctx.drawImage(img,Math.round(bx-13),Math.round(by-17)); C.sx0=bx+10; C.sy0=by-6; }
      else { const [bx,by]=T(50,40); ctx.drawImage(img,Math.round(bx-6),Math.round(by-16)); }
      for(const s of [34,58,82]){ const f=t-s; if(f<0||f>40) continue; let x, y; if(f<10){ x=178-f*((178-(C.sx0||90))/10); y=60+f*2+(C.sy0||80)*0-0; y=lerp(58,(C.sy0||80),f/10); } else { const g=f-10; x=(C.sx0||90)+g*3; y=(C.sy0||80)-g*3+g*g*.12; }
        const r=rotArt(CA_ROCK,f*40); ctx.globalAlpha=f>30?1-(f-30)/10:1; ctx.drawImage(r,Math.round(x-r.width/2),Math.round(y-r.height/2)); ctx.globalAlpha=1; } } },

  molinillo:{ // el molinillo: coge aire, sopla y la hojarasca sale volando
    cues:{ 24:()=>swish(.5,.05,300,900,1400), 50:()=>SFX.swoosh(), 56:()=>noise(1,.04,false,undefined,1600), 70:()=>noise(.8,.035,false,undefined,2400), 112:()=>SFX.chime() },
    tick(t,C){ if(t>=52&&t<110&&t%2===0) C.parts.push({k:'leaf',x:-4+Math.random()*60,y:112+Math.random()*10,vx:2.5+Math.random()*2.5,vy:-1.4-Math.random()*1.6,g:.03,fr:.995,t:0,life:80,rot:Math.random()*6,vr:.3,col:['#e8a040','#c86830','#f0c860','#a85028'][t%4]}); },
    draw(t,C){
      if(t>=40&&t<50){ caFaceCut(t-40,{eyes:'closed',mouth:'o',leaf:-8},MOMENT_ARMS.molinillo.pal); return; }
      drawSeasonScene(2,t,t*.3); ctx.fillStyle='#b86a30'; for(let i=0;i<30;i++){ const x=(i*29)%160, y=116+(i*7)%10; if(t<52||x>(t-52)*5) ctx.fillRect(x,y,3,2); }
      let fx=70, fy=118, pose={eyes:'open',mouth:'smile',arms:[[18,44],[48,26]],leaf:Math.round(Math.sin(t*.08)*5)}, sx=1, sy=1, spin=t*3;
      if(t>=22&&t<50){ pose={eyes:'closed',mouth:'o',arms:[[18,44],[48,26]],leaf:0}; sy=1+.04*smooth(caSeg(t,22,38)); sx=1-.02*smooth(caSeg(t,22,38)); }
      else if(t>=50&&t<110){ pose={eyes:'fierce',mouth:'o',arms:[[18,42],[48,24]],leaf:Math.round(18+Math.sin(t*.9)*6)}; spin=t*3+(t-50)*(t-50)*.9; caWind(t,14,20,96,6,'rgba(255,248,230,.7)'); }
      else if(t>=110){ pose={eyes:'closed',mouth:'grin',arms:[[18,44],[48,26]],leaf:Math.round(Math.sin(t*.1)*6)}; spin=t*3+60*60*.9+(t-110)*8; }
      caShadow(fx,fy+1,15);
      const T=caHeroAt(pose,fx,fy,{sx,sy}); const [hx,hy]=T(pose.arms[1][0],pose.arms[1][1]);
      ctx.fillStyle='#1a1008'; ctx.fillRect(Math.round(hx)-1,Math.round(hy)-18,3,20); ctx.fillStyle='#b88048'; ctx.fillRect(Math.round(hx),Math.round(hy)-17,1,18);
      const head=rotArt(bigWeapon('molinillo'),spin); ctx.drawImage(head,Math.round(hx-head.width/2),Math.round(hy-18-head.height/2)); } },
};
/* la estela grande de la Hoja: media luna verde con el filo blanco */
function caSmear(cx,cy,a0,a1,alpha){ if(alpha<=0) return; const r0=26, r1=46, span=a1-a0; if(span<=.05) return;
  const x0=Math.floor(cx-r1), y0=Math.floor(cy-r1), W=r1*2+1, im=ctx.getImageData(x0,y0,W,W), d=im.data;
  const cols=[[70,166,60],[126,214,78],[198,246,142],[255,255,240]];
  for(let y=0;y<W;y++) for(let x=0;x<W;x++){ const dx=x0+x+.5-cx, dy=y0+y+.5-cy, r=Math.hypot(dx,dy); if(r<r0||r>r1) continue;
    let a=Math.atan2(dy,dx); while(a<a0) a+=6.283; if(a>a1) continue; const along=(a-a0)/span, edge=(r-r0)/(r1-r0);
    if(along<.25&&((x+y)&1)) continue; const ci=along>.92?3:edge>.8?2:edge>.45?1:0, q=cols[ci], al=alpha*(ci===3?1:.85)*(r<r0+3?.6:1);
    const i=(y*W+x)*4; d[i]=d[i]*(1-al)+q[0]*al; d[i+1]=d[i+1]*(1-al)+q[1]*al; d[i+2]=d[i+2]*(1-al)+q[2]*al; }
  ctx.putImageData(im,x0,y0); }
function updCineArm(){ const C=cineArm, S=CA_SCRIPT[C.kind]||CA_SCRIPT.blade;
  C.t++; const cue=S.cues&&S.cues[C.t]; if(cue) try{ cue(); }catch(_){}
  if(C.t===CA_TITLE+1) SFX.momentFreeze(); if(C.t===CA_TITLE+9) SFX.fanfare();
  if(S.tick&&C.t<CA_TITLE) S.tick(C.t,C); // el ambiente de cada plano no pasa al título
  if(C.t===CA_TITLE) C.parts=C.parts.filter(p=>p.k!=='dot');
  if(C.t>=CA_TITLE+20) C.chars=Math.min(MOMENT_ARMS[C.kind].line.length,C.chars+1.5);
  for(const p of C.parts){ p.x+=p.vx; p.y+=p.vy; p.vy+=p.g||0; if(p.fr){ p.vx*=p.fr; p.vy*=p.fr; } p.t++; if(p.rot!==undefined) p.rot+=p.vr||0; }
  C.parts=C.parts.filter(p=>p.t<p.life&&p.y<VH+8);
  if(C.shake>0) C.shake--;
  if(keys.fire&&C.t>10){ keys.fire=false; if(C.t<CA_TITLE) { C.t=CA_TITLE; C.parts=[]; } else if(C.chars<MOMENT_ARMS[C.kind].line.length) C.chars=MOMENT_ARMS[C.kind].line.length; else C.t=CA_T; }
  return C.t>=CA_T; }
function drawCineArm(){ const C=cineArm; if(!C) return; const S=CA_SCRIPT[C.kind]||CA_SCRIPT.blade, t=C.t;
  ctx.save(); if(C.shake>0&&opts.shake) ctx.translate((Math.random()*4-2)|0,(Math.random()*4-2)|0);
  if(t<CA_TITLE){ S.draw(t,C); caParts(C); caBars(12); }
  else { caTitle(t-CA_TITLE,C); caParts(C); ctx.fillStyle='#000'; ctx.fillRect(0,0,VW,12); }
  ctx.restore();
  const fl=t<7?1-t/7:t>=CA_TITLE&&t<CA_TITLE+6?1-(t-CA_TITLE)/6:t>CA_T-10?(t-(CA_T-10))/10:0; // fogonazos: al entrar, al cortar al título y al salir
  if(fl>0){ ctx.fillStyle='rgba(255,255,244,'+fl.toFixed(2)+')'; ctx.fillRect(0,0,VW,VH); } }
