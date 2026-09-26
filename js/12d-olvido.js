'use strict';
/* ============================================================
   EL OLVIDO: su polvo, sus polillas y lo que se deja ver de él
   (docs/TERCERA-PASADA.md §3.1, §3.9 y §10). Hasta la cima, solo presagios:
   · Polillitas donde el valle está gris (y en el invierno raro del norte, en las marismas podridas y junto a
     la luz de las mazmorras). Van a la luz (antorchas, braseros, la llamarada del farol, las bombas, el farol en
     lo oscuro), huyen si corres cerca, el viento se las lleva y un tajo las deshace en polvo.
   · El polvo de los guardianes: cada golpe les sacude una bocanada gris; mientras les quede polvo se ven
     apagados; al rendirse se sacuden el último y recuperan el color (suena el principio de la nana: acordarse).
     Las mudas de los minijefes también sueltan polvo al golpearlas.
   · La muda de cada minijefe suelta una polilla que se va volando hacia el norte. La primera vez, con el mundo
     quieto (estado 'olvmoment'); las siguientes, sin pararlo.
   · La primera polilla que se posa en la hoja de Sprout (capítulo 0): «¡ACHÍS!».
   · Las alas con ocelos que asoman en un relámpago del título (15h) y la polilla que le susurra al Viento en el
     prólogo (15a).
   Vocabulario (§10): el gris lila y el violeta son solo del Olvido. Si algo es de ese color, es suyo.
   ============================================================ */
const OLV={ink:'#231d2c',body:'#5b516a',wing:'#978fa6',wingL:'#c6bfd2',wingD:'#6f6782',ocelo:'#2e2638',oceloL:'#e8e0f0',dust:'#b8aec8',dustD:'#8a8098'};
const OLV_PAL={k:OLV.ink,b:OLV.body,g:OLV.wing,G:OLV.wingL,d:OLV.wingD,o:OLV.ocelo,e:OLV.oceloL};
/* la polillita (7×6): alas abiertas, a medias y de canto */
const MOTH_S=[
  sprN(["k.....k",".k...k.","gGgbgGg","gggbggg",".dgbgd.","..d.d.."],OLV_PAL),
  sprN([".k...k.","..k.k..",".gGbGg.",".ggbgg.","..dbd..","...b..."],OLV_PAL),
  sprN(["..k.k..","...k...","..gbg..","..gbg..","..dbd..","...b..."],OLV_PAL)];
/* la polilla grande (13×10), con sus ocelos: la de las mudas y la que se posa en Sprout */
const MOTH_B=[
  sprN(["..k.......k..","...k.....k...",".dggg.b.gggd.","dgGeoGbGoeGgd","dgGoogbgooGgd","dggGggbggGggd",".ddgg.b.ggdd.","..dgg.b.ggd..","...dd.b.dd...","......b......"],OLV_PAL),
  sprN(["...k.....k...","....k...k....","...dggbggd...","..dGoGbGoGd..","..dggGbGggd..","...dggbggd...","....ddbdd....","......b......",".............","............."],OLV_PAL),
  sprN(["....k...k....",".....k.k.....",".....gbg.....",".....GbG.....",".....gbg.....",".....dbd.....","......b......",".............",".............","............."],OLV_PAL)];
const MOTH_FLAP=[0,1,2,1];
const OLV_FILTER=(()=>{ try{ const g=mkCanvas(1,1).getContext('2d'); return typeof g.filter==='string'; }catch(e){ return false; } })(); // sin filtros de lienzo (Safari viejo), los guardianes simplemente no se ven apagados
/* ---------- sonidos ---------- */
const OLV_SFX={
  flutter(v){ if(!AC) return; const t=AC.currentTime; noise(.035,.014*(v||1),true,t,3400); noise(.03,.01*(v||1),true,t+.05,2900); },
  puff(v){ if(!AC) return; noise(.14,.03*(v||1),false,undefined,700); },
  whisper(){ if(!AC) return; swish(.9,.03,2600,1100,520); },
  remember(){ if(!AC) return; const t=AC.currentTime; [76,79,76].forEach((m,i)=>beep('triangle',f(m),0,.42,.028,t+i*.19)); }, // mi sol mi: la nana empieza así
  sneeze(){ if(!AC) return; const t=AC.currentTime; beep('square',f(72),f(79),.16,.016,t); beep('square',f(74),f(81),.12,.014,t+.2); noise(.1,.05,true,t+.36,4200); beep('square',f(86),f(62),.12,.03,t+.36); },
  shake(){ if(!AC) return; const t=AC.currentTime; noise(.22,.04,true,t,1800); noise(.2,.03,false,t+.08,600); },
};
/* ---------- las polillitas ---------- */
let moths=[], mothNext=0, olvIdle=0, olvM=null;
function olvDark(){ const r=regionOf(sx,sy); return (r==='cueva'||r==='tronco'||r==='templo'||r==='gruta'||r==='secreto')&&!LIT_SCREENS.has(sx+','+sy); }
function olvAmbientTarget(){
  if(cycled) return 0; const r=regionOf(sx,sy), bio=screenBiome(sx,sy);
  if(r==='casa') return 0;
  if(bio==='wilt') return 3;                                                  // el valle gris: su polvo
  if(r==='norte'&&!boss3Done&&(sy<=-2||!thawed)) return sy<=-2?3:2;           // el invierno raro del norte
  if(r==='marisma'&&!summered) return 2;                                      // el otoño podrido
  if(dungeonOf(sx,sy)||r==='gruta'||r==='secreto'){ let lit=0; for(let y=0;y<SH;y++) for(let x=0;x<SW;x++) if(grid[y][x]===';') lit++;
    return Math.min(3,lit+(hasLantern&&olvDark()?1:0)); }                     // junto a la luz de las mazmorras
  return 0; }
