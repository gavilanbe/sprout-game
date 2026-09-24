// node scripts/version.cjs [--check]
// La versión del juego sale del CONTENIDO: un hash de todo lo que se precarga (index.html, los scripts en el
// orden de index.html, el manifiesto, los iconos y el fondo del título) y de la lógica de sw.js. Escribe la versión y la lista de
// precarga en sw.js y la versión en js/00-version.js. Con --check solo comprueba que están al día (las pruebas
// lo usan: si cambias el juego y no la ejecutas, fallan). Ejecútala antes de cada commit que se vaya a publicar.
const fs=require('fs'), path=require('path'), crypto=require('crypto');
const root=path.join(__dirname,'..'), rd=f=>fs.readFileSync(path.join(root,f));
const html=rd('index.html').toString();
const scripts=[...html.matchAll(/<script src="([^"]+)"><\/script>/g)].map(m=>m[1]);
const STATIC=['index.html','manifest.webmanifest','assets/title-bg.png','icons/icon-192.png','icons/icon-512.png','icons/maskable-192.png','icons/maskable-512.png','icons/apple-touch-icon.png','icons/favicon-32.png','icons/favicon-16.png'];
const VERSION_FILE='js/00-version.js';
const hashed=[...STATIC,...scripts.filter(s=>s!==VERSION_FILE)];
for(const f of hashed) if(!fs.existsSync(path.join(root,f))){ console.error('falta '+f); process.exit(1); }
const h=crypto.createHash('sha1'); for(const f of hashed){ h.update(f+'\0'); h.update(rd(f)); }
// la lógica del service worker también cuenta (sin su versión ni su lista de precarga, que se escriben aquí)
h.update('sw.js\0'+rd('sw.js').toString().replace(/const VERSION = '[^']*';/,'').replace(/(\/\/ PRECACHE:BEGIN\n)[\s\S]*?(\s*\/\/ PRECACHE:END)/,'$1$2'));
const hash=h.digest('hex').slice(0,8);
const verSrc=fs.existsSync(path.join(root,VERSION_FILE))?rd(VERSION_FILE).toString():'', old=(verSrc.match(/GAME_VERSION='([^']+)'/)||[])[1]||'';
const today=new Date().toISOString().slice(0,10).replace(/-/g,'.');
const version=old.endsWith('-'+hash)?old:today+'-'+hash; // la fecha solo cambia cuando cambia el contenido
const precache=['index.html',...STATIC.filter(f=>f!=='index.html'),...scripts];
const swOld=rd('sw.js').toString();
const sw=swOld.replace(/const VERSION = '[^']*';/,`const VERSION = '${version}';`)
  .replace(/(\/\/ PRECACHE:BEGIN\n)[\s\S]*?(\s*\/\/ PRECACHE:END)/,(m,a,b)=>a+precache.map(f=>`  './${f}',`).join('\n')+b);
const ver=`'use strict';\n/* la versión del juego: la escribe scripts/version.cjs (fecha del último cambio y hash del contenido) */\nconst GAME_VERSION='${version}';\n`;
if(process.argv.includes('--check')){
  const ok=sw===swOld&&ver===verSrc; console.log(ok?'versión al día: '+version:'VERSIÓN DESACTUALIZADA: ejecuta node scripts/version.cjs'); process.exit(ok?0:1); }
fs.writeFileSync(path.join(root,'sw.js'),sw); fs.writeFileSync(path.join(root,VERSION_FILE),ver);
console.log((old===version?'sin cambios: ':'versión nueva: ')+version+' · '+precache.length+' ficheros en la precarga');
