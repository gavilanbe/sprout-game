'use strict';
/* ============================================================
   BICHOS DEL CAMPO: rana, espino, ráfaga, carámbano, setón y cangrejo.
   Aspecto y juice (ganchos ENEMY_DRAW / ENEMY_FX / ENEMY_DEATH de 11-enemies): 16×16 y la misma técnica de sus
   sprites (spr a mano, o creature = blobArt dentro de 16×16 + filas de detalle), con más fotogramas —parpadeo,
   respirar, anticipación—, aplastar y estirar, polvo al caer, estrellitas si están aturdidos y una muerte propia.
   Nada de esto cambia cómo juegan: la IA, la vida, el daño y las cajas siguen en 11-enemies.
   ============================================================ */
const CP_W=new Map(); // versiones en blanco (golpe)
function cpW(img){ let c=CP_W.get(img); if(!c){ c=whiten(img); CP_W.set(img,c); } return c; }
function cpDraw(img,x,y,flip,e){ const src=e&&e.flash>4?cpW(img):img; x=Math.round(x); y=Math.round(y);
  if(flip){ ctx.save(); ctx.translate(x+src.width,y); ctx.scale(-1,1); ctx.drawImage(src,0,0); ctx.restore(); } else ctx.drawImage(src,x,y); }
function cpStun(e){ if(!(e.stun>0)) return; for(let i=0;i<3;i++){ const a=tick*.15+i*2.1; caStar(Math.round(e.x+8+Math.cos(a)*6),Math.round(e.y-2+Math.sin(a)*2),2,'#fff0a0'); } }
function cpBurst(x,y,cols,n,sp,o){ o=o||{}; for(let i=0;i<n;i++){ const a=i/n*6.283+Math.random()*.4, s=(sp||1.4)*(.6+Math.random()*.6);
  parts.push({k:o.k||'shard',x:x+Math.cos(a)*2,y:y+Math.sin(a)*2,vx:Math.cos(a)*s,vy:Math.sin(a)*s-(o.up||.4),life:(o.life||16)+(i&3),max:(o.life||16)+3,r:o.r,col:cols[i%cols.length],nog:o.nog,sway:Math.random()*6}); } }
function cpDust(x,y,col,n){ for(let i=0;i<(n||4);i++){ const s=i<(n||4)/2?-1:1; parts.push({k:'dust',x:x+s*(2+(i%2)*3),y,vx:s*(.4+(i%2)*.3),vy:-.1,life:14,max:14,r:1+(i&1),col:col||groundDustCol(),nog:true}); } }
function cpPrev(e){ const p=e._pst; e._pst=e.st; return p; }

/* ---------- LA RANA: parpadea y hace gárgaras con el buche; se agacha de verdad, salta en arco y cae chapoteando ---------- */
const FROG_BLINK=spr(["................","................","................","...kkk....kkk...","..khhhk..khhhk..","..kkkkk..kkkkk..","..khhhkkkkhhhk..",".khHhgggggghhhk.",".kgggggggggggGk.",".kgGgkkkkkkgGgk.",".kggyyyyyyyyggk.","kgGgyyyyyyyygGgk","kGggGyYYYYyGggGk",".kkGgkkkkkkgGkk.","kGGGk......kGGGk",".kkk........kkk."],FROG_FX);
const FROG_CROAK=spr(["................","................","................","...kkk....kkk...","..kqqqk..kqqqk..","..kqkqk..kqkqk..","..khhhkkkkhhhk..",".khHhgggggghhhk.",".kgggggggggggGk.",".kgGgkkkkkkgGgk.",".kggyyyyyyyyggk.","kgGgyyyyyyyygGgk","kGggyyYYYYyyggGk",".kkGkyYYYYYykGkk","kGGGkkyyyykkGGGk",".kkk..kkkk..kkk."],FROG_FX);
const FROG_CROUCH=spr(["................","................","................","................","................","...kkk....kkk...","..kqqqk..kqqqk..","..kqkqkkkkqkqk..",".khHhgggggghhhk.","kgggggggggggggGk","kgGgkkkkkkkkgGgk","kggyyyyyyyyyyggk","kGgGyYYYYYYyGgGk","kkGGkkkkkkkkGGkk","kGGk........kGGk",".kk..........kk."],FROG_FX);
ENEMY_DRAW.frog=e=>{ const jump=e.st==='jump', z=jump?Math.sin(Math.max(0,26-e.air)/26*Math.PI)*8:0;
  drawShadow(e.x+8,e.y+15,jump?Math.max(3,5-z/3):5);
  let img=FROG; const a=(e.t+(e.x|0))%120;
  if(jump) img=FROG_JUMP; else if(e.st==='crouch') img=FROG_CROUCH;
  else if(a>=60&&a<74) img=((a>>2)&1)?FROG_CROAK:FROG; else if(a>=100&&a<104) img=FROG_BLINK;
  const tr=e.st==='crouch'&&e.ct<8?((tick&2)?1:-1):0;
  cpDraw(img,e.x+tr,e.y-z,false,e); cpStun(e); };
