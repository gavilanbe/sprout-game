'use strict';
/* ---------- RENDER ---------- */
function drawSword(){ // barrido en arco con la Hoja, estilo Zelda
  if(player.atk<=0) return;
  const ph=14-player.atk;
  const base=[Math.PI/2,-Math.PI/2,Math.PI,0][player.dir];
  const sweep=[-1.1,-0.55,0,0.18,0.18,0.1,0][Math.min(6,ph>>1)];
  ctx.save();
  ctx.translate(player.x+8,player.y+9);
  ctx.rotate(base+sweep);
  ctx.drawImage(LEAF_SWING,2,-8);
  ctx.restore();
}
function drawPlayer(){
  if(state==='dying'){ // se dobla y se hunde
    const k=1-deathT/70;
    ctx.save(); ctx.translate(player.x+8,player.y+15);
    ctx.rotate(k*0.6); ctx.translate(0,k*2);
    ctx.globalAlpha=Math.max(.25,1-k*.7);
    ctx.drawImage(deathT<35?SPROUT_WILT:P_SPRITES[player.dir][0],-8,-15);
    ctx.globalAlpha=1; ctx.restore();
    return;
  }
  if(inBed){ // plantado en la maceta: dormido o recién despierto
    ctx.drawImage(wakeT>25?SPROUT_SLEEP:SPROUT_WAKE,(player.x+4)|0,(player.y+2)|0);
    return;
  }
  if(sproutT>0){ // rebrote: la semilla germina y se yergue
    const k=sproutT/24;
    ctx.drawImage(k>.5?SEEDLING_SPR:P_SPRITES[0][0],player.x|0,(player.y+(k*6|0))|0);
    if((tick&3)===0) parts.push({x:player.x+8,y:player.y+12,vx:(Math.random()-.5)*.5,vy:-.4,life:14,col:'#9ed86a'});
    return;
  }
  if(player.inv>0&&(tick&3)<2&&state==='play') return; // parpadeo
  if(player.charge>=36){ // hoja cargada: halo verde que pulsa
    ctx.fillStyle='rgba(112,216,56,'+(0.22+0.14*Math.sin(tick*.4)).toFixed(2)+')';
    ctx.beginPath(); ctx.arc(player.x+8,player.y+10,12,0,6.28); ctx.fill();
  }
  if(player.dir===1) drawSword(); // espada detrás al mirar arriba
  const s=P_SPRITES[player.dir][player.frame];
  ctx.drawImage(s,player.x|0,player.y|0);
  if(player.dir!==1) drawSword();
  if(player.spin>0){ // REMOLINO: la hoja da la vuelta completa
    const a=(1-player.spin/18)*6.283+[Math.PI/2,-Math.PI/2,Math.PI,0][player.dir];
    ctx.save(); ctx.translate(player.x+8,player.y+9); ctx.rotate(a);
    ctx.drawImage(LEAF_SWING,2,-8); ctx.restore();
  }
}
function drawEnemy(e){
  const flash=e.flash>4;
  // tipos antiguos (los curtidos se distinguen por el color)
  if(e.type==='blob'||e.type==='bat'){
    const img=flash?(e.type==='blob'?BLOB_WHITE:BAT_WHITE)
                   :(e.type==='blob'?(e.fast?BLOB_FAST:BLOB):(e.fast?BAT_FAST:BAT));
    const sq=e.type==='blob' ? Math.sin(tick*.12+e.x)*0.12 : Math.sin(tick*.3+e.x)*0.18;
    ctx.save(); ctx.translate((e.x|0)+8,(e.y|0)+16); ctx.scale(1+sq,1-sq);
    ctx.drawImage(img,-8,-16); ctx.restore(); return;
  }
  if(e.type==='squirrel'){ // la ardilla mira hacia donde corre
    const S=E_SPR.squirrel;
    const toward = e.st==='dash' ? Math.sign(player.x-e.x) : (e.st==='flee' ? e.fx : Math.sign(e.vx||1));
    const img=flash?S.w:(toward>0?S.b:S.a);
    const hop=(e.st==='wander')?0:((tick&4)?-1:0);
    ctx.drawImage(img,e.x|0,(e.y|0)+hop); return;
  }
  if(e.type==='gust'){ // remolino: anillos girando, sin sprite fijo
    ctx.save(); ctx.translate((e.x|0)+8,(e.y|0)+8);
    for(let r=0;r<3;r++){ ctx.strokeStyle=r%2?'#cfe8ff':'#9ec7e8'; ctx.globalAlpha=.7-r*.18;
      ctx.beginPath(); ctx.arc(0,0,3+r*3,tick*.2+r,tick*.2+r+4.2); ctx.stroke(); }
    ctx.globalAlpha=1; ctx.restore(); return;
  }
  const S=E_SPR[e.type]; if(!S){ return; } // tipo sin sprite: no dibujar (evita cuelgues)
  let img=flash?S.w:S.a;
  if(e.type==='beetle'){ img=flash?S.w:(e.dir<0?S.b:S.a); }
  else if(e.type==='roller'){
    const rolling=e.st==='roll';
    img=flash?(rolling?S.wball:S.w):(rolling?S.ball:S.a);
    if(rolling){ ctx.save(); ctx.translate((e.x|0)+8,(e.y|0)+8);
      ctx.rotate((tick*0.5)%(Math.PI*2)); ctx.drawImage(img,-8,-8); ctx.restore(); return; }
  }
  else if(e.type==='ghost'){
    ctx.globalAlpha = e.phase>=110 ? 0.28 : 0.82;
    ctx.drawImage(img,(e.x|0),(e.y|0)+(Math.sin(tick*.1+e.x)*1.5|0));
    ctx.globalAlpha=1; return;
  }
  else if(e.type==='frog'){ img=flash?(e.st==='jump'?S.wjump:S.w):(e.st==='jump'?S.jump:S.a); }
  else if(e.type==='thorn'){ img=flash?(e.st==='open'?S.wopen:S.w):(e.st==='open'?S.open:S.a); }
  ctx.drawImage(img,(e.x|0),(e.y|0));
}
function drawUI(){
  ctx.fillStyle=C.ui; ctx.fillRect(0,PLAY_H,VW,16);
  ctx.fillStyle='#243424'; ctx.fillRect(0,PLAY_H,VW,1);
  for(let i=0;i<player.maxHp/2;i++){
    const v=player.hp-i*2;
    ctx.drawImage(v>=2?HEART_FULL:v===1?HEART_HALF:HEART_EMPTY,4+i*9,PLAY_H+4);
  }
  ctx.fillStyle=C.uiText; ctx.font='8px "Press Start 2P"'; ctx.textBaseline='top';
  ctx.drawImage(BERRY_SPR,82,PLAY_H+4);
  ctx.fillText('x'+berries,92,PLAY_H+4);
  if(!won){ // las semillas importan hasta entregarlas...
    ctx.drawImage(ACORN,120,PLAY_H+4);
    ctx.fillText('x'+seeds,131,PLAY_H+4);
  } else if(hasBomb){ // ...luego ese hueco recuerda que X planta bombas
    ctx.fillText('X',118,PLAY_H+4);
    ctx.drawImage(BOMB_SPR,0,0,16,16,128,PLAY_H+2,12,12);
  }
}
/* parte el texto en líneas de ≤maxc columnas, respetando los \n del guion:
   ningún diálogo vuelve a salirse de su caja */
