'use strict';
/* ---------- ENEMIGOS ---------- */
/* ganchos para el aspecto y el juice de cada bicho (11a-11e): nada de esto cambia cómo juegan
   ENEMY_DRAW[tipo](e)            lo dibuja entero (en lugar de drawEnemy; la sombra también es suya)
   ENEMY_FX[tipo](e,dx,dy,d)      cada fotograma, tras su IA: partículas, sonidos, contadores de animación (no toca posición ni daño)
   ENEMY_DEATH[tipo](e)           su muerte propia (en lugar del humo genérico); el botín cae igual */
const ENEMY_DRAW={}, ENEMY_FX={}, ENEMY_DEATH={};
function moveBlocked(e,nx,ny){ let bx=false,by=false;
  if(boxFree(nx+3,e.y+5,10,7)) e.x=nx; else bx=true;
  if(boxFree(e.x+3,ny+5,10,7)) e.y=ny; else by=true; return [bx,by]; }
function hitPlayerBox(){ return [player.x+4,player.y+8,8,8]; }
function shieldBlocks(fromX,fromY){ // el escudo de corteza rebota lo que llega de frente
  if(!hasShield||player.atk>0) return false;
  const dx=fromX-(player.x+8), dy=fromY-(player.y+10), D=DIRV[player.dir];
  return (dx*D[0]+dy*D[1])>0&&Math.abs(dx*D[1]-dy*D[0])<(shieldLvl>=2?18:14);
}
/* ---------- al llegar a una pantalla, los bichos no te esperan encima ----------
   Aparecen un momento después, uno tras otro, en un soplo de polvo (nunca a menos de SPAWN_SAFE de ti: si su sitio
   te pilla cerca, salen en el hueco libre más próximo a él) y se quedan un instante alerta antes de actuar.
   Los fijos (espinos, carámbanos, lirios, raíces trampa) ya están ahí: solo esperan ese instante. */
const SPAWN_T0=14, SPAWN_GAP=7, SPAWN_ALERT=20, SPAWN_SAFE=52, SPAWN_FIXED={thorn:1,icicle:1,lirio:1,root:1};
let spawnQ=[], spawnT=0;
function queueSpawns(){ spawnT=0; spawnQ=[];
  const keep=[]; for(const e of enemies){ if(SPAWN_FIXED[e.type]){ e.wake=SPAWN_ALERT; keep.push(e); } else spawnQ.push(e); } enemies=keep;
  spawnQ.forEach((e,i)=>{ e.spawnAt=SPAWN_T0+i*SPAWN_GAP; }); }
function updSpawns(){ if(!spawnQ.length) return; spawnT++;
  while(spawnQ.length&&spawnT>=spawnQ[0].spawnAt){ const e=spawnQ.shift(); spawnSettle(e); e.wake=SPAWN_ALERT; e.pop=10; enemies.push(e); spawnFx(e); } }
function flushSpawns(){ for(const e of spawnQ){ e.wake=0; enemies.push(e); } spawnQ=[]; for(const e of enemies) e.wake=0; }
function spawnSettle(e){ const px=player.x, py=player.y+4; if(Math.hypot(e.x-px,e.y-py)>=SPAWN_SAFE) return;
  const fly=e.type==='bat'||e.type==='bee'||e.type==='ghost'||e.type==='wisp'||e.type==='gust'; let best=null, bd=1e9;
  for(let ty=0;ty<SH;ty++) for(let tx=0;tx<SW;tx++){ const x=tx*16, y=ty*16; if(Math.hypot(x-px,y-py)<SPAWN_SAFE+6) continue;
    const ch=grid[ty][tx]; if(isSolid(ch)||ch==='°') continue; if(!fly&&!boxFree(x+3,y+5,10,7)) continue;
    const d=Math.hypot(x-e.x,y-e.y); if(d<bd){ bd=d; best=[x,y]; } }
  if(best){ e.x=best[0]; e.y=best[1]; if(e.x0!==undefined) e.x0=e.x; } }
