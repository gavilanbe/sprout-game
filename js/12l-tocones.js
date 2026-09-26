'use strict';
/* ============================================================
   DESPUÉS DEL FINAL (docs/TERCERA-PASADA.md §7.6, fase G): LOS TOCONES DEL VALLE Y LAS CARTAS DE CIERZO
   · Cuatro pantallas del valle tienen un tocón viejo 'Ꝙ', hermano pequeño del Roble. Tras el final, en ellas el
     ANILLO DEL AÑO hace girar la estación, igual que en los Anillos del Roble (12i generaliza sus reglas a
     seasonRoomAt). La pantalla se queda en la que le des; hasta entonces sigue la del valle, y mientras estás
     dentro no cambia sola (el hielo no se funde bajo tus pies porque el año del valle gire).
   · Cada tocón guarda un secreto de su estación y, en él, una carta que Cierzo escribió ya con su nombre:
     - el Lago de las Runas (3,2), INVIERNO: el lago se hiela y se resbala hasta chocar; tres piedras 'Ꝥ' asoman
       del agua. Un islote con un cofre en medio: seis resbalones, pasando por la isla del corazón (comprobado con
       scratchpad/puz/tocones.py; sin invierno no se llega, ni con gancho ni con salto).
     - el Juncal del Norte (3,0), VERANO: los capullos de nenúfar se abren y hacen camino hasta el cofre de la roca;
       en invierno se hielan y lo tapan (comprobado).
     - el Bosque de los Ecos (1,0), OTOÑO: los setos 'Ꝛ' se quedan en los huesos ('ꝛ') y se pasa entre las ramas.
     - los Riscos del Silencio (0,0), PRIMAVERA: la enredadera seca del risco 'Ꝟ' florece ('ꝟ') y Sprout trepa:
       arriba, el valle entero en una panorámica, y un nido con la carta.
   · Con las cuatro, Raíz las lee en voz alta en la plaza... nieva un momento y se oye a Cierzo desde el cielo.
   · Y lo que el final arregla: el eco del Viento ya se llama Cierzo, y la runa del Eco sabe de dónde salen.
   ============================================================ */
const STUMPS={'3,2':{},'3,0':{},'1,0':{},'0,0':{}};
['Ꝙ','Ꝥ','Ꝛ','Ꝝ','Ꝟ','ꝟ'].forEach(c=>SOLID.add(c)); GROUND.add('ꝛ'); // Ꝙ tocón · Ꝥ piedra en el agua · Ꝛ seto (ꝛ en otoño, pelado; Ꝝ en invierno, helado) · Ꝟ enredadera del risco (ꝟ en flor)
function stumpAt(nx,ny){ return cycled&&!!STUMPS[nx+','+ny]; }
function stumpHere(){ return stumpAt(sx,sy); }
{ const T0=seasonTile; seasonTile=function(c,s){ if(c==='Ꝛ') return s===2?'ꝛ':s===3?'Ꝝ':'Ꝛ'; if(c==='Ꝟ') return s===0?'ꝟ':'Ꝟ'; return T0(c,s); }; }
SEASON_BASE.add('Ꝛ'); SEASON_BASE.add('Ꝟ');

