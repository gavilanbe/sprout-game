'use strict';
/* ============================================================
   MARCHITARSE Y REBROTAR — un guiño a las partidas perdidas de
   Mother 2, contado a la manera del valle.
   · En el campo (state 'dying'): Sprout se estremece, las hojas se le
     doblan, se seca y se deshace en polvo. Queda una semilla y UNA hoja
     verde que baja planeando. El mundo pierde el color, el foco se
     cierra sobre la semilla y la semilla se hunde en la tierra.
   · Bajo tierra, de perfil: la semilla baja con su lucecita entre capas,
     piedras y raicillas hasta las raíces del Gran Roble.
   · El sueño (state 'over'): anillos de tronco que laten y ondulan fila
     a fila, raíces que crecen hacia la semilla y le llevan savia, y la
     voz del Roble: pocas frases, según dónde y cuántas veces has caído.
     «¿Lo intentamos otra vez?» — SÍ / NO.
   · SÍ: la savia llega, la semilla se abre, cae un rayo y todo se vuelve
     luz. El rebrote (sproutT): la luz se recoge en una semilla en el
     punto de rebrote, germina con el motivo (la-si-do-re-mi), Sprout sale
     de la tierra de un salto, se sacude y el vigor se rellena corazón a
     corazón. NO: el Roble se despide, se guarda y al título.
   · La primera vez tarda algo más; después va al grano. Z acelera la
     caída, completa el texto y se salta el rebrote.
   ============================================================ */
let wilt=null;    // el campo: {t,T,x,y,dir,fast,rush,parts,leaf,seedOn}
let mDream=null;  // el sueño: {t,phase,pages,pg,chars,sel,roots,motes,pulse,...}
let rebrote=null; // la vuelta: {e,T,track,fast}

/* ---------- utilidades ---------- */
function wRng(seed){ let s=(seed|0)||1; return ()=>{ s^=s<<13; s^=s>>>17; s^=s<<5; return ((s>>>0)%100003)/100003; }; }
const eOut=k=>1-(1-k)*(1-k), eIn=k=>k*k, eIO=k=>k<.5?2*k*k:1-2*(1-k)*(1-k);
function mixRGB(a,b,k){ const A=hex2rgb(a), B=hex2rgb(b); return 'rgb('+Math.round(A[0]+(B[0]-A[0])*k)+','+Math.round(A[1]+(B[1]-A[1])*k)+','+Math.round(A[2]+(B[2]-A[2])*k)+')'; }
/* un círculo pintado fila a fila (bordes de píxel). inside: rellena dentro del radio (luz); si no, fuera
   (oscuridad). Entre r y r+dw, trama de tablero. */
function circleRows(cx,cy,r,col,dw,inside){
  ctx.fillStyle=col; const R2=r+dw, L=-4, Rr=VW+4;
  const chk=(a,b,y)=>{ a=Math.max(L,a); b=Math.min(Rr,b); for(let x=a;x<b;x++) if(((x+y)&1)===0) ctx.fillRect(x,y,1,1); };
  for(let y=-4;y<VH+4;y++){ const dy=y+.5-cy;
    const wo=R2>Math.abs(dy)?Math.sqrt(R2*R2-dy*dy):-1, wi=r>Math.abs(dy)?Math.sqrt(r*r-dy*dy):-1;
    if(inside){
      if(wi>=0){ const a=Math.max(L,Math.round(cx-wi)), b=Math.min(Rr,Math.round(cx+wi)); if(b>a) ctx.fillRect(a,y,b-a,1); }
      if(dw&&wo>=0){ const a0=Math.round(cx-wo), b1=Math.round(cx+wo), a1=wi>=0?Math.round(cx-wi):Math.round(cx), b0=wi>=0?Math.round(cx+wi):Math.round(cx); chk(a0,a1,y); chk(b0,b1,y); }
    } else {
      if(wo<0){ ctx.fillRect(L,y,Rr-L,1); continue; }
      const a0=Math.round(cx-wo), b1=Math.round(cx+wo); if(a0>L) ctx.fillRect(L,y,a0-L,1); if(b1<Rr) ctx.fillRect(b1,y,Rr-b1,1);
      if(dw){ const a1=wi>=0?Math.round(cx-wi):Math.round(cx), b0=wi>=0?Math.round(cx+wi):Math.round(cx); chk(a0,a1,y); chk(b0,b1,y); } } }
}
/* sonidos propios (por el bus de efectos) */
const WSFX={
  shiver(){ const a=audio(),t=a.currentTime; beep('square',f(64),f(63),.18,.03,t,true); beep('triangle',f(52),f(51),.3,.04,t+.02); },
  crumble(){ const a=audio(),t=a.currentTime; noise(.45,.04,false,t,800); noise(.3,.018,true,t+.06,2600); beep('triangle',230,80,.4,.045,t); },
  seed(){ const a=audio(),t=a.currentTime; beep('triangle',260,150,.07,.06,t); noise(.05,.03,false,t,900); },
  heart(){ const a=audio(),t=a.currentTime; beep('triangle',86,50,.16,.11,t); beep('triangle',78,46,.14,.08,t+.19); },
  sink(){ const a=audio(),t=a.currentTime; noise(.9,.022,false,t,380); beep('triangle',190,52,1.1,.045,t); beep('p125',f(57),f(45),1.1,.008,t+.1); },
  voice(ch){ if(!AC) return; const k=1+(((ch||'a').charCodeAt(0)%5)-2)*.035; beep('triangle',150*k,166*k,.06,.05); beep('p125',300*k,330*k,.04,.005); }, // grave y cálida
  sap(i){ if(!AC) return; beep('p125',f([81,84,88,86,91][i%5]),0,.22,.012); },
  pick(){ beep('square',f(76),0,.04,.025); },
  yes(){ const a=audio(),t=a.currentTime; [69,71,72,74,76].forEach((m,i)=>beep('p25',f(m+12),0,.16,.03,t+i*.075)); beep('triangle',f(57),0,.9,.05,t); },
  crack(){ const a=audio(),t=a.currentTime; noise(.06,.045,true,t,5200); beep('square',1200,1900,.05,.02,t); beep('p25',f(88),0,.3,.02,t+.05); },
  beam(){ const a=audio(),t=a.currentTime; noise(1,.016,true,t,6500); [81,88,93,100].forEach((m,i)=>beep('p125',f(m),0,.7,.012,t+i*.09)); beep('triangle',f(45),f(57),.9,.04,t); },
  rest(){ const a=audio(),t=a.currentTime; beep('triangle',f(64),0,.45,.045,t); beep('triangle',f(60),0,.5,.04,t+.35); beep('triangle',f(57),0,.9,.04,t+.7); },
  glint(){ beep('square',2200,3000,.06,.018); },
  note(m){ beep('p25',f(m),0,.2,.032); beep('triangle',f(m-12),0,.2,.03); },
  pop(){ const a=audio(),t=a.currentTime; beep('square',240,820,.1,.045,t); noise(.14,.05,false,t,1300); },
  heal(i){ beep('square',f(84+i*2),0,.05,.016); },
};

/* ---------- arte: Sprout marchito por piezas (hojas aparte para doblarlas) ---------- */
const WILT_DRY=[{},
  {L:'#c8e890',l:'#90c050',d:'#4e7a30',D:'#2e4a1e',h:'#f8ecc8',s:'#eec890',S:'#cc9a66',T:'#a06a40',c:'#e8a088',B:'#f0a070',b:'#d07c4c',n:'#9a5230'},
  {L:'#e0d488',l:'#bca048',d:'#86682a',D:'#56441a',h:'#ecdcb4',s:'#dab888',S:'#b48c5c',T:'#8a6038',c:'#c89480',B:'#d49c68',b:'#b07848',n:'#7a4a2a',f:'#5e3818',F:'#8a5a30'},
  {L:'#c8aa70',l:'#a07c44',d:'#6e4e28',D:'#4a321a',h:'#d4c29e',s:'#bca07a',S:'#927452',T:'#6e5236',c:'#a88068',B:'#ae8862',b:'#8c6644',n:'#5e3e26',f:'#4a2e18',F:'#6a4a2c',q:'#e6dccb',m:'#5a3020'}];
