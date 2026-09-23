// Shared by the actual game and the character workshop. Pixels/seconds, fixed step.
export const FACING=[[0,1],[-1,0],[1,0],[0,-1]];
export const MOTION={speed:92,acceleration:2200,deceleration:3000,stride:48,attackDuration:.30,attackActive:[.09,.22],attackCooldown:.31,dashDuration:.22,dashCooldown:.58,buffer:.12};
export function createMotion(x=144,y=184){return {x,y,prevX:x,prevY:y,vx:0,vy:0,dir:0,distance:0,idleTime:0,moving:false,attack:0,attackId:0,cooldown:0,dash:0,dashCooldown:0,hurt:0,pose:null,poseTime:0,poseDuration:0,bufferAction:null,bufferTime:0,events:[]};}
export function intent(keys){
  let x=0,y=0,dir=null;
  const map={ArrowDown:0,KeyS:0,ArrowLeft:1,KeyA:1,ArrowRight:2,KeyD:2,ArrowUp:3,KeyW:3};
  // Aliases never double the speed. Opposing held keys cancel on that axis.
  for(const key of keys){if(map[key]!==undefined){dir=map[key];}}
  x=Number(keys.has('ArrowRight')||keys.has('KeyD'))-Number(keys.has('ArrowLeft')||keys.has('KeyA'));
  y=Number(keys.has('ArrowDown')||keys.has('KeyS'))-Number(keys.has('ArrowUp')||keys.has('KeyW'));
  if(!x&&!y)dir=null;else if(dir!==null&&!(FACING[dir][0]*x||FACING[dir][1]*y))dir=x?(x<0?1:2):(y<0?3:0);
  const length=Math.hypot(x,y)||1;return {x:x/length,y:y/length,dir};
}
export function requestMotion(p,action,input={x:0,y:0,dir:null}){
  if(p.pose||p.hurt>0)return false;
  if(input.dir!==null&&input.dir!==undefined&&!p.attack&&!p.dash)p.dir=input.dir;
  const ready=action==='attack'?!p.attack&&!p.dash&&p.cooldown<=0:!p.dash&&!p.attack&&p.dashCooldown<=0;
  if(!ready){p.bufferAction=action;p.bufferTime=MOTION.buffer;return false;}
  p.bufferAction=null;p.bufferTime=0;
  if(action==='attack'){p.attack=MOTION.attackDuration;p.cooldown=MOTION.attackCooldown;p.attackId++;}
  else{p.dash=MOTION.dashDuration;p.dashCooldown=MOTION.dashCooldown;}
  p.events.push(action);return true;
}
export function poseMotion(p,pose,duration){p.pose=pose;p.poseTime=0;p.poseDuration=duration;p.attack=p.dash=p.vx=p.vy=0;p.moving=false;p.bufferAction=null;}
function approach(value,target,amount){return value<target?Math.min(value+amount,target):Math.max(value-amount,target);}
function slide(p,dx,dy,isBlocked){
  const steps=Math.max(1,Math.ceil(Math.max(Math.abs(dx),Math.abs(dy))/2));
  for(let i=0;i<steps;i++){
    const x=p.x+dx/steps,y=p.y+dy/steps;
    if(!isBlocked(x,p.y))p.x=x;else p.vx=0;
    if(!isBlocked(p.x,y))p.y=y;else p.vy=0;
  }
}
export function stepMotion(p,input,dt,isBlocked=()=>false){
  p.prevX=p.x;p.prevY=p.y;
  p.cooldown=Math.max(0,p.cooldown-dt);p.dashCooldown=Math.max(0,p.dashCooldown-dt);p.hurt=Math.max(0,p.hurt-dt);
  if(p.pose){p.poseTime+=dt;p.moving=false;if(p.poseTime>=p.poseDuration){const ended=p.pose;p.pose=null;p.poseTime=0;p.events.push('end:'+ended);}return;}
  p.attack=Math.max(0,p.attack-dt);p.dash=Math.max(0,p.dash-dt);
  if(p.bufferTime>0){p.bufferTime-=dt;const action=p.bufferAction;if(action&&p.bufferTime>0){const can=action==='attack'?!p.attack&&!p.dash&&!p.cooldown:!p.attack&&!p.dash&&!p.dashCooldown;if(can)requestMotion(p,action,input);}else p.bufferAction=null;}
  if(input.dir!==null&&!p.attack&&!p.dash&&!p.hurt)p.dir=input.dir;
  let tx=input.x*MOTION.speed,ty=input.y*MOTION.speed;
  if(p.attack){const age=MOTION.attackDuration-p.attack,active=age>=.075&&age<.21,factor=age<.055?.3:.72;tx*=factor;ty*=factor;if(active){tx+=FACING[p.dir][0]*18;ty+=FACING[p.dir][1]*18;}}
  if(p.hurt){tx=ty=0;}
  if(p.dash){const phase=1-p.dash/MOTION.dashDuration,speed=250-100*phase;p.vx=FACING[p.dir][0]*speed;p.vy=FACING[p.dir][1]*speed;}
  else{const a=(input.x||input.y?MOTION.acceleration:MOTION.deceleration)*dt;p.vx=approach(p.vx,tx,a);p.vy=approach(p.vy,ty,a);}
  slide(p,p.vx*dt,p.vy*dt,isBlocked);
  const moved=Math.hypot(p.x-p.prevX,p.y-p.prevY);p.moving=moved>.03;
  if(p.moving&&!p.attack&&!p.dash&&!p.hurt){p.distance+=moved;p.idleTime=0;}else if(!p.moving)p.idleTime+=dt;
}
export function motionAnimation(p){
  if(p.pose)return {name:p.pose,phase:Math.min(.999,p.poseTime/p.poseDuration)};
  if(p.hurt>0)return {name:'hurt',phase:1-p.hurt/.22};
  if(p.dash>0)return {name:'dash',phase:1-p.dash/MOTION.dashDuration};
  if(p.attack>0)return {name:'attack',phase:1-p.attack/MOTION.attackDuration};
  if(p.moving)return {name:'walk',phase:(p.distance%MOTION.stride)/MOTION.stride};
  return {name:'idle',phase:(p.idleTime%1.8)/1.8};
}
