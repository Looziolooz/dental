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
| `public/images/visita.webp` | Controllo alla poltrona con specchietto | `/studio` hero · fallback prima visita | 2026-09-02 |
| `public/images/accoglienza.webp` | Paziente col caffè, lobby in marmo | `/studio` e `/contatti`, pannello accoglienza | 2026-09-02 |
| `public/images/ritratto.webp` | Ritratto sorridente, fondo chiaro | fallback faccette | 2026-09-02 |
| `public/images/sorriso-studio.webp` | Sorriso in sala visite, maglione rosso | fallback sbiancamento · rail di `/prenota` | 2026-09-02 |
| `public/images/kit.webp` | Kit **AURA DENTAL** con brochure rossa | `/studio` pannello kit (fallback impianto è `showcase.webp`: kit e implant-1 sono quasi identici e le card sarebbero adiacenti) | 2026-09-02 |

| `public/images/corona.webp` | Ritaglio macro di `showcase.webp` (denti + specchietto) | fallback corona | 2026-09-02 |
| `public/images/impianto.webp` | Ritaglio strumenti di `implant-1.webp` | fallback impianto | 2026-09-02 |

Le righe del 2026-09-02 vengono dalle sorgenti Pomelli già in `_nuove/`: sono state promosse
(sharp, webp q82, max 1600px) scegliendo solo gli scatti **senza marchio o marchiati AURA DENTAL**.
Gli scatti "Studio Aurora" / "Aurora" restano in `_nuove/` e non vanno usati: brand sbagliato.
`corona.webp` e `impianto.webp` sono **ritagli derivati** (sharp `extract`), come gli avatar:
servivano sei foto distinte per sei card e il set utilizzabile ne offriva quattro.

Licenza: generati per questo progetto tramite Pomelli sull'account del committente.

### Tre cose da sapere

**La hero non ha foto.** Le tre barre sono state tolte e la card grande e' una superficie chiara:
il peso visivo lo portano la tipografia e il video laterale.

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
| `public/images/avatars/igiene.webp` | `igiene.webp` | `npm run images` | 2026-09-01 | eredita l'originale |
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
public/images/_nuove/{igiene,smile-gallery,implant-1,implant-2,showcase,visita,accoglienza,ritratto,sorriso-studio,kit}.jpg

# 2.
npm run images
```

Lo script converte in webp, ridimensiona, **rifiuta le immagini con proporzioni sbagliate**
spiegando il perché, e rigenera i tre avatar ritagliando sul volto (saliency, nessuna
coordinata da indovinare). Non serve riavviare il dev server: basta ricaricare il browser.

I nomi sono l'unico contratto. In alternativa allo script puoi sovrascrivere a mano i `.webp`
in `public/images/`: il codice non cambia comunque.

### Vincoli tecnici da rispettare

Nessuna immagine e' piu' condivisa fra card: ognuna sta in un pannello suo con `object-cover`,
quindi **qualsiasi orientamento va bene**. Conta solo dove cade il soggetto nel ritaglio, che si
governa con `object-position` sul singolo pannello.

| File | Forma consigliata | Perche' |
|---|---|---|
| `smile-gallery` | verticale o quadrata | riempie una colonna alta a sinistra, col titolo in sovrimpressione in basso |
| `implant-1` · `implant-2` | quadrata | stanno affiancate in una riga `flex-1` |
| `igiene` | verticale 2:3 | colonna alta della sezione 3 |
| `showcase` | verticale 2:3 | la card di chiusura ritaglia una fascia attorno alla bocca, e la linea di richiamo deve cadere su un dente |

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

`Open Sauce One`, **self-hostato** in `public/fonts/` (cinque pesi woff2: 400/500/600/700/800,
~15 KB l'uno, convertiti dai TTF ufficiali con `wawoff2`). Sorgente:
`github.com/marcologous/Open-Sauce-Fonts`, licenza SIL OFL (copia in `public/fonts/OFL.txt`).
I `@font-face` stanno in `globals.css`, il preload dei due pesi del primo viewport in
`src/app/(frontend)/layout.tsx`. Il vecchio caricamento da `db.onlinewebfonts.com` è stato
rimosso il 2026-09-02: era l'ultimo asset servito da un CDN di terzi.
