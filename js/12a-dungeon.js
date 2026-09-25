'use strict';
/* ============================================================
   MAZMORRAS: lo que las hace largas y con sustancia.
   · Salas-emboscada: al entrar se cierran las puertas y no se
     abren hasta que no queda ni un bicho; entonces cae la
     recompensa (una llave, un cofre o una verja que se abre).
   · Cofres con contenido: mapa, brújula, llaves, cuartos de
     corazón, bayas y el zurrón de bellotas.
   · Belloteros: arbustos que sueltan bellotas-bomba al cortarlos
     y vuelven a brotar; así las salas que piden bombas nunca
     te dejan tirado.
   · Mapa y brújula de cada mazmorra, para el zurrón.
   ============================================================ */
const DUNGEON_NAMES={cueva:'LA CUEVA DEL TOPO',tronco:'EL TRONCO HUECO',templo:'EL TEMPLO DE LA CIMA'};
const DUNGEON_SHORT={cueva:'CUEVA',tronco:'TRONCO',templo:'TEMPLO'};
const DUNGEON_BOSS={cueva:'6,2',tronco:'10,2',templo:'15,0'}; // el templo: la puerta que sube a la cima
/* reglas por sala: clear = emboscada; reward = qué cae al vencer */
const ROOM_RULES={
  '6,-1':{clear:true,reward:{kind:'key',x:5,y:3}},
  '7,2': {clear:true,reward:{kind:'chest',x:4,y:4}},
  '11,-1':{clear:true,reward:{kind:'key',x:5,y:3}},
  '14,2':{clear:true,reward:{kind:'chest',x:4,y:4}},
  '6,1': {clear:true,reward:{kind:'none'}},
};
let roomShut=null, shutArm=false, regrow=[];
function initRoomRules(){
  roomShut=null; shutArm=false; regrow=[]; initEcho();
  if(sx===5&&sy===9&&cycled&&grid[1][8]!=='>') grid[1][8]='>'; // tras el final, la Gruta baja al Eco
  const key=sx+','+sy, R=ROOM_RULES[key]; if(!R||!R.clear) return;
  if(opened.has('RC'+key)){ placeRoomReward(R,true); return; }
  if(enemies.length>0) shutArm=true;
}
function placeRoomReward(R,silent){
  const rw=R.reward; if(!rw) return; const key=sx+','+sy;
  if(rw.kind==='chest'){ grid[rw.y][rw.x]='¤'; markDirty();
    if(!silent){ puff(rw.x*16+8,rw.y*16+8,'#fff6c0',12,1.4); for(let i=0;i<6;i++) sparkle(rw.x*16+2+Math.random()*12,rw.y*16+Math.random()*10,'#fff6c0'); } }
  else if(rw.kind==='key'){ const id='RCk'+key; if(!collected.has(id)) pickups.push({kind:'key',id,x:rw.x*16+4,y:rw.y*16+4,t:0,drop:silent?0:20}); }
}
function closeRoom(){
  const cells=[];
  for(let y=0;y<SH;y++) for(let x=0;x<SW;x++){ if(x!==0&&x!==SW-1&&y!==0&&y!==SH-1) continue;
    const ch=grid[y][x]; if(!isSolid(ch)){ cells.push([x,y,ch]); grid[y][x]='='; puff(x*16+8,y*16+8,'#6a6458',4,.8); } }
  roomShut={cells}; markDirty(); SFX.ambushClose(); musicAmbush(true); shake=8;
  showToast('¡EMBOSCADA!','vence a todos para salir');
}
function openRoom(){
  for(const [x,y,ch] of roomShut.cells){ grid[y][x]=ch; puff(x*16+8,y*16+8,'#8a7048',5,1); }
  roomShut=null; const key=sx+','+sy; opened.add('RC'+key); SFX.ambushOpen(); musicAmbush(false); shake=4; markDirty();
  placeRoomReward(ROOM_RULES[key],false); save();
}
function updRoomRules(){
  updEcho();
  if(shutArm&&!roomShut){ const [tx,ty]=playerTile(); if(tx>=1&&tx<=SW-2&&ty>=1&&ty<=SH-2){ shutArm=false; closeRoom(); } }
  else if(roomShut&&enemies.length===0&&!spawnQ.length&&!midboss) openRoom();
  // los belloteros vuelven a brotar
  for(const r of regrow){ r.t--;
    if(r.t<=0){ const ch=grid[r.y][r.x];
      if(!isSolid(ch)&&Math.hypot(player.x+8-(r.x*16+8),player.y+12-(r.y*16+8))>14){ grid[r.y][r.x]='♣'; markDirty(); puff(r.x*16+8,r.y*16+10,'#78d838',6,.8); SFX.sprout(); }
      else r.t=30; } }
  regrow=regrow.filter(r=>r.t>0);
}
/* un bellotero cortado: suelta bellotas-bomba (o bayas si aún no tienes el zurrón) y rebrota */
function cutBellotero(x,y){
  grid[y][x]=regionFloor(); markDirty(); SFX.cut(); SFX.bellotero(); leaves(x*16+8,y*16+8);
  if(hasBomb) pickups.push({kind:'bombs',n:3,x:x*16+4,y:y*16+4,t:0,drop:14});
  else pickups.push({kind:'berry',x:x*16+4,y:y*16+4,t:0,drop:14});
  regrow.push({x,y,t:480});
}
/* ---------- los cofres ---------- */
const CHEST_EXTRA={
  '7,2:4,4':{kind:'map',dk:'cueva'},
  '8,-1:4,3':{kind:'compass',dk:'cueva'},
  '10,-1:2,2':{kind:'compass',dk:'tronco'},
  '12,-1:5,2':{kind:'map',dk:'tronco'},
  '12,2:7,5':{kind:'bombbag'},
  '14,2:4,4':{kind:'map',dk:'templo'},
  '16,2:5,2':{kind:'compass',dk:'templo'},
  '5,12:4,3':{kind:'berries',n:100},
};
for(const k in CHEST_EXTRA) CHESTS[k]=CHEST_EXTRA[k];
function giveThing(spr,name,pages){
  itemSpr=spr; itemPages=pages; state='itemget'; itemT=100; itemCardName=name; player.dir=0; player.atk=0; player.spin=0;
  SFX.fanfare(); shake=4; screenFlash(6,'#fff6c0'); puff(player.x+8,player.y,C.flowerC,12,1.4); save();
}
function openChestContent(c){
  if(!c){ say(["El cofre está vacío. Alguien llegó antes."]); return; }
  if(c.kind==='amulet') giveAmulet(c.id);
  else if(c.kind==='berries'){ berries=Math.min(999,berries+c.n); hudBerryT=14; say(["¡"+c.n+" BAYAS!"]); }
  else if(c.kind==='map'){ dmaps.add(c.dk); SFX.mapGet(); giveThing(MAP_SPR,'MAPA · '+DUNGEON_SHORT[c.dk],["¡El MAPA de "+DUNGEON_NAMES[c.dk].toLowerCase()+"!","Ábrelo en el ZURRÓN (ENTER): verás todas las salas, también las que aún no pisaste."]); }
  else if(c.kind==='compass'){ dcomp.add(c.dk); SFX.compassGet(); giveThing(COMPASS_SPR,'BRÚJULA · '+DUNGEON_SHORT[c.dk],["¡La BRÚJULA!","En el mapa del zurrón señala al GUARDIÁN y los COFRES que te quedan por abrir."]); }
  else if(c.kind==='key'){ const dk=dungeonOf(sx,sy)||'x'; dungeonKeys[dk]=(dungeonKeys[dk]||0)+1; SFX.key(); say(TXT.keyGet); save(); }
  else if(c.kind==='piece'){ addPiece(); }
  else if(c.kind==='bombbag'){ bombMax=20; bombAmmo=20; giveThing(BOMBBAG_SPR,'ZURRÓN DE BELLOTAS',["¡El ZURRÓN DE BELLOTAS!","Ahora caben 20 bellotas-bomba. Y viene lleno."]); }
}
/* ---------- sprites: mapa, brújula, zurrón de bellotas, bellotas sueltas ---------- */
const MAP_SPR=(()=>{ const c=mkCanvas(16,16), g=c.getContext('2d');
  g.fillStyle=PAL.k; g.fillRect(1,2,14,12); g.fillStyle='#f0dca8'; g.fillRect(2,3,12,10); g.fillStyle='#d8bc80'; g.fillRect(2,3,12,1); g.fillRect(6,3,1,10); g.fillRect(10,3,1,10);
  g.fillStyle='#78b050'; g.fillRect(3,6,3,3); g.fillRect(11,9,2,2); g.fillStyle='#5a90d0'; g.fillRect(7,9,3,2);
  g.fillStyle='#c02828'; g.fillRect(11,5,1,1); g.fillRect(12,6,1,1); g.fillRect(13,5,1,1); g.fillRect(11,7,1,1); g.fillRect(13,7,1,1);
  g.fillStyle='#a07840'; g.fillRect(1,1,2,14); g.fillRect(13,1,2,14); g.fillStyle='#c89858'; g.fillRect(1,1,1,14); g.fillRect(13,1,1,14); return c; })();
