'use strict';
/* ---------- JEFES Y MINIJEFES ---------- */
function makeBoss(type,x,y){
  if(type==='topo')   return {type,hp:18,maxHp:18,st:'burrow',t:90,x:x*16-8,y:y*16-8,flash:0,mx:x*16-8,my:y*16-8,calmMsg:false,w:32,h:32,cyc:0};
  if(type==='avispa') return {type,hp:20,maxHp:20,st:'hover',t:90,x:x*16-8,y:16,flash:0,vx:0,vy:0,cyc:0,calmMsg:false,w:32,h:32,sting:60,dives:0};
  if(type==='viento') return {type,hp:24,maxHp:24,st:'float',t:120,x:x*16-8,y:8,flash:0,vx:0,vy:0,cyc:0,calmMsg:false,w:32,h:32,ice:80,blowT:320};
}
function makeMidboss(type,x,y){
  if(type==='king')     return {type,hp:10,maxHp:10,st:'walk',t:60,x:x*16-4,y:y*16-4,flash:0,dir:1,vx:0,vy:0,w:24,h:24,kx:0,ky:0,again:0};
  if(type==='drone')    return {type,hp:10,maxHp:10,st:'hover',t:80,x:x*16-4,y:20,flash:0,vx:0,vy:0,w:24,h:24,kx:0,ky:0,cyc:0};
  if(type==='iceguard') return {type,hp:8,maxHp:8,st:'walk',t:40,x:x*16-4,y:y*16-4,flash:0,dir:1,w:24,h:24,kx:0,ky:0,soft:0};
  if(type==='scare')    return makeScare(x,y); // el Espantapájaros del molino (12b)
}
function bossBox(b){ return [b.x+4,b.y+6,b.w-8,b.h-10]; }
function bossPhase(b){ const k=b.hp/b.maxHp; return k>.64?1:k>.34?2:3; }
const BOSS_HITS={topo:3,avispa:3,viento:4}; // golpes que aguanta cada vez que queda vulnerable
function bossHit(b,n){ if(b.hp>2){ b.hp=Math.max(2,b.hp-n); b.flash=10; SFX.ehit(); if(typeof rumble==='function') rumble(90,.35,.6); hitStop=Math.max(hitStop,4); flyText.push({x:b.x+b.w/2,y:b.y-4,txt:''+n,t:26,col:'#fffbe8'}); hitSpark(b.x+b.w/2,b.y+b.h/2); b.squash=.3;
    if(BOSS_HITS[b.type]&&++b.hits>=BOSS_HITS[b.type]&&b.hp>2){ b.t=Math.min(b.t,8); shake=Math.max(shake,5); } // se sacude y vuelve a la carga
    return true; } SFX.bump(); return false; }
function bossClang(b,cx,cy){ // la Hoja rebota: sin daño, con chispa y retroceso
  if(b.clangT>0) return; b.clangT=14; SFX.clang(); shake=Math.max(shake,2);
  const d=Math.hypot(player.x+8-cx,player.y+10-cy)||1; player.kx=(player.x+8-cx)/d*3; player.ky=(player.y+10-cy)/d*3;
  for(let i=0;i<5;i++) sparkle(cx+(Math.random()-.5)*16,cy+(Math.random()-.5)*12,'#c8d8ff'); }
function fallAt(x,y,delay,ice,dmg){ projs.push({kind:'fall',x,y,t:1,delay,max:delay,ice:!!ice,dmg:dmg||2}); }
let bossRope=null; // la raíz tirando de la Reina
/* ===== EL VIENTO DEL NORTE =====
   Flota fuera de alcance. Barre tu fila (¡salta con el vilano!). El frío lo sostiene:
   enciende los cuatro braseros con el farol y caerá; entonces la Hoja le alcanza.
   Al levantarse apaga braseros (más cuanto más herido). */
