'use strict';
/* ---------- LÓGICA PRINCIPAL ---------- */
function startTransition(dx,dy){
  const nx=sx+dx, ny=sy+dy;
  if(!MAPS[nx+','+ny]){ return; }
  if(!elderMet&&introDone&&inTown(sx,sy)&&!inTown(nx,ny)){ rootTug(dx,dy); return; }
  if(bgDirty) rebuildBg(); bgEnsure(bgFrame());
  const a=mkCanvas(160,128); { const g=a.getContext('2d'); g.drawImage(bgCanvas[bgFrame()],0,0); g.drawImage(fgCanvas[bgFrame()],0,0); }
  const oldEnemies=enemies.map(e=>({...e})), oldNpcs=npcs.slice(), oldElder=elderPos;
  loadScreen(nx,ny); rebuildBg();
  bgEnsure(bgFrame());
  const b=mkCanvas(160,128); { const g=b.getContext('2d'); g.drawImage(bgCanvas[bgFrame()],0,0); g.drawImage(fgCanvas[bgFrame()],0,0); }
  trans={dx,dy,t:0,dur:dx?28:24,a,b};
  state='trans';
  if(dx===1) player.x=1; if(dx===-1) player.x=160-17;
  if(dy===1) player.y=-4; if(dy===-1) player.y=128-22;
  if(!boxFree(player.x+4,player.y+8,8,8)){ [player.x,player.y]=findFree(player.x,player.y,dx?'y':'x'); }
  lastEntry={sx,sy,x:player.x,y:player.y};
}
/* aún no puedes salir del pueblo: las raíces tiran de Sprout hacia dentro (nunca se queda en el borde repitiendo el aviso).
   El texto sale la primera vez y, como recordatorio, si ha pasado un buen rato; entre medias, solo el tirón */
let tugSayT=-99999;
function rootTug(dx,dy){ if(player.tug>0) return;
  if(dx===1) player.x=Math.min(player.x,160-18); if(dx===-1) player.x=Math.max(player.x,2); if(dy===1) player.y=Math.min(player.y,128-24); if(dy===-1) player.y=Math.max(player.y,-3);
  player.kx=-dx*3.2; player.ky=-dy*3.2; player.tug=24; player.squash=-.3; shake=Math.max(shake,2);
  const fx=player.x+8, fy=player.y+15;
  for(let i=0;i<7;i++){ const a=-Math.PI*(i/6); parts.push({k:'shard',x:fx+Math.cos(a)*4,y:fy,vx:Math.cos(a)*.9-dx*.4,vy:-.8-Math.random()*.7-dy*.3,life:16,max:16,col:i&1?'#6a4a2a':'#8a6a40'}); }
  for(let i=0;i<4;i++) parts.push({k:'dust',x:fx+(i-1.5)*4,y:fy,vx:(i-1.5)*.3,vy:-.1,life:14,max:14,r:1+(i&1),col:groundDustCol(),nog:true});
  if(AC){ noise(.12,.04,false,undefined,300); beep('triangle',110,70,.16,.06); }
  if(tick-tugSayT>900){ tugSayT=tick; pendingSay=["(Tus raíces se\nclavan en el\nsuelo...","La voz del GRAN\nROBLE aún te\nreclama. Ve a la\nplaza.)"]; }
  else if(tick-tugTxtT>120){ tugTxtT=tick; flyText.push({x:player.x+8,y:player.y-6,txt:'¡La plaza!',t:40,col:'#fff6c0'}); } }
