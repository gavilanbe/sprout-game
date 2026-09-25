'use strict';
/* ============================================================
   BICHOS DEL VALLE: aspecto y juice (ganchos ENEMY_DRAW / ENEMY_FX / ENEMY_DEATH de 11-enemies)
   Brotón (blob), murciélago (bat), escarabajo acorazado (beetle), rodapúas (roller) y fantasma (ghost).
   Todo a 16×16, con la misma técnica de siempre (creature = blobArt dentro de 16×16 + detalles a mano, o spr),
   más fotogramas y juice. Ni la IA, ni las velocidades, ni los golpes cambian: esto solo dibuja y adorna.
   ============================================================ */
const VB_CACHE=new Map(), VB_WHITE=new Map();
function vbWhite(img){ let c=VB_WHITE.get(img); if(!c){ c=whiten(img); VB_WHITE.set(img,c); } return c; }
function vbDraw(img,x,y,flip,flash){ const src=flash?vbWhite(img):img; x=Math.round(x); y=Math.round(y);
  if(flip){ ctx.save(); ctx.translate(x+16,y); ctx.scale(-1,1); ctx.drawImage(src,0,0); ctx.restore(); } else ctx.drawImage(src,x,y); }
function vbStars(e,y){ for(let i=0;i<3;i++){ const a=tick*.15+i*2.1; caStar(Math.round(e.x+8+Math.cos(a)*6),Math.round((y===undefined?e.y-2:y)+Math.sin(a)*2),2,'#fff0a0'); } }
function vbPx(g,x,y,c){ g.fillStyle=c; g.fillRect(x,y,1,1); }
/* el golpe: un respingo (squash) y un par de chispas del color del bicho; lo detecta cada FX comparando la vida */
function vbHurt(e,col){ if(e.lastHp!==undefined&&e.hp<e.lastHp&&e.hp>0){ e.squash=.35; e.hurtT=10; for(let i=0;i<4;i++){ const a=Math.random()*6.283; parts.push({k:'shard',x:e.x+8,y:e.y+8,vx:Math.cos(a)*1.4,vy:Math.sin(a)*1.4-.6,life:12,max:12,col}); } } e.lastHp=e.hp; if(e.hurtT>0) e.hurtT--; }

/* ---------------- EL BROTÓN: gelatina con un brote encima ----------------
   respira quieto (y parpadea), bota al moverse (se estira en el aire y se aplasta al caer, con un pegote de gelatina),
   pone cara de malas pulgas cuando se lanza a por ti y se deshace en un chof de gelatina que suelta su brote */
const BLOB_BODY={rest:[{x:8,y:8,r:3.2},{x:8,y:10.4,r:6.6,ry:4.8}],breath:[{x:8,y:8.5,r:3.1},{x:8,y:10.8,r:6.9,ry:4.4}],
  tall:[{x:8,y:6.6,r:3},{x:8,y:9.6,r:5.6,ry:5.8}],flat:[{x:8,y:11.6,r:7.3,ry:3.7}]};
