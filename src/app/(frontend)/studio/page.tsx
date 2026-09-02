import type { Metadata } from 'next'
import Link from 'next/link'

import { SiteFooter, SiteHeader } from '@/components/site/SiteChrome'
import { BRAND, pageTitle } from '@/lib/brand'
import { dentistStyle } from '@/lib/clinic'
import { getPayloadClient } from '@/lib/payload'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: pageTitle('Lo studio'),
  description: `Chi ti cura da ${BRAND.name}: quattro odontoiatri, diagnosi digitale e un metodo semplice — prima il piano di cura scritto, poi la poltrona.`,
}

/** Il metodo dello studio, nell'ordine in cui lo vive il paziente. */
const METHOD = [
  {
    title: 'Prima il piano, poi la poltrona',
    text: 'Ogni percorso parte dalla prima visita: esame completo, panoramica digitale e un piano di cura scritto con prezzi e priorità. Nessun trattamento comincia prima che tu lo abbia letto e approvato.',
  },
  {
    title: 'Digitale dove serve',
    text: 'Radiografie a bassa dose, impronte con scanner intraorale al posto della pasta, implantologia pianificata al computer su TAC 3D. La tecnologia entra dove riduce errori e fastidio, non per scena.',
  },
  {
    title: 'Il tempo è parte della cura',
    text: 'Gli appuntamenti sono dimensionati sulla prestazione, non sul riempimento dell’agenda. Se serve più tempo te lo diciamo prima di iniziare, non a poltrona occupata.',
  },
]