function wiltRows(face){ const r=heroRows('down',{});
  r[8]=r[8].replace(/kq/g,'ss');                                    // ojos cerrados
  if(face==='pain'){ r[10]='..kscsskksscSk..'; r[11]='...kSSsmmsSSk...'; } // boca abierta
  else { r[10]='..kscsssssscSk..'; r[11]='...kSSsmmsSSk...'; }      // boquita triste, más abajo
  return r; }
function splitHero(rows,pal){ const blank='................';
  return { bulb:spr(rows.map((r,y)=>y<5?blank:r),pal),
    L:spr(rows.map((r,y)=>y<5?r.slice(0,8)+'........':blank),pal),
    R:spr(rows.map((r,y)=>y<5?'........'+r.slice(8):blank),pal) }; }
const WP={pain:[],sad:[]};
for(const face of ['pain','sad']) for(let d=0;d<4;d++) WP[face][d]=splitHero(wiltRows(face),{...HERO_PAL,...WILT_DRY[d]});
function drawWiltPose(g,x,y,o){ const P=WP[o.face][o.dry|0], dl=o.droop||0, bx=Math.round(x+(o.lean||0)), by=Math.round(y)+16;
  const h=Math.max(10,Math.round(16*(o.sq||1))), top=by-h, stemY=top+Math.round(4.5*h/16); // aplastado sólo en vertical y a filas enteras
  const leaf=(img,ax,a,ox)=>{ g.save(); g.translate(bx+ax,stemY); g.rotate(a); g.drawImage(img,-ox,-4.5); g.restore(); };
  const leaves=()=>{ leaf(P.L,7,-dl*1.3,7.5); if(!o.noR) leaf(P.R,9,dl*1.15,9.5); };
  if(dl<=.45) leaves();                                   // tiesas: por detrás de la cabeza
  g.drawImage(P.bulb,0,0,16,16,bx,top,16,h);
  if(dl>.45) leaves(); }                                  // mustias: cuelgan por delante, como orejas
/* la hoja que queda viva: baja planeando (dos fotogramas) */
const LIVE_LEAF=[sprN(['.kk...','kLlkk.','kllldk','.kkkk.'],{L:'#d0f890',l:'#78d838',d:'#2e9a38'}),
                 sprN(['...kk.','.kklLk','kdlllk','.kkkk.'],{L:'#d0f890',l:'#78d838',d:'#2e9a38'})];
/* la semilla en primer plano (el sueño) */
const SEED_BIG=sprN([
'.....kk.....',
'....kCck....',
'..kkCCCCkk..',
'.kCcCcCcCCk.',
'kCcCcCcCcCCk',
'kxxxxxxxxxxk',
'.kBhwBBBBbk.',
'.kBwhBBBBbk.',
'.kBhBBBBBbk.',
'.kBBBBBBBbk.',
'..kBBBBBbk..',
'..kBBBBbbk..',
'...kBbbbk...',
'....kkkk....'],{k:'#2a1808',C:'#6a4020',c:'#8a5a2c',x:'#4a2c12',B:'#c07e3e',b:'#8e5a28',h:'#e6aa62',w:'#fff0c8'});
const SEED_BIG_GOLD=tintTo(SEED_BIG,'#ffe9a0');
/* halo de la semilla: disco tramado (se pinta con alfa) */
const SEED_HALO=(()=>{ const c=mkCanvas(40,40), g=c.getContext('2d');
  for(let y=0;y<40;y++) for(let x=0;x<40;x++){ const d=Math.hypot(x-19.5,y-19.5); if(d>19) continue;
    const lv=d<8?3:d<12?2:d<16?1:0; const on=lv===3||(lv===2&&((x+y)&1)===0)||(lv===1&&(x%2===0&&y%2===0))||(lv===0&&((x+2*y)%4===0)&&d<18.5);
    if(on){ g.fillStyle=lv>=2?'#ffe08a':'#e8b050'; g.fillRect(x,y,1,1); } } return c; })();

/* ---------- la tierra de perfil (la bajada) ---------- */
const SOIL_H=430;
const SOIL_ROOTS=[]; // venas de savia que laten al fondo: [[x,y],...]
const SOIL=(()=>{ const c=mkCanvas(VW,SOIL_H), g=c.getContext('2d'), R=wRng(4242);
  const bands=['#503a24','#48321e','#402c1a','#382616','#312114','#2a1c11','#24180f','#1f150d'].map(hex2rgb);
  const img=g.createImageData(VW,SOIL_H), D=img.data;
  for(let y=0;y<SOIL_H;y++) for(let x=0;x<VW;x++){ const w=y+3*Math.sin(x*.07+y*.013)+2*Math.sin(x*.19+y*.05);
    let b=Math.floor(w/52); b=Math.max(0,Math.min(bands.length-1,b)); const edge=((w%52)+52)%52<2&&((x+y)&1)===0;
    const n=((x*73856093^y*19349663)>>>0)%9-4, c0=bands[Math.min(bands.length-1,b+(edge?1:0))];
    const i=(y*VW+x)*4; D[i]=Math.max(0,c0[0]+n); D[i+1]=Math.max(0,c0[1]+n); D[i+2]=Math.max(0,c0[2]+(n>>1)); D[i+3]=255; }
  g.putImageData(img,0,0);
  const px=(x,y,col)=>{ g.fillStyle=col; g.fillRect(x|0,y|0,1,1); };
  // piedras
  for(let i=0;i<70;i++){ const x=R()*VW, y=R()*(SOIL_H-120), w=2+R()*4|0, h=1+R()*3|0, lit=y<200;
    g.fillStyle='#120b06'; g.fillRect((x-1)|0,(y-1)|0,w+2,h+2); g.fillStyle=lit?'#6a5846':'#4a3e32'; g.fillRect(x|0,y|0,w,h); g.fillStyle=lit?'#8a7660':'#5e5042'; g.fillRect(x|0,y|0,Math.max(1,w-1),1); }
  // raicillas que bajan
  for(let i=0;i<26;i++){ let x=R()*VW, y=R()*(SOIL_H-140); const len=14+R()*30, dir=R()<.5?-1:1;
    for(let k=0;k<len;k++){ px(x,y,'#140c06'); px(x+1,y,'#5a3c20'); y+=1; if(R()<.35) x+=dir; } }
  // una lombriz dormida y una cáscara de bellota olvidada
  [[70,128],[71,127],[72,127],[73,128],[74,129],[75,129],[76,128]].forEach(([x,y])=>{ px(x,y+1,'#3a1a14'); px(x,y,'#d08878'); });
  g.fillStyle='#120b06'; g.fillRect(104,178,7,6); g.fillStyle='#6a4020'; g.fillRect(105,179,5,2); g.fillStyle='#9a6a38'; g.fillRect(105,181,5,2); g.fillStyle='#c89858'; g.fillRect(106,181,1,1);
  // una hoja fósil
  [[40,236],[41,235],[42,235],[43,234],[44,234],[45,235],[46,236],[42,237],[43,237],[44,236]].forEach(([x,y])=>px(x,y,'#4e3a24'));
  // las raíces del Gran Roble, cada vez más gordas
  const root=(pts,th)=>{ for(let pass=0;pass<3;pass++) for(let i=0;i<pts.length;i++){ const [x,y]=pts[i], t=Math.max(1,Math.round(th*(1-i/pts.length*.5)));
      if(pass===0){ g.fillStyle='#0c0704'; g.fillRect((x-t/2-1)|0,(y-t/2-1)|0,t+2,t+2); }
      else if(pass===1){ g.fillStyle='#4a2e16'; g.fillRect((x-t/2)|0,(y-t/2)|0,t,t); }
      else if(t>=3&&i%3===0){ g.fillStyle='#6e4624'; g.fillRect((x-t/2)|0,(y-t/2)|0,1,1); g.fillStyle='#2e1c0e'; g.fillRect((x+t/2-1)|0,(y+t/2-1)|0,1,1); } } };
  const path=(x0,y0,x1,y1,wig,ph)=>{ const P=[]; const n=Math.ceil(Math.hypot(x1-x0,y1-y0)/1.3); for(let i=0;i<=n;i++){ const k=i/n; P.push([x0+(x1-x0)*k+Math.sin(k*9+ph)*wig,y0+(y1-y0)*k+Math.cos(k*7+ph)*wig*.6]); } return P; };
  const big=[[path(-6,300,166,332,4,1),9],[path(-6,372,166,350,5,2),11],[path(20,280,70,420,3,3),6],[path(150,286,96,424,3,4),7],[path(-6,338,60,400,2,5),5],[path(166,316,112,398,2,6),5]];
  for(const [p,th] of big){ root(p,th); SOIL_ROOTS.push(p.filter((_,i)=>i%2===0)); }
  for(let i=0;i<14;i++){ const x=R()*VW, y=250+R()*60; root(path(x,y,x+(R()-.5)*40,y+14+R()*20,2,R()*6),2); }
  return c; })();

