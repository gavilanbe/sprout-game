'use strict';
/* ============================================================
   EL MOLINO DE LA HOJARASCA (mazmorra 4 · el Otoño): sus presentaciones (contrato en 15i)
   · DNG_CARD.molino    el título: un remolino de hojas cruza, cae una tabla colgada de dos cuerdas,
                        las aspas giran en el medallón y el nombre cae letra a letra.
   · BOSS_INTRO.scare   el Espantapájaros: clavado, con dos cuervos en los brazos; se le encienden
                        los ojos, los cuervos huyen, se arranca del suelo a saltos, gira y planta.
   · BOSS_INTRO.ciervo  el Ciervo de Ámbar: duerme bajo un montón de hojarasca; abre un ojo, revienta
                        el montón, brama (la cornamenta arde en ámbar) y su nombre sobre una guirnalda.
   · BOSS_OUTRO.ciervo  con el Ámbar: un remolino de hojas te arranca del suelo, una cortina de hojas
                        te saca del molino y caes en un montón de hojarasca a la puerta, en la Ciénaga.
   Todo a tamaño nativo; draw(t) solo depende de t (las partículas y los sonidos van en tick).
   ============================================================ */
const ML_AUT=['#5a200a','#9a3c14','#d06a24','#eea040','#fcd878'];   // hojas: de la más tostada a la más clara
const ML_INK='#1c0e06';
const ML_WOOD=['#2a1508','#5a3218','#7c4a24','#9c643a','#c08850'];
function mlR(i,k){ return (hash(i*7+3,k*13+1)%1000)/1000; }          // azar fijo por índice
function mlSeg(t,a,b){ return clamp((t-a)/(b-a),0,1); }
/* una hoja de 3 px que da vueltas (ph: fase de giro) */
function mlLeaf(x,y,ph,col,dk){ x=Math.round(x); y=Math.round(y); const f=((Math.floor(ph)%4)+4)%4; ctx.fillStyle=col;
  if(f===0){ ctx.fillRect(x+1,y,2,1); ctx.fillRect(x,y+1,3,1); ctx.fillRect(x+1,y+2,1,1); }
  else if(f===1){ ctx.fillRect(x,y+1,3,1); }
  else if(f===2){ ctx.fillRect(x,y,2,1); ctx.fillRect(x,y+1,3,1); ctx.fillRect(x+1,y+2,1,1); }
  else { ctx.fillRect(x+1,y,1,1); ctx.fillRect(x,y+1,2,1); ctx.fillRect(x+1,y+2,2,1); }
  if(dk&&f!==1){ ctx.fillStyle=dk; ctx.fillRect(x+1,y+1,1,1); } }
/* hojas grandes con contorno (para cortinas y guirnaldas), en dos giros y cuatro tonos */
const ML_BIG=(()=>{ const rows=[['..kk..','.kOOk.','kOoOOk','kOOoOk','.kOOk.','..kk..','..k...'],['......','.kkk..','kOOOkk','kOooOOk'.slice(0,6),'.kkOOk','...kk.','......']];
  const mk=P=>{ const out=[]; for(let c=1;c<5;c++) out.push(rows.map(r=>sprN(r,{O:P[c],o:P[c-1]}))); return out; };
  const A=mk(ML_AUT); A.echo=mk(['#2a1a50','#4a3890','#7a60c8','#a890ec','#e0d4ff']); return A; })();
function mlBig(x,y,i,ph,echo){ const s=(echo?ML_BIG.echo:ML_BIG)[((Math.floor(i)%4)+4)%4][((Math.floor(ph)%2)+2)%2]; ctx.drawImage(s,Math.round(x)-3,Math.round(y)-3); }
/* cuervos pequeños (los del Espantapájaros): posado y dos aleteos */
const ML_CROW=(()=>{ const P={C:'#3a3252',w:'#5a5078',o:'#f8b030'};
  return { sit:[sprN(['..kk...','.kCCo..','.kCCk..','kCwCCk.','.kCCCk.','..k.k..'],P),sprN(['.......','..kk...','.kCCo..','kCwCCk.','.kCCCk.','..k.k..'],P)],
    fly:[sprN(['k.....k..','kk...kk..','.kCkCCko.','..kCCk...','...kk....'],P),sprN(['.........','..kkkk...','.kCCCCko.','kkwCCk.k.','k..kk....'],P)] }; })();
/* el título que cae letra a letra: cada letra aterriza en t0+i*gap con un rebote y un destello */
function mlGlyphW(F,ch){ if(ch===' ') return F.space+1; const o=glyphOf(F,ch); return o?o.w+1:F.space+1; }
function mlStamp(s,cx,y,T,t0,gap,col,ol,F){ F=F||FONT_M; const chars=[...s]; let w=0; for(const ch of chars) w+=mlGlyphW(F,ch); let x=Math.round(cx-(w-1)/2);
  chars.forEach((ch,i)=>{ const u=T-(t0+i*gap); if(u>=0&&ch!==' '){ const k=Math.min(1,u/7), dy=Math.round((1-presentEase.back(k))*-7);
      txtOL(ch,x,y+dy,u<2?'#ffffff':col,'left',ol,F); }
    x+=mlGlyphW(F,ch); }); return w; }
/* un brillo que cruza el texto en diagonal (sin semitransparencias: píxeles blancos sobre las letras claras) */
function mlGlint(x0,y0,w,h,k){ if(k<=0||k>=1) return; const gx=Math.round(x0-12+(w+24)*k); ctx.fillStyle='rgba(255,255,255,.55)';
  for(let yy=0;yy<h;yy++){ const xx=gx+((h-yy)>>1); ctx.fillRect(xx,y0+yy,2,1); } }
/* para los sonidos: ¿el tiempo de la escena acaba de pasar por th? */
function mlAt(P,th){ return P.st.T0<th&&P.st.T>=th; }
function mlTime(P,T){ P.st.T0=P.st.T===undefined?-1:P.st.T; P.st.T=T; }
/* los sonidos del molino */
const ML_SFX={
  gust(v){ if(!AC) return; const t=AC.currentTime; v=v||1; swish(.45,.05*v,500,1800,700,t,.9); swish(.45,.04*v,700,2400,900,t+.3,.9); swish(.4,.03*v,900,2000,600,t+.62,.8); },
  creak(){ if(!AC) return; const t=AC.currentTime; beep('square',96,74,.18,.018,t); beep('square',150,118,.14,.012,t+.1); noise(.12,.02,false,t,500); },
  thunk(){ if(!AC) return; const t=AC.currentTime; beep('triangle',120,48,.22,.12,t); noise(.12,.06,false,t,700); },
  tick(i){ if(!AC) return; const t=AC.currentTime, m=[57,60,62,64,67,69,72][i%7]; beep('p25',f(m+12),0,.06,.018,t); },
  chord(){ if(!AC) return; const t=AC.currentTime; [57,64,69,72].forEach((m,i)=>beep('p25',f(m),0,.5,.03,t+i*.05)); beep('triangle',f(45),0,.7,.07,t); },
  caw(){ if(!AC) return; const t=AC.currentTime; for(const d of [0,.16]){ beep('square',720,380,.1,.03,t+d); noise(.08,.03,true,t+d,2200); } },
  flap(){ if(!AC) return; const t=AC.currentTime; for(let i=0;i<4;i++) swish(.07,.035,1200,2600,900,t+i*.07,1.4); },
  eyes(){ if(!AC) return; const t=AC.currentTime; beep('square',f(71),f(59),.35,.03,t,true); beep('p125',f(83),f(71),.3,.012,t+.02); },
  hop(){ if(!AC) return; const t=AC.currentTime; beep('triangle',160,60,.12,.08,t); noise(.09,.04,false,t,900); },
  spin(){ if(!AC) return; const t=AC.currentTime; for(let i=0;i<5;i++) swish(.12,.04+i*.006,800,3200,1400,t+i*.09,1.2); },
  slam(){ if(!AC) return; const t=AC.currentTime; beep('triangle',140,34,.45,.16,t); noise(.35,.08,false,t,650); beep('p25',f(45),0,.4,.03,t+.02); },
  heart(){ if(!AC) return; const t=AC.currentTime; beep('triangle',64,40,.16,.1,t); beep('triangle',60,38,.14,.07,t+.2); },
  hum(){ if(!AC) return; const t=AC.currentTime; beep('triangle',f(40),f(43),.5,.07,t,true); beep('p125',f(52),f(55),.45,.012,t); },
  burst(){ if(!AC) return; const t=AC.currentTime; noise(.4,.12,false,t,1400); noise(.3,.05,true,t+.03,3000); beep('triangle',110,30,.5,.14,t); },
  bellow(){ if(!AC) return; const t=AC.currentTime; beep('sawtooth',f(43),f(50),.45,.05,t,true); beep('sawtooth',f(50),f(55),.45,.035,t+.02,true); beep('square',f(62),f(67),.4,.012,t+.05,true);
    beep('sawtooth',f(55),f(43),.45,.04,t+.44,true); swish(.45,.04,300,900,400,t,1); },
  stamp(i){ if(!AC) return; const t=AC.currentTime; beep('triangle',180-i*3,70,.06,.05,t); noise(.03,.025,false,t,1400); },
  crunch(){ if(!AC) return; const t=AC.currentTime; noise(.25,.1,false,t,2000); noise(.2,.06,true,t+.04,4200); beep('triangle',130,50,.2,.1,t); for(let i=0;i<5;i++) swish(.06,.03,2400,4200,1800,t+.05+i*.04,2); },
};