function vientoLit(){ let n=0,t=0; for(let y=0;y<SH;y++) for(let x=0;x<SW;x++){ if(grid[y][x]===';') n++; if(grid[y][x]===';'||grid[y][x]===':') t++; } return [n,t]; }
function vientoBrazierLit(){ const b=boss; if(!b||b.type!=='viento') return; const [n,t]=vientoLit();
  SFX.brazier(); showToast('BRASEROS '+n+'/'+t,n>=t?'¡el frío cede!':'el viento se debilita');
  if(n>=t&&b.st!=='rest'&&b.st!=='drop'&&b.hp>2){ b.st='drop'; b.t=30; SFX.boss(); } }
function vientoBlowOut(k){ const lit=[]; for(let y=0;y<SH;y++) for(let x=0;x<SW;x++) if(grid[y][x]===';') lit.push([x,y]);
  for(let i=lit.length-1;i>0;i--){ const j=(Math.random()*(i+1))|0; [lit[i],lit[j]]=[lit[j],lit[i]]; }
  for(const [x,y] of lit.slice(0,k)){ grid[y][x]=':'; puff(x*16+8,y*16+4,'#dff0ff',8,1.3); for(let i=0;i<6;i++) parts.push({x:boss.x+16,y:boss.y+16,vx:(x*16+8-boss.x-16)/18,vy:(y*16+4-boss.y-16)/18,life:18,col:'#dff0ff',nog:true}); }
  if(lit.length) { markDirty(); SFX.brazierOut(); } }
