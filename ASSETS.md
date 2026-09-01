# ASSETS — dentista

Tutti gli asset sono serviti da `public/`. **Nessun URL esterno nel codice**: se un CDN di terzi
sparisce, il sito non cambia di una virgola.

## Stato attuale: ⚠️ asset provvisori da sostituire

Le cinque immagini vengono dallo spec di partenza (MotionSites / Higgsfield). Sono state
**scaricate in locale** invece di essere linkate ai CDN `images.higgs.ai` / `d8j0ntlcm91z4.cloudfront.net`,
così il sito regge anche se quei CDN smettono di servire. Resta però imagery di terzi con
**licenza non verificata**: vanno rigenerate prima di qualsiasi uso reale con un cliente.

| File | Sorgente | Prompt / soggetto | Data | Licenza |
|---|---|---|---|---|
| `public/images/hero.webp` | Spec MotionSites (CDN Higgsfield) | Ritratto donna che sorride e strizza l'occhio, maglione rosso, occhiali in mano, fondo chiaro | 2026-09-01 | ⚠️ **non verificata** — provvisorio |
| `public/images/smile-gallery.webp` | Spec MotionSites (CDN Higgsfield) | Ritratto donna sorridente, top giallo senape, fondo chiaro | 2026-09-01 | ⚠️ **non verificata** — provvisorio |
| `public/images/implant-1.webp` | Spec MotionSites (CDN Higgsfield) | Render 3D corona dentale sopra vite implantare, fondo azzurro | 2026-09-01 | ⚠️ **non verificata** — provvisorio |
| `public/images/implant-2.webp` | Spec MotionSites (CDN Higgsfield) | Render 3D impianto avvitato nella gengiva fra due denti, fondo azzurro | 2026-09-01 | ⚠️ **non verificata** — provvisorio |
| `public/images/patient.webp` | Spec MotionSites (CDN Higgsfield) | Ritratto donna bionda che ride, maglione azzurro | 2026-09-01 | ⚠️ **non verificata** — provvisorio |

### Avatar della prova sociale

| File | Sorgente | Come | Data | Licenza |
|---|---|---|---|---|
| `public/images/avatars/smile.webp` | `smile-gallery.webp` | `npm run images` | 2026-09-01 | eredita l'originale ⚠️ |
| `public/images/avatars/hero.webp` | `hero.webp` | `npm run images` | 2026-09-01 | eredita l'originale ⚠️ |
| `public/images/avatars/patient.webp` | `patient.webp` | `npm run images` | 2026-09-01 | eredita l'originale ⚠️ |

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
