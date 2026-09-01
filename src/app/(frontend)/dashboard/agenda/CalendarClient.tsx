'use client'

import Link from 'next/link'
import { useActionState, useMemo, useState } from 'react'

import {
  APPOINTMENT_STATUS_LABELS,
  APPOINTMENT_STATUS_STYLES,
  CLINIC_OPEN_HOUR,
  PAYMENT_METHOD_LABELS,
  PAYMENT_STATUS_LABELS,
  PAYMENT_STATUS_STYLES,
  SLOTS_PER_DAY,
  SLOT_MINUTES,
  WEEKDAYS,
  addDays,
  dentistStyle,
  formatEur,
  formatTime,
  minutesFromOpen,
  parseDateKey,
  toDateKey,
} from '@/lib/clinic'

import { createAppointment, markPaymentPaid, updateAppointmentStatus, type ActionResult } from '../actions'

/** Altezza in px di uno slot da 30 minuti: unica costante che governa la scala della griglia. */
const ROW_H = 56

/**
 * Affianca gli appuntamenti che si sovrappongono nel tempo.
 * Senza questo, due poltrone occupate alla stessa ora si coprono a vicenda
 * e la seconda diventa invisibile.
 *
 * Raggruppa in cluster di elementi che si toccano, poi dentro ogni cluster
 * assegna la prima colonna libera (greedy). `cols` e' la larghezza del cluster.
 */
function layoutOverlaps(items: CalendarAppointment[]) {
  const sorted = [...items].sort((a, b) => +new Date(a.start) - +new Date(b.start))
  const placed: { item: CalendarAppointment; col: number; cols: number }[] = []

  let cluster: CalendarAppointment[] = []
  let clusterEnd = 0

  const flush = () => {
    if (!cluster.length) return
    const colEnds: number[] = []
    const assigned = cluster.map((item) => {
      const from = +new Date(item.start)
      const to = +new Date(item.end)
      let col = colEnds.findIndex((end) => end <= from)
      if (col === -1) {
        col = colEnds.length
        colEnds.push(to)
      } else {
        colEnds[col] = to
      }
      return { item, col }
    })
    for (const a of assigned) placed.push({ ...a, cols: colEnds.length })
    cluster = []
    clusterEnd = 0
  }

  for (const item of sorted) {
    const from = +new Date(item.start)
    if (cluster.length && from >= clusterEnd) flush()
    cluster.push(item)
    clusterEnd = Math.max(clusterEnd, +new Date(item.end))
  }
  flush()

  return placed
}

export type CalendarAppointment = {
  id: number
  reference: string
  start: string
  end: string
  status: string
  notes: string
  patientName: string
  patientPhone: string
  patientEmail: string
  dentistId: number
  dentistName: string
  dentistColor: string
  serviceName: string
  priceEur: number
  payment: {
    id: number
    status: string
    amountEur: number
    method: string
    invoiceNumber: string
  } | null
}

type Dentist = { id: number; name: string; color: string }
type Service = { id: number; name: string; durationMinutes: number; priceEur: number }
type Patient = { id: number; fullName: string }