function updViento(){
  const b=boss; if(b.flash>0)b.flash--; if(b.clangT>0) b.clangT--; b.t--;
  const ph=bossPhase(b), calmed=b.hp<=2;
  const cx=b.x+16, cy=b.y+16, dx=player.x+8-cx, dy=player.y+10-cy, d=Math.hypot(dx,dy)||1;
  if(!calmed&&b.st!=='rest'&&b.st!=='drop'&&(tick&1)===0){ const n=b.st==='sweep'?2:1;
    for(let i=0;i<n;i++) parts.push({x:-4,y:Math.random()*120,vx:2+Math.random()*1.6,vy:(Math.random()-.5)*.4,life:70,col:(tick&2)?'#dff0ff':'#9ec7e8',nog:true}); }
  if(calmed){
    if(b.st!=='rest'){ b.st='rest'; b.t=999; if(b.y<60)b.y=84; shake=4; SFX.bump(); }
    b.t=999;
    if(!b.calmMsg){ b.calmMsg=true; pendingSay=["(El viento cae y se queda quieto, encogido. De su ventisca se desprende un polvo gris...)","(Ya no pelea. Trae memoria, no espada: acércate.)"]; }
  }
  if(b.st==='float'){
    b.x+=Math.sin(tick*.04)*1.2; b.y=8+Math.sin(tick*.07)*8; b.x=Math.max(8,Math.min(120,b.x));
    const pull=ph===3?.75:.5; if(d<100){ player.kx+=(player.x+8-cx)/d*pull; player.ky+=(player.y+10-cy)/d*pull*.9; }
    if((tick&3)===0) parts.push({x:cx,y:b.y+28,vx:(Math.random()-.5)*2,vy:1,life:14,col:'#cfe8ff',nog:true});
    if(b.t===30&&enemies.length<(ph>=2?2:1)) enemies.push(spawnEnemy('gust',(cx/16)|0,5,1));
    if(ph>=2&&--b.ice<=0){ b.ice=ph===3?38:55; for(let i=0;i<(ph===3?3:2);i++) fallAt(player.x+8+(Math.random()-.5)*40,player.y+12+(Math.random()-.5)*28,44,true,2); }
    if(ph>=2&&--b.blowT<=0){ b.blowT=ph===3?220:320; vientoBlowOut(1); }
    if(b.t<=0){ b.st='aim'; b.t=ph===1?40:ph===2?32:26; }
  } else if(b.st==='aim'){
    b.row=player.y-8;
    if((tick&2)===0) parts.push({x:cx+(Math.random()-.5)*14,y:cy,vx:0,vy:0,life:10,col:'#fff',nog:true});
    if(b.t<=0){ const sv=ph===1?3.6:ph===2?4.2:4.8; b.st='sweep'; b.twice=ph===3&&!b.twice; b.x=player.x<80?-32:160; b.vx=player.x<80?sv:-sv; b.y=b.row; SFX.ehit(); }
  } else if(b.st==='sweep'){
    b.x+=b.vx; if((tick&1)===0) parts.push({x:cx,y:cy,vx:-b.vx*.4,vy:(Math.random()-.5),life:12,col:'#cfe8ff',nog:true});
    if(b.x<-36||b.x>164){
      if(b.twice){ b.st='aim'; b.t=18; }
      else { b.twice=false; b.st='float'; b.t=ph===1?120:ph===2?100:80; b.x=Math.max(8,Math.min(120,player.x-8)); b.y=8; } }
  } else if(b.st==='drop'){ // los braseros arden: el frío cede y cae
    b.y=Math.min(84,b.y+2.4); b.x+=(Math.max(8,Math.min(120,player.x-8))-b.x)*.04;
    if(b.t<=0||b.y>=84){ b.st='rest'; b.hits=0; b.t=ph===3?120:160; shake=8; SFX.bump(); puff(cx,b.y+28,'#dff0ff',14,1.6); }
  } else { // rest: en el suelo, jadeando
    if((tick&7)===0) parts.push({x:cx,y:b.y+4,vx:(Math.random()-.5)*.6,vy:-.4,life:10,col:'#9ec7e8',nog:true});
    if(!calmed&&b.t<=0){ b.st='float'; b.t=ph===1?110:90; b.y=8; vientoBlowOut(ph===1?2:ph===2?3:4); shake=6; } }
  const bb=bossBox(b);
  if(!calmed&&b.st!=='rest'&&b.st!=='drop'&&player.inv===0&&jumpT===0&&rectsHit(bb,hitPlayerBox())) hurt(2,cx,cy);
  if(b.flash===0&&meleeActive()&&rectsHit(meleeBox(),bb)){ if(b.st==='rest') bossHit(b,meleeDmg()); else if(b.st!=='sweep') bossClang(b,cx,cy); }
}
/* ===== LA REINA AVISPA =====
   Vuela alto: la Hoja no llega y sus alas zumban como un escudo. Lánzale la RAÍZ-GANCHO:
   la arrastras al suelo y queda a tu merced. Con cada herida pica más rápido y trae su enjambre. */
function hookBoss(D){
  const b=boss; if(!b||b.type!=='avispa'||!['hover','aim','tired'].includes(b.st)) return false;
  const x0=player.x+8, y0=player.y+10, bb=bossBox(b), R=[bb[0]-5,bb[1]-5,bb[2]+10,bb[3]+10];
  for(let s=8;s<=120;s+=4){ const px=x0+D[0]*s, py=y0+D[1]*s; if(px>R[0]&&px<R[0]+R[2]&&py>R[1]&&py<R[1]+R[3]){
    b.st='yanked'; b.t=14; const tx=Math.max(0,Math.min(128,player.x-8+D[0]*22)), ty=Math.max(12,Math.min(88,player.y-8+D[1]*22));
    b.vx=(tx-b.x)/14; b.vy=(ty-b.y)/14; bossRope={t:18}; SFX.hookYank(); shake=4; return true; } }
  return false;
}
function queenStings(b,n){ const cx=b.x+16, cy=b.y+24, a0=Math.atan2(player.y+12-cy,player.x+8-cx), sp=n>3?.28:.34;
  for(let i=0;i<n;i++){ const a=a0+(i-(n-1)/2)*sp; projs.push({x:cx,y:cy,vx:Math.cos(a)*1.8,vy:Math.sin(a)*1.8,t:90,kind:'sting',dmg:1}); } SFX.blip(); }
