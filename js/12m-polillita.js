'use strict';
/* ============================================================
   DESPUÉS DEL FINAL (docs/TERCERA-PASADA.md §7.6, fase G): LA POLILLITA Y LO QUE EL OLVIDO SE LLEVÓ
   · La polillita (el Olvido, ya pequeño) vive en la hoja de Sprout: se posa, sacude las alas, da vueltas
     alrededor de su cabeza y, si enciendes el farol, va a la luz, como todas.
   · Tras la cima, el Olvido dejó capullos de seda gris 'Ꝫ' escondidos por el valle, con cosas dentro que los
     vecinos echan de menos sin saber qué (en el capítulo 5 olvidaron justo eso). El farol no sirve: ardería lo de
     dentro. Después del final, la polillita los huele: vuela hasta el capullo, se lo come a mordiscos y lo de
     dentro sale dando un salto. Hay que devolvérselo a su dueño:
       la regadera de Petra (el Claro del Primer Brote), las semillas de Lupa (el Camino de los Dientes de León),
       el cebo de Moss (la Orilla del Este) y la libreta de Tilo (la Playa de la Hoja).
     Lupa planta sus flores en la plaza; Moss te da su sopa gratis; Petra y Tilo, bayas.
   · Con las cuatro devueltas, Raíz lo nota: la polillita ya no es gris. Es una polilla de luz.
   ============================================================ */
const LOST={
  regadera:{key:'2,0',x:8,y:1,owner:'h',who:'PETRA',name:'LA REGADERA DE PETRA',berries:20},
  semillas:{key:'1,2',x:8,y:6,owner:'j',who:'LUPA',name:'LAS SEMILLAS DE LUPA',berries:15},
  cebo:    {key:'4,1',x:4,y:6,owner:'y',who:'MOSS',name:'EL CEBO DE MOSS',berries:0},
  libreta: {key:'0,2',x:1,y:1,owner:'g',who:'TILO',name:'LA LIBRETA DE TILO',berries:30},
};
SOLID.add('Ꝫ');
function lostAt(key,x,y){ for(const id in LOST){ const L=LOST[id]; if(L.key===key&&L.x===x&&L.y===y) return id; } return null; }
function cocoonLive(id){ return boss3Done&&!opened.has('LZ'+id); }     // tras la cima, el Olvido los dejó ahí; hasta que se los coma la polillita
function lostFound(id){ return collected.has('lz:'+id); }
function lostBack(id){ return opened.has('LZB'+id); }
function lostCount(){ let n=0; for(const id in LOST) if(lostBack(id)) n++; return n; }
function pliGold(){ return opened.has('PLIgold'); }
const LUPA_FLOWERS=[[1,6],[2,7],[8,5],[9,6],[0,4],[9,3],[1,2],[8,2]]; // las flores que Lupa planta en la plaza

