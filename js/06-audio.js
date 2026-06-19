'use strict';
/* ---------- AUDIO (WebAudio chiptune) ---------- */
let AC=null, musicOn=true, musicTimer=null, musicStep=0, nextNoteT=0;
try{ if(localStorage.getItem('sprout.music')==='0') musicOn=false; }catch(e){}
function audio(){ if(!AC){ AC=new (window.AudioContext||window.webkitAudioContext)(); startMusic(); }
  else if(AC.state==='suspended') AC.resume(); return AC; }
function f(m){ return 440*Math.pow(2,(m-69)/12); }
function beep(type,f0,f1,dur,vol,when,vib){
  const a=audio(), t=when||a.currentTime;
  const o=a.createOscillator(), g=a.createGain();
  o.type=type; o.frequency.setValueAtTime(f0,t);
  if(f1) o.frequency.exponentialRampToValueAtTime(Math.max(f1,1),t+dur);
  if(vib){ const lf=a.createOscillator(), lg=a.createGain();
    lf.frequency.value=5.5; lg.gain.value=f0*.012;
    lf.connect(lg).connect(o.frequency); lf.start(t+.12); lf.stop(t+dur+.02); }
  g.gain.setValueAtTime(vol,t); g.gain.exponentialRampToValueAtTime(.0001,t+dur);
  o.connect(g).connect(a.destination); o.start(t); o.stop(t+dur+.02);
}
let noiseBuf=null;
function noise(dur,vol,hp,when){
  const a=audio(), t=when||a.currentTime;
  if(!noiseBuf){ noiseBuf=a.createBuffer(1,a.sampleRate*0.5,a.sampleRate);
    const d=noiseBuf.getChannelData(0); for(let i=0;i<d.length;i++) d[i]=Math.random()*2-1; }
  const s=a.createBufferSource(); s.buffer=noiseBuf;
  const g=a.createGain(), fl=a.createBiquadFilter();
  fl.type=hp?'highpass':'lowpass'; fl.frequency.value=hp?3000:1200;
  g.gain.setValueAtTime(vol,t); g.gain.exponentialRampToValueAtTime(.0001,t+dur);
  s.connect(fl).connect(g).connect(a.destination); s.start(t); s.stop(t+dur);
}
const SFX = {
  sword(){ beep('square',620,180,.09,.05); noise(.05,.02,true); },
  cut(){ noise(.12,.05,false); },
  hurt(){ beep('square',180,70,.25,.07); },
  wilt(){ const a=audio(),t=a.currentTime; [62,59,55,50,43].forEach((m,i)=>beep('triangle',f(m),0,.32,.06,t+i*.16)); },
  regrow(){ const a=audio(),t=a.currentTime; [55,60,64,67,72].forEach((m,i)=>beep('square',f(m),0,.14,.05,t+i*.09)); },
  ehit(){ beep('square',420,120,.12,.05); },
  edie(){ beep('square',300,60,.2,.05); noise(.15,.04,false); },
  heart(){ beep('square',880,0,.07,.05); beep('square',1320,0,.12,.05,audio().currentTime+.08); },
  seed(){ const a=audio(),t=a.currentTime; [72,76,79,84].forEach((m,i)=>beep('square',f(m),0,.1,.05,t+i*.07)); },
  blip(){ beep('square',1100,0,.025,.025); },
  secret(){ const a=audio(),t=a.currentTime;
    [79,78,75,69,68,76,80,86].forEach((m,i)=>beep('square',f(m),0,.09,.05,t+i*.085)); },
  bump(){ beep('square',120,80,.06,.03); },
  fanfare(){ const a=audio(),t=a.currentTime;
    [[72,.0,.14],[72,.15,.14],[72,.3,.14],[76,.45,.3],[79,.8,.3],[84,1.15,.6]]
    .forEach(([m,d,du])=>{beep('square',f(m),0,du,.06,t+d); beep('square',f(m-12),0,du,.04,t+d);}); },
  boss(){ const a=audio(),t=a.currentTime; // sting amenazante al entrar en sala de jefe
    [[38,0],[38,.18],[44,.36],[43,.62]].forEach(([m,d])=>beep('square',f(m),0,.22,.07,t+d));
    noise(.4,.05,false,t+.62); },
  /* --- la banda sonora del título: cada cosa que pasa en pantalla, suena --- */
  thud(i){ const a=audio(),t=a.currentTime; // letra que aterriza: timbal + polvo, sube con cada letra
    beep('triangle',112+i*16,38,.22,.095,t); noise(.09,.05,false,t); },
  shing(){ const a=audio(),t=a.currentTime; // destello que barre el logo
    beep('square',1400,2600,.16,.02,t); beep('square',2100,3400,.12,.012,t+.05); },
  ping(){ beep('square',1800,2400,.07,.028); }, // chispa en la bellota / texto listo
  chime(){ const a=audio(),t=a.currentTime;     // la Hoja Ancestral se posa
    [76,83].forEach((m,i)=>beep('square',f(m),0,.16,.035,t+i*.09)); },
  swoosh(){ noise(.26,.022,false); },           // vaivén de la hoja al caer
  menuIn(){ const a=audio(),t=a.currentTime;    // aparece "PULSA Z"
    [64,69,72,76].forEach((m,i)=>beep('square',f(m),0,.09,.038,t+i*.06)); },
  gbDing(){ const a=audio(),t=a.currentTime;    // ¡po-LING! de encendido, como la consola de antaño
    beep('square',f(83),0,.10,.09,t); beep('square',f(95),0,.55,.09,t+.10); },
};
/* dos pistas en 3/4: vals del valle y nana de casa — melodía [midi,duración en corcheas] */
const CH_C=[48,64,67], CH_G=[43,62,67], CH_F=[41,65,69], CH_Am=[45,64,69];
const CH_Em=[40,64,67];
const TRACKS={
  /* EL ALZAMIENTO DEL BROTE — tema de título, 4/4 épico a lo intro de Zelda.
     Motto (compases 1-4): llamada larga en LA + escalada que "germina" hasta el MI agudo.
     Luego respuesta heroica, galope de marcha y clímax en LA5. Am→F→G: épica modal. */
  titulo:{ EI:.15, lead:'square', leadVol:.042, echo:true, pah:true, bassVol:.095, beats:4,
    mel:[
      [69,8],                          // la llamada: LA sostenido (cuerno)
      [69,2],[71,2],[72,2],[74,2],     // ...y el brote trepa: A B C D
      [76,6],[72,2],                   // ¡MI agudo! (el motto corona) y cae a C
      [74,4],[71,2],[67,2],            // D B G: reverencia
      [69,4],[72,2],[76,2],            // respuesta: arpegio A C E
      [77,4],[76,2],[74,2],            // F5 E D (la sombra del Viento)
      [76,2],[74,2],[71,2],[74,2],     // E D B D (vaivén)
      [69,8],                          // vuelta a casa
      [69,2],[69,1],[69,1],[69,2],[72,2], // galope de marcha en LA
      [72,2],[72,1],[72,1],[72,2],[77,2], // galope en DO, salto a F5
      [79,4],[77,2],[76,2],            // ¡SOL5! pico heroico
      [74,4],[76,2],[77,2],            // D E F: toma carrerilla...
      [81,4],[79,2],[77,2],            // ¡¡LA5!! clímax
      [79,3],[77,1],[76,2],[74,2],     // G F E D: cascada
      [72,2],[74,2],[76,2],[79,2],     // C D E G: último impulso
      [81,6],[76,2],                   // LA5 triunfal y eco en MI
    ],
    chords:[CH_Am,CH_Am,CH_F,CH_G, CH_Am,CH_F,CH_G,CH_Am,
            CH_Am,CH_F,CH_G,CH_Em, CH_F,CH_G,CH_G,CH_Am] },
  valle:{ EI:.2, lead:'square', leadVol:.035, echo:true, pah:true, bassVol:.085,
    mel:[
      [64,2],[67,2],[72,2],  [71,3],[69,1],[67,2],  [69,2],[65,2],[69,2],  [67,6],
      [64,2],[67,2],[72,2],  [74,3],[72,1],[71,2],  [69,2],[71,2],[74,2],  [72,6],
      [69,2],[72,2],[76,2],  [74,3],[76,1],[74,2],  [71,2],[74,2],[79,2],  [76,4],[74,1],[72,1],
      [77,2],[76,2],[74,2],  [76,3],[74,1],[72,2],  [74,2],[71,2],[67,2],  [72,6],
    ],
    chords:[CH_C,CH_G,CH_F,CH_C, CH_C,CH_G,CH_G,CH_C, CH_Am,CH_G,CH_G,CH_C, CH_F,CH_C,CH_G,CH_C] },
  casa:{ EI:.27, lead:'triangle', leadVol:.065, echo:false, pah:false, bassVol:.05,
    mel:[
      [72,2],[76,2],[79,2],  [76,4],[72,2],  [74,2],[77,2],[74,2],  [72,6],
      [69,2],[72,2],[76,2],  [74,4],[71,2],  [72,2],[67,2],[64,2],  [67,6],
    ],
    chords:[CH_C,CH_C,CH_G,CH_C, CH_Am,CH_G,CH_C,CH_G] },
  nieve:{ EI:.24, lead:'square', leadVol:.028, echo:true, pah:false, bassVol:.07,
    mel:[
      [69,2],[72,2],[76,2],  [74,4],[72,2],  [71,2],[74,2],[71,2],  [69,6],
      [69,2],[72,2],[77,2],  [76,4],[72,2],  [74,2],[71,2],[68,2],  [69,6],
    ],
    chords:[CH_Am,CH_F,CH_G,CH_Am, CH_Am,CH_F,[40,64,68],CH_Am] },
  cueva:{ EI:.22, lead:'square', leadVol:.022, echo:false, pah:false, bassVol:.09,
    mel:[
      [45,2],[45,2],[48,2],  [45,2],[45,2],[51,2],  [45,2],[45,2],[48,2],  [53,2],[51,2],[48,2],
      [57,2],[45,2],[45,2],  [56,2],[45,2],[45,2],  [57,2],[45,2],[48,2],  [45,6],
    ],
    chords:[[33,45,48],[33,45,48],[33,45,48],[29,41,45], [33,45,48],[33,45,48],[29,41,45],[33,45,48]] },
  pantano:{ EI:.23, lead:'square', leadVol:.026, echo:true, pah:false, bassVol:.075,
    mel:[
      [57,2],[60,2],[64,2],  [62,3],[60,1],[59,2],  [57,2],[56,2],[57,2],  [59,6],
      [57,2],[60,2],[64,2],  [65,3],[64,1],[62,2],  [60,2],[59,2],[56,2],  [57,6],
    ],
    chords:[CH_Am,[40,64,68],CH_Am,[40,64,68], CH_Am,CH_F,[40,64,68],CH_Am] },
  cima:{ EI:.2, lead:'square', leadVol:.03, echo:true, pah:false, bassVol:.085,
    mel:[
      [76,2],[75,2],[76,2],  [79,4],[76,2],  [74,2],[72,2],[71,2],  [69,6],
      [69,2],[71,2],[74,2],  [76,4],[79,2],  [83,2],[81,2],[79,2],  [76,6],
    ],
    chords:[[40,64,67],[40,64,67],[45,64,69],[45,64,69], [38,62,65],[43,62,67],[40,64,67],[40,64,67]] },
};
let curTrack=null, MEV={}, MLEN=0;
function setTrack(name){
  if(curTrack===name) return;
  curTrack=name; MEV={}; MLEN=0;
  for(const [m,len] of TRACKS[name].mel){ MEV[MLEN]={m,len}; MLEN+=len; }
  musicStep=0; if(AC) nextNoteT=AC.currentTime+.12;
}
function startMusic(){
  if(musicTimer) return;
  if(!curTrack) setTrack('casa');
  nextNoteT=AC.currentTime+.1; musicStep=0;
  musicTimer=setInterval(()=>{
    if(!musicOn||!AC) return;
    const t=TRACKS[curTrack], EI=t.EI;
    const duck=(state==='dialog'||state==='cine'||state==='itemget'||state==='pause'||state==='shop'||state==='give')?0.4:1; // música baja al hablar
    while(nextNoteT<AC.currentTime+.18){
      const i=musicStep%MLEN;
      const pass=((musicStep/MLEN)|0)&1;   // pasadas alternas: octava arriba, más suave
      const ev=MEV[i];
      if(ev){
        const d=ev.len*EI*.95, m=ev.m+(pass?12:0), v=t.leadVol*(pass?.6:1)*duck;
        beep(t.lead,f(m),0,d,v,nextNoteT,ev.len>=3);
        if(t.echo) beep('square',f(m),0,Math.min(d,.16),v*.38,nextNoteT+EI*.55); // eco GB
      }
      if(i%2===0){ // um-pah-pah (3/4 por defecto; el título marcha en 4/4)
        const q=(i>>1), nb=t.chords.length, bts=t.beats||3, bar=((q/bts)|0)%nb, beat=q%bts, ch=t.chords[bar];
        if(beat===0) beep('triangle',f(ch[0]),0,EI*1.7,t.bassVol*duck,nextNoteT);
        else if(t.pah){
          beep('square',f(ch[1]),0,.09,.015*duck,nextNoteT);
          beep('square',f(ch[2]),0,.09,.012*duck,nextNoteT);
          noise(.03,.012*duck,true,nextNoteT);
        }
      }
      nextNoteT+=EI; musicStep++;
    }
  },25);
}

