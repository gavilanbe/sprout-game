# SPROUT · Tercera pasada: lo que el valle olvidó

> **Estado:** propuesta. Nada de esto está implementado todavía.
> **Spoilers:** todos, incluido el final nuevo.
> Escrito tras revisar el juego en `8a9123e` (26-09-2026). Las referencias a código
> (`fichero:línea`) son de esa versión.

## En una página

Tres problemas y una sola idea para los tres.

- **Las mazmorras** son salas de pelea unidas por puertas que se abren con el objeto
  de turno. De 44 salas, unas diez tienen algo parecido a un puzle; casi ninguno pide
  más de un paso y ninguno sale de su sala.
- **El guion** se contradice (la Reina, la Lágrima, las «tres primaveras», el Susurro)
  y cuenta cinco veces el mismo secreto antes de presentarlo como sorpresa.
- **El final** es el jefe más flojo del juego: encender cuatro braseros, pegar,
  repetir. Y el «nombre» que hay que decirle es «Viento del Norte», que el juego
  pronuncia en cada diálogo desde el primero.

La idea: **el olvido del valle es un monstruo de verdad.** Una polilla gris que se
come lo que nadie usa (la ropa del arcón, las cartas sin abrir, los nombres que nadie
pronuncia), que se comió el nombre del Viento y engordó con él. El gris del valle es su
polvo. Lo que aullaba en la cima no era el Viento: era ella, anidada en su tormenta.

Con eso:

1. **El Viento tiene nombre: CIERZO.** Del Roble el valle recuerda el nombre (Raíz);
   del Viento, solo el oficio. Cada guardián, al rendirse, recuerda un trozo de la nana
   que Cierzo cantaba. En la cima, **el jugador escribe el nombre**.
2. **La cima deja de ser el final.** Es un rescate: cortar el capullo gris que envuelve
   al Viento y decir su nombre. Al oírlo, el Olvido sale de la tormenta y baja a por el
   Roble.
3. **Capítulo 5: El Olvido.** El valle empieza a olvidar (Petra no te reconoce, Raíz se
   queda mudo). El Roble, en sueños, te da **el Anillo del Año**: cambiar la estación de
   la sala en la que estás. Entras en el tronco y lo recorres hacia dentro, anillo a
   anillo y año atrás, hasta la médula.
4. **Un jefe final en cuatro niveles:** la Crisálida (las cuatro estaciones como armas),
   los Ecos (los cuatro guardianes, cada uno en su estación), la Polilla (luz, estaciones
   y todo el equipo) y el Nombre (el valle entero te llama).
5. **Cada mazmorra, una idea que la cambia entera**, y cada objeto con tres usos: la
   Cueva con dos pisos y calor que despierta raíces; el Tronco con rayos de sol; el
   Molino con aspas que giran la mazmorra y ráfagas que empujan a distancia; el Templo
   con hielo de verdad, campanas y corrientes.

**Lo que no cambia:** nadie muere, el Roble y el Viento son hermanos, Sprout es la
novena semilla, el tono (tierno y un poco triste), el arte, la música, las
cinemáticas, el mapa del valle y los ocho primeros pasos con las semillas.

**El listón:** todo lo nuevo llega con su arte, su microcinemática y su juice, al nivel
de las cinemáticas de las armas. La sección 10 lo detalla cosa por cosa.

---

## 1. Lo que hay hoy

### 1.1 Lo que funciona

- **La premisa** de los dos hermanos y el año que se atasca es buena y sencilla.
- **Los jefes no mueren**: se rinden y te hablan, y luego se quedan de huéspedes.
- **La voz escrita más bonita del juego** está en los márgenes: el diario de Raíz
  («Qué raro pedir frío, pensaba yo. Qué raro pedir que algo termine», `js/05-texts.js:336`),
  las cartas del Viento (sobre todo la primera y la quinta), el sueño del Roble al
  marchitarse («Caer no es acabar. Una semilla sabe esperar»), Moss («Otoño podrido,
  dice mi caña. Y mi caña sabe») y Petra («Es como azúcar. ¡El invierno también es
  bonito!»). Hay que conservarla.
- **Una runa ya lo dice todo sin saberlo:** «Y el olvido lo volvió amargo»
  (`js/05-texts.js:143`). Esta propuesta solo le pone mayúscula.

### 1.2 Los agujeros del lore

| # | Problema | Dónde | Por qué importa |
|---|---|---|---|
| 1 | **El secreto final se cuenta antes de tiempo.** Que Sprout es la novena semilla lo dicen la intro del título, el prólogo (`05-texts.js:285-286`), Raíz en su primer diálogo («Tú naciste de su savia», `:18`), Petra (`:290`), la runa de la pradera (`:146-148`) y el libro de tu casa (`:305`). Luego Raíz lo presenta como sorpresa («¿nunca te extrañó...?», `:92`) y, tras los créditos, otra vez, junto con «Yo SOY el Roble» (`09-player.js:286`), que él mismo dejó claro al decir «mi hermano, el Viento» en su primera frase (`:16`). | varios | Una sorpresa que no sorprende deja el final hueco |
| 2 | **El nombre olvidado no está olvidado.** La carta 5 promete «si alguna vez alguien dice mi nombre en voz alta, bajaré» (`:322`); el final es «Traigo tu nombre. VIENTO DEL NORTE» (`:232`). Pero eso lo dice todo el valle desde el minuto uno. | `:232`, `:322` | El centro emocional del juego es un nombre que el jugador nunca busca ni pronuncia |
| 3 | **«Tres primaveras» con el año atascado.** | `:286`, `:290`, `:305` | Sin estaciones no hay primaveras |
| 4 | **La Reina quiere cosas contrarias**: «quería un sol sin fin» (`:66`) frente a «la Reina me pidió un otoño» (`:318`) y «Ella pedía un otoño. No escuché» (`:334`) | `:66`, `:318`, `:334` | Su pelea y su tregua no significan nada si no sabemos qué quería |
| 5 | **De quién es la Lágrima.** «La Lágrima que mi hermano lloró al marcharse» (`:126`), «de un viento que ya no vuelve» (`:210`): una lágrima del invierno es la reliquia del verano | `:126`, `:210` | La reliquia no encaja con su estación |
| 6 | **Por qué robó el Viento.** «De pura pena» (`:282`), «para que el valle durmiera... y nunca más despertara sin él» (`:144-145`), y una carta que anuncia el robo antes de hacerlo (`:320-321`). El Cascabel «lo perdió el propio Viento al huir» (`:309`): ¿huir de qué? | varios | Tres motivos distintos para el acto que lo empieza todo |
| 7 | **El Susurro tiene dos orígenes**: «lo hacen cinco cartas que nadie leyó» (`:310`) y «lo tallé hace mil años con lo que quedó de su voz» (`:329`). En esa misma escena, «Nunca las abrí. Nunca las vi» (`:327`) | `:310`, `:327-329` | Contradicción en la recompensa de la misión más bonita |
| 8 | **Raíz sube al monte**: «Subí a las montañas a verle» (`:116`). Si puede subir, ¿para qué planta a Sprout? | `:116` | Rompe la razón de ser del protagonista |
| 9 | **Nadie explica cómo llegó cada estación a su guardián.** «Dejó presa cada estación» (`:283`), pero no cómo ni por qué ahí | — | Los guardianes son porque sí |
| 10 | El Topo llama «mi hermano» al Viento | `:342` | Detalle, pero chirría |
| 11 | **«Mil» en todas partes**: mil inviernos (prólogo, capítulo 3, diarios, el Puente Roto, el susurro de la cima), mil años (Ciervo, Susurro) | varios | Pierde fuerza y choca con el calendario |
| 12 | «El viento aúlla **tu nombre** con rencor» | `:260` | El Viento no sabe que Sprout existe |
| 13 | **Los minijefes sí mueren** (se deshacen, se desinflan) en un juego cuyos créditos dicen «Ningún guardián ha muerto» (`:247`). Además no tienen historia | `:247`, 15j-15m | Grieta en la regla de oro |
| 14 | «Fuera del pueblo hay monstruos» (`:4`), y nada más | `:4` | Los bichos no tienen razón de ser |
| 15 | Raíz: «No subas a luchar: sube a recordar» (`09-player.js:288`). Y luego, 24 PV de pelea | `09-player.js:288` | El juego contradice lo que acaba de decir |

### 1.3 Los diálogos

- **Raíz habla como un folleto.** Cada cambio de capítulo son 5-7 páginas de
  instrucciones con MAYÚSCULAS («Tus bombas abrirán las grietas de la playa del este. En
  las marismas se alza el TRONCO HUECO»). La lista de misiones ya dice adónde ir.
- **Todos llaman «brote» a Sprout**: Raíz, Lupa, Moss, el Topo, la Reina, el Ciervo y
  el Viento. Al hablarle, nadie suena distinto.
- **Las pistas resuelven**: «Enciéndelos con el FAROL» (`:260`), «Si la ENGANCHARAS con
  la raíz...» (`:259`), «Golpéale por detrás» (`:219`), «Solo el FUEGO lo ablanda:
  bombas» (`:221`, que además llama fuego a las bombas).
- **Las cuatro rendiciones tienen la misma forma**: «¿No me rematas? / Yo solo... /
  Llévate esto».
- Tilo no tiene voz (solo tienda); Corteza, dos frases.

### 1.4 Las mazmorras

| Mazmorra | Salas | Peleas | Algo parecido a un puzle | Lo más difícil que se pide | Para qué sirve el objeto |
|---|---|---|---|---|---|
| Cueva del Topo | 12 | 3 emboscadas, Rey, Topo | 2: bloques a placas (7,0), pulsador (7,1) | empujar dos bloques en línea recta | abrir grietas marcadas; aturdir al Topo |
| Tronco Hueco | 11 | 1 emboscada, Zángano, Reina | 1: el cristal rojo/azul (11,1) | darle al cristal una vez | cruzar agua y agujeros en línea recta; bajar a la Reina |
| Templo de la Cima | 10 | 1 emboscada, Guardián | 3: bloques (14,1), cuatro antorchas (15,0), dos antorchas (16,2) | encender todas las antorchas de la sala | saltar agujeros; encender |
| Molino | 11 | 2 emboscadas, Espantapájaros, Ciervo | 4: laberinto de hojarasca (18,0), dos molinetes (19,1), molinete con tiempo (20,0), tres molinetes en fila (20,-1) | una ráfaga que atraviesa tres molinetes | barrer y girar |

**Por qué se sienten poco inteligentes:**

1. **El objeto es una llave, no un verbo.** Cada objeto abre su tipo de puerta (grieta,
   agua, agujero, antorcha, hojarasca) y ya está. No se combinan nunca.
2. **Todo el estado vive en una sala.** Placas, cristal, antorchas, pulsador y
   molinetes se guardan por sala en `opened` (`PZ`, `CR`, `T`, `G`: `09-player.js:109-163`,
   `08-world.js:197-204`). Nada de lo que haces cambia otra sala, así que la mazmorra no
   es un puzle: es una lista de salas.
