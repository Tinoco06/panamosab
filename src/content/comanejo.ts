/* Contenido de la sección «Comanejo». Cada texto indica su fuente (documentos en recursos/):
     [CONV]  Convenio para el co-manejo del PANAMOSAB, firmado el 13 de enero de 2026 (PDF escaneado)
     [ASIDE] Presentación institucional «ASIDE - 2026.pptx» (número de diapositiva)
     [CASM]  Documento institucional «CASM.docx»
     [OADM]  Sitio institucional de Árbol de Misericordia (arboldemisericordia.org; textos y fotografías)
   Para sumar una organización: añadir su perfil a PROFILES y su id en la lista de firmantes (profileId).
   Solo se publican perfiles con información respaldada; un firmante sin perfil aparece únicamente por su
   nombre y su logotipo en la franja de firmantes. */
import asideCampo720 from '../assets/comanejo/aside-campo-720.jpg';
import asideCampo1280 from '../assets/comanejo/aside-campo-1280.jpg';
import asideBosque560 from '../assets/comanejo/aside-bosque-560.jpg';
import asideBosque934 from '../assets/comanejo/aside-bosque-934.jpg';
import arbolCampo720 from '../assets/comanejo/arbol-campo-720.jpg';
import arbolCampo1280 from '../assets/comanejo/arbol-campo-1280.jpg';
import arbolVivero560 from '../assets/comanejo/arbol-vivero-560.jpg';
import arbolVivero934 from '../assets/comanejo/arbol-vivero-934.jpg';
// logotipos cuadrados con margen, para el carrusel de la portada (fuentes de cada logotipo en el README)
import logoArbol from '../assets/logos/arbol.webp';
import logoAside from '../assets/logos/aside.webp';
import logoCasm from '../assets/logos/casm.webp';
import logoCodemussba from '../assets/logos/codemussba.webp';
import logoIcf from '../assets/logos/icf.webp';
// los mismos logotipos recortados al trazo, para la franja de firmantes y los perfiles
import markArbol from '../assets/logos/trim/arbol.webp';
import markAside from '../assets/logos/trim/aside.webp';
import markCasm from '../assets/logos/trim/casm.webp';
import markCodemussba from '../assets/logos/trim/codemussba.webp';
import markIcf from '../assets/logos/trim/icf.webp';

export interface Photo {
  src: string;
  srcSet: string;
  width: number;
  height: number;
  alt: string;
  /** encuadre en los recortes (object-position), si no basta el centro */
  focus?: string;
}

export interface Mark {
  src: string;
  width: number;
  height: number;
}

export interface OrgProfile {
  id: string;                        // ancla en la página (#aside, #casm…)
  acronym: string;
  name: string;                      // denominación oficial, tal como debe publicarse
  meta: string[];                    // datos breves bajo el nombre
  summary: string;                   // presentación institucional breve
  website: { href: string; label: string };
  /** cifra destacada, solo si consta en los documentos de la organización */
  figure?: { value: string; label: string };
  /** declaraciones institucionales (misión, enfoque…); `quoted` si el texto es literal del documento */
  statements?: { label: string; text: string; quoted?: boolean }[];
  areas: { title: string; items: string[] };
  /** lista secundaria (áreas protegidas, territorio, ejes…); `highlight` marca el ítem de PANAMOSAB */
  extra: { title: string; items: string[]; highlight?: string };
  /** responsabilidades que el convenio asigna a la organización */
  role: { title: string; source: string; items: string[] };
  photos?: { main: Photo; detail: Photo; credit: string };
}

