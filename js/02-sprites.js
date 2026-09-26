'use strict';
/* ---------- utilidades de sprite ---------- */
function sprN(rows,extra){ // sprite de tamaño libre: cada char es un color de PAL (o de extra)
  const w=rows[0].length, c=mkCanvas(w,rows.length), g=c.getContext('2d');
  rows.forEach((r,y)=>{
    if(r.length!==w) console.error('fila mala ('+r.length+' vs '+w+'):', r);
    for(let x=0;x<r.length;x++){ const ch=r[x]; if(ch==='.') continue;
      g.fillStyle=(extra&&extra[ch])||PAL[ch]||'#ff00ff'; g.fillRect(x,y,1,1); }
  });
  return c;
}
function spr(rows,extra){ if(rows.length!==16) console.error('sprite no es 16 filas',rows.length); return sprN(rows,extra); }
function spr8(rows,extra){ return sprN(rows,extra); }
function flipH(c){const n=mkCanvas(c.width,c.height);const g=n.getContext('2d');g.translate(c.width,0);g.scale(-1,1);g.drawImage(c,0,0);return n;}
function flipV(c){const n=mkCanvas(c.width,c.height);const g=n.getContext('2d');g.translate(0,c.height);g.scale(1,-1);g.drawImage(c,0,0);return n;}
function tintTo(c,col){const n=mkCanvas(c.width,c.height);const g=n.getContext('2d');g.drawImage(c,0,0);
  g.globalCompositeOperation='source-in';g.fillStyle=col;g.fillRect(0,0,c.width,c.height);return n;}
function whiten(c){ return tintTo(c,'#ffffff'); }
function darken(c){ return tintTo(c,'#0c1810'); }
function scaleN(c,n){const o=mkCanvas(c.width*n,c.height*n);const g=o.getContext('2d');g.imageSmoothingEnabled=false;g.drawImage(c,0,0,o.width,o.height);return o;}
function shadowOf(c){ return tintTo(c,'rgba(20,16,12,.35)'); }

/* ============================================================
   SPROUT, el brote — 16×16. Dos hojas en la cabeza, bulbo, túnica.
   k contorno · h/s/S/T bulbo (luz→sombra) · L/l/d/D hojas
   q brillo del ojo · c moflete · m boca · B/b/n túnica · f/F botas
   Se construye por filas: hojas (0-4), cabeza (5-11), cuerpo (12-13),
   pies (14-15). El andar tiene 4 tiempos con rebote.
   ============================================================ */
const HERO_PAL={h:'#fff0c8',s:'#f8cc88',S:'#dc9c5c',T:'#b0703c',L:'#d0f890',l:'#78d838',d:'#2e9a38',D:'#1a5a24',
  q:'#ffffff',c:'#f89a8a',m:'#8a3a28',B:'#ffa060',b:'#e8743c',n:'#b04a20',f:'#6a3818',F:'#a0602e'};
const HERO_ROWS={
  down:{ leaves:["...kkk..........","..kLLlk.....kkk.","..kLlllk...kLlk.","...kllldk.kllk..","......kdkdk....."],
    head:["....kkkkkkkk....","...khhssssssk...","..khsssssssssk..","..khkqsssskqSk..","..kskksssskkSk..","..kscssmmsscSk..","...kSSssssSSk..."],
    body:["...kBbbbbbbnk...","..ksBbbbbbbnSk.."], feet:["....kffkkffk....","....kkk..kkk...."] },
  up:{ leaves:null, // las mismas hojas, vistas por detrás
    head:["....kkkkkkkk....","...ksshhhhssk...","..ksssshhssssk..","..kSssssssssSk..","..kSssssssssSk..","..kSSssssssSSk..","...kTSSSSSSTk..."],
    body:["...kbbnbbnbbk...","..ksbbbbbbbbsk.."], feet:["....kffkkffk....","....kkk..kkk...."] },
  side:{ leaves:["..kkk...........",".kLLlkk.........",".kLllldk..kkk...","..kkklddkkLlk...","......kdkdkk...."],
    head:["....kkkkkkkk....","...khhssssssk...","..khsssssssssk..","..kSsssssskqsk..","..kSsssssskksk..","..kSSssssssck...","...kTSSsssssk...."].map(r=>r.slice(0,16)),
    body:["....kbbbBbbk....","....knbbbbbsk..."], feet:[".....kffkffk....",".....kkk.kkk...."] },
};
HERO_ROWS.up.leaves=HERO_ROWS.down.leaves.map(r=>[...r].reverse().join(''));
/* ensambla una pose: rows = 16 filas de texto */
function heroRows(dir,o){ o=o||{}; const H=HERO_ROWS[dir], out=[];
  const lv=H.leaves.slice(), hd=H.head.slice(), bd=H.body.slice(); let ft=H.feet.slice();
  if(o.feet) ft=o.feet;
  if(o.eyes==='closed') hd[3]=hd[3].replace(/kq/g,'ss');
  const up=o.bob?1:0; // rebote: todo menos los pies sube 1 px; las hojas se estiran
  const top=[...lv,...hd,...bd];
  if(up){ top.splice(4,1); top.push(bd[1]); } // el tallo se esconde y la túnica se estira
  for(let i=0;i<14;i++) out.push(top[i]); out.push(...ft);
  return out;
}
function heroSpr(dir,o){ return spr(heroRows(dir,o),HERO_PAL); }
const FEET={
  down:{stand:["....kffkkffk....","....kkk..kkk...."], stepL:["....kffk.kFk....","....kkk...k....."], stepR:["....kFk.kffk....",".....k...kkk...."]},
  up:{stand:["....kffkkffk....","....kkk..kkk...."], stepL:["....kFk.kffk....",".....k...kkk...."], stepR:["....kffk.kFk....","....kkk...k....."]},
  side:{stand:[".....kffkffk....",".....kkk.kkk...."], stepA:["....kffk..kffk..","....kkk....kkk.."], stepB:["......kffFk.....","......kkkkk....."]},
};
function heroWalk(dir){ const F=FEET[dir];
  if(dir==='side') return [heroSpr(dir,{feet:F.stand}),heroSpr(dir,{feet:F.stepA,bob:1}),heroSpr(dir,{feet:F.stand}),heroSpr(dir,{feet:F.stepB,bob:1})];
  return [heroSpr(dir,{feet:F.stand}),heroSpr(dir,{feet:F.stepL,bob:1}),heroSpr(dir,{feet:F.stand}),heroSpr(dir,{feet:F.stepR,bob:1})]; }
const HW_DOWN=heroWalk('down'), HW_UP=heroWalk('up'), HW_SIDE=heroWalk('side');
const P_BLINK={0:heroSpr('down',{eyes:'closed'}),1:HW_UP[0],3:heroSpr('side',{eyes:'closed'})}; P_BLINK[2]=flipH(P_BLINK[3]);
const H_DOWN_A=HW_DOWN[0], H_DOWN_B=HW_DOWN[1], H_UP_A=HW_UP[0], H_UP_B=HW_UP[1], H_SIDE_A=HW_SIDE[0], H_SIDE_B=HW_SIDE[1];
/* poses de ataque: el brazo se estira hacia donde mira (la Hoja se dibuja aparte) */
const H_ATK_DOWN=(()=>{ const r=heroRows('down',{feet:FEET.down.stepR}); r[12]="...kBbbbbbbnkk.."; r[13]="..ksBbbbbbbnksk."; return spr(r,HERO_PAL); })();
const H_ATK_UP=(()=>{ const r=heroRows('up',{feet:FEET.up.stepL}); r[11]=".kk"+r[11].slice(3); r[12]=".ksk"+r[12].slice(4); r[13]="..kkbbbbbbbbsk.."; return spr(r,HERO_PAL); })();
const H_ATK_SIDE=(()=>{ const r=heroRows('side',{feet:FEET.side.stepA}); r[12]="....kbbbBbbkkk.."; r[13]="....knbbbbbssk.."; return spr(r,HERO_PAL); })();
const H_LIFT=(()=>{ const r=heroRows('down',{feet:FEET.down.stand}).map(x=>x.split(''));
  for(let y=3;y<=10;y++){ r[y][0]=y===3?'.':'k'; r[y][1]=y===3?'k':'s'; r[y][2]=y<5?'k':r[y][2]; r[y][15]=y===3?'.':'k'; r[y][14]=y===3?'k':'s'; r[y][13]=y<5?'k':r[y][13]; }
  r[11][1]='k'; r[11][14]='k'; r[3][1]='k'; r[2][1]='k'; r[2][14]='k'; r[2][0]='.'; r[2][15]='.';
  r[13]="...kBbbbbbbnk...".split(''); return spr(r.map(x=>x.join('')),HERO_PAL); })();
/* dormido y despertando en la maceta: sólo asoma la cabeza */
const H_HEAD=(eyes)=>{ const hr=heroRows('down',{eyes}).slice(0,12); return spr(["................","................","................","................",...hr].slice(0,16),HERO_PAL); };
const H_SLEEP=H_HEAD('closed');
const H_WAKE=H_HEAD();
const H_WILT=spr([ // marchito: hoja caída, cabeza gacha, mustio
"................",
"................",
"...k............",
"..kdk...........",
"...k............",
"....kkkkkkk.....",
"...kSSSSSSSk....",
"...kS><SS<>Sk...",
"...kSSSSSSSk....",
"....kSSSSSk.....",
".....kkkkk......",
"....kmmmmmk.....",
"....kmmmmmk.....",
"....kmk.kmk.....",
"................",
"................",
],{S:'#c8b070','>':'#3a2a10','<':'#3a2a10',m:'#6a4020'});
const H_SEEDLING=spr([
"................","................","................","................","................","................","................",
"......klk.......",
".....klllk......",
"......klk.......",
"......kAk.......",
".....kAAAk......",
"......kAk.......",
".......k........",
"................","................",
]);
const P_SPRITES={ // [dir] → 4 tiempos del andar (0 = quieto); 0 abajo 1 arriba 2 izq 3 dcha
  0:HW_DOWN, 1:HW_UP, 3:HW_SIDE, 2:HW_SIDE.map(flipH),
};
const P_ATK={0:H_ATK_DOWN,1:H_ATK_UP,3:H_ATK_SIDE,2:flipH(H_ATK_SIDE)};
const P_WHITE={0:whiten(H_DOWN_A),1:whiten(H_UP_A),2:whiten(flipH(H_SIDE_A)),3:whiten(H_SIDE_A)};
/* ---------- utilidades de arte a mano: filas → píxeles, contorno, franjas ---------- */
function artPix(g,rows,map,ox,oy){ rows.forEach((r,y)=>{ for(let x=0;x<r.length;x++){ const ch=r[x]; if(ch==='.') continue;
  g.fillStyle=(map&&map[ch])||PAL[ch]||'#ff00ff'; g.fillRect((ox||0)+x,(oy||0)+y,1,1); } }); }
function artOutline(g,w,h,col){ // contorno de 1 px alrededor de todo lo opaco
  const d=g.getImageData(0,0,w,h).data, A=(x,y)=>x>=0&&y>=0&&x<w&&y<h&&d[(y*w+x)*4+3]>40;
  col=col||PAL.k; const v=pxCol(col), B=v!==null&&pxPlain(g)?pxBuf(w,h):null; // opaco: al búfer y de una vez (los mismos píxeles)
  if(!B) g.fillStyle=col; for(let y=0;y<h;y++) for(let x=0;x<w;x++) if(!A(x,y)&&(A(x+1,y)||A(x-1,y)||A(x,y+1)||A(x,y-1))){ if(B) B.d[y*w+x]=v; else g.fillRect(x,y,1,1); }
  if(B) B.into(g,0,0); }
function artClip(g,rects,fn){ g.save(); g.beginPath(); for(const [x,y,w,h] of rects) g.rect(x,y,w,h); g.clip(); fn(); g.restore(); }
const GOLD5=['#6a4210','#b07818','#e0a830','#f8d848','#fff8c0'];
const IRON5=['#26262e','#4a4a58','#76768a','#a8a8bc','#e0e0f0'];
/* LA HOJA: una hoja de verdad, hecha píxel a píxel. Apunta a la derecha: peciolo marrón (lo que
   agarra Sprout), lámina ovada con la punta afilada, nervio central y nervios laterales que miran
   a la punta, borde aserrado, brillo en el haz (la cara de arriba) y el envés más pálido, con los
   nervios en relieve. Se puede doblar (la punta se queda atrás o latiguea) y ver de canto.
   P = [oscuro, medio, base, claro, brillo]; o = {len, half, stem, pad, bend, face: 0 haz · 1 envés · 2 canto, slope, dew, veins} */
function leafBladeArt(P,o){
  o=o||{}; const len=o.len||19, half=o.half||3.6, stem=o.stem??3, pad=o.pad??0, bend=o.bend||0, face=o.face||0, slope=o.slope||0;
  const W=len+2, H=2*Math.ceil(half)+3+2*pad, cy=o.cy??(H-1)/2, K=[...Array(H)].map(()=>Array(W).fill(null));
  const mix=(h,k)=>{ const a=hex2rgb(h); return '#'+a.map(v=>Math.round(v+(255-v)*k).toString(16).padStart(2,'0')).join(''); };
  const Q=face===1?P.map((c,i)=>mix(c,i<2?.3:.42)):P;                                   // el envés: más pálido, como plateado
  const put=(x,y,c)=>{ if(x>=0&&x<W&&y>=0&&y<H) K[y][x]=c; };
  for(let x=1;x<W-1;x++){ const t=(x-1-stem+.5)/(len-stem); // 0 en la base de la lámina → 1 en la punta
    const c=Math.round(cy+bend*Math.max(0,t)*Math.max(0,t)-slope*(x-1));
    if(t<0){ put(x,Math.round(c),x===1?'#5a3418':'#8a5028'); continue; }              // el peciolo
    let hw=half*Math.pow(Math.sin(Math.PI*Math.min(1,t*1.03+.03)),.7)*(1-.2*t);
    if(face===2) hw=Math.min(hw,.55);                                                     // de canto: casi una raya
    const tooth=face!==2&&o.serr!==false&&t>.14&&t<.9, nUp=tooth&&(x%3)===0?.95:0, nDn=tooth&&(x%3)===2?.95:0; // dientes del borde (los iconos pequeños, lisos)
    for(let y=0;y<H;y++){ const dy=y-c; if(dy<0?-dy>hw-nUp:dy>hw-nDn) continue; const d=hw>.6?dy/hw:0, ady=Math.abs(dy);
      let col;
      if(ady<.5) col=face===2?Q[3]:Q[4];                                                   // el nervio central
      else if(face!==2&&o.serr!==false&&ady<hw-.7&&((x-1-stem-ady*1.6)%4+4)%4<1) col=o.veins&&face===0?o.veins:(dy<0?Q[4]:Q[3]); // nervios laterales
      else if(dy<0) col=(face===0&&t>.2&&t<.52&&d>-.8&&d<-.3)?Q[4]:(d<-.78?Q[2]:Q[3]);   // el haz, con su brillo
      else col=d>.62?Q[1]:Q[2];
      put(x,y,col); }
    if(o.dew&&face===0&&(x===1+stem+4||x===1+stem+10)){ const yy=Math.round(c-(x===1+stem+4?1.4:-1.2)); put(x,yy,'#ffffff'); if(K[yy+1]&&K[yy+1][x]) put(x,yy+1,'#b8f4ff'); } // gotas de rocío
  }
  const cv2=mkCanvas(W,H), g=cv2.getContext('2d');
  for(let y=0;y<H;y++) for(let x=0;x<W;x++){ const v=K[y][x];
    if(v){ g.fillStyle=v; g.fillRect(x,y,1,1); continue; }
    if((x>0&&K[y][x-1])||(x<W-1&&K[y][x+1])||(y>0&&K[y-1][x])||(y<H-1&&K[y+1][x])){ g.fillStyle=PAL.k; g.fillRect(x,y,1,1); } }
  return cv2; }
