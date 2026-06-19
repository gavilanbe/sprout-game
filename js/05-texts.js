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
               "y sin ellas todo\nel valle se apaga\ncon él.",
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
          "dormir cuando el\nmundo era joven.\nLo he olvidado.»" ],
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
};
/* vecinos: diálogo según el momento de la historia */
const NPC_TALK={
  h(){ // Petra, la niña brote
    if(!hasBlade) return ["¡Hola! Soy Petra.\nEl abuelo Raíz\nestá llorón hoy.","Dice que el valle\nse muere. A mí me\nparece bonito."];
    if(!won) return ["¿Una hoja gigante?\n¡QUÉ ENVIDIA!","Yo solo tengo este\ndiente de león.\nNo corta nada."];
    if(!thawed) return ["¿Has visto el\nespino seco del\nnorte? Da repelús.","Mamá dice que de\nallí baja un frío\nque muerde."];
    return ["¡Ha vuelto la\nprimavera!\n¡Eres mi héroe!"];
  },
  j(){ // Lupa, la jardinera
    if(!hasBlade) return ["Soy Lupa. Cuido\nlas flores que\nquedan.","Sin las semillas\ndel Roble esto se\napaga, brote."];
    if(!lupaPot&&berries>=10){ // trueque: 10 bayas → corazón de savia
      berries-=10; lupaPot=true; player.maxHp+=2; player.hp=player.maxHp;
      SFX.fanfare(); save();
      return ["¡10 bayas! Trato\nes trato, brote...","Mi receta secreta:\n¡CORAZÓN DE SAVIA!\nTu vigor aumenta."];
    }
    let pg;
    if(!won) pg=["Truco de Lupa:\nlos arbustos que\nBRILLAN esconden","cosas. Córtalos\ncon tu hoja."];
    else if(!thawed) pg=["Mis flores tiritan.\nEse invierno del\nnorte no es normal.","Dicen que el TOPO\nREAL guarda una\nbrasa que arde."];
    else pg=["¡Mira qué flores!\nHasta el aire\nhuele a verde."];
    if(!lupaPot) pg=pg.concat(["Si me traes 10\nBAYAS te preparo\nalgo muy especial."]);
    return pg;
  },
  y(){ // Moss, el pescador
    if(!hasBlade) return ["...Los peces ya\nno pican.\nMal asunto."];
    if(berries>=5&&player.hp<player.maxHp){ // trueque: 5 bayas → sopa que cura del todo
      berries-=5; player.hp=player.maxHp; SFX.heart(); save();
      return ["5 bayas, marchando\nsopa de pescador...","¡Como nuevo,\nbrote! Vida al\nmáximo."];
    }
    let pg;
    if(!won) pg=["Vi brillar algo en\nla lengua de arena.\nUn bicho lo vigila."];
    else if(!thawed) pg=["El agua baja\nhelada del norte.","Los peces tiemblan\nbajo el hielo."];
    else pg=["¡Pican otra vez!\nTe debo una,\nbrote."];
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

