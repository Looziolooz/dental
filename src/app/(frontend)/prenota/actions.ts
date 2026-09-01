'use server'

import { revalidatePath } from 'next/cache'

import { SLOT_MINUTES } from '@/lib/clinic'
import { getPayloadClient } from '@/lib/payload'

/** Fascia prenotabile online: piu' stretta dell'apertura, per lasciare respiro alla segreteria. */
const BOOKING_OPEN_HOUR = 9
const BOOKING_CLOSE_HOUR = 18

export type BookingResult =
  | { ok: true; reference: string; when: string; amountEur: number }
  | { ok: false; message: string }

/**
 * Slot liberi per un odontoiatra in un giorno, gia' filtrati per:
 * giorno lavorativo, sovrapposizioni, orario di chiusura e slot nel passato.
 */
export async function getAvailableSlots(dentistId: number, dateKey: string, serviceId: number) {
  const payload = await getPayloadClient()

  const [dentist, service] = await Promise.all([
    payload.findByID({ collection: 'dentists', id: dentistId, depth: 0 }),
    payload.findByID({ collection: 'services', id: serviceId, depth: 0 }),
  ])

  const [y, m, d] = dateKey.split('-').map(Number)
  const day = new Date(y, m - 1, d)
  const weekday = String(day.getDay())

  if (!dentist.workingDays?.includes(weekday as never)) return []

  const duration = service.durationMinutes ?? 30
  const dayStart = new Date(day)
  dayStart.setHours(0, 0, 0, 0)
  const dayEnd = new Date(dayStart)
  dayEnd.setDate(dayEnd.getDate() + 1)

  const booked = await payload.find({
    collection: 'appointments',
    depth: 0,
    limit: 200,
    where: {
      and: [
        { dentist: { equals: dentistId } },
        { status: { not_in: ['cancelled', 'no_show'] } },
        { start: { greater_than_equal: dayStart.toISOString() } },
        { start: { less_than: dayEnd.toISOString() } },
      ],
    },
  })

  const busy = booked.docs.map((a) => ({
    from: new Date(a.start).getTime(),
    to: new Date(a.end).getTime(),
  }))

  const now = Date.now()
  const slots: string[] = []

  for (let minutes = BOOKING_OPEN_HOUR * 60; minutes < BOOKING_CLOSE_HOUR * 60; minutes += SLOT_MINUTES) {
    const start = new Date(day)
    start.setHours(Math.floor(minutes / 60), minutes % 60, 0, 0)
    const end = new Date(start.getTime() + duration * 60_000)

    if (end.getHours() * 60 + end.getMinutes() > BOOKING_CLOSE_HOUR * 60) continue
    if (start.getTime() < now) continue
    if (busy.some((b) => start.getTime() < b.to && end.getTime() > b.from)) continue

    slots.push(`${String(start.getHours()).padStart(2, '0')}:${String(start.getMinutes()).padStart(2, '0')}`)
  }

  return slots
}

export async function bookAppointment(_prev: BookingResult | null, formData: FormData): Promise<BookingResult> {
  try {
    const payload = await getPayloadClient()

    const serviceId = Number(formData.get('service'))
    const dentistId = Number(formData.get('dentist'))
    const dateKey = String(formData.get('date') || '')
    const time = String(formData.get('time') || '')
    const fullName = String(formData.get('fullName') || '').trim()
    const email = String(formData.get('email') || '').trim().toLowerCase()
    const phone = String(formData.get('phone') || '').trim()
    const notes = String(formData.get('notes') || '').trim()

    if (!serviceId || !dentistId || !dateKey || !time || !fullName || !email || !phone) {
      return { ok: false, message: 'Compila tutti i campi obbligatori.' }
    }

    const service = await payload.findByID({ collection: 'services', id: serviceId, depth: 0 })
    const start = new Date(`${dateKey}T${time}:00`)
    const end = new Date(start.getTime() + (service.durationMinutes ?? 30) * 60_000)

    if (Number.isNaN(start.getTime())) return { ok: false, message: 'Data o ora non valide.' }
    if (start.getTime() < Date.now()) return { ok: false, message: 'Lo slot scelto è nel passato.' }

    // Ricontrollo la disponibilita' al momento del salvataggio: fra la scelta
    // e l'invio qualcun altro puo' aver preso lo stesso slot.
    const clash = await payload.find({
      collection: 'appointments',
      depth: 0,
      limit: 1,
      where: {
        and: [
          { dentist: { equals: dentistId } },
          { status: { not_in: ['cancelled', 'no_show'] } },
          { start: { less_than: end.toISOString() } },
          { end: { greater_than: start.toISOString() } },
        ],
      },
    })
    if (clash.totalDocs > 0) {
      return { ok: false, message: 'Questo orario è appena stato occupato. Scegline un altro.' }
    }

    // Il paziente si riconosce dall'email: niente doppioni in anagrafica.
    const existing = await payload.find({
      collection: 'patients',
      depth: 0,
      limit: 1,
      where: { email: { equals: email } },
    })

    const patient =
      existing.docs[0] ??
      (await payload.create({
        collection: 'patients',
        data: { fullName, email, phone, source: 'online' },
      }))

    const appointment = await payload.create({
      collection: 'appointments',
      data: {
        patient: patient.id,
        dentist: dentistId,
        service: serviceId,
        start: start.toISOString(),
        end: end.toISOString(),
        status: 'pending',
        notes,
      },
    })

    if ((service.priceEur ?? 0) > 0) {
      await payload.create({
        collection: 'payments',
        data: {
          appointment: appointment.id,
          patient: patient.id,
          amountEur: service.priceEur,
          method: 'card',
          status: 'pending',
        },
      })
    }

    revalidatePath('/dashboard')
    revalidatePath('/dashboard/agenda')

    return {
      ok: true,
      reference: appointment.reference ?? '',
      when: start.toISOString(),
      amountEur: service.priceEur ?? 0,
    }
  } catch (err) {
    return { ok: false, message: err instanceof Error ? err.message : 'Errore imprevisto.' }
  }
}
