# 🎬 El tráiler de SPROUT

El tráiler no está editado en ningún programa de vídeo: lo **renderiza el propio
juego**. Un compositor (`compositor.js`) se inyecta en la página, arranca
partidas limpias, las pone en escena (`shots.js`), graba cada plano fotograma a
fotograma y lo monta a tempo con la música del juego (`timeline.js`). Todo lo que
se ve es juego real: mismos sprites, mismos efectos, mismas pantallas.

| Formato | Resolución | Para |
|---|---|---|
| `16x9` | 1920 × 1080 · 60 fps | YouTube, web, presentaciones |
| `9x16` | 1080 × 1920 · 60 fps | Reels, TikTok, Shorts |

```sh
npm run trailer              # los dos formatos (necesita ffmpeg para los MP4)
node tools/trailer/render.cjs 9x16
node tools/trailer/render.cjs 16x9 --no-encode          # solo fotogramas y audio
node tools/trailer/render.cjs 16x9 --from 2400 --to 2881 # un tramo (sin audio)
```

Sale todo en `tools/trailer/out/` (ignorado por git): una carpeta de PNG por
formato, `audio.wav` y `sprout-trailer-<formato>.mp4`, normalizado a −14 LUFS.

## Cómo funciona

- **La música es la del juego.** El secuenciador de `06-audio.js` suena en un
  `OfflineAudioContext` cuyo reloj avanza 1/60 s por fotograma renderizado; el
  montaje cambia de pista en el tiempo exacto de un compás (`trackAt`) y los
  cortes caen en los pulsos: tema del título (126 ppm), *desafío* (162),
  *estación* (120), un silencio y el tema otra vez para el clímax.
- **Los efectos del juego suenan donde se ven.** Cada plano se rueda justo
  antes de necesitarlo y, mientras se graba, el reloj del audio se pone en el
  instante del tráiler en que se verá ese fotograma. Los ensayos van en
  silencio, Sprout no recibe daño y la música del juego no puede cambiar de
  pista por su cuenta.
- **Píxeles a escala entera y par** (12× a sangre en 16:9; 8× y 6× en vertical),
  así el submuestreo 4:2:0 del H.264 no mancha los bordes. El texto es
  vectorial ([Fredoka](https://fonts.google.com/specimen/Fredoka), licencia OFL,
  en `fonts/`) con una sombra suave, y en vertical el juego flota sobre su propio
  reflejo desenfocado.
- **Sin spoilers.** Enseña el valle, las ocho armas, las mazmorras, cuatro
  guardianes, las estaciones y la revelación del título; nada de la historia.

## Piezas

| Archivo | Qué hace |
|---|---|
| `compositor.js` | `TR`: lienzo del formato, grabación de planos (`capture`), dibujo a escala entera, texto (`vtext`, `vwords`), transiciones, efectos de sonido y el director (`frameAt`) |
| `shots.js` | Cada plano como `{setup, pre, len, input(i), each(i)}` sobre una partida limpia; `bestY()` busca la fila por la que Sprout camina más lejos |
| `timeline.js` | El montaje: clips `{a, b, draw(u, f)}` y eventos (música y efectos), con el encuadre de cada formato |
| `render.cjs` | Playwright + servidor local + audio offline → PNG, WAV y MP4 |

Para cambiar el montaje, edita `timeline.js`: los tiempos se escriben en
compases (`bB(compás, tiempo)` para el título, `bC` para la acción, `bD` para las
estaciones), así cualquier corte sigue cayendo a tempo.
