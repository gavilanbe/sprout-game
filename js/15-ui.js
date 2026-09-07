'use strict';
/* ---------- HUD, DIÁLOGO, MENÚS Y PANTALLAS ---------- */
function txt(s,x,y,col,align){ ctx.font='8px "Press Start 2P"'; ctx.textBaseline='top'; ctx.textAlign=align||'left'; ctx.fillStyle=col||C.uiText; ctx.fillText(s,x,y); ctx.textAlign='left'; }
function txtO(s,x,y,col,align){ ctx.font='8px "Press Start 2P"'; ctx.textBaseline='top'; ctx.textAlign=align||'left'; ctx.fillStyle=PAL.k; ctx.fillText(s,x+1,y+1); ctx.fillStyle=col||'#fffbe8'; ctx.fillText(s,x,y); ctx.textAlign='left'; }
function box(x,y,w,h,fill){ ctx.fillStyle=PAL.k; ctx.fillRect(x-1,y-1,w+2,h+2); ctx.fillStyle=fill||'#183020'; ctx.fillRect(x,y,w,h); ctx.strokeStyle=C.uiText; ctx.lineWidth=1; ctx.strokeRect(x+1.5,y+1.5,w-3,h-3); }
const X_ICON={bomb:BOMB_SPR,hook:HOOK_SPR,boomer:BOOMER_SPR,lantern:LANTERN_SPR,feather:FEATHER_SPR};
const X_NAME={bomb:'BELLOTA-BOMBA',hook:'RAÍZ-GANCHO',boomer:'VAINA VOLADORA',lantern:'FAROL DE BRASA',feather:'VILANO'};
function panel(x,y,w,h){ // panel biselado del HUD
  ctx.fillStyle='#050a06'; ctx.fillRect(x,y,w,h); ctx.fillStyle='#0e1a12'; ctx.fillRect(x+1,y+1,w-2,h-2);
  ctx.fillStyle='#243a2a'; ctx.fillRect(x+1,y+1,w-2,1); ctx.fillRect(x+1,y+1,1,h-2); }