/* ============================================================
   1) EN EL CAMPO: marchitarse
   ============================================================ */
const WILT_LONG={flinch:12, droop:42, dry:66, crumble:84, seed:98, sinkA:130, dark:140, sinkB:204};
const WILT_FAST={flinch:8,  droop:24, dry:38, crumble:50, seed:60, sinkA:80,  dark:84,  sinkB:122};
function wiltBegin(){
  const fast=wilts>1;
  wilt={t:0,T:fast?WILT_FAST:WILT_LONG,x:player.x,y:player.y,dir:player.dir,fast,rush:false,parts:[],leaf:null,seedOn:false,depth:fast?170:270};
  deathT=wilt.T.sinkB; mDream=null; rebrote=null;
  if(typeof setTrack==='function'&&TRACKS.silencio) setTrack('silencio');
}
function wiltSeedPos(W){ return [W.x+8,W.y+15]; }
function updWilt(){
  const W=wilt||(wiltBegin(),wilt), T=W.T;
  if(keys.fire){ keys.fire=false; if(W.t>T.flinch+4) W.rush=true; }
  const n=W.rush?3:1;
  for(let i=0;i<n&&W.t<T.sinkB;i++){ W.t++; wiltEvent(W,W.t); }
  // partículas propias: hojas, polvo, migas (con su color: se pintan sobre el mundo ya apagado)
  for(const p of W.parts){ if(p.wait>0){ p.wait-=n; continue; } for(let s=0;s<n;s++){ p.x+=p.vx; p.y+=p.vy; p.vy+=p.g||0; p.vx*=.985; if(p.floor&&p.y>=p.floor){ p.y=p.floor; p.vy=0; p.vx*=.6; } p.life--; } }
  W.parts=W.parts.filter(p=>p.life>0);
  updParts(); deathT=Math.max(0,T.sinkB-W.t);
  if(W.t>=T.sinkB){ state='over'; dreamBegin(); }
}
function wiltEvent(W,t){ const T=W.T, [sx0,sy0]=wiltSeedPos(W);
  if(t===2&&!W.fast) WSFX.shiver();
  if(t===T.flinch) SFX.wilt();
  // hojitas que se sueltan mientras se dobla
  if(t>T.flinch&&t<T.dry&&t%(W.fast?6:9)===0){ const g=t<T.droop, side=(t/9|0)&1?1:-1; // desde la punta de una hoja, hacia fuera
    W.parts.push({x:W.x+8+side*(5+Math.random()*2),y:W.y+2+Math.random()*2,vx:side*(.25+Math.random()*.45),vy:-.25,g:.03,life:70,floor:sy0,leafy:true,col:g?['#78d838','#b0f068'][t&1]:['#c8b070','#a87838','#8a9a4a'][t%3]}); }
  // la hoja viva se suelta
  if(t===((T.droop+T.dry)>>1)){ W.leaf={t0:t,x0:W.x+11,y0:W.y+3,dur:(T.seed+(W.fast?8:22))-t}; }
  // se deshace en polvo, de arriba abajo
  if(t===T.dry){ WSFX.crumble(); wiltCrumble(W); }
  if(t===T.dry+4) W.seedOn=true;
  if(t===T.seed){ WSFX.seed(); SFX.land(); for(let i=0;i<5;i++) W.parts.push({x:sx0+(Math.random()-.5)*6,y:sy0-1,vx:(Math.random()-.5)*1.2,vy:-.6-Math.random()*.6,g:.08,life:22,col:'#8a7048',floor:sy0+1}); }
  if(t===T.seed+(W.fast?6:12)) WSFX.heart();
  if(t===T.sinkA-14){ for(let i=0;i<6;i++) W.parts.push({x:sx0+(Math.random()-.5)*8,y:sy0-2,vx:(Math.random()-.5)*.9,vy:-.5-Math.random()*.5,g:.06,life:20,col:'#6a5238',floor:sy0+1}); }
  if(t===T.dark) WSFX.sink();
}
function wiltCrumble(W){ // cada píxel de la última pose se vuelve una mota de polvo
  const c=mkCanvas(32,32), g=c.getContext('2d'); g.imageSmoothingEnabled=false;
  drawWiltPose(g,8,8,wiltPoseAt(W,W.T.dry-1,true)); // la pose en (8,8): el píxel (x,y) es (W.x+x-8, W.y+y-8)
  const d=g.getImageData(0,0,32,32).data, [,sy0]=wiltSeedPos(W);
  for(let y=0;y<32;y++) for(let x=0;x<32;x++){ const i=(y*32+x)*4; if(d[i+3]<128) continue;
    const col='rgb('+d[i]+','+d[i+1]+','+d[i+2]+')';
    const blow=Math.random()<.18; // casi todo cae como arena; un poco se lo lleva el aire
    W.parts.push({x:W.x+x-8,y:W.y+y-8,vx:(Math.random()-.5)*.3+(blow?.5+Math.random()*.5:0),vy:blow?-.35:Math.random()*.15,g:blow?.012:.07,life:(blow?30:44)+Math.random()*20,wait:Math.max(0,y-8)*.8+Math.random()*2,col,floor:sy0+(Math.random()*2|0),dust:true}); }
}
/* la pose del momento t: se estremece, se dobla, se seca */
function wiltPoseAt(W,t,forCrumble){ const T=W.T;
  if(t<T.flinch){ const k=t/T.flinch; return {face:'pain',dry:0,droop:0,sq:1-.08*Math.sin(k*Math.PI),lean:0,hop:Math.round(-3*Math.sin(k*Math.PI)),white:!forCrumble&&((t>>1)&1)===0}; }
  if(t<T.droop){ const k=(t-T.flinch)/(T.droop-T.flinch);
    return {face:k<.4?'pain':'sad',dry:k<.55?0:1,droop:eOut(k)*.55,sq:1-.07*k,lean:Math.round(Math.sin(t*.45)*(1-k)*1.4),hop:0}; }
  const k=Math.min(1,(t-T.droop)/(T.dry-T.droop));
  return {face:'sad',dry:k<.45?2:3,droop:.55+.45*eOut(k),sq:.93-.18*eIn(k),lean:0,hop:0,noR:!!W.leaf}; }
