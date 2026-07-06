import Link from "next/link";
import { AssessmentForm } from "../assessment-form";

export default function NewAssessmentPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <Link href="/dashboard/longevity" className="text-sm text-emerald-700 hover:underline">
          &larr; Torna al mio Longevity Score
        </Link>
        <h1 className="mt-3 text-2xl font-semibold text-stone-900">
          Nuovo questionario Longevity Score
        </h1>
        <p className="mt-1 text-stone-600">
          Rispondi con sincerità: le risposte restano visibili solo a te e al
          tuo nutrizionista, e servono a costruire un quadro reale delle tue
          abitudini.
        </p>
      </div>

      <AssessmentForm />
    </div>
  );
}
