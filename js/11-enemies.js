'use strict';
/* ---------- ENEMIGOS ---------- */
function moveBlocked(e,nx,ny){ let bx=false,by=false;
  if(boxFree(nx+3,e.y+5,10,7)) e.x=nx; else bx=true;
  if(boxFree(e.x+3,ny+5,10,7)) e.y=ny; else by=true; return [bx,by]; }
function hitPlayerBox(){ return [player.x+4,player.y+8,8,8]; }
function shieldBlocks(fromX,fromY){ // el escudo de corteza rebota lo que llega de frente
  if(!hasShield||player.atk>0) return false;
  const dx=fromX-(player.x+8), dy=fromY-(player.y+10), D=DIRV[player.dir];
  return (dx*D[0]+dy*D[1])>0&&Math.abs(dx*D[1]-dy*D[0])<14;
}
function updEnemies(){
  for(const e of enemies){
    if(e.flash>0)e.flash--;
    e.kx*=.8; e.ky*=.8;
    if(e.stun>0){ e.stun--; moveBlocked(e,e.x+e.kx,e.y+e.ky); if((tick&7)===0) sparkle(e.x+4+Math.random()*8,e.y-2,'#fff0a0'); }
    const dx=player.x-e.x, dy=player.y-e.y, d=Math.hypot(dx,dy)||1;
    let blindHit=false, noContact=false;
    const stunned=e.stun>0;
    if(stunned){ /* aturdido: no actúa */ }
    else if(e.type==='blob'){
      e.t--;
      if(e.t<=0){ e.t=40+hash(e.x|0,e.y|0)%50; const a=Math.random()*6.283, sp=e.fast?.65:.4;
        e.vx=Math.cos(a)*sp; e.vy=Math.sin(a)*sp; if(Math.random()<.3){e.vx=0;e.vy=0;} }
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
    } else if(e.type==='squirrel'){
      noContact=true; e.t++;
      if(e.st==='flee'){ const [bx,by]=moveBlocked(e,e.x+e.fx*1.9+e.kx,e.y+e.fy*1.4+e.ky); if(bx)e.fx*=-1; if(by)e.fy*=-1; if(--e.ft<=0) e.despawn=true; }
      else if(e.st==='dash'){ moveBlocked(e,e.x+dx/d*1.6+e.kx,e.y+dy/d*1.6+e.ky);
        if(rectsHit([e.x+3,e.y+4,10,9],hitPlayerBox())){
          if(berries>0){ berries--; SFX.bump(); shake=2; puff(player.x+8,player.y+8,'#d84878',6,1.2); showToast('¡BAYA ROBADA!','caza a la ardilla'); }
          e.st='flee'; e.ft=110; e.fx=Math.sign(e.x-player.x)||1; e.fy=Math.sign(e.y-player.y)||0; }
        if(d>110) e.st='wander';
      } else { e.t2=(e.t2||0)-1;
        if(e.t2<=0){ e.t2=50+hash(e.x|0,e.y|0)%60; const a=Math.random()*6.283; e.vx=Math.cos(a)*.45; e.vy=Math.sin(a)*.45; }
        const [bx,by]=moveBlocked(e,e.x+e.vx+e.kx,e.y+e.vy+e.ky); if(bx)e.vx*=-1; if(by)e.vy*=-1;
        if(berries>0&&d<56){ e.st='dash'; SFX.blip(); } }
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
    }
    // ----- daño por contacto -----
    const eb=[e.x+3,e.y+4,10,9];
    if(!noContact&&!stunned&&player.inv===0&&state==='play'&&jumpT===0&&rectsHit(eb,hitPlayerBox())){
      hurt(e.dmg||1,e.x,e.y);
    }
    // ----- espadazo / remolino -----
    if(e.flash===0&&meleeActive()&&rectsHit(meleeBox(),eb)){
      if(e.type==='beetle'){ const fromRight=player.x>e.x; if((e.dir>0&&fromRight)||(e.dir<0&&!fromRight)) blindHit=true; }
      if(e.type==='roller'&&e.st==='roll') blindHit=true;
      if(e.type==='golem') blindHit=true; // el hielo solo cede al fuego
      if(player.spin>0&&(e.type==='beetle'||e.type==='roller')) blindHit=false;
      if(blindHit){ SFX.block(); e.flash=4; player.kx=(player.x-e.x)/d*2; player.ky=(player.y-e.y)/d*2; sparkle(e.x+8,e.y+4,'#c8d8ff'); }
      else { damageEnemy(e,meleeDmg(),player.x,player.y);
        if(e.type==='frog'&&e.st!=='jump') e.st='sit';
        if(e.type==='snail'&&e.hp>0){ e.st='in'; e.shellT=90; SFX.block(); } }
    }
  }
  enemies=enemies.filter(e=>{
    if(e.despawn) return false;
    if(e.hp<=0){
      SFX.edie(); deathPoof(e.x+8,e.y+8); shake=Math.max(shake,4);
      if(e.type==='squirrel'){ for(let i=0;i<3;i++) pickups.push({kind:'berry',x:e.x+i*7-3,y:e.y+4,t:0,drop:14}); return false; }
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
