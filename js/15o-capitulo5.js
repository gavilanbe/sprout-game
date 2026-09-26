'use strict';
/* ============================================================
   CAPÍTULO 5: EL OLVIDO (docs/TERCERA-PASADA.md §7; fase B: el esqueleto, con su final)
   · LA LLEGADA (c5arrive): al pisar la plaza tras la cima, una sombra enorme cruza el cielo, la polilla baja
     del norte, se posa en la copa y envuelve al Roble en seda. El gris sale del tronco y se extiende por la
     plaza (el mismo círculo que traían las estaciones, al revés) y las raíces de los altares se apagan una a
     una. Raíz abre la boca y no le sale nada.
   · EL VALLE SE OLVIDA: el valle, las laderas, la marisma y las casas se pintan en el gris lila del Olvido
     (se gradúa el fondo al pintarlo: c5GradeBg, desde 08); los vecinos, apagados, olvidan cosas... pero se
     les escapa cómo llaman a Sprout: eso es lo último que se va. Raíz, mudo. Solo Sprout conserva el color.
   · EL COPO A SU ALTAR (c5copo): las cuatro reliquias laten juntas bajo la seda; el hueco del tronco se abre
     como una boca... y no le sale nada. Raíz mueve los labios: «d▒▒rm▒». Petra recuerda una frase del libro
     de la maceta: «Un brote no despierta hasta que el valle lo llama».
   · EL SUEÑO EN LA MACETA (c5dream): el motor del sueño (15c). Los anillos del Roble son los años del valle
     y la polilla se los come de fuera hacia dentro. El Roble habla: «Un nombre no es de quien lo lleva. Es de
     quien lo llama».
   · EL NOMBRE (c5fin): el final provisional, que será el nivel 4 del jefe (§7.4). La polilla despierta, se
     come el nombre de Sprout letra a letra y con él su color, el HUD y los pies. A oscuras, el valle lo
     llama voz a voz, cada una desde donde vive, y cada voz devuelve algo; los cuatro guardianes llenan el
     anillo de las estaciones. Se mantiene Z y el año gira de un golpe: cuatro olas, cuatro estaciones, y la
     polilla encoge con cada una hasta ser una polillita que se posa en la hoja de Sprout... ¡ACHÍS! Luego
     todo el valle dice CIERZO y el Viento baja a la plaza.
   Guardado: c5 = {arrive, copo, hint, sueno}. olvidoLoose(): el capítulo 5 (la cima hecha, el año sin girar).
   ============================================================ */
let c5={arrive:false,copo:false,hint:false,sueno:false};
let c5Arr=null, c5Cp=null, c5D=null, c5Fin=null, c5Post=null, c5PostPending=false, c5Greet={}, c5OakForce=null, c5SilkT=-1;
function c5Save(){ return Object.assign({},c5); }
function c5Load(d){ d=d||{}; c5={arrive:!!d.arrive,copo:!!d.copo,hint:!!d.hint,sueno:!!d.sueno};
  c5Arr=c5Cp=c5D=c5Fin=c5Post=null; c5PostPending=false; c5Greet={}; c5OakForce=null; c5SilkT=-1; }
function olvidoLoose(){ return boss3Done&&!cycled; }
PORTRAITS['CIERZO']=windPortrait('happy'); SPEAKER['CIERZO']=Object.assign({},SPEAKER['EL VIENTO']); // con su nombre, otra cara

/* ============================================================
   EL VALLE SE OLVIDA: el gris lila del Olvido, graduado al pintar cada fondo
   ============================================================ */
const C5_GREY={valle:.84,norte:.74,marisma:.74,casa:.56};
function c5GreyAmt(nx,ny){ if(!olvidoLoose()) return 0; if(nx===1&&ny===1&&!c5.arrive) return 0; return C5_GREY[regionOf(nx,ny)]||0; }
function c5Grade(g,w,h,a){ if(!(a>0)) return; let d; try{ d=g.getImageData(0,0,w,h); }catch(e){ return; } const p=d.data;
  for(let i=0;i<p.length;i+=4){ if(p[i+3]===0) continue; const r=p[i], gg=p[i+1], b=p[i+2], l=r*.3+gg*.59+b*.11;
    p[i]=r+(l*.9+16-r)*a; p[i+1]=gg+(l*.86+12-gg)*a; p[i+2]=b+(l*.95+26-b)*a; } // gris con un punto lila: el polvo de la polilla
  g.putImageData(d,0,0); }
function c5GradeBg(g,fg,nx,ny){ const a=c5GreyAmt(nx,ny); if(a<=0) return; c5Grade(g,160,128,a); if(fg) c5Grade(fg,160,128,a); }
const C5_GREYSPR=new Map();
function c5GreyOf(img,a){ const q=Math.max(1,Math.min(10,Math.round(a*10))); let m=C5_GREYSPR.get(img); if(!m){ m=[]; C5_GREYSPR.set(img,m); } if(m[q]) return m[q];
  const c=mkCanvas(img.width,img.height), g=c.getContext('2d'); g.drawImage(img,0,0); c5Grade(g,img.width,img.height,q/10); return m[q]=c; }
/* los vecinos y Raíz, apagados (en la plaza, cuando les llega el gris); en el final, cada uno recupera su color al llamar */
function c5NpcImg(img,who,x,y){ if(!olvidoLoose()) return img; if(c5Fin&&c5Fin.back.has(who)) return img;
  if(sx===1&&sy===1){ if(c5Arr){ if(!c5Arr.done||Math.hypot(x+8-80,y+8-64)>c5ArrGreyR()) return img; } else if(!c5.arrive) return img; }
  return c5GreyOf(img,.72); }
/* y en las cajas de diálogo, sus caras (los guardianes y Cierzo se acuerdan de todo: esos no) */
function c5Portrait(who,img){ if(!img||!olvidoLoose()||!c5.arrive||!C5_NPC_OF[who]) return img; if(c5Fin&&c5Fin.back.has(C5_NPC_OF[who])) return img; return c5GreyOf(img,.72); }
/* la música del valle también se olvida: la nana con notas comidas (15n) */
{ const S0=setTrack; setTrack=function(n){ if(olvidoLoose()&&c5.arrive&&(n==='valle'||n==='nieve'||n==='pantano'||n==='casa')&&typeof TRACKS!=='undefined'&&TRACKS.olvido) n='olvido'; return S0(n); }; }
/* más polillitas donde el valle está gris (y menos en la plaza: allí está la grande) */
{ const A0=olvAmbientTarget; olvAmbientTarget=function(){ if(olvidoLoose()&&c5.arrive){ const r=regionOf(sx,sy); if(r==='valle'||r==='norte'||r==='marisma') return (sx===1&&sy===1)?2:3; } return A0(); }; }

/* ============================================================
   EL ROBLE, EN SEDA: la copa gris lila, una gasa por encima y los hilos que lo abrazan
   ============================================================ */
ROBLE_ART.silk=(()=>{ const leaf={}, bark={};
  OAK_LEAF.forEach((c,i)=>leaf[c]=['#29262f','#3b3645','#524b5e','#6b6478','#877f93','#a79fb2'][i]);
  OAK_BARK.forEach((c,i)=>bark[c]=['#221e27','#342e39','#48414d','#5e5763','#777080'][i]);
  return recolor(OAK_GRAND,Object.assign(leaf,bark)); })();
const SILK=(()=>{ const src=ROBLE_ART.base, W=src.width, H=src.height, g0=mkCanvas(W,H).getContext('2d'); g0.drawImage(src,0,0);
  const A=g0.getImageData(0,0,W,H).data, M=new Uint8Array(W*H); for(let i=0;i<W*H;i++) M[i]=A[i*4+3]>40?1:0;
  const at=(x,y)=>x>=0&&y>=0&&x<W&&y<H&&M[y*W+x]===1, near=(x,y)=>at(x,y)||at(x-1,y)||at(x+1,y)||at(x,y-1)||at(x,y+1), R=wRng(90210), groups=[];
  const mk=y=>{ const c=mkCanvas(W,H); c.y=y; groups.push(c); return c.getContext('2d'); }, px=(g,x,y,c)=>{ g.fillStyle=c; g.fillRect(x,y,1,1); };
  let x0=W, x1=0, top=H; for(let y=0;y<52;y++) for(let x=0;x<W;x++) if(at(x,y)){ x0=Math.min(x0,x); x1=Math.max(x1,x); top=Math.min(top,y); }
  const cx=(x0+x1)/2, cy=top+24, rx=(x1-x0)/2;
  { const g=mk(26); for(let y=0;y<H;y++) for(let x=0;x<W;x++){ if(!near(x,y)) continue; // el velo: una sábana de seda pálida que lo tapa todo, más espesa arriba
      if(!at(x,y)){ px(g,x,y,(x+y)&1?'rgba(236,232,246,.7)':'rgba(206,200,222,.5)'); continue; } // el borde, deshilachado por fuera
      const sheen=((x*2+y*3)%23)<3?.12:0, a=(y<52?.3+.16*(1-y/52):.24)+(((x+y)&1)?.08:0)+sheen; px(g,x,y,'rgba(232,226,244,'+a.toFixed(2)+')'); } }
  for(let i=0;i<8;i++){ const g=mk(cy-16+i*4.6), ry=4+R()*6, rr=rx*(.72+R()*.34), c0=cy-17+i*4.8+(R()-.5)*2, rot=(R()-.5)*.5; // vendas que dan la vuelta a la copa (se ve la cara de delante)
    for(let s2=0;s2<=240;s2++){ const a=s2/240*Math.PI, ex=Math.cos(a)*rr, ey=Math.sin(a)*ry, x=Math.round(cx+ex*Math.cos(rot)-ey*Math.sin(rot)), y=Math.round(c0+ex*Math.sin(rot)+ey*Math.cos(rot));
      if(!near(x,y)||y>54) continue; px(g,x,y,((x+i)%9)===0?'#ffffff':'rgba(246,242,252,.9)'); if(near(x,y+1)) px(g,x,y+1,'rgba(120,110,140,.45)'); } }
  for(let i=0;i<3;i++){ const g=mk(58+i*7), yy=58+i*7; // y el tronco, vendado
    for(let x=0;x<W;x++){ const y=Math.round(yy+(x-cx)*.22*(i&1?1:-1)+Math.sin(x*.4)*.6); if(!at(x,y)||y<52) continue; px(g,x,y,'rgba(246,242,252,.85)'); if(at(x,y+1)) px(g,x,y+1,'rgba(120,110,140,.4)'); } }
  { const g=mk(50); for(let k=0;k<7;k++){ const x=Math.round(x0+8+k*(x1-x0-16)/6+(R()-.5)*4); let y=0; for(let yy=52;yy>0;yy--) if(at(x,yy)){ y=yy; break; } // hilos que cuelgan, con una mota al final
      const L=5+((R()*9)|0); for(let j=1;j<=L;j++) px(g,x,y+j,'rgba(226,220,240,'+(.7-j/L*.35).toFixed(2)+')'); px(g,x,y+L+1,'#d8d0e8'); } }
  return {W,H,groups}; })();
