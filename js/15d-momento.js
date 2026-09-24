'use strict';
/* ============================================================
   EL MOMENTO DEL ARMA: cada arma y herramienta nueva tiene su cinemática
   (15e: Sprout en grande blandiéndola, a lo intro de Oracle of Seasons, y
   el título con su nombre y su frase) y, de vuelta en el juego, el gestito
   de cogerla: el arma salta, Sprout la atrapa y la alza entre rayos. Luego,
   el cartel de siempre con cómo se usa. Z acelera cada parte.
   Aquí vive el guion de fases, la paleta y la frase de cada arma.
   Se engancha en getItem (09), en el estado itemget (13) y en draw() (15-ui).
   Las pruebas lo cortan como antes: itemT=0.
   ============================================================ */
const MOMENT_ARMS={ // pal: [sombra, medio oscuro, medio claro, luz]
  blade:{tag:'EL ARMA DEL BROTE',pal:['#08200e','#1d5a22','#58b048','#d0fa98'],line:'La primera hoja del Gran Roble. Corta lo que el invierno ató.'},
  bomb:{tag:'HERRAMIENTA NUEVA',pal:['#1c0a04','#6a3410','#c47c2a','#ffdc94'],line:'Dentro de cada bellota duerme un roble con prisa.'},
  hook:{tag:'HERRAMIENTA NUEVA',pal:['#120a04','#4a2c14','#9c6a38','#f2d6a2'],line:'Una raíz siempre encuentra dónde agarrarse.'},
  boomer:{tag:'HERRAMIENTA NUEVA',pal:['#0c2006','#386a1a','#8cb442','#f2f6b4'],line:'Lo que lanzas con cariño siempre vuelve.'},
  lantern:{tag:'HERRAMIENTA NUEVA',pal:['#1e0604','#7c1e0c','#e2682a','#ffe28c'],line:'Una chispa de la Brasa de Primavera. No se apaga nunca.'},
  feather:{tag:'HERRAMIENTA NUEVA',pal:['#0e1a32','#34588a','#8cb6ea','#f8fbff'],line:'Quien no pesa nada cruza cualquier vacío.'},
  shield:{tag:'DEFENSA NUEVA',pal:['#160c06','#5a3818','#b2823e','#fadc9a'],line:'La corteza del Roble aguantó mil inviernos. Ahora aguanta por ti.'},
  molinillo:{tag:'HERRAMIENTA NUEVA',pal:['#280a22','#8a2a70','#e272b2','#fff0f8'],line:'Un poco de viento tuyo, para cuando el suyo sople en contra.'},
};
const M_CATCH=12, M_GRAB=54;
let moment=null;
/* el orden: la cinemática del arma (15e, a pantalla completa) → de vuelta al juego, Sprout la atrapa y la alza → el cartel de cómo se usa */
function startMoment(kind){
  if(!MOMENT_ARMS[kind]) return;
  moment={kind,phase:'cine',t:0,hx:player.x+8,hy:player.y-9,fx:player.x+8,fy:player.y+14}; itemT=999; startCineArm(kind); }
function endMoment(){ moment=null; cineArm=null; itemT=0; const pages=(itemPages||[]).slice(1); if(pages.length) say(pages); else state='play'; }
function updMoment(){
  const M=moment;
  if(itemT<=1){ endMoment(); return; } // las pruebas (y quien tenga mucha prisa) lo cortan así
  if(M.phase==='cine'){ if(updCineArm()){ M.phase='grab'; M.t=0; cineArm=null; } return; }
  M.t++;
  if(M.t===M_CATCH){ player.squash=.35; SFX.momentCatch(); puff(M.hx,M.hy,'#fff6c0',8,1.3); }
  if(keys.fire&&M.t>M_CATCH+6){ keys.fire=false; M.t=M_GRAB; }
  updParts();
  if(M.t>=M_GRAB) endMoment();
}
/* el gesto en el juego: el arma salta, Sprout la atrapa y la alza entre rayos */
function drawMomentPose(M){
  const t=M.t, img=itemSpr||BLADE_SPR;
  const at=k=>[lerp(M.fx,M.hx,k),lerp(M.fy,M.hy,k)-Math.sin(Math.PI*k)*16];
  if(t<M_CATCH){ const k=t/M_CATCH, [x,y]=at(k), sx=Math.max(.2,Math.abs(Math.cos(k*Math.PI*2)));
    for(let i=1;i<=4;i++){ const [x2,y2]=at(Math.max(0,(t-i*1.3)/M_CATCH)); ctx.fillStyle=i<2?'#fffbe0':'rgba(255,246,192,'+(.7/i).toFixed(2)+')'; ctx.fillRect(Math.round(x2),Math.round(y2),i<2?2:1,i<2?2:1); } // la estela
    ctx.save(); ctx.translate(Math.round(x),Math.round(y)); ctx.scale(sx,1); ctx.drawImage(img,-8,-8); ctx.restore(); }
  else { const k=Math.min(1,(t-M_CATCH)/10), bob=Math.round(Math.sin(t*.25)*1.5), u=t-M_CATCH;
    drawRays(M.hx,M.hy,easeOutBack(k)); ctx.drawImage(img,M.hx-8,M.hy-8+bob);
    if(u<12){ const r=Math.round(4+CA_EASE.out(u/12)*20); ctx.globalAlpha=1-u/12; ctx.drawImage(ringArt(r,'#fff6c0',1),M.hx-r-1,M.hy-r-1); ctx.globalAlpha=1; } // ¡la atrapa!: un anillo
    if(u<9) caStar(M.hx+5,M.hy-6+bob,[2,4,6,5,4,3,2,1,1][u],'#ffffff');
    if((t&3)===0) sparkle(M.hx-10+Math.random()*20,M.hy-10+Math.random()*14,'#fff6c0'); }
  if(t<8){ ctx.fillStyle='rgba(255,255,244,'+(1-t/8).toFixed(2)+')'; ctx.fillRect(0,0,VW,VH); } } // venimos del fogonazo de la cinemática
function drawMoment(){ const M=moment; if(!M) return; if(M.phase==='cine') drawCineArm(); else drawMomentPose(M); }