function spawnFx(e){ const x=e.x+8, y=e.y+12;
  for(let i=0;i<8;i++){ const a=i/8*6.283; parts.push({k:'smoke',x:x+Math.cos(a)*4,y:y+Math.sin(a)*2,vx:Math.cos(a)*.7,vy:Math.sin(a)*.35-.2,life:16+(i&3),max:20,r:2+(i%3),col:i&1?'#f0ece4':'#c8c0c8',nog:true}); }
  parts.push({x,y:y-2,vx:0,vy:0,life:10,col:'#ffffff',ring:true,r:10,nog:true});
  if(AC) SFX.spawn(); }
function updEnemies(){
  for(const e of enemies){
    if(e.flash>0)e.flash--;
    e.kx*=.8; e.ky*=.8;
    if(e.stun>0){ e.stun--; moveBlocked(e,e.x+e.kx,e.y+e.ky); if((tick&7)===0) sparkle(e.x+4+Math.random()*8,e.y-2,'#fff0a0'); }
    const dx=player.x-e.x, dy=player.y-e.y, d=Math.hypot(dx,dy)||1;
    let blindHit=false, noContact=false;
    const stunned=e.stun>0, waking=e.wake>0; if(waking){ e.wake--; if(e.wake===0&&!SPAWN_FIXED[e.type]) e.squash=.3; } // recién llegado: alerta, sin moverse ni hacer daño
    if(stunned||waking){ /* aturdido o recién aparecido: no actúa */ }
    else if(e.type==='blob'){
      e.t--;
      if(e.t<=0){ e.t=40+hash(e.x|0,e.y|0)%50; const sp=e.fast?.65:.4;
        if(d<72&&Math.random()<(e.fast?.7:.5)){ e.vx=dx/d*sp*1.15; e.vy=dy/d*sp*1.15; e.t=28; e.squash=.25; } // te ha olido: salta hacia ti
        else { const a=Math.random()*6.283; e.vx=Math.cos(a)*sp; e.vy=Math.sin(a)*sp; if(Math.random()<.3){e.vx=0;e.vy=0;} } }
      const [bx,by]=moveBlocked(e,e.x+e.vx+e.kx,e.y+e.vy+e.ky); if(bx)e.vx*=-1; if(by)e.vy*=-1;
    } else if(e.type==='bat'||e.type==='bee'){
      e.t++;
      if(e.homing>0){ e.homing--; e.x+=e.vx+e.kx; e.y+=e.vy+e.ky; }
      else { e.x+=Math.sin(e.t*.05)*.5+e.kx; e.y+=Math.sin(e.t*.08)*.4+e.ky;
        const dsh=e.fast?1.45:1.1; if(d<70&&e.t%120===88) flyText.push({x:e.x+8,y:e.y-4,txt:'!',t:14,col:'#f8d030'}); if(d<70&&e.t%120>96){ e.homing=40; e.vx=dx/d*dsh; e.vy=dy/d*dsh; } }
      e.x=Math.max(0,Math.min(SW*16-16,e.x)); e.y=Math.max(0,Math.min(SH*16-16,e.y));
    } else if(e.type==='beetle'){
      const sp=e.fast?.7:.5; const [bx]=moveBlocked(e,e.x+e.dir*sp+e.kx,e.y+e.ky); if(bx) e.dir*=-1;
      if((e.t=(e.t+1)%200)===0) e.dir=(dx<0?-1:1);
    } else if(e.type==='crab'){ // corre de lado, rápido
      const sp=e.t%90<12?0:1.1; const [bx]=moveBlocked(e,e.x+e.dir*sp+e.kx,e.y+e.ky); if(bx) e.dir*=-1; // se agacha un instante antes de correr
      if((e.t=(e.t+1)%90)===0){ e.dir=(dx<0?-1:1); if(Math.abs(dy)>8) moveBlocked(e,e.x,e.y+Math.sign(dy)*4); }
    } else if(e.type==='roller'){
      if(e.st==='idle'){
        if(Math.abs(dy)<11&&Math.abs(dx)<86){ e.st='windup'; e.wu=18; e.rx=Math.sign(dx)||1; e.ry=0; e.bounce=2; SFX.bump(); }
        else if(Math.abs(dx)<11&&Math.abs(dy)<86){ e.st='windup'; e.wu=18; e.rx=0; e.ry=Math.sign(dy)||1; e.bounce=2; SFX.bump(); }
      } else if(e.st==='windup'){ if(--e.wu<=0) e.st='roll'; }
      else { const [bx,by]=moveBlocked(e,e.x+e.rx*2.4+e.kx,e.y+e.ry*2.4+e.ky);
        if(bx||by){ e.rx*=-1; e.ry*=-1; e.bounce--; SFX.bump(); shake=2; if(e.bounce<=0) e.st='idle'; } }
    } else if(e.type==='ghost'){
      e.t++; e.phase=e.t%150; const sp=e.fast?.7:.55;
      e.x+=dx/d*sp+e.kx; e.y+=dy/d*sp+e.ky;
      e.x=Math.max(-4,Math.min(SW*16-12,e.x)); e.y=Math.max(-4,Math.min(SH*16-12,e.y));
      if(e.phase>=110){ noContact=true; blindHit=true; }
    } else if(e.type==='frog'){
      e.t++;
      if(e.st==='sit'){ if(e.t%70===0&&d<92){ e.st='crouch'; e.ct=18; } }
      else if(e.st==='crouch'){ e.ct--; if(e.ct<=0){ e.st='jump'; e.jx=dx/d*1.8; e.jy=dy/d*1.8; e.air=26; SFX.bump(); } }
      else { const [bx,by]=moveBlocked(e,e.x+e.jx+e.kx,e.y+e.jy+e.ky); if(bx)e.jx*=-1; if(by)e.jy*=-1;
        if(--e.air<=0){ e.st='sit'; e.t=0; puff(e.x+8,e.y+13,'#6aa84a',4,.8); } }
    } else if(e.type==='thorn'){
      e.t++; if(e.st==='closed'){ noContact=true; if(d<26){ e.st='open'; e.ot=44; SFX.bump(); } } else if(--e.ot<=0) e.st='closed';
    } else if(e.type==='gust'){
      e.ang+=.04; e.x+=Math.cos(e.ang)*.9+e.kx; e.y+=Math.sin(e.ang*1.3)*.7+e.ky;
      e.x=Math.max(4,Math.min(SW*16-20,e.x)); e.y=Math.max(4,Math.min(SH*16-20,e.y));
      if(d<40){ player.kx+=(player.x-e.x)/d*0.5; player.ky+=(player.y-e.y)/d*0.5; }
    } else if(e.type==='squirrel'){ noContact=updSquirrel(e,dx,dy,d); // la ardilla ladrona (11a)
    } else if(e.type==='icicle'){
      if(e.st==='hang'){ noContact=true; if(Math.abs(dx)<9&&dy>4&&dy<80){ e.st='shake'; e.st2=20; SFX.bump(); } }
      else if(e.st==='shake'){ noContact=true; e.x=e.x0+((tick&2)?1:-1); if(--e.st2<=0){ e.st='fall'; e.vy=.6; e.x=e.x0; } }
      else { e.vy=Math.min(3.4,e.vy+.22); e.y+=e.vy; const ty=(e.y+14)>>4, tx=(e.x+8)>>4;
        if(e.y>SH*16||(grid[ty]&&grid[ty][tx]!==undefined&&isSolid(grid[ty][tx]))){ e.despawn=true; SFX.cut(); puff(e.x+8,e.y+10,'#dff0ff',8,1.4); puff(e.x+8,e.y+10,'#a8d0e8',5,1); } }
    } else if(e.type==='seton'){ // quieto; se hincha y escupe 4 esporas
      e.t++; if(e.st==='idle'){ if(e.t%140===100&&d<90){ e.st='puff'; e.pt=30; } }
      else { if(--e.pt<=0){ e.st='idle'; SFX.blip(); for(const [vx,vy] of [[1,0],[-1,0],[0,1],[0,-1]]) projs.push({x:e.x+8,y:e.y+8,vx:vx*1.3,vy:vy*1.3,t:70,kind:'spore'}); } }
    } else if(e.type==='wisp'){ // persigue flotando; se apaga con el remolino o el agua
      e.t++; const sp=.6+Math.sin(e.t*.1)*.2; e.x+=dx/d*sp+e.kx; e.y+=dy/d*sp+e.ky+Math.sin(e.t*.15)*.3;
      if((tick&3)===0) parts.push({x:e.x+6+Math.random()*4,y:e.y+4,vx:0,vy:-.3,life:10,col:(tick&4)?'#f8a030':'#f8e060',nog:true});
    } else if(e.type==='golem'){ // camina hacia ti a paso lento, pesado
      e.t++; if(e.t%8===0){ const [bx,by]=moveBlocked(e,e.x+Math.sign(dx)*2+e.kx,e.y+Math.sign(dy)*2+e.ky); }
      else moveBlocked(e,e.x+e.kx,e.y+e.ky);
      if(e.t%16===0&&d<60) shake=Math.max(shake,1);
    } else if(e.type==='topillo'){ // asoma del agujero, muerde y se esconde
      e.t--;
      if(e.st==='hide'){ noContact=true; blindHit=true; if(e.t<=0){ e.st='up'; e.t=70; puff(e.x+8,e.y+12,'#5a4630',6,1); SFX.bump(); } }
      else { if(e.t===40&&d<40){ const dxn=dx/d, dyn=dy/d; moveBlocked(e,e.x+dxn*6,e.y+dyn*6); }
        if(e.t<=0){ e.st='hide'; e.t=90+hash(e.x|0,tick)%60; e.x=e.hx; e.y=e.hy; puff(e.x+8,e.y+12,'#5a4630',5,.8); } }
    } else if(e.type==='lirio'){ // lirio de agua: quieto sobre el agua, abre y escupe
      e.t++; if(e.st==='closed'){ if(e.t%150===110&&d<110){ e.st='open'; e.ot=40; } }
      else { if(e.ot===30){ projs.push({x:e.x+8,y:e.y+6,vx:dx/d*1.4,vy:dy/d*1.4,t:80,kind:'seed'}); SFX.blip(); } if(--e.ot<=0) e.st='closed'; }
    } else if(e.type==='rodahoja'){ // bola de hojarasca: rebota en diagonal
      const [bx,by]=moveBlocked(e,e.x+e.vx+e.kx,e.y+e.vy+e.ky); if(bx) e.vx*=-1; if(by) e.vy*=-1; e.t++;
      if((tick&7)===0) parts.push({x:e.x+4+Math.random()*8,y:e.y+12,vx:-e.vx*.3,vy:-.2,life:10,col:'#e8a040',nog:true});
    } else if(e.type==='snail'){ // avanza; al golpearlo se mete en la concha (invulnerable)
      e.t++; if(e.st==='out'){ if(e.t%3===0) moveBlocked(e,e.x+Math.sign(dx)*.5+e.kx,e.y+Math.sign(dy)*.5+e.ky); else moveBlocked(e,e.x+e.kx,e.y+e.ky); }
      else { blindHit=true; if(--e.shellT<=0) e.st='out'; }
    } else if(MILL_ENEMY[e.type]){ [noContact,blindHit]=updMillEnemy(e,dx,dy,d); } // cuervo, caballero de hoja, raíz trampa
    { const FX=ENEMY_FX[e.type]; if(FX) FX(e,dx,dy,d); } // el juice de cada bicho (11b-11e)
    // ----- daño por contacto -----
    const eb=[e.x+3,e.y+4,10,9];
    if(!noContact&&!stunned&&!waking&&player.inv===0&&state==='play'&&jumpT===0&&rectsHit(eb,hitPlayerBox())){
      hurt(e.dmg||1,e.x,e.y);
    }
    // ----- espadazo / remolino -----
    if(e.flash===0&&meleeActive()&&rectsHit(meleeBox(),eb)){
      if(e.type==='beetle'){ const fromRight=player.x>e.x; if((e.dir>0&&fromRight)||(e.dir<0&&!fromRight)) blindHit=true; }
      if(e.type==='roller'&&e.st==='roll') blindHit=true;
      if(e.type==='golem') blindHit=true; // el hielo solo cede al fuego
      if(player.spin>0&&(e.type==='beetle'||e.type==='roller')) blindHit=false;
      if(blindHit){ SFX.block(); e.flash=4; player.kx=(player.x-e.x)/d*2; player.ky=(player.y-e.y)/d*2; sparkle(e.x+8,e.y+4,'#c8d8ff'); }
      else { damageEnemy(e,meleeDmg(),player.x,player.y); leafHitFx(e.x+8,e.y+8); // el «chas» de la Hoja y su savia (12b)
        if(e.type==='frog'&&e.st!=='jump') e.st='sit';
        if(e.type==='snail'&&e.hp>0){ e.st='in'; e.shellT=90; SFX.block(); } }
    }
  }
  enemies=enemies.filter(e=>{
    if(e.despawn) return false;
    if(e.hp<=0){
      SFX.edie(); if(ENEMY_DEATH[e.type]) ENEMY_DEATH[e.type](e); else deathPoof(e.x+8,e.y+8); shake=Math.max(shake,4);
      if(e.type==='squirrel'){ const n=3+(e.stolen||0); for(let i=0;i<n;i++){ const a=-Math.PI*(.15+.7*(i+.5)/n); pickups.push({kind:'berry',x:e.x+4+Math.cos(a)*8,y:e.y+4+Math.sin(a)*4,t:0,drop:14+i*2}); } // sus bayas y las que robó, en abanico
        for(let i=0;i<6;i++) parts.push({k:'leafF',x:e.x+8,y:e.y+6,vx:(Math.random()-.5)*2,vy:-1-Math.random(),life:40,max:40,sway:Math.random()*6,col:['#e07c34','#ffac5c','#c8642a'][i%3],nog:false}); return false; }
      dropLoot(e.x+4,e.y+4,e.type==='thorn'?.4:.22,.35+(e.fast?.2:0));
      return false;
    } return true;
  });
}
function damageEnemy(e,n,fx,fy){
  e.hp-=n; e.flash=8; SFX.ehit(); hitStop=Math.max(hitStop,2);
  const d=Math.hypot(e.x-fx,e.y-fy)||1; e.kx=(e.x-fx)/d*3; e.ky=(e.y-fy)/d*3;
  flyText.push({x:e.x+8,y:e.y-2,txt:''+n,t:24,col:'#fffbe8'});
  hitSpark((e.x+8+fx+8)/2,(e.y+8+fy+8)/2); e.squash=.35; shake=Math.max(shake,2);
}
/* ---------- los bichos del Molino de la Hojarasca ----------
   CUERVO: posado; si te acercas grazna y se lanza en picado a donde estabas;
     luego remonta (ahí la Hoja no llega) y se posa lejos. El molinillo lo tumba.
   CABALLERO DE HOJA: el escudo de hoja para la Hoja de frente; se gira despacio,
     embiste y se queda con la guardia baja. El remolino o el molinillo lo dejan sin escudo.
   RAÍZ TRAMPA: escondida; si la pisas te agarra y aprieta hasta que la golpeas;
     entonces asoma un rato, vulnerable. El molinillo la arranca del suelo. */
