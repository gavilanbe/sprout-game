'use strict';
/* ---------- RENDER DE LA ESCENA ---------- */
/* sombra de pixel: elipse dura, precalculada por radio */
const SHADOW_CACHE={};
function shadowSpr(r){ r=Math.max(2,Math.round(r)); let c=SHADOW_CACHE[r]; if(c) return c; const h=r>7?3:2;
  c=mkCanvas(r*2+1,h*2+1); const g=c.getContext('2d'); g.fillStyle='rgba(12,20,12,.3)';
  for(let y=-h;y<=h;y++){ const w=Math.round(r*Math.sqrt(Math.max(0,1-(y*y)/((h+.5)*(h+.5))))); g.fillRect(r-w,h+y,w*2+1,1); }
  g.fillStyle='rgba(12,20,12,.14)'; g.fillRect(r-Math.round(r*.55),h-1,Math.round(r*1.1)+1,3);
  return SHADOW_CACHE[r]=c; }
function drawShadow(x,y,r){ const s=shadowSpr(r); ctx.drawImage(s,Math.round(x-s.width/2),Math.round(y-s.height/2)); }
function drawSword(){ // la Hoja: coge impulso, barre doblándose y girándose, latiguea (el guion en LEAF_SWING_FR, 12b)
  if(player.atk<=0) return;
  const ph=Math.min(13,14-player.atk), base=[Math.PI/2,-Math.PI/2,Math.PI,0][player.dir], S=leafSwingAt(ph), a=base+S[0], cx=player.x+8, cy=player.y+10;
  if(ph>=1&&ph<=8) drawSmear(cx,cy,base-2.15,a+.25,ph);                                   // el aire que corta, detrás
  if(ph>=2&&ph<=6) for(let k=2;k>=1;k--){ const P=leafSwingAt(ph-k); drawLeafBlade(cx,cy,base+P[0],P[2],P[1],.17*(3-k),'#eaffd8'); } // su estela
  drawLeafBlade(cx,cy,a,S[2],S[1]);
  bladeGlow(cx+Math.cos(a)*14,cy+Math.sin(a)*14);
}
/* la estela del tajo: no una media luna de acero sino aire que se abre (una raya blanca con huecos por
   fuera, una verde por dentro y un velo tramado entre las dos) que se deshace desde la cola */
