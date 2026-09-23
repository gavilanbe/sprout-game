// node scripts/icons.cjs — dibuja los iconos de la PWA y las pantallas de arranque de iOS con los sprites del propio juego
const fs=require('fs'),path=require('path'),http=require('http');
const root=path.join(__dirname,'..');
const {chromium}=require('playwright');
const server=http.createServer((req,res)=>{const u=req.url.split('?')[0];const f=path.join(root,decodeURIComponent(u==='/'?'/index.html':u));
  fs.readFile(f,(e,d)=>{if(e){res.writeHead(404);return res.end();}res.setHeader('Content-Type',({'.html':'text/html','.js':'text/javascript','.png':'image/png','.webmanifest':'application/manifest+json'})[path.extname(f)]||'application/octet-stream');res.end(d);});});
// pantallas de arranque de iPhone (retrato): ancho×alto en píxeles físicos, ancho y alto en puntos, densidad
const SPLASH=[[750,1334,375,667,2],[828,1792,414,896,2],[1125,2436,375,812,3],[1170,2532,390,844,3],[1179,2556,393,852,3],[1284,2778,428,926,3],[1290,2796,430,932,3],[1206,2622,402,874,3],[1320,2868,440,956,3]];
(async()=>{
  await new Promise(r=>server.listen(0,'127.0.0.1',r));
  const b=await chromium.launch(), p=await (await b.newContext({serviceWorkers:'block'})).newPage();
  await p.goto('http://127.0.0.1:'+server.address().port+'/index.html'); await p.waitForFunction(()=>typeof P_SPRITES!=='undefined'&&typeof LOGO_GLYPHS!=='undefined');
  const out=await p.evaluate((SPLASH)=>{
    const hero=P_SPRITES[0][0], O={};
    const bbox=(img)=>{ const g=img.getContext('2d'), d=g.getImageData(0,0,img.width,img.height).data; let x0=99,y0=99,x1=-1,y1=-1;
      for(let y=0;y<img.height;y++) for(let x=0;x<img.width;x++) if(d[(y*img.width+x)*4+3]>0){ x0=Math.min(x0,x); y0=Math.min(y0,y); x1=Math.max(x1,x); y1=Math.max(y1,y); } return {x0,y0,w:x1-x0+1,h:y1-y0+1}; };
    const B=bbox(hero);
    const star=(g,x,y,s,col)=>{ g.fillStyle=col; g.fillRect(x-s,y,s*3,s); g.fillRect(x,y-s,s,s*3); };
    function icon(N,{scale,round,bleed,trans}){ const c=document.createElement('canvas'); c.width=c.height=N; const g=c.getContext('2d'); g.imageSmoothingEnabled=false;
      if(!trans){ if(round){ const r=N*.2; g.beginPath(); g.moveTo(r,0); g.arcTo(N,0,N,N,r); g.arcTo(N,N,0,N,r); g.arcTo(0,N,0,0,r); g.arcTo(0,0,N,0,r); g.closePath(); g.clip(); }
        const BANDS=['#3f8a4a','#37804a','#2f7340','#276638','#205a30','#1a4d29','#143f22','#0e2c18'], bh=Math.ceil(N/BANDS.length); // bandas planas, a lo píxel
        BANDS.forEach((col,i)=>{ g.fillStyle=col; g.fillRect(0,i*bh,N,bh); });
        [['#5aa85a',.4],['#78c060',.3],['#a8dc80',.2]].forEach(([col,r])=>{ g.fillStyle=col; g.beginPath(); g.arc(N*.5,N*.46,N*r,0,6.283); g.fill(); }); // el halo, en tres aros
        g.fillStyle='rgba(8,24,12,.35)'; const sw=B.w*scale*.8, sh=scale*2.2; g.beginPath(); g.ellipse(N/2,N/2+B.h*scale/2+sh*.2,sw/2,sh,0,0,6.283); g.fill(); // sombra
        const s=Math.max(1,Math.round(scale/2)); star(g,Math.round(N*(bleed?.3:.22)),Math.round(N*(bleed?.28:.2)),s,'#fff6c0'); star(g,Math.round(N*(bleed?.72:.8)),Math.round(N*(bleed?.34:.3)),s,'#e8ffb0'); star(g,Math.round(N*(bleed?.68:.76)),Math.round(N*(bleed?.7:.78)),Math.max(1,s-1),'#fff6c0'); }
      const w=B.w*scale, h=B.h*scale; g.drawImage(hero,B.x0,B.y0,B.w,B.h,Math.round(N/2-w/2),Math.round(N/2-h/2-(trans?0:scale*.4)),w,h);
      return c.toDataURL('image/png'); }
    O['icon-512.png']=icon(512,{scale:24,round:true}); O['icon-192.png']=icon(192,{scale:9,round:true});
    O['maskable-512.png']=icon(512,{scale:17,bleed:true}); O['maskable-192.png']=icon(192,{scale:6,bleed:true});
    O['apple-touch-icon.png']=icon(180,{scale:8,bleed:true});
    O['favicon-32.png']=icon(32,{scale:2,trans:true}); O['favicon-16.png']=icon(16,{scale:1,trans:true});
    // pantallas de arranque: el logo de SPROUT, Sprout y gavilanbe®, sobre el verde de la consola
    const last=LOGO_GLYPHS.length-1, LW=LOGO_POS[last]+LOGO_GLYPHS[last].w-LOGO_X+6;
    const logo=document.createElement('canvas'); logo.width=LW; logo.height=33; { const g=logo.getContext('2d'); LOGO_GLYPHS.forEach((gl,i)=>{ const x=LOGO_POS[i]-LOGO_X+1, y=gl.dy+3; g.globalAlpha=.4; g.drawImage(gl.dark,x+2,y+3); g.globalAlpha=1; g.drawImage(gl.img,x,y); }); }
    const brand=gaviMark('#9ec7aa'), R=gaviR('#9ec7aa');
    for(const [W,H] of SPLASH){ const c=document.createElement('canvas'); c.width=W; c.height=H; const g=c.getContext('2d'); g.imageSmoothingEnabled=false;
      g.fillStyle='#0b1a10'; g.fillRect(0,0,W,H); [['#0f2417',.62],['#132c1c',.46],['#173420',.3]].forEach(([col,r])=>{ g.fillStyle=col; g.beginPath(); g.arc(W/2,H*.42,W*r*1.4,0,6.283); g.fill(); }); // aros planos
      const k=Math.floor(W*.66/LW), lx=Math.round(W/2-LW*k/2), ly=Math.round(H*.34); g.drawImage(logo,0,0,LW,33,lx,ly,LW*k,33*k);
      const hs=k*2, hw=B.w*hs, hh=B.h*hs; g.drawImage(hero,B.x0,B.y0,B.w,B.h,Math.round(W/2-hw/2),ly+33*k+Math.round(k*6),hw,hh);
      const bk=Math.max(2,Math.round(k*.9)); g.drawImage(brand,0,0,brand.width,10,Math.round(W/2-(brand.width*bk*2+9*bk)/2),H-Math.round(H*.09),brand.width*bk*2,10*bk*2); g.drawImage(R,0,0,7,7,Math.round(W/2-(brand.width*bk*2+9*bk)/2)+brand.width*bk*2+bk*2,H-Math.round(H*.09),7*bk,7*bk);
      O['splash-'+W+'x'+H+'.png']=c.toDataURL('image/png'); }
    return O; },SPLASH);
  for(const [n,d] of Object.entries(out)) fs.writeFileSync(path.join(root,'icons',n),Buffer.from(d.split(',')[1],'base64'));
  console.log(Object.keys(out).length+' imágenes en icons/'); await b.close(); server.close();
})();