const BLOB_ICEPAL=['#1a3a5a','#2a6890','#4898c8','#80c8e8','#c8f0ff'];
function blobFrame(body,face,fast,leaf){ const key='b|'+body+'|'+face+'|'+(fast?1:0)+'|'+leaf; let c=VB_CACHE.get(key); if(c) return c;
  c=mkCanvas(16,16); const g=c.getContext('2d'), L=BLOB_BODY[body], big=L[L.length-1], top=Math.round(Math.min(...L.map(l=>l.y-(l.ry||l.r))));
  blobArt(g,0,0,16,16,L,fast?BLOB_ICEPAL:BLOB_PAL,{grad:.5});
  const LL=fast?'#d8f8ff':'#b0f068', Ll=fast?'#90d0f0':'#70d838', Ld=fast?'#3a78a8':'#2e8a38';
  // el brote de encima (se mece: leaf 0/1)
  const sx=leaf?5:4, sy=top-3; const S=["..kk.......",".kLlk.kk...",".klldkLlk..","..kkdkdk...","....d......"];
  S.forEach((r,y)=>{ for(let x=0;x<r.length;x++){ const ch=r[x]; if(ch==='.') continue; if(sy+y<0) continue; vbPx(g,sx+x,sy+y,ch==='k'?PAL.k:ch==='L'?LL:ch==='l'?Ll:Ld); } });
  // el brillo de la gelatina
  const cy=Math.round(big.y), ew=body==='flat'?7:body==='tall'?4.5:5.5, ex=[Math.round(8-ew/2)-1,Math.round(8+ew/2)], ey=cy-(body==='flat'?2:1);
  vbPx(g,ex[0]-1,ey-2,'#ffffff'); vbPx(g,ex[0]-2,ey-1,fast?'#e8f8ff':'#f0ffe0');
  // la cara
  for(const x of ex){
    if(face==='blink'){ vbPx(g,x,ey+1,PAL.k); vbPx(g,x+1,ey+1,PAL.k); }
    else if(face==='dizzy'){ vbPx(g,x,ey,PAL.k); vbPx(g,x+1,ey+1,PAL.k); vbPx(g,x+1,ey,'#ffffff'); vbPx(g,x,ey+1,'#ffffff'); }
    else { vbPx(g,x,ey,PAL.k); vbPx(g,x+1,ey,'#ffffff'); vbPx(g,x,ey+1,PAL.k); vbPx(g,x+1,ey+1,PAL.k); } }
  if(face==='angry'){ vbPx(g,ex[0]-1,ey-2,PAL.k); vbPx(g,ex[0],ey-1,PAL.k); vbPx(g,ex[1]+2,ey-2,PAL.k); vbPx(g,ex[1]+1,ey-1,PAL.k); } // cejas de malas pulgas
  const my=ey+2; g.fillStyle='#7a1a28';
  if(face==='angry'){ g.fillRect(7,my,3,1); g.fillRect(7,my+1,3,1); g.fillStyle='#e05050'; g.fillRect(8,my+1,1,1); }
  else if(face==='hurt'){ g.fillRect(7,my,2,2); }
  else g.fillRect(7,my,2,1);
  VB_CACHE.set(key,c); return c; }
ENEMY_FX.blob=(e,dx,dy,d)=>{ vbHurt(e,e.fast?'#80c8e8':'#7ad058'); e.anim=(e.anim||0)+1;
  const moving=e.vx||e.vy; if(moving){ const ph=e.anim%18; if(ph===0){ e.squash=.28; if(e.stun<=0) for(let i=0;i<2;i++) parts.push({x:e.x+8+(i?4:-4),y:e.y+14,vx:(i?.4:-.4),vy:-.3,life:10,col:e.fast?'#80c8e8':'#58b048'}); } } };
ENEMY_DRAW.blob=e=>{ const fast=e.fast, sp=Math.hypot(e.vx,e.vy), base=fast?.65:.4, moving=sp>0, lunge=sp>base*1.05;
  let body='rest', z=0; const ph=(e.anim||0)%18;
  if(moving){ const k=ph/18; z=Math.sin(k*Math.PI)*(lunge?4:3); body=ph<3?'flat':z>1.5?'tall':'rest'; }
  else body=((e.anim||0)>>4)&1?'breath':'rest';
  let face=lunge?'angry':'normal'; if(e.stun>0) face='dizzy'; else if(e.hurtT>0) face='hurt'; else if(!lunge&&(((e.anim||0)+(e.x|0))%130)<5) face='blink';
  drawShadow(e.x+8,e.y+15,Math.max(3,5-z/2));
  vbDraw(blobFrame(body,face,fast,((e.anim||0)>>3)&1),e.x,e.y-z,false,e.flash>4);
  if(e.stun>0) vbStars(e,e.y-z+2); };