/* ---------- los objetos ---------- */
const LOST_SPR={
  regadera:mkTile(g=>{ blobArt(g,2,5,10,9,[{x:5,y:4.5,r:4.6,ry:4.2}],['#2a3a4a','#4a6a88','#7a9ab8','#a8c4dc','#dceaf6'],{grad:.5}); // una regadera de lata
    for(let i=0;i<5;i++){ PX(g,11+i,8-i,PAL.k); PX(g,11+i,9-i,'#7a9ab8'); } R(g,14,2,3,2,PAL.k); PX(g,15,3,'#a8c4dc'); for(let x=4;x<11;x++) PX(g,x,3,PAL.k); PX(g,4,4,PAL.k); PX(g,10,4,PAL.k);
    PX(g,15,5,'#8ad0f8'); PX(g,15,7,'#8ad0f8'); PX(g,6,7,'#ffffff'); },16,16),
  semillas:mkTile(g=>{ R(g,3,2,10,13,PAL.k); R(g,4,3,8,11,'#f0e0b0'); R(g,4,3,8,2,'#d8c090'); for(let x=4;x<12;x+=2) PX(g,x,3,'#b89a60'); // un sobrecito de semillas con una flor pintada
    R(g,7,6,2,5,'#58a840'); PX(g,6,8,'#78c850'); PX(g,9,9,'#78c850'); for(const [x,y] of [[7,5],[8,5],[6,6],[9,6],[7,7],[8,7]]) PX(g,x,y,'#f8a0d0'); PX(g,7,6,'#f8d030'); PX(g,8,6,'#f8d030'); PX(g,5,12,'#8a6038'); PX(g,10,12,'#8a6038'); },16,16),
  cebo:mkTile(g=>{ blobArt(g,4,2,8,11,[{x:4,y:5.5,r:3.6,ry:5}],['#3a1010','#a02828','#e04848','#f07070','#ffb0b0'],{grad:.5}); // el cebo: rojo y blanco, con su pluma
    for(let y=8;y<13;y++) for(let x=4;x<12;x++){ if(Math.hypot((x+.5-8)/3.6,(y+.5-7.5)/5)<=1) PX(g,x,y,y>11?'#b8b8c0':'#f0f0f4'); } R(g,4,7,8,1,PAL.k);
    PX(g,8,13,PAL.k); PX(g,8,14,'#8a8a90'); PX(g,9,15,'#8a8a90'); PX(g,10,14,'#8a8a90'); for(const [x,y,c] of [[8,1,'#40a0d0'],[9,0,'#60c0f0'],[7,0,'#f8d030']]) PX(g,x,y,c); },16,16),
  libreta:mkTile(g=>{ R(g,2,3,11,12,PAL.k); R(g,3,4,9,10,'#a05030'); R(g,3,4,2,10,'#7a3a20'); R(g,6,6,5,1,'#f0d8a8'); R(g,6,8,4,1,'#f0d8a8'); R(g,6,10,5,1,'#f0d8a8'); // la libreta de precios, con su lápiz
    for(let i=0;i<9;i++){ PX(g,6+i,14-i,i<7?'#f8d030':'#f0c8a0'); PX(g,7+i,14-i,i<7?'#c89820':'#3a2a1a'); } PX(g,5,15,'#f8a0a0'); },16,16),
};
function cocoonArt(k){ return cached('capullo'+k,g=>{ // el capullo del Olvido: seda gris enrollada, con hilos al suelo
  shadowBlob(g,8,14,5,1.4,.28); const h=Math.max(3,Math.round(11*k)), w=Math.max(2,Math.round(5*k));
  for(let y=0;y<16;y++) for(let x=0;x<16;x++){ const d=Math.hypot((x+.5-8)/w,(y+.5-(14-h))/h); if(d>1) continue; const band=((y+(x>>1))>>1)&1;
    PX(g,x,y,d>.86?OLV.ink:band?OLV.dust:OLV.wingL); }
  if(k>.6){ for(const [x0,y0,x1] of [[4,14,1],[12,14,15],[6,4,3],[10,5,13]]) for(let i=0;i<=Math.abs(x1-x0);i++) PX(g,x0+Math.sign(x1-x0)*i,y0+(y0<9?-i*.5:i*.2)|0,'#c8c0d0'); } // hilos
  PX(g,7,14-h+3,'#ffffff'); PX(g,6,14-h+5,'#e8e0f0'); }); }
{ const O0=drawObject; drawObject=function(g,rows,x,y,ch,opts,f,fg){ if(ch!=='Ꝫ') return O0(g,rows,x,y,ch,opts,f,fg);
  const id=lostAt(opts.sx+','+opts.sy,x,y); if(id&&cocoonLive(id)) g.drawImage(cocoonArt(1),x*16,y*16); }; }

/* ---------- al entrar: los capullos que ya no están, lo que salió de ellos y las flores de Lupa ---------- */
let lostDrop=null, pliEat=null;
{ const I0=initRoomRules; initRoomRules=function(){ I0(); lostDrop=null; pliEat=null; const key=sx+','+sy;
  for(let y=0;y<SH;y++) for(let x=0;x<SW;x++){ if(grid[y][x]!=='Ꝫ') continue; const id=lostAt(key,x,y);
    if(!id||!cocoonLive(id)){ grid[y][x]=groundUnder(grid,x,y,{floor:regionFloor()}); if(id&&opened.has('LZ'+id)&&!lostFound(id)) lostDrop={id,x:x*16,y:y*16-2,t:99}; } } // se lo comió y no lo recogiste: ahí sigue
  if(key==='1,1'&&lostBack('semillas')) for(const [x,y] of LUPA_FLOWERS) if(grid[y][x]==='.') grid[y][x]='f';
  if(pli){ pli.x=player.x+9; pli.y=player.y+1; pli.mode='perch'; pli.t=0; } }; }

