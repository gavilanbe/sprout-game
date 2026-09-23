# SPROUT y las 8 semillas — arquitectura

Zelda-like estilo Game Boy Color (160×144, tiles de 16 px) sin dependencias ni
build: HTML + canvas + WebAudio. Se sirve con cualquier estático
(`python3 -m http.server 8741`) y funciona como PWA.

## Cómo está organizado

Los módulos son **scripts clásicos cargados en orden** desde `index.html`.
Comparten el ámbito global (como un solo script troceado): cualquier `let`,
`const` o `function` de nivel superior es visible desde los módulos
siguientes. Por eso **el orden de carga importa** y los ficheros van
numerados — datos primero, lógica después, arranque al final.

| Módulo | Qué vive aquí |
|---|---|
| `js/00-version.js` | `GAME_VERSION` (la escribe `scripts/version.cjs`; sale en el arranque) |
| `js/01-core.js` | Canvas, constantes (`TILE`, `VW/VH`…), paletas `PAL` (sprites) y `C` (mundo), utilidades (`hash`, `mkCanvas`, `mix`, `shade`) |
| `js/01a-font.js` | Tipografía de píxel propia: `FONT_M` (proporcional, mayúsculas de 7 px, tildes) y `FONT_S` (versalitas de 5 px). `drawText`, `textW`, `wrapPx`. Atlas en blanco + tintado cacheado |
| `js/02-sprites.js` | `spr`/`sprN` (filas de texto → canvas), héroe (4 direcciones, 2 fotogramas, ataque, alzar objeto), vecinos, criaturas (`E_SPR`), minijefes 24 px y guardianes 32 px (`BOSS_SPR`), objetos, amuletos, iconos, logo y Gran Roble |
| `js/03-tiles.js` | Arte de tiles procedural con caché (`cached`), paletas por bioma (`BIOMES`), **autotiles** (agua, acantilado, muro, camino, arena, barro), leyenda (`GROUND`, `SOLID`, `ENEMY_MARK`…) y `renderScreenTo()` |
| `js/04-maps.js` | `MAPS`: cada pantalla es 8 strings de 10 chars. Leyenda completa en la cabecera. `CHESTS` (cofres) y `PLACE_NAMES` |
| `js/05-texts.js` | `TXT`, `AMULETS`, `DIARY`, `RUNAS`, `NPC_TALK`, `CINE`, treguas, `MID_INTRO`, `ROOM_HINTS`, `CREDITS` — todo el guion |
| `js/06-audio.js` | Chiptune WebAudio: buses de música y efectos (`musicBus`/`sfxBus`, volúmenes de `opts` con `applyVolumes`), un bus por voz con paneo y eco, `beep`/`noise`/`note`, batería `DRUMS`, `SFX.*` y `TRACKS` (19 pistas; cada vuelta varía: octava con arpegio, dúo armonizado, redobles). `setTrack` ignora pistas desconocidas; `musicIntensity(0-2)` acelera y espesa las pistas `adaptive` (jefes); `musicAmbush(on)` pone `emboscada` y devuelve la anterior |
| `js/07-state.js` | Estado global (flags de progreso, `player`, inventario, amuletos), `hurt()`, `say()`/`ask()` y `paginate()` |
| `js/08-world.js` | Regiones y biomas (`regionOf`, `screenBiome`), `loadScreen()` (spawnea la pantalla), fondo pre-renderizado (`rebuildBg`/`markDirty`), colisiones, partículas |
| `js/08a-fx.js` | Efectos: partículas con tipo (`dust`, `spark`, `smoke`, `blade`, `mote`, `leafF`, `firefly`, `ripple`), `stepDust`, `hitSpark`, `deathPoof`, `bladeBits`, `collectBurst`, ambiente por lugar, destello de pantalla y viñeta de daño |
| `js/09-player.js` | Movimiento con deslizamiento en esquinas, Hoja, remolino, empujar bloques, cortar, cristales, antorchas, `interact()` (todo lo que se hace con Z), objetos de X (`useItem`), gancho, vaina, salto, tiendas |
| `js/10-progress.js` | Guardado (3 slots), `newGame()`, `questList()` (derivada del estado), entregas visibles, `bloom()` |
| `js/11-enemies.js` | IA de las criaturas (`updEnemies`; las del molino —cuervo, caballero de hoja, raíz trampa— en `updMillEnemy`), daño (`damageEnemy`), escudo |
| `js/12-bosses.js` | Los guardianes Topo, Reina y Viento y los minijefes Rey, Zángano y Guardián de Hielo (el Ciervo de Ámbar y el Espantapájaros viven en 12b; aquí se despachan) |
| `js/12a-dungeon.js` | Mazmorras: emboscadas (`ROOM_RULES`: las puertas se cierran hasta vencer; recompensa llave/cofre), cofres con contenido (`openChestContent`: mapa, brújula, llave, cuarto, bayas, zurrón de bellotas), belloteros que rebrotan, sprites de mapa/brújula/zurrón |
| `js/12b-molino.js` | El Molino de la Hojarasca (mazmorra 4, región `molino`, 18-20 × -1..2): registro en las tablas compartidas (`DUNGEON_*`, `REGION_ANCHOR`, `ENEMY_MARK` κ η ρ, `MIDBOSS_MARK` Ξ, `BOSS_MARK` Λ, `ROOM_RULES`, `CHESTS`, `ROOM_HINTS`, `PLACE_NAMES`); el molinillo (`usePinwheel`, ráfagas `gusts`/`updGusts`), hojarasca `ξ` (`LEAF_HIDE`: suelo, agujero, bayas o cuarto; `opened` `LF…`), molinetes `ψ` (`MILL_RULES`: `all` permanente o `any` mientras giran), ventisquero `∩` del Sendero (`SD…`), altar del otoño `{`; el Espantapájaros (`makeScare`/`updScare`) y el Ciervo de Ámbar (`makeCiervo`/`updCiervo`/`ciervoPeace`); arte de suelo, paredes, molino de la Ciénaga, penumbra y haces de luz (`drawMillBack`/`drawMillFront`) y de sus bichos (`drawMillEnemy`; la IA, `updMillEnemy` en 11) |
| `js/12b-gear.js` | Las mejoras del equipo: temples de la Hoja y rayo de hoja, carga y Gran Remolino, escudo visible y parada (Escudo de Roble), gancho que atrapa, vaina cargada, llamarada del farol, planeo del vilano y efectos de los amuletos |
| `js/12c-secrets.js` | Secretos del valle: escondites en `ny=10` (región `secreto`; puertas `HIDEOUT_DOORS`, escaleras `HIDEOUT_STAIRS`, salidas `HIDEOUT_EXITS`), grieta del risco `⊂` y tesoro `✕` (bomba → `blastSecret`), cebo `◊`, registro `SECRETS`; cadena de trueques `TRADE`/`tradeInteract` (8 pasos → amuleto `trebol`); la pesca con Moss (`startFishing`/`updFishing`, estado `fish`, dibujo en `drawFishing` de 15-ui); se guarda en `save.side` |
| `js/13-update.js` | Máquina de estados (`update()`): boot/título/archivos/cine/juego/diálogo/pausa/tienda/gancho/caída/créditos; bombas, proyectiles, tornaditos, vaina, recogibles, salidas |
| `js/14-render.js` | Escena: fondo cacheado, Gran Roble, actores ordenados por profundidad, jefes, gancho, partículas, oscuridad con luz, barra de jefe |
| `js/15-ui.js` | HUD, diálogo con retrato, cartel de jefe, avisos, tiendas, cinemática, título, archivos, encendido, créditos, `draw()` |
| `js/15a-intro.js` | Intro del título por planos, escena del título (el Roble en su colina: se mece, rayos, pájaros, Sprout que saluda; primavera y verano llegan floreciendo desde la copa, otoño e invierno con una ráfaga del Viento), el selector de partida **«Elige tu brote»** (la cámara baja a tres macetas: brote dormido, despierto bajo un rayo de luz, o semilla libre; ficha de madera con capítulo, tiempo, corazones, semillas, reliquias, amuletos y cartas) y el prólogo en siete planos |
| `js/15b-zurron.js` | El **zurrón** (menú de pausa) como bolsa de cuero: texturas de cuero, forro y solapa hechas píxel a píxel; foto del mundo apagada detrás (`zShoot`); guion de entrada y salida (`openZurron`, `closeZurron`, `zTick`, `zPose`: cae, se aplasta con polvo, la hebilla salta, la solapa se levanta y lo destapado salta a su sitio; al cerrar, sale volando mientras el juego sigue, `drawZurronOut`); pestañas que se deslizan (`zTabTo`), placa de latón que gira, cursor que planea (`zSel`), las cinco páginas (`drawBag` con objetos, amuletos que vuelan a su engarce y la fila de EQUIPO; mapa y mapa de mazmorra; el valle; recuerdos, que se leen con el zurrón detrás; ajustes y controles) y su navegación (`updBag`). Pinta en su propio lienzo cambiando `ctx` un momento (por eso `ctx` es `let` en 01-core) |
| `js/15c-marchitar.js` | Marchitarse y rebrotar: `wiltBegin`/`updWilt`/`drawWilt` (el mundo se apaga, Sprout se seca por piezas y se deshace en polvo, la hoja viva, el foco y la bajada por la tierra `SOIL`), `dreamBegin`/`updMarchito`/`drawMarchito` (state `over`: anillos por píxel con ondas por filas y paletas por capítulo `DREAM_PALS`, raíces con savia, la voz del Roble según jefe, minijefe, mazmorra, región y veces, SÍ/NO), `rebrotar()` (la reaparición de siempre) y `updRebrote`/`drawRebroteHero`/`drawRebroteFx` (`sproutT`: la luz se recoge, germina con el motivo, sale de un salto, el vigor se rellena, savia durante la invulnerabilidad). Sonidos en `WSFX`; pistas `marchito` y `silencio` en 06 |
| `js/15d-momento.js` | El momento del arma: `MOMENT_ARMS` (paleta y frase de cada arma y herramienta), `startMoment` (desde `getItem`), `updMoment`/`endMoment` (en el estado `itemget`; `itemT=0` lo corta como antes) y `drawMoment` (la atrapa, la pose con rayos y la viñeta congelada: `momentPosterize` en cuatro tonos con tramado, líneas de velocidad, empujón de cámara, el arma a 4×, cinta con el nombre, frase a máquina y fundido de vuelta). Sonidos `momentCatch` y `momentFreeze` en 06 |
| `js/16-input.js` | Teclado reasignable (`opts.keys`, `assignKey` intercambia si choca, `resetKeys`; WASD/espacio/Esc como alternativas; `keys.menuHeld`), mando con vibración (`rumble`) y la lógica de la pestaña AJUSTES (`OPT_ROWS`, `updOptions`, `updRemap`); se dibuja en `drawOptions`/`drawRemap` de 15b |
| `js/16a-shell.js` | La consola de la página: `present()` copia `cv` (160×144, oculto) a `#screen` con píxeles exactos (escala entera directa; si no, múltiplo entero y suavizado) más la rejilla LCD (`lcdGrid`); `fit()` elige consola horizontal o vertical y la escala (entera en escritorio; en móvil, a pantalla completa con mandos de pulgar); etiquetas, logotipo gavilanbe y logo de SPROUT pintados con la fuente del juego (`pixCanvas`, `textArt`, `shellLabels`); mandos por puntero (cruceta que se desliza en 8 sentidos, botones con captura, vibración), botones que se hunden con teclado o mando y el LED de la savia (`shellFeedback`), colores de carcasa (`SHELL_THEMES`, `applyShellTheme`), MÚSICA (`toggleMusic`) y pantalla completa. El arranque «gavilanbe®» (`GAVI_GLYPHS`, `drawBoot`) vive en 15-ui |
| `js/16b-pwa.js` | La aplicación: registra `sw.js` (`updateViaCache:'none'`), avisos en píxeles (`showNotice`: versión nueva, actualizado, listo sin red, instalar, pista de iPhone), actualizaciones (`controllerchange` → se aplica sola en arranque/título/partidas; jugando, aviso y al volver al título; guarda antes con `pwaApply`), `beforeinstallprompt`, pantalla encendida (`wakeLock`), pausa + guardado + audio suspendido al ocultarse la app, almacenamiento persistente |
| `js/17-boot.js` | API de debug `window.__sprout`, arranque y bucle a 60 Hz |