function drawWilt(){
  const W=wilt; if(!W) return; const T=W.T, t=W.t, [sx0,sy0]=wiltSeedPos(W);
  if(t>=T.dark){ drawDescent(W); return; }
  // el mundo se apaga
  wiltGrade(clamp((t-T.flinch*.5)/(T.dry-T.flinch*.5),0,1));
  // Sprout
  if(t<T.dry){ const o=wiltPoseAt(W,t); drawShadow(W.x+8,W.y+15,6-(o.sq<.9?1:0));
    if(o.white) ctx.drawImage(P_WHITE[t<3?W.dir:0],W.x|0,(W.y+o.hop)|0); else drawWiltPose(ctx,W.x,W.y+o.hop,o); }
  else drawShadow(sx0,sy0,4);
  // la semilla: asoma entre el polvo, da un saltito y se hunde en la tierra
  if(W.seedOn&&t<T.sinkA){ let oy=0, sunk=0;
    if(t>=T.crumble&&t<T.seed){ const k=(t-T.crumble)/(T.seed-T.crumble); oy=-Math.round(7*Math.sin(k*Math.PI)); }
    const sinkS=T.sinkA-(W.fast?16:24); if(t>=sinkS) sunk=Math.min(7,Math.round(7*(t-sinkS)/(T.sinkA-4-sinkS)));
    const beat=t>=T.seed+(W.fast?6:12)&&t<T.seed+(W.fast?14:22);
    if(sunk<7){ if(beat){ ctx.globalAlpha=.3; ctx.drawImage(SEED_HALO,sx0-20,sy0-24); ctx.globalAlpha=1; } // un latido: aún hay vida dentro
      ctx.save(); ctx.beginPath(); ctx.rect(sx0-6,sy0-24,12,25); ctx.clip();
      ctx.drawImage(SEED_FALL,sx0-4,sy0-7+oy+sunk);
      if(beat){ ctx.globalAlpha=.55; ctx.drawImage(tintCached(SEED_FALL,'#fff0b8'),sx0-4,sy0-7+oy+sunk); }
      ctx.restore(); }
    if(sunk>0){ ctx.fillStyle='#2a1c10'; ctx.fillRect(sx0-4,sy0,8,1); ctx.fillRect(sx0-3,sy0+1,6,1); } }
  // partículas con color
  for(const p of W.parts){ if(p.wait>0&&p.dust){ ctx.fillStyle=p.col; ctx.fillRect(p.x|0,p.y|0,1,1); continue; }
    ctx.globalAlpha=Math.min(1,p.life/14); ctx.fillStyle=p.col;
    if(p.leafy) ctx.drawImage(tintCached(LEAF_BIT,p.col),(p.x|0)-1,(p.y|0)-1); else ctx.fillRect(p.x|0,p.y|0,1,1); }
  ctx.globalAlpha=1;
  // la hoja viva
  if(W.leaf){ const L=W.leaf, u=clamp((t-L.t0)/L.dur,0,1), lx=L.x0+Math.sin(u*6)*7*(1-u)+u*5, ly=L.y0+(sy0-3-L.y0)*eOut(u);
    ctx.drawImage(LIVE_LEAF[u<1?((t>>3)&1):0],(lx|0)-3,(ly|0)-2); }
  // el foco se cierra: primero una viñeta, luego sólo la semilla
  if(t>=T.seed-8){ const k=clamp((t-(T.seed-8))/(T.sinkA-(T.seed-8)),0,1), r=k<.7?lerp(150,18,eIO(k/.7)):lerp(18,0,eIn((k-.7)/.3));
    circleRows(sx0,sy0-3,r,'#07050a',r>4?3:0,false); }
  else if(t>T.flinch){ const k=clamp((t-T.flinch)/(T.seed-8-T.flinch),0,1); circleRows(sx0,sy0-3,lerp(260,150,eOut(k)),'#07050a',4,false); }
}
function wiltGrade(k){ if(k<=0) return; ctx.save();
  ctx.globalCompositeOperation='saturation'; ctx.fillStyle='rgba(128,128,128,'+Math.min(1,k*.96).toFixed(3)+')'; ctx.fillRect(-4,-4,VW+8,VH+8);
  ctx.globalCompositeOperation='multiply'; ctx.fillStyle=mixRGB('#ffffff','#8a7864',k); ctx.fillRect(-4,-4,VW+8,VH+8);
  ctx.restore(); }
/* 2) la bajada: la tierra de perfil, alumbrada sólo por la semilla */
const DESC_Y=70; // la semilla, en pantalla
function drawDescent(W){ const T=W.T, k=clamp((W.t-T.dark)/(T.sinkB-T.dark),0,1), depth=eIO(k)*W.depth;
  ctx.fillStyle='#07050a'; ctx.fillRect(-4,-4,VW+8,VH+8);
  const sy=Math.round(DESC_Y-(SOIL_H-100-W.depth)-depth); // al final, la semilla queda en y=SOIL_H-100 del corte (entre raíces)
  ctx.drawImage(SOIL,0,sy);
  // savia en las venas del fondo
  const glow=clamp((k-.55)/.45,0,1);
  if(glow>0){ ctx.fillStyle='#ffc860'; for(const p of SOIL_ROOTS) for(let i=0;i<p.length;i++){ const ph=(i*.35-W.t*.25)%6.283; if(Math.sin(ph)>.8){ ctx.globalAlpha=glow*.8; ctx.fillRect(p[i][0]|0,(p[i][1]+sy)|0,1,1); } } ctx.globalAlpha=1; }
  // la luz de la semilla
  const r=24+Math.round(Math.sin(W.t*.21))+Math.round(eIn(glow)*8);
  ctx.save(); ctx.globalCompositeOperation='lighter'; ctx.globalAlpha=.09; circleRows(80,DESC_Y,17,'#ffcc80',3,true); circleRows(80,DESC_Y,9,'#ffcc80',2,true); ctx.restore();
  ctx.globalAlpha=.55; circleRows(80,DESC_Y,r-6,'#07050a',0,false); ctx.globalAlpha=1; // la luz se apaga hacia el borde
  circleRows(80,DESC_Y,r,'#07050a',4,false);
  // la semilla baja girando despacio (y deja una estela de chispitas)
  const wob=Math.round(Math.sin(W.t*.13)*1.2);
  ctx.drawImage(SEED_FALL,76+wob,DESC_Y-3);
  for(let i=1;i<4;i++){ ctx.fillStyle=i===1?'#ffe8a0':'#b08040'; ctx.globalAlpha=.6/i; ctx.fillRect(80+wob-(i&1),DESC_Y-4-i*3,1,1); } ctx.globalAlpha=1;
}

/* ============================================================
   3) EL SUEÑO: la voz del Roble
   ============================================================ */
const DREAM_PALS={ // 5 niveles, de oscuro a claro; los anillos alternan la estación con la noche
  noche:['#06051a','#0b0a26','#121036','#1b1848','#26215c'],
  mustio:['#140c04','#26180a','#3e2810','#5a3a18','#7a5224'],
  primavera:['#06160a','#0c2814','#153e1e','#20582a','#2e7438'],
  verano:['#041618','#082a2c','#0e4042','#185a5a','#247676'],
  otono:['#1a0804','#321006','#4e1e0a','#6c2c0e','#8c3e14'],
  invierno:['#0a1422','#132840','#1e3c5c','#2c547a','#44729c'],
};
for(const k in DREAM_PALS) DREAM_PALS[k]=DREAM_PALS[k].map(hex2rgb);
function dreamPalKey(){ const r=regionOf(sx,sy);
  if(r==='eco') return 'ciclo';
  const ch=chapterIdx(); return ['mustio','primavera','verano','otono','invierno','ciclo'][ch]||'mustio'; }
const DREAM_C={x:80,y:70};
let dreamCv=null, dreamImg=null, DR_D=null, DR_A=null;
function dreamInit(){ if(DR_D) return; dreamCv=mkCanvas(VW,VH); dreamImg=dreamCv.getContext('2d').createImageData(VW,VH);
  DR_D=new Float32Array(VW*VH); DR_A=new Float32Array(VW*VH);
  for(let y=0;y<VH;y++) for(let x=0;x<VW;x++){ const dx=x-DREAM_C.x, dy=(y-DREAM_C.y)*1.12, i=y*VW+x; DR_D[i]=Math.hypot(dx,dy); DR_A[i]=Math.atan2(dy,dx); } }