export const COMANEJO = {
  eyebrow: 'Comanejo',
  // título de la página: dos frases, una por línea
  title: ['Cinco instituciones.', 'Un compromiso con la montaña.'],
  homeTitle: 'Cinco instituciones, una misma montaña.',
  // [CONV] portada, encabezado, cláusulas segunda, tercera (resp. conjuntas 1 y 23) y duodécima
  lead:
    'La conservación del Parque Nacional Montaña de Santa Bárbara es una tarea compartida. Desde enero de 2026, ' +
    'el Instituto Nacional de Conservación y Desarrollo Forestal, Áreas Protegidas y Vida Silvestre (ICF) y cuatro ' +
    'organizaciones gestionan juntos el parque mediante un convenio de comanejo.',
  body:
    'Cada institución designa un enlace ante el Comité Técnico de Comanejo, presidido por el ICF, que planifica y da ' +
    'seguimiento al manejo del área en los municipios de Las Vegas, Concepción Sur, Gualala y Santa Bárbara.',
  // portada: invitación a la página de comanejo
  teaser:
    'Conoce a las organizaciones que forman la alianza, su trabajo y las responsabilidades que asumen en el parque.',
  // [CONV] cláusula segunda (cita textual del objetivo de manejo)
  aim: {
    label: 'Objetivo de manejo',
    text:
      'Asegurar a perpetuidad la conservación del recurso (bosque, agua, suelo y fauna) existentes en la Montaña de ' +
      'Santa Bárbara a fin de mantener su capacidad de generación de bienes y servicios ecosistémicos para beneficio ' +
      'de las presentes y futuras generaciones.',
    attribution: 'Objetivo de manejo de la Montaña de Santa Bárbara, citado en el convenio de comanejo',
    source: 'Convenio de comanejo · cláusula segunda',
    // fragmento del texto que se destaca con color (el texto no cambia)
    emphasis: '(bosque, agua, suelo y fauna)',
  },
  // [CONV] página 10 y cláusula duodécima. La cifra va grande; el complemento, a su lado
  facts: [
    { value: '13', unit: 'de enero de 2026', label: 'Firma del convenio' },
    { value: '5', unit: 'años', label: 'Vigencia del convenio' },
    { value: '5', unit: 'instituciones', label: 'Firmantes del convenio' },
  ],
  signatoriesTitle: 'Instituciones firmantes del convenio',
  sources:
    'Fuentes: Convenio para el co-manejo del Parque Nacional Montaña de Santa Bárbara (13 de enero de 2026); ' +
    'presentación institucional de ASIDE (2026); documento institucional de CASM; sitio institucional de ' +
    'Árbol de Misericordia (arboldemisericordia.org).',
};

// [CONV] encabezado: denominaciones de las cinco partes firmantes
export const SIGNATORIES: { acronym: string; name: string; logo: string; mark: Mark; profileId?: string }[] = [
  { acronym: 'ICF', name: 'Instituto Nacional de Conservación y Desarrollo Forestal, Áreas Protegidas y Vida Silvestre', logo: logoIcf, mark: { src: markIcf, width: 408, height: 191 } },
  { acronym: 'ASIDE', name: 'Asociación de Investigación para el Desarrollo Ecológico y Socioeconómico', logo: logoAside, mark: { src: markAside, width: 409, height: 312 }, profileId: 'aside' },
  { acronym: 'CASM', name: 'Comisión de Acción Social Menonita', logo: logoCasm, mark: { src: markCasm, width: 375, height: 460 }, profileId: 'casm' },
  { acronym: 'CODEMUSSBA', name: 'Consejo de Municipios del Sur de Santa Bárbara', logo: logoCodemussba, mark: { src: markCodemussba, width: 519, height: 153 } },
  { acronym: 'Árbol de Misericordia', name: 'Organización Árbol de Misericordia', logo: logoArbol, mark: { src: markArbol, width: 614, height: 239 }, profileId: 'arbol' },
];

export const markOf = (id: string) => SIGNATORIES.find((s) => s.profileId === id)!.mark;

const photo = (src1: string, src2: string, w1: number, w2: number, width: number, height: number, alt: string): Photo => ({
  src: src1, srcSet: `${src2} ${w2}w, ${src1} ${w1}w`, width, height, alt,
});

