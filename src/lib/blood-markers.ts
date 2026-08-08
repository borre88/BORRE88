import type { Gender } from "@/lib/health-score";

export interface ReferenceRange {
  min: number | null;
  max: number | null;
}

export interface BloodMarker {
  key: string;
  label: string;
  unit: string;
  step: number;
  range: (gender: Gender | null) => ReferenceRange;
  adviceLow?: string;
  adviceHigh?: string;
}

export const BLOOD_MARKERS: BloodMarker[] = [
  {
    key: "glicemia",
    label: "Glicemia a digiuno",
    unit: "mg/dL",
    step: 1,
    range: () => ({ min: 70, max: 99 }),
    adviceLow: "Pasti più frequenti e bilanciati, evitare digiuni prolungati.",
    adviceHigh:
      "Ridurre zuccheri semplici e carboidrati raffinati, aumentare fibra e attività fisica regolare; se persistente, valutazione medica.",
  },
  {
    key: "hba1c",
    label: "Emoglobina glicata (HbA1c)",
    unit: "%",
    step: 0.1,
    range: () => ({ min: 4, max: 5.6 }),
    adviceHigh:
      "Attenzione al carico glicemico complessivo della dieta, distribuzione dei pasti e attività fisica regolare; da discutere col medico se elevata.",
  },
  {
    key: "colesterolo_totale",
    label: "Colesterolo totale",
    unit: "mg/dL",
    step: 1,
    range: () => ({ min: null, max: 199 }),
    adviceHigh:
      "Ridurre grassi saturi e trans, aumentare fibra solubile (avena, legumi) e attività aerobica.",
  },
  {
    key: "colesterolo_hdl",
    label: "Colesterolo HDL",
    unit: "mg/dL",
    step: 1,
    range: (gender) => ({ min: gender === "femmina" ? 50 : 40, max: null }),
    adviceLow: "Aumentare grassi insaturi (olio EVO, pesce azzurro, frutta secca) e attività aerobica regolare.",
  },
  {
    key: "colesterolo_ldl",
    label: "Colesterolo LDL",
    unit: "mg/dL",
    step: 1,
    range: () => ({ min: null, max: 129 }),
    adviceHigh: "Ridurre grassi saturi/trans, aumentare fibra solubile e omega-3; valutare consulto medico se elevato.",
  },
  {
    key: "trigliceridi",
    label: "Trigliceridi",
    unit: "mg/dL",
    step: 1,
    range: () => ({ min: null, max: 149 }),
    adviceHigh: "Ridurre zuccheri semplici e alcol, aumentare omega-3 (pesce azzurro) e attività fisica.",
  },
  {
    key: "vitamina_d",
    label: "Vitamina D (25-OH)",
    unit: "ng/mL",
    step: 1,
    range: () => ({ min: 30, max: 100 }),
    adviceLow:
      "Esposizione solare regolare, alimenti ricchi (pesce grasso, uova, funghi); valutare integrazione di vitamina D3 con il medico.",
  },
  {
    key: "vitamina_b12",
    label: "Vitamina B12",
    unit: "pg/mL",
    step: 1,
    range: () => ({ min: 200, max: 900 }),
    adviceLow: "Aumentare fonti animali (carne, pesce, uova, latticini) o valutare integrazione, specie se dieta vegetariana/vegana.",
  },
  {
    key: "ferritina",
    label: "Ferritina",
    unit: "ng/mL",
    step: 1,
    range: (gender) => (gender === "femmina" ? { min: 15, max: 150 } : { min: 30, max: 400 }),
    adviceLow: "Alimenti ricchi di ferro (carne rossa magra, legumi, verdure a foglia verde) abbinati a vitamina C; valutare supplementazione se persistente.",
    adviceHigh: "Valori elevati vanno sempre discussi col medico prima di qualsiasi intervento.",
  },
  {
    key: "emoglobina",
    label: "Emoglobina",
    unit: "g/dL",
    step: 0.1,
    range: (gender) => (gender === "femmina" ? { min: 12, max: 15.5 } : { min: 13.5, max: 17.5 }),
    adviceLow: "Alimenti ricchi di ferro e vitamina B12/folati; valutazione medica se il valore resta basso.",
  },
  {
    key: "tsh",
    label: "TSH",
    unit: "µIU/mL",
    step: 0.01,
    range: () => ({ min: 0.4, max: 4.0 }),
    adviceLow: "Valore da interpretare con il medico, non modificabile con la sola dieta.",
    adviceHigh: "Valore da interpretare con il medico, non modificabile con la sola dieta.",
  },
  {
    key: "creatinina",
    label: "Creatinina",
    unit: "mg/dL",
    step: 0.01,
    range: (gender) => (gender === "femmina" ? { min: 0.6, max: 1.1 } : { min: 0.7, max: 1.3 }),
    adviceHigh: "Curare l'idratazione e discutere il valore con il medico, soprattutto se assumi integratori proteici ad alto dosaggio.",
  },
  {
    key: "pcr",
    label: "Proteina C reattiva (PCR)",
    unit: "mg/L",
    step: 0.1,
    range: () => ({ min: null, max: 3 }),
    adviceHigh: "Indica infiammazione in corso: curare sonno e recupero, moderare carichi di allenamento, alimentazione antinfiammatoria (verdura, pesce azzurro, olio EVO).",
  },
  {
    key: "acido_urico",
    label: "Acido urico",
    unit: "mg/dL",
    step: 0.1,
    range: (gender) => (gender === "femmina" ? { min: 2.4, max: 6.0 } : { min: 3.4, max: 7.0 }),
    adviceHigh: "Ridurre alcol, carni rosse/frattaglie e zuccheri semplici; aumentare idratazione.",
  },
  {
    key: "testosterone_totale",
    label: "Testosterone totale",
    unit: "ng/dL",
    step: 1,
    range: (gender) => (gender === "femmina" ? { min: 15, max: 70 } : { min: 300, max: 1000 }),
    adviceLow: "Curare sonno, gestione dello stress e adeguato apporto calorico/proteico e grassi; valutazione medica se persistentemente basso.",
  },
];
