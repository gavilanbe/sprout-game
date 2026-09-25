'use strict';
/* ============================================================
   EL TÍTULO: «la semilla que el Viento no encontró»
   La intro es corta y va sin música (la leyenda entera la cuenta el prólogo):
     TORMENTA   0 … TI_TRUNK      un relámpago enseña al Viento en las nubes; baja
                                  aullando y le arranca al Roble sus ocho semillas.
                                  El Roble se queda gris.
     TRONCO     TI_TRUNK … TI_BURST   en la corteza late una semilla que no encontró;
                                  pasa su sombra, se esconde, vuelve a latir y revienta.
     ESTALLIDO  TI_BURST … TITLE_LAND el valle del título, gris; la semilla sube y se
                                  encaja en el hueco de la O del logo.
   Al posarse (TITLE_LAND) entra el tema y el color vuelve al valle desde ella:
   las letras brincan al pasarles la ola, el Roble florece, Sprout se despierta,
   a la bellota le salen sus dos hojas, cae la cinta y ocho luces se encienden lejos,
   por el valle: las semillas que hay que buscar. Después el título vive al compás
   de la música: la bellota late, las letras hacen la ola, pasan ráfagas, Sprout
   baila, saluda y responde a las flechas, y cada estación viste el logo.
   Z (o X) salta la intro. Todo a su tamaño: nada de píxeles estirados salvo el
   aplastar y estirar de un golpe, que dura unos fotogramas.
   ============================================================ */
const TI_BOLTS=[12,72,114], TI_EYES=20, TI_DIVE=36, TI_BLOW=54, TI_GONE=96, TI_TRUNK=118, TI_BURST=182, TI_FLY=190;
const TI_BEATS=[134,142,164,170];                        // el corazón de la semilla escondida: pum-pum … pum-pum
const TI_AX=LOGO_POS[3]+11, TI_AY=LOGO_Y+LOGO_GLYPHS[3].dy+13; // el centro del hueco de la O
const TI_OAKX=37, TI_OAKY=36;                            // el Roble del título (drawTitleScene lo pone ahí)
const TI_ORDER=ROBLE_SEEDS.map((s,i)=>[s[0],i]).sort((a,b)=>b[0]-a[0]).map(v=>v[1]); // primero las de su lado
const TI_PLUCK=[]; TI_ORDER.forEach((i,j)=>{ TI_PLUCK[i]=TI_BLOW+6+j*4; });
const TI_FLIGHT=ROBLE_SEEDS.map((s,i)=>{ const r=seeded(40+i*3); return {a:Math.PI+(r()-.35)*1.6,c:(r()-.5)*.05,sp:.9+r()*.6}; });
const TI_SEEDS=[[7,75],[21,63],[29,86],[13,92],[133,70],[147,60],[152,84],[138,92]]; // las ocho, lejos, por el valle
const TI_RIB=Math.round(TITLE_LAND+TITLE_BAR);           // cae la cinta
const TI_SEED_T=i=>TI_RIB+16+i*10;                      // y se encienden las semillas
const TI_LEAF_T=TITLE_LAND+28;                           // a la bellota le salen las hojas
/* la ola de color: radio a los u fotogramas de posarse, y cuándo llega a una distancia */
function tiWave(u){ return u<=0?0:4.2*u+.02*u*u; }
function tiWaveU(r){ return (-4.2+Math.sqrt(17.64+.08*r))/.04; }
const TI_POPU=LOGO_GLYPHS.map((g,i)=>i===3?0:Math.round(tiWaveU(Math.hypot(LOGO_POS[i]+8-TI_AX,LOGO_Y+10-TI_AY)))); // cuándo brinca cada letra
const TI_HERO_U=Math.round(tiWaveU(Math.hypot(28-TI_AX,116-TI_AY)));  // cuándo despierta Sprout
const TI_OAK_U=Math.round(tiWaveU(Math.hypot(80-TI_AX,70-TI_AY)));    // cuándo florece el Roble

/* ---------- el estado vivo del título ---------- */
const TI={ beat:-99, hops:[], sways:[], leafPop:-99, go:-99, look:null, rain:null, rainG:null, seedsIn:0, lastSeason:-1, snow:0, leafOn:0, heroLeaf:null };
/* un brinco (analítico: vale en cualquier estado, sin física por fotograma) */
function tiHop(list,i,amp,dur){ list.push({i,t:tick,amp,dur:dur||14}); if(list.length>40) list.shift(); }
function tiHopY(list,i){ let y=0; for(const h of list){ if(h.i!==i) continue; const u=tick-h.t; if(u<0) continue;
    if(u<h.dur) y-=h.amp*Math.sin(u/h.dur*Math.PI); else if(u<h.dur+8) y+=h.amp*.22*Math.sin((u-h.dur)/8*Math.PI); } return y; }
function tiSwayX(i){ let x=0; for(const h of TI.sways){ if(h.i!==i) continue; const u=tick-h.t; if(u>=0&&u<50) x+=h.amp*Math.exp(-u/11)*Math.sin(u*.36); } return x; }
function tiSway(i,amp){ TI.sways.push({i,t:tick,amp}); if(TI.sways.length>40) TI.sways.shift(); }

/* ---------- el compás: el reloj del audio manda; sin audio, el del título ---------- */
function titleBeat(){ const p=curTrack==='titulo'?musicPos():null; return p!=null?p/4:(titleT-TITLE_LAND)/(TITLE_BAR/4); }
function titleBars(){ return titleBeat()/4; }
/* la estación del menú: una por frase del tema (4 compases), así el año entero dura lo que el tema */
function tiSeason(){ const b=titleBars(); if(b<4) return {si:0,w:999,first:true,prev:3};
  const n=Math.floor(b/4); return {si:n%4,w:Math.round((b-n*4)*TITLE_BAR),first:false,prev:(n+3)%4}; }
function menuSeason(){ return tiSeason().si; }
/* el Roble se mece más cuando pasa una ráfaga (drawOakSway, 15a) */
function tiOakAmp(){ if(state!=='title'&&state!=='file') return 0; const g=tiGust(); return g&&g.u>=0?2.2*Math.exp(-g.u/16):0; }

/* ---------- el sonido de la tormenta ---------- */
function tiBuf(){ if(!noiseBuf) noise(.01,.0001); return noiseBuf; }
function tiRain(on){ if(!AC) return; const t=AC.currentTime;
  if(on){ if(TI.rain) return; const s=AC.createBufferSource(); s.buffer=tiBuf(); s.loop=true;
    const hp=AC.createBiquadFilter(); hp.type='highpass'; hp.frequency.value=1400; const lp=AC.createBiquadFilter(); lp.type='lowpass'; lp.frequency.value=6500;
    const g=AC.createGain(); g.gain.value=0; g.gain.setValueAtTime(.0001,t); g.gain.exponentialRampToValueAtTime(.05,t+.6);
    s.connect(hp).connect(lp).connect(g).connect(sfxBus); s.start(t); TI.rain=s; TI.rainG=g; }
  else if(TI.rain){ TI.rainG.gain.cancelScheduledValues(t); TI.rainG.gain.setTargetAtTime(0,t,.09); TI.rain.stop(t+.6); TI.rain=null; } }
function tiThunder(k){ if(!AC) return; const t=AC.currentTime; noise(.06,.1*k,true,t,3600); // el chasquido
  const s=AC.createBufferSource(); s.buffer=tiBuf(); s.loop=true; const lp=AC.createBiquadFilter(); lp.type='lowpass'; lp.frequency.setValueAtTime(1100,t); lp.frequency.exponentialRampToValueAtTime(110,t+1.3);
  const g=AC.createGain(); g.gain.value=0; g.gain.setValueAtTime(.0001,t); g.gain.exponentialRampToValueAtTime(.2*k,t+.04); g.gain.exponentialRampToValueAtTime(.0001,t+1.9);
  s.connect(lp).connect(g).connect(sfxBus); s.start(t); s.stop(t+1.95); beep('triangle',74,30,1.2,.13*k,t+.02); } // y el retumbo
