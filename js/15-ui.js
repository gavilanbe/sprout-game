'use strict';
/* ---------- HUD, DIÁLOGO, MENÚS Y PANTALLAS ---------- */
function txt(s,x,y,col,align){ ctx.font='8px "Press Start 2P"'; ctx.textBaseline='top'; ctx.textAlign=align||'left'; ctx.fillStyle=col||C.uiText; ctx.fillText(s,x,y); ctx.textAlign='left'; }
function txtO(s,x,y,col,align){ ctx.font='8px "Press Start 2P"'; ctx.textBaseline='top'; ctx.textAlign=align||'left'; ctx.fillStyle=PAL.k; ctx.fillText(s,x+1,y+1); ctx.fillStyle=col||'#fffbe8'; ctx.fillText(s,x,y); ctx.textAlign='left'; }
function box(x,y,w,h,fill){ ctx.fillStyle=PAL.k; ctx.fillRect(x-1,y-1,w+2,h+2); ctx.fillStyle=fill||'#183020'; ctx.fillRect(x,y,w,h); ctx.strokeStyle=C.uiText; ctx.lineWidth=1; ctx.strokeRect(x+1.5,y+1.5,w-3,h-3); }
const X_ICON={bomb:BOMB_SPR,hook:HOOK_SPR,boomer:BOOMER_SPR,lantern:LANTERN_SPR,feather:FEATHER_SPR};
const X_NAME={bomb:'BELLOTA-BOMBA',hook:'RAÍZ-GANCHO',boomer:'VAINA VOLADORA',lantern:'FAROL DE BRASA',feather:'VILANO'};
function drawUI(){
  ctx.fillStyle=C.ui; ctx.fillRect(0,PLAY_H,VW,16); ctx.fillStyle='#243424'; ctx.fillRect(0,PLAY_H,VW,1);
  // corazones (hasta 10 en dos filas compactas)
  const hearts=player.maxHp/2;
  for(let i=0;i<hearts;i++){ const v=player.hp-i*2; const hx=3+(i%7)*8, hy=PLAY_H+(i<7?3:9);
    ctx.drawImage(v>=2?HEART_FULL:v===1?HEART_HALF:HEART_EMPTY,hx,hy,hearts>7?7:8,hearts>7?7:8); }
  // ranura X
  ctx.fillStyle='#243424'; ctx.fillRect(62,PLAY_H+1,15,14); ctx.fillStyle=PAL.k; ctx.fillRect(63,PLAY_H+2,13,12);
  txt('X',64,PLAY_H+4,'#7fae8c');
  if(xItem){ ctx.drawImage(X_ICON[xItem],2,1,13,13,63,PLAY_H+2,13,12); }
  // bayas
  ctx.drawImage(BERRY_SPR,84,PLAY_H+4); txt('x'+berries,93,PLAY_H+4);
  // semillas (hasta entregarlas) o llaves de mazmorra
  const dk=dungeonOf(sx,sy);
  if(dk){ ctx.drawImage(KEY_SPR,126,PLAY_H+4); txt('x'+(dungeonKeys[dk]||0),135,PLAY_H+4); if(bigKeys[dk]) ctx.drawImage(BIGKEY_SPR,0,0,12,10,148,PLAY_H+3,10,9); }
  else if(!won){ ctx.drawImage(ACORN_GOLD,124,PLAY_H+4); txt(seeds+'/8',133,PLAY_H+4); }
  else if(equipped[0]||equipped[1]){ let ex=126; for(const a of equipped) if(a){ ctx.drawImage(AMULET_SPR[a],0,0,12,12,ex,PLAY_H+3,10,10); ex+=13; } }
}
function drawDialog(){
  const full=dlg.pages[dlg.page], lines=full.split('\n');
  const x=4, w=152, h=46, y=(player.y+8>56)?6:78;
  box(x,y,w,h);
  const por=dlg.who&&PORTRAITS[dlg.who];
  if(por){ ctx.fillStyle=PAL.k; ctx.fillRect(x+3,y+4,38,38); ctx.fillStyle='#0e2014'; ctx.fillRect(x+4,y+5,36,36);
    const big=por.width>16; if(big) ctx.drawImage(por,0,0,por.width,por.height,x+6,y+7,32,32); else ctx.drawImage(por,0,0,16,16,x+6,y+7,32,32);
    ctx.strokeStyle=C.flowerC; ctx.strokeRect(x+3.5,y+4.5,37,37); }
  if(dlg.who){ const nw=dlg.who.length*8+8, py=(y===78)?y-10:y+h+1; ctx.fillStyle=PAL.k; ctx.fillRect(x+3,py,nw+2,12); ctx.fillStyle='#0e2014'; ctx.fillRect(x+4,py+1,nw,10); txt(dlg.who,x+8,py+2,C.flowerC); }
  const tx0=por?x+46:x+6; let budget=dlg.chars|0;
  lines.forEach((ln,i)=>{ if(budget<=0) return; txt(ln.slice(0,budget),tx0,y+7+i*12); budget-=ln.length+1; });
  if((dlg.chars|0)>=full.length){
    if(dlg.ask&&dlg.page===dlg.pages.length-1) txt('Z:sí  X:no',x+w-86,y+h-10,C.flowerC);
    else if((tick&31)<20) txt('▼',x+w-14,y+h-11); }
}
function drawBossCard(){ if(!bossCard) return;
  const a=Math.max(0,Math.min(1,(130-bossCard.t)/10,bossCard.t/30)); ctx.globalAlpha=a;
  ctx.fillStyle='rgba(5,8,10,.88)'; ctx.fillRect(0,30,160,20); ctx.fillStyle='#e84848'; ctx.fillRect(0,30,160,1); ctx.fillRect(0,49,160,1);
  txt(bossCard.txt,80,36,'#fffbe8','center'); ctx.globalAlpha=1; }
