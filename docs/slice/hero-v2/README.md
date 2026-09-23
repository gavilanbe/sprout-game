# Sprout · contrato del personaje

La primera demo mezclaba dos dibujos generados diferentes al cambiar de andar a atacar. También recortaba cada fotograma por su silueta, alterando su centro visual, y avanzaba las piernas por tiempo aunque el jugador estuviera bloqueado.

La revisión fija una única identidad con piezas de imagen reutilizadas: cuatro vistas de cabeza y torso, brazos, manos, botas, hoja y efecto de corte. Los estados se componen con estas piezas; el rostro y la escala no se regeneran al cambiar de acción.

## Inventario del protagonista

| Estado | Uso |
|---|---|
| Reposo | Respiración sutil, apoyo fijo |
| Caminar | Contacto, impulso y paso; dos piernas alternas |
| Golpe de hoja | Anticipación, arco activo, continuación y vuelta al reposo |
| Esquiva | Preparación, inclinación y recuperación |
| Daño | Reacción breve sin hacer desaparecer al personaje |
| Interactuar | Acercar una mano a un objeto |
| Recoger | Sostener la semilla sobre la cabeza |
| Plantar | Inclinarse, dejar la semilla y erguirse |
| Marchitarse | Caer y recogerse sobre el suelo |
| Rebrotar | Recuperar la postura al reaparecer |

Cada estado existe en sur, oeste, este y norte, con celda y ancla comunes. El dibujo de la hoja y el destello del ataque también forman parte del kit. Las sombras y partículas son efectos del motor.

## Movimiento

Simulación fija a 60 Hz, velocidad en píxeles/segundo y pasos ligados a distancia real. Direcciones diagonales normalizadas; pulsar WASD y flechas equivalentes no duplica la velocidad. La animación se detiene al chocar. Ataques y esquivas aceptan una pulsación anticipada breve y mantienen su orientación. Las colisiones se resuelven en subpasos para no atravesar obstáculos.

El taller y el juego importan el mismo controlador y el mismo renderizador de Sprout. Los PNG exportados son las celdas utilizadas por ese renderizador.
