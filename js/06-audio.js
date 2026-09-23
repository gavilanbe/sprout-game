'use strict';
/* ============================================================
   AUDIO — chiptune WebAudio con identidad propia.
   Voces por pista: melodía, contramelodía/armonía, arpegio, bajo y
   ruido, con ondas de pulso a lo Game Boy. La mezcla va por buses:
   música y efectos por separado (cada uno con su volumen), paneo
   estéreo suave por voz, un eco global con realimentación filtrada
   y un compresor al final.
   Cada pista tiene tres pasadas que se alternan (base, octava arriba
   con arpegio, y dúo: una segunda voz que armoniza la melodía) y
   redobles al final de cada frase. Las pistas de combate suben de
   intensidad con musicIntensity(0|1|2): más tempo, charles, arpegio
   y la melodía doblada.
   El MOTIVO DE SPROUT («el brote trepa»: la-si-do-re-mi) recorre el
   título, el valle y los jefes; la NANA DE RAÍZ suena en casa, en la
   cima en paz, en los créditos y en el final.
   ============================================================ */
let AC=null, master=null, musicBus=null, sfxBus=null, OUT=null, musicOn=true, musicTimer=null, musicStep=0, nextNoteT=0;
let delaySend=null, delayWet=null, mIntTarget=0, musicBeforeAmbush=null, musicLP=null;
const VOICE={};
try{ if(localStorage.getItem('sprout.music')==='0') musicOn=false; }catch(e){}
const WAVES={};
function pulseWave(duty){ // onda de pulso por serie de Fourier (32 armónicos)
  const n=32, re=new Float32Array(n), im=new Float32Array(n);
  for(let k=1;k<n;k++){ im[k]=(2/(k*Math.PI))*Math.sin(k*Math.PI*duty); }
  return AC.createPeriodicWave(re,im,{disableNormalization:false});
}
/* volúmenes: 0-10 en las opciones, curva perceptiva */
function volCurve(v){ v=Math.max(0,Math.min(10,v==null?7:v)); return v===0?0:Math.pow(v/10,1.7); }
function audioOpts(){ return (typeof opts!=='undefined'&&opts)?opts:{}; }
/* con los valores por defecto (7 y 8) la música suena unos 2 dB por debajo de la versión anterior
   y los efectos igual que antes: quedan algo más por delante de la música */
function applyVolumes(){ if(!AC) return; const o=audioOpts(), t=AC.currentTime;
  musicBus.gain.setTargetAtTime(volCurve(o.musVol??7)*2.1,t,.05); sfxBus.gain.setTargetAtTime(volCurve(o.sfxVol??8)*1.45,t,.03); }
/* con el zurrón abierto la música suena amortiguada, como oída desde dentro de la bolsa */
function musicMuffle(on){ if(!AC||!musicLP) return; const t=AC.currentTime; musicLP.frequency.cancelScheduledValues(t); musicLP.frequency.setTargetAtTime(on?1300:22000,t,on?.07:.12); }
function audio(){
  if(!AC){ AC=new (window.AudioContext||window.webkitAudioContext)();
    master=AC.createDynamicsCompressor(); master.threshold.value=-14; master.knee.value=12; master.ratio.value=5; master.attack.value=.004; master.release.value=.12;
    const vol=AC.createGain(); vol.gain.value=.9; master.connect(vol).connect(AC.destination);
    musicBus=AC.createGain(); sfxBus=AC.createGain(); sfxBus.connect(master);
    musicLP=AC.createBiquadFilter(); musicLP.type='lowpass'; musicLP.frequency.value=22000; musicLP.Q.value=.7; musicBus.connect(musicLP).connect(master); // el zurrón la amortigua
    // eco de la música: envío → retardo con realimentación filtrada → de vuelta a la mezcla
    delaySend=AC.createGain(); const dl=AC.createDelay(1), fb=AC.createGain(), lp=AC.createBiquadFilter();
    dl.delayTime.value=.27; fb.gain.value=.3; lp.type='lowpass'; lp.frequency.value=2300; delayWet=AC.createGain(); delayWet.gain.value=.16;
    delaySend.connect(dl); dl.connect(lp); lp.connect(fb); fb.connect(dl); lp.connect(delayWet); delayWet.connect(musicBus);
    // un bus por voz, con su sitio en el estéreo y su envío al eco
    for(const [k,pan,send] of [['lead',0,.34],['harm',-.28,.22],['arp',.34,.42],['duet',.2,.3],['bass',0,0],['drum',0,.04]]){
      const g=AC.createGain();
      if(AC.createStereoPanner){ const p=AC.createStereoPanner(); p.pan.value=pan; g.connect(p); p.connect(musicBus); } else g.connect(musicBus);
      if(send){ const s=AC.createGain(); s.gain.value=send; g.connect(s); s.connect(delaySend); }
      VOICE[k]=g; }
    WAVES.p125=pulseWave(.125); WAVES.p25=pulseWave(.25); WAVES.p50=null; // 50% = square nativo
    applyVolumes(); startMusic(); }
  else if(AC.state!=='running'&&AC.state!=='closed') AC.resume(); // también «interrupted» (iOS al volver de otra app)
  return AC;
}
function f(m){ return 440*Math.pow(2,(m-69)/12); }
function osc(type){ const o=AC.createOscillator(); if(type==='p125'||type==='p25'){ o.setPeriodicWave(WAVES[type]); } else o.type=type; return o; }
/* con un LFO enchufado a la frecuencia, Chrome calcula el oscilador muestra a muestra y de vez en cuando
   suelta una muestra disparatada (un «clic»): el vibrato va por bloques de 128 muestras, que no se oye */