/* ---------- los dibujos compartidos ---------- */
/* una tabla de madera colgada: tablones con vetas y clavos, contorno negro */
function mlPlank(x,y,w,h){ x=Math.round(x); y=Math.round(y); w=Math.round(w); h=Math.round(h); if(w<8||h<8) return;
  const D=['#1a0c04','#3a1e0c','#4e2a12','#5e3418','#8a5a30','#c8945a'];                 // madera teñida, oscura: resalta sobre el suelo del molino
  ctx.fillStyle=ML_INK; ctx.fillRect(x-2,y-2,w+4,h+4);
  ctx.fillStyle=D[4]; ctx.fillRect(x-1,y-1,w+2,h+2); ctx.fillStyle=D[1]; ctx.fillRect(x,y,w,h);   // el marco
  const ix=x+3, iy=y+3, iw=w-6, ih=h-6, n=Math.max(1,Math.round(ih/9)), ph=ih/n;
  ctx.fillStyle=ML_INK; ctx.fillRect(ix-1,iy-1,iw+2,ih+2);
  for(let i=0;i<n;i++){ const py=Math.round(iy+i*ph), qh=Math.round(iy+(i+1)*ph)-py;
    ctx.fillStyle=D[2+(i&1)]; ctx.fillRect(ix,py,iw,qh); ctx.fillStyle=D[1]; ctx.fillRect(ix,py+qh-1,iw,1);
    for(let k=0;k<Math.max(3,(iw/16)|0);k++){ const gx=ix+2+Math.round(mlR(k,i)*(iw-14)), gy=py+1+Math.round(mlR(k+5,i)*(qh-3)), gl=4+Math.round(mlR(k,i+9)*9); ctx.fillStyle=D[1]; ctx.fillRect(gx,gy,gl,1); } }
  ctx.fillStyle=D[5]; ctx.fillRect(x-1,y-1,w+2,1); ctx.fillRect(x-1,y-1,1,h+2);                  // luz arriba e izquierda
  for(const [nx,ny] of [[x-1,y-1],[x+w-2,y-1],[x-1,y+h-2],[x+w-2,y+h-2]]){ ctx.fillStyle=ML_INK; ctx.fillRect(nx,ny,3,3); ctx.fillStyle='#d8d0c0'; ctx.fillRect(nx+1,ny+1,1,1); } } // clavos en las esquinas
/* aspas de molino que giran (líneas de píxel, sin suavizado): ang en radianes */
function mlSails(cx,cy,R,ang,cloth){ for(let s=0;s<4;s++){ const a=ang+s*Math.PI/2, ca=Math.cos(a), sa=Math.sin(a);
    for(let r=2;r<=R;r++){ ctx.fillStyle=ML_INK; ctx.fillRect(Math.round(cx+ca*r),Math.round(cy+sa*r),1,1); }
    for(let r=4;r<=R;r++) for(let w=1;w<=3;w++){ const x=Math.round(cx+ca*r-sa*w), y=Math.round(cy+sa*r+ca*w); ctx.fillStyle=(r===R||w===3)?ML_WOOD[1]:((r+w)&1?cloth:'#fff8e0'); ctx.fillRect(x,y,1,1); } }
  ctx.fillStyle=ML_INK; ctx.fillRect(cx-2,cy-2,4,4); ctx.fillStyle=ML_WOOD[3]; ctx.fillRect(cx-1,cy-1,2,2); }
/* el medallón con las aspas */
function mlEmblem(cx,cy,r,ang){ if(r<2) return; ctx.drawImage(disc(r+1,ML_INK),cx-r-1,cy-r-1); ctx.drawImage(disc(r,ML_WOOD[3]),cx-r,cy-r); ctx.drawImage(disc(Math.max(1,r-2),'#3a2410'),cx-r+2,cy-r+2);
  if(r>3) ctx.drawImage(disc(r-2,'#d06a2c'),cx-r+2,cy-r+2); if(r>6) ctx.drawImage(disc(r-4,'#eea040'),cx-r+4,cy-r+4); if(r>9) ctx.drawImage(disc(r-7,'#fcd878'),cx-r+7,cy-r+7); // una ventana redonda con el sol de la tarde
  if(r>=9) mlSails(cx,cy,r-3,ang,'#f8ecd0'); }
/* un montón de hojarasca (precalculado): el lecho del Ciervo y el colchón del aterrizaje */
function mlMoundArt(P){ const c=mkCanvas(48,24), g=c.getContext('2d');
  blobArt(g,2,4,44,19,[{x:10,y:13,r:9,ry:6},{x:22,y:10,r:12,ry:8},{x:34,y:13,r:9,ry:6},{x:22,y:14,r:14,ry:5}],P,{grad:.5,dither:.8});
  const r=seeded(31); for(let i=0;i<46;i++){ const x=4+((r()*40)|0), y=6+((r()*14)|0), c2=P[1+((r()*4)|0)]; g.fillStyle=c2; g.fillRect(x,y,2,1); g.fillRect(x+1,y+1,1,1); }
  return c; }
let ML_MOUND_E=null; const ML_MOUND=mlMoundArt(ML_AUT);
function mlMound(echo){ return echo?(ML_MOUND_E||(ML_MOUND_E=mlMoundArt(['#2a1a50','#4a3890','#7a60c8','#a890ec','#e0d4ff']))):ML_MOUND; }

/* ============================================================
   1) EL TÍTULO DE LA MAZMORRA
   ============================================================ */
