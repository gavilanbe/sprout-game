'use strict';
/* ============================================================
   LA CUEVA DEL TOPO (mazmorra 1 · la Brasa): su título, la entrada
   del Escarabajo Rey y la del Topo Real, y la salida al coger la
   Brasa (contrato en 15i).
   · Título: la tierra se abre en una veta, cae el medallón con la
     Brasa latiendo, las raíces crecen por la veta y las letras caen
     como terrones.
   · Escarabajo Rey: patrulla con pasos de hierro, te ve, pisotea,
     arrastra el morro echando chispas y embiste; título de acero.
   · Topo Real: tiembla la sala, cae gravilla, un montículo da la
     vuelta a la sala, se agrieta el suelo y el Topo revienta la
     tierra, ruge y vuelve a hundirse; título de tierra y raíces.
   · Salida: raíces de brasa cruzan el suelo, te abrazan y te hunden;
     subes por la tierra a toda prisa y brotas junto a la boca de la
     cueva, donde la nieve se abre en un corro de primavera.
   Todo a tamaño nativo; draw(t) es puro en t (la versión corta es la
   misma escena, acelerada y empezando más tarde: cvT).
   ============================================================ */

/* ---------- tiempo: la versión corta recorre la misma pista más deprisa ---------- */
function cvT(P,t){ const S=P.st; return P.short?S.off+t*S.sc:t; }
function cvHit(P,t,a){ return cvT(P,t-1)<a&&a<=cvT(P,t); } // ¿la pista cruza a en este fotograma?
function cvHitEvery(P,t,a,b,step){ const A=cvT(P,t-1), B=cvT(P,t); if(B<a||A>b) return false; return Math.floor((B-a)/step)!==Math.floor((A-a)/step)&&B>=a; }

/* ---------- sonidos de la cueva ---------- */
const CV_SFX={
  rumble(){ if(!AC) return; const t=AC.currentTime; noise(.5,.06,false,t,150); beep('triangle',46,38,.45,.05,t); },
  thud(v){ if(!AC) return; const t=AC.currentTime; v=v||1; beep('triangle',96,38,.18,.09*v,t); noise(.09,.05*v,false,t,520); },
  boom(){ if(!AC) return; const t=AC.currentTime; noise(.7,.14,false,t,700); beep('triangle',130,28,.6,.16,t); beep('square',66,30,.35,.04,t); noise(.3,.05,true,t+.05,2600); },
  roar(){ if(!AC) return; const t=AC.currentTime; beep('square',f(46),f(38),.62,.05,t,true); beep('p25',f(53),f(45),.62,.035,t+.02,true); beep('triangle',f(34),f(29),.7,.08,t); noise(.5,.045,false,t,900); },
  slam(){ if(!AC) return; const t=AC.currentTime; beep('triangle',160,30,.45,.16,t); noise(.3,.08,false,t,640); beep('p25',f(57),0,.5,.03,t+.01); },
  letter(i){ if(!AC) return; const t=AC.currentTime; beep('triangle',230-(i%4)*18,90,.06,.035,t); noise(.03,.02,false,t,900); },
  type(){ if(!AC) return; beep('square',1250,0,.018,.012); },
  heart(){ if(!AC) return; const t=AC.currentTime; beep('triangle',72,36,.18,.11,t); noise(.05,.03,false,t,300); },
  creak(){ if(!AC) return; const t=AC.currentTime; swish(.55,.035,180,520,240,t,3.5); },
  clank(){ if(!AC) return; const t=AC.currentTime; beep('square',150,70,.07,.035,t); noise(.05,.05,true,t,2600); beep('triangle',90,50,.1,.05,t); },
  scrape(){ if(!AC) return; const t=AC.currentTime; swish(.36,.05,2600,5200,2400,t,2.2,true); noise(.3,.03,true,t,4200); },
  whoosh(){ if(!AC) return; const t=AC.currentTime; swish(.4,.06,420,2400,800,t,1.3); },
  crumble(){ if(!AC) return; const t=AC.currentTime; for(let i=0;i<4;i++) noise(.05,.035,false,t+i*.045,700+i*200); },
  steel(){ if(!AC) return; const t=AC.currentTime; beep('triangle',150,34,.4,.14,t); beep('square',f(81),f(79),.3,.025,t); beep('p25',f(88),0,.5,.02,t+.02); noise(.2,.06,true,t,3000); },
  spring(){ if(!AC) return; const t=AC.currentTime; [72,76,79,84,88].forEach((m,i)=>beep('p25',f(m),0,.14,.04,t+i*.07)); beep('triangle',f(60),0,.5,.05,t); },
  sink(){ if(!AC) return; const t=AC.currentTime; beep('triangle',220,60,.5,.06,t); swish(.5,.04,900,300,200,t,2); },
};

/* Sprout acaba de cruzar la puerta del borde: da unos pasos hacia dentro para no quedar bajo las franjas */
function cvWalkInit(P){ const y=player.y, x=player.x; P.st.walk=y<14?{dy:1,to:16}:y>96?{dy:-1,to:94}:x<8?{dx:1,to:14}:x>136?{dx:-1,to:130}:null; }
function cvWalkIn(P,t){ const W=P.st.walk; if(!W) return; const s=.8;
  if(W.dy){ if((W.dy>0&&player.y<W.to)||(W.dy<0&&player.y>W.to)){ player.y+=W.dy*s; player.dir=W.dy>0?0:1; player.frame=((t>>3)&1)?1:3; } else { player.frame=0; P.st.walk=null; } }
  else { if((W.dx>0&&player.x<W.to)||(W.dx<0&&player.x>W.to)){ player.x+=W.dx*s; player.dir=W.dx>0?3:2; player.frame=((t>>3)&1)?1:3; } else { player.frame=0; P.st.walk=null; } } }
/* ---------- ayudas de dibujo ---------- */
const CV_EARTH=['#1c0f07','#2e1a0c','#452812','#5c3818','#76502a','#9a7040'];
const CV_STRATA=['#6a4626','#4e3018','#3e2412','#4a2c16','#34200e','#2a180a'];
function cvPx(x,y,w,h,c){ ctx.fillStyle=c; ctx.fillRect(Math.round(x),Math.round(y),w,h); }
/* título que cae letra a letra, con relieve (ext), contorno negro, cara en dos tonos y un brillo que la cruza */
function cvLetterX(s,x0,F){ const out=[]; for(let i=0;i<s.length;i++) out.push(x0+(i?textW(s.slice(0,i),F)+1:0)); return out; }
function cvTitle(s,cx,y,T,t0,gap,pal,glintT){ const F=FONT_M, X=cvLetterX(s,Math.round(cx-textW(s,F)/2),F);
  for(let i=0;i<s.length;i++){ const ch=s[i]; if(ch===' ') continue; const u=T-(t0+i*gap); if(u<0) continue;
    const dy=Math.round(caK(u,[[0,-30],[7,0,'in3'],[10,-3,'out'],[13,0,'in']])), x=X[i], yy=y+dy;
    for(const [ox,oy] of [[-1,0],[1,0],[0,-1],[-1,1],[1,1],[-1,4],[0,4],[1,4],[-1,2],[1,2],[-1,3],[1,3]]) drawText(ctx,ch,x+ox,yy+oy,PAL.k,'left',F);
    for(let d=3;d>=1;d--) drawText(ctx,ch,x,yy+d,d===1?pal.ext2:pal.ext,'left',F);
    drawText(ctx,ch,x,yy,pal.top,'left',F);
    ctx.save(); ctx.beginPath(); ctx.rect(x-1,yy+4,12,8); ctx.clip(); drawText(ctx,ch,x,yy,pal.bot,'left',F); ctx.restore();
    if(glintT!==undefined){ const g=Math.round((T-glintT)*4-20+0); const gx=Math.round(cx-textW(s,F)/2)+g; // un brillo en diagonal
      if(gx>x-3&&gx<x+10){ ctx.save(); ctx.beginPath(); for(let r=0;r<9;r++) ctx.rect(gx-r*0.5|0,yy+r,2,1); ctx.clip(); drawText(ctx,ch,x,yy,'#ffffff','left',F); ctx.restore(); } } } }
