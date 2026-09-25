'use strict';
/* ============================================================
   LA ARDILLA LADRONA
   Dibujada con volúmenes (blobArt), como las demás criaturas: la cola enorme y esponjosa, orejas, barriga crema,
   ojo con brillo y naricilla. Cada pose se genera una vez y se guarda (squirrelArt).
   · Pasea a saltitos (se aplasta al caer y levanta polvo), se sienta a mordisquear y mira alrededor.
   · Si llevas bayas y te ve: «!», orejas y cola arriba, se agacha… y se lanza a por ti a saltos rápidos.
   · Te roba una baya (vuela de ti a su boca), se ríe y huye con los mofletes llenos hacia el borde más cercano,
     y sale de la pantalla; si se queda atascada, excava y se mete en la tierra. Nunca se desvanece sin más.
   · Si la alcanzas mientras huye, suelta todas las bayas robadas en abanico y se queda mareada.
   · Sin bayas es tímida: si te acercas, se aparta a saltitos.
   ============================================================ */
const SQ_FUR=['#3a1406','#7a3010','#b8541e','#e07a34','#f8b060'], SQ_TAIL=['#6a2a0c','#b85a1c','#ec8c34','#ffbc62','#fff0c8'], SQ_LINE='#3a1406';
const SQ_CACHE=new Map();
/* una pose, mirando a la IZQUIERDA (se voltea al dibujar). pose: sit | nibble | look | run | alert | carry | dizzy
   sq: aplastar (<1) o estirar (>1) · tail: vaivén de la cola (-1..1) · f: fotograma (mordisqueo, pasos; 9 = parpadeo) */
function squirrelArt(pose,sq,tail,f){ sq=Math.round((sq||1)*10)/10; tail=Math.round((tail||0)*2)/2; f=f||0;
  const key=pose+'|'+sq+'|'+tail+'|'+f; let c=SQ_CACHE.get(key); if(c) return c;
  const W=24, H=21; c=mkCanvas(W,H); const g=c.getContext('2d'), by=18; // by: la línea del suelo en el lienzo
  const Y=y=>by-(by-y)*sq, L=(x,y,r,ry)=>({x,y:Y(y),r,ry:(ry||r)*sq});
  const run=pose==='run', up=pose==='alert';
  // la cola: un penacho continuo que sube en S por detrás (o se estira hacia atrás al correr), con su propio contorno
  const T=run?[[13.5,12.5],[17,10],[19.5,7.5+tail],[20.5,4.5+tail*1.5],[19,2.5+tail*1.5]]
             :up?[[12.5,14],[15,11],[16,7.5],[15.5,4],[13.5,2.5]]
                :[[12,15],[15,12.5],[17,9+tail*.5],[16.5,5+tail*.5],[14.5,3+tail],[12.8,3.6+tail]];
  const tl=[]; for(let i=0;i<T.length-1;i++) for(let k=0;k<2;k++){ const u=(i+k/2)/(T.length-1), x=T[i][0]+(T[i+1][0]-T[i][0])*k/2, y=T[i][1]+(T[i+1][1]-T[i][1])*k/2; tl.push(L(x,y,1.9+2*Math.sin(Math.PI*Math.min(1,u*1.15)))); }
  blobArt(g,0,0,W,H,tl,SQ_TAIL,{outline:SQ_LINE,grad:.3,dither:.55});
  // el cuerpo: pera sentada (o alargado al correr)
  const body=run?[L(11,13,5.2,3.2),L(8,13.5,3,2.6)]:[L(10,13,3.7,4.3),L(11.5,15.2,3.2,2.4)];
  blobArt(g,0,0,W,H,body,SQ_FUR,{outline:false,grad:.4,dither:.5});
  // la cabeza con su hocico, y la oreja puntiaguda con mechón
  const hx=run?5.6:(pose==='look'&&f?6.8:6.4), hy=run?10.4:up?5.4:7;
  const head=[L(hx,hy,3.7,3.4),L(hx-2.6,hy+1.1,1.9,1.6)]; if(pose==='carry') head.push(L(hx-1,hy+2,2.5,2));
  blobArt(g,0,0,W,H,head,SQ_FUR,{outline:SQ_LINE,grad:.2,dither:.45});
  const P=(x,y,col)=>{ g.fillStyle=col; g.fillRect(Math.round(x),Math.round(Y(y)),1,1); };
  const ex0=Math.round(hx+1), ey0=hy-3.4-(up?1:0); // la oreja: triángulo de 3 px de alto y el mechón oscuro
  for(let j=0;j<3;j++){ P(ex0,ey0+j,j===0?SQ_FUR[0]:SQ_FUR[3]); if(j>0) P(ex0+1,ey0+j,SQ_FUR[2]); } P(ex0,ey0-1,SQ_LINE); P(ex0-1,ey0,SQ_LINE); P(ex0+1,ey0,SQ_LINE); P(ex0+2,ey0+1,SQ_LINE);
  // la barriga crema, las manitas y los pies
  if(!run){ for(let y=11;y<=16;y++) for(let x=8;x<=(y<13?9:10);x++) P(x,y,y<13?'#fff0d0':'#f4d8a8'); }
  else { for(let x=8;x<=13;x++) P(x,15,'#f4d8a8'); }
  if(pose==='nibble'||pose==='carry'){ P(hx-2.4,hy+3.2,'#fff0d0'); P(hx-1.4,hy+3.2,'#f4d8a8'); if(pose==='nibble'&&!(f&1)){ P(hx-2.4,hy+2.4,'#8a5a20'); } } // las manitas a la boca (con su bellotita)
  else if(!run){ P(7.4,13,'#fff0d0'); P(7.4,14,'#e0b888'); }
  if(run){ const a=f&1; for(const [x,c] of [[6+a,0],[7+a,1],[14-a,0],[15-a,1]]) P(x,17,SQ_FUR[c]); }
  else { for(const [x,c] of [[7,0],[8,1],[12,0],[13,1]]) P(x,17,SQ_FUR[c]); }
  // la cara: ojo grande con brillo (o mareo, o parpadeo), naricilla y moflete
  const ex=Math.round(hx-.8), ey=Math.round(hy-1);
  if(pose==='dizzy'){ for(const [a,b2] of [[-1,-1],[1,-1],[0,0],[-1,1],[1,1]]) P(ex+a,ey+b2,SQ_LINE); }
  else if(f===9){ P(ex-1,ey+1,SQ_LINE); P(ex,ey+1,SQ_LINE); P(ex+1,ey+1,SQ_LINE); }
  else { g.fillStyle=SQ_LINE; g.fillRect(ex-1,Math.round(Y(ey)),2,up?3:2); g.fillRect(ex-1,Math.round(Y(ey+ (up?3:2))),1,1); P(ex-1,ey,'#ffffff'); }
  P(hx-4.4,hy+.6,'#e05070'); P(hx+.6,hy+1.8,'rgba(240,112,112,.8)');
  if(pose==='carry'){ const bx=Math.round(hx-5), bY=Math.round(Y(hy+2.4)); g.fillStyle=SQ_LINE; g.fillRect(bx-1,bY-1,4,4); g.fillStyle='#d83060'; g.fillRect(bx,bY,2,2); g.fillStyle='#ff90b0'; g.fillRect(bx,bY,1,1); g.fillStyle='#3a8a3a'; g.fillRect(bx+1,bY-2,1,1); }
  artOutline(g,W,H);
  SQ_CACHE.set(key,c); if(SQ_CACHE.size>140) SQ_CACHE.delete(SQ_CACHE.keys().next().value); return c; }

