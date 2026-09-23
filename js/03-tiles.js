'use strict';
/* ============================================================
   TILES: suelo + objeto, con autotiling y paleta por bioma.
   El mapa es texto; aquí se decide cómo se VE cada char.
   renderScreenTo() pinta una pantalla entera a un canvas
   (y, aparte, lo que sobresale por encima de los actores).
   Fotogramas: f = 0..3 (agua, hierba alta y antorchas).
   ============================================================ */
/* paletas de bioma: grass [base, oscuro, muy oscuro, claro];
   leaf = copa de 5 tonos (de sombra a brillo); bush igual */
const BIOMES={
  valley:{ grass:['#78c850','#58a840','#3c8a34','#a4e070'], canopy:['#1e6830','#359045','#58b058'],
    leaf:['#0f3a22','#1f6a32','#33903c','#56b44a','#96dc68'], bush:['#2e8038','#58b048','#a0e070'], bushL:['#12421e','#2a7a34','#46a040','#72c450','#b0ec78'],
    flowers:['#f04848','#fffbe8','#f8a0d0'], trunk:['#4a2410','#7a4424','#a86a38'] },
  summer:{ grass:['#8cd04a','#6aac3a','#4c8e30','#bcea68'], canopy:['#256c2c','#3a9a40','#68c058'],
    leaf:['#123e1a','#246c2c','#3a9a40','#66c252','#b4ec70'], bush:['#3a8a38','#68b848','#b0e870'], bushL:['#164a1a','#2f8434','#52aa40','#84cc4c','#c4f07a'],
    flowers:['#f8d030','#fffbe8','#f8a0d0'], trunk:['#4a2410','#7a4424','#a86a38'] },
  wilt:  { grass:['#a8b460','#88963e','#667432','#cad47e'], canopy:['#5a6a30','#7a8a3a','#9aa858'],
    leaf:['#2e3a1a','#4e5e26','#6e8034','#94a444','#c4cc6c'], bush:['#6a6a38','#8a8a48','#a8a860'], bushL:['#343a1a','#566226','#788634','#a0a848','#ccd070'],
    flowers:['#e89a50','#f4ecc0','#d8a8a0'], trunk:['#3e2412','#664026','#8e6038'] },
  autumn:{ grass:['#d0a850','#b08838','#8a6c30','#ecc870'], canopy:['#a05820','#c87830','#e8a040'],
    leaf:['#5a2210','#9a4418','#c86c24','#eaa040','#fcd878'], bush:['#a05820','#c87830','#e8a040'], bushL:['#5a2410','#944618','#c06a24','#e09a3a','#f8cc68'],
    flowers:['#e87040','#fff0c0','#f0b050'], trunk:['#3e2010','#6a3a1e','#946030'] },
  snow:  { grass:['#e8f0f8','#cddcec','#b0c4dc','#ffffff'], canopy:['#1e6830','#359045','#e8f0f8'],
    leaf:['#10302a','#1c5a3a','#2e7a4a','#4c9a5a','#8ab884'], bush:['#2e8038','#58b048','#e8f0f8'], bushL:['#12402a','#28683c','#3e8a4a','#62a858','#98c890'],
    flowers:['#e8f0f8','#ffffff','#cddcec'], trunk:['#3a2418','#5e3e2a','#84603e'] },
};
const TILE_CACHE=new Map();
function cached(key,fn,w,h){ let c=TILE_CACHE.get(key); if(!c){ c=mkTile(fn,w,h); TILE_CACHE.set(key,c); } return c; }
function seeded(seed){ let s=seed|0||1; return ()=>{ s=(s*1103515245+12345)&0x7fffffff; return s/0x7fffffff; }; }
const R=(g,x,y,w,h,col)=>{ g.fillStyle=col; g.fillRect(x,y,w,h); };
const PX=(g,x,y,col)=>{ g.fillStyle=col; g.fillRect(x,y,1,1); };
/* ---------- SUELOS ---------- */
function grassTile(bio,v){ const P=BIOMES[bio].grass, F=BIOMES[bio].flowers; v=v%8; return cached('grass'+bio+v,g=>{
  R(g,0,0,16,16,P[0]); const rnd=seeded(v*97+13);
  // manchas suaves de tono (para que el prado no sea un papel pintado)
  if(v===3||v===5){ const x=2+((rnd()*8)|0),y=2+((rnd()*8)|0); R(g,x+1,y,3,1,P[3]); R(g,x,y+1,5,1,P[3]); PX(g,x+2,y+1,P[0]); } // un claro de luz
  const tuft=(x,y,big)=>{ PX(g,x,y,P[3]); PX(g,x+2,y,P[3]); PX(g,x,y+1,P[1]); PX(g,x+2,y+1,P[1]); PX(g,x+1,y+2,P[2]); PX(g,x+1,y+1,P[1]);
    if(big){ PX(g,x+4,y+1,P[3]); PX(g,x+4,y+2,P[1]); PX(g,x+3,y+2,P[1]); } };
  const tufts=[1,2,1,2,3,0,2,1][v];
  for(let i=0;i<tufts;i++) tuft(1+((rnd()*10)|0),1+((rnd()*11)|0),rnd()<.35);
  for(let i=0;i<3;i++){ PX(g,(rnd()*16)|0,(rnd()*16)|0,P[1]); }
  if(v===5){ const x=3+((rnd()*9)|0),y=4+((rnd()*8)|0); PX(g,x,y,F[1]); PX(g,x,y+1,P[2]); PX(g,x+4,y+3,F[0]); PX(g,x+4,y+4,P[2]); }
  if(v===7){ const x=2+((rnd()*10)|0),y=3+((rnd()*10)|0); R(g,x,y,2,1,'#e8e0c8'); PX(g,x,y+1,P[2]); PX(g,x+1,y+1,P[2]); PX(g,x+2,y,P[1]); }
});}
function flowerTile(bio,v,f){ const P=BIOMES[bio].grass, F=BIOMES[bio].flowers; const sw=((f||0)>>1)&1; return cached('flower'+bio+v+sw,g=>{
  g.drawImage(grassTile(bio,v%3),0,0);
  const spots=[[2,2],[9,6],[4,10],[11,11]].filter((_,i)=>((v>>i)&1)||i<2);
  spots.forEach(([x,y],i)=>{ const col=F[(i+v)%F.length], dark=shade(col,-.28), s=(i&1)?sw:0;
    PX(g,x+1,y+3,P[2]); PX(g,x+1,y+4,P[1]); PX(g,x+2,y+4,P[2]);                         // tallo y hojita
    R(g,x+1+s,y,1,1,col); R(g,x+s,y+1,1,1,col); R(g,x+2+s,y+1,1,1,dark); R(g,x+1+s,y+2,1,1,dark);
    PX(g,x+1+s,y+1,C.flowerC); PX(g,x+s,y,shade(col,.45)); });
});}
function tallGrassTile(bio,f){ const P=BIOMES[bio].grass; f=f||0; return cached('tall'+bio+f,g=>{
  g.drawImage(grassTile(bio,1),0,0);
  R(g,1,12,14,3,P[2]); R(g,0,13,16,2,P[2]);
  for(let i=0;i<5;i++){ const x=1+i*3, h=8+((i*5)%4), sway=Math.round(Math.sin(f/4*6.283+i*1.3)*1.1);
    for(let k=0;k<h;k++){ const yy=14-k, xx=x+(k>h-4?sway:0); PX(g,xx,yy,k>h-3?P[3]:k>h-6?P[0]:P[1]); }
    const x2=x+1, h2=h-3; for(let k=0;k<h2;k++){ const yy=14-k, xx=x2+(k>h2-3?sway:0); PX(g,xx,yy,k>h2-2?P[0]:P[2]); } }
  R(g,0,15,16,1,P[2]);
});}
function snowTile(v){ return cached('snowg'+(v%6),g=>{ const P=BIOMES.snow.grass; R(g,0,0,16,16,P[0]); const rnd=seeded(v*57+3);
  for(let i=0;i<2;i++){ const x=(rnd()*12)|0,y=(rnd()*13)|0; R(g,x,y,4,1,P[3]); R(g,x+1,y+1,3,1,P[1]); }
  for(let i=0;i<4;i++) PX(g,(rnd()*16)|0,(rnd()*16)|0,P[1]);
  if(v%6===2){ PX(g,6,6,'#ffffff'); PX(g,11,10,'#ffffff'); }
});}
/* borde orgánico: devuelve la profundidad (0..2) de la mordida en la posición i del borde */
/* bordes limpios entre un suelo (camino, arena) y la hierba: perfiles suaves
   que empiezan y acaban a la misma altura (empalman con la celda vecina),
   remates redondos donde la hierba se acaba y cuñas en las esquinas interiores */
