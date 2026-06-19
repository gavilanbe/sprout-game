'use strict';
/* ---------- TILES pre-renderizados ---------- */
function mkTile(fn){const c=document.createElement('canvas');c.width=16;c.height=16;fn(c.getContext('2d'));return c;}
function grassBase(g,seed){
  g.fillStyle=C.grass; g.fillRect(0,0,16,16);
  for(let i=0;i<7;i++){const h=hash(seed*31+i,i*7);
    g.fillStyle=(h%3===0)?C.grassDD:C.grassD;
    g.fillRect(h%15,(h>>4)%15,(h%2)+1,1);}
}
const TILES={};
TILES['.']={v:3,frames:[0,1,2].map(s=>mkTile(g=>grassBase(g,s)))};
TILES[',']=TILES['.'];
TILES['f']={v:2,frames:[0,1].map(s=>mkTile(g=>{grassBase(g,s+9);
  const col=s?C.flower2:C.flower1;
  [[3,3],[10,8]].forEach(([x,y],i)=>{
    g.fillStyle=col; g.fillRect(x+1,y,1,1);g.fillRect(x,y+1,1,1);g.fillRect(x+2,y+1,1,1);g.fillRect(x+1,y+2,1,1);
    g.fillStyle=C.flowerC; g.fillRect(x+1,y+1,1,1);});
}))};
TILES['t']={anim:true,frames:[0,1].map(f=>mkTile(g=>{grassBase(g,4);
  g.fillStyle=C.grassDD;
  for(let i=0;i<4;i++){const x=2+i*4, sway=f? (i%2):((i+1)%2);
    g.fillRect(x+sway,6,1,8); g.fillRect(x+1+sway,8,1,6); g.fillRect(x-1+sway*2,9,1,5);}
}))};
TILES['p']={v:2,frames:[0,1].map(s=>mkTile(g=>{
  g.fillStyle=C.path; g.fillRect(0,0,16,16);
  for(let i=0;i<5;i++){const h=hash(s*13+i,i*5);
    g.fillStyle=C.pathD; g.fillRect(h%14+1,(h>>3)%14+1,1,1);}
}))};
TILES['s']={v:2,frames:[0,1].map(s=>mkTile(g=>{
  g.fillStyle=C.sand; g.fillRect(0,0,16,16);
  for(let i=0;i<6;i++){const h=hash(s*17+i,i*11);
    g.fillStyle=C.sandD; g.fillRect(h%15,(h>>3)%15,1,1);}
}))};
TILES['W']={anim:true,frames:[0,1].map(f=>mkTile(g=>{
  g.fillStyle=C.water; g.fillRect(0,0,16,16);
  g.fillStyle=C.waterL;
  for(let r=0;r<2;r++){const y=(r*8+f*4+2)%16;
    g.fillRect(1+f*2,y,4,1); g.fillRect(9+(1-f)*2,(y+8)%16,4,1);}
}))};
TILES['b']={v:1,frames:[mkTile(g=>{grassBase(g,5);
  g.fillStyle=PAL.k; g.fillRect(3,3,10,10);
  g.fillStyle=C.canopy; g.fillRect(4,4,8,8);
  g.fillStyle=C.canopyL; g.fillRect(5,5,2,2);g.fillRect(9,7,2,2);g.fillRect(6,9,2,1);
  g.fillStyle=PAL.k; g.fillRect(4,4,1,1);g.fillRect(11,4,1,1);g.fillRect(4,11,1,1);g.fillRect(11,11,1,1);
})]};
TILES['Q']=TILES['b'];
TILES['T']={v:1,frames:[mkTile(g=>{grassBase(g,6);
  g.fillStyle=PAL.k; g.fillRect(2,1,12,11);
  g.fillStyle=C.canopy; g.fillRect(3,2,10,9);
  g.fillStyle=C.canopyL; g.fillRect(4,3,3,2);g.fillRect(9,5,3,2);g.fillRect(5,7,2,2);
  g.fillStyle=PAL.k; g.fillRect(6,11,4,4);
  g.fillStyle=C.trunk; g.fillRect(7,11,2,4);
})]};
TILES['r']={v:2,frames:[0,1].map(s=>mkTile(g=>{grassBase(g,7+s);
  g.fillStyle=PAL.k; g.fillRect(2,3,12,11);
  g.fillStyle=C.rock; g.fillRect(3,4,10,9);
  g.fillStyle=C.rockL; g.fillRect(4,5,4,2);g.fillRect(5+s*3,8,2,1);
  g.fillStyle=C.rockD; g.fillRect(9,9,3,3);g.fillRect(3,11,3,2);
}))};
TILES['F']={v:1,frames:[mkTile(g=>{grassBase(g,8);
  g.fillStyle=C.woodD; g.fillRect(2,4,3,10);g.fillRect(11,4,3,10);
  g.fillStyle=C.wood; g.fillRect(3,5,1,8);g.fillRect(12,5,1,8);
  g.fillStyle=C.woodD; g.fillRect(0,7,16,2);
})]};
TILES['H']={v:1,frames:[mkTile(g=>{
  g.fillStyle=C.wall; g.fillRect(0,0,16,16);
  g.fillStyle=C.wallD; for(let y=3;y<16;y+=4) g.fillRect(0,y,16,1);
  g.fillRect(7,0,1,16);
})]};
TILES['D']={v:1,frames:[mkTile(g=>{
  g.fillStyle=C.wall; g.fillRect(0,0,16,16);
  g.fillStyle=PAL.k; g.fillRect(3,2,10,14);
  g.fillStyle='#2a1810'; g.fillRect(4,3,8,13);
  g.fillStyle=PAL.a; g.fillRect(10,9,1,2);
})]};
TILES['R']={v:1,frames:[mkTile(g=>{
  g.fillStyle=C.roof; g.fillRect(0,0,16,16);
  g.fillStyle=C.roofD; for(let y=2;y<16;y+=4) g.fillRect(0,y,16,2);
  g.fillStyle=PAL.k; g.fillRect(0,14,16,2);
})]};
TILES['S']={v:1,frames:[mkTile(g=>{grassBase(g,9);
  g.fillStyle=PAL.k; g.fillRect(2,2,12,8); g.fillRect(7,10,2,5);
  g.fillStyle=C.wood; g.fillRect(3,3,10,6);
  g.fillStyle=C.woodD; g.fillRect(4,4,8,1); g.fillRect(4,6,6,1); g.fillRect(7,10,1,5);
})]};
TILES['E']={v:1,frames:TILES['.'].frames.slice(0,1)}; // hierba bajo el anciano
TILES['Ñ']=TILES['.']; // suelo sagrado bajo el Roble: hierba (sólida); el árbol pone sus raíces
function altarTile(s){ return mkTile(g=>{ // altar de estación: pedestal sobre tierra sagrada
  g.fillStyle=C.path; g.fillRect(0,0,16,16); // base neutra: vale para toda estación
  for(let i=0;i<5;i++){const h=hash(37+s*13+i,i*5);
    g.fillStyle=C.pathD; g.fillRect(h%14+1,(h>>3)%14+1,1,1);}
  g.fillStyle=PAL.k; g.fillRect(2,6,12,9);
  g.fillStyle='#b0a890'; g.fillRect(3,7,10,7);
  g.fillStyle='#d0c8b0'; g.fillRect(4,7,8,2);
  g.fillStyle='#7a7464'; g.fillRect(4,12,8,2);
  g.fillStyle=PAL.k; g.fillRect(4,2,8,5);     // el cuenco que espera su reliquia
  g.fillStyle='#8a8aa0'; g.fillRect(5,3,6,3);
  g.fillStyle='#6a6a80'; g.fillRect(5,5,6,1);
  if(s===1){ // motivo tallado: capullo de primavera
    g.fillStyle='#e88ab0'; g.fillRect(7,10,2,2); g.fillStyle='#f8c8e0'; g.fillRect(7,10,1,1);
  } else if(s===2){ // sol de verano
    g.fillStyle='#e8b050'; g.fillRect(7,10,2,2);
    g.fillStyle='#f8e060'; g.fillRect(6,10,1,1); g.fillRect(9,11,1,1); g.fillRect(7,9,1,1); g.fillRect(8,12,1,1);
  } else { // copo de invierno
    g.fillStyle='#9ec7e8'; g.fillRect(7,10,2,2);
    g.fillStyle='#dff0ff'; g.fillRect(6,10,1,1); g.fillRect(9,10,1,1); g.fillRect(7,9,1,1); g.fillRect(8,12,1,1);
  }
});}
TILES['[']={v:1,frames:[altarTile(1)]}; // primavera
TILES[']']={v:1,frames:[altarTile(2)]}; // verano
TILES['}']={v:1,frames:[altarTile(3)]}; // invierno, apartado al sur
/* --- interior de la casa --- */
function woodFloor(g,s){
  g.fillStyle='#c89858'; g.fillRect(0,0,16,16);
  g.fillStyle='#a87840'; g.fillRect(0,7,16,1); g.fillRect(0,15,16,1);
  g.fillRect(s?4:10,0,1,7); g.fillRect(s?12:6,8,1,7);
}
TILES['o']={v:2,frames:[0,1].map(s=>mkTile(g=>woodFloor(g,s)))};
TILES['I']={v:1,frames:[mkTile(g=>{
  g.fillStyle='#6a4828'; g.fillRect(0,0,16,16);
  g.fillStyle='#4a3018'; for(let y=3;y<16;y+=4) g.fillRect(0,y,16,1);
  g.fillStyle='#7e5a36'; g.fillRect(0,0,16,1);
  g.fillStyle=PAL.k; g.fillRect(0,14,16,2);
})]};
TILES['P']={v:1,frames:[mkTile(g=>{ // cama-maceta de un brote
  woodFloor(g,0);
  g.fillStyle=PAL.k; g.fillRect(1,2,14,13);
  g.fillStyle='#c06030'; g.fillRect(2,3,12,11);
  g.fillStyle='#8a3818'; g.fillRect(2,11,12,3);
  g.fillStyle='#3a2410'; g.fillRect(3,4,10,5);   // tierra mullida
  g.fillStyle='#241608'; g.fillRect(4,5,3,1); g.fillRect(9,7,3,1);
  g.fillStyle=PAL.l; g.fillRect(4,4,3,2);        // hojita-almohada
})]};
TILES['x']={v:1,frames:[mkTile(g=>{ // felpudo de salida
  woodFloor(g,1);
  g.fillStyle='#e8d0a0'; g.fillRect(2,3,12,11);
  g.fillStyle='#c8a878'; g.fillRect(3,4,10,9);
  g.fillStyle='#e8d0a0'; g.fillRect(4,5,8,7);
  g.fillStyle='#c8a878'; g.fillRect(5,7,6,1); g.fillRect(5,9,6,1);
})]};
TILES['u']={v:1,frames:[mkTile(g=>{ // maceta decorativa
  woodFloor(g,0);
  g.fillStyle=PAL.k; g.fillRect(4,6,8,9);
  g.fillStyle='#c06030'; g.fillRect(5,7,6,7);
  g.fillStyle='#8a3818'; g.fillRect(5,12,6,2);
  g.fillStyle='#2e8038'; g.fillRect(7,2,2,3);
  g.fillStyle=PAL.l; g.fillRect(5,3,2,2); g.fillRect(9,4,2,2);
})]};
TILES['g']=TILES['o'];                 // suelo de madera bajo el tendero
TILES['ñ']={v:1,frames:[mkTile(g=>{   // mostrador de la tienda
  g.fillStyle='#8a5828'; g.fillRect(0,0,16,16);
  g.fillStyle='#c08850'; g.fillRect(0,0,16,6);
  g.fillStyle='#e0a868'; g.fillRect(0,0,16,1);
  g.fillStyle='#a87840'; g.fillRect(0,6,16,2);
  g.fillStyle='#6a4828'; g.fillRect(0,13,16,3);
  g.fillStyle=PAL.k; g.fillRect(0,15,16,1);
  g.fillStyle=PAL.a; g.fillRect(3,2,2,2); g.fillRect(11,2,2,2); // bellotas expuestas
})]};