/* ---------- el comportamiento (lo llama updEnemies; devuelve noContact: la ardilla nunca hace daño) ---------- */
const SQ_HOP=14;
function sqChitter(n,p){ if(!AC) return; const t=audio().currentTime; for(let i=0;i<(n||3);i++) beep('square',(p||1700)+i*140,(p||1700)+300+i*140,.035,.022,t+i*.06); }
function sqHopStart(e,dx,dy,sp,len){ e.hop={t:0,len:len||SQ_HOP,vx:dx*sp,vy:dy*sp,h:e.st==='dash'?3:5}; if(dx) e.face=dx>0?1:-1; }
function sqHopStep(e){ const H=e.hop; if(!H) return false; H.t++;
  const [bx,by]=moveBlocked(e,e.x+H.vx+e.kx,e.y+H.vy+e.ky); if(e.st!=='flee'){ if(bx) H.vx*=-1; if(by) H.vy*=-1; } e.blocked=(bx||by)?(e.blocked||0)+1:0; // huyendo no rebota: se desliza
  e.z=Math.sin(H.t/H.len*Math.PI)*H.h;
  if(H.t>=H.len){ e.hop=null; e.z=0; e.land=6; if(e.st!=='dash'||(tick&1)) stepDustAt(e.x+8,e.y+15,.4); return false; } return true; }