/* k: cuánta seda (0-1, hilo a hilo, cada uno de izquierda a derecha); con el mismo vaivén que la copa */
function c5DrawSilk(k,alpha){ const G=SILK.groups, n=G.length, ph=tick*.03, A0=alpha===undefined?1:alpha;
  for(let i=0;i<n;i++){ const u=clamp(k*n-i,0,1); if(u<=0) break;
    if(i===0){ ctx.globalAlpha=A0*u; roblePaint(G[0],ROBLE_X,ROBLE_Y,ROBLE.amp,ph); ctx.globalAlpha=1; continue; } // el velo cae poco a poco
    ctx.globalAlpha=A0; if(u<1){ ctx.save(); ctx.beginPath(); ctx.rect(ROBLE_X,ROBLE_Y,Math.round(u*SILK.W),SILK.H); ctx.clip(); }
    roblePaint(G[i],ROBLE_X,ROBLE_Y,ROBLE.amp,ph); if(u<1) ctx.restore(); ctx.globalAlpha=1; }
  const fr=k*n, i=Math.floor(fr); if(c5Arr&&k>0&&k<1&&G[i]){ const m=c5MothNow(), tx=ROBLE_X+Math.round((fr-i)*SILK.W), ty=ROBLE_Y+Math.round(G[i].y); // el hilo que sale de la polilla
    ctx.strokeStyle='rgba(236,230,246,.55)'; ctx.lineWidth=1; ctx.beginPath(); ctx.moveTo(m.x+.5,m.y+9.5); ctx.lineTo(tx+.5,ty+.5); ctx.stroke(); ctx.fillStyle='#ffffff'; ctx.fillRect(tx,ty,1,1); } }
function c5SilkK(){ if(c5Arr) return c5Arr.done?clamp((c5Arr.t-C5A.silk[0])/(C5A.silk[1]-C5A.silk[0]),0,1):0;
  if(c5Fin&&c5SilkT>=0) return 1; return olvidoLoose()&&c5.arrive?1:0; }

/* ---------- la polilla en la copa: dónde está y cómo tiene las alas ---------- */
const C5_PERCH={x:80,y:16,s:.75};
let c5Startle=-999;
function c5MothNow(){ // lo que haya de ella en la plaza ahora: {x,y,s,k,a} (o null)
  const u=tick-c5Startle, st=u>=0&&u<50?Math.sin(u/50*Math.PI):0, rest=.84+.05*Math.sin(tick*.04); // en reposo, las alas planas y abiertas, como las polillas en la corteza
  if(c5Arr){ const t=c5Arr.t; if(t<C5A.fall) return null;
    if(t<C5A.land){ const k=CA_EASE.out((t-C5A.fall)/(C5A.land-C5A.fall)); return {x:80+Math.round(Math.sin(t*.07)*6*(1-k)),y:Math.round(lerp(-40,C5_PERCH.y,k)),s:C5_PERCH.s,k:.55+.45*Math.cos(t*.5),a:1}; }
    const f=clamp((t-C5A.fold[0])/(C5A.fold[1]-C5A.fold[0]),0,1), flap=.7+.3*Math.cos(t*(.3-f*.22)); return {x:80,y:C5_PERCH.y,s:C5_PERCH.s,k:lerp(flap,rest,CA_EASE.io(f)),a:1}; }
  if(c5Fin) return c5FinMoth(c5Fin);
  if(!olvidoLoose()||!c5.arrive) return null;
  return {x:80,y:C5_PERCH.y,s:C5_PERCH.s,k:lerp(rest,1,st),a:1}; }
function c5DrawMoth(sky){ const m=c5MothNow(); if(!m||m.hide||(!!m.sky)!==!!sky) return;
  if(m.tiny){ const fr=m.fold?2:MOTH_FLAP[(tick>>1)&3]; ctx.drawImage(MOTH_B[fr],Math.round(m.x-6),Math.round(m.y-5)); return; }
  if(m.a<1) ctx.globalAlpha=m.a; drawBigMoth(m.x,m.y,m.s,m.k,m.sil?{sil:m.sil}:undefined); ctx.globalAlpha=1;
  if(m.eyes>0) for(const sd of [-1,1]){ const ex=Math.round(m.x+sd*19*m.s*m.k), ey=Math.round(m.y-5*m.s), r=Math.max(1,Math.round(4.2*m.s*Math.min(1,m.eyes))); // los ocelos, pálidos en lo oscuro
    glowAt(ex,ey,r*3,'rgba(216,208,232,'+(.22*m.eyes).toFixed(2)+')'); ctx.fillStyle='#d8d0e8'; for(let yy=-r;yy<=r;yy++){ const w=Math.round(r*Math.sqrt(1-(yy*yy)/(r*r))); ctx.fillRect(ex-w,ey+yy,w*2+1,1); }
    ctx.fillStyle='#07040c'; const r2=Math.max(1,Math.round(r*.55)); for(let yy=-r2;yy<=r2;yy++){ const w=Math.round(r2*Math.sqrt(1-(yy*yy)/(r2*r2))); ctx.fillRect(ex-w,ey+yy,w*2+1,1); } } }

/* ---------- la plaza en el capítulo 5: raíces, Roble, seda, polilla y reliquias ---------- */
{ const P0=drawPlaza; drawPlaza=function(){ if(c5Fin||c5Arr||c5Cp||(olvidoLoose()&&c5.arrive)) c5Plaza(); else P0(); }; }
altarOf('invierno').done=()=>cycled||c5.copo; // el Copo, en su altar desde el capítulo 5
function c5Beat(){ const u=(tick%90)/90; return Math.exp(-Math.pow((u-.08)/.045,2))+.7*Math.exp(-Math.pow((u-.26)/.045,2)); } // pum... pum
function c5RootState(A){ // {len,a,p} o null
  if(c5Arr){ const C=c5Arr, j=C.lit.indexOf(A.si); if(j<0) return null; const u=clamp((C.t-C5A.roots[Math.min(j,2)])/26,0,1); if(u>=1) return null;
    return {len:1-u,a:.55+.25*Math.sin(tick*.05+A.si),p:((tick*.7+A.si*40)%150)/150}; }
  if(c5Cp){ const t=c5Cp.t; if(A.k==='invierno'){ if(t<C5C.land) return null; const k=clamp((t-C5C.land)/(C5C.trunk-C5C.land),0,1); return {len:k,a:.9,p:k<1?k:undefined,tip:k<1}; }
    if(t>=C5C.trunk&&A.done()) return {len:1,a:Math.max(.2,.9-(t-C5C.trunk)/60),p:undefined}; return null; }
  if(c5Fin){ const F=c5Fin; if(F.rootT<0) return F.ph==='turn'||F.ph==='moth'?null:c5.copo&&A.done()?{len:1,a:.1+.22*c5Beat()}:null;
    const k=clamp((F.t-F.rootT-A.si*16)/34,0,1); return k>0?{len:k,a:.6+.25*Math.sin(tick*.05+A.si),p:k<1?k:((tick*.7+A.si*40)%150)/150,tip:k<1}:null; }
  if(c5.copo&&A.done()) return {len:1,a:.1+.22*c5Beat()}; // las cuatro, a la vez, bajo la seda
  return null; }
function c5Relic(A){ const x=A.tx*16, y=A.ty*16, bob=Math.round(Math.sin(tick*.06+A.si*1.7)*1.2);
  let g=.12; if(c5Arr){ const j=c5Arr.lit.indexOf(A.si); g=j>=0&&c5Arr.t<C5A.roots[Math.min(j,2)]?.32:.1; }
  else if(c5Fin&&c5Fin.rootT>=0) g=.32; else if(c5.copo) g=.1+.3*c5Beat();
  glowAt(x+8,y-2,10+g*8,'rgba('+A.rgb+','+g.toFixed(2)+')'); ctx.drawImage(A.spr(),x,y-10+bob); }
function c5Plaza(){ ctx.drawImage(ROBLE_ROOTS,0,0);
  for(const A of ROBLE_ALTARS){ const S=c5RootState(A); if(!S) continue; rootLight(A,S.len,S.a,S.p);
    if(S.tip){ const [x,y]=rootAt(rootPath(A),1-S.len); glowAt(x,y,7,'rgba('+A.rgb+',.6)'); } }
  drawRoble(ROBLE_X,ROBLE_Y);
  const sk=c5SilkK(); if(sk>0){ const fall=c5SilkT>=0?clamp(1-(tick-c5SilkT)/70,0,1):1; if(fall>0) c5DrawSilk(sk,fall); }
  c5DrawMoth();
  for(const A of ROBLE_ALTARS) if(A.done()||(c5Cp&&A.k==='invierno'&&c5Cp.t>=C5C.land)) c5Relic(A);
  if(c5Cp) c5CopoTrunk(); }
/* el Roble, quieto bajo la seda: no se mece, no suelta hojas; de la polilla cae polvo */
{ const L0=robleLook; robleLook=function(){ if(c5OakForce) return c5OakForce; return olvidoLoose()&&c5.arrive?'silk':L0(); }; }
{ const T0=robleTick; robleTick=function(){ if(c5Fin&&c5Fin.snow&&(tick%3)===0) parts.push({k:'flake',x:Math.random()*164-2,y:-4,vx:(Math.random()-.5)*.25,vy:.35+Math.random()*.3,life:150,max:150,r:(tick&4)?1:0,col:'#ffffff',nog:true}); // la nieve de Cierzo
  if(robleLook()!=='silk'){ T0(); return; } c5RobleTick(); }; }
function c5RobleTick(){ const talk=state==='dialog'&&dlg&&dlg.who==='RAÍZ';
  ROBLE.rustle*=.9; ROBLE.glow=talk?Math.min(.45,ROBLE.glow+.04):Math.max(0,ROBLE.glow-.04); // quiere hablar: el hueco se enciende a medias
  ROBLE.amp+=(ROBLE.shake-ROBLE.amp)*.15; ROBLE.shake*=.9;
  const m=c5MothNow(); if(m&&!m.tiny&&(tick%7)===0) parts.push({k:'mote',x:m.x-16+Math.random()*32,y:m.y+4+Math.random()*10,vx:(Math.random()-.5)*.2,vy:.2+Math.random()*.12,life:110,max:110,sway:Math.random()*6,col:(tick&8)?OLV.dust:OLV.dustD,nog:true});
  if(c5.copo&&!c5Fin){ const u=tick%90; if(u===7||u===23) for(const A of ROBLE_ALTARS) parts.push({x:A.tx*16+6+Math.random()*4,y:A.ty*16-4,vx:0,vy:-.3,life:12,col:A.col,nog:true}); } }

/* ============================================================
   LA LLEGADA: la polilla se posa en el Roble
   ============================================================ */
const C5A={bars:16,shadow:14,fall:78,land:128,silk:[136,252],grey:110,roots:[262,290,318],fold:[336,376],bang:364,end:404};
function c5ArrGreyR(){ const A=c5Arr; if(!A||!A.done) return 0; return CA_EASE.in(clamp((A.t-A.tC)/C5A.grey,0,1))*200; }
function c5StartArrive(){ if(bgDirty||!bgCanvas[0]) rebuildBg(); bgEnsureAll();
  c5Arr={t:0,from:robleLook(),lit:ROBLE_ALTARS.filter(A=>A.done()).map(A=>A.si),old:bgCanvas.map(c=>{ const k=mkCanvas(160,128); if(c) k.getContext('2d').drawImage(c,0,0); return k; }),done:false};
  state='c5arrive'; player.dir=1; player.atk=player.spin=player.charge=0; player.frame=0; player.anim=0; toast=null; placeBanner=null; setTrack('silencio'); }
function c5ArriveCommit(){ const A=c5Arr; if(!A||A.done) return; A.done=true; A.tC=A.t; c5.arrive=true;
  for(const k in THUMBS) delete THUMBS[k]; markDirty(); ROBLE.wave={from:A.from,to:'silk',k:0,col:OLV.dust}; }
