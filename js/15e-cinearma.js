'use strict';
/* ============================================================
   LA CINEMÁTICA DE CADA ARMA, con la ambición de la intro de Oracle of
   Seasons. Sprout en grande es un muñeco por piezas que se aplasta, se
   estira y se inclina redibujándose (nunca se estiran píxeles), con
   párpados, cejas y bocas; se mueve por claves con curvas (anticipación,
   golpe, sobrepaso y asiento) y sus hojas siguen al cuerpo con retraso.
   Los primeros planos se dibujan a su tamaño y se acercan de verdad; entre
   planos hay barridos; los golpes llevan un congelado cortito, un fotograma
   en negativo y anillos de choque. El título: Sprout entra de un salto,
   alza el arma, el nombre cae de golpe y la frase se queda el tiempo de
   leerla. Después, ya en el juego, el gestito de cogerla (15d).
   ============================================================ */

/* ---------- SPROUT EN GRANDE: un muñeco por piezas ----------
   pose = { arms:[[x,y],[x,y]] manos (en el muñeco de 64×64, pies en y=61) · front:[qué manos van delante]
            eyes:'open'|'fierce'|'closed'|'wide' · lid:0..1 párpado (1 = parpadeo) · brow:-1..1 cejas (1 enfado, -1 apuro)
            look:-1..1 mirada · mouth:'smile'|'open'|'o'|'grin'|'shout'|'teeth'|'flat'|'smirk'
            leaf: grados de las hojas (o [izquierda,derecha]) · sq: 1 normal, <1 aplastado, >1 estirado
            lean: px que se inclina la cabeza (los pies se quedan) · feet:[dx,dy,dx,dy] los pies } */
const BIG_SKIN=['#6a3a1c','#ae643a','#da9056','#f2bc7e','#ffe4b8'];
const BIG_PETO=['#56200c','#983c1a','#ca6634','#ea9052','#ffbe86'];
const BIG_FOOT=['#1c0e06','#3c1e0c','#66381a','#865028','#a66a38'];
const BIG_LEAF=['#103816','#226e2a','#46a63c','#7ed64e','#c6f68e'];
const BIG_INK='#1a1410', BIG_MOUTH='#3a1208';
const BIG_W=80, BIG_H=72, BIG_OX=8, BIG_OY=8; // el lienzo lleva margen: el muñeco (0..64) cae en (8..72)
const BIG_CACHE=new Map();
function bigLeaf(g,x0,y0,len,wid,ang,pal){ // hoja con punta, nervio y haz más claro, girada `ang` grados
  const a=ang*Math.PI/180, ca=Math.cos(a), sa=Math.sin(a), R=Math.ceil(len)+2;
  for(let y=-R;y<=R;y++) for(let x=-R;x<=R;x++){ const u=x*ca+y*sa, v=-x*sa+y*ca; if(u<0||u>len) continue;
    const t=u/len, w=wid*Math.pow(Math.sin(Math.PI*Math.min(1,t*1.02+.02)),.75)*(1-.25*t); if(Math.abs(v)>w) continue;
    const d=v/Math.max(.5,w); let c=Math.abs(v)<.55?pal[1]:d<-.45?pal[4]:d<0?pal[3]:d<.6?pal[2]:pal[1];
    if(Math.abs(v)>=.55&&(((u-Math.abs(v)*1.3)%4)+4)%4<.9&&Math.abs(v)<w-.8) c=d<0?pal[3]:pal[1]; // nervios laterales
    g.fillStyle=c; g.fillRect(Math.round(x0+x),Math.round(y0+y),1,1); } }
/* aplastar/estirar e inclinar: del punto del muñeco al punto dibujado (s y n ya redondeados) */
function rigMap(s,n,x,y){ const wx=Math.pow(s,-.8), yy=61-(61-y)*s; return [32+(x-32)*wx+Math.round(n*(61-yy)/50),yy]; }
function rigQS(P){ return [Math.round(clamp(P.sq||1,.7,1.3)*50)/50,Math.round((P.lean||0)*2)/2]; }
function rigXY(P,x,y){ const [s,n]=rigQS(P); return rigMap(s,n,x,y); }
function bigQ(P){ const A=P.arms||[[18,44],[46,44]], r=Math.round, lf=Array.isArray(P.leaf)?P.leaf:[P.leaf||0,P.leaf||0], [s,n]=rigQS(P), e=P.eyes||'open';
  return {a:[r(A[0][0]),r(A[0][1]),r(A[1][0]),r(A[1][1])],f:(P.front||[]).join(''),e,l:r(clamp(P.lid??(e==='fierce'?.35:0),0,1)*8)/8,
    b:r(clamp(P.brow??(e==='fierce'?1:0),-1,1)*4)/4,k:r((P.look||0)*2)/2,m:P.mouth||'smile',lf:[r(lf[0]/3)*3,r(lf[1]/3)*3],s,n,ft:(P.feet||[0,0,0,0]).map(v=>r(v))}; }
function bigEye(g,cx,top,tall,lid,e,side,skin){ g.fillStyle=BIG_INK;
  if(e==='closed'){ const y=top+2; g.fillRect(cx-1,y,3,1); g.fillRect(cx-2,y+1,1,2); g.fillRect(cx+2,y+1,1,2); return; } // contento: ^
  if(lid>=.85){ const y=top+Math.round(tall*.6); g.fillRect(cx-2,y,5,1); g.fillRect(side?cx+3:cx-3,y-1,1,1); return; } // el parpadeo
  g.fillRect(cx-2,top+1,5,tall-2); g.fillRect(cx-1,top,3,tall);
  g.fillStyle='#3c3452'; g.fillRect(cx-1,top+tall-2,3,1);
  g.fillStyle='#ffffff'; g.fillRect(cx-1,top+1,2,e==='wide'?3:2); g.fillRect(cx+1,top+tall-3,1,1);
  const cov=Math.round(lid*tall); if(cov>0){ g.putImageData(skin,0,0,cx-3,top-1,7,cov+1); g.fillStyle='#3a1a0c'; g.fillRect(cx-3,top+cov-1,7,1); } }
function bigBrows(g,E,b){ g.fillStyle='#4a2410'; // b>0: enfado (la punta de dentro baja) · b<0: apuro (sube)
  E.forEach(([cx,top],i)=>{ const d=i?-1:1; for(let j=0;j<5;j++) g.fillRect(cx-3*d+j*d,top-3+Math.round(j*b*.55)-(b<0?1:0),1,2); }); }
function bigMouth(g,m,[mx,my]){ g.fillStyle=BIG_MOUTH;
  if(m==='open'){ g.fillRect(mx-3,my-1,6,4); g.fillRect(mx-2,my-2,4,6); g.fillStyle='#d84848'; g.fillRect(mx-2,my+1,4,2); }
  else if(m==='shout'){ g.fillRect(mx-4,my-2,8,6); g.fillRect(mx-3,my-3,6,8); g.fillStyle='#ffffff'; g.fillRect(mx-3,my-2,6,1); g.fillStyle='#d84848'; g.fillRect(mx-3,my+2,6,2); }
  else if(m==='o'){ g.fillRect(mx-1,my-1,3,3); }
  else if(m==='grin'){ g.fillRect(mx-3,my-1,7,1); g.fillRect(mx-2,my,5,1); g.fillStyle='#ffffff'; g.fillRect(mx-2,my-1,5,1); }
  else if(m==='teeth'){ g.fillRect(mx-4,my-2,9,4); g.fillStyle='#ffffff'; g.fillRect(mx-3,my-1,7,2); g.fillStyle='#c8b4a8'; g.fillRect(mx,my-1,1,2); }
  else if(m==='flat'){ g.fillRect(mx-2,my,5,1); }
  else if(m==='smirk'){ g.fillRect(mx-2,my+1,3,1); g.fillRect(mx+1,my,1,1); g.fillRect(mx+2,my-1,1,1); }
  else { g.fillRect(mx-2,my,1,1); g.fillRect(mx-1,my+1,3,1); g.fillRect(mx+2,my,1,1); } }