ENEMY_DEATH.blob=e=>{ const cx=e.x+8, cy=e.y+11, P=e.fast?['#4898c8','#80c8e8','#c8f0ff']:['#2a7a30','#48a840','#7ad058'];
  for(let i=0;i<10;i++){ const a=-Math.PI*(i/9), s=1+Math.random()*1.4; parts.push({k:'shard',x:cx,y:cy,vx:Math.cos(a)*s,vy:Math.sin(a)*s-.4,life:18,max:18,col:P[i%3]}); } // el chof de gelatina
  parts.push({k:'leafF',x:cx,y:cy-6,vx:(Math.random()-.5)*.6,vy:-1.6,life:50,max:50,sway:2,col:e.fast?'#d8f8ff':'#b0f068',nog:false}); // su brote sale volando
  parts.push({x:cx,y:cy,vx:0,vy:0,life:10,col:'#ffffff',ring:true,r:11,nog:true}); puff(cx,cy,P[1],5,.7); };

/* ---------------- EL MURCIÉLAGO ----------------
   tres fotogramas de aleteo (arriba, en cruz, abajo), avisa encogiendo las alas y con los ojos rojos antes de
   lanzarse, se lanza en picado con las alas plegadas dejando estela, y cae dando vueltas entre plumillas */
const BAT_M=spr(["................","................","................","................","......k..k......",".....kVkkVk.....","kkkkkkvVVvkkkkkk","kVvvvkyvvykvvvVk","kpvvpkvqqvkpvvpk",".kPpkkvvvvkkpPk.","..kk.kkppkk.kk..","......kkkk......","................","................","................","................"],BAT_PAL);
const BAT_DIVE=spr(["................","................","................","................","......k..k......",".....kVkkVk.....","....kkvVVvkk....","...kvkyvvykvk...","...kpkvqqvkpk...","...kPkvvvvkPk...","....kkkppkkk....",".....kPkkPk.....","......k..k......","................","................","................"],BAT_PAL);
const BAT_ANGRY=[BAT_A].map(c=>recolor(c,{'#ffe040':'#ff3030'}))[0];
const BAT_RED_M=recolor(BAT_M,{'#3e1e5a':'#4a0e10','#6a3a98':'#902428','#9a62d0':'#d04848','#c8a0f0':'#f8a0a0'});
const BAT_RED_D=recolor(BAT_DIVE,{'#3e1e5a':'#4a0e10','#6a3a98':'#902428','#9a62d0':'#d04848','#c8a0f0':'#f8a0a0'});
const BAT_RED_ANGRY=recolor(BAT_RED[0],{'#ffe040':'#ffffff'});
ENEMY_FX.bat=(e,dx,dy,d)=>{ vbHurt(e,e.fast?'#d04848':'#9a62d0'); e.anim=(e.anim||0)+1;
  if(e.homing>0&&(e.anim&1)) parts.push({k:'mote',x:e.x+8-e.vx*3,y:e.y+8-e.vy*3,vx:-e.vx*.2,vy:-e.vy*.2,life:10,max:10,sway:0,col:e.fast?'#f8a0a0':'#c8a0f0',nog:true});
  const f=(e.anim>>2)%4; if(f===0&&(e.anim&3)===0&&d<90&&!e.homing&&e.stun<=0&&AC&&(e.anim%16)===0) beep('square',1600,1900,.02,.006); };
ENEMY_DRAW.bat=e=>{ const fast=e.fast, warn=!e.homing&&d0(e)<70&&e.t%120>=88&&e.t%120<=96;
  let img, y=e.y+Math.sin(tick*.2+e.x)*1.5, x=e.x;
  if(e.stun>0){ img=fast?BAT_RED_M:BAT_M; y=e.y+2; }
  else if(e.homing>0){ img=fast?BAT_RED_D:BAT_DIVE; }
  else if(warn){ img=fast?BAT_RED_ANGRY:BAT_ANGRY; x+=((tick>>1)&1)?1:-1; y-=1; }
  else { const f=(tick>>2)%4; img=f===0?(fast?BAT_RED[0]:BAT_A):f===2?(fast?BAT_RED[1]:BAT_B):(fast?BAT_RED_M:BAT_M); }
  drawShadow(e.x+8,e.y+15,e.homing>0?3:4);
  vbDraw(img,x,y,false,e.flash>4);
  if(e.stun>0) vbStars(e,y); };
