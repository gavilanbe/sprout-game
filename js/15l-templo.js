'use strict';
/* ============================================================
   EL TEMPLO DE LA CIMA (mazmorra 3 · el Copo): sus presentaciones (contrato en 15i)
   · DNG_CARD.templo     la escarcha trepa desde las esquinas, la losa de piedra se hiela,
                         el copo se dibuja brazo a brazo y el nombre cae en letras de hielo tallado
   · BOSS_INTRO.iceguard el frío se extiende por el suelo y los bloques vuelan a juntarse en el Guardián
   · BOSS_INTRO.viento   el cielo se cierra, la tormenta gira, se abren dos ojos de hielo, primer plano
                         del aullido y el nombre llega con la ventisca (también su eco, en violeta)
   · BOSS_OUTRO.viento   con el Copo: un remolino de nieve y un cristal de hielo te envuelven, el Viento
                         (ya en paz) te lleva ante la puerta del Templo y el cristal se deshace en copos
   Todo a tamaño nativo: las letras grandes son hielo tallado píxel a píxel (no texto estirado)
   y el primer plano del Viento es su dibujo generado otra vez, más grande.
   ============================================================ */

/* ---------- utilidades ---------- */
const TL_ICE=['#ffffff','#a8e0ff','#4a90d0','#ffffff','#0a1428'];     // brillo, cuerpo, sombra, destello, contorno
const TL_ECO=['#fff4ff','#d0b8ff','#7a58d0','#ffffff','#140a28'];
const TL_FROST=['#0e2a4a','#3a78b0','#8cc8f0','#e8f8ff'];
function tlMap(t,K){ if(t<=K[0][0]) return K[0][1]; for(let i=1;i<K.length;i++){ const [a,A]=K[i-1],[b,B]=K[i]; if(t<=b) return A+(B-A)*(t-a)/(b-a); } return K[K.length-1][1]; }
function tlCross(P,T,th){ return P.st.pT<th&&T>=th; } // ¿el tiempo de guion acaba de pasar por th? (para sonidos en tick)
/* letras de hielo tallado: cada píxel de la fuente se talla en un bloque de 2×2 con su bisel (luz arriba-izquierda,
   sombra abajo-derecha), destellos sueltos, contorno y un canto de 1 px debajo. Se hace una vez por letra y color */
const TL_GLYPH=new Map();
function tlGlyph(ch,pal){ const key=ch+'|'+pal[1]; let c=TL_GLYPH.get(key); if(c) return c;
  const F=FONT_M, w=Math.max(1,textW(ch,F)), H=F.h+F.asc+1, src=mkCanvas(w+2,H+2), sg=src.getContext('2d'); drawText(sg,ch,1,1+F.asc,'#ffffff','left',F);
  const d=sg.getImageData(0,0,w+2,H+2).data, M=(x,y)=>x>=0&&y>=0&&x<w+2&&y<H+2&&d[(y*(w+2)+x)*4+3]>128;
  const W=(w+2)*2+4, HH=(H+2)*2+5; c=mkCanvas(W,HH); const g=c.getContext('2d');
  for(let y=0;y<H+2;y++) for(let x=0;x<w+2;x++){ if(!M(x,y)) continue; const X=2+x*2, Y=2+y*2;
    const up=!M(x,y-1), lf=!M(x-1,y), dn=!M(x,y+1), rt=!M(x+1,y);
    const px=(ox,oy,col)=>{ g.fillStyle=col; g.fillRect(X+ox,Y+oy,1,1); };
    px(0,0,up||lf?pal[0]:pal[1]); px(1,0,up?pal[0]:rt?pal[2]:pal[1]); px(0,1,lf?pal[0]:dn?pal[2]:pal[1]); px(1,1,dn||rt?pal[2]:pal[1]);
    if((hash(x*3+ch.charCodeAt(0),y*7)&15)===0) px(0,0,pal[3]); }
  artOutline(g,W,HH,pal[4]);
  const D=g.getImageData(0,0,W,HH).data; g.fillStyle=pal[4]; // el canto: el hielo tiene grosor
  for(let y=HH-2;y>=0;y--) for(let x=0;x<W;x++) if(D[(y*W+x)*4+3]>40&&D[((y+1)*W+x)*4+3]<=40) g.fillRect(x,y+1,1,1);
  c.adv=(w+1)*2; TL_GLYPH.set(key,c); return c; }
function tlLineW(s){ let w=0; for(const ch of s) w+=ch===' '?(FONT_M.space+1)*2:tlGlyph(ch,TL_ICE).adv; return w-2; }
/* una línea de letras de hielo centrada en cx; fx(i) → {dy,dx,a} o null (la letra aún no está) */
function tlBigLine(s,cx,y,pal,fx){ let x=Math.round(cx-tlLineW(s)/2), i=0;
  for(const ch of s){ if(ch===' '){ x+=(FONT_M.space+1)*2; i++; continue; } const g=tlGlyph(ch,pal), e=fx?fx(i):{dy:0,dx:0,a:1};
    if(e){ if(e.a<1) ctx.globalAlpha=Math.max(0,e.a); ctx.drawImage(g,Math.round(x-4+(e.dx||0)),Math.round(y-4-FONT_M.asc*2+(e.dy||0))); ctx.globalAlpha=1; }
    x+=g.adv; i++; } }
