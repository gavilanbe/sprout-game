'use strict';
/* ============================================================
   EL MOMENTO DEL ARMA: cada arma y herramienta nueva tiene su segundo de
   gloria, hiper breve (unos dos segundos y medio; Z lo acelera).
   · Sprout la atrapa al vuelo: el arma salta dando vueltas, Sprout la agarra
     con un aplastón y la alza entre rayos.
   · ¡Congelado! Un chasquido de obturador y el mundo se queda quieto en una
     viñeta tramada con los colores de esa arma: franjas de cine, líneas de
     velocidad, un empujón lento de cámara, el arma en grande con su nombre en
     la cinta y una frase del valle que se escribe sola.
   · La viñeta se deshace, el arma vuelve a sus manos y sigue el cartel de
     siempre con cómo se usa.
   Se engancha en getItem (09), en el estado itemget (13) y en draw() (15-ui).
   Las pruebas lo cortan como antes: itemT=0.
   ============================================================ */
const MOMENT_ARMS={ // pal: [sombra, medio oscuro, medio claro, luz]
  blade:{tag:'EL ARMA DEL BROTE',pal:['#08200e','#1d5a22','#58b048','#d0fa98'],line:'La primera hoja del Gran Roble. Corta lo que el invierno ató.'},
  bomb:{tag:'HERRAMIENTA NUEVA',pal:['#1c0a04','#6a3410','#c47c2a','#ffdc94'],line:'Dentro de cada bellota duerme un roble con prisa.'},
  hook:{tag:'HERRAMIENTA NUEVA',pal:['#120a04','#4a2c14','#9c6a38','#f2d6a2'],line:'Una raíz siempre encuentra dónde agarrarse.'},
  boomer:{tag:'HERRAMIENTA NUEVA',pal:['#0c2006','#386a1a','#8cb442','#f2f6b4'],line:'Lo que lanzas con cariño siempre vuelve.'},
  lantern:{tag:'HERRAMIENTA NUEVA',pal:['#1e0604','#7c1e0c','#e2682a','#ffe28c'],line:'Una chispa de la Brasa de Primavera. No se apaga nunca.'},
  feather:{tag:'HERRAMIENTA NUEVA',pal:['#0e1a32','#34588a','#8cb6ea','#f8fbff'],line:'Quien no pesa nada cruza cualquier vacío.'},
  shield:{tag:'DEFENSA NUEVA',pal:['#160c06','#5a3818','#b2823e','#fadc9a'],line:'La corteza del Roble aguantó mil inviernos. Ahora aguanta por ti.'},
  molinillo:{tag:'HERRAMIENTA NUEVA',pal:['#280a22','#8a2a70','#e272b2','#fff0f8'],line:'Un poco de viento tuyo, para cuando el suyo sople en contra.'},
};
const M_CATCH=12, M_POSE=34, M_FREEZE=100, M_REL=14;
let moment=null;
function startMoment(kind){
  if(!MOMENT_ARMS[kind]) return;
  const hx=player.x+8, hy=player.y-9, R=[]; let s=kind.length*7+11; const rnd=()=>((s=(s*16807)%2147483647)/2147483647);
  for(let i=0;i<30;i++) R.push({a:i/30*6.283+(rnd()-.5)*.14,r0:34+rnd()*14,w:rnd()<.3?2:1}); // las líneas de velocidad de esta viñeta
  moment={kind,t:0,hx,hy,fx:hx,fy:player.y+14,chars:0,snap:null,lines:R}; itemT=999; }
