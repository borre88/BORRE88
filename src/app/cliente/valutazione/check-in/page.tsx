import { createClient } from "@/lib/supabase/server";
import { getSession } from "@/lib/auth";
import { getMondayISO } from "@/lib/dates";
import { SectionIntro } from "@/components/ui";
import { WeeklyCheckinsTable } from "@/components/weekly-checkins-table";
import { CheckinForm } from "./check-in-form";

export default async function CheckinPage() {
  const session = await getSession();
  const supabase = await createClient();

  const { data: client } = await supabase
    .from("clients")
    .select("id")
    .eq("profile_id", session!.user.id)
    .single();

  if (!client) {
    return (
      <div>
        <SectionIntro
          title="Check settimanale"
          subtitle="Un aggiornamento rapido da mandare al tuo coach ogni settimana."
        />
        <p className="text-sm text-ink-faint">
          Il tuo coach non ha ancora collegato una scheda cliente al tuo account.
        </p>
      </div>
    );
  }

  const weekStart = getMondayISO(new Date());

  const { data: current } = await supabase
    .from("weekly_checkins")
    .select("*")
    .eq("client_id", client.id)
    .eq("week_start", weekStart)
    .maybeSingle();

  const { data: history } = await supabase
    .from("weekly_checkins")
    .select("*")
    .eq("client_id", client.id)
    .order("week_start", { ascending: false })
    .limit(8);

  return (
    <div>
      <SectionIntro
        title="Check settimanale"
        subtitle="Un aggiornamento rapido da mandare al tuo coach ogni settimana."
      />
      <CheckinForm current={current ?? null} />

      {history && history.length > 0 && (
        <div className="mt-5">
          <WeeklyCheckinsTable checkins={history} title="Storico" />
        </div>
      )}
    </div>
  );
}
