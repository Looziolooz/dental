import type { Metadata } from 'next'
import React from 'react'

import { BRAND, pageTitle } from '@/lib/brand'

import './globals.css'

export const metadata: Metadata = {
  title: pageTitle(),
  description: `Studio odontoiatrico a ${BRAND.city}: implantologia, faccette, sbiancamento e igiene. Prima visita gratuita, prenoti online in meno di un minuto.`,
}

export default function FrontendLayout({ children }: { children: React.ReactNode }) {
  // Font: Open Sauce One self-hostato, @font-face in globals.css (public/fonts, OFL).
  // Niente preload manuale: React 19 perde l'`as` sui <link> hoisted e il browser
  // scarta il preload con un warning; a 15 KB per peso non cambia nulla.
  return (
    <html lang="it">
      <body>{children}</body>
    </html>
  )
}