/* ---------- la estación de una pantalla con tocón ---------- */
let stumpLatch=null;   // la del valle al entrar: mientras estás en la pantalla, no gira sola
{ const L0=loadScreen; loadScreen=function(nx,ny){ const k=nx+','+ny; stumpLatch=cycled&&STUMPS[k]?{key:k,s:Math.max(0,valleySeason())}:null; return L0(nx,ny); }; }
{ const R0=roomSeason; roomSeason=function(key){ if(cycled&&STUMPS[key]){ for(let s=0;s<4;s++) if(opened.has('SE'+key+':'+s)) return s;
    return stumpLatch&&stumpLatch.key===key?stumpLatch.s:Math.max(0,valleySeason()); } return R0(key); }; }
{ const B0=screenBiome; screenBiome=function(nx,ny){ if(stumpAt(nx,ny)) return seasonBio(roomSeason(nx+','+ny)); return B0(nx,ny); }; }
/* lo que cae del cielo (13: weather) también es de la estación del tocón */
addEventListener('DOMContentLoaded',()=>{ const W0=weather; weather=function(){ if(!stumpHere()){ W0(); return; } const f0=SEASON_FORCE; SEASON_FORCE=roomSeason(sx+','+sy); try{ W0(); } finally{ SEASON_FORCE=f0; } }; });
/* el hielo del lago acaba en el borde de la pantalla: se choca con él (en el valle de al lado el agua no está helada) */
{ const B0=iceBlocked; iceBlocked=function(tx,ty){ if(stumpHere()&&(tx<0||ty<0||tx>=SW||ty>=SH)) return true; return B0(tx,ty); }; }
addEventListener('DOMContentLoaded',()=>{ if(typeof X_DESC==='object') Object.defineProperty(X_DESC,'anillo',{configurable:true,enumerable:true,
  get:()=>cycled?'Junto a un tocón viejo del valle: hace girar la estación de la pantalla.':'Dentro del Roble: hace girar la estación de la sala.'}); });

/* ---------- lo que se pinta ---------- */
const hexA=(h,a)=>'rgba('+parseInt(h.slice(1,3),16)+','+parseInt(h.slice(3,5),16)+','+parseInt(h.slice(5,7),16)+','+a+')';
function stumpTile(on){ return cached('tocon'+(on?1:0),g=>{ // un roble cortado hace mucho: raíces, corteza con musgo y el corte con sus anillos
  shadowBlob(g,8,14,7,1.6,.32);
  const own=[]; for(let y=0;y<16;y++){ own.push([]); for(let x=0;x<16;x++){ const top=Math.hypot((x+.5-8)/5.8,(y+.5-6)/2.8)<=1, body=y>=6&&y<=13&&x>=3-(y>=12?1:0)&&x<=12+(y>=12?1:0);
      const root=(y===13&&(x===1||x===14))||(y===12&&(x===2||x===13)); own[y].push(top?2:(body||root)?1:0); } }
  const at=(x,y)=>x<0||y<0||x>15||y>15?0:own[y][x];
  for(let y=0;y<16;y++) for(let x=0;x<16;x++){ const o=own[y][x]; if(!o) continue;
    if(o===1){ let c='#6a4424'; if(x===3||(y>=12&&x===2)) c='#8a5a30'; else if(x===12||(y>=12&&x===13)) c='#3a2410'; else if(x===5||x===8||x===11) c=(y+x)%3?'#4a2c14':'#5a3a1c';
      if(y===6||y===7) c=shade(c,-.15); PX(g,x,y,c); continue; }
    const d=Math.hypot((x+.5-8)/5.8,(y+.5-6)/2.8); PX(g,x,y,d>.82?'#a07040':d>.62?'#d8b078':d>.44?'#b89058':d>.26?'#d0a870':'#8a6038'); }
  for(let y=0;y<16;y++) for(let x=0;x<16;x++) if(!own[y][x]&&(at(x+1,y)||at(x-1,y)||at(x,y+1)||at(x,y-1))) PX(g,x,y,PAL.k);
  for(const [x,y,c] of [[3,9,'#5a8a3a'],[4,10,'#78a848'],[3,11,'#5a8a3a'],[4,12,'#3e7a2e'],[11,12,'#5a8a3a']]) PX(g,x,y,c); // musgo
  PX(g,10,5,'#fff0c8'); PX(g,6,5,'#e8c890');
  if(on) [[3,6],[8,4],[13,6],[8,8]].forEach(([x,y],i)=>PX(g,x,y,SEASON_TINT[i])); }); } // tras el final, las cuatro estaciones marcadas en el corte
