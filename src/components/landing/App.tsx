'use client'

/**
 * Landing dello studio — tre schermate piene dello spec piu' la card di chiusura,
 * splash e navbar fissa.
 * Nome, claim e contatti vengono da src/lib/brand.ts.
 *
 * Tecnica portante: MASKED CARDS. Le sezioni 1 e 2 condividono una sola immagine di sfondo;
 * ogni card ne mostra una finestra diversa calcolando il proprio offset rispetto alla sezione.
 * Il risultato e' un mosaico coerente invece di N immagini scollegate.
 */

import React, { useCallback, useEffect, useRef, useState } from 'react'
import type { CSSProperties, ReactNode } from 'react'

import { BRAND } from '@/lib/brand'

import SectionShowcase from './SectionShowcase'

/* ------------------------------------------------------------------ asset */
// Serviti da /public: nessuna dipendenza da CDN di terzi.
const HERO_IMAGE = '/images/hero.webp'
const SECTION2_IMAGE = '/images/smile-gallery.webp'
const SECTION3_IMG1 = '/images/implant-1.webp'
const SECTION3_IMG2 = '/images/implant-2.webp'
const SECTION3_VIDEO = '/video/studio.mp4'
const SECTION3_VIDEO_POSTER = '/video/studio-poster.webp'

/**
 * Quanto scendere nella foto quando e' VERTICALE (0 = bordo alto, 1 = bordo basso).
 * Con un ritratto in piedi il volto sta in alto: valori bassi lo tengono nelle
 * tre barre. Ignorato del tutto sulle foto orizzontali.
 */
const HERO_FOCAL_Y = 0.12
const SECTION2_FOCAL_Y = 0.33

/* ------------------------------------------------------------------- dati */
const featureBars = ['Odontoiatria avanzata', "Strumenti all'avanguardia", 'Personale accogliente']

// I nomi vanno su due righe: il \n e' reso da whitespace-pre-line.
const services = [
  { name: 'Faccette\ndentali', num: '01', active: true },
  { name: 'Corone\ndentali', num: '02', active: false },
  { name: 'Sbiancamento\ndentale', num: '03', active: false },
  { name: 'Impianti\ndentali', num: null, active: false },
]

const navLinks = [
  { label: 'Home', href: '/#home' },
  { label: 'Servizi', href: '/servizi' },
  { label: 'Lo studio', href: '/#implants' },
  { label: 'Galleria', href: '/#gallery' },
  { label: 'Contatti', href: '/prenota' },
]

/* ------------------------------------------------------------------- hook */

type MaskPosition = { x: number; y: number; sw: number; sh: number }

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 767px)')
    const update = () => setIsMobile(mq.matches)
    update()
    mq.addEventListener('change', update)
    return () => mq.removeEventListener('change', update)
  }, [])

  return isMobile
}

/**
 * Offset di ogni card rispetto al contenitore di sezione.
 * Ricalcolato via ResizeObserver: al resize il mosaico resta allineato.
 */
function useMaskPositions(
  sectionRef: React.RefObject<HTMLElement | null>,
  cardsRef: React.RefObject<(HTMLDivElement | null)[]>,
) {
  const [positions, setPositions] = useState<MaskPosition[]>([])

  useEffect(() => {
    const section = sectionRef.current
    if (!section) return

    const compute = () => {
      const sr = section.getBoundingClientRect()
      setPositions(
        (cardsRef.current ?? []).map((el) => {
          if (!el) return { x: 0, y: 0, sw: sr.width, sh: sr.height }
          const cr = el.getBoundingClientRect()
          return { x: cr.left - sr.left, y: cr.top - sr.top, sw: sr.width, sh: sr.height }
        }),
      )
    }

    compute()
    const ro = new ResizeObserver(compute)
    ro.observe(section)
    const cards = cardsRef.current ?? []
    cards.forEach((el) => {
      if (el) ro.observe(el)
    })
    return () => ro.disconnect()
  }, [sectionRef, cardsRef])

  return positions
}

type MaskFit = { backgroundSize: string; offsetX: number; offsetY: number }

