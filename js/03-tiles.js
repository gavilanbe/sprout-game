'use strict';
/* ============================================================
   TILES: suelo + objeto, con autotiling y paleta por bioma.
   El mapa es texto; aquí se decide cómo se VE cada char.
   renderScreenTo() pinta una pantalla entera a un canvas.
   ============================================================ */
/* paletas de bioma: [base, oscuro, muy oscuro, claro] */
const BIOMES={
  valley:{ grass:['#78c050','#5ca040','#4a8838','#98d868'], canopy:['#1e6830','#359045','#58b058'], bush:['#2e8038','#58b048','#a0e070'], flowers:['#e84848','#f8f8e8','#f0a0d0'] },
  summer:{ grass:['#8cc84a','#6aa83a','#588c30','#b0e060'], canopy:['#256c2c','#3a9a40','#68c058'], bush:['#3a8a38','#68b848','#b0e870'], flowers:['#f8d030','#f8f8e8','#f0a0d0'] },
  wilt:  { grass:['#a8a858','#90904c','#7a7a40','#c0c070'], canopy:['#5a6a30','#7a8a3a','#9aa858'], bush:['#6a6a38','#8a8a48','#a8a860'], flowers:['#c8a060','#d8d0a0','#c8a0a0'] },
  autumn:{ grass:['#c8a850','#a88838','#8a7838','#e0c068'], canopy:['#a05820','#c87830','#e8a040'], bush:['#a05820','#c87830','#e8a040'], flowers:['#e88040','#f8e8b0','#e8b050'] },
  snow:  { grass:['#e8f0f8','#cddcec','#b8cce0','#ffffff'], canopy:['#1e6830','#359045','#e8f0f8'], bush:['#2e8038','#58b048','#e8f0f8'], flowers:['#e8f0f8','#ffffff','#cddcec'] },
};
const TILE_CACHE=new Map();
function cached(key,fn,w,h){ let c=TILE_CACHE.get(key); if(!c){ c=mkTile(fn,w,h); TILE_CACHE.set(key,c); } return c; }
function seeded(seed){ let s=seed|0||1; return ()=>{ s=(s*1103515245+12345)&0x7fffffff; return s/0x7fffffff; }; }
const R=(g,x,y,w,h,col)=>{ g.fillStyle=col; g.fillRect(x,y,w,h); };
const PX=(g,x,y,col)=>{ g.fillStyle=col; g.fillRect(x,y,1,1); };