function kRate(o){ try{ o.frequency.automationRate='k-rate'; o.detune.automationRate='k-rate'; }catch(_){} }
/* beep: tono con envolvente exponencial (y vibrato opcional). Suena por el bus de efectos (o por OUT) */
function beep(type,f0,f1,dur,vol,when,vib){
  const a=audio(), t=when||a.currentTime;
  const o=osc(type), g=a.createGain(); g.gain.value=0; // sin esto la ganancia vale 1 hasta t y puede colarse un chasquido
  o.frequency.setValueAtTime(f0,t);
  if(f1&&f1!==f0) o.frequency.exponentialRampToValueAtTime(Math.max(f1,1),t+dur); // rampa entre valores iguales: Chrome suelta un chasquido enorme
  if(vib){ kRate(o); const lf=a.createOscillator(), lg=a.createGain(); lf.frequency.value=5.5; lg.gain.value=f0*.012; lf.connect(lg).connect(o.frequency); lf.start(t+.12); lf.stop(t+dur+.02); }
  g.gain.setValueAtTime(vol,t); g.gain.exponentialRampToValueAtTime(.0001,t+dur);
  o.connect(g).connect(OUT||sfxBus); o.start(t); o.stop(t+dur+.02);
}
/* nota con envolvente ADSR corta: la voz de los instrumentos (bus por voz) */
function note(type,m,dur,vol,when,opt){
  const a=AC, t=when; opt=opt||{}; const bus=opt.bus||VOICE.lead||musicBus;
  const mk=(det,v)=>{ const o=osc(type), g=a.createGain(); g.gain.value=0;
    o.frequency.setValueAtTime(f(m),t); if(det) o.detune.setValueAtTime(det,t);
    if(opt.slide) o.frequency.exponentialRampToValueAtTime(f(m+opt.slide),t+dur*.9);
    if(opt.vib&&dur>.25){ kRate(o); const lf=a.createOscillator(), lg=a.createGain(); lf.frequency.value=5.2; lg.gain.value=f(m)*.009; lf.connect(lg).connect(o.frequency); lf.start(t+.15); lf.stop(t+dur+.02); }
    const at=opt.attack||.008, rel=Math.min(.09,dur*.35), sus=opt.sustain===undefined?.72:opt.sustain;
    g.gain.setValueAtTime(.0001,t); g.gain.exponentialRampToValueAtTime(v,t+at);
    g.gain.exponentialRampToValueAtTime(Math.max(.0002,v*sus),t+Math.max(at+.01,dur-rel));
    g.gain.exponentialRampToValueAtTime(.0001,t+dur);
    o.connect(g).connect(bus); o.start(t); o.stop(t+dur+.02); };
  if(opt.detune){ mk(-opt.detune,vol*.62); mk(opt.detune,vol*.62); } else mk(0,vol); // «fat»: dos osciladores desafinados
  if(opt.echo){ const g2=a.createGain(), o2=osc(type); g2.gain.value=0; o2.frequency.setValueAtTime(f(m),t+opt.echo); g2.gain.setValueAtTime(.0001,t+opt.echo); g2.gain.exponentialRampToValueAtTime(vol*.3,t+opt.echo+.01); g2.gain.exponentialRampToValueAtTime(.0001,t+opt.echo+Math.min(dur,.22)); o2.connect(g2).connect(bus); o2.start(t+opt.echo); o2.stop(t+opt.echo+.25); }
}
let noiseBuf=null;
function noise(dur,vol,hp,when,freq){
  const a=audio(), t=when||a.currentTime;
  if(!noiseBuf){ noiseBuf=a.createBuffer(1,a.sampleRate*0.5,a.sampleRate); const d=noiseBuf.getChannelData(0); for(let i=0;i<d.length;i++) d[i]=Math.random()*2-1; }
  const s=a.createBufferSource(); s.buffer=noiseBuf; const g=a.createGain(), fl=a.createBiquadFilter();
  g.gain.value=0; // el arranque de un buffer puede caer una muestra antes que la envolvente: con ganancia 1 sonaba un «clic»
  fl.type=hp?'highpass':'lowpass'; fl.frequency.value=freq||(hp?3000:1200);
  g.gain.setValueAtTime(vol,t); g.gain.exponentialRampToValueAtTime(.0001,t+dur);
  s.connect(fl).connect(g).connect(OUT||sfxBus); s.start(t); s.stop(t+dur);
}
/* ráfaga de aire filtrada que sube y baja: el «fsss» de una hoja que corta el aire (y el roce de la hierba).
   bandpass (o highpass) de f0 → f1 → f2; la envolvente arranca en cero para que no chasquee */