function tiHowl(dur,vol){ if(!AC) return; const t=AC.currentTime; swish(dur,vol,300,760,420,t,7); swish(dur*.9,vol*.55,460,1080,560,t+.06,9); }
function tiPluck(j){ if(!AC) return; const t=AC.currentTime; beep('p25',f(76+[0,3,5,7,10,12,15,17][j]),0,.11,.03,t); swish(.14,.03,1800,5200,2600,t,1.5); }
function tiHeart(k){ if(!AC) return; const t=AC.currentTime; beep('triangle',70,36,.17,.16*k,t); noise(.05,.035*k,false,t,280); }
function tiRiser(){ if(!AC) return; const t=AC.currentTime; swish(1.05,.07,260,1200,6200,t,2.5); beep('square',110,660,1.0,.012,t); beep('p25',220,1320,1.0,.01,t+.02); }
function tiBurstSfx(){ if(!AC) return; const t=AC.currentTime; noise(.5,.12,true,t,2400); beep('triangle',180,40,.5,.12,t);
  [69,72,76,81,84,88].forEach((m,i)=>beep('square',f(m),0,.09,.03,t+i*.025)); }
function tiSlam(){ if(!AC) return; const t=AC.currentTime; beep('triangle',150,32,.5,.17,t); noise(.3,.08,false,t,700); DRUMS.c(t,.11); beep('p25',f(93),0,.45,.028,t+.01); }
function tiPop(i){ if(!AC) return; const t=AC.currentTime; beep('triangle',190-i*14,70,.1,.1,t); noise(.04,.035,false,t,1300); }
function tiPlink(i){ if(!AC) return; const t=AC.currentTime; beep('p125',f([81,84,86,88,91,93,96,98][i]),0,.14,.022,t); }

/* ---------- el arte de la tormenta (se prepara la primera vez) ---------- */
let TI_ART=null;
const TI_K='#07080f';
/* el arte de la tormenta va por piezas: el arranque las prepara en los ratos libres (tiPrewarm) y el título no se atasca al empezar */
function tiCloud(seed,pal,h){ const c=mkCanvas(320,h), g=c.getContext('2d'), r=seeded(seed);
  for(let i=0;i<9;i++){ const x=((i*36+r()*14)|0)-10, y=((r()*h*.25)|0)-4, L=[{x:18,y:14,r:12,ry:8},{x:34,y:10,r:14,ry:9},{x:50,y:15,r:11,ry:7},{x:32,y:19,r:17,ry:7}];
    for(const ox of [x,x-320]) blobArt(g,ox,y,70,h,L,pal,{outline:false,grad:.7,dither:.6}); }
  return c; }
const TI_A={}, TI_PARTS=[
  A=>{ A.sky=mkCanvas(160,144); const g=A.sky.getContext('2d'); bandSky(g,160,112,['#05051a','#0b0b26','#151434','#211e40']); g.fillStyle='#211e40'; g.fillRect(0,112,160,32); },
  A=>{ A.cf=tiCloud(3,['#0b0b22','#10102c','#161636','#1c1c40','#23234a'],40); },
  A=>{ A.cn=tiCloud(8,['#06061a','#0a0a20','#0e0e28','#131330','#191938'],34); },
  A=>{ A.cfL=tiCloud(3,['#39406c','#525c8a','#707eac','#94a4d0','#c0ccee'],40); },
  A=>{ A.cnL=tiCloud(8,['#252a50','#323a64','#44507c','#5a6694','#7886b2'],34); },
  A=>{ const P=PARA[1]; A.mount=proNightArt(P.mount,'#3c4474'); A.hills=proNightArt(P.hills,'#303a64'); A.hill=proNightArt(TITLE_HILL[1],'#303a64'); },
  A=>{ A.oak=proNightArt(OAK_SEASON[1],'#4a5890'); A.oakG=proNightArt(proGreyArt(OAK_SEASON[1]),'#5a6078'); },
  A=>{ const P=PARA[1]; A.sMount=tintTo(P.mount,TI_K); A.sHills=tintTo(P.hills,TI_K); A.sHill=tintTo(TITLE_HILL[1],TI_K); A.sOak=tintTo(OAK_SEASON[1],TI_K); },
  A=>{ const G=windArt({s:3,mood:'storm'}); A.giantS=tintTo(G,'#3c4680'); A.giant=tintTo(G,'#232a54'); },
  A=>{ A.bark=tiBarkArt(); }];
const TI_DONE=TI_PARTS.map(()=>false);
function tiArtPart(i){ if(TI_DONE[i]) return; TI_PARTS[i](TI_A); TI_DONE[i]=true; }
function tiArt(){ if(TI_ART) return TI_ART; for(let i=0;i<TI_PARTS.length;i++) tiArtPart(i); return TI_ART=TI_A; }
function tiPrewarm(){ TI_PARTS.forEach((_,i)=>idleTask(()=>tiArtPart(i),'ti'+i)); }
const TI_SIL=new Map(); // las siluetas negras del Viento (por fotograma)
function tiBlack(img){ let c=TI_SIL.get(img); if(!c){ c=tintTo(img,TI_K); TI_SIL.set(img,c); if(TI_SIL.size>40) TI_SIL.delete(TI_SIL.keys().next().value); } return c; }

/* la corteza del Roble de cerca, gris y de noche, con el hueco donde late la semilla y las venas de savia */
const TI_KNOT=[80,74];
function tiBarkArt(){ const W=160, H=176, r=seeded(77), [kx,ky]=TI_KNOT, B=pxBuf(W,H,'#090a14'); // a un búfer: los mismos píxeles, sin 28 000 fillRect
  const P=['#06070d','#0e1019','#171a26','#222636','#2e3448','#3d455e','#515c7a','#6a7896'];
  const cr=[]; for(let x=20;x<142;x+=6+((r()*7)|0)) cr.push([x,r()*6.28,1+r()*2.6,.025+r()*.035,r()<.5?1:-1]);
  const edges=y=>{ const fl=y>118?Math.pow((y-118)/58,2)*46:0; return [16-fl,144+fl]; };
  const nc=cr.length, base=new Float64Array(nc);
  for(let y=0;y<H;y++){ const [L,R]=edges(y), k=(y>118?(y-118)/58*.55:0);
    for(let j=0;j<nc;j++){ const [cx,ph,a,fq]=cr[j]; base[j]=cx+Math.sin(y*fq+ph)*a; } // lo que no depende de x, una vez por fila (misma cuenta, mismo orden)
    for(let x=Math.max(0,Math.floor(L));x<Math.min(W,Math.ceil(R));x++){
      const u=(x-L)/(R-L), cyl=Math.cos((u-.42)*Math.PI*.92), sk=(x-80)*k;
      let d=99; for(let j=0;j<nc;j++){ const gx=base[j]+sk; if(Math.abs(x-gx)<Math.abs(d)) d=x-gx; }
      let v=1.2+cyl*4.6;
      if(Math.abs(d)<.9) v=0; else if(Math.abs(d)<1.9) v=Math.min(v,1.4); else if(d>0&&d<3.2) v+=.9; else if(d<0&&d>-3) v-=.6; // la grieta, su labio al sol y su sombra
      if(((hash(x>>1,y>>3)&63)===0)) v-=1.4;           // nudos pequeños
      v+=BAYER4[y&3][x&3]/16-.45;
      B.set(x,y,P[clamp(Math.round(v),0,7)]); }
    if(L>0) B.set(Math.floor(L),y,P[0]); if(R<W) B.set(Math.ceil(R)-1,y,P[0]); }
  for(let i=0;i<7;i++){ const y=12+((r()*120)|0), x0=24+((r()*90)|0), w=6+((r()*14)|0); B.rect(x0,y,w,1,P[0]); B.rect(x0+1,y+1,w-2,1,P[5]); } // grietas de través
  // el suelo: hierba gris bajo la lluvia y charcos
  for(let y=152;y<H;y++) for(let x=0;x<W;x++){ const [L,R]=edges(y); if(x>L&&x<R) continue; B.set(x,y,((x*7+y*3)&7)?'#161a24':'#20263a'); }
  for(let i=0;i<30;i++){ const x=(r()*W)|0, y=150+((r()*24)|0); B.rect(x,y,1,2,'#2a3248'); }
  // el hueco: labio claro, dentro oscuro
  for(let y=-15;y<=15;y++) for(let x=-13;x<=13;x++){ const e=(x*x)/(10.5*10.5)+(y*y)/(13.5*13.5)+((hash(x+40,y+40)&7)-3.5)*.02; if(e>1.2) continue;
    B.set(kx+x,ky+y,e>.95?(x<-2||y<-8?P[7]:P[4]):e>.82?P[1]:y>8?'#0c0808':'#030305'); }
  const c=B.canvas();
  // las venas: desde el hueco, siguiendo las grietas (se encienden con cada latido)
  const veins=[]; [[-1,-1],[1,-1],[-1,1],[1,1],[0,-1],[0,1],[-1,0],[1,0]].forEach(([dx,dy],vi)=>{ const v=[], rr=seeded(300+vi); let x=kx+dx*10, y=ky+dy*13;
    for(let n=0;n<110&&x>6&&x<154&&y>2&&y<H-2;n++){ v.push([x|0,y|0]);
      if(dy!==0&&rr()<.72) y+=dy; else x+=dx!==0?dx:(rr()<.5?-1:1);
      if(rr()<.08) x+=rr()<.5?-1:1; if(dy===0&&rr()<.3) y+=rr()<.5?-1:1; }
    veins.push(v); });
  c.veins=veins; return c; }