const ML_CARD_T=200;
DNG_CARD.molino={dur:ML_CARD_T, shortDur:100,
  start(P){ ML_SFX.gust(1); },
  tick(t,P){ const T=t*ML_CARD_T/P.dur; mlTime(P,T);
    if(mlAt(P,20)) ML_SFX.creak(); if(mlAt(P,27)) ML_SFX.thunk();
    for(let i=0;i<25;i++) if(mlAt(P,46+i*2.4)) ML_SFX.tick(i);
    if(mlAt(P,108)) ML_SFX.chord(); if(mlAt(P,176)) ML_SFX.gust(.8);
    if(mlAt(P,27)){ shake=Math.max(shake,3); for(let i=0;i<14;i++) parts.push({k:'dust',x:16+i*9,y:96,vx:(i-7)*.12,vy:-.3-Math.random()*.3,life:18,max:18,r:1+(i&1),col:'#e8d8b0',nog:true}); } },
  draw(t,P){ const T=t*ML_CARD_T/P.dur, out=mlSeg(T,178,198), fold=presentEase.in(out);
    // la sala se oscurece: la tabla manda
    ctx.fillStyle='rgba(16,6,2,'+(.66*mlSeg(T,0,14)*(1-out)).toFixed(3)+')'; ctx.fillRect(0,0,VW,VH);
    // el remolino de hojas que cruza (y el que se la lleva)
    for(let i=0;i<40;i++){ const band=i&1?1:-1, sp=3.2+mlR(i,1)*2.4, u=T-i*1.2, x=-16+u*sp, y=70+band*(8+mlR(i,2)*40)+Math.sin(u*.12+i)*10;
      if(x>-8&&x<VW+8){ if(i%3===0) mlBig(x,y,i,u*.25); else mlLeaf(x,y,u*.35+i,ML_AUT[1+(i%4)],ML_AUT[0]); } }
    // la tabla cae colgada de dos cuerdas, rebota y se balancea
    const drop=presentEase.back(mlSeg(T,12,27)), sway=Math.round(Math.sin(T*.09)*1.4*Math.exp(-Math.max(0,T-27)/60)), W=150, H=Math.round(58*(1-fold)), x=80-W/2+sway, y=Math.round(-70+(46+70)*drop)-Math.round(fold*30), cx=80+sway;
    if(drop>0&&H>6){ for(const rx of [x+18,x+W-20]){ ctx.fillStyle=ML_INK; ctx.fillRect(rx-1,-2,4,y+2); ctx.fillStyle='#c89a60'; ctx.fillRect(rx,-2,2,y+2); ctx.fillStyle='#8a6034'; for(let yy=-2+((T>>2)&1);yy<y;yy+=3) ctx.fillRect(rx,yy,2,1); }
      mlPlank(x,y,W,H);
      if(H>30) for(const [lx,ly,i] of [[x+3,y+H-2,0],[x+9,y+H+1,1],[x+15,y+H-1,2],[x+W-4,y+H-2,3],[x+W-10,y+H+1,1],[x+W-16,y+H-1,0]]) mlBig(lx+Math.round(Math.sin(T*.08+i)*.8),ly,i,(T>>4)+i); // hojas prendidas en las esquinas
      if(H>50){ const er=Math.round(15*presentEase.back(mlSeg(T,24,36))), ang=T*.11+Math.max(0,T-100)*.05; mlEmblem(cx,y-1,er,ang); // el medallón con las aspas, clavado arriba
        if(T>=36){ const s='MAZMORRA 4', n=Math.min(s.length,Math.floor((T-36)/1.2)+1); txtSO(s.slice(0,n),cx-(textW(s,FONT_S)>>1),y+17,'#fcd878','left',ML_INK); }
        mlStamp('EL MOLINO',cx,y+25,T,46,3,'#fff4d8',ML_INK);
        mlStamp('DE LA HOJARASCA',cx,y+36,T,46+9*3,2.4,'#fcd878',ML_INK);
        mlGlint(20,y+23,120,24,mlSeg(T,114,138));
        const sub='LAS HOJAS NO TERMINAN DE CAER', n=Math.floor(mlSeg(T,116,150)*sub.length); if(n>0) txtSO(sub.slice(0,n),cx-(textW(sub,FONT_S)>>1),y+48,'#e8a860','left',ML_INK); } }
    for(let i=0;i<30;i++){ const u=T-176-i*.5; if(u<0) continue; const x=-10+u*(6+mlR(i,4)*3), y=40+mlR(i,5)*70+Math.sin(u*.2+i)*6; if(x<VW+8){ if(i%2) mlBig(x,y,i,u*.3); else mlLeaf(x,y,u*.4+i,ML_AUT[1+(i%4)],ML_AUT[0]); } }
    // polvo de harina y ámbar que flota
    for(let i=0;i<24;i++){ const u=(T*.35+mlR(i,7)*100)%100, x=(mlR(i,8)*VW+Math.sin((T+i*30)*.03)*6)|0, yy=(130-u*1.2)|0, a=Math.min(1,T/20)*(1-out);
      if(a>.1&&((T+i*7)|0)%9<7){ ctx.fillStyle=i%3?'#fff0c0':'#fcd878'; ctx.fillRect(x,yy,1,1); } } } };

/* ============================================================
   2) EL ESPANTAPÁJAROS (minijefe)
   ============================================================ */
const ML_SC_T=210, ML_SC_SHORT=86, ML_SC_ARR=30, ML_SC_ARR_S=14;
/* la sala estaba vacía: la entera lo trae volando entre sus dos cuervos desde el lado contrario a Sprout (siempre alejándose
   de él) y lo clavan en el suelo; la corta lo deja caer del cielo en su sitio. Luego sigue la escena de siempre (T antiguo) */
function mlScPh(t,P){ const a=P.short?ML_SC_ARR_S:ML_SC_ARR, T0=P.short?124:20; return t<a?{arr:t/a,T:T0}:{arr:1,T:T0+(t-a)}; }
function mlScCarry(m,k,P){ const e=presentEase.out(k), d=(1-e)*150, ox=Math.round(P.st.dx*d), oy=Math.round(P.st.dy*d), lift=Math.round((1-e)*10+Math.sin(k*Math.PI)*4);
  mlScareDraw(m,0,P,ox,oy,lift,0);
  const sw=Math.round(Math.sin(k*18)*1.5); // los cuervos tiran de los brazos, aleteando
  for(const [cx,s] of [[m.x-2+ox,-1],[m.x+21+ox,1]]){ const img=ML_CROW.fly[(Math.floor(k*40))&1]; ctx.save(); ctx.translate(cx+sw*s,m.y+2+oy-lift-3); if(s<0) ctx.scale(-1,1); ctx.drawImage(img,-4,0); ctx.restore(); } }
function mlScDrop(m,k){ const e=presentEase.in(k), hz=Math.round((1-e)*90); mlScareDraw(m,200,null,0,0,hz,0); }
function mlScareDraw(m,T,P,ox,oy,hz0,sq0){ // lo pinta la entrada: quieto, tiembla, salta, gira y planta (ox/oy/hz0: mientras llega)
  const X=m.x+(ox||0), Y=m.y+(oy||0); let hz=hz0||0, sx=1, dx=0, sq=sq0||0;
  if(T>=48&&T<54) dx=(T&1)?1:-1;                                         // el tirón de cabeza
  for(const [a,b] of [[86,104],[106,122]]) if(T>=a&&T<b){ const k=(T-a)/(b-a); hz=Math.sin(k*Math.PI)*16; } // dos saltos
  for(const a of [86,106,122]) if(T>=a&&T<a+6){ const k=(T-a)/6; sq=Math.sin(k*Math.PI)*.22; }
  if(T>=124&&T<150){ const k=(T-124)/26, ang=k*k*18; sx=Math.cos(ang); if(Math.abs(sx)<.15) sx=.15*Math.sign(sx||1); }
  if(T>=150&&T<158) sq=Math.sin((T-150)/8*Math.PI)*.3;
  drawShadow(X+12,Y+23,Math.max(4,10-hz*.4));
  ctx.save(); ctx.translate(X+12+dx,Y+24-Math.round(hz)); ctx.scale(sx*(1+sq),1-sq); ctx.drawImage(BOSS_SPR.scare,-12,-24); ctx.restore();
  // los ojos, encendidos
  if(T>=62){ const on=T<66?((T&1)?1:0):1, ey=Y+8-Math.round(hz), ex=X+12+dx, k=T<70?1:.6+.4*Math.sin(T*.3);
    if(on&&Math.abs(sx)>.5){ glowAt(ex,ey,7,'rgba(255,60,30,'+(.35*k).toFixed(2)+')'); ctx.fillStyle='#ff4020'; ctx.fillRect(ex-3,ey,2,2); ctx.fillRect(ex+2,ey,2,2); ctx.fillStyle='#fff0b0'; ctx.fillRect(ex-3,ey,1,1); ctx.fillRect(ex+2,ey,1,1); } } }
function mlCrows(m,T){ // dos cuervos en los brazos; al encenderse los ojos, huyen
  const tips=[[m.x-3,m.y+6,-1],[m.x+20,m.y+6,1]];
  tips.forEach(([x,y,s],i)=>{ if(T<70){ const peck=((T+i*23)%40)<4; const img=ML_CROW.sit[peck?1:0]; ctx.save(); ctx.translate(x+3,y); if(s<0) ctx.scale(-1,1); ctx.drawImage(img,-3,0); ctx.restore(); }
    else { const u=T-70; if(u>60) return; const fx=x+s*u*1.9, fy=y-u*1.3-Math.sin(u*.2)*3; const img=ML_CROW.fly[(u>>2)&1]; ctx.save(); ctx.translate(Math.round(fx),Math.round(fy)); if(s<0) ctx.scale(-1,1); ctx.drawImage(img,-4,0); ctx.restore(); } }); }
function mlBurlap(x,y,w,h){ x=Math.round(x); ctx.fillStyle=ML_INK; ctx.fillRect(x-1,y-1,w+2,h+2); ctx.fillStyle='#6a4822'; ctx.fillRect(x,y,w,h);
  ctx.fillStyle='#58391a'; for(let yy=y+1;yy<y+h;yy+=2) for(let xx=x+((yy>>1)&1);xx<x+w;xx+=2) ctx.fillRect(xx,yy,1,1); // la trama del saco
  ctx.fillStyle='#a07c44'; ctx.fillRect(x,y,w,1); ctx.fillStyle='#3a2410'; ctx.fillRect(x,y+h-1,w,1);
  ctx.fillStyle='#c8a060'; for(let xx=x+3;xx<x+w-3;xx+=4){ ctx.fillRect(xx,y+2,2,1); ctx.fillRect(xx,y+h-3,2,1); } // pespuntes
  ctx.fillStyle='#f0d060'; for(let xx=x;xx<x+w;xx+=3){ const l=2+((xx*7)%3); ctx.fillRect(xx,y+h,1,l); ctx.fillRect(xx+1,y-1-((xx*5)%2),1,1); } } // flecos de paja
