'use strict';
/* ============================================================
   EL ZURRÓN — la bolsa de cuero de Sprout (el menú de pausa)
   · Al abrirlo, el mundo se queda quieto y apagado detrás (una foto de la
     pantalla, desaturada y en penumbra). El zurrón cae desde arriba, se
     aplasta al aterrizar levantando polvo, la hebilla salta y la solapa se
     levanta; lo que va quedando al descubierto salta a su sitio, y las
     pestañas y la placa de latón salen las últimas.
   · Al cerrarlo, la solapa baja, la hebilla hace clic y el zurrón sale
     volando hacia arriba mientras el juego ya sigue (state==='play').
   · Pestañas que se deslizan, placa que gira, cursor que planea, objetos
     que saltan al equiparse (los amuletos vuelan a su engarce) y una ficha
     de pergamino que se escribe sola.
   · Todo se pinta en un lienzo aparte (zCv, cambiando `ctx` un momento) y
     se compone con la caída, el aplastamiento y el vuelo.
   ============================================================ */
const PAUSE_TABS=[['zurron','ZURRÓN'],['mapa','MAPA'],['valle','EL VALLE'],['recuerdos','RECUERDOS'],['ajustes','AJUSTES']];
const MENU={bg:'#0b1a12',bg2:'#0e2016',slot:'#122a1c',slotD:'#081610',slotL:'#2c5238',line:'#2a4a34',label:'#8fc39a',dim:'#5d8a6b',gold:'#f0b848'};
const ZUR={ink:'#1e1008',dk:'#4a2912',md:'#643a1a',lt:'#7e4c24',hi:'#9c6433',sh:'#c48c4c',thread:'#e2c48a',hole:'#2a160a',
  brass:'#e8b040',brassL:'#fff2a8',brassD:'#9a6414',brassK:'#3e2606',stamp:'#3a1e0a',foil:'#ecd09a'};
const ZB={x:2,y:8,w:156,h:134};   // el cuerpo: x 2..157, y 8..141
const ZL={x:7,y:20,w:146,h:113};  // el forro de fieltro: x 7..152, y 20..132
const ZF={y:17,h:110};            // la solapa cuelga de y=17 y tapa hasta y=126 (más la correa con la hebilla)
// el guion, en fotogramas: caída, aterrizaje, hebilla, solapa · al cerrar: solapa, clic, vuelo
const Z_FALL=7, Z_FLAP0=10, Z_FLAP1=17, Z_CFLAP=5, Z_CLIFT=7, Z_CEND=16;

/* ---------- texturas (se hacen una vez, píxel a píxel) ---------- */
const ZRGB={}; for(const k in ZUR) ZRGB[k]=hex2rgb(ZUR[k]);
function zRand(seed){ let s=seed; return ()=>((s=(s*16807)%2147483647)/2147483647); }
function zPix(W,H,fn){ const c=mkCanvas(W,H), g=c.getContext('2d'), im=g.createImageData(W,H), d=im.data;
  for(let y=0;y<H;y++) for(let x=0;x<W;x++){ const col=fn(x,y); if(!col) continue; const i=(y*W+x)*4; d[i]=col[0]; d[i+1]=col[1]; d[i+2]=col[2]; d[i+3]=255; }
  g.putImageData(im,0,0); return c; }
function zGrain(W,H,seed,dots,creases){ // motas y arrugas cortas del cuero: 1 = sombra, 2 = luz
  const R=zRand(seed), G=new Uint8Array(W*H);
  for(let i=0;i<W*H*dots;i++) G[(R()*W*H)|0]=R()<.62?1:2;
  for(let i=0;i<creases;i++){ let x=(R()*W)|0, y=(R()*(H-1))|0; const n=3+(R()*5|0);
    for(let k=0;k<n&&x<W;k++){ G[y*W+x]=1; G[(y+1)*W+x]=2; x++; if(R()<.3) y=clamp(y+(R()<.5?-1:1),0,H-2); } }
  return G; }
const ZUR_BODY=(()=>{ const W=ZB.w, H=ZB.h, C=ZRGB, G=zGrain(W,H,7,.08,46);
  const hx0=ZL.x-ZB.x-1, hx1=ZL.x+ZL.w-ZB.x, hy0=ZL.y-ZB.y-1, hy1=ZL.y+ZL.h-ZB.y; // el hueco del forro, con su filo oscuro
  const inside=(x,y)=>{ if(x<0||y<0||x>=W||y>=H) return false; const r=3, cx=clamp(x,r,W-1-r), cy=clamp(y,r,H-1-r), dx=x-cx, dy=y-cy; return dx*dx+dy*dy<=r*r+1; };
  const stitch=i=>{ const m=((i%4)+4)%4; return m<2?C.thread:m===2?C.hole:null; };
  return zPix(W,H,(x,y)=>{
    if(!inside(x,y)) return null;
    if(!inside(x-1,y)||!inside(x+1,y)||!inside(x,y-1)||!inside(x,y+1)) return C.ink;
    // esquineras de latón abajo
    const cd=Math.min(x,W-1-x)+(H-1-y); if(cd<=9){ if(cd===9) return C.brassK; if(cd===8) return C.brassL; if(cd<=3) return C.brassD; return (x===3||x===W-4)&&y===H-5?C.brassL:C.brass; }
    if(x>=hx0&&x<=hx1&&y>=hy0&&y<=hy1) return C.ink;
    if((y===hy1+1&&x>=hx0)||(x===hx1+1&&y>=hy0&&y<=hy1+1)) return C.hi;   // labio de luz del hueco
    if((x===2||x===W-3)&&y>=4&&y<=H-6){ const s=stitch(y); if(s) return s; }
    if(y===3&&x>=4&&x<=W-5){ const s=stitch(x); if(s) return s; }
    if(y===1||x===1) return C.hi;
    if(y===H-2||x===W-2) return C.dk;
    const g=G[y*W+x]; return g===1?C.dk:g===2?C.lt:C.md; }); })();
const ZUR_LINING=(()=>{ const W=ZL.w, H=ZL.h, bg=hex2rgb(MENU.bg), b2=hex2rgb(MENU.bg2), sh=[[4,10,6],[7,16,11],[9,21,14]];
  return zPix(W,H,(x,y)=>{
    if(y<3) return sh[y]; if(x===0) return sh[0]; if(x===1) return sh[2];
    if(y===H-1||x===W-1) return [20,42,28];
    const ty=y%6, tx=((x-((y/6|0)&1)*6)%12+12)%12; // el tejido: uves de fieltro
    return (ty===1&&(tx===2||tx===3))||(ty===2&&tx===1)?b2:bg; }); })();