/* la Hoja en combate, recta y de cara (el primer filo); 12b hace los tres filos, doblada y de canto */
const LEAF_SWING=leafBladeArt(['#1d5a22','#2e8a34','#78d838','#b8f070','#e8ffc8']);
const LEAF_SWING_L=flipH(LEAF_SWING);
/* ---------- iconos 8×8 ---------- */
const HEART_ROWS=[".kk.kk..","kLRkRRk.","kRRRRRk.","kRRRRDk.",".kRRDk..","..kDk...","...k....","........"];
const HEART_FULL=spr8(HEART_ROWS,{L:'#ffd8d0',R:'#f04850',D:'#b01c38'});
const HEART_EMPTY=spr8(HEART_ROWS,{L:'#b8966a',R:'#b8966a',D:'#a07c54'});
const HEART_HALF=(()=>{const c=mkCanvas(8,8),g=c.getContext('2d');g.drawImage(HEART_EMPTY,0,0);
  g.save();g.beginPath();g.rect(0,0,4,8);g.clip();g.drawImage(HEART_FULL,0,0);g.restore();return c;})();
const HEART_WHITE=spr8(HEART_ROWS,{L:'#ffffff',R:'#ffffff',D:'#ffe8e0'});
const ACORN_ROWS=["...kk...",".kkmmkk.","kAaAaAAk","kkkkkkkk",".kbwbbk.",".kbbbBk.","..kbBk..","...kk..."];
const ACORN=spr8(ACORN_ROWS,{m:'#5a3418',A:'#7a4a24',a:'#a86c38',b:'#d89a50',B:'#a86a30',w:'#fbe0a8'});
const ACORN_GOLD=spr8(ACORN_ROWS,{m:'#6a4210',A:'#b07818',a:'#e0a830',b:'#f8d030',B:'#c88a10',w:'#fffbd0'});
const BERRY_SPR=spr8(["...kLk..","..kkkk..",".kRRRRk.","kRwRRRDk","kRRRRRDk","kRRRRDDk",".kDDDDk.","..kkkk.."],{R:'#e8487c',D:'#a82858',w:'#ffd8e8',L:'#78d840'});
const CURSOR_SPR=spr8(["k.......","kkk.....","kLlkk...","kLllldk.","kllddk..","kddk....","kk......","........"],{L:'#e0ffa0',l:'#78d838',d:'#2e8038'});
const NEXT_SPR=sprN(["kkkkkkk","kYyyyOk",".kyyOk.","..kOk..","...k..."],{Y:'#fff6c0',y:'#f8c838',O:'#c08010'});
const DIARY_SPR=sprN(["kkkkkkk.","kRrvvvvk","kRvAAAvk","kRvvvvvk","kRvAAvvk","kRvvvvVk","kRkkkkkk","kkk....."],{R:'#a83838',r:'#d86060',v:'#f4e4c0',V:'#c8b088',A:'#8a6a48'});
const KEY_SPR=sprN(["..kkk...",".kYyyk..",".kykOk..","..kyk...","..kyk...","..kyyk..","..kyOk..","..kkk..."],{Y:'#fff8c0',y:'#f8c838',O:'#b07818'});
const BIGKEY_SPR=sprN([
"...kkkk.....",
"..kYyyyk....",
".kYkkkyOk...",
".kyk.RkOk...",
".kyOkkyOk...",
"..kyOOOkkkkk",
"...kyykYyyyk",
"....kyOkkyOk",
"....kyk.kyk.",
"....kkk.kkk.",
],{Y:'#fff8c0',y:'#f8c838',O:'#b07818',R:'#e84848'});
const PIECE_SPR=sprN([".kk.kk..","kLRkRRk.","kRRRRDk.",".kRRDk..","..kDk...","...k...."],{L:'#ffd8d0',R:'#f04850',D:'#b01c38'}); // cuarto de corazón
/* ============================================================
   OBJETOS DEL ZURRÓN (16×16)
   ============================================================ */
const BLADE_SPR=mkTile(g=>{ // la Hoja Ancestral plantada en la arena: la misma hoja de combate, de pie, con el peciolo hundido
  const L=leafBladeArt(['#1d5a22','#2e8a34','#78d838','#b8f070','#e8ffc8'],{len:14,half:3.9,stem:2}); g.imageSmoothingEnabled=false;
  g.save(); g.translate(8-Math.floor(L.height/2),15); g.rotate(-Math.PI/2); g.drawImage(L,0,0); g.restore(); // la punta arriba
  artPix(g,["....kkkkkkkk....","...ksSSkkSssk...","..kssSSSSSSSssk.","...kkkkkkkkkkk.."],{s:'#f4e2a8',S:'#d8bc80'},0,12);
  g.fillStyle='#8a5028'; g.fillRect(8,12,1,1); });
const BOMB_SPR=mkTile(g=>{ // la Bellota-bomba, con la mecha encendida
  blobArt(g,3,6,11,9,[{x:5.5,y:4,r:5.2,ry:4.8}],['#6a3a16','#a86430','#d89a50','#f0c070','#fff0c8'],{outline:false,grad:.2});
  blobArt(g,2,3,13,5,[{x:6.5,y:3,r:6.6,ry:3.2}],['#3a2210','#5a3418','#7a4a24','#a06a34','#c88a4c'],{outline:false,dither:0});
  for(let x=3;x<14;x+=2){ g.fillStyle='#3a2210'; g.fillRect(x,5,1,1); g.fillStyle='#b07c44'; g.fillRect(x+1,4,1,1); }
  g.fillStyle='#5a3418'; g.fillRect(8,1,1,3); g.fillRect(9,1,1,1);
  artOutline(g,16,16);
  artPix(g,[".Y.","YWY",".Y."],{Y:'#f8a030',W:'#fff8c0'},9,0);
});
const HOOK_SPR=spr([    // la Raíz-gancho
"................",
"....kkkkk.......",
"...kaAAAak......",
"..kak...kAk.....",
"..kAk...kAk.....",
"..kkk...kak.....",
"........kAk.....",
".......kAak.....",
"..kkk.kAak......",
".kgGgkkaAk......",
".kGgGkaAk.......",
"..kkkaAk........",
"....kaAk........",
"...kaAk.........",
"...kkk..........",
"................",
],{a:'#d8a060',A:'#8a5028',g:'#b0f070',G:'#3aa840'});
const BOOMER_SPR=spr([  // la Vaina voladora (bumerán de vaina de semilla)
"................",
"..kkk...........",
".kLlmk..........",
".kLlmk..........",
".klmak..........",
".kmaak..........",
".kdaaak.........",
".kdaaaakkkkkk...",
".kdaaaaaaaaaAk..",
"..kdaaaaaaaAAk..",
"...kkdddddAAk...",
".....kkkkkkk....",
"................",
"................",
"................",
"................",
],{L:'#d8ffa0',l:'#78d838',m:'#3aa840',d:'#8a5a28',a:'#e8b060',A:'#a86a30'});
const LANTERN_SPR=spr([ // el Farol de brasa
"................",
"......kkkk......",
".....kGk.kk.....",
".....kkkkkk.....",
"....kGGgggGk....",
"....kkkkkkkk....",
"....kgkYYkgk....",
"....kGkYWkdk....",
"....kGkoYkdk....",
"....kGkOokdk....",
"....kkkkkkkk....",
"....kGgggGdk....",
".....kkkkkk.....",
"................",
"................",
"................",
],{G:'#f8d848',g:'#c89020',d:'#7a4a10',Y:'#f8e060',W:'#ffffff',o:'#f8a030',O:'#e05820'});
const FEATHER_SPR=mkTile(g=>{ // el Vilano de Petra (diente de león)
  blobArt(g,3,0,11,9,[{x:5.5,y:4.5,r:5.2,ry:4.5}],['#98a8b8','#c8d0d8','#e8ecf0','#f8f8f8','#ffffff'],{outline:false,dither:.6});
  g.fillStyle='#a8b4c0'; for(const [x,y] of [[5,2],[11,3],[4,6],[9,7],[12,6],[7,1]]) g.fillRect(x,y,1,1);
  g.fillStyle='#2e8a38'; for(let i=0;i<5;i++) g.fillRect(8-(i>>1),9+i,1,1); g.fillStyle='#70d838'; g.fillRect(9,9,1,1);
  artOutline(g,16,16);
});
const EMBER_SPR=mkTile(g=>{ // la Brasa de Primavera
  artPix(g,[".......o........","......oo..o.....",".....oYo.oo.....",".....oYooYo.....","....oYYYYYYo....","....oYWWWYYo....","...oYYWWYYYYo..."],{o:'#e05820',Y:'#f8a030',W:'#f8e060'},0,0);
  blobArt(g,4,5,8,7,[{x:4,y:3.6,r:3.8,ry:3.4}],['#a02810','#e05820','#f8a030','#f8e060','#ffffff'],{outline:false,grad:.1,dither:.5});
  artOutline(g,16,16); g.fillStyle='#ffffff'; g.fillRect(6,7,1,1);
});
const TEAR_SPR=mkTile(g=>{ // la Lágrima de Verano
  blobArt(g,4,4,8,8,[{x:4,y:4.6,r:3.8,ry:3.6},{x:4,y:2,r:1.6,ry:2.6}],['#184c90','#2878c8','#58b0e8','#a8e0f8','#ffffff'],{outline:false,dither:.5});
  g.fillStyle='#2878c8'; g.fillRect(8,2,1,2); g.fillStyle='#58b0e8'; g.fillRect(8,4,1,1);
  artOutline(g,16,16); g.fillStyle='#ffffff'; g.fillRect(6,7,1,2); g.fillRect(7,6,1,1);
});
const FLAKE_SPR=spr([   // el Copo Eterno
"................",
"......k.k.......",
".....kLkLk......",
"..k...kLk...k...",
".kLk.kkNkk.kLk..",
"..kLkNLNNNkLk...",
"...kNLnnnNNk....",
".kkkLNnWnNNkkk..",
"kLNNNNnnnNNNNNk.",
".kkkNNnnnNMkkk..",
"...kNNNnNMMk....",
"..kLkNNMNMkMk...",
".kLk.kkMkk.kMk..",
"..k...kMk...k...",
".....kLkMk......",
"......k.k.......",
],{L:'#ffffff',N:'#c8e8ff',n:'#88c8f0',W:'#ffffff',M:'#6a98c8'});
const SHIELD_SPR=mkTile(g=>{ // el Escudo de corteza, con su hoja
  blobArt(g,2,1,12,12,[{x:6,y:4.2,r:6,ry:4.6},{x:6,y:7.5,r:4.2,ry:4.3}],['#3e2210','#6a4020','#9a6634','#c08c50','#e0b878'],{outline:false,grad:.25});
  g.fillStyle='#4e2e14'; g.fillRect(4,5,1,5); g.fillRect(11,4,1,4); g.fillRect(7,10,1,2);
  artPix(g,["..L..",".Llm.","Llmmd",".lmd.","..d.."],{L:'#d8ffa0',l:'#78d838',m:'#3aa840',d:'#1e6a2a'},6,3);
  artOutline(g,16,16);
  g.fillStyle='#f0d090'; g.fillRect(4,2,3,1); g.fillRect(3,3,1,2);
});
/* ---------- AMULETOS (12×12: medallón de oro en las 10 filas de arriba) ---------- */
function amuletArt(gem,emblem,emap){ return mkTile(g=>{
  blobArt(g,1,1,10,10,[{x:5,y:5,r:4.8}],GOLD5,{outline:false,dither:.4});
  blobArt(g,3,3,6,6,[{x:3,y:3,r:3}],gem,{outline:false,dither:.5,grad:.2});
  g.fillStyle=gem[4]; g.fillRect(4,4,1,1);
  if(emblem) artPix(g,emblem,emap,3,3);
  artOutline(g,12,12);
  g.fillStyle=PAL.k; g.fillRect(5,0,2,1); g.fillStyle=GOLD5[3]; g.fillRect(5,1,1,1);
},12,12); }
const AMULET_SPR={
  raiz:amuletArt(['#1e4a1a','#2e7030','#58a040','#90d060','#d8ffa0'],["......","..A...",".AAA..","A.A.A.","..A..."],{A:'#6a3a18'}),
  savia:amuletArt(['#6a0c20','#a01c38','#e04858','#f890a0','#ffe0e8'],["......",".R.R..","RRRRR.",".RRR..","..R..."],{R:'#fff0f0'}),
  musgo:amuletArt(['#143a1a','#246a2a','#3a9a38','#70c850','#c0f090'],["......","..l...",".lLl..","..l...","......"],{l:'#1e5a22',L:'#ffffff'}),
  erizo:amuletArt(['#2a1244','#4c2478','#7c44b0','#b080e0','#f0d8ff'],["k.k.k.",".kkk..","kkWkk.",".kkk..","......"],{W:'#ffffff'}),
  viento:amuletArt(['#1a4a7a','#2878b8','#58c8e8','#a8e8f8','#ffffff'],["......",".WWW..","W...W.","..WW..","......"],{W:'#ffffff'}),
  buho:amuletArt(['#5a3410','#8a5a20','#c89040','#e8c070','#fff0c0'],["......","WW.WW.","kW.kW.","..y...","......"],{W:'#ffffff',y:'#f8a030'}),
  rana:amuletArt(['#1a4a1a','#2e7a2a','#58b048','#90e068','#e0ffc0'],["W...W.","k...k.","......","kkkkk.","......"],{W:'#ffffff'}),
  topo:amuletArt(['#3a2412','#5a3a22','#84583a','#a87c54','#e8c8a0'],[".y.y..",".yyy..","......",".pp...","......"],{y:'#f8d848',p:'#f0a0b8'}),
  susurro:amuletArt(['#406080','#80a8d0','#c0dcf0','#e8f4ff','#ffffff'],["......","..W...",".W.W..","W...W.","......"],{W:'#3a6a9a'}),
};

/* ============================================================
   LOS VECINOS DEL VALLE
   ============================================================ */