function d0(e){ return Math.hypot(player.x-e.x,player.y-e.y); }
ENEMY_DEATH.bat=e=>{ const cx=e.x+8, cy=e.y+8, P=e.fast?['#902428','#d04848','#f8a0a0']:['#6a3a98','#9a62d0','#c8a0f0'];
  for(let i=0;i<6;i++) parts.push({k:'leafF',x:cx+(Math.random()-.5)*8,y:cy,vx:(Math.random()-.5)*1.6,vy:-1-Math.random(),life:44,max:44,sway:Math.random()*6,col:P[i%3],nog:false}); // plumillas de ala
  for(let i=0;i<5;i++){ const a=Math.random()*6.283; parts.push({k:'shard',x:cx,y:cy,vx:Math.cos(a)*1.8,vy:Math.sin(a)*1.8-.5,life:12,max:12,col:'#ffe040'}); }
  parts.push({x:cx,y:cy,vx:0,vy:0,life:10,col:'#ffffff',ring:true,r:10,nog:true}); };

/* ---------------- EL ESCARABAJO ACORAZADO ----------------
   dos fotogramas de patas con cabeceo, antenas que tiemblan, un brillo que recorre la coraza, se da la vuelta con un
   respingo y, al caer, la coraza se parte en dos y salta */
function beetleFrame(step,glint,ant,dizzy){ const key='be|'+step+'|'+glint+'|'+ant+'|'+(dizzy?1:0); let c=VB_CACHE.get(key); if(c) return c;
  c=mkCanvas(16,16); const g=c.getContext('2d'), by=step?1:0;
  blobArt(g,0,0,16,16,[{x:6.5,y:8.2+by*.4,r:5.8,ry:5.2}],SHELL_PAL,{grad:.5});
  const P=(x,y,col)=>vbPx(g,x,y,col);
  // la raya de la coraza y sus puntos
  for(let x=2;x<=9;x++) P(x,8+by,SHELL_PAL[0]); P(6,7+by,SHELL_PAL[0]); P(6,9+by,SHELL_PAL[0]); // la juntura de los élitros
  P(4,10+by,SHELL_PAL[1]); P(8,10+by,SHELL_PAL[1]); P(5,11+by,SHELL_PAL[1]);
  // el brillo que recorre la coraza
  const gx=2+glint; if(glint>=0&&glint<8){ P(gx,4+by+(gx>5?1:0),'#e0fff0'); P(gx+1,4+by+(gx>4?1:0),'#a0e8b0'); }
  else { P(4,4+by,'#e0fff0'); P(3,5+by,'#a0e8b0'); }
  // la cabeza con su morro blindado (a la derecha)
  const hy=by; const H=["..kkk..",".ktttk.",".kttTTk",".kqkTTk","kTTTTTk",".kTTTTk","..ktTk.","...kk.."];
  H.forEach((r,y)=>{ for(let x=0;x<r.length;x++){ const ch=r[x]; if(ch==='.') continue; P(9+x,3+y+hy,ch==='k'?PAL.k:ch==='t'?'#d0c8b8':ch==='T'?'#6a6458':'#ffffff'); } });
  if(dizzy){ P(11,6+hy,PAL.k); P(12,6+hy,'#ffffff'); }
  // las antenas
  const a=ant?1:0; P(11+a,2+hy,PAL.k); P(12+a,1+hy,PAL.k); P(13,2+hy-a,PAL.k); P(14,1+hy-a,PAL.k);
  // las patas
  const L=step?[[3,13],[6,13],[9,13]]:[[2,13],[5,13],[8,13]];
  for(const [x,y] of L){ P(x,y,PAL.k); P(x+1,y+1,'#3a3028'); P(x+1,y,PAL.k); P(x,y+1,PAL.k); }
  VB_CACHE.set(key,c); return c; }
ENEMY_FX.beetle=(e,dx,dy,d)=>{ vbHurt(e,'#4aa864'); e.anim=(e.anim||0)+1;
  if(e.lastDir!==undefined&&e.lastDir!==e.dir){ e.squash=.3; e.turnT=6; stepDustAt(e.x+8,e.y+15,.5); } e.lastDir=e.dir; if(e.turnT>0) e.turnT--;
  if((e.anim%16)===0&&e.stun<=0) stepDustAt(e.x+8-e.dir*4,e.y+15,.2); };
