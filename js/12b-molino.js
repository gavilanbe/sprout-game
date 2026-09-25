'use strict';
/* ============================================================
   EL MOLINO DE LA HOJARASCA · mazmorra 4 · el Otoño
   Cuando vuelve el verano, el otoño de las marismas se refugia en
   el viejo molino de la Ciénaga. Allí lo guarda EL CIERVO DE ÁMBAR,
   a quien el Viento pidió que dejara caer las hojas cuando nadie
   las quería.
   · El MOLINILLO (objeto X): lanza una ráfaga que barre hojarasca,
     hace girar molinetes, aparta bichos, arranca escudos de hoja y
     despeja el ventisquero del Sendero del Último Invierno.
   · Molinetes: según la sala, abren verjas mientras giran ('any'),
     o para siempre si giran todos a la vez ('all').
   · Hojarasca: tapa suelo, agujeros o tesoros (LEAF_HIDE).
   ============================================================ */
/* ---------- registro en las tablas compartidas ---------- */
DUNGEON_NAMES.molino='EL MOLINO DE LA HOJARASCA'; DUNGEON_SHORT.molino='MOLINO'; DUNGEON_BOSS.molino='19,-1';
REGION_ANCHOR.molino={sx:19,sy:2,x:72,y:80,name:'el molino'};
ENEMY_MARK['κ']='crow'; ENEMY_MARK['η']='knight'; ENEMY_MARK['ρ']='root';
MIDBOSS_MARK['Ξ']='scare'; BOSS_MARK['Λ']='ciervo';
ENEMY_STATS.crow={hp:2,dmg:1}; ENEMY_STATS.knight={hp:4,dmg:2}; ENEMY_STATS.root={hp:3,dmg:1};
ITEM_NAMES.molinillo='MOLINILLO'; ITEM_NAMES.amber='HOJA DE ÁMBAR';
MID_CARD.scare='EL ESPANTAPÁJAROS';
MID_INTRO.scare=["(Un espantapájaros clavado en medio del granero... ¿Se ha movido?)","(Cuando gira, no te acerques. Cuando se marea, ¡ahora!)"];
Object.assign(ROOM_RULES,{'18,2':{clear:true,reward:{kind:'key',x:5,y:3}},'20,1':{clear:true,reward:{kind:'chest',x:4,y:4}}});
Object.assign(CHESTS,{'20,1:4,4':{kind:'map',dk:'molino'},'18,0:1,1':{kind:'compass',dk:'molino'}});
Object.assign(ROOM_HINTS,{
  '19,2':["(EL MOLINO DE LA HOJARASCA. Huele a trigo viejo y a hojas que no terminan de caer...)"],
  '19,1':["(Dos molinetes clavados en el suelo. La verja del norte no cede...)"],
  '20,0':["(Un molinete a cada lado de la verja. Mientras gira, la verja se abre.)"],
  '20,-1':["(Tres molinetes en fila. Un montón de hojarasca estorba en medio...)"],
  '18,0':["(Bajo la hojarasca el suelo cruje. Algunas hojas tapan agujeros.)"],
  '19,-1':["(Un ciervo enorme descansa bajo un manto de hojas secas...)","(La Hoja resbala sobre su MANTO DE HOJARASCA. ¡Sóplaselo con el MOLINILLO!)"],
});
{ let base=ROOM_HINTS['1,-2']||[]; // la pista del Sendero habla del ventisquero solo mientras sigue ahí
  Object.defineProperty(ROOM_HINTS,'1,-2',{enumerable:true,configurable:true,set:v=>{ base=v||[]; },
    get:()=>(opened.has('SD1,-2:4,5')||boss3Done||visited.has('15,2'))?base:base.concat(["(Un VENTISQUERO tapa la grieta. Haría falta un viento propio para barrerlo.)"])}); }
if(TXT.signs) TXT.signs['4,3']=["EL MOLINO DE LA HOJARASCA.","Cerrado hasta que vuelva el verano. (Las hojas podridas tapan la puerta.)"];
Object.assign(PLACE_NAMES,{'19,2':'Zaguán del Molino','18,2':'Granero','20,2':'Sala de los Sacos','19,1':'Sala de los Engranajes','18,1':'Pajar del Espantapájaros',
  '20,1':'Despensa','20,0':'Sala del Viento','20,-1':'Cámara de la Llave','19,0':'Sala de las Aspas','18,0':'Laberinto de Hojarasca','19,-1':'Lecho del Ciervo'});
/* ---------- qué esconde cada montón de hojarasca ---------- */
const LEAF_HIDE={
  '4,3:7,2':{kind:'floor',rotten:true},
  '19,2:2,2':{kind:'berries',n:5}, '19,2:7,5':{kind:'berries',n:5}, '18,2:1,1':{kind:'berries',n:5},
  '19,0:7,5':{kind:'piece',id:'♥hoja19,0'}, '19,0:2,5':{kind:'berries',n:5},
  '20,-1:3,2':{kind:'floor'},
};
// el laberinto de hojarasca (18,0): el camino bueno es (5,4)→(4,4)→(4,5)→(3,5)→(3,6); lo demás, agujeros
for(let y=1;y<=6;y++) for(let x=3;x<=5;x++){ const safe=[[5,4],[4,4],[4,5],[3,5],[3,6],[5,1]].some(([a,b])=>a===x&&b===y); LEAF_HIDE['18,0:'+x+','+y]={kind:safe?'floor':'hole'}; }
/* ---------- molinetes: reglas por sala ---------- */
const MILL_RULES={'19,1':{mode:'all',dur:200,perm:true},'20,0':{mode:'any',dur:130},'20,-1':{mode:'all',dur:170,perm:true}};
let pinT=0; const PIN_T=26; // el molinillo en la mano: cuánto dura alzado y girando
let gusts=[], millSpin={}, millGates=null, millGatesOpen=false, millSail=0;
/* ---------- el molinillo ---------- */
function usePinwheel(){
  if(gusts.length) return;
  const D=DIRV[player.dir]; if(SFX.swoosh) SFX.swoosh(); else SFX.boomer(); noise(.14,.05,true);
  gusts.push({x:player.x+8+D[0]*8,y:player.y+10+D[1]*8,vx:D[0]*3.2,vy:D[1]*3.2,t:0,life:32,hits:new Set()});
  player.squash=.18; pinT=PIN_T; // Sprout lo alza y las aspas zumban
  for(let i=0;i<6;i++){ const a=i/6*6.283; parts.push({k:'mote',x:player.x+8+D[0]*10+Math.cos(a)*4,y:player.y+9+D[1]*10+Math.sin(a)*4,vx:Math.cos(a)*.9+D[0]*.8,vy:Math.sin(a)*.9+D[1]*.8,life:12,max:12,sway:0,col:i&1?'#fffbe8':'#fcd878',nog:true}); }
  for(let i=0;i<5;i++) parts.push({k:'leafF',x:player.x+8+D[0]*6,y:player.y+8+D[1]*6,vx:D[0]*(1.5+Math.random()),vy:D[1]*(1.5+Math.random())-.3,life:40,max:40,sway:Math.random()*6,col:['#e8a040','#c86424','#fcd878'][i%3],nog:true});
}
function spinSwitch(x,y){ const R=MILL_RULES[sx+','+sy]; const k=x+','+y; const was=millSpin[k]>0; millSpin[k]=R?R.dur:150;
  if(!was){ SFX.blip(); noise(.08,.04,true); } puff(x*16+8,y*16+4,'#fcd878',6,1); }