function olvLights(){ const L=[];
  for(let y=0;y<SH;y++) for(let x=0;x<SW;x++) if(grid[y][x]===';') L.push([x*16+8,y*16+2]);
  for(const q of flares) L.push([q.x,q.y-4]); for(const q of burnFires) L.push([q.x*16+8,q.y*16+6]); for(const b of bombs) L.push([b.x+9,b.y+1]);
  if(hasLantern&&olvDark()) L.push([player.x+8,player.y-3]);
  return L; }
function olvSpawnMoth(){ const side=(Math.random()*4)|0, x=side===0?-6:side===1?166:12+Math.random()*136, y=side===2?-6:side===3?134:10+Math.random()*96;
  moths.push({x,y,vx:(80-x)*.004,vy:(60-y)*.004,t:0,ph:(Math.random()*16)|0,st:'wander',wx:20+Math.random()*120,wy:14+Math.random()*90,a:Math.random()*6.283}); }
function initOlvido(){ moths=[]; mothNext=tick+40; olvIdle=0;
  const n=olvAmbientTarget(); for(let i=0;i<Math.min(n,2);i++){ olvSpawnMoth(); const m=moths[moths.length-1]; m.x=16+Math.random()*128; m.y=12+Math.random()*80; } } // al llegar ya hay alguna, que la pantalla no empiece vacía
function olvPoof(x,y){ for(let i=0;i<7;i++){ const a=i/7*6.283, s=.4+Math.random()*.7; parts.push({k:'dust',x,y,vx:Math.cos(a)*s,vy:Math.sin(a)*s-.2,life:18,max:18,r:i%3?1:2,col:i&1?OLV.dust:OLV.dustD,nog:true}); }
  parts.push({k:'mote',x,y,vx:0,vy:-.25,life:40,max:40,sway:Math.random()*6,col:OLV.dust,nog:true}); OLV_SFX.puff(.5); }
function updMoth(m,L){ m.t++;
  if(m.st==='husk'){ updHuskMoth(m); return; }
  if(m.st!=='leave'&&meleeActive()&&rectsHit(meleeBox(),[m.x-3,m.y-3,7,6])){ olvPoof(m.x,m.y); m.dead=true; return; } // un tajo: polvo
  for(const w of windProjs) if(Math.hypot(w.x-m.x,w.y-m.y)<16){ m.vx+=w.vx*.3; m.vy+=w.vy*.3; m.st='flee'; m.ft=50; }       // el tornadito se la lleva
  if(typeof gusts!=='undefined') for(const g of gusts) if(Math.hypot(g.x-m.x,g.y-m.y)<14){ m.vx+=(g.vx||0)*.35; m.vy+=(g.vy||0)*.35; m.st='flee'; m.ft=50; }
  const dx=m.x-(player.x+8), dy=m.y-(player.y+4), d=Math.hypot(dx,dy)||1, moving=Math.abs(player.ivx)+Math.abs(player.ivy)>.7||player.atk>0||player.spin>0;
  if(m.st!=='leave'&&m.st!=='flee'&&d<24&&moving&&!(hasLantern&&olvDark())){ m.st='flee'; m.ft=40; m.vx+=dx/d*.7; m.vy+=dy/d*.7; if((tick&3)===0) OLV_SFX.flutter(.5); }
  let tx=null, ty=null;
  if(m.st==='flee'){ if(--m.ft<=0) m.st='wander'; }
  else if(m.st==='leave'){ tx=m.lx; ty=m.ly; }
  else { let best=null, bd=78; for(const q of L){ const dd=Math.hypot(q[0]-m.x,q[1]-m.y); if(dd<bd){ bd=dd; best=q; } }
    if(best){ m.st='orbit'; m.a+=.075+(m.ph%5)*.008; const r=6+(m.ph%4); tx=best[0]+Math.cos(m.a)*r; ty=best[1]+Math.sin(m.a*1.3)*4; }
    else { m.st='wander'; if(m.t%70===0||Math.hypot(m.wx-m.x,m.wy-m.y)<6){ m.wx=14+Math.random()*132; m.wy=10+Math.random()*92; } tx=m.wx; ty=m.wy; } }
  if(tx!==null){ const ax=tx-m.x, ay=ty-m.y, ad=Math.hypot(ax,ay)||1, acc=m.st==='orbit'?.1:m.st==='leave'?.06:.028; m.vx+=ax/ad*acc; m.vy+=ay/ad*acc; }
  m.vy+=Math.sin((tick+m.ph*9)*.35)*.05; m.vx+=(Math.random()-.5)*.04;                 // el aleteo: a saltitos
  const sp=Math.hypot(m.vx,m.vy), max=m.st==='flee'?1.6:m.st==='orbit'?.95:m.st==='leave'?1.1:.45; if(sp>max){ m.vx*=max/sp; m.vy*=max/sp; }
  m.vx*=.97; m.vy*=.97; m.x+=m.vx; m.y+=m.vy;
  if(m.st==='leave'&&(m.x<-10||m.x>170||m.y<-10||m.y>138)) m.dead=true;
  m.x=clamp(m.x,-14,174); m.y=clamp(m.y,-14,142);
  if((tick+m.ph*31)%150===0) parts.push({k:'mote',x:m.x,y:m.y+2,vx:0,vy:.2,life:34,max:34,sway:Math.random()*6,col:OLV.dust,nog:true}); } // se le cae el polvillo
