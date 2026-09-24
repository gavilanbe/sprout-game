'use strict';
/* el montaje limpio (v2): el mismo para 16:9 y 9:16, con su encuadre en cada formato */
(function(){
const T=TR, {cl,lp,seg,E,R}=T, W=T.W, H=T.H, V=T.V, g=T.g;
const BAR_T=60*4*60/126, BAR_D=60*4*60/162, BAR_E=60*4*60/120, beatT=BAR_T/4, beatD=BAR_D/4;
const B0=150, C0=B0+8*BAR_T, D0=C0+8*BAR_D, S0=D0+4*BAR_E, F0=S0+1.25*BAR_T, LAND=F0+BAR_T, Z0=F0+2*BAR_T, END=R(Z0+BAR_T+140);
const bB=(bar,beat)=>B0+(bar+(beat||0)/4)*BAR_T, bC=(bar,beat)=>C0+(bar+(beat||0)/4)*BAR_D, bD=(bar,beat)=>D0+(bar+(beat||0)/4)*BAR_E;
const CLIPS=[], EV=[]; const clip=(a,b,name,draw)=>CLIPS.push({a:R(a),b:R(b),name,draw}); const ev=(f,fn)=>EV.push([R(f),fn]);
/* ---------- piezas ---------- */
const BUF=mkCanvas(160,144), BUFG=BUF.getContext('2d');
function inGame(fn,clear){ const keep=ctx; ctx=BUFG; ctx.imageSmoothingEnabled=false; ctx.setTransform(1,0,0,1,0,0); ctx.globalAlpha=1; ctx.globalCompositeOperation='source-over'; ctx.clearRect(0,0,160,144); if(!clear){ ctx.fillStyle='#000'; ctx.fillRect(0,0,160,144); } try{ fn(); } finally { ctx=keep; } return BUF; }
function sh(id,clipA,off){ const at=R(clipA)-(off||0); return u=>{ const S=T.capture(id,at), i=cl(R(u)+(off||0),0,S.frames.length-1); return {img:S.frames[i],pos:S.pos[i],S,i}; }; }
function camY(S,h,key){ if(S[key]) return S[key]; const out=[]; let c=null; for(const p of S.pos){ const cy=(p[6]!==null&&p[6]!==undefined)?(p[1]+10+p[6])/2:p[1]+14, want=cl(cy-h/2,0,128-h); c=c===null?want:(Math.abs(want-c)>40?want:c+(want-c)*.22); out.push(c); } return S[key]=out; }
function camX(S,w,key){ if(S[key]) return S[key]; const out=[]; let c=null; for(const p of S.pos){ const cx=(p[5]!==null&&p[5]!==undefined)?(p[0]+8+p[5])/2:p[0]+8, want=cl(cx-w/2,0,160-w); c=c===null?want:(Math.abs(want-c)>60?want:c+(want-c)*.12); out.push(c); } return S[key]=out; }
/* el juego a sangre: 16:9 → banda de 160×90 a 12×; 9:16 → 136×128 a 8× sobre su propio reflejo desenfocado */
function fullImg(img,cy,cx){ if(!V){ T.game(img,0,cl(R(cy),0,38),160,90,0,0,12); } else { T.backdrop(img,0,0,160,128); T.frameShadow(-4,448,1088,1024); T.game(img,cl(R(cx),0,24),0,136,128,-4,448,8); } }
function full(s,band){ fullImg(s.img,band!==undefined?band:camY(s.S,90,'cy')[s.i],camX(s.S,136,'cx')[s.i]); }
/* la pantalla entera (diálogos, cartas): 16:9 → 8× centrada; 9:16 → 6× */
function screen(img,sy){ sy=sy||0; T.backdrop(img,0,sy,160,128); if(!V){ T.frameShadow(320,28,1280,1024); T.game(img,0,sy,160,128,320,28,8); } else { T.frameShadow(60,576,960,768); T.game(img,0,sy,160,128,60,576,6); } }
/* textos */
const HL=V?{x:540,y:268,size:100}:{x:960,y:200,size:96};
/* velo suave detrás del texto: arriba para los titulares, abajo para los pies (solo a sangre en 16:9; en vertical el texto ya va sobre el fondo desenfocado) */
function veil(top,a){ if(V||a<=0) return; const h=top?420:360, gr=g.createLinearGradient(0,top?0:H-h,0,top?h:H); gr.addColorStop(top?0:1,'rgba(6,12,8,'+(.55*a).toFixed(3)+')'); gr.addColorStop(top?1:0,'rgba(6,12,8,0)'); g.fillStyle=gr; g.fillRect(0,top?0:H-h,W,h); }
function headline(lines,u,dur){ veil(true,seg(u,0,16)*(dur!==undefined?1-seg(u,dur-14,dur):1)); lines.forEach(([s,col,d0],j)=>{ const uu=u-(d0||0); if(uu<0) return; T.vwords(s,HL.x,HL.y+j*R(HL.size*1.12),{size:HL.size,w:600,col:col||'#fffbe8',ls:.5},uu,dur!==undefined?dur-(d0||0):undefined); }); }
const CAP=V?{x:540,y:1610,align:'center'}:{x:104,y:986,align:'left'};
function caption(s,u,dur,accent,size){ if(u<0||u>=dur) return; const sz=size||(V?50:38), k=E.out3(seg(u,0,16)), out=seg(u,dur-12,dur), a=k*(1-out); veil(false,a*.9);
  const w=T.vwidth(s.toUpperCase(),{size:sz,w:600,ls:V?5:6}), x0=CAP.align==='left'?CAP.x:CAP.x-w/2;
  T.rect(x0,CAP.y+14,R(w*E.out3(seg(u,4,24))),V?5:4,accent||'#ffd966',a);
  T.vtext(s.toUpperCase(),CAP.x+(CAP.align==='left'?R((1-k)*-18):0),CAP.y,{size:sz,w:600,ls:V?5:6,align:CAP.align,a,sb:14}); }
function petals(f,n,cols,sp){ for(let i=0;i<n;i++){ const h=hash(i,51), x0=h%W, y0=(h>>10)%H, v=.6+((h>>20)&7)/9, s=(sp||1)*v, px=V?8:12;
  const x=((x0+f*s*1.4+Math.sin((f+i*40)*.02)*40)%(W+80)+W+80)%(W+80)-40, y=((y0+f*s)%(H+80)+H+80)%(H+80)-40, fl=((f>>3)+i)&1;
  g.fillStyle=cols[i%cols.length]; g.fillRect(R(x),R(y),px,R(px/2)); g.fillRect(R(x)+(fl?R(px/2):0),R(y+px/2),R(px/2),R(px/2)); } }
/* ---------- A · la marca ---------- */
ev(40,()=>SFX.gbDing());
clip(0,B0,'marca',(u)=>{ T.fill('#050906'); const A=bootArt(), k=V?9:12, Wd=A.w*k, x0=R(W/2-(Wd+k*2)/2), yL=R(H/2-10*k/2)-(V?40:30), y=u<10?-400:Math.min(yL,yL-300+(u-10)*10);
  A.L.forEach((l,i)=>{ const lit=u-48-i*2; let img=tintCached(l.dark,'#4c6a52'), dy=0; if(lit>0){ img=l.col; if(lit<11) dy=-R(Math.sin(lit/11*Math.PI)*k*3); }
    g.drawImage(img,0,0,l.w,10,x0+l.x*k,y+dy,l.w*k,10*k); });
  g.drawImage(u>70?A.R2:A.R,0,0,A.R.width,A.R.height,x0+Wd+k,y,A.R.width*R(k/2),A.R.height*R(k/2));
  if(u>70) T.vtext('presenta',W/2,yL+10*k+(V?110:96),{size:V?40:38,w:500,col:'#a8d0b0',ls:10,a:seg(u,70,90),shadow:false});
  if(u>118) T.fill('#000',seg(u,118,B0-2)); });
/* ---------- B · el valle (tema del título, compases 0-7) ---------- */
ev(B0-12,()=>T.trackAt('titulo',B0,0));
// compás 0: la grúa del cielo al Roble (la escena del título)
clip(B0,bB(1),'grua',(u,f)=>{ const k=E.io(seg(u,0,BAR_T)), img=inGame(()=>drawTitleScene(0,V?lp(.5,1,k):k,0,false));
  if(!V) T.game(img,0,R(lp(0,40,k)),160,90,0,0,12); else { T.backdrop(img,0,0,160,144,.5); T.frameShadow(-4,448,1088,1024); T.game(img,12,R(lp(0,16,k)),136,128,-4,448,8); }
  petals(f,22,['#f8c8e0','#ffffff','#f4a8cc'],1);
  if(u<12) T.fill('#000',1-u/12); });
// compás 1: panorámica del barrio a la plaza del Roble, en primavera
const ST={won:true,thawed:true,summered:true,autumned:true,force:0}, PANO=mkCanvas(640,128), PG=PANO.getContext('2d');
clip(bB(1),bB(2),'pano',(u,f)=>{ const strip=scStrip(['0,1','1,1','2,1','3,1'],ST,false,(f>>4)&3); PG.clearRect(0,0,640,128); PG.drawImage(strip,0,0); const keep=ctx; ctx=PG; scOak('spring',160,0); ctx=keep;
  const k=E.out(seg(u,0,BAR_T)), cx=lp(8,150,k);
  if(!V) g.drawImage(PANO,R(cx),10,160,90,0,0,1920,1080); else { T.backdrop(PANO,R(cx),0,136,128,.5); T.frameShadow(-4,448,1088,1024); g.drawImage(PANO,R(cx+12),0,136,128,-4,448,1088,1024); }
  petals(f,26,['#f8c8e0','#ffffff'],1.2); });
clip(B0,bB(2),'txt-valle',(u)=>headline([['Un valle entero','#fffbe8',R(beatT*1.5)],['por explorar','#ffd966',R(beatT*2.5)]],u,R(BAR_T*2)));
// compás 2: Sprout sale de casa
const DOOR=sh('door',bB(2),52);
clip(bB(2),bB(3),'puerta',(u)=>full(DOOR(u)));
clip(bB(2),bB(3,3),'txt-brote',(u)=>headline([['y un brote muy valiente','#fffbe8',R(beatT*.5)]],u,R(BAR_T+beatT*3)));
// compás 3: Petra, en el barrio nevado
const TALK=sh('talk',bB(3),6);
clip(bB(3),bB(4),'petra',(u)=>screen(TALK(u).img));
// compases 4-5: rincones del valle
const PLACES=[['marsh','Marisma de las Cartas','#f0a050',bB(4,0),bB(4,2)],['dunes','Dunas del Este','#ffd966',bB(4,2),bB(5,0)],['snow','Campo del Deshielo','#cfe8ff',bB(5,0),bB(5,2)],['lake','Orilla de Moss','#9ee0ff',bB(5,2),bB(6,0)]];
PLACES.forEach(([id,name,col,a,b])=>{ const S=sh(id,a,20); clip(a,b,id,(u)=>{ full(S(u)); caption(name,u-6,R(b-a),col); }); });
// compás 6: pesca y tesoros
const FISH=sh('fish',bB(6),112), CHEST=sh('chest',bB(6,2),6);
clip(bB(6),bB(6,2),'pesca',(u)=>{ screen(FISH(u).img,10); caption('Pesca con Moss',u-4,R(beatT*2),'#9ee0ff'); });
clip(bB(6,2),bB(7),'tesoro',(u)=>{ screen(CHEST(u).img,0); caption('Tesoros escondidos',u-4,R(beatT*2),'#ffd966'); });
// compás 7: la cueva: se oscurece y sube el viento
const CAVE=sh('cave',bB(7),0);
clip(bB(7),C0,'cueva',(u)=>{ full(CAVE(u)); T.fill('#000',seg(u,beatT*1.2,BAR_T-6)*.75); if(u>BAR_T-5) T.fill('#fffbe8',seg(u,BAR_T-5,BAR_T)); });
ev(bB(7,1),()=>T.sfx('riser',(C0-bB(7,1))/60));
/* ---------- C · la acción (desafío, 8 compases) ---------- */
ev(C0-12,()=>T.trackAt('desafio',C0,0)); ev(C0,()=>T.sfx('boom',1));
const WEAP=[['blade','wblade',40,'Hoja ancestral'],['bomb','wbomb',60,'Bellota-bomba'],['hook','whook',2,'Raíz-gancho'],['boomer','wboomer',5,'Vaina voladora'],
  ['lantern','wlantern',0,'Farol de brasa'],['feather','wfeather',12,'Vilano de Petra'],['shield','wshield',20,'Escudo de corteza'],['molinillo','wmolin',2,'Molinillo']];
WEAP.forEach(([kind,id,off,name],i)=>{ const a=bC(0,i*2), b=bC(0,i*2+2), S=sh(id,a,off), col=MOMENT_ARMS[kind].pal[3];
  clip(a,b,'arma-'+kind,(u)=>{ full(S(u)); caption(name,u-2,R(b-a)+2,col); if(u<3) T.fill('#ffffff',(3-u)/10); }); });
const BOSSES=[['bTopo','El Topo Real',62],['bReina','La Reina Avispa',150],['bCiervo','El Ciervo de Ámbar',170],['bKing','El Escarabajo Rey',120]];
BOSSES.forEach(([id,name,off],j)=>{ const a=bC(4+j), b=bC(5+j), S=sh(id,a,off);
  clip(a,b,'jefe-'+id,(u)=>{ full(S(u)); caption(name,u-6,R(b-a)+2,'#ff8a60',V?62:54); if(u<4) T.fill('#ffffff',(4-u)/9); });
  ev(a,()=>T.sfx('whoosh',.35,false)); });
ev(bC(7,3),()=>{ T.musicGain(0,bC(7,3.5),10); });
/* ---------- D · las cuatro estaciones ---------- */
ev(D0-12,()=>T.trackAt('estacion',D0,0)); ev(D0,()=>{ T.musicGain(T.MB*1.9,D0); T.sfx('whoosh',.5,true); T.sfx('chime'); });
const SEA=[['sea0','Primavera','#f8a8d0'],['sea1','Verano','#ffd966'],['sea2','Otoño','#f0a050'],['sea3','Invierno','#dff0ff']];
const SSH=SEA.map(([id],j)=>sh(id,bD(j),30));
function seaImg(j,f){ return SSH[j](R(f-bD(j))).img; }
function seaDraw(j,f){ fullImg(seaImg(j,f),4,12); }
clip(D0,S0,'estaciones',(u,f)=>{ const j=cl(Math.floor((f-D0)/BAR_E),0,3), w=f-bD(j);
  if(j>0&&w<32){ const k=w/32; seaDraw(j-1,f); const cx=W/2, cy=V?448+48*8:4*12+30;
    if(j===1){ T.clipCircle(cx,cy,E.in(k)*2400,()=>seaDraw(j,f)); }
    else { const sp=[]; const wx=R((W+300)-E.io(k)*(W+700)); for(let y=0;y<H;y++) sp.push([y,Math.max(0,wx+R(Math.sin(y*.02+f*.3)*30)),W]); T.clipSpans(sp,()=>seaDraw(j,f));
      const img=windArt({s:1,mood:'blow',f:(f>>2)&7}), k2=V?7:8; g.drawImage(img,0,0,img.width,img.height,wx+60,R(H/2-img.height*k2/2+Math.sin(f*.2)*20),img.width*k2,img.height*k2); } }
  else seaDraw(j,f);
  petals(f,j===3?44:24,j===0?['#f8c8e0','#ffffff']:j===1?['#fff4a0','#ffffff']:j===2?['#f0a050','#c86424']:['#ffffff','#e4f2ff'],j===3?.7:1);
  const [,word,col]=SEA[j]; caption(word,R(w-(j?12:4)),R(BAR_E)+(j===3?-6:12),col,V?70:58);
  if(u<5) T.fill('#fffbe8',(5-u)/7); });
[1,2,3].forEach(j=>ev(bD(j),()=>T.sfx('whoosh',.45,j===1)));
/* ---------- S · una semilla en la oscuridad (sin música) ---------- */
ev(S0-6,()=>{ T.trackAt('silencio',S0,0); T.musicGain(T.MB,S0); });
[26,40,84,98].forEach((d,q)=>ev(S0+d,()=>T.sfx('heart',q%2?.7:1)));
const SK=V?6:6;
function seedGlow(cx,cy,k){ g.save(); const r=90+k*60; const gr=g.createRadialGradient(cx,cy,4,cx,cy,r); gr.addColorStop(0,'rgba(255,226,140,'+(.45+k*.35).toFixed(2)+')'); gr.addColorStop(1,'rgba(255,200,90,0)'); g.fillStyle=gr; g.fillRect(cx-r,cy-r,r*2,r*2); g.restore(); }
function beatPulse(t,beats){ let v=0; for(const b of beats){ const d=t-b; if(d>=-2&&d<16) v=Math.max(v,d<0?(d+2)/2:Math.exp(-d/5)); } return v; }
clip(S0,F0,'semilla',(u)=>{ T.fill('#000'); const cx=W/2, cy=V?860:470, pulse=beatPulse(u,[26,40,84,98]), a=seg(u,0,24);
  g.globalAlpha=a; seedGlow(cx,cy,pulse); g.drawImage(TI_ACORN,0,0,TI_ACORN.width,TI_ACORN.height,R(cx-TI_ACORN.width*SK/2),R(cy-TI_ACORN.height*SK/2),TI_ACORN.width*SK,TI_ACORN.height*SK); g.globalAlpha=1;
  T.vwords('Todo empieza con una semilla',cx,cy+(V?270:240),{size:V?64:54,w:500,col:'#fffbe8',ls:1},u-40,R(F0-S0)-36);
  if(u>R(F0-S0)-14) T.fill('#000',seg(u,R(F0-S0)-14,R(F0-S0))); });
/* ---------- F · el título de verdad: la semilla sube con la escalada y se posa en el LA agudo ---------- */
ev(F0-12,()=>T.trackAt('titulo',F0,224));
const TITLE_AT=R(LAND)-(TITLE_LAND-TI_BURST);
function titleFrame(f){ const S=T.capture('title',TITLE_AT); return S.frames[cl(R(f-TITLE_AT),0,S.frames.length-1)]; }
let GREY=null;
function greyWorld(){ if(GREY) return GREY; const keepT=titleT, keepP=parts, mp=window.musicPos; titleT=TITLE_LAND-2; parts=[]; window.musicPos=()=>null; const col=tiRender(()=>tiWorld(0)); GREY=mkCanvas(160,144); GREY.getContext('2d').drawImage(tiGreyOf(col),0,0); titleT=keepT; parts=keepP; window.musicPos=mp; return GREY; }
const SKY=(()=>{ const c=mkCanvas(160,160), q=c.getContext('2d'); bandSky(q,160,160,['#3a78d0','#5aa0ec','#8cc4f8','#c8e8ff']); return c; })();
function skyBack(f){ const k=V?12:12; g.drawImage(SKY,0,0,160,160,R(W/2-80*k),R(H/2-80*k),160*k,160*k); const cl2=PARA[0].clouds, s=V?6:6, d=R((f*.35)%320)*s; for(let q=0;q<3;q++) g.drawImage(cl2,0,0,320,40,q*320*s-d,R(H*.62),320*s,40*s); }
const TK=6, TW=160*TK, TH=144*TK, TX0=V?60:R(W/2-TW/2), TY0=V?420:R(H/2-TH/2);
clip(F0,END,'titulo',(u,f)=>{ const land=R(LAND), flyStart=land-(TITLE_LAND-TI_FLY);
  const slide=(!V&&f>=Z0)?E.io(seg(f,Z0+R(beatT),Z0+R(beatT)+34)):0, tx=R(lp(TX0,110,slide)), ty=TY0;
  const wr=f>=land?E.out(seg(f,land,land+60))*2600:0;
  if(wr>0) T.clipCircle(tx+TI_AX*TK,ty+TI_AY*TK,wr,()=>{ skyBack(f); petals(f,30,['#f8c8e0','#ffffff','#f4a8cc'],.8); });
  T.frameShadow(tx,ty,TW,TH);
  if(f<land){ const k=seg(f,F0,F0+24); g.drawImage(greyWorld(),0,0,160,144,tx,ty,TW,TH); if(k<1) T.rect(tx,ty,TW,TH,'#000',1-k);
    if(f<flyStart){ const bt=(f-F0)/beatT, pulse=Math.max(0,1-(bt%1)*3), sx=tx+80*TK, sy=ty+104*TK; seedGlow(sx,sy,pulse*.8); g.drawImage(TI_ACORN,0,0,TI_ACORN.width,TI_ACORN.height,R(sx-11*TK),R(sy-13*TK),22*TK,26*TK); }
    else { const img=inGame(()=>tiAcornFlight(TITLE_LAND-(land-f)),true); g.drawImage(img,0,0,160,144,tx,ty,TW,TH); } }
  else g.drawImage(titleFrame(f),0,0,160,144,tx,ty,TW,TH);
  // la invitación
  if(f>=Z0){ const t0=Z0+R(beatT)+18, k1=seg(f,t0,t0+20);
    const ck=E.out3(seg(f,t0-8,t0+14)); if(!V) T.rrect(1164,262+R((1-ck)*20),700,556,40,'#0b2412',.62*ck); else T.rrect(80,1326+R((1-ck)*20),920,520,44,'#0b2412',.62*ck);
    if(!V){ const x=1210; T.vwords('Juega gratis',x,390,{size:112,w:700,col:'#fffbe8',align:'left'},f-t0);
      T.vwords('en el navegador y en el móvil',x,468,{size:42,w:500,col:'#fff4c8',align:'left'},f-t0-14);
      const k2=E.out3(seg(f,t0+34,t0+54)); if(k2>0){ const s='gavilanbe.github.io/sprout-game', w=T.vwidth(s,{size:36,w:600,ls:.5})+56; T.rrect(x,540+R((1-k2)*16),w,70,35,'#1d4f22',.95*k2); T.vtext(s,x+28,588+R((1-k2)*16),{size:36,w:600,ls:.5,align:'left',a:k2,shadow:false,col:'#ffd966'}); }
      const k3=seg(f,t0+60,t0+80); if(k3>0){ const A=brandArt('#fffbe8'); g.globalAlpha=k3*.9; g.drawImage(A,0,0,A.width,A.height,x,690,A.width*3,A.height*3); g.globalAlpha=1; } }
    else { const cx=540; T.vwords('Juega gratis',cx,1440,{size:128,w:700,col:'#fffbe8'},f-t0);
      T.vwords('en el navegador y en el móvil',cx,1528,{size:52,w:500,col:'#fff4c8'},f-t0-14);
      const k2=E.out3(seg(f,t0+34,t0+54)); if(k2>0){ const s='gavilanbe.github.io/sprout-game', w=T.vwidth(s,{size:44,w:600,ls:.5})+64; T.rrect(cx-w/2,1586+R((1-k2)*16),w,84,42,'#1d4f22',.95*k2); T.vtext(s,cx,1643+R((1-k2)*16),{size:44,w:600,ls:.5,a:k2,shadow:false,col:'#ffd966'}); }
      const k3=seg(f,t0+60,t0+80); if(k3>0){ const A=brandArt('#fffbe8'); g.globalAlpha=k3*.9; g.drawImage(A,0,0,A.width,A.height,R(cx-A.width*2),1728,A.width*4,A.height*4); g.globalAlpha=1; } } }
  if(f>END-44) T.fill('#000',seg(f,END-44,END-4)); });
ev(LAND,()=>T.sfx('boom',1.1)); ev(Z0+R(beatT),()=>T.sfx('whoosh',.45,true));
ev(END-70,()=>T.musicGain(0,END-70,64));
T.timeline(CLIPS,EV); T.END_RENDER=END;
})();
