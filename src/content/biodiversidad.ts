/* Contenido de la página «Biodiversidad». Fuente única: Plan de Manejo del Parque Nacional Montaña de Santa
   Bárbara 2026–2038, BORRADOR (src/PLAN_DE_MANEJO_PANAMOSAB_2026_2038_ Borrador.pdf). Cada texto indica la
   página del documento (numeración impresa, no la del PDF). Las fotografías son las del propio documento
   (portada y contraportada); su autoría y lugar no constan en él.
   Por decisión editorial, la fauna protagonista es solo el quetzal y la salamandra narizona (sin felinos). */
import dosel800 from '../assets/biodiversidad/dosel-800.webp';
import dosel1567 from '../assets/biodiversidad/dosel-1567.webp';
import epifitas720 from '../assets/biodiversidad/epifitas-720.webp';
import epifitas1400 from '../assets/biodiversidad/epifitas-1400.webp';
import orquidea from '../assets/biodiversidad/orquidea-434.webp';
import quetzal from '../assets/biodiversidad/quetzal-435.webp';
import { photo, single, type Photo } from './media';

const PLAN = 'Plan de Manejo 2026–2038 (borrador)';
const COVER = `Fotografía de la portada del ${PLAN}.`;

export interface Species {
  id: string;
  name: string;
  scientific: string;
  tag: string;                                   // condición que la distingue
  text: string[];
  status: { code: string; label: string }[];      // categorías de conservación, solo las que cita el documento
  photo?: Photo;                                  // sin fotografía validada, la ficha es tipográfica
  source: string;
}

export const BIO = {
  eyebrow: 'Biodiversidad',
  title: ['Una montaña', 'llena de vida.'],
  // p. 10
  lead:
    'El PANAMOSAB es un área protegida de gran relevancia ecológica. Su ubicación favorece la conectividad con otras ' +
    'áreas protegidas, y en ella se han registrado especies endémicas y de distribución restringida, varias de ellas ' +
    'en categorías de amenaza.',
  // p. 11
  body:
    'En las partes altas, el bosque nublado sostiene la biodiversidad del área y es hábitat y refugio para numerosas ' +
    'especies de fauna silvestre.',
  hero: photo(dosel1567, dosel800, 1567, 800, 1567, 640,
    'Dosel de un bosque nublado visto desde abajo: un tronco cubierto de musgo y niebla entre las copas.', { credit: COVER }),

  // pp. 22–24
  figures: {
    main: [
      { value: 1026, label: 'especies de plantas', detail: 'distribuidas en 159 familias botánicas' },
      { value: 195, label: 'especies de orquídeas', detail: 'Orchidaceae, la familia más diversa del inventario' },
    ],
    complement: { value: 235, prefix: '≈', label: 'registros de especies de aves en la plataforma eBird (2026)' },
    note:
      'Inventario preliminar. Hasta la fecha no se han realizado estudios científicos específicos sobre la flora del ' +
      'parque: el listado consolida registros de la plataforma iNaturalist, publicaciones científicas y trabajos ' +
      `técnicos (Vega, 2026). ${PLAN}, pp. 22–24.`,
  },

  species: [
    {
      id: 'quetzal',
      name: 'Quetzal',
      scientific: 'Pharomachrus mocinno',
      tag: 'Especie insignia del PANAMOSAB',
      text: [
        // p. 34
        'Una de las aves más emblemáticas de Mesoamérica, por su belleza y por su valor ecológico y cultural. En el ' +
          'parque se puede observar entre los 1,300 y los 2,500 msnm, donde encuentra las condiciones climáticas y ' +
          'ecológicas necesarias para su supervivencia.',
        'Dispersa las semillas de muchas especies: así ayuda a mantener la diversidad de plantas y la compleja ' +
          'estructura del bosque nublado, y facilita su regeneración natural.',
      ],
      status: [
        { code: 'NT', label: 'Casi amenazado · Lista Roja de la UICN' },
        { code: 'CITES I', label: 'Apéndice I de CITES: prohibido su comercio internacional' },
      ],
      photo: single(quetzal, 435, 332, 'Quetzal posado en una rama cubierta de musgo, con su larga cola verde iridiscente.', { credit: COVER }),
      source: `${PLAN}, pp. 24 y 34.`,
    },
    {
      id: 'salamandra',
      name: 'Salamandra narizona',
      scientific: 'Dendrotriton sanctibarbarus',
      tag: 'Endémica del área protegida',
      text: [
        // p. 23
        'Entre las 16 especies de anfibios registradas en el parque, es una de las de mayor valor para la ' +
          'conservación: es endémica del área protegida.',
      ],
      status: [{ code: 'CR', label: 'En Peligro Crítico · Lista Roja de la UICN' }],
      // sin fotografía validada en los documentos: se incorporará cuando el equipo disponga de una
      source: `${PLAN}, p. 23.`,
    },
  ] as Species[],

  flora: {
    title: 'La flora del bosque nublado',
    // p. 16
    text:
      'En el bosque nublado, la humedad y la nubosidad constantes favorecen una mayor presencia de plantas epífitas, ' +
      'como bromelias y orquídeas, que crecen sobre ramas y troncos.',
    // p. 23
    orchids: 'Las orquídeas forman la familia más diversa del inventario del parque.',
    endemicTitle: 'Seis especies de plantas endémicas',
    // p. 23, grafía del documento
    endemic: ['Desmopsis dolichopetala', 'Matelea porphyrantha', 'Alfaroa hondurensis', 'Magnolia cochranei', 'Cobaea hondurensis', 'Anemia donell-smithii'],
    endemicNote: 'Anemia donell-smithii, un helecho, es única de esta área protegida.',
    forest: photo(epifitas1400, epifitas720, 1400, 720, 1400, 1394,
      'Interior de un bosque nublado entre la niebla: lianas y raíces cuelgan de ramas cubiertas de bromelias y otras epífitas.',
      { credit: `Fotografía de la contraportada del ${PLAN}.` }),
    orchid: single(orquidea, 434, 332, 'Orquídea de pétalos blancos y labelo rosado, con gotas de agua, sobre el tronco de un árbol.', { credit: COVER }),
    source: `${PLAN}, pp. 16 y 22–23.`,
  },

  // pp. 10, 16, 26–27: dos de los valores de conservación del Plan, como contexto ecológico
  closing: {
    title: ['Conservar la montaña', 'es conservar el agua.'],
    values: [
      {
        name: 'Bosque nublado',
        figure: '9,956.55', unit: 'ha',
        text:
          'La zona de vida más extensa del parque. Además de la lluvia, capta la humedad de la niebla que queda ' +
          'retenida en sus hojas y en la abundante vegetación epífita.',
      },
      {
        name: 'Sistema ecológico hídrico',
        figure: '94', unit: 'comunidades',
        text:
          'Reciben agua del área protegida, dentro de ella y en su área de influencia. Sus microcuencas son ' +
          'fundamentales para mantener el nivel del Lago de Yojoa.',
      },
    ],
    text:
      'Por eso el Plan de Manejo los reconoce, junto al quetzal y a otras especies, como valores de conservación del parque.',
  },

  sources: `Fuente: ${PLAN}, elaborado para el periodo 2026–2038; documento en revisión.`,
};