/* ---------- piezas de la intro ---------- */
function tiFlash(t){ for(let b=0;b<TI_BOLTS.length;b++){ const u=t-TI_BOLTS[b]; if(u>=0&&u<12) return {b,u,k:u===0?1:u<3?.9:[0,0,0,.55,.42,.32,.24,.17,.11,.07,.04,.02][u]}; } return null; }
function tiLine(x0,y0,x1,y1){ const n=Math.max(1,Math.abs(x1-x0),Math.abs(y1-y0)); for(let i=0;i<=n;i++) ctx.fillRect(Math.round(x0+(x1-x0)*i/n),Math.round(y0+(y1-y0)*i/n),1,1); }
function tiBolt(b){ for(const [col,o] of [['rgba(170,196,255,.55)',1],['#ffffff',0]]){ const r=seeded(91+b*7); let x=[44,16,132][b], y=-2; ctx.fillStyle=col;
    while(y<[98,80,92][b]){ const nx=x+Math.round((r()-.5)*14), ny=y+5+((r()*5)|0); tiLine(x+o,y,nx+o,ny); tiLine(x-o,y,nx-o,ny);
      if(r()<.32){ let bx=nx, by=ny; const dir=r()<.5?-1:1; for(let k=0;k<3;k++){ const bx2=bx+dir*(3+((r()*5)|0)), by2=by+3+((r()*4)|0); tiLine(bx,by,bx2,by2); bx=bx2; by=by2; } }
      x=nx; y=ny; } } }
function tiRainDraw(t,k,slant){ for(let i=0;i<Math.round(78*k);i++){ const h=hash(i,7), sp=5+(h&3), len=3+((h>>4)&3), x0=(h>>7)%200, y0=(h>>15)%170;
    const y=((y0+t*sp)%170)-10, x=((x0-t*sp*slant)%200+200)%200-20; ctx.fillStyle=i%3?'rgba(140,160,214,.42)':'rgba(196,212,255,.62)';
    for(let j=0;j<len;j++) ctx.fillRect(Math.round(x+j*slant),Math.round(y-j),1,1); } }
function tiStreaks(t,n,y0,h,col,sp,off){ ctx.fillStyle=col; for(let i=0;i<n;i++){ const L=6+(i%4)*5, y=y0+((i*37)%h), x=((i*53+(off||0)-t*sp)%240+240)%240-40; ctx.fillRect(Math.round(x),y,L,1); } }
function tiEye(cx,cy,h,k,left){ glowAt(cx,cy,13,'rgba(100,214,255,'+(.5*k).toFixed(2)+')'); ctx.globalAlpha=k; // un ojo de hielo rasgado: el lagrimal, más bajo
  const S=[[0,4],[0,7],[0,10],[1,10],[3,10]], rows=S.slice(5-Math.min(5,h));
  rows.forEach(([a,b],r)=>{ const x0=left?cx-5+a:cx+5-b, w=b-a; ctx.fillStyle=r===rows.length-1&&h>1?'#6fd8ff':'#effdff'; ctx.fillRect(x0,cy-h+r,w,1); });
  if(h>=3){ ctx.fillStyle='#1a3a6a'; ctx.fillRect(left?cx-3:cx+1,cy-3,2,2); } // las pupilas, abajo a la izquierda: miran al Roble
  ctx.globalAlpha=1; }
function tiSeedDot(x,y,tw){ x=Math.round(x); y=Math.round(y); glowAt(x+1,y+1,6,'rgba(255,214,110,.45)'); ctx.fillStyle='#7a4a10'; ctx.fillRect(x,y+1,3,2); ctx.fillStyle=tw?'#fff4b0':'#f8c848'; ctx.fillRect(x,y,3,2); ctx.fillStyle='#fffbe0'; ctx.fillRect(x,y,1,1); if(tw) caStar(x+1,y,3,'#fffbe0'); }
function tiWindPos(t){ // el Viento: sale de las nubes, se lanza, sopla y se va tras las semillas
  if(t<TI_BLOW) return [caK(t,[[TI_DIVE,104],[TI_BLOW,142,'out']]),caK(t,[[TI_DIVE,16],[TI_DIVE+11,56,'in'],[TI_BLOW,46,'out']]),'howl'];
  if(t<TI_GONE) return [142+Math.round(Math.sin(t*.21)),46+Math.round(Math.sin(t*.13)*2),'blow'];
  return [caK(t,[[TI_GONE,142],[TI_GONE+20,-56,'in']]),caK(t,[[TI_GONE,46],[TI_GONE+8,36,'io'],[TI_GONE+20,6,'in']]),'storm']; }
function tiOakAmpStorm(t){ return t<TI_DIVE?.8:t<TI_BLOW?1.4:t<TI_GONE?1.4+4.4*CA_EASE.out(caSeg(t,TI_BLOW,TI_BLOW+12)):5.8-4.6*CA_EASE.out(caSeg(t,TI_GONE,TI_GONE+22)); }

