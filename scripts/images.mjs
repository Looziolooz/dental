/**
 * Normalizza le foto della landing.
 *
 *   1. metti i file in  public/images/_nuove/   (jpg, png, webp, jfif — qualsiasi dimensione)
 *   2. npm run images
 *
 * Lo script converte in webp, ridimensiona, RIFIUTA le immagini con proporzioni
 * incompatibili col mosaico, e rigenera gli avatar ritagliando sul volto.
 *
 * I nomi contano: il file va chiamato come la destinazione (hero.jpg -> hero.webp).
 */
import path from 'node:path'
import fs from 'node:fs'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const IMAGES = path.join(root, 'public', 'images')
const DROP = path.join(IMAGES, '_nuove')
const AVATARS = path.join(IMAGES, 'avatars')

/**
 * `minRatio` e' il rapporto minimo largo/alto accettato per ogni destinazione.
 *
 * I due sfondi del mosaico ora accettano qualsiasi orientamento: `useMaskFit` sceglie
 * da solo se scalare sull'altezza e scorrere in orizzontale (foto larghe) o scalare
 * sulla larghezza e scorrere in verticale (foto strette). Restano soglie basse solo
 * per fermare i formati assurdi, che nessun ritaglio salverebbe.
 */
const TARGETS = [
  {
    name: 'igiene',
    minRatio: 0.4,
    maxWidth: 1600,
    uso: 'sezione 3 — colonna alta',
    serve: 'VERTICALE. Un gesto di igiene quotidiana, soggetto riconoscibile a mezzo busto.',
  },
  {
    name: 'smile-gallery',
    minRatio: 0.4,
    maxWidth: 2400,
    uso: 'sfondo mosaico — sezione 2',
    serve:
      'Qualsiasi orientamento, fondo chiaro uniforme. Le card in vetro ci stanno sopra: niente dettagli importanti dove cadono.',
  },
  {
    name: 'implant-1',
    minRatio: 0.7,
    maxWidth: 1600,
    uso: 'sezione 3 — riquadro sinistro',
    serve: 'Quadrata. Render o macro di una corona dentale, fondo tenue e uniforme.',
  },
  {
    name: 'implant-2',
    minRatio: 0.7,
    maxWidth: 1600,
    uso: 'sezione 3 — riquadro destro',
    serve: 'Quadrata. Render o macro di una vite implantare, stessa palette di implant-1.',
  },
  {
    name: 'showcase',
    minRatio: 0.45,
    maxWidth: 1600,
    uso: 'card di chiusura',
    serve:
      'VERTICALE, ritratto 2:3. Sorriso aperto e denti visibili: la card ne ritaglia una fascia attorno alla bocca, e la linea di richiamo deve poter cadere su un dente.',
  },
  {
    name: 'visita',
    minRatio: 0.4,
    maxWidth: 1600,
    uso: '/studio — hero · fallback prima visita',
    serve: 'VERTICALE. Un controllo alla poltrona: odontoiatra e paziente riconoscibili.',
  },
  {
    name: 'accoglienza',
    minRatio: 0.4,
    maxWidth: 1600,
    uso: '/studio e /contatti — pannello accoglienza',
    serve: 'VERTICALE. L’attesa vissuta: una persona a suo agio, luce calda, niente camici.',
  },
  {
    name: 'ritratto',
    minRatio: 0.4,
    maxWidth: 1600,
    uso: 'fallback faccette',
    serve: 'VERTICALE. Ritratto sorridente su fondo chiaro uniforme, denti in vista.',
  },
  {
    name: 'sorriso-studio',
    minRatio: 0.4,
    maxWidth: 1600,
    uso: 'fallback sbiancamento · rail di /prenota',
    serve: 'VERTICALE. Sorriso in primo piano dentro la sala visite.',
  },
  {
    name: 'kit',
    minRatio: 0.4,
    maxWidth: 1600,
    uso: '/studio — pannello kit',
    serve: 'VERTICALE. Still life del kit marchiato AURA DENTAL su fondo neutro.',
  },
]

/** Da quali foto si ricavano gli avatar della prova sociale. */
const AVATAR_SOURCES = [
  ['smile', 'smile-gallery'],
  ['igiene', 'igiene'],
  ['showcase', 'showcase'],
]