3. **La solución está a la vista y además se cuenta** (`ROOM_HINTS`, `MID_INTRO`).
4. **Las llaves se ganan peleando o están en el suelo**: siete emboscadas y una llave
   suelta (11,0). No hay «ajá».
5. **No hay atajos**: la mazmorra no se abre sobre sí misma al avanzar.
6. **Lo único que cambia entre mazmorras es el tipo de puerta.**

### 1.5 El Viento como final

La pelea (`updViento`, `js/12-bosses.js:38`): flota fuera de alcance y te atrae; barre
tu fila (salta con el vilano); enciendes los cuatro braseros con el farol y cae; en el
suelo aguanta cuatro golpes; se levanta apagando de dos a cuatro braseros. Con 24 PV,
según el filo de la Hoja, son de dos a seis vueltas de volver a encender braseros.

- Es **la misma acción que la sala anterior** (15,0: encender cuatro antorchas para
  abrir la puerta del jefe).
- **La bomba, el gancho y el molinillo no sirven de nada**; solo cuentan el farol y el
  vilano.
- La escalada son carámbanos y un segundo barrido. No hay idea nueva.
- La historia dice «no luches, recuerda»; la pelea es una paliza de 24 PV y el recuerdo
  es un diálogo al final.
- Es el cuarto guardián, no un final: no hay mazmorra final, ni punto sin retorno, ni
  nada que use todo lo aprendido.

---

## 2. Principios

1. **Cada estación es un verbo.** No solo una paleta: la primavera hace crecer, el
   verano ilumina y seca, el otoño sopla y cubre, el invierno hiela y detiene.
2. **Nadie es malo; algo tiene hambre.** Ni siquiera el Olvido es malvado: es una
   polilla que ya no cabe en su estación.
3. **Lo que cuenta la historia, lo hace el jugador.** Si el final es decir un nombre, el
   jugador lo busca y lo escribe.
4. **Un secreto se revela una vez.** La ironía dramática vale; las sorpresas falsas, no.
5. **Una mazmorra, una idea que la cambia entera.**
6. **Cada objeto, tres usos**: presentar, desarrollar y torcer. El guardián es el
   examen.
7. **Las pistas insinúan.** La solución la pone el jugador. Si cae, el sueño del Roble
   sí puede ser claro, como hoy.
8. **Cada personaje habla distinto** y llama a Sprout a su manera.
9. **Nada entra sin su momento.** Cada cosa nueva llega con su arte, su microcinemática y
   su juice, al nivel de las cinemáticas de las armas (§10).

---

## 3. La historia nueva

### 3.1 El Olvido

**Qué es.** Una polilla. Siempre ha existido, pequeña, como todas: en el otoño tardío
se come lo que ya cumplió (la hoja seca, la ropa del arcón, el papel del cajón) y deja
sitio. Es parte del año.

**Cómo creció.** El valle le dio de comer de más: cantó al Roble y dejó de pronunciar
el nombre del Viento, invierno tras invierno. Un nombre que nadie dice es comida de
polilla. Se lo comió de las bocas, de las piedras, de las cartas y, al final, de la
memoria de su propio hermano. Con cada cosa olvidada creció un poco.

**Qué hizo.** Anidó en la pena del Viento, en el pico, y le susurró lo que susurran las
polillas: *nadie se acuerda de ti; quítales lo que más quieren y tendrán que buscarte*.
El Viento, que ya no recordaba ni su nombre, bajó en tormenta y arrancó las ocho
semillas. Esa noche, el polvo de sus alas cayó sobre el valle. **Ese es el gris.**
Donde cae, las cosas olvidan para qué sirven.

**Qué quiere.** Comer. Un año que gira se renueva, porque cada estación vuelve a nombrar
las cosas del valle; un año quieto se olvida despacio. El año atascado es un banquete
que no se acaba.

**Cómo es.** Alas gris lila con dos ocelos grandes que parecen ojos vacíos, cuerpo
peludo, antenas de pluma. Deja un polvo gris que apaga los colores. Su paleta es la del
valle mustio (`WILT`) con el violeta de los ecos: **los ecos de los guardianes son lo
que ella guarda de lo que se come**.

**Cómo se ve a lo largo del juego.** Cambia de forma, y cada vez que la ves está más
cerca de la verdadera:

1. **El polvo** (capítulos 0-3): el gris del valle, polillitas en las zonas mustias, el
   polvo que sueltan los guardianes al recibir golpes y la polilla que sale de cada
   minijefe.
2. **La tormenta** (la cima): la ventisca gris que envuelve al Viento. Al decir su
   nombre, en ella se abren dos ocelos del tamaño del cielo.
3. **Las orugas** (los Anillos del Roble): baja al tronco del Roble y sus larvas se
   comen los anillos, que son la memoria del valle.
4. **La crisálida y la polilla** (la médula): se envuelve para comerse el primer anillo
   y sale con su forma verdadera.

**Cómo acaba.** No muere. Cuando el valle vuelve a decir los nombres y el año gira,
**vuelve a su tamaño**: una polillita que se posa en la hoja de Sprout y se va a hacer
su trabajo al otoño tardío. «Hasta el olvido tiene su estación. Lo que no puede comerse
es un nombre que alguien dice.»

**Nombre.** En el valle nadie la ha nombrado nunca: es el olvido, nadie se acuerda de
ella. En el cartel del jefe pone **EL OLVIDO** con letras comidas (`EL OL▒IDO`). Los
vecinos, como mucho, dicen «la polilla gris».

### 3.2 Raíz y Cierzo

| | El Roble | El Viento |
|---|---|---|
| **Nombre** | **Raíz**: todo el valle lo sabe («el abuelo Raíz») | **Cierzo**: nadie lo recuerda |
| **Oficio** | el Gran Roble | el Viento del Norte |
| **Trae** | primavera y verano | otoño e invierno |
| **No puede** | moverse: sus raíces llegan a todo el valle menos al pico (roca y hielo) | quedarse: baja cada invierno y se va cada primavera |

**Por qué Cierzo:** es el nombre de un viento frío y seco del norte, el que sopla por el
valle del Ebro. Suena a frío y a antiguo, y el jugador hispanohablante puede reconocerlo al
juntar los trozos: un «ajá» de verdad. **La injusticia de toda la historia cabe en esta
tabla:** del Roble, el valle recuerda el nombre; del Viento, solo el oficio.

**Raíz no se mueve**, y eso importa. Sus raíces llegan a la Cueva, al Tronco y bajo el
agua (ya lo dice el sueño del Roble: «Hasta la Cueva del Topo llegan mis raíces»), pero
no al pico. Por eso no pudo subir a ver a su hermano, y por eso plantó un brote que
anda.

### 3.3 La nana del Cierzo

El diario de tu casa ya lo dice: «Mi hermano Viento me cantaba para dormir cuando el
mundo era joven. Lo he olvidado». La nana de Raíz de la banda sonora (la pista `casa`,
`js/06-audio.js:231`) pasa a ser **la nana que Cierzo le cantaba al Roble cada invierno**.
Tiene la forma de la nana española de siempre, pero dada la vuelta: aquí lo que llega de
noche no te come, te arropa.

```
Duérmete, Roble, duérmete ya,
suelta tus hojas, que el año se va.
Cierra las yemas, no tengas frío:
que baja el Cierzo y te arropará.
```

(«Duérmete, niño, duérmete ya, que viene el coco y te comerá.» El coco de esta historia
es la polilla.)

Segunda estrofa, para las cartas y los créditos:

```
Duérmete, Roble, no llores, no,
que en primavera me marcho yo;
y cuando el año te vuelva a dormir,
bajará el Cierzo a cantarte a ti.
```

La letra se ajusta a la melodía de `casa` al montarla; lo que importa es que la última
línea de la primera estrofa lleva el nombre.

**Cómo se recupera el nombre.** El polvo se ha comido el nombre de la nana en todas
partes. Cada guardián, cuando le sacudes el polvo (cuando se rinde), recuerda un trozo,
cada uno a su manera:

- **El Topo** (capítulo 1) se acuerda del principio: «...que baja el Cier... el Cier.
  Empezaba así, seguro». → `CIER__`
- **La Reina** (capítulo 2): su «Zzz...» de siempre resulta ser otra cosa. «Zzz... No.
  No es sueño. Así zumbábamos la nana en invierno: ...zzz...» → `CIERZ_`
- **El Ciervo** (capítulo 3) arrastraba la última letra al pasar por el molino, como el
  viento en las aspas: «...ooo». → `CIERZO`

En el zurrón, en Recuerdos, hay una página nueva, **La nana**, con la letra y agujeros
de polilla que se van llenando. En la cima, el jugador lo escribe.

### 3.4 Lo que pasó

1. La Tierra planta dos hermanos: el Roble (Raíz) y el Viento (Cierzo). Entre los dos
   hacen girar el año. Las cuatro estaciones viven junto al Roble, en sus cuatro
   altares: dos las hace él y dos se las trae su hermano cada año desde el norte. Cada
   invierno, Cierzo baja y le canta su nana para que duerma.
2. El valle canta al Roble y deja de nombrar al Viento. La polilla se come el nombre.
   Cierzo escribe a su hermano cartas que nadie abre. Raíz pide más verano; la Reina
   pide descanso para sus abejas. Nadie escucha a nadie.
3. La polilla anida en la pena de Cierzo. Una noche de tormenta, él baja y arranca las
   ocho semillas doradas, el aliento del Roble. El polvo cae y el valle se vuelve gris.
4. Sin aliento, **al Roble se le caen las cuatro estaciones como hojas**, y cada una
   rueda hacia quien más la echaba de menos. El primer calor de la primavera se hunde
   bajo tierra y lo abraza el Topo, que tenía frío. El verano (una lágrima de alegría
   del Roble, con el sol dentro) cae en el panal de la Reina. El otoño, que nadie
   quería, lo recoge el Ciervo en el molino. El invierno se queda en el pico, con
   Cierzo, dentro de la tormenta gris. El polvo hace que cada uno olvide para qué sirve
   y se aferre a lo que le cayó en las manos.
5. En la savia del Roble quedaba una novena semilla que nadie conocía: ni el valle, ni
   Cierzo, ni la polilla, que solo come lo que alguien sabe. Cuando Petra viene a la
   plaza, Raíz se la da: «Plántala en una maceta y riégala». Él no puede moverse; ella
   sí. Petra la planta, la riega y le escribe su nombre en la maceta.
6. Pasan tres años («¿Y cómo se cuentan los años sin estaciones?»). El brote abre los
   ojos. Empieza el juego.

### 3.5 Por qué cada guardián tiene su estación

