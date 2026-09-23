# La primera semilla

Demo jugable del mismo universo de SPROUT, con arte generado por imagen. Abrir `slice.html` desde un servidor estático; no requiere build. El enlace también aparece en el juego original. La demo no lee ni escribe sus partidas guardadas.

```sh
python3 -m http.server 8741
# http://localhost:8741/slice.html
npm run test:slice
npm run assets:slice
```

## Lo que se puede jugar

Tres pantallas: el claro, el arroyo y la arboleda. Caminar en cuatro direcciones; hablar con Tilo; cortar arbustos; esquivar; apartar limos con dos golpes; abrir el cofre; volver y plantar la semilla. La primavera hace aparecer flores. Al perder los cinco corazones se vuelve al claro y se conserva el progreso de la demo. Teclado y controles táctiles; pausa al perder foco; audio opcional sintetizado; reinicio y visor de animaciones. Una pulsación de Z avanza cada diálogo.

Flechas / WASD para caminar, Z / espacio para actuar, X para esquivar, Enter / Escape para pausar. La demo dura aproximadamente 2–4 minutos y no guarda progreso al recargar.

## Resolución y reutilización

El juego compone a **320 × 288**: campo de 320 × 256, tiles de 32 y HUD de 32. Mantiene la proporción 10:9 de la pantalla de Game Boy, con el doble de resolución en cada eje respecto al juego original. Es una interpretación visual, no una ROM ni una emulación fiel del hardware.

Los tres másteres generados miden **1254 × 1254**. Están en `assets/slice/`, intactos. Aunque los prompts pedían un lienzo y una cuadrícula exactos, la salida generativa no los garantiza. `assets.js` usa las dimensiones reales, recorta las 16 celdas, alinea el apoyo de los pies al caminar y adapta el arte a la resolución de juego. La hoja de ataques salió con un damero neutro opaco; también se intentó corregir con image_gen, pero la segunda salida siguió siendo opaca. El cargador aplica una clave de color al damero, que no coincide con los colores saturados del personaje. La exportación preparada tiene alfa real.

**Reducir un máster sí descarta detalle.** Por eso se conservan ambas versiones: original y preparada. Lo que no pierde nitidez es ampliar las versiones de juego por múltiplos enteros mediante nearest-neighbor. No se aplica suavizado al canvas ni filtros a la pantalla.

Los PNG de **`assets/slice/ready/`** se pueden importar directamente en un motor:

| Archivo | Hoja | Celda | Organización |
|---|---|---|---|
| `sprout-walk.png` | 128 × 144 | 32 × 36; pies en (16,34) | 4 filas: sur, oeste, este, norte; 4 fotogramas por fila, 9 fps |
| `sprout-attack.png` | 192 × 192 | 48 × 48; ancla en (24,42) | Las mismas direcciones; 4 fotogramas, 12,5 fps |
| `woodland.png` | 256 × 256 | 64 × 64 | 16 tiles/props; nombres en `atlas.json` |

Usar filtrado nearest, sin mipmaps y coordenadas de dibujo enteras. El suelo y los objetos pequeños se muestrean a 32 y se exportan a 2×; el roble se muestrea a 64. El puente del máster es vertical: en el juego se gira 90° para cruzar el arroyo horizontalmente.

La herramienta integrada **image_gen** generó todo el arte de personajes, ataques, enemigos, terreno y objetos. La composición, HUD, texto, sombras y partículas se dibujan por código. Prompts completos: [personaje y bosque](prompts.md), [ataque y corrección](actions-prompt.md).

## Código y pruebas

`js/slice/assets.js`: carga/normalización. `world.js`: salas y colisiones. `pixels.js`: tipografía de píxel. `game.js`: controles, combate, misión, audio y dibujo. `slice.css`: presentación adaptable. `scripts/export-slice.cjs`: exportación reproducible de las celdas de juego.

`tests/slice.cjs` comprueba carga/alfa, cuatro direcciones, agua/puente, cortar y conservar el paso, daño único por golpe, bloqueo del cofre, vuelta por las salas, final, pausa, visor, audio, reinicio, pérdida de foco y móvil. La API de prueba solo se expone con `?test`.
