"use client";

import { useMemo, useRef, useState, useTransition } from "react";
import { Plus, Pencil, Trash2, X, Upload, Search } from "lucide-react";
import type { Tables } from "@/lib/database.types";
import { FOOD_CATEGORY_LABELS, foodCategoryDotClass } from "@/lib/diet-calc";
import { ChipGroup } from "@/components/ui";
import { createFood, updateFood, deleteFood, bulkImportFoods, type FoodInput } from "./actions";

type Food = Tables<"foods">;

const CATEGORY_KEYS = Object.keys(FOOD_CATEGORY_LABELS);

const emptyForm: FoodInput = {
  name: "",
  category: "cereali",
  kcal_100g: 0,
  protein_100g: 0,
  carbs_100g: 0,
  fat_100g: 0,
  fiber_100g: 0,
};

function parseCsv(text: string): FoodInput[] {
  const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);
  if (lines.length < 2) return [];
  const delimiter = lines[0].includes(";") ? ";" : ",";
  const header = lines[0].split(delimiter).map((h) => h.trim().toLowerCase());

  const idx = {
    name: header.findIndex((h) => ["nome", "name", "alimento"].includes(h)),
    category: header.findIndex((h) => ["categoria", "category"].includes(h)),
    kcal: header.findIndex((h) => ["kcal", "kcal_100g", "calorie"].includes(h)),
    protein: header.findIndex((h) => ["proteine", "protein", "protein_100g"].includes(h)),
    carbs: header.findIndex((h) => ["carboidrati", "carbs", "carbs_100g"].includes(h)),
    fat: header.findIndex((h) => ["grassi", "fat", "fat_100g"].includes(h)),
    fiber: header.findIndex((h) => ["fibre", "fibra", "fiber", "fiber_100g"].includes(h)),
  };

  const num = (v: string | undefined) => {
    const n = Number((v ?? "0").replace(",", "."));
    return Number.isFinite(n) ? n : 0;
  };

  return lines.slice(1).map((line) => {
    const cells = line.split(delimiter).map((c) => c.trim());
    return {
      name: idx.name >= 0 ? cells[idx.name] ?? "" : "",
      category: idx.category >= 0 ? cells[idx.category] || "altro" : "altro",
      kcal_100g: idx.kcal >= 0 ? num(cells[idx.kcal]) : 0,
      protein_100g: idx.protein >= 0 ? num(cells[idx.protein]) : 0,
      carbs_100g: idx.carbs >= 0 ? num(cells[idx.carbs]) : 0,
      fat_100g: idx.fat >= 0 ? num(cells[idx.fat]) : 0,
      fiber_100g: idx.fiber >= 0 ? num(cells[idx.fiber]) : 0,
    };
  });
}