function waterRockArt(snow){ return cached('wrock'+(snow?1:0),g=>{ // una piedra que asoma del agua (o del hielo)
  if(!snow) for(const [x,y] of [[2,12],[3,13],[5,14],[10,14],[12,13],[13,12],[1,11],[14,11]]) PX(g,x,y,'#e8f6ff'); // la espuma alrededor
  blobArt(g,2,3,12,11,[{x:6,y:6,r:5,ry:4.4},{x:8.5,y:5,r:4,ry:3.6}],ROCK_PAL,{dither:.6,grad:.5});
  if(!snow){ R(g,3,12,10,1,'#3a5a88'); R(g,4,13,8,1,'#5a88c0'); } else { R(g,4,4,6,1,'#ffffff'); R(g,3,5,8,1,'#e8f0f8'); R(g,5,3,3,1,'#ffffff'); }
  PX(g,6,6,ROCK_PAL[4]); PX(g,7,5,ROCK_PAL[4]); }); }
function hedgeTile(kind,bio,v){ const B=BIOMES[bio]||BIOMES.valley; return cached('seto'+kind+bio+v,g=>{ // 0 con hoja (no se pasa) · 1 en los huesos (se pasa) · 2 helado
  if(kind===0){ shadowBlob(g,8,14,7,1.6,.3); blobArt(g,0,1,16,14,[{x:3.5,y:7,r:4},{x:8,y:6,r:4.6},{x:12.5,y:7,r:4},{x:5,y:10,r:4.4},{x:11,y:10,r:4.4}],B.bushL,{grad:.45});
    for(const [x,y] of [[4,13],[8,14],[12,13]]){ PX(g,x,y,'#4a2c14'); PX(g,x,y-1,'#6a4424'); }                                  // las ramas, por debajo
    if(bio!=='snow'&&bio!=='wilt') for(const [x,y] of [[5,5],[11,8],[7,10]]) PX(g,x,y,(v?B.flowers[1]:B.bushL[4])); return; }
  const tw=kind===2?['#5a4a3e','#8a7868']:['#6a3a1e','#946030'];
  for(let i=0;i<5;i++){ const x0=1+i*3+(v&1); for(let y=kind===2?3:6;y<15;y++){ const x=x0+(((y>>1)+i)&1); PX(g,x,y,tw[(y+i)&1]); } }   // varas finas
  for(const [a,b,y] of [[1,14,kind===2?7:9],[2,13,12]]) for(let x=a;x<=b;x++) if((x+y)%3) PX(g,x,y+((x>>2)&1),tw[0]);             // y cruzadas
  if(kind===1) for(const [x,y,c] of [[3,14,'#e8a040'],[9,15,'#c86c24'],[12,13,'#eaa040'],[6,11,'#fcd878']]) PX(g,x,y,c);           // las últimas hojas, en el suelo
  if(kind===2){ for(let i=0;i<5;i++){ const x=1+i*3+(v&1); R(g,x-1,2+(i&1),3,1,'#ffffff'); PX(g,x,3+(i&1),'#dff0ff'); } R(g,0,7,16,1,'#e8f0f8'); PX(g,6,8,'#bfe6fa'); PX(g,6,9,'#dff0ff'); } }); }