function badge(ch,x,y){ ctx.fillStyle=PAL.k; ctx.fillRect(x-1,y-1,9,9); ctx.fillStyle='#e8b050'; ctx.fillRect(x,y,7,7); ctx.fillStyle='#fff0a0'; ctx.fillRect(x,y,7,1); ctx.save(); ctx.translate(x+1,y+1); ctx.scale(.75,.75); txt(ch,0,0,PAL.k); ctx.restore(); }
function drawUI(){
  // barra: dos tonos con línea de luz arriba
  ctx.fillStyle='#0c160e'; ctx.fillRect(0,PLAY_H,VW,16); ctx.fillStyle='#132218'; ctx.fillRect(0,PLAY_H,VW,8);
  ctx.fillStyle='#2a4a34'; ctx.fillRect(0,PLAY_H,VW,1); ctx.fillStyle='#050a06'; ctx.fillRect(0,PLAY_H+15,VW,1);
  // corazones: hasta 10 en dos filas; palpitan cuando queda poco; tiemblan al recibir daño
  const hearts=player.maxHp/2, low=player.hp<=2, pulse=low&&((tick>>3)&1)?1:0, shk=hudHurtT>0?((tick&2)?1:-1):0;
  panel(1,PLAY_H+1,hearts>5?47:(hearts*8+6),14);
  for(let i=0;i<hearts;i++){ const v=player.hp-i*2, hx=4+(i%5)*8+shk, hy=PLAY_H+(hearts>5?(i<5?2:8):5)-(v>0&&pulse?1:0);
    ctx.drawImage(v>=2?HEART_FULL:v===1?HEART_HALF:HEART_EMPTY,hx,hy,hearts>5?7:8,hearts>5?7:8); }
  if(low&&(tick&15)<8){ ctx.fillStyle='rgba(232,72,72,.18)'; ctx.fillRect(1,PLAY_H+1,hearts>5?47:(hearts*8+6),14); }
  // ranuras Z y X
  const zx=56; panel(zx,PLAY_H+1,16,14); panel(zx+18,PLAY_H+1,16,14);
  if(hasBlade){ ctx.drawImage(LEAF_SWING,0,0,16,7,zx+1,PLAY_H+3,14,6); for(let i=0;i<3;i++){ ctx.fillStyle=i<bladeLvl?'#a8ec78':'#2a4a34'; ctx.fillRect(zx+4+i*3,PLAY_H+11,2,2); } }
  else { ctx.fillStyle='#2a4a34'; ctx.fillRect(zx+7,PLAY_H+7,2,2); }
  badge('Z',zx-1,PLAY_H+9);
  if(xItem){ if(xFlash>0&&(tick&2)){ ctx.fillStyle='#fffbe8'; ctx.fillRect(zx+19,PLAY_H+2,14,12); } ctx.drawImage(X_ICON[xItem],1,1,14,14,zx+19,PLAY_H+1,14,14); }
  else { ctx.strokeStyle='#2a4a34'; ctx.setLineDash([1,1]); ctx.strokeRect(zx+21.5,PLAY_H+3.5,9,9); ctx.setLineDash([]); }
  badge('X',zx+17,PLAY_H+9);
  // contadores
  panel(92,PLAY_H+1,66,14);
  const by=hudBerryT>8?-1:0; ctx.drawImage(BERRY_SPR,95,PLAY_H+4+by); txt(String(berries).padStart(3,'0'),104,PLAY_H+4+by,hudBerryT>0?'#fffbe8':'#e8d8b0');
  const dk=dungeonOf(sx,sy);
  if(dk){ ctx.drawImage(KEY_SPR,128,PLAY_H+4); txt(''+(dungeonKeys[dk]||0),136,PLAY_H+4,'#e8d8b0'); if(bigKeys[dk]) ctx.drawImage(BIGKEY_SPR,0,0,12,10,146,PLAY_H+3,10,9); }
  else if(!won){ const sy2=hudSeedT>0&&(tick&4)?-1:0; ctx.drawImage(ACORN_GOLD,127,PLAY_H+4+sy2); txt(seeds+'/8',135,PLAY_H+4,hudSeedT>0?'#fffbe8':'#e8d8b0'); }
  else { let ex=131; for(const a of equipped){ if(a) ctx.drawImage(AMULET_SPR[a],0,0,12,12,ex,PLAY_H+2,11,11); else { ctx.strokeStyle='#2a4a34'; ctx.strokeRect(ex+1.5,PLAY_H+3.5,8,8); } ex+=13; } }
}
/* burbuja «Z» sobre lo que se puede usar */
const HINT_CH=new Set(['S','O','Ⓑ','Ω','¤','D','G','[',']','}','E','h','j','y','g','ö','ñ',')','Ł','P']);
function drawHint(){
  if(state!=='play'||boss||midboss||inBed) return;
  const ft=facingTile(); if(!ft) return; const [tx,ty,ch]=ft;
  const guest=npcs.some(n=>n.guest&&n.x===tx&&n.y===ty);
  if(!HINT_CH.has(ch)&&!guest) return;
  const bx=tx*16+5, by=ty*16-9+((tick&15)<8?0:1);
  ctx.fillStyle=PAL.k; ctx.fillRect(bx-1,by-1,9,9); ctx.fillRect(bx+2,by+8,3,1); ctx.fillStyle='#fffbe8'; ctx.fillRect(bx,by,7,7); ctx.fillStyle=PAL.k; ctx.fillRect(bx+3,by+8,1,1);
  ctx.save(); ctx.translate(bx+1,by+1); ctx.scale(.75,.75); txt('Z',0,0,PAL.k); ctx.restore();
}
/* cartel del lugar recién descubierto */
function drawPlaceBanner(){
  if(!placeBanner||bossCard||toast) return; const a=Math.max(0,Math.min(1,(110-placeBanner.t)/10,placeBanner.t/20)); ctx.globalAlpha=a;
  const w=placeBanner.txt.length*6+14; ctx.fillStyle='rgba(5,10,7,.85)'; ctx.fillRect(80-w/2,4,w,12); ctx.fillStyle=C.flowerC; ctx.fillRect(80-w/2,4,2,12); ctx.fillRect(80+w/2-2,4,2,12);
  ctx.save(); ctx.translate(80,7); ctx.scale(.75,.75); txt(placeBanner.txt,0,0,'#fffbe8','center'); ctx.restore(); ctx.globalAlpha=1;
}
/* marcos de texto: cada clase de texto tiene su piel */
const FRAMES={
  normal:{bg:'#183020',bg2:'#132818',border:C.uiText,inner:'#2a4a34',text:C.uiText,key:C.flowerC,name:'#0e2014'},
  wood:{bg:'#8a5828',bg2:'#7a4c20',border:'#e0a868',inner:'#5a3418',text:'#f8ecc8',key:'#ffe9a0',name:'#5a3418'},
  stone:{bg:'#3a3448',bg2:'#302a3e',border:'#a8b0c8',inner:'#5a5470',text:'#dff0ff',key:'#58e8d8',name:'#262030'},
  paper:{bg:'#e8d8a8',bg2:'#dcc898',border:'#8a6a30',inner:'#c8b078',text:'#3a2c14',key:'#8a3818',name:'#c8b078'},
  letter:{bg:'#c8d8e8',bg2:'#b8cce0',border:'#3a5a8a',inner:'#8aa0c0',text:'#1c2c48',key:'#2858b0',name:'#8aa0c0'},
};
function drawFrame(x,y,w,h,st){
  const F=FRAMES[st]||FRAMES.normal;
  ctx.fillStyle='rgba(0,0,0,.35)'; ctx.fillRect(x+1,y+2,w+2,h+2);           // sombra
  ctx.fillStyle=PAL.k; ctx.fillRect(x-1,y-1,w+2,h+2);
  ctx.fillStyle=F.bg; ctx.fillRect(x,y,w,h);
  ctx.fillStyle=F.bg2; for(let yy=y+2;yy<y+h-2;yy+=2) ctx.fillRect(x+2,yy,w-4,1);   // trama de líneas
  ctx.fillStyle=F.bg; ctx.fillRect(x+3,y+3,w-6,h-6);
  ctx.strokeStyle=F.border; ctx.lineWidth=1; ctx.strokeRect(x+1.5,y+1.5,w-3,h-3);
  ctx.strokeStyle=F.inner; ctx.strokeRect(x+3.5,y+3.5,w-7,h-7);
  ctx.fillStyle=F.border; // esquinas: hojitas
  for(const [cx,cy] of [[x+1,y+1],[x+w-4,y+1],[x+1,y+h-4],[x+w-4,y+h-4]]){ ctx.fillRect(cx,cy,3,3); ctx.fillStyle=F.bg; ctx.fillRect(cx+1,cy+1,1,1); ctx.fillStyle=F.border; }
  if(st==='wood'){ ctx.fillStyle='#5a3418'; ctx.fillRect(x+3,y+3,1,1); ctx.fillRect(x+w-4,y+3,1,1); ctx.fillRect(x+3,y+h-4,1,1); ctx.fillRect(x+w-4,y+h-4,1,1); }
  return F;
}
/* texto con palabras clave (MAYÚSCULAS, números) en color, carácter a carácter */
function drawRichLine(ln,x,y,budget,F){
  ctx.font='8px "Press Start 2P"'; ctx.textBaseline='top'; ctx.textAlign='left';
  const keyAt=new Array(ln.length).fill(false);
  ln.replace(/[A-ZÁÉÍÓÚÑ][A-ZÁÉÍÓÚÑ\-]{2,}|\d+\/\d+|\b\d+\b/g,(m,off)=>{ for(let i=0;i<m.length;i++) keyAt[off+i]=true; return m; });
  const n=Math.min(ln.length,budget);
  for(let i=0;i<n;i++){ const c=ln[i]; if(c===' ') continue; ctx.fillStyle=keyAt[i]?F.key:F.text; ctx.fillText(c,x+i*8,y); }
}
function drawDialog(){
  const full=dlg.pages[dlg.page], lines=full.split('\n');
  const x=4, w=152, h=46, y=(player.y+8>56)?6:78;
  const F=drawFrame(x,y,w,h,dlg.style);
  const por=dlg.who&&PORTRAITS[dlg.who], talking=dlg.chars<full.length;
  if(por){ const bob=talking&&((tick>>3)&1)?1:0;
    ctx.fillStyle=PAL.k; ctx.fillRect(x+4,y+4,38,38); ctx.fillStyle='#0e2014'; ctx.fillRect(x+5,y+5,36,36);
    ctx.fillStyle='#183020'; ctx.fillRect(x+5,y+23,36,18);
    ctx.drawImage(por,0,0,por.width,por.height,x+7,y+7+bob,32,32);
    ctx.strokeStyle=C.flowerC; ctx.strokeRect(x+4.5,y+4.5,37,37); }
  if(dlg.who){ const nw=dlg.who.length*8+10, py=(y===78)?y-11:y+h+2; ctx.fillStyle=PAL.k; ctx.fillRect(x+3,py,nw+2,12); ctx.fillStyle=F.name; ctx.fillRect(x+4,py+1,nw,10); ctx.fillStyle=C.flowerC; ctx.fillRect(x+4,py+1,2,10); txt(dlg.who,x+9,py+2,C.flowerC); }
  const tx0=por?x+46:x+7; let budget=dlg.chars|0;
  lines.forEach((ln,i)=>{ if(budget<=0) return; drawRichLine(ln,tx0,y+7+i*12,budget,F); budget-=ln.length+1; });
  if((dlg.chars|0)>=full.length){
    if(dlg.ask&&dlg.page===dlg.pages.length-1){ // elección: cursor entre Sí y No
      const ox=x+w-70, oy=y+h-13; ctx.fillStyle=F.bg2; ctx.fillRect(ox-3,oy-2,66,12);
      ['Sí','No'].forEach((o,i)=>{ const sel=dlg.sel===i; if(sel) ctx.drawImage(ACORN,ox+i*36-2+((tick&15)<8?0:1),oy); txt(o,ox+i*36+8,oy+1,sel?F.key:F.text); }); }
    else if((tick&31)<20){ ctx.drawImage(ACORN,x+w-13,y+h-11+((tick&15)<8?0:1)); } }
}
const BOSS_SUB={'EL TOPO REAL':'guardián de la Brasa','LA REINA AVISPA':'guardiana de la Lágrima','EL VIENTO DEL NORTE':'hermano del Roble','EL ESCARABAJO REY':'morro de hierro','EL ZÁNGANO CAPITÁN':'aguijón del panal','EL GUARDIÁN DE HIELO':'roca que no siente'};
function drawBossCard(){ if(!bossCard) return;
  const a=Math.max(0,Math.min(1,(130-bossCard.t)/10,bossCard.t/30)); ctx.globalAlpha=a;
  const w=Math.min(160,20+(130-bossCard.t)*12);
  ctx.fillStyle='rgba(5,8,10,.9)'; ctx.fillRect(80-w/2,28,w,28); ctx.fillStyle='#e84848'; ctx.fillRect(80-w/2,28,w,1); ctx.fillRect(80-w/2,55,w,1);
  txt(bossCard.txt,80,33,'#fffbe8','center'); ctx.save(); ctx.translate(80,45); ctx.scale(.75,.75); txt(BOSS_SUB[bossCard.txt]||'',0,0,'#e8b050','center'); ctx.restore(); ctx.globalAlpha=1; }
