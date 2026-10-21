import { createClient } from "@/lib/supabase/server";
import { SectionIntro } from "@/components/ui";
import { IntakeList } from "./intake-list";

export default async function QuestionariPage() {
  const supabase = await createClient();
  const [{ data: forms }, { data: clients }] = await Promise.all([
    supabase.from("intake_forms").select("*, clients(full_name)").order("created_at", { ascending: false }),
    supabase.from("clients").select("id, full_name").order("full_name"),
  ]);

  return (
    <div>
      <SectionIntro
        title="Questionari"
        subtitle="Genera un link da mandare al cliente per compilare l'anamnesi da casa prima della visita."
      />
      <IntakeList forms={forms ?? []} clients={clients ?? []} />
    </div>
  );
}
