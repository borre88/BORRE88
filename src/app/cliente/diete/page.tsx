import { createClient } from "@/lib/supabase/server";
import { getSession } from "@/lib/auth";
import { SectionIntro, EmptyState } from "@/components/ui";
import {
  PHASE_LABELS,
  PHASE_ACCENT,
  MACRO_ACCENT,
  MEAL_TYPES,
  MEAL_TYPE_LABELS,
  WEEKDAY_LABELS,
  scaleFoodToQuantity,
  mealTypeDotClass,
  todayWeekdayMon0,
  type DietPhase,
} from "@/lib/diet-calc";
import type { Tables } from "@/lib/database.types";

type Food = Tables<"foods">;

export default async function ClienteDietePage() {
  const session = await getSession();
  const supabase = await createClient();

  const { data: client } = await supabase
    .from("clients")
    .select("id, trainer_id")
    .eq("profile_id", session!.user.id)
    .single();

  if (!client) {
    return (
      <div>
        <SectionIntro title="Diete" subtitle="Il piano alimentare che il tuo trainer costruisce per te." />
        <EmptyState text="Il tuo trainer non ha ancora collegato una scheda cliente al tuo account." />
      </div>
    );
  }

  const { data: plan } = await supabase
    .from("diet_plans")
    .select("*, diet_plan_days(*), diet_plan_meals(*, diet_plan_meal_items(*))")
    .eq("client_id", client.id)
    .eq("active", true)
    .maybeSingle();

  if (!plan) {
    return (
      <div>
        <SectionIntro title="Diete" subtitle="Il piano alimentare che il tuo trainer costruisce per te." />
        <EmptyState text="Il tuo trainer non ha ancora assegnato un piano alimentare attivo." />
      </div>
    );
  }

  const { data: foods } = await supabase.from("foods").select("*");
  const foodsById = new Map((foods ?? []).map((f) => [f.id, f]));

  const { data: supplements } = await supabase
    .from("supplements")
    .select("*")
    .eq("trainer_id", client.trainer_id);
  const supplementsById = new Map((supplements ?? []).map((s) => [s.id, s]));

  const meals = [...plan.diet_plan_meals].sort((a, b) => a.weekday - b.weekday || a.position - b.position);
  const dayOverrides = new Map(plan.diet_plan_days.map((d) => [d.weekday, d]));

  const mealTypeRows = (() => {
    const present = new Set(meals.map((m) => m.meal_type));
    const ordered = MEAL_TYPES.map((m) => m.key).filter((k) => present.has(k));
    const extra = Array.from(present).filter((k) => !MEAL_TYPES.some((m) => m.key === k));
    return [...ordered, ...extra];
  })();

  function dayTotals(weekday: number) {
    let kcal = 0,
      protein = 0,
      carbs = 0,
      fat = 0;
    for (const meal of meals.filter((m) => m.weekday === weekday)) {
      for (const item of meal.diet_plan_meal_items) {
        const food: Food | undefined = item.food_id ? foodsById.get(item.food_id) : undefined;
        if (!food) continue;
        const scaled = scaleFoodToQuantity(food, item.quantity_g);
        kcal += scaled.kcal;
        protein += scaled.protein;
        carbs += scaled.carbs;
        fat += scaled.fat;
      }
    }
    return { kcal: Math.round(kcal), protein: Math.round(protein), carbs: Math.round(carbs), fat: Math.round(fat) };
  }

  const today = todayWeekdayMon0();

  return (
    <div>
      <SectionIntro title="Diete" subtitle="Il piano alimentare che il tuo trainer ha costruito per te." />

      <div className="mb-5 rounded-xl border border-line bg-surface px-5 py-4">
        <div className="mb-1.5 flex flex-wrap items-center gap-1.5">
          {plan.phase &&
            (() => {
              const accent = PHASE_ACCENT[plan.phase as DietPhase];
              return (
                <span
                  className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold tracking-wide ${accent.border} ${accent.bg} ${accent.text}`}
                >
                  <span className={`h-1.5 w-1.5 rounded-full ${accent.dot}`} />
                  {PHASE_LABELS[plan.phase as DietPhase] ?? plan.phase}
                </span>
              );
            })()}
        </div>
        <div className="font-display text-lg font-semibold">{plan.name}</div>
        <div className="mt-1 text-[12.5px] text-ink-faint">
          {plan.target_kcal ? `${plan.target_kcal} kcal` : "Target non impostato"}
          {plan.target_protein_g ? (
            <>
              {" · "}
              <span className={MACRO_ACCENT.protein.text}>Proteine {plan.target_protein_g}g</span>
            </>
          ) : (
            ""
          )}
          {plan.target_carbs_g ? (
            <>
              {" · "}
              <span className={MACRO_ACCENT.carbs.text}>Carboidrati {plan.target_carbs_g}g</span>
            </>
          ) : (
            ""
          )}
          {plan.target_fat_g ? (
            <>
              {" · "}
              <span className={MACRO_ACCENT.fat.text}>Grassi {plan.target_fat_g}g</span>
            </>
          ) : (
            ""
          )}
        </div>
        {plan.notes && <p className="mt-2.5 whitespace-pre-line text-[13px] leading-relaxed text-ink-soft">{plan.notes}</p>}
      </div>

      {plan.macro_only ? (
        <div className="rounded-xl border border-dashed border-line bg-surface px-5 py-8 text-center text-[13px] text-ink-faint">
          Il tuo trainer ti ha assegnato solo i target di kcal e macro qui sopra: segui liberamente la tua
          alimentazione rispettando questi valori, senza un piano pasti fisso.
        </div>
      ) : mealTypeRows.length === 0 ? (
        <EmptyState text="Il piano non ha ancora pasti assegnati." />
      ) : (
        <div className="overflow-x-auto rounded-xl border border-line bg-surface">
          <table className="w-full min-w-[920px] border-collapse text-[12.5px]">
            <thead>
              <tr className="bg-cream">
                <th className="w-32 px-3 py-2 text-left text-[10.5px] font-semibold text-ink-faint">Pasto</th>
                {WEEKDAY_LABELS.map((w, weekday) => (
                  <th
                    key={w}
                    className={`min-w-[150px] px-2 py-2 text-left text-[10.5px] font-semibold ${
                      weekday === today ? "text-teal" : "text-ink-faint"
                    }`}
                  >
                    {w}
                    {weekday === today && <span className="ml-1 inline-block h-1.5 w-1.5 rounded-full bg-teal align-middle" />}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {mealTypeRows.map((mealType) => (
                <tr key={mealType} className="border-t border-line align-top">
                  <td className="px-3 py-2 font-medium text-ink-soft">
                    <span className="flex items-center gap-1.5">
                      <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${mealTypeDotClass(mealType)}`} />
                      {MEAL_TYPE_LABELS[mealType] ?? mealType}
                    </span>
                  </td>
                  {WEEKDAY_LABELS.map((_, weekday) => {
                    const meal = meals.find((m) => m.weekday === weekday && m.meal_type === mealType);
                    return (
                      <td key={weekday} className={`px-2 py-2 ${weekday === today ? "bg-teal-soft/40" : ""}`}>
                        {meal && meal.diet_plan_meal_items.length > 0 ? (
                          <div className="space-y-1">
                            {meal.diet_plan_meal_items.map((item) => {
                              const food: Food | undefined = item.food_id ? foodsById.get(item.food_id) : undefined;
                              const supplement = item.supplement_id ? supplementsById.get(item.supplement_id) : undefined;
                              const scaled = food ? scaleFoodToQuantity(food, item.quantity_g) : null;
                              return (
                                <div key={item.id} className="rounded-md bg-cream px-2 py-1.5">
                                  <div className="text-[11.5px] font-medium">
                                    {food?.name ?? supplement?.name ?? item.custom_name ?? "Alimento"}
                                  </div>
                                  <div className="text-[10.5px] text-ink-faint">
                                    {item.quantity_g}
                                    {item.unit || (supplement ? "" : "g")}
                                    {scaled ? ` · ${Math.round(scaled.kcal)} kcal` : ""}
                                  </div>
                                  {supplement?.suggested_use && (
                                    <div className="text-[10px] text-ink-faint">{supplement.suggested_use}</div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        ) : (
                          <span className="text-[11px] text-ink-faint">—</span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
              <tr className="border-t border-line bg-cream font-semibold">
                <td className="px-3 py-2">Totale kcal</td>
                {WEEKDAY_LABELS.map((_, weekday) => {
                  const totals = dayTotals(weekday);
                  const target = dayOverrides.get(weekday)?.target_kcal ?? plan.target_kcal;
                  return (
                    <td key={weekday} className={`px-2 py-2 ${weekday === today ? "bg-teal-soft/40" : ""}`}>
                      {totals.kcal} {target ? <span className="font-normal text-ink-faint">/ {target}</span> : null}
                    </td>
                  );
                })}
              </tr>
              <tr className="text-[11px]">
                <td className={`px-3 py-1 font-medium ${MACRO_ACCENT.protein.text}`}>Proteine (g)</td>
                {WEEKDAY_LABELS.map((_, weekday) => {
                  const totals = dayTotals(weekday);
                  const t = dayOverrides.get(weekday)?.target_protein_g ?? plan.target_protein_g;
                  return (
                    <td key={weekday} className={`px-2 py-1 ${MACRO_ACCENT.protein.text} ${weekday === today ? "bg-teal-soft/40" : ""}`}>
                      {totals.protein}
                      {t ? ` / ${t}` : ""}
                    </td>
                  );
                })}
              </tr>
              <tr className="text-[11px]">
                <td className={`px-3 py-1 font-medium ${MACRO_ACCENT.carbs.text}`}>Carboidrati (g)</td>
                {WEEKDAY_LABELS.map((_, weekday) => {
                  const totals = dayTotals(weekday);
                  const t = dayOverrides.get(weekday)?.target_carbs_g ?? plan.target_carbs_g;
                  return (
                    <td key={weekday} className={`px-2 py-1 ${MACRO_ACCENT.carbs.text} ${weekday === today ? "bg-teal-soft/40" : ""}`}>
                      {totals.carbs}
                      {t ? ` / ${t}` : ""}
                    </td>
                  );
                })}
              </tr>
              <tr className="text-[11px]">
                <td className={`px-3 py-1 font-medium ${MACRO_ACCENT.fat.text}`}>Grassi (g)</td>
                {WEEKDAY_LABELS.map((_, weekday) => {
                  const totals = dayTotals(weekday);
                  const t = dayOverrides.get(weekday)?.target_fat_g ?? plan.target_fat_g;
                  return (
                    <td key={weekday} className={`px-2 py-1 ${MACRO_ACCENT.fat.text} ${weekday === today ? "bg-teal-soft/40" : ""}`}>
                      {totals.fat}
                      {t ? ` / ${t}` : ""}
                    </td>
                  );
                })}
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