ENEMY_FX.frog=(e,dx,dy,d)=>{ const p=cpPrev(e);
  if(p==='crouch'&&e.st==='jump'){ cpDust(e.x+8,e.y+15,'#8ab860',4); if(AC) beep('triangle',520,900,.06,.02); }
  if(p==='jump'&&e.st==='sit'){ e.squash=.4; cpDust(e.x+8,e.y+15,'#8ab860',6); parts.push({k:'ripple',x:e.x+8,y:e.y+14,vx:0,vy:0,life:14,max:14,col:'#c0f090',nog:true}); }
  const a=(e.t+(e.x|0))%120; if(e.st==='sit'&&a===60&&AC&&d<90) beep('square',150,110,.08,.025); }
ENEMY_DEATH.frog=e=>{ const x=e.x+8, y=e.y+9; cpBurst(x,y,['#58b048','#2e7830','#c0f090','#f0f0b0'],10,1.6);
  for(let i=0;i<3;i++) parts.push({k:'leafF',x:x-4+i*4,y:y-2,vx:(i-1)*.6,vy:-1.1,life:40,max:40,sway:i*2,col:['#58b048','#8ad860','#2e7830'][i]});
  parts.push({k:'ripple',x,y:e.y+14,vx:0,vy:0,life:16,max:16,col:'#c0f090',nog:true}); parts.push({x,y,vx:0,vy:0,life:12,col:'#ffffff',ring:true,r:12,nog:true});
  if(AC) beep('square',420,120,.18,.03); };

/* ---------- EL ESPINO: respira; al acercarte tiembla y abre los ojos; se abre de golpe y muerde ---------- */
const THORN_WAKE=creature([{x:8,y:9,r:5.9}],THORN_PAL,["........T.......","...T....k...T...","....k.......k...","................",".....e..........","....e...........","Tk..nn....nn..kT","....kq....qk....","....ky....yk....",".....RRRRRR.....","................","................","....k.......k...","...T....k...T...","........T.......","................"],THORN_FX);
const THORN_BITE=creature([{x:8,y:9,r:6.2}],THORN_PAL,["........T.......","..T.....k....T..","...k........k...","................",".....e..........","....nn....nn....","Tk..ky....yk..kT","....kkkkkkkk....","....RqqqqqqR....","....RkkkkkkR....","....RqqqqqqR....","....RRRRRRRR....","...k.kkkkkk.k...","..T.....k....T..","........T.......","................"],THORN_FX);
ENEMY_DRAW.thorn=e=>{ const d=Math.hypot(player.x-e.x,player.y-e.y);
  let img=THORN, ox=0, oy=((e.t>>4)&1)&&e.st==='closed'?1:0;
  if(e.st==='open'){ img=((e.t>>2)&3)===0?THORN_BITE:THORN_OPEN; oy=0; }
  else if(d<44){ img=THORN_WAKE; ox=(tick&2)?1:-1; oy=0; }
  cpDraw(img,e.x+ox,e.y+oy,false,e); cpStun(e); };
ENEMY_FX.thorn=(e,dx,dy,d)=>{ const p=cpPrev(e);
  if(p==='closed'&&e.st==='open'){ e.squash=.35; cpBurst(e.x+8,e.y+9,['#58b048','#2e8a34','#f8ecc0'],6,1.2,{life:12,nog:true}); }
  if(p==='open'&&e.st==='closed'){ e.squash=.2; if(AC) beep('square',260,160,.05,.02); }
  if(e.st==='open'&&((e.t>>2)&3)===0&&(e.t&3)===0&&AC&&d<60) beep('square',700,420,.03,.018); };
