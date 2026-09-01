import Link from 'next/link'
import { redirect } from 'next/navigation'
import React from 'react'

import { BRAND } from '@/lib/brand'
import { getCurrentUser } from '@/lib/payload'

const NAV = [
  { href: '/dashboard', label: 'Panoramica' },
  { href: '/dashboard/agenda', label: 'Agenda' },
  { href: '/dashboard/pazienti', label: 'Pazienti' },
  { href: '/dashboard/pagamenti', label: 'Pagamenti' },
]

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser()
  if (!user) redirect('/admin/login?redirect=%2Fdashboard')

  return (
    <div className="min-h-screen bg-stone-50">
      <header className="sticky top-0 z-40 bg-white/85 backdrop-blur-md border-b border-neutral-200">
        <div className="flex items-center justify-between gap-6 px-4 md:px-8 py-3">
          <Link href="/" className="flex flex-col shrink-0">
            <span className="text-lg md:text-xl font-extrabold uppercase tracking-tight leading-none">
              {BRAND.logoTop}
            </span>
            <span className="text-lg md:text-xl font-extrabold uppercase tracking-tight leading-none -mt-1.5">
              {BRAND.logoBottom}
            </span>
          </Link>

          <nav className="flex items-center gap-1 overflow-x-auto">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="px-3 md:px-4 py-2 rounded-full text-sm font-semibold text-neutral-700 hover:bg-black hover:text-white transition-colors duration-200 whitespace-nowrap"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="hidden md:flex items-center gap-3 shrink-0">
            <span className="text-xs font-semibold text-neutral-500">{user.email}</span>
            <Link
              href="/admin"
              className="px-4 py-2 rounded-full border border-black text-sm font-semibold hover:bg-black hover:text-white transition-colors duration-200"
            >
              CMS
            </Link>
          </div>
        </div>
      </header>

      <main className="px-4 md:px-8 py-6 md:py-8">{children}</main>
    </div>
  )
}
