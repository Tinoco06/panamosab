/* Contenido de la sección «Comanejo». Cada texto indica su fuente (documentos en recursos/):
     [CONV]  Convenio para el co-manejo del PANAMOSAB, firmado el 13 de enero de 2026 (PDF escaneado)
     [ASIDE] Presentación institucional «ASIDE - 2026.pptx» (número de diapositiva)
     [CASM]  Documento institucional «CASM.docx»
     [OADM]  Sitio institucional de Árbol de Misericordia (arboldemisericordia.org; textos y fotografías)
     [ICF]   Sitio oficial icf.gob.hn: «Quiénes somos», «Áreas protegidas», «Vida silvestre», «Reforestación» (consulta 03/11/2026)
     [COD]   Sitio oficial codemussba.org: «Historia», «Filosofía», «Municipios», «Unidades» (consulta 03/11/2026)
     [PM26]  Plan de Manejo PANAMOSAB 2026–2038, borrador
   Investigación completa, con URL de cada fuente: docs/INSTITUTIONAL_RESEARCH_ICF_CODEMUSSBA.md
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
// logotipos oficiales descargados de los sitios de cada institución, para su perfil
import officialCodemussba from '../assets/logos/official/codemussba.webp';
import officialIcf from '../assets/logos/official/icf.webp';
import { photo, type Photo } from './media';

export type { Photo };

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
  /** lista secundaria (áreas protegidas, territorio, ejes…); `highlight` marca los ítems de PANAMOSAB */
  extra: { title: string; items: string[]; highlight?: string | string[]; note?: string };
  /** logotipo oficial propio del perfil (si no, el de la franja); `onDark`: versión para fondo oscuro */
  logo?: Mark & { onDark?: boolean; credit?: string };
  /** responsabilidades que el convenio asigna a la organización */
  role: { title: string; source: string; items: string[] };
  photos?: { main: Photo; detail: Photo; credit: string };
}

export const COMANEJO = {
  eyebrow: 'Comanejo',
  // título de la página: dos frases, una por línea
  title: ['Cinco instituciones.', 'Un compromiso con la montaña.'],
  // portada (05): dos frases, una por línea; la segunda se destaca
  homeTitle: ['Cinco instituciones,', 'una misma montaña.'],
  // [CONV] portada, encabezado, cláusulas segunda, tercera (resp. conjuntas 1 y 23) y duodécima
  lead:
    'La conservación del Parque Nacional Montaña de Santa Bárbara es una tarea compartida. Desde enero de 2026, ' +
    'el Instituto Nacional de Conservación y Desarrollo Forestal, Áreas Protegidas y Vida Silvestre (ICF) y cuatro ' +
    'organizaciones gestionan juntos el parque mediante un convenio de comanejo.',
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
    'presentación institucional de ASIDE (2026); documento institucional de CASM; sitios oficiales del ICF ' +
    '(icf.gob.hn), CODEMUSSBA (codemussba.org) y Árbol de Misericordia (arboldemisericordia.org); Plan de Manejo ' +
    'PANAMOSAB 2026–2038 (borrador).',
};

// [CONV] encabezado: denominaciones de las cinco partes firmantes
export const SIGNATORIES: { acronym: string; name: string; logo: string; mark: Mark; profileId?: string }[] = [
  { acronym: 'ICF', name: 'Instituto Nacional de Conservación y Desarrollo Forestal, Áreas Protegidas y Vida Silvestre', logo: logoIcf, mark: { src: markIcf, width: 408, height: 191 }, profileId: 'icf' },
  { acronym: 'ASIDE', name: 'Asociación de Investigación para el Desarrollo Ecológico y Socioeconómico', logo: logoAside, mark: { src: markAside, width: 409, height: 312 }, profileId: 'aside' },
  { acronym: 'CASM', name: 'Comisión de Acción Social Menonita', logo: logoCasm, mark: { src: markCasm, width: 375, height: 460 }, profileId: 'casm' },
  { acronym: 'CODEMUSSBA', name: 'Consejo de Municipios del Sur de Santa Bárbara', logo: logoCodemussba, mark: { src: markCodemussba, width: 519, height: 153 }, profileId: 'codemussba' },
  { acronym: 'Árbol de Misericordia', name: 'Organización Árbol de Misericordia', logo: logoArbol, mark: { src: markArbol, width: 614, height: 239 }, profileId: 'arbol' },
];