ENEMY_DEATH.thorn=e=>{ const x=e.x+8, y=e.y+9; cpBurst(x,y,['#58b048','#1e6a28','#9ae070'],10,1.5); cpBurst(x,y,['#f8ecc0'],6,2.2,{life:10,nog:true});
  for(let i=0;i<4;i++) parts.push({k:'leafF',x:x-6+i*4,y,vx:(i-1.5)*.5,vy:-1,life:45,max:45,sway:i,col:i&1?'#58b048':'#2e8a34'});
  for(let i=0;i<3;i++) parts.push({k:'petal',x:x-3+i*3,y:y+2,vx:(i-1)*.4,vy:-.8,life:40,max:40,sway:i*2,col:'#c83040'});
  parts.push({x,y,vx:0,vy:0,life:12,col:'#ffffff',ring:true,r:12,nog:true}); };

/* ---------- LA RÁFAGA DEL NORTE: un remolino de nieve con ojitos de hielo, en píxeles; deja copos y tira de ti ---------- */
const GUST_ENEMY=Array.from({length:6},(_,f)=>mkArt(16,16,g=>{ const cx=8, cy=8.5;
  for(let y=0;y<16;y++) for(let x=0;x<16;x++){ const dx=x+.5-cx, dy=(y+.5-cy)*1.15, r=Math.hypot(dx,dy); if(r>6.6||r<.8) continue;
    const a=((Math.atan2(dy,dx)+f*1.047)%6.2832+6.2832)%6.2832, v=(r-a*1.05+20)%5.2; if(v>2.3) continue;
    g.fillStyle=r<2.6?'#ffffff':r<4.6?'#e8f6ff':'#a8d8f0'; g.fillRect(x,y,1,1); }
  g.fillStyle='#e8f6ff'; g.fillRect(5,7,6,3); g.fillRect(6,6,4,5); // la carita en el ojo del remolino
  g.fillStyle='#1a2a58'; g.fillRect(6,8,1,2); g.fillRect(9,8,1,2); g.fillStyle='#ffffff'; g.fillRect(6,8,1,1); g.fillRect(9,8,1,1);
  g.fillStyle='#6fd8ff'; g.fillRect(7,10,2,1);
  artOutline(g,16,16,'#2c3c68'); }));
ENEMY_DRAW.gust=e=>{ const f=((tick>>2)+(e.x|0))%6, bob=Math.round(Math.sin(tick*.12+e.x)*1.5);
  drawShadow(e.x+8,e.y+15,3); cpDraw(GUST_ENEMY[f],e.x,e.y+bob-2,false,e);
  for(let i=0;i<3;i++){ const a=tick*.2+i*2.1, r=7+Math.sin(tick*.1+i)*1.2; ctx.fillStyle=i&1?'#ffffff':'#cfe8ff'; ctx.fillRect(Math.round(e.x+8+Math.cos(a)*r),Math.round(e.y+6+bob+Math.sin(a)*r*.6),1,1); } // copos que la rodean
  cpStun(e); };
ENEMY_FX.gust=(e,dx,dy,d)=>{ if((tick&7)===0) parts.push({k:'flake',x:e.x+8+(Math.random()-.5)*10,y:e.y+10,vx:(Math.random()-.5)*.3,vy:.2,life:40,max:40,col:'#ffffff',nog:true,r:(tick&16)?1:0});
  if(d<40&&(tick&3)===0){ const a=Math.random()*6.283, r=10+Math.random()*6; parts.push({k:'mote',x:e.x+8+Math.cos(a)*r,y:e.y+8+Math.sin(a)*r,vx:-Math.cos(a)*1.2,vy:-Math.sin(a)*1.2,life:10,max:10,sway:0,col:'#e8f6ff',nog:true}); } };
ENEMY_DEATH.gust=e=>{ const x=e.x+8, y=e.y+7; for(let i=0;i<10;i++){ const a=i/10*6.283; parts.push({k:'flake',x:x+Math.cos(a)*3,y:y+Math.sin(a)*3,vx:Math.cos(a)*1.3,vy:Math.sin(a)*1.3-.3,life:36,max:36,col:i&1?'#ffffff':'#cfe8ff',nog:true,r:i&1}); }
  cpBurst(x,y,['#ffffff','#a8d8f0'],6,1,{k:'mote',life:20,nog:true}); parts.push({x,y,vx:0,vy:0,life:12,col:'#e8f6ff',ring:true,r:14,nog:true});
  if(AC) swish(.3,.05,2400,900,1200); };

