"use client";

import { useMemo, useState } from "react";
import { Clock, Dumbbell, Home, ChevronDown, ChevronUp, Info } from "lucide-react";
import type { Tables } from "@/lib/database.types";
import { renderZoneTokens, type HeartRateZone } from "@/lib/health-score";
import { ChipGroup, SectionIntro, Tag } from "@/components/ui";

type Workout = Tables<"workouts"> & { workout_exercises: Tables<"workout_exercises">[] };

const CATEGORY_LABELS: Record<string, string> = {
  casa: "Casa",
  ripetute: "Ripetute",
  hyrox: "Hyrox",
  mobility: "Mobilità e recupero",
  gym: "Palestra (GYM)",
  corsa: "Corsa",
};

const CATEGORY_SUBTITLES: Record<string, string> = {
  casa: "Schede pronte in base agli attrezzi che hai a disposizione.",
  ripetute: "Lavoro aerobico a ripetute: 4x4 norvegese, fartlek e altri protocolli.",
  hyrox: "Circuiti funzionali in stile Hyrox: corsa, wall ball, affondi e stazioni a tempo.",
  mobility: "Esercizi di allungamento e recupero per le diverse parti del corpo.",
  gym: "Schede da palestra per gruppo muscolare, con 5 livelli di esperienza: scegli la categoria e il tuo livello.",
  corsa: "Corsa strutturata per zona cardiaca, con 5 livelli di esperienza: le zone bpm sono calcolate sui tuoi dati.",
};

/** Categorie con sottocategoria + livello (chip a due passaggi), invece del filtro attrezzatura. */
const LEVELED_CATEGORIES = new Set(["gym", "corsa"]);

const EQUIP_LABELS: Record<string, string> = {
  nessuno: "Nessun attrezzo",
  manubri: "Manubri",
  elastici: "Elastici",
};

const GOAL_LABELS: Record<string, string> = {
  generale: "Generale",
  forza: "Forza",
  dimagrimento: "Dimagrimento",
};

const SUBCATEGORY_LABELS: Record<string, string> = {
  push: "Push",
  pull: "Pull",
  leg: "Leg",
  leg_focus_quad: "Leg Focus Quad",
  leg_focus_femorali: "Leg Focus Femorali",
  leg_focus_glutei: "Leg Focus Glutei",
  full_body: "Full Body",
  full_body_restart: "Full Body Restart",
  zona2: "Corsa Zona 2",
  intervalli: "Ripetute Zona 3/4",
  soglia: "Soglia",
  fartlek: "Fartlek",
};

const LEVEL_DESCRIPTIONS: Record<number, string> = {
  1: "Conosci gli esercizi ma hai poca dimestichezza: si parte con movimenti semplici.",
  2: "Conosci gli esercizi e hai una buona tecnica.",
  3: "Ti alleni in autonomia e sai gestire i carichi per un effort ottimale.",
  4: "Ti alleni regolarmente da solo e conosci tecniche di allenamento avanzate.",
  5: "Livello pro: ti alleni da anni in autonomia, anche in preparazione gara.",
};