BOSS_INTRO.scare={dur:ML_SC_T-20+ML_SC_ARR, shortDur:ML_SC_SHORT+ML_SC_ARR_S,
  start(P){ bossHidden=true; setTrack('silencio'); const m=midboss; if(m){ let dx=m.x+12-(player.x+8), dy=m.y+14-(player.y+10), d=Math.hypot(dx,dy)||1; P.st.dx=dx/d; P.st.dy=dy/d; } },
  tick(t,P){ const ph=mlScPh(t,P), T=ph.T, m=midboss; mlTime(P,T); if(!m) return;
    if(t===1){ if(P.short) swish(.5,.04,900,300,500,AC?AC.currentTime:0,1); else { ML_SFX.flap(); ML_SFX.caw(); } }
    if(ph.arr>=1&&!P.st.landed){ P.st.landed=true; ML_SFX.thunk(); shake=Math.max(shake,P.short?5:3); if(!P.short) ML_SFX.creak();
      for(let i=0;i<12;i++){ const a=i/12*6.283; parts.push({k:'dust',x:m.x+12+Math.cos(a)*5,y:m.y+23+Math.sin(a)*2,vx:Math.cos(a)*1.1,vy:Math.sin(a)*.4-.15,life:18,max:18,r:1+(i%3),col:'#d8c090',nog:true}); }
      for(let i=0;i<6;i++){ const a=-Math.PI*Math.random(); parts.push({k:'blade',x:m.x+12,y:m.y+14,vx:Math.cos(a)*1.4,vy:Math.sin(a)*1.4-.4,life:30,max:30,col:i&1?'#f0d060':'#c8a040',rot:a,vr:.4}); } }
    if(mlAt(P,48)) ML_SFX.creak(); if(mlAt(P,62)) ML_SFX.eyes(); if(mlAt(P,70)){ ML_SFX.caw(); ML_SFX.flap();
      for(let i=0;i<6;i++) parts.push({k:'blade',x:m.x+(i<3?-2:24),y:m.y+8,vx:(i<3?-1:1)*(.4+Math.random()*.8),vy:-.8-Math.random(),life:40,max:40,col:i&1?'#3a3252':'#5a5078',rot:Math.random()*6,vr:.2}); }
    for(const a of [104,122]) if(mlAt(P,a)){ ML_SFX.hop(); shake=Math.max(shake,3); for(let i=0;i<8;i++) parts.push({k:'dust',x:m.x+12+(i-4)*3,y:m.y+23,vx:(i-4)*.25,vy:-.15,life:14,max:14,r:1+(i&1),col:'#d8c090',nog:true}); }
    if(mlAt(P,86)) ML_SFX.hop();
    if(mlAt(P,124)) ML_SFX.spin();
    if(T>=124&&T<150&&(T&1)) for(let i=0;i<2;i++){ const a=Math.random()*6.283; parts.push({k:'blade',x:m.x+12+Math.cos(a)*8,y:m.y+12,vx:Math.cos(a)*2.2,vy:Math.sin(a)*1.2-.6,life:26,max:26,col:['#f0d060','#d8b040','#fff0a0'][i%3],rot:a,vr:.5}); }
    if(mlAt(P,150)){ ML_SFX.slam(); presentMusic(P); shake=Math.max(shake,7); screenFlash(3,'#fff0c0');
      for(let i=0;i<16;i++){ const a=i/16*6.283; parts.push({k:'dust',x:m.x+12+Math.cos(a)*6,y:m.y+22+Math.sin(a)*2,vx:Math.cos(a)*1.4,vy:Math.sin(a)*.5-.2,life:20,max:20,r:1+(i%3),col:'#e0cc98',nog:true}); } }
    for(let i=0;i<17;i++) if(mlAt(P,156+i*2)) ML_SFX.stamp(i); },
  draw(t,P){ const ph=mlScPh(t,P), T=ph.T, m=midboss; if(!m) return; const dur=ML_SC_T, out=mlSeg(T,dur-16,dur);
    // la penumbra del pajar, con la luz sobre el espantapájaros
    ctx.fillStyle='rgba(12,6,2,'+(.6*mlSeg(T,0,20)*(1-out)).toFixed(3)+')'; ctx.fillRect(0,0,VW,VH);
    glowAt(m.x+12,m.y+14,44,'rgba(255,214,130,'+(.3*(1-out)).toFixed(2)+')');
    if(ph.arr<1){ if(P.short) mlScDrop(m,ph.arr); else mlScCarry(m,ph.arr,P); }
    else { if(T<dur-2) mlScareDraw(m,T,P); else { bossHidden=false; } mlCrows(m,T); }
    // briznas de paja que se lleva el aire
    for(let i=0;i<10;i++){ const u=(T*.8+mlR(i,3)*160)%160; const x=(u*1.1-10)|0, y=(30+mlR(i,4)*70+Math.sin(u*.1+i)*4)|0; ctx.fillStyle=i&1?'#f0d060':'#c8a040'; ctx.fillRect(x,y,2,1); }
    presentBars(mlSeg(T,0,14)*(1-out),14);
    // el título, en un saco cosido que entra de lado
    const sl=presentEase.out(mlSeg(T,150,162)), bx=Math.round(-170+(170+10)*sl), by=96;
    if(sl>0){ mlBurlap(bx,by,140,26); mlStamp('EL ESPANTAPÁJAROS',bx+70,by+5,T,156,2,'#f8e070','#3a1c08');
      const sub='PAJA CON MALAS PULGAS', n=Math.floor(mlSeg(T,172,192)*sub.length); if(n>0) txtSO(sub.slice(0,n),bx+70-(textW(sub,FONT_S)>>1),by+17,'#fff4d8','left','#3a1c08'); }
  },
  end(P){ bossHidden=false; } };

/* ============================================================
   3) EL CIERVO DE ÁMBAR
   ============================================================ */
const ML_CI_T=330, ML_CI_SHORT=100;
function mlCiT(t,P){ return P.short?112+t*(ML_CI_T-112)/ML_CI_SHORT:t; }  // la corta arranca justo antes de que reviente el montón, más deprisa
function mlCiBuild(t,T,P){ return P.short?mlSeg(t,0,5):presentEase.out(mlSeg(T,4,60)); } // el montón se forma con las hojas que caen (la sala estaba vacía)
function mlCiPal(P){ return P.Q&&P.Q.echo?{glow:'rgba(190,150,255,',hot:'#e8d8ff',leaf:['#3a2a6a','#5a44a0','#8a70d0','#b8a0f0','#e8d8ff'],band:'#2a1848',edge:'#c8b0ff',txt:'#f0e8ff',ol:'#1a0c30'}
  :{glow:'rgba(252,200,90,',hot:'#fff0b0',leaf:ML_AUT,band:'#5a1a0a',edge:'#fcd878',txt:'#fcd878',ol:'#2a0c04'}; }
function mlAntlers(b){ return [[b.x+4,b.y+2],[b.x+10,b.y+1],[b.x+15,b.y+3],[b.x+7,b.y+5]]; } // puntas de la cornamenta (mirando a la izquierda)
function mlDeer(b,T,P,rise){ // el Ciervo como lo pinta el juego, pero subiendo del montón y bramando
  const echo=P.Q&&P.Q.echo, lift=Math.round((1-rise)*26), rear=(T>=150&&T<205)?Math.round(Math.sin(mlSeg(T,150,205)*Math.PI)*3):0;
  if(rise>0){ drawShadow(b.x+16,b.y+30,Math.round(13*rise));
    ctx.save(); ctx.beginPath(); ctx.rect(b.x-20,b.y-20,72,52); ctx.clip(); if(echo) ctx.globalAlpha=.8;
    ctx.translate(b.x+16,b.y+32+lift-rear); ctx.scale(-1,1); ctx.drawImage(BOSS_SPR.ciervo,-16,-32); ctx.restore(); } }
/* el inserto del ojo: pelaje en trazos y un ojo de ciervo, almendrado, ámbar, de pupila horizontal */
function mlFur(y0,h,T){ ctx.fillStyle='#2a1206'; ctx.fillRect(0,y0,VW,h);
  for(let yy=y0+1;yy<y0+h-1;yy+=2) for(let xx=((yy*5)%7);xx<VW;xx+=7){ const c=hash(xx,yy)%3; ctx.fillStyle=c?'#3c1c0a':'#4e2810'; ctx.fillRect(xx,yy,2,1); ctx.fillRect(xx+2,yy+1,1,1); } }
