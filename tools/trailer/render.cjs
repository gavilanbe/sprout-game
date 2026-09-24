#!/usr/bin/env node
// El tráiler de SPROUT, renderizado con el propio juego.
//   node tools/trailer/render.cjs [16x9|9x16|all] [--no-encode] [--from N] [--to N]
// Deja los fotogramas en tools/trailer/out/<formato>/, el audio en out/audio.wav y,
// si hay ffmpeg, los vídeos en out/sprout-trailer-<formato>.mp4 (-14 LUFS, 60 fps).
// Ver tools/trailer/README.md.
'use strict';
const fs=require('fs'), path=require('path'), http=require('http'), {spawnSync}=require('child_process');
const HERE=__dirname, ROOT=path.resolve(HERE,'..','..'), OUT=path.join(HERE,'out');
const {chromium}=require(path.join(ROOT,'node_modules','playwright'));
const args=process.argv.slice(2), opt=k=>{ const i=args.indexOf(k); return i>=0?args[i+1]:null; };
const which=(args.find(a=>/^(16x9|9x16|all)$/.test(a))||'all'), FORMATS=which==='all'?['16x9','9x16']:[which];
const ENCODE=!args.includes('--no-encode'), FROM=+(opt('--from')||0), TO=opt('--to')!==null?+opt('--to'):null, SR=48000;
const MIME={'.html':'text/html','.js':'text/javascript','.png':'image/png','.css':'text/css','.webmanifest':'application/manifest+json','.woff2':'font/woff2'};
const server=http.createServer((req,res)=>{ const u=decodeURIComponent(req.url.split('?')[0]), f=path.join(ROOT,u==='/'?'/index.html':u);
  if(!f.startsWith(ROOT)){ res.writeHead(403); return res.end(); }
  fs.readFile(f,(e,d)=>{ if(e){ res.writeHead(404); return res.end(); } res.setHeader('Content-Type',MIME[path.extname(f)]||'application/octet-stream'); res.end(d); }); });

