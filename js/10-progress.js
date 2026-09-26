'use strict';
/* ---------- GUARDADO (3 slots) ---------- */
function slotKey(i){ return 'sprout.save.s'+i; }
function readSlot(i){ try{ const r=localStorage.getItem(slotKey(i)); return r?JSON.parse(r):null; }catch(e){ return null; } }
function save(){
  if(state==='play') saveFlash=45;
  try{ localStorage.setItem(slotKey(curSlot),JSON.stringify({ v:3,
    seeds,hasBlade,hasBomb,hasEmber,won,bossDone,thawed,midKing,beachIntro,
    hasHook,hasTear,boss2Done,summered,midDrone,hasFlake,boss3Done,cycled,midIce,
    hasPinwheel,midScare,hasAmber,boss4Done,autumned,
    hasBoomer,hasLantern,hasFeather,hasShield,pieces,dungeonKeys,bigKeys,bombAmmo,bombMax,dmaps:[...dmaps],dcomp:[...dcomp],hasBigSpin,shieldLvl,
    amulets:[...amulets],equipped,xItem,topoGift,mossGift,wilts,windVisit,
    berries,bladeLvl,hasSpin,shopHeart,shopPiece,tiloMet,cortezaMet,elderMet,petraWoke,wellDone,lettersGiven,playTime,
    respawn:respawnPoint,maxHp:player.maxHp,side:sideSave(),
    collected:[...collected],cutQ:[...cutQ],opened:[...opened],visited:[...visited],
  })); }catch(e){}
}
function loadGame(d){
  try{
    collected.clear(); cutQ.clear(); opened.clear(); visited.clear(); amulets.clear(); hinted.clear();
    announced8=false; bloomDone=false; respawnPoint={...REGION_ANCHOR.valle,reg:'valle'};
    player.atk=player.spin=player.charge=player.inv=player.kx=player.ky=player.ivx=player.ivy=0;
    seeds=d.seeds||0; hasBlade=!!d.hasBlade; hasBomb=!!d.hasBomb; hasEmber=!!d.hasEmber;
    won=!!d.won; bossDone=!!d.bossDone; thawed=!!d.thawed; midKing=!!d.midKing; beachIntro=!!d.beachIntro;
    hasHook=!!d.hasHook; hasTear=!!d.hasTear; boss2Done=!!d.boss2Done; summered=!!d.summered; midDrone=!!d.midDrone;
    hasFlake=!!d.hasFlake; boss3Done=!!d.boss3Done; cycled=!!d.cycled; midIce=!!d.midIce;
    hasPinwheel=!!d.hasPinwheel; midScare=!!d.midScare; hasAmber=!!d.hasAmber; boss4Done=!!d.boss4Done; autumned=!!d.autumned||!!d.cycled;
    hasBoomer=!!d.hasBoomer; hasLantern=!!d.hasLantern; hasFeather=!!d.hasFeather; hasShield=!!d.hasShield; hasBigSpin=!!d.hasBigSpin; shieldLvl=d.shieldLvl||1;
    pieces=d.pieces||0; dungeonKeys={...(d.dungeonKeys||{})}; bigKeys={...(d.bigKeys||{})};
    bombMax=d.bombMax||10; bombAmmo=d.bombAmmo===undefined?(d.hasBomb?bombMax:10):d.bombAmmo; dmaps.clear(); dcomp.clear(); (d.dmaps||[]).forEach(k=>dmaps.add(k)); (d.dcomp||[]).forEach(k=>dcomp.add(k));
    (d.amulets||[]).forEach(a=>amulets.add(a)); equipped=[(d.equipped||[])[0]||null,(d.equipped||[])[1]||null]; xItem=d.xItem||null;
    topoGift=!!d.topoGift; mossGift=!!d.mossGift; wilts=d.wilts||0; windVisit=!!d.windVisit;
    berries=d.berries||0; bladeLvl=d.bladeLvl||1; hasSpin=!!d.hasSpin; shopHeart=!!d.shopHeart; shopPiece=!!d.shopPiece;
    tiloMet=!!d.tiloMet; cortezaMet=!!d.cortezaMet; elderMet=!!d.elderMet||!!d.hasBlade; petraWoke=!!d.petraWoke||!!d.elderMet; wellDone=!!d.wellDone; lettersGiven=!!d.lettersGiven; playTime=d.playTime||0;
    player.maxHp=d.maxHp||6; player.hp=player.maxHp; sideLoad(d.side);
    (d.collected||[]).forEach(i=>collected.add(i)); (d.cutQ||[]).forEach(i=>cutQ.add(i));
    (d.opened||[]).forEach(i=>opened.add(i)); (d.visited||[]).forEach(i=>visited.add(i));
    if(d.respawn&&MAPS[d.respawn.sx+','+d.respawn.sy]&&REGION_ANCHOR[d.respawn.reg]) respawnPoint={...d.respawn};
    if(seeds>=8) announced8=true; if(won) bloomDone=true;
  }catch(e){}
  inBed=false; introDone=true; equipped=equipped.map(a=>amulets.has(a)?a:null);
  player.x=respawnPoint.x; player.y=respawnPoint.y; player.dir=0;
  loadScreen(respawnPoint.sx,respawnPoint.sy); pendingSay=null; qPrev=null; toast=null; toastQ=[];
}
function clearSave(){ try{ localStorage.removeItem(slotKey(curSlot)); }catch(e){} }
function newGame(){
  clearSave(); collected.clear(); cutQ.clear(); opened.clear(); visited.clear(); amulets.clear(); hinted.clear();
  barrioCall=plazaCall=false; pendingSay=null; wakeT=0;
  player.atk=player.inv=player.kx=player.ky=player.ivx=player.ivy=player.charge=player.spin=0;
  seeds=0; hasBlade=hasBomb=hasEmber=won=bossDone=thawed=midKing=beachIntro=false; announced8=bloomDone=false; noBladeMsg=0;
  hasHook=hasTear=boss2Done=summered=midDrone=false; hasFlake=boss3Done=cycled=midIce=false;
  hasPinwheel=midScare=hasAmber=boss4Done=autumned=false;
  hasBoomer=hasLantern=hasFeather=hasShield=false; pieces=0; dungeonKeys={}; bigKeys={}; equipped=[null,null]; xItem=null; hasBigSpin=false; shieldLvl=1;
  bombAmmo=10; bombMax=10; dmaps.clear(); dcomp.clear();
  topoGift=mossGift=false; wilts=0; windVisit=false; berries=0;
  bladeLvl=1; hasSpin=shopHeart=shopPiece=tiloMet=cortezaMet=elderMet=false; petraWoke=wellDone=lettersGiven=false; playTime=0; npcs=[];
  giveFx=null; toast=null; toastQ=[]; qPrev=null; pausePage=0; pauseSel=0;
  respawnPoint={...REGION_ANCHOR.valle,reg:'valle'};
  player.maxHp=6; player.hp=6; player.x=44; player.y=26; player.dir=0; inBed=true;
  loadScreen(9,9); setTrack('titulo');
  sideLoad(null); fishS=null;
  introDone=true; state='cine'; cinePage=0; cineChars=0; cineFold=0; cineT=0; parts=[]; noise(.6,.025,false);
}
/* ---------- RECUERDOS: todo lo leído, en orden de descubrimiento ---------- */
function loreList(){
  const L=[];
  if(bossDone||boss2Done||boss4Done) L.push({id:'nana',kind:'nana',title:'La nana del Viento',pages:nanaPages()}); // arriba del todo: la que se va llenando (12d)
  for(const id of collected){
    if(id[0]==='d'){ const key=id==='dplaza'?'dplaza':id.slice(1).split(',').slice(0,2).join(','); if(DIARY[key]) L.push({id,kind:'diario',title:(key==='dplaza'?'La plaza nevada':(PLACE_NAMES[key]||key)),pages:DIARY[key]}); }
    else if(id.startsWith('r:')){ const key=id.slice(2); if(RUNAS[key]) L.push({id,kind:'runa',title:(PLACE_NAMES[key]||key),pages:RUNAS[key]}); }
    else if(id.startsWith('b:')){ const key=id.slice(2); if(BOOKS[key]) L.push({id,kind:'libro',title:BOOKS[key].title,pages:BOOKS[key].pages}); }
    else if(id[0]==='✉'){ const key=id.slice(1).split(',').slice(0,2).join(','); if(LETTERS[key]) L.push({id,kind:'carta',title:'Carta · '+(PLACE_NAMES[key]||key),pages:LETTERS[key]}); }
  }
  return L;
}
/* ---------- MISIONES: se derivan del estado, nunca mienten ---------- */
function questList(){
  const q=[];
  q.push({id:'raiz',txt:'Habla con RAÍZ',done:elderMet});
  if(elderMet) q.push({id:'hoja',txt:'La HOJA: playa SO',done:hasBlade});
  if(hasBlade) q.push({id:'semillas',txt:'Semillas '+Math.min(seeds,8)+'/8',done:seeds>=8});
  if(seeds>=8) q.push({id:'entrega',txt:'Llévalas a RAÍZ',done:won});
  if(won) q.push({id:'cueva',txt:'CUEVA DEL TOPO',done:hasEmber});
  if(hasEmber) q.push({id:'brasa2',txt:'La BRASA, a su ALTAR',done:thawed});
  if(thawed) q.push({id:'tronco',txt:'TRONCO HUECO',done:hasTear});
  if(hasTear) q.push({id:'lagrima2',txt:'La LÁGRIMA, a su ALTAR',done:summered});
  if(summered) q.push({id:'molino',txt:'MOLINO DE LA CIÉNAGA',done:hasAmber});
  if(hasAmber) q.push({id:'ambar2',txt:'El ÁMBAR, a su ALTAR',done:autumned});
  if(autumned) q.push({id:'templo',txt:'TEMPLO DEL PICO',done:hasFlake});
  if(hasFlake) q.push({id:'copo2',txt:'El COPO, a su ALTAR',done:cycled});
  if(cycled) q.push({id:'fin',txt:'Valle restaurado',done:true});
  if(hasBlade) q.push({id:'lupa',txt:'LUPA: 10 bayas',done:hasBoomer,side:true});
  const nAm=Object.keys(AMULETS).length;
  if(won) q.push({id:'amuletos',txt:'Amuletos '+amulets.size+'/'+nAm,done:amulets.size>=nAm,side:true});
  if(tradeStep>0&&tradeStep<8) q.push({id:'tq'+tradeStep,txt:TRADE[tradeStep].short,done:false,side:true});
  if(tradeStep>=8) q.push({id:'tq8',txt:'Trueques completos',done:true,side:true,quiet:true});
  if(lettersCount()>0) q.push({id:'cartas',txt:'Cartas '+lettersCount()+'/5',done:lettersGiven,side:true});
  if(won) q.push({id:'corazones',txt:'Cuartos '+pieces+'/4',done:false,side:true,quiet:true});
  return q;
}
function checkQuests(){
  const L=questList(); const ids=new Set(L.filter(x=>!x.done).map(x=>x.id));
  if(qPrev){
    for(const x of L) if(x.done&&qPrev.has(x.id)&&!x.quiet) showToast('MISIÓN CUMPLIDA',x.txt);
    for(const x of L) if(!x.done&&!qPrev.has(x.id)&&!x.quiet) showToast(x.side?'MISIÓN EXTRA':'NUEVA MISIÓN',x.txt);
  }
  qPrev=ids;
}
/* entrega visible: el objeto vuela de tus manos a las del anciano */
function giveItem(spr,n,cb){
  if(!elderPos){ cb&&cb(); return; }
  giveFx={spr,n:n||1,fx:player.x+4,fy:player.y-2,tx:elderPos[0]*16+4,ty:elderPos[1]*16-8,t:0,dur:55,cb};
  state='give'; SFX.blip();
}
function bloom(){
  if(bloomDone) return; bloomDone=true;
  for(let y=0;y<SH;y++) for(let x=0;x<SW;x++) if(grid[y][x]==='.'&&hash(x*3,y*7)%3===0) grid[y][x]='f';
  markDirty();
  for(let i=0;i<40;i++) parts.push({x:Math.random()*160,y:Math.random()*-60,vx:(Math.random()-.5)*.4,vy:.5+Math.random()*.5,life:80+Math.random()*60,col:[C.flower1,C.flower2,C.flowerC,PAL.l][i%4]});
}