function updC5Arrive(){ const A=c5Arr; if(!A){ state='play'; return; } A.t++; const t=A.t, Rn=Math.random; updParts(); robleTick();
  if(keys.fire&&t>20&&t<C5A.end-14){ keys.fire=false; c5ArriveCommit(); A.t=C5A.end-14; A.tC=A.t-C5A.grey; if(ROBLE.wave) ROBLE.wave.k=1; return; } // Z: al grano
  if(t===4&&AC) noise(1.4,.02,false,undefined,420);
  if(t===C5A.shadow&&AC){ swish(1.6,.05,240,700,300); noise(1.2,.03,false,undefined,300); }
  if(t>C5A.shadow&&t<C5A.fall&&(t%3)===0) parts.push({k:'leafF',x:Rn()*160,y:Rn()*60,vx:-1.4-Rn(),vy:.5+Rn()*.4,life:60,max:60,sway:Rn()*6,col:['#e8a040','#c86830','#fcd878'][(Rn()*3)|0],nog:true}); // el aire que mueve
  if(t>=C5A.fall&&t<C5A.land&&(t%6)===0) OLV_SFX.flutter(1.6);
  if(t===C5A.land){ c5ArriveCommit(); shake=Math.max(shake,5); ROBLE.shake=3.5; setTrack('olvido');
    if(AC){ const a=AC.currentTime; beep('triangle',f(33),f(26),.5,.1,a); noise(.4,.06,false,a,220); OLV_SFX.flutter(2); }
    for(let i=0;i<22;i++){ const a=Rn()*6.283, s=.6+Rn()*1.6; parts.push({k:'leafF',x:80+Math.cos(a)*20,y:24+Math.sin(a)*12,vx:Math.cos(a)*s,vy:Math.sin(a)*s*.5+.3,life:90,max:90,sway:Rn()*6,col:['#e8a040','#c86830','#fcd878'][(Rn()*3)|0],nog:true}); }
    olvDustBurst(80,22,1,14); }
  if(A.done&&ROBLE.wave) ROBLE.wave.k=Math.min(1,ROBLE.wave.k+1/96);
  const n=SILK.groups.length; for(let i=0;i<n;i++) if(t===C5A.silk[0]+Math.round(i*(C5A.silk[1]-C5A.silk[0])/n)&&AC) swish(.16,.02,3200,5200,2600); // cada vuelta de hilo
  C5A.roots.forEach((t0,j)=>{ const si=A.lit[j]; if(si===undefined||t!==t0) return; const R=ROBLE_ALTARS[si]; // una raíz se apaga
    if(AC){ const a=AC.currentTime, m=[72,76,79][j]; beep('triangle',f(m),f(m-5),.5,.03,a); beep('triangle',f(m-12),0,.6,.02,a+.12); }
    olvPoof(R.tx*16+8,R.ty*16-2); });
  if(t===C5A.fold[0]&&AC) noise(.9,.02,false,undefined,500); // la polilla suspira y pliega
  if(t===C5A.bang){ SFX.blip(); }
  if(t>=C5A.end){ c5Arr=null; ROBLE.wave=null; state='play'; save(); say(C5T.raizMute,()=>say(C5T.arrive),'RAÍZ'); } }
function drawC5Arrive(){ const A=c5Arr; if(!A) return; const t=A.t;
  if(t>=C5A.shadow&&t<C5A.fall+6){ const u=(t-C5A.shadow)/(C5A.fall+6-C5A.shadow), x=lerp(220,-70,u), y=lerp(118,10,u); // algo enorme pasa por encima: su sombra
    ctx.globalAlpha=.5*Math.sin(u*Math.PI); drawBigMoth(x,y,2,.75+.25*Math.cos(t*.25),{sil:'#08060e'}); ctx.globalAlpha=1; }
  if(t>=C5A.bang&&t<C5A.end-8&&elderPos){ const k=easeOutBack(clamp((t-C5A.bang)/8,0,1)); ctx.save(); ctx.translate(elderPos[0]*16+8,elderPos[1]*16-4); ctx.scale(k,k); speechBubble(-5,-12,'!','#8a1808'); ctx.restore(); }
  presentBars(Math.min(clamp(t/C5A.bars,0,1),clamp((C5A.end-t)/14,0,1)),12); }
/* detrás de todo: la plaza de color fuera del círculo gris que crece desde el tronco (y, en el final, las cuatro olas) */
{ const B0=riteBgOld; riteBgOld=function(){ B0(); const A=c5Arr; if(A&&A.done&&A.old){ const r=c5ArrGreyR(); if(r<200) c5OutsideCircle(A.old[bgFrame()],80,64,r,OLV.dust); } if(c5Fin) c5FinBgLayers(c5Fin); }; }
function c5OutsideCircle(img,cx,cy,r,edge){ if(!img) return; ctx.save(); ctx.beginPath();
  for(let y=0;y<128;y++){ const dy=y+.5-cy, h=r*r-dy*dy; if(h<=0){ ctx.rect(0,y,160,1); continue; } const w=Math.sqrt(h), a=Math.round(cx-w), b=Math.round(cx+w); if(a>0) ctx.rect(0,y,a,1); if(b<160) ctx.rect(b,y,160-b,1); }
  ctx.clip(); ctx.drawImage(img,0,0); ctx.restore();
  if(edge&&r>0){ ctx.fillStyle=edge; for(let i=0;i<72;i++){ const a=i/72*6.283, x=Math.round(cx+Math.cos(a)*r), y=Math.round(cy+Math.sin(a)*r); if(x>=0&&x<160&&y>=0&&y<128&&((i+(tick>>1))%3)) ctx.fillRect(x,y,1,1); } } }

/* ============================================================
   RAÍZ SIN VOZ, LOS VECINOS QUE OLVIDAN
   ============================================================ */
function c5RaizMute(){ const P=C5T.raizPoint, next=!autumned?P.otono:!c5.copo?P.copo:!c5.sueno?P.sleep:P.fin;
  say(c5.copo&&!c5.sueno?C5T.raizSleep:C5T.raizMute,()=>say(next),'RAÍZ'); }
{ const E0=elderTalk; elderTalk=function(){ if(!olvidoLoose()||!c5.arrive){ E0(); return; } SFX.blip(); c5RaizMute(); }; }
{ const W=(k,fn)=>{ const o=NPC_TALK[k]; NPC_TALK[k]=function(){ return olvidoLoose()?fn():o(); }; };
  W('h',()=>{ if(c5.sueno) return C5T.petraAfter; if(c5.copo){ if(!c5.hint){ c5.hint=true; save(); return C5T.petraHint; } return [C5T.petraHint[2],C5T.petraHint[4]]; } return C5T.petra; });
  W('j',()=>C5T.lupa); W('y',()=>C5T.moss); W('ö',()=>C5T.corteza); }
{ const O0=openShop; openShop=function(kind){ if(olvidoLoose()&&!c5Greet[kind]&&(kind==='tilo'||kind==='corteza')){ c5Greet[kind]=true; SFX.blip(); shopSel=0; shopUD=0; shopKind=kind;
    say(kind==='tilo'?C5T.tilo:C5T.corteza,()=>{ state='shop'; },kind==='tilo'?'TILO':'CORTEZA'); return; } O0(kind); }; }
/* los trueques y la pesca con los vecinos esperan: no se acuerdan de a quién prestaron qué (con los guardianes, sí) */
{ const T0=tradeInteract; tradeInteract=function(tx,ty,ch){ if(olvidoLoose()&&c5.arrive&&'hjygöñ'.includes(ch)) return false; return T0(tx,ty,ch); }; }
/* las reliquias con el Olvido suelto: el Copo tiene su propio rito; las otras vuelven, pero Raíz no puede decir nada */
{ const D0=deliverSeason; deliverSeason=function(k){ if(!olvidoLoose()){ D0(k); return; }
  if(k==='invierno'){ if(c5.copo) say(C5T.copoDone); else if(!(thawed&&summered&&autumned)) say(C5T.copoMissing); else c5StartCopo(); return; }
  startRite(k,()=>{ SFX.fanfare(); save(); c5RaizMute(); }); }; }
/* las misiones del capítulo */
{ const Q0=questList; questList=function(){ const q=Q0(); if(!boss3Done) return q; const i=q.findIndex(x=>x.id==='copo2'); if(i<0) return q;
  q[i].done=c5.copo||cycled; const add=[];
  if(c5.copo) add.push({id:'recuerda',txt:'Busca quien recuerde',done:c5.hint||c5.sueno||cycled});
  if(c5.hint||c5.sueno) add.push({id:'maceta',txt:'Duerme en tu MACETA',done:c5.sueno||cycled});
  if(c5.sueno) add.push({id:'nombre',txt:'La PLAZA: el OLVIDO',done:cycled});
  q.splice(i+1,0,...add); return q; }; }
/* lo que dispara cada cosa (cada fotograma de juego, tras las polillas) */
{ const U0=updOlvido; updOlvido=function(){ U0(); c5Tick(); }; }
function c5Tick(){ if(state!=='play'||!olvidoLoose()||!(sx===1&&sy===1)||presentQ||pendingSay||dlg) return;
  if(!c5.arrive){ c5StartArrive(); return; }
  if(c5.sueno&&!c5Fin) c5StartFin(); }
/* la maceta: con el Copo en su altar, dormir es lo que toca */
function c5Pot(){ if(!olvidoLoose()||!c5.copo||c5.sueno) return false; ask(C5T.pot,null,yes=>{ if(yes) c5StartDream(); else say(C5T.potNo); }); return true; }

/* ============================================================
   EL COPO, A SU ALTAR: las cuatro laten juntas y el Roble no puede hablar
   ============================================================ */
const C5C={bars:14,lift:8,fly:44,land:84,trunk:134,voice:152,fail:212,end:252};
function c5StartCopo(){ c5Cp={t:0,A:altarOf('invierno'),hx:player.x+8,hy:player.y-6}; state='c5copo'; player.dir=1; player.atk=player.spin=player.charge=0; toast=null; placeBanner=null; playerHidden=true; }
function c5CopoCommit(){ if(c5.copo) return; c5.copo=true; save(); }
function updC5Copo(){ const C=c5Cp; if(!C){ state='play'; return; } C.t++; const t=C.t, A=C.A, Rn=Math.random; updParts(); robleTick();
  if(keys.fire&&t>12&&t<C5C.end-12){ keys.fire=false; c5CopoCommit(); C.t=C5C.end-12; return; }
  if(t===C5C.lift) beep('triangle',330,660,.4,.04);
  if(t===C5C.fly) swish(.34,.07,500,1800,900);
  if(t===C5C.land){ SFX.crystal(); SFX.chime(); const x=A.tx*16+8, y=A.ty*16+2; parts.push({x,y,r:6,life:12,col:A.col,ring:true,nog:true});
    for(let i=0;i<12;i++){ const a=i/12*6.283; parts.push({k:'shard',x,y:y-6,vx:Math.cos(a)*1.6,vy:Math.sin(a)*1.6-.4,life:14,max:14,col:i&1?'#ffffff':A.col}); } }
  if(t===C5C.land+6) beep('triangle',140,560,.8,.035);
  if(t>C5C.land&&t<C5C.trunk&&(t%3)===0){ const [x,y]=rootAt(rootPath(A),1-(t-C5C.land)/(C5C.trunk-C5C.land)); parts.push({k:'shard',x,y,vx:(Rn()-.5)*.8,vy:-.4-Rn()*.5,life:12,max:12,col:A.col}); }
  if(t===C5C.trunk){ c5CopoCommit(); ROBLE.shake=3.5; shake=Math.max(shake,3); c5Startle=tick; olvDustBurst(80,20,1,12); OLV_SFX.flutter(1.8);
    if(AC){ const a=AC.currentTime; beep('triangle',92,40,.9,.12,a); beep('triangle',86,44,.5,.1,a+.3); [72,76,79,84].forEach((m,i)=>beep('triangle',f(m),0,.5,.025,a+.05+i*.07)); } }
  if(t>=C5C.voice&&t<C5C.fail&&(t%11)===0&&AC){ const a=AC.currentTime, m=[45,47,43,48,45][((t-C5C.voice)/11|0)%5]; beep('triangle',f(m),f(m-2),.16,.05,a); noise(.1,.018,false,a,420); } // la boca que quiere hablar
  if(t===C5C.fail){ olvDustBurst(80,56,1,16); OLV_SFX.puff(1.2); c5Startle=tick; if(AC) beep('triangle',f(40),f(33),.7,.05); } // y la polilla lo manda callar
  if(t>=C5C.end){ c5Cp=null; state='play'; playerHidden=false; player.dir=1; save(); say(C5T.copo,()=>say(C5T.raizSleep,()=>say(C5T.raizPoint.sleep),'RAÍZ')); } }
