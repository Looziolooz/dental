import type { CollectionConfig } from 'payload'

export const Patients: CollectionConfig = {
  slug: 'patients',
  labels: { singular: 'Paziente', plural: 'Pazienti' },
  admin: {
    useAsTitle: 'fullName',
    defaultColumns: ['fullName', 'email', 'phone', 'createdAt'],
    group: 'Clinica',
  },
  fields: [
    {
      name: 'fullName',
      type: 'text',
      label: 'Nome e cognome',
      required: true,
      index: true,
    },
    { name: 'email', type: 'email', label: 'Email', required: true, index: true },
    { name: 'phone', type: 'text', label: 'Telefono', required: true },
    { name: 'birthDate', type: 'date', label: 'Data di nascita' },
    {
      name: 'notes',
      type: 'textarea',
      label: 'Note cliniche',
      admin: { description: 'Allergie, terapie in corso, anamnesi rilevante.' },
    },
    {
      name: 'source',
      type: 'select',
      label: 'Acquisito da',
      defaultValue: 'online',
      options: [
        { label: 'Sito web', value: 'online' },
        { label: 'Telefono', value: 'phone' },
        { label: 'Passaparola', value: 'referral' },
        { label: 'Walk-in', value: 'walk_in' },
      ],
    },
  ],
}