Regla de oro: **los datos no llaman a la lógica**. Sprites, tiles, mapas y
textos (02–05) son declarativos; la lógica (08–13) los consume. Si un texto
necesita decidir según el estado, es una función que se evalúa al hablar
(patrón `NPC_TALK`).

## El render

`loadScreen()` marca el fondo sucio; `rebuildBg()` pinta la pantalla entera
cuatro veces (fotogramas 0–3 de agua, hierba alta, flores y antorchas) en
`bgCanvas`, y en paralelo `fgCanvas` recoge lo que sobresale por encima de los
actores (la copa de los árboles asoma 6 px sobre la celda de arriba y tapa a
quien pasa por detrás). Cada frame: fondo → actores ordenados por los pies →
primer plano → sombras de nubes → partículas → oscuridad → destellos. Cualquier
cambio en `grid` (cortar, abrir, empujar, encender) llama a `markDirty()`.

Copas, arbustos y rocas salen de `blobArt()` (01): lóbulos esféricos con luz
desde arriba-izquierda, sombra de contacto entre lóbulos, tramado Bayer 4×4 y
contorno. El texto nunca usa `fillText`: todo pasa por la fuente de píxel (01a),
así no hay suavizado ni escalados a 0,75×. Los diálogos se reflujan por ancho
real (`wrapPx`), no por número de caracteres.