function drawToast(){ if(!toast) return;
  const a=Math.max(0,Math.min(1,(140-toast.t)/8,toast.t/14)); ctx.globalAlpha=a; const h=toast.t2?24:14;
  ctx.fillStyle='rgba(5,10,7,.92)'; ctx.fillRect(8,3,144,h); ctx.strokeStyle=C.flowerC; ctx.lineWidth=1; ctx.strokeRect(8.5,3.5,143,h-1);
  ctx.fillStyle=C.flowerC; ctx.fillRect(8,3,3,h); ctx.drawImage(ACORN,13,h>14?9:6);
  txt(toast.t1,84,6,C.flowerC,'center'); if(toast.t2) txt(toast.t2,84,16,C.uiText,'center'); ctx.globalAlpha=1; }
function drawShop(){
  drawFrame(6,4,148,118,shopKind==='corteza'?'stone':'wood');
  txt(shopKind==='corteza'?'CABAÑA DE CORTEZA':'TIENDA DE TILO',80,10,C.flowerC,'center');
  ctx.drawImage(BERRY_SPR,116,20); txt('x'+berries,126,21);
  const L=shopList(); const SI={b2:LEAF_SWING,b3:LEAF_SWING,bmax:LEAF_SWING,spin:SPIN_ICON,shield:SHIELD_SPR,lantern:LANTERN_SPR,hp:HEART_FULL,piece:PIECE_SPR,am_savia:AMULET_SPR.savia,am_musgo:AMULET_SPR.musgo,ok:AMULET_SPR.savia,ok2:AMULET_SPR.musgo};
  L.forEach((it,i)=>{ const y=33+i*11, sel=i===shopSel; if(sel&&(tick&31)<24) ctx.drawImage(ACORN,2,y);
    const ic=SI[it.id]; if(ic){ ctx.save(); if(it.off) ctx.globalAlpha=.4; if(ic.width>12) ctx.drawImage(ic,0,0,ic.width,ic.height,10,y-1,10,10); else ctx.drawImage(ic,10,y); ctx.restore(); }
    txt(it.name,22,y,it.off?'#9a8a70':(sel?'#fffbe8':'#e8d8b0'));
    if(it.cost>0){ ctx.drawImage(BERRY_SPR,126,y-1); txt(''+it.cost,136,y,berries>=it.cost?C.flowerC:'#ff9090'); } });
  ctx.fillStyle='rgba(0,0,0,.35)'; ctx.fillRect(12,92,136,18);
  const it=L[shopSel]; wrapText((it.off&&it.dOff)?it.dOff:it.d,16).slice(0,2).forEach((ln,i)=>txt(ln,16,94+i*9,'#f8ecc8'));
  if((tick&95)<60) txt('Z:comprar X:salir',80,113,'#e8d8b0','center');
}
/* ---------- EL ZURRÓN ---------- */
const PAUSE_TABS=[['zurron','ZURRÓN'],['mapa','MAPA'],['valle','EL VALLE'],['recuerdos','RECUERDOS'],['ajustes','AJUSTES']];
function pauseFrame(){
  ctx.fillStyle='#0a160e'; ctx.fillRect(0,0,160,144);
  for(let y=0;y<144;y+=8) for(let x=((y>>3)&1)*8;x<160;x+=16){ ctx.fillStyle='#0c1a10'; ctx.fillRect(x,y,8,8); }
  // pestañas con icono; la activa muestra su nombre
  PAUSE_TABS.forEach(([ic,name],i)=>{ const x=4+i*17, on=i===pausePage; ctx.fillStyle=on?'#1b3a26':'#0e2014'; ctx.fillRect(x,2,15,15); ctx.strokeStyle=on?C.flowerC:'#2a4a34'; ctx.strokeRect(x+.5,2.5,14,14); ctx.drawImage(TAB_ICONS[ic],x+3,5); });
  ctx.fillStyle='#0e2014'; ctx.fillRect(92,2,64,15); ctx.strokeStyle='#2a4a34'; ctx.strokeRect(92.5,2.5,63,14); txt(PAUSE_TABS[pausePage][1],124,6,C.flowerC,'center');
  ctx.fillStyle='#2a4a34'; ctx.fillRect(4,19,152,1);
}
function selFrame(x,y,w,h){ // marco de selección dorado que respira
  const p=(tick&15)<8?0:1; ctx.strokeStyle=C.flowerC; ctx.lineWidth=1; ctx.strokeRect(x-p+.5,y-p+.5,w+p*2-1,h+p*2-1);
  ctx.fillStyle=C.flowerC; for(const [cx,cy] of [[x-p-1,y-p-1],[x+w+p-1,y-p-1],[x-p-1,y+h+p-1],[x+w+p-1,y+h+p-1]]) ctx.fillRect(cx,cy,2,2); }
