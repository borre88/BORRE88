import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { TopBar } from "@/components/top-bar";
import { SplashGate } from "@/components/splash-gate";
import { ClientSidebar } from "./client-sidebar";

export default async function TrainerLayout({ children }: { children: React.ReactNode }) {
  const session = await requireRole("trainer");
  const supabase = await createClient();
  const { data: clients } = await supabase
    .from("clients")
    .select("id, full_name")
    .order("full_name");

  return (
    <SplashGate>
      <div className="min-h-screen bg-cream">
        <TopBar
          name={session.profile.full_name ?? session.user.email ?? "Trainer"}
          roleLabel="Area Personal Trainer"
        />
        <div className="flex flex-col sm:flex-row">
          <ClientSidebar clients={clients ?? []} />
          <main className="flex-1 px-5 pb-14 pt-6 sm:px-9">{children}</main>
        </div>
      </div>
    </SplashGate>
  );
}