function updMoths(){ const target=olvAmbientTarget(), L=olvLights();
  const free=moths.filter(m=>m.st!=='husk'&&m.st!=='leave');
  if(free.length>target){ const m=free[0]; m.st='leave'; m.lx=m.x<80?-20:180; m.ly=m.y-40; }            // su estación ha vuelto: se van
  else if(free.length<target&&tick>=mothNext){ olvSpawnMoth(); mothNext=tick+110+((Math.random()*120)|0); }
  for(const m of moths) updMoth(m,L); moths=moths.filter(m=>!m.dead); }
function drawMoths(){
  const out=!olvDark()&&regionOf(sx,sy)!=='casa';
  for(const m of moths){
    if(m.st==='husk'){ drawHuskMoth(m); continue; }
    const fast=m.st==='orbit'||m.st==='flee', fr=MOTH_FLAP[((tick+m.ph*3)>>(fast?1:2))&3], img=MOTH_S[fr], x=Math.round(m.x-3), y=Math.round(m.y-2);
    if(out){ ctx.fillStyle='rgba(18,26,14,.18)'; ctx.fillRect(x+2,y+11,3,1); }                          // su sombrita en el suelo
    ctx.drawImage(img,x,y); } }
/* ---------- el polvo de los guardianes (y de las mudas) ---------- */
function olvDustLevel(b){ if(!b||b.echo) return 0; if(b.cocoon&&!b.dustOff) return 1; // el capullo, todo polvo hasta que se abre
  if(b.dustOff) return (b.dust0||.4)*Math.max(0,1-(tick-b.dustAt)/40); // la sacudida va por el reloj: sigue aunque salga su diálogo
  return clamp((b.hp-2)/Math.max(1,(b.maxHp||8)-2),0,1); }
function olvDustFilter(b){ if(!OLV_FILTER) return null; const d=olvDustLevel(b); if(d<=.03) return null;
  return 'grayscale('+(d*.58).toFixed(2)+') sepia('+(d*.18).toFixed(2)+') brightness('+(1-d*.06).toFixed(2)+')'; }
function olvShakeJitter(b){ if(!b||!b.dustOff) return 0; const u=tick-b.dustAt; return u>=0&&u<40?(((u>>1)&1)?1:-1)*(u<16?2:1):0; }
function olvDustBurst(cx,cy,d,n){ const dx=cx-(player.x+8), dy=cy-(player.y+8), a0=Math.atan2(dy,dx);
  for(let i=0;i<n;i++){ const a=a0+(Math.random()-.5)*1.7, s=.6+Math.random()*1.5; parts.push({k:'dust',x:cx+(Math.random()-.5)*14,y:cy+(Math.random()-.5)*12,vx:Math.cos(a)*s,vy:Math.sin(a)*s-.3,life:22+((Math.random()*12)|0),max:34,r:1+(i%3===0?1:0),col:i&1?OLV.dust:OLV.dustD,nog:true}); }
  OLV_SFX.puff(.5+d*.5); }
function olvShakeOff(b){ b.dust0=Math.max(.35,olvDustLevel(b)); b.dustOff=true; b.dustAt=tick; shake=Math.max(shake,4); OLV_SFX.shake(); OLV_SFX.remember();
  const cx=b.x+(b.w||32)/2, cy=b.y+(b.h||32)/2;
  for(let i=0;i<28;i++) parts.push({k:'flake',x:cx+(Math.random()-.5)*36,y:cy-16+(Math.random()-.5)*22,vx:(Math.random()-.5)*.5,vy:.22+Math.random()*.4,life:70+((Math.random()*40)|0),max:110,r:i%3===0?1:0,col:i&1?OLV.dust:OLV.dustD,nog:true});
  for(let i=0;i<12;i++){ const a=Math.random()*6.283, s=1+Math.random()*1.6; parts.push({k:'dust',x:cx,y:cy,vx:Math.cos(a)*s,vy:Math.sin(a)*s-.5,life:26,max:26,r:2,col:i&1?OLV.dust:OLV.dustD,nog:true}); } }
function updBossDust(){
  const b=boss; if(b&&!b.echo){
    if(b.olvHp===undefined) b.olvHp=b.hp;
    if(b.hp<b.olvHp&&!b.dustOff){ const d=olvDustLevel(b); olvDustBurst(b.x+(b.w||32)/2,b.y+(b.h||32)/2,d,3+Math.round(d*9)); }
    b.olvHp=b.hp;
    if(!b.dustOff&&(b.st==='yield'||(b.type==='viento'&&b.hp<=2&&b.st==='rest'))) olvShakeOff(b);
    const d=olvDustLevel(b); if(d>.05&&!bossHidden&&(tick%Math.max(6,Math.round(26-d*16)))===0) parts.push({k:'mote',x:b.x+6+Math.random()*((b.w||32)-12),y:b.y+10+Math.random()*12,vx:0,vy:.22,life:44,max:44,sway:Math.random()*6,col:OLV.dust,nog:true}); } // mientras le quede, se le cae
  const m=midboss; if(m&&!m.dead){ if(m.olvHp===undefined) m.olvHp=m.hp; if(m.hp<m.olvHp) olvDustBurst(m.x+12,m.y+12,.6,6); m.olvHp=m.hp; } } // las mudas están hechas de polvo
