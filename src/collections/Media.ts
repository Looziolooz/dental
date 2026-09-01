import type { CollectionConfig } from 'payload'

export const Media: CollectionConfig = {
  slug: 'media',
  labels: { singular: 'File', plural: 'Media' },
  admin: { group: 'Contenuti' },
  access: { read: () => true },
  upload: true,
  fields: [{ name: 'alt', type: 'text', label: 'Testo alternativo', required: true }],
}
