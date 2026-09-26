'use strict';
/* ============================================================
   15k · EL TRONCO HUECO (mazmorra 2 · la Lágrima, el verano)
   Panal, miel, abejas y madera. Contrato de los registros en 15i.
   · DNG_CARD.tronco   el título al entrar: el panal se llena celda a celda,
                       la miel gotea, cruzan abejas y cae el nombre.
   · BOSS_INTRO.drone  el Soldado de Cera entra en picado y saluda.
   · BOSS_INTRO.avispa el enjambre forma a la Reina, que se posa en su
                       trono de panal; título con golpe (y su eco).
   · BOSS_OUTRO.avispa una gota de miel envuelve a Sprout y el enjambre
                       se lo lleva volando a la puerta del Tronco.
   Todo a tamaño nativo; draw(t,P) solo depende de t.
   ============================================================ */
const TK_HONEY=['#fff8c0','#f8d848','#e0a830','#b07818','#6a4210'];
const TK_AMBER=['#f0b840','#c8861c','#9a5e12','#6a3c0a'];         // la miel de las celdas: más honda que la del texto
const TK_ECHO=['#f4eeff','#d8c8ff','#a890e8','#7058b8','#3a2870'];  // el eco: la misma miel, en violeta
const TK_INK='#1a0e04', TK_WALL='#4a2610', TK_CELL='#241006';
const TK_HW=[5,7,9,9,9,9,7,5];                                      // una celda de panal: 9×8, lados en punta

/* ---------- piezas de dibujo ---------- */
/* celda de panal centrada en (cx,cy); frac: cuánta miel (se llena desde abajo); empty: color del hueco (null: sin fondo) */
function tkHex(cx,cy,frac,pal,edge,empty){ cx=Math.round(cx); cy=Math.round(cy);
  ctx.fillStyle=edge||TK_WALL; for(let r=0;r<8;r++){ const w=TK_HW[r]; ctx.fillRect(cx-(w>>1),cy-4+r,w,1); }
  for(let r=1;r<7;r++){ const w=TK_HW[r]-2, x0=cx-(w>>1), full=(7-r)/6<=frac+1e-6;
    if(full){ ctx.fillStyle=pal[r<3?0:r<5?1:2]; ctx.fillRect(x0,cy-4+r,w,1); if(r===6){ ctx.fillStyle=pal[3]; ctx.fillRect(x0+1,cy+2,w-2,1); } }
    else if(empty){ ctx.fillStyle=empty; ctx.fillRect(x0,cy-4+r,w,1); } }
  if(frac>=1){ ctx.fillStyle='#fff8d8'; ctx.fillRect(cx-2,cy-3,2,1); ctx.fillRect(cx-3,cy-2,1,1); } } // el brillo de la miel
/* una abeja de 4×2 con alas que baten; dir 1 mira a la derecha */
function tkBee(x,y,f,dir,pal){ x=Math.round(x); y=Math.round(y); const P=pal||TK_HONEY, d=dir<0?-1:1, X=i=>d>0?x+i:x+3-i;
  ctx.fillStyle='#eaf6ff'; if(f&1){ ctx.fillRect(X(1),y-2,1,2); ctx.fillRect(X(2),y-2,1,1); } else { ctx.fillRect(X(0),y-1,1,1); ctx.fillRect(X(2),y-1,2,1); }
  ctx.fillStyle=TK_INK; ctx.fillRect(x,y,4,2); ctx.fillRect(X(-1),y+1,1,1);
  ctx.fillStyle=P[1]; ctx.fillRect(X(0),y,1,2); ctx.fillRect(X(2),y,1,2); }
/* letras grandes de miel: cada píxel de la fuente se hace un bloque 2×2 con su luz, un canto oscuro debajo y contorno de 1 px */
const TK_BIG=new Map();
function tkBig(s,pal){ const key=s+'|'+pal.join(); let c=TK_BIG.get(key); if(c) return c;
  const w=textW(s)+2, h=FONT_M.h+FONT_M.asc+3, m=mkCanvas(w,h), mg=m.getContext('2d'); drawText(mg,s,1,1+FONT_M.asc,'#ffffff','left',FONT_M);
  const D=mg.getImageData(0,0,w,h).data, on=(x,y)=>x>=0&&y>=0&&x<w&&y<h&&D[(y*w+x)*4+3]>128;
  let y0=h, y1=0; for(let y=0;y<h;y++) for(let x=0;x<w;x++) if(on(x,y)){ y0=Math.min(y0,y); y1=Math.max(y1,y); }
  const W=w*2+2, H=(y1-y0+1)*2+5, B=pxBuf(W,H), GH=(y1-y0+1)*2;
  for(let y=y0;y<=y1;y++) for(let x=0;x<w;x++) if(on(x,y)){ const X=1+2*x, Y=1+2*(y-y0); B.rect(X,Y+2,2,2,pal[4]); } // el canto
  for(let y=y0;y<=y1;y++) for(let x=0;x<w;x++) if(on(x,y)){ const X=1+2*x, Y=1+2*(y-y0);
    for(let by=0;by<2;by++){ const k=(Y+by-1)/GH, col=pal[k<.2?0:k<.5?1:k<.8?2:3]; B.rect(X,Y+by,2,1,col); }
    if(!on(x,y-1)) B.rect(X,Y,2,1,pal[0]); if(!on(x-1,y)&&on(x,y-1)) B.set(X,Y,pal[0]); }
  const d=B.d, filled=i=>d[i]!==0, ink=pxCol(TK_INK), out=[];
  for(let y=0;y<H;y++) for(let x=0;x<W;x++){ const i=y*W+x; if(filled(i)) continue;
    if((x>0&&filled(i-1))||(x<W-1&&filled(i+1))||(y>0&&filled(i-W))||(y<H-1&&filled(i+W))) out.push(i); }
  for(const i of out) d[i]=ink;
  c=B.canvas(); TK_BIG.set(key,c); return c; }
/* un brillo en diagonal que cruza lo opaco de img (k de 0 a 1) */
let TK_SH=null;
function tkShine(img,x,y,k){ if(!TK_SH||TK_SH.width<img.width||TK_SH.height<img.height) TK_SH=mkCanvas(Math.max(img.width,TK_SH?TK_SH.width:0),Math.max(img.height,TK_SH?TK_SH.height:0));
  const g=TK_SH.getContext('2d'); g.clearRect(0,0,TK_SH.width,TK_SH.height); g.drawImage(img,0,0); g.globalCompositeOperation='source-atop';
  const bx=Math.round(-20+(img.width+40)*k); g.fillStyle='#ffffff'; for(let yy=0;yy<img.height;yy++){ g.fillRect(bx-yy,yy,3,1); g.fillRect(bx+5-yy,yy,1,1); }
  g.globalCompositeOperation='source-over'; ctx.drawImage(TK_SH,0,0,img.width,img.height,x,y,img.width,img.height); }
