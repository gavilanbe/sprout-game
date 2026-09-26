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
             "No se derrite jamás. Late frío, despacio, como quien por fin descansa.",
             "Su ALTAR espera junto al del otoño." ],
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
  cycle:[ "El Copo de mi hermano descansa junto al otoño.",
          "Cierzo. Cierzo...",
          "¿Lo oyes, brote? Ya puedo decirlo.",
          "Siempre llegaron juntos, el otoño y él.",
          "Por fin ha dejado de aullar. No le vencimos, brote:",
          "le recordamos. Es lo único que pedía.",
          "Y las cuatro ESTACIONES vuelven a girar.",
          "¿Sabes por qué te planté, brote?",
          "Un árbol no puede subir a una montaña.",
          "Mis raíces llegan a todo el valle... menos a él.",
          "Gracias por subir.",
          "F I N" ],
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
const MID_CARD={king:'EL ESCARABAJO REY',drone:'EL ZÁNGANO CAPITÁN',iceguard:'EL GUARDIÁN DE HIELO'};
const MID_INTRO={
  king:["(Un caparazón enorme cruje en la penumbra... Está vacío. Y aun así, se mueve.)","(Por delante es puro hierro.)"],
  drone:["(Un zumbido de acero llena el nido. Tiene forma de zángano, pero es rígido como la cera...)","(Embiste a lo loco. A ver qué pasa cuando se estrelle.)"],
  iceguard:["(Los bloques del templo se juntan y cobran forma: hielo vacío, con algo gris dentro.)","(La Hoja no le hace nada. Tendría que ablandarse... con un buen estallido.)"],
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
  'LOS VECINOS','Petra · Lupa · Moss','Tilo · Corteza','',
  'LA VOZ DEL ROBLE','Raíz','',
  'Ocho semillas.','Cuatro estaciones.','Ningún guardián','ha muerto.','',
  'Gracias por','hacer brotar','el valle.','',
  'Z: seguir jugando',
];
/* pistas de sala (la primera vez): insinúan, no resuelven */
const ROOM_HINTS={
  '7,0':["(Rocas-raíz... Si te plantas y empujas, quizá cedan.)"],
  '6,2':["(El suelo tiembla bajo tus raíces. Algo enorme cava ahí abajo.)","(Por la forma de los túneles, tiene la cabeza dura como una roca.)","(En las esquinas, unos BELLOTEROS. Qué oportunos.)"],
  '7,-1':["(Una grieta cruza la pared del este. Se cuela aire fresco...)"],
  '10,-1':["(Un foso de raíces sin fondo. Al otro lado brilla un cofre.)"],
  '16,2':["(Dos antorchas frías custodian un cofre tras una verja.)"],
  '16,-1':["(El puente se hundió hace muchos inviernos. Habría que saltar como un vilano.)"],
  '10,2':["(Un zumbido grave llena el panal. La Reina vuela alto, muy por encima de tu Hoja...)","(...algo tendría que TIRAR de ella hacia el suelo.)"],
  '1,-3':["(Un aullido sin palabras. No suena a rabia: suena a pena.)","(Cuatro BRASEROS fríos rodean la cima. Aquí arriba, el frío lo sostiene todo.)"],
  '1,-2':["(Aquí arriba el invierno nunca se fue. Sopla fuerte.)"],
  '2,3':["(Las hojas caen sin parar. Huele a otoño viejo...)"],
  '0,2':["(La arena susurra. Algo brilla entre las dunas...)"],
  '11,1':["(Un cristal zumba en el centro. Bloques rojos y azules...)"],
  '15,0':["(Cuatro antorchas apagadas. Algo espera su luz.)"],
  '15,1':["(Un vacío negro parte la sala. Haría falta volar...)"],
  '5,9':["(Está muy oscuro. Algo brilla al fondo.)"],
  '15,2':["(EL TEMPLO DE LA CIMA. El hielo cruje bajo tus raíces.)"],
  '6,0':["(LA CUEVA DEL TOPO. Huele a tierra removida.)"],
  '10,0':["(EL TRONCO HUECO. La madera zumba por dentro.)"],
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
    else if(!cycled) L.push(["—Ese de allá arriba, el Cier... el Viento... no es malo, chiquillo.","—Solo lleva mucho tiempo solo. Como yo antes de que bajaras."]);
    else L.push(["—¿Nieva? Me gusta. La nieve es la manta de la tierra.","—Zzz... Cierra al salir, chiquillo."]);
    return L[0]; },
  avispa(){
    if(!summered) return ["—Zzz... Lleva la Lágrima al altar, pequeño.","—Mis flores esperan."];
    if(!cycled) return ["—Las flores ya cierran de noche. Gracias, pequeño.","—El Viento me escribió una vez. Nunca abrí la carta. Como Raíz.","—Si encuentras sus cartas... léelas por mí."];
    return ["—Zzz... Verano, otoño, invierno. Así debe ser.","—Mis obreras duermen. Yo también. Zzz..."]; },
  viento(){
    if(!cycled) return ["(El Viento no dice nada. Canturrea bajito.)"];
    return ["—...gracias por decir mi nombre, semillita.","—Bajaré cada invierno. Y me iré cada primavera. Es lo justo."]; },
  ciervo(){
    if(!autumned) return ["—Lleva la HOJA DE ÁMBAR al Roble, caminante.","—Que caiga despacio en su altar.","—Yo me quedo aquí, entre las hojas. Por fin puedo tumbarme."];
    if(!cycled) return ["—El otoño ya está en casa. Ahora le toca al Viento del Norte.","—Si subes al pico, dile que el Ciervo...","—...sigue dejando caer las hojas.","—Él entenderá."];
    return ["—Las hojas caen y nadie se enfada. Qué cosa más rara.","—Gracias, caminante. El molino vuelve a moler."]; },
};
/* el pozo de los deseos */
const WELL_TALK=["Un pozo viejo. El agua brilla al fondo, muy abajo."];
const WELL_ASK=["Dicen que si echas 20 BAYAS y pides un deseo, el pozo responde.","¿Echar 20 bayas?"];
const WELL_DONE=["(Chof.)","(Silencio.)","(...y algo sube flotando desde el fondo.)"];
/* nombres de objeto para la tarjeta de «¡nuevo!» */
const ITEM_NAMES={blade:'HOJA ANCESTRAL',bomb:'BELLOTA-BOMBA',hook:'RAÍZ-GANCHO',boomer:'VAINA VOLADORA',lantern:'FAROL DE BRASA',feather:'VILANO DE PETRA',shield:'ESCUDO DE CORTEZA',ember:'BRASA DE PRIMAVERA',tear:'LÁGRIMA DE VERANO',flake:'COPO ETERNO'};
AMULETS.susurro={name:'SUSURRO DEL VIENTO',desc:'El Remolino se\ncarga al instante\ny el tornadito\nvuela más lejos.'};
AMULETS.trebol={name:'TRÉBOL DE CUATRO',desc:'Trae suerte: más corazones y bayas de bichos y hierba.'}; // final de los trueques (12c)
const CHAPTER_NAMES=['Prólogo · El brote','Cap. 1 · La Brasa','Cap. 2 · La Lágrima','Cap. 3 · El Ámbar','Cap. 4 · El Copo','Epílogo · El ciclo'];
const CHAPTER_SHORT=['Prólogo','La Brasa','La Lágrima','El Ámbar','El Copo','Epílogo'];