ENEMY_DRAW.beetle=e=>{ const step=(e.anim>>3)&1, gl=((e.anim||0)%90)-40, ant=(e.anim>>2)&1;
  drawShadow(e.x+8,e.y+15,5);
  vbDraw(beetleFrame(e.stun>0?0:step,gl>>1,ant,e.stun>0),e.x,e.y,e.dir<0,e.flash>4);
  if(e.stun>0) vbStars(e); };
ENEMY_DEATH.beetle=e=>{ const cx=e.x+8, cy=e.y+8;
  for(const s of [-1,1]) for(let i=0;i<3;i++) parts.push({k:'shard',x:cx+s*3,y:cy-2,vx:s*(1+i*.5),vy:-1.8-i*.4,life:20,max:20,col:SHELL_PAL[2+(i%3)]}); // la coraza se parte y salta
  for(let i=0;i<4;i++) parts.push({k:'shard',x:cx,y:cy+4,vx:(Math.random()-.5)*2,vy:-.8,life:14,max:14,col:'#3a3028'});
  parts.push({x:cx,y:cy,vx:0,vy:0,life:10,col:'#ffffff',ring:true,r:11,nog:true}); puff(cx,cy,'#a0e8b0',5,.8); };

/* ---------------- EL RODAPÚAS ----------------
   en reposo respira y olfatea (el hocico tiembla, parpadea), al avistarte eriza las púas y se hace bola temblando, y
   rueda con 8 fotogramas de giro dibujados píxel a píxel (antes, la imagen girada y borrosa) levantando polvo */
const ROLL_SPIKE='#f4e8ff';
function rollerBall(rot,flat){ const key='rb|'+rot+'|'+(flat?1:0); let c=VB_CACHE.get(key); if(c) return c;
  c=mkCanvas(16,16); const g=c.getContext('2d'), cy=flat?9:8, ry=flat?5.4:6.2;
  blobArt(g,0,0,16,16,[{x:8,y:cy,r:6.2,ry}],ROLL_PAL,{grad:.3});
  for(let i=0;i<8;i++){ const a=i/8*6.283+rot/8*.785; const x1=Math.round(8+Math.cos(a)*7.4), y1=Math.round(cy+Math.sin(a)*(ry+1.2)), x0=Math.round(8+Math.cos(a)*5.6), y0=Math.round(cy+Math.sin(a)*(ry-.6));
    vbPx(g,x0,y0,PAL.k); vbPx(g,x1,y1,ROLL_SPIKE); }
  for(let i=0;i<4;i++){ const a=i/4*6.283+.4+rot/8*.785, x=Math.round(8+Math.cos(a)*3), y=Math.round(cy+Math.sin(a)*3*(ry/6.2)); vbPx(g,x,y,'#2a1a40'); } // las marcas que giran: se ve rodar
  VB_CACHE.set(key,c); return c; }
function rollerIdle(f){ const key='ri|'+f; let c=VB_CACHE.get(key); if(c) return c; // f: 0 normal · 1 respira · 2 parpadea · 3 erizado (anticipación)
  c=mkCanvas(16,16); const g=c.getContext('2d'), br=f===1?.3:0, bristle=f===3;
  blobArt(g,0,0,16,16,[{x:8,y:9.6+br,r:bristle?6.4:6,ry:bristle?5.6:5.2-br}],ROLL_PAL,{grad:.5});
  const P=(x,y,col)=>vbPx(g,x,y,col);
  const sp=bristle?[[2,4],[5,2],[8,1],[11,2],[14,4],[1,7],[15,7]]:[[3,3],[6,2],[9,2],[12,3],[2,6],[14,6]];
  for(const [x,y] of sp){ P(x,y,ROLL_SPIKE); P(x+(x<8?1:-1),y+1,PAL.k); } // las púas (erizadas: más altas)
  P(4,6,'#ffffff'); P(3,7,'#d0b0f0'); // brillo
  const ey=9+(f===1?1:0);
  if(f===2){ P(4,ey+1,PAL.k); P(5,ey+1,PAL.k); P(10,ey+1,PAL.k); P(11,ey+1,PAL.k); }
  else { P(4,ey,PAL.k); P(5,ey,'#ffffff'); P(4,ey+1,PAL.k); P(5,ey+1,PAL.k); P(10,ey,PAL.k); P(11,ey,'#ffffff'); P(10,ey+1,PAL.k); P(11,ey+1,PAL.k); }
  if(bristle){ P(3,ey-1,PAL.k); P(12,ey-1,PAL.k); }
  P(7,ey+2,'#ffe0e8'); P(8,ey+2,'#ffe0e8'); P(7,ey+3,PAL.k); P(8,ey+3,PAL.k); // el hocico
  P(3,14,PAL.k); P(4,14,PAL.k); P(11,14,PAL.k); P(12,14,PAL.k); // patitas
  VB_CACHE.set(key,c); return c; }