/* piel y rasgos comunes de los vecinos (mismo lenguaje que Sprout) */
const NPC_PAL={h:'#ffe8c4',s:'#f8cc90',S:'#d8985c',T:'#a86838',q:'#ffffff',c:'#f8988a',m:'#8a3a28',f:'#6a3818'};
const npcSpr=(rows,extra)=>spr(rows,Object.assign({},NPC_PAL,extra));
const ELDER=npcSpr([   // RAÍZ, la voz del Roble: corona de hojas, barba de musgo, bastón vivo
"....kk.kk....kk.",
"...kLlkLlk..kLlk",
"..kkdlkldkk.kldk",
".kWWhssssWWk.kAk",
".khkksssskkSkkAk",
".kscssTTsscSk.kA",
".kWWWsmmsWWWk.kA",
"..kWVWWWWWVk.kAk",
"..kRWVWWWVRk.kAk",
"..kRrrVVrrok.sAk",
"..kRrrrrrrok.kAk",
"..kRrorrrrok.kAk",
"..kRrrrrrrok.kAk",
"...kRrrrrok..kAk",
"...kffkkffk..kAk",
"....kk..kk...kkk",
],{W:'#f4f8e8',V:'#b8c8a0',R:'#c08a50',r:'#8a5a30',o:'#5a3418',A:'#8a5028',L:'#b0f068',l:'#70d838',d:'#2e8a38'});
const PETRA_SPR=npcSpr([ // Petra, la niña del diente de león
".....k.kk.k.....",
"....kwkwwkwk....",
"...kwwwwwwWwk...",
"....kwWwwWwk....",
"......kddk......",
"....kkkkkkkk....",
"...kHIHHHHHHk...",
"..kHIsssssHHHk..",
"..kHkqsssskqHk..",
"..kskksssskkSk..",
"..kscsssmsscSk..",
"...kSSssssSSk...",
"...kzZzzzzzZk...",
"..kszzzzzzzzsk..",
"...kZzzzzzzZk...",
"....kfk..kfk....",
],{w:'#fffff0',W:'#d8d8c0',d:'#58a848',H:'#c07030',I:'#e8a050',z:'#e04880',Z:'#f890b8'});
const LUPA_SPR=npcSpr([ // Lupa, la jardinera: pamela de paja con flor
"......kkkk......",
"....kkyYYykRk...",
"...kyyyYyykRrk..",
".kkyyyyyyyyykkk.",
"kyyyyyyyyyyyyyyk",
".kkuuuuuuuuuukk.",
"..khkqsssskqSk..",
"..kskksssskkSk..",
"..kscssmmsscSk..",
"...kSSssssSSk...",
"...kOoOOOOoOk...",
"..ksOooooooOsk..",
"...kOooooooOk...",
"...kOoOOOOoOk...",
"....kffk.kffk...",
"....kkk...kkk...",
],{y:'#e8c860',Y:'#fff0a0',u:'#a88838',R:'#f04868',r:'#ffa0b8',O:'#2e68c0',o:'#58a0e8'});
const MOSS_SPR=npcSpr([ // Moss, el pescador: gorra de musgo y caña al hombro
"..............w.",
"....kkkkkkk..kA.",
"...kGgGGGGGk.kA.",
"..kGgGGGGGGGkkA.",
"..kkkkkkkkkkkkkk",
"..khssssssSSk.A.",
"..khkqsssskqSkA.",
"..kskksssskkSkA.",
"..kscssmmsscSkA.",
"...kSSssssSSk.A.",
"...kTtttttTTksA.",
"..ksTttttttTkkA.",
"...kTtttttTTk.A.",
"...kTtTTTTtTk...",
"....kffk.kffk...",
".....kk...kk....",
],{T:'#4a4030',t:'#6e5c3c',G:'#3a6a2a',g:'#6aa048',w:'#d8e8f0',A:'#8a5028'});
const TILO_SPR=npcSpr([ // Tilo, el tendero: hoja de tilo en la frente y delantal
"......kkk.......",
".....kLllk......",
"....kLllldk.....",
".....kkdkk......",
"....kkkkkkkk....",
"...khhssssssk...",
"..khsssssssssk..",
"..khkqsssskqSk..",
"..kskksssskkSk..",
"..kscsmmmmscSk..",
"...kSSssssSSk...",
"...kbwwwwwwbk...",
"..kswwwwwwwwsk..",
"...kbwWWWWwbk...",
"....kffk.kffk...",
"....kkk...kkk...",
],{b:'#e8b050',w:'#f8f0dc',W:'#d8c8a8',L:'#b0f068',l:'#58b048',d:'#2e7830'});
const CORTEZA_SPR=npcSpr([ // Corteza, la abuela ermitaña del bosque (vende amuletos)
"......kkkk......",
".....kNnNNk.....",
"....kkkkkkkk....",
"...kNNnNNNNNk...",
"..kNnNNNNNNNNk..",
"..kNkhssssskNk..",
"..kNskksskksNk..",
"..kNcsssssscNk..",
"..kNSssmmssSNk..",
"...kSSSSSSSSk...",
"...kPpPPPPpPk...",
"..ksPpppppppPk..",
"..kPPpppyppPPk..",
"...kPPPPPPPPk...",
"....kffk.kffk...",
".....kk...kk....",
],{N:'#e8e8f0',n:'#ffffff',P:'#5c3080',p:'#8858b0',y:'#f8d030'});
const NPCS={
  h:{name:'Petra', img:PETRA_SPR}, j:{name:'Lupa', img:LUPA_SPR},
  y:{name:'Moss', img:MOSS_SPR},  g:{name:'Tilo', img:TILO_SPR}, 'ö':{name:'Corteza', img:CORTEZA_SPR},
};
/* ============================================================
   CRIATURAS (16×16, dos fotogramas cuando se mueven)
   ============================================================ */
/* criaturas con volumen: cuerpo por lóbulos (blobArt, luz arriba-izquierda)
   y rasgos a mano encima ('.' = transparente) */
function creature(lobes,pal,rows,extra,o){ const c=mkCanvas(16,16), g=c.getContext('2d');
  if(lobes) blobArt(g,0,0,16,16,lobes,pal,o||{grad:.5});
  if(rows) g.drawImage(sprN(rows,extra),0,0); return c; }
const BLOB_PAL=['#1a4a22','#2a7a30','#48a840','#7ad058','#b8f090'];
const BLOB_FX={L:'#b0f068',l:'#70d838',d:'#2e8a38',e:'#f0ffe0',q:'#ffffff',m:'#7a1a28'};
const BLOB_A=creature([{x:8,y:8,r:3.2},{x:8,y:10.4,r:6.6,ry:4.8}],BLOB_PAL,[ // el Brotón: gelatina verde con un brote encima
"................",
"................",
"......kk........",
".....kLlk.kk....",
".....klldkLlk...",
"......kkdkdk....",
"........d.......",
"....ee..........",
"...e............",
".....kq..kq.....",
".....kk..kk.....",
".......mm.......",
"................",
"................",
"................",
"................",
],BLOB_FX);
const BLOB_B=creature([{x:8,y:11.6,r:7.3,ry:3.7}],BLOB_PAL,[ // aplastado
"................",
"................",
"................",
"................",
".....kk.........",
"....kLlk.kk.....",
"....klldkLlk....",
".....kkdkdk.....",
"...ee...d.......",
"..e.............",
"....kq....kq....",
"....kk....kk....",
".......mm.......",
"................",
"................",
"................",
],BLOB_FX);
const BAT_PAL={P:'#3e1e5a',p:'#6a3a98',v:'#9a62d0',V:'#c8a0f0',y:'#ffe040',q:'#ffffff'};
const BAT_A=spr([
"................",
".k............k.",
".kk..........kk.",
".kVk..k..k..kVk.",
".kvVkkVkkVkkVvk.",
".kpvvkvVVvkvvpk.",
".kppvkyvvykvppk.",
".kPpvkvqqvkvpPk.",
".kPkPkvvvvkPkPk.",
".kk.kkpvvpkk.kk.",
"......kppk......",
".......kk.......",
"................",
"................",
"................",
"................",
],BAT_PAL);
const BAT_B=spr([
"................",
"................",
"................",
"................",
"................",
".....kVkkVk.....",
".kk..kvVVvk..kk.",
"kVvkkkyvvykkkvVk",
"kpvvvkvqqvkvvvpk",
"kPpppkvvvvkpppPk",
".kPkPkkppkkPkPk.",
"..k.k..kk..k.k..",
"................",
"................",
"................",
"................",
],BAT_PAL);
const SHELL_PAL=['#10281c','#1c5034','#2e7a48','#4aa864','#a0e8b0'];
const BEETLE_FX={t:'#d0c8b8',T:'#6a6458',q:'#ffffff',D:'#10281c',e:'#e0fff0',n:'#3a3028'};
const BEETLE=creature([{x:6.5,y:8.2,r:5.8,ry:5.2}],SHELL_PAL,[ // escarabajo acorazado (mira a la derecha; el morro blinda)
"................",
"................",
"................",
"....ee.....kkk..",
"...e......ktttk.",
"..........kttTTk",
"......D...kqkTTk",
"..DDDDDDDDkTTTTk",
"......D...kTTTTk",
"..........ktTTk.",
"...........kkk..",
"................",
"..k..k..k.......",
".kn.kn.kn.......",
".k..k..k........",
"................",
],BEETLE_FX);
const BEETLE_B=creature([{x:6.5,y:8.2,r:5.8,ry:5.2}],SHELL_PAL,[
"................",
"................",
"................",
"....ee.....kkk..",
"...e......ktttk.",
"..........kttTTk",
"......D...kqkTTk",
"..DDDDDDDDkTTTTk",
"......D...kTTTTk",
"..........ktTTk.",
"...........kkk..",
"................",
"...k..k..k......",
"...nk.nk.nk.....",
"....k..k..k.....",
"................",
],BEETLE_FX);
const ROLL_PAL=['#2a1a40','#4a2e6a','#7048a0','#9a70c8','#d0b0f0'];
const ROLL_FX={S:'#f4e8ff',q:'#ffffff',w:'#ffe0e8',n:'#2a1a40'};
const ROLLER=creature([{x:8,y:9.6,r:6,ry:5.2}],ROLL_PAL,[ // rodapúas en reposo
"................",
"...S...S...S....",
"...k..kk..kk..S.",
"S..kk.k...k.kk..",
".kk..........k..",
"....ee..........",
"...e............",
".......kk.......",
"...nnk....knn...",
"....kq....kq....",
"....kk....kk....",
".......ww.......",
"................",
"................",
"...kk......kk...",
"................",
],ROLL_FX);
const ROLLER_BALL=creature([{x:8,y:8,r:6.2}],ROLL_PAL,[
"........S.......",
"...S....k...S...",
"....k.......k...",
"................",
"....ee...n......",
"...e....n.......",
"..........n.....",
"Sk....nn...n..kS",
"....n.......n...",
".....n...nnn....",
"......nnn.......",
"................",
"....k.......k...",
"...S....k...S...",
"........S.......",
"................",
],ROLL_FX,{grad:.3});
const GHOST=spr([
"................",
"......kkkkk.....",
"....kkwwwwwkk...",
"...kwwWwwwwwlk..",
"..kwWWwwwwwwwlk.",
"..kwwnnwwwnnwlk.",
"..kwwnnwwwnnwlk.",
"..kwwwwwwwwwwlk.",
"..kwwwwnnnwwwlk.",
"..kwwwwnnnwwllk.",
"..klwwwwwwwwllk.",
"..kllwwwwwlllLk.",
"..kLllllllllLLk.",
"..kLLkLLLLkLLk..",
"...kk.kkkk.kk...",
"................",
],{w:'#e8f4ff',W:'#ffffff',l:'#a8c4e8',L:'#6a88c0',n:'#1a2048'});
const FROG_FX={g:'#58b048',G:'#2e7830',h:'#8ad860',H:'#c0f090',y:'#f0f0b0',Y:'#c8c880',q:'#ffffff'};
const FROG=spr([
"................",
"................",
"................",
"...kkk....kkk...",
"..kqqqk..kqqqk..",
"..kqkqk..kqkqk..",
"..khhhkkkkhhhk..",
".khHhgggggghhhk.",
".kgggggggggggGk.",
".kgGgkkkkkkgGgk.",
".kggyyyyyyyyggk.",
"kgGgyyyyyyyygGgk",
"kGggGyYYYYyGggGk",
".kkGgkkkkkkgGkk.",
"kGGGk......kGGGk",
".kkk........kkk.",
],FROG_FX);
const FROG_JUMP=spr([
"...kkk....kkk...",
"..kqqqk..kqqqk..",
"..kqkqk..kqkqk..",
"..khhhkkkkhhhk..",
".khHhgggggghhhk.",
".kgggggggggggGk.",
".kgGgkkkkkkgGgk.",
".kggyyyyyyyyggk.",
"kgGgyyyyyyyygGgk",
"kGggGyYYYYyGggGk",
".kkGgkkkkkkgGkk.",
".kGk........kGk.",
".kGk........kGk.",
"kGGk........kGGk",
"kkkk........kkkk",
"................",
],FROG_FX);
const THORN_PAL=['#12401a','#1e6a28','#2e8a34','#58b048','#9ae070'];
const THORN_FX={T:'#f8ecc0',R:'#c83040',r:'#f07080',q:'#ffffff',n:'#12401a',y:'#ffe040'};
const THORN=creature([{x:8,y:9,r:5.6}],THORN_PAL,[
"........T.......",
"...T....k...T...",
"....k.......k...",
"................",
".....e..........",
"....e...........",
"Tk..nn....nn..kT",
"....ky....yk....",
"................",
".....RRRRRR.....",
"................",
"................",
"....k.......k...",
"...T....k...T...",
"........T.......",
"................",
],THORN_FX);
const THORN_OPEN=creature([{x:8,y:9,r:6.2}],THORN_PAL,[
"........T.......",
"..T.....k....T..",
"...k........k...",
"................",
".....e..........",
"....nn....nn....",
"Tk..ky....yk..kT",
"....kkkkkkkk....",
"....RqkqqkqR....",
"....RkkkkkkR....",
"....RrkkkkrR....",
"....RqkqqkqR....",
"...k.kkkkkk.k...",
"..T.....k....T..",
"........T.......",
"................",
],THORN_FX);
const SQUIRREL=spr([
"................",
"..........kkkk..",
".........kTttTk.",
"..k.k...kTtttttk",
".kBkBk..ktTkkttk",
".kBbbbk.ktk..kTk",
"kbkqbbbk.k..ktTk",
"kbkkbbnk...kttk.",
"kkbbbnk...kttk..",
".kvvbbbk.kttk...",
".kvvbbbbkttTk...",
".kvvbbbbbtTk....",
"..kvbbbbnnk.....",
"..knbkknbk......",
"..kk..kk........",
"................",
],{b:'#c07838',B:'#e8a868',n:'#8a4a20',v:'#f8e0b8',t:'#d89048',T:'#9a5a28',q:'#ffffff'});
const ICICLE_SPR=spr([
"....kkkkkkk.....",
"....keeNNMk.....",
".....keNNMk.....",
".....kenNMk.....",
"......keNMk.....",
"......knNMk.....",
".......keMk.....",
".......knMk.....",
"........kMk.....",
"........kek.....",
".........k......",
"................",
"................",
"................",
"................",
"................",
],{e:'#ffffff',n:'#e8f4ff',N:'#a8d0f0',M:'#6a90c0'});
const SETON_FX={R:'#e84040',r:'#a82030',H:'#ff9080',w:'#fff8e8',s:'#f8e8c8',S:'#d8c098',q:'#ffffff',m:'#8a3a28',c:'#f8a090'};
const SETON=spr([ // Setón: seta escupe-esporas
"................",
"......kkkk......",
"....kkHHRRkk....",
"...kHHwwRRRRk...",
"..kHwwwRRRwwRk..",
"..kRwwRRRRwwRk..",
".kRRRRRRwwRRRrk.",
".krRRwwRRRRRrrk.",
".kkrrrrrrrrrrkk.",
"...kssssssssk...",
"...kskqsskqSk...",
"...kskksskkSk...",
"...kscsmmscSk...",
"...kSsssssSSk...",
"....kkkkkkkk....",
"................",
],SETON_FX);
const SETON_B=spr([ // hinchado: va a soltar esporas
".....kkkkkk.....",
"...kkHHRRRRkk...",
"..kHHwwRRRRwwk..",
".kHwwwwRRRwwwRk.",
".kRwwwRRRRRwwRk.",
"kRRRRRRwwwRRRRrk",
"kRRwwRRwwwRRRrrk",
"krrRwwRRRRRRrrrk",
"kkrrrrrrrrrrrrkk",
"..kssssssssssk..",
"..kskkssssskkSk.",
"..kccssssssccSk.",
"..kssssmmsssSSk.",
"..kSssssssssSSk.",
"...kkkkkkkkkkk..",
"................",
],SETON_FX);
const CRAB_FX={o:'#f07040',O:'#b83820',H:'#ffb080',q:'#ffffff',y:'#f8d0a0'};
const CRAB=spr([ // cangrejo de playa
"................",
".kk.k......k.kk.",
"kHHkHk....kHkHHk",
"kHOOOkk..kkOOOHk",
".kOOkkqkkqkkOOk.",
"..kOk.k..k.kOk..",
"..kOk.O..O.kOk..",
"...kkkkkkkkkkk..",
"..kHHoooooooOOk.",
".kHoooooooooooOk",
".koooyoooyooooOk",
".kOoooooooooOOOk",
"..kOOOOOOOOOOOk.",
".k.kk.k..k.kk.k.",
"k.k..k....k..k.k",
"................",
],CRAB_FX);
const CRAB_B=spr([
"................",
"kk..k......k..kk",
"kHk.Hk....kH.kHk",
"kHOkOkk..kkOkOHk",
".kOOkkqkkqkkOOk.",
"..kOk.k..k.kOk..",
"..kOk.O..O.kOk..",
"...kkkkkkkkkkk..",
"..kHHoooooooOOk.",
".kHoooooooooooOk",
".koooyoooyooooOk",
".kOoooooooooOOOk",
"..kOOOOOOOOOOOk.",
"..k.kk.k..k.kk.k",
".k.k..k....k..k.",
"................",
],CRAB_FX);
const WISP_FX={y:'#fff4b0',Y:'#ffffff',o:'#f8b030',O:'#e86818',r:'#a82810'};
const WISP=spr([ // fuego fatuo de la mina
"........k.......",
".......kok......",
"......kook..k...",
"......koyok.ko..",
".....koyyyokok..",
"....kOoyYyyoOk..",
"...kOoyyyyyyoOk.",
"...kOokkyykkoOk.",
"...kOoyyyyyyoOk.",
"...kOoyykkyyoOk.",
"....kOooyyooOk..",
".....krOOOOrk...",
"......krrrrk....",
".......kkkk.....",
"................",
"................",
],WISP_FX);
const WISP_B=spr([
"................",
"....k...........",
"...kok....k.....",
"...koo...kok....",
"....kok.kook....",
"....kOokyyok....",
"...kOoyYyyyoOk..",
"...kOokkyykkoOk.",
"...kOoyyyyyyoOk.",
"...kOoyykkyyoOk.",
"...kOooyyyyooOk.",
"....kOooyyooOk..",
".....krOOOOrk...",
"......kkrrkk....",
"........kk......",
"................",
],WISP_FX);
const BEE_FX={y:'#f8d030',Y:'#fff0a0',O:'#c08010',w:'#e8f4ff',W:'#a8c8e8',q:'#ffffff',s:'#3a3020'};
const BEE=spr([ // abeja obrera del panal
"................",
"..kkk.....kkk...",
".kwwWk...kWwwk..",
".kwwwWk.kWwwwk..",
"..kwwwkkkwwwk...",
"...kkkYyykkk....",
"....kYyyyyyk....",
"...kykqyykqyk...",
"...kykkyykkyk...",
"...kkkkkkkkkk...",
"...kyyyyyyyOk...",
"...kkkkkkkkkk...",
"....kyyyyyOk....",
".....kkkkkk.....",
".......kk.......",
"........k.......",
],BEE_FX);
const BEE_B=spr([
"................",
"................",
"................",
"kkk..........kkk",
"kwwWkk....kkWwwk",
".kwwwWkkkkWwwwk.",
"...kkkYyykkk....",
"....kYyyyyyk....",
"...kykqyykqyk...",
"...kykkyykkyk...",
"...kkkkkkkkkk...",
"...kyyyyyyyOk...",
"...kkkkkkkkkk...",
"....kyyyyyOk....",
".....kkkkkk.....",
".......kk.......",
],BEE_FX);
const GOLEMITO=spr([ // golemito de hielo del templo
"................",
"....kkkkkkkk....",
"...kwwWWwwwNk...",
"...kwWwwwwNNk...",
"...kwkkwwkkNk...",
"...kwkcwwkcNk...",
"...kNwwwwwwMk...",
".kkkkkkkkkkkkkk.",
"kwWkwwWwwwwNkNMk",
"kWwkwwwwwwNNkNMk",
"kwNkwwwwwNNMkMMk",
".kkkNNNNNNMMkkk.",
"....kNNkkNMk....",
"...kwNNk.kNMk...",
"...kkkkk.kkkk...",
"................",
],{w:'#d8ecff',W:'#ffffff',N:'#8ab0d8',M:'#5a78a8',c:'#58e8d8'});
const SNAIL_PAL=['#5a2e10','#8a4a1c','#b87030','#e0a050','#f8d890'];
const SNAIL_FX={g:'#88c870',G:'#4a8a40',h:'#c0f0a0',q:'#ffffff',n:'#5a2e10'};
const SNAIL=creature([{x:9,y:8.5,r:5.2}],SNAIL_PAL,[ // caracol de las marismas (fuera de la concha)
"................",
"..k..k..........",
"..q..q..........",
"..k..k..........",
"..kk.k..ee......",
".kGhk..e........",
"kqkhk...nnnn....",
"kkhhk..n....n...",
"khhgk..n..n.n...",
"khggk..n...nn...",
"kgggkk.........k",
"kgggggkk......kk",
"kGggggggkkkkkkgk",
".kGGgggggggggGk.",
"..kkkkkkkkkkkk..",
"................",
],SNAIL_FX);
const SNAIL_IN=creature([{x:8,y:9,r:5.6}],SNAIL_PAL,[ // metido en la concha: invulnerable
"................",
"................",
"................",
"................",
"......ee........",
".....e..........",
"......nnnn......",
".....n....n.....",
".....n..n.n.....",
".....n...nn.....",
"................",
"................",
"................",
"..kkk.......kkk.",
"..kGgkkkkkkkgGk.",
"...kkkkkkkkkkk..",
],SNAIL_FX);
function recolor(c,map){ // recolorea por sustitución exacta de colores
  const n=mkCanvas(c.width,c.height),g=n.getContext('2d');g.drawImage(c,0,0);
  const id=g.getImageData(0,0,n.width,n.height),d=id.data;
  const M=Object.entries(map).map(([a,b])=>[hex2rgb(a),hex2rgb(b)]);
  for(let i=0;i<d.length;i+=4){ if(!d[i+3])continue;
    for(const [A,B] of M){ if(d[i]===A[0]&&d[i+1]===A[1]&&d[i+2]===A[2]){ d[i]=B[0];d[i+1]=B[1];d[i+2]=B[2]; break; } } }
  g.putImageData(id,0,0); return n;
}
const BLOB_ICE=[BLOB_A,BLOB_B].map(c=>recolor(c,{'#1a4a22':'#1a3a5a','#2a7a30':'#2a6890','#48a840':'#4898c8','#7ad058':'#80c8e8','#b8f090':'#c8f0ff'}));
const BAT_RED=[BAT_A,BAT_B].map(c=>recolor(c,{'#3e1e5a':'#4a0e10','#6a3a98':'#902428','#9a62d0':'#d04848','#c8a0f0':'#f8a0a0'}));
const E_SPR={ // tipo → fotogramas y variantes
  blob:{a:BLOB_A,b:BLOB_B,fast:BLOB_ICE},
  bat:{a:BAT_A,b:BAT_B,fast:BAT_RED},
  beetle:{a:BEETLE,b:BEETLE_B},
  roller:{a:ROLLER,ball:ROLLER_BALL},
  ghost:{a:GHOST},
  frog:{a:FROG,jump:FROG_JUMP},
  thorn:{a:THORN,open:THORN_OPEN},
  squirrel:{a:SQUIRREL},
  icicle:{a:ICICLE_SPR},
  seton:{a:SETON,b:SETON_B},
  crab:{a:CRAB,b:CRAB_B},
  wisp:{a:WISP,b:WISP_B},
  bee:{a:BEE,b:BEE_B},
  golem:{a:GOLEMITO},
  snail:{a:SNAIL,shell:SNAIL_IN},
};
for(const k in E_SPR){ const S=E_SPR[k]; S.w={}; for(const f in S){ if(f==='w')continue; if(Array.isArray(S[f])) S.w[f]=S[f].map(whiten); else S.w[f]=whiten(S[f]); } }
const SPORE_SPR=sprN(["..kk..",".kqRk.","kqRRrk","kRRrrk",".krrk.","..kk.."],{R:'#f06060',r:'#a82838'});
const ROCK_PROJ=sprN([".kkkk.","kttTTk","ktTTnk","kTTnnk",".kkkk."],{n:'#4a443a'});
/* ============================================================
   MINIJEFES (24×24)
   ============================================================ */
