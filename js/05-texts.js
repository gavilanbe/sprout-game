'use strict';
/* ---------- EL GUION ----------
   Voces (docs/TERCERA-PASADA.md §8): cada cual llama a Sprout a su manera.
   Raíz «brote» · Petra «Sprout» · Lupa «tallito» · Moss «grumete» · Tilo «cliente» · Corteza «criatura» ·
   el Topo «chiquillo» · la Reina «pequeño» · el Ciervo «caminante» · el Viento «semillita».
   ▒ es un agujero de polilla: lo que el olvido se ha comido (se pinta roído en las cajas de texto, 15-ui).
   Nada de «mil»; lo que se sabe no se vende como sorpresa. */
const TXT = {
  sign:[ "VALLE RAÍZ.", "Sin estaciones, los bichos no saben si dormir o salir, y andan de mal humor.", "Cuidado fuera del pueblo." ],
  signs:{
    '0,1':[ "BARRIO DEL ROBLE. Al este, la PLAZA DE LAS ESTACIONES.",
            "Casa de la izquierda: la tuya. La de la derecha: la TIENDA DE TILO.",
            "Tilo cobra en BAYAS. La hierba y los arbustos esconden unas cuantas.",
            "ENTER abre el ZURRÓN: el mapa, las tareas y todo lo que lleves." ],
    '0,2':[ "Aquí reposa la HOJA ANCESTRAL.",
            "Solo un brote de corazón puro podrá alzarla." ],
  },
  door:[ "Está cerrado. No hay nadie en casa." ],
  elderIntro:[ "¡Sprout! Petra juraba que despertarías.",
               "Yo ya no me lo creía, brote.",
               "Mira el Roble sobre mí: gris y callado.",
               "Mi hermano le arrancó sus ocho SEMILLAS DORADAS.",
               "Mi hermano, el Viento del... el Viento. Qué cosa.",
               "Tengo su nombre en la punta de la raíz y no me sale.",
               "Sin semillas no respira, y el año no gira.",
               "Tú eres de su savia: oirás dónde laten.",
               "No vayas con las manos vacías.",
               "En la playa del SUROESTE reposa una hoja que corta." ],
  elderRemind:[ "La hoja que corta te espera en la playa del SUROESTE.", "Ve con cuidado, brote." ],
  elderBlade:[ "La Hoja te sienta bien, brote.",
               "Cinco semillas laten a la vista.",
               "Otras tres duermen bajo arbustos que BRILLAN.",
               "El ZURRÓN (ENTER) guarda el mapa y tus tareas." ],
  elderWin:[ "¿Lo oyes, brote? El Roble respira.",
             "Tus hermanas laten otra vez en su copa.",
             "Pero sin aliento se le cayeron las cuatro ESTACIONES.",
             "Cada una rodó hacia quien más la echaba de menos.",
             "La primavera se hundió bajo tierra, con el TOPO REAL.",
             "Dicen que abraza una BRASA que no se apaga.",
             "La zarza del noroeste se ha secado: ya puedes subir.",
             "Iría yo, pero un árbol no se mueve de su sitio.",
             "CAPÍTULO 1: LA BRASA DE PRIMAVERA" ],
  allSeeds:[ "¡Las ocho semillas! Laten como un corazón con prisa. Llévaselas a RAÍZ." ],
  bladeGet:[ "¡Has alzado la HOJA ANCESTRAL!",
             "Verde como la primavera, afilada como el invierno.",
             "Pulsa Z para blandirla. Corta hierba, arbustos y bichos." ],
  bombGet:[ "¡La BELLOTA-BOMBA!",
            "Equípala en el zurrón (ENTER) y pulsa X para plantarla.",
            "Rompe rocas agrietadas y paredes con grietas." ],
  emberGet:[ "¡La BRASA DE PRIMAVERA!",
             "El primer calor del año, el que despierta a las semillas bajo tierra. Late como un corazón.",
             "Llévala a su ALTAR, junto al Gran Roble." ],
  containerGet:[ "¡Un CORAZÓN DE SAVIA! Tu vigor aumenta." ],
  pieceGet:(n)=>[ "¡Un CUARTO DE CORAZÓN! ("+n+"/4)", n>=4?"¡Cuatro cuartos! Tu vigor aumenta.":"Reúne cuatro y tu vigor crecerá." ],
  hookGet:[ "¡La RAÍZ-GANCHO!",
            "Equípala (ENTER) y, frente al agua, pulsa X: cruzarás a la otra orilla.",
            "También se agarra a los POSTES DE RAÍZ." ],
  boomerGet:[ "¡La VAINA VOLADORA!",
              "Equípala y pulsa X: vuela, aturde bichos y vuelve.",
              "Recoge cosas lejanas y golpea cristales." ],
  lanternGet:[ "¡El FAROL DE BRASA!",
               "Alumbra las cuevas oscuras.",
               "Con X frente a una antorcha apagada, la enciende." ],
  featherGet:[ "¡El VILANO DE PETRA!",
               "Ligero como un deseo. Equípalo y pulsa X para SALTAR.",
               "Cruza agujeros y vacíos de un brinco." ],
  shieldGet:[ "¡El ESCUDO DE CORTEZA!",
              "Se lleva solo: las rocas y las esporas que te lleguen de frente rebotan." ],
  keyGet:[ "¡Una LLAVE-BELLOTA! Abre un cerrojo de esta mazmorra." ],
  bigkeyGet:[ "¡La LLAVE GRANDE! Abre la puerta del guardián." ],
  tearGet:[ "¡La LÁGRIMA DE VERANO!",
            "Una lágrima del Roble con el sol dentro. Fresca y tibia a la vez.",
            "Su ALTAR la espera junto al Roble." ],
  flakeGet:[ "¡El COPO ETERNO!",
             "No se derrite jamás. Late frío y deprisa, como un corazón que corre.",
             "Llévalo al Roble. Deprisa." ],
  thaw:[ "¿Lo notas en los pies, brote? La tierra está tibia.",
         "La primavera ha vuelto a casa.",
         "Y el Topo te cantó algo, ¿verdad? «Cier...»",
         "Me suena a algo que se me cayó hace mucho. Guárdalo.",
         "El verano cayó en el panal de la REINA AVISPA.",
         "Pidió un otoño para sus obreras. Nadie la escuchó.",
         "Yo, el primero.",
         "Ahora lo guarda sellado en cera, en el TRONCO HUECO.",
         "Tus bombas abrirán las rocas de la playa del este.",
         "CAPÍTULO 2: LA LÁGRIMA DE VERANO" ],
  summer:[ "¿Sientes el sol, brote? Es verano en todo el valle.",
           "¿Y la Reina? ¿Zumbaba? CIER... Z...",
           "Lo tengo en la punta de la raíz...",
           "...y se me deshace, como si algo gris me lo comiera.",
           "El otoño viejo de las marismas por fin se seca...",
           "...pero no se ha ido. Se lo llevó el CIERVO DE ÁMBAR al MOLINO.",
           "Es amigo de mi hermano.",
           "Deja caer las hojas aunque nadie se lo agradezca.",
           "Ve, brote. Y no le guardes rencor.",
           "CAPÍTULO 3: LA HOJA DE ÁMBAR" ],
  autumn:[ "La Hoja de Ámbar huele a castañas y a lluvia.",
           "CIER. Z. O. Lo tienes entero, brote.",
           "Yo no puedo decirlo: se me deshace en la boca.",
           "Díselo tú. Es lo que pide su última carta.",
           "Queda el INVIERNO. Ese no lo guarda nadie:",
           "mi hermano se lo llevó consigo al PICO.",
           "Un VENTISQUERO tapa el sendero.",
           "Tu MOLINILLO lo barrerá.",
           "Más arriba, el TEMPLO. Lleva bomba, gancho y luz.",
           "Mis raíces no llegan al pico, brote. Las tuyas, sí.",
           "No subas a luchar: sube a recordar.",
           "CAPÍTULO 4: EL COPO ETERNO" ],
  molinilloGet:[ "¡El MOLINILLO!",
                 "Un molinete de papel de colores. Equípalo (ENTER) y pulsa X: ¡sopla una ráfaga!",
                 "Barre la HOJARASCA, hace girar los MOLINETES y aparta a los bichos.",
                 "Hasta la nieve se rinde ante él." ],
  amberGet:[ "¡La HOJA DE ÁMBAR!",
             "Dorada y tibia. Aunque la sueltes, cae despacio.",
             "El otoño entero cabe en ella. Llévala a su ALTAR, junto al Roble." ],
  cycle:[ "Todo el valle ha dicho su nombre, brote.", // el final (15o): Raíz, con voz otra vez, bajo la nieve de su hermano
          "Y el tuyo.",
          "Mis raíces llegan a todo el valle... menos al pico.",
          "¿Sabes por qué te planté?" ],               // la respuesta es el último plano del final (15a)
  amuletGet:(a)=>[ "¡"+a.name+"!", a.desc, "Equípalo en el zurrón (ENTER): dos ranuras." ],
  diaryFirst:[ "(Una hoja del Roble escrita con letra menuda. El viento se las lleva por todo el valle.)" ],
};
/* los amuletos: pasivas equipables (dos a la vez) */
const AMULETS={
  raiz:  {name:'AMULETO DE RAÍZ',   desc:'El daño que\nrecibes se reduce\na la mitad.'},
  savia: {name:'ANILLO DE SAVIA',   desc:'Las bayas vienen\na ti y los bichos\nsueltan el doble.'},
  musgo: {name:'CORAZÓN DE MUSGO',  desc:'Tu vigor se\nregenera poco a\npoco al caminar.'},
  erizo: {name:'PÚA DE ERIZO',      desc:'La Hoja hace un\npunto más de daño.'},
  viento:{name:'CASCABEL DE VIENTO',desc:'Caminas más\ndeprisa.'},
  buho:  {name:'OJO DE BÚHO',       desc:'Ves brillar los\nsecretos: grietas,\narbustos y cofres.'},
  rana:  {name:'PIEL DE RANA',      desc:'El barro y el\nvado ya no te\nfrenan.'},
  topo:  {name:'CORONA DEL TOPO',   desc:'Tus bombas no te\nhieren y estallan\nmás grandes.'},
};
/* el diario de Raíz: está escrito en hojas del Roble, y el viento las ha llevado por todo el valle */
const DIARY={
  '9,9':[ "DIARIO DE RAÍZ: «Mi hermano me cantaba una nana cada invierno, para que durmiera.",
          "Ya no la recuerdo.",
          "Dejo esta hoja junto a la maceta que riega Petra. Quien brote en ella...",
          "...que crezca libre, y que un día suba adonde yo no llego.»" ],
  '0,-1':[ "DIARIO DE RAÍZ: «Mandé mis raíces monte arriba para verle. Se helaron en la ladera.",
           "¿Desde cuándo no le doy las gracias por el invierno?»" ],
  '2,3':[ "DIARIO DE RAÍZ: «El otoño rodó hasta las marismas, y aquí se pudre",
          "esperando que alguien lo quiera. Como una carta sin abrir.»" ],
  '7,0':[ "DIARIO DE RAÍZ: «El Topo cava desde hace años.",
          "Creo que busca algo caliente en lo hondo. Como todos nosotros.»" ],
  '10,1':[ "DIARIO DE RAÍZ: «La Lágrima la lloré yo, de alegría, el primer verano del mundo.",
           "El sol se quedó dentro. Ahora la Reina la guarda en cera.",
           "No se la pidas: gánatela.»" ],
  '1,-2':[ "DIARIO DE RAÍZ: «Si llegas al pico, brote, no luches.",
           "Mi hermano no es malo. Solo lleva demasiados inviernos",
           "esperando que alguien suba a darle las gracias.»" ],
  dplaza:[ "DIARIO DE RAÍZ: «Hoy ha nevado sobre la plaza. Nadie ha tenido miedo.",
           "Mi hermano canta bajito y yo, por fin, le escucho.»" ],
};
/* piedras rúnicas: la historia de los dos hermanos, gastada por el tiempo... y roída */
const RUNAS={
  '0,12':[ "PIEDRA RÚNICA: «Aquí resuenan los que guardaron el año.","No son ellos: son su eco. No hablan ni ceden...","...pero se desvanecen cuando alguien les recuerda que ya no hace falta pelear.»" ],
  get '1,0'(){ return cierzoSaid()?[ "PIEDRA RÚNICA: «Dos hermanos plantó la Tierra:", "RAÍZ, el Roble, señor del verdor...",
          "...y CIERZO, el Viento, que arropa el sueño del invierno.»", "(Donde la piedra estaba roída, el nombre ha vuelto a brillar.)" ]
        :[ "PIEDRA RÚNICA: «Dos hermanos plantó la Tierra:", "RAÍZ, el Roble, señor del verdor...",
          "...y ▒▒▒▒▒▒, el Viento, que arropa el sueño del invierno.»", "(Donde iba su nombre, la piedra está roída, como si algo se lo hubiera comido.)" ]; },
  '3,2':[ "PIEDRA RÚNICA: «Al Roble todos le cantaban.",
          "Del Viento, nadie recordaba el nombre.»" ],
  '1,-1':[ "PIEDRA RÚNICA: «Y el Olvido lo volvió amargo. Algo gris le susurraba en la ventisca:",
           "'Quítales lo que más quieren, y tendrán que buscarte.'»" ],
  '2,1':[ "PIEDRA RÚNICA: «Ocho hijas de oro dio el Roble, a la vista de todo el valle...",
          "...y una novena guardó en su savia, donde nadie la buscó.»" ],
};
/* vecinos: lo que dicen según el momento de la historia */
const NPC_TALK={
  j(){ // Lupa, la jardinera: su trueque (10 bayas → Vaina voladora) se acepta con Z
    let pg;
    if(!hasBlade) pg=["Soy Lupa. Cuido las flores que quedan.","Sin las semillas del Roble esto se apaga, tallito."];
    else if(!won) pg=["Truco de Lupa:","los arbustos que BRILLAN esconden cosas.","Córtalos con tu hoja, tallito.","Y al ESCARABAJO ACORAZADO, por la cola:","el morro no hay quien lo corte."];
    else if(!thawed) pg=["Mis flores tiritan, tallito.","Ese invierno del norte no es normal: huele a polvo viejo.","Dicen que el TOPO REAL guarda una brasa que arde."];
    else if(!summered) pg=["El sur huele a hojas viejas. Mis dalias se agobian, tallito."];
    else if(!autumned) pg=["Las hojas que caen no son basura, tallito.","Son la manta del jardín.","Sin otoño la tierra no descansa. Tráelo de vuelta."];
    else if(!cycled) pg=["¿Verano eterno? No, tallito.","El suelo también necesita dormir.","Que vuelva el invierno: las raíces sueñan bajo la nieve."];
    else pg=["¡Las cuatro estaciones! Jardín perfecto.","Hasta el aire huele a verde, tallito."];
    if(hasBlade&&!hasBoomer) pg=pg.concat(["Si me traes 10 BAYAS te preparo algo que VUELA."]);
    return pg;
  },
  y(){ // Moss, el pescador: pocas palabras, y su caña sabe cosas
    if(!hasBlade) return ["...Los peces ya no pican. Mal asunto."];
    let pg;
    if(!won) pg=["Vi brillar algo en la lengua de arena.","Un bicho lo vigila, grumete."];
    else if(!thawed) pg=["El agua baja helada del norte.","Los peces tiemblan bajo el hielo."];
    else if(!summered) pg=["La marisma baja parda y amarga.","«Otoño podrido», dice mi caña. Y mi caña sabe."];
    else if(!autumned) pg=["El verano ha vuelto al agua. Hasta los renacuajos sonríen.","Pero en la Ciénaga las hojas se amontonan...","...en el viejo molino.","Raro, raro."];
    else if(!cycled) pg=["¡Pican otra vez! Te debo una, grumete.","Mi caña dice que en el pico no nieva: nieva gris. No me gusta."];
    else pg=["Pesqué bajo la primera nieve.","Todo en su sitio, grumete."];
    return pg.concat(["Tráeme 5 BAYAS y te hago mi sopa. Cura del todo."]);
  },
  'ö'(){ // Corteza, la ermitaña de los amuletos
    if(!hasBlade) return ["Hmm... un brote sin hoja. Vuelve cuando cortes algo, criatura."];
    return ["Soy Corteza. Tallo AMULETOS con lo que el valle olvida.","Dos puedes llevar a la vez. Elige bien, criatura.","Acércate al mostrador si traes bayas."];
  },
  h(){ // Petra, la niña que regó la maceta (y le puso nombre al brote)
    if(!elderMet) return ["¡Corre a la PLAZA, Sprout!","El abuelo Raíz te espera al ESTE, bajo el árbol grande."];
    if(!hasBlade) return ["¿Ya has visto al abuelo? Pues a la PLAYA del suroeste.","Yo no puedo ir: mamá dice que hay cangrejos."];
    if(!won) return ["¿Una hoja gigante? ¡QUÉ ENVIDIA!","Yo solo tengo este diente de león. No corta nada.","Si algún día encuentras un VILANO grande... ¡es mío, eh!"];
    if(!thawed) return ["¿Has visto el espino seco del norte? Da repelús.","Mamá llama RODAPÚAS a los erizos de allí.","Si se hacen bola, ¡ni los toques de frente!"];
    if(!summered) return ["¡Ha vuelto la primavera! ¡Eres mi héroe, Sprout!","Oye... el abuelo te mira raro.","Como se mira a un nieto. Cosas mías, seguro."];
    if(!autumned) return ["¿Has visto el MOLINO de la Ciénaga? ¡Las aspas giran otra vez!","Dicen que dentro duerme un CIERVO...","...con cuernos de ámbar.","Y un ESPANTAPÁJAROS que se mueve...","...cuando no lo miras. ¡Brrr!"];
    if(!cycled) return ["El abuelo dice que aún falta el INVIERNO.","¿Y quién quiere frío?... ¿O sí? Ya no sé.",hasFeather?"¡Ese vilano es MÍO! ...Bueno, quédatelo. Vuela mejor contigo.":"En el pico hay un TEMPLO viejo.","¡Dicen que guarda un VILANO enorme!"];
    return ["¡Está nevando y NO da miedo!","Es como azúcar. ¡El invierno también es bonito!"];
  },
};
/* el prólogo ilustrado: una página por plano (ver drawPrologue en 15a), tres líneas como mucho.
   Que Sprout es la semilla escondida lo sabe el jugador desde el título: no se vende como sorpresa */
