#!/usr/bin/env node
// ¿Esta versión pinta exactamente lo mismo que otra? Compara la huella de los píxeles de ~30 escenas (3 000+ fotogramas)
// entre el juego tal como está y una revisión de git (por defecto HEAD), que se saca a una carpeta temporal.
//   node tools/perf/pixels.cjs            contra el último commit
//   node tools/perf/pixels.cjs HEAD~3     contra otra revisión
// Sirve para optimizar sin miedo: si sale «idéntico», ningún píxel de ninguna escena ha cambiado.
'use strict';
const fs=require('fs'), os=require('os'), path=require('path'), {execFileSync}=require('child_process');
const HERE=__dirname, ROOT=path.resolve(HERE,'..','..'), REF=process.argv[2]||'HEAD';
const tmp=fs.mkdtempSync(path.join(os.tmpdir(),'sprout-ref-')), ref=path.join(tmp,'juego'), outA=path.join(tmp,'a.json'), outB=path.join(tmp,'b.json');
const run=(args,cwd)=>execFileSync(process.execPath,args,{cwd:cwd||ROOT,stdio:['ignore','inherit','inherit']});
try{
  execFileSync('git',['worktree','add','--detach',ref,REF],{cwd:ROOT,stdio:'ignore'});
  console.log('referencia: '+REF+' ('+execFileSync('git',['rev-parse','--short',REF],{cwd:ROOT}).toString().trim()+')');
  // las mismas escenas en las dos versiones (las de esta copia: así una escena nueva también se compara)
  run([path.join(HERE,'bench.cjs'),'--root',ref,'--hash',outA]); run([path.join(HERE,'bench.cjs'),'--hash',outB]);
  const a=JSON.parse(fs.readFileSync(outA)), b=JSON.parse(fs.readFileSync(outB)); let bad=0, n=0;
  for(const k of Object.keys(b)){ if(!a[k]) continue; n+=b[k].length; const d=b[k].map((h,i)=>h!==a[k][i]?i*5:-1).filter(i=>i>=0);
    if(d.length){ bad++; console.log('  distinto: '+k+' (fotogramas '+d.slice(0,10).join(', ')+(d.length>10?'…':'')+')'); } }
  console.log(bad?'✗ '+bad+' escena(s) cambian':'✓ idéntico: '+n+' fotogramas de '+Object.keys(b).length+' escenas, píxel a píxel'); process.exitCode=bad?1:0;
} finally { try{ execFileSync('git',['worktree','remove','--force',ref],{cwd:ROOT,stdio:'ignore'}); }catch(_){} fs.rmSync(tmp,{recursive:true,force:true}); }
