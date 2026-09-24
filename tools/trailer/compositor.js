'use strict';
/* ============================================================
   TRÁILER DE SPROUT (v2, limpio) — compositor a resolución nativa
   Formatos: '16x9' (1920×1080) y '9x16' (1080×1920). El juego se pinta a
   escala entera (12×, 8×, 6×: siempre par, así el 4:2:0 no mancha los
   bordes). El texto es vectorial (Fredoka), con sombra suave.
   La música es la del juego (OfflineAudioContext, reloj falso); los efectos
   del juego suenan en el fotograma exacto en que se ve cada imagen.
   ============================================================ */
window.TR=(function(){
const FPS=60;
let W=1920, H=1080, FMT='16x9', C=null, g=null;
function init(fmt){ FMT=fmt; if(fmt==='9x16'){ W=1080; H=1920; } else { W=1920; H=1080; }
  C=document.createElement('canvas'); C.width=W; C.height=H; g=C.getContext('2d'); g.imageSmoothingEnabled=false; Object.assign(API,{W,H,FMT,C,g,V:fmt==='9x16'}); }
const cl=(v,a,b)=>Math.max(a,Math.min(b,v)), lp=(a,b,k)=>a+(b-a)*k, seg=(t,a,b)=>cl((t-a)/(b-a),0,1), R=Math.round;
const E={lin:k=>k,in:k=>k*k,out:k=>1-(1-k)*(1-k),io:k=>k*k*(3-2*k),out3:k=>1-Math.pow(1-k,3),in3:k=>k*k*k,back:k=>{const c=1.70158,t=k-1;return 1+(c+1)*t*t*t+c*t*t;}};
/* ---------- sonido ---------- */
const ORIG={beep:window.beep,noise:window.noise,swish:window.swish,setTrack:window.setTrack};
let sfxK=1;
function soundMode(mode,k){
  if(mode==='mute'){ window.beep=()=>{}; window.noise=()=>{}; window.swish=()=>{}; }
  else if(mode==='game'){ sfxK=k===undefined?1:k; window.beep=(a,b,c,d,v,w,x)=>ORIG.beep(a,b,c,d,v*sfxK,w,x); window.noise=(d,v,h,w,f)=>ORIG.noise(d,v*sfxK,h,w,f); window.swish=(d,v,a,b,c,w,q,h)=>ORIG.swish(d,v*sfxK,a,b,c,w,q,h); }
  else { window.beep=ORIG.beep; window.noise=ORIG.noise; window.swish=ORIG.swish; }
  window.setTrack=()=>{}; window.musicIntensity=()=>{}; window.musicAmbush=()=>{}; window.musicMuffle=()=>{}; }
function trackAt(name,t,step){ ORIG.setTrack.call(window,name); musicStep=step||0; nextNoteT=t/FPS; }
function musicGain(v,t,ramp){ const G=musicBus.gain, T=t/FPS; G.cancelScheduledValues(T); if(ramp){ G.setValueAtTime(G.value,T); G.linearRampToValueAtTime(v,T+ramp/FPS); } else G.setValueAtTime(v,T); }
const MB=volCurve(7)*2.1;
const FX={
  whoosh(d,up){ const t=AC.currentTime; ORIG.swish(d||.4,.08,up?450:2400,up?2400:1300,up?5200:480,t,1.1); },
  boom(k){ k=k||1; const t=AC.currentTime; ORIG.beep('triangle',130,30,.8,.18*k,t); ORIG.noise(.45,.08*k,false,t,520); DRUMS.c(t,.08*k); },
  riser(d){ const t=AC.currentTime; ORIG.swish(d,.06,240,1100,6800,t,2.4); ORIG.beep('p25',165,1320,d,.008,t+.03); },
  heart(k){ const t=AC.currentTime; ORIG.beep('triangle',70,36,.18,.15*(k||1),t); ORIG.noise(.05,.03*(k||1),false,t,280); },
  chime(){ const t=AC.currentTime; [88,95].forEach((m,i)=>ORIG.beep('square',f(m),0,.18,.03,t+i*.09)); },
};
function sfx(name,...a){ if(AC) FX[name](...a); }
/* ---------- los planos del juego (ver shots.js): se ruedan en memoria justo antes de hacer falta ---------- */
const SHOTS={}; let SHOT_DEFS={}; const DONE=new Set(); let curF=0;
function defineShots(d){ SHOT_DEFS=d; }
function fresh(){ window.showToast=()=>{}; newGame(); introDone=true; inBed=false; wakeT=0; state='play'; elderMet=true; petraWoke=true;
  hasBlade=true; bladeLvl=2; hasSpin=true; toast=null; toastQ=[]; placeBanner=null; bossCard=null; pendingSay=null; dlg=null; fadeIn=0;
  won=thawed=summered=autumned=true; cycled=false; SEASON_FORCE=0; seeds=5; player.maxHp=player.hp=12; hitStop=0; shake=0; parts=[];
  for(const n of ['flyText','projs','bombs','windProjs','gusts']) if(Array.isArray(window[n])) window[n].length=0; else try{ const a=eval(n); if(Array.isArray(a)) a.length=0; }catch(_){} }
function keysFrom(k){ const K=k||{}; for(const n of ['left','right','up','down']) keys[n]=!!K[n]; if(K.fire) keys.fire=true; if(K.alt) keys.alt=true; keys.fireHeld=!!K.fireHeld||!!K.hold; keys.altHeld=!!K.altHeld; if(K.fn) K.fn(); }
function capture(id,at){ const S=SHOT_DEFS[id.split('#')[0]]; if(!S) throw new Error('plano '+id); if(SHOTS[id]){ SHOTS[id].last=curF; return SHOTS[id]; }
  const again=DONE.has(id); DONE.add(id);
  const keepT=__fakeT, keepState=state, keepHurt=window.hurt; soundMode('mute'); if(S.god!==false) window.hurt=()=>{};
  fresh(); S.setup&&S.setup(); if(!S.banner) placeBanner=null; markDirty&&markDirty();
  const inp=S.input||(()=>null), pre=S.pre||0;
  for(let i=-pre;i<0;i++){ if(S.skipDlg!==false&&state==='dialog'&&dlg){ dlg.chars=9999; keys.fire=true; update(); continue; } keysFrom(inp(i)); if(S.each) S.each(i); update(); }
  if(!S.banner) placeBanner=null;
  if(again) soundMode('mute'); else soundMode('game',S.sfx===undefined?.9:S.sfx);
  const fr=[], pos=[]; for(let i=0;i<S.len;i++){ __fakeT=(at+i)/FPS; keysFrom(inp(i)); if(S.each) S.each(i); update(); if(!S.banner) placeBanner=null; draw();
    const c=mkCanvas(160,144); c.getContext('2d').drawImage(cv,0,0); fr.push(c); const B=(typeof boss!=='undefined'&&boss)||(typeof midboss!=='undefined'&&midboss);
    pos.push([player.x,player.y,sx,sy,state,B?B.x+(B.w||32)/2:null,B?B.y+(B.h||32)/2:null]); }
  keysFrom(null); window.hurt=keepHurt; if(S.after) S.after(); soundMode('orig'); __fakeT=keepT; state=keepState; SHOTS[id]={frames:fr,pos,at,last:curF}; return SHOTS[id]; }
function release(){ for(const id in SHOTS) if(curF-SHOTS[id].last>90) delete SHOTS[id]; }
/* ---------- dibujar ---------- */
function game(img,sx,sy,sw,sh,dx,dy,k){ g.drawImage(img,sx,sy,sw,sh,R(dx),R(dy),sw*k,sh*k); }
function fill(col,a){ g.globalAlpha=a===undefined?1:cl(a,0,1); g.fillStyle=col; g.fillRect(0,0,W,H); g.globalAlpha=1; }
function rect(x,y,w,h,col,a){ g.globalAlpha=a===undefined?1:cl(a,0,1); g.fillStyle=col; g.fillRect(R(x),R(y),R(w),R(h)); g.globalAlpha=1; }
function rrect(x,y,w,h,r,col,a){ g.globalAlpha=a===undefined?1:cl(a,0,1); g.fillStyle=col; g.beginPath(); g.roundRect(x,y,w,h,r); g.fill(); g.globalAlpha=1; }
/* fondo: el mismo fotograma, grande, desenfocado y oscurecido (llena el formato vertical) */
function backdrop(img,sx,sy,sw,sh,dim){ g.save(); g.imageSmoothingEnabled=true; g.filter='blur('+(V()?44:36)+'px) saturate(1.25) brightness('+(dim===undefined?.42:dim)+')';
  const k=Math.max(W/sw,H/sh)*1.15; g.drawImage(img,sx,sy,sw,sh,R(W/2-sw*k/2),R(H/2-sh*k/2),R(sw*k),R(sh*k)); g.restore(); g.imageSmoothingEnabled=false; }
function V(){ return FMT==='9x16'; }
/* sombra dura y fina bajo un marco de juego (para los planos enmarcados) */
function frameShadow(x,y,w,h){ g.save(); g.shadowColor='rgba(0,0,0,.55)'; g.shadowBlur=40; g.shadowOffsetY=12; g.fillStyle='#000'; g.fillRect(x,y,w,h); g.restore(); }
/* ---------- tipografía vectorial ---------- */
const FONT='Fredoka';
function vset(o){ g.font=(o.w||600)+' '+(o.size||64)+'px "'+FONT+'"'; g.letterSpacing=(o.ls||0)+'px'; g.textAlign=o.align||'center'; g.textBaseline='alphabetic'; }
function vtext(s,x,y,o){ o=o||{}; const a=o.a===undefined?1:o.a; if(a<=0) return; vset(o); g.save(); g.globalAlpha=cl(a,0,1);
  if(o.shadow!==false){ g.shadowColor='rgba(8,14,10,'+(o.sa||.6)+')'; g.shadowBlur=o.sb||(o.size||64)*.35; g.shadowOffsetY=o.sy===undefined?(o.size||64)*.06:o.sy; }
  g.fillStyle=o.col||'#fffbe8'; g.fillText(s,x,y); g.restore(); }
function vwidth(s,o){ vset(o||{}); return g.measureText(s).width; }
/* una frase que entra palabra a palabra (sube y aparece) y se va (se desvanece): u = fotogramas desde que empieza */
function vwords(s,x,y,o,u,dur){ o=o||{}; const words=s.split(' '), sp=vwidth(' ',o), ws=words.map(w=>vwidth(w,o)), total=ws.reduce((a,b)=>a+b,0)+sp*(words.length-1);
  let cx=(o.align==='left')?x:(o.align==='right'?x-total:x-total/2); const out=dur!==undefined?cl((u-(dur-14))/14,0,1):0;
  words.forEach((w,i)=>{ const t=u-i*(o.stagger||4), k=E.out3(cl(t/18,0,1)); if(k>0){ vtext(w,cx,y+R((1-k)*(o.rise||22))-R(out*10),Object.assign({},o,{align:'left',a:k*(1-out)*(o.a===undefined?1:o.a)})); } cx+=ws[i]+sp; }); }
/* ---------- transiciones (spans por filas) ---------- */
function clipSpans(spans,fn){ g.save(); g.beginPath(); for(const [y,a,b] of spans) if(b>a) g.rect(a,y,b-a,1); g.clip(); fn(); g.restore(); }
function clipCircle(cx,cy,r,fn){ g.save(); g.beginPath(); g.arc(cx,cy,Math.max(0,r),0,Math.PI*2); g.clip(); fn(); g.restore(); }
/* ---------- el director ---------- */
let CLIPS=[], EVENTS=[], EV_I=0;
function timeline(clips,events){ CLIPS=clips; EVENTS=events.sort((a,b)=>a[0]-b[0]); EV_I=0; }
function frameAt(f,fmt){ __fakeT=f/FPS; curF=f;
  while(EV_I<EVENTS.length&&EVENTS[EV_I][0]<=f){ const ev=EVENTS[EV_I++]; try{ ev[1](); }catch(e){ console.error('evento '+ev[0]+': '+e.message); } }
  tick=200000+f; g.setTransform(1,0,0,1,0,0); g.globalAlpha=1; g.globalCompositeOperation='source-over'; g.filter='none'; g.fillStyle='#000'; g.fillRect(0,0,W,H);
  for(const c of CLIPS) if(f>=c.a&&f<c.b){ g.save(); try{ c.draw(f-c.a,f,c); }catch(e){ console.error('clip '+(c.name||'?')+' @'+f+': '+e.message+' '+(e.stack||'').split('\n')[1]); } g.restore(); }
  release(); __fakeT=f/FPS; const keep=state; state='__tr'; if(window.__musicTick) __musicTick(); state=keep;
  return C.toDataURL('image/png'); }
const API={FPS,init,cl,lp,seg,E,R,soundMode,trackAt,musicGain,MB,sfx,FX,ORIG,defineShots,capture,fresh,game,fill,rect,rrect,backdrop,frameShadow,vtext,vwords,vwidth,clipSpans,clipCircle,timeline,frameAt,SHOTS};
return API;
})();