/* el brillo helado que cruza unas letras (una diagonal blanca de 3 px, recortada a la línea) */
function tlShine(s,cx,y,k){ const w=tlLineW(s), x0=Math.round(cx-w/2)-4, y0=Math.round(y-4-FONT_M.asc*2), h=26, f=Math.round(-20+k*(w+40));
  ctx.save(); ctx.beginPath(); ctx.rect(x0,y0,w+8,h); ctx.clip(); ctx.fillStyle='rgba(255,255,255,.55)';
  for(let yy=0;yy<h;yy++) ctx.fillRect(x0+f+Math.round((h-yy)*.6),y0+yy,3,1); ctx.restore(); }
/* copos que caen o vuelan (puros en t): n copos, viento vx, caída vy; semilla s */
function tlSnow(t,n,vx,vy,s,cols,big){ for(let i=0;i<n;i++){ const h=hash(i*31+s,s*7+i), x0=h%200, y0=(h>>8)%170, sp=.6+((h>>16)&7)/10;
  const x=((x0+t*vx*sp+Math.sin(t*.05+i)*5)%200+200)%200-20, y=((y0+t*vy*sp)%170+170)%170-14, c=cols[(h>>20)%cols.length];
  ctx.fillStyle=c; if(big&&(h&7)===0){ ctx.fillRect(Math.round(x)-1,Math.round(y),3,1); ctx.fillRect(Math.round(x),Math.round(y)-1,1,3); } else ctx.fillRect(Math.round(x),Math.round(y),1+((h>>24)&1&&vx>2?2:0),1); } }
/* la ventisca: rayas horizontales de nieve (puras en t) */
function tlStreaks(t,n,y0,h,sp,col,s){ ctx.fillStyle=col; for(let i=0;i<n;i++){ const H=hash(i*13+s,s+i*5), L=5+(H%4)*5, y=y0+(H>>4)%h, x=((H>>9)%240+t*sp*(1+(H>>20&3)*.25))%240-40; ctx.fillRect(Math.round(x),y,L,1); } }
/* un copo de 8 brazos, dibujado brazo a brazo (g: 0..1) */
const TL_FLAKE=(()=>{ const pts=[], c=7; const add=(x,y,d,col)=>pts.push([x,y,d,col]);
  for(let a=0;a<8;a++){ const dx=[1,1,0,-1,-1,-1,0,1][a], dy=[0,1,1,1,0,-1,-1,-1][a], L=a&1?5:7;
    for(let r=1;r<=L;r++) add(c+dx*r,c+dy*r,r,r===L?3:2);
    const bx=c+dx*(a&1?3:4), by=c+dy*(a&1?3:4), px=-dy, py=dx; // las barbas, hacia fuera
    for(const s of [-1,1]){ add(bx+px*s,by+py*s,(a&1?3:4)+1,1); if(!(a&1)) add(bx+px*s*2+dx,by+py*s*2+dy,6,1); } }
  add(c,c,0,3); return pts; })();
function tlDrawFlake(cx,cy,g,pal){ const P=pal||['#0a1428','#4a90d0','#a8e0ff','#ffffff'], R=g*8;
  for(const [x,y,d] of TL_FLAKE) if(d<=R){ ctx.fillStyle=P[0]; ctx.fillRect(cx+x-7-1,cy+y-7,3,1); ctx.fillRect(cx+x-7,cy+y-7-1,1,3); }
  for(const [x,y,d,col] of TL_FLAKE) if(d<=R){ ctx.fillStyle=P[col]; ctx.fillRect(cx+x-7,cy+y-7,1,1); } }
function tlStar(x,y,s,col){ x=Math.round(x); y=Math.round(y); if(s<=0) return; ctx.fillStyle=col||'#ffffff'; ctx.fillRect(x-s,y,s*2+1,1); ctx.fillRect(x,y-s,1,s*2+1); if(s>2){ ctx.fillRect(x-1,y-1,3,3); } }
/* sonidos del templo */
function tlChime(n,vol){ if(!AC) return; const t=AC.currentTime, S=[88,91,93,95,98,100,103]; for(let i=0;i<(n||4);i++) beep('triangle',f(S[i%S.length]),0,.35,(vol||.035)*(1-i*.12),t+i*.055); noise(.25,.012,true,t,7000); }
function tlClink(i){ if(!AC) return; const t=AC.currentTime; beep('triangle',f(84+(i%5)*2),f(96+(i%5)*2),.05,.03,t); noise(.03,.02,true,t,5200); }
function tlCrack(v){ if(!AC) return; const t=AC.currentTime; noise(.09,v||.06,true,t,3200); noise(.14,(v||.06)*.6,false,t+.02,900); beep('square',1400,300,.05,.015,t); }
function tlThud(v){ if(!AC) return; const t=AC.currentTime; beep('triangle',110,34,.35,v||.16,t); noise(.25,(v||.16)*.45,false,t,500); }
function tlGust(dur,vol){ if(!AC) return; const t=AC.currentTime; swish(dur,vol,500,1800,700,t,.9); swish(dur*.8,vol*.6,2600,5200,3000,t+.08,.7,true); }
function tlShatter(){ if(!AC) return; const t=AC.currentTime; for(let i=0;i<6;i++){ beep('triangle',f(96+((i*5)%12)),0,.12,.028,t+i*.03); } noise(.35,.07,true,t,4200); noise(.2,.05,false,t,1400); }
function tlSlam(){ if(!AC) return; const t=AC.currentTime; beep('triangle',150,32,.5,.15,t); noise(.3,.08,false,t,700); noise(.4,.03,true,t+.02,6000); }

