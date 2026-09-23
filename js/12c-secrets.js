'use strict';
/* ============================================================
   SECRETOS DEL VALLE: escondites, trueques y la pesca con Moss.
   · Escondites (ny=10): cuevas tras grietas del risco (bomba),
     escaleras bajo arbustos (hoja), una madriguera a oscuras
     (farol) y un manantial que cura (y una isla: gancho).
   · Otros secretos: una isla con cofre (gancho), un saliente
     (vilano), un cebo dorado en mitad de la cascada (vaina) y
     un tesoro enterrado en las dunas (mapa + bomba).
   · La cadena de trueques: ocho pasos por los vecinos y los
     guardianes en tregua; acaba en el TRÉBOL DE CUATRO HOJAS.
   · La pesca: apuntar, lanzar, esperar a que el corcho se hunda,
     clavar y recoger sin que el sedal se rompa.
   ============================================================ */
/* ---------- los escondites ---------- */
const HIDEOUT_DOORS={ // cueva 'G' en el mundo → [sx,sy,x,y,dir] dentro
  '0,0:8,1':[0,10,72,72,1],     // la grieta de los Riscos (una vez volada)
  '0,-1:8,0':[2,10,72,72,1],    // la boca helada de la Ladera
};
const HIDEOUT_STAIRS={ '2,0':[1,10,72,72,1], '2,3':[3,10,72,72,1] }; // escaleras bajo arbustos
const HIDEOUT_EXITS={ '0,10':[0,0,128,28], '1,10':[2,0,112,76], '2,10':[0,-1,128,12], '3,10':[2,3,112,28] };
const LIT_SCREENS=new Set(['1,10']);   // el manantial tiene luz propia
const DEEP_SCREENS=new Set(['2,10']);  // la madriguera: sin farol apenas se ve
Object.assign(PLACE_NAMES,{'0,10':'Cueva del Eco Dormido','1,10':'Manantial de Savia','2,10':'Madriguera Helada','3,10':'Refugio de la Ciénaga'});
SOLID.add('⊂'); GROUND.add('✕'); WATER.add('◊'); // se dibujan en 03-tiles (◊ solo existe en el mapa crudo)
CHESTS['3,1:9,4']={kind:'berries',n:50};
CHESTS['2,10:5,2']={kind:'berries',n:100};
CHESTS['3,10:5,2']={kind:'berries',n:40};
function hideoutDoor(){ const ft=facingTile(); if(!ft) return null; return HIDEOUT_DOORS[sx+','+sy+':'+ft[0]+','+ft[1]]||null; }
function hideoutExit(){ const e=HIDEOUT_EXITS[sx+','+sy]; if(!e) return false; placeAt(e[0],e[1],e[2],e[3],0); return true; }
/* al cargar una pantalla: grietas voladas, el tesoro (visible con el mapa), el cebo, el bulbo de Lupa */
function initSecrets(){
  const key=sx+','+sy;
  for(let y=0;y<SH;y++) for(let x=0;x<SW;x++){ const ch=grid[y][x];
    if(ch==='⊂'&&opened.has('SC'+key+':'+x+','+y)) grid[y][x]='G';
    else if(ch==='✕'){ if(opened.has('TES')) grid[y][x]='¤'; else if(tradeStep<6) grid[y][x]='s'; }
    else if(ch==='◊'){ grid[y][x]='W'; if(!hasLure&&!collected.has('lure')) pickups.push({kind:'lure',id:'lure',x:x*16+4,y:y*16+4,t:0}); } }
  if(key==='1,1'&&tradeStep>=8&&grid[5][8]==='.') grid[5][8]='f';
}
TXT.signs['2,0']=["CORRO DE LAS HADAS.","Donde la hierba alta baila en corro, el Roble esconde un agua que cura."];
TXT.signs['1,10']=["MANANTIAL DE SAVIA.","El agua del Roble cura a quien la pisa. Y en la isla... algo late."];
RUNAS['0,10']=["PIEDRA RÚNICA:\n«El Eco duerme aquí.","Repite lo último que oyó el valle antes de apagarse:","una nana que nadie recuerda haber cantado.»"];
RUNAS['3,-1']=["PIEDRA RÚNICA:\n«Desde aquí el Viento miraba crecer las bellotas.","Contaba nueve. Siempre nueve.","Nunca supo dónde estaba la novena.»"];
RUNAS['3,10']=["PIEDRA RÚNICA:\n«Las marismas guardan el otoño que nadie quiso.","Hojas que caen sin llegar al suelo, esperando permiso.»"];
/* una bomba sobre un tile secreto */
function blastSecret(x,y,ch){
  if(ch==='⊂'){ grid[y][x]='G'; opened.add('SC'+sx+','+sy+':'+x+','+y); puff(x*16+8,y*16+8,'#a89078',10,1.5); showToast('¡UNA CUEVA!','tras la grieta del risco'); }
  else if(ch==='✕'){ grid[y][x]='¤'; opened.add('TES'); puff(x*16+8,y*16+8,'#f0d890',12,1.6); for(let i=0;i<6;i++) sparkle(x*16+2+Math.random()*12,y*16+Math.random()*10,'#fff6c0'); showToast('¡UN TESORO!','estaba enterrado'); }
  SFX.secret(); markDirty(); save();
}
/* el manantial cura a quien lo pisa */
let springT=0;
function updSecrets(){
  if(sx===1&&sy===10&&playerOnTile()==='w'&&player.hp<player.maxHp){ if(++springT>=18){ springT=0; player.hp++; SFX.heart(); sparkle(player.x+4+Math.random()*8,player.y+2,'#a8ecff'); if(player.hp>=player.maxHp) showToast('MANANTIAL DE SAVIA','vigor restaurado'); } }
  else springT=0;
  if(sx===1&&sy===10&&(tick&15)===0) parts.push({k:'mote',x:24+Math.random()*112,y:40+Math.random()*50,vx:0,vy:-.15,life:80,max:80,sway:Math.random()*6,col:'#c8f0ff',nog:true});
}
/* ---------- el registro de secretos (se cuenta en EL VALLE) ---------- */
const SECRETS=[
  {id:'eco',       done:()=>opened.has('SC0,0:8,1')},
  {id:'manantial', done:()=>opened.has('HS2,0')},
  {id:'madriguera',done:()=>opened.has('G2,10')},
  {id:'refugio',   done:()=>opened.has('HS2,3')},
  {id:'isla',      done:()=>opened.has('CH3,1:9,4')},
  {id:'mirador',   done:()=>collected.has('r:3,-1')},
  {id:'cebo',      done:()=>hasLure},
  {id:'tesoro',    done:()=>opened.has('TES')},
  {id:'bigotes',   done:()=>fishPiece},
];
function secretsFound(){ return SECRETS.filter(s=>s.done()).length; }
/* ---------- estado que se guarda ---------- */
let tradeStep=0, hasLure=false, fishDex=0, fishBest={}, fishPiece=false, fishCount=0;
function sideSave(){ return {tradeStep,hasLure,fishDex,fishBest,fishPiece,fishCount}; }
function sideLoad(d){ d=d||{}; tradeStep=d.tradeStep||0; hasLure=!!d.hasLure; fishDex=d.fishDex||0; fishBest={...(d.fishBest||{})}; fishPiece=!!d.fishPiece; fishCount=d.fishCount||0; }
/* ---------- LA CADENA DE TRUEQUES ---------- */
function tradeSpr(rows,pal){ return sprN(rows,pal); }
const TRADE=[
  null,
  {name:'CANICA DE ÁMBAR', short:'Canica → Corteza', desc:'Resina del Roble, antiquísima. A Corteza le gustan las piedras con alma.',
   spr:tradeSpr(["..kkkk..",".kyYYyk.","kyYwYyyk","kyYYyyOk","kyyyyOOk","kOyyOOOk",".kOOOOk.","..kkkk.."],{y:'#e8a030',Y:'#f8d060',O:'#b86818'})},
  {name:'PLUMA DE BÚHO', short:'Pluma → Moss', desc:'Suave y moteada. El viejo Moss hace señuelos con plumas así.',
   spr:tradeSpr(["......kk",".....kWk","....kWbk","...kWbWk","..kWbWk.",".kbWbk..","kbkkk...","kk......"],{W:'#f4ecd8',b:'#8a6a48'})},
  {name:'PERLA DE RÍO', short:'Perla → la Reina', desc:'Brilla como el rocío. La Reina del panal adora lo que brilla.',
   spr:tradeSpr(["........","..kkkk..",".kWWWnk.","kWeWWWnk","kWWWWnNk","kWWWnNNk",".knNNNk.","..kkkk.."],{W:'#f4f0ff',e:'#ffffff',n:'#c8c0e0',N:'#9890b8'})},
  {name:'JALEA REAL', short:'Jalea → Tilo', desc:'Del panal de la Reina. A Tilo le falta para su receta de savia.',
   spr:tradeSpr(["..kkkk..",".kVVVVk.","..kkkk..",".kyYYyk.","kyYwYyyk","kyYYyyOk","kyyyyOOk",".kkkkkk."],{V:'#a07040',y:'#f8c030',Y:'#fff0a0',O:'#c88010'})},
  {name:'CALCETÍN DE LANA', short:'Calcetín → el Topo', desc:'Tejido por Tilo. Alguien bajo tierra siempre tiene frío.',
   spr:tradeSpr(["..kkkk..","..kRWk..","..kWRk..","..kRWk..","..kWRkk.",".kRWRWRk","kRWRWRWk",".kkkkkk."],{R:'#d84848',W:'#f4ecd8'})},
  {name:'MAPA DEL TESORO', short:'Mapa: las dunas', desc:'Una X roja en las DUNAS DEL ESTE. ¿Y si algo estallara allí?',
   spr:tradeSpr(["kkkkkkkk","kPPPPPPk","kPppPRPk","kPPpPPRk","kpPPpPPk","kPPRRpPk","kPPPPPPk","kkkkkkkk"],{P:'#f0dca8',p:'#b89868',R:'#c02828'})},
  {name:'BULBO DORADO', short:'Bulbo → Lupa', desc:'Late despacio, como un corazón. Lupa sabrá plantarlo.',
   spr:tradeSpr(["...kk...","..klLk..","...kk...","..kyyk..",".kyYyyk.","kyYwyyOk","kyyyyOOk",".kOOOk.."],{l:'#58b040',L:'#a8e070',y:'#f8c830',Y:'#fff0a0',O:'#c08010'})},
];
function tradeItem(){ return TRADE[tradeStep]||null; }
for(const it of TRADE) if(it) it.big=scale2(it.spr,8,8); // a 16×16 para la tarjeta de «¡nuevo!»
function tradeTo(step,who,lines,after){ // el vecino habla, y te da el objeto siguiente
  say(lines,()=>{ tradeStep=step; const it=TRADE[step]; if(it) giveThing(it.big,it.name,[it.name+'.',it.desc]); if(after) after(); save(); },who);
}
function tradeInteract(tx,ty,ch){
  const guest=npcs.find(n=>n.guest&&n.x===tx&&n.y===ty);
  if(ch==='h'&&tradeStep===0&&hasBlade){ SFX.blip(); tradeTo(1,'PETRA',["¡Brote! Mira lo que encontré en la CASCADA DEL ÁMBAR: una CANICA DE ÁMBAR.","Corteza dice que las piedras bonitas tienen alma. ¿Se la enseñas? Te la dejo, pero solo prestada, ¿eh?"]); return true; }
  if(tradeStep===1&&(ch==='ö'||(ch==='ñ'&&sx===7))){ SFX.blip(); tradeTo(2,'CORTEZA',["¿Ámbar? Resina del Roble de hace mil años... Con esto tallaré algo que proteja, criatura.","Toma, a cambio: una PLUMA DE BÚHO que se me cayó del alero. Al viejo Moss le chiflan."]); return true; }
  if(tradeStep===2&&ch==='y'){ SFX.blip(); tradeTo(3,'MOSS',["¡Una pluma de búho! Con esto haré el mejor señuelo del valle, brote.","Toma: una PERLA DE RÍO. Salió de la barriga de una trucha. Brilla como el rocío."]); return true; }
  if(tradeStep===3&&guest&&guest.guest==='avispa'){ SFX.blip(); tradeTo(4,'LA REINA',["—Zzz... ¿Una perla? Como una gota de rocío que nunca se evapora...","—Toma: JALEA REAL de mi panal. Nadie fuera de la colmena la ha probado."]); return true; }
  if(tradeStep===4&&(ch==='g'||(ch==='ñ'&&sx===8))){ SFX.blip(); tradeTo(5,'TILO',["¡JALEA REAL! ¡Mi receta de savia por fin completa!","Toma, llévate este CALCETÍN DE LANA. Lo tejí yo. El Topo siempre dice que tiene frío ahí abajo."]); return true; }
  if(tradeStep===5&&guest&&guest.guest==='topo'){ SFX.blip(); tradeTo(6,'EL TOPO REAL',["—¿Un calcetín? ¡CALENTITO! Nadie me había regalado nada nunca.","—Toma: un MAPA viejo que desenterré. Tiene una X en las DUNAS DEL ESTE. A mí me da pereza subir."]); return true; }
  if(tradeStep===7&&ch==='j'){ SFX.blip();
    say(["¡Un BULBO DORADO! Dicen que solo florece si lo cuidan las cuatro estaciones...","Lo plantaré aquí, en la plaza, junto al Roble. Y tú, brote... toma esto."],()=>{ tradeStep=8; giveAmulet('trebol'); save(); },'LUPA'); return true; }
  // el tesoro de las dunas: el cofre guarda el bulbo
  if(ch==='¤'&&sx===2&&sy===2&&tx===7&&ty===3&&!opened.has('CH2,2:7,3')){ opened.add('CH2,2:7,3'); markDirty(); SFX.secret();
    if(tradeStep===6){ tradeStep=7; giveThing(TRADE[7].big,TRADE[7].name,["¡Un "+TRADE[7].name+"!",TRADE[7].desc]); }
    else { berries=Math.min(999,berries+50); say(["¡50 BAYAS!"]); }
    save(); return true; }
  // la pesca con Moss (si no hay otra cosa que hacer con él)
  if(ch==='y'&&hasBlade&&!(summered&&!mossGift)&&!(berries>=5&&player.hp<=player.maxHp-2)){ SFX.blip();
    ask(fishDex===0?["¿Pescamos, brote? Te dejo mi caña vieja.","¿Echamos la caña?"]:["¿Otra tanda de pesca?"],'MOSS',yes=>{
      if(yes) startFishing(); else say(NPC_TALK.y(),null,'MOSS'); }); return true; }
  return false;
}
/* ============================================================
   LA PESCA CON MOSS
   Apunta (flechas) y lanza (Z). Espera: los peces se acercan,
   mordisquean (¡quieto!) y al final el corcho se hunde: ¡Z!
   Después mantén Z para recoger; si el pez tira fuerte, suelta
   un poco o el sedal se rompe. X para dejarlo.
   ============================================================ */
