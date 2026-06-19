'use strict';
/* ---------- ENEMIGOS ---------- */
function moveBlocked(e,nx,ny){ // mueve respetando colisión; devuelve choque por eje
  let bx=false,by=false;
  if(boxFree(nx+3,e.y+5,10,7)) e.x=nx; else bx=true;
  if(boxFree(e.x+3,ny+5,10,7)) e.y=ny; else by=true;
  return [bx,by];
}
function updEnemies(){
  for(const e of enemies){
    if(e.flash>0)e.flash--;
    e.kx*=.8; e.ky*=.8;
    const dx=player.x-e.x, dy=player.y-e.y, d=Math.hypot(dx,dy)||1;
    let blindHit=false, noContact=false;

    if(e.type==='blob'){
      e.t--;
      if(e.t<=0){ e.t=40+hash(e.x|0,e.y|0)%50;
        const a=Math.random()*6.283, sp=e.fast?.65:.4;
        e.vx=Math.cos(a)*sp; e.vy=Math.sin(a)*sp;
        if(Math.random()<.3){e.vx=0;e.vy=0;} }
      const [bx,by]=moveBlocked(e,e.x+e.vx+e.kx,e.y+e.vy+e.ky);
      if(bx)e.vx*=-1; if(by)e.vy*=-1;

    } else if(e.type==='bat'){
      e.t++;
      if(e.homing>0){ e.homing--; e.x+=e.vx+e.kx; e.y+=e.vy+e.ky; }
      else {
        e.x+=Math.sin(e.t*.05)*.5+e.kx; e.y+=Math.sin(e.t*.08)*.4+e.ky;
        const dsh=e.fast?1.45:1.1;
        if(d<70&&e.t%120>96){ e.homing=40; e.vx=dx/d*dsh; e.vy=dy/d*dsh; }
      }
      e.x=Math.max(0,Math.min(SW*16-16,e.x)); e.y=Math.max(0,Math.min(SH*16-16,e.y));

    } else if(e.type==='beetle'){ // patrulla; frente blindado (mira a e.dir)
      const sp=e.fast?.7:.5;
      const [bx]=moveBlocked(e,e.x+e.dir*sp+e.kx,e.y+e.ky);
      if(bx) e.dir*=-1;
      if((e.t=(e.t+1)%200)===0) e.dir=(dx<0?-1:1);

    } else if(e.type==='roller'){ // se enrosca y CARGA al alinearte, rebota
      if(e.st==='idle'){
        if(Math.abs(dy)<11&&Math.abs(dx)<86){ e.st='roll'; e.rx=Math.sign(dx)||1; e.ry=0; e.bounce=2; SFX.bump(); }
        else if(Math.abs(dx)<11&&Math.abs(dy)<86){ e.st='roll'; e.rx=0; e.ry=Math.sign(dy)||1; e.bounce=2; SFX.bump(); }
      } else {
        const [bx,by]=moveBlocked(e,e.x+e.rx*2.4+e.kx,e.y+e.ry*2.4+e.ky);
        if(bx||by){ e.rx*=-1; e.ry*=-1; e.bounce--; SFX.bump(); shake=2;
          if(e.bounce<=0) e.st='idle'; }
      }

    } else if(e.type==='ghost'){ // atraviesa paredes; intangible a ratos
      e.t++; e.phase=e.t%150;
      const sp=e.fast?.7:.55;
      e.x+=dx/d*sp+e.kx; e.y+=dy/d*sp+e.ky;
      e.x=Math.max(-4,Math.min(SW*16-12,e.x)); e.y=Math.max(-4,Math.min(SH*16-12,e.y));
      if(e.phase>=110){ noContact=true; blindHit=true; }

    } else if(e.type==='frog'){ // quieto y salta hacia ti
      e.t++;
      if(e.st==='sit'){ if(e.t%70===0&&d<92){ e.st='crouch'; e.ct=18; } }
      else if(e.st==='crouch'){ e.ct--; if(e.ct<=0){ e.st='jump'; e.jx=dx/d*1.8; e.jy=dy/d*1.8; e.air=26; SFX.bump(); } }
      else { const [bx,by]=moveBlocked(e,e.x+e.jx+e.kx,e.y+e.jy+e.ky);
        if(bx)e.jx*=-1; if(by)e.jy*=-1;
        if(--e.air<=0){ e.st='sit'; e.t=0; puff(e.x+8,e.y+13,'#6aa84a',4,.8); } }

    } else if(e.type==='thorn'){ // estacionaria; muerde de cerca
      e.t++;
      if(e.st==='closed'){ noContact=true; if(d<26){ e.st='open'; e.ot=44; SFX.bump(); } }
      else if(--e.ot<=0) e.st='closed';

    } else if(e.type==='gust'){ // remolino: te empuja
      e.ang+=.04; e.x+=Math.cos(e.ang)*.9+e.kx; e.y+=Math.sin(e.ang*1.3)*.7+e.ky;
      e.x=Math.max(4,Math.min(SW*16-20,e.x)); e.y=Math.max(4,Math.min(SH*16-20,e.y));
      if(d<40){ player.kx+=(player.x-e.x)/d*0.5; player.ky+=(player.y-e.y)/d*0.5; }
    }

    // ----- daño por contacto -----
    const eb=[e.x+3,e.y+4,10,9], pb=[player.x+4,player.y+8,8,8];
    if(!noContact&&player.inv===0&&state==='play'&&rectsHit(eb,pb)){
      player.hp--; player.inv=60; shake=8; SFX.hurt(); hitStop=3;
      player.kx=(player.x-e.x)/d*2.5; player.ky=(player.y-e.y)/d*2.5;
      if(player.hp<=0) die();
    }
    // ----- espadazo / remolino del jugador -----
    if(meleeActive()&&e.flash===0&&rectsHit(meleeBox(),eb)){
      if(e.type==='beetle'){ const fromRight=player.x>e.x;
        if((e.dir>0&&fromRight)||(e.dir<0&&!fromRight)) blindHit=true; }
      if(e.type==='roller'&&e.st==='roll') blindHit=true;
      if(player.spin>0&&(e.type==='beetle'||e.type==='roller')) blindHit=false; // el remolino rompe la guardia
      if(blindHit){ SFX.bump(); e.flash=4;
        player.kx=(player.x-e.x)/d*2; player.ky=(player.y-e.y)/d*2;
      } else {
        e.hp-=meleeDmg(); e.flash=8; SFX.ehit(); hitStop=3;
        e.kx=(e.x-player.x)/d*3; e.ky=(e.y-player.y)/d*3;
        if(e.type==='frog'&&e.st!=='jump') e.st='sit';
      }
    }
  }
  enemies=enemies.filter(e=>{
    if(e.hp<=0){
      SFX.edie(); puff(e.x+8,e.y+8,'#e8e8d8',8,1.4); puff(e.x+8,e.y+8,'#9088a0',5,1);
      const r=Math.random(), hc=(e.type==='thorn'?.5:.25);
      if(r<hc) pickups.push({kind:'heart',x:e.x+4,y:e.y+4,t:0});
      else if(r<hc+.3) pickups.push({kind:'berry',x:e.x+4,y:e.y+4,t:0});
      return false;
    } return true;
  });
}