/* ---------- rótulo grande: cada letra de la fuente del juego, construida a doble tamaño con todo el detalle a 1 px
   (contorno negro, bisel claro arriba y a la izquierda, sombra abajo, relieve de 3 px y la textura del material) ---------- */
const CV_BIG=new Map();
function cvBigGlyph(ch,pal){ const key=ch+'|'+pal.id; let G=CV_BIG.get(key); if(G!==undefined) return G;
  const F=FONT_M, o=glyphOf(F,ch); if(!o||!F.atlas){ CV_BIG.set(key,null); return null; }
  const H=F.h+F.asc+1, d=fontAtlas(F,'#ffffff').getContext('2d').getImageData(o.x,0,o.w,H).data, w=o.w*2, h=H*2, E=3, W=w+2, HH=h+2+E;
  const M=(x,y)=>x>=0&&y>=0&&x<w&&y<h&&d[((y>>1)*o.w+(x>>1))*4+3]>128;
  let y0=h, y1=0; for(let y=0;y<h;y++) for(let x=0;x<w;x++) if(M(x,y)){ y0=Math.min(y0,y); y1=Math.max(y1,y); }
  const X=(x,y)=>{ for(let e=0;e<=E;e++) if(M(x,y-e)) return e; return -1; };
  const B=pxBuf(W,HH), Mk=pxBuf(W,HH);
  for(let y=0;y<HH;y++) for(let x=0;x<W;x++){ const gx=x-1, gy=y-1;
    if(M(gx,gy)){ const v=(gy-y0)/Math.max(1,y1-y0)+(BAYER4[gy&3][gx&3]/16-.5)*.18; let c=v<.34?pal.f[0]:v<.62?pal.f[1]:pal.f[2];
      if(!M(gx,gy-1)) c=pal.hl; else if(!M(gx-1,gy)) c=v<.5?pal.hl2:pal.f[1]; else if(!M(gx,gy+1)) c=pal.sh; else if(!M(gx+1,gy)) c=pal.f[2];
      else if(pal.tex&&(hash(gx*3+ch.charCodeAt(0),gy)%pal.tex)===0) c=pal.sh;
      B.set(x,y,c); Mk.set(x,y,'#ffffff'); continue; }
    const e=X(gx,gy); if(e>0){ B.set(x,y,e===1?pal.e[0]:e===2?pal.e[1]:pal.e[2]); continue; }
    let near=false; for(const [ox,oy] of [[-1,0],[1,0],[0,-1],[0,1],[-1,-1],[1,-1],[-1,1],[1,1]]) if(X(gx+ox,gy+oy)>=0){ near=true; break; }
    if(near) B.set(x,y,PAL.k); }
  G={c:B.canvas(),m:Mk.canvas(),w:o.w}; CV_BIG.set(key,G); return G; }
function cvBigLayout(s){ const F=FONT_M, X=[]; let x=0; for(const ch of s){ X.push(x); if(ch===' '){ x+=(F.space+1)*2-2; continue; } const o=glyphOf(F,ch); x+=(o?o.w:F.space)*2+1; } return {X,w:x-1}; }
/* cae letra a letra; y = línea alta de las mayúsculas; devuelve [x izquierda, ancho] */
function cvBigTitle(s,cx,y,T,t0,gap,pal,glintT){ const L=cvBigLayout(s), x0=Math.round(cx-L.w/2), F=FONT_M;
  for(let i=0;i<s.length;i++){ const ch=s[i]; if(ch===' ') continue; const u=T-(t0+i*gap); if(u<0) continue; const G=cvBigGlyph(ch,pal); if(!G) continue;
    const dy=Math.round(caK(u,[[0,-44],[8,0,'in3'],[11,-4,'out'],[15,0,'in']])), sq=u>=8&&u<12?1:0, x=x0+L.X[i]-1, yy=y-F.asc*2-1+dy;
    ctx.drawImage(G.c,x,yy+sq); // al tocar suelo se hunde un píxel
    if(glintT!==undefined){ const gx=x0+Math.round((T-glintT)*5)-24; if(gx>x-12&&gx<x+G.c.width+2){ ctx.save(); ctx.beginPath(); for(let r=0;r<G.c.height;r++) ctx.rect(gx+(G.c.height-r>>1),yy+r,3,1); ctx.clip(); ctx.globalAlpha=.85; ctx.drawImage(G.m,x,yy); ctx.restore(); } } }
  return [x0,L.w]; }
function cvBigX(s,cx,i){ const L=cvBigLayout(s); return Math.round(cx-L.w/2)+L.X[i]; }
const CV_BIG_EARTH={id:'earth',f:['#fff0c8','#f4c060','#d88a2a'],hl:'#fffbe8',hl2:'#fff4d0',sh:'#9a5a1c',e:['#6a3a14','#4a2810','#2a160a'],tex:13};
const CV_BIG_STEEL={id:'steel',f:['#ffffff','#c8d8f0','#8098c0'],hl:'#ffffff',hl2:'#f0f6ff',sh:'#4a5a80',e:['#3a4660','#28303e','#161a24']};
const CV_BIG_ECHO={id:'echo',f:['#f8f0ff','#d0b8ff','#9a78e8'],hl:'#ffffff',hl2:'#f4ecff',sh:'#5a3aa0',e:['#3a2870','#281c50','#160e30']};
function cvTitleLand(s,T,t0,gap){ let n=0; for(let i=0;i<s.length;i++){ if(s[i]===' ') continue; if(T>=t0+i*gap+7) n++; } return n; }
/* texto pequeño a máquina */
function cvType(s,x,y,T,t0,per,col,sh,align){ const n=Math.max(0,Math.min(s.length,Math.floor((T-t0)/per))); if(n<=0) return; txtSO(s.slice(0,n),x,y,col,align||'center',sh); }
/* una veta de tierra de ancho completo, bordes mellados, raíces colgando; k abre desde el centro (0..1), kv la cierra en alto */
function cvStrip(y,h,k,kv,pal,T,seed){ const half=Math.round(80*clamp(k,0,1)); if(half<=0) return; const x0=80-half, x1=80+half;
  const hh=Math.round(h*clamp(kv===undefined?1:kv,0,1)); if(hh<=0) return; const yc=y+h/2, top=Math.round(yc-hh/2), bot=Math.round(yc+hh/2);
  for(let x=x0;x<x1;x++){ const jt=hash(x>>1,seed)%3, jb=hash(x>>1,seed+7)%3, t0=top-jt, b0=bot+jb;
    cvPx(x,t0-1,1,1,PAL.k); cvPx(x,b0,1,1,PAL.k);
    for(let yy=t0;yy<b0;yy++){ const w=yy-t0+Math.sin(x*.09+seed)*2.2, v=w/Math.max(1,b0-t0), band=clamp(Math.floor(v*pal.length+(BAYER4[yy&3][x&3]/16-.5)*.9),0,pal.length-1);
      let c=pal[band]; const hp=hash(x>>1,(yy>>1)+seed*7)%53; if(hp===0) c='#a08c74'; else if(hp===1) c='#1c0f07'; else if(yy===t0) c=pal[0]; else if(yy===b0-1) c='#1c0f07';
      cvPx(x,yy,1,1,c); }
    if(hash(x,seed+11)%7===0) cvPx(x,t0,1,1,'#b08858'); // brillos en el labio de arriba
    const root=hash(x,seed+3)%23; if(root<2&&x>x0+2&&x<x1-3){ const L=3+hash(x,seed+5)%6; for(let i=0;i<L;i++){ const rx=x+Math.round(Math.sin(i*.9+x)*.8); cvPx(rx,b0+i,1,1,i===L-1?'#8a5a30':'#2a1608'); } } } }