const TK_TEAR=sprN([
"...k...",
"..kbk..",
"..kbk..",
".kwbbk.",
".kwbbk.",
"kwbbbbk",
"kwbbbdk",
"kbbbbdk",
"kbbbddk",
".kbddk.",
"..kkk.."],{b:'#58b8f0',w:'#d8f4ff',d:'#2878c8',k:TK_INK});
/* texto a máquina: los primeros n caracteres */
function tkType(s,n){ return s.slice(0,Math.max(0,Math.floor(n))); }
/* cuánto se ha tardado en entrar y cuánto falta para salir, en fotogramas del guion */
function tkRem(P){ return P.dur-Math.min(P.t,P.dur); }
/* un sitio para presentarse: lejos de Sprout (BOSS_ROOM) y con aire alrededor (si el que le dio presentPlaceBoss
   queda pegado a una pared, el hueco válido más cercano a él). Cambia B.x/B.y: la pelea empieza ahí */
function tkSpot(B,w,h,x0,x1,y0,y1){ const pcx=player.x+8, pcy=player.y+10, ok=(x,y)=>x>=x0&&x<=x1&&y>=y0&&y<=y1&&Math.hypot(x+w/2-pcx,y+h/2-pcy)>=BOSS_ROOM;
  if(ok(B.x,B.y)) return; let best=null, bd=1e9;
  for(let y=y0;y<=y1;y+=4) for(let x=x0;x<=x1;x+=4){ if(!ok(x,y)) continue; const d=Math.hypot(x-B.x,y-B.y); if(d<bd){ bd=d; best=[x,y]; } }
  if(best){ B.x=best[0]; B.y=best[1]; } }
function tkNearSprout(x,y){ return !playerHidden&&x>player.x-5&&x<player.x+17&&y>player.y-4&&y<player.y+18; } // una abeja que pasa por detrás de Sprout
/* ---------- sonidos (propios de la mazmorra) ---------- */
function tkBuzz(vol,dur,lo){ if(!AC) return; const t=AC.currentTime, f0=lo||150; swish(dur,vol,f0*2,f0*3.2,f0*2.4,t,5); beep('sawtooth',f0,f0*1.08,dur,vol*.22,t,true); }
function tkThud(big){ if(!AC) return; const t=AC.currentTime; beep('triangle',big?150:120,38,big?.3:.18,big?.11:.07,t); noise(big?.18:.1,big?.07:.04,false,t,700); }
function tkChord(root){ if(!AC) return; const t=AC.currentTime; [0,4,7,12].forEach((m,i)=>{ beep('p25',f(root+m),0,.5-i*.05,.035,t+i*.06); beep('square',f(root+m-12),0,.16,.018,t+i*.06); }); }
function tkPlip(n){ if(!AC) return; const t=AC.currentTime; beep('p125',f(79+n),0,.06,.02,t); beep('triangle',f(67+n),0,.05,.015,t); }
function tkPop(){ if(!AC) return; const t=AC.currentTime; beep('square',880,180,.09,.045,t); noise(.1,.05,true,t,2600); beep('triangle',f(84),0,.2,.03,t+.04); }
function tkBloop(up){ if(!AC) return; const t=AC.currentTime; beep('triangle',up?260:520,up?560:240,.16,.05,t); }
function tkShing(){ if(!AC) return; const t=AC.currentTime; swish(.25,.04,5000,7200,6000,t,3,true); beep('p125',f(96),0,.2,.018,t); }

/* =========================================================
   1) EL TÍTULO: «MAZMORRA 2 · EL TRONCO HUECO»
   ========================================================= */
const TK_CARD_CELLS=(()=>{ const out=[]; // el panal de la franja: de dentro afuera
  for(let c=-12;c<=12;c++) for(let r=-4;r<=4;r++){ const x=80+c*7, y=66+r*8+((c&1)?4:0); if(y<40||y>92||x<-6||x>166) continue;
    const d=Math.hypot(x-80,(y-66)*1.6), h=hash(c+20,r+20); out.push({x,y,d,full:(h%5)!==0&&!(Math.abs(y-64)<=13&&Math.abs(x-80)<=74),t0:4+d*.42+(h%5)}); } // detrás del nombre, celdas vacías: el panal lo enmarca
  return out.sort((a,b)=>a.d-b.d); })();
const TK_DRIPS=[18,37,52,71,96,113,131,146].map((x,i)=>({x,ts:50+i*7+(hash(i,3)%6),L:3+(hash(i,9)%4)}));
DNG_CARD.tronco={ dur:190, shortDur:112,
  start(P){ P.st.o=P.short?50:0; },
  tick(t,P){ const u=t+P.st.o;
    if(u===2||u===52) tkBuzz(.03,.7);
    if(u>=16&&u<=56&&u%5===1) tkPlip(((u-16)/5)|0);
    if(u===30) tkBloop(true);
    if(u===58){ tkThud(true); tkChord(72); shake=Math.max(shake,3); }
    if(u===98) tkShing(); },
  draw(t,P){ const u=t+P.st.o, out=Math.min(1,tkRem(P)/16)*Math.min(1,(t+1)/8), A=out; // entra y sale fundido (la versión corta empieza con el panal ya lleno)
    ctx.fillStyle='rgba(24,12,2,'+(.62*Math.min(1,u/10)*out).toFixed(3)+')'; ctx.fillRect(-4,-4,VW+8,VH+8);
    ctx.globalAlpha=A;
    // el panal: primero las paredes, luego la miel (se llena desde abajo)
    for(const C of TK_CARD_CELLS){ if(u<C.t0) continue; tkHex(C.x,C.y,C.full?presentSeg(u,C.t0+6,C.t0+14):0,TK_AMBER,TK_WALL,TK_CELL); }
    // gotas de miel que cuelgan del borde de abajo
    for(const D of TK_DRIPS){ if(u<D.ts) continue; const L=Math.min(D.L,(u-D.ts)*.3), y0=95;
      ctx.fillStyle=TK_AMBER[1]; ctx.fillRect(D.x,y0,2,Math.round(L)); ctx.fillStyle=TK_AMBER[0]; ctx.fillRect(D.x,y0,1,Math.round(L));
      ctx.fillStyle=TK_AMBER[1]; ctx.fillRect(D.x-1,y0+Math.round(L)-1,4,2); ctx.fillStyle='#fff8d8'; ctx.fillRect(D.x,y0+Math.round(L)-1,1,1);
      const ph=u-D.ts-26; if(ph>0){ const p=ph%46, y=y0+L+2+p*p*.035; if(y<VH){ ctx.fillStyle=TK_AMBER[1]; ctx.fillRect(D.x,Math.round(y),2,2); ctx.fillStyle='#fff8d8'; ctx.fillRect(D.x,Math.round(y),1,1); } } }
    // la Lágrima en su medallón
    if(u>=28){ const k=presentEase.back(presentSeg(u,28,38)), cy=Math.round(30-(1-k)*10);
      tkHexBig(80,cy+4,TK_HONEY); ctx.drawImage(TK_TEAR,77,cy-2);
      if(u<40){ ctx.fillStyle='#fff8d8'; const r=Math.round((u-28)*1.6); for(let i=0;i<12;i++){ const a=i/12*6.283; ctx.fillRect(Math.round(80+Math.cos(a)*r),Math.round(cy+4+Math.sin(a)*r*.8),1,1); } }
      if(((u>>3)%9)===0) caStar(79,cy,1+((u>>1)&1),'#ffffff'); }
    // los textos
    if(u>=44){ const n=(u-44)*1.2; txtOL(tkType('MAZMORRA 2',n),80,45,TK_HONEY[1],'center',TK_INK,FONT_S); }
    if(u>=50) txtOL('— EL —',80,52,'#fff0c8','center',TK_INK);
    if(u>=52){ const img=tkBig('TRONCO HUECO',TK_HONEY), x=Math.round(80-img.width/2), k=presentSeg(u,52,58);
      let y=Math.round(62-(1-presentEase.in(k))*34); if(u>58) y+=Math.round(Math.sin((u-58)*.9)*3*Math.exp(-(u-58)*.22));
      if(u>=96&&u<118) tkShine(img,x,y,(u-96)/22); else ctx.drawImage(img,x,y);
      // la miel que escurre de las letras
      if(u>60) for(let i=0;i<6;i++){ const dx=x+12+i*((img.width-24)/5|0)+(hash(i,5)%5), L=Math.min(2+hash(i,7)%4,(u-60-i*4)*.15); if(L>0){ ctx.fillStyle=TK_HONEY[3]; ctx.fillRect(dx,y+img.height-2,1,Math.round(L)+1); ctx.fillStyle=TK_HONEY[2]; ctx.fillRect(dx-1,y+img.height-2+Math.round(L),2,2); } } }
    if(u>=66) txtOL(tkType('donde el verano guarda su Lágrima',(u-66)*.9),80,106,'#fff4d8','center',TK_INK);
    // abejas que cruzan con su estela de puntos
    for(let i=0;i<3;i++){ const s=18+i*24, v=u-s; if(v<0) continue; const bx=-8+v*1.9, Y=[42,90,66][i], at=q=>[-8+q*1.9,Y+Math.sin(q*.16+i)*6];
      if(bx>VW+10) continue; for(let k=1;k<=6;k++){ const q=v-k*3; if(q<0) break; const [px,py]=at(q); ctx.fillStyle=k<3?TK_HONEY[1]:TK_HONEY[3]; ctx.fillRect(Math.round(px),Math.round(py)+1,1,1); }
      const [px,py]=at(v); tkBee(px,py,u>>1,1); }
    ctx.globalAlpha=1; } };
