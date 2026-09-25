'use strict';
/* ---------- HUD, DIÁLOGO, MENÚS Y PANTALLAS ---------- */
function txt(s,x,y,col,align){ drawText(ctx,s,x,y,col||C.uiText,align,FONT_M); }
function txtS(s,x,y,col,align){ drawText(ctx,s,x,y,col||C.uiText,align,FONT_S); }
/* con sombra dura abajo-derecha (para texto sobre el mundo) */
function txtO(s,x,y,col,align,sh){ const F=FONT_M; drawText(ctx,s,x+1,y+1,sh||PAL.k,align,F); drawText(ctx,s,x,y+1,sh||PAL.k,align,F); drawText(ctx,s,x,y,col||'#fffbe8',align,F); }
function txtSO(s,x,y,col,align,sh){ drawText(ctx,s,x+1,y+1,sh||PAL.k,align,FONT_S); drawText(ctx,s,x,y+1,sh||PAL.k,align,FONT_S); drawText(ctx,s,x,y,col||'#fffbe8',align,FONT_S); }
/* contorno completo de 1 px (títulos sobre fondos cargados) */
function txtOL(s,x,y,col,align,ol,F){ F=F||FONT_M; ol=ol||PAL.k; for(const [dx,dy] of [[-1,0],[1,0],[0,-1],[0,1],[1,1],[-1,1],[1,-1],[-1,-1]]) drawText(ctx,s,x+dx,y+dy,ol,align,F); drawText(ctx,s,x,y,col||'#fffbe8',align,F); }
function box(x,y,w,h,fill){ ctx.fillStyle=PAL.k; ctx.fillRect(x-1,y-1,w+2,h+2); ctx.fillStyle=fill||'#183020'; ctx.fillRect(x,y,w,h); ctx.strokeStyle=C.uiText; ctx.lineWidth=1; ctx.strokeRect(x+1.5,y+1.5,w-3,h-3); }
const X_ICON={bomb:BOMB_SPR,hook:HOOK_SPR,boomer:BOOMER_SPR,lantern:LANTERN_SPR,feather:FEATHER_SPR,molinillo:PINWHEEL_SPR};
const X_NAME={bomb:'BELLOTA-BOMBA',hook:'RAÍZ-GANCHO',boomer:'VAINA VOLADORA',lantern:'FAROL DE BRASA',feather:'VILANO',molinillo:'MOLINILLO'};
/* ---------- HUD: barra de pergamino a lo Link's Awakening DX ---------- */
const HUD={ink:'#2a1a0e', paper:'#f4e2b0', paper2:'#e6cc8e', paperL:'#fff6d8', well:'#d2b478', wellD:'#b8955c', text:'#3a2412', dim:'#8a6a44'};
function hudWell(x,y,w,h){ // hueco hundido en el pergamino
  ctx.fillStyle=HUD.ink; ctx.fillRect(x+1,y,w-2,h); ctx.fillRect(x,y+1,w,h-2);
  ctx.fillStyle=HUD.well; ctx.fillRect(x+1,y+1,w-2,h-2);
  ctx.fillStyle=HUD.wellD; ctx.fillRect(x+1,y+1,w-2,1); ctx.fillRect(x+1,y+1,1,h-2);
  ctx.fillStyle=HUD.paperL; ctx.fillRect(x+2,y+h-2,w-3,1); }
function badge(ch,x,y){ // etiqueta Z / X: pastilla oscura con la letra en crema
  ctx.fillStyle=HUD.ink; ctx.fillRect(x+1,y,7,9); ctx.fillRect(x,y+1,9,7); ctx.fillStyle='#6a4420'; ctx.fillRect(x+1,y+1,7,7); ctx.fillStyle='#8a5c2c'; ctx.fillRect(x+1,y+1,7,1);
  drawText(ctx,ch,x+2,y+1,'#ffe9a8','left',FONT_M); }
function panel(x,y,w,h){ hudWell(x,y,w,h); }
function hudNum(n,x,y,col){ drawText(ctx,n,x+1,y+1,HUD.paperL,'left',FONT_M); drawText(ctx,n,x,y,col||HUD.text,'left',FONT_M); }
function drawUI(){
  const Y=PLAY_H;
  // el pergamino: borde de tinta, luz arriba, trama de fibras
  ctx.fillStyle=HUD.ink; ctx.fillRect(0,Y,VW,16);
  ctx.fillStyle=HUD.paper; ctx.fillRect(0,Y+1,VW,15);
  ctx.fillStyle=HUD.paperL; ctx.fillRect(0,Y+1,VW,1);
  ctx.fillStyle=HUD.paper2; ctx.fillRect(0,Y+14,VW,2);
  for(let x=3;x<VW;x+=11){ ctx.fillRect(x,Y+4+((x*7)%9),2,1); }
  // Z: la Hoja (con sus muescas de nivel)
  hudWell(1,Y+2,26,13); badge('Z',2,Y+4);
  if(hasBlade){ ctx.drawImage(BLADE_HUD[Math.max(1,Math.min(3,bladeLvl))],11,Y+4); hudBladeMeter(Y); } // la Hoja de su filo (12b)
  // X: el objeto equipado
  hudWell(29,Y+2,26,13); badge('X',30,Y+4);
  if(xItem){ const pop=xFlash>0?Math.sin((10-xFlash)/10*Math.PI)*2:0;
    if(xFlash>0&&(tick&2)){ ctx.fillStyle='#fffbe8'; ctx.fillRect(40,Y+3,14,11); }
    ctx.drawImage(X_ICON[xItem],1,1,14,14,(39-pop/2)|0,(Y+2-pop/2)|0,(14+pop)|0,(12+pop)|0);
    if(xItem==='bomb'){ const n=''+bombAmmo, col=bombAmmo===0?'#ff6050':bombAmmo<=2?'#ffd060':'#fff6d8', w=textW(n,FONT_S)+4; roundBox(56-w,Y+8,w,7,HUD.ink); drawText(ctx,n,58-w,Y+9,col,'left',FONT_S); } }
  // bayas
  const by=hudBerryT>8?-1:0; ctx.drawImage(BERRY_SPR,58,Y+4+by);
  hudNum(String(berries).padStart(3,'0'),67,Y+5,hudBerryT>0?'#c8205a':HUD.text);
  // semillas / llaves de la mazmorra / amuletos
  const dk=dungeonOf(sx,sy);
  if(dk){ ctx.drawImage(KEY_SPR,85,Y+4); hudNum('×'+(dungeonKeys[dk]||0),93,Y+5); if(bigKeys[dk]) ctx.drawImage(BIGKEY_SPR,0,0,12,10,104,Y+3,10,9); }
  else if(!won){ const sy2=hudSeedT>0&&(tick&4)?-1:0; ctx.drawImage(ACORN_GOLD,85,Y+4+sy2); hudNum(seeds+'/8',94,Y+5,hudSeedT>0?'#c07808':HUD.text); }
  else { let ex=86; for(const a of equipped){ if(a) ctx.drawImage(AMULET_SPR[a],0,0,12,12,ex,Y+3,11,11); else hudWell(ex,Y+3,11,11); ex+=13; } }
  // corazones: a la derecha, hasta 10 en dos filas; el último late si queda poco
  const hearts=player.maxHp/2, two=hearts>5, low=player.hp<=2, shk=hudHurtT>0?((tick&2)?1:-1):0;
  const perRow=5, sz=two?7:8, x0=VW-2-Math.min(hearts,perRow)*8;
  for(let i=0;i<hearts;i++){ const v=player.hp-i*2, col=i%perRow, row=two?((i/perRow)|0):0;
    let hx=x0+col*8+shk, hy=Y+(two?2+row*7:4);
    let img=v>=2?HEART_FULL:v===1?HEART_HALF:HEART_EMPTY, s=sz;
    const last=v>0&&v<=2; // el corazón «vivo» más a la derecha
    if(last&&low){ const b=Math.max(0,Math.sin(tick*.35)); s=sz+Math.round(b*2); }
    if(hudHealT>0&&i===((player.hp-1)>>1)){ s=sz+Math.round(Math.sin(hudHealT/16*Math.PI)*3); if(hudHealT>10) img=HEART_WHITE; }
    if(hudHurtT>12&&i===(player.hp>>1)) img=HEART_WHITE;
    const o=(s-sz)/2; ctx.drawImage(img,0,0,8,8,(hx-o)|0,(hy-o)|0,s,s); }
}
/* burbuja «Z» sobre lo que se puede usar */
const HINT_CH=new Set(['S','O','Ⓑ','Ω','¤','D','G','[',']','}','{','E','h','j','y','g','ö','ñ',')','Ł','P']);
let hintK=0, hintKey='';
function speechBubble(bx,by,ch,col){
  ctx.fillStyle=PAL.k; ctx.fillRect(bx+1,by,9,11); ctx.fillRect(bx,by+1,11,9); ctx.fillRect(bx+4,by+11,3,1); ctx.fillRect(bx+5,by+12,1,1);
  ctx.fillStyle='#fffbe8'; ctx.fillRect(bx+1,by+1,9,9); ctx.fillRect(bx+5,by+10,1,1);
  ctx.fillStyle='#e8dcc0'; ctx.fillRect(bx+1,by+9,9,1); ctx.fillRect(bx+9,by+1,1,9);
  drawText(ctx,ch,bx+3,by+2,col||PAL.k,'left',FONT_M); }
