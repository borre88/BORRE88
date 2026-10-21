import { getSession } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { SectionIntro } from "@/components/ui";
import { CalendarManager } from "./calendar-manager";

export default async function CalendarioPage() {
  const session = await getSession();
  const supabase = await createClient();

  const { data: clients } = await supabase
    .from("clients")
    .select("id, full_name")
    .eq("trainer_id", session!.user.id)
    .order("full_name");

  const clientIds = (clients ?? []).map((c) => c.id);

  const { data: appointments } = clientIds.length
    ? await supabase
        .from("client_appointments")
        .select("*, clients(full_name)")
        .in("client_id", clientIds)
        .order("date")
    : { data: [] };

  return (
    <div>
      <SectionIntro
        title="Calendario"
        subtitle="Scadenze, visite e controlli periodici dei tuoi clienti, in un unico posto."
      />
      {!clients || clients.length === 0 ? (
        <p className="text-[12.5px] text-ink-faint">Aggiungi un cliente per iniziare a pianificare le scadenze.</p>
      ) : (
        <CalendarManager clients={clients} appointments={appointments ?? []} />
      )}
    </div>
  );
}
