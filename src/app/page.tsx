import Link from "next/link";
import { auth } from "@/auth";

export default async function Home() {
  const session = await auth();
  const destination = session?.user
    ? session.user.role === "ADMIN"
      ? "/admin"
      : "/dashboard"
    : "/login";

  return (
    <div className="flex flex-1 flex-col">
      <header className="border-b border-stone-200 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <span className="text-lg font-semibold tracking-tight text-emerald-800">
            NutriPlan
          </span>
          <Link
            href={destination}
            className="rounded-full bg-emerald-700 px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-emerald-800"
          >
            {session?.user ? "Vai all'area riservata" : "Accedi"}
          </Link>
        </div>
      </header>

      <main className="flex flex-1 items-center">
        <div className="mx-auto grid max-w-5xl gap-12 px-6 py-20 md:grid-cols-2 md:items-center">
          <div className="flex flex-col gap-6">
            <span className="w-fit rounded-full bg-emerald-100 px-3 py-1 text-xs font-medium uppercase tracking-wide text-emerald-800">
              Servizio Premium
            </span>
            <h1 className="text-4xl font-semibold leading-tight tracking-tight text-stone-900 sm:text-5xl">
              Il tuo percorso nutrizionale, sempre con te.
            </h1>
            <p className="max-w-md text-lg leading-8 text-stone-600">
              Area riservata per i clienti seguiti a livello nutrizionale: ricette
              pensate su misura e alimenti sostitutivi per non perdere mai la
              flessibilità nel piano alimentare.
            </p>
            <div>
              <Link
                href="/login"
                className="inline-flex items-center gap-2 rounded-full bg-emerald-700 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-emerald-800"
              >
                Accedi alla tua area
              </Link>
            </div>
          </div>

          <div className="grid gap-4">
            <FeatureCard
              title="Ricette curate"
              description="Una raccolta di ricette pensate per il tuo percorso, con ingredienti e procedimento sempre a portata di mano."
            />
            <FeatureCard
              title="Alimenti sostitutivi"
              description="Gruppi di alimenti equivalenti per variare il piano senza mai perdere l'equilibrio nutrizionale."
            />
            <FeatureCard
              title="Accesso riservato"
              description="Contenuti attivati personalmente dal tuo nutrizionista, pensati solo per te."
            />
          </div>
        </div>
      </main>

      <footer className="border-t border-stone-200 py-6 text-center text-sm text-stone-500">
        NutriPlan &mdash; servizio riservato ai clienti in percorso nutrizionale.
      </footer>
    </div>
  );
}

function FeatureCard({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
      <h3 className="font-semibold text-stone-900">{title}</h3>
      <p className="mt-2 text-sm text-stone-600">{description}</p>
    </div>
  );
}