const CINE=[
  "Hace mucho, la Tierra plantó dos hermanos: el GRAN ROBLE y el VIENTO DEL NORTE.",
  "El Roble traía primavera y verano; el Viento, otoño e invierno. Y el año giraba.",
  "Pero el valle le cantaba al Roble y se olvidó del Viento. Tanto, que nadie recordaba ya su nombre.",
  "Una noche, algo gris le susurró al oído, y el Viento arrancó al Roble sus OCHO SEMILLAS.",
  "Sin ellas, al Roble se le cayeron las ESTACIONES. Rodaron por el valle y el año se atascó.",
  "Y el valle se fue quedando GRIS, como si lo cubriera un polvo muy fino.",
  "En la savia del Roble quedaba una semilla que nadie conocía. Una niña la plantó...",
  "...y la regó tres años. Esta mañana, por fin, un pequeño brote abrió los ojos.",
];
/* los jefes no se rematan: agotados, ceden su tesoro (Z a su lado) */
const TOPO_PEACE=[
  "—¿No me rematas, chiquillo?",
  "—Uf. Qué ligero.",
  "—Como si me hubieras sacudido una nevada de encima.",
  "—Cavaba y cavaba, buscando algo caliente.",
  "—Ya ni me acordaba de para qué.",
  "—Para que la tierra respire en primavera.",
  "—Para eso cavamos los topos.",
  "—Mi abuela me cantaba una nana aquí abajo...",
  "—«...que baja el Cier...». El Cier. No me sale más.",
  "—Llévate la Brasa. Ya me acuerdo de para qué cavo.",
];
const TOPO_AFTER=[
  "—¿Vuelves, chiquillo? Aquí abajo se está calentito.",
  "—Toma: mi corona vieja.",
  "—Con ella, las bombas no te morderán.",
];
const QUEEN_PEACE=[
  "—Zzz... Te la has ganado, pequeño.",
  "—Qué raro. Me pesaban las alas...",
  "—...como llenas de polvo gris.",
  "—Pedí un otoño para que mis obreras durmieran.",
  "—Nadie me escuchó.",
  "—Cuando me cayó el verano, lo sellé en cera.",
  "—Creía que así llegaría el otoño...",
  "—Zzz... No. No es sueño.",
  "—Así zumbábamos una nana en invierno:",
  "—«...que baja el... ZZZ...»",
  "—Solo me queda el zumbido.",
  "—Llévate la Lágrima. Mis obreras y yo dormiremos al fin.",
];
const QUEEN_AFTER=["—Zzz... Las flores vuelven a cerrar de noche.","—Gracias, pequeño."];
const WIND_AFTER=["(La brisa peina la nieve, mansa.)","(Ya no aúlla: canturrea. Es la nana de Raíz.)"];
/* minijefes: presentaciones (insinúan; no resuelven) */
const MID_CARD={king:'EL ESCARABAJO REY',drone:'EL SOLDADO DE CERA',iceguard:'EL GUARDIÁN DE HIELO'};
const MID_INTRO={
  king:["(Un caparazón enorme cruje en la penumbra... Está vacío. Y aun así, se mueve.)","(Por delante es puro hierro.)"],
  drone:["(Un zumbido rígido llena el nido. Es un soldado del panal, con coraza de cera dura.)","(La Hoja no le hará ni un rasguño... a no ser que algo lo ablande.)"],
  iceguard:["(Los bloques del templo se juntan y cobran forma: hielo vacío, con algo gris dentro.)","(La Hoja no le hace nada. Tendría que ablandarse... con un buen estallido.)"],
};
/* los Anillos del Roble (12i) */
const RING_T={
  get:["¡El ANILLO DEL AÑO!","Un corte del tronco del Roble, con los cuatro colores del año.","Dentro del Roble, con X, hace girar la estación de la sala en la que estás."],
  enter:["(Dentro del tronco huele a savia y a nieve vieja.)","(Esto es un recuerdo del valle: el último invierno que alguien cantó.)"],
  hints:{
    '22,4':["(Un recuerdo: el valle de hace mucho, en invierno. El Roble era un arbolito.)","(Aquí siempre es invierno... a no ser que el año gire.)"],
    '23,4':["(Un estanque helado, con un islote. En la orilla, un bloque.)","(Y dos capullos de nenúfar, dormidos en el hielo.)"],
    '23,3':["(Algo gris se revuelve entre los árboles del recuerdo...)"],
    '23,2':["(Otro recuerdo: el valle barriendo las hojas del otoño, con rabia. Nadie las quería.)","(El barro se traga lo que pisa. A no ser que esté helado.)"],
    '22,2':["(Un barrizal y un campo de hoyos tapados de hojas. En la orilla, un bloque.)","(El barro se traga lo que pesa... y lo que se traga, ya no se mueve.)"],
    '22,1':["(Hojas por todas partes. Y algo gris que las mastica.)"],
    '25,2':["(Otro recuerdo: el verano de hace mucho. La Reina le pide al Roble que la deje descansar.)","(El Roble joven dice que no. Y el sol entra por un claro de la copa...)"],
    '24,2':["(Un claro en la copa. El sol del verano baja por él... hasta un arbusto en flor.)","(Abajo, la salida está sellada con cera.)"],
    '24,3':["(El verano zumba. Algo gris se come la hierba.)"],
    '24,1':["(El recuerdo más viejo del valle: el día que la Tierra plantó dos semillas.)","(Una iba a ser un roble. La otra, el viento.)"],
    '24,0':["(Hasta aquí ha huido. Detrás de ese desgarro ya no hay recuerdos: solo la médula del Roble.)"],
  },
};
/* la médula (12j): la Crisálida y los Ecos */
const MED_T={
  intro:["(La médula del Roble. Aquí dentro ya no hay recuerdos: solo lo que el Olvido se ha guardado.)","(En el centro cuelga un capullo gris. Late.)","(De las paredes asoman cuatro raíces, las de los altares. Cada una huele a una estación.)"],
  echoName:['ECO DEL TOPO REAL','ECO DE LA REINA','ECO DEL CIERVO','ECO DE CIERZO'],
  voice:[["(Muy lejos, bajo tierra, una voz ronca:)","—¡Aquí, chiquillo! ¡Que no se te olvide quién te enseñó a cavar!"],
    ["(Muy lejos, en el panal, un zumbido que sonríe:)","—Zzz... ¡Ahora, pequeño! Ya descansaré después."],
    ["(Muy lejos, en el molino, un paso de pezuñas sobre hojas:)","—Levántate, caminante. Las hojas caen para volver."],
    ["(Muy lejos, en la cima, el viento canta dos notas de la nana:)","—¡Semillita! ¡Te estamos llamando!"]],
  voiceWho:['EL TOPO REAL','LA REINA','EL CIERVO','CIERZO'],
  rise:["(El capullo revienta. De dentro sale ella: la polilla, entera, con las alas llenas de polvo gris.)","(Sube por el tronco, hacia la copa. Hacia el cielo del valle.)","(Y en el valle, alguien grita tu nombre...)"],
};
/* la Cueva (12h): la raíz madre despierta lejos, y Raíz lo nota por sus raíces */
const CV_T={
  mother:["(Un temblor sube desde lo más hondo de la cueva, por todas las raíces a la vez...)","—¡Brote! ¿Lo notas? Es mi raíz madre: ha despertado con el calor de los dos fogones.","—Te espera abajo, en la cripta. Ella guarda lo que buscas."],
};
/* la cima, después del ciclo: la nana recuperada */
const WIND_WHISPER=[
  "(La brisa peina la nieve, mansa.)",
  "(Ya no aúlla: canturrea. Es la nana de Raíz.)",
  "(Tantos inviernos de silencio, y al fin... música.)",
];
/* el final del Viento: no se vence, se recuerda (Z junto a él, exhausto) */
const WIND_PEACE=[
  "—¿No alzas tu hoja, semillita?",
  "—Hace tanto que nadie sube...",
  "—Ahí abajo ya nadie se acuerda de mí.",
  "—Ni yo me acuerdo ya de cómo me llamo.",
];
const WIND_NAME_SPROUT=[ "(CIER, de la madriguera. Z, del panal. O, del molino...)", "—Cierzo." ];
const WIND_NAME_BACK=[
  "(El viento se queda muy quieto.)",
  "—...Cierzo.",
  "—Me llamo Cierzo.",
  "—Hace tanto que nadie... ¿Tú lo has dicho, semillita?",
  "(El aullido se deshace en un suspiro largo.)",
  "(Algo frío y brillante cae a tus raíces.)",
];
/* los créditos: el valle respira */
const CREDITS=[
  'SPROUT','y las 8 semillas','',
  'una aventura de','GAVILANBE','',
  'LOS GUARDIANES','El Topo Real','La Reina Avispa','El Ciervo de Ámbar','Cierzo, el Viento del Norte','',
  'EL OLVIDO','que volvió a ser','una polilla','',
  'LOS VECINOS','Petra · Lupa · Moss','Tilo · Corteza','',
  'LA VOZ DEL ROBLE','Raíz','',
  'Ocho semillas.','Cuatro estaciones.','Un nombre.','Nadie ha muerto','y nadie ha sido olvidado.','',
  'Gracias por','hacer brotar','el valle.','',
  'Z: seguir jugando',
];
/* pistas de sala (la primera vez): insinúan, no resuelven */
const ROOM_HINTS={
  '7,0':["(Rocas-raíz... Si te plantas y empujas, quizá cedan.)"],
  '8,2':["(El suelo tiembla bajo tus raíces. Algo enorme cava ahí abajo, y le gusta el calor.)","(Cuatro fogones helados, uno en cada esquina. Y dos BELLOTEROS. Qué oportunos.)"],
  '7,1':["(Un fogón de tierra, helado. Al otro lado de la sima, una puerta con un tapón de hielo...)","(Y en la pared, un nudo de raíz, gris y dormido. Aquí todo espera un poco de calor.)"],
  '6,2':["(LAS HONDONADAS: el piso de abajo de la cueva. Arriba se oye el Taller.)"],
  '7,2':["(Charcas heladas y otro fogón frío. El hielo tapa la salida del este.)"],
  '6,3':["(Rampas de raíz que bajan hacia la sima. Una bellota rodaría por ellas...)","(En el cruce hay una placa. Y al otro lado de la sima, un fogón frío y un nudo dormido.)"],
  '7,3':["(La cripta. La llave grande descansa en una isla, en medio de la sima.)","(En la pared, un nudo enorme, dormido. Es más viejo que la cueva.)"],
  '7,-1':["(Una grieta cruza la pared del este. Se cuela aire fresco...)"],
  '10,-1':["(Un foso de raíces sin fondo. Al otro lado brilla un cofre.)"],
  '16,2':["(Dos antorchas frías custodian un cofre tras una verja.)"],
  '16,-1':["(El puente se hundió hace muchos inviernos.)","(Aquí el aire baja: no hay vilano que planee. Pero por esa rejilla sube un frío raro...)"],
  '14,0':["(Hielo liso como un espejo. Quien lo pisa no para hasta chocar.)"],
  '14,1':["(Dos losas en el suelo y dos bloques sobre el hielo.)","(En el rincón, un bloque de hielo. Ese no es de piedra...)"],
  '10,2':["(Un zumbido grave llena el panal, y el sol entra por cuatro nudos.)","(La Reina vuela rápida como un chispazo: el gancho ni la roza... a no ser que algo la ciegue.)"],
  '1,-3':["(Una tormenta gris gira sobre la cima. Dentro, algo llora con voz de viento.)","(Cuatro hilos grises la atan a las rocas. Las polillas no se despegan de ellos.)"],
  '1,-2':["(Aquí arriba el invierno nunca se fue. Sopla fuerte.)"],
  '2,3':["(Las hojas caen sin parar. Huele a otoño viejo...)"],
  '0,2':["(La arena susurra. Algo brilla entre las dunas...)"],
  '11,1':["(La luz de la Columna llega hasta aquí abajo. A los lados, miel cristalizada: dura como la piedra.)","(Abajo, una lente de rocío. Los pilares no dejan que la luz vaya a cualquier sitio...)"],
  '11,0':["(Al sur, la salida está sellada con cera dura. Aquí dentro no entra ni un rayo...)"],
  '11,-1':["(Arriba, un nudo enorme tapado con cera: el de la COLUMNA. El foso no deja llegar hasta él.)"],
  '12,1':["(La llave grande, enjaulada en cera.)","(El nudo de la pared queda al otro lado de la miel...)"],
  '15,0':["(Cinco campanas de hielo. En la verja hay cinco notas talladas.)","(Esa melodía... la has oído antes.)"],
  '15,1':["(Un vacío negro parte la sala. Haría falta volar...)"],
  '5,9':["(Está muy oscuro. Algo brilla al fondo.)"],
  '15,2':["(EL TEMPLO DE LA CIMA. Su hielo es de verdad: si lo pisas, resbalas hasta chocar.)"],
  '6,0':["(LA CUEVA DEL TOPO. Huele a tierra removida.)"],
  '10,0':["(EL TRONCO HUECO. La madera zumba por dentro, y está oscuro como una colmena.)","(En la pared del oeste, un nudo tapado con cera. Por la rendija se cuela un hilo de sol...)"],
};
/* Petra te despierta: ella plantó la maceta, la regó y le puso nombre al brote */
const PETRA_WAKE=[
  "¡SPROUT! ¡Te has despertado! ¡Lo sabía!",
  "Te puse Sprout: suena a brote estornudando.",
  "Te he regado tres años... o eso dice el abuelo.",
  "Sin estaciones, ¿cómo se cuentan los años?",
  "El abuelo Raíz te espera en la PLAZA, al este.",
  "Dice que es urgente.",
  "¡Y cuando el abuelo dice urgente, es que es urgente! ¡Corre!",
];
const PETRA_WAKE2=["(Petra sale corriendo. La puerta queda abierta.)"];
/* señales */
TXT.signs['1,1']=["PLAZA DE LAS ESTACIONES.","Aquí vive Raíz, la voz del Roble. Cuatro altares vacíos lo rodean."];
TXT.signs['2,1']=["PRADERA DEL RECUERDO. Al este, la orilla de Moss.","Al norte, el claro del bosque."];
TXT.signs['1,2']=["CAMINO DE LOS DIENTES DE LEÓN.","Al oeste, la playa. Al este, las dunas."];
TXT.signs['3,0']=["JUNCAL DEL NORTE. Cuidado con los murciélagos."];
/* libros de las estanterías */
const BOOKS={
  '9,9':{title:'Cómo cuidar un brote',pages:["«CÓMO CUIDAR UN BROTE», por Raíz. (Con la letra de Petra: se lo dictó él.)","«Riégalo con agua del lago. Háblale de noche. Déjalo dormir todo lo que necesite:",
    "un brote no despierta hasta que el valle lo llama.»","(En la maceta hay tres rayas, con la letra de Petra: «un año», «otro», «y otro».)"]},
  '8,9':{title:'Recetario de Tilo',pages:["«RECETARIO DE TILO».","«Corazón de savia: savia del Roble, miel del panal y sol de mediodía.",
    "Farol de brasa: una chispa que nunca se apague y corteza curada.»","«Nota: Corteza talla mejor que yo. No se lo digáis.»"]},
  '7,9':{title:'Leyendas de los amuletos',pages:["«LEYENDAS DE LOS AMULETOS», por Corteza.","«El Ojo de Búho lo talló una lechuza que veía en la niebla.",
    "El Cascabel se le cayó al Viento la noche de la tormenta.","La Corona del Topo es una lámpara de mina, pero él no lo sabe.»",
    "«Y el Susurro... el Susurro lo hacen cinco cartas que nadie leyó.»"]},
};
/* las CARTAS DEL VIENTO: cinco sobres nunca abiertos, dispersos por el valle. La firma, roída */
const LETTERS={
  '4,-1':["CARTA DEL VIENTO (1 de 5):","«Hermano: hoy he cubierto de nieve tus raíces para que duerman.",
          "No me has dado las gracias. No pasa nada. Mañana lo harás.»","Tu hermano, ▒▒▒▒▒▒."],
  '0,3':["CARTA DEL VIENTO (2 de 5):","«Hermano: todo el valle canta tu nombre. Del mío nadie se acuerda.",
         "He empujado las olas hasta esta cala para que alguien me oiga.»","Tu hermano, ▒▒▒▒▒▒."],
  '4,3':["CARTA DEL VIENTO (3 de 5):","«Hermano: la Reina me pidió un otoño. Tú le pediste más verano.",
         "Dejé caer las hojas de todos modos. Alguien tenía que hacerlo.»","Tu hermano, ▒▒▒▒▒▒."],
  '4,9':["CARTA DEL VIENTO (4 de 5):","«Hermano: he escondido esta carta bajo un arbusto, como escondí tus semillas.",
         "Si la encuentras, es que aún me buscas.»","Tu hermano, ▒▒▒▒▒▒."],
  '1,-2':["CARTA DEL VIENTO (5 de 5):","«Hermano: me subo al pico. Si alguna vez alguien dice mi nombre en voz alta, bajaré.",
          "Hasta entonces, que nieve.»","Tu hermano, ▒▒▒▒▒▒."],
};
const LETTERS_DONE=["¡Las cinco cartas! Raíz querrá leerlas."];
const RAIZ_LETTERS=[
  "¿Cartas de mi hermano...? Nunca las abrí.",
  "«...si alguna vez alguien dice mi nombre en voz alta.»",
  "Ay, brote. Y yo ni siquiera lo recuerdo.",
  "Las doblaré en un molinillo de papel.",
  "Cuando sopla, suena su voz.",
  "Tómalo. Es tuyo.",
];
/* más diario */
DIARY['3,-1']=["DIARIO DE RAÍZ: «Dicen que desde el mirador se ve el valle entero.","Mi hermano subía a mirar cómo crecían mis semillas.","Nunca le pregunté si le parecían bonitas.»"];
DIARY['4,0']=["DIARIO DE RAÍZ: «La cascada baja fría del glaciar. Es agua de mi hermano.","Sin ella, mi lago sería un charco. Tampoco se lo he dicho.»"];
DIARY['12,1']=["DIARIO DE RAÍZ: «Las abejas de la Reina trabajaban sin descanso.","Yo pedía más flores. Ella pedía un otoño. No escuché.»"];
DIARY['14,0']=["DIARIO DE RAÍZ: «Los antiguos levantaron este templo",
  "para pedir que la nieve volviera cada año.",
  "Qué raro pedir frío, pensaba yo. Qué raro pedir que algo termine.»"];