function mlEye(ex,ey,open,C){ const RX=20, RY=9, L=C.leaf;
  const half=x=>Math.pow(Math.max(0,1-(x*x)/(RX*RX)),.75);
  ctx.fillStyle='#160802'; for(let x=-RX-4;x<=RX+4;x++){ const h=Math.round(Math.pow(Math.max(0,1-(x*x)/((RX+4)*(RX+4))),.7)*(RY+3)); ctx.fillRect(ex+x,ey-h,1,h*2+1); } // la cuenca
  const oh=open*RY;
  for(let x=-RX;x<=RX;x++){ const top=Math.round(half(x)*oh*.92+(x<-RX*.6?-1:0)), bot=Math.round(half(x)*oh*.8); // el párpado de arriba cae más
    for(let y=-top;y<=bot;y++){ const dx=x/11, dy=y/7.5, d=Math.sqrt(dx*dx+dy*dy), bay=BAYER4[(y+16)&3][(x+32)&3]/16;
      let c=d>1.05?L[1]:d>.8?(bay<.5?L[2]:L[1]):d>.5?L[3]:(bay<.4?L[4]:L[3]); if(y<=-top+1) c=L[1]; // la sombra del párpado
      if(Math.abs(y)<=1&&Math.abs(x)<=6-(Math.abs(y))) c='#0c0402'; // la pupila, horizontal
      ctx.fillStyle=c; ctx.fillRect(ex+x,ey+y,1,1); } }
  if(oh>3){ ctx.fillStyle='#ffffff'; ctx.fillRect(ex-9,ey-Math.round(oh*.6),3,2); ctx.fillRect(ex+6,ey+2,1,1); ctx.fillStyle=L[4]; ctx.fillRect(ex-3,ey-3,5,1); }
  ctx.fillStyle='#0c0402'; for(let x=-RX-1;x<=RX+1;x++){ const t=Math.round(half(x)*oh*.92+1), b=Math.round(half(x)*oh*.8+1); ctx.fillRect(ex+x,ey-t,1,1); ctx.fillRect(ex+x,ey+b,1,1); } // el contorno de los párpados
  for(const [x0,dx] of [[-14,-1],[-8,-1],[2,1],[8,1],[14,1]]){ const t=Math.round(half(x0)*oh*.92+1); ctx.fillRect(ex+x0+dx,ey-t-1,1,1); ctx.fillRect(ex+x0+dx*2,ey-t-2,1,1); } // pestañas
  ctx.fillStyle='#6a3a1c'; for(let x=-RX+2;x<=RX-2;x+=3){ const t=Math.round(half(x)*(RY+2)); ctx.fillRect(ex+x,ey-t-3,2,1); } } // el pliegue de encima
BOSS_INTRO.ciervo={dur:ML_CI_T, shortDur:ML_CI_SHORT,
  start(P){ bossHidden=true; setTrack('silencio'); const b=boss; if(b){ P.st.face=b.face; b.face=-1; } },
  tick(t,P){ const T=mlCiT(t,P), b=boss; mlTime(P,T); if(!b) return; const C=mlCiPal(P), cx=b.x+16, cy=b.y+26;
    if(mlAt(P,4)) ML_SFX.gust(.7); if(mlAt(P,62)||mlAt(P,76)) ML_SFX.heart(); if(mlAt(P,86)) ML_SFX.hum();
    if(!P.short&&T>6&&T<60&&(T%6)<1) parts.push({k:'leafF',x:cx-26+Math.random()*52,y:cy-50,vx:0,vy:.5,life:44,max:44,nog:true,sway:Math.random()*6,col:C.leaf[1+((Math.random()*4)|0)]});
    if(mlAt(P,124)){ ML_SFX.burst(); shake=Math.max(shake,8); screenFlash(4,C.hot);
      for(let i=0;i<34;i++){ const a=Math.random()*6.283, s=1+Math.random()*2.6; parts.push({k:'blade',x:cx+Math.cos(a)*10,y:cy-2,vx:Math.cos(a)*s,vy:Math.sin(a)*s*.7-1.4,life:40+((Math.random()*16)|0),max:56,col:C.leaf[1+(i%4)],rot:a,vr:.3}); } }
    if(mlAt(P,156)){ ML_SFX.bellow(); shake=Math.max(shake,10); screenFlash(3,C.hot); }
    if(T>=156&&T<200&&(T%3)<1){ const A=mlAntlers(b), p=A[(T*7|0)%A.length]; parts.push({k:'mote',x:p[0],y:p[1],vx:(Math.random()-.5)*.3,vy:-.4,life:24,max:24,sway:Math.random()*6,col:C.hot,nog:true}); }
    if(mlAt(P,210)){ ML_SFX.slam(); presentMusic(P); shake=Math.max(shake,6); }
    for(let i=0;i<18;i++) if(mlAt(P,214+i*2)) ML_SFX.stamp(i); },
  draw(t,P){ const T=mlCiT(t,P), b=boss; if(!b) return; const C=mlCiPal(P), cx=b.x+16, cy=b.y+26, out=mlSeg(T,ML_CI_T-18,ML_CI_T);
    // la sala en penumbra; un charco de luz de tarde sobre el lecho
    ctx.fillStyle='rgba(14,6,2,'+(.5*mlSeg(T,0,16)*(1-out)).toFixed(3)+')'; ctx.fillRect(0,0,VW,VH);
    glowAt(cx,cy-6,52,C.glow+(.22+.1*mlSeg(T,150,160)*(1-mlSeg(T,160,200))).toFixed(2)+')');
    // el lecho de hojarasca: respira mientras duerme; revienta al alzarse
    const rise=presentEase.out(mlSeg(T,124,150)), burst=mlSeg(T,124,132);
    const build=mlCiBuild(t,T,P);
    if(burst<1&&build>0){ const br=build>=1&&T<124&&((T>>5)&1)&&(T&31)<10?1:0, top=Math.round(24*(1-build)); ctx.save(); if(burst>0) ctx.globalAlpha=1-burst;
      ctx.drawImage(mlMound(P.Q.echo),0,top,48,24-top,cx-24,cy-14-br+top+Math.round((1-build)*2),48,24-top); ctx.restore(); } // crece desde el suelo
    else if(T<196){ const k=mlSeg(T,150,196); ctx.save(); ctx.globalAlpha=1-k; ctx.drawImage(mlMound(P.Q.echo),0,14,48,10,cx-24,cy+Math.round(k*2),48,10); ctx.restore(); } // lo que queda del montón, a sus pies: se lo lleva el bramido
    // hojas que caen en espiral hacia el lecho
    const spin=T<124?1:1+mlSeg(T,150,160)*3;
    const nL=P.short?30:Math.round(8+22*mlSeg(T,0,30)); // al principio pocas; luego el remolino entero
    for(let i=0;i<nL;i++){ const life=110, u=((T*spin+i*37)%life)/life, a=i*2.4+u*5.5*(T>150?2:1), r=(1-u)*62+4, x=cx+Math.cos(a)*r, y=cy-10-(1-u)*70+Math.sin(a)*r*.35;
      mlLeaf(x,y,T*.2+i,C.leaf[1+(i%4)],C.leaf[0]); }
    mlDeer(b,T,P,rise);
    // el bramido: anillos que salen de la cabeza y la cornamenta que arde
    if(T>=154&&T<205){ for(let k=0;k<3;k++){ const u=T-156-k*9; if(u<0||u>30) continue; const R=6+u*3.4, hx=b.x+6, hy=b.y+10;
        ctx.fillStyle=u<10?'#fffbe8':C.edge; for(let a=0;a<6.283;a+=.07){ if(((a*20)|0)%3===0) continue; ctx.fillRect(Math.round(hx+Math.cos(a)*R),Math.round(hy+Math.sin(a)*R*.6),1,1); } }
      const g=.6+.4*Math.sin(T*.5); for(const [x,y] of mlAntlers(b)) glowAt(x,y,7,C.glow+(.55*g).toFixed(2)+')'); }
    // el ojo que se abre (un inserto entre franjas)
    const eyeIn=P.short?0:mlSeg(T,78,86)*(1-mlSeg(T,112,120));
    if(eyeIn>0){ const H=Math.round(40*presentEase.out(eyeIn)), y0=72-(H>>1);
      ctx.fillStyle='#0a0402'; ctx.fillRect(0,y0,VW,H); ctx.fillStyle=C.edge; ctx.fillRect(0,y0,VW,1); ctx.fillRect(0,y0+H-1,VW,1);
      mlFur(y0+1,H-2,T); if(H>22) mlEye(80,72,presentEase.out(mlSeg(T,90,100))*(T>=104&&T<108?0:1),C);
      for(let i=0;i<6;i++){ const u=((T*1.5+i*30)%180); mlLeaf(-10+u,y0+4+((i*9)%Math.max(4,H-10)),T*.3+i,C.leaf[2+(i%3)],C.leaf[0]); } }
    presentBars(mlSeg(T,0,16)*(1-out),b.y<26?Math.max(4,b.y-2):16); // si el Ciervo quedó arriba, franjas finas: que no le corten la cornamenta
    // el nombre, sobre una guirnalda de hojas
    const sl=presentEase.out(mlSeg(T,206,218));
    if(sl>0){ const by=100, W=Math.round(156*sl), x0=80-(W>>1); ctx.fillStyle=ML_INK; ctx.fillRect(x0-1,by-1,W+2,24); ctx.fillStyle=C.band; ctx.fillRect(x0,by,W,22);
      ctx.fillStyle=C.edge; ctx.fillRect(x0,by+1,W,1); ctx.fillRect(x0,by+20,W,1); ctx.fillStyle=C.leaf[1]; ctx.fillRect(x0,by+2,W,1);
      for(let i=0;i<Math.floor(W/9);i++){ const lx=x0+4+i*9; mlBig(lx,by-1+((i&1)?-1:1),i,(T>>4)+i,P.Q.echo); mlBig(lx+4,by+22+((i&1)?1:0),i+2,(T>>4)+i+1,P.Q.echo); }
      const name=P.Q&&P.Q.echo?(typeof ECO_NAME!=='undefined'?ECO_NAME.ciervo:'ECO DEL CIERVO'):'EL CIERVO DE ÁMBAR';
      if(sl>=1){ mlStamp(name,80,by+4,T,214,2,C.txt,C.ol); mlGlint(8,by+2,144,11,mlSeg(T,258,280));
        const sub=P.Q&&P.Q.echo?'UN RECUERDO CON ASTAS':'GUARDIÁN DEL OTOÑO', n=Math.floor(mlSeg(T,244,266)*sub.length); if(n>0) txtSO(sub.slice(0,n),80-(textW(sub,FONT_S)>>1),by+14,'#fff4d8','left',C.ol); } }
    if(out>=1) bossHidden=false; },
  end(P){ const b=boss; if(b&&P.st.face!==undefined) b.face=P.st.face; bossHidden=false; } };