/* ---------- EL CARÁMBANO: un racimo de tres carámbanos que cuelga de un pegote de nieve (16×16, contorno negro).
   Colgado: un brillo le baja y en la punta se forman gotas que caen y salpican. Al notarte tiembla, la grieta crece en dos
   tiempos y gotea deprisa. Al caer, el pegote se queda arriba y solo cae el hielo, con estela; contra el suelo se hace añicos,
   con una onda de escarcha y trocitos que se derriten; el pegote se deshace en nieve. ---------- */
const ICE_T=['#ffffff','#e4f2ff','#a8d0f0','#6a90c0','#3c5a8a']; // canto, cara clara, media, sombra, fondo
const ICE_SPIKES=[[8.5,3,6.4,12.5],[4.6,3,3.4,6.5],[12.2,3,3.6,8.5]]; // [centro x, arriba, ancho, largo]
function iceBodyArt(crack){ const c=mkCanvas(16,16), g=c.getContext('2d');
  for(const [cx,top,w,L] of ICE_SPIKES) for(let y=0;y<L;y++){ const hw=w/2*(1-y/L); if(hw<.35) continue; const x0=Math.round(cx-hw), x1=Math.round(cx+hw)-1;
    for(let x=x0;x<=Math.max(x0,x1);x++){ const u=x1>x0?(x-x0)/(x1-x0):.5; g.fillStyle=u<.18?ICE_T[0]:u<.45?ICE_T[1]:u<.78?ICE_T[2]:ICE_T[3]; g.fillRect(x,Math.round(top+y),1,1); } }
  g.fillStyle=ICE_T[0]; g.fillRect(7,5,1,3); g.fillRect(8,9,1,2); g.fillStyle=ICE_T[3]; g.fillRect(10,5,1,2); // facetas: brillo y hendidura
  if(crack>=1){ g.fillStyle=ICE_T[4]; g.fillRect(8,4,1,2); g.fillRect(9,6,1,1); g.fillRect(8,7,1,1); }
  if(crack>=2){ g.fillStyle=ICE_T[4]; g.fillRect(9,8,1,2); g.fillRect(7,9,1,1); g.fillRect(4,5,1,1); g.fillRect(12,6,1,2); }
  artOutline(g,16,16); return c; }
const ICE_BODY=[iceBodyArt(0),iceBodyArt(1),iceBodyArt(2)];
const ICE_CAP=(()=>{ const c=mkCanvas(16,16), g=c.getContext('2d'); // el pegote de nieve del que cuelga
  blobArt(g,0,0,16,16,[{x:4.4,y:2.8,r:3,ry:2},{x:12.4,y:2.9,r:2.8,ry:1.9},{x:8.4,y:2.3,r:3.8,ry:2.3}],['#7a92b8','#b0c6e2','#dceaf8','#f4faff','#ffffff'],{grad:.3,dither:.5});
  return c; })();
const ICE_W={}; function iceWhite(img){ return ICE_W[ICE_BODY.indexOf(img)]||(ICE_W[ICE_BODY.indexOf(img)]=tintTo(img,'#ffffff')); }
function icicleShatter(x,y,ground){ cpBurst(x,y,['#ffffff','#e4f2ff','#a8d0f0','#6a90c0'],14,2,{life:16});
  for(let i=0;i<5;i++) parts.push({k:'flake',x:x-6+i*3,y,vx:(i-2)*.5,vy:-.9,life:30,max:30,col:'#ffffff',nog:true,r:i&1});
  if(ground) for(let i=0;i<6;i++) parts.push({k:'dust',x:x-7+i*2.8+Math.random(),y:y+2+(i&1),vx:0,vy:0,life:90+i*6,max:96,r:1,col:i&1?'#e4f2ff':'#a8d0f0',nog:true}); // trocitos que se derriten
  parts.push({x,y,vx:0,vy:0,life:14,col:'#e4f2ff',ring:true,r:14,nog:true}); shake=Math.max(shake,2);
  if(AC){ const t=audio().currentTime; beep('square',1900,2700,.05,.025,t); beep('triangle',2400,1600,.09,.02,t+.03); noise(.08,.04,true,t,5200); } }
