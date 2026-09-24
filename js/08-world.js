'use strict';
/* ---------- REGIONES, BIOMAS Y CARGA DE PANTALLA ---------- */
const inTown=(x,y)=>(x===1&&y===1)||(x===0&&y===1);
const inValleyScr=(x,y)=>x>=0&&x<=4&&y>=0&&y<=2;
function seasonPhase(){ return cycled?(((tick/3000)|0)%4):-1; } // post-final: las estaciones giran (~50s cada una)
/* la estación del valle: la última que volvió a su altar junto al Roble (tras el Copo, giran solas).
   -1: el año sigue atascado (el Roble respira, pero aún no ha vuelto ninguna) · 0 primavera · 1 verano · 2 otoño · 3 invierno */
let SEASON_FORCE=null; // las cinemáticas pintan el valle en una estación concreta (15f)
function valleySeason(){ if(SEASON_FORCE!==null) return SEASON_FORCE; if(cycled) return seasonPhase(); if(autumned) return 2; if(summered) return 1; if(thawed) return 0; return -1; }
function seasonBio(s){ return s===1?'summer':s===2?'autumn':s===3?'snow':'valley'; }
function regionOf(nx,ny){
  if(ny===12) return 'eco';   // post-juego: el Eco de los Guardianes
  if(ny===9&&nx>=7&&nx<=9) return 'casa';
  if(ny===9&&nx===5) return 'gruta';
  if(ny===9&&(nx===3||nx===4)) return 'secreto';
  if(ny===10&&nx>=0&&nx<=6) return 'secreto'; // los escondites del mundo (12c)
  if(nx>=6&&nx<=8) return 'cueva';
  if(nx>=10&&nx<=12) return 'tronco';
  if(nx>=14&&nx<=16) return 'templo';
  if(nx>=18&&nx<=20) return 'molino';
  if(ny<=-1) return 'norte';
  if(ny===3) return 'marisma';
  return 'valle';
}
function dungeonOf(nx,ny){ const r=regionOf(nx,ny); return (r==='cueva'||r==='tronco'||r==='templo'||r==='molino')?r:null; }
function screenBiome(nx,ny){ // qué estación se VE en una pantalla
  const r=regionOf(nx,ny);
  if(r==='norte') return (thawed&&ny===-1)?seasonBio(valleySeason()):'snow'; // el deshielo baja del Roble: las laderas siguen al valle
  if(r==='marisma') return summered?seasonBio(valleySeason()):'autumn';        // sin verano, un otoño viejo que se pudre
  if(r==='valle'){
    if(!won) return 'wilt';
    return inValleyScr(nx,ny)?seasonBio(valleySeason()):'valley';
  }
  return 'valley';
}
function screenStyle(nx,ny){ const r=regionOf(nx,ny);
  if(r==='tronco') return (nx===10&&ny===2)?'hive':'wood';
  if(r==='templo') return 'ice'; if(r==='molino') return 'mill'; return 'cave'; }