/* ---------- la losa de piedra del título (se hace una vez) ---------- */
const TL_PLAQ_W=140, TL_PLAQ_H=72;
let TL_PLAQ=null;
function tlPlaque(){ if(TL_PLAQ) return TL_PLAQ; const W=TL_PLAQ_W, H=TL_PLAQ_H, B=pxBuf(W,H+8), r=seeded(303);
  const S=['#1a2438','#2a3650','#3a4a68','#50607e','#6a7c9a','#8a9cb8'];
  for(let y=0;y<H;y++) for(let x=0;x<W;x++){ const row=(y-3)/10|0, off=(row&1)?11:0, mort=((y-3)%10===9)||(((x+off)%22)===21);
    let v=1.9+(hash(x>>2,y>>2)&3)*.3-(y/H)*.7+(BAYER4[y&3][x&3]/16-.5)*.9; if(mort) v=.6; if((hash(x*7,y*3)&63)===0) v+=1.2;
    B.set(x,y,S[clamp(Math.round(v),0,5)]); }
  for(let x=0;x<W;x++){ B.set(x,0,S[0]); B.set(x,1,S[5]); B.set(x,2,S[4]); B.set(x,H-3,S[1]); B.set(x,H-2,S[0]); B.set(x,H-1,'#07080f'); } // bisel arriba y abajo
  for(let y=0;y<H;y++){ B.set(0,y,'#07080f'); B.set(1,y,S[4]); B.set(W-2,y,S[1]); B.set(W-1,y,'#07080f'); }
  for(let x=0;x<W;x++) B.set(x,0,'#07080f');
  for(let x=4;x<W-4;x++){ const k=hash(x,9)%5; for(let y=2;y<2+k;y++) B.set(x,y,y===2?'#ffffff':'#c8ecff'); } // nieve encima
  for(let i=0;i<16;i++){ const x=5+((r()*(W-10))|0), L=2+((r()*6)|0); for(let y=0;y<L;y++){ B.set(x,H-1+y,y<L-1?'#a8e0ff':'#ffffff'); if(y<L/2) B.set(x+1,H-1+y,'#4a90d0'); } } // carámbanos
  return TL_PLAQ=B.canvas(); }
/* escarcha que trepa desde las esquinas: ramas de píxeles con su momento de aparecer (se calculan una vez) */
let TL_FROSTPIX=null;
function tlFrostPix(){ if(TL_FROSTPIX) return TL_FROSTPIX; const out=[], r=seeded(5150);
  const grow=(x,y,a,len,t0,depth)=>{ let px=x, py=y;
    for(let i=0;i<len;i++){ px+=Math.cos(a); py+=Math.sin(a); a+=(r()-.5)*.35; out.push([Math.round(px),Math.round(py),t0+i*.9,depth]);
      if(depth<2&&i>4&&r()<.09) grow(px,py,a+(r()<.5?-1:1)*(.7+r()*.4),len*(.4+r()*.2)|0,t0+i*.9,depth+1); } };
  for(const [x,y,a0] of [[-1,-1,.62],[160,-1,2.52],[-1,144,-.62],[160,144,-2.52]]) for(let k=0;k<2;k++) grow(x,y,a0+(k-.5)*.5,26+((r()*12)|0),k*5,0);
  return TL_FROSTPIX=out; }
function tlFrost(T,k){ const L=tlFrostPix(); for(const [x,y,t0,d] of L){ if(T<t0) continue; const fresh=T-t0<3;
  ctx.fillStyle=fresh?'#ffffff':d?TL_FROST[2]:TL_FROST[3]; ctx.globalAlpha=k; ctx.fillRect(x,y,1,1); if(!d&&!fresh){ ctx.fillStyle=TL_FROST[1]; ctx.fillRect(x,y+1,1,1); } } ctx.globalAlpha=1; }

/* ============================================================
   1) EL TÍTULO DE LA MAZMORRA
   ============================================================ */