export function AllenamentiTab({ workouts, zones = null }: { workouts: Workout[]; zones?: HeartRateZone[] | null }) {
  const categories = useMemo(() => {
    const present = new Set(workouts.map((w) => w.category));
    return Object.keys(CATEGORY_LABELS).filter((c) => present.has(c));
  }, [workouts]);

  const [category, setCategory] = useState(categories[0] ?? "casa");
  const [equipment, setEquipment] = useState("tutti");
  const [expanded, setExpanded] = useState<string | null>(null);

  const inCategory = useMemo(() => workouts.filter((w) => w.category === category), [workouts, category]);

  const leveledSubcategories = useMemo(() => {
    const present = new Set(inCategory.map((w) => w.subcategory).filter((s): s is string => s !== null));
    return Object.keys(SUBCATEGORY_LABELS).filter((s) => present.has(s));
  }, [inCategory]);

  const [subcategory, setSubcategory] = useState(leveledSubcategories[0] ?? "push");
  const [level, setLevel] = useState(1);

  const isLeveled = LEVELED_CATEGORIES.has(category);

  const filtered = useMemo(() => {
    if (category === "casa") return inCategory.filter((w) => equipment === "tutti" || w.equipment === equipment);
    if (isLeveled) return inCategory.filter((w) => w.subcategory === subcategory && w.level === level);
    return inCategory;
  }, [inCategory, category, equipment, isLeveled, subcategory, level]);

  return (
    <div>
      <SectionIntro title="Workout on holiday" subtitle={CATEGORY_SUBTITLES[category]} />

      <div className="mb-3">
        <ChipGroup
          value={category}
          onChange={(v) => {
            setCategory(v);
            setExpanded(null);
          }}
          options={categories.map((c) => ({ key: c, label: CATEGORY_LABELS[c] }))}
        />
      </div>

      {category === "casa" && (
        <div className="mb-4">
          <ChipGroup
            value={equipment}
            onChange={setEquipment}
            options={[{ key: "tutti", label: "Tutti" }, ...Object.entries(EQUIP_LABELS).map(([key, label]) => ({ key, label }))]}
          />
        </div>
      )}

      {isLeveled && (
        <>
          <div className="mb-3">
            <ChipGroup
              value={subcategory}
              onChange={(v) => {
                setSubcategory(v);
                setExpanded(null);
              }}
              options={leveledSubcategories.map((s) => ({ key: s, label: SUBCATEGORY_LABELS[s] }))}
            />
          </div>
          <div className="mb-4">
            <ChipGroup
              value={String(level)}
              onChange={(v) => {
                setLevel(Number(v));
                setExpanded(null);
              }}
              options={[1, 2, 3, 4, 5].map((l) => ({ key: String(l), label: `Livello ${l}` }))}
            />
          </div>
          <div className="mb-4 flex gap-2.5 rounded-lg border border-teal-soft-line bg-teal-soft px-4 py-3">
            <Info size={16} strokeWidth={2.2} className="mt-0.5 shrink-0 text-teal" />
            <p className="text-[12.5px] leading-relaxed text-ink">{LEVEL_DESCRIPTIONS[level]}</p>
          </div>
          {category === "corsa" && !zones && (
            <div className="mb-4 flex gap-2.5 rounded-lg border border-gold bg-gold-soft px-4 py-3">
              <Info size={16} strokeWidth={2.2} className="mt-0.5 shrink-0 text-gold" />
              <p className="text-[12.5px] leading-relaxed text-ink">
                Le zone qui sotto sono indicative: inserisci la tua FC a riposo (e la data di nascita) nella
                Valutazione per vedere i bpm calcolati su di te.
              </p>
            </div>
          )}
        </>
      )}

      {category === "hyrox" && (
        <div className="mb-4 flex gap-2.5 rounded-lg border border-teal-soft-line bg-teal-soft px-4 py-3">
          <Info size={16} strokeWidth={2.2} className="mt-0.5 shrink-0 text-teal" />
          <p className="text-[12.5px] leading-relaxed text-ink">
            <span className="font-semibold">Come funziona il circuito:</span> ogni scheda è divisa in giri, un giro
            diverso per riga nella tabella. In ogni giro corri la distanza indicata e passi subito alla stazione,
            senza fermarti dopo la corsa. Ti fermi solo alla fine della stazione, per il tempo indicato in
            &quot;Recupero&quot; — poi riparti con la corsa del giro successivo.
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {filtered.map((w) => (
          <div key={w.id} className="overflow-hidden rounded-xl border border-line bg-surface">
            <button
              type="button"
              onClick={() => setExpanded(expanded === w.id ? null : w.id)}
              className="flex w-full items-start gap-2 px-4 py-3.5 text-left"
            >
              <div className="flex-1">
                <div className="mb-1.5 flex gap-1.5">
                  {category === "casa" && (
                    <Tag>
                      <Home size={10} strokeWidth={2.5} className="mr-1 inline" />
                      {EQUIP_LABELS[w.equipment]}
                    </Tag>
                  )}
                  {isLeveled && w.level !== null && <Tag>Livello {w.level}</Tag>}
                  <Tag muted>{GOAL_LABELS[w.goal]}</Tag>
                </div>
                <div className="mb-1.5 font-display text-[17px] font-semibold leading-tight">{w.name}</div>
                <div className="flex gap-3">
                  <span className="flex items-center gap-1 text-xs text-ink-soft">
                    <Clock size={12} strokeWidth={2.2} /> {w.duration_minutes} min
                  </span>
                  <span className="flex items-center gap-1 text-xs text-ink-soft">
                    <Dumbbell size={12} strokeWidth={2.2} /> {w.workout_exercises.length} esercizi
                  </span>
                </div>
              </div>
              <span className="shrink-0 text-ink-faint">
                {expanded === w.id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </span>
            </button>

            {expanded === w.id && (
              <div className="border-t border-line bg-cream px-4 pb-4 pt-3">
                <table className="w-full border-collapse text-[12.5px]">
                  <thead>
                    <tr>
                      <th className="px-2 py-1 text-left text-[10.5px] font-semibold text-ink-faint">Esercizio</th>
                      <th className="px-2 py-1 text-left text-[10.5px] font-semibold text-ink-faint">Serie</th>
                      <th className="px-2 py-1 text-left text-[10.5px] font-semibold text-ink-faint">Rip.</th>
                      <th className="px-2 py-1 text-left text-[10.5px] font-semibold text-ink-faint">Recupero</th>
                    </tr>
                  </thead>
                  <tbody>
                    {w.workout_exercises.map((ex) => (
                      <tr key={ex.id}>
                        <td className="border-t border-line px-2 py-1.5">{renderZoneTokens(ex.name, zones)}</td>
                        <td className="border-t border-line px-2 py-1.5">{ex.sets}</td>
                        <td className="border-t border-line px-2 py-1.5">{ex.reps}</td>
                        <td className="border-t border-line px-2 py-1.5">{renderZoneTokens(ex.rest, zones)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