/* ============================================================
   4) LA SALIDA: el remolino de hojas te saca del molino
   ============================================================ */
const ML_OUT_T=220, ML_OUT_SWAP=110, ML_OUT_LAND=156;
const ML_OUT_DEST={sx:4,sy:3,x:112,y:28,dir:0}; // a la puerta del molino, en la Ciénaga (la misma salida que exitDungeon)
function mlSproutSpin(x,y,T){ const dirs=[0,3,1,2], d=dirs[(T>>2)&3]; ctx.drawImage(P_SPRITES[d][0],Math.round(x),Math.round(y)); }
function mlCurtain(edgeTop,edgeBot,T){ // la cortina de hojas: una ráfaga que sube y lo tapa todo entre edgeTop y edgeBot (borde deshilachado)
  const a=Math.round(edgeTop), z=Math.round(edgeBot); if(z<=a||z<-10||a>VH+10) return;
  ctx.fillStyle=ML_AUT[0]; ctx.fillRect(0,Math.max(-4,a),VW,Math.min(VH+4,z)-Math.max(-4,a));
  const scroll=Math.round(T*3.5);
  for(let row=-1;row<30;row++){ const yy=((row*6-scroll)%180+180)%180-18; if(yy<a-6||yy>z+6) continue;
    for(let col=0;col<25;col++){ const xx=col*7-3+((row&1)?3:0)+Math.round(Math.sin((T+row*9)*.15)*2), k=row*31+col;
      const edge=(yy<a+4&&a>-4)||(yy>z-4&&z<VH+4); if(edge&&(hash(col,row)&1)) continue;
      mlBig(xx,yy,k,(T>>2)+k); } }
  for(let i=0;i<24;i++){ const x=(i*29+T*5)%VW, y=((i*47-T*6)%180+180)%180-18; if(y>a&&y<z){ ctx.fillStyle='#fff0c0'; ctx.fillRect(x,y,3,1); } } } // rachas claras
function mlTwister(cx,baseY,lift,gather,T,front){ // el remolino: un embudo de hojas que se ensancha hacia arriba
  for(let i=0;i<84;i++){ const layer=i%14, a0=mlR(i,1)*6.283, r0=36+mlR(i,2)*80, h=layer*6;
    const a=a0+T*(.14+.22*gather)+layer*.45, rr=(6+layer*1.4+Math.sin(T*.12+i)*1.2), r=r0*(1-gather)+rr*gather;
    const x=cx+Math.cos(a)*r, y=baseY-h*gather-lift*(.55+layer*.04)+Math.sin(a)*r*.35, isFront=Math.sin(a)>0;
    if(isFront!==front) continue;
    if(front&&i%3===0) mlBig(x,y,i,T*.25+i); else mlLeaf(x-1,y-1,T*.4+i,ML_AUT[(front?2:1)+(i%3)],ML_AUT[0]); }
  if(front&&gather>.5){ ctx.fillStyle='#fff4d8'; for(let k=0;k<5;k++){ const a=T*.3+k*1.26, R=10+k*3.5, yy=baseY-8-k*9-lift*.7; for(let s=0;s<14;s++){ const aa=a+s*.07; if(Math.sin(aa)<0) continue; ctx.fillRect(Math.round(cx+Math.cos(aa)*R),Math.round(yy+Math.sin(aa)*R*.35),1,1); } } } }
BOSS_OUTRO.ciervo={dur:ML_OUT_T, swap:ML_OUT_SWAP, dest:ML_OUT_DEST,
  start(P){ P.st.px=player.x; P.st.py=player.y; playerHidden=true; ML_SFX.gust(.7); }, // Sprout va en el remolino: lo pinta la salida
  tick(t,P){ const T=t; mlTime(P,T);
    if(mlAt(P,34)) ML_SFX.gust(1); if(mlAt(P,70)) ML_SFX.gust(1.2); if(mlAt(P,112)) ML_SFX.gust(.9);
    if(T>=18&&T<70&&(T%3)===0){ const a=Math.random()*6.283, cx=P.st.px+8, cy=P.st.py+15; parts.push({k:'dust',x:cx+Math.cos(a)*10,y:cy+Math.sin(a)*3,vx:-Math.sin(a)*.9,vy:Math.cos(a)*.3-.1,life:16,max:16,r:1+(T&1),col:'#c8a070',nog:true}); } // el polvo que levanta el remolino
    if(mlAt(P,ML_OUT_LAND)){ const D=ML_OUT_DEST; player.x=D.x; player.y=D.y; player.dir=0; player.squash=.5; playerHidden=false; ML_SFX.crunch(); shake=Math.max(shake,6);
      for(let i=0;i<40;i++){ const a=-Math.PI*Math.random(), s=1+Math.random()*2.4; parts.push({k:'blade',x:D.x+8+(Math.random()-.5)*16,y:D.y+14,vx:Math.cos(a)*s,vy:Math.sin(a)*s-1,life:44+((Math.random()*20)|0),max:64,col:ML_AUT[1+(i%4)],rot:a,vr:.3}); }
      for(let i=0;i<10;i++) parts.push({k:'dust',x:D.x+8+(i-5)*3,y:D.y+15,vx:(i-5)*.3,vy:-.2,life:16,max:16,r:1+(i&1),col:'#c89058',nog:true}); }
    if(T>ML_OUT_LAND&&T<ML_OUT_LAND+50&&(T%5)===0){ const D=ML_OUT_DEST; parts.push({k:'leafF',x:D.x-10+Math.random()*36,y:D.y-30,vx:0,vy:.35,life:70,max:70,nog:true,sway:Math.random()*6,col:ML_AUT[1+((Math.random()*4)|0)]}); } },
  draw(t,P){ const T=t;
    if(T<ML_OUT_SWAP){ // en el lecho del Ciervo: las hojas se juntan, giran, lo levantan y la cortina lo tapa todo
      const cx=P.st.px+8, cy=P.st.py+12, gather=presentEase.out(mlSeg(T,0,34)), lift=presentEase.in(mlSeg(T,40,100))*130;
      ctx.fillStyle='rgba(30,10,2,'+(.25*mlSeg(T,0,20)).toFixed(3)+')'; ctx.fillRect(0,0,VW,VH);
      drawShadow(cx,cy+3,Math.max(2,Math.round(7-lift/12)));
      mlTwister(cx,cy+2,lift,gather,T,false);
      mlSproutSpin(cx-8,cy-12-lift-(T>=40?Math.sin(T*.4)*1.5:0),T);
      mlTwister(cx,cy+2,lift,gather,T,true);
      const cov=presentEase.io(mlSeg(T,78,ML_OUT_SWAP)); if(cov>0) mlCurtain(VH+10-cov*(VH+24),VH+10,T); }
    else { // en la Ciénaga: la cortina sigue subiendo, baja en su remolino y aterriza en la hojarasca
      const D=ML_OUT_DEST, cx=D.x+8, gy=D.y+15, land=ML_OUT_LAND, fall=presentEase.out(mlSeg(T,120,land)), y=-40+(D.y+40)*fall;
      if(T<land+2){ ctx.drawImage(ML_MOUND,cx-24,gy-18); }
      else { const k=mlSeg(T,land,land+30); if(k<1){ ctx.save(); ctx.globalAlpha=1-k; ctx.drawImage(ML_MOUND,0,12,48,12,cx-24,gy-6,48,12); ctx.restore(); } }
      if(T>=118&&T<land){ const g=1-mlSeg(T,land-10,land); mlTwister(cx,y+14,0,g,T,false); mlSproutSpin(D.x,y,T); mlTwister(cx,y+14,0,g,T,true); }
      const up=presentEase.in(mlSeg(T,ML_OUT_SWAP,132)); if(up<1) mlCurtain(-10,VH+10-up*(VH+30),T); } } };

