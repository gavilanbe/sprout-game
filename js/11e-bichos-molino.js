'use strict';
/* ============================================================
   BICHOS DEL MOLINO Y LA MARISMA: aspecto y juice
   (ganchos ENEMY_DRAW / ENEMY_FX / ENEMY_DEATH de 11-enemies; la IA, las velocidades, la vida y el daño no cambian)
   Todos a 16×16 y con la técnica de siempre: volumen con blobArt dentro del cuadro + detalles a mano, contorno negro.
   · CUERVO: posado respira, parpadea y se acicala; grazna con las plumas ahuecadas; se lanza en picado con las alas
     plegadas; remonta aleteando; aturdido cae con las plumas revueltas. Muere en un revuelo de plumas negras.
   · CABALLERO DE HOJA: camina con balanceo; se gira; carga agachado tras el escudo con los ojos encendidos; embiste
     estirado dejando polvo; con la guardia baja jadea; sin escudo, tiembla. Muere: el yelmo de hoja sale volando y
     el cuerpo se deshace en astillas y hojas.
   · RAÍZ TRAMPA: el brote tiembla en la tierra si te acercas; te agarra con zarcillos; asoma meciéndose. Muere en
     astillas y un puñado de hojas.
   · TOPILLO: la tierra tiembla antes de salir; asoma, respira, parpadea, olfatea; muerde con la boca abierta; se
     hunde al esconderse. Muere dando una voltereta en una nube de tierra.
   · LIRIO: el capullo se mece; se hincha y tiembla antes de abrirse; se abre, escupe con un respingo y se cierra.
     Ondas en el agua. Muere: los pétalos se deshacen y flotan, la hoja se hunde.
   · RODAHOJA: rueda de verdad (sus hojas giran píxel a píxel; la cara se queda derecha), se aplasta al rebotar y
     suelta hojitas. Muere deshecha en un remolino de hojas.
   ============================================================ */
const BM16=fn=>mkArt(16,16,fn);
function bmPix(g,x,y,col){ g.fillStyle=col; g.fillRect(x,y,1,1); }
function bmDraw(img,x,y,flip,flash){ const im=flash?tintCached(img,'#ffffff'):img; x=Math.round(x); y=Math.round(y);
  if(flip){ ctx.save(); ctx.translate(x+im.width,y); ctx.scale(-1,1); ctx.drawImage(im,0,0); ctx.restore(); } else ctx.drawImage(im,x,y); }
function bmFeather(x,y,col){ parts.push({k:'leafF',x,y,vx:(Math.random()-.5)*1.6,vy:-.8-Math.random()*1.2,life:60+((Math.random()*30)|0),max:90,sway:Math.random()*6,col,nog:false}); }
function bmBits(x,y,cols,n,sp){ for(let i=0;i<n;i++){ const a=Math.random()*6.283, s=(sp||1.4)*(.5+Math.random()); parts.push({k:'shard',x,y,vx:Math.cos(a)*s,vy:Math.sin(a)*s-.8,life:16+((Math.random()*8)|0),max:24,col:cols[i%cols.length]}); } }
function bmSmoke(x,y,cols,n){ for(let i=0;i<(n||5);i++){ const a=i/(n||5)*6.283, s=.35+Math.random()*.4; parts.push({k:'smoke',x:x+Math.cos(a)*2,y:y+Math.sin(a)*2,vx:Math.cos(a)*s,vy:Math.sin(a)*s-.25,life:16+((Math.random()*6)|0),max:22,r:1+(i%2),col:cols[i%cols.length],nog:true}); } } // un soplo pequeño y de su color (no el humo blanco de siempre)
function bmRing(x,y,r,col){ parts.push({x,y,vx:0,vy:0,life:12,col:col||'#ffffff',ring:true,r:r||12,nog:true}); }