function c5CopoTrunk(){ const t=c5Cp.t; if(t<C5C.trunk) return; // el hueco del tronco se abre... y se apaga
  const k=t<C5C.voice?clamp((t-C5C.trunk)/18,0,1):t<C5C.fail?1:clamp(1-(t-C5C.fail)/26,0,1), fl=t>=C5C.voice&&t<C5C.fail?(((t/3)|0)%3===0?.55:1):1, x=ROBLE_X+43, y=ROBLE_Y+62;
  if(k<=0) return; glowAt(x,y,10+k*9,'rgba(255,214,140,'+(.5*k*fl).toFixed(2)+')'); ctx.fillStyle='rgba(255,236,180,'+(.8*k*fl).toFixed(2)+')'; ctx.fillRect(x-1,y-4,2,7); ctx.fillStyle='rgba(255,255,236,'+(.9*k*fl).toFixed(2)+')'; ctx.fillRect(x-1,y-2,1,3); }
function drawC5Copo(){ const C=c5Cp; if(!C) return; const t=C.t, A=C.A, img=A.spr(), [hx,hy]=[C.hx,C.hy], ax=A.tx*16+8, ay=A.ty*16-2;
  const s=t<C5C.fly+4?H_LIFT:P_SPRITES[1][0]; drawShadow(player.x+8,player.y+15,6); ctx.drawImage(s,player.x|0,player.y|0); // Sprout alza el Copo (lo pinta este rito)
  if(t<C5C.fly){ const up=clamp((t-8)/30,0,1), y=hy-10-up*6; glowAt(hx,y,10+Math.sin(t*.3)*2,'rgba('+A.rgb+',.5)'); ctx.drawImage(img,Math.round(hx-8),Math.round(y-8)); if(t>12&&(t&7)===0) caStar(hx+(t&8?6:-6),y-6,2,'#ffffff'); }
  else if(t<C5C.land){ const k=(t-C5C.fly)/(C5C.land-C5C.fly), e=CA_EASE.io(k), x=lerp(hx,ax,e), y=lerp(hy-16,ay-8,e)-Math.sin(Math.PI*k)*30;
    for(let i=1;i<=6;i++){ const k2=Math.max(0,k-i*.035), e2=CA_EASE.io(k2); ctx.fillStyle=i<3?'#ffffff':'rgba('+A.rgb+','+(.8-i*.1).toFixed(2)+')'; ctx.fillRect(Math.round(lerp(hx,ax,e2)),Math.round(lerp(hy-16,ay-8,e2)-Math.sin(Math.PI*k2)*30),i<3?2:1,i<3?2:1); }
    glowAt(x,y,10,'rgba('+A.rgb+',.5)'); ctx.drawImage(img,Math.round(x-8),Math.round(y-8)); }
  if(t>=C5C.land&&t<C5C.land+30){ const k=(t-C5C.land)/30, w=Math.max(1,Math.round(5*(1-k))); ctx.fillStyle='rgba(255,255,255,'+(.9*(1-k)).toFixed(2)+')'; ctx.fillRect(ax-(w>>1),0,w,ay+4); }
  presentBars(Math.min(clamp(t/C5C.bars,0,1),clamp((C5C.end-t)/14,0,1)),12); }

/* ============================================================
   EL SUEÑO EN LA MACETA: los anillos del Roble, comidos por fuera
   ============================================================ */
function c5StartDream(){ const R=wRng(2024);
  c5D={t:0,phase:'in',inDur:70,pages:C5T.dream.slice(),pg:0,chars:0,wait:0,pt:0,fade:0,pulse:0,ring:0,reply:'',roots:makeRoots(4711),pal:'ciclo',eat:100,dust:[],
    motes:[...Array(18)].map(()=>({x:R()*VW,y:R()*VH,v:.12+R()*.25,ph:R()*6,c:R()<.3?1:0}))};
  state='c5dream'; parts=[]; toast=null; setTrack('olvido'); if(AC) WSFX.sink(); }
function updC5Dream(){ const D=c5D; if(!D){ state='play'; return; } D.t++; D.ring+=.07;
  for(const r of D.roots){ const n=rootShown(D,r); if(n>=r.pts.length&&D.phase!=='out'&&--r.next<=0){ r.pulses.push(0); r.next=70+(r.i*13)%40; }
    for(let j=r.pulses.length-1;j>=0;j--){ r.pulses[j]+=1.3; if(r.pulses[j]>=r.pts.length-1){ r.pulses.splice(j,1); D.pulse=1; WSFX.sap(r.i+(D.t>>4)); } } }
  D.pulse=Math.max(0,D.pulse-.03);
  for(const m of D.motes){ m.y-=m.v; if(m.y<-2){ m.y=VH+2; m.x=Math.random()*VW; } }
  D.eat=Math.max(64,D.eat-.016); // se los come, de fuera hacia dentro
  if((D.t%3)===0){ const a=Math.random()*6.283, r=D.eat-1; D.dust.push({x:DREAM_C.x+Math.cos(a)*r,y:DREAM_C.y+Math.sin(a)*r/1.12,vx:-Math.cos(a)*.15,vy:.15+Math.random()*.2,t:0}); }
  for(const q of D.dust){ q.t++; q.x+=q.vx; q.y+=q.vy; } D.dust=D.dust.filter(q=>q.t<70);
  if(D.phase==='in'){ if(keys.fire){ keys.fire=false; D.t=Math.max(D.t,D.inDur); } if(D.t>=D.inDur) D.phase='talk'; return; }
  if(D.phase==='talk'){ dreamType(D); const s=pageText(D), last=D.pg>=D.pages.length-1;
    if(keys.fire){ keys.fire=false;
      if(D.chars<s.length){ D.chars=s.length; D.wait=0; }
      else if(!last){ D.pg++; D.chars=0; D.wait=6; SFX.blip(); if(D.pg===8) setTrack('casa'); } // «un nombre no es de quien lo lleva»: la nana vuelve entera
      else { D.phase='out'; D.pt=0; WSFX.yes(); for(const r of D.roots){ r.pulses.push(0,-8,-16); r.next=999; } } }
    return; }
  if(D.phase==='out'){ D.pt++; if(D.pt===30) WSFX.beam(); if(D.pt>=84) c5EndDream(); } }
function c5EndDream(){ c5D=null; c5.sueno=true; save(); state='play'; fadeIn=56; player.dir=0; parts=[]; setTrack('olvido'); say(C5T.wake); }
let C5_EAT=null;
function c5DreamEaten(D){ dreamInit(); if(!C5_EAT){ const c=mkCanvas(VW,VH); C5_EAT={c,g:c.getContext('2d')}; C5_EAT.img=C5_EAT.g.createImageData(VW,VH); }
  const d=C5_EAT.img.data, t=D.t; d.fill(0);
  for(let i=0,y=0;y<VH;y++) for(let x=0;x<VW;x++,i++){ const a=DR_A[i], r=DR_D[i], e=D.eat+2.2*Math.sin(a*7+t*.01)+1.6*Math.sin(a*13-t*.02)-3*Math.max(0,Math.sin(a*3+1.3)); // el borde, a mordiscos
    if(r<e) continue; const j=i*4, rim=r<e+1.4;
    if(rim){ d[j]=150; d[j+1]=140; d[j+2]=168; d[j+3]=255; } else { const o=((x+y)&1)?0:6; d[j]=40+o; d[j+1]=34+o; d[j+2]=50+o; d[j+3]=240; } }
  C5_EAT.g.putImageData(C5_EAT.img,0,0); ctx.drawImage(C5_EAT.c,0,0);
  for(const q of D.dust){ ctx.globalAlpha=Math.min(1,(70-q.t)/30)*.8; ctx.fillStyle=(q.t&8)?OLV.dust:OLV.dustD; ctx.fillRect(Math.round(q.x),Math.round(q.y),1,1); } ctx.globalAlpha=1;
  const ang=-.72+Math.sin(t*.004)*.3, mr=D.eat+6, mx=DREAM_C.x+Math.cos(ang)*mr, my=DREAM_C.y+Math.sin(ang)*mr/1.12; // y ella, royendo en la esquina
  drawBigMoth(mx,my,.9,.72+.12*Math.sin(t*.06),{sil:'#1a1422'}); }
function drawC5Dream(){ const D=c5D; if(!D){ ctx.fillStyle='#07050a'; ctx.fillRect(-4,-4,VW+8,VH+8); return; }
  drawDreamBg(D); c5DreamEaten(D);
  for(const m of D.motes){ const x=Math.round(m.x+Math.sin(D.t*.03+m.ph)*3); ctx.fillStyle=m.c?'#ffd878':'#c8d8c0'; ctx.globalAlpha=.35+.25*Math.sin(D.t*.07+m.ph); ctx.fillRect(x,m.y|0,1,1); } ctx.globalAlpha=1;
  drawDreamRoots(D); drawDreamSeed(D);
  if(D.phase==='in'){ const k=clamp(D.t/D.inDur,0,1), r=26+eIn(k)*180; circleRows(DREAM_C.x,DREAM_C.y,r,'#07050a',4,false);
    ctx.fillStyle='#ffe6a0'; ctx.globalAlpha=1-k; for(let i=0;i<96;i++){ const a=i/96*6.283+D.t*.02; ctx.fillRect(Math.round(DREAM_C.x+Math.cos(a)*r),Math.round(DREAM_C.y+Math.sin(a)*r/1.12),1,1); } ctx.globalAlpha=1; }
  drawDreamText(D);
  if(D.phase==='out'&&D.pt>=34){ const k=clamp((D.pt-34)/40,0,1); circleRows(DREAM_C.x,DREAM_C.y-8,eIn(k)*190,'#fff6dc',4,true); } }

/* ============================================================
   EL NOMBRE: el final
   ============================================================ */