function endMoment(){ moment=null; itemT=0; const pages=(itemPages||[]).slice(1); if(pages.length) say(pages); else state='play'; }
function updMoment(){
  const M=moment, A=MOMENT_ARMS[M.kind];
  if(itemT<=1){ endMoment(); return; } // las pruebas (y quien tenga mucha prisa) lo cortan así
  M.t++;
  if(M.t===M_CATCH){ player.squash=.35; SFX.momentCatch(); puff(M.hx,M.hy,'#fff6c0',8,1.3); }
  if(M.t===M_POSE){ SFX.momentFreeze(); if(typeof rumble==='function') rumble(120,.5,.3); }
  if(M.t===M_POSE+6) SFX.fanfare();
  const f=M.t-M_POSE;
  if(keys.fire&&M.t>8){ keys.fire=false;
    if(M.t<M_POSE) M.t=M_POSE-1;                                            // al grano: a la viñeta
    else if(f<M_FREEZE){ if(M.chars<A.line.length) M.chars=A.line.length; else M.t=M_POSE+M_FREEZE; } }
  if(f>=12&&f<M_FREEZE) M.chars=Math.min(A.line.length,M.chars+1.5);
  if(M.t<M_POSE||f>=M_FREEZE) updParts();                                    // congelado, hasta las motas se quedan quietas
  if(M.t>=M_POSE+M_FREEZE+M_REL) endMoment();
}
/* ---------- la viñeta: tramado de cuatro tonos con los colores del arma ---------- */
const MOMENT_BAYER=[0,8,2,10,12,4,14,6,3,11,1,9,15,7,13,5];
function momentPosterize(im,pal){
  const c=mkCanvas(VW,VH), g=c.getContext('2d'), out=g.createImageData(VW,VH), d=im.data, o=out.data, P=pal.map(hex2rgb);
  for(let y=0;y<VH;y++) for(let x=0;x<VW;x++){ const i=(y*VW+x)*4, L=clamp(((d[i]*.3+d[i+1]*.59+d[i+2]*.11)/255-.12)/.8,0,1), th=(MOMENT_BAYER[(y&3)*4+(x&3)]+.5)/16;
    const q=P[Math.min(3,Math.floor(L*3+th))]; o[i]=q[0]; o[i+1]=q[1]; o[i+2]=q[2]; o[i+3]=255; }
  g.putImageData(out,0,0); return c; }
function momentLine(x0,y0,x1,y1,w){ const n=Math.max(Math.abs(x1-x0),Math.abs(y1-y0))|0; for(let k=0;k<=n;k++){ const x=Math.round(x0+(x1-x0)*k/n), y=Math.round(y0+(y1-y0)*k/n); ctx.fillRect(x,y,w,w); } }
/* ---------- la pose: el arma salta, Sprout la atrapa y la alza ---------- */
function drawMomentPose(M,still){
  const t=still?M_POSE-1:M.t, img=itemSpr||BLADE_SPR;
  if(t<M_CATCH){ const k=t/M_CATCH, x=lerp(M.fx,M.hx,k), y=lerp(M.fy,M.hy,k)-Math.sin(Math.PI*k)*16, sx=Math.max(.2,Math.abs(Math.cos(k*Math.PI*2)));
    ctx.save(); ctx.translate(Math.round(x),Math.round(y)); ctx.scale(sx,1); ctx.drawImage(img,-8,-8); ctx.restore(); return; }
  const k=Math.min(1,(t-M_CATCH)/10), bob=Math.round(Math.sin(t*.25)*1.5);
  drawRays(M.hx,M.hy,easeOutBack(k)); ctx.drawImage(img,M.hx-8,M.hy-8+bob);
  if(!still&&(t&3)===0) sparkle(M.hx-10+Math.random()*20,M.hy-10+Math.random()*14,'#fff6c0'); }
