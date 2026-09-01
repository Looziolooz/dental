import { sqliteAdapter } from '@payloadcms/db-sqlite'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import path from 'path'
import { buildConfig } from 'payload'
import { fileURLToPath } from 'url'
import sharp from 'sharp'

import { Appointments } from './collections/Appointments'
import { Dentists } from './collections/Dentists'
import { Media } from './collections/Media'
import { Patients } from './collections/Patients'
import { Payments } from './collections/Payments'
import { Services } from './collections/Services'
import { Users } from './collections/Users'
import { BRAND } from './lib/brand'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: { baseDir: path.resolve(dirname) },
    meta: {
      titleSuffix: `— ${BRAND.name}`,
    },
  },
  collections: [Users, Patients, Dentists, Services, Appointments, Payments, Media],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || '',
  typescript: { outputFile: path.resolve(dirname, 'payload-types.ts') },
  // SQLite su file: nessun Docker, nessun servizio esterno da avviare.
  db: sqliteAdapter({
    client: { url: process.env.DATABASE_URI || 'file:./dentista.db' },
  }),
  sharp,
  plugins: [],
})