Los tiles se generan una vez y se guardan en `TILE_CACHE` por clave
(clase + variante + bioma + fotograma). Los autotiles calculan un bitmask de
vecinos (`edgesOf`) y componen bordes en lugar de dibujar 47 variantes a mano.
Las permutas de estación son solo visuales: la colisión usa el char del grid.

## Recetas para crecer

**Una pantalla nueva** → añade la clave `'x,y'` a `MAPS`. Si toca con una
existente, las transiciones funcionan solas. Los bordes compartidos deben
tener celdas libres enfrente (el test `Grafo del mundo` lo comprueba).
Interiores y mazmorras usan claves fuera del valle y entradas explícitas
(`placeAt`, felpudo `x`).

**Un tile nuevo** → función de dibujo en 03 (`cached(...)`), rama en
`drawGround`/`drawObject`, alta en `GROUND` o `SOLID`. Si tiene interacción
con Z, su rama en `interact()` (09); si spawnea algo al cargar, su rama en
`loadScreen()` (08).

**Un enemigo nuevo** → sprite en 02 y entrada en `E_SPR`, marcador en
`ENEMY_MARK` + caso en `spawnEnemy` (08), IA en `updEnemies` (11), dibujo en
`drawEnemy` (14).

**Un objeto de X** → flag en 07, `getItem()` y `useItem()` en 09, icono en
`X_ICON` (15), añadir a `X_ITEMS` (13) y a `save()`/`loadGame()`/`newGame()`.