function vineArt(spring,v,f){ return cached('trepa'+(spring?1:0)+v+(spring?f&1:0),g=>{ // la enredadera por la cara del risco: tres tallos que suben, hojas y (en primavera) flores
  const st=spring?['#1e4a26','#2e6a2a','#3e8a34']:['#3a2814','#5a3e24','#7a5a38'], lf=spring?['#2e7a30','#58b048','#a0e070']:['#4a3420','#6a5238','#9a7a50'];
  const stem=(x0,ph,amp)=>{ for(let y=0;y<16;y++){ const x=x0+Math.round(Math.sin(y*.5+ph)*amp); PX(g,x-1,y,st[0]); PX(g,x,y,st[1]); if(y&1) PX(g,x+1,y,st[2]); } };
  stem(4,v,1.4); stem(8,v+2,2); stem(12,v+4,1.2);
  for(let y=1;y<16;y+=2){ for(const [x0,ph,amp] of [[4,v,1.4],[8,v+2,2],[12,v+4,1.2]]){ const x=x0+Math.round(Math.sin(y*.5+ph)*amp), s=((y>>1)+x0)&1?1:-1, w=spring&&((y+f+x0)&4)?1:0;
      if(!spring&&((y*3+x0)%5===0)) continue; PX(g,x+s*2,y-w,lf[1]); PX(g,x+s*2,y+1-w,lf[0]); PX(g,x+s*3,y-w,lf[2]); if(!spring) PX(g,x+s*3,y+1,'#2a1a0c'); } }  // hojas (secas, rizadas y pocas)
  if(spring) for(const [x,y,c] of [[3,2,'#f8a0d0'],[10,5,'#fffbe8'],[6,9,'#f8a0d0'],[13,11,'#fffbe8'],[9,14,'#f8c0e0'],[2,13,'#fffbe8']]){ // flores
    PX(g,x,y,c); PX(g,x+1,y,c); PX(g,x,y+1,c); PX(g,x+1,y+1,shade(c,-.15)); PX(g,x,y-1,'#ffffff'); PX(g,x+1,y+1,'#f8d030'); } }); }
{ const G0=drawGround; drawGround=function(g,rows,x,y,ch,opts,f){ const px=x*16, py=y*16;
  if(ch==='Ꝥ'){ const ice=[[0,-1],[1,0],[0,1],[-1,0]].some(([dx,dy])=>rows[y+dy]&&rows[y+dy][x+dx]==='i');
    if(ice){ const e=edgesOf(rows,x,y,c=>c!=='i'&&c!=='Ꝥ'&&c!=='Ꞧ'); g.drawImage(pondIceTile(e&15,(x*7+y*3)&3),px,py); } else G0(g,rows,x,y,'W',opts,f); return; }
  if(ch==='ꝛ'){ G0(g,rows,x,y,'.',opts,f); g.drawImage(hedgeTile(1,opts.bio,(x+y)&1),px,py); return; }
  if((ch==='Ꞥ'||ch==='Ꞧ')&&!seasonRoomAt(opts.sx,opts.sy)){ G0(g,rows,x,y,'W',opts,f); g.drawImage(ringTileArt('Ꞥ',opts.bio),px,py); return; } // antes del final, un capullo cerrado en el agua del valle
  return G0(g,rows,x,y,ch,opts,f); }; }
{ const O0=drawObject; drawObject=function(g,rows,x,y,ch,opts,f,fg){ const px=x*16, py=y*16;
  if(ch==='Ꝙ'){ g.drawImage(stumpTile(cycled),px,py); return; }
  if(ch==='Ꝥ'){ g.drawImage(waterRockArt(opts.bio==='snow'),px,py); return; }
  if(ch==='Ꝛ'){ g.drawImage(hedgeTile(0,opts.bio,(x*3+y)&1),px,py); return; }
  if(ch==='Ꝝ'){ g.drawImage(hedgeTile(2,opts.bio,(x+y)&1),px,py); return; }
  if(ch==='Ꝟ'||ch==='ꝟ'){ const e=edgesOf(rows,x,y,c=>!CLIFF_LIKE(c)); g.drawImage(cliffTile(e,hash(x*3+opts.sx*SW,y*7+opts.sy*SH)%3,opts.bio),px,py); g.drawImage(vineArt(ch==='ꝟ',x&3,f||0),px,py); return; }
  return O0(g,rows,x,y,ch,opts,f,fg); }; }
/* el tocón late con la estación que guarda (y más fuerte al girarla) */
{ const D0=drawScorches; drawScorches=function(){ D0(); if(!stumpHere()) return; const s=roomSeason(sx+','+sy), turn=ringTurn?Math.max(0,1-ringTurn.t/34):0;
  for(let y=0;y<SH;y++) for(let x=0;x<SW;x++){ if(grid[y][x]!=='Ꝙ') continue; const k=.5+.5*Math.sin(tick*.06+x);
    glowAt(x*16+8,y*16+6,9+k*2+turn*10,hexA(SEASON_TINT[s],(.18+.1*k+turn*.35).toFixed(2)));
    if((tick&31)===((x*7+y*5)&31)) parts.push({k:'mote',x:x*16+5+Math.random()*6,y:y*16+5,vx:0,vy:-.3,life:40,max:40,sway:Math.random()*6,col:SEASON_TINT[s],nog:true}); } }; }