function blowLeaf(x,y){ const key=sx+','+sy, H=LEAF_HIDE[key+':'+x+','+y]||{kind:'floor'};
  if(H.rotten&&!summered){ SFX.bump(); showToast('HOJARASCA PODRIDA','no se mueve'); return; }
  opened.add('LF'+key+':'+x+','+y); applyLeaf(x,y,H,false); SFX.cut(); shake=Math.max(shake,2);
  bladeBits(x*16+8,y*16+8,['#e8a040','#c86424','#fcd878','#8a3a14'],12); markDirty(); save(); }
function applyLeaf(x,y,H,silent){
  grid[y][x]=H.kind==='hole'?'°':regionFloor();
  if(H.kind==='piece'&&!collected.has(H.id)) pickups.push({kind:'piece',id:H.id,x:x*16+4,y:y*16+4,t:0,drop:silent?0:16});
  if(H.kind==='berries'&&!silent) for(let i=0;i<(H.n||3);i++) pickups.push({kind:'berry',x:x*16+2+i*3,y:y*16+4,t:0,drop:14+i*2});
  if(!silent&&H.kind==='hole'){ SFX.fall&&SFX.fall(); flyText.push({x:x*16+8,y:y*16,txt:'!',t:20,col:'#ff9040'}); }
}
function blowDrift(x,y){ const key=sx+','+sy; for(let dx=-2;dx<=2;dx++){ const xx=x+dx; if(grid[y][xx]!=='∩') continue;
    grid[y][xx]='n'; opened.add('SD'+key+':'+xx+','+y); puff(xx*16+8,y*16+8,'#ffffff',10,1.4); puff(xx*16+8,y*16+8,'#dff0ff',6,1); }
  SFX.secret(); shake=4; markDirty(); showToast('¡EL VENTISQUERO SE DESHACE!','el paso a la grieta está libre'); save(); }
function gustHitEnemy(e,g){
  e.kx=(g.vx||0)*1.7; e.ky=(g.vy||0)*1.7; e.flash=Math.max(e.flash,2);
  if(e.type==='crow'){ e.stun=100; e.st='back'; SFX.stun&&SFX.stun(); }
  else if(e.type==='knight'){ if(!e.bare){ e.bare=240; SFX.block(); for(let i=0;i<6;i++) parts.push({k:'blade',x:e.x+8,y:e.y+8,vx:(g.vx||0)*.6+(Math.random()-.5),vy:(g.vy||0)*.6-.8,life:26,max:26,col:['#e8a040','#c86424'][i&1],rot:Math.random()*6,vr:.4}); showToast('¡SIN ESCUDO!','ahora sí'); } }
  else if(e.type==='root'){ if(e.st==='hide'||e.st==='grab'){ e.st='up'; e.ut=90; e.stun=60; puff(e.x+8,e.y+12,'#5a4630',8,1.2); } }
  else if(e.type==='wisp'||e.type==='gust'){ e.hp=0; }
  else e.stun=Math.max(e.stun||0,40);
}
function updGusts(){ if(pinT>0) pinT--;
  for(const g of gusts){ g.t++; g.x+=g.vx; g.y+=g.vy;
    if((tick&1)===0) parts.push({k:'mote',x:g.x+(Math.random()-.5)*10,y:g.y+(Math.random()-.5)*10,vx:g.vx*.3,vy:g.vy*.3,life:14,max:14,sway:Math.random()*6,col:'#fff6d8',nog:true});
    const tx=g.x>>4, ty=g.y>>4;
    if(tx<0||ty<0||tx>=SW||ty>=SH){ g.dead=true; continue; }
    const key=tx+','+ty, ch=grid[ty][tx];
    if(!g.hits.has(key)){ g.hits.add(key);
      if(ch==='ψ') spinSwitch(tx,ty);
      else if(ch==='ξ'){ blowLeaf(tx,ty); g.dead=true; }
      else if(ch==='∩'){ blowDrift(tx,ty); g.dead=true; }
      else if(ch==='t'){ cutAt([tx*16,ty*16,16,16]); }
      else if(isSolid(ch)&&!WATER.has(ch)){ g.dead=true; puff(g.x,g.y,'#fff6d8',6,1); } }
    for(const e of enemies){ if(g.hits.has(e)) continue; if(Math.hypot(e.x+8-g.x,e.y+8-g.y)<13){ g.hits.add(e); gustHitEnemy(e,g); } }
    if(boss&&!g.hits.has(boss)&&rectsHit([g.x-7,g.y-7,14,14],bossBox(boss))){ g.hits.add(boss); if(boss.type==='ciervo'){ ciervoGust(boss); g.dead=true; } }
    if(midboss&&!g.hits.has(midboss)&&rectsHit([g.x-7,g.y-7,14,14],[midboss.x+3,midboss.y+4,18,18])){ g.hits.add(midboss); midboss.kx=(g.vx||0)*1.4; midboss.ky=(g.vy||0)*1.4; }
    if(g.t>=g.life) g.dead=true;
    if(g.dead) for(let i=0;i<4;i++){ const a=i/4*6.283+g.t; parts.push({k:'mote',x:g.x+Math.cos(a)*3,y:g.y+Math.sin(a)*3,vx:Math.cos(a)*.5+g.vx*.15,vy:Math.sin(a)*.5+g.vy*.15,life:16,max:16,sway:i,col:i&1?'#fffbe8':PIN_C4[i][1],nog:true}); } } // se deshace en rizos
  gusts=gusts.filter(g=>!g.dead);
}
/* ---------- molinetes y verjas ---------- */
function millSwitches(){ const L=[]; for(let y=0;y<SH;y++) for(let x=0;x<SW;x++) if(grid[y][x]==='ψ') L.push(x+','+y); return L; }
function updMillSwitches(){
  const key=sx+','+sy, R=MILL_RULES[key]; for(const k in millSpin) if(millSpin[k]>0) millSpin[k]--;
  if(!R) return; const sw=millSwitches(); if(!sw.length) return;
  const n=sw.filter(k=>millSpin[k]>0).length, want=R.mode==='all'?n===sw.length:n>0;
  if(R.perm){ if(want&&!opened.has('G'+key)){ opened.add('G'+key); openGates(); SFX.puzzle(); shake=4; showToast('¡LOS MOLINETES GIRAN!','la verja se abre'); save(); } return; }
  if(!millGates) return;
  if(want!==millGatesOpen){
    let blocked=false; if(!want) for(const [x,y] of millGates){ if(rectsHit([x*16,y*16,16,16],[player.x+4,player.y+8,8,8])) blocked=true; }
    if(!blocked){ millGatesOpen=want; for(const [x,y] of millGates){ grid[y][x]=want?regionFloor():'='; puff(x*16+8,y*16+8,'#8a7048',4,.8); } markDirty(); SFX.bump(); } }
}
function initMill(){
  gusts=[]; pinT=0; millSpin={}; millGates=null; millGatesOpen=false;
  const key=sx+','+sy;
  for(let y=0;y<SH;y++) for(let x=0;x<SW;x++){ const ch=grid[y][x];
    if(ch==='ξ'){ const H=LEAF_HIDE[key+':'+x+','+y]||{kind:'floor'}; if(opened.has('LF'+key+':'+x+','+y)||(H.rotten&&summered)) applyLeaf(x,y,H,true); }
    else if(ch==='∩'&&(opened.has('SD'+key+':'+x+','+y)||boss3Done||visited.has('15,2'))) grid[y][x]='n'; } // partidas que ya subieron al templo: sin ventisquero
  if(regionOf(sx,sy)==='molino') for(const e of enemies) if(!MILL_ENEMY[e.type]) e.hp+=1; // bichos del molino, curtidos
  const R=MILL_RULES[key]; if(R&&!R.perm){ millGates=[]; for(let y=0;y<SH;y++) for(let x=0;x<SW;x++) if(grid[y][x]==='=') millGates.push([x,y]); }
  if(sx===19&&sy===-1&&boss4Done) npcs.push({ch:'ciervo',x:5,y:2,guest:'ciervo'});
  if(typeof SPEAKER!=='undefined'&&!SPEAKER['EL CIERVO']) SPEAKER['EL CIERVO']={col:'#e8a040',ink:'#3a1a08',f:250,w:'triangle'};
  if(typeof PORTRAITS!=='undefined') PORTRAITS['EL CIERVO']=CIERVO_BARE;
}
function updMill(){
  updGusts(); updMillSwitches(); millSail+=summered?.04:.006;
  if(regionOf(sx,sy)==='molino'&&state==='play'&&(tick&31)===0&&parts.length<120) parts.push({k:'leafF',x:Math.random()*160,y:-4,vx:.15,vy:.35,life:260,max:260,sway:Math.random()*6,col:['#e8a040','#c86424','#fcd878'][(tick>>5)%3],nog:true});
}
/* ============================================================
   EL ESPANTAPÁJAROS (minijefe): salta hacia ti, planta el palo y
   gira con los brazos abiertos (¡lejos!) y al final se marea:
   entonces la Hoja le arranca paja. Suelta cuervos de su sombrero.
   ============================================================ */