/* ---------- la polilla de las mudas ---------- */
const HUSK_T={crawl:30,shake:62,look:74,fly:150};
function olvHuskMoth(x,y){ const first=!opened.has('OLV:husk'); opened.add('OLV:husk');
  const m={st:'husk',x,y,x0:x,y0:y,t:0,ph:0}; moths.push(m);
  if(first) olvMoment('husk',{m,dur:HUSK_T.fly+14}); }
function huskPath(m){ const t=m.t;
  if(t<HUSK_T.look) return [m.x0,m.y0-(t>=HUSK_T.crawl?2:0)];
  const k=CA_EASE.in(clamp((t-HUSK_T.look)/(HUSK_T.fly-HUSK_T.look),0,1)), side=m.x0<80?1:-1;
  return [m.x0+Math.sin(k*3.3)*26*side+k*side*18,m.y0-k*(m.y0+30)-Math.sin(k*9)*3]; } // sube hacia el norte en curva
function updHuskMoth(m){ const t=m.t;
  if(t===HUSK_T.crawl){ OLV_SFX.puff(.8); for(let i=0;i<8;i++) parts.push({k:'dust',x:m.x0+(Math.random()-.5)*8,y:m.y0+2,vx:(Math.random()-.5)*1.2,vy:-.4-Math.random()*.6,life:20,max:20,r:1+(i&1),col:i&1?OLV.dust:OLV.dustD,nog:true}); }
  if(t>HUSK_T.crawl&&t<HUSK_T.shake&&(t-HUSK_T.crawl)%8===0){ OLV_SFX.flutter(); for(let i=0;i<3;i++) parts.push({k:'mote',x:m.x0+(Math.random()-.5)*10,y:m.y0-2,vx:(Math.random()-.5)*.4,vy:-.3,life:30,max:30,sway:Math.random()*6,col:OLV.dust,nog:true}); }
  if(t===HUSK_T.look+2) OLV_SFX.whisper();
  const [x,y]=huskPath(m); m.x=x; m.y=y;
  if(t>HUSK_T.look&&(t&1)===0) parts.push({k:'mote',x:m.x,y:m.y+3,vx:0,vy:.15,life:36,max:36,sway:Math.random()*6,col:OLV.dust,nog:true});
  if(t>=HUSK_T.fly||y<-20) m.dead=true; }
function drawHuskMoth(m){ const t=m.t;
  if(t<HUSK_T.crawl){ const tw=(t>10&&(t&3)<2)?1:0; ctx.fillStyle=OLV.dustD; ctx.fillRect(m.x0-5+tw,m.y0+2,11,2); ctx.fillStyle=OLV.dust; ctx.fillRect(m.x0-3,m.y0+1-tw,7,2); return; } // el montoncito de polvo tiembla
  let fr=2; if(t<HUSK_T.shake) fr=((t-HUSK_T.crawl)>>2)&1?0:2; else if(t<HUSK_T.look) fr=1; else fr=MOTH_FLAP[(t>>1)&3];
  const hop=t>=HUSK_T.shake&&t<HUSK_T.look?-Math.round(Math.sin((t-HUSK_T.shake)/12*Math.PI)*2):0;
  ctx.drawImage(MOTH_B[fr],Math.round(m.x-6),Math.round(m.y-5+hop)); }
/* ---------- los momentos del Olvido (microcinemáticas): el mundo se queda quieto ---------- */
function olvMoment(kind,o){ olvM=Object.assign({kind,t:0},o); state='olvmoment'; player.atk=player.spin=player.charge=0; player.ivx=player.ivy=0; keys.fire=keys.alt=false; toast=null; placeBanner=null; }
function updOlvMoment(){ const M=olvM; if(!M){ state='play'; return; } M.t++;
  if(M.kind==='husk'){ M.m.t++; updHuskMoth(M.m); }
  else if(M.kind==='land') updLandMoment(M);
  else if(M.kind==='frag') updFragMoment(M);
  updParts();
  if(keys.fire&&M.t>=24){ keys.fire=false; M.t=M.dur; if(M.m) M.m.dead=true; } // Z salta (como las presentaciones)
  keys.fire=keys.alt=false;
  if(M.t>=M.dur){ olvM=null; state='play'; moths=moths.filter(m=>!m.dead); if(M.after) M.after(); } }
function drawOlvMoment(){ const M=olvM; if(!M) return; const k=Math.min(1,M.t/10,(M.dur-M.t)/10);
  if(M.kind==='husk'){ if(M.m&&!M.m.dead&&M.m.t>=HUSK_T.crawl-4){ glowAt(M.m.x,M.m.y,20,'rgba(184,174,200,.2)'); drawHuskMoth(M.m); } presentBars(k,12); } // por encima de la oscuridad: que se vea en las mazmorras
  else if(M.kind==='land') drawLandMoment(M);
  else if(M.kind==='frag'){ drawFragMoment(M); return; }
  if(M.t>=24&&M.dur-M.t>20&&(tick&31)<22){ ctx.fillStyle='rgba(0,0,0,.72)'; ctx.fillRect(117,PLAY_H-11,43,11); txtS('Z: SALTAR',157,PLAY_H-8,'#e8e0d0','right'); } }