const ZUR_FLAP=(()=>{ const W=ZB.w, PH=ZF.h, H=PH+14, C=ZRGB, G=zGrain(W,H,31,.07,30), r=7, s0=(W>>1)-6, s1=(W>>1)+5;
  const panel=(x,y)=>{ if(x<0||y<0||x>=W||y>=PH) return false; if(y>PH-1-r){ const cy=PH-1-r;
      if(x<r){ const dx=r-x-.5, dy=y-cy-.5; return dx*dx+dy*dy<=r*r; } if(x>W-1-r){ const dx=x-(W-1-r)+.5, dy=y-cy-.5; return dx*dx+dy*dy<=r*r; } } return true; };
  const strap=(x,y)=>(x>=s0&&x<=s1&&y>=PH-10&&y<H-1)||(x>s0&&x<s1&&y===H-1);
  const inside=(x,y)=>panel(x,y)||strap(x,y);
  const inner=(x,y,d)=>inside(x-d,y)&&inside(x+d,y)&&inside(x,y+d);
  const em=(x,y)=>{ const dx=x-(W/2-.5), dy=y-46, d=Math.hypot(dx,dy); // el sello: un brote en su montoncito de tierra, dentro de un anillo
    if(d>=9.3&&d<=10.5) return true; if(Math.abs(dx)<.7&&dy>-1.5&&dy<6.5) return true; if(dy>=5.6&&dy<7&&Math.abs(dx)<3.8-(dy-5.6)) return true;
    const leaf=(cx,cy,ax,ay)=>{ const px=dx-cx, py=dy-cy, u=px*ax+py*ay, v=-px*ay+py*ax; return (u/3.9)**2+(v/1.8)**2<=1; };
    return leaf(-3.1,-3.3,-.8,-.6)||leaf(3.1,-3.3,.8,-.6); };
  return zPix(W,H,(x,y)=>{ if(!inside(x,y)) return null;
    if(!inside(x-1,y)||!inside(x+1,y)||!inside(x,y+1)) return C.ink;
    if(strap(x,y)&&!panel(x,y+2)){ // la correa que cuelga
      if(x===s0||x===s1) return C.ink; if(x===s0+1) return C.sh; if(x===s1-1) return C.dk;
      if((x===s0+2||x===s1-2)&&y<H-3&&(y%3)!==2) return C.thread; return C.lt; }
    if(y===0) return C.ink; if(y===1) return C.dk; if(y===2) return C.sh;   // la bisagra
    if(!inside(x,y+2)) return C.dk; if(!inside(x-2,y)) return C.sh; if(!inside(x+2,y)) return C.dk;
    if(y>=5&&!inner(x,y,4)&&inner(x,y,3)){ const m=(x+y)%4; if(m<2) return C.thread; if(m===2) return C.hole; }
    if(em(x,y)) return C.stamp; if(em(x-1,y-1)) return C.sh;
    const g=G[y*W+x]; return g===1?C.md:g===2?C.hi:C.lt; }); })();
const ZUR_FLAP_D=(()=>{ const c=mkCanvas(ZUR_FLAP.width,ZUR_FLAP.height), g=c.getContext('2d'); g.drawImage(ZUR_FLAP,0,0);
  g.globalCompositeOperation='source-in'; g.fillStyle='#120804'; g.fillRect(0,0,c.width,c.height); return c; })();
const zSilCache=new Map();
function zSil(img){ let c=zSilCache.get(img); if(!c){ c=mkCanvas(img.width,img.height); const g=c.getContext('2d'); g.drawImage(img,0,0);
  g.globalCompositeOperation='source-in'; g.fillStyle='#1f3c2a'; g.fillRect(0,0,c.width,c.height); zSilCache.set(img,c); } return c; }

/* ---------- estado de la función ---------- */
let zOpenT=99, zCloseT=-1, zLore=false, zSnap=null, zDim=null, zSnapOk=false;
let zMuffled=false, zTabT=99, zTabFrom=0, zSelT=99, zInfoT=99, zFx=[], zRow=[0,0,0], zJump={id:null,t:99}, zX0=null, zNoGlide=false;
const zCur={x:0,y:0,w:0,h:0,pg:-1,on:false};
const zCv=mkCanvas(VW,VH), zCx=zCv.getContext('2d'); zCx.imageSmoothingEnabled=false;

/* foto del mundo tal cual, para dejarlo quieto y apagado detrás del zurrón */
function zShoot(){
  if(!zSnap){ zSnap=mkCanvas(VW,VH); zDim=mkCanvas(VW,VH); }
  const main=ctx; ctx=zSnap.getContext('2d'); ctx.save(); ctx.imageSmoothingEnabled=false;
  try{ ctx.fillStyle='#081408'; ctx.fillRect(0,0,VW,VH); drawScene(); drawUI(); } catch(e){ console.warn('zurrón: foto', e); } finally { ctx.restore(); ctx=main; }
  const d=zDim.getContext('2d'); d.globalCompositeOperation='source-over'; d.globalAlpha=1; d.drawImage(zSnap,0,0);
  d.globalCompositeOperation='saturation'; d.fillStyle='rgba(128,128,128,.72)'; d.fillRect(0,0,VW,VH);
  d.globalCompositeOperation='multiply'; d.fillStyle='#50705f'; d.fillRect(0,0,VW,VH);
  d.globalCompositeOperation='source-over';
  const vg=d.createRadialGradient(80,78,26,80,78,120); vg.addColorStop(0,'rgba(4,10,7,0)'); vg.addColorStop(1,'rgba(4,10,7,.6)'); d.fillStyle=vg; d.fillRect(0,0,VW,VH);
  zSnapOk=true; }

/* ---------- abrir, cerrar, pestañas, reloj ---------- */
function openZurron(page){
  zShoot(); state='pause'; pausePage=page||0; pauseSel=0; loreSel=0; optSel=0; pauseLR=0; pauseUD=0;
  zOpenT=0; zCloseT=-1; zTabT=99; zSelT=99; zInfoT=0; zFx=[]; zRow=[0,0,0]; zJump={id:null,t:99}; zCur.on=false; zX0=xItem; zLore=false;
  SFX.bagDrop(); }
function closeZurron(){ state='play'; zCloseT=0; zLore=false; SFX.bagClose(); if(xItem!==zX0) xFlash=Math.max(xFlash,14); }
function zTabTo(p){ zTabFrom=pausePage; pausePage=p; pauseSel=0; loreSel=0; optSel=0; zTabT=0; zSelT=99; zInfoT=0; zCur.on=false; SFX.tab(); }
function zTick(){ // una vez por fotograma, en cualquier estado
  const muff=state==='pause'||zLore; if(muff!==zMuffled){ zMuffled=muff; musicMuffle(muff); } // la música, desde dentro de la bolsa
  if(state==='pause'&&zOpenT<999){ zOpenT++; if(zOpenT===Z_FALL) SFX.bagThud(); else if(zOpenT===Z_FLAP0-1) SFX.buckle(); else if(zOpenT===Z_FLAP0+1) SFX.flap(); }
  if(zCloseT>=0){ zCloseT++; if(zCloseT===Z_CFLAP) SFX.buckle(); else if(zCloseT===Z_CLIFT) SFX.bagAway(); if(zCloseT>Z_CEND) zCloseT=-1; }
  if(zTabT<99) zTabT++; if(zSelT<99) zSelT++; if(zInfoT<999) zInfoT++; if(zJump.t<99) zJump.t++;
  for(const f of zFx){ f.t++; if(f.kind==='fly'&&f.t===f.life){ zSparks(f.x1,f.y1,7); SFX.ping(); } }
  zFx=zFx.filter(f=>f.t<f.life); }
function zSparks(x,y,n){ for(let k=0;k<n;k++){ const a=k/n*6.283+.4; zFx.push({kind:'spark',x,y,vx:Math.cos(a)*1.3,vy:Math.sin(a)*1.3-.35,t:0,life:13,col:k&1?'#fff0a0':MENU.gold}); }
  zFx.push({kind:'ring',x,y,t:0,life:9}); }

/* ---------- el zurrón por páginas: navegación de la primera ---------- */
const X_DESC={bomb:'Planta una bomba. Rompe rocas y muros.',hook:'Cruza agua y postes. Atrapa bichos y bayas.',boomer:'Vuela y aturde. Mantén X: más lejos y atraviesa.',
  lantern:'Alumbra cuevas. Su llama quema y enciende antorchas.',feather:'Salta huecos. Mantén X en el aire y planeas.',molinillo:'Sopla: barre hojarasca y nieve, gira molinetes.'};