function makeScare(x,y){ return {type:'scare',hp:12,maxHp:12,st:'hop',t:24,x:x*16-4,y:y*16-4,flash:0,w:24,h:24,kx:0,ky:0,vx:0,vy:0,hz:0,hops:0,cyc:0,spin:0,hits:0}; }
function scareStraw(m,n,sp){ const cx=m.x+12, cy=m.y+12; for(let i=0;i<n;i++){ const a=i/n*6.283+m.cyc; projs.push({x:cx,y:cy,vx:Math.cos(a)*sp,vy:Math.sin(a)*sp,t:70,kind:'sting',dmg:1}); } }
function updScare(m){
  if(m.flash>0)m.flash--; if(m.clangT>0) m.clangT--; m.t--; m.kx*=.8; m.ky*=.8;
  const cx=m.x+12, cy=m.y+12, dx=player.x+8-cx, dy=player.y+10-cy, d=Math.hypot(dx,dy)||1, ph2=m.hp<=m.maxHp/2;
  const move=(nx,ny)=>{ if(boxFree(nx+3,m.y+10,18,12)) m.x=nx; if(boxFree(m.x+3,ny+10,18,12)) m.y=ny; };
  const mb=[m.x+4,m.y+3,16,19];
  if(m.st==='hop'){ const dur=ph2?18:24, k=1-m.t/dur; m.hz=Math.sin(Math.max(0,Math.min(1,k))*Math.PI)*10; move(m.x+m.vx+m.kx,m.y+m.vy+m.ky);
    if(m.t<=0){ m.hops++; puff(cx,m.y+22,'#c8a060',6,.8); SFX.bump(); shake=Math.max(shake,2); m.hz=0;
      if(m.hops>(ph2?4:3)){ m.st='plant'; m.t=ph2?18:24; m.hops=0; SFX.bump(); flyText.push({x:cx,y:m.y-6,txt:'!',t:18,col:'#ff9040'}); } // clava el palo: ¡aléjate!
      else { m.t=dur; const sp=(ph2?26:20)/dur; m.vx=dx/d*sp; m.vy=dy/d*sp; } } }
  else if(m.st==='plant'){ m.hz=0; m.spin+=.08; if((tick&3)===0) parts.push({x:cx+(Math.random()-.5)*16,y:m.y+22,vx:(Math.random()-.5)*.8,vy:-.6,life:12,col:'#c8a060'});
    if(m.t<=0){ m.st='spin'; m.t=ph2?96:74; scareStraw(m,ph2?8:6,1.3); SFX.ehit(); } }
  else if(m.st==='spin'){ m.hz=0; m.spin+=ph2?.7:.5;
    if(m.t===(ph2?48:37)) scareStraw(m,ph2?8:6,1.4);
    if((tick&3)===0) parts.push({x:cx+(Math.random()-.5)*26,y:cy+(Math.random()-.5)*10,vx:(Math.random()-.5)*1.5,vy:-.4,life:16,col:'#f0d870'});
    if(d<24&&player.inv===0&&jumpT===0) hurt(2,cx,cy);
    if(m.t<=0){ m.st='dizzy'; m.t=ph2?76:96; m.hits=0; SFX.bump(); } }
  else if(m.st==='dizzy'){ m.spin*=.9; if((tick&7)<4) sparkle(m.x+6+Math.random()*12,m.y,'#fff0a0');
    if(m.t<=0){ m.st='hop'; m.t=1; m.cyc++;
      if(m.cyc%2===1&&enemies.length<(ph2?2:1)){ for(let i=0;i<1;i++){ const e=spawnEnemy('crow',Math.max(1,Math.min(8,(cx>>4)+(i?1:-1))),Math.max(1,(cy>>4)-1),1); e.hp=2; e.dmg=1; enemies.push(e); } SFX.blip(); flyText.push({x:cx,y:m.y-6,txt:'¡CRA!',t:20,col:'#ff9040'}); } } }
  if(m.st==='hop'&&m.hz<4&&player.inv===0&&jumpT===0&&rectsHit(mb,hitPlayerBox())) hurt(1,cx,cy); // al caer del salto
  if(m.flash===0&&meleeActive()&&rectsHit(meleeBox(),mb)){
    if(m.st==='dizzy'){ const n=meleeDmg(); m.hp-=n; m.flash=8; SFX.ehit(); hitStop=3; hitSpark(cx,cy); m.squash=.3; flyText.push({x:cx,y:m.y-4,txt:''+n,t:24,col:'#fffbe8'}); m.kx=(cx-player.x-8)/d*2; bladeBits(cx,cy,['#f0d870','#c8a060'],6); if(++m.hits>=4) m.t=Math.min(m.t,6); }
    else if(!m.clangT){ m.clangT=14; SFX.block(); m.flash=3; player.kx=(player.x+8-cx)/d*3; player.ky=(player.y+10-cy)/d*3; sparkle(cx,m.y+4,'#fff0a0'); } }
}
/* ============================================================
   EL CIERVO DE ÁMBAR (guardián del Otoño): lleva un MANTO DE
   HOJARASCA en el que la Hoja resbala. Una ráfaga del MOLINILLO
   se lo arranca: queda al descubierto unos segundos (tres golpes).
   Embiste; herido lanza dardos de hoja, hace llover bellotas y
   llama a los cuervos; al final embiste dos veces seguidas.
   ============================================================ */
