'use strict';
/* ---------- REGIONES, BIOMAS Y CARGA DE PANTALLA ---------- */
const inTown=(x,y)=>(x===1&&y===1)||(x===0&&y===1);
const inValleyScr=(x,y)=>x>=0&&x<=4&&y>=0&&y<=2;
function seasonPhase(){ return cycled?(((tick/3000)|0)%4):-1; } // post-final: las estaciones giran (~50s cada una)
function regionOf(nx,ny){
  if(ny===9&&nx>=7&&nx<=9) return 'casa';
  if(ny===9&&nx===5) return 'gruta';
  if(ny===9&&(nx===3||nx===4)) return 'secreto';
  if(nx>=6&&nx<=8) return 'cueva';
  if(nx>=10&&nx<=12) return 'tronco';
  if(nx>=14&&nx<=16) return 'templo';
  if(ny<=-1) return 'norte';
  if(ny===3) return 'marisma';
  return 'valle';
}
function dungeonOf(nx,ny){ const r=regionOf(nx,ny); return (r==='cueva'||r==='tronco'||r==='templo')?r:null; }
function screenBiome(nx,ny){ // qué estación se VE en una pantalla
  const r=regionOf(nx,ny);
  if(r==='norte') return (thawed&&ny===-1)?'valley':'snow';
  if(r==='marisma') return summered?'valley':'autumn';
  if(r==='valle'){
    if(!won) return 'wilt';
    const ph=inValleyScr(nx,ny)?seasonPhase():-1;
    return ph===1?'summer':ph===2?'autumn':ph===3?'snow':'valley';
  }
  return 'valley';
}
function screenStyle(nx,ny){ const r=regionOf(nx,ny);
  if(r==='tronco') return (nx===10&&ny===2)?'hive':'wood';
  if(r==='templo') return 'ice'; return 'cave'; }
function regionFloor(){ const r=regionOf(sx,sy);
  if(r==='norte') return (thawed&&sy===-1)?'.':'n';
  if(r==='cueva'||r==='tronco'||r==='templo'||r==='gruta'||r==='secreto') return 'q';
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
function rebuildBg(){
  for(let f=0;f<2;f++){ if(!bgCanvas[f]) bgCanvas[f]=mkCanvas(160,128);
    const g=bgCanvas[f].getContext('2d'); g.clearRect(0,0,160,128); renderScreenTo(g,grid,0,0,renderOpts(),f); }
  bgDirty=false;
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
      if(en.type==='icicle'&&thawed&&sy===-1) continue; // sin invierno no hay carámbanos
      if(en.type==='thorn'&&dng) en.hp=4;
      enemies.push(en);
    } else if(MIDBOSS_MARK[ch]){
      grid[y][x]=regionFloor();
      const t=MIDBOSS_MARK[ch], done=(t==='king'&&midKing)||(t==='drone'&&midDrone)||(t==='iceguard'&&midIce);
      if(!done) midboss=makeMidboss(t,x,y);
      else if(t==='king'&&!hasBomb) pickups.push({kind:'bomb',x:x*16,y:y*16,t:0});
      else if(t==='drone'&&!hasHook) pickups.push({kind:'hook',x:x*16,y:y*16,t:0});
      else if(t==='iceguard'&&!hasFeather) pickups.push({kind:'feather',x:x*16,y:y*16,t:0});
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
  setTrack(boss?'jefe':midboss?'minijefe':(r2==='casa'?((sx===8||sx===7)?'tienda':'casa'):sy===-3?'cima':r2==='norte'?'nieve':r2==='cueva'?'cueva':(r2==='gruta'||r2==='secreto')?'gruta':r2==='templo'?'templo':r2==='tronco'?'cueva':r2==='marisma'?'pantano':'valle'));
  visited.add(key);
  if((boss||midboss)&&AC) SFX.boss();
  bossCard=boss?{txt:boss.type==='topo'?'EL TOPO REAL':boss.type==='avispa'?'LA REINA AVISPA':'EL VIENTO DEL NORTE',t:130}:midboss?{txt:MID_CARD[midboss.type],t:130}:null;
  if(midboss&&!hinted.has('mid'+midboss.type)){ hinted.add('mid'+midboss.type); pendingSay=MID_INTRO[midboss.type].slice(); }
  const reg=regionOf(sx,sy);
  if(reg!=='casa'&&respawnPoint.reg!==reg&&REGION_ANCHOR[reg]) respawnPoint={...REGION_ANCHOR[reg],reg};
  markDirty();
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
function leaves(x,y){ const P=BIOMES[screenBiome(sx,sy)].bush; puff(x,y,P[1],5,1.2); puff(x,y,P[0],4,1); }
function sparkle(x,y,col){ parts.push({x,y,vx:0,vy:-.3,life:16,col:col||C.flowerC,star:true}); }
function updParts(){ for(const p of parts){ p.x+=p.vx; p.y+=p.vy; if(!p.nog) p.vy+=.02; p.life--; } parts=parts.filter(p=>p.life>0);
  for(const f of flyText){ f.y-=.35; f.t--; } flyText=flyText.filter(f=>f.t>0); }
