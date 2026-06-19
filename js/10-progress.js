'use strict';
/* ---------- GUARDADO (3 slots) ---------- */
const SAVE_KEY='sprout.save.v1'; // clave heredada: migra al slot 0
function slotKey(i){ return 'sprout.save.s'+i; }
function readSlot(i){ try{ const r=localStorage.getItem(slotKey(i)); return r?JSON.parse(r):null; }catch(e){ return null; } }
try{ const old=localStorage.getItem(SAVE_KEY);
  if(old){ if(!localStorage.getItem(slotKey(0))) localStorage.setItem(slotKey(0),old);
           localStorage.removeItem(SAVE_KEY); }
}catch(e){}
function save(){
  try{ localStorage.setItem(slotKey(curSlot),JSON.stringify({
    seeds, hasBlade, hasBomb, hasEmber, won, bossDone, thawed, beachIntro,
    hasHook, hasTear, boss2Done, summered, marshIntro,
    hasFlake, boss3Done, cycled, peakIntro, keysHeld, wilts,
    berries, lupaPot, bladeLvl, hasSpin, shopHeart, tiloMet, elderMet,
    respawn:respawnPoint,
    maxHp:player.maxHp,
    collected:[...collected], cutQ:[...cutQ], opened:[...opened], visited:[...visited],
  })); }catch(e){}
}
function loadGame(d){ // d: datos del slot ya leídos
  try{
    seeds=d.seeds||0; hasBlade=!!d.hasBlade; hasBomb=!!d.hasBomb; hasEmber=!!d.hasEmber;
    won=!!d.won; bossDone=!!d.bossDone; thawed=!!d.thawed; beachIntro=!!d.beachIntro;
    hasFlake=!!d.hasFlake; boss3Done=!!d.boss3Done; cycled=!!d.cycled; peakIntro=!!d.peakIntro;
    keysHeld=d.keysHeld||0; wilts=d.wilts||0;
    hasHook=!!d.hasHook; hasTear=!!d.hasTear; boss2Done=!!d.boss2Done;
    summered=!!d.summered; marshIntro=!!d.marshIntro;
    berries=d.berries||0; lupaPot=!!d.lupaPot;
    bladeLvl=d.bladeLvl||1; hasSpin=!!d.hasSpin; shopHeart=!!d.shopHeart; tiloMet=!!d.tiloMet;
    elderMet=!!d.elderMet||!!d.hasBlade; // partidas viejas: si ya tienes la Hoja, ya hablaste con él
    player.maxHp=d.maxHp||6; player.hp=player.maxHp;
    (d.collected||[]).forEach(i=>collected.add(i));
    (d.cutQ||[]).forEach(i=>cutQ.add(i));
    (d.opened||[]).forEach(i=>opened.add(i));
    (d.visited||[]).forEach(i=>visited.add(i));
    if(d.respawn&&MAPS[d.respawn.sx+','+d.respawn.sy]&&REGION_ANCHOR[d.respawn.reg]) respawnPoint={...d.respawn};
    if(seeds>=8) announced8=true;
    if(won) bloomDone=true;
  }catch(e){}
  inBed=false; introDone=true;
  // continúas en la entrada de la región donde lo dejaste, no siempre en el pueblo
  player.x=respawnPoint.x; player.y=respawnPoint.y; player.dir=0;
  loadScreen(respawnPoint.sx,respawnPoint.sy); pendingSay=null;
  qPrev=null; toast=null; toastQ=[]; // el registro de misiones arranca sin avisos
}
function clearSave(){ try{ localStorage.removeItem(slotKey(curSlot)); }catch(e){} }
function newGame(){ // borra todo y arranca la cinemática (llamar tras audio())
  clearSave(); collected.clear(); cutQ.clear(); opened.clear();
  seeds=0; hasBlade=false; hasBomb=false; hasEmber=false; won=false; bossDone=false;
  thawed=false; beachIntro=false; announced8=false; bloomDone=false; noBladeMsg=0;
  hasHook=false; hasTear=false; boss2Done=false; summered=false; marshIntro=false;
  hasFlake=false; boss3Done=false; cycled=false; peakIntro=false; keysHeld=0; wilts=0;
  berries=0; lupaPot=false; visited.clear(); pauseView=0;
  bladeLvl=1; hasSpin=false; shopHeart=false; tiloMet=false; elderMet=false;
  giveFx=null; toast=null; toastQ=[]; qPrev=null;
  player.charge=0; player.spin=0;
  respawnPoint={...REGION_ANCHOR.valle,reg:'valle'};
  player.maxHp=6; player.hp=6; player.x=44; player.y=26; player.dir=0; inBed=true;
  loadScreen(9,9);
  setTrack('titulo'); // el tema épico acompaña la hoja-pergamino
  introDone=true; state='cine'; cinePage=0; cineChars=0; cineFold=0; parts=[]; noise(.6,.025,false);
}
/* ---------- MISIONES ---------- */
/* el registro se deriva del estado: nunca miente sobre lo que toca hacer */
function questList(){
  const q=[];
  q.push({id:'raiz',txt:'Habla con RAÍZ',done:elderMet});
  if(elderMet) q.push({id:'hoja',txt:'La HOJA: playa SO',done:hasBlade});
  if(hasBlade) q.push({id:'semillas',txt:'Semillas '+Math.min(seeds,8)+'/8',done:seeds>=8});
  if(seeds>=8) q.push({id:'entrega',txt:'Llévalas a RAÍZ',done:won});
  if(won) q.push({id:'brasa',txt:'BRASA: cueva NE',done:hasEmber});
  if(hasEmber) q.push({id:'brasa2',txt:'La BRASA a RAÍZ',done:thawed});
  if(thawed) q.push({id:'lagrima',txt:'TRONCO HUECO: sur',done:hasTear});
  if(hasTear) q.push({id:'lagrima2',txt:'LÁGRIMA a RAÍZ',done:summered});
  if(summered) q.push({id:'copo',txt:'Sube a la CIMA',done:hasFlake});
  if(hasFlake) q.push({id:'copo2',txt:'El COPO a RAÍZ',done:cycled});
  if(cycled) q.push({id:'fin',txt:'Valle restaurado',done:true});
  // extra (opcionales)
  if(hasBlade&&!lupaPot) q.push({id:'lupa',txt:'LUPA: 10 bayas',done:false,side:true});
  if(hasBlade&&(bladeLvl<3||!hasSpin)) q.push({id:'tilo',txt:'TIENDA: el barrio',done:false,side:true});
  return q;
}
function showToast(t1,t2){ toastQ.push({t1,t2,t:140}); }
function checkQuests(){
  const L=questList();
  const ids=new Set(L.filter(x=>!x.done).map(x=>x.id));
  if(qPrev){
    for(const x of L) if(x.done&&qPrev.has(x.id)) showToast('MISIÓN CUMPLIDA',x.txt);
    for(const x of L) if(!x.done&&!qPrev.has(x.id)) showToast(x.side?'MISIÓN EXTRA':'NUEVA MISIÓN',x.txt);
  }
  qPrev=ids;
}
/* entrega visible: el objeto vuela de tus manos a las del anciano */
function giveItem(spr,n,cb){
  if(!elderPos){ cb&&cb(); return; }
  giveFx={spr,n:n||1,fx:player.x+4,fy:player.y-2,
    tx:elderPos[0]*16+4,ty:elderPos[1]*16-8,t:0,dur:55,cb};
  state='give'; SFX.blip();
}

function bloom(){
  if(bloomDone) return; bloomDone=true;
  for(let y=0;y<SH;y++) for(let x=0;x<SW;x++)
    if(grid[y][x]==='.'&&hash(x*3,y*7)%3===0) grid[y][x]='f';
  for(let i=0;i<40;i++) parts.push({x:Math.random()*160,y:Math.random()*-60,
    vx:(Math.random()-.5)*.4,vy:.5+Math.random()*.5,life:80+Math.random()*60,
    col:[C.flower1,C.flower2,C.flowerC,PAL.l][i%4]});
}

