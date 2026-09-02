/**
 * Popola il database con una settimana di clinica realistica.
 * Idempotente: se trova gia' l'utente admin, non duplica nulla.
 *
 *   npm run seed
 */
import { getPayload } from 'payload'
import type { Payload } from 'payload'
import config from '../payload.config.js'
import { SERVICES_CONTENT } from './services-content.js'

const ADMIN_EMAIL = 'admin@auradental.it'
const ADMIN_PASSWORD = 'demo1234'
/** Email dei brand precedenti: se ne trovo una la rinomino, invece di creare un doppione. */
const LEGACY_ADMIN_EMAILS = ['admin@dentalhealth.it', 'admin@studioaurora.it']

const DENTISTS = [
  {
    name: 'Dott.ssa Elena Ferri',
    role: 'Implantologia e chirurgia',
    color: 'indigo',
    bio: 'Pianifica ogni impianto al computer su TAC 3D e opera con dima chirurgica. Segue i casi complessi e le riabilitazioni complete.',
  },
  {
    name: 'Dott. Marco Bianchi',
    role: 'Odontoiatria conservativa',
    color: 'emerald',
    bio: 'Otturazioni, intarsi e corone: il suo lavoro è salvare denti. Prima di proporre una protesi ti spiega cosa si può ancora conservare.',
  },
  {
    name: 'Dott.ssa Sara Conti',
    role: 'Ortodonzia',
    color: 'amber',
    bio: 'Allineatori trasparenti e ortodonzia fissa, per adulti e ragazzi. Ogni piano parte da una scansione digitale, mai dal calco.',
  },
  {
    name: 'Dott. Luca Ricci',
    role: 'Igiene e prevenzione',
    color: 'rose',
    bio: 'Guida i richiami di igiene e insegna la manutenzione quotidiana. È chi vedrai più spesso, perché tu veda gli altri il meno possibile.',
  },
] as const

// Solo i campi che governano calendario e listino. Testi e contenuto della pagina
// pubblica stanno in services-content.ts, applicati da applyServiceContent().
const SERVICES = [
  { name: 'Prima visita e check-up', slug: 'prima-visita', durationMinutes: 30, priceEur: 0 },
  { name: 'Igiene professionale', slug: 'igiene', durationMinutes: 45, priceEur: 90 },
  { name: 'Sbiancamento', slug: 'sbiancamento', durationMinutes: 60, priceEur: 280 },
  { name: 'Faccette dentali', slug: 'faccette', durationMinutes: 90, priceEur: 650 },
  { name: 'Corona dentale', slug: 'corona', durationMinutes: 90, priceEur: 780 },
  { name: 'Impianto dentale', slug: 'impianto', durationMinutes: 120, priceEur: 1450 },
]

/**
 * Riversa il contenuto editoriale sulle prestazioni esistenti.
 * Gira a ogni seed, anche su database gia' popolato: correggi un testo in
 * services-content.ts, rilanci `npm run seed` e lo vedi, senza perdere gli appuntamenti.
 */
async function applyServiceContent(payload: Payload) {
  let updated = 0
  for (const [slug, content] of Object.entries(SERVICES_CONTENT)) {
    const found = await payload.find({
      collection: 'services',
      where: { slug: { equals: slug } },
      limit: 1,
      depth: 0,
    })
    const doc = found.docs[0]
    if (!doc) continue

    await payload.update({
      collection: 'services',
      id: doc.id,
      data: {
        description: content.description,
        intro: content.intro,
        benefits: content.benefits,
        steps: content.steps,
        faq: content.faq,
      },
    })
    updated++
  }
  return updated
}

/**
 * Come applyServiceContent, ma per le bio degli odontoiatri: si correggono qui
 * e si rilancia `npm run seed`, senza toccare agenda e colori scelti dall'admin.
 */
async function applyDentistBios(payload: Payload) {
  let updated = 0
  for (const d of DENTISTS) {
    const found = await payload.find({
      collection: 'dentists',
      where: { name: { equals: d.name } },
      limit: 1,
      depth: 0,
    })
    const doc = found.docs[0]
    if (!doc) continue

    await payload.update({ collection: 'dentists', id: doc.id, data: { bio: d.bio } })
    updated++
  }
  return updated
}

const PATIENTS = [
  'Giulia Moretti', 'Andrea Russo', 'Chiara Esposito', 'Matteo Greco', 'Francesca Rizzo',
  'Davide Marino', 'Alessia Gallo', 'Simone Costa', 'Martina Fontana', 'Lorenzo Barbieri',
  'Valentina Serra', 'Federico Pellegrini', 'Sofia De Luca', 'Riccardo Villa', 'Elisa Caruso',
]

