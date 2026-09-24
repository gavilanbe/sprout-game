'use strict';
/* los planos del juego: setup (sobre una partida limpia de fresh()), pre (ensayo en silencio), len (fotogramas), input(i) (teclas por fotograma), sfx (volumen) */
(function(){
const hold=(k)=>(i)=>k;
const seq=(list)=>(i)=>{ let acc=0; for(const [n,k] of list){ if(i<acc+n) return typeof k==='function'?k(i-acc):k; acc+=n; } return null; };
/* la fila por la que Sprout camina más lejos (se prueba en silencio y sin bichos) */
function bestY(nx,ny,dir,x0,ys){ let best=null;
  for(const y of ys){ __sprout.warp(nx,ny,x0,y); enemies=[]; placeBanner=null; hitStop=0; for(let i=0;i<110;i++){ keys.right=dir>0; keys.left=dir<0; update(); if(state==='dialog'&&dlg){ dlg.chars=9999; keys.fire=true; } }
    const dist=((sx-nx)*160+(player.x-x0))*dir; if(!best||dist>best[1]) best=[y,dist]; }
  keys.right=keys.left=false; return best?best[0]:ys[0]; }
function walkShot(nx,ny,flags,o){ o=o||{}; return { setup(){ if(flags) flags(); const dir=o.dir||1, x0=o.x0!==undefined?o.x0:(dir>0?4:140), y=o.y!==undefined?o.y:bestY(nx,ny,dir,x0,o.ys||[28,36,44,52,60,68,76,84,92,100]);
    if(flags) flags(); __sprout.warp(nx,ny,x0,y); player.dir=dir>0?3:2; if(o.noEnemies) enemies=[]; }, pre:2, len:o.len||200, input:hold(o.dir<0?{left:1}:{right:1}) }; }
function fight(nx,ny,flags,o){ o=o||{}; return { setup(){ if(flags) flags(); __sprout.warp(nx,ny,72,100); bossCard=null; player.maxHp=player.hp=20; }, pre:60, len:320, sfx:.85,
  each(i){ const B=boss||midboss; if(!B) return; const bx=B.x+(B.w||32)/2, by=B.y+(B.h||32)/2, px=player.x+8, py=player.y+10, dx=bx-px, dy=by-py, d=Math.hypot(dx,dy);
    keys.left=keys.right=keys.up=keys.down=false; player.hp=player.maxHp;
    const want=o.far||30; if(d>want+8){ if(Math.abs(dx)>6){ keys.right=dx>0; keys.left=dx<0; } if(Math.abs(dy)>6){ keys.down=dy>0; keys.up=dy<0; } }
    else if(d<want-10){ if(Math.abs(dx)>6){ keys.right=dx<0; keys.left=dx>0; } if(Math.abs(dy)>6){ keys.down=dy<0; keys.up=dy>0; } }
    if(Math.abs(dx)>Math.abs(dy)) player.dir=dx>0?3:2; else player.dir=dy>0?0:1;
    if(i%14===0&&d<48) keys.fire=true; if(o.alt&&i%50===25) keys.alt=true; } }; }
function season(si){ return { setup(){ SEASON_FORCE=si; cycled=true; seeds=8; bloomDone=true; __sprout.warp(1,1,4,100); player.dir=3; enemies=[]; }, pre:2, len:200, input:hold({right:1}) }; }
const SH={
  /* SECCIÓN B: el valle */
  door:{ setup(){ __sprout.warp(9,9,76,76); player.dir=0; }, pre:0, len:200, input:i=>({down:i<190}) },
  grass:{ setup(){ SEASON_FORCE=1; const y=bestY(2,1,1,4,[84,92,100]); __sprout.warp(2,1,4,y); player.dir=3; }, pre:2, len:200,
    input:seq([[12,{right:1}],[1,{right:1,fire:1}],[12,{right:1}],[1,{right:1,fire:1}],[12,{right:1}],[1,{right:1,fire:1}],[12,{right:1}],[1,{right:1,fire:1}],[10,{right:1}],[40,{hold:1}],[1,{}],[80,{right:1}]]) },
  talk:{ setup(){ SEASON_FORCE=3; cycled=true; __sprout.warp(0,1,60,70); const n=npcs.find(n=>n.ch==='h'); if(n){ player.x=n.x*16+18; player.y=n.y*16; player.dir=2; } }, pre:2, len:230,
    input:i=>(i>70&&i%50===20?{fire:1}:{}), each(i){ if(i===6) say(NPC_TALK.h(),null,'PETRA'); } },
  snow:walkShot(1,-1,()=>{ thawed=false; }),
  marsh:walkShot(2,3,()=>{ summered=false; }),
  dunes:walkShot(2,2,()=>{ SEASON_FORCE=1; }),
  lake:walkShot(3,1,()=>{ SEASON_FORCE=0; }),
  forestA:walkShot(0,0,()=>{ SEASON_FORCE=2; }),
  beach:walkShot(0,2,()=>{ SEASON_FORCE=1; }),
  fish:{ setup(){ fishCount=3; hasLure=true; fishDex=7; __sprout.warp(3,1,72,70); startFishing(); state='fish'; dlg=null; }, pre:0, len:230,
    input:i=>(i===10?{fire:1}:i===52?{fire:1}:(i>54&&(i%12)<9)?{hold:1}:{}),
    each(i){ const S=fishS; if(!S) return; if(i===44&&S.phase==='wait'){ const f=S.fish[0]; f.x=S.lure.x; f.y=S.lure.y; f.st='bite'; f.tm=30; S.lure.sink=1; }
      if(S.phase==='reel'){ S.run=0; S.tension=Math.min(S.tension,62); if(S.dist>40) S.dist=40; S.dist-=.35; } } },
  chest:{ setup(){ __sprout.warp(7,2,64,82); player.dir=1; enemies=[]; }, pre:4, len:170, each(i){ if(i===8){ const k='7,2:4,4'; opened.add('CH'+k); markDirty(); SFX.secret(); openChestContent(CHESTS[k]); } } },
  cave:{ setup(){ thawed=true; __sprout.warp(2,-1,80,86); player.dir=1; }, pre:2, len:120, input:hold({up:1}) },
  /* SECCIÓN C: las armas */
  wblade:{ setup(){ SEASON_FORCE=1; __sprout.warp(1,2,72,56); enemies=[spawnEnemy('blob',6,3,0),spawnEnemy('blob',3,3,0),spawnEnemy('blob',5,5,0),spawnEnemy('blob',3,5,0),spawnEnemy('blob',6,5,0)]; enemies.forEach(e=>e.hp=1); player.x=72; player.y=56; player.dir=3; }, pre:2, len:200,
    input:seq([[4,{}],[1,{fire:1}],[14,{}],[2,{left:1}],[1,{fire:1}],[14,{}],[40,{hold:1}],[1,{}],[50,{}],[83,{}]]) },
  wbomb:{ setup(){ SEASON_FORCE=1; hasBomb=true; xItem='bomb'; bombAmmo=10; __sprout.warp(2,1,40,90); enemies=[]; player.x=2*16; player.y=5*16-6; player.dir=1; }, pre:2, len:200,
    input:seq([[6,{}],[1,{alt:1}],[24,{left:1,fn(){ player.dir=1; }}],[169,{}]]) },
  whook:{ setup(){ SEASON_FORCE=1; hasHook=true; xItem='hook'; equipped=[null,null]; __sprout.warp(3,0,96,80); enemies=[]; player.x=6*16; player.y=5*16-4; player.dir=1; }, pre:2, len:180,
    input:seq([[8,{}],[1,{alt:1}],[171,{}]]) },
  wboomer:{ setup(){ SEASON_FORCE=0; hasBoomer=true; xItem='boomer'; __sprout.warp(1,2,40,40); enemies=[spawnEnemy('blob',6,2,0),spawnEnemy('blob',7,4,0)]; player.x=2*16; player.y=2*16-4; player.dir=3; }, pre:2, len:200,
    input:seq([[8,{}],[1,{alt:1}],[40,{}],[30,{right:1}],[1,{fire:1}],[10,{}],[1,{fire:1}],[109,{}]]) },
  wlantern:{ setup(){ hasLantern=true; xItem='lantern'; __sprout.warp(15,0,72,60); enemies=[]; player.x=3*16; player.y=1*16-4; player.dir=2; }, pre:2, len:200,
    each(i){ const T=[[3,1,2],[6,1,3],[3,6,2],[6,6,3]], k=[10,50,90,130].indexOf(i); if(k>=0){ const [x,y,d]=T[k]; player.x=x*16; player.y=y*16-4; player.dir=d; keys.alt=true; } } },
  wfeather:{ setup(){ SEASON_FORCE=1; hasFeather=true; xItem='feather'; __sprout.warp(4,2,60,60); lastEntry={sx:4,sy:2,x:60,y:60}; enemies=[]; player.x=4*16-20; player.y=3*16-4; player.dir=3; }, pre:2, len:160,
    input:seq([[18,{right:1}],[1,{alt:1,right:1}],[40,{right:1}],[101,{}]]) },
  wshield:{ setup(){ SEASON_FORCE=0; hasShield=true; shieldLvl=2; __sprout.warp(2,1,112,96); enemies=[]; player.x=112; player.y=96; player.dir=2; }, pre:2, len:200,
    each(i){ player.dir=2; lastTurnT=tick; if(i%22===2&&i<170) projs.push({x:player.x-64,y:player.y+11,vx:2.4,vy:0,t:120,kind:'seed'}); } },
  wmolin:{ setup(){ hasPinwheel=true; xItem='molinillo'; __sprout.warp(18,0,6*16,3*16-4); enemies=[]; player.x=6*16; player.y=3*16-4; player.dir=2; }, pre:4, len:170,
    input:seq([[8,{}],[1,{alt:1}],[36,{}],[6,{down:1}],[2,{left:1}],[1,{alt:1}],[36,{}],[6,{down:1}],[2,{left:1}],[1,{alt:1}],[72,{}]]) },
  /* SECCIÓN C: mazmorras y jefes */
  dunlock:{ setup(){ __sprout.warp(8,1,4*16+8,1*16+2); enemies=[]; dungeonKeys.cueva=1; player.x=4*16+8; player.y=1*16+2; player.dir=1; }, pre:4, len:120, input:i=>(i===10?{fire:1}:i>40?{up:1}:{}) },
  dice:{ setup(){ __sprout.warp(14,0,20,60); enemies=[]; }, pre:4, len:160, input:i=>(i<14?{right:1}:i>60&&i<70?{down:1}:i>90&&i<98?{left:1}:{}) },
  dplates:{ setup(){ __sprout.warp(7,1,72,60); enemies=[]; player.dir=0; }, pre:4, len:140, each(i){ if(i===24) __sprout.solvePlates(); } },
  bTopo:fight(6,2,()=>{ bossDone=false; }),
  bReina:fight(10,2,()=>{ boss2Done=false; hasHook=true; }),
  bCiervo:fight(19,-1,()=>{ boss4Done=false; hasPinwheel=true; xItem='molinillo'; },{alt:true}),
  bKing:fight(8,0,()=>{ midKing=false; }),
  /* SECCIÓN D: las estaciones en la plaza del Roble */
  sea0:season(0), sea1:season(1), sea2:season(2), sea3:season(3),
  /* SECCIÓN E: el título de verdad (la bellota se posa y vuelve el color) */
  title:{ setup(){ window.__mp=window.musicPos; window.musicPos=()=>null; state='title'; titleT=TI_BURST-1; titleCam=0; parts=[]; TI.hops=[]; TI.sways=[]; TI.beat=-99; TI.lastSeason=-1; }, pre:0, len:420, sfx:1,
    each(i){ if(titleT>=TITLE_MENU-2) titleT=TITLE_MENU-2; }, // sin la placa «PULSA Z» ni la barra de abajo: el cierre, limpio
    after(){ window.musicPos=window.__mp; state='play'; } },
};
TR.defineShots(SH);
})();