function drawHint(){
  if(state!=='play'||boss||midboss||inBed){ hintK=0; return; }
  const ft=facingTile(); if(!ft){ hintK=0; return; } const [tx,ty,ch]=ft;
  const guest=npcs.some(n=>n.guest&&n.x===tx&&n.y===ty);
  if(!HINT_CH.has(ch)&&!guest){ hintK=0; return; }
  const key=tx+','+ty; if(key!==hintKey){ hintKey=key; hintK=0; } hintK=Math.min(1,hintK+.12);
  const pop=easeOutBack(hintK), bob=Math.sin(tick*.12)*1.2;
  const bx=tx*16+3, by=ty*16-12+bob+(1-pop)*6;
  ctx.save(); ctx.translate(bx+5,by+12); ctx.scale(pop,pop); speechBubble(-5,-12,'Z'); ctx.restore();
}
/* cartel del lugar recién descubierto: una cinta de pergamino que cae */
function ribbon(cx,y,w,label){
  const x=Math.round(cx-w/2);
  ctx.fillStyle='rgba(20,12,4,.35)'; ctx.fillRect(x-5,y+3,w+10,12);
  // colas en cola de golondrina
  for(const [ex,dir] of [[x-7,1],[x+w+7,-1]]){ ctx.fillStyle=PAL.k; ctx.fillRect(Math.min(ex,ex+dir*9),y+2,9,11);
    ctx.fillStyle='#c89858'; ctx.fillRect(Math.min(ex,ex+dir*9)+1,y+3,7,9); ctx.fillStyle='#a87838'; ctx.fillRect(Math.min(ex,ex+dir*9)+1,y+10,7,2);
    ctx.fillStyle=PAL.k; const tip=dir>0?ex:ex-1; ctx.fillRect(tip,y+6,2,3); ctx.fillStyle='rgba(0,0,0,0)'; }
  ctx.fillStyle=PAL.k; ctx.fillRect(x-1,y,w+2,13);
  ctx.fillStyle='#f4e2b0'; ctx.fillRect(x,y+1,w,11);
  ctx.fillStyle='#fff6d8'; ctx.fillRect(x,y+1,w,1);
  ctx.fillStyle='#dcc28a'; ctx.fillRect(x,y+10,w,2);
  drawText(ctx,label,cx+1,y+3,'#fff6d8','center'); drawText(ctx,label,cx,y+3,'#4a2e14','center');
}
function drawPlaceBanner(){
  if(!placeBanner||bossCard||toast||state==='itemget') return;
  const t=110-placeBanner.t, inK=Math.min(1,t/14), outK=Math.min(1,placeBanner.t/16);
  const y=Math.round(-16+20*easeOutBack(inK)-(1-outK)*20);
  ribbon(80,y,textW(placeBanner.txt)+12,placeBanner.txt);
}
/* ---------- quién habla: color de su etiqueta y tono de su voz ---------- */
const SPEAKER={
  'RAÍZ':{col:'#78c850',ink:'#12361a',f:420,w:'triangle'}, 'PETRA':{col:'#f890b0',ink:'#4a1428',f:980,w:'square'},
  'LUPA':{col:'#f0c040',ink:'#4a3008',f:760,w:'square'}, 'MOSS':{col:'#60b0c8',ink:'#0e2e3a',f:360,w:'triangle'},
  'TILO':{col:'#b0e050',ink:'#243a08',f:640,w:'square'}, 'CORTEZA':{col:'#b088d8',ink:'#2a1440',f:300,w:'triangle'},
  'EL VIENTO':{col:'#b8d8f8',ink:'#18304a',f:230,w:'sine'}, 'EL TOPO REAL':{col:'#c08858',ink:'#3a1e08',f:170,w:'square'},
  'LA REINA':{col:'#f8d030',ink:'#3a2a00',f:1150,w:'square'}, 'SPROUT':{col:'#a4e070',ink:'#1d4f22',f:820,w:'square'},
};
function voiceBlip(who,ch){ if(!AC) return; const S=SPEAKER[who], base=S?S.f:900, k=1+(((ch||'a').charCodeAt(0)%7)-3)*.045;
  beep(S?S.w:'square',base*k,base*k*1.12,.04,S&&S.w!=='square'?.05:.022); }
/* marcos de texto: cada clase de texto tiene su piel */
const FRAMES={
  normal:{bg:'#244a30',bg2:'#16301f',border:'#6a4424',inner:'#3a6a48',text:'#f8f0d0',shadow:'#0a1a0e',key:'#ffd060',name:'#16301f',corner:'#8ad860'},
  wood:{bg:'#d09a5c',bg2:'#c08848',border:'#5a3418',inner:'#a06a38',text:'#3a2010',shadow:'#ecc088',key:'#a82810',name:'#5a3418',corner:'#ffe0a0'},
  stone:{bg:'#5c5c74',bg2:'#50506a',border:'#2e2e40',inner:'#74748e',text:'#eef4ff',shadow:'#22222e',key:'#60f0e0',name:'#262030',corner:'#60f0e0'},
  paper:{bg:'#f2e2b4',bg2:'#e8d4a0',border:'#a07840',inner:'#d8c090',text:'#3a2c14',shadow:'#fff8e0',key:'#b83818',name:'#c8b078',corner:'#b83818'},
  letter:{bg:'#e8eef8',bg2:'#dce4f2',border:'#3a5a8a',inner:'#b8c8e0',text:'#1c2c48',shadow:'#ffffff',key:'#c83858',name:'#98acc8',corner:'#c83858'},
};
function roundBox(x,y,w,h,col){ ctx.fillStyle=col; ctx.fillRect(x+1,y,w-2,h); ctx.fillRect(x,y+1,w,h-2); }
function leafPx(x,y,big,sway){ // hojita de 3 o 5 píxeles que se mece
  const s=sway?Math.round(Math.sin(tick*.08+x*.3)):0; ctx.fillStyle=PAL.k;
  if(big){ ctx.fillRect(x-1+s,y-1,5,4); ctx.fillStyle='#4aa040'; ctx.fillRect(x+s,y,3,2); ctx.fillStyle='#a8e870'; ctx.fillRect(x+s,y,1,1); ctx.fillStyle='#2e7a30'; ctx.fillRect(x+1+s,y+1,2,1); }
  else { ctx.fillRect(x-1+s,y-1,4,3); ctx.fillStyle='#78d838'; ctx.fillRect(x+s,y,2,1); } }
/* el marco se compone una vez por sitio y tamaño y se pega de un golpe (antes, ~500 fillRect por fotograma); en vivo quedan la sombra,
   que se mezcla con lo de debajo, y lo que se mueve (las hojas de la enredadera, las runas que laten). A opacidad plena: el mismo resultado */
const FRAME_CACHE=new Map();
function drawFrame(x,y,w,h,st){
  const F=FRAMES[st]||FRAMES.normal;
  roundBox(x-1,y+2,w+4,h+3,'rgba(0,0,0,.35)');                       // sombra
  if(Number.isInteger(x)&&Number.isInteger(y)&&Number.isInteger(w)&&Number.isInteger(h)&&ctx.globalAlpha===1&&pxPlain(ctx)){
    const key=st+'|'+x+'|'+y+'|'+w+'|'+h; let c=FRAME_CACHE.get(key);
    if(!c){ c=mkCanvas(w+64,h+64); const keep=ctx; ctx=c.getContext('2d'); ctx.imageSmoothingEnabled=false; ctx.translate(32-x,32-y); try{ frameBody(x,y,w,h,st,F); } finally { ctx=keep; } // 32 px de margen: hay adornos que asoman (las franjas de la carta, las líneas de la piedra)
      FRAME_CACHE.set(key,c); if(FRAME_CACHE.size>48) FRAME_CACHE.delete(FRAME_CACHE.keys().next().value); }
    else { FRAME_CACHE.delete(key); FRAME_CACHE.set(key,c); }
    ctx.drawImage(c,x-32,y-32); }
  else frameBody(x,y,w,h,st,F);
  frameLive(x,y,w,h,st,F); return F; }
function frameLive(x,y,w,h,st,F){
  if(st==='stone'){ const glow=.5+.5*Math.sin(tick*.08); ctx.globalAlpha=.5+glow*.5; ctx.fillStyle=F.key;
    for(const [cx,cy] of [[x+2,y+2],[x+w-7,y+2],[x+2,y+h-7],[x+w-7,y+h-7]]){ ctx.fillRect(cx+2,cy,1,5); ctx.fillRect(cx,cy+2,5,1); ctx.fillRect(cx,cy,1,1); ctx.fillRect(cx+4,cy+4,1,1); }
    ctx.globalAlpha=1; }
  else if(!FRAMES[st]||st==='normal'){ frameSheen(x,y,w,h,false); for(let xx=x+7;xx<x+w-4;xx+=15) leafPx(xx,y-3+Math.round(Math.sin(xx*.33)),((xx-x)/15|0)%2===0,true);
    leafPx(x-2,y-2,true,true); leafPx(x+w-2,y+h-1,true,true); leafPx(x+w-4,y-3,false,true); } }