/* los guardianes, después de la tregua: conversaciones que crecen */
const GUEST_TALK={
  topo(){ const L=[];
    if(!thawed) L.push(["—La Brasa ya es tuya, chiquillo.","—Llévala al altar y que el valle respire."]);
    else if(!summered) L.push(["—¿Calorcito arriba? Aquí abajo se nota.","—Las raíces ya no tiemblan.","—Ve a ver a la Reina. Está más cansada que yo. Con razón."]);
    else if(boss3Done&&!cycled) L.push(["—¿Chiquillo? Aquí abajo aún te veo.","—Arriba ya no huele a nada. Ni a tierra.","—Si te llaman, contesta. Eso lo sé yo."]); // el Olvido suelto (15o): bajo tierra aún se acuerdan
    else if(!cycled) L.push(["—Ese de allá arriba, el Cier... el Viento... no es malo, chiquillo.","—Solo lleva mucho tiempo solo. Como yo antes de que bajaras."]);
    else L.push(["—¿Nieva? Me gusta. La nieve es la manta de la tierra.","—Zzz... Cierra al salir, chiquillo."]);
    return L[0]; },
  avispa(){
    if(!summered) return ["—Zzz... Lleva la Lágrima al altar, pequeño.","—Mis flores esperan."];
    if(boss3Done&&!cycled) return ["—Zzz... Pequeño. Mis obreras se olvidan del camino a casa.","—Algo gris come en la puerta del Tronco.","—Si hace falta, zumbaré tu nombre. Zzz."];
    if(!cycled) return ["—Las flores ya cierran de noche. Gracias, pequeño.","—El Viento me escribió una vez. Nunca abrí la carta. Como Raíz.","—Si encuentras sus cartas... léelas por mí."];
    return ["—Zzz... Verano, otoño, invierno. Así debe ser.","—Mis obreras duermen. Yo también. Zzz..."]; },
  viento(){
    if(!cycled) return ["—¿Qué haces aquí arriba, semillita?","—La polilla ha bajado al Roble. Yo no puedo bajar: nadie me llama.","—Corre."];
    return ["—...gracias por decir mi nombre, semillita.","—Bajaré cada invierno. Y me iré cada primavera. Es lo justo."]; },
  ciervo(){
    if(!autumned) return ["—Lleva la HOJA DE ÁMBAR al Roble, caminante.","—Que caiga despacio en su altar.","—Yo me quedo aquí, entre las hojas. Por fin puedo tumbarme."];
    if(boss3Done&&!cycled) return ["—Caminante. Se han caído todas las hojas a la vez.","—Ninguna recuerda de qué árbol era.","—Yo sí me acuerdo de ti. No lo olvides."];
    if(!cycled) return ["—El otoño ya está en casa. Ahora le toca al Viento del Norte.","—Si subes al pico, dile que el Ciervo...","—...sigue dejando caer las hojas.","—Él entenderá."];
    return ["—Las hojas caen y nadie se enfada. Qué cosa más rara.","—Gracias, caminante. El molino vuelve a moler."]; },
};
/* EL CAPÍTULO 5: el Olvido suelto (15o). Raíz no tiene voz: sus cajas salen roídas (nunca seis ▒ seguidos, que se leerían CIERZO).
   Los vecinos olvidan, pero se les escapa cómo llaman a Sprout: eso es lo último que se va */