const KING_BEETLE=mkTile(g=>{ // El Escarabajo Rey — mira a la derecha; morro de hierro delante, caparazón verde metálico
  g.fillStyle=PAL.k; for(const [x,y] of [[5,17],[10,18],[15,17]]){ g.fillRect(x,y,1,3); g.fillRect(x-1,y+3,2,1); g.fillRect(x+2,y+1,1,2); }
  artPix(g,["k..","kk.",".kk"],null,4,18); artPix(g,["k..","kk.",".kk"],null,9,19); artPix(g,["k..","kk.",".kk"],null,14,18);
  blobArt(g,1,5,19,14,[{x:9.5,y:7,r:9.2,ry:6.8}],['#0c2a16','#1a5028','#2e8038','#58b04a','#b8f080'],{outline:false,grad:.5});
  g.fillStyle='#0c2a16'; g.fillRect(10,6,1,12); g.fillStyle='#58b04a'; g.fillRect(9,7,1,4);         // costura del élitro
  g.fillStyle='#b8f080'; g.fillRect(5,8,3,1); g.fillRect(4,9,1,2); g.fillRect(13,8,2,1);
  g.fillStyle='#1a5028'; for(const [x,y] of [[5,13],[7,15],[13,12],[14,15],[3,12]]) g.fillRect(x,y,2,1);                 // motas del élitro
  blobArt(g,15,8,8,9,[{x:3.5,y:4.5,r:3.8,ry:4.2}],['#1a1420','#2e2838','#4a4258','#6a627a','#9a92aa'],{outline:false});
  blobArt(g,17,7,7,8,[{x:4.2,y:4,r:3.2,ry:3.6}],IRON5,{outline:false,dither:.3});            // morro blindado
  g.fillStyle='#26262e'; g.fillRect(21,9,1,4); g.fillStyle='#ffffff'; g.fillRect(19,8,1,1);
  artPix(g,["y.y.y","yyyyy"],{y:'#f8d848'},14,5); g.fillStyle='#e84848'; g.fillRect(16,6,1,1);  // coronita
  artOutline(g,24,24);
  g.fillStyle='#ffffff'; g.fillRect(17,11,1,1); g.fillStyle='#e84848'; g.fillRect(17,12,1,1);   // ojo
},24,24);
const DRONE=mkTile(g=>{ // El Zángano Capitán — avispa grande con casco
  blobArt(g,0,0,11,10,[{x:5.5,y:5,r:5,ry:4.2}],['#8aa8c0','#b8d0e0','#d8e8f4','#f0f8ff','#ffffff'],{outline:false,dither:.5});
  blobArt(g,13,0,11,10,[{x:5.5,y:5,r:5,ry:4.2}],['#8aa8c0','#b8d0e0','#d8e8f4','#f0f8ff','#ffffff'],{outline:false,dither:.5});
  g.fillStyle='#8aa8c0'; g.fillRect(3,4,5,1); g.fillRect(16,4,5,1);
  blobArt(g,6,11,12,11,[{x:6,y:5.5,r:5.2,ry:5.4}],['#6a4a08','#b88810','#f0c020','#f8e060','#fff8c0'],{outline:false,grad:.3});
  artClip(g,[[6,13,12,2],[6,17,12,2]],()=>blobArt(g,6,11,12,11,[{x:6,y:5.5,r:5.2,ry:5.4}],['#0c0a0a','#1a1410','#2a2218','#3a3020','#4a4030'],{outline:false}));
  g.fillStyle='#1a1410'; g.fillRect(11,22,2,1); g.fillRect(12,23,1,1);
  blobArt(g,7,4,10,9,[{x:5,y:4.5,r:4.8,ry:4.2}],IRON5,{outline:false,dither:.4});        // casco
  g.fillStyle='#1a1420'; g.fillRect(8,8,8,2); g.fillStyle='#e84848'; g.fillRect(9,8,2,1); g.fillRect(13,8,2,1); // visera y ojos
  g.fillStyle='#f8d848'; g.fillRect(11,3,2,2);
  artOutline(g,24,24);
  g.fillStyle='#ffb0b0'; g.fillRect(9,8,1,1); g.fillRect(13,8,1,1);
},24,24);
function artIceBlock(g,x,y,w,h){ g.fillStyle='#6a9ac8'; g.fillRect(x,y,w,h); g.fillStyle='#a8d0f0'; g.fillRect(x,y,w-1,h-1);
  g.fillStyle='#d8f0ff'; g.fillRect(x,y,w-1,1); g.fillRect(x,y,1,h-1); g.fillStyle='#4a78a8'; g.fillRect(x+1,y+h-1,w-1,1); g.fillRect(x+w-1,y+1,1,h-1);
  g.fillStyle='#ffffff'; g.fillRect(x+1,y+1,Math.min(2,w-3),1); }
const ICE_GUARD=mkTile(g=>{ // El Guardián de Hielo — golem de bloques con bisel, ojos cian y un núcleo que late
  artIceBlock(g,7,16,4,6); artIceBlock(g,13,16,4,6);             // piernas
  artIceBlock(g,1,8,5,8); artIceBlock(g,18,8,5,8);                // brazos
  artIceBlock(g,5,7,14,10);                                    // torso
  artIceBlock(g,7,1,10,7);                                     // cabeza
  g.fillStyle='#4a78a8'; g.fillRect(12,9,1,6); g.fillRect(8,12,3,1);          // grietas
  artPix(g,["kkk","kCk","kkk"],{C:'#f8a030'},11,11); g.fillStyle='#fff0a0'; g.fillRect(12,12,1,1); // núcleo
  g.fillStyle='#1a2a4a'; g.fillRect(9,3,2,2); g.fillRect(13,3,2,2); g.fillStyle='#58e8f8'; g.fillRect(9,3,1,1); g.fillRect(13,3,1,1);
  artPix(g,[".W.","WWW"],{W:'#e8f8ff'},2,5); artPix(g,[".W","WW"],{W:'#e8f8ff'},20,6); artPix(g,["W","W"],{W:'#e8f8ff'},15,0);
  artOutline(g,24,24);
},24,24);
/* ============================================================
   LOS GUARDIANES (32×32): ningún jefe muere
   ============================================================ */
