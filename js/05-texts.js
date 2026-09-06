'use strict';
/* ---------- EL GUION ---------- */
const TXT = {
  sign:[ "VALLE RAÍZ.\nFuera del pueblo\nhay monstruos." ],
  signs:{
    '0,1':[ "BARRIO DEL ROBLE.\nEste: la PLAZA\nSAGRADA.",
            "Casa izquierda:\nla tuya. Derecha:\nTIENDA DE TILO.",
            "Tilo paga en\nBAYAS. Corta\nhierba y arbustos:\nesconden cosas." ],
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
               "Otras 3 duermen\nbajo arbustos\nque BRILLAN.",
               "Pulsa ENTER para\nabrir el zurrón:\nallí verás el mapa\ny tus misiones." ],
  elderWin:[ "¡Las 8 semillas!\nMira la copa:\nvuelven a casa...",
             "¡El Roble respira!\nY el valle entero\nflorece con él.",
             "Pero... ¿oyes ese\naullido? Del norte\nbaja un invierno",
             "que no es natural.\nLa zarza del norte\nse ha secado:",
             "el camino a las\nmontañas está\nabierto. Dicen que\nel TOPO REAL",
             "guarda una BRASA\nque nunca se\napaga. Búscala.",
             "CAPÍTULO 1\nLA BRASA DE\nPRIMAVERA" ],
  allSeeds:[ "¡Tienes las 8\nsemillas! Vuelve\ncon el anciano." ],
  bladeGet:[ "¡Has alzado la\nHOJA ANCESTRAL!",
             "Verde como la\nprimavera, afilada\ncomo el invierno.",
             "Pulsa Z para\nblandirla. Corta\nhierba, arbustos\ny bichos." ],
  bombGet:[ "¡La BELLOTA-BOMBA!",
            "Equípala en el\nzurrón (ENTER) y\npulsa X para\nplantarla.",
            "Rompe rocas\nagrietadas y\nparedes con\ngrietas." ],
  emberGet:[ "¡La BRASA DE\nPRIMAVERA!",
             "Late caliente como\nun corazón.",
             "Llévasela al\nanciano Raíz." ],
  containerGet:[ "¡Un CORAZÓN DE\nSAVIA! Tu vigor\naumenta." ],
  pieceGet:(n)=>[ "¡Un CUARTO DE\nCORAZÓN! ("+n+"/4)", n>=4?"¡Cuatro cuartos!\nTu vigor aumenta.":"Reúne cuatro y\ntu vigor crecerá." ],
  hookGet:[ "¡La RAÍZ-GANCHO!",
            "Equípala (ENTER)\ny frente al agua\npulsa X: cruza a\nla otra orilla.",
            "También se agarra\na los POSTES DE\nRAÍZ." ],
  boomerGet:[ "¡La VAINA\nVOLADORA!",
              "Equípala y pulsa X:\nvuela, aturde\nbichos y vuelve.",
              "Recoge cosas\nlejanas y golpea\ncristales." ],
  lanternGet:[ "¡El FAROL DE\nBRASA!",
               "Alumbra las\ncuevas oscuras.",
               "Con X frente a\nuna antorcha\napagada, la\nenciende." ],
  featherGet:[ "¡El VILANO DE\nPETRA!",
               "Ligero como un\ndeseo. Equípalo y\npulsa X para\nSALTAR.",
               "Cruza agujeros y\nvacíos de un\nbrinco." ],
  shieldGet:[ "¡El ESCUDO DE\nCORTEZA!",
              "Se lleva solo: las\nrocas y esporas\nque te lleguen de\nfrente rebotan." ],
  keyGet:[ "¡Una LLAVE-BELLOTA!\nAbre un cerrojo\nde esta mazmorra." ],
  bigkeyGet:[ "¡La LLAVE GRANDE!\nAbre la puerta\ndel guardián." ],
  tearGet:[ "¡La LÁGRIMA DE\nVERANO!",
            "Fresca y tibia a\nla vez. El anciano\nsabrá qué hacer." ],
  flakeGet:[ "¡El COPO ETERNO!",
             "No se derrite\njamás. Late frío\ny tristísimo.",
             "El Viento ya no\naúlla. Llévaselo\nal anciano." ],
  thaw:[ "¡La Brasa!\nSiente cómo late\nel deshielo...",
         "Descansará en el\nALTAR DE PRIMAVERA,\njunto al Roble.",
         "Mira: las montañas\nreverdecen. La\nprimavera ha vuelto.",
         "Pero el sur huele\na otoño viejo. Tus\nbombas abrirán las\ngrietas de la",
         "playa del este.\nAllí, en las\nmarismas, se alza\nel TRONCO HUECO.",
         "CAPÍTULO 2\nLA LÁGRIMA DE\nVERANO" ],
  summer:[ "¡La Lágrima!\nEl sol dormido\ndespierta en ella.",
           "Brillará en el\nALTAR DEL VERANO,\nfrente a su hermana.",
           "El otoño eterno\nde las marismas\nse deshace...",
           "Dos estaciones\nhan vuelto a casa.\nQueda una más:",
           "el INVIERNO, en lo\nalto del pico.\nAllí sopla mi",
           "hermano, el VIENTO\nDEL NORTE. Sube a\nverle, brote.",
           "Un TEMPLO guarda\nel paso a la cima.\nNecesitarás bomba,\ngancho y luz.",
           "CAPÍTULO 3\nEL COPO\nETERNO" ],
  cycle:[ "¡El Copo de mi\nhermano! Por fin\ndejó de pelear.",
          "No le vencimos,\nbrote. Le\nrecordamos.",
          "Su altar le espera\nal sur, algo\napartado. Él era\nasí.",
          "Su nombre vivirá\njunto al Roble,\ny al fin",
          "las CUATRO\nESTACIONES girarán\nde nuevo.",
          "Mira el valle:\nprimavera, verano,\notoño e invierno,",
          "todas en su sitio.\nGracias, Sprout.\n\n  F I N  ·  cap.3" ],
  amuletGet:(a)=>[ "¡"+a.name+"!", a.desc, "Equípalo en el\nzurrón (ENTER):\ndos ranuras." ],
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
/* hojas del diario del anciano Raíz */
const DIARY={
  '9,9':[ "DIARIO DE RAÍZ:\n«Mi hermano Viento\nme cantaba para",
          "dormir cuando el\nmundo era joven.\nLo he olvidado.»",
          "«Dejo esta hoja\njunto a la maceta\nque planté aquí.",
          "Quien brote en\nella... que crezca\nlibre, y que un\ndía me encuentre.»" ],
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
  dplaza:[ "DIARIO DE RAÍZ:\n«Hoy ha nevado\nsobre la plaza.",
           "Nadie ha tenido\nmiedo. Mi hermano\ncanta bajito",
           "y yo, por fin,\nle escucho.»" ],
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
  '2,1':[ "PIEDRA RÚNICA:\n«Ocho hijas de\noro dio el Roble,",
          "a la vista de\ntodo el valle...",
          "...y una novena\nguardó en secreto,\nque el Viento\njamás halló.»" ],
};
/* vecinos: diálogo según el momento de la historia */
const NPC_TALK={
  h(){ // Petra, la niña brote
    if(!hasBlade) return ["¡Hola! Soy Petra.\nEl abuelo Raíz\nestá llorón hoy.","Dice que el valle\nse muere. A mí me\nparece bonito."];
    if(!won) return ["¿Una hoja gigante?\n¡QUÉ ENVIDIA!","Yo solo tengo este\ndiente de león.\nNo corta nada.","Si alguna vez\nencuentras un\nVILANO grande...\n¡es mío, eh!"];
    if(!thawed) return ["¿Has visto el\nespino seco del\nnorte? Da repelús.","Mamá llama\nRODAPÚAS a los\nerizos de allí.","Si se hacen bola,\n¡ni los toques\nde frente!"];
    if(!summered) return ["¡Ha vuelto la\nprimavera!\n¡Eres mi héroe!","Oye... el abuelo\nRaíz te mira raro.","Como se mira a un\nnieto. Cosas mías,\nseguro."];
    if(!cycled) return ["El abuelo dice\nque aún falta el\nINVIERNO.","¿Y quién quiere\nfrío?... ¿O sí?\nYa no sé.",hasFeather?"¡Ese vilano es\nMÍO! ...Bueno,\nquédatelo. Vuela\nmejor contigo.":"En el pico hay un\nTEMPLO viejo. Dicen\nque guarda un\nVILANO enorme."];
    return ["¡Está nevando y\nNO da miedo!","Es como azúcar.\n¡El invierno\ntambién es bonito!"];
  },
  j(){ // Lupa, la jardinera: su trueque (10 bayas → Vaina voladora) se acepta con Z
    let pg;
    if(!hasBlade) pg=["Soy Lupa. Cuido\nlas flores que\nquedan.","Sin las semillas\ndel Roble esto se\napaga, brote."];
    else if(!won) pg=["Truco de Lupa:\nlos arbustos que\nBRILLAN esconden","cosas. Córtalos\ncon tu hoja.","Y al ESCARABAJO\nACORAZADO písale\nla cola: el morro\nno hay quien lo\ncorte."];
    else if(!thawed) pg=["Mis flores tiritan.\nEse invierno del\nnorte no es normal.","Dicen que el TOPO\nREAL guarda una\nbrasa que arde."];
    else if(!summered) pg=["El sur huele a\nhojas viejas.\nMis dalias se\nagobian, brote."];
    else if(!cycled) pg=["¿Verano eterno?\nNo, brote: el\nsuelo también\nnecesita dormir.","Que vuelva el\ninvierno. Las\nraíces sueñan\nbajo la nieve."];
    else pg=["¡Las cuatro\nestaciones!\nJardín perfecto.","Hasta el aire\nhuele a verde."];
    if(hasBlade&&!hasBoomer) pg=pg.concat(["Si me traes 10\nBAYAS te preparo\nalgo que VUELA."]);
    return pg;
  },
  y(){ // Moss, el pescador
    if(!hasBlade) return ["...Los peces ya\nno pican.\nMal asunto."];
    let pg;
    if(!won) pg=["Vi brillar algo en\nla lengua de arena.\nUn bicho lo vigila."];
    else if(!thawed) pg=["El agua baja\nhelada del norte.","Los peces tiemblan\nbajo el hielo."];
    else if(!summered) pg=["La marisma baja\nparda y amarga.","Otoño podrido,\ndice mi caña.\nY mi caña sabe."];
    else if(!cycled) pg=["¡Pican otra vez!\nTe debo una,\nbrote.","Los peces esperan\nel hielo para\ndormir. Cosas\nsuyas."];
    else pg=["Pesqué bajo la\nprimera nieve.","Hermoso, brote.\nTodo en su sitio."];
    return pg.concat(["Tráeme 5 BAYAS y\nte hago mi sopa.\nCura del todo."]);
  },
  'ö'(){ // Corteza, la ermitaña de los amuletos
    if(!hasBlade) return ["Hmm... un brote\nsin hoja. Vuelve\ncuando cortes\nalgo, criatura."];
    return ["Soy Corteza. Tallo\nAMULETOS con lo\nque el valle\nolvida.","Dos puedes llevar\na la vez. Elige\nbien, criatura.","Acércate al\nmostrador si\ntraes bayas."];
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
const TOPO_AFTER=[
  "—¿Vuelves, brote?\nAquí abajo se\nestá calentito.",
  "—Toma: mi corona\nvieja. Con ella\nlas bombas no te\nmorderán.",
];
const QUEEN_PEACE=[
  "—Zzz... Te la has\nganado, brote.",
  "—Guardaba la\nLágrima de un\nviento que ya no\nvuelve.",
  "—Cuida tú de su\npena. Mi enjambre\ny yo dormiremos\nal fin.",
  "(La Reina alza el\nvuelo hacia el\ncorazón del\npanal.)",
];
const QUEEN_AFTER=["—Zzz... Las flores\nvuelven a cerrar\nde noche. Gracias,\nbrote."];
const WIND_AFTER=["(La brisa peina\nla nieve, mansa.)","(Ya no aúlla:\ncanturrea. Es la\nnana de Raíz.)"];
/* minijefes: presentaciones */
const MID_CARD={king:'EL ESCARABAJO REY',drone:'EL ZÁNGANO CAPITÁN',iceguard:'EL GUARDIÁN DE HIELO'};
const MID_INTRO={
  king:["(Un caparazón\nenorme cruje en\nla penumbra...)","(Su morro es puro\nblindaje. Golpéale\npor detrás.)"],
  drone:["(Un zumbido de\nacero llena el\nnido...)","(Se lanza en\npicado. Cuando\nchoque, ¡ataca!)"],
  iceguard:["(El hielo del\ntemplo cobra\nforma...)","(Su cuerpo es\nroca helada. Solo\nel FUEGO lo\nablanda: bombas.)"],
};
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
/* los créditos: el valle respira */
const CREDITS=[
  'SPROUT','y las 8 semillas','',
  'una aventura de','NAHUELGABE','',
  'LOS GUARDIANES','El Topo Real','La Reina Avispa','El Viento del Norte','',
  'LOS VECINOS','Petra · Lupa · Moss','Tilo · Corteza','',
  'LA VOZ DEL ROBLE','Raíz','',
  'Ocho semillas.','Cuatro estaciones.','Ningún guardián','ha muerto.','',
  'Gracias por','hacer brotar','el valle.','',
  'Z: seguir jugando',
];
/* pistas de sala (la primera vez) */
const ROOM_HINTS={
  '7,0':["(Rocas-raíz... Si\nte plantas y\nempujas, quizá\ncedan.)"],
  '6,2':["(El suelo tiembla\nbajo tus raíces...)"],
  '10,2':["(Un zumbido grave\nllena el panal...)"],
  '1,-3':["(El viento aúlla\ntu nombre con\nrencor...)","(Mientras sopla no\npuedes tocarlo.","Cuando se canse y\ncaiga a tierra,\nbrillará: ¡ahí!)"],
  '1,-2':["(Aquí arriba el\ninvierno nunca se\nfue. Sopla fuerte.)"],
  '2,3':["(Las hojas caen\nsin parar. Huele\na otoño viejo...)"],
  '0,2':["(La arena susurra.\nAlgo brilla entre\nlas dunas...)"],
  '11,1':["(Un cristal zumba\nen el centro.\nBloques rojos y\nazules...)"],
  '15,0':["(Cuatro antorchas\napagadas. Algo\nespera su luz.)"],
  '15,1':["(Un vacío negro\nparte la sala.\nHaría falta\nvolar...)"],
  '5,9':["(Está muy oscuro.\nAlgo brilla al\nfondo.)"],
  '15,2':["(El TEMPLO DE LA\nCIMA. El hielo\ncruje bajo tus\nraíces.)"],
  '6,0':["(LA CUEVA DEL TOPO.\nHuele a tierra\nremovida.)"],
  '10,0':["(EL TRONCO HUECO.\nLa madera zumba\npor dentro.)"],
};