/* círculo exterior negro (iris) */
function cvIris(cx,cy,r){ ctx.fillStyle='#000'; if(r<=0){ ctx.fillRect(-4,-4,VW+8,VH+8); return; }
  for(let y=-4;y<VH+4;y++){ const d=y+.5-cy; if(Math.abs(d)>=r){ ctx.fillRect(-4,y,VW+8,1); continue; } const w=Math.round(Math.sqrt(r*r-d*d)); ctx.fillRect(-4,y,Math.max(0,cx-w+4),1); ctx.fillRect(cx+w,y,VW+4-(cx+w),1); } }
/* grietas que se abren desde un punto (se generan una vez por semilla) */
const CV_CRACKS=new Map();
function cvCracks(seed,n,len){ const key=seed+'|'+n+'|'+len; let C=CV_CRACKS.get(key); if(C) return C; const r=seeded(seed); C=[];
  for(let i=0;i<n;i++){ let a=i/n*6.283+r()*.6, x=0, y=0; const pts=[[0,0]]; for(let s=0;s<len;s++){ a+=(r()-.5)*.9; x+=Math.cos(a)*2; y+=Math.sin(a)*1.2; pts.push([Math.round(x),Math.round(y)]); if(r()<.12&&s>3){ const b=[]; let bx=x, by=y, ba=a+(r()<.5?.9:-.9); for(let q=0;q<4;q++){ bx+=Math.cos(ba)*2; by+=Math.sin(ba)*1.2; b.push([Math.round(bx),Math.round(by)]); } pts.branch=pts.branch||[]; pts.branch.push([pts.length-1,b]); } } C.push(pts); }
  CV_CRACKS.set(key,C); return C; }
function cvDrawCracks(cx,cy,C,k,glow){ const lip=glow?'#f8a030':'#8a6a48';
  for(const pts of C){ const n=Math.floor((pts.length-1)*clamp(k,0,1)); for(let i=0;i<=n;i++){ const [x,y]=pts[i]; cvPx(cx+x,cy+y,1,1,'#120905'); cvPx(cx+x,cy+y+1,1,1,lip); }
    if(pts.branch) for(const [at,b] of pts.branch){ if(at>n) continue; const m=Math.min(b.length,n-at); for(let i=0;i<m;i++){ const [x,y]=b[i]; cvPx(cx+x,cy+y,1,1,'#120905'); } } } }
/* el agujero en el suelo (cx,cy = centro del borde) */
function cvHole(cx,cy,rx,ry){ rx=Math.round(rx); ry=Math.round(ry); if(rx<1) return;
  for(let y=-ry-1;y<=ry+1;y++){ const w=Math.round(rx*Math.sqrt(Math.max(0,1-(y*y)/((ry+1)*(ry+1))))); if(w<=0) continue; cvPx(cx-w-1,cy+y,w*2+2,1,y<0?'#9a7c58':'#5a4430'); }
  for(let y=-ry;y<=ry;y++){ const w=Math.round((rx-1)*Math.sqrt(Math.max(0,1-(y*y)/(ry*ry)))); if(w<=0) continue; cvPx(cx-w,cy+y,w*2,1,y<-ry/2?'#2a180c':'#120905'); } }

/* ---------- el medallón de la Brasa y la veta del título (se generan una vez) ---------- */
const CV_MEDAL=(()=>{ const c=mkCanvas(30,30), g=c.getContext('2d');
  blobArt(g,1,1,28,28,[{x:14,y:14,r:13.5}],['#2a2420','#4a4038','#6e6254','#958674','#bcae98'],{grad:.5,dither:.6});
  for(let y=0;y<30;y++) for(let x=0;x<30;x++){ const d=Math.hypot(x+.5-15,y+.5-15); if(d<9.5){ g.fillStyle=d>8.5?PAL.k:d>7.5?'#3a1a0c':'#1a0a06'; g.fillRect(x,y,1,1); } }
  g.fillStyle='#d8ccb4'; for(const [x,y] of [[15,2],[27,15],[15,27],[2,15]]) g.fillRect(x-1,y-1,2,2); // cuatro remaches de piedra clara
  return c; })();

/* ============================================================
   1) EL TÍTULO DE LA MAZMORRA
   ============================================================ */
