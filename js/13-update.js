'use strict';
/* ---------- LÓGICA PRINCIPAL ---------- */
function startTransition(dx,dy){
  const nx=sx+dx, ny=sy+dy;
  if(!MAPS[nx+','+ny]){ return; }
  if(!elderMet&&introDone&&inTown(sx,sy)&&!inTown(nx,ny)){
    pendingSay=["(Tus raíces se\nclavan en el\nsuelo...","La voz del GRAN\nROBLE aún te\nreclama. Ve a la\nplaza.)"]; return; }
  if(bgDirty) rebuildBg();
  const a=mkCanvas(160,128); a.getContext('2d').drawImage(bgCanvas[(tick>>4)&1],0,0);
  const oldEnemies=enemies.map(e=>({...e})), oldNpcs=npcs.slice(), oldElder=elderPos;
  loadScreen(nx,ny); rebuildBg();
  const b=mkCanvas(160,128); b.getContext('2d').drawImage(bgCanvas[(tick>>4)&1],0,0);
  trans={dx,dy,t:0,dur:dx?28:24,a,b};
  state='trans';
  if(dx===1) player.x=1; if(dx===-1) player.x=160-17;
  if(dy===1) player.y=-4; if(dy===-1) player.y=128-22;
  if(!boxFree(player.x+4,player.y+8,8,8)){ [player.x,player.y]=findFree(player.x,player.y,dx?'y':'x'); }
  lastEntry={sx,sy,x:player.x,y:player.y};
}
function playerOnTile(){ const [tx,ty]=playerTile(); return grid[ty]&&grid[ty][tx]; }
function update(){
  tick++;
  if(shake>0)shake--;
  if(hitStop>0){ hitStop--; return; }
  if(!toast&&toastQ.length&&(state==='play'||state==='trans')){ toast=toastQ.shift(); SFX.blip(); }
  if(toast&&--toast.t<=0) toast=null;
  if(state!=='play'&&state!=='pause'&&state!=='shop'&&state!=='file') keys.menu=false;
  if(state==='pause'){ updPause(); return; }
  if(state==='shop'){
    const ud=(keys.up?1:0)-(keys.down?1:0);
    if(ud!==shopUD){ shopUD=ud; if(ud!==0){ const n=shopList().length; shopSel=(shopSel+(ud>0?n-1:1))%n; SFX.blip(); } }
    if(keys.fire){ keys.fire=false; buyShop(); }
    if(keys.alt||keys.menu){ keys.alt=false; keys.menu=false; state='play'; SFX.blip(); }
    updParts(); return;
  }
  if(state==='give'){
    giveFx.t++; const k=giveFx.t/giveFx.dur, e=smooth(k);
    giveFx.x=giveFx.fx+(giveFx.tx-giveFx.fx)*e; giveFx.y=giveFx.fy+(giveFx.ty-giveFx.fy)*e-Math.sin(k*Math.PI)*22;
    if((tick&1)===0) parts.push({x:giveFx.x+4,y:giveFx.y+6,vx:(Math.random()-.5)*.4,vy:.25,life:16,col:C.flowerC});
    if(giveFx.t>=giveFx.dur){ puff(giveFx.tx+4,giveFx.ty+6,C.flowerC,12,1.4); SFX.seed(); const cb=giveFx.cb; giveFx=null; state='play'; if(cb)cb(); }
    updParts(); return;
  }
  if(state==='boot'){
    bootT++;
    if(bootGo>0){ bootGo--; if(bootGo===0){ state='title'; titleT=0; parts=[]; } return; }
    if((keys.fire||keys.alt)&&fontsReady){ keys.fire=false; keys.alt=false; audio(); musicStep=0; nextNoteT=AC.currentTime+1.3; SFX.gbDing(); bootGo=66; if(bootT<46) bootT=46; }
    return;
  }
  if(state==='title'){ updTitle(); return; }
  if(state==='file'){ updFile(); return; }
  if(state==='cine'){
    if((tick%5)===0) parts.push({x:164,y:Math.random()*140,vx:-(0.6+Math.random()*1.2),vy:(Math.random()-.5)*.3,life:160,col:[PAL.l,C.canopyL,C.flowerC][(tick/5|0)%3]});
    if(cineFold>0){ cineFold--;
      if(cineFold===12){ cinePage++; cineChars=0; noise(.4,.025,false);
        for(let i=0;i<5;i++) parts.push({x:60+Math.random()*40,y:66+Math.random()*12,vx:(Math.random()-.5)*1.2,vy:-.4-Math.random()*.5,life:26,col:'#dce8a4'}); }
      keys.fire=false; updParts(); return; }
    const pg=CINE[cinePage];
    if(cineChars<pg.length){ cineChars+=0.4; if((tick&7)===0)SFX.blip(); if(cineChars>=pg.length) SFX.ping(); }
    if(keys.fire){ keys.fire=false;
      if(cineChars<pg.length) cineChars=pg.length;
      else if(cinePage<CINE.length-1){ cineFold=24; SFX.cut(); }
      else { state='play'; fadeIn=70; wakeT=90; parts=[]; setTrack('casa'); } }
    updParts(); return;
  }
  if(state==='itemget'){ itemT--; if((tick&3)===0) puff(player.x+8,player.y-10,C.flowerC,2,1.2); updParts(); if(itemT<=0) say(itemPages||TXT.bladeGet); return; }
  if(state==='hook'){
    hook.t++;
    if(hook.fail){ if(hook.t>14){ hook=null; state='play'; } updParts(); return; }
    const dx=hook.tx-player.x, dy=hook.ty-player.y, d=Math.hypot(dx,dy);
    if(hook.t<6){ updParts(); return; } // la raíz sale disparada un instante
    if(d<3.5){ player.x=hook.tx; player.y=hook.ty; hook=null; state='play'; puff(player.x+8,player.y+12,PAL.l,5,1); SFX.land(); }
    else { player.x+=dx/d*3.4; player.y+=dy/d*3.4; if((tick&3)===0) parts.push({x:player.x+8,y:player.y+12,vx:0,vy:.2,life:8,col:'#78c8f8'}); }
    updParts(); return;
  }
  if(state==='fall'){ deathT--; if(deathT<=0){ state='play'; player.x=lastEntry.x; player.y=lastEntry.y; if(lastEntry.sx!==sx||lastEntry.sy!==sy){ loadScreen(lastEntry.sx,lastEntry.sy); } hurt(1,undefined,undefined,true); player.inv=40; fadeIn=20; } updParts(); return; }
  if(state==='dying'){ deathT--; if(deathT===54){ SFX.wilt(); }
    if((tick&3)===0) parts.push({x:player.x+4+Math.random()*8,y:player.y+4,vx:(Math.random()-.5)*.5,vy:.3+Math.random()*.4,life:30,col:['#c8b070','#a87838','#6a8a3a'][(tick/3|0)%3]});
    updParts(); if(deathT<=0){ state='over'; } return; }
  if(state==='credits'){ creditsT++; if((tick&7)===0) parts.push({x:Math.random()*160,y:-4,vx:(Math.random()-.5)*.3,vy:.3+Math.random()*.3,life:140,col:[PAL.l,C.flower3,C.flowerC,'#ffffff'][(tick>>3)&3],nog:true});
    updParts(); if(keys.fire&&creditsT>CREDITS.length*22+80){ keys.fire=false; state='play'; fadeIn=40; parts=[]; setTrack('valle'); } if(keys.fire&&creditsT<=CREDITS.length*22+80) keys.fire=false; return; }
  if(state==='over'){ if(keys.fire){ keys.fire=false; player.hp=player.maxHp; player.inv=90; inBed=false;
      loadScreen(respawnPoint.sx,respawnPoint.sy); player.x=respawnPoint.x; player.y=respawnPoint.y; player.dir=0; bombs=[]; projs=[]; state='play'; fadeIn=30; sproutT=24; } return; }
  if(state==='dialog'){
    const pg=dlg.pages[dlg.page];
    if(dlg.chars<pg.length){ dlg.chars+=(keys.fire?3:0.55); if((tick&3)===0&&dlg.chars<pg.length)SFX.blip(); }
    const lastDone=dlg.page===dlg.pages.length-1&&dlg.chars>=pg.length;
    if(dlg.ask&&lastDone&&keys.alt){ keys.alt=false; const cb=dlg.ask; dlg=null; state='play'; SFX.bump(); cb(false); updParts(); return; }
    if(keys.fire){ keys.fire=false;
      if(dlg.chars<pg.length) dlg.chars=pg.length;
      else if(dlg.page<dlg.pages.length-1){ dlg.page++; dlg.chars=0; }
      else if(dlg.ask){ const cb=dlg.ask; dlg=null; state='play'; SFX.blip(); cb(true); }
      else { const cb=dlg.cb; dlg=null; state='play'; if(cb)cb(); } }
    keys.alt=false; updParts(); return;
  }
  if(state==='trans'){ trans.t++; if(trans.t>=trans.dur){ state='play'; trans=null; } return; }

  /* === PLAY === */
  if(sproutT>0){ if(sproutT===24) SFX.regrow(); sproutT--; if(fadeIn>0)fadeIn--; updParts(); return; }
  if(keys.menu){ keys.menu=false; state='pause'; pausePage=0; pauseSel=0; SFX.menu(); return; }
  if(pendingSay){ const ps=pendingSay; pendingSay=null; say(ps); return; }
  if(fadeIn>0) fadeIn--;
  if(bossCard&&--bossCard.t<=0) bossCard=null;
  if((tick&15)===0) checkQuests();
  weather();
  if(wakeT>0){ wakeT--; if(wakeT===25) SFX.blip(); if(wakeT===0) say(["(¡Brote! ¡Brote!\nUna voz te llama\ndesde fuera.)"]); updParts(); return; }
  if(player.inv>0)player.inv--;
  if(hasAmulet('musgo')&&player.hp<player.maxHp&&++regen>=900){ regen=0; player.hp++; SFX.heart(); sparkle(player.x+8,player.y-2,'#a8e878'); }
  player.kx*=.75; player.ky*=.75;
  if(Math.abs(player.kx)>.1||Math.abs(player.ky)>.1) tryMove(player.kx,player.ky);
  const onTile=playerOnTile();
  // salto con el Vilano
  if(jumpT>0){ jumpT--; jumpZ=Math.sin((26-jumpT)/26*Math.PI)*14; tryMove(jumpDir[0]*2.1,jumpDir[1]*2.1); player.anim=0;
    if(jumpT===0){ SFX.land(); puff(player.x+8,player.y+14,'#e8e8d8',4,.7); } }
  else if(player.atk>0){ player.atk--; if(player.atk===10) cutAt(swordBox()); }
  else {
    let dx=0,dy=0;
    if(keys.left)dx=-1; else if(keys.right)dx=1;
    if(keys.up)dy=-1; else if(keys.down)dy=1;
    if(inBed&&(dx||dy)){ inBed=false; puff(player.x+8,player.y+12,'#3a2410',8,1.1); puff(player.x+8,player.y+10,'#c06030',4,.8); noise(.1,.04,false); }
    if(dx||dy){ player.dir=dy<0?1:dy>0?0:(dx<0?2:3); tryPushBlock(); if(dx&&dy){dx*=.72;dy*=.72;} }
    let sp=playerSpeed();
    const slow=(onTile==='m'||onTile==='w')&&!hasAmulet('rana'); if(slow) sp*=.55;
    const onIce=onTile==='i'&&!(thawed&&sy===-1);
    if(onIce){ player.ivx+=(dx*sp-player.ivx)*.07; player.ivy+=(dy*sp-player.ivy)*.07; } else { player.ivx=dx*sp; player.ivy=dy*sp; }
    if(Math.abs(player.ivx)>.05||Math.abs(player.ivy)>.05){
      tryMove(player.ivx,player.ivy);
      if(dx||dy){ player.anim+=.13; player.frame=(player.anim|0)%2; }
      if(onIce&&(tick&7)===0) parts.push({x:player.x+4+Math.random()*8,y:player.y+14,vx:0,vy:.1,life:8,col:'#cfe6f4'});
      if(onTile==='t'&&(dx||dy)&&(tick&7)===0) parts.push({x:player.x+4+Math.random()*8,y:player.y+14,vx:(Math.random()-.5)*.6,vy:-.6,life:12,col:BIOMES[screenBiome(sx,sy)].grass[2]});
      if(onTile==='w'&&(dx||dy)&&(tick&5)===0) parts.push({x:player.x+4+Math.random()*8,y:player.y+14,vx:(Math.random()-.5)*.8,vy:-.7,life:12,col:'#c8e8ff'});
      if(onTile==='m'&&(dx||dy)&&(tick&9)===0) parts.push({x:player.x+4+Math.random()*8,y:player.y+14,vx:0,vy:-.2,life:10,col:C.mudD});
    } else { player.anim=0; player.frame=0; }
    if(keys.fire){ keys.fire=false; attack(); if(state!=='play')return; }
    if(keys.alt){ keys.alt=false; useItem(); if(state!=='play')return; }
  }
  // pulsador de suelo: abre las verjas de la sala
  if(onTile==='%'&&state==='play'){ opened.add('G'+sx+','+sy); SFX.secret(); shake=4;
    for(let y=0;y<SH;y++) for(let x=0;x<SW;x++) if(grid[y][x]==='%') grid[y][x]='&';
    openGates(); save(); }
  // caer en un agujero
  if(jumpT===0&&onTile==='°'&&state==='play'){ state='fall'; deathT=40; SFX.fall(); player.atk=0; }
  // REMOLINO
  if(hasSpin&&hasBlade&&player.spin===0&&jumpT===0){
    if(keys.fireHeld&&player.atk===0){ player.charge++;
      if(player.charge===36){ SFX.charge(); puff(player.x+8,player.y+8,'#a8ec78',8,1.2); }
      if(player.charge>=36&&(tick&3)===0){ const a=tick*.5; parts.push({x:player.x+8+Math.cos(a)*11,y:player.y+9+Math.sin(a)*11,vx:0,vy:0,life:8,col:PAL.l,nog:true}); }
    } else if(player.charge>0){ if(player.charge>=36) doSpin(); player.charge=0; }
  } else if(!keys.fireHeld) player.charge=0;
  if(player.spin>0){ player.spin--; if((tick&1)===0){ const a=(18-player.spin)*.7; parts.push({x:player.x+8+Math.cos(a)*14,y:player.y+9+Math.sin(a)*14,vx:Math.cos(a)*.8,vy:Math.sin(a)*.8,life:10,col:'#a8ec78',nog:true}); }
    if(player.spin===9) cutAt(meleeBox()); }
  updBombs(); updProjs(); updWind(); updBoomer();
  updBoss(); updMidboss();
  updPickups();
  updEnemies(); updParts();
  updExits();
}
function weather(){
  const ph=inValleyScr(sx,sy)?seasonPhase():-1, r=regionOf(sx,sy);
  if(r==='norte'&&!(thawed&&sy===-1)&&!(boss&&boss.type==='viento')){ const mask=(sy===-3&&boss3Done)?15:3;
    if((tick&mask)===0) parts.push({x:Math.random()*160,y:-4,vx:(Math.random()-.5)*.3,vy:.5+Math.random()*.4,life:90,col:(tick&4)?'#dff0ff':'#ffffff',nog:true}); }
  if(r==='marisma'&&!summered&&(tick&7)===0) parts.push({x:Math.random()*160,y:-4,vx:(Math.random()-.5)*.6,vy:.4+Math.random()*.3,life:110,col:(tick&8)?'#c87830':'#e8a040',nog:true});
  if(sx===1&&sy===1&&summered&&ph<0&&(tick&31)===0) parts.push({x:20+Math.random()*120,y:20+Math.random()*70,vx:(Math.random()-.5)*.2,vy:-Math.random()*.15,life:50,col:'#fff7c0',nog:true});
  if(ph===0&&(tick&15)===0) parts.push({x:Math.random()*160,y:-4,vx:(Math.random()-.5)*.4,vy:.35,life:100,col:(tick&16)?'#f8c8e0':C.flower2,nog:true});
  if(ph===2&&(tick&7)===0) parts.push({x:Math.random()*160,y:-4,vx:(Math.random()-.5)*.6,vy:.4,life:110,col:(tick&8)?'#c87830':'#e8a040',nog:true});
  if(ph===3&&(tick&5)===0) parts.push({x:Math.random()*160,y:-4,vx:(Math.random()-.5)*.3,vy:.4,life:110,col:'#ffffff',nog:true});
  if(r==='valle'&&won&&ph<0&&(tick&63)===0) parts.push({x:Math.random()*160,y:30+Math.random()*80,vx:.3+Math.random()*.3,vy:-.1,life:120,col:(tick&64)?'#fffbe8':'#f0a0d0',nog:true,fly:true});
  if((tick%45)===0) for(let y=0;y<SH;y++) for(let x=0;x<SW;x++){ const ch=grid[y][x];
    if(ch==='Q'||(hasAmulet('buho')&&(ch==='C'||(ch==='¤'&&!opened.has('CH'+sx+','+sy+':'+x+','+y))))) sparkle(x*16+5+Math.random()*6,y*16+3,C.flowerC); }
}
function updBombs(){
  for(const b of bombs){ b.t--;
    if((b.t&7)===0) parts.push({x:b.x+9,y:b.y+2,vx:(Math.random()-.5)*.4,vy:-.5,life:8,col:'#f8e060',nog:true});
    if(b.t<=0){ SFX.edie(); noise(.35,.12,false); beep('square',90,30,.3,.1); shake=10;
      const big=hasAmulet('topo'), R0=big?46:38;
      puff(b.x+8,b.y+8,'#f8e060',12,2); puff(b.x+8,b.y+8,'#f8a030',10,1.6); puff(b.x+8,b.y+8,'#9088a0',8,1.2);
      parts.push({x:b.x+8,y:b.y+8,vx:0,vy:0,life:12,col:'#fff',ring:true,r:big?22:16,nog:true});
      let brokeC=false;
      for(let y=0;y<SH;y++) for(let x=0;x<SW;x++){ const ch=grid[y][x];
        if(Math.hypot(x*16+8-(b.x+8),y*16+8-(b.y+8))<R0){
          if(ch==='C'){ grid[y][x]=regionFloor(); opened.add('C:'+sx+','+sy+':'+x+','+y); puff(x*16+8,y*16+8,'#a89078',8,1.4); brokeC=true; }
          else if(ch==='b'||ch==='t'){ cutAt([x*16,y*16,16,16]); }
          else if(ch==='¢'){ toggleCrystal(); }
        } }
      if(brokeC){ SFX.secret(); markDirty(); save(); }
      for(const e of enemies){ if(Math.hypot(e.x+8-(b.x+8),e.y+8-(b.y+8))<(big?36:28)){ damageEnemy(e,3,b.x,b.y); } }
      if(boss&&boss.st!=='burrow'&&boss.st!=='yield'&&Math.hypot(boss.x+16-(b.x+8),boss.y+16-(b.y+8))<38){ if(boss.hp>2){ boss.hp=Math.max(2,boss.hp-3); boss.flash=10; } }
      blastMidboss(b.x+8,b.y+8);
      if(!big&&player.inv===0&&Math.hypot(player.x+8-(b.x+8),player.y+12-(b.y+8))<24) hurt(1,b.x,b.y);
    } }
  bombs=bombs.filter(b=>b.t>0);
}
function updProjs(){
  for(const p of projs){ p.x+=p.vx; p.y+=p.vy; p.t--;
    const ch=tileAt(p.x|0,p.y|0); if(ch!==undefined&&isSolid(ch)&&!WATER.has(ch)) p.t=0;
    if(p.t>0&&player.inv===0&&jumpT===0&&Math.hypot(p.x-(player.x+8),p.y-(player.y+12))<8){
      if(shieldBlocks(p.x,p.y)){ SFX.block(); sparkle(p.x,p.y,'#c8d8ff'); p.t=0; }
      else { hurt(1,p.x,p.y); p.t=0; } }
    if(p.t>0&&meleeActive()&&rectsHit(meleeBox(),[p.x-3,p.y-3,6,6])){ p.t=0; SFX.block(); puff(p.x,p.y,'#e8e8d8',5,1); }
  }
  projs=projs.filter(p=>p.t>0);
}
function updWind(){
  for(const w of windProjs){ w.x+=w.vx; w.y+=w.vy; w.t--; w.ang+=.5;
    const tch=tileAt(w.x|0,w.y|0);
    if(tch!==undefined&&isSolid(tch)&&!WATER.has(tch)){ cutAt([w.x-7,w.y-7,14,14]); const t2=tileAt(w.x|0,w.y|0); if(isSolid(t2)){ w.t=0; puff(w.x,w.y,'#a8ec78',6,1.1); } }
    if((tick&1)===0) parts.push({x:w.x+(Math.random()-.5)*8,y:w.y+4,vx:-w.vx*.3,vy:-.3,life:10,col:(tick&2)?PAL.l:'#a8ec78',nog:true});
    for(const e of enemies){ if(e.flash===0&&!w.hits.has(e)&&Math.hypot(e.x+8-w.x,e.y+8-w.y)<11){ if(e.type==='ghost'&&e.phase>=110) continue;
      w.hits.add(e); damageEnemy(e,bladeLvl,w.x,w.y); if(e.type==='wisp') e.hp=0; } }
    if(boss&&boss.flash===0&&Math.hypot(boss.x+16-w.x,boss.y+16-w.y)<18){
      const vul=(boss.type==='topo'&&boss.st==='up')||(boss.type==='avispa'&&boss.st==='tired')||(boss.type==='viento'&&boss.st==='rest');
      if(vul){ bossHit(boss,bladeLvl); w.t=0; puff(w.x,w.y,'#a8ec78',8,1.3); } }
  }
  windProjs=windProjs.filter(w=>w.t>0&&w.x>-8&&w.x<168&&w.y>-8&&w.y<136);
}
function updBoomer(){
  const b=boomer; if(!b) return; b.t++; b.ang+=.6;
  if(!b.ret){ b.x+=b.vx; b.y+=b.vy;
    const ch=tileAt(b.x|0,b.y|0);
    if(ch===undefined||b.x<0||b.x>160||b.y<0||b.y>128||b.t>30||(isSolid(ch)&&!WATER.has(ch)&&ch!=='b'&&ch!=='Q'&&ch!=='¢')) b.ret=true;
    if(ch==='b'||ch==='Q'||ch==='t'||ch==='¢') cutAt([b.x-4,b.y-4,8,8]);
  } else { const dx=player.x+8-b.x, dy=player.y+10-b.y, d=Math.hypot(dx,dy);
    if(d<6){ boomer=null; if(b.carry){ for(const p of b.carry) pickups.push({...p,x:player.x+4,y:player.y+4,drop:0}); } return; }
    b.x+=dx/d*3; b.y+=dy/d*3; }
  if((tick&1)===0) parts.push({x:b.x,y:b.y,vx:0,vy:0,life:6,col:'#d09040',nog:true});
  for(const e of enemies){ if(!b.hits.has(e)&&Math.hypot(e.x+8-b.x,e.y+8-b.y)<11){ b.hits.add(e); e.stun=90; damageEnemy(e,1,b.x,b.y); SFX.stun(); if(!b.ret) b.ret=true; } }
  if(midboss&&!b.hits.has(midboss)&&Math.hypot(midboss.x+12-b.x,midboss.y+12-b.y)<14){ b.hits.add(midboss); SFX.block(); b.ret=true; }
  pickups=pickups.filter(p=>{ if(['berry','heart','seed','key','piece'].includes(p.kind)&&Math.hypot(p.x+4-b.x,p.y+4-b.y)<10){ (b.carry=b.carry||[]).push(p); b.ret=true; SFX.blip(); return false; } return true; });
}
function updPickups(){
  const magnet=hasAmulet('savia');
  for(const p of pickups){ p.t++; if(p.drop>0){ p.drop--; p.y-=Math.sin(p.drop/14*Math.PI)*.8; }
    if(magnet&&(p.kind==='berry'||p.kind==='heart')){ const dx=player.x+8-p.x-4, dy=player.y+10-p.y-4, d=Math.hypot(dx,dy); if(d<48&&d>2){ p.x+=dx/d*1.6; p.y+=dy/d*1.6; } } }
  pickups=pickups.filter(p=>{
    const big=['blade','bomb','ember','hook','tear','flake','boomer','lantern','feather'].includes(p.kind), cx=big?8:4;
    const d=Math.hypot(p.x+cx-(player.x+8),p.y+cx-(player.y+12));
    if(d<(big?12:11)&&(!p.drop||p.drop<8)){
      if(p.kind==='seed'){ seeds++; collected.add(p.id); SFX.seed(); puff(p.x+4,p.y+4,C.flowerC,8,1.2); save(); showToast('¡SEMILLA DORADA!',seeds+'/8'); if(seeds>=8&&!announced8){ announced8=true; say(TXT.allSeeds); } }
      else if(p.kind==='key'){ const dk=dungeonOf(sx,sy)||'x'; dungeonKeys[dk]=(dungeonKeys[dk]||0)+1; collected.add(p.id); SFX.key(); puff(p.x+4,p.y+4,PAL.a,8,1.2); say(TXT.keyGet); save(); }
      else if(p.kind==='bigkey'){ const dk=dungeonOf(sx,sy)||'x'; bigKeys[dk]=true; collected.add(p.id); SFX.key(); puff(p.x+4,p.y+4,PAL.y,10,1.4); say(TXT.bigkeyGet); save(); }
      else if(p.kind==='diary'){ collected.add(p.id); SFX.heart(); puff(p.x+4,p.y+4,'#e8d0a0',8,1); say(DIARY[p.id==='dplaza'?'dplaza':sx+','+sy]||["(Una hoja de\ndiario ilegible.)"]); save(); }
      else if(big){ getItem(p.kind); }
      else if(p.kind==='berry'){ berries=Math.min(999,berries+1); SFX.blip(); puff(p.x+4,p.y+4,'#d84878',5,.9); }
      else if(p.kind==='container'){ player.maxHp+=2; player.hp=player.maxHp; collected.add(p.id); SFX.fanfare(); puff(p.x+4,p.y+4,PAL.R,12,1.5); say(TXT.containerGet); save(); }
      else if(p.kind==='piece'){ collected.add(p.id); puff(p.x+4,p.y+4,PAL.R,10,1.3); addPiece(); }
      else { player.hp=Math.min(player.maxHp,player.hp+2); SFX.heart(); puff(p.x+4,p.y+4,PAL.R,6,1); }
      return false; } return true; });
}
function updExits(){
  const htx=(player.x+8)>>4, hty=(player.y+13)>>4, ch=grid[hty]&&grid[hty][htx];
  if(ch==='x'){ if(sx===9) exitHouse(); else if(sx===8) exitShop(); else if(sx===7) placeAt(2,0,68,34,0); else if(sx===10&&sy===2) placeAt(10,1,68,18,0); else exitDungeon(); return; }
  if(ch==='>'){ if(sx===10&&sy===1) placeAt(10,2,72,24,0); return; }
  if(keys.up&&player.dir===1){ const ft=facingTile();
    if(ft&&ft[2]==='D'&&sx===0&&sy===1&&ft[0]===3){ enterHouse(); return; }
    if(ft&&ft[2]==='D'&&sx===0&&sy===1&&ft[0]===7){ enterShop(); return; }
    if(ft&&ft[2]==='D'&&sx===2&&sy===0){ placeAt(7,9,76,90,1); return; }
    if(ft&&ft[2]==='G'){ enterDungeon(); return; } }
  if(boss||midboss){ player.x=Math.max(2,Math.min(160-16,player.x)); player.y=Math.max(2,Math.min(128-20,player.y)); return; }
  // la cumbre: bajar te devuelve al templo; la puerta del jefe del templo sube a la cumbre
  if(sx===15&&sy===0&&player.y<-5){ placeAt(1,-3,72,100,1); return; }
  if(sx===1&&sy===-3&&player.y>128-22){ if(keys.down){ placeAt(15,0,72,20,0); } else { player.y=128-22; player.ky=Math.min(0,player.ky); } return; }
  if(player.x<-2) startTransition(-1,0);
  else if(player.x>160-14) startTransition(1,0);
  else if(player.y<-5) startTransition(0,-1);
  else if(player.y>128-22){ if(sy<=-2&&!keys.down){ player.y=128-22; player.ky=Math.min(0,player.ky); } else startTransition(0,1); }
}
/* ---------- TÍTULO Y ARCHIVOS ---------- */
function updTitle(){
  if(fontsReady) titleT++;
  if(titleT>0&&(titleT%9)===0) parts.push({x:Math.random()*160,y:-4,vx:(Math.random()-.5)*.35,vy:.2+Math.random()*.3,life:110,col:[PAL.l,C.canopyL,C.flowerC,C.flower1][(titleT/9|0)%4]});
  updParts();
  for(let i=0;i<6;i++){ if(titleT===TITLE_T0+i*TITLE_STAG+TITLE_DUR){ shake=(i===5)?5:2; puff(LOGO_POS[i]+8,LOGO_Y+20,'#cfe8d8',6,1); if(AC){ SFX.thud(i===5?9:i); if(i===5) SFX.ping(); } } }
  if(titleT>TITLE_LEAF0&&titleT<TITLE_LEAF0+TITLE_LEAFD&&(titleT%9)===0) parts.push({x:50+Math.random()*60,y:Math.random()*24,vx:(Math.random()-.5)*.5,vy:.45,life:70,col:[PAL.l,'#a8ec78',C.canopyL][titleT%3]});
  if(AC&&[11,34,57,79].includes(titleT-TITLE_LEAF0)) SFX.swoosh();
  if(titleT===TITLE_LEAF0+TITLE_LEAFD){ shake=2; puff(56,LOGO_Y+16,'#a8ec78',5,.7); puff(106,LOGO_Y+2,'#a8ec78',5,.7); if(AC){ noise(.18,.045,false); SFX.chime(); } }
  if(AC&&titleT===TITLE_LAND+8) SFX.ping();
  if(AC&&titleT===TITLE_MENU) SFX.menuIn();
  if(AC&&titleT>TITLE_MENU){ const cyc=(titleT-TITLE_SHINE)%190; if(cyc===0) SFX.shing(); else if(cyc===36) SFX.ping(); }
  if(keys.fire||keys.alt){ keys.fire=false; keys.alt=false; audio();
    if(titleT<TITLE_MENU) titleT=TITLE_MENU;
    else { slotCache=[readSlot(0),readSlot(1),readSlot(2)]; fileSel=Math.max(0,slotCache.findIndex(d=>d)); fileConfirm=false; fileUD=0; state='file'; SFX.blip(); } }
}
function updFile(){
  updParts();
  if(keys.menu){ keys.menu=false; if(fileConfirm) fileConfirm=false; else { state='title'; titleT=TITLE_MENU; } SFX.blip(); return; }
  const ud=(keys.up?1:0)-(keys.down?1:0);
  if(ud!==fileUD){ fileUD=ud; if(ud!==0&&!fileConfirm){ fileSel=(fileSel+(ud>0?2:1))%3; SFX.blip(); } }
  if(keys.fire){ keys.fire=false;
    if(fileConfirm){ try{ localStorage.removeItem(slotKey(fileSel)); }catch(e){} slotCache[fileSel]=null; fileConfirm=false; SFX.cut(); shake=3; }
    else { curSlot=fileSel; const d=slotCache[fileSel]; if(d){ loadGame(d); state='play'; fadeIn=40; parts=[]; } else newGame(); } }
  if(keys.alt){ keys.alt=false; if(fileConfirm){ fileConfirm=false; SFX.blip(); } else if(slotCache[fileSel]){ fileConfirm=true; SFX.bump(); } }
}
/* ---------- EL ZURRÓN (pausa) ---------- */
const X_ITEMS=['bomb','hook','boomer','lantern','feather'];
function ownedX(){ return X_ITEMS.filter(k=>({bomb:hasBomb,hook:hasHook,boomer:hasBoomer,lantern:hasLantern,feather:hasFeather})[k]); }
function updPause(){
  if(keys.menu||(keys.alt&&pausePage!==0)){ keys.menu=false; keys.alt=false; state='play'; SFX.menu(); return; }
  const lr=(keys.right?1:0)-(keys.left?1:0), ud=(keys.down?1:0)-(keys.up?1:0);
  if(pausePage===0){
    const items=ownedX(), am=[...amulets]; const n=items.length+am.length; // rejilla: objetos (fila 1) y amuletos (filas 2-3)
    if(lr!==pauseLR){ pauseLR=lr; if(lr&&n){ pauseSel=(pauseSel+lr+n)%n; SFX.blip(); } }
    if(ud!==pauseUD){ pauseUD=ud;
      if(ud>0){ if(pauseSel<items.length){ if(am.length){ pauseSel=items.length; SFX.blip(); } } else if(pauseSel+4<n){ pauseSel+=4; SFX.blip(); } else { pausePage=1; pauseSel=0; SFX.menu(); } }
      else if(ud<0){ if(pauseSel>=items.length+4){ pauseSel-=4; SFX.blip(); } else if(pauseSel>=items.length){ pauseSel=items.length?0:pauseSel; SFX.blip(); } } }
    if(keys.fire){ keys.fire=false;
      if(pauseSel<items.length){ xItem=items[pauseSel]; SFX.equip(); save(); }
      else if(am.length){ const id=am[pauseSel-items.length];
        if(equipped.includes(id)){ equipped[equipped.indexOf(id)]=null; SFX.blip(); }
        else { const slot=equipped[0]===null?0:equipped[1]===null?1:0; equipped[slot]=id; SFX.equip(); }
        save(); } }
    if(keys.alt){ keys.alt=false; state='play'; SFX.menu(); }
  } else {
    if(lr!==pauseLR){ pauseLR=lr; if(lr){ pausePage=pausePage===1?2:1; SFX.blip(); } }
    if(ud!==pauseUD){ pauseUD=ud; if(ud<0){ pausePage=0; pauseSel=0; SFX.menu(); } }
    if(keys.fire){ keys.fire=false; SFX.blip(); }
  }
}