export default async function StudioPage() {
  const payload = await getPayloadClient()
  const dentists = await payload.find({
    collection: 'dentists',
    depth: 0,
    limit: 20,
    sort: 'name',
    where: { active: { equals: true } },
  })

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <SiteHeader />

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 md:px-6 py-10 md:py-16">
        {/* ------------------------------------------------------------ hero */}
        <div className="grid lg:grid-cols-[1.5fr_1fr] gap-3 md:gap-4 items-stretch">
          <div className="rounded-2xl bg-stone-50 p-6 md:p-10 flex flex-col justify-between min-h-[420px]">
            <p className="text-xs md:text-sm font-semibold text-neutral-500">{BRAND.claim}</p>

            <div>
              <h1 className="text-[clamp(3rem,9vw,6.5rem)] font-bold leading-[0.85] tracking-tight">
                Lo
                <br />
                studio
              </h1>
              <p className="text-base md:text-lg font-medium text-neutral-600 mt-6 leading-relaxed max-w-xl">
                Quattro odontoiatri, una segreteria che risponde e un metodo semplice: prima ti
                spieghiamo cosa serve e quanto costa, per iscritto, poi ti curiamo. Se non serve
                fare nulla, te lo diciamo.
              </p>
            </div>
          </div>

          <div className="rounded-2xl overflow-hidden relative min-h-[320px] lg:min-h-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/visita.webp"
              alt="Un controllo alla poltrona nello studio"
              className="w-full h-full object-cover"
              style={{ objectPosition: '50% 35%' }}
            />
            <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-black/50 to-transparent" />
            <p className="absolute bottom-4 left-5 text-white text-xs md:text-sm font-semibold drop-shadow">
              La sala visite
            </p>
          </div>
        </div>

        {/* ------------------------------------------------------- il metodo */}
        <section className="mt-14 md:mt-24">
          <h2 className="text-3xl md:text-4xl font-bold leading-none tracking-tight">
            Come lavoriamo
          </h2>
          <ol className="mt-6 border-t border-neutral-200">
            {METHOD.map((m, i) => (
              <li
                key={m.title}
                className="grid sm:grid-cols-[auto_1fr] gap-3 sm:gap-8 py-6 border-b border-neutral-200"
              >
                <span className="shrink-0 w-10 h-10 rounded-full border border-black flex items-center justify-center text-sm font-bold tabular-nums">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <div className="grid md:grid-cols-[280px_1fr] gap-2 md:gap-8">
                  <h3 className="text-xl md:text-2xl font-bold leading-tight">{m.title}</h3>
                  <p className="text-sm md:text-base font-medium text-neutral-600 leading-relaxed max-w-2xl">
                    {m.text}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </section>

        {/* ----------------------------------------------------------- team */}
        <section className="mt-14 md:mt-24">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <h2 className="text-3xl md:text-4xl font-bold leading-none tracking-tight">
              Chi ti cura
            </h2>
            <p className="text-sm font-medium text-neutral-500">
              Il colore accompagna ogni odontoiatra anche in agenda e in sala.
            </p>
          </div>

          <div className="mt-6 border-t border-neutral-200">
            {dentists.docs.map((d) => {
              const style = dentistStyle(d.color)
              return (
                <div
                  key={d.id}
                  className="grid sm:grid-cols-[auto_1fr] gap-3 sm:gap-8 py-6 border-b border-neutral-200"
                >
                  <span
                    aria-hidden="true"
                    className={`mt-1.5 shrink-0 w-4 h-4 rounded-full ${style.dot}`}
                  />
                  <div className="grid md:grid-cols-[280px_1fr] gap-2 md:gap-8">
                    <div>
                      <h3 className="text-2xl md:text-3xl font-bold leading-tight tracking-tight">
                        {d.name}
                      </h3>
                      <p className="text-sm font-semibold text-neutral-500 mt-1">{d.role}</p>
                    </div>
                    <p className="text-sm md:text-base font-medium text-neutral-600 leading-relaxed max-w-2xl self-center">
                      {d.bio ||
                        'Riceve su appuntamento: scegli la prestazione online e trovi le sue prime disponibilità reali.'}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        </section>

        {/* ----------------------------------------------------- dentro lo studio */}
        <section className="mt-14 md:mt-24 grid md:grid-cols-2 gap-3 md:gap-4">
          <figure className="rounded-2xl overflow-hidden relative min-h-[360px] md:min-h-[460px]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/accoglienza.webp"
              alt="Una paziente sorride con un caffè nella sala d'attesa"
              className="absolute inset-0 w-full h-full object-cover"
              style={{ objectPosition: '50% 30%' }}
            />
            <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-black/50 to-transparent" />
            <figcaption className="absolute bottom-4 left-5 text-white text-xs md:text-sm font-semibold drop-shadow">
              L’attesa, senza sala d’attesa da ospedale
            </figcaption>
          </figure>

          <div className="flex flex-col gap-3 md:gap-4">
            <figure className="rounded-2xl overflow-hidden relative flex-1 min-h-[240px]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/images/kit.webp"
                alt="Il kit AURA DENTAL consegnato alla prima visita"
                className="absolute inset-0 w-full h-full object-cover"
                style={{ objectPosition: '50% 55%' }}
              />
              <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-black/45 to-transparent" />
              <figcaption className="absolute bottom-4 left-5 text-white text-xs md:text-sm font-semibold drop-shadow">
                Il kit che ti consegniamo alla prima visita
              </figcaption>
            </figure>

            <div className="rounded-2xl bg-zinc-200 p-6 md:p-7 flex items-end justify-between gap-4">
              <div>
                <p className="text-xs md:text-sm font-semibold text-black mb-2">Orari e recapiti</p>
                <p className="text-lg md:text-xl font-bold leading-snug">
                  {BRAND.hours}
                  <br />
                  {BRAND.address}
                </p>
              </div>
              <Link
                href="/contatti"
                className="shrink-0 px-5 py-3 md:px-7 md:py-4 bg-white rounded-full text-black text-sm md:text-base font-bold hover:scale-105 transition-transform"
              >
                Contatti
              </Link>
            </div>
          </div>
        </section>

        {/* ------------------------------------------------------------ cta */}
        <section className="rounded-2xl bg-black text-white p-8 md:p-12 mt-14 md:mt-24 flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="text-xs font-semibold text-white/60">
              Il modo più semplice per conoscerci
            </p>
            <h2 className="text-4xl md:text-5xl font-bold leading-[0.95] mt-3">
              Vieni a farti
              <br />
              guardare in bocca.
            </h2>
            <p className="text-sm font-medium text-white/70 mt-4 max-w-md">
              La prima visita è gratuita: trenta minuti, panoramica digitale e piano di cura
              scritto da portare via.
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