const CV_CARD={art:'LA',name:'CUEVA DEL TOPO',pre:'MAZMORRA 1',sub:'donde duerme la Brasa'};
DNG_CARD.cueva={ dur:196, shortDur:104,
  start(P){ P.st.off=0; P.st.sc=196/104; if(AC) CV_SFX.rumble(); },
  tick(t,P){ const T=cvT(P,t);
    if(cvHit(P,t,6)){ shake=Math.max(shake,4); CV_SFX.crumble(); }
    if(T>=6&&T<26&&(t&1)===0){ const half=80*presentEase.out(presentSeg(T,6,24)); for(const s of [-1,1]) parts.push({x:80+s*half+(Math.random()-.5)*3,y:48+Math.random()*44,vx:s*.3,vy:.3,life:22,col:Math.random()<.5?'#5c3818':'#9a7040'}); }
    if(cvHit(P,t,27)){ CV_SFX.thud(1.2); shake=Math.max(shake,5); for(let i=0;i<10;i++){ const a=i/10*6.283; parts.push({k:'dust',x:80+Math.cos(a)*12,y:44+Math.sin(a)*4,vx:Math.cos(a)*.9,vy:Math.sin(a)*.3-.2,life:18,max:18,r:2,col:'#8a6a48',nog:true}); } }
    for(const b of [40,62,84,106,128,150]) if(cvHit(P,t,b)) CV_SFX.heart();
    for(let i=0;i<CV_CARD.pre.length;i++) if(CV_CARD.pre[i]!==' '&&cvHit(P,t,34+i*2)) CV_SFX.type();
    if(cvHit(P,t,44)) CV_SFX.letter(0);
    for(let i=0;i<CV_CARD.name.length;i++) if(CV_CARD.name[i]!==' '&&cvHit(P,t,48+i*3+8)){ CV_SFX.letter(i); const x=cvBigX(CV_CARD.name,80,i)+5; for(const s of [-1,1]) parts.push({k:'dust',x:x+s*4,y:80,vx:s*.5,vy:-.12,life:12,max:12,r:1,col:'#c8a070',nog:true}); }
    if(cvHit(P,t,48+13*3+9)){ CV_SFX.slam(); shake=Math.max(shake,4); }
    for(let i=0;i<CV_CARD.sub.length;i+=2) if(cvHit(P,t,104+i*2)) CV_SFX.type();
    if(cvHit(P,t,168)) CV_SFX.crumble();
    if(T>=24&&T<150&&(t%5)===0) parts.push({x:20+Math.random()*120,y:42,vx:0,vy:.2,life:40,col:Math.random()<.5?'#76502a':'#452812'}); }, // gravilla que se desprende
  draw(t,P){ const T=cvT(P,t), out=presentSeg(T,164,196);
    ctx.globalAlpha=.5*presentSeg(T,0,14)*(1-out); ctx.fillStyle='#0a0604'; ctx.fillRect(-4,-4,VW+8,VH+8); ctx.globalAlpha=1;
    const k=presentEase.out(presentSeg(T,6,24)), kv=1-presentEase.in(out);
    cvStrip(44,54,k,kv,CV_STRATA,T,41);
    if(kv<=0) return;
    ctx.save(); ctx.beginPath(); const hh=Math.round(54*kv); ctx.rect(0,71-hh/2-2,160,hh+4); ctx.clip(); ctx.globalAlpha=1-presentSeg(T,164,178);
    // las raíces crecen desde el medallón por los dos bordes de la veta
    const L=Math.round(78*presentEase.out(presentSeg(T,26,84)));
    for(const s of [-1,1]) for(let i=0;i<L;i++){ const x=80+s*(12+i), y=46+Math.round(Math.sin(i*.21+s)*1.4); cvPx(x,y-1,1,3,PAL.k); cvPx(x,y,1,1,'#8a5a30'); if((i+(s>0?3:0))%7===0) cvPx(x,y,1,1,'#c89058');
      if(i%11===5){ const n=Math.min(6,L-i); for(let q=1;q<n;q++){ cvPx(x+s*(q>>1)-1,y+q,3,1,PAL.k); cvPx(x+s*(q>>1),y+q,1,1,q===n-1?'#c89058':'#6a4020'); } }
      const y2=96-Math.round(Math.sin(i*.17-s)*1.4); cvPx(80+s*(4+i),y2-1,1,3,PAL.k); cvPx(80+s*(4+i),y2,1,1,'#7a4a24'); }
    // «MAZMORRA 1», el nombre que cae y el subtítulo
    cvType(CV_CARD.pre,80,52,T,34,2,'#f0c078','#1c0f07');
    const bx=Math.round(80-cvBigLayout(CV_CARD.name).w/2);
    cvTitle(CV_CARD.art,bx+7,55,T,37,3,{ext:'#452812',ext2:'#76502a',top:'#fff4d8',bot:'#f4b048'});
    cvBigTitle(CV_CARD.name,80,64,T,48,3,CV_BIG_EARTH,T>=100?100:undefined);
    cvType(CV_CARD.sub,80,88,T,104,2,'#f0c898','#1c0f07');
    ctx.restore();
    // el medallón cae y la Brasa late
    const my=Math.round(caK(T,[[14,-30],[27,17,'in3'],[31,13,'out'],[35,17,'in']])), mA=1-out;
    if(T>=14&&mA>0){ ctx.globalAlpha=mA; const beat=[40,62,84,106,128,150].reduce((v,b)=>{ const u=T-b; return v+(u>=0&&u<14?Math.exp(-u/4):0); },0);
      glowAt(80,my+15,12+beat*8,'rgba(255,170,60,'+(.28+beat*.35).toFixed(2)+')');
      ctx.drawImage(CV_MEDAL,65,my); ctx.drawImage(EMBER_SPR,72,my+7+(beat>.6?-1:0));
      if(beat>.7){ cvPx(79,my+4,1,1,'#fff4b0'); cvPx(86,my+11,1,1,'#fff4b0'); }
      ctx.globalAlpha=1; } } };

/* ============================================================
   2) EL ESCARABAJO REY (minijefe, sala 8,0)
   ============================================================ */
const CV_STEEL={ext:'#1a2030',ext2:'#4a5670',top:'#f0f6ff',bot:'#98acc8'};
function cvIronStrip(y,h,k,kv,T){ const half=Math.round(80*clamp(k,0,1)); if(half<=0) return; const hh=Math.round(h*clamp(kv,0,1)); if(hh<=0) return; const top=Math.round(y+h/2-hh/2);
  cvPx(80-half,top-1,half*2,hh+2,PAL.k); cvPx(80-half,top,half*2,hh,'#2a3040'); cvPx(80-half,top,half*2,1,'#6a7890'); cvPx(80-half,top+hh-1,half*2,1,'#161a24');
  for(let x=80-half+4;x<80+half-3;x+=12){ cvPx(x,top+2,2,2,'#8a98b0'); cvPx(x,top+2,1,1,'#e0e8f4'); if(hh>10){ cvPx(x,top+hh-4,2,2,'#8a98b0'); cvPx(x,top+hh-4,1,1,'#e0e8f4'); } }
  const sw=Math.round((T*5)%260)-50; for(let r=0;r<hh;r++){ const x=80-half+sw-r; if(x>80-half&&x<80+half-2) cvPx(x,top+r,2,1,'rgba(220,232,255,.18)'); } }
function cvKingPose(P,T){ const S=P.st, x0=S.m.x, y0=S.m.y; // dónde está y cómo mira el Rey en el instante T de la pista
  let x=x0, y=y0, dir=-1, hop=0, sh=0;
  if(T<44){ const u=presentSeg(T,8,40); x=x0-Math.round(18*u); dir=-1; hop=((T>>3)&1)&&T>8&&T<40?-1:0; }
  else if(T<60){ x=x0-18; dir=T<50?-1:1; hop=T>=44&&T<50?-2:0; }
  else if(T<86){ x=x0-18; dir=1; hop=-Math.round(Math.max(0,Math.sin(presentSeg(T,60,70)*Math.PI))*5+Math.max(0,Math.sin(presentSeg(T,72,82)*Math.PI))*5); }
  else if(T<98){ x=x0-18; dir=1; sh=(T&2)?1:-1; }
  else { const u=presentEase.out(presentSeg(T,98,112)); x=x0-18+Math.round(8*u); y=y0+Math.round(14*u); dir=1; if(T>=112&&T<122) sh=(T&1)?1:0; } // se queda donde frenó: de ahí arranca la pelea
  return {x,y,dir,hop,sh}; }