const EDGE_PROF=[[2,2,2,2,3,3,3,2,2,2,2,2,1,1,2,2],[2,2,1,1,1,2,2,2,3,3,3,3,2,2,2,2],[2,2,2,3,3,2,2,2,2,1,1,2,2,2,2,2],[2,2,2,2,2,2,1,1,2,2,3,3,3,2,2,2]];
function edgeMask(v,edges){ // true = hierba
  const m=new Uint8Array(256), set=(x,y)=>{ if(x>=0&&y>=0&&x<16&&y<16) m[y*16+x]=1; };
  const taper=(i,a,b)=>{ let d=99; if(a) d=Math.min(d,[0,1,1,2][Math.min(3,i)]); if(b) d=Math.min(d,[0,1,1,2][Math.min(3,15-i)]); return d; };
  const side=(bit,k,lo,hi,put)=>{ if(!(edges&bit)) return; const P=EDGE_PROF[(v+k)&3];
    for(let i=0;i<16;i++){ const d=Math.min(P[i],taper(i,lo,hi)); for(let j=0;j<d;j++) put(i,j); } };
  // remates: la hierba de un lado se acaba si la diagonal es camino (y el lado contiguo también)
  side(1,0,!(edges&8)&&!(edges&16),!(edges&2)&&!(edges&32),(i,j)=>set(i,j));
  side(4,1,!(edges&8)&&!(edges&128),!(edges&2)&&!(edges&64),(i,j)=>set(i,15-j));
  side(8,2,!(edges&1)&&!(edges&16),!(edges&4)&&!(edges&128),(i,j)=>set(j,i));
  side(2,3,!(edges&1)&&!(edges&32),!(edges&4)&&!(edges&64),(i,j)=>set(15-j,i));
  // esquinas exteriores redondeadas (dos lados de hierba)
  const round=(cx,cy)=>{ for(let y=0;y<4;y++) for(let x=0;x<4;x++){ const dx=3.5-x, dy=3.5-y; if(dx*dx+dy*dy>9.5) set(cx?15-x:x,cy?15-y:y); } };
  if((edges&1)&&(edges&8)) round(0,0); if((edges&1)&&(edges&2)) round(1,0); if((edges&4)&&(edges&8)) round(0,1); if((edges&4)&&(edges&2)) round(1,1);
  // esquinas interiores: cuña de hierba en la diagonal
  const wedge=(cx,cy)=>{ for(let y=0;y<3;y++) for(let x=0;x<3;x++) if(x+y<3) set(cx?15-x:x,cy?15-y:y); };
  if(!(edges&1)&&!(edges&8)&&(edges&16)) wedge(0,0); if(!(edges&1)&&!(edges&2)&&(edges&32)) wedge(1,0);
  if(!(edges&4)&&!(edges&2)&&(edges&64)) wedge(1,1); if(!(edges&4)&&!(edges&8)&&(edges&128)) wedge(0,1);
  return m;
}
function paintEdges(g,v,edges,G,shadowCol,rimCol){
  const m=edgeMask(v,edges), at=(x,y)=>x<0||y<0||x>15||y>15?-1:m[y*16+x];
  for(let y=0;y<16;y++) for(let x=0;x<16;x++){
    if(m[y*16+x]){ // hierba: el pixel que toca el suelo es el labio oscuro; los demás, base con alguna brizna
      const lip=at(x+1,y)===0||at(x-1,y)===0||at(x,y+1)===0||at(x,y-1)===0;
      PX(g,x,y,lip?G[1]:((x*7+y*3+v)%11===0?G[3]:G[0])); }
    else if(at(x,y-1)===1||at(x-1,y)===1) PX(g,x,y,shadowCol);          // sombra del labio (luz de arriba-izq)
    else if(rimCol&&(at(x,y+1)===1||at(x+1,y)===1)) PX(g,x,y,rimCol); }
  // briznas que asoman sobre el suelo desde el borde norte
  if(edges&1) for(let x=3+(v&3)*2;x<14;x+=7){ let y=0; while(y<15&&m[y*16+x]) y++; if(y>0&&y<15){ PX(g,x,y,G[1]); PX(g,x+1,y,G[2]); PX(g,x,y+1,G[2]); } }
}
function pathTile(v,edges,bio){ // edges: N=1 E=2 S=4 W=8 (+diagonales) de vecinos que NO son camino
  return cached('path'+v+'_'+edges+bio,g=>{
    const base=bio==='snow'?'#e0d8c8':C.path, dk=bio==='snow'?'#b8b0a0':C.pathD, lt=bio==='snow'?'#f4f0e8':C.pathL;
    R(g,0,0,16,16,base); const rnd=seeded(v*31+7);
    for(let i=0;i<4;i++){ PX(g,(rnd()*16)|0,(rnd()*16)|0,dk); }
    for(let i=0;i<2;i++){ const x=2+((rnd()*11)|0), y=3+((rnd()*10)|0); R(g,x,y,2,1,lt); R(g,x,y+1,2,1,dk); }       // guijarros
    if(v&1){ const x=3+((rnd()*9)|0), y=4+((rnd()*8)|0); PX(g,x,y,'#9a8a6a'); PX(g,x+1,y,lt); }
    const G=(BIOMES[bio]||BIOMES.valley).grass;
    paintEdges(g,v,edges,G,dk,shade(base,.08));
  });
}
function sandTile(v,edges,bio){
  return cached('sand'+v+'_'+edges+bio,g=>{
    R(g,0,0,16,16,C.sand); const rnd=seeded(v*17+3);
    for(let i=0;i<2;i++){ const x=(rnd()*10)|0, y=3+((rnd()*10)|0); R(g,x,y,5,1,C.sandL); PX(g,x+5,y+1,C.sandD); R(g,x+1,y+1,4,1,C.sandD); } // ondas
    for(let i=0;i<3;i++){ PX(g,(rnd()*16)|0,(rnd()*16)|0,C.sandD); }
    if(v===1){ const x=4+((rnd()*6)|0), y=5+((rnd()*6)|0); R(g,x,y,3,2,'#f8c8b0'); PX(g,x+1,y,'#fff0e0'); PX(g,x,y+2,'#c88a70'); PX(g,x+2,y+2,'#c88a70'); } // concha
    const G=(BIOMES[bio]||BIOMES.valley).grass;
    paintEdges(g,v,edges,G,C.sandD,C.sandL);
  });
}
function leafTile(v){ return cached('leaf'+(v%6),g=>{ // hojarasca de otoño
  R(g,0,0,16,16,C.leaf); const rnd=seeded(v*41+5);
  for(let i=0;i<6;i++){ const x=(rnd()*15)|0,y=(rnd()*15)|0; R(g,x,y,2,1,rnd()<.4?C.leafDD:C.leafD); }
  for(let i=0;i<3;i++){ const x=(rnd()*13)|0,y=(rnd()*13)|0, c=rnd()<.5?C.autL:C.aut; R(g,x,y,2,1,c); PX(g,x+1,y+1,C.autD); PX(g,x+2,y,shade(c,.3)); }
  if(v%3===0){ PX(g,11,3,'#e84830'); PX(g,12,4,'#a02810'); }
});}
function mudTile(v,edges,bio){ return cached('mud'+v+'_'+edges+bio,g=>{
  R(g,0,0,16,16,C.mud); const rnd=seeded(v*23+1);
  for(let i=0;i<5;i++){ R(g,(rnd()*14)|0,(rnd()*15)|0,2,1,C.mudD); }
  for(let i=0;i<3;i++){ R(g,(rnd()*15)|0,(rnd()*16)|0,2,1,C.mudL); }
  for(let i=0;i<2;i++){ const x=2+((rnd()*9)|0),y=3+((rnd()*9)|0); R(g,x,y,4,1,'#3e3220'); R(g,x+1,y+1,3,1,'#4a3c26'); PX(g,x+1,y,'#8a7a58'); PX(g,x+2,y,'#a89870'); } // charquitos con brillo
  const G=bio==='autumn'?[C.leaf,C.leafD,C.leafDD,C.leafL]:(BIOMES[bio]||BIOMES.valley).grass;
  paintEdges(g,v,edges,G,C.mudD,C.mudL);
});}
function dfloorTile(v,style){ return cached('dfloor'+v+style,g=>{
  if(style==='wood'){ const b='#8a6438', d='#6a4a28', l='#a8804c';
    R(g,0,0,16,16,b); for(let y=0;y<16;y+=4){ R(g,0,y+3,16,1,d); R(g,0,y,16,1,l); const off=((y/4+v)&1)?5:11; R(g,off,y,1,3,d); }
    PX(g,3+v*4,5,'#5a3a1c'); PX(g,12,13,'#5a3a1c'); return; }
  if(style==='hive'){ const b='#d0a048', d='#a87828', l='#f0c868';
    R(g,0,0,16,16,b); for(let y=0;y<16;y+=5) for(let x=((y/5)&1)*4;x<16;x+=8){ R(g,x,y,7,1,l); R(g,x,y+4,7,1,d); R(g,x,y,1,4,l); R(g,x+6,y,1,4,d); } return; }
  if(style==='ice'){ const b='#8ab0d8', d='#6a90b8', l='#c8e4f8';
    R(g,0,0,16,16,b); R(g,0,0,8,8,'#94badf'); R(g,8,8,8,8,'#94badf');
    for(const [x,y] of [[0,0],[8,0],[0,8],[8,8]]){ R(g,x,y,8,1,l); R(g,x,y,1,8,l); R(g,x+7,y,1,8,d); R(g,x,y+7,8,1,d); }
    R(g,2+v*3,3,3,1,'#ffffff'); PX(g,11,10+v,'#ffffff'); return; }
  // cueva / mazmorra: losas de 8×8 con bisel
  const b=C.dfloor, d=C.dfloorD, l=C.dfloorL, dd='#3a2e28'; const rnd=seeded(v*37+11);
  R(g,0,0,16,16,b);
  for(const [x,y,k] of [[0,0,0],[8,0,1],[0,8,2],[8,8,3]]){ const t=shade(b,(((v+k)*7)%3-1)*.05);
    R(g,x,y,8,8,t); R(g,x,y,7,1,l); R(g,x,y,1,7,l); R(g,x+7,y,1,8,dd); R(g,x,y+7,8,1,dd); PX(g,x+7,y,d); PX(g,x,y+7,d); }
  if(v===1){ PX(g,4,4,d); PX(g,5,5,d); PX(g,5,4,dd); } if(v===2){ R(g,10,11,3,1,'#4a6a38'); PX(g,11,10,'#5a8a44'); }
});}
function woodFloorTile(v){ return cached('wood'+v,g=>{
  const b='#c89858', d='#9a6c38', l='#e0b474';
  R(g,0,0,16,16,b); for(let y=0;y<16;y+=4){ R(g,0,y,16,1,l); R(g,0,y+3,16,1,d); const off=((y>>2)+v)&1?4:11; R(g,off,y,1,4,d); PX(g,off+1,y,l); }
  PX(g,2+v*6,6,'#b08048'); PX(g,9,13,'#b08048');
});}
function iceTile(v){ return cached('ice'+v,g=>{
  R(g,0,0,16,16,C.ice); R(g,1,1,14,14,C.iceL); R(g,2,2,12,12,C.ice);
  R(g,3+v*3,4,4,1,'#ffffff'); R(g,4+v*3,5,2,1,'#ffffff'); R(g,9-v*2,10,3,1,'#ffffff'); PX(g,12,3,'#ffffff');
  R(g,0,15,16,1,C.snowDD); R(g,15,0,1,16,C.snowDD);
});}
/* ---------- AGUA (autotile por vecinos: N=1 E=2 S=4 W=8 = orilla) · 4 fotogramas ---------- */
function waterTile(kind,edges,f,bio){ // kind: 'W' profunda, '~' marisma, 'w' vado
  return cached('water'+kind+edges+f+bio,g=>{
    const marsh=kind==='~', shallow=kind==='w';
    const base=marsh?'#4a6c4a':shallow?'#5aa8e8':'#3a78d8', deep=marsh?'#3a583a':shallow?'#4890d8':'#2c62c0',
          light=marsh?'#6a8a5a':shallow?'#a0d8f8':'#6cb0f0', glint='#e8f8ff';
    R(g,0,0,16,16,base);
    // bandas de profundidad y crestas que avanzan (el patrón repite cada 16 px: sin costuras)
    for(let y=0;y<16;y++) if(((y+2)&7)<2) for(let x=0;x<16;x++) if(((x+y*3+f*2)&7)<3) PX(g,x,y,deep);
    const crest=(x,y)=>{ x=(x+f)&15; PX(g,x,y,light); PX(g,(x+1)&15,y+1,light); PX(g,(x+2)&15,y+1,light); PX(g,(x+3)&15,y,light); };
    crest(1,3); crest(9,11); if(!marsh) crest(12,6);
    if(!marsh&&((f+(kind==='w'?1:0))&3)===1){ PX(g,(5+f*3)&15,8,glint); }
    if(shallow){ PX(g,(3+f)&15,13,'#d8f0ff'); PX(g,(11-f)&15,4,'#d8f0ff'); }
    if(marsh){ R(g,(10+f)&15,2,2,1,'#88a870'); PX(g,(3+f*2)&15,12,'#88a870'); PX(g,6,7,'#2e4a2e'); }
    // orillas: la tierra proyecta sombra y la espuma late con el fotograma
    const G=(BIOMES[bio]||BIOMES.valley).grass, shore=bio==='snow'?'#8aa0c0':(marsh?'#3a4a2a':'#2a3a50');
    const foam=marsh?'#88a870':C.foam, fo=f&1;
    if(edges&1){ R(g,0,0,16,1,shore); R(g,0,1,16,1,deep); for(let x=0;x<16;x++) if(((x+fo*2)&3)!==3) PX(g,x,2,foam); if(!marsh) for(let x=fo;x<16;x+=4) PX(g,x,3,light); }
    if(edges&8){ R(g,0,0,1,16,shore); R(g,1,0,1,16,deep); for(let y=0;y<16;y++) if(((y+fo*2)&3)!==3) PX(g,2,y,foam); }
    if(edges&2){ R(g,15,0,1,16,shore); for(let y=0;y<16;y++) if(((y+fo*2+1)&3)!==3) PX(g,14,y,foam); }
    if(edges&4){ R(g,0,15,16,1,shore); for(let x=0;x<16;x++) if(((x+fo*2+1)&3)!==3) PX(g,x,14,foam); }
    // esquinas interiores (diagonal en tierra, lados en agua)
    if(edges&16&&!(edges&9)){ R(g,0,0,2,1,shore); PX(g,0,1,shore); PX(g,2,1,foam); PX(g,1,2,foam); }
    if(edges&32&&!(edges&3)){ R(g,14,0,2,1,shore); PX(g,15,1,shore); PX(g,13,1,foam); PX(g,14,2,foam); }
    if(edges&64&&!(edges&6)){ R(g,14,15,2,1,shore); PX(g,15,14,shore); PX(g,13,14,foam); }
    if(edges&128&&!(edges&12)){ R(g,0,15,2,1,shore); PX(g,0,14,shore); PX(g,2,14,foam); }
    if(marsh&&(edges&4)){ R(g,3,8,1,6,'#6a8a38'); R(g,4,7+(f>>1),1,2,'#c8a048'); R(g,11,9,1,5,'#6a8a38'); R(g,12,8-(f>>1),1,2,'#c8a048'); }
  });
}
/* ---------- ACANTILADO / MONTAÑA (autotile) ---------- */
function cliffTile(edges,v,bio){ // edges: bits de vecinos ABIERTOS (no-acantilado) N=1 E=2 S=4 W=8 + diagonales
  return cached('cliff'+edges+v+bio,g=>{
    const snow=bio==='snow', aut=bio==='autumn';
    const top=snow?'#a0a8c0':aut?'#b89470':'#b0a080', topL=snow?'#d0d8e8':aut?'#d8b890':'#d4c49c', topD=snow?'#7880a0':aut?'#8a6c50':'#86765a', topDD=snow?'#5a6280':aut?'#6a4e38':'#665a44';
    const face=snow?'#6a7490':aut?'#8a6444':'#8a7658', faceD=snow?'#464e6c':aut?'#5a3e28':'#5a4a38', faceDD=snow?'#30364e':aut?'#3e2a1a':'#3e3226', faceL=snow?'#8c96b4':aut?'#b08860':'#ae9674';
    R(g,0,0,16,16,top); const rnd=seeded(v*53+edges*7+(snow?3:0));
    // meseta: roca lisa con grietas finas, motas y alguna losa suelta
    for(let i=0;i<3;i++){ const x=1+((rnd()*11)|0), y=1+((rnd()*11)|0), w=2+((rnd()*3)|0); R(g,x,y,w,1,topD); PX(g,x+w,y+1,topD); PX(g,x-1,y-1,topL); }
    for(let i=0;i<6;i++) PX(g,(rnd()*16)|0,(rnd()*16)|0,i&1?topL:topD);
    if(v===2){ const x=4+((rnd()*6)|0), y=4+((rnd()*6)|0); R(g,x,y,4,3,top); R(g,x,y,4,1,topL); R(g,x,y,1,3,topL); R(g,x,y+3,4,1,topDD); R(g,x+4,y,1,3,topDD); }
    if(snow){ R(g,1,1,5,2,'#eef4fc'); R(g,8,5,6,2,'#eef4fc'); R(g,3,10,4,2,'#eef4fc'); R(g,10,11,3,1,'#eef4fc'); PX(g,2,3,'#c0cce0'); PX(g,9,7,'#c0cce0'); }
    else if(!aut&&(v===1)){ PX(g,4,5,'#5a9a3a'); PX(g,5,5,'#7aba4a'); PX(g,5,4,'#7aba4a'); PX(g,12,7,'#5a9a3a'); PX(g,13,7,'#7aba4a'); } // matojos
    const openS=edges&4;
    if(openS){ // cara del acantilado: dos hiladas de peñascos redondeados (periodo 16: empalman)
      R(g,0,3,16,1,topL); R(g,0,4,16,12,faceDD);
      const boulder=(x,y,w,h)=>{ for(let yy=0;yy<h;yy++) for(let xx=0;xx<w;xx++){ const px=x+xx, py=y+yy; if(px<0||px>15) continue;
          const corner=(xx===0||xx===w-1)&&(yy===0||yy===h-1); if(corner) continue;
          const c=yy===0||xx===0?faceL:(yy===h-1||xx===w-1)?faceD:((xx+yy)%5===0?faceD:face); PX(g,px,py,c); } };
      boulder(0,5,5,5); boulder(5,4,7,6); boulder(12,5,5,5);
      boulder(-3,10,6,5); boulder(3,10,5,5); boulder(8,9,6,6); boulder(14,10,5,5);
      R(g,0,4,16,1,PAL.k); R(g,0,15,16,1,PAL.k);
      if(snow){ R(g,0,3,16,1,'#ffffff'); R(g,6,5,4,1,'#eef4fc'); R(g,1,6,3,1,'#eef4fc'); R(g,9,10,3,1,'#eef4fc'); }
    }
    if(edges&1){ R(g,0,0,16,1,PAL.k); R(g,0,1,16,1,topL); }
    if(edges&8){ R(g,0,0,1,16,PAL.k); R(g,1,0,1,openS?3:16,topL); }
    if(edges&2){ R(g,15,0,1,16,PAL.k); R(g,14,0,1,openS?3:16,topD); }
    if(!(edges&1)&&!(edges&8)&&(edges&16)){ PX(g,0,0,PAL.k); PX(g,1,1,topL); }
    if(!(edges&1)&&!(edges&2)&&(edges&32)){ PX(g,15,0,PAL.k); PX(g,14,1,topL); }
    if(!(edges&4)&&!(edges&2)&&(edges&64)){ PX(g,15,15,PAL.k); PX(g,14,14,topDD); }
    if(!(edges&4)&&!(edges&8)&&(edges&128)){ PX(g,0,15,PAL.k); PX(g,1,14,topDD); }
  });
}
/* ---------- MURO DE MAZMORRA (autotile) ---------- */
function wallTile(edges,v,style){ // edges: vecinos abiertos N=1 E=2 S=4 W=8
  return cached('wall'+edges+v+style,g=>{
    const pal=style==='wood'?['#5a3c22','#3e2814','#7a5430','#a07444']:style==='hive'?['#a87828','#7a5418','#d8a838','#f8d060']:style==='ice'?['#5a6a98','#3a4a78','#8a9ac8','#d0e0f8']:[C.dwall,C.dwallD,C.dwallL,C.dwallLL];
    const [b,d,l,ll]=pal;
    R(g,0,0,16,16,b);
    if(style==='wood'){ for(let y=0;y<16;y+=5){ R(g,0,y,16,1,l); R(g,0,y+3,16,2,d); } R(g,v?4:11,0,1,16,d); PX(g,v?5:12,2,l); }
    else if(style==='hive'){ for(let y=0;y<16;y+=5) for(let x=((y/5)|0)%2?4:0;x<16;x+=8){ R(g,x,y,7,4,d); R(g,x+1,y,5,1,ll); R(g,x+1,y+1,5,2,l); } }
    else { // sillares con bisel
      for(let y=0;y<16;y+=4){ const off=((y/4)|0)%2?4:0; R(g,0,y+3,16,1,d);
        for(let x=off-8;x<16;x+=8){ R(g,x,y,1,3,d); R(g,x+1,y,6,1,l); PX(g,x+1,y+1,shade(l,-.05)); R(g,x+7,y,1,3,shade(b,-.15)); }
        if(hash(y,v)%3===0) PX(g,(hash(v,y)%12)+2,y+1,style==='ice'?'#ffffff':'#4a6a3a'); }
    }
    // biseles hacia los lados abiertos
    if(edges&4){ R(g,0,11,16,5,d); R(g,0,11,16,1,ll); R(g,0,12,16,1,l); R(g,0,14,16,1,shade(d,-.2)); R(g,0,15,16,1,PAL.k); }
    if(edges&1){ R(g,0,0,16,1,PAL.k); R(g,0,1,16,2,ll); R(g,0,3,16,1,l); }
    if(edges&8){ R(g,0,0,1,16,PAL.k); R(g,1,0,2,16,l); R(g,1,0,1,16,ll); }
    if(edges&2){ R(g,15,0,1,16,PAL.k); R(g,13,0,2,16,d); }
  });
}
/* ---------- OBJETOS SOBRE EL SUELO (transparentes) ---------- */
/* árbol: 16×22 — la copa asoma 6 px sobre la celda de arriba (se pinta en primer plano) */
const TREE_H=22, TREE_UP=6;
function treeArt(bio,v){ const B=BIOMES[bio]||BIOMES.valley, snow=bio==='snow'; return cached('treeA'+bio+v,g=>{
  shadowBlob(g,8,19,7,2,.3);
  const T=B.trunk; // tronco con raíces
  R(g,5,13,6,8,PAL.k); R(g,4,19,8,2,PAL.k); R(g,6,13,4,7,T[1]); R(g,6,13,1,7,T[2]); R(g,9,13,1,7,T[0]); R(g,5,19,2,1,T[1]); R(g,9,19,2,1,T[0]); PX(g,7,16,T[0]);
  const j=(k)=>((hash(v*13+k,k*7)%100)/100-.5)*1.4;
  const lobes=[{x:8+j(1),y:5+j(2)*.5,r:5},{x:4.2,y:8+j(3),r:4.2},{x:11.8,y:8+j(4),r:4.2},{x:8,y:9.5,r:6.5},{x:4.6,y:12.2,r:3.8},{x:11.4,y:12.4,r:3.8},{x:8+j(5)*.6,y:13,r:3.6}];
  blobArt(g,0,0,16,17,lobes,B.leaf,{grad:.45});
  if(snow){ const W='#f4f8ff', S='#c8d4e8'; R(g,5,1,6,1,W); R(g,3,2,4,1,W); R(g,9,2,4,1,S); R(g,1,5,3,1,W); R(g,12,5,3,1,S); R(g,4,7,5,1,W); PX(g,8,0,W); }
  if(bio==='summer'&&v===1){ for(const [x,y] of [[5,6],[10,9],[7,12]]){ PX(g,x,y,'#f04848'); PX(g,x,y-1,'#ffb0a0'); } } // frutos
  if(bio==='autumn'&&v===0){ PX(g,3,10,'#fcd878'); PX(g,12,6,'#fcd878'); }
},16,TREE_H);}
function treeTile(bio,v){ return cached('tree'+bio+v,g=>{ g.drawImage(treeArt(bio,v),0,-TREE_UP); }); }
function bushTile(bio,v){ const B=BIOMES[bio]||BIOMES.valley; return cached('bush'+bio+v,g=>{
  shadowBlob(g,8,14,6,1.5,.3);
  const lobes=v?[{x:5,y:8,r:4},{x:11,y:8.5,r:4},{x:8,y:6,r:4.2},{x:8,y:10.5,r:4.4}]:[{x:8,y:6.5,r:4.5},{x:4.8,y:9.5,r:4},{x:11.2,y:9.5,r:4},{x:8,y:11,r:3.8}];
  blobArt(g,1,1,14,14,lobes.map(l=>({x:l.x-1,y:l.y-1,r:l.r})),B.bushL,{grad:.4});
  if(bio==='snow'){ R(g,6,3,4,1,'#ffffff'); R(g,4,4,3,1,'#e8f0f8'); R(g,10,4,2,1,'#e8f0f8'); }
  if(v&&bio!=='snow'&&bio!=='wilt'){ PX(g,6,6,BIOMES[bio].flowers[0]); PX(g,10,9,BIOMES[bio].flowers[1]); }
});}
const ROCK_PAL=['#3e3a32','#6a6456','#948c7a','#bab29c','#e0d8c2'];
function rockTile(v,bio){ return cached('rock'+v+bio,g=>{
  shadowBlob(g,8,14,6,1.5,.3);
  const lobes=v?[{x:6.5,y:9,r:5,ry:4.6},{x:10,y:8,r:4.6,ry:4.2}]:[{x:9,y:9,r:5.2,ry:4.6},{x:6,y:8,r:4.4,ry:4}];
  blobArt(g,1,2,14,12,lobes.map(l=>({...l,x:l.x-1,y:l.y-2})),ROCK_PAL,{dither:.6,grad:.5});
  PX(g,8+v,6,ROCK_PAL[0]); PX(g,9+v,7,ROCK_PAL[0]); PX(g,9+v,8,ROCK_PAL[1]); PX(g,5,5,ROCK_PAL[4]);
  if(bio==='snow'){ R(g,5,3,5,1,'#ffffff'); R(g,4,4,7,1,'#e8f0f8'); }
  else if(v===0&&bio!=='autumn'){ PX(g,4,11,'#5a9a3a'); PX(g,3,12,'#3e7a2e'); }
});}
function crackedTile(v){ return cached('cracked'+v,g=>{
  g.drawImage(rockTile(v,'valley'),0,0);
  R(g,7,3,1,3,PAL.k); R(g,8,6,1,3,PAL.k); R(g,6,9,1,2,PAL.k); R(g,7,11,1,2,PAL.k);
  R(g,4,7,3,1,PAL.k); R(g,9,6,3,1,PAL.k); PX(g,6,6,ROCK_PAL[0]); PX(g,9,9,ROCK_PAL[0]); PX(g,8,3,ROCK_PAL[4]); PX(g,9,6,ROCK_PAL[4]);
});}
/* ---------- utilidades de objetos: rejilla de texto → píxeles, contorno ---------- */
function grid16(g,rows,map,ox,oy){ ox=ox||0; oy=oy||0; // cada char es un color de map (k = contorno)
  rows.forEach((r,y)=>{ for(let x=0;x<r.length;x++){ const ch=r[x]; if(ch==='.') continue; g.fillStyle=ch==='k'?PAL.k:(map[ch]||'#ff00ff'); g.fillRect(ox+x,oy+y,1,1); } }); }