function frameSheen(x,y,w,h,inside){ ctx.fillStyle='rgba(255,255,255,.07)';
  for(let xx=x+6;xx<x+w-4;xx+=16){ for(let k=0;k<h-4;k+=2){ const px=xx+(k>>1), py=y+2+k; if((px<x+w)===inside) ctx.fillRect(px,py,1,1); } } }
function frameBody(x,y,w,h,st,F){
  if(st==='wood'){ // tablones con clavos
    roundBox(x-3,y-3,w+6,h+6,PAL.k); roundBox(x-2,y-2,w+4,h+4,F.border);
    ctx.fillStyle=F.bg; ctx.fillRect(x,y,w,h);
    for(let yy=y;yy<y+h;yy+=8){ ctx.fillStyle='#e8b878'; ctx.fillRect(x,yy,w,1); ctx.fillStyle=F.inner; ctx.fillRect(x,yy+7,w,1); for(let xx=x+((yy*7)%23);xx<x+w-4;xx+=29){ ctx.fillStyle=F.bg2; ctx.fillRect(xx,yy+3,6,1); ctx.fillRect(xx+2,yy+4,3,1); } }
    for(const [cx,cy] of [[x+2,y+2],[x+w-4,y+2],[x+2,y+h-4],[x+w-4,y+h-4]]){ ctx.fillStyle='#3a2a1a'; ctx.fillRect(cx,cy,2,2); ctx.fillStyle='#d8d0c0'; ctx.fillRect(cx,cy,1,1); }
    return F; }
  if(st==='stone'){ // sillares con runas que laten
    roundBox(x-3,y-3,w+6,h+6,PAL.k); roundBox(x-2,y-2,w+4,h+4,F.border);
    ctx.fillStyle=F.bg; ctx.fillRect(x,y,w,h);
    for(let yy=y;yy<y+h;yy+=10){ ctx.fillStyle=F.border; ctx.fillRect(x,yy+9,w,1); const off=((yy-y)/10)&1?14:0; for(let xx=x+off;xx<x+w;xx+=28){ ctx.fillRect(xx,yy,1,9); ctx.fillStyle=F.inner; ctx.fillRect(xx+1,yy,26,1); ctx.fillStyle=F.border; } }
    return F; } // las runas que laten van en vivo (frameLive)
  if(st==='paper'){ // pergamino de bordes tostados e irregulares
    for(let xx=-2;xx<w+2;xx++){ const t=hash(xx,1)%3, b=hash(xx,2)%3; ctx.fillStyle=PAL.k; ctx.fillRect(x+xx,y-3+t,1,h+6-t-b); ctx.fillStyle=F.border; ctx.fillRect(x+xx,y-2+t,1,h+4-t-b); }
    ctx.fillStyle=F.bg; ctx.fillRect(x,y,w,h); ctx.fillStyle=F.bg2; for(let yy=y+2;yy<y+h;yy+=9) ctx.fillRect(x+2,yy,w-4,1);
    ctx.fillStyle='#d8b878'; ctx.fillRect(x,y,w,1); ctx.fillRect(x,y+h-1,w,1); ctx.fillRect(x,y,1,h); ctx.fillRect(x+w-1,y,1,h);
    ctx.fillStyle='#6a4420'; ctx.fillRect(x+w-9,y+h-4,6,1); ctx.fillRect(x+w-4,y+h-8,1,4); ctx.fillStyle='#fffbe8'; ctx.fillRect(x+w-3,y+h-9,1,2); // pluma
    return F; }
  if(st==='letter'){ // correo aéreo: franjas rojas y azules y un sello de lacre
    roundBox(x-3,y-3,w+6,h+6,PAL.k);
    for(let i=-3;i<w+h+6;i++){ const c=((i>>2)&1)?'#d04050':'#3a64b0'; ctx.fillStyle=c;
      const px=x-2+i, py=y-2; if(px<x+w+2){ ctx.fillRect(px,py,1,2); ctx.fillRect(px,y+h,1,2); } }
    ctx.fillStyle='#d04050'; ctx.fillRect(x-2,y,2,h); ctx.fillStyle='#3a64b0'; ctx.fillRect(x+w,y,2,h);
    ctx.fillStyle=F.bg; ctx.fillRect(x,y,w,h); ctx.fillStyle=F.bg2; for(let yy=y+10;yy<y+h;yy+=10) ctx.fillRect(x+3,yy,w-6,1);
    const sx=x+w-8, sy=y+4; ctx.fillStyle=PAL.k; ctx.fillRect(sx-3,sy-2,7,5); ctx.fillRect(sx-2,sy-3,5,7); ctx.fillStyle='#b82838'; ctx.fillRect(sx-2,sy-2,5,5); ctx.fillStyle='#f06070'; ctx.fillRect(sx-1,sy-1,1,1);
    return F; }
  // normal: marco de corteza con una enredadera que lo abraza
  roundBox(x-3,y-3,w+6,h+6,PAL.k); roundBox(x-2,y-2,w+4,h+4,F.border);
  ctx.fillStyle='#4a2c14'; for(let xx=x;xx<x+w;xx+=3){ ctx.fillRect(xx,y-2,1,1); ctx.fillRect(xx+1,y+h+1,1,1); } for(let yy=y;yy<y+h;yy+=3){ ctx.fillRect(x-2,yy,1,1); ctx.fillRect(x+w+1,yy+1,1,1); }
  ctx.fillStyle='#8a5c30'; for(let xx=x+1;xx<x+w;xx+=5) ctx.fillRect(xx,y-1,2,1);
  ctx.fillStyle=PAL.k; ctx.fillRect(x,y,w,h);
  const top=F.bg, bot=F.bg2; for(let yy=1;yy<h-1;yy++){ const k=yy/h; ctx.fillStyle=k<.45?top:k>.6?bot:(((yy&1))?top:bot); ctx.fillRect(x+1,y+yy,w-2,1); }
  frameSheen(x,y,w,h,true); // el brillo en diagonal; lo que se sale del marco va en vivo (frameLive): semitransparente sobre la escena
  ctx.fillStyle='#3e7a4a'; ctx.fillRect(x+1,y+1,w-2,1);
  // enredadera por el borde de arriba, con hojas que se mecen
  ctx.fillStyle='#2e7a30'; for(let xx=x-1;xx<x+w+1;xx++){ const vy=y-2+Math.round(Math.sin(xx*.33)); ctx.fillRect(xx,vy,1,1); }
  return F; // las hojas que se mecen van en vivo (frameLive)
}
/* texto con palabras clave (MAYÚSCULAS, números) que ondulan y brillan; cada letra nueva cae en su sitio */
function drawRichLine(ln,x,y,budget,F,live){
  const keyAt=new Array(ln.length).fill(0); let wn=0;
  ln.replace(/[A-ZÁÉÍÓÚÑ][A-ZÁÉÍÓÚÑ\-]{2,}|\d+\/\d+|\b\d+\b/g,(m,off)=>{ wn++; for(let i=0;i<m.length;i++) keyAt[off+i]=wn; return m; });
  const n=Math.min(ln.length,budget); let cx=x;
  for(let i=0;i<n;i++){ const c=ln[i]; if(c===' '){ cx+=FONT_M.space+1; continue; }
    const age=n-1-i, drop=live&&age<3?[-3,-2,-1][age]:0;
    const wave=keyAt[i]&&!live?(Math.sin(tick*.09+keyAt[i]*2.1)>.55?-1:0):0, yy=y+drop+wave;
    let col=keyAt[i]?F.key:F.text; if(keyAt[i]&&!live&&(((tick>>1)-i)%56+56)%56<2) col=shade(F.key,.45); // un brillo que recorre la palabra
    if(F.shadow) drawText(ctx,c,cx,yy+1,F.shadow,'left',FONT_M);
    cx=drawText(ctx,c,cx,yy,col,'left',FONT_M); }
}
const DLG_W=152, DLG_TXT_POR=98, DLG_TXT=136;
function drawDialog(){
  const full=dlg.pages[dlg.page], lines=full.split('\n'), pt=dlg.pt||0;
  const w=DLG_W, h=46, y0=(player.y+8>56)?7:78;
  const shout=/[¡!]/.test(full)&&pt<12, x=4+(shout?((pt>>1)&1?1:-1):0), y=y0;
  const open=Math.min(1,(dlg.t||0)/9), sy=easeOutBack(open);
  if(open<1){ ctx.save(); ctx.translate(x+w/2,y+h/2); ctx.scale(Math.min(1,.4+open*.9),Math.max(.1,sy)); ctx.translate(-(x+w/2),-(y+h/2)); drawFrame(x,y,w,h,dlg.style); ctx.restore(); return; }
  const F=drawFrame(x,y,w,h,dlg.style), S=SPEAKER[dlg.who];
  const por=dlg.who&&PORTRAITS[dlg.who], talking=dlg.chars<full.length;
  if(por){ const bob=talking?Math.round(Math.abs(Math.sin(tick*.35))*1.5):0, col=S?S.col:'#78c850';
    roundBox(x+3,y+3,40,40,PAL.k); ctx.fillStyle=shade(col,-.55); ctx.fillRect(x+4,y+4,38,38);
    const gr=ctx.createRadialGradient(x+23,y+18,2,x+23,y+22,24); gr.addColorStop(0,shade(col,-.1)); gr.addColorStop(1,shade(col,-.6)); ctx.fillStyle=gr; ctx.fillRect(x+4,y+4,38,38);
    ctx.fillStyle='rgba(255,255,255,.12)'; for(let i=0;i<5;i++){ const a=tick*.01+i*1.26; ctx.fillRect((x+23+Math.cos(a)*14)|0,(y+23+Math.sin(a)*14)|0,1,1); }
    ctx.save(); ctx.beginPath(); ctx.rect(x+4,y+4,38,38); ctx.clip();
    ctx.drawImage(por,0,0,por.width,por.height,x+7,y+8-bob,32,32+bob); ctx.restore();
    ctx.strokeStyle=col; ctx.lineWidth=1; ctx.strokeRect(x+4.5,y+4.5,37,37); }
  if(dlg.who){ const nw=textW(dlg.who)+14, col=S?S.col:F.key, ink=S?S.ink:PAL.k, swy=Math.round(Math.sin(tick*.07)), py=((y===78)?y-14:y+h+4)+swy;
    roundBox(x+2,py,nw+2,13,PAL.k); roundBox(x+3,py+1,nw,11,col); ctx.fillStyle=shade(col,.35); ctx.fillRect(x+4,py+1,nw-2,1); ctx.fillStyle=shade(col,-.25); ctx.fillRect(x+4,py+10,nw-2,1);
    leafPx(x+nw+1,py+1,false,true);
    drawText(ctx,dlg.who,x+9,py+4,shade(col,.5)); drawText(ctx,dlg.who,x+9,py+3,ink); }
  const tx0=por?x+47:x+8, slide=Math.max(0,5-pt); let budget=dlg.chars|0;
  ctx.save(); if(slide) ctx.globalAlpha=1-slide/6;
  lines.forEach((ln,i)=>{ if(budget<=0) return; drawRichLine(ln,tx0,y+7+i*12+slide,budget,F,talking&&budget<=ln.length); budget-=ln.length+1; });
  ctx.restore();
  if((dlg.chars|0)>=full.length){
    if(dlg.ask&&dlg.page===dlg.pages.length-1){ // elección: cursor entre Sí y No
      const ox=x+w-64, oy=y+h-14; roundBox(ox-4,oy-3,60,13,F.bg2);
      ['Sí','No'].forEach((o,i)=>{ const sel=dlg.sel===i; if(sel) ctx.drawImage(CURSOR_SPR,ox+i*28-1+((tick&15)<8?0:1),oy-1); txt(o,ox+i*28+9,oy+(sel?Math.round(Math.sin(tick*.2)):0),sel?F.key:F.text); }); }
    else if(dlg.page<dlg.pages.length-1){ const b=Math.abs(Math.sin(tick*.15))*2; ctx.drawImage(NEXT_SPR,x+w-12,(y+h-10+b)|0); }
    else { const s2=1+Math.round(Math.abs(Math.sin(tick*.1))); ctx.fillStyle=F.key; ctx.fillRect(x+w-9-s2,y+h-8-s2,2+s2*2,2+s2*2); ctx.fillStyle=PAL.k; ctx.fillRect(x+w-8,y+h-7,2,2); } }
}
const BOSS_SUB={'EL TOPO REAL':'guardián de la Brasa','LA REINA AVISPA':'guardiana de la Lágrima','EL VIENTO DEL NORTE':'hermano del Roble','EL ESCARABAJO REY':'morro de hierro','EL ZÁNGANO CAPITÁN':'aguijón del panal','EL GUARDIÁN DE HIELO':'roca que no siente','EL CIERVO DE ÁMBAR':'guardián del Otoño','EL ESPANTAPÁJAROS':'paja con malas pulgas'};
function drawBossCard(){ if(!bossCard) return;
  const t=130-bossCard.t, a=Math.max(0,Math.min(1,t/6,bossCard.t/20));
  const w=Math.min(164,8+t*16), slide=Math.max(0,1-t/16);
  ctx.globalAlpha=a;
  ctx.fillStyle='rgba(8,4,6,.88)'; ctx.fillRect(80-w/2,30,w,30);
  ctx.fillStyle='#e84848'; ctx.fillRect(80-w/2,30,w,2); ctx.fillRect(80-w/2,58,w,2);
  ctx.fillStyle='#7a1818'; ctx.fillRect(80-w/2,32,w,1); ctx.fillRect(80-w/2,57,w,1);
  if(t>6){ const n=bossCard.txt, ox=Math.round(-slide*60);
    txtOL(n,80+ox,36,'#fffbe8','center','#5a0c10');
    txtSO(BOSS_SUB[n]||'',80-ox,49,'#f0b848','center','#3a0a08'); }
  ctx.globalAlpha=1; }