function drawSmear(cx,cy,a0,a1,ph){
  cx=Math.round(cx); cy=Math.round(cy); const fade=ph/8, tail=a0+(a1-a0)*Math.max(0,(ph-3)/5);
  const norm=a=>{ while(a<-Math.PI) a+=6.283; while(a>Math.PI) a-=6.283; return a; };
  const span=norm(a1-tail), rOut=21-Math.round(fade*2), r1=rOut-.6, r2=rOut-4.6, SM=bladeTier().smear;
  for(let y=-rOut;y<=rOut;y++) for(let x=-rOut;x<=rOut;x++){ const d=Math.sqrt(x*x+y*y); if(d<r2-1||d>rOut) continue;
    const t=norm(Math.atan2(y,x)-tail); if(t<0||t>span) continue; const along=t/span; // 0 cola → 1 punta
    if(Math.abs(d-r1)<.62){ if(along<.75&&((x*3+y*5)&3)===0) continue; ctx.fillStyle=along>.45?'#ffffff':SM[3]; ctx.globalAlpha=(.35+.65*along)*(1-fade*.55); }
    else if(Math.abs(d-r2)<.58){ if(along<.3) continue; ctx.fillStyle=SM[2]; ctx.globalAlpha=.85*along*(1-fade*.6); }
    else if(d>r2&&d<r1&&((x+y)&1)===0&&along>.2){ ctx.fillStyle=along>.7?SM[3]:SM[1]; ctx.globalAlpha=.32*along*(1-fade*.7); }
    else continue;
    ctx.fillRect(cx+x,cy+y,1,1); }
  ctx.globalAlpha=1;
}
function drawPlayer(){
  if(state==='door'&&typeof drawDoorPlayer==='function'&&drawDoorPlayer()) return; // cruzando una puerta: recortado por el hueco (15g)
  if(state==='dying'||playerHidden) return; // lo pinta drawWilt (15c), por encima del mundo que se apaga · playerHidden: una presentación lo dibuja a su manera (15i)
  if(state==='fall'){ const k=1-deathT/40; ctx.save(); ctx.translate(player.x+8,player.y+10); ctx.rotate(k*6); ctx.scale(1-k,1-k); ctx.drawImage(P_SPRITES[0][0],-8,-8); ctx.restore(); return; }
  if(inBed){ ctx.drawImage(wakeT>25?H_SLEEP:H_WAKE,(player.x+4)|0,(player.y+2)|0); return; }
  if(sproutT>0){ drawRebroteHero(); return; } // rebrotar (15c): la semilla germina y Sprout sale de un salto
  const inv=player.inv>0&&(tick&3)<2&&state==='play';
  drawShadow(player.x+8,player.y+15,jumpT>0?Math.max(2,6-jumpZ/4):6);
  if(inv) return;
  const py=player.y-jumpZ;
  drawSpinCharge(py);
  if(player.dir===1&&player.atk>0) drawSword();
  if(player.dir===1&&typeof drawPinHeld==='function') drawPinHeld(); // el molinillo, detrás si mira arriba (12b)
  let s=P_SPRITES[player.dir][player.frame];
  const idle=player.frame===0&&player.atk===0&&state==='play';
  if(idle&&((tick+37)%210)<7) s=P_BLINK[player.dir];                 // parpadeo
  if(player.atk>0&&player.atk>4) s=P_ATK[player.dir];
  if(player.spin>0) s=P_ATK[spinFacing()];                           // en el Remolino, Sprout gira con su Hoja
  if(state==='itemget'&&!(typeof moment!=='undefined'&&moment&&moment.phase==='grab'&&moment.t<M_CATCH)) s=H_LIFT; // tras la cinemática, alza los brazos al atraparla
  if(state==='rite'&&rite&&rite.t<(rite.A?RITE_T.fly+4:RITE_T.tree)) s=H_LIFT; // el rito: alza la reliquia (o las semillas)
  if(player.inv>54&&state==='play'&&!rebornInv) s=P_WHITE[player.dir]; // destello al recibir daño (al rebrotar no: 15c)
  // estirar y encoger: el golpe estira, el aterrizaje y el daño aplastan; en reposo respira
  let sq=player.squash||0; if(idle&&((tick>>5)&1)&&(tick&31)<10) sq-=.06;
  const lunge=player.atk>8?[[0,1],[0,-1],[-1,0],[1,0]][player.dir]:state==='play'?pushLean():[0,0];
  const wade=jumpT===0&&state==='play'&&playerOnTile()==='w'; // en el vado: los pies bajo el agua
  if(wade){ ctx.save(); ctx.beginPath(); ctx.rect(player.x-8,py-12,32,28-3); ctx.clip(); }
  if(Math.abs(sq)>.01){ ctx.save(); ctx.translate((player.x+8+lunge[0])|0,(py+16+lunge[1])|0); ctx.scale(1-sq*.55,1+sq); ctx.drawImage(s,-8,-16); ctx.restore(); }
  else ctx.drawImage(s,(player.x+lunge[0])|0,(py+lunge[1])|0);
  if(wade){ ctx.restore(); const wx=player.x|0, wy=(py+13)|0, f=(tick>>3)&1; ctx.fillStyle='#e8f8ff'; ctx.fillRect(wx+3+f,wy,4,1); ctx.fillRect(wx+9-f,wy,4,1); ctx.fillStyle='#a0d8f8'; ctx.fillRect(wx+2,wy+1,12,1); }
  drawShieldOn(player.x,py);
  if(player.dir!==1&&player.atk>0) drawSword();
  if(player.dir!==1&&typeof drawPinHeld==='function') drawPinHeld(); // el molinillo alzado mientras sopla (12b)
  if(player.spin>0) drawSpinBlade(py);
}
function drawEnemy(e){
  if(MILL_ENEMY[e.type]){ drawMillEnemy(e); return; } // cuervo, caballero de hoja y raíz (12b)
  const S=E_SPR[e.type]; if(!S) return;
  const flash=e.flash>4, fl=e.type==='bat'||e.type==='bee'||e.type==='ghost'||e.type==='wisp';
  if(fl) drawShadow(e.x+8,e.y+15,4); else if(e.type!=='icicle'&&e.type!=='thorn') drawShadow(e.x+8,e.y+15,5);
  const fr=(tick>>3)&1;
  let img;
  if(e.type==='blob'){ img=e.fast?S.fast[fr]:(fr?S.b:S.a); if(flash) img=e.fast?S.w.fast[fr]:(fr?S.w.b:S.w.a);
    if(e.type==='blob'&&e.vx===0&&e.vy===0) img=flash?(e.fast?S.w.fast[0]:S.w.a):(e.fast?S.fast[0]:S.a); }
  else if(e.type==='bat'){ const f=(tick>>2)&1; img=e.fast?S.fast[f]:(f?S.b:S.a); if(flash) img=e.fast?S.w.fast[f]:(f?S.w.b:S.w.a);
    ctx.drawImage(img,e.x|0,(e.y+Math.sin(tick*.2+e.x)*1.5)|0); return; }
  else if(e.type==='bee'){ const f=(tick>>1)&1; img=flash?(f?S.w.b:S.w.a):(f?S.b:S.a); ctx.drawImage(img,e.x|0,(e.y+Math.sin(tick*.25+e.x)*1.5)|0); return; }
  else if(e.type==='beetle'){ img=flash?(fr?S.w.b:S.w.a):(fr?S.b:S.a); if(e.dir<0){ ctx.save(); ctx.translate((e.x|0)+16,e.y|0); ctx.scale(-1,1); ctx.drawImage(img,0,0); ctx.restore(); return; } }
  else if(e.type==='crab'){ img=flash?(fr?S.w.b:S.w.a):(fr?S.b:S.a); }
  else if(e.type==='roller'){ const rolling=e.st==='roll'; img=flash?(rolling?S.w.ball:S.w.a):(rolling?S.ball:S.a);
    if(rolling){ ctx.save(); ctx.translate((e.x|0)+8,(e.y|0)+8); ctx.rotate((tick*0.5)%(Math.PI*2)); ctx.drawImage(img,-8,-8); ctx.restore(); return; }
    if(e.st==='windup'){ ctx.drawImage(img,(e.x+((tick&2)?1:-1))|0,e.y|0); return; } }
  else if(e.type==='ghost'){ ctx.globalAlpha=e.phase>=110?0.28:0.82; ctx.drawImage(flash?S.w.a:S.a,(e.x|0),(e.y|0)+(Math.sin(tick*.1+e.x)*1.5|0)); ctx.globalAlpha=1; return; }
  else if(e.type==='frog'){ img=flash?(e.st==='jump'?S.w.jump:S.w.a):(e.st==='jump'?S.jump:S.a); if(e.st==='crouch'){ ctx.save(); ctx.translate((e.x|0)+8,(e.y|0)+16); ctx.scale(1.12,.82); ctx.drawImage(img,-8,-16); ctx.restore(); return; } }
  else if(e.type==='thorn'){ img=flash?(e.st==='open'?S.w.open:S.w.a):(e.st==='open'?S.open:S.a); }
  else if(e.type==='squirrel'){ const toward=e.st==='dash'?Math.sign(player.x-e.x):(e.st==='flee'?e.fx:Math.sign(e.vx||1)); img=flash?S.w.a:S.a; const hop=(e.st==='wander')?0:((tick&4)?-1:0);
    if(toward>0){ ctx.save(); ctx.translate((e.x|0)+16,(e.y|0)+hop); ctx.scale(-1,1); ctx.drawImage(img,0,0); ctx.restore(); } else ctx.drawImage(img,e.x|0,(e.y|0)+hop); return; }
  else if(e.type==='seton'){ img=flash?(e.st==='puff'?S.w.b:S.w.a):(e.st==='puff'?S.b:S.a); }
  else if(e.type==='wisp'){ const f=(tick>>2)&1; img=flash?(f?S.w.b:S.w.a):(f?S.b:S.a); ctx.drawImage(img,e.x|0,(e.y+Math.sin(tick*.15)*2)|0); glowAt(e.x+8,e.y+8,14,'rgba(248,160,48,.25)'); return; }
  else if(e.type==='snail'){ img=flash?(e.st==='in'?S.w.shell:S.w.a):(e.st==='in'?S.shell:S.a); }
  else if(e.type==='topillo'){ ctx.drawImage(TOPILLO_HOLE,e.hx|0,(e.hy+10)|0); if(e.st==='hide') return; const up=Math.min(1,(70-e.t)/8); img=flash?S.w.a:S.a;
    ctx.save(); ctx.beginPath(); ctx.rect(e.x|0,e.y|0,16,(16*up)|0); ctx.clip(); ctx.drawImage(img,e.x|0,(e.y+(1-up)*8)|0); ctx.restore(); return; }
  else if(e.type==='lirio'){ img=flash?(e.st==='open'?S.w.b:S.w.a):(e.st==='open'?S.b:S.a); ctx.drawImage(img,e.x|0,(e.y+Math.sin(tick*.06+e.x)*1)|0); return; }
  else if(e.type==='rodahoja'){ img=flash?S.w.a:S.a; ctx.save(); ctx.translate((e.x|0)+8,(e.y|0)+8); ctx.rotate(e.t*.15*Math.sign(e.vx)); ctx.drawImage(img,-8,-8); ctx.restore(); return; }
  else if(e.type==='gust'){ ctx.save(); ctx.translate((e.x|0)+8,(e.y|0)+8);
    for(let r=0;r<3;r++){ ctx.strokeStyle=r%2?'#cfe8ff':'#9ec7e8'; ctx.globalAlpha=.7-r*.18; ctx.beginPath(); ctx.arc(0,0,3+r*3,tick*.2+r,tick*.2+r+4.2); ctx.stroke(); }
    ctx.globalAlpha=1; ctx.restore(); return; }
  else img=flash?S.w.a:S.a;
  if(e.type==='golem'){ ctx.drawImage(img,e.x|0,(e.y+((e.t%16)<8?0:1))|0); return; }
  ctx.drawImage(img,(e.x|0),(e.y|0));
}
function glowAt(x,y,r,col){ const g=ctx.createRadialGradient(x,y,1,x,y,r); g.addColorStop(0,col); g.addColorStop(1,'rgba(0,0,0,0)'); ctx.fillStyle=g; ctx.fillRect(x-r,y-r,r*2,r*2); }
/* el GRAN ROBLE de la plaza: marcador vivo del progreso */
function drawGreatOak(ox,oy){
  ctx.drawImage(OAK_GRAND,ox,oy);
  if(!won){ ctx.globalAlpha=.42; ctx.drawImage(OAK_GRAND_DARK,ox,oy); ctx.globalAlpha=1; }
  else { const pts=[[20,22],[48,14],[62,28],[30,34],[12,28],[40,24],[56,38],[28,8]];
    pts.forEach(([ax,ay],i)=>{ const tw=(((tick>>4)+i)&7)===0; ctx.fillStyle=tw?'#ffe9a0':PAL.a; ctx.fillRect(ox+ax,oy+ay,2,2); ctx.fillStyle=PAL.A; ctx.fillRect(ox+ax,oy+ay-1,2,1); }); }
  if(thawed){ ctx.fillStyle='#f8c8e0'; [[8,20],[58,10],[70,34],[36,4],[16,38],[48,30],[26,16],[64,20]].forEach(([bx,by])=>ctx.fillRect(ox+bx,oy+by,1,1)); }
  if(summered){ ctx.fillStyle='#fff7c0'; [[28,30],[54,22],[40,42],[14,14],[66,26]].forEach(([bx,by],i)=>{ if((((tick>>4)+i*2)&7)<3) ctx.fillRect(ox+bx,oy+by,1,1); }); }
  if(cycled){ ctx.fillStyle='rgba(168,236,120,'+(0.07+0.05*Math.sin(tick*.06)).toFixed(2)+')'; ctx.beginPath(); ctx.arc(ox+42,oy+24,40,0,6.29); ctx.fill(); }
  if((tick%70)===0) parts.push({x:ox+10+Math.random()*64,y:oy+30+Math.random()*10,vx:(Math.random()-.5)*.3,vy:.3,life:46,col:(tick&1)?C.canopyL:PAL.l});
}
const ITEM_SPRS={blade:BLADE_SPR,bomb:BOMB_SPR,ember:EMBER_SPR,hook:HOOK_SPR,tear:TEAR_SPR,flake:FLAKE_SPR,boomer:BOOMER_SPR,lantern:LANTERN_SPR,feather:FEATHER_SPR,molinillo:PINWHEEL_SPR,amber:AMBER_SPR};
/* destello que barre un sprite en diagonal (brillo de objeto valioso) */
function drawGlint(img,x,y,ph){ if(ph<0||ph>1) return; const w=img.width, h=img.height, gx=-h+ph*(w+h*2);
  ctx.save(); ctx.beginPath(); ctx.moveTo(x+gx,y+h); ctx.lineTo(x+gx+3,y+h); ctx.lineTo(x+gx+3+h,y); ctx.lineTo(x+gx+h,y); ctx.closePath(); ctx.clip();
  ctx.drawImage(tintCached(img,'#ffffff'),x,y); ctx.restore(); }
