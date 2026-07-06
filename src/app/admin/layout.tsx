import Link from "next/link";
import { auth } from "@/auth";
import { LogoutButton } from "@/components/logout-button";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  return (
    <div className="flex flex-1 flex-col">
      <header className="border-b border-stone-200 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-8">
            <Link href="/admin" className="text-lg font-semibold tracking-tight text-emerald-800">
              NutriPlan <span className="text-stone-400 font-normal">admin</span>
            </Link>
            <nav className="hidden gap-6 text-sm font-medium text-stone-600 sm:flex">
              <Link href="/admin/clients" className="hover:text-emerald-800">
                Clienti
              </Link>
              <Link href="/admin/longevity" className="hover:text-emerald-800">
                Longevity Score
              </Link>
              <Link href="/admin/recipes" className="hover:text-emerald-800">
                Ricette
              </Link>
              <Link href="/admin/substitutions" className="hover:text-emerald-800">
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
          <Link href="/admin/clients" className="hover:text-emerald-800">
            Clienti
          </Link>
          <Link href="/admin/longevity" className="hover:text-emerald-800">
            Longevity
          </Link>
          <Link href="/admin/recipes" className="hover:text-emerald-800">
            Ricette
          </Link>
          <Link href="/admin/substitutions" className="hover:text-emerald-800">
            Sostituzioni
          </Link>
        </nav>
      </header>
      <main className="mx-auto w-full max-w-5xl flex-1 px-6 py-10">{children}</main>
    </div>
  );
}
