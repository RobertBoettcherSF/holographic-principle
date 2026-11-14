export const locales = {en: "en-GB", de: "de-DE", es: "es-ES", fr: "fr-FR"};

export const messages = {
en: {
  brand: "Holo Tour", tour: "Guided tour", languages: "Choose a language",
  languageNames: {en: "English (UK)", de: "German", es: "Spanish", fr: "French"},
  skip: "Skip to content", soundOn: "Sound on", soundOff: "Sound off",
  footer: "Built for curiosity. Designed for understanding.",
  repository: "View the repository", replay: "Replay the introduction",
  splashTitle: "The holographic principle",
  splashHint: "Click or tap anywhere to begin",
  splashLead: "A short tour with pictures you can move.",
  splashAccess: "Enter the tour",
  splashError: "Animation unavailable. Tap to enter the tour.",
  f9hint: "F9 saves a feedback file",
  crashOld: "The last session did not end cleanly.",
  crashDownload: "Download crash report", crashDismiss: "Dismiss",
  showMaths: "Show me the maths", liveResult: "Live result",
  reset: "Reset sample ↺", sample: "Sample",
  stops: "Five stops", jumps: "Tour stops",
  earth: "Earth", sun: "Sun", millionSuns: "A million Suns",
  oneSun: "1 Sun", oneEarth: "1 Earth", suns: "Suns", earths: "Earths",
  km: "km", m: "m", mm: "mm", km2: "km²", m2: "m²", bits: "bits",
  cubes: "cubes", stickers: "stickers",
  formula: "Formula", constants: "Constants used", conditions: "In plain words",
  howHeavy: "How heavy?", massInSuns: "Mass in Suns", known: "What do you know?",
  ballSize: "Size",
  modeMass: "I know the mass", modeRadius: "I know the radius", modeBits: "I know the number of bits",
  radiusKm: "Radius (km)", bitCount: "Number of bits",
  ballRadius: "Radius in cubes",
  panHint: "Drag the disk to look around. Drag the dot to move the point.",
  pathHint: "Drag the two dots on the rim.",
  secretHint: "Tap a rim dot to rub it out. Tap again to put it back.",
  readable: "secrets can still be read",
  allReadable: "Every secret can still be read.",
  noneReadable: "Too much of the rim is gone. The secrets can no longer be read.",
  someReadable: "Some secrets can still be read.",
  restore: "Put the rim back", oneEach: "Rub out one on each",
  twoEach: "Rub out two on each", twoPetals: "Rub out two petals",
  errMissing: "Enter a number", errMissingHelp: "Use a finite number to see the result.",
  errPositive: "That value needs to be greater than zero",
  errPositiveHelp: "Zero and negative numbers do not make sense here.",
  errRange: "That value is outside the range this tour can show",
  errRangeHelp: "Try a smaller number.",
  errWhole: "Use a whole number of cubes",
  errWholeHelp: "The ball is built from whole cubes, from 1 to 12.",
  errClose: "Those two points are too close",
  errCloseHelp: "Separate them so there is a real gap to measure.",
  cards: {
    skin: {
      tag: "Stop 1 · Black holes",
      title: "A black hole's memory is on its skin",
      sentence: "The bigger a black hole is around, the more it can remember — and that memory sits on the surface, not deep inside.",
      insight: "The count follows the area of the skin. A heavier black hole has a bigger skin, and the memory grows with that area.",
      compare: "If the Sun were a black hole it would be {sun} across, with entropy S/k_B about {sk}. The Earth would be only {earth} across."
    },
    area: {
      tag: "Stop 2 · Counting",
      title: "Area beats volume",
      sentence: "A bigger ball holds far more sugar cubes inside than stickers on its skin. The inside wins the counting race.",
      insight: "From this ball to one twice as wide: the cubes go from {c} to {c2} (about ×{cg}), and the stickers go from {s} to {s2} (about ×{sg}). The skin falls behind. A black hole is surprising because its memory follows the stickers, not the cubes.",
      slice: "A slice through the middle. Pale cubes are inside; bright ones touch the skin.",
      smooth: "The smooth formulas, for a radius of {r} cube-widths, give a volume of {v} and an area of {a}. Working backwards, both formulas return the same radius."
    },
    sheet: {
      tag: "Stop 3 · Holograms",
      title: "A 3D world drawn on a 2D sheet",
      sentence: "A hologram is a flat picture that still shows depth. In this curved disk, a point inside is stored on an arc of the rim.",
      insight: "This point sits at distance {rho} from the middle and needs an arc of about {deg}° on the rim. Closer to the rim, a smaller arc is enough. The very middle needs half the rim.",
      note: "The disk is the Poincaré model of a hyperbolic plane: a map of a curved space that keeps growing as you walk toward the edge. The highlighted arc is the piece of the boundary that encodes the dot, the arc for which the dot is the deepest point."
    },
    path: {
      tag: "Stop 4 · Connections",
      title: "Shortest paths measure connection",
      sentence: "Drag two points on the rim. The shortest path through the inside tells you how strongly those two pieces of the rim are tied together.",
      insight: "A gap twice as long does not double the connection. It adds only (c/3) ln 2, about {add}. For this gap that longer interval would read S = {double}.",
      cutoff: "Cutoff ε = {eps}. The rim is infinitely far away, so the length stops a tiny step ε before it. In these units the AdS radius ℓ is 1 and G is 1/2, so the central charge is c = 3ℓ / (2G) = 3. L is the straight chord between the two points.",
      check: "The two entropy formulas agree for this cutoff."
    },
    secret: {
      tag: "Stop 5 · Sharing a secret",
      title: "A secret shared so it can survive",
      sentence: "Each pentagon keeps a secret in the middle. Rub out rim dots and the secret is still there — until you rub out too many.",
      insight: "A pentagon can pass its secret on once it already knows at least 3 of its 5 edges. That is the greedy entanglement-wedge rule. This picture is the first ring of the HaPPY network: one pentagon and five around it.",
      rule: "A perfect tensor with 6 legs (5 edges plus the secret) lets any 3 legs determine the other 3. The full tiling also fills the gaps between these petals; the reading rule is the same."
    }
  }
},
de: {
  brand: "Holo Tour", tour: "Geführte Tour", languages: "Sprache wählen",
  languageNames: {en: "Englisch (UK)", de: "Deutsch", es: "Spanisch", fr: "Französisch"},
  skip: "Zum Inhalt springen", soundOn: "Ton an", soundOff: "Ton aus",
  footer: "Für Neugier gemacht. Zum Verstehen gestaltet.",
  repository: "Repository ansehen", replay: "Einführung erneut ansehen",
  splashTitle: "Das holographische Prinzip",
  splashHint: "Zum Starten irgendwo klicken oder tippen",
  splashLead: "Eine kurze Tour mit Bildern, die du bewegen kannst.",
  splashAccess: "Die Tour öffnen",
  splashError: "Animation nicht verfügbar. Tippe, um die Tour zu öffnen.",
  f9hint: "F9 speichert eine Rückmeldedatei",
  crashOld: "Die letzte Sitzung wurde nicht sauber beendet.",
  crashDownload: "Absturzbericht herunterladen", crashDismiss: "Schließen",
  showMaths: "Zeig mir die Rechnung", liveResult: "Aktuelles Ergebnis",
  reset: "Beispiel zurücksetzen ↺", sample: "Beispiel",
  stops: "Fünf Stationen", jumps: "Stationen der Tour",
  earth: "Erde", sun: "Sonne", millionSuns: "Eine Million Sonnen",
  oneSun: "1 Sonne", oneEarth: "1 Erde", suns: "Sonnen", earths: "Erden",
  km: "km", m: "m", mm: "mm", km2: "km²", m2: "m²", bits: "Bit",
  cubes: "Würfel", stickers: "Sticker",
  formula: "Formel", constants: "Verwendete Konstanten", conditions: "In einfachen Worten",
  howHeavy: "Wie schwer?", massInSuns: "Masse in Sonnen", known: "Was weißt du?",
  ballSize: "Größe",
  modeMass: "Ich kenne die Masse", modeRadius: "Ich kenne den Radius", modeBits: "Ich kenne die Anzahl der Bit",
  radiusKm: "Radius (km)", bitCount: "Anzahl der Bit",
  ballRadius: "Radius in Würfeln",
  panHint: "Ziehe die Scheibe, um dich umzusehen. Ziehe den Punkt, um ihn zu verschieben.",
  pathHint: "Ziehe die beiden Punkte auf dem Rand.",
  secretHint: "Tippe einen Randpunkt an, um ihn wegzuwischen. Tippe noch einmal, um ihn zurückzuholen.",
  readable: "Geheimnisse lassen sich noch lesen",
  allReadable: "Jedes Geheimnis lässt sich noch lesen.",
  noneReadable: "Zu viel vom Rand ist weg. Die Geheimnisse lassen sich nicht mehr lesen.",
  someReadable: "Einige Geheimnisse lassen sich noch lesen.",
  restore: "Rand wiederherstellen", oneEach: "Auf jedem eines wegwischen",
  twoEach: "Auf jedem zwei wegwischen", twoPetals: "Zwei Blütenblätter wegwischen",
  errMissing: "Gib eine Zahl ein", errMissingHelp: "Verwende eine endliche Zahl, um das Ergebnis zu sehen.",
  errPositive: "Der Wert muss größer als null sein",
  errPositiveHelp: "Null und negative Zahlen ergeben hier keinen Sinn.",
  errRange: "Dieser Wert liegt außerhalb dessen, was die Tour zeigen kann",
  errRangeHelp: "Versuche eine kleinere Zahl.",
  errWhole: "Nimm eine ganze Zahl von Würfeln",
  errWholeHelp: "Der Ball besteht aus ganzen Würfeln, von 1 bis 12.",
  errClose: "Diese beiden Punkte liegen zu nah beieinander",
  errCloseHelp: "Rück sie auseinander, damit eine echte Lücke entsteht.",
  cards: {
    skin: {
      tag: "Station 1 · Schwarze Löcher",
      title: "Das Gedächtnis eines Schwarzen Lochs sitzt auf seiner Haut",
      sentence: "Je größer ein Schwarzes Loch im Umfang ist, desto mehr kann es sich merken — und dieses Gedächtnis liegt auf der Oberfläche, nicht tief innen.",
      insight: "Die Zahl folgt der Fläche der Haut. Ein schwereres Schwarzes Loch hat eine größere Haut, und das Gedächtnis wächst mit dieser Fläche.",
      compare: "Wäre die Sonne ein Schwarzes Loch, wäre sie {sun} groß, mit einer Entropie S/k_B von etwa {sk}. Die Erde wäre nur {earth} groß."
    },
    area: {
      tag: "Station 2 · Zählen",
      title: "Fläche schlägt Volumen",
      sentence: "Ein größerer Ball enthält viel mehr Zuckerwürfel im Inneren als Sticker auf der Haut. Das Innere gewinnt das Zählrennen.",
      insight: "Von diesem Ball zu einem doppelt so breiten: die Würfel gehen von {c} auf {c2} (etwa ×{cg}) und die Sticker von {s} auf {s2} (etwa ×{sg}). Die Haut bleibt zurück. Ein Schwarzes Loch überrascht, weil sein Gedächtnis den Stickern folgt, nicht den Würfeln.",
      slice: "Ein Schnitt durch die Mitte. Blasse Würfel liegen innen, helle berühren die Haut.",
      smooth: "Die glatten Formeln ergeben bei einem Radius von {r} Würfelbreiten ein Volumen von {v} und eine Fläche von {a}. Rückwärts gerechnet liefern beide Formeln denselben Radius."
    },
    sheet: {
      tag: "Station 3 · Hologramme",
      title: "Eine 3D-Welt auf einem 2D-Blatt",
      sentence: "Ein Hologramm ist ein flaches Bild, das trotzdem Tiefe zeigt. In dieser gekrümmten Scheibe steckt ein Punkt im Inneren in einem Bogen des Randes.",
      insight: "Dieser Punkt liegt im Abstand {rho} von der Mitte und braucht einen Bogen von etwa {deg}° auf dem Rand. Näher am Rand genügt ein kleinerer Bogen. Die ganz Mitte braucht den halben Rand.",
      note: "Die Scheibe ist das Poincaré-Modell einer hyperbolischen Ebene: eine Karte eines gekrümmten Raums, der immer weiter wächst, je näher du dem Rand kommst. Der helle Bogen ist das Stück des Randes, das den Punkt speichert — der Bogen, für den der Punkt der tiefste Punkt ist."
    },
    path: {
      tag: "Station 4 · Verbindungen",
      title: "Kürzeste Wege messen Verbindung",
      sentence: "Ziehe zwei Punkte auf dem Rand. Der kürzeste Weg durch das Innere sagt, wie stark diese beiden Randstücke miteinander verbunden sind.",
      insight: "Eine doppelt so lange Lücke verdoppelt die Verbindung nicht. Sie fügt nur (c/3) ln 2 hinzu, etwa {add}. Für diese Lücke läse das längere Intervall S = {double}.",
      cutoff: "Abschneidewert ε = {eps}. Der Rand ist unendlich weit weg, deshalb endet die Länge einen winzigen Schritt ε davor. In diesen Einheiten ist der AdS-Radius ℓ = 1 und G = 1/2, also die zentrale Ladung c = 3ℓ / (2G) = 3. L ist die gerade Sehne zwischen den beiden Punkten.",
      check: "Die beiden Entropieformeln stimmen für diesen Abschneidewert überein."
    },
    secret: {
      tag: "Station 5 · Ein Geheimnis teilen",
      title: "Ein Geheimnis, geteilt, damit es überlebt",
      sentence: "Jedes Fünfeck bewahrt ein Geheimnis in der Mitte. Wische Randpunkte weg, und das Geheimnis ist noch da — bis du zu viele wegwischst.",
      insight: "Ein Fünfeck kann sein Geheimnis weitergeben, sobald es mindestens 3 seiner 5 Kanten schon kennt. Das ist die gierige Verschränkungskeil-Regel. Dieses Bild ist der erste Ring des HaPPY-Netzes: ein Fünfeck und fünf darum herum.",
      rule: "Ein perfekter Tensor mit 6 Beinen (5 Kanten plus das Geheimnis) lässt beliebige 3 Beine die anderen 3 bestimmen. Die volle Parkettierung füllt auch die Lücken zwischen diesen Blütenblättern; die Lese-Regel bleibt dieselbe."
    }
  }
},
es: {
  brand: "Holo Tour", tour: "Visita guiada", languages: "Elegir idioma",
  languageNames: {en: "Inglés (Reino Unido)", de: "Alemán", es: "Español", fr: "Francés"},
  skip: "Saltar al contenido", soundOn: "Activar sonido", soundOff: "Silenciar",
  footer: "Creado para la curiosidad. Diseñado para comprender.",
  repository: "Ver el repositorio", replay: "Volver a la introducción",
  splashTitle: "El principio holográfico",
  splashHint: "Haz clic o toca en cualquier lugar para empezar",
  splashLead: "Un recorrido corto con dibujos que puedes mover.",
  splashAccess: "Entrar en la visita",
  splashError: "Animación no disponible. Toca para entrar en la visita.",
  f9hint: "F9 guarda un archivo de comentarios",
  crashOld: "La última sesión no terminó bien.",
  crashDownload: "Descargar el informe del fallo", crashDismiss: "Cerrar",
  showMaths: "Enséñame las matemáticas", liveResult: "Resultado actual",
  reset: "Restablecer el ejemplo ↺", sample: "Ejemplo",
  stops: "Cinco paradas", jumps: "Paradas de la visita",
  earth: "Tierra", sun: "Sol", millionSuns: "Un millón de soles",
  oneSun: "1 Sol", oneEarth: "1 Tierra", suns: "soles", earths: "Tierras",
  km: "km", m: "m", mm: "mm", km2: "km²", m2: "m²", bits: "bits",
  cubes: "cubos", stickers: "pegatinas",
  formula: "Fórmula", constants: "Constantes usadas", conditions: "En pocas palabras",
  howHeavy: "¿Cuánto pesa?", massInSuns: "Masa en soles", known: "¿Qué conoces?",
  ballSize: "Tamaño",
  modeMass: "Conozco la masa", modeRadius: "Conozco el radio", modeBits: "Conozco el número de bits",
  radiusKm: "Radio (km)", bitCount: "Número de bits",
  ballRadius: "Radio en cubos",
  panHint: "Arrastra el disco para mirar alrededor. Arrastra el punto para moverlo.",
  pathHint: "Arrastra los dos puntos del borde.",
  secretHint: "Toca un punto del borde para borrarlo. Tócalo otra vez para devolverlo.",
  readable: "secretos todavía se pueden leer",
  allReadable: "Todos los secretos todavía se pueden leer.",
  noneReadable: "Ha desaparecido demasiado borde. Los secretos ya no se pueden leer.",
  someReadable: "Algunos secretos todavía se pueden leer.",
  restore: "Devolver el borde", oneEach: "Borrar uno en cada uno",
  twoEach: "Borrar dos en cada uno", twoPetals: "Borrar dos pétalos",
  errMissing: "Introduce un número", errMissingHelp: "Usa un número finito para ver el resultado.",
  errPositive: "El valor tiene que ser mayor que cero",
  errPositiveHelp: "El cero y los números negativos no tienen sentido aquí.",
  errRange: "Ese valor queda fuera de lo que esta visita puede mostrar",
  errRangeHelp: "Prueba con un número más pequeño.",
  errWhole: "Usa un número entero de cubos",
  errWholeHelp: "La bola está hecha de cubos enteros, del 1 al 12.",
  errClose: "Esos dos puntos están demasiado cerca",
  errCloseHelp: "Sepáralos para que haya un hueco de verdad que medir.",
  cards: {
    skin: {
      tag: "Parada 1 · Agujeros negros",
      title: "La memoria de un agujero negro está en su piel",
      sentence: "Cuanto más grande es un agujero negro por fuera, más puede recordar, y esa memoria está en la superficie, no en el fondo.",
      insight: "La cuenta sigue el área de la piel. Un agujero negro más pesado tiene una piel más grande, y la memoria crece con esa área.",
      compare: "Si el Sol fuera un agujero negro mediría {sun} de lado a lado, con una entropía S/k_B de unos {sk}. La Tierra mediría solo {earth}."
    },
    area: {
      tag: "Parada 2 · Contar",
      title: "El área le gana al volumen",
      sentence: "Una bola más grande guarda muchos más terrones de azúcar dentro que pegatinas en la piel. El interior gana la carrera de contar.",
      insight: "De esta bola a otra el doble de ancha: los cubos pasan de {c} a {c2} (unos ×{cg}) y las pegatinas de {s} a {s2} (unos ×{sg}). La piel se queda atrás. Un agujero negro sorprende porque su memoria sigue a las pegatinas, no a los cubos.",
      slice: "Un corte por el medio. Los cubos pálidos están dentro; los brillantes tocan la piel.",
      smooth: "Las fórmulas suaves, para un radio de {r} cubos, dan un volumen de {v} y un área de {a}. Al revés, las dos fórmulas devuelven el mismo radio."
    },
    sheet: {
      tag: "Parada 3 · Hologramas",
      title: "Un mundo 3D dibujado en una hoja 2D",
      sentence: "Un holograma es una imagen plana que aun así muestra profundidad. En este disco curvo, un punto de dentro se guarda en un arco del borde.",
      insight: "Este punto está a una distancia {rho} del centro y necesita un arco de unos {deg}° en el borde. Más cerca del borde basta un arco más pequeño. El centro mismo necesita la mitad del borde.",
      note: "El disco es el modelo de Poincaré de un plano hiperbólico: un mapa de un espacio curvo que sigue creciendo al caminar hacia el borde. El arco iluminado es el trozo del borde que guarda el punto: el arco para el que el punto es el más profundo."
    },
    path: {
      tag: "Parada 4 · Conexiones",
      title: "Los caminos más cortos miden la conexión",
      sentence: "Arrastra dos puntos del borde. El camino más corto por dentro dice cuánto están unidos esos dos trozos del borde.",
      insight: "Un hueco el doble de largo no duplica la conexión. Solo suma (c/3) ln 2, unos {add}. Para este hueco, el intervalo más largo valdría S = {double}.",
      cutoff: "Corte ε = {eps}. El borde está infinitamente lejos, así que la longitud se detiene un paso diminuto ε antes. En estas unidades el radio de AdS ℓ es 1 y G es 1/2, así que la carga central es c = 3ℓ / (2G) = 3. L es la cuerda recta entre los dos puntos.",
      check: "Las dos fórmulas de la entropía coinciden con este corte."
    },
    secret: {
      tag: "Parada 5 · Compartir un secreto",
      title: "Un secreto compartido para que pueda sobrevivir",
      sentence: "Cada pentágono guarda un secreto en el centro. Borra puntos del borde y el secreto sigue ahí, hasta que borras demasiados.",
      insight: "Un pentágono puede pasar su secreto cuando ya conoce al menos 3 de sus 5 aristas. Esa es la regla voraz de la cuña de entrelazamiento. Este dibujo es el primer anillo de la red HaPPY: un pentágono y cinco alrededor.",
      rule: "Un tensor perfecto de 6 patas (5 aristas más el secreto) permite que 3 patas cualesquiera determinen las otras 3. El teselado completo también rellena los huecos entre estos pétalos; la regla de lectura es la misma."
    }
  }
},
fr: {
  brand: "Holo Tour", tour: "Visite guidée", languages: "Choisir une langue",
  languageNames: {en: "Anglais (Royaume-Uni)", de: "Allemand", es: "Espagnol", fr: "Français"},
  skip: "Aller au contenu", soundOn: "Activer le son", soundOff: "Couper le son",
  footer: "Pour la curiosité. Pour mieux comprendre.",
  repository: "Voir le dépôt", replay: "Revoir l'introduction",
  splashTitle: "Le principe holographique",
  splashHint: "Clique ou touche n'importe où pour commencer",
  splashLead: "Une courte visite avec des images que tu peux bouger.",
  splashAccess: "Entrer dans la visite",
  splashError: "Animation indisponible. Touche pour entrer dans la visite.",
  f9hint: "F9 enregistre un fichier de retour",
  crashOld: "La dernière session ne s'est pas terminée correctement.",
  crashDownload: "Télécharger le rapport de plantage", crashDismiss: "Fermer",
  showMaths: "Montre-moi les maths", liveResult: "Résultat actuel",
  reset: "Rétablir l'exemple ↺", sample: "Exemple",
  stops: "Cinq étapes", jumps: "Étapes de la visite",
  earth: "Terre", sun: "Soleil", millionSuns: "Un million de Soleils",
  oneSun: "1 Soleil", oneEarth: "1 Terre", suns: "Soleils", earths: "Terres",
  km: "km", m: "m", mm: "mm", km2: "km²", m2: "m²", bits: "bits",
  cubes: "cubes", stickers: "autocollants",
  formula: "Formule", constants: "Constantes utilisées", conditions: "En mots simples",
  howHeavy: "Quel poids ?", massInSuns: "Masse en Soleils", known: "Que connais-tu ?",
  ballSize: "Taille",
  modeMass: "Je connais la masse", modeRadius: "Je connais le rayon", modeBits: "Je connais le nombre de bits",
  radiusKm: "Rayon (km)", bitCount: "Nombre de bits",
  ballRadius: "Rayon en cubes",
  panHint: "Fais glisser le disque pour regarder autour. Fais glisser le point pour le déplacer.",
  pathHint: "Fais glisser les deux points du bord.",
  secretHint: "Touche un point du bord pour l'effacer. Touche encore pour le remettre.",
  readable: "secrets peuvent encore être lus",
  allReadable: "Chaque secret peut encore être lu.",
  noneReadable: "Il manque trop de bord. Les secrets ne peuvent plus être lus.",
  someReadable: "Certains secrets peuvent encore être lus.",
  restore: "Remettre le bord", oneEach: "Effacer un sur chacun",
  twoEach: "Effacer deux sur chacun", twoPetals: "Effacer deux pétales",
  errMissing: "Saisis un nombre", errMissingHelp: "Utilise un nombre fini pour voir le résultat.",
  errPositive: "Cette valeur doit être supérieure à zéro",
  errPositiveHelp: "Zéro et les nombres négatifs n'ont pas de sens ici.",
  errRange: "Cette valeur dépasse ce que la visite peut montrer",
  errRangeHelp: "Essaie un nombre plus petit.",
  errWhole: "Utilise un nombre entier de cubes",
  errWholeHelp: "La boule est faite de cubes entiers, de 1 à 12.",
  errClose: "Ces deux points sont trop proches",
  errCloseHelp: "Écarte-les pour qu'il y ait un vrai intervalle à mesurer.",
  cards: {
    skin: {
      tag: "Étape 1 · Trous noirs",
      title: "La mémoire d'un trou noir est sur sa peau",
      sentence: "Plus un trou noir est grand autour, plus il peut se souvenir — et cette mémoire est sur la surface, pas au fond.",
      insight: "Le compte suit l'aire de la peau. Un trou noir plus lourd a une plus grande peau, et la mémoire grandit avec cette aire.",
      compare: "Si le Soleil était un trou noir, il mesurerait {sun} de large, avec une entropie S/k_B d'environ {sk}. La Terre ne mesurerait que {earth}."
    },
    area: {
      tag: "Étape 2 · Compter",
      title: "L'aire bat le volume",
      sentence: "Une boule plus grosse contient bien plus de sucres à l'intérieur que d'autocollants sur la peau. L'intérieur gagne la course au comptage.",
      insight: "De cette boule à une boule deux fois plus large : les cubes passent de {c} à {c2} (environ ×{cg}) et les autocollants de {s} à {s2} (environ ×{sg}). La peau prend du retard. Un trou noir surprend parce que sa mémoire suit les autocollants, pas les cubes.",
      slice: "Une tranche par le milieu. Les cubes pâles sont à l'intérieur ; les cubes vifs touchent la peau.",
      smooth: "Les formules lisses, pour un rayon de {r} cubes, donnent un volume de {v} et une aire de {a}. À l'envers, les deux formules redonnent le même rayon."
    },
    sheet: {
      tag: "Étape 3 · Hologrammes",
      title: "Un monde 3D dessiné sur une feuille 2D",
      sentence: "Un hologramme est une image plate qui montre quand même la profondeur. Dans ce disque courbe, un point à l'intérieur est rangé sur un arc du bord.",
      insight: "Ce point est à la distance {rho} du milieu et a besoin d'un arc d'environ {deg}° sur le bord. Plus près du bord, un arc plus petit suffit. Le milieu lui-même a besoin de la moitié du bord.",
      note: "Le disque est le modèle de Poincaré d'un plan hyperbolique : une carte d'un espace courbe qui continue de grandir quand on marche vers le bord. L'arc éclairé est le morceau du bord qui code le point, l'arc dont le point est le plus profond."
    },
    path: {
      tag: "Étape 4 · Liaisons",
      title: "Les plus courts chemins mesurent la liaison",
      sentence: "Fais glisser deux points du bord. Le plus court chemin par l'intérieur dit à quel point ces deux morceaux du bord sont liés.",
      insight: "Un intervalle deux fois plus long ne double pas la liaison. Il ajoute seulement (c/3) ln 2, environ {add}. Pour cet intervalle, le plus long vaudrait S = {double}.",
      cutoff: "Seuil ε = {eps}. Le bord est infiniment loin, donc la longueur s'arrête un tout petit pas ε avant. Dans ces unités le rayon AdS ℓ vaut 1 et G vaut 1/2, donc la charge centrale est c = 3ℓ / (2G) = 3. L est la corde droite entre les deux points.",
      check: "Les deux formules d'entropie concordent pour ce seuil."
    },
    secret: {
      tag: "Étape 5 · Partager un secret",
      title: "Un secret partagé pour qu'il puisse survivre",
      sentence: "Chaque pentagone garde un secret au milieu. Efface des points du bord et le secret est encore là — jusqu'à ce que tu en effaces trop.",
      insight: "Un pentagone peut transmettre son secret dès qu'il connaît déjà au moins 3 de ses 5 arêtes. C'est la règle gloutonne du coin d'intrication. Cette image est le premier anneau du réseau HaPPY : un pentagone et cinq autour.",
      rule: "Un tenseur parfait à 6 pattes (5 arêtes plus le secret) permet à n'importe quelles 3 pattes de déterminer les 3 autres. Le pavage complet remplit aussi les trous entre ces pétales ; la règle de lecture est la même."
    }
  }
}
};