/* ============================================================ EL CUERVO (mira a la derecha) ============================================================ */
function crowPose(pose,f){ return BM16(g=>{ f=f||0;
  const K='#0e0c16', eye=(x,y,blink)=>{ if(blink){ bmPix(g,x,y+1,K); bmPix(g,x+1,y+1,K); return; } bmPix(g,x,y,'#ffffff'); bmPix(g,x+1,y,'#e83030'); };
  const beak=(x,y,open)=>{ g.fillStyle=PAL.k; g.fillRect(x,y-1,3,open?5:3); g.fillRect(x+2,y,1,1); g.fillStyle='#f8b030'; g.fillRect(x,y,2,1); g.fillStyle='#c06810'; g.fillRect(x,y+1,1,1);
    if(open){ g.fillStyle='#e05050'; g.fillRect(x,y+1,2,1); g.fillStyle='#f8b030'; g.fillRect(x,y+2,2,1); } };
  const legs=()=>{ g.fillStyle=PAL.k; g.fillRect(5,13,1,3); g.fillRect(8,13,1,3); g.fillStyle='#f8b030'; g.fillRect(4,15,2,1); g.fillRect(7,15,2,1); };
  if(pose==='perch'){ // posado: f 0 quieto · 1 respira · 2 parpadeo · 3 se acicala (cabeza al ala)
    const br=f===1?.35:0, hx=f===3?9.4:10.8, hy=f===3?8.4:6.6;
    blobArt(g,0,0,16,16,[{x:3,y:11.6,r:2.8,ry:1.5},{x:7.2,y:10,r:4.6+br*.4,ry:3.6+br},{x:hx,y:hy,r:3}],CROW5,{grad:.5});
    beak(Math.round(hx+2.2),Math.round(hy-1.2),false); eye(Math.round(hx),Math.round(hy-1.4),f===2);
    g.fillStyle=K; g.fillRect(4,9,5,1); g.fillRect(5,10,4,1); g.fillStyle='#7a72a0'; g.fillRect(6,8,2,1); g.fillStyle='#4a4266'; g.fillRect(5,11,3,1); legs(); }
  else if(pose==='caw'){ // grazna: ahuecado, cabeza arriba, pico abierto y las alas un poco abiertas
    artPix(g,["k.......","wk......","wwk.....",".wwk...."],{w:'#302a44'},1,5);
    blobArt(g,0,0,16,16,[{x:3,y:11.4,r:3,ry:1.8},{x:7.2,y:9.6,r:5.2,ry:4.2},{x:10.6,y:5,r:3.1}],CROW5,{grad:.45});
    beak(13,4,true); eye(10,3,false); g.fillStyle='#7a72a0'; g.fillRect(6,7,2,1); g.fillRect(4,9,1,1); g.fillStyle=K; g.fillRect(5,10,4,1); legs();
    if(f&1){ bmPix(g,7,4,K); bmPix(g,5,5,K); } } // plumas de punta
  else if(pose==='swoop'){ // en picado: estirado, alas plegadas hacia atrás, garras delante
    artPix(g,["kk.......","kwwk.....",".kwwwk...","..kwwwwk."],{w:'#302a44'},0,3);
    blobArt(g,0,0,16,16,[{x:2.6,y:9.4,r:2.6,ry:1.3},{x:7.4,y:9.6,r:5,ry:2.8},{x:11.6,y:8.4,r:2.7}],CROW5,{grad:.5});
    beak(13,8,false); eye(12,7,false); g.fillStyle='#7a72a0'; g.fillRect(6,8,3,1); g.fillStyle=K; g.fillRect(5,10,5,1);
    g.fillStyle=PAL.k; g.fillRect(9,12,1,2); g.fillRect(11,12,1,2); g.fillStyle='#f8b030'; g.fillRect(10,13,1,1); g.fillRect(12,13,1,1); }
  else if(pose==='flap'){ // remonta aleteando: f 0 alas arriba · 1 alas abajo
    if(f===0) artPix(g,["..kk......","..kwk.....","..kwwk....","...kwwkk..","....kwwwk."],{w:'#302a44'},3,1);
    blobArt(g,0,0,16,16,[{x:3.2,y:11,r:2.8,ry:1.6},{x:7.2,y:9.6,r:4.6,ry:3.4},{x:10.8,y:6.4,r:3}],CROW5,{grad:.5});
    if(f===1) artPix(g,["kwwwwwk","kwwwwk.",".kwwk..","..kk..."],{w:'#302a44'},2,10);
    beak(13,5,false); eye(11,5,false); g.fillStyle=K; g.fillRect(4,9,4,1);
    g.fillStyle=PAL.k; g.fillRect(6,13,1,2); g.fillRect(8,13,1,2); }
  else if(pose==='stun'){ // aturdido en el suelo: plumas revueltas y los ojos en cruz
    blobArt(g,0,0,16,16,[{x:3,y:13,r:2.8,ry:1.4},{x:7.4,y:12,r:4.8,ry:3.2},{x:11,y:10,r:2.9}],CROW5,{grad:.5});
    beak(13,9,true); g.fillStyle=K; bmPix(g,10,8,K); bmPix(g,12,8,K); bmPix(g,11,9,K); bmPix(g,10,10,K); bmPix(g,12,10,K);
    g.fillStyle='#7a72a0'; g.fillRect(5,10,2,1); bmPix(g,8,8,K); bmPix(g,4,9,K); bmPix(g,9,9,'#4a4266'); }
}); }
const CROW_P={perch:[0,1,2,3].map(f=>crowPose('perch',f)),caw:[crowPose('caw',0),crowPose('caw',1)],swoop:crowPose('swoop'),flap:[crowPose('flap',0),crowPose('flap',1)],stun:crowPose('stun')};
ENEMY_DRAW.crow=e=>{ const flash=e.flash>4&&e.st!=='back', air=e.st==='swoop'||e.st==='back'||e.st==='caw', x=e.x|0, y=e.y|0, t=e.anim||0;
  const high=e.st==='swoop'||e.st==='back'; drawShadow(e.x+8,(high?e.y+22:e.y+14),high?3:4);
  let img, oy=0, flip;
  if(e.stun>0){ img=CROW_P.stun; flip=player.x<e.x; oy=2; }
  else if(e.st==='caw'){ img=CROW_P.caw[(t>>2)&1]; flip=player.x<e.x; oy=-((t>>1)&1); }
  else if(e.st==='swoop'){ img=CROW_P.swoop; flip=(e.vx||0)<0; }
  else if(e.st==='back'){ img=CROW_P.flap[(t>>2)&1]; flip=(e.vx||0)<0; oy=Math.round(Math.sin(t*.4)); }
  else { const c=t%160; img=CROW_P.perch[c<6?2:(c>=90&&c<110)?3:((t>>4)&1)]; flip=player.x<e.x; }
  if(e.st==='back'&&(t&7)<4){ ctx.globalAlpha=.8; bmDraw(img,x,y+oy,flip,false); ctx.globalAlpha=1; } else bmDraw(img,x,y+oy,flip,flash); // remontando: intocable
  if(e.st==='swoop'&&(t&1)){ ctx.fillStyle='rgba(255,255,255,.55)'; const d=flip?1:-1; for(let i=0;i<3;i++) ctx.fillRect(Math.round(e.x+8+d*(9+i*3)),Math.round(e.y+6+i*2),3,1); } // líneas de velocidad
  if(e.stun>0) drawDizzy(e.x+8,e.y+4); };
