#!/usr/bin/env node
// El banco de rendimiento de SPROUT: el juego de verdad en Chromium, ~30 escenas deterministas (tools/perf/scenes.js).
//   node tools/perf/bench.cjs                    coste por fotograma (update / draw / present) de cada escena, y de cargar cada pantalla
//   node tools/perf/bench.cjs --throttle 4       lo mismo con la CPU 4× más lenta (un móvil medio)
//   node tools/perf/bench.cjs --ops              órdenes de dibujo por fotograma (drawImage, fillRect...): no depende de la carga de la máquina
//   node tools/perf/bench.cjs --profile plaza    qué funciones pesan en una escena (y quién pide cada drawImage/fillRect)
//   node tools/perf/bench.cjs --boot             el arranque: hasta el primer fotograma, y por fichero y función
//   node tools/perf/bench.cjs --hash out.json    la huella de los píxeles de cada 5.º fotograma (la usa pixels.cjs)
//   --only a,b   solo esas escenas · --root DIR   otra copia del juego
'use strict';
const fs=require('fs'), path=require('path'), http=require('http');
const A=process.argv.slice(2), opt=k=>{ const i=A.indexOf(k); return i>=0?A[i+1]:null; };
const HERE=__dirname, ROOT=path.resolve(opt('--root')||path.join(HERE,'..','..'));
const {chromium}=require(path.join(HERE,'..','..','node_modules','playwright'));
const THR=+(opt('--throttle')||1), HASH=opt('--hash'), ONLY=opt('--only'), PROF=opt('--profile'), BOOT=A.includes('--boot'), OPS=A.includes('--ops');
const MIME={'.html':'text/html','.js':'text/javascript','.png':'image/png','.css':'text/css','.webmanifest':'application/manifest+json'};
const server=http.createServer((req,res)=>{ const u=decodeURIComponent(req.url.split('?')[0]), f=path.join(ROOT,u==='/'?'/index.html':u);
  fs.readFile(f,(e,d)=>{ if(e){ res.writeHead(404); return res.end(); } res.setHeader('Content-Type',MIME[path.extname(f)]||'application/octet-stream'); res.end(d); }); });
function summarize(profile,topN){ const nodes=new Map(); for(const n of profile.nodes) nodes.set(n.id,n); const self=new Map(), dt=profile.timeDeltas;
  const parent=new Map(); for(const n of profile.nodes) for(const c of (n.children||[])) parent.set(c,n.id); const nat=new Map();
  for(let i=0;i<profile.samples.length;i++){ const n=nodes.get(profile.samples[i]), cf=n.callFrame, key=(cf.functionName||'(anon)')+' '+cf.url.split('/').pop()+':'+(cf.lineNumber+1); self.set(key,(self.get(key)||0)+(dt[i]||0));
    if(!cf.url&&/^(drawImage|fillRect|getImageData|putImageData|fill|clip|createRadialGradient)$/.test(cf.functionName)){ const pn=nodes.get(parent.get(n.id)); if(pn){ const pc=pn.callFrame, k=cf.functionName+' ← '+(pc.functionName||'(anon)')+' '+pc.url.split('/').pop()+':'+(pc.lineNumber+1); nat.set(k,(nat.get(k)||0)+(dt[i]||0)); } } }
  const byFile=new Map(); for(const [k,v] of self){ const f=k.split(' ')[1].split(':')[0]||'(nativo)'; byFile.set(f,(byFile.get(f)||0)+v); }
  const fmt=([k,v])=>(v/1000).toFixed(1).padStart(8)+' ms  '+k;
  return {total:[...self.values()].reduce((a,b)=>a+b,0)/1000, top:[...self].filter(([k])=>!/^\((idle|program)\)/.test(k)).sort((a,b)=>b[1]-a[1]).slice(0,topN).map(fmt),
    files:[...byFile].sort((a,b)=>b[1]-a[1]).slice(0,12).map(fmt), nat:[...nat].sort((a,b)=>b[1]-a[1]).slice(0,16).map(fmt)}; }