| Guardián | Estación y reliquia | Por qué la tiene | Qué olvidó | Qué recuerda al rendirse |
|---|---|---|---|---|
| **El Topo Real** | Primavera · **la Brasa**: el primer calor del año, que empieza bajo tierra | tenía frío en un año sin primavera; cavó hacia lo único caliente | que los topos cavan para que la tierra respire en primavera | «CIER...», y para qué cava |
| **La Reina Avispa** | Verano · **la Lágrima**: el Roble lloró de alegría el primer verano y el sol se quedó dentro | pidió un otoño para que sus obreras descansaran y nadie la escuchó. Cuando le cayó el verano, lo selló en cera creyendo que así llegaría el otoño. No llega: el otoño espera a que el verano termine | que el verano se da, no se guarda | «...ZZZ...», y que solo quería que durmieran |
| **El Ciervo de Ámbar** | Otoño · **la Hoja de Ámbar** | Cierzo le pidió que dejara caer las hojas; el valle las barría con rabia, y él recogió el otoño en el molino para protegerlo | que el otoño hay que soltarlo para que vuelva | «...OOO», y que el otoño se regala |
| **Cierzo** | Invierno · **el Copo** | es su estación; la polilla lo tiene envuelto en un invierno quieto | su nombre | todo, cuando lo oye |

**Por qué pelean.** No pelean contra Sprout: pelean dentro del polvo. **Cada golpe les
sacude polvo gris** (partículas nuevas en `bossHit`, `js/12-bosses.js:17`), y a 2 PV (la
regla de `yield` que ya existe) ya no les queda: **se acuerdan**. La barra de vida de un
guardián se lee como «el polvo que le queda». La mecánica no cambia; ahora tiene
sentido.

### 3.6 Los minijefes: mudas del polvo

Los minijefes no están vivos. Son **mudas**: cosas vacías que el polvo ha puesto en pie
con lo que se olvidó en cada sitio. Así ninguno muere, y las despedidas que ya tienen
(se deshacen) encajan.

| Minijefe | Qué es | Al caer |
|---|---|---|
| El Escarabajo Rey | la muda del caparazón del viejo rey escarabajo, vacía | vuelca, se deshace en polvo de hierro y **sale una polilla gris que vuela hacia el norte** |
| El Zángano Capitán, que pasa a ser **el Soldado de Cera** | una estatua de cera de zángano que las obreras hicieron de guardia | se derrite; sale la polilla |
| El Espantapájaros | paja: ya era una muda | se desinfla, el cuervo se lleva el sombrero y sale la polilla |
| El Guardián de Hielo | bloques de hielo del templo | se desmorona; sale la polilla |

Cuatro polillas volando hacia el norte, hacia el pico: el jugador atento ya sabe adónde
va todo.

### 3.7 La novena semilla: del «quién» al «para qué»

Que Sprout es la novena semilla se sabe desde el título, y eso está bien: es ironía
dramática y funciona. Lo que falla es fingir que es una sorpresa.

- **Nadie lo presenta como revelación.** Petra y Raíz lo tratan como algo sabido.
- **Lo que el final revela es para qué:** «Un árbol no puede subir a una montaña,
  brote. Por eso te planté». Raíz lo siembra en el capítulo 0 («Si pudiera, subiría yo.
  Pero mis raíces no llegan al pico») y lo paga al final.
- **Y una segunda capa, que sostiene el capítulo 5:** la polilla solo come lo que
  alguien sabe. Mientras nadie conocía la novena semilla, el Olvido no podía verla, y
  por eso sobrevivió al robo. Ahora todo el valle conoce a Sprout. Por eso puede
  comerse su nombre... y por eso mismo el valle se lo puede devolver.

### 3.8 Qué sabe el jugador y cuándo

| Qué | Cuándo | Cómo |
|---|---|---|
| Sprout es la novena semilla | desde el título | la intro del título y el prólogo; nadie lo vende como sorpresa |
| Raíz es la voz del Roble | primer diálogo | «mi hermano, el Viento» |
| El Viento tiene un nombre que nadie recuerda | capítulo 0 | Raíz se atasca al decirlo; las runas tienen un hueco donde iba |
| Hay algo gris detrás | capítulos 1-3, cada vez más claro | polillitas, el polvo de los guardianes, las polillas de los minijefes |
| El nombre es CIERZO | capítulos 1-3, a trozos | cada guardián recuerda uno |
| El Olvido | capítulo 4, en la cima | sale de la tormenta al decir el nombre |
| Para qué plantó el Roble a Sprout | el final | «Un árbol no puede subir a una montaña» |

### 3.9 Presagios, capítulo a capítulo

- **Título.** En un relámpago de la tormenta, durante dos fotogramas, se adivinan entre
  las nubes unas alas con ocelos (`js/15h-titulo.js`). Nadie lo verá la primera vez;
  todos lo verán la segunda.
- **Capítulo 0.** Raíz no consigue decir el nombre de su hermano. Al entregar las
  semillas, una polilla gris sale volando del tronco: estaba comiéndose la corteza. Hay
  polillitas en las pantallas mustias que huyen de la luz.
- **Capítulo 1.** La muda del Escarabajo Rey suelta la primera polilla grande. El Topo
  suelta polvo al recibir golpes y, al rendirse, habla de «una nevada gris por dentro».
  Las runas dicen «y el Viento, llamado ▒▒▒▒▒▒...».
- **Capítulo 2.** En el Tronco, las polillas se tiran a los rayos de sol y se queman.
  La Reina: «algo me dormía sin dejarme dormir».
- **Capítulo 3.** El Ciervo: «Llevaba años con un frío gris en el pecho que no era
  mío». Moss: «Mi caña dice que en el pico no nieva: nieva gris».
- **Capítulo 4.** En el Sendero la nieve cae gris. Raíz: «Ese aullido no es de mi
  hermano. Mi hermano cantaba». Las líneas que ya hablan de un invierno raro se quedan
  («Del norte baja un invierno que no es natural», `:28`; Lupa: «Ese invierno del norte
  no es normal»).

### 3.10 Cada agujero, su arreglo

| # (§1.2) | Arreglo |
|---|---|
| 1 | Nadie presenta la novena semilla como sorpresa. El final revela el «para qué» (§3.7). Fuera «Yo SOY el Roble» como revelación |
| 2 | El nombre es Cierzo; nadie lo recuerda; el jugador lo reúne y lo escribe (§3.3, §6) |
| 3 | «Tres años... o eso dice el abuelo. Sin estaciones, ¿cómo se cuentan los años?» Las marcas de la maceta: «Alguien las contó como pudo» |
| 4 | La Reina pidió un otoño y selló el verano creyendo que así llegaría (§3.5) |
| 5 | La Lágrima es del Roble: lloró de alegría el primer verano |
| 6 | Robó por pena y porque la polilla se lo susurró. La carta 4 se escribe después: «como escondí tus semillas». El Cascabel se le cayó la noche de la tormenta |
| 7 | El Susurro son las cinco cartas dobladas en un molinillo de papel que suena con su voz. Raíz: «Nunca las abrí» (una sola vez) |
| 8 | Raíz no sube: «Mandé mis raíces monte arriba para verle. Se helaron en la ladera» |
| 9 | Al Roble se le caen las estaciones y ruedan hacia quien más las echaba de menos (§3.4) |
| 10 | El Topo: «ese de allá arriba, el Viento» |
| 11 | Fuera «mil»: «más inviernos de los que caben en una nana», «desde que el valle era joven» |
| 12 | Pista nueva de la cima (§8.3) |
| 13 | Los minijefes son mudas: no estaban vivos (§3.6) |
| 14 | El polvo tiene a los bichos nerviosos: no saben si hibernar o salir. Lo dice algún vecino; no hace falta más |
| 15 | La cima deja de ser una pelea: es un rescate (§6) |

### 3.11 Alternativas que descarté

- **El muérdago**, un parásito siempreverde del Roble («querer solo el verano»). Buena
  metáfora, pero es verde y el daño del juego es gris; además deja al Roble como víctima
  pasiva.
- **La escarcha negra**, un invierno falso. Se confunde con el propio Viento, que es
  justo lo que hay que separar.
- **El Viento como malo de verdad.** Rompe la regla de oro y todo lo que ya dicen las
  cartas y el diario.

---

## 4. Los capítulos

| Cap. | Título | Dónde | Objeto | Trozo del nombre | El Olvido |
|---|---|---|---|---|---|
| 0 | El brote | el valle | la Hoja | Raíz no se acuerda | el gris y las polillitas |
| 1 | La Brasa | Cueva del Topo | Bellota-bomba | CIER | la muda del Rey suelta una polilla |
| 2 | La Lágrima | Tronco Hueco | Raíz-gancho | Z | polillas a la luz |
| 3 | El Ámbar | Molino | Molinillo | O | el Ciervo recuerda el frío gris |
| 4 | El Copo | Templo y Cima | Vilano (y Farol) | **CIERZO** | sale de la tormenta |
| 5 | El Olvido | Los Anillos del Roble | Anillo del Año | — | orugas, crisálida, polilla |
| Epílogo | El ciclo | el valle | — | — | una polillita |

El Copo ya no se entrega para ver los créditos. Se entrega en mitad del capítulo 5: el
altar del invierno completa los cuatro, y eso es lo que permite al Roble darte el
Anillo.

---

## 5. Las mazmorras

### 5.0 Reglas comunes

1. **Una idea por mazmorra que cambie salas que no son la tuya**: la raíz crece, la luz
   baja por el tronco, las aspas giran. Hace falta **estado de mazmorra** (§9.2).
2. **Cada objeto, tres usos**: el que ya tiene (presentar), uno nuevo que amplía
   (desarrollar) y uno que combina o sorprende (torcer). El guardián es el examen.
3. **Atajos.** A mitad de mazmorra se abre un camino de vuelta a la entrada.
4. **Las llaves salen de puzles.** Como mucho, una emboscada con llave por mazmorra;
   las demás emboscadas, de condimento.
5. **Se ve antes de poder**: la llave grande, el cofre o la puerta, a la vista antes de
   saber llegar.
6. **Las pistas insinúan.** Fuera las soluciones de `ROOM_HINTS` y `MID_INTRO`.
7. **Tamaño**: de 10 a 13 salas. La mitad de las salas de pasillo o de pelea pasan a
   ser de puzle.
8. **Todo puzle nuevo se comprueba con un resolvedor antes de dibujarlo.** Los dos de
   este documento (la Pista y el Foso de los Sacos) están comprobados por búsqueda
   exhaustiva: tienen solución y no tienen atajo.

### 5.1 La Cueva del Topo: la primavera empieza bajo tierra

**Sentido.** La madriguera del Topo, cavada buscando calor. El invierno gris se ha
colado hasta aquí: charcos helados y raíces del Roble dormidas y grises. La Brasa está
en lo más hondo.

**La idea: dos pisos y calor que despierta raíces.**

- **Grietas del suelo** (nuevas): se abren con una bomba y caes al **piso de abajo**,
  las Hondonadas (cinco salas nuevas).
- **Fogones de tierra** (nuevos): el estallido de una bomba los enciende y se quedan
  encendidos. Su calor derrite el hielo de la sala y **despierta los nudos de raíz**.
- Una raíz despierta **crece**: hace de puente sobre una sima o de escalera que sube
  por un agujero al piso de arriba. Las raíces cruzan salas y pisos, así que despertar
  un nudo cambia todas las salas por las que pasa.
