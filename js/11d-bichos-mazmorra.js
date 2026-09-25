'use strict';
/* ============================================================
   BICHOS DE MAZMORRA: fuego fatuo, abeja del panal, gólem de hielo y caracol.
   Mismo tamaño y técnica que sus sprites de siempre (16×16, a mano o creature()), con más fotogramas,
   poses según lo que hacen, reacción al golpe y una muerte propia. Nada de esto cambia cómo juegan:
   solo los ganchos ENEMY_DRAW / ENEMY_FX / ENEMY_DEATH de 11-enemies.
   ============================================================ */
const MZ_W=new Map(); function mzWhite(img){ let c=MZ_W.get(img); if(!c){ c=whiten(img); MZ_W.set(img,c); } return c; }
function mzDraw(img,x,y,flip,white){ const src=white?mzWhite(img):img; x=Math.round(x); y=Math.round(y);
  if(flip){ ctx.save(); ctx.translate(x+16,y); ctx.scale(-1,1); ctx.drawImage(src,0,0); ctx.restore(); } else ctx.drawImage(src,x,y); }
function mzStars(x,y){ for(let i=0;i<3;i++){ const a=tick*.15+i*2.1; caStar(Math.round(x+Math.cos(a)*6),Math.round(y+Math.sin(a)*2),2,'#fff0a0'); } }
const mzRows=(rows)=>rows.map(r=>r.padEnd(16,'.').slice(0,16));

/* ---------- el fuego fatuo: la llama baila en cuatro fotogramas, parpadea y abre la boca cuando te tiene cerca ---------- */
const WISP_TOPS=[
  ["........k.......",".......kok......","......kook..k...","......koyok.ko..",".....koyyyokok.."],
  ["................","....k...........","...kok....k.....","...koo...kok....","....kokkkook...."],
  [".....k..........","....kok.....k...","....koo....kok..",".....kok..kook..",".....koyokoyok.."],
  ["..........k.....",".........kok....","..k.....kook....",".kok...kooyk....","..kokkkoyyok...."]];
const WISP_FACE={
  calm:["....kOoyYyyoOk..","...kOoyyyyyyoOk.","...kOokkyykkoOk.","...kOoyyyyyyoOk.","...kOoyykkyyoOk.","....kOooyyooOk.."],
  blink:["....kOoyYyyoOk..","...kOoyyyyyyoOk.","...kOoyyyyyyoOk.","...kOokkyykkoOk.","...kOoyykkyyoOk.","....kOooyyooOk.."],
  hungry:["....kOoyYyyoOk..","...kOkyyyyyykOk.","...kOokkyykkoOk.","...kOoyyyyyyoOk.","...kOoykkkkyoOk.","....kOokrrkoOk.."],
  hurt:["....kOoyYyyoOk..","...kOoyyyyyyoOk.","...kOokyykyykOk.","...kOoykyykyoOk.","...kOoykkkkyoOk.","....kOooyyooOk.."]};
const WISP_BASE=[".....krOOOOrk...","......krrrrk....",".......kkkk.....","................","................"];
const WISP_SPR={}; for(const face in WISP_FACE) WISP_SPR[face]=WISP_TOPS.map(t=>sprN(mzRows([...t,...WISP_FACE[face],...WISP_BASE]),WISP_FX));
ENEMY_DRAW.wisp=e=>{ const f=((tick>>2)+(e.x|0))&3, bob=Math.sin(tick*.15+e.x*.1)*2, d=Math.hypot(player.x-e.x,player.y-e.y);
  const face=e.flash>0?'hurt':d<44?'hungry':((tick+(e.x|0)*7)%170<6?'blink':'calm');
  const fl=.25+Math.sin(tick*.3)*.05+(d<44?.08:0); glowAt(e.x+8,e.y+8+bob,14+((tick>>2)&1),'rgba(248,160,48,'+fl.toFixed(3)+')');
  drawShadow(e.x+8,e.y+15,4); mzDraw(WISP_SPR[face][f],e.x,e.y+bob,false,e.flash>4); };