function drawToast(){ if(!toast) return;
  const t=140-toast.t, inK=Math.min(1,t/12), outK=Math.min(1,toast.t/10);
  const h=toast.t2?25:15, y=Math.round(-h+(h+3)*easeOutBack(inK)-(1-outK)*(h+4));
  drawFrame(10,y,140,h,'normal');
  const spin=Math.sin(t*.25)*.5+.5; ctx.save(); ctx.translate(20,y+h/2); ctx.scale(Math.max(.2,Math.abs(Math.cos(t*.12))),1); ctx.drawImage(ACORN_GOLD,-4,-4); ctx.restore();
  if(t<30&&(t&3)<2){ ctx.fillStyle='#fffbe8'; ctx.fillRect(16+((t*3)%10),y+2,1,1); }
  txtO(toast.t1,84,y+4,'#ffc850','center','#0c1a10'); if(toast.t2) txt(toast.t2,84,y+14,'#f8ecc8','center'); }
function drawShop(){
  const st=shopKind==='corteza'?'stone':'wood', F=drawFrame(6,5,148,118,st), dark=st==='wood';
  txtO(shopKind==='corteza'?'CABAÑA DE CORTEZA':'TIENDA DE TILO',80,10,dark?'#fff0c0':F.key,'center',dark?'#5a2410':'#12121e');
  ctx.fillStyle=F.inner; ctx.fillRect(12,21,136,1);
  ctx.drawImage(BERRY_SPR,122,24); txt(''+berries,146,25,F.text,'right');
  const L=shopList(); const SI={b2:BLADE_SHOP[2],b3:BLADE_SHOP[3],bmax:BLADE_SHOP[3],spin:SPIN_ICON,bigspin:BIGSPIN_ICON,oakshield:OAKSHIELD_ICON,shield:SHIELD_SPR,lantern:LANTERN_SPR,hp:HEART_FULL,piece:PIECE_SPR,am_savia:AMULET_SPR.savia,am_musgo:AMULET_SPR.musgo,ok:AMULET_SPR.savia,ok2:AMULET_SPR.musgo};
  SI.bombs=ACORN;
  const step=11, rows=5, top=Math.max(0,Math.min(shopSel-2,L.length-rows)); // lista con desplazamiento: 5 filas a la vista
  if(top>0){ ctx.fillStyle=F.text; const bx=76, by=28+((tick>>3)&1); ctx.fillRect(bx+3,by,1,1); ctx.fillRect(bx+2,by+1,3,1); ctx.fillRect(bx+1,by+2,5,1); }
  if(top+rows<L.length){ ctx.fillStyle=F.text; const bx=76, by=88-((tick>>3)&1); ctx.fillRect(bx+1,by,5,1); ctx.fillRect(bx+2,by+1,3,1); ctx.fillRect(bx+3,by+2,1,1); }
  L.forEach((it,i)=>{ if(i<top||i>=top+rows) return; const y=33+(i-top)*step, sel=i===shopSel;
    if(sel){ roundBox(10,y-2,140,step+1,dark?'rgba(90,40,10,.28)':'rgba(255,240,180,.16)'); ctx.drawImage(CURSOR_SPR,10+((tick&15)<8?0:1),y); }
    const ic=SI[it.id]; if(ic){ ctx.save(); if(it.off) ctx.globalAlpha=.4; if(ic.width>12) ctx.drawImage(ic,0,0,ic.width,ic.height,20,y-1,10,10); else ctx.drawImage(ic,20,y-1); ctx.restore(); }
    txt(it.name,33,y+(sel?Math.round(Math.sin(tick*.2)*.6):0),it.off?(dark?'#9a7a58':'#8a8aa0'):(sel?(dark?'#5a1004':'#ffffff'):F.text));
    if(it.cost>0){ ctx.drawImage(BERRY_SPR,127,y-1); txt(''+it.cost,146,y,berries>=it.cost?(dark?'#1e5a14':F.key):'#c02010','right'); } });
  roundBox(12,94,136,20,dark?'#6a4424':'#262636'); ctx.fillStyle=dark?'#8a5c30':'#3a3a4c'; ctx.fillRect(13,94,134,1);
  const it=L[shopSel]; wrapPx((it.off&&it.dOff)?it.dOff:it.d,128).slice(0,2).forEach((ln,i)=>txt(ln,16,96+i*9,'#fff2d8'));
  txtS('Z COMPRAR · X SALIR',80,116,(tick&63)<44?(dark?'#5a3418':F.border):F.inner,'center');
}
/* ---------- EL ZURRÓN: vive en 15b-zurron.js ---------- */
/* ---------- CINEMÁTICA, TÍTULO, ARCHIVOS, ENCENDIDO ---------- */
function drawCine(){ drawPrologue(); }
/* viñetas del prólogo: 84×40 dibujadas con los sprites del juego */
function drawCinePanel(page,x,y){
  ctx.save(); ctx.translate(x,y); ctx.beginPath(); ctx.rect(0,0,84,40); ctx.clip();
  const sky=page>=2&&page<=4?'#6a7a98':'#86c0f0'; ctx.fillStyle=sky; ctx.fillRect(0,0,84,40);
  const grass=page===4?BIOMES.wilt.grass[0]:C.grass; ctx.fillStyle=grass; ctx.fillRect(0,28,84,12);
  if(page<=1){ ctx.drawImage(OAK,21,-2); ctx.fillStyle=PAL.y; [[30,12],[44,8],[52,16],[36,20],[46,22],[26,20],[40,4],[56,10]].forEach(([ax,ay],i)=>{ if(((tick>>4)+i)&1) ctx.fillRect(ax,ay,2,2); }); if(page===1){ ctx.drawImage(PETRA_SPR,4,20); ctx.drawImage(LUPA_SPR,64,20); } }
  else if(page===2){ ctx.drawImage(OAK,21,-2); ctx.globalAlpha=.85; ctx.drawImage(WIND_SPR,0,0,32,32,54,2,28,28); ctx.globalAlpha=1; for(let i=0;i<6;i++){ ctx.fillStyle='#dff0ff'; ctx.fillRect((tick*2+i*23)%84,4+(i*7)%30,3,1); } }
  else if(page===3){ ctx.drawImage(OAK_DARK,21,-2); ctx.drawImage(WIND_SPR,0,0,32,32,40,-4,28,28); for(let i=0;i<8;i++){ const t=(tick*.05+i*.8)%6.283; ctx.drawImage(ACORN_GOLD,(38+Math.cos(t)*30+i*3)|0,(12+Math.sin(t*2)*8)|0); } for(let i=0;i<10;i++){ ctx.fillStyle='#dff0ff'; ctx.fillRect((tick*3+i*17)%84,2+(i*9)%34,4,1); } }
  else if(page===4){ ctx.drawImage(OAK_DARK,21,-2); ctx.fillStyle='rgba(120,110,60,.35)'; ctx.fillRect(0,0,84,40); for(let i=0;i<5;i++){ ctx.fillStyle=BIOMES.wilt.grass[2]; ctx.fillRect((tick/3+i*19)%84,(30+i*2)%40,1,2); } }
  else if(page===5){ ctx.fillStyle='#e8d0a0'; ctx.fillRect(20,14,44,26); ctx.fillStyle='#d84838'; ctx.fillRect(16,6,52,10); ctx.fillStyle='#982818'; ctx.fillRect(16,14,52,2); ctx.fillStyle='#5a3418'; ctx.fillRect(38,24,8,16); ctx.fillStyle='#68a8d8'; ctx.fillRect(24,20,8,8); ctx.fillRect(52,20,8,8); ctx.drawImage(TILO_SPR,2,22); ctx.drawImage(MOSS_SPR,66,22); }
  else { ctx.fillStyle='#c89858'; ctx.fillRect(0,0,84,40); ctx.fillStyle='#a87840'; for(let yy=7;yy<40;yy+=8) ctx.fillRect(0,yy,84,1); ctx.drawImage(bedTile(),34,8); ctx.drawImage(((tick>>4)&1)?H_WAKE:H_SLEEP,34,4); ctx.fillStyle='#fffbe8'; if((tick>>3)&1) ctx.fillRect(50,6,2,2); }
  ctx.restore(); ctx.strokeStyle='#8a7a40'; ctx.strokeRect(x-.5,y-.5,85,41);
}
/* ---------- EL ARRANQUE: «gavilanbe®» baja como el logo de la Game Boy ----------
   letras propias con el aire del logotipo de Nintendo: trazo de 2 px, hombros con muesca, la i con su
   punto suelto y la ® pequeña a escala 1. Diez filas: 0-1 ascendentes, 2-7 cuerpo, 8-9 la cola de la g */