const FN={bars:16,walk:60,wake:70,lift:104,hover:150,card:160,cardEnd:246,plate:250,dive:274,bites:298,bite:9,grey:360,sky:384,lost:440};
const C5_FROM={PETRA:[-10,72],LUPA:[120,96],MOSS:[170,52],TILO:[-10,36],CORTEZA:[-10,112],'EL TOPO REAL':null,'LA REINA':[170,14],'EL CIERVO':[170,108],CIERZO:[80,-12],'RAÍZ':[80,56]};
const C5_NPC_OF={PETRA:'h',LUPA:'j',MOSS:'y',TILO:'g',CORTEZA:'ö','RAÍZ':'E'};
const C5_WALKERS=[{ch:'h',from:[-16,80],tx:2,ty:5},{ch:'y',from:[176,92],tx:8,ty:5},{ch:'g',from:[-16,112],tx:1,ty:7},{ch:'ö',from:[176,120],tx:8,ty:7}];
const SEASON_COL=['#f8a0d0','#f8d030','#e8803a','#dff0ff'], SEASON_RGB=['248,160,208','248,208,48','232,128,58','223,240,255'];
function c5StartFin(){ c5Fin={t:0,ph:'rise',pt:0,back:new Set(),plate:[0,0,0,0,0,0],plateT:-1,sGrey:0,grey:0,dark:0,hud:{hearts:0,z:0,x:0,rest:0},hudFlash:{},
    can:{move:false,blade:false},vi:-1,nextT:0,spark:null,call:null,q:[0,0,0,0],qLit:[0,0,0,0],charge:0,dust:[],dustT:90,stun:0,wob:0,atk:0,lostT:0,tried:0,
    from:[player.x,player.y],moth:null,stage:0,biteT:-99,flinch:0,waves:[],rootT:-1,walkers:null,snow:false,cierzo:null,white:0};
  state='c5fin'; playerHidden=true; player.atk=player.spin=player.charge=0; toast=null; placeBanner=null; setTrack('silencio'); }
/* dónde está la polilla en cada momento del final */
function c5FinMoth(F){ const t=F.t, rest=.84+.05*Math.sin(tick*.04);
  if(F.ph==='rise'||F.ph==='eat'){
    if(t<FN.wake) return {x:80,y:C5_PERCH.y,s:C5_PERCH.s,k:rest,a:1};
    if(t<FN.lift) return {x:80,y:C5_PERCH.y,s:C5_PERCH.s,k:.6+.4*CA_EASE.out(clamp((t-FN.wake)/12,0,1))+.04*Math.sin(t*.9),a:1};
    const flap=.62+.38*Math.cos(t*.42);
    if(t<FN.hover){ const k=CA_EASE.io((t-FN.lift)/(FN.hover-FN.lift)); return {x:80+Math.sin(k*Math.PI)*26,y:lerp(C5_PERCH.y,34,k)-Math.sin(k*Math.PI)*10,s:C5_PERCH.s,k:flap,a:1}; }
    const hx=80+Math.sin(t*.03)*10, hy=34+Math.sin(t*.05)*3, px=player.x+8, py=player.y-30;
    if(t<FN.dive) return {x:hx,y:hy,s:C5_PERCH.s,k:flap,a:1};
    if(t<FN.grey){ const k=CA_EASE.out(clamp((t-FN.dive)/22,0,1)), bite=F.biteT>=0&&tick-F.biteT<5?3:0; return {x:lerp(hx,px,k),y:lerp(hy,py,k)+bite,s:C5_PERCH.s,k:.62+.38*Math.cos(t*.7),a:1}; }
    const k=CA_EASE.in(clamp((t-FN.grey)/40,0,1)); return {x:lerp(px,80,k),y:lerp(py,-50,k),s:C5_PERCH.s,k:.55+.45*Math.cos(t*.5),a:1}; } // y se va al cielo...
  const S=[{s:2,sil:'#0e0a18',y:22},{s:1.4,sil:'#2a2438',y:26},{s:1,y:30},{s:.6,y:36}][Math.min(3,F.stage)];
  if(F.stage>=4){ // una polillita: baja en espiral, se posa en la hoja de Sprout, estornudo y adiós
    const u=F.ph==='moth'?F.pt:F.ph==='turn'?0:999, hx=player.x+8, hy=player.y-3;
    if(u<110){ const k=CA_EASE.io(u/110), a=u*.09; return {tiny:true,x:lerp(80,hx,k)+Math.cos(a)*18*(1-k),y:lerp(40,hy,k)+Math.sin(a)*8*(1-k)}; }
    if(u<170) return {tiny:true,fold:true,x:hx,y:hy};
    if(u<260){ const k=(u-170)/90; return {tiny:true,x:hx-k*110,y:hy-Math.sin(k*3)*14-k*30}; }
    return {hide:true}; }
  const fl=F.flinch>0?-Math.round(F.flinch/2):0, big=F.stage===0, k=big?(.78+.22*Math.sin(tick*.035)):(.55+.45*Math.cos(tick*.4));
  const a=F.ph==='lost'&&F.pt<40&&F.stage===0?F.pt/40:1;
  return {x:80+Math.sin(tick*.02)*(big?4:12),y:S.y+Math.sin(tick*.05)*2+fl,s:S.s,k,sil:S.sil,a:a*(big?.92:1),eyes:big?1:0,sky:big&&(F.ph==='lost'||F.ph==='voices'||F.ph==='charge')}; }
function c5NpcByWho(who){ return C5_NPC_OF[who]||null; }
/* ---------- el guion ---------- */
function updC5Fin(){ const F=c5Fin; if(!F){ state='play'; return; } F.t++; F.pt++; const t=F.t, Rn=Math.random; updParts(); if(sx===1&&sy===1) robleTick(); player.squash=(player.squash||0)*.82;
  if(F.greyTo!==undefined) F.grey+=(F.greyTo-F.grey)*.05; if(F.vi>=0&&F.sGreyTo===0) F.sGrey=Math.max(0,F.sGrey-1/30);
  if(F.plateT>=0){ F.plateT++; for(let i=0;i<6;i++) if(F.plateT===i*7+1&&F.plate[i]===1){ F.plate[i]=2; if(AC){ const m=[72,74,76,77,79,81][i]; beep('triangle',f(m),0,.25,.03); } } }
  if(F.flinch>0) F.flinch--; if(F.stun>0) F.stun--; if(F.wob>0) F.wob--; if(F.atk>0) F.atk--;
  if(F.ph==='rise'||F.ph==='eat') c5FinScript(F);
  else if(F.ph==='lost'){ c5FinInput(F); if(F.pt>=200||(F.tried&&F.pt>=140)) c5Voice(F,0); }
  else if(F.ph==='voices'){ c5FinInput(F); c5FinVoices(F); c5FinDust(F); }
  else if(F.ph==='charge'){ c5FinInput(F); c5FinCharge(F); }
  else if(F.ph==='turn') c5FinTurn(F);
  else if(F.ph==='moth') c5FinTinyMoth(F);
  else if(F.ph==='call') c5FinCall(F);
  else if(F.ph==='name') c5FinName(F);
  else if(F.ph==='end'){ F.white=Math.min(1,F.white+1/40); if(F.white>=1) c5FinEnd(); }
  if(F.call){ F.call.t++; if(F.call.t>F.call.life) F.call=null; }
  for(const k in F.hudFlash) if(--F.hudFlash[k]<=0) delete F.hudFlash[k]; }
function c5FinScript(F){ const t=F.t, Rn=Math.random;
  if(t<=FN.walk){ const k=CA_EASE.io(t/FN.walk), tx=72, ty=100; player.x=lerp(F.from[0],tx,k); player.y=lerp(F.from[1],ty,k); // Sprout se planta delante del Roble
    const dx=tx-F.from[0], dy=ty-F.from[1]; player.dir=t<FN.walk?(Math.abs(dx)>Math.abs(dy)?(dx<0?2:3):(dy<0?1:0)):1; player.anim+=t<FN.walk?.16:0; player.frame=t<FN.walk?(player.anim|0)%4:0; }
  if(keys.fire&&t>FN.walk&&t<FN.plate-8){ keys.fire=false; F.t=FN.plate-8; return; } // Z: al grano (hasta el nombre)
  if(t===FN.wake){ c5Startle=tick; olvDustBurst(80,20,1,16); OLV_SFX.flutter(2); shake=Math.max(shake,3); ROBLE.shake=3; if(AC) beep('triangle',f(33),f(28),.5,.08); }
  if(t===FN.lift){ OLV_SFX.flutter(2); swish(1,.05,300,1200,500); for(let i=0;i<10;i++) parts.push({k:'mote',x:80+(Rn()-.5)*40,y:18+Rn()*10,vx:(Rn()-.5)*.6,vy:.3,life:70,max:70,sway:Rn()*6,col:OLV.dust,nog:true}); }
  if(t>FN.lift&&t<FN.grey&&(t%8)===0) OLV_SFX.flutter(.8);
  if(t===FN.card){ setTrack('olvido'); if(AC) beep('square',f(40),f(34),.8,.04); }
  if(t===FN.plate){ F.ph='eat'; if(AC){ const a=AC.currentTime; [72,76,79].forEach((m,i)=>beep('triangle',f(m),0,.3,.03,a+i*.06)); } } // SPROUT, bien alto: su nombre
  if(t===FN.dive){ swish(.6,.07,1600,400,300); OLV_SFX.flutter(2); }
  for(let i=0;i<6;i++) if(t===FN.bites+i*FN.bite){ F.plate[i]=1; F.biteT=tick; if(AC){ noise(.05,.05,true,undefined,2600); beep('square',f(60-i),f(48-i),.06,.02); } // ñam: una letra
    const x=player.x+8-18+i*6; for(let q=0;q<5;q++) parts.push({k:'dust',x,y:player.y-18,vx:(Rn()-.5)*1.2,vy:-.4-Rn()*.6,life:18,max:18,r:1,col:q&1?OLV.dust:OLV.dustD,nog:true}); }
  if(t===FN.grey){ setTrack('silencio'); if(AC){ const a=AC.currentTime; beep('triangle',f(64),f(52),1.2,.05,a); noise(1.2,.03,false,a,300); } }
  if(t>=FN.grey){ F.sGrey=clamp((t-FN.grey)/40,0,1); F.grey=clamp((t-FN.grey)/50,0,1); F.dark=.62*clamp((t-FN.sky)/50,0,1);
    const H=F.hud; if(t===FN.grey+4) H.hearts=1; if(t===FN.grey+16) H.x=1; if(t===FN.grey+28) H.z=1; if(t===FN.grey+40) H.rest=1;
    if(t===FN.grey+4||t===FN.grey+16||t===FN.grey+28||t===FN.grey+40){ if(AC) noise(.06,.03,true,undefined,2600); } }
  if(t===FN.sky){ F.stage=0; if(AC) swish(2,.04,200,600,200); }
  if(t>=FN.lost){ F.ph='lost'; F.pt=0; F.stage=0; } }