const TL_DNG_FULL=190;
function tlDngT(t,P){ return P.short?tlMap(t,[[0,40],[40,96],[62,160],[92,190]]):t; }
DNG_CARD.templo={ dur:TL_DNG_FULL, shortDur:92,
  start(P){ P.st.pT=P.short?39:0; },
  tick(t,P){ const T=tlDngT(t,P);
    if(tlCross(P,T,2)) tlGust(1.2,.05);
    if(tlCross(P,T,30)) tlCrack(.04);
    if(tlCross(P,T,44)) tlChime(5,.03);
    for(let i=0;i<2;i++){ const th=58+i*12; if(tlCross(P,T,th)) tlSlam(); }
    if(tlCross(P,T,100)) tlChime(3,.025);
    if(tlCross(P,T,160)) tlShatter();
    P.st.pT=T; },
  draw(t,P){ const T=tlDngT(t,P), out=presentSeg(T,160,184), dim=Math.min(presentSeg(T,0,22),1-presentSeg(T,168,190));
    ctx.fillStyle='rgba(6,12,32,'+(.62*dim).toFixed(3)+')'; ctx.fillRect(-4,-4,VW+8,VH+8);
    tlSnow(T,34,.6,.55,11,['#ffffff','#c8ecff','#8cc8f0'],true);
    tlFrost(T,1-presentSeg(T,164,190));
    const px=10, py=24, pin=presentSeg(T,26,40);
    if(pin>0&&out<1){ const img=tlPlaque(), k=presentEase.back(pin), y=Math.round(py-(1-k)*20);
      ctx.globalAlpha=Math.min(1,pin*3)*(1-out); ctx.drawImage(img,px,y); ctx.globalAlpha=1;
      if(T>=40&&T<52){ const u=(T-40)/12; ctx.fillStyle='rgba(232,248,255,.5)'; for(let yy=0;yy<TL_PLAQ_H;yy++) ctx.fillRect(px+Math.round(u*(TL_PLAQ_W+40))-20+Math.round(yy*.5),y+yy,4,1); } // se hiela: un brillo la cruza
      ctx.globalAlpha=1-out;
      const fy=py+4; tlDrawFlake(80,fy,presentEase.out(presentSeg(T,40,54))); if(T>=54&&T<66) tlStar(80,fy,Math.round(4-(T-54)/3),'#ffffff'); // el copo, brazo a brazo
      if(T>=46){ ctx.globalAlpha=Math.min(1,(T-46)/8)*(1-out); txtSO('MAZMORRA 3',80,py+15,'#e8f8ff','center','#0a1428'); }
      ctx.globalAlpha=1;
      const lines=['EL TEMPLO','DE LA CIMA'];
      lines.forEach((s,li)=>{ const y0=py+34+li*20, t0=56+li*12;
        tlBigLine(s,80,y0,TL_ICE,i=>{ const u=T-(t0+i*1.4); if(u<0) return null; const e=presentEase.out(Math.min(1,u/6)); return {dy:-(1-e)*8+(u>=6&&u<9?[1,1,0][(u-6)|0]:0),a:Math.min(1,u/4)*(1-out)}; });
        if(T>=96+li*6&&T<120+li*6) tlShine(s,80,y0,(T-96-li*6)/24); });
      if(T>=100){ const n=Math.floor((T-100)*1.2), s='donde duerme el Copo Eterno'; ctx.globalAlpha=1-out; txtOL(s.slice(0,n),80,py+TL_PLAQ_H+12,'#e8f8ff','center','#0a1428'); ctx.globalAlpha=1; } }
    if(T>=160&&T<164){ ctx.fillStyle='rgba(255,255,255,'+(.5-(T-160)*.12).toFixed(2)+')'; ctx.fillRect(px,py,TL_PLAQ_W,TL_PLAQ_H); }
    if(out>0&&out<1){ // la losa se hace añicos de hielo
      for(let i=0;i<40;i++){ const h=hash(i,77), a=(h%628)/100, v=.8+((h>>8)%20)/10, u=(T-160); const x=px+8+((h>>4)%(TL_PLAQ_W-16))+Math.cos(a)*v*u, y=py+8+((h>>12)%(TL_PLAQ_H-10))+Math.sin(a)*v*u*.6+u*u*.08;
        ctx.fillStyle=['#ffffff','#a8e0ff','#4a90d0'][i%3]; ctx.fillRect(Math.round(x),Math.round(y),1+(h&1),1+((h>>1)&1)); } }
  } };

/* ============================================================
   2) EL GUARDIÁN DE HIELO: los bloques del templo vuelan a juntarse
   ============================================================ */
