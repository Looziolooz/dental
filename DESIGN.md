# DESIGN — Aura Dental (dentista)

Documentazione del sistema visivo **incombente**, rilevata dal codice costruito (landing prima,
pagine interne poi). Le superfici nuove ereditano questo mondo: non si inventa un'identità
per pagina.

## Mondo

- **Colore**: bianco `#fff` come fondo pagina; pannelli su `stone-50` e `zinc-200`; testo e
  superfici d'azione in nero pieno. Un solo accento: **pesca `#f6e3d5`**, riservato alla cornice
  della card di chiusura della landing e alla selezione del testo (`::selection`). Nessun altro
  colore decorativo — i colori di `DENTIST_STYLES` (slate/amber/emerald/indigo/rose) sono dati
  funzionali (identità dell'odontoiatra in agenda, dot su /studio, chip nel wizard), non palette.
- **Tipografia**: Open Sauce One, self-hostata (`public/fonts/`, OFL), pesi 400/500/600/700/800.
  Display bold con `tracking-tight` e leading 0.85–0.95, dimensioni `clamp()`. Body `font-medium`
  su `neutral-600`, note `text-xs font-semibold` su `neutral-400/500`.
- **Forme**: card e pannelli `rounded-xl md:rounded-2xl` separati da gap di pochi px
  (`gap-1.5 md:gap-2` sulla landing, `gap-3 md:gap-4` sulle interne); bottoni pill
  (`rounded-full`) neri o bianchi; cerchi bordati per numeri passo e frecce.
- **Foto**: solo asset in `public/images` (inventario e vincoli in [ASSETS.md](ASSETS.md)),
  `object-cover` con `object-position` esplicito; velature `bg-gradient-to-t from-black/50`
  per il testo bianco in sovrimpressione.
- **Motion**: entrata a cascata una-tantum (IntersectionObserver, translateY 24px, ease
  `cubic-bezier(0.16,1,0.3,1)`) sulla landing; hover su card (zoom immagine 1.03–1.05, bordo
  che scurisce, cerchio freccia che si riempie). `prefers-reduced-motion` neutralizza tutto
  (regola globale in `globals.css`).

## Grammatica delle label (decisione esplicita)

Il mondo usa **label brevi sentence-case** sopra o accanto agli heading — l'eyebrow dell'hero
("Studio dentistico a Milano"), "Consulenza" sulla card della landing, "Da qui si parte",
"Urgenze odontoiatriche", "Richiesta ricevuta". Sono parte della grammatica incombente e
restano. Cosa NON si usa: la variante **uppercase + tracking-wide** (rimossa il 2026-09-02
da tutte le superfici pubbliche) — l'unico maiuscolo tollerato è l'abbreviazione del giorno
sui chip del datepicker (`BookingWizard`), convenzione di calendario, non eyebrow.

## Composizione delle pagine interne

`SiteHeader` (nav con stato attivo, riga pill scorrevole sotto md) → `main max-w-6xl` →
eyebrow + **h1 display su due righe** + intro `max-w-3xl` → sezioni alternate (griglie di
pannelli / liste editoriali `border-t` con righe `border-b`) → **card CTA nera** con label,
heading bianco su due righe e pill bianca → `SiteFooter` (4 colonne + disclaimer demo).
Tutte le pagine tengono `min-h-screen`, tranne `/prenota` (il wizard corto allo step 1
lascerebbe una banda morta prima del footer).

## Vincoli

- Nessun asset da URL esterno (immagini, video, font). Tutto in `public/`.
- Demo dichiarata: dati fittizi, e i claim d'esempio si marcano **nel punto in cui appaiono**
  (es. "Recensioni d'esempio" nella card di chiusura).
- Contenuti editoriali di servizi e bio nel seed (`src/seed/`), ri-applicabili con
  `npm run seed` senza toccare agenda e pazienti.