const slug = (n: string) => n.toLowerCase().replace(/[^a-z]+/g, '.').replace(/^\.|\.$/g, '')

/** Lunedi' della settimana corrente, a mezzanotte. */
function mondayOfThisWeek() {
  const d = new Date()
  d.setHours(0, 0, 0, 0)
  const dow = d.getDay() === 0 ? 7 : d.getDay()
  d.setDate(d.getDate() - (dow - 1))
  return d
}

const seed = async () => {
  const payload = await getPayload({ config })

  const existing = await payload.find({
    collection: 'users',
    where: { email: { in: [ADMIN_EMAIL, ...LEGACY_ADMIN_EMAILS] } },
    limit: 1,
  })
  if (existing.totalDocs > 0) {
    const admin = existing.docs[0]
    if (admin.email !== ADMIN_EMAIL) {
      const previous = admin.email
      await payload.update({ collection: 'users', id: admin.id, data: { email: ADMIN_EMAIL } })
      payload.logger.info(`Admin rinominato: ${previous} -> ${ADMIN_EMAIL}`)
    }
    const updated = await applyServiceContent(payload)
    const bios = await applyDentistBios(payload)
    payload.logger.info(
      `Seed gia' eseguito: aggiornato il contenuto di ${updated} prestazioni e ${bios} bio, il resto e' intatto.`,
    )
    process.exit(0)
  }

  await payload.create({
    collection: 'users',
    data: { email: ADMIN_EMAIL, password: ADMIN_PASSWORD, name: 'Direzione clinica', role: 'admin' },
  })

  const dentists = []
  for (const d of DENTISTS) {
    dentists.push(
      await payload.create({
        collection: 'dentists',
        data: { ...d, active: true, workingDays: ['1', '2', '3', '4', '5'] },
      }),
    )
  }

  const services = []
  for (const s of SERVICES) {
    services.push(await payload.create({ collection: 'services', data: { ...s, active: true } }))
  }
  await applyServiceContent(payload)

  const patients = []
  for (const name of PATIENTS) {
    patients.push(
      await payload.create({
        collection: 'patients',
        data: {
          fullName: name,
          email: `${slug(name)}@example.com`,
          phone: `+39 3${Math.floor(10 + Math.random() * 89)} ${Math.floor(1000000 + Math.random() * 8999999)}`,
          source: (['online', 'phone', 'referral', 'walk_in'] as const)[Math.floor(Math.random() * 4)],
        },
      }),
    )
  }

  // Agenda: lunedi'-venerdi', 09:00-18:00, riempimento ~60%.
  const monday = mondayOfThisWeek()
  const startHours = [9, 10, 11, 12, 14, 15, 16, 17]
  const today = new Date()
  let created = 0

  for (let day = 0; day < 5; day++) {
    for (const dentist of dentists) {
      for (const hour of startHours) {
        if (Math.random() > 0.6) continue

        const start = new Date(monday)
        start.setDate(monday.getDate() + day)
        start.setHours(hour, Math.random() > 0.5 ? 0 : 30, 0, 0)

        const service = services[Math.floor(Math.random() * services.length)]
        const patient = patients[Math.floor(Math.random() * patients.length)]
        const past = start < today

        const status = past
          ? Math.random() > 0.12
            ? 'completed'
            : Math.random() > 0.5
              ? 'no_show'
              : 'cancelled'
          : Math.random() > 0.25
            ? 'confirmed'
            : 'pending'

        const appointment = await payload.create({
          collection: 'appointments',
          data: {
            patient: patient.id,
            dentist: dentist.id,
            service: service.id,
            start: start.toISOString(),
            end: start.toISOString(), // ricalcolato dall'hook beforeChange
            status,
          },
        })
        created++

        // Fatturazione: solo le prestazioni a pagamento generano un movimento.
        if (service.priceEur > 0 && status !== 'cancelled') {
          await payload.create({
            collection: 'payments',
            data: {
              appointment: appointment.id,
              patient: patient.id,
              amountEur: service.priceEur,
              method: (['card', 'cash', 'transfer', 'insurance'] as const)[Math.floor(Math.random() * 4)],
              status: status === 'completed' ? (Math.random() > 0.2 ? 'paid' : 'pending') : 'pending',
            },
          })
        }
      }
    }
  }

  payload.logger.info(`Seed completato: ${created} appuntamenti, ${patients.length} pazienti.`)
  payload.logger.info(`Login gestionale: ${ADMIN_EMAIL} / ${ADMIN_PASSWORD}`)
  process.exit(0)
}

seed().catch((err) => {
  console.error(err)
  process.exit(1)
})