/* la celda grande del medallón (15 de ancho) */
function tkHexBig(cx,cy,pal){ const W=[7,9,11,13,15,15,15,15,15,13,11,9,7]; cx=Math.round(cx); cy=Math.round(cy);
  W.forEach((w,r)=>{ ctx.fillStyle=TK_INK; ctx.fillRect(cx-(w>>1)-1,cy-7+r,w+2,1); }); ctx.fillStyle=TK_INK; ctx.fillRect(cx-3,cy-8,7,1); ctx.fillRect(cx-3,cy+6,7,1);
  W.forEach((w,r)=>{ ctx.fillStyle=pal[r<3?1:r<9?2:3]; ctx.fillRect(cx-(w>>1),cy-7+r,w,1); });
  ctx.fillStyle=pal[0]; ctx.fillRect(cx-3,cy-7,4,1); ctx.fillRect(cx-5,cy-6,1,2); }

/* =========================================================
   2) EL SOLDADO DE CERA: entra en picado, saluda, y su franja a rayas
   ========================================================= */
const TK_BEE=['#fff8c0','#f8e048','#f0c020','#c08010','#5a3a08'];   // amarillo de cera para el nombre del Soldado
/* el picado: el punto más hondo que queda lejos de Sprout (nunca cae sobre él) y dentro de la sala */
const TK_DIVES=[[0,50],[-24,46],[24,46],[-36,36],[36,36],[0,32],[-44,20],[44,20],[0,18],[-30,10],[30,10],[0,8]];
function tkDiveFor(m0){ const pcx=player.x+8, pcy=player.y+10;
  for(const [dx,dy] of TK_DIVES){ const x=m0.x+dx, y=m0.y+dy; if(x<4||x>VW-28||y+24>PLAY_H-6) continue;
    if(Math.hypot(x+12-pcx,y+12-pcy)>=44) return [dx,dy]; }
  return [0,4]; }
function tkDroneAt(P,u){ const m0=P.st.m0, sx0=P.st.side>0?172:-44, D=P.st.dive; // dónde está el Soldado en el guion
  if(u<4) return null;
  if(u<48){ const k=presentSeg(u,4,46), e=presentEase.out(k); return [sx0+(m0.x-sx0)*e+Math.sin(k*9.42)*16*(1-k), m0.y-16*Math.sin(k*Math.PI)+Math.sin(u*.3)*2]; } // entra por el lado contrario a Sprout
  if(u<54) return [m0.x,m0.y-8*presentEase.out(presentSeg(u,48,54))];                // coge impulso
  if(u<60){ const k=presentEase.in(presentSeg(u,54,60)); return [m0.x+D[0]*k,m0.y-8+(D[1]+8)*k]; } // ¡picado!
  if(u<74){ const k=1-presentEase.out(presentSeg(u,60,74)); return [m0.x+D[0]*k,m0.y+D[1]*k]; } // y sube como si nada
  return [m0.x+Math.round(Math.sin(u*.05)*3),m0.y+Math.round(Math.sin(u*.12)*2)]; }