const FISH=[
  {id:'carpin', name:'CARPÍN DORADO',    min:8,  max:15, pay:3,  w:1,   pull:.9,  run:.012, stam:70,  spd:.35, pal:['#5a2c08','#b86a10','#e8a020','#f8d060','#fff4c0']},
  {id:'perca',  name:'PERCA DEL JUNCAL', min:16, max:27, pay:6,  w:.6,  pull:1.15,run:.02,  stam:100, spd:.45, pal:['#163216','#2e6a2a','#58a040','#98d060','#e0f8a0']},
  {id:'trucha', name:'TRUCHA DE ÁMBAR',  min:28, max:42, pay:12, w:.35, pull:1.4, run:.028, stam:140, spd:.55, pal:['#3e1e12','#8a4a30','#c87850','#f0b890','#fff0e0']},
  {id:'bigotes',name:'EL VIEJO BIGOTES', min:68, max:82, pay:30, w:0,   pull:1.9, run:.04,  stam:230, spd:.4,  pal:['#12121e','#2e3048','#4a5070','#7a84a8','#c8d0e8'], legend:true},
];
const FISH_ART=FISH.map((F,i)=>{ const L=[18,22,26,34][i], H=[9,10,11,14][i], c=mkCanvas(L+2,H+2), g=c.getContext('2d');
  blobArt(g,1,1,L-5,H,[{x:(L-5)*.45,y:H/2,r:(L-5)*.46,ry:H*.42},{x:(L-5)*.72,y:H/2,r:(L-5)*.3,ry:H*.36}],F.pal,{grad:.7,dither:.5});
  g.fillStyle=PAL.k; const tx=L-6, ty=H/2+1; for(let k=0;k<5;k++){ g.fillRect(tx+k,ty-k-1,1,k*2+2); } g.fillStyle=F.pal[2]; for(let k=0;k<4;k++){ g.fillRect(tx+k+1,ty-k,1,k*2); }
  g.fillStyle=PAL.k; g.fillRect(3,Math.round(H*.38),2,2); g.fillStyle='#ffffff'; g.fillRect(3,Math.round(H*.38),1,1);
  g.fillStyle=F.pal[1]; g.fillRect(Math.round(L*.35),1,Math.round(L*.2),1);
  if(F.legend){ g.fillStyle=PAL.k; g.fillRect(0,Math.round(H*.55),3,1); g.fillRect(0,Math.round(H*.7),4,1); }
  return c; });