function pickupImg(p){ return {lure:LURE_SPR,bombs:ACORN,container:HEART_FULL,piece:PIECE_SPR,diary:DIARY_SPR,letter:LETTER_SPR,key:KEY_SPR,bigkey:BIGKEY_SPR,seed:ACORN_GOLD,berry:BERRY_SPR,heart:HEART_FULL}[p.kind]||ITEM_SPRS[p.kind]; }
function drawPickup(p){
  const img=pickupImg(p); if(!img) return;
  const big=!!ITEM_SPRS[p.kind], pop=p.t<12?easeOutBack(Math.min(1,p.t/12)):1;
  const bob=big?Math.round(Math.sin(tick*.08)*1.5):Math.round(Math.sin((tick+p.t)*.1)*1.5), air=(p.drop>0?Math.sin(p.drop/14*Math.PI)*4:0);
  const sc=p.kind==='container'?2:1, w=img.width*sc, h=img.height*sc;
  const cx=p.x+(big?8:4), fy=p.y+(big?15:9);
  drawShadow(cx,fy,Math.max(2,(big?6:4)-Math.max(0,-bob)-air*.3));
  if(big) glowAt(p.x+8,p.y+8,14+Math.sin(tick*.1)*2,'rgba(255,240,160,.22)');
  const x=Math.round(cx-w/2), y=Math.round(fy-h-1+(big?1:0)+bob);
  if(pop<1){ ctx.save(); ctx.translate(cx,fy); ctx.scale(pop,pop); ctx.drawImage(img,0,0,img.width,img.height,-w/2,-h-1,w,h); ctx.restore(); return; }
  ctx.drawImage(img,0,0,img.width,img.height,x,y,w,h);
  const period=big?70:110, ph=(((tick+p.t*7)%period)/14); if(sc===1) drawGlint(img,x,y,ph);
  const every=big?7:p.kind==='key'||p.kind==='bigkey'||p.kind==='container'?7:15;
  if((tick%every)===0&&p.kind!=='berry'&&p.kind!=='heart'){ const col={container:PAL.r,piece:PAL.r,diary:'#e8d0a0',letter:'#a8c0d8',key:PAL.y,bigkey:PAL.Y,seed:C.flowerC,ember:'#f8a030'}[p.kind]||C.flowerC;
    sparkle(x+Math.random()*w,y+Math.random()*h*.6,col); }
}
const MOUND_ART=(()=>{ const c=mkCanvas(24,12), g=c.getContext('2d');
  blobArt(g,0,0,24,12,[{x:6,y:9,r:5,ry:4},{x:18,y:9,r:5,ry:4},{x:12,y:7,r:7,ry:5.5}],['#3a2a1a','#5a4430','#7a6044','#9a7c58','#bca07a'],{grad:.6});
  g.fillStyle='#bca07a'; g.fillRect(9,3,2,1); g.fillRect(15,5,1,1); g.fillStyle='#3a2a1a'; g.fillRect(12,8,1,1); g.fillRect(6,9,1,1); return c; })();
