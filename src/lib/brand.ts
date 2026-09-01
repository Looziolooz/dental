/**
 * Identità dello studio, in un posto solo.
 *
 * Il nome è un segnaposto neutro per la demo: cambiando questi valori cambiano
 * logo, titoli delle pagine, footer, contatti e il suffisso dell'admin Payload,
 * senza toccare nessun componente.
 */
export const BRAND = {
  /** Le due righe del logo, impilate stretto. Tienile di lunghezza simile. */
  logoTop: 'Aura',
  logoBottom: 'Dental',
  /** Nome esteso, per i titoli delle pagine. */
  name: 'Aura Dental',
  tagline: 'odontoiatria e igiene',
  claim: 'Studio dentistico a Milano',
  city: 'Milano',
  phone: '+39 02 1234 5678',
  phoneHref: 'tel:+390212345678',
  email: 'info@auradental.it',
  hours: 'Lun–Ven 09:00–18:00',
} as const

/** Titolo di una pagina, col nome dello studio in coda. */
export const pageTitle = (label?: string) =>
  label ? `${label} — ${BRAND.name}` : `${BRAND.name} — ${BRAND.claim}`
