'use strict';
/* ---------- JUGADOR ---------- */
function tryMove(dx,dy){
  const HX=4,HY=8,HW=8,HH=8; // hitbox en los pies
  let nx=player.x+dx;
  if(boxFree(nx+HX,player.y+HY,HW,HH)) player.x=nx;
  let ny=player.y+dy;
  if(boxFree(player.x+HX,ny+HY,HW,HH)) player.y=ny;
}
function facingTile(){
  const cx=player.x+8, cy=player.y+12;
  const D=[[0,11],[0,-9],[-10,0],[10,0]][player.dir];
  const tx=(cx+D[0])>>4, ty=(cy+D[1])>>4;
  if(tx<0||ty<0||tx>=SW||ty>=SH) return null;
  return [tx,ty,grid[ty][tx]];
}
function swordBox(){
  const px=player.x, py=player.y;
  return [[px+2,py+12,12,12],[px+2,py-8,12,12],[px-9,py+4,13,12],[px+12,py+4,13,12]][player.dir];
}
/* golpe activo: tajo normal o remolino (golpea TODO alrededor) */
function meleeBox(){ return player.spin>0?[player.x-10,player.y-4,36,30]:swordBox(); }
function meleeActive(){ return player.atk>4||player.spin>6; }
function meleeDmg(){ return player.spin>0?bladeLvl+1:bladeLvl; }
function doSpin(){
  player.spin=18; player.charge=0; SFX.sword(); noise(.16,.06,true); shake=2;
  for(let i=0;i<10;i++){ const a=i/10*6.283;
    parts.push({x:player.x+8+Math.cos(a)*8,y:player.y+9+Math.sin(a)*8,
      vx:Math.cos(a)*1.4,vy:Math.sin(a)*1.4,life:14,col:i%2?PAL.l:'#a8ec78'}); }
  // ...y la Hoja LANZA un tornadito hacia donde miras
  const D=[[0,1],[0,-1],[-1,0],[1,0]][player.dir];
  windProjs.push({x:player.x+8,y:player.y+10,vx:D[0]*2.1,vy:D[1]*2.1,t:70,ang:0});
}
/* empuje de rocas-raíz (estilo Zelda): hay que estar bien encarado y avanzar */
let pushHold=0;
function tryPushBlock(){
  const ft=facingTile();
  if(!ft||ft[2]!=='#'){ pushHold=0; return; }
  const [tx,ty]=ft;
  // tolerancia amplia para EMPEZAR a empujar; luego te encarrila al eje del bloque
  const dxc=(player.x+8)-(tx*16+8), dyc=(player.y+12)-(ty*16+10);
  const off = (player.dir<2) ? Math.abs(dxc) : Math.abs(dyc);
  if(off>9){ pushHold=0; return; }
  // imán: alinea suavemente el eje perpendicular con el carril del bloque
  if(player.dir<2) player.x += (tx*16-player.x)*0.4;
  else            player.y += (ty*16-4-player.y)*0.4;
  if(++pushHold<9) return;     // hay que empujar un instante
  const D=[[0,1],[0,-1],[-1,0],[1,0]][player.dir];
  const dx=tx+D[0], dy=ty+D[1];
  if(dx<0||dy<0||dx>=SW||dy>=SH){ pushHold=0; return; }
  const dest=grid[dy][dx];
  if(dest!=='_'&&dest!==regionFloor()){ pushHold=0; return; } // detrás hay pared u otro bloque
  pushHold=0;
  grid[ty][tx]= plateCells.has(tx+','+ty)?'_':regionFloor(); // libera la celda (restaura placa)
  grid[dy][dx]='#';                                          // el bloque avanza
  if(player.dir===0){ player.x=tx*16; player.y=ty*16-4; }
  else if(player.dir===1){ player.x=tx*16; player.y=ty*16+4; }
  else if(player.dir===2){ player.y=ty*16-4; player.x=tx*16+4; }
  else { player.y=ty*16-4; player.x=tx*16-4; }
  SFX.bump(); puff(tx*16+8,ty*16+12,'#8a7460',5,.8);
  checkPlates();
}
const plateCells=new Set();  // todas las celdas-placa de la sala actual
function checkPlates(){
  if(plateCells.size===0||opened.has('PZ'+sx+','+sy)) return;
  for(const c of plateCells){ const [x,y]=c.split(',').map(Number); if(grid[y][x]!=='#') return; }
  opened.add('PZ'+sx+','+sy); SFX.secret(); shake=4; save();
  for(let y=0;y<SH;y++) for(let x=0;x<SW;x++)
    if(grid[y][x]==='='){ grid[y][x]='q'; puff(x*16+8,y*16+8,'#8a7048',6,1.2); }
}
function rectsHit(a,b){ return a[0]<b[0]+b[2]&&a[0]+a[2]>b[0]&&a[1]<b[1]+b[3]&&a[1]+a[3]>b[1]; }
function cutBushesAt(sb){
  for(let y=0;y<SH;y++) for(let x=0;x<SW;x++){
    const ch=grid[y][x];
    if((ch==='b'||ch==='Q')&&rectsHit(sb,[x*16+2,y*16+2,12,12])){
      grid[y][x]= under(grid,x,y); SFX.cut(); leaves(x*16+8,y*16+8);
      if(ch==='Q'){
        const id='Q'+sx+','+sy+','+x+','+y; cutQ.add(id);
        if(!collected.has(id)) pickups.push({kind:'seed',id,x:x*16+4,y:y*16+4,t:0});
      } else { const r=Math.random();
        if(r<.12) pickups.push({kind:'heart',x:x*16+4,y:y*16+4,t:0});
        else if(r<.32) pickups.push({kind:'berry',x:x*16+4,y:y*16+4,t:0});
      }
    }
  }
}

