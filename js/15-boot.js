'use strict';
/* ---------- DEBUG ---------- */
window.__sprout={
  warp(nx,ny,px,py){ loadScreen(nx,ny); player.x=px??72; player.y=py??60; state='play'; dlg=null; inBed=false; },
  blade(){ hasBlade=true; },
  bomb(){ hasBomb=true; },
  hookOn(){ hasHook=true; },
  win(){ won=true; },
  thaw(){ thawed=true; },
  summer(){ summered=true; },
  cycle(){ cycled=true; },
  meet(){ elderMet=true; },
  gear(){ hasBlade=hasBomb=hasHook=true; },
  kill(){ player.hp=0; die(); },
  respawn(){ return respawnPoint; },
  wilts(){ return wilts; },
  solvePlates(){ for(const c of plateCells){ const [x,y]=c.split(',').map(Number); grid[y][x]='#'; } checkPlates(); return [...plateCells].length; },
  giveKey(){ keysHeld++; },
  keys(){ return keysHeld; },
  killBoss(){ if(boss) boss.hp=0; },
  calmBoss(){ if(boss) boss.hp=2; },
  addBerries(n){ berries=Math.min(99,berries+(n||10)); },
  spin(){ hasSpin=true; },
  blade2(){ bladeLvl=2; }, blade3(){ bladeLvl=3; },
  shop(){ enterShop(); },
  shopUI(){ state='shop'; shopSel=0; },
  quests(){ return questList(); },
  cine(p,f){ state='cine'; cinePage=p||0; cineChars=999; cineFold=f||0; },
  title(t){ state='title'; titleT=t||0; },
  titleT(){ return titleT; },
  tick(){ return tick; },
  keysNow(){ return {...keys}; },
  resetAC(){ try{ if(AC)AC.close(); }catch(e){} AC=null;
    if(musicTimer){ clearInterval(musicTimer); musicTimer=null; } },
  freeze(n){ hitStop=n===undefined?600:n; },
  testToast(a,b){ showToast(a||'NUEVA MISIÓN',b||'Semillas 0/8'); },
  doSpinNow(){ doSpin(); },
  winds(){ return windProjs.map(w=>({x:w.x|0,y:w.y|0,t:w.t})); },
  charge(){ return player.charge; },
  music(){ return {curTrack, MLEN, bars:TRACKS[curTrack]&&TRACKS[curTrack].chords.length,
    melSum:TRACKS[curTrack]&&TRACKS[curTrack].mel.reduce((a,[,l])=>a+l,0)}; },
  playTrack(n){ setTrack(n); },
  give(){ if(elderPos) giveItem(ACORN,8,()=>{}); },
  cutBush(x,y){ const id='Q'+sx+','+sy+','+x+','+y; cutQ.add(id); return id; },
  pause(v){ state='pause'; pauseView=v||0; },
  tile(x,y){ return grid[y]&&grid[y][x]; },
  enemyTypes(){ return enemies.map(e=>e.type); },
  info(){ return {sx,sy,x:player.x,y:player.y,hp:player.hp,maxHp:player.maxHp,seeds,berries,lupaPot,hasBlade,bladeLvl,hasSpin,hasBomb,hasHook,hasEmber,hasTear,hasFlake,won,bossDone,boss2Done,boss3Done,thawed,summered,cycled,state,boss:boss?{hp:boss.hp,st:boss.st,type:boss.type}:null,track:curTrack,entry:lastEntry,visited:visited.size}; },
};

/* ---------- PWA: icono desde el propio sprite ---------- */
(function(){
  const icon=document.createElement('canvas'); icon.width=192; icon.height=192;
  const g=icon.getContext('2d'); g.imageSmoothingEnabled=false;
  g.fillStyle='#0b1a10'; g.fillRect(0,0,192,192);
  g.drawImage(SPROUT_DOWN,0,0,16,16,16,16,160,160);
  const url=icon.toDataURL('image/png');
  for(const rel of ['icon','apple-touch-icon']){
    const l=document.createElement('link'); l.rel=rel; l.href=url; document.head.appendChild(l);
  }
  try{
    const man={name:'SPROUT y las 8 semillas',short_name:'SPROUT',display:'standalone',
      orientation:'landscape',background_color:'#0b1a10',theme_color:'#0b1a10',start_url:'.',
      icons:[{src:url,sizes:'192x192',type:'image/png'}]};
    const ml=document.createElement('link'); ml.rel='manifest';
    ml.href=URL.createObjectURL(new Blob([JSON.stringify(man)],{type:'application/manifest+json'}));
    document.head.appendChild(ml);
  }catch(e){}
  if('serviceWorker' in navigator && location.protocol.startsWith('http')){
    navigator.serviceWorker.register('sw.js').catch(()=>{});
  }
})();

/* ---------- ARRANQUE ---------- */
loadScreen(9,9);
setTrack('titulo'); // la pantalla de título abre con el tema épico
/* timestep fijo a 60 Hz: misma velocidad en monitores de 60/120/144 Hz */
let lastT=null, acc=0;
const STEP=1000/60;
function loop(now){
  if(lastT===null) lastT=now;
  acc+=Math.min(now-lastT,100); lastT=now;
  pollGamepad();
  let n=0;
  while(acc>=STEP&&n<4){ update(); acc-=STEP; n++; }
  if(acc>=STEP) acc=0; // pestaña congelada: descarta el retraso, no lo persigas
  draw();
  requestAnimationFrame(loop);
}
requestAnimationFrame(loop);
