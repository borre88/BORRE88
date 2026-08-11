import { createClient } from "@/lib/supabase/server";
import { SectionIntro } from "@/components/ui";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { Card } from "@/components/ui/Card";

const METHOD_LABELS: Record<string, string> = {
  padella: "Padella",
  forno: "Forno",
  vapore: "Vapore",
  friggitrice_aria: "Friggitrice ad aria",
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
          const catRows = rows.filter((r) => r.category === cat.key);
          if (catRows.length === 0) return null;
          return (
            <div key={cat.key}>
              <SectionLabel>{cat.label}</SectionLabel>
              <p className="mb-4 mt-1.5 text-[12.5px] leading-relaxed text-ink-soft">{cat.explanation}</p>
              <Card className="overflow-x-auto p-0">
                <table className="w-full min-w-[720px] border-collapse text-[12px]">
                  <thead>
                    <tr>
                      {["Ingrediente", "Metodo", "Peso crudo", "Kcal crudo", "Peso cotto", "Kcal cotto", "Kcal/100g crudo", "Kcal/100g cotto"].map(
                        (h) => (
                          <th key={h} className="whitespace-nowrap px-3 py-2 text-left text-[10px] font-semibold uppercase tracking-wide text-ink-faint">
                            {h}
                          </th>
                        )
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {catRows.map((r) => (
                      <tr key={r.id}>
                        <td className="whitespace-nowrap border-t border-line-soft px-3 py-2 font-medium">{r.ingredient}</td>
                        <td className="whitespace-nowrap border-t border-line-soft px-3 py-2 text-ink-soft">
                          {METHOD_LABELS[r.method] ?? r.method}
                        </td>
                        <td className="whitespace-nowrap border-t border-line-soft px-3 py-2 font-display">{r.raw_weight_g}g</td>
                        <td className="whitespace-nowrap border-t border-line-soft px-3 py-2 font-display">{r.raw_kcal} kcal</td>
                        <td className="whitespace-nowrap border-t border-line-soft px-3 py-2 font-display">{r.cooked_weight_g}g</td>
                        <td className="whitespace-nowrap border-t border-line-soft px-3 py-2 font-display">{r.cooked_kcal} kcal</td>
                        <td className="whitespace-nowrap border-t border-line-soft px-3 py-2 font-display text-ink-soft">
                          {Math.round((r.raw_kcal / r.raw_weight_g) * 100)} kcal
                        </td>
                        <td className="whitespace-nowrap border-t border-line-soft px-3 py-2 font-display font-semibold text-teal">
                          {Math.round((r.cooked_kcal / r.cooked_weight_g) * 100)} kcal
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </Card>
            </div>
          );
        })}
      </div>
    </div>
  );
}