function drawDizzy(cx,cy){ for(let i=0;i<3;i++){ const a=tick*.12+i*2.09, x=Math.round(cx+Math.cos(a)*10), y=Math.round(cy+Math.sin(a)*3); ctx.fillStyle=PAL.k; ctx.fillRect(x-1,y-2,3,5); ctx.fillRect(x-2,y-1,5,3); ctx.fillStyle=(i&1)?'#fff0a0':'#ffffff'; ctx.fillRect(x,y-1,1,3); ctx.fillRect(x-1,y,3,1); } }
function drawBoss(){
  const b=boss;
  if(b.type==='topo'){
    if(b.st==='burrow'||b.st==='warn'){ const wob=b.st==='warn'?(tick&2)-1:0;
      drawShadow(b.mx+16+wob,b.my+26,12); ctx.drawImage(MOUND_ART,(b.mx+4+wob)|0,(b.my+16)|0);
      if(b.st==='warn'&&(tick&3)===0) parts.push({x:b.mx+8+Math.random()*16,y:b.my+20,vx:(Math.random()-.5)*1.2,vy:-1.2,life:14,col:(tick&4)?'#8a6a48':'#5a4430'}); return; }
    if(b.st==='yield') glowAt(b.x+16,b.y+16,22,'rgba(120,232,120,'+(0.25+0.15*Math.sin(tick*.3))+')');
    drawShadow(b.x+16,b.y+30,12);
    const img=b.flash>5?BOSS_WHITE.topo:BOSS_SPR.topo, dz=b.st==='dazed', sq=dz?Math.sin(tick*.5)*.08:Math.sin(tick*.2)*.05, tr=b.st==='yield'?((tick&2)?.5:-.5):0;
    ctx.save(); ctx.translate(b.x+16+tr,b.y+30); if(dz) ctx.rotate(Math.sin(tick*.15)*.12); ctx.scale(1+sq,1-sq); ctx.drawImage(img,-16,-30); ctx.restore();
    if(dz) drawDizzy(b.x+16,b.y-2);
    if(b.st==='up'&&(tick&15)<8){ ctx.fillStyle='rgba(200,216,255,.35)'; ctx.fillRect(b.x+8,b.y+2,16,3); } // el casco de roca brilla
  } else if(b.type==='avispa'){
    const grounded=b.st==='tired'||b.st==='yield'||b.st==='pinned'||b.st==='yanked';
    if(b.st==='pinned') drawDizzy(b.x+16,b.y+2);
    if(b.st==='yield') glowAt(b.x+16,b.y+16,22,'rgba(120,232,120,'+(0.25+0.15*Math.sin(tick*.3))+')');
    if(!grounded){ ctx.fillStyle='rgba(10,10,20,.3)'; ctx.beginPath(); ctx.ellipse(b.x+16,100,10,3,0,0,6.283); ctx.fill(); } else drawShadow(b.x+16,b.y+30,12);
    const img=b.flash>5?BOSS_WHITE.avispa:BOSS_SPR.avispa, flap=grounded?0:Math.sin(tick*.6)*.1;
    ctx.save(); ctx.translate(b.x+16,b.y+16); if(grounded) ctx.rotate(b.st==='yield'?.15:b.st==='pinned'?.5+Math.sin(tick*.2)*.05:.3); ctx.scale(1+flap,1-flap); ctx.drawImage(img,-16,-16); ctx.restore();
    if(bossRope){ const x0=player.x+8, y0=player.y+10, x1=b.x+16, y1=b.y+18, n=Math.max(2,(Math.hypot(x1-x0,y1-y0)/4)|0); for(let i=0;i<=n;i++){ ctx.fillStyle=i%2?PAL.l:PAL.d; ctx.fillRect((x0+(x1-x0)*i/n-1)|0,(y0+(y1-y0)*i/n-1+Math.sin(i*.8+tick*.5))|0,2,2); } }
  } else if(b.type==='ciervo'){ drawCiervo(b); // el Ciervo de Ámbar (12b)
  } else {
    const resting=b.st==='rest';
    if(resting) glowAt(b.x+16,b.y+16,26,'rgba(120,232,120,'+(0.28+0.18*Math.sin(tick*.3))+')');
    const mood=b.st==='sweep'?'howl':b.st==='aim'?'blow':b.st==='drop'||resting?'sad':(((tick>>5)&3)===0?'howl':'storm'); // aúlla, sopla, se derrumba
    const flip=b.st==='sweep'?b.vx>0:player.x+8>b.x+16, bob=resting?Math.round(Math.sin(tick*.08)):Math.round(Math.sin(tick*.12)*2);
    ctx.globalAlpha=b.st==='float'?.82:1; drawWind(b.x+16,b.y+13+bob,{s:1,mood,f:(tick>>2)&7,flip,white:b.flash>5,blink:mood==='storm'&&((tick+17)%150)<6?1:0}); ctx.globalAlpha=1;
    if(b.st==='aim'){ ctx.fillStyle='rgba(232,80,80,'+(0.25+0.2*Math.sin(tick*.4))+')'; ctx.fillRect(0,(b.row+14)|0,160,4); }
    if(resting&&b.hp<=2&&(tick&31)<20) txtO('Z',(b.x+14)|0,(b.y-18)|0);
  }
  if(b.st==='yield'&&(tick&31)<20) txtO('Z',(b.x+14)|0,(b.y-16)|0);
}
function drawMidboss(){
  const m=midboss; if(m.type==='scare'){ drawScare(m); return; }
  drawShadow(m.x+12,m.y+23,10);
  let img=BOSS_SPR[m.type]; if(m.type==='king'&&m.dir<0) img=BOSS_SPR.kingL;
  if(m.flash>4) img=m.type==='king'&&m.dir<0?BOSS_WHITE.kingL:BOSS_WHITE[m.type];
  ctx.save(); ctx.translate(m.x+12,m.y+24);
  if(m.type==='drone'){ const f=m.st==='stunned'?0:Math.sin(tick*.5)*.1; ctx.scale(1+f,1-f); if(m.st==='stunned') ctx.rotate(.3); }
  if(m.type==='king'&&m.st==='windup') ctx.translate((tick&2)?1:-1,0);
  if(m.type==='iceguard'){ if(m.soft>0) glowAt(0,-12,20,'rgba(248,160,48,.2)'); ctx.translate(0,(m.t%12)<6?0:1); }
  ctx.drawImage(img,-12,-24); ctx.restore();
  if(m.type==='drone'&&m.st==='stunned'&&(tick&7)<4) sparkle(m.x+6+Math.random()*12,m.y,'#fff0a0');
  if(m.type==='drone'&&m.st!=='stunned'){ ctx.fillStyle='rgba(10,10,20,.3)'; ctx.beginPath(); ctx.ellipse(m.x+12,104,9,3,0,0,6.283); ctx.fill(); }
}
function drawScene(){
  if(bgDirty) rebuildBg(); bgEnsure(bgFrame());
  ctx.drawImage(bgCanvas[bgFrame()],0,0); if(sx===1&&sy===1&&typeof riteBgOld==='function') riteBgOld(); drawScorches();
  if(sx===1&&sy===1){
    if(typeof drawPlaza==='function') drawPlaza(); else drawGreatOak(37,-2); // el Roble vivo, sus raíces y los altares (15f)
    if(cycled) [[26,70],[40,78],[58,70],[74,78],[90,70],[106,78],[26,86],[106,86]].forEach(([gx,gy],i)=>{ const bob=Math.sin(tick*.05+i*1.3)>0?0:1; ctx.drawImage(H_SEEDLING,gx,gy+bob); });
  }
  // fuego de las antorchas encendidas (parpadeo y luz cálida)
  for(let y=0;y<SH;y++) for(let x=0;x<SW;x++){ if(grid[y][x]===';'){ glowAt(x*16+8,y*16+4,16,'rgba(248,160,48,.22)'); if((tick&7)===0) parts.push({x:x*16+7+Math.random()*3,y:y*16+2,vx:0,vy:-.4,life:10,col:(tick&8)?'#f8e060':'#f8a030',nog:true}); } }
  drawMillBack(); // el molino de la Ciénaga, el ámbar en su altar y los molinetes (12b)
  // capa de actores, ordenada por profundidad (pies)
  const L=[];
  for(const p of pickups) L.push({y:p.y+8,f:()=>drawPickup(p)});
  for(const b of bombs) L.push({y:b.y+12,f:()=>drawBomb(b)});
  if(elderPos) L.push({y:elderPos[1]*16+16,f:()=>{ const sway=Math.sin(tick*.04)>0?0:1; drawShadow(elderPos[0]*16+7,elderPos[1]*16+15,6); ctx.drawImage(ELDER,elderPos[0]*16,elderPos[1]*16+sway+1);
    if((tick%85)===0) parts.push({x:elderPos[0]*16+14,y:elderPos[1]*16+4,vx:(Math.random()-.5)*.2,vy:-.25,life:22,col:PAL.l}); }});
  for(const n of npcs) L.push({y:n.y*16+16,f:()=>{ const sway=Math.sin(tick*.05+n.x)>0?0:1;
    if(n.guest==='viento'){ drawShadow(n.x*16+8,n.y*16+16,10); drawWind(n.x*16+8,n.y*16-2+sway,{s:.86,mood:'calm',f:(tick>>3)&7,flip:player.x>n.x*16}); if((tick&31)<16) txtO('…',n.x*16+5,n.y*16-26); } // el Viento, en paz, en su pico
    else if(n.guest){ const img=BOSS_SPR[n.guest]; drawShadow(n.x*16+8,n.y*16+16,10); ctx.drawImage(img,n.x*16-8,n.y*16-14+sway); if((tick&31)<16) txtO('…',n.x*16+5,n.y*16-24); }
    else { drawShadow(n.x*16+8,n.y*16+15,5); ctx.drawImage(NPCS[n.ch].img,n.x*16,n.y*16+sway); } }});
  for(const e of enemies) L.push({y:e.y+16,f:()=>{ if(e.pop>0){ const k=easeOutBack(1-e.pop/10), s=Math.max(.05,k); ctx.save(); ctx.translate(e.x+8,e.y+16); ctx.scale(s*(1+(1-k)*.3),s); ctx.translate(-(e.x+8),-(e.y+16)); drawEnemy(e); ctx.restore(); } // aparece de un soplo (11)
    else if(e.squash){ ctx.save(); ctx.translate(e.x+8,e.y+16); ctx.scale(1+e.squash*.6,1-e.squash*.5); ctx.translate(-(e.x+8),-(e.y+16)); drawEnemy(e); ctx.restore(); } else drawEnemy(e); }});
  if(blockSlide) L.push({y:blockPos()[1]+16,f:drawBlockSlide});
  if(boss&&!bossHidden) L.push({y:boss.y+32,f:()=>{ if(boss.echo){ glowAt(boss.x+16,boss.y+16,30,'rgba(170,140,255,'+(0.3+0.1*Math.sin(tick*.1)).toFixed(2)+')'); if((tick&7)===0) parts.push({k:'mote',x:boss.x+4+Math.random()*24,y:boss.y+28,vx:0,vy:-.3,life:40,max:40,sway:Math.random()*6,col:'#d8c8ff',nog:true}); ctx.save(); ctx.globalAlpha=.8; drawBoss(); ctx.restore(); } else drawBoss(); }});
  if(midboss&&!bossHidden) L.push({y:midboss.y+24,f:drawMidboss});
  L.push({y:player.y+16+(jumpT>0?40:0),f:drawPlayer});
  L.sort((a,b)=>a.y-b.y); for(const o of L) o.f();
  ctx.drawImage(fgCanvas[bgFrame()],0,0); // copas que tapan a quien pasa por detrás
  drawClouds();
  if(giveFx&&giveFx.t>0){ for(let i=0;i<Math.min(giveFx.n,8);i++){ const dx=Math.sin(i*2.4+tick*.18)*3, dy=-i*3; ctx.drawImage(giveFx.spr,(giveFx.x+dx)|0,(giveFx.y+dy)|0); } }
  if(state==='hook'&&hook){ const x0=player.x+8, y0=player.y+12;
    let x1,y1; if(hook.fail){ const k=hook.t<7?hook.t/7:(14-hook.t)/7; x1=x0+(hook.tx-hook.fx)*k; y1=y0+(hook.ty-hook.fy)*k; }
    else if(hook.t<6){ const k=hook.t/6; x1=x0+(hook.tx-hook.fx)*k; y1=y0+(hook.ty-hook.fy)*k; } else { x1=hook.tx+8; y1=hook.ty+12; }
    const segs=Math.max(2,(Math.hypot(x1-x0,y1-y0)/4)|0);
    for(let i=0;i<=segs;i++){ ctx.fillStyle=i%2?PAL.l:PAL.d; ctx.fillRect((x0+(x1-x0)*i/segs-1)|0,(y0+(y1-y0)*i/segs-1)|0,2,2); }
    ctx.drawImage(HOOK_SPR,0,2,8,6,(x1-4)|0,(y1-3)|0,8,6); }
  for(const p of projs){ if(p.kind==='fall'){ const k=1-p.delay/p.max, r=Math.round(3+k*6); ctx.fillStyle='rgba(10,10,20,'+(0.15+k*.3).toFixed(2)+')'; ctx.fillRect((p.x-r)|0,(p.y-1)|0,r*2,3); ctx.fillRect((p.x-r+1)|0,(p.y-2)|0,r*2-2,5);
      if(p.delay<14){ const fy=p.y-p.delay*7; if(p.ice){ ctx.fillStyle=PAL.k; ctx.fillRect((p.x-3)|0,(fy-12)|0,6,13); ctx.fillStyle='#dff0ff'; ctx.fillRect((p.x-2)|0,(fy-11)|0,4,9); ctx.fillStyle='#8ab8e0'; ctx.fillRect((p.x-1)|0,(fy-2)|0,2,2); ctx.fillStyle='#ffffff'; ctx.fillRect((p.x-2)|0,(fy-11)|0,1,5); }
        else ctx.drawImage(ROCK_PROJ,0,0,ROCK_PROJ.width,ROCK_PROJ.height,(p.x-5)|0,(fy-9)|0,ROCK_PROJ.width*1.5|0,ROCK_PROJ.height*1.5|0); }
      continue; }
    if(p.kind==='sting'){ const a=Math.atan2(p.vy,p.vx), ex=Math.cos(a)*3, ey=Math.sin(a)*3; ctx.fillStyle=PAL.k; ctx.fillRect((p.x-2)|0,(p.y-2)|0,4,4); ctx.fillStyle='#f8d030'; ctx.fillRect((p.x-ex*.5)|0,(p.y-ey*.5)|0,2,2); ctx.fillStyle='#ffffff'; ctx.fillRect((p.x+ex*.5)|0,(p.y+ey*.5)|0,1,1); continue; }
    if(p.kind==='spore') ctx.drawImage(SPORE_SPR,(p.x-3)|0,(p.y-3)|0); else if(p.kind==='ice'){ ctx.fillStyle=PAL.k; ctx.fillRect((p.x-3)|0,(p.y-3)|0,6,6); ctx.fillStyle='#a8d8f0'; ctx.fillRect((p.x-2)|0,(p.y-2)|0,4,4); ctx.fillStyle='#fff'; ctx.fillRect((p.x-2)|0,(p.y-2)|0,2,1); } else ctx.drawImage(ROCK_PROJ,(p.x-3)|0,(p.y-3)|0); }
  for(const w of windProjs) drawTornado(w); // el tornadito del Remolino (12b)
  drawGearFx(); drawBoomer(); drawMillFront();
  drawParts();
  for(const f of flyText){ const age=(f.max||(f.max=f.t))-f.t, hop=age<8?Math.round(Math.sin(age/8*Math.PI)*3):0; if(f.t<8&&(f.t&1)) continue; txtOL(f.txt,(f.x+6)|0,(f.y-10-hop)|0,f.col,'center',PAL.k,FONT_S); }
  drawDark(); drawScreenFx();
  if(boss||midboss) drawBossBar(boss||midboss);
}
/* barra de vida del guardián: marco, corona, y el daño se queda un instante en blanco */
let bossBarLag=null;
function drawBossBar(b){
  if(presentAwaiting()||(pres&&pres.Q.kind==='boss')) return; // la sala aún está vacía / el jefe se está presentando: la barra llega con la pelea
  const max=b.maxHp||8, k=Math.max(0,b.hp)/max; if(bossBarLag===null||bossBarLag<k) bossBarLag=k; bossBarLag+=(k-bossBarLag)*.06;
  const x=36, y=3, w=88;
  ctx.fillStyle=PAL.k; ctx.fillRect(x-1,y,w+2,9); ctx.fillRect(x,y-1,w,11);
  ctx.fillStyle='#3a0c10'; ctx.fillRect(x,y+1,w,7);
  ctx.fillStyle='#fff0d8'; ctx.fillRect(x+1,y+2,Math.round((w-2)*bossBarLag),5);
  const hw=Math.round((w-2)*k); ctx.fillStyle='#d83040'; ctx.fillRect(x+1,y+2,hw,5); ctx.fillStyle='#ff7080'; ctx.fillRect(x+1,y+2,hw,1); ctx.fillStyle='#901828'; ctx.fillRect(x+1,y+6,hw,1);
  for(let i=1;i<max;i++){ ctx.fillStyle='rgba(20,0,0,.35)'; ctx.fillRect(x+1+Math.round((w-2)*i/max),y+2,1,5); }
  // corona
  ctx.fillStyle=PAL.k; ctx.fillRect(x-9,y-1,10,11); ctx.fillStyle='#f0b848'; ctx.fillRect(x-8,y+3,8,5); ctx.fillRect(x-8,y+1,2,2); ctx.fillRect(x-5,y,2,3); ctx.fillRect(x-2,y+1,2,2);
  ctx.fillStyle='#fff0a0'; ctx.fillRect(x-8,y+3,8,1); ctx.fillStyle='#e84848'; ctx.fillRect(x-5,y+5,2,2);
  if(k<.34&&(tick&15)<8){ ctx.fillStyle='rgba(255,255,255,.25)'; ctx.fillRect(x+1,y+2,hw,5); }
}
/* sombras de nubes que cruzan el valle (sólo al aire libre) */
const CLOUD_SH=(()=>{ const out=[]; for(let v=0;v<2;v++){ const c=mkCanvas(72,34), g=c.getContext('2d'); g.fillStyle='rgba(18,34,52,.13)';
  const L=v?[[18,18,13],[34,13,15],[52,17,13],[40,22,12]]:[[14,20,11],[30,14,14],[46,16,12],[58,21,9],[28,23,11]];
  for(let y=0;y<34;y++) for(let x=0;x<72;x++) if(L.some(([cx,cy,r])=>(x-cx)*(x-cx)+(y-cy)*(y-cy)*1.6<r*r)) g.fillRect(x,y,1,1);
  out.push(c); } return out; })();
