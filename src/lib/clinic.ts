/** Regole e formati condivisi fra agenda, prenotazione e pagamenti. */

/** Orario di apertura: la griglia dell'agenda e gli slot prenotabili vivono qui dentro. */
export const CLINIC_OPEN_HOUR = 8
export const CLINIC_CLOSE_HOUR = 20
export const SLOT_MINUTES = 30
export const SLOTS_PER_DAY = ((CLINIC_CLOSE_HOUR - CLINIC_OPEN_HOUR) * 60) / SLOT_MINUTES

export const WEEKDAYS = ['Lunedì', 'Martedì', 'Mercoledì', 'Giovedì', 'Venerdì', 'Sabato'] as const

/**
 * Classi Tailwind per odontoiatra.
 * Scritte per esteso: le classi generate a runtime non entrano nel bundle.
 */
export const DENTIST_STYLES = {
  slate: { chip: 'bg-slate-900 text-white', block: 'bg-slate-100 border-slate-400 text-slate-900', dot: 'bg-slate-800' },
  amber: { chip: 'bg-amber-500 text-black', block: 'bg-amber-50 border-amber-400 text-amber-950', dot: 'bg-amber-500' },
  emerald: { chip: 'bg-emerald-600 text-white', block: 'bg-emerald-50 border-emerald-400 text-emerald-950', dot: 'bg-emerald-600' },
  indigo: { chip: 'bg-indigo-600 text-white', block: 'bg-indigo-50 border-indigo-400 text-indigo-950', dot: 'bg-indigo-600' },
  rose: { chip: 'bg-rose-600 text-white', block: 'bg-rose-50 border-rose-400 text-rose-950', dot: 'bg-rose-600' },
} as const

export type DentistColor = keyof typeof DENTIST_STYLES

export const dentistStyle = (color?: string | null) =>
  DENTIST_STYLES[(color as DentistColor) ?? 'slate'] ?? DENTIST_STYLES.slate

export const APPOINTMENT_STATUS_LABELS: Record<string, string> = {
  pending: 'Da confermare',
  confirmed: 'Confermato',
  completed: 'Completato',
  cancelled: 'Annullato',
  no_show: 'Non presentato',
}

export const APPOINTMENT_STATUS_STYLES: Record<string, string> = {
  pending: 'bg-amber-100 text-amber-900 border-amber-300',
  confirmed: 'bg-emerald-100 text-emerald-900 border-emerald-300',
  completed: 'bg-neutral-900 text-white border-neutral-900',
  cancelled: 'bg-neutral-100 text-neutral-500 border-neutral-300 line-through',
  no_show: 'bg-rose-100 text-rose-900 border-rose-300',
}

export const PAYMENT_STATUS_LABELS: Record<string, string> = {
  pending: 'In attesa',
  paid: 'Pagato',
  refunded: 'Rimborsato',
  failed: 'Fallito',
}

export const PAYMENT_STATUS_STYLES: Record<string, string> = {
  pending: 'bg-amber-100 text-amber-900',
  paid: 'bg-emerald-100 text-emerald-900',
  refunded: 'bg-neutral-200 text-neutral-700',
  failed: 'bg-rose-100 text-rose-900',
}

export const PAYMENT_METHOD_LABELS: Record<string, string> = {
  card: 'Carta',
  cash: 'Contanti',
  transfer: 'Bonifico',
  insurance: 'Assicurazione',
}

/** Lunedì della settimana che contiene `date`, a mezzanotte locale. */
export function startOfWeek(date: Date) {
  const d = new Date(date)
  d.setHours(0, 0, 0, 0)
  const dow = d.getDay() === 0 ? 7 : d.getDay()
  d.setDate(d.getDate() - (dow - 1))
  return d
}

export function addDays(date: Date, days: number) {
  const d = new Date(date)
  d.setDate(d.getDate() + days)
  return d
}

/** `YYYY-MM-DD` in fuso locale — `toISOString()` sposterebbe il giorno. */
export function toDateKey(date: Date) {
  const p = (n: number) => String(n).padStart(2, '0')
  return `${date.getFullYear()}-${p(date.getMonth() + 1)}-${p(date.getDate())}`
}

export function parseDateKey(key?: string | null) {
  if (!key) return new Date()
  const [y, m, d] = key.split('-').map(Number)
  if (!y || !m || !d) return new Date()
  return new Date(y, m - 1, d)
}

export const formatTime = (value: string | Date) =>
  new Date(value).toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })

export const formatDate = (value: string | Date) =>
  new Date(value).toLocaleDateString('it-IT', { day: 'numeric', month: 'long', year: 'numeric' })

export const formatEur = (value: number) =>
  new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(value)

/** Minuti dall'apertura: converte un orario nella riga della griglia. */
export function minutesFromOpen(value: string | Date) {
  const d = new Date(value)
  return (d.getHours() - CLINIC_OPEN_HOUR) * 60 + d.getMinutes()
}
