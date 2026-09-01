import type { Metadata } from 'next'
import React from 'react'

import { BRAND, pageTitle } from '@/lib/brand'

import './globals.css'

export const metadata: Metadata = {
  title: pageTitle(),
  description: `Studio odontoiatrico a ${BRAND.city}: implantologia, faccette, sbiancamento e igiene. Prima visita gratuita, prenoti online in meno di un minuto.`,
}

export default function FrontendLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="it">
      <head>
        <link
          href="https://db.onlinewebfonts.com/c/1cd1e7d71e048159076fd90b39846902?family=Open+Sauce+One"
          rel="stylesheet"
        />
        <link
          href="https://db.onlinewebfonts.com/c/42acf9aa4a6dc2f2886a3f682e337ead?family=Open+Sauce+One+Bold"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  )
}