export const markOf = (id: string) => SIGNATORIES.find((s) => s.profileId === id)!.mark;

export const PROFILES: OrgProfile[] = [
  {
    id: 'icf',
    acronym: 'ICF',
    name: 'Instituto Nacional de Conservación y Desarrollo Forestal, Áreas Protegidas y Vida Silvestre',   // [CONV] encabezado
    meta: ['Organismo desconcentrado, adscrito a la Presidencia de la República', 'Ley Forestal, Áreas Protegidas y Vida Silvestre (Decreto 98-2007)'],  // [CONV] cl. 1.ª · [ICF] áreas protegidas
    summary:
      // [ICF] quiénes somos (misión, sintetizada)
      'Es la institución del Estado hondureño responsable de la administración y el manejo de los recursos ' +
      'forestales, las áreas protegidas y la vida silvestre, mediante instrumentos normativos y reguladores para ' +
      'su protección, restauración, aprovechamiento, fomento y conservación.',
    website: { href: 'https://icf.gob.hn/', label: 'icf.gob.hn' },
    logo: { src: officialIcf, width: 806, height: 371, onDark: true, credit: 'Logotipo oficial publicado en icf.gob.hn.' },
    figure: {                                                                                              // [ICF] áreas protegidas
      value: '93',
      label: 'áreas protegidas integran el Sistema Nacional de Áreas Protegidas de Honduras (SINAPH): 75 declaradas legalmente y 18 propuestas, según el ICF',
    },
    statements: [
      {                                                                                                    // [ICF] áreas protegidas (art. 111) · [CONV] cl. 1.ª
        label: 'Mandato',
        text:
          'La Ley Forestal, Áreas Protegidas y Vida Silvestre le encarga la administración de las áreas protegidas y ' +
          'de la vida silvestre del país, y le da la facultad de suscribir convenios de comanejo de esas áreas, como ' +
          'el de PANAMOSAB.',
      },
      {                                                                                                    // [ICF] quiénes somos (visión, textual)
        label: 'Visión',
        text:
          'Ser una institución líder a nivel nacional en la gestión de los bosques de Honduras, que contribuye al ' +
          'desarrollo socioeconómico del país, a la reducción de la vulnerabilidad ambiental ante el cambio climático, ' +
          'a promover la participación de las comunidades rurales en el manejo y conservación del bosque y a la ' +
          'provisión de medios de vida para la población hondureña.',
        quoted: true,
      },
      {                                                                                                    // [PM26] p. 3 · [CONV] resp. conjuntas
        label: 'En PANAMOSAB',
        text:
          'Desde la creación del parque, su administración ha estado a cargo del ICF. En el comanejo preside el ' +
          'Comité Técnico, que reúne a los enlaces de las cinco instituciones.',
      },
    ],
    areas: {                                                                                               // [ICF] secciones y programas del sitio
      title: 'Líneas de trabajo',
      items: [
        'Áreas protegidas: coordinación del SINAPH y supervisión de sus planes de manejo',
        'Vida silvestre: normas, monitoreo biológico, control y vigilancia',
        'Restauración de áreas degradadas: Programa Nacional de Reforestación',
        'Protección forestal y combate de incendios',
        'Manejo y desarrollo forestal comunitario',
      ],
    },
    extra: {                                                                                               // [ICF] áreas protegidas
      title: 'Áreas de conservación que coordina',
      items: ['Áreas protegidas del SINAPH', 'Reservas naturales privadas', 'Corredores biológicos', 'Reservas de biosfera', 'Sitios de patrimonio'],
    },
    role: {                                                                                                // [CONV] cl. 3.ª, ICF 1–11
      title: 'Su papel en PANAMOSAB',
      source: 'Responsabilidades asignadas al ICF en el convenio de comanejo (cláusula tercera).',
      items: [
        'Dar a conocer el convenio a organizaciones productivas, empresas, ONG e instituciones del Estado a nivel local, para coordinar los programas y proyectos del área.',
        'Dar a conocer las normas y lineamientos de manejo del área: regular las actividades prohibidas, controlar las permitidas y velar por que las actividades productivas cuenten con sus permisos.',
        'Apoyar y dictaminar las gestiones de los comanejadores para captar recursos locales, nacionales o internacionales para el manejo del área.',
        'Establecer cada año con los comanejadores, mediante el comité técnico, los planes operativos anuales de ejecución.',
        'Brindar acompañamiento técnico en gestión de la información para las auditorías técnicas y administrativas de las actividades en el área.',
        'Dar seguimiento a las propuestas de los comanejadores ante el Fondo para el Manejo de Áreas Protegidas y Vida Silvestre (FAPVS), el Programa Nacional de Reforestación y el Programa Nacional de Guarda Recursos.',
        'Gestionar con los comanejadores propuestas financieras para la regularización de la Montaña de Santa Bárbara.',
        'Coordinar el proceso legal y técnico de regularización del área, la titulación a favor del Estado de las áreas que correspondan y su inscripción en el Catálogo del Patrimonio Público Forestal Inalienable.',
        'Apoyar, supervisar y aprobar las declaratorias, delimitaciones y demarcaciones de la montaña y de sus microcuencas.',
        'Fortalecer a las Unidades Municipales Ambientales en el uso de las plataformas informativas del ICF.',
        'Conformar e integrar los Consejos Consultivos Forestales, Áreas Protegidas y Vida Silvestre en la jurisdicción de cada municipalidad.',
      ],
    },
  },
  {
    id: 'aside',
    acronym: 'ASIDE',
    name: 'ASOCIACIÓN DE INVESTIGACIÓN PARA EL DESARROLLO ECOLÓGICO Y SOCIOECONÓMICO',
    meta: ['Personalidad jurídica publicada en 1994', 'Sede principal en El Progreso, Yoro'],             // [ASIDE] 2 y 3
    summary:
      'Organización no gubernamental sin fines de lucro dedicada a la investigación ambiental y socioeconómica, ' +
      'y al desarrollo de programas y proyectos sociales en Honduras.',                                     // [ASIDE] 2
    website: { href: 'https://asidehonduras.org/', label: 'asidehonduras.org' },                        // [ASIDE] 8
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
    website: { href: 'https://casm.hn/quienes-somos/', label: 'casm.hn' },
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
    id: 'codemussba',
    acronym: 'CODEMUSSBA',
    name: 'Consejo de Municipios del Sur de Santa Bárbara',                                              // [CONV] encabezado
    meta: ['Mancomunidad de municipios', 'Sede en Santa Bárbara'],                                        // [COD] historia
    summary:
      // [CONV] p. 3 · [COD] historia, municipios y filosofía (objetivo general)
      'Mancomunidad que surgió en 2002 por iniciativa de alcaldes del sur de Santa Bárbara. Hoy la integran ocho ' +
      'municipios, que se organizan para gestionar proyectos conjuntos de desarrollo socioeconómico y humano.',
    website: { href: 'https://www.codemussba.org/', label: 'codemussba.org' },
    logo: { src: officialCodemussba, width: 470, height: 309, credit: 'Logotipo oficial publicado en codemussba.org.' },
    statements: [
      {                                                                                                    // [COD] filosofía (misión, textual)
        label: 'Misión',
        text:
          'Impulsar políticas de desarrollo colectivo y sostenible enmarcado en los principios de armonía, equidad de ' +
          'género y transparencia; con una amplia participación ciudadana, la articulación y coordinación interinstitucional.',
        quoted: true,
      },
      {                                                                                                    // [COD] filosofía (visión, textual)
        label: 'Visión',
        text:
          'Somos una entidad fortalecida institucionalmente, orgullosa de su identidad cultural, fortaleciendo el ' +
          'desarrollo humano auto sostenible, con capacidad técnica y administrativa, enfocados en sus propios ideales ' +
          'que favorecen el interés colectivo de los municipios que la integran.',
        quoted: true,
      },
    ],
    areas: {                                                                                               // [COD] filosofía (objetivos específicos) y unidades
      title: 'Líneas de trabajo',
      items: [
        'Protección y preservación de los recursos naturales',
        'Desarrollo productivo agropecuario y forestal sostenible',
        'Gestión de riesgo para reducir la vulnerabilidad ante desastres',
        'Ordenamiento territorial y catastro municipal',
        'Seguridad alimentaria y nutricional',
      ],
    },
    extra: {                                                                                               // [COD] municipios · [PM26] p. 1
      title: 'Municipios que la integran',
      items: ['Ceguaca', 'Concepción del Sur', 'Ilama', 'Las Vegas', 'San Pedro Zacapa', 'San Francisco de Ojuera', 'Santa Bárbara', 'Santa Rita'],
      highlight: ['Concepción del Sur', 'Las Vegas', 'Santa Bárbara'],
      note:
        'Marcados, los municipios de la mancomunidad que comprende el parque. PANAMOSAB se extiende también por ' +
        'Gualala, que no forma parte de CODEMUSSBA.',
    },
    role: {                                                                                                // [CONV] cl. 3.ª, CODEMUSSBA 1–11
      title: 'Su papel en PANAMOSAB',
      source: 'Responsabilidades asignadas a CODEMUSSBA en el convenio de comanejo (cláusula tercera).',
      items: [
        'Identificar y gestionar recursos nacionales o internacionales para el manejo del área protegida.',
        'Elaborar y presentar planes de actividades, operativos, anuales o bianuales, para ejecutarlos de forma conjunta ante los municipios con influencia en PANAMOSAB.',
        'Cumplir las políticas, leyes, reglamentos y lineamientos del ICF aplicables al comanejo, conforme al decreto de creación y al plan de manejo.',
        'Informar a las corporaciones municipales sobre los avances de los planes de actividades.',
        'Mantener informadas a las comunidades y organizaciones locales —juntas de agua, patronatos, cajas de ahorro y crédito, entre otras— para coordinar las actividades de manejo.',
        'Apoyar la conformación y el fortalecimiento de los consejos consultivos forestales, de áreas protegidas y vida silvestre a nivel comunitario y municipal.',
        'Disponer de personal técnico para la gestión de recursos externos.',
        'Disponer de una estructura administrativa para el control de los fondos destinados al área protegida.',
        'Presentar informes al ICF según lo establecido en el convenio.',
        'Gestionar ordenanzas en las corporaciones municipales de la mancomunidad para frenar el deterioro de los recursos naturales del área.',
        'Gestionar en asamblea general la contribución de los municipios de la mancomunidad para ejecutar los planes operativos del área.',
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
        ...photo(arbolCampo1280, arbolCampo720, 1280, 720, 1280, 713,
          'Tres estudiantes siembran juntos un árbol joven en el patio de su centro educativo.'),
        focus: '50% 60%',
      },
      detail: photo(arbolVivero934, arbolVivero560, 934, 560, 934, 1245,
        'Vivero con hileras de plántulas de árboles en bolsas, bajo una malla de sombra.'),
      credit: 'Fotografías: Árbol de Misericordia, de su trabajo en reforestación y medio ambiente.',
    },
  },
];