function drawClouds(){
  const r=regionOf(sx,sy); if(!(r==='valle'||r==='norte'||r==='marisma')) return;
  for(let i=0;i<2;i++){ const sp=.12+i*.05, span=160+72+40; const x=((tick*sp+i*137+sx*61)%span)-72, y=((i*57+sy*31)%90)-8+Math.round(Math.sin((tick+i*400)*.002)*6);
    ctx.drawImage(CLOUD_SH[i],Math.round(x),Math.round(y)); }
}
let darkCv=null;
function drawDark(){
  const r=regionOf(sx,sy);
  if(!(r==='cueva'||r==='tronco'||r==='templo'||r==='gruta'||r==='secreto')||LIT_SCREENS.has(sx+','+sy)) return;
  if(!darkCv){ darkCv=mkCanvas(160,128); }
  const g=darkCv.getContext('2d'); g.globalCompositeOperation='source-over'; g.clearRect(0,0,160,128);
  const deep=(r==='gruta'||DEEP_SCREENS.has(sx+','+sy))&&!hasLantern;
  g.fillStyle=deep?'rgba(4,4,12,0.96)':'rgba(4,4,12,0.86)'; g.fillRect(0,0,160,128);
  g.globalCompositeOperation='destination-out';
  const hole=(cx,cy,rad)=>{ const gr=g.createRadialGradient(cx,cy,rad*.3,cx,cy,rad); gr.addColorStop(0,'rgba(0,0,0,1)'); gr.addColorStop(1,'rgba(0,0,0,0)'); g.fillStyle=gr; g.fillRect(cx-rad,cy-rad,rad*2,rad*2); };
  hole(player.x+8,player.y+8,lightRadius(deep));
  if(boss) hole(boss.x+16,boss.y+16,40); if(midboss) hole(midboss.x+12,midboss.y+12,34);
  for(let y=0;y<SH;y++) for(let x=0;x<SW;x++){ if(grid[y][x]===';') hole(x*16+8,y*16+6,30); }
  for(const b of bombs) hole(b.x+8,b.y+8,18+(tick&3));
  for(const p of pickups) if(ITEM_SPRS[p.kind]||p.kind==='bigkey') hole(p.x+8,p.y+8,26);
  for(const e of enemies) if(e.type==='wisp') hole(e.x+8,e.y+8,22);
  for(const p of parts) if(p.ring) hole(p.x,p.y,40);
  ctx.drawImage(darkCv,0,0);
  // luz cálida: las fuentes tiñen un poco lo que alumbran
  ctx.save(); ctx.globalCompositeOperation='lighter';
  glowAt(player.x+8,player.y+8,hasLantern?60:40,r==='templo'?'rgba(80,120,160,.10)':'rgba(120,80,30,.12)');
  for(let y=0;y<SH;y++) for(let x=0;x<SW;x++){ if(grid[y][x]===';') glowAt(x*16+8,y*16+6,26+((tick>>2)&1)*2,'rgba(160,90,20,.16)'); }
  ctx.restore();
}
