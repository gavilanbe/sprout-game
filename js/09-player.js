'use strict';
/* ---------- JUGADOR: movimiento, Hoja, objetos e interacción ---------- */
function solidCorners(x,y,w,h){ let n=0; if(solidAt(x,y))n++; if(solidAt(x+w-1,y))n++; if(solidAt(x,y+h-1))n++; if(solidAt(x+w-1,y+h-1))n++; return n; }
function tryMove(dx,dy){
  const HX=4,HY=8,HW=8,HH=8; // hitbox en los pies
  const cur=solidCorners(player.x+HX,player.y+HY,HW,HH);
  if(cur>0){ // válvula de escape: si estás incrustado, todo paso que no empeore vale
    let nx=player.x+dx; if(solidCorners(nx+HX,player.y+HY,HW,HH)<=cur) player.x=nx;
    let ny=player.y+dy; if(solidCorners(player.x+HX,ny+HY,HW,HH)<=cur) player.y=ny; return; }
  let nx=player.x+dx; if(boxFree(nx+HX,player.y+HY,HW,HH)) player.x=nx;
  else { // deslizamiento en esquinas: si solo choca una esquina, resbala
    const top=solidAt(nx+HX,player.y+HY), bot=solidAt(nx+HX,player.y+HY+HH-1), top2=solidAt(nx+HX+HW-1,player.y+HY), bot2=solidAt(nx+HX+HW-1,player.y+HY+HH-1);
    if((top||top2)&&!(bot||bot2)&&boxFree(nx+HX,player.y+HY+1,HW,HH)&&dy===0){ player.y+=Math.abs(dx)*.7; player.x=nx; }
    else if((bot||bot2)&&!(top||top2)&&boxFree(nx+HX,player.y+HY-1,HW,HH)&&dy===0){ player.y-=Math.abs(dx)*.7; player.x=nx; }
  }
  let ny=player.y+dy; if(boxFree(player.x+HX,ny+HY,HW,HH)) player.y=ny;
  else {
    const l=solidAt(player.x+HX,ny+HY)||solidAt(player.x+HX,ny+HY+HH-1), r=solidAt(player.x+HX+HW-1,ny+HY)||solidAt(player.x+HX+HW-1,ny+HY+HH-1);
    if(l&&!r&&boxFree(player.x+HX+1,ny+HY,HW,HH)&&dx===0){ player.x+=Math.abs(dy)*.7; player.y=ny; }
    else if(r&&!l&&boxFree(player.x+HX-1,ny+HY,HW,HH)&&dx===0){ player.x-=Math.abs(dy)*.7; player.y=ny; }
  }
}
const DIRV=[[0,1],[0,-1],[-1,0],[1,0]];
function facingTile(){
  const cx=player.x+8, cy=player.y+12;
  const D=[[0,11],[0,-9],[-10,0],[10,0]][player.dir];
  const tx=(cx+D[0])>>4, ty=(cy+D[1])>>4;
  if(tx<0||ty<0||tx>=SW||ty>=SH) return null;
  return [tx,ty,grid[ty][tx]];
}
function playerTile(){ return [(player.x+8)>>4,(player.y+12)>>4]; }
/* la Hoja: caja de golpe según dirección (barrido amplio) */
function swordBox(){ const px=player.x, py=player.y;
  return [[px-2,py+10,20,14],[px-2,py-9,20,14],[px-11,py+1,16,16],[px+11,py+1,16,16]][player.dir]; }