- El resultado: bajas por una grieta, enciendes un fogón abajo y la raíz te sube por
  otro sitio. **Cada raíz despierta es un atajo para siempre**, y la mazmorra se abre
  como un hormiguero.

**La Bellota-bomba, en tres usos:**

1. *Presentar*, como ahora: rocas y paredes agrietadas, y belloteros.
2. *Desarrollar*: grietas del suelo para bajar y fogones para calentar.
3. *Torcer*: **las bellotas ruedan.** En las **rampas de raíz** (nuevas), una bomba rueda
   hasta que se acaba la rampa, y la mecha decide dónde estalla. Sirve para llegar a
   grietas del otro lado de una sima; una roca empujada en un cruce cambia la rama.

**Sala firma: el Fogón.** Es la primera sala después de conseguir las bombas.

```
####II####   I  tapón de hielo en la puerta norte
#........#
#..OOOOOO#   O  sima
#K.OOOOOO.   K  nudo de raíz dormido
#..OOOOOO.      (la puerta este queda al otro lado de la sima)
#........#
#.....H..#   H  fogón apagado
####..####   entras por el sur
```

Una bomba junto al fogón calienta la sala. El tapón se derrite (se abre el norte) y el
nudo despierta: la raíz cruza la sima por su fila hasta la puerta este. Una acción, dos
salidas, y la sala enseña la regla sin decir nada.

**El esqueleto.** Arriba están las Galerías, que son las salas de hoy rehechas: el
vestíbulo, el Rey, el Fogón y tres ramas. Abajo, las Hondonadas: charcas heladas, las
Cuestas (bellotas que ruedan), la cripta de la llave grande y el Refugio del Topo. Tres
raíces despertables unen los dos pisos. La llave grande pide la **raíz madre**, que solo
despierta con dos fogones encendidos en salas distintas, y el primero es el que te abre
el camino al segundo.

**Minijefe:** la muda del Escarabajo Rey, como ahora (por la cola o cuando se atasca).
Suelta la bomba y la primera polilla.

**Guardián: el Topo Real busca el calor.** Se conserva lo bueno: el casco de roca y la
bomba que lo saca aturdido. Lo nuevo es que la sala tiene cuatro fogones helados y **el
Topo sale donde hay calor**. Enciende un fogón y sabrás dónde va a asomar, así que
puedes dejar la bomba antes. Herido, apaga fogones echándoles tierra encima; al final le
cae polvo gris del techo y los fogones se hielan solos. Es la misma pelea, pero ahora se
gana leyendo al Topo en lugar de esperarlo.

### 5.2 El Tronco Hueco: el verano guarda su Lágrima

**Sentido.** Un tronco muerto convertido en colmena. La Reina selló el verano en cera.
Dentro está oscuro, dulce y pegajoso, y la luz entra por los nudos de la madera... cuando
no están tapados con cera.

**La idea: la luz del verano.**

- **Nudos taponados** (nuevos) en las paredes. Al quitar el tapón entra un **rayo de
  sol** en línea recta hasta que choca con algo.
- **Lo que toca el rayo**: derrite **paredes de cera**, abre **girasoles dormidos** (que
  abren verjas o hacen de plataforma sobre la miel) y derrite **miel cristalizada**. Las
  polillas se lanzan a él y se queman.
- **Lentes de rocío**: bloques que desvían el rayo 90°. Se empujan... o se traen con el
  gancho.
- **La Columna**: el nudo grande de lo alto del tronco manda luz hacia abajo por las
  salas alineadas en vertical. Abrirlo arriba cambia dos salas de abajo.

**La Raíz-gancho, en tres usos:**

1. *Presentar*: cruzar agua y agujeros, y postes (como ahora).
2. *Desarrollar*: **arrancar tapones** de nudos que no alcanzas.
3. *Torcer*: **tirar de bloques** (lentes, cajas de cera) hacia ti desde el otro lado de
   un foso. Y atrapar a la Reina solo cuando está deslumbrada.

Antes de tener el gancho, los tapones que están a mano se cortan con la Hoja. Así la
idea de la luz llega antes que el objeto que la amplía.

**Sala firma: el Primer Rayo.**

```
##########
#........#
#........#
W........T   T  nudo taponado (se corta con la Hoja)
#..##....#   W  pared de cera: el rayo la derrite y se abre el oeste
#........#
#........#
####..####
```

Su gemela, ya con el gancho: el nudo está al otro lado de un foso de miel y hay que
arrancar el tapón desde lejos.

**El esqueleto.** La primera mitad es luz que se corta con la Hoja; luego el Soldado de
Cera. En la segunda mitad el gancho arranca tapones lejanos y trae lentes. La Columna
sale de la Colmena Alta (11,-1) e ilumina la Galería del Enjambre (11,0) y la sala de
debajo (11,1), que deja de ser la del cristal rojo y azul y pasa a ser la de la miel
cristalizada. Al final, la Reina.

**Minijefe: el Soldado de Cera** (hoy el Zángano Capitán). Se lanza en picado como
ahora, pero en un rayo de sol se ablanda, y ahí la Hoja entra. Suelta el gancho y una
polilla.

**Guardiana: la Reina, deslumbrada.** Hoy se la engancha en vuelo, se la arrastra y se
le pega. Lo nuevo: la sala tiene cuatro nudos y ella los tapa con cera al empezar.
Arrancas un tapón con el gancho, entra el sol y, **si la Reina cruza el rayo, queda
deslumbrada**; solo entonces el gancho la agarra. Herida, manda al enjambre a tapar
nudos. En la última fase solo queda uno y tienes que hacerla pasar por él: se lanza en
picado hacia ti, así que ponte detrás del rayo. Examen de luz y de gancho.

### 5.3 El Molino de la Hojarasca: el otoño que nadie quería

**Sentido.** El viejo molino de la Ciénaga, donde el Ciervo guardó el otoño para que
nadie lo barriera. Moler, engranar, aventar: todo lo mueve el viento, y el viento lo
pones tú.

**La idea: el molino entero gira.** Lo que ya hay (molinetes y hojarasca) es lo mejor de
las cuatro mazmorras y se queda.

- **La Rueda Mayor**, en la sala central: una rueda de aspas grande. Cada ráfaga la gira
  un cuarto de vuelta, y con ella **las aspas del molino por fuera y los engranajes de
  todas las salas**. Tiene cuatro posiciones (N, E, S, O) y cada una abre un juego de
  compuertas distinto en toda la mazmorra. El mapa del zurrón muestra la posición.
- **Ejes**: un molinete junto a una puerta pasa el giro a un engranaje de la sala de al
  lado. Hay que llegar mientras gira.
- **La ráfaga empuja a distancia**: sacos de harina que resbalan por el foso del molino
  hasta chocar con algo.

**El Molinillo, en tres usos:**

1. *Presentar*: barrer hojarasca y girar molinetes (como ahora).
2. *Desarrollar*: **empujar a distancia**: sacos, barcas de hoja en la acequia.
3. *Torcer*: **girar la mazmorra** con la Rueda Mayor y pasar giros entre salas.

**Sala firma: el Foso de los Sacos.** Está comprobada: pide 6 ráfagas como mínimo.

```
####==####   =  verja: se abre con un saco en cada placa
#........#   .  pasarela (Sprout va por aquí)
#.,S,,o,.#   ,  el foso: Sprout no baja; los sacos resbalan por él
#.o,,,,,.#   S  saco de harina
#.,,,o,_.#   o  poste (para sacos y ráfagas)
#._,,,S,.#   _  placa
#........#
####..####
```

Sprout rodea el foso por la pasarela y sopla hacia dentro. La ráfaga empuja el primer
saco que encuentra en su fila o columna, y el saco resbala hasta chocar con el borde,
con un poste o con otro saco. La solución usa un saco como tope del otro:

1. Desde la izquierda, en la fila de abajo: el saco de la derecha resbala al rincón.
2. Desde arriba, en la columna del otro saco: baja hasta el fondo.
3. Desde abajo, en la columna del rincón: el primer saco sube hasta arriba.
4. Desde la izquierda, otra vez en la fila de abajo: el segundo saco va al rincón.
5. Desde arriba, en la columna del rincón: el primer saco baja y **se para encima del
   segundo**, en la placa.
6. Desde la derecha, en la fila de abajo: el segundo saco cruza todo el foso hasta la
   otra placa.

**El esqueleto.** Se conserva lo que hay (el laberinto, los molinetes y el
Espantapájaros), y además: la Rueda Mayor en la Sala de los Engranajes (19,1), el Foso
de los Sacos en la Despensa (20,1), que deja de ser una emboscada, y un eje entre la
Sala del Viento (20,0) y la Cámara de la Llave (20,-1).

**Guardián: el Ciervo de Ámbar** se queda casi igual, porque el manto que arranca la
ráfaga está bien pensado. Un añadido: en el lecho hay montones de hojarasca con los que
rehace el manto. Si los barres antes, la pelea se acorta.

### 5.4 El Templo de la Cima: los antiguos pedían que volviera la nieve

**Sentido.** El templo que levantaron los antiguos para pedir que la nieve volviera
cada año (`js/05-texts.js:335`). Sus puzles son **ritos**: la nana en campanas de hielo,
el fuego que se enciende en orden y el hielo que hay que saber pisar.

**La idea: hielo de verdad y la nana en campanas.**

- **Pistas de hielo de verdad.** En ciertas salas, al pisar hielo te deslizas **hasta
  chocar** con algo o hasta pisar suelo; hoy el hielo solo resbala un poco. Con los
  bloques de hielo pasa lo mismo.
- **El farol derrite** los bloques de hielo, y con ellos cambian los topes de una pista.
- **Campanas de hielo.** Cada una da una nota de la nana: la, do, re, mi y sol, las
  cinco notas de la melodía de `casa`. Las puertas del rito tienen la melodía tallada en
  runas y hay que tocar las campanas en ese orden. La vaina toca campanas lejanas; una
  ráfaga toca varias en fila, de la más cercana a la más lejana.
- **Corrientes**: rejillas en el suelo que, con una ráfaga del molinillo, soplan hacia
  arriba. Saltar encima con el vilano te lleva mucho más lejos planeando.

**El Vilano, en tres usos:**

1. *Presentar*: saltar agujeros (como ahora).
2. *Desarrollar*: **frenar en el hielo.** Si saltas mientras te deslizas, al caer te
   quedas quieto donde caes. Hay pistas que solo se resuelven frenando a mitad.
3. *Torcer*: **planear en corrientes**, con el vilano y el molinillo. El Puente Roto se
   cruza así.

**Sala firma: la Pista.** Está comprobada: pide 6 movimientos como mínimo y no tiene
atajo desde la entrada.

```
#######..#   salida arriba a la derecha
#i.iiriii#   i  hielo (te deslizas hasta chocar)
#iiiiiiir#   .  suelo (paras)
#iirii.ii#   r  roca
#iiirriii#
#iiiiiiri#
#iii..iii#   entras aquí
####..####
```