const RING_LV=[0,1,2,3,4,3,2,1];
function drawDreamBg(D){ dreamInit(); const t=D.t, data=dreamImg.data, key=D.pal, bright=D.phase==='yes'?Math.min(2,D.pt/16):0;
  const shift=D.ring, fade=D.phase==='no'?1-D.fade:1, pl=key==='ciclo'?null:DREAM_PALS[key];
  const seas=['primavera','verano','otono','invierno'], night=DREAM_PALS.noche, breath=1+.035*Math.sin(t*.025);
  for(let i=0;i<VW*VH;i++){ const d=DR_D[i], a=DR_A[i];
    const w=d*breath+2.6*Math.sin(a*5+d*.06-t*.015)+1.3*Math.sin(a*9-d*.03+t*.02);
    const ring=Math.floor(w/5-shift), band=Math.floor(ring/3); let lv=RING_LV[((ring%8)+8)%8]+Math.round(bright);
    if(d>64) lv--; if(d>88) lv--;
    if(d<20+D.pulse*6) lv++;
    lv=lv<0?0:lv>4?4:lv;
    const P=(band&1)?night:(pl||DREAM_PALS[seas[(((band>>1)%4)+4)%4]]), c=P[lv];
    data[i*4]=c[0]*fade; data[i*4+1]=c[1]*fade; data[i*4+2]=c[2]*fade; data[i*4+3]=255; }
  dreamCv.getContext('2d').putImageData(dreamImg,0,0);
  const amp=D.phase==='yes'?1.2:2.4;
  for(let y=0;y<VH;y++){ const o=Math.round(amp*Math.sin(y*.11+t*.06))*((y&1)?-1:1);
    ctx.drawImage(dreamCv,0,y,VW,1,o,y,VW,1);
    if(o>0) ctx.drawImage(dreamCv,VW-o,y,o,1,0,y,o,1); else if(o<0) ctx.drawImage(dreamCv,0,y,-o,1,VW+o,y,-o,1); }
}
/* raíces que bajan del Roble hasta la semilla, con raicillas */
function makeRoots(seed){ const R=wRng(seed), out=[], C=DREAM_C;
  const starts=[[16,-4],[50,-4],[110,-4],[144,-4],[-4,34],[164,42],[-4,112],[164,104]];
  starts.forEach((s,k)=>{ if(k>=4&&R()<.3) return;
    const ang=Math.atan2(C.y-s[1],C.x-s[0]), end=[C.x-Math.cos(ang)*12,C.y-Math.sin(ang)*11], pts=[], ph=R()*6, amp=.45+R()*.5;
    let x=s[0], y=s[1];
    for(let i=0;i<220;i++){ pts.push([x,y]); const dx=end[0]-x, dy=end[1]-y, d=Math.hypot(dx,dy); if(d<1.8) break;
      const a=Math.atan2(dy,dx)+Math.sin(i*.3+ph)*amp*Math.min(1,d/30); x+=Math.cos(a)*1.4; y+=Math.sin(a)*1.4; }
    const kids=[]; for(let j=0;j<2;j++){ const at=(pts.length*(.25+R()*.4))|0, p=pts[at]; if(!p) continue;
      const a0=Math.atan2(end[1]-p[1],end[0]-p[0])+(R()<.5?-1:1)*(.9+R()*.5), kp=[]; let kx=p[0], ky=p[1];
      const n=7+R()*9|0; for(let i=0;i<n;i++){ kp.push([kx,ky]); const a=a0+Math.sin(i*.7+ph)*.5; kx+=Math.cos(a)*1.3; ky+=Math.sin(a)*1.3; } kids.push({at,pts:kp}); }
    out.push({pts,kids,delay:k*5+R()*12|0,pulses:[],next:30+R()*50|0,i:k}); });
  return out; }
function rootShown(D,r){ return Math.floor(r.pts.length*eOut(clamp((D.t-r.delay)/60,0,1))); }
function drawDreamRoots(D){
  const th=(r,i)=>i<r.pts.length*.3?3:i<r.pts.length*.68?2:1;
  const col=[D.phase==='yes'&&D.pt>6?'#2a1608':'#140b05', D.phase==='yes'&&D.pt>6?'#7a5028':'#4a2e16', D.phase==='yes'&&D.pt>6?'#b07838':'#6e4624'];
  for(let pass=0;pass<3;pass++) for(const r of D.roots){ const n=rootShown(D,r);
    const stamp=(x,y,t)=>{ const h=t>>1; if(pass===0){ ctx.fillStyle=col[0]; ctx.fillRect((x-h-1)|0,(y-h-1)|0,t+2,t+2); } else if(pass===1){ ctx.fillStyle=col[1]; ctx.fillRect((x-h)|0,(y-h)|0,t,t); } else if(t>=2){ ctx.fillStyle=col[2]; ctx.fillRect((x-h)|0,(y-h)|0,1,1); } };
    for(let i=0;i<n;i++) stamp(r.pts[i][0],r.pts[i][1],th(r,i));
    for(const kd of r.kids) if(n>kd.at){ const m=Math.min(kd.pts.length,n-kd.at); for(let i=0;i<m;i++) stamp(kd.pts[i][0],kd.pts[i][1],1); } }
  // la savia que baja
  for(const r of D.roots) for(const p of r.pulses){ if(p<0) continue; const i=Math.min(r.pts.length-1,p|0), q=r.pts[i];
    for(let k=3;k>=1;k--){ const j=Math.max(0,i-k*2), b=r.pts[j]; ctx.globalAlpha=.25*(4-k)/3; ctx.fillStyle='#ffd070'; ctx.fillRect((b[0]-1)|0,(b[1]-1)|0,2,2); }
    ctx.globalAlpha=1; ctx.fillStyle='#ffd070'; ctx.fillRect((q[0]-1)|0,(q[1]-1)|0,3,3); ctx.fillStyle='#fff8d8'; ctx.fillRect(q[0]|0,q[1]|0,1,1); }
}
/* lo que dice el Roble: según dónde y cuántas veces */
const WILT_BOSS={
  topo:'Al Topo Real lo marea el estruendo. Una bellota-bomba cuando asome.',
  avispa:'A la Reina, bájala con la Raíz-gancho. En el suelo es tuya.',
  viento:'Mi hermano teme al fuego de sus braseros. El farol los prende; el Vilano te salva de sus soplidos.',
  ciervo:'El manto de hojas del Ciervo resbala. Una ráfaga del Molinillo y queda al descubierto.' };
const WILT_MID={
  king:'El Escarabajo Rey embiste recto. Apártate y dale en la cola cuando se atasque.',
  drone:'El Zángano se lanza en picado. Cuando se estrelle, quedará aturdido.',
  iceguard:'El Guardián de Hielo es duro. Una bellota-bomba lo ablanda.',
  scare:'El Espantapájaros se marea de tanto girar. Ése es tu momento.' };
const WILT_DUNGEON={
  cueva:'Hasta la Cueva del Topo llegan mis raíces. Aquí abajo nunca estás solo.',
  tronco:'Dentro del Tronco Hueco aún corre savia. Te presto un poco.',
  templo:'El Templo está helado, pero mi savia no se congela.',
  molino:'El Molino gira y gira, como el año atascado. Tú no te quedes quieto.' };
const WILT_ANY=['Todas las hojas caen alguna vez. Tú sabes volver.','Caer no es acabar. Una semilla sabe esperar.',
  'El valle todavía te necesita, brote.','La tierra está tibia. Descansa un segundo... y arriba.','Te he visto caer. También te he visto crecer.'];