/* ---------- las cartas de Cierzo ---------- */
CHESTS['3,2:8,5']={kind:'cierzo',n:0}; CHESTS['3,0:9,1']={kind:'cierzo',n:1}; CHESTS['1,0:8,1']={kind:'cierzo',n:2};
{ const O0=openChestContent; openChestContent=function(c){ if(c&&c.kind==='cierzo'){ cierzoLetter(c.n); return; } O0(c); }; }
function cierzoCount(){ let n=0; for(let i=0;i<4;i++) if(collected.has('ç'+i)) n++; return n; }
function cierzoLetter(n,cb){ collected.add('ç'+n); SFX.secret(); const k=cierzoCount();
  for(let i=0;i<16;i++) parts.push({k:'flake',x:player.x+8+(Math.random()-.5)*26,y:player.y-6-Math.random()*14,vx:(Math.random()-.5)*.5,vy:.25+Math.random()*.35,life:70,max:70,r:i&1,col:'#ffffff',nog:true}); // del sobre sale un poco de nieve
  showToast('CARTA DE CIERZO',k+'/4'); say(CIERZO_LETTERS[n].pages,cb||null,null,'letter'); save(); }
{ const L0=loreList; loreList=function(){ const L=L0(); for(let i=0;i<4;i++) if(collected.has('ç'+i)) L.push({id:'ç'+i,kind:'carta',title:'Carta de Cierzo · '+CIERZO_LETTERS[i].where,pages:CIERZO_LETTERS[i].pages}); return L; }; }
addEventListener('DOMContentLoaded',()=>{ const V0=drawValle; drawValle=function(){ V0(); const n=cierzoCount(); if(!cycled||!n) return; // en el zurrón, junto a las cartas del Viento
    ctx.drawImage(FLAKE_SPR,0,0,16,16,122,73,9,9); txt(n+'/4',133,73); };
  const Q0=questList; questList=function(){ const q=Q0(); if(cycled&&(opened.has('TOCin')||cierzoCount()>0)) q.push({id:'cierzo',txt:'Cartas de Cierzo '+cierzoCount()+'/4',done:opened.has('CZread'),side:true}); return q; }; });

/* ---------- el tocón, la enredadera: Z ---------- */
{ const I0=interact; interact=function(ft){ const [tx,ty,ch]=ft;
  if(ch==='Ꝙ'){ SFX.blip(); say(cycled?TOC_T.stumpOn.concat(['(Ahora guarda el '+SEASON_NAME[roomSeason(sx+','+sy)].toLowerCase()+'.)']):TOC_T.stump); return true; }
  if(ch==='Ꝟ'){ SFX.blip(); say(TOC_T.vineDry); return true; }
  if(ch==='ꝟ'){ startTrepa(tx,ty); return true; }
  return I0(ft); }; }

/* ============================================================
   LA TREPA: por la enredadera en flor hasta lo alto del risco. Una panorámica del valle entero (cada pantalla con
   su estación, el Roble en la plaza) y, la primera vez, el nido con la cuarta carta. Luego, abajo, de un resbalón.
   ============================================================ */
let trepa=null, trepaPano=null;
const TREPA_UP=54, TREPA_FADE=18, TREPA_VIEW=330, TREPA_DOWN=30;
function startTrepa(tx,ty){ trepa={t:0,ph:'up',x0:player.x,y0:player.y,tx,ty,first:!collected.has('ç3'),asked:false,foes:enemies}; enemies=[]; state='trepa'; playerHidden=true; player.dir=1; player.atk=0; // los bichos esperan abajo
  player.x=tx*16; if(AC){ noise(.2,.03,true,undefined,2600); beep('triangle',f(67),f(72),.18,.03); } trepaPano=null; trepaBuild=null; }