function meleeBox(){ return player.spin>0?(hasBigSpin?[player.x-22,player.y-20,60,60]:[player.x-14,player.y-12,44,44]):swordBox(); }
function meleeActive(){ return (player.atk>3&&player.atk<12)||player.spin>6; }
function meleeDmg(){ return bladeLvl+(hasAmulet('erizo')?1:0)+(player.spin>0?1:0); }
function doSpin(){
  player.spin=spinMax(); player.charge=0; SFX.sword(); noise(.16,.06,true); shake=hasBigSpin?4:2; spinFx();
  for(let i=0;i<10;i++){ const a=i/10*6.283; parts.push({x:player.x+8+Math.cos(a)*8,y:player.y+9+Math.sin(a)*8,vx:Math.cos(a)*1.4,vy:Math.sin(a)*1.4,life:14,col:i%2?PAL.l:'#a8ec78'}); }
  const D=DIRV[player.dir]; const far=hasAmulet('susurro');
  windProjs.push({x:player.x+8,y:player.y+10,vx:D[0]*(far?2.6:2.1),vy:D[1]*(far?2.6:2.1),t:(far?110:70)+(hasBigSpin?30:0),ang:0,hits:new Set(),big:hasBigSpin});
}
/* empuje de rocas-raíz: encarado y avanzando un instante */
let pushHold=0, pushLatch=false; // un empujón por pulsación: hay que soltar la cruceta para volver a empujar
const plateCells=new Set();
function tryPushBlock(){
  const ft=facingTile(); if(!ft||ft[2]!=='#'){ pushHold=0; return; }
  if(pushLatch) return;
  const [tx,ty]=ft;
  const dxc=(player.x+8)-(tx*16+8), dyc=(player.y+12)-(ty*16+10);
  const off=(player.dir<2)?Math.abs(dxc):Math.abs(dyc); if(off>9){ pushHold=0; return; }
  if(player.dir<2) player.x+=(tx*16-player.x)*0.4; else player.y+=(ty*16-4-player.y)*0.4;
  if(++pushHold<9) return;
  const D=DIRV[player.dir], dx=tx+D[0], dy=ty+D[1];
  if(dx<0||dy<0||dx>=SW||dy>=SH){ pushHold=0; return; }
  const dest=grid[dy][dx];
  if(dest!=='_'&&dest!==regionFloor()&&dest!=='q'){ pushHold=0; return; }
  if(enemies.some(e=>Math.abs(e.x-dx*16)<10&&Math.abs(e.y-dy*16)<10)){ pushHold=0; return; }
  pushHold=0; pushLatch=true;
  grid[ty][tx]=plateCells.has(tx+','+ty)?'_':regionFloor();
  grid[dy][dx]='#'; markDirty();
  if(player.dir===0){ player.x=tx*16; player.y=ty*16-4; } else if(player.dir===1){ player.x=tx*16; player.y=ty*16+4; }
  else if(player.dir===2){ player.y=ty*16-4; player.x=tx*16+4; } else { player.y=ty*16-4; player.x=tx*16-4; }
  SFX.bump(); puff(tx*16+8,ty*16+12,'#8a7460',5,.8);
  checkPlates();
}
function checkPlates(){
  if(plateCells.size===0||opened.has('PZ'+sx+','+sy)) return;
  for(const c of plateCells){ const [x,y]=c.split(',').map(Number); if(grid[y][x]!=='#') return; }
  opened.add('PZ'+sx+','+sy); SFX.puzzle(); shake=4;
  let gate=false;
  for(let y=0;y<SH;y++) for(let x=0;x<SW;x++) if(grid[y][x]==='='){ grid[y][x]='q'; gate=true; puff(x*16+8,y*16+8,'#8a7048',6,1.2); }
  if(!gate){ // sin verja: cae una llave en el centro de la sala
    const id='('+sx+','+sy+',5,3'; if(!collected.has(id)) pickups.push({kind:'key',id,x:5*16+4,y:3*16+4,t:0,drop:20}); }
  markDirty(); save();
}
function openGates(){ for(let y=0;y<SH;y++) for(let x=0;x<SW;x++){ if(grid[y][x]==='=') { grid[y][x]='q'; puff(x*16+8,y*16+8,'#8a7048',6,1.2); } } markDirty(); }
/* cortar hierba y arbustos en una caja */
function cutAt(sb){
  let any=false;
  for(let y=0;y<SH;y++) for(let x=0;x<SW;x++){
    const ch=grid[y][x];
    if(!rectsHit(sb,[x*16+3,y*16+3,10,10])) continue;
    if(ch==='ø'){ grid[y][x]='>'; opened.add('HS'+sx+','+sy); SFX.cut(); leaves(x*16+8,y*16+8); SFX.secret(); shake=3; any=true;
      for(let i=0;i<6;i++) sparkle(x*16+3+Math.random()*10,y*16+2+Math.random()*10,PAL.Y); showToast('¡UNA ESCALERA!','bajo el arbusto'); save(); }
    else if(ch==='b'||ch==='Q'){
      grid[y][x]=under(grid,x,y); SFX.cut(); leaves(x*16+8,y*16+8); any=true;
      if(ch==='Q'){ const id='Q'+sx+','+sy+','+x+','+y; cutQ.add(id);
        if(!collected.has(id)) pickups.push({kind:'seed',id,x:x*16+4,y:y*16+4,t:0}); }
      else dropLoot(x*16+4,y*16+4,.12,.3);
    } else if(ch==='t'){
      grid[y][x]='.'; SFX.grass(); any=true;
      const P=BIOMES[screenBiome(sx,sy)].grass; bladeBits(x*16+8,y*16+10,[P[0],P[1],P[2],P[3]],10);
      dropLoot(x*16+4,y*16+4,.06,.14);
    } else if(ch==='¢'){ toggleCrystal(); any=true; }
    else if(ch==='♣'){ cutBellotero(x,y); any=true; }
  }
  if(any) markDirty();
}
function dropLoot(x,y,pHeart,pBerry){
  const r=Math.random(); const mult=hasAmulet('savia')?2:1;
  if(hasAmulet('trebol')){ pHeart*=1.35; pBerry*=1.5; } // el Trébol de cuatro hojas: la suerte de verdad
  pHeart*=dungeonOf(sx,sy)?.7:.85; if((opts.diff??1)===0) pHeart*=1.6; if(player.hp<=2) pHeart=Math.min(.4,pHeart*1.8); // piedad, pero menos
  const pBomb=hasBomb&&bombAmmo<bombMax?(bombAmmo<3?.2:.1):0;
  if(r<pHeart) pickups.push({kind:'heart',x,y,t:0,drop:14});
  else if(r<pHeart+pBomb) pickups.push({kind:'bombs',n:2,x,y,t:0,drop:14});
  else if(r<pHeart+pBomb+pBerry*mult) pickups.push({kind:'berry',x,y,t:0,drop:14});
}
function toggleCrystal(){
  crystalOn=!crystalOn; if(crystalOn) opened.add('CR'+sx+','+sy); else opened.delete('CR'+sx+','+sy);
  for(let y=0;y<SH;y++) for(let x=0;x<SW;x++){ const ch=grid[y][x]; const m={'ª':'º','º':'ª','Æ':'æ','æ':'Æ'}[ch]; if(m) grid[y][x]=m; }
  // si un bloque sube debajo del jugador, lo aparta
  const [ptx,pty]=playerTile(); if(grid[pty]&&isSolid(grid[pty][ptx])){ [player.x,player.y]=findFree(player.x,player.y,'x'); }
  SFX.crystal(); shake=3; markDirty(); save();
}
function lightTorch(tx,ty){ grid[ty][tx]=';'; SFX.torch(); puff(tx*16+8,ty*16+4,'#f8a030',8,1.2); markDirty();
  if(boss&&boss.type==='viento'){ vientoBrazierLit(); return; }
  opened.add('T'+sx+','+sy+':'+tx+','+ty);
  let all=true; for(let y=0;y<SH;y++) for(let x=0;x<SW;x++) if(grid[y][x]===':') all=false;
  if(all){ opened.add('G'+sx+','+sy); SFX.puzzle(); shake=4; openGates(); showToast('¡LAS ANTORCHAS ARDEN!','la verja se abre'); }
  save();
}
/* ---------- Z: hablar / abrir / golpear ---------- */
function attack(){
  if(inBed){ inBed=false; puff(player.x+8,player.y+12,'#3a2410',8,1.1); noise(.1,.04,false); return; }
  // el Viento exhausto se recuerda (Z a su lado)
  if(boss&&boss.type==='viento'&&boss.hp<=2&&boss.st==='rest'&&Math.hypot(player.x-boss.x-8,player.y-boss.y-8)<34){
    say(WIND_PEACE,()=>{ SFX.fanfare(); shake=14;
      puff(boss.x+16,boss.y+16,'#dff0ff',18,2); puff(boss.x+16,boss.y+16,'#9ec7e8',12,1.6);
      pickups.push({kind:'flake',x:boss.x+8,y:boss.y+8,t:0});
      boss=null; boss3Done=true; enemies=[]; projs=[]; save(); setTrack('cima'); },'EL VIENTO');
    return;
  }
  if(boss&&boss.type==='ciervo'&&boss.st==='yield'&&Math.hypot(player.x-boss.x-8,player.y-boss.y-8)<40){ ciervoPeace(); return; } // el Ciervo de Ámbar (12b)
  if(boss&&boss.st==='yield'&&Math.hypot(player.x-boss.x-8,player.y-boss.y-8)<36){
    const isTopo=boss.type==='topo', bx=boss.x, by=boss.y;
    say(isTopo?TOPO_PEACE:QUEEN_PEACE,()=>{ SFX.fanfare(); shake=10;
      puff(bx+16,by+16,isTopo?'#7a5a38':'#f8d030',16,2); puff(bx+16,by+16,isTopo?'#e8d8c0':'#1a1410',10,1.5);
      pickups.push({kind:isTopo?'ember':'tear',x:bx+8,y:by+8,t:0});
      if(isTopo) bossDone=true; else boss2Done=true;
      boss=null; enemies=[]; projs=[]; save(); setTrack('cueva'); },isTopo?'EL TOPO REAL':'LA REINA');
    return;
  }
  const ft=facingTile();
  if(ft&&interact(ft)) return;
  if(!hasBlade){
    if(noBladeMsg<2){ noBladeMsg++; say(["Manoteas el aire\nsin mucho efecto...","Necesitas la HOJA\nANCESTRAL.\n(playa suroeste)"]); }
    else SFX.bump(); return;
  }
  player.atk=14; SFX.sword(); player.squash=.28; leafBeamTry();
}
function interact([tx,ty,ch]){
  if(tradeInteract(tx,ty,ch)) return true; // trueques, el tesoro de las dunas y la pesca (12c)
  const guest=npcs.find(n=>n.guest&&n.x===tx&&n.y===ty);
  if(guest){ SFX.blip();
    if(guest.guest==='topo'){ if(!topoGift){ topoGift=true; say(TOPO_AFTER,()=>giveAmulet('topo'),'EL TOPO REAL'); } else say(GUEST_TALK.topo(),null,'EL TOPO REAL'); }
    else if(guest.guest==='avispa') say(GUEST_TALK.avispa(),null,'LA REINA');
    else if(guest.guest==='ciervo') say(GUEST_TALK.ciervo(),null,'EL CIERVO');
    else say(GUEST_TALK.viento(),null,'EL VIENTO');
    return true; }
  if(ch==='S'){ SFX.blip(); say(TXT.signs[sx+','+sy]||TXT.sign,null,null,'wood'); return true; }
  if(ch==='O'){ SFX.blip(); if(RUNAS[sx+','+sy]&&!collected.has('r:'+sx+','+sy)){ collected.add('r:'+sx+','+sy); showToast('RECUERDO ANOTADO','piedra rúnica'); save(); } say(RUNAS[sx+','+sy]||["Runas gastadas.\nNo se leen."],null,null,'stone'); return true; }
  if(ch==='Ⓑ'){ const b=BOOKS[sx+','+sy]; SFX.blip(); if(!b){ say(["Libros de cuentas\ny catálogos de\nsemillas. Nada\nque leer."],null,null,'paper'); return true; }
    if(!collected.has('b:'+sx+','+sy)){ collected.add('b:'+sx+','+sy); showToast('RECUERDO ANOTADO',b.title.slice(0,17)); save(); } say(b.pages,null,null,'paper'); return true; }
  if(ch==='Ω'){ SFX.blip();
    if(wellDone){ say(["El pozo. El agua\nsigue brillando,\npero ya no\nresponde."]); return true; }
    if(berries<20){ say(WELL_TALK.concat([WELL_ASK[0],"(No llevas 20\nbayas.)"])); return true; }
    ask(WELL_TALK.concat(WELL_ASK),null,yes=>{ if(!yes){ say(["(Las bayas se\nquedan en tu\nzurrón.)"]); return; }
      berries-=20; wellDone=true; SFX.blip(); noise(.3,.05,false); save();
      say(WELL_DONE,()=>{ pickups.push({kind:'piece',id:'♥pozo',x:player.x+4,y:player.y+4,t:0,drop:20}); SFX.secret(); }); }); return true; }
  if(ch==='['){ SFX.blip(); say(thawed?["ALTAR DE LA\nPRIMAVERA.","La BRASA late aquí\nsu calor de\ndeshielo. El valle\nlo siente."]:["ALTAR DE LA\nPRIMAVERA.","El cuenco está\nfrío. Espera algo\nque lata como un\ncorazón."]); return true; }
  if(ch===']'){ SFX.blip(); say(summered?["ALTAR DEL\nVERANO.","La LÁGRIMA brilla\nfresca y tibia.\nEl sol dormido\ndespertó en ella."]:["ALTAR DEL\nVERANO.","El cuenco está\nseco. Espera un\nllanto que el sol\nquiera habitar."]); return true; }
  if(ch==='{'){ SFX.blip(); say(autumned?["ALTAR DEL OTOÑO.","La HOJA DE ÁMBAR arde quieta, sin quemarse. Huele a castañas y a lluvia."]:["ALTAR DEL OTOÑO.","Hojas secas en el cuenco. Espera algo dorado que sepa caer despacio."]); return true; }
  if(ch==='ξ'){ SFX.blip(); say(sx===4&&sy===3&&!summered?["Un montón de hojas podridas, empapadas de ciénaga.","Tapan una puerta. Quizá el calor del VERANO las seque."]:hasPinwheel?["Hojarasca apilada. Un buen soplo de MOLINILLO (X) la barrería."]:["Hojarasca apilada, alta como tú. La Hoja la atraviesa sin moverla.","Haría falta VIENTO para barrerla."]); return true; }
  if(ch==='∩'){ SFX.blip(); say(hasPinwheel?["Un ventisquero de nieve dura. Sopla con el MOLINILLO (X) para abrir paso."]:["Un ventisquero de nieve dura cierra el sendero.","Ni la Hoja ni las bombas lo mueven: se necesita VIENTO."]); return true; }
  if(ch==='ψ'){ SFX.blip(); say(["Una rueda de aspas de madera clavada en el suelo.","Gira con el viento. Algo en la sala escucha su chirrido."]); return true; }
  if(ch==='}'){ SFX.blip(); say(cycled?["ALTAR DEL\nINVIERNO.","El COPO no se\nderrite. Aquí\nvive el nombre del\nVIENTO DEL NORTE."]:["ALTAR DEL\nINVIERNO.","Está junto al del otoño, apartado de los del Roble, como esperando a alguien que no vuelve."]); return true; }
  if(ch==='g'||(ch==='ñ'&&sx===8)){ openShop('tilo'); return true; }
  if(ch==='ö'||(ch==='ñ'&&sx===7)){ openShop('corteza'); return true; }
  if(ch==='j'&&hasBlade&&!hasBoomer&&berries>=10){ SFX.blip();
    ask(["Traes 10 BAYAS...\n¿Me las das para\nmi invento\nvolador?"],'LUPA',yes=>{
      if(yes){ berries-=10; SFX.fanfare(); save(); say(["¡Trato es trato,\nbrote!","Una vaina de\nsemilla curvada:\n¡la VAINA VOLADORA!"],()=>getItem('boomer'),'LUPA'); }
      else say(["Sin prisa, brote.\nAquí estaré."],null,'LUPA'); });
    return true; }
  if(ch==='y'&&summered&&!mossGift){ SFX.blip(); mossGift=true;
    say(["¡Brote! Los peces\nvolvieron gracias\na ti.","Toma: una piel de\nrana que pesqué\nhace años. Con\nella el barro no\nte frena."],()=>giveAmulet('rana'),'MOSS'); return true; }
  if(ch==='y'&&hasBlade&&berries>=5&&player.hp<=player.maxHp-2){ SFX.blip();
    ask(["Mal aspecto traes.\n¿Sopa de pescador\npor 5 BAYAS?\nCura del todo."],'MOSS',yes=>{
      if(yes){ berries-=5; player.hp=player.maxHp; SFX.heart(); save(); say(["5 bayas, marchando\nsopa de pescador...","¡Como nuevo,\nbrote!"],null,'MOSS'); }
      else say(["Tú mismo. La olla\nsigue al fuego."],null,'MOSS'); });
    return true; }
  if(NPCS[ch]){ SFX.blip(); say(NPC_TALK[ch](),null,NPCS[ch].name.toUpperCase()); return true; }
  if(ch==='D'){
    if(sx===0&&sy===1&&tx===3){ enterHouse(); return true; }
    if(sx===0&&sy===1&&tx===7){ enterShop(); return true; }
    if(sx===2&&sy===0){ placeAt(7,9,76,90,1); return true; }
    SFX.blip(); say(TXT.door); return true; }
  if(ch==='G'){ enterDungeon(); return true; }
  if(ch===')'){ const dk=dungeonOf(sx,sy)||'x';
    if((dungeonKeys[dk]||0)>0){ dungeonKeys[dk]--; SFX.unlock(); shake=3;
      for(let dyy=-2;dyy<=2;dyy++) for(let dxx=-2;dxx<=2;dxx++){ const cx=tx+dxx, cy=ty+dyy;
        if(cy>=0&&cy<SH&&cx>=0&&cx<SW&&grid[cy][cx]===')'&&(dxx===0||dyy===0)){ grid[cy][cx]='q'; opened.add('LK'+sx+','+sy+':'+cx+','+cy); puff(cx*16+8,cy*16+8,PAL.a,6,1); } }
      markDirty(); save(); }
    else { SFX.bump(); say(["Cerrado con un\ncerrojo de bellota.\nNecesitas una\nLLAVE-BELLOTA."]); }
    return true; }
  if(ch==='Ł'){ const dk=dungeonOf(sx,sy)||'x';
    if(bigKeys[dk]){ SFX.unlock(); shake=5; opened.add('BK'+sx+','+sy);
      for(let y=0;y<SH;y++) for(let x=0;x<SW;x++) if(grid[y][x]==='Ł'){ grid[y][x]='q'; puff(x*16+8,y*16+8,PAL.y,8,1.2); }
      markDirty(); save(); }
    else { SFX.bump(); say(["La puerta del\nguardián. Un\ncerrojo dorado la\nsella.","Necesitas la\nLLAVE GRANDE."]); }
    return true; }
  if(ch==='¤'){ const id='CH'+sx+','+sy+':'+tx+','+ty;
    if(opened.has(id)){ SFX.bump(); return true; }
    const c=CHESTS[sx+','+sy+':'+tx+','+ty]; opened.add(id); markDirty(); SFX.secret(); save();
    openChestContent(c);
    return true; }
  if(ch==='E'){ elderTalk(); return true; }
  if(ch===':'&&xItem!=='lantern'&&hasLantern){ say(["Una antorcha\napagada. Equipa\nel FAROL y úsalo\ncon X."]); return true; }
  if(ch==='k'&&!hasHook){ say(["Un poste de raíz.\nAlgo podría\nagarrarse aquí."]); return true; }
  if(ch==='C'&&!hasBomb){ SFX.bump(); say(["Una roca\nagrietada. Con\nalgo que estalle\ncedería."]); return true; }
  if(ch==='P'){ ask(["¿Echar una\nsiesta en la\nmaceta?"],null,yes=>{ if(yes){ player.hp=player.maxHp; SFX.heart(); fadeIn=40; save(); say(["Sueñas con hojas\nnuevas. ¡Vigor\nrestaurado!"]); } }); return true; }
  return false;
}
function elderTalk(){
  SFX.blip(); const sayR=(p,cb)=>say(p,cb,'RAÍZ');
  if(!elderMet){ elderMet=true; save(); sayR(TXT.elderIntro); return; }
  if(lettersCount()>=5&&!lettersGiven){ lettersGiven=true; save(); sayR(RAIZ_LETTERS,()=>giveAmulet('susurro')); return; }
  if(seeds>=8&&!won){ giveItem(ACORN_GOLD,8,()=>sayR(TXT.elderWin,()=>{ won=true; SFX.fanfare(); bloom(); markDirty(); save(); })); return; }
  const seasonCine=(k,cb)=>{ if(typeof playSeasonCinematic==='function') playSeasonCinematic(k,cb); else cb(); };
  if(hasEmber&&!thawed){ giveItem(EMBER_SPR,1,()=>{ thawed=true; bloom(); save(); seasonCine('primavera',()=>sayR(TXT.thaw,()=>{ SFX.fanfare(); save(); })); }); return; }
  if(hasTear&&!summered){ giveItem(TEAR_SPR,1,()=>{ summered=true; bloom(); save(); seasonCine('verano',()=>sayR(TXT.summer,()=>{ SFX.fanfare(); save(); })); }); return; }
  if(hasAmber&&!autumned){ giveItem(AMBER_SPR,1,()=>{ autumned=true; bloom(); markDirty(); save(); seasonCine('otono',()=>sayR(TXT.autumn,()=>{ SFX.fanfare(); save(); })); }); return; }
  if(hasFlake&&!cycled&&!autumned){ sayR(["¿El Copo...? Aún no, brote. El OTOÑO sigue preso en el MOLINO de la Ciénaga.","Sin otoño, el invierno no tiene dónde posarse. Tráeme primero la HOJA DE ÁMBAR."]); return; }
  if(hasFlake&&!cycled){ giveItem(FLAKE_SPR,1,()=>{ cycled=true; bloom(); markDirty(); save(); seasonCine('invierno',()=>sayR(TXT.cycle,()=>{ SFX.fanfare(); save();
      const toCredits=()=>{ state='credits'; creditsT=0; parts=[]; setTrack('creditos'); }; if(typeof playEnding==='function') playEnding(toCredits); else toCredits(); })); }); return; }
  if(cycled) sayR(["Las cuatro\nestaciones giran.\nEl valle respira.","¿Aún no lo ves,\nbrote? Mírame\nbien. Mira el árbol.","Yo SOY el Roble.\nViejo y plantado,\nsoñando este valle.","Y tú creciste de\nmi última bellota,\nla novena...","...la única que mi\nhermano Viento\nnunca encontró.","Gracias por traer\na casa a tus\nhermanas. ♥"].concat(opened.has('ECO4,12')?[]:["Una cosa más, brote. Desde que el año gira, algo resuena en la GRUTA DE LOS ECOS, bajo los riscos del noroeste.","Son los ecos de quienes guardaron las estaciones. No hablan ni ceden. Si buscas un desafío... baja a verlos."]));
  else if(autumned&&boss3Done) sayR(["¿Ese frío azul en\ntu zurrón...?\n¡El Copo! Tráelo."]);
  else if(autumned) sayR(["Solo queda el INVIERNO, en el pico del norte.","Un VENTISQUERO tapa el Sendero del Último Invierno: tu MOLINILLO lo barrerá.","Necesitarás también bomba, gancho y el farol de Tilo para cruzar el TEMPLO DE LA CIMA. No subas a luchar: sube a recordar."]);
  else if(summered&&boss4Done) sayR(["¿Ese brillo dorado en tu zurrón...? ¡La HOJA DE ÁMBAR! Tráemela, brote."]);
  else if(summered) sayR(["El otoño se ha refugiado en el viejo MOLINO de la Ciénaga, al este de las marismas.","Lo guarda el CIERVO DE ÁMBAR, un viejo amigo de mi hermano. No es malo, brote: está cansado.","Las hojas podridas que tapaban la puerta ya se han secado con el verano."]);
  else if(thawed&&boss2Done) sayR(["¿Un brillo azul en\ntu zurrón? ¡Corre,\ntráemelo!"]);
  else if(thawed) sayR(["El sur huele a\notoño viejo...","Hay rocas agrieta-\ndas en la playa\neste. Tus bombas","saben qué hacer.\nBusca el TRONCO\nHUECO, brote."]);
  else if(won&&bossDone) sayR(["¿Esa luz en tu\nzurrón...?\n¡Corre, tráela!"]);
  else if(won) sayR(["¿Ves la copa? Tus\nsemillas brillan\nen ella otra vez.","Pero oigo aullar\nalgo en las\nmontañas del norte.","Dicen que el TOPO\nREAL guarda la\nBRASA DE PRIMAVERA.","La zarza seca del\nnoroeste ya no\nte cierra el paso.\nVe, brote."]);
  else if(!hasBlade) sayR(TXT.elderIntro);
  else if(seeds===0) sayR(TXT.elderBlade);
  else sayR(["Llevas "+seeds+" de 8\nsemillas. Atento:","A la vista: riscos\nNO, claro del\nbosque, orilla de\nMoss,","camino sur y\ndunas del este.","Brillan arbustos:\nbosque, juncal\nnorte y playa\nsuroeste."]);
}
function giveAmulet(id){ amulets.add(id); const a=AMULETS[id]; SFX.fanfare(); shake=4;
  itemSpr=AMULET_SPR[id]; itemPages=TXT.amuletGet(a); state='itemget'; itemT=100; itemCardName=a.name; player.dir=0; player.atk=0;
  puff(player.x+8,player.y,C.flowerC,12,1.4); save(); }