/* ============================================================
   LA POLILLITA
   ============================================================ */
let pli=null;
function pliOn(){ return cycled&&(typeof c5Fin==='undefined'||!c5Fin); }
function pliPerch(){ return [player.x+10,player.y-jumpZ+1]; }
function pliFly(tx,ty,sp){ const P=pli, dx=tx-P.x, dy=ty-P.y, d=Math.hypot(dx,dy); if(d<.5){ P.x=tx; P.y=ty; return true; } const v=Math.min(d,sp); P.x+=dx/d*v; P.y+=dy/d*v; P.dir=dx<0?-1:1; return d<2; }
function updPli(){ if(!pliOn()){ pli=null; return; } if(!pli) pli={x:player.x+10,y:player.y+1,mode:'perch',t:0,wait:240,dir:1,flap:0};
  const P=pli, [hx,hy]=pliPerch(); P.t++; P.flap+=P.mode==='perch'?.08:.45;
  if(state!=='play'){ if(P.mode==='perch'){ P.x=hx; P.y=hy; } return; }
  // un capullo cerca: allá va
  if(!pliEat&&P.mode!=='eat'&&P.mode!=='go'){ for(let y=0;y<SH;y++) for(let x=0;x<SW;x++){ if(grid[y][x]!=='Ꝫ') continue; const id=lostAt(sx+','+sy,x,y); if(!id||!cocoonLive(id)) continue;
      if(Math.hypot(x*16+8-(player.x+8),y*16+8-(player.y+10))<44){ P.mode='go'; P.t=0; P.cell=[x,y,id]; if(AC) beep('triangle',f(84),f(91),.12,.02); } } }
  // una llama nueva del farol: a la luz
  if(P.mode!=='go'&&P.mode!=='eat'&&flares.length&&flares[flares.length-1].t>=17){ const F=flares[flares.length-1]; P.mode='lamp'; P.t=0; P.lamp=[F.x,F.y-4]; }
  if(P.mode==='perch'){ P.x=hx; P.y=hy; if(P.t>P.wait){ P.mode='loop'; P.t=0; P.wait=260+Math.random()*320; } }
  else if(P.mode==='loop'){ const a=P.t*.09; pliFly(hx+Math.sin(a)*12,hy-8+Math.sin(a*2)*5,1.6); if(P.t>90){ P.mode='back'; P.t=0; } }
  else if(P.mode==='lamp'){ const a=P.t*.2; pliFly(P.lamp[0]+Math.cos(a)*7,P.lamp[1]+Math.sin(a)*4,2.2); if(P.t>100){ P.mode='back'; P.t=0; } }
  else if(P.mode==='back'){ if(pliFly(hx,hy,2.2)){ P.mode='perch'; P.t=0; } }
  else if(P.mode==='go'){ const [x,y]=P.cell; if(pliFly(x*16+8,y*16+4,1.8)){ P.mode='eat'; P.t=0; const id=P.cell[2]; grid[y][x]=groundUnder(grid,x,y,{floor:regionFloor()}); markDirty(); pliEat={x,y,id,t:0}; } }
  else if(P.mode==='eat'){ const E=pliEat; if(!E){ P.mode='back'; return; } E.t++; P.x=E.x*16+8+Math.sin(E.t*.5)*3; P.y=E.y*16+4+Math.abs(Math.sin(E.t*.3))*2;
    if((E.t&7)===0){ if(AC) noise(.04,.03,true,undefined,3600); for(let i=0;i<3;i++) parts.push({k:'dust',x:E.x*16+8+(Math.random()-.5)*10,y:E.y*16+6+Math.random()*6,vx:(Math.random()-.5)*.8,vy:-.3-Math.random()*.4,life:20,max:20,r:1,col:i&1?OLV.dust:OLV.wingL,nog:true}); } // a mordiscos
    if(E.t>=90){ opened.add('LZ'+E.id); save(); lostDrop={id:E.id,x:E.x*16,y:E.y*16-2,t:0}; pliEat=null; P.mode='back'; P.t=0; shake=Math.max(shake,2);
      puff(E.x*16+8,E.y*16+8,OLV.wingL,10,1.2); if(AC){ beep('triangle',f(79),f(86),.2,.03); beep('triangle',f(86),f(91),.2,.025,AC.currentTime+.1); } } }
  // lo que salió del capullo: da un salto y espera en el suelo
  const D=lostDrop; if(D){ D.t++; if(D.t===22){ SFX.land(); puff(D.x+8,D.y+14,'#e8e0f0',5,.8); }
    if(D.t>12&&Math.hypot(D.x+8-(player.x+8),D.y+8-(player.y+10))<12){ const id=D.id; lostDrop=null; collected.add('lz:'+id); save(); giveThing(LOST_SPR[id],LOST[id].name,PLI_T.found[id]); } } }
{ const U0=updRoomRules; updRoomRules=function(){ U0(); updPli(); }; }
/* el dibujo: una polilla de siete píxeles, gris lila (dorada cuando ya lo ha devuelto todo) */
function drawPli(){ const P=pli; if(!P) return; const x=Math.round(P.x), y=Math.round(P.y), up=P.mode==='perch'?(Math.sin(P.flap)>.9?1:0):(Math.sin(P.flap)>0?1:0), gold=pliGold();
  const W=gold?['#fff6d0','#f8d878','#c89838']:[OLV.wingL,OLV.dust,OLV.dustD], ink=gold?'#6a4a18':OLV.ink;
  if(gold||P.mode!=='perch') glowAt(x,y,gold?9:6,gold?'rgba(255,220,140,.35)':'rgba(232,224,240,.25)');
  ctx.fillStyle=ink; ctx.fillRect(x,y-1,1,3);                                                          // el cuerpo
  for(const s of [-1,1]){ ctx.fillStyle=W[1]; ctx.fillRect(x+s*(up?1:2)-(s<0?(up?1:1):0),y-(up?3:1),up?1:2,up?3:2); ctx.fillStyle=W[0]; ctx.fillRect(x+s*(up?2:3)-(s<0?0:0),y-(up?2:1),1,up?1:2);
    ctx.fillStyle=W[2]; ctx.fillRect(x+s,y+1,1,1); }
  ctx.fillStyle=ink; ctx.fillRect(x-1,y-2,1,1); ctx.fillRect(x+1,y-2,1,1);                               // antenas
  if(gold&&(tick&15)===0) parts.push({k:'mote',x,y,vx:0,vy:.2,life:30,max:30,sway:Math.random()*6,col:'#fff0b0',nog:true}); }