function tkDrawDrone(P,x,y){ const m=midboss; if(!m) return; const ox=m.x, oy=m.y; m.x=x; m.y=y; drawMidboss(); m.x=ox; m.y=oy; }
BOSS_INTRO.drone={ dur:178, shortDur:88,
  start(P){ const m=midboss; tkSpot(m,24,24,12,VW-36,18,60); P.st.m0={x:m.x,y:m.y}; P.st.o=P.short?66:0; bossHidden=true;
    P.st.side=(player.x+8)<(m.x+12)?1:-1; P.st.dive=tkDiveFor(P.st.m0); },
  tick(t,P){ const u=t+P.st.o, m0=P.st.m0;
    if(u>=4&&u<48&&u%12===4) tkBuzz(.02+.02*(u/48),.3,190);
    if(u===54) tkBuzz(.06,.2,260);
    if(u===60){ const D=P.st.dive, lx=m0.x+D[0]+12, ly=m0.y+D[1]+22; tkThud(true); shake=Math.max(shake,5);
      for(let i=0;i<12;i++){ const a=Math.PI+i/11*Math.PI; parts.push({k:'dust',x:lx+Math.cos(a)*7,y:ly,vx:Math.cos(a)*1.1,vy:-.2-Math.random()*.4,life:20,max:20,r:1+(i&1),col:groundDustCol(),nog:true}); }
      parts.push({x:lx,y:ly-2,vx:0,vy:0,life:10,col:'#fff8c0',ring:true,r:14,nog:true}); }
    if(u===78) tkThud(false);
    if(u===84){ tkThud(true); tkChord(67); shake=Math.max(shake,4); presentMusic(P); }
    if(u===112) tkShing();
    if(u>84&&(u-84)%36===18&&AC) beep('square',1400,2200,.05,.018,AC.currentTime); },
  draw(t,P){ const u=t+P.st.o, rem=tkRem(P), pos=tkDroneAt(P,u);
    if(pos){ const x=Math.round(pos[0]), y=Math.round(pos[1]);
      glowAt(x+12,y+12,28,'rgba(255,226,140,.16)'); // se le ve en la penumbra del nido
      if(u<48){ ctx.fillStyle='rgba(255,248,200,.55)'; for(let i=0;i<5;i++){ const yy=y+4+i*4, L=6+((i*7+u)%9); ctx.fillRect(P.st.side>0?x+26+(i&1)*3:x-2-(i&1)*3-L,yy,L,1); } } // la estela, detrás
      if(u>=54&&u<62){ ctx.fillStyle='rgba(255,248,200,.6)'; for(let i=0;i<5;i++) ctx.fillRect(x+2+i*5,y-8-((i*5)%9),1,8); }
      tkDrawDrone(P,x,y);
      if(u>=74&&(u-74)%36<5){ const g=3-Math.abs(((u-74)%36)-2); caStar(x+12,y+23,g,'#ffffff'); } } // el aguijón brilla
    const bk=Math.min(presentSeg(u,66,74),rem/12); presentBars(bk,16);
    if(u>=90&&bk>.9) txtOL(tkType('CORAZA DE CERA DURA',(u-90)*1.2),80,VH-10,'#e0a830','center',TK_INK,FONT_S);
    if(u>=72){ const inK=presentEase.out(presentSeg(u,72,82)), outK=presentEase.in(clamp(1-rem/16,0,1)), x=Math.round((1-inK)*VW-outK*VW), y0=80;
      ctx.save(); ctx.translate(x,0);
      ctx.fillStyle='#140c04'; ctx.fillRect(0,y0,VW,46);
      for(const yy of [y0,y0+43]){ ctx.fillStyle='#f8d030'; ctx.fillRect(0,yy,VW,3); ctx.fillStyle=TK_INK; const o=(u>>1)%8; for(let xx=-8+o;xx<VW;xx+=8) for(let r=0;r<3;r++) ctx.fillRect(xx+r,yy+r,3,1); }
      ctx.fillStyle='#3a2410'; ctx.fillRect(0,y0+3,VW,1); ctx.fillRect(0,y0+42,VW,1);
      for(let c=-1;c<25;c++) for(let r=0;r<5;r++){ const hx=c*7, hy=y0+8+r*8+((c&1)?4:0); ctx.fillStyle='#22160a'; ctx.fillRect(hx-2,hy-4,5,1); ctx.fillRect(hx-4,hy-2,1,4); ctx.fillRect(hx+4,hy-2,1,4); ctx.fillRect(hx-2,hy+3,5,1); }
      txtOL('MINIJEFE',80,y0+6,'#f8d030','center',TK_INK,FONT_S);
      if(u>=78){ const k=presentEase.out(presentSeg(u,78,84)); txtOL('EL SOLDADO',Math.round(80+(1-k)*80),y0+13,'#fffbe8','center',TK_INK); }
      if(u>=80){ const img=tkBig('DE CERA',TK_BEE), ix=Math.round(80-img.width/2), k=presentSeg(u,80,84);
        let iy=Math.round(y0+23-(1-presentEase.in(k))*30); if(u>84) iy+=Math.round(Math.sin((u-84)*1.1)*3*Math.exp(-(u-84)*.25));
        if(u>=112&&u<132) tkShine(img,ix,iy,(u-112)/20); else ctx.drawImage(img,ix,iy); }
      ctx.restore(); } },
  end(P){ bossHidden=false; } };

/* =========================================================
   3) LA REINA AVISPA: el enjambre la forma y se posa en su trono
   ========================================================= */
const TK_QPTS=(()=>{ const c=BOSS_SPR.avispa, g=c.getContext('2d'), d=g.getImageData(0,0,c.width,c.height).data, all=[];
  for(let y=0;y<c.height;y++) for(let x=0;x<c.width;x++) if(d[(y*c.width+x)*4+3]>128) all.push([x,y]);
  const out=[], n=56; for(let i=0;i<n;i++) out.push(all[Math.floor((i*all.length)/n+(hash(i,1)%3))%all.length]); return out; })();
let TK_QSIL=null; function tkQueenSil(){ return TK_QSIL||(TK_QSIL=tintTo(BOSS_SPR.avispa,TK_INK)); }
let TK_QSILE=null; function tkQueenSilE(){ return TK_QSILE||(TK_QSILE=tintTo(BOSS_SPR.avispa,'#3a2870')); }
const TK_THRONE=(()=>{ const out=[]; // el trono: un abanico de celdas detrás de la Reina (relativo a su centro)
  for(let c=-6;c<=6;c++) for(let r=-6;r<=3;r++){ const x=c*7, y=r*8+((c&1)?4:0), d=Math.hypot(x,y*1.25); if(d>34||y>18||y<-20) continue;
    const h=hash(c+30,r+30); out.push({x,y,d,t0:124+d*.8+(h%4),fall:h%13,full:(h%6)!==0}); }
  return out.sort((a,b)=>a.d-b.d); })();
function tkQueenOrbit(i,u,cx,cy){ const s=(i%14)*3, k=presentEase.out(presentSeg(u,s,s+72)), r=140-114*k, a=i*2.39996+u*.075;
  return [cx+Math.cos(a)*r,cy+Math.sin(a)*r*.58]; }
function tkQueenBee(i,u,P){ const b0=P.st.b0, cx=b0.x+16, cy=b0.y+16, o=tkQueenOrbit(i,u,cx,cy), k=presentEase.io(presentSeg(u,82,116)), T=TK_QPTS[i];
  return [o[0]+(b0.x+T[0]-o[0])*k,o[1]+(b0.y-10+T[1]-o[1])*k]; }
function tkQueenY(P,u){ const b0=P.st.b0; return b0.y-10+10*presentEase.back(presentSeg(u,118,146)); } // se posa: baja, se pasa un poco y se asienta
function tkDrawQueen(P,u){ const b=boss; if(!b) return; const oy=b.y, ox=b.x; b.x=P.st.b0.x; b.y=Math.round(tkQueenY(P,u));
  if(P.Q.echo){ glowAt(b.x+16,b.y+16,30,'rgba(170,140,255,'+(0.3+0.1*Math.sin(tick*.1)).toFixed(2)+')'); ctx.save(); ctx.globalAlpha*=.8; drawBoss(); ctx.restore(); } else drawBoss();
  b.x=ox; b.y=oy; }