/* plano 1: la tormenta sobre el valle del título */
function tiStormScene(t,sil){ const A=tiArt(), ph=t*.06, amp=tiOakAmpStorm(t);
  if(t>=TI_BLOW&&t<TI_GONE){ const k=t<TI_BLOW+10?2:1; ctx.translate(((t*7)%3-1)*k*((t&1)?1:0),0); }
  if(sil){ ctx.fillStyle='#8e9cd0'; ctx.fillRect(0,0,160,144); }
  else ctx.drawImage(A.sky,0,0);
  const fl=tiFlash(t), lit=fl&&!sil&&fl.u>=3?fl.k:0, c1=-Math.round((t*.5)%320), c2=-Math.round((t*1.3)%320);
  ctx.drawImage(sil?A.cfL:A.cf,c1,4); ctx.drawImage(sil?A.cfL:A.cf,c1+320,4);
  if(lit){ ctx.globalAlpha=lit; ctx.drawImage(A.cfL,c1,4); ctx.drawImage(A.cfL,c1+320,4); ctx.globalAlpha=1; }
  if(sil&&fl&&fl.b===0){ ctx.drawImage(A.giantS,112-66,24-51); for(const ex of [97,127]){ ctx.fillStyle='#ffffff'; ctx.fillRect(ex-4,26,9,2); ctx.fillRect(ex+(ex<110?-4:1),25,4,1); } } // el gigante en las nubes, un instante
  if(!sil&&t>TI_BOLTS[0]&&t<TI_DIVE+8){ const k=(t<TI_EYES?1-(t-TI_BOLTS[0])/14:.45)*(t<TI_DIVE?1:1-(t-TI_DIVE)/8); ctx.globalAlpha=Math.max(0,.7*k); ctx.drawImage(A.giant,112-66,24-51); ctx.globalAlpha=1; } // la sombra del gigante: el relámpago la dejó marcada
  ctx.drawImage(sil?A.cnL:A.cn,c2,-6); ctx.drawImage(sil?A.cnL:A.cn,c2+320,-6);
  if(lit){ ctx.globalAlpha=lit*.8; ctx.drawImage(A.cnL,c2,-6); ctx.drawImage(A.cnL,c2+320,-6); ctx.globalAlpha=1; }
  if(!sil&&t>=TI_EYES&&t<TI_DIVE+6){ const u=t-TI_EYES, h=u<2?1:u<4?3:(u>=8&&u<11)?1:t>=TI_DIVE-5?3:5, k=t<TI_DIVE?1:1-(t-TI_DIVE)/6; // los ojos se abren, parpadean y se entornan
    tiEye(97,27,h,k,true); tiEye(127,27,h,k,false); }
  ctx.drawImage(sil?A.sMount:A.mount,-40,52); ctx.drawImage(sil?A.sHills:A.hills,-90,66);
  const grey=t>=TI_GONE?CA_EASE.io(caSeg(t,TI_GONE+2,TI_GONE+18)):0;
  ctx.drawImage(sil?A.sHill:A.hill,0,94); if(!sil) drawShadow(80,118,26);
  roblePaint(sil?A.sOak:A.oak,TI_OAKX,TI_OAKY,amp,ph);
  if(grey>0&&!sil){ ctx.save(); ctx.globalAlpha=grey; roblePaint(A.oakG,TI_OAKX,TI_OAKY,amp,ph); ctx.restore(); } // sin semillas se apaga
  ROBLE_SEEDS.forEach(([ax,ay],i)=>{ if(t>=TI_PLUCK[i]) return; const x=TI_OAKX+ax+robleSwayOff(ay,amp,ph), y=TI_OAKY+ay;
    if(sil){ ctx.fillStyle='#ffffff'; ctx.fillRect(x,y,3,2); return; } tiSeedDot(x,y,(((t>>2)+i*3)%11)===0); });
  if(t>=TI_DIVE&&t<TI_GONE+22){ const [wx,wy,mood]=tiWindPos(t), img=windArt({s:1.3,mood,f:(t>>2)&7});
    if(t>=TI_BLOW&&t<TI_GONE&&!sil) tiStreaks(t,16,wy-12,26,'rgba(222,236,255,.72)',8,0); // el soplido
    ctx.save(); if(t<TI_DIVE+7&&!sil) ctx.globalAlpha=(t-TI_DIVE+1)/8; ctx.drawImage(sil?tiBlack(img):img,Math.round(wx-22*1.3),Math.round(wy-17*1.3)); ctx.restore(); }
  if(!sil) ROBLE_SEEDS.forEach(([ax,ay],i)=>{ const u=t-TI_PLUCK[i]; if(u<0||u>34) return; const F=TI_FLIGHT[i], x0=TI_OAKX+ax, y0=TI_OAKY+ay; // arrancadas: cometas valle afuera
    const at=v=>{ const a=F.a+F.c*v, d=v*1.9*F.sp+v*v*.11*F.sp; return [x0+Math.cos(a)*d,y0+Math.sin(a)*d-Math.sin(Math.min(1,v/14)*Math.PI)*6]; };
    for(let q=9;q>=1;q--){ const [x,y]=at(Math.max(0,u-q*1.1)); ctx.fillStyle=q<3?'rgba(255,236,160,.85)':'rgba(255,200,90,'+(.62-q*.07).toFixed(2)+')'; ctx.fillRect(Math.round(x),Math.round(y),q<3?2:1,q<3?2:1); }
    const [x,y]=at(u); tiSeedDot(x-1,y-1,u<3); if(u<4) caStar(x0+1,y0,4-u,'#fffbe0'); });
  if(!sil){ const slant=t>=TI_BLOW&&t<TI_GONE+10?.55:.32; tiStreaks(t,t>=TI_BLOW&&t<TI_GONE?9:5,20,90,'rgba(200,214,244,.35)',t>=TI_BLOW?6:3,17); tiRainDraw(t,1,slant); }
  if(fl&&fl.u>=1&&fl.u<4) tiBolt(fl.b); }
/* plano 2: el tronco de cerca; la semilla escondida late */
function tiLight(t){ let v=0; TI_BEATS.forEach((T,i)=>{ const u=t-T, k=i>=2?1.35:1; if(u>=-2&&u<14) v+=k*(u<0?(u+2)/2:Math.exp(-u/5)); });
  const hide=t>=146&&t<164?Math.min(1,(t-146)/5,(164-t)/4):0; return Math.max(0,v*(1-hide*.9))+.12*(1-hide)+(t>=164?caSeg(t,164,182)*1.4:0); }
function tiTrunk(t){ const A=tiArt(), B=A.bark, off=Math.round(caK(t,[[TI_TRUNK,16],[TI_BURST,0,'out']])), [kx,ky0]=TI_KNOT, ky=ky0+off-28, L=tiLight(t);
  let sx=0, sy=0; if(t>=164){ const s=Math.round(caSeg(t,164,182)*2.4); sx=((t*7)%3-1)*s; sy=((t*5)%3-1)*(s>>1); }
  ctx.save(); ctx.translate(sx,sy); ctx.drawImage(B,0,off-28);
  // la semilla, al fondo del hueco, y su luz
  glowAt(kx,ky+3,10+L*14,'rgba(255,208,110,'+Math.min(.85,.2+L*.4).toFixed(2)+')');
  ctx.save(); ctx.beginPath(); ctx.rect(kx-10,ky-13,20,27); ctx.clip(); ctx.globalAlpha=Math.min(1,.35+L*.6); ctx.drawImage(ACORN_GOLD,kx-4,ky+3); ctx.restore();
  // las venas de savia: se encienden desde el hueco con cada latido; al final se rajan hasta los bordes
  const reach=L*16+(t>=170?caSeg(t,170,182)*120:0), crack=t>=170;
  B.veins.forEach((v,vi)=>{ const n=Math.min(v.length,Math.round(reach*(.8+(vi%3)*.15))); for(let j=0;j<n;j++){ const [x,y]=v[j], tip=j>n-4;
    ctx.fillStyle=tip?'#fffbe0':crack&&j<n*.5?'#fff0b0':'#f8c040'; ctx.fillRect(x,y+off-28,1,1); if(crack&&j%9===0) ctx.fillRect(x+1,y+off-28,1,1); } });
  // pasa su sombra (el Viento la busca): viento, oscuro, y la luz se esconde
  if(t>=144&&t<166){ const x=Math.round(210-(t-144)*14); ctx.fillStyle='rgba(2,3,10,.5)'; for(let y=0;y<144;y++){ const e=x+((y*7)%5); ctx.fillRect(e-50,y,70,1); } tiStreaks(t,14,8,120,'rgba(214,228,255,.55)',10,5); }
  tiRainDraw(t,.7,.3);
  if(t>=176){ const k=caSeg(t,176,TI_BURST); caRays(kx,ky+3,14,t*.01,'#fff4c0',null,k*.8,40+k*160); }
  ctx.restore(); }
/* el valle del título (lo que sale en el menú, sin rótulos): para la revelación en gris */
function tiWorld(cam){ drawSeasonWorld(cam); tiSeedLights(); if(cam>0) drawPots(cam,Math.round((1-cam)*40)); tiMotes(); drawParts(); drawLogo(-Math.round(cam*56),1-cam); }
/* un dibujo en un lienzo aparte (para mezclar el valle gris con el de color) */
let TI_B1=null, TI_B2=null;
function tiRender(fn){ if(!TI_B1){ TI_B1=mkCanvas(160,144); TI_B2=mkCanvas(160,144); } const keep=ctx; ctx=TI_B1.getContext('2d'); ctx.imageSmoothingEnabled=false;
  ctx.setTransform(1,0,0,1,0,0); ctx.globalAlpha=1; ctx.globalCompositeOperation='source-over'; ctx.fillStyle='#000'; ctx.fillRect(0,0,160,144); try{ fn(); } finally { ctx=keep; } return TI_B1; }
function tiGreyOf(src){ const g=TI_B2.getContext('2d'); g.globalAlpha=1; g.globalCompositeOperation='source-over'; g.drawImage(src,0,0);
  const id=g.getImageData(0,0,160,144), d=id.data; for(let i=0;i<d.length;i+=4){ const v=62+(d[i]*.3+d[i+1]*.59+d[i+2]*.11)*.62; d[i]=v-3; d[i+1]=v; d[i+2]=v+9; }
  g.putImageData(id,0,0); return TI_B2; }
/* el filo de un círculo, píxel a píxel y sin huecos */
function tiRing(cx,cy,r,col,a){ if(r<=0||a<=0) return; ctx.globalAlpha=Math.min(1,a); ctx.fillStyle=col; let pl=null, pr=null;
  for(let y=Math.max(0,Math.floor(cy-r));y<=Math.min(143,Math.ceil(cy+r));y++){ const dy=y+.5-cy, h=r*r-dy*dy; if(h<=0){ pl=pr=null; continue; } const w=Math.sqrt(h), l=Math.round(cx-w), rr=Math.round(cx+w)-1;
    if(pl===null){ ctx.fillRect(l,y,rr-l+1,1); } else { ctx.fillRect(Math.min(l,pl),y,Math.abs(l-pl)+1,1); ctx.fillRect(Math.min(rr,pr),y,Math.abs(rr-pr)+1,1); }
    pl=l; pr=rr; } ctx.globalAlpha=1; }
