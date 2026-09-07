'use strict';
/* ---------- ESTADO ---------- */
const keys={};
let state='boot';             // boot | title | file | cine | play | dialog | trans | pause | shop | itemget | hook | give | dying | over | jump
let tick=0, shake=0, hitStop=0;
let sx=1, sy=1;               // pantalla actual
let grid=[];                  // copia mutable de la pantalla
let enemies=[], pickups=[], parts=[], npcs=[], bombs=[], projs=[], windProjs=[];
let elderPos=null, boss=null, midboss=null;
let boomer=null;              // la Vaina en vuelo {x,y,vx,vy,t,ret,hits,carry}
let hook=null;                // {fx,fy,tx,ty,t} animación del gancho
let jumpT=0, jumpDir=[0,0], jumpZ=0;  // salto con el Vilano
let flyText=[];               // textos flotantes {x,y,txt,t,col}
let bgCanvas=[null,null], bgDirty=true; // fondo pre-renderizado (2 fotogramas)
let crystalOn=false;          // estado del cristal en la sala actual (persistente en `opened`)
/* progreso */
const collected=new Set();    // ids de recogibles (semillas, corazones, cuartos, llaves, diarios)
const cutQ=new Set();         // arbustos Q ya cortados
const opened=new Set();       // verjas abiertas, grietas voladas, cerrojos, puzles, cofres, cristales
const visited=new Set();      // pantallas pisadas (mapa)
let seeds=0, won=false, bloomDone=false, announced8=false;
let hasBlade=false, noBladeMsg=0, introDone=false;
let hasBomb=false, hasEmber=false, bossDone=false, thawed=false, midKing=false;
let hasHook=false, hasTear=false, boss2Done=false, summered=false, midDrone=false;
let hasFlake=false, boss3Done=false, cycled=false, midIce=false;
let hasBoomer=false, hasLantern=false, hasFeather=false, hasShield=false;
let pieces=0, dungeonKeys={}, bigKeys={};  // llaves pequeñas por mazmorra, llaves grandes
let amulets=new Set(), equipped=[null,null], xItem=null; // amuletos poseídos, equipados y objeto en X
let topoGift=false, mossGift=false;
let windVisit=false, elderMet=false, tiloMet=false, cortezaMet=false;
let bladeLvl=1, hasSpin=false, shopHeart=false, shopPiece=false;
let berries=0, wilts=0;
let barrioCall=false, plazaCall=false, beachIntro=false;
const hinted=new Set();       // pistas de sala ya mostradas (sesión)
let cinePage=0, cineChars=0, cineFold=0, itemT=0, fadeIn=0, wakeT=0, pendingSay=null;
let inBed=true;
let bossCard=null, itemSpr=null, itemPages=null, giveFx=null;
let toast=null, toastQ=[], qPrev=null;
let lastEntry={sx:1,sy:1,x:72,y:78};
let deathT=0, sproutT=0;
let shopSel=0, shopUD=0, shopKind='tilo';
let pausePage=0, pauseSel=0, pauseUD=0, pauseLR=0;
let regen=0;                   // contador del Corazón de Musgo
let titleT=0, fontsReady=false, bootT=0, bootGo=0, creditsT=0;
let curSlot=0, fileSel=0, fileConfirm=false, fileUD=0, slotCache=[null,null,null];
const TITLE_PAN_D=110, TITLE_T0=TITLE_PAN_D+16, TITLE_STAG=9, TITLE_DUR=20;
const TITLE_LAND=TITLE_T0+5*TITLE_STAG+TITLE_DUR, TITLE_LEAF0=TITLE_LAND+8, TITLE_LEAFD=104;
const TITLE_SHINE=TITLE_LEAF0+TITLE_LEAFD+6, TITLE_MENU=TITLE_SHINE+18;
if(document.fonts&&document.fonts.load){
  document.fonts.load('16px "Press Start 2P"').then(()=>{fontsReady=true;}).catch(()=>{fontsReady=true;});
  setTimeout(()=>{fontsReady=true;},1600);
} else fontsReady=true;

