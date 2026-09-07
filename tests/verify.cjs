/* Pruebas en navegador real: npm install && npx playwright install chromium && npm test */
const assert=require('node:assert/strict');
const fs=require('node:fs'), path=require('node:path'), http=require('node:http');
const {chromium}=require(process.env.SPROUT_PLAYWRIGHT||'playwright');
const root=path.resolve(__dirname,'..');
const server=http.createServer((req,res)=>{
  const file=path.join(root,decodeURIComponent(req.url.split('?')[0]==='/'?'/index.html':req.url.split('?')[0]));
  if(!file.startsWith(root+path.sep)){res.writeHead(403);return res.end();}
  fs.readFile(file,(err,data)=>{if(err){res.writeHead(404);res.end();return;}res.setHeader('Content-Type',({'.html':'text/html','.js':'text/javascript','.css':'text/css','.png':'image/png'})[path.extname(file)]||'application/octet-stream');res.end(data);});
});
(async()=>{
  await new Promise(r=>server.listen(0,'127.0.0.1',r));
  const browser=await chromium.launch({headless:true,executablePath:process.env.SPROUT_CHROME||undefined});
  const page=await browser.newPage({viewport:{width:1000,height:800}}), errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  await page.goto('http://127.0.0.1:'+server.address().port);
  await page.waitForFunction(()=>typeof __sprout==='object');
  await page.evaluate(()=>{ fontsReady=true; window.__manual=true; window.__step=(n)=>{ for(let i=0;i<n;i++) update(); }; });
  let passed=0, failed=0;
  async function check(name,fn){ try{ await fn(); passed++; console.log('✓ '+name); }catch(e){ failed++; console.log('✗ '+name+'\n   '+(e.message||e).toString().split('\n').slice(0,12).join('\n   ')); } }
  const eq=(a,b)=>assert.deepEqual(a,b);
  const ev=(f,...a)=>page.evaluate(f,...a);
  await ev(()=>{
    window.__press=(k,n)=>{ keys[k]=true; if(k==='fire') keys.fireHeld=true; __step(n||1); if(k==='fire') keys.fireHeld=false; if(k!=='fire'&&k!=='alt'&&k!=='menu') keys[k]=false; };
    window.__hold=(k,n)=>{ keys[k]=true; __step(n); keys[k]=false; };
    window.__skipDialog=(max)=>{ let i=0; while(state==='dialog'&&i++<(max||40)){ dlg.chars=9999; keys.fire=true; __step(1); } };
    window.__go=(nx,ny,px,py)=>{ __sprout.warp(nx,ny,px,py); hitStop=0; __step(2); if(state==='dialog') __skipDialog(); };
  });
  await check('Todos los mapas miden 10×8; hay 8 semillas, 3 corazones, 5 cuartos y 10 diarios',async()=>{
    eq(await ev(()=>{ const bad=Object.entries(MAPS).filter(([k,r])=>r.length!==8||r.some(s=>[...s].length!==10)).map(([k])=>k);
      const all=Object.values(MAPS).flat().join(''); return {bad,seeds:(all.match(/[1-8Q]/g)||[]).length,hearts:(all.match(/9/g)||[]).length,pieces:(all.match(/♥/g)||[]).length,diaries:(all.match(/0/g)||[]).length,maps:Object.keys(MAPS).length}; }),
      {bad:[],seeds:8,hearts:3,pieces:5,diaries:10,maps:55});
  });
  await check('Todas las pantallas se renderizan sin tiles desconocidos ni errores',async()=>{
    const r=await ev(()=>{ const out=[]; for(const key in MAPS){ const [x,y]=key.split(',').map(Number); loadScreen(x,y); rebuildBg();
      for(let yy=0;yy<SH;yy++) for(let xx=0;xx<SW;xx++){ const ch=grid[yy][xx]; if(!GROUND.has(ch)&&!SOLID.has(ch)&&ch!=='zd'&&ch!=='z') out.push(key+':'+ch); } } return out; });
    eq(r,[]);
  });
  await check('Arranque: boot → título → archivos → partida nueva → cinemática → casa',async()=>{
    eq(await ev(()=>{ state='boot'; bootT=50; keys.fire=true; __step(1); const s1=state; __step(70); const s2=state; titleT=TITLE_MENU+5; keys.fire=true; __step(1); const s3=state; keys.fire=true; __step(1); const s4=state;
      for(let i=0;i<8&&state==='cine';i++){ cineChars=9999; keys.fire=true; __step(1); if(cineFold) __step(30); } return [s1,s2,s3,s4,state,sx,sy,inBed]; }),['boot','title','file','cine','play',9,9,true]);
  });
  await check('Al moverse sale de la maceta; la salida de casa lleva al barrio',async()=>{
    eq(await ev(()=>{ wakeT=0; hitStop=0; __hold('down',30); const a=inBed; player.x=76; player.y=96; __hold('down',12); if(state==='dialog') __skipDialog(); return [a,sx,sy]; }),[false,0,1]);
  });
  await check('El valle no te suelta hasta hablar con Raíz; luego sí',async()=>{
    eq(await ev(()=>{ __go(0,1,60,70); player.y=104; __hold('down',8); if(state==='dialog') __skipDialog(); const stuck=[sx,sy,state];
      __go(1,1,64,72); player.dir=1; keys.fire=true; __step(1); const talk=state; __skipDialog(); const met=elderMet;
      __go(0,1,60,70); player.y=104; __hold('down',10); __step(40); return [stuck,talk,met,sx,sy]; }),[[0,1,'play'],'dialog',true,0,2]);
  });
  await check('La Hoja se recoge en la playa y corta arbustos e hierba (con botín)',async()=>{
    eq(await ev(()=>{ __go(0,2,30,30); const before=hasBlade; player.x=5*16; player.y=4*16-10; __step(5); __skipDialog(); const got=hasBlade; __skipDialog();
      __go(0,2,90,30); player.x=6*16; player.y=4*16-4; player.dir=0; const wasBush=grid[5][6]==='Q'; keys.fire=true; __step(16); const cut=grid[5][6]!=='Q'; const seedOut=pickups.some(p=>p.kind==='seed');
      return [before,got,state,wasBush,cut,seedOut]; }),[false,true,'play',true,true,true]);
  });
  await check('Las 8 semillas + Raíz = valle florece y la zarza se seca',async()=>{
    eq(await ev(()=>{ seeds=8; announced8=true; __go(1,1,64,72); player.dir=1; keys.fire=true; __step(1); __step(60); __skipDialog(); __step(2); __skipDialog();
      const w=won; __go(0,0,72,30); return [w,grid[0][4],isSolid(grid[0][4])]; }),[true,'zd',false]);
  });
  await check('Transición entre pantallas conserva al jugador dentro del mapa',async()=>{
    eq(await ev(()=>{ __go(2,1,140,20); player.x=150; __hold('right',10); __step(40); const a=[sx,sy,state,boxFree(player.x+4,player.y+8,8,8)];
      player.x=4; __hold('left',10); __step(40); return [a,[sx,sy,state]]; }),[[3,1,'play',true],[2,1,'play']]);
  });
  await check('Cueva del Topo: placas abren la verja; pulsador abre la otra; llave abre el cerrojo',async()=>{
    eq(await ev(()=>{ __go(7,0,72,70); const gate0=grid[6][4]; __sprout.solvePlates(); const gate1=grid[6][4];
      __go(7,1,72,30); const g0=grid[3][1]; player.x=5*16; player.y=4*16-6; __step(3); const g1=grid[3][1];
      __go(8,1,72,80); enemies=[]; const k0=dungeonKeys.cueva||0; player.x=4*16+4; player.y=3*16-4; __step(3); __skipDialog(); const k1=dungeonKeys.cueva;
      player.x=4*16; player.y=1*16-4; player.dir=1; keys.fire=true; __step(2); const door=grid[0][4]; return [gate0,gate1,g0,g1,k0,k1,door,dungeonKeys.cueva]; }),['=','q','=','q',0,1,'q',0]);
  });
  await check('El Escarabajo Rey solo sufre por detrás; al caer suelta la Bellota-bomba',async()=>{
    eq(await ev(()=>{ __go(8,0,72,90); __skipDialog(); const m0=midboss&&midboss.hp; midboss.dir=1; midboss.st='walk'; midboss.x=72; midboss.y=48;
      player.x=100; player.y=52; player.dir=2; player.atk=11; midboss.flash=0; __step(1); const front=midboss.hp;
      player.x=52; player.y=52; player.dir=3; player.atk=11; midboss.flash=0; __step(1); const back=midboss.hp;
      __sprout.killBoss(); hitStop=0; __step(2); const drop=pickups.some(p=>p.kind==='bomb'); return [m0,front,back,midboss===null,midKing,drop]; }),[8,8,7,true,true,true]);
  });
  await check('La bomba rompe rocas agrietadas y daña bichos; el amuleto del Topo evita el daño propio',async()=>{
    eq(await ev(()=>{ hasBomb=true; xItem='bomb'; __go(2,1,40,90); player.x=2*16; player.y=5*16-6; keys.alt=true; __step(1); const placed=bombs.length; __step(85); const broke=grid[4][2]; const hpA=player.hp;
      player.hp=player.maxHp; amulets.add('topo'); equipped=['topo',null]; keys.alt=true; __step(1); __step(85); return [placed,broke,hpA<player.maxHp,player.hp]; }),[1,'.',true,6]);
  });
  await check('El gancho cruza el agua y se agarra a los postes',async()=>{
    eq(await ev(()=>{ hasHook=true; xItem='hook'; equipped=[null,null]; __go(3,0,96,80); player.x=6*16; player.y=5*16-4; player.dir=1; keys.alt=true; __step(1); const st=state; __step(60); const at=[(player.x+8)>>4,(player.y+12)>>4];
      __go(3,0,60,30); player.x=3*16; player.y=2*16-4; player.dir=3; keys.alt=true; __step(1); const st2=state; __step(60); return [st,at,st2,(player.x+8)>>4,(player.y+12)>>4,state]; }),['hook',[6,2],'hook',6,2,'play']);
  });
  await check('La Vaina vuela, aturde y vuelve; recoge bayas lejanas',async()=>{
    eq(await ev(()=>{ hasBoomer=true; xItem='boomer'; __go(1,2,40,40); enemies=[{...spawnEnemy('blob',6,2,0)}]; pickups=[{kind:'berry',x:6*16+4,y:2*16+4,t:0}]; player.x=2*16; player.y=2*16-4; player.dir=3; berries=0; hitStop=0;
      keys.alt=true; __step(1); const thrown=!!boomer; __step(20); const stunned=enemies[0].stun>0; __step(60); return [thrown,stunned,boomer===null,berries]; }),[true,true,true,1]);
  });
  await check('El Vilano salta agujeros; sin él, caes y vuelves a la entrada',async()=>{
    eq(await ev(()=>{ hasFeather=true; xItem='feather'; __go(4,2,60,60); lastEntry={sx:4,sy:2,x:60,y:60}; player.x=4*16; player.y=3*16-4; player.dir=3; keys.alt=true; __step(1); const j=jumpT>0; __hold('right',30); const landed=[(player.x+8)>>4,state];
      player.x=6*16; player.y=3*16-4; __step(3); const fell=state; __step(45); return [j,landed,fell,state,player.x,player.hp<player.maxHp]; }),[true,[7,'play'],'fall','play',60,true]);
  });
  await check('El farol enciende antorchas; con las cuatro, la verja se abre',async()=>{
    eq(await ev(()=>{ hasLantern=true; xItem='lantern'; __go(15,0,72,60); enemies=[]; hitStop=0; const g0=grid[1][4];
      for(const [x,y,d] of [[3,1,2],[6,1,3],[3,6,2],[6,6,3]]){ player.x=x*16; player.y=y*16-4; player.dir=d; keys.alt=true; __step(1); }
      return [g0,grid[1][2],grid[1][7],grid[6][2],grid[6][7],grid[1][4]]; }),['=',';',';',';',';','q']);
  });
  await check('El cristal cambia los bloques rojos/azules y persiste al recargar la sala',async()=>{
    eq(await ev(()=>{ __go(11,1,72,40); const a=[grid[1][2],grid[1][7]]; player.x=5*16; player.y=3*16-4; player.dir=1; player.atk=11; __step(1); const b=[grid[1][2],grid[1][7],crystalOn]; __go(11,1,72,40); return [a,b,[grid[1][2],grid[1][7]]]; }),[['ª','æ'],['º','Æ',true],['º','Æ']]);
  });
  await check('El Topo Real cede la Brasa con Z al rendirse; luego regala su corona',async()=>{
    eq(await ev(()=>{ bossDone=false; topoGift=false; __go(6,2,72,90); __skipDialog(); const hp=boss.hp; boss.hp=2; __step(2); __skipDialog(); const st=boss.st; player.x=boss.x+8; player.y=boss.y+34; player.dir=1; keys.fire=true; __step(1); __skipDialog(); __step(2);
      const ember=pickups.some(p=>p.kind==='ember'); __go(6,2,72,90); const guest=npcs.some(n=>n.guest==='topo'); player.x=5*16; player.y=3*16+2; player.dir=1; keys.fire=true; __step(1); __skipDialog(); __step(2); if(state==='itemget'){ itemT=0; __step(2); __skipDialog(); }
      return [hp,st,bossDone,ember,guest,amulets.has('topo')]; }),[10,'yield',true,true,true,true]);
  });
  await check('El Viento se recuerda, no se vence; suelta el Copo',async()=>{
    eq(await ev(()=>{ boss3Done=false; __go(1,-3,72,90); __skipDialog(); boss.hp=2; __step(2); __skipDialog(); boss.st='rest'; boss.x=64; boss.y=70; player.x=72; player.y=100; player.dir=1; keys.fire=true; __step(1); const d=state; __skipDialog(); __step(2);
      return [d,boss3Done,boss===null,pickups.some(p=>p.kind==='flake')]; }),['dialog',true,true,true]);
  });
  await check('Guardar y cargar conserva objetos, amuletos, llaves y progreso',async()=>{
    eq(await ev(()=>{ curSlot=2; hasBlade=true; hasHook=true; amulets.clear(); amulets.add('buho'); equipped=['buho',null]; xItem='hook'; dungeonKeys={cueva:2}; bigKeys={tronco:true}; berries=42; pieces=3; thawed=true; save();
      const d=readSlot(2); hasBlade=false; amulets.clear(); berries=0; loadGame(d); return [hasBlade,hasHook,[...amulets],equipped,xItem,dungeonKeys.cueva,bigKeys.tronco,berries,pieces,thawed]; }),[true,true,['buho'],['buho',null],'hook',2,true,42,3,true]);
  });
  await check('Las misiones se derivan del estado',async()=>{
    eq(await ev(()=>{ won=true; hasEmber=false; const q=questList(); return [q.find(x=>x.id==='cueva').done,q.some(x=>x.id==='amuletos')]; }),[false,true]);
  });
  await check('Grafo del mundo: con todo abierto, cada región se alcanza andando desde la plaza',async()=>{
    const r=await ev(()=>{ won=true; const seen=new Set(['1,1']), q=['1,1']; const openCh=c=>!SOLID.has(c)||c==='z'||c==='C'||c===')'||c==='Ł';
      while(q.length){ const k=q.shift(); const [x,y]=k.split(',').map(Number); const A=MAPS[k];
        for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){ const nk=(x+dx)+','+(y+dy); if(!MAPS[nk]||seen.has(nk)) continue; const B=MAPS[nk]; let ok=false;
          if(dx){ for(let i=0;i<8;i++) if(openCh(A[i][dx>0?9:0])&&openCh(B[i][dx>0?0:9])) ok=true; } else { for(let i=0;i<10;i++) if(openCh(A[dy>0?7:0][i])&&openCh(B[dy>0?0:7][i])) ok=true; }
          if(ok){ seen.add(nk); q.push(nk); } } }
      return ['0,0','4,2','0,-1','3,-1','1,-2','3,3','1,3','4,0'].map(k=>seen.has(k)); });
    eq(r,[true,true,true,true,true,true,true,true]);
  });
  await check('Camino crítico: la Cueva del Topo se completa con sus propias llaves y herramientas',async()=>{
    const r=await ev(()=>{ // partida limpia con las 8 semillas entregadas
      newGame(); state='play'; inBed=false; introDone=true; elderMet=true; hasBlade=true; seeds=8; won=true; announced8=true; bloomDone=true;
      const log=[];
      // entrar por la boca de la cueva
      __go(2,-1,80,40); player.x=5*16; player.y=2*16-4; player.dir=1; keys.up=true; __step(2); keys.up=false; __skipDialog(); log.push(['cueva',sx,sy]);
      // sala de las raíces: bloques (2,3)→(2,1) y (5,3)→(5,1)
      __go(7,0,72,90); __skipDialog(); enemies=[]; for(const bx of [2,5]){ player.x=bx*16; player.y=4*16-4; player.dir=1; for(let k=0;k<2;k++){ keys.up=true; for(let i=0;i<14;i++){ __step(1); } keys.up=false; __step(1); } }
      log.push(['placas',grid[1][2],grid[1][5],grid[6][4]]);
      // pulsador y llave
      __go(7,1,72,30); enemies=[]; player.x=5*16; player.y=4*16-6; __step(3); log.push(['pulsador',grid[3][1]]);
      __go(8,1,72,80); enemies=[]; player.x=4*16+4; player.y=3*16-4; __step(3); __skipDialog(); player.x=4*16; player.y=1*16-4; player.dir=1; keys.fire=true; __step(2); log.push(['llave',dungeonKeys.cueva,grid[0][4]]);
      // el Rey cae a bombazos... no hay bombas aún: por detrás con la Hoja
      __go(8,0,72,96); __skipDialog(); enemies=[]; let n=0; while(midboss&&n++<400){ midboss.st='stuck'; midboss.t=50; midboss.flash=0; player.x=midboss.x+12-(midboss.dir>0?26:-26)-8; player.y=midboss.y+4; player.dir=midboss.dir>0?3:2; player.atk=11; hitStop=0; __step(1); }
      __step(4); const bombPick=pickups.find(p=>p.kind==='bomb'); if(bombPick){ player.x=bombPick.x; player.y=bombPick.y-4; __step(3); itemT=0; __step(2); __skipDialog(); }
      log.push(['rey',midKing,hasBomb,xItem]);
      // la cripta tras la grieta: llave grande
      __go(8,1,72,80); enemies=[]; player.x=4*16; player.y=6*16-6; keys.alt=true; __step(1); __step(90); log.push(['grieta',grid[7][4],grid[7][5]]);
      __go(8,2,72,30); enemies=[]; const bk=pickups.find(p=>p.kind==='bigkey'); player.x=bk.x; player.y=bk.y-4; __step(3); __skipDialog(); log.push(['llave grande',!!bigKeys.cueva]);
      // puerta del guardián y tregua
      __go(6,1,72,80); enemies=[]; player.x=4*16; player.y=6*16-4; player.dir=0; keys.fire=true; __step(2); log.push(['puerta',grid[7][4]]);
      __go(6,2,72,96); __skipDialog(); boss.hp=2; __step(3); __skipDialog(); player.x=boss.x+8; player.y=boss.y+34; player.dir=1; keys.fire=true; __step(1); __skipDialog(); __step(3);
      const em=pickups.find(p=>p.kind==='ember'); if(em){ player.x=em.x; player.y=em.y-4; __step(3); itemT=0; __step(2); __skipDialog(); }
      log.push(['brasa',bossDone,hasEmber]);
      // a Raíz: primavera
      __go(1,1,64,72); player.dir=1; keys.fire=true; __step(1); __step(60); __skipDialog(); __step(2); __skipDialog(); log.push(['deshielo',thawed,screenBiome(1,-1)]);
      return log; });
    eq(r,[['cueva',6,0],['placas','#','#','q'],['pulsador','q'],['llave',0,'q'],['rey',true,true,'bomb'],['grieta','q','q'],['llave grande',true],['puerta','q'],['brasa',true,true],['deshielo',true,'valley']]);
  });
  await check('Camino crítico: el Tronco Hueco (llave, Zángano, gancho, cristal, llave grande, Reina)',async()=>{
    const r=await ev(()=>{ const log=[];
      newGame(); state='play'; inBed=false; introDone=true; elderMet=true; hasBlade=true; seeds=8; won=true; thawed=true; hasBomb=true; xItem='bomb'; announced8=true; bloomDone=true;
      __go(1,3,72,60); player.x=4*16; player.y=2*16-4; player.dir=1; keys.up=true; __step(2); keys.up=false; __skipDialog(); log.push(['tronco',sx,sy]);
      __go(11,0,72,90); enemies=[]; const k=pickups.find(p=>p.kind==='key'); player.x=k.x; player.y=k.y-4; __step(3); __skipDialog(); player.x=8*16; player.y=3*16-4; player.dir=3; keys.fire=true; __step(2); log.push(['cerrojo',dungeonKeys.tronco,grid[3][9]]);
      __go(12,0,40,60); __skipDialog(); enemies=[]; let n=0; while(midboss&&n++<300){ midboss.st='stunned'; midboss.t=60; midboss.flash=0; player.x=midboss.x; player.y=midboss.y+26; player.dir=1; player.atk=11; hitStop=0; __step(1); }
      __step(4); const hk=pickups.find(p=>p.kind==='hook'); if(hk){ player.x=hk.x; player.y=hk.y-4; __step(3); itemT=0; __step(2); __skipDialog(); } log.push(['zángano',midDrone,hasHook]);
      __go(11,1,72,40); enemies=[]; const east0=grid[5][7]; player.x=5*16; player.y=3*16-4; player.dir=1; player.atk=11; __step(1); log.push(['cristal',east0,grid[5][7],grid[5][2]]);
      __go(12,1,40,90); enemies=[]; const bk=pickups.find(p=>p.kind==='bigkey'); player.x=bk.x; player.y=bk.y-4; __step(3); __skipDialog(); log.push(['llave grande',!!bigKeys.tronco]);
      xItem='hook'; __go(10,1,72,20); enemies=[]; player.x=4*16; player.y=2*16-4; player.dir=0; keys.alt=true; __step(1); const hs=state; __step(70); log.push(['canal',hs,(player.y+12)>>4]);
      player.x=4*16; player.y=6*16-4; player.dir=0; keys.fire=true; __step(2); log.push(['puerta',grid[7][4]]);
      __go(10,2,72,96); __skipDialog(); boss.hp=2; __step(3); __skipDialog(); player.x=boss.x+8; player.y=boss.y+34; player.dir=1; keys.fire=true; __step(1); __skipDialog(); __step(3);
      const t=pickups.find(p=>p.kind==='tear'); if(t){ player.x=t.x; player.y=t.y-4; __step(3); itemT=0; __step(2); __skipDialog(); } log.push(['lágrima',boss2Done,hasTear]);
      __go(1,1,64,72); player.dir=1; keys.fire=true; __step(1); __step(60); __skipDialog(); __step(2); __skipDialog(); log.push(['verano',summered,screenBiome(2,3)]);
      return log; });
    eq(r,[['tronco',10,0],['cerrojo',0,'q'],['zángano',true,true],['cristal','æ','Æ','º'],['llave grande',true],['canal','hook',5],['puerta','q'],['lágrima',true,true],['verano',true,'valley']]);
  });
  await check('Camino crítico: el Templo de la Cima (bloques, cerrojo, llave grande, Guardián, vilano, antorchas, cima, Viento)',async()=>{
    const r=await ev(()=>{ const log=[];
      newGame(); state='play'; inBed=false; introDone=true; elderMet=true; hasBlade=true; seeds=8; won=true; thawed=true; summered=true; hasBomb=true; hasHook=true; hasLantern=true; xItem='bomb'; announced8=true; bloomDone=true;
      __go(1,-2,72,90); enemies=[]; player.x=4*16; player.y=5*16-4; keys.alt=true; __step(1); __step(90); log.push(['grieta',grid[4][4]]);
      xItem='hook'; player.x=4*16; player.y=4*16-4; player.dir=1; keys.alt=true; __step(1); __step(70); log.push(['canal',(player.y+12)>>4]);
      player.x=4*16; player.y=1*16-4; player.dir=1; keys.up=true; __step(2); keys.up=false; __skipDialog(); log.push(['templo',sx,sy]);
      __go(14,1,72,90); enemies=[]; __skipDialog();
      player.x=1*16; player.y=2*16-4; player.dir=3; keys.right=true; for(let i=0;i<14;i++) __step(1); keys.right=false; __step(1); player.x=3*16; player.y=1*16-4; player.dir=0; keys.down=true; for(let i=0;i<14;i++) __step(1); keys.down=false; __step(1);
      player.x=5*16; player.y=4*16-4; player.dir=3; keys.right=true; for(let i=0;i<14;i++) __step(1); keys.right=false; __step(1); player.x=7*16; player.y=3*16-4; player.dir=0; keys.down=true; for(let i=0;i<14;i++) __step(1); keys.down=false;
      log.push(['bloques',grid[3][3],grid[5][7],pickups.some(p=>p.kind==='key')]);
      const k=pickups.find(p=>p.kind==='key'); if(k){ player.x=k.x; player.y=k.y-4; __step(20); __skipDialog(); }
      __go(15,1,20,60); enemies=[]; player.x=8*16; player.y=3*16-4; player.dir=3; keys.fire=true; __step(2); log.push(['cerrojo',dungeonKeys.templo,grid[3][9]]);
      __go(16,1,72,90); enemies=[]; const bk=pickups.find(p=>p.kind==='bigkey'); player.x=bk.x; player.y=bk.y-4; __step(3); __skipDialog(); log.push(['llave grande',!!bigKeys.templo]);
      __go(16,0,72,100); __skipDialog(); enemies=[]; xItem='bomb'; let n=0; while(midboss&&n++<400){ hitStop=0; if(midboss.soft<=0){ player.x=midboss.x+4; player.y=midboss.y+24; keys.alt=true; __step(1); __step(82); } else { player.x=midboss.x+12-8; player.y=midboss.y+26; player.dir=1; player.atk=11; __step(1); } }
      __step(4); const f=pickups.find(p=>p.kind==='feather'); if(f){ player.x=f.x; player.y=f.y-4; __step(3); itemT=0; __step(2); __skipDialog(); } log.push(['guardián',midIce,hasFeather]);
      __go(15,0,72,60); enemies=[]; xItem='feather'; player.x=9*16; player.y=3*16-4; player.dir=2; keys.alt=true; __step(1); keys.left=true; __step(30); keys.left=false; log.push(['salto',(player.x+8)>>4,state]);
      xItem='lantern'; for(const [x,y,d] of [[3,1,2],[6,1,3],[3,6,2],[6,6,3]]){ player.x=x*16; player.y=y*16-4; player.dir=d; keys.alt=true; __step(1); } log.push(['antorchas',grid[1][4]]);
      player.x=4*16; player.y=1*16-4; player.dir=1; keys.fire=true; __step(2); log.push(['puerta',grid[0][4]]); player.y=-6; __step(1); log.push(['cima',sx,sy]);
      __skipDialog(); boss.hp=2; __step(3); __skipDialog(); boss.st='rest'; boss.x=64; boss.y=70; player.x=72; player.y=100; player.dir=1; keys.fire=true; __step(1); __skipDialog(); __step(3);
      const fl=pickups.find(p=>p.kind==='flake'); if(fl){ player.x=fl.x; player.y=fl.y-4; __step(3); itemT=0; __step(2); __skipDialog(); } log.push(['copo',boss3Done,hasFlake]);
      __go(1,1,64,72); player.dir=1; keys.fire=true; __step(1); __step(60); __skipDialog(); __step(2); __skipDialog(); log.push(['final',cycled,state]);
      return log; });
    eq(r,[['grieta','n'],['canal',1],['templo',15,2],['bloques','#','#',true],['cerrojo',0,'q'],['llave grande',true],['guardián',true,true],['salto',6,'play'],['antorchas','q'],['puerta','q'],['cima',1,-3],['copo',true,true],['final',true,'credits']]);
  });
  await check('Zurrón y tiendas por teclado: equipar objeto y amuleto, comprar en Tilo',async()=>{
    eq(await ev(()=>{ hasBomb=true; hasHook=true; amulets.add('raiz'); amulets.add('buho'); equipped=[null,null]; xItem='bomb'; __go(0,1,60,70);
      keys.menu=true; __step(1); const p=state; keys.right=true; __step(1); keys.right=false; __step(1); keys.fire=true; __step(1); const x1=xItem;
      keys.down=true; __step(1); keys.down=false; __step(1); keys.fire=true; __step(1); keys.right=true; __step(1); keys.right=false; __step(1); keys.fire=true; __step(1); const eq1=equipped.slice();
      keys.menu=true; __step(1); const back=state;
      berries=100; __sprout.shopUI('tilo'); keys.fire=true; __step(1); __skipDialog(); return [p,x1,eq1,back,bladeLvl,berries]; }),['pause','hook',['raiz','buho'],'play',2,85]);
  });
  await browser.close(); server.close();
  if(errors.length){ console.log('Errores de página:\n'+errors.join('\n')); }
  console.log(`\n${passed} pruebas pasan, ${failed} fallan`);
  process.exit(failed||errors.length?1:0);
})();