function wrapText(s,maxc){
  const out=[];
  for(const raw of s.split('\n')){
    let ln=raw;
    while(ln.length>maxc){
      let cut=ln.lastIndexOf(' ',maxc);
      if(cut<1) cut=maxc;
      out.push(ln.slice(0,cut));
      ln=ln.slice(cut).replace(/^ /,'');
    }
    out.push(ln);
  }
  return out;
}
function drawDialog(){
  const full=dlg.pages[dlg.page];      // ya viene paginado a ≤3 líneas (paginate)
  const lines=full.split('\n');
  const x=4, w=152, h=46;              // caja FIJA, tamaño de siempre
  const y=(player.y+8>56)?6:78;        // arriba si Sprout anda por abajo: nunca lo tapa
  ctx.fillStyle=PAL.k; ctx.fillRect(x-1,y-1,w+2,h+2);
  ctx.fillStyle='#183020'; ctx.fillRect(x,y,w,h);
  ctx.strokeStyle=C.uiText; ctx.lineWidth=1; ctx.strokeRect(x+1.5,y+1.5,w-3,h-3);
  ctx.font='8px "Press Start 2P"'; ctx.textBaseline='top';
  const por=dlg.who&&PORTRAITS[dlg.who];
  if(por){ // retrato a lo Golden Sun: el hablante, en grande, en su marquito
    ctx.fillStyle=PAL.k; ctx.fillRect(x+3,y+4,38,38);
    ctx.fillStyle='#0e2014'; ctx.fillRect(x+4,y+5,36,36);
    ctx.drawImage(por,0,0,16,16,x+6,y+7,32,32);
    ctx.strokeStyle=C.flowerC; ctx.strokeRect(x+3.5,y+4.5,37,37);
  }
  if(dlg.who){ // quién habla, en su cartelita (debajo si la caja está arriba)
    const nw=dlg.who.length*8+8, py=(y===78)?y-10:y+h+1;
    ctx.fillStyle=PAL.k; ctx.fillRect(x+3,py,nw+2,12);
    ctx.fillStyle='#0e2014'; ctx.fillRect(x+4,py+1,nw,10);
    ctx.fillStyle=C.flowerC; ctx.fillText(dlg.who,x+8,py+2);
  }
  const tx0=por?x+46:x+6;
  ctx.fillStyle=C.uiText;
  let budget=dlg.chars|0; // el tecleo recorre las líneas ya envueltas
  lines.forEach((ln,i)=>{
    if(budget<=0) return;
    ctx.fillText(ln.slice(0,budget),tx0,y+7+i*12);
    budget-=ln.length+1;
  });
  if((dlg.chars|0)>=full.length){
    if(dlg.ask&&dlg.page===dlg.pages.length-1){ // pregunta: elige
      ctx.fillStyle=C.flowerC; ctx.fillText('Z:sí  X:no',x+w-86,y+h-10);
    } else if((tick&31)<20){
      ctx.fillStyle=C.uiText; ctx.fillText('▼',x+w-14,y+h-11);
    }
  }
}
/* el GRAN ROBLE del pueblo: el corazón del lore, y un marcador vivo de tu progreso.
   Apagado al empezar; tus 8 semillas cuelgan de su copa al entregarlas;
   florece con la primavera, brilla en verano y respira al cerrar el ciclo. */