BOSS_INTRO.avispa={ dur:330, shortDur:112,
  start(P){ const b=boss; tkSpot(b,32,32,28,VW-60,24,76); P.st.b0={x:b.x,y:b.y}; P.st.o=P.short?160:0; P.st.y0=b.y+16>60?17:78; /* aire para el trono de panal; la franja del título, en la mitad donde no está ella */ bossHidden=true; if(!P.short) setTrack('silencio'); },
  tick(t,P){ const u=t+P.st.o, E=P.Q.echo;
    if(u<116&&u%14===2) tkBuzz(.012+.035*(u/116),.5,E?120:150+u*.5);
    if(u===116){ tkBuzz(.06,.4,260); }
    if(u===118){ screenFlash(6,E?'#e8e0ff':'#fff6c0'); shake=Math.max(shake,5); tkChord(E?60:64);
      const b0=P.st.b0; for(let i=0;i<18;i++){ const a=i/18*6.283, s=1+Math.random()*1.4; parts.push({k:'shard',x:b0.x+16,y:b0.y+10,vx:Math.cos(a)*s,vy:Math.sin(a)*s-.4,life:16,max:16,col:i&1?(E?'#d8c8ff':'#f8d848'):'#ffffff'}); } }
    if(u>=124&&u<=156&&u%4===0) tkPlip(((u-124)/4)|0);
    if(u===172&&!P.short) tkBuzz(.03,.3,200);
    if(u===179){ tkThud(true); shake=Math.max(shake,6); presentMusic(P); tkChord(E?57:60); }
    if(u===216) tkShing();
    if(tkRem(P)===30){ tkBloop(false); } },
  draw(t,P){ const u=t+P.st.o, rem=tkRem(P), E=P.Q.echo, pal=E?TK_ECHO:TK_HONEY, cellPal=E?TK_ECHO.slice(1):TK_AMBER, b0=P.st.b0, cx=b0.x+16, qy=tkQueenY(P,u), cy=qy+16;
    // la sala se apaga mientras llega el enjambre y vuelve cuando ella está
    const dark=Math.min(.6,u/30*.6)*(1-presentSeg(u,120,150))*(Math.min(1,rem/20));
    if(dark>0){ ctx.fillStyle=(E?'rgba(14,8,30,':'rgba(16,8,2,')+dark.toFixed(3)+')'; ctx.fillRect(-4,-4,VW+8,VH+8); }
    // el trono de panal, detrás de ella (al final se derrite en gotas)
    const melt=rem<=34?1-rem/34:0;
    for(const C of TK_THRONE){ if(u<C.t0) continue; const d=melt>0?clamp(melt*1.6-C.fall/20,0,1):0; if(d>=1) continue;
      const y=cy+C.y+d*d*70; ctx.globalAlpha=1-d*.6; tkHex(cx+C.x,y,C.full?presentSeg(u,C.t0+2,C.t0+8):0,cellPal,E?'#2a1e50':TK_WALL,E?'#140c28':TK_CELL); ctx.globalAlpha=1;
      if(C.y>=10&&!d&&u>C.t0+10){ const L=Math.min(4,(u-C.t0-10)*.2); ctx.fillStyle=cellPal[1]; ctx.fillRect(Math.round(cx+C.x),Math.round(y+4),1,Math.round(L)+1); } }
    // el enjambre: gira, se cierra y dibuja su silueta
    if(u<=120){ const k=presentSeg(u,100,116); if(k>0){ ctx.globalAlpha=k; ctx.drawImage(E?tkQueenSilE():tkQueenSil(),b0.x,b0.y-10); ctx.globalAlpha=1; }
      if(u<118) for(let i=0;i<TK_QPTS.length;i++){ const [x,y]=tkQueenBee(i,u,P), f=(u+i)>>1; if(tkNearSprout(x,y)) continue; tkBee(x,y,f,Math.cos(i*2.39996+u*.075)<0?1:-1,pal); }
      if(u>=118) ctx.drawImage(BOSS_WHITE.avispa,b0.x,b0.y-10); }
    else if(u<122) ctx.drawImage(BOSS_WHITE.avispa,b0.x,Math.round(qy));
    else tkDrawQueen(P,u);
    // ojos que brillan
    if(u>=200&&u<212||u>=250&&u<260){ const g=Math.round(3-Math.abs((u>=250?u-255:u-206))/2); caStar(b0.x+11,Math.round(qy)+9,g,'#ffffff'); caStar(b0.x+21,Math.round(qy)+9,g,'#ffffff'); }
    // letterbox y título
    presentBars(Math.min(presentSeg(u,158,168),rem/12),16);
    if(u>=170){ const fade=Math.min(1,rem/14); ctx.globalAlpha=fade;
      // la franja de cera: arriba un filo de miel que gotea, abajo un canto dorado
      const bk=presentEase.out(presentSeg(u,170,178)), bw=Math.round(VW*bk), bx0=Math.round(80-bw/2), y0=P.st.y0||78, BH=44;
      ctx.fillStyle=E?'#140c28':'#1e1004'; ctx.fillRect(bx0,y0,bw,BH);
      ctx.save(); ctx.beginPath(); ctx.rect(bx0,y0,bw,BH); ctx.clip();
      for(let c=-1;c<=24;c++) for(let r=0;r<6;r++){ const x=c*7, y=y0+4+r*8+((c&1)?4:0); ctx.fillStyle=E?'#1e1438':'#2c1608'; ctx.fillRect(x-2,y-4,5,1); ctx.fillRect(x-4,y-2,1,4); ctx.fillRect(x+4,y-2,1,4); ctx.fillRect(x-2,y+3,5,1); }
      ctx.restore();
      ctx.fillStyle=TK_INK; ctx.fillRect(bx0,y0-1,bw,1); ctx.fillRect(bx0,y0+BH,bw,1);
      ctx.fillStyle=pal[2]; ctx.fillRect(bx0,y0,bw,2); ctx.fillStyle=pal[1]; ctx.fillRect(bx0,y0,bw,1);
      ctx.fillStyle=pal[3]; ctx.fillRect(bx0,y0+BH-2,bw,2); ctx.fillStyle=pal[2]; ctx.fillRect(bx0,y0+BH-2,bw,1);
      for(let i=0;i<12;i++){ const dx=6+i*13+(hash(i,11)%6); if(dx<bx0||dx>bx0+bw-2) continue; const L=Math.min(2+hash(i,13)%5,Math.max(0,(u-176-i*3)*.2)); if(L<=0) continue;
        ctx.fillStyle=pal[2]; ctx.fillRect(dx,y0+2,1,Math.round(L)); ctx.fillStyle=pal[1]; ctx.fillRect(dx-1,y0+1+Math.round(L),2,2);
        const ph=u-190-i*5; if(ph>0){ const p=ph%40, yy=y0+4+L+p*p*.04; if(yy<y0+10&&(dx<60||dx>100)||yy<y0+BH-4&&(dx<30||dx>130)){ ctx.fillStyle=pal[1]; ctx.fillRect(dx,Math.round(yy),1,2); } } }
      const small=E?'ECO DE LA':'LA REINA', big=E?'REINA':'AVISPA', sub=E?'un recuerdo que aún zumba':'guardiana de la Lágrima';
      if(u>=172){ const k=presentEase.out(presentSeg(u,172,180)); txtOL(small,Math.round(80-(1-k)*90),y0+4,pal[1],'center',TK_INK); }
      if(u>=174){ const img=tkBig(big,pal), x=Math.round(80-img.width/2), k=presentSeg(u,174,179);
        let y=Math.round(y0+12-(1-presentEase.in(k))*44); if(u>179) y+=Math.round(Math.sin((u-179)*.95)*3*Math.exp(-(u-179)*.22));
        if(u>=216&&u<238) tkShine(img,x,y,(u-216)/22); else ctx.drawImage(img,x,y); }
      if(u>=190) txtOL(tkType(sub.toUpperCase(),(u-190)*.8),80,y0+35,pal[1],'center',TK_INK,FONT_S);
      // la escolta: abejas que rondan a su reina mientras dura el título
      if(u>=180) for(let i=0;i<5;i++){ const a=u*.07+i*1.2566, r=24+Math.sin(u*.05+i)*3, x=cx+Math.cos(a)*r, y=cy-2+Math.sin(a)*r*.45; tkBee(x,y,(u+i)>>1,-Math.sin(a)>0?1:-1,pal); }
      ctx.globalAlpha=1; }
    // alas que zumban: rayitas junto a ella mientras dura el título
    if(u>=150&&rem>20&&(u&2)){ ctx.fillStyle='rgba(255,255,255,.6)'; const q=Math.round(qy); ctx.fillRect(b0.x-3,q+6,2,1); ctx.fillRect(b0.x-4,q+10,3,1); ctx.fillRect(b0.x+33,q+6,2,1); ctx.fillRect(b0.x+33,q+10,3,1); } },
  end(P){ bossHidden=false; const b=boss; if(b&&P.st.b0){ b.x=P.st.b0.x; b.y=P.st.b0.y; } } };