const TL_IG_CH=6; // trozos de 6×6 del sprite de 24×24
function tlIgT(t,P){ return P.short?tlMap(t,[[0,96],[16,112],[62,172],[82,200]]):t; }
BOSS_INTRO.iceguard={ dur:200, shortDur:82,
  start(P){ const m=midboss; P.st.m=m?{x:m.x,y:m.y}:{x:76,y:44}; P.st.pT=P.short?95:0; bossHidden=true; if(!P.short) setTrack('silencio'); },
  tick(t,P){ const T=tlIgT(t,P), M=P.st.m;
    if(tlCross(P,T,4)) tlGust(1.4,.04);
    for(let i=0;i<16;i++){ const th=34+i*3.4+14; if(tlCross(P,T,th)) tlClink(i); }
    if(tlCross(P,T,100)){ tlChime(4,.04); }
    if(tlCross(P,T,112)){ tlThud(.18); shake=Math.max(shake,8); for(let i=0;i<14;i++){ const a=i/14*6.283; parts.push({k:'smoke',x:M.x+12+Math.cos(a)*8,y:M.y+23,vx:Math.cos(a)*1.3,vy:Math.sin(a)*.4-.2,life:22,max:26,r:2+(i%3),col:i&1?'#e8f8ff':'#a8d0f0',nog:true}); } presentMusic(P); }
    if(tlCross(P,T,122)||tlCross(P,T,134)) tlSlam();
    if(T>112&&T<170&&(t&1)===0) parts.push({x:M.x+4+Math.random()*16,y:M.y+2,vx:(Math.random()-.5)*.3,vy:-.35,life:18,col:(t&2)?'#e8f8ff':'#a8e0ff',nog:true});
    P.st.pT=T; },
  draw(t,P){ const T=tlIgT(t,P), M=P.st.m, cx=M.x+12, fy=M.y+23, bars=Math.min(presentSeg(t,0,12),1-presentSeg(t,P.dur-10,P.dur));
    // el frío se extiende por el suelo desde donde va a alzarse
    const r=presentEase.out(presentSeg(T,6,70))*58; if(r>2){ // una capa de escarcha rellena, con cristales que asoman en el borde
      for(let y=Math.round(fy-r*.5);y<=fy+r*.5;y++) for(let x=Math.round(cx-r);x<=cx+r;x++){ const dx=(x-cx)/r, dy=(y-fy)/(r*.5), e=dx*dx+dy*dy+((hash(x>>1,y>>1)&7)-3.5)*.03; if(e>1) continue;
        const h=hash(x,y); if(e>.9){ if(h&1){ ctx.fillStyle=(h&6)?'#a8e0ff':'#ffffff'; ctx.fillRect(x,y,1,1); } }
        else if(((x+y)&1)===0){ ctx.fillStyle=e<.35?'rgba(232,248,255,.3)':'rgba(200,236,255,.2)'; ctx.fillRect(x,y,1,1); } else if((h&31)===0){ ctx.fillStyle='#ffffff'; ctx.fillRect(x,y,1,1); } }
      for(let i=0;i<14;i++){ const a=i/14*6.283+.3, L=3+(hash(i,5)%4), ex=cx+Math.cos(a)*r, ey=fy+Math.sin(a)*r*.5; ctx.fillStyle='#e8f8ff'; for(let j=0;j<L;j++) ctx.fillRect(Math.round(ex+Math.cos(a)*j),Math.round(ey+Math.sin(a)*j*.5)-(j>>1),1,1); } } // agujas de hielo hacia fuera
    ctx.fillStyle='rgba(20,50,100,'+(.28*presentSeg(T,0,40)*(1-presentSeg(T,180,200))).toFixed(3)+')'; ctx.fillRect(-4,-4,VW+8,VH+8);
    // los bloques: vuelan desde fuera y encajan (el sprite de verdad, a trozos: sin estirar nada)
    const img=BOSS_SPR.iceguard, drop=T<112?Math.round(Math.max(0,4-(T-100)*.8)):0, stomp=T>=112&&T<118?Math.round(Math.sin((T-112)/6*Math.PI)*2):0;
    drawShadow(cx,fy,Math.round(10*presentSeg(T,40,100)));
    for(let j=0;j<16;j++){ const ix=(j%4)*TL_IG_CH, iy=((j/4)|0)*TL_IG_CH, t0=34+j*3.4, k=presentSeg(T,t0,t0+14); if(k<=0) continue;
      const a=j*2.39+.6, R=90*(1-presentEase.out(k)), sx=Math.cos(a)*R, sy=Math.sin(a)*R*.7-Math.sin(k*Math.PI)*10;
      ctx.drawImage(img,ix,iy,TL_IG_CH,TL_IG_CH,Math.round(M.x+ix+sx),Math.round(M.y+iy+sy)-drop+stomp,TL_IG_CH,TL_IG_CH);
      if(k<1&&(j+t)%3===0){ ctx.fillStyle='#e8f8ff'; ctx.fillRect(Math.round(M.x+ix+sx+3-Math.cos(a)*5),Math.round(M.y+iy+sy+3-Math.sin(a)*4),1,1); } }
    if(T>=100&&T<112){ const k=(T-100)/12; ctx.globalAlpha=1-k; ctx.drawImage(BOSS_WHITE.iceguard,M.x,M.y-drop); ctx.globalAlpha=1; } // se enciende de golpe
    if(T>=104){ const k=presentSeg(T,104,124); glowAt(cx,M.y+12,14+k*6,'rgba(88,232,248,'+(.35*(1-k)+.12).toFixed(2)+')'); if(T<124){ ctx.drawImage(ringArt(Math.round(6+k*26),'#e8f8ff'),Math.round(cx-7-k*26),Math.round(M.y+12-7-k*26)); } }
    if(T>=104&&T<150){ const k=(T-104)/46; for(const ex of [9,13]){ ctx.fillStyle='#58e8f8'; ctx.fillRect(M.x+ex,M.y+3-drop+stomp,2,2); if(k<.4) tlStar(M.x+ex+1,M.y+4,Math.round(3-k*7),'#e8ffff'); } } // los ojos
    presentBars(bars,16);
    // el título
    if(T>=116){ const lines=['EL GUARDIÁN','DE HIELO']; lines.forEach((s,li)=>{ const t0=116+li*10, y0=li?96:78;
      tlBigLine(s,80,y0,TL_ICE,i=>{ const u=T-(t0+i*1.2); if(u<0) return null; const k=presentEase.back(Math.min(1,u/7)); return {dy:-(1-k)*14,a:Math.min(1,u/3)}; });
      if(T>=150+li*5&&T<172+li*5) tlShine(s,80,y0,(T-150-li*5)/22); });
      if(T>=140){ const n=Math.floor((T-140)*1.4), s='roca que no siente'; txtOL(s.slice(0,n),80,121,'#a8e0ff','center','#0a1428'); } }
  },
  end(P){ bossHidden=false; } };

/* ============================================================
   3) EL VIENTO DEL NORTE: la tormenta se cierra sobre la cima
   ============================================================ */
const TL_CLOUD_PAL=['#39406c','#525c8a','#707eac','#94a4d0','#c0ccee'], TL_CLOUD_ECO=['#3a2c6c','#54428a','#7460ac','#9a88d0','#d0c4f0'];
const TL_PUFFS=new Map();
function tlPuff(i,eco){ const key=i+(eco?'e':''); let c=TL_PUFFS.get(key); if(c) return c; const r=seeded(40+i), w=12+((r()*10)|0), h=Math.round(w*.72); c=mkCanvas(w+2,h+2);
  const L=[{x:w*.5,y:h*.58,r:w*.36,ry:h*.42},{x:w*.3,y:h*.5,r:w*.24},{x:w*.7,y:h*.46,r:w*.26}];
  blobArt(c.getContext('2d'),1,1,w,h,L,eco?TL_CLOUD_ECO:TL_CLOUD_PAL,{grad:.6,dither:.6,outline:'#141c34'}); TL_PUFFS.set(key,c); return c; }