function tiBars(h){ h=Math.round(h); if(h<=0) return; ctx.fillStyle='#000'; ctx.fillRect(0,0,160,h); ctx.fillRect(0,144-h,160,h); }
/* la bellota en vuelo: del tronco del Roble al hueco de la O */
function tiAcornFlight(t){ const u=t-TI_FLY; if(u<0) return; const x=caK(t,[[TI_FLY,80],[TITLE_LAND,TI_AX,'io']]), y=caK(t,[[TI_FLY,104],[TITLE_LAND-3,TI_AY-8,'out'],[TITLE_LAND,TI_AY,'in']]);
  for(let q=1;q<=6;q++){ const yy=caK(t-q,[[TI_FLY,104],[TITLE_LAND-3,TI_AY-8,'out'],[TITLE_LAND,TI_AY,'in']]), xx=caK(t-q,[[TI_FLY,80],[TITLE_LAND,TI_AX,'io']]); if(t-q<TI_FLY) break;
    ctx.fillStyle=q<3?'#fff4c0':'rgba(255,200,90,'+(.7-q*.1).toFixed(2)+')'; ctx.fillRect(Math.round(xx)-1,Math.round(yy)+6,q<3?3:2,2); }
  glowAt(x,y,16,'rgba(255,226,140,.6)'); ctx.drawImage(TI_ACORN,Math.round(x-11),Math.round(y-13)); caStar(x,y-14,2+((t>>1)&1),'#fffbe0'); }

/* ---------- la intro entera (antes de posarse) ---------- */
function tiDrawIntro(t){
  if(t<TI_TRUNK){ const fl=tiFlash(t);
    if(fl&&fl.u===0){ ctx.fillStyle='#eef4ff'; ctx.fillRect(0,0,160,144); }
    else { ctx.save(); tiStormScene(t,!!(fl&&fl.u<3)); ctx.restore(); }
    if(fl&&fl.u>=3){ ctx.fillStyle='rgba(200,216,255,'+(fl.k*.5).toFixed(2)+')'; ctx.fillRect(0,0,160,144); }
    if(t<10){ ctx.fillStyle='rgba(0,0,0,'+(1-t/10).toFixed(2)+')'; ctx.fillRect(0,0,160,144); } }
  else if(t<TI_BURST){ tiTrunk(t); const fl=tiFlash(t); if(fl&&fl.u>=3){ ctx.fillStyle='rgba(200,216,255,'+(fl.k*.5).toFixed(2)+')'; ctx.fillRect(0,0,160,144); } }
  else if(t<TI_FLY-2){ ctx.fillStyle='#fffbe8'; ctx.fillRect(0,0,160,144); }
  else { const col=tiRender(()=>tiWorld(0)); ctx.drawImage(tiGreyOf(col),0,0); tiAcornFlight(t);
    const w=1-caSeg(t,TI_FLY-2,TI_FLY+6); if(w>0){ ctx.fillStyle='rgba(255,251,232,'+w.toFixed(2)+')'; ctx.fillRect(0,0,160,144); } }
  tiBars(14);
}

/* ---------- el título ---------- */
function drawTitle(){
  const t=titleT; if(t<TITLE_LAND){ tiDrawIntro(t); return; }
  const cam=titleCam, u=t-TITLE_LAND, r=tiWave(u);
  if(r<190){ const col=tiRender(()=>tiWorld(cam)); ctx.drawImage(tiGreyOf(col),0,0); ctx.save(); proClipCircle(TI_AX,TI_AY,r); ctx.drawImage(col,0,0); ctx.restore();
    tiRing(TI_AX,TI_AY,r,'#fffbe0',1-u/40); tiRing(TI_AX,TI_AY,r-3,'#f8d060',.6-u/60); }
  else tiWorld(cam);
  if(u<18){ const rr=Math.round(4+u*3.2); ctx.drawImage(ringArt(rr,'#fffbe0',2),TI_AX-rr-1,TI_AY-rr-1); if(u<10){ const r2=Math.round(u*5.5); ctx.drawImage(ringArt(r2,'#f8d060'),TI_AX-r2-1,TI_AY-r2-1); } } // el golpe
  if(u<4){ ctx.fillStyle='rgba(255,251,232,'+(.55-u*.14).toFixed(2)+')'; ctx.fillRect(0,0,160,144); }
  tiBars(14*(1-CA_EASE.out(caSeg(u,2,16))));
  tiPrompt(cam);
}
/* la placa «PULSA Z»: entra de un salto, late con el compás y la Z se hunde en cada tiempo */
function tiPrompt(cam){ if(titleT<TITLE_MENU||cam>=1) return; const k=Math.min(1,(titleT-TITLE_MENU)/14), A=(1-cam), b=titleBeat(), fr=b-Math.floor(b), p=fr<.14?1:0;
  const e=easeOutBack(k), w=58, x=80-w/2, y=113+Math.round(cam*30)+Math.round((1-e)*22)+p;
  ctx.save(); ctx.globalAlpha=Math.min(1,k*2)*A;
  roundBox(x-1,y-1,w+2,15,PAL.k); roundBox(x,y,w,13,p?'#326a38':'#2a5a30'); ctx.fillStyle='#4a8a48'; ctx.fillRect(x+1,y+1,w-2,1); ctx.fillStyle='#16361c'; ctx.fillRect(x+1,y+11,w-2,1);
  const sh=((titleT-TITLE_MENU)%(Math.round(TITLE_BAR*2))); if(sh<16){ const sx=x-6+sh*5; ctx.fillStyle='rgba(255,255,230,.35)'; for(let i=0;i<11;i++) ctx.fillRect(sx+10-i,y+1+i,3,1); } // un brillo que cruza
  txtO('PULSA',x+8,y+3,'#fffbe8','left','#0c2010'); const zb=Math.floor(b)&1; badge('Z',x+w-18,y+2+(p&&zb?1:0));
  if(p&&zb){ ctx.fillStyle='rgba(255,246,190,.9)'; ctx.fillRect(x+w-12,y-2,1,2); ctx.fillRect(x+w-7,y-1,1,1); ctx.fillRect(x+w-17,y-1,1,1); } // chispas del botón
  const si=menuSeason(); seasonIcon(si,4,135); txtSO(SEASONS[si].name,13,136,'#fff6d0','left','#1a1408'); txtSO('M MÚSICA',156,136,'#dff0d8','right','#0c1a08');
  ctx.restore(); }

/* ---------- el logo vivo ---------- */
const TI_ACORN=(()=>{ const c=mkCanvas(LOGO_ACORN.width,LOGO_ACORN.height), g=c.getContext('2d'); g.drawImage(LOGO_ACORN,0,0); g.clearRect(13,0,6,4); return c; })(); // sin la hojita: le van a salir las de Sprout
const TI_ACORN_D=darken(TI_ACORN), TI_ACORN_W=whiten(TI_ACORN);
const TI_LEAVES=sprN(HERO_ROWS.down.leaves,HERO_PAL); // las dos hojas de Sprout
const TI_LEAF=[sprN(['..kk..','.kOOk.','kOoOOk','kOOoOk','.kOOk.','..kk..','..k...'],{O:'#e8903a',o:'#b8561c'}), // una hoja seca, en dos giros
  sprN(['.kkk..','kOOOk.','kOoOOk','.kOOoOk','..kOOk','...kk.','....k.'].map(r=>r.slice(0,7).padEnd(7,'.')),{O:'#f0a848',o:'#c86424'})];
/* el borde de arriba de cada letra (para la nieve del invierno) */
const TI_TOPS=LOGO_GLYPHS.map(gl=>{ const c=gl.img, d=c.getContext('2d').getImageData(0,0,c.width,c.height).data, out=[];
  for(let x=0;x<c.width;x++){ for(let y=0;y<c.height;y++) if(d[(y*c.width+x)*4+3]>0){ out.push([x,y]); break; } } return out; });
