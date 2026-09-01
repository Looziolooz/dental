import { SiteFooter, SiteHeader } from '@/components/site/SiteChrome'
import { BRAND, pageTitle } from '@/lib/brand'
import { getPayloadClient } from '@/lib/payload'

import BookingWizard from './BookingWizard'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: pageTitle('Prenota'),
  description: 'Scegli prestazione, odontoiatra e orario. Conferma in meno di un minuto.',
}

export default async function BookingPage({
  searchParams,
}: {
  searchParams: Promise<{ service?: string }>
}) {
  const { service: initialServiceSlug } = await searchParams
  const payload = await getPayloadClient()

  const [services, dentists] = await Promise.all([
    payload.find({
      collection: 'services',
      depth: 0,
      limit: 50,
      sort: 'priceEur',
      where: { active: { equals: true } },
    }),
    payload.find({
      collection: 'dentists',
      depth: 0,
      limit: 50,
      sort: 'name',
      where: { active: { equals: true } },
    }),
  ])

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <SiteHeader />

      <main className="flex-1 max-w-3xl w-full mx-auto px-4 md:px-6 py-10 md:py-16 flex flex-col gap-8">
        <header>
          <p className="text-xs md:text-sm font-semibold text-neutral-500">
            {BRAND.claim}
          </p>
          <h1 className="text-[clamp(3rem,9vw,6rem)] font-bold leading-[0.85] tracking-tight mt-2">
            Prenota
            <br />
            online
          </h1>
        </header>

        <BookingWizard
          initialServiceSlug={initialServiceSlug}
          services={services.docs.map((s) => ({
            id: s.id,
            slug: s.slug,
            name: s.name,
            description: s.description ?? '',
            durationMinutes: s.durationMinutes,
            priceEur: s.priceEur,
          }))}
          dentists={dentists.docs.map((d) => ({
            id: d.id,
            name: d.name,
            role: d.role,
            color: d.color ?? 'slate',
          }))}
        />
      </main>

      <SiteFooter />
    </div>
  )
}
