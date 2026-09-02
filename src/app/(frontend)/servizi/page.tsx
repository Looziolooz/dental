import type { Metadata } from 'next'
import Link from 'next/link'

import { SiteFooter, SiteHeader } from '@/components/site/SiteChrome'
import { BRAND, pageTitle } from '@/lib/brand'
import { formatEur } from '@/lib/clinic'
import { getPayloadClient } from '@/lib/payload'
import { SERVICE_FALLBACK_IMAGE } from '@/seed/services-content'
import type { Media } from '@/payload-types'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: pageTitle('Servizi'),
  description:
    'Prima visita, igiene, sbiancamento, faccette, corone e implantologia. Durata, prezzo e come si svolge ogni trattamento.',
}

export default async function ServicesIndexPage() {
  const payload = await getPayloadClient()

  const services = await payload.find({
    collection: 'services',
    depth: 1,
    limit: 50,
    sort: 'priceEur',
  })

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <SiteHeader />

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 md:px-6 py-10 md:py-16">
        <header className="max-w-3xl">
          <p className="text-xs md:text-sm font-semibold text-neutral-500">
            {BRAND.claim}
          </p>
          <h1 className="text-[clamp(3rem,9vw,6.5rem)] font-bold leading-[0.85] tracking-tight mt-2">
            Cosa
            <br />
            facciamo
          </h1>
          <p className="text-base md:text-lg font-medium text-neutral-600 mt-6 leading-relaxed">
            Sei prestazioni, ognuna con durata e prezzo dichiarati prima di sederti in poltrona.
            La prima visita è gratuita e comprende la panoramica digitale e il piano di cura
            scritto: se non serve fare nulla, te lo diciamo.
          </p>
          <Link
            href="/prezzi"
            className="inline-block text-sm font-bold underline underline-offset-4 mt-4 hover:text-neutral-500 transition-colors"
          >
            Vedi il listino completo →
          </Link>
        </header>

        {(() => {
          const withImage = services.docs.map((service) => {
            const image = service.image as Media | null
            const src =
              (typeof image === 'object' && image?.url) ||
              SERVICE_FALLBACK_IMAGE[service.slug] ||
              '/images/showcase.webp'
            return { service, src }
          })

          // La prima visita (ordinamento per prezzo: costa zero) apre l'elenco a tutta larghezza:
          // e' il punto d'ingresso di ogni percorso, non una card fra le altre.
          const [featured, ...rest] = withImage

          return (
            <>
              {featured && (
                <Link
                  href={`/servizi/${featured.service.slug}`}
                  className="group grid md:grid-cols-2 rounded-2xl overflow-hidden bg-stone-50 mt-10 md:mt-14 hover:bg-stone-100 transition-colors duration-300"
                >
                  <div className="p-6 md:p-10 flex flex-col justify-between gap-8 order-2 md:order-1">
                    <p className="text-xs font-semibold text-neutral-500">
                      Da qui si parte
                    </p>
                    <div>
                      <h2 className="text-3xl md:text-5xl font-bold leading-[0.95] tracking-tight">
                        {featured.service.name}
                      </h2>
                      <p className="text-sm md:text-base font-medium text-neutral-600 mt-4 leading-relaxed max-w-md">
                        {featured.service.description}
                      </p>
                      <div className="flex items-center gap-3 mt-6">
                        <span className="px-4 py-2 rounded-full bg-black text-white text-sm font-bold">
                          {featured.service.priceEur > 0
                            ? formatEur(featured.service.priceEur)
                            : 'Gratuita'}
                        </span>
                        <span className="px-4 py-2 rounded-full border border-neutral-300 text-sm font-semibold">
                          {featured.service.durationMinutes} minuti
                        </span>
                        <span className="ml-auto w-10 h-10 rounded-full border border-black flex items-center justify-center group-hover:bg-black group-hover:text-white transition-colors duration-200">
                          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                            <path
                              d="M1 7h12m0 0L8 2m5 5L8 12"
                              stroke="currentColor"
                              strokeWidth="1.5"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="relative min-h-[260px] md:min-h-[380px] overflow-hidden order-1 md:order-2">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={featured.src}
                      alt=""
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                      style={{ objectPosition: '50% 35%' }}
                    />
                  </div>
                </Link>
              )}

              <div className="grid gap-3 md:gap-4 sm:grid-cols-2 lg:grid-cols-3 mt-3 md:mt-4">
                {rest.map(({ service, src }) => (
                  <Link
                    key={service.id}
                    href={`/servizi/${service.slug}`}
                    className="group flex flex-col rounded-2xl border border-neutral-200 overflow-hidden hover:border-black transition-colors duration-200"
                  >
                    <div className="aspect-[4/3] overflow-hidden bg-stone-100">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={src}
                        alt=""
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        style={{ objectPosition: '50% 30%' }}
                      />
                    </div>

                    <div className="flex flex-col flex-1 p-5">
                      <div className="flex items-start justify-between gap-3">
                        <h2 className="text-xl md:text-2xl font-bold leading-tight">
                          {service.name}
                        </h2>
                        <span className="shrink-0 text-sm font-bold tabular-nums">
                          {service.priceEur > 0 ? formatEur(service.priceEur) : 'Gratis'}
                        </span>
                      </div>

                      <p className="text-sm font-medium text-neutral-500 mt-2 flex-1">
                        {service.description}
                      </p>

                      <div className="flex items-center justify-between mt-5">
                        <span className="text-xs font-semibold text-neutral-400 tabular-nums">
                          {service.durationMinutes} minuti
                        </span>
                        <span className="w-9 h-9 rounded-full border border-black flex items-center justify-center group-hover:bg-black group-hover:text-white transition-colors duration-200">
                          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                            <path
                              d="M1 7h12m0 0L8 2m5 5L8 12"
                              stroke="currentColor"
                              strokeWidth="1.5"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </>
          )
        })()}

        <section className="rounded-2xl bg-black text-white p-8 md:p-12 mt-10 md:mt-14 flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="text-xs font-semibold text-white/60">
              Non sai da dove partire
            </p>
            <h2 className="text-4xl md:text-5xl font-bold leading-[0.95] mt-3">
              Comincia dalla
              <br />
              prima visita.
            </h2>
            <p className="text-sm font-medium text-white/70 mt-4 max-w-md">
              Gratuita, trenta minuti, con panoramica e preventivo scritto da portare via.
            </p>
          </div>
          <Link
            href="/prenota?service=prima-visita"
            className="px-8 py-4 bg-white rounded-full text-black text-base font-bold hover:scale-105 transition-transform"
          >
            Prenota la visita
          </Link>
        </section>
      </main>

      <SiteFooter />
    </div>
  )
}