/* sin nombre no sabe moverse: las flechas solo lo hacen temblar (hasta que Lupa se lo recuerda) */
function c5FinInput(F){ let dx=(keys.right?1:0)-(keys.left?1:0), dy=(keys.down?1:0)-(keys.up?1:0);
  if(keys.fire){ keys.fire=false; if(F.can.blade&&F.atk===0){ F.atk=12; SFX.swing?SFX.swing():swish(.12,.05,900,2400,1200); for(const q of F.dust) if(q.t<q.T&&Math.hypot(q.x-(player.x+8),q.y-(player.y+12))<22){ q.cut=true; olvPoof(q.x,q.y-10); } }
    else if(!F.can.blade&&F.ph!=='charge'){ F.wob=8; F.tried=1; } }
  if(!F.can.move||F.stun>0){ if(dx||dy){ F.tried=1; if(F.wob<=0){ F.wob=10; if(AC) beep('square',f(52),f(50),.05,.012); } } player.frame=0; return; }
  if(F.ph==='charge'&&keys.fireHeld) { player.frame=0; return; } // cargando, quieto
  if(dx&&dy){ dx*=.7071; dy*=.7071; }
  if(dx||dy){ player.dir=Math.abs(dy)>Math.abs(dx)?(dy>0?0:1):(dx<0?2:3); const sp=1.15, nx=clamp(player.x+dx*sp,0,144), ny=clamp(player.y+dy*sp,-2,112);
    if(boxFree(nx+4,player.y+8,8,8)) player.x=nx; if(boxFree(player.x+4,ny+8,8,8)) player.y=ny; player.anim+=.16; player.frame=(player.anim|0)%4; }
  else { player.anim=0; player.frame=0; } }
/* ---------- las voces ---------- */
function c5Voice(F,i){ const V=C5T.voices[i], S=SPEAKER[V.who]||{col:'#ffffff'};
  if(F.ph!=='voices'){ F.ph='voices'; F.pt=0; }
  F.vi=i; F.nextT=-1; let src=C5_FROM[V.who];
  if(!src){ src=[clamp(player.x+8+(player.x<80?30:-30),16,144),clamp(player.y+14,20,120)]; for(let q=0;q<10;q++){ const a=q/10*6.283; parts.push({k:'shard',x:src[0],y:src[1],vx:Math.cos(a)*1.2,vy:Math.sin(a)*.8-.8,life:18,max:18,col:q&1?'#8a5a30':'#c08858'}); } shake=Math.max(shake,3); if(AC) noise(.3,.05,false,undefined,300); } // el Topo sale de la tierra
  F.spark={x:src[0],y:src[1],vx:0,vy:0,t:0,col:S.col,who:V.who,trail:[]};
  F.call={who:V.who,txt:V.txt,t:0,life:130,src};
  if(V.who==='CIERZO') for(let q=0;q<40;q++) parts.push({k:'flake',x:Math.random()*160,y:-4-Math.random()*20,vx:1.4+Math.random(),vy:.8+Math.random()*.6,life:90,max:90,r:q&1,col:'#ffffff',nog:true}); // su voz baja con la nieve
  if(V.who==='RAÍZ') ROBLE.glow=1;
  c5Shout(V.who,V.txt); F.flinch=10; }
function c5Shout(who,txt){ if(!AC) return; const S=SPEAKER[who], base=S?S.f:900, w=S?S.w:'square', a=AC.currentTime, n=Math.min(9,txt.replace(/[^A-Za-zÁÉÍÓÚÑáéíóúñ]/g,'').length);
  for(let i=0;i<n;i++){ const k=1+((i*5%7)-3)*.045; beep(w,base*k,base*k*1.14,.05,w==='square'?.03:.06,a+i*.055); }
  beep('triangle',base*.5,base*.52,.25,.03,a); }
function c5FinVoices(F){ const S=F.spark;
  if(S){ S.t++; const tx=player.x+8, ty=player.y+6, dx=tx-S.x, dy=ty-S.y, d=Math.hypot(dx,dy)||1, acc=.05+Math.min(.25,S.t*.004);
    S.vx=(S.vx+dx/d*acc)*.96; S.vy=(S.vy+dy/d*acc)*.96; const sp=Math.hypot(S.vx,S.vy), mx=1+S.t*.03; if(sp>mx){ S.vx*=mx/sp; S.vy*=mx/sp; }
    S.x+=S.vx; S.y+=S.vy; S.trail.unshift([S.x,S.y]); if(S.trail.length>8) S.trail.pop();
    if((S.t&3)===0) parts.push({k:'mote',x:S.x,y:S.y,vx:0,vy:-.1,life:24,max:24,sway:Math.random()*6,col:S.col,nog:true});
    if(d<8||S.t>150){ F.spark=null; c5VoiceHit(F,F.vi); } return; }
  if(F.nextT>0&&--F.nextT===0){ if(F.vi+1<C5T.voices.length) c5Voice(F,F.vi+1); } }
function c5VoiceHit(F,i){ const V=C5T.voices[i], S=SPEAKER[V.who]||{col:'#ffffff'}, x=player.x+8, y=player.y+6, H=F.hud; F.nextT=i<4?64:56;
  const npc=c5NpcByWho(V.who); if(npc) F.back.add(npc);
  collectBurst(x,y,S.col,true); player.squash=.35; hitStop=3; F.dark=Math.max(0,F.dark-.05); F.flinch=16;
  if(AC){ if(i<9){ const m=NANA_NOTES[i][0]; beep('triangle',f(m),0,.6,.04); beep('p125',f(m+12),0,.3,.012); } }
  if(i===0){ F.plateT=0; F.sGreyTo=0; } // Petra: el nombre (letra a letra) y el color
  if(i===1){ F.can.move=true; flyText.push({x:player.x+8,y:player.y-8,txt:'¡!',t:36,col:'#fffbe8'}); } // Lupa: arriba
  if(i===2){ H.hearts=0; F.hudFlash.hearts=16; SFX.heart&&SFX.heart(); } // Moss: los corazones
  if(i===3){ H.z=0; F.can.blade=true; F.hudFlash.z=16; } // Tilo: la Hoja
  if(i===4){ H.x=0; H.rest=0; F.hudFlash.x=16; F.hudFlash.rest=16; F.dark=Math.max(0,F.dark-.12); } // Corteza: todo lo demás
  if(i>=5&&i<=8){ F.q[i-5]=1; for(let q=0;q<12;q++){ const a=q/12*6.283; parts.push({k:'spark',x:x+Math.cos(a)*14,y:y+Math.sin(a)*11,vx:-Math.cos(a)*.6,vy:-Math.sin(a)*.5,life:14,max:14,col:SEASON_COL[i-5],nog:true}); } } // los guardianes: un cuarto del anillo cada uno
  if(i===9){ F.ph='charge'; F.pt=0; F.dust=[]; setTrack('casa'); F.dark=0; ROBLE.glow=1; } // Raíz: la voz, y con ella la nana entera
  F.greyTo=Math.max(0,1-(i+1)*.1); }
/* el polvo que suelta: una sombra que crece y un puñado gris que cae (si te coge, se te olvida todo un momento) */
function c5FinDust(F){ if(!F.can.move) return;
  if(--F.dustT<=0){ F.dustT=Math.max(46,112-F.vi*7); F.dust.push({x:clamp(player.x+8+(Math.random()-.5)*30,10,150),y:clamp(player.y+14+(Math.random()-.5)*22,20,122),t:0,T:56}); }
  for(const q of F.dust){ q.t++; if(q.t===q.T&&!q.cut){ olvPoof(q.x,q.y-2); for(let i=0;i<6;i++) parts.push({k:'dust',x:q.x+(Math.random()-.5)*14,y:q.y-2,vx:(Math.random()-.5)*1,vy:-.3-Math.random()*.4,life:22,max:22,r:2,col:i&1?OLV.dust:OLV.dustD,nog:true});
      if(Math.hypot(q.x-(player.x+8),q.y-(player.y+14))<13){ F.stun=48; F.wob=12; flyText.push({x:player.x+8,y:player.y-10,txt:'?',t:40,col:'#d8d0e8'}); if(AC) beep('triangle',f(64),f(58),.3,.04); } } }
  F.dust=F.dust.filter(q=>q.t<=q.T&&!q.cut); }
/* ---------- el anillo: mantén Z ---------- */
function c5FinCharge(F){ const was=F.charge;
  if(keys.fireHeld) F.charge=Math.min(1,F.charge+1/150); else if(F.charge<1) F.charge=Math.max(0,F.charge-1/70);
  for(let q=0;q<4;q++) if(F.charge>=(q+1)/4&&!F.qLit[q]){ F.qLit[q]=1; const m=[72,76,79,84][q]; if(AC){ beep('triangle',f(m),0,.5,.04); beep('p125',f(m+12),0,.3,.012); } shake=Math.max(shake,2);
    for(let i=0;i<14;i++){ const a=Math.random()*6.283, r=26+Math.random()*10; parts.push({k:q===3?'flake':q===2?'leafF':q===1?'mote':'petal',x:player.x+8+Math.cos(a)*r,y:player.y+8+Math.sin(a)*r,vx:-Math.cos(a)*.8,vy:-Math.sin(a)*.8,life:30,max:30,sway:Math.random()*6,r:0,col:SEASON_COL[q],nog:true}); } }
  if(was<1&&F.charge>=1&&AC) SFX.chime();
  if(F.charge<1&&(F.pt%3)===0&&keys.fireHeld){ const a=Math.random()*6.283; parts.push({k:'mote',x:player.x+8+Math.cos(a)*18,y:player.y+8+Math.sin(a)*14,vx:-Math.cos(a)*.5,vy:-Math.sin(a)*.5,life:22,max:22,sway:0,col:SEASON_COL[Math.min(3,(F.charge*4)|0)],nog:true}); }
  if(F.charge>=1&&!keys.fireHeld) c5Turn(F); }
/* ---------- el año gira de un golpe: cuatro olas desde Sprout ---------- */
const C5W={start:[16,52,88,124],grow:70};
function c5WaveR(F,i){ return F.ph==='turn'||F.ph==='moth'||F.ph==='call'||F.ph==='name'||F.ph==='end'?CA_EASE.in(clamp((F.tt-C5W.start[i])/C5W.grow,0,1))*240:0; }
function c5Turn(F){ if(bgDirty||!bgCanvas[0]) rebuildBg(); bgEnsureAll();
  F.oldBg=bgCanvas.map(c=>{ const k=mkCanvas(160,128); if(c) k.getContext('2d').drawImage(c,0,0); return k; });
  const st={won:true,thawed:true,summered:true,autumned:true,cycled:true};
  F.plazas=[0,1,2].map(s=>{ const [bio,floor]=scState('1,1',Object.assign({},st,{force:s})); return scScreen('1,1',bio,floor); });
  F.ph='turn'; F.pt=0; F.tt=0; F.cx=player.x+8; F.cy=player.y+8; F.hitW=[0,0,0,0]; F.oakW=[0,0,0,0];
  cycled=true; SEASON_T0=tick; for(const k in THUMBS) delete THUMBS[k]; markDirty(); F.grey=0; F.greyTo=0; F.dark=0; // (se guarda al final: si se corta aquí, el final se repite)
  hitStop=8; shake=Math.max(shake,8); screenFlash(12,'#fffbe8'); c5OakForce='silk';
  if(AC){ const a=AC.currentTime; beep('triangle',f(36),f(48),1.2,.1,a); noise(1,.05,false,a,900); [60,64,67,72,76,79,84].forEach((m,i)=>beep('triangle',f(m),0,.5,.03,a+.04+i*.05)); } }