/* ---------- X: el objeto equipado ---------- */
function useItem(){
  if(xItem) xFlash=10;
  if(!xItem) { if(hasBomb||hasHook||hasBoomer||hasLantern||hasFeather||hasPinwheel){ showToast('SIN OBJETO EN X','equípalo en el zurrón'); } return; }
  if(xItem==='bomb'){
    if(bombs.length>=2) return;
    if(bombAmmo<=0){ SFX.empty(); showToast('SIN BELLOTAS','corta un bellotero ♣'); return; }
    bombAmmo--;
    const bx=((player.x+8)>>4)*16, by=((player.y+12)>>4)*16;
    bombs.push({x:bx,y:by,t:80}); SFX.blip();
  } else if(xItem==='hook'){ throwHook(); }
  else if(xItem==='boomer'){ if(keys.altHeld&&!boomer) boomerCharge=1; else throwBoomer(); } // mantén X para cargarla
  else if(xItem==='lantern'){
    const ft=facingTile();
    if(ft&&ft[2]===':'){ lightTorch(ft[0],ft[1]); }
    else lanternFlame();
  } else if(xItem==='feather'){ startJump(); }
  else if(xItem==='molinillo'){ usePinwheel(); }
}
function throwHook(){
  const D=DIRV[player.dir], [ptx,pty]=playerTile();
  if(hookBoss(D)) return;
  if(hookGrab(D)) return;
  const isWater=c=>c==='W'||c==='~';
  for(let i=1;i<=5;i++){
    const tx=ptx+D[0]*i, ty=pty+D[1]*i; const ch=grid[ty]&&grid[ty][tx];
    if(ch===undefined) break;
    if(ch==='k'){ // poste: te arrastra hasta la celda anterior
      const lx=tx-D[0], ly=ty-D[1]; if(i>1){ hook={fx:player.x,fy:player.y,tx:lx*16,ty:ly*16-4,t:0,post:[tx,ty]}; state='hook'; SFX.sword(); noise(.08,.04,true); return; } break; }
    if(isWater(ch)||ch==='°'||ch==='@') continue;
    if(!isSolid(ch)){ if(i>1){ hook={fx:player.x,fy:player.y,tx:tx*16,ty:ty*16-4,t:0,land:[tx,ty]}; state='hook'; SFX.sword(); noise(.08,.04,true); return; } break; }
    break;
  }
  SFX.bump(); hook={fx:player.x,fy:player.y,tx:player.x+D[0]*30,ty:player.y+D[1]*30,t:0,fail:true,dir:player.dir}; state='hook';
}
function throwBoomer(pow){
  if(boomer) return;
  const D=DIRV[player.dir], sp=pow?3.3:2.6; SFX.boomer();
  boomer={x:player.x+8,y:player.y+10,vx:D[0]*sp,vy:D[1]*sp,t:0,ret:false,hits:new Set(),carry:null,ang:0,pow:!!pow};
  if(pow){ shake=2; beep('square',600,1400,.12,.04); }
}
function startJump(){
  if(jumpT>0) return;
  let dx=(keys.right?1:0)-(keys.left?1:0), dy=(keys.down?1:0)-(keys.up?1:0);
  if(!dx&&!dy){ const D=DIRV[player.dir]; dx=D[0]; dy=D[1]; }
  const d=Math.hypot(dx,dy); jumpDir=[dx/d,dy/d]; jumpT=26; SFX.jump(); player.atk=0; player.charge=0; glideT=0; glideUsed=false;
  puff(player.x+8,player.y+14,'#e8e8d8',5,.8);
}
function placeAt(nx,ny,px,py,dir){
  loadScreen(nx,ny); player.x=px; player.y=py; player.dir=dir; lastEntry={sx:nx,sy:ny,x:px,y:py}; fadeIn=18; noise(.12,.03,false);
}
function enterHouse(){ placeAt(9,9,76,90,1); }
function exitHouse(){ placeAt(0,1,44,42,0); }
function enterShop(){ placeAt(8,9,76,90,1); }
function exitShop(){ placeAt(0,1,108,42,0); }
function enterDungeon(){
  const hz=hideoutDoor(); if(hz){ placeAt(hz[0],hz[1],hz[2],hz[3],hz[4]); return; } // escondites (12c)
  if(sx===2&&sy===-1) placeAt(6,0,72,72,1);
  else if(sx===1&&sy===3) placeAt(10,0,72,72,1);
  else if(sx===1&&sy===-2) placeAt(15,2,72,88,1);
  else if(sx===4&&sy===3) placeAt(19,2,72,88,1); // el Molino de la Hojarasca
  else if(sx===0&&sy===0) placeAt(5,9,72,80,1);
}
function enterSecret(){ const hs=HIDEOUT_STAIRS[sx+','+sy]; if(hs){ placeAt(hs[0],hs[1],hs[2],hs[3],hs[4]); return; }
  if(sx===1&&sy===0) placeAt(4,9,80,70,1); else if(sx===1&&sy===2) placeAt(3,9,80,70,1); }
