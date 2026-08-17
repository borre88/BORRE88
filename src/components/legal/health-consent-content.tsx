export function HealthConsentContent() {
  return (
    <div className="space-y-2 text-[12.5px] leading-relaxed text-ink-soft">
      <p>
        Per costruire il tuo piano nutrizionale e di allenamento personalizzato, il tuo trainer registra nel tempo
        dati che riguardano la tua salute: peso, circonferenze corporee, frequenza cardiaca, HRV, VO2max, massimali
        di forza, qualità e ore di sonno, livello di stress, energia e stanchezza, percentuale di massa grassa ed
        eventuali valori di esami del sangue.
      </p>
      <p>
        Si tratta di una categoria particolare di dati personali (art. 9 GDPR), che può essere trattata solo con il
        tuo consenso esplicito. Il tuo consenso è necessario perché il servizio funzioni: senza questi dati il tuo
        trainer non può personalizzare il piano su di te.
      </p>
      <p>
        Puoi revocare il consenso in qualsiasi momento scrivendo a{" "}
        <a
          href="mailto:simoneborrelli.nutrizionista@gmail.com"
          className="text-teal underline underline-offset-2"
        >
          simoneborrelli.nutrizionista@gmail.com
        </a>
        , senza che questo pregiudichi la liceità del trattamento svolto prima della revoca. La revoca comporta
        l&apos;impossibilità di continuare a usare le funzioni dell&apos;app basate su questi dati.
      </p>
    </div>
  );
}