function regionFloor(){ const r=regionOf(sx,sy);
  if(r==='norte') return (thawed&&sy===-1)?'.':'n';
  if(r==='cueva'||r==='tronco'||r==='templo'||r==='molino'||r==='gruta'||r==='secreto') return 'q';
  if(r==='casa') return 'o';
  if(r==='marisma') return summered?'.':'·';
  return '.';
}
const REGION_ANCHOR={
  valle:{sx:1,sy:1,x:72,y:78,name:'el pueblo'},
  norte:{sx:1,sy:-1,x:72,y:40,name:'el campo helado'},
  marisma:{sx:2,sy:3,x:112,y:72,name:'las marismas'},
  cueva:{sx:6,sy:0,x:72,y:72,name:'la cueva del Topo'},
  tronco:{sx:10,sy:0,x:72,y:72,name:'el Tronco Hueco'},
  templo:{sx:15,sy:2,x:72,y:88,name:'el templo'},
  gruta:{sx:5,sy:9,x:72,y:80,name:'la gruta'},
};
let respawnPoint={sx:1,sy:1,x:72,y:78,name:'el pueblo',reg:'valle'};
function renderOpts(){ return {bio:screenBiome(sx,sy),style:screenStyle(sx,sy),floor:regionFloor(),sx,sy,crystal:crystalOn,openChests:openChestSet()}; }
function openChestSet(){ const s=new Set(); for(const id of opened) if(id.startsWith('CH'+sx+','+sy+':')) s.add(id.slice(('CH'+sx+','+sy+':').length)); return s; }
const BG_FRAMES=4;
function bgFrame(){ return (tick>>3)&3; }   // agua, hierba alta y antorchas: 4 fotogramas de 8 ticks
function rebuildBg(){
  const o=renderOpts();
  for(let f=0;f<BG_FRAMES;f++){ if(!bgCanvas[f]){ bgCanvas[f]=mkCanvas(160,128); fgCanvas[f]=mkCanvas(160,128); }
    const g=bgCanvas[f].getContext('2d'), fg=fgCanvas[f].getContext('2d'); g.clearRect(0,0,160,128); fg.clearRect(0,0,160,128); renderScreenTo(g,grid,0,0,o,f,fg); }
  bgDirty=false;
  const r=regionOf(sx,sy); if(r==='valle'||r==='norte'||r==='marisma') thumbOf(sx+','+sy,bgCanvas[0]);
}
/* miniatura de una pantalla para el mapa (18×14, sin actores) */
function thumbOf(key,src){
  if(!THUMBS[key]) THUMBS[key]=mkCanvas(18,14);
  const g=THUMBS[key].getContext('2d'); g.imageSmoothingEnabled=true; g.clearRect(0,0,18,14); g.drawImage(src,0,0,160,128,0,0,18,14);
  return THUMBS[key];
}
function ensureThumb(key){ // para partidas cargadas: dibuja la pantalla en frío
  if(THUMBS[key]) return THUMBS[key];
  const [x,y]=key.split(',').map(Number); if(!MAPS[key]) return null;
  const rows=MAPS[key].map(r=>[...r].map(ch=>(ENEMY_MARK[ch]||MIDBOSS_MARK[ch]||BOSS_MARK[ch]||ITEM_MARK[ch]||/[1-8]/.test(ch))?'.':ch));
  const c=mkCanvas(160,128); const r=regionOf(x,y);
  const bio=screenBiome(x,y), floor=r==='norte'?((thawed&&y===-1)?'.':'n'):r==='marisma'?(summered?'.':'·'):'.';
  renderScreenTo(c.getContext('2d'),rows,0,0,{bio,style:'cave',floor,sx:x,sy:y,crystal:false,openChests:new Set()},0);
  return thumbOf(key,c);
}
function markDirty(){ bgDirty=true; }
/* tabla de equilibrio: vida, daño (medios corazones) y velocidad base */
const ENEMY_STATS={
  blob:{hp:2,dmg:1}, bat:{hp:1,dmg:1}, beetle:{hp:3,dmg:1}, roller:{hp:3,dmg:1}, ghost:{hp:2,dmg:1}, frog:{hp:2,dmg:1},
  thorn:{hp:3,dmg:1}, gust:{hp:2,dmg:0}, squirrel:{hp:2,dmg:0}, icicle:{hp:1,dmg:2}, seton:{hp:3,dmg:1}, crab:{hp:2,dmg:1},
  wisp:{hp:2,dmg:1}, bee:{hp:1,dmg:1}, golem:{hp:4,dmg:2}, snail:{hp:2,dmg:1}, topillo:{hp:2,dmg:1}, lirio:{hp:3,dmg:1}, rodahoja:{hp:2,dmg:1},
};
/* spawn de enemigos */
function spawnEnemy(type,x,y,fast){
  const base={type,x:x*16,y:y*16,hp:1,vx:0,vy:0,t:hash(x,y)%90,flash:0,kx:0,ky:0,fast,stun:0,dmg:1};
  switch(type){
    case 'blob':   return {...base,hp:2+fast};
    case 'bat':    return {...base,homing:0,t:hash(x,y)%120};
    case 'beetle': return {...base,hp:3,dir:(hash(x,y)&1)?1:-1};
    case 'roller': return {...base,hp:3,st:'idle',rx:0,ry:0,bounce:0};
    case 'ghost':  return {...base,hp:2,phase:0};
    case 'frog':   return {...base,hp:2,st:'sit',jx:0,jy:0};
    case 'thorn':  return {...base,hp:3,st:'closed',y:y*16-2};
    case 'gust':   return {...base,hp:2,ang:hash(x,y)%628/100};
    case 'squirrel': return {...base,hp:2,st:'wander',dirx:1};
    case 'icicle': return {...base,hp:1,st:'hang',x0:x*16,vy:0,dmg:2};
    case 'seton':  return {...base,hp:3,st:'idle'};
    case 'crab':   return {...base,hp:2,dir:1};
    case 'wisp':   return {...base,hp:2};
    case 'bee':    return {...base,hp:1,homing:0};
    case 'golem':  return {...base,hp:4,dmg:2,st:'walk'};
    case 'snail':  return {...base,hp:2,st:'out'};
    case 'topillo': return {...base,hp:2,st:'hide',t:60+hash(x,y)%60,hx:x*16,hy:y*16};
    case 'lirio':  return {...base,hp:3,st:'closed',t:hash(x,y)%100};
    case 'rodahoja': return {...base,hp:2,vx:(hash(x,y)&1)?1.1:-1.1,vy:(hash(y,x)&1)?.9:-.9};
  }
  return base;
}
function under(rows,x,y){ // suelo bajo un objeto retirado (semilla, arbusto cortado...)
  const n=[[1,0],[-1,0],[0,1],[0,-1]];
  for(const [dx,dy] of n){ const r=rows[y+dy]; if(r&&r[x+dx]==='s') return 's'; }
  for(const [dx,dy] of n){ const r=rows[y+dy]; if(r&&r[x+dx]==='p') return 'p'; }
  return regionFloor();
}
function loadScreen(nx,ny){
  sx=nx; sy=ny;
  grid=MAPS[sx+','+sy].map(r=>[...r]);
  enemies=[]; pickups=[]; elderPos=null; npcs=[]; boss=null; midboss=null; bombs=[]; projs=[]; windProjs=[]; boomer=null; hook=null; jumpT=0;
  plateCells.clear(); pushHold=0; crystalOn=opened.has('CR'+sx+','+sy);
  const dng=dungeonOf(sx,sy), r=regionOf(sx,sy);
  const fast=(dng||r==='norte'||r==='gruta')?1:0;
  for(let y=0;y<SH;y++) for(let x=0;x<SW;x++){
    const ch=grid[y][x], id=sx+','+sy+','+x+','+y;
    if(ENEMY_MARK[ch]){
      grid[y][x]=regionFloor();
      const en=spawnEnemy(ENEMY_MARK[ch],x,y,fast);
      const st=ENEMY_STATS[en.type]; if(st){ en.hp=st.hp; en.dmg=st.dmg; }
      if((r==='norte'||r==='marisma')&&(en.type==='blob'||en.type==='bat')) en.hp+=1; // bichos curtidos
      if(r==='norte'&&en.type==='roller') en.dmg=2;
      if(r==='templo'&&en.type!=='golem') en.hp+=1;
      if(r==='tronco'&&en.type!=='bee') en.hp+=1;                       // cada mazmorra, más dura que la anterior
      if((r==='tronco'&&['beetle','snail','thorn','seton'].includes(en.type))||(r==='templo'&&en.type!=='bat'&&en.type!=='bee')) en.dmg=Math.max(en.dmg,2);
      if(en.type==='icicle'&&thawed&&sy===-1) continue; // sin invierno no hay carámbanos
      if(en.type==='thorn'&&dng) en.hp=4;
      if((opts.diff??1)===2) en.hp+=1;                                   // difícil: un golpe más para todos
      enemies.push(en);
    } else if(MIDBOSS_MARK[ch]){
      grid[y][x]=regionFloor();
      const t=MIDBOSS_MARK[ch], done=(t==='king'&&midKing)||(t==='drone'&&midDrone)||(t==='iceguard'&&midIce)||(t==='scare'&&midScare);
      if(!done) midboss=makeMidboss(t,x,y);
      else if(t==='king'&&!hasBomb) pickups.push({kind:'bomb',x:x*16,y:y*16,t:0});
      else if(t==='drone'&&!hasHook) pickups.push({kind:'hook',x:x*16,y:y*16,t:0});
      else if(t==='iceguard'&&!hasFeather) pickups.push({kind:'feather',x:x*16,y:y*16,t:0});
      else if(t==='scare'&&!hasPinwheel) pickups.push({kind:'molinillo',x:x*16,y:y*16,t:0});
    } else if(/[1-8]/.test(ch)){
      grid[y][x]=under(grid,x,y);
      if(!collected.has(id)) pickups.push({kind:'seed',id,x:x*16+4,y:y*16+4,t:0});
    } else if(ch==='9'){
      grid[y][x]=under(grid,x,y);
      if(!collected.has('9'+id)) pickups.push({kind:'container',id:'9'+id,x:x*16+4,y:y*16+4,t:0});
    } else if(ch==='♥'){
      grid[y][x]=under(grid,x,y);
      if(!collected.has('♥'+id)) pickups.push({kind:'piece',id:'♥'+id,x:x*16+4,y:y*16+4,t:0});
    } else if(ch==='Q'){
      if(cutQ.has('Q'+id)){ grid[y][x]=under(grid,x,y);
        if(!collected.has('Q'+id)) pickups.push({kind:'seed',id:'Q'+id,x:x*16+4,y:y*16+4,t:0}); }
    } else if(ch==='L'){ grid[y][x]=under(grid,x,y); if(!hasBlade) pickups.push({kind:'blade',x:x*16,y:y*16,t:0}); }
    else if(ch==='K'){ grid[y][x]='q'; if(!hasBomb) pickups.push({kind:'bomb',x:x*16,y:y*16,t:0}); }
    else if(ch==='+'){ grid[y][x]='q'; if(!hasHook) pickups.push({kind:'hook',x:x*16,y:y*16,t:0}); }
    else if(ch==='£'){ grid[y][x]=regionFloor(); if(!hasBoomer) pickups.push({kind:'boomer',x:x*16,y:y*16,t:0}); }
    else if(ch==='§'){ grid[y][x]=regionFloor(); if(!hasLantern) pickups.push({kind:'lantern',x:x*16,y:y*16,t:0}); }
    else if(ch==='¬'){ grid[y][x]=regionFloor(); if(!hasFeather) pickups.push({kind:'feather',x:x*16,y:y*16,t:0}); }
    else if(ch==='0'){ grid[y][x]=regionFloor(); if(!collected.has('d'+id)) pickups.push({kind:'diary',id:'d'+id,x:x*16+4,y:y*16+4,t:0}); }
    else if(ch==='('){ grid[y][x]=regionFloor(); if(!collected.has('('+id)) pickups.push({kind:'key',id:'('+id,x:x*16+4,y:y*16+4,t:0}); }
    else if(ch==='✉'){ grid[y][x]=under(grid,x,y); if(!collected.has('✉'+id)) pickups.push({kind:'letter',id:'✉'+id,x:x*16+2,y:y*16+4,t:0}); }
    else if(ch==='ø'){ if(opened.has('HS'+sx+','+sy)) grid[y][x]='>'; }
    else if(ch==='ł'){ grid[y][x]=regionFloor(); if(!collected.has('ł'+id)) pickups.push({kind:'bigkey',id:'ł'+id,x:x*16+4,y:y*16+4,t:0}); }
    else if(ch==='J'){ grid[y][x]='q'; if(!bossDone) boss=makeBoss('topo',x,y); else if(!hasEmber) pickups.push({kind:'ember',x:x*16,y:y*16,t:0}); }
    else if(ch==='!'){ grid[y][x]='q'; if(!boss2Done) boss=makeBoss('avispa',x,y); else if(!hasTear) pickups.push({kind:'tear',x:x*16,y:y*16,t:0}); }
    else if(ch==='^'){ grid[y][x]='n'; if(!boss3Done) boss=makeBoss('viento',x,y); else if(!hasFlake) pickups.push({kind:'flake',x:x*16,y:y*16,t:0}); }
    else if(ch==='Λ'){ grid[y][x]='q'; if(!boss4Done) boss=makeCiervo(x,y); else if(!hasAmber) pickups.push({kind:'amber',x:x*16,y:y*16,t:0}); }
    else if(ch==='C'){ if(opened.has('C:'+sx+','+sy+':'+x+','+y)) grid[y][x]=regionFloor(); }
    else if(ch==='='){ if(opened.has('G'+sx+','+sy)||opened.has('PZ'+sx+','+sy)) grid[y][x]='q'; }
    else if(ch==='%'){ if(opened.has('G'+sx+','+sy)) grid[y][x]='&'; }
    else if(ch==='_'){ plateCells.add(x+','+y); if(opened.has('PZ'+sx+','+sy)) grid[y][x]='#'; }
    else if(ch===')'){ if(opened.has('LK'+sx+','+sy+':'+x+','+y)) grid[y][x]='q'; }
    else if(ch==='Ł'){ if(opened.has('BK'+sx+','+sy)) grid[y][x]='q'; }
    else if(ch===':'){ if(opened.has('T'+sx+','+sy+':'+x+','+y)) grid[y][x]=';'; }
    else if(ch==='ª'||ch==='º'||ch==='Æ'||ch==='æ'){ if(crystalOn) grid[y][x]={'ª':'º','º':'ª','Æ':'æ','æ':'Æ'}[ch]; }
    else if(ch==='z'){ if(won) grid[y][x]='zd'; }
    else if(NPCS[ch]){ npcs.push({ch,x,y}); }
    else if(ch==='E'){ elderPos=[x,y]; }
  }
  if(opened.has('PZ'+sx+','+sy)&&plateCells.size&&!hasGate()) { /* recompensa ya dada */ }
  // el pueblo florece con cada estación que vuelve
  if(inTown(sx,sy)&&won){ const dens=cycled?2:(summered?3:(thawed?4:6));
    for(let y=0;y<SH;y++) for(let x=0;x<SW;x++) if(grid[y][x]==='.'&&hash(x*5+1,y*9+3)%dens===0) grid[y][x]='f'; }
  // la voz del Roble te guía
  if(sx===0&&sy===1&&!elderMet&&introDone&&!barrioCall){ barrioCall=true;
    pendingSay=["(Una voz antigua\nresuena entre las\ncasas...","Viene de la PLAZA,\nal ESTE.)"]; }
  if(sx===1&&sy===1&&!elderMet&&introDone&&!plazaCall){ plazaCall=true;
    pendingSay=["(El GRAN ROBLE se\nalza gris y mudo\nsobre la plaza.","El anciano espera\na sus raíces.)"]; }
  const key=sx+','+sy;
  if(ROOM_HINTS[key]&&!hinted.has(key)&&!(key==='0,2'&&hasBlade)&&!(key==='6,2'&&bossDone)&&!(key==='10,2'&&boss2Done)&&!(key==='1,-3'&&boss3Done)&&!(key==='2,3'&&summered)&&!(key==='1,-2'&&cycled)){
    hinted.add(key); pendingSay=ROOM_HINTS[key].slice(); }
  if(sx===1&&sy===-3&&cycled&&!windVisit){ windVisit=true; pendingSay=WIND_WHISPER.slice(); }
  if(sx===1&&sy===1&&cycled&&!collected.has('dplaza')&&[...collected].filter(i=>i[0]==='d').length>=6)
    pickups.push({kind:'diary',id:'dplaza',x:8*16+4,y:2*16+4,t:0});
  // huéspedes tras la tregua: los guardianes se quedan a charlar
  if(sx===6&&sy===2&&bossDone) npcs.push({ch:'topo',x:5,y:2,guest:'topo'});
  if(sx===10&&sy===2&&boss2Done) npcs.push({ch:'reina',x:5,y:2,guest:'avispa'});
  if(sx===1&&sy===-3&&boss3Done) npcs.push({ch:'viento',x:4,y:2,guest:'viento'});
  const r2=regionOf(sx,sy);
  setTrack(boss?'jefe':midboss?'minijefe':(r2==='casa'?((sx===8||sx===7)?'tienda':'casa'):sy===-3?'cima':r2==='norte'?'nieve':r2==='cueva'?'cueva':(r2==='gruta'||r2==='secreto')?'gruta':r2==='templo'?'templo':r2==='tronco'?'cueva':r2==='molino'?(TRACKS.molino?'molino':'cueva'):r2==='marisma'?'pantano':'valle'));
  const firstVisit=!visited.has(key); visited.add(key);
  if(firstVisit&&PLACE_NAMES[key]&&introDone&&!boss&&!midboss) placeBanner={txt:PLACE_NAMES[key],t:110};
  if((boss||midboss)&&AC) SFX.boss();
  bossCard=boss?{txt:boss.type==='topo'?'EL TOPO REAL':boss.type==='avispa'?'LA REINA AVISPA':boss.type==='ciervo'?'EL CIERVO DE ÁMBAR':'EL VIENTO DEL NORTE',t:130}:midboss?{txt:MID_CARD[midboss.type],t:130}:null;
  if(midboss&&!hinted.has('mid'+midboss.type)){ hinted.add('mid'+midboss.type); pendingSay=MID_INTRO[midboss.type].slice(); }
  const reg=regionOf(sx,sy);
  if(reg!=='casa'&&respawnPoint.reg!==reg&&REGION_ANCHOR[reg]) respawnPoint={...REGION_ANCHOR[reg],reg};
  if(sx===1&&sy===-3&&boss3Done) for(let y=0;y<SH;y++) for(let x=0;x<SW;x++) if(grid[y][x]===':') grid[y][x]=';'; // los braseros de la cima arden en paz
  initRoomRules(); initSecrets(); initMill(); markDirty();
  if(state!=='title'&&state!=='boot'&&state!=='file') save();
}
function hasGate(){ for(let y=0;y<SH;y++) for(let x=0;x<SW;x++) if(grid[y][x]==='=') return true; return false; }