const EQUIP=['hoja','escudo','remolino','bolsa'];
const EQUIP_SIL={hoja:()=>BLADE_SPR,escudo:()=>SHIELD_SPR,remolino:()=>SPIN_ICON,bolsa:()=>BOMBBAG_SPR};
const EQUIP_HINT={hoja:'Raíz sabe dónde duerme.',escudo:'Tilo vende uno en su tienda.',remolino:'Tilo enseña técnicas… por unas bayas.',bolsa:'Uno más grande duerme en algún cofre.'};
let BLADE_ICONS=null;
function equipInfo(id){ // {img,name,desc,lvl,max}, o null si aún no lo tienes
  if(id==='hoja'){ if(!hasBlade) return null; const l=clamp(bladeLvl,1,3);
    if(!BLADE_ICONS) BLADE_ICONS=[null,BLADE_SPR,retintLum(BLADE_SPR,BLADE_TIERS[2].pal),retintLum(BLADE_SPR,BLADE_TIERS[3].pal)];
    return {img:BLADE_ICONS[l],name:['','HOJA ANCESTRAL','HOJA AFILADA','HOJA TEMPLADA'][l],lvl:l,max:3,
      desc:['','Corta hierba y bichos. Tilo la afila por unas bayas.','Daño doble. Tilo aún puede templarla.','Daño triple. Con el vigor lleno lanza un rayo de hoja.'][l]}; }
  if(id==='escudo'){ if(!hasShield) return null; const l=shieldLvl>=2?2:1;
    return {img:l>1?OAKSHIELD_ICON:SHIELD_SPR,name:l>1?'ESCUDO DE ROBLE':'ESCUDO DE CORTEZA',lvl:l,max:2,
      desc:l>1?'Gírate justo a tiempo y lo que te lancen rebota.':'Se lleva solo: lo que viene de frente rebota.'}; }
  if(id==='remolino'){ if(!hasSpin) return null; const l=hasBigSpin?2:1;
    return {img:l>1?BIGSPIN_ICON:SPIN_ICON,name:l>1?'GRAN REMOLINO':'REMOLINO',lvl:l,max:2,
      desc:l>1?'Carga antes, da dos vueltas y el tornado sale enorme.':'Mantén Z y suelta: giras y lanzas un tornadito.'}; }
  if(id==='bolsa'){ if(bombMax<20) return null; return {img:BOMBBAG_SPR,name:'ZURRÓN DE BELLOTAS',desc:'Caben veinte bellotas-bomba.',lvl:1,max:0}; }
  return null; }
function bagRow(){ const ni=ownedX().length, na=amulets.size; return pauseSel<ni?0:pauseSel<ni+na?1:2; }
function updBag(lr,ud){
  const items=ownedX(), am=[...amulets], ni=items.length, na=am.length, base=[0,ni,ni+na], len=[ni,na,EQUIP.length], n=ni+na+EQUIP.length;
  if(pauseSel>=n) pauseSel=0;
  const before=pauseSel, row=s=>s<ni?0:s<ni+na?1:2;
  if(lr!==pauseLR){ pauseLR=lr; if(lr) pauseSel=(pauseSel+lr+n)%n; }
  if(ud!==pauseUD){ pauseUD=ud; if(ud){ const r=row(pauseSel); zRow[r]=pauseSel-base[r]; let nr=r+ud; while(nr>=0&&nr<=2&&!len[nr]) nr+=ud;
    if(nr>=0&&nr<=2) pauseSel=base[nr]+Math.min(zRow[nr],len[nr]-1); } }
  if(pauseSel!==before){ SFX.blip(); zSelT=0; zInfoT=0; }
  if(!keys.fire) return; keys.fire=false;
  const r=row(pauseSel);
  if(r===0){ const it=items[pauseSel]; if(xItem!==it){ xItem=it; SFX.equip(); save(); zJump={id:it,t:0}; zSparks(9+X_ITEMS.indexOf(it)*24+11,38,8); } else { SFX.blip(); zJump={id:it,t:4}; } }
  else if(r===1){ const i=pauseSel-ni, id=am[i], sx0=10+i*14+7, sy0=70;
    if(equipped.includes(id)){ const s=equipped.indexOf(id); equipped[s]=null; SFX.blip(); zFx.push({kind:'fly',img:AMULET_SPR[id],x0:121+s*16+7,y0:55,x1:sx0,y1:sy0,t:0,life:9,to:-1}); }
    else { const s=equipped[0]===null?0:equipped[1]===null?1:0; equipped[s]=id; SFX.equip(); zFx.push({kind:'fly',img:AMULET_SPR[id],x0:sx0,y0:sy0,x1:121+s*16+7,y1:55,t:0,life:10,to:s}); }
    save(); }
  else { SFX.blip(); zSelT=0; } // el equipo solo se mira
}

/* ---------- piezas del menú ---------- */
function slot(x,y,w,h,on){ // hueco hundido del menú
  roundBox(x,y,w,h,PAL.k); ctx.fillStyle=MENU.slot; ctx.fillRect(x+1,y+1,w-2,h-2);
  ctx.fillStyle=MENU.slotD; ctx.fillRect(x+1,y+1,w-2,1); ctx.fillStyle=MENU.slotL; ctx.fillRect(x+1,y+h-2,w-2,1);
  if(on){ ctx.strokeStyle=MENU.gold; ctx.lineWidth=1; ctx.strokeRect(x+.5,y+.5,w-1,h-1); } }
function label(s,x,y,end){ txtS(s,x,y,MENU.label); const x0=x+textW(s,FONT_S)+3; ctx.fillStyle=MENU.line; ctx.fillRect(x0,y+2,Math.max(0,(end||151)-x0),1); }
function selFrame(x,y,w,h){ // marco de selección dorado que respira, con esquinas
  const p=(tick&15)<8?0:1; ctx.strokeStyle=MENU.gold; ctx.lineWidth=1; ctx.strokeRect(x-p-.5,y-p-.5,w+p*2+1,h+p*2+1);
  ctx.fillStyle='#fff0b0'; for(const [cx,cy] of [[x-p-2,y-p-2],[x+w+p,y-p-2],[x-p-2,y+h+p],[x+w+p,y+h+p]]) ctx.fillRect(cx,cy,2,2); }
function zSel(x,y,w,h){ // el marco dorado planea hasta su sitio
  if(zNoGlide){ selFrame(x,y,w,h); return; }
  const C=zCur; if(!C.on||C.pg!==pausePage) Object.assign(C,{x,y,w,h,pg:pausePage,on:true});
  else { const f=.42; C.x+=(x-C.x)*f; C.y+=(y-C.y)*f; C.w+=(w-C.w)*f; C.h+=(h-C.h)*f;
    if(Math.abs(C.x-x)<.4&&Math.abs(C.y-y)<.4&&Math.abs(C.w-w)<.4&&Math.abs(C.h-h)<.4) Object.assign(C,{x,y,w,h}); }
  selFrame(Math.round(C.x),Math.round(C.y),Math.round(C.w),Math.round(C.h)); }
function popImg(img,cx,cy,s){ if(!img||s<=.05) return; const w=Math.max(1,Math.round(img.width*s)), h=Math.max(1,Math.round(img.height*s));
  ctx.drawImage(img,0,0,img.width,img.height,Math.round(cx-w/2),Math.round(cy-h/2),w,h); }
const Z_REVEAL=(()=>{ const T=[]; for(let o=0;o<=Z_FLAP1;o++) T.push(ZF.y+ZF.h*(o<Z_FLAP0?1:1-smooth((o-Z_FLAP0)/(Z_FLAP1-Z_FLAP0)))); return T; })();
function zPopAt(y,k){ // escala de algo que está a la altura y: salta cuando la solapa lo destapa
  if((state!=='pause'&&!zLore)||zOpenT>60) return 1;
  let o0=Z_FLAP1; for(let o=Z_FLAP0;o<=Z_FLAP1;o++) if(Z_REVEAL[o]<y+6){ o0=o; break; }
  const t=(zOpenT-o0-(k||0)*.7)/6; return t>=1?1:t<=0?0:easeOutBack(t); }