function makeCiervo(x,y){ return {type:'ciervo',hp:22,maxHp:22,st:'idle',t:70,x:x*16-8,y:y*16-8,flash:0,w:32,h:32,mantle:1,exp:0,regrow:0,face:-1,vx:0,vy:0,kx:0,ky:0,cyc:0,twice:false,hitsExp:0,calmMsg:false}; }
function ciervoGust(b){
  if(b.st==='yield') return;
  if(b.mantle>0){ b.mantle=0; b.exp=bossPhase(b)===3?110:150; b.hitsExp=0; b.regrow=0; SFX.secret(); shake=6; screenFlash(4,'#fcd878');
    for(let i=0;i<18;i++){ const a=Math.random()*6.283, s=1+Math.random()*2; parts.push({k:'blade',x:b.x+16,y:b.y+16,vx:Math.cos(a)*s,vy:Math.sin(a)*s-.6,life:34,max:34,col:['#e8a040','#c86424','#fcd878','#8a3a14'][i%4],rot:Math.random()*6,vr:.4}); }
    flyText.push({x:b.x+16,y:b.y-6,txt:'¡AL DESCUBIERTO!',t:34,col:'#fcd878'}); }
  else { b.kx=(b.x+16<player.x+8?-2:2); }
}
function ciervoAim(b){ const dx=player.x+8-(b.x+16), dy=player.y+12-(b.y+20), d=Math.hypot(dx,dy)||1; b.ax=dx/d; b.ay=dy/d; b.face=dx<0?-1:1; }
function ciervoPeace(){ const b=boss;
  say(CIERVO_PEACE,()=>queueBye('ciervo',fb=>{ // su despedida (15m); luego, el Ámbar donde estaba
    if(fb){ SFX.fanfare(); shake=10; puff(b.x+16,b.y+16,'#fcd878',18,2); puff(b.x+16,b.y+16,'#e8a040',12,1.6); }
    pickups.push({kind:'amber',x:b.x+8,y:b.y+8,t:0}); boss=null; boss4Done=true; enemies=[]; projs=[]; save();
    setTrack(TRACKS.molino?'molino':'cueva'); }),'EL CIERVO'); }
const CIERVO_PEACE=[
  "—No me hieras más, brote. Tampoco yo quería pelear.",
  "—El Viento del Norte me pidió que guardara el otoño cuando nadie lo quería.",
  "—Dejé caer las hojas, año tras año, aunque el valle me lo reprochara. Alguien tenía que hacerlo.",
  "—Llévate la HOJA DE ÁMBAR. Que el otoño vuelva a su sitio... y que nadie vuelva a odiar las hojas que caen.",
  "(El Ciervo se tumba sobre la hojarasca, en paz.)",
];
function updCiervo(){
  const b=boss; if(b.flash>0)b.flash--; if(b.clangT>0) b.clangT--; b.t--; b.kx*=.8; b.ky*=.8;
  const ph=bossPhase(b), cx=b.x+16, cy=b.y+18, dx=player.x+8-cx, dy=player.y+12-cy, d=Math.hypot(dx,dy)||1;
  const move=(nx,ny)=>{ let hit=false; if(boxFree(nx+6,b.y+14,20,14)) b.x=nx; else hit=true; if(boxFree(b.x+6,ny+14,20,14)) b.y=ny; else hit=true; return hit; };
  if(b.hp<=2&&b.st!=='yield'){ b.st='yield'; b.t=999; b.mantle=0; b.exp=999; enemies=[]; projs=[]; SFX.bump(); shake=4;
    if(!b.calmMsg){ b.calmMsg=true; pendingSay=["(El Ciervo dobla las patas y se queda quieto, jadeando...)","(Ya no pelea. Acércate y pulsa Z.)"]; } }
  if(b.st==='yield'){ b.t=999; if((tick&7)===0) parts.push({k:'leafF',x:cx+(Math.random()-.5)*20,y:b.y,vx:.1,vy:.3,life:60,max:60,sway:Math.random()*6,col:'#e8a040',nog:true}); return; }
  // el manto: al descubierto un rato; luego las hojas vuelven a él
  if(b.mantle===0){ if(b.exp>0) b.exp--; else { b.regrow++; if((tick&1)===0){ const a=Math.random()*6.283; parts.push({k:'blade',x:cx+Math.cos(a)*30,y:cy+Math.sin(a)*22,vx:-Math.cos(a)*1.2,vy:-Math.sin(a)*1.0,life:24,max:24,col:['#e8a040','#c86424'][tick&1],rot:a,vr:.3}); }
      if(b.regrow>=40){ b.mantle=1; b.regrow=0; SFX.blip(); } } }
  if(b.st==='idle'){ const tx=Math.max(8,Math.min(120,player.x-8+(dx>0?-52:52))); b.face=dx<0?-1:1; // ronda a distancia
    move(b.x+Math.sign(tx-b.x)*.5+b.kx,b.y+Math.sign(Math.max(16,Math.min(70,player.y-20))-b.y)*.4+b.ky);
    if(b.t<=0){ b.cyc++; if(ph>=2&&b.cyc%3===0){ b.st='call'; b.t=40; } else { b.st='windup'; b.t=ph===3?22:ph===2?28:34; ciervoAim(b); } } }
  else if(b.st==='windup'){ // escarba y apunta: la embestida irá hacia donde estabas al empezar (se ve en el suelo)
    if((tick&3)===0) parts.push({k:'dust',x:cx-b.face*10,y:b.y+30,vx:-b.face*.5,vy:-.2,life:12,max:12,r:2,col:'#c8a878',nog:true});
    if(b.t<=0){ const sp=ph===1?3.2:ph===2?3.6:4; b.vx=b.ax*sp; b.vy=b.ay*sp; b.st='charge'; b.t=50; SFX.ehit(); shake=3; } }
  else if(b.st==='charge'){ const hit=move(b.x+b.vx,b.y+b.vy); if((tick&1)===0) parts.push({k:'dust',x:cx,y:b.y+30,vx:-b.vx*.2,vy:-.3,life:14,max:14,r:2,col:'#c8a878',nog:true});
    if(hit||b.t<=0){ shake=hit?8:3; if(hit){ SFX.bump(); puff(cx+b.face*14,cy,'#8a6a48',10,1.4); }
      if(ph>=2){ const n=ph===3?8:6; for(let i=0;i<n;i++){ const a=i/n*6.283+b.cyc*.4; projs.push({x:cx,y:cy,vx:Math.cos(a)*1.5,vy:Math.sin(a)*1.5,t:80,kind:'sting',dmg:1}); } }
      if(ph===3&&!b.twice){ b.twice=true; b.st='windup'; b.t=22; ciervoAim(b); }
      else { b.twice=false; if(hit){ b.st='stuck'; b.t=ph===3?36:46; } else { b.st='idle'; b.t=ph===1?70:55; } } } }
  else if(b.st==='stuck'){ // las astas clavadas en las tablas: sacude la cabeza (¡ahora, el molinillo!)
    if((tick&7)===0) parts.push({k:'dust',x:cx+b.face*14,y:b.y+8+Math.random()*10,vx:-b.face*.4,vy:-.3,life:14,max:14,r:1,col:'#a08058',nog:true});
    if(b.t<=0){ b.st='idle'; b.t=ph===1?60:45; } }
  else if(b.st==='call'){ // pisotón: llueven bellotas y vienen los cuervos
    if(b.t===30){ shake=6; SFX.edie(); for(let i=0;i<(ph===3?4:3);i++) fallAt(player.x+8+(Math.random()-.5)*44,player.y+12+(Math.random()-.5)*30,40,false,2);
      if(enemies.length<2){ const e=spawnEnemy('crow',Math.random()<.5?1:8,1,1); e.hp=2; e.dmg=1; enemies.push(e); } }
    if(b.t<=0){ b.st='idle'; b.t=50; } }
  const bb=bossBox(b);
  if(player.inv===0&&jumpT===0&&rectsHit(bb,hitPlayerBox())) hurt(b.st==='charge'?(ph===3?3:2):b.st==='call'?2:1,cx,cy); // embestida y pisotón duelen; el roce, menos
  if(b.flash===0&&meleeActive()&&rectsHit(meleeBox(),bb)){
    if(b.mantle>0) bossClang(b,cx,cy);
    else if(bossHit(b,meleeDmg())){ if(++b.hitsExp>=4){ b.exp=0; shake=5; } } }
}
/* ============================================================
   ARTE: baldosas del molino, hojarasca, molinetes, ventisquero,
   el altar del Otoño y el molino de la Ciénaga
   ============================================================ */