ENEMY_FX.crow=(e,dx,dy,d)=>{ e.anim=(e.anim||0)+1;
  if(e.st==='caw'&&e.t===2&&AC){ const t0=audio().currentTime; beep('square',520,380,.09,.03,t0); beep('square',560,360,.1,.03,t0+.12); } // ¡cra-cra!
  if(e.st==='caw'&&e.t===18) bmBits(e.x+8,e.y+10,['#302a44','#4a4266'],3,.8);
  if(e.st==='back'&&(e.anim&7)===0&&AC) swish(.08,.02,700,1400,900);
  if(e.st==='swoop'&&(e.anim&3)===0) parts.push({k:'mote',x:e.x+8-(e.vx||0)*3,y:e.y+8,vx:0,vy:.1,life:12,max:12,sway:0,col:'#4a4266',nog:true}); };
ENEMY_DEATH.crow=e=>{ bmSmoke(e.x+8,e.y+8,['#4a4266','#302a44']); bmRing(e.x+8,e.y+8,10,'#7a72a0'); for(let i=0;i<7;i++) bmFeather(e.x+4+Math.random()*8,e.y+4+Math.random()*6,i&1?'#302a44':'#1c1828'); if(AC) beep('square',600,200,.18,.03); };

/* ============================================================ EL CABALLERO DE HOJA (mira a la derecha) ============================================================ */
function knightPose(pose,f){ return BM16(g=>{ f=f||0;
  const legs=(a,b,sh)=>{ for(const x of [a,b]){ g.fillStyle=PAL.k; g.fillRect(x-1,11+sh,4,5-sh); g.fillStyle=BARK5[1]; g.fillRect(x,12+sh,2,3-sh); g.fillStyle=BARK5[0]; g.fillRect(x,14,3,1); } };
  let by=10, hy=5.4, hx=8, bx=8, lean=0;
  if(pose==='walk') legs(f?4:5,f?10:9,0);
  else if(pose==='wind'){ legs(4,9,1); by=10.8; hy=6.6; hx=7; bx=7.4; } // agachado, echado atrás
  else if(pose==='lunge'){ legs(3,11,0); hx=10; bx=9; lean=1; }
  else if(pose==='rest'){ legs(5,9,1); by=10.6; hy=6.4; } // guardia baja, jadeando
  else legs(5,9,0);
  blobArt(g,0,0,16,16,[{x:bx,y:by,r:4.2,ry:3.4}],BARK5,{grad:.4});
  blobArt(g,0,0,16,16,[{x:hx,y:hy,r:4,ry:3.6}],AUT5B,{grad:.5});
  const vy=Math.round(hy-.4), glow=pose==='wind'?'#ff9040':'#ffe070'; // la visera y los ojos (encendidos al cargar)
  g.fillStyle='#1a0c04'; g.fillRect(Math.round(hx)-2,vy,6,2); g.fillStyle=glow; bmPix(g,Math.round(hx),vy,glow); bmPix(g,Math.round(hx)+2,vy,glow);
  if(pose==='rest'&&(f&1)){ g.fillStyle='#1a0c04'; g.fillRect(Math.round(hx)-2,vy,6,1); } // entorna los ojos
  g.fillStyle=PAL.k; g.fillRect(Math.round(hx),Math.round(hy-5.4),2,2); g.fillStyle='#c86424'; bmPix(g,Math.round(hx),Math.round(hy-4.4),'#c86424'); bmPix(g,Math.round(hx)+1,Math.round(hy-4.4),'#fcd878'); // el rabito de la hoja-yelmo
  g.fillStyle=BARK5[3]; g.fillRect(Math.round(bx)-2,9,1,2); bmPix(g,Math.round(bx)+2,11,BARK5[2]); // las vetas del cuerpo
  if(lean){ bmPix(g,2,10,BARK5[4]); } }); }