function wiltLines(){
  const L=[], first=wilts<=1, reg=regionOf(sx,sy), dk=dungeonOf(sx,sy); let say=null;
  if(boss&&boss.echo) say='Sólo son ecos de mis guardianes... pero pegan de verdad. Recuerda cómo los venciste.';
  else if(boss&&WILT_BOSS[boss.type]) say=WILT_BOSS[boss.type];
  else if(midboss&&WILT_MID[midboss.type]) say=WILT_MID[midboss.type];
  else if(wilts===5) say='Cinco veces has caído. Y cinco veces has vuelto.';
  else if(wilts===10) say='Diez ya. Me sé de memoria cómo suenas al brotar.';
  else if(wilts>=20&&wilts%10===0) say='Eres el brote más terco del valle. Me encanta.';
  else if(dk&&!first) say=WILT_DUNGEON[dk];
  else if(reg==='norte'&&!first) say='Bajo la nieve también late la savia. Que no se te hiele la hoja.';
  else if(reg==='marisma'&&!first) say='El barro de la marisma es blando: buena tierra para volver a brotar.';
  else if((reg==='secreto'||reg==='gruta')&&!first) say='Hasta en los rincones escondidos te encuentro.';
  else if(cycled&&!first) say='Ya devolviste las estaciones... y aún sigues. Eso también es crecer.';
  if(first){ L.push('...¿Sprout? ¿Me oyes?'); L.push('Soy yo, el Roble. Mis raíces llegan hasta aquí abajo.'); L.push(say||'Caer no es acabar. Una semilla sabe esperar.'); }
  else L.push(say||WILT_ANY[wilts%WILT_ANY.length]);
  L.push('¿Lo intentamos otra vez?');
  return L; }
function dreamBegin(){
  const fast=wilts>1, R=wRng(97+wilts*31);
  mDream={t:0,phase:'in',inDur:fast?30:48,pages:wiltLines(),pg:0,chars:0,wait:0,sel:0,ud:0,pt:0,fade:0,pulse:0,ring:0,fast,reply:'',
    roots:makeRoots(311+wilts*17),pal:dreamPalKey(),motes:[...Array(18)].map(()=>({x:R()*VW,y:R()*VH,v:.12+R()*.25,ph:R()*6,c:R()<.3?1:0}))};
  setTrack('marchito');
  return mDream; }
function pageText(D){ return D.phase==='yes'||D.phase==='no'?D.reply:(D.pages[D.pg]||''); }
function dreamType(D){ const s=pageText(D);
  if(D.wait>0){ D.wait--; return; }
  if(D.chars>=s.length) return;
  const sp=(opts.textSpeed===2?1.4:.8)*(keys.fireHeld?2.5:1);
  const before=D.chars|0; D.chars=Math.min(s.length,D.chars+sp);
  for(let i=before;i<(D.chars|0);i++){ const ch=s[i], nx=s[i+1];
    if(/[a-záéíóúñ]/i.test(ch)&&i%3===0) WSFX.voice(ch);
    if('.,?!…'.includes(ch)&&nx!==undefined&&(nx===' '||nx==='.'||nx==='¿')){ D.chars=i+1; D.wait=ch===','?5:(nx==='.'?7:10); break; } } } // respira en la puntuación
function updMarchito(){
  const D=mDream||dreamBegin(); D.t++; D.ring+=D.phase==='yes'?.25:.07;
  // raíces, savia, motas
  for(const r of D.roots){ const n=rootShown(D,r);
    if(n>=r.pts.length&&D.phase!=='no'&&--r.next<=0){ r.pulses.push(0); r.next=(D.phase==='yes'?999:70+(r.i*13)%40); }
    for(let j=r.pulses.length-1;j>=0;j--){ r.pulses[j]+=D.phase==='yes'?2.6:1.3; if(r.pulses[j]>=r.pts.length-1){ r.pulses.splice(j,1); D.pulse=1; WSFX.sap(r.i+(D.t>>4)); } } }
  D.pulse=Math.max(0,D.pulse-.03);
  for(const m of D.motes){ m.y-=m.v*(D.phase==='yes'?4:1); if(m.y<-2){ m.y=VH+2; m.x=Math.random()*VW; } }
  if(D.phase==='in'){ if(keys.fire){ keys.fire=false; D.t=Math.max(D.t,D.inDur); } if(D.t>=D.inDur) D.phase='talk'; return; }
  if(D.phase==='talk'){ dreamType(D); const s=pageText(D), last=D.pg>=D.pages.length-1;
    if(keys.fire){ keys.fire=false;
      if(D.chars<s.length){ D.chars=s.length; D.wait=0; }
      else if(!last){ D.pg++; D.chars=0; D.wait=6; SFX.blip(); } }
    if(last&&D.chars>=s.length){ D.phase='ask'; D.pt=0; }
    return; }
  if(D.phase==='ask'){ D.pt++; const mv=(keys.left||keys.up)?-1:(keys.right||keys.down)?1:0;
    if(mv&&mv!==D.ud){ D.sel=D.sel?0:1; WSFX.pick(); } D.ud=mv;
    if(keys.fire){ keys.fire=false; if(D.pt<=5) return; // un Z de más al terminar la frase no elige solo
      if(D.sel===0){ D.phase='yes'; D.pt=0; D.chars=0; D.wait=0; D.reply=wilts%3===2?'¡Eso es! ¡Arriba!':'¡Arriba, brote!'; WSFX.yes();
        for(const r of D.roots){ r.pulses.push(0,-8,-16); r.next=999; } }
      else { D.phase='no'; D.pt=0; D.chars=0; D.wait=0; D.reply='Descansa, entonces. Tu camino queda guardado aquí abajo.'; WSFX.rest(); } }
    return; }
  if(D.phase==='yes'){ D.pt+=keys.fireHeld?2:1; keys.fire=false; dreamType(D);
    if(D.pt>=28&&!D.cracked){ D.cracked=true; WSFX.crack(); }
    if(D.pt>=34&&!D.beamed){ D.beamed=true; WSFX.beam(); }
    if(D.pt>=66) rebrotar();
    return; }
  if(D.phase==='no'){ D.pt++; dreamType(D); const s=pageText(D);
    if(keys.fire){ keys.fire=false; if(D.chars<s.length) D.chars=s.length; else D.leaving=true; }
    if(D.chars>=s.length&&D.pt>150) D.leaving=true;
    if(D.leaving){ D.fade=Math.min(1,D.fade+1/40); if(D.fade>=1){ mDream=null; wilt=null; save(); state='title'; titleT=TITLE_MENU; parts=[]; setTrack('titulo'); } }
    return; }
}
function drawDreamSeed(D){ const C=DREAM_C, bob=Math.round(Math.sin(D.t*.05)*1.5);
  const glow=.28+.5*D.pulse+(D.phase==='yes'?Math.min(.6,D.pt/40):0);
  ctx.globalAlpha=Math.min(1,glow)*(D.phase==='no'?1-D.fade:1); ctx.drawImage(SEED_HALO,C.x-20,C.y-20+bob); ctx.globalAlpha=1;
  if(D.phase==='in'&&D.t<12){ const k=D.t/12, s=1+.5*eOut(k), w=Math.round(8*s), h=Math.round(7*s); ctx.drawImage(SEED_FALL,0,0,8,7,C.x-(w>>1),C.y-(h>>1),w,h); return; }
  ctx.drawImage(SEED_BIG,C.x-6,C.y-7+bob);
  const gold=D.phase==='yes'?clamp(D.pt/24,0,1)*(.45+.25*Math.sin(D.pt*.5)):D.pulse*.35; // la savia la ilumina por dentro
  if(gold>0){ ctx.globalAlpha=gold; ctx.drawImage(SEED_BIG_GOLD,C.x-6,C.y-7+bob); ctx.globalAlpha=1; }
  if(D.cracked){ // la grieta y el brote que asoma
    ctx.fillStyle='#2a1808'; ctx.fillRect(C.x-1,C.y-2+bob,1,2); ctx.fillRect(C.x,C.y+bob,1,2); ctx.fillRect(C.x-1,C.y+2+bob,1,1);
    const h=Math.min(6,Math.max(0,(D.pt-28)>>1)); ctx.fillStyle='#2e9a38'; ctx.fillRect(C.x,C.y-8-h+bob,1,h);
    if(h>=4){ ctx.fillStyle='#78d838'; ctx.fillRect(C.x-3,C.y-9-h+bob,3,2); ctx.fillRect(C.x+1,C.y-10-h+bob,3,2); ctx.fillStyle='#d0f890'; ctx.fillRect(C.x-3,C.y-9-h+bob,1,1); ctx.fillRect(C.x+3,C.y-10-h+bob,1,1); } }
}
function drawDreamText(D){ const s=pageText(D); if(!s) return;
  const lines=wrapPx(s,140,FONT_M), n=lines.length, y0=12+(3-Math.min(3,n))*5; let left=D.chars|0;
  const fade=D.phase==='no'?1-D.fade:1; if(fade<=0) return; ctx.globalAlpha=fade;
  lines.forEach((ln,i)=>{ const vis=ln.slice(0,Math.max(0,left)); left-=ln.length+1; if(!vis) return;
    const x0=Math.round(80-textW(ln,FONT_M)/2); txtOL(vis,x0,y0+i*11,'#fff4d6','left','#120a05'); });
  if(D.phase==='talk'&&D.chars>=s.length&&D.pg<D.pages.length-1&&(D.t&31)<20){ const y=y0+n*11+1; ctx.fillStyle='#120a05'; ctx.fillRect(77,y,7,5); ctx.fillStyle='#ffd070'; ctx.fillRect(78,y+1,5,1); ctx.fillRect(79,y+2,3,1); ctx.fillRect(80,y+3,1,1); }
  ctx.globalAlpha=1; }