function millPerch(e){
  for(let i=0;i<24;i++){ const tx=1+hash((e.x|0)+i*7,tick+i)%8, ty=1+hash(tick+i*3,(e.y|0)+i)%6, ch=grid[ty]&&grid[ty][tx];
    if(ch!==undefined&&!isSolid(ch)&&ch!=='°'&&Math.hypot(tx*16-player.x,ty*16-player.y)>48) return [tx*16,ty*16]; }
  return [e.x,e.y];
}
function updMillEnemy(e,dx,dy,d){
  let noContact=false, blindHit=false; e.t++;
  if(e.type==='crow'){
    if(!e.st){ e.st='perch'; e.t=-(hash(e.x|0,e.y|0)%40); }
    if(e.st==='perch'){ if(e.t>30&&d<76){ e.st='caw'; e.t=0; SFX.blip(); flyText.push({x:e.x+8,y:e.y-4,txt:'!',t:16,col:'#ff9040'}); } }
    else if(e.st==='caw'){ if(e.t>=20){ e.st='swoop'; e.t=0; const sp=e.fast?2.7:2.4; e.vx=dx/d*sp; e.vy=(dy+4)/d*sp; noise(.06,.05,true); } }
    else if(e.st==='swoop'){ e.x+=e.vx+e.kx; e.y+=e.vy+e.ky; e.vx*=.985; e.vy*=.985;
      if(e.t>=38||e.x<1||e.x>143||e.y<1||e.y>107){ e.st='back'; e.t=0; e.p=millPerch(e); } }
    else if(e.st==='back'){ noContact=true; e.flash=Math.max(e.flash,1); // remonta: la Hoja no llega
      const p=e.p||(e.p=millPerch(e)), ex=p[0]-e.x, ey=p[1]-e.y, dd=Math.hypot(ex,ey)||1;
      if(dd<2||e.t>150){ e.st='perch'; e.t=0; e.x=p[0]; e.y=p[1]; } else { const sp=Math.min(1.6,dd); e.vx=ex/dd*sp; e.vy=ey/dd*sp; e.x+=e.vx; e.y+=e.vy; } }
    e.x=Math.max(0,Math.min(SW*16-16,e.x)); e.y=Math.max(0,Math.min(SH*16-16,e.y));
  } else if(e.type==='knight'){
    if(!e.st){ e.st='walk'; e.face=dx<0?-1:1; }
    if(e.bare>0) e.bare--;
    if(e.st==='walk'){ const sp=e.fast?.6:.5; if(e.t%3) moveBlocked(e,e.x+Math.sign(dx)*sp*1.4+e.kx,e.y+Math.sign(dy)*sp+e.ky); else moveBlocked(e,e.x+e.kx,e.y+e.ky);
      if(e.t%48===0&&Math.sign(dx)!==e.face&&Math.abs(dx)>6){ e.st='turn'; e.t=0; }
      else if(e.t>40&&d<46&&Math.abs(dy)<14&&Math.sign(dx)===e.face){ e.st='wind'; e.t=0; SFX.bump(); } }
    else if(e.st==='turn'){ moveBlocked(e,e.x+e.kx,e.y+e.ky); if(e.t>=16){ e.face*=-1; e.st='walk'; e.t=0; } }
    else if(e.st==='wind'){ moveBlocked(e,e.x-e.face*.25+e.kx,e.y+e.ky); if(e.t>=18){ e.st='lunge'; e.t=0; } }
    else if(e.st==='lunge'){ const [bx]=moveBlocked(e,e.x+e.face*2.8+e.kx,e.y+e.ky); e.lx=e.face*2;
      if(bx||e.t>=14){ e.st='rest'; e.t=0; e.lx=0; if(bx){ shake=Math.max(shake,2); SFX.bump(); puff(e.x+8+e.face*8,e.y+10,'#8a7048',5,.9); } } }
    else if(e.st==='rest'){ moveBlocked(e,e.x+e.kx,e.y+e.ky); if(e.t>=44){ e.st='walk'; e.t=0; e.face=dx<0?-1:1; } }
    // el escudo: de frente la Hoja rebota, salvo con la guardia baja, sin escudo o en pleno remolino
    if(!e.bare&&e.st!=='rest'&&player.spin===0&&Math.sign(player.x-e.x)===e.face) blindHit=true;
  } else if(e.type==='root'){
    if(!e.st){ e.st='hide'; e.hx=e.x; e.hy=e.y; }
    if(e.st==='hide'){ noContact=true; e.flash=Math.max(e.flash,1); e.x=e.hx; e.y=e.hy; // bajo tierra: ni la Hoja la toca
      if(d<11&&jumpT===0&&state==='play'&&player.inv<30){ e.st='grab'; e.t=0; e.gx=player.x; e.gy=player.y; SFX.bump(); shake=3; puff(e.x+8,e.y+12,'#5a4630',8,1.2); flyText.push({x:player.x+8,y:player.y-6,txt:'¡ATRAPADO!',t:30,col:'#ff9040'}); } }
    else if(e.st==='grab'){ noContact=true; player.x=e.gx; player.y=e.gy; player.kx=player.ky=0;
      if(e.t%30===16){ hurt(1,e.x+8,e.y+8,true); player.x=e.gx; player.y=e.gy; player.kx=player.ky=0; }
      if(e.flash===0&&meleeActive()) damageEnemy(e,meleeDmg(),player.x,player.y+8); // sujeto por los pies: cualquier tajo la alcanza
      if(e.flash>0||e.t>=110){ e.st='up'; e.t=0; } }
    else if(e.st==='up'){ if(e.t>=90){ e.st='hide'; e.t=0; e.x=e.hx; e.y=e.hy; puff(e.x+8,e.y+12,'#5a4630',6,.8); } }
  }
  return [noContact,blindHit];
}
