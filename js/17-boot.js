'use strict';
/* ---------- DEBUG ---------- */
window.__sprout={
  warp(nx,ny,px,py){ loadScreen(nx,ny); player.x=px??72; player.y=py??60; state='play'; dlg=null; inBed=false; pendingSay=null; player.atk=player.spin=player.charge=0; jumpT=0; boomer=null; hook=null; },
  blade(){ hasBlade=true; }, bomb(){ hasBomb=true; xItem=xItem||'bomb'; }, hookOn(){ hasHook=true; xItem=xItem||'hook'; },
  gear(){ hasBlade=hasBomb=hasHook=hasBoomer=hasLantern=hasFeather=hasShield=true; xItem=xItem||'bomb'; },
  allAmulets(){ for(const k in AMULETS) amulets.add(k); },
  win(){ won=true; }, thaw(){ thawed=true; }, summer(){ summered=true; }, cycle(){ cycled=true; }, meet(){ elderMet=true; },
  kill(){ player.hp=0; die(); }, respawn(){ return respawnPoint; },
  solvePlates(){ for(const c of plateCells){ const [x,y]=c.split(',').map(Number); grid[y][x]='#'; } checkPlates(); return plateCells.size; },
  giveKey(){ const dk=dungeonOf(sx,sy)||'x'; dungeonKeys[dk]=(dungeonKeys[dk]||0)+1; }, bigKey(){ bigKeys[dungeonOf(sx,sy)||'x']=true; },
  killBoss(){ if(boss) boss.hp=2; if(midboss) midboss.hp=0; }, addBerries(n){ berries=Math.min(999,berries+(n||10)); },
  spin(){ hasSpin=true; }, blade3(){ bladeLvl=3; }, shop(){ enterShop(); }, shopUI(k){ shopKind=k||'tilo'; state='shop'; shopSel=0; },
  quests(){ return questList(); }, cine(p,f){ state='cine'; cinePage=p||0; cineChars=999; cineFold=f||0; },
  title(t){ state='title'; titleT=t||0; }, tick(){ return tick; }, freeze(n){ hitStop=n===undefined?600:n; },
  toast(a,b){ showToast(a||'NUEVA MISIÓN',b||'Semillas 0/8'); }, pause(p){ state='pause'; pausePage=p||0; pauseSel=0; },
  say(p,who){ say(p,null,who); }, tile(x,y){ return grid[y]&&grid[y][x]; }, enemyTypes(){ return enemies.map(e=>e.type); },
  playTrack(n){ setTrack(n); }, music(){ return {curTrack}; }, equip(a,b){ equipped=[a||null,b||null]; }, setX(k){ xItem=k; },
  info(){ return {sx,sy,x:player.x,y:player.y,hp:player.hp,maxHp:player.maxHp,seeds,berries,hasBlade,bladeLvl,hasSpin,hasBomb,hasHook,hasBoomer,hasLantern,hasFeather,hasEmber,hasTear,hasFlake,won,bossDone,boss2Done,boss3Done,midKing,midDrone,midIce,thawed,summered,cycled,state,boss:boss?{hp:boss.hp,st:boss.st,type:boss.type}:null,midboss:midboss?{hp:midboss.hp,st:midboss.st,type:midboss.type}:null,track:curTrack,entry:lastEntry,visited:visited.size,xItem,equipped,amulets:[...amulets],pieces,keys:dungeonKeys,bigKeys}; },
};
/* ---------- PWA: icono desde el propio sprite ---------- */
(function(){
  const icon=mkCanvas(192,192); const g=icon.getContext('2d'); g.imageSmoothingEnabled=false;
  g.fillStyle='#0b1a10'; g.fillRect(0,0,192,192); g.drawImage(P_SPRITES[0][0],0,0,16,16,16,16,160,160);
  const url=icon.toDataURL('image/png');
  for(const rel of ['icon','apple-touch-icon']){ const l=document.createElement('link'); l.rel=rel; l.href=url; document.head.appendChild(l); }
  try{ const man={name:'SPROUT y las 8 semillas',short_name:'SPROUT',display:'standalone',orientation:'landscape',background_color:'#0b1a10',theme_color:'#0b1a10',start_url:'.',icons:[{src:url,sizes:'192x192',type:'image/png'}]};
    const ml=document.createElement('link'); ml.rel='manifest'; ml.href=URL.createObjectURL(new Blob([JSON.stringify(man)],{type:'application/manifest+json'})); document.head.appendChild(ml); }catch(e){}
  if('serviceWorker' in navigator && location.protocol.startsWith('http')){ navigator.serviceWorker.register('sw.js').catch(()=>{}); }
})();
/* ---------- ARRANQUE ---------- */
loadScreen(9,9); setTrack('titulo');
let lastT=null, acc=0; const STEP=1000/60;
function loop(now){
  if(lastT===null) lastT=now; acc+=Math.min(now-lastT,100); lastT=now; pollGamepad();
  let n=0; while(acc>=STEP&&n<4){ if(!window.__manual) update(); acc-=STEP; n++; } if(acc>=STEP) acc=0;
  draw(); requestAnimationFrame(loop);
}
requestAnimationFrame(loop);