const AUT5=['#4a1c0c','#8a3a14','#c86424','#eaa040','#fcd878'];
const ROT5=['#1e180c','#382c14','#54401e','#6e5428','#8a6e38'];
function millFloorTile(v){ return cached('millfloor'+v,g=>{
  R(g,0,0,16,16,'#a87040'); const rnd=seeded(v*61+7);
  for(let y=0;y<16;y+=4){ R(g,0,y,16,1,'#c89058'); R(g,0,y+3,16,1,'#7a4a24'); const off=((y>>2)+v)&1?5:12; R(g,off,y,1,4,'#7a4a24'); PX(g,off+1,y,'#c89058'); }
  for(let i=0;i<3;i++){ const x=(rnd()*14)|0, y=(rnd()*14)|0; R(g,x,y,2,1,'#e8c860'); PX(g,x+2,y+1,'#b08830'); } // paja
  if(v%3===0){ const x=3+((rnd()*9)|0), y=3+((rnd()*9)|0), c=rnd()<.5?'#e07830':'#b83820'; R(g,x,y,2,1,c); PX(g,x+1,y+1,c); PX(g,x,y+1,shade(c,-.3)); } // una hoja caída
});}
function millWallTile(edges,v){ return cached('millwall'+edges+v,g=>{
  // tablas verticales de madera curtida con un travesaño: más oscuras que el suelo de tablones
  const b='#5a4030', d='#36241a', l='#7a5a40', ll='#9c7a56';
  R(g,0,0,16,16,b);
  for(let x=0;x<16;x+=4){ R(g,x,0,1,16,d); R(g,x+1,0,1,16,l); }
  R(g,0,6,16,3,d); R(g,0,6,16,1,ll); R(g,0,7,16,1,l); PX(g,2,7,'#d8c0a0'); PX(g,10,7,'#d8c0a0'); // travesaño y clavos
  if(v===1){ PX(g,5,2,'#6a8a38'); PX(g,6,3,'#4a6a28'); PX(g,5,4,'#78a848'); PX(g,13,12,'#c86424'); PX(g,14,12,'#e8a040'); } // hiedra y una hoja
  else { R(g,9,11,2,1,d); PX(g,10,12,d); PX(g,9,10,l); } // un nudo
  if(edges&4){ R(g,0,11,16,5,d); R(g,0,11,16,1,ll); R(g,0,12,16,1,l); for(let x=1;x<16;x+=4) R(g,x,13,2,1,'#4a3222'); R(g,0,14,16,1,shade(d,-.25)); R(g,0,15,16,1,PAL.k); }
  if(edges&1){ R(g,0,0,16,1,PAL.k); R(g,0,1,16,2,ll); R(g,0,3,16,1,l); }
  if(edges&8){ R(g,0,0,1,16,PAL.k); R(g,1,0,2,16,l); R(g,1,0,1,16,ll); }
  if(edges&2){ R(g,15,0,1,16,PAL.k); R(g,13,0,2,16,d); }
});}
function leafPileTile(rotten,v){ return cached('leafpile'+(rotten?1:0)+v,g=>{
  if(rotten){ R(g,1,13,14,2,'rgba(40,60,50,.35)'); R(g,3,14,4,1,'rgba(200,220,200,.35)'); } // charco de ciénaga
  shadowBlob(g,8,14,7,1.5,.3);
  const P=rotten?ROT5:AUT5;
  blobArt(g,0,2,16,13,[{x:4.5,y:8.5,r:4.2,ry:3.6},{x:11.5,y:8.5,r:4.2,ry:3.6},{x:8,y:6,r:5.2,ry:4.4},{x:8,y:9.5,r:5.6,ry:3.4}],P,{grad:.5,dither:.8});
  const rnd=seeded(v*13+(rotten?5:1));
  const L=rotten?['#8a5a2a','#6a4a22','#9a7a3a']:['#f07830','#e8a040','#c83828','#fcd060'];
  for(let i=0;i<7;i++){ const x=2+((rnd()*10)|0), y=3+((rnd()*8)|0), c=L[(rnd()*L.length)|0]; // hojitas sueltas por encima
    R(g,x,y,3,1,c); PX(g,x+1,y+1,c); PX(g,x,y+1,shade(c,-.4)); PX(g,x+2,y-1,shade(c,.25)); }
  if(!rotten){ PX(g,6,4,'#fff0c0'); PX(g,11,6,'#fff0c0'); PX(g,4,8,'#fff0c0'); }
  else { for(const [x,y] of [[5,9],[10,5],[12,10],[3,7]]){ PX(g,x,y,'#6a8a3a'); PX(g,x+1,y,'#4a6a2a'); } PX(g,8,11,'#1a140a'); PX(g,7,6,'#c8b890'); } // moho y brillo mojado
});}
function switchBaseTile(){ return cached('millswitchbase',g=>{ shadowBlob(g,8,13,5,1.5,.35);
  blobArt(g,3,9,10,6,[{x:5,y:3,r:4.6,ry:2.4}],['#3a3028','#5a4a3a','#7a6a56','#9a8a72','#c0b096'],{grad:.4}); });}
function driftTile(v){ return cached('drift'+v,g=>{ shadowBlob(g,8,14,7,1.5,.25);
  blobArt(g,0,3,16,12,[{x:4,y:7.5,r:4.4,ry:3.8},{x:12,y:7.5,r:4.4,ry:3.8},{x:8,y:5.5,r:5.4,ry:4.4}],['#7890b8','#a8bcd8','#d0dcf0','#eef4fc','#ffffff'],{grad:.5,dither:.6});
  R(g,3,4,4,1,'#ffffff'); R(g,9,3,3,1,'#ffffff'); PX(g,13,6,'#ffffff'); if(v&1){ PX(g,6,9,'#a8bcd8'); PX(g,10,10,'#a8bcd8'); } });}