export default function CalendarClient({
  weekKey,
  appointments,
  dentists,
  services,
  patients,
}: {
  weekKey: string
  appointments: CalendarAppointment[]
  dentists: Dentist[]
  services: Service[]
  patients: Patient[]
}) {
  const [dentistFilter, setDentistFilter] = useState<number | null>(null)
  const [selected, setSelected] = useState<CalendarAppointment | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [pending, setPending] = useState(false)

  const weekStart = parseDateKey(weekKey)
  const days = useMemo(
    () => Array.from({ length: 6 }, (_, i) => addDays(weekStart, i)),
    [weekKey], // eslint-disable-line react-hooks/exhaustive-deps
  )

  const visible = dentistFilter ? appointments.filter((a) => a.dentistId === dentistFilter) : appointments
  const todayKey = toDateKey(new Date())

  const monthLabel = weekStart.toLocaleDateString('it-IT', { month: 'long', year: 'numeric' })

  async function run(fn: () => Promise<void>) {
    setPending(true)
    try {
      await fn()
      setSelected(null)
    } finally {
      setPending(false)
    }
  }

  return (
    <div className="max-w-[1600px] mx-auto flex flex-col gap-4">
      {/* ------------------------------------------------------------- testata */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-5xl font-bold leading-none tracking-tight">Agenda</h1>
          <p className="text-sm font-medium text-neutral-500 mt-2 capitalize">{monthLabel}</p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href={`/dashboard/agenda?week=${toDateKey(addDays(weekStart, -7))}`}
            aria-label="Settimana precedente"
            className="w-10 h-10 rounded-full border border-black flex items-center justify-center font-bold hover:bg-black hover:text-white transition-colors duration-200"
          >
            ‹
          </Link>
          <Link
            href="/dashboard/agenda"
            className="px-4 py-2.5 rounded-full border border-black text-sm font-semibold hover:bg-black hover:text-white transition-colors duration-200"
          >
            Oggi
          </Link>
          <Link
            href={`/dashboard/agenda?week=${toDateKey(addDays(weekStart, 7))}`}
            aria-label="Settimana successiva"
            className="w-10 h-10 rounded-full border border-black flex items-center justify-center font-bold hover:bg-black hover:text-white transition-colors duration-200"
          >
            ›
          </Link>
          <button
            type="button"
            onClick={() => setShowForm(true)}
            className="px-5 py-2.5 rounded-full bg-black text-white text-sm font-semibold hover:bg-neutral-800 transition-colors duration-200"
          >
            + Appuntamento
          </button>
        </div>
      </div>

      {/* ------------------------------------------------------------ filtri */}
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => setDentistFilter(null)}
          className={`px-3.5 py-1.5 rounded-full text-xs font-semibold border transition-colors duration-200 ${
            dentistFilter === null ? 'bg-black text-white border-black' : 'bg-white border-neutral-300 hover:border-black'
          }`}
        >
          Tutti ({appointments.length})
        </button>
        {dentists.map((d) => {
          const count = appointments.filter((a) => a.dentistId === d.id).length
          const active = dentistFilter === d.id
          return (
            <button
              key={d.id}
              type="button"
              onClick={() => setDentistFilter(active ? null : d.id)}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold border transition-colors duration-200 ${
                active ? 'bg-black text-white border-black' : 'bg-white border-neutral-300 hover:border-black'
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${dentistStyle(d.color).dot}`} />
              {d.name} ({count})
            </button>
          )
        })}
      </div>

      {/* ----------------------------------------------------------- griglia */}
      <div className="bg-white border border-neutral-200 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <div className="min-w-[900px]">
            {/* intestazione giorni */}
            <div className="flex border-b border-neutral-200 sticky top-0 bg-white z-10">
              <div className="w-16 shrink-0" />
              {days.map((day) => {
                const isToday = toDateKey(day) === todayKey
                return (
                  <div
                    key={day.toISOString()}
                    className={`flex-1 px-3 py-3 border-l border-neutral-200 ${isToday ? 'bg-neutral-900 text-white' : ''}`}
                  >
                    <p className="text-[11px] font-semibold uppercase tracking-wide opacity-70">
                      {WEEKDAYS[day.getDay() === 0 ? 6 : day.getDay() - 1]}
                    </p>
                    <p className="text-xl font-bold leading-none mt-1 tabular-nums">{day.getDate()}</p>
                  </div>
                )
              })}
            </div>

            {/* corpo */}
            <div className="flex max-h-[70vh] overflow-y-auto">
              <div className="w-16 shrink-0">
                {Array.from({ length: SLOTS_PER_DAY }, (_, i) => {
                  const minutes = CLINIC_OPEN_HOUR * 60 + i * SLOT_MINUTES
                  const isHour = minutes % 60 === 0
                  return (
                    <div key={i} style={{ height: ROW_H }} className="relative">
                      {isHour && (
                        <span
                          className={`absolute right-2 text-[11px] font-semibold text-neutral-400 tabular-nums ${
                            i === 0 ? 'top-0' : '-top-2'
                          }`}
                        >
                          {String(Math.floor(minutes / 60)).padStart(2, '0')}:00
                        </span>
                      )}
                    </div>
                  )
                })}
              </div>

              {days.map((day) => {
                const dayKey = toDateKey(day)
                const dayItems = visible.filter((a) => toDateKey(new Date(a.start)) === dayKey)

                return (
                  <div
                    key={dayKey}
                    className="flex-1 relative border-l border-neutral-200"
                    style={{
                      height: SLOTS_PER_DAY * ROW_H,
                      // Righe della griglia in CSS: nessun DOM extra per 24 slot x 6 giorni.
                      backgroundImage:
                        'repeating-linear-gradient(to bottom, #f5f5f4 0px, #f5f5f4 1px, transparent 1px, transparent ' +
                        ROW_H +
                        'px)',
                    }}
                  >
                    {layoutOverlaps(dayItems).map(({ item: a, col, cols }) => {
                      const top = (minutesFromOpen(a.start) / SLOT_MINUTES) * ROW_H
                      const duration = (new Date(a.end).getTime() - new Date(a.start).getTime()) / 60000
                      const height = Math.max((duration / SLOT_MINUTES) * ROW_H - 4, 26)
                      const style = dentistStyle(a.dentistColor)
                      const dimmed = a.status === 'cancelled' || a.status === 'no_show'

                      return (
                        <button
                          key={a.id}
                          type="button"
                          onClick={() => setSelected(a)}
                          style={{
                            top: top + 2,
                            height,
                            left: `calc(${(col / cols) * 100}% + 2px)`,
                            width: `calc(${100 / cols}% - 4px)`,
                          }}
                          className={`absolute rounded-lg border-l-4 px-2 py-1 text-left overflow-hidden transition-transform duration-200 hover:scale-[1.03] hover:z-20 hover:shadow-lg ${style.block} ${
                            dimmed ? 'opacity-45' : ''
                          }`}
                        >
                          <p className="text-[11px] font-bold leading-tight tabular-nums">
                            {formatTime(a.start)}
                          </p>
                          <p className="text-[11px] font-semibold leading-tight truncate">
                            {a.patientName}
                          </p>
                          {height > 50 && (
                            <p className="text-[10px] font-medium leading-tight truncate opacity-70">
                              {a.serviceName}
                            </p>
                          )}
                        </button>
                      )
                    })}
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------------ drawer */}
      {selected && (
        <Drawer onClose={() => setSelected(null)} title="Dettaglio appuntamento">
          <div className="flex flex-col gap-5">
            <div>
              <p className="text-xs font-semibold text-neutral-500">{selected.reference}</p>
              <h3 className="text-2xl font-bold leading-tight mt-1">{selected.patientName}</h3>
              <p className="text-sm font-medium text-neutral-500">
                {selected.patientPhone} · {selected.patientEmail}
              </p>
            </div>

            <dl className="grid grid-cols-2 gap-3 text-sm">
              <Field label="Quando">
                {new Date(selected.start).toLocaleDateString('it-IT', { weekday: 'short', day: 'numeric', month: 'short' })}
                <br />
                {formatTime(selected.start)} – {formatTime(selected.end)}
              </Field>
              <Field label="Prestazione">
                {selected.serviceName}
                <br />
                {selected.priceEur > 0 ? formatEur(selected.priceEur) : 'Gratuita'}
              </Field>
              <Field label="Odontoiatra">{selected.dentistName}</Field>
              <Field label="Stato">
                <span
                  className={`inline-block px-2.5 py-1 rounded-full border text-[11px] font-semibold ${
                    APPOINTMENT_STATUS_STYLES[selected.status] ?? ''
                  }`}
                >
                  {APPOINTMENT_STATUS_LABELS[selected.status] ?? selected.status}
                </span>
              </Field>
            </dl>

            {selected.notes && (
              <div className="bg-stone-50 rounded-xl p-3">
                <p className="text-xs font-semibold text-neutral-500 mb-1">Note</p>
                <p className="text-sm">{selected.notes}</p>
              </div>
            )}

            <div>
              <p className="text-xs font-semibold text-neutral-500 mb-2">Cambia stato</p>
              <div className="flex flex-wrap gap-2">
                {(['confirmed', 'completed', 'no_show', 'cancelled'] as const)
                  .filter((s) => s !== selected.status)
                  .map((s) => (
                    <button
                      key={s}
                      type="button"
                      disabled={pending}
                      onClick={() => run(() => updateAppointmentStatus(selected.id, s))}
                      className="px-4 py-2 rounded-full border border-neutral-300 text-xs font-semibold hover:border-black hover:bg-black hover:text-white transition-colors duration-200 disabled:opacity-40"
                    >
                      {APPOINTMENT_STATUS_LABELS[s]}
                    </button>
                  ))}
              </div>
            </div>

            {selected.payment && (
              <div className="border-t border-neutral-200 pt-4">
                <p className="text-xs font-semibold text-neutral-500 mb-2">Pagamento</p>
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-lg font-bold">{formatEur(selected.payment.amountEur)}</p>
                    <p className="text-xs font-medium text-neutral-500">
                      Fattura {selected.payment.invoiceNumber} ·{' '}
                      {PAYMENT_METHOD_LABELS[selected.payment.method]}
                    </p>
                  </div>
                  <span
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold ${
                      PAYMENT_STATUS_STYLES[selected.payment.status]
                    }`}
                  >
                    {PAYMENT_STATUS_LABELS[selected.payment.status]}
                  </span>
                </div>
                {selected.payment.status === 'pending' && (
                  <button
                    type="button"
                    disabled={pending}
                    onClick={() => run(() => markPaymentPaid(selected.payment!.id))}
                    className="mt-3 w-full px-5 py-3 rounded-full bg-black text-white text-sm font-semibold hover:bg-neutral-800 transition-colors duration-200 disabled:opacity-40"
                  >
                    Segna come incassato
                  </button>
                )}
              </div>
            )}
          </div>
        </Drawer>
      )}

      {/* ------------------------------------------------- nuovo appuntamento */}
      {showForm && (
        <Drawer onClose={() => setShowForm(false)} title="Nuovo appuntamento">
          <NewAppointmentForm
            patients={patients}
            dentists={dentists}
            services={services}
            defaultDate={toDateKey(new Date())}
            onDone={() => setShowForm(false)}
          />
        </Drawer>
      )}
    </div>
  )
}