function swish(dur,vol,f0,f1,f2,when,q,hp){
  const a=audio(), t=when||a.currentTime;
  if(!noiseBuf){ noiseBuf=a.createBuffer(1,a.sampleRate*0.5,a.sampleRate); const d=noiseBuf.getChannelData(0); for(let i=0;i<d.length;i++) d[i]=Math.random()*2-1; }
  const s=a.createBufferSource(); s.buffer=noiseBuf; const fl=a.createBiquadFilter(), g=a.createGain();
  fl.type=hp?'highpass':'bandpass'; fl.Q.value=q||1.2; fl.frequency.setValueAtTime(f0,t); fl.frequency.exponentialRampToValueAtTime(f1,t+dur*.45); fl.frequency.exponentialRampToValueAtTime(f2,t+dur);
  g.gain.value=0; g.gain.setValueAtTime(.0001,t); g.gain.exponentialRampToValueAtTime(vol,t+dur*.3); g.gain.exponentialRampToValueAtTime(.0001,t+dur);
  s.connect(fl).connect(g).connect(OUT||sfxBus); s.start(t); s.stop(t+dur+.02);
}
/* batería del canal de ruido: bombo, caja, charles, abierto, tom, platillo */
const DRUMS={
  k(t,v){ beep('triangle',160,36,.14,v*1.35,t); noise(.03,v*.55,false,t,500); },
  s(t,v){ noise(.12,v*.9,false,t,4200); noise(.05,v*.4,true,t,2000); beep('triangle',230,120,.06,v*.5,t); },
  h(t,v){ noise(.028,v*.5,true,t,7000); },
  o(t,v){ noise(.1,v*.45,true,t,5500); },
  t(t,v){ beep('triangle',130,62,.14,v*1.1,t); },
  c(t,v){ noise(.5,v*.5,true,t,4200); noise(.2,v*.3,false,t,6000); },
};
/* ---------- efectos ---------- */
const SFX = {
  sword(){ const t=audio().currentTime; swish(.16,.13,700,3200,1300,t,1.1); swish(.05,.035,5200,6200,4600,t+.02,.8,true); }, // la Hoja corta el aire
  cut(){ const t=audio().currentTime; swish(.09,.1,2600,3600,1800,t,1.4); swish(.12,.08,1800,2400,900,t+.05,1.1); }, // «chas-chas» de hojas
  leafHit(){ const t=audio().currentTime; swish(.05,.06,4200,5200,3000,t,.9,true); swish(.09,.055,2600,1400,900,t+.01,1.3); beep('triangle',200,110,.07,.03,t); }, // la Hoja da: un «chas» fresco
  hurt(){ beep('square',180,70,.25,.07); },
  wilt(){ const a=audio(),t=a.currentTime; [62,59,55,50,43].forEach((m,i)=>beep('triangle',f(m),0,.32,.06,t+i*.16)); },
  regrow(){ const a=audio(),t=a.currentTime; [55,60,64,67,72].forEach((m,i)=>beep('square',f(m),0,.14,.05,t+i*.09)); },
  ehit(){ beep('square',420,120,.12,.05); },
  edie(){ beep('square',300,60,.2,.05); noise(.15,.04,false); },
  heart(){ beep('square',880,0,.07,.05); beep('square',1320,0,.12,.05,audio().currentTime+.08); },
  seed(){ const a=audio(),t=a.currentTime; [69,71,72,74,76].forEach((m,i)=>beep('square',f(m+12),0,.09,.045,t+i*.06)); beep('square',f(88),0,.25,.04,t+.32); }, // el motivo, en agudo
  blip(){ beep('square',1100,0,.025,.025); },
  secret(){ const a=audio(),t=a.currentTime; [76,80,83,88,83,80,76,88].forEach((m,i)=>beep('p25',f(m),0,.1,.05,t+i*.07)); beep('triangle',f(64),0,.5,.05,t); },
  bump(){ beep('square',120,80,.06,.03); },
  fanfare(){ const a=audio(),t=a.currentTime; // ¡objeto!: el motivo con acordes
    [[69,0,.13],[71,.13,.13],[72,.26,.13],[74,.39,.13],[76,.52,.3],[81,.86,.55]].forEach(([m,d,du])=>{ beep('square',f(m),0,du,.06,t+d); beep('p25',f(m-12),0,du,.035,t+d); });
    [[57,0],[57,.26],[60,.52],[57,.86]].forEach(([m,d])=>beep('triangle',f(m),0,.3,.06,t+d)); },
  boss(){ const a=audio(),t=a.currentTime; [[38,0],[38,.18],[44,.36],[43,.62]].forEach(([m,d])=>beep('square',f(m),0,.22,.07,t+d)); noise(.4,.05,false,t+.62); },
  thud(i=0){ const a=audio(),t=a.currentTime; beep('triangle',112+i*16,38,.22,.095,t); noise(.09,.05,false,t); },
  shing(){ const a=audio(),t=a.currentTime; beep('square',1400,2600,.16,.02,t); beep('square',2100,3400,.12,.012,t+.05); },
  ping(){ beep('square',1800,2400,.07,.028); },
  chime(){ const a=audio(),t=a.currentTime; [76,83].forEach((m,i)=>beep('square',f(m),0,.16,.035,t+i*.09)); },
  swoosh(){ noise(.26,.022,false); },
  menuIn(){ const a=audio(),t=a.currentTime; [64,69,72,76].forEach((m,i)=>beep('square',f(m),0,.09,.038,t+i*.06)); },
  gbDing(){ const a=audio(),t=a.currentTime; beep('square',f(83),0,.10,.09,t); beep('square',f(95),0,.55,.09,t+.10); },
  jump(){ beep('square',300,720,.14,.05); },
  land(){ noise(.06,.04,false); beep('square',180,90,.06,.03); },
  boomer(){ beep('square',900,600,.06,.03); },
  torch(){ noise(.12,.05,true); beep('triangle',420,880,.18,.05); },
  crystal(){ const a=audio(),t=a.currentTime; [84,88,91].forEach((m,i)=>beep('p25',f(m),0,.12,.04,t+i*.05)); },
  key(){ const a=audio(),t=a.currentTime; [76,83,88].forEach((m,i)=>beep('square',f(m),0,.1,.05,t+i*.07)); beep('p25',f(95),0,.18,.025,t+.21); },
  unlock(){ const a=audio(),t=a.currentTime; noise(.06,.05,true,t,5000); beep('square',260,240,.05,.05,t); noise(.1,.05,false,t+.08); beep('square',200,400,.12,.05,t+.12); beep('square',400,800,.2,.05,t+.22); beep('p25',f(88),0,.2,.03,t+.34); },
  fall(){ beep('square',400,60,.5,.06); },
  stun(){ beep('square',700,700,.05,.03); beep('square',700,700,.05,.03,audio().currentTime+.08); },
  equip(){ beep('square',660,0,.06,.04); beep('square',990,0,.1,.04,audio().currentTime+.06); },
  menu(){ beep('square',520,0,.04,.03); },
  // el zurrón (15b): cae, aterriza, la hebilla, la solapa, se cierra, se va; y las pestañas
  bagDrop(){ const a=audio(),t=a.currentTime; noise(.12,.02,false,t,1500); beep('triangle',700,300,.12,.02,t); },
  bagThud(){ const a=audio(),t=a.currentTime; beep('triangle',150,55,.13,.08,t); noise(.06,.035,false,t,600); },
  buckle(){ const a=audio(),t=a.currentTime; beep('square',2300,2000,.02,.016,t); beep('square',1500,1400,.03,.014,t+.03); },
  flap(){ const a=audio(),t=a.currentTime; noise(.09,.028,false,t,2600); beep('p25',f(79),f(84),.08,.018,t+.02); },
  bagClose(){ const a=audio(),t=a.currentTime; noise(.08,.028,false,t,2200); beep('p25',f(84),f(79),.07,.016,t); },
  bagAway(){ const a=audio(),t=a.currentTime; noise(.14,.018,false,t,1800); beep('triangle',300,760,.13,.024,t); },
  tab(){ const a=audio(),t=a.currentTime; noise(.035,.022,true,t,3800); beep('square',900,1200,.035,.018,t); },
  // el momento del arma (15d): la atrapa, y el obturador que congela la viñeta
  momentCatch(){ const a=audio(),t=a.currentTime; [72,76,79].forEach((m,i)=>beep('p25',f(m),0,.07,.03,t+i*.035)); noise(.05,.02,true,t,5000); },
  momentFreeze(){ const a=audio(),t=a.currentTime; noise(.04,.05,true,t,6500); beep('square',1900,950,.03,.02,t); beep('triangle',112,40,.34,.1,t+.012); noise(.24,.035,false,t+.02,700); beep('p125',f(84),f(96),.2,.022,t+.05); },
  block(){ beep('square',240,240,.05,.04); noise(.04,.03,true); },
  charge(){ beep('square',440,880,.2,.03); },
  grass(){ const t=audio().currentTime; swish(.08,.07,3200,4200,2200,t,1.6); }, // el roce de la hierba
  piece(){ const a=audio(),t=a.currentTime; [72,76,79,76,84].forEach((m,i)=>beep('square',f(m),0,.09,.05,t+i*.07)); },
  puzzle(){ const a=audio(),t=a.currentTime; [67,72,76,79,84].forEach((m,i)=>beep('p25',f(m),0,.12,.05,t+i*.08)); beep('triangle',f(48),0,.6,.06,t); },
  /* --- las mecánicas nuevas --- */
  ambushClose(){ const a=audio(),t=a.currentTime; noise(.08,.07,true,t,2500); beep('square',f(45),f(44),.22,.07,t); beep('p25',f(46),f(45),.22,.04,t); beep('triangle',90,40,.3,.1,t+.02); noise(.3,.06,false,t+.05,500); beep('square',f(57),0,.12,.04,t+.24); beep('square',f(58),0,.3,.05,t+.36); },
  ambushOpen(){ const a=audio(),t=a.currentTime; noise(.12,.04,false,t,900); [57,60,64,69,72,76].forEach((m,i)=>beep('p25',f(m),0,.12,.045,t+.05+i*.06)); beep('triangle',f(45),0,.5,.06,t+.05); },
  bellotero(){ const a=audio(),t=a.currentTime; noise(.06,.045,false,t,1600); beep('triangle',680,280,.08,.06,t); beep('square',f(84),0,.05,.02,t+.07); },
  sprout(){ const a=audio(),t=a.currentTime; beep('p25',f(79),f(86),.09,.022,t); beep('p25',f(86),0,.08,.018,t+.08); },
  mapGet(){ const a=audio(),t=a.currentTime; noise(.22,.035,true,t,1800); [72,79,84,88].forEach((m,i)=>beep('p125',f(m),0,.14,.04,t+.12+i*.07)); },
  compassGet(){ const a=audio(),t=a.currentTime; beep('square',700,1500,.22,.025,t); beep('square',1500,700,.22,.02,t+.22); [84,88,91,96].forEach((m,i)=>beep('p25',f(m),0,.1,.035,t+.4+i*.06)); },
  hookYank(){ const a=audio(),t=a.currentTime; noise(.07,.05,true,t,4000); beep('square',300,1100,.08,.05,t); beep('square',1100,500,.1,.04,t+.08); beep('triangle',160,60,.25,.09,t+.16); noise(.14,.05,false,t+.16,700); },
  clang(){ const a=audio(),t=a.currentTime; beep('square',1860,1800,.12,.035,t); beep('square',2480,2400,.09,.025,t+.01); beep('p25',930,900,.18,.03,t); noise(.06,.045,true,t,7000); },
  brazier(){ const a=audio(),t=a.currentTime; noise(.3,.06,false,t,900); noise(.18,.03,true,t+.05,3000); beep('triangle',200,700,.3,.05,t); beep('p25',f(76),0,.2,.03,t+.18); },
  brazierOut(){ const a=audio(),t=a.currentTime; noise(.4,.05,true,t,3500); beep('triangle',720,160,.35,.04,t); beep('p125',f(64),f(60),.3,.025,t+.1); },
  fallImpact(){ const a=audio(),t=a.currentTime; beep('triangle',130,38,.22,.1,t); noise(.2,.065,false,t,900); noise(.08,.04,true,t+.02,4500); },
  empty(){ const a=audio(),t=a.currentTime; beep('square',170,160,.03,.035,t); beep('square',120,110,.04,.03,t+.06); },
  phaseUp(){ const a=audio(),t=a.currentTime; DRUMS.c(t,.08); beep('triangle',f(33),f(28),.6,.12,t); beep('square',f(45),f(44),.4,.05,t); beep('square',f(52),f(51),.4,.04,t+.04); },
};
/* ============================================================
   NOTACIÓN: "A4:2" = la4 durante 2 semicorcheas · ".:4" = silencio
   Cada pista: bpm, steps (semicorcheas por compás: 16 = 4/4, 12 = 3/4),
   chords (uno por compás: [raíz, tercera, quinta] midi), voces:
   lead / harm (cadenas), bass ('waltz'|'march'|'walk'|'drone'|'pulse'|
   'octave'|'mill'|'synco'|cadena), drums (patrones por compás, letras
   k s h o t c .), instrumentos y volúmenes.
   Opciones: alt (octava arriba en la 2.ª pasada), fat (dos osciladores
   desafinados), arpVol (0 = sin arpegio), duet (false = sin dúo),
   space (cantidad de eco global), adaptive (sube con la intensidad),
   vary (false = sin pasadas alternas).
   ============================================================ */