ENEMY_FX.wisp=(e,dx,dy,d)=>{ if((tick&7)===0&&d<44) parts.push({k:'mote',x:e.x+4+Math.random()*8,y:e.y+2,vx:(Math.random()-.5)*.3,vy:-.5,life:18,max:18,sway:Math.random()*6,col:'#fff4b0',nog:true});
  if(e.flash===7) for(let i=0;i<6;i++){ const a=i/6*6.283; parts.push({x:e.x+8,y:e.y+8,vx:Math.cos(a)*1.4,vy:Math.sin(a)*1.4-.4,life:12,col:i&1?'#fff4b0':'#f8a030',nog:true}); } };
ENEMY_DEATH.wisp=e=>{ const x=e.x+8, y=e.y+8; // la llama se encoge y se apaga en una voluta de humo; sube una última brasa
  for(let i=0;i<6;i++){ const a=i/6*6.283; parts.push({k:'smoke',x:x+Math.cos(a)*2,y:y+Math.sin(a)*2,vx:Math.cos(a)*.35,vy:-.45-Math.random()*.3,life:26,max:26,r:2+(i%2),col:i&1?'#5a5058':'#8a8088',nog:true}); }
  for(let i=0;i<5;i++) parts.push({x:x-3+Math.random()*6,y,vx:(Math.random()-.5)*.8,vy:-1-Math.random(),life:16,col:i&1?'#f8e060':'#e86818',nog:true});
  parts.push({k:'mote',x,y:y-2,vx:0,vy:-.6,life:40,max:40,sway:2,col:'#ffb040',nog:true});
  parts.push({x,y,vx:0,vy:0,life:10,col:'#fff4b0',ring:true,r:12,nog:true}); if(AC) noise(.18,.04,true,undefined,1800); };

/* ---------- la abeja: aleteo, antenas, aguijón; se encoge y apunta antes del picado y deja estela al picar ---------- */
const BEE_FACE={calm:["...kykqyykqyk...","...kykkyykkyk..."], aim:["...kkyyyyyykk...","...kykqkkqkyk..."]};
const BEE_WINGS={up:["..kkk.....kkk...",".kwwWk...kWwwk..",".kwwwWk.kWwwwk..","..kwwwkkkwwwk..."], down:["................","................","kkk..........kkk","kwwWkk....kkWwwk"], mid:["................","..kkk.....kkk...",".kwWWkk.kkWWwk..","..kkkkkkkkkkk..."]};
const BEE_BODY=["...kkkYyykkk....","....kYyyyyyk....","FACE","...kkkkkkkkkk...","...kyyyyyyyOk...","...kkkkkkkkkk...","....kyyyyyOk....",".....kkkkkk.....",".......kk.......","........k......."];
function beeRows(w,face){ const W=BEE_WINGS[w], F=BEE_FACE[face]; const rows=[...W];
  if(w==='down') rows.push(".kwwwWkkkkWwwwk.");
  for(const r of BEE_BODY){ if(r==='FACE') rows.push(...F); else rows.push(r); } return mzRows(rows.slice(0,16)); }
const BEE_SPR={}; for(const w of ['up','down','mid']) for(const f of ['calm','aim']) BEE_SPR[w+f]=sprN(beeRows(w,f),BEE_FX);
ENEMY_DRAW.bee=e=>{ const aim=e.homing>0||(e.t%120>84&&e.t%120<=96), dive=e.homing>0;
  const w=dive?((tick&1)?'mid':'down'):['up','mid','down','mid'][(tick>>1)&3], bob=dive?0:Math.sin(tick*.25+e.x)*1.5;
  drawShadow(e.x+8,e.y+15,dive?3:4);
  if(e.t%120>88&&e.t%120<=96&&!dive){ const k=(e.t%120-88)/8; ctx.save(); ctx.translate(Math.round(e.x+8),Math.round(e.y+16+bob)); ctx.scale(1+k*.12,1-k*.14); mzDraw(BEE_SPR[w+'aim'],-8,-16,false,e.flash>4); ctx.restore(); return; } // se encoge: ¡va a picar!
  mzDraw(BEE_SPR[w+(aim?'aim':'calm')],e.x,e.y+bob,e.vx>0&&dive,e.flash>4); };