function altarAutumnTile(){ return cached('altarotono',g=>{ // el mismo pedestal que sus hermanos, con la gema de ámbar
  g.drawImage(altarTile(1),0,0);
  const G=['#f8a040','#b85a18','#fff0c0'];
  R(g,6,2,4,2,G[0]); PX(g,7,2,G[2]); PX(g,9,3,G[1]); PX(g,8,3,G[1]); R(g,7,9,2,2,G[1]); PX(g,7,9,G[0]);
});}
function drawMillTile(g,x,y,ch,opts,f){ const px=x*16, py=y*16, v=hash(x*5+opts.sx,y*3+opts.sy);
  if(ch==='ξ'){ const H=LEAF_HIDE[opts.sx+','+opts.sy+':'+x+','+y]; g.drawImage(leafPileTile(!!(H&&H.rotten),v%3),px,py); }
  else if(ch==='ψ') g.drawImage(switchBaseTile(),px,py);
  else if(ch==='∩') g.drawImage(driftTile(v%2),px,py);
  else if(ch==='{') g.drawImage(altarAutumnTile(),px,py);
}
/* un molinete: poste y cuatro aspas; giran mientras dura el soplo */
function drawSwitch(x,y,k){ const cx=x*16+8, cy=y*16+4, spin=millSpin[k]||0, R=MILL_RULES[sx+','+sy];
  ctx.fillStyle=PAL.k; ctx.fillRect(cx-2,cy,4,11); ctx.fillStyle='#8a5a2c'; ctx.fillRect(cx-1,cy,2,10); ctx.fillStyle='#b07840'; ctx.fillRect(cx-1,cy,1,10);
  const a=spin>0?tick*.45:.35, cols=['#f04848','#f8d030','#58b048','#5890e8'];
  for(let i=0;i<4;i++){ const t=a+i*Math.PI/2, ex=cx+Math.cos(t)*7, ey=cy+Math.sin(t)*7, mx=cx+Math.cos(t+.5)*5, my=cy+Math.sin(t+.5)*5;
    ctx.fillStyle=PAL.k; ctx.beginPath(); ctx.moveTo(cx,cy); ctx.lineTo(ex,ey); ctx.lineTo(mx,my); ctx.closePath(); ctx.fill();
    ctx.fillStyle=cols[i]; ctx.beginPath(); ctx.moveTo(cx,cy); ctx.lineTo(cx+Math.cos(t)*6,cy+Math.sin(t)*6); ctx.lineTo(cx+Math.cos(t+.5)*4,cy+Math.sin(t+.5)*4); ctx.closePath(); ctx.fill(); }
  ctx.fillStyle=PAL.k; ctx.fillRect(cx-1,cy-1,3,3); ctx.fillStyle='#fcd878'; ctx.fillRect(cx,cy,1,1);
  if(spin>0&&R){ const k2=spin/R.dur; ctx.strokeStyle='rgba(252,216,120,'+(0.35+0.4*k2).toFixed(2)+')'; ctx.lineWidth=1; ctx.beginPath(); ctx.arc(cx,cy,9,-Math.PI/2,-Math.PI/2+6.283*k2); ctx.stroke(); }
}
/* el molino de la Ciénaga: torre encalada que se sale por arriba, puerta en arco sobre la baldosa G (7,1)
   y aspas de lona (rotas y casi quietas con el otoño preso; enteras y girando cuando vuelve el verano) */
function windmillBody(){ return cached('millbody',g=>{
  const H=60, cx=30;
  for(let y=0;y<12;y++){ const hw=Math.round(4+y*1.8); R(g,cx-hw-1,y,2*hw+2,1,PAL.k); // tejado cónico
    if(y>0){ R(g,cx-hw,y,2*hw,1,'#a8482a'); R(g,cx-hw,y,Math.round(hw*.7),1,'#c86a3a'); R(g,cx+Math.round(hw*.5),y,hw-Math.round(hw*.5),1,'#7a2e18'); } }
  for(let y=12;y<H;y++){ const k=(y-12)/(H-13), hw=Math.round(18+k*7), x0=cx-hw, w=hw*2; // cuerpo, más ancho al pie
    R(g,x0-1,y,w+2,1,PAL.k);
    R(g,x0,y,w,1,'#dcc496'); R(g,x0,y,Math.round(w*.3),1,'#f4e4bc'); R(g,x0+Math.round(w*.66),y,Math.round(w*.2),1,'#b89468'); R(g,x0+Math.round(w*.86),y,w-Math.round(w*.86),1,'#8a6a44');
    if((y-12)%9===0&&y>12) R(g,x0,y,w,1,'#b0905e'); }
  R(g,cx-19,12,38,2,'#5a2a14'); R(g,cx-19,14,38,1,'#8a6a44'); // alero
  const rnd=seeded(77);
  for(let i=0;i<10;i++){ const y=18+((rnd()*36)|0), hw=Math.round(18+((y-12)/(H-13))*7), x=cx-hw+3+((rnd()*(hw*2-7))|0); R(g,x,y,2,1,'#a8845a'); PX(g,x,y+1,'#fff4dc'); } // desconchones
  for(let y=24;y<H-3;y+=3){ const hw=Math.round(18+((y-12)/(H-13))*7), x=cx-hw+1+((y>>2)&1); PX(g,x,y,'#5a8a3a'); PX(g,x+1,y+1,'#3a6a2a'); PX(g,x,y+2,'#78a848'); } // hiedra
  for(let x=cx-25;x<=cx+25;x++){ const h=1+(hash(x,3)%3); R(g,x,H-h,1,h,(x&1)?'#4a7a38':'#6a9a48'); } // musgo al pie
  const dx=cx-7, dy=H-17; // la puerta en arco
  R(g,dx+2,dy-1,10,1,PAL.k); R(g,dx+1,dy,12,1,PAL.k); R(g,dx,dy+1,14,16,PAL.k);
  R(g,dx+1,dy+1,12,16,'#6a4424'); R(g,dx+2,dy+1,10,15,'#8a5a2c'); R(g,dx+2,dy+1,3,15,'#a06a34');
  for(let x=dx+5;x<dx+12;x+=3) R(g,x,dy+2,1,14,'#5a3418');
  R(g,dx+2,dy+5,10,1,'#4a2a10'); R(g,dx+2,dy+11,10,1,'#4a2a10'); PX(g,dx+10,dy+8,'#f8b030'); PX(g,dx+10,dy+9,'#a86018');
  R(g,dx-2,H-1,18,1,'#6a5a44');
},60,60);}
function windmillSail(summer){ return cached('millsail'+(summer?1:0),g=>{ // un aspa apuntando arriba; el eje, abajo
  R(g,1,0,5,34,PAL.k); R(g,2,0,3,34,'#8a5a2c'); R(g,2,0,1,34,'#c08850'); R(g,4,0,1,34,'#5a3418'); // larguero
  const cl=summer?['#fffaec','#f0e2c4','#c8b490']:['#c0b090','#9a8a6a','#6a5a40'];
  R(g,5,1,8,27,PAL.k); R(g,6,2,6,25,cl[0]); R(g,10,2,2,25,cl[1]);
  for(let y=7;y<27;y+=6) R(g,6,y,6,1,cl[2]); R(g,6,2,1,25,cl[2]);
  if(!summer){ g.clearRect(7,9,4,4); g.clearRect(9,18,3,5); g.clearRect(10,2,3,3); PX(g,7,13,PAL.k); PX(g,8,23,PAL.k); } // lona rota
},14,34);}
function drawWindmillCienaga(){
  ctx.fillStyle='rgba(12,20,12,.3)'; ctx.fillRect(95,31,50,4);
  ctx.drawImage(windmillBody(),90,-28);
  const hx=120, hy=7, img=windmillSail(summered);
  for(let i=0;i<4;i++){ ctx.save(); ctx.translate(hx,hy); ctx.rotate(millSail+i*Math.PI/2+.35); ctx.drawImage(img,-3,-34); ctx.restore(); }
  ctx.fillStyle=PAL.k; ctx.fillRect(hx-3,hy-3,7,7); ctx.fillStyle='#8a5a2c'; ctx.fillRect(hx-2,hy-2,5,5); ctx.fillStyle='#f8b030'; ctx.fillRect(hx-1,hy-1,3,3); ctx.fillStyle='#fff0a0'; ctx.fillRect(hx-1,hy-1,1,1);
}
function drawMillBack(){
  if(sx===4&&sy===3) drawWindmillCienaga();
  for(let y=0;y<SH;y++) for(let x=0;x<SW;x++) if(grid[y][x]==='ψ') drawSwitch(x,y,x+','+y);
}
/* dentro del molino: haces de luz entre las tablas y las esquinas en penumbra */
let millVig=null, millRays=null;
function millAmbience(){
  if(!millVig){ millVig=mkCanvas(160,128); const g=millVig.getContext('2d'), gr=g.createRadialGradient(80,62,36,80,62,112);
    gr.addColorStop(0,'rgba(24,12,4,0)'); gr.addColorStop(1,'rgba(24,12,4,.55)'); g.fillStyle=gr; g.fillRect(0,0,160,128);
    millRays=mkCanvas(160,128); const h=millRays.getContext('2d');
    for(const [x0,w] of [[14,9],[58,5],[100,11]]){ const lg=h.createLinearGradient(0,0,0,128); lg.addColorStop(0,'rgba(255,224,150,.20)'); lg.addColorStop(.7,'rgba(255,224,150,.05)'); lg.addColorStop(1,'rgba(255,224,150,0)');
      h.fillStyle=lg; h.beginPath(); h.moveTo(x0,0); h.lineTo(x0+w,0); h.lineTo(x0+w+40,128); h.lineTo(x0+40,128); h.closePath(); h.fill(); } }
  ctx.save(); ctx.globalCompositeOperation='lighter'; ctx.globalAlpha=.7+.3*Math.sin(tick*.021); ctx.drawImage(millRays,0,0); ctx.restore();
  ctx.drawImage(millVig,0,0);
  if((tick&15)===0&&parts.length<140){ const r=[[14,9],[58,5],[100,11]][(tick>>4)%3], y=Math.random()*100; parts.push({k:'mote',x:r[0]+r[1]/2+y*40/128,y,vx:.05,vy:.08,life:70,max:70,sway:Math.random()*6,col:'#fff0c8',nog:true}); }
}
function drawMillFront(){
  if(dungeonOf(sx,sy)==='molino') millAmbience();
  for(const g of gusts) drawGust(g);
}
/* la ráfaga, en píxeles nítidos: un remolino en espiral (banda de 2 px, blanco en el ojo y azul pálido fuera) y dos estelas
   onduladas que se afinan hacia la cola, con contorno añil de 1 px para leerse en cualquier suelo. Se dibuja hacia la derecha
   y se gira a las otras direcciones transponiendo píxeles (sin rotar ni escalar). Caché por dirección, fotograma y fase */