/* la primera polilla: se posa en la hoja de Sprout y... «¡ACHÍS!» */
const LAND_T={fly:48,sit:112,wind:124,sneeze:128,off:170,end:186};
function olvLandCheck(){
  if(opened.has('OLV:land')||state!=='play'||!elderMet||!hasBlade||won||inBed) return;
  if(window.__manual&&!window.__olvLand) return; // en las pruebas automáticas, solo cuando se pide (que no se cuele en otra comprobación)
  if(screenBiome(sx,sy)!=='wilt'||regionOf(sx,sy)!=='valle'||boss||midboss||pendingSay||dlg) return;
  const idle=!(keys.left||keys.right||keys.up||keys.down)&&player.atk===0&&player.charge===0&&jumpT===0; olvIdle=idle?olvIdle+1:0;
  if(olvIdle<80||enemies.some(e=>Math.hypot(e.x-player.x,e.y-player.y)<48)) return;
  opened.add('OLV:land'); save();
  const from=player.x<80?170:-10; olvMoment('land',{dur:LAND_T.end,fx:from,fy:player.y-26,x:from,y:player.y-26,after:()=>say(["(Una polilla gris. Se ha ido dejando un polvillo que huele a armario cerrado.)"])}); }
function landHead(){ return [player.x+8,player.y-1]; }
function updLandMoment(M){ const t=M.t, [hx,hy]=landHead();
  if(t<LAND_T.fly){ const k=CA_EASE.out(t/LAND_T.fly); M.x=lerp(M.fx,hx,k)+Math.sin(t*.4)*4*(1-k); M.y=lerp(M.fy,hy,k)-Math.sin(k*Math.PI)*10+Math.sin(t*.9)*2*(1-k); if((t&7)===0) OLV_SFX.flutter(.7); }
  else if(t<LAND_T.sneeze){ M.x=hx; M.y=hy; if(t===LAND_T.fly){ OLV_SFX.flutter(.4); player.squash=-.12; } if(t>=LAND_T.sit&&t<LAND_T.sneeze&&(t&1)) player.squash=-.2-(t-LAND_T.sit)*.012; } // coge aire...
  if(t===LAND_T.sneeze){ OLV_SFX.sneeze(); player.squash=.45; shake=3; flyText.push({x:player.x+8,y:player.y-8,txt:'¡ACHÍS!',t:34,col:'#fffbe8'});
    for(let i=0;i<14;i++){ const a=-Math.PI/2+(Math.random()-.5)*2.4, s=.6+Math.random()*1.6; parts.push({k:'dust',x:hx,y:hy,vx:Math.cos(a)*s,vy:Math.sin(a)*s,life:26,max:26,r:1+(i%3===0?1:0),col:i&1?OLV.dust:OLV.dustD,nog:true}); } }
  if(t>LAND_T.sneeze){ const u=t-LAND_T.sneeze; M.x=hx+Math.sin(u*.3)*u*.5+u*.9*(M.fx>80?1:-1); M.y=hy-u*1.4+Math.sin(u*.8)*3; if(u%9===0) OLV_SFX.flutter(.6); } // sale dando tumbos
  if(t===LAND_T.off) for(let i=0;i<6;i++) parts.push({k:'mote',x:hx+(Math.random()-.5)*12,y:hy-10,vx:(Math.random()-.5)*.2,vy:.18,life:60,max:60,sway:Math.random()*6,col:OLV.dust,nog:true});
  }
function drawLandMoment(M){ const t=M.t; let fr;
  if(t<LAND_T.fly) fr=MOTH_FLAP[(t>>1)&3]; else if(t<LAND_T.sneeze){ const u=(t-LAND_T.fly)%40; fr=u<3?1:u<5?2:u<7?1:0; } else fr=MOTH_FLAP[(t>>1)&3]; // posada, con las alas extendidas (así reposan las polillas) y algún escalofrío
  ctx.drawImage(MOTH_B[fr],Math.round(M.x-6),Math.round(M.y-7));
  if(t>=LAND_T.fly+14&&t<LAND_T.sit-8){ const pop=easeOutBack(Math.min(1,(t-LAND_T.fly-14)/8)); ctx.save(); ctx.translate(player.x+16,player.y-8); ctx.scale(pop,pop); speechBubble(-5,-12,'?'); ctx.restore(); } }
/* ---------- lo que toca en cada fotograma de juego ---------- */
function updOlvido(){ updMoths(); updBossDust(); olvLandCheck();
  if(regionOf(sx,sy)==='norte'&&sy<=-2&&!boss3Done&&(tick&7)===0) parts.push({k:'flake',x:Math.random()*160,y:-4,vx:(Math.random()-.5)*.3,vy:.5+Math.random()*.3,life:90,max:90,r:(tick&8)?1:0,col:(tick&16)?OLV.dust:OLV.dustD,nog:true}); } // allí arriba nieva gris