const KNIGHT_P={walk:[knightPose('walk',0),knightPose('walk',1)],wind:knightPose('wind'),lunge:knightPose('lunge'),rest:[knightPose('rest',0),knightPose('rest',1)],turn:knightPose('turn')};
ENEMY_DRAW.knight=e=>{ const flash=e.flash>4, t=e.anim||0, x=e.x|0, y=e.y|0; drawShadow(e.x+8,e.y+15,5);
  let img=KNIGHT_P.walk[(t>>3)&1], ox=0, oy=0, sy=3, sx=3, shield=!e.bare;
  if(e.st==='walk'){ oy=((t>>3)&1)?0:-1; }
  else if(e.st==='turn'){ img=KNIGHT_P.turn; oy=e.t<8?-Math.round(Math.sin(e.t/8*Math.PI)*2):0; sx=e.t<8?1:3; } // un saltito al girarse
  else if(e.st==='wind'){ img=KNIGHT_P.wind; ox=(t&2)?1:-1; sx=4; sy=4; }
  else if(e.st==='lunge'){ img=KNIGHT_P.lunge; ox=Math.round(e.lx||0); sx=6; sy=3; }
  else if(e.st==='rest'){ img=KNIGHT_P.rest[(t>>4)&1]; sy=6; sx=2; } // el escudo, caído
  const flip=e.face<0; bmDraw(img,x+ox,y+oy,flip,flash);
  if(shield){ const S=flash?tintCached(SHIELD_LEAF,'#ffffff'):SHIELD_LEAF; ctx.save(); ctx.translate(x+ox+8,y+oy); if(flip) ctx.scale(-1,1); ctx.drawImage(S,sx,sy); ctx.restore(); }
  if(e.st==='lunge'&&(t&1)){ ctx.fillStyle='rgba(255,236,190,.6)'; const d=flip?1:-1; for(let i=0;i<3;i++) ctx.fillRect(Math.round(e.x+8+d*(10+i*2)),Math.round(e.y+5+i*3),4,1); }
  if(e.st==='rest'&&((t>>4)&1)){ ctx.fillStyle='#e8f6ff'; ctx.fillRect(x+(flip?2:12),y+2,1,2); ctx.fillStyle='#8ad0ff'; ctx.fillRect(x+(flip?2:12),y+4,1,1); } // jadea: gota de sudor
  if(e.bare){ if((t&15)<8){ ctx.fillStyle=PAL.k; ctx.fillRect(x+6,y-4,4,4); ctx.fillStyle='#ff6040'; ctx.fillRect(x+7,y-3,2,2); } }
  if(e.stun>0) drawDizzy(e.x+8,e.y); };
ENEMY_FX.knight=(e,dx,dy,d)=>{ e.anim=(e.anim||0)+1;
  if(e.st==='walk'&&(e.anim%16)===0) stepDustAt(e.x+8,e.y+15,.3);
  if(e.st==='wind'&&e.t===2){ flyText.push({x:e.x+8,y:e.y-6,txt:'!',t:14,col:'#ff9040'}); }
  if(e.st==='lunge'&&(e.anim&1)) parts.push({k:'dust',x:e.x+8-e.face*6,y:e.y+15,vx:-e.face*.4,vy:-.1,life:12,max:12,r:1+(e.anim&2?1:0),col:groundDustCol(),nog:true});
  if(e.bare&&e.bare===239){ bmBits(e.x+8+e.face*6,e.y+8,['#c86424','#e8a040','#fcd878'],6,1.4); } // el escudo salta en pedazos
  if(e.lastSt!==e.st){ if(e.st==='rest'&&AC) beep('triangle',180,120,.1,.03); e.lastSt=e.st; } };
ENEMY_DEATH.knight=e=>{ bmSmoke(e.x+8,e.y+9,['#8a5a30','#c86424']); // el yelmo de hoja sale volando y el cuerpo se deshace en astillas
  parts.push({k:'leafF',x:e.x+8,y:e.y+2,vx:(Math.random()-.5)*1.2,vy:-2.2,life:70,max:70,sway:2,col:'#c86424',nog:false});
  for(let i=0;i<5;i++) parts.push({k:'leafF',x:e.x+4+Math.random()*8,y:e.y+6,vx:(Math.random()-.5)*1.8,vy:-1-Math.random(),life:50,max:50,sway:Math.random()*6,col:['#e8a040','#c86424','#fcd878'][i%3],nog:false});
  bmBits(e.x+8,e.y+10,[BARK5[2],BARK5[3],BARK5[1]],8,1.6); };