function exitDungeon(){
  if(hideoutExit()) return; // escondites (12c)
  if(sy===12){ placeAt(5,9,8*16,2*16-4,0); return; } // del Eco se vuelve a la Gruta, junto a la escalera
  if(sx===4&&sy===9){ placeAt(1,0,96,92,0); return; }
  if(sx===3&&sy===9){ placeAt(1,2,32,92,0); return; }
  if(sx===5) placeAt(0,0,20,30,0);
  else if(sx>=18&&sx<=20) placeAt(4,3,112,28,0); // del Molino a la Ciénaga, bajo la puerta
  else if(sx>=14) placeAt(1,-2,64,26,0);
  else if(sx>=10) placeAt(1,3,68,34,0);
  else placeAt(2,-1,76,34,0);
}
/* ---------- LAS TIENDAS ---------- */
function shopList(){
  const L=[];
  if(shopKind==='corteza'){
    if(!amulets.has('savia')) L.push({id:'am_savia',name:'ANILLO SAVIA',cost:30,d:'Bayas al doble\ny vienen solas.'});
    else L.push({id:'ok',name:'ANILLO SAVIA',cost:0,d:'Ya es tuyo.',off:true});
    if(!amulets.has('musgo')) L.push({id:'am_musgo',name:'CORAZÓN MUSGO',cost:60,d:'Vigor que se\nregenera solo.'});
    else L.push({id:'ok2',name:'CORAZÓN MUSGO',cost:0,d:'Ya es tuyo.',off:true});
    L.push({id:'out',name:'SALIR',cost:-1,d:'Cuídate, criatura.'});
    return L;
  }
  if(bladeLvl===1)      L.push({id:'b2',name:'AFILAR HOJA',cost:15,d:'La Hoja hará\ndaño DOBLE.'});
  else if(bladeLvl===2) L.push({id:'b3',name:'TEMPLAR HOJA',cost:40,d:'Daño TRIPLE. Con el vigor lleno lanza un RAYO DE HOJA.',off:!thawed,dOff:'El temple necesita\nel deshielo.'});
  else                  L.push({id:'bmax',name:'HOJA SUPREMA',cost:0,d:'Tu filo está\nal máximo.',off:true});
  if(hasBomb) L.push({id:'bombs',name:'5 BELLOTAS',cost:10,d:bombAmmo>=bombMax?'Tu zurrón de bellotas está lleno.':'Cinco bellotas-bomba para el zurrón.',off:bombAmmo>=bombMax,dOff:'Tu zurrón de bellotas está lleno.'});
  if(!hasSpin) L.push({id:'spin',name:'REMOLINO',cost:25,d:'Carga Z y suelta:\n¡giro+tornadito!'});
  else if(!hasBigSpin) L.push({id:'bigspin',name:'GRAN REMOLINO',cost:60,d:'Dos vueltas, más alcance, carga rápida y un tornado grande.',off:!thawed,dOff:'Te lo enseño cuando se vaya el invierno.'});
  if(!hasShield) L.push({id:'shield',name:'ESCUDO',cost:20,d:'Rebota rocas y\nesporas de frente.'});
  else if(shieldLvl<2) L.push({id:'oakshield',name:'ESCUDO ROBLE',cost:45,d:'Gírate o golpea justo a tiempo y lo que te lancen REBOTA.',off:!summered,dOff:'La corteza vieja solo se cura en verano.'});
  if(thawed&&!hasLantern) L.push({id:'lantern',name:'FAROL BRASA',cost:35,d:'Luz para cuevas.\nEnciende antorchas.'});
  if(!shopHeart) L.push({id:'hp',name:'CORAZÓN SAVIA',cost:50,d:'+1 corazón de\nvigor máximo.'});
  if(!shopPiece) L.push({id:'piece',name:'TROZO CORAZÓN',cost:30,d:'Un cuarto de\ncorazón.'});
  L.push({id:'out',name:'SALIR',cost:-1,d:'Vuelve pronto.'});
  return L;
}
function openShop(kind){
  SFX.blip(); shopSel=0; shopUD=0; shopKind=kind;
  if(kind==='tilo'&&!tiloMet){ tiloMet=true; save();
    say(["¡Un cliente! Soy\nTILO. Afilo hojas\ny cuezo savia.","Pago en BAYAS:\nla hierba, los\narbustos y los\nbichos las sueltan.","Échale un ojo al\ngénero, brote."],()=>{ state='shop'; },'TILO'); }
  else if(kind==='corteza'&&!cortezaMet){ cortezaMet=true; save();
    say(["Corteza tallo\namuletos, criatura.\nDos a la vez\npuedes llevar.","Mira el género y\nno toques nada\ncon las raíces\nsucias."],()=>{ state='shop'; },'CORTEZA'); }
  else state='shop';
}
function buyShop(){
  const L=shopList(), it=L[shopSel]; if(!it) return;
  if(it.id==='out'){ state='play'; SFX.blip(); return; }
  if(it.off){ SFX.bump(); return; }
  if(berries<it.cost){ SFX.bump(); showToast('FALTAN '+(it.cost-berries)+' BAYAS',it.name); return; }
  berries-=it.cost; SFX.fanfare(); save();
  const who=shopKind==='corteza'?'CORTEZA':'TILO';
  if(it.id==='bombs'){ bombAmmo=Math.min(bombMax,bombAmmo+5); say(["Cinco bellotas del fondo del saco. Que no te estallen en el bolsillo."],null,who); }
  else if(it.id==='b2'){ bladeLvl=2; say(["¡Chas! Filo como\nel rocío. Tu Hoja\nhace daño DOBLE."],null,who); }
  else if(it.id==='b3'){ bladeLvl=3; say(["¡Mi obra maestra!\nDaño TRIPLE.\nTiembla, valle."],null,who); }
  else if(it.id==='spin'){ hasSpin=true; say(["¡El REMOLINO!\nMantén pulsado Z:\nla Hoja se carga...","...y al soltar,\n¡giras y LANZAS\nun TORNADITO!","Hasta rompe la\nguardia de los\nacorazados."],null,who); }
  else if(it.id==='bigspin'){ hasBigSpin=true; say(["El GRAN REMOLINO: carga antes, da dos vueltas y el tornado sale enorme.","Cuidado con los muebles."],()=>giveThing(BIGSPIN_ICON,'GRAN REMOLINO',["¡El GRAN REMOLINO!","Mantén Z: carga en un suspiro. Suelta: dos vueltas y un tornado grande."]),who); }
  else if(it.id==='oakshield'){ shieldLvl=2; say(["Corteza del corazón del Roble, curada al sol. Aguanta lo que le eches."],()=>giveThing(OAKSHIELD_ICON,'ESCUDO DE ROBLE',["¡El ESCUDO DE ROBLE!","Gírate justo cuando algo te llega (o golpéalo con la Hoja) y lo DEVUELVES a quien lo lanzó."]),who); }
  else if(it.id==='shield'){ hasShield=true; say(["Corteza del Roble\ncurtida. Se lleva\nsola: lo que te\nvenga de frente\nrebota."],()=>getItem('shield'),who); }
  else if(it.id==='lantern'){ hasLantern=true; say(["Lo encendí con una\nchispa de la Brasa.\nNo se apaga\nnunca."],()=>getItem('lantern'),who); }
  else if(it.id==='hp'){ shopHeart=true; player.maxHp+=2; player.hp=player.maxHp; say(["Savia espesa del\nGran Roble...\n¡Tu vigor aumenta!"],null,who); }
  else if(it.id==='piece'){ shopPiece=true; say(["Un cuarto de\ncorazón. Lo\nencontré barriendo."],()=>addPiece(),who); }
  else if(it.id==='am_savia'){ say(["Un anillo de savia\nendurecida. Las\nbayas lo adoran."],()=>giveAmulet('savia'),who); }
  else if(it.id==='am_musgo'){ say(["Musgo del lado\nnorte del Roble.\nRespira contigo."],()=>giveAmulet('musgo'),who); }
  save();
}
function addPiece(){ pieces++; SFX.piece(); if(pieces>=4){ pieces=0; player.maxHp+=2; player.hp=player.maxHp; SFX.fanfare(); say(TXT.pieceGet(4)); } else say(TXT.pieceGet(pieces)); save(); }
/* recibir un objeto grande: Sprout lo alza */
function getItem(kind){
  const M={blade:[BLADE_SPR,TXT.bladeGet],bomb:[BOMB_SPR,TXT.bombGet],ember:[EMBER_SPR,TXT.emberGet],hook:[HOOK_SPR,TXT.hookGet],tear:[TEAR_SPR,TXT.tearGet],flake:[FLAKE_SPR,TXT.flakeGet],boomer:[BOOMER_SPR,TXT.boomerGet],lantern:[LANTERN_SPR,TXT.lanternGet],feather:[FEATHER_SPR,TXT.featherGet],shield:[SHIELD_SPR,TXT.shieldGet],molinillo:[PINWHEEL_SPR,TXT.molinilloGet],amber:[AMBER_SPR,TXT.amberGet]};
  if(kind==='blade') hasBlade=true; if(kind==='bomb'){ hasBomb=true; bombAmmo=bombMax; } if(kind==='ember') hasEmber=true; if(kind==='hook') hasHook=true;
  if(kind==='tear') hasTear=true; if(kind==='flake') hasFlake=true; if(kind==='boomer') hasBoomer=true; if(kind==='lantern') hasLantern=true;
  if(kind==='feather') hasFeather=true; if(kind==='shield') hasShield=true;
  if(kind==='molinillo') hasPinwheel=true; if(kind==='amber') hasAmber=true;
  if(!xItem&&['bomb','hook','boomer','lantern','feather','molinillo'].includes(kind)) xItem=kind;
  [itemSpr,itemPages]=M[kind]; SFX.fanfare(); shake=6; screenFlash(8,'#fff6c0'); player.squash=.4; state='itemget'; itemT=120; itemCardName=ITEM_NAMES[kind]||''; player.dir=0; player.atk=0; player.spin=0; save();
  puff(player.x+8,player.y+8,C.flowerC,14,1.6); puff(player.x+8,player.y+8,PAL.l,10,1.2);
}
function findFree(px,py,axis){
  for(const ax of [axis, axis==='x'?'y':'x']){
    for(let off=0;off<=140;off+=4){ for(const s of (off?[-1,1]:[1])){
      const nx=ax==='x'?px+off*s:px, ny=ax==='y'?py+off*s:py;
      if(nx<0||nx>144||ny<-4||ny>106) continue;
      if(boxFree(nx+4,ny+8,8,8)) return [nx,ny]; } } }
  let best=null,bd=1e9;
  for(let ty=0;ty<SH;ty++) for(let tx=0;tx<SW;tx++){ const nx=tx*16+4, ny=ty*16-4; if(nx>144||ny>106) continue;
    if(!boxFree(nx+4,ny+8,8,8)) continue; const d=(nx-px)*(nx-px)+(ny-py)*(ny-py); if(d<bd){ bd=d; best=[nx,ny]; } }
  return best||[px,py];
}