Solución: ↑ → ↑ ↑ → ↑. Es la sala para aprender la regla; las siguientes añaden bloques,
el farol y el freno del vilano.

**El esqueleto.** La Pista en la Pista de Hielo (14,0); bloques en el hielo en la
Galería de Bloques (14,1); el Guardián de Hielo (16,0), que da el vilano; frenar en el
Atrio (15,2); las Campanas en la Sala de las Antorchas (15,0), porque la puerta que sube
a la cima pasa a ser un rito y no cuatro antorchas; y la Corriente en el Puente Roto
(16,-1).

**Guardián.** El Templo no tiene guardián dentro: su final es **la cima**.

---

## 6. La cima: el rescate de Cierzo

**Lo que ve el jugador al llegar.** En el centro de la cima gira una tormenta gris, y
dentro, apenas, se ve la cara del Viento (sus ánimos `sad` y `howl`, de `drawWind`,
`js/02-sprites.js:1105`). Del capullo salen cuatro hilos grises que se clavan en las
cuatro rocas de junto a los braseros. No hay barra de vida del Viento: hay **cuatro
hilos**.

**Fase 1: los hilos.** Reaprovecha casi toda la IA de `updViento`.

- El Viento no ataca: **se agita**. Sus barridos (que se esquivan con el vilano) y los
  carámbanos son involuntarios. Sus soplidos apagan braseros (`vientoBlowOut`) como
  ahora.
- Los hilos están cubiertos de polillas grises que los zurcen: si cortas un hilo con
  polillas encima, se vuelve a coser.
- **Las polillas van a la luz.** Enciende con el farol el brasero de un hilo y las
  polillas de ese hilo se lanzan al fuego. Durante unos segundos puedes cortarlo con la
  Hoja (o quemarlo con la llamarada).
- **Las polillas aprenden.** A partir del tercer hilo, apagan el brasero en cuanto
  llegan. Hay que encender uno de cebo en la otra punta y cortar el hilo del lado
  contrario mientras vuelan hacia allí.
- Con cada hilo cortado, la tormenta se vuelve más loca (los carámbanos y el doble
  barrido que hoy tienen las fases 2 y 3).

**Fase 2: el nombre.**

- Con el cuarto hilo, el capullo se abre. Cierzo cae en la nieve, encogido: «¿...Quién...?
  No me acuerdo de quién soy».
- Aparece una pantalla de nombre, como en las Game Boy: una rejilla de letras. La
  página de la nana está en el zurrón.
- Cada letra correcta amansa el viento: el aullido baja y la nieve cae más despacio. Si
  la letra es incorrecta, una ráfaga se la lleva, sin castigo.
- Al escribir C-I-E-R-Z-O, el nombre se talla en hielo en grande (con las letras de
  hielo de `js/15l-templo.js`, `tlGlyph`) y Sprout lo dice: «CIERZO».

**Fase 3: la revelación** (cinemática).

- Cierzo abre los ojos, claros. La nana suena entera, por primera vez con su letra.
- Pero la tormenta no se va: se cierra, se oscurece y en ella se abren **dos ocelos del
  tamaño del cielo**, los del relámpago del título. El cartel dice **EL OL▒IDO**. La
  música se queda sin notas: se las come.
- La polilla chilla sin sonido y se lanza hacia el sur, hacia el valle y el Roble.
- Cierzo, sin fuerzas: «Esa cosa vivía en mi pena. Se comió mi nombre tanto tiempo que
  ya no sabía quién era». Te da el Copo: «Corre. Va a por mi hermano». Y cumple la
  promesa de la carta 5: «Cuando todo el valle diga mi nombre, bajaré».
- La salida, que hoy (`BOSS_OUTRO.viento`) te lleva a la puerta del Templo, pasa a ser
  el último soplo de Cierzo llevándote **a la plaza**.

Empieza el capítulo 5.

---

## 7. Capítulo 5: El Olvido

### 7.1 El valle se olvida

- **El Roble** está envuelto en seda gris. Las raíces que van a los altares se apagan
  una a una. Raíz, a sus pies, abre la boca y **no le sale nada**: su caja de diálogo
  solo muestra «...» con agujeros.
- **El gris vuelve**, pantalla a pantalla, de la plaza hacia fuera (con el bioma `wilt`,
  que ya existe). Hay polillas por todas partes.
- **Los vecinos olvidan**, y resulta un poco gracioso y un poco horrible:
  - Petra: «¡Hola! ¿Nos conocemos? Tienes cara de... de algo verde».
  - Tilo: «¿Esto cuánto costaba? ¿Y esto qué es, una baya? ¿Las bayas se venden o se
    comen?».
  - Lupa: «¿Por qué estaré regando esta piedra?».
  - Moss: «...¿Y esta caña de quién es?».
- **El altar del invierno.** Dejas el Copo. Las cuatro reliquias juntas brillan a través
  de la seda y el hueco del tronco se abre, pero sin la voz del Roble no sabes qué
  hacer. Hasta que Petra, sin reconocerte, dice lo único que recuerda del libro de Raíz:
  «Un brote duerme hasta que el valle lo llama».

### 7.2 El sueño en la maceta: el Anillo del Año

Vuelves a tu maceta (la cama `P` de tu casa, `js/09-player.js:267`) y duermes. El sueño
usa el motor del marchitarse (`dreamBegin`, `js/15c-marchitar.js`): los anillos del
tronco, las raíces y la savia. Aquí sí habla el Roble:

> Sprout. Despierto ya no puedo hablarte: la polilla me tiene la voz en la boca.
> Mis anillos son los años del valle. Cada uno guarda uno. Ella se los está comiendo
> de fuera hacia dentro.
> Si llega al primero, al día en que nos plantaron, mi hermano y yo nunca habremos sido
> hermanos.
> Toma. Hazlos girar.

**El Anillo del Año** es un corte del tronco con cuatro franjas de color. **X cambia la
estación de la sala en la que estás**: primavera, verano, otoño, invierno y vuelta a
empezar. Solo funciona dentro del Roble y, tras el final, en los tocones del valle
(§7.6).

| Casilla | Primavera | Verano | Otoño | Invierno |
|---|---|---|---|---|
| Agua | agua | agua, con los nenúfares grandes abiertos (plataformas) | agua con hojas flotando | **hielo**: se pisa y se desliza |
| Semillero | **enredadera**: puente o escalera | arbusto en flor: sólido, da bayas | arbusto seco: arde con el farol | brote dormido: se pisa |
| Charca de barro | barro | **seca**: se pisa | barro | helada: se pisa |
| Rincón de hojas | vacío | vacío | **montón de hojarasca**: pesa sobre las placas y tapa agujeros | vacío |
| Rejilla de viento | brisa | nada | **corriente fuerte** | nada |
| Ventisquero | nada | nada | nada | **nieve dura**: sólida; el molinillo la barre |

**La seda gris no cambia nunca**, porque el gris no tiene estación. Se quema con el
farol.

Sí, es *Oracle of Seasons*, y está bien que lo sea: el juego ya le hace homenaje en las
cinemáticas. La diferencia es su peso. Aquí no es la mecánica de todo el juego, sino la
**paga**: te has pasado cuatro capítulos devolviendo las estaciones, y al final las
mandas tú.

### 7.3 Los Anillos del Roble (la mazmorra final)

Se entra por el hueco del tronco, en la plaza, y se recorre **hacia dentro**. Cada anillo
es más viejo que el anterior, así que el viaje es **hacia atrás en el año**, hasta el
primer día.

```
                 [ LA MÉDULA ]   la Crisálida, los Ecos, la Polilla
                       ▲
      [ Anillo 1 · Primavera ]   «el día que nos plantaron»
                       ▲
      [ Anillo 2 · Verano ]      «cuando la Reina pidió descanso»
                       ▲
      [ Anillo 3 · Otoño ]       «cuando el valle barrió las hojas»
                       ▲
      [ Anillo 4 · Invierno ]    «el último invierno que cantó»
                       ▲
             el hueco del tronco (la plaza)
```

- **Cada anillo es un recuerdo del valle.** Sus salas son pantallas del valle de hace
  mucho, pintadas con el arte de siempre y la estación del recuerdo (como las
  cinemáticas de estación, `scScreen`, `js/15f-roble.js:203`), con agujeros grises donde
  la polilla ha comido. Por ellas pasan, como fantasmas, figuras del pasado: Cierzo
  cantándole al Roble dormido mientras el valle cierra las ventanas; los vecinos
  barriendo hojas con rabia; la Reina pidiendo un otoño y el Roble diciéndole que no; la
  Tierra plantando dos semillas. **La historia se ve, no se cuenta.**
- **Cada anillo remezcla la idea de una mazmorra**, con el Anillo del Año por medio: el
  de invierno, el hielo y las campanas del Templo; el de otoño, las ráfagas y los sacos
  del Molino; el de verano, la luz del Tronco; el de primavera, las raíces y los fogones
  de la Cueva. Es el repaso de todo el juego.
- **Tres salas por anillo y un desgarro**: unas 14-16 pantallas en total.
- **La Oruga del Olvido**, un enemigo recurrente: una larva gris enorme, de segmentos (a
  lo Moldorm), que se come el suelo del recuerdo a su paso y deja agujeros. Aparece en
  cada anillo y cada vez huye más adentro. En cada encuentro, la estación del anillo es
  la que repara el suelo: el invierno hiela los agujeros de agua, la primavera los
  cubre de raíces. Pelear es también reconstruir.

**Sala firma: el estanque de las dos estaciones** (anillo de invierno). Hay un estanque
entre la entrada y la salida, con un islote de roca en medio y un bloque en la orilla.

- En **invierno** el estanque es hielo: el bloque, empujado, resbala hasta chocar con el
  islote y se queda ahí.
- En **verano** el hielo se funde y el bloque se hunde: **deja una piedra** en el agua,
  junto al islote, y se abren los nenúfares.
- El camino (nenúfar, piedra, islote, nenúfar) solo existe si has usado las dos
  estaciones en ese orden.

### 7.4 El jefe final, en cuatro niveles

El Olvido se pelea en cuatro niveles. Cada uno tiene su sitio, su forma y pide algo
distinto.

| Nivel | Dónde | Forma | Qué hay que hacer | Qué examina |
|---|---|---|---|---|
| 1 · La Crisálida | la médula | un capullo gris colgado | pelar sus cuatro capas, cada una con su estación | el Anillo del Año |
| 2 · Los Ecos | la médula | los ecos de los cuatro guardianes | vencer a cada uno en su estación y con su objeto | todo el juego |
| 3 · La Polilla | la copa del Roble | la polilla entera | atraerla con luz, elegir estación, clavarla | el equipo entero y la táctica |
| 4 · El Nombre | el cielo del valle | la polilla, del tamaño del cielo | aguantar a oscuras hasta que te llamen | la historia |

