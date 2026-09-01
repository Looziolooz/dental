'use server'

import { revalidatePath } from 'next/cache'

import { getCurrentUser, getPayloadClient } from '@/lib/payload'
import type { Appointment, Payment } from '@/payload-types'

/** Ogni azione del gestionale passa di qui: nessuna scrittura senza staff loggato. */
async function requireStaff() {
  const user = await getCurrentUser()
  if (!user) throw new Error('Non autorizzato')
  return user
}

function refreshDashboard() {
  revalidatePath('/dashboard')
  revalidatePath('/dashboard/agenda')
  revalidatePath('/dashboard/pagamenti')
  revalidatePath('/dashboard/pazienti')
}

export async function updateAppointmentStatus(id: number, status: Appointment['status']) {
  await requireStaff()
  const payload = await getPayloadClient()

  await payload.update({ collection: 'appointments', id, data: { status } })

  // Un appuntamento annullato non deve lasciare una fattura appesa in attesa.
  if (status === 'cancelled') {
    const linked = await payload.find({
      collection: 'payments',
      where: { appointment: { equals: id }, status: { equals: 'pending' } },
      limit: 50,
    })
    for (const p of linked.docs) {
      await payload.update({ collection: 'payments', id: p.id, data: { status: 'failed' } })
    }
  }

  refreshDashboard()
}

export async function markPaymentPaid(id: number, method?: Payment['method']) {
  await requireStaff()
  const payload = await getPayloadClient()
  await payload.update({
    collection: 'payments',
    id,
    data: { status: 'paid', paidAt: new Date().toISOString(), ...(method ? { method } : {}) },
  })
  refreshDashboard()
}

export async function refundPayment(id: number) {
  await requireStaff()
  const payload = await getPayloadClient()
  await payload.update({ collection: 'payments', id, data: { status: 'refunded' } })
  refreshDashboard()
}

export type ActionResult = { ok: boolean; message: string }

export async function createAppointment(_prev: ActionResult | null, formData: FormData): Promise<ActionResult> {
  try {
    await requireStaff()
    const payload = await getPayloadClient()

    const patient = Number(formData.get('patient'))
    const dentist = Number(formData.get('dentist'))
    const service = Number(formData.get('service'))
    const date = String(formData.get('date') || '')
    const time = String(formData.get('time') || '')
    const notes = String(formData.get('notes') || '')

    if (!patient || !dentist || !service || !date || !time) {
      return { ok: false, message: 'Compila tutti i campi obbligatori.' }
    }

    const start = new Date(`${date}T${time}:00`)
    if (Number.isNaN(start.getTime())) return { ok: false, message: 'Data o ora non valide.' }

    const serviceDoc = await payload.findByID({ collection: 'services', id: service, depth: 0 })
    const end = new Date(start.getTime() + (serviceDoc.durationMinutes ?? 30) * 60_000)

    const clash = await hasClash(dentist, start, end)
    if (clash) return { ok: false, message: 'Lo studio ha già un appuntamento in quella fascia.' }

    const appointment = await payload.create({
      collection: 'appointments',
      data: {
        patient,
        dentist,
        service,
        start: start.toISOString(),
        end: end.toISOString(),
        status: 'confirmed',
        notes,
      },
    })

    if ((serviceDoc.priceEur ?? 0) > 0) {
      await payload.create({
        collection: 'payments',
        data: {
          appointment: appointment.id,
          patient,
          amountEur: serviceDoc.priceEur,
          method: 'card',
          status: 'pending',
        },
      })
    }

    refreshDashboard()
    return { ok: true, message: 'Appuntamento creato.' }
  } catch (err) {
    return { ok: false, message: err instanceof Error ? err.message : 'Errore imprevisto.' }
  }
}

/** Sovrapposizione su stessa poltrona: [start,end) contro gli appuntamenti vivi. */
export async function hasClash(dentist: number, start: Date, end: Date, excludeId?: number) {
  const payload = await getPayloadClient()
  const found = await payload.find({
    collection: 'appointments',
    depth: 0,
    limit: 200,
    where: {
      and: [
        { dentist: { equals: dentist } },
        { status: { not_in: ['cancelled', 'no_show'] } },
        { start: { less_than: end.toISOString() } },
        { end: { greater_than: start.toISOString() } },
        ...(excludeId ? [{ id: { not_equals: excludeId } }] : []),
      ],
    },
  })
  return found.totalDocs > 0
}