function attack(){
  // el Viento exhausto no se remata: se le recuerda (Z a su lado)
  if(boss&&boss.type==='viento'&&boss.hp<=2&&boss.st==='rest'){
    const bd=Math.hypot(player.x-boss.x,player.y-boss.y);
    if(bd<28){
      say(WIND_PEACE,()=>{
        SFX.fanfare(); shake=14;
        puff(boss.x+8,boss.y+8,'#dff0ff',18,2); puff(boss.x+8,boss.y+8,'#9ec7e8',12,1.6);
        pickups.push({kind:'flake',x:boss.x,y:boss.y,t:0});
        boss=null; boss3Done=true; enemies=[]; projs=[]; save();
      },'EL VIENTO');
      return;
    }
  }
  // ¿hay algo con lo que hablar delante?
  const ft=facingTile();
  if(ft){
    const [tx,ty,ch]=ft;
    if(ch==='S'){ SFX.blip(); say(TXT.signs[sx+','+sy]||TXT.sign); return; }
    if(ch==='O'){ SFX.blip(); say(RUNAS[sx+','+sy]||["Runas gastadas.\nNo se leen."]); return; }
    if(ch==='['){ SFX.blip(); say(thawed?
      ["ALTAR DE LA\nPRIMAVERA.","La BRASA late aquí\nsu calor de\ndeshielo. El valle\nlo siente."]:
      ["ALTAR DE LA\nPRIMAVERA.","El cuenco está\nfrío. Espera algo\nque lata como un\ncorazón."]); return; }
    if(ch===']'){ SFX.blip(); say(summered?
      ["ALTAR DEL\nVERANO.","La LÁGRIMA brilla\nfresca y tibia.\nEl sol dormido\ndespertó en ella."]:
      ["ALTAR DEL\nVERANO.","El cuenco está\nseco. Espera un\nllanto que el sol\nquiera habitar."]); return; }
    if(ch==='}'){ SFX.blip(); say(cycled?
      ["ALTAR DEL\nINVIERNO.","El COPO no se\nderrite. Aquí\nvive el nombre del\nVIENTO DEL NORTE.",
       "Ya nadie lo\nolvida. Por eso\nestá algo apartado:\nél era así."]:
      ["ALTAR DEL\nINVIERNO.","Está apartado de\nlos otros dos,\ncomo esperando a\nalguien que no\nvuelve."]); return; }
    if(ch==='g'||ch==='ñ'){ openShop(); return; } // Tilo, o hablarle por encima del mostrador
    if(NPCS[ch]){ SFX.blip(); say(NPC_TALK[ch](),null,NPCS[ch].name.toUpperCase()); return; }
    if(ch==='D'){
      if(sx===0&&sy===1&&tx===3){ enterHouse(); return; } // tu casa
      if(sx===0&&sy===1&&tx===7){ enterShop(); return; } // la tienda de Tilo
      SFX.blip(); say(TXT.door); return;
    }
    if(ch==='G'){ enterDungeon(); return; }
    if(ch===')'){ // verja con cerrojo de bellota
      if(keysHeld>0){ keysHeld--; SFX.secret(); shake=3;
        for(let dxx=-2;dxx<=2;dxx++){ const cx=tx+dxx;        // abre toda la verja contigua
          if(cx>=0&&cx<SW&&grid[ty][cx]===')'){ grid[ty][cx]='q'; opened.add('LK'+sx+','+sy+':'+cx+','+ty); puff(cx*16+8,ty*16+8,PAL.a,6,1); } }
        save(); }
      else { SFX.bump(); say(["Cerrado con un\ncerrojo de bellota.\nNecesitas una\nLLAVE-BELLOTA."]); }
      return;
    }
    if(ch==='E'){
      SFX.blip();
      const sayR=(p,cb)=>say(p,cb,'RAÍZ'); // el sabio habla con su nombre
      if(seeds>=8&&!won){
        giveItem(ACORN,8,()=>sayR(TXT.elderWin,()=>{ won=true; SFX.fanfare(); bloom(); save(); }));
      } else if(hasEmber&&!thawed){
        giveItem(EMBER_SPR,1,()=>sayR(TXT.thaw,()=>{ thawed=true; SFX.fanfare(); bloom(); save(); }));
      } else if(hasTear&&!summered){
        giveItem(TEAR_SPR,1,()=>sayR(TXT.summer,()=>{ summered=true; SFX.fanfare(); bloom(); save(); }));
      } else if(hasFlake&&!cycled){
        giveItem(FLAKE_SPR,1,()=>sayR(TXT.cycle,()=>{ cycled=true; SFX.fanfare(); bloom(); save(); }));
      } else if(cycled){ sayR([ "Las cuatro\nestaciones giran.\nEl valle respira.",
                               "¿Aún no lo ves,\nbrote? Mírame\nbien. Mira el árbol.",
                               "Yo SOY el Roble.\nViejo y plantado,\nsoñando este valle.",
                               "Y tú creciste de\nmi última bellota,\nla novena...",
                               "...la única que mi\nhermano Viento\nnunca encontró.",
                               "Gracias por traer\na casa a tus\nhermanas. ♥" ]); }
      else if(summered&&boss3Done){ sayR([ "¿Ese frío azul en\ntu zurrón...?\n¡El Copo! Tráelo." ]); }
      else if(summered){ sayR([ "Solo queda el\nINVIERNO, en el\npico del norte.",
                               "Sube por el campo\nhelado. Necesitarás\nbomba Y gancho",
                               "para abrirte paso.\nNo subas a luchar:\nsube a recordar." ]); }
      else if(thawed&&boss2Done){ sayR([ "¿Un brillo azul en\ntu zurrón? ¡Corre,\ntráemelo!" ]); }
      else if(thawed){ sayR([ "El sur huele a\notoño viejo...",
                             "Hay rocas agrieta-\ndas en la playa\neste. Tus bombas",
                             "saben qué hacer.\nBusca el TRONCO\nHUECO, brote." ]); }
      else if(won&&bossDone){ sayR([ "¿Esa luz en tu\nzurrón...?\n¡Corre, tráela!" ]); }
      else if(won){ sayR([ "¿Ves la copa? Tus\nsemillas brillan\nen ella otra vez.",
                          "Pero oigo aullar\nalgo en las\nmontañas del norte.",
                          "Dicen que el TOPO\nREAL guarda la\nBRASA DE PRIMAVERA.",
                          "Sin ella, ese\ninvierno no se irá\njamás. Ve, brote." ]); }
      else if(!hasBlade){ sayR(TXT.elderIntro); if(!elderMet){ elderMet=true; save(); } }
      else if(seeds===0){ sayR(TXT.elderBlade); }
      else { sayR([
        "Llevas "+seeds+" de 8\nsemillas. Atento:",
        "A la vista: riscos\nNO, claro del\nbosque, lago este,",
        "pradera sur y\nplaya este.",
        "Brillan arbustos:\nbosque, lago norte\ny playa suroeste." ]); }
      return;
    }
  }
  // raíz-gancho: frente al agua, Z lanza la raíz y te cruza
  if(hasHook){
    const D=[[0,1],[0,-1],[-1,0],[1,0]][player.dir];
    const ptx=(player.x+8)>>4, pty=(player.y+12)>>4;
    const isWater=c=>c==='W'||c==='~';
    let t1x=ptx+D[0], t1y=pty+D[1];
    if(grid[t1y]&&isWater(grid[t1y][t1x])){
      for(let i=2;i<=5;i++){
        const tx=ptx+D[0]*i, ty=pty+D[1]*i;
        const ch=grid[ty]&&grid[ty][tx];
        if(ch===undefined) break;
        if(isWater(ch)) continue;
        if(!isSolid(ch)){ // tierra firme: ¡cruza!
          hook={fx:player.x,fy:player.y,tx:tx*16,ty:ty*16-4,t:0};
          state='hook'; SFX.sword(); noise(.08,.04,true);
          return;
        }
        break; // sólido: no hay agarre
      }
      SFX.bump(); return; // agua sin orilla a tiro
    }
  }
  if(!hasBlade){
    if(noBladeMsg<2){ noBladeMsg++;
      say(["Manoteas el aire\nsin mucho efecto...","Necesitas la HOJA\nANCESTRAL.\n(playa suroeste)"]); }
    else SFX.bump();
    return;
  }
  player.atk=14; SFX.sword();
}
function placeAt(nx,ny,px,py,dir){
  loadScreen(nx,ny); player.x=px; player.y=py; player.dir=dir;
  lastEntry={sx:nx,sy:ny,x:px,y:py}; fadeIn=18; noise(.12,.03,false);
}
function enterHouse(){ placeAt(9,9,76,90,1); }
function exitHouse(){ placeAt(0,1,44,42,0); }
function enterShop(){ placeAt(8,9,76,90,1); }
function exitShop(){ placeAt(0,1,108,42,0); }

