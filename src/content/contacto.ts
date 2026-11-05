/* Contenido de la página «Contacto». El parque no publica canales propios (teléfono, correo, redes sociales ni
   formulario): la página remite a los sitios oficiales de las instituciones que lo comanejan. */
import { PROFILES, SIGNATORIES } from './comanejo';

export const CONTACTO = {
  eyebrow: 'Contacto',
  title: ['Hablemos de', 'la montaña.'],
  lead:
    'El Parque Nacional Montaña de Santa Bárbara se gestiona mediante un convenio de comanejo entre cinco ' +
    'instituciones. Para comunicarte con ellas, visita sus sitios oficiales.',

  orgsTitle: 'Sitios oficiales',
  // nombre y logotipo de la franja de firmantes; dirección del perfil de cada institución
  orgs: PROFILES.map((p) => {
    const s = SIGNATORIES.find((x) => x.profileId === p.id);
    return { id: p.id, acronym: p.acronym, name: s?.name ?? p.name, mark: s?.mark, href: p.website.href, label: p.website.label };
  }),
};
