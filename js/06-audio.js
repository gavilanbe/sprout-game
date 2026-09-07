'use strict';
/* ============================================================
   AUDIO — chiptune WebAudio con identidad propia.
   Cuatro voces por pista (melodía, contramelodía, bajo y ruido),
   ondas de pulso con ciclo de trabajo a lo Game Boy, eco y compresor.
   El MOTIVO DE SPROUT («el brote trepa»: la-si-do-re-mi) recorre el
   título, el valle y los jefes; la NANA DE RAÍZ suena en casa, en la
   cima en paz y en los créditos.
   ============================================================ */
let AC=null, master=null, musicOn=true, musicTimer=null, musicStep=0, nextNoteT=0;
try{ if(localStorage.getItem('sprout.music')==='0') musicOn=false; }catch(e){}
const WAVES={};
function pulseWave(duty){ // onda de pulso por serie de Fourier (32 armónicos)
  const n=32, re=new Float32Array(n), im=new Float32Array(n);
  for(let k=1;k<n;k++){ im[k]=(2/(k*Math.PI))*Math.sin(k*Math.PI*duty); }
  return AC.createPeriodicWave(re,im,{disableNormalization:false});
}
function audio(){
  if(!AC){ AC=new (window.AudioContext||window.webkitAudioContext)();
    master=AC.createDynamicsCompressor(); master.threshold.value=-14; master.knee.value=12; master.ratio.value=5; master.attack.value=.004; master.release.value=.12;
    const vol=AC.createGain(); vol.gain.value=.9; master.connect(vol).connect(AC.destination);
    WAVES.p125=pulseWave(.125); WAVES.p25=pulseWave(.25); WAVES.p50=null; // 50% = square nativo
    startMusic(); }
  else if(AC.state==='suspended') AC.resume();
  return AC;
}
function f(m){ return 440*Math.pow(2,(m-69)/12); }
function osc(type){ const o=AC.createOscillator(); if(type==='p125'||type==='p25'){ o.setPeriodicWave(WAVES[type]); } else o.type=type; return o; }
/* beep: tono con envolvente exponencial (y vibrato opcional) */
function beep(type,f0,f1,dur,vol,when,vib){
  const a=audio(), t=when||a.currentTime;
  const o=osc(type), g=a.createGain();
  o.frequency.setValueAtTime(f0,t);
  if(f1) o.frequency.exponentialRampToValueAtTime(Math.max(f1,1),t+dur);
  if(vib){ const lf=a.createOscillator(), lg=a.createGain(); lf.frequency.value=5.5; lg.gain.value=f0*.012; lf.connect(lg).connect(o.frequency); lf.start(t+.12); lf.stop(t+dur+.02); }
  g.gain.setValueAtTime(vol,t); g.gain.exponentialRampToValueAtTime(.0001,t+dur);
  o.connect(g).connect(master); o.start(t); o.stop(t+dur+.02);
}
/* nota con envolvente ADSR corta: la voz de los instrumentos */
function note(type,m,dur,vol,when,opt){
  const a=AC, t=when, o=osc(type), g=a.createGain(); opt=opt||{};
  o.frequency.setValueAtTime(f(m),t);
  if(opt.slide) o.frequency.exponentialRampToValueAtTime(f(m+opt.slide),t+dur*.9);
  if(opt.vib&&dur>.25){ const lf=a.createOscillator(), lg=a.createGain(); lf.frequency.value=5.2; lg.gain.value=f(m)*.009; lf.connect(lg).connect(o.frequency); lf.start(t+.15); lf.stop(t+dur+.02); }
  const at=opt.attack||.008, rel=Math.min(.09,dur*.35), sus=opt.sustain===undefined?.72:opt.sustain;
  g.gain.setValueAtTime(.0001,t); g.gain.exponentialRampToValueAtTime(vol,t+at);
  g.gain.exponentialRampToValueAtTime(Math.max(.0002,vol*sus),t+Math.max(at+.01,dur-rel));
  g.gain.exponentialRampToValueAtTime(.0001,t+dur);
  o.connect(g).connect(master); o.start(t); o.stop(t+dur+.02);
  if(opt.echo){ const g2=a.createGain(), o2=osc(type); o2.frequency.setValueAtTime(f(m),t+opt.echo); g2.gain.setValueAtTime(.0001,t+opt.echo); g2.gain.exponentialRampToValueAtTime(vol*.32,t+opt.echo+.01); g2.gain.exponentialRampToValueAtTime(.0001,t+opt.echo+Math.min(dur,.22)); o2.connect(g2).connect(master); o2.start(t+opt.echo); o2.stop(t+opt.echo+.25); }
}
let noiseBuf=null;
function noise(dur,vol,hp,when,freq){
  const a=audio(), t=when||a.currentTime;
  if(!noiseBuf){ noiseBuf=a.createBuffer(1,a.sampleRate*0.5,a.sampleRate); const d=noiseBuf.getChannelData(0); for(let i=0;i<d.length;i++) d[i]=Math.random()*2-1; }
  const s=a.createBufferSource(); s.buffer=noiseBuf; const g=a.createGain(), fl=a.createBiquadFilter();
  fl.type=hp?'highpass':'lowpass'; fl.frequency.value=freq||(hp?3000:1200);
  g.gain.setValueAtTime(vol,t); g.gain.exponentialRampToValueAtTime(.0001,t+dur);
  s.connect(fl).connect(g).connect(master); s.start(t); s.stop(t+dur);
}
/* batería del canal de ruido: bombo, caja, charles */
const DRUMS={
  k(t,v){ beep('triangle',150,38,.13,v*1.3,t); noise(.05,v*.5,false,t,600); },
  s(t,v){ noise(.11,v*.9,false,t,4000); beep('triangle',220,110,.05,v*.5,t); },
  h(t,v){ noise(.03,v*.55,true,t,6000); },
  o(t,v){ noise(.09,v*.5,true,t,5000); },
  t(t,v){ beep('triangle',110,60,.12,v,t); },
};
/* ---------- efectos ---------- */
const SFX = {
  sword(){ beep('square',620,180,.09,.05); noise(.05,.02,true); },
  cut(){ noise(.12,.05,false); },
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
  thud(i){ const a=audio(),t=a.currentTime; beep('triangle',112+i*16,38,.22,.095,t); noise(.09,.05,false,t); },
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
  key(){ const a=audio(),t=a.currentTime; [76,83,88].forEach((m,i)=>beep('square',f(m),0,.1,.05,t+i*.07)); },
  unlock(){ const a=audio(),t=a.currentTime; noise(.1,.05,false,t); beep('square',200,400,.12,.05,t+.1); beep('square',400,800,.2,.05,t+.2); },
  fall(){ beep('square',400,60,.5,.06); },
  stun(){ beep('square',700,700,.05,.03); beep('square',700,700,.05,.03,audio().currentTime+.08); },
  equip(){ beep('square',660,0,.06,.04); beep('square',990,0,.1,.04,audio().currentTime+.06); },
  menu(){ beep('square',520,0,.04,.03); },
  block(){ beep('square',240,240,.05,.04); noise(.04,.03,true); },
  charge(){ beep('square',440,880,.2,.03); },
  grass(){ noise(.07,.03,false); },
  piece(){ const a=audio(),t=a.currentTime; [72,76,79,76,84].forEach((m,i)=>beep('square',f(m),0,.09,.05,t+i*.07)); },
  puzzle(){ const a=audio(),t=a.currentTime; [67,72,76,79,84].forEach((m,i)=>beep('p25',f(m),0,.12,.05,t+i*.08)); beep('triangle',f(48),0,.6,.06,t); },
};
/* ============================================================
   NOTACIÓN: "A4:2" = la4 durante 2 semicorcheas · ".:4" = silencio
   Cada pista: bpm, steps (semicorcheas por compás: 16 = 4/4, 12 = 3/4),
   chords (uno por compás: [raíz, tercera, quinta] midi), voces:
   lead / harm (cadenas), bass ('waltz'|'march'|'walk'|'drone'|'pulse'|cadena),
   drums (patrones por compás, letras k s h o t .), instrumentos y volúmenes.
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
const TRACKS={
  /* EL ALZAMIENTO DEL BROTE — tema de título. 4/4 épico: la llamada en LA, el motivo que
     germina, respuesta heroica, galope de marcha y clímax en LA5. */
  titulo:{ bpm:126, steps:16, lead:'square', harm:'p25', leadVol:.048, harmVol:.026, bassVol:.085, drumVol:.05, echo:.16, alt:true,
    chords:[KAm,KAm,KF,KG, KAm,KF,KG,KAm, KAm,KF,KG,KEm, KF,KG,KG,KAm],
    leadM:N('A4:16  A4:4 B4:4 C5:4 D5:4  E5:12 C5:4  D5:8 B4:4 G4:4  A4:8 C5:4 E5:4  F5:8 E5:4 D5:4  E5:4 D5:4 B4:4 D5:4  A4:16 '+
            'A4:4 A4:2 A4:2 A4:4 C5:4  C5:4 C5:2 C5:2 C5:4 F5:4  G5:8 F5:4 E5:4  D5:8 E5:4 F5:4  A5:8 G5:4 F5:4  G5:6 F5:2 E5:4 D5:4  C5:4 D5:4 E5:4 G5:4  A5:12 E5:4'),
    harmM:N('.:16  .:16  C5:4 .:4 C5:4 .:4  B4:4 .:4 B4:4 .:4  A4:4 .:4 A4:4 .:4  C5:4 .:4 C5:4 .:4  B4:4 .:4 B4:4 .:4  A4:4 .:4 A4:4 .:4 '+
            'E4:4 .:4 E4:4 .:4  F4:4 .:4 F4:4 .:4  G4:4 .:4 G4:4 .:4  G4:4 .:4 G4:4 .:4  F4:4 .:4 F4:4 .:4  G4:4 .:4 G4:4 .:4  G4:4 .:4 G4:4 .:4  E5:12 C5:4'),
    bass:'march', drums:['k...h...s...h...','k...h...s..sh...'] },
  /* VALS DEL VALLE — 3/4 alegre en Do; empieza con el motivo (la-si-do-re-mi) */
  valle:{ bpm:150, steps:12, lead:'square', harm:'p125', leadVol:.04, harmVol:.02, bassVol:.08, drumVol:.03, echo:.14, alt:true,
    chords:[KAm,KC,KG,KAm, KAm,KC,KF,KC, KF,KG,KC,KC, KAm,KF,KG,KC],
    leadM:N('A4:2 B4:2 C5:2 D5:2 E5:4  G5:4 E5:4 C5:4  D5:2 C5:2 B4:2 A4:2 G4:4  A4:8 .:4  A4:2 B4:2 C5:2 D5:2 E5:4  G5:4 A5:4 G5:4  E5:2 D5:2 C5:2 D5:2 E5:4  C5:8 .:4 '+
            'F5:4 E5:2 D5:2 C5:4  D5:4 E5:2 F5:2 G5:4  E5:4 D5:2 C5:2 B4:4  C5:8 .:4  A4:2 B4:2 C5:2 D5:2 E5:4  G5:2 F5:2 E5:2 D5:2 C5:4  D5:4 B4:4 G4:4  C5:12'),
    harm:'arp', bass:'waltz', drums:['k...h...h...'] },
  /* LA NANA DE RAÍZ — 3/4, triángulo, sin prisa. Suena en casa. */
  casa:{ bpm:96, steps:12, lead:'triangle', harm:'p125', leadVol:.06, harmVol:.016, bassVol:.05, drumVol:0, echo:0,
    chords:[KC,KG,KC,KAm, KC,KG,KF,KC, KF,KC,KG,KAm, KF,KG,KC,KC],
    leadM:N('E5:4 G5:4 E5:4  D5:4 C5:4 D5:4  E5:8 C5:4  A4:12  E5:4 G5:4 E5:4  D5:4 C5:4 B4:4  C5:8 D5:4  C5:12 '+
            'F5:4 E5:4 D5:4  E5:4 D5:4 C5:4  D5:8 B4:4  A4:8 B4:4  C5:4 D5:4 E5:4  D5:4 C5:4 B4:4  C5:12  C5:12'),
    harm:'arp', bass:'waltz', drums:[] },
  /* LA TIENDA — 4/4 saltarín con swing de bayas */
  tienda:{ bpm:132, steps:16, lead:'p25', harm:'p125', leadVol:.042, harmVol:.02, bassVol:.075, drumVol:.03, echo:0,
    chords:[KC,KC,KF,KG, KC,KAm,KF,KG],
    leadM:N('E5:2 G5:2 C6:4 G5:2 E5:2 G5:4  E5:2 G5:2 A5:2 G5:2 E5:2 C5:2 D5:4  F5:2 A5:2 C6:4 A5:2 F5:2 A5:4  G5:2 B5:2 D6:4 B5:4 G5:4 '+
            'E5:2 G5:2 C6:4 G5:2 E5:2 G5:4  A5:2 C6:2 E6:4 C6:2 A5:2 E5:4  F5:2 A5:2 C6:2 A5:2 F5:4 D5:4  G5:4 B5:4 C6:8'),
    harm:'arp', bass:'walk', drums:['k.h.s.h.k.h.s.h.'] },
  /* EL NORTE HELADO — 4/4 lento en La menor, eco largo, notas que cuelgan */
  nieve:{ bpm:104, steps:16, lead:'square', harm:'p125', leadVol:.03, harmVol:.016, bassVol:.06, drumVol:.02, echo:.22, alt:true,
    chords:[KAm,KAm,KF,KE, KAm,KDm,KE,KAm, KC,KG,KAm,KF, KDm,KE,KAm,KAm],
    leadM:N('A4:6 C5:2 E5:8  D5:6 C5:2 B4:8  A4:4 C5:4 F5:4 E5:4  D5:12 B4:4  A4:6 C5:2 E5:8  F5:6 E5:2 D5:8  E5:4 D5:4 B4:4 G#4:4  A4:16 '+
            'E5:6 G5:2 E5:8  D5:6 B4:2 G4:8  A4:4 B4:4 C5:4 E5:4  F5:12 E5:4  D5:6 F5:2 D5:8  E5:6 D5:2 B4:8  A4:4 B4:4 C5:4 B4:4  A4:16'),
    harm:'arp', bass:'drone', drums:['k.......s.......'] },
  /* LAS MARISMAS — 3/4 arrastrado, cromatismos de hojarasca */
  pantano:{ bpm:112, steps:12, lead:'p25', harm:'p125', leadVol:.034, harmVol:.018, bassVol:.07, drumVol:.03, echo:.18, alt:true,
    chords:[KAm,KE,KAm,KE, KAm,KDm,KE,KAm, KF,KE,KAm,KDm, KE,KE,KAm,KAm],
    leadM:N('A4:2 B4:2 C5:2 D5:2 Eb5:4  E5:4 D5:4 C5:4  B4:2 Bb4:2 B4:2 C5:2 A4:4  E4:8 .:4  A4:2 B4:2 C5:2 D5:2 Eb5:4  F5:4 E5:4 D5:4  C5:2 B4:2 G#4:2 B4:2 A4:4  A4:8 .:4 '+
            'F5:4 E5:2 D5:2 C5:4  B4:4 Bb4:2 B4:2 E5:4  A4:2 B4:2 C5:2 D5:2 E5:4  F5:4 D5:4 F5:4  E5:4 G#4:4 B4:4  E5:2 D5:2 C5:2 B4:2 G#4:4  A4:8 .:4  A4:12'),
    harm:'arp', bass:'waltz', drums:['k..h..h.....','k..h..h..s..'] },
  /* LA CUEVA DEL TOPO — 4/4 grave, ostinato de bajo, melodía escasa */
  cueva:{ bpm:110, steps:16, lead:'p25', harm:'p125', leadVol:.024, harmVol:.014, bassVol:.09, drumVol:.035, echo:.2,
    chords:[KAm,KAm,KAm,KF, KAm,KAm,KE,KAm],
    leadM:N('.:8 A4:2 .:2 C5:4  .:8 A4:2 .:2 B4:4  .:16  F4:4 .:4 E4:4 .:4  .:8 A4:2 .:2 C5:4  .:8 D5:2 .:2 C5:4  E5:8 B4:8  A4:12 .:4'),
    harmM:N('.:16  .:16  E4:2 .:2 E4:2 .:2 E4:2 .:2 E4:2 .:2  .:16  .:16  .:16  G#4:4 .:4 G#4:4 .:4  A4:8 .:8'),
    bass:N('A2:2 A2:2 E2:2 A2:2 A2:2 G2:2 A2:2 .:2  A2:2 A2:2 E2:2 A2:2 A2:2 G2:2 A2:2 .:2  A2:2 A2:2 E2:2 A2:2 A2:2 G2:2 A2:2 .:2  F2:2 F2:2 C2:2 F2:2 F2:2 E2:2 F2:2 .:2 '+
           'A2:2 A2:2 E2:2 A2:2 A2:2 G2:2 A2:2 .:2  A2:2 A2:2 E2:2 A2:2 A2:2 G2:2 A2:2 .:2  E2:2 E2:2 B2:2 E2:2 E2:2 D2:2 E2:2 .:2  A2:2 A2:2 E2:2 A2:2 A2:4 .:4'),
    drums:['k...h...k..kh...','k...h...k...s.s.'] },
  /* EL TEMPLO DE LA CIMA — 4/4, campanas de hielo, arpegios altos */
  templo:{ bpm:118, steps:16, lead:'triangle', harm:'p125', leadVol:.055, harmVol:.03, bassVol:.06, drumVol:.02, echo:.24,
    chords:[KAm,KEm,KF,KAm, KDm,KAm,KE,KAm, KF,KG,KEm,KAm, KF,KE,KAm,KAm],
    leadM:N('E5:8 D5:4 B4:4  A4:8 .:8  F5:8 E5:4 C5:4  A4:8 .:8  D5:8 E5:4 F5:4  E5:8 .:8  E5:4 G#4:4 B4:4 E5:4  A4:16 '+
            'C5:8 D5:4 E5:4  G5:8 .:8  E5:8 D5:4 B4:4  C5:8 .:8  F5:8 E5:4 F5:4  G#5:8 .:8  A5:4 E5:4 C5:4 A4:4  A4:16'),
    harm:'arpfast', bass:'pulse', drums:['....h.......h...','....h.......h.s.'] },
  /* LA CIMA DEL VIENTO — 4/4 abierto, sostenidos largos, aire */
  cima:{ bpm:100, steps:16, lead:'square', harm:'p125', leadVol:.03, harmVol:.014, bassVol:.07, drumVol:.018, echo:.26, alt:true,
    chords:[KEm,KEm,KAm,KAm, KD,KG,KEm,KEm, KC,KD,KEm,KEm, KAm,KD,KEm,KEm],
    leadM:N('E5:6 F#5:2 E5:8  G5:8 E5:8  D5:6 C5:2 B4:8  A4:16  A4:4 B4:4 D5:4 E5:4  G5:8 B5:4 A5:4  G5:8 E5:8  E5:16 '+
            'C5:6 D5:2 E5:8  F#5:8 D5:8  E5:6 F#5:2 G5:8  B5:16  A5:4 G5:4 E5:4 D5:4  D5:8 F#5:4 A5:4  G5:8 F#5:8  E5:16'),
    harm:'arp', bass:'drone', drums:['k...............'] },
  /* GUARDIÁN — 4/4 urgente: el motivo en menor (la-si-do-re-MIb), galope y aullido */
  jefe:{ bpm:160, steps:16, lead:'square', harm:'p25', leadVol:.042, harmVol:.024, bassVol:.1, drumVol:.05, echo:0,
    chords:[KAm,KAm,KEm,KEm, KAm,KF,KE,KAm, KAm,KAm,KDm,KDm, KAm,KF,KE,KE],
    leadM:N('A4:2 B4:2 C5:2 D5:2 Eb5:6 D5:2  C5:2 B4:2 A4:2 G4:2 A4:8  A4:2 B4:2 C5:2 D5:2 Eb5:6 F5:2  E5:2 D5:2 C5:2 B4:2 E5:8 '+
            'A5:4 G#5:2 F5:2 E5:4 D5:4  A4:2 B4:2 C5:2 D5:2 Eb5:8  E5:2 D5:2 C5:2 B4:2 G#4:4 B4:4  A4:8 .:8 '+
            'A4:2 A4:2 A4:2 C5:2 A4:2 A4:2 A4:2 D5:2  A4:2 A4:2 A4:2 E5:2 A4:2 A4:2 A4:2 F5:2  D5:4 F5:4 A5:4 F5:4  E5:8 D5:8 '+
            'C5:2 D5:2 Eb5:2 F5:2 G5:4 Eb5:4  F5:4 D5:4 F5:4 A5:4  G#5:8 E5:8  E5:4 D5:4 C5:4 B4:4'),
    harmM:N('A3:4 .:4 A3:4 .:4  A3:4 .:4 A3:4 .:4  A3:4 .:4 A3:4 .:4  A3:4 .:4 A3:4 .:4  A3:4 .:4 A3:4 .:4  F3:4 .:4 F3:4 .:4  E3:4 .:4 G#3:4 .:4  A3:4 .:4 A3:4 .:4 '+
            'E4:2 .:2 E4:2 .:2 E4:2 .:2 E4:2 .:2  E4:2 .:2 E4:2 .:2 E4:2 .:2 E4:2 .:2  D4:2 .:2 D4:2 .:2 D4:2 .:2 D4:2 .:2  D4:2 .:2 D4:2 .:2 D4:2 .:2 D4:2 .:2  C4:4 .:4 C4:4 .:4  F4:4 .:4 F4:4 .:4  E4:4 .:4 E4:4 .:4  E4:4 .:4 E4:4 .:4'),
    bass:'march', drums:['k.h.s.h.k.h.s.hh','k.h.s.h.k.hks.ss'] },
  /* MINIJEFE — 4/4 nervioso en Mi menor, más ligero que el guardián */
  minijefe:{ bpm:150, steps:16, lead:'square', harm:'p25', leadVol:.038, harmVol:.02, bassVol:.09, drumVol:.045, echo:0,
    chords:[KEm,KEm,KG,KG, KEm,KC,KBdim,KEm],
    leadM:N('E4:2 F#4:2 G4:2 A4:2 Bb4:6 A4:2  G4:2 F#4:2 E4:2 D4:2 E4:8  E4:2 F#4:2 G4:2 A4:2 Bb4:6 C5:2  B4:2 A4:2 G4:2 F#4:2 B4:8 '+
            'E5:4 D#5:2 C5:2 B4:4 A4:4  E4:2 F#4:2 G4:2 A4:2 Bb4:8  B4:2 A4:2 G4:2 F#4:2 D#4:4 F#4:4  E4:8 .:8'),
    harm:'arp', bass:'march', drums:['k.h.s.h.k.h.s.h.','k.h.s.h.kkh.s.ss'] },
  /* GRUTA — 4/4, zumbido de fondo y gotas */
  gruta:{ bpm:80, steps:16, lead:'p125', harm:'p125', leadVol:.03, harmVol:.012, bassVol:.06, drumVol:.02, echo:.3,
    chords:[KAm,KAm,KEm,KEm, KAm,KF,KEm,KAm],
    leadM:N('.:12 E5:4  .:16  .:8 B4:4 .:4  .:16  .:12 A5:4  .:16  .:8 G5:4 E5:4  .:16'),
    harmM:N('A3:16  A3:16  E3:16  E3:16  A3:16  F3:16  E3:16  A3:16'),
    bass:'drone', drums:['............h...'] },
  /* MARCHITO — el brote cae: sting corto en bucle lento */
  marchito:{ bpm:70, steps:16, lead:'triangle', harm:'p125', leadVol:.05, harmVol:.012, bassVol:.05, drumVol:0, echo:.3,
    chords:[KAm,KAm,KFm,KFm, KE,KE,KAm,KAm],
    leadM:N('E5:4 D5:4 C5:8  B4:4 A4:4 G#4:8  F4:16  .:16  E4:8 D4:8  C4:16  .:16  .:16'),
    harm:'arp', bass:'drone', drums:[] },
  /* CRÉDITOS — la nana de Raíz, en grande, y el motivo al final */
  creditos:{ bpm:104, steps:12, lead:'square', harm:'p25', leadVol:.045, harmVol:.026, bassVol:.08, drumVol:.028, echo:.2,
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
};
/* ---------- compilación: cadenas → eventos por semicorchea ---------- */
function bassLine(t){ // patrón de bajo por acorde
  const S=t.steps, out=[];
  t.chords.forEach(c=>{ const [r,th,fi]=c;
    if(t.bass==='waltz'){ out.push([r,4],[fi,4],[th,4]); }
    else if(t.bass==='march'){ out.push([r,4],[r,2],[r+12,2],[fi,4],[r,2],[fi-12,2]); }
    else if(t.bass==='walk'){ out.push([r,4],[th,4],[fi,4],[th,4]); }
    else if(t.bass==='pulse'){ for(let i=0;i<S/2;i++) out.push([i%4===3?fi:r,2]); }
    else { out.push([r,S]); } // drone
  });
  return out;
}
function harmLine(t){ // arpegios suaves sobre el acorde
  const S=t.steps, out=[];
  t.chords.forEach(c=>{ const [r,th,fi]=c;
    if(t.harm==='arpfast'){ for(let i=0;i<S/2;i++) out.push([[r,th,fi][i%3]+24,2]); }
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
let curTrack=null, MLEN=0, MEV={};
function setTrack(name){
  if(curTrack===name||!TRACKS[name]) return;
  curTrack=name; MLEN=TRACKS[name].len; MEV=TRACKS[name].ev.lead;
  musicStep=0; if(AC) nextNoteT=AC.currentTime+.12;
}
function startMusic(){
  if(musicTimer) return;
  if(!curTrack) setTrack('casa');
  nextNoteT=AC.currentTime+.1; musicStep=0;
  musicTimer=setInterval(()=>{
    if(!musicOn||!AC) return;
    const t=TRACKS[curTrack], EI=t.EI;
    const duck=(state==='dialog'||state==='cine'||state==='itemget'||state==='pause'||state==='shop'||state==='give')?0.45:1;
    while(nextNoteT<AC.currentTime+.18){
      const i=musicStep%t.len, pass=((musicStep/t.len)|0)&1, up=(t.alt&&pass)?12:0, T=nextNoteT;
      const L=t.ev.lead[i]; if(L) note(t.lead,L.m+up,L.len*EI*.92,t.leadVol*(up?.75:1)*duck,T,{vib:L.len>=6,echo:t.echo||0,sustain:.7});
      const H=t.ev.harm[i]; if(H) note(t.harm,H.m,H.len*EI*.9,t.harmVol*duck,T,{sustain:.5});
      const B=t.ev.bass[i]; if(B) note('triangle',B.m,Math.min(B.len*EI*.95,1.2),t.bassVol*duck,T,{sustain:.6,attack:.004});
      const Dm=t.ev.drum[i]; if(Dm&&t.drumVol) DRUMS[Dm](T,t.drumVol*duck);
      nextNoteT+=EI; musicStep++;
    }
  },25);
}