const TOPO_SPR=mkTile(g=>{ // EL TOPO REAL: panzón, zarpas de pala, hocico rosa y coronita de oro
  const FUR=['#2a1a0e','#50341e','#7a5434','#a07850','#c8a070'];
  blobArt(g,8,26,6,4,[{x:3,y:2,r:3,ry:2}],FUR,{outline:false}); blobArt(g,18,26,6,4,[{x:3,y:2,r:3,ry:2}],FUR,{outline:false});
  blobArt(g,3,4,26,25,[{x:13,y:16,r:12,ry:10},{x:13,y:9,r:9,ry:7.5}],FUR,{outline:false,grad:.45});
  blobArt(g,9,15,14,12,[{x:7,y:6,r:6.5,ry:5.5}],['#a07850','#c8a070','#e0c090','#f0d8b0','#fff0d8'],{outline:false,dither:.5,grad:.1}); // panza
  const PAW=['#8a4a48','#c07070','#e8a0a0','#f8c8c0','#fff0e8'];
  blobArt(g,0,16,9,9,[{x:4.5,y:4.5,r:4.4,ry:4}],PAW,{outline:false}); blobArt(g,23,16,9,9,[{x:4.5,y:4.5,r:4.4,ry:4}],PAW,{outline:false});
  g.fillStyle='#3a1a18'; for(const x of [1,3,5]){ g.fillRect(x,23,1,2); g.fillRect(x+24,23,1,2); }       // uñas
  g.fillStyle='#fff8f0'; for(const x of [1,3,5]){ g.fillRect(x,24,1,1); g.fillRect(x+24,24,1,1); }
  blobArt(g,12,12,8,6,[{x:4,y:3,r:3.8,ry:2.8}],['#8a3a50','#c05878','#e88ca8','#f8c0d0','#ffffff'],{outline:false}); // hocico
  g.fillStyle='#5a1a28'; g.fillRect(14,14,1,1); g.fillRect(17,14,1,1);
  artPix(g,["kk.....kk","kWk...kWk"],{W:'#ffffff'},11,9);                      // ojitos entornados
  g.fillStyle='#e89aa0'; g.fillRect(9,13,2,1); g.fillRect(21,13,2,1);        // mofletes
  artPix(g,["y..y..y","yY.y.Yy","yyyRyyy","OOOOOOO"],{y:'#f8d848',Y:'#fff8c0',O:'#b07818',R:'#e84848'},12,0); // corona
  artOutline(g,32,32);
  g.fillStyle='#fff8c0'; g.fillRect(15,1,1,1); // destello de la joya
},32,32);
const WASP_SPR=mkTile(g=>{ // LA REINA AVISPA: alas de cristal, tiara, abdomen a franjas y aguijón
  const WING=['#7a98b8','#a8c4dc','#d0e4f4','#eef6ff','#ffffff'];
  blobArt(g,0,3,13,12,[{x:6.5,y:6,r:6.2,ry:5.2}],WING,{outline:false,dither:.5}); blobArt(g,19,3,13,12,[{x:6.5,y:6,r:6.2,ry:5.2}],WING,{outline:false,dither:.5});
  blobArt(g,2,12,9,7,[{x:4.5,y:3.5,r:4.2,ry:3}],WING,{outline:false}); blobArt(g,21,12,9,7,[{x:4.5,y:3.5,r:4.2,ry:3}],WING,{outline:false});
  g.fillStyle='#7a98b8'; g.fillRect(4,8,6,1); g.fillRect(22,8,6,1); g.fillRect(5,15,4,1); g.fillRect(23,15,4,1);
  const Y=['#7a4a08','#c08810','#f0c020','#f8e060','#fff8c0'], K=['#0a0808','#161210','#221c18','#302820','#403428'];
  blobArt(g,9,17,14,14,[{x:7,y:6,r:6.2,ry:6.8}],Y,{outline:false,grad:.3});
  artClip(g,[[9,19,14,2],[9,23,14,2],[9,27,14,2]],()=>blobArt(g,9,17,14,14,[{x:7,y:6,r:6.2,ry:6.8}],K,{outline:false}));
  g.fillStyle='#1a1410'; g.fillRect(15,31,2,1);
  blobArt(g,10,12,12,8,[{x:6,y:4,r:5.4,ry:3.8}],['#2a1c10','#4a3218','#6a4a24','#8a6434','#b08a50'],{outline:false,dither:1}); // tórax peludo
  blobArt(g,8,1,16,12,[{x:8,y:6.2,r:7,ry:5.4}],Y,{outline:false,grad:.4});                         // cabeza
  const EYE=['#3a0810','#701828','#b02838','#e05060','#ff9098'];
  blobArt(g,9,4,5,6,[{x:2.5,y:3,r:2.5,ry:3}],EYE,{outline:false,dither:0}); blobArt(g,18,4,5,6,[{x:2.5,y:3,r:2.5,ry:3}],EYE,{outline:false,dither:0}); // ojos compuestos
  g.fillStyle='#ffffff'; g.fillRect(10,5,1,1); g.fillRect(19,5,1,1); g.fillRect(11,6,1,1); g.fillRect(20,6,1,1);
  g.fillStyle='#1a1410'; g.fillRect(9,3,4,1); g.fillRect(19,3,4,1); g.fillRect(14,10,4,1); g.fillRect(13,11,1,1); g.fillRect(18,11,1,1); // cejas y mandíbulas
  g.fillStyle='#f0a060'; g.fillRect(14,8,1,1); g.fillRect(17,8,1,1);
  g.fillStyle='#1a1410'; g.fillRect(11,0,1,2); g.fillRect(20,0,1,2); g.fillRect(10,0,1,1); g.fillRect(21,0,1,1);
  artPix(g,["y.Y.y","yyRyy"],{y:'#f8d848',Y:'#fff8c0',R:'#58c8e8'},14,0);    // tiara
  artOutline(g,32,32);
},32,32);
/* ============================================================
   EL VIENTO DEL NORTE, hermano del Roble. Si Raíz lleva corona de hojas y barba de musgo,
   él lleva corona de carámbanos y una barba de nube que se deshace en corrientes de aire.
   Se dibuja por piezas a cualquier tamaño (s) sin estirar píxeles, con su cara según el ánimo:
   'storm' (tormenta) · 'howl' (aúlla) · 'blow' (sopla, mofletes hinchados) · 'sad' (solo) ·
   'calm' (en paz, ojos cerrados) · 'happy' (el de antes, jugando). f: fotograma 0..7 (nube y barba),
   blink 0..1 (párpado), flip (mira/viaja hacia la derecha).
   ============================================================ */
const WIND_PAL={
  storm:['#1c2748','#34487a','#5a74ae','#94b0dc','#dbe8fa'], howl:['#1a2240','#30406e','#5468a2','#8ca6d6','#d4e2f8'],
  blow:['#243562','#3e5a96','#6a8ccc','#a8c8f0','#eaf4ff'], sad:['#2e3654','#4a5680','#7482aa','#a8b4d4','#e2e8f6'],
  calm:['#46548a','#6e82ba','#9fb4e2','#d0defa','#ffffff'], happy:['#2e5698','#4a7cc6','#7cacec','#bcdcff','#ffffff']};
const WIND_CACHE=new Map();
function windArt(o){ o=o||{}; const s=o.s||1, mood=o.mood||'storm', f=((o.f||0)%8+8)%8, bl=Math.round((o.blink||0)*4)/4, key=[s,mood,f,bl,o.flip?1:0,o.white?1:0].join('|');
  let c=WIND_CACHE.get(key); if(c) return c;
  if(o.white){ c=whiten(windArt(Object.assign({},o,{white:false}))); WIND_CACHE.set(key,c); return c; }
  if(o.flip){ c=flipH(windArt(Object.assign({},o,{flip:false}))); WIND_CACHE.set(key,c); return c; }
  const W=Math.round(52*s), H=Math.round(48*s); c=mkCanvas(W,H); const g=c.getContext('2d'), P=WIND_PAL[mood]||WIND_PAL.storm;
  const X=x=>x*s, Y=y=>y*s, R=v=>Math.max(1,Math.round(v*s)), ph=f/8*6.283, K='#141c34';
  const wob=(i,a)=>Math.sin(ph+i*1.7)*a; // la nube respira: cada mechón a su compás
  const px=(x,y,w,h,col)=>{ g.fillStyle=col; g.fillRect(Math.round(X(x)),Math.round(Y(y)),R(w),R(h)); };
  // 1) corrientes de aire alrededor de la cola (finas, con su rizo)
  const nStreams=mood==='storm'||mood==='howl'?3:mood==='calm'?1:2;
  [[30,40,40,46,49,40],[35,31,44,30,49,24],[27,44,34,47,42,46]].slice(0,nStreams).forEach(([x0,y0,x1,y1,x2,y2],si)=>{ const n=Math.round(30*s);
    for(let i=0;i<=n;i++){ const t=i/n, u=1-t, x=u*u*x0+2*u*t*x1+t*t*x2, y=u*u*y0+2*u*t*y1+t*t*y2+Math.sin(ph*1.4+t*4+si)*.8; if((i&3)===3&&t<.4) continue; px(x,y,.9,.9,t>.7?'#ffffff':P[3]); }
    for(let k=0;k<11;k++){ const a=k/11*4.6+ph*.4, r=2.6-k*.16; px(x2+Math.cos(a)*r,y2+Math.sin(a)*r*.8,.9,.9,k<5?P[3]:'#ffffff'); } });
  // 2) la barba: una cola de nube que baja de la barbilla y se enrosca hacia un lado (como una coma)
  const blow=mood==='blow', lobes=[];
  for(let i=0;i<=16;i++){ const t=i/16, u=1-t, x=u*u*22+2*u*t*27+t*t*46, y=u*u*27+2*u*t*42+t*t*33, w=Math.sin(ph+t*5)*t*1.2; // una cola continua que adelgaza
    lobes.push({x:X(x+w*.4),y:Y(y+w),r:X(6.6-t*5)}); }
  // la cabeza: mechones de nube detrás, la cara delante (y los mofletes, si sopla)
  lobes.push({x:X(13+wob(0,.4)),y:Y(10.5),r:X(5.4)},{x:X(19.5),y:Y(7+wob(1,.35)),r:X(6)},{x:X(26.5),y:Y(7.4+wob(2,.35)),r:X(5.6)},{x:X(32.4+wob(3,.4)),y:Y(11.4),r:X(5)},
    {x:X(9.4+wob(4,.35)),y:Y(17),r:X(4.2)},{x:X(34.6+wob(5,.35)),y:Y(18),r:X(4)},{x:X(22),y:Y(17),r:X(11.4),ry:Y(10.2)});
  if(blow) lobes.push({x:X(14.6),y:Y(20.4),r:X(4.4)},{x:X(29.4),y:Y(20.4),r:X(4.4)});
  blobArt(g,0,0,W,H,lobes,P,{outline:false,grad:.45,dither:.55});
  // 3) la corona de carámbanos
  for(const [x,y,h] of [[15,6.5,4],[19,3.6,5.4],[23,2,7.2],[27,3.6,5.4],[31,6.5,4]]){ const hh=R(h), w=R(2.8);
    for(let i=0;i<hh;i++){ const ww=Math.max(1,Math.round(w*(1-i/hh))); g.fillStyle=i<hh*.4?'#e6f8ff':'#8ed2f2'; g.fillRect(Math.round(X(x)-ww/2),Math.round(Y(y+2)-i),ww,1); }
    g.fillStyle='#ffffff'; g.fillRect(Math.round(X(x))-1,Math.round(Y(y+2)-hh+1),1,1); }
  // 4) la cara
  const brow={storm:1,howl:.9,blow:.7,sad:-1,calm:-.2,happy:-.4}[mood]||0;
  for(const [ex,d] of [[17,1],[27,-1]]) for(let j=0;j<=6;j++){ const k=j/6, x=ex-3.6*d+j*d*1.15, y=10.2+k*brow*2.4-(brow<0?-brow*1.4:0); // cejas de escarcha, pobladas
    px(x,y,1.3,1.8,j<1?P[3]:'#ffffff'); if(j>1&&j<6) px(x,y+1.6,1.3,.7,P[2]); }
  const eyeH={storm:2.6,howl:3.8,blow:1,sad:2.2,calm:1,happy:3.4}[mood]||3, shut=mood==='calm'||mood==='blow'||bl>=.75;
  for(const ex of [17,27]){
    if(shut){ for(let j=-2;j<=2;j++){ const y=mood==='calm'?15.8-(4-j*j)*.2:15.3+Math.abs(j)*.28; px(ex+j*.9,y,1,1,K); } continue; } // en paz (‿) o apretados al soplar
    const h=eyeH*(1-bl), top=15.6-h/2; px(ex-1.8,top,3.6,Math.max(.6,h),K);
    px(ex-.9,top+.4,1.4,Math.max(.5,Math.min(h-.6,1.7)),mood==='storm'||mood==='howl'?'#9ef0ff':'#ffffff');
    if(mood==='sad') px(ex-1.9,top,3.8,.9,P[2]); }
  if(mood==='storm'||mood==='howl') for(const ex of [17,27]){ g.fillStyle='rgba(150,236,255,.28)'; g.fillRect(Math.round(X(ex-2.8)),Math.round(Y(13)),R(5.6),R(5)); } // el hielo le brilla en los ojos
  px(20.8,17.8,2.6,2,P[4]); px(21.2,19.4,1.8,.8,P[2]); // la nariz
  if(mood==='happy'||mood==='calm'){ g.fillStyle='rgba(244,170,200,.75)'; g.fillRect(Math.round(X(12.6)),Math.round(Y(18.8)),R(2.6),R(1.2)); g.fillRect(Math.round(X(28.8)),Math.round(Y(18.8)),R(2.6),R(1.2)); }
  // el bigote: dos bucles blancos que se abren hacia arriba (con su sombra debajo, separado de la boca)
  for(const d of [-1,1]) for(let j=0;j<7;j++){ const k=j/6, x=22+d*(.8+j*1.05), y=21.2+Math.sin(k*2.6)*.7-k*k*2; px(x,y+.9,1.1,.7,P[1]); px(x,y,1.1,1.1,'#ffffff'); }
  // la boca, bajo el bigote
  if(mood==='howl'||mood==='storm'){ const hh=mood==='howl'?4.6:2.6; px(20,23,4.2,hh,K); px(20.6,23.2+hh*.45,3,hh*.5,'#3a1830'); }
  else if(blow){ px(21.2,23,1.8,1.8,K); px(21.6,23.4,1,1,P[1]); }
  else if(mood==='sad'){ for(let j=-2;j<=2;j++) px(22+j,24.2-(4-j*j)*.22,1,1,K); }
  else if(mood==='happy'){ for(let j=-2;j<=2;j++) px(22+j,23.2+(4-j*j)*.26,1,1,K); px(21,23.6,2,.8,'#ffffff'); }
  else { for(let j=-1;j<=1;j++) px(22+j,23.6+(1-j*j)*.3,1,1,K); }
  artOutline(g,W,H,K);
  WIND_CACHE.set(key,c); if(WIND_CACHE.size>260) WIND_CACHE.delete(WIND_CACHE.keys().next().value); return c; }