function zSelPop(){ return zSelT<6?1+.28*(1-zSelT/6):1; }
function zJumpOf(id){ return zJump.id===id&&zJump.t<12?Math.round(Math.sin(Math.PI*zJump.t/12)*6):0; }
function zFlyTo(s){ return zFx.some(f=>f.kind==='fly'&&f.to===s); }
function zPip(x,y,on){ ctx.fillStyle=PAL.k; ctx.fillRect(x,y-1,3,5); ctx.fillRect(x-1,y,5,3);
  ctx.fillStyle=on?MENU.gold:'#1e3a28'; ctx.fillRect(x,y,3,3); if(on){ ctx.fillStyle='#fff0b0'; ctx.fillRect(x,y,1,1); } }
function zCount(n,x,y){ const s=''+n, w=textW(s,FONT_S)+4; roundBox(x,y,w,7,'#081610'); drawText(ctx,s,x+2,y+1,n>0?'#fff6d8':'#ff8a70','left',FONT_S); }

/* ---------- el zurrón: página de objetos ---------- */
function drawBag(){
  const items=ownedX(), am=[...amulets], ni=items.length, na=am.length, sel=pauseSel, bob=Math.round(Math.sin(tick*.2));
  label('OBJETOS · X',9,22);
  X_ITEMS.forEach((it,k)=>{ const x=9+k*24, y=28, own=items.indexOf(it), eq=own>=0&&xItem===it; slot(x,y,22,20,eq);
    if(own<0) return; const on=sel===own, s=zPopAt(y,own)*(on?zSelPop():1);
    popImg(X_ICON[it],x+11,y+10+(on?bob:0)-zJumpOf(it),s);
    if(s<.9) return;
    if(it==='bomb') zCount(bombAmmo,x+1,y+13);
    if(eq){ const d=zJump.id===it&&zJump.t<8?Math.round((1-easeOutBack(zJump.t/8))*9):0; badge('X',x+14,y+12-d); }
    if(on) zSel(x,y,22,20); });
  label('AMULETOS',9,52,116);
  for(let r=0;r<2;r++){ const x=121+r*16, y=49, id=equipped[r], busy=zFlyTo(r); slot(x,y,14,13,!!id&&!busy);
    if(id&&!busy) popImg(AMULET_SPR[id],x+7,y+7,zPopAt(y,10+r)); }
  for(let i=0;i<10;i++){ const x=10+i*14, y=63, id=am[i], eq=!!id&&equipped.includes(id), on=sel===ni+i; slot(x,y,14,14,eq);
    if(!id) continue; const s=zPopAt(y,i*.6)*(on?zSelPop():1), away=zFx.some(f=>f.kind==='fly'&&f.to>=0&&f.img===AMULET_SPR[id]);
    if(!away) popImg(AMULET_SPR[id],x+7,y+7+(on?bob:0),s);
    if(on) zSel(x,y,14,14); }
  label('EQUIPO',9,79);
  EQUIP.forEach((id,k)=>{ const x=9+k*36, y=86, inf=equipInfo(id), on=sel===ni+na+k; slot(x,y,34,18,false);
    const s=zPopAt(y,k)*(on?zSelPop():1);
    if(inf){ popImg(inf.img,x+10,y+9+(on?bob:0),s);
      if(s>.9){ if(inf.max) for(let l=0;l<inf.max;l++) zPip(x+21+l*4,y+8,l<inf.lvl); else txtS('×20',x+20,y+7,MENU.gold); } }
    else { popImg(zSil(EQUIP_SIL[id]()),x+10,y+9,s); if(s>.9) txtS('?',x+23,y+7,MENU.dim); }
    if(on) zSel(x,y,34,18); });
  zNote(zBagInfo(items,am,ni,na));
}
function zBagInfo(items,am,ni,na){ const s=pauseSel;
  if(s<ni){ const it=items[s]; return {art:X_ICON[it],name:X_NAME[it],desc:X_DESC[it]+(it==='bomb'?' Llevas '+bombAmmo+'/'+bombMax+'.':'')}; }
  if(s<ni+na){ const id=am[s-ni], a=AMULETS[id]; return {art:AMULET_SPR[id],name:a.name,desc:a.desc.replace(/\n/g,' ')+(equipped.includes(id)?' (puesto)':'')}; }
  const id=EQUIP[s-ni-na]; if(!id) return {name:'ZURRÓN VACÍO',desc:'Explora el valle: habla, corta, busca.'};
  const e=equipInfo(id); return e?{art:e.img,name:e.name,desc:e.desc}:{art:zSil(EQUIP_SIL[id]()),name:'¿…?',desc:EQUIP_HINT[id]}; }
function zNote(inf){ // la ficha de pergamino: el dibujo, el nombre y dos líneas que se escriben solas
  const x=8, y=106, w=144, h=26, k=zPopAt(y,0); if(k<=0) return;
  const oy=Math.round((1-Math.min(1,k))*8), Y=y+oy;
  roundBox(x,Y,w,h,HUD.ink); ctx.fillStyle=HUD.paper; ctx.fillRect(x+1,Y+1,w-2,h-2);
  ctx.fillStyle=HUD.paperL; ctx.fillRect(x+2,Y+1,w-4,1); ctx.fillStyle=HUD.paper2; ctx.fillRect(x+1,Y+h-2,w-2,1);
  ctx.fillStyle=HUD.paper2; ctx.fillRect(x+w-5,Y+1,4,1); ctx.fillRect(x+w-3,Y+2,2,2); ctx.fillStyle=HUD.ink; ctx.fillRect(x+w-4,Y+1,1,1); ctx.fillRect(x+w-2,Y+3,1,1); // esquina doblada
  hudWell(x+2,Y+2,24,22);
  if(inf.art){ const a=inf.art, big=a.width<=12?1.5:1, s=(zInfoT<7?easeOutBack(Math.min(1,zInfoT/7)):1)*big;
    popImg(a,x+14,Y+13+Math.round(Math.sin(tick*.1)),s); }
  const nx=x+29, slide=zInfoT<5?5-zInfoT:0;
  ctx.save(); if(slide) ctx.globalAlpha=1-slide/6;
  drawText(ctx,inf.name,nx+slide,Y+4,HUD.paperL,'left',FONT_M); drawText(ctx,inf.name,nx+slide,Y+3,'#7a2e10','left',FONT_M); ctx.restore();
  let n=zInfoT*3; wrapPx(inf.desc,114,FONT_S).slice(0,2).forEach((ln,i)=>{ const t=ln.slice(0,Math.max(0,n)); n-=ln.length+1; if(t) drawText(ctx,t,nx,Y+13+i*7,HUD.text,'left',FONT_S); });
}