**Un amuleto** → entrada en `AMULETS` (05), sprite en `AMULET_ROWS` (02), su
efecto donde toque (consultando `hasAmulet('id')`), y un sitio donde
conseguirlo: `CHESTS` (04), tienda de Corteza (09) o regalo de un vecino.

**Una misión nueva** → una entrada en `questList()` (10) derivada de flags.
Las misiones NUNCA guardan estado propio: se calculan, así no mienten.

**Progreso nuevo** → flag en 07, persistencia en `save()`/`loadGame()`/
`newGame()` (10), y sus efectos visibles (mundo, diálogos, misiones).

## Convenciones

- 160×144 lógicos; UI inferior de 16 px; pantallas de 10×8 tiles.
- Paleta contenida: usa `PAL`/`C`/`BIOMES` antes que hex nuevos.
- El lore manda: Raíz ES el Gran Roble; el Viento es su hermano; Sprout es
  la novena bellota. Todo cambio visible debe contar progreso.
- **Ningún jefe muere**: a 2 PV entran en `st:'yield'` (o `rest` el Viento) y
  ceden su tesoro al hablarles con Z. Los minijefes sí caen y sueltan su
  herramienta.
- **Diálogos**: `say(pages,cb,who)` y `ask(pages,who,cb)`. Caja fija de 3
  líneas arriba o abajo (nunca tapa a Sprout). Si `who` está en `PORTRAITS`,
  sale el retrato (16 o 32 px). Los avisos (toasts) esperan a que no haya diálogo.
- Guardado: `localStorage` por slots (`sprout.save.s0..2`).
- El audio nace en el primer gesto: por eso existe el boot GB. Nada suena antes
  de `audio()`.
- Puertas con cerrojo y de guardián van en el **lado por el que se entra**
  (la transición coloca al jugador en el borde de la sala siguiente).

## Debug y pruebas

`window.__sprout` en consola: `info()`, `warp(sx,sy,x,y)`, `gear()`,
`allAmulets()`, `addBerries(n)`, `win()/thaw()/summer()/cycle()`, `killBoss()`,
`giveKey()/bigKey()`, `solvePlates()`, `pause(p)`, `shopUI(kind)`, `equip(a,b)`,
`setX(k)`, `freeze(n)`, `cine(p)`, `title(t)`…

`tests/verify.cjs` arranca el juego en Chromium (Playwright), pone
`window.__manual=true` para conducir `update()` a mano y comprueba arranque,
mapas, puzles, objetos, jefes y guardado.

## La aplicación (PWA) y las versiones

- `manifest.webmanifest`: nombre, iconos (`icons/`, normales y *maskable*), capturas, pantalla completa y cualquier orientación. Los iconos y las pantallas de arranque de iOS (`icons/splash-*.png`, enlazadas en `index.html`) se dibujan con los sprites del juego: `node scripts/icons.cjs`.
- `sw.js`: precarga atómica por versión (`sprout-<versión>`), el juego arranca siempre de la caché, lo demás red primero con copia (`sprout-runtime`). Se activa al instalarse; la página decide cuándo recargar (16b).
- `scripts/version.cjs`: la versión es la fecha del último cambio más un hash del contenido de todo lo precargado; reescribe `VERSION` y la lista `PRECACHE` de `sw.js` (desde los `<script>` de `index.html`) y `js/00-version.js`. **Ejecútalo antes de cada commit** (`npm run bump`); `--check` lo usa una prueba.
- `.nojekyll`: GitHub Pages sirve los ficheros tal cual.

