/**
 * Contenuto editoriale delle pagine /servizi/<slug>.
 *
 * Vive separato dal resto del seed perche' viene ri-applicato a ogni `npm run seed`,
 * anche su un database gia' popolato: cosi' si puo' correggere un testo qui e rivederlo
 * subito, senza buttare via appuntamenti e pazienti.
 */

export type ServiceContent = {
  description: string
  intro: string
  benefits: { title: string; text: string }[]
  steps: { title: string; text: string }[]
  faq: { question: string; answer: string }[]
}

/**
 * Immagine di riserva quando il campo `image` del CMS e' vuoto.
 * Ci sono 5 immagini per 6 prestazioni: `hero` e' ripetuta su sbiancamento e faccette,
 * messe in posizioni non adiacenti nella griglia. Caricando le immagini vere dal CMS
 * questa mappa smette di servire.
 */
export const SERVICE_FALLBACK_IMAGE: Record<string, string> = {
  'prima-visita': '/images/patient.webp',
  igiene: '/images/smile-gallery.webp',
  sbiancamento: '/images/hero.webp',
  faccette: '/images/hero.webp',
  corona: '/images/implant-1.webp',
  impianto: '/images/implant-2.webp',
}

export const SERVICES_CONTENT: Record<string, ServiceContent> = {
  'prima-visita': {
    description: 'Visita completa con radiografia panoramica e piano di cura. Gratuita.',
    intro:
      'La prima visita serve a capire da dove si parte, non a vendere un trattamento. Guardiamo denti, gengive e articolazione, facciamo una panoramica digitale e ti consegniamo un piano di cura scritto con i costi. Se non serve fare nulla, te lo diciamo.',
    benefits: [
      {
        title: 'Nessun costo, nessun impegno',
        text: 'La visita e la panoramica sono gratuite. Il piano di cura resta tuo anche se decidi di curarti altrove.',
      },
      {
        title: 'Preventivo scritto',
        text: 'Ogni voce ha un prezzo e una priorità: cosa serve adesso, cosa può aspettare, cosa è solo estetico.',
      },
      {
        title: 'Radiografia digitale',
        text: 'Panoramica a bassa dose, visibile subito sullo schermo. Te ne diamo copia da portare via.',
      },
    ],
    steps: [
      { title: 'Anamnesi', text: 'Dieci minuti sulla tua storia clinica, farmaci e allergie. Se hai dolore, partiamo da lì.' },
      { title: 'Esame e panoramica', text: 'Controllo di denti, gengive e occlusione, poi la radiografia panoramica digitale.' },
      { title: 'Piano di cura', text: 'Ti spieghiamo cosa abbiamo trovato e ti consegniamo il preventivo, per iscritto.' },
    ],
    faq: [
      { question: 'Devo portare qualcosa?', answer: 'Radiografie recenti se le hai, e l’elenco dei farmaci che assumi. Nient’altro.' },
      { question: 'Quanto dura?', answer: 'Trenta minuti. Se serve più tempo te lo diciamo prima, non a poltrona occupata.' },
      { question: 'E se ho paura del dentista?', answer: 'Dillo in fase di prenotazione. La prima visita non prevede strumenti rotanti né aghi: si guarda e si parla.' },
    ],
  },

  igiene: {
    description: 'Ablazione del tartaro, air-flow e lucidatura.',
    intro:
      'La seduta di igiene professionale rimuove placca e tartaro dove lo spazzolino non arriva, sopra e sotto il bordo gengivale. È la cosa che, a parità di spesa, fa più differenza sulla salute della bocca nel lungo periodo.',
    benefits: [
      { title: 'Gengive che smettono di sanguinare', text: 'Il sanguinamento allo spazzolino sparisce di solito entro due settimane dalla seduta.' },
      { title: 'Macchie rimosse', text: 'Caffè, tè e fumo lasciano pigmentazioni che l’air-flow rimuove senza sbiancare chimicamente.' },
      { title: 'Controllo incluso', text: 'Ogni seduta include un controllo: le carie piccole si vedono qui, quando costano poco.' },
    ],
    steps: [
      { title: 'Ablazione', text: 'Rimozione del tartaro con punta a ultrasuoni, sopra e sotto gengiva.' },
      { title: 'Air-flow', text: 'Getto di aria, acqua e polvere di glicina per le pigmentazioni sulle superfici lisce.' },
      { title: 'Lucidatura e fluoro', text: 'Pasta abrasiva fine per rallentare il riformarsi della placca, poi applicazione di fluoro.' },
    ],
    faq: [
      { question: 'Ogni quanto va fatta?', answer: 'Ogni sei mesi per la maggior parte delle persone. Ogni tre o quattro se fumi o hai avuto parodontite.' },
      { question: 'Fa male?', answer: 'Fastidio sì, dolore no. Se hai colletti sensibili possiamo usare un anestetico topico.' },
      { question: 'Sbianca i denti?', answer: 'No. Riporta i denti al loro colore naturale togliendo le macchie. Per schiarirli serve lo sbiancamento.' },
    ],
  },

  sbiancamento: {
    description: 'Sbiancamento professionale alla poltrona.',
    intro:
      'Sbiancamento alla poltrona con gel a base di perossido, attivato in tre passaggi da quindici minuti. Si parte sempre da una seduta di igiene: sbiancare sopra il tartaro dà un risultato a chiazze.',
    benefits: [
      { title: 'Risultato in una seduta', text: 'Mediamente tre o quattro gradi di scala VITA, visibili lo stesso giorno.' },
      { title: 'Gengive protette', text: 'Diga di resina fotopolimerizzata sul bordo gengivale prima di applicare il gel.' },
      { title: 'Mantenimento incluso', text: 'Esci con le indicazioni sui primi due giorni, quando lo smalto è più ricettivo ai pigmenti.' },
    ],
    steps: [
      { title: 'Rilievo del colore', text: 'Fotografia con scala colori, per avere un prima e dopo misurabile e non a memoria.' },
      { title: 'Isolamento', text: 'Applicazione della diga gengivale e del divaricatore.' },
      { title: 'Tre passaggi di gel', text: 'Quindici minuti ciascuno, con controllo della sensibilità fra un passaggio e l’altro.' },
    ],
    faq: [
      { question: 'Quanto dura il risultato?', answer: 'Da uno a tre anni, a seconda di fumo, caffè e vino rosso.' },
      { question: 'Funziona su corone e otturazioni?', answer: 'No. La ceramica e il composito non sbiancano: se sono in zona visibile vanno rifatti dopo, sul nuovo colore.' },
      { question: 'Mi verranno sensibili?', answer: 'Una sensibilità al freddo per 24-48 ore è comune e passa da sola. Un dentifricio desensibilizzante aiuta.' },
    ],
  },

  faccette: {
    description: 'Faccette in ceramica, per singolo elemento.',
    intro:
      'Sottili lamine di ceramica incollate sulla superficie esterna del dente, per correggere forma, colore e piccoli disallineamenti. Il prezzo indicato è per singolo elemento: un sorriso completo ne richiede in genere da sei a dieci.',
    benefits: [
      { title: 'Preparazione minima', text: 'Si limano pochi decimi di millimetro di smalto, molto meno di una corona.' },
      { title: 'Colore stabile', text: 'La ceramica non si pigmenta come il composito: il colore resta quello anche dopo anni di caffè.' },
      { title: 'Prova prima di incollare', text: 'Vedi il progetto in bocca con un mock-up provvisorio e lo approvi prima che si tocchi lo smalto.' },
    ],
    steps: [
      { title: 'Progetto e mock-up', text: 'Scansione digitale e prova estetica in resina direttamente sui tuoi denti.' },
      { title: 'Preparazione e impronta', text: 'Limatura minima, impronta digitale, faccette provvisorie fino alla consegna.' },
      { title: 'Cementazione', text: 'Prova del colore, poi incollaggio adesivo definitivo elemento per elemento.' },
    ],
    faq: [
      { question: 'Quanto durano?', answer: 'Dieci-quindici anni con una buona igiene. Il punto debole non è la ceramica ma la gengiva.' },
      { question: 'Posso mangiare normalmente?', answer: 'Sì. Evita di mordere direttamente cose molto dure, come si fa con i denti naturali.' },
      { question: 'Sono reversibili?', answer: 'No. Lo smalto rimosso non torna: è una scelta definitiva, per quanto minima.' },
    ],
  },

  corona: {
    description: 'Corona in zirconia su elemento naturale.',
    intro:
      'Quando un dente è troppo compromesso perché un’otturazione regga, la corona lo riveste per intero e gli restituisce forma e funzione. Usiamo zirconia monolitica: resistente alla masticazione posteriore, senza il bordo scuro delle vecchie corone metallo-ceramica.',
    benefits: [
      { title: 'Salva il dente naturale', text: 'Meglio una corona su radice sana che un’estrazione seguita da un impianto.' },
      { title: 'Nessun bordo grigio', text: 'La zirconia non ha sottostruttura metallica: il margine gengivale resta chiaro nel tempo.' },
      { title: 'Impronta digitale', text: 'Scanner intraorale al posto della pasta da impronta. Niente conati, precisione maggiore.' },
    ],
    steps: [
      { title: 'Preparazione', text: 'Rifinitura del dente e, se serve, ricostruzione del moncone.' },
      { title: 'Scansione e provvisorio', text: 'Impronta digitale e corona provvisoria per le due settimane di lavorazione.' },
      { title: 'Consegna', text: 'Prova di contatti e colore, poi cementazione definitiva.' },
    ],
    faq: [
      { question: 'Serve devitalizzare?', answer: 'Non sempre. Si devitalizza solo se il nervo è già compromesso, non per protocollo.' },
      { question: 'Quante sedute?', answer: 'Due, a distanza di circa due settimane. Nel mezzo porti il provvisorio.' },
      { question: 'Si vede che è finta?', answer: 'Sul settore posteriore no. Sui frontali lavoriamo il colore su fotografia, con prova in bocca prima di cementare.' },
    ],
  },

  impianto: {
    description: 'Inserimento implantare con vite in titanio.',
    intro:
      'Una vite in titanio sostituisce la radice del dente mancante e sostiene una corona fissa. È la soluzione più vicina al dente naturale: non coinvolge i denti vicini e ferma il riassorbimento dell’osso che segue ogni estrazione.',
    benefits: [
      { title: 'Non tocca i denti vicini', text: 'A differenza del ponte, non richiede di limare gli elementi sani accanto allo spazio.' },
      { title: 'Ferma il riassorbimento osseo', text: 'L’osso senza radice si ritira. L’impianto lo carica di nuovo e lo mantiene.' },
      { title: 'Pianificazione guidata', text: 'TAC volumetrica e dima chirurgica: la posizione della vite si decide al computer, non in poltrona.' },
    ],
    steps: [
      { title: 'Studio del caso', text: 'TAC 3D per misurare altezza e spessore dell’osso e progettare la posizione.' },
      { title: 'Inserimento', text: 'Intervento in anestesia locale, circa un’ora. Punti rimossi dopo una settimana.' },
      { title: 'Osteointegrazione', text: 'Tre-quattro mesi perché l’osso si leghi al titanio. Nel frattempo porti un provvisorio.' },
      { title: 'Corona definitiva', text: 'Impronta digitale sull’impianto e avvitamento della corona.' },
    ],
    faq: [
      { question: 'Fa male?', answer: 'L’intervento no, è in anestesia locale. Il post-operatorio si gestisce con un antinfiammatorio per due o tre giorni.' },
      { question: 'E se non ho abbastanza osso?', answer: 'Si valuta un innesto. La TAC lo dice prima, non a intervento iniziato.' },
      { question: 'Quanto dura?', answer: 'Oltre il 95% degli impianti è ancora in funzione a dieci anni, se l’igiene è buona e non si fuma.' },
    ],
  },
}
