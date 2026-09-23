// Export the exact normalized, alpha-ready frames used by the demo.
// npm run assets:slice (requires the same Chromium installation as npm test).
const fs=require('node:fs/promises'),http=require('node:http'),path=require('node:path');
const {chromium}=require(process.env.SPROUT_PLAYWRIGHT||'playwright');
const root=path.resolve(__dirname,'..'),out=path.join(root,'assets/slice/hero-v2');
const server=http.createServer(async(req,res)=>{
  const file=path.resolve(root,'.'+decodeURIComponent(req.url.split('?')[0]));
  if(!file.startsWith(root+path.sep)){res.writeHead(403);return res.end();}
  try{res.setHeader('Content-Type',({'.html':'text/html','.js':'text/javascript','.png':'image/png','.css':'text/css'})[path.extname(file)]||'application/octet-stream');res.end(await fs.readFile(file));}catch{res.writeHead(404);res.end();}
});
(async()=>{
  let browser;
  try{
    await new Promise(r=>server.listen(0,'127.0.0.1',r));
    browser=await chromium.launch({headless:true,executablePath:process.env.SPROUT_CHROME||undefined});const page=await browser.newPage();
    await page.goto(`http://127.0.0.1:${server.address().port}/slice.html`);
    const result=await page.evaluate(async()=>{
      const {loadAssets,makeCanvas}=await import('/js/slice/assets.js');
      const {HERO_STATES,HERO_CELL,HERO_ANCHOR}=await import('/js/slice/character-art.js');
      const a=await loadAssets(),sheets=[],atlas=makeCanvas(HERO_CELL*8,HERO_CELL*4*Object.keys(HERO_STATES).length),ag=atlas.getContext('2d');
      const manifest={version:2,file:'atlas.png',cell:[HERO_CELL,HERO_CELL],anchor:[HERO_ANCHOR.x,HERO_ANCHOR.y],filter:'nearest',collision:{x:-7,y:-8,w:14,h:8},directions:['down','left','right','up'],palette:a.character.palette,source:{file:'parts-master.png',size:a.character.source,regions:a.character.regions},animations:{}};
      Object.entries(HERO_STATES).forEach(([name,state],stateIndex)=>{
        const sheet=makeCanvas(HERO_CELL*state.frames,HERO_CELL*4),g=sheet.getContext('2d');
        manifest.animations[name]={file:name+'.png',frames:state.frames,seconds:state.seconds,loop:name==='walk'||name==='idle',directions:{}};
        for(let dir=0;dir<4;dir++){
          manifest.animations[name].directions[manifest.directions[dir]]=a.character.animations[name][dir].map((frame,i)=>{g.drawImage(frame,i*HERO_CELL,dir*HERO_CELL);const x=i*HERO_CELL,y=(stateIndex*4+dir)*HERO_CELL;ag.drawImage(frame,x,y);return {x,y,w:HERO_CELL,h:HERO_CELL,durationMs:state.seconds*1000/state.frames};});
        }
        sheets.push({name,png:sheet.toDataURL('image/png').split(',')[1]});
      });
      sheets.push({name:'atlas',png:atlas.toDataURL('image/png').split(',')[1]});return {sheets,manifest};
    });
    await fs.mkdir(out,{recursive:true});for(const sheet of result.sheets)await fs.writeFile(path.join(out,sheet.name+'.png'),Buffer.from(sheet.png,'base64'));
    await fs.writeFile(path.join(out,'atlas.json'),JSON.stringify(result.manifest,null,2)+'\n');
    console.log('Exportados 196 fotogramas: 10 hojas de animación, atlas completo y manifiesto en assets/slice/hero-v2/.');
  }finally{await browser?.close();await new Promise(r=>server.close(r));}
})().catch(e=>{console.error(e);process.exitCode=1;server.close();});
