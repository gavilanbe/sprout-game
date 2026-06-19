'use strict';
/* ---------- ESTADO ---------- */
const keys={};
let state='boot';             // boot | title | play | dialog | over | trans
                              // (boot: pantalla de encendido que desbloquea el audio del navegador)
let tick=0, shake=0;
let sx=1, sy=1;               // pantalla actual
let grid=[];                  // copia mutable de la pantalla
let enemies=[], pickups=[], parts=[];
let elderPos=null, signPos=[];
const collected=new Set();    // ids de semillas conseguidas
const cutQ=new Set();         // arbustos Q ya cortados
let seeds=0, won=false, bloomDone=false;
let announced8=false;
let hasBlade=false, noBladeMsg=0, introDone=false;
let cinePage=0, cineChars=0, cineFold=0, itemT=0, fadeIn=0, wakeT=0, pendingSay=null, beachIntro=false;
let inBed=true; // Sprout empieza dormido en su maceta
/* capítulo 1: las montañas del norte */
let hasBomb=false, hasEmber=false, bossDone=false, thawed=false;
/* capítulo 2: las marismas del otoño */
let hasHook=false, hasTear=false, boss2Done=false, summered=false, marshIntro=false;
/* capítulo 3: la cima del viento */
let hasFlake=false, boss3Done=false, cycled=false, peakIntro=false;
let windVisit=false;          // ya escuchaste la nana en la cima (post-final)
let bossCard=null;            // {txt,t} cartel de presentación de jefe
let hook=null; // {tx,ty,sx0,sy0} animación del gancho
const opened=new Set();   // verjas abiertas y grietas voladas
let bombs=[], projs=[], boss=null, npcs=[];
let windProjs=[];         // tornaditos lanzados por la Hoja cargada
let itemSpr=null, itemPages=null;
let lastEntry={sx:1,sy:1,x:72,y:78}; // checkpoint: por dónde entraste a la pantalla
let hitStop=0; // frames de congelación al impactar
let deathT=0, sproutT=0, wilts=0; // marchitarse / rebrotar / contador de muertes
let keysHeld=0; // llaves-bellota para los cerrojos de raíz
let berries=0, lupaPot=false; // bayas y trueque de Lupa (corazón de savia)
/* tienda de Tilo y mejoras de la Hoja */
let bladeLvl=1, hasSpin=false, shopHeart=false, tiloMet=false;
let shopSel=0, shopUD=0;
let elderMet=false;           // ya hablaste con Raíz (arranca el registro de misiones)
let barrioCall=false, plazaCall=false; // la voz del Roble te guía (avisos de sesión)
let giveFx=null;              // {spr,n,x,y,fx,fy,tx,ty,t,dur,cb} entrega visible de objetos
let toast=null, toastQ=[];    // avisos de misión en pantalla
let qPrev=null;               // firma de misiones activas (para detectar cambios)
const visited=new Set();      // pantallas pisadas (para el mapa del zurrón)
let pauseView=0;              // 0 = zurrón, 1 = mapa
/* título estilo Link's Awakening: letras que caen, hoja que se clava, destello, menú */
let titleT=0, fontsReady=false;
let bootT=0, bootGo=0; // encendido GB: caída del logo / frames saboreando el ding
/* selección de archivo (3 slots, a lo Zelda) */
let curSlot=0, fileSel=0, fileConfirm=false, fileUD=0, slotCache=[null,null,null];
const TITLE_PAN_D=110;                             // 1º el fondo sube (~1.8 s) y AHÍ ARRIBA cae el título
const TITLE_T0=TITLE_PAN_D+16, TITLE_STAG=9, TITLE_DUR=20;  // el logo empieza a caer al posarse el paneo
const TITLE_LAND=TITLE_T0+5*TITLE_STAG+TITLE_DUR;  // última letra posada
const TITLE_LEAF0=TITLE_LAND+8, TITLE_LEAFD=104;   // la Hoja Ancestral cae meciéndose
const TITLE_SHINE=TITLE_LEAF0+TITLE_LEAFD+6;       // empieza el ciclo de destellos
const TITLE_MENU=TITLE_SHINE+18;                   // aparece el menú
if(document.fonts&&document.fonts.load){
  document.fonts.load('16px "Press Start 2P"').then(()=>{fontsReady=true;}).catch(()=>{fontsReady=true;});
  setTimeout(()=>{fontsReady=true;},1600); // sin fuente no se congela el título
} else fontsReady=true;
function easeOutBack(k){ const c=1.70158, t=k-1; return 1+(c+1)*t*t*t+c*t*t; }
function die(){ if(state==='dying'||state==='over') return;
  state='dying'; deathT=70; wilts++; player.atk=0; bombs=[]; projs=[]; windProjs=[];
  SFX.hurt(); shake=6; }

const player={x:44,y:26,dir:0,frame:0,anim:0,hp:6,maxHp:6,inv:0,atk:0,kx:0,ky:0,charge:0,spin:0,ivx:0,ivy:0}; // dormido en su cama-maceta

/* diálogo: caja FIJA de 3 líneas — cada página del guion se trocea en
   pantallas de 3 líneas (con retrato caben 13 columnas; sin él, 17) */
function paginate(pages,who){
  if(typeof wrapText!=='function') return pages.slice(); // por si acaso en arranques raros
  const cols=(who&&typeof PORTRAITS!=='undefined'&&PORTRAITS[who])?13:17, out=[];
  for(const p of pages){
    const ls=wrapText(p,cols);
    for(let i=0;i<ls.length;i+=3) out.push(ls.slice(i,i+3).join('\n'));
  }
  return out;
}
let dlg=null; // {pages:[], page, chars, cb, who, ask}
function say(pages,cb,who){ dlg={pages:paginate(pages,who),page:0,chars:0,cb:cb||null,who:who||null,ask:null}; state='dialog'; }
/* pregunta con respuesta: al acabar la última página, Z=sí / X=no → cb(bool) */
function ask(pages,who,cb){ dlg={pages:paginate(pages,who),page:0,chars:0,cb:null,who:who||null,ask:cb}; state='dialog'; }

/* transición de pantalla */
let trans=null; // {dx,dy,t,dur,from,to}