function drawToast(){ if(!toast) return;
  const a=Math.max(0,Math.min(1,(140-toast.t)/8,toast.t/14)); ctx.globalAlpha=a; const h=toast.t2?24:14;
  ctx.fillStyle='rgba(5,10,7,.92)'; ctx.fillRect(8,3,144,h); ctx.strokeStyle=C.flowerC; ctx.lineWidth=1; ctx.strokeRect(8.5,3.5,143,h-1);
  txt(toast.t1,80,6,C.flowerC,'center'); if(toast.t2) txt(toast.t2,80,16,C.uiText,'center'); ctx.globalAlpha=1; }
function drawShop(){
  ctx.fillStyle='rgba(5,10,7,.93)'; ctx.fillRect(6,4,148,118); ctx.strokeStyle=C.flowerC; ctx.lineWidth=1; ctx.strokeRect(7.5,5.5,145,115);
  txt(shopKind==='corteza'?'CABAÑA DE CORTEZA':'TIENDA DE TILO',80,10,C.flowerC,'center');
  ctx.drawImage(BERRY_SPR,116,20); txt('x'+berries,126,21);
  const L=shopList();
  L.forEach((it,i)=>{ const y=33+i*11, sel=i===shopSel; if(sel&&(tick&31)<24) ctx.drawImage(ACORN,10,y);
    txt(it.name,20,y,it.off?'#4c7259':(sel?C.uiText:'#9ec7aa'));
    if(it.cost>0){ ctx.drawImage(BERRY_SPR,126,y-1); txt(''+it.cost,136,y,berries>=it.cost?C.flowerC:'#e84848'); } });
  ctx.fillStyle='#13241a'; ctx.fillRect(12,92,136,18);
  const it=L[shopSel]; wrapText((it.off&&it.dOff)?it.dOff:it.d,16).slice(0,2).forEach((ln,i)=>txt(ln,16,94+i*9,'#9ec7aa'));
  if((tick&95)<60) txt('Z:comprar X:salir',80,113,'#7fae8c','center');
}
/* ---------- EL ZURRÓN ---------- */
const PAUSE_TABS=['ZURRÓN','MAPA','TAREAS'];
function drawPause(){
  ctx.fillStyle='rgba(5,10,7,.94)'; ctx.fillRect(0,0,160,144);
  for(let y=0;y<144;y+=8) for(let x=((y>>3)&1)*8;x<160;x+=16){ ctx.fillStyle='#0a160e'; ctx.fillRect(x,y,8,8); }
  PAUSE_TABS.forEach((t,i)=>{ const x=6+i*52, on=i===pausePage; ctx.fillStyle=on?'#1b3a26':'#0e2014'; ctx.fillRect(x,3,50,12); ctx.strokeStyle=on?C.flowerC:'#2a4a34'; ctx.strokeRect(x+.5,3.5,49,11); txt(t,x+25,6,on?C.flowerC:'#5d8a6b','center'); });
  if(pausePage===0){
    const items=ownedX(), am=[...amulets];
    txt('OBJETOS (X)',6,20,'#7fae8c');
    for(let i=0;i<5;i++){ const x=6+i*30, y=29, it=items[i]; ctx.fillStyle='#0e2014'; ctx.fillRect(x,y,26,22); ctx.strokeStyle=it&&xItem===it?C.flowerC:'#2a4a34'; ctx.strokeRect(x+.5,y+.5,25,21);
      if(it){ ctx.drawImage(X_ICON[it],x+5,y+3); if(xItem===it) txt('X',x+19,y+13,C.flowerC); }
      if(pauseSel===i&&i<items.length) ctx.drawImage(ACORN,x+9,y+23-(tick&8?1:0)); }
    txt('AMULETOS',6,57,'#7fae8c'); txt('2 ranuras',154,57,'#5d8a6b','right');
    for(let i=0;i<8;i++){ const x=6+(i%4)*37, y=66+((i/4)|0)*20, id=am[i]; ctx.fillStyle='#0e2014'; ctx.fillRect(x,y,34,17); const eq=id&&equipped.includes(id);
      ctx.strokeStyle=eq?C.flowerC:'#2a4a34'; ctx.strokeRect(x+.5,y+.5,33,16);
      if(id){ ctx.drawImage(AMULET_SPR[id],x+3,y+2); if(eq) txt('E',x+26,y+5,C.flowerC); }
      if(pauseSel===items.length+i&&i<am.length){ ctx.drawImage(ACORN,x+13,y+17-(tick&8?1:0)); } }
    // descripción de lo seleccionado
    ctx.fillStyle='#13241a'; ctx.fillRect(6,107,148,27);
    let name='',desc='';
    if(pauseSel<items.length){ name=X_NAME[items[pauseSel]]; desc={bomb:'X: planta una bomba.\nRompe rocas y muros.',hook:'X: cruza agua y se agarra a postes.',boomer:'X: vuela, aturde y trae cosas.',lantern:'X: enciende antorchas. Alumbra cuevas.',feather:'X: salta agujeros y vacíos.'}[items[pauseSel]]; }
    else if(am[pauseSel-items.length]){ const a=AMULETS[am[pauseSel-items.length]]; name=a.name; desc=a.desc; }
    else { name='—'; desc=items.length||am.length?'':'Aún no llevas nada.\nExplora el valle.'; }
    txt(name,10,109,C.flowerC); wrapText(desc,18).slice(0,2).forEach((ln,i)=>txt(ln,10,118+i*8,'#9ec7aa'));
    if(!items.length&&!am.length){ txt('El zurrón está vacío.',80,44,'#5d8a6b','center'); }
  } else if(pausePage===1) drawMap();
  else drawQuests();
  if((tick&63)<40) txt(pausePage===0?'Z:equipar  X:volver':'←→ pestaña · ENTER:volver',80,136,'#4c7259','center');
}
function drawMap(){
  txt('VALLE RAÍZ',80,20,C.flowerC,'center');
  const cw=18,chh=12,ox=80-(5*cw)/2,oy=32; // 5 columnas × 7 filas (y de -3 a 3)
  for(let y=-3;y<=3;y++) for(let x=0;x<=4;x++){ const key=x+','+y; if(!MAPS[key]) continue;
    const px=ox+x*cw, py=oy+(y+3)*chh, seen=visited.has(key), here=sx===x&&sy===y;
    const bio=seen?screenBiome(x,y):null; const col=!seen?'#0e2014':bio==='snow'?'#8aa0b8':bio==='autumn'?'#a8783a':bio==='wilt'?'#7a7a48':(x>=3&&y>=0&&y<=2)?'#3878a8':'#3a7a40';
    ctx.fillStyle=col; ctx.fillRect(px,py,cw-1,chh-1);
    if(seen){ if(key==='1,1'){ ctx.fillStyle='#d09040'; ctx.fillRect(px+7,py+3,4,4); }
      if(key==='2,-1'||key==='1,3'||key==='1,-2'||key==='0,0'){ ctx.fillStyle=PAL.k; ctx.fillRect(px+7,py+4,4,4); }
      if(key==='0,1'){ ctx.fillStyle='#d84838'; ctx.fillRect(px+4,py+3,3,3); ctx.fillRect(px+10,py+3,3,3); } }
    if(here&&(tick&15)<10){ ctx.drawImage(P_SPRITES[0][0],4,4,8,8,px+5,py+1,8,8); }
  }
  ctx.strokeStyle='#2a4a34'; ctx.strokeRect(ox-1.5,oy-1.5,5*cw+2,7*chh+2);
  const dk=dungeonOf(sx,sy)||(sx===5?'gruta':null);
  const where=PLACE_NAMES[sx+','+sy]||'?'; txt(where.length>19?where.slice(0,18)+'…':where,80,119,'#9ec7aa','center');
  txt(visited.size+' lugares',154,20,'#5d8a6b','right');
  if(dk){ txt('(en '+(dk==='cueva'?'la Cueva del Topo':dk==='tronco'?'el Tronco Hueco':dk==='templo'?'el Templo':'la gruta')+')',80,127,'#5d8a6b','center'); }
}
function drawQuests(){
  txt('TAREAS',80,20,C.flowerC,'center');
  const L=questList().filter(q=>!q.quiet); const act=L.filter(q=>!q.done), done=L.filter(q=>q.done);
  let y=32;
  txt('EN CURSO',6,y,'#7fae8c'); y+=10;
  if(!act.length){ txt('(nada pendiente)',12,y,'#5d8a6b'); y+=10; }
  for(const q of act.slice(0,5)){ txt((q.side?'* ':'> ')+q.txt,8,y,q.side?'#c8b070':C.uiText); y+=10; }
  y+=4; txt('CUMPLIDAS',6,y,'#7fae8c'); y+=10;
  for(const q of done.slice(-4)){ txt('v '+q.txt,8,y,'#4c7259'); y+=9; }
  txt('Cuartos de corazón: '+pieces+'/4',80,124,'#5d8a6b','center');
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
  if(k<0.9){ ctx.font='8px "Press Start 2P"'; ctx.textAlign='center'; ctx.textBaseline='top'; ctx.globalAlpha=1-k*.7; ctx.fillStyle='#4a4418';
    const lines=CINE[cinePage].slice(0,cineChars|0).split('\n'); const y0=-(lines.length*13>>1)+2; lines.forEach((ln,i)=>ctx.fillText(ln,0,y0+i*13)); ctx.globalAlpha=1; }
  ctx.restore();
  if(cineFold===0&&(cineChars|0)>=CINE[cinePage].length&&(tick&31)<20) txt('Z',80,130,'#9ed86a','center');
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
    if(d){ ctx.drawImage(P_SPRITES[0][0],28,y+5); const mh=Math.min(10,((d.maxHp||6)/2)|0); for(let h=0;h<mh;h++) ctx.drawImage(HEART_FULL,48+h*8,y+4,7,7);
      ctx.drawImage(ACORN_GOLD,48,y+14); txt('x'+(d.seeds||0),58,y+15);
      let ex=92; if(d.thawed){ ctx.drawImage(EMBER_SPR,0,0,16,16,ex,y+11,12,12); ex+=14; } if(d.summered){ ctx.drawImage(TEAR_SPR,0,0,16,16,ex,y+11,12,12); ex+=14; } if(d.cycled){ ctx.drawImage(FLAKE_SPR,0,0,16,16,ex,y+11,12,12); } }
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
/* ---------- draw() ---------- */
function draw(){
  ctx.save();
  if(shake>0) ctx.translate((Math.random()*4-2)|0,(Math.random()*4-2)|0);
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
  drawScene(); drawUI();
  if(state==='itemget'){ ctx.drawImage(itemSpr||BLADE_SPR,(player.x+(itemSpr&&itemSpr.width===12?2:0))|0,(player.y-17)|0); }
  if(wakeT>0&&state==='play'){ if(wakeT>25) txt('z z',player.x+13,player.y-10,'#cfe8d8'); else txt('!',player.x+6,player.y-13,'#f8d0d0'); }
  if(state==='dialog'&&dlg) drawDialog();
  if(state==='shop') drawShop();
  if(state==='play'||state==='dialog') drawBossCard();
  if(state==='play'||state==='give'||state==='itemget') drawToast();
  if(fadeIn>0){ ctx.fillStyle='rgba(6,12,7,'+(fadeIn/70).toFixed(2)+')'; ctx.fillRect(0,0,VW,VH); }
  if(state==='fall'){ ctx.fillStyle='rgba(4,4,8,'+(0.8*(1-deathT/40)).toFixed(2)+')'; ctx.fillRect(0,0,VW,PLAY_H); }
  if(state==='dying'){ const k=1-deathT/70; ctx.fillStyle='rgba(30,22,8,'+(0.7*k).toFixed(2)+')'; ctx.fillRect(0,0,VW,PLAY_H); }
  if(state==='over'){ ctx.fillStyle='rgba(20,16,8,.82)'; ctx.fillRect(0,0,VW,VH); ctx.drawImage(H_WILT,72,40);
    if((tick&7)<4) parts.push({x:74+Math.random()*12,y:50,vx:(Math.random()-.5)*.4,vy:.4,life:24,col:'#a87838'});
    for(const p of parts){ ctx.fillStyle=p.col; ctx.fillRect(p.x|0,p.y|0,1,1); p.x+=p.vx;p.y+=p.vy;p.life--; } parts=parts.filter(p=>p.life>0);
    txt('SPROUT SE',80,66,'#c8b070','center'); txt('MARCHITÓ...',80,76,'#c8b070','center'); txt('de cada brote caído',80,92,'#8a9a6a','center'); txt('nace una semilla.',80,101,'#8a9a6a','center');
    if((tick&47)<32) txt('Z: REBROTAR',80,114,'#9ed86a','center'); }
  ctx.restore();
}
