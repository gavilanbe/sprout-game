/* Playwright coverage for the generated-art vertical slice. */
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),http=require('node:http');
const {chromium}=require(process.env.SPROUT_PLAYWRIGHT||'playwright');
const root=path.resolve(__dirname,'..');
const server=http.createServer((req,res)=>{
  const file=path.resolve(root,'.'+decodeURIComponent(req.url.split('?')[0]));
  if(!file.startsWith(root+path.sep)){res.writeHead(403);return res.end();}
  fs.readFile(file,(err,data)=>{if(err){res.writeHead(404);return res.end();}res.setHeader('Content-Type',({'.html':'text/html','.js':'text/javascript','.css':'text/css','.png':'image/png'})[path.extname(file)]||'application/octet-stream');res.end(data);});
});
(async()=>{
  let browser;let failed=0,passed=0;
  try{
    await new Promise(r=>server.listen(0,'127.0.0.1',r));browser=await chromium.launch({headless:true,executablePath:process.env.SPROUT_CHROME||undefined});
    const page=await browser.newPage({viewport:{width:1440,height:1000}}),errors=[];
    page.on('pageerror',e=>errors.push(e.message));
    const url=`http://127.0.0.1:${server.address().port}/slice.html?test`;
    await page.goto(url);await page.waitForFunction(()=>window.__slice);await page.evaluate(()=>window.__sliceManual=true);
    const ev=fn=>page.evaluate(fn);
    async function check(name,fn){try{await fn();passed++;console.log('✓ '+name);}catch(e){failed++;console.log('✗ '+name+'\n  '+e.message);}}
    await check('Los másteres cargan; caminar (4 × 8) y atacar (4 × 6) usan la celda común de 80 px con alfa utilizable',async()=>{
      const stats=await ev(async()=>{const {loadAssets}=await import('/js/slice/assets.js');const a=await loadAssets();return {sizes:a.masters,walk:a.walk.length,attack:a.attack.length,cells:[...a.walk,...a.attack].every(c=>c.width===80&&c.height===80),transparent:[a.walk[0],a.attack[0]].map(c=>c.getContext('2d').getImageData(0,0,1,1).data[3]),smoothing:__slice.info().smoothing};});
      assert.equal(stats.walk,32);assert.equal(stats.attack,24);assert.equal(stats.cells,true);assert.deepEqual(stats.transparent,[0,0]);assert.equal(stats.smoothing,false);assert.deepEqual(stats.sizes.hero,[1254,1254]);assert.deepEqual(stats.sizes.world,[1254,1254]);
    });
    await check('Inicio por teclado, diálogo y cuatro direcciones',async()=>{
      await page.keyboard.press('Enter');await ev(()=>__slice.step(15));await page.keyboard.press('z');
      assert.equal((await ev(()=>__slice.info())).dialog,undefined);
      const dirs=await ev(()=>{const r=v=>Math.round(v*10)/10+0;return ['ArrowDown','ArrowLeft','ArrowRight','ArrowUp'].map((key,i)=>{__slice.place(0,190,140);__slice.key(key);__slice.step(10);__slice.release(key);const s=__slice.info();return [s.player.dir,r(s.player.x-190),r(s.player.y-140)];});});
      // 10 pasos a 60 Hz acelerando hasta 92 px/s: 0,6 + 1,2 + 8 × 1,53 ≈ 14,1 px, siempre sobre un solo eje
      assert.deepEqual(dirs,[[0,0,14.1],[1,-14.1,0],[2,14.1,0],[3,0,-14.1]]);
    });
    await check('El agua bloquea el paso y el puente permite cruzar',async()=>{
      const positions=await ev(()=>{__slice.place(1,116,142,2);__slice.key('ArrowRight');__slice.step(45);__slice.release('ArrowRight');const water=__slice.info().player.x;__slice.place(1,116,184,2);__slice.key('ArrowRight');__slice.step(65);__slice.release('ArrowRight');return [water,__slice.info().player.x];});
      // los pies miden 14 px (x-7 … x+6): el agua empieza en x=128, así que nunca se pasa de x<122
      assert(positions[0]<122&&positions[0]>116);assert(positions[1]>190);
    });
    await check('La hoja abre el arbusto y el paso persiste al cambiar de zona',async()=>{
      const s=await ev(()=>{__slice.place(1,210,184,2);__slice.key('KeyZ');__slice.release('KeyZ');__slice.step(25);const tile=__slice.info().grid[5][7];__slice.key('ArrowRight');__slice.step(110);__slice.release('ArrowRight');return {tile,room:__slice.info().room};});
      assert.deepEqual(s,{tile:'p',room:2});
    });
    await check('El cofre exige apartar a los limos; un golpe no cuenta dos veces',async()=>{
      const s=await ev(()=>{__slice.place(2,244,122,3);__slice.key('KeyZ');__slice.release('KeyZ');const locked=__slice.info();__slice.place(2,190,191,3);__slice.key('KeyZ');__slice.release('KeyZ');__slice.step(12);return {seed:locked.seed,locked:locked.dialog,hp:__slice.info().enemies[0].hp};});
      assert.equal(s.seed,false);assert.match(s.locked,/dos limos/);assert.equal(s.hp,1);
    });
    await check('Combate → abrir cofre → cerrar diálogo sin reabrirlo',async()=>{
      const s=await ev(()=>{
        for(let n=0;n<2;n++){for(let attempt=0;attempt<3;attempt++){const e=__slice.info().enemies[n];if(!e||e.hp<=0)break;__slice.place(2,e.x,e.y+28,3);__slice.key('KeyZ');__slice.release('KeyZ');__slice.step(24);}}
        const defeated=__slice.info().enemies.every(e=>e.hp<=0);__slice.place(2,244,122,3);__slice.key('KeyZ');__slice.release('KeyZ');__slice.step(12);const got=__slice.info().seed;__slice.key('KeyZ');__slice.step(2);__slice.release('KeyZ');return {defeated,got,dialog:__slice.info().dialog};
      });assert.deepEqual(s,{defeated:true,got:true,dialog:undefined});
    });
    await check('Se vuelve andando por el puente abierto, se planta y la misión termina',async()=>{
      const s=await ev(()=>{
        __slice.place(2,244,184,1);__slice.key('ArrowLeft');let i=0;while((__slice.info().room>0||__slice.info().player.x>145)&&i++<900)__slice.step();__slice.release('ArrowLeft');
        const arrived=__slice.info().room;__slice.key('ArrowUp');__slice.step(48);__slice.release('ArrowUp');__slice.key('KeyZ');__slice.release('KeyZ');__slice.step(15);__slice.key('KeyZ');__slice.release('KeyZ');
        // el final espera a que acabe la animación de plantar (0,65 s)
        const waiting=__slice.info().mode;__slice.step(40);return {arrived,planted:__slice.info().planted,waiting,mode:__slice.info().mode};
      });assert.deepEqual(s,{arrived:0,planted:true,waiting:'play',mode:'complete'});assert(await page.locator('#complete-screen').isVisible());
    });
    await check('Pausa y visor detienen al jugador; reanudar, audio y reiniciar funcionan',async()=>{
      await page.click('#continue');await page.keyboard.press('Enter');assert.equal((await ev(()=>__slice.info())).mode,'paused');
      await page.click('#resume');await page.click('#show-assets');const before=await ev(()=>__slice.info().player.x);await page.keyboard.press('ArrowRight');await ev(()=>__slice.step(60));assert.equal(await ev(()=>__slice.info().player.x),before);
      await page.click('[data-direction="3"]');assert.equal(await page.locator('[data-direction="3"]').getAttribute('aria-pressed'),'true');await page.keyboard.press('Escape');await page.waitForFunction(()=>__slice.info().mode==='play');
      await page.click('#sound');assert.equal(await page.locator('#sound').getAttribute('aria-pressed'),'true');await page.click('#sound');await page.click('#restart');assert.deepEqual(await ev(()=>[__slice.info().seed,__slice.info().planted,__slice.info().mode]),[false,false,'title']);
    });
    await check('Pausar al perder foco libera las teclas',async()=>{
      await page.click('#start');await ev(()=>{__slice.step(15);__slice.key('KeyZ');__slice.place(0,180,140);__slice.key('ArrowRight');window.dispatchEvent(new Event('blur'));});
      assert.equal(await ev(()=>__slice.info().mode),'paused');await page.click('#resume');const x=await ev(()=>__slice.info().player.x);await ev(()=>__slice.step(30));assert.equal(await ev(()=>__slice.info().player.x),x);
    });
    await check('Móvil: pantalla entera, controles táctiles y modal sin desbordamiento',async()=>{
      const context=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true,deviceScaleFactor:3});const mobile=await context.newPage();await mobile.goto(url);await mobile.waitForFunction(()=>window.__slice);
      assert.equal(await mobile.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);assert(await mobile.locator('.touch-controls').isVisible());
      await mobile.locator('#start').tap();await mobile.waitForTimeout(200);await mobile.locator('[data-key="KeyZ"]').tap();assert.equal(await mobile.evaluate(()=>__slice.info().dialog),undefined);
      await mobile.locator('#show-assets').tap();assert(await mobile.locator('#assets-dialog').isVisible());await mobile.locator('#close-assets').tap();
      if(process.env.SPROUT_SCREENSHOTS){await mobile.screenshot({path:path.join(root,'docs/slice/mobile-preview.png'),fullPage:true});}
      await mobile.setViewportSize({width:320,height:740});assert.equal(await mobile.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
      await context.close();
    });
    await check('Sin errores de JavaScript',async()=>assert.deepEqual(errors,[]));
    if(process.env.SPROUT_SCREENSHOTS){await ev(()=>{__slice.reset();__slice.place(0,144,184);__slice.step(150);});await page.screenshot({path:path.join(root,'docs/slice/play-preview.png'),fullPage:true});}
  }finally{await browser?.close();await new Promise(r=>server.close(r));}
  console.log(`\n${passed} pruebas pasan, ${failed} fallan`);process.exitCode=failed?1:0;
})().catch(e=>{console.error(e);process.exitCode=1;server.close();});