/* --- bioma invernal --- */
function snowBase(g,seed){
  g.fillStyle='#e8f0f8'; g.fillRect(0,0,16,16);
  for(let i=0;i<5;i++){const h=hash(seed*29+i,i*13);
    g.fillStyle=(h%3)?'#cddcec':'#b8cce0';
    g.fillRect(h%15,(h>>4)%15,(h%2)+1,1);}
}
TILES['n']={v:3,frames:[0,1,2].map(s=>mkTile(g=>snowBase(g,s)))};
TILES['i']={v:2,frames:[0,1].map(s=>mkTile(g=>{snowBase(g,s+5);
  g.fillStyle='#a8d0e8'; g.fillRect(2,3,12,10);
  g.fillStyle='#cfe6f4'; g.fillRect(3,4,10,8);
  g.fillStyle='#ffffff'; g.fillRect(4+s*3,5,3,1); g.fillRect(8-s*2,9,2,1);
}))};
TILES['Y']={v:1,frames:[mkTile(g=>{snowBase(g,7);
  g.fillStyle=PAL.k; g.fillRect(2,1,12,11);
  g.fillStyle=C.canopy; g.fillRect(3,2,10,9);
  g.fillStyle='#e8f0f8'; g.fillRect(3,2,10,3); g.fillRect(5,6,3,2);
  g.fillStyle=PAL.k; g.fillRect(6,11,4,4);
  g.fillStyle=C.trunk; g.fillRect(7,11,2,4);
})]};
TILES['M']={v:2,frames:[0,1].map(s=>mkTile(g=>{
  g.fillStyle='#8a8aa0'; g.fillRect(0,0,16,16);
  g.fillStyle='#6a6a80'; g.fillRect(0,12+s,16,4-s);
  g.fillStyle='#b8c0d0'; g.fillRect(1+s*2,4,5,3); g.fillRect(9,7+s,4,2);
  g.fillStyle='#e8f0f8'; g.fillRect(0,0,16,3); g.fillRect(2+s*4,3,4,1);
  g.fillStyle=PAL.k; g.fillRect(0,15,16,1);
}))};
TILES['G']={v:1,frames:[mkTile(g=>{
  g.fillStyle='#8a8aa0'; g.fillRect(0,0,16,16);
  g.fillStyle='#e8f0f8'; g.fillRect(0,0,16,2);
  g.fillStyle=PAL.k; g.fillRect(3,4,10,12);
  g.fillStyle='#16121e'; g.fillRect(4,5,8,11);
  g.fillStyle='#3a3448'; g.fillRect(4,5,8,2);
})]};
TILES['C']={v:1,frames:[mkTile(g=>{
  g.fillStyle='#a89078'; g.fillRect(0,0,16,16);
  g.fillStyle='#c4ac90'; g.fillRect(2,2,5,4); g.fillRect(9,8,5,4);
  g.fillStyle=PAL.k;
  g.fillRect(7,1,2,4); g.fillRect(8,5,2,4); g.fillRect(6,9,2,4); g.fillRect(7,13,2,3);
  g.fillRect(3,7,4,2); g.fillRect(10,6,4,2);
  g.fillStyle='#6a543c'; g.fillRect(0,15,16,1); g.fillRect(0,0,16,1);
})]};
TILES['z']={v:1,frames:[mkTile(g=>{grassBase(g,11);
  g.fillStyle=PAL.k; g.fillRect(1,2,14,13);
  g.fillStyle='#2a3a20'; g.fillRect(2,3,12,11);
  g.fillStyle='#48582e'; g.fillRect(3,5,3,2); g.fillRect(9,4,3,2); g.fillRect(6,9,4,2);
  g.fillStyle='#c83838'; g.fillRect(4,4,1,1); g.fillRect(11,7,1,1); g.fillRect(6,11,1,1);
})]};
TILES['zd']={v:1,frames:[mkTile(g=>{grassBase(g,12); // zarza seca, transitable
  g.fillStyle='#8a7048';
  g.fillRect(3,9,4,1); g.fillRect(8,11,5,1); g.fillRect(5,12,2,1); g.fillRect(11,8,1,3);
  g.fillStyle='#6a543c'; g.fillRect(4,10,1,2); g.fillRect(9,9,1,2);
})]};
TILES['O']={anim:true,frames:[0,1].map(f=>mkTile(g=>{grassBase(g,13);
  g.fillStyle=PAL.k; g.fillRect(3,1,10,14);
  g.fillStyle='#8a8aa0'; g.fillRect(4,2,8,12);
  g.fillStyle='#6a6a80'; g.fillRect(4,11,8,3);
  g.fillStyle=f?'#58e8d8':'#2e9a8e';
  g.fillRect(7,4,2,2); g.fillRect(6,7,1,2); g.fillRect(9,7,1,2); g.fillRect(7,10,2,1);
}))};
/* --- mazmorra --- */
TILES['v']={v:2,frames:[0,1].map(s=>mkTile(g=>{
  g.fillStyle='#3a3448'; g.fillRect(0,0,16,16);
  g.fillStyle='#262030'; for(let y=3;y<16;y+=4) g.fillRect(0,y,16,1);
  g.fillRect(s?5:10,0,1,3); g.fillRect(s?11:3,4,1,3); g.fillRect(s?7:12,8,1,3);
  g.fillStyle='#4e4860'; g.fillRect(1+s*6,1,3,1);
}))};
TILES['q']={v:3,frames:[0,1,2].map(s=>mkTile(g=>{
  g.fillStyle='#5a4a40'; g.fillRect(0,0,16,16);
  for(let i=0;i<4;i++){const h=hash(s*37+i,i*17);
    g.fillStyle=(h%2)?'#4a3c34':'#6e5a4c';
    g.fillRect(h%14+1,(h>>3)%14+1,2,1);}
}))};
TILES['%']={v:1,frames:[mkTile(g=>{
  g.fillStyle='#5a4a40'; g.fillRect(0,0,16,16);
  g.fillStyle=PAL.k; g.fillRect(3,3,10,10);
  g.fillStyle='#8a8aa0'; g.fillRect(4,4,8,8);
  g.fillStyle='#b8c0d0'; g.fillRect(5,5,6,2);
  g.fillStyle='#58e8d8'; g.fillRect(7,7,2,2);
})]};
TILES['&']={v:1,frames:[mkTile(g=>{
  g.fillStyle='#5a4a40'; g.fillRect(0,0,16,16);
  g.fillStyle=PAL.k; g.fillRect(3,3,10,10);
  g.fillStyle='#6a6a80'; g.fillRect(4,4,8,8);
  g.fillStyle='#58e8d8'; g.fillRect(7,7,2,2);
})]};
TILES['=']={v:1,frames:[mkTile(g=>{
  g.fillStyle='#5a4a40'; g.fillRect(0,0,16,16);
  g.fillStyle=PAL.k; g.fillRect(1,0,3,16); g.fillRect(6,0,3,16); g.fillRect(11,0,3,16);
  g.fillStyle='#8a7048'; g.fillRect(2,0,1,16); g.fillRect(7,0,1,16); g.fillRect(12,0,1,16);
  g.fillStyle=PAL.k; g.fillRect(0,2,16,2); g.fillRect(0,12,16,2);
})]};
/* --- puzzles: bloque-raíz, placa, verja-cerrojo, llave-bellota --- */
TILES['#']={v:1,frames:[mkTile(g=>{ // roca-raíz empujable
  g.fillStyle='#5a4a40'; g.fillRect(0,0,16,16);
  g.fillStyle=PAL.k; g.fillRect(1,1,14,14);
  g.fillStyle='#8a7460'; g.fillRect(2,2,12,12);
  g.fillStyle='#a89078'; g.fillRect(3,3,5,3); g.fillRect(9,8,3,3);
  g.fillStyle='#3a7a30'; g.fillRect(2,2,2,2); g.fillRect(12,12,2,2); // brotecitos
  g.fillStyle='#6a5a4c'; g.fillRect(4,10,7,2);
})]};
TILES['_']={v:1,frames:[mkTile(g=>{ // placa sensible (suelta)
  g.fillStyle='#5a4a40'; g.fillRect(0,0,16,16);
  g.fillStyle=PAL.k; g.fillRect(3,3,10,10);
  g.fillStyle='#6e5a8a'; g.fillRect(4,4,8,8);
  g.fillStyle='#9a86c8'; g.fillRect(5,5,6,2);
})]};
TILES['ç']={v:1,frames:[mkTile(g=>{ // placa pulsada
  g.fillStyle='#5a4a40'; g.fillRect(0,0,16,16);
  g.fillStyle=PAL.k; g.fillRect(3,3,10,10);
  g.fillStyle='#3a2e5a'; g.fillRect(4,4,8,8);
  g.fillStyle='#58e8d8'; g.fillRect(6,6,4,4);
})]};
TILES[')']={v:1,frames:[mkTile(g=>{ // verja con cerrojo de bellota
  g.fillStyle='#5a4a40'; g.fillRect(0,0,16,16);
  g.fillStyle=PAL.k; g.fillRect(1,0,3,16); g.fillRect(6,0,3,16); g.fillRect(11,0,3,16);
  g.fillStyle='#8a7048'; g.fillRect(2,0,1,16); g.fillRect(7,0,1,16); g.fillRect(12,0,1,16);
  g.fillStyle=PAL.A; g.fillRect(6,6,4,5); g.fillStyle=PAL.a; g.fillRect(7,7,2,3); // candado bellota
})]};
/* --- las marismas (otoño eterno) --- */
function autumnBase(g,seed){
  g.fillStyle='#c8a850'; g.fillRect(0,0,16,16);
  for(let i=0;i<7;i++){const h=hash(seed*41+i,i*9);
    g.fillStyle=(h%3===0)?'#8a7838':'#a88838';
    g.fillRect(h%15,(h>>4)%15,(h%2)+1,1);}
}
TILES['·']={v:3,frames:[0,1,2].map(s=>mkTile(g=>autumnBase(g,s)))};
TILES['¥']={v:1,frames:[mkTile(g=>{autumnBase(g,4);
  g.fillStyle=PAL.k; g.fillRect(2,1,12,11);
  g.fillStyle='#c87830'; g.fillRect(3,2,10,9);
  g.fillStyle='#e8a040'; g.fillRect(4,3,3,2); g.fillRect(9,5,3,2); g.fillRect(5,7,2,2);
  g.fillStyle=PAL.k; g.fillRect(6,11,4,4);
  g.fillStyle=C.trunk; g.fillRect(7,11,2,4);
})]};
TILES['†']={anim:true,frames:[0,1].map(f=>mkTile(g=>{autumnBase(g,6);
  g.fillStyle='#8a7838';
  for(let i=0;i<4;i++){const x=2+i*4, sway=f?(i%2):((i+1)%2);
    g.fillRect(x+sway,6,1,8); g.fillRect(x+1+sway,8,1,6);}
}))};
TILES['~']={anim:true,frames:[0,1].map(f=>mkTile(g=>{
  g.fillStyle='#486848'; g.fillRect(0,0,16,16);
  g.fillStyle='#6a8a58';
  for(let r=0;r<2;r++){const y=(r*8+f*4+3)%16;
    g.fillRect(2+f*3,y,4,1); g.fillRect(10-(f*2),(y+8)%16,3,1);}
  g.fillStyle='#3a5638'; g.fillRect(12,2+f*6,2,1);
}))};
TILES['>']={v:1,frames:[mkTile(g=>{
  g.fillStyle='#5a4a40'; g.fillRect(0,0,16,16);
  g.fillStyle=PAL.k; g.fillRect(2,2,12,12);
  g.fillStyle='#3a3026'; g.fillRect(3,3,10,3);
  g.fillStyle='#2a2018'; g.fillRect(4,6,8,3);
  g.fillStyle='#16100c'; g.fillRect(5,9,6,4);
})]};
/* --- el valle mustio (antes de devolver las semillas): el verdor se apaga --- */
function wiltBase(g,seed){
  g.fillStyle='#a8a858'; g.fillRect(0,0,16,16);
  for(let i=0;i<7;i++){const h=hash(seed*23+i,i*7);
    g.fillStyle=(h%3===0)?'#7a7a40':'#90904c';
    g.fillRect(h%15,(h>>4)%15,(h%2)+1,1);}
}
TILES['w0']={v:3,frames:[0,1,2].map(s=>mkTile(g=>wiltBase(g,s)))};
TILES['w1']={anim:true,frames:[0,1].map(f=>mkTile(g=>{wiltBase(g,4);
  g.fillStyle='#7a7a40';
  for(let i=0;i<4;i++){const x=2+i*4, sway=f?(i%2):((i+1)%2);
    g.fillRect(x+sway,7,1,7); g.fillRect(x+1+sway,9,1,5);}
}))};
TILES['w2']={v:1,frames:[mkTile(g=>{wiltBase(g,6); // árbol mustio
  g.fillStyle=PAL.k; g.fillRect(2,1,12,11);
  g.fillStyle='#6a7a3a'; g.fillRect(3,2,10,9);
  g.fillStyle='#8a9a4a'; g.fillRect(4,3,3,2); g.fillRect(9,5,3,2);
  g.fillStyle=PAL.k; g.fillRect(6,11,4,4);
  g.fillStyle='#6a4a28'; g.fillRect(7,11,2,4);
})]};
TILES['wb']={v:1,frames:[mkTile(g=>{wiltBase(g,8); // arbusto reseco
  g.fillStyle=PAL.k; g.fillRect(3,3,10,10);
  g.fillStyle='#7a7a40'; g.fillRect(4,4,8,8);
  g.fillStyle='#90904c'; g.fillRect(5,5,2,2); g.fillRect(9,7,2,2);
})]};
TILES['wr']={v:2,frames:[0,1].map(s=>mkTile(g=>{wiltBase(g,10+s); // roca sobre suelo mustio
  g.fillStyle=PAL.k; g.fillRect(2,3,12,11);
  g.fillStyle=C.rock; g.fillRect(3,4,10,9);
  g.fillStyle=C.rockL; g.fillRect(4,5,4,2); g.fillRect(5+s*3,8,2,1);
  g.fillStyle=C.rockD; g.fillRect(9,9,3,3); g.fillRect(3,11,3,2);
}))};
TILES['wS']={v:1,frames:[mkTile(g=>{wiltBase(g,13); // cartel sobre suelo mustio
  g.fillStyle=PAL.k; g.fillRect(2,2,12,8); g.fillRect(7,10,2,5);
  g.fillStyle=C.wood; g.fillRect(3,3,10,6);
  g.fillStyle=C.woodD; g.fillRect(4,4,8,1); g.fillRect(4,6,6,1); g.fillRect(7,10,1,5);
})]};
TILES['nr']={v:2,frames:[0,1].map(s=>mkTile(g=>{snowBase(g,10+s); // roca nevada
  g.fillStyle=PAL.k; g.fillRect(2,3,12,11);
  g.fillStyle=C.rock; g.fillRect(3,4,10,9);
  g.fillStyle='#e8f0f8'; g.fillRect(3,4,10,2); // capa de nieve
  g.fillStyle=C.rockD; g.fillRect(9,9,3,3); g.fillRect(3,11,3,2);
}))};
TILES['nS']={v:1,frames:[mkTile(g=>{snowBase(g,13); // cartel nevado
  g.fillStyle=PAL.k; g.fillRect(2,2,12,8); g.fillRect(7,10,2,5);
  g.fillStyle=C.wood; g.fillRect(3,3,10,6);
  g.fillStyle='#e8f0f8'; g.fillRect(2,2,12,2);
  g.fillStyle=C.woodD; g.fillRect(4,6,6,1); g.fillRect(7,10,1,5);
})]};
TILES['nb']={v:1,frames:[mkTile(g=>{snowBase(g,15); // arbusto con gorro de nieve
  g.fillStyle=PAL.k; g.fillRect(3,3,10,10);
  g.fillStyle=C.canopy; g.fillRect(4,4,8,8);
  g.fillStyle='#e8f0f8'; g.fillRect(4,4,8,3); g.fillRect(6,8,3,2);
})]};
TILES['ar']={v:2,frames:[0,1].map(s=>mkTile(g=>{autumnBase(g,10+s); // roca entre hojarasca
  g.fillStyle=PAL.k; g.fillRect(2,3,12,11);
  g.fillStyle=C.rock; g.fillRect(3,4,10,9);
  g.fillStyle=C.rockL; g.fillRect(4,5,4,2);
  g.fillStyle=C.rockD; g.fillRect(9,9,3,3); g.fillRect(3,11,3,2);
}))};
TILES['aS']={v:1,frames:[mkTile(g=>{autumnBase(g,13); // cartel otoñal
  g.fillStyle=PAL.k; g.fillRect(2,2,12,8); g.fillRect(7,10,2,5);
  g.fillStyle=C.wood; g.fillRect(3,3,10,6);
  g.fillStyle=C.woodD; g.fillRect(4,4,8,1); g.fillRect(4,6,6,1); g.fillRect(7,10,1,5);
})]};
/* verano vivo (fase del ciclo post-final): hierba cálida */
TILES['g1']={v:3,frames:[0,1,2].map(s=>mkTile(g=>{
  g.fillStyle='#8cc84a'; g.fillRect(0,0,16,16);
  for(let i=0;i<7;i++){const h=hash(s*29+i,i*7);
    g.fillStyle=(h%4===0)?'#e8d060':((h%3===0)?'#6aa83a':'#7ab842');
    g.fillRect(h%15,(h>>4)%15,(h%2)+1,1);}
}))};
/* arbusto de otoño (para las marismas y la fase otoñal) */
TILES['bA']={v:1,frames:[mkTile(g=>{autumnBase(g,8);
  g.fillStyle=PAL.k; g.fillRect(3,3,10,10);
  g.fillStyle='#c87830'; g.fillRect(4,4,8,8);
  g.fillStyle='#e8a040'; g.fillRect(5,5,2,2); g.fillRect(9,7,2,2); g.fillRect(6,9,2,1);
  g.fillStyle=PAL.k; g.fillRect(4,4,1,1); g.fillRect(11,11,1,1);
})]};
/* --- el TRONCO HUECO por dentro: madera viva, no cueva --- */
TILES['vw']={v:2,frames:[0,1].map(s=>mkTile(g=>{ // pared de madera con anillos
  g.fillStyle='#5a3c22'; g.fillRect(0,0,16,16);
  g.fillStyle='#422c18'; for(let y=2;y<16;y+=5) g.fillRect(0,y,16,2);
  g.fillStyle='#6e4c2c'; for(let y=0;y<16;y+=5) g.fillRect(0,y,16,1);
  g.fillStyle='#422c18'; g.fillRect(s?4:11,0,1,16);
}))};
TILES['qw']={v:3,frames:[0,1,2].map(s=>mkTile(g=>{ // suelo de duramen
  g.fillStyle='#8a6438'; g.fillRect(0,0,16,16);
  for(let i=0;i<4;i++){const h=hash(s*31+i,i*13);
    g.fillStyle=(h%2)?'#7a5630':'#9a7444';
    g.fillRect(h%14+1,(h>>3)%14+1,2,1);}
}))};
TILES['vh']={v:2,frames:[0,1].map(s=>mkTile(g=>{ // pared de panal: celdas de ámbar
  g.fillStyle='#a87828'; g.fillRect(0,0,16,16);
  g.fillStyle='#8a5e1c';
  for(let y=0;y<16;y+=5) for(let x=((y/5)|0)%2?4:0;x<16;x+=8){
    g.fillRect(x,y,7,4);
  }
  g.fillStyle='#d8a838';
  for(let y=1;y<16;y+=5) for(let x=((y/5)|0+(s?1:0))%2?5:1;x<16;x+=8) g.fillRect(x,y,5,2);
}))};
TILES['qh']={v:2,frames:[0,1].map(s=>mkTile(g=>{ // suelo de cera
  g.fillStyle='#c89c48'; g.fillRect(0,0,16,16);
  for(let i=0;i<4;i++){const h=hash(s*37+i,i*11);
    g.fillStyle=(h%2)?'#b08838':'#d8ac58';
    g.fillRect(h%14+1,(h>>3)%14+1,2,1);}
}))};
TILES['⌐']={v:1,frames:[mkTile(g=>{ // estantería de Tilo con su género
  g.fillStyle='#6a4828'; g.fillRect(0,0,16,16);
  g.fillStyle='#8a5828'; g.fillRect(1,1,14,14);
  g.fillStyle='#c08850'; g.fillRect(1,5,14,2); g.fillRect(1,11,14,2);
  g.fillStyle=PAL.l; g.fillRect(3,2,2,3);                       // hoja embotellada
  g.fillStyle='#58e8d8'; g.fillRect(7,2,3,3);                   // frasco de savia
  g.fillStyle=PAL.a; g.fillRect(12,3,2,2);                      // bellota
  g.fillStyle='#d84878'; g.fillRect(4,8,2,2); g.fillRect(10,8,3,2); // bayas en tarros
})]};