BOSS_INTRO.king={ dur:200, shortDur:84,
  start(P){ const m=midboss; cvWalkInit(P); P.st.off=56; P.st.sc=(200-56)/84; P.st.m={x:m.x,y:m.y,st:m.st,t:m.t,dir:m.dir}; bossHidden=true; setTrack('silencio'); },
  tick(t,P){ const T=cvT(P,t); cvWalkIn(P,t);
    if(T<40) for(let a=12;a<40;a+=8) if(cvHit(P,t,a)){ CV_SFX.clank(); shake=Math.max(shake,1); const K=cvKingPose(P,T); parts.push({k:'dust',x:K.x+12,y:K.y+23,vx:.3,vy:-.1,life:12,max:12,r:1,col:'#8a8078',nog:true}); }
    if(cvHit(P,t,46)&&AC){ const tt=AC.currentTime; beep('square',880,1320,.08,.035,tt); }
    for(const a of [70,82]) if(cvHit(P,t,a)){ CV_SFX.thud(1.3); shake=Math.max(shake,4); const K=cvKingPose(P,T); for(let i=0;i<8;i++){ const an=i/8*6.283; parts.push({k:'dust',x:K.x+12+Math.cos(an)*8,y:K.y+22+Math.sin(an)*3,vx:Math.cos(an)*.9,vy:Math.sin(an)*.3-.1,life:16,max:16,r:2,col:'#9a9088',nog:true}); } }
    if(cvHit(P,t,86)) CV_SFX.scrape();
    if(T>=86&&T<112&&(t&1)===0){ const K=cvKingPose(P,T); for(let i=0;i<2;i++) parts.push({k:'shard',x:K.x+22,y:K.y+18,vx:-.5-Math.random()*1.6,vy:-1.2-Math.random()*1.2,life:10,max:12,col:Math.random()<.5?'#fff0a0':'#ffb040',nog:false}); }
    if(cvHit(P,t,98)) CV_SFX.whoosh();
    if(cvHit(P,t,112)){ shake=Math.max(shake,7); CV_SFX.steel(); screenFlash(4,'#e8f0ff'); presentMusic(P); }
    if(T>=112&&T<126&&(t&1)===0){ const K=cvKingPose(P,T); parts.push({k:'dust',x:K.x+6+Math.random()*12,y:K.y+22,vx:(Math.random()-.5)*.5,vy:-.2,life:14,max:14,r:1+(t&2?1:0),col:'#a09890',nog:true}); }
    const S='ESCARABAJO'; if(cvHit(P,t,118)) CV_SFX.letter(0); for(let i=0;i<S.length;i++) if(cvHit(P,t,120+i*2+8)) CV_SFX.letter(i);
    if(cvHit(P,t,120+9*2+9)){ shake=Math.max(shake,4); CV_SFX.steel(); }
    if(cvHit(P,t,146)){ CV_SFX.slam(); if(AC){ const tt=AC.currentTime; [84,88,91].forEach((m,i)=>beep('p25',f(m),0,.12,.03,tt+.05+i*.05)); } }
    for(let i=0;i<14;i+=2) if(cvHit(P,t,156+i*2)) CV_SFX.type(); },
  draw(t,P){ const T=cvT(P,t), K=cvKingPose(P,T), m=midboss;
    // el Rey, dibujado aquí (mira a un lado y a otro, pisotea, arrastra el morro y embiste)
    if(m){ const img=K.dir<0?BOSS_SPR.kingL:BOSS_SPR.king, flashW=T===98||T===99;
      if(T>=98&&T<112){ for(let i=1;i<4;i++){ ctx.globalAlpha=.25/i; ctx.drawImage(img,K.x-(i*2),K.y-i*6); } ctx.globalAlpha=1; } // estela de la embestida
      drawShadow(K.x+12,K.y+23,10); ctx.drawImage(flashW?(K.dir<0?BOSS_WHITE.kingL:BOSS_WHITE.king):img,K.x+K.sh,K.y+K.hop);
      if(T>=86&&T<98&&(T&4)){ cvPx(K.x+22,K.y+15+K.hop,2,1,'#ffffff'); cvPx(K.x+23,K.y+14+K.hop,1,3,'#ffffff'); } // el morro brilla
      if(T>=44&&T<62){ const u=T-44, by=K.y-10-Math.round(caK(u,[[0,4],[5,-2,'out'],[8,0,'in']])); // ¡!
        cvPx(K.x+9,by-1,7,10,PAL.k); cvPx(K.x+10,by,5,8,'#fff4b0'); cvPx(K.x+12,by+1,1,4,'#c02828'); cvPx(K.x+12,by+6,1,1,'#c02828'); } }
    // barras, veta de acero y el nombre
    const out=presentSeg(T,184,200); presentBars(presentEase.out(P.short?presentSeg(t,0,8):presentSeg(T,0,12))*(1-out),14);
    const k=presentEase.out(presentSeg(T,110,122));
    if(k>0){ cvIronStrip(15,42,k,1-presentEase.in(out),T);
      if(out<1){ ctx.save(); ctx.beginPath(); ctx.rect(0,14,160,44); ctx.clip();
        const L=cvBigLayout('ESCARABAJO'), x0=Math.round(80-(L.w+4+textW('REY'))/2), cx=x0+L.w/2;
        cvTitle('EL',x0+5,19,T,118,3,CV_STEEL);
        cvBigTitle('ESCARABAJO',cx,28,T,120,2,CV_BIG_STEEL,T>=150?150:undefined);
        const rx=x0+L.w+4, ry=Math.round(caK(T-146,[[0,-40],[8,0,'in3'],[11,-3,'out'],[14,0,'in']]));
        if(T>=146){ cvTitle('REY',rx+textW('REY')/2,36,T,146,0,{ext:'#6a4210',ext2:'#b07818',top:'#fff8c0',bot:'#f8d048'});
          const cy=27+ry, c=rx+Math.round(textW('REY')/2); cvPx(c-5,cy+1,11,4,PAL.k); cvPx(c-4,cy+2,9,2,'#f8d048'); for(const dx of [-4,0,4]){ cvPx(c+dx-1,cy-2,3,4,PAL.k); cvPx(c+dx,cy-1,1,3,dx?'#e0a830':'#fff8c0'); } cvPx(c,cy+2,1,1,'#c02828'); } // la corona
        cvType('morro de hierro',80,48,T,156,2,'#d8e2f4','#10141c'); ctx.restore(); } }
    if(T>=98&&T<108){ ctx.globalAlpha=.5*(1-presentSeg(T,98,108)); ctx.fillStyle='#ffffff'; for(let i=0;i<10;i++){ const x=(hash(i,T>>1)%150)+5; ctx.fillRect(x,14+hash(i,3)%100,1,10+(i%3)*4); } ctx.globalAlpha=1; } },
  end(P){ const m=midboss, M=P.st.m; if(m&&M){ const K=cvKingPose(P,999); m.x=K.x; m.y=K.y; m.st=M.st; m.t=M.t; m.dir=1; m.vx=m.vy=0; } bossHidden=false; } };

/* ============================================================
   3) EL TOPO REAL (sala 6,2; su eco en 1,12)
   ============================================================ */
