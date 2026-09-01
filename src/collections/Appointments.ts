import type { CollectionConfig } from 'payload'

export const APPOINTMENT_STATUSES = [
  { label: 'Da confermare', value: 'pending' },
  { label: 'Confermato', value: 'confirmed' },
  { label: 'Completato', value: 'completed' },
  { label: 'Annullato', value: 'cancelled' },
  { label: 'Non presentato', value: 'no_show' },
] as const

export const Appointments: CollectionConfig = {
  slug: 'appointments',
  labels: { singular: 'Appuntamento', plural: 'Appuntamenti' },
  admin: {
    useAsTitle: 'reference',
    defaultColumns: ['reference', 'start', 'patient', 'dentist', 'status'],
    group: 'Agenda',
  },
  fields: [
    {
      name: 'reference',
      type: 'text',
      label: 'Riferimento',
      unique: true,
      index: true,
      admin: { readOnly: true, description: 'Generato automaticamente.' },
    },
    { name: 'patient', type: 'relationship', relationTo: 'patients', label: 'Paziente', required: true },
    { name: 'dentist', type: 'relationship', relationTo: 'dentists', label: 'Odontoiatra', required: true },
    { name: 'service', type: 'relationship', relationTo: 'services', label: 'Prestazione', required: true },
    { name: 'start', type: 'date', label: 'Inizio', required: true, index: true, admin: { date: { pickerAppearance: 'dayAndTime' } } },
    { name: 'end', type: 'date', label: 'Fine', required: true, admin: { date: { pickerAppearance: 'dayAndTime' }, readOnly: true, description: 'Calcolato da inizio + durata prestazione.' } },
    { name: 'status', type: 'select', label: 'Stato', required: true, defaultValue: 'pending', index: true, options: [...APPOINTMENT_STATUSES] },
    { name: 'notes', type: 'textarea', label: 'Note' },
  ],
  hooks: {
    beforeChange: [
      async ({ data, req, operation }) => {
        // La fine dello slot deriva sempre dalla durata della prestazione:
        // niente slot incoerenti creati a mano dall'admin.
        if (data?.start && data?.service) {
          const serviceId = typeof data.service === 'object' ? data.service.id : data.service
          const service = await req.payload.findByID({
            collection: 'services',
            id: serviceId,
            depth: 0,
          })
          const minutes = service?.durationMinutes ?? 30
          data.end = new Date(new Date(data.start).getTime() + minutes * 60_000).toISOString()
        }
        if (operation === 'create' && !data.reference) {
          data.reference = `APP-${Date.now().toString(36).toUpperCase()}`
        }
        return data
      },
    ],
  },
}