export const PROFILES: OrgProfile[] = [
  {
    id: 'aside',
    acronym: 'ASIDE',
    name: 'ASOCIACIÓN DE INVESTIGACIÓN PARA EL DESARROLLO ECOLÓGICO Y SOCIOECONÓMICO',
    meta: ['Personalidad jurídica publicada en 1994', 'Sede principal en El Progreso, Yoro'],             // [ASIDE] 2 y 3
    summary:
      'Organización no gubernamental sin fines de lucro dedicada a la investigación ambiental y socioeconómica, ' +
      'y al desarrollo de programas y proyectos sociales en Honduras.',                                     // [ASIDE] 2
    website: { href: 'https://www.asidehonduras.org', label: 'asidehonduras.org' },                        // [ASIDE] 8
    figure: {                                                                                              // [ASIDE] 6
      value: '79',
      label: 'sistemas de agua potable diseñados, construidos o mejorados para unas 140 comunidades urbanas y rurales',
    },
    areas: {                                                                                               // [ASIDE] 4
      title: 'Líneas de trabajo',
      items: ['Áreas protegidas y medio ambiente', 'Agua y saneamiento', 'Brigadas médicas', 'Donaciones'],
    },
    extra: {                                                                                               // [ASIDE] 5
      title: 'Intervención y comanejo en áreas protegidas',
      items: [
        'Refugio de Vida Silvestre Colibrí Esmeralda Hondureño',
        'Reserva Biológica Montecillos',
        'Refugio de Vida Silvestre Laguna de Guaimoreto',
        'Parque Nacional Capiro y Calentura',
        'Parque Nacional Montaña de Santa Bárbara',
        'Refugio de Vida Silvestre Montaña de Mico Quemado',
        'Cuenca del Lago de Yojoa',
      ],
      highlight: 'Parque Nacional Montaña de Santa Bárbara',
    },
    role: {                                                                                                // [CONV] cl. 3.ª, ASIDE 1–6
      title: 'Su papel en PANAMOSAB',
      source: 'Responsabilidades asignadas a ASIDE en el convenio de comanejo (cláusula tercera).',
      items: [
        'Disponer de una estructura técnica y administrativa para el control, manejo y administración del área protegida.',
        'Identificar y gestionar recursos nacionales o extranjeros para el manejo del área.',
        'Gestionar el programa de investigación y los demás planes específicos del plan de manejo.',
        'Mantener informadas a las comunidades y organizaciones locales sobre el proceso de manejo.',
        'Presentar el informe bianual de resultados e involucrar a los demás firmantes en las propuestas de proyectos.',
      ],
    },
    photos: {                                                                                              // [ASIDE] 5
      main: photo(asideCampo1280, asideCampo720, 1280, 720, 1280, 576,
        'Técnicos de ASIDE reunidos con jóvenes y familias de una comunidad en un claro rodeado de bosque.'),
      detail: photo(asideBosque934, asideBosque560, 934, 560, 934, 700,
        'Ave posada en una rama cubierta de musgo y plantas epífitas.'),
      credit: 'Fotografías: ASIDE, de su trabajo en áreas protegidas y medio ambiente.',
    },
  },
  {
    id: 'casm',
    acronym: 'CASM',
    name: 'Comisión de Acción Social Menonita',
    meta: ['Organización cristiana de desarrollo', 'Fundada en 1983'],                                     // [CONV] p. 2
    summary:
      // [CONV] p. 2 (origen) · [CASM] componentes del desarrollo organizacional
      'Nació en el seno de la Iglesia Evangélica Menonita Hondureña y trabaja en el desarrollo humano integral con ' +
      'enfoque de autogestión, fortaleciendo los procesos de desarrollo local y regional.',
    website: { href: 'https://casm.hn', label: 'casm.hn' },
    statements: [
      {                                                                                                    // [CASM] misión (textual)
        label: 'Misión',
        text:
          'CASM fortalece capacidades de autogestión a titulares de derechos como familias y organizaciones sociales, ' +
          'que buscan hacer frente a la injusticia económica, social, ambiental, tecnológica y política.',
        quoted: true,
      },
      {                                                                                                    // [CASM] visión
        label: 'Enfoque',
        text: 'Desarrollo humano integral con enfoque de derechos, equidad de género, etario y multicultural.',
      },
      {                                                                                                    // [CASM] valores (textual)
        label: 'Mayordomía de la creación',
        text:
          'Como organización cristiana promovemos en todas nuestras acciones el cuidado y protección de los recursos ' +
          'naturales y ambiente, buscando en todo momento que ninguna acción afecte los mismos.',
        quoted: true,
      },
    ],
    areas: {                                                                                               // [CASM] componentes y líneas 1.1, 1.4, 1.7
      title: 'Líneas de trabajo',
      items: [
        'Fortalecimiento de organizaciones de la sociedad civil',
        'Manejo sostenible de los recursos naturales y gestión de riesgos',
        'Adaptación al cambio climático y desarrollo económico local',
        'Cultura de paz y mediación de conflictos',
      ],
    },
    extra: {                                                                                               // [CONV] p. 2
      title: 'Departamentos donde concentra su trabajo',
      items: ['Copán', 'Lempira', 'Cortés', 'Colón', 'Gracias a Dios', 'Santa Bárbara'],
      highlight: 'Santa Bárbara',
    },
    role: {                                                                                                // [CONV] cl. 3.ª, CASM 1–5
      title: 'Su papel en PANAMOSAB',
      source: 'Responsabilidades asignadas a CASM en el convenio de comanejo (cláusula tercera).',
      items: [
        'Gestionar, organizar y brindar los medios de verificación para evaluar la efectividad de manejo del área protegida.',
        'Elaborar su Plan Operativo Anual o Bianual, base del plan conjunto del área y del plan de acción de comanejo.',
        'Asesorar a las municipalidades para fortalecer el Programa Nacional de Guarda Recursos del SINAPH.',
        'Asegurar el involucramiento de las comunidades en los proyectos y subvenciones que se ejecutan en el área.',
        'Apoyar el fortalecimiento de capacidades de organizaciones locales y comunidades dentro del área protegida.',
      ],
    },
  },
  {
    id: 'arbol',
    acronym: 'Árbol de Misericordia',
    name: 'Organización Árbol de Misericordia',
    meta: ['Fundada el 5 de noviembre de 2012', 'Sede en Peña Blanca, región del Lago de Yojoa'],          // [OADM]
    summary:
      // [OADM] descripción institucional · [CONV] p. 2 (finalidad)
      'Organización sin fines de lucro dedicada al desarrollo sostenible y a la mejora de la calidad de vida en la ' +
      'región del Lago de Yojoa. Su finalidad es promover el desarrollo humano como modelo de participación ' +
      'popular, dotando a la población de herramientas para adquirir nuevos conocimientos y habilidades.',
    website: { href: 'https://arboldemisericordia.org', label: 'arboldemisericordia.org' },               // [OADM]
    figure: {                                                                                              // [OADM] cifras, abril de 2026
      value: '500,000+',
      label: 'árboles sembrados desde 2013, según los datos de la organización (abril de 2026)',
    },
    statements: [
      {                                                                                                    // [OADM] misión (textual)
        label: 'Misión',
        text:
          'Generar capacidades locales potenciando agentes de cambio a través de acciones integrales que contribuyan ' +
          'al mejoramiento de la calidad de vida mediante la intervención en líneas estratégicas que impulsen el ' +
          'desarrollo local sostenible de la región del Lago de Yojoa.',
        quoted: true,
      },
      {                                                                                                    // [OADM] visión (textual)
        label: 'Visión',
        text: 'Ser una organización líder en el manejo, protección y desarrollo sostenible en la región del Lago de Yojoa y zonas de influencia.',
        quoted: true,
      },
    ],
    areas: {                                                                                               // [CONV] p. 2
      title: 'Énfasis de su trabajo',
      items: [
        'Capacidades de grupos de mujeres',
        'Fortalecimiento de las juntas administradoras de agua',
        'Protección de las fuentes de agua',
        'Recuperación de la cobertura boscosa en zonas productoras de agua',
        'Iniciativas empresariales para grupos comunitarios',
        'Alianzas público-privadas para el manejo sostenible de los recursos naturales',
      ],
    },
    extra: {                                                                                               // [CONV] p. 2
      title: 'Ejes de acción',
      items: ['Salud', 'Medio ambiente', 'Educación', 'Vivienda'],
    },
    role: {                                                                                                // [CONV] cl. 3.ª, Árbol de Misericordia 1–5
      title: 'Su papel en PANAMOSAB',
      source: 'Responsabilidades asignadas a Árbol de Misericordia en el convenio de comanejo (cláusula tercera).',
      items: [
        'Disponer de personal técnico y administrativo para la protección y el manejo del área protegida, incluida la emisión de políticas locales con ese fin.',
        'Identificar y gestionar recursos nacionales o externos para el manejo del área, de acuerdo con el convenio, el plan de manejo y los planes operativos.',
        'Promover programas de sensibilización y educación ambiental con líderes comunitarios, productores, grupos de mujeres, patronatos y alumnos de centros educativos.',
        'Promover viveros para la producción de especies arbóreas nativas de bosque nublado.',
        'Apoyar procesos de fortalecimiento de capacidades a organizaciones locales y comunidades dentro del área protegida.',
      ],
    },
    photos: {                                                                                              // [OADM]
      main: {
        ...photo(arbolCampo1280, arbolCampo720, 1280, 720, 1280, 729,
          'Un hombre y una niña de un centro de educación básica siembran juntos un árbol joven en un campo; al fondo, otros estudiantes.'),
        focus: '58% 40%',
      },
      detail: photo(arbolVivero934, arbolVivero560, 934, 560, 934, 1245,
        'Vivero con hileras de plántulas de árboles en bolsas, bajo una malla de sombra.'),
      credit: 'Fotografías: Árbol de Misericordia, de su trabajo en reforestación y medio ambiente.',
    },
  },
];