function updSquirrel(e,dx,dy,d){
  e.t++; if(e.land>0) e.land--; if(e.face===undefined) e.face=-1; if(e.stolen===undefined) e.stolen=0;
  // un golpe: chillido; si llevaba bayas robadas, las suelta en abanico y se marea
  if(e.lastHp!==undefined&&e.hp<e.lastHp&&e.hp>0){ if(AC) beep('square',1500,800,.09,.04);
    if(e.stolen>0){ for(let i=0;i<e.stolen;i++){ const a=-Math.PI*(.2+.6*(i+.5)/e.stolen); pickups.push({kind:'berry',x:e.x+4+Math.cos(a)*6,y:e.y+4+Math.sin(a)*3,t:0,drop:16+i*2}); }
      flyText.push({x:e.x+8,y:e.y-6,txt:'¡Suelta!',t:30,col:'#ffd0e0'}); e.stolen=0; }
    e.st='dizzy'; e.dz=70; e.hop=null; e.z=0; }
  e.lastHp=e.hp;
  if(e.st==='dizzy'){ if((tick&7)===0) sparkle(e.x+4+Math.random()*8,e.y-2,'#fff0a0'); if(--e.dz<=0){ e.st='wander'; e.t2=30; } moveBlocked(e,e.x+e.kx,e.y+e.ky); return true; }
  if(e.st==='dig'){ e.dg++; if(e.dg%3===0) parts.push({k:'shard',x:e.x+8+(Math.random()-.5)*8,y:e.y+14,vx:(Math.random()-.5)*1.6,vy:-1-Math.random(),life:14,max:14,col:Math.random()<.5?'#6a4a2a':'#8a6a40'});
    if(e.dg===30){ puff(e.x+8,e.y+14,'#8a6a40',6,.8); if(AC) noise(.08,.04,false,undefined,500); } if(e.dg>=36) e.despawn=true; return true; }
  if(e.st==='flee'){ // hacia el borde más cercano, a saltos largos, con la baya en la boca; fuera de la pantalla, se ha ido
    if(!e.hop){ const tx=e.ex-(e.x+8), ty=e.ey-(e.y+8), n=Math.hypot(tx,ty)||1; sqHopStart(e,tx/n,ty/n,2.1,12); }
    e.hop.vx+=((e.ex-(e.x+8))>0?.02:-.02); sqHopStep(e);
    if(e.x<-18||e.x>SW*16+2||e.y<-18||e.y>SH*16+2){ e.despawn=true; return true; }
    if(e.x<=1||e.x>=SW*16-17||e.y<=1||e.y>=SH*16-17){ e.x+=e.hop?e.hop.vx:0; e.y+=e.hop?e.hop.vy:0; } // en el borde: el último salto la saca
    if(++e.fleeT>95||e.blocked>24){ e.st='dig'; e.dg=0; e.hop=null; e.z=0; sqChitter(2,1200); } // no llega: se mete en la tierra
    if((e.t&15)===0&&e.stolen) sqChitter(2,2100);
    return true; }
  if(e.st==='alert'){ if(--e.at<=0){ e.st='dash'; e.dt=80; sqChitter(3,1900); } e.face=dx>0?1:-1; return true; }
  if(e.st==='dash'){ // a saltos rápidos y bajos hacia ti
    if(!e.hop) sqHopStart(e,dx/d,dy/d,2,9); sqHopStep(e);
    if(rectsHit([e.x+3,e.y+4,10,9],hitPlayerBox())&&berries>0){ sqSteal(e); return true; }
    if(--e.dt<=0||d>120||berries<=0){ e.st='wander'; e.t2=40; }
    return true; }
  if(e.st==='shy'){ if(!e.hop){ if(e.sh-->0) sqHopStart(e,-dx/d,-dy/d,1.4,12); else { e.st='wander'; e.t2=50; } } sqHopStep(e); return true; }
  // paseo: saltitos en una dirección, luego se sienta a mordisquear y a mirar
  if(e.hop){ sqHopStep(e); }
  else { e.t2=(e.t2||0)-1;
    if(e.t2<=0){ if(e.mode==='sit'){ e.mode='hops'; e.hops=2+(e.t%3); const a=Math.random()*6.283; e.hd=[Math.cos(a),Math.sin(a)*.7]; }
      else { e.mode='sit'; e.t2=50+hash(e.x|0,e.y|0)%60; } }
    if(e.mode==='hops'){ if(e.hops-->0) sqHopStart(e,e.hd[0],e.hd[1],1.1,SQ_HOP); else { e.mode='sit'; e.t2=50+(e.t%50); } } }
  if(berries>0&&d<60&&!(e.cool>0)&&!e.hop){ e.st='alert'; e.at=20; flyText.push({x:e.x+8,y:e.y-8,txt:'!',t:20,col:'#f8d030'}); sqChitter(2,2300); }
  else if(berries<=0&&d<30&&!e.hop){ e.st='shy'; e.sh=2; }
  if(e.cool>0) e.cool--;
  return true; }