/* ---------- mapa ---------- */
function drawMap(){
  const dk=dungeonOf(sx,sy); if(dk){ drawDungeonMap(dk); return; }
  const cw=18,chh=14,ox=80-(5*cw)/2-1,oy=23;
  roundBox(ox-3,oy-2,5*cw+6,7*chh+4,PAL.k); ctx.fillStyle='#0e2016'; ctx.fillRect(ox-2,oy-1,5*cw+4,7*chh+2);
  for(let y=-3;y<=3;y++) for(let x=0;x<=4;x++){ const key=x+','+y; const px=ox+x*cw, py=oy+(y+3)*chh;
    if(!MAPS[key]) continue;
    const seen=visited.has(key), here=sx===x&&sy===y;
    if(seen){ const th=ensureThumb(key); if(th) ctx.drawImage(th,px,py); else { ctx.fillStyle='#3a7a40'; ctx.fillRect(px,py,cw,chh); }
      ctx.fillStyle='rgba(0,0,0,.3)'; ctx.fillRect(px,py+chh-1,cw,1); ctx.fillRect(px+cw-1,py,1,chh);
      if(key==='1,1') ctx.drawImage(OAK,0,0,OAK.width,OAK.height,px+4,py+1,10,11);
      if(key==='2,-1'||key==='1,3'||key==='1,-2'||key==='0,0'||key==='4,3'){ const done=(key==='2,-1'&&bossDone)||(key==='1,3'&&boss2Done)||(key==='1,-2'&&boss3Done)||(key==='4,3'&&boss4Done);
        roundBox(px+5,py+3,8,8,PAL.k); ctx.fillStyle='#3a3448'; ctx.fillRect(px+6,py+4,6,6); ctx.fillStyle=done?'#a8ec78':((tick&31)<20?'#ff5050':'#a82020'); ctx.fillRect(px+8,py+6,2,2); }
      if(key==='0,1'){ ctx.fillStyle='#d84838'; ctx.fillRect(px+3,py+4,4,3); ctx.fillRect(px+10,py+4,4,3); }
      if(key==='1,-3'&&boss3Done) ctx.drawImage(FLAKE_SPR,0,0,16,16,px+5,py+2,9,9); }
    else { ctx.fillStyle='#132419'; ctx.fillRect(px,py,cw,chh); ctx.fillStyle='#1d3324'; ctx.fillRect(px+8,py+6,2,2); }
  }
  if(sx>=0&&sx<=4&&sy>=-3&&sy<=3){ const px=ox+sx*cw, py=oy+(sy+3)*chh, b=Math.round(Math.abs(Math.sin(tick*.15))*2); // tú estás aquí (encima de todo)
    selFrame(px,py,cw,chh); ctx.drawImage(P_SPRITES[0][0],0,0,16,16,px+4,py+1-b,11,11); }
  const where=PLACE_NAMES[sx+','+sy]||'?'; txtO(where,80,124,'#dff0d0','center','#081610');
}
/* el mapa de la mazmorra: salas pisadas; con el MAPA, todas; con la BRÚJULA, el guardián y los cofres */
function dungeonRooms(dk){ return Object.keys(MAPS).filter(k=>{ const [x,y]=k.split(',').map(Number); return dungeonOf(x,y)===dk; }); }
function roomsJoin(a,b,dx,dy){ const A=MAPS[a], B=MAPS[b], open=c=>!SOLID.has(c)||c===')'||c==='Ł'||c==='C'||c==='=';
  if(dx){ for(let i=0;i<8;i++) if(open(A[i][dx>0?9:0])&&open(B[i][dx>0?0:9])) return true; } else { for(let i=0;i<10;i++) if(open(A[dy>0?7:0][i])&&open(B[dy>0?0:7][i])) return true; } return false; }
