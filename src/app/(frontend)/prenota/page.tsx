import { SiteFooter, SiteHeader } from '@/components/site/SiteChrome'
import { BRAND, pageTitle } from '@/lib/brand'
import { getPayloadClient } from '@/lib/payload'

import BookingWizard from './BookingWizard'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: pageTitle('Prenota'),
  description: 'Scegli prestazione, odontoiatra e orario. Conferma in meno di un minuto.',
}

export default async function BookingPage({
  searchParams,
}: {
  searchParams: Promise<{ service?: string }>
}) {
  const { service: initialServiceSlug } = await searchParams
  const payload = await getPayloadClient()

  const [services, dentists] = await Promise.all([
    payload.find({
      collection: 'services',
      depth: 0,
      limit: 50,
      sort: 'priceEur',
      where: { active: { equals: true } },
    }),
    payload.find({
      collection: 'dentists',
      depth: 0,
      limit: 50,
      sort: 'name',
      where: { active: { equals: true } },
    }),
  ])

  return (
    // Unica pagina senza min-h-screen: allo step 1 il wizard e' corto e il footer
    // deve salire con lui, non lasciare una banda morta prima di se'.
    <div className="bg-white flex flex-col">
      <SiteHeader />

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 md:px-6 py-10 md:py-16">
        <header className="max-w-3xl">
          <p className="text-xs md:text-sm font-semibold text-neutral-500">
            {BRAND.claim}
          </p>
          <h1 className="text-[clamp(3rem,9vw,6rem)] font-bold leading-[0.85] tracking-tight mt-2">
            Prenota
            <br />
            online
          </h1>
        </header>

        {/* min-w-0: senza, la striscia date del passo 3 (overflow-x) allarga la colonna
            1fr oltre il contenitore e spinge fuori il rail. */}
        <div className="grid lg:grid-cols-[minmax(0,1fr)_340px] gap-8 lg:gap-12 mt-8 md:mt-10 items-start">
          <BookingWizard
            initialServiceSlug={initialServiceSlug}
            services={services.docs.map((s) => ({
              id: s.id,
              slug: s.slug,
              name: s.name,
              description: s.description ?? '',
              durationMinutes: s.durationMinutes,
              priceEur: s.priceEur,
            }))}
            dentists={dentists.docs.map((d) => ({
              id: d.id,
              name: d.name,
              role: d.role,
              color: d.color ?? 'slate',
            }))}
          />

          {/* Rail di contesto: cosa succede dopo l'invio, e la via d'uscita telefonica.
              Su mobile scende sotto il wizard: la promessa "si paga in studio" vale anche lì. */}
          <aside className="flex flex-col gap-3 lg:sticky lg:top-24">
            <figure className="rounded-2xl overflow-hidden relative h-56">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/images/sorriso-studio.webp"
                alt="Una paziente sorride in sala visite"
                className="absolute inset-0 w-full h-full object-cover"
                style={{ objectPosition: '50% 22%' }}
              />
              <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/50 to-transparent" />
              <figcaption className="absolute bottom-3 left-4 text-white text-xs font-semibold drop-shadow">
                Ci vediamo in studio
              </figcaption>
            </figure>

            <div className="rounded-2xl bg-stone-50 p-6">
              <h2 className="text-lg font-bold leading-tight">Cosa succede dopo</h2>
              <ol className="mt-4 flex flex-col gap-3">
                {[
                  'Gli orari che vedi sono quelli realmente liberi in agenda.',
                  'La segreteria conferma la richiesta entro poche ore.',
                  'Si paga in studio, a prestazione fatta. Mai online.',
                ].map((text, i) => (
                  <li key={text} className="flex gap-3 text-sm font-medium text-neutral-600 leading-relaxed">
                    <span className="shrink-0 w-6 h-6 rounded-full border border-black flex items-center justify-center text-[11px] font-bold tabular-nums text-black">
                      {i + 1}
                    </span>
                    {text}
                  </li>
                ))}
              </ol>
            </div>

            <div className="rounded-2xl bg-zinc-200 p-6">
              <h2 className="text-lg font-bold leading-tight">Preferisci parlarci?</h2>
              <a
                href={BRAND.phoneHref}
                className="block text-xl font-bold tracking-tight mt-2 hover:text-neutral-600 transition-colors"
              >
                {BRAND.phone}
              </a>
              <p className="text-xs font-semibold text-neutral-600 mt-1">{BRAND.hours}</p>
            </div>
          </aside>
        </div>
      </main>

      <SiteFooter />
    </div>
  )
}