function c5FinTurn(F){ F.tt++; const t=F.tt, cx=F.cx, cy=F.cy, LOOK=['spring','summer','autumn','winter'];
  for(let i=0;i<4;i++){ const r=c5WaveR(F,i);
    if(t===C5W.start[i]){ if(AC){ const a=AC.currentTime, m=[72,76,79,84][i]; [0,4,7,12].forEach((d,j)=>beep('triangle',f(m+d),0,.5,.03,a+j*.06)); swish(.8,.05,400,1600,800); } }
    const dm=Math.hypot(80-cx,28-cy); if(!F.hitW[i]&&r>=dm){ F.hitW[i]=1; F.stage=i+1; hitStop=5; shake=Math.max(shake,6); screenFlash(8,SEASON_COL[i]); F.flinch=18; // la ola la alcanza: encoge
      olvDustBurst(80,30,1,18); if(AC){ const a=AC.currentTime; beep('square',f(88-i*3),f(70-i*3),.2,.025,a); noise(.25,.04,true,a,3000); } if(i===0) c5SilkT=tick; }
    const dt=Math.hypot(80-cx,62-cy); if(!F.oakW[i]&&r>=dt){ F.oakW[i]=1; ROBLE.wave={from:c5OakForce||'silk',to:LOOK[i],k:0,col:SEASON_COL[i]}; c5OakForce=LOOK[i]; ROBLE.shake=2.5; } }
  if(ROBLE.wave) ROBLE.wave.k=Math.min(1,ROBLE.wave.k+1/20);
  F.grey=Math.max(0,F.grey-.012); F.sGrey=0;
  if(t===C5W.start[3]+C5W.grow+20){ c5OakForce=null; ROBLE.wave=null; F.ph='moth'; F.pt=0; F.rootT=F.t; F.oldBg=null; } }
function c5FinBgLayers(F){ if(!F.oldBg||F.ph!=='turn') return; const L=[F.oldBg[bgFrame()],F.plazas[0],F.plazas[1],F.plazas[2]];
  for(let i=3;i>=0;i--){ const r=c5WaveR(F,i); if(r>=235) continue; c5OutsideCircle(L[i],F.cx,F.cy,r,r>0?SEASON_COL[i]:null); } } // de fuera adentro: el gris, primavera, verano, otoño... y en medio, el invierno de verdad
/* ---------- la polillita ---------- */
function c5FinTinyMoth(F){ const u=F.pt;
  if(u===110){ if(AC) beep('p125',f(88),0,.1,.02); }
  if(u===150){ OLV_SFX.sneeze(); player.squash=.55; shake=Math.max(shake,2); flyText.push({x:player.x+8,y:player.y-12,txt:'¡ACHÍS!',t:50,col:'#fffbe8'}); for(let i=0;i<6;i++) parts.push({k:'mote',x:player.x+8,y:player.y+2,vx:(Math.random()-.5)*1.4,vy:-.6-Math.random()*.6,life:30,max:30,sway:Math.random()*6,col:OLV.dust,nog:true}); }
  if(u===170&&AC) OLV_SFX.flutter(1);
  if(u>=270){ F.ph='call'; F.pt=0; F.walkers=C5_WALKERS.map(w=>({ch:w.ch,x:w.from[0],y:w.from[1],tx:w.tx*16,ty:w.ty*16})); } }
/* ---------- el valle llega a la plaza y dice su nombre ---------- */
function c5FinCall(F){ const u=F.pt;
  if(F.walkers){ let all=true; for(const w of F.walkers){ const dx=w.tx-w.x, dy=w.ty-w.y, d=Math.hypot(dx,dy); if(d>1){ all=false; w.x+=dx/d*Math.min(d,.9); w.y+=dy/d*Math.min(d,.9); } else { w.x=w.tx; w.y=w.ty; } }
    if(all||u>200){ for(const w of F.walkers) if(!npcs.some(n=>n.x===w.tx/16&&n.y===w.ty/16)) npcs.push({ch:w.ch,x:w.tx/16,y:w.ty/16}); F.walkers=null; F.pt=0; } return; }
  if(u===20){ state='dialog'; say(C5T.call,()=>{ state='c5fin'; F.ph='name'; F.pt=0; },'RAÍZ'); } }
const C5_ALL=['PETRA','LUPA','MOSS','TILO','CORTEZA','RAÍZ'];
const C5_FACE={'EL TOPO REAL':[8,4],'LA REINA':[8,0],'EL CIERVO':[16,0],CIERZO:[8,6]}; // dónde está la cara en los retratos de 32 px (se recorta, nunca se encoge)
function c5FinName(F){ const u=F.pt;
  for(let i=0;i<6;i++) if(u===8+i*9){ if(AC){ const m=NANA_NOTES[i][0]; beep('triangle',f(m),0,.5,.04); beep('triangle',f(m+7),0,.4,.02); } } // C-I-E-R-Z-O, con las notas de su nana
  if(u===4&&AC){ const a=AC.currentTime; C5_ALL.forEach((w,i)=>{ const S=SPEAKER[w]; if(S) for(let j=0;j<5;j++) beep(S.w,S.f*(1+j*.03),S.f*1.1,.06,S.w==='square'?.02:.04,a+j*.06+i*.01); }); shake=Math.max(shake,4); } // ¡CIERZO!, todos a la vez
  if(u===70){ F.snow=true; if(AC) noise(2.5,.012,true,undefined,6000); }
  if(u===90) F.cierzo={x:108,y:-30,t:0};
  if(F.cierzo){ const C=F.cierzo; C.t++; C.y=lerp(-30,70,CA_EASE.out(clamp(C.t/90,0,1))); if(C.t===90&&AC){ const a=AC.currentTime; [79,84,88].forEach((m,i)=>beep('triangle',f(m),0,.5,.03,a+i*.09)); } }
  if(u===200){ state='dialog'; say(C5T.brother,()=>say(C5T.brotherBack,()=>say(TXT.cycle,()=>{ state='c5fin'; F.ph='end'; F.pt=0; if(AC) SFX.fanfare(); },'RAÍZ'),'CIERZO'),'RAÍZ'); } }
function c5FinEnd(){ const toCredits=()=>{ state='credits'; creditsT=0; parts=[]; setTrack('creditos'); };
  c5Fin=null; c5SilkT=-1; c5OakForce=null; playerHidden=false; c5PostPending=true; save(); if(typeof playEnding==='function') playEnding(toCredits); else toCredits(); }
/* ---------- lo que se pinta del final ---------- */
{ const S0=drawScene; drawScene=function(){ S0(); if(c5Fin) c5FinSceneFx(c5Fin); }; }
function c5FinSceneFx(F){ const P=PLAY_H;
  for(const q of F.dust){ const k=q.t/q.T; ctx.fillStyle='rgba(30,22,44,'+(.12+.3*k).toFixed(2)+')'; const rw=Math.round(4+k*8); ctx.fillRect(Math.round(q.x-rw),Math.round(q.y-1),rw*2,3); ctx.fillRect(Math.round(q.x-rw+2),Math.round(q.y-2),rw*2-4,5);
    if(q.T-q.t<16){ const fy=q.y-(q.T-q.t)*5; ctx.fillStyle=OLV.dustD; ctx.fillRect(Math.round(q.x-3),Math.round(fy-6),6,6); ctx.fillStyle=OLV.dust; ctx.fillRect(Math.round(q.x-2),Math.round(fy-7),4,3); } }
  if(F.grey>0){ ctx.save(); ctx.globalCompositeOperation='saturation'; ctx.fillStyle='rgba(128,128,128,'+Math.min(1,F.grey).toFixed(3)+')'; ctx.fillRect(0,0,VW,P); ctx.restore(); } // el mundo, sin color
  if(F.dark>0) for(let y=0;y<P;y+=2){ ctx.fillStyle='rgba(12,9,20,'+(F.dark*(.95-y/P*.35)).toFixed(3)+')'; ctx.fillRect(0,y,VW,2); } // y a oscuras
  c5DrawMoth(true); // del tamaño del cielo, por encima de la oscuridad
  if(F.walkers) for(const w of F.walkers){ const bob=Math.round(Math.abs(Math.sin((w.x+w.y)*.3))); drawShadow(w.x+8,w.y+15,5); ctx.drawImage(NPCS[w.ch].img,Math.round(w.x),Math.round(w.y)-bob); }
  if(F.cierzo){ const C=F.cierzo; glowAt(C.x,C.y+10,22,'rgba(220,236,255,.3)'); drawWind(C.x,C.y+Math.round(Math.sin(tick*.05)*2),{s:1,mood:C.t<90?'calm':'happy',f:(tick>>3)&7,flip:C.x>80}); }
  if(playerHidden) c5FinSprout(F);
  if(F.spark){ const S=F.spark; S.trail.forEach(([x,y],i)=>{ ctx.fillStyle=i<2?'#ffffff':S.col; ctx.globalAlpha=1-i/9; ctx.fillRect(Math.round(x)-(i<2?1:0),Math.round(y)-(i<2?1:0),i<2?3:2,i<2?3:2); }); ctx.globalAlpha=1;
    glowAt(S.x,S.y,12,'rgba(255,250,220,.5)'); caStar(S.x,S.y,3+((tick>>2)&1),'#ffffff'); }
  if(F.q.some(Boolean)&&(F.ph==='voices'||F.ph==='charge')) c5Ring(F); }
function c5FinSprout(F){ const g=F.stun>0?.85:F.sGrey, wob=F.wob>0?((tick&2)?1:-1):0, x=Math.round(player.x)+wob, y=Math.round(player.y);
  let s=P_SPRITES[player.dir][player.frame]; if(F.atk>4) s=P_ATK[player.dir]; if(F.ph==='turn'&&F.tt<60) s=P_ATK[[0,3,1,2][(F.tt>>2)&3]]; // el giro
  drawShadow(x+8,y+15,6); const img=g>.05?c5GreyOf(s,g):s, sq=player.squash||0;
  if(Math.abs(sq)>.01){ ctx.save(); ctx.translate(x+8,y+16); ctx.scale(1-sq*.55,1+sq); ctx.drawImage(img,-8,-16); ctx.restore(); } else ctx.drawImage(img,x,y);
  if(F.ph==='eat'||F.ph==='lost'||F.ph==='voices'||(F.ph==='rise'&&F.t>=FN.plate)) c5Plate(F,x,y);
  if(F.stun>0&&(tick&16)) txtOL('?',x+8,y-12,'#d8d0e8','center','#140e1c'); }
/* el nombre, en su chapa: se lo come letra a letra y Petra se lo devuelve */
function c5Plate(F,x,y){ const s='SPROUT', k=F.t<FN.plate+8?easeOutBack(clamp((F.t-FN.plate)/8,0,1)):1; if(k<=0) return;
  if(F.ph==='voices'&&F.vi>=2) return; // ya es suyo: la chapa se va
  const w=textW(s)+10, px=Math.round(x+8-w/2), py=Math.round(y-15+(1-k)*6);
  roundBox(px-1,py-1,w+2,13,PAL.k); roundBox(px,py,w,11,'#2a2034'); ctx.fillStyle='#4a4058'; ctx.fillRect(px+1,py+1,w-2,1);
  let cx=px+5; for(let i=0;i<6;i++){ const ch=s[i], cw=textW(ch), st=F.plate[i];
    if(st===1) mothHole(cx,py+2,Math.max(3,cw),{bg:'#2a2034'},i*7+3); else drawText(ctx,ch,cx,py+2,st===2?'#ffe070':'#f4ecd8','left',FONT_M);
    cx+=cw+1; } }