function drawDungeonMap(dk){
  const rooms=dungeonRooms(dk), xs=rooms.map(k=>+k.split(',')[0]), ys=rooms.map(k=>+k.split(',')[1]);
  const x0=Math.min(...xs), x1=Math.max(...xs), y0=Math.min(...ys), y1=Math.max(...ys), cols=x1-x0+1, rows=y1-y0+1;
  const cw=24, ch=17, gap=4, W=cols*cw+(cols-1)*gap, H=rows*ch+(rows-1)*gap, ox=80-(W>>1), oy=32+Math.max(0,(84-H)>>1);
  const hasMap=dmaps.has(dk), hasComp=dcomp.has(dk);
  txtO(DUNGEON_NAMES[dk],80,23,MENU.gold,'center','#081610');
  const pos=k=>{ const [x,y]=k.split(',').map(Number); return [ox+(x-x0)*(cw+gap),oy+(y-y0)*(ch+gap)]; };
  // pasillos entre salas conocidas
  for(const k of rooms){ const [x,y]=k.split(',').map(Number), [px,py]=pos(k);
    for(const [dx,dy] of [[1,0],[0,1]]){ const n=(x+dx)+','+(y+dy); if(!MAPS[n]||dungeonOf(x+dx,y+dy)!==dk) continue;
      const known=(visited.has(k)||hasMap)&&(visited.has(n)||hasMap); if(!known||!roomsJoin(k,n,dx,dy)) continue;
      ctx.fillStyle=visited.has(k)&&visited.has(n)?'#8fc39a':'#3e6a4a'; if(dx) ctx.fillRect(px+cw,py+(ch>>1)-1,gap,3); else ctx.fillRect(px+(cw>>1)-1,py+ch,3,gap); } }
  for(const k of rooms){ const [px,py]=pos(k), seen=visited.has(k), here=k===sx+','+sy;
    if(!seen&&!hasMap) continue;
    roundBox(px,py,cw,ch,PAL.k);
    if(seen){ ctx.fillStyle=here?'#4a8a58':'#2e5a3a'; ctx.fillRect(px+1,py+1,cw-2,ch-2); ctx.fillStyle=here?'#6aaa70':'#3e7048'; ctx.fillRect(px+1,py+1,cw-2,1); }
    else { ctx.fillStyle='#15281c'; ctx.fillRect(px+1,py+1,cw-2,ch-2); ctx.fillStyle='#2a4a34'; for(let i=px+2;i<px+cw-2;i+=3) ctx.fillRect(i,py+(ch>>1),1,1); }
    if(hasComp){ // el guardián y los cofres que faltan
      if(DUNGEON_BOSS[dk]===k){ const done=(dk==='cueva'&&bossDone)||(dk==='tronco'&&boss2Done)||(dk==='templo'&&boss3Done)||(dk==='molino'&&boss4Done); const bx=px+(cw>>1)-3, by=py+(ch>>1)-3;
        ctx.fillStyle=PAL.k; ctx.fillRect(bx-1,by-1,8,8); ctx.fillStyle=done?'#a8ec78':((tick&31)<20?'#ff5050':'#a82020'); ctx.fillRect(bx,by,6,5); ctx.fillStyle=PAL.k; ctx.fillRect(bx+1,by+2,1,1); ctx.fillRect(bx+4,by+2,1,1); ctx.fillRect(bx+2,by+5,2,1); }
      const M=MAPS[k]; let n=0; for(let yy=0;yy<SH;yy++) for(let xx=0;xx<SW;xx++){ const c=M[yy][xx], id='CH'+k+':'+xx+','+yy; if((c==='¤'||CHESTS[k+':'+xx+','+yy])&&!opened.has(id)){ ctx.fillStyle=(tick&15)<9?'#ffd060':'#b08020'; ctx.fillRect(px+3+n*4,py+ch-5,2,2); n++; } } }
    if(here&&(tick&15)<11) ctx.drawImage(P_SPRITES[0][0],0,0,16,16,px+(cw>>1)-5,py+2,10,10); }
  // lo que llevas de esta mazmorra
  const by=124; ctx.save(); if(!hasMap) ctx.globalAlpha=.25; ctx.drawImage(MAP_SPR,0,0,16,16,9,by-3,11,11); ctx.restore();
  ctx.save(); if(!hasComp) ctx.globalAlpha=.25; ctx.drawImage(COMPASS_SPR,0,0,16,16,23,by-3,11,11); ctx.restore();
  ctx.drawImage(KEY_SPR,41,by-2); txtS('×'+(dungeonKeys[dk]||0),50,by,'#dff0d0');
  ctx.save(); if(!bigKeys[dk]) ctx.globalAlpha=.25; ctx.drawImage(BIGKEY_SPR,0,0,12,10,65,by-2,12,10); ctx.restore();
  const where=PLACE_NAMES[sx+','+sy]||'?'; txtS(where,151,by,'#9ec7aa','right');
}
/* ---------- el valle: cómo va la historia ---------- */
function drawValle(){
  txtO(CHAPTER_NAMES[chapterIdx()],80,24,MENU.gold,'center','#081610');
  const X=88, row=(t,y)=>{ txtS(t,9,y+2,MENU.label); ctx.fillStyle=MENU.line; ctx.fillRect(9,y+9,142,1); };
  row('SEMILLAS',33); for(let i=0;i<8;i++){ const on=won||i<seeds; ctx.save(); if(!on) ctx.globalAlpha=.22; ctx.drawImage(ACORN_GOLD,X+i*8,32+(on&&((tick>>3)%8)===i?-1:0)); ctx.restore(); }
  row('ESTACIONES',43); [[EMBER_SPR,thawed],[TEAR_SPR,summered],[AMBER_SPR,autumned],[FLAKE_SPR,cycled]].forEach(([sp,on],i)=>{ const x=X+i*14; ctx.save(); if(!on) ctx.globalAlpha=.22; ctx.drawImage(sp,0,0,16,16,x,42,9,9); ctx.restore(); });
  row('VIGOR',53); ctx.drawImage(HEART_FULL,X,53); txt(''+(player.maxHp/2),X+10,53);
  for(let i=0;i<4;i++){ ctx.fillStyle=i<pieces?'#f04850':'#2a3a2e'; ctx.beginPath(); ctx.moveTo(X+34,57); ctx.arc(X+34,57,4,i*Math.PI/2-Math.PI/2,(i+1)*Math.PI/2-Math.PI/2); ctx.fill(); }
  ctx.strokeStyle=PAL.k; ctx.beginPath(); ctx.arc(X+34,57,4,0,6.283); ctx.stroke(); txtS(pieces+'/4',X+42,55,MENU.label);
  row('AMULETOS',63); txt(amulets.size+'/'+Object.keys(AMULETS).length,X,63); row('CARTAS',73); ctx.drawImage(LETTER_SPR,0,0,LETTER_SPR.width,LETTER_SPR.height,X,74,10,7); txt(lettersCount()+'/5',X+13,73);
  row('SECRETOS',83); txt(secretsFound()+'/'+SECRETS.length,X,83);
  row('TRUEQUE',93); if(tradeStep>0&&tradeStep<8){ ctx.drawImage(TRADE[tradeStep].spr,56,93); txtS(TRADE[tradeStep].name,67,95,'#fff6d0'); } else if(tradeStep>=8){ ctx.drawImage(AMULET_SPR.trebol,0,0,12,12,56,92,10,10); txtS('COMPLETO',68,95,MENU.gold); } else txtS('—',X,95,MENU.dim);
  row('PESCA',103); for(let i=0;i<4;i++) fishIcon(i,X+i*13,105,!!(fishDex&(1<<i)));
  row('TIEMPO',113); txt(timeStr(playTime),X,113); row('MARCHITADO',123); txt(wilts+(wilts===1?' vez':' veces'),X,123);
}
/* ---------- recuerdos: todo lo leído ---------- */
function drawLore(){
  const L=loreList();
  if(!L.length){ ctx.save(); ctx.globalAlpha=.35; ctx.drawImage(TAB_ICONS.recuerdos,0,0,10,10,70,30,20,20); ctx.restore();
    txt('Aún no has leído nada.',80,60,MENU.dim,'center'); txt('Busca diarios, runas,',80,72,MENU.dim,'center'); txt('libros y cartas.',80,84,MENU.dim,'center'); return; }
  const rows=9, top=Math.max(0,Math.min(loreSel-4,L.length-rows));
  txtS((loreSel+1)+'/'+L.length,151,23,MENU.dim,'right');
  for(let i=0;i<rows;i++){ const e=L[top+i]; if(!e) break; const y=32+i*11, sel=top+i===loreSel;
    if(sel){ ctx.fillStyle='#1b3a26'; ctx.fillRect(8,y-2,144,11); ctx.drawImage(CURSOR_SPR,9+((tick&15)<8?0:1),y); }
    const ic=e.kind==='diario'?DIARY_SPR:e.kind==='carta'?LETTER_SPR:e.kind==='runa'?runeTile(0):bookshelfTile();
    if(e.kind==='runa'||e.kind==='libro') ctx.drawImage(ic,0,0,16,16,19,y-1,9,9); else ctx.drawImage(ic,0,0,ic.width,ic.height,19,y,8,7);
    let t=e.title; while(textW(t)>118&&t.length>3) t=t.slice(0,-2)+'…';
    txt(t,31,y,sel?'#fffbe8':'#9ec7aa'); }
  zSel(8,32+(loreSel-top)*11-2,144,11);
}
/* ---------- ajustes ---------- */
function drawOptions(){
  if(optRemap){ drawRemap(); return; }
  OPT_ROWS.forEach((id,i)=>{ const y=26+i*11, sel=i===optSel;
    slot(8,y-3,144,11,false);
    if(sel){ ctx.fillStyle='#1f4029'; ctx.fillRect(9,y-2,142,9); ctx.drawImage(CURSOR_SPR,10+((tick&15)<8?0:1),y-1); }
    txt(OPT_NAMES[id],20,y-1,sel?'#fffbe8':'#9ec7aa');
    if(id==='musica'||id==='efectos') drawSlider(97,y-2,id==='musica'?(opts.musVol??7):(opts.sfxVol??8),id==='musica'&&!musicOn,sel);
    else { const v=id==='texto'?(opts.textSpeed===2?'RÁPIDO':'NORMAL'):id==='temblor'?(opts.shake?'SÍ':'NO'):id==='dificultad'?DIFF_NAMES[opts.diff??1]:id==='vibracion'?(opts.vib===0?'NO':'SÍ'):id==='controles'?'>':'';
      if(v) txtO(v,148,y-1,id==='dificultad'?['#8ad860',MENU.gold,'#ff7050'][opts.diff??1]:MENU.gold,'right','#081610'); } });
  zSel(8,26+optSel*11-3,144,11);
  txtS('GUARDADO AUTOMÁTICO',80,117,MENU.dim,'center'); txtS('RANURA '+(curSlot+1)+' · '+visited.size+' LUGARES',80,124,MENU.dim,'center');
}
/* barra de volumen de 10 muescas que crecen, verde → oro → rojo */
function drawSlider(x,y,v,muted,sel){
  for(let i=0;i<10;i++){ const h=3+Math.round(i*.5), yy=y+8-h, on=i<v;
    ctx.fillStyle=PAL.k; ctx.fillRect(x+i*5-1,yy-1,5,h+2);
    ctx.fillStyle=muted?(on?'#4a5a4e':'#12281a'):on?(i<6?'#8ad860':i<8?'#f0b848':'#ff7050'):'#12281a'; ctx.fillRect(x+i*5,yy,3,h);
    if(on&&!muted){ ctx.fillStyle='rgba(255,255,255,.35)'; ctx.fillRect(x+i*5,yy,3,1); } }
  if(muted) txtSO('MUDA',x+25,y+1,'#ff9080','center','#081610');
}
/* la pantalla de controles: cada acción con su tecla; Z y luego la tecla nueva */
function drawRemap(){ // el título de la placa pasa a decir CONTROLES; filas con el mismo paso que AJUSTES
  const K=keysNow(), n=ACTIONS.length, rowY=i=>i<n?26+i*11:28+i*11;
  const row=(label,value,i,warn)=>{ const y=rowY(i), sel=remapSel===i;
    slot(8,y-3,144,11,false);
    if(sel){ ctx.fillStyle='#1f4029'; ctx.fillRect(9,y-2,142,9); ctx.drawImage(CURSOR_SPR,10+((tick&15)<8?0:1),y-1); }
    txt(label,20,y-1,sel?'#fffbe8':'#9ec7aa'); if(value) txtO(value,148,y-1,warn?'#ffd060':MENU.gold,'right','#081610'); };
  ACTIONS.forEach((a,i)=>{ const waiting=remapWait===a; row(ACTION_NAMES[a],waiting?((tick&31)<22?'?':''):keyName(K[a]),i,waiting); });
  row('Restaurar','',n); row('Volver','',n+1);
  zSel(8,rowY(remapSel)-3,144,11);
  if(remapWait&&(tick&31)<24) txtSO('PULSA LA TECLA NUEVA · ESC CANCELA',80,127,'#ffd060','center','#081610');
}