(async()=>{ await new Promise(r=>server.listen(0,'127.0.0.1',r)); const url='http://127.0.0.1:'+server.address().port+'/index.html';
  const b=await chromium.launch({args:['--autoplay-policy=no-user-gesture-required']}); const ctx=await b.newContext({serviceWorkers:'block',viewport:{width:1280,height:800}}); const p=await ctx.newPage();
  const errs=[]; p.on('pageerror',e=>errs.push(e.message)); const cdp=await ctx.newCDPSession(p); if(THR>1) await cdp.send('Emulation.setCPUThrottlingRate',{rate:THR});
  const done=async()=>{ if(errs.length) console.log('errores:',errs.slice(0,6)); await b.close(); server.close(); };
  if(BOOT){ await p.addInitScript(()=>{ window.__marks={}; const rAF=window.requestAnimationFrame.bind(window); let first=true;
      window.requestAnimationFrame=cb=>rAF(t=>{ if(first){ first=false; window.__marks.firstRaf=performance.now(); } cb(t); }); document.addEventListener('DOMContentLoaded',()=>{ window.__marks.dcl=performance.now(); }); });
    await cdp.send('Profiler.enable'); await cdp.send('Profiler.setSamplingInterval',{interval:200}); await cdp.send('Profiler.start');
    await p.goto(url); await p.waitForFunction(()=>typeof __sprout==='object'&&fontsReady&&window.__marks.firstRaf); await p.waitForTimeout(300);
    const {profile}=await cdp.send('Profiler.stop'), m=await p.evaluate(()=>window.__marks), s=summarize(profile,24);
    console.log('ARRANQUE (CPU '+THR+'×): DOMContentLoaded '+m.dcl.toFixed(0)+' ms · primer fotograma '+m.firstRaf.toFixed(0)+' ms\npor fichero:\n'+s.files.join('\n')+'\nfunciones:\n'+s.top.join('\n'));
    return done(); }
  await p.goto(url); await p.waitForFunction(()=>typeof __sprout==='object'&&fontsReady); await p.waitForTimeout(300);
  await p.evaluate(()=>{ window.requestAnimationFrame=()=>0; window.__manual=true; });
  await p.addScriptTag({path:path.join(HERE,'scenes.js')});
  const names=ONLY?ONLY.split(','):await p.evaluate(()=>Object.keys(SCEN));
  if(HASH){ const out={}; for(const n of names){ out[n]=(await p.evaluate(n=>__runScen(n,'hash',5),n)).H; process.stdout.write('.'); }
    fs.writeFileSync(HASH,JSON.stringify(out)); console.log(' huellas de '+names.length+' escenas → '+HASH); return done(); }
  if(PROF){ await cdp.send('Profiler.enable'); await cdp.send('Profiler.setSamplingInterval',{interval:100}); await cdp.send('Profiler.start');
    await p.evaluate(n=>__runScen(n,'time'),PROF); const {profile}=await cdp.send('Profiler.stop'), s=summarize(profile,24);
    console.log('PERFIL de '+PROF+' (CPU '+THR+'×): '+s.total.toFixed(0)+' ms\nfunciones:\n'+s.top.join('\n')+'\ndibujo nativo, por quién lo pide:\n'+s.nat.join('\n')); return done(); }
  if(OPS){ const r=await p.evaluate(names=>{ const P=CanvasRenderingContext2D.prototype, C={};
      for(const m of ['drawImage','fillRect','putImageData','getImageData','fill']){ const o=P[m]; P[m]=function(...a){ C[m]=(C[m]||0)+1; return o.apply(this,a); }; }
      const mk=window.mkCanvas; window.mkCanvas=function(w,h){ C.canvas=(C.canvas||0)+1; return mk(w,h); };
      __runScen('plaza','hash',1e9); const out={}; for(const n of names){ for(const k in C) delete C[k]; __runScen(n,'hash',1e9); out[n]={}; for(const k in C) out[n][k]=C[k]/SCEN[n].frames; } return out; },names);
    console.log('escena'.padEnd(15)+['drawImage','fillRect','putImage','getImage','lienzos'].map(s=>s.padStart(11)).join('')+'   (por fotograma)');
    for(const n of names){ const o=r[n]; console.log(n.padEnd(15)+['drawImage','fillRect','putImageData','getImageData','canvas'].map(k=>(o[k]||0).toFixed(1).padStart(11)).join('')); }
    return done(); }
  await p.evaluate(()=>__runScen('plaza','time')); // calentar
  const f=v=>v.toFixed(2).padStart(7); console.log('escena'.padEnd(15)+'  update media/p95/máx  |    draw media/p95/máx    | present |  total   (ms, CPU '+THR+'×)');
  for(const n of names){ const r=await p.evaluate(n=>__runScen(n,'time'),n); console.log(n.padEnd(15)+f(r.u.avg)+f(r.u.p95)+f(r.u.max)+' |'+f(r.d.avg)+f(r.d.p95)+f(r.d.max)+' |'+f(r.p.avg)+' |'+f(r.u.avg+r.d.avg+r.p.avg)); }
  const L=await p.evaluate(()=>__screenLoads()), lt=L.map(l=>l[1]+l[2]).sort((a,b)=>a-b);
  console.log('cargar una pantalla (loadScreen + fondo): media '+(lt.reduce((a,b)=>a+b,0)/lt.length).toFixed(1)+' ms · p95 '+lt[Math.floor(lt.length*.95)].toFixed(1)+' · máx '+lt[lt.length-1].toFixed(1));
  return done(); })().catch(e=>{ console.error(e); process.exit(1); });