function updAvispa(){
  const b=boss; if(b.flash>0)b.flash--; if(b.clangT>0) b.clangT--; b.t--;
  const cx=b.x+16, cy=b.y+16, ph=bossPhase(b);
  if(b.hp<=2&&b.st!=='yield'){ b.st='yield'; b.t=999; b.y=Math.min(88,Math.max(40,b.y)); enemies=[]; projs=[]; SFX.bump(); shake=4;
    if(!b.calmMsg){ b.calmMsg=true; pendingSay=["(La Reina se sacude el polvo gris de las alas y se posa, agotada.)","(Ya no pelea. Acércate y pulsa Z.)"]; } }
  if(b.st==='yield'){ b.t=999; if((tick&7)===0) parts.push({x:cx,y:b.y+4,vx:(Math.random()-.5)*.5,vy:-.3,life:10,col:'#f8d030',nog:true}); }
  else if(b.st==='hover'){ b.x+=Math.sin(tick*.06)*(ph===3?1.6:1.1); b.y=10+Math.sin(tick*.11)*6; b.x=Math.max(8,Math.min(120,b.x));
    if(ph>=2&&--b.sting<=0){ b.sting=ph===3?48:70; queenStings(b,ph===3?5:3); }
    if(b.t<=0){ b.st='aim'; b.t=ph===3?24:34; } }
  else if(b.st==='aim'){ if((tick&3)<2) parts.push({x:cx+(Math.random()-.5)*12,y:b.y+30,vx:0,vy:.8,life:8,col:'#f8d030',nog:true});
    if(b.t<=0){ const d=Math.hypot(player.x+8-cx,player.y+12-cy)||1, sp=ph===1?2.6:ph===2?3:3.4; b.vx=(player.x+8-cx)/d*sp; b.vy=(player.y+12-cy)/d*sp; b.st='dive'; b.t=40; SFX.ehit(); } }
  else if(b.st==='dive'){ b.x+=b.vx; b.y+=b.vy; if(b.y>=88||b.t<=0||b.x<0||b.x>128){ b.st='tired'; b.t=ph===1?60:45; b.y=Math.min(88,b.y); b.x=Math.max(0,Math.min(128,b.x)); SFX.bump(); shake=4; b.dives++;
      if(ph>=2&&enemies.length<(ph===3?3:2)){ enemies.push({...spawnEnemy('bee',(cx/16)|0,(cy/16)|0,1),homing:0}); SFX.blip(); } } }
  else if(b.st==='yanked'){ b.x+=b.vx; b.y+=b.vy; if(b.t<=0){ b.st='pinned'; b.hits=0; b.t=ph===3?85:110; shake=6; SFX.bump(); puff(cx,b.y+28,'#f8d030',10,1.3); } }
  else if(b.st==='pinned'){ if((tick&7)<4) sparkle(b.x+8+Math.random()*16,b.y+2,'#fff0a0');
    if(b.t<=0){ b.st='hover'; b.t=ph===3?50:80; b.y=Math.max(10,b.y-30); SFX.ehit(); } }
  else { // tired: se recupera en el suelo; sus alas aún la protegen
    if(b.t<=0){ if(ph===3&&b.dives%2===1){ b.st='aim'; b.t=18; b.y=Math.max(10,b.y-20); } else { b.st='hover'; b.t=ph===1?110:90; } } }
  const bb=bossBox(b);
  if(player.inv===0&&jumpT===0&&(b.st==='dive'||b.st==='hover'||b.st==='aim')&&rectsHit(bb,hitPlayerBox())) hurt(2,cx,cy);
  if(b.flash===0&&meleeActive()&&rectsHit(meleeBox(),bb)){ if(b.st==='pinned') bossHit(b,meleeDmg()); else if(b.st!=='yield') bossClang(b,cx,cy); }
  if(bossRope&&--bossRope.t<=0) bossRope=null;
}
/* ===== EL TOPO REAL =====
   Cava bajo tus pies. Al salir lleva un casco de roca: la Hoja rebota.
   Una BELLOTA-BOMBA que estalle en su túnel (o a su lado) lo saca aturdido: ¡ahora!
   Herido cava más rápido, dispara anillos de rocas y hace llover piedras del techo. */
