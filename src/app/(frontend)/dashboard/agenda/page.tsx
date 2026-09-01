import { addDays, startOfWeek, toDateKey, parseDateKey } from '@/lib/clinic'
import { getPayloadClient } from '@/lib/payload'
import type { Appointment, Dentist, Patient, Payment, Service } from '@/payload-types'

import CalendarClient, { type CalendarAppointment } from './CalendarClient'

export const dynamic = 'force-dynamic'

export default async function AgendaPage({
  searchParams,
}: {
  searchParams: Promise<{ week?: string }>
}) {
  const { week } = await searchParams
  const payload = await getPayloadClient()

  const weekStart = startOfWeek(parseDateKey(week))
  const weekEnd = addDays(weekStart, 7)

  const [appointments, dentists, services, patients] = await Promise.all([
    payload.find({
      collection: 'appointments',
      depth: 1,
      limit: 500,
      sort: 'start',
      where: {
        and: [
          { start: { greater_than_equal: weekStart.toISOString() } },
          { start: { less_than: weekEnd.toISOString() } },
        ],
      },
    }),
    payload.find({ collection: 'dentists', depth: 0, limit: 50, sort: 'name', where: { active: { equals: true } } }),
    payload.find({ collection: 'services', depth: 0, limit: 50, sort: 'name' }),
    payload.find({ collection: 'patients', depth: 0, limit: 500, sort: 'fullName' }),
  ])

  // I pagamenti arrivano in un colpo solo: evita una query per appuntamento nel drawer.
  const payments = await payload.find({
    collection: 'payments',
    depth: 0,
    limit: 500,
    where: { appointment: { in: appointments.docs.map((a) => a.id) } },
  })
  const paymentByAppointment = new Map<number, Payment>()
  for (const p of payments.docs) {
    const key = typeof p.appointment === 'object' ? p.appointment?.id : p.appointment
    if (typeof key === 'number') paymentByAppointment.set(key, p)
  }

  const items: CalendarAppointment[] = appointments.docs.map((doc) => {
    const a = doc as Appointment
    const patient = a.patient as Patient
    const dentist = a.dentist as Dentist
    const service = a.service as Service
    const payment = paymentByAppointment.get(a.id)

    return {
      id: a.id,
      reference: a.reference ?? '',
      start: a.start,
      end: a.end,
      status: a.status,
      notes: a.notes ?? '',
      patientName: patient?.fullName ?? '—',
      patientPhone: patient?.phone ?? '',
      patientEmail: patient?.email ?? '',
      dentistId: dentist?.id ?? 0,
      dentistName: dentist?.name ?? '—',
      dentistColor: dentist?.color ?? 'slate',
      serviceName: service?.name ?? '—',
      priceEur: service?.priceEur ?? 0,
      payment: payment
        ? {
            id: payment.id,
            status: payment.status,
            amountEur: payment.amountEur,
            method: payment.method,
            invoiceNumber: payment.invoiceNumber ?? '',
          }
        : null,
    }
  })

  return (
    <CalendarClient
      weekKey={toDateKey(weekStart)}
      appointments={items}
      dentists={dentists.docs.map((d) => ({ id: d.id, name: d.name, color: d.color ?? 'slate' }))}
      services={services.docs.map((s) => ({
        id: s.id,
        name: s.name,
        durationMinutes: s.durationMinutes,
        priceEur: s.priceEur,
      }))}
      patients={patients.docs.map((p) => ({ id: p.id, fullName: p.fullName }))}
    />
  )
}