/* pinta el Viento con la CABEZA centrada en (x,y) (con flip, la cabeza queda a la derecha del lienzo) */
function drawWind(x,y,o){ const img=windArt(o), s=o.s||1, hx=o.flip?img.width-22*s:22*s; ctx.drawImage(img,Math.round(x-hx),Math.round(y-17*s)); return img; }
/* el retrato del diálogo: la cara, de cerca */
function windPortrait(mood){ const src=windArt({s:1.1,mood}), c=mkCanvas(32,32), g=c.getContext('2d'); g.drawImage(src,Math.round(-6*1.1),Math.round(-1*1.1)); return c; }
const WIND_SPR=(()=>{ const src=windArt({s:.66,mood:'storm'}), c=mkCanvas(32,32); c.getContext('2d').drawImage(src,0,1); return c; })(); // (compatibilidad) el Viento de 32 px
const BOSS_SPR={topo:TOPO_SPR,avispa:WASP_SPR,viento:WIND_SPR,king:KING_BEETLE,drone:DRONE,iceguard:ICE_GUARD};
const BOSS_WHITE={}; for(const k in BOSS_SPR) BOSS_WHITE[k]=whiten(BOSS_SPR[k]);
BOSS_SPR.kingL=flipH(KING_BEETLE); BOSS_WHITE.kingL=whiten(BOSS_SPR.kingL);
/* retratos del diálogo (a lo Golden Sun): el sprite del hablante, en grande */
const PORTRAITS={
  'RAÍZ':ELDER,'PETRA':PETRA_SPR,'LUPA':LUPA_SPR,'MOSS':MOSS_SPR,'TILO':TILO_SPR,'CORTEZA':CORTEZA_SPR,
  'EL VIENTO':windPortrait('sad'),'EL TOPO REAL':TOPO_SPR,'LA REINA':WASP_SPR,'SPROUT':H_DOWN_A,
};
/* un remolino de viento en píxeles: embudo ancho arriba y fino abajo que se cimbrea, con franjas
   en hélice que corren al girar (ph) y contorno. pal: [contorno, borde, medio, cuerpo, brillo] */
function tornadoArt(W,H,topHW,botHW,ph,pal,sway){
  const c=mkCanvas(W,H), g=c.getContext('2d'), im=g.createImageData(W,H), d=im.data, rgb=pal.map(hex2rgb), K=new Int8Array(W*H).fill(-1);
  for(let y=1;y<H-1;y++){ const v=(y-.5)/(H-2), lump=1+.13*Math.sin(y*.95+ph*1.5)*(1-v*.5), hw=(botHW+(topHW-botHW)*Math.pow(1-v,1.45))*lump, cx=W/2+Math.sin(ph+v*3.4)*(sway||0)*(.25+.75*(1-v));
    for(let x=1;x<W-1;x++){ const u=(x+.5-cx)/hw; if(Math.abs(u)>1) continue;
      if(v>.86&&((x+y)&1)&&Math.abs(u)>.35) continue;                          // el pie se deshilacha
      if(y<=2&&Math.abs(u)>.4&&((x*5+y*3+Math.round(ph*2))%4)<(3-y)*1.2){ K[y*W+x]=-2; continue; } // y la boca, en jirones
      const band=Math.sin(Math.asin(u)*2.4+y*.55-ph*2.2);                      // franjas en hélice que dan la vuelta
      K[y*W+x]=Math.abs(u)>.84?(u<0?2:1):band>.42?4:band>-.18?3:band>-.62?2:1; } }
  for(let y=0;y<H;y++) for(let x=0;x<W;x++){ let k=K[y*W+x];
    if(k===-2) continue;
    if(k<0){ const side=(x>0&&K[y*W+x-1]>=0)||(x<W-1&&K[y*W+x+1]>=0), vert=(y>0&&K[(y-1)*W+x]>=0)||(y<H-1&&K[(y+1)*W+x]>=0&&y>3);
      if(!(side||vert)) continue; k=0; }
    const i=(y*W+x)*4, q=rgb[k]; d[i]=q[0]; d[i+1]=q[1]; d[i+2]=q[2]; d[i+3]=255; }
  g.putImageData(im,0,0); return c; }
const SPIN_ICON=mkTile(g=>{ // el Remolino: un tornadito con dos hojas que giran alrededor
  g.drawImage(tornadoArt(14,15,5.6,1.2,.7,['#1a1410','#3a9a58','#8ad8a8','#dcf8e8','#ffffff'],.9),1,0);
  g.fillStyle='#1a1410'; g.fillRect(0,5,3,3); g.fillRect(12,9,4,3); g.fillStyle='#78d838'; g.fillRect(1,6,1,1); g.fillRect(13,10,2,1); g.fillStyle='#b8f070'; g.fillRect(13,10,1,1);
  g.fillStyle='#1a1410'; g.fillRect(4,14,8,2); g.fillStyle='#b8e8c8'; g.fillRect(5,14,6,1); });
/* ---------- LOGO del título: letras propias con bisel, a lo Zelda ---------- */
function silRects(w,h,rects,cuts){ // silueta por rectángulos + cortes diagonales
  const g=Array.from({length:h},()=>Array(w).fill(false));
  for(const [x,y,rw,rh] of rects) for(let yy=y;yy<Math.min(h,y+rh);yy++)
    for(let xx=x;xx<Math.min(w,x+rw);xx++) g[yy][xx]=true;
  for(const [x,y,rw,rh] of (cuts||[])) for(let yy=y;yy<Math.min(h,y+rh);yy++)
    for(let xx=x;xx<Math.min(w,x+rw);xx++) g[yy][xx]=false;
  return g;
}
function glyphC(g,light,mid,dark){ // contorno negro + bisel (luz arriba-izq, sombra abajo-dcha)
  const h=g.length, w=g[0].length;
  const c=document.createElement('canvas'); c.width=w+2; c.height=h+2;
  const q=c.getContext('2d');
  const at=(x,y)=>y>=0&&y<h&&x>=0&&x<w&&g[y][x];
  for(let y=-1;y<=h;y++) for(let x=-1;x<=w;x++){
    if(at(x,y)) continue;
    let edge=false;
    for(let dy=-1;dy<=1&&!edge;dy++) for(let dx=-1;dx<=1;dx++) if(at(x+dx,y+dy)){edge=true;break;}
    if(edge){ q.fillStyle=PAL.k; q.fillRect(x+1,y+1,1,1); }
  }
  for(let y=0;y<h;y++) for(let x=0;x<w;x++){
    if(!g[y][x]) continue;
    let col=mid;
    if(!at(x,y-1)||(!at(x-1,y)&&!at(x-1,y-1))) col=light;
    else if(!at(x,y+1)||!at(x+1,y)) col=dark;
    q.fillStyle=col; q.fillRect(x+1,y+1,1,1);
  }
  return c;
}
function glyph(g){ return glyphC(g,'#b0f068','#70d838','#2e8038'); }
function scale2(c,sw,sh){ const n=document.createElement('canvas'); n.width=sw*2; n.height=sh*2;
  const g=n.getContext('2d'); g.imageSmoothingEnabled=false;
  g.drawImage(c,0,0,sw,sh,0,0,sw*2,sh*2); return n; }
/* letras del logo, 16×20: relleno en degradado tramado (lima → verde hoja), bisel
   claro arriba-izquierda y oscuro abajo-derecha, relieve de 3 px y contorno negro */
function logoGlyph(m,fill,depth){
  const h=m.length, w=m[0].length, c=mkCanvas(w+6,h+7), q=c.getContext('2d'), at=(x,y)=>y>=0&&y<h&&x>=0&&x<w&&m[y][x];
  const ext=[[1,1],[1,2],[2,3]], solid=(x,y)=>at(x,y)||ext.some(([dx,dy])=>at(x-dx,y-dy));
  for(let y=-1;y<=h+3;y++) for(let x=-1;x<=w+2;x++){ if(solid(x,y)) continue;
    let e=false; for(let dy=-1;dy<=1&&!e;dy++) for(let dx=-1;dx<=1;dx++) if(solid(x+dx,y+dy)){ e=true; break; }
    if(e){ q.fillStyle=PAL.k; q.fillRect(x+2,y+2,1,1); } }
  for(let y=0;y<h+3;y++) for(let x=0;x<w+2;x++) if(!at(x,y)&&solid(x,y)){ q.fillStyle=(x+y)&1?depth[0]:depth[1]; q.fillRect(x+2,y+2,1,1); }
  const n=fill.length-1;
  for(let y=0;y<h;y++) for(let x=0;x<w;x++){ if(!m[y][x]) continue;
    const t=y/(h-1)*n, i=Math.min(n-1,t|0), f=t-i; let col=f>.3+BAYER4[y&3][x&3]/16*.4?fill[i+1]:fill[i];
    if(!at(x,y-1)||!at(x-1,y)) col=fill[0]; else if(!at(x,y+1)||!at(x+1,y)) col=depth[1];
    q.fillStyle=col; q.fillRect(x+2,y+2,1,1); }
  q.fillStyle='#ffffff'; for(let y=0;y<h;y++){ let done=false; for(let x=0;x<w&&!done;x++) if(m[y][x]&&!at(x,y-1)&&!at(x-1,y)){ q.fillRect(x+2,y+2,2,1); done=true; } if(done) break; }
  return c; }
const LOGO_FILL=['#f0ffc0','#c0f070','#80d840','#4cb038','#2e8a34'], LOGO_DEPTH=['#0e3a18','#185a24'];
const LG=(r,c)=>logoGlyph(silRects(16,20,r,c),LOGO_FILL,LOGO_DEPTH);
const LG_S=LG([[0,0,16,6],[0,0,6,11],[0,8,16,5],[10,8,6,12],[0,14,16,6]],[[0,0,2,2],[14,0,2,1],[10,4,6,2],[0,14,6,2],[0,18,2,2],[14,18,2,2]]);
const LG_P=LG([[0,0,6,20],[0,0,16,6],[10,0,6,13],[0,8,16,5]],[[14,0,2,2],[14,11,2,2]]);
const LG_R=LG([[0,0,6,20],[0,0,16,6],[10,0,6,12],[0,8,15,4],[6,12,5,3],[8,14,5,3],[10,16,6,4]],[[14,0,2,2],[13,10,3,2]]);
const LG_U=LG([[0,0,6,16],[10,0,6,16],[0,14,16,6]],[[0,18,2,2],[14,18,2,2]]);
const LG_T=LG([[0,0,16,6],[5,0,6,20]],[[0,0,1,2],[15,0,1,2]]);
/* la O: una bellota dorada grande, con capuchón tramado */
const LOGO_ACORN=(()=>{ const c=mkCanvas(22,26), g=c.getContext('2d');
  blobArt(g,2,8,18,16,[{x:9,y:6,r:8,ry:7},{x:9,y:9,r:6.5,ry:6}],['#8a5a08','#c88a10','#f0c020','#f8e060','#fffbd0'],{grad:.5,dither:.7});
  blobArt(g,1,4,20,9,[{x:10,y:6,r:10,ry:4.2}],['#3a2008','#5a3414','#7a4a20','#a06a34','#c89058'],{grad:.3});
  g.fillStyle='#3a2008'; for(let x=3;x<19;x+=3) for(let y=6;y<11;y+=2) g.fillRect(x+((y>>1)&1),y,1,1);
  g.fillStyle=PAL.k; g.fillRect(10,0,3,5); g.fillStyle='#6a4018'; g.fillRect(11,1,1,4); g.fillStyle='#78d838'; g.fillRect(13,1,4,2); g.fillStyle=PAL.k; g.fillRect(13,0,4,1); g.fillRect(17,1,1,2); g.fillRect(13,3,4,1);
  g.fillStyle='#ffffff'; g.fillRect(6,13,2,2); g.fillRect(5,15,1,1);
  return c; })();
const ACORN2=LOGO_ACORN;
const LOGO_GLYPHS=[
  {img:LG_S,dy:0,w:19},{img:LG_P,dy:0,w:19},{img:LG_R,dy:0,w:19},
  {img:LOGO_ACORN,dy:-2,w:21},{img:LG_U,dy:0,w:19},{img:LG_T,dy:0,w:19},
];
LOGO_GLYPHS.forEach(g=>{ g.dark=darken(g.img); g.white=whiten(g.img); });
const LOGO_X=Math.round(80-(19*5+21)/2)-1, LOGO_Y=10;
const LOGO_POS=(()=>{ let x=LOGO_X; return LOGO_GLYPHS.map(g=>{ const p=x; x+=g.w; return p; }); })();
function gridNew(w,h){ return Array.from({length:h},()=>Array(w).fill(false)); }
function discOn(g,cx,cy,r){ const r2=r*r;
  for(let y=0;y<g.length;y++) for(let x=0;x<g[0].length;x++){
    const dx=x-cx, dy=y-cy; if(dx*dx+dy*dy<=r2) g[y][x]=true; } }
/* la Hoja Ancestral del logo: LA hoja del juego, en grande.
   Ovalada con peciolo, vena central, nervaduras y borde dentado.
   Se dibuja horizontal con detalle y se inclina por cizalla entera:
   píxel nítido, sin rotaciones borrosas. */
function shearUp(c,k){ // las columnas suben hacia la derecha
  const drift=Math.ceil(c.width*k);
  const n=document.createElement('canvas'); n.width=c.width; n.height=c.height+drift;
  const g=n.getContext('2d');
  for(let x=0;x<c.width;x++) g.drawImage(c,x,0,1,c.height,x,drift-((x*k)|0),1,c.height);
  return n;
}
const LEAF_BLADE=(()=>{
  const W=54,H=17,CY=8;
  const prof=t=>{ if(t<0||t>43) return -1;       // perfil de hoja: panza redonda, punta fina
    return Math.max(0,Math.round(6.2*Math.pow(Math.sin(Math.PI*t/43),0.7))); };
  const bg=gridNew(W,H);
  for(let t=0;t<=43;t++){ const h=prof(t);
    for(let y=CY-h;y<=CY+h;y++) if(y>=0&&y<H) bg[y][8+t]=true; }
  for(let x=2;x<=8;x++){ bg[CY][x]=true; if(x<5) bg[CY+1][x]=true; } // peciolo
  const c=glyphC(bg,'#a8ec78','#70d838','#2e8038');  // paleta de la hoja del juego
  const q=c.getContext('2d');
  q.fillStyle='#1d4f22';                        // vena central
  for(let t=3;t<=40;t++) q.fillRect(9+t,CY+1,1,1);
  for(const t of [8,16,24,32]){                 // nervaduras laterales
    q.fillRect(9+t,CY,1,1);  q.fillRect(10+t,CY-1,1,1); q.fillRect(11+t,CY-2,1,1);
    q.fillRect(11+t,CY+2,1,1); q.fillRect(12+t,CY+3,1,1);
  }
  q.fillStyle='#2e8038';                        // borde dentado sutil
  for(const t of [10,17,24,31,38]) q.fillRect(9+t,CY-prof(t)+2,1,1);
  q.fillStyle='#ffffff';                        // brillo
  q.fillRect(43,CY-3,2,1); q.fillRect(44,CY-4,1,1);
  const sh=shearUp(c,0.26);
  return scale2(sh,sh.width,sh.height);
})();
/* la HOJA-PERGAMINO de la cinemática: una hoja ancha y curada como papiro.
   Cuerpo panzudo (el texto SIEMPRE cabe), extremos enrollados de pergamino,
   fibras horizontales, manchas de viejo y borde dentado de hoja.
   Se dobla por la vena al pasar de página. */
