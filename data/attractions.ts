export interface Attraction {
  id: string;
  emoji: string;
  name: string;
  en: { description: string; category: string };
  es: { description: string; category: string };
}

export interface AttractionCategory {
  id: string;
  en: { title: string };
  es: { title: string };
  attractions: Attraction[];
}

export const attractionCategories: AttractionCategory[] = [
  {
    id: 'city',
    en: { title: 'In the City' },
    es: { title: 'En la Ciudad' },
    attractions: [
      {
        id: 'zocalo',
        emoji: '⛪',
        name: 'El Zócalo',
        en: {
          description: 'The vibrant heart of Oaxaca. Stroll the main square, linger over coffee, and catch live marimba music most evenings.',
          category: 'City Center',
        },
        es: {
          description: 'El corazón vibrante de Oaxaca. Pasea por la plaza principal, disfruta un café y escucha música de marimba casi todas las noches.',
          category: 'Centro',
        },
      },
      {
        id: 'llano',
        emoji: '🌳',
        name: 'El Llano',
        en: {
          description: 'A beloved neighborhood park where locals jog, chat, and relax. A perfect spot to feel the rhythm of everyday Oaxacan life.',
          category: 'Local Life',
        },
        es: {
          description: 'Un querido parque barrial donde los locales corren, charlan y descansan. Ideal para sentir el ritmo de la vida oaxaqueña.',
          category: 'Vida Local',
        },
      },
      {
        id: 'etnobotanico',
        emoji: '🌿',
        name: 'Jardín Etnobotánico',
        en: {
          description: "A stunning botanical garden inside a former convent showcasing Oaxaca's native plants. Guided tours available in English and Spanish.",
          category: 'Nature',
        },
        es: {
          description: 'Un impresionante jardín botánico dentro de un antiguo convento con plantas nativas de Oaxaca. Tours guiados en inglés y español.',
          category: 'Naturaleza',
        },
      },
      {
        id: 'jalatlaco',
        emoji: '🎨',
        name: 'Barrio de Jalatlaco',
        en: {
          description: "One of Oaxaca's most photogenic neighborhoods — colorful cobblestone streets, vibrant murals, and charming boutique cafés.",
          category: 'Culture',
        },
        es: {
          description: 'Uno de los barrios más fotogénicos de Oaxaca — calles empedradas coloridas, murales vibrantes y encantadores cafés boutique.',
          category: 'Cultura',
        },
      },
      {
        id: 'mercados',
        emoji: '🛍️',
        name: 'Mercado Benito Juárez & 20 de Noviembre',
        en: {
          description: "Two iconic markets side by side. Browse local crafts at Benito Juárez, then head next door for Oaxaca's legendary tlayudas, mole, and chocolate.",
          category: 'Markets',
        },
        es: {
          description: 'Dos mercados icónicos uno al lado del otro. Artesanías en Benito Juárez y las legendarias tlayudas, mole y chocolate en el 20 de Noviembre.',
          category: 'Mercados',
        },
      },
    ],
  },
  {
    id: 'day-trips',
    en: { title: 'Day Trips' },
    es: { title: 'Excursiones de un Día' },
    attractions: [
      {
        id: 'monte-alban',
        emoji: '🔺',
        name: 'Monte Albán',
        en: {
          description: 'A UNESCO World Heritage Site and one of the oldest cities in Mesoamerica. These Zapotec ruins overlook the valley, dating back to 500 BC.',
          category: 'Ruins',
        },
        es: {
          description: 'Patrimonio de la Humanidad de la UNESCO y una de las ciudades más antiguas de Mesoamérica. Ruinas zapotecas con vista al valle desde el 500 a.C.',
          category: 'Ruinas',
        },
      },
      {
        id: 'hierve-agua',
        emoji: '💧',
        name: 'Hierve el Agua',
        en: {
          description: "Surreal petrified waterfalls and mineral spring pools perched high in the mountains — one of Oaxaca's most spectacular natural wonders.",
          category: 'Nature',
        },
        es: {
          description: 'Cascadas petrificadas y pozas de manantiales minerales en lo alto de las montañas — una de las maravillas naturales más espectaculares de Oaxaca.',
          category: 'Naturaleza',
        },
      },
      {
        id: 'mitla',
        emoji: '🏺',
        name: 'Mitla',
        en: {
          description: 'A Zapotec archaeological site famous for its extraordinary geometric stone mosaics — unlike anything else found in Mexico.',
          category: 'Ruins',
        },
        es: {
          description: 'Un sitio arqueológico zapoteca famoso por sus extraordinarios mosaicos de piedra geométricos, únicos en todo México.',
          category: 'Ruinas',
        },
      },
      {
        id: 'tule',
        emoji: '🌲',
        name: 'Árbol del Tule',
        en: {
          description: "The widest tree trunk on Earth — over 1,500 years old and sacred to the Zapotec people. Just 9 km from the city center.",
          category: 'Nature',
        },
        es: {
          description: 'El tronco de árbol más ancho del mundo — con más de 1,500 años y sagrado para el pueblo zapoteca. A solo 9 km del centro.',
          category: 'Naturaleza',
        },
      },
      {
        id: 'puerto-escondido',
        emoji: '🌊',
        name: 'Puerto Escondido',
        en: {
          description: 'A Pacific coast gem reachable by ADO overnight bus. World-class surf, fresh seafood, and breathtaking sunsets await.',
          category: 'Beach',
        },
        es: {
          description: 'Una joya de la costa del Pacífico accesible en autobús ADO nocturno. Surf de clase mundial, mariscos frescos y atardeceres impresionantes.',
          category: 'Playa',
        },
      },
    ],
  },
  {
    id: 'experiences',
    en: { title: 'Experiences Not to Miss' },
    es: { title: 'Experiencias Imperdibles' },
    attractions: [
      {
        id: 'mezcal',
        emoji: '🍾',
        name: 'Mezcal Distillery Tour',
        en: {
          description: "Visit a traditional palenque, watch the agave-to-bottle process, and taste some of the finest mezcal you'll ever have.",
          category: 'Food & Drink',
        },
        es: {
          description: 'Visita un palenque tradicional, observa el proceso del agave a la botella y degusta el mejor mezcal que probarás jamás.',
          category: 'Gastronomía',
        },
      },
      {
        id: 'dia-muertos',
        emoji: '🕯️',
        name: 'Día de Muertos',
        en: {
          description: 'Late October to early November, Oaxaca transforms. Marigold altars, candlelit cemetery processions, and profound cultural reverence.',
          category: 'Festival',
        },
        es: {
          description: 'De finales de octubre a principios de noviembre, Oaxaca se transforma. Altares con cempasúchil, procesiones nocturnas y profunda reverencia cultural.',
          category: 'Festival',
        },
      },
      {
        id: 'guelaguetza',
        emoji: '🎭',
        name: 'Guelaguetza Festival',
        en: {
          description: 'Held every July on the Cerro del Fortín hillside — the largest indigenous cultural festival in Latin America, a spectacular display of dance, music, and tradition.',
          category: 'Festival',
        },
        es: {
          description: 'Cada julio en el Cerro del Fortín — el festival cultural indígena más grande de América Latina, una espectacular muestra de danza, música y tradición.',
          category: 'Festival',
        },
      },
    ],
  },
];