const COMPASS_SPR=(()=>{ const c=mkCanvas(16,16), g=c.getContext('2d');
  blobArt(g,1,1,14,14,[{x:7,y:7,r:6.6}],['#5a3a0c','#9a6a18','#d8a030','#f8d060','#fff4c0'],{grad:.3,dither:.5});
  g.fillStyle='#f4ecd8'; g.fillRect(4,4,8,8); g.fillRect(5,3,6,10); g.fillRect(3,5,10,6);
  g.fillStyle='#c02828'; g.fillRect(7,4,2,4); g.fillRect(7,3,2,1); g.fillStyle='#2a3a5a'; g.fillRect(7,8,2,4);
  g.fillStyle=PAL.k; g.fillRect(7,7,2,2); g.fillStyle='#ffffff'; g.fillRect(4,5,1,1); return c; })();
const BOMBBAG_SPR=(()=>{ const c=mkCanvas(16,16), g=c.getContext('2d');
  blobArt(g,1,4,14,12,[{x:7,y:6,r:6.5,ry:5.5}],['#3a2410','#5a3a1c','#7a5228','#a07040','#c89868'],{grad:.4});
  g.fillStyle=PAL.k; g.fillRect(4,2,8,3); g.fillStyle='#8a5a2c'; g.fillRect(5,3,6,1); g.fillStyle='#c02828'; g.fillRect(3,5,10,1);
  g.drawImage(ACORN,0,0,8,8,4,7,8,8); return c; })();