const LEAF_PAGE=(()=>{
  const W=156,H=110,CX=78,CY=55,A=75,B=51,N=3; // superelipse: panza casi rectangular
  const inside=(x,y)=>Math.pow(Math.abs((x-CX)/A),N)+Math.pow(Math.abs((y-CY)/B),N)<=1;
  const bg=gridNew(W,H);
  for(let y=0;y<H;y++) for(let x=0;x<W;x++) if(inside(x,y)) bg[y][x]=true;
  for(let x=6;x<W-6;x+=7){ // muescas dentadas arriba y abajo, como hoja de verdad
    for(let y=0;y<H;y++){ if(bg[y][x]){ bg[y][x]=false; if(((x/7)|0)&1) bg[y+1][x]=false; break; } }
    for(let y=H-1;y>=0;y--){ if(bg[y][x]){ bg[y][x]=false; break; } }
  }
  for(let x=0;x<6;x++){ bg[CY][x]=true; if(x<3) bg[CY+1][x]=true; } // peciolo
  const c=glyphC(bg,'#f2ecbc','#e2dc9e','#b0a868'); // verde curado, tinte pergamino
  const q=c.getContext('2d');
  q.globalCompositeOperation='source-atop';         // todo lo demás, recortado a la hoja
  q.fillStyle='rgba(110,100,50,.10)';               // fibras de papiro
  for(let y=3;y<H;y+=3) q.fillRect(0,y,W+2,1);
  q.fillStyle='rgba(255,255,235,.08)';
  for(let y=5;y<H;y+=6) q.fillRect(0,y,W+2,1);
  // extremos enrollados: el canuto del pergamino a cada lado
  for(const x0 of [3,W-9]){
    q.fillStyle='rgba(95,88,42,.30)';  q.fillRect(x0,0,8,H+2);
    q.fillStyle='rgba(255,252,230,.30)'; q.fillRect(x0+2,0,2,H+2); // brillo del rollo
    q.fillStyle='rgba(70,64,28,.40)';  q.fillRect(x0+7,0,1,H+2);  // pliegue interior
  }
  q.fillStyle='rgba(130,110,40,.12)';               // manchas de esquina (envejecido)
  q.beginPath(); q.arc(26,14,13,0,6.29); q.fill();
  q.beginPath(); q.arc(W-26,H-12,15,0,6.29); q.fill();
  q.beginPath(); q.arc(20,H-16,9,0,6.29); q.fill();
  const vg=q.createRadialGradient(CX,CY,34,CX,CY,86); // ribete verde: la hoja sigue viva en las orillas
  vg.addColorStop(0,'rgba(122,154,72,0)'); vg.addColorStop(1,'rgba(96,138,56,.42)');
  q.fillStyle=vg; q.fillRect(0,0,W+2,H+2);
  q.globalCompositeOperation='source-over';
  return c;
})();
/* (el antiguo retrato grande del título se retiró: en su lugar, el sprite
   del juego contempla el Gran Roble — la escala pequeña ES el póster) */
/* el Gran Roble del fondo (nuestro huevo del Pez Viento) */
/* copas y troncos con volumen (blobArt): la misma luz que el resto del mundo */
const OAK_LEAF=['#0c2e1a','#1a5a2c','#2c8038','#4aa444','#7ccc5c','#b4ec80'];
const OAK_BARK=['#2e1808','#4e2c14','#7a4a24','#a06a38','#c8905a'];
function barkStreaks(q,x0,y0,w,h,seed){ // vetas verticales sobre la corteza ya pintada
  const d=q.getImageData(x0,y0,w,h).data, at=(x,y)=>d[(y*w+x)*4+3]>0&&d[(y*w+x)*4]>40;
  q.fillStyle=OAK_BARK[1];
  for(let x=1;x<w-1;x+=3) for(let y=1;y<h-1;y++) if(at(x,y)&&at(x-1,y)&&at(x+1,y)&&((hash(x+seed,y>>2)&3)!==0)) q.fillRect(x0+x,y0+y,1,1);
}
const OAK=(()=>{
  const W=40,H=42, c=document.createElement('canvas'); c.width=W+2; c.height=H+2;
  const q=c.getContext('2d');
  blobArt(q,1,1,W,H,[{x:20,y:31,r:3.6,ry:11},{x:20,y:38,r:5,ry:3},{x:15,y:40,r:3,ry:2},{x:25,y:40,r:3,ry:2},{x:14,y:25,r:2.6,ry:1.6},{x:26,y:27,r:2.6,ry:1.6}],OAK_BARK,{grad:.3});
  barkStreaks(q,1,1,W,H,3);
  blobArt(q,1,1,W,H,[{x:20,y:7,r:7},{x:11,y:12,r:7},{x:29,y:12,r:7},{x:5,y:19,r:5},{x:35,y:19,r:5},{x:14,y:19,r:8},{x:26,y:19,r:8},{x:20,y:16,r:9},{x:12,y:24,r:5},{x:28,y:24,r:5},{x:20,y:24,r:5.5}],OAK_LEAF,{grad:.8,bias:-.4,dither:.6});
  return c;
})();
const OAK_DARK=darken(OAK); // el Roble apagado, mientras sus semillas anden lejos
/* el GRAN ROBLE de la plaza: majestuoso, generado a resolución nativa (nada de escalados) */
const OAK_GRAND=(()=>{
  const W=84,H=80, c=document.createElement('canvas'); c.width=W+2; c.height=H+2;
  const q=c.getContext('2d');
  // tronco anciano: fuste, ramas que se hunden en la copa y raíces que agarran el suelo
  blobArt(q,1,1,W,H,[{x:42,y:56,r:7.5,ry:22},{x:33,y:44,r:6,ry:3},{x:52,y:46,r:6,ry:3},{x:42,y:70,r:10,ry:6},{x:32,y:73,r:6,ry:3.4},{x:52,y:73,r:6,ry:3.4},{x:26,y:76,r:4,ry:2},{x:58,y:76,r:4,ry:2}],OAK_BARK,{grad:.4,bias:-.15,dither:.8});
  barkStreaks(q,1,1,W,H,7);
  q.fillStyle=OAK_BARK[0]; q.fillRect(41,60,3,5); q.fillRect(42,59,1,7); q.fillStyle='#1a0e06'; q.fillRect(42,61,1,3); // el hueco del tronco
  // copa enorme: lóbulos de atrás a delante
  blobArt(q,1,1,W,H,[
    {x:32,y:8,r:7.5},{x:52,y:8,r:7.5},{x:16,y:21,r:8},{x:68,y:21,r:8},
    {x:42,y:14,r:15},{x:26,y:19,r:14},{x:58,y:18,r:14},{x:11,y:31,r:10.5},{x:73,y:31,r:10.5},
    {x:30,y:30,r:15},{x:54,y:30,r:15},{x:42,y:25,r:15},
    {x:19,y:40,r:9},{x:65,y:40,r:9},{x:35,y:42,r:10},{x:50,y:42,r:10}],OAK_LEAF,{grad:.8,bias:-.42,dither:.6});
  return c;
})();
const OAK_GRAND_DARK=darken(OAK_GRAND);

/* ============================================================
   SEGUNDA PASADA: criaturas y objetos nuevos
   ============================================================ */
const TOPILLO=spr([ // topillo: asoma del agujero y muerde
"................",
".....kk..kk.....",
"....kAAkkAAk....",
"...kAaaaaaaAk...",
"..kaaaaaaaaaAk..",
"..kakqaaaakqAk..",
"..kakkaaaakkAk..",
"..kavvvzzvvvAk..",
"..kvvvkzzkvvvk..",
"..kvvvqkkqvvvk..",
"...kvvvvvvvvk...",
"..kvkkaaaakkvk..",
".kvvvkaaaakvvvk.",
".kkkkkAAAAkkkkk.",
"....kkkkkkkk....",
"................",
],{a:'#9a7048',A:'#6a4a2a',v:'#f0e0c8',z:'#f08ab0',q:'#ffffff'});
const TOPILLO_HOLE=sprN([
"....kkkkkkkk....",
"...kTTTTTTTTk...",
"..kTtttttttttk..",
"..kTtttttttttk..",
"...kTTTTTTTTk...",
"....kkkkkkkk....",
],{T:'#5a4630',t:'#1a120c'});
const LIRIO_FX={z:'#f050a0',Z:'#ff98cc',x:'#b02870',y:'#f8d030',g:'#58a848',G:'#2e7830',L:'#98e070',q:'#ffffff'};
const LIRIO=spr([ // lirio de agua: flor que escupe semillas
"................",
"................",
".......kk.......",
"......kZzk......",
"....kkkZzkkk....",
"...kZzkZzkzxk...",
"...kZzzkkzzxk...",
"....kZzzzzxk....",
".....kxzzxk.....",
"..kkkkkxxkkkkk..",
".kLLggggggggGGk.",
"kLgggggggggggGGk",
"kgggkkggggggGGGk",
".kGGGGGGGGGGGGk.",
"..kkkkkkkkkkkk..",
"................",
],LIRIO_FX);
const LIRIO_B=spr([ // abierto: escupe
"................",
"..k....kk....k..",
".kZk..kZzk..kzk.",
".kZzk.kZzk.kzxk.",
"..kZzkkkkkkzxk..",
"...kzkyyyykxk...",
"..kZzkykkykzxk..",
"..kZzkyyyykzxk..",
"...kxzkkkkzxk...",
"..kkkkkxxkkkkk..",
".kLLggggggggGGk.",
"kLgggggggggggGGk",
"kgggkkggggggGGGk",
".kGGGGGGGGGGGGk.",
"..kkkkkkkkkkkk..",
"................",
],LIRIO_FX);
const RODA_PAL=['#5a2410','#944418','#c06a24','#e09a3a','#f8cc68'];
const RODA_FX={v:'#5a2410',q:'#ffffff',n:'#3a1808',g:'#8a9a38'};
const RODAHOJA=creature([{x:8,y:8.5,r:6.3},{x:4.5,y:6,r:3},{x:11.5,y:6.5,r:3}],RODA_PAL,[ // rodahoja: bola de hojarasca que rebota
"................",
"...g............",
"....g.......v...",
"..........v.....",
"....v...........",
"...........v....",
".....kq..kq.....",
".....kk..kk.....",
"..v.............",
"......nnnn...v..",
"................",
"....v.......v...",
"........v.......",
"................",
"................",
"................",
],RODA_FX);
const RODAHOJA_B=creature([{x:8,y:9.5,r:6.8,ry:5.6},{x:4,y:7.5,r:3},{x:12,y:7.5,r:3}],RODA_PAL,[
"................",
"................",
"...g............",
"....g.......v...",
"............v...",
"....v...........",
"................",
".....kk..kk.....",
"..v.............",
"......nnnn...v..",
"................",
"....v.......v...",
"........v.......",
"................",
"................",
"................",
],RODA_FX);
Object.assign(E_SPR,{
  topillo:{a:TOPILLO},
  lirio:{a:LIRIO,b:LIRIO_B},
  rodahoja:{a:RODAHOJA,b:RODAHOJA_B},
});
for(const k of ['topillo','lirio','rodahoja']){ const S=E_SPR[k]; S.w={}; for(const f in S){ if(f==='w')continue; S.w[f]=whiten(S[f]); } }
const LETTER_SPR=sprN([ // carta del Viento: sobre azul con sello de copo
"kkkkkkkkkkkk",
"kWNNNNNNNNMk",
"kNnkNNNNknMk",
"kNNnkNNknNMk",
"kNNNnkknNNMk",
"kNNNNcCNNNMk",
"kMMMMMMMMMMk",
"kkkkkkkkkkkk",
],{W:'#ffffff',N:'#c8dcf0',n:'#a0b8d8',M:'#8aa0c0',c:'#88e0ff',C:'#3890c8'});
const SEED_ICON=ACORN_GOLD;
/* iconos de pestaña del zurrón (10×10) */
const TAB_ICONS={
  zurron:sprN(["...kkkk...","..kmAAmk..",".kkkkkkkk.","kaAaaaaaAk","kaaYyaaaak","kaaykaaaBk",".kaaaaaBk.","..kaaBBk..","...kkkk...",".........."],{m:'#5a3418',A:'#8a5a2c',a:'#d8a060',B:'#a06a30',Y:'#f8d848',y:'#b07818'}),
  mapa:sprN(["kkkkkkkkkk","kvvvkvvvVk","kvgkkvvvVk","kvgvvvRkVk","kvvvvkRvVk","kvvkvvvkVk","kvbbvvvvVk","kvbkvvvkVk","kVVVVVVVVk","kkkkkkkkkk"],{v:'#f0dca0',V:'#c8a868',g:'#58a848',b:'#4888d8',R:'#e84848'}),
  valle:sprN(["...kkkk...","..kLllmk..",".kLllmmdk.","kLlllmmddk","klllmmmddk",".kdmmmddk.","..kkkkkk..","....kAk...","...kkAkk..","..kkkkkkk."],{L:'#b0f070',l:'#70d838',m:'#3aa840',d:'#1e6a2a',A:'#8a5028'}),
  recuerdos:sprN(["kkkk.kkkk.","kvvvkvvvVk","kvAAkvAAVk","kvvvkvvvVk","kvAAkvAvVk","kvvvkvvvVk","kvAAkvAAVk","kvvvkvvvVk","kkkkkkkkkk","....kk...."],{v:'#f8ecd0',V:'#c8b088',A:'#8a6a48'}),
  ajustes:sprN(["...kkkk...","..kLllTk..",".kLtkktTk.","kLtk..ktTk","ktTk..kTTk",".ktTkkTTk.","..kTTTTk..","...kkkk...","..........",".........."],{L:'#f0f0f8',t:'#b8b8c8',T:'#6a6a80'}),
};
/* ---------- marchitarse: pose intermedia y semilla ---------- */
const H_DROOP=spr([ // se dobla: hojas caídas hacia un lado, ojos medio cerrados
"................",
"................",
"....kk..........",
"...kLlkk........",
"....kllkk.......",
".....kdkkkkkk...",
"....kkkkssssk...",
"...ksssssssssk..",
"..kssskkssskssk.",
"..kssssssssssk..",
"..kSSsssssssSk..",
"...kSSSSSSSSk...",
"....kbbbbbbk....",
"...ksbbbbbbbsk..",
"....kmmk.kmmk...",
".....kk...kk....",
]);
const SEED_FALL=sprN(["..kkkk..",".kAAAAk.","kAAAAAAk","kaaawaak",".kaaaak.","..kaak..","...kk..."]);
const LEAF_BIT=sprN(["kk.","klk",".kk"]);
/* secretos del valle (12c): el Trébol de cuatro hojas y el cebo dorado */
AMULET_SPR.trebol=amuletArt(['#1a4a1a','#2e7a2a','#4aa844','#8ad866','#d8ffb0'],["......",".LL.L.","LLlLL.",".LlLL.","..l...","..l..."],{L:'#d8ffb0',l:'#1a5a1a'});
const LURE_SPR=mkTile(g=>{ // el cebo dorado: una cucharilla que brilla
  blobArt(g,2,1,8,9,[{x:4,y:4.5,r:3.6,ry:4.2}],GOLD5,{dither:.4,grad:.3});
  g.fillStyle='#fffbe0'; g.fillRect(4,2,1,2);
  g.fillStyle=PAL.k; g.fillRect(6,9,1,2); g.fillRect(7,11,2,1); g.fillRect(9,10,1,1);
  g.fillStyle='#c8c8d8'; g.fillRect(5,0,2,1); g.fillStyle='#d84848'; g.fillRect(3,10,2,1);
},12,12);
/* ============================================================
   EL MOLINO DE LA HOJARASCA: cuervos, caballeros de hoja, raíces
   agarradoras, el Espantapájaros, el Ciervo de Ámbar, el molinillo
   y la Hoja de Ámbar
   ============================================================ */