/* ---------- los presagios fuera del juego ---------- */
/* las alas con ocelos: una silueta que solo se ve un instante, a la luz de un relámpago (15h) */
let OLV_WINGS=null;
function olvWingsArt(col){ if(OLV_WINGS&&OLV_WINGS.col===col) return OLV_WINGS.c; const W=76, H=36, cx=38, cy=17, B=pxBuf(W,H);
  const ell=(x,y,ex,ey,rx,ry,rot)=>{ const c=Math.cos(rot), s=Math.sin(rot), dx=x-ex, dy=y-ey, u=(dx*c+dy*s)/rx, v=(-dx*s+dy*c)/ry; return u*u+v*v<=1; };
  for(let y=0;y<H;y++) for(let x=0;x<W;x++){ const px=x+.5, py=y+.5, sx2=Math.abs(px-cx);
    const fore=ell(cx+sx2,py,cx+18,cy-3,19,8.4,-.32), hind=ell(cx+sx2,py,cx+11,cy+7,12,6.6,.45), body=ell(px,py,cx,cy+1,2.3,9.5,0);
    const eye=(px-cx)*(px-cx)<1?false:Math.hypot(sx2-20,py-(cy-4))<3.5; // los ocelos: agujeros que parecen ojos
    if((fore||hind||body)&&!eye) B.set(x,y,col); }
  for(let i=0;i<9;i++){ for(const sd of [-1,1]){ const x=Math.round(cx+sd*(1+i*.9)), y=Math.round(cy-8-i*.85-Math.sin(i*.35)*1.5); B.set(x,y,col); } } // las antenas de pluma
  const c=B.canvas(); OLV_WINGS={col,c}; return c; }
function olvWingsSil(x,y,col){ ctx.drawImage(olvWingsArt(col),x,y); }
/* la polilla que le susurra al Viento al oído (plano de la tormenta del prólogo, 15a) */
function olvWhisper(wx,wy,t){ if(t<16||t>118) return; const k=Math.min(1,(t-16)/10,(118-t)/10), mx=wx-17+Math.sin(t*.21)*3, my=wy-15+Math.cos(t*.17)*2;
  ctx.globalAlpha=k; ctx.drawImage(MOTH_S[MOTH_FLAP[(t>>1)&3]],Math.round(mx-3),Math.round(my-2));
  for(let i=0;i<4;i++){ const u=((t*.035+i*.25)%1), x=lerp(mx+2,wx-6,u), y=lerp(my+1,wy-7,u)+Math.sin(u*6+i)*1.5; ctx.fillStyle=i&1?OLV.dust:OLV.dustD; ctx.fillRect(Math.round(x),Math.round(y),1,1); } // lo que le dice, en polvo gris
  ctx.globalAlpha=1; }
/* ============================================================
   EL NOMBRE DEL VIENTO: CIERZO (§3.3). Cada guardián, al sacudirse el polvo, recuerda un trozo de la nana que
   Cierzo cantaba cada invierno: el Topo «CIER», la Reina «Z», el Ciervo «O». Nada de esto se guarda aparte:
   se deriva de quién se ha rendido (como las misiones). En el zurrón, la página de la nana se va llenando.
   ============================================================ */
const NANA_FRAG={topo:'CIER',avispa:'Z',ciervo:'O'};
const NANA_NOTES=[[76,4],[79,4],[76,4],[74,4],[72,4],[74,4],[76,8],[72,4],[69,12]]; // mi sol mi · re do re · mi do · la: la nana de «casa» (06)
function nameFrag(also){ return (bossDone||also==='topo'?'CIER':'▒▒▒▒')+(boss2Done||also==='avispa'?'Z':'▒')+(boss4Done||also==='ciervo'?'O':'▒'); } // also: el que acaba de rendirse (aún no cuenta como vencido)
function nameKnown(){ return bossDone&&boss2Done&&boss4Done; }
function cierzoSaid(){ return boss3Done; } // quien lo dijo en voz alta fue Sprout, en la cima
function nanaNotesKnown(also){ return (bossDone||also==='topo'?3:0)+(boss2Done||also==='avispa'?3:0)+(boss4Done||also==='ciervo'?3:0); }
function olvNana(n,vol,when){ if(!AC) return; let t=when||AC.currentTime; const v=vol||.03;
  for(let i=0;i<Math.min(n,NANA_NOTES.length);i++){ const [m,d]=NANA_NOTES[i], dur=d*.075; beep('triangle',f(m),0,dur+.1,v,t); beep('p125',f(m+12),0,dur*.6,v*.22,t); t+=dur; } }
function nanaPages(){ const n=nameFrag();
  return ["LA NANA DEL VIENTO. La cantaba cada invierno, para que el Roble durmiera.",
    "«Duérmete, Roble, duérmete ya, suelta tus hojas, que el año se va.",
    "Cierra las yemas, no tengas frío: que baja el "+n+" y te arropará.»"]
    .concat(cierzoSaid()?["«Duérmete, Roble, no llores, no, que en primavera me marcho yo;","y cuando el año te vuelva a dormir, bajará el CIERZO a cantarte a ti.»"]
      :nameKnown()?["(Ya está entero. Solo falta decirlo en voz alta.)"]:["(Faltan letras. Algo se las ha comido.)"]); }
