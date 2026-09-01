import Link from 'next/link'
import React from 'react'

import { BRAND } from '@/lib/brand'

/**
 * Header e footer delle pagine pubbliche interne (/servizi, /prenota).
 * La landing ha una navbar propria, sovrapposta al mosaico: qui serve invece
 * una barra opaca che non copra il contenuto.
 */

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
  return (
    <header className="sticky top-0 z-50 bg-white/85 backdrop-blur-md border-b border-neutral-200">
      <div className="max-w-6xl mx-auto flex items-center justify-between gap-4 px-4 md:px-6 py-2 md:py-3">
        <Logo />

        <nav className="flex items-center gap-1 md:gap-2">
          <Link
            href="/servizi"
            className="px-3 md:px-5 py-2 md:py-2.5 rounded-full text-sm font-semibold hover:bg-black hover:text-white transition-colors duration-200"
          >
            Servizi
          </Link>
          <a
            href={BRAND.phoneHref}
            className="hidden md:inline text-sm font-semibold text-black px-2 hover:text-neutral-500 transition-colors"
          >
            Urgenze
          </a>
          <Link
            href="/prenota"
            className="px-4 md:px-6 py-2 md:py-2.5 rounded-full bg-black text-white text-sm font-semibold hover:bg-neutral-800 transition-colors duration-200"
          >
            Prenota
          </Link>
        </nav>
      </div>
    </header>
  )
}

export function SiteFooter() {
  return (
    <footer className="border-t border-neutral-200 mt-16 md:mt-24">
      <div className="max-w-6xl mx-auto px-4 md:px-6 py-10 md:py-14 grid gap-8 md:grid-cols-3">
        <div>
          <Logo />
          <p className="text-xs font-medium text-neutral-500 mt-4 max-w-xs">
            {BRAND.claim}. Prima visita e piano di cura senza costi.
          </p>
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
          Demo dimostrativa. Dati, prezzi e contenuti clinici sono fittizi.
        </p>
      </div>
    </footer>
  )
}