const GAVI_GLYPHS={
  g:['......','......','.XX.XX','XX.XXX','XX..XX','XX..XX','XX.XXX','.XX.XX','....XX','.XXXX.'],
  a:['......','......','.XXXX.','....XX','.XXXXX','XX..XX','XX.XXX','.XX.XX','......','......'],
  v:['......','......','XX..XX','XX..XX','XX..XX','XX..XX','.XXXX.','..XX..','......','......'],
  i:['XX','..','XX','XX','XX','XX','XX','XX','..','..'],
  l:['XX','XX','XX','XX','XX','XX','XX','XX','..','..'],
  n:['......','......','XX.XX.','XXX.XX','XX..XX','XX..XX','XX..XX','XX..XX','......','......'],
  b:['XX....','XX....','XX.XX.','XXX.XX','XX..XX','XX..XX','XXX.XX','XX.XX.','......','......'],
  e:['......','......','.XXXX.','XX..XX','XXXXXX','XX....','XX..XX','.XXXX.','......','......'],
};
const GAVI_R=['.XXXXX.','X.....X','X.XX..X','X.X.X.X','X.XX..X','X.X.X.X','.XXXXX.'];
function gaviLetter(ch,col){ const G=GAVI_GLYPHS[ch], w=G[0].length, c=mkCanvas(w,10), g=c.getContext('2d'); g.fillStyle=col;
  G.forEach((row,y)=>{ for(let i=0;i<w;i++) if(row[i]==='X') g.fillRect(i,y,1,1); }); return c; }
function gaviR(col){ const c=mkCanvas(7,7), g=c.getContext('2d'); g.fillStyle=col; GAVI_R.forEach((row,y)=>{ for(let i=0;i<7;i++) if(row[i]==='X') g.fillRect(i,y,1,1); }); return c; }
function gaviMark(col){ // la palabra entera, 1 px por píxel del logo (la consola de la página la usa también)
  const word='gavilanbe', L=[...word].map(ch=>gaviLetter(ch,col)), w=L.reduce((s,c)=>s+c.width+1,-1), c=mkCanvas(w,10), g=c.getContext('2d');
  let x=0; for(const l of L){ g.drawImage(l,x,0); x+=l.width+1; } return c; }
const BOOT_LAND=84, BOOT_COLS=['#e03c3c','#f08a28','#e2b818','#3ca83c','#22a0a8','#3868d8','#7048c8','#c03898','#e0487c'];
let BOOT_ART=null;
function bootArt(){ if(BOOT_ART) return BOOT_ART; let x=0;
  const L=[...'gavilanbe'].map((ch,i)=>{ const dark=gaviLetter(ch,'#0f380f'), l={x,w:dark.width,dark,col:gaviLetter(ch,BOOT_COLS[i])}; x+=dark.width+1; return l; });
  return BOOT_ART={L,w:x-1,R:gaviR('#0f380f'),R2:gaviR('#4a4a5a')}; }