ENEMY_FX.bee=(e,dx,dy,d)=>{
  if(e.homing===39){ if(AC) beep('square',520,880,.1,.022); }
  if(e.homing>0&&(tick&1)) parts.push({x:e.x+8-e.vx*2,y:e.y+9-e.vy*2,vx:-e.vx*.15,vy:-e.vy*.15,life:8,col:'#fff0a0',nog:true});
  if(e.homing>0&&(tick&3)===0) parts.push({x:e.x+8-e.vx*3,y:e.y+10-e.vy*3,vx:0,vy:0,life:10,col:'#f8d030',nog:true});
  if(!e.homing&&(tick%40)===((e.x|0)%40)) parts.push({k:'mote',x:e.x+8,y:e.y+12,vx:0,vy:.2,life:24,max:24,sway:Math.random()*6,col:'#fff0a0',nog:true}); }; // polen
ENEMY_DEATH.bee=e=>{ const x=e.x+8, y=e.y+8; // un puff de polen, las dos alas bajan balanceándose y el aguijón cae
  for(let i=0;i<8;i++){ const a=i/8*6.283; parts.push({x:x+Math.cos(a)*2,y:y+Math.sin(a)*2,vx:Math.cos(a)*1.1,vy:Math.sin(a)*1.1-.3,life:14,col:i&1?'#f8d030':'#fff0a0',nog:true}); }
  for(const s of [-1,1]) parts.push({k:'leafF',x:x+s*4,y:y-3,vx:s*.5,vy:-.8,life:46,max:46,sway:s*2,col:'#e8f4ff',nog:false});
  parts.push({k:'shard',x,y:y+5,vx:0,vy:-.5,life:18,max:18,col:'#3a3020'});
  parts.push({x,y,vx:0,vy:0,life:10,col:'#ffffff',ring:true,r:11,nog:true}); if(AC) beep('square',900,300,.12,.03); };

/* ---------- el gólem de hielo: pasos pesados (pierna a pierna, balanceo de brazos), ojos que laten; la Hoja rebota ---------- */
const GOLEM_TOP=["................","....kkkkkkkk....","...kwwWWwwwNk...","...kwWwwwwNNk..."];
const GOLEM_EYES={on:["...kwkkwwkkNk...","...kwkcwwkcNk..."],blink:["...kwwwwwwwNk...","...kwkkwwkkNk..."],hurt:["...kwkwkkwkNk...","...kwwkwwkwNk..."]};
const GOLEM_MID=["...kNwwwwwwMk...",".kkkkkkkkkkkkkk.","kwWkwwWwwwwNkNMk","kWwkwwwwwwNNkNMk","kwNkwwwwwNNMkMMk",".kkkNNNNNNMMkkk."];
const GOLEM_LEGS={stand:["....kNNkkNMk....","...kwNNk.kNMk...","...kkkkk.kkkk..."],l:["....kNNkkNMk....","...kkkkk.kNMk...",".........kkkk..."],r:["....kNNkkNMk....","...kwNNk.kkkk...","...kkkkk........"]};
function golemRows(eyes,legs,arm){ const mid=GOLEM_MID.slice(); if(arm){ // un brazo un píxel más arriba: el balanceo
    const up=arm<0?[0,1,2]:[13,14,15]; for(const c of up){ const a=mid[2].split(''), b=mid[3].split(''), cc=mid[4].split(''); a[c]=b[c]; b[c]=cc[c]; cc[c]=mid[5][c]; mid[2]=a.join(''); mid[3]=b.join(''); mid[4]=cc.join(''); } }
  return mzRows([...GOLEM_TOP,...GOLEM_EYES[eyes],...mid,...GOLEM_LEGS[legs],"................"]); }
