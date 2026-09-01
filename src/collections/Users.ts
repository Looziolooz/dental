import type { CollectionConfig } from 'payload'

/** Staff della clinica che accede al gestionale. */
export const Users: CollectionConfig = {
  slug: 'users',
  labels: { singular: 'Utente', plural: 'Utenti' },
  admin: { useAsTitle: 'name', defaultColumns: ['name', 'email', 'role'], group: 'Clinica' },
  auth: true,
  fields: [
    { name: 'name', type: 'text', label: 'Nome', required: true },
    {
      name: 'role',
      type: 'select',
      label: 'Ruolo',
      defaultValue: 'staff',
      required: true,
      options: [
        { label: 'Amministratore', value: 'admin' },
        { label: 'Segreteria', value: 'staff' },
        { label: 'Odontoiatra', value: 'dentist' },
      ],
    },
  ],
}