function drawBoot(){
  const pressed=bootGo>0, pt=pressed?66-bootGo:0, mix=(a,b,k)=>a.map((v,i)=>Math.round(v+(b[i]-v)*k));
  // la pantalla se enciende (del gris apagado al verde) y, al pulsar, se llena de color
  let bg=mix([52,62,40],[155,188,15],Math.min(1,bootT/12)); if(pressed) bg=mix(bg,[250,246,228],clamp(pt/9,0,1));
  ctx.fillStyle='rgb('+bg+')'; ctx.fillRect(0,0,VW,VH);
  if(!pressed&&bootT<12){ ctx.fillStyle='rgba(255,255,255,'+(.25*(1-bootT/12)).toFixed(2)+')'; ctx.fillRect(0,71,VW,2); } // la raya de encendido
  const A=bootArt(), S=2, W=A.w*S, x0=Math.round(80-(W+9)/2), y=Math.min(56,-22+bootT); // baja un píxel por fotograma, como el de verdad
  A.L.forEach((l,i)=>{ let img=l.dark, dy=0;
    if(pressed){ const k=pt-i*2.4; if(k>0){ img=l.col; if(k<11) dy=-Math.round(Math.sin(k/11*Math.PI)*5); } }
    ctx.drawImage(img,0,0,l.w,10,x0+l.x*S,y+dy,l.w*S,10*S); });
  ctx.drawImage(pressed&&pt>22?A.R2:A.R,x0+W+2,y);
  if(pressed&&pt>=24&&pt<42){ const s=pt<33?(pt-24)>>1:(42-pt)>>1, cx=x0+W+5, cy=y+3; if(s>0){ ctx.fillStyle='#ffffff'; ctx.fillRect(cx-s,cy,s*2+1,1); ctx.fillRect(cx,cy-s,1,s*2+1); } } // un destello en la ®
  if(pressed) for(let i=0;i<A.L.length;i++){ const k=pt-i*2.4-3; if(k>0&&k<14){ const l=A.L[i], px=x0+l.x*S+l.w, py=y-4-k*1.2; ctx.fillStyle=BOOT_COLS[i]; ctx.fillRect(px+(i&1?k*.4:-k*.4)|0,py|0,2,2); } } // chispas de color
  if(!pressed&&bootT>=BOOT_LAND&&typeof GAME_VERSION!=='undefined') txtS('V '+GAME_VERSION.slice(0,10).replace(/\./g,'·'),157,137,'#6a8e18','right'); // la versión, como un firmware
  if(!pressed&&bootT>=BOOT_LAND+18&&((bootT-BOOT_LAND)&63)<42){
    const t=document.body.classList.contains('touch')?'TOCA PARA EMPEZAR':'PULSA '+(typeof keyName==='function'?keyName(keysNow().fire):'Z');
    txtS(t,80,104,'#306230','center'); }
  if(bootGo>0&&bootGo<22){ ctx.fillStyle='rgba(8,20,8,'+((1-bootGo/22).toFixed(2))+')'; ctx.fillRect(0,0,VW,VH); }
}
/* icono de 7×7 de cada estación: flor, sol, hoja, copo */
function seasonIcon(si,x,y){ ctx.fillStyle=PAL.k; ctx.fillRect(x,y,7,7);
  if(si===0){ ctx.fillStyle='#f8a0d0'; ctx.fillRect(x+2,y+1,3,5); ctx.fillRect(x+1,y+2,5,3); ctx.fillStyle='#f8d030'; ctx.fillRect(x+3,y+3,1,1); }
  else if(si===1){ ctx.fillStyle='#f8d030'; ctx.fillRect(x+2,y+2,3,3); ctx.fillStyle='#fff0a0'; ctx.fillRect(x+3,y+1,1,1); ctx.fillRect(x+3,y+5,1,1); ctx.fillRect(x+1,y+3,1,1); ctx.fillRect(x+5,y+3,1,1); }
  else if(si===2){ ctx.fillStyle='#e8803a'; ctx.fillRect(x+2,y+1,3,4); ctx.fillRect(x+1,y+2,5,2); ctx.fillStyle='#8a3a14'; ctx.fillRect(x+3,y+2,1,4); }
  else { ctx.fillStyle='#dff0ff'; ctx.fillRect(x+3,y+1,1,5); ctx.fillRect(x+1,y+3,5,1); ctx.fillRect(x+2,y+2,1,1); ctx.fillRect(x+4,y+2,1,1); ctx.fillRect(x+2,y+4,1,1); ctx.fillRect(x+4,y+4,1,1); } }
function drawFile(){ drawFileSelect(); }
function drawCredits(){
  // el valle gira sus estaciones mientras suben los nombres
  const si=((creditsT/420)|0)%4, w=creditsT%420;
  drawTitleScene((si+3)%4,1,0,false);
  if(creditsT<420){ ctx.save(); ctx.globalAlpha=Math.min(1,creditsT/60); drawTitleScene(si,1,0,false); ctx.restore(); }
  else if(w<40){ const r=Math.round((w/40)*(w/40)*190); ctx.save(); ctx.beginPath(); ctx.arc(80,64,r,0,6.283); ctx.clip(); drawTitleScene(si,1,0,false); ctx.restore(); }
  else drawTitleScene(si,1,0,false);
  drawParts();
  const g=ctx.createLinearGradient(0,0,160,0); g.addColorStop(0,'rgba(6,12,8,0)'); g.addColorStop(.2,'rgba(6,12,8,.62)'); g.addColorStop(.8,'rgba(6,12,8,.62)'); g.addColorStop(1,'rgba(6,12,8,0)');
  ctx.fillStyle=g; ctx.fillRect(0,0,160,144);
  const scroll=creditsT*0.5-40;
  CREDITS.forEach((ln,i)=>{ const y=140+i*11+(i?16:0)-scroll; if(y<-26||y>150) return;
    if(i===0){ const s=.62, ox=80-Math.round((19*5+21)*s/2); ctx.save(); ctx.translate(ox,y-4); ctx.scale(s,s); LOGO_GLYPHS.forEach((gl,k)=>{ ctx.drawImage(gl.img,LOGO_POS[k]-LOGO_X,gl.dy); }); ctx.restore(); return; }
    const col=ln===ln.toUpperCase()&&ln.length>3?C.flowerC:'#fffbe8'; txtO(ln,80,y,col,'center','#0a120c'); });
  if(creditsT>CREDITS.length*22+80&&(tick&31)<22){ roundBox(53,126,54,13,PAL.k); roundBox(54,127,52,11,'#2a5a30'); txtO('PULSA',58,129,'#fffbe8','left','#0c2010'); badge('Z',93,128); }
  ctx.fillStyle='#000'; ctx.fillRect(0,0,160,8); ctx.fillRect(0,136,160,8);
}
/* rayos que giran detrás de un objeto recién conseguido */
function drawRays(cx,cy,k){ ctx.save(); ctx.translate(cx,cy); ctx.rotate(tick*.02); const R=30*k;
  for(let i=0;i<10;i++){ const a=i/10*6.283; ctx.fillStyle=i&1?'rgba(255,246,192,.42)':'rgba(255,220,120,.26)'; ctx.beginPath(); ctx.moveTo(0,0); ctx.lineTo(Math.cos(a-.16)*R,Math.sin(a-.16)*R); ctx.lineTo(Math.cos(a+.16)*R,Math.sin(a+.16)*R); ctx.closePath(); ctx.fill(); }
  ctx.restore(); glowAt(cx,cy,14*k,'rgba(255,250,210,.45)'); }
/* ---------- LA PESCA CON MOSS (12c): el muelle, las sombras de los peces, el corcho, el sedal y la tarjeta ---------- */
const FISH_ICON_ROWS=["..kkkkk....",".kLLLLMk.kk","kLeLLMMMkMk","kLLLMMMMMk.","kMMMMMDDkDk",".kDDDDDk.kk","..kkkkk...."];
const FISH_ICONS=FISH.map(F=>({on:sprN(FISH_ICON_ROWS,{L:F.pal[3],M:F.pal[2],D:F.pal[1],e:PAL.k}),
  off:sprN(FISH_ICON_ROWS.map(r=>r.replace(/[LMDe]/g,'s')),{s:'#2c5238',k:'#0a1a10'})}));
function fishIcon(i,x,y,on){ ctx.drawImage(FISH_ICONS[i][on?'on':'off'],x,y); }
const BOBBER=sprN(["..k..",".kRk.","kRrRk","kWWWk",".kWk."],{R:'#e03838',r:'#ff9c88',W:'#f4f0e8'});
function pxCurve(x0,y0,cx,cy,x1,y1,col,w){ // curva cuadrática a píxeles sueltos (caña y sedal)
  const n=Math.max(4,Math.ceil(Math.hypot(x1-x0,y1-y0)*1.3)); ctx.fillStyle=col;
  for(let i=0;i<=n;i++){ const t=i/n, u=1-t; ctx.fillRect(Math.round(u*u*x0+2*u*t*cx+t*t*x1),Math.round(u*u*y0+2*u*t*cy+t*t*y1),w||1,1); } }
function pondShadow(f,i,hooked){ // la sombra de un pez bajo el agua: óvalo y cola que culebrea
  const F=FISH[f.t], L=[7,9,12,18][f.t], H=[1,2,2,3][f.t], x=Math.round(f.x), y=Math.round(f.y), fast=hooked||f.st!=='swim';
  const dir=hooked?(((tick>>2)+i)&1?1:-1):(f.vx>=0?1:-1), wig=Math.round(Math.sin((tick+i*17)*(fast?.6:.18))*(fast?1:.7));
  ctx.fillStyle=hooked?'rgba(4,14,26,.7)':F.legend?'rgba(4,10,22,.6)':'rgba(8,30,48,.4)';
  for(let yy=-H;yy<=H;yy++){ const w=Math.max(1,Math.round(L/2*Math.sqrt(1-(yy/(H+1))**2))); ctx.fillRect(x-w,y+yy,w*2,1); }
  const hl=Math.round(L/2); for(let k=1;k<=3;k++){ const cx=dir>0?x-hl-k:x+hl-1+k; ctx.fillRect(cx,y+wig-(k-1),1,k*2-1); }
  if(F.legend){ ctx.fillStyle='rgba(190,200,230,.35)'; const hx=dir>0?x+hl:x-hl-3; ctx.fillRect(hx,y-1,3,1); ctx.fillRect(hx,y+2,3,1); } } // bigotes
