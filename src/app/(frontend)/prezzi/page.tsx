import type { Metadata } from 'next'
import Link from 'next/link'

import { SiteFooter, SiteHeader } from '@/components/site/SiteChrome'
import { BRAND, pageTitle } from '@/lib/brand'
import { formatEur } from '@/lib/clinic'
import { getPayloadClient } from '@/lib/payload'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: pageTitle('Prezzi'),
  description:
    'Il listino è pubblico: prezzo e durata di ogni prestazione, dichiarati prima di sederti in poltrona. Il preventivo scritto della prima visita è gratuito.',
}

/** Cosa comprende (e cosa non nasconde) il numero in listino. */
const PRICE_NOTES = [
  {
    title: 'Il preventivo è il prezzo',
    text: 'Quello che firmi alla prima visita è quello che paghi. Se durante la cura emergesse altro, il preventivo si aggiorna prima di procedere — mai a lavoro finito.',
  },
  {
    title: 'Per elemento, dove ha senso',
    text: 'Faccette e corone sono quotate per singolo dente: un sorriso completo di faccette ne richiede in genere da sei a dieci. Il totale esatto sta nel piano di cura.',
  },
  {
    title: 'La prima visita non si paga',
    text: 'Trenta minuti, panoramica digitale e piano di cura scritto, senza costi e senza impegno. Il piano resta tuo anche se decidi di curarti altrove.',
  },
]

export default async function PricesPage() {
  const payload = await getPayloadClient()
  const services = await payload.find({
    collection: 'services',
    depth: 0,
    limit: 50,
    sort: 'priceEur',
  })

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <SiteHeader />

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 md:px-6 py-10 md:py-16">
        <header className="max-w-3xl">
          <p className="text-xs md:text-sm font-semibold text-neutral-500">{BRAND.claim}</p>
          <h1 className="text-[clamp(3rem,9vw,6.5rem)] font-bold leading-[0.85] tracking-tight mt-2">
            Prezzi
            <br />
            dichiarati
          </h1>
          <p className="text-base md:text-lg font-medium text-neutral-600 mt-6 leading-relaxed">
            Il listino è pubblico e vale per tutti. Nessun prezzo «a partire da», nessuna sorpresa
            alla cassa: quello che leggi qui è quello che trovi scritto nel piano di cura.
          </p>
        </header>

        {/* ---------------------------------------------------------- listino */}
        <div className="mt-10 md:mt-14 border-t border-neutral-200">
          {services.docs.map((service) => (
            <Link
              key={service.id}
              href={`/servizi/${service.slug}`}
              className="group grid grid-cols-[1fr_auto] sm:grid-cols-[1fr_auto_auto] items-center gap-x-6 gap-y-1 py-5 md:py-6 border-b border-neutral-200"
            >
              <div className="min-w-0">
                <h2 className="text-xl md:text-3xl font-bold leading-tight tracking-tight group-hover:text-neutral-500 transition-colors">
                  {service.name}
                </h2>
                <p className="text-sm font-medium text-neutral-500 mt-1 max-w-xl">
                  {service.description}
                </p>
              </div>

              <span className="hidden sm:block text-xs font-semibold text-neutral-400 tabular-nums whitespace-nowrap">
                {service.durationMinutes} min
              </span>

              <span className="justify-self-end text-right">
                <span className="block text-xl md:text-3xl font-bold tabular-nums tracking-tight">
                  {service.priceEur > 0 ? formatEur(service.priceEur) : 'Gratis'}
                </span>
                <span className="block sm:hidden text-xs font-semibold text-neutral-400 tabular-nums mt-0.5">
                  {service.durationMinutes} min
                </span>
              </span>
            </Link>
          ))}
        </div>

        {/* ------------------------------------------------- come leggerli */}
        <section className="mt-10 md:mt-16 grid md:grid-cols-3 gap-3 md:gap-4">
          {PRICE_NOTES.map((note) => (
            <div key={note.title} className="rounded-2xl bg-stone-50 p-6 md:p-7">
              <h2 className="text-lg md:text-xl font-bold leading-tight">{note.title}</h2>
              <p className="text-sm font-medium text-neutral-600 mt-3 leading-relaxed">
                {note.text}
              </p>
            </div>
          ))}
        </section>

        {/* ------------------------------------------------------------- cta */}
        <section className="rounded-2xl bg-black text-white p-8 md:p-12 mt-10 md:mt-16 flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="text-xs font-semibold text-white/60">
              Il numero che conta è il tuo
            </p>
            <h2 className="text-4xl md:text-5xl font-bold leading-[0.95] mt-3">
              Il listino è generale.
              <br />
              Il piano di cura è tuo.
            </h2>
            <p className="text-sm font-medium text-white/70 mt-4 max-w-md">
              Alla prima visita, gratuita, esci con il preventivo scritto della tua bocca — non
              con una stima.
            </p>
          </div>
          <Link
            href="/prenota?service=prima-visita"
            className="px-8 py-4 bg-white rounded-full text-black text-base font-bold hover:scale-105 transition-transform"
          >
            Prenota la prima visita
          </Link>
        </section>
      </main>

      <SiteFooter />
    </div>
  )
}