function bigSprout(pose){
  const q=bigQ(pose), key=JSON.stringify(q); let c=BIG_CACHE.get(key);
  if(c){ BIG_CACHE.delete(key); BIG_CACHE.set(key,c); return c; } // la caché recuerda lo último que se usó
  const s=q.s, wx=Math.pow(s,-.8), O=BIG_OX, OY=BIG_OY, X=x=>32+(x-32)*wx+O, Y=y=>61-(61-y)*s+OY, P=(x,y)=>[Math.round(X(x)),Math.round(Y(y))];
  const L=(x,y,r,ry)=>({x:X(x),y:Y(y),r:r*wx,ry:(ry||r)*s});
  // 1) el cuerpo, derecho y ya aplastado o estirado (en la geometría: los píxeles salen limpios)
  const B=mkCanvas(BIG_W,BIG_H), g=B.getContext('2d');
  blobArt(g,0,0,BIG_W,BIG_H,[L(25+q.ft[0],58+q.ft[1],5.5,3.2),L(39+q.ft[2],58+q.ft[3],5.5,3.2)],BIG_FOOT,{outline:false,grad:.3,dither:.5}); // los pies
  blobArt(g,0,0,BIG_W,BIG_H,[L(32,48,15.5,9)],BIG_PETO,{outline:false,grad:.45,dither:.35}); // el faldón
  blobArt(g,0,0,BIG_W,BIG_H,[L(32,33,17.5,15.5),L(32,19.5,6,4.5)],BIG_SKIN,{outline:false,grad:.25,dither:.35}); // el bulbo
  g.fillStyle='#6a3a1c'; for(let x=18;x<=46;x++){ const [px,py]=P(x,45-Math.pow((x-32)/14,2)*3.2); g.fillRect(px,py,1,1); } // la costura
  const skin=g.getImageData(0,0,BIG_W,BIG_H); // la piel limpia: los párpados la vuelven a poner encima del ojo
  const lk=q.k*2, tall=q.e==='wide'?9:8, E=[25+lk,39+lk].map(x=>P(x,31-(tall-8)));
  E.forEach(([cx,top],i)=>bigEye(g,cx,top,tall,q.l,q.e,i,skin));
  if(q.b&&q.e!=='closed') bigBrows(g,E,q.b);
  for(const [x,y] of [[18,39],[42,39]]){ const [px,py]=P(x,y); g.fillStyle='rgba(240,120,120,.8)'; g.fillRect(px,py,5,2); g.fillRect(px+1,py-1,3,1); g.fillStyle='rgba(255,220,220,.9)'; g.fillRect(px+1,py,1,1); } // mofletes
  bigMouth(g,q.m,P(32+lk,42));
  const [tx,ty]=P(31,11); g.fillStyle=BIG_LEAF[1]; g.fillRect(tx,ty,2,Math.max(3,Math.round(6*s))); g.fillStyle=BIG_LEAF[3]; g.fillRect(tx,ty,1,Math.max(2,Math.round(5*s))); // el tallo
  const [l1x,l1y]=P(31,12), [l2x,l2y]=P(33,11); bigLeaf(g,l1x,l1y,15,6,-150+q.lf[0],BIG_LEAF); bigLeaf(g,l2x,l2y,15,6,-32+q.lf[1],BIG_LEAF);
  // 2) inclinado: cada fila se corre un poco más cuanto más arriba; las manos van aparte (detrás o delante)
  c=mkCanvas(BIG_W,BIG_H); const h=c.getContext('2d');
  const hand=i=>{ const [hx,hy]=rigMap(s,q.n,q.a[i*2],q.a[i*2+1]), x0=Math.round(hx+O)-5, y0=Math.round(hy+OY)-5;
    blobArt(h,x0,y0,11,11,[{x:hx+O-x0,y:hy+OY-y0,r:3.6,ry:3.2}],BIG_SKIN,{outline:false,grad:.2,dither:.5}); };
  if(!q.f.includes('0')) hand(0); if(!q.f.includes('1')) hand(1);
  for(let y=0;y<BIG_H;y++) h.drawImage(B,0,y,BIG_W,1,Math.round(q.n*(61-(y-OY))/50),y,BIG_W,1);
  for(const ch of q.f) hand(+ch);
  artOutline(h,BIG_W,BIG_H);
  BIG_CACHE.set(key,c); if(BIG_CACHE.size>320) BIG_CACHE.delete(BIG_CACHE.keys().next().value);
  return c; }

