'use strict';
/* ---------- CARGA DE PANTALLA ---------- */
function under(rows,x,y){
  const n=[[1,0],[-1,0],[0,1],[0,-1]];
  for(const [dx,dy] of n){ const r=rows[y+dy]; if(r&&r[x+dx]==='s') return 's'; }
  return '.';
}
function renderScreenTo(c2d, rows, ox, oy){
  for(let y=0;y<SH;y++) for(let x=0;x<SW;x++){
    let ch=rows[y][x];
    if(ch==='z'&&won) ch='zd';                 // zarza seca
    else if(thawed&&sy===-1&&THAW[ch]) ch=THAW[ch]; // deshielo del norte (la cima sigue nevada)
    else if(sy===3&&!summered&&AUTUMN[ch]) ch=AUTUMN[ch]; // otoño eterno de las marismas
    const t=TILES[ch]||TILES['.'];
    let fr=0;
    if(t.anim) fr=(tick>>4)&1;
    else if(t.v>1) fr=hash(x+sx*SW,y+sy*SH)%t.v;
    c2d.drawImage(t.frames[fr],ox+x*TILE,oy+y*TILE);
  }
}
function buildRows(kx,ky){
  const src=MAPS[kx+','+ky].map(r=>r.split(''));
  for(let y=0;y<SH;y++) for(let x=0;x<SW;x++){
    const ch=src[y][x];
    if('BV'.includes(ch)||/[1-8]/.test(ch)) { /* se resuelve en loadScreen */ }
  }
  return src;
}
/* marcadores de enemigo en los mapas → tipo */
const ENEMY_MARK={ B:'blob', V:'bat', Z:'beetle', U:'roller', N:'ghost', X:'frog', '*':'thorn', '@':'gust' };
function spawnEnemy(type,x,y,fast){
  const base={type,x:x*16,y:y*16,hp:1,vx:0,vy:0,t:hash(x,y)%90,flash:0,kx:0,ky:0,fast};
  if(type==='blob')   return {...base,hp:2+fast};
  if(type==='bat')    return {...base,homing:0,t:hash(x,y)%120};
  if(type==='beetle') return {...base,hp:2,dir:(hash(x,y)&1)?1:-1,vx:0};
  if(type==='roller') return {...base,hp:2,st:'idle',rx:0,ry:0,bounce:0};
  if(type==='ghost')  return {...base,hp:2,phase:0};
  if(type==='frog')   return {...base,hp:2,st:'sit',jx:0,jy:0};
  if(type==='thorn')  return {...base,hp:3,st:'closed',y:y*16-2};
  if(type==='gust')   return {...base,hp:2,ang:hash(x,y)%628/100};
  return base;
}
function regionFloor(){ return sy<=-1?'n':(sx>=6?'q':(sy===3?'·':'.')); }
/* regiones → punto de rebrote (la muerte te devuelve a la entrada de la región) */
function regionOf(nx,ny){
  if(nx===9||nx===8) return 'casa';
  if(nx>=6&&nx<=7) return 'cueva';
  if(nx>=10&&nx<=11) return 'tronco';
  if(ny<=-1) return 'norte';
  if(ny===3) return 'marisma';
  return 'valle';
}
const REGION_ANCHOR={
  valle:{sx:1,sy:1,x:72,y:78,name:'el pueblo'},
  norte:{sx:1,sy:-1,x:72,y:40,name:'el campo helado'},
  marisma:{sx:2,sy:3,x:72,y:58,name:'las marismas'},
  cueva:{sx:6,sy:0,x:72,y:72,name:'la cueva del Topo'},
  tronco:{sx:10,sy:0,x:72,y:72,name:'el Tronco Hueco'},
};
let respawnPoint={sx:1,sy:1,x:72,y:78,name:'el pueblo',reg:'valle'};
function loadScreen(nx,ny){
  sx=nx; sy=ny;
  grid=MAPS[sx+','+sy].map(r=>r.split(''));
  enemies=[]; pickups=[]; elderPos=null; signPos=[]; npcs=[]; boss=null; bombs=[]; projs=[]; windProjs=[];
  plateCells.clear(); pushHold=0;
  const inDng = sx>=6&&sx<=7;
  for(let y=0;y<SH;y++) for(let x=0;x<SW;x++){
    const ch=grid[y][x];
    if(ENEMY_MARK[ch]){
      grid[y][x]= inDng?'q':(sy<=-1?'n':(sy===3?regionFloor():under(grid,x,y)));
      const fast=(inDng||sy<=-1)?1:0;
      enemies.push(spawnEnemy(ENEMY_MARK[ch],x,y,fast));
    } else if(/[1-8]/.test(ch)){
      const id=sx+','+sy+','+x+','+y;
      grid[y][x]=under(grid,x,y);
      if(!collected.has(id)) pickups.push({kind:'seed',id,x:x*16+4,y:y*16+4,t:0});
    } else if(ch==='9'){
      const id='9'+sx+','+sy+','+x+','+y;
      grid[y][x]=regionFloor();
      if(!collected.has(id)) pickups.push({kind:'container',id,x:x*16+4,y:y*16+4,t:0});
    } else if(ch==='Q'){
      const id='Q'+sx+','+sy+','+x+','+y;
      if(cutQ.has(id)){
        grid[y][x]=under(grid,x,y);
        // arbusto cortado pero semilla sin recoger: que reaparezca (evita softlock)
        if(!collected.has(id)) pickups.push({kind:'seed',id,x:x*16+4,y:y*16+4,t:0});
      }
    } else if(ch==='L'){
      grid[y][x]=under(grid,x,y);
      if(!hasBlade) pickups.push({kind:'blade',x:x*16,y:y*16,t:0});
    } else if(ch==='K'){
      grid[y][x]='q';
      if(!hasBomb) pickups.push({kind:'bomb',x:x*16,y:y*16,t:0});
    } else if(ch==='+'){
      grid[y][x]='q';
      if(!hasHook) pickups.push({kind:'hook',x:x*16,y:y*16,t:0});
    } else if(ch==='0'){
      const id='0'+sx+','+sy+','+x+','+y;
      grid[y][x]=regionFloor();
      if(!collected.has(id)) pickups.push({kind:'diary',id,x:x*16+4,y:y*16+4,t:0});
    } else if(ch==='J'){
      grid[y][x]='q';
      if(!bossDone) boss={type:'topo',hp:8,maxHp:8,st:'burrow',t:90,x:x*16,y:y*16,flash:0,mx:x*16,my:y*16};
      else if(!hasEmber) pickups.push({kind:'ember',x:x*16,y:y*16,t:0});
    } else if(ch==='!'){
      grid[y][x]='q';
      if(!boss2Done) boss={type:'avispa',hp:8,maxHp:8,st:'hover',t:90,x:x*16,y:y*16,flash:0,mx:x*16,my:16,vx:0,vy:0,cyc:0};
      else if(!hasTear) pickups.push({kind:'tear',x:x*16,y:y*16,t:0});
    } else if(ch==='^'){
      grid[y][x]='n';
      if(!boss3Done) boss={type:'viento',hp:10,maxHp:10,st:'float',t:120,x:x*16,y:16,flash:0,vx:0,vy:0,cyc:0,calmMsg:false};
      else if(!hasFlake) pickups.push({kind:'flake',x:x*16,y:y*16,t:0});
    } else if(ch==='C'){
      if(opened.has('C:'+sx+','+sy+':'+x+','+y)) grid[y][x]=regionFloor();
    } else if(ch==='='){
      if(opened.has('G'+sx+','+sy)||opened.has('PZ'+sx+','+sy)) grid[y][x]='q';
    } else if(ch==='%'){
      if(opened.has('G'+sx+','+sy)) grid[y][x]='&';
    } else if(ch==='_'){
      plateCells.add(x+','+y);
      if(opened.has('PZ'+sx+','+sy)) grid[y][x]='#'; // puzzle resuelto: bloques ya colocados
    } else if(ch==='#'){
      // roca-raíz empujable (se queda como '#')
    } else if(ch===')'){
      if(opened.has('LK'+sx+','+sy+':'+x+','+y)) grid[y][x]='q';
    } else if(ch==='('){
      const id='('+sx+','+sy+','+x+','+y;
      grid[y][x]=regionFloor();
      if(!collected.has(id)) pickups.push({kind:'key',id,x:x*16+4,y:y*16+4,t:0});
    } else if(NPCS[ch]){ npcs.push({ch,x,y}); }
    else if(ch==='E'){ elderPos=[x,y]; }
    else if(ch==='S'){ signPos.push([x,y]); }
  }
  // el pueblo florece con cada estación que vuelve (continuidad del lore)
  if(inTown(sx,sy)&&won){
    const dens=cycled?2:(summered?3:(thawed?4:6));
    for(let y=0;y<SH;y++) for(let x=0;x<SW;x++)
      if(grid[y][x]==='.'&&hash(x*5+1,y*9+3)%dens===0) grid[y][x]='f';
  }
  // la llamada del Roble: del despertar a la plaza
  if(sx===0&&sy===1&&!elderMet&&introDone&&!barrioCall){ barrioCall=true;
    pendingSay=["(Una voz antigua\nresuena entre las\ncasas...",
                "Viene de la PLAZA,\nal ESTE.)"]; }
  if(sx===1&&sy===1&&!elderMet&&introDone&&!plazaCall){ plazaCall=true;
    pendingSay=["(El GRAN ROBLE se\nalza gris y mudo\nsobre la plaza.",
                "El anciano espera\na sus raíces.)"]; }
  // la playa susurra la primera vez que llegas sin la Hoja
  if(sx===0&&sy===2&&!hasBlade&&!beachIntro){
    beachIntro=true;
    pendingSay=["(La arena susurra.\nAlgo brilla entre\nlas dunas...)"];
  }
  if(sx===7&&sy===0&&!opened.has('PZ7,0')) pendingSay=["(Rocas-raíz... Si\nte plantas y\nempujas, quizá\ncedan.)"];
  if(sx===6&&sy===2&&!bossDone) pendingSay=["(El suelo tiembla\nbajo tus raíces...)"];
  if(sx===10&&sy===2&&!boss2Done) pendingSay=["(Un zumbido grave\nllena el panal...)"];
  if(sx===1&&sy===-3&&!boss3Done) pendingSay=["(El viento aúlla\ntu nombre con\nrencor...)",
    "(Mientras sopla no\npuedes tocarlo.",
    "Cuando se canse y\ncaiga a tierra,\nbrillará: ¡ahí!)"];
  if(sx===1&&sy===-2&&!peakIntro){ peakIntro=true;
    pendingSay=["(Aquí arriba el\ninvierno nunca se\nfue. Sopla fuerte.)"]; }
  if(sy===3&&!summered&&sx===2&&!marshIntro){ marshIntro=true;
    pendingSay=["(Las hojas caen\nsin parar. Huele\na otoño viejo...)"]; }
  setTrack((sx===9||sx===8)?'casa':(sy===-3?'cima':(sy<=-1?'nieve':(sx>=6?'cueva':(sy===3?'pantano':'valle')))));
  visited.add(sx+','+sy);
  if(boss&&AC) SFX.boss(); // sting al entrar en sala de jefe
  // al cruzar a una región nueva, su entrada pasa a ser tu punto de rebrote
  const reg=regionOf(sx,sy);
  if(reg!=='casa'&&respawnPoint.reg!==reg&&REGION_ANCHOR[reg]) respawnPoint={...REGION_ANCHOR[reg],reg};
  if(state!=='title'&&state!=='boot') save(); // no crear partida antes de empezar
}

/* ---------- COLISIONES ---------- */
function solidAt(px,py){
  if(px<0||py<0||px>=SW*16||py>=SH*16) return true;
  return isSolid(grid[py>>4][px>>4]);
}
function boxFree(x,y,w,h){
  return !solidAt(x,y)&&!solidAt(x+w-1,y)&&!solidAt(x,y+h-1)&&!solidAt(x+w-1,y+h-1);
}

/* ---------- PARTÍCULAS ---------- */
function puff(x,y,col,n,spd){
  for(let i=0;i<(n||6);i++){
    const a=Math.random()*6.283, s=(spd||1)*(.4+Math.random());
    parts.push({x,y,vx:Math.cos(a)*s,vy:Math.sin(a)*s-.3,life:14+Math.random()*10,col});
  }
}
function leaves(x,y){ puff(x,y,C.canopyL,5,1.2); puff(x,y,C.canopy,4,1); }

