/* Contenido de la página «El Parque». Fuente: Plan de Manejo del Parque Nacional Montaña de Santa Bárbara
   2018–2029 (recursos/), resumen ejecutivo (p. 7) y antecedentes (p. 8). */

export const PARQUE = {
  eyebrow: 'El Parque',
  title: 'Una montaña que protege vida.',
  // p. 7
  lead:
    'El Parque Nacional Montaña de Santa Bárbara forma parte del Sistema Nacional de Áreas Protegidas y Vida ' +
    'Silvestre de Honduras (SINAPH). Resguarda uno de los picos más altos del país y brinda servicios ' +
    'ecosistémicos de gran importancia: agua, conservación de flora y fauna, y belleza escénica.',
  // la altitud va sobre el mapa de 01 (marca de la cumbre), no en la lista
  summit: { value: '2,744', unit: 'msnm', label: 'Cumbre', note: 'La segunda más alta de Honduras' },  // p. 7
  facts: [
    { value: '87-87', label: 'Decreto de creación: Ley de los Bosques Nublados' },                      // p. 7–8
  ],
  // la superficie se presenta en 02 El Territorio, en grande
  area: { value: 13942.17, unit: 'hectáreas', label: 'Superficie del área protegida' },                  // p. 7
  zones: {                                                                                              // p. 7–8
    eyebrow: 'Cómo se protege',
    title: 'Un bosque protegido por zonas.',
    body:
      'El área protegida se divide en una zona núcleo y una zona de amortiguamiento. Por el este, la zona de ' +
      'amortiguamiento se traslapa con el área protegida Cuenca del Lago de Yojoa.',
    total: 13942.17,
    items: [
      {
        name: 'Zona núcleo', ha: 6280.29,
        text: 'Comprende desde la cumbre hasta la cota de 1,800 msnm como mínimo.',
      },
      {
        name: 'Zona de amortiguamiento', ha: 7661.88,
        text: 'Una franja de al menos 2 km alrededor de la zona núcleo, cuya función es protegerla.',
        sub: ['Subzona de uso restringido', 'Subzona de recuperación', 'Subzona de uso sostenible de recursos naturales'],
      },
    ],
  },
  map: {
    alt:
      'Mapa del macizo de Santa Bárbara con curvas de nivel. En el centro, la zona núcleo, en verde, rodea la ' +
      'cumbre por encima de los 1,800 metros; a su alrededor, una franja dorada de 2 km marca la zona de ' +
      'amortiguamiento.',
    legendLines: 'Curvas de nivel cada 100 m',
    caption:
      'Ilustración: zonas trazadas sobre el modelo de elevación AWS Terrain Tiles según su definición en el Plan de ' +
      'Manejo (zona núcleo por encima de los 1,800 msnm y franja de 2 km). No representa los límites oficiales; ' +
      'las superficies indicadas son las oficiales.',
  },
  water: {                                                                                              // p. 7
    eyebrow: 'Agua',
    title: 'Agua para cuatro municipios.',
    body:
      'Entre los servicios ecosistémicos que brinda la montaña está el abastecimiento de agua a los municipios de ' +
      'Las Vegas, Santa Bárbara, Concepción Sur y Gualala.',
    places: ['Las Vegas', 'Santa Bárbara', 'Concepción Sur', 'Gualala'],
  },
  sources:
    'Fuente: Plan de Manejo del Parque Nacional Montaña de Santa Bárbara 2018–2029 (resumen ejecutivo y antecedentes).',
};