export function FoodList({ foods }: { foods: Food[] }) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("tutte");
  const [modalFood, setModalFood] = useState<Food | "new" | null>(null);
  const [importError, setImportError] = useState<string | null>(null);
  const [importMsg, setImportMsg] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const presentCategories = useMemo(() => {
    const present = new Set(foods.map((f) => f.category));
    return CATEGORY_KEYS.filter((c) => present.has(c));
  }, [foods]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return foods.filter((f) => {
      if (category !== "tutte" && f.category !== category) return false;
      if (q && !f.name.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [foods, query, category]);

  function handleImportFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setImportError(null);
    setImportMsg(null);

    const reader = new FileReader();
    reader.onload = () => {
      const text = String(reader.result ?? "");
      const rows = parseCsv(text);
      if (rows.length === 0) {
        setImportError("Il file non contiene righe valide. Intestazioni attese: nome,categoria,kcal,proteine,carboidrati,grassi,fibre");
        return;
      }
      startTransition(async () => {
        const result = await bulkImportFoods(rows);
        if (result.error) setImportError(result.error);
        else setImportMsg(`Importati ${result.imported} alimenti.`);
      });
    };
    reader.readAsText(file);
    e.target.value = "";
  }

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <div className="flex flex-1 items-center gap-2 rounded-lg border border-line bg-surface px-3 py-2 sm:max-w-xs">
          <Search size={14} strokeWidth={2.2} className="shrink-0 text-ink-faint" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Cerca alimento…"
            className="w-full border-none bg-transparent text-sm outline-none"
          />
        </div>
        <input ref={fileInputRef} type="file" accept=".csv,text/csv" className="hidden" onChange={handleImportFile} />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={pending}
          className="flex items-center gap-1.5 rounded-lg border border-line px-3.5 py-2 text-xs font-medium text-ink-soft disabled:opacity-60"
        >
          <Upload size={14} strokeWidth={2.2} />
          Importa CSV
        </button>
        <button
          type="button"
          onClick={() => setModalFood("new")}
          className="flex items-center gap-1.5 rounded-lg bg-teal px-3.5 py-2 text-xs font-medium text-white"
        >
          <Plus size={14} strokeWidth={2.2} />
          Nuovo alimento
        </button>
      </div>

      {importError && <p className="mb-3 text-xs font-medium text-bad">{importError}</p>}
      {importMsg && <p className="mb-3 text-xs font-medium text-good">{importMsg}</p>}

      <div className="mb-4">
        <ChipGroup
          value={category}
          onChange={setCategory}
          options={[
            { key: "tutte", label: `Tutte (${foods.length})` },
            ...presentCategories.map((c) => ({
              key: c,
              label: (
                <span className="flex items-center gap-1.5">
                  <span className={`h-1.5 w-1.5 rounded-full ${foodCategoryDotClass(c)}`} />
                  {FOOD_CATEGORY_LABELS[c] ?? c}
                </span>
              ),
            })),
          ]}
        />
      </div>

      <div className="overflow-x-auto rounded-xl border border-line bg-surface">
        <table className="w-full border-collapse text-[12.5px]">
          <thead>
            <tr className="bg-cream">
              <th className="px-3 py-2 text-left text-[10.5px] font-semibold text-ink-faint">Nome</th>
              <th className="px-3 py-2 text-left text-[10.5px] font-semibold text-ink-faint">Categoria</th>
              <th className="px-3 py-2 text-right text-[10.5px] font-semibold text-ink-faint">Kcal</th>
              <th className="px-3 py-2 text-right text-[10.5px] font-semibold text-ink-faint">P (g)</th>
              <th className="px-3 py-2 text-right text-[10.5px] font-semibold text-ink-faint">C (g)</th>
              <th className="px-3 py-2 text-right text-[10.5px] font-semibold text-ink-faint">G (g)</th>
              <th className="px-3 py-2 text-right text-[10.5px] font-semibold text-ink-faint">Fibre (g)</th>
              <th className="px-3 py-2"></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((f) => (
              <tr key={f.id} className="border-t border-line">
                <td className="px-3 py-2 font-medium">{f.name}</td>
                <td className="px-3 py-2 text-ink-faint">
                  <span className="flex items-center gap-1.5">
                    <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${foodCategoryDotClass(f.category)}`} />
                    {FOOD_CATEGORY_LABELS[f.category] ?? f.category}
                  </span>
                </td>
                <td className="px-3 py-2 text-right">{f.kcal_100g}</td>
                <td className="px-3 py-2 text-right">{f.protein_100g}</td>
                <td className="px-3 py-2 text-right">{f.carbs_100g}</td>
                <td className="px-3 py-2 text-right">{f.fat_100g}</td>
                <td className="px-3 py-2 text-right">{f.fiber_100g}</td>
                <td className="px-3 py-2">
                  <div className="flex justify-end gap-1">
                    <button
                      type="button"
                      onClick={() => setModalFood(f)}
                      aria-label="Modifica"
                      className="flex h-6 w-6 items-center justify-center rounded text-ink-faint hover:text-teal"
                    >
                      <Pencil size={13} strokeWidth={2.2} />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (confirm(`Eliminare "${f.name}"?`)) startTransition(() => deleteFood(f.id));
                      }}
                      aria-label="Elimina"
                      className="flex h-6 w-6 items-center justify-center rounded text-ink-faint hover:text-bad"
                    >
                      <Trash2 size={13} strokeWidth={2.2} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={8} className="px-3 py-6 text-center text-ink-faint">
                  Nessun alimento trovato.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {modalFood && <FoodModal food={modalFood === "new" ? null : modalFood} onClose={() => setModalFood(null)} />}
    </div>
  );
}

function FoodModal({ food, onClose }: { food: Food | null; onClose: () => void }) {
  const [form, setForm] = useState<FoodInput>(
    food
      ? {
          name: food.name,
          category: food.category,
          kcal_100g: food.kcal_100g,
          protein_100g: food.protein_100g,
          carbs_100g: food.carbs_100g,
          fat_100g: food.fat_100g,
          fiber_100g: food.fiber_100g,
        }
      : emptyForm
  );
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const inputClass = "w-full rounded-md border border-line bg-cream px-2.5 py-1.5 text-[13px] outline-none focus:border-teal";

  function save() {
    startTransition(async () => {
      const result = food ? await updateFood(food.id, form) : await createFood(form);
      if (result?.error) setError(result.error);
      else onClose();
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-5" onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} className="flex max-h-[85vh] w-full max-w-sm flex-col rounded-2xl bg-surface">
        <div className="flex items-start justify-between border-b border-line px-5 py-4">
          <div>
            <div className="text-[10.5px] font-semibold uppercase tracking-wide text-gold">Alimento</div>
            <div className="font-display text-lg font-bold">{food ? "Modifica" : "Nuovo alimento"}</div>
          </div>
          <button type="button" onClick={onClose} aria-label="Chiudi" className="text-ink-soft">
            <X size={16} strokeWidth={2.2} />
          </button>
        </div>

        <div className="overflow-y-auto px-5 py-4">
          <label className="mb-1 block text-xs font-medium text-ink-soft" htmlFor="food-name">
            Nome
          </label>
          <input
            id="food-name"
            value={form.name}
            onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
            className={`${inputClass} mb-3`}
          />

          <label className="mb-1 block text-xs font-medium text-ink-soft" htmlFor="food-category">
            Categoria
          </label>
          <select
            id="food-category"
            value={form.category}
            onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))}
            className={`${inputClass} mb-3`}
          >
            {Object.entries(FOOD_CATEGORY_LABELS).map(([key, label]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </select>

          <div className="mb-3 grid grid-cols-2 gap-2">
            <div>
              <label className="mb-1 block text-[10.5px] font-medium text-ink-faint" htmlFor="food-kcal">
                Kcal / 100g
              </label>
              <input
                id="food-kcal"
                type="number"
                step="0.1"
                value={form.kcal_100g}
                onChange={(e) => setForm((p) => ({ ...p, kcal_100g: Number(e.target.value) }))}
                className={inputClass}
              />
            </div>
            <div>
              <label className="mb-1 block text-[10.5px] font-medium text-ink-faint" htmlFor="food-protein">
                Proteine (g)
              </label>
              <input
                id="food-protein"
                type="number"
                step="0.1"
                value={form.protein_100g}
                onChange={(e) => setForm((p) => ({ ...p, protein_100g: Number(e.target.value) }))}
                className={inputClass}
              />
            </div>
            <div>
              <label className="mb-1 block text-[10.5px] font-medium text-ink-faint" htmlFor="food-carbs">
                Carboidrati (g)
              </label>
              <input
                id="food-carbs"
                type="number"
                step="0.1"
                value={form.carbs_100g}
                onChange={(e) => setForm((p) => ({ ...p, carbs_100g: Number(e.target.value) }))}
                className={inputClass}
              />
            </div>
            <div>
              <label className="mb-1 block text-[10.5px] font-medium text-ink-faint" htmlFor="food-fat">
                Grassi (g)
              </label>
              <input
                id="food-fat"
                type="number"
                step="0.1"
                value={form.fat_100g}
                onChange={(e) => setForm((p) => ({ ...p, fat_100g: Number(e.target.value) }))}
                className={inputClass}
              />
            </div>
            <div>
              <label className="mb-1 block text-[10.5px] font-medium text-ink-faint" htmlFor="food-fiber">
                Fibre (g)
              </label>
              <input
                id="food-fiber"
                type="number"
                step="0.1"
                value={form.fiber_100g}
                onChange={(e) => setForm((p) => ({ ...p, fiber_100g: Number(e.target.value) }))}
                className={inputClass}
              />
            </div>
          </div>

          {error && <p className="mb-3 text-xs font-medium text-bad">{error}</p>}

          <div className="flex justify-end gap-2 border-t border-line pt-4">
            <button type="button" onClick={onClose} className="rounded-md border border-line px-3.5 py-2 text-xs font-medium text-ink-soft">
              Annulla
            </button>
            <button
              type="button"
              disabled={pending}
              onClick={save}
              className="rounded-md bg-teal px-4 py-2 text-xs font-medium text-white disabled:opacity-60"
            >
              {pending ? "Salvataggio…" : "Salva alimento"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