const C5T={
  raizMute:["……▒…","▒▒… ▒…▒▒▒……"],
  arrive:["(Raíz abre la boca, pero no le sale nada. Solo polvo gris.)","(En la copa, la polilla pliega las alas. Duerme... o hace como que duerme.)","CAPÍTULO 5: EL OLVIDO"],
  raizPoint:{ otono:["(Raíz señala el ALTAR DEL OTOÑO, vacío. Luego te señala a ti.)"], copo:["(Raíz señala el ALTAR DEL INVIERNO. Luego, tu zurrón.)"],
    sleep:["(Raíz junta las manos bajo la mejilla, como quien duerme.)"], fin:["(Raíz mira a la polilla. Luego a ti. Asiente, despacio.)"] },
  raizSleep:["…d▒▒rm▒…"],
  copoMissing:["ALTAR DEL INVIERNO.","(El Copo tiembla en tu zurrón. Pero junto al Roble aún hay cuencos vacíos.)"],
  copoDone:["ALTAR DEL INVIERNO.","(El COPO late bajo la seda gris, con las otras tres.)"],
  copo:["(Las cuatro reliquias laten juntas bajo la seda.)","(El hueco del tronco se abre, como una boca que quiere hablar...)","(...y no le sale nada.)","(Raíz te mira y mueve los labios, muy despacio.)"],
  petra:["¡Hola! ¿Nos conocemos?","Tienes cara de... de algo verde.","Qué raro. Tengo un nombre en la punta de la lengua...","...y no me sale."],
  petraHint:["¡Hola, cosa verde!","Tengo una frase metida en la cabeza y no sé de dónde sale:","«Un brote no despierta hasta que el valle lo llama.»","Es de un libro. Lo escribí yo... ¿para quién?","Oye... ¿tú no dormías en una maceta?"],
  petraAfter:["¿Por qué tendré tantas ganas de gritar un nombre?","Si supiera cuál..."],
  lupa:["¿Por qué estaré regando esta piedra?","...Ah, no. Es una flor. Gris. ¿Las flores eran grises?","Perdona, ¿cómo te llamabas, tallito?","...¿Tallito? ¿Por qué te he llamado tallito?"],
  moss:["...¿Y esta caña de quién es?","Tira de mí hacia el agua. Buena caña.","Tú... ¿nos conocemos, grumete?"],
  corteza:["Me llamo Corteza. Lo tengo tallado aquí, en el mostrador.","Lo que se talla no se olvida, criatura. Por eso tallo.","Hoy tengo mucho trabajo."],
  tilo:["¡Un cliente! Creo.","¿Esto cuánto costaba? ¿Y esto qué es, una baya?","¿Las bayas se venden o se comen?","Mira el género... si sabes qué es, cliente."],
  pot:["¿Dormir en la maceta?"], potNo:["(Todavía no.)"],
  dream:["Sprout.","Despierto ya no puedo hablarte: la polilla me tiene la voz en la boca.","Mis anillos son los años del valle. Ella se los come de fuera hacia dentro.",
    "Si llega al primero, al día en que nos plantaron...","...mi hermano y yo nunca habremos sido hermanos.","Toma. Es el ANILLO DEL AÑO: hazlos girar.",
    "Entra por mi tronco y ve hacia dentro, anillo a anillo, hasta el primer día.","Y cuando venga a por tu nombre, no tengas miedo.","Un nombre no es de quien lo lleva. Es de quien lo llama.",
    "Y a ti te llama todo el valle, aunque ahora no lo sepa.","Despierta. Te espero dentro."],
  wake:["(Te despiertas en tu maceta. Hueles a polvo gris... y a hojas nuevas.)"],
  lost:'(¿Cómo se andaba...?)',
  voices:[ // el final: el valle llama a Sprout y cada voz devuelve algo (15o)
    {who:'PETRA',txt:'¡SPROUT!'},{who:'LUPA',txt:'¡Tallito, arriba!'},{who:'MOSS',txt:'¡A flote, grumete!'},{who:'TILO',txt:'¡Tu Hoja, cliente!'},
    {who:'CORTEZA',txt:'Respira, criatura.'},{who:'EL TOPO REAL',txt:'¡Aquí, chiquillo!'},{who:'LA REINA',txt:'Zzz... ¡Ahora, pequeño!'},
    {who:'EL CIERVO',txt:'Levántate, caminante.'},{who:'CIERZO',txt:'¡SEMILLITA!'},{who:'RAÍZ',txt:'Brote.'}],
  hold:'MANTÉN',
  call:["Ya tengo voz, brote. Y ahora, todos a la vez:"],
  brother:["Cierzo."], brotherBack:["...Raíz."],
};
/* el pozo de los deseos */
const WELL_TALK=["Un pozo viejo. El agua brilla al fondo, muy abajo."];
const WELL_ASK=["Dicen que si echas 20 BAYAS y pides un deseo, el pozo responde.","¿Echar 20 bayas?"];
const WELL_DONE=["(Chof.)","(Silencio.)","(...y algo sube flotando desde el fondo.)"];
/* nombres de objeto para la tarjeta de «¡nuevo!» */
const ITEM_NAMES={blade:'HOJA ANCESTRAL',bomb:'BELLOTA-BOMBA',hook:'RAÍZ-GANCHO',boomer:'VAINA VOLADORA',lantern:'FAROL DE BRASA',feather:'VILANO DE PETRA',shield:'ESCUDO DE CORTEZA',ember:'BRASA DE PRIMAVERA',tear:'LÁGRIMA DE VERANO',flake:'COPO ETERNO'};
AMULETS.susurro={name:'SUSURRO DEL VIENTO',desc:'El Remolino se\ncarga al instante\ny el tornadito\nvuela más lejos.'};
AMULETS.trebol={name:'TRÉBOL DE CUATRO',desc:'Trae suerte: más corazones y bayas de bichos y hierba.'}; // final de los trueques (12c)
const CHAPTER_NAMES=['Prólogo · El brote','Cap. 1 · La Brasa','Cap. 2 · La Lágrima','Cap. 3 · El Ámbar','Cap. 4 · El Copo','Cap. 5 · El Olvido','Epílogo · El ciclo'];
const CHAPTER_SHORT=['Prólogo','La Brasa','La Lágrima','El Ámbar','El Copo','El Olvido','Epílogo'];