const player={x:44,y:26,dir:0,frame:0,anim:0,hp:6,maxHp:6,inv:0,atk:0,kx:0,ky:0,charge:0,spin:0,ivx:0,ivy:0};
function hasAmulet(id){ return equipped.includes(id); }
function playerSpeed(){ return hasAmulet('viento')?1.5:1.2; }
function die(){ if(state==='dying'||state==='over') return;
  state='dying'; deathT=120; wilts++; player.atk=0; player.spin=0; player.charge=0; bombs=[]; projs=[]; windProjs=[]; boomer=null; jumpT=0; overSel=0;
  SFX.hurt(); shake=8; hitStop=6; }
let overSel=0;
function hurt(n,fromX,fromY,force){ // daño al jugador, con amuleto de raíz y escudo
  if(player.inv>0&&!force) return false;
  if(hasAmulet('raiz')) n=Math.max(1,Math.ceil(n/2));
  player.hp-=n; player.inv=60; shake=8; SFX.hurt(); hitStop=3;
  if(fromX!==undefined){ const d=Math.hypot(player.x-fromX,player.y-fromY)||1; player.kx=(player.x-fromX)/d*2.5; player.ky=(player.y-fromY)/d*2.5; }
  flyText.push({x:player.x+8,y:player.y-4,txt:'-'+n,t:30,col:'#f89090'});
  if(player.hp<=0) die();
  return true;
}
/* diálogo: caja FIJA de 3 líneas — cada página se trocea en pantallas de 3 líneas */
function wrapText(s,maxc){
  const out=[];
  for(const raw of s.split('\n')){ let ln=raw;
    while(ln.length>maxc){ let cut=ln.lastIndexOf(' ',maxc); if(cut<1) cut=maxc; out.push(ln.slice(0,cut)); ln=ln.slice(cut).replace(/^ /,''); }
    out.push(ln); }
  return out;
}
function paginate(pages,who){
  const cols=(who&&PORTRAITS[who])?13:17, out=[];
  for(const p of pages){ const ls=wrapText(p,cols); for(let i=0;i<ls.length;i+=3) out.push(ls.slice(i,i+3).join('\n')); }
  return out;
}
let dlg=null; // {pages, page, chars, cb, who, ask}
function say(pages,cb,who,style){ dlg={pages:paginate(pages,who),page:0,chars:0,cb:cb||null,who:who||null,ask:null,style:style||'normal',pause:0,sel:0,t:0}; state='dialog'; }
function ask(pages,who,cb,style){ dlg={pages:paginate(pages,who),page:0,chars:0,cb:null,who:who||null,ask:cb,style:style||'normal',pause:0,sel:0,t:0}; state='dialog'; }
let trans=null;
function showToast(t1,t2){ toastQ.push({t1,t2,t:140}); }
/* ---------- segunda pasada: ajustes, tiempo de juego, intro y lore ---------- */
let opts={textSpeed:1,shake:1};
try{ Object.assign(opts,JSON.parse(localStorage.getItem('sprout.opts')||'{}')); }catch(e){}
function saveOpts(){ try{ localStorage.setItem('sprout.opts',JSON.stringify(opts)); }catch(e){} }
let playTime=0, petraWoke=false, saveFlash=0, wellDone=false, lettersGiven=false, loreSel=0, optSel=0, itemCardT=0, itemCardName='';
function lettersCount(){ let n=0; for(const id of collected) if(id[0]==='✉') n++; return n; }
function chapterIdx(){ return cycled?4:summered?3:thawed?2:won?1:0; }
function timeStr(f){ const s=(f/60)|0; return ((s/3600)|0)+':'+String(((s/60)|0)%60).padStart(2,'0')+':'+String(s%60).padStart(2,'0'); }