/* la panorámica se pinta a trozos mientras Sprout trepa (una pantalla por fotograma: sin tirones) */
let trepaBuild=null;
function trepaPanoStep(){ if(trepaPano) return true; if(!trepaBuild) trepaBuild={c:mkCanvas(800,384),i:0}; const B=trepaBuild, g=B.c.getContext('2d');
  if(B.i<15){ const x=B.i%5, y=(B.i/5)|0, key=x+','+y; B.i++; if(MAPS[key]){ const s=scScreen(key,screenBiome(x,y),'.',0); if(s) g.drawImage(s,x*160,y*128); } return false; }
  const c0=ctx; ctx=g; try{ if(typeof roblePaint==='function'&&typeof ROBLE_ART==='object') roblePaint(ROBLE_ART[robleLook()]||ROBLE_ART.base,160+ROBLE_X,128+ROBLE_Y,0,0); } finally{ ctx=c0; } // el Roble, en su plaza
  trepaPano=B.c; trepaBuild=null; return true; }
function trepaPanorama(){ while(!trepaPanoStep()); return trepaPano; }
function updTrepa(){ const T=trepa; if(!T){ state='play'; playerHidden=false; return; } T.t++; updParts(); if(T.ph==='up'||T.ph==='fade') trepaPanoStep();
  if(T.ph==='up'){ const k=CA_EASE.io(Math.min(1,T.t/TREPA_UP)); player.y=T.y0+(-30-T.y0)*k;
    if((T.t&3)===0) parts.push({k:'blade',x:T.tx*16+4+Math.random()*8,y:Math.max(2,player.y+10),vx:(Math.random()-.5)*.6,vy:.6,life:28,max:28,col:Math.random()<.6?'#58b048':'#f8a0d0',rot:Math.random()*6,vr:.2});
    if((T.t&7)===0&&AC) noise(.06,.025,true,undefined,3400);
    if(T.t>=TREPA_UP){ T.ph='fade'; T.t=0; } return; }
  if(T.ph==='fade'){ if(T.t>=TREPA_FADE){ T.ph='view'; T.t=0; trepaPanorama(); if(AC) olvNana(5,.022); } return; }
  if(T.ph==='view'){ if(keys.fire&&T.t>30){ keys.fire=false; T.t=Math.max(T.t,TREPA_VIEW-20); }
    if(T.t===TREPA_VIEW){ if(T.first&&!T.asked){ T.asked=true; say(TOC_T.nest,()=>cierzoLetter(3,()=>{ trepa.ph='down'; trepa.t=0; state='trepa'; })); return; }
      if(!T.first){ T.ph='down'; T.t=0; } }
    return; }
  if(T.ph==='down'){ const k=CA_EASE.in(Math.min(1,T.t/TREPA_DOWN)); player.y=-30+(T.y0+30)*k;
    if((T.t&3)===0) parts.push({k:'blade',x:T.tx*16+4+Math.random()*8,y:Math.max(2,player.y+12),vx:(Math.random()-.5)*.8,vy:.3,life:24,max:24,col:'#58b048',rot:Math.random()*6,vr:.3});
    if(T.t>=TREPA_DOWN){ player.y=T.y0; player.x=T.x0; enemies=T.foes||[]; trepa=null; trepaPano=null; state='play'; playerHidden=false; player.squash=-.4; shake=Math.max(shake,2); SFX.land(); stepDust(); stepDust(); } } }
{ const D0=drawScorches; drawScorches=function(){ D0(); drawTrepa(); }; }
function drawTrepa(){ const T=trepa; if(!T) return; const px=Math.round(player.x), py=Math.round(player.y);
  if(T.ph==='up'||T.ph==='down'||T.ph==='fade'){ const fr=T.ph==='fade'?0:((T.t>>2)&1)?1:3; if(py>-20) ctx.drawImage(P_SPRITES[1][fr],px,py); } // de espaldas, trepando
  if(T.ph==='fade'||T.ph==='view'||(T.ph==='down'&&T.t<10)){ const a=T.ph==='fade'?T.t/TREPA_FADE:T.ph==='down'?1-T.t/10:1; ctx.fillStyle='rgba(8,12,10,'+Math.min(1,a).toFixed(2)+')'; ctx.fillRect(0,0,160,128); }
  if(T.ph!=='view') return;
  const P=trepaPanorama(), [vx,vy]=trepaCam(T.t), a=Math.min(1,T.t/16);
  ctx.save(); ctx.globalAlpha=a; ctx.drawImage(P,Math.round(vx),Math.round(vy),160,128,0,0,160,128); ctx.restore();                                      // el valle, volando: de los riscos a la plaza y al lago
  ctx.fillStyle='rgba(255,246,216,'+(.06+.04*Math.sin(tick*.05)).toFixed(2)+')'; ctx.fillRect(0,0,160,128);                                              // la luz de arriba
  for(let i=0;i<3;i++){ const y=18+i*40+Math.sin(tick*.02+i)*4; ctx.fillStyle='rgba(255,255,255,.18)'; ctx.fillRect(((tick*(0.3+i*.1)+i*70)%220)-40,y,34,2); ctx.fillRect(((tick*(0.3+i*.1)+i*70)%220)-30,y+2,20,1); } // nubes que pasan
  const tw=textW('EL VALLE, DESDE EL RISCO',FONT_M), bw=tw+12, bx=80-(bw>>1), by=5, u=Math.min(1,T.t/20), yy=by-Math.round((1-CA_EASE.out(u))*16); // el cartel baja
  ctx.fillStyle=PAL.k; ctx.fillRect(bx-1,yy-1,bw+2,14); ctx.fillStyle='#f4e4b8'; ctx.fillRect(bx,yy,bw,12); ctx.fillStyle='#d8c090'; ctx.fillRect(bx,yy+11,bw,1); ctx.fillStyle='#fffbe8'; ctx.fillRect(bx,yy,bw,1);
  txt('EL VALLE, DESDE EL RISCO',80,yy+3,'#5a3a1c','center');
  if(T.first&&T.t>TREPA_VIEW-40){ const u=Math.min(1,(T.t-(TREPA_VIEW-40))/16), y=Math.round(132-easeOutBack(u)*40); ctx.drawImage(NEST_SPR,56,y); // el nido, con la carta asomando
    if((tick&7)===0) sparkle(62+Math.random()*36,y+4,'#ffffff'); } }