/* el momento del trozo: las letras salen del guardián como notas doradas, rodean a Sprout y se le guardan */
const GOLD_PAL=['#fffbe0','#f8d048','#a86808','#ffffff','#2a1804'];
function olvFragment(type,cb){ const txt=NANA_FRAG[type]; if(!txt){ if(cb) cb(); return; }
  const B=boss, x=B?B.x+(B.w||32)/2:player.x+8, y=B?B.y+2:player.y-24, n=txt.length, hold=14+n*12+18;
  olvMoment('frag',{type,txt,x,y,hold,dur:hold+n*8+34,notes:nanaNotesKnown(type),after:()=>{ showToast('LA NANA DEL VIENTO','que baja el '+nameFrag(type).replace(/▒/g,'_')); if(cb) cb(); }}); }
function fragLetterAt(M,i){ const n=M.txt.length, t=M.t, e0=14+i*12, f0=M.hold+i*8, sx0=M.x+(i-(n-1)/2)*16, sy0=M.y-20+Math.round(Math.sin((t+i*9)*.12)*2);
  if(t<e0) return null;
  if(t<f0){ const k=Math.min(1,(t-e0)/10), pop=t-e0>=5&&t-e0<7?-1:0; return {x:lerp(M.x,sx0,CA_EASE.out(k)),y:lerp(M.y,sy0,CA_EASE.out(k))+pop,big:t-e0>=5}; } // nace pequeña y, con un destello, crece a la tallada
  const k=Math.min(1,(t-f0)/14); if(k>=1) return null; const px=player.x+8, py=player.y+4;
  return {x:lerp(sx0,px,CA_EASE.in(k)),y:lerp(sy0,py,CA_EASE.in(k))-Math.sin(k*Math.PI)*10,big:k<.55}; } // y vuelve a la pequeña al entrar en Sprout: nada se escala
function updFragMoment(M){ const n=M.txt.length, t=M.t;
  for(let i=0;i<n;i++){ const e0=14+i*12, f0=M.hold+i*8;
    if(t===e0){ const m=NANA_NOTES[Math.min(NANA_NOTES.length-1,Math.max(0,M.notes-n+i))][0]; if(AC){ beep('triangle',f(m),0,.5,.034); beep('p125',f(m+12),0,.25,.008); } for(let q=0;q<6;q++) parts.push({k:'shard',x:M.x,y:M.y,vx:(Math.random()-.5)*1.6,vy:-.6-Math.random(),life:14,max:14,col:q&1?'#fff6c0':'#f8d048',nog:true}); }
    if(t===f0+14){ collectBurst(player.x+8,player.y+4,'#f8d048',i===n-1); if(AC) beep('square',f(84+i*2),0,.08,.02); } }
  if(t===M.hold+n*8+16){ olvNana(M.notes,.028); player.squash=.25; } } // y la nana, hasta donde se sabe
function drawFragMoment(M){ const n=M.txt.length, k=Math.min(1,M.t/10,(M.dur-M.t)/12);
  presentBars(k,10); glowAt(M.x,M.y-6,18+Math.sin(M.t*.2)*2,'rgba(255,230,140,'+(.18*k).toFixed(2)+')');
  for(let i=0;i<n;i++){ const L=fragLetterAt(M,i); if(!L) continue; const x=Math.round(L.x), y=Math.round(L.y);
    glowAt(x,y,L.big?10:6,'rgba(255,236,160,.22)');
    if(L.big){ const g=tlGlyph(M.txt[i],GOLD_PAL); ctx.drawImage(g,x-(g.width>>1),y-(g.height>>1)); proNote(x-2+(i&1?3:-3),y-16+Math.round(Math.sin((M.t+i*7)*.15)*2),'#f8d048'); } // su nota, encima
    else txtOL(M.txt[i],x,y-4,'#ffe070','center','#2a1804'); }
  if(M.t>=24&&M.dur-M.t>20&&(tick&31)<22){ ctx.fillStyle='rgba(0,0,0,.72)'; ctx.fillRect(117,PLAY_H-11,43,11); txtS('Z: SALTAR',157,PLAY_H-8,'#e8e0d0','right'); } }
/* ============================================================
   LA POLILLA DEL OLVIDO, ENTERA (la revelación de la cima y el final). Se genera a su tamaño (s=1: 64 px de
   envergadura) y con su aleteo (k: 1 abiertas … .2 de canto): nada se escala, se dibuja grande.
   Alas anteriores con banda oscura y un ocelo que parece un ojo; posteriores más claras; cuerpo peludo y
   segmentado; antenas de pluma. opt.sil='#color': toda de un color, con los ocelos huecos (en la tormenta).
   ============================================================ */
