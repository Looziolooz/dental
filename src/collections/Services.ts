import type { CollectionConfig } from 'payload'

/** Prestazioni offerte: guidano durata dello slot, prezzo di listino e la pagina pubblica. */
export const Services: CollectionConfig = {
  slug: 'services',
  labels: { singular: 'Prestazione', plural: 'Prestazioni' },
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'durationMinutes', 'priceEur', 'active'],
    group: 'Clinica',
  },
  access: { read: () => true },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Prenotazione',
          description: 'Questi campi governano il calendario e il listino.',
          fields: [
            { name: 'name', type: 'text', label: 'Nome', required: true },
            {
              name: 'slug',
              type: 'text',
              label: 'Slug',
              required: true,
              unique: true,
              admin: { description: 'Identificativo usato negli URL: /servizi/<slug>' },
            },
            {
              name: 'durationMinutes',
              type: 'number',
              label: 'Durata (minuti)',
              required: true,
              defaultValue: 30,
              min: 15,
              max: 480,
              admin: { description: 'Determina la lunghezza dello slot nel calendario.' },
            },
            { name: 'priceEur', type: 'number', label: 'Prezzo (€)', required: true, min: 0 },
            { name: 'active', type: 'checkbox', label: 'Prenotabile online', defaultValue: true },
          ],
        },
        {
          label: 'Pagina pubblica',
          description: 'Contenuto di /servizi e /servizi/<slug>.',
          fields: [
            {
              name: 'description',
              type: 'textarea',
              label: 'Descrizione breve',
              admin: { description: 'Una riga. Compare nella card dell\'elenco e nel wizard di prenotazione.' },
            },
            {
              name: 'intro',
              type: 'textarea',
              label: 'Introduzione',
              admin: { description: 'Due o tre frasi in cima alla pagina della prestazione.' },
            },
            {
              name: 'image',
              type: 'upload',
              relationTo: 'media',
              label: 'Immagine',
              admin: {
                description:
                  'Facoltativa. Se vuota, la pagina usa l\'immagine di riserva associata allo slug.',
              },
            },
            {
              name: 'benefits',
              type: 'array',
              label: 'Benefici',
              labels: { singular: 'Beneficio', plural: 'Benefici' },
              fields: [
                { name: 'title', type: 'text', label: 'Titolo', required: true },
                { name: 'text', type: 'textarea', label: 'Testo', required: true },
              ],
            },
            {
              name: 'steps',
              type: 'array',
              label: 'Come si svolge',
              labels: { singular: 'Fase', plural: 'Fasi' },
              fields: [
                { name: 'title', type: 'text', label: 'Titolo', required: true },
                { name: 'text', type: 'textarea', label: 'Testo', required: true },
              ],
            },
            {
              name: 'faq',
              type: 'array',
              label: 'Domande frequenti',
              labels: { singular: 'Domanda', plural: 'Domande' },
              fields: [
                { name: 'question', type: 'text', label: 'Domanda', required: true },
                { name: 'answer', type: 'textarea', label: 'Risposta', required: true },
              ],
            },
          ],
        },
      ],
    },
  ],
}
