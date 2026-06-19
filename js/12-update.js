'use strict';
/* ---------- LÓGICA PRINCIPAL ---------- */
const inTown=(x,y)=>(x===1&&y===1)||(x===0&&y===1); // plaza + barrio
function startTransition(dx,dy){
  const nx=sx+dx, ny=sy+dy;
  if(!MAPS[nx+','+ny]){ return; } // el mundo es donde haya mapa
  // hasta oír al sabio, el valle no te suelta: primero la voz del Roble
  if(!elderMet&&introDone&&inTown(sx,sy)&&!inTown(nx,ny)){
    pendingSay=["(Tus raíces se\nclavan en el\nsuelo...",
                "La voz del GRAN\nROBLE aún te\nreclama. Ve a la\nplaza.)"];
    return;
  }
  // render actual y destino a buffers
  const a=document.createElement('canvas');a.width=160;a.height=128;
  renderScreenTo(a.getContext('2d'),grid,0,0);
  const saveGrid=grid, ssx=sx, ssy=sy;
  loadScreen(nx,ny);
  const b=document.createElement('canvas');b.width=160;b.height=128;
  renderScreenTo(b.getContext('2d'),grid,0,0);
  trans={dx,dy,t:0,dur:dx?28:24,a,b};
  state='trans';
  // recolocar jugador al lado opuesto
  if(dx===1) player.x=1; if(dx===-1) player.x=160-17;
  if(dy===1) player.y=-4; if(dy===-1) player.y=128-22;
  // si cae en sólido: busca el hueco libre MÁS CERCANO a lo largo del borde
  if(!boxFree(player.x+4,player.y+8,8,8)){
    const axis = dx ? 'y' : 'x';
    [player.x,player.y]=findFree(player.x,player.y,axis);
  }
  lastEntry={sx,sy,x:player.x,y:player.y}; // checkpoint
}
function findFree(px,py,axis){
  for(let off=0;off<=140;off+=4){
    for(const s of (off?[-1,1]:[1])){
      const nx = axis==='x' ? px+off*s : px;
      const ny = axis==='y' ? py+off*s : py;
      if(nx<0||nx>144||ny<-4||ny>106) continue;
      if(boxFree(nx+4,ny+8,8,8)) return [nx,ny];
    }
  }
  return [px,py];
}

