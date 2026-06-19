'use strict';
/* ============================================================
   SPROUT — Zelda-like estilo Link's Awakening DX
   160×144 (resolución GB real) · tiles 16px · UI inferior 16px
   ============================================================ */
const cv = document.getElementById('cv');
const ctx = cv.getContext('2d');
ctx.imageSmoothingEnabled = false;

const TILE=16, SW=10, SH=8, VW=160, VH=144, PLAY_H=128;
const WORLD_W=4, WORLD_H=3;

/* ---------- PALETA (GBC, vibras Link's Awakening DX) ---------- */
const PAL = {
  k:'#1a1410',  w:'#ffffff',
  s:'#f8d090',  S:'#d89858',          // piel
  l:'#70d838',  d:'#2e8038',          // hoja clara / oscura
  b:'#c06a38',  m:'#7a4020',          // peto / botas
  g:'#58b048',  G:'#2e7830',          // blob
  p:'#9858c8',  P:'#5c3080',          // murciélago
  R:'#e84848',                         // corazón
  a:'#d09040',  A:'#8a5028',          // bellota
  O:'#c06030',                         // maceta del anciano
};
const C = {
  grass:'#78c050', grassD:'#5ca040', grassDD:'#4a8838',
  flower1:'#e84848', flower2:'#f8f8e8', flowerC:'#e8b050',
  path:'#e8d8a0', pathD:'#cdb878',
  sand:'#ecd494', sandD:'#d2b870',
  water:'#3878d8', waterL:'#78b8f0',
  trunk:'#8a5028', canopy:'#1e6830', canopyL:'#359045',
  rock:'#b0a890', rockD:'#7a7464', rockL:'#d0c8b0',
  wood:'#c08850', woodD:'#8a5828',
  wall:'#e8d0a0', wallD:'#b89868', roof:'#d84838', roofD:'#982818',
  ui:'#101810', uiText:'#f8e8c8',
  night:'#0c2818',
};

