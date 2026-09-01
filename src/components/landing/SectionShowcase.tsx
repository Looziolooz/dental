'use client'

/**
 * Sezione di chiusura: una card a tutta immagine dentro una cornice pesca.
 *
 * Dentro la card convivono quattro strati sovrapposti alla foto:
 * barra con logo e link, annotazione tecnica sul dente, titolo con prova
 * sociale in basso a sinistra, pill di prenotazione in basso a destra.
 *
 * L'annotazione è l'elemento che regge tutto: reticolo con le faccette,
 * etichetta, e una linea che punta a un dente nella foto.
 */

import { BRAND } from '@/lib/brand'

/**
 * Foto della card. Serve un primo piano di un sorriso, formato orizzontale o
 * verticale ad alta risoluzione: il ritaglio prende una fascia attorno alla bocca.
 * Sostituendo questo file cambia la sezione, senza toccare il resto.
 */
const SHOWCASE_IMAGE = '/images/patient.webp'

/** Punto della foto tenuto al centro del ritaglio: x=50% (volto), y=42% (bocca). */
const SHOWCASE_FOCUS = '50% 42%'

/**
 * Dove finisce la linea di richiamo, in px dall'origine dell'annotazione.
 * Deve cadere su un dente: va ritarata insieme a SHOWCASE_FOCUS quando si cambia la foto.
 */
const LEADER_END = { x: 560, y: 70 }

/** Copy dimostrativa: numeri e recensioni sono di esempio, come tutto il resto della demo. */
const REVIEW_COUNT = '2.500'

const CARD_LINKS = [
  { label: 'Impianti', href: '/servizi/impianto' },
  { label: 'Prevenzione', href: '/servizi/igiene' },
  { label: 'Prezzi', href: '/servizi' },
]

/**
 * Ritagli quadrati sul volto, generati con sharp dalle foto di /public/images.
 * Servono pre-ritagliati: le foto originali sono panoramiche, e dentro un cerchio
 * da 44px un `object-position` mostrerebbe l'intera altezza, maglione compreso.
 */
const AVATARS = [
  '/images/avatars/smile.webp',
  '/images/avatars/hero.webp',
  '/images/avatars/patient.webp',
]

/* ------------------------------------------------------------------ icone */

function ToothIcon({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M12 2c-1.9 0-3.1.5-4.2 1.1C6.8 3.6 5.9 4 4.8 4 3.3 4 2 5.4 2 7.6c0 1.9.5 3.3 1 4.9.5 1.5.8 3.4 1 5.4.2 2 .9 3.6 2.3 3.6 1.3 0 1.9-1.3 2.2-3 .3-1.6.5-2.9 1.5-2.9s1.2 1.3 1.5 2.9c.3 1.7.9 3 2.2 3 1.4 0 2.1-1.6 2.3-3.6.2-2 .5-3.9 1-5.4.5-1.6 1-3 1-4.9C22 5.4 20.7 4 19.2 4c-1.1 0-2-.4-3-.9C15.1 2.5 13.9 2 12 2Z" />
    </svg>
  )
}