function tiLeaves(cx,by,g,sw,pop){ if(g<=0) return; const rows=Math.min(5,Math.ceil(g*5)), ox=Math.round(cx-8);
  for(let r=5-rows;r<5;r++){ const s=Math.round(sw*[1,1,.6,.3,0][r]); ctx.drawImage(TI_LEAVES,0,r,16,1,ox+s,by-5+r-pop,16,1); } }
function drawLogo(oy,A){
  if(A<=0) return; const t=titleT, u=t-TITLE_LAND, b=titleBeat(), fr=b-Math.floor(b), S=tiSeason();
  const pos=i=>{ const gl=LOGO_GLYPHS[i]; return [LOGO_POS[i]+Math.round(tiSwayX(i)),LOGO_Y+gl.dy+Math.round(tiHopY(TI.hops,i))+oy]; };
  // la sombra y las letras (la O es la bellota: va aparte)
  for(let i=0;i<6;i++){ if(i===3) continue; const [x,y]=pos(i); ctx.globalAlpha=.35*A; ctx.drawImage(LOGO_GLYPHS[i].dark,x+2,y+4); }
  ctx.globalAlpha=A; for(let i=0;i<6;i++){ if(i===3) continue; const [x,y]=pos(i); ctx.drawImage(LOGO_GLYPHS[i].img,x,y); }
  // la estación, en el logo: nieve en invierno, una hoja seca en otoño
  if(!S.first&&S.si===3&&t>=TITLE_MENU){ const h=S.w<40?0:S.w<120?1:2; if(h) for(let i=0;i<6;i++){ if(i===3) continue; const [x,y]=pos(i); ctx.fillStyle='#ffffff';
      for(const [tx,ty] of TI_TOPS[i]){ if(tx<1||tx>=LOGO_GLYPHS[i].img.width-4) continue; ctx.fillRect(x+tx,y+ty-h,1,h); } ctx.fillStyle='#cfe4ff'; ctx.fillRect(x+4,y+2,1,1); } }
  if(!S.first&&S.si===2&&S.w>50&&t>=TITLE_MENU){ for(const i of [0,5]){ const [x,y]=pos(i), fall=Math.max(0,1-(S.w-50)/30), yy=Math.round(y-1-fall*30), xx=Math.round(x+6+Math.sin(S.w*.2+i)*fall*6);
      ctx.drawImage(TI_LEAF[fall>0?(S.w>>3)&1:i&1],xx,yy-4); } }
  // el brillo que recorre las letras, cada cuatro compases
  if(t>=TITLE_MENU){ const cyc=((b%16)+16)%16; if(cyc>=2&&cyc<3.2){ const k=(cyc-2)/1.2, gx=LOGO_X-8+k*140; ctx.save(); ctx.beginPath(); ctx.moveTo(gx,LOGO_Y-4+oy); ctx.lineTo(gx+9,LOGO_Y-4+oy); ctx.lineTo(gx-7,LOGO_Y+30+oy); ctx.lineTo(gx-16,LOGO_Y+30+oy); ctx.closePath(); ctx.clip();
      ctx.globalAlpha=.85*A; for(let i=0;i<6;i++){ if(i===3) continue; const [x,y]=pos(i); ctx.drawImage(LOGO_GLYPHS[i].white,x,y); } ctx.restore(); } }
  // la bellota: late con el compás y lleva las hojas de Sprout
  if(t>=TITLE_LAND){ const [x0,y0]=pos(3), hb=Math.max(0,1-fr*3.2)*(u>=0?1:0), land=u<6?[1.2,1.14,.92,1.04,1,1][u]:1, sq=land!==1?land:1-hb*.06;
    ctx.globalAlpha=A; glowAt(x0+11,y0+14,11+hb*5,'rgba(255,222,130,'+(.2+hb*.22).toFixed(2)+')');
    ctx.globalAlpha=.35*A; ctx.drawImage(TI_ACORN_D,x0+2,y0+4); ctx.globalAlpha=A;
    if(Math.abs(sq-1)>.01){ ctx.save(); ctx.translate(x0+11,y0+26); ctx.scale(1/sq,sq); ctx.drawImage(TI_ACORN,-11,-26); ctx.restore(); } else ctx.drawImage(TI_ACORN,x0,y0);
    if(u<5){ ctx.globalAlpha=A*(1-u/5); ctx.drawImage(TI_ACORN_W,x0,y0); ctx.globalAlpha=A; }
    const g=t<TI_LEAF_T?0:Math.min(1,(t-TI_LEAF_T)/8), pop=t>=TI_LEAF_T+8&&t<TI_LEAF_T+14?[1,2,2,1,1,0][t-TI_LEAF_T-8]:0;
    const sw=Math.sin(tick*.06)*.9+tiSwayX(6)*1.6+(hb>.6?.6:0); tiLeaves(x0+11,y0+1,g,sw,pop); }
  // la cinta del subtítulo: se desenrolla desde el centro
  const rk=t<TI_RIB?0:Math.min(1,(t-TI_RIB)/12);
  if(rk>0){ const W=textW('Y LAS 8 SEMILLAS')+14, w=Math.max(4,Math.round(W*easeOutBack(rk))), y=38+oy;
    ctx.save(); ctx.globalAlpha=A; if(rk<1){ ctx.beginPath(); ctx.rect(80-w/2-9,y-2,w+18,20); ctx.clip(); } ribbon(80,y,rk<1?w:W,'Y LAS 8 SEMILLAS'); ctx.restore(); }
  ctx.globalAlpha=1; }
/* las ocho semillas, lejos, por el valle: se encienden tras la cinta y centellean por turnos con la música */
function tiSeedLights(){ const t=titleT, b=titleBeat();
  TI_SEEDS.forEach(([x,y],i)=>{ const t0=TI_SEED_T(i); if(t<t0) return; const u=t-t0, tw=(((Math.floor(b)%16)+16)%16)===i*2?b-Math.floor(b):-1;
    glowAt(x+.5,y+.5,4,'rgba(255,214,110,.4)'); ctx.fillStyle=(u<6||tw>=0&&tw<.5)?'#fffbe0':'#f0b838'; ctx.fillRect(x,y,1,1);
    if(u<10) caStar(x,y,Math.round((10-u)*.5),'#fffbe0'); else if(tw>=0&&tw<.6) caStar(x,y,tw<.2?2:1,'#fff4c0'); }); }
/* mariposas en primavera y verano; nada en otoño e invierno */
function tiMotes(){ const S=tiSeason(); if(S.si>1||titleT<TITLE_LAND+30) return;
  for(let i=0;i<2;i++){ const T=tick*.9+i*300, x=Math.round(50+i*60+Math.sin(T*.013+i)*30+Math.sin(T*.041)*9), y=Math.round(104+Math.sin(T*.023+i*2)*10+Math.sin(T*.07)*3), fl=(tick>>2)&1, c=S.si?['#f8a030','#fff0a0'][i]:['#fffbe8','#f8a0d0'][i];
    ctx.fillStyle='#2a1c10'; ctx.fillRect(x,y,1,2); ctx.fillStyle=c; if(fl){ ctx.fillRect(x-2,y-1,2,2); ctx.fillRect(x+1,y-1,2,2); } else { ctx.fillRect(x-1,y,1,2); ctx.fillRect(x+1,y,1,2); } } }