let tugTxtT=-99999, overUD=0;
function playerOnTile(){ const [tx,ty]=playerTile(); return grid[ty]&&grid[ty][tx]; }
function update(){
  tick++;
  if(sx===1&&sy===1&&typeof robleTick==='function'&&(state==='play'||state==='dialog'||state==='rite')) robleTick(); // el Gran Roble respira (15f)
  if(shake>0)shake--;
  if(hitStop>0){ hitStop--; return; }
  tickFx();
  if(!toast&&toastQ.length&&(state==='play'||state==='trans')){ toast=toastQ.shift(); SFX.blip(); }
  if(toast&&--toast.t<=0) toast=null;
  if(saveFlash>0) saveFlash--; if(placeBanner&&(state==='play'||state==='trans')&&--placeBanner.t<=0) placeBanner=null; if(hudBerryT>0) hudBerryT--; if(hudSeedT>0) hudSeedT--; if(xFlash>0) xFlash--; if(hudHurtT>0) hudHurtT--; zTick();
  if(player.hp<lastHp) hudHurtT=18; if(player.hp>lastHp) hudHealT=16; if(hudHealT>0) hudHealT--; lastHp=player.hp;
  if(itemCardT>0) itemCardT--;
  if(introDone&&!['boot','title','file','cine','credits'].includes(state)) playTime++;
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
    if((keys.fire||keys.alt)&&fontsReady){ keys.fire=false; keys.alt=false; audio(true); SFX.gbDing(); bootGo=66; if(bootT<BOOT_LAND) bootT=BOOT_LAND; } // la música no suena hasta que la bellota se posa en el logo (15h)
    return;
  }
  if(state==='title'){ updTitle(); return; }
  if(state==='file'){ updFile(); return; }
  if(state==='arrive'){ updArrive(); return; } // al continuar: Sprout cae del cielo a su sitio (15a)
  if(state==='fish'){ updFishing(); return; } // la pesca con Moss (12c)
  if(state==='credits'){ creditsT++; // los créditos avanzan; al final, Z vuelve al valle (post-juego)
    const si=((creditsT/420)|0)%4; if((tick%7)===0) parts.push({k:SEASONS[si].part,x:Math.random()*170-5,y:-4,vx:(Math.random()-.5)*.3,vy:.3+Math.random()*.3,life:240,max:240,sway:Math.random()*6,r:(tick&8)?1:0,col:SEASONS[si].partCol[(tick>>3)&1],nog:true});
    updParts(); const end=creditsT>CREDITS.length*22+80;
    if(keys.fire&&end){ keys.fire=false; state='play'; fadeIn=40; parts=[]; setTrack('valle'); } else if(keys.fire){ keys.fire=false; creditsT+=40; } return; }
  if(state==='seasoncine'){ updSeasonCine(); return; }
  if(state==='rite'){ updRite(); return; } // la entrega en la plaza (15f)
  if(state==='door'){ updDoor(); return; } // entrar y salir por puertas, cuevas y escaleras (15g)
  if(state==='ending'){ updEnding(); return; }
  if(state==='cine'){
    cineT++; cineParts();
    if(cineFold>0){ cineFold--;
      if(cineFold===12){ cinePage++; cineChars=0; cinePause=0; cineT=0; parts=[]; noise(.4,.025,false); }
      if(cineFold===0&&cinePage>=CINE.length){ state='play'; wakeT=26; parts=[]; } // el iris ya se abrió sobre la casa: «!» y entra Petra
      keys.fire=false; updParts(); return; }
    const pg=CINE[cinePage].replace(/\s*\n\s*/g,' ');
    if(cineChars<pg.length){ if(cinePause>0) cinePause--; // el narrador respira en las comas y los puntos
      else { const a=cineChars|0; cineChars+=0.7; for(let i=a;i<Math.min(pg.length,cineChars|0);i++){ const c=pg[i]; if(c==='.') cinePause=pg[i+1]==='.'?4:12; else if(',;:'.includes(c)) cinePause=6; }
        if((tick&7)===0)SFX.blip(); if(cineChars>=pg.length) SFX.ping(); } }
    if(keys.fire){ keys.fire=false;
      if(cineChars<pg.length) cineChars=pg.length;
      else { cineFold=24; SFX.cut(); if(cinePage===CINE.length-1) setTrack('casa'); } } // la última página se cierra y el iris se abre en la casa (15a)
    updParts(); return;
  }
  if(state==='itemget'){ if(moment){ updMoment(); return; } itemT--; if((tick&3)===0) puff(player.x+8,player.y-10,C.flowerC,2,1.2); updParts(); if(itemT<=0) say(itemPages||TXT.bladeGet); return; } // las armas: su momento (15d)
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
  if(state==='dying'){ updWilt(); return; }     // marchitarse en el campo y bajar a la tierra (15c)
  if(state==='over'){ updMarchito(); return; }  // el sueño: la voz del Roble y «¿otra vez?» (15c)
  if(state==='dialog'){
    const pg=dlg.pages[dlg.page]; dlg.t++; dlg.pt=(dlg.pt||0)+1;
    if(dlg.t===1&&(dlg.style||'normal')==='normal'){ const yb=(player.y+8>56)?7:78; for(const [lx,ly] of [[6,yb],[154,yb],[154,yb+46],[6,yb+46]]) for(let i=0;i<2;i++) parts.push({k:'blade',x:lx,y:ly,vx:(lx<80?-1:1)*(.4+Math.random()*.6),vy:-.6-Math.random()*.5,life:26,max:26,col:i?'#78d838':'#a8e870',rot:Math.random()*6,vr:.3}); }
    if(dlg.chars<pg.length){
      if(dlg.pause>0&&!keys.fire) dlg.pause--;
      else { const before=dlg.chars|0; dlg.chars+=(keys.fire?3:0.6*(opts.textSpeed||1)); const now=Math.min(pg.length,dlg.chars|0);
        for(let i=before;i<now;i++){ const c=pg[i]; if('.!?…'.includes(c)) dlg.pause=Math.max(dlg.pause,keys.fire?0:10); else if(',;:'.includes(c)) dlg.pause=Math.max(dlg.pause,keys.fire?0:5); }
        if((tick&3)===0&&dlg.chars<pg.length){ const ch=pg[dlg.chars|0]; if(ch==='▒'){ if(AC) noise(.03,.02,true,undefined,2600); } else voiceBlip(dlg.who,ch); } } } // lo roído no suena a voz: suena a papel
    const lastDone=dlg.page===dlg.pages.length-1&&dlg.chars>=pg.length;
    if(dlg.ask&&lastDone){ const lr=(keys.right?1:0)-(keys.left?1:0); if(lr&&dlg.lr!==lr){ dlg.sel=lr>0?1:0; SFX.menu(); } dlg.lr=lr;
      if(keys.alt){ keys.alt=false; const cb=dlg.ask; dlg=null; state='play'; SFX.bump(); cb(false); updParts(); return; } }
    if(keys.fire){ keys.fire=false;
      if(dlg.chars<pg.length) dlg.chars=pg.length;
      else if(dlg.page<dlg.pages.length-1){ dlg.page++; dlg.chars=0; dlg.pause=0; dlg.pt=0; SFX.blip(); }
      else if(dlg.ask){ const cb=dlg.ask, yes=dlg.sel===0; dlg=null; state='play'; if(yes) SFX.blip(); else SFX.bump(); cb(yes); }
      else { const cb=dlg.cb; dlg=null; state='play'; if(cb)cb(); } }
    keys.alt=false; updParts(); return;
  }
  if(state==='trans'){ trans.t++; if(trans.t>=trans.dur){ state='play'; trans=null; } return; }
  if(state==='present'||state==='outro'){ updPresent(); return; } // el título de una mazmorra, la entrada o la salida de un jefe (15i)
  if(state==='olvmoment'){ updOlvMoment(); return; } // un momento del Olvido: la polilla de una muda, la que se posa en Sprout (12d)

  /* === PLAY === */
  if(sproutT>0){ updRebrote(); return; } // rebrotar: germina y sale de la tierra (15c)
  if(keys.menu){ keys.menu=false; openZurron(0); return; }
  if(presentQ&&(!presentQ.await||presentArmed())&&startPresent()) return; // la entrada de un jefe espera a que te metas en la sala (15i)
  if(pendingSay&&!presentAwaiting()){ const ps=pendingSay; pendingSay=null; say(ps); return; }
  if(fadeIn>0) fadeIn--;
  if(bossCard&&--bossCard.t<=0) bossCard=null;
  if((tick&15)===0) checkQuests();
  weather();
  if(wakeT>0){ wakeT--; if(wakeT===25) SFX.blip();
    if(wakeT===0){ if(!petraWoke){ petraWoke=true; npcs.push({ch:'h',x:5,y:5}); puff(5*16+8,5*16+12,'#e8d0a0',6,1); noise(.1,.04,false);
        say(PETRA_WAKE,()=>{ const n=npcs.find(q=>q.ch==='h'); if(n){ npcs=npcs.filter(q=>q!==n); puff(n.x*16+8,n.y*16+8,'#f0f0e0',8,1.2); } say(PETRA_WAKE2); save(); },'PETRA'); }
      else say(["(¡Sprout! ¡Sprout! Una voz te llama desde fuera.)"]); }
    updParts(); return; }
  if(player.inv>0)player.inv--;
  if(hasAmulet('musgo')&&player.hp<player.maxHp&&++regen>=900){ regen=0; player.hp++; SFX.heart(); amuletFx('musgo'); }
  player.kx*=.75; player.ky*=.75; if(player.tug>0) player.tug--;
  if(Math.abs(player.kx)>.1||Math.abs(player.ky)>.1) tryMove(player.kx,player.ky);
  const onTile=playerOnTile();
  // salto con el Vilano
  if(jumpT>0){ if(glideT>0) glideStep(); // el vilano planea mientras mantengas X
    else { jumpT--; jumpZ=Math.sin((26-jumpT)/26*Math.PI)*14; tryMove(jumpDir[0]*2.1,jumpDir[1]*2.1); if(jumpT===13&&keys.altHeld&&!glideUsed&&xItem==='feather') glideStart(); }
    player.anim=0;
    if(jumpT===0){ SFX.land(); player.squash=-.45; stepDust(); stepDust(); } }
  else if(blockSlide&&updBlockSlide()){ if(!(keys.left||keys.right||keys.up||keys.down)){ pushLatch=false; pushHold=0; } } // empujando la roca: Sprout va detrás (soltar la cruceta ya vale para el siguiente empujón)
  else if(player.atk>0){ player.atk--; if(player.atk===10) cutAt(swordBox()); leafSwingTick(); } // briznas, rocío y el tintineo del temple (12b)
  else {
    let dx=0,dy=0;
    if(keys.left)dx=-1; else if(keys.right)dx=1;
    if(keys.up)dy=-1; else if(keys.down)dy=1;
    if(player.tug>10){ dx=0; dy=0; } // las raíces aún tiran de él
    if(inBed&&(dx||dy)){ inBed=false; puff(player.x+8,player.y+12,'#3a2410',8,1.1); puff(player.x+8,player.y+10,'#c06030',4,.8); noise(.1,.04,false); }
    if(dx||dy){ player.dir=dy<0?1:dy>0?0:(dx<0?2:3); tryPushBlock(); if(dx&&dy){dx*=.72;dy*=.72;} } else { pushLatch=false; pushHold=0; }
    let sp=playerSpeed();
    const slow=(onTile==='m'||onTile==='w')&&!hasAmulet('rana'); if(slow) sp*=.55;
    const onIce=onTile==='i'&&!(thawed&&sy===-1);
    if(onIce){ player.ivx+=(dx*sp-player.ivx)*.07; player.ivy+=(dy*sp-player.ivy)*.07; } else { player.ivx=dx*sp; player.ivy=dy*sp; }
    if(Math.abs(player.ivx)>.05||Math.abs(player.ivy)>.05){
      tryMove(player.ivx,player.ivy);
      if(dx||dy){ const was=player.frame; player.anim+=.16*(sp/Math.max(.1,playerSpeed())); player.frame=(player.anim|0)%4;
        if(player.frame!==was&&(player.frame&1)&&!onIce&&onTile!=='w'&&onTile!=='W') stepDust(); }
      if(onIce&&(tick&7)===0) parts.push({x:player.x+4+Math.random()*8,y:player.y+14,vx:0,vy:.1,life:8,col:'#cfe6f4'});
      if(onTile==='t'&&(dx||dy)&&(tick&7)===0) parts.push({x:player.x+4+Math.random()*8,y:player.y+14,vx:(Math.random()-.5)*.6,vy:-.6,life:12,col:BIOMES[screenBiome(sx,sy)].grass[2]});
      if(onTile==='w'&&(dx||dy)&&(tick&5)===0) parts.push({x:player.x+4+Math.random()*8,y:player.y+14,vx:(Math.random()-.5)*.8,vy:-.7,life:12,col:'#c8e8ff'});
      if(onTile==='w'&&(dx||dy)&&(tick&15)===0) parts.push({k:'ripple',x:player.x+8,y:player.y+14,vx:0,vy:0,life:20,max:20,col:'#d8f0ff',nog:true});
      if(onTile==='m'&&(dx||dy)&&(tick&9)===0) parts.push({x:player.x+4+Math.random()*8,y:player.y+14,vx:0,vy:-.2,life:10,col:C.mudD});
    } else { if(player.frame) stepDust(); player.anim=0; player.frame=0; }
    if(keys.fire){ keys.fire=false; attack(); if(state!=='play')return; }
    if(keys.alt){ keys.alt=false; useItem(); if(state!=='play')return; }
  }
  // pulsador de suelo: abre las verjas de la sala
  if(onTile==='%'&&state==='play'){ opened.add('G'+sx+','+sy); SFX.puzzle(); shake=4;
    for(let y=0;y<SH;y++) for(let x=0;x<SW;x++) if(grid[y][x]==='%') grid[y][x]='&';
    openGates(); save(); }
  // caer en un agujero
  if(jumpT===0&&onTile==='°'&&state==='play'){ state='fall'; deathT=40; SFX.fall(); player.atk=0; }
  // REMOLINO
  if(hasSpin&&hasBlade&&player.spin===0&&jumpT===0){
    if(keys.fireHeld&&player.atk===0){ player.charge++; spinChargeTick();
      const need=spinNeed(); if(player.charge===need){ SFX.charge(); puff(player.x+8,player.y+8,'#a8ec78',8,1.2); }
      if(player.charge>=need&&(tick&3)===0){ const a=tick*.5; parts.push({x:player.x+8+Math.cos(a)*11,y:player.y+9+Math.sin(a)*11,vx:0,vy:0,life:8,col:PAL.l,nog:true}); }
    } else if(player.charge>0){ if(player.charge>=spinNeed()) doSpin(); player.charge=0; }
  } else if(!keys.fireHeld) player.charge=0;
  if(player.spin>0){ player.spin--; if((tick&1)===0){ const a=(18-player.spin)*.7; parts.push({x:player.x+8+Math.cos(a)*14,y:player.y+9+Math.sin(a)*14,vx:Math.cos(a)*.8,vy:Math.sin(a)*.8,life:10,col:'#a8ec78',nog:true}); }
    if(player.spin===9||(hasBigSpin&&player.spin===24)) cutAt(meleeBox()); }
  updBombs(); updProjs(); updWind(); updBoomer(); updGear();
  if(!presentAwaiting()){ updBoss(); updMidboss(); } musicIntensity(boss&&boss.maxHp?bossPhase(boss)-1:midboss&&midboss.maxHp?(midboss.hp<=midboss.maxHp/2?1:0):0);
  updPickups();
  updSpawns(); updEnemies(); updRoomRules(); updMill(); updSecrets(); updOlvido(); updParts(); // updOlvido: polillas y polvo (12d)
  updExits();
}
function weather(){
  const ph=inValleyScr(sx,sy)&&won?valleySeason():-1, r=regionOf(sx,sy);
  if(r==='norte'&&!(thawed&&sy===-1)&&!(boss&&boss.type==='viento')){ const mask=(sy===-3&&boss3Done)?15:3;
    if((tick&mask)===0) parts.push({k:'flake',x:Math.random()*160,y:-4,vx:(Math.random()-.5)*.3,vy:.5+Math.random()*.4,life:90,max:90,r:(tick&8)?1:0,col:(tick&4)?'#dff0ff':'#ffffff',nog:true}); }
  if(r==='marisma'&&!summered&&(tick&7)===0) parts.push({k:'leafF',x:Math.random()*160,y:-4,vx:(Math.random()-.5)*.6,vy:.4+Math.random()*.3,life:110,max:110,sway:Math.random()*6,col:(tick&8)?'#c87830':'#e8a040',nog:true});
  if(ph===1&&(tick&23)===0) parts.push({k:'mote',x:Math.random()*160,y:30+Math.random()*90,vx:(Math.random()-.5)*.15,vy:-.1-Math.random()*.12,life:120,max:120,sway:Math.random()*6,col:(tick&32)?'#fff7c0':'#ffffff',nog:true}); // verano: polen y luz
  if(ph===0&&(tick&15)===0) parts.push({k:'petal',x:Math.random()*160,y:-4,vx:(Math.random()-.5)*.4+.15,vy:.35,life:100,max:100,sway:Math.random()*6,col:(tick&16)?'#f8c8e0':C.flower2,nog:true});
  if(ph===2&&(tick&7)===0) parts.push({k:'leafF',x:Math.random()*160,y:-4,vx:(Math.random()-.5)*.6,vy:.4,life:110,max:110,sway:Math.random()*6,col:(tick&8)?'#c87830':'#e8a040',nog:true});
  if(ph===3&&(tick&5)===0) parts.push({k:'flake',x:Math.random()*160,y:-4,vx:(Math.random()-.5)*.3,vy:.4,life:110,max:110,r:(tick&8)?1:0,col:'#ffffff',nog:true});
  if(r==='valle'&&won&&ph<0&&(tick&63)===0) parts.push({x:Math.random()*160,y:30+Math.random()*80,vx:.3+Math.random()*.3,vy:-.1,life:120,col:(tick&64)?'#fffbe8':'#f0a0d0',nog:true,fly:true});
  if((tick%45)===0) for(let y=0;y<SH;y++) for(let x=0;x<SW;x++){ const ch=grid[y][x];
    if(ch==='Q'||(hasAmulet('buho')&&(ch==='C'||ch==='⊂'||ch==='✕'||(ch==='¤'&&!opened.has('CH'+sx+','+sy+':'+x+','+y))))) sparkle(x*16+5+Math.random()*6,y*16+3,C.flowerC); }
}
function updBombs(){
  for(const b of bombs){ b.t--;
    if((b.t&7)===0) parts.push({x:b.x+9,y:b.y+2,vx:(Math.random()-.5)*.4,vy:-.5,life:8,col:'#f8e060',nog:true});
    if(b.t<=0){ SFX.edie(); noise(.35,.12,false); beep('square',90,30,.3,.1); shake=10; if(typeof rumble==='function') rumble(220,.85,.5);
      const big=hasAmulet('topo'), R0=big?46:38;
      puff(b.x+8,b.y+8,'#f8e060',12,2); puff(b.x+8,b.y+8,'#f8a030',10,1.6); puff(b.x+8,b.y+8,'#9088a0',8,1.2);
      parts.push({x:b.x+8,y:b.y+8,vx:0,vy:0,life:12,col:'#fff',ring:true,r:big?22:16,nog:true}); bombFx(b.x+8,b.y+8,big);
      let brokeC=false;
      for(let y=0;y<SH;y++) for(let x=0;x<SW;x++){ const ch=grid[y][x];
        if(Math.hypot(x*16+8-(b.x+8),y*16+8-(b.y+8))<R0){
          if(ch==='C'){ grid[y][x]=regionFloor(); opened.add('C:'+sx+','+sy+':'+x+','+y); puff(x*16+8,y*16+8,'#a89078',8,1.4); brokeC=true; }
          else if(ch==='⊂'||ch==='✕'){ blastSecret(x,y,ch); } // grieta del risco, tesoro enterrado (12c)
          else if(ch==='b'||ch==='t'||ch==='♣'){ cutAt([x*16,y*16,16,16]); }
          else if(ch==='¢'){ toggleCrystal(); }
        } }
      if(brokeC){ SFX.secret(); markDirty(); save(); }
      for(const e of enemies){ if(Math.hypot(e.x+8-(b.x+8),e.y+8-(b.y+8))<(big?36:28)){ damageEnemy(e,3,b.x,b.y); } }
      if(boss) bossBomb(b.x+8,b.y+8,big);
      blastMidboss(b.x+8,b.y+8);
      if(!big&&player.inv===0&&Math.hypot(player.x+8-(b.x+8),player.y+12-(b.y+8))<24) hurt(1,b.x,b.y);
    } }
  bombs=bombs.filter(b=>b.t>0);
}
function updProjs(){
  for(const p of projs){
    if(p.kind==='fall'){ // algo cae del techo: primero la sombra, luego el golpe
      p.delay--; if(p.delay>0) continue; p.t=0;
      puff(p.x,p.y,p.ice?'#dff0ff':'#8a7460',8,1.3); SFX.fallImpact(); shake=Math.max(shake,3);
      if(player.inv===0&&jumpT===0&&Math.hypot(p.x-(player.x+8),p.y-(player.y+12))<11) hurt(p.dmg||2,p.x,p.y-10);
      continue; }
    p.x+=p.vx; p.y+=p.vy; p.t--;
    const ch=tileAt(p.x|0,p.y|0); if(ch!==undefined&&isSolid(ch)&&!WATER.has(ch)) p.t=0;
    if(p.t>0&&!p.reflected&&player.inv===0&&jumpT===0&&Math.hypot(p.x-(player.x+8),p.y-(player.y+12))<8){
      if(shieldBlocks(p.x,p.y)) shieldBlock(p);
      else { hurt(p.dmg||1,p.x,p.y); p.t=0; } }
    if(p.t>0&&!p.reflected&&meleeActive()&&rectsHit(meleeBox(),[p.x-3,p.y-3,6,6])){ if(hasShield&&shieldLvl>=2) reflectProj(p); else { p.t=0; SFX.block(); puff(p.x,p.y,'#e8e8d8',5,1); } }
  }
  projs=projs.filter(p=>p.t>0);
}
function updWind(){
  for(const w of windProjs){ w.x+=w.vx; w.y+=w.vy; w.t--; w.ang+=.5; w.age=(w.age||0)+1;
    const tch=tileAt(w.x|0,w.y|0);
    if(tch!==undefined&&isSolid(tch)&&!WATER.has(tch)){ cutAt([w.x-7,w.y-7,14,14]); const t2=tileAt(w.x|0,w.y|0); if(isSolid(t2)) w.t=0; }
    tornadoTrail(w);
    for(const e of enemies){ if(e.flash===0&&!w.hits.has(e)&&Math.hypot(e.x+8-w.x,e.y+8-w.y)<(w.big?17:11)){ if(e.type==='ghost'&&e.phase>=110) continue;
      w.hits.add(e); damageEnemy(e,bladeLvl+(w.big?1:0),w.x,w.y); if(e.type==='wisp') e.hp=0; } }
    if(boss&&boss.flash===0&&Math.hypot(boss.x+16-w.x,boss.y+16-w.y)<(w.big?24:18)){
      const vul=(boss.type==='topo'&&boss.st==='dazed')||(boss.type==='avispa'&&boss.st==='pinned')||(boss.type==='viento'&&boss.st==='rest')||(boss.type==='ciervo'&&boss.mantle===0&&boss.st!=='yield');
      if(vul){ bossHit(boss,bladeLvl); w.t=0; puff(w.x,w.y,'#a8ec78',8,1.3); } }
    if(w.t<=0&&!w.poof){ w.poof=1; tornadoPoof(w); } // se deshace al acabar o al chocar
  }
  windProjs=windProjs.filter(w=>w.t>0&&w.x>-8&&w.x<168&&w.y>-8&&w.y<136);
}
function updBoomer(){
  const b=boomer; if(!b) return; b.t++; b.ang+=.6;
  if(!b.ret){ b.x+=b.vx; b.y+=b.vy;
    const ch=tileAt(b.x|0,b.y|0);
    if(ch===undefined||b.x<0||b.x>160||b.y<0||b.y>128||b.t>(b.pow?54:30)||(isSolid(ch)&&!WATER.has(ch)&&ch!=='b'&&ch!=='Q'&&ch!=='¢')) b.ret=true;
    if(ch==='b'||ch==='Q'||ch==='t'||ch==='¢') cutAt([b.x-4,b.y-4,8,8]);
  } else { const dx=player.x+8-b.x, dy=player.y+10-b.y, d=Math.hypot(dx,dy);
    if(d<6){ boomer=null; boomerCatch(b); if(b.carry){ for(const p of b.carry) pickups.push({...p,x:player.x+4,y:player.y+4,drop:0}); } return; }
    b.x+=dx/d*(b.pow?3.4:3); b.y+=dy/d*(b.pow?3.4:3); }
  if((tick&1)===0) parts.push({x:b.x,y:b.y,vx:0,vy:0,life:b.pow?9:6,col:b.pow?((tick&2)?'#ffe070':'#fff6c0'):'#d09040',nog:true});
  for(const e of enemies){ if(!b.hits.has(e)&&Math.hypot(e.x+8-b.x,e.y+8-b.y)<(b.pow?13:11)){ b.hits.add(e); e.stun=90; damageEnemy(e,b.pow?2:1,b.x,b.y); SFX.stun(); if(!b.ret&&!b.pow) b.ret=true; } }
  if(midboss&&!b.hits.has(midboss)&&Math.hypot(midboss.x+12-b.x,midboss.y+12-b.y)<14){ b.hits.add(midboss); SFX.block(); b.ret=true; }
  pickups=pickups.filter(p=>{ if(['berry','heart','seed','key','piece','bombs','lure'].includes(p.kind)&&Math.hypot(p.x+4-b.x,p.y+4-b.y)<10){ (b.carry=b.carry||[]).push(p); b.ret=true; SFX.blip(); return false; } return true; });
}
function updPickups(){
  const magnet=hasAmulet('savia');
  for(const p of pickups){ p.t++; if(p.drop>0){ p.drop--; p.y-=Math.sin(p.drop/14*Math.PI)*.8; }
    if(magnet&&(p.kind==='berry'||p.kind==='heart')){ const dx=player.x+8-p.x-4, dy=player.y+10-p.y-4, d=Math.hypot(dx,dy); if(d<48&&d>2){ p.x+=dx/d*1.6; p.y+=dy/d*1.6; } } }
  pickups=pickups.filter(p=>{
    const big=['blade','bomb','ember','hook','tear','flake','boomer','lantern','feather','molinillo','amber'].includes(p.kind), cx=big?8:4;
    const d=Math.hypot(p.x+cx-(player.x+8),p.y+cx-(player.y+12));
    if(d<(big?12:11)&&(!p.drop||p.drop<8)){
      if(p.kind==='seed'){ seeds++; hudSeedT=30; collected.add(p.id); SFX.seed(); collectBurst(p.x+4,p.y+4,'#ffe070',1); screenFlash(5,'#fff6c0'); save(); showToast('¡SEMILLA DORADA!',seeds+'/8'); if(seeds>=8&&!announced8){ announced8=true; say(TXT.allSeeds); } }
      else if(p.kind==='key'){ const dk=dungeonOf(sx,sy)||'x'; dungeonKeys[dk]=(dungeonKeys[dk]||0)+1; collected.add(p.id); SFX.key(); puff(p.x+4,p.y+4,PAL.a,8,1.2); say(TXT.keyGet); save(); }
      else if(p.kind==='bigkey'){ const dk=dungeonOf(sx,sy)||'x'; bigKeys[dk]=true; collected.add(p.id); SFX.key(); puff(p.x+4,p.y+4,PAL.y,10,1.4); say(TXT.bigkeyGet); save(); }
      else if(p.kind==='letter'){ collected.add(p.id); SFX.secret(); puff(p.x+6,p.y+4,'#a8c0d8',10,1.2); const key=sx+','+sy; const n=lettersCount();
        showToast('CARTA DEL VIENTO',n+'/5'); say((LETTERS[key]||["(Una carta\nilegible.)"]).concat(n>=5?LETTERS_DONE:[]),null,null,'letter'); save(); }
      else if(p.kind==='diary'){ const first=![...collected].some(i=>i[0]==='d'); collected.add(p.id); SFX.heart(); puff(p.x+4,p.y+4,'#e8d0a0',8,1); // la primera hoja cuenta de dónde salen
        say((first?TXT.diaryFirst:[]).concat(DIARY[p.id==='dplaza'?'dplaza':sx+','+sy]||["(Una hoja de diario ilegible.)"]),null,null,'paper'); save(); }
      else if(big){ getItem(p.kind); }
      else if(p.kind==='lure'){ hasLure=true; collected.add('lure'); giveThing(LURE_SPR,'CEBO DORADO',["¡El CEBO DORADO!","Moss dice que el VIEJO BIGOTES no se resiste a nada que brille así."]); }
      else if(p.kind==='bombs'){ bombAmmo=Math.min(bombMax,bombAmmo+(p.n||3)); SFX.blip(); collectBurst(p.x+4,p.y+4,'#e8a040'); flyText.push({x:p.x+4,y:p.y-2,txt:'+'+(p.n||3),t:22,col:'#ffd890'}); }
      else if(p.kind==='berry'){ berries=Math.min(999,berries+1); hudBerryT=14; SFX.blip(); collectBurst(p.x+4,p.y+4,'#ff7aa8'); flyText.push({x:p.x+4,y:p.y-2,txt:'+1',t:22,col:'#ffd0e0'}); }
      else if(p.kind==='container'){ player.maxHp+=2; player.hp=player.maxHp; collected.add(p.id); SFX.fanfare(); puff(p.x+4,p.y+4,PAL.R,12,1.5); say(TXT.containerGet); save(); }
      else if(p.kind==='piece'){ collected.add(p.id); puff(p.x+4,p.y+4,PAL.R,10,1.3); addPiece(); }
      else { player.hp=Math.min(player.maxHp,player.hp+2); SFX.heart(); collectBurst(p.x+4,p.y+4,'#ff8890'); }
      return false; } return true; });
}
function updExits(){
  const htx=(player.x+8)>>4, hty=(player.y+13)>>4, ch=grid[hty]&&grid[hty][htx];
  if(ch==='x'){ if(sx===9) exitHouse(); else if(sx===8) exitShop(); else if(sx===7) placeAt(2,0,68,34,0); else if(sx===10&&sy===2) placeAt(10,1,68,18,0); else exitDungeon(); return; }
  if(ch==='>'&&sx===5&&sy===9){ enterEcho(); return; }
  if(ch==='>'){ if(sx===10&&sy===1) placeAt(10,2,72,24,0); else if(['valle','norte','marisma'].includes(regionOf(sx,sy))) enterSecret(); return; }
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
function updFile(){
  updParts(); fileT++; FS.t++; if(FS.ph!=='back') titleCam=Math.min(1,titleCam+1/22); fileParts();
  for(let i=0;i<3;i++){ if(fileDelT[i]>0){ fileDelT[i]--; fileDelTick(i); } fileEmergeFx(i); }
  if(FS.ph==='go'){ fileGoTick(); return; }
  if(FS.ph==='plant'){ filePlantTick(); return; }
  if(FS.ph==='back'){ titleCam=Math.max(0,titleCam-1/16); if(FS.t>=18){ state='title'; titleT=Math.max(titleT,TITLE_MENU); FS={ph:'pick',t:0}; } return; }
  if(fileT<30){ keys.fire=keys.alt=keys.menu=false; return; } // mientras brotan las macetas
  if(keys.menu){ keys.menu=false; if(fileConfirm) fileConfirm=false; else { FS={ph:'back',t:0}; if(AC) beep('square',f(72),f(60),.18,.03); } SFX.blip(); return; }
  const lr=((keys.right||keys.down)?1:0)-((keys.left||keys.up)?1:0);
  if(lr!==fileUD){ fileUD=lr; if(lr!==0&&!fileConfirm&&fileDelT.every(v=>v===0)){ fileSel=(fileSel+(lr>0?1:2))%3; fileWake[fileSel]=tick; fileHop[fileSel]=tick; fileSelFx(fileSel); } }
  if(keys.fire){ keys.fire=false;
    if(fileConfirm){ try{ localStorage.removeItem(slotKey(fileSel)); }catch(e){} slotCache[fileSel]=null; fileConfirm=false; fileDelT[fileSel]=FILE_DEL; if(AC) SFX.blip(); }
    else if(fileDelT[fileSel]===0){ curSlot=fileSel; if(slotCache[fileSel]){ FS={ph:'go',t:0}; if(AC) SFX.charge&&SFX.charge(); } else { FS={ph:'plant',t:0}; if(AC) SFX.chime(); } } }
  if(keys.alt){ keys.alt=false; if(fileConfirm){ fileConfirm=false; SFX.blip(); } else if(slotCache[fileSel]&&fileDelT[fileSel]===0){ fileConfirm=true; SFX.bump(); } }
}
/* las macetas brotan de la tierra: terrones al abrirse y un golpe al asentarse (con una nota que sube de una a otra) */
function fileEmergeFx(i){ if(FS.ph!=='pick') return; const t0=8+i*8, cx=FILE_POT_X[i], gy=FILE_POT_Y+26;
  if(fileT===t0){ for(let k=0;k<8;k++) parts.push({k:'shard',x:cx-12+k*3,y:gy,vx:(k-3.5)*.35,vy:-1.4-Math.random(),life:18,max:18,col:k&1?'#5a3a1c':'#8a6a40'}); if(AC) noise(.08,.04,false,undefined,500); }
  if(fileT===t0+10){ for(let s of [-1,1]) for(let k=0;k<3;k++) parts.push({k:'dust',x:cx+s*(12+k*2),y:gy,vx:s*(.5+k*.25),vy:-.1,life:16,max:16,r:1+(k&1),col:'#e8dcc0',nog:true});
    shake=Math.max(shake,1); if(AC){ beep('triangle',f(55+i*4),0,.12,.07); beep('square',f(67+i*4),0,.07,.02); } } }
/* cambiar de maceta: salta, suelta un par de hojas y suena su nota */
function fileSelFx(i){ const cx=FILE_POT_X[i]; for(let k=0;k<4;k++) parts.push({k:'leafF',x:cx-6+k*4,y:fileSoilY()-18,vx:(k-1.5)*.5,vy:-1-Math.random()*.6,life:40,max:40,sway:Math.random()*6,col:k&1?'#78d838':'#d0f890',nog:false});
  if(AC){ beep('square',f(72+i*3),f(79+i*3),.06,.03); beep('triangle',f(60+i*3),0,.08,.04); } }
/* borrar: la despedida (mano), el marchitarse y hundirse, los terrones y la hoja que sube; la semilla vuelve con un destello */
function fileDelTick(i){ const t=FILE_DEL-fileDelT[i], cx=FILE_POT_X[i], soil=fileSoilY();
  if(t===2&&AC) beep('triangle',f(67),f(64),.2,.03);
  if(t===16&&AC) SFX.wilt&&SFX.wilt();
  if(t===40){ SFX.cut(); shake=3; puff(cx,soil,'#5a3a1c',8,.9); for(let k=0;k<6;k++) parts.push({k:'shard',x:cx-6+k*2,y:soil,vx:(k-2.5)*.4,vy:-1.2-Math.random()*.8,life:16,max:16,col:'#6a4a2a'});
    parts.push({k:'leafF',x:cx,y:soil-8,vx:.2,vy:-.9,life:70,max:70,sway:2,col:'#a4e070',nog:true}); }
  if(t===52){ for(let k=0;k<6;k++) sparkle(cx-5+Math.random()*10,soil-6+Math.random()*4,'#fff6c0'); if(AC) SFX.ping(); } }
/* continuar: el brote salta fuera y el iris de hojas se cierra; al acabar, el juego se abre donde lo dejaste */
function fileGoTick(){ const t=FS.t, cx=FILE_POT_X[fileSel], soil=fileSoilY();
  if(t===12){ SFX.jump(); shake=2; for(let k=0;k<10;k++){ const a=-Math.PI*(k/9); parts.push({k:'leafF',x:cx,y:soil-4,vx:Math.cos(a)*1.8,vy:Math.sin(a)*1.6-.6,life:50,max:50,sway:Math.random()*6,col:['#78d838','#d0f890','#2e8a34'][k%3],nog:false}); } puff(cx,soil,'#5a3a1c',6,1); }
  if(t>12&&t<34&&(t&1)) parts.push({k:'mote',x:cx+(Math.random()-.5)*8,y:soil-30-(t-12)*4,vx:0,vy:.4,life:20,max:20,sway:Math.random()*6,col:'#fff6c0',nog:true});
  if(t===40&&AC) swish(.5,.05,900,3000,1600);
  if(t>=FILE_GO){ const d=slotCache[fileSel]; FS={ph:'pick',t:0}; loadGame(d); parts=[]; startArrive(); } }
/* partida nueva: la semilla brilla, la luz del Roble baja, brota y todo se funde hacia el prólogo */
function filePlantTick(){ const t=FS.t, cx=FILE_POT_X[fileSel], soil=fileSoilY();
  if(keys.fire&&t>20){ keys.fire=false; FS.t=FILE_PLANT; } // Z: al prólogo
  if(t===PL.beat1||t===PL.beat2){ if(typeof tiHeart==='function') tiHeart(t===PL.beat1?.8:1); }
  if(t===PL.beam){ SFX.chime(); } if(t>PL.beam&&t<PL.push&&(t%3)===0){ const k=Math.random(); parts.push({k:'leafF',x:80+(cx-80)*k+(Math.random()-.5)*8,y:34+(soil-34)*k,vx:(cx-80)/60,vy:.5,life:40,max:40,sway:Math.random()*6,col:['#fff0a0','#ffd8e8','#fffbe0'][t%3],nog:true}); }
  if(t===PL.beam+6||t===PL.beam+16){ if(typeof tiHeart==='function') tiHeart(1.2); }
  if(t===PL.crack){ shake=2; if(AC){ noise(.06,.05,true,undefined,3000); beep('triangle',f(72),f(84),.12,.05); } screenFlash&&screenFlash(4,'#fffbe0');
    for(const s of [-1,1]) parts.push({k:'shard',x:cx+s*2,y:soil-4,vx:s*1.1,vy:-1.6,life:22,max:22,col:'#c88a10'}); for(let k=0;k<8;k++) sparkle(cx-6+Math.random()*12,soil-10+Math.random()*8,'#fffbe0'); }
  if(t===PL.grow+4&&AC) SFX.regrow();
  if(t>=PL.push&&t<PL.wake&&(t&3)===0) parts.push({k:'shard',x:cx+(Math.random()-.5)*14,y:soil,vx:(Math.random()-.5)*1.4,vy:-1-Math.random(),life:14,max:14,col:Math.random()<.5?'#5a3a1c':'#8a6a40'});
  if(t===PL.push+18){ shake=1; if(AC) beep('triangle',f(60),0,.1,.05); }
  if(t===PL.wake+5&&AC) SFX.ping();
  if(t===PL.joy&&AC){ beep('square',f(76),f(88),.1,.04); SFX.chime(); }
  if(t===PL.hop&&AC) SFX.jump();
  if(t===PL.land){ if(AC) SFX.land(); shake=2; const P=plantOut(); for(const s of [-1,1]) for(let k=0;k<3;k++) parts.push({k:'dust',x:P.x+s*(4+k*2),y:P.feet,vx:s*(.5+k*.25),vy:-.1,life:16,max:16,r:1+(k&1),col:'#e8dcc0',nog:true}); }
  if(t===PL.iris&&AC) swish(.6,.05,900,3000,1600);
  if(t>=FILE_PLANT){ FS={ph:'pick',t:0}; newGame(); } }
/* ---------- EL ZURRÓN (pausa) ---------- */
const X_ITEMS=['bomb','hook','boomer','lantern','feather','molinillo'];
function ownedX(){ return X_ITEMS.filter(k=>({bomb:hasBomb,hook:hasHook,boomer:hasBoomer,lantern:hasLantern,feather:hasFeather,molinillo:hasPinwheel})[k]); }
function updPause(){
  if(pausePage===4&&optRemap){ updRemap(); return; }
  if(keys.menu){ keys.menu=false; closeZurron(); return; }   // el zurrón (15b) sale volando; el juego sigue ya
  if(keys.alt){ keys.alt=false; zTabTo((pausePage+1)%5); return; }
  const lr=(keys.right?1:0)-(keys.left?1:0), ud=(keys.down?1:0)-(keys.up?1:0);
  if(pausePage===0) updBag(lr,ud); // objetos, amuletos y equipo (15b)
  else if(pausePage===3){
    const L=loreList();
    if(ud!==pauseUD){ pauseUD=ud; if(ud&&L.length){ loreSel=(loreSel+ud+L.length)%L.length; SFX.blip(); } }
    if(keys.fire){ keys.fire=false; const e=L[loreSel]; if(e){ SFX.blip(); zLore=true; say(e.pages,()=>{ state='pause'; zLore=false; },null,e.kind==='runa'?'stone':e.kind==='carta'?'letter':'paper'); } }
  } else if(pausePage===4){ updOptions(lr,ud);
  } else { if(lr!==pauseLR) pauseLR=lr; if(ud!==pauseUD) pauseUD=ud; if(keys.fire){ keys.fire=false; SFX.blip(); } }
}