/* =========================================================
   3b) LAS DESPEDIDAS
   · La Reina: se yergue, hace una reverencia, su enjambre la envuelve, se deshace en abejas que salen por
     el techo dejando polen, y donde estaba queda una gota de luz: ahí caerá la Lágrima. Su eco, en violeta,
     se disuelve en el aire.
   · El Soldado de Cera: se queda tieso, su zumbido se apaga, cae en barrena, se estrella y revienta en polen y cera;
     sus alas bajan revoloteando. La recompensa cae donde se estrelló.
   ========================================================= */
const TK_BYE_N=44;
function tkByeBee(i,u,P){ const b0=P.st.b0, T=TK_QPTS[i%TK_QPTS.length], tx=b0.x+T[0], ty=b0.y+T[1];
  const s=(i%11)*2, a=i*2.39996+u*.09, k=presentEase.out(presentSeg(u,30+s,78+s)), r=90-66*k; // llegan girando y se cierran…
  let x=b0.x+16+Math.cos(a)*r, y=b0.y+16+Math.sin(a)*r*.55;
  const c=presentEase.io(presentSeg(u,80,104)); x+=(tx-x)*c; y+=(ty-y)*c;                   // …y la cubren
  const go=u-(112+(i%9)*3); if(go>0){ const g=go*go*.045; x=tx+Math.sin(go*.3+i)*go*.5*(i&1?1:-1); y=ty-g-go*.6; } // y salen por el techo
  return [x,y,go]; }
BOSS_BYE.avispa={ dur:186,
  start(P){ const b=boss; P.st.b0={x:b.x,y:b.y}; bossHidden=true; },
  tick(t,P){ const E=P.Q.echo, b0=P.st.b0;
    if(t===6) tkChord(E?57:60);
    if(t===22&&AC) beep('triangle',f(E?67:72),f(E?64:69),.3,.04,AC.currentTime); // la reverencia: un suspiro
    if(t>=30&&t<104&&t%12===6) tkBuzz(.015+.03*((t-30)/74),.45,E?120:170);
    if(t===106){ tkPop(); screenFlash(5,E?'#e8e0ff':'#fff6c0'); shake=Math.max(shake,4); }
    if(t>=114&&t<150&&t%4===2) tkPlip(((t-114)/4)|0);
    if(t>=114&&t<156&&(t&1)===0){ const i=(t*7)%TK_BYE_N, [x,y,go]=tkByeBee(i,t,P); if(go>0&&!E) parts.push({x,y:y+2,vx:(Math.random()-.5)*.3,vy:.15,life:26,col:(t&2)?'#f8e048':'#fff8c0',nog:true}); } // polen que cae
    if(E&&t>=112&&t<150&&(t&3)===0) parts.push({k:'mote',x:b0.x+4+Math.random()*24,y:b0.y+Math.random()*24,vx:0,vy:-.4,life:36,max:36,sway:Math.random()*6,col:'#d8c8ff',nog:true});
    if(t===164){ tkShing(); tkChord(E?64:72); for(let i=0;i<5;i++) sparkle(b0.x+10+Math.random()*12,b0.y+10+Math.random()*10,E?'#e8e0ff':'#fff6c0'); }
    if(t===178&&AC) beep('p125',f(E?76:84),0,.3,.03,AC.currentTime); },
  draw(t,P){ const E=P.Q.echo, pal=E?TK_ECHO:TK_HONEY, b0=P.st.b0, cx=b0.x+16, cy=b0.y+16;
    // la Reina: de rodillas se yergue (0-14), reverencia (14-34), aguanta mientras llega el enjambre y se desvanece bajo él
    if(t<106){ const up=presentEase.out(presentSeg(t,0,14)), bow=Math.sin(presentSeg(t,16,34)*Math.PI)*3, y=Math.round(b0.y+4-4*up+bow);
      const fade=1-presentSeg(t,84,104), img=t>=100?BOSS_WHITE.avispa:(E?tkQueenSilE():null);
      glowAt(cx,y+16,24,E?'rgba(170,140,255,.28)':'rgba(255,226,140,.22)');
      ctx.save(); ctx.globalAlpha*=E?.8*Math.max(.25,fade):Math.max(.3,fade);
      if(bow>1.5){ ctx.translate(cx,y+32); ctx.scale(1.04,.96); ctx.drawImage(BOSS_SPR.avispa,-16,-32); } else ctx.drawImage(BOSS_SPR.avispa,b0.x,y); // al inclinarse se encoge un poco
      ctx.restore(); if(img&&t>=100){ ctx.globalAlpha=.9; ctx.drawImage(img,b0.x,y); ctx.globalAlpha=1; }
      if(t>=18&&t<32){ const k=t-18; ctx.fillStyle=pal[0]; ctx.fillRect(cx-1,y-4-(k>>2),1,1); ctx.fillRect(cx+2,y-2-(k>>2),1,1); } } // un par de destellos de cortesía
    // el enjambre
    if(t>=30){ for(let i=0;i<TK_BYE_N;i++){ const [x,y,go]=tkByeBee(i,t,P); if(y<-10||tkNearSprout(x,y)) continue;
        if(E&&go>0){ ctx.globalAlpha=Math.max(0,1-go/22); tkBee(x,y,(t+i)>>1,Math.cos(i*2.39996+t*.09)<0?1:-1,pal); ctx.globalAlpha=1; continue; } // el eco no se va: se deshace
        tkBee(x,y,(t+i)>>1,go>0?(i&1?1:-1):(Math.cos(i*2.39996+t*.09)<0?1:-1),pal); } }
    // la luz que queda: una gota que late y marca dónde caerá la Lágrima
    if(t>=112){ const k=presentEase.back(presentSeg(t,112,130)), pulse=1+Math.sin(t*.25)*.5, ex=b0.x+16, ey=b0.y+16;
      glowAt(ex,ey,Math.round(10+k*10+pulse*2),E?'rgba(200,180,255,.45)':'rgba(255,240,170,.45)');
      if(t<160){ ctx.fillStyle=pal[1]; ctx.fillRect(ex-1,ey-2,3,4); ctx.fillRect(ex,ey-4,1,2); ctx.fillStyle='#ffffff'; ctx.fillRect(ex-1,ey-1,1,1); }
      if(t>=160){ const g=Math.round(6-Math.abs(t-170)/2); if(g>0) caStar(ex,ey,g,'#ffffff'); parts.length<400&&t===160&&parts.push({x:ex,y:ey,vx:0,vy:0,life:14,col:'#fffbe8',ring:true,r:14,nog:true}); } } },
  end(P){ bossHidden=false; const b=boss; if(b&&P.st.b0){ b.x=P.st.b0.x; b.y=P.st.b0.y; } } };