/* ---------- todo el momento ---------- */
function drawMoment(){
  const M=moment; if(!M) return; const A=MOMENT_ARMS[M.kind], P=A.pal;
  if(M.t<M_POSE){ drawMomentPose(M); return; }
  if(!M.snap){ drawMomentPose(M,true); M.snap=momentPosterize(ctx.getImageData(0,0,VW,VH),P); } // la foto, justo al congelar
  const f=M.t-M_POSE, rel=f>=M_FREEZE?Math.min(1,(f-M_FREEZE)/M_REL):0, e=rel>0?1-smooth(rel):smooth(Math.min(1,f/6)), img=itemSpr||BLADE_SPR;
  // 1) la viñeta congelada con un empujón lento de cámara hacia el arma (al soltar, se funde con el mundo que vuelve)
  const z=1+.1*smooth(Math.min(1,f/90)), cx=M.hx, cy=M.hy;
  ctx.save(); ctx.imageSmoothingEnabled=false; ctx.globalAlpha=1-smooth(rel);
  ctx.drawImage(M.snap,0,0,VW,VH,Math.round(cx-cx*z),Math.round(cy-cy*z),Math.round(VW*z),Math.round(VH*z)); ctx.restore();
  if(rel<1){
    const ax=80, ay=58;
    // 2) líneas de velocidad desde los bordes hacia el arma (parpadean para que la quietud vibre)
    ctx.save(); ctx.globalAlpha=.55*e; ctx.fillStyle=P[3];
    M.lines.forEach((L,i)=>{ if(((i+(f>>2))%4)===0) return; const c=Math.cos(L.a), s=Math.sin(L.a), R=120; momentLine(ax+c*(L.r0+(f&2?2:0)),ay+s*L.r0*.9,ax+c*R,ay+s*R,L.w); });
    ctx.restore();
    // 3) el estallido detrás y el arma en grande, con su contorno
    const pop=rel>0?1:Math.min(1,f/8), sc=rel>0?Math.max(1,Math.round(4-rel*3)):(f<2?2:f<4?3:f<7?5:4);
    ctx.save(); ctx.translate(ax,ay); ctx.rotate(f*.015); ctx.globalAlpha=.3*e;
    for(let i=0;i<12;i++){ const a=i/12*6.283, R=46*pop; ctx.fillStyle=i&1?P[3]:P[2]; ctx.beginPath(); ctx.moveTo(0,0); ctx.lineTo(Math.cos(a-.13)*R,Math.sin(a-.13)*R); ctx.lineTo(Math.cos(a+.13)*R,Math.sin(a+.13)*R); ctx.closePath(); ctx.fill(); }
    ctx.restore();
    ctx.save(); ctx.globalAlpha=e*.9; ctx.fillStyle=P[1]; ctx.beginPath(); ctx.arc(ax,ay,24*pop,0,6.283); ctx.fill(); ctx.fillStyle=P[2]; ctx.beginPath(); ctx.arc(ax,ay,20*pop,0,6.283); ctx.fill(); ctx.restore();
    const W=img.width*sc, H=img.height*sc, bob=rel>0?0:Math.round(Math.sin(f*.12)*2), ix=Math.round(lerp(ax,M.hx,rel)-W/2), iy=Math.round(lerp(ay,M.hy,rel)-H/2)+bob;
    const sil=tintCached(img,P[0]); for(const [ox,oy] of [[-sc,0],[sc,0],[0,-sc],[0,sc]]) ctx.drawImage(sil,0,0,img.width,img.height,ix+ox,iy+oy,W,H);
    ctx.drawImage(img,0,0,img.width,img.height,ix,iy,W,H);
    if(rel===0&&f>10&&f<40){ const g=f-10, gx=ix+Math.round(W*g/30); ctx.save(); ctx.beginPath(); ctx.rect(ix,iy,W,H); ctx.clip(); ctx.globalAlpha=.55; ctx.fillStyle='#ffffff'; ctx.fillRect(gx,iy,3,H); ctx.fillRect(gx+5,iy,1,H); ctx.restore(); } // un brillo que la cruza
    // 4) franjas de cine
    const top=Math.round(17*e), bot=Math.round(36*e);
    ctx.fillStyle='#050807'; ctx.fillRect(0,0,VW,top); ctx.fillRect(0,VH-bot,VW,bot);
    ctx.fillStyle=P[1]; if(top>1) ctx.fillRect(0,top-1,VW,1); if(bot>1) ctx.fillRect(0,VH-bot,VW,1);
    // 5) la etiqueta, el nombre en su cinta y la frase del valle
    if(rel===0){
      if(f>=4){ const a=Math.min(1,(f-4)/6); ctx.globalAlpha=a; const tw=textW(A.tag,FONT_S); txtS(A.tag,80,6,P[3],'center');
        ctx.fillStyle=P[2]; ctx.fillRect(80-tw/2-16,8,10,1); ctx.fillRect(80+tw/2+6,8,10,1); ctx.globalAlpha=1; }
      if(f>=6){ const name=ITEM_NAMES[M.kind]||itemCardName||'', w=textW(name)+14, dy=Math.round((1-easeOutBack(Math.min(1,(f-6)/10)))*18); ribbon(80,89+dy,w,name); }
      if(M.chars>0){ let n=Math.floor(M.chars); wrapPx(A.line,148).slice(0,3).forEach((ln,i)=>{ const s=ln.slice(0,Math.max(0,n)); n-=ln.length+1; if(s) txtOL(s,80,VH-bot+6+i*10,'#fffbe8','center','#050807'); }); }
      if(M.chars>=A.line.length&&(f&31)<20){ ctx.fillStyle=P[3]; const bx=151, by=VH-8; ctx.fillRect(bx,by,1,5); ctx.fillRect(bx+1,by+1,1,3); ctx.fillRect(bx+2,by+2,1,1); }
    }
    // 6) el fogonazo del obturador
    if(f<4){ ctx.fillStyle='rgba(255,255,255,'+(1-f/4).toFixed(2)+')'; ctx.fillRect(0,0,VW,VH); }
  }
}
