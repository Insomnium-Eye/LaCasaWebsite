import { BlogPost } from '@/types/blog';

/**
 * All blog posts. To publish a new one, add an entry here (any order; the site
 * sorts by date, newest first), put its photos in public/imgs/blog/<slug>/,
 * and add /blog/<slug> to public/sitemap.xml. See README → "Publishing a blog post".
 */

const LLANO = '/imgs/blog/llano-grande';

export const BLOG_POSTS: BlogPost[] = [
  {
    slug: 'llano-grande',
    date: '2026-11-25',
    title: {
      en: 'Llano Grande: Pine Forests, Mountain Air, and a Fire at the End of the Day',
      es: 'Llano Grande: bosque de pinos, aire de montaña y una chimenea al final del día',
    },
    description: {
      en: 'Pine forests, mountain meadows and cabins with fireplaces: a quiet guide to Llano Grande, about two hours from Oaxaca city.',
      es: 'Bosques de pino, praderas y cabañas con chimenea: una guía tranquila a Llano Grande, a unas dos horas de la ciudad de Oaxaca.',
    },
    intro: {
      en: "About two hours from downtown Oaxaca, the road climbs out of the valley and into the pines, and the air starts to smell different. Llano Grande is a small mountain community surrounded by forest, meadows and running water, the kind of place where the loudest sound in the afternoon might be a stream or a few goats wandering down the lane. It's one of our favorite places to recommend when guests ask where to go to slow down.",
      es: 'A unas dos horas del centro de Oaxaca, la carretera sale del valle y se mete entre los pinos, y el aire empieza a oler distinto. Llano Grande es una pequeña comunidad de montaña rodeada de bosque, praderas y agua que corre por todos lados; un lugar donde, por la tarde, lo más ruidoso puede ser un arroyo o un par de chivos bajando por el camino. Es uno de nuestros lugares favoritos para recomendar cuando alguien nos pregunta a dónde ir para bajar el ritmo.',
    },
    hero: {
      src: `${LLANO}/hero-pines-mountain-valley.jpg`,
      width: 2000,
      height: 1500,
      alt: {
        en: 'Tall pine trees framing a forested mountain valley under a cloudy sky, with orange wildflowers in the foreground',
        es: 'Pinos altos enmarcando un valle de montaña boscoso bajo un cielo nublado, con flores naranjas en primer plano',
      },
      caption: { en: 'The view from the pines above Llano Grande.', es: 'La vista desde los pinos sobre Llano Grande.' },
    },
    blocks: [
      { type: 'heading', text: { en: 'A village in a clearing', es: 'Un pueblo en medio del llano' } },
      {
        type: 'paragraph',
        text: {
          en: `Llano Grande means "big meadow," and that's the first thing you notice. The village opens onto a wide, green clearing ringed by pine-covered hills, with one rounded peak rising behind it. Wooden cabins and small houses sit along the edges of the grass, some with red tin roofs, some painted bright blue or yellow. A few neatly trimmed trees stand in the middle of the green like they've been placed there on purpose.`,
          es: 'El nombre lo dice todo: lo primero que ves es un llano amplio y verde, rodeado de cerros cubiertos de pino, con un pico redondeado detrás. Alrededor del pasto hay cabañas de madera y casitas, algunas con techos de lámina roja, otras pintadas de azul o amarillo. En medio del llano, unos árboles podados en forma redonda parecen puestos ahí a propósito.',
        },
      },
      {
        type: 'image',
        image: {
          src: `${LLANO}/village-meadow-cabins.jpg`,
          width: 2000,
          height: 1500,
          alt: {
            en: 'A wide green meadow with wooden cabins along its edges and a forested peak under a bright sun',
            es: 'Una pradera verde y amplia con cabañas de madera en las orillas y un cerro boscoso bajo el sol',
          },
          caption: { en: 'The big meadow that gives Llano Grande its name.', es: 'El gran llano que le da nombre a Llano Grande.' },
        },
      },
      {
        type: 'paragraph',
        text: {
          en: "Life here moves at a rural pace. Dirt lanes run between the houses, power lines are the only straight lines on the horizon, and it's common to share the path with a couple of goats grazing at the edge of the road. Nobody is in a hurry, and after a day or so, you won't be either.",
          es: 'Aquí la vida va a otro ritmo. Los caminos de tierra corren entre las casas, los postes de luz son las únicas líneas rectas en el paisaje, y es normal compartir el camino con unos chivos pastando a la orilla. Nadie tiene prisa, y después de un día, tú tampoco.',
        },
      },

      { type: 'heading', text: { en: 'Into the pines', es: 'Entre los pinos' } },
      {
        type: 'paragraph',
        text: {
          en: "Step a few minutes away from the village and you're in the forest. Tall, straight pine trunks rise out of a floor thick with fallen needles, and the light filters down in long afternoon beams. From the slopes above the village, the view opens across layer after layer of forested ridges, each one a little paler than the last.",
          es: 'A unos minutos del pueblo ya estás en el bosque. Troncos altos y rectos salen de un suelo cubierto de hojas de pino, y la luz de la tarde entra en rayos largos. Desde las laderas sobre el pueblo, la vista se abre hacia una fila de cerros boscosos, cada uno un poco más tenue que el anterior.',
        },
      },
      {
        type: 'paragraph',
        text: {
          en: "Look closely at the trunks and you'll find bromeliads clinging to the bark, their spiky green leaves sending out bright red flower stalks. On warm afternoons, lizards sun themselves on the needles and slip away into the grass when you get close. It's a quiet forest, but it's very much alive.",
          es: 'Si miras bien los troncos, vas a encontrar bromelias pegadas a la corteza, con sus hojas verdes en punta y tallos de flores rojo intenso. En las tardes cálidas, las lagartijas toman el sol sobre las hojas de pino y se escabullen entre el pasto cuando te acercas. Es un bosque tranquilo, pero lleno de vida.',
        },
      },

      { type: 'heading', text: { en: 'Streams, springs and water everywhere', es: 'Arroyos, manantiales y agua por todas partes' } },
      {
        type: 'paragraph',
        text: {
          en: 'One of the loveliest things about Llano Grande is how much water runs through it. Small streams tumble over mossy rocks under a canopy of ferns, and clear, spring-fed pools sit tucked among the trees, still enough to reflect the trunks above them. Many of the trails follow the water, and you can hear it long before you see it.',
          es: 'Una de las cosas más bonitas de Llano Grande es la cantidad de agua que corre por ahí. Pequeños arroyos bajan entre piedras con musgo bajo los helechos, y entre los árboles hay pozas de manantial tan claras y quietas que reflejan los troncos. Muchos senderos siguen el agua, y la escuchas mucho antes de verla.',
        },
      },
      {
        type: 'image',
        image: {
          src: `${LLANO}/forest-stream-ferns.jpg`,
          width: 1500,
          height: 2000,
          alt: {
            en: 'A small stream cascading over mossy rocks between ferns and green plants',
            es: 'Un pequeño arroyo que baja entre piedras con musgo, helechos y plantas verdes',
          },
          caption: { en: 'Mountain water, running clear through the forest.', es: 'Agua de montaña, clarita, corriendo por el bosque.' },
        },
      },
      {
        type: 'paragraph',
        text: {
          en: "The wider area has plenty of trails, rivers and lakes to explore. Some walks are short strolls from the cabins; others can take most of a day. If you'd like a longer hike, ask locally about routes and conditions. The trails are part of people's everyday landscape, and they know them best.",
          es: 'La zona tiene muchos senderos, ríos y lagos para explorar. Algunas caminatas son paseos cortos desde las cabañas; otras te pueden llevar casi todo el día. Si quieres hacer una caminata larga, pregunta en el pueblo por las rutas y cómo están: son parte del paisaje de todos los días de la gente de aquí, y nadie los conoce mejor.',
        },
      },

      { type: 'heading', text: { en: 'Wildflowers along every path', es: 'Flores silvestres en cada camino' } },
      {
        type: 'paragraph',
        text: {
          en: 'In the green season, the meadows and roadsides are full of color. Spikes of purple lupine grow beside the dirt roads, small blue flowers open low among the pine needles, and red tubular blooms hang from tall stems at the forest\'s edge. In the open meadows, the grass is scattered with yellow flowers, with the occasional pale pink one standing out among them. Near the cabins, clusters of bright orange "red-hot poker" flowers catch the late sun.',
          es: 'En temporada de lluvias, las praderas y las orillas de los caminos se llenan de color. Hay espigas de lupino morado junto a los caminos de tierra, florecitas azules que se abren entre las hojas de pino, y flores rojas en forma de tubo colgando de tallos altos a la orilla del bosque. En el llano, el pasto se llena de flores amarillas, con alguna flor rosa pálido asomándose entre ellas. Cerca de las cabañas, matas de flores naranjas, las llamadas "antorchas", se encienden con el sol de la tarde.',
        },
      },
      {
        type: 'image',
        image: {
          src: `${LLANO}/wild-lupine-roadside.jpg`,
          width: 1500,
          height: 2000,
          alt: {
            en: 'Purple lupine flowers growing beside a dirt road at the edge of the forest',
            es: 'Flores de lupino morado junto a un camino de tierra a la orilla del bosque',
          },
          caption: { en: 'Wild lupine along the road into the trees.', es: 'Lupino silvestre en el camino hacia los árboles.' },
        },
      },
      {
        type: 'paragraph',
        text: {
          en: "It's worth walking slowly. Some of the best things here are small: a delicate white wildflower among the needles, a bee working its way across a flower head, a plant with leaves that turn deep red at the edges.",
          es: 'Vale la pena caminar despacio. Muchas de las mejores cosas aquí son pequeñas: una florecita blanca entre las hojas de pino, una abeja recorriendo una flor, una planta con las hojas pintadas de rojo en las orillas.',
        },
      },

      { type: 'heading', text: { en: 'The cabins and the fireplace', es: 'Las cabañas y la chimenea' } },
      {
        type: 'paragraph',
        text: {
          en: "The cabins are the heart of a stay in Llano Grande. They're simple and cozy, set among the trees, and each one has its own stone fireplace. Evenings in the mountains are cool, even when the days are warm, and once the sun drops behind the ridge, a fire feels less like a luxury and more like a ritual.",
          es: 'Las cabañas son el corazón de una visita a Llano Grande. Son sencillas y acogedoras, rodeadas de árboles, y cada una tiene su propia chimenea de piedra. En la montaña las noches son frescas, aunque el día haya estado templado, y cuando el sol se esconde detrás del cerro, prender la chimenea se vuelve casi un ritual.',
        },
      },
      {
        type: 'image',
        image: {
          src: `${LLANO}/cabin-fireplace.jpg`,
          width: 1500,
          height: 2000,
          alt: { en: 'A wood fire burning in an arched fireplace at night', es: 'Fuego de leña ardiendo en una chimenea con arco, de noche' },
          caption: { en: 'The best part of a cold mountain evening.', es: 'Lo mejor de una noche fría en la montaña.' },
        },
      },
      {
        type: 'paragraph',
        text: {
          en: "You can build and light the fire yourself if you enjoy that part, or ask for someone to set it up for you. Either way, there's something grounding about ending the day in front of the flames, with nothing but the crackle of pine and the dark forest outside.",
          es: 'Puedes prender el fuego tú mismo si te gusta esa parte, o pedir que alguien te lo deje listo. De cualquier forma, hay algo muy reconfortante en terminar el día frente a las llamas, con el crujir de la leña de pino y el bosque oscuro allá afuera.',
        },
      },

      { type: 'heading', text: { en: 'Practical details', es: 'Datos prácticos' } },
      {
        type: 'list',
        items: [
          {
            en: '**Getting there:** Llano Grande is roughly a 2-hour drive from downtown Oaxaca, on a road that winds up into the mountains. Take your time on the curves.',
            es: '**Cómo llegar:** Llano Grande está a unas 2 horas en coche del centro de Oaxaca, por una carretera que sube con muchas curvas. Tómalo con calma.',
          },
          {
            en: '**Day trip or overnight?** A day trip is possible, but it means about four hours in the car for a few hours on the ground. Staying at least one night lets you see the late-afternoon light over the ridges, enjoy an evening by the fire, and walk the trails in the cool morning.',
            es: '**¿Ir y volver el mismo día, o quedarse?** Se puede ir y volver en un día, pero son unas cuatro horas de camino para pasar pocas horas allá. Quedarte al menos una noche te deja ver la luz de la tarde sobre los cerros, disfrutar la noche junto a la chimenea y caminar los senderos con el fresco de la mañana.',
          },
          {
            en: '**What to bring:** Warm layers for the evenings, comfortable shoes for uneven trails, and a rain jacket. In the green season, clouds often build over the peaks by afternoon. Carrying some cash is wise, as card payment can\'t be counted on in small mountain communities.',
            es: '**Qué llevar:** Ropa abrigadora para la noche, zapatos cómodos para senderos disparejos y una chamarra para la lluvia. En temporada de lluvias, las nubes suelen juntarse sobre los cerros por la tarde. Conviene llevar efectivo, porque en las comunidades de montaña no siempre se puede pagar con tarjeta.',
          },
          {
            en: '**What to expect:** Quiet. Simple, comfortable cabins rather than hotel amenities. Wildlife, fresh air and a lot of green.',
            es: '**Qué esperar:** Tranquilidad. Cabañas sencillas y cómodas, no servicios de hotel. Fauna, aire limpio y mucho verde.',
          },
        ],
      },

      { type: 'heading', text: { en: 'A comfortable base in San Felipe del Agua', es: 'Una base cómoda en San Felipe del Agua' } },
      {
        type: 'paragraph',
        text: {
          en: "La Casa Oaxaca sits in San Felipe del Agua, on the green, northern edge of Oaxaca city, at the foot of the same mountains. It makes an easy, comfortable base for exploring places like Llano Grande: you can spend a night or two up in the pines and come back to the city's food, markets and streets. If you'd rather not drive the mountain roads yourself, [a private ride is easy to book](/rides?book=llano_grande).",
          es: 'La Casa Oaxaca está en San Felipe del Agua, en la orilla norte y verde de la ciudad de Oaxaca, al pie de estas mismas montañas. Es una base cómoda para conocer lugares como Llano Grande: puedes pasar una o dos noches entre los pinos y regresar a la comida, los mercados y las calles de la ciudad. Si prefieres no manejar por la sierra, [puedes reservar un transporte privado](/rides?book=llano_grande).',
        },
      },
      {
        type: 'image',
        image: {
          src: `${LLANO}/late-light-through-pines.jpg`,
          width: 2000,
          height: 1500,
          alt: {
            en: 'Late-afternoon light through tall pine trunks, with layers of misty forested ridges behind',
            es: 'Luz de la tarde entre troncos altos de pino, con cerros boscosos y brumosos al fondo',
          },
          caption: { en: 'Late light over the Sierra, the end of a quiet day.', es: 'Luz de tarde sobre la sierra, al final de un día tranquilo.' },
        },
      },

      { type: 'heading', text: { en: 'Closing', es: 'Para cerrar' } },
      {
        type: 'paragraph',
        text: {
          en: "Llano Grande doesn't ask much of you. There's no list of sights to tick off, just forest to walk through, water to listen to, flowers to notice, and a fire waiting at the end of the day. If you're looking for a quiet corner of Oaxaca to breathe a little deeper, this is a good place to start.",
          es: 'Llano Grande no te pide mucho. No hay una lista de lugares que tachar; solo bosque para caminar, agua para escuchar, flores para descubrir y una chimenea esperándote al final del día. Si buscas un rincón tranquilo de Oaxaca para respirar un poco más profundo, este es un buen lugar para empezar.',
        },
      },
      {
        type: 'cta',
        heading: { en: 'Want to visit Llano Grande?', es: '¿Quieres conocer Llano Grande?' },
        text: {
          en: 'We offer private rides from La Casa Oaxaca straight to Llano Grande, door to door, in about two hours.',
          es: 'Te llevamos en transporte privado desde La Casa Oaxaca hasta Llano Grande, de puerta a puerta, en unas dos horas.',
        },
        label: { en: 'Book a ride now', es: 'Reserva tu viaje' },
        href: '/rides?book=llano_grande',
      },
    ],
  },
];