ENEMY_FX.roller=(e,dx,dy,d)=>{ vbHurt(e,'#d0b0f0'); e.anim=(e.anim||0)+1;
  if(e.st==='roll'){ e.rot=((e.rot||0)+((e.rx||e.ry)>0?1:-1)+8)%8; if((e.anim&1)) parts.push({k:'dust',x:e.x+8-(e.rx||0)*6,y:e.y+14-(e.ry||0)*5,vx:-(e.rx||0)*.3,vy:-.1-(e.ry||0)*.2,life:12,max:12,r:1,col:groundDustCol(),nog:true});
    if(e.bounce!==e.lastB&&e.lastB!==undefined){ e.squash=.35; for(let i=0;i<4;i++) parts.push({k:'shard',x:e.x+8+(e.rx||0)*7,y:e.y+8+(e.ry||0)*7,vx:-(e.rx||0)*(1+Math.random())+(Math.random()-.5),vy:-(e.ry||0)*(1+Math.random())-.6,life:12,max:12,col:ROLL_SPIKE}); } }
  e.lastB=e.bounce; if(e.st==='windup'&&e.wu===17) e.squash=-.25; };
ENEMY_DRAW.roller=e=>{ const fl=e.flash>4;
  drawShadow(e.x+8,e.y+15,5);
  if(e.st==='roll'){ vbDraw(rollerBall(((e.rot||0)%8+8)%8,false),e.x,e.y,false,fl); return; }
  if(e.st==='windup'){ const k=e.wu, sh=((tick>>1)&1)?1:-1; vbDraw(k>9?rollerIdle(3):rollerBall(((tick>>1)%8),true),e.x+sh,e.y,false,fl); return; }
  let f=((e.anim||0)>>4)&1; if(((e.anim||0)+(e.x|0))%140<5) f=2; if(e.stun>0) f=2;
  vbDraw(rollerIdle(f),e.x,e.y,false,fl); if(e.stun>0) vbStars(e); };
ENEMY_DEATH.roller=e=>{ const cx=e.x+8, cy=e.y+9;
  for(let i=0;i<8;i++){ const a=i/8*6.283; parts.push({k:'shard',x:cx+Math.cos(a)*5,y:cy+Math.sin(a)*5,vx:Math.cos(a)*2,vy:Math.sin(a)*2-.4,life:14,max:14,col:i&1?ROLL_SPIKE:'#9a70c8'}); } // salen disparadas sus púas
  parts.push({x:cx,y:cy,vx:0,vy:0,life:10,col:'#ffffff',ring:true,r:12,nog:true}); puff(cx,cy,'#9a70c8',6,.9); };

/* ---------------- EL FANTASMA ----------------
   la sábana ondea (tres fotogramas del bajo), los ojos te siguen, deja jirones al flotar, parpadea al volverse
   invisible (tramado, sin fundirse del todo de golpe) y al morir se deshace hacia arriba en jirones con un «uuu» */