const CV_EARTHT={ext:'#2a160a',ext2:'#6a4020',top:'#fff6dc',bot:'#f0a040'};
function cvMoundAt(x,y,wob){ drawShadow(x+16+wob,y+26,12); ctx.drawImage(MOUND_ART,Math.round(x+4+wob),Math.round(y+16)); }
function cvBez(u,p0,p1,p2,p3){ const a=(1-u)*(1-u)*(1-u), b=3*u*(1-u)*(1-u), c=3*u*u*(1-u), d=u*u*u; return [a*p0[0]+b*p1[0]+c*p2[0]+d*p3[0],a*p0[1]+b*p1[1]+c*p2[1]+d*p3[1]]; }
function cvMoundPos(P,T){ const S=P.st, e=[S.b.mx,S.b.my]; const u=presentEase.io(presentSeg(T,8,92)); return cvBez(u,[-30,96],[30,40],[150,120],e); }
/* altura del Topo sobre su agujero (positivo = bajo tierra) y cuánto se estira */
function cvTopoY(T){ if(T<112) return 40; if(T<150) return caK(T,[[112,30],[126,-26,'out'],[146,0,'in3']]); if(T<250) return 0; return caK(T,[[250,0],[258,-16,'out'],[274,34,'in3']]); }
function cvTopoSq(T){ if(T>=112&&T<126) return -.22; if(T>=126&&T<146) return -.1*(1-presentSeg(T,126,146)); if(T>=146&&T<160) return .32*Math.exp(-(T-146)/4); if(T>=258&&T<274) return -.25; if(T>=156&&T<200) return .04*Math.sin((T-156)*.9); return 0; }
BOSS_INTRO.topo={ dur:300, shortDur:112,
  start(P){ const b=boss; cvWalkInit(P); P.st.off=88; P.st.sc=(300-88)/112; P.st.b={x:b.x,y:b.y,mx:b.mx,my:b.my,st:b.st,t:b.t}; bossHidden=true; setTrack('silencio'); },
  tick(t,P){ const T=cvT(P,t), B=P.st.b; cvWalkIn(P,t);
    if(T>=8&&T<92){ if(cvHitEvery(P,t,8,92,6)) shake=Math.max(shake,2); if(cvHitEvery(P,t,8,92,26)) CV_SFX.rumble();
      if((t&1)===0){ const [mx,my]=cvMoundPos(P,T); if(mx>-10&&mx<150) parts.push({x:mx+12+Math.random()*8,y:my+26,vx:(Math.random()-.5)*.9,vy:-.7,life:12,col:(t&2)?'#5a4a40':'#8a6a48'}); }
      const [mx,my]=cvMoundPos(P,T); const cx=mx+16, cy=my+16; if(!P.st.walk) player.dir=Math.abs(cx-player.x-8)>Math.abs(cy-player.y-8)?(cx>player.x+8?3:2):(cy>player.y+8?0:1); }
    if(T>=92&&T<112){ if((t&1)===0) parts.push({x:B.mx+16+(Math.random()-.5)*12,y:B.my+26,vx:(Math.random()-.5)*.4,vy:-1,life:9,col:'#6e5a4c',nog:true}); shake=Math.max(shake,1); if(cvHit(P,t,94)) CV_SFX.creak(); }
    if(cvHit(P,t,112)){ shake=Math.max(shake,12); CV_SFX.boom(); screenFlash(3,'#f8e0b0');
      const cx=B.mx+16, cy=B.my+24; for(let i=0;i<16;i++){ const a=-Math.PI*(i/15), s=1.2+Math.random()*2.2; parts.push({x:cx,y:cy,vx:Math.cos(a)*s,vy:Math.sin(a)*s-1,life:26+(i&7),col:i&1?'#5a4430':'#9a7c58'}); }
      for(let i=0;i<8;i++){ const a=i/8*6.283; parts.push({k:'smoke',x:cx+Math.cos(a)*6,y:cy+Math.sin(a)*2,vx:Math.cos(a)*.9,vy:-.4,life:22,max:26,r:3,col:'#a08870',nog:true}); } }
    if(cvHit(P,t,146)){ shake=Math.max(shake,6); CV_SFX.thud(1.4); const cx=B.mx+16, cy=B.my+30; for(let i=0;i<10;i++){ const a=i/10*6.283; parts.push({k:'dust',x:cx+Math.cos(a)*10,y:cy+Math.sin(a)*3,vx:Math.cos(a)*1.1,vy:Math.sin(a)*.35-.1,life:18,max:18,r:2,col:'#8a7058',nog:true}); } }
    if(cvHit(P,t,158)){ CV_SFX.roar(); shake=Math.max(shake,8); }
    if(T>=158&&T<196) shake=Math.max(shake,1);
    if(cvHit(P,t,168)) presentMusic(P);
    const S='TOPO REAL', t0=176;
    if(cvHit(P,t,172)) CV_SFX.letter(0);
    for(let i=0;i<S.length;i++) if(S[i]!==' '&&cvHit(P,t,t0+i*3+8)){ CV_SFX.letter(i); const x=cvBigX(S,80,i)+5; for(const s of [-1,1]) parts.push({k:'dust',x:x+s*4,y:118,vx:s*.5,vy:-.12,life:12,max:12,r:1,col:P.Q.echo?'#b8a0ff':'#c8a070',nog:true}); }
    if(cvHit(P,t,t0+(S.length-1)*3+9)){ CV_SFX.slam(); shake=Math.max(shake,6); }
    const sub=P.Q.echo?'un recuerdo que muerde':'guardián de la Brasa'; for(let i=0;i<sub.length;i+=2) if(cvHit(P,t,t0+S.length*3+12+i*2)) CV_SFX.type();
    if(cvHit(P,t,258)) CV_SFX.whoosh();
    if(cvHit(P,t,272)){ CV_SFX.thud(1.1); shake=Math.max(shake,4); const cx=B.mx+16, cy=B.my+24; for(let i=0;i<10;i++){ const a=-Math.PI*(i/9), s=.8+Math.random()*1.5; parts.push({x:cx,y:cy,vx:Math.cos(a)*s,vy:Math.sin(a)*s-.6,life:20,col:i&1?'#5a4430':'#9a7c58'}); } } },
  draw(t,P){ const T=cvT(P,t), B=P.st.b, echo=P.Q.echo, cx=B.mx+16, gy=B.my+26; // gy: la línea del suelo donde se abre el agujero
    // gravilla del techo (determinista)
    if(T>=10&&T<120) for(let i=0;i<18;i++){ const t0=10+i*5+(hash(i,3)%4), u=T-t0; if(u<0||u>40) continue; const x=16+hash(i,77)%128, yl=26+hash(i,5)%76, y=Math.min(yl,-4+u*u*.16), land=y>=yl;
      if(!land){ ctx.globalAlpha=.35; cvPx(x+1,4,1,Math.max(0,y-4),'#8a7058'); ctx.globalAlpha=1; } // el hilo de polvo que cae con ella
      if(land){ const v=u-Math.sqrt((yl+4)/.16); if(v>14) continue; const r=Math.min(4,1+v*.5); ctx.globalAlpha=Math.max(0,1-v/14)*.6; cvPx(x-r+1,yl+1,r*2,1,'#a08870'); cvPx(x-r+2,yl,r*2-2,1,'#c8b090'); ctx.globalAlpha=1; if(v>8) continue; }
      cvPx(x-1,y-1,4,4,PAL.k); cvPx(x,y,2,2,'#7a6450'); cvPx(x,y,1,1,'#b8a080'); }
    // grietas que se abren hacia el agujero
    const ck=presentSeg(T,92,112); if(ck>0&&T<276) cvDrawCracks(cx,gy,cvCracks(606,7,11),ck,echo?false:T>=112);
    // el montículo que da la vuelta a la sala
    if(T>=8&&T<112){ const [mx,my]=T<92?cvMoundPos(P,T):[B.mx,B.my]; cvMoundAt(mx,my,T>=92?((T&2)?1:-1):0); }
    // el agujero y el Topo
    const yo=cvTopoY(T);
    if(T>=112&&T<280){ const r=T<118?presentEase.out(presentSeg(T,112,118)):T>=272?1-presentSeg(T,272,280):1; cvHole(cx,gy,12*r,4*r); }
    if(T>=112&&T<276){ const sq=cvTopoSq(T), img=echo?tintCached(TOPO_SPR,'#b8a0ff'):TOPO_SPR, jit=T>=158&&T<196?((T&2)?1:-1):0, hy=gy+4;
      if(yo<2) drawShadow(cx,gy+4,Math.max(4,12-Math.max(0,-yo)/3));
      if(echo) glowAt(cx,B.my+16+yo,30,'rgba(170,140,255,.35)');
      ctx.save(); ctx.beginPath(); ctx.rect(-4,-4,VW+8,hy+4); ctx.clip(); ctx.translate(cx+jit,B.my+30+yo); ctx.scale(1+sq,1-sq); if(echo){ ctx.globalAlpha=.8; ctx.drawImage(TOPO_SPR,-16,-30); ctx.globalAlpha=.4+.1*Math.sin(T*.2); ctx.drawImage(img,-16,-30); } else ctx.drawImage(img,-16,-30); ctx.restore();
      if(T>=112&&T<280) { const r=T>=272?1-presentSeg(T,272,280):1; if(r>0){ for(let x=-11;x<=11;x++){ const y=Math.round(Math.sqrt(Math.max(0,1-(x*x)/144))*4*r); cvPx(cx+x,gy+y,1,1,'#9a7c58'); cvPx(cx+x,gy+y+1,1,1,PAL.k); } } } // el labio de delante del agujero tapa al Topo
      // el rugido: ondas que salen de la boca
      if(T>=158&&T<200) for(const r0 of [158,166,174,182]){ const u=T-r0; if(u<0||u>16) continue; const rr=8+u*3, a=1-u/16; ctx.globalAlpha=a; for(let i=0;i<24;i++){ const an=i/24*6.283; cvPx(cx+Math.cos(an)*rr,B.my+14+Math.sin(an)*rr*.6,1,1,echo?'#e0d0ff':'#fff0c8'); } ctx.globalAlpha=1; }
      if(T>=170&&T<250&&((T>>3)&1)) cvPx(cx+5,B.my+4+yo,1,1,'#ffffff'); } // la corona destella
    if(T>=272){ const w=presentSeg(T,272,300); cvMoundAt(B.mx,B.my,w<.5?((T&2)?1:-1):0); } // ya bajo tierra: su montículo, listo para la pelea
    // barras, la veta de tierra y el nombre
    const out=presentSeg(T,282,300); presentBars(presentEase.out(P.short?presentSeg(t,0,8):presentSeg(T,0,12))*(1-out),14);
    const S='TOPO REAL', t0=176, k=presentEase.out(presentSeg(T,164,176));
    if(k>0){ const pal=echo?['#6a5898','#3e3068','#2e2450','#382a5c','#221a3c','#1a1430']:CV_STRATA;
      cvStrip(89,40,k,1-presentEase.in(presentSeg(T,272,292)),pal,T,63);
      if(T<292){ ctx.save(); ctx.beginPath(); ctx.rect(0,86,160,44); ctx.clip(); ctx.globalAlpha=1-presentSeg(T,270,284);
        const bx=Math.round(80-cvBigLayout(S).w/2), small=echo?{ext:'#1c1430',ext2:'#5a4890',top:'#f4f0ff',bot:'#b8a0ff'}:CV_EARTHT;
        cvTitle(echo?'ECO DEL':'EL',bx+(echo?19:7),92,T,172,3,small);
        cvBigTitle(S,80,101,T,t0,3,echo?CV_BIG_ECHO:CV_BIG_EARTH,T>=t0+S.length*3+14?t0+S.length*3+14:undefined);
        cvType(echo?'un recuerdo que muerde':'guardián de la Brasa',80,122,T,t0+S.length*3+12,2,echo?'#e0d4ff':'#f0c898',echo?'#140c24':'#1c0f07'); ctx.restore(); } } },
  end(P){ const b=boss, B=P.st.b; if(b&&B){ b.x=B.x; b.y=B.y; b.mx=B.mx; b.my=B.my; b.st=B.st; b.t=B.t; } bossHidden=false; } };