function drawDreamChoice(D){ const k=eOut(clamp(D.pt/10,0,1)), y=Math.round(112+(1-k)*8);
  ctx.globalAlpha=k;
  [['SÍ',58],['NO',102]].forEach(([s,x],i)=>{ const on=D.sel===i, lift=on?Math.round(Math.sin(D.t*.15)):0;
    txtOL(s,x,y+lift,on?'#fff4d6':'#7a6c5a','center','#120a05');
    if(on){ const bx=x-textW(s,FONT_M)/2-12+((D.t>>3)&1); ctx.drawImage(CURSOR_SPR,Math.round(bx),y); } });
  const dng=dungeonOf(sx,sy)||regionOf(sx,sy)==='gruta'||regionOf(sx,sy)==='secreto';
  txtSO(D.sel===0?(dng?'REBROTAS A LA ENTRADA DE LA MAZMORRA':'REBROTAS A LA ENTRADA DE ESTA PANTALLA'):'SE GUARDA Y VUELVES AL TITULO',80,130,'#b8a888','center','#120a05');
  ctx.globalAlpha=1; }
/* SÍ: un rayo baja hasta la punta del brote (detrás del texto) y luego todo se vuelve luz */
function drawDreamBeam(D){ const C=DREAM_C, p=D.pt; if(p<32) return;
  const k=clamp((p-32)/12,0,1), w=Math.round(2+k*10), tip=C.y-16, bot=Math.round(tip*eOut(k));
  ctx.fillStyle='#fff6dc'; ctx.fillRect(C.x-(w>>1),0,w,bot);
  ctx.fillStyle='#ffe8a8'; for(let y=0;y<bot;y++){ if((y+p)&1) continue; ctx.fillRect(C.x-(w>>1)-2,y,1,1); ctx.fillRect(C.x+(w>>1)+1,y,1,1); }
  ctx.fillStyle='#ffffff'; ctx.fillRect(C.x-1,0,2,bot);
  if(k>=1){ ctx.globalAlpha=.5+.5*Math.sin(p*.6); ctx.drawImage(SEED_HALO,C.x-20,tip-18); ctx.globalAlpha=1; } }
function drawDreamWhite(D){ const p=D.pt; if(p<46) return; const k=clamp((p-46)/18,0,1); circleRows(DREAM_C.x,DREAM_C.y-8,eIn(k)*190,'#fff6dc',4,true); }
function drawMarchito(){
  const D=mDream; if(!D){ ctx.fillStyle='#07050a'; ctx.fillRect(-4,-4,VW+8,VH+8); return; }
  drawDreamBg(D);
  for(const m of D.motes){ const x=Math.round(m.x+Math.sin(D.t*.03+m.ph)*3); ctx.fillStyle=m.c?'#ffd878':'#c8d8c0'; ctx.globalAlpha=.35+.25*Math.sin(D.t*.07+m.ph); ctx.fillRect(x,m.y|0,1,1); } ctx.globalAlpha=1;
  drawDreamRoots(D); if(D.phase==='yes') drawDreamBeam(D); drawDreamSeed(D);
  if(D.phase==='in'){ const k=clamp(D.t/D.inDur,0,1), r=26+eIn(k)*180; // el sueño se abre desde la semilla, con un aro de luz
    circleRows(DREAM_C.x,DREAM_C.y,r,'#07050a',4,false);
    ctx.fillStyle='#ffe6a0'; ctx.globalAlpha=1-k; for(let i=0;i<96;i++){ const a=i/96*6.283+D.t*.02; ctx.fillRect(Math.round(DREAM_C.x+Math.cos(a)*r),Math.round(DREAM_C.y+Math.sin(a)*r/1.12),1,1); } ctx.globalAlpha=1; }
  drawDreamText(D);
  if(D.phase==='ask') drawDreamChoice(D);
  if(D.phase==='yes') drawDreamWhite(D);
  if(D.phase==='no'&&D.fade>0){ ctx.fillStyle='rgba(7,5,10,'+D.fade.toFixed(3)+')'; ctx.fillRect(-4,-4,VW+8,VH+8); }
}

/* ============================================================
   4) REBROTAR: de vuelta al valle
   ============================================================ */