const GOLEM_PAL={w:'#d8ecff',W:'#ffffff',N:'#8ab0d8',M:'#5a78a8',c:'#58e8d8'};
const GOLEM_SPR={}; for(const ey of ['on','blink','hurt']) for(const lg of ['stand','l','r']) for(const ar of [0,-1,1]) GOLEM_SPR[ey+lg+ar]=sprN(golemRows(ey,lg,ar),GOLEM_PAL);
ENEMY_DRAW.golem=e=>{ const ph=e.t%16, step=ph<8?'l':'r', legs=(ph===0||ph===8)?'stand':step, arm=legs==='stand'?0:(step==='l'?1:-1);
  const eyes=e.flash>0?'hurt':((tick+(e.x|0)*5)%150<5?'blink':'on'), bob=(ph%8)<2?1:0;
  drawShadow(e.x+8,e.y+15,6); mzDraw(GOLEM_SPR[eyes+legs+arm],e.x,e.y+bob,false,false);
  if(eyes==='on'){ const a=.18+.12*Math.sin(tick*.12); glowAt(e.x+6,e.y+5,3,'rgba(88,232,216,'+a.toFixed(3)+')'); glowAt(e.x+10,e.y+5,3,'rgba(88,232,216,'+a.toFixed(3)+')'); }
  if(e.flash>4){ ctx.fillStyle='rgba(200,240,255,.55)'; ctx.fillRect(Math.round(e.x)+3,Math.round(e.y+bob)+2,10,11); } }; // el golpe: se ilumina el hielo (no se pone blanco: la Hoja no le hace nada)
ENEMY_FX.golem=(e,dx,dy,d)=>{ const ph=e.t%16;
  if(ph===0||ph===8){ const fx=e.x+(ph===0?5:11), fy=e.y+15; for(let i=0;i<3;i++) parts.push({k:'dust',x:fx+(i-1)*2,y:fy,vx:(i-1)*.35,vy:-.08,life:14,max:14,r:1,col:'#e8f4ff',nog:true}); if(AC&&d<90) beep('triangle',90,55,.08,.035); }
  if(e.flash===4&&e.lastFl!==4){ for(let i=0;i<6;i++){ const a=Math.random()*6.283; parts.push({x:e.x+8,y:e.y+7,vx:Math.cos(a)*1.6,vy:Math.sin(a)*1.6-.5,life:10,col:i&1?'#a8e8ff':'#ffffff',nog:true}); } } // la Hoja rebota: chispas azules
  if(e.hp<(e.lastHp??e.hp)) for(let i=0;i<4;i++) parts.push({x:e.x+4+Math.random()*8,y:e.y+8,vx:(Math.random()-.5)*.4,vy:.6,life:16,col:'#a8d8f0',nog:false}); // el fuego lo derrite: gotas
  e.lastFl=e.flash; e.lastHp=e.hp; };
ENEMY_DEATH.golem=e=>{ const x=e.x+8, y=e.y+9; // se derrumba en cubitos de hielo que botan y un poco de vaho
  for(let i=0;i<10;i++){ const a=-Math.PI*(.1+.8*(i/9)); parts.push({k:'shard',x:x+(Math.random()-.5)*8,y:y-2,vx:Math.cos(a)*(1+Math.random()),vy:Math.sin(a)*(1.4+Math.random())-.4,life:22,max:22,col:['#ffffff','#d8ecff','#8ab0d8'][i%3]}); }
  for(let i=0;i<4;i++) parts.push({k:'smoke',x:x+(i-1.5)*4,y:y+4,vx:(i-1.5)*.2,vy:-.3,life:24,max:24,r:3,col:'#e8f4ff',nog:true});
  parts.push({x,y,vx:0,vy:0,life:12,col:'#c8f0ff',ring:true,r:14,nog:true}); if(AC){ noise(.14,.05,true,undefined,4200); beep('square',1400,700,.08,.02); } };

