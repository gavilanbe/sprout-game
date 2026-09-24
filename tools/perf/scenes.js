'use strict';
/* Las escenas de medida (tools/perf): cada una parte de una partida limpia y determinista —Math.random sembrado,
   tick a 0, el título al reloj de fotogramas— para que dos versiones del juego pinten exactamente lo mismo.
   window.SCEN[nombre] = {frames, setup(), input(i)?, teardown()?} · window.__runScen(nombre,'time'|'hash',cada) */
(function(){
function seed(s){ let a=s>>>0; Math.random=()=>{ a|=0; a=a+0x6D2B79F5|0; let t=Math.imul(a^a>>>15,1|a); t=t+Math.imul(t^t>>>7,61|t)^t; return ((t^t>>>14)>>>0)/4294967296; }; }
function fresh(){ window.showToast=()=>{}; newGame(); introDone=true; inBed=false; wakeT=0; state='play'; elderMet=true; petraWoke=true;
  hasBlade=true; bladeLvl=2; hasSpin=true; toast=null; toastQ=[]; placeBanner=null; bossCard=null; pendingSay=null; dlg=null; fadeIn=0;
  won=thawed=summered=autumned=true; cycled=false; SEASON_FORCE=null; seeds=5; player.maxHp=player.hp=12; hitStop=0; shake=0; parts=[]; hurtVig=0; flashT=0;
  for(const n of ['flyText','projs','bombs','windProjs','gusts']) try{ const a=eval(n); if(Array.isArray(a)) a.length=0; }catch(_){} }
const warp=(nx,ny,x,y)=>{ __sprout.warp(nx,ny,x,y); placeBanner=null; hitStop=0; };
const dirs=['right','down','left','up'];
const walker=(period,fireEvery)=>i=>{ const k={}; k[dirs[((i/period)|0)%4]]=1; if(fireEvery&&i%fireEvery===0) k.fire=1; return k; };
function fightAI(o){ o=o||{}; return i=>{ const B=boss||midboss; const k={}; player.hp=player.maxHp; if(!B) return k;
  const bx=B.x+(B.w||32)/2, by=B.y+(B.h||32)/2, px=player.x+8, py=player.y+10, dx=bx-px, dy=by-py, d=Math.hypot(dx,dy);
  if(d>38){ if(Math.abs(dx)>6){ k.right=dx>0; k.left=dx<0; } if(Math.abs(dy)>6){ k.down=dy>0; k.up=dy<0; } }
  else if(d<20){ if(Math.abs(dx)>6){ k.right=dx<0; k.left=dx>0; } }
  player.dir=Math.abs(dx)>Math.abs(dy)?(dx>0?3:2):(dy>0?0:1); if(i%14===0&&d<48) k.fire=1; if(o.alt&&i%50===25) k.alt=1; return k; }; }
const god=()=>{ window.hurt=()=>{}; };
window.SCEN={
  boot:{frames:220,setup(){ state='boot'; bootT=0; bootGo=0; },input:i=>i===100?{fire:1}:null},
  titleIntro:{frames:TITLE_MENU+20,setup(){ state='title'; titleT=0; parts=[]; titleCam=0; }},
  titleMenu:{frames:900,setup(){ state='title'; titleT=TITLE_MENU; parts=[]; titleCam=0; }},
  fileSelect:{frames:160,setup(){ state='title'; titleT=TITLE_MENU+30; parts=[]; },input:i=>i===2?{fire:1}:i===60?{right:1}:null},
  plaza:{frames:600,setup(){ fresh(); seeds=8; bloomDone=true; hasEmber=hasTear=true; SEASON_FORCE=1; warp(1,1,64,100); },input:walker(45)},
  village:{frames:600,setup(){ fresh(); SEASON_FORCE=0; warp(0,1,64,90); },input:walker(40)},
  valleyFight:{frames:600,setup(){ fresh(); SEASON_FORCE=1; god(); warp(1,2,72,56); enemies=[spawnEnemy('blob',6,3,0),spawnEnemy('blob',3,3,0),spawnEnemy('blob',5,5,0),spawnEnemy('bat',3,5,0),spawnEnemy('beetle',6,5,0)]; },input:walker(30,9)},
  snowNorth:{frames:600,setup(){ fresh(); thawed=false; god(); warp(1,-1,40,60); },input:walker(50)},
  marsh:{frames:600,setup(){ fresh(); summered=false; god(); warp(2,3,40,52); },input:walker(50)},
  winterValley:{frames:600,setup(){ fresh(); cycled=true; SEASON_FORCE=3; god(); warp(2,1,40,60); },input:walker(50)},
  caveDark:{frames:600,setup(){ fresh(); hasLantern=false; god(); warp(7,0,72,90); },input:walker(40)},
  templeLantern:{frames:600,setup(){ fresh(); hasLantern=true; god(); warp(15,0,72,60); },input:walker(40)},
  hive:{frames:600,setup(){ fresh(); god(); warp(11,0,72,90); },input:walker(40,17)},
  bossTopo:{frames:700,setup(){ fresh(); bossDone=false; god(); warp(6,2,72,100); bossCard=null; },input:fightAI()},
  bossReina:{frames:700,setup(){ fresh(); boss2Done=false; hasHook=true; god(); warp(10,2,72,100); bossCard=null; },input:fightAI()},
  bossCiervo:{frames:700,setup(){ fresh(); boss4Done=false; hasPinwheel=true; xItem='molinillo'; god(); warp(19,-1,72,100); bossCard=null; },input:fightAI({alt:true})},
  bossViento:{frames:700,setup(){ fresh(); boss3Done=false; hasLantern=hasFeather=hasBomb=hasHook=true; god(); warp(1,-3,72,100); bossCard=null; },input:fightAI()},
  cineBlade:{frames:420,setup(){ fresh(); warp(2,1,64,60); getItem('blade'); }},
  cineLantern:{frames:420,setup(){ fresh(); warp(2,1,64,60); getItem('lantern'); }},
  cineBoomer:{frames:420,setup(){ fresh(); warp(2,1,64,60); getItem('boomer'); }},
  riteSpring:{frames:700,setup(){ fresh(); won=true; thawed=summered=autumned=false; seeds=8; bloomDone=true; hasEmber=true; warp(1,1,64,72); player.dir=1; startRite('primavera',()=>{}); }},
  seasonCine:{frames:600,setup(){ fresh(); won=thawed=true; summered=autumned=false; seeds=8; bloomDone=true; warp(1,1,64,72); playSeasonCinematic('verano',()=>{ state='play'; }); }},
  door:{frames:300,setup(){ fresh(); SEASON_FORCE=0; warp(0,1,108,56); player.dir=1; },input:i=>i<120?{up:1}:i<200?{}:{down:1}},
  zurron:{frames:400,setup(){ fresh(); SEASON_FORCE=0; warp(1,1,64,100); openZurron(0); },input:i=>(i%70===40?{alt:1}:null)},
  dialog:{frames:300,setup(){ fresh(); SEASON_FORCE=0; warp(0,1,60,70); say(NPC_TALK.h(),null,'PETRA'); },input:i=>(i%60===59?{fire:1}:null)},
  transitions:{frames:600,setup(){ fresh(); SEASON_FORCE=1; god(); warp(0,1,20,60); },input:i=>({right:1})},
  ending:{frames:600,setup(){ fresh(); cycled=true; playEnding(()=>{ state='credits'; creditsT=0; }); }},
  credits:{frames:400,setup(){ fresh(); state='credits'; creditsT=0; }},
  wilt:{frames:400,setup(){ fresh(); SEASON_FORCE=0; warp(2,1,64,60); player.hp=0; die(); }},
  frames:{frames:120,setup(){ fresh(); SEASON_FORCE=0; warp(1,1,64,100); window.__drawOrig=window.draw;
    window.draw=function(){ __drawOrig(); const L=[['normal',6,90,148,40],['wood',10,8,60,30],['stone',84,8,66,34],['paper',12,50,70,34],['letter',90,50,58,32]];
      for(const [st,x,y,w,h] of L) drawFrame(x,y,w,h,st); ctx.globalAlpha=.6; drawFrame(40,60,80,20,'paper'); ctx.globalAlpha=1; }; },
    teardown(){ window.draw=window.__drawOrig; }},
  wiltLong:{frames:1100,setup(){ fresh(); SEASON_FORCE=0; warp(2,1,64,60); player.hp=0; die(); },input:i=>(i>900&&i%40===0?{fire:1}:null)},
  cineAll:{frames:3000,setup(){ fresh(); warp(2,1,64,60); window.__cineQ=Object.keys(MOMENT_ARMS); getItem(__cineQ.shift()); },input:i=>{ if(state==='play'&&__cineQ.length){ getItem(__cineQ.shift()); } else if(state==='dialog'&&i%20===0) return {fire:1}; return null; }},
};
function keysFrom(k){ const K=k||{}; for(const n of ['left','right','up','down']) keys[n]=!!K[n]; if(K.fire){ keys.fire=true; keys.fireHeld=true; } else keys.fireHeld=false; if(K.alt){ keys.alt=true; keys.altHeld=true; } else keys.altHeld=false; }
const hurt0=window.hurt;
window.musicPos=()=>null; // el título sigue al reloj de fotogramas (el del audio va en tiempo real: no es determinista)
window.__runScen=(name,mode,every)=>{ const S=SCEN[name]; window.hurt=hurt0; seed(12345); tick=0; S.setup(); seed(777);
  const U=[],D=[],P=[],H=[]; const inp=S.input||(()=>null);
  for(let i=0;i<S.frames;i++){ keysFrom(inp(i));
    const t0=performance.now(); update(); const t1=performance.now(); draw(); const t2=performance.now();
    if(mode==='time'){ present(); const t3=performance.now(); U.push(t1-t0); D.push(t2-t1); P.push(t3-t2); }
    else if(i%(every||5)===0){ const d=ctx.getImageData(0,0,160,144).data; let h=2166136261>>>0; for(let j=0;j<d.length;j+=1){ h^=d[j]; h=Math.imul(h,16777619)>>>0; } H.push(h.toString(16)); } }
  window.hurt=hurt0; keysFrom(null); if(S.teardown) S.teardown();
  if(mode!=='time') return {name,state,H};
  const st=a=>{ const s=[...a].sort((x,y)=>x-y), sum=a.reduce((x,y)=>x+y,0); return {avg:sum/a.length,p95:s[Math.floor(s.length*.95)],max:s[s.length-1],at:a.indexOf(s[s.length-1])}; };
  return {name,state,u:st(U),d:st(D),p:st(P)}; };
/* el coste de cargar cada pantalla (loadScreen + rebuildBg), en frío (primera vez) */
window.__screenLoads=()=>{ const out=[]; for(const key of Object.keys(MAPS)){ const [x,y]=key.split(',').map(Number); fresh(); const t0=performance.now(); loadScreen(x,y); const t1=performance.now(); rebuildBg(); const t2=performance.now(); out.push([key,t1-t0,t2-t1]); } return out; };
})();