**Nivel 1: la Crisálida.** La médula es redonda. En el centro cuelga el capullo y en las
cuatro esquinas asoman las puntas de las cuatro raíces de los altares (las mismas que se
encienden en la plaza, `ROBLE_ALTARS`). La seda no se corta con la Hoja. Cada punta de
raíz responde a su estación: pon la sala en esa estación, golpea la punta y la raíz
azota el capullo. Pero cada estación también afecta a toda la sala, y las orugas cubren
las puntas con seda, que se quema con el farol:

- **Primavera**: la raíz crece hacia el capullo... si le dejas camino (no pises los
  semilleros).
- **Verano**: entra el sol por arriba y seca el polvo del suelo, pero el capullo late
  más rápido.
- **Otoño**: la ráfaga del molinillo se vuelve un vendaval de hojas que también te
  empuja a ti.
- **Invierno**: la seda se vuelve quebradiza y una bomba la hace añicos, pero el suelo
  es hielo.

Son cuatro capas, en cualquier orden.

**Nivel 2: los Ecos.** De cada capa pelada cae un eco violeta: lo que la polilla guarda
de lo que se ha comido. Se reaprovecha el Eco de los Guardianes que ya existe
(`js/12a-dungeon.js:116`), con ecos más cortos (en torno al 60 % de la vida). Un eco es
invulnerable **salvo en su estación**: en ella se acuerda, se ablanda y se vence con su
objeto (el Topo con bombas, la Reina con el gancho, el Ciervo con el molinillo y el eco
de Cierzo con el farol y el vilano). Al disolverse no calla como ahora: se oye desde
lejos la voz del guardián de verdad: «¡Aquí, chiquillo!», «Zzz... ¡Ahora!».

**Nivel 3: la Polilla.** El capullo revienta y la polilla sube por el tronco hasta la
copa: son dos pantallas de subida por dentro del tronco, con corrientes para el vilano.
En la copa, las ramas son plataformas sobre el vacío.

- **Va a la luz.** La llamarada del farol o un brasero la hacen lanzarse en picado.
  Esquívala con el vilano y quedará posada un momento: ahí **el gancho le clava un ala**
  (como a la Reina) y la Hoja le da en el cuerpo.
- **Su polvo borra.** Al batir las alas, las casillas se vuelven grises (y pierden la
  estación) y **el HUD se olvida**: primero se apagan los colores de los corazones, luego
  desaparece el icono de X (sigues teniendo el objeto, pero no ves cuál es) y luego la
  música pierde voces.
- **Cada estación contra el polvo, y cada una con su precio.** El invierno hiela el polvo
  y lo hace caer como nieve inofensiva, pero el suelo resbala. El verano lo quema, pero
  con el calor ella va más rápido. El otoño se lo lleva, pero la ráfaga también te empuja
  a ti. La primavera hace crecer ramas que la atrapan si se posa encima, pero tarda.
  **Elegir es la pelea.**

**Nivel 4: el Nombre.** La polilla huye al cielo y se hace del tamaño del valle.

- Se come **tu nombre**: el HUD dice «▒▒▒▒▒▒». Todo se vuelve gris y, durante unos
  segundos, los controles **no responden**: Sprout no se acuerda de cómo moverse.
- Entonces se oye «¡SPROUT!». Es Petra, que fue quien te puso el nombre. Luego Lupa,
  Moss, Tilo, Corteza, el Topo, la Reina, el Ciervo, Cierzo y, el último, Raíz, que
  vuelve a tener voz. **Cada nombre devuelve algo**: moverse, la Hoja, el color, los
  corazones y la música, nota a nota.
- Mantén Z. El Remolino, el primer truco que le compraste a Tilo, se carga con las
  cuatro estaciones, un cuarto del anillo cada una. Al soltarlo, **el año gira en un
  solo giro**.
- La polilla encoge hasta ser una polillita que se posa en la hoja de Sprout. Sprout la
  deja ir.

*Versión mínima*: este nivel es una cinemática interactiva en una sola pantalla.
*Versión ambiciosa*: una secuencia de vuelo a lomos del viento de Cierzo (con su cara
`happy`), recogiendo las voces del valle antes del giro final.

### 7.5 El final y los créditos

Los planos nuevos sustituyen a `END_SHOTS` (`js/15a-intro.js:676`):

1. «El año volvió a girar». La plaza, con las cuatro raíces encendidas.
2. «Y en la plaza, dos hermanos se llamaron por su nombre». Raíz: «Cierzo». Cierzo:
   «...Raíz». Nieva.
3. «El valle salió a verlo, y nadie tuvo frío». Los vecinos cantan la nana.
4. «Un árbol no puede subir a una montaña. Por eso plantó un brote». Sprout, en grande.

Después de los créditos, la polillita da vueltas al farol de Tilo: «Hasta el olvido
tiene su estación».

En los créditos se añaden «CIERZO, el Viento del Norte» y «EL OLVIDO, que volvió a ser
una polilla», y la coda cambia a: «Ocho semillas. Cuatro estaciones. Un nombre. Nadie ha
muerto y nadie ha sido olvidado».

### 7.6 Después del final

- **Los nombres, arreglados**: las runas, las cartas y los diarios muestran el nombre de
  Cierzo donde había agujeros. Merece la pena releerlos.
- **El Anillo del Año en el valle**: hay tocones repartidos por el valle donde X cambia
  la estación de esa pantalla, con secretos de estación (el lago helado hasta una isla,
  una enredadera hasta un risco).
- **La polillita** acompaña a Sprout en el farol y se come la seda gris que quedó
  escondida, lo que abre secretos nuevos.
- **El Eco de los Guardianes** se queda como desafío, con la runa cambiada: son los ecos
  que el Olvido no llegó a soltar.

---

## 8. Diálogos: la voz de cada uno

### 8.1 Reglas

1. **Tres páginas como mucho** en un cambio de capítulo. Adónde ir lo dice la lista de
   misiones; Raíz habla de lo que siente.
2. **Una palabra en MAYÚSCULAS por página**, como mucho, y solo si el jugador la va a
   necesitar.
3. **Las pistas insinúan.** Las soluciones, solo en el sueño del Roble.
4. **Cada personaje llama a Sprout a su manera** (tabla de abajo).
5. **Nada de «mil»**, y nada que ya se haya dicho con las mismas palabras.
6. **Lo que cambia se muestra** (el mundo, las figuras de los anillos). Con palabras se
   cuenta solo lo que no se puede ver.

### 8.2 Fichas

| Quién | Cómo es | Llama a Sprout | Tic | Qué quiere |
|---|---|---|---|---|
| **Raíz** | viejo, cálido, culpable; frases cortas con imágenes de savia y raíces | «brote» (solo él) | se queda a medias cuando va a nombrar a su hermano | que su hermano vuelva, aunque él no pueda ir a buscarlo |
| **Petra** | niña; todo lo dice en voz alta; valiente de boquilla | «¡Sprout!» (el nombre se lo puso ella) | exclamaciones, «¡es mío, eh!» | que la dejen ir de aventuras |
| **Lupa** | jardinera práctica | «tallito» | metáforas de huerto | que la tierra descanse |
| **Moss** | pescador de pocas palabras | «grumete» | «dice mi caña» | que piquen |
| **Tilo** | tendero glotón de buen fondo | «cliente» | habla en precios y recetas | vender, y que le reconozcan que cocina bien |
| **Corteza** | ermitaña que talla | «criatura» (ya lo hace) | frases de proverbio | que nada se pierda |
| **El Topo** | gruñón, friolero, dormilón | «chiquillo» | resopla | calor y silencio |
| **La Reina** | majestuosa y agotada | «pequeño» | «Zzz...» | que sus obreras duerman |
| **El Ciervo** | solemne, triste, amable | «caminante» | habla despacio, de hojas | que nadie odie las hojas que caen |
| **Cierzo** | un niño enorme: pena y alegría a lo bruto; canta | «semillita» | canturrea | que alguien diga su nombre |

### 8.3 Antes y después

**Raíz, primer encuentro** (`TXT.elderIntro`, `js/05-texts.js:14`).

Antes (seis páginas):

> ¡Sprout! Has despertado... Como dice el libro: un brote no abre los ojos hasta que el
> valle lo llama. / Y el valle llama, brote. Mira el GRAN ROBLE sobre mí: gris y
> callado. / Mi hermano, el VIENTO DEL NORTE, le arrancó sus 8 SEMILLAS DORADAS y las
> sembró por los rincones del valle. / Sin ellas el Roble no respira. [...] / Tú naciste
> de su savia. Solo tú puedes oír dónde laten sus semillas. / Pero aún estás verde.
> Necesitas la HOJA ANCESTRAL: reposa en la playa del SUROESTE. ¡Ve con cuidado!

Después (cuatro):

> ¡Sprout! Petra decía que un día abrirías los ojos. Yo ya no me lo creía, brote.
>
> Mira el Roble: gris y callado. Mi hermano le arrancó sus ocho SEMILLAS. Mi hermano, el
> Viento del... el Viento. Qué cosa: tengo su nombre en la punta de la raíz y no me sale.
>
> Sin semillas el Roble no respira, y el año no gira. Tú eres de su savia: oirás dónde
> laten.
>
> Pero no vayas con las manos vacías. En la playa del suroeste reposa una hoja que corta.

**Raíz, tras la Brasa** (`TXT.thaw`, `:64`). Pasa de seis páginas a tres más el cartel:

> ¿Lo notas en los pies, brote? La tierra está tibia. La primavera ha vuelto a casa.
>
> El Topo te dijo algo más, ¿verdad? «Cier...». Guárdalo. Me suena a algo que se me ha
> caído.
>
> El verano está sellado en el Tronco de la Reina, al sur. Allí abajo también llegan mis
> raíces.
>
> CAPÍTULO 2: LA LÁGRIMA DE VERANO

**El Topo, al rendirse** (`TOPO_PEACE`, `:198`).

Antes:

> —¿No me rematas, brote? / —Solo cavaba buscando algo caliente en lo hondo. / —Como
> todos. Llévate la Brasa: tú la necesitas más que yo.

Después:

> —Uf. Qué ligero. Como si me hubieras sacudido una nevada de encima, chiquillo.
>
> —Yo cavaba para que la tierra respirara en primavera. ¿Cuándo se me olvidó?
>
> —Mi abuela me cantaba una nana aquí abajo... «que baja el Cier...». El Cier. No me
> sale más.
>
> —Llévate la Brasa. Ya me acuerdo de para qué cavo.

**La pista de la cima** (`ROOM_HINTS['1,-3']`, `:260`).

Antes:

> (El viento aúlla tu nombre con rencor...) / (Cuatro BRASEROS apagados rodean la cima:
> el frío lo sostiene en el aire. Enciéndelos con el FAROL.) / (Y si barre tu fila...
> ¡SALTA con el vilano!)

Después:

> (Una tormenta gris gira sobre la cima. Dentro, algo llora con voz de viento.)
>
> (Cuatro hilos grises la atan a las rocas. Las polillas no se despegan de ellos.)

**Petra, al despertarte** (`PETRA_WAKE`, `:289`).