/* ============================================================
   4) LA SALIDA: las raíces de la Brasa te llevan a la boca de la cueva
   ============================================================ */
const CV_DEST={sx:2,sy:-1,x:72,y:40,dir:0};
const CV_SOIL=(()=>{ const W=160, H=96, B=pxBuf(W,H,'#2e1a0c'), r=seeded(4242);
  for(let y=0;y<H;y++) for(let x=0;x<W;x++){ const w=y+3*Math.sin(x*.07+y*.2)+2*Math.sin(x*.19), band=((Math.floor(w/12)%4)+4)%4, n=hash(x,y)&15; B.set(x,y,[ '#2e1a0c','#3a2210','#452812','#342010'][band]); if(n===0) B.set(x,y,'#5c3818'); }
  for(let i=0;i<40;i++){ const x=(r()*W)|0, y=(r()*H)|0, w=2+(r()*4|0), h=1+(r()*2|0); B.rect(x,y,w,h,'#6e5a4c'); B.rect(x,y,w,1,'#9a8a78'); B.rect(x,y+h,w,1,'#1c0f07'); }
  for(let i=0;i<10;i++){ let x=r()*W, y=r()*H; for(let s=0;s<14;s++){ x+=(r()-.5)*3; y+=1; B.set(x|0,(y|0)%H,'#1c0f07'); } }
  return B.canvas(); })();
function cvHero(x,y,clipY){ const img=P_SPRITES[0][0]; if(clipY===undefined){ ctx.drawImage(img,Math.round(x),Math.round(y)); return; }
  ctx.save(); ctx.beginPath(); ctx.rect(-4,-4,VW+8,Math.round(clipY)+4); ctx.clip(); ctx.drawImage(img,Math.round(x),Math.round(y)); ctx.restore(); }