/**
 * Come adagiare l'immagine condivisa sulla sezione, in qualunque orientamento.
 *
 * Il mosaico funziona solo se l'immagine copre TUTTA la sezione: se resta
 * scoperto un lato, le card mostrano una fascia vuota. Ci sono due modi, e
 * quale serve dipende dalle proporzioni della foto rispetto a quelle della
 * sezione:
 *
 * - foto piu' larga della sezione → la scalo sull'ALTEZZA e faccio scorrere in
 *   orizzontale (focalX). E' il caso delle 16:9.
 * - foto piu' stretta → la scalo sulla LARGHEZZA e faccio scorrere in
 *   VERTICALE (focalY). E' il caso delle 9:16 che escono dai generatori.
 *
 * Prima esisteva solo il primo caso, e una foto verticale lasciava una banda
 * vuota a destra.
 */
function useMaskFit(
  src: string,
  sectionWidth: number,
  sectionHeight: number,
  focalX: number,
  focalY: number,
): MaskFit | null {
  const [natural, setNatural] = useState<{ w: number; h: number } | null>(null)

  useEffect(() => {
    const img = new window.Image()
    img.onload = () => setNatural({ w: img.naturalWidth, h: img.naturalHeight })
    img.src = src
  }, [src])

  if (!natural || !sectionWidth || !sectionHeight) return null

  const widthAtSectionHeight = natural.w * (sectionHeight / natural.h)

  if (widthAtSectionHeight >= sectionWidth) {
    return {
      backgroundSize: `auto ${sectionHeight}px`,
      offsetX: (widthAtSectionHeight - sectionWidth) * focalX,
      offsetY: 0,
    }
  }

  const heightAtSectionWidth = natural.h * (sectionWidth / natural.w)
  return {
    backgroundSize: `${sectionWidth}px auto`,
    offsetX: 0,
    offsetY: Math.max(heightAtSectionWidth - sectionHeight, 0) * focalY,
  }
}

/** Entrata a cascata: scatta una volta sola quando la sezione entra in viewport. */
function useStaggeredReveal(threshold = 0.15) {
  const containerRef = useRef<HTMLElement | null>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true)
          io.disconnect()
        }
      },
      { threshold },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [threshold])

  const getAnimStyle = useCallback(
    (index: number): CSSProperties => ({
      opacity: visible ? 1 : 0,
      transform: visible ? 'translateY(0)' : 'translateY(24px)',
      transition: `opacity 0.6s cubic-bezier(0.16,1,0.3,1) ${index * 120}ms, transform 0.6s cubic-bezier(0.16,1,0.3,1) ${index * 120}ms`,
    }),
    [visible],
  )

  return { containerRef, getAnimStyle }
}

/* ------------------------------------------------------------------ video */

/**
 * Video in loop muto, con il poster come stato di partenza.
 *
 * Parte dal poster e passa al video solo dopo il mount, quando so cosa vuole
 * l'utente: cosi' chi ha `prefers-reduced-motion: reduce` non vede mai un
 * fotogramma in movimento, e non c'e' disallineamento fra server e client.
 */
function LoopingVideo({
  src,
  poster,
  label,
  className,
}: {
  src: string
  poster: string
  label: string
  className?: string
}) {
  const [play, setPlay] = useState(false)

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    const update = () => setPlay(!mq.matches)
    update()
    mq.addEventListener('change', update)
    return () => mq.removeEventListener('change', update)
  }, [])

  if (!play) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={poster} alt={label} className={className} />
  }

  return (
    <video
      src={src}
      poster={poster}
      className={className}
      aria-label={label}
      autoPlay
      muted
      loop
      playsInline
      preload="metadata"
    />
  )
}

/* -------------------------------------------------------------- MaskedCard */

function MaskedCard({
  bgImage,
  position,
  fit,
  className,
  children,
  cardRef,
  style,
}: {
  bgImage: string
  position?: MaskPosition
  fit: MaskFit | null
  className?: string
  children?: ReactNode
  cardRef?: (el: HTMLDivElement | null) => void
  style?: CSSProperties
}) {
  const pos = position ?? { x: 0, y: 0, sw: 0, sh: 0 }

  return (
    <div
      ref={cardRef}
      className={className}
      style={{
        ...style,
        backgroundImage: `url(${bgImage})`,
        // Finche' non conosco le proporzioni della foto, `cover` evita il lampo bianco.
        backgroundSize: fit ? fit.backgroundSize : 'cover',
        backgroundPosition: fit
          ? `-${pos.x + fit.offsetX}px -${pos.y + fit.offsetY}px`
          : 'center',
        backgroundRepeat: 'no-repeat',
      }}
    >
      {children}
    </div>
  )
}

/* ------------------------------------------------------------ SplashScreen */

