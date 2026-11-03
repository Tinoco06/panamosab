/* Contenido de la sección «Comanejo». Cada texto indica su fuente (documentos en recursos/):
     [CONV]  Convenio para el co-manejo del PANAMOSAB, firmado el 13 de enero de 2026 (PDF escaneado)
     [ASIDE] Presentación institucional «ASIDE - 2026.pptx»
     [CASM]  Documento institucional «CASM.docx»
   Para sumar una organización: añadir su perfil a PROFILES y su id en la lista de firmantes (profileId).
   Solo se publican perfiles con información respaldada; un firmante sin perfil aparece únicamente por su
   nombre en la lista de firmantes. */
import asideCampo720 from '../assets/comanejo/aside-campo-720.jpg';
import asideCampo1280 from '../assets/comanejo/aside-campo-1280.jpg';
import asideBosque560 from '../assets/comanejo/aside-bosque-560.jpg';
import asideBosque934 from '../assets/comanejo/aside-bosque-934.jpg';
import asideLogo from '../assets/comanejo/aside-logo.png';
// tarjetas de logotipo para el carrusel de la portada (fuentes de cada logotipo en el README)
import logoArbol from '../assets/logos/arbol.webp';
import logoAside from '../assets/logos/aside.webp';
import logoCasm from '../assets/logos/casm.webp';
import logoCodemussba from '../assets/logos/codemussba.webp';
import logoIcf from '../assets/logos/icf.webp';

export interface Photo {
  src: string;
  srcSet: string;
  width: number;
  height: number;
  alt: string;
}

export interface OrgProfile {
  id: string;                        // ancla en la página (#aside, #casm…)
  acronym: string;
  name: string;                      // denominación oficial, tal como debe publicarse
  meta: string[];                    // datos breves bajo el nombre
  summary: string;
  logo?: { src: string; alt: string; width: number; height: number };
  website?: { href: string; label: string };
  areas: { title: string; items: string[] };
  /** lista secundaria opcional (áreas protegidas, territorio…); `highlight` marca el ítem de PANAMOSAB */
  extra?: { title: string; items: string[]; highlight?: string };
  /** responsabilidades que el convenio asigna a la organización */
  role: { title: string; source: string; items: string[] };
  /** con fotografías el perfil se compone alrededor de la imagen; sin ellas, de una cita institucional */
  photos?: { main: Photo; detail?: Photo; credit: string };
  quote?: { text: string; attribution: string };
}

export const COMANEJO = {
  eyebrow: 'Comanejo',
  title: 'Una montaña que se cuida en alianza.',
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
    text:
      'Asegurar a perpetuidad la conservación del recurso (bosque, agua, suelo y fauna) existentes en la Montaña de ' +
      'Santa Bárbara a fin de mantener su capacidad de generación de bienes y servicios ecosistémicos para beneficio ' +
      'de las presentes y futuras generaciones.',
    attribution: 'Objetivo de manejo de la Montaña de Santa Bárbara, citado en el convenio de comanejo',
  },
  // [CONV] página 10 y cláusula duodécima
  facts: [
    { value: '13.01.2026', label: 'Firma del convenio' },
    { value: '5 años', label: 'Vigencia del convenio' },
    { value: '5', label: 'Instituciones firmantes' },
  ],
  sources:
    'Fuentes: Convenio para el co-manejo del Parque Nacional Montaña de Santa Bárbara (13 de enero de 2026); ' +
    'presentación institucional de ASIDE (2026); documento institucional de CASM.',
};

// [CONV] encabezado: denominaciones de las cinco partes firmantes
export const SIGNATORIES: { acronym: string; name: string; logo: string; profileId?: string }[] = [
  { acronym: 'ICF', name: 'Instituto Nacional de Conservación y Desarrollo Forestal, Áreas Protegidas y Vida Silvestre', logo: logoIcf },
  { acronym: 'ASIDE', name: 'Asociación de Investigación para el Desarrollo Ecológico y Socioeconómico', logo: logoAside, profileId: 'aside' },
  { acronym: 'CASM', name: 'Comisión de Acción Social Menonita', logo: logoCasm, profileId: 'casm' },
  { acronym: 'CODEMUSSBA', name: 'Consejo de Municipios del Sur de Santa Bárbara', logo: logoCodemussba },
  { acronym: 'Árbol de Misericordia', name: 'Organización Árbol de Misericordia', logo: logoArbol },
];

const photo = (src1: string, src2: string, w1: number, w2: number, width: number, height: number, alt: string): Photo => ({
  src: src1, srcSet: `${src2} ${w2}w, ${src1} ${w1}w`, width, height, alt,
});

export const PROFILES: OrgProfile[] = [
  {
    id: 'aside',
    acronym: 'ASIDE',
    name: 'ASOCIACIÓN DE INVESTIGACIÓN PARA EL DESARROLLO ECOLÓGICO Y SOCIOECONÓMICO',
    meta: ['Organización no gubernamental', 'Sede principal en El Progreso, Yoro'],                    // [ASIDE] 2 y 3
    summary:
      'Organización no gubernamental sin fines de lucro dedicada a la investigación ambiental y socioeconómica, ' +
      'y al desarrollo de programas y proyectos sociales en Honduras.',                                     // [ASIDE] 2
    logo: { src: asideLogo, alt: 'Logotipo de ASIDE', width: 240, height: 184 },                           // [ASIDE] 1
    website: { href: 'https://www.asidehonduras.org', label: 'asidehonduras.org' },                        // [ASIDE] 8
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
    name: 'Comisión de Acción Social Menonita (CASM)',
    meta: ['Organización cristiana de desarrollo', 'Fundada en 1983'],                                     // [CONV] p. 2
    summary:
      // [CONV] p. 2 (origen) · [CASM] misión y visión, sintetizadas
      'Nació en 1983 en el seno de la Iglesia Evangélica Menonita Hondureña. Fortalece las capacidades de autogestión ' +
      'de familias y organizaciones sociales que buscan hacer frente a la injusticia económica, social, ambiental, ' +
      'tecnológica y política, desde el desarrollo humano integral y un enfoque de derechos, equidad de género, ' +
      'generacional y multicultural.',
    website: { href: 'https://casm.hn', label: 'casm.hn' },
    areas: {                                                                                               // [CASM] componentes y líneas 1.1, 1.4, 1.7
      title: 'Líneas de trabajo',
      items: [
        'Desarrollo humano integral y autogestión',
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
    quote: {                                                                                               // [CASM] valores (cita textual)
      text:
        'Como organización cristiana promovemos en todas nuestras acciones el cuidado y protección de los recursos ' +
        'naturales y ambiente, buscando en todo momento que ninguna acción afecte los mismos.',
      attribution: 'Mayordomía de la creación, uno de los valores de CASM',
    },
  },
];
