import { headers as nextHeaders } from 'next/headers'
import { getPayload } from 'payload'
import config from '@payload-config'

export const getPayloadClient = () => getPayload({ config })

/** Utente staff autenticato via cookie Payload, oppure null. */
export async function getCurrentUser() {
  const payload = await getPayloadClient()
  const { user } = await payload.auth({ headers: await nextHeaders() })
  return user ?? null
}
