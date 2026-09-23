import {loadAssets,makeCanvas} from './assets.js';
import {ROOMS,createWorld,blocked,hit,WIDTH,HEIGHT,FIELD} from './world.js';
import {print,lines} from './pixels.js';
import {createMotion,intent,requestMotion,stepMotion,motionAnimation,poseMotion,MOTION} from './character-motion.js';
import {drawCharacter,characterFrame,HERO_STATES,HERO_CELL} from './character-art.js';

const $=id=>document.getElementById(id), canvas=$('game'),g=canvas.getContext('2d');
g.imageSmoothingEnabled=false;
const DIRS=[[0,1],[-1,0],[1,0],[0,-1]],keyDir={ArrowDown:0,KeyS:0,ArrowLeft:1,KeyA:1,ArrowRight:2,KeyD:2,ArrowUp:3,KeyW:3};
const keys=new Set(), assetDialog=$('assets-dialog'), reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
let assets,world,room=0,p,mode='loading',time=0,elapsed=0,visited,seed=false,planted=false,dialog=null,particles=[],transition=0,roomTitle=0,toast='',toastTime=0;
let audioContext,sound=false,musicClock=0,musicNote=0,previewDir=0,previewAnimation='walk',previousMode='title',attackSerial=0;
let completionPending=false,roomSlide=null;
const backgrounds=new Map();
function announce(message){$('announcement').textContent=message;}
function setMode(next){mode=next;for(const [id,state] of [['start-screen','title'],['pause-screen','paused'],['complete-screen','complete']])$(id).hidden=next!==state;$('pause').disabled=!['play','paused'].includes(next);$('pause').textContent=next==='paused'?'Continuar':'Pausar';keys.clear();}
function reset(){
  world=createWorld();room=0;p={...createMotion(),hp:5,inv:0};
  elapsed=0;visited=new Set([0]);seed=false;planted=false;dialog=null;particles=[];transition=0;roomSlide=null;roomTitle=0;toastTime=0;attackSerial=0;completionPending=false;backgrounds.clear();syncUI();setMode('title');
}
function syncUI(){
  $('place-name').textContent=planted&&room===0?'El claro despierto':ROOMS[room].name;
  $('place-description').innerHTML=planted&&room===0?'Una semilla era suficiente.<br>El bosque vuelve a respirar.':ROOMS[room].description;
  document.querySelector('.chapter-number').innerHTML=`0${room+1}<span>/ 03</span>`;
  document.querySelectorAll('[data-room]').forEach(e=>e.classList.toggle('current',Number(e.dataset.room)===room));
  const progress=[visited.has(1),seed,planted];
  ['explore','seed','plant'].forEach((id,i)=>{const e=$(`quest-${id}`);e.classList.toggle('done',progress[i]);e.classList.toggle('active',!progress[i]&&(i===0||progress[i-1]));e.querySelector('.quest-marker').textContent=progress[i]?'✓':`0${i+1}`;});
  $('hint').innerHTML=planted?'Ya hay flores donde antes había silencio.':seed?'La semilla te está esperando en el zurrón. Vuelve al altar y pulsa <kbd>Z</kbd>.':room===0?'Las hojas abren caminos.<br>Acércate a Tilo y pulsa <kbd>Z</kbd>.':room===1?'Corta el arbusto del puente con <kbd>Z</kbd>. <kbd>X</kbd> te ayuda a esquivar.':'Haz retroceder a los dos limos con la hoja. Después, abre el cofre con <kbd>Z</kbd>.';
}
function say(who,message,after){dialog={who,message,after,age:0};keys.clear();p.vx=p.vy=0;p.moving=false;announce(`${who}: ${message}`);}
function notice(message){toast=message;toastTime=2.4;announce(message);}
function start(){setMode('play');canvas.focus({preventScroll:true});roomTitle=2.5;say('TILO','El claro ha perdido su semilla. Sigue el sendero hacia el este. Tu hoja puede apartar los arbustos y a los limos.');}
function togglePause(){if(mode==='play')setMode('paused');else if(mode==='paused'){setMode('play');canvas.focus({preventScroll:true});}}
function tone(frequency,duration=.1,type='square',volume=.035,slide=0){
  if(!sound||!audioContext)return;
  const now=audioContext.currentTime,osc=audioContext.createOscillator(),gain=audioContext.createGain();
  osc.type=type;osc.frequency.setValueAtTime(frequency,now);if(slide)osc.frequency.exponentialRampToValueAtTime(Math.max(30,slide),now+duration);
  gain.gain.setValueAtTime(volume,now);gain.gain.exponentialRampToValueAtTime(.0001,now+duration);osc.connect(gain);gain.connect(audioContext.destination);osc.start(now);osc.stop(now+duration);
}
function enableAudio(){try{audioContext??=new (window.AudioContext||window.webkitAudioContext)();audioContext.resume().catch(()=>{});sound=!sound;$('sound').textContent=sound?'♪ Sonido activado':'♪ Sonido desactivado';$('sound').setAttribute('aria-pressed',String(sound));tone(660,.12);}catch{notice('Audio no disponible en este navegador.');}}
function music(dt){
  if(!sound||mode!=='play'||dialog||document.hidden)return;
  musicClock-=dt;if(musicClock>0)return;musicClock=.27;
  const notes=[64,0,67,71,69,0,67,0,62,0,64,67,64,0,62,0,60,0,64,67,69,0,71,0,67,0,64,62,60,0,0,0];
  const n=notes[musicNote++%notes.length];if(n)tone(440*2**((n-69)/12),.21,'triangle',.028);
  if(musicNote%4===0)tone(440*2**(([48,48,45,43][Math.floor(musicNote/8)%4]-69)/12),.3,'triangle',.022);
}
function burst(x,y,color,n=10){for(let i=0;i<(reduced?Math.min(4,n):n);i++)particles.push({x,y,vx:(Math.random()-.5)*65,vy:-12-Math.random()*50,life:.4+Math.random()*.4,color});}
function moveRoom(next){const old=makeCanvas(320,256);drawWorld(true);old.getContext('2d').drawImage(canvas,0,0,320,256,0,0,320,256);roomSlide={image:old,direction:next>room?1:-1};room=next;visited.add(room);p.x=next>previousRoom?9:311;p.prevX=p.x;p.y=Math.min(187,Math.max(168,p.y));transition=.18;roomTitle=2.2;p.inv=Math.max(p.inv,.4);syncUI();tone(440,.07,'triangle');}
let previousRoom=0;
function nearby(x,y,range=37){return Math.hypot(p.x-x,p.y-y)<range;}
function facing(x,y,range=39){if(!nearby(x,y,range))return false;return (x-p.x)*DIRS[p.dir][0]+(y-p.y)*DIRS[p.dir][1]>2;}
function finish(){setMode('complete');$('completion-copy').textContent=`Has devuelto la primavera al Valle Raíz en ${Math.floor(elapsed/60)}:${String(Math.floor(elapsed%60)).padStart(2,'0')}.`;}
function interact(){
  if(room===0&&facing(89,121,39)){poseMotion(p,'interact',.3);say('TILO',planted?'Mira esas flores. A veces, todo lo que necesita un bosque es que alguien vuelva.':seed?'La has encontrado. El altar de piedra está aquí, a mi derecha. Acércate y pulsa Z para plantarla.':'La semilla está en el cofre de la arboleda. Cruza el arroyo hacia el este. Corta con Z y esquiva con X.');return true;}
  if(room===0&&facing(145,91,39)){
    if(planted)say('EL ALTAR','Una nueva raíz. Un nuevo comienzo.');
    else if(seed){planted=true;poseMotion(p,'plant',.65);backgrounds.clear();burst(145,78,'#f4dfa2',36);syncUI();tone(523,.2,'triangle');setTimeout(()=>tone(784,.25,'triangle'),150);say('SPROUT','Una semilla. Un poco de tierra. Y las ganas de volver a crecer.',()=>{if(p.pose)completionPending=true;else finish();});}
    else say('EL ALTAR','La piedra está fría. Aquí falta una semilla.');
    return true;
  }
  if(room===2&&facing(244,93,38)){
    if(seed)say('EL COFRE','Ya llevas la semilla. El claro queda al oeste.');
    else if(world[2].slimes.some(e=>e.hp>0))say('EL COFRE','Los dos limos guardan el cofre. Apártalos con tu hoja antes de abrirlo.');
    else{seed=true;poseMotion(p,'carry',.7);syncUI();burst(244,78,'#f4dfa2',22);tone(784,.25,'triangle');say('SEMILLA DORADA','Pequeña como una bellota. Grande como un bosque. Vuelve al claro y plántala en el altar.');}
    return true;
  }
  return false;
}
function useAction(){
  if(mode==='title'){start();return;}
  if(mode!=='play')return;
  if(dialog){if(dialog.age<.16)return;const after=dialog.after;dialog=null;keys.clear();after?.();return;}
  const input=intent(keys);if(input.dir!==null&&!p.attack&&!p.dash)p.dir=input.dir;
  if(!p.cooldown&&!p.dash&&!p.pose&&interact())return;
  requestMotion(p,'attack',input);
}
function strike(){
  const [dx,dy]=DIRS[p.dir],cx=p.x+dx*25,cy=p.y-12+dy*23;
  const area={x:cx-19,y:cy-19,w:38,h:38},r=world[room];
  for(let y=0;y<8;y++)for(let x=0;x<10;x++)if(r.grid[y][x]==='B'&&hit(area,{x:x*32+5,y:y*32+5,w:22,h:27})){
    r.grid[y][x]='p';backgrounds.delete(room);burst(x*32+16,y*32+15,'#b7d171',15);notice('El sendero vuelve a abrirse.');tone(400,.08,'triangle');
  }
  r.bushes.forEach(([x,y],i)=>{if(!r.cut.has(i)&&hit(area,{x:x-13,y:y-23,w:26,h:23})){r.cut.add(i);burst(x,y-10,'#b7d171',12);}});
  r.slimes.forEach(e=>{if(e.hp<=0||e.lastAttack===attackSerial)return;if(hit(area,{x:e.x-12,y:e.y-22,w:24,h:22})){
    e.hp--;e.hit=.3;e.lastAttack=attackSerial;const nx=e.x+dx*14,ny=e.y+dy*14;if(!blocked(r,nx,ny)){e.x=nx;e.y=ny;}burst(e.x,e.y-12,'#d3e798',8);tone(480,.07,'square',.025);
    if(e.hp<=0){burst(e.x,e.y-10,'#adcc73',15);if(room===2&&r.slimes.every(s=>s.hp<=0))notice('El cofre ya está a salvo.');}
  }});
}
function dash(){if(mode!=='play'||dialog)return;requestMotion(p,'dash',intent(keys));}
function hurt(){
  if(p.inv>0||p.dash>0||p.pose||planted)return;p.hp--;p.inv=1.1;p.hurt=.22;p.attack=0;burst(p.x,p.y-12,'#d59866',7);tone(130,.18,'square',.025,65);
  if(p.hp<=0){p.inv=2;poseMotion(p,'wilt',.7);}
}
function motionEvents(){
  for(const event of p.events.splice(0)){
    // Each swing gets a fresh serial, even if the motion state was recreated (p.attackId restarts at 0).
    if(event==='attack'){attackSerial++;tone(270,.11,'triangle',.045,90);}
    if(event==='dash')tone(180,.12,'triangle',.035,450);
    if(event==='end:wilt'){room=0;p.x=p.prevX=144;p.y=p.prevY=184;p.hp=5;p.hurt=0;p.inv=1.5;transition=0;roomSlide=null;poseMotion(p,'rebloom',.55);syncUI();}
    if(event==='end:rebloom')notice('Un nuevo brote. El camino sigue abierto.');
    if(event==='end:plant'&&completionPending){completionPending=false;finish();}
  }
}
function update(dt){
  time+=dt;music(dt);
  if(mode!=='play')return;
  if(dialog){dialog.age+=dt;if(p.pose){stepMotion(p,{x:0,y:0,dir:null},dt);motionEvents();}return;}
  elapsed+=dt;transition=Math.max(0,transition-dt);roomTitle=Math.max(0,roomTitle-dt);toastTime=Math.max(0,toastTime-dt);p.inv=Math.max(0,p.inv-dt);
  stepMotion(p,intent(keys),dt,(x,y)=>{
    const atExit=Math.floor((y-4)/32)===5;
    if(atExit&&(x<9&&room>0||x>311&&room<2))return false;
    return blocked(world[room],x,y);
  });
  motionEvents();if(mode!=='play')return;
  if((p.x<9&&room>0||p.x>311&&room<2)&&Math.floor((p.y-4)/32)===5){previousRoom=room;moveRoom(room+(p.x<9?-1:1));}
  const age=MOTION.attackDuration-p.attack;
  if(p.attack>0&&age>=MOTION.attackActive[0]&&age<=MOTION.attackActive[1])strike();
  if(keys.has('KeyZ')&&p.cooldown===0&&!p.pose)useAction();
  if(dialog||mode!=='play')return;
  for(const e of world[room].slimes){
    if(e.hp<=0)continue;e.t+=dt;e.hit=Math.max(0,e.hit-dt);if(e.hit>0||planted||p.pose)continue;
    const ex=p.x-e.x,ey=p.y-e.y,dist=Math.hypot(ex,ey),chase=dist<91;
    const tx=chase?p.x:e.homeX+Math.cos(e.t*.65)*20,ty=chase?p.y:e.homeY+Math.sin(e.t*.8)*16;
    const angle=Math.atan2(ty-e.y,tx-e.x),hop=Math.sin(e.t*5)>-.3,step=(chase?23:12)*dt*(hop?1:0);
    const nx=e.x+Math.cos(angle)*step,ny=e.y+Math.sin(angle)*step;
    if(!blocked(world[room],nx,e.y))e.x=nx;if(!blocked(world[room],e.x,ny))e.y=ny;
    if(dist<17){hurt();if(dialog)break;}
  }
  particles=particles.filter(q=>{q.life-=dt;q.x+=q.vx*dt;q.y+=q.vy*dt;q.vy+=85*dt;return q.life>0;});
}
function image(index,x,y,w=32,h=w){g.drawImage(assets.props[index],Math.round(x),Math.round(y),w,h);}
function shadow(x,y,w=20){g.fillStyle='#233d354d';g.fillRect(Math.round(x-w/2),Math.round(y-4),w,5);g.fillRect(Math.round(x-w/2+3),Math.round(y-5),w-6,7);}
function background(){
  if(backgrounds.has(room))return backgrounds.get(room);
  const c=makeCanvas(WIDTH,FIELD),ctx=c.getContext('2d'),r=world[room];
  for(let y=0;y<8;y++)for(let x=0;x<10;x++){
    const ch=r.grid[y][x],id=ch==='w'||ch==='b'?2:ch==='p'||ch==='B'?1:ch==='o'?3:0;
    ctx.drawImage(assets.props[id],x*32,y*32);
    if(ch==='b'){
      // The source bridge runs north/south; this crossing runs east/west.
      ctx.save();ctx.beginPath();ctx.rect(x*32,y*32,32,32);ctx.clip();ctx.translate(x*32+16,y*32+16);ctx.rotate(Math.PI/2);ctx.drawImage(assets.props[7],-16,-18,32,36);ctx.restore();
    }
    if(ch==='p'||ch==='B'){
      // A narrow grass lip follows the generated path tiles.
      ctx.fillStyle='#87a952';if(r.grid[y-1]?.[x]!==ch&&r.grid[y-1]?.[x]!=='p')ctx.fillRect(x*32,y*32,32,2);
      if(r.grid[y+1]?.[x]!==ch&&r.grid[y+1]?.[x]!=='p')ctx.fillRect(x*32,y*32+30,32,2);
    }
  }
  for(const [x,y] of r.flowers)ctx.drawImage(assets.props[15],x-12,y-23,24,24);
  if(planted){for(let i=0;i<25;i++){const x=37+(i*71)%246,y=44+(i*47)%168;if(r.grid[Math.floor(y/32)]?.[Math.floor(x/32)]==='.')ctx.drawImage(assets.props[15],x-8,y-16,20,20);}}
  backgrounds.set(room,c);return c;
}
function drawPlayer(x=p.x,y=p.y){
  shadow(x,y,19);const a=motionAnimation(p);
  g.globalAlpha=p.inv>0&&Math.floor(time*12)%2===0?.58:1;
  drawCharacter(g,assets.character,a.name,p.dir,a.phase,x,y);g.globalAlpha=1;
  if(p.dash>0&&!reduced){g.fillStyle='#e4efb9aa';for(let i=0;i<3;i++)g.fillRect(Math.round(x-DIRS[p.dir][0]*(16+i*6)),Math.round(y-14-DIRS[p.dir][1]*(16+i*6)),3,2);}
}
function promptTarget(){
  if(room===0){if(facing(89,121,39))return[89,76];if(facing(145,91,39))return[145,43];}
  if(room===2&&facing(244,93,38))return[244,48];return null;
}
function drawWorld(hidePlayer=false){
  g.drawImage(background(),0,0);const r=world[room],actors=[];
  if(room===1){g.fillStyle='#b1d4ba99';for(let i=0;i<11;i++){const yy=(i*27+Math.floor(time*9))%256;if(yy>158&&yy<194)continue;g.fillRect(134+(i*13)%42,yy,5+(i%3)*3,1);}}
  r.trees.forEach(([x,y])=>actors.push({y,draw(){shadow(x,y,42);image(4,x-32,y-61,64);}}));
  r.rocks.forEach(([x,y])=>actors.push({y,draw(){shadow(x,y,26);image(6,x-16,y-29);}}));
  r.bushes.forEach(([x,y],i)=>{if(!r.cut.has(i))actors.push({y,draw(){shadow(x,y);image(5,x-16,y-30);}});});
  r.grid.forEach((row,y)=>row.forEach((ch,x)=>{if(ch==='B')actors.push({y:y*32+30,draw(){image(5,x*32,y*32);}});}));
  if(room===0){
    actors.push({y:91,draw(){shadow(145,91,27);image(11,125,53,40);if(planted){image(14,130,42,30);g.fillStyle='#d4e49a';g.fillRect(143,40,2,2);}}});
    actors.push({y:121,draw(){shadow(89,121);image(8,73,91+(Math.floor(time*.6)%2),32);}});
  }
  if(room===2)actors.push({y:93,draw(){shadow(244,93,24);image(seed?13:12,228,65);if(!seed&&r.slimes.every(e=>e.hp<=0)&&Math.floor(time*3)%2){g.fillStyle='#fff0c2';g.fillRect(242,58,3,7);g.fillRect(240,60,7,3);}}});
  r.slimes.forEach(e=>{if(e.hp>0)actors.push({y:e.y,draw(){shadow(e.x,e.y,20);const frame=Math.sin(e.t*5)>0?10:9;g.globalAlpha=e.hit>0&&Math.floor(e.hit*30)%2?.45:1;image(frame,e.x-16,e.y-30);g.globalAlpha=1;}});});
  if(!hidePlayer)actors.push({y:p.y,draw:()=>drawPlayer()});actors.sort((a,b)=>a.y-b.y).forEach(a=>a.draw());
  // A few slow drifting leaf motes keep the scene alive without obscuring sprites.
  if(!reduced){for(let i=0;i<8;i++){const x=(i*67+time*(2+i%3))%320,y=(i*39+Math.sin(time*.8+i)*4)%250;g.fillStyle=i%2?'#e6e7ab88':'#f9edc977';g.fillRect(Math.floor(x),Math.floor(y),2,1);}}
  particles.forEach(q=>{g.fillStyle=q.color;g.fillRect(Math.round(q.x),Math.round(q.y),2,2);});
  const target=promptTarget();if(target&&mode==='play'&&!dialog){const [x,y]=target;g.fillStyle='#203b32';g.fillRect(x-7,y-1,15,13);g.fillStyle='#f4dfa2';g.fillRect(x-6,y,13,11);print(g,'Z',x-2,y+2,'#203b32');}
  if(roomTitle>0&&!dialog&&mode==='play'){const name=ROOMS[room].name.toUpperCase();const w=name.length*6+18;g.fillStyle='#203b32e8';g.fillRect(Math.floor((320-w)/2),12,w,19);print(g,name,Math.floor((320-name.length*6)/2),18);}
}
function drawHUD(){
  g.fillStyle='#20382c';g.fillRect(0,256,320,32);g.fillStyle='#849757';g.fillRect(0,256,320,1);
  for(let i=0;i<5;i++){const x=10+i*12;g.fillStyle=i<p.hp?'#ebc577':'#526243';g.fillRect(x,263,3,3);g.fillRect(x+5,263,3,3);g.fillRect(x-1,266,10,3);g.fillRect(x+1,269,6,2);g.fillRect(x+3,271,2,2);}
  print(g,'SPROUT',10,278,'#a8ba85');
  g.fillStyle='#4b6041';g.fillRect(77,262,1,21);print(g,'Z',86,263);print(g,'HOJA',100,263,'#c7d298');print(g,'X',86,277);print(g,p.dashCooldown>0?'...':'PASO',100,277,p.dashCooldown>0?'#738962':'#c7d298');
  image(14,145,257,28);print(g,seed?'1/1':'0/1',176,264);print(g,planted?'PLANTADA':'SEMILLA',166,278,'#a8ba85');
  const label=planted?'PRIMAVERA':room===0?'EL CLARO':room===1?'EL ARROYO':'ARBOLEDA';print(g,label,319-label.length*6-9,264,'#d5dbb0');print(g,'0'+(room+1)+' / 03',258,278,'#a8ba85');
}
function drawDialog(){
  const top=p.y>128?15:166;
  g.fillStyle='#152c23';g.fillRect(10,top,300,75);g.fillStyle='#bed085';g.fillRect(11,top+1,298,1);g.fillRect(11,top+73,298,1);g.fillRect(11,top+1,1,73);g.fillRect(308,top+1,1,73);
  print(g,dialog.who,21,top+10,'#d6e49e');lines(dialog.message,45).slice(0,4).forEach((line,i)=>print(g,line,21,top+24+i*11,'#f4dfa2'));
  print(g,'Z >',279,top+62,'#d6e49e');
}
function draw(){
  if(!assets||!p)return;g.imageSmoothingEnabled=false;g.clearRect(0,0,WIDTH,HEIGHT);
  const sliding=transition>0&&roomSlide;drawWorld(!!sliding);
  if(sliding){const next=makeCanvas(320,256);next.getContext('2d').drawImage(canvas,0,0,320,256,0,0,320,256);const t=1-transition/.18,k=t*t*(3-2*t),offset=Math.round(k*320),dir=roomSlide.direction;g.save();g.beginPath();g.rect(0,0,320,256);g.clip();g.clearRect(0,0,320,256);g.drawImage(roomSlide.image,-dir*offset,0);g.drawImage(next,dir*(320-offset),0);drawPlayer(p.x+dir*(320-offset),p.y);g.restore();}
  drawHUD();if(dialog&&mode==='play')drawDialog();
  else if(toastTime>0&&mode==='play'){const w=Math.min(306,toast.length*6+16);g.fillStyle='#203b32ef';g.fillRect((320-w)/2,226,w,20);print(g,toast,(320-toast.length*6)/2,233,'#f4dfa2');}
}
function resize(){
  const mobile=innerWidth<=820,side=mobile?0:innerWidth<=1190?215:410;
  const available=Math.max(320,innerWidth-(mobile?56:innerWidth*.1+side+34));
  // Integer CSS scale: no fractional stretching, even on high-DPI displays.
  const scale=Math.max(1,Math.min(3,Math.floor(available/320),Math.floor(Math.max(288,innerHeight-(mobile?180:300))/288)));
  document.documentElement.style.setProperty('--pixel-scale',scale);$('screen-scale').textContent=`320 × 288 · ${scale}×`;
}
function openAssets(){if(mode==='loading'||mode==='error')return;previousMode=mode;keys.clear();mode='inspector';assetDialog.showModal();}
function closeAssets(){assetDialog.close();}
assetDialog.addEventListener('close',()=>{setMode(previousMode);if(previousMode==='play')canvas.focus({preventScroll:true});});
$('show-assets').onclick=openAssets;$('close-assets').onclick=closeAssets;
document.querySelectorAll('[data-direction]').forEach(button=>button.onclick=()=>{previewDir=Number(button.dataset.direction);document.querySelectorAll('[data-direction]').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));});
document.querySelectorAll('[data-animation]').forEach(button=>button.onclick=()=>{previewAnimation=button.dataset.animation;document.querySelectorAll('[data-animation]').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));});
$('start').onclick=start;$('resume').onclick=()=>{setMode('play');canvas.focus({preventScroll:true});};$('continue').onclick=()=>{setMode('play');canvas.focus({preventScroll:true});};$('replay').onclick=()=>{reset();start();};
$('pause').onclick=togglePause;$('restart').onclick=()=>{if(assets)reset();};$('sound').onclick=enableAudio;
function keyDown(code,repeat=false){
  if(mode==='loading'||mode==='error'||mode==='inspector')return;
  if(code==='Enter'||code==='Escape'){if(repeat)return;if(mode==='title')start();else if(mode==='complete'){$('continue').click();}else togglePause();return;}
  if(mode!=='play'&&code!=='KeyZ')return;
  if(code in keyDir){keys.add(code);return;}
  if(!repeat&&(code==='KeyZ'||code==='Space')){const wasDialog=!!dialog;useAction();if(!wasDialog&&p?.attack>0&&!dialog&&mode==='play'&&code==='KeyZ')keys.add(code);}
  if(!repeat&&code==='KeyX')dash();
}
addEventListener('keydown',event=>{
  if(assetDialog.open)return;
  const isButton=event.target instanceof HTMLElement&&!!event.target.closest('button,a');
  if(isButton&&(event.code==='Enter'||event.code==='Space'))return;
  if(event.code in keyDir||['KeyZ','KeyX','Enter','Escape','Space'].includes(event.code)){event.preventDefault();keyDown(event.code,event.repeat);}
});
addEventListener('keyup',event=>keys.delete(event.code));
document.querySelectorAll('[data-key]').forEach(button=>{
  button.addEventListener('pointerdown',e=>{e.preventDefault();button.setPointerCapture(e.pointerId);keyDown(button.dataset.key);});
  for(const ev of ['pointerup','pointercancel','lostpointercapture'])button.addEventListener(ev,()=>keys.delete(button.dataset.key));
});
addEventListener('blur',()=>{keys.clear();if(mode==='play')setMode('paused');});
document.addEventListener('visibilitychange',()=>{if(document.hidden){keys.clear();if(mode==='play')setMode('paused');}});
addEventListener('resize',resize);resize();
let last=0,accumulator=0;
function loop(now){
  const dt=Math.min(.25,(now-last)/1000||0);last=now;
  if(!window.__sliceManual){accumulator+=dt;while(accumulator>=1/60){update(1/60);accumulator-=1/60;}}
  draw();
  if(assets){
    const b=$('botanical').getContext('2d');b.imageSmoothingEnabled=false;b.clearRect(0,0,96,100);b.save();b.scale(2,2);drawCharacter(b,assets.character,'idle',0,(now/1000%1.8)/1.8,24,47);b.restore();
    if(assetDialog.open){const state=HERO_STATES[previewAnimation],phase=(now/1000%state.seconds)/state.seconds,frame=Math.floor(phase*state.frames);const c=$('sprite-preview').getContext('2d');c.imageSmoothingEnabled=false;c.clearRect(0,0,160,160);c.drawImage(characterFrame(assets.character,previewAnimation,previewDir,phase),0,0,160,160);$('frame-label').textContent=`${['SUR','OESTE','ESTE','NORTE'][previewDir]} · ${state.label.toUpperCase()} · ${frame+1} / ${state.frames}`;}
  }
  requestAnimationFrame(loop);
}
try{
  assets=await loadAssets();$('loading').hidden=true;reset();
  if(new URLSearchParams(location.search).has('test'))window.__slice={
    info:()=>({mode,room,player:{...p},seed,planted,visited:[...visited],enemies:world[room].slimes.map(e=>({...e})),grid:world[room].grid.map(r=>r.join('')),dialog:dialog?.message,assets:assets.masters,smoothing:g.imageSmoothingEnabled}),
    step(n=1){for(let i=0;i<n;i++)update(1/60);draw();},key: keyDown,release:code=>keys.delete(code),
    place(r,x,y,dir=0){room=r;Object.assign(p,createMotion(x,y),{dir});p.inv=0;transition=0;roomSlide=null;dialog=null;setMode('play');visited.add(r);syncUI();},
    damage(){p.inv=0;hurt();}, animation:()=>motionAnimation(p),settle(){world[room].slimes.forEach(e=>{e.x=e.homeX;e.y=e.homeY;});},reset,
  };
  requestAnimationFrame(loop);
}catch(error){setMode('error');$('loading').innerHTML='<strong>No se pudo cargar el bosque.</strong><span>Comprueba la conexión y vuelve a intentarlo.</span><button class="primary" id="retry">Reintentar</button>';$('retry').onclick=()=>location.reload();$('show-assets').disabled=true;announce('Error al cargar los sprites.');console.error(error);}
