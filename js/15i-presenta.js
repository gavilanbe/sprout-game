'use strict';
/* ============================================================
   PRESENTACIONES: lo que pasa al llegar y al irse.
   · Al entrar en una mazmorra desde fuera: su TÍTULO (DNG_CARD[dng]).
   · Al entrar en la sala de un jefe o un minijefe: su ENTRADA, una
     cinemática corta con su título temático (BOSS_INTRO[tipo]).
     La primera vez, entera; las siguientes, la versión corta (P.short).
   · Al coger la reliquia de un jefe vencido: su SALIDA, que te lleva
     al inicio de la mazmorra (BOSS_OUTRO[tipo]).
   Mientras dura, el mundo está quieto (state 'present' / 'outro'):
   nadie se mueve ni hace daño. Z salta (a partir de SKIP_T).
   Los registros los rellena cada mazmorra en su fichero:
   15j cueva (topo, king) · 15k tronco (avispa, drone) ·
   15l templo (viento, iceguard) · 15m molino (ciervo, scare).
   ------------------------------------------------------------
   CONTRATO de un registro R (todas las funciones son opcionales salvo draw):
     dur, shortDur      fotogramas (entera / corta)
     start(P)           al empezar (puede tocar boss/midboss: posición, st...)
     tick(t,P)          cada fotograma (partículas, sonidos: t es un entero 1..dur)
     draw(t,P)          encima de la escena (drawScene ya pintó sala, jefe y Sprout)
     end(P)             al acabar o saltar: deja al jefe listo para pelear
   P = {Q, R, t, dur, short, skip, music, st:{} (libre para el registro)}
     Q.kind 'dng'|'boss'|'outro' · Q.dng · Q.type · Q.echo · Q.mid
   Ayudas: bossHidden (true: drawScene no pinta al jefe/minijefe; la
   entrada lo dibuja a su manera), presentBars(k), presentMusic(P),
   presentEase, presentTitleShadow.
   BOSS_OUTRO[tipo] además: swap (fotograma en que se cambia de pantalla)
   y dest {sx,sy,x,y,dir} (dónde apareces). draw(t,P) sirve para las dos
   mitades (antes y después de swap).
   ============================================================ */
const BOSS_INTRO={}, DNG_CARD={}, BOSS_OUTRO={};
const SKIP_T=24;
const RELIC_BOSS={ember:'topo',tear:'avispa',flake:'viento',amber:'ciervo'};
let presentQ=null, pres=null, bossHidden=false, lastDng=null;

/* al final de loadScreen: ¿toca presentar algo cuando empiece a jugarse la pantalla? */
function queuePresent(){
  const d=dungeonOf(sx,sy), B=boss||midboss;
  presentQ=null;
  if(B){ const type=B.type; if(BOSS_INTRO[type]){ presentQ={kind:'boss',type,echo:!!(boss&&boss.echo),mid:!boss}; bossCard=null; } }
  else if(d&&d!==lastDng&&DNG_CARD[d]) presentQ={kind:'dng',dng:d};
  lastDng=d;
}
function presentPending(){ return !!presentQ; }
/* la llamada del bucle de juego: arranca lo que haya en cola (true si ha empezado algo) */
function startPresent(){
  const Q=presentQ; presentQ=null; if(!Q) return false;
  const R=Q.kind==='boss'?BOSS_INTRO[Q.type]:Q.kind==='outro'?BOSS_OUTRO[Q.type]:DNG_CARD[Q.dng]; if(!R) return false;
  const seen='pi'+(Q.kind==='boss'?Q.type+(Q.echo?'~e':''):Q.kind==='outro'?'o'+Q.type:Q.dng), short=Q.kind!=='outro'&&hinted.has(seen); hinted.add(seen);
  pres={Q,R,t:0,short,dur:short?(R.shortDur||R.dur):R.dur,skip:false,music:curTrack,st:{},swapped:false};
  state=Q.kind==='outro'?'outro':'present';
  player.atk=player.spin=player.charge=0; player.kx=player.ky=0; keys.fire=keys.alt=false; bossCard=null; toast=null;
  if(R.start) R.start(pres);
  return true;
}
function updPresent(){ const P=pres; if(!P){ state='play'; return; }
  P.t++;
  if(P.Q.kind==='outro'&&!P.swapped&&P.t>=(P.R.swap||1)) outroSwap(P);
  if(P.R.tick) P.R.tick(P.t,P);
  updParts();
  if((keys.fire||keys.alt)&&P.t>=SKIP_T&&P.Q.kind!=='outro'){ keys.fire=keys.alt=false; P.skip=true; }
  keys.fire=keys.alt=false;
  if(P.skip||P.t>=P.dur) endPresent(); }
function outroSwap(P){ P.swapped=true; const D=P.R.dest; if(!D) return;
  placeAtNow(D.sx,D.sy,D.x,D.y,D.dir===undefined?0:D.dir); presentQ=null; if(bgDirty) rebuildBg(); bgEnsure(bgFrame()); }
function endPresent(){ const P=pres; if(!P) return;
  if(P.Q.kind==='outro'&&!P.swapped) outroSwap(P);
  if(P.R.end) P.R.end(P);
  pres=null; bossHidden=false; state='play'; keys.fire=keys.alt=false;
  if(P.Q.kind==='boss'&&curTrack!==P.music) setTrack(P.music);
  if(P.Q.kind==='outro'){ presentQ=null; save(); saveFlash=45; } }
function drawPresent(){ const P=pres; if(!P) return; P.R.draw(Math.min(P.t,P.dur),P);
  if(P.t>=SKIP_T+6&&P.dur-P.t>30&&P.Q.kind!=='outro'){ const a=Math.min(1,(P.t-SKIP_T-6)/12); ctx.globalAlpha=a*(.55+.25*Math.sin(tick*.12)); ctx.fillStyle='rgba(0,0,0,.72)'; ctx.fillRect(117,VH-11,43,11); txtS('Z: SALTAR',157,VH-8,'#e8e0d0','right'); ctx.globalAlpha=1; } } // con su pastilla oscura: sobre el HUD también se lee
/* al coger una reliquia (getItem): la salida del jefe, cuando acaben el objeto y su texto */
function queueOutro(kind){ const type=RELIC_BOSS[kind]; if(type&&BOSS_OUTRO[type]&&!(boss&&boss.echo)) presentQ={kind:'outro',type}; }

/* ---------- ayudas comunes ---------- */
function presentBars(k,h){ h=Math.round((h||14)*clamp(k,0,1)); if(h<=0) return; ctx.fillStyle='#000'; ctx.fillRect(-4,-4,VW+8,h+4); ctx.fillRect(-4,VH-h,VW+8,h+4); }
function presentMusic(P){ if(curTrack!==P.music) setTrack(P.music); }
const presentEase={ out:k=>1-(1-k)*(1-k)*(1-k), in:k=>k*k*k, io:k=>k<.5?4*k*k*k:1-Math.pow(-2*k+2,3)/2, back:k=>easeOutBack(clamp(k,0,1)) };
function presentSeg(t,a,b){ return clamp((t-a)/(b-a),0,1); }