let fishS=null;
const POND={tipX:99,tipY:57,shoreX:92,shoreY:80}; // punta de la caña en reposo y dónde acaba el pez recogido (el muelle)
function fishBit(i){ return 1<<i; }
function legendReady(){ return hasLure&&(fishDex&7)===7; }
function newFish(){ const legendIn=fishS&&fishS.fish.some(f=>FISH[f.t].legend);
  let t; if(legendReady()&&!legendIn&&Math.random()<.35) t=3; else { const r=Math.random()*1.95; t=r<1?0:r<1.6?1:2; }
  const f={t,x:20+Math.random()*120,y:18+Math.random()*60,vx:0,vy:0,st:'swim',tm:Math.random()*60,nib:0};
  return f; }
function startFishing(){
  fishS={phase:'aim',t:0,aimX:80,aimY:48,lure:{x:84,y:84,z:0,dip:0,sink:0},fish:[],hooked:null,tension:0,dist:100,stam:0,run:0,msg:'',msgT:0,card:null};
  for(let i=0;i<5;i++) fishS.fish.push(newFish());
  if(legendReady()&&!fishS.fish.some(f=>FISH[f.t].legend)){ const f=newFish(); f.t=3; fishS.fish.push(f); }
  state='fish'; buildPond(); SFX.menuIn&&SFX.menuIn();
  if(fishCount===0) say(["Mueve el corcho con las FLECHAS y lanza con Z.","Espera. Si mordisquean, ¡quieto! Cuando el corcho se HUNDA del todo, Z.","Luego MANTÉN Z para recoger. Si el sedal se pone rojo, suelta un poco o se rompe."],()=>{ state='fish'; },'MOSS');
  else if(!hasLure) say(["Dicen que en la CASCADA DEL ÁMBAR hay un CEBO DORADO enganchado en mitad del chorro.","Nadie llega nadando... ¿quizá algo que vuele y vuelva?"],()=>{ state='fish'; },'MOSS');
  else if((fishDex&7)!==7) say(["El VIEJO BIGOTES solo muerde a quien ya conoce a sus tres nietos: carpín, perca y trucha."],()=>{ state='fish'; },'MOSS');
}
let pondCv=null;
function buildPond(){
  pondCv=[]; const rows=["TTWWWWWWTT","TWWWWWWWWT","WW@WWWWWWW","WWWWWWW@WW","WWWWWWWWWW","WWWWWWWWWW","sssWWWWsss","ssssssssss"].map(r=>[...r]);
  const o={bio:screenBiome(3,1),style:'cave',floor:'.',sx:3,sy:1,crystal:false,openChests:new Set()};
  for(let f=0;f<4;f++){ const c=mkCanvas(160,144), g=c.getContext('2d'); renderScreenTo(g,rows,0,0,o,f);
    const G=(BIOMES[o.bio]||BIOMES.valley).grass; g.fillStyle=G[0]; g.fillRect(0,128,160,16); g.fillStyle=G[3]; g.fillRect(0,128,160,1);
    for(let x=4;x<160;x+=9){ g.fillStyle=G[1]; g.fillRect(x,132+((x*7)%9),1,2); g.fillRect(x+2,132+((x*7)%9),1,2); }
    pondCv.push(c); }
}
function fishMsg(s,t){ fishS.msg=s; fishS.msgT=t||70; }
function fishEnd(){ fishS=null; state='play'; say(["¡Buena pesca, brote! Vuelve cuando quieras."],null,'MOSS'); }
function updFishing(){
  const S=fishS; if(!S){ state='play'; return; } S.t++; if(S.msgT>0) S.msgT--;
  updParts();
  const L=S.lure, pond=f=>{ f.x=Math.max(10,Math.min(146,f.x)); f.y=Math.max(12,Math.min(86,f.y)); };
  // los peces nadan (menos el que está enganchado)
  for(const f of S.fish){ if(f===S.hooked) continue; const F=FISH[f.t]; f.tm--;
    if(f.st==='swim'){ if(f.tm<=0){ f.tm=40+Math.random()*80; const a=Math.random()*6.283; f.vx=Math.cos(a)*F.spd; f.vy=Math.sin(a)*F.spd*.6; }
      f.x+=f.vx; f.y+=f.vy; pond(f);
      if(S.phase==='wait'&&!S.fish.some(o=>o!==f&&o.st!=='swim'&&o.st!=='flee')){ const d=Math.hypot(f.x-L.x,f.y-L.y);
        if(d<(F.legend?46:36)&&Math.random()<(F.legend?.012:.02)){ f.st='come'; } } }
    else if(f.st==='come'){ const dx=L.x-f.x, dy=L.y-f.y, d=Math.hypot(dx,dy)||1; f.x+=dx/d*F.spd*.8; f.y+=dy/d*F.spd*.8; f.vx=dx/d; f.vy=dy/d;
      if(d<5){ f.st='nibble'; f.nib=(F.legend?3:1)+((Math.random()*3)|0); f.tm=24+Math.random()*30; } }
    else if(f.st==='nibble'){ if(--f.tm<=0){ if(f.nib>0){ f.nib--; f.tm=22+Math.random()*34; L.dip=8; SFX.blip(); } else { f.st='bite'; f.tm=F.legend?15:20; L.sink=1; SFX.ping&&SFX.ping(); fishMsg('¡AHORA!',f.tm); } } }
    else if(f.st==='bite'){ if(--f.tm<=0){ f.st='flee'; f.tm=60; L.sink=0; fishMsg('Se llevó el cebo…'); S.phase='aim'; SFX.bump(); } }
    else if(f.st==='flee'){ const dx=f.x-L.x, dy=f.y-L.y, d=Math.hypot(dx,dy)||1; f.x+=dx/d*1.4; f.y+=dy/d*1.4; pond(f); if(--f.tm<=0) f.st='swim'; } }
  if(L.dip>0) L.dip--;
  if(keys.alt&&(S.phase==='aim'||S.phase==='wait')){ keys.alt=false; fishEnd(); return; }
  keys.alt=false;
  if(S.phase==='aim'){
    const dx=(keys.right?1:0)-(keys.left?1:0), dy=(keys.down?1:0)-(keys.up?1:0);
    S.aimX=Math.max(14,Math.min(146,S.aimX+dx*1.4)); S.aimY=Math.max(16,Math.min(70,S.aimY+dy*1.1));
    if(keys.fire){ keys.fire=false; if(S.t>6){ S.phase='cast'; S.t=0; S.cast={x0:POND.tipX,y0:POND.tipY,x1:S.aimX,y1:S.aimY}; SFX.swoosh&&SFX.swoosh(); } }
  } else if(S.phase==='cast'){
    const k=Math.min(1,S.t/22); L.x=S.cast.x0+(S.cast.x1-S.cast.x0)*k; L.y=S.cast.y0+(S.cast.y1-S.cast.y0)*k; L.z=Math.sin(k*Math.PI)*22;
    if(k>=1){ S.phase='wait'; L.z=0; L.sink=0; noise(.12,.05,false); for(let i=0;i<3;i++) parts.push({k:'ripple',x:L.x,y:L.y+2,vx:0,vy:0,life:20+i*6,max:26,col:'#d8f0ff',nog:true}); }
    keys.fire=false;
  } else if(S.phase==='wait'){
    if(keys.fire){ keys.fire=false; const b=S.fish.find(f=>f.st==='bite'), n=S.fish.find(f=>f.st==='nibble'||f.st==='come');
      if(b){ S.hooked=b; b.st='hooked'; S.phase='reel'; S.tension=24; S.dist=100; S.stam=FISH[b.t].stam; S.run=0; L.sink=1; SFX.sword(); shake=3; fishMsg('¡CLAVADO!',40); }
      else if(n&&n.st==='nibble'){ n.st='flee'; n.tm=70; fishMsg('¡Muy pronto!'); SFX.bump(); S.phase='aim'; }
      else { S.phase='aim'; SFX.blip(); } }
  } else if(S.phase==='reel'){
    const f=S.hooked; if(!f){ S.phase='aim'; return; } const F=FISH[f.t], hold=!!keys.fireHeld;
    if(S.run<=0&&S.stam>0&&Math.random()<F.run){ S.run=25+((Math.random()*25)|0); SFX.bump(); }
    const running=S.run>0; if(running) S.run--;
    if(hold){ S.dist-=running?.1:.42; S.tension+=running?2.2*F.pull:.5*F.pull; S.stam-=1; }
    else { S.tension-=1.5; S.dist+=running?.32*F.pull:.04; }
    if(S.stam<=0){ S.tension-=.3; }
    S.tension=Math.max(0,Math.min(100,S.tension));
    if(running&&(tick&3)===0) parts.push({k:'ripple',x:f.x,y:f.y+2,vx:0,vy:0,life:14,max:14,col:'#ffffff',nog:true});
    const sx0=POND.shoreX, sy0=POND.shoreY; f.x=sx0+(L.x-sx0)*S.dist/100+Math.sin(S.t*.3)*(running?4:1.5); f.y=sy0+(L.y-sy0)*S.dist/100;
    if(hold&&(S.t&7)===0) beep('square',300+(100-S.dist)*4,0,.02,.02);
    if(S.tension>=100){ fishMsg('¡Se rompió el sedal!',90); SFX.hurt&&SFX.hurt(); S.fish=S.fish.filter(o=>o!==f); S.fish.push(newFish()); S.hooked=null; S.phase='aim'; shake=4; }
    else if(S.dist>=108){ fishMsg('Se escapó…',80); SFX.bump(); f.st='flee'; f.tm=90; S.hooked=null; S.phase='aim'; }
    else if(S.dist<=0){ const size=Math.round(F.min+Math.random()*(F.max-F.min)), first=!(fishDex&fishBit(f.t));
      S.card={t:f.t,size,first,pay:F.pay+Math.round((size-F.min)/(F.max-F.min)*F.pay),t0:S.t}; S.phase='caught'; SFX.fanfare(); shake=4;
      S.fish=S.fish.filter(o=>o!==f); S.hooked=null; puff(sx0,sy0,'#d8f0ff',8,1.2); for(let i=0;i<8;i++) sparkle(sx0+Math.random()*16-8,sy0-6+Math.random()*10,'#fff6c0'); }
  } else if(S.phase==='caught'){
    if(keys.fire&&S.t-S.card.t0>20){ keys.fire=false; const c=S.card, F=FISH[c.t];
      fishDex|=fishBit(c.t); fishCount++; if(!fishBest[F.id]||c.size>fishBest[F.id]) fishBest[F.id]=c.size;
      berries=Math.min(999,berries+c.pay); hudBerryT=14; S.card=null; S.phase='aim'; S.fish.push(newFish()); save();
      if(F.legend&&!fishPiece){ fishPiece=true; pieces++; SFX.piece&&SFX.piece(); let extra=[];
        if(pieces>=4){ pieces=0; player.maxHp+=2; player.hp=player.maxHp; extra=["¡Cuatro cuartos! Tu vigor aumenta."]; }
        save(); say(["¡Dentro del Viejo Bigotes había un CUARTO DE CORAZÓN! ("+(pieces||4)+"/4)"].concat(extra),()=>{ state='fish'; },'MOSS'); } }
    else keys.fire=false;
  }
  if(S.phase!=='wait'&&S.phase!=='reel') for(const f of S.fish) if(f.st==='come'||f.st==='nibble'||f.st==='bite'){ f.st='swim'; }
  if(S.phase==='aim') L.sink=0;
}