function drawGreatOak(ox,oy){
  ctx.drawImage(OAK_GRAND,ox,oy);
  if(!won){ ctx.globalAlpha=.42; ctx.drawImage(OAK_GRAND_DARK,ox,oy); ctx.globalAlpha=1; }
  else { // tus 8 semillas doradas, de vuelta en la copa
    const pts=[[20,22],[48,14],[62,28],[30,34],[12,28],[40,24],[56,38],[28,8]];
    pts.forEach(([ax,ay],i)=>{
      const tw=(((tick>>4)+i)&7)===0; // una de ellas guiña de vez en cuando
      ctx.fillStyle=tw?'#ffe9a0':PAL.a; ctx.fillRect(ox+ax,oy+ay,2,2);
      ctx.fillStyle=PAL.A; ctx.fillRect(ox+ax,oy+ay-1,2,1);
    });
  }
  if(thawed){ ctx.fillStyle='#f8c8e0'; // brotes de flor: la primavera volvió
    [[8,20],[58,10],[70,34],[36,4],[16,38],[48,30],[26,16],[64,20]].forEach(([bx,by])=>ctx.fillRect(ox+bx,oy+by,1,1)); }
  if(summered){ ctx.fillStyle='#fff7c0'; // luciérnagas de verano en la copa
    [[28,30],[54,22],[40,42],[14,14],[66,26]].forEach(([bx,by],i)=>{
      if((((tick>>4)+i*2)&7)<3) ctx.fillRect(ox+bx,oy+by,1,1); }); }
  if(cycled){ // el ciclo gira: el Roble respira luz
    ctx.fillStyle='rgba(168,236,120,'+(0.07+0.05*Math.sin(tick*.06)).toFixed(2)+')';
    ctx.beginPath(); ctx.arc(ox+42,oy+24,40,0,6.29); ctx.fill();
  }
  if((tick%70)===0) parts.push({x:ox+10+Math.random()*64,y:oy+30+Math.random()*10, // hojitas de la copa
    vx:(Math.random()-.5)*.3,vy:.3,life:46,col:(tick&1)?C.canopyL:PAL.l});
}
function drawScene(){
  renderScreenTo(ctx,grid,0,0);
  if(sx===1&&sy===1){
    drawGreatOak(37,-2); // majestuoso, en el corazón de la plaza
    // las reliquias entregadas reposan en sus altares
    if(thawed){ ctx.drawImage(EMBER_SPR,32,38);
      if((tick&15)===0) parts.push({x:40,y:44,vx:0,vy:-.3,life:12,col:'#f8a030'}); }
    if(summered){ ctx.drawImage(TEAR_SPR,112,38);
      if((tick&15)===7) parts.push({x:120,y:44,vx:0,vy:-.3,life:12,col:'#78c8f8'}); }
    if(cycled){ ctx.drawImage(FLAKE_SPR,48,86);
      if((tick&15)===11) parts.push({x:56,y:92,vx:0,vy:-.3,life:12,col:'#dff0ff'}); }
    if(cycled){ // las 8 hermanas germinaron alrededor de su Roble
      [[26,70],[40,78],[58,70],[74,78],[90,70],[106,78],[26,86],[106,86]].forEach(([gx,gy],i)=>{
        const bob=Math.sin(tick*.05+i*1.3)>0?0:1;
        ctx.drawImage(SEEDLING_SPR,gx,gy+bob);
        if(((tick+i*9)%140)===0) parts.push({x:gx+8,y:gy+9,vx:0,vy:-.25,life:16,col:PAL.l});
      });
    }
  }
  // semillas y corazones
  const ITEM_SPRS={blade:BLADE_SPR,bomb:BOMB_SPR,ember:EMBER_SPR,hook:HOOK_SPR,tear:TEAR_SPR,flake:FLAKE_SPR};
  for(const p of pickups){
    if(ITEM_SPRS[p.kind]){
      ctx.drawImage(ITEM_SPRS[p.kind],p.x|0,p.y|0);
      if((tick&7)===0) parts.push({x:p.x+4+Math.random()*8,y:p.y+2+Math.random()*8,vx:0,vy:-.35,life:14,col:p.kind==='ember'?'#f8a030':C.flowerC});
      continue;
    }
    const bob=Math.sin((tick+p.t)*.1)*1.5|0;
    if(p.kind==='container'){ ctx.drawImage(HEART_FULL,(p.x-4)|0,(p.y+bob-4)|0,16,16); continue; }
    if(p.kind==='diary'){ ctx.drawImage(DIARY_SPR,p.x|0,(p.y+bob)|0);
      if((tick&15)===0) parts.push({x:p.x+4,y:p.y+bob,vx:0,vy:-.3,life:10,col:'#e8d0a0'});
      continue; }
    if(p.kind==='key'){ ctx.drawImage(ACORN,p.x|0,(p.y+bob)|0);
      if((tick&7)===0) parts.push({x:p.x+4,y:p.y+bob,vx:0,vy:-.3,life:10,col:PAL.a});
      continue; }
    ctx.drawImage(p.kind==='seed'?ACORN:p.kind==='berry'?BERRY_SPR:HEART_FULL,p.x|0,(p.y+bob)|0);
    if(p.kind==='seed'&&(tick&15)===0) parts.push({x:p.x+4,y:p.y+bob,vx:0,vy:-.3,life:10,col:C.flowerC});
  }
  for(const b of bombs){ // bellotas con mecha
    const pulse=b.t<25&&(tick&3)<2;
    ctx.drawImage(ACORN,b.x+4,b.y+4+(pulse?-1:0));
  }
  if(elderPos){
    const sway=Math.sin(tick*.04)>0?0:1;
    ctx.drawImage(ELDER,elderPos[0]*16,elderPos[1]*16+sway+1);
    if((tick%85)===0) parts.push({x:elderPos[0]*16+14,y:elderPos[1]*16+4, // su bastón brota
      vx:(Math.random()-.5)*.2,vy:-.25,life:22,col:PAL.l});
  }
  for(const n of npcs){
    const sway=Math.sin(tick*.05+n.x)>0?0:1;
    ctx.drawImage(NPCS[n.ch].img,n.x*16,n.y*16+sway);
  }
  if(giveFx&&giveFx.t>0){ // la ofrenda vuela en arco hasta el anciano
    for(let i=0;i<Math.min(giveFx.n,8);i++){
      const dx=Math.sin(i*2.4+tick*.18)*3, dy=-i*3;
      ctx.drawImage(giveFx.spr,(giveFx.x+dx)|0,(giveFx.y+dy)|0);
    }
  }
  if(boss&&boss.type==='topo'){
    if(boss.st==='burrow'||boss.st==='warn'){ // montículo
      const wob=boss.st==='warn'?(tick&2)-1:0;
      ctx.fillStyle=PAL.k; ctx.fillRect(boss.mx+2+wob,boss.my+10,12,5);
      ctx.fillStyle='#6e5a4c'; ctx.fillRect(boss.mx+3+wob,boss.my+11,10,3);
      ctx.fillStyle='#8a7460'; ctx.fillRect(boss.mx+5+wob,boss.my+11,4,1);
    } else {
      if(boss.st==='yield'){ // tregua: halo que invita a acercarse
        ctx.fillStyle='rgba(120,232,120,'+(0.22+0.16*Math.sin(tick*.3))+')';
        ctx.beginPath(); ctx.arc(boss.x+8,boss.y+8,16,0,6.28); ctx.fill();
      }
      const img=boss.flash>5?TOPO_WHITE:TOPO_SPR;
      const sq=Math.sin(tick*.2)*.08, S=1.5; // un rey se ve desde lejos
      const tr=boss.st==='yield'?((tick&2)?.5:-.5):0;
      ctx.save(); ctx.translate(boss.x+8+tr,boss.y+13); ctx.scale((1+sq)*S,(1-sq)*S);
      ctx.drawImage(img,-8,-13); ctx.restore();
    }
  }
  if(boss&&boss.type==='avispa'){
    const grounded=boss.st==='tired'||boss.st==='yield';
    if(boss.st==='yield'){
      ctx.fillStyle='rgba(120,232,120,'+(0.22+0.16*Math.sin(tick*.3))+')';
      ctx.beginPath(); ctx.arc(boss.x+8,boss.y+8,16,0,6.28); ctx.fill();
    }
    const img=boss.flash>5?WASP_WHITE:WASP_SPR;
    const flap=grounded?0:Math.sin(tick*.6)*.18, S=1.5;
    ctx.save(); ctx.translate(boss.x+8,boss.y+8);
    if(grounded) ctx.rotate(boss.st==='yield'?.2:.35);
    ctx.scale((1+flap)*S,(1-flap)*S);
    ctx.drawImage(img,-8,-8); ctx.restore();
    if(!grounded){ // sombra en el suelo
      ctx.fillStyle='rgba(10,10,20,.35)'; ctx.fillRect((boss.x+2)|0,104,12,3);
    }
  }
  if(boss&&boss.type==='viento'){
    const resting=boss.st==='rest';
    if(resting){ // ¡VULNERABLE! halo que pulsa para invitar a golpear
      ctx.fillStyle='rgba(120,232,120,'+(0.25+0.2*Math.sin(tick*.3))+')';
      ctx.beginPath(); ctx.arc(boss.x+8,boss.y+8,20,0,6.28); ctx.fill();
    }
    const img=boss.flash>5?WIND_WHITE:WIND_SPR;
    const sweeping=boss.st==='sweep', S=2; // el hermano del Roble, a su escala
    ctx.save(); ctx.translate(boss.x+8,boss.y+8);
    if(sweeping) ctx.scale(1.3*S,0.8*S);
    else if(resting){ const g=Math.sin(tick*.4)*.05; ctx.scale((1+g)*S,(1-g)*S); } // jadea
    else { const w=Math.sin(tick*.18)*.12; ctx.scale((1+w)*S,(1-w)*S); }
    ctx.globalAlpha=boss.st==='float'?0.6:1; // translúcido = intocable; sólido = tocable
    ctx.drawImage(img,-8,-8); ctx.globalAlpha=1; ctx.restore();
    if(boss.st==='aim'){ // marca la línea del barrido
      ctx.fillStyle='rgba(232,80,80,'+(0.25+0.2*Math.sin(tick*.4))+')';
      ctx.fillRect(0,(boss.row+6)|0,160,4);
    }
    if(resting&&boss.hp<=2&&(tick&31)<20){ // exhausto: invita a hablarle
      ctx.font='8px "Press Start 2P"'; ctx.fillStyle='#fff';
      ctx.fillText('Z',(boss.x+6)|0,(boss.y-22)|0);
    }
  }
  if(boss&&boss.st==='yield'&&(tick&31)<20){ // la tregua se señala igual que con el Viento
    ctx.font='8px "Press Start 2P"'; ctx.fillStyle='#fff';
    ctx.fillText('Z',(boss.x+6)|0,(boss.y-18)|0);
  }
  if(state==='hook'&&hook){ // la liana
    const x0=hook.fx+8, y0=hook.fy+12, x1=player.x+8, y1=player.y+12;
    const segs=Math.max(2,(Math.hypot(x1-x0,y1-y0)/5)|0);
    for(let i=0;i<=segs;i++){
      ctx.fillStyle=i%2?PAL.l:PAL.d;
      ctx.fillRect((x0+(x1-x0)*i/segs-1)|0,(y0+(y1-y0)*i/segs-1)|0,2,2);
    }
  }
  for(const p of projs){ // rocas
    ctx.fillStyle=PAL.k; ctx.fillRect((p.x-3)|0,(p.y-3)|0,6,6);
    ctx.fillStyle='#b0a890'; ctx.fillRect((p.x-2)|0,(p.y-2)|0,4,4);
  }
  for(const w of windProjs){ // tornadito: embudo pixelado que gira
    const px=w.x|0, py=w.y|0;
    const rows=[[5,'#70d838'],[8,'#dff0ff'],[11,'#a8ec78']]; // de la punta a la boca
    rows.forEach(([wd,col],i)=>{ const off=(Math.sin(w.ang*2+i*1.7)*2)|0, y=py+4-i*4;
      ctx.fillStyle=PAL.k; ctx.fillRect(px-(wd>>1)+off-1,y-1,wd+2,5); });
    rows.forEach(([wd,col],i)=>{ const off=(Math.sin(w.ang*2+i*1.7)*2)|0, y=py+4-i*4;
      ctx.fillStyle=col; ctx.fillRect(px-(wd>>1)+off,y,wd,3);
      ctx.fillStyle='#ffffff'; ctx.fillRect(px-(wd>>1)+off+1+((w.ang*4|0)%Math.max(1,wd-3)),y+1,2,1); });
  }
  for(const e of enemies) drawEnemy(e);
  drawPlayer();
  for(const p of parts){ ctx.fillStyle=p.col; ctx.fillRect(p.x|0,p.y|0,p.life>8?2:1,p.life>8?2:1); }
  drawDark();
  if(boss){ // vida del jefe
    ctx.fillStyle=PAL.k; ctx.fillRect(39,3,82,8);
    ctx.fillStyle='#5a1818'; ctx.fillRect(40,4,80,6);
    ctx.fillStyle='#e84848'; ctx.fillRect(41,5,Math.max(0,boss.hp*78/(boss.maxHp||8)),4);
  }
}
let darkCv=null;
function drawDark(){
  if(!((sx>=6&&sx<=7)||(sx>=10&&sx<=11))) return; // oscuridad solo en mazmorras
  if(!darkCv){ darkCv=document.createElement('canvas'); darkCv.width=160; darkCv.height=128; }
  const g=darkCv.getContext('2d');
  g.globalCompositeOperation='source-over';
  g.clearRect(0,0,160,128);
  g.fillStyle='rgba(4,4,12,0.93)'; g.fillRect(0,0,160,128);
  g.globalCompositeOperation='destination-out';
  const hole=(cx,cy,r)=>{
    const gr=g.createRadialGradient(cx,cy,r*.25,cx,cy,r);
    gr.addColorStop(0,'rgba(0,0,0,1)'); gr.addColorStop(1,'rgba(0,0,0,0)');
    g.fillStyle=gr; g.fillRect(cx-r,cy-r,r*2,r*2);
  };
  hole(player.x+8,player.y+8,(sy===2?64:46)+Math.sin(tick*.2)*2);
  if(boss) hole(boss.x+8,boss.y+8,30);
  for(const b of bombs) hole(b.x+8,b.y+8,18+(tick&3));
  for(const p of pickups) if(p.kind==='ember'||p.kind==='bomb'||p.kind==='flake') hole(p.x+8,p.y+8,26);
  ctx.drawImage(darkCv,0,0);
}
function drawCine(){
  ctx.fillStyle='#060c07'; ctx.fillRect(0,0,VW,VH);
  for(const p of parts){ ctx.fillStyle=p.col; ctx.fillRect(p.x|0,p.y|0,2,1); }
  // la hoja-pergamino: se dobla por la vena central al pasar de página
  // k: 0 = abierta, 1 = plegada del todo (a mitad del pliegue cambia el texto)
  const k = cineFold>0 ? (cineFold>12 ? (24-cineFold)/12 : cineFold/12) : 0;
  const folding=cineFold>12;
  const cx=80, cy=72;
  // sombra de la hoja en el suelo (se encoge al plegarse)
  ctx.fillStyle='rgba(0,0,0,.35)';
  ctx.fillRect((cx-73*(1-k*.5))|0,128,(146*(1-k*.5))|0,3);
  ctx.save();
  ctx.translate(cx,cy);
  ctx.rotate(0.10*k*(folding?1:-1));               // se ladea al doblarse
  const sy=Math.max(0.06,1-0.94*(k*k*(3-2*k)));    // pliegue suave por la vena
  ctx.scale(1-0.05*k, sy);
  // un mecido vivo, como sostenida por la brisa
  if(cineFold===0) ctx.rotate(Math.sin(tick*.02)*0.012);
  ctx.drawImage(LEAF_PAGE,-(LEAF_PAGE.width>>1),-(LEAF_PAGE.height>>1));
  // el texto vive EN la hoja: se dobla con ella
  if(k<0.9){
    ctx.font='8px "Press Start 2P"'; ctx.textAlign='center'; ctx.textBaseline='top';
    ctx.globalAlpha=1-k*.7;
    ctx.fillStyle='#4a4418'; // tinta parda sobre la hoja curada
    const lines=CINE[cinePage].slice(0,cineChars|0).split('\n');
    const y0=-(lines.length*13>>1)+2;
    lines.forEach((ln,i)=>ctx.fillText(ln,0,y0+i*13));
    ctx.globalAlpha=1;
  }
  ctx.restore();
  if(cineFold===0&&(cineChars|0)>=CINE[cinePage].length&&(tick&31)<20){
    ctx.font='8px "Press Start 2P"'; ctx.textAlign='center'; ctx.textBaseline='top';
    ctx.fillStyle='#9ed86a'; ctx.fillText('Z',80,130);
  }
  ctx.textAlign='left';
}
function drawCloud(x,y,s){ // nube esponjosa
  const w=20+s*8;
  ctx.fillStyle='#ffffff';
  ctx.fillRect(x+3,y-2,6,2); ctx.fillRect(x+10,y-3,7,3);
  ctx.fillRect(x+1,y,w-2,3); ctx.fillRect(x,y+2,w,3);
  ctx.fillStyle='#c8d8e8'; ctx.fillRect(x+1,y+5,w-2,1);
}
function drawTitleBg(){ // paisaje del valle: cielo, sol, nubes, montañas, pinar, pradera y el Gran Roble
  ctx.fillStyle='#5088dc'; ctx.fillRect(0,0,160,16);
  ctx.fillStyle='#68a8e8'; ctx.fillRect(0,16,160,14);
  ctx.fillStyle='#86c0f0'; ctx.fillRect(0,30,160,26);
  ctx.fillStyle='#aadcf8'; ctx.fillRect(0,56,160,24);
  // sol cálido arriba a la izquierda (las nubes pasan por delante)
  for(let dy=-6;dy<=6;dy++){ const w=Math.floor(Math.sqrt(36-dy*dy));
    ctx.fillStyle='#f8e8a0'; ctx.fillRect(20-w,12+dy,w*2+1,1); }
  for(let dy=-4;dy<=4;dy++){ const w=Math.floor(Math.sqrt(16-dy*dy));
    ctx.fillStyle='#f8d060'; ctx.fillRect(20-w,12+dy,w*2+1,1); }
  // nubes a la deriva (parallax)
  drawCloud((((tick*.10)|0)%200)-40,8,1);
  drawCloud((((tick*.06)|0)+90)%210-40,18,0);
  drawCloud((((tick*.08)|0)+150)%220-50,50,2);
  // pájaros lejanos
  for(let i=0;i<3;i++){
    const bx=((tick*.22+i*61)|0)%195-15, by=14+(i*17)%26+((Math.sin(tick*.04+i*2)*2)|0);
    const fl=((tick>>3)+i)&1;
    ctx.fillStyle='#3a5a78';
    ctx.fillRect(bx,by+(fl?1:0),2,1); ctx.fillRect(bx+2,by,1,1); ctx.fillRect(bx+3,by+(fl?1:0),2,1);
  }
  // montañas nevadas asomando (la Cima del Viento)
  for(let i=0;i<24;i++){ ctx.fillStyle=i<8?'#e8f0f8':'#8a8aa0';
    ctx.fillRect(130-i,52+i,i*2+2,1); }
  for(let i=0;i<16;i++){ ctx.fillStyle=i<6?'#e8f0f8':'#9a9ab0';
    ctx.fillRect(33-i,60+i,i*2+2,1); }
  // banda de nubes festoneada en el horizonte, estilo LA
  ctx.fillStyle='#ffffff';
  for(let x=0;x<160;x+=8){ const b=hash(x,13)%3;
    ctx.fillRect(x+2,70-b,4,2); ctx.fillRect(x,72-b,8,3); }
  ctx.fillRect(0,74,160,6);
  ctx.fillStyle='#c8d8e8'; ctx.fillRect(0,79,160,1);
  // pinar lejano tras la pradera (profundidad de bosque, no colina plana)
  ctx.fillStyle='#3a8a4c'; ctx.fillRect(0,80,160,6);
  ctx.fillStyle='#2e7838';
  for(let x=0;x<160;x+=8){ const h=2+hash(x,41)%4;
    ctx.fillRect(x+2,80-h,4,h); ctx.fillRect(x+3,79-h,2,1); }
  ctx.fillStyle='#246030';
  for(let x=4;x<160;x+=16) ctx.fillRect(x,82,2,3);
  // pradera
  ctx.fillStyle='#78c050'; ctx.fillRect(0,86,160,58);
  ctx.fillStyle='#5ca040';
  for(let i=0;i<26;i++){ const h=hash(i*7,31); ctx.fillRect(h%158,88+(h>>4)%34,2,1); }
  ctx.fillStyle='#4a8838'; ctx.fillRect(0,122,160,22);
  // el sendero que lleva al Gran Roble (invita a entrar)
  for(let y=104;y<144;y++){
    const w=(6+(y-104)*0.45)|0, cx=80+((Math.sin(y*.12)*3)|0);
    ctx.fillStyle=C.path; ctx.fillRect(cx-w,y,w*2,1);
    if((y&3)===0){ ctx.fillStyle=C.pathD; ctx.fillRect(cx-w,y,2,1); ctx.fillRect(cx+w-2,y,2,1); }
  }
  // flores con pétalos, repartidas a ambos lados del sendero
  for(let i=0;i<8;i++){ const h=hash(i*31,9);
    let fx=6+(h%48); if(i&1) fx+=102;
    const fy=94+((h>>6)%42);
    ctx.fillStyle=(i&2)?C.flower1:C.flower2;
    ctx.fillRect(fx+1,fy,1,1); ctx.fillRect(fx,fy+1,3,1); ctx.fillRect(fx+1,fy+2,1,1);
    ctx.fillStyle=C.flowerC; ctx.fillRect(fx+1,fy+1,1,1);
  }
  // colina del Gran Roble
  const MW=[22,34,42,48,52,54,56];
  MW.forEach((w,i)=>{ ctx.fillStyle=i?'#5ca040':'#6ab048'; ctx.fillRect(80-(w>>1),97+i,w,1); });
  ctx.drawImage(OAK,80-(OAK.width>>1),62);
  // bellotas doradas maduran en la copa
  ctx.fillStyle=PAL.a;
  [[70,76],[84,72],[90,80],[75,82]].forEach(([x,y])=>ctx.fillRect(x,y,2,2));
  ctx.fillStyle=PAL.A;
  [[70,75],[84,71],[90,79],[75,81]].forEach(([x,y])=>ctx.fillRect(x,y,2,1));
}
function drawBoot(){ // encendido a lo Game Boy: LCD pálido y el logo que baja
  ctx.fillStyle='#9bbc3f'; ctx.fillRect(0,0,VW,VH);          // verde DMG de toda la vida
  ctx.fillStyle='rgba(255,255,255,.05)';
  for(let y=0;y<VH;y+=2) ctx.fillRect(0,y,VW,1);             // trama del LCD
  const k=Math.min(1,bootT/45), y=(-12+78*k)|0;              // descenso lento y recto
  ctx.font='8px "Press Start 2P"'; ctx.textAlign='center'; ctx.textBaseline='top';
  if(fontsReady){
    ctx.fillStyle='#0f380f'; ctx.fillText('NAHUELGABE',80,y);
    if(k>=1){
      ctx.save(); ctx.translate(124,y-3); ctx.scale(.5,.5);  // el (tm) pequeñito
      ctx.fillText('TM',0,0); ctx.restore();
      if(bootGo===0&&bootT>140&&(tick&63)<36){               // pista sutil si te quedas mirando
        ctx.fillStyle='#306230'; ctx.fillText('Z',80,118);
      }
    }
  }
  if(bootGo>0&&bootGo<22){ // fundido a negro-bosque hacia el título
    ctx.fillStyle='rgba(8,20,8,'+((1-bootGo/22).toFixed(2))+')'; ctx.fillRect(0,0,VW,VH);
  }
  ctx.textAlign='left';
}
function drawTitle(){
  drawTitleBg();
  // hojas a la deriva, tras el logo
  for(const p of parts){ ctx.fillStyle=p.col; ctx.fillRect(p.x|0,p.y|0,2,2); }

  // ---- logo propio: letras pixel-art que caen del cielo y rebotan al posarse ----
  const eachGlyph=(fn)=>{
    LOGO_GLYPHS.forEach((gl,i)=>{
      const k=(titleT-(TITLE_T0+i*TITLE_STAG))/TITLE_DUR;
      if(k<0) return;
      const y=LOGO_Y+gl.dy+(k>=1?0:-(1-easeOutBack(k))*52);
      fn(gl,i,LOGO_POS[i],y|0);
    });
  };
  // la Hoja Ancestral cae con física de hoja: péndulo amortiguado que se posa
  if(titleT>=TITLE_LEAF0){
    const FX=24, FY=1;                                  // reposo final
    const lk=Math.min(1,(titleT-TITLE_LEAF0)/TITLE_LEAFD);
    if(lk<1){
      const ye=1-(1-lk)*(1-lk);                         // frena al acercarse al suelo
      const ph=lk*Math.PI*4.6;                          // ~2 vaivenes y medio
      const amp=30*(1-lk);                              // el balanceo se amortigua
      const cx=FX+56+Math.sin(ph)*amp;
      const cy=-40+(FY+33+40)*ye;
      const rot=Math.cos(ph)*0.42*(1-lk*0.7);           // se inclina hacia donde va
      ctx.save(); ctx.translate(cx|0,cy|0); ctx.rotate(rot);
      ctx.drawImage(LEAF_BLADE,-56,-33);
      ctx.restore();
    } else ctx.drawImage(LEAF_BLADE,FX,FY);
  }
  eachGlyph((gl,i,x,y)=>{ ctx.drawImage(gl.dark,x+1,y+2); });   // sombra dura GB
  eachGlyph((gl,i,x,y)=>{ ctx.drawImage(gl.img,x,y); });
  if(titleT>=TITLE_SHINE){
    const cyc=(titleT-TITLE_SHINE)%190;
    if(cyc<34){ // destello diagonal que barre el logo
      const gx=22+(cyc/34)*126;
      ctx.save(); ctx.beginPath();
      ctx.moveTo(gx,LOGO_Y-4); ctx.lineTo(gx+9,LOGO_Y-4); ctx.lineTo(gx-5,LOGO_Y+24); ctx.lineTo(gx-14,LOGO_Y+24);
      ctx.closePath(); ctx.clip();
      eachGlyph((gl,i,x,y)=>{ ctx.drawImage(gl.white,x,y); });
      ctx.restore();
    } else if(cyc<54){ // ...y deja una chispa en la bellota
      const s=cyc<44?(cyc-34)>>1:(54-cyc)>>1;
      if(s>0){ const cx=LOGO_POS[3]+15, cy=LOGO_Y+3;
        ctx.fillStyle='#fff';
        ctx.fillRect(cx-s,cy,s*2+1,1); ctx.fillRect(cx,cy-s,1,s*2+1);
      }
    }
  }
  // subtítulo en fundido
  ctx.textBaseline='top';
  const a=Math.max(0,Math.min(1,(titleT-TITLE_LAND)/26));
  if(a>0){ // subtítulo a lo "LINK'S AWAKENING": mayúsculas blancas con contorno
    ctx.globalAlpha=a;
    ctx.textAlign='center'; ctx.font='8px "Press Start 2P"';
    const sub='Y LAS 8 SEMILLAS';
    ctx.fillStyle=PAL.k;
    ctx.fillText(sub,79,60); ctx.fillText(sub,81,60);
    ctx.fillText(sub,80,59); ctx.fillText(sub,80,61); ctx.fillText(sub,81,61);
    ctx.fillStyle='#fffbe8'; ctx.fillText(sub,80,60);
    ctx.globalAlpha=1;
  }
  // Sprout pequeñín ante el Gran Roble: la escala cuenta la historia
  const bob=Math.sin(tick*.05)>0?0:1;
  ctx.drawImage(P_SPRITES[2][0],104,88+bob);
  if(titleT>=TITLE_MENU){
    ctx.font='8px "Press Start 2P"'; ctx.textAlign='center';
    if((tick&47)<32){
      ctx.fillStyle=PAL.k; ctx.fillText('PULSA  Z',81,113);
      ctx.fillStyle='#fffbe8'; ctx.fillText('PULSA  Z',80,112);
    }
    ctx.fillStyle=PAL.k; ctx.fillText('M: musica',81,130);
    ctx.fillStyle='#dff0d8'; ctx.fillText('M: musica',80,129);
  }
  ctx.textAlign='left';
}
function drawFile(){ // ELIGE BROTE — selección de archivo a lo Zelda
  ctx.fillStyle='#0c1c10'; ctx.fillRect(0,0,VW,VH);
  for(let y=0;y<VH;y+=8) for(let x=((y>>3)&1)*8;x<VW;x+=16){ ctx.fillStyle='#0e2014'; ctx.fillRect(x,y,8,8); }
  ctx.strokeStyle='#2a4a34'; ctx.lineWidth=1; ctx.strokeRect(3.5,3.5,153,137);
  ctx.font='8px "Press Start 2P"'; ctx.textBaseline='top'; ctx.textAlign='center';
  ctx.fillStyle=C.flowerC; ctx.fillText('ELIGE BROTE',80,10);
  ctx.textAlign='left';
  for(let i=0;i<3;i++){
    const y=26+i*30, sel=fileSel===i, d=slotCache[i];
    ctx.fillStyle=sel?'#1b3a26':'#13241a'; ctx.fillRect(12,y,136,26);
    ctx.strokeStyle=sel?C.uiText:'#2a4a34'; ctx.strokeRect(12.5,y+.5,135,25);
    if(sel) ctx.drawImage(ACORN,16+((tick&31)<16?0:1),y+9);
    if(d){
      ctx.drawImage(SPROUT_DOWN,28,y+5);
      const mh=Math.min(7,((d.maxHp||6)/2)|0);
      for(let h=0;h<mh;h++) ctx.drawImage(HEART_FULL,48+h*9,y+4);
      ctx.drawImage(ACORN,48,y+14);
      ctx.fillStyle=C.uiText; ctx.fillText('x'+(d.seeds||0),59,y+14);
      let ex=92; // estaciones recuperadas, en miniatura
      if(d.thawed){ ctx.drawImage(EMBER_SPR,0,0,16,16,ex,y+11,12,12); ex+=14; }
      if(d.summered){ ctx.drawImage(TEAR_SPR,0,0,16,16,ex,y+11,12,12); ex+=14; }
      if(d.cycled){ ctx.drawImage(FLAKE_SPR,0,0,16,16,ex,y+11,12,12); }
    } else {
      ctx.fillStyle=sel?C.uiText:'#5d8a6b'; ctx.fillText('- NUEVO -',56,y+9);
    }
  }
  ctx.textAlign='center';
  if(fileConfirm&&slotCache[fileSel]){
    ctx.fillStyle='#e84848'; ctx.fillText('¿BORRAR BROTE?',80,120);
    ctx.fillStyle=C.uiText; ctx.fillText('Z: sí   X: no',80,131);
  } else {
    ctx.fillStyle='#7fae8c'; ctx.fillText('Z:elegir X:borrar',80,120);
    ctx.fillText('ENTER: atrás',80,131);
  }
  ctx.textAlign='left';
}
function drawBossCard(){ // presentación de jefe, a lo Zelda
  if(!bossCard) return;
  const a=Math.max(0,Math.min(1,(130-bossCard.t)/10,bossCard.t/30));
  ctx.globalAlpha=a;
  ctx.fillStyle='rgba(5,8,10,.88)'; ctx.fillRect(0,30,160,20);
  ctx.fillStyle='#e84848'; ctx.fillRect(0,30,160,1); ctx.fillRect(0,49,160,1);
  ctx.font='8px "Press Start 2P"'; ctx.textAlign='center'; ctx.textBaseline='top';
  ctx.fillStyle='#fffbe8'; ctx.fillText(bossCard.txt,80,36);
  ctx.globalAlpha=1; ctx.textAlign='left';
}
function drawToast(){ // aviso de misión: cartelito dorado arriba
  if(!toast) return;
  const a=Math.max(0,Math.min(1,(140-toast.t)/8,toast.t/14));
  ctx.globalAlpha=a;
  const h=toast.t2?24:14;
  ctx.fillStyle='rgba(5,10,7,.92)'; ctx.fillRect(8,3,144,h);
  ctx.strokeStyle=C.flowerC; ctx.lineWidth=1; ctx.strokeRect(8.5,3.5,143,h-1);
  ctx.font='8px "Press Start 2P"'; ctx.textAlign='center'; ctx.textBaseline='top';
  ctx.fillStyle=C.flowerC; ctx.fillText(toast.t1,80,6);
  if(toast.t2){ ctx.fillStyle=C.uiText; ctx.fillText(toast.t2,80,16); }
  ctx.globalAlpha=1; ctx.textAlign='left';
}
function drawShop(){ // el mostrador de Tilo
  ctx.fillStyle='rgba(5,10,7,.93)'; ctx.fillRect(6,4,148,118);
  ctx.strokeStyle=C.flowerC; ctx.lineWidth=1; ctx.strokeRect(7.5,5.5,145,115);
  ctx.font='8px "Press Start 2P"'; ctx.textBaseline='top'; ctx.textAlign='center';
  ctx.fillStyle=C.flowerC; ctx.fillText('TIENDA DE TILO',80,10);
  ctx.textAlign='left';
  ctx.drawImage(BERRY_SPR,116,20); ctx.fillStyle=C.uiText; ctx.fillText('x'+berries,126,21);
  const L=shopList();
  L.forEach((it,i)=>{
    const y=33+i*12, sel=i===shopSel;
    if(sel&&(tick&31)<24) ctx.drawImage(ACORN,10,y);
    ctx.fillStyle=it.off?'#4c7259':(sel?C.uiText:'#9ec7aa');
    ctx.fillText(it.name,20,y);
    if(it.cost>0){ ctx.drawImage(BERRY_SPR,126,y-1);
      ctx.fillStyle=berries>=it.cost?C.flowerC:'#e84848'; ctx.fillText(''+it.cost,136,y); }
  });
  ctx.fillStyle='#13241a'; ctx.fillRect(12,86,136,20);
  ctx.fillStyle='#9ec7aa';
  wrapText(L[shopSel].d,16).slice(0,2).forEach((ln,i)=>ctx.fillText(ln,16,88+i*9));
  ctx.textAlign='center'; ctx.fillStyle='#7fae8c';
  if((tick&95)<60) ctx.fillText('Z:comprar X:salir',80,111);
  ctx.textAlign='left';
}
function remainingSeedScreens(){ // pantallas del mundo con semillas sin recoger
  const out=new Set();
  for(const key in MAPS){
    const [mx,my]=key.split(',').map(Number);
    if(mx<0||mx>3||my<-3||my>3) continue;
    const rows=MAPS[key];
    for(let y=0;y<SH;y++) for(let x=0;x<SW;x++){
      const ch=rows[y][x];
      if(/[1-8]/.test(ch)&&!collected.has(key+','+x+','+y)) out.add(key);
      else if(ch==='Q'&&!collected.has('Q'+key+','+x+','+y)) out.add(key);
    }
  }
  return out;
}
function draw(){
  ctx.save();
  if(shake>0) ctx.translate((Math.random()*4-2)|0,(Math.random()*4-2)|0);
  ctx.fillStyle='#081408'; ctx.fillRect(-4,-4,VW+8,VH+8);

  if(state==='boot'){ drawBoot(); ctx.restore(); return; }
  if(state==='title'){ drawTitle(); ctx.restore(); return; }
  if(state==='file'){ drawFile(); ctx.restore(); return; }
  if(state==='cine'){ drawCine(); ctx.restore(); return; }

  if(state==='trans'){
    const k=trans.t/trans.dur, e=k*k*(3-2*k);
    const ox=-trans.dx*160*e, oy=-trans.dy*128*e;
    ctx.drawImage(trans.a,ox,oy);
    ctx.drawImage(trans.b,ox+trans.dx*160,oy+trans.dy*128);
    const s=P_SPRITES[player.dir][0];
    // el jugador se desliza hacia su posición destino
    const pxFrom=player.x+trans.dx*160, pyFrom=player.y+trans.dy*128;
    ctx.drawImage(s,(pxFrom+ (player.x-pxFrom)*e)|0,(pyFrom+(player.y-pyFrom)*e)|0);
    drawUI(); ctx.restore(); return;
  }

  drawScene();
  drawUI();
  if(state==='itemget'){ // Sprout alza el objeto sobre su cabeza
    ctx.drawImage(itemSpr||BLADE_SPR,player.x|0,(player.y-17)|0);
  }
  if(wakeT>0&&state==='play'){
    ctx.font='8px "Press Start 2P"';
    if(wakeT>25){ ctx.fillStyle='#cfe8d8'; ctx.fillText('z z',player.x+13,player.y-10); }
    else { ctx.fillStyle='#f8d0d0'; ctx.fillText('!',player.x+6,player.y-13); }
  }
  if(state==='dialog'&&dlg) drawDialog();
  if(state==='shop') drawShop();
  if(state==='play'||state==='dialog') drawBossCard();
  if(state==='play'||state==='dialog'||state==='give'||state==='itemget'||state==='shop') drawToast();
  if(fadeIn>0){ ctx.fillStyle='rgba(6,12,7,'+(fadeIn/70).toFixed(2)+')'; ctx.fillRect(0,0,VW,VH); }

  if(state==='pause'){ // el ZURRÓN (0) / MISIONES (1) / MAPA (2)
    ctx.fillStyle='rgba(5,10,7,.92)'; ctx.fillRect(6,4,148,118);
    ctx.strokeStyle=C.uiText; ctx.lineWidth=1; ctx.strokeRect(7.5,5.5,145,115);
    ctx.font='8px "Press Start 2P"'; ctx.textBaseline='top'; ctx.textAlign='center';
    if(pauseView===0){
    ctx.fillStyle=C.flowerC; ctx.fillText('- ZURRÓN -',80,11);
    // objetos
    const slots=[[BLADE_SPR,hasBlade],[BOMB_SPR,hasBomb],[HOOK_SPR,hasHook],[SPIN_ICON,hasSpin]];
    slots.forEach(([img,owned],i)=>{
      const x=20+i*31;
      ctx.fillStyle='#13241a'; ctx.fillRect(x,26,24,24);
      ctx.strokeStyle='#2a4a34'; ctx.strokeRect(x+.5,26.5,23,23);
      if(owned) ctx.drawImage(img,x+4,30);
      else { ctx.fillStyle='#1c2f22'; ctx.fillRect(x+6,32,12,12); }
    });
    if(hasBlade&&bladeLvl>1){ ctx.textAlign='left'; ctx.fillStyle=C.flowerC; ctx.fillText('x'+bladeLvl,33,43); ctx.textAlign='center'; }
    // tesoros
    ctx.textAlign='left'; ctx.fillStyle=C.uiText;
    ctx.drawImage(ACORN,34,60); ctx.fillText('x'+seeds,46,60);
    const nDiary=[...collected].filter(i=>i[0]==='d').length;
    ctx.drawImage(DIARY_SPR,74,60); ctx.fillText(nDiary+'/'+Object.keys(DIARY).length,86,60);
    if(keysHeld>0){ ctx.drawImage(ACORN,116,60); ctx.fillStyle=PAL.a; ctx.fillText('x'+keysHeld,128,60); ctx.fillStyle=C.uiText; }
    for(let i=0;i<player.maxHp/2;i++) ctx.drawImage(HEART_FULL,34+i*9,76);
    ctx.drawImage(BERRY_SPR,116,76); ctx.fillText('x'+berries,128,76);
    if(wilts>0){ // las veces que te marchitaste, como cicatriz discreta
      ctx.drawImage(SPROUT_WILT,0,0,16,16,116,88,12,12);
      ctx.fillStyle='#9ec7aa'; ctx.fillText('x'+wilts,130,92); ctx.fillStyle=C.uiText;
    }
    // estaciones recuperadas
    ctx.fillStyle='#9ec7aa'; ctx.fillText('EST:',34,94);
    if(thawed) ctx.drawImage(EMBER_SPR,62,86);
    if(summered) ctx.drawImage(TEAR_SPR,82,86);
    if(cycled) ctx.drawImage(FLAKE_SPR,102,86);
    if(!thawed&&!summered){ ctx.fillStyle='#4c7259'; ctx.fillText('---',70,94); }
    } else if(pauseView===1){ // - MISIONES - el registro del brote
    ctx.fillStyle=C.flowerC; ctx.fillText('- MISIONES -',80,11);
    ctx.textAlign='left';
    const L=questList();
    const act=L.filter(q=>!q.done&&!q.side), side=L.filter(q=>!q.done&&q.side);
    const done=L.filter(q=>q.done);
    let y=26;
    if(act.length===0&&cycled){ ctx.fillStyle=C.flowerC; ctx.fillText('¡Todo florece!',26,y); y+=14; }
    for(const q of act.slice(0,3)){
      ctx.drawImage(ACORN,14,y+((tick&31)<16?0:1));
      ctx.fillStyle=C.uiText; ctx.fillText(q.txt,26,y); y+=13;
    }
    if(side.length){ y+=4; ctx.fillStyle='#9ec7aa'; ctx.fillText('EXTRA:',14,y); y+=11;
      for(const q of side.slice(0,2)){ ctx.drawImage(BERRY_SPR,14,y-1); ctx.fillStyle='#cfe8d8'; ctx.fillText(q.txt,26,y); y+=11; } }
    if(done.length){ y+=4; ctx.fillStyle='#4c7259'; ctx.fillText('HECHO ('+done.length+'):',14,y); y+=11;
      for(const q of done.slice(-2)){ ctx.fillStyle='#4c7259'; ctx.fillText('+ '+q.txt,14,y); y+=10; } }
    } else { // MAPA del valle (4 columnas × 7 filas, sólo lo pisado)
    ctx.fillStyle=C.flowerC; ctx.fillText('- MAPA -',80,11);
    const cs=11, mox=80-2*cs, moy=22;
    const seedScr=remainingSeedScreens();
    for(const key in MAPS){
      const [mx,my]=key.split(',').map(Number);
      if(mx<0||mx>3||my<-3||my>3) continue;
      const px=mox+mx*cs, py=moy+(my+3)*cs;
      const vis=visited.has(key);
      ctx.fillStyle=vis?'#3f6a4c':'#14211a'; ctx.fillRect(px+1,py+1,cs-2,cs-2);
      if(vis&&mx===1&&my===1){ ctx.fillStyle='#d84838'; ctx.fillRect(px+3,py+3,3,3); }       // el pueblo
      if(vis&&seedScr.has(key)){ ctx.fillStyle=C.flowerC; ctx.fillRect(px+cs-5,py+cs-5,3,3); } // semilla pendiente
    }
    if(sx>=0&&sx<=3&&sy>=-3&&sy<=3){ // tu posición, parpadeando
      if((tick&15)<10){ ctx.strokeStyle='#fff'; ctx.strokeRect(mox+sx*cs+.5,moy+(sy+3)*cs+.5,cs-1,cs-1); }
      ctx.fillStyle=C.flowerC; ctx.fillRect(58,103,3,3);
      ctx.textAlign='left'; ctx.fillStyle='#9ec7aa'; ctx.fillText('semillas',66,100);
    } else { ctx.fillStyle='#9ec7aa'; ctx.fillText('(bajo tierra)',80,100); }
    }
    ctx.textAlign='center'; ctx.fillStyle='#7fae8c';
    if((tick&95)<48) ctx.fillText(['ENTER: misiones','ENTER: mapa','ENTER: zurrón'][pauseView],80,112);
    else ctx.fillText('Z: volver',80,112);
    ctx.textAlign='left';
  }
  if(state==='dying'){ // velo mustio que va cubriendo
    const k=1-deathT/70;
    ctx.fillStyle='rgba(30,22,8,'+(0.7*k).toFixed(2)+')'; ctx.fillRect(0,0,VW,PLAY_H);
  }
  if(state==='over'){ // CONTINUE temático: marchitarse y rebrotar
    ctx.fillStyle='rgba(20,16,8,.82)'; ctx.fillRect(0,0,VW,VH);
    ctx.drawImage(SPROUT_WILT,72,40);
    if((tick&7)<4) for(let i=0;i<1;i++) parts.push({x:74+Math.random()*12,y:50,vx:(Math.random()-.5)*.4,vy:.4,life:24,col:'#a87838'});
    for(const p of parts){ ctx.fillStyle=p.col; ctx.fillRect(p.x|0,p.y|0,1,1); p.x+=p.vx;p.y+=p.vy;p.life--; }
    parts=parts.filter(p=>p.life>0);
    ctx.textAlign='center'; ctx.textBaseline='top'; ctx.font='8px "Press Start 2P"';
    ctx.fillStyle='#c8b070'; ctx.fillText('SPROUT SE',80,66); ctx.fillText('MARCHITÓ...',80,76);
    ctx.fillStyle='#8a9a6a'; ctx.fillText('de cada brote caído',80,92);
    ctx.fillText('nace una semilla.',80,101);
    if((tick&47)<32){ ctx.fillStyle='#9ed86a'; ctx.fillText('Z: REBROTAR',80,114); }
    ctx.textAlign='left';
  }
  ctx.restore();
}

