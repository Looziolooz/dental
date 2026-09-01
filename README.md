# dentista — demo studio dentistico

Landing pubblica, prenotazione online e gestionale (agenda, pazienti, pagamenti) in un solo
progetto Next.js con Payload CMS su SQLite. **Niente Docker, niente servizi esterni**: si avvia
con `npm run dev`.

## Avvio

```bash
npm install
npm run seed     # una settimana di clinica finta: 4 odontoiatri, 6 prestazioni, ~95 appuntamenti
npm run dev
```

Per cambiare le foto della landing: metti i file in `public/images/_nuove/` con i nomi giusti e
lancia `npm run images`. Lo script converte, ridimensiona, **rifiuta le proporzioni incompatibili
col mosaico** e rigenera gli avatar. Specifica completa → [ASSETS.md](ASSETS.md).

| Dove | URL | Accesso |
|---|---|---|
| Landing | http://localhost:3000 | pubblica |
| Servizi | http://localhost:3000/servizi | pubblica |
| Scheda prestazione | http://localhost:3000/servizi/impianto | pubblica |
| Prenotazione online | http://localhost:3000/prenota | pubblica |
| Gestionale | http://localhost:3000/dashboard | login richiesto |
| CMS Payload | http://localhost:3000/admin | login richiesto |

Credenziali demo: `admin@studioaurora.it` / `demo1234`

Il seed non duplica mai nulla: se l'utente admin esiste già si limita a ri-applicare i testi delle
schede prestazione e lascia intatti appuntamenti, pazienti e pagamenti. Per ripartire da zero,
cancella `dentista.db` e rilancia `npm run seed`.

## Stack

- **Next.js 16** (App Router, Turbopack) + **React 19**
- **Tailwind CSS v4** — nessun file di config, solo `@import 'tailwindcss'`
- **Payload 3.88** con adapter **SQLite** (`@payloadcms/db-sqlite`, file `dentista.db`)
- Zero librerie di animazione e zero librerie di icone: transizioni CSS e SVG inline

## Struttura

```
src/
├── app/(frontend)/
│   ├── page.tsx              landing
│   ├── servizi/              elenco prestazioni e /servizi/[slug]
│   ├── prenota/              wizard di prenotazione + server action pubblica
│   └── dashboard/            gestionale (auth Payload), agenda · pazienti · pagamenti
├── app/(payload)/            admin CMS generato da Payload
├── collections/              Users · Patients · Dentists · Services · Appointments · Payments
├── components/landing/       App.tsx (3 sezioni da spec) + SectionShowcase.tsx (card di chiusura)
├── components/site/          header e footer delle pagine pubbliche interne
├── lib/clinic.ts             orari, colori, formati, helper di data
├── ../scripts/images.mjs     normalizza le foto della landing (npm run images)
├── seed/run.ts               dati demo
└── seed/services-content.ts  testi delle schede prestazione
```

Le due route group hanno **layout radice separati**: Tailwind vive solo in `(frontend)` e non
tocca il CSS dell'admin Payload.

## Le cose non ovvie

**Le immagini stanno in pannelli propri.** La versione iniziale spezzava una sola foto su piu'
card (tecnica MaskedCard) per ricomporre un mosaico. Con le foto verticali dei generatori quella
tecnica mostrava un terzo del fotogramma e continuava a inquadrare male, quindi e' stata rimossa:
ogni immagine ora vive in un pannello suo, con `object-cover`. Vincoli per sostituirle →
[ASSETS.md](ASSETS.md).

**La fine dello slot non si scrive a mano.** L'hook `beforeChange` di `Appointments` ricalcola
sempre `end` da `start` + `durationMinutes` della prestazione. Cambi la durata di una prestazione
e gli slot restano coerenti; non è possibile creare un appuntamento di durata sbagliata nemmeno
dall'admin.

**La card di chiusura vive fuori da App.tsx.** Le tre sezioni dello spec stanno in un file solo,
come richiesto. `SectionShowcase` è un'aggiunta successiva su riferimento del committente, con
SVG e annotazione propri: sta in `SectionShowcase.tsx` per non gonfiare App.tsx oltre le 700 righe.
Si sposta o si toglie cambiando una riga in fondo ad `App.tsx`.

**Sovrapposizioni in agenda.** `layoutOverlaps()` raggruppa gli appuntamenti che si toccano e li
affianca in colonne. Senza, due poltrone occupate alla stessa ora si coprirebbero a vicenda e la
seconda diventerebbe invisibile. Con 4 odontoiatri le colonne si stringono: il filtro per
odontoiatra in cima riporta la vista a piena larghezza.

## Le schede prestazione

`/servizi` e `/servizi/<slug>` si costruiscono dalla collection `services`: la scheda editoriale
(introduzione, benefici, fasi, FAQ, immagine) sta nella tab **Pagina pubblica** dell'admin, accanto
ai campi che governano calendario e listino. Cambi un prezzo e cambia in tre posti insieme: scheda,
wizard di prenotazione e fattura generata.

I testi di partenza vivono in `src/seed/services-content.ts` e vengono **ri-applicati a ogni
`npm run seed`**, anche su database gia' popolato: correggi un testo, rilanci il seed, lo vedi,
senza perdere appuntamenti e pazienti.

Le FAQ usano `<details>` nativo: si aprono anche senza JavaScript. Il pulsante di prenotazione
passa `?service=<slug>`, e il wizard parte gia' dal secondo passo con la prestazione scelta.

## Pagamenti

Il modulo è **completo lato gestione** — fatture numerate, stato, metodo, incasso, rimborso — ma
gli incassi si registrano a mano. Non c'è nessuno PSP collegato: è una demo.

Per il pagamento online reale servono le chiavi di uno PSP. Il campo `providerRef` su `payments`
è già lì per l'ID transazione, e `bookAppointment()` è il punto in cui creare la sessione di
checkout prima di restituire la conferma.

## Limiti noti, dichiarati

- **Asset provvisori.** Le 5 immagini vengono dallo spec di partenza, servite da `public/` ma con
  licenza non verificata. Vanno rigenerate prima di un uso reale → [ASSETS.md](ASSETS.md).
- **Le server action pubbliche scrivono con i permessi del server.** `/prenota` crea pazienti e
  appuntamenti via Local API senza rate limiting né captcha. Per la produzione serve almeno un
  rate limit sull'endpoint.
- **Nessun invio email.** Payload avvisa `No email adapter provided`: le mail di conferma finiscono
  in console. Va collegato un adapter SMTP/Resend.
- **`workingDays` è l'unica regola di disponibilità.** Non ci sono ferie, pause pranzo per singolo
  odontoiatra né chiusure straordinarie.