/* ------------------------------------------------------------------ pezzi */

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <dt className="text-xs font-semibold text-neutral-500">{label}</dt>
      <dd className="font-medium mt-0.5">{children}</dd>
    </div>
  )
}

function Drawer({
  title,
  onClose,
  children,
}: {
  title: string
  onClose: () => void
  children: React.ReactNode
}) {
  return (
    <div className="fixed inset-0 z-50">
      <div
        onClick={onClose}
        className="absolute inset-0 bg-black/30 backdrop-blur-sm animate-[fadeIn_200ms_ease-out]"
      />
      <div className="absolute top-0 right-0 h-full w-full max-w-md bg-white shadow-2xl flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-200">
          <h2 className="text-lg font-bold">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Chiudi"
            className="w-9 h-9 rounded-full border border-neutral-300 flex items-center justify-center hover:border-black transition-colors duration-200"
          >
            ✕
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-6 py-5">{children}</div>
      </div>
    </div>
  )
}

const inputClass =
  'w-full px-4 py-3 rounded-xl border border-neutral-300 text-sm font-medium focus:border-black focus:outline-none transition-colors duration-200'

function NewAppointmentForm({
  patients,
  dentists,
  services,
  defaultDate,
  onDone,
}: {
  patients: Patient[]
  dentists: Dentist[]
  services: Service[]
  defaultDate: string
  onDone: () => void
}) {
  const [state, formAction, isPending] = useActionState<ActionResult | null, FormData>(
    async (prev, formData) => {
      const result = await createAppointment(prev, formData)
      if (result.ok) onDone()
      return result
    },
    null,
  )

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <label className="flex flex-col gap-1.5">
        <span className="text-xs font-semibold text-neutral-500">Paziente</span>
        <select name="patient" required defaultValue="" className={inputClass}>
          <option value="" disabled>
            Seleziona…
          </option>
          {patients.map((p) => (
            <option key={p.id} value={p.id}>
              {p.fullName}
            </option>
          ))}
        </select>
      </label>

      <label className="flex flex-col gap-1.5">
        <span className="text-xs font-semibold text-neutral-500">Odontoiatra</span>
        <select name="dentist" required defaultValue="" className={inputClass}>
          <option value="" disabled>
            Seleziona…
          </option>
          {dentists.map((d) => (
            <option key={d.id} value={d.id}>
              {d.name}
            </option>
          ))}
        </select>
      </label>

      <label className="flex flex-col gap-1.5">
        <span className="text-xs font-semibold text-neutral-500">Prestazione</span>
        <select name="service" required defaultValue="" className={inputClass}>
          <option value="" disabled>
            Seleziona…
          </option>
          {services.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name} · {s.durationMinutes} min · {formatEur(s.priceEur)}
            </option>
          ))}
        </select>
      </label>

      <div className="grid grid-cols-2 gap-3">
        <label className="flex flex-col gap-1.5">
          <span className="text-xs font-semibold text-neutral-500">Data</span>
          <input type="date" name="date" required defaultValue={defaultDate} className={inputClass} />
        </label>
        <label className="flex flex-col gap-1.5">
          <span className="text-xs font-semibold text-neutral-500">Ora</span>
          <input type="time" name="time" required defaultValue="09:00" step={900} className={inputClass} />
        </label>
      </div>

      <label className="flex flex-col gap-1.5">
        <span className="text-xs font-semibold text-neutral-500">Note</span>
        <textarea name="notes" rows={3} className={inputClass} />
      </label>

      {state && !state.ok && (
        <p className="text-sm font-semibold text-rose-700 bg-rose-50 rounded-xl px-4 py-3">
          {state.message}
        </p>
      )}

      <button
        type="submit"
        disabled={isPending}
        className="w-full px-6 py-4 rounded-full bg-black text-white text-sm font-semibold hover:bg-neutral-800 transition-colors duration-200 disabled:opacity-40"
      >
        {isPending ? 'Salvataggio…' : 'Crea appuntamento'}
      </button>
    </form>
  )
}
