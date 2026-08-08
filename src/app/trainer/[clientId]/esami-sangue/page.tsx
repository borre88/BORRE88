import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Gender } from "@/lib/health-score";
import { analyzeBloodTest } from "@/lib/blood-report";
import { BloodTestReport } from "@/components/blood-test-report";
import { AddTestForm } from "./add-test-form";
import { DeleteTestButton } from "./delete-test-button";

export default async function BloodTestsPage({
  params,
}: {
  params: Promise<{ clientId: string }>;
}) {
  const { clientId } = await params;
  const supabase = await createClient();

  const { data: client } = await supabase
    .from("clients")
    .select("id, full_name, gender")
    .eq("id", clientId)
    .single();

  if (!client) notFound();

  const { data: tests } = await supabase
    .from("blood_tests")
    .select("*, blood_test_values(*)")
    .eq("client_id", clientId)
    .order("test_date", { ascending: false });

  const gender = (client.gender as Gender | null) ?? null;

  return (
    <div>
      <div className="mb-1 text-[10.5px] font-semibold tracking-wide text-gold">
        SOLO TU VEDI QUESTA SEZIONE
      </div>
      <h1 className="mb-5 font-display text-[28px] font-bold leading-none">
        Esami del sangue — {client.full_name}
      </h1>

      <div className="mb-5">
        <AddTestForm clientId={clientId} />
      </div>

      {!tests || tests.length === 0 ? (
        <div className="rounded-lg border border-dashed border-line bg-surface px-8 py-8 text-center text-sm text-ink-faint">
          Nessun esame registrato ancora.
        </div>
      ) : (
        <div className="space-y-4">
          {tests.map((test) => {
            const readings = analyzeBloodTest(test.blood_test_values, gender);
            return (
              <div key={test.id} className="rounded-xl border border-line bg-surface px-5 py-4">
                <div className="mb-3 flex items-start justify-between">
                  <div>
                    <div className="font-display text-lg font-bold">
                      {new Date(test.test_date + "T00:00:00").toLocaleDateString("it-IT")}
                    </div>
                    {test.lab_name && <div className="text-xs text-ink-faint">{test.lab_name}</div>}
                  </div>
                  <DeleteTestButton clientId={clientId} testId={test.id} />
                </div>
                {test.notes && <p className="mb-3 text-[12.5px] text-ink-soft">{test.notes}</p>}
                <BloodTestReport readings={readings} />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
