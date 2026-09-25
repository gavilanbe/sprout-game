/* Pruebas en navegador real: npm install && npx playwright install chromium && npm test */
const assert=require('node:assert/strict');
const fs=require('node:fs'), path=require('node:path'), http=require('node:http');
const {chromium}=require(process.env.SPROUT_PLAYWRIGHT||'playwright');
const root=path.resolve(__dirname,'..');
let swBump=0; // la prueba de la aplicación «publica» versiones nuevas cambiando sw.js
const server=http.createServer((req,res)=>{
  const file=path.join(root,decodeURIComponent(req.url.split('?')[0]==='/'?'/index.html':req.url.split('?')[0]));
  if(!file.startsWith(root+path.sep)){res.writeHead(403);return res.end();}
  fs.readFile(file,(err,data)=>{if(err){res.writeHead(404);res.end();return;} if(swBump&&file.endsWith(path.sep+'sw.js')) data=Buffer.concat([data,Buffer.from('\n// versión de prueba '+swBump+'\n')]);res.setHeader('Content-Type',({'.html':'text/html','.js':'text/javascript','.css':'text/css','.png':'image/png','.webmanifest':'application/manifest+json'})[path.extname(file)]||'application/octet-stream');res.end(data);});
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
    window.__skipRite=()=>{ let i=0; while((state==='rite'||state==='seasoncine')&&i++<40){ keys.fire=true; __step(1); __step(24); } }; // el rito de entrega y la cinemática del valle (15f)
    window.__skipDoor=()=>{ let i=0; while(state==='door'&&i++<200) __step(1); }; // la travesía de una puerta, cueva o escalera (15g)
    window.__go=(nx,ny,px,py)=>{ __sprout.warp(nx,ny,px,py); hitStop=0; __step(2); if(state==='dialog') __skipDialog(); };
    window.__settle=()=>{ let i=0; while(blockSlide&&i++<60) __step(1); }; // la roca empujada se arrastra y se asienta (09)
  });
  await check('Todos los mapas miden 10×8; hay 8 semillas, 5 corazones, 9 cuartos y 10 diarios',async()=>{
    eq(await ev(()=>{ const bad=Object.entries(MAPS).filter(([k,r])=>r.length!==8||r.some(s=>[...s].length!==10)).map(([k])=>k);
      const all=Object.values(MAPS).flat().join(''); return {bad,seeds:(all.match(/[1-8Q]/g)||[]).length,hearts:(all.match(/9/g)||[]).length,pieces:(all.match(/♥/g)||[]).length,diaries:(all.match(/0/g)||[]).length,maps:Object.keys(MAPS).length}; }),
      {bad:[],seeds:8,hearts:5,pieces:9,diaries:10,maps:87});
  });
  await check('Todas las pantallas se renderizan sin tiles desconocidos ni errores',async()=>{
    const r=await ev(()=>{ const out=[]; for(const key in MAPS){ const [x,y]=key.split(',').map(Number); loadScreen(x,y); rebuildBg();
      for(let yy=0;yy<SH;yy++) for(let xx=0;xx<SW;xx++){ const ch=grid[yy][xx]; if(!GROUND.has(ch)&&!SOLID.has(ch)&&ch!=='zd'&&ch!=='z') out.push(key+':'+ch); } } return out; });
    eq(r,[]);
  });
  await check('El título: la tormenta, el tronco y la bellota se ruedan sin errores; el tema entra al posarse, Z salta la intro y las flechas mueven a Sprout',async()=>{
    const r=await ev(()=>{ state='title'; titleT=0; parts=[]; curTrack='silencio'; const out=[];
      for(let i=0;i<TITLE_MENU+30;i++){ update(); if(i%3===0) draw(); if(titleT===TITLE_LAND-9) out.push(curTrack); if(titleT===TITLE_LAND) out.push(curTrack); }
      out.push(state,titleT>=TITLE_MENU);
      state='title'; titleT=40; curTrack='silencio'; keys.fire=true; update(); out.push(titleT>=TITLE_MENU,curTrack,state);
      keys.left=true; update(); keys.left=false; update(); out.push(TI.look&&TI.look.dir);
      keys.fire=true; update(); out.push(state); return out; });
    eq(r,['silencio','titulo','title',true,true,'titulo','title',2,'file']);
  });
  await check('Arranque: boot → título → archivos → partida nueva → cinemática → casa',async()=>{
    eq(await ev(()=>{ state='boot'; bootT=50; keys.fire=true; __step(1); const s1=state; __step(70); const s2=state; titleT=TITLE_MENU+5; keys.fire=true; __step(1); const s3=state; keys.fire=true; __step(1); const s4=state;
      for(let i=0;i<8&&state==='cine';i++){ cineChars=9999; keys.fire=true; __step(1); if(cineFold) __step(30); } return [s1,s2,s3,s4,state,sx,sy,inBed]; }),['boot','title','file','cine','play',9,9,true]);
  });
  await check('Al moverse sale de la maceta; la salida de casa lleva al barrio',async()=>{
    eq(await ev(()=>{ wakeT=0; hitStop=0; __hold('down',30); const a=inBed; player.x=76; player.y=96; __hold('down',12); __skipDoor(); if(state==='dialog') __skipDialog(); return [a,sx,sy]; }),[false,0,1]);
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
  await check('Las 8 semillas + Raíz = el rito: vuelan a la copa, el Roble despierta, el valle florece y la zarza se seca',async()=>{
    eq(await ev(()=>{ seeds=8; announced8=true; __go(1,1,64,72); player.dir=1; keys.fire=true; __step(1); const r0=state, w0=won; __step(160); const w1=won, look=robleLook();
      __skipRite(); const r1=state; __skipDialog(); __step(2); __skipDialog();
      const w=won; __go(0,0,72,30); return [r0,w0,w1,look,r1,w,grid[0][4],isSolid(grid[0][4])]; }),['rite',false,true,'base','dialog',true,'zd',false]);
  });
  await check('El rito de una reliquia: vuela a su altar, la raíz lleva la luz, vuelve la estación, cinemática del valle y habla Raíz',async()=>{
    eq(await ev(()=>{ won=true; seeds=8; thawed=false; hasEmber=true; __go(1,1,64,72); enemies=[]; player.dir=1; keys.fire=true; __step(1); const log=[state,rite&&rite.A&&rite.A.k];
      __step(100); log.push(thawed,rite.t>=RITE_T.land); __step(60); log.push(thawed,robleLook(),valleySeason());
      while(state==='rite') __step(1); log.push(state,seasonCine&&seasonCine.kind); __skipRite(); log.push(state,dlg&&dlg.who);
      __skipDialog(); log.push(state);
      // desde el altar también: con la Lágrima en la mano, Z frente al altar del verano
      hasTear=true; summered=false; __go(1,1,112,56); player.dir=1; keys.fire=true; __step(1); log.push(state,rite&&rite.A&&rite.A.k); __skipRite(); __skipDialog(); log.push(summered,screenBiome(1,1));
      return log; }),['rite','primavera',false,true,true,'spring',0,'seasoncine','primavera','dialog','RAÍZ','play','rite','verano',true,'summer']);
  });
  await check('Transición entre pantallas conserva al jugador dentro del mapa',async()=>{
    eq(await ev(()=>{ __go(2,1,140,20); player.x=150; __hold('right',10); __step(40); const a=[sx,sy,state,boxFree(player.x+4,player.y+8,8,8)];
      player.x=4; __hold('left',10); __step(40); return [a,[sx,sy,state]]; }),[[3,1,'play',true],[2,1,'play']]);
  });
  await check('Cueva del Topo: placas abren la verja; pulsador abre la otra; llave abre el cerrojo',async()=>{
    eq(await ev(()=>{ __go(7,0,72,70); const gate0=grid[6][4]; __sprout.solvePlates(); const gate1=grid[6][4];
      __go(7,1,72,30); const g0=grid[3][1]; player.x=5*16; player.y=4*16-6; __step(3); const g1=grid[3][1];
      __go(7,-1,40,60); enemies=[]; const k0=dungeonKeys.cueva||0; const kp=pickups.find(p=>p.kind==='key'); player.x=kp.x; player.y=kp.y-4; __step(3); __skipDialog(); const k1=dungeonKeys.cueva;
      __go(8,1,72,80); enemies=[]; player.x=4*16; player.y=1*16-4; player.dir=1; keys.fire=true; __step(2); const door=grid[0][4]; return [gate0,gate1,g0,g1,k0,k1,door,dungeonKeys.cueva]; }),['=','q','=','q',0,1,'q',0]);
  });
  await check('El Escarabajo Rey solo sufre por detrás; al caer suelta la Bellota-bomba',async()=>{
    eq(await ev(()=>{ __go(8,0,72,90); __skipDialog(); const m0=midboss&&midboss.hp; midboss.dir=1; midboss.st='walk'; midboss.x=72; midboss.y=48;
      player.x=100; player.y=52; player.dir=2; player.atk=11; midboss.flash=0; __step(1); const front=midboss.hp;
      player.x=52; player.y=52; player.dir=3; player.atk=11; midboss.flash=0; __step(1); const back=midboss.hp;
      __sprout.killBoss(); hitStop=0; __step(2); const drop=pickups.some(p=>p.kind==='bomb'); return [m0,front,back,midboss===null,midKing,drop]; }),[10,10,9,true,true,true]);
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
      return [hp,st,bossDone,ember,guest,amulets.has('topo')]; }),[18,'yield',true,true,true,true]);
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
      __go(2,-1,80,40); player.x=5*16; player.y=2*16-4; player.dir=1; keys.up=true; __step(2); keys.up=false; __skipDoor(); __skipDialog(); log.push(['cueva',sx,sy]);
      // la Sala de las Guardias: emboscada; al vencer cae una llave
      __go(6,-1,72,60); __skipDialog(); const shut=grid[7][4]; enemies=[]; __step(2); const kr=pickups.find(p=>p.kind==='key'); player.x=kr.x; player.y=kr.y-4; __step(20); __skipDialog(); log.push(['guardias',shut,grid[7][4],dungeonKeys.cueva]);
      // la Galería Oscura: la otra llave, en el saliente
      __go(7,-1,40,60); enemies=[]; const kg=pickups.find(p=>p.kind==='key'); player.x=kg.x; player.y=kg.y-4; __step(3); __skipDialog(); log.push(['galería',dungeonKeys.cueva]);
      // sala de las raíces: bloques (2,3)→(2,1) y (5,3)→(5,1)
      __go(7,0,72,90); __skipDialog(); enemies=[]; for(const bx of [2,5]){ player.x=bx*16; player.y=4*16-4; player.dir=1; for(let k=0;k<2;k++){ keys.up=true; for(let i=0;i<20;i++){ __step(1); } keys.up=false; __step(1); __settle(); } }
      log.push(['placas',grid[1][2],grid[1][5],grid[6][4]]);
      // pulsador y llave
      __go(7,1,72,30); enemies=[]; player.x=5*16; player.y=4*16-6; __step(3); log.push(['pulsador',grid[3][1]]);
      __go(8,1,72,80); enemies=[]; player.x=4*16; player.y=1*16-4; player.dir=1; keys.fire=true; __step(2); log.push(['llave',dungeonKeys.cueva,grid[0][4]]);
      __go(7,1,72,30); enemies=[]; player.x=4*16; player.y=6*16-4; player.dir=0; keys.fire=true; __step(2); log.push(['nido',dungeonKeys.cueva,grid[7][4]]);
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
      __go(1,1,64,72); player.dir=1; keys.fire=true; __step(1); __step(20); const rt=state; __skipRite(); __skipDialog(); __step(2); __skipDialog(); log.push(['deshielo',rt,thawed,screenBiome(1,-1)]);
      return log; });
    eq(r,[['cueva',6,0],['guardias','=','q',1],['galería',2],['placas','#','#','q'],['pulsador','q'],['llave',1,'q'],['nido',0,'q'],['rey',true,true,'bomb'],['grieta','q','q'],['llave grande',true],['puerta','q'],['brasa',true,true],['deshielo','rite',true,'valley']]);
  });
  await check('Camino crítico: el Tronco Hueco (llave, Zángano, gancho, cristal, llave grande, Reina)',async()=>{
    const r=await ev(()=>{ const log=[];
      newGame(); state='play'; inBed=false; introDone=true; elderMet=true; hasBlade=true; seeds=8; won=true; thawed=true; hasBomb=true; xItem='bomb'; announced8=true; bloomDone=true;
      __go(1,3,72,60); player.x=4*16; player.y=2*16-4; player.dir=1; keys.up=true; __step(2); keys.up=false; __skipDoor(); __skipDialog(); log.push(['tronco',sx,sy]);
      __go(11,0,72,90); enemies=[]; const k=pickups.find(p=>p.kind==='key'); player.x=k.x; player.y=k.y-4; __step(3); __skipDialog(); player.x=8*16; player.y=3*16-4; player.dir=3; keys.fire=true; __step(2); log.push(['cerrojo',dungeonKeys.tronco,grid[3][9]]);
      __go(12,0,40,60); __skipDialog(); enemies=[]; let n=0; while(midboss&&n++<300){ midboss.st='stunned'; midboss.t=60; midboss.flash=0; player.x=midboss.x; player.y=midboss.y+26; player.dir=1; player.atk=11; hitStop=0; __step(1); }
      __step(4); const hk=pickups.find(p=>p.kind==='hook'); if(hk){ player.x=hk.x; player.y=hk.y-4; __step(3); itemT=0; __step(2); __skipDialog(); } log.push(['zángano',midDrone,hasHook]);
      __go(11,-1,72,60); __skipDialog(); enemies=[]; __step(2); const kc=pickups.find(p=>p.kind==='key'); player.x=kc.x; player.y=kc.y-4; __step(20); __skipDialog(); log.push(['colmena',dungeonKeys.tronco]);
      __go(11,1,72,40); enemies=[]; const east0=grid[5][7]; player.x=5*16; player.y=3*16-4; player.dir=1; player.atk=11; __step(1); log.push(['cristal',east0,grid[5][7],grid[5][2]]);
      player.atk=0; player.x=8*16; player.y=5*16-4; player.dir=3; keys.fire=true; __step(2); log.push(['cerrojo este',grid[5][9],grid[6][9],dungeonKeys.tronco]);
      __go(12,1,40,90); enemies=[]; const bk=pickups.find(p=>p.kind==='bigkey'); player.x=bk.x; player.y=bk.y-4; __step(3); __skipDialog(); log.push(['llave grande',!!bigKeys.tronco]);
      xItem='hook'; __go(10,1,72,20); enemies=[]; player.x=4*16; player.y=2*16-4; player.dir=0; keys.alt=true; __step(1); const hs=state; __step(70); log.push(['canal',hs,(player.y+12)>>4]);
      player.x=4*16; player.y=6*16-4; player.dir=0; keys.fire=true; __step(2); log.push(['puerta',grid[7][4]]);
      __go(10,2,72,96); __skipDialog(); boss.hp=2; __step(3); __skipDialog(); player.x=boss.x+8; player.y=boss.y+34; player.dir=1; keys.fire=true; __step(1); __skipDialog(); __step(3);
      const t=pickups.find(p=>p.kind==='tear'); if(t){ player.x=t.x; player.y=t.y-4; __step(3); itemT=0; __step(2); __skipDialog(); } log.push(['lágrima',boss2Done,hasTear]);
      __go(1,1,64,72); player.dir=1; keys.fire=true; __step(1); __skipRite(); __skipDialog(); __step(2); __skipDialog(); log.push(['verano',summered,screenBiome(2,3),screenBiome(2,1)]);
      return log; });
    eq(r,[['tronco',10,0],['cerrojo',0,'q'],['zángano',true,true],['colmena',1],['cristal','æ','Æ','º'],['cerrojo este','q','q',0],['llave grande',true],['canal','hook',5],['puerta','q'],['lágrima',true,true],['verano',true,'summer','summer']]);
  });
  await check('Camino crítico: el Templo de la Cima (bloques, cerrojo, llave grande, Guardián, vilano, antorchas, cima, Viento)',async()=>{
    const r=await ev(()=>{ const log=[];
      newGame(); state='play'; inBed=false; introDone=true; elderMet=true; hasBlade=true; seeds=8; won=true; thawed=true; summered=true; autumned=true; hasPinwheel=true; hasBomb=true; hasHook=true; hasLantern=true; xItem='bomb'; announced8=true; bloomDone=true;
      __go(1,-2,72,90); enemies=[]; const drift=grid[5][4]; xItem='molinillo'; player.x=4*16; player.y=6*16-4; player.dir=1; keys.alt=true; __step(1); __step(30); log.push(['ventisquero',drift,grid[5][4]]);
      xItem='bomb'; player.x=4*16; player.y=5*16-4; keys.alt=true; __step(1); __step(90); log.push(['grieta',grid[4][4]]);
      xItem='hook'; player.x=4*16; player.y=4*16-4; player.dir=1; keys.alt=true; __step(1); __step(70); log.push(['canal',(player.y+12)>>4]);
      player.x=4*16; player.y=1*16-4; player.dir=1; keys.up=true; __step(2); keys.up=false; __skipDoor(); __skipDialog(); log.push(['templo',sx,sy]);
      __go(14,1,72,90); enemies=[]; __skipDialog();
      player.x=1*16; player.y=2*16-4; player.dir=3; keys.right=true; for(let i=0;i<14;i++) __step(1); keys.right=false; __step(1); __settle(); player.x=3*16; player.y=1*16-4; player.dir=0; keys.down=true; for(let i=0;i<14;i++) __step(1); keys.down=false; __step(1); __settle();
      player.x=5*16; player.y=4*16-4; player.dir=3; keys.right=true; for(let i=0;i<14;i++) __step(1); keys.right=false; __step(1); __settle(); player.x=7*16; player.y=3*16-4; player.dir=0; keys.down=true; for(let i=0;i<14;i++) __step(1); keys.down=false; __step(1); __settle();
      log.push(['bloques',grid[3][3],grid[5][7],pickups.some(p=>p.kind==='key')]);
      const k=pickups.find(p=>p.kind==='key'); if(k){ player.x=k.x; player.y=k.y-4; __step(20); __skipDialog(); }
      __go(15,1,20,60); enemies=[]; player.x=8*16; player.y=3*16-4; player.dir=3; keys.fire=true; __step(2); log.push(['cerrojo',dungeonKeys.templo,grid[3][9]]);
      __go(16,1,72,90); enemies=[]; const bk=pickups.find(p=>p.kind==='bigkey'); player.x=bk.x; player.y=bk.y-4; __step(3); __skipDialog(); log.push(['llave grande',!!bigKeys.templo]);
      __go(16,0,72,100); __skipDialog(); enemies=[]; xItem='bomb'; let n=0; while(midboss&&n++<400){ hitStop=0; if(midboss.soft<=0){ player.x=midboss.x+4; player.y=midboss.y+24; keys.alt=true; __step(1); __step(82); } else { player.x=midboss.x+12-8; player.y=midboss.y+26; player.dir=1; player.atk=11; __step(1); } }
      __step(4); const f=pickups.find(p=>p.kind==='feather'); if(f){ player.x=f.x; player.y=f.y-4; __step(3); itemT=0; __step(2); __skipDialog(); } log.push(['guardián',midIce,hasFeather]);
      __go(15,0,72,60); enemies=[]; xItem='feather'; player.x=9*16; player.y=3*16-4; player.dir=2; keys.alt=true; __step(1); keys.left=true; __step(30); keys.left=false; log.push(['salto',(player.x+8)>>4,state]);
      xItem='lantern'; for(const [x,y,d] of [[3,1,2],[6,1,3],[3,6,2],[6,6,3]]){ player.x=x*16; player.y=y*16-4; player.dir=d; keys.alt=true; __step(1); } log.push(['antorchas',grid[1][4]]);
      player.x=4*16; player.y=1*16-4; player.dir=1; keys.fire=true; __step(2); log.push(['puerta',grid[0][4]]); player.y=-6; __step(1); __skipDoor(); log.push(['cima',sx,sy]);
      __skipDialog(); boss.hp=2; __step(3); __skipDialog(); boss.st='rest'; boss.x=64; boss.y=70; player.x=72; player.y=100; player.dir=1; keys.fire=true; __step(1); __skipDialog(); __step(3);
      const fl=pickups.find(p=>p.kind==='flake'); if(fl){ player.x=fl.x; player.y=fl.y-4; __step(3); itemT=0; __step(2); __skipDialog(); } log.push(['copo',boss3Done,hasFlake]);
      __go(1,1,64,72); player.dir=1; keys.fire=true; __step(1); __step(60); for(let i=0;i<30&&state!=='credits';i++){ if(state==='dialog') __skipDialog(); else { __step(45); keys.fire=true; __step(1); } } log.push(['final',cycled,state]);
      return log; });
    eq(r,[['ventisquero','∩','n'],['grieta','n'],['canal',1],['templo',15,2],['bloques','#','#',true],['cerrojo',0,'q'],['llave grande',true],['guardián',true,true],['salto',6,'play'],['antorchas','q'],['puerta','q'],['cima',1,-3],['copo',true,true],['final',true,'credits']]);
  });
  await check('Camino crítico: el Molino de la Hojarasca (emboscadas, grieta, Espantapájaros, molinillo, molinetes, mapa, brújula, llave grande, Ciervo, otoño)',async()=>{
    const r=await ev(()=>{ const log=[];
      newGame(); state='play'; inBed=false; introDone=true; elderMet=true; hasBlade=true; seeds=8; won=true; thawed=true; summered=true; hasBomb=true; bombAmmo=10; hasHook=true; xItem='bomb'; announced8=true; bloomDone=true;
      // la Ciénaga: con el verano, la hojarasca podrida ya no tapa la puerta del molino
      __go(4,3,72,90); enemies=[]; log.push(['ciénaga',grid[2][7],grid[1][7]]);
      player.x=7*16; player.y=2*16-4; player.dir=1; keys.up=true; __step(2); keys.up=false; __skipDoor(); __skipDialog(); log.push(['molino',sx,sy]);
      // Granero: emboscada → llave
      __go(18,2,130,60); const shut=grid[3][9]; enemies=[]; __step(2); const k1=pickups.find(p=>p.kind==='key'); if(k1){ player.x=k1.x; player.y=k1.y-4; __step(20); __skipDialog(); } log.push(['granero',shut,grid[3][9],dungeonKeys.molino]);
      // Sala de los Sacos: la bomba abre la pared agrietada → llave
      __go(20,2,20,60); enemies=[]; player.x=5*16; player.y=3*16-4; keys.alt=true; __step(1); player.x=2*16; player.y=5*16-4; __step(90); const c=grid[3][6];
      const k2=pickups.find(p=>p.kind==='key'); if(k2){ player.x=k2.x; player.y=k2.y-4; __step(3); __skipDialog(); } log.push(['sacos',c,dungeonKeys.molino]);
      // Engranajes: cerrojo del oeste (las llaves valen en cualquier orden)
      __go(19,1,72,88); enemies=[]; player.x=1*16; player.y=3*16-4; player.dir=2; keys.fire=true; __step(2); log.push(['cerrojo oeste',grid[3][0],grid[4][0],dungeonKeys.molino]);
      // el Espantapájaros: mareado, la Hoja le arranca paja; suelta el molinillo
      __go(18,1,130,60); __skipDialog(); enemies=[]; const mb=!!midboss&&midboss.type; let n=0;
      while(midboss&&n++<300){ midboss.st='dizzy'; midboss.t=60; midboss.hits=0; midboss.flash=0; midboss.hz=0; player.x=midboss.x+4; player.y=midboss.y+22; player.dir=1; player.atk=11; player.inv=60; hitStop=0; __step(1); }
      __step(4); const mp=pickups.find(p=>p.kind==='molinillo'); if(mp){ player.x=mp.x; player.y=mp.y-4; __step(3); itemT=0; __step(2); __skipDialog(); } log.push(['espantapájaros',mb,midScare,hasPinwheel]);
      // Engranajes: dos molinetes girando a la vez abren el norte para siempre
      xItem='molinillo'; __go(19,1,72,88); enemies=[]; player.x=2*16; player.y=3*16-4; player.dir=1; keys.alt=true; __step(1); __step(14);
      player.x=7*16; player.y=6*16-4; player.dir=1; keys.alt=true; __step(1); __step(12); log.push(['engranajes',grid[0][4],grid[0][5],opened.has('G19,1')]);
      // Despensa: emboscada → cofre del mapa; y el cerrojo del norte
      __go(20,1,20,60); enemies=[]; __step(2); const chest=grid[4][4]; player.x=4*16; player.y=5*16-4; player.dir=1; keys.fire=true; __step(1); const s1=state; itemT=0; __step(2); __skipDialog();
      player.x=4*16; player.y=1*16-4; player.dir=1; keys.fire=true; __step(2); log.push(['despensa',chest,s1,dmaps.has('molino'),grid[0][4],dungeonKeys.molino]);
      // Sala del Viento: mientras gira un molinete la verja se abre; luego se cierra
      __go(20,0,72,100); enemies=[]; const g0=grid[3][4]; player.x=2*16; player.y=6*16-4; player.dir=1; keys.alt=true; __step(1); __step(10); const g1=grid[3][4]; __step(160); log.push(['viento',g0,g1,grid[3][4]]);
      // Cámara de la Llave: la hojarasca frena la ráfaga; con el paso libre, una sola ráfaga gira los tres
      __go(20,-1,72,100); enemies=[]; player.x=1*16; player.y=2*16-4; player.dir=3; keys.alt=true; __step(1); __step(14); const leaf=grid[2][3], gA=grid[5][6];
      keys.alt=true; __step(1); __step(30); log.push(['molinetes',leaf,gA,grid[5][6]]);
      const bk=pickups.find(p=>p.kind==='bigkey'); if(bk){ player.x=bk.x; player.y=bk.y-4; __step(3); __skipDialog(); } log.push(['llave grande',!!bigKeys.molino]);
      // Sala de las Aspas: un cuarto de corazón bajo las hojas; la puerta del guardián
      __go(19,0,72,100); enemies=[]; player.x=7*16; player.y=6*16-4; player.dir=1; keys.alt=true; __step(1); __step(14); const pc=pickups.find(p=>p.kind==='piece'), p0=pieces; if(pc){ player.x=pc.x; player.y=pc.y-4; __step(20); __skipDialog(); }
      player.x=4*16; player.y=1*16-4; player.dir=1; keys.fire=true; __step(2); log.push(['aspas',pieces-p0,grid[0][4]]);
      // Laberinto de Hojarasca: bajo las hojas, suelo o agujero; la brújula al otro lado
      __go(18,0,120,60); enemies=[]; const gust=(x,y,d)=>{ player.x=x*16; player.y=y*16-4; player.dir=d; keys.alt=true; __step(1); __step(12); };
      gust(6,4,2); gust(5,4,2); gust(4,4,2); gust(4,4,0); gust(4,5,2); gust(3,5,0);
      player.x=1*16; player.y=2*16-4; player.dir=1; keys.fire=true; __step(1); itemT=0; __step(2); __skipDialog();
      log.push(['laberinto',grid[4][5],grid[4][4],grid[4][3],grid[5][4],grid[5][3],grid[6][3],dcomp.has('molino')]);
      // el Ciervo de Ámbar: se rinde y cede la Hoja de Ámbar
      __go(19,-1,72,100); __skipDialog(); enemies=[]; projs=[]; boss.hp=2; hitStop=0; __step(3); __skipDialog(); const y=boss.st; player.atk=0; player.x=boss.x+8; player.y=boss.y+34; player.dir=1; keys.fire=true; __step(1); __skipDialog(); __step(3);
      const am=pickups.find(p=>p.kind==='amber'); if(am){ player.x=am.x; player.y=am.y-4; __step(3); itemT=0; __step(2); __skipDialog(); } log.push(['ciervo',y,boss4Done,hasAmber]);
      // la estera del zaguán devuelve a la Ciénaga, bajo la puerta
      __go(19,2,72,80); enemies=[]; player.y=100; __step(2); __skipDoor(); log.push(['salida',sx,sy,(player.x+8)>>4,(player.y+12)>>4]);
      // a Raíz: vuelve el otoño (cinemática de estación) y empieza el capítulo 4
      __go(1,1,64,72); player.dir=1; keys.fire=true; __step(1); __step(60); const st=state; for(let i=0;i<20&&state!=='play';i++){ if(state==='dialog') __skipDialog(); else { __step(45); keys.fire=true; __step(1); __step(25); } }
      log.push(['otoño',autumned,st,state,chapterIdx(),grid[6][6],questList().some(q=>q.id==='templo')]);
      return log; });
    eq(r,[['ciénaga','.','G'],['molino',19,2],['granero','=','q',1],['sacos','q',2],['cerrojo oeste','q','q',1],['espantapájaros','scare',true,true],['engranajes','q','q',true],['despensa','¤','itemget',true,'q',0],
      ['viento','=','q','='],['molinetes','q','=','q'],['llave grande',true],['aspas',1,'q'],['laberinto','q','q','°','q','q','q',true],['ciervo','yield',true,true],['salida',4,3,7,2],['otoño',true,'rite','play',4,'{',true]]);
  });
  await check('Molinillo: barre hojarasca (con bayas debajo, y se recuerda), tumba cuervos y desarma caballeros; la hojarasca podrida resiste hasta el verano',async()=>{
    eq(await ev(()=>{ newGame(); state='play'; inBed=false; introDone=true; elderMet=true; hasBlade=true; won=true; hasPinwheel=true; xItem='molinillo'; hitStop=0;
      summered=false; __go(4,3,72,90); enemies=[]; player.x=8*16; player.y=2*16-4; player.dir=2; keys.alt=true; __step(1); __step(12); const rotten=grid[2][7];
      summered=true; __go(4,3,72,90); const dry=grid[2][7];
      __go(19,2,72,88); enemies=[]; pickups=[]; player.x=3*16; player.y=2*16-4; player.dir=2; keys.alt=true; __step(1); __step(12); const berriesOut=pickups.filter(p=>p.kind==='berry').length, blown=grid[2][2];
      __go(19,2,72,88); const kept=grid[2][2];
      enemies=[spawnEnemy('crow',6,4,1),spawnEnemy('knight',2,4,1)]; enemies[0].hp=2; enemies[1].hp=4; hitStop=0;
      player.x=4*16; player.y=4*16-4; player.dir=3; player.inv=60; keys.alt=true; __step(1); __step(12); const crowDown=enemies[0].stun>0; __step(24);
      const kn=enemies.find(e=>e.type==='knight'); kn.x=2*16; kn.y=4*16; kn.st='rest'; kn.t=0; player.x=4*16; player.y=4*16-4; player.dir=2; player.inv=60; keys.alt=true; __step(1); __step(12); const bare=kn.bare>0;
      __step(30); const bl=spawnEnemy('blob',6,4,0); bl.hp=9; enemies=[bl]; const bx0=bl.x; player.x=4*16; player.y=4*16-4; player.dir=3; player.inv=60; keys.alt=true; __step(1); __step(8); const pushed=bl.x-bx0>6;
      // el ventisquero del Sendero: sin viento es un muro; la ráfaga lo deshace entero y se recuerda
      __go(1,-2,72,100); enemies=[]; const drift=[grid[5][3],grid[5][4],grid[5][5]].join(''), wall=isSolid('∩'); player.x=4*16; player.y=6*16-4; player.dir=1; keys.alt=true; __step(1); __step(20);
      const cleared=[grid[5][3],grid[5][4],grid[5][5]].join(''); __go(1,-2,72,100); const still=grid[5][4];
      return [rotten,dry,berriesOut,blown,kept,crowDown,bare,pushed,drift,wall,cleared,still]; }),['ξ','.',5,'q','q',true,true,true,'∩∩∩',true,'nnn','n']);
  });
  await check('Bichos del molino: el cuervo grazna y se lanza en picado (al remontar la Hoja no llega); el caballero para la Hoja de frente y cae por la espalda; la raíz te agarra, aprieta y un tajo te suelta',async()=>{
    eq(await ev(()=>{ newGame(); state='play'; inBed=false; introDone=true; elderMet=true; hasBlade=true; won=true; hitStop=0; player.maxHp=player.hp=12;
      __go(19,2,72,88); enemies=[]; pickups=[];
      const c=spawnEnemy('crow',4,1,1); c.hp=2; enemies=[c]; player.x=4*16; player.y=5*16-4; player.inv=60;
      let caw=false; for(let i=0;i<90&&c.st!=='swoop';i++){ __step(1); if(c.st==='caw') caw=true; } const swoop=c.st==='swoop', y0=c.y; __step(6); const dove=c.y>y0;
      c.st='back'; c.p=[16,16]; c.t=0; c.flash=0; player.x=c.x; player.y=c.y+10; player.dir=1; player.atk=11; hitStop=0; __step(1); const untouched=c.hp===2;
      player.atk=0; const k=spawnEnemy('knight',4,3,1); k.hp=4; enemies=[k]; __step(1); __step(8);
      k.face=-1; k.st='walk'; k.t=1; k.flash=0; player.x=k.x-14; player.y=k.y; player.dir=3; player.atk=11; player.inv=60; hitStop=0; __step(1); const blocked=k.hp===4;
      player.atk=0; __step(2); k.face=-1; k.st='walk'; k.t=1; k.flash=0; player.x=k.x+14; player.y=k.y; player.dir=2; player.atk=11; player.inv=60; hitStop=0; __step(1); const back=k.hp<4;
      player.atk=0; const rt=spawnEnemy('root',4,4,1); rt.hp=3; enemies=[rt]; player.x=4*16; player.y=4*16-8; player.inv=0; hitStop=0; __step(2); const grabbed=rt.st==='grab';
      const hp0=player.hp, x0=player.x; keys.left=true; for(let i=0;i<24;i++){ hitStop=0; __step(1); } keys.left=false; const held=player.x===x0, squeezed=player.hp<hp0;
      player.atk=11; hitStop=0; __step(2); const freed=rt.st==='up'; player.atk=0; keys.left=true; for(let i=0;i<10;i++){ hitStop=0; __step(1); } keys.left=false; const moved=player.x<x0;
      return [caw,swoop,dove,untouched,blocked,back,grabbed,held,squeezed,freed,moved]; }),[true,true,true,true,true,true,true,true,true,true,true]);
  });
  await check('El Espantapájaros: salta hacia ti, clava el palo (aviso) y gira sin que la Hoja le entre; mareado sí; suelta el MOLINILLO',async()=>{
    eq(await ev(()=>{ newGame(); state='play'; inBed=false; introDone=true; elderMet=true; hasBlade=true; won=true; thawed=summered=true; hitStop=0; midScare=false;
      __go(18,1,130,60); __skipDialog(); enemies=[]; const m=midboss, hp0=m.hp;
      m.st='hop'; m.t=1; m.hops=9; __step(1); const plant=m.st; for(let i=0;i<40&&m.st==='plant';i++) __step(1); const spin=m.st;
      player.x=m.x+4; player.y=m.y+22; player.dir=1; player.atk=11; m.flash=0; player.inv=60; hitStop=0; __step(1); const clang=m.hp===hp0;
      let n=0; while(midboss&&n++<300){ midboss.st='dizzy'; midboss.t=60; midboss.hits=0; midboss.flash=0; player.x=midboss.x+4; player.y=midboss.y+22; player.dir=1; player.atk=11; player.inv=60; hitStop=0; __step(1); }
      __step(4); const mp=pickups.find(p=>p.kind==='molinillo'); if(mp){ player.x=mp.x; player.y=mp.y-4; __step(3); itemT=0; __step(2); __skipDialog(); }
      return [plant,spin,clang,midScare,hasPinwheel,xItem]; }),['plant','spin',true,true,true,'molinillo']);
  });
  await check('El Ciervo de Ámbar: la Hoja resbala en su manto; el molinillo se lo arranca; marca la embestida en el suelo y al chocar se engancha; se rinde y se queda de huésped',async()=>{
    eq(await ev(()=>{ newGame(); state='play'; inBed=false; introDone=true; elderMet=true; hasBlade=true; won=true; thawed=summered=true; hasPinwheel=true; xItem='molinillo'; hitStop=0;
      boss4Done=false; __go(19,-1,72,100); __skipDialog(); enemies=[]; projs=[]; const b=boss, hp0=b.hp;
      b.st='idle'; b.t=999; b.x=56; b.y=30; player.x=b.x+8; player.y=b.y+36; player.dir=1; player.atk=11; b.flash=0; b.clangT=0; player.inv=60; hitStop=0; __step(1); const clang=b.hp===hp0;
      player.atk=0; __step(16); keys.alt=true; __step(1); __step(12); const bare=b.mantle===0;
      b.t=999; b.flash=0; player.x=b.x+8; player.y=b.y+36; player.dir=1; player.atk=11; player.inv=60; hitStop=0; __step(1); const hurtB=b.hp<hp0;
      b.mantle=1; b.st='idle'; b.t=1; b.cyc=0; player.atk=0; player.x=20; player.y=b.y+4; hitStop=0; __step(1); const wind=b.st, ax=Math.sign(b.ax);
      player.y=b.y+60; for(let i=0;i<120&&b.st!=='stuck';i++){ hitStop=0; player.inv=60; __step(1); } const stuck=b.st;
      b.hp=2; hitStop=0; __step(3); __skipDialog(); const yl=b.st; player.atk=0; player.x=b.x+8; player.y=b.y+34; player.dir=1; keys.fire=true; __step(1); __skipDialog(); __step(3);
      const am=pickups.find(p=>p.kind==='amber'); if(am){ player.x=am.x; player.y=am.y-4; __step(3); itemT=0; __step(2); __skipDialog(); }
      __go(19,-1,72,100); return [clang,bare,hurtB,wind,ax,stuck,yl,boss4Done,hasAmber,npcs.some(n=>n.guest==='ciervo'),boss===null]; }),[true,true,true,'windup',-1,'stuck','yield',true,true,true,true]);
  });
  await check('El otoño se guarda (molinillo, Ciervo, Hoja de Ámbar); misiones del molino; sin otoño, Raíz no acepta el Copo',async()=>{
    eq(await ev(()=>{ newGame(); curSlot=2; state='play'; inBed=false; introDone=true; elderMet=true; hasBlade=true; won=thawed=summered=true; hasPinwheel=true; midScare=true; hasAmber=true; boss4Done=true; save();
      const d=readSlot(2); hasPinwheel=midScare=hasAmber=boss4Done=false; loadGame(d); const q=questList();
      const saved=[hasPinwheel,midScare,hasAmber,boss4Done,autumned,chapterIdx(),q.find(x=>x.id==='molino').done,q.find(x=>x.id==='ambar2').done];
      hasAmber=false; hasFlake=true; __go(1,1,64,72); player.dir=1; keys.fire=true; __step(1); const talk=state; __skipDialog();
      return [saved,talk,cycled,state]; }),[[true,true,true,true,false,3,true,false],'dialog',false,'play']);
  });
  await check('Rocas empujadas: se arrastran y se asientan; resuelta la sala, al volver siguen donde quedaron (sin rocas nuevas)',async()=>{
    eq(await ev(()=>{ __go(7,0,72,90); __skipDialog(); enemies=[]; const count=()=>grid.flat().filter(c=>c==='#').length, n0=count();
      for(const bx of [2,5]){ player.x=bx*16; player.y=4*16-4; player.dir=1; for(let k=0;k<2;k++){ keys.up=true; for(let i=0;i<20;i++) __step(1); keys.up=false; __step(1); __settle(); } }
      const solved=opened.has('PZ7,0'), n1=count(); loadScreen(7,0); const n2=count(), onPlates=[grid[1][2],grid[1][5]];
      // una partida guardada antes de la foto de las rocas: las de salida que sobran se quitan igual
      for(const id of [...opened]) if(id.startsWith('PB7,0:')) opened.delete(id); loadScreen(7,0); const n3=count();
      return [solved,n0===n1,n2===n1,onPlates,n3===n1]; }),[true,true,true,['#','#'],true]);
  });
  await check('Al llegar a una pantalla los bichos aparecen un momento después, nunca encima, y no hacen daño hasta despertar',async()=>{
    eq(await ev(()=>{ __go(1,2,72,56); flushSpawns(); enemies=[]; loadScreen(1,2); const B=spawnEnemy('blob',4,3,0); spawnQ=[]; enemies=[]; // uno justo al lado de donde entras
      player.x=4*16+4; player.y=3*16; player.inv=0; hitStop=0; queueSpawns(); spawnQ=[B]; B.spawnAt=SPAWN_T0; const hp0=player.hp;
      const at0=enemies.length; __step(SPAWN_T0); const far=Math.hypot(B.x-player.x,B.y-player.y+4)>=SPAWN_SAFE, wake=B.wake>0;
      B.x=player.x; B.y=player.y; __step(3); const safe=player.hp===hp0; __step(SPAWN_ALERT); return [at0,enemies.length,far,wake,safe,B.wake]; }),[0,1,true,true,true,0]);
  });
  await check('Presentaciones: cada título de mazmorra, entrada y salida de jefe se rueda (entera, corta y saltada) sin errores y devuelve el juego',async()=>{
    const r=await ev(()=>{ const out=[], bad=[];
      const roll=(Q,setup)=>{ for(const mode of ['full','short','skip']){ setup(); if(mode!=='full') hinted.add('pi'+(Q.kind==='boss'?Q.type+(Q.echo?'~e':''):Q.kind==='outro'?'o'+Q.type:Q.dng)); else for(const h of [...hinted]) if(h.startsWith('pi')) hinted.delete(h);
        presentQ=Q; state='play'; if(!startPresent()){ bad.push('no arranca '+JSON.stringify(Q)); return; } let i=0;
        while((state==='present'||state==='outro')&&i++<900){ if(mode==='skip'&&i===SKIP_T+2) keys.fire=true; update(); if(i%2===0) draw(); }
        if(state!=='play') bad.push(JSON.stringify(Q)+' '+mode+' acaba en '+state); if(bossHidden) bad.push(JSON.stringify(Q)+' deja al jefe oculto'); } out.push(Q.type||Q.dng); };
      const ROOM={topo:'6,2',avispa:'10,2',viento:'1,-3',ciervo:null,king:null,drone:null,iceguard:null,scare:null};
      for(const type of Object.keys(BOSS_INTRO)){ let key=null; for(const k in MAPS){ const [x,y]=k.split(',').map(Number); if(y===12) continue; newGame(); introDone=true; loadScreen(x,y); const B=boss||midboss; if(B&&B.type===type){ key=[x,y]; break; } }
        if(!key){ bad.push('sin sala: '+type); continue; } roll({kind:'boss',type,echo:false,mid:!BOSS_INTRO[type]||!boss},()=>{ newGame(); introDone=true; loadScreen(key[0],key[1]); player.x=72; player.y=100; presentQ=null; }); }
      for(const dng of Object.keys(DNG_CARD)) roll({kind:'dng',dng},()=>{ newGame(); introDone=true; const k=Object.keys(MAPS).find(k=>{ const [x,y]=k.split(',').map(Number); return dungeonOf(x,y)===dng&&!MAPS[k].join('').match(/[J!^Λ]/); }); const [x,y]=k.split(',').map(Number); loadScreen(x,y); presentQ=null; });
      for(const type of Object.keys(BOSS_OUTRO)) roll({kind:'outro',type},()=>{ newGame(); introDone=true; const R=BOSS_OUTRO[type]; loadScreen(...({topo:[6,2],avispa:[10,2],viento:[1,-3],ciervo:[20,-1]}[type]||[R.dest.sx,R.dest.sy])); presentQ=null; player.x=72; player.y=80; });
      return {bad,out}; });
    eq(r.bad,[]);
  });
  await check('Emboscada: al entrar se cierran las puertas; al vencer se abren y cae la llave',async()=>{
    eq(await ev(()=>{ newGame(); state='play'; inBed=false; introDone=true; elderMet=true; hasBlade=true; won=true;
      __go(6,-1,72,100); const before=grid[7][4]; player.y=4*16-4; __step(1); const shut=grid[7][4]; enemies=[]; __step(2);
      const open=grid[7][4], key=pickups.some(p=>p.kind==='key'); __go(6,-1,72,60); return [before,shut,open,key,opened.has('RC6,-1'),grid[7][4]]; }),['q','=','q',true,true,'q']);
  });
  await check('Bellotas contadas: sin bellotas no hay bomba; el bellotero da tres y vuelve a brotar',async()=>{
    eq(await ev(()=>{ hasBomb=true; bombAmmo=0; xItem='bomb'; __go(7,-1,40,90); enemies=[]; player.x=5*16; player.y=4*16-4; keys.alt=true; __step(1); const none=bombs.length;
      player.x=1*16; player.y=5*16-4; player.dir=0; keys.fire=true; __step(14); const cut=grid[6][1];
      const pk=pickups.find(p=>p.kind==='bombs'); if(pk){ player.x=pk.x-4; player.y=pk.y-8; } __step(20); const ammo=bombAmmo;
      player.x=6*16; player.y=3*16-4; for(let i=0;i<500;i++) __step(1); return [none,cut,ammo,grid[6][1]]; }),[0,'q',3,'♣']);
  });
  await check('Cofres: el mapa del tronco y el zurrón de bellotas (20)',async()=>{
    eq(await ev(()=>{ hasBomb=true; bombAmmo=4; hasHook=true; __go(12,-1,72,60); enemies=[]; player.x=5*16; player.y=3*16-4; player.dir=1; keys.fire=true; __step(1); const s1=state; itemT=0; __step(2); __skipDialog();
      __go(12,2,72,20); enemies=[]; player.x=7*16; player.y=6*16-4; player.dir=1; keys.fire=true; __step(1); const s2=state; itemT=0; __step(2); __skipDialog();
      keys.menu=true; __step(1); pausePage=1; draw(); const p=state; keys.menu=true; __step(1);
      return [s1,dmaps.has('tronco'),s2,bombMax,bombAmmo,p]; }),['itemget',true,'itemget',20,20,'pause']);
  });
  await check('Topo Real: la Hoja rebota en su casco; una bomba en su túnel lo aturde y entonces sí sufre',async()=>{
    eq(await ev(()=>{ bossDone=false; hasBomb=true; bombAmmo=10; xItem='bomb'; __go(6,2,72,96); __skipDialog(); enemies=[]; projs=[];
      boss.st='up'; boss.t=90; boss.x=64; boss.y=40; const hp0=boss.hp; player.x=boss.x+8; player.y=boss.y+34; player.dir=1; player.atk=11; boss.flash=0; __step(1); const clang=boss.hp===hp0;
      boss.st='burrow'; boss.t=200; boss.mx=64; boss.my=40; bombs=[{x:boss.mx+8,y:boss.my+16,t:1}]; hitStop=0; __step(1); const dz=boss.st;
      player.x=boss.x+8; player.y=boss.y+34; player.dir=1; player.atk=11; boss.flash=0; hitStop=0; __step(1); return [clang,dz,boss.hp<hp0-1]; }),[true,'dazed',true]);
  });
  await check('Reina Avispa: en vuelo la Hoja no hiere; la raíz-gancho la baja y queda a tu merced',async()=>{
    eq(await ev(()=>{ boss2Done=false; hasHook=true; xItem='hook'; __go(10,2,72,96); __skipDialog(); enemies=[]; projs=[];
      boss.st='hover'; boss.t=200; boss.x=64; boss.y=12; const hp0=boss.hp; player.x=72; player.y=90; player.dir=1; hitStop=0;
      keys.alt=true; __step(1); const y=boss.st; __step(16); const pin=boss.st;
      player.x=boss.x+8; player.y=boss.y+34; player.dir=1; player.atk=11; boss.flash=0; hitStop=0; __step(1); return [y,pin,boss.hp<hp0]; }),['yanked','pinned',true]);
  });
  await check('Viento del Norte: con los cuatro braseros cae al suelo; el vilano esquiva su barrido',async()=>{
    eq(await ev(()=>{ boss3Done=false; hasLantern=true; hasFeather=true; xItem='lantern'; __go(1,-3,72,90); __skipDialog(); enemies=[]; projs=[]; const hp0=boss.hp;
      for(const [x,y,d] of [[1,2,1],[8,2,1],[1,5,0],[8,5,0]]){ player.x=x*16; player.y=y*16-4; player.dir=d; hitStop=0; keys.alt=true; __step(1); }
      const s1=boss.st; __step(40); const s2=boss.st; player.x=boss.x+8; player.y=boss.y+34; player.dir=1; player.atk=11; boss.flash=0; hitStop=0; __step(1); const hit=boss.hp<hp0;
      boss.st='sweep'; boss.x=player.x-8; boss.y=player.y-8; boss.vx=.1; player.inv=0; jumpT=10; const hpP=player.hp; __step(1);
      return [s1,s2,hit,player.hp===hpP]; }),['drop','rest',true,true]);
  });
  await check('Cinemática de estación y final: se ven, se saltan con Z y devuelven el control',async()=>{
    eq(await ev(()=>{ let done=0; newGame(); state='play'; inBed=false; introDone=true; hitStop=0;
      playSeasonCinematic('verano',()=>{ done++; }); const s1=state; __step(45); keys.fire=true; __step(1); __step(25); const s2=state;
      playEnding(()=>{ done++; state='credits'; creditsT=0; }); const s3=state; for(let i=0;i<4;i++){ __step(35); keys.fire=true; __step(1); } __step(2);
      return [s1,s2,s3,state,done]; }),['seasoncine','play','ending','credits',2]);
  });
  await check('Los créditos avanzan y Z devuelve al valle al terminar',async()=>{
    eq(await ev(()=>{ newGame(); state='credits'; creditsT=0; hitStop=0; __step(10); const t=creditsT; creditsT=CREDITS.length*22+100; keys.fire=true; __step(1); return [t>0,state]; }),[true,'play']);
  });
  await check('El Eco de los Guardianes: tras el final la Gruta baja al Eco; cada eco se disuelve y abre la verja',async()=>{
    eq(await ev(()=>{ newGame(); state='play'; inBed=false; introDone=true; elderMet=true; hasBlade=true; won=thawed=summered=cycled=true; hasBomb=true; bombAmmo=20; hasHook=true; hasLantern=true; hitStop=0;
      __go(5,9,72,60); const st=grid[1][8]; player.x=8*16; player.y=1*16-4; __step(3); __skipDoor(); const at=[sx,sy];
      __go(1,12,20,60); const e=!!(boss&&boss.echo), g0=grid[3][9]; boss.hp=2; __step(2); const g1=grid[3][9];
      __go(1,12,20,60); const t1=boss===null; hasPinwheel=true; __go(3,12,20,60); const c=boss&&boss.echo&&boss.type; boss.hp=2; __step(2); return [st,at,e,g0,g1,t1,c,grid[3][9]]; }),['>',[0,12],true,'=','q',true,'ciervo','q']);
  });
  await check('Ajustes: volúmenes, dificultad y vibración se guardan; la dificultad cambia el daño',async()=>{
    eq(await ev(()=>{ newGame(); state='play'; inBed=false; introDone=true; __go(0,1,60,70);
      keys.menu=true; __step(1); pausePage=4; pauseLR=0; optSel=OPT_ROWS.indexOf('musica'); keys.left=true; __step(1); keys.left=false; __step(1); const mv=opts.musVol;
      optSel=OPT_ROWS.indexOf('efectos'); keys.right=true; __step(1); keys.right=false; __step(1); const sv=opts.sfxVol;
      optSel=OPT_ROWS.indexOf('dificultad'); keys.fire=true; __step(1); const d1=opts.diff;
      optSel=OPT_ROWS.indexOf('vibracion'); keys.fire=true; __step(1); const vb=opts.vib;
      const saved=JSON.parse(localStorage.getItem('sprout.opts')); keys.menu=true; __step(1); const st=state;
      opts.diff=2; player.hp=10; player.inv=0; hurt(2); const hard=10-player.hp; opts.diff=0; player.hp=10; player.inv=0; hurt(2); const easy=10-player.hp;
      opts.diff=1; opts.musVol=7; opts.sfxVol=8; opts.vib=1; saveOpts(); player.inv=0;
      return [mv,sv,d1,vb,saved.musVol,saved.diff,st,hard,easy]; }),[6,9,2,0,6,2,'play',3,1]);
  });
  await check('Controles: reasignar una tecla (se intercambia si choca) y volver a los de fábrica',async()=>{
    eq(await ev(()=>{ assignKey('fire','k'); const a=KEYMAP.k, b=KEYMAP.z; assignKey('fire','x'); const c=KEYMAP.x, d=keysNow().alt; resetKeys(); return [a,b===undefined,c,d,KEYMAP.z,KEYMAP.x]; }),['fire',true,'fire','k','fire','alt']);
  });
  await check('Música: pistas nuevas, intensidad adaptativa, emboscada y pista desconocida sin errores',async()=>{
    eq(await ev(()=>{ const names=['emboscada','molino','desafio','final','estacion'].filter(n=>TRACKS[n]&&TRACKS[n].len>0).length;
      setTrack('jefe'); musicIntensity(1); const a=mIntTarget; musicIntensity(2); const b=mIntTarget; setTrack('valle'); musicIntensity(2); const c=mIntTarget;
      setTrack('cueva'); musicAmbush(true); const amb=curTrack; musicAmbush(false); const back=curTrack; setTrack('no-existe'); const still=curTrack;
      return [names,a,b,c,amb,back,still]; }),[5,1,2,0,'emboscada','cueva','cueva']);
  });
  await check('Audio sin chasquidos: el jefe a intensidad 2 y el efecto «block» (render offline, sin compresor)',async()=>{
    // antes: una muestra de 2,4 en el vibrato del jefe y de 6,4 en «block»; lo normal ronda 0,2
    const r=await ev(async()=>{
      const SR=48000, keep={AC,AudioContext:window.AudioContext,curTrack,master,musicBus,sfxBus,delaySend,delayWet,musicOn,mIntTarget,VOICE:{...VOICE},WAVES:{...WAVES}};
      const peak=d=>{ let p=0; for(const v of d) p=Math.max(p,Math.abs(v)); return +p.toFixed(3); };
      const fresh=off=>{ window.AudioContext=function(){ return off; }; clearInterval(musicTimer); musicTimer=null; AC=null; audio(); master.disconnect(); };
      try{
        // música: el reloj avanza a mano y el programador llena 12 s por adelantado
        const a=new OfflineAudioContext(1,SR*12,SR); let now=0; a.resume=()=>Promise.resolve(); Object.defineProperty(a,'currentTime',{get:()=>now});
        musicOn=true; curTrack=null; fresh(a); musicBus.connect(a.destination); setTrack('jefe'); musicIntensity(2);
        while(now<12){ now+=.1; await new Promise(res=>setTimeout(res,28)); } clearInterval(musicTimer); musicTimer=null;
        const boss=peak((await a.startRendering()).getChannelData(0));
        // el efecto suena «ahora», a mitad de render, como en tiempo real
        const b=new OfflineAudioContext(1,SR/2,SR), resume=b.resume.bind(b); b.resume=()=>Promise.resolve(); musicOn=false; fresh(b); sfxBus.connect(b.destination);
        b.suspend(.1).then(()=>{ SFX.block(); resume(); });
        const block=peak((await b.startRendering()).getChannelData(0));
        return [boss<.5,block<.5,boss,block];
      }finally{ clearInterval(musicTimer); musicTimer=null; OUT=null; ({AC,curTrack,master,musicBus,sfxBus,delaySend,delayWet,musicOn,mIntTarget}=keep); window.AudioContext=keep.AudioContext;
        Object.assign(VOICE,keep.VOICE); for(const k in WAVES) delete WAVES[k]; Object.assign(WAVES,keep.WAVES); if(AC) startMusic(); }
    });
    eq(r.slice(0,2),[true,true]);
  });
  await check('Zurrón y tiendas por teclado: equipar objeto y amuleto, comprar en Tilo',async()=>{
    eq(await ev(()=>{ hasBomb=true; hasHook=true; amulets.add('raiz'); amulets.add('buho'); equipped=[null,null]; xItem='bomb'; __go(0,1,60,70);
      keys.menu=true; __step(1); const p=state; keys.right=true; __step(1); keys.right=false; __step(1); keys.fire=true; __step(1); const x1=xItem;
      keys.down=true; __step(1); keys.down=false; __step(1); keys.fire=true; __step(1); keys.right=true; __step(1); keys.right=false; __step(1); keys.fire=true; __step(1); const eq1=equipped.slice();
      keys.menu=true; __step(1); const back=state;
      berries=100; __sprout.shopUI('tilo'); keys.fire=true; __step(1); __skipDialog(); return [p,x1,eq1,back,bladeLvl,berries]; }),['pause','hook',['raiz','buho'],'play',2,85]);
  });
  await check('El zurrón: cae y se abre sobre el mundo quieto, fila de EQUIPO, un recuerdo se lee con el zurrón detrás y al cerrarlo el juego sigue mientras sale volando',async()=>{
    eq(await ev(()=>{ hasBomb=true; hasHook=true; hasBlade=true; const sh=hasShield; hasShield=true; amulets.clear(); amulets.add('raiz'); equipped=[null,null]; xItem='bomb';
      const rk=Object.keys(RUNAS)[0]; collected.add('r:'+rk); __go(0,1,60,70); const log=[];
      keys.menu=true; __step(1); log.push(state,zOpenT,zSnapOk); draw(); __step(30); draw();
      keys.down=true; __step(1); keys.down=false; __step(1); keys.down=true; __step(1); keys.down=false; __step(1); log.push(bagRow(),EQUIP[pauseSel-ownedX().length-amulets.size]);
      keys.fire=true; __step(1); log.push(xItem,equipped[0]); draw();
      keys.alt=true; __step(1); keys.alt=true; __step(1); keys.alt=true; __step(1); log.push(pausePage); __step(10);
      let n=0; const dp=drawPause; drawPause=function(){ n++; return dp(); };
      keys.fire=true; __step(1); log.push(state,zLore); draw(); log.push(n>0); drawPause=dp; __skipDialog(); log.push(state,zLore);
      keys.menu=true; __step(1); log.push(state,zCloseT); draw();
      const x0=player.x; keys.right=true; __step(8); keys.right=false; log.push(player.x>x0); draw(); __step(20); log.push(zCloseT);
      hasShield=sh; collected.delete('r:'+rk); return log; }),
      ['pause',0,true, 2,'hoja', 'bomb',null, 3, 'dialog',true,true,'pause',false, 'play',0, true, -1]);
  });
  await check('Gran Remolino: Tilo lo enseña tras el deshielo; carga antes, gira dos vueltas y barre más',async()=>{
    eq(await ev(()=>{ hasBlade=true; hasSpin=true; hasBigSpin=false; bladeLvl=1; equipped=[null,null]; const th=thawed; thawed=false; __go(0,1,60,70); enemies=[]; npcs=[];
      shopKind='tilo'; const locked=shopList().find(i=>i.id==='bigspin').off;
      thawed=true; berries=100; __sprout.shopUI('tilo'); shopSel=shopList().findIndex(i=>i.id==='bigspin'); keys.fire=true; __step(1); __skipDialog(); if(state==='itemget'){ itemT=1; __step(1); __skipDialog(); }
      const got=[hasBigSpin,berries]; state='play'; player.x=60; player.y=70; player.charge=0; hitStop=0; windProjs=[];
      keys.fireHeld=true; __step(23); const ready=player.charge>=spinNeed(); keys.fireHeld=false; __step(1);
      const r=[locked,got,ready,player.spin>20,meleeBox()[2],windProjs.some(w=>w.big)]; thawed=th; return r; }),[true,[true,40],true,true,60,true]);
  });
  await check('Rayo de Hoja: templada y con el vigor lleno, el tajo hiere de lejos; herido, no',async()=>{
    eq(await ev(()=>{ hasBlade=true; bladeLvl=3; __go(1,2,40,40); const e=spawnEnemy('blob',7,2,0); e.hp=5; enemies=[e]; player.x=2*16; player.y=2*16-4; player.dir=3; player.hp=player.maxHp; hitStop=0;
      keys.fire=true; __step(1); const shot=leafBeams.length; for(let i=0;i<40;i++){ hitStop=0; __step(1); } const dmg=5-e.hp;
      leafBeams=[]; player.hp=player.maxHp-1; player.atk=0; keys.fire=true; __step(1); const hurtShot=leafBeams.length; player.hp=player.maxHp; bladeLvl=1;
      return [shot,dmg,hurtShot]; }),[1,3,0]);
  });
  await check('Raíz-gancho: agarra un bicho pequeño (aturdido) y lo trae; también bayas lejanas',async()=>{
    eq(await ev(()=>{ hasHook=true; xItem='hook'; equipped=[null,null]; __go(1,2,40,40); const e=spawnEnemy('blob',6,2,0); e.hp=9; enemies=[e]; const x0=e.x; player.x=2*16; player.y=2*16-4; player.dir=3; hitStop=0;
      keys.alt=true; __step(1); const grabbed=!!grabRope&&e.stun>0; __step(14); const pulled=x0-e.x;
      enemies=[]; pickups=[{kind:'berry',x:6*16+4,y:2*16+4,t:0}]; const b0=berries; keys.alt=true; __step(1); __step(16); return [grabbed,pulled>40,berries-b0,state]; }),[true,true,1,'play']);
  });
  await check('Escudo de Roble: lo que bloqueas justo al girarte rebota y hiere a quien lo lanzó',async()=>{
    eq(await ev(()=>{ hasShield=true; shieldLvl=2; __go(1,2,40,40); const s=spawnEnemy('seton',7,2,0); enemies=[s]; projs=[]; const hp0=s.hp; player.x=3*16; player.y=2*16-4; player.inv=0; player.kx=player.ky=0; player.dir=2; hitStop=0; __step(1); player.dir=3; hitStop=0;
      projs=[{x:5*16,y:2*16+8,vx:-1.3,vy:0,t:70,kind:'spore'}]; const hpP=player.hp; __step(16); const refl=projs.some(p=>p.reflected);
      for(let i=0;i<40;i++){ hitStop=0; __step(1); } const r=[refl,s.hp<hp0,player.hp===hpP]; shieldLvl=1; return r; }),[true,true,true]);
  });
  await check('Segunda pasada: Petra despierta, escalera secreta, cartas y Susurro, pozo, libros y recuerdos, ajustes',async()=>{
    const r=await ev(()=>{ const log=[];
      newGame(); state='play'; introDone=true; hitStop=0; wakeT=1; __step(1); log.push(['petra',state,dlg&&dlg.who,npcs.some(n=>n.ch==='h')]); __skipDialog(); __step(1); __skipDialog(); log.push(['petra se va',petraWoke,npcs.length]);
      hasBlade=true; elderMet=true; __go(1,0,110,80); enemies=[]; player.x=8*16; player.y=5*16-4; player.dir=0; keys.fire=true; __step(16); log.push(['escalera',grid[6][8],opened.has('HS1,0')]);
      player.x=8*16; player.y=6*16-4; __step(3); __skipDoor(); log.push(['bodega',sx,sy]); const l=pickups.find(p=>p.kind==='letter'); enemies=[]; player.x=l.x; player.y=l.y-4; __step(3); __skipDialog(); log.push(['carta',lettersCount()]);
      player.x=5*16; player.y=6*16-4; __step(3); __skipDoor(); log.push(['vuelta',sx,sy]);
      for(const k of ['✉4,-1,2,3','✉0,3,3,4','✉4,3,7,6','✉1,-2,7,1']) collected.add(k); __go(1,1,64,72); player.dir=1; keys.fire=true; __step(1); __skipDialog(); __step(2); if(state==='itemget'){ itemT=0; __step(2); __skipDialog(); } log.push(['susurro',amulets.has('susurro'),lettersGiven]);
      berries=25; pieces=0; __go(0,1,110,80); player.x=7*16; player.y=5*16-4; player.dir=0; keys.fire=true; __step(1); __skipDialog(); __step(2); __skipDialog(); __step(30); log.push(['pozo',wellDone,berries,pieces]);
      __go(9,9,76,40); player.x=5*16; player.y=2*16-4; player.dir=1; keys.fire=true; __step(1); const bookDlg=state; __skipDialog(); log.push(['libro',bookDlg,collected.has('b:9,9'),loreList().length]);
      keys.menu=true; __step(1); keys.alt=true; __step(1); keys.alt=true; __step(1); keys.alt=true; __step(1); const tab=pausePage; keys.fire=true; __step(1); const reading=state; __skipDialog(); log.push(['recuerdos',tab,reading,state]);
      keys.alt=true; __step(1); keys.fire=true; __step(1); log.push(['ajustes',pausePage,opts.textSpeed]); opts.textSpeed=1; saveOpts(); keys.menu=true; __step(1); log.push(['cerrar',state]);
      return log; });
    eq(r,[['petra','dialog','PETRA',true],['petra se va',true,0],['escalera','>',true],['bodega',4,9],['carta',1],['vuelta',1,0],['susurro',true,true],['pozo',true,5,1],['libro','dialog',true,6],['recuerdos',3,'dialog','pause'],['ajustes',4,2],['cerrar','play']]);
  });
  await check('Secretos del valle: grieta del risco (bomba), corro de las hadas y Manantial que cura, isla (gancho), madriguera (farol), refugio y cebo (vaina)',async()=>{
    const r=await ev(()=>{ const log=[]; const settle=()=>{ __skipDoor(); for(let i=0;i<10&&state!=='play';i++){ if(state==='itemget') itemT=0; __step(2); __skipDialog(); } };
      newGame(); state='play'; introDone=true; elderMet=true; hasBlade=true; hitStop=0; wakeT=0; inBed=false; showToast=()=>{};
      // la grieta de los Riscos: solo una bomba la abre; dentro, la Cueva del Eco Dormido
      hasBomb=true; xItem='bomb'; bombAmmo=10; amulets.add('topo'); equipped=['topo',null]; __go(0,0,128,40); enemies=[]; player.x=8*16; player.y=2*16-4; player.dir=1;
      const g0=grid[1][8]; keys.alt=true; __step(1); __step(90); enemies=[]; hitStop=0; log.push(['grieta',g0,grid[1][8],secretsFound()]);
      player.x=8*16; player.y=2*16-4; player.dir=1; keys.up=true; __step(2); keys.up=false; settle(); log.push(['eco',sx,sy,regionOf(sx,sy),pickups.some(p=>p.kind==='piece')]);
      player.x=5*16; player.y=6*16-4; __step(3); __skipDoor(); log.push(['fuera',sx,sy,(player.x+8)>>4,(player.y+13)>>4]);
      // el corro de las hadas: la Hoja descubre la escalera del Manantial
      __go(2,0,112,90); enemies=[]; player.x=7*16; player.y=5*16-4; player.dir=1; keys.fire=true; __step(16); log.push(['corro',grid[4][7],opened.has('HS2,0')]);
      player.x=7*16; player.y=4*16-4; __step(3); settle(); log.push(['manantial',sx,sy]);
      player.hp=2; player.x=3*16; player.y=5*16-4; __step(80); log.push(['cura',player.hp===player.maxHp]);
      hasHook=true; xItem='hook'; const mhp=player.maxHp; player.x=5*16; player.y=5*16-4; player.dir=1; keys.alt=true; __step(1); __step(60); settle(); log.push(['isla',(player.x+8)>>4,(player.y+12)>>4,player.maxHp-mhp]);
      player.x=5*16; player.y=3*16-4; player.dir=0; keys.alt=true; __step(1); __step(60); player.x=5*16; player.y=6*16-4; __step(3); __skipDoor(); log.push(['vuelta',sx,sy]);
      // la boca helada de la Ladera: tres braseros abren la verja del cofre
      hasLantern=true; xItem='lantern'; __go(0,-1,128,20); enemies=[]; player.x=8*16; player.y=1*16-4; player.dir=1; keys.up=true; __step(2); keys.up=false; settle(); enemies=[]; const gate0=grid[3][5];
      for(const [x,y,d] of [[2,1,2],[7,4,3],[2,6,2]]){ player.x=x*16; player.y=y*16-4; player.dir=d; keys.alt=true; __step(1); }
      const b0=berries; player.x=5*16; player.y=3*16-4; player.dir=1; keys.fire=true; __step(1); settle(); log.push(['madriguera',sx,sy,gate0,grid[3][5],berries-b0]);
      // bajo el arbusto de la Marisma: el Refugio de la Ciénaga
      __go(2,3,112,40); enemies=[]; player.x=7*16; player.y=2*16-4; player.dir=1; keys.fire=true; __step(16); player.x=7*16; player.y=1*16-4; __step(3); settle(); log.push(['refugio',sx,sy,(player.x+8)>>4,(player.y+13)>>4]);
      // el cebo dorado: en mitad de la cascada, solo la vaina llega
      hasBoomer=true; xItem='boomer'; __go(4,0,80,90); enemies=[]; const lure=pickups.some(p=>p.kind==='lure'); player.x=5*16; player.y=6*16-4; player.dir=1; keys.alt=true; __step(1); __step(80); settle();
      log.push(['cebo',lure,hasLure,grid[2][5]]);
      return [log,secretsFound()]; });
    eq(r,[[['grieta','⊂','G',1],['eco',0,10,'secreto',true],['fuera',0,0,8,2],['corro','>',true],['manantial',1,10],['cura',true],['isla',5,3,2],['vuelta',2,0],['madriguera',2,10,'=','q',100],['refugio',3,10,5,5],['cebo',true,true,'W']],5]);
  });
  await check('Trueques: de la canica de Petra al Trébol de Lupa (el mapa lleva al tesoro de las dunas)',async()=>{
    const r=await ev(()=>{ const log=[]; const settle=()=>{ for(let i=0;i<10&&state!=='play';i++){ if(state==='itemget') itemT=0; __step(2); __skipDialog(); } };
      const talk=(nx,ny,tx,ty,above)=>{ const py=above?(ty-1)*16-4:(ty+1)*16-4; __go(nx,ny,tx*16,py); enemies=[]; player.x=tx*16; player.y=py; player.dir=above?0:1; keys.fire=true; __step(1); settle(); return tradeStep; };
      newGame(); state='play'; introDone=true; elderMet=true; hasBlade=true; hitStop=0; wakeT=0; inBed=false; bossDone=true; boss2Done=true; hasEmber=true; hasTear=true; showToast=()=>{};
      log.push(talk(0,1,2,5));                      // Petra: la canica
      log.push(questList().some(q=>q.id==='tq1'));
      log.push(talk(7,9,5,3));                      // Corteza (mostrador): la pluma
      log.push(talk(3,1,2,6,true));                 // Moss (desde arriba): la perla
      log.push(talk(10,2,5,2));                     // la Reina en tregua: la jalea
      log.push(talk(8,9,4,3));                      // Tilo (mostrador): el calcetín
      log.push(talk(6,2,5,2));                      // el Topo en tregua: el mapa
      __go(2,2,112,70); enemies=[]; log.push(grid[3][7]);
      hasBomb=true; xItem='bomb'; bombAmmo=10; amulets.add('topo'); equipped=['topo',null]; player.x=7*16; player.y=4*16-4; keys.alt=true; __step(1); __step(90); enemies=[]; hitStop=0; log.push(grid[3][7]);
      player.x=7*16; player.y=4*16-4; player.dir=1; keys.fire=true; __step(1); settle(); log.push(tradeStep);
      log.push(talk(1,1,7,6,true));                 // Lupa (desde arriba): el trébol
      log.push(amulets.has('trebol'),questList().some(q=>q.id==='tq8'&&q.done));
      curSlot=2; save(); const d=readSlot(2); sideLoad(null); loadGame(d); log.push(tradeStep,opened.has('TES'));
      __go(1,1,64,72); log.push(grid[5][8]);
      return log; });
    eq(r,[1,true,2,3,4,5,6,'✕','¤',7,8,true,true,8,true,'f']);
  });
  await check('Pesca con Moss: lanzar, esperar, clavar, recoger (el sedal se rompe si tiras sin parar) y el Viejo Bigotes',async()=>{
    const r=await ev(()=>{ const log=[]; const R=Math.random;
      newGame(); state='play'; introDone=true; elderMet=true; hasBlade=true; hitStop=0; wakeT=0; inBed=false; berries=0; showToast=()=>{};
      __go(3,1,40,60); enemies=[]; player.x=2*16; player.y=5*16-4; player.dir=0; keys.fire=true; __step(1); const q=[state,dlg&&dlg.who,!!(dlg&&dlg.ask)];
      __skipDialog(); log.push([q,state,!!fishS&&fishS.phase]);
      keys.right=true; __step(10); keys.right=false; keys.fire=true; __step(1); const c=fishS.phase; __step(30); log.push(['lance',c,fishS.phase,Math.round(fishS.lure.x)>80]);
      const L=fishS.lure; const hookIt=(t)=>{ fishS.phase='wait'; fishS.fish=[{t,x:L.x,y:L.y,vx:0,vy:0,st:'bite',tm:20,nib:0}]; keys.fire=true; __step(1); return fishS.phase; };
      fishS.fish=[{t:0,x:L.x,y:L.y,vx:0,vy:0,st:'nibble',tm:30,nib:1}]; keys.fire=true; __step(1); log.push(['pronto',fishS.phase,fishS.msg]);
      log.push(['clava',hookIt(0)]); Math.random=()=>.99;
      keys.fireHeld=true; let n=0; while(fishS.phase==='reel'&&n++<900) __step(1); keys.fireHeld=false; log.push(['carpín',fishS.phase,fishS.card&&fishS.card.t]);
      __step(25); keys.fire=true; __step(1); log.push(['cuaderno',fishDex,fishCount,berries>0,fishS.phase]);
      hookIt(2); keys.fireHeld=true; n=0; while(fishS.phase==='reel'&&n++<900) __step(1); keys.fireHeld=false; log.push(['trucha a lo loco',fishS.phase,fishS.msg]);
      hasLure=true; fishDex=7; hookIt(3); n=0; while(fishS.phase==='reel'&&n++<3000){ keys.fireHeld=fishS.tension<70; __step(1); } keys.fireHeld=false; Math.random=R;
      log.push(['bigotes',fishS.phase,fishS.card&&fishS.card.t]); __step(25); const p0=pieces; keys.fire=true; __step(1); const d=state; __skipDialog(); log.push([d,state,fishPiece,pieces-p0,secretsFound()]);
      keys.alt=true; __step(1); __skipDialog(); log.push(['fin',state,fishS]);
      curSlot=2; save(); const sv=readSlot(2); sideLoad(null); loadGame(sv); log.push(['guardado',fishDex,fishPiece,fishCount,!!fishBest.bigotes]);
      return log; });
    eq(r,[[['dialog','MOSS',true],'fish','aim'],['lance','cast','wait',true],['pronto','aim','¡Muy pronto!'],['clava','reel'],['carpín','caught',0],['cuaderno',1,1,true,'aim'],['trucha a lo loco','aim','¡Se rompió el sedal!'],['bigotes','caught',3],['dialog','fish',true,1,2],['fin','play',null],['guardado',15,true,2,true]]);
  });
  await check('Marchitarse: se seca, baja a las raíces y el Roble habla; SÍ rebrota con el vigor lleno, NO guarda y va al título; Z lo acelera',async()=>{
    const r=await ev(()=>{ const log=[]; showToast=()=>{};
      newGame(); state='play'; introDone=true; elderMet=true; hasBlade=true; hitStop=0; wakeT=0; inBed=false; wilts=0;
      const run=(mash,pick)=>{ let n=0, m=0;
        while(state==='dying'&&n<600){ if(mash) keys.fire=true; __step(1); n++; }
        const lines=mDream?mDream.pages.slice():[];
        while(mDream&&mDream.phase!=='ask'&&m<900){ if(mash||(mDream.phase==='talk'&&mDream.chars>=mDream.pages[mDream.pg].length)) keys.fire=true; __step(1); m++; }
        __step(8); if(pick==='no'){ keys.right=true; __step(1); keys.right=false; } keys.fire=true; __step(1);
        return {toOver:n,lines}; };
      // 1) la primera vez, sin prisa, en el valle: cuatro frases, SÍ, y rebrote en la entrada de la pantalla
      __go(0,1,60,70); lastEntry={sx:0,sy:1,x:60,y:70}; player.hp=0; die(); const a=run(false,'yes');
      let n=0; while(state!=='play'&&n<300){ __step(1); n++; } const rb=[state,sproutT>0,!!rebrote,player.hp<player.maxHp];
      n=0; while(sproutT>0&&n<300){ __step(1); n++; }
      log.push(['valle',a.toOver>=180,a.lines.length,a.lines[0],rb,sx+','+sy,player.x+','+player.y,player.hp===player.maxHp,player.inv>60,state,curTrack!=='silencio',wilts]);
      // 2) en la Cueva del Topo, con Z: más corto, frase de la mazmorra, rebrote en su entrada y el rebrote se salta
      __go(7,0,72,70); const rp={...respawnPoint}; player.hp=0; die(); const b=run(true,'yes');
      n=0; while((state!=='play'||sproutT>0)&&n<400){ keys.fire=true; __step(1); n++; }
      log.push(['cueva',b.toOver<80,b.lines.length,b.lines[0].includes('Cueva'),sx+','+sy===rp.sx+','+rp.sy,player.x===rp.x&&player.y===rp.y,player.hp===player.maxHp,state,n<110]);
      // 3) NO: el Roble se despide, se guarda y al título
      __go(0,1,60,70); player.hp=0; die(); run(true,'no'); const said=mDream&&mDream.phase;
      n=0; while(state==='over'&&n<400){ keys.fire=true; __step(1); n++; }
      log.push(['no',said,state,wilts]); keys.fire=false; state='play';
      return log; });
    eq(r,[['valle',true,4,'...¿Sprout? ¿Me oyes?',['play',true,true,true],'0,1','60,70',true,true,'play',true,1],['cueva',true,2,true,true,true,true,'play',true],['no','no','title',3]]);
  });
  await check('El momento del arma: su cinemática (Sprout blandiéndola y el título), Z la acelera, luego el gesto de cogerla y el cartel de uso; las reliquias, como siempre',async()=>{
    eq(await ev(()=>{ __go(2,1,70,70); enemies=[]; npcs=[]; hasHook=false; const log=[];
      getItem('hook'); log.push(state,moment&&moment.phase,!!cineArm);
      for(let i=0;i<14;i++){ __step(1); draw(); }
      keys.fire=true; __step(1); draw(); log.push(cineArm.t>=CA_TITLE);
      keys.fire=true; __step(1); const typed=cineArm.chars>=MOMENT_ARMS.hook.line.length; keys.fire=true; __step(1); log.push(typed,moment&&moment.phase);
      for(let i=0;i<M_GRAB+2;i++){ __step(1); draw(); } const txt=dlg?dlg.pages.join(' '):'';
      log.push(state,moment===null,!txt.includes('¡La RAÍZ'),txt.includes('ENTER'));
      __skipDialog(); log.push(state,hasHook);
      getItem('ember'); log.push(state,moment===null); itemT=0; __step(2); __skipDialog();
      return log; }),['itemget','cine',true, true, true,'grab', 'dialog',true,true,true, 'play',true, 'itemget',true]);
  });
  await check('Las ocho cinemáticas de arma se ruedan enteras sin errores (lo que dura cada una: la acción, sus golpes congelados y el título)',async()=>{
    eq(await ev(()=>{ const out=[]; for(const k of Object.keys(MOMENT_ARMS)){ startCineArm(k); let n=0, done=false; while(cineArm&&n<420){ done=updCineArm(); draw(); drawCineArm(); n++; if(done) break; } out.push(done&&n>=CA_T&&n<=CA_T+30); cineArm=null; } return out; }),[true,true,true,true,true,true,true,true]);
  });
  await check('Puertas, cuevas y escaleras: cruzar dura ~1 s con el control bloqueado (ni se mueve ni ataca), cambia de pantalla a oscuras y acaba justo donde debe; __go sigue siendo al momento',async()=>{
    eq(await ev(()=>{ newGame(); state='play'; inBed=false; wakeT=0; introDone=true; elderMet=true; hasBlade=true; hitStop=0; enemies=[]; showToast=()=>{}; const log=[];
      const cross=()=>{ const s0=sx+','+sy; let n=0, swap=0, atk=0; while(state==='door'&&n<200){ keys.left=keys.fire=true; __step(1); draw(); n++; if(!swap&&sx+','+sy!==s0) swap=n; atk=Math.max(atk,player.atk|0); } keys.left=keys.fire=false; return [n>=45&&n<=66,swap>15&&n-swap>15,atk]; };
      const at=()=>[sx,sy,Math.round(player.x),Math.round(player.y),player.dir];
      // la casa: por la puerta del barrio, y de vuelta por la alfombrilla (la puerta de la calle queda cerrada)
      __go(0,1,48,44); player.dir=1; keys.up=true; __step(1); keys.up=false; log.push(['casa',state,...cross(),...at()]);
      player.y=100; player.dir=0; keys.down=true; __step(1); keys.down=false; log.push(['barrio',state,...cross(),...at(),grid[2][3]]);
      // la boca de la Cueva del Topo
      __go(2,-1,80,40); enemies=[]; player.x=5*16; player.y=2*16-4; player.dir=1; keys.up=true; __step(1); keys.up=false; log.push(['cueva',state,...cross(),...at()]); __skipDialog();
      // la escalera del Bosque de los Ecos, peldaño a peldaño
      opened.add('HS1,0'); __go(1,0,128,80); enemies=[]; player.dir=0; keys.down=true; for(let i=0;i<20&&state==='play';i++) __step(1); keys.down=false; log.push(['bodega',state,...cross(),...at()]);
      // __go no espera a nadie
      __go(0,1,60,70); log.push(['go',state,sx,sy,door===null]);
      return log; }),[['casa','door',true,true,0,9,9,76,90,1],['barrio','door',true,true,0,0,1,44,42,0,'D'],['cueva','door',true,true,0,6,0,72,72,1],['bodega','door',true,true,0,4,9,80,70,1],['go','play',0,1,true]]);
  });
  await check('La consola: la pantalla copia el juego a píxeles exactos, los botones se hunden con el teclado, el LED avisa y el color de carcasa se guarda',async()=>{
    eq(await ev(()=>{ __go(1,1,64,76); draw(); present();
      const s=document.getElementById('screen'), N=s.width/160, g=s.getContext('2d'), c=cv.getContext('2d');
      const px=(G,x,y)=>[...G.getImageData(x,y,1,1).data].slice(0,3).join();
      const same=[[10,10],[80,72],[151,133],[33,121]].every(([x,y])=>px(c,x,y)===px(g,Math.floor(x*N+N/2),Math.floor(y*N+N/2)));
      keys.fireHeld=true; keys.left=true; present(); const down=[document.getElementById('tA').classList.contains('down'),document.getElementById('tL').classList.contains('down'),document.getElementById('dpad').dataset.t];
      keys.fireHeld=false; keys.left=false; present(); const up=!document.getElementById('tA').classList.contains('down');
      const hp=player.hp; saveFlash=0; player.hp=2; present(); const low=document.getElementById('led').dataset.s; player.hp=hp; present();
      const t0=opts.shell|0; optAction('consola',1); const t1=document.getElementById('console').dataset.color, saved=JSON.parse(localStorage.getItem('sprout.opts')).shell;
      opts.shell=t0; applyShellTheme(); saveOpts();
      return [Number.isInteger(N),same,down,up,low,t1,saved,OPT_ROWS.includes('consola')]; }),
      [true,true,[true,true,'l'],true,'low','salvia',1,true]);
  });
  await check('La Hoja es una hoja: tres filos, doblada y de tres caras; el tajo corta y golpea en los mismos fotogramas; su «fsss» y su «chas» sin picos',async()=>{
    const r=await ev(async()=>{
      const art=[1,2,3].every(t=>LEAF_BENT[t].length===3&&LEAF_BENT[t].every(F=>F.length===9&&F.every(c=>c.width===21&&c.height===19)))&&[1,2,3].every(t=>LEAF_TIER[t].width===21&&BLADE_HUD[t].height<=9&&BLADE_SHOP[t].width<=12);
      // la mata de hierba delante cae en el 4.º fotograma del tajo; el bicho recibe en el 3.º (como siempre)
      hasBlade=true; bladeLvl=1; __go(2,1,70,76); npcs=[]; enemies=[]; parts=[]; grid[5][5]='t'; player.x=70; player.y=76; player.dir=3; player.atk=0; hitStop=0;
      player.atk=14; let cut=0; for(let i=1;i<=8&&!cut;i++){ hitStop=0; __step(1); if(grid[5][5]!=='t') cut=i; }
      __go(2,1,70,76); npcs=[]; parts=[]; enemies=[]; const e=spawnEnemy('blob',5,5,0); enemies.push(e); e.x=86; e.y=76; e.hp=9; e.flash=0; player.x=70; player.y=76; player.dir=3; player.atk=14;
      let hit=0; for(let i=1;i<=10&&!hit;i++){ hitStop=0; e.x=86; e.y=76; __step(1); if(e.hp<9) hit=i; }
      const leafy=parts.some(p=>p.k==='blade'||p.k==='shard');
      // los sonidos, renderizados sin tiempo real
      const SR=48000, keep={AC,AudioContext:window.AudioContext,curTrack,master,musicBus,sfxBus,delaySend,delayWet,musicOn,mIntTarget,musicLP,VOICE:{...VOICE},WAVES:{...WAVES}}, off=new OfflineAudioContext(1,SR,SR); off.resume=()=>Promise.resolve(); let now=0; Object.defineProperty(off,'currentTime',{get:()=>now});
      let pk=[];
      try{ window.AudioContext=function(){ return off; }; clearInterval(musicTimer); musicTimer=null; AC=null; musicOn=false; audio(); master.disconnect(); sfxBus.connect(off.destination);
        now=.02; SFX.sword(); now=.35; SFX.leafHit(); now=.65; SFX.cut(); const d=(await off.startRendering()).getChannelData(0);
        for(const [a,b] of [[0,.33],[.33,.63],[.63,1]]){ let m=0; for(let i=Math.floor(a*SR);i<Math.floor(b*SR);i++) m=Math.max(m,Math.abs(d[i])); pk.push(m); }
      } finally { clearInterval(musicTimer); musicTimer=null; OUT=null; ({AC,curTrack,master,musicBus,sfxBus,delaySend,delayWet,musicOn,mIntTarget,musicLP}=keep); window.AudioContext=keep.AudioContext;
        Object.assign(VOICE,keep.VOICE); for(const k in WAVES) delete WAVES[k]; Object.assign(WAVES,keep.WAVES); if(AC) startMusic(); }
      return [art,cut,hit,leafy,pk.every(v=>v>.005&&v<.2)]; });
    eq(r,[true,4,3,true,true]);
  });
  await check('Móvil: consola a pantalla completa; la cruceta se desliza entre direcciones y los botones no se sueltan al desviar el dedo',async()=>{
    const {devices}=require('playwright'), ctx=await browser.newContext({...devices['iPhone 13']}), m=await ctx.newPage(); m.on('pageerror',e=>errors.push('móvil: '+e.message));
    await m.goto(`http://127.0.0.1:${server.address().port}/index.html`); await m.waitForFunction(()=>typeof __sprout==='object');
    await m.evaluate(()=>{ window.__manual=true; newGame(); state='play'; inBed=false; wakeT=0; elderMet=true; hasBlade=true; toast=null; toastQ=[]; __sprout.warp(2,1,70,60); npcs=[]; enemies=[]; });
    const r=await m.evaluate(()=>{ const d=document.getElementById('dpad').getBoundingClientRect(), a=document.getElementById('tA').getBoundingClientRect(); return {x:d.left+d.width/2,y:d.top+d.height/2,w:d.width,ax:a.left+a.width/2,ay:a.top+a.height/2}; });
    const K=()=>m.evaluate(()=>['up','down','left','right'].filter(k=>keys[k]).join('+')||'-'), log=[await m.evaluate(()=>[document.body.classList.contains('touch'),document.getElementById('console').classList.contains('tall')])];
    await m.mouse.move(r.x,r.y-r.w*.36); await m.mouse.down(); log.push(await K(), await m.evaluate(()=>{ const y=player.y; for(let i=0;i<8;i++) update(); return player.y<y; }));
    await m.mouse.move(r.x+r.w*.36,r.y,{steps:3}); log.push(await K()); await m.mouse.move(r.x+r.w*.3,r.y-r.w*.3,{steps:3}); log.push(await K());
    await m.mouse.move(r.x+r.w,r.y,{steps:3}); log.push(await K()); await m.mouse.up(); log.push(await K());
    await m.mouse.move(r.ax,r.ay); await m.mouse.down(); await m.mouse.move(r.ax+25,r.ay+18); log.push(await m.evaluate(()=>[keys.fire,keys.fireHeld])); await m.mouse.up(); log.push(await m.evaluate(()=>keys.fireHeld));
    await ctx.close();
    eq(log,[[true,true],'up',true,'right','up+right','right','-',[true,true],false]);
  });
  await check('La aplicación: versión al día, manifiesto instalable, arranca sin red y se actualiza (con aviso en plena partida, sola en el título)',async()=>{
    const {execSync}=require('node:child_process'); let upToDate=true; try{ execSync('node scripts/version.cjs --check',{cwd:root,stdio:'pipe'}); }catch(e){ upToDate=false; }
    const ctx=await browser.newContext({viewport:{width:1000,height:800}}), p=await ctx.newPage(); p.on('pageerror',e=>errors.push('pwa: '+e.message));
    await p.goto('http://127.0.0.1:'+server.address().port+'/'); await p.waitForFunction(()=>typeof __sprout==='object');
    const man=await p.evaluate(async()=>{ const m=await (await fetch('manifest.webmanifest')).json();
      const sizes=await Promise.all(m.icons.map(ic=>new Promise(r=>{ const im=new Image(); im.onload=()=>r(im.naturalWidth+'x'+im.naturalHeight+':'+ic.purpose); im.onerror=()=>r('error'); im.src=ic.src; })));
      return [m.short_name,m.display,m.start_url,sizes.join(' ')]; });
    await p.waitForFunction(()=>navigator.serviceWorker.controller!==null,null,{timeout:20000});
    const cached=await p.evaluate(async()=>(await (await caches.open('sprout-'+GAME_VERSION)).keys()).length);
    await ctx.setOffline(true); await p.reload(); await p.waitForFunction(()=>typeof __sprout==='object',null,{timeout:20000}); const offline=await p.evaluate(()=>state); await ctx.setOffline(false);
    // una versión nueva en plena partida: aviso y sin recargar; al tocarlo se guarda, se aplica y lo cuenta
    await p.evaluate(()=>{ window.__manual=true; newGame(); introDone=true; inBed=false; state='play'; });
    swBump=1; await p.evaluate(()=>{ PWA.reg.update(); }); await p.waitForFunction(()=>PWA.updateReady,null,{timeout:20000}); await p.waitForTimeout(600);
    const mid=await p.evaluate(()=>[state,PWA.notice,document.getElementById('notice').hidden]);
    await Promise.all([p.waitForNavigation({timeout:20000}),p.click('#notice')]); await p.waitForFunction(()=>typeof __sprout==='object'); await p.waitForTimeout(1000);
    const after=await p.evaluate(()=>PWA.notice);
    // otra estando en el título: se aplica sola
    await p.evaluate(()=>{ state='title'; }); swBump=2;
    await Promise.all([p.waitForNavigation({timeout:20000}),p.evaluate(()=>{ PWA.reg.update(); })]); await p.waitForFunction(()=>typeof __sprout==='object');
    swBump=0; await ctx.close();
    eq([upToDate,man,cached>=40,offline,mid,after],[true,['SPROUT','standalone','./','192x192:any 512x512:any 192x192:maskable 512x512:maskable'],true,'boot',['play','update',false],'updated']);
  });
  await browser.close(); server.close();
  if(errors.length){ console.log('Errores de página:\n'+errors.join('\n')); }
  console.log(`\n${passed} pruebas pasan, ${failed} fallan`);
  process.exit(failed||errors.length?1:0);
})();
