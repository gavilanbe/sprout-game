'use strict';
/* ---------- EL GUION ---------- */
const TXT = {
  sign:[ "VALLE RAÍZ.\nFuera del pueblo\nhay monstruos." ],
  signs:{
    '0,1':[ "BARRIO DEL ROBLE.\nEste: la PLAZA\nSAGRADA.",
            "Casa izquierda:\nla tuya. Derecha:\nTIENDA DE TILO.",
            "Tilo paga en\nBAYAS. Corta\nhierba y arbustos:\nesconden cosas.",
            "ENTER abre el\nZURRÓN: mapa,\ntareas y todo lo\nque lleves." ],
    '0,2':[ "Aquí reposa la\nHOJA ANCESTRAL.",
            "Sólo un brote de\ncorazón puro\npodrá alzarla." ],
  },
  door:[ "Está cerrado.\nNo hay nadie\nen casa." ],
  elderIntro:[ "¡Sprout! Has despertado... Como dice el libro: un brote no abre los ojos hasta que el valle lo llama.",
               "Y el valle llama, brote. Mira el GRAN ROBLE sobre mí: gris y callado.",
               "Mi hermano, el VIENTO DEL NORTE, le arrancó sus 8 SEMILLAS DORADAS y las sembró por los rincones del valle.",
               "Sin ellas el Roble no respira. Y si el Roble no respira, las ESTACIONES se atascan: nada florece, nada descansa.",
               "Tú naciste de su savia. Solo tú puedes oír dónde laten sus semillas.",
               "Pero aún estás verde. Necesitas la HOJA ANCESTRAL: reposa en la playa del SUROESTE. ¡Ve con cuidado!" ],
  elderBlade:[ "¡La Hoja te\nsienta bien,\nbrote!",
               "5 semillas están\na la vista por\ntodo el valle.",
               "Otras 3 duermen\nbajo arbustos\nque BRILLAN.",
               "Pulsa ENTER para\nabrir el zurrón:\nallí verás el mapa\ny tus misiones." ],
  elderWin:[ "¿Lo oyes, brote? El Roble RESPIRA. Tus hermanas vuelven a latir en su copa.",
             "Y mira el valle: el gris se va. Todo reverdece con él.",
             "Pero respirar no basta, brote. El año sigue atascado: mi hermano dejó cada ESTACIÓN presa en un rincón.",
             "La primavera se hundió bajo tierra: dicen que el TOPO REAL guarda una BRASA que no se apaga.",
             "Oye... ¿ese aullido? Del norte baja un invierno que no es natural. Pero la zarza se ha secado: el camino está abierto.",
             "Cuando la tengas, déjala en su ALTAR, junto al Roble. Él ya tiene fuerza para sostenerla.",
             "CAPÍTULO 1: LA BRASA DE PRIMAVERA" ],
  allSeeds:[ "¡Tienes las 8\nsemillas! Vuelve\ncon el anciano." ],
  bladeGet:[ "¡Has alzado la\nHOJA ANCESTRAL!",
             "Verde como la\nprimavera, afilada\ncomo el invierno.",
             "Pulsa Z para\nblandirla. Corta\nhierba, arbustos\ny bichos." ],
  bombGet:[ "¡La BELLOTA-BOMBA!",
            "Equípala en el\nzurrón (ENTER) y\npulsa X para\nplantarla.",
            "Rompe rocas\nagrietadas y\nparedes con\ngrietas." ],
  emberGet:[ "¡La BRASA DE\nPRIMAVERA!",
             "Late caliente como\nun corazón.",
             "Llévala a su ALTAR,\njunto al Gran\nRoble." ],
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
            "Fresca y tibia a\nla vez. Su ALTAR\nla espera junto\nal Roble." ],
  flakeGet:[ "¡El COPO ETERNO!",
             "No se derrite\njamás. Late frío\ny tristísimo.",
             "El Viento ya no\naúlla. Su ALTAR\nespera junto al\ndel otoño." ],
  thaw:[ "La Brasa ya late en su altar. ¿Ves la copa? El Roble florece.",
         "Y su calor ha subido por el bosque hasta el campo helado del norte: las laderas reverdecen.",
         "Una estación en casa. La siguiente es el VERANO: mi hermano le dio su LÁGRIMA a la REINA AVISPA, que quería un sol sin fin.",
         "Por eso el sur se pudre en un otoño viejo: el verano no llega y el otoño no se puede ir.",
         "Tus bombas abrirán las grietas de la playa del este. En las marismas se alza el TRONCO HUECO.",
         "CAPÍTULO 2: LA LÁGRIMA DE VERANO" ],
  summer:[ "La Lágrima brilla en su altar, frente a la Brasa. ¿Sientes el sol? Es verano en todo el valle.",
           "Y a las marismas por fin les llega: el otoño viejo ya no tiene dónde pudrirse.",
           "Pero el otoño viejo no se ha ido a dormir. Se ha escondido en el MOLINO de la Ciénaga, al este de las marismas.",
           "Lo guarda el CIERVO DE ÁMBAR, un viejo amigo de mi hermano. Deja caer las hojas desde hace mil años, aunque nadie se lo agradezca.",
           "Las hojas podridas que tapaban la puerta del molino ya se habrán secado al sol. Ve, brote. Y no le guardes rencor.",
           "CAPÍTULO 3: LA HOJA DE ÁMBAR" ],
  autumn:[ "La Hoja de Ámbar se ha posado en su altar. Huele a castañas y a lluvia.",
           "Mira el valle: las hojas se doran sin pudrirse. Así debe ser.",
           "Queda una sola estación: el INVIERNO. Esa no la robó nadie... mi hermano se la llevó consigo al PICO.",
           "Un VENTISQUERO tapa el Sendero del Último Invierno. El viento de tu MOLINILLO lo barrerá.",
           "Allí arriba sopla, solo, desde hace mil inviernos. Sube a verle, brote. No a vencerle.",
           "Un TEMPLO guarda el paso a la cima. Necesitarás bomba, gancho y luz.",
           "CAPÍTULO 4: EL COPO ETERNO" ],
  molinilloGet:[ "¡El MOLINILLO!",
                 "Un molinete de papel de colores. Equípalo (ENTER) y pulsa X: ¡sopla una ráfaga!",
                 "Barre la HOJARASCA, hace girar los MOLINETES y aparta a los bichos. Hasta la nieve se rinde ante él." ],
  amberGet:[ "¡La HOJA DE ÁMBAR!",
             "Dorada y tibia. Aunque la sueltes, cae despacio.",
             "El otoño entero cabe en ella. Llévala a su ALTAR, junto al Roble." ],
  cycle:[ "El Copo de mi hermano descansa en su altar, junto al del otoño. Siempre llegaron juntos, el otoño y él.",
          "Por fin dejó de aullar. No le vencimos, brote. Le recordamos. Es lo único que pedía.",
          "Y ahora... las CUATRO ESTACIONES vuelven a girar. Primavera, verano, otoño e invierno.",
          "Sprout... ¿nunca te extrañó que todos hablen de OCHO semillas?",
          "El Roble tuvo NUEVE. La novena la escondió en su savia, lejos de su hermano. Yo la planté en una maceta del pueblo.",
          "Tres primaveras esperó a que el valle la llamara. Eras tú, brote.",
          "La semilla que nadie robó. Gracias por despertar.",
          "F I N" ],
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
  '0,12':[ "PIEDRA RÚNICA:\n«Aquí resuenan los que guardaron el año.","No son ellos: son su eco. No hablan ni ceden...","...pero se desvanecen cuando alguien les recuerda que ya no hace falta pelear.»" ],
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
    else if(!autumned) pg=["Las hojas que caen no son basura, brote: son la manta del jardín.","Sin otoño la tierra no descansa. Tráelo de vuelta."];
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
    else if(!autumned) pg=["El verano ha vuelto al agua. ¡Hasta los renacuajos sonríen!","Pero en la Ciénaga las hojas ya no caen: se amontonan en el viejo molino. Raro, raro."];
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
  'una aventura de','GAVILANBE','',
  'LOS GUARDIANES','El Topo Real','La Reina Avispa','El Ciervo de Ámbar','El Viento del Norte','',
  'LOS VECINOS','Petra · Lupa · Moss','Tilo · Corteza','',
  'LA VOZ DEL ROBLE','Raíz','',
  'Ocho semillas.','Cuatro estaciones.','Ningún guardián','ha muerto.','',
  'Gracias por','hacer brotar','el valle.','',
  'Z: seguir jugando',
];
/* pistas de sala (la primera vez) */
const ROOM_HINTS={
  '7,0':["(Rocas-raíz... Si\nte plantas y\nempujas, quizá\ncedan.)"],
  '6,2':["(El suelo tiembla bajo tus raíces...)","(Dicen que el Topo lleva un CASCO DE ROCA: la Hoja rebota. Pero lo que ESTALLA en su túnel lo saca aturdido.)","(Los BELLOTEROS de las esquinas dan bellotas-bomba.)"],
  '7,-1':["(Una grieta cruza la pared del este. Se cuela aire fresco...)"],
  '10,-1':["(Un foso de raíces sin fondo. Al otro lado brilla un cofre.)"],
  '16,2':["(Dos antorchas frías custodian un cofre tras una verja.)"],
  '16,-1':["(El puente se hundió hace mil inviernos. Solo un vilano podría cruzarlo.)"],
  '10,2':["(Un zumbido grave llena el panal...)","(La Reina vuela demasiado alto para la Hoja. Si la ENGANCHARAS con la raíz...)"],
  '1,-3':["(El viento aúlla tu nombre con rencor...)","(Cuatro BRASEROS apagados rodean la cima: el frío lo sostiene en el aire. Enciéndelos con el FAROL.)","(Y si barre tu fila... ¡SALTA con el vilano!)"],
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

/* ============================================================
   SEGUNDA PASADA: más principio, más lore
   ============================================================ */
/* prólogo ilustrado (cada página lleva su viñeta: ver drawCinePanel) */
CINE.splice(0,CINE.length,
  "Hace mucho, la Tierra plantó dos hermanos: el GRAN ROBLE y el VIENTO DEL NORTE.",
  "El Roble traía la primavera y el verano. El Viento, el otoño y el invierno. Y así giraba el año.",
  "Pero el valle solo cantaba al Roble. Del Viento, nadie recordaba el nombre.",
  "Una noche, el Viento aulló de pena y arrancó al Roble sus OCHO SEMILLAS DORADAS.",
  "Las estaciones se atascaron. El valle se fue apagando, gris y callado.",
  "Pero el Roble había escondido una NOVENA semilla. La que el Viento nunca encontró.",
  "Y esta mañana, tres primaveras después... la novena semilla abrió los ojos."
);
/* Petra te despierta */
const PETRA_WAKE=[
  "¡Brote! ¡Al fin!\nLlevas TRES\nprimaveras dormido\nen esa maceta.",
  "Soy Petra. Vivo\naquí al lado. El\nabuelo Raíz me\nmanda a buscarte.",
  "Está en la PLAZA,\nal este del pueblo,\nbajo el árbol\ngrande.",
  "Dice que es\nurgente. Y cuando\nel abuelo dice\nurgente...",
  "...es que el valle\nse muere de\nverdad. ¡Corre!",
];
const PETRA_WAKE2=["(Petra sale\ncorriendo. La\npuerta queda\nabierta.)"];
/* señales nuevas */
TXT.signs['1,1']=["PLAZA DE LAS\nESTACIONES.","Aquí vive Raíz,\nla voz del Roble.\nCuatro altares\nvacíos lo rodean."];
TXT.signs['2,1']=["PRADERA DEL\nRECUERDO. Este:\nla orilla de Moss.","Norte: el claro\ndel bosque."];
TXT.signs['1,2']=["CAMINO DE LOS\nDIENTES DE LEÓN.","Oeste: la playa.\nEste: las dunas."];
TXT.signs['3,0']=["JUNCAL DEL NORTE.\nCuidado con los\nmurciélagos."];
/* libros de las estanterías */
const BOOKS={
  '9,9':{title:'Cómo cuidar un brote',pages:["«CÓMO CUIDAR UN\nBROTE», por Raíz.","«Riégalo con agua\ndel lago. Háblale\nde noche. Déjalo\ndormir todo lo",
    "que necesite: un\nbrote no despierta\nhasta que el valle\nlo llama.»","(Hay tres marcas\nde agua en la\nmaceta: tres\nprimaveras.)"]},
  '8,9':{title:'Recetario de Tilo',pages:["«RECETARIO DE\nTILO».","«Corazón de savia:\nsavia del Roble,\nmiel del panal y\nsol de mediodía.",
    "Farol de brasa:\nuna chispa que\nnunca se apague y\ncorteza curada.»","«Nota: Corteza\ntalla mejor que yo.\nNo se lo digáis.»"]},
  '7,9':{title:'Leyendas de los amuletos',pages:["«LEYENDAS DE LOS\nAMULETOS», por\nCorteza.","«El Ojo de Búho lo\ntalló una lechuza\nque veía en la\nniebla.",
    "El Cascabel lo\nperdió el propio\nViento al huir.","La Corona del Topo\nes una lámpara\nde mina, pero él\nno lo sabe.»",
    "«Y el Susurro...\nel Susurro lo\nhacen cinco cartas\nque nadie leyó.»"]},
};
/* las CARTAS DEL VIENTO: cinco sobres nunca abiertos, dispersos por el valle */
const LETTERS={
  '4,-1':["CARTA DEL VIENTO\n(1 de 5):","«Hermano: hoy he\ncubierto de nieve\ntus raíces para\nque duerman.",
          "No me has dado las\ngracias. No pasa\nnada. Mañana lo\nharás.»"],
  '0,3':["CARTA DEL VIENTO\n(2 de 5):","«Hermano: todo el\nvalle canta tu\nnombre. Del mío\nnadie se acuerda.",
         "He empujado las\nolas hasta esta\ncala para que\nalguien me oiga.»"],
  '4,3':["CARTA DEL VIENTO\n(3 de 5):","«Hermano: la Reina\nme pidió un otoño.\nTú le pediste más\nverano.",
         "Dejé caer las\nhojas de todos\nmodos. Alguien\ntenía que hacerlo.»"],
  '4,9':["CARTA DEL VIENTO\n(4 de 5):","«Hermano: he\nescondido esta\ncarta bajo un\narbusto, como las",
         "semillas que te\nvoy a quitar. Si\nla encuentras, es\nque aún me buscas.»"],
  '1,-2':["CARTA DEL VIENTO\n(5 de 5):","«Hermano: me subo\nal pico. Si alguna\nvez alguien dice\nmi nombre en voz",
          "alta, bajaré.\nHasta entonces,\nque nieve.»"],
};
const LETTERS_DONE=["¡Las cinco cartas!\nRaíz querrá\nleerlas."];
const RAIZ_LETTERS=[
  "¿Cartas de mi\nhermano...? Nunca\nlas abrí. Nunca\nlas vi.",
  "«...que alguien\ndiga mi nombre en\nvoz alta.» Ay,\nbrote.",
  "Toma. Lo tallé\nhace mil años con\nlo que quedó de su\nvoz. Es tuyo.",
];
/* más diario */
DIARY['3,-1']=["DIARIO DE RAÍZ:\n«Desde el mirador\nse ve el valle\nentero.","Mi hermano venía\naquí a mirar cómo\ncrecían mis\nsemillas.","Nunca le pregunté\nsi le parecían\nbonitas.»"];
DIARY['4,0']=["DIARIO DE RAÍZ:\n«La cascada baja\nfría del glaciar.","Es agua de mi\nhermano. Sin ella,\nmi lago sería un\ncharco.","Tampoco se lo\nhe dicho.»"];
DIARY['12,1']=["DIARIO DE RAÍZ:\n«Las abejas de la\nReina trabajaban\nsin descanso.","Yo pedía más\nflores. Ella\npedía un otoño.\nNo escuché.»"];
DIARY['14,0']=["DIARIO DE RAÍZ:\n«Los antiguos\nlevantaron este\ntemplo para pedir\nque la nieve",
  "volviera cada año.\nQué raro pedir\nfrío, pensaba yo.\nQué raro pedir\nque algo termine.»"];
/* los guardianes, después de la tregua: conversaciones que crecen */
const GUEST_TALK={
  topo(){ const L=[];
    if(!thawed) L.push(["—La Brasa ya es\ntuya, brote. Llé-\nvala al altar y\nque el valle\nrespire."]);
    else if(!summered) L.push(["—¿Calorcito arriba?\nAquí abajo se\nnota. Las raíces\nya no tiemblan.","—Ve a ver a la\nReina. Está más\nenfadada que yo.\nCon razón."]);
    else if(!cycled) L.push(["—Mi hermano de\nallá arriba, el\nViento... no es\nmalo, brote.","—Solo lleva mucho\ntiempo solo. Como\nyo antes de que\nbajaras."]);
    else L.push(["—¿Nieva? Me gusta.\nLa nieve es la\nmanta de la\ntierra.","—Zzz... Cierra al\nsalir, brote."]);
    return L[0]; },
  avispa(){
    if(!summered) return ["—Zzz... Lleva la\nLágrima al altar.\nMis flores\nesperan."];
    if(!cycled) return ["—Las flores ya\ncierran de noche.\nGracias, brote.","—El Viento me\nescribió una vez.\nNunca abrí la\ncarta. Como Raíz.","—Si las\nencuentras...\nléelas por mí."];
    return ["—Zzz... Verano,\notoño, invierno.\nAsí debe ser.","—Mis obreras\nduermen. Yo\ntambién. Zzz..."]; },
  viento(){
    if(!cycled) return ["(El Viento no dice\nnada. Canturrea\nbajito.)"];
    return ["—...gracias por\ndecir mi nombre,\nbrote.","—Bajaré cada\ninvierno. Y me iré\ncada primavera.\nEs lo justo."]; },
  ciervo(){
    if(!autumned) return ["—Lleva la HOJA DE ÁMBAR al Roble, brote. Que caiga despacio en su altar.","—Yo me quedo aquí, entre las hojas. Por fin puedo tumbarme."];
    if(!cycled) return ["—El otoño ya está en casa. Ahora le toca al Viento del Norte.","—Si subes al pico, dile que el Ciervo sigue dejando caer las hojas. Él entenderá."];
    return ["—Las hojas caen y nadie se enfada. Qué cosa más rara.","—Gracias, brote. El molino vuelve a moler."]; },
};
/* el pozo de los deseos */
const WELL_TALK=["Un pozo viejo.\nEl agua brilla al\nfondo, muy abajo."];
const WELL_ASK=["Dicen que si\nechas 20 BAYAS y\npides un deseo,\nel pozo responde.","¿Echar 20 bayas?"];
const WELL_DONE=["(Chof.)","(Silencio.)","(...y algo sube\nflotando desde el\nfondo.)"];
/* nombres de objeto para la tarjeta de «¡nuevo!» */
const ITEM_NAMES={blade:'HOJA ANCESTRAL',bomb:'BELLOTA-BOMBA',hook:'RAÍZ-GANCHO',boomer:'VAINA VOLADORA',lantern:'FAROL DE BRASA',feather:'VILANO DE PETRA',shield:'ESCUDO DE CORTEZA',ember:'BRASA DE PRIMAVERA',tear:'LÁGRIMA DE VERANO',flake:'COPO ETERNO'};
AMULETS.susurro={name:'SUSURRO DEL VIENTO',desc:'El Remolino se\ncarga al instante\ny el tornadito\nvuela más lejos.'};
AMULETS.trebol={name:'TRÉBOL DE CUATRO',desc:'Trae suerte: más corazones y bayas de bichos y hierba.'}; // final de los trueques (12c)
const CHAPTER_NAMES=['Prólogo · El brote','Cap. 1 · La Brasa','Cap. 2 · La Lágrima','Cap. 3 · El Ámbar','Cap. 4 · El Copo','Epílogo · El ciclo'];
const CHAPTER_SHORT=['Prólogo','La Brasa','La Lágrima','El Ámbar','El Copo','Epílogo'];
/* más voces en el pueblo */
NPC_TALK.h=function(){
  if(!elderMet) return ["¡Corre a la PLAZA!\nEl abuelo Raíz te\nespera. Al ESTE,\nbajo el árbol."];
  if(!hasBlade) return ["¿Ya has visto al\nabuelo? Pues a la\nPLAYA del suroeste.","Yo no puedo ir:\nmamá dice que hay\ncangrejos."];
  if(!won) return ["¿Una hoja gigante?\n¡QUÉ ENVIDIA!","Yo solo tengo este\ndiente de león.\nNo corta nada.","Si alguna vez\nencuentras un\nVILANO grande...\n¡es mío, eh!"];
  if(!thawed) return ["¿Has visto el\nespino seco del\nnorte? Da repelús.","Mamá llama\nRODAPÚAS a los\nerizos de allí.","Si se hacen bola,\n¡ni los toques\nde frente!"];
  if(!summered) return ["¡Ha vuelto la\nprimavera!\n¡Eres mi héroe!","Oye... el abuelo\nRaíz te mira raro.","Como se mira a un\nnieto. Cosas mías,\nseguro."];
  if(!autumned) return ["¿Has visto el MOLINO de la Ciénaga? ¡Las aspas giran otra vez!","Dicen que dentro duerme un CIERVO con cuernos de ámbar...","...y un ESPANTAPÁJAROS que se mueve cuando no lo miras. ¡Brrr!"];
  if(!cycled) return ["El abuelo dice\nque aún falta el\nINVIERNO.","¿Y quién quiere\nfrío?... ¿O sí?\nYa no sé.",hasFeather?"¡Ese vilano es\nMÍO! ...Bueno,\nquédatelo. Vuela\nmejor contigo.":"En el pico hay un\nTEMPLO viejo. Dicen\nque guarda un\nVILANO enorme."];
  return ["¡Está nevando y\nNO da miedo!","Es como azúcar.\n¡El invierno\ntambién es bonito!"];
};