/* ---------- Sprout en el título ---------- */
function tiEmote(kind,x,y){ if(kind==='!'){ txtOL('!',x,y,'#ffe070','center'); } else if(kind==='?'){ txtOL('?',x,y,'#e8f0ff','center'); } else if(kind==='note') proNote(x-2,y,'#fff6c0'); }
function tiHeroPose(){ const t=titleT, w=TITLE_LAND+TI_HERO_U;
  if(t<w) return {img:P_BLINK[3]}; // dormido: gris, con los ojos cerrados
  const u=t-w; if(t<TITLE_MENU){ if(u<20) return {img:u<5?P_BLINK[3]:P_SPRITES[3][1],hop:Math.round(Math.sin(u/20*Math.PI)*8),emote:'!',ey:Math.max(0,6-u)};
    const b=titleBeat(); if(b>=4){ const bi=Math.floor(b); return {img:bi%2===0?H_LIFT:P_SPRITES[0][0],emote:'note'}; } return {img:P_SPRITES[3][0]}; }
  const g=tick-TI.go; if(g>=0&&g<40){ const k=g/26; return {img:g<26?H_LIFT:P_SPRITES[0][0],hop:g<26?Math.round(Math.sin(k*Math.PI)*14):0,sq:g>=26&&g<34?(34-g)/8:0,emote:'!'}; }
  const L=TI.look; if(L&&tick-L.t<48){ const lu=tick-L.t; return {img:(lu>6&&lu<10)?P_BLINK[L.dir]||P_SPRITES[L.dir][0]:P_SPRITES[L.dir][lu<8?1:0],hop:lu<10?Math.round(Math.sin(lu/10*Math.PI)*4):0,emote:L.dir===1?'?':null}; }
  const HL=TI.heroLeaf; if(HL){ const lt=tick-HL.t; if(lt>=0&&lt<14) return {img:P_SPRITES[0][0],emote:'?',ey:Math.max(0,4-lt)}; if(lt>=HL.stay-14&&lt<HL.stay+2) return {img:P_SPRITES[0][(tick>>2)&1],shiver:true}; } // la hoja en la cabeza: «¿?» y se la sacude
  const S=tiSeason(); if(!S.first&&S.w<24) return {img:S.w>2?P_SPRITES[0][1]:P_SPRITES[0][0],hop:Math.round(Math.sin(S.w/24*Math.PI)*8),emote:'!',ey:Math.max(0,8-S.w)};
  const b=titleBeat(), bar=Math.floor(b/4), bi=((Math.floor(b)%4)+4)%4, fr=b-Math.floor(b), cyc=((bar%8)+8)%8, bop=fr<.16?1:0, winter=S.si===3&&!S.first;
  const blink=((tick+40)%170)<6;
  if(cyc===3){ return {img:bi%2===0?H_LIFT:P_SPRITES[0][0],sq:bop*.1,emote:bi===0&&fr<.7?'note':null}; } // saluda
  if(cyc===4||cyc===5){ const d=bi%2?2:3; return {img:P_SPRITES[d][fr<.5?1:0],hop:Math.round(Math.sin(fr*Math.PI)*4),sq:fr>.85?.12:0,emote:cyc===4&&bi===0?'note':null}; } // baila
  if(cyc===6){ const k=(b-bar*4)/1.4; if(k<1) return {img:H_LIFT,hop:Math.round(Math.sin(k*Math.PI)*10),emote:'note'}; return {img:blink?P_BLINK[0]:P_SPRITES[0][0],sq:k<1.25?.14:bop*.08}; }
  if(cyc===2){ return {img:blink||bi===2&&fr<.2?P_BLINK[0]:P_SPRITES[0][0],sq:bop*.08,shiver:winter}; }
  return {img:blink?P_BLINK[3]:P_SPRITES[3][0],sq:bop*.08,shiver:winter}; }
function drawTitleHero(hy,alpha){
  if(alpha<=0) return; const P=tiHeroPose(), hop=P.hop||0, sq=P.sq||0, sh=P.shiver&&((tick>>1)&1)?1:0, x=12+sh;
  ctx.save(); ctx.globalAlpha=alpha; drawShadow(28,hy+36,Math.max(4,8-hop*.6));
  if(sq>0){ ctx.translate(x+16,hy+38); ctx.scale(1+sq*.9,1-sq); ctx.drawImage(P.img,-16,-32,32,32); ctx.restore(); ctx.save(); ctx.globalAlpha=alpha; }
  else ctx.drawImage(P.img,x,hy+6-hop,32,32);
  if(TI.heroLeaf){ const lt=tick-TI.heroLeaf.t, st=TI.heroLeaf.stay; // una hoja seca le cae en la cabeza, se queda un rato y se la sacude
    if(lt>-44&&lt<st+34){ const fall=lt<0, off=lt>=st, fx=fall?x+11+Math.sin(lt*.18)*6:off?x+11+(lt-st)*2.2:x+11, fy=fall?hy-2-hop+lt*1.3:off?hy-2-hop-(lt-st)*1.2+(lt-st)*(lt-st)*.02:hy-2-hop;
      ctx.drawImage(TI_LEAF[fall||off?(tick>>3)&1:0],Math.round(fx),Math.round(fy)); } }
  ctx.restore();
  if(P.emote&&alpha>.5){ const b=P.ey||0; tiEmote(P.emote,28,hy-8-hop-b); }
}

/* ---------- las ráfagas: cada cuatro compases, a mitad de la estación, cruza una de izquierda a derecha ---------- */
function tiGust(){ if(titleT<TITLE_MENU) return null; const b=titleBeat(), n=Math.floor((b-8)/16), b0=n*16+8, u=(b-b0)*(TITLE_BAR/4); if(u<0||u>90) return null;
  return {x:Math.round(-24+u*4.4),u:u-(80+24)/4.4}; } // u: fotogramas desde que pasó por el Roble
function tiGustDraw(){ const g=tiGust(); if(!g) return; const S=tiSeason(), G=SEASONS[S.si].ground; ctx.fillStyle=G[3];
  for(let i=0;i<16;i++){ const x=g.x-((i*7)%22), y=102+((i*13)%38); if(x<-2||x>162) continue; ctx.fillRect(x,y,1,1); ctx.fillRect(x+1,y-1,1,1); ctx.fillRect(x+2,y-1,2,1); } // la hierba se dobla
  ctx.fillStyle='rgba(255,255,255,.45)'; for(let i=0;i<3;i++){ const x=g.x-10-i*16, y=44+i*13; ctx.fillRect(x,y,10+i*4,1); } }

