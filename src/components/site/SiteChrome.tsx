'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import React from 'react'

import { BRAND } from '@/lib/brand'

/**
 * Header e footer delle pagine pubbliche interne (/servizi, /studio, /prezzi, /contatti, /prenota).
 * La landing ha una navbar propria, sovrapposta ai pannelli: qui serve invece
 * una barra opaca che non copra il contenuto.
 *
 * Client component per un solo motivo: `usePathname` accende la voce di menu attiva.
 */

const NAV_LINKS = [
  { label: 'Servizi', href: '/servizi' },
  { label: 'Lo studio', href: '/studio' },
  { label: 'Prezzi', href: '/prezzi' },
  { label: 'Contatti', href: '/contatti' },
]

export function Logo({ className = '' }: { className?: string }) {
  return (
    <Link href="/" className={`flex flex-col shrink-0 ${className}`}>
      <span className="text-xl md:text-2xl font-extrabold uppercase tracking-tight leading-none">
        {BRAND.logoTop}
      </span>
      <span className="text-xl md:text-2xl font-extrabold uppercase tracking-tight leading-none -mt-1.5 md:-mt-2">
        {BRAND.logoBottom}
      </span>
      <span className="text-[8px] md:text-[9px] font-medium leading-none mt-1.5 md:mt-2">
        {BRAND.tagline}
      </span>
    </Link>
  )
}

export function SiteHeader() {
  const pathname = usePathname()
  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`)

  return (
    <header className="sticky top-0 z-50 bg-white/85 backdrop-blur-md border-b border-neutral-200">
      <div className="max-w-6xl mx-auto flex items-center justify-between gap-4 px-4 md:px-6 py-2 md:py-3">
        <Logo />

        <nav aria-label="Principale" className="flex items-center gap-1 md:gap-2">
          <div className="hidden md:flex items-center">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                aria-current={isActive(link.href) ? 'page' : undefined}
                className={`px-4 py-2.5 rounded-full text-sm font-semibold transition-colors duration-200 ${
                  isActive(link.href)
                    ? 'bg-stone-100 text-black'
                    : 'text-black hover:bg-black hover:text-white'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Non tel:: questo link esiste solo su desktop, dove il protocollo telefono
              apre il dialogo "Scegli un'app" di Windows. La chiamata parte da /contatti. */}
          <Link
            href="/contatti#urgenze"
            className="hidden lg:inline text-sm font-semibold text-black px-2 hover:text-neutral-500 transition-colors"
          >
            Urgenze
          </Link>
          <Link
            href="/prenota"
            className="px-4 md:px-6 py-2 md:py-2.5 rounded-full bg-black text-white text-sm font-semibold hover:bg-neutral-800 transition-colors duration-200"
          >
            Prenota
          </Link>
        </nav>
      </div>

      {/* Sotto md le voci non stanno nella barra: riga scorrevole, nessun menu da aprire. */}
      <nav
        aria-label="Sezioni"
        className="md:hidden border-t border-neutral-100 overflow-x-auto scrollbar-none"
      >
        <div className="flex items-center gap-1 px-3 py-1.5 w-max">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              aria-current={isActive(link.href) ? 'page' : undefined}
              className={`px-3.5 py-1.5 rounded-full text-[13px] font-semibold whitespace-nowrap transition-colors ${
                isActive(link.href) ? 'bg-black text-white' : 'bg-stone-100 text-black'
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>
      </nav>
    </header>
  )
}

export function SiteFooter() {
  return (
    <footer className="border-t border-neutral-200 mt-16 md:mt-24">
      <div className="max-w-6xl mx-auto px-4 md:px-6 py-10 md:py-14 grid gap-10 md:gap-8 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <div>
          <Logo />
          <p className="text-xs font-medium text-neutral-500 mt-4 max-w-xs leading-relaxed">
            {BRAND.claim}. Prima visita e piano di cura senza costi, preventivo scritto prima di
            ogni trattamento.
          </p>
          <p className="text-xs font-medium text-neutral-500 mt-3">{BRAND.address}</p>
        </div>

        <div>
          <p className="text-xs font-semibold text-neutral-500 mb-3">Prestazioni</p>
          <ul className="flex flex-col gap-1.5 text-sm font-semibold">
            <li><Link href="/servizi/prima-visita" className="hover:text-neutral-500 transition-colors">Prima visita</Link></li>
            <li><Link href="/servizi/igiene" className="hover:text-neutral-500 transition-colors">Igiene professionale</Link></li>
            <li><Link href="/servizi/sbiancamento" className="hover:text-neutral-500 transition-colors">Sbiancamento</Link></li>
            <li><Link href="/servizi" className="hover:text-neutral-500 transition-colors">Tutte le prestazioni →</Link></li>
          </ul>
        </div>

        <div>
          <p className="text-xs font-semibold text-neutral-500 mb-3">Lo studio</p>
          <ul className="flex flex-col gap-1.5 text-sm font-semibold">
            <li><Link href="/studio" className="hover:text-neutral-500 transition-colors">Chi ti cura</Link></li>
            <li><Link href="/prezzi" className="hover:text-neutral-500 transition-colors">Prezzi</Link></li>
            <li><Link href="/contatti" className="hover:text-neutral-500 transition-colors">Contatti</Link></li>
            <li><Link href="/prenota" className="hover:text-neutral-500 transition-colors">Prenota online</Link></li>
          </ul>
        </div>

        <div>
          <p className="text-xs font-semibold text-neutral-500 mb-3">Contatti</p>
          <ul className="flex flex-col gap-1.5 text-sm font-semibold">
            <li><a href={BRAND.phoneHref} className="hover:text-neutral-500 transition-colors">{BRAND.phone}</a></li>
            <li><a href={`mailto:${BRAND.email}`} className="hover:text-neutral-500 transition-colors">{BRAND.email}</a></li>
            <li className="text-neutral-500 font-medium">{BRAND.hours}</li>
          </ul>
        </div>
      </div>

      <div className="border-t border-neutral-200">
        <p className="max-w-6xl mx-auto px-4 md:px-6 py-4 text-[11px] font-medium text-neutral-400">
          Demo dimostrativa. Dati, prezzi, recapiti e contenuti clinici sono fittizi.
        </p>
      </div>
    </footer>
  )
}
