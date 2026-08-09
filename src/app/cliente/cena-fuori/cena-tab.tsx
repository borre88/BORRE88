"use client";

import { useState } from "react";
import { Flame, Salad } from "lucide-react";
import type { Tables } from "@/lib/database.types";
import { ChipGroup, MacroPill, SectionIntro } from "@/components/ui";

type Dish = Tables<"dining_dishes">;
type Category = Tables<"dining_categories"> & { dining_dishes: Dish[] };

const PORTIONS = [
  { key: "small", label: "Piccola", mult: 0.75 },
  { key: "medium", label: "Media", mult: 1 },
  { key: "large", label: "Abbondante", mult: 1.35 },
];

export function CenaTab({ categories }: { categories: Category[] }) {
  const [categoryId, setCategoryId] = useState(categories[0]?.id ?? "");
  const [selectedDish, setSelectedDish] = useState<Dish | null>(null);
  const [portionKey, setPortionKey] = useState("medium");

  const category = categories.find((c) => c.id === categoryId);
  const portion = PORTIONS.find((p) => p.key === portionKey)!;

  const estimate = selectedDish
    ? {
        kcal: Math.round(selectedDish.kcal * portion.mult),
        p: Math.round(selectedDish.protein_g * portion.mult),
        c: Math.round(selectedDish.carbs_g * portion.mult),
        f: Math.round(selectedDish.fat_g * portion.mult),
      }
    : null;

  return (
    <div>
      <SectionIntro
        title="Calcolo cena fuori"
        subtitle="Stima rapida di calorie e macro per capire come regolarti nel resto della giornata. Sono valori indicativi, non un'analisi di laboratorio."
      />

      <div className="mb-4">
        <ChipGroup
          value={categoryId}
          onChange={(v) => {
            setCategoryId(v);
            setSelectedDish(null);
          }}
          options={categories.map((c) => ({ key: c.id, label: c.label }))}
        />
      </div>

      <div className="mb-5 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
        {category?.dining_dishes.map((d) => (
          <button
            key={d.id}
            type="button"
            onClick={() => setSelectedDish(d)}
            className={`rounded-xl border px-3.5 py-3 text-left ${
              selectedDish?.id === d.id ? "border-teal bg-teal-soft" : "border-line bg-surface"
            }`}
          >
            <div className="mb-1 text-[13.5px] font-medium">{d.name}</div>
            <div className="text-xs text-ink-soft">
              {d.kcal} kcal <span className="text-ink-faint">(porzione media)</span>
            </div>
          </button>
        ))}
      </div>

      {selectedDish && estimate && (
        <div className="rounded-xl border border-line bg-surface px-5 py-4.5">
          <div className="mb-3.5 flex items-center gap-2">
            <Salad size={16} strokeWidth={2} className="text-teal" />
            <div className="font-display text-lg font-semibold">{selectedDish.name}</div>
          </div>

          <div className="mb-4 flex items-center gap-3">
            <span className="text-xs font-medium text-ink-soft">Porzione</span>
            <div className="flex gap-1.5">
              {PORTIONS.map((p) => (
                <button
                  key={p.key}
                  type="button"
                  onClick={() => setPortionKey(p.key)}
                  className={`rounded-full border px-3.5 py-1 text-xs font-medium ${
                    portionKey === p.key ? "border-gold bg-gold text-white" : "border-line bg-cream text-ink-soft"
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-2.5">
            <div className="flex items-baseline gap-2">
              <Flame size={20} strokeWidth={2.2} className="text-gold" />
              <span className="font-display text-3xl font-medium">{estimate.kcal}</span>
              <span className="text-xs text-ink-faint">kcal stimate</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              <MacroPill label="Proteine" value={`${estimate.p}g`} wide />
              <MacroPill label="Carbo" value={`${estimate.c}g`} wide />
              <MacroPill label="Grassi" value={`${estimate.f}g`} wide />
            </div>
          </div>
          <div className="mt-3.5 text-[11.5px] italic leading-relaxed text-ink-faint">
            Stima indicativa basata su preparazioni standard. Condimenti extra, salse o bis possono
            alzare sensibilmente i valori.
          </div>
        </div>
      )}
    </div>
  );
}