const GUST_W=40, GUST_H=26, GUST_HX=30, GUST_HY=13, GUST_ART=new Map();
function gustArt(dir,f,ph,tl){ const key=dir+'|'+f+'|'+ph+'|'+tl; let c=GUST_ART.get(key); if(c) return c;
  const B=new Array(GUST_W*GUST_H).fill(null), R=ph===0?4.6:6.8, put=(x,y,col)=>{ x=Math.round(x); y=Math.round(y); if(x>=1&&y>=1&&x<GUST_W-1&&y<GUST_H-1) B[y*GUST_W+x]=col; };
  // las estelas: dos corrientes que ondulan, gruesas cerca del remolino y deshilachadas en la cola
  for(const side of [-1,1]) for(let x=GUST_HX-3;x>=Math.max(2,GUST_HX-tl);x--){ const d=GUST_HX-x, k=d/(GUST_HX-2); // tl: la estela solo llega hasta donde ya ha pasado (no tapa a Sprout al salir)
    if(ph>=2&&BAYER4[x&3][(side+1)]/16<(ph-1)*.4) continue; if(k>.55&&BAYER4[(x+f)&3][side+1&3]/16<(k-.55)*2.2) continue;
    const y=GUST_HY+side*(3.2+k*2.4+Math.sin(d*.42-f*.785+(side>0?1.6:0))*1.4);
    put(x,y,k<.5?'#ffffff':'#e8f6ff'); if(k<.7) put(x,y+1,'#a8d8f0'); }
  // el remolino: una espiral que gira
  for(let y=0;y<GUST_H;y++) for(let x=0;x<GUST_W;x++){ const dx=x+.5-GUST_HX, dy=(y+.5-GUST_HY)*1.12, r=Math.hypot(dx,dy); if(r>R) continue;
    if(ph>=2&&BAYER4[y&3][x&3]/16<(ph-1)*.4) continue;
    const a=((Math.atan2(dy,dx)+f*.785)%6.2832+6.2832)%6.2832, v=(r-a*.95+20)%6; if(r>1.6&&v>2.4) continue;
    B[y*GUST_W+x]=r<2.4?'#ffffff':r<R*.66?'#e8f6ff':'#a8d8f0'; }
  const vert=dir<2, W=vert?GUST_H:GUST_W, H=vert?GUST_W:GUST_H; c=mkCanvas(W,H); const g=c.getContext('2d');
  for(let y=0;y<GUST_H;y++) for(let x=0;x<GUST_W;x++){ const col=B[y*GUST_W+x]; if(!col) continue; g.fillStyle=col;
    if(dir===3) g.fillRect(x,y,1,1); else if(dir===2) g.fillRect(GUST_W-1-x,y,1,1); else if(dir===0) g.fillRect(y,x,1,1); else g.fillRect(y,GUST_W-1-x,1,1); }
  artOutline(g,W,H,'#3c3456'); GUST_ART.set(key,c); return c; }
function drawGust(g){ const dir=Math.abs(g.vx)>Math.abs(g.vy)?(g.vx>0?3:2):(g.vy>0?0:1), f=(g.t>>1)&7, ph=g.t<3?0:g.t>=g.life-3?3:g.t>=g.life-6?2:1, img=gustArt(dir,f,ph,Math.min(28,Math.round((g.t*3.2+4)/4)*4));
  const ox=dir===3?GUST_HX:dir===2?GUST_W-1-GUST_HX:GUST_HY, oy=dir===0?GUST_HX:dir===1?GUST_W-1-GUST_HX:GUST_HY;
  ctx.drawImage(img,Math.round(g.x-ox),Math.round(g.y-oy));
  if(ph<3) for(let i=0;i<4;i++){ const a=g.t*.32+i*1.5708, r=(8+Math.sin(g.t*.4+i)*1.5)*(ph===0?.7:1), x=Math.round(g.x+Math.cos(a)*r), y=Math.round(g.y+Math.sin(a)*r*.85), flip=((g.t>>1)+i)&1; // los papelitos de colores que la rodean
    ctx.fillStyle=PAL.k; ctx.fillRect(x-1,y-1,flip?4:3,flip?3:4); ctx.fillStyle=PIN_C4[i][0]; ctx.fillRect(x,y+(flip?1:0),flip?2:1,1); ctx.fillStyle=PIN_C4[i][1]; ctx.fillRect(x,y,flip?2:1,flip?1:2); } }
