# SPROUT y las 8 semillas — arquitectura

Zelda-like estilo Game Boy (160×144, tiles de 16px) sin dependencias ni build:
HTML + canvas + WebAudio. Se sirve con cualquier estático
(`python3 -m http.server 8741`) y funciona como PWA.

## Cómo está organizado

Los módulos son **scripts clásicos cargados en orden** desde `index.html`.
Comparten el ámbito global (como un solo script troceado): cualquier `let`,
`const` o `function` de nivel superior es visible desde los módulos
siguientes. Por eso **el orden de carga importa** y los ficheros van
numerados — datos primero, lógica después, arranque al final.

| Módulo | Qué vive aquí |
|---|---|
| `js/01-core.js` | Canvas, constantes (`TILE`, `VW/VH`…), paletas `PAL`/`C` |
| `js/02-sprites.js` | Helpers (`spr`, `sprN`, `flipH`…) y TODOS los sprites: jugador, bichos, jefes, NPCs, reliquias, arte del título (logo, `LEAF_PAGE` hoja-pergamino, `OAK`/`OAK_GRAND`) |
| `js/03-tiles.js` | `TILES` (pre-renderizados), altares, `SOLID`, permutas visuales: `THAW`/`AUTUMN`/`WILT` (valle mustio pre-semillas)/`SUMMER_P`+`WINTER_P` (ciclo post-final)/`TRONCO`+`HIVE` (mazmorra 2) |
| `js/04-maps.js` | `MAPS`: cada pantalla es 8 strings de 10 chars. Leyenda en los comentarios |
| `js/05-texts.js` | `TXT`, `DIARY`, `RUNAS`, `NPC_TALK`, `CINE`, `WIND_PEACE` — todo el guion |
| `js/06-audio.js` | Chiptune WebAudio: `beep`/`noise`, `SFX.*`, `TRACKS` y el secuenciador |
| `js/07-state.js` | Estado global (flags de progreso, `player`, `say()`, toasts) |
| `js/08-world.js` | `loadScreen()` (spawnea pantalla desde el mapa), colisiones, partículas |
| `js/09-player.js` | Movimiento, `attack()` (toda interacción con Z), remolino, tienda de Tilo |
| `js/10-progress.js` | Guardado (3 slots), `questList()` (misiones derivadas del estado), `giveItem()`, `bloom()` |
| `js/11-enemies.js` | IA de los bichos comunes (`updEnemies`) |
| `js/12-update.js` | Máquina de estados (`update()`): boot/título/archivos/cine/juego/diálogo/tienda/pausa + jefes |
| `js/13-render.js` | Todo el dibujado: escena, Gran Roble, HUD, diálogos, pausa, tienda, título, boot GB |
| `js/14-input.js` | Teclado, táctil, mando, escalado entero |
| `js/15-boot.js` | API de debug `window.__sprout`, PWA, arranque y bucle a 60 Hz |

Regla de oro: **los datos no llaman a la lógica**. Sprites, tiles, mapas y
textos (02–05) son declarativos; la lógica (08–12) los consume. Si un texto
necesita decidir según el estado, es una función que se evalúa al hablar
(patrón `NPC_TALK`).

## Recetas para crecer

**Una pantalla nueva** → añade la clave `'x,y'` a `MAPS` (04). Si toca con
una existente, las transiciones funcionan solas. Pantallas "interiores"
(casa `9,9`, tienda `8,9`) usan claves fuera del mundo y entradas/salidas
explícitas (`placeAt`, tile `x` de felpudo en 09/12).
⚠️ Al EDITAR una pantalla existente, no tapies sus bordes compartidos:
comprueba que cada borde abierto del vecino siga teniendo celdas libres
enfrente (el atasco de la pradera este '2,1' vino de cerrar las filas 0-2
del borde con el lago). Red de seguridad: `findFree` (12) busca hueco en
ambos ejes y `tryMove` (09) deja salir andando si quedas incrustado.

**Un tile nuevo** → `TILES['χ']` en 03 con `mkTile`; añádelo a `SOLID` si
bloquea. Úsalo en los mapas. Si tiene interacción con Z, su rama en
`attack()` (09); si spawnea algo al cargar, su rama en `loadScreen()` (08).

**Un enemigo nuevo** → sprite en 02, entrada en `E_SPR`, marcador en
`ENEMY_MARK` + caso en `spawnEnemy` (08), IA en `updEnemies` (11), dibujo en
`drawEnemy` (13).

**Una misión nueva** → una entrada en `questList()` (10) derivada de flags.
Las misiones NUNCA guardan estado propio: se calculan, así no mienten.
Los avisos (toasts) salen solos al cambiar la lista.

**Un objeto comprable** → entrada en `shopList()` + efecto en `buyShop()` (09).

**Una pista musical** → en `TRACKS` (06): melodía `[midi,corcheas]`,
acordes por compás, `beats:3|4`. Actívala en el selector de `loadScreen` (08).

**Progreso nuevo** → flag en 07, persistencia en `save()`/`loadGame()`/
`newGame()` (10), y sus efectos visibles (¡siempre!): mundo (08/13),
diálogos (05), misiones (10).

## Convenciones

- 160×144 lógicos; UI inferior de 16px; pantallas de 10×8 tiles.
- Paleta GBC contenida: usa `PAL`/`C` antes que hex nuevos.
- El lore manda: Raíz ES el Gran Roble; el Viento es su hermano; Sprout es
  la novena bellota. Todo cambio visible debe contar progreso (árbol,
  altares, flores del pueblo, clima ambiental por región).
- **Ningún jefe muere**: a 2 PV entran en `st:'yield'` y ceden su tesoro
  al hablarles con Z (el daño se clampa a 2 en hoja/bomba/tornadito).
  El cartel de presentación sale de `bossCard`; el tema, de `TRACKS.jefe`.
- **Diálogos**: `say(pages,cb,who)` y `ask(pages,who,cb)` (última página:
  Z=sí/X=no → `cb(bool)`). Caja FIJA de 3 líneas que se coloca arriba si
  Sprout anda por la mitad inferior (nunca lo tapa). `paginate()` (07)
  envuelve con `wrapText` y trocea cada página en pantallas de 3 líneas:
  no hace falta contar caracteres en el guion. Si `who` está en
  `PORTRAITS` (02), sale su retrato a lo Golden Sun (texto a 13 columnas).
- Permutas de tiles = SOLO visuales (en `renderScreenTo`): la colisión usa
  el char original del grid. Tile con "césped propio" → crea su variante
  (`wr/wS/nr/nS/ar/aS...`) o quedará verde fuera de temporada.
- Guardado: `localStorage` por slots (`sprout.save.s0..2`). Campo nuevo =
  tocar `save()` + `loadGame()` + `newGame()`.
- El audio del navegador nace en el primer gesto: por eso existe el boot
  GB (NAHUELGABE™). Nada debe sonar antes de `audio()`.

## Debug

`window.__sprout` en consola: `info()`, `warp(sx,sy,x,y)`, `gear()`,
`addBerries(n)`, `win()/thaw()/summer()/cycle()/meet()`, `shopUI()`,
`quests()`, `freeze(n)` (congela `n` frames), `cine(p,f)`, `playTrack(n)`,
`winds()`, `tick()`… Para tests visuales: congela con `freeze(100000)`
ANTES de capturar (las capturas tardan) y `freeze(0)` para soltar.
