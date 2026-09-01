import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import { SiteFooter, SiteHeader } from '@/components/site/SiteChrome'
import { pageTitle } from '@/lib/brand'
import { formatEur } from '@/lib/clinic'
import { getPayloadClient } from '@/lib/payload'
import { SERVICE_FALLBACK_IMAGE } from '@/seed/services-content'
import type { Media, Service } from '@/payload-types'

export const dynamic = 'force-dynamic'

async function getService(slug: string): Promise<Service | null> {
  const payload = await getPayloadClient()
  const found = await payload.find({
    collection: 'services',
    depth: 1,
    limit: 1,
    where: { slug: { equals: slug } },
  })
  return (found.docs[0] as Service) ?? null
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const service = await getService(slug)
  if (!service) return { title: pageTitle('Prestazione non trovata') }

  return {
    title: pageTitle(service.name),
    description: service.description ?? undefined,
  }
}

export default async function ServicePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const service = await getService(slug)
  if (!service) notFound()

  const payload = await getPayloadClient()
  const others = await payload.find({
    collection: 'services',
    depth: 0,
    limit: 4,
    sort: 'priceEur',
    where: { slug: { not_equals: slug } },
  })

  const image = service.image as Media | null
  const src =
    (typeof image === 'object' && image?.url) || SERVICE_FALLBACK_IMAGE[slug] || '/images/hero.webp'

  const benefits = service.benefits ?? []
  const steps = service.steps ?? []
  const faq = service.faq ?? []

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <SiteHeader />

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 md:px-6 py-8 md:py-12">
        <nav className="text-xs font-semibold text-neutral-400 mb-6">
          <Link href="/servizi" className="hover:text-black transition-colors">
            Servizi
          </Link>
          <span className="mx-2">/</span>
          <span className="text-neutral-600">{service.name}</span>
        </nav>

        {/* ------------------------------------------------------------- hero */}
        <div className="grid lg:grid-cols-2 gap-4 md:gap-6 items-stretch">
          <div className="rounded-2xl bg-stone-50 p-6 md:p-10 flex flex-col justify-between">
            <div>
              <h1 className="text-[clamp(2.5rem,6vw,4.5rem)] font-bold leading-[0.9] tracking-tight">
                {service.name}
              </h1>
              <p className="text-base md:text-lg font-medium text-neutral-600 mt-5 leading-relaxed">
                {service.intro || service.description}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 mt-8">
              <span className="px-4 py-2 rounded-full bg-black text-white text-sm font-bold">
                {service.priceEur > 0 ? formatEur(service.priceEur) : 'Gratuita'}
              </span>
              <span className="px-4 py-2 rounded-full border border-neutral-300 text-sm font-semibold">
                {service.durationMinutes} minuti
              </span>
              {service.active && (
                <span className="px-4 py-2 rounded-full border border-neutral-300 text-sm font-semibold">
                  Prenotabile online
                </span>
              )}
            </div>
          </div>

          <div className="rounded-2xl overflow-hidden min-h-[280px] lg:min-h-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={src} alt={service.name} className="w-full h-full object-cover" />
          </div>
        </div>

        {/* --------------------------------------------------------- benefici */}
        {benefits.length > 0 && (
          <section className="mt-10 md:mt-16">
            <h2 className="text-3xl md:text-4xl font-bold leading-none tracking-tight">
              Perché conviene
            </h2>
            <div className="grid gap-3 md:gap-4 sm:grid-cols-2 lg:grid-cols-3 mt-6">
              {benefits.map((b) => (
                <div key={b.id ?? b.title} className="rounded-2xl border border-neutral-300 p-5 md:p-6">
                  <h3 className="text-lg font-bold leading-tight">{b.title}</h3>
                  <p className="text-sm font-medium text-neutral-600 mt-2 leading-relaxed">{b.text}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ------------------------------------------------------------ fasi */}
        {steps.length > 0 && (
          <section className="mt-10 md:mt-16">
            <h2 className="text-3xl md:text-4xl font-bold leading-none tracking-tight">
              Come si svolge
            </h2>
            <ol className="mt-6 border-t border-neutral-200">
              {steps.map((s, i) => (
                <li
                  key={s.id ?? s.title}
                  className="flex flex-col sm:flex-row gap-3 sm:gap-8 py-5 border-b border-neutral-200"
                >
                  <span className="shrink-0 w-10 h-10 rounded-full border border-black flex items-center justify-center text-sm font-bold tabular-nums">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <div className="flex-1">
                    <h3 className="text-lg md:text-xl font-bold leading-tight">{s.title}</h3>
                    <p className="text-sm font-medium text-neutral-600 mt-1.5 leading-relaxed max-w-2xl">
                      {s.text}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          </section>
        )}

        {/* ------------------------------------------------------------- faq */}
        {faq.length > 0 && (
          <section className="mt-10 md:mt-16">
            <h2 className="text-3xl md:text-4xl font-bold leading-none tracking-tight">
              Domande frequenti
            </h2>
            <div className="mt-6 border-t border-neutral-200">
              {faq.map((f) => (
                // <details> nativo: apre e chiude anche senza JavaScript.
                <details key={f.id ?? f.question} className="group border-b border-neutral-200">
                  <summary className="flex items-center justify-between gap-4 py-5 cursor-pointer list-none">
                    <h3 className="text-base md:text-lg font-bold leading-tight">{f.question}</h3>
                    <span className="shrink-0 w-8 h-8 rounded-full border border-black flex items-center justify-center text-lg font-bold leading-none transition-transform duration-200 group-open:rotate-45">
                      +
                    </span>
                  </summary>
                  <p className="text-sm font-medium text-neutral-600 pb-5 pr-12 leading-relaxed max-w-2xl">
                    {f.answer}
                  </p>
                </details>
              ))}
            </div>
          </section>
        )}

        {/* ------------------------------------------------------------- cta */}
        <section className="rounded-2xl bg-black text-white p-8 md:p-12 mt-10 md:mt-16 flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-white/60">
              {service.durationMinutes} minuti ·{' '}
              {service.priceEur > 0 ? formatEur(service.priceEur) : 'gratuita'}
            </p>
            <h2 className="text-4xl md:text-5xl font-bold leading-[0.95] mt-3">
              Prenota
              <br />
              {service.name.toLowerCase()}.
            </h2>
          </div>
          <Link
            href={`/prenota?service=${service.slug}`}
            className="px-8 py-4 bg-white rounded-full text-black text-base font-bold hover:scale-105 transition-transform"
          >
            Scegli data e ora
          </Link>
        </section>

        {/* ---------------------------------------------------------- altre */}
        {others.docs.length > 0 && (
          <section className="mt-10 md:mt-16">
            <h2 className="text-xl font-bold">Altre prestazioni</h2>
            <div className="flex flex-wrap gap-2 mt-4">
              {others.docs.map((o) => (
                <Link
                  key={o.id}
                  href={`/servizi/${o.slug}`}
                  className="px-4 py-2.5 rounded-full border border-neutral-300 text-sm font-semibold hover:border-black transition-colors duration-200"
                >
                  {o.name}
                </Link>
              ))}
            </div>
          </section>
        )}
      </main>

      <SiteFooter />
    </div>
  )
}