/* el molinillo en la mano mientras sopla: delante de Sprout, girando rápido y frenando (detrás si mira arriba) */
function drawPinHeld(){ if(pinT<=0||xItem!=='molinillo') return; const k=pinT/PIN_T, D=DIRV[player.dir];
  const spin=Math.floor((PIN_T-pinT)*(.5+k*1.6)), img=PIN_SPIN[((spin%6)+6)%6];
  const P=[[13,9],[14,1],[-1,3],[17,3]][player.dir], hx=player.x+P[0], hy=player.y+P[1]-Math.round(Math.sin(k*3.1416)*1.5); // abajo: delante; arriba: sobre el hombro, detrás; a los lados: por delante
  ctx.fillStyle='#6a4020'; ctx.fillRect(hx-1,hy+5,2,5); ctx.fillStyle='#b88048'; ctx.fillRect(hx-1,hy+5,1,5); ctx.fillStyle=PAL.k; ctx.fillRect(hx-2,hy+10,4,1);
  ctx.drawImage(img,Math.round(hx-7.5),Math.round(hy-7.5)); }
/* ---------- los bichos del molino, dibujados ---------- */
const MILL_ENEMY={crow:1,knight:1,root:1};
function drawMillEnemy(e){
  const flash=e.flash>4, x=e.x|0, y=e.y|0;
  if(e.type==='crow'){ const air=e.st==='swoop'||e.st==='back'||e.st==='caw';
    drawShadow(e.x+8,(e.st==='perch'||e.stun>0?e.y+14:e.y+22),air?3:4);
    let img=e.stun>0?CROW_A:air?(((tick>>2)&1)?CROW_B:CROW_C):CROW_A; if(flash) img=tintCached(img,'#ffffff');
    const flip=air?(e.vx||0)<0:(player.x<e.x); ctx.save(); ctx.translate(x+8,y+(air?Math.round(Math.sin(tick*.3)):0)+(e.stun>0?4:0)); if(flip) ctx.scale(-1,1); ctx.drawImage(img,-8,0); ctx.restore();
    if(e.stun>0) drawDizzy(e.x+8,e.y+4); return; }
  if(e.type==='knight'){ drawShadow(e.x+8,e.y+15,5);
    let img=(e.st==='walk'&&((tick>>3)&1))?KNIGHT_B:KNIGHT_A; if(flash) img=tintCached(img,'#ffffff');
    const lunge=e.st==='lunge'?Math.round((e.lx||0)):0, wob=e.st==='wind'?((tick&2)?1:-1):0;
    ctx.save(); ctx.translate(x+8+lunge+wob,y); if(e.face<0) ctx.scale(-1,1); ctx.drawImage(img,-8,0);
    if(!e.bare) ctx.drawImage(SHIELD_LEAF,3,3); ctx.restore();
    if(e.bare&&(tick&15)<8){ ctx.fillStyle='#ff6040'; ctx.fillRect(x+7,y-3,2,2); }
    if(e.stun>0) drawDizzy(e.x+8,e.y); return; }
  if(e.type==='root'){
    if(e.st==='hide'){ ctx.drawImage(ROOT_HIDE,x,y+((tick>>4)&1)); return; }
    drawShadow(e.x+8,e.y+15,5); let img=e.st==='grab'?ROOT_GRAB:ROOT_UP; if(flash) img=tintCached(img,'#ffffff');
    const rise=e.st==='grab'?0:0; ctx.drawImage(img,x,y-rise);
    if(e.stun>0) drawDizzy(e.x+8,e.y); }
}
/* ---------- el Espantapájaros y el Ciervo, dibujados ---------- */
function drawScare(m){
  if(m.st==='plant'&&(tick&4)){ ctx.strokeStyle='rgba(248,96,48,.55)'; ctx.lineWidth=1; ctx.beginPath(); ctx.ellipse(m.x+12,m.y+18,24,14,0,0,6.283); ctx.stroke(); } // el radio del giro
  drawShadow(m.x+12,m.y+23,Math.max(5,10-m.hz*.5));
  let img=m.flash>4?BOSS_WHITE.scare:BOSS_SPR.scare;
  ctx.save(); ctx.translate(m.x+12,m.y+24-m.hz);
  if(m.st==='spin'){ const s=Math.cos(m.spin); ctx.scale(Math.abs(s)<.15?.15*Math.sign(s||1):s,1); }
  else if(m.st==='dizzy') ctx.rotate(Math.sin(tick*.12)*.18);
  else if(m.st==='plant') ctx.translate((tick&2)?1:-1,0);
  else if(m.st==='hop'){ const sq=m.hz<2?.12:-.06; ctx.scale(1+sq,1-sq); }
  ctx.drawImage(img,-12,-24); ctx.restore();
  if(m.st==='dizzy') drawDizzy(m.x+12,m.y-2);
  if(m.st==='spin'&&(tick&3)<2){ ctx.strokeStyle='rgba(240,216,112,.45)'; ctx.lineWidth=1; ctx.beginPath(); ctx.arc(m.x+12,m.y+14,20,tick*.3,tick*.3+2.4); ctx.stroke(); }
}
function drawCiervo(b){
  if(b.st==='yield') glowAt(b.x+16,b.y+16,24,'rgba(252,216,120,'+(0.25+0.15*Math.sin(tick*.3)).toFixed(2)+')');
  if(b.st==='windup'&&b.ax!==undefined){ const cx=b.x+16, cy=b.y+28, a=(0.35+0.3*Math.sin(tick*.5)).toFixed(2); // huellas que marcan la embestida
    for(let i=2;i<9;i++){ const x=Math.round(cx+b.ax*i*11), y=Math.round(cy+b.ay*i*11); ctx.fillStyle='rgba(40,16,6,'+a+')'; ctx.fillRect(x-2,y-1,4,3); ctx.fillStyle='rgba(248,120,48,'+a+')'; ctx.fillRect(x-1,y-1,2,2); } }
  drawShadow(b.x+16,b.y+30,13);
  const bare=b.mantle===0, img=b.flash>5?(bare?CIERVO_BARE_W:BOSS_WHITE.ciervo):(bare?CIERVO_BARE:BOSS_SPR.ciervo);
  if(bare&&b.st!=='yield'&&(tick&7)<4) glowAt(b.x+16,b.y+10,18,'rgba(252,216,120,.3)');
  ctx.save(); ctx.translate(b.x+16+(b.st==='windup'?((tick&2)?1:-1):b.st==='stuck'?((tick&4)?1:-1):0),b.y+32);
  if(b.face<0) ctx.scale(-1,1);
  if(b.st==='charge') ctx.rotate(.08);
  if(b.st==='yield') ctx.scale(1.08,.8);
  ctx.drawImage(img,-16,-32); ctx.restore();
  if(b.st==='stuck') drawDizzy(b.x+16+b.face*8,b.y+2);
  if(bare&&b.exp>0&&b.st!=='yield'){ const k=b.exp/150; ctx.fillStyle=PAL.k; ctx.fillRect(b.x+4,b.y-4,24,3); ctx.fillStyle='#fcd878'; ctx.fillRect(b.x+5,b.y-3,Math.round(22*Math.min(1,k)),1); }
}