/* ---------- el caracol: se arrastra (estira y encoge), mueve las antenas y deja su babita; en la concha tiembla y se asoma ---------- */
const SNAIL_ROWS=["................","..k..k..........","..q..q..........","..k..k..........","..kk.k..ee......",".kGhk..e........","kqkhk...nnnn....","kkhhk..n....n...","khhgk..n..n.n...","khggk..n...nn...","kgggkk.........k","kgggggkk......kk","kGggggggkkkkkkgk",".kGGgggggggggGk.","..kkkkkkkkkkkk..","................"];
function snailVar(stretch,ant,blink){ const R=SNAIL_ROWS.map(r=>r.split(''));
  if(ant===1){ R[1]=".k...k..........".split(''); R[2]=".q...q..........".split(''); R[3]="..k..k..........".split(''); }
  if(ant===2){ R[1]="...k..k.........".split(''); R[2]="...q..q.........".split(''); R[3]="..k..k..........".split(''); }
  if(blink){ R[2]=R[2].map(c=>c==='q'?'k':c); R[6][1]='k'; }
  if(stretch){ for(const y of [12,13]){ R[y].splice(0,0,'.'); R[y].pop(); R[y][0]='.'; } R[13][1]='k'; R[12][0]='k'; } // el pie se estira un píxel por delante
  return R.map(r=>r.join('')); }
const SNAIL_SPR={}; for(const st of [0,1]) for(const an of [0,1,2]) for(const bl of [0,1]) SNAIL_SPR[st+'|'+an+'|'+bl]=creature([{x:9,y:8.5,r:5.2}],SNAIL_PAL,snailVar(st,an,bl),SNAIL_FX);
const SNAIL_PEEK=creature([{x:8,y:9,r:5.6}],SNAIL_PAL,["................","................","................","................","......ee........",".....e..........","......nnnn......",".....n....n.....",".....n..n.n.....",".....n...nn.....","k.k.............","q.q.............","k.k.............","kkkkk.......kkk.","..kGgkkkkkkkgGk.","...kkkkkkkkkkk.."],SNAIL_FX);
ENEMY_DRAW.snail=e=>{ const flip=player.x>e.x, white=e.flash>4;
  drawShadow(e.x+8,e.y+15,5);
  if(e.st==='in'){ const sh=e.shellT>70?((tick&2)?1:-1):0, img=e.shellT<24?SNAIL_PEEK:E_SPR.snail.shell; /* al final asoma las antenas: ¡va a salir! */ mzDraw(img,e.x+sh,e.y,flip,white); if(e.shellT>70) mzStars(e.x+8,e.y+2); return; }
  const st=(e.t>>3)&1, an=((tick>>4)+(e.x|0))%3, bl=((tick+(e.x|0)*3)%160)<5?1:0;
  mzDraw(SNAIL_SPR[st+'|'+an+'|'+bl],e.x,e.y,flip,white); };
ENEMY_FX.snail=(e,dx,dy,d)=>{ if(e.st==='out'&&(e.t%14)===0) parts.push({k:'mote',x:e.x+8+(player.x>e.x?-5:5),y:e.y+14,vx:0,vy:0,life:70,max:70,sway:0,col:'#c8f0e0',nog:true}); // la babita que deja
  if(e.st==='in'&&e.shellT===89) for(let i=0;i<4;i++) parts.push({x:e.x+8,y:e.y+9,vx:(i-1.5)*.6,vy:-.8,life:10,col:'#f8d890',nog:false}); };
ENEMY_DEATH.snail=e=>{ const x=e.x+8, y=e.y+9; // la concha se parte en trozos y el cuerpecito se esfuma
  for(let i=0;i<7;i++){ const a=-Math.PI*(.1+.8*(i/6)); parts.push({k:'shard',x:x+(Math.random()-.5)*6,y:y-2,vx:Math.cos(a)*(1+Math.random()*.8),vy:Math.sin(a)*(1.3+Math.random())-.3,life:20,max:20,col:['#e0a050','#b87030','#f8d890'][i%3]}); }
  for(let i=0;i<5;i++){ const a=i/5*6.283; parts.push({k:'smoke',x:x+Math.cos(a)*3,y:y+2,vx:Math.cos(a)*.4,vy:-.3,life:20,max:20,r:2,col:'#c0f0a0',nog:true}); }
  parts.push({x,y,vx:0,vy:0,life:10,col:'#ffffff',ring:true,r:11,nog:true}); if(AC) noise(.1,.04,false,undefined,1200); };