function brambleTile(v){ return cached('bramble'+v,g=>{ // zarza espinosa: púrpura oscuro, pinchos y moras
  shadowBlob(g,8,14,7,1.5,.3);
  const lobes=v?[{x:5,y:8,r:4.6},{x:11,y:7.5,r:4.6},{x:8,y:5,r:4.2},{x:8,y:10.5,r:4.4}]:[{x:8,y:5.5,r:4.8},{x:4.5,y:9,r:4.2},{x:11.5,y:9,r:4.2},{x:8,y:11,r:4}];
  blobArt(g,1,1,14,14,lobes.map(l=>({x:l.x-1,y:l.y-1,r:l.r})),['#1a1a16','#2c3420','#3e4a2a','#586238','#76804a'],{grad:.3,dither:1.1});
  // pinchos que asoman del contorno
  [[1,6,-1,0],[14,5,1,0],[4,1,0,-1],[11,2,0,-1],[0,10,-1,0],[15,11,1,0]].forEach(([x,y,dx,dy])=>{ PX(g,x,y,PAL.k); PX(g,x+dx,y+dy,'#c8b890'); });
  [[5,5],[9,4],[7,9],[11,10],[4,11]].forEach(([x,y],i)=>{ PX(g,x,y,'#d8c8a0'); PX(g,x+1,y+1,PAL.k); });
  [[3,7],[10,7],[6,12],[12,12]].forEach(([x,y])=>{ PX(g,x,y,'#c02838'); PX(g,x+1,y,'#801828'); PX(g,x,y-1,'#f87888'); });
});}
function brambleDry(){ return cached('brambleDry',g=>{ // zarza seca: ramitas caídas
  const d='#6a543c', m='#8a7048', l='#b09870';
  R(g,2,10,5,1,m); PX(g,2,9,l); PX(g,6,11,d); R(g,8,12,6,1,m); PX(g,13,11,l); PX(g,9,13,d);
  R(g,5,13,3,1,d); R(g,11,8,1,3,m); PX(g,12,7,l); PX(g,10,11,d); PX(g,4,9,d); PX(g,3,11,d);
  PX(g,7,9,'#a89078'); PX(g,12,13,'#a89078');
});}
function signTile(){ return cached('sign',g=>{
  shadowBlob(g,8,14,5,1,.28);
  grid16(g,[
"................",
"................",
".kkkkkkkkkkkkkk.",
".kLLLLLLLLLLLlk.",
".kLlllllllllldk.",
".kLlDDDDDDllldk.",
".kLlllllllllldk.",
".kLlDDDDllDlldk.",
".kLdddddddddddk.",
".kkkkkkkkkkkkkk.",
"......kMmk......",
"......kMmk......",
"......kMmk......",
".....kkMmkk.....",
"......kkkk......",
"................"],{L:'#f4d098',l:'#d8a060',d:'#a86c38',D:'#7a4a24',M:'#9a6434',m:'#5a3418'});
  PX(g,2,3,'#fff0c8'); PX(g,13,8,'#7a4a24');
});}
function runeTile(f){ return cached('rune'+f,g=>{ // piedra rúnica
  shadowBlob(g,8,14,6,1.5,.3);
  grid16(g,[
"................",
".....kkkkkk.....",
"....kLLLLlllk...",
"...kLLllllllDk..",
"...kLlllllllDk..",
"...kLlllllllDk..",
"...kLlllllllDk..",
"...kLlllllllDk..",
"...kLlllllllDk..",
"...kLlllllllDk..",
"...kLlllllllDk..",
"...kdlllllllDk..",
"...kddddddddDk..",
"..kkkkkkkkkkkkk.",
"..kmmmmmmmmmmmk.",
"...kkkkkkkkkkk.."],{L:'#d0d4e8',l:'#9c9eb8',D:'#5a5a78',d:'#74748e',m:'#4a4a62'});
  const c=f?'#78fff0':'#2e9a8e', h=f?'#e8fffc':'#58c8b8';
  R(g,7,4,2,2,c); R(g,6,6,1,3,c); R(g,9,6,1,3,c); R(g,7,9,2,1,c); PX(g,7,4,h); R(g,7,7,2,1,c);
  PX(g,4,11,'#5a8a3a'); PX(g,5,12,'#7aa84a'); PX(g,11,3,'#5a8a3a');
  if(f){ g.fillStyle='rgba(120,255,240,.25)'; g.fillRect(5,3,6,8); }
});}
function altarTile(s){ return cached('altar'+s,g=>{ // pedestal con la gema de cada estación
  shadowBlob(g,8,14,7,1.5,.3);
  grid16(g,[
"................",
"................",
"................",
"..kkkkkkkkkkkk..",
"..kLLLLLLLLLlk..",
"..kLllllllllDk..",
"..kkkkkkkkkkkk..",
"...kLllllllDk...",
"....kLlllllDk...",
"....kLlllllDk...",
"....kLlllllDk...",
"....kLlllllDk...",
"...kkkkkkkkkkk..",
"..kLlllllllllDk.",
"..kddddddddddDk.",
"..kkkkkkkkkkkkk."].map(r=>r.slice(0,16)),{L:'#dcd4c0',l:'#aaa290',D:'#6a6456',d:'#847c6c'});
  const G=s===1?['#f890b8','#c84878','#fff0f8']:s===2?['#f8c040','#c07818','#fff8c0']:['#a8d8f8','#4888c8','#ffffff'];
  R(g,6,1,4,4,PAL.k); R(g,5,2,6,2,PAL.k); R(g,6,2,4,2,G[0]); R(g,7,1,2,1,PAL.k); PX(g,7,2,G[2]); PX(g,9,3,G[1]); R(g,6,4,4,1,PAL.k); PX(g,8,3,G[1]);
  R(g,7,9,2,2,G[1]); PX(g,7,9,G[0]);
});}
/* casas: tablas horizontales, sombra del alero y zócalo de piedra */
function houseWall(v){ return cached('hwall'+v,g=>{
  R(g,0,0,16,16,C.wall);
  for(let y=1;y<12;y+=4){ R(g,0,y,16,1,C.wallL); R(g,0,y+3,16,1,C.wallD); }
  R(g,v?4:11,1,1,11,C.wallD); PX(g,v?5:12,2,C.wallL);
  R(g,0,0,16,2,'#8a6a48'); R(g,0,2,16,1,C.wallD);                               // sombra del alero
  // zócalo
  R(g,0,12,16,4,'#8a8478'); R(g,0,12,16,1,PAL.k); for(let x=(v?2:5);x<16;x+=6){ R(g,x,13,1,3,'#5a564c'); } R(g,0,13,16,1,'#b0aa9a'); R(g,0,15,16,1,'#5a564c');
});}
function houseWindow(){ return cached('hwin',g=>{
  g.drawImage(houseWall(0),0,0);
  R(g,2,3,12,9,PAL.k); R(g,3,4,10,7,'#a06a38'); R(g,4,5,8,5,'#4a88c8');
  R(g,4,5,8,1,'#2c5a98'); R(g,4,5,1,5,'#2c5a98'); PX(g,6,6,'#d8f0ff'); PX(g,7,6,'#a8d8f8'); PX(g,5,7,'#a8d8f8'); PX(g,10,8,'#a8d8f8');
  R(g,7,5,2,5,'#a06a38'); R(g,4,7,8,1,'#a06a38'); PX(g,7,5,'#c89058');
  R(g,1,11,14,3,PAL.k); R(g,2,11,12,2,'#8a5828'); R(g,2,11,12,1,'#b07840');         // jardinera
  [[3,10,'#f04848'],[6,9,'#f8d030'],[9,10,'#f890c8'],[12,9,'#f04848']].forEach(([x,y,c])=>{ PX(g,x,y,c); PX(g,x+1,y+1,'#3a8a30'); PX(g,x,y+1,'#58b048'); });
});}
function houseDoor(){ return cached('hdoor',g=>{
  g.drawImage(houseWall(1),0,0);
  grid16(g,[
"....kkkkkkkk....",
"...kffffffffk...",
"..kfkkkkkkkkfk..",
"..kfkLddLddkfk..",
"..kfkLddLddkfk..",
"..kfkLddLddkfk..",
"..kfkLddLddkfk..",
"..kfkLddLdyYfk..",
"..kfkLddLdyyfk..",
"..kfkLddLddkfk..",
"..kfkLddLddkfk..",
"..kfkLddLddkfk..",
"..kfkLddLddkfk..",
"..kfkkkkkkkkfk..",
".kssssssssssssk.",
".kkkkkkkkkkkkkk."],{f:'#6a4020',L:'#9a6434',d:'#6a3c1c',y:'#e8b040',Y:'#fff0a0',s:'#b0aa9a'});
  R(g,5,3,1,10,'#b07840');
});}
function roofTile(v,edges){ return cached('roof'+v+edges,g=>{ // tejas árabes: canales curvos en hileras, cumbrera y alero
  const b=C.roof, d=C.roofD, l=C.roofL, dd='#6a1810', ll='#ffb098';
  R(g,0,0,16,16,d);
  for(let row=0;row<4;row++){ const y=row*4, off=(row&1)?2:0; // periodo 4×4: empalma con las celdas vecinas
    for(let x=-4+off;x<16;x+=4){ // una teja: canal oscuro, lomo con brillo, boca redonda abajo
      R(g,x,y,1,4,dd); R(g,x+1,y,1,4,l); R(g,x+2,y,1,4,b); R(g,x+3,y,1,4,d);
      PX(g,x+1,y,ll); R(g,x+1,y+3,3,1,d); PX(g,x+2,y+3,dd); } }
  if(edges&1){ R(g,0,0,16,1,PAL.k); R(g,0,1,16,2,'#f88870'); R(g,0,3,16,1,dd); for(let x=(v?1:3);x<16;x+=5) PX(g,x,1,'#ffd0b8'); }
  if(edges&4){ R(g,0,13,16,1,PAL.k); R(g,0,14,16,1,'#8a2818'); R(g,0,15,16,1,'#3a0c06'); for(let x=1;x<16;x+=4) PX(g,x,14,'#b04830'); }
  if(edges&8){ R(g,0,0,1,16,PAL.k); R(g,1,0,1,13,ll); }
  if(edges&2){ R(g,15,0,1,16,PAL.k); R(g,14,0,1,13,dd); }
});}
function caveTile(bio){ return cached('cave'+bio,g=>{ // boca de cueva en la roca
  const snow=bio==='snow', aut=bio==='autumn';
  const face=snow?'#6a7490':aut?'#8a6444':'#8a7658', faceD=snow?'#464e6c':aut?'#5a3e28':'#5a4a38', faceL=snow?'#8c96b4':aut?'#b08860':'#ae9674';
  R(g,0,0,16,16,face); for(let x=0;x<16;x+=4){ R(g,x,2,1,14,faceL); R(g,x+2,2,1,14,faceD); }
  R(g,0,0,16,2,snow?'#eef4fc':'#d4c49c'); R(g,0,2,16,1,faceL);
  // arco de piedras
  grid16(g,[
"................",
"................",
"................",
".....kkkkkk.....",
"....kLLlllDk....",
"...kLkkkkkkDk...",
"..kLk......kDk..",
"..kLk......kDk..",
"..klk......kdk..",
"..kLk......kDk..",
"..klk......kdk..",
"..kLk......kDk..",
"..klk......kdk..",
"..kLk......kDk..",
"..klk......kdk..",
"..kkk......kkk.."],{L:'#d8d0c0',l:'#a8a090',D:'#6a6458',d:'#847c6e'});
  // oscuridad con profundidad
  R(g,5,6,6,10,'#0c0a12'); R(g,5,6,6,2,'#2a2438'); R(g,5,8,6,1,'#1c1826'); PX(g,6,6,'#3a3448'); PX(g,9,6,'#3a3448'); R(g,6,5,4,1,'#2a2438');
  R(g,5,15,6,1,'#1c1826');
});}
function stairsTile(){ return cached('stairs',g=>{ // escalera que baja
  R(g,1,1,14,14,PAL.k);
  const steps=[['#8a7a6a','#b0a08c'],['#6a5c50','#8a7a6a'],['#4a3e36','#6a5c50'],['#2e2620','#46382e']];
  steps.forEach(([c,l],i)=>{ const y=2+i*3, inset=i; R(g,2+inset,y,12-inset*2,3,c); R(g,2+inset,y,12-inset*2,1,l); });
  R(g,6,14,4,1,'#140e0a'); R(g,2,2,1,12,'#3a3026'); R(g,13,2,1,12,'#241c16');
});}
function holeTile(style){ return cached('hole'+style,g=>{ // pozo en el suelo con pared visible
  const wallc=style==='ice'?'#4a6a90':style==='wood'?'#4a3018':style==='hive'?'#7a5418':'#3a2e28';
  R(g,2,1,12,14,PAL.k); R(g,1,2,14,12,PAL.k);
  R(g,2,2,12,12,'#06040a'); R(g,2,2,12,4,wallc); R(g,2,5,12,1,shade(wallc,-.3)); R(g,3,6,10,1,'#100c10');
  R(g,2,2,12,1,shade(wallc,.25)); PX(g,4,3,shade(wallc,.15)); PX(g,10,4,shade(wallc,-.2));
});}
function blockTile(){ return cached('block',g=>{ // bloque empujable: cara superior clara y frente oscuro
  grid16(g,[
"................",
".kkkkkkkkkkkkkk.",
".kLLLLLLLLLLLlk.",
".kLllllllllllak.",
".kLlkkkkkkkklak.",
".kLlkaaaaaaklak.",
".kLlkaLLLLaklak.",
".kLlkaLlllaklak.",
".kLlkaaaaaaklak.",
".kLlkkkkkkkklak.",
".kaaaaaaaaaaaak.",
".kkkkkkkkkkkkkk.",
".kddddddddddddk.",
".kdmmmmmmmmmmdk.",
".kkkkkkkkkkkkkk.",
"................"],{L:'#d0c0a4',l:'#b09c80',a:'#8a7660',d:'#6a5a48',m:'#54463a'});
  PX(g,2,2,'#f0e4cc'); R(g,2,12,2,1,'#4a8a3a'); PX(g,3,11,'#6aa84a'); PX(g,12,3,'#4a8a3a');
});}
function plateTile(pressed){ return cached('plate'+pressed,g=>{ // placa de presión
  if(!pressed){ grid16(g,[
"................",
"................",
"...kkkkkkkkkk...",
"..kLLLLLLLLLlk..",
"..kLllllllllDk..",
"..kLlkkkkkklDk..",
"..kLlkmmmmklDk..",
"..kLlkmmmmklDk..",
"..kLlkmmmmklDk..",
"..kLlkmmmmklDk..",
"..kLlkkkkkklDk..",
"..kLllllllllDk..",
"..kdddddddddDk..",
"..kDDDDDDDDDDk..",
"...kkkkkkkkkk...",
"................"],{L:'#b8a8e0',l:'#8a76b8',m:'#6e5a9a',d:'#5a4880',D:'#3a2e58'}); }
  else { grid16(g,[
"................",
"................",
"................",
"...kkkkkkkkkk...",
"..kDDDDDDDDDDk..",
"..kDmmmmmmmmdk..",
"..kDmkkkkkkmdk..",
"..kDmkccccCmdk..",
"..kDmkccccCmdk..",
"..kDmkcCCCCmdk..",
"..kDmkkkkkkmdk..",
"..kDmmmmmmmmdk..",
"..kdddddddddLk..",
"...kkkkkkkkkk...",
"................",
"................"],{D:'#241c3a',m:'#3a2e5a',d:'#4a3e6e',L:'#6e5a9a',c:'#a8fff4',C:'#40c8c0'}); }
});}
function switchTile(pressed){ return cached('switch'+pressed,g=>{ // pulsador redondo
  const lobes=[{x:6,y:6,r:5.4}]; if(pressed) g.translate(0,1);
  blobArt(g,2,2,12,12,lobes,pressed?['#3a3a50','#4a4a62','#5a5a74','#6a6a84','#7a7a94']:['#4a4a62','#6a6a84','#8a8aa2','#aab0c4','#d0d8e8'],{dither:.5,grad:.3});
  const c=pressed?'#40c8c0':'#58e8d8'; R(g,7,6,2,3,c); R(g,6,7,4,1,c); PX(g,7,6,pressed?'#80e0d8':'#e8fffc');
  if(pressed) g.translate(0,-1);
});}
function gateTile(){ return cached('gate',g=>{ // reja de hierro con remaches y puntas
  const bar=(x)=>{ R(g,x,1,3,15,PAL.k); R(g,x+1,1,1,15,'#8a8ca0'); PX(g,x+1,2,'#c8ccd8'); R(g,x+1,0,1,1,PAL.k); };
  bar(1); bar(6); bar(11);
  for(const y of [3,11]){ R(g,0,y,16,3,PAL.k); R(g,0,y+1,16,1,'#6a6c80'); for(const x of [2,7,12]) PX(g,x,y+1,'#d8dce8'); }
  PX(g,2,0,'#c8ccd8'); PX(g,7,0,'#c8ccd8'); PX(g,12,0,'#c8ccd8');
});}
function lockedTile(){ return cached('locked',g=>{
  g.drawImage(gateTile(),0,0);
  grid16(g,[
"......kkkk......",
".....kyyyYk.....",
".....kk..kk.....",
"....kkkkkkkk....",
"....kYyyyyyk....",
"....kyykkyak....",
"....kyykkyak....",
"....kyyykyak....",
"....kaaaaaak....",
"....kkkkkkkk...."],{y:'#e8b040',Y:'#fff0a0',a:'#a86c18'},0,3);
});}
function bossDoorTile(){ return cached('bossdoor',g=>{ // gran puerta con cerradura dorada
  grid16(g,[
"kkkkkkkkkkkkkkkk",
"kSssssssssssssSk",
"kskkkkkkkkkkkksk",
"kskRrrrrrrrrrksk",
"kskRrkkkkkkrrksk",
"kskRkyyyyYYkrksk",
"kskRkyykkyakrksk",
"kskRkyykkyakrksk",
"kskRkyyykyakrksk",
"kskRkyyykyakrksk",
"kskRkaaaaaakrksk",
"kskRrkkkkkkrrksk",
"kskRrrrrrrrrrksk",
"kskRrrrrrrrrrksk",
"kskddddddddddksk",
"kkkkkkkkkkkkkkkk"],{S:'#9a94b0',s:'#6a6480',R:'#8a4058',r:'#6a2840',d:'#4a1828',y:'#f8c838',Y:'#fff4b0',a:'#b07818'});
  PX(g,4,4,'#c86078'); PX(g,11,12,'#4a1828');
});}
function torchTile(lit,f){ f=f||0; return cached('torch'+lit+f,g=>{
  shadowBlob(g,8,14,4,1,.3);
  R(g,6,7,4,8,PAL.k); R(g,7,8,2,6,'#8a5828'); PX(g,7,8,'#b07840'); R(g,4,5,8,3,PAL.k); R(g,5,6,6,1,'#6a4828'); R(g,5,5,6,1,'#9a7048');
  if(lit){ // llama de 4 fotogramas: cuerpo naranja, alma amarilla, punta blanca que baila
    const sway=[0,1,0,-1][f], h=[6,7,5,7][f];
    for(let k=0;k<h;k++){ const w=Math.max(1,Math.round((h-k)*.75)), y=5-k, x=8-(w>>1)+(k>2?sway:0); R(g,x,y,w,1,k<2?'#f06020':'#f8a030'); }
    for(let k=0;k<h-2;k++){ const w=Math.max(1,Math.round((h-2-k)*.45)), y=5-k, x=8-(w>>1)+(k>2?sway:0); R(g,x,y,w,1,'#f8e060'); }
    PX(g,8+sway,6-h+2,'#ffffff'); if(f&1) PX(g,5+(f>>1)*6,2,'#f8a030'); }
  else { R(g,6,3,4,3,'#3a3020'); R(g,7,4,2,1,'#5a4a30'); PX(g,8,2,'#6a6060'); }
});}
function crystalTile(state){ return cached('crystal'+state,g=>{ // interruptor de cristal facetado
  shadowBlob(g,8,14,5,1,.3);
  const c=state?['#801828','#c83040','#f06070','#ffc0c8']:['#1c3a88','#3a6ad8','#70a8f8','#d0ecff'];
  grid16(g,[
"................",
".......kk.......",
"......kWak......",
".....kWaabk.....",
"....kWaabbbk....",
"....kWaabbbk....",
"....kaaabbbk....",
"....kaaabbdk....",
"....kaaabddk....",
".....kabddk.....",
"......kddk......",
"....kkkkkkkk....",
"...kLLLLLLlmk...",
"...kmmmmmmmmk...",
"....kkkkkkkk....",
"................"],{W:c[3],a:c[2],b:c[1],d:c[0],L:'#b0b0c8',l:'#8a8aa2',m:'#5a5a74'});
  PX(g,6,4,'#ffffff');
});}
function toggleBlock(red,up){ return cached('toggle'+red+up,g=>{ // bloques rojo/azul
  const c=red?'#d04848':'#4868d0', l=red?'#f89090':'#90b0f8', d=red?'#882028':'#243488', dd=red?'#501018':'#141c50';
  if(up){ R(g,1,1,14,14,PAL.k); R(g,2,2,12,9,c); R(g,2,2,12,1,l); R(g,2,2,1,9,l); R(g,13,2,1,9,d);
    R(g,2,11,12,3,d); R(g,2,13,12,1,dd); R(g,6,4,4,5,PAL.k); R(g,7,5,2,3,l); PX(g,7,5,'#ffffff'); PX(g,3,3,'#ffffff'); }
  else { R(g,2,2,12,12,PAL.k); R(g,3,3,10,10,dd); R(g,3,3,10,1,shade(dd,-.3)); R(g,4,4,8,8,shade(c,-.35)); R(g,7,6,2,3,d);
    g.globalAlpha=.35; R(g,3,3,10,10,C.dfloor); g.globalAlpha=1; }
});}
function postTile(){ return cached('post',g=>{ // poste de raíz (blanco del gancho)
  shadowBlob(g,8,14,4,1,.3);
  grid16(g,[
".....kkk........",
"....kLlLk.kk....",
"....kllldkLlk...",
"...kkkldkkldk...",
"...klkkkkkkk....",
"....kbbBbbk.....",
"....kbbBbdk.....",
"....kbbBbdk.....",
"....kyyyyyk.....",
"....kbbBbdk.....",
"....kbbBbdk.....",
"....kbbBbdk.....",
"....kbbBbdk.....",
"...kkbbBbdkk....",
"...kkkkkkkkk....",
"................"],{L:'#c8f880',l:'#70d838',d:'#2e8a30',b:'#8a5828',B:'#b07840',y:'#e8b040'});
});}
function chestTile(open){ return cached('chest'+open,g=>{ // cofre: madera oscura con herrajes dorados
  shadowBlob(g,8,14,7,1.5,.3);
  const M={w:'#a06a38',W:'#c8904c',d:'#6a4020',g:'#e8b848',G:'#fff0a0',a:'#a87818',i:'#1a1008',y:'#f8d030'};
  if(!open) grid16(g,[
"................",
"................",
"................",
"..kkkkkkkkkkkk..",
".kWWWWWWWWWWWWk.",
".kwgwwwwwwwwgwk.",
".kwgwwwwwwwwgwk.",
".kkkkkkggkkkkkk.",
".kgggggGggggggk.",
".kwgwwwkGkwwgdk.",
".kwgwwwkakwwgdk.",
".kwgwwwwwwwwgdk.",
".kwgwwwwwwwwgdk.",
".kddddddddddddk.",
".kkkkkkkkkkkkkk.",
"................"],M);
  else grid16(g,[
"................",
"..kkkkkkkkkkkk..",
".kWWWWWWWWWWWWk.",
".kwgwwwwwwwwgwk.",
".kkkkkkkkkkkkkk.",
".kiiiiiiiiiiiik.",
".kiiyyGyyyyiiik.",
".kgggggggggggggk".slice(0,16),
".kwgwwwwwwwwgdk.",
".kwgwwwkkkwwgdk.",
".kwgwwwwwwwwgdk.",
".kwgwwwwwwwwgdk.",
".kwgwwwwwwwwgdk.",
".kddddddddddddk.",
".kkkkkkkkkkkkkk.",
"................"],M);
  if(!open){ PX(g,3,4,'#f0c888'); } else { PX(g,6,6,'#ffffff'); }
});}
function fenceTile(){ return cached('fence',g=>{ // valla: estacas con punta y dos travesaños
  shadowBlob(g,8,14,7,1,.22);
  const post=(x)=>{ grid16(g,[".k.","kLk","kLk","kLd","kLd","kLd","kLd","kLd","kLd","kLd","kkk"],{L:'#e0a868',d:'#8a5828'},x,3); };
  const rail=(y)=>{ R(g,0,y,16,3,PAL.k); R(g,0,y+1,16,1,C.wood); PX(g,4,y+1,C.woodL); PX(g,10,y+1,C.woodD); };
  rail(6); rail(10); post(2); post(11);
});}
function potTile(){ return cached('pot',g=>{ // maceta de barro con planta
  shadowBlob(g,8,14,4,1,.3);
  grid16(g,[
"......kk........",
".....kLlk.kk....",
"..kk.kllkkLlk...",
".kLlkkkdkkldk...",
"..kldkkdkkkk....",
"...kkkdkk.......",
"...kkkkkkkkk....",
"...kOOOOOOOOk...",
"...kkkkkkkkkk...".slice(0,16),
"....kooOoooqk...",
"....kooOoooqk...",
"....kooOooqqk...",
".....koooqqk....",
".....kqqqqqk....",
"......kkkkk.....",
"................"],{L:'#c8f880',l:'#70d838',d:'#2e8a30',O:'#e89060',o:'#c86030',q:'#8a3818'});
});}
function bedTile(){ return cached('bed',g=>{ // cama con cabecero, almohada y manta
  grid16(g,[
"................",
".kkkkkkkkkkkkkk.",
".kHHHHHHHHHHHhk.",
".khhhhhhhhhhhhk.",
".kkkkkkkkkkkkkk.",
".kppWWWWWWWWppk.",
".kpWWWWWWWWWWpk.",
".kpwwwwwwwwwwpk.",
".kBBBBBBBBBBBBk.",
".kbbbbbbbbbbbBk.",
".kbbbbbbbbbbbBk.",
".kbrbbbrbbbrbBk.",
".kbbbbbbbbbbbBk.",
".kddddddddddddk.",
".kkkkkkkkkkkkkk.",
"................"],{H:'#b07840',h:'#8a5828',p:'#c89058',W:'#fffbe8',w:'#d8d0c0',B:'#f09058',b:'#d86830',r:'#f8c050',d:'#8a3818'});
});}
function matTile(){ return cached('mat',g=>{ // felpudo de la puerta
  grid16(g,[
"................",
"................",
"................",
"..kkkkkkkkkkkk..",
"..kffffffffffk..",
"..kfMmmmmmmMfk..",
"..kfmllllllmfk..",
"..kfmlmmmmlmfk..",
"..kfmllllllmfk..",
"..kfMmmmmmmMfk..",
"..kffffffffffk..",
"..kkkkkkkkkkkk..",
"................",
"................",
"................",
"................"],{f:'#a87848',m:'#c8a060',M:'#8a5828',l:'#e8c888'});
});}
function counterTile(){ return cached('counter',g=>{ // mostrador de la tienda
  grid16(g,[
"kkkkkkkkkkkkkkkk",
"LLLLLLLLLLLLLLLL",
"llllllllllllllll",
"llllllllllllllll",
"dddddddddddddddd",
"kkkkkkkkkkkkkkkk",
"bbbbbbbBbbbbbbbB",
"bbbbbbbBbbbbbbbB",
"bbbbbbbBbbbbbbbB",
"bbbbbbbBbbbbbbbB",
"bbbbbbbBbbbbbbbB",
"bbbbbbbBbbbbbbbB",
"bbbbbbbBbbbbbbbB",
"mmmmmmmmmmmmmmmm",
"mmmmmmmmmmmmmmmm",
"kkkkkkkkkkkkkkkk"],{L:'#f0c080',l:'#d8a060',d:'#a06a38',b:'#a06a38',B:'#6a4020',m:'#6a4020'});
  PX(g,3,2,'#f8d8a0'); R(g,9,2,3,1,'#c08850'); PX(g,12,9,'#8a5828'); PX(g,4,10,'#8a5828');
});}
function shelfTile(){ return cached('shelf',g=>{ // estantería con frascos
  grid16(g,[
"kkkkkkkkkkkkkkkk",
"kffffffffffffffk",
"kfiiiiiiiiiiiifk",
"kfiiiiiiiiiiiifk",
"kfiiiiiiiiiiiifk",
"kLLLLLLLLLLLLLLk",
"kddddddddddddddk",
"kfiiiiiiiiiiiifk",
"kfiiiiiiiiiiiifk",
"kfiiiiiiiiiiiifk",
"kfiiiiiiiiiiiifk",
"kLLLLLLLLLLLLLLk",
"kddddddddddddddk",
"kfffffffffffffffk".slice(0,16),
"kffffffffffffffk",
"kkkkkkkkkkkkkkkk"],{f:'#8a5828',i:'#3a2410',L:'#d8a060',d:'#6a4020'});
  const jar=(x,y,c,h)=>{ R(g,x,y,3,h,PAL.k); PX(g,x+1,y+1,c); if(h>3) R(g,x+1,y+1,1,h-2,c); PX(g,x+1,y+1,shade(c,.5)); };
  jar(2,2,'#78d838',3); jar(5,1,'#58e8d8',4); jar(9,2,'#e8b040',3); jar(12,1,'#e8487c',4);
  jar(3,7,'#e8487c',4); jar(7,8,'#f8d030',3); jar(10,7,'#9858c8',4);
});}
function interiorWall(){ return cached('iwall',g=>{ // pared de troncos: vetas redondeadas y juntas oscuras
  R(g,0,0,16,16,'#6a4424');
  for(let y=0;y<14;y+=4){ R(g,0,y,16,1,'#b08050'); R(g,0,y+1,16,1,'#946636'); R(g,0,y+2,16,1,'#7a5028'); R(g,0,y+3,16,1,'#3a2410');
    PX(g,(y*5+3)%14,y+1,'#6a4424'); PX(g,(y*5+4)%14,y+1,'#6a4424'); }
  R(g,0,14,16,2,PAL.k);
});}
function tableTile(){ return cached('table',g=>{ // mesa con mantel
  shadowBlob(g,8,14,7,1.5,.3);
  grid16(g,[
"................",
"................",
"................",
".kkkkkkkkkkkkkk.",
".kLLLLLLLLLLLlk.",
".kLccccccccclak.",
".kLcCCCCCCCclak.",
".kLccccccccclak.",
".kaaaaaaaaaaaak.",
".kddddddddddddk.",
".kkkkkkkkkkkkkk.",
"..kdk......kdk..",
"..kdk......kdk..",
"..kdk......kdk..",
"..kkk......kkk..",
"................"],{L:'#f0c080',a:'#c08850',d:'#7a4a24',c:'#f8f0e0',C:'#e8a0a0'});
});}
function lilyTile(f){ return cached('lily'+f,g=>{ // nenúfar: pisable sobre el agua
  g.fillStyle='rgba(16,32,72,.35)'; g.fillRect(4,12,9,1);
  grid16(g,[
"................",
"................",
"................",
".....kkkkkk.....",
"...kkLLllllkk...",
"..kLLlllllllldk.",
"..kLllllldllldk.",
"..kllllllldlldk.",
"..kllllllllldk..",
"...kddlllllddk..",
"....kkdddddkk...",
"......kkkkk.....",
"................",
"................",
"................",
"................"],{L:'#98e070',l:'#58a848',d:'#2e7830'});
  R(g,8,4,1,4,'#2e7830'); // la muesca del nenúfar
  if(f){ R(g,9,3,3,2,'#f890c8'); PX(g,10,2,'#fff0f8'); PX(g,10,4,'#f8d030'); }
});}
function wellTile(){ return cached('well',g=>{ // pozo de piedra con tejadillo
  shadowBlob(g,8,15,7,1,.3);
  grid16(g,[
"..kkkkkkkkkkkk..",
".kRRRRRRRRRRRRk.",
"kRrrrrrrrrrrrrdk".slice(0,16),
".kkkkkkkkkkkkkk.",
"...kPk....kPk...",
"...kPk.kk.kPk...",
"...kPk.kbkkPk...",
".kkkkkkkkkkkkkk.",
"kSsSSsSSsSSsSSsk",
"kSwwwwwwwwwwwwsk",
"ksWWwwwwwwwwwwsk",
"kSSsSSsSSsSSsSdk",
"ksSSsSSsSSsSSddk",
"kSsSSsSSsSSsSSdk",
".kkkkkkkkkkkkkk.",
"................"],{R:'#e05838',r:'#a83020',d:'#6a1810',P:'#8a5828',b:'#c8a060',S:'#b0a890',s:'#8a8474',w:'#1a2a48',W:'#4a88d8'});
  PX(g,4,10,'#a8d8f8');
});}
function moundTile(v){ return cached('mound'+v,g=>{ // montículo de tierra con agujero
  grid16(g,[
"................",
"................",
"................",
"................",
"................",
"................",
"................",
"......kkkk......",
"....kkLllldkk...",
"...kLlkkkkkldk..",
"..kLlkiiiiikldk.",
"..kllkiiiiikddk.",
"..kddlkkkkkdddk.",
"...kkddddddkk...",
".....kkkkkk.....",
"................"],{L:'#9a8058',l:'#7a6444',d:'#5a4630',i:'#140e0a'});
  if(v){ PX(g,4,12,'#9a8058'); PX(g,12,9,'#5a4630'); }
});}
function bookshelfTile(){ return cached('bookshelf',g=>{ // librería con lomos de colores
  g.drawImage(shelfTile(),0,0);
  R(g,2,2,12,3,'#3a2410'); R(g,2,7,12,4,'#3a2410');
  const books=[[2,2,'#c84848',3],[4,2,'#3878d8',3],[5,3,'#e8b050',2],[7,2,'#2e8038',3],[9,2,'#9858c8',3],[11,3,'#c84848',2],[12,2,'#f0f0e0',3],
    [2,7,'#e8b050',4],[4,8,'#2e8038',3],[6,7,'#58c8e8',4],[8,7,'#c84848',4],[10,8,'#f0f0e0',3],[12,7,'#3878d8',4]];
  books.forEach(([x,y,c,h])=>{ R(g,x,y,2,h,c); R(g,x,y,1,h,shade(c,.25)); PX(g,x+1,y+h-1,shade(c,-.3)); });
});}
function pillarTile(){ return cached('pillar',g=>{ // columna con capitel y basa
  grid16(g,[
"..kkkkkkkkkkkk..",
"..kLLLLLLLLLlk..",
"..kddddddddddk..",
"...kkkkkkkkkk...",
"....kLllllmk....",
"....kLllllmk....",
"....kLlllmmk....",
"....kLllllmk....",
"....kLllllmk....",
"....kLlllmmk....",
"....kLllllmk....",
"....kLllllmk....",
"...kkkkkkkkkk...",
"..kLLLLLLLLLlk..",
"..kddddddddddk..",
"..kkkkkkkkkkkk.."],{L:'#b8b4d0',l:'#8a86a4',m:'#5a5674',d:'#4a4460'});
});}

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
    case '.': case ',': g.drawImage(bio==='snow'?snowTile(v%6):bio==='autumn'?leafTile(v%6):grassTile(bio,v%8),px,py); return;
    case 'f': g.drawImage(bio==='snow'?snowTile(v%6):flowerTile(bio,v%4,f),px,py); return;
    case 't': g.drawImage(bio==='snow'?snowTile(v%6):tallGrassTile(bio,f),px,py); return;
    case 'p': { const e=edgesOf(rows,x,y,c=>c!=='p'&&!SOLID.has(c)&&c!=='s'); g.drawImage(pathTile(v%4,e,bio),px,py); return; }
    case 's': { const e=edgesOf(rows,x,y,c=>c!=='s'&&!SOLID.has(c)&&!WATER.has(c)&&c!=='p'); g.drawImage(sandTile(v%3,e,bio),px,py); return; }
    case 'n': g.drawImage(snowTile(v%6),px,py); return;
    case 'i': g.drawImage(iceTile(v%2),px,py); return;
    case '·': g.drawImage(leafTile(v%3),px,py); return;
    case 'q': g.drawImage(dfloorTile(v%3,style),px,py); return;
    case 'o': case 'x': g.drawImage(woodFloorTile(v%2),px,py); if(ch==='x') g.drawImage(matTile(),px,py); return;
    case 'm': { const e=edgesOf(rows,x,y,c=>c!=='m'&&!WATER.has(c)&&!SOLID.has(c)); g.drawImage(mudTile(v%3,e,bio),px,py); return; }
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
function drawTree(g,fg,px,py,bio,v){ const a=treeArt(bio,v); g.drawImage(a,px,py-TREE_UP); if(fg) fg.drawImage(a,0,0,16,TREE_UP,px,py-TREE_UP,16,TREE_UP); }
function drawObject(g,rows,x,y,ch,opts,f,fg){
  const px=x*16,py=y*16, bio=opts.bio, v=hash(x*3+opts.sx*SW,y*7+opts.sy*SH), style=opts.style;
  switch(ch){
    case 'T': drawTree(g,fg,px,py,bio,v%2); return;
    case 'Y': drawTree(g,fg,px,py,'snow',v%2); return;
    case '¥': drawTree(g,fg,px,py,'autumn',v%2); return;
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
    case 'O': g.drawImage(runeTile((f>>1)&1),px,py); return;
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
function renderScreenTo(c2d,rows,ox,oy,opts,f,fg){
  f=f||0;
  for(let y=0;y<SH;y++) for(let x=0;x<SW;x++){
    const ch=rows[y][x];
    drawGround(c2d,rows,x,y,ch,{...opts},f);
  }
  for(let y=0;y<SH;y++) for(let x=0;x<SW;x++){
    const ch=rows[y][x];
    if(!GROUND.has(ch)||ch==='@') { if(ch!=='@') drawObject(c2d,rows,x,y,ch,opts,f,fg); }
  }
  // sombras suaves bajo objetos altos hacia el sur (profundidad)
  for(let y=0;y<SH;y++) for(let x=0;x<SW;x++){
    const ch=rows[y][x]; const below=rows[y+1]&&rows[y+1][x];
    if((ch==='M'||ch==='v'||ch==='H'||ch==='D'||ch==='"')&&below!==undefined&&!SOLID.has(below)&&!WATER.has(below)){
      c2d.fillStyle='rgba(16,24,20,.2)'; c2d.fillRect(x*16,(y+1)*16,16,2); c2d.fillStyle='rgba(16,24,20,.1)'; c2d.fillRect(x*16,(y+1)*16+2,16,2);
    }
  }
  if(ox||oy){ /* compat: renderizar con offset no se usa; se dibuja a 0,0 */ }
}
function isSolidCh(ch,ctxFlags){ // colisión pura por char
  if(ch==='z') return !(ctxFlags&&ctxFlags.brambleDry);
  return SOLID.has(ch);
}