function fishRod(S){ // la punta de la caña: atrás al lanzar, doblada al recoger
  let x=POND.tipX, y=POND.tipY;
  if(S.phase==='cast'&&S.t<10){ const k=S.t/10; x=lerp(70,x,k*k); y=lerp(50,y,k*k); }
  if(S.phase==='reel'&&S.hooked){ const b=S.tension/100; x+=(S.hooked.x-x)*.12*b; y+=2+b*9; }
  else if(S.phase==='wait'&&S.fish.some(f=>f.st==='bite')) y+=4;
  return {x:Math.round(x),y:Math.round(y)}; }
function drawPier(){ // el muelle de Moss: tablones sobre el agua y dos postes de amarre
  const x=70, w=21, top=84;
  ctx.fillStyle='rgba(0,24,44,.32)'; ctx.fillRect(x+w,top+3,3,30); ctx.fillRect(x+2,top+30,w,2);
  for(const [px,ph] of [[x+1,7],[x+w-4,9]]){ ctx.fillStyle='rgba(216,240,255,.5)'; const r=((tick>>4)+px)&1; ctx.fillRect(px-1-r,top+ph+1,5+r*2,1); }
  ctx.fillStyle=PAL.k; ctx.fillRect(x-1,top-1,w+2,48);
  for(let yy=top;yy<top+46;yy+=5){ ctx.fillStyle='#5a3418'; ctx.fillRect(x,yy,w,5); ctx.fillStyle='#b27a42'; ctx.fillRect(x,yy,w,4); ctx.fillStyle='#d8a868'; ctx.fillRect(x,yy,w,1);
    ctx.fillStyle='#8a5a30'; ctx.fillRect(x+2+((yy*7)%11),yy+2,5,1); ctx.fillStyle='#3a2410'; ctx.fillRect(x+1,yy+2,1,1); ctx.fillRect(x+w-2,yy+2,1,1); }
  for(const px of [x-1,x+w-3]){ ctx.fillStyle=PAL.k; ctx.fillRect(px,top-6,4,9); ctx.fillStyle='#7a4e28'; ctx.fillRect(px+1,top-5,2,7); ctx.fillStyle='#b88048'; ctx.fillRect(px+1,top-5,2,1); } }