const RB_LONG={light:30, germ:34, pop:60, land:74, look:84, end:112};
const RB_FAST={light:18, germ:20, pop:36, land:48, look:48, end:62};
function rebrotar(){
  // lo de siempre: vigor lleno, invulnerable y al punto de rebrote
  player.hp=player.maxHp; player.inv=120; inBed=false;
  const dng=dungeonOf(sx,sy)||regionOf(sx,sy)==='gruta'||regionOf(sx,sy)==='secreto';
  if(dng){ loadScreen(respawnPoint.sx,respawnPoint.sy); player.x=respawnPoint.x; player.y=respawnPoint.y; }
  else { loadScreen(lastEntry.sx,lastEntry.sy); player.x=lastEntry.x; player.y=lastEntry.y; if(!boxFree(player.x+4,player.y+8,8,8)) [player.x,player.y]=findFree(player.x,player.y,'x'); }
  player.dir=0; bombs=[]; projs=[]; state='play'; fadeIn=30;
  // el rebrote: la luz se recoge, germina, sale de un salto
  const fast=wilts>1, T=fast?RB_FAST:RB_LONG;
  rebrote={e:0,T,fast,track:curTrack,parts:[]}; sproutT=T.end;
  setTrack('silencio'); player.hp=Math.min(player.maxHp,1); lastHp=player.hp; // se ve rellenarse (ya se guardó lleno)
  mDream=null; wilt=null;
}
function rbSkip(R){ const T=R.T; if(R.e>=T.land) return; R.e=T.land-1; R.skipped=true; player.hp=player.maxHp; if(R.track&&curTrack==='silencio') setTrack(R.track); }
function updRebrote(){
  const R=rebrote||(rebrote={e:0,T:RB_FAST,fast:true,track:null,parts:[]}), T=R.T;
  if(keys.fire){ keys.fire=false; if(R.e>3) rbSkip(R); }
  R.e++; const e=R.e, gx=player.x+8, gy=player.y+15;
  if(e===1) WSFX.glint();
  if(e===T.light) { WSFX.glint(); sparkle(gx,gy-5,'#fff6d0'); }
  if(e>=T.germ&&e<T.pop){ const g=e-T.germ, step=Math.max(2,((T.pop-T.germ)/5)|0); if(g%step===0&&g/step<5) WSFX.note([69,71,72,74,76][g/step]);
    if((e&3)===0) sparkle(gx+(Math.random()-.5)*8,gy-4-Math.random()*6,'#d0f890'); }
  if(e===T.germ) WSFX.crack();
  if(e===T.pop){ WSFX.pop(); shake=Math.max(shake,3);
    for(let i=0;i<8;i++){ const a=-Math.PI*(.1+.8*i/7); parts.push({x:gx,y:gy-2,vx:Math.cos(a)*(1+Math.random()),vy:Math.sin(a)*(1.4+Math.random()),life:26,col:['#6a4a28','#8a6238','#4a3018'][i%3]}); }
    for(let i=0;i<6;i++) parts.push({x:gx,y:gy-8,vx:(Math.random()-.5)*1.6,vy:-1-Math.random(),life:40,col:['#78d838','#b0f068','#2e9a38'][i%3],leaf:true}); }
  if(e===T.land){ SFX.land(); SFX.chime(); if(R.track&&curTrack==='silencio') setTrack(R.track); R.ring=0;
    for(let i=0;i<6;i++) sparkle(gx+(Math.random()-.5)*16,gy-6-Math.random()*10,i&1?'#fff0a0':'#a8ec78'); }
  // el vigor se rellena corazón a corazón
  if(e>=T.pop&&player.hp<player.maxHp){ const k=clamp((e-T.pop)/(T.end-T.pop-6),0,1), want=Math.max(1,Math.ceil(player.maxHp*eOut(k)));
    if(want>player.hp){ if((want>>1)>(player.hp>>1)) WSFX.heal(want>>1); player.hp=Math.min(player.maxHp,want); } }
  if(R.ring!==undefined) R.ring++;
  sproutT=Math.max(0,T.end-e); if(fadeIn>0) fadeIn--; updParts();
  if(sproutT<=0){ player.hp=player.maxHp; if(R.track&&curTrack==='silencio') setTrack(R.track); rebrote=null; rebornInv=true; rebornSeen=player.inv; }
}
/* el montículo, la semilla que germina y Sprout que sale de un salto */
function drawRebroteHero(){
  const R=rebrote, x=player.x|0, y=player.y|0, gx=x+8, gy=y+15;
  if(!R){ drawShadow(gx,gy,6); ctx.drawImage(P_SPRITES[0][0],x,y); return; }
  const e=R.e, T=R.T;
  // montículo de tierra (se abre al salir)
  const open=e>=T.pop?clamp((e-T.pop)/10,0,1):0;
  if(e<T.land+16){ ctx.globalAlpha=1-clamp((e-T.land)/16,0,1);
    if(open<=0){ ctx.fillStyle='#3a2410'; ctx.fillRect(gx-6,gy-1,12,2); ctx.fillRect(gx-4,gy-2,8,1);
      ctx.fillStyle='#7a5430'; ctx.fillRect(gx-5,gy-1,10,1); ctx.fillStyle='#9a7446'; ctx.fillRect(gx-3,gy-2,6,1); }
    else { const w=Math.round(4+open*4); // el montículo abierto: un cráter de tierra removida
      ctx.fillStyle='#7a5430'; ctx.fillRect(gx-w-2,gy,2,1); ctx.fillRect(gx+w,gy,2,1); ctx.fillRect(gx-w-1,gy-1,1,1); ctx.fillRect(gx+w,gy-1,1,1);
      ctx.fillStyle='#4a3018'; ctx.fillRect(gx-w,gy,w*2,1); ctx.fillStyle='#5e3e20'; ctx.fillRect(gx-w+1,gy-1,w*2-2,1); }
    ctx.globalAlpha=1; }
  if(e<T.pop){ // la semilla, que tiembla y germina
    const tr=e>=T.germ-6&&(e&2)?1:0, glow=e<T.germ?(e<T.light?1:.5+.5*Math.sin(e*.4)):.4;
    ctx.globalAlpha=Math.max(0,glow)*.8; ctx.drawImage(SEED_HALO,gx-20,gy-24,40,40); ctx.globalAlpha=1;
    ctx.drawImage(SEED_FALL,gx-4+tr,gy-6);
    if(e>=T.germ){ const h=Math.min(7,((e-T.germ)*7/(T.pop-T.germ-4))|0);
      ctx.fillStyle='#1d4f22'; ctx.fillRect(gx+1,gy-6-h,1,h); ctx.fillStyle='#2e9a38'; ctx.fillRect(gx,gy-6-h,1,h);
      if(h>=4){ ctx.fillStyle='#1d4f22'; ctx.fillRect(gx-3,gy-7-h,3,2); ctx.fillRect(gx+1,gy-8-h,3,2); ctx.fillStyle='#78d838'; ctx.fillRect(gx-3,gy-7-h,2,1); ctx.fillRect(gx+2,gy-8-h,2,1); ctx.fillStyle='#d0f890'; ctx.fillRect(gx-3,gy-7-h,1,1); ctx.fillRect(gx+3,gy-8-h,1,1); } }
    drawShadow(gx,gy,3); return; }
  // sale de la tierra: estirado al subir, aplastado al caer
  const up=T.land-T.pop, k=(e-T.pop)/up; let oy, sq;
  if(k<.45){ const j=eOut(k/.45); oy=Math.round(14-20*j); sq=1.22-.1*j; }
  else if(k<1){ const j=eIn((k-.45)/.55); oy=Math.round(-6+6*j); sq=1.05; }
  else { const j=clamp((e-T.land)/8,0,1); oy=0; sq=j<.35?.74+.3*(j/.35):1.04-.04*((j-.35)/.65); }
  let img=P_SPRITES[0][0];
  if(e<T.land) img=P_BLINK[0];
  else if(!R.fast&&e>=T.look&&e<T.look+8) img=P_SPRITES[2][0];
  else if(!R.fast&&e>=T.look+8&&e<T.look+16) img=P_SPRITES[3][0];
  else if(!R.fast&&e>=T.look+20&&e<T.look+24) img=P_BLINK[0];
  drawShadow(gx,gy,oy<-2?4:6);
  ctx.save(); if(oy>0){ ctx.beginPath(); ctx.rect(x-8,y-24,32,40); ctx.clip(); }
  ctx.translate(gx,y+16+oy); ctx.scale(1+(1-sq)*.6,sq); ctx.drawImage(img,-8,-16); ctx.restore();
}
/* la luz del sueño que vuelve y se recoge en la semilla; el anillo al aterrizar; y, después, la savia
   que te protege mientras dura la invulnerabilidad (en vez del destello blanco de cuando te hieren) */
let rebornInv=false, rebornSeen=0;
function drawRebroteFx(){
  if(state!=='play') return;
  if(rebornInv&&(player.inv<=0||player.inv>rebornSeen)) rebornInv=false; // se acabó, o te hirieron: vuelve el destello normal
  rebornSeen=player.inv;
  if(rebornInv&&!rebrote){ const cx=player.x+8, cy=player.y+9, a0=tick*.11;
    ctx.globalAlpha=Math.min(1,player.inv/50);
    for(let i=0;i<3;i++){ const a=a0+i*2.094, x=Math.round(cx+Math.cos(a)*9), y=Math.round(cy+Math.sin(a)*4-Math.sin(tick*.05+i)*2);
      ctx.fillStyle=i?'#ffd060':'#fff4c0'; ctx.fillRect(x,y,1,1); if(((tick>>2)+i)&1){ ctx.fillStyle='#b07818'; ctx.fillRect(x,y+1,1,1); } }
    ctx.globalAlpha=1; }
  const R=rebrote; if(!R) return; const e=R.e, T=R.T, gx=player.x+8, gy=player.y+15;
  if(e<T.light){ const k=e/T.light, r=190*(1-eOut(k)); // corre hacia la semilla y se queda un poco en ella
    circleRows(gx,gy-4,r,'#fff6dc',4,true);
    if(k>.7){ const s=Math.round((k-.7)/.3*3); ctx.fillStyle='#ffffff'; ctx.fillRect(gx-s,gy-4,s*2+1,1); ctx.fillRect(gx,gy-4-s,1,s*2+1); } }
  if(R.ring!==undefined&&R.ring<16){ const k=R.ring/16, rx=Math.round(6+k*16), ry=Math.round(2+k*5);
    ctx.globalAlpha=1-k; ctx.fillStyle='#d0f890';
    for(let a=0;a<32;a++){ const t=a/32*6.283; ctx.fillRect(Math.round(gx+Math.cos(t)*rx),Math.round(gy+Math.sin(t)*ry),1,1); }
    ctx.globalAlpha=1; }
}
