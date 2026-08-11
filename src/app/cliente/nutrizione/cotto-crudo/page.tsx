import { createClient } from "@/lib/supabase/server";
import { SectionIntro } from "@/components/ui";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { Card } from "@/components/ui/Card";
import type { Tables } from "@/lib/database.types";

type ConversionRow = Tables<"cooking_conversions">;

const METHODS = ["padella", "forno", "vapore", "friggitrice_aria", "ebollizione"] as const;

const METHOD_LABELS: Record<string, string> = {
  padella: "Padella",
  forno: "Forno",
  vapore: "Vapore",
  friggitrice_aria: "Friggitrice ad aria",
  ebollizione: "Bollitura",
};

const CATEGORIES: { key: string; label: string; explanation: string }[] = [
  {
    key: "carbo",
    label: "Carboidrati",
    explanation:
      "Riso, pasta e patate assorbono acqua durante la cottura: il peso aumenta, ma le calorie totali restano quasi le stesse. Il risultato è che le kcal per 100g diminuiscono — 100g di riso crudo e 100g di riso cotto non sono affatto equivalenti a livello calorico, il secondo ne ha molte meno perché contiene più acqua nello stesso peso.",
  },
  {
    key: "proteine",
    label: "Proteine",
    explanation:
      "Le proteine fanno l'esatto opposto: perdono acqua in cottura, quindi il peso diminuisce mentre le calorie totali restano quasi invariate. Le kcal per 100g aumentano — 100g di pollo cotto contengono più calorie di 100g di pollo crudo, perché nello stesso peso c'è meno acqua e più sostanza.",
  },
  {
    key: "grassi",
    label: "Grassi",
    explanation:
      "Anche gli alimenti grassi come uova e formaggi perdono acqua in cottura, concentrando le calorie nello stesso modo delle proteine — ma qui l'effetto è più marcato, perché a perdere acqua è una matrice già ricca di grassi. Più la cottura è prolungata o ad alta temperatura (es. formaggio al forno), più le kcal per 100g salgono rispetto al prodotto fresco.",
  },
];

function groupByIngredient(rows: ConversionRow[]) {
  const byIngredient = new Map<string, ConversionRow[]>();
  for (const row of rows) {
    const list = byIngredient.get(row.ingredient) ?? [];
    list.push(row);
    byIngredient.set(row.ingredient, list);
  }
  return Array.from(byIngredient.entries());
}

export default async function CottoCrudoPage() {
  const supabase = await createClient();
  const { data } = await supabase.from("cooking_conversions").select("*").order("position");
  const rows = data ?? [];

  return (
    <div>
      <SectionIntro
        title="Cotto - Crudo"
        subtitle="Come cambiano peso e calorie di uno stesso alimento crudo e cotto, in base al metodo di cottura."
      />

      <div className="space-y-8">
        {CATEGORIES.map((cat) => {
          const ingredients = groupByIngredient(rows.filter((r) => r.category === cat.key));
          if (ingredients.length === 0) return null;
          return (
            <div key={cat.key}>
              <SectionLabel>{cat.label}</SectionLabel>
              <p className="mb-4 mt-1.5 text-[12.5px] leading-relaxed text-ink-soft">{cat.explanation}</p>
              <div className="space-y-3">
                {ingredients.map(([ingredient, methodRows]) => (
                  <Card key={ingredient} className="p-4">
                    <div className="mb-3 flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
                      <span className="font-display text-[15px] font-semibold">{ingredient}</span>
                      <span className="text-[12px] text-ink-faint">
                        crudo <span className="font-display font-semibold text-ink">{methodRows[0].raw_weight_g}g · {methodRows[0].raw_kcal} kcal</span>
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
                      {METHODS.map((m) => {
                        const r = methodRows.find((row) => row.method === m);
                        return (
                          <div key={m} className={`rounded-xl border px-2.5 py-2 ${r ? "border-teal/20 bg-teal/5" : "border-line-soft bg-cream-soft/50"}`}>
                            <div className="text-[9.5px] font-semibold uppercase tracking-wide text-ink-faint">{METHOD_LABELS[m]}</div>
                            {r ? (
                              <div className="mt-0.5 font-display text-[13px] font-semibold text-teal">
                                {r.cooked_weight_g}g · {r.cooked_kcal} kcal
                              </div>
                            ) : (
                              <div className="mt-0.5 text-[13px] text-ink-faint">—</div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