/* ============================================================
   5) LAS DESPEDIDAS
   · BOSS_BYE.ciervo  tras hacer las paces: se alza, baja la cornamenta en un saludo, un último bramido suave;
                      la luz de la tarde entra por las rendijas y su cuerpo se deshace, de las astas a las pezuñas,
                      en hojas de ámbar que el viento se lleva en espiral. Donde estaba se junta la luz: ahí cae el Ámbar.
                      El eco, igual pero en violeta (y su after abre la verja).
   · BOSS_BYE.scare   cae: destello, tiembla soltando paja, el sombrero sale volando y un cuervo lo caza al vuelo;
                      se desinfla en un montón de paja que otros dos cuervos picotean y una ráfaga esparce.
   ============================================================ */
/* los píxeles de un sprite (para deshacerlo pieza a pieza): [x, y, color, tono 0..4] */
const ML_PIX=new Map();
function mlPixels(img){ let L=ML_PIX.get(img); if(L) return L; const w=img.width, h=img.height, d=img.getContext('2d').getImageData(0,0,w,h).data; L=[];
  for(let y=0;y<h;y++) for(let x=0;x<w;x++){ const i=(y*w+x)*4; if(d[i+3]<128) continue; const lum=(d[i]*.3+d[i+1]*.55+d[i+2]*.15)/255;
    L.push([x,y,rgb2hex(d[i],d[i+1],d[i+2]),Math.min(4,Math.floor(lum*5))]); }
  ML_PIX.set(img,L); return L; }
/* los rayos de luz de tarde que entran por las rendijas del techo */
function mlShafts(a){ if(a<=0) return; for(let i=0;i<4;i++){ const x0=18+i*38+((i&1)?6:0), w=5+(i%2)*4; ctx.fillStyle='rgba(255,222,150,'+(a*(i&1?.08:.11)).toFixed(3)+')';
    for(let y=0;y<PLAY_H;y++) ctx.fillRect(Math.round(x0+y*.42),y,w,1); } }
const ML_BYE_T=196, ML_BYE_REL=78, ML_BYE_GONE=150;
function mlByeRel(i,y,h){ return ML_BYE_REL+(y/h)*52+mlR(i,21)*16; } // de las astas a las pezuñas, con un poco de azar
BOSS_BYE.ciervo={dur:ML_BYE_T,
  start(P){ bossHidden=true; const b=boss; if(!b) return; P.st.bx=b.x; P.st.by=b.y; P.st.flip=b.face<0; P.st.img=b.mantle===0?CIERVO_BARE:BOSS_SPR.ciervo; P.st.wind=player.x+8<b.x+16?1:-1; ML_SFX.gust(.4); },
  tick(t,P){ mlTime(P,t); const C=mlCiPal(P); if(P.st.bx===undefined) return; const cx=P.st.bx+16, cy=P.st.by+16;
    if(mlAt(P,40)) ML_SFX.creak();
    if(mlAt(P,60)&&AC){ const T0=AC.currentTime; beep('sawtooth',f(43),f(48),.6,.03,T0,true); beep('triangle',f(55),f(50),.7,.04,T0+.05); swish(.6,.025,300,700,400,T0,1); } // un bramido suave, casi un suspiro
    if(mlAt(P,ML_BYE_REL)) ML_SFX.gust(1.1); if(mlAt(P,118)) ML_SFX.gust(.8);
    for(let i=0;i<8;i++) if(mlAt(P,140+i*4)) ML_SFX.tick(i);
    if(mlAt(P,176)){ if(AC){ const T0=AC.currentTime; [69,76,81,88].forEach((m,i)=>beep('p25',f(m),0,.4,.03,T0+i*.06)); beep('triangle',f(57),0,.8,.05,T0); }
      screenFlash(4,C.hot); shake=Math.max(shake,3); for(let i=0;i<10;i++) sparkle(cx-10+Math.random()*20,cy-8+Math.random()*16,C.hot); }
    if(t>ML_BYE_REL&&t<ML_BYE_GONE+10&&(t%7)===0) parts.push({k:'leafF',x:P.st.bx+Math.random()*32,y:P.st.by-6,vx:0,vy:.3,life:60,max:60,nog:true,sway:Math.random()*6,col:C.leaf[1+((Math.random()*4)|0)]}); },
  draw(t,P){ const C=mlCiPal(P), echo=P.Q&&P.Q.echo, bx=P.st.bx, by=P.st.by, img=P.st.img; if(bx===undefined) return;
    const out=mlSeg(t,ML_BYE_T-14,ML_BYE_T), cx=bx+16, cy=by+16;
    ctx.fillStyle='rgba(20,8,2,'+(.34*mlSeg(t,0,20)*(1-out)).toFixed(3)+')'; ctx.fillRect(0,0,VW,VH);
    mlShafts(mlSeg(t,6,30)*(1-out)*(1+.8*mlSeg(t,ML_BYE_REL,ML_BYE_GONE)));
    glowAt(cx,cy+6,30+Math.round(16*mlSeg(t,ML_BYE_REL,ML_BYE_GONE)),C.glow+(.18+.22*mlSeg(t,100,170)).toFixed(2)+')');
    if(t<ML_BYE_REL){ // entero: se alza de la reverencia, baja la cornamenta en un saludo y la vuelve a subir
      const rise=presentEase.out(mlSeg(t,4,26)), bow=mlSeg(t,40,50)*(1-mlSeg(t,62,72)), sx=1.08-.08*rise+.04*bow, sy=.8+.2*rise-.1*bow;
      drawShadow(cx,by+30,13); ctx.save(); if(echo) ctx.globalAlpha=.8; ctx.translate(cx,by+32+Math.round(bow*2)); ctx.scale(P.st.flip?-sx:sx,sy); ctx.drawImage(img,-16,-32); ctx.restore();
      if(t>=60&&t<76){ const u=t-60, R=6+u*2.6, hx=bx+(P.st.flip?6:26), hy=by+9; ctx.fillStyle=C.edge; for(let a=0;a<6.283;a+=.08){ if(((a*20)|0)%3===0) continue; ctx.fillRect(Math.round(hx+Math.cos(a)*R),Math.round(hy+Math.sin(a)*R*.6),1,1); } }
      return; }
    // se deshace: cada píxel se suelta a su hora y se va con el viento en espiral; los que quedan brillan justo antes de irse
    const L=mlPixels(img), W=P.st.wind; drawShadow(cx,by+30,Math.max(0,Math.round(13*(1-mlSeg(t,100,ML_BYE_GONE)))));
    if(echo) ctx.globalAlpha=.85;
    for(let i=0;i<L.length;i++){ const [x,y,col,li]=L[i], px=bx+(P.st.flip?31-x:x), py=by+y, rel=mlByeRel(i,y,32), u=t-rel, base=echo?C.leaf[li]:col;
      if(u<0){ ctx.fillStyle=u>-5?C.hot:base; ctx.fillRect(px,py,1,1); continue; }
      if(u>95) continue; const ang=i*2.3+u*.13, rad=Math.min(16,u*.32);
      const X=px+W*u*.8+Math.cos(ang)*rad, Y=py-u*.5-u*u*.004+Math.sin(ang)*rad*.4; if(X<-6||X>VW+6||Y<-6) continue;
      if(u<5){ ctx.fillStyle=base; ctx.fillRect(Math.round(X),Math.round(Y),1,1); }
      else if(i%4===0) mlLeaf(X,Y,u*.3+i,C.leaf[1+(i%4)],C.leaf[0]);
      else if(i%4===1&&u<30){ ctx.fillStyle=C.leaf[2+(i%3)]; ctx.fillRect(Math.round(X),Math.round(Y),1,1); } }
    ctx.globalAlpha=1;
    // donde estaba se junta la luz: motas que giran hacia el centro y un destello (ahí cae el Ámbar)
    const k=mlSeg(t,140,176); if(k>0&&k<1){ for(let i=0;i<12;i++){ const a=i/12*6.283+t*.12, r=(1-presentEase.in(k))*40; ctx.fillStyle=i&1?C.hot:C.edge; ctx.fillRect(Math.round(cx+Math.cos(a)*r),Math.round(cy+Math.sin(a)*r*.6),2,2); } }
    if(t>=172){ const s=Math.max(0,Math.round(7-Math.abs(t-180)*.5)); glowAt(cx,cy,10+s,C.glow+'.5)'); caStar(cx,cy,s,'#fffbe8'); } } };