Antes:

> ¡Brote! ¡Al fin! Llevas TRES primaveras dormido en esa maceta. / Soy Petra. Vivo aquí
> al lado. El abuelo Raíz me manda a buscarte. [...]

Después:

> ¡SPROUT! ¡Te has despertado! ¡Sabía que te despertarías!
>
> Te puse Sprout. Suena a brote estornudando. Te he regado tres años... o eso dice el
> abuelo. Sin estaciones, ¿cómo se cuentan los años?
>
> El abuelo Raíz te espera en la PLAZA, bajo el árbol grande. ¡Corre!

**El final de Raíz** (`TXT.cycle`, `:89`), ahora en la plaza y con Cierzo delante.

Antes:

> Sprout... ¿nunca te extrañó que todos hablen de OCHO semillas? / El Roble tuvo NUEVE.
> [...] Eras tú, brote.

Después:

> Cierzo.
>
> (Cierzo no dice nada. Nieva un poco más despacio.)
>
> Te he oído cantar todos los inviernos, hermano. Y nunca te lo dije.
>
> Brote... un árbol no puede subir a una montaña. Mis raíces llegan a todo el valle menos
> a él. Por eso te planté.

**Cierzo, al oír su nombre** (nuevo):

> —...Cierzo. Me llamo Cierzo.
>
> —Hace tanto que nadie... ¿Tú? ¿Tú lo has dicho, semillita?
>
> (Algo se mueve dentro de su tormenta. Algo que no es él.)

---

## 9. Cómo construirlo

### 9.1 Fases, en orden

| Fase | Qué | Módulos principales | Tamaño | Al acabar se puede jugar |
|---|---|---|---|---|
| **A · Canon y voz** | reescribir el guion con esta biblia; agujeros en el nombre; la página de la nana; el polvo de los guardianes; la polilla de los minijefes; polillitas; las alas en el relámpago del título | 05, 15a, 15b, 15c, 15h, 15j-15m, 12, 08a | M | el juego de hoy, coherente y con presagios |
| **B · La cima y el esqueleto del capítulo 5** | el rescate (los hilos); la pantalla de nombre; la revelación; la salida a la plaza; flags nuevos; el valle que se olvida; el sueño en la maceta; un final provisional | 12, 15l, 13, 15, 08, 10, 07, 15c | M-L | la historia nueva de principio a fin |
| **C · Motor de puzles** | estado de mazmorra; pisos; deslizamientos (hielo de verdad, sacos, bellotas que ruedan); rayos; campanas; corrientes; gancho que tira de bloques | 07, 08, 09, 10, 12a, 13, 03 | L | salas de prueba, cada una con su resolvedor |
| **D · Las cuatro mazmorras** | una por entrega (Cueva, Tronco, Molino, Templo), con sus jefes ajustados | 04, 12b-molino, 12a, 05, 12, 15j-15m | L (M cada una) | cada mazmorra nueva |
| **E · El Anillo del Año y los Anillos del Roble** | estación por sala; casillas de estación; la mazmorra final; la Oruga | 03, 08, 09, 04, 11, 15f | XL | el capítulo 5 jugable |
| **F · El jefe final y el final** | los cuatro niveles; el HUD que se olvida; el final y los créditos; la música | 12, 14, 15, 15a, 06 | XL | el juego entero |
| **G · Después del final** | nombres arreglados, tocones, la polillita, el Eco | 05, 08, 12c | S-M | el post-juego |

**Si hubiera que recortar**: A y B enteras; C y D con dos mazmorras (la Cueva y el
Templo); E con dos anillos; F con los niveles 1, 3 y 4 (el 4, en una pantalla).

**La música** (fases B y F) tiene tres pistas nuevas y una idea que las une: **la nana
comida**. El tema del Olvido es la nana de `casa` con notas quitadas, silencios donde
había notas. En el nivel 4, cada nombre devuelve notas hasta que suena entera. Para
componerlas, el agente `composer`.

### 9.2 El motor: piezas nuevas

1. **Estado de mazmorra** (`dstate`): un objeto por mazmorra que se guarda
   (`save()`/`loadGame()`/`newGame()`, `js/10-progress.js`) y que `loadScreen()`
   (`js/08-world.js:140`) aplica al cargar cualquier sala, como hoy hace con `crystalOn`
   pero para toda la mazmorra. Los efectos van en una tabla declarativa (qué casillas
   cambian en qué sala según el estado), en la línea de `ROOM_RULES`. Sirve para las
   raíces que crecen, la luz de la Columna y las aspas del molino.
2. **Pisos**: otra franja de coordenadas para el piso de abajo de la Cueva (como hoy
   `ny=10` para los escondites), que `regionOf` trata como `cueva`. La grieta del suelo
   usa la caída que ya existe y te deja en la sala de abajo; la escalera de raíz hace un
   `placeAt` a la de arriba. El mapa del zurrón, con dos pisos.
3. **Deslizamientos**, una sola regla para tres cosas: moverse hasta chocar. Es el hielo
   de verdad (solo en salas marcadas, para no cambiar el hielo del valle), los sacos que
   empuja la ráfaga y las bellotas en las rampas. La animación de `blockSlide`
   (`js/09-player.js:70`) sirve, estirada a varias casillas.
4. **Rayos**: se trazan al cargar la sala y cuando algo cambia (un tapón, una lente), con
   efectos por casilla (cera, girasol, miel). Entre salas, por la Columna, leyendo
   `dstate`.
5. **Campanas**: una casilla que suena (una nota de la escala de la nana) al darle con la
   Hoja, la vaina o la ráfaga, y una comprobación de secuencia por sala.
6. **Corrientes**: una casilla que, con una ráfaga encima, alarga el salto y el planeo
   del vilano.
7. **Gancho que tira**: hoy el gancho te lleva a ti (`throwHook`, `js/09-player.js:321`) o
   atrapa bichos pequeños. Tiene que poder traer bloques y tapones.
8. **Estación por sala** (el Anillo del Año): un `roomSeason` y una función
   `seasonTile(casilla, estación)` que se aplica en `loadScreen` y al cambiar, con un
   barrido de transición (`caWipeSpans` ya existe). Las paletas de estación ya están en
   `BIOMES`.
9. **Jefe por niveles**: el Olvido como máquina de etapas que atraviesa pantallas (la
   médula, la subida, la copa y el cielo), con sus entradas en `BOSS_INTRO` y `queueBye`
   (`js/15i-presenta.js`).
10. **El HUD que se olvida**: una lista de cosas olvidadas que `drawHUD` (`js/15-ui.js`)
    respeta (colores, icono de X, nombre).
11. **Pantalla de nombre**: un estado nuevo en `update()` (`js/13-update.js`), con su
    rejilla de letras en la fuente del juego.
12. **Polillas**: una partícula nueva en `js/08a-fx.js` (va a la luz y huye del sol) y un
    bicho pequeño para el capítulo 5.

### 9.3 Lo que se reaprovecha

| Pieza que ya existe | Para qué sirve ahora |
|---|---|
| La IA del Viento (`updViento`): barridos, carámbanos, braseros que se apagan | el rescate de la cima |
| El Eco de los Guardianes (`initEcho`) | el nivel 2 del jefe final |
| El motor del sueño (`dreamBegin`) | el sueño en la maceta |
| Las cinemáticas que pintan pantallas reales (`scScreen`) | los recuerdos de los Anillos |
| `drawWind`, con seis ánimos y a cualquier tamaño | Cierzo en la cima y en el final |
| Las letras de hielo (`tlGlyph`) | el nombre |
| El bioma mustio (`WILT`) | el valle que se olvida |
| Las despedidas de los minijefes | con una polilla que sale al final |
| `bossHit` | con el polvo que se sacude |
| La carga del Remolino | el golpe final |
| Las raíces de los altares (`ROBLE_ALTARS`, `rootLight`) | las puntas de raíz de la médula |

### 9.4 Partidas guardadas

- Todos los flags nuevos (`dstate`, `cierzo`, `olvido`, `anillo`, el progreso de los
  anillos, `finDone`) son opcionales al cargar, como los de ahora.
- Una partida a medias de los capítulos 1-3 sigue sin más. Si ya había vencido a un
  guardián, el trozo del nombre se le da al hablar con él de huésped (se queda en su
  sala tras la tregua).
- Una partida que ya pasó la cima antigua (`boss3Done`) o que ya acabó (`cycled`) entra
  en el capítulo 5 al cargar: el Olvido sale de la cima «tarde». Es una decisión abierta
  (§11).
- Las mazmorras rehechas cambian salas. Las llaves y los cofres guardados por coordenada
  (`opened`, `collected`) en salas que cambian se reinician al detectar la versión vieja
  del mapa.

### 9.5 Pruebas

`tests/verify.cjs` ya arranca el juego y lo conduce con `window.__sprout`. Para cada
fase:

- **Cada puzle nuevo**, con su solución escrita como secuencia de entradas (las de la
  Pista y del Foso de los Sacos ya están en este documento) y un resolvedor que
  compruebe que no hay atajos.
- **El grafo de cada mazmorra**: que no haya manera de quedarse sin llaves. Hoy está
  garantizado porque todas las llaves están fuera de cerrojos; con estado de mazmorra
  hay que comprobarlo.
- **La cima**: que los cuatro hilos se puedan cortar aunque los braseros se apaguen, con
  un bot como el que se usó con el Ciervo (que cae 6 de cada 8 veces).
- **El capítulo 5 de punta a punta**, con ayudas nuevas de depuración
  (`__sprout.cierzo()`, `__sprout.olvido()`, `__sprout.season(k)`).

---

## 10. La vara: gráficos, microcinemáticas y juice

El juego ya tiene el listón alto: cada arma tiene su cinemática a lo *Oracle*, cada jefe
su entrada y su despedida, las puertas pesan, la Hoja se dobla y el zurrón cae y rebota.
**Nada de esta propuesta entra por debajo de ese listón.** Esta sección lo concreta para
cada cosa nueva, para que el juice no se deje para el final.

### 10.1 Las reglas

1. **Cada cosa nueva tiene su momento.** La primera vez que aparece una mecánica, un
   enemigo o un objeto, hay una microcinemática de 2 a 5 segundos: el mundo se para
   (como en las presentaciones de `js/15i-presenta.js`), se ve la cosa hacer lo suyo y
   vuelve el control. La segunda vez, en versión corta; a partir de la tercera, nada. Z
   siempre la salta.
2. **Anticipación, acción y reacción.** Todo lo que se mueve avisa antes (se encoge,
   tiembla o brilla), actúa con peso (aplastar y estirar, hit-stop, sacudida) y deja
   rastro (polvo, chispas, marcas que se desvanecen).
3. **Lo importante se nota dos veces**: donde ocurre y en el HUD o en la música.
4. **Un cambio fuera de la vista se enseña.** Cuando algo cambia en otra sala (la raíz
   crece, la luz baja, las aspas giran), aparece un segundo en una esquina un recuadro
   con la miniatura de esa sala (las del mapa del zurrón, `thumbOf`,
   `js/08-world.js:87`) y se ve el cambio. Es el «se ha abierto una puerta en algún
   sitio» de los Zelda, pero enseñándolo. El estado de mazmorra deja así de ser confuso.