/* el Soldado: dónde está en su caída (en barrena hacia un sitio libre, nunca encima de Sprout) */
function tkCrashFor(m0){ const pcx=player.x+8, pcy=player.y+10;
  for(const [dx,dy] of [[0,40],[-18,36],[18,36],[-30,26],[30,26],[0,24],[-36,12],[36,12],[0,10],[0,0]]){ const x=m0.x+dx, y=m0.y+dy;
    if(x<4||x>VW-28||y+24>PLAY_H-6) continue; if(Math.hypot(x+12-pcx,y+12-pcy)>=36) return [x,y]; }
  return [m0.x,m0.y]; }
function tkFallAt(P,t){ const m0=P.st.m0, L=P.st.L;
  if(t<12) return [m0.x+((t&1)?1:-1)*(t<8?1:0),m0.y];                                   // tieso, temblando
  const k=presentSeg(t,12,48), e=presentEase.in(k);
  return [m0.x+(L[0]-m0.x)*e+Math.sin(k*18)*7*(1-k*.6),m0.y+(L[1]-m0.y)*e-Math.sin(k*Math.PI)*6]; }
function tkDrawDroneSpin(x,y,t){ const img=BOSS_SPR.drone, fl=t<12?false:(((t-12)>>2)&1); // gira: de frente, de canto (se estrecha) y del revés
  const ph=t<12?0:((t-12)>>1)%4, sc=[1,.5,1,.5][ph]; ctx.save(); ctx.translate(Math.round(x)+12,Math.round(y)+24); ctx.scale((fl?-1:1)*sc,1); ctx.drawImage(t<6?BOSS_WHITE.drone:img,-12,-24); ctx.restore(); }
function tkWing(x,y,a,flip){ x=Math.round(x); y=Math.round(y); ctx.globalAlpha=a; const X=i=>flip?x+8-i:x+i; // un ala: 9×5, con nervios
  const R=[[1,7],[0,9],[0,9],[1,8],[3,5]]; R.forEach(([s,w],r)=>{ ctx.fillStyle=TK_INK; for(let i=s-1;i<=s+w;i++) ctx.fillRect(X(i),y+r-1,1,3); });
  R.forEach(([s,w],r)=>{ for(let i=s;i<s+w;i++){ ctx.fillStyle=r===0?'#ffffff':(i===s+2||i===s+5)?'#a8c8e0':'#e8f4ff'; ctx.fillRect(X(i),y+r,1,1); } }); ctx.globalAlpha=1; }
BOSS_BYE.drone={ dur:136,
  start(P){ const m=midboss; P.st.m0={x:m.x,y:m.y}; P.st.L=tkCrashFor(P.st.m0); bossHidden=true; },
  tick(t,P){ const L=P.st.L;
    if(t===1){ tkThud(false); shake=Math.max(shake,3); if(AC) beep('square',1600,400,.12,.03,AC.currentTime); }
    if(t===12&&AC){ const T=AC.currentTime; swish(1.1,.05,900,320,500,T,5); beep('sawtooth',260,70,1.1,.02,T,true); } // el zumbido se apaga
    if(t>=14&&t<48&&t%3===0){ const [x,y]=tkFallAt(P,t); parts.push({k:'smoke',x:x+12,y:y+10,vx:(Math.random()-.5)*.3,vy:-.3,life:18,max:18,r:2,col:(t&2)?'#8a7a60':'#5a4a38',nog:true}); }
    if(t===48){ tkThud(true); tkPop(); shake=Math.max(shake,7); screenFlash(4,'#fff6c0'); const cx=L[0]+12, cy=L[1]+18;
      for(let i=0;i<20;i++){ const a=i/20*6.283, s=1+Math.random()*1.8; parts.push({x:cx,y:cy,vx:Math.cos(a)*s,vy:Math.sin(a)*s-1.2,life:24+(i&7),col:['#f8e048','#fff8c0','#e0a830','#ffffff'][i&3]}); } // polen
      for(let i=0;i<10;i++){ const a=Math.random()*6.283, s=1.5+Math.random()*2; parts.push({k:'shard',x:cx,y:cy,vx:Math.cos(a)*s,vy:Math.sin(a)*s-1,life:16,max:16,col:i&1?'#f0c020':'#6a4210'}); } // cera
      for(let i=0;i<10;i++){ const a=Math.PI+i/9*Math.PI; parts.push({k:'dust',x:cx+Math.cos(a)*8,y:cy+4,vx:Math.cos(a)*1.2,vy:-.2,life:20,max:20,r:1+(i&1),col:groundDustCol(),nog:true}); }
      parts.push({x:cx,y:cy,vx:0,vy:0,life:12,col:'#fff8c0',ring:true,r:18,nog:true}); }
    if(t===58&&AC) beep('p25',f(72),f(60),.4,.03,AC.currentTime);
    if(t===120){ tkShing(); for(let i=0;i<4;i++) sparkle(L[0]+6+Math.random()*12,L[1]+6+Math.random()*10,'#fff6c0'); } },
  draw(t,P){ const L=P.st.L;
    if(t<48){ const [x,y]=tkFallAt(P,t); drawShadow(Math.round(L[0]+12),L[1]+23,Math.max(3,Math.round(10*presentSeg(t,12,48))));
      tkDrawDroneSpin(x,y,t);
      if(t>=12){ ctx.fillStyle='rgba(255,248,200,.5)'; for(let i=0;i<3;i++) ctx.fillRect(Math.round(x)+4+i*7,Math.round(y)-4-((t+i*3)%6),1,4); } } // cae: rayas hacia arriba
    else { // las alas bajan revoloteando y se desvanecen; una mancha de cera en el suelo
      const u=t-48, cx=L[0]+12, cy=L[1]+18;
      ctx.fillStyle='rgba(106,66,16,'+(.5*Math.max(0,1-u/88)).toFixed(3)+')'; ctx.fillRect(cx-7,cy+2,14,2); ctx.fillRect(cx-5,cy+1,10,4);
      if(u<7){ const k=u/7; ctx.save(); ctx.translate(cx,cy+6); ctx.scale(1+k*.5,1-k*.55); ctx.drawImage(u<3?BOSS_WHITE.drone:BOSS_SPR.drone,-12,-24); ctx.restore(); } // aplastado un instante contra el suelo
      const wa=1-presentSeg(u,30,48); // las alas: saltan del golpe y bajan balanceándose, cada una hacia su lado
      for(const s of [-1,1]){ const k=presentSeg(u,4,48), sw=Math.sin(u*.28+(s>0?1.6:0)), x=cx+s*(8+k*18)+sw*5, y=cy-6-Math.sin(Math.min(1,k*2.2)*Math.PI)*14+k*8; if(u>=4&&wa>0) tkWing(x-4,y,wa,s>0); }
      if(t>=112){ const g=Math.round(5-Math.abs(t-122)/2); if(g>0) caStar(cx,cy-6,g,'#ffffff'); glowAt(cx,cy-6,14,'rgba(255,240,170,'+(.35*presentSeg(t,112,122)).toFixed(2)+')'); } } },
  end(P){ bossHidden=false; const m=midboss; if(m&&P.st.L){ m.x=P.st.L[0]; m.y=P.st.L[1]; } } }; // la recompensa cae donde se estrelló

/* =========================================================
   4) LA SALIDA: una gota de miel y el enjambre te llevan a la puerta
   ========================================================= */