async function renderFormat(browser,port,fmt,withAudio){
  const page=await (await browser.newContext({serviceWorkers:'block',viewport:{width:1280,height:800}})).newPage();
  const errs=[]; page.on('pageerror',e=>errs.push(e.message)); page.on('console',m=>{ if(m.type()==='error') errs.push(m.text()); });
  await page.goto('http://127.0.0.1:'+port+'/index.html'); await page.waitForFunction(()=>typeof __sprout==='object'&&fontsReady); await page.waitForTimeout(300);
  // la tipografía del tráiler (Fredoka, variable, OFL), embebida
  const f64=n=>fs.readFileSync(path.join(HERE,'fonts',n)).toString('base64');
  await page.addStyleTag({content:['latin','latin-ext'].map(s=>`@font-face{font-family:'Fredoka';src:url(data:font/woff2;base64,${f64('Fredoka-'+s+'.woff2')}) format('woff2');font-weight:300 700;}`).join('')});
  await page.evaluate(async()=>{ for(const w of [400,500,600,700]) await document.fonts.load(w+' 40px "Fredoka"'); });
  // el juego a mano, y el audio en un OfflineAudioContext con reloj falso (avanza 1/60 s por fotograma)
  await page.evaluate(({SR})=>{ window.requestAnimationFrame=()=>0; window.__manual=true;
    const SI=window.setInterval.bind(window); window.setInterval=(fn,ms,...a)=>{ if(ms===25){ window.__musicTick=fn; return -777; } return SI(fn,ms,...a); };
    if(musicTimer){ clearInterval(musicTimer); musicTimer=null; }
    const off=new OfflineAudioContext(2,SR*80,SR); off.resume=()=>Promise.resolve(); off.suspend=()=>Promise.resolve();
    window.__fakeT=0; Object.defineProperty(off,'currentTime',{get:()=>window.__fakeT}); window.__off=off;
    window.AudioContext=function(){ return off; }; window.webkitAudioContext=window.AudioContext;
    AC=null; audio(); curTrack=null; opts.shake=true; },{SR});
  await page.addScriptTag({path:path.join(HERE,'compositor.js')});
  await page.evaluate(f=>{ TR.init(f); TR.soundMode('orig'); },fmt);
  for(const f of ['shots.js','timeline.js']) await page.addScriptTag({path:path.join(HERE,f)});
  const END=TO!==null?TO:await page.evaluate(()=>TR.END_RENDER), dir=path.join(OUT,fmt);
  fs.mkdirSync(dir,{recursive:true}); if(FROM===0) for(const f of fs.readdirSync(dir)) fs.unlinkSync(path.join(dir,f));
  const t0=Date.now(); process.stdout.write(fmt+': ');
  for(let f=FROM;f<END;){ const n=Math.min(12,END-f);
    const out=await page.evaluate(([a,n])=>{ const o=[]; for(let i=0;i<n;i++) o.push(TR.frameAt(a+i)); return o; },[f,n]);
    out.forEach((d,i)=>fs.writeFileSync(path.join(dir,String(f+i).padStart(5,'0')+'.png'),Buffer.from(d.slice(22),'base64')));
    f+=n; if(f%600<12) process.stdout.write(f+' '); }
  console.log('→',END,'fotogramas en',((Date.now()-t0)/1000).toFixed(0),'s');
  if(withAudio){ // el audio es el mismo para los dos formatos: se renderiza una vez
    const wav=await page.evaluate(async([SR,N])=>{ if(window.__musicTick) for(let i=0;i<2;i++) __musicTick();
      const buf=await __off.startRendering(), n=Math.min(buf.length,N), L=buf.getChannelData(0), R=buf.getChannelData(1);
      const ab=new ArrayBuffer(44+n*4), dv=new DataView(ab), w=(o,s)=>{ for(let i=0;i<s.length;i++) dv.setUint8(o+i,s.charCodeAt(i)); };
      w(0,'RIFF'); dv.setUint32(4,36+n*4,true); w(8,'WAVE'); w(12,'fmt '); dv.setUint32(16,16,true); dv.setUint16(20,1,true); dv.setUint16(22,2,true);
      dv.setUint32(24,SR,true); dv.setUint32(28,SR*4,true); dv.setUint16(32,4,true); dv.setUint16(34,16,true); w(36,'data'); dv.setUint32(40,n*4,true);
      for(let i=0;i<n;i++){ dv.setInt16(44+i*4,Math.max(-1,Math.min(1,L[i]))*32767,true); dv.setInt16(46+i*4,Math.max(-1,Math.min(1,R[i]))*32767,true); }
      const u=new Uint8Array(ab); let s=''; for(let i=0;i<u.length;i+=0x8000) s+=String.fromCharCode.apply(null,u.subarray(i,i+0x8000)); return btoa(s); },[SR,Math.round(END/60*SR)]);
    fs.writeFileSync(path.join(OUT,'audio.wav'),Buffer.from(wav,'base64')); console.log('audio: out/audio.wav'); }
  if(errs.length) console.log('errores:',errs.slice(0,8));
  await page.context().close(); }

function encode(fmt){ const src=path.join(OUT,fmt,'%05d.png'), mp4=path.join(OUT,'sprout-trailer-'+fmt+'.mp4');
  const r=spawnSync('ffmpeg',['-v','error','-y','-framerate','60','-i',src,'-i',path.join(OUT,'audio.wav'),'-filter_complex',
    '[0]format=yuv420p[v];[1]volume=9.7dB,alimiter=limit=0.87:attack=5:release=60:level=disabled[a]','-map','[v]','-map','[a]',
    '-c:v','libx264','-preset','slow','-crf','16','-tune','animation','-profile:v','high','-colorspace','bt709','-color_primaries','bt709','-color_trc','bt709',
    '-c:a','aac','-b:a','256k','-movflags','+faststart','-shortest',mp4],{stdio:'inherit'});
  if(r.error){ console.log('(sin ffmpeg: los fotogramas y el audio están en tools/trailer/out/)'); return false; }
  console.log('vídeo:',path.relative(ROOT,mp4)); return true; }

(async()=>{ await new Promise(r=>server.listen(0,'127.0.0.1',r)); const port=server.address().port;
  fs.mkdirSync(OUT,{recursive:true});
  const browser=await chromium.launch({args:['--js-flags=--max-old-space-size=8192']});
  for(let i=0;i<FORMATS.length;i++) await renderFormat(browser,port,FORMATS[i],i===0&&FROM===0&&TO===null||!fs.existsSync(path.join(OUT,'audio.wav')));
  await browser.close(); server.close();
  if(ENCODE&&FROM===0&&TO===null) for(const f of FORMATS) encode(f);
})().catch(e=>{ console.error(e); process.exit(1); });