/* ============================================================ LA RAÍZ TRAMPA ============================================================ */
function rootPose(pose,f){ return BM16(g=>{ f=f||0;
  if(pose==='hide'){ // el brote asomando de su montoncito de tierra (f: vaivén)
    blobArt(g,2,10,12,6,[{x:6,y:3,r:5.4,ry:2.4}],DIRT5,{grad:.4}); const s=f?1:0;
    g.fillStyle=PAL.k; g.fillRect(7,7,2,5); g.fillRect(5+s,5,3,3); g.fillRect(9+s,5,3,3); g.fillStyle='#2e8a34'; g.fillRect(7,8,1,4);
    bmPix(g,6+s,6,'#78d838'); bmPix(g,10+s,6,'#78d838'); bmPix(g,6+s,5,'#b0f068'); bmPix(g,10+s,5,'#b0f068');
    bmPix(g,4,11,DIRT5[4]); bmPix(g,10,12,DIRT5[4]); return; }
  blobArt(g,1,11,14,5,[{x:7,y:2.5,r:6.4,ry:2.2}],DIRT5,{grad:.4});
  const sway=pose==='up'?(f===1?1:f===2?-1:0):0;
  blobArt(g,0,0,16,16,[{x:8,y:10,r:3.2,ry:4.6},{x:8+sway*.6,y:5.5,r:3.6,ry:3}],BARK5,{grad:.5});
  const F=pose==='grab'?(f?[[4,5],[5,3],[8,2],[11,3],[12,5]]:[[4,4],[5,2],[8,1],[11,2],[12,4]]):[[3+sway,2],[5+sway,0],[8+sway,0],[11+sway,0],[13+sway,2]];
  for(const [x,y] of F){ g.fillStyle=PAL.k; g.fillRect(x-1,y-1,3,4); g.fillStyle=BARK5[3]; g.fillRect(x,y,1,2); bmPix(g,x,y,BARK5[4]); }
  const ex=6+Math.round(sway*.6); g.fillStyle='#1a0c04'; g.fillRect(ex,6,5,2); const glow=pose==='grab'?'#f8ff80':(f===3?'#1a0c04':'#b8ff60'); bmPix(g,ex,6,glow); bmPix(g,ex+3,6,glow);
  g.fillStyle=BARK5[1]; g.fillRect(7,9,1,3); g.fillRect(9,11,1,2); bmPix(g,6,11,BARK5[3]);
  bmPix(g,3,13,DIRT5[4]); bmPix(g,12,14,DIRT5[4]); }); }
const ROOT_P={hide:[rootPose('hide',0),rootPose('hide',1)],up:[0,1,2,3].map(f=>rootPose('up',f)),grab:[rootPose('grab',0),rootPose('grab',1)]};
ENEMY_DRAW.root=e=>{ const flash=e.flash>4&&e.st!=='hide', t=e.anim||0, x=e.x|0, y=e.y|0;
  if(e.st==='hide'){ const near=e.near>0, sh=near?((t>>1)&1):0; bmDraw(ROOT_P.hide[near?((t>>2)&1):((t>>4)&1)],x+sh,y,false,false); return; }
  drawShadow(e.x+8,e.y+15,5);
  if(e.st==='grab'){ // los zarcillos suben hasta los pies de Sprout y lo sujetan
    const fx=player.x+8, fy=player.y+14;
    for(const s of [-1,1]) for(let i=0;i<=6;i++){ const k=i/6, px=Math.round(x+8+s*3+(fx+s*4-(x+8+s*3))*k+Math.sin(k*3+t*.3)*1.5), py=Math.round(y+13+(fy-(y+13))*k); ctx.fillStyle=PAL.k; ctx.fillRect(px-1,py-1,3,3); ctx.fillStyle=BARK5[i&1?2:3]; ctx.fillRect(px,py,1,1); }
    bmDraw(ROOT_P.grab[(t>>3)&1],x+((t>>1)&1?1:0),y,false,flash); }
  else { const c=t%120; bmDraw(ROOT_P.up[c<4?3:((t>>4)%3)],x,y,false,flash); }
  if(e.stun>0) drawDizzy(e.x+8,e.y); };
ENEMY_FX.root=(e,dx,dy,d)=>{ e.anim=(e.anim||0)+1; e.near=e.st==='hide'&&d<30?1:0;
  if(e.near&&(e.anim&7)===0) parts.push({k:'shard',x:e.x+4+Math.random()*8,y:e.y+12,vx:(Math.random()-.5)*.6,vy:-.6,life:8,max:8,col:DIRT5[3]}); // la tierra tiembla
  if(e.lastSt!==e.st){ if(e.st==='grab'||(e.st==='up'&&e.lastSt==='hide')) e.squash=.45; if(e.st==='up'&&e.lastSt==='grab'&&AC) beep('square',300,160,.1,.03); e.lastSt=e.st; } };
ENEMY_DEATH.root=e=>{ bmSmoke(e.x+8,e.y+9,['#6a4a2c','#8a6a44']); bmBits(e.x+8,e.y+10,[BARK5[2],BARK5[3],BARK5[4]],9,1.6); puff(e.x+8,e.y+13,DIRT5[3],6,.9);
  for(let i=0;i<3;i++) parts.push({k:'leafF',x:e.x+8,y:e.y+4,vx:(i-1)*.8,vy:-1.4,life:50,max:50,sway:i*2,col:['#78d838','#b0f068','#2e8a34'][i],nog:false}); };

