import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { LogoutButton } from "@/components/logout-button";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (session?.user?.role === "ADMIN") {
    redirect("/admin");
  }

  return (
    <div className="flex flex-1 flex-col">
      <header className="border-b border-stone-200 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-8">
            <Link href="/dashboard" className="text-lg font-semibold tracking-tight text-emerald-800">
              NutriPlan
            </Link>
            <nav className="hidden gap-6 text-sm font-medium text-stone-600 sm:flex">
              <Link href="/dashboard" className="hover:text-emerald-800">
                Panoramica
              </Link>
              <Link href="/dashboard/recipes" className="hover:text-emerald-800">
                Ricette
              </Link>
              <Link href="/dashboard/substitutions" className="hover:text-emerald-800">
                Sostituzioni
              </Link>
            </nav>
          </div>
          <div className="flex items-center gap-4">
            <span className="hidden text-sm text-stone-600 sm:inline">
              {session?.user?.name}
            </span>
            <LogoutButton />
          </div>
        </div>
        <nav className="flex gap-4 border-t border-stone-100 px-6 py-2 text-sm font-medium text-stone-600 sm:hidden">
          <Link href="/dashboard" className="hover:text-emerald-800">
            Panoramica
          </Link>
          <Link href="/dashboard/recipes" className="hover:text-emerald-800">
            Ricette
          </Link>
          <Link href="/dashboard/substitutions" className="hover:text-emerald-800">
            Sostituzioni
          </Link>
        </nav>
      </header>
      <main className="mx-auto w-full max-w-5xl flex-1 px-6 py-10">
        {session?.user?.isActive ? (
          children
        ) : (
          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6">
            <h1 className="text-lg font-semibold text-amber-900">
              Account non ancora attivo
            </h1>
            <p className="mt-2 text-sm text-amber-800">
              Il tuo accesso premium non è ancora stato attivato dal
              nutrizionista. Contattalo per completare l&apos;attivazione del
              tuo account.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
