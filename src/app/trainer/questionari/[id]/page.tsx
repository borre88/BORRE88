import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { INTAKE_SECTIONS, type IntakeFormData } from "@/lib/intake-form";
import { CreateClientButton } from "./create-client-button";
import { CopyLinkButton } from "./copy-link-button";

export default async function IntakeDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: form } = await supabase.from("intake_forms").select("*, clients(id, full_name)").eq("id", id).single();
  if (!form) notFound();

  const data = (form.data ?? {}) as IntakeFormData;
  const isPending = form.status === "pending";

  return (
    <div>
      <Link href="/trainer/questionari" className="mb-3 inline-flex items-center gap-1.5 text-xs font-medium text-ink-faint hover:text-teal">
        <ArrowLeft size={14} strokeWidth={2.2} />
        Torna ai questionari
      </Link>

      <div className="mb-5 flex flex-wrap items-center justify-between gap-2">
        <div>
          <h1 className="font-display text-lg font-bold">{form.label || form.clients?.full_name || "Questionario"}</h1>
          <div className="mt-0.5 text-[12px] text-ink-faint">
            Creato il {new Date(form.created_at).toLocaleDateString("it-IT")}
            {form.completed_at && ` · compilato il ${new Date(form.completed_at).toLocaleDateString("it-IT")}`}
          </div>
        </div>
        <div className="flex gap-2">
          {isPending && <CopyLinkButton token={form.token} />}
          {!isPending && !form.client_id && <CreateClientButton formId={form.id} />}
          {form.client_id && (
            <Link
              href={`/trainer/${form.client_id}`}
              className="flex items-center gap-1.5 rounded-lg border border-line px-3.5 py-2 text-xs font-medium text-ink-soft hover:border-teal hover:text-teal"
            >
              Vai alla scheda cliente
            </Link>
          )}
        </div>
      </div>

      {isPending ? (
        <div className="rounded-xl border border-dashed border-line bg-surface px-5 py-10 text-center text-[13px] text-ink-faint">
          Il cliente non ha ancora compilato questo questionario. Mandagli il link qui sopra.
        </div>
      ) : (
        <div className="space-y-4">
          {INTAKE_SECTIONS.map((section) => {
            const values = data[section.key] as Record<string, string> | undefined;
            const hasValues = values && Object.values(values).some((v) => v && String(v).trim());
            if (!hasValues) return null;
            return (
              <div key={section.key} className="rounded-xl border border-line bg-surface p-4">
                <div className="mb-3 font-display text-base font-semibold text-teal">{section.label}</div>
                <dl className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {section.fields.map((field) => {
                    const raw = values?.[field.key];
                    if (!raw) return null;
                    const display =
                      field.type === "select" ? field.options?.find((o) => o.value === raw)?.label ?? raw : raw;
                    return (
                      <div key={field.key}>
                        <dt className="text-[10.5px] font-semibold uppercase tracking-wide text-ink-faint">{field.label}</dt>
                        <dd className="mt-0.5 whitespace-pre-line text-[13px] text-ink">{display}</dd>
                      </div>
                    );
                  })}
                </dl>
              </div>
            );
          })}

          <div className="flex items-center gap-2 rounded-xl border border-teal-soft-line bg-teal-soft px-4 py-3 text-[12px] text-teal">
            <ShieldCheck size={15} strokeWidth={2.2} className="shrink-0" />
            Consenso privacy e dati salute: {data.consenso?.privacy && data.consenso?.dati_salute ? "confermato" : "non confermato"}
          </div>
        </div>
      )}
    </div>
  );
}
