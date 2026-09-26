'use strict';
/* ============================================================
   EFECTOS: partículas con carácter, destellos y ambiente.
   Cada partícula lleva un tipo (k) que decide cómo se mueve
   y cómo se pinta; las viejas (sin k) siguen funcionando.
   ============================================================ */
const DISC_CACHE=new Map();
function disc(r,col){ const key=r+col; let c=DISC_CACHE.get(key); if(c) return c;
  const d=r*2+1; c=mkCanvas(d,d); const g=c.getContext('2d'); g.fillStyle=col;
  for(let y=-r;y<=r;y++){ const w=Math.round(Math.sqrt(Math.max(0,r*r-y*y)+r*.35)); g.fillRect(r-w,r+y,w*2+1,1); }
  DISC_CACHE.set(key,c); return c; }
const TINT_CACHE=new Map();
function tintCached(img,col){ const key=col; let m=TINT_CACHE.get(img); if(!m){ m=new Map(); TINT_CACHE.set(img,m); } let c=m.get(key); if(!c){ c=tintTo(img,col); m.set(key,c); } return c; }
let flashT=0, flashCol='#ffffff', hurtVig=0;
function screenFlash(n,col){ flashT=Math.max(flashT,n); flashCol=col||'#ffffff'; }
/* polvo bajo los pies al dar un paso: el color sale del suelo que se pisa */
function groundDustCol(){
  const ch=playerOnTile(), bio=screenBiome(sx,sy);
  if(ch==='p') return C.pathL; if(ch==='s') return C.sandL; if(ch==='n'||bio==='snow') return '#ffffff';
  if(ch==='q'||ch==='o'||ch==='x') return '#a89888'; if(ch==='m') return C.mudL;
  const G=(BIOMES[bio]||BIOMES.valley).grass; return G[3];
}
function stepDust(){
  if(jumpT>0) return; const col=groundDustCol(), back=[[0,-1],[0,1],[1,0],[-1,0]][player.dir];
  for(let i=0;i<2;i++) parts.push({k:'dust',x:player.x+5+i*6,y:player.y+15,vx:back[0]*.25+(i?.18:-.18),vy:back[1]*.2-.12,life:14,max:14,r:1+(i&1),col,nog:true});
}
function hitSpark(x,y,col){
  parts.push({k:'spark',x,y,vx:0,vy:0,life:7,max:7,col:col||'#ffffff',nog:true});
  for(let i=0;i<6;i++){ const a=i/6*6.283+Math.random()*.5, s=1.6+Math.random()*1.4; parts.push({k:'shard',x,y,vx:Math.cos(a)*s,vy:Math.sin(a)*s,life:9+(i&3),max:12,col:i&1?'#fff6c0':(col||'#ffffff'),nog:true}); }
}
function deathPoof(x,y,col){
  for(let i=0;i<7;i++){ const a=i/7*6.283, s=.5+Math.random()*.6; parts.push({k:'smoke',x:x+Math.cos(a)*3,y:y+Math.sin(a)*3,vx:Math.cos(a)*s,vy:Math.sin(a)*s-.25,life:20+((Math.random()*8)|0),max:28,r:2+(i%3),col:i&1?'#f4f0e8':'#d8d0d8',nog:true}); }
  for(let i=0;i<8;i++){ const a=Math.random()*6.283, s=1.5+Math.random()*2; parts.push({k:'shard',x,y,vx:Math.cos(a)*s,vy:Math.sin(a)*s-.6,life:14,max:14,col:col||'#fff0a0'}); }
  parts.push({x,y,vx:0,vy:0,life:12,col:'#ffffff',ring:true,r:14,nog:true});
}
function bladeBits(x,y,cols,n){ // briznas/hojas cortadas que giran y caen
  for(let i=0;i<(n||6);i++){ const a=-Math.PI/2+(Math.random()-.5)*2.4, s=.8+Math.random()*1.4;
    parts.push({k:'blade',x:x+(Math.random()-.5)*8,y:y+(Math.random()-.5)*6,vx:Math.cos(a)*s,vy:Math.sin(a)*s,life:22+((Math.random()*10)|0),max:32,col:cols[i%cols.length],rot:Math.random()*6,vr:(Math.random()-.5)*.6}); }
}
function collectBurst(x,y,col,big){ // anillo + estrellitas al recoger
  parts.push({x,y,vx:0,vy:0,life:12,col:'#ffffff',ring:true,r:big?16:9,nog:true});
  for(let i=0;i<(big?10:6);i++){ const a=i/(big?10:6)*6.283, s=big?1.8:1.2; parts.push({k:'shard',x,y,vx:Math.cos(a)*s,vy:Math.sin(a)*s,life:10,max:12,col:i&1?'#ffffff':col,nog:true}); }
  if(big) for(let i=0;i<4;i++) sparkle(x-6+Math.random()*12,y-8+Math.random()*8,'#fff6c0');
}
/* ---------- ambiente: lo que flota en el aire de cada sitio ---------- */
function ambient(){
  if(state!=='play') return;
  const r=regionOf(sx,sy), bio=screenBiome(sx,sy), dark=r==='cueva'||r==='tronco'||r==='templo'||r==='gruta'||r==='secreto';
  const n=parts.length; if(n>140) return;
  if(dark){ if((tick&15)===0) parts.push({k:'mote',x:Math.random()*160,y:Math.random()*128,vx:(Math.random()-.5)*.1,vy:-.05-Math.random()*.08,life:120,max:120,col:r==='templo'?'#cfe8ff':'#e8c888',nog:true}); return; }
  if(r==='casa') return;
  if(bio==='wilt'){ // valle apagado: vilanos y polvo dorado a la deriva
    if((tick&31)===0) parts.push({k:'mote',x:-2,y:10+Math.random()*100,vx:.25+Math.random()*.25,vy:(Math.random()-.5)*.1,life:260,max:260,col:'#f4ecc8',nog:true,sway:Math.random()*6});
    if((tick&127)===40) parts.push({k:'leafF',x:Math.random()*160,y:-4,vx:.2,vy:.35,life:220,max:220,col:(tick&128)?'#c8a850':'#a8904a',nog:true,sway:Math.random()*6});
  } else if(bio==='valley'||bio==='summer'){
    if((tick&47)===0) parts.push({k:'mote',x:Math.random()*160,y:128,vx:(Math.random()-.5)*.1,vy:-.18-Math.random()*.1,life:200,max:200,col:bio==='summer'?'#fff7a0':'#f8ffe0',nog:true,sway:Math.random()*6});
  }
  if(r==='marisma'&&(tick&63)===0) parts.push({k:'firefly',x:Math.random()*160,y:20+Math.random()*100,vx:0,vy:0,life:160,max:160,col:'#e8ff90',nog:true,sway:Math.random()*6});
}
/* movimiento propio de cada tipo (se llama desde updParts) */
function stepPart(p){
  switch(p.k){
    case 'dust': p.vx*=.86; p.vy*=.86; break;
    case 'smoke': p.vx*=.9; p.vy=p.vy*.9-.02; break;
    case 'shard': p.vx*=.84; p.vy*=.84; break;
    case 'blade': p.vx*=.93; p.vy=p.vy*.93+.06; p.rot+=p.vr; break;
    case 'mote': p.x+=Math.sin((tick+p.sway*40)*.03)*.12; break;
    case 'leafF': p.x+=Math.sin((tick+p.sway*40)*.04)*.5; p.rot=(p.rot||0)+.05; break;
    case 'firefly': p.x+=Math.sin((tick+p.sway*50)*.021)*.35; p.y+=Math.cos((tick+p.sway*30)*.017)*.3; break;
    case 'flake': p.x+=Math.sin((tick+p.y)*.05)*.25; break;
    case 'petal': p.x+=Math.sin((tick+p.sway*40)*.05)*.4; break;
  }
}
/* ---------- pintado ---------- */
const LEAF_FALL=[sprN(["l.","Ll"]),sprN([".l","lL"])];
function drawParts(){
  for(const p of parts){ const k=p.max?p.life/p.max:1, x=p.x|0, y=p.y|0;
    switch(p.k){
      case 'dust': { const r=k>.6?p.r:k>.25?p.r:Math.max(0,p.r-1); ctx.globalAlpha=Math.min(1,k*1.6)*.85; ctx.drawImage(disc(r,p.col),x-r,y-r); ctx.globalAlpha=1; break; }
      case 'smoke': { const r=Math.max(0,Math.round(p.r*(k>.5?1:k*2))+(k>.8?-1:0)); ctx.drawImage(disc(r+1,'#8a8090'),x-r-1,y-r); ctx.drawImage(disc(r,p.col),x-r,y-r-1); break; }
      case 'spark': { const s=Math.round((1-k)*9)+2; ctx.fillStyle=p.col; ctx.fillRect(x-s,y,s*2+1,1); ctx.fillRect(x,y-s,1,s*2+1);
        if(k>.5){ ctx.fillRect(x-1,y-1,3,3); } const d=Math.round(s*.6); ctx.fillStyle='#fff0a0'; ctx.fillRect(x-d,y-d,1,1); ctx.fillRect(x+d,y-d,1,1); ctx.fillRect(x-d,y+d,1,1); ctx.fillRect(x+d,y+d,1,1); break; }
      case 'shard': ctx.fillStyle=p.col; if(k>.5){ ctx.fillRect(x,y,2,1); ctx.fillRect(x,y+1,1,1); } else ctx.fillRect(x,y,1,1); break;
      case 'blade': { ctx.fillStyle=p.col; const c=Math.cos(p.rot), s=Math.sin(p.rot); ctx.fillRect(x,y,1,1); ctx.fillRect((x+Math.round(c*1.4))|0,(y+Math.round(s*1.4))|0,1,1); if(p.life>6) ctx.fillRect((x-Math.round(c))|0,(y-Math.round(s))|0,1,1); break; }
      case 'mote': { const a=Math.min(1,k*4,(1-k)*6); ctx.globalAlpha=a*.9; ctx.fillStyle=p.col; ctx.fillRect(x,y,1,1); if(((tick>>3)+(p.sway*7|0))%5===0){ ctx.globalAlpha=a*.35; ctx.fillRect(x-1,y,3,1); ctx.fillRect(x,y-1,1,3); } ctx.globalAlpha=1; break; }
      case 'firefly': { const on=Math.sin((tick+p.sway*40)*.08)>0; if(on){ ctx.globalAlpha=.35; ctx.drawImage(disc(2,p.col),x-2,y-2); ctx.globalAlpha=1; ctx.fillStyle='#ffffff'; ctx.fillRect(x,y,1,1); } break; }
      case 'flake': ctx.fillStyle=p.col; if(p.r){ ctx.fillRect(x-1,y,3,1); ctx.fillRect(x,y-1,1,3); } else ctx.fillRect(x,y,1,1); break;
      case 'petal': { const f=((tick>>3)+(p.sway*5|0))&1; ctx.fillStyle=p.col; ctx.fillRect(x,y,2,1); ctx.fillRect(x+f,y+1,1,1); ctx.fillStyle='#ffffff'; ctx.fillRect(x,y,1,1); break; }
      case 'ripple': { const r=Math.round((1-k)*7)+2; ctx.fillStyle=p.col; ctx.globalAlpha=Math.min(1,k*2); for(let i=0;i<14;i++){ const a=i/14*6.283; ctx.fillRect(Math.round(p.x+Math.cos(a)*r),Math.round(p.y+Math.sin(a)*r*.45),1,1); } ctx.globalAlpha=1; break; }
      case 'leafF': { const f=((tick>>3)+(p.sway*5|0))&1; ctx.drawImage(tintCached(LEAF_FALL[f],p.col),x,y); break; }
      case 'streak': { ctx.globalAlpha=Math.min(1,k*2)*.85; ctx.fillStyle=p.col; if(Math.abs(p.vy||0)>=Math.abs(p.vx||0)) ctx.fillRect(x,y,1,p.len||3); else ctx.fillRect(x,y,p.len||3,1); ctx.globalAlpha=1; break; } // una raya de aire (las corrientes del Templo)
      default: // partículas clásicas
        ctx.fillStyle=p.col;
        if(p.ring){ ctx.strokeStyle=p.col; ctx.lineWidth=2; ctx.globalAlpha=p.life/12; ctx.beginPath(); ctx.arc(p.x,p.y,p.r*(1-p.life/12)+2,0,6.283); ctx.stroke(); ctx.globalAlpha=1; }
        else if(p.star){ const b=p.life>10; ctx.fillRect(x,y-(b?2:1),1,b?5:3); ctx.fillRect(x-(b?2:1),y,b?5:3,1); if(b){ ctx.fillStyle='#ffffff'; ctx.fillRect(x,y,1,1); } }
        else if(p.leaf){ ctx.save(); ctx.translate(x,y); ctx.rotate(p.life*.3); ctx.drawImage(tintCached(LEAF_BIT,p.col),-1,-1); ctx.restore(); }
        else if(p.fly){ const w=(tick>>2)&1; ctx.fillRect(x-1,y+w,1,1); ctx.fillRect(x+1,y+w,1,1); ctx.fillStyle='#3a2a1a'; ctx.fillRect(x,y+1,1,1); }
        else ctx.fillRect(x,y,p.life>8?2:1,p.life>8?2:1);
    }
  }
}
/* destello de pantalla y viñeta roja al recibir daño */
function drawScreenFx(){
  if(hurtVig>0){ const a=hurtVig/24*.55; const g=ctx.createRadialGradient(80,64,30,80,64,100); g.addColorStop(0,'rgba(200,20,40,0)'); g.addColorStop(1,'rgba(200,20,40,'+a.toFixed(2)+')'); ctx.fillStyle=g; ctx.fillRect(0,0,160,PLAY_H); }
  if(flashT>0){ ctx.globalAlpha=Math.min(1,flashT/6)*.7; ctx.fillStyle=flashCol; ctx.fillRect(0,0,160,PLAY_H); ctx.globalAlpha=1; }
}
function tickFx(){ if(flashT>0) flashT--; if(hurtVig>0) hurtVig--; if(player.squash) player.squash*=.72; if(Math.abs(player.squash||0)<.02) player.squash=0;
  for(const e of enemies){ if(e.squash){ e.squash*=.72; if(e.squash<.02) e.squash=0; } if(e.pop>0) e.pop--; } ambient(); }
