import Link from "next/link";
import { ArrowLeft, HeartPulse, ClipboardCheck, FileDown, ChefHat, Truck, Pill, Dumbbell } from "lucide-react";
import { ReportHeader } from "@/components/report-header";
import { ReportFooter } from "@/components/report-footer";
import { PrintButton } from "@/components/print-button";

const SECTIONS = [
  {
    icon: HeartPulse,
    title: "Valutazione",
    text: "La tua area salute, aggiornata dal tuo trainer a ogni rilevazione. Trovi il punteggio (da 1 a 20) per 5 aree — cardiovascolare, sonno, antropometria, forza, alimentare — con i grafici di andamento nel tempo e il confronto tra la prima misura e le più recenti per le misure del corpo.",
  },
  {
    icon: ClipboardCheck,
    title: "Check settimanale",
    text: "Ogni settimana manda un aggiornamento veloce al tuo coach: peso, allenamenti fatti, energia, stanchezza, sonno, stress ed eventuali sgarri alla dieta. Puoi anche inserire le misure del corpo: la sagoma ti mostra esattamente dove misurare.",
  },
  {
    icon: FileDown,
    title: "Report PDF",
    text: "Dalla tua area Valutazione puoi scaricare in ogni momento un report riassuntivo in PDF, con il grafico delle 5 aree e le misure del corpo: utile da conservare o condividere.",
  },
  {
    icon: ChefHat,
    title: "Nutrizione",
    text: "Ricette pronte filtrate per pasto e obiettivo, calcolo rapido delle calorie per la cena fuori, conversioni cotto/crudo degli alimenti e una lista della spesa che puoi spuntare mentre fai acquisti.",
  },
  {
    icon: Truck,
    title: "Delivery a domicilio",
    text: "Richiedi pasti bilanciati sui tuoi macro, pronti sottovuoto e da scongelare quando vuoi: scegli i pasti che ti interessano, la frequenza, l'area e gli orari di consegna preferiti.",
  },
  {
    icon: Pill,
    title: "Integrazioni",
    text: "Il catalogo integratori del nostro partner Mowe Nutrition: scegli cosa ti serve dal catalogo e ci pensiamo noi a procurartelo.",
  },
  {
    icon: Dumbbell,
    title: "Allenamenti",
    text: "Schede di allenamento pronte in base agli attrezzi che hai a disposizione: casa, ripetute, Hyrox, mobilità e recupero.",
  },
];

export default function GuidaPage() {
  return (
    <div className="report-light mx-auto max-w-2xl px-5 py-8">
      <Link
        href="/cliente"
        className="print:hidden mb-4 inline-flex items-center gap-1.5 text-xs font-medium text-ink-faint hover:text-teal"
      >
        <ArrowLeft size={14} strokeWidth={2.2} />
        Torna alla tua area
      </Link>
      <ReportHeader />
      <div className="mb-5 flex justify-end">
        <PrintButton />
      </div>

      <div className="mb-6">
        <div className="text-[10.5px] font-semibold uppercase tracking-wide text-gold">Guida all&apos;app</div>
        <h2 className="font-display text-2xl font-bold">Cosa puoi fare qui dentro</h2>
        <p className="mt-1 text-xs text-ink-faint">
          Una panoramica rapida di ogni area dell&apos;app, così sai sempre dove trovare le cose.
        </p>
      </div>

      <div className="space-y-3.5">
        {SECTIONS.map((s) => (
          <div key={s.title} className="rounded-lg border border-line bg-surface px-4 py-3.5">
            <div className="mb-1.5 flex items-center gap-2">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-teal-soft text-teal">
                <s.icon size={15} strokeWidth={2.2} />
              </span>
              <span className="text-sm font-semibold">{s.title}</span>
            </div>
            <p className="text-[12.5px] leading-relaxed text-ink-soft">{s.text}</p>
          </div>
        ))}
      </div>

      <p className="mt-6 text-[11.5px] leading-relaxed text-ink-faint">
        Per qualsiasi dubbio o richiesta particolare, scrivi in qualsiasi momento al tuo trainer: è sempre la via
        più rapida per una risposta.
      </p>

      <ReportFooter />
    </div>
  );
}
