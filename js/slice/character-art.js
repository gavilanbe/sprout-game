// Sprout's identity comes from one generated parts master. All game poses reuse it.
export const HERO_CELL=80,HERO_ANCHOR={x:40,y:64};
export const HERO_PALETTE=['#183c35','#376743','#75a847','#c1db75','#ffe5ac','#d9a35f','#b76d45','#e39a5e','#704936','#fff3cf'];
export const HERO_STATES={idle:{label:'Reposo',frames:4,seconds:1.8},walk:{label:'Caminar',frames:8,seconds:.52},attack:{label:'Hoja',frames:6,seconds:.30},dash:{label:'Esquiva',frames:4,seconds:.22},hurt:{label:'Daño',frames:3,seconds:.22},interact:{label:'Interactuar',frames:3,seconds:.30},carry:{label:'Recoger',frames:4,seconds:.7},plant:{label:'Plantar',frames:5,seconds:.65},wilt:{label:'Marchitarse',frames:6,seconds:.7},rebloom:{label:'Rebrotar',frames:6,seconds:.55}};
const rgb=HERO_PALETTE.map(s=>[parseInt(s.slice(1,3),16),parseInt(s.slice(3,5),16),parseInt(s.slice(5,7),16)]);
const canvas=(w,h=w)=>{const c=document.createElement('canvas');c.width=w;c.height=h;c.getContext('2d').imageSmoothingEnabled=false;return c;};