const NEST_SPR=(()=>{ const c=mkCanvas(48,30), g=c.getContext('2d'); // un nido de ramitas entre flores, y dentro un sobre del Viento
  R(g,17,2,16,12,PAL.k); R(g,18,3,14,10,'#f0f4ff'); R(g,18,3,14,1,'#ffffff'); for(let i=0;i<7;i++){ PX(g,18+i,4+(i>>1),'#a8c0d8'); PX(g,31-i,4+(i>>1),'#a8c0d8'); } R(g,24,8,2,2,'#d05050'); // el sobre, con su lacre
  for(let y=0;y<16;y++) for(let x=0;x<48;x++){ const d=Math.hypot((x+.5-24)/23,(y+.5-10)/9), hole=Math.hypot((x+.5-24)/17,(y+.5-6)/5)<1; if(d>1||hole&&y<9) continue;
    const band=((x*3+y*7)>>2)&3; PX(g,x,y+12,d>.9?PAL.k:band===0?'#6a4424':band===1?'#8a6038':band===2?'#b08850':'#5a3a1c'); }
  for(let i=0;i<9;i++){ const x=4+i*5, y=13+((i*7)&3); R(g,x,y,6,1,'#c89868'); PX(g,x+6,y+1,'#4a2c14'); }                                      // ramitas sueltas
  for(const [x,y,col] of [[3,14,'#f8a0d0'],[42,15,'#fffbe8'],[8,24,'#58b048'],[38,24,'#58b048'],[45,20,'#f8a0d0']]){ R(g,x,y,2,2,col); PX(g,x,y-1,'#ffffff'); }
  return c; })();
/* la cámara de la panorámica: sale de los riscos, cruza el bosque, baja a la plaza del Roble y acaba en el lago */
const TREPA_PATH=[[0,0],[240,10],[190,120],[360,200],[480,256]];
function trepaCam(t){ const k=CA_EASE.io(Math.min(1,t/(TREPA_VIEW-10)))*(TREPA_PATH.length-1), i=Math.min(TREPA_PATH.length-2,Math.floor(k)), u=k-i, P=TREPA_PATH;
  const a=P[Math.max(0,i-1)], b=P[i], c=P[i+1], d=P[Math.min(P.length-1,i+2)], cr=(p0,p1,p2,p3)=>.5*((2*p1)+(-p0+p2)*u+(2*p0-5*p1+4*p2-p3)*u*u+(-p0+3*p1-3*p2+p3)*u*u*u); // Catmull-Rom: una curva suave
  return [cr(a[0],b[0],c[0],d[0]),cr(a[1],b[1],c[1],d[1])]; }