function SplashScreen({ onComplete }: { onComplete: () => void }) {
  const [count, setCount] = useState(0)
  const [exiting, setExiting] = useState(false)

  useEffect(() => {
    let step = 0
    const id = setInterval(() => {
      step += 1
      setCount(step)
      if (step >= 100) {
        clearInterval(id)
        setTimeout(() => setExiting(true), 200)
        setTimeout(onComplete, 900)
      }
    }, 20)
    return () => clearInterval(id)
  }, [onComplete])

  return (
    <div
      className={`fixed inset-0 z-[100] bg-white flex items-end justify-start transition-opacity duration-700 ${
        exiting ? 'opacity-0' : 'opacity-100'
      }`}
    >
      <span className="text-7xl md:text-9xl font-bold tabular-nums p-6 md:p-10 leading-none text-black">
        {count}
      </span>
    </div>
  )
}

/* ------------------------------------------------------------------ Navbar */

function Navbar() {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 md:px-6 py-2 md:py-3 bg-white/80 backdrop-blur-md">
        <a href="/#home" className="flex flex-col">
          <span className="text-xl md:text-2xl font-extrabold uppercase tracking-tight leading-none">
            {BRAND.logoTop}
          </span>
          <span className="text-xl md:text-2xl font-extrabold uppercase tracking-tight leading-none -mt-1.5 md:-mt-2">
            {BRAND.logoBottom}
          </span>
          <span className="text-[8px] md:text-[9px] font-medium leading-none mt-1.5 md:mt-2">
            {BRAND.tagline}
          </span>
        </a>

        <div className="hidden md:block">
          <div className="flex items-center gap-6">
            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              aria-expanded={open}
              className="px-6 py-3 bg-white rounded-full border border-black text-sm font-semibold hover:bg-black hover:text-white transition-colors duration-200"
            >
              Menu
            </button>
            <a href="tel:+390212345678" className="text-sm font-semibold text-black">Urgenze</a>
          </div>
        </div>

        <button
          type="button"
          aria-label={open ? 'Chiudi menu' : 'Apri menu'}
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
          className="md:hidden w-10 h-10 flex items-center justify-center relative"
        >
          <span
            className={`absolute h-0.5 w-6 bg-black rounded-full transition-all duration-300 ease-[cubic-bezier(0.76,0,0.24,1)] ${
              open ? 'rotate-45 translate-y-0' : '-translate-y-2'
            }`}
          />
          <span
            className={`absolute h-0.5 w-6 bg-black rounded-full transition-all duration-300 ease-[cubic-bezier(0.76,0,0.24,1)] ${
              open ? 'opacity-0 scale-x-0' : 'opacity-100 scale-x-100'
            }`}
          />
          <span
            className={`absolute h-0.5 w-6 bg-black rounded-full transition-all duration-300 ease-[cubic-bezier(0.76,0,0.24,1)] ${
              open ? '-rotate-45 translate-y-0' : 'translate-y-2'
            }`}
          />
        </button>
      </nav>

      {/* Pannello condiviso: lo apre l'hamburger su mobile e il pulsante "Menu" su desktop. */}
      <div className={`fixed inset-0 z-40 ${open ? '' : 'pointer-events-none'}`}>
        <div
          onClick={() => setOpen(false)}
          className={`absolute inset-0 bg-black/20 backdrop-blur-sm transition-opacity duration-500 ${
            open ? 'opacity-100' : 'opacity-0'
          }`}
        />
        <div
          className={`absolute top-0 right-0 h-full w-[85%] max-w-sm bg-white shadow-2xl transition-transform duration-500 ease-[cubic-bezier(0.76,0,0.24,1)] ${
            open ? 'translate-x-0' : 'translate-x-full'
          }`}
        >
          <div className="flex flex-col justify-center h-full px-8 gap-1">
            {navLinks.map((link, i) => (
              <a
                key={link.label}
                href={link.href}
                onClick={() => setOpen(false)}
                className={`text-4xl font-bold text-black hover:text-neutral-500 transition-all duration-500 ease-[cubic-bezier(0.76,0,0.24,1)] ${
                  open ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8'
                }`}
                style={{ transitionDelay: open ? `${100 + i * 60}ms` : '0ms' }}
              >
                {link.label}
              </a>
            ))}

            <div
              className={`mt-8 pt-8 border-t border-neutral-200 transition-all duration-500 ease-[cubic-bezier(0.76,0,0.24,1)] ${
                open ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8'
              }`}
              style={{ transitionDelay: open ? '450ms' : '0ms' }}
            >
              <p className="text-sm font-semibold text-black mb-4">Urgenze odontoiatriche</p>
              <a
                href="/prenota"
                className="block text-center w-full px-6 py-4 bg-black rounded-full text-white text-sm font-semibold hover:bg-neutral-800 transition-colors duration-200"
              >
                Prenota una visita
              </a>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

/* --------------------------------------------------------------- SECTION 1 */

function SectionHero() {
  const sectionRef = useRef<HTMLElement | null>(null)
  const cardsRef = useRef<(HTMLDivElement | null)[]>([])
  const reveal = useStaggeredReveal()
  const isMobile = useIsMobile()

  const positions = useMaskPositions(sectionRef, cardsRef)
  const fit = useMaskFit(
    HERO_IMAGE,
    positions[0]?.sw ?? 0,
    positions[0]?.sh ?? 0,
    isMobile ? 0.7 : 0.8,
    HERO_FOCAL_Y,
  )

  const setRefs = (el: HTMLElement | null) => {
    sectionRef.current = el
    reveal.containerRef.current = el
  }
  const setCard = (i: number) => (el: HTMLDivElement | null) => {
    cardsRef.current[i] = el
  }

  const mask = { bgImage: HERO_IMAGE, fit }

  return (
    <section
      id="home"
      ref={setRefs}
      className="h-screen w-full overflow-hidden flex flex-col pt-24 md:pt-24 px-3 md:px-5 pb-1.5 md:pb-2 gap-1.5 md:gap-2"
    >
      {featureBars.map((label, i) => (
        <MaskedCard
          key={label}
          {...mask}
          position={positions[i]}
          cardRef={setCard(i)}
          style={reveal.getAnimStyle(i)}
          className="w-full h-14 md:h-20 shrink-0 rounded-xl md:rounded-2xl overflow-hidden relative"
        >
          <span className="flex items-center justify-center h-full text-black text-lg md:text-3xl font-bold text-center relative z-10">
            {label}
          </span>
        </MaskedCard>
      ))}

      <MaskedCard
        {...mask}
        position={positions[3]}
        cardRef={setCard(3)}
        style={reveal.getAnimStyle(3)}
        className="w-full flex-1 min-h-0 rounded-xl md:rounded-2xl overflow-hidden relative"
      >
        <p className="absolute top-4 left-4 md:top-7 md:left-7 text-black text-xs md:text-sm font-semibold leading-4 md:leading-5 max-w-[200px] md:max-w-[300px] z-10">
          Cure odontoiatriche professionali,
          <br />
          con la tecnologia di oggi
        </p>

        <div className="absolute bottom-5 left-3 md:bottom-8 md:left-4 z-10">
          <span className="block text-black text-xs md:text-sm font-semibold mb-1 md:mb-2">
            {BRAND.claim}
          </span>
          <h1 className="text-black text-[clamp(3rem,11vw,11rem)] font-bold leading-[0.79] tracking-tight">
            Cure
            <br />
            dentali
          </h1>
        </div>

        <span className="absolute bottom-6 right-4 md:bottom-10 md:right-8 text-white text-xs md:text-sm font-semibold z-10 [text-shadow:0_1px_6px_rgb(0_0_0_/_0.6)]">
          Prima visita gratuita
        </span>
      </MaskedCard>
    </section>
  )
}

/* --------------------------------------------------------------- SECTION 2 */

function SectionGallery() {
  const sectionRef = useRef<HTMLElement | null>(null)
  const cardsRef = useRef<(HTMLDivElement | null)[]>([])
  const reveal = useStaggeredReveal()
  const isMobile = useIsMobile()

  const positions = useMaskPositions(sectionRef, cardsRef)
  const fit = useMaskFit(
    SECTION2_IMAGE,
    positions[0]?.sw ?? 0,
    positions[0]?.sh ?? 0,
    isMobile ? 0.65 : 0.8,
    SECTION2_FOCAL_Y,
  )

  const setRefs = (el: HTMLElement | null) => {
    sectionRef.current = el
    reveal.containerRef.current = el
  }
  const setCard = (i: number) => (el: HTMLDivElement | null) => {
    cardsRef.current[i] = el
  }

  const mask = { bgImage: SECTION2_IMAGE, fit }

  return (
    <section
      id="gallery"
      ref={setRefs}
      className="min-h-screen md:h-screen w-full overflow-hidden flex flex-col pt-1.5 md:pt-2 px-3 md:px-5 pb-1.5 md:pb-2 gap-1.5 md:gap-2"
    >
      <div className="flex-1 min-h-0 grid grid-cols-1 md:grid-cols-2 grid-rows-[auto_auto_auto_auto] md:grid-rows-[1fr_1fr_0.8fr] gap-1.5 md:gap-2">
        <MaskedCard
          {...mask}
          position={positions[0]}
          cardRef={setCard(0)}
          style={reveal.getAnimStyle(0)}
          className="rounded-xl md:rounded-2xl overflow-hidden relative min-h-[160px] md:min-h-0"
        >
          <h2 className="absolute top-4 left-5 md:top-6 md:left-7 text-white md:text-black text-2xl md:text-3xl font-bold z-10">
            I nostri sorrisi
          </h2>
          <span className="absolute bottom-4 left-5 md:bottom-6 md:left-7 text-white md:text-black text-xs md:text-sm font-semibold z-10">
            Il nostro lavoro di estetica dentale
          </span>
        </MaskedCard>

        <MaskedCard
          {...mask}
          position={positions[1]}
          cardRef={setCard(1)}
          style={reveal.getAnimStyle(1)}
          className="md:row-span-2 rounded-xl md:rounded-2xl overflow-hidden relative min-h-[200px] md:min-h-0"
        >
          <p className="absolute bottom-16 left-5 md:bottom-20 md:left-7 text-white text-xs md:text-sm font-semibold leading-4 md:leading-5 z-10 [text-shadow:0_1px_6px_rgb(0_0_0_/_0.6)]">
            Se vuoi un sorriso che si nota,
            <br />
            chiamaci e parliamo del tuo progetto.
          </p>
          <a
            href="tel:+390212345678"
            className="absolute bottom-4 right-4 md:bottom-6 md:right-6 px-5 py-3 md:px-8 md:py-5 bg-white rounded-full text-black text-base md:text-xl font-bold z-10 hover:scale-105 transition-transform"
          >
            Chiamaci
          </a>
        </MaskedCard>

        <MaskedCard
          {...mask}
          position={positions[2]}
          cardRef={setCard(2)}
          style={reveal.getAnimStyle(2)}
          className="rounded-xl md:rounded-2xl overflow-hidden relative min-h-[160px] md:min-h-0"
        >
          <h2 className="absolute top-4 left-5 md:top-6 md:left-7 text-white md:text-black text-[clamp(3rem,7vw,6rem)] font-bold leading-[0.9] z-10">
            Nuovo
            <br />
            sorriso
          </h2>
        </MaskedCard>

        <MaskedCard
          {...mask}
          position={positions[3]}
          cardRef={setCard(3)}
          style={reveal.getAnimStyle(3)}
          className="col-span-1 md:col-span-2 rounded-xl md:rounded-2xl overflow-hidden relative min-h-[200px] md:min-h-0"
        >
          <div className="absolute inset-0 z-10 flex flex-wrap md:flex-nowrap gap-1.5 md:gap-2 p-2 md:p-3">
            {services.map((svc) => (
              <div
                key={svc.name}
                className={`flex-1 min-w-[calc(50%-4px)] md:min-w-0 rounded-xl md:rounded-2xl p-3 md:p-5 flex flex-col justify-between ${
                  svc.active ? 'bg-white/90 backdrop-blur-md' : 'bg-white/20 backdrop-blur-xl'
                }`}
              >
                <h3
                  className={`text-xl md:text-4xl font-bold leading-[1.05] whitespace-pre-line ${
                    svc.active ? 'text-black' : 'text-white'
                  }`}
                >
                  {svc.name}
                </h3>
                {svc.num && (
                  <span
                    className={`self-end w-8 h-8 md:w-12 md:h-12 rounded-full border flex items-center justify-center text-xs md:text-sm font-semibold ${
                      svc.active ? 'border-black text-black' : 'border-white text-white'
                    }`}
                  >
                    {svc.num}
                  </span>
                )}
              </div>
            ))}
          </div>
        </MaskedCard>
      </div>
    </section>
  )
}

/* --------------------------------------------------------------- SECTION 3 */

function ArrowIcon({ className = '' }: { className?: string }) {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 14 14"
      fill="none"
      className={`rotate-[-45deg] ${className}`}
      aria-hidden="true"
    >
      <path
        d="M1 7h12m0 0L8 2m5 5L8 12"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function SectionImplants() {
  const reveal = useStaggeredReveal()

  return (
    <section
      id="implants"
      ref={(el) => {
        reveal.containerRef.current = el
      }}
      className="min-h-screen md:h-screen w-full overflow-hidden flex flex-col pt-1.5 md:pt-2 px-3 md:px-5 pb-1.5 md:pb-2 gap-1.5 md:gap-2"
    >
      <div className="flex-1 min-h-0 grid grid-cols-1 md:grid-cols-2 gap-1.5 md:gap-2">
        <div className="flex flex-col gap-1.5 md:gap-2">
          <div
            style={reveal.getAnimStyle(0)}
            className="rounded-xl md:rounded-2xl bg-stone-50 p-5 md:p-7 flex flex-col justify-between flex-[1.2] min-h-[180px] md:min-h-0"
          >
            <h2 className="text-[clamp(3rem,7vw,6.5rem)] font-bold leading-[0.95] text-black">
              Igiene
              <br />
              quotidiana
            </h2>
            <p className="text-xs md:text-sm font-semibold text-black">Il kit che ti diamo alla prima visita</p>
          </div>

          <div
            style={reveal.getAnimStyle(1)}
            className="flex gap-1.5 md:gap-2 flex-1 min-h-[140px] md:min-h-0"
          >
            <div className="flex-1 rounded-xl md:rounded-2xl overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={SECTION3_IMG1}
                alt="Il kit di igiene Aura Dental"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex-1 rounded-xl md:rounded-2xl overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={SECTION3_IMG2}
                alt="Spazzolino sonico Aura Dental"
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          <div
            style={reveal.getAnimStyle(2)}
            className="rounded-xl md:rounded-2xl bg-zinc-200 p-5 md:p-7 flex items-end justify-between flex-[0.8] min-h-[160px] md:min-h-0"
          >
            <div>
              <p className="text-xs md:text-sm font-semibold text-black mb-2 md:mb-3">
                Consulenza
              </p>
              <h3 className="text-xl md:text-3xl font-bold text-black leading-6 md:leading-8">
                Igiene
                <br />
                professionale
                <br />
                ogni sei mesi
              </h3>
            </div>
            <a
              href="/prenota"
              className="px-5 py-3 md:px-8 md:py-5 bg-white rounded-full text-black text-base md:text-xl font-bold hover:scale-105 transition-transform"
            >
              Prenota online
            </a>
          </div>
        </div>

        <div
          style={reveal.getAnimStyle(3)}
          className="rounded-xl md:rounded-2xl overflow-hidden relative min-h-[350px] md:min-h-0"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <LoopingVideo
            src={SECTION3_VIDEO}
            poster={SECTION3_VIDEO_POSTER}
            label="Una visita nello studio"
            className="w-full h-full object-cover"
          />

          {/* Velatura in basso: sotto le due card il video schiarisce e il testo bianco si perde. */}
          <div className="absolute inset-x-0 bottom-0 h-64 bg-gradient-to-t from-black/55 to-transparent pointer-events-none" />

          <div className="absolute bottom-3 left-3 right-3 md:bottom-5 md:left-5 md:right-5 flex gap-1.5 md:gap-2">
            <div className="flex-1 bg-white rounded-xl md:rounded-2xl p-3 md:p-5 flex flex-col justify-between h-36 md:h-52">
              <h4 className="text-lg md:text-2xl font-bold text-black leading-5 md:leading-7">
                Come si
                <br />
                svolge
                <br />
                una visita
              </h4>
              <span className="self-end w-9 h-9 md:w-12 md:h-12 rounded-full border border-black flex items-center justify-center">
                <ArrowIcon />
              </span>
            </div>

            <div className="flex-1 bg-white/20 backdrop-blur-xl rounded-xl md:rounded-2xl p-3 md:p-5 flex flex-col justify-between h-36 md:h-52">
              <h4 className="text-lg md:text-2xl font-bold text-white leading-5 md:leading-7">
                Cosa
                <br />
                controlliamo
                <br />
                ogni volta
              </h4>
              <span className="self-end w-9 h-9 md:w-12 md:h-12 rounded-full border border-white flex items-center justify-center">
                <ArrowIcon className="text-white" />
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

/* -------------------------------------------------------------------- App */

export default function App() {
  const [showSplash, setShowSplash] = useState(true)
  const handleSplashComplete = useCallback(() => setShowSplash(false), [])

  return (
    <div className="bg-white">
      {showSplash && <SplashScreen onComplete={handleSplashComplete} />}
      <Navbar />
      <SectionHero />
      <SectionGallery />
      <SectionImplants />
      <SectionShowcase />
    </div>
  )
}
