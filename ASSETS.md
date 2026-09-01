# ASSETS — dentista

Tutti gli asset sono serviti da `public/`. **Nessun URL esterno nel codice**: se un CDN di terzi
sparisce, il sito non cambia di una virgola.

## Inventario

Generati con **Pomelli** (Google Labs) a partire dal sito online: Pomelli ha letto
`dental-mu-inky.vercel.app`, ne ha ricavato il brand e ha prodotto foto e video gia' marchiati.
Le sorgenti originali (768x1365 le foto, 720x1280 i video) restano in `public/images/_nuove/` sul
disco locale ma sono escluse dal repo: 17 MB che non servono ne' al build ne' al deploy.

| File | Soggetto | Dove | Data |
|---|---|---|---|
| `public/images/igiene.webp` | Spazzolino sonico in uso, camicia senape | sezione 3, colonna alta | 2026-09-01 |
| `public/images/smile-gallery.webp` | Piano medio, interno studio caldo | sfondo mosaico sezione 2 | 2026-09-01 |
| `public/images/implant-1.webp` | Kit strumenti **AURA DENTAL** | sezione 3, riquadro sinistro | 2026-09-01 |
| `public/images/implant-2.webp` | Spazzolino sonico su marmo | sezione 3, riquadro destro | 2026-09-01 |
| `public/images/showcase.webp` | Visita con specchietto, bocca aperta | card di chiusura | 2026-09-01 |
| `public/video/studio.mp4` | Visita in studio, 8s muto in loop | **hero, colonna laterale** (nascosta sotto md) — unica immagine della sezione | 2026-09-01 |
| `public/video/igiene.mp4` | Spazzolino in bagno, 8s | **non usato**, disponibile | 2026-09-01 |

Licenza: generati per questo progetto tramite Pomelli sull'account del committente.

### Tre cose da sapere

**La hero non ha piu' una foto di sfondo.** Le tre barre e la card grande sono superfici chiare:
il peso visivo lo portano la tipografia e il video laterale. Il mosaico resta in uso solo nella
sezione 2. Se un giorno torna una foto nella hero, vale comunque la regola qui sotto.

**Il mosaico vuole inquadrature larghe.** Scala la foto sulla larghezza della sezione e ne mostra
circa un terzo in verticale. Su una figura intera quel terzo e' testa e spalle e funziona; su un
primo piano sono gli occhi, ed e' inutilizzabile. Verificato due volte, con due foto diverse.

**La risoluzione e' il limite.** Pomelli esporta a 768px di larghezza. Il mosaico scala le foto a
1440px, quasi 2x: sono state ingrandite con `lanczos3` piu' `sharpen`, ma su schermi grandi la
morbidezza si vede. Se Pomelli permette un export piu' grande, vale la pena rifarle.

**Il marchio nelle foto non e' uniforme.** Pomelli ha prodotto sia "Studio Aurora" sia
"AURA DENTAL". Il sito e' stato allineato al secondo (vedi `src/lib/brand.ts`), e per i due
riquadri prodotto sono state scelte le immagini compatibili. Le scartate restano in `_nuove/`.

**I video sono ricodificati.** Gli originali pesano ~1,9 MB ciascuno; `ffmpeg` a 540x960 CRF 30
senza audio li porta a ~280 KB, con `+faststart` per l'avvio progressivo. Ogni video ha un poster
`.webp`: `LoopingVideo` parte dal poster e passa al video solo se l'utente non ha chiesto
`prefers-reduced-motion: reduce`.

### Avatar della prova sociale


| File | Sorgente | Come | Data | Licenza |
|---|---|---|---|---|
| `public/images/avatars/smile.webp` | `smile-gallery.webp` | `npm run images` | 2026-09-01 | eredita l'originale |
| `public/images/avatars/hero.webp` | `hero.webp` | `npm run images` | 2026-09-01 | eredita l'originale |
| `public/images/avatars/showcase.webp` | `showcase.webp` | `npm run images` | 2026-09-01 | eredita l'originale |

Vanno pre-ritagliati e non ottenuti con `object-position`: le foto sorgente sono panoramiche, e
dentro un cerchio da 44px `object-cover` mostrerebbe l'intera altezza del fotogramma (maglione
compreso) invece del volto. Il ritaglio lo trova `sharp.strategy.attention`, che punta alla zona
più saliente — su un ritratto è il volto. `npm run images` li rifà a ogni passaggio: cambiando le
foto grandi, i tondini seguono da soli.

## La card di chiusura (`SectionShowcase`)

