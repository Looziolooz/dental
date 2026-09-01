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
 * `minRatio` esiste solo per i due sfondi del mosaico.
 *
 * MaskedCard scala l'immagine all'ALTEZZA della sezione (`backgroundSize: auto <h>px`,
 * `no-repeat`). Se la foto è verticale, alla stessa altezza risulta molto più stretta
 * dello schermo e resta una fascia vuota a destra. Serve che, scalata all'altezza della
 * sezione, sia almeno larga quanto il viewport: da qui il rapporto minimo 1.75:1.
 */
const TARGETS = [
  {
    name: 'hero',
    minRatio: 1.75,
    maxWidth: 2400,
    uso: 'sfondo mosaico — sezione 1',
    serve:
      'Orizzontale 16:9. Soggetto nella METÀ DESTRA, a sinistra spazio chiaro e vuoto: ci va sopra "Cure dentali" in nero. Le tre barre in alto ne mostrano strisce da 56-80px, quindi il soggetto deve reggere anche tagliato a fasce.',
  },
  {
    name: 'smile-gallery',
    minRatio: 1.75,
    maxWidth: 2400,
    uso: 'sfondo mosaico — sezione 2',
    serve:
      'Orizzontale 16:9. Soggetto a destra, fondo chiaro uniforme. Le card in vetro ci stanno sopra: niente dettagli importanti nella metà sinistra.',
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
    name: 'patient',
    minRatio: 0.45,
    maxWidth: 1600,
    uso: 'sezione 3 (colonna alta) + card di chiusura',
    serve:
      'VERTICALE, ritratto 2:3. Sorriso aperto e denti visibili: la card di chiusura ne ritaglia una fascia attorno alla bocca.',
  },
]

/** Da quali foto si ricavano gli avatar della prova sociale. */
const AVATAR_SOURCES = [
  ['smile', 'smile-gallery'],
  ['hero', 'hero'],
  ['patient', 'patient'],
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
        : dim(`rapporto minimo ${t.minRatio}:1`)
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
            ? 'Più stretta di così lascia una fascia vuota a destra nel mosaico.'
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