/* ---------- COLISIONES ---------- */
function isSolid(ch){ if(ch==='z') return !won; if(ch==='zd') return false; return SOLID.has(ch); }
function solidAt(px,py){
  if(px<0||py<0||px>=SW*16||py>=SH*16) return true;
  return isSolid(grid[py>>4][px>>4]);
}
function boxFree(x,y,w,h){ return !solidAt(x,y)&&!solidAt(x+w-1,y)&&!solidAt(x,y+h-1)&&!solidAt(x+w-1,y+h-1); }
function tileAt(px,py){ const r=grid[py>>4]; return r?r[px>>4]:undefined; }

/* ---------- PARTÍCULAS ---------- */
function puff(x,y,col,n,spd){
  for(let i=0;i<(n||6);i++){ const a=Math.random()*6.283, s=(spd||1)*(.4+Math.random());
    parts.push({x,y,vx:Math.cos(a)*s,vy:Math.sin(a)*s-.3,life:14+Math.random()*10,col}); }
}
function leaves(x,y){ const B=BIOMES[screenBiome(sx,sy)], P=B.bush; puff(x,y,P[1],3,1.2); bladeBits(x,y,[B.bushL[1],B.bushL[2],B.bushL[3],B.bushL[4]],9); parts.push({k:'dust',x,y,vx:0,vy:-.1,life:12,max:12,r:4,col:B.bushL[3],nog:true}); }
function sparkle(x,y,col){ parts.push({x,y,vx:0,vy:-.3,life:16,col:col||C.flowerC,star:true}); }
function updParts(){ for(const p of parts){ p.x+=p.vx; p.y+=p.vy; if(!p.nog) p.vy+=.02; if(p.k) stepPart(p); p.life--; } parts=parts.filter(p=>p.life>0);
  for(const f of flyText){ f.y-=.35; f.t--; } flyText=flyText.filter(f=>f.t>0); }