/* ---------- la bolsa: pestañas, placa, pie, solapa ---------- */
function zPage(p){ if(p===0) drawBag(); else if(p===1) drawMap(); else if(p===2) drawValle(); else if(p===3) drawLore(); else drawOptions(); }
function zPages(){ // la página de ahora; al cambiar de pestaña, la vieja se va por la izquierda y la nueva entra por la derecha
  const sliding=zTabT<8;
  ctx.save(); ctx.beginPath(); if(sliding) ctx.rect(ZL.x,ZL.y,ZL.w,ZL.h); else ctx.rect(ZL.x-3,ZL.y,ZL.w+6,ZL.h); ctx.clip();
  if(sliding){ const e=1-Math.pow(1-zTabT/8,3), W=ZL.w+8;
    ctx.save(); ctx.translate(-Math.round(e*W),0); zNoGlide=true; zPage(zTabFrom); zNoGlide=false; ctx.restore();
    ctx.save(); ctx.translate(Math.round((1-e)*W),0); zPage(pausePage); ctx.restore(); }
  else zPage(pausePage);
  ctx.restore(); }
function zTag(x,y,ic,on){ // lengüeta de cuero con su ventanita de fieltro
  roundBox(x,y,15,15,ZUR.ink);
  ctx.fillStyle=on?ZUR.hi:ZUR.md; ctx.fillRect(x+1,y+1,13,13);
  ctx.fillStyle=on?ZUR.sh:ZUR.lt; ctx.fillRect(x+2,y+1,11,1);
  ctx.fillStyle=on?'#2a5a38':'#10241a'; ctx.fillRect(x+2,y+2,11,11);
  ctx.fillStyle=on?'#1c3a26':'#0a1810'; ctx.fillRect(x+2,y+2,11,1);
  ctx.save(); if(!on) ctx.globalAlpha=.55; ctx.drawImage(TAB_ICONS[ic],x+3,y+3); ctx.restore();
  if(on){ ctx.strokeStyle=MENU.gold; ctx.lineWidth=1; ctx.strokeRect(x+.5,y+.5,14,14); ctx.fillStyle='#fff0b0'; ctx.fillRect(x+1,y+1,1,1); } }
function zClosing(){ return state!=='pause'&&!zLore; }
function zTabs(){
  const cl=zClosing(), o=zOpenT;
  ctx.save(); ctx.beginPath(); ctx.rect(0,0,VW,ZL.y-1); ctx.clip();
  PAUSE_TABS.forEach(([ic],i)=>{ const on=i===pausePage;
    let sink=0; if(cl) sink=Math.min(18,zCloseT*4); else if(o<60){ const t=(o-(Z_FLAP1-3)-i*1.5)/7; sink=t<=0?18:t>=1?0:(1-easeOutBack(t))*18; }
    const hop=on&&zTabT<8?Math.round(Math.sin(Math.PI*zTabT/8)*2):0;
    zTag(6+i*17,(on?1:4)+Math.round(sink)-hop,ic,on); });
  ctx.restore(); }
function zPlaque(){ // la placa de latón con el nombre de la página; gira al cambiar de pestaña
  const cl=zClosing(), o=zOpenT;
  let off=0; if(cl) off=Math.min(90,zCloseT*zCloseT*1.3); else if(o<60){ const t=(o-(Z_FLAP1-4))/8; off=t<=0?90:t>=1?0:(1-easeOutBack(t))*90; }
  if(off>=88) return;
  const x=91+Math.round(off), y=3, w=64, h=15;
  let sy=1, title=pausePage===4&&optRemap?'CONTROLES':PAUSE_TABS[pausePage][1];
  if(zTabT<6){ if(zTabT<3){ sy=Math.cos(Math.PI/2*zTabT/3); title=PAUSE_TABS[zTabFrom][1]; } else sy=Math.sin(Math.PI/2*(zTabT-3)/3); }
  ctx.save(); if(sy<1){ ctx.translate(0,y+h/2); ctx.scale(1,Math.max(.1,sy)); ctx.translate(0,-(y+h/2)); }
  roundBox(x,y,w,h,ZUR.brassK); ctx.fillStyle=ZUR.brass; ctx.fillRect(x+1,y+1,w-2,h-2);
  ctx.fillStyle=ZUR.brassL; ctx.fillRect(x+2,y+1,w-4,1); ctx.fillRect(x+1,y+2,1,h-4);
  ctx.fillStyle=ZUR.brassD; ctx.fillRect(x+2,y+h-2,w-4,1); ctx.fillRect(x+w-2,y+2,1,h-4);
  for(const cx of [x+3,x+w-5]){ ctx.fillStyle=ZUR.brassD; ctx.fillRect(cx,y+2,2,2); ctx.fillStyle=ZUR.brassL; ctx.fillRect(cx,y+2,1,1); }
  const g=tick%200; if(g<12){ const gx=x+3+g*5; if(gx<x+w-4){ ctx.fillStyle='rgba(255,255,236,.5)'; ctx.fillRect(gx,y+2,2,h-4); if(gx+3<x+w-2) ctx.fillRect(gx+3,y+2,1,h-4); } } // un brillo que cruza
  drawText(ctx,title,x+w/2,y+5,ZUR.brassL,'center',FONT_M); drawText(ctx,title,x+w/2,y+4,'#4a2c06','center',FONT_M);
  ctx.restore(); }
function zHintPairs(){ const K=keysNow(), F=keyName(K.fire), A=keyName(K.alt), M=keyName(K.menu);
  if(pausePage===4&&optRemap) return [[F,'ASIGNAR'],[A,'VOLVER']];
  if(pausePage===4) return [['←→','AJUSTAR'],[F,'CAMBIAR'],[A,'PESTAÑA']];
  if(pausePage===3) return [[F,'LEER'],[A,'PESTAÑA'],[M,'CERRAR']];
  if(pausePage===0){ const r=bagRow(); if(r===0) return [[F,'EQUIPAR'],[A,'PESTAÑA'],[M,'CERRAR']];
    if(r===1){ const id=[...amulets][pauseSel-ownedX().length]; return [[F,equipped.includes(id)?'QUITAR':'PONER'],[A,'PESTAÑA'],[M,'CERRAR']]; } }
  return [[A,'PESTAÑA'],[M,'CERRAR']]; }
function zHint(){ // el pie, con letras doradas estampadas en el cuero y las teclas en pastillas
  const cl=zClosing(); let a=cl?1-zCloseT/Z_CFLAP:(zOpenT-(Z_FLAP1-2))/6; if(a<=0) return; a=Math.min(1,a);
  let P=zHintPairs(); const wOf=L=>L.reduce((s,[k,l])=>s+textW(k,FONT_S)+6+textW(l,FONT_S),0)+(L.length-1)*7;
  while(P.length>1&&wOf(P)>144) P=P.slice(0,-1);
  let x=Math.round(80-wOf(P)/2); const y=135;
  ctx.save(); ctx.globalAlpha=a;
  for(const [k,l] of P){ const w=textW(k,FONT_S)+4; roundBox(x,y-1,w,7,ZUR.ink); ctx.fillStyle='#3a200c'; ctx.fillRect(x+1,y,w-2,5); ctx.fillStyle='#5a3418'; ctx.fillRect(x+1,y,w-2,1);
    drawText(ctx,k,x+2,y,'#f8e4b0','left',FONT_S); x+=w+2;
    drawText(ctx,l,x,y+1,ZUR.ink,'left',FONT_S); drawText(ctx,l,x,y,ZUR.foil,'left',FONT_S); x+=textW(l,FONT_S)+7; }
  ctx.restore(); }
function zBuckle(cx,y,pop){ const x=Math.round(cx-7), yy=Math.round(y-pop); // la hebilla de latón
  roundBox(x,yy,14,9,ZUR.brassK); ctx.fillStyle=ZUR.brass; ctx.fillRect(x+1,yy+1,12,7); ctx.fillStyle=ZUR.brassL; ctx.fillRect(x+2,yy+1,10,1); ctx.fillRect(x+1,yy+2,1,4);
  ctx.fillStyle=ZUR.brassD; ctx.fillRect(x+1,yy+7,12,1); ctx.fillRect(x+12,yy+2,1,5);
  ctx.fillStyle=ZUR.lt; ctx.fillRect(x+3,yy+3,8,3); ctx.fillStyle=ZUR.dk; ctx.fillRect(x+3,yy+3,8,1);
  ctx.fillStyle=ZUR.brassL; ctx.fillRect(x+6,yy+2,2,5); ctx.fillStyle=ZUR.brassK; ctx.fillRect(x+6,yy+6,2,1); }