/* ============================================================ EL TOPILLO ============================================================ */
const TOPI5=['#3a2410','#6a4a2a','#9a7048','#c09a6c','#e8cc9c'];
function topiPose(pose){ return BM16(g=>{
  const up=pose==='sniff'?-1:0, br=pose==='breathe'?.4:0;
  blobArt(g,0,0,16,16,[{x:8,y:11.8,r:5.8,ry:4.2+br},{x:8,y:6.8+up,r:4.6,ry:3.9},{x:3.8,y:4.6+up,r:1.5},{x:12.2,y:4.6+up,r:1.5}],TOPI5,{grad:.5});
  const P=(x,y,c)=>bmPix(g,x,y,c), cy=up;
  for(const [x,y] of [[6,11],[7,11],[8,11],[9,11],[6,12],[7,12],[8,12],[9,12],[10,12],[7,13],[8,13],[9,13]]) P(x,y,y===11?'#fff4e0':'#f0e0c8'); // la barriga
  if(pose==='blink'){ P(5,6+cy,PAL.k); P(6,6+cy,PAL.k); P(10,6+cy,PAL.k); P(11,6+cy,PAL.k); }
  else { for(const x of [5,10]){ P(x,5+cy,PAL.k); P(x,6+cy,PAL.k); P(x+1,6+cy,PAL.k); P(x+1,5+cy,'#ffffff'); } }
  g.fillStyle='#f08ab0'; g.fillRect(7,7+cy,2,1+(pose==='sniff'?1:0)); P(7,7+cy,'#ffc0d8'); // la naricilla
  if(pose==='bite'){ g.fillStyle=PAL.k; g.fillRect(6,9+cy,4,3); g.fillStyle='#8a2030'; g.fillRect(7,10+cy,2,1); P(7,9+cy,'#ffffff'); P(8,9+cy,'#ffffff'); }
  else { P(7,9+cy,'#ffffff'); P(8,9+cy,'#ffffff'); P(6,9+cy,PAL.k); P(9,9+cy,PAL.k); }
  P(3,8+cy,PAL.k); P(2,7+cy,PAL.k); P(12,8+cy,PAL.k); P(13,7+cy,PAL.k); // los bigotes
  for(const x of [3,11]){ g.fillStyle=PAL.k; g.fillRect(x-1,12,4,3); g.fillStyle='#fff4e0'; g.fillRect(x,13,2,1); P(x,12,'#f0e0c8'); } // las zarpas
  P(6,8+cy,'rgba(240,112,112,.8)'); P(10,8+cy,'rgba(240,112,112,.8)'); }); }
const TOPI_P={idle:topiPose('idle'),breathe:topiPose('breathe'),blink:topiPose('blink'),sniff:topiPose('sniff'),bite:topiPose('bite')};
const TOPI_HOLE=sprN(["....kkkkkkkk....","..kkTTTTTTTTkk..",".kTTttttttttTTk.",".kTtttttttttttk.",".kTTttttttttTTk.","..kkTTTTTTTTkk..","....kkkkkkkk...."],{T:'#6a5234',t:'#1a120c'});
ENEMY_DRAW.topillo=e=>{ const flash=e.flash>4, t=e.anim||0, hx=e.hx|0, hy=e.hy|0;
  const shake=e.st==='hide'&&e.t<14?((t>>1)&1):0; ctx.drawImage(TOPI_HOLE,hx+shake,hy+9);
  if(e.st==='hide'){ if(e.t<6){ ctx.fillStyle=PAL.k; ctx.fillRect(hx+6,hy+9,4,3); ctx.fillStyle='#f08ab0'; ctx.fillRect(hx+7,hy+9,2,1); } return; } // la naricilla asoma
  const up=Math.min(1,(70-e.t)/8), down=e.t<8?e.t/8:1, k=Math.min(up,down);
  let img=TOPI_P.idle; if(e.t<=46&&e.t>40) img=TOPI_P.sniff; else if(e.t<=40&&e.t>32) img=TOPI_P.bite; else if((t%90)<5) img=TOPI_P.blink; else if((t>>4)&1) img=TOPI_P.breathe;
  const x=e.x|0, y=e.y|0; ctx.save(); ctx.beginPath(); ctx.rect(x-2,y-4,20,Math.round(15*k)+4); ctx.clip();
  bmDraw(img,x,y+Math.round((1-k)*10),false,flash); ctx.restore(); };
ENEMY_FX.topillo=(e,dx,dy,d)=>{ e.anim=(e.anim||0)+1;
  if(e.st==='hide'&&e.t<14&&(e.anim&3)===0) parts.push({k:'shard',x:e.hx+4+Math.random()*8,y:e.hy+11,vx:(Math.random()-.5)*.8,vy:-.9,life:10,max:10,col:'#6a5234'});
  if(e.st==='up'&&e.t===69) e.squash=.4;
  if(e.st==='up'&&e.t===40&&d<40){ e.squash=.3; if(AC) beep('square',700,420,.06,.03); } // ¡ñac!
  if(e.st==='up'&&e.t===46&&AC) beep('triangle',900,1200,.04,.015); };
ENEMY_DEATH.topillo=e=>{ bmSmoke(e.x+8,e.y+8,['#9a7048','#c09a6c','#e8cc9c']); puff(e.hx+8,e.hy+12,'#6a5234',10,1.2); bmBits(e.x+8,e.y+10,['#6a5234','#9a7048','#e8cc9c'],8,1.5); bmRing(e.hx+8,e.hy+12,10,'#e8cc9c'); };