let language = "en";
try {
  const saved = localStorage.getItem("hp.language");
  if (Object.hasOwn(messages, saved)) language = saved;
} catch { /* private mode */ }

export const getLanguage = () => language;
export const getLocale = () => locales[language];
export const t = key => key.split(".").reduce((o, k) => o?.[k], messages[language]);

export function formatNumber(n) {
  if (!Number.isFinite(n)) return "—";
  const abs = Math.abs(n);
  const notation = abs !== 0 && (abs >= 1e6 || abs < 1e-3) ? "scientific" : "standard";
  return new Intl.NumberFormat(getLocale(), {maximumSignificantDigits: 6, notation}).format(n);
}

export function fill(template, values) {
  return template.replace(/\{(\w+)\}/g, (_, k) => values[k] ?? "");
}

export function translatePage() {
  document.documentElement.lang = locales[language];
  document.querySelectorAll("[data-i18n]").forEach(el => { el.textContent = t(el.dataset.i18n); });
  document.querySelectorAll("[data-i18n-aria]").forEach(el => el.setAttribute("aria-label", t(el.dataset.i18nAria)));
  document.querySelectorAll("[data-language]").forEach(button => {
    const selected = button.dataset.language === language;
    button.setAttribute("aria-pressed", String(selected));
    const name = button.querySelector(".language-name");
    if (name) name.textContent = t("languageNames." + button.dataset.language);
  });
}

export function setLanguage(value) {
  if (!Object.hasOwn(messages, value)) return;
  language = value;
  try { localStorage.setItem("hp.language", value); } catch { /* ignore */ }
  translatePage();
  window.dispatchEvent(new CustomEvent("languagechange"));
}

export function wireLanguages(playLanguage) {
  document.querySelectorAll("[data-language]").forEach(button => {
    button.addEventListener("click", ev => {
      ev.preventDefault();
      ev.stopPropagation();
      playLanguage?.();
      setLanguage(button.dataset.language);
    });
  });
}