function CalendarIcon({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <rect x="3" y="5" width="18" height="16" rx="3" stroke="currentColor" strokeWidth="2" />
      <path d="M3 10h18M8 3v4M16 3v4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

function Star({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" className={className} aria-hidden="true">
      <path d="M10 1.5l2.6 5.3 5.9.9-4.3 4.1 1 5.8-5.2-2.7-5.2 2.7 1-5.8L1.5 7.7l5.9-.9L10 1.5Z" />
    </svg>
  )
}

/** Guscio di una faccetta: bordo superiore squadrato, margine inferiore arrotondato. */
function Veneer({ x, y, scale }: { x: number; y: number; scale: number }) {
  return (
    <path
      transform={`translate(${x} ${y}) scale(${scale})`}
      d="M4 0h22c2.2 0 4 1.8 4 4v26c0 8-6 14-15 14S0 38 0 30V4c0-2.2 1.8-4 4-4Z"
      fill="white"
    />
  )
}

/* ------------------------------------------------------------- annotazione */

function Annotation() {
  return (
    <div className="absolute left-[5%] top-[17%] hidden md:block">
      {/* reticolo: quattro angoli, nessun bordo continuo */}
      <div className="relative w-[132px] h-[132px]">
        <span className="absolute top-0 left-0 w-7 h-7 border-t-2 border-l-2 border-white/85 rounded-tl-sm" />
        <span className="absolute top-0 right-0 w-7 h-7 border-t-2 border-r-2 border-white/85 rounded-tr-sm" />
        <span className="absolute bottom-0 left-0 w-7 h-7 border-b-2 border-l-2 border-white/85 rounded-bl-sm" />
        <span className="absolute bottom-0 right-0 w-7 h-7 border-b-2 border-r-2 border-white/85 rounded-br-sm" />

        <svg viewBox="0 0 132 132" className="absolute inset-0 w-full h-full drop-shadow-md">
          <Veneer x={16} y={46} scale={0.62} />
          <Veneer x={44} y={22} scale={1} />
          <Veneer x={86} y={44} scale={0.68} />
        </svg>
      </div>

      {/* etichetta */}
      <p className="absolute left-[152px] top-[36px] text-white text-sm font-semibold leading-[1.35] whitespace-nowrap drop-shadow">
        Sistema
        <br />
        Applicazione
        <br />
        Faccette
      </p>

      {/* linea che scende verso un dente della foto */}
      <svg
        className="absolute left-[142px] top-[112px] w-140 h-50 overflow-visible"
        fill="none"
        aria-hidden="true"
      >
        <circle cx="4" cy="4" r="3.5" fill="white" />
        <path
          d={`M4 4 L${LEADER_END.x} ${LEADER_END.y}`}
          stroke="white"
          strokeWidth="1.25"
          strokeOpacity="0.9"
        />
        <circle
          cx={LEADER_END.x}
          cy={LEADER_END.y}
          r="11"
          fill="black"
          fillOpacity="0.25"
          stroke="white"
          strokeWidth="2"
        />
      </svg>
    </div>
  )
}

/* ------------------------------------------------------------------ sezione */

export default function SectionShowcase() {
  return (
    <section id="prenota" className="bg-[#f6e3d5] px-3 md:px-8 lg:px-10 py-3 md:py-8 lg:py-10">
      <div className="relative overflow-hidden rounded-[28px] md:rounded-[44px] min-h-[600px] md:min-h-[720px] lg:min-h-[800px]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={SHOWCASE_IMAGE}
          alt="Primo piano di un sorriso"
          className="absolute inset-0 w-full h-full object-cover"
          style={{ objectPosition: SHOWCASE_FOCUS }}
        />

        {/* Le due velature servono a far leggere il bianco sopra una foto chiara. */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/35 via-transparent to-black/70" />

        {/* -------------------------------------------------------- barra */}
        <div className="absolute top-0 inset-x-0 flex items-center justify-between gap-4 px-5 md:px-8 py-5 md:py-6">
          <a href="/#home" className="flex items-center gap-2 text-white shrink-0">
            <ToothIcon className="w-7 h-7 md:w-8 md:h-8" />
            <span className="text-lg md:text-2xl font-bold tracking-tight">
              {BRAND.logoTop} {BRAND.logoBottom}
            </span>
          </a>

          <nav className="hidden lg:flex items-center gap-8">
            {CARD_LINKS.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="flex items-center gap-2 text-white text-base font-medium hover:text-white/70 transition-colors duration-200"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-white" />
                {link.label}
              </a>
            ))}
          </nav>

          <a
            href="/prenota"
            className="shrink-0 px-5 md:px-8 py-2.5 md:py-3.5 bg-white rounded-full text-black text-sm md:text-base font-semibold hover:scale-105 transition-transform"
          >
            Contattaci
          </a>
        </div>

        <Annotation />

        {/* ------------------------------------------- titolo e prova sociale */}
        <div className="absolute bottom-0 inset-x-0 p-6 md:p-10 lg:p-12">
          {/* La prova sociale affianca la PRIMA riga del titolo, non l'ultima. */}
          <div className="flex flex-wrap items-start gap-x-8 gap-y-4">
            <h2 className="text-white text-[clamp(2.5rem,6.5vw,5.5rem)] font-bold leading-[0.95] tracking-tight drop-shadow-lg">
              Il sorriso
              <br />
              si cura e
              <br />
              si progetta.
            </h2>

            <div className="flex items-center gap-3 mt-2 md:mt-4">
              <div className="flex">
                {AVATARS.map((src, i) => (
                  <span
                    key={src}
                    className={`w-11 h-11 rounded-full overflow-hidden ring-2 ring-white ${i > 0 ? '-ml-4' : ''}`}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={src} alt="" className="w-full h-full object-cover" />
                  </span>
                ))}
              </div>

              <div className="text-white drop-shadow">
                <div className="flex items-center gap-1.5">
                  <span className="text-base font-bold tabular-nums">{REVIEW_COUNT}</span>
                  <span className="flex text-amber-400">
                    {Array.from({ length: 5 }, (_, i) => (
                      <Star key={i} className="w-4 h-4" />
                    ))}
                  </span>
                </div>
                <p className="text-sm font-semibold leading-none mt-0.5">Recensioni</p>
              </div>
            </div>
          </div>

          {/* Su mobile il pill sta nel flusso, sotto il titolo: in ancoraggio
              assoluto finirebbe sopra gli avatar. Da md torna nell'angolo. */}
          <a
            href="/prenota"
            className="mt-6 w-fit md:mt-0 md:absolute md:bottom-10 md:right-10 lg:bottom-12 lg:right-12 flex items-center gap-3 pl-2 pr-6 py-2 bg-black/65 backdrop-blur-md rounded-full text-white hover:bg-black/80 transition-colors duration-200"
          >
            <span className="w-10 h-10 md:w-11 md:h-11 rounded-full bg-white flex items-center justify-center">
              <CalendarIcon className="w-5 h-5 text-black" />
            </span>
            <span className="text-sm md:text-base font-semibold whitespace-nowrap">
              Prenota una Visita
            </span>
          </a>
        </div>
      </div>
    </section>
  )
}
