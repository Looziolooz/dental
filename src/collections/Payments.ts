import type { CollectionConfig } from 'payload'

export const PAYMENT_STATUSES = [
  { label: 'In attesa', value: 'pending' },
  { label: 'Pagato', value: 'paid' },
  { label: 'Rimborsato', value: 'refunded' },
  { label: 'Fallito', value: 'failed' },
] as const

export const Payments: CollectionConfig = {
  slug: 'payments',
  labels: { singular: 'Pagamento', plural: 'Pagamenti' },
  admin: {
    useAsTitle: 'invoiceNumber',
    defaultColumns: ['invoiceNumber', 'patient', 'amountEur', 'method', 'status', 'paidAt'],
    group: 'Agenda',
  },
  fields: [
    {
      name: 'invoiceNumber',
      type: 'text',
      label: 'N. fattura',
      unique: true,
      index: true,
      admin: { readOnly: true, description: 'Generato automaticamente.' },
    },
    { name: 'appointment', type: 'relationship', relationTo: 'appointments', label: 'Appuntamento' },
    { name: 'patient', type: 'relationship', relationTo: 'patients', label: 'Paziente', required: true },
    { name: 'amountEur', type: 'number', label: 'Importo (€)', required: true, min: 0 },
    {
      name: 'method',
      type: 'select',
      label: 'Metodo',
      required: true,
      defaultValue: 'card',
      options: [
        { label: 'Carta', value: 'card' },
        { label: 'Contanti', value: 'cash' },
        { label: 'Bonifico', value: 'transfer' },
        { label: 'Assicurazione', value: 'insurance' },
      ],
    },
    { name: 'status', type: 'select', label: 'Stato', required: true, defaultValue: 'pending', index: true, options: [...PAYMENT_STATUSES] },
    { name: 'paidAt', type: 'date', label: 'Incassato il' },
    {
      name: 'providerRef',
      type: 'text',
      label: 'Riferimento provider',
      admin: { description: 'ID transazione dello PSP. Vuoto nei pagamenti demo.' },
    },
  ],
  hooks: {
    beforeChange: [
      ({ data, operation }) => {
        if (operation === 'create' && !data.invoiceNumber) {
          const year = new Date().getFullYear()
          data.invoiceNumber = `${year}-${Date.now().toString(36).toUpperCase().slice(-6)}`
        }
        if (data.status === 'paid' && !data.paidAt) {
          data.paidAt = new Date().toISOString()
        }
        return data
      },
    ],
  },
}
