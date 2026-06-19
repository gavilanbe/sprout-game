'use strict';
/* ---------- TEXTOS ---------- */
const TXT = {
  sign:[ "VALLE RAÍZ.\nFuera del pueblo\nhay monstruos." ],
  signs:{
    '0,1':[ "BARRIO DEL ROBLE.\nEste: la PLAZA\nSAGRADA.",
            "Casa izquierda:\nla tuya. Derecha:\nTIENDA DE TILO.",
            "Tilo paga en\nBAYAS. Corta\narbustos: esconden\ncosas." ],
    '0,2':[ "Aquí reposa la\nHOJA ANCESTRAL.",
            "Sólo un brote de\ncorazón puro\npodrá alzarla." ],
  },
  door:[ "Está cerrado.\nNo hay nadie\nen casa." ],
  elderIntro:[ "¡Sprout, brote\nmío! Mira el GRAN\nROBLE sobre mí...",
               "Gris y callado.\nEl Viento robó sus\n8 semillas doradas",
               "y las arrojó por\nlos rincones del\nvalle, burlón,",
               "para que nadie\nvolviera a\njuntarlas.",
               "Sin ellas, todo\nel valle se apaga\ncon él.",
               "Aún estás verde...\nNecesitas la\nHOJA ANCESTRAL.",
               "Reposa en la playa\ndel SUROESTE.\n¡Ve con cuidado!" ],
  elderBlade:[ "¡La Hoja te\nsienta bien,\nbrote!",
               "5 semillas están\na la vista por\ntodo el valle.",
               "Otras 3 duermen\nbajo arbustos\nque BRILLAN." ],
  elderWin:[ "¡Las 8 semillas!\nMira la copa:\nvuelven a casa...",
             "¡El Roble respira!\nY el valle entero\nflorece con él.",
             "Pero... ¿oyes ese\naullido? Del norte\nbaja un invierno",
             "que no es natural.\nEsto no ha hecho\nmás que empezar:",
             "CAPÍTULO 1\nLA BRASA DE\nPRIMAVERA" ],
  allSeeds:[ "¡Tienes las 8\nsemillas! Vuelve\ncon el anciano." ],
  bladeGet:[ "¡Has alzado la\nHOJA ANCESTRAL!",
             "Verde como la\nprimavera, afilada\ncomo el invierno.",
             "Pulsa Z para\nblandirla. Los\narbustos tiemblan." ],
  bombGet:[ "¡La BELLOTA-BOMBA!",
            "Pulsa X para\nplantarla. Rompe\nrocas agrietadas." ],
  emberGet:[ "¡La BRASA DE\nPRIMAVERA!",
             "Late caliente como\nun corazón.",
             "Llévasela al\nanciano Raíz." ],
  thaw:[ "¡La Brasa!\nSiente cómo late\nel deshielo...",
         "Descansará en el\nALTAR DE PRIMAVERA,\njunto al Roble.",
         "Mira: las montañas\nreverdecen. La\nprimavera ha vuelto.",
         "Pero el sur huele\na otoño viejo...\nAún queda camino:",
         "CAPÍTULO 2\nLA LÁGRIMA DE\nVERANO" ],
  containerGet:[ "¡Un CORAZÓN DE\nSAVIA! Tu vigor\naumenta." ],
  hookGet:[ "¡La RAÍZ-GANCHO!",
            "Frente al agua,\npulsa Z: cruza a\nla otra orilla." ],
  tearGet:[ "¡La LÁGRIMA DE\nVERANO!",
            "Fresca y tibia a\nla vez. El anciano\nsabrá qué hacer." ],
  summer:[ "¡La Lágrima!\nEl sol dormido\ndespierta en ella.",
           "Brillará en el\nALTAR DEL VERANO,\nfrente a su hermana.",
           "El otoño eterno\nde las marismas\nse deshace...",
           "Dos estaciones\nhan vuelto a casa.\nQueda una más:",
           "el INVIERNO, en lo\nalto del pico.\nAllí sopla mi",
           "hermano, el VIENTO\nDEL NORTE. Sube a\nverle, brote.",
           "CAPÍTULO 3\nEL COPO\nETERNO" ],
  flakeGet:[ "¡El COPO ETERNO!",
             "No se derrite\njamás. Late frío\ny tristísimo.",
             "El Viento ya no\naúlla. Llévaselo\nal anciano." ],
  cycle:[ "¡El Copo de mi\nhermano! Por fin\ndejó de pelear.",
          "No le vencimos,\nbrote. Le\nrecordamos.",
          "Su altar le espera\nal sur, algo\napartado. Él era\nasí.",
          "Su nombre vivirá\njunto al Roble,\ny al fin",
          "las CUATRO\nESTACIONES girarán\nde nuevo.",
          "Mira el valle:\nprimavera, verano,\notoño e invierno,",
          "todas en su sitio.\nGracias, Sprout.\n\n  F I N  ·  cap.3" ],
};
/* hojas del diario del anciano Raíz */
const DIARY={
  '9,9':[ "DIARIO DE RAÍZ:\n«Mi hermano Viento\nme cantaba para",
          "dormir cuando el\nmundo era joven.\nLo he olvidado.»",
          "«Dejo esta hoja\njunto a la maceta\nque planté aquí.",
          "Quien brote en\nella... que crezca\nlibre, y que un\ndía me encuentre.»" ],
  '1,1':[ "DIARIO DE RAÍZ:\n«Mi hermano volvió\na cantarme la\nnana.",
          "Esta vez la he\nescrito entera.\nNunca más un\nolvido.»" ],
  '0,-1':[ "DIARIO DE RAÍZ:\n«Subí a las\nmontañas a verle.",
           "Solo encontré\nventisca. ¿Desde\ncuándo no le doy",
           "las gracias por\nel invierno?»" ],
  '2,3':[ "DIARIO DE RAÍZ:\n«Las marismas\nguardan el otoño.",
          "Mi hermano lo\ndejó aquí, como\nquien deja una",
          "carta sin abrir.»" ],
  '7,0':[ "DIARIO DE RAÍZ:\n«El Topo cava\ndesde hace años.",
          "Creo que busca\nalgo caliente en\nlo hondo. Como",
          "todos nosotros.»" ],
  '10,1':[ "DIARIO DE RAÍZ:\n«La Reina guarda\nla Lágrima que",
           "mi hermano lloró\nal marcharse. No\nse la pidas:",
           "tendrás que\nganártela.»" ],
  '1,-2':[ "DIARIO DE RAÍZ:\n«Si llegas al pico,\nbrote, no luches.",
           "Mi hermano no es\nmalo. Solo lleva\nmil inviernos",
           "esperando que\nalguien suba a\ndarle las gracias.»" ],
};
/* piedras rúnicas: la historia de los dos hermanos */
const RUNAS={
  '1,0':[ "PIEDRA RÚNICA:\n«Dos hermanos\nplantó la Tierra:",
          "el Roble, señor\ndel verdor...",
          "...y el Viento,\nguardián del sueño\ninvernal.»" ],
  '3,2':[ "PIEDRA RÚNICA:\n«Al Roble todos\ncantaban.",
          "Del Viento nadie\nrecordaba el\nnombre.»" ],
  '1,-1':[ "PIEDRA RÚNICA:\n«Y el olvido lo\nvolvió amargo.",
           "Robó las semillas\npara que el valle\ndurmiera...",
           "...y nunca más\ndespertara sin\nél.»" ],
  '1,-3':[ "PIEDRA RÚNICA:\n«Quien suba al pico\nno traiga espada.",
           "Traiga memoria.\nEl Viento no\nquiere morir:",
           "quiere que alguien\nrecuerde su\nnombre.»" ],
  '2,1':[ "PIEDRA RÚNICA:\n«Ocho hijas de\noro dio el Roble,",
          "a la vista de\ntodo el valle...",
          "...y una novena\nguardó en secreto,\nque el Viento\njamás halló.»" ],
};
/* vecinos: diálogo según el momento de la historia */
const NPC_TALK={
  h(){ // Petra, la niña brote: el barómetro del valle (y el foreshadow de la 9ª)
    if(!hasBlade) return ["¡Hola! Soy Petra.\nEl abuelo Raíz\nestá llorón hoy.","Dice que el valle\nse muere. A mí me\nparece bonito."];
    if(!won) return ["¿Una hoja gigante?\n¡QUÉ ENVIDIA!","Yo solo tengo este\ndiente de león.\nNo corta nada."];
    if(!thawed) return ["¿Has visto el\nespino seco del\nnorte? Da repelús.","Mamá llama\nRODAPÚAS a los\nerizos de allí.","Si se hacen bola,\n¡ni los toques\nde frente!"];
    if(!summered) return ["¡Ha vuelto la\nprimavera!\n¡Eres mi héroe!","Oye... el abuelo\nRaíz te mira raro.","Como se mira a un\nnieto. Cosas mías,\nseguro."];
    if(!cycled) return ["El abuelo dice\nque aún falta el\nINVIERNO.","¿Y quién quiere\nfrío?... ¿O sí?\nYa no sé."];
    return ["¡Está nevando y\nNO da miedo!","Es como azúcar.\n¡El invierno\ntambién es bonito!"];
  },
  j(){ // Lupa, la jardinera (su trueque se acepta con Z al hablarle: ver attack)
    let pg;
    if(!hasBlade) pg=["Soy Lupa. Cuido\nlas flores que\nquedan.","Sin las semillas\ndel Roble esto se\napaga, brote."];
    else if(!won) pg=["Truco de Lupa:\nlos arbustos que\nBRILLAN esconden","cosas. Córtalos\ncon tu hoja.","Y al ESCARABAJO\nACORAZADO písale\nla cola: el morro\nno hay quien lo\ncorte."];
    else if(!thawed) pg=["Mis flores tiritan.\nEse invierno del\nnorte no es normal.","Dicen que el TOPO\nREAL guarda una\nbrasa que arde."];
    else if(!summered) pg=["El sur huele a\nhojas viejas.\nMis dalias se\nagobian, brote."];
    else if(!cycled) pg=["¿Verano eterno?\nNo, brote: el\nsuelo también\nnecesita dormir.","Que vuelva el\ninvierno. Las\nraíces sueñan\nbajo la nieve."];
    else pg=["¡Las cuatro\nestaciones!\nJardín perfecto.","Hasta el aire\nhuele a verde."];
    if(hasBlade&&!lupaPot) pg=pg.concat(["Si me traes 10\nBAYAS te preparo\nalgo muy especial."]);
    return pg;
  },
  y(){ // Moss, el pescador (su sopa se acepta con Z al hablarle: ver attack)
    if(!hasBlade) return ["...Los peces ya\nno pican.\nMal asunto."];
    let pg;
    if(!won) pg=["Vi brillar algo en\nla lengua de arena.\nUn bicho lo vigila."];
    else if(!thawed) pg=["El agua baja\nhelada del norte.","Los peces tiemblan\nbajo el hielo."];
    else if(!summered) pg=["La marisma baja\nparda y amarga.","Otoño podrido,\ndice mi caña.\nY mi caña sabe."];
    else if(!cycled) pg=["¡Pican otra vez!\nTe debo una,\nbrote.","Los peces esperan\nel hielo para\ndormir. Cosas\nsuyas."];
    else pg=["Pesqué bajo la\nprimera nieve.","Hermoso, brote.\nTodo en su sitio."];
    return pg.concat(["Tráeme 5 BAYAS y\nte hago mi sopa.\nCura del todo."]);
  },
};
/* cinemática de apertura */
const CINE=[
  "El Valle Raíz fue\nsiempre verde y\ntranquilo...",
  "Una noche, el\nViento del Norte\naulló con furia...",
  "...y robó las 8\nsemillas doradas\ndel Gran Roble.",
  "Sin ellas, todo\nverdor se apaga\npoco a poco.",
  "Pero esta mañana,\nen un pueblecito\ndel valle...",
  "...un pequeño\nbrote abrió los\nojos.",
];
/* los jefes no se rematan: agotados, ceden su tesoro (Z a su lado) */
const TOPO_PEACE=[
  "—¿No me rematas,\nbrote?",
  "—Solo cavaba\nbuscando algo\ncaliente en lo\nhondo.",
  "—Como todos.\nLlévate la Brasa:\ntú la necesitas\nmás que yo.",
  "(El Topo Real se\nhunde en la\ntierra, despacio,\nsin rencor.)",
];
const QUEEN_PEACE=[
  "—Zzz... Te la has\nganado, brote.",
  "—Guardaba la\nLágrima de un\nviento que ya no\nvuelve.",
  "—Cuida tú de su\npena. Mi enjambre\ny yo dormiremos\nal fin.",
  "(La Reina alza el\nvuelo hacia el\ncorazón del\npanal.)",
];
/* la cima, después del ciclo: la nana recuperada */
const WIND_WHISPER=[
  "(La brisa peina\nla nieve, mansa.)",
  "(Ya no aúlla:\ncanturrea. Es la\nnana de Raíz.)",
  "(Mil inviernos de\nsilencio, y al\nfin... música.)",
];
/* el final del Viento: no se vence, se recuerda (Z junto a él, exhausto) */
const WIND_PEACE=[
  "—¿No alzas tu\nhoja, brote?",
  "—Traigo tu nombre.\nVIENTO DEL NORTE,\nhermano del Roble.",
  "—El que mece las\ncopas. El que\narropa la semilla",
  "bajo la nieve para\nque pueda soñar\ncon rebrotar.",
  "—Gracias por tus\nmil inviernos.",
  "—...",
  "(El aullido se\ndeshace en un\nsuspiro largo.)",
  "(Algo frío y\nbrillante cae a\ntus raíces.)",
];