5. **Un vocabulario que no se mezcla.** El juice también tiene que ser coherente:
   - **El gris lila y el violeta son solo del Olvido**: su polvo, sus polillas, sus ecos
     y sus agujeros. Si algo es de ese color, es suyo.
   - **Cada estación tiene sus partículas, y solo esas**: pétalos en primavera, motas de
     sol en verano, hojas en otoño y nieve en invierno. Las usan el rito, el Anillo, los
     Anillos del Roble y el final.
   - **Las notas de la nana son el sonido de recordar.** Suenan en cada trozo del nombre,
     cada hilo cortado, cada campana y cada nombre devuelto en el final. El olvido suena
     al revés: notas que faltan.
   - **Los agujeros de polilla tienen un solo dibujo** (borde roído, píxel a píxel) en
     todas partes: runas, cartas, cajas de diálogo, carteles y el HUD.
6. **Arte a tamaño nativo**: 160×144, sin escalar sprites ni texto, y con las reglas de
   rendimiento de `ARCHITECTURE.md` (búferes `pxBuf`, un lienzo por volcado por lo del
   iPhone, cachés). Lo grande se dibuja grande, como el Viento a 2× en su entrada; nunca
   se estira.
7. **El juice no tapa el juego.** Hit-stop y sacudidas cortos, microcinemáticas que no se
   repiten y avisos que no pisan los diálogos (como ya pasa con los toasts).

### 10.2 Cosa por cosa

**Los presagios (capítulos 0-3)**

- **Polillitas.** *La primera vez*, en el valle mustio, una se posa en la hoja de Sprout:
  primer plano (`caFaceCut`, `js/15e-cinearma.js:364`), Sprout la mira bizco, estornuda
  y la polilla sale volando. *Siempre*: aleteo de dos fotogramas y vuelo en ocho;
  rodean el farol y las antorchas; en un rayo de sol, chispa y ceniza; huyen si corres.
- **El polvo de los guardianes.** Cada golpe suelta una bocanada gris hacia donde va el
  golpe, y cada vez menos, porque les queda menos. Al rendirse, una última sacudida: el
  polvo cae como nieve gris y los colores del guardián pasan de apagados a vivos. Es el
  dibujo de acordarse.
- **La polilla de los minijefes** (1,5 s): la muda se deshace, algo se mueve dentro,
  sale una polilla, se sacude las alas dos veces y se va hacia el norte en curva.
- **El trozo del nombre.** Las letras salen del guardián como notas, dan una vuelta
  alrededor de Sprout y se meten en el zurrón mientras suena la nana hasta donde se sabe.
  En el zurrón, la página de la nana se cose letra a letra con hilo dorado.
- **Runas y cartas con agujeros.** Los agujeros tienen borde roído. Después de la cima,
  al abrirlas, se cosen con hilo dorado delante del jugador.
- **El relámpago del título**: dos fotogramas de alas con ocelos.

**Las mazmorras**

- **El fogón.** *La primera vez*: el mundo se para, la mecha de la bomba prende el fogón
  con un soplido, el calor hace ondular el aire (filas desplazadas), la escarcha se
  retira de las paredes en ola, el nudo de raíz tiembla y la raíz crece casilla a casilla
  echando hojitas y crujiendo. *Siempre*: brasas que chisporrotean, luz que respira y,
  si Sprout se queda cerca, se calienta las manos.
- **La grieta del suelo.** Se abre en estrella, hay un instante de silencio y se hunde.
  Sprout cae (la caída de siempre) y aterriza abajo aplastándose entre polvo; por el
  agujero entra un haz de luz desde arriba.
- **La bellota que rueda.** Gira con fotogramas de rotación, bota en los cambios de rampa
  y su mecha echa chispas cada vez más deprisa al final.
- **El rayo de sol.** *La primera vez*: el tapón salta, entra un rayo con motas de polvo
  dentro y el girasol se vuelve despacio hacia la luz y abre los pétalos uno a uno.
  *Siempre*: el rayo tiembla un poco, la cera gotea al derretirse y las polillas se
  lanzan a él y arden.
- **La lente de rocío**: brilla al recibir el rayo y deja un arcoíris pequeño en el suelo.
- **El saco de harina**: resbala arrastrándose, suelta una nube de harina al chocar y
  suena un «tum».
- **La Rueda Mayor.** *La primera vez*: corte al exterior, donde las aspas del molino de
  la Ciénaga (`drawWindmillCienaga`, `js/12b-molino.js:317`) giran un cuarto de vuelta,
  y el recuadro de miniaturas enseña las compuertas que se abren en otras salas.
  *Siempre*: engranajes que traquetean en todas las salas y una sacudida suave.
- **El hielo de verdad.** Sprout se desliza con los brazos abiertos dejando una estela de
  escarcha; al chocar se aplasta, suena un «tong» y saltan chispitas de hielo. Al frenar
  con el vilano, aterriza clavado con un anillo de nieve.
- **Las campanas.** Cada campana tocada deja una onda visible y da su nota; las runas de
  la puerta se encienden al acertar. Con la frase entera, las campanas tocan la nana
  solas y la puerta se abre en una lluvia de escarcha.
- **Las corrientes**: rejillas que soplan hojas hacia arriba; al planear, la hoja de
  Sprout aletea y deja líneas de viento.
- **El Topo busca el calor**: olisquea el aire hacia el fogón con el hocico temblando y
  asoma con cara de gusto... hasta que ve la bomba y pone los ojos como platos.
- **La Reina deslumbrada**: se tapa los ojos con las patas, le dan vueltas estrellitas y
  pierde altura en espiral.

**La cima**

- **La llegada**: una presentación como la de hoy (el cielo se cierra), pero con la cara
  triste de Cierzo dentro de la tormenta, los cuatro hilos brillando y el título «LA
  CIMA · EL CAPULLO GRIS» en letras de hielo.
- **Cortar un hilo**: el hilo restalla y las dos mitades se recogen de golpe; hit-stop;
  la tormenta se estremece y, por un instante, la cara de Cierzo se ve más clara. Suena
  una nota de la nana, y con los cuatro hilos suena el primer compás.
- **La pantalla de nombre**: una rejilla tallada en hielo con un copo por cursor. Cada
  letra buena se talla con su nota; una mala se la lleva una ráfaga dando vueltas.
- **El nombre**: CIERZO se talla en grande. Un compás de silencio y la nana suena entera
  por primera vez, con la letra a máquina debajo.
- **La revelación**: la tormenta se oscurece y dos ocelos se abren como párpados, con un
  latido. Aparece el cartel EL OLVIDO y la polilla se come sus letras píxel a píxel. La
  música pierde notas hasta quedarse en silencio. La sombra sale de la cima y cruza el
  valle (el plano del valle desde arriba, el del título) hacia el Roble.
- **La salida**: vuelo en el último soplo de Cierzo sobre el valle (pantallas reales,
  `scScreen`), aterrizaje en la plaza y plano hacia arriba del Roble envuelto en seda.

**El capítulo 5**

- **El valle se olvida**: al entrar en una pantalla, el gris la invade desde los bordes,
  con borde roído.
- **Raíz, mudo**: su caja de diálogo aparece y su voz empieza a sonar... pero las letras
  se deshacen en polillas según se escriben.
- **El Anillo del Año**: una cinemática completa, como las de las ocho armas (`CA_SCRIPT`,
  `js/15e-cinearma.js:394`). Sprout, en grande, alza el anillo; el fondo pasa por las
  cuatro estaciones en barridos; golpe congelado; el nombre enorme y su frase.
- **Cambiar de estación**: Sprout alza el anillo y un círculo sale de él repintando la
  sala. El agua se hiela desde la orilla con un crujido (y se agrieta al fundirse), las
  enredaderas se despliegan casilla a casilla con un rebote, caen hojas que se amontonan
  y entran rayos de sol. El anillo del HUD gira con inercia y hace clic en cada estación,
  y la música de la mazmorra cambia de timbre con ella.
- **Los recuerdos de los anillos**: figuras con un leve temblor de línea, en el sepia de
  su estación. Al pisar su zona representan su escena (5-8 segundos), sin texto o con una
  sola línea.
- **La Oruga**: los segmentos ondulan en ola; al comer cruje y salta tierra; al recibir
  un golpe, una ola de aplastamiento le recorre el cuerpo; al huir, se enrosca y se hunde
  en una espiral de polvo.
- **Nivel 1**: la crisálida late y se hincha con cada latido; las capas se pelan en tiras
  que se enroscan, y de cada una cae un eco.
- **Nivel 3**: cada aletazo levanta polvo en la dirección del ala, los ocelos brillan y el
  HUD se roe (los corazones, mordidos).
- **Nivel 4**: cada voz aparece como un retrato pequeño (`PORTRAITS`,
  `js/02-sprites.js:1113`) con la voz propia del personaje (`voiceBlip`, `js/15-ui.js:108`).
  Lo que devuelve cada nombre vuelve con un rebote. Al girar el año, el anillo de carga
  se llena en cuatro colores.
- **El final**: planos nuevos con Raíz y Cierzo juntos (Cierzo con su ánimo `happy` a
  2×), la plaza cantando y la polillita.

### 10.3 Cómo se comprueba

- **Cada microcinemática tiene su prueba**: que se salta con Z, que la segunda vez es
  corta y que no deja el juego en un estado raro, como ya hacen las pruebas de las
  presentaciones (saltar títulos, entradas y salidas).
- **Rendimiento**: `npm run perf` con las escenas nuevas (la tormenta, la Rueda Mayor, el
  cambio de estación y la Polilla), también con la CPU 4× más lenta.
- **Capturas** de cada momento para el README, como las de ahora, sacadas con
  `__sprout.freeze`.

---

## 11. Decisiones abiertas

1. **El Olvido como polilla**: ¿convence, o preferimos otra forma para el mismo papel?
2. **El nombre**: ¿Cierzo? Hay otros vientos con nombre (Ábrego, Bóreas...), pero ninguno
   es un viento del norte tan nuestro.
3. **Los trozos del nombre**: ¿los dan los tres guardianes (con el «Zzz» de la Reina), o
   las cinco cartas del Viento, que entonces pasarían a ser obligatorias?
4. **El Anillo del Año**: ¿solo dentro del Roble, o también en el valle tras el final?
5. **Las mazmorras**: ¿rehacerlas sobre las salas de ahora (más barato, menos riesgo) o
   dibujarlas de cero con el esqueleto nuevo?
6. **El nivel 4**: ¿cinemática interactiva en una pantalla, o secuencia de vuelo con
   Cierzo?
7. **Las partidas que ya acabaron**: ¿entran en el capítulo 5 al cargar?
8. **El Zángano**: ¿pasa a ser el Soldado de Cera, o se queda como está y solo cambia su
   despedida?
