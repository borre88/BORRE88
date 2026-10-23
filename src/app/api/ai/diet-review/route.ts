import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { getAnthropicClient, DIET_REVIEW_MODEL } from "@/lib/anthropic";
import { scaleFoodToQuantity, WEEKDAY_LABELS, MEAL_TYPE_LABELS } from "@/lib/diet-calc";

export const dynamic = "force-dynamic";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session || session.profile.role !== "trainer") {
    return NextResponse.json({ error: "Non autorizzato." }, { status: 401 });
  }

  const anthropic = getAnthropicClient();
  if (!anthropic) {
    return NextResponse.json(
      { error: "Assistente AI non configurato: manca ANTHROPIC_API_KEY nelle variabili d'ambiente." },
      { status: 503 }
    );
  }

  const body = await request.json().catch(() => null);
  const clientId = body?.clientId as string | undefined;
  const messages = (body?.messages as ChatMessage[] | undefined) ?? [];

  if (!clientId) {
    return NextResponse.json({ error: "Nessun cliente selezionato." }, { status: 400 });
  }

  const supabase = await createClient();

  const { data: client } = await supabase.from("clients").select("id, full_name").eq("id", clientId).single();
  if (!client) {
    return NextResponse.json({ error: "Cliente non trovato." }, { status: 404 });
  }

  const { data: plan } = await supabase
    .from("diet_plans")
    .select("*, diet_plan_meals(*, diet_plan_meal_items(*))")
    .eq("client_id", clientId)
    .eq("active", true)
    .maybeSingle();

  if (!plan) {
    return NextResponse.json({
      reply:
        `${client.full_name} non ha ancora un piano alimentare attivo: crealo prima dalla tab "Diete" per poterlo far controllare.`,
    });
  }

  const { data: foods } = await supabase.from("foods").select("*");
  const foodsById = new Map((foods ?? []).map((f) => [f.id, f]));

  const { data: supplements } = await supabase.from("supplements").select("*").eq("trainer_id", session.user.id);
  const supplementsById = new Map((supplements ?? []).map((s) => [s.id, s]));

  const { data: recipes } = await supabase.from("recipes").select("*");
  const recipesById = new Map((recipes ?? []).map((r) => [r.id, r]));

  const { data: lastIntake } = await supabase
    .from("intake_forms")
    .select("data, completed_at")
    .eq("client_id", clientId)
    .eq("status", "completed")
    .order("completed_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  const allergie = (lastIntake?.data as { allergie?: Record<string, string> } | undefined)?.allergie;
  const allergyText = [allergie?.allergie_intolleranze, allergie?.disturbi_intestinali].filter(Boolean).join(" | ");

  const mealsByWeekday = new Map<number, typeof plan.diet_plan_meals>();
  for (const meal of plan.diet_plan_meals) {
    const list = mealsByWeekday.get(meal.weekday) ?? [];
    list.push(meal);
    mealsByWeekday.set(meal.weekday, list);
  }

  const planLines: string[] = [];
  for (let weekday = 0; weekday < 7; weekday++) {
    const meals = mealsByWeekday.get(weekday) ?? [];
    if (meals.length === 0) continue;
    planLines.push(`${WEEKDAY_LABELS[weekday]}:`);
    for (const meal of meals) {
      const items = meal.diet_plan_meal_items
        .map((item) => {
          const food = item.food_id ? foodsById.get(item.food_id) : null;
          if (food) {
            const scaled = scaleFoodToQuantity(food, item.quantity_g);
            return `${food.name} ${item.quantity_g}g (${Math.round(scaled.kcal)} kcal, P${Math.round(scaled.protein)} C${Math.round(scaled.carbs)} G${Math.round(scaled.fat)})`;
          }
          const recipe = item.recipe_id ? recipesById.get(item.recipe_id) : null;
          if (recipe) return `${recipe.name} (ricetta, ${item.quantity_g} porz., ${Math.round(recipe.kcal * item.quantity_g)} kcal)`;
          const supplement = item.supplement_id ? supplementsById.get(item.supplement_id) : null;
          if (supplement) return `${supplement.name} ${item.quantity_g}${item.unit ?? ""}`;
          return item.custom_name ? `${item.custom_name} (${item.quantity_g}g)` : null;
        })
        .filter(Boolean)
        .join("; ");
      planLines.push(`  - ${MEAL_TYPE_LABELS[meal.meal_type] ?? meal.meal_type}: ${items || "(vuoto)"}`);
    }
  }

  const context = `Sei un assistente nutrizionale che aiuta un biologo nutrizionista/personal trainer a controllare un piano alimentare che ha già costruito per un suo cliente. Rispondi sempre in italiano, in modo conciso e professionale, con elenchi puntati quando utile. Non inventare dati che non ti vengono forniti.

CLIENTE: ${client.full_name}

TARGET DEL PIANO "${plan.name}":
- Kcal: ${plan.target_kcal ?? "non impostato"}
- Proteine: ${plan.target_protein_g ?? "-"} g
- Carboidrati: ${plan.target_carbs_g ?? "-"} g
- Grassi: ${plan.target_fat_g ?? "-"} g

ALLERGIE / INTOLLERANZE / DISTURBI SEGNALATI DAL CLIENTE (dal questionario, se presente):
${allergyText || "Nessuna informazione disponibile."}

PIANO PASTI SETTIMANALE:
${planLines.join("\n") || "Nessun pasto inserito nel piano."}

Quando ti viene chiesta un'analisi generale, controlla in particolare queste tre cose e organizza la risposta in tre sezioni con questi titoli esatti:
1. "Allergie e intolleranze" — segnala eventuali alimenti nel piano in conflitto con quanto dichiarato dal cliente. Se non ci sono conflitti o non hai informazioni, dillo chiaramente.
2. "Coerenza macro e target" — confronta i totali giornalieri stimabili dal piano con il target impostato, segnala giorni o pasti che si discostano molto.
3. "Varietà ed equilibrio" — segnala ripetizioni eccessive degli stessi alimenti, categorie di cibo assenti (es. verdura, fibre) o altri squilibri.
Se tutto va bene in una sezione, scrivilo in una riga sola invece di forzare osservazioni inutili.`;

  const conversation: ChatMessage[] =
    messages.length > 0 ? messages : [{ role: "user", content: "Analizza questo piano alimentare." }];

  try {
    const response = await anthropic.messages.create({
      model: DIET_REVIEW_MODEL,
      max_tokens: 1200,
      system: context,
      messages: conversation,
    });

    const reply = response.content.map((block) => (block.type === "text" ? block.text : "")).join("\n");

    return NextResponse.json({ reply });
  } catch {
    return NextResponse.json({ error: "L'assistente AI non è riuscito a rispondere. Riprova tra poco." }, { status: 502 });
  }
}
