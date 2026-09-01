'use client'

/**
 * Landing dello studio — tre schermate piene dello spec piu' la card di chiusura,
 * splash e navbar fissa.
 * Nome, claim e contatti vengono da src/lib/brand.ts.
 *
 * Impaginazione a pannelli: ogni sezione e' una griglia di card ad angoli tondi separate da
 * pochi pixel, e ogni immagine sta in un pannello suo. La versione precedente spezzava una sola
 * foto su piu' card (mosaico); non e' piu' in uso.
 */

import React, { useCallback, useEffect, useRef, useState } from 'react'
import type { CSSProperties, ReactNode } from 'react'

import { BRAND } from '@/lib/brand'

import SectionShowcase from './SectionShowcase'

/* ------------------------------------------------------------------ asset */
// Serviti da /public: nessuna dipendenza da CDN di terzi.
const SECTION2_IMAGE = '/images/smile-gallery.webp'
const SECTION3_IMG1 = '/images/implant-1.webp'
const SECTION3_IMG2 = '/images/implant-2.webp'
const SECTION3_IMG3 = '/images/igiene.webp'
const HERO_VIDEO = '/video/studio.mp4'
const HERO_VIDEO_POSTER = '/video/studio-poster.webp'

/* ------------------------------------------------------------------- dati */
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
  const reveal = useStaggeredReveal()

  return (
    <section
      id="home"
      ref={(el) => {
        reveal.containerRef.current = el
      }}
      className="h-screen w-full overflow-hidden flex pt-24 md:pt-24 px-3 md:px-5 pb-1.5 md:pb-2 gap-1.5 md:gap-2"
    >
      <div
        style={reveal.getAnimStyle(0)}
        className="flex-1 min-w-0 rounded-xl md:rounded-2xl bg-stone-50 relative overflow-hidden"
      >
        <p className="absolute top-5 left-5 md:top-8 md:left-8 text-black text-xs md:text-sm font-semibold leading-4 md:leading-5 max-w-[220px] md:max-w-[320px]">
          Cure odontoiatriche professionali,
          <br />
          con la tecnologia di oggi
        </p>

        <div className="absolute bottom-5 left-3 md:bottom-8 md:left-4">
          <span className="block text-black text-xs md:text-sm font-semibold mb-1 md:mb-2">
            {BRAND.claim}
          </span>
          <h1 className="text-black text-[clamp(3.5rem,12vw,12rem)] font-bold leading-[0.79] tracking-tight">
            Cure
            <br />
            dentali
          </h1>
        </div>

        <span className="absolute bottom-6 right-4 md:bottom-10 md:right-8 text-black text-xs md:text-sm font-semibold">
          Prima visita gratuita
        </span>
      </div>

      {/* Colonna video: i 9:16 dei generatori ci stanno senza ritagli, ed e'
          l'unica immagine della sezione. Nascosta sotto md, dove l'hero e'
          gia' pieno per l'altezza. */}
      <div
        style={reveal.getAnimStyle(1)}
        className="hidden md:block w-[30%] shrink-0 rounded-2xl overflow-hidden relative"
      >
        <LoopingVideo
          src={HERO_VIDEO}
          poster={HERO_VIDEO_POSTER}
          label="Una visita nello studio"
          className="w-full h-full object-cover"
        />
      </div>
    </section>
  )
}

/* --------------------------------------------------------------- SECTION 2 */

function SectionGallery() {
  const reveal = useStaggeredReveal()

  return (
    <section
      id="gallery"
      ref={(el) => {
        reveal.containerRef.current = el
      }}
      className="min-h-screen md:h-screen w-full overflow-hidden flex flex-col pt-1.5 md:pt-2 px-3 md:px-5 pb-1.5 md:pb-2 gap-1.5 md:gap-2"
    >
      <div className="flex-1 min-h-0 grid grid-cols-1 md:grid-cols-2 md:grid-rows-[1fr_1fr_0.8fr] gap-1.5 md:gap-2">
        {/* La foto sta tutta qui: una colonna sola, non piu' spezzata su tutta la sezione. */}
        <div
          style={reveal.getAnimStyle(0)}
          className="md:row-span-2 rounded-xl md:rounded-2xl overflow-hidden relative min-h-[320px] md:min-h-0"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={SECTION2_IMAGE}
            alt="Sorriso dopo un trattamento di estetica dentale"
            className="w-full h-full object-cover"
            style={{ objectPosition: '50% 32%' }}
          />
          <div className="absolute inset-x-0 bottom-0 h-56 bg-gradient-to-t from-black/60 to-transparent" />
          <h2 className="absolute bottom-5 left-5 md:bottom-7 md:left-7 text-white text-[clamp(3rem,7vw,6rem)] font-bold leading-[0.9]">
            Nuovo
            <br />
            sorriso
          </h2>
        </div>

        <div
          style={reveal.getAnimStyle(1)}
          className="rounded-xl md:rounded-2xl bg-stone-50 p-5 md:p-7 flex flex-col justify-between min-h-[160px] md:min-h-0"
        >
          <h2 className="text-2xl md:text-3xl font-bold text-black">I nostri sorrisi</h2>
          <span className="text-xs md:text-sm font-semibold text-black">
            Il nostro lavoro di estetica dentale
          </span>
        </div>

        <div
          style={reveal.getAnimStyle(2)}
          className="rounded-xl md:rounded-2xl bg-zinc-200 p-5 md:p-7 flex flex-col justify-between min-h-[180px] md:min-h-0"
        >
          <p className="text-xs md:text-sm font-semibold text-black leading-4 md:leading-5">
            Se vuoi un sorriso che si nota,
            <br />
            chiamaci e parliamo del tuo progetto.
          </p>
          <a
            href={BRAND.phoneHref}
            className="self-end px-5 py-3 md:px-8 md:py-5 bg-white rounded-full text-black text-base md:text-xl font-bold hover:scale-105 transition-transform"
          >
            Chiamaci
          </a>
        </div>

        <div
          style={reveal.getAnimStyle(3)}
          className="col-span-1 md:col-span-2 flex flex-wrap md:flex-nowrap gap-1.5 md:gap-2 min-h-[200px] md:min-h-0"
        >
          {services.map((svc) => (
            <div
              key={svc.name}
              className={`flex-1 min-w-[calc(50%-4px)] md:min-w-0 rounded-xl md:rounded-2xl p-3 md:p-5 flex flex-col justify-between ${
                svc.active ? 'bg-black text-white' : 'bg-stone-100 text-black'
              }`}
            >
              <h3 className="text-xl md:text-4xl font-bold leading-[1.05] whitespace-pre-line">
                {svc.name}
              </h3>
              {svc.num && (
                <span
                  className={`self-end w-8 h-8 md:w-12 md:h-12 rounded-full border flex items-center justify-center text-xs md:text-sm font-semibold ${
                    svc.active ? 'border-white' : 'border-black'
                  }`}
                >
                  {svc.num}
                </span>
              )}
            </div>
          ))}
        </div>
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
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={SECTION3_IMG3}
            alt="Spazzolino sonico durante l'igiene quotidiana"
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