/* ---------- las armas en grande (y giradas sin perder el píxel); el guion de cada arma puede traer su propio dibujo (art) ---------- */
const BIGW={};
function bigWeapon(kind){ if(BIGW[kind]) return BIGW[kind]; const own=CA_SCRIPT[kind]; if(own&&own.art) return BIGW[kind]=own.art(); let c, g; const mk=(w,h)=>{ c=mkCanvas(w,h); g=c.getContext('2d'); };
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

/* ---------- herramientas de animación ---------- */
const CA_EASE={lin:k=>k,in:k=>k*k,out:k=>1-(1-k)*(1-k),io:k=>k*k*(3-2*k),in3:k=>k*k*k,out3:k=>1-(1-k)*(1-k)*(1-k),back:k=>easeOutBack(k),step:k=>k<1?0:1};
/* pista de claves: [[t,v],[t,v,'curva'],…]; la curva es la del tramo que llega a esa clave; v es un número o una lista */
function caK(t,K){ if(t<=K[0][0]) return K[0][1];
  for(let i=1;i<K.length;i++){ const [t1,v1,e]=K[i]; if(t<=t1){ const [t0,v0]=K[i-1], k=(CA_EASE[e||'io'])((t-t0)/Math.max(1e-6,t1-t0)); return Array.isArray(v0)?v0.map((a,j)=>a+(v1[j]-a)*k):v0+(v1-v0)*k; } }
  return K[K.length-1][1]; }
/* pista de estados: el último que ya empezó */
function caStep(t,K){ let v=K[0][1]; for(const [t0,x] of K) if(t>=t0) v=x; return v; }
/* rebote amortiguado desde t0 (sale de 0): lo que hacen las hojas y el cuerpo tras un frenazo o un golpe */
function caWob(t,t0,amp,freq,decay){ if(t<t0) return 0; const u=t-t0; return amp*Math.exp(-u/(decay||10))*Math.sin(u*(freq||.5)); }
/* un parpadeo que empieza en t0 */
function caBlinkAt(t,t0){ const u=t-t0; return u<0||u>=5?0:[.5,1,1,.5,.25][u|0]; }
function caSeg(t,a,b){ return clamp((t-a)/(b-a),0,1); }

/* ---------- píxeles nítidos: rayos, líneas de concentración y barridos (nada de bordes suavizados) ---------- */
const CA_POLAR=new Map(), CA_BUF=mkCanvas(VW,VH), CA_BG=CA_BUF.getContext('2d'); let CA_IMG=null;
function caPolar(cx,cy){ const key=cx+','+cy; let m=CA_POLAR.get(key); if(m) return m;
  const A=new Float32Array(VW*VH), D=new Float32Array(VW*VH);
  for(let y=0,i=0;y<VH;y++) for(let x=0;x<VW;x++,i++){ const dx=x+.5-cx, dy=y+.5-cy; A[i]=Math.min(.99999,Math.atan2(dy,dx)/6.283185+.5); D[i]=Math.hypot(dx,dy); }
  m={A,D}; CA_POLAR.set(key,m); if(CA_POLAR.size>40) CA_POLAR.delete(CA_POLAR.keys().next().value); return m; }
function caRaster(fn,alpha){ if(!CA_IMG) CA_IMG=CA_BG.createImageData(VW,VH); fn(CA_IMG.data); CA_BG.putImageData(CA_IMG,0,0);
  if(alpha!==undefined){ ctx.globalAlpha=clamp(alpha,0,1); ctx.drawImage(CA_BUF,0,0); ctx.globalAlpha=1; } else ctx.drawImage(CA_BUF,0,0); }
/* rayos que giran desde (cx,cy): n rayos, rot en vueltas, el borde tramado; colB null = transparente; rmax: se apagan (tramados) antes de ese radio */
function caRays(cx,cy,n,rot,colA,colB,alpha,rmax){ const {A,D}=caPolar(Math.round(cx),Math.round(cy)), a=hex2rgb(colA), b=colB?hex2rgb(colB):null;
  caRaster(d=>{ for(let y=0,i=0;y<VH;y++) for(let x=0;x<VW;x++,i++){ let u=((A[i]+rot)*n)%1; if(u<0) u+=1;
    const m=Math.min(Math.abs(u-.5),u,1-u), sw=m<.06&&BAYER4[y&3][x&3]/16<(1-m/.06)*.5; let c=((u<.5)!==sw)?a:b; const p=i*4;
    if(rmax&&c===a){ const e=(D[i]-rmax*.55)/(rmax*.45); if(e>=1||(e>0&&BAYER4[y&3][x&3]/16<e)) c=b; }
    if(c){ d[p]=c[0]; d[p+1]=c[1]; d[p+2]=c[2]; d[p+3]=255; } else d[p+3]=0; } },alpha); }
/* líneas de concentración (las del manga): cuñas finas que apuntan a (cx,cy) y cambian cada 2 fotogramas */
function caFocus(t,cx,cy,base,cols,n){ const {A,D}=caPolar(Math.round(cx),Math.round(cy)), B=hex2rgb(base), C0=hex2rgb(cols[0]), C1=hex2rgb(cols[1]||cols[0]);
  const N=720, thr=new Float32Array(N).fill(1e9), which=new Uint8Array(N), r=seeded(((t>>1)+3)*7919);
  for(let i=0;i<(n||70);i++){ const a=(r()*N)|0, w=1+((r()*3)|0), r0=30+r()*56, c=r()<.3?1:0;
    for(let j=0;j<w;j++){ const k=(a+j)%N, v=r0+Math.abs(j-(w-1)/2)*10; if(v<thr[k]){ thr[k]=v; which[k]=c; } } }
  caRaster(d=>{ for(let i=0,p=0;i<VW*VH;i++,p+=4){ const k=(A[i]*N)|0, c=D[i]>thr[k]?(which[k]?C1:C0):B; d[p]=c[0]; d[p+1]=c[1]; d[p+2]=c[2]; d[p+3]=255; } }); }
/* barridos entre planos: fila a fila, lo que ya enseña el plano nuevo (k de 0 a 1) */
function caWipeSpans(k,kind){ const out=[];
  for(let y=0;y<VH;y++){
    if(kind==='iris'){ const R=k*112, dy=y+.5-72, h=R*R-dy*dy; if(h>0){ const w=Math.sqrt(h); out.push([y,Math.max(0,Math.round(80-w)),Math.min(VW,Math.round(80+w))]); } }
    else if(kind==='blinds'){ if((y%12)<Math.round(k*12)) out.push([y,0,VW]); }
    else { const f=Math.round(k*(VW+VH*.6))-Math.round((VH-y)*.6); if(f>0) out.push([y,0,Math.min(VW,f)]); } } // 'slash': una diagonal de izquierda a derecha
  return out; }
function caCut(t,t0,dur,drawA,drawB,kind,edge){ // el plano A se va y el B entra por un barrido; edge: color del filo
  if(t<t0){ drawA(); return; } if(t>=t0+dur){ drawB(); return; }
  const S=caWipeSpans((t-t0)/dur,kind); drawA();
  ctx.save(); ctx.beginPath(); for(const [y,a,b] of S) ctx.rect(a,y,b-a,1); ctx.clip(); drawB(); ctx.restore();
  if(edge){ ctx.fillStyle=edge; for(const [y,a,b] of S){ if(b<VW) ctx.fillRect(b-2,y,3,1); if(kind==='iris'&&a>0) ctx.fillRect(a,y,2,1); } } }
/* destello de cuatro puntas */
function caStar(x,y,s,col){ x=Math.round(x); y=Math.round(y); if(s<=0) return; ctx.fillStyle=col||'#ffffff';
  ctx.fillRect(x-s,y,s*2+1,1); ctx.fillRect(x,y-s,1,s*2+1);
  if(s>=3){ ctx.fillRect(x-1,y-1,3,3); const q=Math.round(s*.4); for(let i=2;i<=q+1;i++){ ctx.fillRect(x-i,y-i,1,1); ctx.fillRect(x+i,y-i,1,1); ctx.fillRect(x-i,y+i,1,1); ctx.fillRect(x+i,y+i,1,1); } } }
/* anillo de choque de 1–2 px */
const RING_C=new Map();
function ringArt(r,col,w){ w=w||1; const key=r+'|'+col+'|'+w; let c=RING_C.get(key); if(c) return c; const d=r*2+3; c=mkCanvas(d,d); const g=c.getContext('2d'); g.fillStyle=col;
  for(let y=0;y<d;y++) for(let x=0;x<d;x++){ const e=Math.hypot(x+.5-d/2,y+.5-d/2)-r; if(e>-w&&e<=.5) g.fillRect(x,y,1,1); }
  RING_C.set(key,c); if(RING_C.size>240) RING_C.delete(RING_C.keys().next().value); return c; }

/* ---------- EL PRIMER PLANO: la cara de Sprout grande, dibujada a su tamaño ----------
   Nada de estirar el muñeco: la cara se redibuja a la escala F (3.4 = llena la pantalla), así que la cámara
   se acerca de verdad (F sube) sin que engorden los píxeles; ojos, párpados, cejas, boca y hojas se animan.
   o = { pal, F, dx, dy, eyes:'open'|'wide'|'happy', lid, brow, look, mouth, leaf, glint (fotograma del destello; <0 nada), tint, sweat } */
const CU_BASE=new Map(), CU_LEAF=new Map();
function cuBase(F){ const q=Math.round(F*20)/20; let c=CU_BASE.get(q); if(c) return c;
  c=mkCanvas(170,180); const g=c.getContext('2d'); // el centro del bulbo cae en (85,104)
  blobArt(g,0,0,170,180,[{x:85,y:104,r:17.5*q,ry:15.5*q},{x:85,y:104-13.5*q,r:6*q,ry:4.5*q}],BIG_SKIN,{outline:false,grad:.2,dither:.45});
  artOutline(g,170,180); CU_BASE.set(q,c); if(CU_BASE.size>24) CU_BASE.delete(CU_BASE.keys().next().value); return c; }
function cuLeaf(F,ang){ const q=Math.round(F*10)/10, a=Math.round(ang/3)*3, key=q+'|'+a; let c=CU_LEAF.get(key); if(c) return c;
  const len=15*q, R=Math.ceil(len)+3; c=mkCanvas(R*2+1,R*2+1); const g=c.getContext('2d'); bigLeaf(g,R,R,len,6*q,a,BIG_LEAF); artOutline(g,c.width,c.height);
  CU_LEAF.set(key,c); if(CU_LEAF.size>90) CU_LEAF.delete(CU_LEAF.keys().next().value); return c; }
function cuDisc(cx,cy,rx,ry,col){ ctx.fillStyle=col; const R=Math.ceil(ry); for(let y=-R;y<=R;y++){ const h=1-(y/ry)*(y/ry); if(h<=0) continue; const w=rx*Math.sqrt(h); if(w<.5) continue; ctx.fillRect(Math.round(cx-w),Math.round(cy)+y,Math.max(1,Math.round(w*2)),1); } }
function cuEye(cx,cy,F,lid,eyes,side,base,bx,by){ const rx=2.5*F, ry=(eyes==='wide'?4.4:4)*F, th=Math.max(2,Math.round(F*.62)), R=Math.round(rx); ctx.fillStyle=BIG_INK;
  if(eyes==='happy'){ for(let i=-R;i<=R;i++){ const u=i/rx; ctx.fillRect(Math.round(cx+i),Math.round(cy-(1-u*u)*ry*.42),1,th); } return; } // ^ contento
  if(lid>=.85){ for(let i=-R;i<=R;i++){ const u=i/rx; ctx.fillRect(Math.round(cx+i),Math.round(cy+ry*.3+(1-u*u)*F*.55),1,th); } ctx.fillRect(Math.round(side?cx+rx:cx-rx-2),Math.round(cy+ry*.12),2,2); return; } // parpadeo, con pestaña
  const H=Math.ceil(ry); for(let y=-H;y<=H;y++){ const h=1-(y/ry)*(y/ry); if(h<=0) continue; const w=Math.round(rx*Math.sqrt(h)); if(w<1) continue; ctx.fillStyle=y>ry*.5?'#342c4a':BIG_INK; ctx.fillRect(Math.round(cx)-w,Math.round(cy)+y,w*2,1); }
  cuDisc(cx-.85*F,cy-1.8*F,1.05*F,1.4*F,'#ffffff'); cuDisc(cx+.95*F,cy+2*F,.45*F,.5*F,'#ffffff');
  if(lid>0){ const top=Math.round(cy-ry), cov=Math.round(lid*ry*2), x0=Math.round(cx-rx)-3, w=Math.round(rx*2)+7;
    ctx.drawImage(base,x0-bx,top-2-by,w,cov+2,x0,top-2,w,cov+2); // el párpado: la piel del bulbo, recortada
    const yl=top+cov, hw=Math.round(rx*Math.sqrt(Math.max(0,1-((yl-cy)/ry)**2)))+2; ctx.fillStyle='#3a1a0c'; ctx.fillRect(Math.round(cx)-hw,yl-1,hw*2,th); } }
function cuBrow(cx,top,F,b,side){ const len=Math.round(5.4*F), th=Math.max(2,Math.round(F*.8)), d=side?-1:1; ctx.fillStyle='#4a2410';
  for(let j=0;j<len;j++){ const k=j/(len-1); ctx.fillRect(Math.round(cx-d*2.7*F+d*j),Math.round(top-2.2*F+k*b*1.8*F-(b<0?1.2*F:0)),1,th); } }
function cuMouth(mx,my,F,m){ const K=BIG_MOUTH;
  if(m==='o'){ cuDisc(mx,my+.3*F,.8*F,1*F,K); return; }
  if(m==='flat'){ ctx.fillStyle=K; ctx.fillRect(Math.round(mx-1.4*F),Math.round(my),Math.round(2.8*F),Math.max(2,Math.round(.55*F))); return; }
  if(m==='open'||m==='shout'){ const rx=(m==='shout'?2:1.35)*F, ry=(m==='shout'?1.8:1.25)*F, y=my+.4*F; cuDisc(mx,y,rx,ry,K); cuDisc(mx,y+ry*.5,rx*.62,ry*.4,'#d84848');
    if(m==='shout'){ ctx.fillStyle='#ffffff'; ctx.fillRect(Math.round(mx-rx*.7),Math.round(y-ry+1),Math.round(rx*1.4),Math.max(2,Math.round(F*.4))); } return; }
  if(m==='grin'||m==='teeth'){ const w=Math.round(2*F), h=Math.round((m==='teeth'?1.2:1.4)*F); ctx.fillStyle=K;
    for(let y=0;y<h;y++){ const u=y/h, ww=Math.round(w*(u<.45?1:Math.sqrt(Math.max(0,1-((u-.45)/.6)**2)))); if(ww>0) ctx.fillRect(Math.round(mx)-ww,Math.round(my)-1+y,ww*2,1); }
    ctx.fillStyle='#ffffff'; ctx.fillRect(Math.round(mx)-w+1,Math.round(my),w*2-2,Math.max(2,Math.round(h*.35)));
    if(m==='teeth'){ ctx.fillRect(Math.round(mx)-w+2,Math.round(my)+h-3,w*2-4,Math.max(1,Math.round(h*.22))); ctx.fillStyle='#c8b4a8'; ctx.fillRect(Math.round(mx),Math.round(my),1,h-1); } return; }
  ctx.fillStyle=K;
  if(m==='smirk'){ for(let i=-Math.round(1.4*F);i<=Math.round(1.6*F);i++){ const u=(i+1.4*F)/(3*F); ctx.fillRect(Math.round(mx+i),Math.round(my+.5*F-u*u*1.2*F),1,Math.max(2,Math.round(F*.5))); } return; }
  const w=1.6*F; for(let i=-Math.round(w);i<=Math.round(w);i++){ const u=i/w; ctx.fillRect(Math.round(mx+i),Math.round(my+(1-u*u)*.6*F),1,Math.max(2,Math.round(F*.5))); } } // sonrisa: una U
function caFaceCU(f,o){ const P=o.pal, F=o.F||3.4, fx=80+(o.dx||0), fy=96+(o.dy||0);
  caFocus(f,fx,fy-4,P[1],[P[2],P[3]]);
  const base=cuBase(F), bx=Math.round(fx-85), by=Math.round(fy-104); ctx.drawImage(base,bx,by);
  // el tallo y las dos hojas, grandes, que el aire sacude
  const lf=Array.isArray(o.leaf)?o.leaf:[o.leaf||0,o.leaf||0], sx=Math.round(fx-F), sy=Math.round(fy-22*F), sw=Math.round(2*F), sh=Math.round(6*F);
  ctx.fillStyle=BIG_INK; ctx.fillRect(sx-1,sy-1,sw+2,sh+1); ctx.fillStyle=BIG_LEAF[1]; ctx.fillRect(sx,sy,sw,sh); ctx.fillStyle=BIG_LEAF[3]; ctx.fillRect(sx,sy,Math.max(1,Math.round(F*.8)),sh-2);
  [[-1,-21,-150,0],[1,-22,-32,1]].forEach(([ox,oy,a0,i])=>{ const img=cuLeaf(F,a0+lf[i]), R=(img.width-1)/2; ctx.drawImage(img,Math.round(fx+ox*F-R),Math.round(fy+oy*F-R)); });
  // la cara
  const eyes=o.eyes||'open', lk=(o.look||0)*1.2*F, E=[[fx-7*F+lk,fy+1.5*F],[fx+7*F+lk,fy+1.5*F]];
  E.forEach(([x,y],i)=>cuEye(x,y,F,o.lid||0,eyes,i,base,bx,by));
  if(o.brow&&eyes!=='happy') E.forEach(([x,y],i)=>cuBrow(x,y-(eyes==='wide'?4.4:4)*F,F,o.brow,i));
  for(const s of [-1,1]){ const x=fx+s*12*F+lk*.4, y=fy+6.5*F; cuDisc(x,y,2.6*F,1.05*F,'rgba(240,112,112,.7)'); ctx.fillStyle='rgba(255,228,228,.85)'; ctx.fillRect(Math.round(x-1.3*F),Math.round(y-.5*F),Math.round(F*.8),Math.max(1,Math.round(F*.3))); }
  cuMouth(fx+lk*.8,fy+9*F,F,o.mouth||'smile');
  if(o.sweat!==undefined){ const x=Math.round(fx+15*F), y=Math.round(fy-8*F+o.sweat); cuDisc(x,y,1.1*F,1.5*F,'#9ad4f8'); ctx.fillStyle='#ffffff'; ctx.fillRect(x-1,y-2,2,2); ctx.fillStyle='#9ad4f8'; ctx.fillRect(x,y-Math.round(2.4*F),1,Math.round(F)); }
  if(o.glint>=0&&o.glint<9){ const [x,y]=E[0]; caStar(x-.85*F,y-1.8*F,[1,3,5,7,6,4,3,2,1][o.glint|0],'#ffffff'); }
  if(o.tint){ ctx.fillStyle=o.tint; ctx.fillRect(0,0,VW,VH); } }

/* ---------- el motor: tiempos, muñeco en pantalla, partículas, golpes ---------- */
const CA_TITLE=150, CA_T=350; // 2,5 s de acción y 3,3 s de título (Z acorta cada parte)
let cineArm=null;
function startCineArm(kind){ cineArm={kind,t:0,ft:0,hold:0,inv:0,parts:[],shake:0,shake0:0,chars:0,rng:seeded(kind.length*97+13)}; }
/* un golpe: congela unos fotogramas (hit-stop), negativo, temblor con dirección, sonido */
function caHit(C,h){ if(h.stop) C.hold=h.stop; if(h.inv) C.inv=h.inv; if(h.shake){ C.shake=C.shake0=h.shake; C.shakeA=h.amp||3; C.shakeDir=h.dir||[.6,1]; } if(h.sfx) try{ h.sfx(C); }catch(_){} }
function caHeroAt(pose,fx,fy,o){ if(o&&(o.sx||o.sy)&&pose.sq===undefined) pose=Object.assign({},pose,{sq:o.sy||1}); // compatible con los guiones de antes
  const X0=Math.round(fx)-32, Y0=Math.round(fy)-61; ctx.drawImage(bigSprout(pose),X0-BIG_OX,Y0-BIG_OY);
  return (x,y)=>{ const [a,b]=rigXY(pose,x,y); return [X0+a,Y0+b]; }; } // del muñeco a la pantalla
function caHand(pose,fx,fy,i){ const A=pose.arms||[[18,44],[46,44]], [a,b]=rigXY(pose,A[i][0],A[i][1]); return [Math.round(fx)-32+a,Math.round(fy)-61+b]; } // la mano i, sin dibujar
function caShadow(fx,fy,r){ ctx.fillStyle='rgba(10,20,10,.3)'; for(let y=-2;y<=2;y++){ const w=Math.round(r*Math.sqrt(1-(y*y)/6.5)); ctx.fillRect(Math.round(fx-w),Math.round(fy+y),w*2,1); } }
function caLeafPart(x,y,vx,vy,cols){ cineArm.parts.push({k:'leaf',x,y,vx,vy,g:.05,fr:.985,t:0,life:70+((Math.random()*30)|0),rot:Math.random()*6,vr:(Math.random()-.5)*.35,col:cols[(Math.random()*cols.length)|0]}); }
function caSpark(x,y,col){ cineArm.parts.push({k:'spark',x,y,vx:0,vy:0,t:0,life:14,col:col||'#ffffff'}); }
/* partículas: leaf, petal, spark, star, ring (anillo de choque), smoke, streak, dot */
function caParts(C){ for(const p of C.parts){ const x=Math.round(p.x), y=Math.round(p.y), k=p.t/p.life;
  if(p.k==='leaf'){ const c=Math.cos(p.rot), s=Math.sin(p.rot); ctx.fillStyle='#10301a'; ctx.fillRect(x-1,y-1,4,3); ctx.fillStyle=p.col; ctx.fillRect(x,y,2,1); ctx.fillRect(x+Math.round(c),y+Math.round(s),1,1); ctx.fillRect(x-Math.round(c),y-Math.round(s),1,1); }
  else if(p.k==='petal'){ const f=((p.t>>2)+(p.ph||0))&3; ctx.fillStyle=p.col; if(f===0) ctx.fillRect(x,y,2,1); else if(f===1) ctx.fillRect(x,y,1,2); else if(f===2) ctx.fillRect(x,y,2,2); else ctx.fillRect(x,y,1,1); }
  else if(p.k==='spark'){ const s=Math.round((1-k)*6)+1; ctx.fillStyle=p.col; ctx.fillRect(x-s,y,s*2+1,1); ctx.fillRect(x,y-s,1,s*2+1); if(k<.5){ ctx.fillRect(x-1,y-1,3,3); } }
  else if(p.k==='star') caStar(x,y,Math.round(Math.sin(Math.PI*Math.min(1,k))*(p.s||4)),p.col);
  else if(p.k==='ring'){ const r=Math.max(1,Math.round(lerp(p.r0||4,p.r1||30,CA_EASE.out(k)))); ctx.globalAlpha=Math.max(0,1-k*1.15); ctx.drawImage(ringArt(r,p.col||'#ffffff',p.w||1),x-r-1,y-r-1); ctx.globalAlpha=1; }
  else if(p.k==='smoke'){ const r=Math.max(1,Math.round(lerp(p.r0||2,p.r1||8,CA_EASE.out(k)))); ctx.globalAlpha=Math.max(0,(p.a||.9)*(1-k)); ctx.drawImage(disc(r,p.col||'#b0a4a0'),x-r,y-r); ctx.globalAlpha=1; }
  else if(p.k==='streak'){ ctx.globalAlpha=Math.max(0,1-k); ctx.fillStyle=p.col; const L=p.len||8, a=Math.atan2(p.vy,p.vx); for(let i=0;i<L;i++) ctx.fillRect(Math.round(x-Math.cos(a)*i),Math.round(y-Math.sin(a)*i),1,1); ctx.globalAlpha=1; }
  else if(p.k==='dot'){ ctx.globalAlpha=1-k; ctx.fillStyle=p.col; ctx.fillRect(x,y,p.s||1,p.s||1); ctx.globalAlpha=1; } } }
function caBars(h){ ctx.fillStyle='#000'; ctx.fillRect(0,0,VW,h); ctx.fillRect(0,VH-h,VW,h); }
function caBigText(s,col){ const w=textW(s)+2, c=mkCanvas(w+2,14), g=c.getContext('2d'); // texto con contorno grueso, para ponerlo a ×2
  for(const [dx,dy] of [[-1,0],[1,0],[0,-1],[0,1],[1,1],[-1,1],[1,-1],[-1,-1]]) drawText(g,s,2+dx,4+dy,'#0a0806','left',FONT_M);
  drawText(g,s,2,5,'#0a0806','left',FONT_M); drawText(g,s,2,4,col,'left',FONT_M); return c; }
const CA_BIGTXT=new Map();
function caBigText2(s,col){ const key=s+'|'+col; let c=CA_BIGTXT.get(key); if(c) return c; const a=caBigText(s,col); c=mkCanvas(a.width*2,28); const g=c.getContext('2d'); g.imageSmoothingEnabled=false; g.drawImage(a,0,0,a.width,14,0,0,a.width*2,28); CA_BIGTXT.set(key,c); return c; }
function caShine(img,x,y,k){ // un brillo en diagonal que cruza las letras
  const w=img.width, h=img.height; CA_BG.clearRect(0,0,w,h); CA_BG.drawImage(img,0,0); CA_BG.globalCompositeOperation='source-atop'; CA_BG.fillStyle='rgba(255,255,255,.9)';
  const f=Math.round(-24+k*(w+48)); for(let yy=0;yy<h;yy++) CA_BG.fillRect(f+Math.round((h-yy)*.5),yy,5,1);
  CA_BG.globalCompositeOperation='source-over'; ctx.drawImage(CA_BUF,0,0,w,h,x,y,w,h); }
const CA_NAMES={blade:['HOJA','ANCESTRAL'],bomb:['BELLOTA','BOMBA'],hook:['RAÍZ','GANCHO'],boomer:['VAINA','VOLADORA'],lantern:['FAROL','DE BRASA'],feather:['VILANO','DE PETRA'],shield:['ESCUDO','DE CORTEZA'],molinillo:['MOLINILLO']};

/* ---------- el título: Sprout entra de un salto y alza el arma; el nombre cae de golpe; la frase se queda ---------- */
function caTitleHero(f,C){ const S=CA_SCRIPT[C.kind]||{}; if(S.heroTitle) return S.heroTitle(f,C);
  const L0=15, air=f<L0, ready=f>=L0+13, up=caK(f,[[L0,0],[L0+5,-.35,'out'],[L0+13,1,'back']]);
  const fy=Math.round(caK(f,[[0,196],[9,100,'out'],[L0,124,'in']]));
  const sq=air?(f<9?1.14:1.04):f<L0+16?1+caWob(f,L0,-.2,.6,5):1+Math.round(Math.sin((f-L0)*.075))*.02; // cae, se aplasta y después respira
  const pose={eyes:air?'closed':ready?'fierce':'open',lid:ready?Math.max(.35,caBlinkAt(f,112),caBlinkAt(f,196)):0,brow:ready?1:0,mouth:air?'o':ready?'grin':'open',
    arms:air?[[14,34],[50,34]]:[[Math.round(lerp(18,16,up)),Math.round(lerp(46,42,up))],[Math.round(lerp(48,50,up)),Math.round(lerp(42,14,up))]],
    leaf:Math.round(caK(f,[[0,18],[L0,18],[L0+3,-16,'out']])+caWob(f,L0+3,14,.45,9)+Math.sin(f*.09)*4),sq};
  caShadow(80,125,air?9:16);
  const T=caHeroAt(pose,80,fy), [hx,hy]=T(pose.arms[1][0],pose.arms[1][1]); caHeld(C.kind,hx,hy,f);
  const g=(f-(L0+13))/14; if(g>=0&&g<1){ ctx.fillStyle='#ffffff'; for(let i=0;i<8;i++){ const a=i/8*6.283+.2, r0=5+g*12, r1=r0+7*(1-g); for(let r=r0;r<r1;r++) ctx.fillRect(Math.round(C.gx+Math.cos(a)*r),Math.round(C.gy+Math.sin(a)*r),1,1); } caStar(C.gx,C.gy,Math.round((1-g)*7),'#ffffff'); } } // ¡destello al alzarla!
function caTitle(f,C){ const A=MOMENT_ARMS[C.kind], P=A.pal;
  caRays(80,86,14,f*.0018,P[1],shade(P[1],-.28));
  ctx.fillStyle=P[2]; for(let i=0;i<24;i++){ const a=i/24*6.283+(i%3)*.05, r0=44+((i*7+f)%9); for(let r=r0;r<120;r+=2) ctx.fillRect(Math.round(80+Math.cos(a)*r),Math.round(86+Math.sin(a)*r*.9),1,1); } // líneas de velocidad
  caTitleHero(f,C);
  // el nombre, enorme: cada línea cae de golpe, rebota un poco y un brillo lo cruza
  const N=CA_NAMES[C.kind]||[ITEM_NAMES[C.kind]||''];
  N.forEach((s,i)=>{ const f0=16+i*6, d=caSeg(f,f0,f0+8); if(d<=0) return; const img=caBigText2(s,i?P[3]:'#fffbe8'), x=Math.round(80-img.width/2);
    const y=Math.round(16+i*16-(1-CA_EASE.out3(d))*34+(d>=1?caWob(f,f0+8,-3,.9,3):0));
    if(f>=46&&f<64) caShine(img,x,y,(f-46)/18); else ctx.drawImage(img,x,y); });
  // la frase, a máquina, en la franja de abajo; cuando está entera, ▼
  const bh=Math.round(26*CA_EASE.out(caSeg(f,2,10))); ctx.fillStyle='#000'; ctx.fillRect(0,VH-bh,VW,bh); ctx.fillStyle=P[1]; if(bh>1) ctx.fillRect(0,VH-bh,VW,1);
  if(C.chars>0){ let n=Math.floor(C.chars); wrapPx(A.line,150).slice(0,2).forEach((ln,i)=>{ const s=ln.slice(0,Math.max(0,n)); n-=ln.length+1; if(s) txtOL(s,80,VH-22+i*10,'#fffbe8','center','#000'); });
    if(C.chars>=A.line.length&&((f>>4)&1)){ ctx.fillStyle=P[3]; ctx.fillRect(149,VH-7,5,1); ctx.fillRect(150,VH-6,3,1); ctx.fillRect(151,VH-5,1,1); } } }
function caTitleTick(f,C){ const P=MOMENT_ARMS[C.kind].pal, R=C.rng;
  if(f===1) SFX.momentFreeze(); if(f===9) SFX.fanfare(); if(f===28) SFX.shing();
  if(f===24||f===30){ caThud(f===30); C.shake=C.shake0=4; C.shakeA=1.5; C.shakeDir=[0,1]; }
  if(f%3===0) C.parts.push({k:'dot',x:8+R()*144,y:VH-24,vx:(R()-.5)*.3,vy:-.5-R()*.9,g:0,t:0,life:70+((R()*40)|0),col:R()<.5?P[3]:'#ffffff',s:R()<.2?2:1});
  if(f>=40&&f%56===40) C.parts.push({k:'star',x:C.gx||80,y:C.gy||40,vx:0,vy:0,t:0,life:14,s:5,col:'#ffffff'}); }
function caThud(hi){ const a=audio(), t=a.currentTime; beep('triangle',hi?150:118,42,.16,.06,t); noise(.06,.03,false,t,900); }
/* cada arma en la mano, en alto */
function caHeld(kind,hx,hy,f){ const C=cineArm, S=CA_SCRIPT[kind]; C.gx=hx; C.gy=hy-18;
  if(S&&S.held){ S.held(hx,hy,f,C); return; } // el guion puede decir cómo se sostiene (y dónde brilla: C.gx, C.gy)
  if(kind==='blade'){ drawBlade(hx,hy,-84); C.gx=hx+1; C.gy=hy-26; return; }
  const img=bigWeapon(kind); ctx.drawImage(img,Math.round(hx-img.width/2),Math.round(hy-img.height+6)); }

/* ---------- (compatibilidad) el primer plano de antes: ahora se acerca, frunce el ceño y destella ---------- */
function caFaceCut(f,pose,P,tint){ const fierce=pose.eyes==='fierce';
  caFaceCU(f,{pal:P,F:caK(f,[[0,3],[6,3.4,'out']]),dx:caK(f,[[0,3],[12,-2,'io']]),eyes:pose.eyes==='closed'?'happy':pose.eyes==='wide'?'wide':'open',
    lid:fierce?caK(f,[[2,0],[7,.38,'io']]):0,brow:fierce?caK(f,[[2,0],[7,1,'io']]):0,look:pose.look||0,mouth:pose.mouth,leaf:(pose.leaf||0)+Math.sin(f*.55)*8,glint:f-3,tint}); }

/* ---------- recursos de rodaje ---------- */
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


/* ---------- los guiones de cada arma ----------
   Cada guion: draw(t,C) pinta el fotograma t (0..CA_TITLE) y solo depende de t; tick(t,C) suelta partículas;
   cues{t:fn} suenan al llegar a t; hits{t:{stop,inv,shake,amp,dir,sfx}} son los golpes (congelado, negativo y temblor).
   Opcionales: art() el dibujo grande del arma · held(hx,hy,f,C) cómo se sostiene en el título (y dónde brilla: C.gx, C.gy)
   · heroTitle(f,C) el plano entero del héroe en el título. Las piezas propias de cada arma (planos, ayudantes, sonidos)
   viven dentro de su guion, entre sus dos rayas. */
const CA_SCRIPT={
  /* ═════════ blade ═════════ */
  blade:{ // la Hoja: llega corriendo al valle en primavera, frena en seco, primer plano (se pone seria), tajo con golpe y la alza al cielo
    cues:{ 2:()=>SFX.swoosh(), 27:()=>SFX.land(), 45:()=>swish(.35,.03,300,900,500), 57:()=>SFX.shing(), 64:()=>swish(.14,.1,900,4600,2600),
      75:()=>SFX.charge(), 82:()=>SFX.sword(), 119:()=>swish(.22,.05,600,2200,1400), 132:()=>SFX.chime() },
    hits:{ 85:{stop:4,inv:1,shake:12,amp:3,dir:[1,.4],sfx:()=>{ SFX.leafHit(); SFX.cut(); }} },
    tick(t,C){ const R=C.rng;
      if(t%5===0) C.parts.push({k:'petal',x:-4,y:16+R()*84,vx:.9+R()*.8,vy:.1+R()*.25,g:.002,fr:1,t:0,life:210,ph:(R()*4)|0,col:R()<.6?'#f8a8d0':'#fff4f8'}); // pétalos de primavera
      if(t<25&&t%4===0) caDust(this.runX(t)-4,119,2,'#e8dcb8');
      if(t>=27&&t<33) caDust(this.runX(t)+(t&1?8:-8),119,3,'#e8dcb8'); // el frenazo
      if(t===85){ const cx=this.strikeX(t), cy=88; // el tajo: hojas por el aire, anillos y chispas
        for(let i=0;i<30;i++){ const a=-2.6+R()*3.6, s=1.2+R()*2.6; caLeafPart(cx+Math.cos(a)*30,cy+Math.sin(a)*22,Math.cos(a)*s,Math.sin(a)*s-1.1,['#46a63c','#7ed64e','#c6f68e','#226e2a']); }
        C.parts.push({k:'ring',x:cx,y:cy,r0:10,r1:52,t:0,life:16,col:'#f4ffe0',w:2},{k:'ring',x:cx,y:cy,r0:4,r1:32,t:0,life:12,col:'#7ed64e'});
        for(let i=0;i<6;i++) C.parts.push({k:'star',x:cx+(R()-.5)*70,y:cy+(R()-.5)*44,vx:0,vy:0,t:0,life:10+((R()*8)|0),s:3+((R()*3)|0),col:'#ffffff'}); }
      if(t===134){ const [x,y]=this.tip(t); C.parts.push({k:'star',x,y,vx:0,vy:0,t:0,life:20,s:9,col:'#ffffff'},{k:'ring',x,y,r0:2,r1:24,t:0,life:14,col:'#fffbe0'}); }
      if(t>=124&&t%3===0){ const [x,y]=this.tip(t); C.parts.push({k:'petal',x:x+(R()-.5)*50,y:y+10+R()*50,vx:(R()-.5)*.6,vy:-.4-R()*.5,g:0,fr:1,t:0,life:60,ph:(R()*4)|0,col:R()<.5?'#fffbe0':'#c6f68e'}); } },
    draw(t,C){
      if(t<44) this.run(t); else caCut(t,64,7,()=>this.face(t),()=>this.strike(t),'slash','#ffffff');
      if(t>=144){ ctx.fillStyle='rgba(255,255,244,'+((t-143)/7).toFixed(2)+')'; ctx.fillRect(0,0,VW,VH); } },
    /* plano 1: entra corriendo (la cámara lo sigue), frena en seco, mira a un lado y a otro */
    runX(t){ return Math.round(caK(t,[[0,-36],[27,76,'out']])); },
    run(t){ const p=t*.5, running=t<26, x=this.runX(t);
      drawSeasonScene(0,t,caK(t,[[0,0],[34,64,'out']]));
      const bob=running?Math.round(Math.abs(Math.sin(p))*2):0, sw=Math.round(Math.sin(p)*3);
      const pose={eyes:running?'open':t<31?'wide':'open',lid:caBlinkAt(t,40),mouth:running?'open':t<31?'o':'smile',look:caStep(t,[[0,0],[34,-1],[38,1],[42,0]]),
        arms:running?[[18,44+sw],[48,46-sw]]:t<34?[[13,38],[51,42]]:[[18,44],[48,46]],
        leaf:running?Math.round(-16+Math.sin(p*2)*4):Math.round(-16*Math.exp(-(t-26)/5)+caWob(t,26,26,.5,8)+Math.sin(t*.08)*4),
        sq:running?1+.05*Math.cos(p*2):caK(t,[[26,1],[28,.86,'out'],[33,1.05,'io'],[38,1,'io']]),
        lean:running?4:caK(t,[[26,4],[28,-5,'out'],[38,0,'io']])+caWob(t,38,1.2,.6,5),
        feet:running?[Math.round(Math.cos(p)*2),Math.min(0,Math.round(Math.sin(p)*3)),Math.round(-Math.cos(p)*2),Math.min(0,Math.round(-Math.sin(p)*3))]:t<34?[-2,0,2,0]:[0,0,0,0]};
      caShadow(x,119,15);
      const [hx,hy]=caHand(pose,x,118-bob,1); drawBlade(hx,hy,running?118+Math.sin(p)*10:caK(t,[[26,118],[30,150,'out'],[40,62,'io']])); // la Hoja, detrás
      caHeroAt(pose,x,118-bob);
      const fs=Math.round(caK(t,[[0,0],[34,150,'out']])), F=PARA[0].fore; ctx.drawImage(F,-(fs%320),114); ctx.drawImage(F,320-(fs%320),114); }, // matas que pasan por delante
    /* plano 2: primer plano; parpadea, frunce el ceño y le brilla el ojo */
    face(t){ const f=t-44;
      const F=caK(f,[[0,2.9],[7,3.45,'out'],[27,3.8,'io']]);
      caFaceCU(f,{pal:MOMENT_ARMS.blade.pal,F,dy:(3.4-F)*1.5,dx:caK(f,[[0,5],[26,-3,'io']]),eyes:'open',
        lid:Math.max(caBlinkAt(f,4),caK(f,[[9,0],[15,.38,'io']])),brow:caK(f,[[9,0],[15,1,'io']]),look:caK(f,[[0,-.6],[4,0,'io']]),
        mouth:f<11?'smile':'flat',leaf:Math.round(-8+Math.sin(f*.55)*9),glint:f-12});
      if(f<3){ ctx.fillStyle='rgba(255,255,244,'+(.7-f*.25).toFixed(2)+')'; ctx.fillRect(0,0,VW,VH); } },
    /* plano 3: tajo (amago, golpe, sobrepaso, asiento) y la alza al cielo */
    strikeX(t){ return Math.round(caK(t,[[64,80],[80,83,'io'],[85,73,'out3'],[100,76,'io'],[150,78,'io']])); },
    strikePose(t){ const fr=t>=82&&t<104;
      return {eyes:caStep(t,[[0,'fierce'],[92,'open'],[118,'closed'],[128,'open']]),
        lid:t<92?caK(t,[[74,.35],[80,.5],[85,.3]]):caBlinkAt(t,141),brow:t<92?1:caK(t,[[92,1],[98,0]]),
        mouth:caStep(t,[[0,'flat'],[74,'teeth'],[82,'shout'],[92,'grin'],[112,'smile'],[118,'grin']]),
        arms:[caK(t,[[64,[18,42]],[80,[22,38],'io'],[85,[26,40],'out3'],[100,[18,44],'io'],[118,[16,46],'io'],[126,[14,40],'back']]),
          caK(t,[[64,[52,18]],[74,[52,18]],[80,[54,12],'io'],[82,[54,12]],[85,[14,50],'out3'],[90,[12,52],'out'],[100,[14,50],'io'],[112,[48,48],'io'],[118,[50,52],'io'],[126,[50,8],'back']])],
        front:fr?[1]:[],
        leaf:Math.round(caK(t,[[64,-6],[74,-6],[80,-14,'io'],[82,-14],[85,18,'out3']])+caWob(t,85,10,.5,9)+caWob(t,126,-12,.45,9)+Math.sin(t*.08)*4),
        sq:caK(t,[[64,1],[74,1],[80,.9,'io'],[82,.9],[85,1.1,'out3'],[90,.93,'out'],[100,1,'io'],[112,1],[118,.93,'io'],[126,1.07,'back'],[134,1,'io']]),
        lean:caK(t,[[64,0],[74,0],[80,-3,'io'],[82,-3],[85,5,'out3'],[91,3,'out'],[102,0,'io']])+caWob(t,126,1,.5,6),
        feet:fr?[-2,0,3,0]:[0,0,0,0]}; },
    bladeDeg(t){ return caK(t,[[64,-118],[74,-118],[80,-142,'io'],[82,-142],[85,150,'out3'],[90,168,'out'],[100,150,'io'],[112,70,'io'],[118,100,'io'],[126,-90,'back']]); },
    tip(t){ const x=this.strikeX(t), [hx,hy]=caHand(this.strikePose(t),x,118,1), a=this.bladeDeg(t)*Math.PI/180; return [hx+Math.cos(a)*33,hy+Math.sin(a)*33]; },
    strike(t){ const x=this.strikeX(t), pose=this.strikePose(t), deg=this.bladeDeg(t), a=deg*Math.PI/180, [hx,hy]=caHand(pose,x,118,1);
      drawSeasonScene(0,t,64+(t-64)*.15);
      if(t>=122){ const [tx,ty]=this.tip(t), k=Math.min(1,(t-122)/12); caRays(tx,ty,14,t*.004,'#fffbe8',null,.5*k,30+46*k); glowAt(tx,ty,26*k,'rgba(255,252,220,.55)'); } // la punta se enciende: un sol pequeño
      caShadow(x,119,15);
      if(t>=82&&t<97){ const a1=Math.min(deg,168); caSmear(x,88,Math.max(-142,a1-150)*Math.PI/180,a1*Math.PI/180,t<86?1:1-caSeg(t,86,97)); } // la estela: el tramo que acaba de barrer la punta
      const behind=!pose.front.includes(1); if(behind) drawBlade(hx,hy,deg);
      caHeroAt(pose,x,118);
      if(!behind) drawBlade(hx,hy,deg);
      if(t===78||t===79) caStar(hx+Math.cos(a)*30,hy+Math.sin(a)*30,3,'#fffbe0'); // el filo brilla antes del tajo
      if(t>=126&&t<136){ const r=4+(t-126)/10*28; caStar(hx+Math.cos(a)*r,hy+Math.sin(a)*r,2,'#ffffff'); } } }, // la luz recorre la hoja
  /* ═════════ bomb ═════════ */
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

  /* ═════════ hook ═════════ */
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

  /* ═════════ boomer ═════════ */
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

  /* ═════════ lantern ═════════ */
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

  /* ═════════ feather ═════════ */
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

  /* ═════════ shield ═════════ */
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

  /* ═════════ molinillo ═════════ */
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
  /* ═════════ fin ═════════ */
};
/* la estela grande de la Hoja: media luna verde con el filo blanco (respeta el temblor y los barridos) */
function caSmear(cx,cy,a0,a1,alpha,cols){ if(alpha<=0) return; const r0=26, r1=46, span=a1-a0; if(span<=.05) return;
  const C=cols||['70,166,60','126,214,78','198,246,142','255,255,240'], X=Math.floor(cx), Y=Math.floor(cy);
  for(let y=-r1;y<=r1;y++) for(let x=-r1;x<=r1;x++){ const dx=x+.5+X-cx, dy=y+.5+Y-cy, r=Math.hypot(dx,dy); if(r<r0||r>r1) continue;
    let a=Math.atan2(dy,dx); while(a<a0) a+=6.283; if(a>a1) continue; const along=(a-a0)/span, edge=(r-r0)/(r1-r0);
    if(along<.25&&((x+y)&1)) continue; const ci=along>.92?3:edge>.8?2:edge>.45?1:0, al=alpha*(ci===3?1:.85)*(r<r0+3?.6:1);
    ctx.fillStyle='rgba('+C[ci]+','+al.toFixed(2)+')'; ctx.fillRect(X+x,Y+y,1,1); } }
function updCineArm(){ const C=cineArm, S=CA_SCRIPT[C.kind]||CA_SCRIPT.blade, L=MOMENT_ARMS[C.kind].line.length;
  C.ft++; if(C.inv>0) C.inv--; if(C.shake>0) C.shake--; if(C.shake>(C.shake0||0)) C.shake0=C.shake; if(C.shake<=0) C.shake0=0;
  if(C.hold>0) C.hold--; // el congelado de un golpe: el tiempo del plano no avanza (las partículas sí)
  else { C.t++; const f=C.t-CA_TITLE;
    const cue=S.cues&&S.cues[C.t]; if(cue) try{ cue(C); }catch(_){}
    const hit=S.hits&&S.hits[C.t]; if(hit) caHit(C,hit);
    if(S.tick&&C.t<CA_TITLE) S.tick(C.t,C); // el ambiente de cada plano no pasa al título
    if(f===0){ C.parts=C.parts.filter(p=>p.k==='star'||p.k==='spark'); C.hold=0; C.inv=0; }
    if(f>=0) caTitleTick(f,C);
    if(f>=26&&C.chars<L){ C.chars=Math.min(L,C.chars+1); if((C.chars|0)%3===0) beep('triangle',1320,1100,.025,.012); } } // a máquina, con su tecleo
  for(const p of C.parts){ p.x+=p.vx; p.y+=p.vy; p.vy+=p.g||0; if(p.fr){ p.vx*=p.fr; p.vy*=p.fr; } if(p.k==='petal') p.vx+=Math.sin((p.t+(p.ph||0)*9)*.15)*.03; p.t++; if(p.rot!==undefined) p.rot+=p.vr||0; }
  C.parts=C.parts.filter(p=>p.t<p.life&&p.y<VH+8&&p.x>-20&&p.x<VW+20);
  if(keys.fire&&C.t>10){ keys.fire=false; // Z: al título · la frase entera · se acabó
    if(C.t<CA_TITLE){ C.t=CA_TITLE; C.parts=[]; C.hold=0; C.inv=0; C.shake=0; }
    else if(C.chars<L) C.chars=L; else C.t=CA_T; }
  return C.t>=CA_T; }
function drawCineArm(){ const C=cineArm; if(!C) return; const S=CA_SCRIPT[C.kind]||CA_SCRIPT.blade, t=C.t, A=MOMENT_ARMS[C.kind];
  ctx.fillStyle='#000'; ctx.fillRect(0,0,VW,VH);
  ctx.save(); if(C.shake>0&&opts.shake){ const k=C.shake/Math.max(1,C.shake0||C.shake), a=(C.shakeA||2)*k, d=C.shakeDir||[.7,1], w=Math.sin(C.ft*2.6); ctx.translate(Math.round(d[0]*a*w),Math.round(d[1]*a*w)); } // temblor con dirección que se apaga
  if(t<CA_TITLE){ S.draw(t,C); caParts(C); } else { caTitle(t-CA_TITLE,C); caParts(C); }
  ctx.restore();
  if(C.inv>0){ ctx.globalCompositeOperation='difference'; ctx.fillStyle='#ffffff'; ctx.fillRect(0,0,VW,VH); ctx.globalCompositeOperation='source-over'; } // el fotograma en negativo del golpe
  if(t<CA_TITLE) caBars(12); else { const f=t-CA_TITLE; ctx.fillStyle='#000'; ctx.fillRect(0,0,VW,12); if(f>=6) txtS(A.tag.slice(0,Math.max(0,(f-6)*2)),80,4,A.pal[3],'center'); }
  const fl=t<7?1-t/7:t>=CA_TITLE&&t<CA_TITLE+6?1-(t-CA_TITLE)/6:t>CA_T-10?(t-(CA_T-10))/10:0; // fogonazos: al entrar, al cortar al título y al salir
  if(fl>0){ ctx.fillStyle='rgba(255,255,244,'+fl.toFixed(2)+')'; ctx.fillRect(0,0,VW,VH); } }