/* ============================================================
   EL ECO DE LOS GUARDIANES (post-juego): bajo la Gruta de los
   Ecos, una galería donde esperan los ecos de los guardianes, uno
   tras otro. No ceden ni hablan: al quedar a 2 PV se disuelven y
   la verja del este se abre. Al final, el Alba.
   ============================================================ */
const ECO_BOSS={'1,12':'topo','2,12':'avispa','3,12':'ciervo','4,12':'viento'};
const ECO_NAME={topo:'ECO DEL TOPO REAL',avispa:'ECO DE LA REINA',ciervo:'ECO DEL CIERVO',viento:'ECO DEL VIENTO'};
function enterEcho(){ placeAt(0,12,72,62,1); showToast('EL ECO DE LOS GUARDIANES','vence a sus ecos'); }
function initEcho(){
  const key=sx+','+sy, t=ECO_BOSS[key]; if(!t||opened.has('ECO'+key)) return;
  boss=t==='ciervo'?makeCiervo(5,3):makeBoss(t,4,3); boss.echo=true; boss.hp=boss.maxHp=Math.round(boss.maxHp*.8);
  if(t==='avispa'){ boss.y=16; } bossCard={txt:ECO_NAME[t],t:130}; if(AC) SFX.boss();
  setTrack(typeof TRACKS!=='undefined'&&TRACKS.desafio?'desafio':'jefe');
}
function updEcho(){
  if(!boss||!boss.echo||boss.hp>2) return;
  if(boss.dying) return; const key=sx+','+sy, b=boss; pendingSay=null; b.dying=true; enemies=[]; projs=[];
  queueBye(b.type,fb=>{ // su despedida en violeta (15j-15m); luego se abre la verja
    if(fb){ for(let i=0;i<3;i++) puff(b.x+16,b.y+16,['#c8b0ff','#fffbe8','#8a78d8'][i],12,1.6); deathPoof(b.x+16,b.y+16,'#c8b0ff'); shake=10; screenFlash(10,'#e8e0ff'); }
    boss=null; enemies=[]; projs=[];
    opened.add('ECO'+key); opened.add('G'+key); openGates(); player.hp=Math.min(player.maxHp,player.hp+4);
    if(AC){ if(fb) SFX.fanfare(); setTrack('gruta'); } showToast('EL ECO SE DESVANECE','la verja se abre'); save(); },{echo:true});
}
