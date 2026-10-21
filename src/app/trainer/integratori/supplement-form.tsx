"use client";

import { useState, useTransition } from "react";
import { Sparkles, X } from "lucide-react";
import type { Tables } from "@/lib/database.types";
import { createSupplement, updateSupplement, type SupplementInput } from "./actions";

type Supplement = Tables<"supplements">;

export function SupplementForm({
  supplement,
  onDone,
  onCancel,
}: {
  supplement: Supplement | null;
  onDone: (id: string) => void;
  onCancel: () => void;
}) {
  const [name, setName] = useState(supplement?.name ?? "");
  const [brand, setBrand] = useState(supplement?.brand ?? "MÖWE");
  const [category, setCategory] = useState(supplement?.category ?? "");
  const [format, setFormat] = useState(supplement?.format ?? "");
  const [packageSize, setPackageSize] = useState(supplement?.package_size ?? "");
  const [priceMin, setPriceMin] = useState(supplement?.price_min?.toString() ?? "");
  const [priceMax, setPriceMax] = useState(supplement?.price_max?.toString() ?? "");
  const [productUrl, setProductUrl] = useState(supplement?.product_url ?? "");
  const [servingSize, setServingSize] = useState(supplement?.serving_size ?? "");
  const [suggestedUse, setSuggestedUse] = useState(supplement?.suggested_use ?? "");
  const [ingredients, setIngredients] = useState(supplement?.ingredients ?? "");
  const [flavors, setFlavors] = useState(supplement?.flavors ?? "");

  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const inputClass = "w-full rounded-md border border-line bg-cream px-2.5 py-1.5 text-[13px] outline-none focus:border-teal";

  function save() {
    if (!name.trim()) {
      setError("Il nome del prodotto è obbligatorio.");
      return;
    }
    const input: SupplementInput = {
      name,
      brand: brand || null,
      category: category || null,
      format: format || null,
      package_size: packageSize || null,
      price_min: priceMin.trim() ? Number(priceMin) : null,
      price_max: priceMax.trim() ? Number(priceMax) : null,
      image_url: null,
      product_url: productUrl || null,
      serving_size: servingSize || null,
      suggested_use: suggestedUse || null,
      ingredients: ingredients || null,
      flavors: flavors || null,
      notes: null,
    };

    startTransition(async () => {
      const result = supplement ? await updateSupplement(supplement.id, input) : await createSupplement(input);
      if (result.error) setError(result.error);
      else onDone(supplement?.id ?? ("supplementId" in result ? (result.supplementId as string) : ""));
    });
  }

  return (
    <div className="rounded-xl border border-line bg-surface p-4 sm:p-5">
      <div className="mb-4 flex items-center justify-between">
        <div className="font-display text-lg font-bold">{supplement ? "Modifica integratore" : "Nuovo integratore"}</div>
        <button type="button" onClick={onCancel} aria-label="Annulla" className="text-ink-soft">
          <X size={16} strokeWidth={2.2} />
        </button>
      </div>

      <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-xs font-medium text-ink-soft" htmlFor="sup-name">
            Nome prodotto
          </label>
          <input id="sup-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Es. Proteine Isolate WHEY" className={inputClass} />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-ink-soft" htmlFor="sup-brand">
            Marca
          </label>
          <input id="sup-brand" value={brand ?? ""} onChange={(e) => setBrand(e.target.value)} className={inputClass} />
        </div>
      </div>

      <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div>
          <label className="mb-1 block text-xs font-medium text-ink-soft" htmlFor="sup-category">
            Categoria
          </label>
          <input id="sup-category" value={category ?? ""} onChange={(e) => setCategory(e.target.value)} placeholder="Fitness, Wellness, Performance" className={inputClass} />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-ink-soft" htmlFor="sup-format">
            Formato
          </label>
          <input id="sup-format" value={format ?? ""} onChange={(e) => setFormat(e.target.value)} placeholder="Polveri, Capsule…" className={inputClass} />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-ink-soft" htmlFor="sup-package">
            Confezione
          </label>
          <input id="sup-package" value={packageSize ?? ""} onChange={(e) => setPackageSize(e.target.value)} placeholder="1 kg, 90 cps…" className={inputClass} />
        </div>
      </div>

      <div className="mb-4 grid grid-cols-2 gap-3">
        <div>
          <label className="mb-1 block text-xs font-medium text-ink-soft" htmlFor="sup-price-min">
            Prezzo (€)
          </label>
          <input id="sup-price-min" type="number" step="0.01" value={priceMin} onChange={(e) => setPriceMin(e.target.value)} className={inputClass} />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-ink-soft" htmlFor="sup-price-max">
            Prezzo max (fascia, facoltativo)
          </label>
          <input id="sup-price-max" type="number" step="0.01" value={priceMax} onChange={(e) => setPriceMax(e.target.value)} className={inputClass} />
        </div>
      </div>

      <div className="mb-4">
        <label className="mb-1 block text-xs font-medium text-ink-soft" htmlFor="sup-url">
          Link alla pagina prodotto
        </label>
        <input id="sup-url" value={productUrl ?? ""} onChange={(e) => setProductUrl(e.target.value)} placeholder="https://…" className={inputClass} />
      </div>

      <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-xs font-medium text-ink-soft" htmlFor="sup-serving">
            Porzione consigliata
          </label>
          <input id="sup-serving" value={servingSize ?? ""} onChange={(e) => setServingSize(e.target.value)} placeholder="Es. 30 g" className={inputClass} />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-ink-soft" htmlFor="sup-flavors">
            Gusti disponibili
          </label>
          <input id="sup-flavors" value={flavors ?? ""} onChange={(e) => setFlavors(e.target.value)} className={inputClass} />
        </div>
      </div>

      <div className="mb-4">
        <label className="mb-1 block text-xs font-medium text-ink-soft" htmlFor="sup-use">
          Modalità d&apos;uso
        </label>
        <textarea id="sup-use" value={suggestedUse ?? ""} onChange={(e) => setSuggestedUse(e.target.value)} rows={2} className={inputClass} />
      </div>

      <div className="mb-4">
        <label className="mb-1 block text-xs font-medium text-ink-soft" htmlFor="sup-ingredients">
          Ingredienti / principi attivi
        </label>
        <textarea id="sup-ingredients" value={ingredients ?? ""} onChange={(e) => setIngredients(e.target.value)} rows={2} className={inputClass} />
      </div>

      {error && <p className="mb-3 text-xs font-medium text-bad">{error}</p>}

      <div className="flex gap-2">
        <button
          type="button"
          disabled={pending}
          onClick={save}
          className="flex items-center gap-1.5 rounded-lg bg-teal px-4 py-2.5 text-sm font-medium text-white disabled:opacity-60"
        >
          <Sparkles size={15} strokeWidth={2.2} />
          {pending ? "Salvataggio…" : supplement ? "Salva modifiche" : "Crea integratore"}
        </button>
        <button type="button" onClick={onCancel} className="rounded-lg border border-line px-4 py-2.5 text-sm font-medium text-ink-soft">
          Annulla
        </button>
      </div>
    </div>
  );
}