function mkArt(w,h,fn){ const c=mkCanvas(w,h); fn(c.getContext('2d')); return c; }
const CROW5=['#0e0c16','#1c1828','#302a44','#4a4266','#7a72a0'];
const AUT5B=['#4a1c0c','#8a3a14','#c86424','#eaa040','#fcd878'];
const BARK5=['#2a1808','#4a2c14','#6a4020','#8a5a30','#b07840'];
const DIRT5=['#2a1c10','#4a3420','#6a4a2c','#8a6a44','#a88a5e'];
function crowArt(pose){ return mkArt(16,16,g=>{
  if(pose===1){ artPix(g,["..kk......","..kwk.....","..kwwk....","...kwwkk..","....kwwwk."],{w:'#302a44'},3,2); }
  blobArt(g,0,0,16,16,[{x:3.2,y:11.4,r:2.8,ry:1.6},{x:7.2,y:10,r:4.6,ry:3.6},{x:10.8,y:6.6,r:3}],CROW5,{grad:.5});
  g.fillStyle=PAL.k; g.fillRect(13,5,2,3); g.fillRect(15,6,1,1); g.fillStyle='#f8b030'; g.fillRect(13,6,2,1); g.fillStyle='#c06810'; g.fillRect(13,7,1,1);
  g.fillStyle='#ffffff'; g.fillRect(11,5,1,1); g.fillStyle='#e83030'; g.fillRect(12,5,1,1);
  if(pose===0){ g.fillStyle='#0e0c16'; g.fillRect(4,9,5,1); g.fillRect(5,10,4,1); g.fillStyle='#7a72a0'; g.fillRect(6,8,2,1);
    g.fillStyle=PAL.k; g.fillRect(5,13,1,3); g.fillRect(8,13,1,3); g.fillStyle='#f8b030'; g.fillRect(4,15,2,1); g.fillRect(7,15,2,1); }
  if(pose===2){ artPix(g,["kwwwwk","kwwwk.","kwwk..",".kk..."],{w:'#302a44'},3,11); } });}
const CROW_A=crowArt(0), CROW_B=crowArt(1), CROW_C=crowArt(2);
function knightArt(step){ return mkArt(16,16,g=>{
  const lx=step?[4,10]:[5,9];
  for(const x of lx){ g.fillStyle=PAL.k; g.fillRect(x-1,11,4,5); g.fillStyle=BARK5[1]; g.fillRect(x,12,2,3); g.fillStyle=BARK5[0]; g.fillRect(x,14,3,1); }
  blobArt(g,0,0,16,16,[{x:8,y:10,r:4.2,ry:3.4}],BARK5,{grad:.4});
  blobArt(g,0,0,16,16,[{x:8,y:5.4,r:4,ry:3.6}],AUT5B,{grad:.5});
  g.fillStyle='#1a0c04'; g.fillRect(6,5,6,2); g.fillStyle='#ffe070'; g.fillRect(8,5,1,1); g.fillRect(10,5,1,1);
  g.fillStyle=PAL.k; g.fillRect(8,0,2,2); g.fillStyle='#c86424'; g.fillRect(8,1,1,1); g.fillStyle='#fcd878'; g.fillRect(9,1,1,1);
  g.fillStyle=BARK5[3]; g.fillRect(6,9,1,2); });}
const KNIGHT_A=knightArt(0), KNIGHT_B=knightArt(1);
const SHIELD_LEAF=mkArt(9,12,g=>{ blobArt(g,1,1,7,10,[{x:3.5,y:5,r:3.3,ry:4.8}],AUT5B,{grad:.3,dither:.6});
  g.fillStyle='#8a3a14'; g.fillRect(4,2,1,8); g.fillRect(3,4,1,1); g.fillRect(5,6,1,1); g.fillRect(3,7,1,1); g.fillStyle='#fff0c0'; g.fillRect(2,3,1,2); });
const ROOT_HIDE=mkArt(16,16,g=>{ blobArt(g,2,10,12,6,[{x:6,y:3,r:5.4,ry:2.4}],DIRT5,{grad:.4});
  g.fillStyle=PAL.k; g.fillRect(7,7,2,5); g.fillRect(5,6,3,3); g.fillRect(9,6,3,3); g.fillStyle='#2e8a34'; g.fillRect(7,8,1,4); g.fillStyle='#78d838'; g.fillRect(6,7,1,1); g.fillRect(10,7,1,1); g.fillStyle='#b0f068'; g.fillRect(5,7,1,1); g.fillRect(9,7,1,1); });
function rootArt(grab){ return mkArt(16,16,g=>{
  blobArt(g,1,11,14,5,[{x:7,y:2.5,r:6.4,ry:2.2}],DIRT5,{grad:.4});
  blobArt(g,0,0,16,16,[{x:8,y:10,r:3.2,ry:4.6},{x:8,y:5.5,r:3.6,ry:3}],BARK5,{grad:.5});
  const F=grab?[[4,4],[5,2],[8,1],[11,2],[12,4]]:[[3,2],[5,0],[8,0],[11,0],[13,2]];
  for(const [x,y] of F){ g.fillStyle=PAL.k; g.fillRect(x-1,y-1,3,4); g.fillStyle=BARK5[3]; g.fillRect(x,y,1,2); }
  g.fillStyle='#1a0c04'; g.fillRect(6,6,5,2); g.fillStyle='#b8ff60'; g.fillRect(6,6,1,1); g.fillRect(9,6,1,1);
  g.fillStyle=BARK5[1]; g.fillRect(7,9,1,3); g.fillRect(9,11,1,2); });}
const ROOT_UP=rootArt(false), ROOT_GRAB=rootArt(true);
/* EL ESPANTAPÁJAROS (24×24): sombrero de paja, saco cosido, abrigo remendado */
const SACK5=['#5a3a18','#8a6030','#b08850','#d0a868','#ecd098'];
const COAT5=['#1a2438','#2a3a5a','#44587e','#6a80a8','#98acd0'];
const SCARE_SPR=mkArt(24,24,g=>{
  g.fillStyle=PAL.k; g.fillRect(10,14,4,10); g.fillStyle='#6a4020'; g.fillRect(11,15,2,9); g.fillStyle='#8a5a30'; g.fillRect(11,15,1,9);
  g.fillStyle=PAL.k; g.fillRect(0,11,24,5); g.fillStyle=COAT5[2]; g.fillRect(1,12,22,3); g.fillStyle=COAT5[3]; g.fillRect(1,12,22,1); g.fillStyle=COAT5[1]; g.fillRect(1,14,22,1);
  g.fillStyle='#f0d870'; g.fillRect(0,12,1,3); g.fillRect(23,12,1,3); g.fillRect(0,15,2,1); g.fillRect(22,15,2,1);
  blobArt(g,0,0,24,24,[{x:12,y:16.5,r:6,ry:4.4}],COAT5,{grad:.4});
  g.fillStyle='#a04040'; g.fillRect(8,15,3,3); g.fillStyle='#d06060'; g.fillRect(8,15,3,1); g.fillStyle='#ecd098'; g.fillRect(9,16,1,1); g.fillRect(15,18,1,1); g.fillRect(16,17,1,1);
  g.fillStyle='#f0d870'; g.fillRect(11,12,2,2); g.fillRect(10,13,1,1); g.fillRect(13,13,1,1);
  blobArt(g,0,0,24,24,[{x:12,y:8.4,r:4.8,ry:4.2}],SACK5,{grad:.4,dither:.7});
  g.fillStyle='#1a0c04'; g.fillRect(9,8,2,2); g.fillRect(13,8,2,2); g.fillStyle='#ffffff'; g.fillRect(10,8,1,1); g.fillRect(14,8,1,1);
  g.fillStyle='#3a2410'; for(let x=9;x<=15;x+=2) g.fillRect(x,11,1,1); g.fillRect(9,10,7,1);
  g.fillStyle=PAL.k; g.fillRect(4,3,16,3); g.fillStyle='#e0c060'; g.fillRect(5,4,14,1); g.fillStyle='#b08830'; g.fillRect(5,5,14,1);
  blobArt(g,0,0,24,24,[{x:12,y:2.6,r:3.6,ry:2.4}],['#6a4a10','#a07820','#d0a838','#e8c860','#fff0a0'],{grad:.3});
  g.fillStyle='#a04040'; g.fillRect(9,3,7,1); g.fillStyle='#2a2438'; g.fillRect(17,0,1,4); g.fillRect(18,1,1,2); });
/* EL CIERVO DE ÁMBAR (32×32), de perfil hacia la derecha; con y sin manto de hojarasca */
const DEER5=['#4a2410','#7a4020','#a86a38','#d0985a','#f0c890'];
const AMBER5=['#6a3a08','#b86a10','#e89a20','#f8c848','#fff0a0'];
function ciervoArt(mantle){ return mkArt(32,32,g=>{
  for(const [x,off] of [[9,1],[13,0],[20,0],[24,1]]){ g.fillStyle=PAL.k; g.fillRect(x-1,21+off,4,11-off); g.fillStyle=DEER5[1]; g.fillRect(x,22+off,2,8-off); g.fillStyle='#2a1408'; g.fillRect(x,30,2,1); }
  blobArt(g,0,0,32,32,[{x:5.5,y:15.5,r:2.2,ry:1.8},{x:15,y:19,r:10,ry:5.6},{x:23,y:14.5,r:4.4,ry:6},{x:26.2,y:9.2,r:3.8,ry:3.4},{x:29.2,y:11.2,r:2.2,ry:1.8}],DEER5,{grad:.5});
  g.fillStyle=DEER5[4]; g.fillRect(12,22,9,1); g.fillRect(22,17,3,2); g.fillStyle='#ffffff'; g.fillRect(4,14,2,2);
  g.fillStyle='#1a0c04'; g.fillRect(27,8,2,1); g.fillStyle='#ffffff'; g.fillRect(28,8,1,1); g.fillStyle=PAL.k; g.fillRect(31,11,1,1);
  g.fillStyle=PAL.k; g.fillRect(22,5,3,3); g.fillStyle=DEER5[2]; g.fillRect(23,6,1,1);
  const A=[[25,5,23,2],[23,2,21,0],[23,2,25,0],[27,5,29,2],[29,2,31,1],[29,2,28,0],[24,4,20,3],[28,4,31,4]];
  for(const [x0,y0,x1,y1] of A){ const n=Math.max(Math.abs(x1-x0),Math.abs(y1-y0)); for(let i=0;i<=n;i++){ const x=Math.round(x0+(x1-x0)*i/n), y=Math.round(y0+(y1-y0)*i/n); g.fillStyle=PAL.k; g.fillRect(x-1,y-1,3,3); } }
  for(const [x0,y0,x1,y1] of A){ const n=Math.max(Math.abs(x1-x0),Math.abs(y1-y0)); for(let i=0;i<=n;i++){ const x=Math.round(x0+(x1-x0)*i/n), y=Math.round(y0+(y1-y0)*i/n); g.fillStyle='#6a4a2a'; g.fillRect(x,y,1,1); } }
  for(const [x,y] of [[21,0],[25,0],[31,1],[28,0],[20,3]]){ g.fillStyle=mantle?'#c86424':'#f8c848'; g.fillRect(x,y,1,1); g.fillStyle=mantle?'#eaa040':'#fff0a0'; if(x+1<32) g.fillRect(x+1,y,1,1); }
  if(mantle){ blobArt(g,0,0,32,32,[{x:10,y:15.5,r:5.2,ry:4.4},{x:16,y:13.6,r:5.6,ry:4.6},{x:21,y:13.2,r:4.2,ry:3.8},{x:13,y:18.6,r:4.4,ry:3.2}],AUT5B,{grad:.5,dither:.8});
    for(let i=0;i<10;i++){ const h=hash(i*7+3,31), x=6+(h%18), y=10+((h>>5)%10); g.fillStyle=AUT5B[2+((h>>9)%3)]; g.fillRect(x,y,2,1); g.fillStyle=AUT5B[0]; g.fillRect(x,y+1,1,1); } }
  else { g.fillStyle='rgba(252,216,120,.5)'; g.fillRect(21,1,2,2); g.fillRect(28,1,2,2); } });}
const CIERVO_SPR=ciervoArt(true), CIERVO_BARE=ciervoArt(false), CIERVO_BARE_W=whiten(ciervoArt(false));
BOSS_SPR.scare=SCARE_SPR; BOSS_WHITE.scare=whiten(SCARE_SPR); BOSS_SPR.ciervo=CIERVO_SPR; BOSS_WHITE.ciervo=whiten(CIERVO_SPR);
PORTRAITS['EL CIERVO']=CIERVO_BARE; // en su retrato, ya sin el manto: el Ciervo que habla es el que se ha tumbado en paz
PORTRAITS['EL CIERVO']=CIERVO_BARE;
/* el MOLINILLO (objeto X) y la HOJA DE ÁMBAR (reliquia del Otoño) */
/* la cabeza del molinillo, píxel a píxel: cuatro aspas de papel plegado (cara clara, pliegue oscuro y el canto que brilla),
   las mismas que en su cinemática (15e). rot en radianes: gira (tiene simetría de 90°) */
const PIN_C4=[['#a01c2c','#e84050','#ffb4b4'],['#c08a08','#f4cc38','#fff4b8'],['#1e62ac','#58a0e8','#c4e4ff'],['#2a8030','#68c050','#c8f0a0']];
function pinwheelHead(g,cx,cy,R,rot){
  for(let y=Math.floor(cy-R-1);y<=cy+R+1;y++) for(let x=Math.floor(cx-R-1);x<=cx+R+1;x++){ const dx=x+.5-cx, dy=y+.5-cy, r=Math.hypot(dx,dy); if(r>R||r<.9) continue;
    const a=((Math.atan2(dy,dx)-rot)%6.2832+12.5664)%6.2832, q=Math.floor(a/1.5708)&3, f=(a%1.5708)/1.5708;
    if(r>R*(1-f*.58)) continue; const C=PIN_C4[q];
    g.fillStyle=(f<.1&&r>R*.3)?C[2]:f<.46?C[1]:C[0]; g.fillRect(x,y,1,1); } }
function pinwheelPin(g,x,y){ g.fillStyle='#fff4dc'; g.fillRect(x,y,2,2); g.fillStyle='#8a6a48'; g.fillRect(x+1,y+1,1,1); }
const PINWHEEL_SPR=mkArt(16,16,g=>{ // el objeto: la cabeza arriba y el palo de madera
  g.fillStyle='#6a4020'; g.fillRect(7,9,2,6); g.fillStyle='#b88048'; g.fillRect(7,9,1,6); g.fillStyle='#e0b070'; g.fillRect(7,10,1,2);
  pinwheelHead(g,8,6.5,6.3,.35); pinwheelPin(g,7,6); artOutline(g,16,16); });
/* girando en la mano de Sprout: 6 fotogramas (90° de vuelta) de la cabeza sola, con contorno */
const PIN_SPIN=Array.from({length:6},(_,i)=>mkArt(15,15,g=>{ pinwheelHead(g,7.5,7.5,6,i/6*1.5708+.35); pinwheelPin(g,7,7); artOutline(g,15,15); }));
const AMBER_SPR=mkArt(16,16,g=>{
  g.fillStyle=PAL.k; g.fillRect(7,11,3,5); g.fillStyle=AMBER5[0]; g.fillRect(8,12,1,4);
  blobArt(g,0,0,16,16,[{x:8,y:5.6,r:3.8,ry:4},{x:4,y:7.8,r:3,ry:2.6},{x:12,y:7.8,r:3,ry:2.6},{x:8,y:9.6,r:3.2,ry:2.4}],AMBER5,{grad:.5,dither:.6});
  g.fillStyle=AMBER5[1]; g.fillRect(8,3,1,8); g.fillRect(5,7,3,1); g.fillRect(9,7,3,1); g.fillRect(6,9,2,1); g.fillRect(9,9,2,1);
  g.fillStyle='#ffffff'; g.fillRect(6,4,1,2); g.fillRect(5,6,1,1); });