function drawFishing(){
  const S=fishS; if(!S) return; if(!pondCv) buildPond();
  ctx.drawImage(pondCv[bgFrame()],0,0);
  S.fish.forEach((f,i)=>{ if(f!==S.hooked) pondShadow(f,i,false); });
  const L=S.lure, tip=fishRod(S), bite=S.fish.some(f=>f.st==='bite');
  if(S.hooked){ const f=S.hooked; pondShadow(f,0,true); if(S.run>0&&(tick&1)){ ctx.fillStyle='#ffffff'; for(let k=0;k<3;k++) ctx.fillRect(Math.round(f.x-6+Math.random()*12),Math.round(f.y-4-Math.random()*4),1,1); } }
  drawParts();
  drawPier();
  // Moss en la orilla, con su propio corcho en el agua
  const mh=S.phase==='caught'&&((tick>>3)&1)?2:0; drawShadow(128,113,6); ctx.drawImage(MOSS_SPR,120,98-mh);
  // Sprout de espaldas en la punta del muelle, y la caña
  const tug=S.phase==='reel'&&keys.fireHeld?((tick>>2)&1):0; drawShadow(80,86,6);
  ctx.drawImage(P_SPRITES[1][0],72,70+tug);
  const hx=85, hy=80+tug, bend=S.phase==='reel'?S.tension*.1:2;
  pxCurve(hx,hy,(hx+tip.x)/2+bend*.6,(hy+tip.y)/2+bend,tip.x,tip.y,'#3a2410',2); pxCurve(hx,hy-1,(hx+tip.x)/2+bend*.6,(hy+tip.y)/2+bend-1,tip.x,tip.y-1,'#c89058',1);
  ctx.fillStyle='#e8e0c8'; ctx.fillRect(hx-2,hy+1,3,2); // el carrete
  // el sedal y el corcho
  const lineCol=S.phase==='reel'?(S.tension>80?((tick>>1)&1?'#ff5040':'#ffd0c0'):S.tension>55?'#f8d060':'#e8f0f0'):'rgba(232,240,240,.85)';
  if(S.phase==='aim'){ const sw=Math.round(Math.sin(tick*.08)*2); pxCurve(tip.x,tip.y,tip.x+sw,tip.y+6,tip.x+sw,tip.y+11,lineCol); ctx.drawImage(BOBBER,tip.x+sw-2,tip.y+11); }
  else if(S.phase==='cast'){ const bx=Math.round(L.x), by=Math.round(L.y-L.z); ctx.fillStyle='rgba(0,20,40,.35)'; ctx.fillRect(bx-2,Math.round(L.y),5,2);
    pxCurve(tip.x,tip.y,(tip.x+bx)/2,(tip.y+by)/2,bx,by-4,lineCol); ctx.drawImage(BOBBER,bx-2,by-4); }
  else if(S.phase==='wait'){ const bx=Math.round(L.x), by=Math.round(L.y);
    pxCurve(tip.x,tip.y,(tip.x+bx)/2,(tip.y+by)/2+7,bx,by-3,lineCol);
    const vis=bite||L.sink?0:L.dip>0?2:4; if(vis) ctx.drawImage(BOBBER,0,0,5,vis,bx-2,by-vis,5,vis);
    ctx.fillStyle='#d8f0ff'; ctx.fillRect(bx-2,by,5,1);
    if(bite){ const r=3+((tick>>1)&3); ctx.fillStyle='#ffffff'; for(let i=0;i<12;i++){ const a=i/12*6.283; ctx.fillRect(Math.round(bx+Math.cos(a)*r),Math.round(by+Math.sin(a)*r*.5),1,1); }
      const j=(tick>>2)&1; txtOL('!',bx-1,by-16-j,'#ffe040'); }
    else if(L.dip>0){ ctx.fillStyle='#ffffff'; ctx.fillRect(bx-4,by+1,2,1); ctx.fillRect(bx+3,by+1,2,1); } }
  else if(S.phase==='reel'&&S.hooked){ const f=S.hooked; pxCurve(tip.x,tip.y,(tip.x+f.x)/2,(tip.y+f.y)/2,Math.round(f.x),Math.round(f.y),lineCol); }
  // la diana y la parábola del lance
  if(S.phase==='aim'){ const ax=Math.round(S.aimX), ay=Math.round(S.aimY), r=6+((tick>>3)&1);
    const dot=(x,y,c)=>{ x=Math.round(x); y=Math.round(y); ctx.fillStyle='rgba(0,16,34,.55)'; ctx.fillRect(x,y+1,1,1); ctx.fillStyle=c; ctx.fillRect(x,y,1,1); };
    for(let i=1;i<9;i++){ const k=((i+(tick>>2)*.25)%9)/9; dot(lerp(tip.x,ax,k),lerp(tip.y,ay,k)-Math.sin(k*Math.PI)*22,i&1?'#fff6d0':'#c8e8f0'); }
    ctx.fillStyle='rgba(0,20,40,.3)'; ctx.fillRect(ax-4,ay-1,9,3);
    for(let i=0;i<12;i++){ const a=i/12*6.283+tick*.05; dot(ax+Math.cos(a)*r,ay+Math.sin(a)*r*.5,i&1?'#ffe040':'#fff6d0'); }
    ctx.fillStyle='rgba(0,16,34,.55)'; ctx.fillRect(ax-2,ay+1,5,1); ctx.fillStyle='#fff6d0'; ctx.fillRect(ax-2,ay,5,1); ctx.fillRect(ax,ay-2,1,5); }
  // cuaderno de pesca: los cuatro peces (arriba a la izquierda) y las bayas (arriba a la derecha)
  if(S.phase!=='caught'){ roundBox(3,3,52,11,'rgba(6,16,10,.78)'); for(let i=0;i<4;i++) fishIcon(i,5+i*12,5,!!(fishDex&fishBit(i))); }
  if(S.phase!=='caught'){ roundBox(121,3,36,11,'rgba(6,16,10,.78)'); ctx.drawImage(BERRY_SPR,124,4-(hudBerryT>8?1:0)); txtO(String(berries).padStart(3,'0'),134,5,hudBerryT>0?'#ff9cc0':'#fff6d0'); }
  // la tensión del sedal
  if(S.phase==='reel'){ const X=146+(S.tension>80&&(tick&2)?1:0), Y=22, H=62, k=S.tension/100, fh=Math.round(k*(H-2));
    roundBox(X-2,Y-2,13,H+4,PAL.k); ctx.fillStyle='#0e2016'; ctx.fillRect(X,Y,9,H); ctx.fillStyle='#401818'; ctx.fillRect(X+1,Y+1,7,Math.round(H*.2));
    ctx.fillStyle=k<.55?'#58c040':k<.8?'#f0c040':'#f04830'; ctx.fillRect(X+1,Y+H-1-fh,7,fh); ctx.fillStyle='rgba(255,255,255,.35)'; ctx.fillRect(X+1,Y+H-1-fh,2,fh);
    ctx.fillStyle='#e8e0c8'; ctx.fillRect(X+3,Y-8,3,1); ctx.fillRect(X+5,Y-7,1,3); ctx.fillRect(X+2,Y-5,1,2); ctx.fillRect(X+3,Y-4,2,1); } // anzuelo
  // mensajes
  if(S.msgT>0&&S.msg){ const big=S.msg==='¡AHORA!'||S.msg==='¡CLAVADO!', j=big&&S.msgT>S.msgT-4?0:0; txtOL(S.msg,80,big?30-((tick>>2)&1):30+j,big?'#ffe040':'#fff6d0','center'); }
  // la barra de abajo: qué hace cada botón
  const Y=PLAY_H; ctx.fillStyle=HUD.ink; ctx.fillRect(0,Y,VW,16); ctx.fillStyle=HUD.paper; ctx.fillRect(0,Y+1,VW,15); ctx.fillStyle=HUD.paperL; ctx.fillRect(0,Y+1,VW,1);
  const hints=S.phase==='aim'?[['Z','LANZAR'],['X','SALIR']]:S.phase==='cast'?[]:S.phase==='wait'?(bite?[['Z','¡CLAVA!']]:[['Z','RECOGER'],['X','SALIR']]):S.phase==='reel'?[['Z',S.tension>80?'¡SUELTA!':'MANTÉN: TIRA']]:[['Z','SEGUIR']];
  let hx2=5; for(const [b,w] of hints){ badge(b,hx2,Y+4); const hot=w[0]==='¡'; drawText(ctx,w,hx2+12,Y+5,hot&&(tick>>2)&1?'#c02818':HUD.text,'left',FONT_M); hx2+=textW(w,FONT_M)+20; }
  if(S.phase==='aim') drawText(ctx,'←↑↓→ APUNTA',VW-5,Y+6,HUD.dim,'right',FONT_S);
  else if(S.phase==='wait'&&!bite) drawText(ctx,'espera…',VW-6,Y+6,HUD.dim,'right',FONT_S);
  // la tarjeta de la captura
  if(S.phase==='caught'&&S.card){ const c=S.card, F=FISH[c.t], art=FISH_ART[c.t], age=S.t-c.t0, e=1-Math.pow(1-Math.min(1,age/12),3);
    const w=118, h=76, x=21, y=Math.round(18-(1-e)*70), best=fishBest[F.id]||0, rec=!c.first&&c.size>best;
    drawFrame(x,y,w,h,'paper'); txt(F.name,80,y+5,F.legend?'#2a2a48':'#5a3418','center');
    drawRays(80,y+30,Math.min(1,age/16)*.9);
    const aw=art.width*2, ah=art.height*2, bob=Math.round(Math.sin(age*.15)*1.5); ctx.drawImage(art,0,0,art.width,art.height,Math.round(80-aw/2),Math.round(y+30-ah/2)+bob,aw,ah);
    txt(c.size+' cm',80,y+50,'#3a2c14','center'); if(rec&&(tick>>3)&1) txtS('¡RÉCORD!',80,y+59,'#b83818','center'); else if(best&&!c.first) txtS('mejor: '+best+' cm',80,y+59,'#8a7048','center');
    ctx.drawImage(BERRY_SPR,x+6,y+h-12); drawText(ctx,'+'+c.pay,x+16,y+h-11,'#a82858','left',FONT_M);
    if(c.first){ const ry=y-10+((tick>>3)&1); roundBox(x+w-34,ry,36,11,PAL.k); roundBox(x+w-33,ry+1,34,9,'#c02828'); ctx.fillStyle='#e85050'; ctx.fillRect(x+w-32,ry+1,32,1); txtS('¡NUEVO!',x+w-16,ry+3,'#fff6d0','center'); }
    if(age>20&&(tick>>4)&1) badge('Z',x+w-24,y+h-13); }
}
/* ---------- draw() ---------- */
function draw(){
  ctx.save();
  if(shake>0&&opts.shake) ctx.translate((Math.random()*4-2)|0,(Math.random()*4-2)|0);
  ctx.fillStyle='#081408'; ctx.fillRect(-4,-4,VW+8,VH+8);
  if(state==='boot'){ drawBoot(); ctx.restore(); return; }
  if(state==='fish'||(state==='dialog'&&fishS)){ drawFishing(); if(state==='dialog'&&dlg) drawDialog(); ctx.restore(); return; } // la pesca con Moss (12c)
  if(state==='title'){ drawTitle(); ctx.restore(); return; }
  if(state==='file'){ drawFile(); ctx.restore(); return; }
  if(state==='cine'){ drawCine(); ctx.restore(); return; }
  if(state==='seasoncine'){ drawSeasonCine(); ctx.restore(); return; }
  if(state==='ending'){ drawEnding(); ctx.restore(); return; }
  if(state==='over'){ drawMarchito(); ctx.restore(); return; } // el sueño bajo tierra (15c)
  if(state==='trans'){ const k=trans.t/trans.dur, e=smooth(k), ox=-trans.dx*160*e, oy=-trans.dy*128*e;
    ctx.drawImage(trans.a,ox,oy); ctx.drawImage(trans.b,ox+trans.dx*160,oy+trans.dy*128);
    const s=P_SPRITES[player.dir][(tick>>3)&1], pxFrom=player.x+trans.dx*160, pyFrom=player.y+trans.dy*128;
    ctx.drawImage(s,(pxFrom+(player.x-pxFrom)*e)|0,(pyFrom+(player.y-pyFrom)*e)|0);
    drawUI(); drawToast(); drawZurronOut(); ctx.restore(); return; }
  if(state==='credits'){ drawCredits(); ctx.restore(); return; }
  if(state==='pause'){ drawPause(); ctx.restore(); return; }
  if(state==='dialog'&&zLore&&dlg){ drawPause(); drawDialog(); ctx.restore(); return; } // un recuerdo leído desde el zurrón
  drawScene(); drawHint(); drawUI(); drawPlaceBanner(); drawZurronOut();
  if(state==='arrive') drawArrive(); // el iris que se abre al continuar (15a)
  if(state==='present'||state==='outro') drawPresent(); // títulos, entradas y salidas (15i)
  if(state==='rite') drawRite(); // la entrega en la plaza (15f)
  if(state==='door') drawDoor(); // la travesía por una puerta, cueva o escalera (15g)
  if(state==='itemget'&&moment) drawMoment(); // el momento del arma (15d)
  else if(state==='itemget'){ const bob=Math.sin(tick*.15)*1.5; drawRays(player.x+8,player.y-9,Math.min(1,(120-itemT)/14)); ctx.drawImage(itemSpr||BLADE_SPR,(player.x+(itemSpr&&itemSpr.width===12?2:0))|0,(player.y-17+bob)|0);
    if(itemCardName){ const a=Math.min(1,(120-itemT)/12); ctx.globalAlpha=a; const y=player.y+8>56?8:88; ctx.fillStyle='rgba(5,10,7,.92)'; ctx.fillRect(8,y,144,24); ctx.strokeStyle=C.flowerC; ctx.strokeRect(8.5,y+.5,143,23);
      txtS('¡NUEVO!',80,y+4,'#9ec7aa','center'); txtO(itemCardName,80,y+12,C.flowerC,'center'); ctx.globalAlpha=1; } }
  if(saveFlash>0&&(state==='play'||state==='trans')){ ctx.globalAlpha=Math.min(1,saveFlash/12); ctx.drawImage(ACORN,148,PLAY_H-10); ctx.globalAlpha=1; }
  if(wakeT>0&&state==='play'){ if(wakeT>25) txt('z z',player.x+13,player.y-10,'#cfe8d8'); else txt('!',player.x+6,player.y-13,'#f8d0d0'); }
  if(state==='dialog'&&dlg) drawDialog();
  if(state==='shop') drawShop();
  if(state==='play'||state==='dialog') drawBossCard();
  if(state==='play'||state==='give'||state==='itemget') drawToast();
  if(fadeIn>0){ ctx.fillStyle='rgba(6,12,7,'+(fadeIn/70).toFixed(2)+')'; ctx.fillRect(0,0,VW,VH); }
  drawRebroteFx(); // rebrotar (15c): la luz que se recoge en la semilla y la savia que te protege luego
  if(state==='fall'){ ctx.fillStyle='rgba(4,4,8,'+(0.8*(1-deathT/40)).toFixed(2)+')'; ctx.fillRect(0,0,VW,PLAY_H); }
  if(state==='dying') drawWilt(); // el mundo se apaga, Sprout se marchita, la semilla baja (15c)
  ctx.restore();
}
