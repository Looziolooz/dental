import type { CollectionConfig } from 'payload'

/** Odontoiatri: una colonna del calendario ciascuno. */
export const Dentists: CollectionConfig = {
  slug: 'dentists',
  labels: { singular: 'Odontoiatra', plural: 'Odontoiatri' },
  admin: { useAsTitle: 'name', defaultColumns: ['name', 'role', 'active'], group: 'Clinica' },
  access: { read: () => true },
  fields: [
    { name: 'name', type: 'text', label: 'Nome', required: true },
    { name: 'role', type: 'text', label: 'Specializzazione', required: true },
    {
      name: 'color',
      type: 'select',
      label: 'Colore in agenda',
      defaultValue: 'slate',
      options: [
        { label: 'Ardesia', value: 'slate' },
        { label: 'Ambra', value: 'amber' },
        { label: 'Smeraldo', value: 'emerald' },
        { label: 'Indaco', value: 'indigo' },
        { label: 'Rosa', value: 'rose' },
      ],
    },
    { name: 'bio', type: 'textarea', label: 'Bio' },
    {
      name: 'workingDays',
      type: 'select',
      label: 'Giorni lavorativi',
      hasMany: true,
      defaultValue: ['1', '2', '3', '4', '5'],
      options: [
        { label: 'Lunedì', value: '1' },
        { label: 'Martedì', value: '2' },
        { label: 'Mercoledì', value: '3' },
        { label: 'Giovedì', value: '4' },
        { label: 'Venerdì', value: '5' },
        { label: 'Sabato', value: '6' },
      ],
    },
    { name: 'active', type: 'checkbox', label: 'In servizio', defaultValue: true },
  ],
}