/* al deshelarse, el norte reverdece reutilizando tiles del valle */
const THAW={'n':'.','Y':'T','M':'r','i':'f'};
const AUTUMN={'.':'·','T':'¥','t':'†','f':'·',',':'·','b':'bA','Q':'bA',
              'r':'ar','S':'aS','Ñ':'·','E':'·','h':'·','j':'·','y':'·'};
/* el valle ANTES de recuperar las semillas: mustio (sólo visual) */
const WILT={'.':'w0',',':'w0','t':'w1','T':'w2','f':'w0','b':'wb',
            'r':'wr','S':'wS','Ñ':'w0','E':'w0','h':'w0','j':'w0','y':'w0'};
/* fases del ciclo post-final (sólo visual; primavera = tiles normales + flores) */
const SUMMER_P={'.':'g1',',':'g1','Ñ':'g1','E':'g1','h':'g1','j':'g1','y':'g1'};
const WINTER_P={'.':'n',',':'n','t':'n','f':'n','T':'Y','b':'nb','Q':'nb',
                'r':'nr','S':'nS','Ñ':'n','E':'n','h':'n','j':'n','y':'n'};
/* el Tronco Hueco y el panal de la Reina, con su propia madera */
const TRONCO={'v':'vw','q':'qw'};
const HIVE={'v':'vh','q':'qh'};

const SOLID = new Set(['b','Q','T','r','W','F','H','D','R','S','E','I','u','Y','M','G','C','v','=','O','h','j','y','g','ñ','Ñ','~','¥','#',')','[',']','}','⌐']);
function isSolid(ch){
  if(ch==='z') return !won;       // la zarza se seca al florecer el valle
  return SOLID.has(ch);
}