function components(image){
  const source=canvas(image.width,image.height),g=source.getContext('2d');g.drawImage(image,0,0);
  const pixels=g.getImageData(0,0,image.width,image.height),data=pixels.data,w=image.width,h=image.height;
  const labels=new Int32Array(w*h),queue=new Int32Array(w*h),found=[];let label=0;
  for(let at=0;at<w*h;at++){
    if(labels[at]||data[at*4+3]<160)continue;
    label++;let read=0,end=1,left=w,top=h,right=0,bottom=0;queue[0]=at;labels[at]=label;
    while(read<end){const p=queue[read++],x=p%w,y=Math.floor(p/w);left=Math.min(left,x);right=Math.max(right,x);top=Math.min(top,y);bottom=Math.max(bottom,y);
      const visit=n=>{if(!labels[n]&&data[n*4+3]>=160){labels[n]=label;queue[end++]=n;}};
      if(x)visit(p-1);if(x<w-1)visit(p+1);if(y)visit(p-w);if(y<h-1)visit(p+w);
    }
    if(end>500)found.push({id:label,x:left,y:top,w:right-left+1,h:bottom-top+1,area:end});
  }
  // Generated art is not a mathematically exact 4x4 grid. Find the actual pieces.
  const big=found.sort((a,b)=>b.area-a.area).slice(0,16).sort((a,b)=>(a.y+a.h/2)-(b.y+b.h/2));
  if(big.length!==16)throw new Error('El máster de Sprout no contiene las 16 piezas esperadas.');
  const ordered=[];for(let row=0;row<4;row++)ordered.push(...big.slice(row*4,row*4+4).sort((a,b)=>a.x-b.x));
  return {source,ordered,labels,pixels};
}
function fitPart(source,box,labels,width,height){
  const cut=canvas(box.w,box.h),g=cut.getContext('2d');g.drawImage(source,box.x,box.y,box.w,box.h,0,0,box.w,box.h);
  const d=g.getImageData(0,0,box.w,box.h);
  for(let y=0;y<box.h;y++)for(let x=0;x<box.w;x++)if(labels[(box.y+y)*source.width+box.x+x]!==box.id)d.data[(y*box.w+x)*4+3]=0;
  g.putImageData(d,0,0);
  const ratio=Math.min(width/box.w,height/box.h),w=Math.max(1,Math.round(box.w*ratio)),h=Math.max(1,Math.round(box.h*ratio));
  const out=canvas(w,h),ctx=out.getContext('2d');ctx.drawImage(cut,0,0,w,h);
  const p=ctx.getImageData(0,0,w,h);
  for(let k=0;k<p.data.length;k+=4){if(p.data[k+3]<128){p.data[k+3]=0;continue;}let min=Infinity,best=rgb[0];for(const col of rgb){const delta=(p.data[k]-col[0])**2+(p.data[k+1]-col[1])**2+(p.data[k+2]-col[2])**2;if(delta<min){min=delta;best=col;}}p.data[k]=best[0];p.data[k+1]=best[1];p.data[k+2]=best[2];p.data[k+3]=255;}
  ctx.putImageData(p,0,0);return out;
}
function flipped(im){const c=canvas(im.width,im.height),g=c.getContext('2d');g.translate(im.width,0);g.scale(-1,1);g.drawImage(im,0,0);return c;}
function pose(parts,seed,name,dir,frame){
  const out=canvas(HERO_CELL),g=out.getContext('2d'),count=HERO_STATES[name].frames,t=frame/(count-1),side=dir===1||dir===2,sign=dir===1?-1:1;
  const center=40;let headDX=0,bodyDX=0,bob=0,lean=0,drop=0,leftStep=0,rightStep=0,leftSwing=0,rightSwing=0,armUp=0,weapon=false,weaponAngle=0;
  if(name==='idle'){bob=[0,0,1,0][frame];}
  if(name==='walk'){
    const phase=frame/count*Math.PI*2,step=Math.sin(phase);leftStep=Math.round(step*3);rightStep=-leftStep;leftSwing=Math.round(-step*2);rightSwing=-leftSwing;bob=Math.abs(step)<.5?-1:0;
  }
  if(name==='attack'){
    weapon=true;weaponAngle=[-105,-70,-10,55,105,130][frame];armUp=[1,3,7,7,3,0][frame];bodyDX=side?sign*[0,-1,1,2,1,0][frame]:0;headDX=bodyDX;
  }
  if(name==='dash'){lean=[1,3,4,1][frame];bob=[1,2,2,0][frame];leftStep=2;rightStep=-2;leftSwing=2;rightSwing=2;headDX=side?sign*lean:0;}
  if(name==='hurt'){headDX=[-2,1,0][frame];bob=[2,1,0][frame];leftSwing=rightSwing=-2;}
  if(name==='interact'){armUp=[1,5,2][frame];bob=frame===1?1:0;}
  if(name==='carry'){armUp=9;bob=[0,-1,0,0][frame];}
  if(name==='plant'){drop=[0,3,7,4,0][frame];armUp=[1,0,-3,0,0][frame];headDX=side?sign*Math.round(drop/2):0;}
  if(name==='wilt'){drop=[0,2,5,8,10,12][frame];leftSwing=rightSwing=2;}
  if(name==='rebloom'){drop=[12,10,8,5,2,0][frame];}
  const head=parts.head[dir],torso=parts.torso[dir];
  const at=(im,x,y)=>g.drawImage(im,Math.round(x),Math.round(y));
  const limb=(im,x,y,angle=0)=>{g.save();g.translate(Math.round(x),Math.round(y));g.rotate(angle*Math.PI/180);g.drawImage(im,-Math.floor(im.width/2),0);g.restore();};
  // Keep feet on the same ground plane. Lift a swing foot, never scale the body.
  const boot=(which,x,step)=>at(parts.boot[which],x,64-parts.boot[which].height-Math.max(0,step));
  if(side){boot(0,center-6+leftStep,Math.max(0,leftStep));boot(1,center+rightStep,Math.max(0,rightStep));}
  else{boot(0,center-7,Math.max(0,leftStep));boot(1,center+1,Math.max(0,rightStep));}
  const torsoY=47+bob+Math.min(drop,8),shoulderY=48+bob+Math.min(drop,8),bodyX=center+bodyDX;
  const backArmX=side?center-sign*5:bodyX-8,frontArmX=side?center+sign*3:bodyX+8;
  if(dir===3)armUp=-armUp;
  limb(parts.arm[0],backArmX,shoulderY+leftSwing-armUp,(name==='carry'?-155:0)+(side?-leftStep*4:0));
  at(torso,bodyX-Math.floor(torso.width/2),torsoY);
  limb(parts.arm[1],frontArmX,shoulderY+rightSwing-Math.max(0,armUp)*.4,name==='carry'?155:armUp>0?(side?-sign*armUp*8:-armUp*8):0);
  // Exactly the same face pixels for every state and frame of a direction.
  at(head,center-Math.floor(head.width/2)+headDX,21+bob+drop);
  if(name==='carry'){limb(parts.arm[0],center-13,43+bob,165);limb(parts.arm[1],center+13,43+bob,-165);}
  if(weapon){
    const theta=(dir===0?180:dir===1?270:dir===2?90:0)+weaponAngle;
    const gripX=center+(dir===1?-8:dir===2?8:dir===0?7:-7)+bodyDX,gripY=48+bob;
    g.save();g.translate(gripX,gripY);g.rotate(theta*Math.PI/180);g.drawImage(parts.sword,-Math.floor(parts.sword.width/2),-parts.sword.height+3);g.restore();
    if(frame===2||frame===3){g.save();g.translate(center,45);g.rotate((dir===0?90:dir===1?180:dir===2?0:270)*Math.PI/180);g.drawImage(parts.slash,4,-15);g.restore();}
    at(parts.fist,gripX-2,gripY-2);
  }
  if(seed&&name==='carry')at(seed,center-10,7+bob);
  if(seed&&name==='plant'&&frame>0&&frame<4)at(seed,center+(side?sign*10:-10),47+Math.round(t*8));
  // On collapse, fold below the head using a ground clip; the common cell never changes.
  if(drop>8){g.clearRect(0,65,80,15);}
  return out;
}
export async function loadCharacter(seed){
  const image=new Image();image.src=new URL('../../assets/slice/hero-v2/parts-master.png',import.meta.url).href;await image.decode();
  const {source,ordered,labels}=components(image);
  const sizes=[[28,30],[28,30],[28,30],[28,30],[18,13],[18,13],[18,13],[18,13],[5,10],[5,10],[5,5],[5,6],[6,8],[6,8],[9,24],[25,25]];
  const cropped=ordered.map((b,i)=>fitPart(source,b,labels,...sizes[i]));
  // A mirrored side view is intentional: profile volume and silhouette stay exact.
  cropped[1]=flipped(cropped[2]);
  const parts={head:cropped.slice(0,4),torso:cropped.slice(4,8),arm:cropped.slice(8,10),fist:cropped[10],hand:cropped[11],boot:cropped.slice(12,14),sword:cropped[14],slash:cropped[15]};
  const item=seed?canvas(20):null;if(item)item.getContext('2d').drawImage(seed,0,0,20,20);
  const animations={};for(const [name,state] of Object.entries(HERO_STATES))animations[name]=Array.from({length:4},(_,dir)=>Array.from({length:state.frames},(_,frame)=>pose(parts,item,name,dir,frame)));
  return {parts,animations,cell:HERO_CELL,anchor:HERO_ANCHOR,source:[image.width,image.height],regions:ordered.map(({x,y,w,h})=>({x,y,w,h})),palette:HERO_PALETTE};
}
export function characterFrame(character,name,dir,phase=0){const frames=character.animations[name]?.[dir]||character.animations.idle[dir];return frames[Math.max(0,Math.min(frames.length-1,Math.floor(phase*frames.length)))];}
export function drawCharacter(g,character,name,dir,phase,x,y){g.drawImage(characterFrame(character,name,dir,phase),Math.round(x-HERO_ANCHOR.x),Math.round(y-HERO_ANCHOR.y));}