Il design viene da un riferimento fornito dal committente (immagine generata con Gemini,
`~/Pictures/dentista/`). Ne sono stati ripresi impaginazione, cornice pesca, annotazione tecnica
e gerarchia; **nessun pixel di quell'immagine è finito nel progetto** — testo e grafica erano
incorporati nella foto, quindi inutilizzabile come sfondo.

La sezione vuole un **primo piano frontale di un sorriso**. Al momento usa `patient.webp` con
ritaglio `50% 42%`, che ci va vicino ma non è una macro. Con una foto nuova vanno ritarate due
costanti in cima a `src/components/landing/SectionShowcase.tsx`:

- `SHOWCASE_FOCUS` — il punto della foto tenuto al centro del ritaglio
- `LEADER_END` — dove finisce la linea di richiamo, che deve cadere **su un dente**

## Come sostituirle

```bash
# 1. metti i file qui, con questi nomi (jpg, png, webp, jfif — qualsiasi dimensione)
public/images/_nuove/{hero,smile-gallery,implant-1,implant-2,patient}.jpg

# 2.
npm run images
```

Lo script converte in webp, ridimensiona, **rifiuta le immagini con proporzioni sbagliate**
spiegando il perché, e rigenera i tre avatar ritagliando sul volto (saliency, nessuna
coordinata da indovinare). Non serve riavviare il dev server: basta ricaricare il browser.

I nomi sono l'unico contratto. In alternativa allo script puoi sovrascrivere a mano i `.webp`
in `public/images/`: il codice non cambia comunque.

### Vincoli tecnici da rispettare

`hero.webp` e `smile-gallery.webp` non sono immagini normali: sono **sfondi condivisi** da più card
(tecnica MaskedCard). Ogni card mostra una finestra diversa della stessa immagine, e insieme
ricompongono un mosaico continuo.

> ⚠️ **Devono essere ORIZZONTALI, almeno 1.75:1.** Non verticali.
>
> MaskedCard scala l'immagine all'**altezza** della sezione:
> `backgroundSize: auto <altezzaSezione>px` con `no-repeat`. Una foto verticale, portata a
> quell'altezza, risulta molto più stretta del viewport e lascia una **fascia vuota a destra**.
> Il rapporto minimo è quello del viewport: 16:9 va sempre bene.
> Lo script rifiuta da solo tutto ciò che sta sotto 1.75:1.

- **Il punto focale sta a destra** (`focalX` 0.7–0.8): il volto va nella metà destra del fotogramma,
  a sinistra serve spazio negativo chiaro perché ci va sopra il titolo "Cure dentali" in nero.
- **Fondo chiaro e uniforme**, altrimenti il testo nero sopra la card hero non si legge.
- Il soggetto deve reggere **tagliato a fasce orizzontali**: le tre barre in alto ne mostrano
  strisce da 56–80 px.

Le altre tre sono immagini normali (`object-cover`), con un solo vincolo di forma:

| File | Forma | Perché |
|---|---|---|
| `implant-1` · `implant-2` | quadrata | stanno affiancate in una riga `flex-1` |
| `patient` | **verticale 2:3** | riempie una colonna alta, e la card di chiusura ne ritaglia una fascia attorno alla bocca |

### Da generare con

- ~~**Canva MCP**~~ → verificato il 2026-09-01: `generate-design` restituisce un **design impaginato**
  (headline, grafica, foto relegata a una fascia), non una fotografia. Va bene per poster e post
  social, non per gli asset di questa pagina.
- **Higgsfield MCP** → `generate_image` per il fotorealistico ⚠️ consuma crediti, e prompt/reference
  escono dalla rete: da valutare su progetti sotto NDA
- **Stock licenziato dal cliente** — la strada più sicura per una clinica vera

Il prompt va scritto sul **contesto del cliente reale**, mai sul brand segnaposto "Studio Aurora".

## Icone

Nessuna libreria di icone. L'unica icona (freccia diagonale delle card "Come si inserisce un
impianto" / "Curare gli impianti nel tempo") è un `<svg>` inline in `src/components/landing/App.tsx`, path
`M1 7h12m0 0L8 2m5 5L8 12` ruotato di -45°. Zero dipendenze.

## Font

`Open Sauce One`, caricato da `db.onlinewebfonts.com` in `src/app/(frontend)/layout.tsx` come da
spec, con fallback di sistema (`-apple-system, BlinkMacSystemFont, sans-serif`). Se anche i font
devono essere self-hosted, scarica i `.woff2` in `public/fonts/` e sostituisci i due `<link>` con
un `@font-face` in `globals.css`.
