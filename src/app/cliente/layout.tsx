import { redirect } from "next/navigation";
import { requireRole } from "@/lib/auth";
import { TopBar } from "@/components/top-bar";
import { ClientNav } from "./client-nav";

export default async function ClienteLayout({ children }: { children: React.ReactNode }) {
  const session = await requireRole("cliente");

  if (!session.profile.privacy_accepted_at || !session.profile.health_data_consent_at) {
    redirect("/consenso");
  }

  return (
    <div className="min-h-screen bg-cream">
      <TopBar
        name={session.profile.full_name ?? session.user.email ?? "Cliente"}
        roleLabel="Area Cliente"
      />
      <ClientNav />
      <main className="mx-auto max-w-3xl px-5 pb-14 pt-6 sm:px-7">{children}</main>
    </div>
  );
}