/* ---------- SUELOS ---------- */
function grassTile(bio,v){ const P=BIOMES[bio].grass; return cached('grass'+bio+v,g=>{
  R(g,0,0,16,16,P[0]); const rnd=seeded(v*97+13);
  for(let i=0;i<8;i++){ const x=(rnd()*15)|0,y=(rnd()*15)|0; const c=rnd()<.3?P[2]:P[1];
    R(g,x,y,rnd()<.5?2:1,1,c); if(rnd()<.35) R(g,x,y-1,1,1,c); }
  for(let i=0;i<3;i++){ PX(g,(rnd()*16)|0,(rnd()*16)|0,P[3]); }
});}
function flowerTile(bio,v){ const P=BIOMES[bio].grass, F=BIOMES[bio].flowers; return cached('flower'+bio+v,g=>{
  g.drawImage(grassTile(bio,v%3),0,0);
  const spots=[[3,3],[10,8],[6,11]].slice(0,2+(v&1));
  spots.forEach(([x,y],i)=>{ const col=F[(i+v)%F.length];
    R(g,x+1,y,1,1,col); R(g,x,y+1,1,1,col); R(g,x+2,y+1,1,1,col); R(g,x+1,y+2,1,1,col);
    PX(g,x+1,y+1,C.flowerC); PX(g,x+1,y+3,P[2]); });
});}
function tallGrassTile(bio,f){ const P=BIOMES[bio].grass; return cached('tall'+bio+f,g=>{
  g.drawImage(grassTile(bio,1),0,0);
  for(let i=0;i<4;i++){ const x=2+i*4, sway=f?(i%2):((i+1)%2);
    R(g,x+sway,5,1,9,P[2]); R(g,x+1+sway,7,1,7,P[1]); R(g,x-1+sway*2,8,1,6,P[2]);
    PX(g,x+sway,5,P[3]); }
  R(g,0,14,16,2,P[1]);
});}
function snowTile(v){ return grassTile('snow',v); }
function pathTile(v,edges,bio){ // edges: bitmask N=1 E=2 S=4 W=8 de vecinos que NO son camino
  return cached('path'+v+'_'+edges+bio,g=>{
    R(g,0,0,16,16,C.path); const rnd=seeded(v*31+7);
    for(let i=0;i<6;i++){ PX(g,(rnd()*16)|0,(rnd()*16)|0,C.pathD); }
    for(let i=0;i<3;i++){ PX(g,(rnd()*16)|0,(rnd()*16)|0,C.pathL); }
    const G=BIOMES[bio]?BIOMES[bio].grass:BIOMES.valley.grass; // borde dentado con el suelo vecino
    const bite=(x,y)=>{ R(g,x,y,1,1,G[0]); };
    if(edges&1){ for(let x=0;x<16;x++){ const d=hash(x,v)%3; for(let k=0;k<d;k++) bite(x,k); } R(g,0,0,16,1,G[0]); }
    if(edges&4){ for(let x=0;x<16;x++){ const d=hash(x,v+5)%3; for(let k=0;k<d;k++) bite(x,15-k); } }
    if(edges&8){ for(let y=0;y<16;y++){ const d=hash(y,v+9)%3; for(let k=0;k<d;k++) bite(k,y); } }
    if(edges&2){ for(let y=0;y<16;y++){ const d=hash(y,v+3)%3; for(let k=0;k<d;k++) bite(15-k,y); } }
  });
}
function sandTile(v,edges,bio){
  return cached('sand'+v+'_'+edges+bio,g=>{
    R(g,0,0,16,16,C.sand); const rnd=seeded(v*17+3);
    for(let i=0;i<7;i++){ PX(g,(rnd()*16)|0,(rnd()*16)|0,C.sandD); }
    for(let i=0;i<3;i++){ R(g,(rnd()*14)|0,(rnd()*16)|0,2,1,C.sandL); }
    const G=BIOMES[bio]?BIOMES[bio].grass:BIOMES.valley.grass;
    if(edges&1){ for(let x=0;x<16;x++){ const d=hash(x,v)%3; R(g,x,0,1,d,G[0]); } }
    if(edges&4){ for(let x=0;x<16;x++){ const d=hash(x,v+5)%3; R(g,x,16-d,1,d,G[0]); } }
    if(edges&8){ for(let y=0;y<16;y++){ const d=hash(y,v+9)%3; R(g,0,y,d,1,G[0]); } }
    if(edges&2){ for(let y=0;y<16;y++){ const d=hash(y,v+3)%3; R(g,16-d,y,d,1,G[0]); } }
  });
}
function leafTile(v){ return cached('leaf'+v,g=>{ // hojarasca de otoño
  R(g,0,0,16,16,C.leaf); const rnd=seeded(v*41+5);
  for(let i=0;i<7;i++){ const x=(rnd()*15)|0,y=(rnd()*15)|0; R(g,x,y,2,1,rnd()<.4?C.leafDD:C.leafD); }
  for(let i=0;i<3;i++){ const x=(rnd()*14)|0,y=(rnd()*14)|0; R(g,x,y,2,1,C.autL); PX(g,x+1,y+1,C.aut); }
});}
function mudTile(v,edges){ return cached('mud'+v+edges,g=>{
  R(g,0,0,16,16,C.mud); const rnd=seeded(v*23+1);
  for(let i=0;i<6;i++){ R(g,(rnd()*14)|0,(rnd()*15)|0,2,1,C.mudD); }
  for(let i=0;i<4;i++){ R(g,(rnd()*15)|0,(rnd()*16)|0,2,1,C.mudL); }
  for(let i=0;i<3;i++){ const x=(rnd()*13)|0,y=(rnd()*13)|0; R(g,x,y,3,1,'#5a4a2a'); R(g,x+1,y+1,1,1,'#7a6a44'); }
  if(edges&1){ R(g,0,0,16,1,C.mudL); } if(edges&8){ R(g,0,0,1,16,C.mudL); }
  if(edges&4){ R(g,0,15,16,1,C.mudD); } if(edges&2){ R(g,15,0,1,16,C.mudD); }
});}
function dfloorTile(v,style){ return cached('dfloor'+v+style,g=>{
  const [b,d,l]=style==='wood'?['#8a6438','#7a5630','#9a7444']:style==='hive'?['#c89c48','#b08838','#d8ac58']:style==='ice'?['#8aa8c8','#7a98b8','#a8c8e0']:[C.dfloor,C.dfloorD,C.dfloorL];
  R(g,0,0,16,16,b); const rnd=seeded(v*37+11);
  if(style==='ice'){ R(g,0,0,16,1,l); R(g,0,0,1,16,l); R(g,15,0,1,16,d); R(g,0,15,16,1,d); PX(g,4+v*3,5,l); PX(g,10,9+v,l); return; }
  for(let i=0;i<4;i++){ const x=(rnd()*14)|0,y=(rnd()*14)|0; R(g,x+1,y+1,2,1,rnd()<.5?d:l); }
  if(style==='cave'||!style){ R(g,0,7,16,1,shade(b,-.08)); R(g,7+(v&1)*4,0,1,7,shade(b,-.08)); R(g,3+(v&1)*6,8,1,8,shade(b,-.08)); }
});}
function woodFloorTile(v){ return cached('wood'+v,g=>{
  R(g,0,0,16,16,'#c89858'); R(g,0,7,16,1,'#a87840'); R(g,0,15,16,1,'#a87840');
  R(g,v?4:10,0,1,7,'#a87840'); R(g,v?12:6,8,1,7,'#a87840'); PX(g,2,3,'#e0b070'); PX(g,9,11,'#e0b070');
});}
function iceTile(v){ return cached('ice'+v,g=>{
  R(g,0,0,16,16,C.ice); R(g,1,1,14,14,C.iceL); R(g,2,2,12,12,C.ice);
  R(g,3+v*3,4,4,1,'#ffffff'); R(g,9-v*2,10,3,1,'#ffffff'); PX(g,12,3,'#ffffff');
  R(g,0,15,16,1,C.snowDD); R(g,15,0,1,16,C.snowDD);
});}
/* ---------- AGUA (autotile por vecinos: N=1 E=2 S=4 W=8 = orilla) ---------- */
function waterTile(kind,edges,f,bio){ // kind: 'W' profunda, '~' marisma, 'w' vado
  return cached('water'+kind+edges+f+bio,g=>{
    const marsh=kind==='~', shallow=kind==='w';
    const base=marsh?'#486848':shallow?'#68a8e8':C.water, dark=marsh?'#3a5638':shallow?'#4888d0':C.waterD, light=marsh?'#6a8a58':shallow?'#a8d8f8':C.waterL;
    R(g,0,0,16,16,base);
    for(let r=0;r<2;r++){ const y=(r*8+f*4+2)%16; R(g,1+f*2,y,4,1,light); R(g,9+(1-f)*2,(y+8)%16,4,1,light); }
    if(shallow){ R(g,3,6+f*2,2,1,'#ffffff'); R(g,11,12-f*3,2,1,'#ffffff'); }
    // orillas: espuma y sombra
    const G=BIOMES[bio]?BIOMES[bio].grass:BIOMES.valley.grass;
    const shoreCol=bio==='snow'?C.snowDD:(marsh?C.leafDD:G[2]);
    if(edges&1){ R(g,0,0,16,1,shoreCol); R(g,0,1,16,1,dark); if(!marsh){ for(let x=(f?1:3);x<16;x+=5) R(g,x,2,2,1,C.foam); } }
    if(edges&8){ R(g,0,0,1,16,shoreCol); R(g,1,0,1,16,dark); if(!marsh){ for(let y=(f?2:0);y<16;y+=5) R(g,2,y,1,2,C.foam); } }
    if(edges&2){ R(g,15,0,1,16,shoreCol); R(g,14,0,1,16,light); }
    if(edges&4){ R(g,0,15,16,1,shoreCol); R(g,0,14,16,1,light); if(!marsh){ for(let x=(f?3:0);x<16;x+=5) R(g,x,13,2,1,C.foam); } }
    // esquinas interiores (diagonal en tierra, lados en agua)
    if(edges&16){ PX(g,0,0,shoreCol); PX(g,1,1,dark); }
    if(edges&32){ PX(g,15,0,shoreCol); PX(g,14,1,dark); }
    if(edges&64){ PX(g,15,15,shoreCol); PX(g,14,14,light); }
    if(edges&128){ PX(g,0,15,shoreCol); PX(g,1,14,light); }
    if(marsh){ R(g,12-f*3,2+f*6,2,1,'#7a9a68'); PX(g,4+f*5,12,'#7a9a68'); if(edges&4){ R(g,3,9,1,5,'#8a9a48'); R(g,4,8+f,1,2,'#c8b050'); R(g,11,10,1,4,'#8a9a48'); R(g,12,9-f,1,2,'#c8b050'); } }
  });
}
/* ---------- ACANTILADO / MONTAÑA (autotile) ---------- */
function cliffTile(edges,v,bio){ // edges: bits de vecinos ABIERTOS (no-acantilado) N=1 E=2 S=4 W=8 + diagonales
  return cached('cliff'+edges+v+bio,g=>{
    const snow=bio==='snow', aut=bio==='autumn';
    const top=snow?'#9aa2b8':aut?'#b09070':'#a89878', topL=snow?'#c0c8d8':aut?'#d0b090':'#c8b898', topD=snow?'#78809a':aut?'#8a6c50':'#807058';
    const face=snow?'#5c6480':aut?'#7a5a40':'#7a6a50', faceD=snow?'#3e4460':aut?'#4e3828':'#4e4234', faceL=snow?'#7c86a4':aut?'#a07858':'#a08868';
    R(g,0,0,16,16,top); const rnd=seeded(v*53+edges*7+(snow?3:0));
    for(let i=0;i<7;i++){ const x=(rnd()*14)|0,y=(rnd()*14)|0,w=1+((rnd()*3)|0); R(g,x,y,w,1,topD); if(rnd()<.5) R(g,x+1,y+1,w,1,topD); }
    for(let i=0;i<4;i++){ const x=(rnd()*14)|0,y=(rnd()*14)|0; R(g,x,y,2,1,topL); }
    if(snow){ R(g,1,1,5,2,'#e8f0f8'); R(g,8,5,6,2,'#e8f0f8'); R(g,3,10,4,2,'#e8f0f8'); R(g,10,11,3,1,'#e8f0f8'); }
    const openS=edges&4;
    if(openS){ // cara del acantilado: estratos horizontales y grietas verticales
      R(g,0,7,16,9,face); R(g,0,7,16,1,faceL); R(g,0,11,16,1,faceD); R(g,0,13,16,1,faceL); R(g,0,9,16,1,faceL);
      for(let x=1;x<16;x+=4){ const h=hash(x,v)%3; R(g,x+h,8,1,3,faceD); R(g,x+((h+2)%3),12,1,3,faceD); }
      R(g,0,15,16,1,PAL.k); R(g,0,6,16,1,topD);
      if(snow){ R(g,0,6,16,1,'#e8f0f8'); R(g,2,7,3,1,'#e8f0f8'); R(g,9,7,4,1,'#e8f0f8'); }
    }
    if(edges&1){ R(g,0,0,16,1,PAL.k); R(g,0,1,16,1,topL); }
    if(edges&8){ R(g,0,0,1,16,PAL.k); R(g,1,0,1,openS?7:16,topL); }
    if(edges&2){ R(g,15,0,1,16,PAL.k); R(g,14,0,1,openS?7:16,topD); }
    if(!(edges&1)&&!(edges&8)&&(edges&16)){ PX(g,0,0,PAL.k); PX(g,1,1,topL); }
    if(!(edges&1)&&!(edges&2)&&(edges&32)){ PX(g,15,0,PAL.k); PX(g,14,1,topL); }
    if(!(edges&4)&&!(edges&2)&&(edges&64)){ PX(g,15,15,PAL.k); }
    if(!(edges&4)&&!(edges&8)&&(edges&128)){ PX(g,0,15,PAL.k); }
  });
}
/* ---------- MURO DE MAZMORRA (autotile) ---------- */
function wallTile(edges,v,style){ // edges: vecinos abiertos N=1 E=2 S=4 W=8
  return cached('wall'+edges+v+style,g=>{
    const pal=style==='wood'?['#5a3c22','#422c18','#6e4c2c','#8a6438']:style==='hive'?['#a87828','#8a5e1c','#d8a838','#f0c858']:style==='ice'?['#5a6a98','#3a4a78','#8a9ac8','#c8d8f0']:[C.dwall,C.dwallD,C.dwallL,C.dwallLL];
    const [b,d,l,ll]=pal;
    R(g,0,0,16,16,b);
    if(style==='wood'){ for(let y=2;y<16;y+=5) R(g,0,y,16,2,d); for(let y=0;y<16;y+=5) R(g,0,y,16,1,l); R(g,v?4:11,0,1,16,d); }
    else if(style==='hive'){ for(let y=0;y<16;y+=5) for(let x=((y/5)|0)%2?4:0;x<16;x+=8) R(g,x,y,7,4,d); for(let y=1;y<16;y+=5) for(let x=((y/5)|0+(v?1:0))%2?5:1;x<16;x+=8) R(g,x,y,5,2,l); }
    else { // sillares
      for(let y=0;y<16;y+=4){ R(g,0,y+3,16,1,d); const off=((y/4)|0)%2?4:0; for(let x=off;x<16;x+=8) R(g,x,y,1,3,d); R(g,off+1,y,6,1,l); }
    }
    // biseles hacia los lados abiertos
    if(edges&4){ R(g,0,12,16,4,d); R(g,0,12,16,1,ll); R(g,0,15,16,1,PAL.k); }
    if(edges&1){ R(g,0,0,16,1,PAL.k); R(g,0,1,16,2,ll); }
    if(edges&8){ R(g,0,0,1,16,PAL.k); R(g,1,0,2,16,l); }
    if(edges&2){ R(g,15,0,1,16,PAL.k); R(g,13,0,2,16,d); }
  });
}
/* ---------- OBJETOS SOBRE EL SUELO (transparentes) ---------- */
function treeTile(bio,v){ const P=BIOMES[bio].canopy, snow=bio==='snow'; return cached('tree'+bio+v,g=>{
  R(g,3,13,11,2,'rgba(20,16,12,.22)'); // sombra
  R(g,6,10,4,6,PAL.k); R(g,7,10,2,5,C.trunk); PX(g,7,12,C.trunkL);
  // copa redonda con contorno
  const ROWS=[[5,0,6],[3,1,10],[2,2,12],[1,3,14],[1,4,14],[1,5,14],[1,6,14],[2,7,12],[3,8,10],[5,9,6]];
  ROWS.forEach(([x,y,w])=>R(g,x,y,w,1,PAL.k));
  const IN=[[6,1,4],[4,2,8],[3,3,10],[2,4,12],[2,5,12],[2,6,12],[3,7,10],[4,8,8],[6,9,4]];
  IN.forEach(([x,y,w])=>R(g,x,y,w,1,P[0]));
  [[5,2,3],[4,3,5],[3,4,3],[8,3,2],[4,5,2]].forEach(([x,y,w])=>R(g,x,y,w,1,P[1]));
  [[6,2,2],[5,3,2],[4,4,1]].forEach(([x,y,w])=>R(g,x,y,w,1,P[2]));
  if(v){ R(g,9,6,3,1,P[1]); PX(g,10,5,P[2]); } else { R(g,8,7,3,1,P[1]); }
  if(snow){ R(g,6,1,4,1,'#ffffff'); R(g,4,2,3,1,'#ffffff'); R(g,9,2,3,1,'#e8f0f8'); R(g,3,4,2,1,'#e8f0f8'); R(g,11,4,2,1,'#e8f0f8'); }
});}
function bushTile(bio,v){ const P=BIOMES[bio].bush; return cached('bush'+bio+v,g=>{
  R(g,3,13,11,2,'rgba(20,16,12,.2)');
  const ROWS=[[5,3,6],[3,4,10],[2,5,12],[2,6,12],[2,7,12],[2,8,12],[2,9,12],[3,10,10],[3,11,10],[5,12,6]];
  ROWS.forEach(([x,y,w])=>R(g,x,y,w,1,PAL.k));
  [[6,4,4],[4,5,8],[3,6,10],[3,7,10],[3,8,10],[3,9,10],[4,10,8],[4,11,8]].forEach(([x,y,w])=>R(g,x,y,w,1,P[0]));
  [[6,5,3],[5,6,5],[4,7,3],[9,7,2],[5,8,2],[9,9,3]].forEach(([x,y,w])=>R(g,x,y,w,1,P[1]));
  [[6,5,2],[5,6,2],[9,7,1]].forEach(([x,y,w])=>R(g,x,y,w,1,P[2]));
  if(bio==='snow'){ R(g,6,4,4,1,'#ffffff'); R(g,4,5,3,1,'#e8f0f8'); R(g,10,5,2,1,'#e8f0f8'); }
  if(v){ PX(g,11,6,P[2]); }
});}
function rockTile(v,bio){ return cached('rock'+v+bio,g=>{
  R(g,2,13,12,2,'rgba(20,16,12,.22)');
  const ROWS=[[5,2,6],[3,3,10],[2,4,12],[2,5,12],[2,6,12],[2,7,12],[2,8,12],[2,9,12],[2,10,12],[3,11,10],[4,12,8]];
  ROWS.forEach(([x,y,w])=>R(g,x,y,w,1,PAL.k));
  [[6,3,4],[4,4,8],[3,5,10],[3,6,10],[3,7,10],[3,8,10],[3,9,10],[3,10,10],[4,11,8]].forEach(([x,y,w])=>R(g,x,y,w,1,C.rock));
  [[6,3,3],[4,4,4],[3,5,3],[4,6,1]].forEach(([x,y,w])=>R(g,x,y,w,1,C.rockL));
  [[9,8,4],[8,9,5],[4,10,9],[5,11,7]].forEach(([x,y,w])=>R(g,x,y,w,1,C.rockD));
  R(g,7+v*2,7,2,1,C.rockDD);
  if(bio==='snow'){ R(g,6,3,4,1,'#ffffff'); R(g,4,4,8,1,'#e8f0f8'); R(g,3,5,2,1,'#e8f0f8'); }
});}
function crackedTile(v){ return cached('cracked'+v,g=>{
  g.drawImage(rockTile(v,'valley'),0,0);
  R(g,7,3,1,3,PAL.k); R(g,8,6,1,3,PAL.k); R(g,6,9,1,2,PAL.k); R(g,7,11,1,2,PAL.k);
  R(g,4,7,3,1,PAL.k); R(g,9,6,3,1,PAL.k); PX(g,6,6,C.rockDD); PX(g,9,9,C.rockDD);
});}
function brambleTile(v){ return cached('bramble'+v,g=>{
  R(g,1,2,14,13,PAL.k); R(g,2,3,12,11,'#2a3a20');
  [[3,5,3],[9,4,3],[6,9,4],[3,11,2],[10,10,3]].forEach(([x,y,w])=>R(g,x,y,w,2,'#48582e'));
  [[4,4],[11,7],[6,11],[12,12],[2,8]].forEach(([x,y])=>PX(g,x,y,'#c83838'));
  [[7,3],[3,9],[12,5]].forEach(([x,y])=>PX(g,x,y,'#8a7048'));
});}
function brambleDry(){ return cached('brambleDry',g=>{
  R(g,3,9,4,1,'#8a7048'); R(g,8,11,5,1,'#8a7048'); R(g,5,12,2,1,'#8a7048'); R(g,11,8,1,3,'#8a7048');
  R(g,4,10,1,2,'#6a543c'); R(g,9,9,1,2,'#6a543c');
});}
function signTile(){ return cached('sign',g=>{
  R(g,2,2,12,8,PAL.k); R(g,7,10,2,5,PAL.k); R(g,3,3,10,6,C.wood); R(g,3,3,10,1,C.woodL);
  R(g,4,5,7,1,C.woodD); R(g,4,7,5,1,C.woodD); R(g,7,10,1,5,C.woodD); PX(g,8,10,C.wood);
});}
function runeTile(f){ return cached('rune'+f,g=>{
  R(g,3,1,10,14,PAL.k); R(g,4,2,8,12,C.mount); R(g,4,11,8,3,C.mountD); R(g,5,2,6,1,C.mountL);
  const c=f?'#58e8d8':'#2e9a8e'; R(g,7,4,2,2,c); R(g,6,7,1,2,c); R(g,9,7,1,2,c); R(g,7,10,2,1,c);
});}
function altarTile(s){ return cached('altar'+s,g=>{
  R(g,2,6,12,9,PAL.k); R(g,3,7,10,7,C.rock); R(g,4,7,8,2,C.rockL); R(g,4,12,8,2,C.rockD);
  R(g,4,2,8,5,PAL.k); R(g,5,3,6,3,'#8a8aa0'); R(g,5,5,6,1,'#6a6a80');
  if(s===1){ R(g,7,10,2,2,'#e88ab0'); PX(g,7,10,'#f8c8e0'); }
  else if(s===2){ R(g,7,10,2,2,'#e8b050'); PX(g,6,10,'#f8e060'); PX(g,9,11,'#f8e060'); PX(g,7,9,'#f8e060'); PX(g,8,12,'#f8e060'); }
  else { R(g,7,10,2,2,'#9ec7e8'); PX(g,6,10,'#dff0ff'); PX(g,9,10,'#dff0ff'); PX(g,7,9,'#dff0ff'); PX(g,8,12,'#dff0ff'); }
});}
function houseWall(v){ return cached('hwall'+v,g=>{
  R(g,0,0,16,16,C.wall); for(let y=3;y<16;y+=4){ R(g,0,y,16,1,C.wallD); } R(g,7+(v?0:4),0,1,16,C.wallD);
  R(g,0,0,16,1,C.wallL); PX(g,3,5,C.wallL); PX(g,11,9,C.wallL);
});}
function houseWindow(){ return cached('hwin',g=>{
  g.drawImage(houseWall(0),0,0); R(g,3,3,10,10,PAL.k); R(g,4,4,8,8,'#68a8d8'); R(g,4,4,3,3,'#a8d8f8');
  R(g,7,4,1,8,PAL.k); R(g,4,7,8,1,PAL.k); R(g,2,12,12,2,C.woodD); R(g,3,12,10,1,C.wood);
  R(g,4,11,2,1,'#e84848'); R(g,10,11,2,1,'#f8d030');
});}
function houseDoor(){ return cached('hdoor',g=>{
  g.drawImage(houseWall(1),0,0); R(g,3,1,10,15,PAL.k); R(g,4,2,8,14,'#5a3418'); R(g,4,2,8,1,'#8a5828');
  R(g,5,3,6,12,'#3a2010'); R(g,5,3,1,12,'#6a4020'); R(g,8,3,1,12,'#6a4020'); R(g,10,8,1,2,PAL.a);
});}
function roofTile(v,edges){ return cached('roof'+v+edges,g=>{
  R(g,0,0,16,16,C.roof); for(let y=0;y<16;y+=4){ R(g,0,y+2,16,1,C.roofD); R(g,0,y+3,16,1,PAL.k); for(let x=((y/4)|0)%2?4:0;x<16;x+=8) R(g,x,y,1,3,C.roofD); R(g,((y/4)|0)%2?5:1,y,3,1,C.roofL); }
  if(edges&1){ R(g,0,0,16,1,PAL.k); R(g,0,1,16,1,C.roofL); }
  if(edges&4){ R(g,0,14,16,2,C.roofD); R(g,0,15,16,1,PAL.k); }
  if(edges&8) R(g,0,0,1,16,PAL.k); if(edges&2) R(g,15,0,1,16,PAL.k);
});}
function caveTile(bio){ return cached('cave'+bio,g=>{
  const snow=bio==='snow'; R(g,0,0,16,16,snow?'#7a7a98':C.cliffD); R(g,0,0,16,2,snow?'#e8f0f8':C.cliffL);
  R(g,3,3,10,13,PAL.k); R(g,4,4,8,12,'#16121e'); R(g,4,4,8,2,'#3a3448'); R(g,5,6,6,1,'#2a2438');
  R(g,2,2,1,14,snow?'#5a5a78':C.cliffDD); R(g,13,2,1,14,snow?'#5a5a78':C.cliffDD);
});}
function stairsTile(){ return cached('stairs',g=>{
  R(g,2,2,12,12,PAL.k); R(g,3,3,10,3,'#3a3026'); R(g,4,6,8,3,'#2a2018'); R(g,5,9,6,4,'#16100c'); R(g,3,3,10,1,'#6a5a4c');
});}
function holeTile(style){ return cached('hole'+style,g=>{
  R(g,1,1,14,14,PAL.k); R(g,2,2,12,12,'#0a0806'); R(g,2,2,12,1,'#2a2420'); R(g,2,2,1,12,'#2a2420'); R(g,3,3,4,1,'#1a1610');
});}
function blockTile(){ return cached('block',g=>{
  R(g,1,1,14,14,PAL.k); R(g,2,2,12,12,'#8a7460'); R(g,3,3,5,3,'#a89078'); R(g,9,8,3,3,'#a89078');
  R(g,2,2,2,2,'#3a7a30'); R(g,12,12,2,2,'#3a7a30'); R(g,4,10,7,2,'#6a5a4c'); R(g,2,13,12,1,'#5a4a3c');
});}
function plateTile(pressed){ return cached('plate'+pressed,g=>{
  R(g,3,3,10,10,PAL.k); if(!pressed){ R(g,4,4,8,8,'#6e5a8a'); R(g,5,5,6,2,'#9a86c8'); }
  else { R(g,4,4,8,8,'#3a2e5a'); R(g,6,6,4,4,'#58e8d8'); }
});}
function switchTile(pressed){ return cached('switch'+pressed,g=>{
  R(g,3,3,10,10,PAL.k); R(g,4,4,8,8,pressed?'#6a6a80':'#8a8aa0'); if(!pressed) R(g,5,5,6,2,'#b8c0d0'); R(g,7,7,2,2,'#58e8d8');
});}
function gateTile(){ return cached('gate',g=>{
  R(g,1,0,3,16,PAL.k); R(g,6,0,3,16,PAL.k); R(g,11,0,3,16,PAL.k); R(g,2,0,1,16,'#8a7048'); R(g,7,0,1,16,'#8a7048'); R(g,12,0,1,16,'#8a7048');
  R(g,0,2,16,2,PAL.k); R(g,0,12,16,2,PAL.k); R(g,0,2,16,1,'#6a5838');
});}
function lockedTile(){ return cached('locked',g=>{
  g.drawImage(gateTile(),0,0); R(g,5,5,6,7,PAL.k); R(g,6,6,4,5,PAL.A); R(g,7,7,2,3,PAL.a); PX(g,7,7,PAL.y);
});}
function bossDoorTile(){ return cached('bossdoor',g=>{
  R(g,0,0,16,16,C.dwallD); R(g,1,0,14,16,PAL.k); R(g,2,1,12,15,'#5a3040'); R(g,2,1,12,1,'#8a5060');
  R(g,5,4,6,8,PAL.k); R(g,6,5,4,6,'#f8d030'); R(g,7,6,2,2,PAL.k); R(g,7,8,2,3,PAL.k); PX(g,7,6,'#fff0a0');
});}
function torchTile(lit,f){ return cached('torch'+lit+f,g=>{
  R(g,6,7,4,8,PAL.k); R(g,7,8,2,6,'#8a5828'); R(g,5,6,6,2,PAL.k); R(g,6,6,4,1,'#6a4828');
  if(lit){ const h=f?5:4; R(g,6,2-f,4,h,'#f8a030'); R(g,7,1-f,2,h,'#f8e060'); PX(g,7+(f?1:0),3,'#ffffff'); R(g,5,3,1,3,'#f8a030'); R(g,10,2+f,1,3,'#f8a030'); }
  else { R(g,6,3,4,3,'#3a3020'); R(g,7,4,2,1,'#5a4a30'); }
});}
function crystalTile(state){ return cached('crystal'+state,g=>{ // interruptor de cristal
  R(g,4,12,8,3,PAL.k); R(g,5,13,6,1,'#6a6a80');
  const c=state?'#e85050':'#4888e8', l=state?'#f8a0a0':'#a0d0ff';
  R(g,7,2,2,1,PAL.k); R(g,6,3,4,1,PAL.k); R(g,5,4,6,8,PAL.k); R(g,6,4,4,8,c); R(g,7,3,2,1,c); R(g,6,5,1,4,l); PX(g,7,4,'#ffffff');
});}
function toggleBlock(red,up){ return cached('toggle'+red+up,g=>{ // bloques rojo/azul
  const c=red?'#c84040':'#4060c8', l=red?'#f08080':'#80a0f0', d=red?'#802020':'#203080';
  if(up){ R(g,1,1,14,14,PAL.k); R(g,2,2,12,12,c); R(g,3,3,10,2,l); R(g,3,3,2,10,l); R(g,3,12,11,2,d); R(g,12,3,2,11,d); }
  else { R(g,2,2,12,12,d); R(g,3,3,10,10,c); R(g,3,3,10,1,l); R(g,3,3,1,10,l); g.globalAlpha=.55; R(g,2,2,12,12,C.dfloor); g.globalAlpha=1; }
});}
function postTile(){ return cached('post',g=>{ // poste de raíz (blanco del gancho)
  R(g,5,3,6,12,PAL.k); R(g,6,4,4,10,'#8a5828'); R(g,6,4,1,10,'#b07040'); R(g,4,2,8,3,PAL.k); R(g,5,3,6,1,'#3a8a30'); R(g,6,1,4,2,PAL.l); PX(g,7,0,PAL.L);
});}
function chestTile(open){ return cached('chest'+open,g=>{
  R(g,2,4,12,11,PAL.k); R(g,3,5,10,9,'#9f7547'); R(g,3,5,10,1,'#c09060');
  if(!open){ R(g,3,5,10,4,'#b9985e'); R(g,3,8,10,1,'#5d452e'); R(g,7,8,2,3,'#f0d28a'); PX(g,7,8,'#ffffff'); }
  else { R(g,3,2,10,4,PAL.k); R(g,4,3,8,2,'#b9985e'); R(g,4,6,8,4,'#2a1c10'); R(g,6,7,4,2,'#f8d030'); }
  R(g,4,6,1,8,'#dcba72'); R(g,11,6,1,8,'#dcba72');
});}
function fenceTile(){ return cached('fence',g=>{
  R(g,2,4,3,10,PAL.k); R(g,11,4,3,10,PAL.k); R(g,3,5,1,8,C.wood); R(g,12,5,1,8,C.wood); R(g,0,7,16,2,C.woodD); R(g,0,7,16,1,C.wood);
});}
function potTile(){ return cached('pot',g=>{ // maceta decorativa de interior
  R(g,4,6,8,9,PAL.k); R(g,5,7,6,7,'#c06030'); R(g,5,12,6,2,'#8a3818'); R(g,7,2,2,3,'#2e8038'); R(g,5,3,2,2,PAL.l); R(g,9,4,2,2,PAL.l);
});}
function bedTile(){ return cached('bed',g=>{
  R(g,1,2,14,13,PAL.k); R(g,2,3,12,11,'#c06030'); R(g,2,11,12,3,'#8a3818'); R(g,3,4,10,5,'#3a2410'); R(g,4,5,3,1,'#241608'); R(g,9,7,3,1,'#241608'); R(g,4,4,3,2,PAL.l);
});}
function matTile(){ return cached('mat',g=>{ R(g,2,3,12,11,'#e8d0a0'); R(g,3,4,10,9,'#c8a878'); R(g,4,5,8,7,'#e8d0a0'); R(g,5,7,6,1,'#c8a878'); R(g,5,9,6,1,'#c8a878'); });}
function counterTile(){ return cached('counter',g=>{
  R(g,0,0,16,16,'#8a5828'); R(g,0,0,16,6,'#c08850'); R(g,0,0,16,1,'#e0a868'); R(g,0,6,16,2,'#a87840'); R(g,0,13,16,3,'#6a4828'); R(g,0,15,16,1,PAL.k);
  R(g,3,2,2,2,PAL.a); R(g,11,2,2,2,PAL.a);
});}
function shelfTile(){ return cached('shelf',g=>{
  R(g,0,0,16,16,'#6a4828'); R(g,1,1,14,14,'#8a5828'); R(g,1,5,14,2,'#c08850'); R(g,1,11,14,2,'#c08850');
  R(g,3,2,2,3,PAL.l); R(g,7,2,3,3,'#58e8d8'); R(g,12,3,2,2,PAL.a); R(g,4,8,2,2,'#d84878'); R(g,10,8,3,2,'#d84878');
});}
function interiorWall(){ return cached('iwall',g=>{ R(g,0,0,16,16,'#6a4828'); for(let y=3;y<16;y+=4) R(g,0,y,16,1,'#4a3018'); R(g,0,0,16,1,'#7e5a36'); R(g,0,14,16,2,PAL.k); });}
function tableTile(){ return cached('table',g=>{ R(g,1,4,14,7,PAL.k); R(g,2,5,12,5,'#c08850'); R(g,2,5,12,1,'#e0a868'); R(g,2,10,2,4,PAL.k); R(g,12,10,2,4,PAL.k); R(g,6,6,4,2,'#e8d0a0'); });}
function lilyTile(f){ return cached('lily'+f,g=>{ // nenúfar: pisable sobre el agua
  R(g,3,5,10,8,PAL.k); R(g,4,6,8,6,'#58a848'); R(g,5,6,6,1,'#88d868'); R(g,8,8,2,2,'#2e7830'); if(f) PX(g,10,5,PAL.z);
});}
function wellTile(){ return cached('well',g=>{
  R(g,1,4,14,11,PAL.k); R(g,2,5,12,9,C.rock); R(g,3,6,10,7,C.rockD); R(g,4,7,8,5,'#1a2a40'); R(g,5,8,6,1,'#3878d8');
  R(g,3,1,2,4,PAL.k); R(g,11,1,2,4,PAL.k); R(g,2,0,12,2,C.woodD); R(g,3,0,10,1,C.wood); R(g,7,2,2,4,'#6a4828'); PX(g,8,3,PAL.a);
  R(g,2,5,12,1,C.rockL); PX(g,4,9,C.rockL);
});}
function moundTile(v){ return cached('mound'+v,g=>{ R(g,3,9,10,5,'#5a4630'); R(g,4,8,8,1,'#6e5a40'); R(g,5,10,6,3,'#241c14'); R(g,6,11,4,1,'#3a3026'); });}
function bookshelfTile(){ return cached('bookshelf',g=>{
  R(g,0,0,16,16,'#6a4828'); R(g,1,1,14,14,'#8a5828'); R(g,1,5,14,1,'#c08850'); R(g,1,10,14,1,'#c08850');
  [[2,1,'#c84848'],[4,1,'#3878d8'],[6,2,'#e8b050'],[8,1,'#2e8038'],[10,1,'#9858c8'],[12,2,'#c84848'],[2,6,'#e8b050'],[5,6,'#2e8038'],[7,7,'#58c8e8'],[9,6,'#c84848'],[11,6,'#f0f0e0'],[13,7,'#3878d8']].forEach(([x,y,c])=>R(g,x,y,2,4-(y%2),c));
  R(g,3,11,10,3,'#e8d0a0'); R(g,4,12,8,1,'#c8a878');
});}
function pillarTile(){ return cached('pillar',g=>{ R(g,3,0,10,16,PAL.k); R(g,4,1,8,14,'#7a7490'); R(g,4,1,8,1,'#9a94b0'); R(g,5,2,2,12,'#9a94b0'); R(g,4,14,8,1,'#4a4460'); });}

