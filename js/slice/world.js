export const TILE=32, WIDTH=320, HEIGHT=288, FIELD=256;
export const ROOMS=[
  {name:'El claro dormido',description:'El bosque guarda el aliento.<br>Algo pequeño puede despertarlo.',
    rows:['##########','#........#','#..oo....#','#.ooo....#','#...p....#','#...pppppp','#...p....#','##########'],
    flowers:[[55,68],[248,77],[72,208]],rocks:[[269,132]],bushes:[[65,158],[245,210]],
    trees:[[28,35],[80,30],[135,27],[192,31],[247,27],[294,34],[15,91],[20,147],[16,221],[68,258],[129,263],[188,258],[246,262],[304,249],[305,110]],
    solids:[{x:132,y:78,w:26,h:13},{x:82,y:113,w:14,h:8}],slimes:[]},
  {name:'El arroyo de musgo',description:'Agua tranquila, hojas inquietas.<br>El sendero continúa al otro lado.',
    rows:['####ww####','#...ww.#.#','#...ww.#.#','#...ww.#.#','#...ww.#.#','ppppbbpBpp','#...ww.#.#','####ww####'],
    flowers:[[77,66],[279,210]],rocks:[[97,106]],bushes:[[49,113]],
    trees:[[25,34],[82,28],[218,25],[280,28],[16,99],[14,251],[79,256],[218,255],[292,257],[247,79],[247,131],[247,234],[302,89]],
    slimes:[{x:80,y:212}]},
  {name:'La arboleda secreta',description:'Un tesoro bajo las hojas.<br>Hasta los guardianes son pequeños.',
    rows:['##########','#........#','#.....oo.#','#.....oo.#','#........#','pppppp...#','#........#','##########'],
    flowers:[[74,67],[111,210]],rocks:[[43,116]],bushes:[[174,69],[267,205]],
    trees:[[18,31],[77,27],[134,25],[194,28],[255,29],[304,29],[17,83],[310,92],[312,145],[308,221],[256,258],[198,265],[139,258],[80,263],[20,253]],
    solids:[{x:232,y:82,w:24,h:11}],slimes:[{x:190,y:161},{x:246,y:127}]}
];
export function createWorld(){
  return ROOMS.map((room,i)=>({...room,grid:room.rows.map(r=>[...r]),slimes:room.slimes.map((e,n)=>({...e,id:`${i}-${n}`,hp:2,hit:0,t:n*1.4,homeX:e.x,homeY:e.y})),cut:new Set()}));
}
export const hit=(a,b)=>a.x<b.x+b.w&&a.x+a.w>b.x&&a.y<b.y+b.h&&a.y+a.h>b.y;
export function blocked(room,x,y){
  // Only the feet collide, allowing the character to pass behind a canopy.
  const b={x:x-7,y:y-8,w:14,h:8};
  if(b.x<0||b.x+b.w>WIDTH||b.y<32||b.y+b.h>FIELD-24)return true;
  for(let ty=Math.floor(b.y/TILE);ty<=Math.floor((b.y+b.h-1)/TILE);ty++){
    for(let tx=Math.floor(b.x/TILE);tx<=Math.floor((b.x+b.w-1)/TILE);tx++){
      if('#wB'.includes(room.grid[ty]?.[tx]??'#'))return true;
    }
  }
  if(room.rocks.some(([rx,ry])=>hit(b,{x:rx-11,y:ry-10,w:22,h:10})))return true;
  if(room.bushes.some(([bx,by],i)=>!room.cut.has(i)&&hit(b,{x:bx-10,y:by-13,w:20,h:13})))return true;
  if(room.solids?.some(s=>hit(b,s)))return true;
  return false;
}