function ghostFrame(wave,lx,ly,face){ const key='g|'+wave+'|'+lx+'|'+ly+'|'+face; let c=VB_CACHE.get(key); if(c) return c;
  c=mkCanvas(16,16); const g=c.getContext('2d');
  const rows=["................","......kkkkk.....","....kkwwwwwkk...","...kwwWwwwwwlk..","..kwWWwwwwwwwlk.","..kwwwwwwwwwwlk.","..kwwwwwwwwwwlk.","..kwwwwwwwwwwlk.","..kwwwwwwwwwwlk.","..kwwwwwwwwwllk.","..klwwwwwwwwllk.","..kllwwwwwlllLk."];
  const hem=[["..kLllllllllLLk.","..kLLkLLLLkLLk..","...kk.kkkk.kk..."],["..kLllllllllLLk.","...kLLkLLkLLLk..","....kk.kk.kkk..."],["..kLllllllllLLk.","..kLLLkLLLkLLk..","..kk.kkk.kkk...."]][wave];
  const M={w:'#e8f4ff',W:'#ffffff',l:'#a8c4e8',L:'#6a88c0',k:PAL.k};
  [...rows,...hem].forEach((r,y)=>{ for(let x=0;x<16;x++){ const ch=r[x]; if(!ch||ch==='.') continue; vbPx(g,x,y,M[ch]); } });
  // los ojos que te siguen (lx,ly -1..1) y la boca
  const E=[[5,5],[10,5]];
  for(const [x,y] of E){ if(face==='blink'){ g.fillStyle='#1a2048'; g.fillRect(x,y+1,2,1); continue; } g.fillStyle='#1a2048'; g.fillRect(x,y,2,2); g.fillStyle='#ffffff'; g.fillRect(x+(lx>0?1:0),y+(ly>0?1:0),1,1); }
  g.fillStyle='#1a2048'; if(face==='boo'){ g.fillRect(7,8,3,3); } else g.fillRect(7,8,3,2);
  VB_CACHE.set(key,c); return c; }
ENEMY_FX.ghost=(e,dx,dy,d)=>{ vbHurt(e,'#e8f4ff'); e.anim=(e.anim||0)+1;
  if((e.anim%10)===0&&e.phase<110) parts.push({k:'mote',x:e.x+4+Math.random()*8,y:e.y+14,vx:0,vy:-.25,life:24,max:24,sway:Math.random()*6,col:'#e8f4ff',nog:true});
  if(e.phase===108&&AC) beep('triangle',520,300,.2,.02); };
ENEMY_DRAW.ghost=e=>{ const wave=((e.anim||0)>>3)%3, lx=player.x>e.x+2?1:player.x<e.x-2?-1:0, ly=player.y>e.y+4?1:0, hid=e.phase>=110;
  let face=hid?'boo':(((e.anim||0)+(e.x|0))%120<5?'blink':'o'); if(e.hurtT>0) face='boo';
  const y=e.y+Math.sin(tick*.1+e.x)*1.5;
  drawShadow(e.x+8,e.y+15,4);
  const img=ghostFrame(wave,lx,ly,face);
  if(hid){ const k=Math.min(1,(e.phase-110)/10); ctx.globalAlpha=(1-k)*.82+k*.26; if(e.phase<120&&(tick&2)) ctx.globalAlpha*=.6; } else ctx.globalAlpha=e.phase>100?.82-((e.phase-100)/10)*.1:.82;
  vbDraw(img,e.x,y,false,e.flash>4); ctx.globalAlpha=1; if(e.stun>0) vbStars(e,y); };
ENEMY_DEATH.ghost=e=>{ const cx=e.x+8, cy=e.y+8;
  for(let i=0;i<8;i++) parts.push({k:'mote',x:cx-6+i*1.7,y:cy+4-Math.random()*6,vx:(Math.random()-.5)*.3,vy:-.6-Math.random()*.6,life:30,max:30,sway:Math.random()*6,col:i&1?'#ffffff':'#a8c4e8',nog:true}); // se deshace hacia arriba
  parts.push({x:cx,y:cy,vx:0,vy:0,life:12,col:'#e8f4ff',ring:true,r:12,nog:true}); flyText.push({x:cx,y:cy-8,txt:'uuu…',t:26,col:'#e8f4ff'}); };
