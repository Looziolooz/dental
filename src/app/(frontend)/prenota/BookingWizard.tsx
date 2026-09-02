'use client'

import Link from 'next/link'
import { useActionState, useEffect, useState, useTransition } from 'react'

import { addDays, dentistStyle, formatEur, toDateKey } from '@/lib/clinic'

import { bookAppointment, getAvailableSlots, type BookingResult } from './actions'

type Service = {
  id: number
  slug: string
  name: string
  description: string
  durationMinutes: number
  priceEur: number
}
type Dentist = { id: number; name: string; role: string; color: string }

const STEPS = ['Prestazione', 'Odontoiatra', 'Data e ora', 'I tuoi dati'] as const

export default function BookingWizard({
  services,
  dentists,
  initialServiceSlug,
}: {
  services: Service[]
  dentists: Dentist[]
  initialServiceSlug?: string
}) {
  // Arrivando da /servizi/<slug> la prestazione e' gia' scelta: si parte dal passo 2.
  const preselected = services.find((s) => s.slug === initialServiceSlug) ?? null

  const [step, setStep] = useState(preselected ? 1 : 0)
  const [service, setService] = useState<Service | null>(preselected)
  const [dentist, setDentist] = useState<Dentist | null>(null)
  const [dateKey, setDateKey] = useState<string>(toDateKey(addDays(new Date(), 1)))
  const [time, setTime] = useState<string>('')
  const [slots, setSlots] = useState<string[]>([])
  const [loadingSlots, startLoading] = useTransition()

  const [result, formAction, isPending] = useActionState<BookingResult | null, FormData>(
    bookAppointment,
    null,
  )

  // Gli slot si ricalcolano ogni volta che cambia una delle tre variabili che li determinano.
  useEffect(() => {
    if (!dentist || !service || step !== 2) return
    setTime('')
    startLoading(async () => {
      setSlots(await getAvailableSlots(dentist.id, dateKey, service.id))
    })
  }, [dentist, service, dateKey, step])

  const days = Array.from({ length: 14 }, (_, i) => addDays(new Date(), i + 1))

  if (result?.ok) {
    return (
      <div className="rounded-2xl bg-black text-white p-8 md:p-12 flex flex-col gap-5">
        <span className="text-xs font-semibold text-white/60">
          Richiesta ricevuta
        </span>
        <h2 className="text-4xl md:text-6xl font-bold leading-[0.95]">
          Ci vediamo
          <br />
          presto.
        </h2>
        <p className="text-sm font-medium text-white/80 max-w-md">
          Riferimento <span className="font-bold text-white">{result.reference}</span> ·{' '}
          {new Date(result.when).toLocaleString('it-IT', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
            hour: '2-digit',
            minute: '2-digit',
          })}
          . La segreteria conferma entro poche ore.
          {result.amountEur > 0 && ` Importo previsto: ${formatEur(result.amountEur)}, da saldare in studio.`}
        </p>
        <Link
          href="/"
          className="self-start px-8 py-4 bg-white rounded-full text-black text-sm font-semibold hover:scale-105 transition-transform"
        >
          Torna al sito
        </Link>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      {/* avanzamento */}
      <ol className="flex flex-wrap gap-2">
        {STEPS.map((label, i) => (
          <li key={label}>
            <button
              type="button"
              disabled={i > step}
              onClick={() => setStep(i)}
              className={`px-4 py-2 rounded-full text-xs font-semibold border transition-colors duration-200 disabled:opacity-35 ${
                i === step
                  ? 'bg-black text-white border-black'
                  : 'bg-white border-neutral-300 hover:border-black'
              }`}
            >
              {i + 1}. {label}
            </button>
          </li>
        ))}
      </ol>

      {/* 1 — prestazione */}
      {step === 0 && (
        <div className="grid sm:grid-cols-2 gap-3">
          {services.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => {
                setService(s)
                setStep(1)
              }}
              className={`text-left rounded-2xl border p-5 transition-all duration-200 hover:border-black hover:-translate-y-0.5 ${
                service?.id === s.id ? 'border-black bg-stone-50' : 'border-neutral-300 bg-white'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <h3 className="text-xl font-bold leading-tight">{s.name}</h3>
                <span className="shrink-0 text-sm font-bold">
                  {s.priceEur > 0 ? formatEur(s.priceEur) : 'Gratis'}
                </span>
              </div>
              <p className="text-xs font-medium text-neutral-500 mt-2">{s.description}</p>
              <p className="text-xs font-semibold text-neutral-400 mt-3">{s.durationMinutes} minuti</p>
            </button>
          ))}
        </div>
      )}

      {/* 2 — odontoiatra */}
      {step === 1 && (
        <div className="grid sm:grid-cols-2 gap-3">
          {dentists.map((d) => (
            <button
              key={d.id}
              type="button"
              onClick={() => {
                setDentist(d)
                setStep(2)
              }}
              className={`text-left rounded-2xl border p-5 flex items-center gap-4 transition-all duration-200 hover:border-black hover:-translate-y-0.5 ${
                dentist?.id === d.id ? 'border-black bg-stone-50' : 'border-neutral-300 bg-white'
              }`}
            >
              <span
                className={`w-12 h-12 rounded-full shrink-0 flex items-center justify-center text-sm font-bold ${
                  dentistStyle(d.color).chip
                }`}
              >
                {d.name.split(' ').slice(-2).map((p) => p[0]).join('')}
              </span>
              <div>
                <h3 className="text-base font-bold leading-tight">{d.name}</h3>
                <p className="text-xs font-medium text-neutral-500">{d.role}</p>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* 3 — data e ora */}
      {step === 2 && (
        <div className="flex flex-col gap-5">
          <div className="flex gap-2 overflow-x-auto pb-2">
            {days.map((day) => {
              const key = toDateKey(day)
              const active = key === dateKey
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => setDateKey(key)}
                  className={`shrink-0 w-16 py-3 rounded-xl border text-center transition-colors duration-200 ${
                    active ? 'bg-black text-white border-black' : 'bg-white border-neutral-300 hover:border-black'
                  }`}
                >
                  <span className="block text-[10px] font-semibold uppercase opacity-70">
                    {day.toLocaleDateString('it-IT', { weekday: 'short' })}
                  </span>
                  <span className="block text-lg font-bold leading-none mt-1 tabular-nums">
                    {day.getDate()}
                  </span>
                </button>
              )
            })}
          </div>

          {loadingSlots ? (
            <p className="text-sm font-medium text-neutral-500 py-6">Cerco gli orari liberi…</p>
          ) : slots.length === 0 ? (
            <p className="text-sm font-medium text-neutral-500 py-6">
              Nessuno slot libero in questa data con {dentist?.name}. Prova un altro giorno.
            </p>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
              {slots.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => {
                    setTime(s)
                    setStep(3)
                  }}
                  className={`py-3 rounded-xl border text-sm font-bold tabular-nums transition-colors duration-200 ${
                    time === s ? 'bg-black text-white border-black' : 'bg-white border-neutral-300 hover:border-black'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 4 — dati e conferma */}
      {step === 3 && service && dentist && time && (
        <form action={formAction} className="flex flex-col gap-4">
          <input type="hidden" name="service" value={service.id} />
          <input type="hidden" name="dentist" value={dentist.id} />
          <input type="hidden" name="date" value={dateKey} />
          <input type="hidden" name="time" value={time} />

          <div className="rounded-2xl bg-stone-50 p-5">
            <p className="text-xs font-semibold text-neutral-500 mb-2">Riepilogo</p>
            <p className="text-lg font-bold leading-tight">{service.name}</p>
            <p className="text-sm font-medium text-neutral-600">
              {dentist.name} ·{' '}
              {new Date(`${dateKey}T${time}`).toLocaleString('it-IT', {
                weekday: 'long',
                day: 'numeric',
                month: 'long',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </p>
            <p className="text-sm font-bold mt-2">
              {service.priceEur > 0 ? formatEur(service.priceEur) : 'Prima visita gratuita'}
            </p>
          </div>

          <div className="grid sm:grid-cols-2 gap-3">
            <Input name="fullName" label="Nome e cognome" required />
            <Input name="phone" label="Telefono" type="tel" required />
          </div>
          <Input name="email" label="Email" type="email" required />
          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-semibold text-neutral-500">Note (facoltativo)</span>
            <textarea
              name="notes"
              rows={3}
              className="w-full px-4 py-3 rounded-xl border border-neutral-300 text-sm font-medium focus:border-black focus:outline-none transition-colors duration-200"
            />
          </label>

          {result && !result.ok && (
            <p className="text-sm font-semibold text-rose-700 bg-rose-50 rounded-xl px-4 py-3">
              {result.message}
            </p>
          )}

          <button
            type="submit"
            disabled={isPending}
            className="w-full px-8 py-5 bg-black rounded-full text-white text-base font-bold hover:bg-neutral-800 transition-colors duration-200 disabled:opacity-40"
          >
            {isPending ? 'Invio…' : 'Conferma prenotazione'}
          </button>
        </form>
      )}
    </div>
  )
}

function Input({
  name,
  label,
  type = 'text',
  required,
}: {
  name: string
  label: string
  type?: string
  required?: boolean
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-xs font-semibold text-neutral-500">{label}</span>
      <input
        name={name}
        type={type}
        required={required}
        className="w-full px-4 py-3 rounded-xl border border-neutral-300 text-sm font-medium focus:border-black focus:outline-none transition-colors duration-200"
      />
    </label>
  )
}