ENEMY_DRAW.icicle=e=>{ const x=Math.round(e.x), y=Math.round(e.y), x0=Math.round(e.x0!==undefined?e.x0:e.x), y0=Math.round(e.y0!==undefined?e.y0:e.y);
  const crack=e.st==='shake'?(e.st2>10?1:2):e.st==='fall'?2:0, body=ICE_BODY[crack], src=e.flash>4?iceWhite(body):body;
  if(e.st==='fall'){ const k=Math.min(1,(e.y-y0)/40); ctx.globalAlpha=1-k; ctx.drawImage(ICE_CAP,x0,y0); ctx.globalAlpha=1;
    ctx.fillStyle='rgba(232,246,255,.75)'; for(const [ox,L] of [[5,5],[8,9],[12,6]]) ctx.fillRect(x+ox,y-L+2,1,L); } // el pegote se queda; el hielo cae con estela
  else ctx.drawImage(ICE_CAP,x,y);
  if(e.st==='fall'||e.st==='shake') drawShadow(x+8,Math.min(y+16+Math.round(e.st==='fall'?0:0),y0+64),3);
  ctx.drawImage(src,x,y);
  if(e.st==='hang'){ const g=(tick+(e.x|0)*7)%100; if(g<12){ ctx.fillStyle='#ffffff'; ctx.fillRect(x+6+(g>>3),y+4+g,1,1); ctx.fillRect(x+7+(g>>3),y+5+g,1,1); } // el brillo que baja
    const dp=(tick+(e.x|0)*13)%70; if(dp>40){ const r=dp>60?2:1; ctx.fillStyle=PAL.k; ctx.fillRect(x+8,y+15,1,r+1); ctx.fillStyle='#a8d8f8'; ctx.fillRect(x+8,y+15,1,r); } } // la gota que se forma
  cpStun(e); };
ENEMY_FX.icicle=(e,dx,dy,d)=>{ const p=cpPrev(e); if(e.y0===undefined&&e.st==='hang') e.y0=e.y;
  if(e.st==='hang'&&((tick+(e.x|0)*13)%70)===69) parts.push({k:'shard',x:e.x+8.5,y:e.y+16,vx:0,vy:.9,life:12,max:12,col:'#a8d8f8'}); // cae la gota…
  if(e.st==='shake'){ if((tick&1)===0) parts.push({k:'shard',x:e.x+6+Math.random()*5,y:e.y+13,vx:0,vy:.8,life:12,max:12,col:'#a8d0f0'}); if((tick&7)===0) parts.push({k:'mote',x:e.x+4+Math.random()*9,y:e.y+3,vx:0,vy:.2,life:14,max:14,sway:0,col:'#ffffff',nog:true}); }
  if(p==='hang'&&e.st==='shake'&&AC) beep('square',700,1100,.05,.02);
  if(p==='shake'&&e.st==='fall'){ cpBurst(e.x+8,e.y+3,['#ffffff','#dceaf8'],6,.9,{life:12}); if(AC) beep('square',900,1500,.06,.025); }
  if(e.st==='fall'&&e.despawn){ icicleShatter(e.x+8,e.y+12,true); const y0=e.y0!==undefined?e.y0:e.y; cpBurst(e.x+8,y0+3,['#ffffff','#dceaf8','#b0c6e2'],6,.6,{life:18}); } }; // se estrella; el pegote se deshace en nieve
ENEMY_DEATH.icicle=e=>{ icicleShatter(e.x+8,e.y+8,false); cpBurst(e.x+8,e.y+3,['#ffffff','#dceaf8'],5,.6,{life:16}); };

/* ---------- EL SETÓN: respira y parpadea; se hincha poco a poco temblando, escupe con retroceso y una nube de esporas ---------- */
const SETON_BLINK=spr(["................","......kkkk......","....kkHHRRkk....","...kHHwwRRRRk...","..kHwwwRRRwwRk..","..kRwwRRRRwwRk..",".kRRRRRRwwRRRrk.",".krRRwwRRRRRrrk.",".kkrrrrrrrrrrkk.","...kssssssssk...","...kssssssssk...","...kskksskkSk...","...kscsmmscSk...","...kSsssssSSk...","....kkkkkkkk....","................"],SETON_FX);
ENEMY_DRAW.seton=e=>{ drawShadow(e.x+8,e.y+15,5);
  let img=SETON, ox=0, oy=0; const a=(e.t+(e.x|0))%100;
  if(e.st==='puff'){ img=e.pt<18?SETON_B:SETON; const k=1-e.pt/30; ox=e.pt<10?((tick&2)?1:-1):((tick&4)&&k>.3?1:0); }
  else { oy=((e.t>>4)&1)?1:0; if(a<4) img=SETON_BLINK; }
  cpDraw(img,e.x+ox,e.y+oy,false,e); cpStun(e); };