/* el robo: la baya vuela de Sprout a su boca, se ríe y echa a correr hacia el borde más cercano */
function sqSteal(e){ berries--; e.stolen++; SFX.bump(); shake=2; player.squash=-.2;
  parts.push({k:'mote',x:player.x+8,y:player.y+4,vx:(e.x-player.x)*.06,vy:-1.2,life:18,max:18,sway:0,col:'#d83060',nog:false});
  puff(player.x+8,player.y+8,'#d84878',5,1); if(!e.warned){ e.warned=true; showToast('¡BAYA ROBADA!','¡atrápala antes de que escape!'); }
  sqChitter(4,2200); e.st='flee'; e.hop=null;
  const cx=e.x+8, cy=e.y+8; let best=null, bd=1e9; e.fleeT=0; // a la salida más cercana: una casilla libre del borde (por donde de verdad se sale)
  for(let t=0;t<SW;t++) for(const [tx,ty,ox,oy] of [[t,0,0,-30],[t,SH-1,0,30]]) if(!isSolid(grid[ty][tx])&&grid[ty][tx]!=='°'){ const px=tx*16+8, py=ty*16+8, dd=Math.hypot(px-cx,py-cy); if(dd<bd){ bd=dd; best=[px+ox,py+oy]; } }
  for(let t=0;t<SH;t++) for(const [tx,ty,ox,oy] of [[0,t,-30,0],[SW-1,t,30,0]]) if(!isSolid(grid[ty][tx])&&grid[ty][tx]!=='°'){ const px=tx*16+8, py=ty*16+8, dd=Math.hypot(px-cx,py-cy); if(dd<bd){ bd=dd; best=[px+ox,py+oy]; } }
  if(!best) best=[cx<80?-30:SW*16+30,cy]; e.ex=best[0]; e.ey=best[1]; e.face=(e.ex-cx)>0?1:(e.ex-cx)<0?-1:e.face; }

/* ---------- el dibujo ---------- */
function drawSquirrel(e){ const z=Math.round(e.z||0), fl=e.flash>4;
  let pose='sit', f=0, sq=1, tail=Math.sin(tick*.12+(e.x|0))*.8;
  if(e.st==='dizzy') pose='dizzy';
  else if(e.st==='dig'){ pose='run'; f=(tick>>2)&1; }
  else if(e.st==='alert'){ pose='alert'; sq=e.at>8?1.1:.8; tail=1; }
  else if(e.st==='flee'&&e.stolen>0) pose='carry';
  else if(e.hop){ pose='run'; f=(e.hop.t>>2)&1; sq=e.hop.t<3?.8:1.1; tail=-1; }
  else if(e.st==='wander'){ const ph=(e.t>>4)%6; pose=ph<3?'nibble':'look'; f=pose==='nibble'?(e.t>>2)&1:ph&1; if(((e.t+(e.x|0))%150)<5) f=9; }
  if(e.land>0&&!e.hop) sq=1-e.land*.04;
  const img=squirrelArt(pose,sq,tail,f), W=img.width, H=img.height;
  drawShadow(e.x+8,e.y+15,Math.max(3,5-z/3));
  let x=Math.round(e.x-4), y=Math.round(e.y-5-z);
  if(e.st==='dig'){ const k=Math.min(1,e.dg/30); ctx.save(); ctx.beginPath(); ctx.rect(x-4,y-4,W+8,Math.round(H-k*H)+4); ctx.clip(); y+=Math.round(k*12); } // se mete en la tierra
  const src=fl?whiteArt(img):img;
  if(e.face>0){ ctx.save(); ctx.translate(x+W,y); ctx.scale(-1,1); ctx.drawImage(src,0,0); ctx.restore(); } else ctx.drawImage(src,x,y);
  if(e.st==='dig'){ ctx.restore(); const mx=e.x+8, my=e.y+15; ctx.fillStyle='#5a3a1c'; ctx.fillRect(mx-6,my-1,12,2); ctx.fillStyle='#8a6a40'; ctx.fillRect(mx-5,my-2,10,1); }
  if(e.st==='dizzy'){ for(let i=0;i<3;i++){ const a=tick*.15+i*2.1; caStar(Math.round(e.x+8+Math.cos(a)*6),Math.round(e.y-3+Math.sin(a)*2),2,'#fff0a0'); } } }
const SQ_WHITE=new Map();
function whiteArt(img){ let c=SQ_WHITE.get(img); if(!c){ c=tintTo(img,'#ffffff'); SQ_WHITE.set(img,c); if(SQ_WHITE.size>60) SQ_WHITE.delete(SQ_WHITE.keys().next().value); } return c; }