/* ============================================================
   LEYENDA DEL MAPA: char → clase de tile
   ============================================================ */
const GROUND=new Set(['.',',','f','t','p','s','n','i','·','q','o','m','w','@','x','_','ç','%','&','º','æ','°','>','ʘ']);
const WATER=new Set(['W','~','w','@']);
const SOLID=new Set(['W','~','T','Y','¥','b','Q','r','M','v','I','H','"','D','R','G','C','k','#','=',')','Ł',':',';','¢','ª','Æ','S','O','[',']','}','E','u','P','ñ','⌐','¤','F','Ñ','¶','h','j','y','g','ö','Ω','Ⓑ','ø']);
const ENEMY_MARK={ B:'blob', V:'bat', Z:'beetle', U:'roller', N:'ghost', X:'frog', '*':'thorn', '∞':'gust', '$':'squirrel', '¡':'icicle', '¿':'seton', c:'crab', 'Φ':'wisp', 'β':'bee', 'Γ':'golem', 'Σ':'snail', 'π':'topillo', 'λ':'lirio', 'Ψ':'rodahoja' };
const MIDBOSS_MARK={ 'ℜ':'king', 'Δ':'drone', 'Θ':'iceguard' };
const BOSS_MARK={ J:'topo', '!':'avispa', '^':'viento' };
const ITEM_MARK={ L:'blade', K:'bomb', '+':'hook', '£':'boomer', '§':'lantern', '¬':'feather', '¦':'shield', 'ł':'bigkey', '(':'key', '9':'container', '♥':'piece', '0':'diary', '✉':'letter' };
const CLIFF_LIKE=ch=>ch==='M';
const WALL_LIKE=ch=>ch==='v'||ch==='I';
function isGroundCh(ch){ return GROUND.has(ch); }
/* qué suelo hay bajo un objeto: el de los vecinos, o el del bioma */
function groundUnder(rows,x,y,opts){
  const def=opts.floor;
  const cnt={}; let best=def,bn=0;
  for(const [dx,dy] of [[0,1],[0,-1],[1,0],[-1,0]]){ const r=rows[y+dy]; const ch=r&&r[x+dx];
    if(ch&&GROUND.has(ch)&&!WATER.has(ch)&&ch!=='x'&&ch!=='°'&&ch!=='>'){ const g=(ch===','||ch==='f'||ch==='t')?'.':(ch==='_'||ch==='ç'||ch==='%'||ch==='&'||ch==='º'||ch==='æ')?def:ch; cnt[g]=(cnt[g]||0)+1; if(cnt[g]>bn){bn=cnt[g];best=g;} } }
  return best;
}
function edgesOf(rows,x,y,test){ // bitmask de vecinos que cumplen test (fuera del mapa = como el propio)
  const at=(dx,dy)=>{ const r=rows[y+dy]; if(!r) return null; const ch=r[x+dx]; return ch===undefined?null:ch; };
  const t=(dx,dy)=>{ const ch=at(dx,dy); return ch===null?false:test(ch); };
  let e=0; if(t(0,-1))e|=1; if(t(1,0))e|=2; if(t(0,1))e|=4; if(t(-1,0))e|=8;
  if(t(-1,-1))e|=16; if(t(1,-1))e|=32; if(t(1,1))e|=64; if(t(-1,1))e|=128; return e;
}
/* dibuja el suelo de la celda */
function drawGround(g,rows,x,y,ch,opts,f){
  const px=x*16,py=y*16, bio=opts.bio, v=hash(x+opts.sx*SW,y+opts.sy*SH);
  const style=opts.style;
  switch(ch){
    case '.': case ',': g.drawImage(bio==='snow'?snowTile(v%3):bio==='autumn'?leafTile(v%3):grassTile(bio,v%3),px,py); return;
    case 'f': g.drawImage(bio==='snow'?snowTile(v%3):flowerTile(bio,v%3),px,py); return;
    case 't': g.drawImage(bio==='snow'?snowTile(v%3):tallGrassTile(bio,f),px,py); return;
    case 'p': { const e=edgesOf(rows,x,y,c=>c!=='p'&&!SOLID.has(c)&&c!=='s'); g.drawImage(pathTile(v%2,e&15,bio),px,py); return; }
    case 's': { const e=edgesOf(rows,x,y,c=>c!=='s'&&!SOLID.has(c)&&!WATER.has(c)&&c!=='p'); g.drawImage(sandTile(v%2,e&15,bio),px,py); return; }
    case 'n': g.drawImage(snowTile(v%3),px,py); return;
    case 'i': g.drawImage(iceTile(v%2),px,py); return;
    case '·': g.drawImage(leafTile(v%3),px,py); return;
    case 'q': g.drawImage(dfloorTile(v%3,style),px,py); return;
    case 'o': case 'x': g.drawImage(woodFloorTile(v%2),px,py); if(ch==='x') g.drawImage(matTile(),px,py); return;
    case 'm': { const e=edgesOf(rows,x,y,c=>c!=='m'&&!WATER.has(c)); g.drawImage(mudTile(v%3,e&15),px,py); return; }
    case 'W': case '~': case 'w': case '@': {
      const e=edgesOf(rows,x,y,c=>!WATER.has(c)); g.drawImage(waterTile(ch==='@'?'W':ch,e,f,bio),px,py);
      if(ch==='@') g.drawImage(lilyTile(v%2),px,py); return; }
    case '_': g.drawImage(dfloorTile(v%3,style),px,py); g.drawImage(plateTile(0),px,py); return;
    case 'ç': g.drawImage(dfloorTile(v%3,style),px,py); g.drawImage(plateTile(1),px,py); return;
    case '%': g.drawImage(dfloorTile(v%3,style),px,py); g.drawImage(switchTile(0),px,py); return;
    case '&': g.drawImage(dfloorTile(v%3,style),px,py); g.drawImage(switchTile(1),px,py); return;
    case 'º': g.drawImage(dfloorTile(v%3,style),px,py); g.drawImage(toggleBlock(1,0),px,py); return;
    case 'æ': g.drawImage(dfloorTile(v%3,style),px,py); g.drawImage(toggleBlock(0,0),px,py); return;
    case '°': g.drawImage(dfloorTile(v%3,style),px,py); g.drawImage(holeTile(style),px,py); return;
    case '>': g.drawImage(dfloorTile(v%3,style),px,py); g.drawImage(stairsTile(),px,py); return;
    case 'ʘ': { const under=groundUnder(rows,x,y,opts); drawGround(g,rows,x,y,under,opts,f); g.drawImage(moundTile(v%2),px,py); return; }
  }
  // objeto: suelo de debajo
  const under=groundUnder(rows,x,y,opts);
  if(under!==ch) drawGround(g,rows,x,y,under,opts,f);
}
function drawObject(g,rows,x,y,ch,opts,f){
  const px=x*16,py=y*16, bio=opts.bio, v=hash(x*3+opts.sx*SW,y*7+opts.sy*SH), style=opts.style;
  switch(ch){
    case 'T': g.drawImage(treeTile(bio,v%2),px,py); return;
    case 'Y': g.drawImage(treeTile('snow',v%2),px,py); return;
    case '¥': g.drawImage(treeTile('autumn',v%2),px,py); return;
    case 'b': case 'Q': case 'ø': g.drawImage(bushTile(bio,v%2),px,py); return;
    case 'Ω': g.drawImage(wellTile(),px,py); return;
    case 'Ⓑ': g.drawImage(bookshelfTile(),px,py); return;
    case 'ʘ': g.drawImage(moundTile(v%2),px,py); return;
    case 'r': g.drawImage(rockTile(v%2,bio),px,py); return;
    case 'C': g.drawImage(crackedTile(v%2),px,py); return;
    case 'M': { const e=edgesOf(rows,x,y,c=>!CLIFF_LIKE(c)); g.drawImage(cliffTile(e,v%3,bio),px,py); return; }
    case 'v': { const e=edgesOf(rows,x,y,c=>!WALL_LIKE(c)); g.drawImage(wallTile(e&15,v%2,style),px,py); return; }
    case 'I': { const e=edgesOf(rows,x,y,c=>c!=='I'); g.drawImage(interiorWall(),px,py); if(e&4){ R(g,px,py+14,16,2,PAL.k); } return; }
    case 'H': g.drawImage(houseWall(v%2),px,py); return;
    case '"': g.drawImage(houseWindow(),px,py); return;
    case 'D': g.drawImage(houseDoor(),px,py); return;
    case 'R': { const e=edgesOf(rows,x,y,c=>c!=='R'); g.drawImage(roofTile(v%2,e&15),px,py); return; }
    case 'G': g.drawImage(caveTile(bio),px,py); return;
    case 'z': g.drawImage(brambleTile(v%2),px,py); return;
    case 'k': g.drawImage(postTile(),px,py); return;
    case '#': g.drawImage(blockTile(),px,py); return;
    case '=': g.drawImage(gateTile(),px,py); return;
    case ')': g.drawImage(lockedTile(),px,py); return;
    case 'Ł': g.drawImage(bossDoorTile(),px,py); return;
    case ':': g.drawImage(torchTile(0,f),px,py); return;
    case ';': g.drawImage(torchTile(1,f),px,py); return;
    case '¢': g.drawImage(crystalTile(opts.crystal?1:0),px,py); return;
    case 'ª': g.drawImage(toggleBlock(1,1),px,py); return;
    case 'Æ': g.drawImage(toggleBlock(0,1),px,py); return;
    case 'S': g.drawImage(signTile(),px,py); return;
    case 'O': g.drawImage(runeTile(f),px,py); return;
    case '[': g.drawImage(altarTile(1),px,py); return;
    case ']': g.drawImage(altarTile(2),px,py); return;
    case '}': g.drawImage(altarTile(3),px,py); return;
    case 'u': g.drawImage(potTile(),px,py); return;
    case 'P': g.drawImage(bedTile(),px,py); return;
    case 'ñ': g.drawImage(counterTile(),px,py); return;
    case '⌐': g.drawImage(shelfTile(),px,py); return;
    case '¤': g.drawImage(chestTile(opts.openChests&&opts.openChests.has(x+','+y)?1:0),px,py); return;
    case 'F': g.drawImage(fenceTile(),px,py); return;
    case '¶': g.drawImage(pillarTile(),px,py); return;
    case 'Ñ': case 'E': case 'g': return; // suelo sagrado / sitio del anciano / tendero: sin objeto
    case 'zd': g.drawImage(brambleDry(),px,py); return;
    case 't2': g.drawImage(interiorWall(),px,py); return; // mesa (interior)
  }
}
/* pinta una pantalla completa: dos pasadas (suelos, objetos) */
function renderScreenTo(c2d,rows,ox,oy,opts,f){
  f=f||0;
  for(let y=0;y<SH;y++) for(let x=0;x<SW;x++){
    const ch=rows[y][x];
    drawGround(c2d,rows,x,y,ch,{...opts},f);
  }
  for(let y=0;y<SH;y++) for(let x=0;x<SW;x++){
    const ch=rows[y][x];
    if(!GROUND.has(ch)||ch==='@') { if(ch!=='@') drawObject(c2d,rows,x,y,ch,opts,f); }
  }
  // sombras suaves bajo objetos altos hacia el sur (profundidad)
  for(let y=0;y<SH;y++) for(let x=0;x<SW;x++){
    const ch=rows[y][x]; const below=rows[y+1]&&rows[y+1][x];
    if((ch==='M'||ch==='v'||ch==='T'||ch==='Y'||ch==='¥'||ch==='H'||ch==='D'||ch==='"')&&below!==undefined&&!SOLID.has(below)&&!WATER.has(below)){
      c2d.fillStyle='rgba(16,24,20,.18)'; c2d.fillRect(x*16,(y+1)*16,16,3);
    }
  }
  if(ox||oy){ /* compat: renderizar con offset no se usa; se dibuja a 0,0 */ }
}
function isSolidCh(ch,ctxFlags){ // colisión pura por char
  if(ch==='z') return !(ctxFlags&&ctxFlags.brambleDry);
  return SOLID.has(ch);
}