BOSS_OUTRO.topo={ dur:228, swap:112, dest:CV_DEST,
  start(P){ P.st.px=player.x; P.st.py=player.y; P.st.off=0; P.st.sc=1; },
  tick(t,P){ const S=P.st, D=CV_DEST;
    if(t===2) CV_SFX.creak();
    if(t===40){ player.x=-200; CV_SFX.sink(); } // desde aquí Sprout lo dibuja la salida (se hunde)
    if(t>=40&&t<66&&(t&1)===0) parts.push({x:S.px+8+(Math.random()-.5)*12,y:S.py+15,vx:(Math.random()-.5)*.8,vy:-.8,life:12,col:(t&2)?'#f8a030':'#6e4a2a'});
    if(t===70) CV_SFX.whoosh(); if(t===96) CV_SFX.whoosh();
    if(t>=112) player.x=-200; // ya en la boca de la cueva: la salida lo dibuja hasta el final (encima del corro de flores)
    if(t>=150&&t<174){ if((t&3)===0){ shake=Math.max(shake,1); parts.push({x:D.x+8+(Math.random()-.5)*10,y:D.y+15,vx:(Math.random()-.5)*.6,vy:-.9,life:10,col:(t&4)?'#e8f0f8':'#8a6a48'}); } if(t===150) CV_SFX.rumble(); }
    if(t===174){ CV_SFX.boom(); shake=Math.max(shake,6); for(let i=0;i<14;i++){ const a=-Math.PI*(i/13), s=1+Math.random()*2; parts.push({x:D.x+8,y:D.y+14,vx:Math.cos(a)*s,vy:Math.sin(a)*s-.8,life:24,col:i%3===0?'#ffffff':i&1?'#8a6a48':'#f8c048'}); } }
    if(t===180) CV_SFX.spring();
    if(t>=176&&t<200&&(t%3)===0){ const a=Math.random()*6.283, r=6+Math.random()*18; parts.push({k:'petal',x:D.x+8+Math.cos(a)*r,y:D.y+12+Math.sin(a)*r*.5,vx:Math.cos(a)*.3,vy:-.4,life:30,max:30,sway:Math.random()*6,col:['#f8a8c8','#f8e060','#ffffff'][t%3],nog:true}); }
    if(t===196){ CV_SFX.thud(1); for(let i=0;i<8;i++){ const a=i/8*6.283; parts.push({k:'dust',x:D.x+8+Math.cos(a)*8,y:D.y+15+Math.sin(a)*3,vx:Math.cos(a)*.8,vy:-.1,life:14,max:14,r:1+(i&1),col:'#e8f0f8',nog:true}); } } },
  draw(t,P){ const S=P.st, D=CV_DEST;
    if(t<112){ // en la sala del Topo: raíces de brasa que cruzan el suelo, te abrazan y te hunden
      const k=presentEase.out(presentSeg(t,4,40)), px=S.px+8, py=S.py+14;
      glowAt(px,py-6,10+k*18+Math.sin(t*.3)*2,'rgba(255,170,60,'+(.18+k*.25).toFixed(2)+')');
      const ends=[[0,20],[160,28],[0,110],[160,100],[70,0],[100,128]];
      ends.forEach(([ex,ey],j)=>{ const n=36; for(let i=0;i<Math.floor(n*k);i++){ const u=i/n, x=ex+(px-ex)*u+Math.sin(u*9+j)*4, y=ey+(py-ey)*u+Math.cos(u*7+j)*3; cvPx(x,y,2,1,'#2a1608'); const pulse=((t*.06+j*.3-u)%1+1)%1<.08; cvPx(x,y-1,1,1,pulse?'#fff0a0':'#b0602a'); } });
      if(t<40) cvHero(S.px,S.py);
      else if(t<70){ const u=presentEase.in(presentSeg(t,42,68)), gy=S.py+16; cvHole(px,gy,8,3); cvHero(S.px,S.py+u*18,gy);
        for(let i=0;i<3;i++){ const a=t*.3+i*2.1; cvPx(px+Math.cos(a)*7,gy-4-i*3+u*6,2,1,'#2a1608'); cvPx(px+Math.cos(a)*7,gy-5-i*3+u*6,2,1,'#f8a030'); } } // raíces que se enroscan
      else cvHole(px,S.py+16,8*(1-presentSeg(t,70,80)),3);
      presentBars(presentEase.out(presentSeg(t,0,10)),10); }
    else if(t>=150){ // en la boca de la cueva: la nieve se abre en un corro de primavera y Sprout brota
      const px=D.x+8, gy=D.y+15, g=presentEase.out(presentSeg(t,174,196))*(1-presentSeg(t,206,228));
      if(g>0){ const R=26*g; for(let y=-R;y<=R;y++){ const w=Math.round(R*Math.sqrt(Math.max(0,1-(y*y)/(R*R)))); for(let x=-w;x<=w;x++){ const e=Math.hypot(x,y*2)/(R*2); if(e>1) continue; if(e>.8&&((x+y)&1)) continue; cvPx(px+x,gy+y*.5,1,1,((x*7+y*3)&7)?'#5aa848':'#8ad060'); } }
        for(let i=0;i<14;i++){ const a=i/14*6.283+.3, rr=R*(.35+.5*((i*7)%5)/5), bx=px+Math.cos(a)*rr, by=gy+Math.sin(a)*rr*.5; if(t<176+i*1.5) continue; const c=['#f8a8c8','#f8e060','#ffffff','#f89048'][i&3]; cvPx(bx,by-1,1,1,c); cvPx(bx-1,by,3,1,c); cvPx(bx,by+1,1,1,c); cvPx(bx,by,1,1,'#fff8c0'); } }
      if(t<174){ const u=presentSeg(t,150,174); cvDrawCracks(px,gy,cvCracks(211,6,7),u,true); ctx.drawImage(MOUND_ART,px-12,gy-9+(t&2?0:1)); if(u>.5){ cvPx(px-2,gy-10-u*3,2,3,'#46a63c'); cvPx(px+1,gy-11-u*3,2,3,'#7ed64e'); } } // asoman las hojas
      else if(t<196){ const u=presentSeg(t,174,196), jy=-Math.sin(u*Math.PI)*24; cvHole(px,gy,7*(1-u*.6),2); drawShadow(px,gy,Math.max(2,6-(-jy)/5)); cvHero(D.x,D.y+jy); }
      else { const u=t-196, sq=u<10?.3*Math.exp(-u/3):0; drawShadow(px,gy,6); ctx.save(); ctx.translate(px,D.y+16); ctx.scale(1+sq*.5,1-sq); ctx.drawImage(u<14?H_LIFT:P_SPRITES[0][0],-8,-16); ctx.restore(); if(u<14){ ctx.drawImage(EMBER_SPR,px-8,D.y-14-(u>>2&1)); } } }
    if(t>=66&&t<156){ // bajo tierra, a toda prisa hacia la superficie
      const ir=t<74?90*(1-presentEase.in(presentSeg(t,66,74))):t>=146?120*presentEase.in(presentSeg(t,146,156)):-1, ic=t<74?[S.px+8,S.py+10]:[CV_DEST.x+8,CV_DEST.y+10];
      if(t>=72&&t<150){ const sc=Math.round((t*5)%96); ctx.drawImage(CV_SOIL,0,sc-96); ctx.drawImage(CV_SOIL,0,sc); ctx.drawImage(CV_SOIL,0,sc+96);
        ctx.fillStyle='#0a0503'; for(let i=0;i<4;i++){ ctx.globalAlpha=.2; ctx.fillRect(0,0,34-i*9,144); ctx.fillRect(126+i*9,0,34-i*9,144); } ctx.globalAlpha=1; // penumbra a los lados
        for(let i=0;i<9;i++){ const x=(hash(i,9)%150)+5, y=((t*9+hash(i,3))%180)-30; ctx.globalAlpha=.4; cvPx(x,y,1,14+(i%3)*6,'#c8a070'); ctx.globalAlpha=1; } // líneas de velocidad
        const cx=80, cy=64+Math.round(Math.sin(t*.2)*2);
        for(let j=0;j<3;j++) for(let y=cy+6;y<150;y+=1){ const x=cx+(j-1)*5+Math.round(Math.sin(y*.08+t*.35+j*2)*(3+(y-cy)*.06)); cvPx(x,y,2,1,'#2a1608'); cvPx(x,y,1,1,((y+t*4+j*9)%26)<3?'#fff0a0':'#d07830'); }
        glowAt(cx,cy,26,'rgba(255,170,60,.35)'); ctx.drawImage(H_LIFT,cx-8,cy-8); ctx.drawImage(EMBER_SPR,cx-8,cy-22+((t>>2)&1));
        for(let i=0;i<5;i++){ const u=((t*.08+i/5)%1); cvPx(cx-4+hash(i,t>>2)%9,cy+8+u*50,1,1,u<.5?'#fff0a0':'#f8a030'); } }
      if(ir>=0) cvIris(Math.round(ic[0]),Math.round(ic[1]),ir); } },
  end(P){ player.x=CV_DEST.x; player.y=CV_DEST.y; player.dir=0; player.frame=0; } };
