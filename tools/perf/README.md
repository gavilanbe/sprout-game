# ⚡ Rendimiento de SPROUT

Dos herramientas para optimizar sin miedo: una **mide** y la otra **demuestra
que no ha cambiado ni un píxel**.

```sh
npm run perf                               # coste por fotograma de ~30 escenas y de cargar cada pantalla
node tools/perf/bench.cjs --throttle 4     # igual, con la CPU 4× más lenta (un móvil medio)
node tools/perf/bench.cjs --ops            # órdenes de dibujo por fotograma (no depende de la carga)
node tools/perf/bench.cjs --profile plaza  # qué funciones pesan, y quién pide cada drawImage/fillRect
node tools/perf/bench.cjs --boot           # el arranque, hasta el primer fotograma
npm run perf:pixels                        # ¿pinta lo mismo que el último commit? (o: node tools/perf/pixels.cjs HEAD~3)
```

## Las escenas

`scenes.js` define unas treinta situaciones del juego, cada una desde una partida
limpia y **determinista**: `Math.random` sembrado, `tick` a 0 y el título al
reloj de fotogramas (el del audio va en tiempo real). Son el arranque, la intro
y el menú del título, la plaza del Roble, el pueblo, una pelea, el norte nevado,
la marisma, una cueva a oscuras y una con farol, el panal, los cuatro
guardianes, tres cinemáticas de arma y las ocho seguidas, el rito de una reliquia,
una cinemática de estación, cruzar una puerta, el zurrón, un diálogo, los cinco
marcos de texto, las transiciones entre pantallas, el final, los créditos y
marchitarse hasta el sueño.

`pixels.cjs` saca la revisión de referencia a una carpeta temporal (un
`git worktree`) y pasa las mismas escenas por las dos versiones: guarda una
huella de los píxeles de cada 5.º fotograma y las compara. Si sale
**«idéntico»**, ninguna escena ha cambiado en ningún píxel. Es la red de
seguridad con la que se hizo la pasada de rendimiento de 2026: casi 4 000
fotogramas y los 512 lienzos de arte generados, idénticos antes y después.

## Qué se optimizó (y por qué da lo mismo)

- **Pintar solo cuando el juego avanza.** En pantallas de 90-144 Hz el mismo
  fotograma se pintaba dos veces o más.
- **La rejilla del LCD, una sola vez.** Va en su propia capa (`#lcd`) y se dibuja
  al cambiar de tamaño; antes era una copia a pantalla completa en cada fotograma.
- **Píxeles a un búfer.** Generar arte a golpe de `fillRect(x,y,1,1)` es lento:
  `pxBuf`/`pxCtx`/`pxStamp` (en `01-core.js`) escriben los píxeles opacos en un
  búfer de 32 bits y los vuelcan de una vez. Con colores opacos, el resultado es
  idéntico; con transparencias se sigue pintando como siempre (Chrome redondea
  distinto al mezclar un bloque que píxel a píxel).
- **Menos órdenes de dibujo.** Chrome acumula las órdenes y las rasteriza por
  tandas: miles de órdenes pequeñas provocan tirones. El texto repetido se
  guarda como tira compuesta, los marcos de diálogo como imagen (en vivo solo
  la sombra, el brillo que se sale y las hojas que se mecen), las tiras del
  Roble y del muñeco grande se copian juntas cuando llevan el mismo
  desplazamiento, y el fondo del sueño se calcula ya ondulado y se pega de
  una vez. De media, la mitad de órdenes por fotograma.
- **Los ratos libres.** `idleTask` pone en cola trabajo corto que el bucle hace
  cuando al fotograma le sobra tiempo: el arte de la tormenta del título
  (antes, un parón de ~0,4 s en un móvil al empezar el título), la tierra de
  marchitarse, las armas de las cinemáticas, los fotogramas animados del fondo
  al cambiar de pantalla y las pantallas de al lado, que quedan precalentadas.
- **Sin basura en las cinemáticas.** Las cachés del muñeco grande y de la cara
  de cerca reciclan el lienzo que sale; los rayos giratorios comparten un mapa
  polar grande en vez de recalcular senos para cada centro.

Resultado, con la CPU a 4× (móvil medio): el primer fotograma llega en ~0,85 s
(antes ~1,25 s); cada fotograma cuesta entre un 25 % y un 40 % menos en
menús, diálogos, zurrón, jefes, créditos y marchitarse; cambiar de pantalla, un
35 % menos; y las cinemáticas de arma pasan de 17-34 fotogramas lentos a 5-14.