addEventListener('DOMContentLoaded',()=>{ const D0=drawPlayer; drawPlayer=function(){ D0(); if(pli&&!playerHidden&&state!=='fall'&&state!=='dying') drawPli(); }; });
/* el capullo que se come (ya fuera del fondo) y lo que sale de él */
{ const D0=drawScorches; drawScorches=function(){ D0(); const E=pliEat; if(E){ const k=Math.max(.15,1-E.t/90); ctx.drawImage(cocoonArt(Math.round(k*10)/10),E.x*16+Math.round(Math.sin(E.t*.9)*(1-k)),E.y*16); }
  for(let y=0;y<SH;y++) for(let x=0;x<SW;x++) if(grid[y][x]==='Ꝫ'&&(tick&63)===((x*11+y*7)&63)) parts.push({k:'mote',x:x*16+5+Math.random()*6,y:y*16+4,vx:0,vy:-.2,life:40,max:40,sway:Math.random()*6,col:OLV.dust,nog:true}); // late
  const D=lostDrop; if(D){ const hop=D.t<22?Math.round(Math.sin(D.t/22*Math.PI)*14):Math.round(Math.abs(Math.sin(tick*.08))*2); drawShadow(D.x+8,D.y+16,5); // salta del capullo y se queda botando
    ctx.drawImage(LOST_SPR[D.id],Math.round(D.x),Math.round(D.y)-hop); if((tick&15)===0) sparkle(D.x+4+Math.random()*8,D.y+2-hop,'#ffffff'); } }; }