const EXTS = ['.jpg', '.jpeg', '.png', '.webp', '.jfif', '.avif']

const green = (s) => `\x1b[32m${s}\x1b[0m`
const red = (s) => `\x1b[31m${s}\x1b[0m`
const dim = (s) => `\x1b[2m${s}\x1b[0m`
const bold = (s) => `\x1b[1m${s}\x1b[0m`

function findDropped(name) {
  if (!fs.existsSync(DROP)) return null
  for (const f of fs.readdirSync(DROP)) {
    const ext = path.extname(f).toLowerCase()
    if (!EXTS.includes(ext)) continue
    if (path.basename(f, ext).toLowerCase() === name) return path.join(DROP, f)
  }
  return null
}

function printSpec() {
  console.log(bold('\nCosa serve, e dove metterlo\n'))
  console.log(`Cartella: ${dim(path.relative(root, DROP))}\n`)
  for (const t of TARGETS) {
    const vincolo =
      t.minRatio >= 1.75
        ? red(`orizzontale, almeno ${t.minRatio}:1`)
        : dim(`qualsiasi orientamento (minimo ${t.minRatio}:1)`)
    console.log(`  ${bold(t.name)}  ${dim('— ' + t.uso)}`)
    console.log(`    ${vincolo}`)
    console.log(`    ${t.serve}\n`)
  }
  console.log(dim('Estensioni accettate: ' + EXTS.join(' ') + '\n'))
}

async function run() {
  fs.mkdirSync(DROP, { recursive: true })
  fs.mkdirSync(AVATARS, { recursive: true })

  const pending = TARGETS.map((t) => ({ t, src: findDropped(t.name) })).filter((x) => x.src)

  if (pending.length === 0) {
    console.log(red('\nNessun file da elaborare in public/images/_nuove/'))
    printSpec()
    process.exit(0)
  }

  let written = 0
  let rejected = 0
  console.log('')

  for (const { t, src } of pending) {
    const meta = await sharp(src).metadata()
    const ratio = meta.width / meta.height
    const dest = path.join(IMAGES, `${t.name}.webp`)

    if (ratio < t.minRatio) {
      rejected++
      console.log(red(`✗ ${t.name}`) + dim(`  ${meta.width}x${meta.height}  (${ratio.toFixed(2)}:1)`))
      console.log(
        `   Serve almeno ${t.minRatio}:1. ` +
          (t.minRatio >= 1.75
            ? 'Troppo stretta anche per il mosaico a scorrimento verticale.'
            : 'Il ritaglio taglierebbe via il soggetto.'),
      )
      console.log(dim(`   ${t.serve}\n`))
      continue
    }

    const info = await sharp(src)
      .resize({ width: Math.min(meta.width, t.maxWidth), withoutEnlargement: true })
      .webp({ quality: 82 })
      .toFile(dest)

    written++
    console.log(
      green(`✓ ${t.name}.webp`) +
        dim(`  ${info.width}x${info.height}  ${Math.round(info.size / 1024)}KB  (${ratio.toFixed(2)}:1)`),
    )
  }

  // Gli avatar seguono sempre le foto: se cambia un volto, cambia anche il tondino.
  console.log('')
  for (const [avatar, source] of AVATAR_SOURCES) {
    const src = path.join(IMAGES, `${source}.webp`)
    if (!fs.existsSync(src)) continue
    // `strategy.attention` ritaglia sulla zona più saliente: su un ritratto è il volto.
    const info = await sharp(src)
      .resize(120, 120, { fit: 'cover', position: sharp.strategy.attention })
      .webp({ quality: 88 })
      .toFile(path.join(AVATARS, `${avatar}.webp`))
    console.log(green(`✓ avatars/${avatar}.webp`) + dim(`  ${Math.round(info.size / 1024)}KB`))
  }

  console.log(
    `\n${written} immagini aggiornate` +
      (rejected ? red(`, ${rejected} rifiutate`) : '') +
      dim('  ·  ricarica il browser, non serve riavviare il dev server\n'),
  )

  if (rejected) process.exit(1)
}

run().catch((err) => {
  console.error(red('\nErrore: ') + err.message)
  process.exit(1)
})