function drawPause(){
  pauseFrame();
  ctx.save(); if(tabSlide>0){ ctx.globalAlpha=1-tabSlide/8; ctx.translate(tabSlide*3,0); }
  if(pausePage===0) drawBag(); else if(pausePage===1) drawMap(); else if(pausePage===2) drawValle(); else if(pausePage===3) drawLore(); else drawOptions();
  ctx.restore();
  ctx.fillStyle='#2a4a34'; ctx.fillRect(4,132,152,1);
  const hint=pausePage===0?'Z equipar · X pestaña':pausePage===3?'Z leer · X pestaña':pausePage===4?'Z cambiar · X pestaña':'X pestaña · ENTER salir';
  ctx.save(); ctx.translate(80,136); ctx.scale(.75,.75); txt(hint,0,0,'#5d8a6b','center'); ctx.restore();
}
function drawBag(){
  const items=ownedX(), am=[...amulets];
  txt('OBJETOS · X',6,23,'#7fae8c'); ctx.drawImage(LEAF_SWING,0,0,16,7,124,24,16,7); txt('x'+bladeLvl,142,23,'#7fae8c');
  for(let i=0;i<5;i++){ const x=6+i*30, y=32, it=items[i]; ctx.fillStyle='#0e2014'; ctx.fillRect(x,y,26,22); ctx.strokeStyle=it&&xItem===it?C.flowerC:'#2a4a34'; ctx.strokeRect(x+.5,y+.5,25,21);
    if(it){ ctx.drawImage(X_ICON[it],x+5,y+3); if(xItem===it){ ctx.fillStyle=C.flowerC; ctx.fillRect(x+18,y+14,7,7); txt('X',x+18,y+14,PAL.k); } }
    if(pauseSel===i&&i<items.length) selFrame(x,y,26,22); }
  txt('AMULETOS',6,60,'#7fae8c'); for(let r=0;r<2;r++){ const id=equipped[r]; ctx.fillStyle='#0e2014'; ctx.beginPath(); ctx.arc(126+r*14,64,6,0,6.283); ctx.fill(); ctx.strokeStyle=id?C.flowerC:'#2a4a34'; ctx.stroke(); if(id) ctx.drawImage(AMULET_SPR[id],0,0,12,10,121+r*14,59,10,9); }
  for(let i=0;i<10;i++){ const x=6+(i%5)*30, y=69+((i/5)|0)*18, id=am[i]; ctx.fillStyle='#0e2014'; ctx.fillRect(x,y,26,15); const eq=id&&equipped.includes(id);
    ctx.strokeStyle=eq?C.flowerC:'#2a4a34'; ctx.strokeRect(x+.5,y+.5,25,14);
    if(id){ ctx.drawImage(AMULET_SPR[id],x+2,y+1); if(eq){ ctx.fillStyle=C.flowerC; ctx.fillRect(x+17,y+7,8,7); ctx.save(); ctx.translate(x+18,y+8); ctx.scale(.75,.75); txt('E',0,0,PAL.k); ctx.restore(); } }
    if(pauseSel===items.length+i&&i<am.length) selFrame(x,y,26,15); }
  ctx.fillStyle='#13241a'; ctx.fillRect(6,107,148,24); ctx.fillStyle='#0e2014'; ctx.fillRect(7,108,28,22);
  let name='',desc='',art=null;
  if(pauseSel<items.length){ name=X_NAME[items[pauseSel]]; art=X_ICON[items[pauseSel]]; desc={bomb:'Planta una bomba. Rompe rocas y muros.',hook:'Cruza agua y se agarra a postes.',boomer:'Vuela, aturde y trae cosas.',lantern:'Enciende antorchas. Alumbra cuevas.',feather:'Salta agujeros y vacíos.'}[items[pauseSel]]; }
  else if(am[pauseSel-items.length]){ const id=am[pauseSel-items.length], a=AMULETS[id]; name=a.name; art=AMULET_SPR[id]; desc=a.desc.replace(/\n/g,' ')+(equipped.includes(id)?' (equipado)':''); }
  else { name='ZURRÓN VACÍO'; desc='Explora el valle: habla, corta, busca.'; }
  if(art){ const bob=(tick&15)<8?0:1; ctx.drawImage(art,0,0,art.width,art.height,21-art.width,119-art.height+bob,art.width*2,art.height*2); }
  if(name.length>14){ ctx.save(); ctx.translate(38,110); ctx.scale(.75,.75); txt(name,0,0,C.flowerC); ctx.restore(); } else txt(name,38,109,C.flowerC);
  ctx.save(); ctx.translate(38,119); ctx.scale(.75,.75); wrapText(desc,19).slice(0,2).forEach((ln,i)=>txt(ln,0,i*10,'#9ec7aa')); ctx.restore();
}
function drawMap(){
  const cw=18,chh=14,ox=80-(5*cw)/2-1,oy=22;
  ctx.fillStyle='#0e2014'; ctx.fillRect(ox-3,oy-3,5*cw+7,7*chh+7); ctx.strokeStyle='#2a4a34'; ctx.strokeRect(ox-2.5,oy-2.5,5*cw+6,7*chh+6);
  for(let y=-3;y<=3;y++) for(let x=0;x<=4;x++){ const key=x+','+y; const px=ox+x*cw, py=oy+(y+3)*chh;
    if(!MAPS[key]) continue;
    const seen=visited.has(key), here=sx===x&&sy===y;
    if(seen){ const th=ensureThumb(key); if(th) ctx.drawImage(th,px,py); else { ctx.fillStyle='#3a7a40'; ctx.fillRect(px,py,cw,chh); }
      ctx.fillStyle='rgba(0,0,0,.25)'; ctx.fillRect(px,py+chh-1,cw,1); ctx.fillRect(px+cw-1,py,1,chh);
      if(key==='1,1') ctx.drawImage(OAK,0,0,OAK.width,OAK.height,px+4,py+1,10,11);
      if(key==='2,-1'||key==='1,3'||key==='1,-2'||key==='0,0'){ ctx.fillStyle=PAL.k; ctx.fillRect(px+6,py+4,6,6); ctx.fillStyle='#3a3448'; ctx.fillRect(px+7,py+5,4,2); ctx.fillStyle=(key==='2,-1'&&bossDone)||(key==='1,3'&&boss2Done)||(key==='1,-2'&&boss3Done)?'#a8ec78':'#e84848'; ctx.fillRect(px+8,py+8,2,1); }
      if(key==='0,1'){ ctx.fillStyle='#d84838'; ctx.fillRect(px+3,py+4,4,3); ctx.fillRect(px+10,py+4,4,3); }
      if(key==='1,-3'&&boss3Done) ctx.drawImage(FLAKE_SPR,0,0,16,16,px+5,py+2,9,9); }
    else { ctx.fillStyle='#132419'; ctx.fillRect(px,py,cw,chh); ctx.fillStyle='#1d3324'; ctx.fillRect(px+8,py+6,2,2); }
    if(here){ selFrame(px,py,cw,chh); if((tick&15)<10) ctx.drawImage(P_SPRITES[0][0],4,4,8,8,px+5,py+2,9,9); }
  }
  const where=PLACE_NAMES[sx+','+sy]||'?'; ctx.save(); ctx.translate(6,124); ctx.scale(.75,.75); txt(where,0,0,'#9ec7aa'); ctx.restore();
}
function drawValle(){
  txt(CHAPTER_NAMES[chapterIdx()],80,23,C.flowerC,'center');
  const X=92;
  txt('SEMILLAS',6,36,'#7fae8c'); for(let i=0;i<8;i++){ const on=won||i<seeds; ctx.save(); if(!on) ctx.globalAlpha=.25; ctx.drawImage(ACORN_GOLD,X+i*8,35); ctx.restore(); }
  txt('ESTACIONES',6,50,'#7fae8c');
  [[EMBER_SPR,thawed],[TEAR_SPR,summered],[FLAKE_SPR,cycled]].forEach(([sp,on],i)=>{ const x=X+i*20; ctx.save(); if(!on) ctx.globalAlpha=.25; ctx.drawImage(sp,0,0,16,16,x,46,14,14); ctx.restore(); });
  txt('VIGOR',6,66,'#7fae8c'); ctx.drawImage(HEART_FULL,X,65); txt(''+(player.maxHp/2),X+10,66);
  for(let i=0;i<4;i++){ ctx.fillStyle=i<pieces?PAL.R:'#384038'; ctx.beginPath(); ctx.moveTo(X+34,70); ctx.arc(X+34,70,5,i*Math.PI/2-Math.PI/2,(i+1)*Math.PI/2-Math.PI/2); ctx.fill(); }
  ctx.save(); ctx.translate(X+43,66); ctx.scale(.75,.75); txt(pieces+'/4',0,0,'#9ec7aa'); ctx.restore();
  txt('AMULETOS',6,80,'#7fae8c'); txt(amulets.size+'/9',X,80); txt('CARTAS',6,92,'#7fae8c'); ctx.drawImage(LETTER_SPR,X,93); txt(lettersCount()+'/5',X+15,92);
  txt('TIEMPO',6,104,'#7fae8c'); txt(timeStr(playTime),X,104); txt('MARCHITADO',6,116,'#7fae8c'); txt(wilts+' veces',X,116);
}
function drawLore(){
  const L=loreList();
  if(!L.length){ txt('Aún no has leído',80,50,'#5d8a6b','center'); txt('nada. Busca diarios,',80,60,'#5d8a6b','center'); txt('runas, libros y cartas.',80,70,'#5d8a6b','center'); return; }
  const rows=9, top=Math.max(0,Math.min(loreSel-4,L.length-rows));
  ctx.save(); ctx.translate(154,23); ctx.scale(.75,.75); txt((loreSel+1)+'/'+L.length,0,0,'#5d8a6b','right'); ctx.restore();
  for(let i=0;i<rows;i++){ const e=L[top+i]; if(!e) break; const y=32+i*11, sel=top+i===loreSel;
    if(sel){ ctx.fillStyle='#1b3a26'; ctx.fillRect(6,y-2,148,11); selFrame(6,y-2,148,11); ctx.drawImage(ACORN,8,y-1); }
    const ic=e.kind==='diario'?DIARY_SPR:e.kind==='carta'?LETTER_SPR:e.kind==='runa'?runeTile(0):bookshelfTile();
    if(e.kind==='runa'||e.kind==='libro') ctx.drawImage(ic,0,0,16,16,18,y-1,9,9); else ctx.drawImage(ic,0,0,ic.width,ic.height,18,y,8,7);
    ctx.save(); ctx.translate(30,y+1); ctx.scale(.75,.75); txt(e.title.length>21?e.title.slice(0,20)+'…':e.title,0,0,sel?C.uiText:'#9ec7aa'); ctx.restore(); }
}
function drawOptions(){
  const rows=[['Texto',opts.textSpeed===2?'RÁPIDO':'NORMAL'],['Temblor',opts.shake?'SÍ':'NO'],['Música',musicOn?'SÍ':'NO'],['Volver al título','']];
  rows.forEach(([n,v],i)=>{ const y=34+i*16, sel=i===optSel; if(sel){ ctx.fillStyle='#1b3a26'; ctx.fillRect(6,y-3,148,14); ctx.drawImage(ACORN,8,y-1); }
    txt(n,20,y,sel?C.uiText:'#9ec7aa'); if(v) txt(v,150,y,C.flowerC,'right'); if(sel) selFrame(6,y-3,148,14); });
  ctx.save(); ctx.translate(80,100); ctx.scale(.75,.75); txt('Ranura '+(curSlot+1)+' · '+visited.size+' lugares',0,0,'#5d8a6b','center'); txt('Guardado automático',0,11,'#5d8a6b','center'); txt('al cambiar de pantalla',0,22,'#5d8a6b','center'); ctx.restore();
}
/* ---------- CINEMÁTICA, TÍTULO, ARCHIVOS, ENCENDIDO ---------- */
function drawCine(){
  ctx.fillStyle='#060c07'; ctx.fillRect(0,0,VW,VH);
  for(const p of parts){ ctx.fillStyle=p.col; ctx.fillRect(p.x|0,p.y|0,2,1); }
  const k=cineFold>0?(cineFold>12?(24-cineFold)/12:cineFold/12):0, folding=cineFold>12, cx=80, cy=72;
  ctx.fillStyle='rgba(0,0,0,.35)'; ctx.fillRect((cx-73*(1-k*.5))|0,128,(146*(1-k*.5))|0,3);
  ctx.save(); ctx.translate(cx,cy); ctx.rotate(0.10*k*(folding?1:-1));
  const syy=Math.max(0.06,1-0.94*smooth(k)); ctx.scale(1-0.05*k,syy);
  if(cineFold===0) ctx.rotate(Math.sin(tick*.02)*0.012);
  ctx.drawImage(LEAF_PAGE,-(LEAF_PAGE.width>>1),-(LEAF_PAGE.height>>1));
  if(k<0.9){ ctx.globalAlpha=1-k*.7; drawCinePanel(cinePage,-42,-46); ctx.font='8px "Press Start 2P"'; ctx.textAlign='center'; ctx.textBaseline='top'; ctx.fillStyle='#4a4418';
    const lines=CINE[cinePage].slice(0,cineChars|0).split('\n'); const y0=2; lines.forEach((ln,i)=>ctx.fillText(ln,0,y0+i*11)); ctx.globalAlpha=1; }
  ctx.restore();
  if(cineFold===0&&(cineChars|0)>=CINE[cinePage].length&&(tick&31)<20) txt('Z',80,130,'#9ed86a','center');
}
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
function titlePanOff(){ const travel=Math.max(0,(titleBgOk?TITLE_BG.height:VH)-VH); const k=Math.min(1,titleT/TITLE_PAN_D), e=1-(1-k)*(1-k)*(1-k); return -travel*(1-e); }
function drawTitleBg(){
  if(titleBgOk){ ctx.drawImage(TITLE_BG,0,titlePanOff()|0); return; }
  ctx.fillStyle='#5088dc'; ctx.fillRect(0,0,160,60); ctx.fillStyle='#86c0f0'; ctx.fillRect(0,30,160,50);
  ctx.fillStyle='#78c050'; ctx.fillRect(0,80,160,64); ctx.drawImage(OAK,80-(OAK.width>>1),50);
}
function drawBoot(){
  ctx.fillStyle='#9bbc3f'; ctx.fillRect(0,0,VW,VH); ctx.fillStyle='rgba(255,255,255,.05)'; for(let y=0;y<VH;y+=2) ctx.fillRect(0,y,VW,1);
  const k=Math.min(1,bootT/45), y=(-12+78*k)|0;
  if(fontsReady){ txt('NAHUELGABE',80,y,'#0f380f','center');
    if(k>=1){ ctx.save(); ctx.translate(124,y-3); ctx.scale(.5,.5); ctx.font='8px "Press Start 2P"'; ctx.fillStyle='#0f380f'; ctx.fillText('TM',0,0); ctx.restore();
      if(bootGo===0&&bootT>140&&(tick&63)<36) txt('Z',80,118,'#306230','center'); } }
  if(bootGo>0&&bootGo<22){ ctx.fillStyle='rgba(8,20,8,'+((1-bootGo/22).toFixed(2))+')'; ctx.fillRect(0,0,VW,VH); }
}
function drawTitle(){
  drawTitleBg();
  for(const p of parts){ ctx.fillStyle=p.col; ctx.fillRect(p.x|0,p.y|0,2,2); }
  const eachGlyph=(fn)=>{ LOGO_GLYPHS.forEach((gl,i)=>{ const k=(titleT-(TITLE_T0+i*TITLE_STAG))/TITLE_DUR; if(k<0) return; const y=LOGO_Y+gl.dy+(k>=1?0:-(1-easeOutBack(k))*52); fn(gl,i,LOGO_POS[i],y|0); }); };
  if(titleT>=TITLE_LEAF0){ const FX=24, FY=1, lk=Math.min(1,(titleT-TITLE_LEAF0)/TITLE_LEAFD);
    if(lk<1){ const ye=1-(1-lk)*(1-lk), ph=lk*Math.PI*4.6, amp=30*(1-lk), cx=FX+56+Math.sin(ph)*amp, cy=-40+(FY+33+40)*ye, rot=Math.cos(ph)*0.42*(1-lk*0.7);
      ctx.save(); ctx.translate(cx|0,cy|0); ctx.rotate(rot); ctx.drawImage(LEAF_BLADE,-56,-33); ctx.restore(); } else ctx.drawImage(LEAF_BLADE,FX,FY); }
  eachGlyph((gl,i,x,y)=>{ ctx.drawImage(gl.dark,x+1,y+2); }); eachGlyph((gl,i,x,y)=>{ ctx.drawImage(gl.img,x,y); });
  if(titleT>=TITLE_SHINE){ const cyc=(titleT-TITLE_SHINE)%190;
    if(cyc<34){ const gx=22+(cyc/34)*126; ctx.save(); ctx.beginPath(); ctx.moveTo(gx,LOGO_Y-4); ctx.lineTo(gx+9,LOGO_Y-4); ctx.lineTo(gx-5,LOGO_Y+24); ctx.lineTo(gx-14,LOGO_Y+24); ctx.closePath(); ctx.clip(); eachGlyph((gl,i,x,y)=>{ ctx.drawImage(gl.white,x,y); }); ctx.restore(); }
    else if(cyc<54){ const s=cyc<44?(cyc-34)>>1:(54-cyc)>>1; if(s>0){ const cx=LOGO_POS[3]+15, cy=LOGO_Y+3; ctx.fillStyle='#fff'; ctx.fillRect(cx-s,cy,s*2+1,1); ctx.fillRect(cx,cy-s,1,s*2+1); } } }
  const a=Math.max(0,Math.min(1,(titleT-TITLE_LAND)/26));
  if(a>0){ ctx.globalAlpha=a; ctx.font='8px "Press Start 2P"'; ctx.textAlign='center'; ctx.textBaseline='top'; const sub='Y LAS 8 SEMILLAS'; ctx.fillStyle=PAL.k;
    ctx.fillText(sub,79,60); ctx.fillText(sub,81,60); ctx.fillText(sub,80,59); ctx.fillText(sub,80,61); ctx.fillText(sub,81,61); ctx.fillStyle='#fffbe8'; ctx.fillText(sub,80,60); ctx.globalAlpha=1; ctx.textAlign='left'; }
  if(titleT>=TITLE_MENU){ if((tick&47)<32) txtO('PULSA  Z',80,112,'#fffbe8','center'); txtO('M: musica',80,129,'#dff0d8','center'); }
}
function drawFile(){
  ctx.fillStyle='#0c1c10'; ctx.fillRect(0,0,VW,VH);
  for(let y=0;y<VH;y+=8) for(let x=((y>>3)&1)*8;x<VW;x+=16){ ctx.fillStyle='#0e2014'; ctx.fillRect(x,y,8,8); }
  ctx.strokeStyle='#2a4a34'; ctx.lineWidth=1; ctx.strokeRect(3.5,3.5,153,137);
  txt('ELIGE BROTE',80,10,C.flowerC,'center');
  for(let i=0;i<3;i++){ const y=26+i*30, sel=fileSel===i, d=slotCache[i];
    ctx.fillStyle=sel?'#1b3a26':'#13241a'; ctx.fillRect(12,y,136,26); ctx.strokeStyle=sel?C.uiText:'#2a4a34'; ctx.strokeRect(12.5,y+.5,135,25);
    if(sel) ctx.drawImage(ACORN,16+((tick&31)<16?0:1),y+9);
    if(d){ ctx.drawImage(P_SPRITES[0][0],28,y+5); const mh=Math.min(10,((d.maxHp||6)/2)|0); for(let h=0;h<mh;h++) ctx.drawImage(HEART_FULL,48+h*8,y+3,7,7);
      const ch=d.cycled?4:d.summered?3:d.thawed?2:d.won?1:0; ctx.save(); ctx.translate(48,y+12); ctx.scale(.75,.75); txt(CHAPTER_SHORT[ch],0,0,C.flowerC); txt(timeStr(d.playTime||0),0,10,'#9ec7aa'); ctx.restore();
      let ex=110; if(d.thawed){ ctx.drawImage(EMBER_SPR,0,0,16,16,ex,y+11,12,12); ex+=9; } if(d.summered){ ctx.drawImage(TEAR_SPR,0,0,16,16,ex,y+11,12,12); ex+=9; } if(d.cycled){ ctx.drawImage(FLAKE_SPR,0,0,16,16,ex,y+11,12,12); } }
    else txt('- NUEVO -',56,y+9,sel?C.uiText:'#5d8a6b'); }
  if(fileConfirm&&slotCache[fileSel]){ txt('¿BORRAR BROTE?',80,120,'#e84848','center'); txt('Z: sí   X: no',80,131,C.uiText,'center'); }
  else { txt('Z:elegir X:borrar',80,120,'#7fae8c','center'); txt('ENTER: atrás',80,131,'#7fae8c','center'); }
}
function drawCredits(){
  ctx.fillStyle='#060c07'; ctx.fillRect(0,0,VW,VH);
  const k=Math.min(1,creditsT/60); ctx.globalAlpha=k*.9; ctx.drawImage(OAK,80-(OAK.width>>1),66); ctx.globalAlpha=1;
  ctx.fillStyle='rgba(168,236,120,'+(0.05+0.04*Math.sin(tick*.05)).toFixed(2)+')'; ctx.beginPath(); ctx.arc(80,84,44,0,6.29); ctx.fill();
  for(const p of parts){ ctx.fillStyle=p.col; ctx.fillRect(p.x|0,p.y|0,1,2); }
  const scroll=creditsT*0.5-40;
  CREDITS.forEach((ln,i)=>{ const y=140+i*11+(i?10:0)-scroll; if(y<-10||y>150) return; const big=i===0;
    const col=ln===ln.toUpperCase()&&ln.length>3?C.flowerC:'#fffbe8';
    if(big){ ctx.save(); ctx.translate(80,y); ctx.scale(2,2); ctx.font='8px "Press Start 2P"'; ctx.textAlign='center'; ctx.textBaseline='top'; ctx.fillStyle=PAL.k; ctx.fillText(ln,1,1); ctx.fillStyle=PAL.l; ctx.fillText(ln,0,0); ctx.restore(); }
    else txtO(ln,80,y,col,'center'); });
  if(creditsT>CREDITS.length*22+80&&(tick&31)<20) txtO('Z',80,132,'#9ed86a','center');
}
function drawOver(){
  ctx.fillStyle='rgba(12,10,6,.9)'; ctx.fillRect(0,0,VW,VH);
  for(let y=0;y<VH;y+=8) for(let x=((y>>3)&1)*8;x<VW;x+=16){ ctx.fillStyle='rgba(20,16,8,.5)'; ctx.fillRect(x,y,8,8); }
  // la semilla, y unas raíces que crecen mientras esperas
  const t=Math.min(1,(tick%600)/240); ctx.strokeStyle='#8a7048'; ctx.lineWidth=1;
  for(let i=0;i<4;i++){ const a=Math.PI/2+(i-1.5)*.45, L=6+t*(14+i*3); ctx.beginPath(); ctx.moveTo(80,58); ctx.lineTo((80+Math.cos(a)*L)|0,(58+Math.sin(a)*L)|0); ctx.stroke(); }
  ctx.drawImage(SEED_FALL,0,0,8,7,72,44,16,14);
  if((tick&7)<4) parts.push({x:74+Math.random()*12,y:50,vx:(Math.random()-.5)*.4,vy:.3,life:24,col:'#a87838',nog:true});
  for(const p of parts){ ctx.fillStyle=p.col; ctx.fillRect(p.x|0,p.y|0,1,1); p.x+=p.vx;p.y+=p.vy;p.life--; } parts=parts.filter(p=>p.life>0);
  txtO('SPROUT SE MARCHITÓ',80,14,'#c8b070','center');
  ctx.save(); ctx.translate(80,26); ctx.scale(.75,.75); txt('de cada brote caído',0,0,'#8a9a6a','center'); txt('nace una semilla',0,10,'#8a9a6a','center'); ctx.restore();
  const opts2=['REBROTAR','AL TÍTULO']; opts2.forEach((o,i)=>{ const y=92+i*16, sel=overSel===i; if(sel){ ctx.fillStyle='#1b3a26'; ctx.fillRect(40,y-3,80,14); ctx.drawImage(ACORN,44+((tick&15)<8?0:1),y-1); } txt(o,84,y,sel?'#9ed86a':'#5d8a6b','center'); });
  ctx.save(); ctx.translate(80,130); ctx.scale(.75,.75); txt(overSel===0?(dungeonOf(sx,sy)?'a la entrada de la mazmorra':'a la entrada de esta pantalla'):'se guarda tu progreso',0,0,'#4c7259','center'); ctx.restore();
}
/* ---------- draw() ---------- */
function draw(){
  ctx.save();
  if(shake>0&&opts.shake) ctx.translate((Math.random()*4-2)|0,(Math.random()*4-2)|0);
  ctx.fillStyle='#081408'; ctx.fillRect(-4,-4,VW+8,VH+8);
  if(state==='boot'){ drawBoot(); ctx.restore(); return; }
  if(state==='title'){ drawTitle(); ctx.restore(); return; }
  if(state==='file'){ drawFile(); ctx.restore(); return; }
  if(state==='cine'){ drawCine(); ctx.restore(); return; }
  if(state==='trans'){ const k=trans.t/trans.dur, e=smooth(k), ox=-trans.dx*160*e, oy=-trans.dy*128*e;
    ctx.drawImage(trans.a,ox,oy); ctx.drawImage(trans.b,ox+trans.dx*160,oy+trans.dy*128);
    const s=P_SPRITES[player.dir][(tick>>3)&1], pxFrom=player.x+trans.dx*160, pyFrom=player.y+trans.dy*128;
    ctx.drawImage(s,(pxFrom+(player.x-pxFrom)*e)|0,(pyFrom+(player.y-pyFrom)*e)|0);
    drawUI(); drawToast(); ctx.restore(); return; }
  if(state==='credits'){ drawCredits(); ctx.restore(); return; }
  if(state==='pause'){ drawPause(); ctx.restore(); return; }
  drawScene(); drawHint(); drawUI(); drawPlaceBanner();
  if(state==='itemget'){ const bob=Math.sin(tick*.15)*1.5; ctx.drawImage(itemSpr||BLADE_SPR,(player.x+(itemSpr&&itemSpr.width===12?2:0))|0,(player.y-17+bob)|0);
    if(itemCardName){ const a=Math.min(1,(120-itemT)/12); ctx.globalAlpha=a; const y=player.y+8>56?8:88; ctx.fillStyle='rgba(5,10,7,.92)'; ctx.fillRect(8,y,144,24); ctx.strokeStyle=C.flowerC; ctx.strokeRect(8.5,y+.5,143,23);
      ctx.save(); ctx.translate(80,y+4); ctx.scale(.75,.75); txt('¡NUEVO!',0,0,'#9ec7aa','center'); ctx.restore(); txt(itemCardName,80,y+12,C.flowerC,'center'); ctx.globalAlpha=1; } }
  if(saveFlash>0&&(state==='play'||state==='trans')){ ctx.globalAlpha=Math.min(1,saveFlash/12); ctx.drawImage(ACORN,148,PLAY_H-10); ctx.globalAlpha=1; }
  if(wakeT>0&&state==='play'){ if(wakeT>25) txt('z z',player.x+13,player.y-10,'#cfe8d8'); else txt('!',player.x+6,player.y-13,'#f8d0d0'); }
  if(state==='dialog'&&dlg) drawDialog();
  if(state==='shop') drawShop();
  if(state==='play'||state==='dialog') drawBossCard();
  if(state==='play'||state==='give'||state==='itemget') drawToast();
  if(fadeIn>0){ ctx.fillStyle='rgba(6,12,7,'+(fadeIn/70).toFixed(2)+')'; ctx.fillRect(0,0,VW,VH); }
  if(state==='fall'){ ctx.fillStyle='rgba(4,4,8,'+(0.8*(1-deathT/40)).toFixed(2)+')'; ctx.fillRect(0,0,VW,PLAY_H); }
  if(state==='dying'){ const k=1-deathT/70; ctx.fillStyle='rgba(30,22,8,'+(0.7*k).toFixed(2)+')'; ctx.fillRect(0,0,VW,PLAY_H); }
  if(state==='over'){ drawOver(); }
  ctx.restore();
}