ENEMY_FX.seton=(e,dx,dy,d)=>{ const p=cpPrev(e);
  if(e.st==='puff'&&e.pt===17){ e.squash=.25; if(AC) beep('triangle',200,320,.12,.03); }
  if(e.st==='puff'&&e.pt<12&&(tick&3)===0) parts.push({k:'mote',x:e.x+4+Math.random()*8,y:e.y+2,vx:(Math.random()-.5)*.4,vy:-.3,life:18,max:18,sway:Math.random()*6,col:'#ffb0a0',nog:true});
  if(p==='puff'&&e.st==='idle'){ e.squash=.5; for(let i=0;i<6;i++){ const a=i/6*6.283; parts.push({k:'smoke',x:e.x+8+Math.cos(a)*4,y:e.y+6+Math.sin(a)*3,vx:Math.cos(a)*.6,vy:Math.sin(a)*.4-.2,life:18,max:18,r:2,col:i&1?'#f8c8c0':'#f0a0a0',nog:true}); } } };
ENEMY_DEATH.seton=e=>{ const x=e.x+8, y=e.y+7;
  for(let i=0;i<7;i++){ const a=i/7*6.283; parts.push({k:'smoke',x:x+Math.cos(a)*4,y:y+Math.sin(a)*3,vx:Math.cos(a)*.7,vy:Math.sin(a)*.5-.3,life:22,max:22,r:2+(i%2),col:i&1?'#f8c8c0':'#f0a0a0',nog:true}); }
  cpBurst(x,y-3,['#e84040','#fff8e8','#a82030'],10,1.8,{life:16}); cpBurst(x,y+3,['#f06060','#a82838'],6,1,{k:'mote',life:26,nog:true});
  parts.push({x,y,vx:0,vy:0,life:12,col:'#ffffff',ring:true,r:12,nog:true}); if(AC) noise(.12,.04,true,undefined,1600); };

/* ---------- EL CANGREJO: corretea de lado levantando arena; antes de correr se agacha y chasca las pinzas ---------- */
const CRAB_BLINK=recolor(CRAB,{'#ffffff':'#1a1410'});
const CRAB_SNAP=spr(["................","..kkk......kkk..",".kHHHk....kHHHk.","kHOOOkk..kkOOOHk",".kOOkkqkkqkkOOk.","..kOk.k..k.kOk..","..kOk.O..O.kOk..","...kkkkkkkkkkk..","..kHHoooooooOOk.",".kHoooooooooooOk",".koooyoooyooooOk",".kOoooooooooOOOk","..kOOOOOOOOOOOk.",".k.kk.k..k.kk.k.","k.k..k....k..k.k","................"],CRAB_FX);
ENEMY_DRAW.crab=e=>{ drawShadow(e.x+8,e.y+15,5); const crouch=e.t%90<12;
  let img, oy=0; if(crouch){ img=((e.t>>1)&1)?CRAB_SNAP:CRAB_B; oy=1; } else { img=((tick>>2)&1)?CRAB_B:CRAB; if(((e.t+(e.x|0))%70)<3) img=CRAB_BLINK; }
  cpDraw(img,e.x,e.y+oy,e.dir>0,e); cpStun(e); };
ENEMY_FX.crab=(e,dx,dy,d)=>{ const crouch=e.t%90<12;
  if(!crouch&&(tick&5)===0) parts.push({k:'dust',x:e.x+8-e.dir*5,y:e.y+15,vx:-e.dir*.4,vy:-.08,life:12,max:12,r:1,col:'#ecdcaa',nog:true});
  if(crouch&&(e.t&3)===1&&AC&&d<80) beep('square',1300,900,.025,.018); };
ENEMY_DEATH.crab=e=>{ const x=e.x+8, y=e.y+9; cpBurst(x,y,['#f07040','#b83820','#ffb080'],12,1.7); cpDust(x,e.y+15,'#ecdcaa',6);
  parts.push({x,y,vx:0,vy:0,life:12,col:'#ffffff',ring:true,r:12,nog:true}); if(AC) beep('square',900,200,.12,.03); };
