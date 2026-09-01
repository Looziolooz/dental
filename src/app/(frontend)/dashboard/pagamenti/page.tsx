import {
  PAYMENT_METHOD_LABELS,
  PAYMENT_STATUS_LABELS,
  PAYMENT_STATUS_STYLES,
  formatDate,
  formatEur,
} from '@/lib/clinic'
import { getPayloadClient } from '@/lib/payload'
import type { Patient } from '@/payload-types'

import PaymentActions from './PaymentActions'

export const dynamic = 'force-dynamic'

const FILTERS = [
  { key: 'all', label: 'Tutti' },
  { key: 'pending', label: 'In attesa' },
  { key: 'paid', label: 'Incassati' },
  { key: 'refunded', label: 'Rimborsati' },
] as const

export default async function PaymentsPage({
  searchParams,
}: {
  searchParams: Promise<{ stato?: string }>
}) {
  const { stato = 'all' } = await searchParams
  const payload = await getPayloadClient()

  const payments = await payload.find({
    collection: 'payments',
    depth: 1,
    limit: 300,
    sort: '-createdAt',
    ...(stato !== 'all' ? { where: { status: { equals: stato } } } : {}),
  })

  const all = await payload.find({ collection: 'payments', depth: 0, limit: 1000 })
  const total = (s: string) =>
    all.docs.filter((p) => p.status === s).reduce((sum, p) => sum + (p.amountEur ?? 0), 0)

  const collected = total('paid')
  const outstanding = total('pending')

  return (
    <div className="max-w-7xl mx-auto flex flex-col gap-6">
      <div>
        <h1 className="text-3xl md:text-5xl font-bold leading-none tracking-tight">Pagamenti</h1>
        <p className="text-sm font-medium text-neutral-500 mt-2">
          {formatEur(collected)} incassati · {formatEur(outstanding)} da incassare
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <a
            key={f.key}
            href={`/dashboard/pagamenti?stato=${f.key}`}
            className={`px-4 py-2 rounded-full text-xs font-semibold border transition-colors duration-200 ${
              stato === f.key ? 'bg-black text-white border-black' : 'bg-white border-neutral-300 hover:border-black'
            }`}
          >
            {f.label}
          </a>
        ))}
      </div>

      <div className="bg-white border border-neutral-200 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[820px] text-sm">
            <thead className="bg-stone-50 border-b border-neutral-200">
              <tr className="text-left">
                <th className="px-5 py-3 font-semibold">Fattura</th>
                <th className="px-5 py-3 font-semibold">Paziente</th>
                <th className="px-5 py-3 font-semibold">Metodo</th>
                <th className="px-5 py-3 font-semibold text-right">Importo</th>
                <th className="px-5 py-3 font-semibold">Stato</th>
                <th className="px-5 py-3 font-semibold">Incassato il</th>
                <th className="px-5 py-3 font-semibold text-right">Azione</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {payments.docs.map((p) => {
                const patient = p.patient as Patient
                return (
                  <tr key={p.id} className="hover:bg-stone-50 transition-colors duration-150">
                    <td className="px-5 py-3.5 font-mono text-xs font-semibold">{p.invoiceNumber}</td>
                    <td className="px-5 py-3.5 font-semibold">{patient?.fullName ?? '—'}</td>
                    <td className="px-5 py-3.5 text-neutral-600">
                      {PAYMENT_METHOD_LABELS[p.method] ?? p.method}
                    </td>
                    <td className="px-5 py-3.5 text-right font-bold tabular-nums">
                      {formatEur(p.amountEur)}
                    </td>
                    <td className="px-5 py-3.5">
                      <span
                        className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                          PAYMENT_STATUS_STYLES[p.status] ?? ''
                        }`}
                      >
                        {PAYMENT_STATUS_LABELS[p.status] ?? p.status}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-neutral-500">
                      {p.paidAt ? formatDate(p.paidAt) : '—'}
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <PaymentActions id={p.id} status={p.status} />
                    </td>
                  </tr>
                )
              })}
              {payments.docs.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-5 py-10 text-center text-neutral-500 font-medium">
                    Nessun pagamento in questo stato.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <p className="text-xs font-medium text-neutral-500">
        Demo: gli incassi si registrano a mano. Per il pagamento online reale serve collegare uno
        PSP (Stripe) — il campo <code className="font-mono">providerRef</code> è già pronto per
        l&apos;ID transazione.
      </p>
    </div>
  )
}