const NOTE_IDX={C:0,D:2,E:4,F:5,G:7,A:9,B:11};
function nm(s){ // "Eb5" → midi
  const m=/^([A-G])([#b]?)(\d)$/.exec(s); if(!m) throw new Error('nota mala '+s);
  return 12*(+m[3]+1)+NOTE_IDX[m[1]]+(m[2]==='#'?1:m[2]==='b'?-1:0);
}
function N(str){ // → [[midi|0,len],...]
  return str.trim().split(/\s+/).filter(Boolean).map(tok=>{ const [n,l]=tok.split(':'); return [n==='.'?0:nm(n),+(l||1)]; });
}
function chord(root,q){ const r=nm(root); return q==='m'?[r,r+3,r+7]:q==='dim'?[r,r+3,r+6]:q==='sus'?[r,r+5,r+7]:q==='7'?[r,r+4,r+10]:[r,r+4,r+7]; }
/* acordes abreviados */
const KAm=chord('A2','m'), KC=chord('C3'), KF=chord('F2'), KG=chord('G2'), KEm=chord('E2','m'), KDm=chord('D3','m'), KE=chord('E2'), KBb=chord('Bb2'), KFm=chord('F2','m'), KAb=chord('Ab2'), KGm=chord('G2','m'), KCm=chord('C3','m'), KD=chord('D3'), KBdim=chord('B2','dim'), KEb=chord('Eb3'), KDsus=chord('D3','sus'), KCsus=chord('C3','sus');
const KA=chord('A2'), KB=chord('B2'), KDm2=chord('D2','m'), KG7=chord('G2','7');
const TRACKS={
  /* EL ALZAMIENTO DEL BROTE — tema de título. 4/4 épico: la llamada en LA, el motivo que
     germina, respuesta heroica, galope de marcha y clímax en LA5. */
  titulo:{ bpm:126, steps:16, lead:'square', harm:'p25', leadVol:.048, harmVol:.026, bassVol:.085, drumVol:.05, echo:.16, alt:true, fat:6, space:.2, arpVol:.008,
    chords:[KAm,KAm,KF,KG, KAm,KF,KG,KAm, KAm,KF,KG,KEm, KF,KG,KG,KAm],
    leadM:N('A4:16  A4:4 B4:4 C5:4 D5:4  E5:12 C5:4  D5:8 B4:4 G4:4  A4:8 C5:4 E5:4  F5:8 E5:4 D5:4  E5:4 D5:4 B4:4 D5:4  A4:16 '+
            'A4:4 A4:2 A4:2 A4:4 C5:4  C5:4 C5:2 C5:2 C5:4 F5:4  G5:8 F5:4 E5:4  D5:8 E5:4 F5:4  A5:8 G5:4 F5:4  G5:6 F5:2 E5:4 D5:4  C5:4 D5:4 E5:4 G5:4  A5:12 E5:4'),
    harmM:N('.:16  .:16  C5:4 .:4 C5:4 .:4  B4:4 .:4 B4:4 .:4  A4:4 .:4 A4:4 .:4  C5:4 .:4 C5:4 .:4  B4:4 .:4 B4:4 .:4  A4:4 .:4 A4:4 .:4 '+
            'E4:4 .:4 E4:4 .:4  F4:4 .:4 F4:4 .:4  G4:4 .:4 G4:4 .:4  G4:4 .:4 G4:4 .:4  F4:4 .:4 F4:4 .:4  G4:4 .:4 G4:4 .:4  G4:4 .:4 G4:4 .:4  E5:12 C5:4'),
    bass:'march', drums:['k...h...s...h...','k...h...s..sh...'] },
  /* VALS DEL VALLE — 3/4 alegre en Do; empieza con el motivo (la-si-do-re-mi) */
  valle:{ bpm:150, steps:12, lead:'square', harm:'p125', leadVol:.04, harmVol:.02, bassVol:.08, drumVol:.03, echo:.14, alt:true, space:.15, arpVol:.009,
    chords:[KAm,KC,KG,KAm, KAm,KC,KF,KC, KF,KG,KC,KC, KAm,KF,KG,KC],
    leadM:N('A4:2 B4:2 C5:2 D5:2 E5:4  G5:4 E5:4 C5:4  D5:2 C5:2 B4:2 A4:2 G4:4  A4:8 .:4  A4:2 B4:2 C5:2 D5:2 E5:4  G5:4 A5:4 G5:4  E5:2 D5:2 C5:2 D5:2 E5:4  C5:8 .:4 '+
            'F5:4 E5:2 D5:2 C5:4  D5:4 E5:2 F5:2 G5:4  E5:4 D5:2 C5:2 B4:4  C5:8 .:4  A4:2 B4:2 C5:2 D5:2 E5:4  G5:2 F5:2 E5:2 D5:2 C5:4  D5:4 B4:4 G4:4  C5:12'),
    hpat:'arp', bass:'waltz', drums:['k...h...h...','k...h...h.h.'] },
  /* LA NANA DE RAÍZ — 3/4, triángulo, sin prisa. Suena en casa. */
  casa:{ bpm:96, steps:12, lead:'triangle', harm:'p125', leadVol:.06, harmVol:.016, bassVol:.05, drumVol:0, echo:0, space:.22, arpVol:0,
    chords:[KC,KG,KC,KAm, KC,KG,KF,KC, KF,KC,KG,KAm, KF,KG,KC,KC],
    leadM:N('E5:4 G5:4 E5:4  D5:4 C5:4 D5:4  E5:8 C5:4  A4:12  E5:4 G5:4 E5:4  D5:4 C5:4 B4:4  C5:8 D5:4  C5:12 '+
            'F5:4 E5:4 D5:4  E5:4 D5:4 C5:4  D5:8 B4:4  A4:8 B4:4  C5:4 D5:4 E5:4  D5:4 C5:4 B4:4  C5:12  C5:12'),
    hpat:'arp', bass:'waltz', drums:[] },
  /* LA TIENDA — 4/4 saltarín con swing de bayas */
  tienda:{ bpm:132, steps:16, lead:'p25', harm:'p125', leadVol:.042, harmVol:.02, bassVol:.075, drumVol:.03, echo:0, space:.1, arpVol:.007,
    chords:[KC,KC,KF,KG, KC,KAm,KF,KG],
    leadM:N('E5:2 G5:2 C6:4 G5:2 E5:2 G5:4  E5:2 G5:2 A5:2 G5:2 E5:2 C5:2 D5:4  F5:2 A5:2 C6:4 A5:2 F5:2 A5:4  G5:2 B5:2 D6:4 B5:4 G5:4 '+
            'E5:2 G5:2 C6:4 G5:2 E5:2 G5:4  A5:2 C6:2 E6:4 C6:2 A5:2 E5:4  F5:2 A5:2 C6:2 A5:2 F5:4 D5:4  G5:4 B5:4 C6:8'),
    hpat:'arp', bass:'walk', drums:['k.h.s.h.k.h.s.h.','k.h.s.hkk.h.s.hs'] },
  /* EL NORTE HELADO — 4/4 lento en La menor, eco largo, notas que cuelgan */
  nieve:{ bpm:104, steps:16, lead:'square', harm:'p125', leadVol:.03, harmVol:.016, bassVol:.06, drumVol:.02, echo:.22, alt:true, space:.36, arpVol:.007,
    chords:[KAm,KAm,KF,KE, KAm,KDm,KE,KAm, KC,KG,KAm,KF, KDm,KE,KAm,KAm],
    leadM:N('A4:6 C5:2 E5:8  D5:6 C5:2 B4:8  A4:4 C5:4 F5:4 E5:4  D5:12 B4:4  A4:6 C5:2 E5:8  F5:6 E5:2 D5:8  E5:4 D5:4 B4:4 G#4:4  A4:16 '+
            'E5:6 G5:2 E5:8  D5:6 B4:2 G4:8  A4:4 B4:4 C5:4 E5:4  F5:12 E5:4  D5:6 F5:2 D5:8  E5:6 D5:2 B4:8  A4:4 B4:4 C5:4 B4:4  A4:16'),
    hpat:'arp', bass:'drone', drums:['k.......s.......','k.......s...h...'] },
  /* LAS MARISMAS — 3/4 arrastrado, cromatismos de hojarasca */
  pantano:{ bpm:112, steps:12, lead:'p25', harm:'p125', leadVol:.034, harmVol:.018, bassVol:.07, drumVol:.03, echo:.18, alt:true, space:.26, arpVol:.007,
    chords:[KAm,KE,KAm,KE, KAm,KDm,KE,KAm, KF,KE,KAm,KDm, KE,KE,KAm,KAm],
    leadM:N('A4:2 B4:2 C5:2 D5:2 Eb5:4  E5:4 D5:4 C5:4  B4:2 Bb4:2 B4:2 C5:2 A4:4  E4:8 .:4  A4:2 B4:2 C5:2 D5:2 Eb5:4  F5:4 E5:4 D5:4  C5:2 B4:2 G#4:2 B4:2 A4:4  A4:8 .:4 '+
            'F5:4 E5:2 D5:2 C5:4  B4:4 Bb4:2 B4:2 E5:4  A4:2 B4:2 C5:2 D5:2 E5:4  F5:4 D5:4 F5:4  E5:4 G#4:4 B4:4  E5:2 D5:2 C5:2 B4:2 G#4:4  A4:8 .:4  A4:12'),
    hpat:'arp', bass:'waltz', drums:['k..h..h.....','k..h..h..s..'] },
  /* LA CUEVA DEL TOPO — 4/4 grave, ostinato de bajo, melodía escasa */
  cueva:{ bpm:110, steps:16, lead:'p25', harm:'p125', leadVol:.024, harmVol:.014, bassVol:.09, drumVol:.035, echo:.2, space:.3, arpVol:0, duet:false,
    chords:[KAm,KAm,KAm,KF, KAm,KAm,KE,KAm],
    leadM:N('.:8 A4:2 .:2 C5:4  .:8 A4:2 .:2 B4:4  .:16  F4:4 .:4 E4:4 .:4  .:8 A4:2 .:2 C5:4  .:8 D5:2 .:2 C5:4  E5:8 B4:8  A4:12 .:4'),
    harmM:N('.:16  .:16  E4:2 .:2 E4:2 .:2 E4:2 .:2 E4:2 .:2  .:16  .:16  .:16  G#4:4 .:4 G#4:4 .:4  A4:8 .:8'),
    bass:N('A2:2 A2:2 E2:2 A2:2 A2:2 G2:2 A2:2 .:2  A2:2 A2:2 E2:2 A2:2 A2:2 G2:2 A2:2 .:2  A2:2 A2:2 E2:2 A2:2 A2:2 G2:2 A2:2 .:2  F2:2 F2:2 C2:2 F2:2 F2:2 E2:2 F2:2 .:2 '+
           'A2:2 A2:2 E2:2 A2:2 A2:2 G2:2 A2:2 .:2  A2:2 A2:2 E2:2 A2:2 A2:2 G2:2 A2:2 .:2  E2:2 E2:2 B2:2 E2:2 E2:2 D2:2 E2:2 .:2  A2:2 A2:2 E2:2 A2:2 A2:4 .:4'),
    drums:['k...h...k..kh...','k...h...k...s.s.'] },
  /* EL TEMPLO DE LA CIMA — 4/4, campanas de hielo, arpegios altos */
  templo:{ bpm:118, steps:16, lead:'triangle', harm:'p125', leadVol:.055, harmVol:.03, bassVol:.06, drumVol:.02, echo:.24, space:.36, arpVol:0,
    chords:[KAm,KEm,KF,KAm, KDm,KAm,KE,KAm, KF,KG,KEm,KAm, KF,KE,KAm,KAm],
    leadM:N('E5:8 D5:4 B4:4  A4:8 .:8  F5:8 E5:4 C5:4  A4:8 .:8  D5:8 E5:4 F5:4  E5:8 .:8  E5:4 G#4:4 B4:4 E5:4  A4:16 '+
            'C5:8 D5:4 E5:4  G5:8 .:8  E5:8 D5:4 B4:4  C5:8 .:8  F5:8 E5:4 F5:4  G#5:8 .:8  A5:4 E5:4 C5:4 A4:4  A4:16'),
    hpat:'arpfast', bass:'pulse', drums:['....h.......h...','....h.......h.s.'] },
  /* LA CIMA DEL VIENTO — 4/4 abierto, sostenidos largos, aire */
  cima:{ bpm:100, steps:16, lead:'square', harm:'p125', leadVol:.03, harmVol:.014, bassVol:.07, drumVol:.018, echo:.26, alt:true, space:.42, arpVol:.006,
    chords:[KEm,KEm,KAm,KAm, KD,KG,KEm,KEm, KC,KD,KEm,KEm, KAm,KD,KEm,KEm],
    leadM:N('E5:6 F#5:2 E5:8  G5:8 E5:8  D5:6 C5:2 B4:8  A4:16  A4:4 B4:4 D5:4 E5:4  G5:8 B5:4 A5:4  G5:8 E5:8  E5:16 '+
            'C5:6 D5:2 E5:8  F#5:8 D5:8  E5:6 F#5:2 G5:8  B5:16  A5:4 G5:4 E5:4 D5:4  D5:8 F#5:4 A5:4  G5:8 F#5:8  E5:16'),
    hpat:'arp', bass:'drone', drums:['k...............','k.......h.......'] },
  /* GUARDIÁN — 4/4 urgente: el motivo en menor (la-si-do-re-MIb), galope y aullido */
  jefe:{ bpm:160, steps:16, lead:'square', harm:'p25', leadVol:.042, harmVol:.024, bassVol:.1, drumVol:.05, echo:0, fat:7, space:.1, adaptive:true, duet:false, arpVol:.009,
    chords:[KAm,KAm,KEm,KEm, KAm,KF,KE,KAm, KAm,KAm,KDm,KDm, KAm,KF,KE,KE],
    leadM:N('A4:2 B4:2 C5:2 D5:2 Eb5:6 D5:2  C5:2 B4:2 A4:2 G4:2 A4:8  A4:2 B4:2 C5:2 D5:2 Eb5:6 F5:2  E5:2 D5:2 C5:2 B4:2 E5:8 '+
            'A5:4 G#5:2 F5:2 E5:4 D5:4  A4:2 B4:2 C5:2 D5:2 Eb5:8  E5:2 D5:2 C5:2 B4:2 G#4:4 B4:4  A4:8 .:8 '+
            'A4:2 A4:2 A4:2 C5:2 A4:2 A4:2 A4:2 D5:2  A4:2 A4:2 A4:2 E5:2 A4:2 A4:2 A4:2 F5:2  D5:4 F5:4 A5:4 F5:4  E5:8 D5:8 '+
            'C5:2 D5:2 Eb5:2 F5:2 G5:4 Eb5:4  F5:4 D5:4 F5:4 A5:4  G#5:8 E5:8  E5:4 D5:4 C5:4 B4:4'),
    harmM:N('A3:4 .:4 A3:4 .:4  A3:4 .:4 A3:4 .:4  A3:4 .:4 A3:4 .:4  A3:4 .:4 A3:4 .:4  A3:4 .:4 A3:4 .:4  F3:4 .:4 F3:4 .:4  E3:4 .:4 G#3:4 .:4  A3:4 .:4 A3:4 .:4 '+
            'E4:2 .:2 E4:2 .:2 E4:2 .:2 E4:2 .:2  E4:2 .:2 E4:2 .:2 E4:2 .:2 E4:2 .:2  D4:2 .:2 D4:2 .:2 D4:2 .:2 D4:2 .:2  D4:2 .:2 D4:2 .:2 D4:2 .:2 D4:2 .:2  C4:4 .:4 C4:4 .:4  F4:4 .:4 F4:4 .:4  E4:4 .:4 E4:4 .:4  E4:4 .:4 E4:4 .:4'),
    bass:'march', drums:['k.h.s.h.k.h.s.hh','k.h.s.h.k.hks.ss'] },
  /* MINIJEFE — 4/4 nervioso en Mi menor, más ligero que el guardián */
  minijefe:{ bpm:150, steps:16, lead:'square', harm:'p25', leadVol:.038, harmVol:.02, bassVol:.09, drumVol:.045, echo:0, fat:6, space:.1, adaptive:true, arpVol:.008,
    chords:[KEm,KEm,KG,KG, KEm,KC,KBdim,KEm],
    leadM:N('E4:2 F#4:2 G4:2 A4:2 Bb4:6 A4:2  G4:2 F#4:2 E4:2 D4:2 E4:8  E4:2 F#4:2 G4:2 A4:2 Bb4:6 C5:2  B4:2 A4:2 G4:2 F#4:2 B4:8 '+
            'E5:4 D#5:2 C5:2 B4:4 A4:4  E4:2 F#4:2 G4:2 A4:2 Bb4:8  B4:2 A4:2 G4:2 F#4:2 D#4:4 F#4:4  E4:8 .:8'),
    hpat:'arp', bass:'octave', drums:['k.h.s.h.k.h.s.h.','k.h.s.h.kkh.s.ss'] },
  /* GRUTA — 4/4, zumbido de fondo y gotas */
  gruta:{ bpm:80, steps:16, lead:'p125', harm:'p125', leadVol:.03, harmVol:.012, bassVol:.06, drumVol:.02, echo:.3, space:.46, arpVol:0, duet:false,
    chords:[KAm,KAm,KEm,KEm, KAm,KF,KEm,KAm],
    leadM:N('.:12 E5:4  .:16  .:8 B4:4 .:4  .:16  .:12 A5:4  .:16  .:8 G5:4 E5:4  .:16'),
    harmM:N('A3:16  A3:16  E3:16  E3:16  A3:16  F3:16  E3:16  A3:16'),
    bass:'drone', drums:['............h...'] },
  /* MARCHITO — la nana de las raíces: bajo tierra, el Roble le canta a la semilla. 3/4 lento,
     de La menor a Do; a mitad asoma el motivo de Sprout (la-si-do-re… ¡mi!) como una promesa */
  marchito:{ bpm:66, steps:12, lead:'triangle', harm:'p125', leadVol:.056, harmVol:.013, bassVol:.042, drumVol:0, echo:.34, space:.5, arpVol:.005, vary:false, duet:false,
    chords:[KAm,KF,KC,KG, KAm,KF,KG,KC],
    leadM:N('E5:6 D5:3 C5:3  C5:6 A4:6  G4:3 A4:3 C5:3 E5:3  D5:9 .:3  A4:3 B4:3 C5:3 D5:3  E5:9 C5:3  D5:3 B4:3 G4:3 B4:3  C5:12'),
    bass:'waltz', drums:[] },
  /* SILENCIO — al caer y al volver: nada suena (sólo los efectos) */
  silencio:{ bpm:60, steps:16, lead:'triangle', harm:'p125', leadVol:.01, harmVol:.01, bassVol:.01, drumVol:0, echo:0, space:.3, arpVol:0, vary:false, duet:false,
    chords:[KAm], leadM:N('.:16'), harmM:N('.:16'), bass:N('.:16'), drums:[] },
  /* CRÉDITOS — la nana de Raíz, en grande, y el motivo al final */
  creditos:{ bpm:104, steps:12, lead:'square', harm:'p25', leadVol:.045, harmVol:.026, bassVol:.08, drumVol:.028, echo:.2, fat:5, space:.26, arpVol:.007,
    chords:[KC,KG,KC,KAm, KC,KG,KF,KC, KF,KC,KG,KAm, KF,KG,KC,KC, KAm,KC,KG,KAm, KAm,KC,KF,KC, KF,KG,KC,KC, KF,KG,KC,KC],
    leadM:N('E5:4 G5:4 E5:4  D5:4 C5:4 D5:4  E5:8 C5:4  A4:12  E5:4 G5:4 E5:4  D5:4 C5:4 B4:4  C5:8 D5:4  C5:12 '+
            'F5:4 E5:4 D5:4  E5:4 D5:4 C5:4  D5:8 B4:4  A4:8 B4:4  C5:4 D5:4 E5:4  D5:4 C5:4 B4:4  C5:12  C5:12 '+
            'A4:2 B4:2 C5:2 D5:2 E5:4  G5:4 E5:4 C5:4  D5:2 C5:2 B4:2 A4:2 G4:4  A4:8 .:4  A4:2 B4:2 C5:2 D5:2 E5:4  G5:4 A5:4 G5:4  E5:2 D5:2 C5:2 D5:2 E5:4  C5:8 .:4 '+
            'F5:4 E5:2 D5:2 C5:4  D5:4 E5:2 F5:2 G5:4  E5:4 D5:2 C5:2 B4:4  C5:8 .:4  A4:2 B4:2 C5:2 D5:2 E5:4  G5:4 A5:4 B5:4  C6:12  C6:12'),
    harmM:N('C4:4 E4:4 G4:4  B3:4 D4:4 G4:4  C4:4 E4:4 G4:4  A3:4 C4:4 E4:4  C4:4 E4:4 G4:4  B3:4 D4:4 G4:4  A3:4 C4:4 F4:4  C4:4 E4:4 G4:4 '+
            'A3:4 C4:4 F4:4  C4:4 E4:4 G4:4  B3:4 D4:4 G4:4  A3:4 C4:4 E4:4  A3:4 C4:4 F4:4  B3:4 D4:4 G4:4  C4:4 E4:4 G4:4  C4:12 '+
            'A3:4 C4:4 E4:4  C4:4 E4:4 G4:4  B3:4 D4:4 G4:4  A3:4 C4:4 E4:4  A3:4 C4:4 E4:4  C4:4 E4:4 G4:4  A3:4 C4:4 F4:4  C4:4 E4:4 G4:4 '+
            'A3:4 C4:4 F4:4  B3:4 D4:4 G4:4  C4:4 E4:4 G4:4  C4:4 E4:4 G4:4  A3:4 C4:4 F4:4  B3:4 D4:4 G4:4  E4:12  E4:12'),
    bass:'waltz', drums:['k...h...h...','k...h...h.s.'] },
  /* ============== PISTAS NUEVAS ============== */
  /* EMBOSCADA — 4/4 a 156: puertas cerradas. Bajo en octavas martilleando LA, acorde frigio
     (Sib) que muerde y ráfagas de la melodía en picado. */
  emboscada:{ bpm:156, steps:16, lead:'square', harm:'p25', leadVol:.04, harmVol:.02, bassVol:.1, drumVol:.052, echo:0, fat:7, space:.08, adaptive:true, duet:false, arpVol:.009,
    chords:[KAm,KAm,KBb,KAm, KAm,KAm,KF,KE],
    leadM:N('A4:2 .:2 A4:2 .:2 C5:2 .:2 E5:2 .:2  Eb5:4 D5:2 C5:2 B4:4 A4:4  Bb4:2 .:2 Bb4:2 .:2 D5:2 .:2 F5:2 .:2  E5:4 D5:2 C5:2 B4:8 '+
            'A5:2 .:2 G5:2 .:2 F5:2 .:2 E5:2 .:2  Eb5:2 D5:2 C5:2 B4:2 A4:8  F5:4 E5:4 D5:4 C5:4  B4:4 G#4:4 E4:4 .:4'),
    hpat:'arpfast', bass:'octave', drums:['k.hsk.hsk.hsk.hs','k.hsk.hsk.hskshs'] },
  /* EL MOLINO DE LA HOJARASCA — 6/8 (12 semicorcheas) en re dórico: la rueda del molino gira
     en el arpegio, el bajo va a trompicones y la melodía huele a hojas secas. */
  molino:{ bpm:122, steps:12, lead:'p25', harm:'p125', leadVol:.04, harmVol:.022, bassVol:.08, drumVol:.032, echo:.16, alt:true, space:.24, arpVol:.007,
    chords:[KDm,KDm,KC,KDm, KBb,KC,KAm,KDm, KDm,KG,KDm,KC, KBb,KA,KDm,KDm],
    leadM:N('D5:3 E5:3 F5:3 A5:3  G5:6 F5:3 E5:3  E5:3 G5:3 C5:6  D5:9 .:3  F5:3 E5:3 D5:3 C5:3  E5:6 G5:6  A5:3 G5:3 E5:3 C5:3  D5:12 '+
            'A4:3 B4:3 D5:3 F5:3  G5:6 D5:6  F5:3 E5:3 D5:3 A4:3  C5:3 D5:3 E5:6  F5:6 D5:6  E5:3 C#5:3 A4:6  D5:3 F5:3 A5:6  D5:12'),
    hpat:'arpfast', bass:'mill', drums:['k..h..s..h..','k..h..s..hhs'] },
  /* DESAFÍO — el post-juego: 4/4 a 162, el motivo en Mi menor, heroico y sin respiro */
  desafio:{ bpm:162, steps:16, lead:'square', harm:'p25', leadVol:.042, harmVol:.022, bassVol:.095, drumVol:.05, echo:0, fat:7, space:.12, adaptive:true, alt:true, arpVol:.009,
    chords:[KEm,KEm,KC,KD, KEm,KC,KD,KB],
    leadM:N('E5:2 F#5:2 G5:2 A5:2 B5:6 A5:2  G5:2 F#5:2 E5:2 D5:2 E5:8  C5:2 D5:2 E5:2 G5:2 C6:6 B5:2  A5:2 G5:2 F#5:2 E5:2 D5:8 '+
            'E5:2 F#5:2 G5:2 A5:2 B5:4 E6:4  D6:4 C6:4 B5:4 A5:4  G5:2 A5:2 B5:4 A5:2 G5:2 F#5:4  D#5:4 F#5:4 B5:8'),
    hpat:'arpfast', bass:'synco', drums:['k.hsk.hsk.hsk.hs','k.hsk.hskkhsksss'] },
  /* EL FINAL — 4/4 a 92, majestuoso: el motivo trepa despacio y culmina en DO6; luego la nana */
  final:{ bpm:92, steps:16, lead:'square', harm:'p25', leadVol:.046, harmVol:.024, bassVol:.08, drumVol:.03, echo:.2, fat:6, space:.32, arpVol:.008,
    chords:[KAm,KF,KC,KG, KAm,KF,KG,KC, KF,KG,KEm,KAm, KF,KG,KC,KC],
    leadM:N('A4:4 B4:4 C5:4 D5:4  E5:12 C5:4  G5:8 E5:8  D5:12 B4:4  A4:4 B4:4 C5:4 D5:4  E5:8 F5:4 A5:4  G5:8 B5:8  C6:16 '+
            'A5:6 G5:2 F5:8  G5:6 F5:2 E5:4 D5:4  E5:8 G5:8  A5:16  F5:4 A5:4 C6:4 A5:4  B5:4 D6:4 B5:4 G5:4  C6:8 G5:4 E5:4  C6:16'),
    hpat:'arp', bass:'walk', drums:['k.......k.......','k.......k...o...'] },
  /* ESTACIÓN — el valle cambia de estación: cuatro compases luminosos, en bucle */
  estacion:{ bpm:120, steps:16, lead:'p25', harm:'p125', leadVol:.042, harmVol:.022, bassVol:.06, drumVol:.02, echo:.18, space:.34, vary:false, arpVol:.01,
    chords:[KC,KD,KC,KG],
    leadM:N('C5:2 E5:2 G5:2 C6:2 E6:4 D6:4  F#5:2 A5:2 D6:2 A5:2 F#5:4 E5:4  G5:2 C6:2 E6:2 G6:2 E6:8  D6:4 B5:4 G5:8'),
    hpat:'arpfast', bass:'drone', drums:['....h...o.......'] },
};
/* ---------- compilación: cadenas → eventos por semicorchea ---------- */
function bassLine(t){ // patrón de bajo por acorde
  const S=t.steps, out=[];
  t.chords.forEach(c=>{ const [r,th,fi]=c;
    if(t.bass==='waltz'){ out.push([r,4],[fi,4],[th,4]); }
    else if(t.bass==='march'){ out.push([r,4],[r,2],[r+12,2],[fi,4],[r,2],[fi-12,2]); }
    else if(t.bass==='walk'){ out.push([r,4],[th,4],[fi,4],[th,4]); }
    else if(t.bass==='pulse'){ for(let i=0;i<S/2;i++) out.push([i%4===3?fi:r,2]); }
    else if(t.bass==='octave'){ for(let i=0;i<S/2;i++) out.push([i&1?r+12:r,2]); }
    else if(t.bass==='mill'){ out.push([r,3],[fi,3],[r+12,3],[fi,3]); }
    else if(t.bass==='synco'){ out.push([r,3],[r,3],[fi,2],[r+12,4],[fi,2],[th,2]); }
    else { out.push([r,S]); } // drone
  });
  return out;
}
function harmLine(t){ // arpegios suaves sobre el acorde
  const S=t.steps, out=[];
  t.chords.forEach(c=>{ const [r,th,fi]=c;
    if(t.hpat==='arpfast'){ for(let i=0;i<S/2;i++) out.push([[r,th,fi][i%3]+24,2]); } // hpat: el dibujo de la armonía; harm es el instrumento (antes se pisaban y sonaba un seno)
    else if(S===12){ out.push([0,4],[th+12,4],[fi+12,4]); }
    else { out.push([0,4],[th+12,4],[0,4],[fi+12,4]); }
  });
  return out;
}
function compile(t){
  const S=t.steps, len=t.chords.length*S, ev={lead:{},harm:{},bass:{},drum:{}};
  const put=(voice,list)=>{ let i=0; for(const [m,l] of list){ if(m) ev[voice][i]={m,len:l}; i+=l; } if(i!==len) console.error('pista '+t.name+': voz '+voice+' dura '+i+' y debería '+len); };
  put('lead',t.leadM); put('harm',t.harmM||harmLine(t)); put('bass',Array.isArray(t.bass)?t.bass:bassLine(t));
  const D=t.drums||[]; if(D.length){ for(let b=0;b<t.chords.length;b++){ const pat=D[b%D.length]; for(let i=0;i<S;i++){ const c=pat[i]||'.'; if(c!=='.') ev.drum[b*S+i]=c; } } }
  t.ev=ev; t.len=len; t.EI=60/t.bpm/4;
}
for(const k in TRACKS){ TRACKS[k].name=k; compile(TRACKS[k]); }
/* dúo: la segunda voz armoniza la melodía con la nota del acorde que queda una tercera o una sexta por debajo */
function duetNote(t,bar,m){ const c=t.chords[bar%t.chords.length]; let best=0;
  for(let o=-1;o<=4;o++) for(const n of c){ const x=n+12*o; if(x<=m-3&&x>=m-9&&x>best) best=x; } return best; }
const FILL16='k...h...s.s.stts', FILL12='k..h..s.stts';
let curTrack=null, MLEN=0, MEV={};
function setTrack(name){
  if(!TRACKS[name]){ if(name) console.warn('pista desconocida: '+name); return; } // sin pista, sigue la que suena
  if(curTrack===name) return;
  curTrack=name; MLEN=TRACKS[name].len; MEV=TRACKS[name].ev.lead; mIntTarget=0;
  musicStep=0; if(AC){ nextNoteT=AC.currentTime+.12; if(delayWet) delayWet.gain.setTargetAtTime(TRACKS[name].space??.16,AC.currentTime,.3); }
}
/* intensidad de combate: 0 tranquilo · 1 herido · 2 a la desesperada */
function musicIntensity(level){ level=Math.max(0,Math.min(2,level|0)); const t=TRACKS[curTrack];
  if(!t||!t.adaptive){ mIntTarget=0; return; }
  if(level>mIntTarget&&AC&&musicOn) SFX.phaseUp();
  mIntTarget=level; }
/* las emboscadas tienen su propia música; al abrirse las puertas vuelve la de antes */
function musicAmbush(on){ if(on){ if(curTrack!=='emboscada') musicBeforeAmbush=curTrack; setTrack('emboscada'); }
  else if(curTrack==='emboscada'){ setTrack(musicBeforeAmbush||'cueva'); musicBeforeAmbush=null; } }
function startMusic(){
  if(musicTimer) return;
  if(!curTrack) setTrack('casa');
  nextNoteT=AC.currentTime+.1; musicStep=0;
  musicTimer=setInterval(()=>{
    if(!AC) return;
    if(!musicOn){ nextNoteT=AC.currentTime+.05; return; }
    if(nextNoteT<AC.currentTime-.1) nextNoteT=AC.currentTime+.05; // tras una pausa larga no hay atracón de notas
    const t=TRACKS[curTrack]; if(!t) return;
    const I=t.adaptive?mIntTarget:0, EI=t.EI/(1+.07*I);
    const duck=(state==='dialog'||state==='cine'||state==='itemget'||state==='pause'||state==='shop'||state==='give')?0.45:1;
    OUT=VOICE.drum;
    while(nextNoteT<AC.currentTime+.18){
      const i=musicStep%t.len, pass=(musicStep/t.len)|0, varn=t.vary===false?0:pass%3, S=t.steps, bar=(i/S)|0, inBar=i%S;
      const up=(t.alt&&varn===1)?12:0, T=nextNoteT, duo=varn===2&&t.duet!==false&&t.harmVol>0;
      const L=t.ev.lead[i];
      if(L){ note(t.lead,L.m+up,L.len*EI*.92,t.leadVol*(up?.75:1)*duck,T,{vib:L.len>=6,echo:t.echo||0,sustain:.7,bus:VOICE.lead,detune:t.fat||0});
        if(I>=2&&!up) note(t.lead,L.m+12,L.len*EI*.85,t.leadVol*.38*duck,T,{sustain:.6,bus:VOICE.arp});
        if(duo){ const h=duetNote(t,bar,L.m); if(h) note(t.harm,h,L.len*EI*.88,t.harmVol*1.3*duck,T,{sustain:.6,bus:VOICE.duet}); } }
      const H=duo?null:t.ev.harm[i]; if(H) note(t.harm,H.m,H.len*EI*.9,t.harmVol*duck,T,{sustain:.5,bus:VOICE.harm});
      if(t.arpVol&&(varn===1||I>=1||t.vary===false)){ const c=t.chords[bar], tone=[c[0],c[1],c[2],c[1]][inBar%4]+24+(varn===1?12:0);
        note('p125',tone,EI*.8,t.arpVol*duck*(I>=1?1.5:1),T,{sustain:.35,attack:.003,bus:VOICE.arp}); }
      const B=t.ev.bass[i]; if(B) note('triangle',B.m,Math.min(B.len*EI*.95,1.2),t.bassVol*duck,T,{sustain:.6,attack:.004,bus:VOICE.bass});
      if(t.drumVol){ let Dm=t.ev.drum[i];
        if(varn>0&&bar%4===3&&inBar>=S/2){ const F=S===12?FILL12:FILL16; Dm=F[inBar]!=='.'?F[inBar]:Dm; }  // redoble al cerrar la frase
        if(I>=1&&!Dm&&(inBar&1)===0) Dm='h';                                        // charles en corcheas al herirse
        if(I>=2&&inBar===S-2&&bar%2===1) Dm='s';
        if(Dm&&DRUMS[Dm]) DRUMS[Dm](T,t.drumVol*duck*(I>=2?1.15:1)); }
      nextNoteT+=EI; musicStep++;
    }
    OUT=null;
  },25);
}