function c5Ring(F){ const cx=player.x+8, cy=player.y+8, R=14;
  for(let q=0;q<4;q++){ if(!F.q[q]) continue; const lit=F.ph==='charge'?clamp(F.charge*4-q,0,1):0;
    for(let i=0;i<14;i++){ const u=(q+i/14)/4, a=-Math.PI/2+u*6.283, x=Math.round(cx+Math.cos(a)*R), y=Math.round(cy+Math.sin(a)*R*.8), on=i/14<lit;
      if(on){ ctx.fillStyle=((i+(tick>>1))%5)?SEASON_COL[q]:'#ffffff'; ctx.fillRect(x-1,y-1,2,2); } else if((i+(tick>>3))&1){ ctx.fillStyle='rgba('+SEASON_RGB[q]+',.55)'; ctx.fillRect(x,y,1,1); } } }
  if(F.ph==='charge'&&F.charge>=1){ const r=R+2+((tick>>2)&1); glowAt(cx,cy,r+6,'rgba(255,250,220,.25)'); } }
/* encima de todo: el cartel, las voces, el aviso de Z, el HUD que se olvida y las franjas */
function drawC5FinUI(){ const F=c5Fin; if(!F) return; const t=F.t;
  if((F.ph==='rise'||F.ph==='eat')&&t>=FN.card&&t<FN.cardEnd+16){ const a=Math.min(presentSeg(t,FN.card,FN.card+10),1-presentSeg(t,FN.cardEnd,FN.cardEnd+16)), y0=84; // EL OL▒IDO, otra vez
    ctx.globalAlpha=a*.93; ctx.fillStyle='#0a0612'; ctx.fillRect(0,y0-10,VW,34); ctx.fillStyle='#5a5070'; ctx.fillRect(0,y0-10,VW,1); ctx.fillRect(0,y0+23,VW,1); ctx.globalAlpha=1;
    tlBigLine('EL OLVIDO',80,y0,RV_PAL,i=>{ const u=t-(FN.card+i*2); if(u<0) return null; return {dx:0,dy:Math.round((1-presentEase.out(Math.min(1,u/8)))*-6),a:Math.min(1,u/3)*a}; });
    const L=tlLineW('EL OLVIDO'), vx=80-L/2+L*5.5/9; ctx.globalAlpha=a; ctx.fillStyle='#0a0612'; for(let i=0;i<4;i++){ const bx=vx+(i-1.5)*3, by=y0+4+(i&1)*5, g=3; for(let yy=-g;yy<=g;yy++){ const w=Math.round(Math.sqrt(g*g-yy*yy)); ctx.fillRect(Math.round(bx-w),Math.round(by+yy),w*2+1,1); } } ctx.globalAlpha=1;
    if(t>=FN.card+26){ const s='se come los nombres', n=Math.min(s.length,Math.floor((t-FN.card-26)*.8)); ctx.globalAlpha=a; txtOL(s.slice(0,n),80,y0+14,'#b8aec8','center','#0a0612'); ctx.globalAlpha=1; } }
  if(F.ph==='lost'&&F.pt>50){ const a=Math.min(1,(F.pt-50)/20); ctx.globalAlpha=a; txtOL(C5T.lost,80,PLAY_H-14,'#b8aec8','center','#0a0612'); ctx.globalAlpha=1; }
  if(F.call) c5Callout(F.call);
  if(F.ph==='charge'){ const y=Math.round(player.y-24+Math.sin(tick*.15)*1.5), full=F.charge>=1;
    if(full){ if((tick&15)<11) txtOL('¡SUELTA!',player.x+8,y,'#fffbe8','center','#2a1804'); }
    else { const w=textW(C5T.hold)+14, x=Math.round(player.x+8-w/2); roundBox(x-1,y-2,w+2,13,PAL.k); roundBox(x,y-1,w,11,'#2a5a30'); badge('Z',x+1,y); drawText(ctx,C5T.hold,x+12,y+1,'#fffbe8','left',FONT_M); } }
  if(F.ph==='name'){ const u=F.pt, y0=34; // ¡CIERZO!: todos a la vez, y el nombre tallado en hielo, letra a letra con su nota
    const a=Math.min(1,u/10)*(1-presentSeg(u,160,190)); if(a>0){ ctx.globalAlpha=a*.8; ctx.fillStyle='#0a1428'; ctx.fillRect(0,y0-24,VW,50); ctx.globalAlpha=1;
      C5_ALL.forEach((w,i)=>{ const im=PORTRAITS[w]; if(!im) return; const x=22+i*20, bob=((tick>>3)+i)%6===0?-1:0; ctx.globalAlpha=a; roundBox(x-1,y0-21+bob,18,18,PAL.k); ctx.drawImage(im,0,0,im.width,im.height,x,y0-20+bob,16,16); ctx.globalAlpha=1; });
      tlBigLine('CIERZO',80,y0,TL_ICE,i=>{ const v=u-(8+i*9); if(v<0) return null; return {dx:0,dy:Math.round((1-presentEase.out(Math.min(1,v/8)))*-8),a:Math.min(1,v/3)*a}; }); } }
  if(F.white>0){ ctx.fillStyle='rgba(255,252,240,'+F.white.toFixed(3)+')'; ctx.fillRect(0,0,VW,VH); }
  const bars=F.ph==='rise'||F.ph==='eat'?Math.min(clamp(t/FN.bars,0,1),1-presentSeg(t,FN.lost-20,FN.lost)):0; if(bars>0) presentBars(bars,12); }
/* una voz que llega desde donde vive: su cara, su grito y su color (sin parar el juego) */
function c5Callout(C){ const S=SPEAKER[C.who]||{col:'#ffffff',ink:'#000000'}, a=Math.min(1,C.t/6,(C.life-C.t)/14); if(a<=0) return;
  const w=Math.min(150,textW(C.txt)+28), h=22, src=C.src, k=easeOutBack(clamp(C.t/9,0,1)), sh=C.t<14&&/[¡!]/.test(C.txt)?((C.t>>1)&1?1:-1):0;
  if(!C.at){ const x=src[0]<40?4:src[0]>120?VW-4-w:clamp(Math.round(src[0]-w/2),4,VW-4-w), px=player.x, py=player.y, hit=y=>y<py+18&&y+h>py-16&&x<px+18&&x+w>px-2; // cerca de donde vive... sin tapar a Sprout
    let y=src[1]<30?16:src[1]>100?PLAY_H-h-6:clamp(Math.round(src[1]-h/2),16,PLAY_H-h-6); if(hit(y)) y=py>64?16:PLAY_H-h-6; if(hit(y)) y=py-h-20>=4?py-h-20:py+22; C.at=[x,clamp(y,4,PLAY_H-h-4)]; }
  const [x,y]=C.at;
  ctx.save(); ctx.globalAlpha=a; ctx.translate(x+w/2+sh,y+h/2); ctx.scale(k,k); ctx.translate(-(x+w/2),-(y+h/2));
  roundBox(x-1,y-1,w+2,h+2,PAL.k); roundBox(x,y,w,h,shade(S.col,-.6)); ctx.fillStyle=S.col; ctx.fillRect(x+1,y+1,w-2,1); ctx.fillStyle=shade(S.col,-.3); ctx.fillRect(x+1,y+h-2,w-2,1);
  const im=PORTRAITS[C.who]; if(im){ roundBox(x+2,y+2,18,18,PAL.k); const cw=Math.min(16,im.width), ch=Math.min(16,im.height), f=C5_FACE[C.who], ox=f?f[0]:(im.width-cw)>>1, oy=f?f[1]:im.height>16?Math.max(0,((im.height-ch)>>1)-4):0; ctx.drawImage(im,ox,oy,cw,ch,x+3,y+3,cw,ch); }
  txtOL(C.txt,x+23,y+7,shade(S.col,.35),'left',S.ink||PAL.k); ctx.restore(); }
/* el HUD que se olvida: cada hueco, roído; y los corazones, sin color */
{ const U0=drawUI; drawUI=function(){ U0(); if(c5Fin) c5HudForget(c5Fin); }; }
function c5HudForget(F){ const Y=PLAY_H, H=F.hud, FL=F.hudFlash;
  const cover=(x,w,seed)=>{ hudWell(x,Y+2,w,13); mothHole(x+(w>>1)-5,Y+5,10,{bg:HUD.well},seed); };
  if(H.z>0) cover(1,26,11); if(H.x>0) cover(29,26,23);
  if(H.rest>0){ ctx.fillStyle=HUD.paper; ctx.fillRect(57,Y+2,56,13); mothHole(64,Y+5,16,{bg:HUD.paper},41); mothHole(88,Y+5,12,{bg:HUD.paper},57); }
  if(H.hearts>0){ ctx.save(); ctx.globalCompositeOperation='saturation'; ctx.fillStyle='rgba(128,128,128,1)'; ctx.fillRect(0,Y,VW,16); ctx.restore(); } // el pergamino entero, sin color
  for(const [k,x,w] of [['z',1,26],['x',29,26],['rest',57,56],['hearts',VW-44,44]]) if(FL[k]){ ctx.fillStyle='rgba(255,255,244,'+(FL[k]/16*.8).toFixed(2)+')'; ctx.fillRect(x,Y+2,w,13); } }

/* ============================================================
   DESPUÉS DE LOS CRÉDITOS: la polillita y el farol de Tilo
   ============================================================ */
function c5PostCredits(){ if(!c5PostPending) return false; c5PostPending=false; c5Post={t:0}; state='c5post'; parts=[]; setTrack('silencio'); return true; }
function updC5Post(){ const P=c5Post; if(!P){ state='play'; return; } P.t++;
  if(P.t===40&&AC){ const a=AC.currentTime; [76,79,76,74].forEach((m,i)=>beep('triangle',f(m),0,.5,.02,a+i*.3)); }
  if((keys.fire&&P.t>60)||P.t>420){ keys.fire=false; c5Post=null; state='play'; fadeIn=40; parts=[]; setTrack('valle'); } }
function drawC5Post(){ const P=c5Post; if(!P) return; const t=P.t, a=Math.min(1,t/40,(430-t)/30), lx=80, ly=58;
  ctx.fillStyle='#07060c'; ctx.fillRect(-4,-4,VW+8,VH+8); ctx.globalAlpha=Math.max(0,a);
  glowAt(lx,ly+6,34+Math.sin(t*.07)*2,'rgba(255,196,110,.22)'); glowAt(lx,ly+6,14,'rgba(255,226,160,.45)');
  ctx.fillStyle='#3a2a1a'; ctx.fillRect(lx-12,ly-18,24,2); ctx.fillRect(lx,ly-16,1,6); // la ménsula y el gancho
  ctx.fillStyle=PAL.k; ctx.fillRect(lx-5,ly-10,11,2); ctx.fillRect(lx-4,ly-8,9,16); ctx.fillRect(lx-5,ly+8,11,2); // el farol
  ctx.fillStyle='#ffd070'; ctx.fillRect(lx-3,ly-7,7,14); ctx.fillStyle='#fff4c8'; ctx.fillRect(lx-1,ly-4,3,7); ctx.fillStyle='#e8a040'; ctx.fillRect(lx-3,ly+4,7,2);
  ctx.fillStyle=PAL.k; ctx.fillRect(lx,ly-7,1,14);
  const u=t*.07, mx=lx+Math.cos(u)*14, my=ly+Math.sin(u*1.3)*7; ctx.drawImage(MOTH_B[MOTH_FLAP[(tick>>1)&3]],Math.round(mx-6),Math.round(my-5)); // la polillita, a la luz
  if(t>90){ const k=Math.min(1,(t-90)/30); ctx.globalAlpha=Math.max(0,a)*k; txtOL('Hasta el olvido',80,98,'#e8e0d0','center','#07060c'); txtOL('tiene su estación.',80,110,'#e8e0d0','center','#07060c'); }
  ctx.globalAlpha=1; }