/* ============================================================ EL LIRIO DE AGUA ============================================================ */
const LIRIO5=['#6a1040','#b02870','#f050a0','#ff98cc','#ffe0f0'], PAD5=['#1a4a1a','#2e7830','#58a848','#98e070','#d0f8b0'];
function lirioPose(pose,f){ return BM16(g=>{ f=f||0;
  blobArt(g,0,0,16,16,[{x:8,y:12,r:7.4,ry:2.8}],PAD5,{grad:.3,dither:.5}); // la hoja
  g.fillStyle=PAD5[0]; g.fillRect(8,11,1,3); bmPix(g,7,12,PAD5[0]); bmPix(g,3,12,PAD5[4]);
  const s=pose==='bud'?(f?1:0):0;
  if(pose==='bud'||pose==='swell'){ const k=pose==='swell'?1.18:1, cx=8+s*.5; // un capullo redondo de tres pétalos, con los sépalos verdes abajo
    blobArt(g,0,0,16,16,[{x:cx-2,y:8.4,r:1.9*k,ry:2.6*k},{x:cx+2,y:8.4,r:1.9*k,ry:2.6*k},{x:cx,y:7.4-(k-1)*3,r:2.6*k,ry:3.2*k}],LIRIO5,{grad:.45});
    const c=Math.round(cx), top=Math.round(4.6-(k-1)*4); g.fillStyle=LIRIO5[1]; g.fillRect(c-1,top+2,1,4); g.fillRect(c+1,top+2,1,4); bmPix(g,c,top+1,LIRIO5[4]); bmPix(g,c-2,7,LIRIO5[4]);
    g.fillStyle=PAL.k; g.fillRect(c-3,10,7,2); g.fillStyle=PAD5[2]; g.fillRect(c-2,10,5,1); bmPix(g,c-3,10,PAD5[3]); bmPix(g,c+3,10,PAD5[1]); return; }
  // abierto: pétalos alrededor y la boca amarilla en el centro (spit: más abiertos y la boca redonda)
  const wide=pose==='spit'?1:0, half=pose==='half';
  const pet=half?[[8,5,2,3],[5,7,2,2.4],[11,7,2,2.4]]:[[8,3-wide,2,3],[3-wide,7,2.6,2],[13+wide,7,2.6,2],[4,4-wide,2,2.2],[12,4-wide,2,2.2]];
  blobArt(g,0,0,16,16,pet.map(([x,y,r,ry])=>({x,y,r,ry})).concat([{x:8,y:8,r:3.4,ry:2.8}]),LIRIO5,{grad:.4});
  if(!half){ g.fillStyle=PAL.k; g.fillRect(6,7,4,wide?3:2); g.fillStyle='#f8d030'; g.fillRect(6,6,4,1); bmPix(g,7,7+wide,'#8a4a10'); bmPix(g,8,7+wide,'#8a4a10'); if(wide) bmPix(g,6,6,'#fff4b0'); } }); }
const LIRIO_P={bud:[lirioPose('bud',0),lirioPose('bud',1)],swell:lirioPose('swell'),open:lirioPose('open'),spit:lirioPose('spit'),half:lirioPose('half')};
ENEMY_DRAW.lirio=e=>{ const flash=e.flash>4, t=e.anim||0, x=e.x|0, bob=Math.round(Math.sin(tick*.06+e.x)), y=(e.y|0)+bob;
  const r=6+((t>>3)%8); ctx.fillStyle='rgba(220,240,255,.45)'; for(let i=0;i<14;i++){ const a=i/14*6.283+t*.01, px=Math.round(e.x+8+Math.cos(a)*r*1.3), py=Math.round(e.y+13+Math.sin(a)*r*.45); if(((i+(t>>3))&3)!==0) ctx.fillRect(px,py,1,1); } // ondas en el agua
  let img=LIRIO_P.bud[(t>>5)&1], sh=0;
  if(e.st==='closed'){ const c=e.t%150; if(c>=92&&c<110&&e.near){ img=LIRIO_P.swell; sh=(t>>1)&1; } }
  else { const o=e.ot; img=o>36?LIRIO_P.half:o>31?LIRIO_P.open:o>24?LIRIO_P.spit:o>5?LIRIO_P.open:LIRIO_P.half; }
  bmDraw(img,x+sh,y,false,flash); };
ENEMY_FX.lirio=(e,dx,dy,d)=>{ e.anim=(e.anim||0)+1; e.near=d<110?1:0;
  if(e.st==='open'&&e.ot===30){ e.squash=-.35; bmRing(e.x+8,e.y+7,8,'#ffe0f0'); for(let i=0;i<3;i++) parts.push({k:'mote',x:e.x+8,y:e.y+6,vx:(Math.random()-.5)*1.2,vy:-.8,life:14,max:14,sway:0,col:'#f8d030',nog:true}); }
  if(e.st==='open'&&e.ot===39) e.squash=.25; };
ENEMY_DEATH.lirio=e=>{ bmRing(e.x+8,e.y+12,12,'#dff0ff'); puff(e.x+8,e.y+12,'#dff0ff',6,.8);
  for(let i=0;i<6;i++) parts.push({k:'leafF',x:e.x+8,y:e.y+6,vx:(Math.random()-.5)*1.8,vy:-1.1-Math.random()*.8,life:70,max:70,sway:Math.random()*6,col:['#f050a0','#ff98cc','#ffe0f0'][i%3],nog:false});
  bmBits(e.x+8,e.y+12,['#58a848','#98e070'],5,1); };