/* ---------- LA TIENDA DE TILO ---------- */
function shopList(){
  const L=[];
  if(bladeLvl===1)      L.push({id:'b2',name:'AFILAR HOJA',cost:12,d:'La Hoja hará\ndaño DOBLE.'});
  else if(bladeLvl===2) L.push({id:'b3',name:'TEMPLAR HOJA',cost:30,d:'La Hoja hará\ndaño TRIPLE.'});
  else                  L.push({id:'bmax',name:'HOJA SUPREMA',cost:0,d:'Tu filo está\nal máximo.',off:true});
  if(!hasSpin) L.push({id:'spin',name:'REMOLINO',cost:20,d:'Mantén Z, suelta:\n¡giro + tornadito!'});
  else         L.push({id:'spinok',name:'REMOLINO',cost:0,d:'Ya lo dominas.',off:true});
  if(!shopHeart) L.push({id:'hp',name:'CORAZÓN SAVIA',cost:35,d:'+2 de vigor\nmáximo.'});
  else           L.push({id:'hpok',name:'CORAZÓN SAVIA',cost:0,d:'Vendido.',off:true});
  L.push({id:'out',name:'SALIR',cost:-1,d:'Vuelve pronto.'});
  return L;
}
function openShop(){
  SFX.blip(); shopSel=0; shopUD=0;
  if(!tiloMet){ tiloMet=true; save();
    say(["¡Un cliente! Soy\nTILO. Afilo hojas\ny cuezo savia.",
         "Pago en BAYAS:\nlos arbustos y los\nbichos las sueltan.",
         "Échale un ojo al\ngénero, brote."],()=>{ state='shop'; },'TILO');
  } else state='shop';
}
function buyShop(){
  const L=shopList(), it=L[shopSel];
  if(it.id==='out'){ state='play'; SFX.blip(); return; }
  if(it.off){ SFX.bump(); return; }
  if(berries<it.cost){ SFX.bump(); showToast('TE FALTAN BAYAS',it.cost+' por '+it.name); return; }
  berries-=it.cost; SFX.fanfare(); save();
  if(it.id==='b2'){ bladeLvl=2; save();
    say(["¡Chas! Filo como\nel rocío. Tu Hoja\nhace daño DOBLE."],null,'TILO'); }
  else if(it.id==='b3'){ bladeLvl=3; save();
    say(["¡Mi obra maestra!\nDaño TRIPLE.\nTiembla, valle."],null,'TILO'); }
  else if(it.id==='spin'){ hasSpin=true; save();
    say(["¡El REMOLINO!\nMantén pulsado Z:\nla Hoja se carga...",
         "...y al soltar,\n¡giras y LANZAS\nun TORNADITO!",
         "El tornadito viaja\nsolo: poda arbustos\ny arrasa bichos.",
         "Hasta rompe la\nguardia de los\nacorazados."],null,'TILO'); }
  else if(it.id==='hp'){ shopHeart=true; player.maxHp+=2; player.hp=player.maxHp; save();
    say(["Savia espesa del\nGran Roble...\n¡Tu vigor aumenta!"],null,'TILO'); }
}
function enterDungeon(){ placeAt(sy===3?10:6,0,72,72,1); fadeIn=24; }
function exitDungeon(){ if(sx>=10) placeAt(1,3,68,34,0); else placeAt(2,-1,76,34,0); }