function topoDaze(b,dmg){ if(b.st==='yield') return;
  if(b.st==='burrow'||b.st==='warn'){ b.x=b.mx; b.y=b.my; puff(b.x+16,b.y+24,'#5a4a40',14,1.8); }
  b.st='dazed'; b.t=130; b.hits=0; shake=8; SFX.edie(); if(dmg&&b.hp>2){ b.hp=Math.max(2,b.hp-dmg); b.flash=10; flyText.push({x:b.x+16,y:b.y-4,txt:''+dmg,t:26,col:'#fffbe8'}); } }
function bossBomb(x,y,big){ const b=boss; if(!b) return; const R=big?36:30;
  if(b.type==='topo'){
    if((b.st==='burrow'||b.st==='warn')&&Math.hypot(b.mx+16-x,b.my+24-y)<R) topoDaze(b,1);
    else if(b.st==='up'&&Math.hypot(b.x+16-x,b.y+18-y)<R) topoDaze(b,1);
    else if(b.st==='dazed'&&Math.hypot(b.x+16-x,b.y+18-y)<R){ bossHit(b,2); b.t=Math.max(b.t,60); } }
  else if(b.type==='avispa'){ if((b.st==='pinned'||b.st==='tired')&&Math.hypot(b.x+16-x,b.y+18-y)<R) bossHit(b,2); }
  else if(b.type==='ciervo'){ if(b.mantle===0&&b.st!=='yield'&&Math.hypot(b.x+16-x,b.y+18-y)<R&&bossHit(b,2)) b.hitsExp=(b.hitsExp||0)+1; } // al descubierto, la bomba también le alcanza
}
function updTopo(){
  const b=boss; if(b.flash>0)b.flash--; if(b.clangT>0) b.clangT--; b.t--;
  const ph=bossPhase(b);
  if(b.hp<=2&&b.st!=='yield'){ if(b.st==='burrow'||b.st==='warn'){ b.x=b.mx; b.y=b.my; puff(b.x+16,b.y+24,'#5a4a40',10,1.5); }
    b.st='yield'; b.t=999; projs=[]; SFX.bump(); shake=4;
    if(!b.calmMsg){ b.calmMsg=true; pendingSay=["(El Topo Real se sacude el último polvo gris y se queda quieto, jadeando.)","(Ya no pelea. Acércate y pulsa Z.)"]; } }
  if(b.st==='yield'){ b.t=999; if((tick&7)===0) parts.push({x:b.x+8+Math.random()*16,y:b.y+24,vx:(Math.random()-.5)*.4,vy:-.3,life:10,col:'#8a7460',nog:true}); }
  else if(b.st==='burrow'){ const d=Math.hypot(player.x-8-b.mx,player.y-8-b.my)||1, sp=ph===1?.9:ph===2?1.15:1.35;
    b.mx+=(player.x-8-b.mx)/d*sp; b.my+=(player.y-8-b.my)/d*sp; b.mx=Math.max(12,Math.min(116,b.mx)); b.my=Math.max(12,Math.min(84,b.my));
    if((tick&3)===0) parts.push({x:b.mx+12+Math.random()*8,y:b.my+28,vx:(Math.random()-.5)*.8,vy:-.6,life:10,col:'#5a4a40',nog:true});
    if(ph===3&&(tick%36)===0) fallAt(player.x+8+(Math.random()-.5)*20,player.y+12+(Math.random()-.5)*14,42,false,2);
    if(b.t<=0){ b.st='warn'; b.t=ph===3?20:28; } }
  else if(b.st==='warn'){ if((tick&1)===0) parts.push({x:b.mx+16+(Math.random()-.5)*10,y:b.my+28,vx:0,vy:-.8,life:8,col:'#6e5a4c',nog:true});
    if(b.t<=0){ b.st='up'; b.t=ph===1?100:84; b.x=b.mx; b.y=b.my; SFX.edie(); shake=6; puff(b.x+16,b.y+24,'#5a4a40',12,1.6); b.cyc++;
      const cx=b.x+16, cy=b.y+16;
      if(ph>=2){ const n=ph===3?10:8; for(let i=0;i<n;i++){ const a=i/n*6.283+b.cyc*.3; projs.push({x:cx,y:cy,vx:Math.cos(a)*1.3,vy:Math.sin(a)*1.3,t:80,kind:'rock',dmg:ph===3?2:1}); } }
      if(ph>=2&&enemies.length<2&&b.cyc%2===0) enemies.push(spawnEnemy('topillo',((cx/16)|0)+(player.x<cx?-2:2),Math.max(1,Math.min(6,(cy/16)|0)),1)); } }
  else if(b.st==='dazed'){ if((tick&7)<4) sparkle(b.x+8+Math.random()*16,b.y+2,'#fff0a0');
    const bb=bossBox(b); if(b.flash===0&&meleeActive()&&rectsHit(meleeBox(),bb)) bossHit(b,meleeDmg());
    if(b.t<=0){ b.st='burrow'; b.t=ph===1?100:70; b.mx=b.x; b.my=b.y; puff(b.x+16,b.y+24,'#5a4a40',10,1.4); SFX.bump(); } }
  else { const cx=b.x+16, cy=b.y+16;
    const shots=ph===1?[75,45]:ph===2?[60]:[70,50,30];
    if(shots.includes(b.t)){ const d=Math.hypot(player.x+8-cx,player.y+12-cy)||1;
      projs.push({x:cx,y:cy,vx:(player.x+8-cx)/d*1.6,vy:(player.y+12-cy)/d*1.6,t:90,kind:'rock',dmg:ph===3?2:1}); SFX.ehit(); }
    const bb=bossBox(b);
    if(player.inv===0&&jumpT===0&&rectsHit(bb,hitPlayerBox())) hurt(2,cx,cy);
    if(b.flash===0&&meleeActive()&&rectsHit(meleeBox(),bb)) bossClang(b,cx,cy);
    if(b.t<=0&&b.st==='up'){ b.st='burrow'; b.t=(ph===1?100:ph===2?80:70)+hash(tick,7)%50; b.mx=b.x; b.my=b.y; } }
}
function updBoss(){ if(!boss||boss.dying) return; if(boss.type==='viento'){ if(boss.cocoon&&!boss.echo) updCocoon(); else updViento(); } /* el de verdad está en su capullo (15n); su eco pelea como siempre */ else if(boss.type==='avispa') updAvispa(); else if(boss.type==='ciervo') updCiervo(); else updTopo(); }
/* ===== MINIJEFES ===== */
function midDefeated(){ const m=midboss; if(!m||m.dead) return; // cae: se queda quieto y llega su despedida (15j-15m); luego, la recompensa
  m.dead=true; m.flash=0; projs=[]; enemies=[]; queueBye(m.type,fb=>midReward(m,fb),{mid:true}); }
