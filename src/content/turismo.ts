/* Contenido de la página «Turismo». Fuente única: Plan de Manejo del Parque Nacional Montaña de Santa Bárbara
   2026–2038, BORRADOR (p. 6, objetivos específicos; p. 49, diagnóstico de turismo). Solo se publica lo que dice el
   documento: sin rutas, distancias, tarifas, horarios, teléfonos ni disponibilidad. El documento no confirma
   que los alojamientos funcionen hoy. */
import mar900 from '../assets/turismo/mar-de-nubes-900.webp';
import mar1867 from '../assets/turismo/mar-de-nubes-1867.webp';
import bosqueVideo from '../assets/turismo/bosque-nublado-720.mp4';
import bosquePoster from '../assets/turismo/bosque-nublado-poster.webp';
import cascadaH1280 from '../assets/biblioteca/cascada-bosque-h-1280.webp';
import cascadaH1920 from '../assets/biblioteca/cascada-bosque-h-1920.webp';
import cascada640 from '../assets/biblioteca/cascada-bosque-640.webp';
import cascada1280 from '../assets/biblioteca/cascada-bosque-1280.webp';
import quetzal from '../assets/biodiversidad/quetzal-435.webp';
import { photo, single, sized } from './media';

export const TURISMO = {
  eyebrow: 'Turismo',
  title: ['Descubre', 'la montaña.'],
  hero: photo(mar1867, mar900, 1867, 900, 1867, 805,
    'Atardecer sobre un mar de nubes; al fondo, la silueta de las montañas contra el cielo anaranjado.',
    { focus: '50% 40%' }),
  // portada en prueba: el video sustituye a la fotografía (que se conserva para volver a ella). Video propio
  // (sin pie de crédito), 9 s en bucle, sin audio; se reproduce más lento (`rate`) para que la neblina avance despacio
  heroVideo: {
    src: bosqueVideo, poster: bosquePoster, width: 1280, height: 720, rate: 0.6,
    label: 'Neblina que avanza sobre el dosel del bosque nublado.',
  },
  // p. 6
  lead:
    'Entre sus objetivos, el Plan de Manejo propone promover el turismo ecológico y la recreación al aire libre, ' +
    'respetando las características y capacidades del ecosistema y asegurando su sostenibilidad.',

  placesTitle: 'Puntos de interés',
  placesLabel: 'Identificados en el Plan de Manejo',
  // p. 49
  places: [
    {
      name: 'El Cedral',
      where: 'Aldea del municipio de Las Vegas',
      lodging: 'Cabañas PANAMOSAB AVENTURE',
      note: 'El documento destaca la observación de quetzales en diciembre y enero, temporada de mucha demanda.',
    },
    { name: 'El Dorado', lodging: 'Cabaña Las Agujas' },
    { name: 'La Vueltosa', lodging: 'Finca MOL' },
  ] as { name: string; where?: string; lodging: string; note?: string }[],
  placesNote:
    'Según el Plan de Manejo, son los únicos lugares de la zona con cabañas para albergar turistas y con guías. ' +
    'El documento no confirma que funcionen actualmente.',

  // franja entre los lugares y las actividades (fotografía propia): horizontal en pantallas anchas, vertical en
  // móvil. No se sitúa en ningún punto de interés: el lugar de la toma no consta
  walk: {
    wide: sized([[cascadaH1280, 1280], [cascadaH1920, 1920]], 1920, 1080,
      'Cascada que baja entre rocas cubiertas de musgo, rodeada de helechos y bosque.'),
    tall: sized([[cascada640, 640], [cascada1280, 1280]], 1280, 1707,
      'Cascada que baja entre rocas cubiertas de musgo, rodeada de helechos y bosque.'),
  },

  activitiesTitle: 'Actividades',
  // p. 49: las tres actividades que nombra el documento, sin descripciones añadidas
  activities: ['Caminatas en el bosque', 'Campamentos', 'Aviturismo'],
  birding: {
    title: 'Aviturismo',
    text:
      'De las actividades que se realizan en la zona, el documento destaca la observación de quetzales en la aldea ' +
      'El Cedral.',
    season: { months: ['Diciembre', 'Enero'], label: 'Temporada de observación' },
    caveat: 'La temporada no garantiza avistamientos: el quetzal es un ave silvestre.',
    photo: single(quetzal, 435, 332, 'Quetzal posado en una rama cubierta de musgo, con su larga cola verde iridiscente.'),
  },

  visit: {
    title: 'Antes de visitar',
    text:
      'Este sitio no publica rutas, horarios, tarifas ni servicios disponibles. Consulta previamente las condiciones ' +
      'de acceso y la disponibilidad de los servicios.',
  },
};