function tlVT(t,P){ return P.short?tlMap(t,[[0,104],[18,124],[70,250],[100,300]]):t; }
BOSS_INTRO.viento={ dur:300, shortDur:100,
  start(P){ const b=boss; P.st.b={x:b?b.x:56,y:b?b.y:8}; P.st.pT=P.short?103:0; P.st.eco=!!P.Q.echo; bossHidden=true; if(!P.short) setTrack('silencio');
    for(let f=0;f<8;f++) idleTask(()=>windArt({s:2,mood:'howl',f}),'tl-cu'+f); }, // el primer plano, preparado en los ratos libres
  tick(t,P){ const T=tlVT(t,P), B=P.st.b;
    if(tlCross(P,T,2)) tlGust(2.2,.05);
    if(tlCross(P,T,36)) tlGust(1.6,.07);
    if(tlCross(P,T,70)) tlGust(1.2,.06);
    if(tlCross(P,T,92)) tlChime(2,.03);
    if(tlCross(P,T,104)){ if(typeof tiHowl==='function') tiHowl(1.1,.09); tlCrack(.05); shake=Math.max(shake,6); }
    if(tlCross(P,T,136)){ if(typeof tiHowl==='function') tiHowl(1.4,.12); tlThud(.14); shake=Math.max(shake,4); }
    if(tlCross(P,T,196)){ tlSlam(); presentMusic(P); shake=Math.max(shake,6); }
    if(tlCross(P,T,210)) tlSlam();
    if(tlCross(P,T,232)) tlChime(4,.03);
    if(T>=104&&T<124&&(t&1)===0){ const a=Math.random()*6.283; parts.push({x:B.x+16+Math.cos(a)*10,y:tlVY(T,B)+Math.sin(a)*8,vx:Math.cos(a)*2.2,vy:Math.sin(a)*1.6,life:20,col:(t&2)?'#ffffff':'#9ec7e8',nog:true}); }
    P.st.pT=T; },
  draw(t,P){ const T=tlVT(t,P), B=P.st.b, eco=P.st.eco, hx=B.x+16, hy=tlVY(T,B), out=presentSeg(T,272,300), bars=Math.min(presentSeg(t,0,14),1-presentSeg(t,P.dur-14,P.dur));
    // el cielo se cierra: bandas oscuras que bajan, tramadas
    const dk=presentSeg(T,0,50)*(1-out*.7);
    if(dk>0){ const c=eco?[22,10,44]:[8,14,36]; for(let y=0;y<VH;y+=2){ const a=dk*(.78-y/VH*.36); if(a<=0) continue; ctx.fillStyle='rgba('+c[0]+','+c[1]+','+c[2]+','+a.toFixed(3)+')'; ctx.fillRect(-4,y,VW+8,2); } }
    tlStreaks(T,Math.round(8+presentSeg(T,20,100)*18),16,112,4+presentSeg(T,30,110)*5,'rgba(222,236,255,.6)',3);
    tlSnow(T,40,3+presentSeg(T,20,100)*3,.5,21,['#ffffff','#dff0ff','#9ec7e8'],false);
    // la tormenta gira hacia el centro y se hace nube
    if(T>=24&&T<128){ const k=presentSeg(T,24,104), cond=presentSeg(T,104,128);
      for(let i=0;i<30;i++){ const h=hash(i,91), lay=i%3, a=(h%628)/100+T*(.035+lay*.018)*(1+k), R=((80+(h>>8)%40)-(70+(h>>8)%30)*presentEase.io(k))*(1-cond)+(lay*5), pf=tlPuff(i%8,eco); // tres capas que giran a su ritmo
        const x=hx+Math.cos(a)*R*1.15, y=hy+Math.sin(a)*R*(.42+lay*.08); ctx.globalAlpha=Math.min(1,presentSeg(T,20+i,36+i))*(1-cond); ctx.drawImage(pf,Math.round(x-pf.width/2),Math.round(y-pf.height/2)); } ctx.globalAlpha=1; }
    // dos ojos de hielo se abren en la nube
    if(T>=80&&T<112&&typeof tiEye==='function'){ const u=T-80, h=u<4?1:u<8?3:(u>=16&&u<19)?1:5; tiEye(hx-7,hy-1,h,1,true); tiEye(hx+5,hy-1,h,1,false); }
    // el Viento se forma: destello y aparece
    if(T>=104&&T<148){ const k=presentSeg(T,104,112); if(k<1){ ctx.globalAlpha=1-k; } drawWind(hx,hy,{s:1,mood:T<124?'howl':'storm',f:(T>>2)&7,white:T<108}); ctx.globalAlpha=1;
      if(T<116) ctx.drawImage(ringArt(Math.round(8+(T-104)*3),'#ffffff'),Math.round(hx-8-(T-104)*3),Math.round(hy-8-(T-104)*3));
      if(eco) glowAt(hx,hy,30,'rgba(170,140,255,.28)'); }
    // primer plano: la cara que aúlla (el dibujo generado otra vez, grande)
    if(T>=140&&T<192){ const u=T-140, open=presentEase.out(presentSeg(u,0,8))*(1-presentSeg(u,44,52)), bh=Math.round(46*open);
      if(bh>0){ const y0=72-bh, y1=72+bh; ctx.save(); ctx.beginPath(); ctx.rect(0,y0,VW,y1-y0); ctx.clip();
        ctx.fillStyle=eco?'#1a0e36':'#0c1a36'; ctx.fillRect(0,y0,VW,y1-y0);
        tlStreaks(u,26,y0,y1-y0,11,eco?'rgba(208,184,255,.5)':'rgba(190,226,255,.5)',9);
        const sx=Math.round(Math.sin(u*1.7)*(u<14?2:1)), sy=Math.round(Math.cos(u*2.3)*(u<14?1:0));
        drawWind(80+sx,76+sy,{s:2,mood:'howl',f:(u>>1)&7});
        if(eco){ ctx.fillStyle='rgba(160,120,255,.2)'; ctx.fillRect(0,y0,VW,y1-y0); }
        tlSnow(u,30,9,.8,33,['#ffffff','#dff0ff'],false);
        ctx.restore(); ctx.fillStyle=eco?'#d0b8ff':'#a8e0ff'; ctx.fillRect(0,y0,VW,1); ctx.fillRect(0,y1-1,VW,1); } }
    // el plano abierto: sube a su sitio mientras llega el nombre
    if(T>=184){ const k=presentSeg(T,184,192); if(k<1) ctx.globalAlpha=k;
      ctx.globalAlpha*=T>=250?1-.18*presentSeg(T,250,280):1;
      drawWind(hx,hy+Math.round(Math.sin(T*.12)*2),{s:1,mood:T<250?'howl':'storm',f:(T>>2)&7}); ctx.globalAlpha=1; if(eco) glowAt(hx,hy,30,'rgba(170,140,255,.25)'); }
    presentBars(bars,T>=140&&T<192?20:16);
    if(T>=196){ const pal=eco?TL_ECO:TL_ICE, L=eco?['ECO DEL','VIENTO']:['EL VIENTO','DEL NORTE'], a=1-out;
      L.forEach((s,li)=>{ const t0=196+li*14, y0=li?96:76; // entran con la ventisca, de derecha a izquierda
        tlBigLine(s,80,y0,pal,i=>{ const u=T-(t0+i*1.1); if(u<0) return null; const k=presentEase.out(Math.min(1,u/8)); return {dx:(1-k)*120,dy:0,a:Math.min(1,u/2)*a}; });
        if(T>=t0&&T<t0+14){ ctx.fillStyle='rgba(255,255,255,.7)'; const w=tlLineW(s); for(let j=0;j<5;j++) ctx.fillRect(Math.round(80+w/2+(1-(T-t0)/14)*120-10+j*9),y0-6+j*5,14-j*2,1); }
        if(T>=236+li*5&&T<258+li*5) tlShine(s,80,y0,(T-236-li*5)/22); });
      if(T>=226){ const n=Math.floor((T-226)*1.3), s=eco?'lo que el viento recuerda':'hermano del Roble'; ctx.globalAlpha=a; txtOL(s.slice(0,n),80,121,eco?'#d0b8ff':'#a8e0ff','center','#0a1428'); ctx.globalAlpha=1; } }
  },
  end(P){ bossHidden=false; } };