/* ============================================================
   RAÍZ LEE LAS CARTAS: con las cuatro, en voz alta, en la plaza. Nieva un momento, suena la nana y Cierzo contesta
   desde el cielo. Luego, una bellota de la copa: +1 corazón.
   ============================================================ */
let czScene=null;
{ const E0=elderTalk; elderTalk=function(){ if(!cycled){ E0(); return; } const n=cierzoCount(), sayR=(p,cb)=>say(p,cb,'RAÍZ');
  if(n>=4&&!opened.has('CZread')){ SFX.blip(); sayR(TOC_T.raizRead,()=>{ czScene={t:0}; opened.add('CZread'); save(); }); return; }
  if(opened.has('RZpost')&&!opened.has('TOCin')){ opened.add('TOCin'); save(); SFX.blip(); sayR(TOC_T.raiz); return; }
  if(n>0&&n<4&&!opened.has('CZn'+n)){ opened.add('CZn'+n); save(); SFX.blip(); sayR(TOC_T.raizSome(n)); return; }
  if(opened.has('CZread')&&(tick&1)){ SFX.blip(); sayR(TOC_T.raizDone); return; }
  if(!opened.has('RZpost')){ opened.add('RZpost'); save(); } E0(); }; }
{ const U0=updRoomRules; updRoomRules=function(){ U0(); const C=czScene; if(!C) return; if(state==='dialog'||state==='itemget') return; C.t++;
  if(C.t<150){ for(let i=0;i<2;i++) parts.push({k:'flake',x:Math.random()*176-8,y:-4,vx:.5+Math.random()*.6,vy:.6+Math.random()*.5,life:170,max:170,r:(i+C.t)&1,col:'#ffffff',nog:true}); } // nieva sobre la plaza
  if(C.t===4){ if(AC){ olvNana(9,.034); noise(1.2,.02,true,undefined,1800); } screenFlash(6,'#e8f4ff'); }
  if(C.t===110){ shake=Math.max(shake,5); say(TOC_T.sky,()=>say(TOC_T.raizEnd,()=>{ czScene=null; player.maxHp+=2; player.hp=player.maxHp; giveThing(OAK_ACORN_SPR,'BELLOTA DEL ROBLE',TOC_T.heart); },'RAÍZ'),'CIERZO'); } }; }
const OAK_ACORN_SPR=(()=>{ const c=mkCanvas(16,16), g=c.getContext('2d'); // una bellota de la copa, roja de savia: el vigor del Roble
  blobArt(g,3,5,10,10,[{x:5,y:5.5,r:4.6,ry:4.8}],['#5a1018','#a02030','#d83848','#f06070','#ffb0b8'],{grad:.5});
  blobArt(g,2,2,12,6,[{x:6,y:3,r:6,ry:3}],['#3a2410','#5a3a1c','#7a5228','#a07040','#c89868'],{dither:.5});
  for(let x=3;x<13;x+=2) PX(g,x,5,'#3a2410'); g.fillStyle=PAL.k; g.fillRect(7,0,2,2); g.fillStyle='#6a4424'; g.fillRect(8,0,1,2); PX(g,6,9,'#ffffff'); PX(g,5,10,'#ffe0e4'); return c; })();

/* ---------- el Eco (12a), con su nombre ---------- */
Object.defineProperty(ECO_NAME,'viento',{configurable:true,enumerable:true,get:()=>cierzoSaid()?'ECO DE CIERZO':'ECO DEL VIENTO'});
Object.defineProperty(PLACE_NAMES,'4,12',{configurable:true,enumerable:true,get:()=>cierzoSaid()?'Eco de Cierzo':'Eco del Viento'});
