const CONTACT_EMAIL = "simoneborrelli.nutrizionista@gmail.com";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-5">
      <h3 className="mb-1.5 font-display text-[15px] font-semibold">{title}</h3>
      <div className="space-y-2 text-[12.5px] leading-relaxed text-ink-soft">{children}</div>
    </section>
  );
}

/**
 * Informativa privacy (art. 13-14 GDPR). Contenuto redatto sulla base dei
 * trattamenti effettivamente svolti dall'app (vedi README / codebase):
 * dati raccolti, finalità, e i tre sub-responsabili tecnici in uso
 * (Supabase per database/autenticazione, Vercel per l'hosting, Resend per
 * le email di promemoria).
 */
export function PrivacyPolicyContent() {
  return (
    <div>
      <Section title="1. Titolare del trattamento">
        <p>
          Il titolare del trattamento dei dati è il Dott. Simone Borrelli, biologo nutrizionista, con studio in Via
          della Chiesa Rossa 21, 20142 Milano (MI) — P.IVA 10588130962, Codice Fiscale BRRSMN88B28D969R —
          contattabile all&apos;indirizzo email{" "}
          <a href={`mailto:${CONTACT_EMAIL}`} className="text-teal underline underline-offset-2">
            {CONTACT_EMAIL}
          </a>
          .
        </p>
      </Section>

      <Section title="2. Che dati raccogliamo">
        <p>Attraverso l&apos;app raccogliamo, direttamente da te o inseriti dal tuo trainer:</p>
        <ul className="list-disc space-y-1 pl-4">
          <li>
            <strong className="text-ink">Dati anagrafici e di contatto:</strong> nome e cognome, email, telefono,
            data di nascita, sesso.
          </li>
          <li>
            <strong className="text-ink">Dati relativi alla salute</strong> (categoria particolare di dati, art. 9
            GDPR): peso, altezza, circonferenze corporee, frequenza cardiaca a riposo, HRV, VO2max, massimali di
            forza, test del Cooper, tempo sui 5km, ore e qualità del sonno, livello di stress/energia/stanchezza,
            percentuale di massa grassa, valori di esami del sangue che il tuo trainer inserisce manualmente, e le
            informazioni che scrivi tu stesso nei campi note e nel check settimanale.
          </li>
          <li>
            <strong className="text-ink">Dati su abitudini e stile di vita:</strong> obiettivo (definizione,
            mantenimento, massa), pasti sgarro, consumo di alcol/carne rossa/pesce/frutta e verdura/junk food, acqua
            giornaliera, livello di attività fisica, preferenze alimentari e allergie che indichi per il servizio
            delivery o per gli integratori.
          </li>
          <li>
            <strong className="text-ink">Dati tecnici e di accesso:</strong> credenziali dell&apos;account (email e
            password, gestite in modo cifrato dal nostro fornitore di autenticazione), data e ora degli accessi.
          </li>
        </ul>
      </Section>

      <Section title="3. Perché li usiamo e su quale base giuridica">
        <ul className="list-disc space-y-1 pl-4">
          <li>
            Per fornirti il servizio di consulenza nutrizionale e coaching che hai richiesto (art. 6.1.b GDPR —
            esecuzione di un contratto/misure precontrattuali): creazione della scheda cliente, piani alimentari e di
            allenamento, monitoraggio dei progressi, report periodici.
          </li>
          <li>
            Per trattare i tuoi dati relativi alla salute, necessari a personalizzare il piano nutrizionale e di
            allenamento (art. 9.2.a GDPR — tuo consenso esplicito, richiesto separatamente prima di poter usare
            l&apos;app).
          </li>
          <li>Per inviarti promemoria via email del check settimanale (art. 6.1.b GDPR, funzionale al servizio).</li>
          <li>
            Per adempiere a obblighi contabili, fiscali o deontologici a cui è tenuto il titolare (art. 6.1.c GDPR).
          </li>
        </ul>
        <p>
          Il conferimento dei dati anagrafici è necessario per creare il tuo account; il conferimento dei dati
          relativi alla salute è necessario per personalizzare il servizio — senza non potremmo elaborare un piano
          su misura per te.
        </p>
      </Section>

      <Section title="4. Chi tratta i tuoi dati">
        <p>
          I tuoi dati sono trattati dal titolare e, per suo conto, da fornitori tecnici che agiscono come
          responsabili del trattamento (art. 28 GDPR):
        </p>
        <ul className="list-disc space-y-1 pl-4">
          <li>
            <strong className="text-ink">Supabase</strong> — database e sistema di autenticazione dell&apos;app; i
            dati sono conservati su server nella Unione Europea (Francoforte, Germania).
          </li>
          <li>
            <strong className="text-ink">Vercel</strong> — hosting dell&apos;applicazione web.
          </li>
          <li>
            <strong className="text-ink">Resend</strong> — invio delle email di promemoria del check settimanale.
          </li>
        </ul>
        <p>
          Alcuni di questi fornitori hanno sede o infrastrutture anche fuori dallo Spazio Economico Europeo: in tal
          caso il trasferimento avviene sulla base di clausole contrattuali standard o di altre garanzie adeguate ai
          sensi degli artt. 44-49 GDPR. I tuoi dati non vengono mai venduti né condivisi con soggetti terzi per
          finalità di marketing.
        </p>
        <p>Il tuo trainer accede ai tuoi dati in quanto necessario per fornirti il servizio.</p>
      </Section>

      <Section title="5. Per quanto tempo conserviamo i dati">
        <p>
          Conserviamo i tuoi dati per tutta la durata del rapporto professionale e, dopo la sua cessazione, per 10
          anni, in linea con i termini di conservazione previsti dalla normativa fiscale e civilistica applicabile,
          salvo termini diversi previsti dalla legge. Puoi comunque chiedere la cancellazione anticipata dei tuoi
          dati secondo quanto indicato al punto 7.
        </p>
      </Section>

      <Section title="6. Come proteggiamo i tuoi dati">
        <p>
          L&apos;accesso ai tuoi dati è protetto da autenticazione personale e limitato a te e al tuo trainer;
          l&apos;infrastruttura del database applica regole di accesso a livello di riga (Row Level Security) che
          impediscono a ogni utente di vedere dati di altri clienti. Le comunicazioni con l&apos;app avvengono in
          connessione cifrata (HTTPS).
        </p>
      </Section>

      <Section title="7. I tuoi diritti">
        <p>In qualsiasi momento puoi esercitare i diritti previsti dagli artt. 15-22 GDPR, in particolare:</p>
        <ul className="list-disc space-y-1 pl-4">
          <li>accedere ai tuoi dati e ottenerne una copia;</li>
          <li>chiederne la rettifica se inesatti o incompleti;</li>
          <li>chiederne la cancellazione, entro i limiti di legge;</li>
          <li>chiederne la limitazione del trattamento o opporti al trattamento;</li>
          <li>richiederne la portabilità in un formato strutturato;</li>
          <li>
            revocare in qualsiasi momento il consenso al trattamento dei dati relativi alla salute, senza pregiudicare
            la liceità del trattamento svolto prima della revoca.
          </li>
        </ul>
        <p>
          Per esercitare questi diritti scrivi a{" "}
          <a href={`mailto:${CONTACT_EMAIL}`} className="text-teal underline underline-offset-2">
            {CONTACT_EMAIL}
          </a>
          . Hai inoltre diritto di proporre reclamo al Garante per la protezione dei dati personali
          (www.garanteprivacy.it) se ritieni che il trattamento violi la normativa vigente.
        </p>
      </Section>

      <Section title="8. Responsabile della Protezione dei Dati (DPO)">
        <p>
          Non è stato nominato un Responsabile della Protezione dei Dati (DPO) in quanto non ricorrono i presupposti
          previsti dall&apos;art. 37 GDPR.
        </p>
      </Section>
    </div>
  );
}
