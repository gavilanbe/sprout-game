'use strict';
/* ---------- JEFES Y MINIJEFES ---------- */
function makeBoss(type,x,y){
  if(type==='topo')   return {type,hp:10,maxHp:10,st:'burrow',t:90,x:x*16-8,y:y*16-8,flash:0,mx:x*16-8,my:y*16-8,calmMsg:false,w:32,h:32};
  if(type==='avispa') return {type,hp:10,maxHp:10,st:'hover',t:90,x:x*16-8,y:16,flash:0,vx:0,vy:0,cyc:0,calmMsg:false,w:32,h:32};
  if(type==='viento') return {type,hp:14,maxHp:14,st:'float',t:120,x:x*16-8,y:8,flash:0,vx:0,vy:0,cyc:0,calmMsg:false,w:32,h:32};
}
function makeMidboss(type,x,y){
  if(type==='king')     return {type,hp:8,maxHp:8,st:'walk',t:60,x:x*16-4,y:y*16-4,flash:0,dir:1,vx:0,vy:0,w:24,h:24,kx:0,ky:0};
  if(type==='drone')    return {type,hp:8,maxHp:8,st:'hover',t:80,x:x*16-4,y:20,flash:0,vx:0,vy:0,w:24,h:24,kx:0,ky:0,cyc:0};
  if(type==='iceguard') return {type,hp:6,maxHp:6,st:'walk',t:40,x:x*16-4,y:y*16-4,flash:0,dir:1,w:24,h:24,kx:0,ky:0,soft:0};
}
function bossBox(b){ return [b.x+4,b.y+6,b.w-8,b.h-10]; }
function bossHit(b,n){ if(b.hp>2){ b.hp=Math.max(2,b.hp-n); b.flash=10; SFX.ehit(); hitStop=Math.max(hitStop,4); flyText.push({x:b.x+b.w/2,y:b.y-4,txt:''+n,t:26,col:'#fffbe8'}); return true; } SFX.bump(); return false; }
/* ===== EL VIENTO DEL NORTE ===== */
function updViento(){
  const b=boss; if(b.flash>0)b.flash--; b.t--;
  const enraged=b.hp<=Math.ceil(b.maxHp/2), calmed=b.hp<=2;
  const cx=b.x+16, cy=b.y+16, dx=player.x+8-cx, dy=player.y+10-cy, d=Math.hypot(dx,dy)||1;
  if(!calmed){
    if(b.st!=='rest'&&(tick&1)===0){ const n=b.st==='sweep'?2:1;
      for(let i=0;i<n;i++) parts.push({x:-4,y:Math.random()*120,vx:2+Math.random()*1.6,vy:(Math.random()-.5)*.4,life:70,col:(tick&2)?'#dff0ff':'#9ec7e8',nog:true}); }
    else if(b.st==='rest'&&(tick&7)===0) parts.push({x:-4,y:Math.random()*120,vx:1.1,vy:(Math.random()-.5)*.3,life:60,col:'#cfe8ff',nog:true});
  }
  if(calmed){
    if(b.st!=='rest'){ b.st='rest'; b.t=999; if(b.y<60)b.y=84; shake=4; SFX.bump(); }
    b.t=999;
    if(!b.calmMsg){ b.calmMsg=true; pendingSay=["(El viento cae y\nse queda quieto,\nencogido...)","(Ya no pelea.\nTrae memoria, no\nespada: acércate.)"]; }
  }
  if(b.st==='float'){
    b.x+=Math.sin(tick*.04)*1.2; b.y=8+Math.sin(tick*.07)*8; b.x=Math.max(8,Math.min(120,b.x));
    if(d<90){ player.kx+=(player.x+8-cx)/d*0.5; player.ky+=(player.y+10-cy)/d*0.45; }
    if((tick&3)===0) parts.push({x:cx,y:b.y+28,vx:(Math.random()-.5)*2,vy:1,life:14,col:'#cfe8ff',nog:true});
    if(b.t===30&&enemies.length<(enraged?2:1)) enemies.push(spawnEnemy('gust',(cx/16)|0,5,1));
    if(b.t<=0){ b.st='aim'; b.t=enraged?26:34; }
  } else if(b.st==='aim'){
    b.row=player.y-8;
    if((tick&2)===0) parts.push({x:cx+(Math.random()-.5)*14,y:cy,vx:0,vy:0,life:10,col:'#fff',nog:true});
    if(b.t<=0){ const sv=enraged?5:4; b.st='sweep'; b.x=player.x<80?-32:160; b.vx=player.x<80?sv:-sv; b.y=b.row; SFX.ehit(); }
  } else if(b.st==='sweep'){
    b.x+=b.vx; if((tick&1)===0) parts.push({x:cx,y:cy,vx:-b.vx*.4,vy:(Math.random()-.5),life:12,col:'#cfe8ff',nog:true});
    if(b.x<-36||b.x>164){ b.st='rest'; b.t=90; b.x=Math.max(8,Math.min(120,player.x-8)); b.y=84; SFX.bump(); shake=6; }
  } else { if((tick&7)===0) parts.push({x:cx,y:b.y+4,vx:(Math.random()-.5)*.6,vy:-.4,life:10,col:'#9ec7e8',nog:true});
    if(!calmed&&b.t<=0){ b.st='float'; b.t=enraged?90:120; } }
  const bb=bossBox(b);
  if(!calmed&&player.inv===0&&rectsHit(bb,hitPlayerBox())) hurt(2,cx,cy);
  if(b.flash===0&&b.st==='rest'&&meleeActive()&&rectsHit(meleeBox(),bb)) bossHit(b,meleeDmg());
}
/* ===== LA REINA AVISPA ===== */
function updAvispa(){
  const b=boss; if(b.flash>0)b.flash--; b.t--;
  const cx=b.x+16, cy=b.y+16;
  if(b.hp<=2&&b.st!=='yield'){ b.st='yield'; b.t=999; b.y=Math.min(88,Math.max(40,b.y)); enemies=[]; projs=[]; SFX.bump(); shake=4;
    if(!b.calmMsg){ b.calmMsg=true; pendingSay=["(La Reina se posa,\nagotada. Su\nzumbido suena a\ntregua...)","(Ya no pelea.\nAcércate y pulsa\nZ.)"]; } }
  if(b.st==='yield'){ b.t=999; if((tick&7)===0) parts.push({x:cx,y:b.y+4,vx:(Math.random()-.5)*.5,vy:-.3,life:10,col:'#f8d030',nog:true}); }
  else if(b.st==='hover'){ b.x+=Math.sin(tick*.06)*1.1; b.y=10+Math.sin(tick*.11)*6; b.x=Math.max(8,Math.min(120,b.x)); if(b.t<=0){ b.st='aim'; b.t=30; } }
  else if(b.st==='aim'){ if((tick&3)<2) parts.push({x:cx+(Math.random()-.5)*12,y:b.y+30,vx:0,vy:.8,life:8,col:'#f8d030',nog:true});
    if(b.t<=0){ const d=Math.hypot(player.x+8-cx,player.y+12-cy)||1; b.vx=(player.x+8-cx)/d*2.6; b.vy=(player.y+12-cy)/d*2.6; b.st='dive'; b.t=40; SFX.ehit(); } }
  else if(b.st==='dive'){ b.x+=b.vx; b.y+=b.vy; if(b.y>=88||b.t<=0||b.x<0||b.x>128){ b.st='tired'; b.t=85; b.y=Math.min(88,b.y); b.x=Math.max(0,Math.min(128,b.x)); SFX.bump(); shake=4; } }
  else { if(b.t<=0){ b.st='hover'; b.t=110; b.cyc++;
      if(b.cyc%2===1&&enemies.length<2){ enemies.push({...spawnEnemy('bee',(cx/16)|0,(cy/16)|0,1),homing:0}); SFX.blip(); } } }
  const bb=bossBox(b);
  if(player.inv===0&&b.st!=='tired'&&b.st!=='yield'&&rectsHit(bb,hitPlayerBox())) hurt(2,cx,cy);
  if(b.flash===0&&b.st==='tired'&&meleeActive()&&rectsHit(meleeBox(),bb)) bossHit(b,meleeDmg());
}
/* ===== EL TOPO REAL ===== */
function updTopo(){
  const b=boss; if(b.flash>0)b.flash--; b.t--;
  if(b.hp<=2&&b.st!=='yield'){ if(b.st==='burrow'||b.st==='warn'){ b.x=b.mx; b.y=b.my; puff(b.x+16,b.y+24,'#5a4a40',10,1.5); }
    b.st='yield'; b.t=999; projs=[]; SFX.bump(); shake=4;
    if(!b.calmMsg){ b.calmMsg=true; pendingSay=["(El Topo Real se\nencoge, jadeando,\nfuera de su\nagujero...)","(Ya no pelea.\nAcércate y pulsa\nZ.)"]; } }
  if(b.st==='yield'){ b.t=999; if((tick&7)===0) parts.push({x:b.x+8+Math.random()*16,y:b.y+24,vx:(Math.random()-.5)*.4,vy:-.3,life:10,col:'#8a7460',nog:true}); }
  else if(b.st==='burrow'){ const d=Math.hypot(player.x-8-b.mx,player.y-8-b.my)||1;
    b.mx+=(player.x-8-b.mx)/d*0.9; b.my+=(player.y-8-b.my)/d*0.9; b.mx=Math.max(12,Math.min(116,b.mx)); b.my=Math.max(12,Math.min(84,b.my));
    if((tick&3)===0) parts.push({x:b.mx+12+Math.random()*8,y:b.my+28,vx:(Math.random()-.5)*.8,vy:-.6,life:10,col:'#5a4a40',nog:true});
    if(b.t<=0){ b.st='warn'; b.t=28; } }
  else if(b.st==='warn'){ if((tick&1)===0) parts.push({x:b.mx+16+(Math.random()-.5)*10,y:b.my+28,vx:0,vy:-.8,life:8,col:'#6e5a4c',nog:true});
    if(b.t<=0){ b.st='up'; b.t=85; b.x=b.mx; b.y=b.my; SFX.edie(); shake=6; puff(b.x+16,b.y+24,'#5a4a40',12,1.6); } }
  else { const cx=b.x+16, cy=b.y+16;
    if(b.t===60||b.t===40){ const d=Math.hypot(player.x+8-cx,player.y+12-cy)||1;
      projs.push({x:cx,y:cy,vx:(player.x+8-cx)/d*1.5,vy:(player.y+12-cy)/d*1.5,t:90,kind:'rock'}); SFX.ehit(); }
    const bb=bossBox(b);
    if(player.inv===0&&rectsHit(bb,hitPlayerBox())) hurt(2,cx,cy);
    if(b.flash===0&&meleeActive()&&rectsHit(meleeBox(),bb)) bossHit(b,meleeDmg());
    if(b.t<=0&&b.st==='up'){ b.st='burrow'; b.t=100+hash(tick,7)%60; b.mx=b.x; b.my=b.y; } }
}
function updBoss(){ if(!boss) return; if(boss.type==='viento') updViento(); else if(boss.type==='avispa') updAvispa(); else updTopo(); }
/* ===== MINIJEFES ===== */
function midDefeated(){
  const m=midboss; SFX.edie(); SFX.fanfare(); shake=10; puff(m.x+12,m.y+12,'#fffbe8',20,2); puff(m.x+12,m.y+12,'#9088a0',12,1.5);
  const reward=m.type==='king'?'bomb':m.type==='drone'?'hook':'feather';
  if(m.type==='king') midKing=true; else if(m.type==='drone') midDrone=true; else midIce=true;
  pickups.push({kind:reward,x:m.x+4,y:m.y+4,t:0}); midboss=null; enemies=[]; projs=[]; bossCard=null; save();
  setTrack(regionOf(sx,sy)==='templo'?'templo':'cueva');
  for(let i=0;i<6;i++) pickups.push({kind:'heart',x:m.x+Math.random()*24,y:m.y+Math.random()*24,t:0,drop:20});
}
function updMidboss(){
  const m=midboss; if(!m) return; if(m.flash>0)m.flash--; m.t--; m.kx*=.8; m.ky*=.8;
  const cx=m.x+12, cy=m.y+12, dx=player.x+8-cx, dy=player.y+10-cy, d=Math.hypot(dx,dy)||1;
  const mb=[m.x+3,m.y+4,18,18];
  const move=(nx,ny)=>{ let bx=false,by=false; if(boxFree(nx+3,m.y+6,18,16)) m.x=nx; else bx=true; if(boxFree(m.x+3,ny+6,18,16)) m.y=ny; else by=true; return [bx,by]; };
  if(m.type==='king'){ // patrulla, carga hacia ti; solo la cola es blanda
    if(m.st==='walk'){ const [bx]=move(m.x+m.dir*.6+m.kx,m.y+m.ky); if(bx) m.dir*=-1;
      if(m.t<=0){ if(Math.abs(dy)<20){ m.st='windup'; m.t=24; m.dir=Math.sign(dx)||1; SFX.bump(); } else { m.t=50; move(m.x,m.y+Math.sign(dy)*10); } } }
    else if(m.st==='windup'){ m.x+=((tick&2)?1:-1)*.5; if(m.t<=0){ m.st='charge'; m.t=60; } }
    else if(m.st==='charge'){ const [bx]=move(m.x+m.dir*2.6,m.y); if(bx||m.t<=0){ m.st='stuck'; m.t=50; shake=6; SFX.bump(); puff(cx+m.dir*10,cy,'#8a7460',8,1.2); } }
    else { if(m.t<=0){ m.st='walk'; m.t=60; } }
    if(player.inv===0&&jumpT===0&&rectsHit(mb,hitPlayerBox())) hurt(2,cx,cy);
    if(m.flash===0&&meleeActive()&&rectsHit(meleeBox(),mb)){
      const behind=(m.dir>0&&player.x+8<cx-4)||(m.dir<0&&player.x+8>cx+4);
      if(behind||m.st==='stuck'||player.spin>0){ m.hp-=meleeDmg(); m.flash=8; SFX.ehit(); hitStop=3; flyText.push({x:cx,y:m.y-4,txt:''+meleeDmg(),t:24,col:'#fffbe8'}); m.kx=(cx-player.x)/d*2; }
      else { SFX.block(); m.flash=3; player.kx=(player.x-cx)/d*3; player.ky=(player.y-cy)/d*3; sparkle(cx,m.y,'#c8d8ff'); } }
  } else if(m.type==='drone'){ // vuela, se lanza en picado; tras chocar, queda aturdido
    if(m.st==='hover'){ m.x+=Math.sin(tick*.05)*1.3; m.y=16+Math.sin(tick*.09)*7; m.x=Math.max(4,Math.min(132,m.x));
      if(m.t<=0){ m.st='aim'; m.t=26; } }
    else if(m.st==='aim'){ if((tick&3)<2) parts.push({x:cx+(Math.random()-.5)*10,y:m.y+22,vx:0,vy:.8,life:8,col:'#f8d030',nog:true});
      if(m.t<=0){ m.vx=dx/d*3; m.vy=dy/d*3; m.st='dive'; m.t=40; SFX.ehit(); } }
    else if(m.st==='dive'){ m.x+=m.vx; m.y+=m.vy; if(m.y>=96||m.x<0||m.x>136||m.t<=0){ m.st='stunned'; m.t=70; m.y=Math.min(96,Math.max(0,m.y)); m.x=Math.max(0,Math.min(136,m.x)); SFX.bump(); shake=5; } }
    else { if(m.t<=0){ m.st='hover'; m.t=90; m.cyc++; if(m.cyc%2===0&&enemies.length<2) enemies.push(spawnEnemy('bee',(cx/16)|0,(cy/16)|0,1)); } }
    if(player.inv===0&&m.st!=='stunned'&&jumpT===0&&rectsHit(mb,hitPlayerBox())) hurt(2,cx,cy);
    if(m.flash===0&&m.st==='stunned'&&meleeActive()&&rectsHit(meleeBox(),mb)){ m.hp-=meleeDmg(); m.flash=8; SFX.ehit(); hitStop=3; flyText.push({x:cx,y:m.y-4,txt:''+meleeDmg(),t:24,col:'#fffbe8'}); }
    else if(m.flash===0&&m.st!=='stunned'&&meleeActive()&&rectsHit(meleeBox(),mb)){ SFX.block(); m.flash=3; sparkle(cx,m.y,'#c8d8ff'); }
  } else if(m.type==='iceguard'){ // pesado; las bombas lo ablandan y entonces la Hoja hiere
    if(m.soft>0) m.soft--;
    if(m.st==='walk'){ if(m.t%6===0) move(m.x+Math.sign(dx)*1.5+m.kx,m.y+Math.sign(dy)*1.5+m.ky); else move(m.x+m.kx,m.y+m.ky);
      if(m.t<=0){ m.st='stomp'; m.t=30; } }
    else if(m.st==='stomp'){ if(m.t===10){ shake=8; SFX.edie(); for(let i=0;i<8;i++){ const a=i/8*6.283; projs.push({x:cx,y:cy+8,vx:Math.cos(a)*1.4,vy:Math.sin(a)*1.4,t:60,kind:'ice'}); } }
      if(m.t<=0){ m.st='walk'; m.t=120; } }
    if(player.inv===0&&jumpT===0&&rectsHit(mb,hitPlayerBox())) hurt(2,cx,cy);
    if(m.flash===0&&meleeActive()&&rectsHit(meleeBox(),mb)){
      if(m.soft>0){ m.hp-=meleeDmg(); m.flash=8; SFX.ehit(); hitStop=3; flyText.push({x:cx,y:m.y-4,txt:''+meleeDmg(),t:24,col:'#fffbe8'}); }
      else { SFX.block(); m.flash=3; player.kx=(player.x-cx)/d*3; player.ky=(player.y-cy)/d*3; sparkle(cx,m.y,'#c8d8ff'); } }
  }
  if(m.hp<=0) midDefeated();
}
function blastMidboss(bx,by){ const m=midboss; if(!m) return;
  if(Math.hypot(m.x+12-bx,m.y+12-by)<(hasAmulet('topo')?40:30)){
    if(m.type==='iceguard'){ m.soft=160; m.flash=8; m.hp-=1; SFX.ehit(); puff(m.x+12,m.y+12,'#a8d8f0',10,1.4); flyText.push({x:m.x+12,y:m.y-4,txt:'1',t:24,col:'#fffbe8'}); }
    else { m.hp-=3; m.flash=8; flyText.push({x:m.x+12,y:m.y-4,txt:'3',t:24,col:'#fffbe8'}); }
    if(m.hp<=0) midDefeated(); } }