function tlVY(T,B){ const low=B.y+13+22; return T<250?low:Math.round(low+(B.y+13-low)*presentEase.io(presentSeg(T,250,290))); } // más bajo durante la entrada; sube a flotar

/* ============================================================
   4) LA SALIDA: con el Copo, la nieve te envuelve en un cristal y el Viento te lleva al Templo
   ============================================================ */
const TL_OUT_DEST={sx:1,sy:-2,x:64,y:12,dir:0}; // delante de la puerta del Templo, en el Sendero del Último Invierno
BOSS_OUTRO.viento={ dur:230, swap:112, dest:TL_OUT_DEST,
  start(P){ P.st.p0=[player.x,player.y]; P.st.pT=0; player.dir=0; },
  tick(t,P){ const T=t;
    if(T===2) tlGust(2.4,.05);
    if(T===24){ if(typeof tiHowl==='function') tiHowl(.9,.05); }
    if(T===52) tlChime(5,.035);
    if(T===70) tlCrack(.04);
    if(T===82) tlGust(1.6,.08);
    if(T===128) tlGust(1.8,.06);
    if(T===176){ tlShatter(); shake=Math.max(shake,4); const d=TL_OUT_DEST; for(let i=0;i<18;i++){ const a=i/18*6.283; parts.push({x:d.x+8,y:d.y+8,vx:Math.cos(a)*1.8,vy:Math.sin(a)*1.4-.6,life:26,col:i&1?'#ffffff':'#a8e0ff',star:(i%3)===0}); } }
    if(T===200) tlChime(3,.03);
    // Sprout, dentro del cristal: se esconde del mundo (lo pinta la salida) y aparece al romperse
    if(T>=66&&T<112) player.y=-400;
    if(P.swapped){ if(T<176){ player.x=TL_OUT_DEST.x; player.y=-400; } else if(T===176){ player.x=TL_OUT_DEST.x; player.y=TL_OUT_DEST.y; player.squash=.35; } }
    P.st.pT=T; },
  draw(t,P){ const T=t, before=T<112, p0=P.st.p0, d=TL_OUT_DEST;
    const cx=before?p0[0]+8:d.x+8, cy0=before?p0[1]+8:d.y+8;
    // dónde está el cristal: se forma, sube con el remolino; al otro lado baja y se posa
    let cy=cy0, crys=0;
    if(before){ crys=presentEase.out(presentSeg(T,44,66)); cy=cy0-presentEase.in(presentSeg(T,70,104))*120; }
    else { crys=T<176?1:0; cy=d.y+8-(1-presentEase.out(presentSeg(T,118,164)))*110+(T>=164&&T<176?Math.round(Math.sin((T-164)*.9)*1):0); }
    // el remolino de nieve alrededor del cristal
    const swirl=before?presentSeg(T,4,40)*(1-presentSeg(T,100,112)*.2):(1-presentSeg(T,150,190));
    if(swirl>0) for(let i=0;i<36;i++){ const a=i/36*6.283*2+T*.16, R=(28-14*presentSeg(T,0,60))*(1+(i%3)*.25)+(before?0:presentSeg(T,112,160)*-6), k=((i*7)%10)/10;
      const x=Math.round(cx+Math.cos(a)*R), y=Math.round(cy+Math.sin(a)*R*.5-(k*18-6)), w=i%5===0?2:1; ctx.globalAlpha=swirl; ctx.fillStyle='#2a5a90'; ctx.fillRect(x,y+1,w,1); ctx.fillStyle=i%3?'#ffffff':'#8cc8f0'; ctx.fillRect(x,y,w,1); } ctx.globalAlpha=1; // copos con su sombra: se ven sobre la nieve
    // el Viento, ya en paz: llega, sopla y se lleva el cristal (y al otro lado lo deja y se despide)
    if(before&&T>=16){ const k=presentEase.out(presentSeg(T,16,48)), x=Math.round(180-(180-(cx+30))*k), y=Math.round(cy0-40+(1-k)*-20+Math.sin(T*.1)*2);
      const lift=presentSeg(T,70,104), wy=y-lift*120; drawWind(x,wy,{s:1,mood:T<44?'happy':T<70?'blow':'calm',f:(T>>2)&7,flip:false});
      if(T>=44&&T<70) for(let j=0;j<6;j++){ const u=(T*3+j*11)%26; ctx.fillStyle=j&1?'#4a90d0':'#8cc8f0'; ctx.fillRect(Math.round(x-14-u),Math.round(wy+5+Math.sin(j*1.7+T*.2)*3),4,1); } }
    if(!before&&T>=140){ const a=presentEase.out(presentSeg(T,140,164)), k=presentEase.in(presentSeg(T,180,228)), x=Math.round(d.x+34+k*110+(1-a)*60), y=Math.round(d.y+36-k*30+Math.sin(T*.1)*2); drawWind(x,y,{s:1,mood:T<176?'blow':'happy',f:(T>>2)&7,flip:true}); } // sobre el lago: la deja y se despide
    // el cristal de hielo (un rombo tallado) con Sprout dentro
    if(crys>0){ const H=Math.round(19*crys), W=Math.round(13*crys), x=Math.round(cx), y=Math.round(cy-3), sh=Math.round(H*.42); // un prisma de hielo de seis caras
      const hw=yy=>Math.abs(yy)<=sh?W:Math.round(W*(H-Math.abs(yy))/(H-sh));
      if(!before||T>=66){ const sp=P_SPRITES[0][0]; ctx.drawImage(sp,x-8,y-8); }
      for(let yy=-H;yy<=H;yy++){ const w=hw(yy); if(w<0) continue;
        ctx.fillStyle='rgba(140,200,240,.42)'; ctx.fillRect(x-w,y+yy,w*2+1,1);
        ctx.fillStyle='rgba(232,248,255,.35)'; ctx.fillRect(x-w,y+yy,Math.max(1,Math.round(w*.45)),1); // la cara izquierda, con luz
        ctx.fillStyle='#0a1428'; ctx.fillRect(x-w-1,y+yy,1,1); ctx.fillRect(x+w+1,y+yy,1,1);
        ctx.fillStyle=yy<0?'#ffffff':'#8cc8f0'; ctx.fillRect(x-w,y+yy,1,1); ctx.fillStyle=yy<0?'#8cc8f0':'#2a5a90'; ctx.fillRect(x+w,y+yy,1,1); }
      ctx.fillStyle='#0a1428'; ctx.fillRect(x,y-H-1,1,1); ctx.fillRect(x,y+H+1,1,1);
      ctx.fillStyle='rgba(255,255,255,.75)'; for(let yy=-sh;yy<=sh;yy++) ctx.fillRect(x-Math.round(W*.2),y+yy,1,1); // una arista del prisma
      ctx.fillStyle='rgba(42,90,144,.6)'; for(let yy=-sh;yy<=sh;yy++) ctx.fillRect(x+Math.round(W*.45),y+yy,1,1);
      const gl=(T*2)%60; if(gl<H*2){ ctx.fillStyle='rgba(255,255,255,.8)'; const yy=-H+gl; const w=hw(yy); ctx.fillRect(x-w,y+yy,w*2+1,1); } // un destello que lo recorre
      if(((T>>3)&3)===0) tlStar(x+Math.round(W*.5),y-Math.round(H*.5),2,'#ffffff'); }
    // la ventisca que lo tapa todo: blanco al irse, y se abre al llegar
    const wo=before?presentSeg(T,86,112):1-presentSeg(T,112,138);
    if(wo>0){ ctx.fillStyle='rgba(236,246,255,'+(wo*.96).toFixed(3)+')'; ctx.fillRect(-4,-4,VW+8,VH+8); tlStreaks(T,30,0,144,9,'rgba(160,200,240,'+(wo*.8).toFixed(2)+')',41); }
    const bk=Math.min(presentSeg(T,0,14),1-presentSeg(T,212,230)); if(before) presentBars(bk,12); else { const h=Math.round(12*bk); ctx.fillStyle='#000'; ctx.fillRect(-4,VH-h,VW+8,h+4); } // al llegar, solo la de abajo: la puerta queda arriba
  },
  end(P){ player.x=TL_OUT_DEST.x; player.y=TL_OUT_DEST.y; player.dir=0; } };
