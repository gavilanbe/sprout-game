import {loadAssets} from './assets.js';
import {HERO_STATES,HERO_PALETTE,characterFrame,drawCharacter} from './character-art.js';
import {createMotion,intent,requestMotion,stepMotion,motionAnimation,poseMotion} from './character-motion.js';
import {createWorld,blocked} from './world.js';
const $=id=>document.getElementById(id),keys=new Set(),stage=$('movement-stage'),g=stage.getContext('2d'),preview=$('hero-preview').getContext('2d');
let assets,p=createMotion(144,184),selected='walk',direction=0,playing=true,frame=0,poseClock=0,last=0,acc=0,visible=true;
const world=createWorld()[0];
function select(name){selected=name;poseClock=0;frame=0;const state=HERO_STATES[name];$('pose-name').textContent=state.label;$('frame-range').max=state.frames-1;$('pose-download').href=`assets/slice/hero-v2/${name}.png`;document.querySelectorAll('[data-state]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.state===name)));renderPreview();}
function renderPreview(){if(!assets)return;const state=HERO_STATES[selected];preview.imageSmoothingEnabled=false;preview.clearRect(0,0,80,80);preview.drawImage(characterFrame(assets.character,selected,direction,(frame+.1)/state.frames),0,0);$('pose-frame').textContent=`${frame+1} / ${state.frames}`;$('frame-range').value=frame;}
function setPlaying(next){playing=next;$('play-pose').textContent=next?'Pausar':'Reproducir';$('play-pose').setAttribute('aria-pressed',String(next));}
function drawScene(){
  if(!assets)return;g.imageSmoothingEnabled=false;g.clearRect(0,0,320,256);
  for(let y=0;y<8;y++)for(let x=0;x<10;x++){const ch=world.grid[y][x],id=ch==='p'?1:ch==='o'?3:0;g.drawImage(assets.props[id],x*32,y*32);}
  const actors=world.trees.map(([x,y])=>({y,draw:()=>g.drawImage(assets.props[4],x-32,y-61,64,64)}));
  world.rocks.forEach(([x,y])=>actors.push({y,draw:()=>g.drawImage(assets.props[6],x-16,y-29)}));world.bushes.forEach(([x,y])=>actors.push({y,draw:()=>g.drawImage(assets.props[5],x-16,y-30)}));
  actors.push({y:91,draw:()=>g.drawImage(assets.props[11],125,53,40,40)});actors.push({y:121,draw:()=>g.drawImage(assets.props[8],73,91)});
  const a=motionAnimation(p);actors.push({y:p.y,draw(){g.fillStyle='#183c354f';g.fillRect(Math.round(p.x-9),Math.round(p.y-3),18,5);drawCharacter(g,assets.character,a.name,p.dir,a.phase,p.x,p.y);}});actors.sort((a,b)=>a.y-b.y).forEach(a=>a.draw());
  $('motion-status').textContent=HERO_STATES[a.name].label.toUpperCase();
}
function key(code,repeat){if(['ArrowDown','ArrowLeft','ArrowRight','ArrowUp','KeyW','KeyA','KeyS','KeyD'].includes(code))keys.add(code);if(!repeat&&(code==='KeyZ'||code==='Space'))requestMotion(p,'attack',intent(keys));if(!repeat&&code==='KeyX')requestMotion(p,'dash',intent(keys));}
document.addEventListener('keydown',e=>{if(e.target.closest('input,select,button,a'))return;if(['ArrowDown','ArrowLeft','ArrowRight','ArrowUp','KeyW','KeyA','KeyS','KeyD','KeyZ','KeyX','Space'].includes(e.code)){e.preventDefault();key(e.code,e.repeat);}});
document.addEventListener('keyup',e=>keys.delete(e.code));window.addEventListener('blur',()=>{keys.clear();p.vx=p.vy=0;});document.addEventListener('visibilitychange',()=>{visible=!document.hidden;keys.clear();p.vx=p.vy=0;});
document.querySelectorAll('[data-key]').forEach(b=>{b.addEventListener('pointerdown',e=>{e.preventDefault();b.setPointerCapture(e.pointerId);key(b.dataset.key,false);});for(const name of ['pointerup','pointercancel','lostpointercapture'])b.addEventListener(name,()=>keys.delete(b.dataset.key));});
$('lab-reset').onclick=()=>{p=createMotion(144,184);keys.clear();stage.focus({preventScroll:true});};
document.querySelectorAll('[data-facing]').forEach(b=>b.onclick=()=>{direction=Number(b.dataset.facing);document.querySelectorAll('[data-facing]').forEach(a=>a.setAttribute('aria-pressed',String(a===b)));renderPreview();});
$('play-pose').onclick=()=>setPlaying(!playing);$('previous-frame').onclick=()=>{setPlaying(false);frame=(frame+HERO_STATES[selected].frames-1)%HERO_STATES[selected].frames;renderPreview();};$('next-frame').onclick=()=>{setPlaying(false);frame=(frame+1)%HERO_STATES[selected].frames;renderPreview();};$('frame-range').oninput=e=>{setPlaying(false);frame=Number(e.target.value);renderPreview();};
$('preview-scale').onchange=e=>{const n=Number(e.target.value)*80;$('hero-preview').style.width=n+'px';$('hero-preview').style.height=n+'px';};$('preview-background').onchange=e=>$('preview-stage').className='preview-stage '+e.target.value;
function loop(now){const dt=Math.min(.25,(now-last)/1000||0);last=now;if(visible){acc+=dt;while(acc>=1/60){stepMotion(p,intent(keys),1/60,(x,y)=>blocked(world,x,y));p.events.length=0;acc-=1/60;}if(playing){poseClock+=dt;frame=Math.floor(poseClock/HERO_STATES[selected].seconds*HERO_STATES[selected].frames)%HERO_STATES[selected].frames;}}
  drawScene();renderPreview();if(assets)for(const [name,state] of Object.entries(HERO_STATES)){const c=document.querySelector(`[data-thumb="${name}"]`).getContext('2d');c.imageSmoothingEnabled=false;c.clearRect(0,0,80,80);c.drawImage(characterFrame(assets.character,name,direction,(now/1000%state.seconds)/state.seconds),0,0);}
  requestAnimationFrame(loop);
}
try{assets=await loadAssets();$('lab-loading').hidden=true;$('workbench').hidden=false;
  for(const [name,state] of Object.entries(HERO_STATES)){const button=document.createElement('button');button.className='animation-card';button.dataset.state=name;button.innerHTML=`<canvas data-thumb="${name}" width="80" height="80" aria-label="${state.label}"></canvas><strong>${state.label}</strong><small>${state.frames} FOTOGRAMAS × 4 DIRECCIONES</small>`;button.onclick=()=>select(name);$('animation-grid').append(button);}
  for(const color of HERO_PALETTE){const swatch=document.createElement('span');swatch.style.background=color;swatch.title=color;$('hero-palette').append(swatch);}select('walk');
  if(new URLSearchParams(location.search).has('test'))window.__characterLab={info:()=>({selected,direction,frame,playing,player:{...p},animation:motionAnimation(p)}),pose(name){poseMotion(p,name,HERO_STATES[name].seconds);}};
  requestAnimationFrame(loop);
}catch(error){$('lab-loading').textContent='No se pudo cargar el kit de Sprout. Recarga para intentarlo de nuevo.';console.error(error);}