function update(){
  tick++;
  if(shake>0)shake--;
  if(hitStop>0){ hitStop--; return; } // congelación de impacto
  if(!toast&&toastQ.length){ toast=toastQ.shift(); SFX.blip(); } // avisos de misión
  if(toast&&--toast.t<=0) toast=null;
  if(state!=='play'&&state!=='pause'&&state!=='shop'&&state!=='file') keys.menu=false;
  if(state==='pause'){
    if(keys.menu){ keys.menu=false; pauseView=(pauseView+1)%3; SFX.blip(); } // ENTER: zurrón→misiones→mapa
    if(keys.fire){ keys.fire=false; state='play'; SFX.blip(); } // Z vuelve al juego
    return;
  }
  if(state==='shop'){ // la tienda de Tilo
    const ud=(keys.up?1:0)-(keys.down?1:0);
    if(ud!==shopUD){ shopUD=ud;
      if(ud!==0){ const n=shopList().length; shopSel=(shopSel+(ud>0?n-1:1))%n; SFX.blip(); } }
    if(keys.fire){ keys.fire=false; buyShop(); }
    if(keys.alt||keys.menu){ keys.alt=false; keys.menu=false; state='play'; SFX.blip(); }
    updParts(); return;
  }
  if(state==='give'){ // el objeto vuela hasta las manos del anciano
    giveFx.t++;
    const k=giveFx.t/giveFx.dur, e=k*k*(3-2*k);
    giveFx.x=giveFx.fx+(giveFx.tx-giveFx.fx)*e;
    giveFx.y=giveFx.fy+(giveFx.ty-giveFx.fy)*e-Math.sin(k*Math.PI)*22; // arco
    if((tick&1)===0) parts.push({x:giveFx.x+4,y:giveFx.y+6,vx:(Math.random()-.5)*.4,vy:.25,life:16,col:C.flowerC});
    if(giveFx.t>=giveFx.dur){
      puff(giveFx.tx+4,giveFx.ty+6,C.flowerC,12,1.4); SFX.seed();
      const cb=giveFx.cb; giveFx=null; state='play'; if(cb)cb();
    }
    updParts(); return;
  }
  if(state==='boot'){ // encendido GB: NAHUELGABE(tm) cae; el toque hace ¡po-LING! y arranca todo
    bootT++;
    if(bootGo>0){ bootGo--;
      if(bootGo===0){ state='title'; titleT=0; parts=[]; } // al título: el tema entra justo tras el ding
      return;
    }
    if((keys.fire||keys.alt)&&fontsReady){ keys.fire=false; keys.alt=false;
      audio();                                   // gesto real: el audio nace despierto...
      musicStep=0; nextNoteT=AC.currentTime+1.3; // ...la música espera a que el ding respire
      SFX.gbDing(); bootGo=66;                   // ~1s de logo + campanada, como la consola
      if(bootT<46) bootT=46;                     // si el logo aún caía, aterriza ya
    }
    return;
  }
  if(state==='title'){
    if(fontsReady) titleT++;  // la animación espera a que cargue la fuente
    // hojas a la deriva
    if(titleT>0&&(titleT%9)===0) parts.push({x:Math.random()*160,y:-4,
      vx:(Math.random()-.5)*.35,vy:.2+Math.random()*.3,life:110,
      col:[PAL.l,C.canopyL,C.flowerC,C.flower1][(titleT/9|0)%4]});
    updParts();
    // polvo y golpe seco cuando aterriza cada letra (timbal ascendente; la bellota, con chispa)
    for(let i=0;i<6;i++){
      if(titleT===TITLE_T0+i*TITLE_STAG+TITLE_DUR){
        shake=(i===5)?5:2; puff(LOGO_POS[i]+8,LOGO_Y+20,'#cfe8d8',6,1);
        if(AC){ SFX.thud(i===5?9:i); if(i===5) SFX.ping(); }
      }
    }
    // la Hoja Ancestral cae meciéndose; hojitas que la acompañan
    if(titleT>TITLE_LEAF0&&titleT<TITLE_LEAF0+TITLE_LEAFD&&(titleT%9)===0)
      parts.push({x:50+Math.random()*60,y:Math.random()*24,vx:(Math.random()-.5)*.5,vy:.45,life:70,
        col:[PAL.l,'#a8ec78',C.canopyL][titleT%3]});
    // susurro en cada vaivén del péndulo (cuando la hoja cambia de lado)
    if(AC&&[11,34,57,79].includes(titleT-TITLE_LEAF0)) SFX.swoosh();
    if(titleT===TITLE_LEAF0+TITLE_LEAFD){ // se posa con un susurro y una campanita
      shake=2; puff(56,LOGO_Y+16,'#a8ec78',5,.7); puff(106,LOGO_Y+2,'#a8ec78',5,.7);
      if(AC){ noise(.18,.045,false); SFX.chime(); }
    }
    if(AC&&titleT===TITLE_LAND+8) SFX.ping();        // asoma el subtítulo
    if(AC&&titleT===TITLE_MENU) SFX.menuIn();        // aparece "PULSA Z"
    if(AC&&titleT>TITLE_MENU){                       // ciclo de destellos del logo
      const cyc=(titleT-TITLE_SHINE)%190;
      if(cyc===0) SFX.shing();
      else if(cyc===36) SFX.ping();                  // ...y la chispa en la bellota
    }
    if(keys.fire||keys.alt){ keys.fire=false; keys.alt=false; audio();
      if(titleT<TITLE_MENU) titleT=TITLE_MENU;            // Z durante la animación: la salta
      else { // a la pantalla de archivos, como en Zelda
        slotCache=[readSlot(0),readSlot(1),readSlot(2)];
        fileSel=Math.max(0,slotCache.findIndex(d=>d));
        fileConfirm=false; fileUD=0; state='file'; SFX.blip();
      }
    }
    return;
  }
  if(state==='file'){ // ELIGE BROTE: 3 slots, borrar con X, ENTER vuelve al título
    updParts();
    if(keys.menu){ keys.menu=false;
      if(fileConfirm) fileConfirm=false;                 // primero cancela el borrado
      else { state='title'; titleT=TITLE_MENU; }         // y si no, atrás al título
      SFX.blip(); return;
    }
    const ud=(keys.up?1:0)-(keys.down?1:0);
    if(ud!==fileUD){ fileUD=ud;
      if(ud!==0&&!fileConfirm){ fileSel=(fileSel+(ud>0?2:1))%3; SFX.blip(); } }
    if(keys.fire){ keys.fire=false;
      if(fileConfirm){ // confirmar borrado
        try{ localStorage.removeItem(slotKey(fileSel)); }catch(e){}
        slotCache[fileSel]=null; fileConfirm=false; SFX.cut(); shake=3;
      } else {
        curSlot=fileSel;
        const d=slotCache[fileSel];
        if(d){ loadGame(d); state='play'; fadeIn=40; parts=[]; }
        else newGame();
      }
    }
    if(keys.alt){ keys.alt=false;
      if(fileConfirm){ fileConfirm=false; SFX.blip(); }
      else if(slotCache[fileSel]){ fileConfirm=true; SFX.bump(); }
    }
    return;
  }
  if(state==='cine'){
    if((tick%5)===0) parts.push({x:164,y:Math.random()*140,vx:-(0.6+Math.random()*1.2),
      vy:(Math.random()-.5)*.3,life:160,col:[PAL.l,C.canopyL,C.flowerC][(tick/5|0)%3]});
    if(cineFold>0){ // la hoja se dobla por la vena y se abre con texto nuevo
      cineFold--;
      if(cineFold===12){ cinePage++; cineChars=0; noise(.4,.025,false);
        for(let i=0;i<5;i++) parts.push({x:60+Math.random()*40,y:66+Math.random()*12,
          vx:(Math.random()-.5)*1.2,vy:-.4-Math.random()*.5,life:26,col:'#dce8a4'}); }
      keys.fire=false; updParts(); return;
    }
    const pg=CINE[cinePage];
    if(cineChars<pg.length){ cineChars+=0.4; if((tick&7)===0)SFX.blip();
      if(cineChars>=pg.length) SFX.ping(); }
    if(keys.fire){ keys.fire=false;
      if(cineChars<pg.length) cineChars=pg.length;
      else if(cinePage<CINE.length-1){ cineFold=24; SFX.cut(); }
      else { state='play'; fadeIn=70; wakeT=90; parts=[]; setTrack('casa'); }
    }
    updParts(); return;
  }
  if(state==='itemget'){
    itemT--;
    if((tick&3)===0) puff(player.x+8,player.y-10,C.flowerC,2,1.2);
    updParts();
    if(itemT<=0) say(itemPages||TXT.bladeGet);
    return;
  }
  if(state==='hook'){ // deslizándose por la raíz
    const dx=hook.tx-player.x, dy=hook.ty-player.y, d=Math.hypot(dx,dy);
    if(d<3){ player.x=hook.tx; player.y=hook.ty; hook=null; state='play'; puff(player.x+8,player.y+12,PAL.l,5,1); }
    else { player.x+=dx/d*3.2; player.y+=dy/d*3.2;
      if((tick&3)===0) parts.push({x:player.x+8,y:player.y+12,vx:0,vy:.2,life:8,col:'#78c8f8'}); }
    updParts(); return;
  }
  if(state==='dying'){ // marchitándose
    deathT--;
    if(deathT===54){ SFX.wilt&&SFX.wilt(); }
    if((tick&3)===0) parts.push({x:player.x+4+Math.random()*8,y:player.y+4,vx:(Math.random()-.5)*.5,vy:.3+Math.random()*.4,life:30,col:['#c8b070','#a87838','#6a8a3a'][(tick/3|0)%3]});
    updParts();
    if(deathT<=0){ state='over'; }
    return;
  }
  if(state==='over'){ // pantalla de rebrote
    if(keys.fire){ keys.fire=false;
      player.hp=player.maxHp; player.inv=90; inBed=false;
      loadScreen(respawnPoint.sx,respawnPoint.sy);    // rebrotas en la entrada de la región
      player.x=respawnPoint.x; player.y=respawnPoint.y; player.dir=0;
      bombs=[]; projs=[]; state='play'; fadeIn=30; sproutT=24;
    }
    return;
  }
  if(state==='dialog'){
    const pg=dlg.pages[dlg.page];
    if(dlg.chars<pg.length){ dlg.chars+= (keys.fire?3:0.55); if((tick&3)===0&&dlg.chars<pg.length)SFX.blip(); }
    if(keys.fire){ keys.fire=false;
      if(dlg.chars<pg.length) dlg.chars=pg.length;
      else if(dlg.page<dlg.pages.length-1){ dlg.page++; dlg.chars=0; }
      else { const cb=dlg.cb; dlg=null; state='play'; if(cb)cb(); }
    }
    updParts(); return;
  }
  if(state==='trans'){
    trans.t++;
    if(trans.t>=trans.dur){ state='play'; trans=null; }
    return;
  }

  /* === PLAY === */
  if(sproutT>0){ // germinando tras rebrotar: breve, sin control
    if(sproutT===24) SFX.regrow();
    sproutT--; if(fadeIn>0)fadeIn--; updParts(); return;
  }
  if(keys.menu){ keys.menu=false; state='pause'; pauseView=0; SFX.blip(); return; }
  if(pendingSay){ const ps=pendingSay; pendingSay=null; say(ps); return; }
  if(fadeIn>0) fadeIn--;
  if((tick&15)===0) checkQuests(); // el registro de misiones detecta avances
  if(wakeT>0){
    wakeT--;
    if(wakeT===25) SFX.blip();
    if(wakeT===0) say(["(¡Brote! ¡Brote!\nUna voz te llama\ndesde fuera.)"]);
    updParts(); return;
  }
  if(player.inv>0)player.inv--;
  player.kx*=.75; player.ky*=.75;
  if(Math.abs(player.kx)>.1||Math.abs(player.ky)>.1) tryMove(player.kx,player.ky);

  if(player.atk>0){
    player.atk--;
  } else {
    let dx=0,dy=0;
    if(keys.left)dx=-1; else if(keys.right)dx=1;
    if(keys.up)dy=-1; else if(keys.down)dy=1;
    if(inBed&&(dx||dy)){ // salta de la maceta al moverse
      inBed=false;
      puff(player.x+8,player.y+12,'#3a2410',8,1.1); puff(player.x+8,player.y+10,'#c06030',4,.8);
      noise(.1,.04,false);
    }
    if(dx||dy){
      player.dir = dy<0?1:dy>0?0:(dx<0?2:3);
      tryPushBlock();           // empujar rocas-raíz
      if(dx&&dy){dx*=.72;dy*=.72;}
      const sp=1.2;
      tryMove(dx*sp,dy*sp);
      player.anim+=.13; player.frame=(player.anim|0)%2;
      // brizna al pisar hierba alta
      const tx=(player.x+8)>>4, ty=(player.y+13)>>4;
      if(grid[ty]&&grid[ty][tx]==='t'&&(tick&7)===0)
        parts.push({x:player.x+4+Math.random()*8,y:player.y+14,vx:(Math.random()-.5)*.6,vy:-.6,life:12,col:C.grassDD});
    } else player.anim=0, player.frame=0;
    if(keys.fire){ keys.fire=false; attack(); }
  }

  // REMOLINO: mantén Z para cargar la Hoja, suelta para girar
  if(hasSpin&&hasBlade&&player.spin===0){
    if(keys.fireHeld&&player.atk===0){
      player.charge++;
      if(player.charge===36){ SFX.heart(); puff(player.x+8,player.y+8,'#a8ec78',8,1.2); }
      if(player.charge>=36&&(tick&3)===0){ const a=tick*.5;
        parts.push({x:player.x+8+Math.cos(a)*11,y:player.y+9+Math.sin(a)*11,vx:0,vy:0,life:8,col:PAL.l}); }
    } else if(player.charge>0){
      if(player.charge>=36) doSpin();
      player.charge=0;
    }
  } else if(!keys.fireHeld) player.charge=0;
  if(player.spin>0){
    player.spin--;
    if((tick&1)===0){ const a=(18-player.spin)*.7;
      parts.push({x:player.x+8+Math.cos(a)*14,y:player.y+9+Math.sin(a)*14,
        vx:Math.cos(a)*.8,vy:Math.sin(a)*.8,life:10,col:'#a8ec78'}); }
  }

  // la hoja corta arbustos (tajo normal o remolino)
  if(player.atk===8) cutBushesAt(swordBox());
  if(player.spin===9) cutBushesAt(meleeBox());

  // bellota-bomba (X)
  if(keys.alt){ keys.alt=false;
    if(hasBomb&&bombs.length<2){
      const bx=((player.x+8)>>4)*16, by=((player.y+12)>>4)*16;
      bombs.push({x:bx,y:by,t:80}); SFX.blip();
    }
  }
  for(const b of bombs){
    b.t--;
    if((b.t&7)===0) parts.push({x:b.x+9,y:b.y+2,vx:(Math.random()-.5)*.4,vy:-.5,life:8,col:'#f8e060'});
    if(b.t<=0){ // ¡BUM!
      SFX.edie(); noise(.35,.12,false); beep('square',90,30,.3,.1); shake=10;
      puff(b.x+8,b.y+8,'#f8e060',12,2); puff(b.x+8,b.y+8,'#f8a030',10,1.6); puff(b.x+8,b.y+8,'#9088a0',8,1.2);
      // rompe grietas
      let brokeC=false;
      for(let y=0;y<SH;y++) for(let x=0;x<SW;x++){
        if(grid[y][x]==='C'&&Math.hypot(x*16+8-(b.x+8),y*16+8-(b.y+8))<38){
          grid[y][x]=regionFloor(); opened.add('C:'+sx+','+sy+':'+x+','+y);
          puff(x*16+8,y*16+8,'#a89078',8,1.4); save(); brokeC=true;
        }
      }
      if(brokeC) SFX.secret();
      // daña enemigos y jefe
      for(const e of enemies){ if(Math.hypot(e.x+8-(b.x+8),e.y+8-(b.y+8))<28){ e.hp-=3; e.flash=8; } }
      if(boss&&boss.st!=='burrow'&&Math.hypot(boss.x+8-(b.x+8),boss.y+8-(b.y+8))<30){ boss.hp-=3; boss.flash=10;
        if(boss.type==='viento'&&boss.hp<2) boss.hp=2; } // al Viento no se le remata con bombas
      // y a ti, si estás cerca
      if(player.inv===0&&Math.hypot(player.x+8-(b.x+8),player.y+12-(b.y+8))<24){
        player.hp--; player.inv=60; SFX.hurt(); hitStop=3; if(player.hp<=0) die();
      }
    }
  }
  bombs=bombs.filter(b=>b.t>0);

  // pulsador de la mazmorra
  {
    const ptx=(player.x+8)>>4, pty=(player.y+12)>>4;
    if(grid[pty]&&grid[pty][ptx]==='%'){
      opened.add('G'+sx+','+sy); SFX.secret(); shake=4; save();
      for(let y=0;y<SH;y++) for(let x=0;x<SW;x++){
        if(grid[y][x]==='%') grid[y][x]='&';
        else if(grid[y][x]==='='){ grid[y][x]='q'; puff(x*16+8,y*16+8,'#8a7048',6,1.2); }
      }
    }
  }

  // rocas del jefe
  for(const p of projs){
    p.x+=p.vx; p.y+=p.vy; p.t--;
    if(player.inv===0&&Math.hypot(p.x-(player.x+8),p.y-(player.y+12))<8){
      player.hp--; player.inv=60; SFX.hurt(); hitStop=3; shake=6; p.t=0;
      if(player.hp<=0) die();
    }
  }
  projs=projs.filter(p=>p.t>0);

  // tornaditos de la Hoja: viajan, podan arbustos y arrasan bichos
  for(const w of windProjs){
    w.x+=w.vx; w.y+=w.vy; w.t--; w.ang+=.5;
    const tch=grid[(w.y|0)>>4]&&grid[(w.y|0)>>4][(w.x|0)>>4];
    if(tch!==undefined&&isSolid(tch)&&tch!=='W'&&tch!=='~'){ // pasa sobre el agua, muere en muros
      cutBushesAt([w.x-7,w.y-7,14,14]);                      // (si era arbusto, lo poda)
      const t2=grid[(w.y|0)>>4][(w.x|0)>>4];
      if(isSolid(t2)){ w.t=0; puff(w.x,w.y,'#a8ec78',6,1.1); }
    }
    if((tick&1)===0) parts.push({x:w.x+(Math.random()-.5)*8,y:w.y+4,
      vx:-w.vx*.3,vy:-.3,life:10,col:(tick&2)?PAL.l:'#a8ec78'});
    for(const e of enemies){
      if(e.flash===0&&Math.hypot(e.x+8-w.x,e.y+8-w.y)<11){
        if(e.type==='ghost'&&e.phase>=110) continue; // intangible
        e.hp-=bladeLvl; e.flash=8; SFX.ehit();
        e.kx=w.vx*1.4; e.ky=w.vy*1.4;
      }
    }
    if(boss&&boss.flash===0&&Math.hypot(boss.x+8-w.x,boss.y+8-w.y)<13){
      const vul=(boss.type==='topo'&&boss.st==='up')||(boss.type==='avispa'&&boss.st==='tired')||(boss.type==='viento'&&boss.st==='rest');
      if(vul){
        if(boss.type==='viento'){ if(boss.hp>2){ boss.hp=Math.max(2,boss.hp-bladeLvl); boss.flash=10; SFX.ehit(); } else SFX.bump(); }
        else { boss.hp-=bladeLvl; boss.flash=10; SFX.ehit(); }
        w.t=0; puff(w.x,w.y,'#a8ec78',8,1.3);
      }
    }
  }
  windProjs=windProjs.filter(w=>w.t>0&&w.x>-8&&w.x<168&&w.y>-8&&w.y<136);

  // EL VIENTO DEL NORTE
  if(boss&&boss.type==='viento'){
    if(boss.flash>0)boss.flash--;
    boss.t--;
    const enraged=boss.hp<=5, calmed=boss.hp<=2; // a media vida se enfurece; casi sin vida, se rinde
    const dx=player.x-boss.x, dy=player.y-boss.y, d=Math.hypot(dx,dy)||1;
    if(calmed){
      if(boss.st!=='rest'){ boss.st='rest'; boss.t=999; if(boss.y<60)boss.y=96; shake=4; SFX.bump(); }
      boss.t=999; // exhausto: ya no se levanta; espera que alguien le hable
      if(!boss.calmMsg){ boss.calmMsg=true;
        pendingSay=["(El viento cae y\nse queda quieto,\nencogido...)","(Ya no pelea.\nTrae memoria, no\nespada: acércate.)"]; }
    }
    if(boss.st==='float'){ // flota arriba, EMPUJA al jugador y suelta remolinos
      boss.x+=Math.sin(tick*.04)*1.2; boss.y=20+Math.sin(tick*.07)*8;
      boss.x=Math.max(16,Math.min(128,boss.x));
      if(d<90){ player.kx+=(player.x-boss.x)/d*0.5; player.ky+=(player.y-boss.y)/d*0.45; }
      if((tick&3)===0) parts.push({x:boss.x+8,y:boss.y+14,vx:(Math.random()-.5)*2,vy:1,life:14,col:'#cfe8ff'});
      if(boss.t===30){ // telegrafía la embestida (enfurecido: dos remolinos)
        if(enemies.length<(enraged?2:1)){ enemies.push(spawnEnemy('gust',(boss.x/16)|0,5,1)); }
      }
      if(boss.t<=0){ boss.st='aim'; boss.t=enraged?26:34; }
    } else if(boss.st==='aim'){
      boss.row=player.y; // fija la altura del barrido
      if((tick&2)===0) parts.push({x:boss.x+8+(Math.random()-.5)*14,y:boss.y+8,vx:0,vy:0,life:10,col:'#fff'});
      if(boss.t<=0){ const sv=enraged?5:4;
        boss.st='sweep'; boss.x= player.x<80?-16:160; boss.vx=player.x<80?sv:-sv; boss.y=boss.row; SFX.ehit(); }
    } else if(boss.st==='sweep'){ // cruza la pantalla a tu altura
      boss.x+=boss.vx;
      if((tick&1)===0) parts.push({x:boss.x+8,y:boss.y+8,vx:-boss.vx*.4,vy:(Math.random()-.5),life:12,col:'#cfe8ff'});
      if(boss.x<-20||boss.x>164){ boss.st='rest'; boss.t=90; boss.x=Math.max(20,Math.min(120,player.x)); boss.y=96; SFX.bump(); shake=6; }
    } else { // rest: jadea en el suelo, VULNERABLE
      if((tick&7)===0) parts.push({x:boss.x+8,y:boss.y+4,vx:(Math.random()-.5)*.6,vy:-.4,life:10,col:'#9ec7e8'});
      if(!calmed&&boss.t<=0){ boss.st='float'; boss.t=enraged?90:120; }
    }
    // contacto (exhausto ya no hace daño)
    const bb=[boss.x+2,boss.y+3,12,11], pb=[player.x+4,player.y+8,8,8];
    if(!calmed&&player.inv===0&&rectsHit(bb,pb)){
      player.hp--; player.inv=60; shake=8; SFX.hurt(); hitStop=3;
      player.kx=(player.x-boss.x)/d*3.2; player.ky=(player.y-boss.y)/d*3.2;
      if(player.hp<=0) die();
    }
    // hoja: solo le hace daño cuando descansa, y nunca le remata
    if(meleeActive()&&boss.flash===0&&boss.st==='rest'&&rectsHit(meleeBox(),bb)){
      if(boss.hp>2){ boss.hp=Math.max(2,boss.hp-meleeDmg()); boss.flash=10; SFX.ehit(); hitStop=4; }
      else SFX.bump(); // la hoja lo atraviesa: ya no pelea
    }
  }
  // LA REINA AVISPA
  if(boss&&boss.type==='avispa'){
    if(boss.flash>0)boss.flash--;
    boss.t--;
    if(boss.st==='hover'){
      boss.x+=Math.sin(tick*.06)*1.1; boss.y=18+Math.sin(tick*.11)*6;
      boss.x=Math.max(16,Math.min(128,boss.x));
      if(boss.t<=0){ boss.st='aim'; boss.t=30; }
    } else if(boss.st==='aim'){ // telegrafía el picado
      if((tick&3)<2) parts.push({x:boss.x+8+(Math.random()-.5)*12,y:boss.y+14,vx:0,vy:.8,life:8,col:'#f8d030'});
      if(boss.t<=0){
        const d=Math.hypot(player.x+8-(boss.x+8),player.y+12-(boss.y+8))||1;
        boss.vx=(player.x+8-(boss.x+8))/d*2.6; boss.vy=(player.y+12-(boss.y+8))/d*2.6;
        boss.st='dive'; boss.t=40; SFX.ehit();
      }
    } else if(boss.st==='dive'){
      boss.x+=boss.vx; boss.y+=boss.vy;
      if(boss.y>=100||boss.t<=0||boss.x<8||boss.x>136){ boss.st='tired'; boss.t=85; boss.y=Math.min(100,boss.y); SFX.bump(); shake=4; }
    } else { // tired: en el suelo, vulnerable
      if(boss.t<=0){
        boss.st='hover'; boss.t=110; boss.cyc++;
        if(boss.cyc%2===1&&enemies.length<2){ // llama a una abeja
          enemies.push({type:'bat',x:boss.x,y:boss.y,hp:1,vx:0,vy:0,t:0,flash:0,kx:0,ky:0,homing:0,fast:1});
          SFX.blip();
        }
      }
    }
    // contacto y golpes
    const bb=[boss.x+2,boss.y+3,12,10], pb=[player.x+4,player.y+8,8,8];
    if(player.inv===0&&boss.st!=='tired'&&rectsHit(bb,pb)){
      player.hp--; player.inv=60; shake=8; SFX.hurt();
      const d=Math.hypot(player.x-boss.x,player.y-boss.y)||1;
      player.kx=(player.x-boss.x)/d*3; player.ky=(player.y-boss.y)/d*3;
      if(player.hp<=0) die();
    }
    if(meleeActive()&&boss.flash===0&&boss.st==='tired'&&rectsHit(meleeBox(),bb)){ boss.hp-=meleeDmg(); boss.flash=10; SFX.ehit(); hitStop=4; }
    if(boss.hp<=0){
      SFX.fanfare(); shake=12;
      puff(boss.x+8,boss.y+8,'#f8d030',16,2); puff(boss.x+8,boss.y+8,'#1a1410',10,1.5);
      pickups.push({kind:'tear',x:72,y:56,t:0});
      boss=null; boss2Done=true; projs=[]; save();
    }
  }
  // EL TOPO REAL
  if(boss&&boss.type==='topo'){
    if(boss.flash>0)boss.flash--;
    boss.t--;
    if(boss.st==='burrow'){
      const d=Math.hypot(player.x-boss.mx,player.y-boss.my)||1;
      boss.mx+=(player.x-boss.mx)/d*0.9; boss.my+=(player.y-boss.my)/d*0.9;
      boss.mx=Math.max(20,Math.min(124,boss.mx)); boss.my=Math.max(20,Math.min(92,boss.my));
      if((tick&3)===0) parts.push({x:boss.mx+4+Math.random()*8,y:boss.my+14,vx:(Math.random()-.5)*.8,vy:-.6,life:10,col:'#5a4a40'});
      if(boss.t<=0){ boss.st='warn'; boss.t=28; }
    } else if(boss.st==='warn'){
      if((tick&1)===0) parts.push({x:boss.mx+8+(Math.random()-.5)*10,y:boss.my+14,vx:0,vy:-.8,life:8,col:'#6e5a4c'});
      if(boss.t<=0){
        boss.st='up'; boss.t=85; boss.x=boss.mx; boss.y=boss.my;
        SFX.edie(); shake=6; puff(boss.x+8,boss.y+12,'#5a4a40',10,1.5);
      }
    } else { // up: lanza rocas y es vulnerable
      if(boss.t===60||boss.t===40){
        const d=Math.hypot(player.x+8-(boss.x+8),player.y+12-(boss.y+8))||1;
        projs.push({x:boss.x+8,y:boss.y+8,vx:(player.x+8-(boss.x+8))/d*1.5,vy:(player.y+12-(boss.y+8))/d*1.5,t:90});
        SFX.ehit();
      }
      // contacto
      const bb=[boss.x+2,boss.y+3,12,10], pb=[player.x+4,player.y+8,8,8];
      if(player.inv===0&&rectsHit(bb,pb)){
        player.hp--; player.inv=60; shake=8; SFX.hurt();
        const d=Math.hypot(player.x-boss.x,player.y-boss.y)||1;
        player.kx=(player.x-boss.x)/d*3; player.ky=(player.y-boss.y)/d*3;
        if(player.hp<=0) die();
      }
      // hoja
      if(meleeActive()&&boss.flash===0&&rectsHit(meleeBox(),bb)){ boss.hp-=meleeDmg(); boss.flash=10; SFX.ehit(); hitStop=4; }
      if(boss.t<=0){ boss.st='burrow'; boss.t=100+hash(tick,7)%60; boss.mx=boss.x; boss.my=boss.y; }
    }
    if(boss.hp<=0){
      SFX.fanfare(); shake=12;
      puff(boss.x+8,boss.y+8,'#7a5a38',16,2); puff(boss.x+8,boss.y+8,'#e8d8c0',10,1.5);
      pickups.push({kind:'ember',x:boss.x,y:boss.y,t:0});
      boss=null; bossDone=true; projs=[]; save();
    }
  }

  // recogibles
  for(const p of pickups){ p.t++; }
  pickups=pickups.filter(p=>{
    const cx=p.kind==='blade'?8:4;
    const d=Math.hypot(p.x+cx-(player.x+8), p.y+cx-(player.y+12));
    if(d<(p.kind==='blade'?12:11)){
      if(p.kind==='seed'){
        seeds++; collected.add(p.id); SFX.seed(); puff(p.x+4,p.y+4,C.flowerC,8,1.2); save();
        if(seeds>=8&&!announced8){ announced8=true; say(TXT.allSeeds); }
      } else if(p.kind==='key'){
        keysHeld++; collected.add(p.id); SFX.heart(); puff(p.x+4,p.y+4,PAL.a,8,1.2);
        say(["¡Una LLAVE-BELLOTA!\nAbre una verja con\ncerrojo de raíz."]); save();
      } else if(p.kind==='diary'){
        collected.add(p.id); SFX.heart(); puff(p.x+4,p.y+4,'#e8d0a0',8,1);
        say(DIARY[sx+','+sy]||["(Una hoja de\ndiario ilegible.)"]); save();
      } else if('blade bomb ember hook tear flake'.includes(p.kind)){
        if(p.kind==='blade'){ hasBlade=true; itemSpr=BLADE_SPR; itemPages=TXT.bladeGet; }
        if(p.kind==='bomb'){ hasBomb=true; itemSpr=BOMB_SPR; itemPages=TXT.bombGet; }
        if(p.kind==='ember'){ hasEmber=true; itemSpr=EMBER_SPR; itemPages=TXT.emberGet; }
        if(p.kind==='hook'){ hasHook=true; itemSpr=HOOK_SPR; itemPages=TXT.hookGet; }
        if(p.kind==='tear'){ hasTear=true; itemSpr=TEAR_SPR; itemPages=TXT.tearGet; }
        if(p.kind==='flake'){ hasFlake=true; itemSpr=FLAKE_SPR; itemPages=TXT.flakeGet; }
        SFX.fanfare(); shake=6; state='itemget'; itemT=110;
        player.dir=0; player.atk=0; save();
        puff(p.x+8,p.y+8,C.flowerC,14,1.6); puff(p.x+8,p.y+8,PAL.l,10,1.2);
      } else if(p.kind==='berry'){
        berries=Math.min(99,berries+1); SFX.blip(); puff(p.x+4,p.y+4,'#d84878',5,.9);
      } else if(p.kind==='container'){
        player.maxHp+=2; player.hp=player.maxHp; collected.add(p.id);
        SFX.fanfare(); puff(p.x+4,p.y+4,PAL.R,12,1.5); say(TXT.containerGet); save();
      } else { player.hp=Math.min(player.maxHp,player.hp+2); SFX.heart(); puff(p.x+4,p.y+4,PAL.R,6,1); }
      return false;
    } return true;
  });

  // los arbustos que guardan semilla BRILLAN
  if((tick%45)===0){
    for(let y=0;y<SH;y++) for(let x=0;x<SW;x++) if(grid[y][x]==='Q')
      parts.push({x:x*16+5+Math.random()*6,y:y*16+3,vx:0,vy:-.3,life:20,col:C.flowerC});
  }

  updEnemies();
  updParts();

  // puertas y salidas
  if(sx===8||sx===9||(sx>=6&&sy===0)||(sx===10&&sy===2)){
    const htx=(player.x+8)>>4, hty=(player.y+13)>>4;
    if(grid[hty]&&grid[hty][htx]==='x'){
      if(sx===9) exitHouse();
      else if(sx===8) exitShop();
      else if(sx===10&&sy===2) placeAt(10,1,68,18,0); // del panal al canal
      else exitDungeon();
      return;
    }
  } else if(sx===10&&sy===1){
    const htx=(player.x+8)>>4, hty=(player.y+13)>>4;
    if(grid[hty]&&grid[hty][htx]==='>'){ placeAt(10,2,72,24,0); return; } // bajar al panal
  } else if(keys.up&&player.dir===1){
    const ft=facingTile();
    if(ft&&ft[2]==='D'&&sx===0&&sy===1&&ft[0]===3){ enterHouse(); return; }
    if(ft&&ft[2]==='D'&&sx===0&&sy===1&&ft[0]===7){ enterShop(); return; }
    if(ft&&ft[2]==='G'){ enterDungeon(); return; }
  }

  // bordes de pantalla → transición (bloqueada mientras un jefe vive: no se abandona la arena)
  if(boss){
    player.x=Math.max(2,Math.min(160-16,player.x));
    player.y=Math.max(2,Math.min(128-20,player.y));
  } else if(player.x<-2) startTransition(-1,0);
  else if(player.x>160-14) startTransition(1,0);
  else if(player.y<-5) startTransition(0,-1);
  else if(player.y>128-22){
    // en el pico, el viento NO debe empujarte de vuelta abajo: solo bajas si lo pides
    if(sy<=-2&&!keys.down){ player.y=128-22; player.ky=Math.min(0,player.ky); }
    else startTransition(0,1);
  }
}
function updParts(){
  for(const p of parts){ p.x+=p.vx; p.y+=p.vy; p.vy+=.02; p.life--; }
  parts=parts.filter(p=>p.life>0);
}

