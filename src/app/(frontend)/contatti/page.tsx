import type { Metadata } from 'next'
import Link from 'next/link'

import { SiteFooter, SiteHeader } from '@/components/site/SiteChrome'
import { BRAND, pageTitle } from '@/lib/brand'

export const metadata: Metadata = {
  title: pageTitle('Contatti'),
  description: `Telefono, email, indirizzo e orari di ${BRAND.name}. Per le urgenze chiama: negli orari di apertura risponde la segreteria, non un centralino.`,
}

/** Domande pratiche che arrivano in segreteria prima ancora della prima visita. */
const PRACTICAL_FAQ = [
  {
    question: 'Serve l’impegnativa del medico?',
    answer: 'No. Lo studio è privato: prenoti direttamente, online o per telefono, senza richiesta del medico di base.',
  },
  {
    question: 'Posso disdire o spostare un appuntamento?',
    answer: 'Sì, con una telefonata. Chiediamo solo di avvisare con un giorno di anticipo, così liberiamo il posto per chi aspetta.',
  },
  {
    question: 'Cosa porto alla prima visita?',
    answer: 'Radiografie recenti se le hai e l’elenco dei farmaci che assumi. Il resto lo facciamo noi, panoramica compresa.',
  },
]

export default function ContactsPage() {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <SiteHeader />

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 md:px-6 py-10 md:py-16">
        <header className="max-w-3xl">
          <p className="text-xs md:text-sm font-semibold text-neutral-500">{BRAND.claim}</p>
          <h1 className="text-[clamp(3rem,9vw,6.5rem)] font-bold leading-[0.85] tracking-tight mt-2">
            Parla con
            <br />
            lo studio
          </h1>
          <p className="text-base md:text-lg font-medium text-neutral-600 mt-6 leading-relaxed">
            Negli orari di apertura al telefono risponde la segreteria, non un centralino. Per
            tutto il resto c’è l’email — e la prenotazione online, che richiede meno di un minuto.
          </p>
        </header>

        {/* ------------------------------------------------- recapiti diretti */}
        <div className="grid md:grid-cols-3 gap-3 md:gap-4 mt-10 md:mt-14">
          <a
            href={BRAND.phoneHref}
            className="group rounded-2xl bg-stone-50 p-6 md:p-8 flex flex-col justify-between min-h-[220px] hover:bg-black hover:text-white transition-colors duration-300"
          >
            <p className="text-xs font-semibold text-neutral-500 group-hover:text-white/60 transition-colors">
              Telefono · {BRAND.hours}
            </p>
            <div>
              <p className="text-2xl md:text-[1.7rem] font-bold tracking-tight leading-none">
                {BRAND.phone}
              </p>
              <p className="text-sm font-semibold mt-3 text-neutral-500 group-hover:text-white/70 transition-colors">
                Tocca per chiamare →
              </p>
            </div>
          </a>

          <a
            href={`mailto:${BRAND.email}`}
            className="group rounded-2xl bg-stone-50 p-6 md:p-8 flex flex-col justify-between min-h-[220px] hover:bg-black hover:text-white transition-colors duration-300"
          >
            <p className="text-xs font-semibold text-neutral-500 group-hover:text-white/60 transition-colors">
              Email · rispondiamo in giornata
            </p>
            <div>
              <p className="text-2xl md:text-[1.7rem] font-bold tracking-tight leading-none break-all">
                {BRAND.email}
              </p>
              <p className="text-sm font-semibold mt-3 text-neutral-500 group-hover:text-white/70 transition-colors">
                Scrivici →
              </p>
            </div>
          </a>

          <div className="rounded-2xl bg-zinc-200 p-6 md:p-8 flex flex-col justify-between min-h-[220px]">
            <p className="text-xs font-semibold text-neutral-600">Dove siamo</p>
            <div>
              <p className="text-2xl md:text-[1.7rem] font-bold tracking-tight leading-tight">
                {BRAND.address}
              </p>
              <p className="text-sm font-medium text-neutral-600 mt-3 leading-relaxed">
                Fermata della metropolitana a quattrocento metri, parcheggi liberi nelle vie
                laterali. Lo studio è al piano terra, senza gradini.
              </p>
            </div>
          </div>
        </div>

        {/* ---------------------------------------------------------- urgenze */}
        <section
          id="urgenze"
          className="rounded-2xl bg-black text-white p-8 md:p-12 mt-10 md:mt-14 grid lg:grid-cols-[1.4fr_1fr] gap-8 items-end"
        >
          <div>
            <p className="text-xs font-semibold text-white/60">
              Urgenze odontoiatriche
            </p>
            <h2 className="text-4xl md:text-5xl font-bold leading-[0.95] mt-3">
              Hai dolore
              <br />
              adesso?
            </h2>
            <p className="text-sm font-medium text-white/70 mt-4 max-w-md leading-relaxed">
              Chiama: negli orari di apertura teniamo spazi liberi in agenda per le urgenze del
              giorno. Fuori orario lascia un messaggio in segreteria — ti richiamiamo
              all’apertura.
            </p>
          </div>
          <a
            href={BRAND.phoneHref}
            className="justify-self-start lg:justify-self-end px-8 py-4 bg-white rounded-full text-black text-base font-bold hover:scale-105 transition-transform"
          >
            Chiama {BRAND.phone}
          </a>
        </section>

        {/* ------------------------------------------- foto + domande pratiche */}
        <section className="mt-10 md:mt-14 grid lg:grid-cols-[1fr_1.4fr] gap-3 md:gap-4 items-stretch">
          <figure className="rounded-2xl overflow-hidden relative min-h-[320px]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/accoglienza.webp"
              alt="L'accoglienza dello studio: una paziente sorride con un caffè"
              className="absolute inset-0 w-full h-full object-cover"
              style={{ objectPosition: '50% 25%' }}
            />
            <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-black/50 to-transparent" />
            <figcaption className="absolute bottom-4 left-5 text-white text-xs md:text-sm font-semibold drop-shadow">
              Il caffè lo offriamo noi
            </figcaption>
          </figure>

          <div className="rounded-2xl border border-neutral-200 p-6 md:p-8">
            <h2 className="text-2xl md:text-3xl font-bold leading-none tracking-tight">
              Prima di chiamare
            </h2>
            <div className="mt-4 border-t border-neutral-200">
              {PRACTICAL_FAQ.map((f) => (
                <details key={f.question} className="group border-b border-neutral-200">
                  <summary className="flex items-center justify-between gap-4 py-4 cursor-pointer list-none">
                    <h3 className="text-base md:text-lg font-bold leading-tight">{f.question}</h3>
                    <span className="shrink-0 w-8 h-8 rounded-full border border-black flex items-center justify-center text-lg font-bold leading-none transition-transform duration-200 group-open:rotate-45">
                      +
                    </span>
                  </summary>
                  <p className="text-sm font-medium text-neutral-600 pb-4 pr-12 leading-relaxed">
                    {f.answer}
                  </p>
                </details>
              ))}
            </div>

            <p className="text-sm font-medium text-neutral-500 mt-5 leading-relaxed">
              Per tutto il resto, la strada più corta è la prenotazione online:{' '}
              <Link href="/prenota" className="font-bold text-black underline underline-offset-4 hover:text-neutral-500 transition-colors">
                scegli prestazione, odontoiatra e orario
              </Link>{' '}
              e la segreteria conferma entro poche ore.
            </p>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  )
}
