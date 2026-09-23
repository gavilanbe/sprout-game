import {loadCharacter} from './character-art.js';
// The generated masters stay untouched. These canvases are the runtime atlas.
const root = new URL('../../assets/slice/', import.meta.url);
export const makeCanvas = (w, h = w) => {
  const c = document.createElement('canvas'); c.width = w; c.height = h;
  c.getContext('2d').imageSmoothingEnabled = false;
  return c;
};
async function load(name) {
  const image = new Image(); image.src = new URL(name, root).href;
  await image.decode();
  return image;
}
function cell(image, col, row) {
  const x = Math.round(col * image.width / 4), y = Math.round(row * image.height / 4);
  const w = Math.round((col + 1) * image.width / 4) - x;
  const h = Math.round((row + 1) * image.height / 4) - y;
  const c = makeCanvas(w, h); c.getContext('2d').drawImage(image, x, y, w, h, 0, 0, w, h);
  return c;
}
export async function loadAssets() {
  const world=await load('woodland-atlas.png');
  const props=Array.from({length:16},(_,i)=>{
    const c=makeCanvas(i===4?64:32),s=cell(world,i%4,Math.floor(i/4));
    c.getContext('2d').drawImage(s,0,0,c.width,c.height);return c;
  });
  const character=await loadCharacter(props[14]);
  return {character,props,masters:{hero:character.source,world:[world.width,world.height]},walk:character.animations.walk.flat(),attack:character.animations.attack.flat()};
}
