import { formatDate } from '@/lib/clinic'
import { getPayloadClient } from '@/lib/payload'

export const dynamic = 'force-dynamic'

const SOURCE_LABELS: Record<string, string> = {
  online: 'Sito web',
  phone: 'Telefono',
  referral: 'Passaparola',
  walk_in: 'Walk-in',
}

export default async function PatientsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>
}) {
  const { q } = await searchParams
  const payload = await getPayloadClient()

  const patients = await payload.find({
    collection: 'patients',
    depth: 0,
    limit: 200,
    sort: 'fullName',
    ...(q ? { where: { or: [{ fullName: { like: q } }, { email: { like: q } }] } } : {}),
  })

  // Conteggio visite in una sola query invece di N: la lista resta piatta.
  const appointments = await payload.find({
    collection: 'appointments',
    depth: 0,
    limit: 1000,
    where: { patient: { in: patients.docs.map((p) => p.id) } },
  })
  const visitsByPatient = new Map<number, number>()
  for (const a of appointments.docs) {
    const key = typeof a.patient === 'object' ? a.patient?.id : a.patient
    if (typeof key === 'number') visitsByPatient.set(key, (visitsByPatient.get(key) ?? 0) + 1)
  }

  return (
    <div className="max-w-7xl mx-auto flex flex-col gap-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-5xl font-bold leading-none tracking-tight">Pazienti</h1>
          <p className="text-sm font-medium text-neutral-500 mt-2">
            {patients.totalDocs} in anagrafica
          </p>
        </div>

        <form className="flex items-center gap-2">
          <input
            type="search"
            name="q"
            defaultValue={q ?? ''}
            placeholder="Cerca per nome o email…"
            className="px-4 py-2.5 rounded-full border border-neutral-300 text-sm font-medium w-56 focus:border-black focus:outline-none transition-colors duration-200"
          />
          <button
            type="submit"
            className="px-5 py-2.5 rounded-full bg-black text-white text-sm font-semibold hover:bg-neutral-800 transition-colors duration-200"
          >
            Cerca
          </button>
        </form>
      </div>

      <div className="bg-white border border-neutral-200 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-sm">
            <thead className="bg-stone-50 border-b border-neutral-200">
              <tr className="text-left">
                <th className="px-5 py-3 font-semibold">Paziente</th>
                <th className="px-5 py-3 font-semibold">Contatti</th>
                <th className="px-5 py-3 font-semibold">Acquisito da</th>
                <th className="px-5 py-3 font-semibold text-right">Visite</th>
                <th className="px-5 py-3 font-semibold">In anagrafica dal</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {patients.docs.map((p) => (
                <tr key={p.id} className="hover:bg-stone-50 transition-colors duration-150">
                  <td className="px-5 py-3.5 font-semibold">{p.fullName}</td>
                  <td className="px-5 py-3.5 text-neutral-600">
                    <div>{p.email}</div>
                    <div className="text-xs text-neutral-400">{p.phone}</div>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className="px-2.5 py-1 rounded-full bg-neutral-100 text-xs font-semibold">
                      {SOURCE_LABELS[p.source ?? 'online'] ?? p.source}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-right font-bold tabular-nums">
                    {visitsByPatient.get(p.id) ?? 0}
                  </td>
                  <td className="px-5 py-3.5 text-neutral-500">{formatDate(p.createdAt)}</td>
                </tr>
              ))}
              {patients.docs.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-5 py-10 text-center text-neutral-500 font-medium">
                    Nessun paziente trovato.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
