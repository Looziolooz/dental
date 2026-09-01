import Link from 'next/link'

import {
  APPOINTMENT_STATUS_LABELS,
  APPOINTMENT_STATUS_STYLES,
  addDays,
  dentistStyle,
  formatEur,
  formatTime,
  startOfWeek,
} from '@/lib/clinic'
import { getPayloadClient } from '@/lib/payload'
import type { Appointment, Dentist, Patient, Service } from '@/payload-types'

export const dynamic = 'force-dynamic'

function KpiCard({
  label,
  value,
  hint,
  accent = false,
}: {
  label: string
  value: string
  hint?: string
  accent?: boolean
}) {
  return (
    <div
      className={`rounded-2xl p-5 md:p-6 flex flex-col justify-between min-h-[130px] ${
        accent ? 'bg-black text-white' : 'bg-white border border-neutral-200'
      }`}
    >
      <p className={`text-xs font-semibold ${accent ? 'text-white/70' : 'text-neutral-500'}`}>
        {label}
      </p>
      <div>
        <p className="text-3xl md:text-4xl font-bold leading-none tabular-nums">{value}</p>
        {hint && (
          <p className={`text-xs font-medium mt-2 ${accent ? 'text-white/60' : 'text-neutral-500'}`}>
            {hint}
          </p>
        )}
      </div>
    </div>
  )
}

export default async function OverviewPage() {
  const payload = await getPayloadClient()

  const now = new Date()
  const dayStart = new Date(now)
  dayStart.setHours(0, 0, 0, 0)
  const dayEnd = addDays(dayStart, 1)
  const weekStart = startOfWeek(now)
  const weekEnd = addDays(weekStart, 7)
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)

  const inRange = (from: Date, to: Date) => ({
    and: [{ start: { greater_than_equal: from.toISOString() } }, { start: { less_than: to.toISOString() } }],
  })

  const [today, week, monthPayments, pendingPayments, noShows] = await Promise.all([
    payload.find({
      collection: 'appointments',
      depth: 1,
      limit: 100,
      sort: 'start',
      where: inRange(dayStart, dayEnd),
    }),
    payload.find({ collection: 'appointments', depth: 0, limit: 0, where: inRange(weekStart, weekEnd) }),
    payload.find({
      collection: 'payments',
      depth: 0,
      limit: 500,
      where: {
        and: [{ status: { equals: 'paid' } }, { paidAt: { greater_than_equal: monthStart.toISOString() } }],
      },
    }),
    payload.find({ collection: 'payments', depth: 0, limit: 500, where: { status: { equals: 'pending' } } }),
    payload.find({
      collection: 'appointments',
      depth: 0,
      limit: 0,
      where: { and: [{ status: { equals: 'no_show' } }, ...inRange(weekStart, weekEnd).and] },
    }),
  ])

  const revenue = monthPayments.docs.reduce((sum, p) => sum + (p.amountEur ?? 0), 0)
  const outstanding = pendingPayments.docs.reduce((sum, p) => sum + (p.amountEur ?? 0), 0)
  const monthLabel = now.toLocaleDateString('it-IT', { month: 'long' })

  return (
    <div className="max-w-7xl mx-auto flex flex-col gap-6">
      <div>
        <h1 className="text-3xl md:text-5xl font-bold leading-none tracking-tight">Panoramica</h1>
        <p className="text-sm font-medium text-neutral-500 mt-2">
          {now.toLocaleDateString('it-IT', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        <KpiCard label="Appuntamenti oggi" value={String(today.totalDocs)} accent />
        <KpiCard label="Questa settimana" value={String(week.totalDocs)} hint={`${noShows.totalDocs} mancate presenze`} />
        <KpiCard label={`Incassato a ${monthLabel}`} value={formatEur(revenue)} hint={`${monthPayments.totalDocs} pagamenti`} />
        <KpiCard label="Da incassare" value={formatEur(outstanding)} hint={`${pendingPayments.totalDocs} fatture aperte`} />
      </div>

      <section className="bg-white border border-neutral-200 rounded-2xl overflow-hidden">
        <div className="flex items-center justify-between px-5 md:px-6 py-4 border-b border-neutral-200">
          <h2 className="text-lg md:text-xl font-bold">Agenda di oggi</h2>
          <Link
            href="/dashboard/agenda"
            className="px-4 py-2 rounded-full border border-black text-sm font-semibold hover:bg-black hover:text-white transition-colors duration-200"
          >
            Vai al calendario
          </Link>
        </div>

        {today.docs.length === 0 ? (
          <p className="px-5 md:px-6 py-10 text-sm font-medium text-neutral-500 text-center">
            Nessun appuntamento in programma per oggi.
          </p>
        ) : (
          <ul className="divide-y divide-neutral-100">
            {today.docs.map((appointment) => {
              const a = appointment as Appointment
              const patient = a.patient as Patient
              const dentist = a.dentist as Dentist
              const service = a.service as Service
              const style = dentistStyle(dentist?.color)

              return (
                <li key={a.id} className="flex items-center gap-4 px-5 md:px-6 py-3.5">
                  <span className="text-sm font-bold tabular-nums w-14 shrink-0">
                    {formatTime(a.start)}
                  </span>
                  <span className={`w-2 h-2 rounded-full shrink-0 ${style.dot}`} />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold truncate">{patient?.fullName}</p>
                    <p className="text-xs font-medium text-neutral-500 truncate">
                      {service?.name} · {dentist?.name}
                    </p>
                  </div>
                  <span
                    className={`shrink-0 px-2.5 py-1 rounded-full border text-[11px] font-semibold ${
                      APPOINTMENT_STATUS_STYLES[a.status] ?? ''
                    }`}
                  >
                    {APPOINTMENT_STATUS_LABELS[a.status] ?? a.status}
                  </span>
                </li>
              )
            })}
          </ul>
        )}
      </section>
    </div>
  )
}