/* ---------- la actualización ---------- */
function updTitle(){
  if(fontsReady) titleT++;
  titleCam=Math.max(0,titleCam-1/22);
  const t=titleT;
  if(TI.rain&&t>=TI_BURST) tiRain(false);
  if(t<TITLE_MENU) tiIntroTick(t);
  tiMenuTick();
  updParts();
  // las flechas: Sprout mira hacia allí y da un saltito
  const d=keys.left?2:keys.right?3:keys.up?1:keys.down?0:-1;
  if(d!==TI.lastDir){ TI.lastDir=d; if(d>=0&&t>=TITLE_MENU){ TI.look={dir:d,t:tick}; if(AC) beep('square',520+d*60,700+d*60,.06,.02); } }
  if(keys.fire||keys.alt){ keys.fire=false; keys.alt=false; audio(true);
    if(t<TITLE_MENU) tiSkip();
    else { slotCache=[readSlot(0),readSlot(1),readSlot(2)]; fileSel=Math.max(0,slotCache.findIndex(d=>d)); fileConfirm=false; fileUD=0; state='file'; fileT=0; FS={ph:'pick',t:0}; fileHop=[-99,-99,-99]; fileDelT=[0,0,0]; fileWake[fileSel]=tick+30; fileSpotX=FILE_POT_X[fileSel];
      TI.go=tick; for(let i=0;i<7;i++) tiHop(TI.hops,i,6,12); for(let i=0;i<14;i++){ const a=i/14*6.283; parts.push({k:'leafF',x:80+Math.cos(a)*20,y:120,vx:Math.cos(a)*1.6,vy:-1-Math.random()*1.4,life:60,max:60,nog:false,sway:Math.random()*6,col:i&1?'#78d838':'#d0f890'}); }
      if(AC){ SFX.blip(); SFX.menuIn(); } } }
}
function tiSkip(){ tiRain(false); parts=[]; titleT=TITLE_MENU; if(curTrack!=='titulo') setTrack('titulo'); if(AC) SFX.blip(); }
function tiIntroTick(t){
  if(t===TITLE_LAND-8){ setTrack('titulo'); if(AC) nextNoteT=AC.currentTime+8/60; } // el tema entra justo al posarse la bellota
  if(!AC) return;
  if(t===2) tiRain(true);
  TI_BOLTS.forEach((T,i)=>{ if(t===T) tiThunder(i===1?.75:1); });
  if(t===TI_EYES) beep('triangle',55,49,1.1,.07);
  if(t===TI_DIVE) tiHowl(1.1,.075);
  if(t===TI_BLOW){ swish(.8,.12,500,2400,900,AC.currentTime,1.1); noise(.5,.05,false,AC.currentTime,900); }
  TI_ORDER.forEach((i,j)=>{ if(t===TI_PLUCK[i]) tiPluck(j); });
  if(t===TI_GONE) tiHowl(.9,.05);
  TI_BEATS.forEach((T,i)=>{ if(t===T) tiHeart(i>=2?1.3:1); });
  if(t===146) tiHowl(.8,.035);
  if(t===164) tiRiser();
  if(t>=170&&t<182&&t%3===0) noise(.04,.03,true,AC.currentTime,2600+(t-170)*200); // la corteza se raja
  if(t===TI_BURST) tiBurstSfx();
  if(t===TI_FLY) swish(.24,.06,700,2800,6000,AC.currentTime,1.4);
  if(t===TITLE_LAND) tiSlam();
  for(let i=0;i<6;i++) if(i!==3&&t===TITLE_LAND+TI_POPU[i]) tiPop(i);
  if(t===TITLE_LAND+TI_HERO_U+4) SFX.sprout();
  if(t===TI_LEAF_T) SFX.sprout();
  if(t===TI_RIB) SFX.flap();
  for(let i=0;i<8;i++) if(t===TI_SEED_T(i)) tiPlink(i);
}
function tiMenuTick(){ const t=titleT, u=t-TITLE_LAND;
  // al posarse: las letras brincan cuando les llega la ola, el Roble florece y vuela el polvo
  if(u>=0&&u<40){ for(let i=0;i<6;i++) if(i!==3&&u===TI_POPU[i]){ tiHop(TI.hops,i,7,12); puff(LOGO_POS[i]+9,LOGO_Y+24,'#e8f4d8',5,1); }
    if(u===0){ shake=6; for(let i=0;i<16;i++){ const a=i/16*6.283; parts.push({k:'shard',x:TI_AX,y:TI_AY,vx:Math.cos(a)*3,vy:Math.sin(a)*3,life:20,max:20,col:i&1?'#fff4c0':'#f8d060',nog:true}); } }
    if(u===TI_OAK_U){ for(let i=0;i<26;i++){ const a=i/26*6.283, v=1+Math.random()*1.8; parts.push({k:'petal',x:80+Math.cos(a)*16,y:64+Math.sin(a)*12,vx:Math.cos(a)*v,vy:Math.sin(a)*v*.7-.5,life:130,max:130,sway:Math.random()*6,nog:true,col:i&1?'#f8c8e0':'#ffffff'}); } } }
  if(t===TI_LEAF_T+8) puff(TI_AX,TI_AY-14,'#d0f890',6,.8);
  // el compás: la ola de las letras cada dos compases, y una semilla que centellea
  const n=Math.floor(titleBeat()); if(n!==TI.beat){ const up=n>TI.beat; TI.beat=n; if(up&&t>=TITLE_MENU){ if(n%8===0) for(let i=0;i<6;i++){ const ii=i; TI.q=(TI.q||[]); TI.q.push([tick+i*3,()=>tiHop(TI.hops,ii,2.6,10)]); } } }
  if(TI.q&&TI.q.length){ TI.q=TI.q.filter(([w,fn])=>{ if(tick>=w){ fn(); return false; } return true; }); }
  // la ráfaga: las letras y las hojas de la bellota se mecen al pasar
  const g=tiGust(); if(g){ for(let i=0;i<7;i++){ const lx=i===6?TI_AX:LOGO_POS[i]+8; if(Math.abs(g.x-lx)<3&&!(TI.gHit&&TI.gHit[i]===Math.floor(titleBeat()/16))){ (TI.gHit=TI.gHit||[])[i]=Math.floor(titleBeat()/16); tiSway(i,i===6?2.6:1.6); } }
    if(g.x>-10&&g.x<170&&(tick&3)===0) parts.push({k:SEASONS[menuSeason()].part,x:g.x,y:96+Math.random()*40,vx:2.4,vy:-.6,life:50,max:50,sway:Math.random()*6,r:0,col:SEASONS[menuSeason()].partCol[tick&1],nog:true}); }
  // la estación nueva: el Roble la trae florecido (las letras brincan) o el Viento soplando (se mecen); en otoño a Sprout le cae una hoja
  const S=tiSeason(); if(!S.first&&S.si!==TI.lastSeason){ TI.lastSeason=S.si;
    if(S.si<=1) for(let i=0;i<6;i++){ const ii=i; (TI.q=TI.q||[]).push([tick+4+Math.abs(i-2.5)*2|0,()=>tiHop(TI.hops,ii,4,11)]); }
    else for(let i=0;i<7;i++){ const ii=i; (TI.q=TI.q||[]).push([tick+Math.round((170-(i===6?TI_AX:LOGO_POS[i]))/5.6),()=>tiSway(ii,-2.4)]); }
    if(S.si===2) TI.heroLeaf={t:tick+Math.round(TITLE_BAR),stay:Math.round(TITLE_BAR*1.6)}; }
  if(S.si!==2&&TI.heroLeaf&&tick-TI.heroLeaf.t>TI.heroLeaf.stay+40) TI.heroLeaf=null;
  if(!S.first&&S.si===3&&t>=TITLE_MENU&&(tick%34)===0){ parts.push({k:'dust',x:44,y:116+((tick>>5)&1),vx:.5,vy:-.25,life:18,max:18,r:1,col:'#f4f8ff',nog:true}); } // el aliento, en invierno
  menuSeasonParts(); }
/* partículas de cada estación en el menú (las del cambio las pone drawSeasonWorld con su barrido) */
function menuSeasonParts(){
  const t=titleT; if(t<TITLE_LAND+10) return; const S=tiSeason(), SS=SEASONS[S.si];
  if(!S.first&&S.w===0){ for(const p of parts) if(p.k===SEASONS[S.prev].part) p.life=Math.min(p.life,24);
    if(S.si<=1){ if(AC) SFX.chime(); const cy=94-30; for(let i=0;i<22;i++){ const a=i/22*6.283, v=1+Math.random()*1.6; parts.push({k:SS.part,x:80+Math.cos(a)*10,y:cy+Math.sin(a)*8,vx:Math.cos(a)*v,vy:Math.sin(a)*v*.7-.4,life:120,max:120,sway:Math.random()*6,r:i&1,col:SS.partCol[i&1],nog:true}); } }
    else { if(AC) SFX.swoosh(); } }
  if(!S.first&&S.si>=2&&S.w<SEASON_WIPE&&(S.w&1)===0){ const wx=166-S.w/SEASON_WIPE*190; parts.push({k:SS.part,x:wx+4,y:Math.random()*128,vx:-2.5-Math.random()*1.5,vy:(Math.random()-.5)*.6,life:90,max:90,sway:Math.random()*6,r:(S.w&4)?1:0,col:SS.partCol[(S.w>>1)&1],nog:true}); }
  if((t%(S.si===3?4:9))===0) parts.push({k:SS.part,x:Math.random()*170-5,y:-4,vx:(S.si===2?.4:.1)+(Math.random()-.5)*.3,vy:.3+Math.random()*.35,life:260,max:260,sway:Math.random()*6,r:(t&8)?1:0,col:SS.partCol[(t>>3)&1],nog:true});
}
/* el año gira detrás del logo: primavera y verano los trae el Roble (florece desde la copa); otoño e invierno, el Viento soplando */
function drawSeasonWorld(cam){
  const S=tiSeason();
  if(state==='file'||S.first||S.w>=SEASON_WIPE){ drawTitleScene(S.si,1,cam); tiGustDraw(); return; }
  const si=S.si, hy=drawTitleScene(S.prev,1,cam), k=S.w/SEASON_WIPE;
  if(si<=1){ const cx=80, cy=hy-30, r=Math.round(k*k*190);
    ctx.save(); proClipCircle(cx,cy,r); drawTitleScene(si,1,cam); ctx.restore(); tiRing(cx,cy,r,'#fffbe8',1-k*.6); tiRing(cx,cy,Math.max(0,r-5),'#fff0c8',.5); }
  else { const wx=Math.round(166-k*190);
    ctx.save(); ctx.beginPath(); ctx.rect(wx,0,200,144); ctx.clip(); drawTitleScene(si,1,cam); ctx.restore();
    ctx.fillStyle='rgba(235,245,255,.75)'; ctx.fillRect(wx,0,1,144);
    for(let i=0;i<9;i++){ const y=(i*17+tick*3)%130, L=8+(i%3)*7; ctx.fillStyle='rgba(235,245,255,'+(.4+(i%2)*.3)+')'; ctx.fillRect(wx+2+((i*13)%20),y,L,1); }
    drawWind(wx+12,Math.round(hy-18+Math.sin(tick*.12)*4),{s:.8,mood:'blow',f:(tick>>2)&7}); }
}