const BIGMOTH=new Map();
const BM_PAL={ink:'#1a1422',wD:'#4a4258',w:'#7a7290',wM:'#9a92ac',wL:'#c4bcd4',wLL:'#e6e0ee',band:'#5a5070',body:'#3a3248',bodyL:'#6a6078',fur:'#a49cb8',o1:'#140e1c',o2:'#b8aec8',o3:'#f4eef8'};
function bmInPoly(P,x,y){ let c=false; for(let i=0,j=P.length-1;i<P.length;j=i++){ const [xi,yi]=P[i],[xj,yj]=P[j]; if(((yi>y)!==(yj>y))&&(x<(xj-xi)*(y-yi)/(yj-yi)+xi)) c=!c; } return c; }
function bigMothArt(s,k,opt){ opt=opt||{}; const kk=Math.round(k*20)/20, key=s+'|'+kk+'|'+(opt.sil||''); let cached=BIGMOTH.get(key); if(cached) return cached;
  const W=Math.round(70*s)+4, H=Math.round(54*s)+4, cx=W/2, cy=Math.round(24*s)+2, B=pxBuf(W,H), P=BM_PAL, sil=opt.sil;
  const sc=(pts)=>pts.map(([x,y])=>[x*s*kk,y*s]);
  const FORE=sc([[2,-7],[12,-13],[24,-17],[31,-15],[34,-10],[31,-2],[25,4],[14,5],[3,3]]), HIND=sc([[2,1],[11,3],[20,6],[23,12],[18,19],[10,21],[4,15],[2,8]]);
  const OC=[19*s*kk,-5*s], OR=4.6*s*Math.max(.35,kk);                                           // el ocelo de cada ala anterior
  const own=new Int8Array(W*H); // 0 nada · 1 ala anterior · 2 posterior · 3 cuerpo · 4 ocelo (hueco en la silueta)
  for(let y=0;y<H;y++) for(let x=0;x<W;x++){ const px=Math.abs(x+.5-cx), py=y+.5-cy; let o=0;
    if(bmInPoly(HIND,px,py)) o=2; if(bmInPoly(FORE,px,py)) o=1;
    const bx=x+.5-cx; if((bx*bx)/(4.2*s*4.2*s)+((py+1*s)*(py+1*s))/(5.6*s*5.6*s)<=1) o=3; if((bx*bx)/(2.8*s*2.8*s)+((py-9*s)*(py-9*s))/(7.4*s*7.4*s)<=1) o=3; if(bx*bx+(py+7.4*s)*(py+7.4*s)<=2.9*s*2.9*s) o=3; // tórax peludo, abdomen y cabeza
    if(o===1){ const dx=px-OC[0], dy=py-OC[1]; if((dx*dx)/(OR*OR)+(dy*dy)/((OR*1.1)*(OR*1.1))<=1) o=4; }
    own[y*W+x]=o; }
  const at=(x,y)=>x<0||y<0||x>=W||y>=H?0:own[y*W+x];
  for(let y=0;y<H;y++) for(let x=0;x<W;x++){ const o=own[y*W+x]; if(!o) continue; const px=Math.abs(x+.5-cx), py=y+.5-cy, d=BAYER4[y&3][x&3]/16;
    if(sil){ if(o===4){ const dx=px-OC[0], dy=py-OC[1], r=Math.hypot(dx,dy/1.1)/OR; if(r>.62) B.set(x,y,sil); } else B.set(x,y,sil); continue; } // los ojos, huecos
    let c;
    if(o===3){ const fur=((x*7+y*3)&3)===0||(((x*3+y*5)&7)===1); c=py>3*s?(((Math.round(py/(1.7*s)))&1)?P.body:P.bodyL):(fur?P.wLL:P.fur); if(Math.abs(py+7.6*s)<1.1*s&&px>.7*s&&px<2.1*s) c=P.o1; } // cuerpo: tórax de pelo claro, abdomen a franjas y dos ojitos
    else if(o===4){ const dx=px-OC[0], dy=py-OC[1], r=Math.hypot(dx,dy/1.1)/OR; c=r>.8?P.o1:r>.55?P.o2:r>.3?P.o1:(dx<0&&dy<0?P.o3:P.o1); } // el ocelo: anillo, iris y pupila
    else { const reach=o===1?34*s*kk:23*s*kk, t=px/Math.max(1,reach), vein=((Math.round(Math.atan2(py,px)*9/s))%3===0)&&t>.25; // cuanto más lejos del cuerpo, más oscuro; banda al borde
      const edge=at(x+(x<cx?-2:2),y)===0||at(x,y+2)===0||at(x,y-2)===0, v=(o===2?.7:.55)-t*.35-(py<0&&o===1?.05:0)+(d-.47)*.18;
      c=edge?P.band:v>.62?P.wLL:v>.48?P.wL:v>.34?P.wM:v>.2?P.w:P.wD; if(vein&&!edge) c=P.wD; }
    B.set(x,y,c); }
  for(let y=0;y<H;y++) for(let x=0;x<W;x++){ if(own[y*W+x]&&!(sil&&own[y*W+x]===4)) continue; if(own[y*W+x]===4) continue;
    if(at(x+1,y)||at(x-1,y)||at(x,y+1)||at(x,y-1)) B.set(x,y,sil||P.ink); } // contorno
  for(const sd of [-1,1]) for(let i=0;i<Math.round(17*s);i++){ const u=i/(17*s), ax=Math.round(cx+sd*(1.6*s+u*11*s)), ay=Math.round(cy-9*s-u*12*s+u*u*4*s); B.set(ax,ay,sil||P.ink); // antenas de pluma
    if(i%2===0&&i>2&&i<17*s-2){ B.set(ax+sd,ay-1,sil||P.wLL); B.set(ax-sd,ay+1,sil||P.wL); } }
  cached=B.canvas(); cached.cx=Math.round(cx); cached.cy=cy; BIGMOTH.set(key,cached); if(BIGMOTH.size>60) BIGMOTH.delete(BIGMOTH.keys().next().value); return cached; }
function drawBigMoth(x,y,s,k,opt){ const c=bigMothArt(s,k,opt); ctx.drawImage(c,Math.round(x-c.cx),Math.round(y-c.cy)); return c; }