const TK_DEST={sx:1,sy:3,x:68,y:30,dir:0}; // bajo la puerta del Tronco, con los pies en seco (la salida normal, 68,34, roza el agua)
function tkBubbleAt(P,t){ // centro de la gota y su radio
  if(t<110){ const [px,py]=P.st.p0, lift=presentEase.in(presentSeg(t,44,104));
    return [px+8+Math.sin(t*.12)*3*presentSeg(t,44,60),py+6-lift*150,14*presentEase.back(presentSeg(t,24,40))]; }
  const k=presentEase.out(presentSeg(t,118,168)), D=TK_DEST;
  return [D.x+8+Math.sin(t*.12)*3*(1-presentSeg(t,150,168)),-30+(D.y+6+30)*k,t<170?14:0]; }
function tkDrawBubble(x,y,r,t){ x=Math.round(x); y=Math.round(y); if(r<1) return; // una gota de miel que tiembla como gelatina
  const j=Math.sin(t*.25)*(r>6?1:0), rx=Math.round(r+j), ry=Math.round(r-j);
  ctx.globalAlpha=.22; ctx.fillStyle=TK_HONEY[1]; for(let yy=-ry+1;yy<ry;yy++){ const w=Math.round(rx*Math.sqrt(1-(yy*yy)/(ry*ry))); ctx.fillRect(x-w+1,y+yy,w*2-1,1); } ctx.globalAlpha=1;
  const n=Math.max(16,r*8); for(let i=0;i<n;i++){ const a=i/n*6.283, c=Math.cos(a), s=Math.sin(a), px=Math.round(x+c*rx), py=Math.round(y+s*ry);
    ctx.fillStyle=TK_HONEY[4]; ctx.fillRect(px,py,1,1);
    const ix=Math.round(x+c*(rx-1)), iy=Math.round(y+s*(ry-1)); ctx.fillStyle=a>3.3&&a<5.3?'#fff8d8':a>.4&&a<2.7?TK_HONEY[2]:TK_HONEY[1]; ctx.fillRect(ix,iy,1,1); }
  ctx.fillStyle='#ffffff'; ctx.fillRect(x-Math.round(rx*.55),y-Math.round(ry*.55),3,1); ctx.fillRect(x-Math.round(rx*.62),y-Math.round(ry*.42),1,2); ctx.fillRect(x+Math.round(rx*.4),y+Math.round(ry*.5),1,1);
  ctx.fillStyle=TK_HONEY[2]; const dl=((t>>2)&3); ctx.fillRect(x,y+ry,1,1+dl); ctx.fillStyle=TK_HONEY[1]; ctx.fillRect(x,y+ry+dl,1,1); } // una gota que asoma por debajo
function tkHoneyWipe(t){ // de 84 a 110 el panal llena la pantalla desde abajo; de 110 a 136 se vacía desde arriba
  if(t<84||t>136) return;
  for(let c=-1;c<=23;c++) for(let r=-1;r<=18;r++){ const x=c*7, y=r*8+((c&1)?4:0); if(y<-8||y>VH+8) continue;
    let fr; if(t<=110){ const s=(1-y/150)*.55; fr=clamp((presentSeg(t,84,110)-s)/.35,0,1); } else { const s=(y/150)*.55; fr=1-clamp((presentSeg(t,110,136)-s)/.35,0,1); }
    if(fr<=0) continue; tkHex(x,y,fr,TK_AMBER,TK_WALL,null); } }
BOSS_OUTRO.avispa={ dur:220, swap:110, dest:TK_DEST,
  start(P){ P.st.p0=[player.x,player.y]; playerHidden=true; }, // Sprout va dentro de la gota: lo pinta la salida (el framework lo repone)
  tick(t,P){
    if(t===2) tkBuzz(.04,.8,170);
    if(t===24) tkBloop(true);
    if(t===44){ tkBuzz(.05,.9,220); if(AC) swish(.8,.04,300,1200,2400,AC.currentTime,1.4); }
    if(t===86&&AC) noise(.6,.03,false,AC.currentTime,500);
    if(t===112&&AC) swish(.5,.035,2400,900,400,AC.currentTime,1.2);
    if(t===170){ tkPop(); tkChord(72); shake=Math.max(shake,3); const D=TK_DEST;
      for(let i=0;i<16;i++){ const a=i/16*6.283, s=1+Math.random()*1.3; parts.push({x:D.x+8+Math.cos(a)*8,y:D.y+6+Math.sin(a)*8,vx:Math.cos(a)*s,vy:Math.sin(a)*s-1,life:22,col:i&1?TK_HONEY[1]:TK_HONEY[2]}); }
      parts.push({x:D.x+8,y:D.y+6,vx:0,vy:0,life:12,col:'#fff8d8',ring:true,r:16,nog:true}); }
    if(t===180){ tkThud(false); stepDustAt(TK_DEST.x+8,TK_DEST.y+15,1); }
    if(t>=46&&t<104&&t%7===0){ const [x,y,r]=tkBubbleAt(P,t); parts.push({x,y:y+r,vx:(Math.random()-.5)*.2,vy:.4,life:30,col:TK_HONEY[2]}); } },
  draw(t,P){ const [bx,by,br]=tkBubbleAt(P,t), before=t<110;
    // la sombra en el suelo
    if(before){ const k=presentSeg(t,44,90); if(k<1) drawShadow(P.st.p0[0]+8,P.st.p0[1]+15,Math.max(2,Math.round(6*(1-k)))); }
    else { const k=presentSeg(t,130,168); if(k>0) drawShadow(TK_DEST.x+8,TK_DEST.y+15,Math.max(2,Math.round(6*k))); }
    // Sprout: de pie, dentro de la gota con los brazos en alto, y al estallar cae al suelo
    let sx0, sy0, spr=P_SPRITES[0][0];
    if(before&&t<24){ sx0=P.st.p0[0]; sy0=P.st.p0[1]; }
    else if(t<170){ sx0=Math.round(bx-8); sy0=Math.round(by-8+Math.sin(t*.2)); spr=H_LIFT; }
    else { const k=presentSeg(t,170,180); sx0=TK_DEST.x; sy0=Math.round(TK_DEST.y-4*Math.sin(k*Math.PI)+(1-k)*-2); if(t<180) spr=H_LIFT; }
    if(!(before&&by<-20)&&!(t>=110&&t<118)) ctx.drawImage(spr,Math.round(sx0),Math.round(sy0));
    if(t<170) tkDrawBubble(bx,by,br,t);
    // el enjambre: llega, carga la gota y al final se dispersa
    for(let i=0;i<12;i++){ const a=i*.5236+t*.18*(i&1?1:-1)*.8+i; let r, cx=bx, cy=by-2;
      if(t<24){ r=90-73*presentEase.out(presentSeg(t,i*1.2,24)); cx=P.st.p0[0]+8; cy=P.st.p0[1]+6; }
      else if(t<170) r=17+Math.sin(t*.1+i)*2;
      else { r=17+(t-170)*2.6; cx=TK_DEST.x+8; cy=TK_DEST.y+6; }
      const x=cx+Math.cos(a)*r, y=cy+Math.sin(a)*r*.55-(i<4&&t>=40&&t<170?8:0);
      if(x<-8||x>VW+8||y<-8||y>VH+8) continue; tkBee(x,y,(t+i)>>1,Math.sin(a)>0?1:-1); }
    tkHoneyWipe(t); } ,
  end(P){ player.x=TK_DEST.x; player.y=TK_DEST.y; player.dir=0; player.frame=0; player.inv=Math.max(player.inv||0,20); } };