/* ============================================================ LA RODAHOJA ============================================================ */
/* rueda de verdad: 8 fotogramas en los que las hojas del borde y las vetas giran alrededor (la luz se queda arriba a la izquierda);
   la cara se dibuja aparte, siempre derecha */
function rodaFrame(i){ return BM16(g=>{ const a=i/8*6.2832, L=[{x:8,y:8.6,r:5.8}];
  for(let k=0;k<4;k++){ const b=a+k*1.5708; L.push({x:8+Math.cos(b)*4.3,y:8.6+Math.sin(b)*4.3,r:2.2}); } // las hojas del borde: asoman poco, así sigue redonda
  blobArt(g,0,0,16,16,L,RODA_PAL,{grad:.5,dither:.6});
  for(let k=0;k<5;k++){ const b=a+k*1.2566+.4, r=k&1?2.4:4, x=Math.round(8+Math.cos(b)*r), y=Math.round(8.6+Math.sin(b)*r); bmPix(g,x,y,'#5a2410'); if(k===1) bmPix(g,x+1,y,'#8a9a38'); }
  const sb=a+.8; bmPix(g,Math.round(8+Math.cos(sb)*6.6),Math.round(8.6+Math.sin(sb)*6.6),'#8a9a38'); }); }
const RODA_F=Array.from({length:8},(_,i)=>rodaFrame(i));
ENEMY_DRAW.rodahoja=e=>{ const flash=e.flash>4, x=e.x|0, y=e.y|0; drawShadow(e.x+8,e.y+15,5);
  const dir=Math.sign(e.vx||1), fr=(((Math.floor((e.roll||0)/3))%8)+8)%8; bmDraw(RODA_F[dir>0?fr:(8-fr)%8],x,y,false,flash);
  // la cara, derecha, mirando hacia donde rueda
  const lk=dir>0?1:0, hurt=e.flash>0; ctx.fillStyle=PAL.k;
  if(hurt){ ctx.fillRect(x+5+lk,y+7,2,1); ctx.fillRect(x+9+lk,y+7,2,1); } else { ctx.fillRect(x+5+lk,y+6,1,2); ctx.fillRect(x+9+lk,y+6,1,2); ctx.fillStyle='#ffffff'; ctx.fillRect(x+6+lk,y+6,1,1); ctx.fillRect(x+10+lk,y+6,1,1); }
  ctx.fillStyle='#3a1808'; ctx.fillRect(x+6+lk,y+9,4,1); if(hurt) ctx.fillRect(x+7+lk,y+10,2,1); };
ENEMY_FX.rodahoja=(e,dx,dy,d)=>{ e.anim=(e.anim||0)+1; e.roll=(e.roll||0)+1;
  const sx=Math.sign(e.vx), sy=Math.sign(e.vy);
  if(e.pvx!==undefined&&(sx!==e.pvx||sy!==e.pvy)){ e.squash=.35; stepDustAt(e.x+8,e.y+15,.5); for(let i=0;i<2;i++) parts.push({k:'leafF',x:e.x+8,y:e.y+8,vx:(Math.random()-.5)*1.4,vy:-1,life:36,max:36,sway:Math.random()*6,col:['#e09a3a','#c06a24'][i],nog:false}); if(AC) noise(.04,.025,false,undefined,1200); } // ¡pof!: rebota
  e.pvx=sx; e.pvy=sy; };
ENEMY_DEATH.rodahoja=e=>{ bmRing(e.x+8,e.y+8,12,'#f8cc68'); for(let i=0;i<10;i++){ const a=i/10*6.283; parts.push({k:'leafF',x:e.x+8+Math.cos(a)*3,y:e.y+8+Math.sin(a)*3,vx:Math.cos(a)*1.4,vy:Math.sin(a)*1.2-.8,life:60,max:60,sway:Math.random()*6,col:['#e09a3a','#c06a24','#f8cc68','#944418'][i%4],nog:false}); } if(AC) noise(.1,.04,false,undefined,1600); };

/* la hoja de poses (para revisar: no la usa el juego) */
function BM_SHEET(x0,y0){ const L=[...CROW_P.perch,CROW_P.caw[0],CROW_P.swoop,CROW_P.flap[0],CROW_P.flap[1],CROW_P.stun,...KNIGHT_P.walk,KNIGHT_P.wind,KNIGHT_P.lunge,KNIGHT_P.rest[0],
  ...ROOT_P.hide,ROOT_P.up[0],ROOT_P.up[3],...ROOT_P.grab,TOPI_P.idle,TOPI_P.blink,TOPI_P.sniff,TOPI_P.bite,...LIRIO_P.bud,LIRIO_P.swell,LIRIO_P.open,LIRIO_P.spit,LIRIO_P.half,RODA_F[0],RODA_F[2],RODA_F[4]];
  L.forEach((im,i)=>ctx.drawImage(im,x0+(i%8)*19,y0+Math.floor(i/8)*18)); }