function zFlap(k){ // k: 1 = cerrada, 0 = levantada del todo (se aplasta contra la bisagra y se oscurece al girar)
  if(k<=0) return; const W=ZUR_FLAP.width, H=ZUR_FLAP.height, h=Math.max(1,Math.round(H*k)), by=ZF.y+Math.round(ZF.h*k);
  if(by<ZL.y+ZL.h){ ctx.fillStyle='rgba(0,0,0,.32)'; ctx.fillRect(ZL.x,by,ZL.w,3); ctx.fillStyle='rgba(0,0,0,.16)'; ctx.fillRect(ZL.x,by+3,ZL.w,2); } // su sombra
  ctx.drawImage(ZUR_FLAP,0,0,W,H,ZB.x,ZF.y,W,h);
  if(k<1){ ctx.globalAlpha=(1-k)*.6; ctx.drawImage(ZUR_FLAP_D,0,0,W,H,ZB.x,ZF.y,W,h); ctx.globalAlpha=1; }
  const o=zOpenT, pop=!zClosing()&&o>=Z_FLAP0-1&&o<Z_FLAP0+2?2:0;
  zBuckle(80,ZF.y+(ZF.h+3)*k,pop);
  if(pop){ ctx.fillStyle='#fff6c8'; const bx=80, byy=ZF.y+(ZF.h+3)*k; ctx.fillRect(bx+8,byy-3,1,3); ctx.fillRect(bx+7,byy-2,3,1); ctx.fillRect(bx-9,byy+1,1,3); ctx.fillRect(bx-10,byy+2,3,1); } }
function zDrawFx(){ for(const f of zFx){ const k=f.t/f.life;
  if(f.kind==='spark'){ const x=f.x+f.vx*f.t, y=f.y+f.vy*f.t+.05*f.t*f.t, s=f.t<5?2:1; ctx.globalAlpha=1-k*.8; ctx.fillStyle=f.col; ctx.fillRect(Math.round(x),Math.round(y),s,s); ctx.globalAlpha=1; }
  else if(f.kind==='ring'){ ctx.strokeStyle='rgba(255,240,160,'+(1-k).toFixed(2)+')'; ctx.lineWidth=1; ctx.beginPath(); ctx.arc(f.x,f.y,2+k*11,0,6.283); ctx.stroke(); }
  else if(f.kind==='fly'){ const e=smooth(k), x=lerp(f.x0,f.x1,e), y=lerp(f.y0,f.y1,e)-Math.sin(Math.PI*e)*16; popImg(f.img,x,y,1+.35*Math.sin(Math.PI*e)); } } }
function zBag(P){ // pinta el zurrón entero en zCv
  const main=ctx; ctx=zCx; ctx.save(); ctx.clearRect(0,0,VW,VH);
  try{
    ctx.drawImage(ZUR_BODY,ZB.x,ZB.y); ctx.drawImage(ZUR_LINING,ZL.x,ZL.y);
    if(P.flap<1) zPages();
    zDrawFx(); zTabs(); zPlaque(); zHint(); zFlap(P.flap);
  } finally { ctx.restore(); ctx=main; } }
function zPose(){ // dónde está el zurrón, cómo se deforma y cuánto tapa la solapa
  const P={dy:0,sx:1,sy:1,flap:0};
  if(!zClosing()){ const o=zOpenT;
    if(o<Z_FALL){ const k=o/Z_FALL; P.dy=-148*(1-k*k); P.flap=1; P.sy=1+.05*k; P.sx=1-.025*k; } // cae y se estira
    else { const j=o-Z_FALL;
      if(j<10){ P.sy=1-.085*Math.cos(j*.9)*Math.exp(-j*.45); P.sx=1+(1-P.sy)*.55; }    // aterriza: se aplasta y rebota
      if(j>=2&&j<9) P.dy=-3*Math.sin(Math.PI*(j-2)/7);
      P.flap=o<Z_FLAP0?1:o<Z_FLAP1?1-smooth((o-Z_FLAP0)/(Z_FLAP1-Z_FLAP0)):0; } }
  else { const c=zCloseT;
    P.flap=c<Z_CFLAP?smooth(c/Z_CFLAP):1;
    if(c>=Z_CFLAP-1&&c<Z_CLIFT){ P.sy=.95; P.sx=1.03; P.dy=1; }                           // lo agarras
    if(c>=Z_CLIFT){ const k=(c-Z_CLIFT+1)/(Z_CEND-Z_CLIFT); P.dy=-152*k*k; P.sy=1+.06*Math.min(1,k*2); P.sx=1-.03*Math.min(1,k*2); } }
  return P; }
function zComposite(P){ const dw=Math.round(VW*P.sx), dh=Math.round(VH*P.sy), dx=Math.round((VW-dw)/2), dy=Math.round(141-141*P.sy+P.dy);
  ctx.drawImage(zCv,0,0,VW,VH,dx,dy,dw,dh); }
const Z_PUFFS=[...Array(10)].map((_,i)=>({s:i<5?-1:1,vx:.22+(i%5)*.16,vy:.3+((i*3)%5)*.14,r:2+(i%3),d:(i%5)*.7}));
function pxDisc(cx,cy,r,col){ ctx.fillStyle=col; cx=Math.round(cx); cy=Math.round(cy); r=Math.max(1,Math.round(r)); for(let dy=-r;dy<=r;dy++){ const w=Math.floor(Math.sqrt(r*r-dy*dy+.5)); ctx.fillRect(cx-w,cy+dy,w*2+1,1); } }
function zDust(o){ // nubecitas de polvo al aterrizar y dos hojitas que se escapan al abrir la solapa
  const t=o-Z_FALL; if(t>=0&&t<22){ const k=t/22; ctx.save();
    for(const p of Z_PUFFS){ const tt=Math.max(0,t-p.d), x=(p.s<0?6:153)+p.s*p.vx*tt*1.5, y=139-p.vy*tt*1.3+.016*tt*tt, r=p.r+tt*.17;
      ctx.globalAlpha=.9*(1-k); pxDisc(x,y,r,'#e6d8b4'); pxDisc(x+r*.35,y+r*.35,r*.55,'#c4b08a'); }
    ctx.restore(); }
  const u=o-Z_FLAP0-2; if(u>=0&&u<30) for(let i=0;i<2;i++){ const dir=i?1:-1, x=80+dir*(16+u*1.2)+Math.sin(u*.3+i*2)*4, y=17-u*1.3+u*u*.012;
    if(y>-4) leafPx(Math.round(x),Math.round(y),i===0,false); } }
/* el menú abierto: el mundo apagado, el zurrón cayendo o quieto, y el polvo */
function drawPause(){
  const o=zOpenT, P=zPose();
  if(!zSnapOk) zShoot();
  ctx.drawImage(zSnap,0,0); const d=zLore?1:smooth(clamp(o/9,0,1)); if(d>0){ ctx.globalAlpha=d; ctx.drawImage(zDim,0,0); ctx.globalAlpha=1; }
  zBag(P); zComposite(P); if(!zLore) zDust(o); }
/* al cerrar: el juego ya corre, el apagado se va y el zurrón sale volando */
function drawZurronOut(){
  if(zCloseT<0||!zSnapOk) return; const c=zCloseT;
  const a=1-smooth(clamp((c-2)/11,0,1)); if(a>0){ ctx.globalAlpha=a; ctx.drawImage(zDim,0,0); ctx.globalAlpha=1; }
  const P=zPose(); zBag(P); zComposite(P); }