/* el sombrero del Espantapájaros son las 6 filas de arriba de su dibujo: sale volando por su cuenta */
const ML_HAT_H=6;
BOSS_BYE.scare={dur:140,
  start(P){ bossHidden=true; const m=midboss; if(!m) return; P.st.mx=m.x; P.st.my=m.y; P.st.side=player.x+8<m.x+12?1:-1; ML_SFX.crunch(); shake=Math.max(shake,6); screenFlash(3,'#fff0c0'); },
  tick(t,P){ mlTime(P,t); const mx=P.st.mx, my=P.st.my; if(mx===undefined) return; const cx=mx+12;
    if(t<46&&(t%4)===0) for(let i=0;i<3;i++){ const a=-Math.PI*(.15+Math.random()*.7); parts.push({k:'blade',x:cx+(Math.random()-.5)*14,y:my+12,vx:Math.cos(a)*(1+Math.random()*1.5),vy:Math.sin(a)*1.6-.3,life:34,max:34,col:['#f0d060','#d8b040','#fff0a0'][i],rot:a,vr:.5}); }
    if(mlAt(P,26)){ ML_SFX.hop(); if(AC) swish(.3,.04,1200,3400,1600,AC.currentTime,1.2); } // ¡el sombrero sale volando!
    if(mlAt(P,42)){ ML_SFX.creak(); if(AC) noise(.12,.06,true,AC.currentTime,2600); } // el palo cruje
    if(mlAt(P,56)){ ML_SFX.caw(); ML_SFX.flap(); }
    if(mlAt(P,64)){ ML_SFX.thunk(); shake=Math.max(shake,4); for(let i=0;i<14;i++){ const a=i/14*6.283; parts.push({k:'dust',x:cx+Math.cos(a)*6,y:my+22+Math.sin(a)*2,vx:Math.cos(a)*1.2,vy:-.2,life:18,max:18,r:1+(i%3),col:'#d8c090',nog:true}); } }
    if(mlAt(P,84)) ML_SFX.caw();
    if(mlAt(P,108)){ ML_SFX.gust(.9); for(let i=0;i<26;i++){ const a=-Math.PI*Math.random(); parts.push({k:'blade',x:cx+(Math.random()-.5)*20,y:my+20,vx:P.st.side*(1+Math.random()*2.4),vy:Math.sin(a)*1.2-.5,life:44,max:44,col:['#f0d060','#d8b040','#fff0a0','#c8a040'][i%4],rot:a,vr:.4}); } }
    if(mlAt(P,124)){ if(AC){ const T0=AC.currentTime; [64,69,72,76].forEach((m,i)=>beep('p25',f(m+12),0,.25,.028,T0+i*.05)); } for(let i=0;i<6;i++) sparkle(cx-8+Math.random()*16,my+6+Math.random()*12,'#fff6c0'); } },
  draw(t,P){ const mx=P.st.mx, my=P.st.my; if(mx===undefined) return; const cx=mx+12, img=BOSS_SPR.scare, side=P.st.side, out=mlSeg(t,126,140);
    ctx.fillStyle='rgba(12,6,2,'+(.3*mlSeg(t,0,10)*(1-out)).toFixed(3)+')'; ctx.fillRect(0,0,VW,VH);
    // el cuerpo: parpadea en blanco, tiembla, se tuerce y se desinfla hasta quedarse en nada
    const defl=presentEase.in(mlSeg(t,44,70));
    if(t<70){ const white=t<14&&(t&2), wob=t<44?Math.sin(t*.9)*(t<14?.06:.14):Math.sin(t*.4)*.2*(1-defl), sy=1-defl*.92, sx=1+defl*.35;
      drawShadow(cx,my+23,Math.round(10-defl*2));
      ctx.save(); ctx.translate(cx+(t<14?((t&1)?1:-1):0),my+24); ctx.rotate(wob); ctx.scale(sx,Math.max(.08,sy));
      const src=white?BOSS_WHITE.scare:img;
      if(t<26) ctx.drawImage(src,-12,-24); else ctx.drawImage(src,0,ML_HAT_H,24,24-ML_HAT_H,-12,-24+ML_HAT_H,24,24-ML_HAT_H); // sin sombrero desde que sale volando
      ctx.restore(); }
    // el montón de paja que queda (con el palo roto asomando)
    const pile=mlSeg(t,56,72)*(1-mlSeg(t,108,124));
    if(pile>0){ const w=Math.round(8+pile*12), h=Math.max(1,Math.round(pile*6));
      for(let x=-w;x<w;x++){ const hh=Math.round(h*Math.sqrt(Math.max(0,1-(x*x)/(w*w)))); if(hh<=0) continue; ctx.fillStyle=ML_INK; ctx.fillRect(cx+x,my+23-hh,1,1);
        for(let y=0;y<hh;y++){ ctx.fillStyle=((x*3+y*5+(hash(x+40,y+40)&3))%4)===0?'#fff0a0':(y===hh-1?'#f0d060':'#c8a040'); ctx.fillRect(cx+x,my+23-y,1,1); } }
      ctx.fillStyle=ML_INK; ctx.fillRect(cx-3,my+21-Math.round(h*.6),7,3); ctx.fillStyle='#6a4020'; ctx.fillRect(cx-2,my+22-Math.round(h*.6),5,1); }
    // el sombrero: sale volando girando y un cuervo lo caza al vuelo y se lo lleva
    if(t>=26){ const u=t-26, caught=u>=34, hx=caught?cx+side*(34*.6+(u-34)*2.2):cx+side*u*.6, hy=caught?my+2-34*1.5+34*34*.028-(u-34)*1.4:my+2-u*1.5+u*u*.028;
      if(hy>-14&&hx>-16&&hx<VW+16){ ctx.save(); ctx.translate(Math.round(hx),Math.round(hy)); if(!caught) ctx.scale(Math.max(.2,Math.abs(Math.cos(u*.35))),1); ctx.drawImage(img,0,0,24,ML_HAT_H,-12,-3,24,ML_HAT_H); ctx.restore();
        if(caught||u>20){ const cu=caught?0:(34-u), fx=Math.round(hx+side*cu*3.2), fy=Math.round(hy-8-cu*1.4), im=ML_CROW.fly[(t>>2)&1];
          ctx.save(); ctx.translate(fx,fy); if(side<0) ctx.scale(-1,1); ctx.drawImage(im,-4,0); ctx.restore(); } } }
    // otros dos cuervos bajan a picotear el montón y se van con briznas cuando llega la ráfaga
    for(let c=0;c<2;c++){ const u=t-(58+c*10); if(u<0) continue; const tx=cx+(c?9:-13), ty=my+15; let x, y, im;
      if(u<18){ const k=presentEase.out(u/18); x=tx+(1-k)*(c?90:-90); y=ty-(1-k)*60; im=ML_CROW.fly[(t>>2)&1]; }
      else if(t<106){ x=tx; y=ty; im=ML_CROW.sit[((t+c*11)%16)<4?1:0]; }
      else { const v=t-106; x=tx+(c?1:-1)*v*2.6; y=ty-v*1.6; im=ML_CROW.fly[(t>>2)&1]; if(y<-10) continue; ctx.fillStyle='#f0d060'; ctx.fillRect(Math.round(x)+(c?-3:1),Math.round(y)+5,3,1); }
      ctx.save(); ctx.translate(Math.round(x),Math.round(y)); if(c?t<106:t>=106) ctx.scale(-1,1); ctx.drawImage(im,-3,0); ctx.restore(); }
    // el destello donde cae el molinillo
    if(t>=118){ const s=Math.max(0,Math.round(6-Math.abs(t-128)*.5)); caStar(mx+12,my+12,s,'#fffbe8'); } } };
