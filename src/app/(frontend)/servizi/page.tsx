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
        </header>

        <div className="grid gap-3 md:gap-4 sm:grid-cols-2 lg:grid-cols-3 mt-10 md:mt-14">
          {services.docs.map((service) => {
            const image = service.image as Media | null
            const src =
              (typeof image === 'object' && image?.url) ||
              SERVICE_FALLBACK_IMAGE[service.slug] ||
              '/images/hero.webp'

            return (
              <Link
                key={service.id}
                href={`/servizi/${service.slug}`}
                className="group flex flex-col rounded-2xl border border-neutral-300 overflow-hidden hover:border-black transition-colors duration-200"
              >
                <div className="aspect-[4/3] overflow-hidden bg-stone-100">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={src}
                    alt=""
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>

                <div className="flex flex-col flex-1 p-5">
                  <div className="flex items-start justify-between gap-3">
                    <h2 className="text-xl md:text-2xl font-bold leading-tight">{service.name}</h2>
                    <span className="shrink-0 text-sm font-bold">
                      {service.priceEur > 0 ? formatEur(service.priceEur) : 'Gratis'}
                    </span>
                  </div>

                  <p className="text-sm font-medium text-neutral-500 mt-2 flex-1">
                    {service.description}
                  </p>

                  <div className="flex items-center justify-between mt-5">
                    <span className="text-xs font-semibold text-neutral-400">
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
            )
          })}
        </div>

        <section className="rounded-2xl bg-black text-white p-8 md:p-12 mt-10 md:mt-14 flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-white/60">
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