function midReward(m,fb){ if(midboss!==m) return;
  if(fb){ SFX.edie(); SFX.fanfare(); shake=10; puff(m.x+12,m.y+12,'#fffbe8',20,2); puff(m.x+12,m.y+12,'#9088a0',12,1.5); }
  const reward=m.type==='king'?'bomb':m.type==='drone'?'hook':m.type==='scare'?'molinillo':'feather';
  if(m.type==='king') midKing=true; else if(m.type==='drone') midDrone=true; else if(m.type==='scare') midScare=true; else midIce=true;
  pickups.push({kind:reward,x:m.x+4,y:m.y+4,t:0}); midboss=null; enemies=[]; projs=[]; bossCard=null; save();
  olvHuskMoth(m.x+12,m.y+14); // de la muda sale una polilla gris que se va hacia el norte (12d)
  const reg=regionOf(sx,sy); setTrack(reg==='templo'?'templo':reg==='molino'&&TRACKS.molino?'molino':'cueva');
  for(let i=0;i<6;i++) pickups.push({kind:'heart',x:m.x+Math.random()*24,y:m.y+Math.random()*24,t:0,drop:20});
}
function updMidboss(){
  const m=midboss; if(!m||m.dead) return; // vencido: espera su despedida
  if(m.type==='scare'){ updScare(m); if(m.hp<=0) midDefeated(); return; } // el Espantapájaros (12b)
  if(m.flash>0)m.flash--; m.t--; m.kx*=.8; m.ky*=.8;
  const cx=m.x+12, cy=m.y+12, dx=player.x+8-cx, dy=player.y+10-cy, d=Math.hypot(dx,dy)||1;
  const mb=[m.x+3,m.y+4,18,18];
  const move=(nx,ny)=>{ let bx=false,by=false; if(boxFree(nx+3,m.y+6,18,16)) m.x=nx; else bx=true; if(boxFree(m.x+3,ny+6,18,16)) m.y=ny; else by=true; return [bx,by]; };
  if(m.type==='king'){ // patrulla, carga hacia ti; solo la cola es blanda
    if(m.st==='walk'){ const [bx]=move(m.x+m.dir*.6+m.kx,m.y+m.ky); if(bx) m.dir*=-1;
      if(m.t<=0){ if(Math.abs(dy)<20){ m.st='windup'; m.t=24; m.dir=Math.sign(dx)||1; SFX.bump(); } else { m.t=50; move(m.x,m.y+Math.sign(dy)*10); } } }
    else if(m.st==='windup'){ m.x+=((tick&2)?1:-1)*.5; if(m.t<=0){ m.st='charge'; m.t=60; } }
    else if(m.st==='charge'){ const [bx]=move(m.x+m.dir*(m.hp<=5?2.9:2.4),m.y); if(bx||m.t<=0){ m.st='stuck'; m.t=m.hp<=5?45:60; shake=6; SFX.bump(); puff(cx+m.dir*10,cy,'#8a7460',8,1.2); } }
    else { if(m.t<=0){ if(m.hp<=5&&!m.again){ m.again=1; m.st='windup'; m.t=16; m.dir=Math.sign(dx)||1; SFX.bump(); } else { m.again=0; m.st='walk'; m.t=60; } } }
    if(player.inv===0&&jumpT===0&&rectsHit(mb,hitPlayerBox())) hurt(2,cx,cy);
    if(m.flash===0&&meleeActive()&&rectsHit(meleeBox(),mb)){
      const behind=(m.dir>0&&player.x+8<cx-4)||(m.dir<0&&player.x+8>cx+4);
      if(behind||m.st==='stuck'||player.spin>0){ m.hp-=meleeDmg(); m.flash=8; SFX.ehit(); hitStop=3; flyText.push({x:cx,y:m.y-4,txt:''+meleeDmg(),t:24,col:'#fffbe8'}); m.kx=(cx-player.x)/d*2; }
      else { SFX.block(); m.flash=3; player.kx=(player.x-cx)/d*3; player.ky=(player.y-cy)/d*3; sparkle(cx,m.y,'#c8d8ff'); } }
  } else if(m.type==='drone'){ // vuela, se lanza en picado; tras chocar, queda aturdido
    if(m.st==='hover'){ m.x+=Math.sin(tick*.05)*1.3; m.y=16+Math.sin(tick*.09)*7; m.x=Math.max(4,Math.min(132,m.x));
      if(m.t<=0){ m.st='aim'; m.t=26; } }
    else if(m.st==='aim'){ if((tick&3)<2) parts.push({x:cx+(Math.random()-.5)*10,y:m.y+22,vx:0,vy:.8,life:8,col:'#f8d030',nog:true});
      if(m.t<=0){ const sp=m.hp<=5?3.7:3; m.vx=dx/d*sp; m.vy=dy/d*sp; m.st='dive'; m.t=40; SFX.ehit(); } }
    else if(m.st==='dive'){ m.x+=m.vx; m.y+=m.vy; if(m.y>=96||m.x<0||m.x>136||m.t<=0){ m.st='stunned'; m.t=80; m.y=Math.min(96,Math.max(0,m.y)); m.x=Math.max(0,Math.min(136,m.x)); SFX.bump(); shake=5; } }
    else { if(m.t<=0){ m.st='hover'; m.t=m.hp<=5?70:90; m.cyc++; if((m.hp<=5||m.cyc%2===0)&&enemies.length<2) enemies.push(spawnEnemy('bee',(cx/16)|0,(cy/16)|0,1)); } }
    if(player.inv===0&&m.st!=='stunned'&&jumpT===0&&rectsHit(mb,hitPlayerBox())) hurt(2,cx,cy);
    if(m.flash===0&&m.st==='stunned'&&meleeActive()&&rectsHit(meleeBox(),mb)){ m.hp-=meleeDmg(); m.flash=8; SFX.ehit(); hitStop=3; flyText.push({x:cx,y:m.y-4,txt:''+meleeDmg(),t:24,col:'#fffbe8'}); }
    else if(m.flash===0&&m.st!=='stunned'&&meleeActive()&&rectsHit(meleeBox(),mb)){ SFX.block(); m.flash=3; sparkle(cx,m.y,'#c8d8ff'); }
  } else if(m.type==='iceguard'){ // pesado; las bombas lo ablandan y entonces la Hoja hiere
    if(m.soft>0) m.soft--;
    if(m.st==='walk'){ if(m.t%6===0) move(m.x+Math.sign(dx)*1.5+m.kx,m.y+Math.sign(dy)*1.5+m.ky); else move(m.x+m.kx,m.y+m.ky);
      if(m.t<=0){ m.st='stomp'; m.t=30; } }
    else if(m.st==='stomp'){ if(m.t===10){ shake=8; SFX.edie(); const n=m.hp<=4?12:8; for(let i=0;i<n;i++){ const a=i/n*6.283; projs.push({x:cx,y:cy+8,vx:Math.cos(a)*1.4,vy:Math.sin(a)*1.4,t:60,kind:'ice'}); } }
      if(m.t<=0){ m.st='walk'; m.t=m.hp<=4?80:120; } }
    if(player.inv===0&&jumpT===0&&rectsHit(mb,hitPlayerBox())) hurt(2,cx,cy);
    if(m.flash===0&&meleeActive()&&rectsHit(meleeBox(),mb)){
      if(m.soft>0){ m.hp-=meleeDmg(); m.flash=8; SFX.ehit(); hitStop=3; flyText.push({x:cx,y:m.y-4,txt:''+meleeDmg(),t:24,col:'#fffbe8'}); }
      else { SFX.block(); m.flash=3; player.kx=(player.x-cx)/d*3; player.ky=(player.y-cy)/d*3; sparkle(cx,m.y,'#c8d8ff'); } }
  }
  if(m.hp<=0) midDefeated();
}
function blastMidboss(bx,by){ const m=midboss; if(!m) return;
  if(Math.hypot(m.x+12-bx,m.y+12-by)<(hasAmulet('topo')?40:30)){
    if(m.type==='iceguard'){ m.soft=220; m.flash=8; m.hp-=1; SFX.ehit(); puff(m.x+12,m.y+12,'#a8d8f0',10,1.4); flyText.push({x:m.x+12,y:m.y-4,txt:'1',t:24,col:'#fffbe8'}); }
    else { m.hp-=3; m.flash=8; flyText.push({x:m.x+12,y:m.y-4,txt:'3',t:24,col:'#fffbe8'}); }
    if(m.hp<=0) midDefeated(); } }