/* ============================================================
   DEVOLVERLO: Z frente a su dueño (Tilo, en su mostrador)
   ============================================================ */
function lostFor(ch){ const owner=ch==='ñ'&&sx===8?'g':ch; for(const id in LOST) if(LOST[id].owner===owner&&lostFound(id)&&!lostBack(id)) return id; return null; }
function lostReturn(id){ const L=LOST[id]; opened.add('LZB'+id); save(); SFX.blip();
  say(PLI_T.back[id],()=>{ SFX.fanfare(); if(L.berries){ berries=Math.min(999,berries+L.berries); hudBerryT=14; showToast('+'+L.berries+' BAYAS',{PETRA:'los ahorros de Petra',LUPA:'para el abono, dice Lupa',TILO:'de la caja de Tilo'}[L.who]||''); }
    if(id==='semillas'){ for(const [x,y] of LUPA_FLOWERS) if(grid[y][x]==='.'){ grid[y][x]='f'; for(let i=0;i<5;i++) parts.push({k:'petal',x:x*16+8,y:y*16+8,vx:(Math.random()-.5)*1.2,vy:-.8-Math.random()*.6,life:40,max:40,sway:Math.random()*6,col:['#f8a0d0','#fffbe8','#f04848','#f8d030'][i&3],nog:true}); }
      markDirty(); shake=Math.max(shake,2); say(valleySeason()===3?PLI_T.lupaSnow:PLI_T.lupaAfter,null,'LUPA'); }
    if(id==='cebo') showToast('LA SOPA DE MOSS','ahora, gratis');
    showToast('COSAS OLVIDADAS',lostCount()+'/4'); },L.who); }
{ const I0=interact; interact=function(ft){ const [tx,ty,ch]=ft;
  if(ch==='Ꝫ'){ SFX.blip(); say(pliOn()?PLI_T.cocoonPli:PLI_T.cocoon); return true; }
  if(cycled){ const id=lostFor(ch); if(id){ lostReturn(id); return true; } }
  if(ch==='y'&&lostBack('cebo')&&player.hp<player.maxHp){ SFX.blip(); player.hp=player.maxHp; SFX.heart(); save(); say(PLI_T.soup,null,'MOSS'); return true; } // la sopa, gratis
  return I0(ft); }; }
/* Raíz la reconoce (tras los tocones) y, con todo devuelto, la ve dorada */
{ const E0=elderTalk; elderTalk=function(){ if(!cycled||(typeof cierzoCount==='function'&&cierzoCount()>=4&&!opened.has('CZread'))){ E0(); return; }
  if(lostCount()>=4&&!pliGold()){ opened.add('PLIgold'); save(); SFX.blip(); say(PLI_T.raizAll,()=>{ screenFlash(8,'#fff6d0'); if(pli) for(let i=0;i<24;i++){ const a=i/24*6.283; parts.push({k:'mote',x:pli.x,y:pli.y,vx:Math.cos(a)*1.2,vy:Math.sin(a)*1.2,life:40,max:40,sway:0,col:'#fff0b0',nog:true}); } if(AC) SFX.fanfare(); },'RAÍZ'); return; }
  if(opened.has('TOCin')&&!opened.has('PLIin')){ opened.add('PLIin'); save(); SFX.blip(); say(PLI_T.raiz,null,'RAÍZ'); return; }
  E0(); }; }
addEventListener('DOMContentLoaded',()=>{ const Q0=questList; questList=function(){ const q=Q0(); if(!cycled||!(opened.has('PLIin')||Object.keys(LOST).some(lostFound))) return q;
  const TO={regadera:'La regadera, a PETRA',semillas:'Las semillas, a LUPA',cebo:'El cebo, a MOSS',libreta:'La libreta, a TILO'};
  for(const id in LOST) if(lostFound(id)&&!lostBack(id)) q.push({id:'lz'+id,txt:TO[id],done:false,side:true});
  q.push({id:'olvidadas',txt:'Cosas olvidadas '+lostCount()+'/4',done:lostCount()>=4,side:true}); return q; }; });
