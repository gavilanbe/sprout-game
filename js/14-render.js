'use strict';
/* ---------- RENDER DE LA ESCENA ---------- */
function drawShadow(x,y,r){ ctx.fillStyle='rgba(16,20,16,.28)'; ctx.beginPath(); ctx.ellipse(x|0,y|0,r,2.5,0,0,6.283); ctx.fill(); }
function drawSword(){
  if(player.atk<=0) return;
  const ph=14-player.atk;
  const base=[Math.PI/2,-Math.PI/2,Math.PI,0][player.dir];
  const sweep=[-1.2,-0.7,-0.2,0.15,0.3,0.25,0.1][Math.min(6,ph>>1)];
  ctx.save(); ctx.translate(player.x+8,player.y+10); ctx.rotate(base+sweep);
  ctx.drawImage(LEAF_SWING,3,-4); ctx.restore();
  if(ph>=2&&ph<=8){ // estela del tajo
    ctx.save(); ctx.translate(player.x+8,player.y+10); ctx.strokeStyle='rgba(176,240,104,'+(0.7-ph*.07)+')'; ctx.lineWidth=2;
    ctx.beginPath(); ctx.arc(0,0,15,base-1.3,base+sweep+.2); ctx.stroke(); ctx.restore(); }
}
function drawPlayer(){
  if(state==='dying'){ const k=1-deathT/70; ctx.save(); ctx.translate(player.x+8,player.y+15); ctx.rotate(k*0.6); ctx.translate(0,k*2);
    ctx.globalAlpha=Math.max(.25,1-k*.7); ctx.drawImage(deathT<35?H_WILT:P_SPRITES[player.dir][0],-8,-15); ctx.globalAlpha=1; ctx.restore(); return; }
  if(state==='fall'){ const k=1-deathT/40; ctx.save(); ctx.translate(player.x+8,player.y+10); ctx.rotate(k*6); ctx.scale(1-k,1-k); ctx.drawImage(P_SPRITES[0][0],-8,-8); ctx.restore(); return; }
  if(inBed){ ctx.drawImage(wakeT>25?H_SLEEP:H_WAKE,(player.x+4)|0,(player.y+2)|0); return; }
  if(sproutT>0){ const k=sproutT/24; ctx.drawImage(k>.5?H_SEEDLING:P_SPRITES[0][0],player.x|0,(player.y+(k*6|0))|0);
    if((tick&3)===0) parts.push({x:player.x+8,y:player.y+12,vx:(Math.random()-.5)*.5,vy:-.4,life:14,col:'#9ed86a'}); return; }
  const inv=player.inv>0&&(tick&3)<2&&state==='play';
  drawShadow(player.x+8,player.y+15,jumpT>0?4:6);
  if(inv) return;
  const py=player.y-jumpZ;
  if(player.charge>=36){ ctx.fillStyle='rgba(112,216,56,'+(0.22+0.14*Math.sin(tick*.4)).toFixed(2)+')'; ctx.beginPath(); ctx.arc(player.x+8,py+10,12,0,6.28); ctx.fill(); }
  if(player.dir===1&&player.atk>0) drawSword();
  let s=P_SPRITES[player.dir][player.frame];
  if(player.atk>0&&player.atk>4) s=P_ATK[player.dir];
  if(state==='itemget') s=H_LIFT;
  ctx.drawImage(s,player.x|0,py|0);
  if(player.dir!==1&&player.atk>0) drawSword();
  if(player.spin>0){ const a=(1-player.spin/18)*6.283+[Math.PI/2,-Math.PI/2,Math.PI,0][player.dir];
    ctx.save(); ctx.translate(player.x+8,py+10); ctx.rotate(a); ctx.drawImage(LEAF_SWING,3,-4); ctx.restore(); }
}
function drawEnemy(e){
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
const ITEM_SPRS={blade:BLADE_SPR,bomb:BOMB_SPR,ember:EMBER_SPR,hook:HOOK_SPR,tear:TEAR_SPR,flake:FLAKE_SPR,boomer:BOOMER_SPR,lantern:LANTERN_SPR,feather:FEATHER_SPR};
function drawPickup(p){
  if(ITEM_SPRS[p.kind]){ const bob=(Math.sin(tick*.08)*1.5)|0; glowAt(p.x+8,p.y+8,14,'rgba(255,240,160,.18)'); ctx.drawImage(ITEM_SPRS[p.kind],p.x|0,(p.y+bob)|0);
    if((tick&7)===0) parts.push({x:p.x+4+Math.random()*8,y:p.y+2+Math.random()*8,vx:0,vy:-.35,life:14,col:p.kind==='ember'?'#f8a030':C.flowerC,nog:true}); return; }
  const bob=Math.sin((tick+p.t)*.1)*1.5|0;
  if(p.kind==='container'){ drawShadow(p.x+4,p.y+9,4); ctx.drawImage(HEART_FULL,(p.x-4)|0,(p.y+bob-4)|0,16,16); if((tick&7)===0) sparkle(p.x+Math.random()*8,p.y+bob,PAL.r); return; }
  if(p.kind==='piece'){ drawShadow(p.x+4,p.y+9,3); ctx.drawImage(PIECE_SPR,p.x|0,(p.y+bob)|0); if((tick&15)===0) sparkle(p.x+4,p.y+bob,PAL.r); return; }
  if(p.kind==='diary'){ ctx.drawImage(DIARY_SPR,p.x|0,(p.y+bob)|0); if((tick&15)===0) sparkle(p.x+4,p.y+bob,'#e8d0a0'); return; }
  if(p.kind==='letter'){ drawShadow(p.x+6,p.y+9,4); ctx.drawImage(LETTER_SPR,p.x|0,(p.y+bob)|0); if((tick&15)===0) sparkle(p.x+2+Math.random()*8,p.y+bob,'#a8c0d8'); return; }
  if(p.kind==='key'){ ctx.drawImage(KEY_SPR,p.x|0,(p.y+bob)|0); if((tick&7)===0) sparkle(p.x+4,p.y+bob,PAL.y); return; }
  if(p.kind==='bigkey'){ ctx.drawImage(BIGKEY_SPR,(p.x-2)|0,(p.y+bob-1)|0); if((tick&5)===0) sparkle(p.x+2+Math.random()*8,p.y+bob,PAL.Y); return; }
  if(p.kind==='seed'){ drawShadow(p.x+4,p.y+9,3); ctx.drawImage(ACORN_GOLD,p.x|0,(p.y+bob)|0); if((tick&15)===0) sparkle(p.x+4,p.y+bob,C.flowerC); return; }
  ctx.drawImage(p.kind==='berry'?BERRY_SPR:HEART_FULL,p.x|0,(p.y+bob)|0);
}
function drawBoss(){
  const b=boss;
  if(b.type==='topo'){
    if(b.st==='burrow'||b.st==='warn'){ const wob=b.st==='warn'?(tick&2)-1:0;
      ctx.fillStyle='rgba(20,16,12,.3)'; ctx.beginPath(); ctx.ellipse(b.mx+16+wob,b.my+26,12,4,0,0,6.283); ctx.fill();
      ctx.fillStyle=PAL.k; ctx.fillRect(b.mx+6+wob,b.my+20,20,7); ctx.fillStyle='#6e5a4c'; ctx.fillRect(b.mx+7+wob,b.my+21,18,5); ctx.fillStyle='#8a7460'; ctx.fillRect(b.mx+10+wob,b.my+21,6,2); return; }
    if(b.st==='yield') glowAt(b.x+16,b.y+16,22,'rgba(120,232,120,'+(0.25+0.15*Math.sin(tick*.3))+')');
    drawShadow(b.x+16,b.y+30,12);
    const img=b.flash>5?BOSS_WHITE.topo:BOSS_SPR.topo, sq=Math.sin(tick*.2)*.05, tr=b.st==='yield'?((tick&2)?.5:-.5):0;
    ctx.save(); ctx.translate(b.x+16+tr,b.y+30); ctx.scale(1+sq,1-sq); ctx.drawImage(img,-16,-30); ctx.restore();
  } else if(b.type==='avispa'){
    const grounded=b.st==='tired'||b.st==='yield';
    if(b.st==='yield') glowAt(b.x+16,b.y+16,22,'rgba(120,232,120,'+(0.25+0.15*Math.sin(tick*.3))+')');
    if(!grounded){ ctx.fillStyle='rgba(10,10,20,.3)'; ctx.beginPath(); ctx.ellipse(b.x+16,100,10,3,0,0,6.283); ctx.fill(); } else drawShadow(b.x+16,b.y+30,12);
    const img=b.flash>5?BOSS_WHITE.avispa:BOSS_SPR.avispa, flap=grounded?0:Math.sin(tick*.6)*.1;
    ctx.save(); ctx.translate(b.x+16,b.y+16); if(grounded) ctx.rotate(b.st==='yield'?.15:.3); ctx.scale(1+flap,1-flap); ctx.drawImage(img,-16,-16); ctx.restore();
  } else {
    const resting=b.st==='rest';
    if(resting) glowAt(b.x+16,b.y+16,26,'rgba(120,232,120,'+(0.28+0.18*Math.sin(tick*.3))+')');
    const img=b.flash>5?BOSS_WHITE.viento:BOSS_SPR.viento;
    ctx.save(); ctx.translate(b.x+16,b.y+16);
    if(b.st==='sweep') ctx.scale(1.3,0.8); else if(resting){ const g=Math.sin(tick*.4)*.05; ctx.scale(1+g,1-g); } else { const w=Math.sin(tick*.18)*.1; ctx.scale(1+w,1-w); }
    ctx.globalAlpha=b.st==='float'?0.65:1; ctx.drawImage(img,-16,-16); ctx.globalAlpha=1; ctx.restore();
    if(b.st==='aim'){ ctx.fillStyle='rgba(232,80,80,'+(0.25+0.2*Math.sin(tick*.4))+')'; ctx.fillRect(0,(b.row+14)|0,160,4); }
    if(resting&&b.hp<=2&&(tick&31)<20){ ctx.font='8px "Press Start 2P"'; ctx.fillStyle='#fff'; ctx.fillText('Z',(b.x+14)|0,(b.y-12)|0); }
  }
  if(b.st==='yield'&&(tick&31)<20){ ctx.font='8px "Press Start 2P"'; ctx.fillStyle='#fff'; ctx.fillText('Z',(b.x+14)|0,(b.y-10)|0); }
}
function drawMidboss(){
  const m=midboss; drawShadow(m.x+12,m.y+23,10);
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
  if(bgDirty) rebuildBg();
  ctx.drawImage(bgCanvas[(tick>>4)&1],0,0);
  if(sx===1&&sy===1){
    drawGreatOak(37,-2);
    if(thawed){ ctx.drawImage(EMBER_SPR,32,38); if((tick&15)===0) parts.push({x:40,y:44,vx:0,vy:-.3,life:12,col:'#f8a030',nog:true}); }
    if(summered){ ctx.drawImage(TEAR_SPR,112,38); if((tick&15)===7) parts.push({x:120,y:44,vx:0,vy:-.3,life:12,col:'#78c8f8',nog:true}); }
    if(cycled){ ctx.drawImage(FLAKE_SPR,48,86); if((tick&15)===11) parts.push({x:56,y:92,vx:0,vy:-.3,life:12,col:'#dff0ff',nog:true});
      [[26,70],[40,78],[58,70],[74,78],[90,70],[106,78],[26,86],[106,86]].forEach(([gx,gy],i)=>{ const bob=Math.sin(tick*.05+i*1.3)>0?0:1; ctx.drawImage(H_SEEDLING,gx,gy+bob); }); }
  }
  // fuego de las antorchas encendidas (parpadeo y luz cálida)
  for(let y=0;y<SH;y++) for(let x=0;x<SW;x++){ if(grid[y][x]===';'){ glowAt(x*16+8,y*16+4,16,'rgba(248,160,48,.22)'); if((tick&7)===0) parts.push({x:x*16+7+Math.random()*3,y:y*16+2,vx:0,vy:-.4,life:10,col:(tick&8)?'#f8e060':'#f8a030',nog:true}); } }
  // capa de actores, ordenada por profundidad (pies)
  const L=[];
  for(const p of pickups) L.push({y:p.y+8,f:()=>drawPickup(p)});
  for(const b of bombs) L.push({y:b.y+12,f:()=>{ const pulse=b.t<25&&(tick&3)<2; drawShadow(b.x+8,b.y+13,4); ctx.drawImage(ACORN,b.x+4,b.y+4+(pulse?-1:0)); }});
  if(elderPos) L.push({y:elderPos[1]*16+16,f:()=>{ const sway=Math.sin(tick*.04)>0?0:1; drawShadow(elderPos[0]*16+7,elderPos[1]*16+15,6); ctx.drawImage(ELDER,elderPos[0]*16,elderPos[1]*16+sway+1);
    if((tick%85)===0) parts.push({x:elderPos[0]*16+14,y:elderPos[1]*16+4,vx:(Math.random()-.5)*.2,vy:-.25,life:22,col:PAL.l}); }});
  for(const n of npcs) L.push({y:n.y*16+16,f:()=>{ const sway=Math.sin(tick*.05+n.x)>0?0:1;
    if(n.guest){ const img=BOSS_SPR[n.guest]; drawShadow(n.x*16+8,n.y*16+16,10); ctx.drawImage(img,n.x*16-8,n.y*16-14+sway); if((tick&31)<16){ ctx.font='8px "Press Start 2P"'; ctx.fillStyle='#fff'; ctx.fillText('...',n.x*16+2,n.y*16-18); } }
    else { drawShadow(n.x*16+8,n.y*16+15,5); ctx.drawImage(NPCS[n.ch].img,n.x*16,n.y*16+sway); } }});
  for(const e of enemies) L.push({y:e.y+16,f:()=>drawEnemy(e)});
  if(boss) L.push({y:boss.y+32,f:drawBoss});
  if(midboss) L.push({y:midboss.y+24,f:drawMidboss});
  L.push({y:player.y+16+(jumpT>0?40:0),f:drawPlayer});
  L.sort((a,b)=>a.y-b.y); for(const o of L) o.f();
  if(giveFx&&giveFx.t>0){ for(let i=0;i<Math.min(giveFx.n,8);i++){ const dx=Math.sin(i*2.4+tick*.18)*3, dy=-i*3; ctx.drawImage(giveFx.spr,(giveFx.x+dx)|0,(giveFx.y+dy)|0); } }
  if(state==='hook'&&hook){ const x0=player.x+8, y0=player.y+12;
    let x1,y1; if(hook.fail){ const k=hook.t<7?hook.t/7:(14-hook.t)/7; x1=x0+(hook.tx-hook.fx)*k; y1=y0+(hook.ty-hook.fy)*k; }
    else if(hook.t<6){ const k=hook.t/6; x1=x0+(hook.tx-hook.fx)*k; y1=y0+(hook.ty-hook.fy)*k; } else { x1=hook.tx+8; y1=hook.ty+12; }
    const segs=Math.max(2,(Math.hypot(x1-x0,y1-y0)/4)|0);
    for(let i=0;i<=segs;i++){ ctx.fillStyle=i%2?PAL.l:PAL.d; ctx.fillRect((x0+(x1-x0)*i/segs-1)|0,(y0+(y1-y0)*i/segs-1)|0,2,2); }
    ctx.drawImage(HOOK_SPR,0,2,8,6,(x1-4)|0,(y1-3)|0,8,6); }
  for(const p of projs){ if(p.kind==='spore') ctx.drawImage(SPORE_SPR,(p.x-3)|0,(p.y-3)|0); else if(p.kind==='ice'){ ctx.fillStyle=PAL.k; ctx.fillRect((p.x-3)|0,(p.y-3)|0,6,6); ctx.fillStyle='#a8d8f0'; ctx.fillRect((p.x-2)|0,(p.y-2)|0,4,4); ctx.fillStyle='#fff'; ctx.fillRect((p.x-2)|0,(p.y-2)|0,2,1); } else ctx.drawImage(ROCK_PROJ,(p.x-3)|0,(p.y-3)|0); }
  for(const w of windProjs){ const px=w.x|0, py=w.y|0; const rows=[[5,'#70d838'],[8,'#dff0ff'],[11,'#a8ec78']];
    rows.forEach(([wd,col],i)=>{ const off=(Math.sin(w.ang*2+i*1.7)*2)|0, y=py+4-i*4; ctx.fillStyle=PAL.k; ctx.fillRect(px-(wd>>1)+off-1,y-1,wd+2,5); });
    rows.forEach(([wd,col],i)=>{ const off=(Math.sin(w.ang*2+i*1.7)*2)|0, y=py+4-i*4; ctx.fillStyle=col; ctx.fillRect(px-(wd>>1)+off,y,wd,3); ctx.fillStyle='#ffffff'; ctx.fillRect(px-(wd>>1)+off+1+((w.ang*4|0)%Math.max(1,wd-3)),y+1,2,1); }); }
  if(boomer){ ctx.save(); ctx.translate(boomer.x|0,boomer.y|0); ctx.rotate(boomer.ang); ctx.drawImage(BOOMER_SPR,-8,-8); ctx.restore(); }
  for(const p of parts){ ctx.fillStyle=p.col;
    if(p.ring){ ctx.strokeStyle=p.col; ctx.lineWidth=2; ctx.globalAlpha=p.life/12; ctx.beginPath(); ctx.arc(p.x,p.y,p.r*(1-p.life/12)+2,0,6.283); ctx.stroke(); ctx.globalAlpha=1; }
    else if(p.star){ ctx.fillRect(p.x|0,(p.y-1)|0,1,3); ctx.fillRect((p.x-1)|0,p.y|0,3,1); }
    else if(p.fly){ ctx.fillRect(p.x|0,(p.y+((tick>>2)&1))|0,1,1); ctx.fillRect((p.x+2)|0,(p.y+((tick>>2)&1))|0,1,1); }
    else ctx.fillRect(p.x|0,p.y|0,p.life>8?2:1,p.life>8?2:1); }
  for(const f of flyText){ ctx.font='8px "Press Start 2P"'; ctx.globalAlpha=Math.min(1,f.t/10); ctx.fillStyle=PAL.k; ctx.fillText(f.txt,(f.x-3)|0,(f.y+1)|0); ctx.fillStyle=f.col; ctx.fillText(f.txt,(f.x-4)|0,f.y|0); ctx.globalAlpha=1; }
  drawDark();
  if(boss||midboss){ const b=boss||midboss; ctx.fillStyle=PAL.k; ctx.fillRect(39,3,82,8); ctx.fillStyle='#5a1818'; ctx.fillRect(40,4,80,6);
    ctx.fillStyle='#e84848'; ctx.fillRect(41,5,Math.max(0,b.hp*78/(b.maxHp||8)),4); ctx.fillStyle='#f89090'; ctx.fillRect(41,5,Math.max(0,b.hp*78/(b.maxHp||8)),1); }
}
let darkCv=null;
function drawDark(){
  const r=regionOf(sx,sy);
  if(!(r==='cueva'||r==='tronco'||r==='templo'||r==='gruta'||r==='secreto')) return;
  if(!darkCv){ darkCv=mkCanvas(160,128); }
  const g=darkCv.getContext('2d'); g.globalCompositeOperation='source-over'; g.clearRect(0,0,160,128);
  const deep=r==='gruta'&&!hasLantern;
  g.fillStyle=deep?'rgba(4,4,12,0.96)':'rgba(4,4,12,0.86)'; g.fillRect(0,0,160,128);
  g.globalCompositeOperation='destination-out';
  const hole=(cx,cy,rad)=>{ const gr=g.createRadialGradient(cx,cy,rad*.3,cx,cy,rad); gr.addColorStop(0,'rgba(0,0,0,1)'); gr.addColorStop(1,'rgba(0,0,0,0)'); g.fillStyle=gr; g.fillRect(cx-rad,cy-rad,rad*2,rad*2); };
  hole(player.x+8,player.y+8,(hasLantern?92:(deep?30:58))+Math.sin(tick*.2)*2);
  if(boss) hole(boss.x+16,boss.y+16,40); if(midboss) hole(midboss.x+12,midboss.y+12,34);
  for(let y=0;y<SH;y++) for(let x=0;x<SW;x++){ if(grid[y][x]===';') hole(x*16+8,y*16+6,30); }
  for(const b of bombs) hole(b.x+8,b.y+8,18+(tick&3));
  for(const p of pickups) if(ITEM_SPRS[p.kind]||p.kind==='bigkey') hole(p.x+8,p.y+8,26);
  for(const e of enemies) if(e.type==='wisp') hole(e.x+8,e.y+8,22);
  for(const p of parts) if(p.ring) hole(p.x,p.y,40);
  ctx.drawImage(darkCv,0,0);
}
