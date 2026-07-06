// Configurazione del questionario "Longevity Score".
//
// Ogni area (categoria) vale al massimo 20 punti, per un totale complessivo
// su 100. Solo le domande a scelta multipla (`questions`) concorrono al
// punteggio; i campi in `extraFields` sono informativi (es. massimali,
// integratori assunti) e vengono mostrati al cliente e al nutrizionista ma
// non influenzano lo score.

export type CategoryKey =
  | "training"
  | "nutrition"
  | "sleep"
  | "stress"
  | "prevention";

export type ChoiceOption = {
  value: string;
  label: string;
  points: number;
};

export type ChoiceQuestion = {
  id: string;
  type: "choice";
  label: string;
  options: ChoiceOption[];
};

export type ExtraField =
  | { id: string; type: "number"; label: string; unit?: string }
  | { id: string; type: "text"; label: string; placeholder?: string };

export type Category = {
  key: CategoryKey;
  title: string;
  description: string;
  maxScore: number;
  questions: ChoiceQuestion[];
  extraFields?: ExtraField[];
};

export const CATEGORIES: Category[] = [
  {
    key: "training",
    title: "Allenamento",
    description:
      "Frequenza, costanza e tipo di attività fisica praticata.",
    maxScore: 20,
    questions: [
      {
        id: "training_frequency",
        type: "choice",
        label: "Quante volte ti alleni a settimana?",
        options: [
          { value: "0", label: "Non mi alleno", points: 0 },
          { value: "1-2", label: "1-2 volte", points: 2 },
          { value: "3-4", label: "3-4 volte", points: 4 },
          { value: "5+", label: "5 o più volte", points: 5 },
        ],
      },
      {
        id: "training_consistency",
        type: "choice",
        label: "Da quanto tempo ti alleni con costanza?",
        options: [
          { value: "never", label: "Mai / ho appena iniziato", points: 0 },
          { value: "lt3m", label: "Meno di 3 mesi", points: 1 },
          { value: "3-12m", label: "Da 3 a 12 mesi", points: 3 },
          { value: "1-3y", label: "Da 1 a 3 anni", points: 4 },
          { value: "gt3y", label: "Più di 3 anni", points: 5 },
        ],
      },
      {
        id: "training_type",
        type: "choice",
        label: "Che tipo di allenamento pratichi prevalentemente?",
        options: [
          { value: "none", label: "Nessuno", points: 0 },
          { value: "cardio", label: "Solo cardio", points: 2 },
          { value: "strength", label: "Solo forza / pesi", points: 3 },
          {
            value: "mixed",
            label: "Misto (forza + cardio + mobilità)",
            points: 5,
          },
        ],
      },
      {
        id: "training_strength_level",
        type: "choice",
        label:
          "Come valuteresti il tuo livello di forza generale rispetto al tuo peso corporeo?",
        options: [
          { value: "unknown", label: "Non saprei / non alleno la forza", points: 1 },
          { value: "beginner", label: "Principiante", points: 2 },
          { value: "intermediate", label: "Intermedio", points: 4 },
          { value: "advanced", label: "Avanzato", points: 5 },
        ],
      },
    ],
    extraFields: [
      { id: "training_bodyweight_kg", type: "number", label: "Peso corporeo", unit: "kg" },
      { id: "training_1rm_squat", type: "number", label: "Massimale squat", unit: "kg" },
      { id: "training_1rm_bench", type: "number", label: "Massimale panca piana", unit: "kg" },
      { id: "training_1rm_deadlift", type: "number", label: "Massimale stacco da terra", unit: "kg" },
    ],
  },
  {
    key: "nutrition",
    title: "Nutrizione e integrazione",
    description:
      "Abitudini alimentari, idratazione e uso consapevole di integratori.",
    maxScore: 20,
    questions: [
      {
        id: "nutrition_alcohol",
        type: "choice",
        label: "Quante volte a settimana consumi bevande alcoliche?",
        options: [
          { value: "never", label: "Mai", points: 4 },
          { value: "1-2", label: "1-2 volte", points: 3 },
          { value: "3-5", label: "3-5 volte", points: 1 },
          { value: "daily", label: "Tutti i giorni", points: 0 },
        ],
      },
      {
        id: "nutrition_fruit_veg",
        type: "choice",
        label: "Quante porzioni di frutta e verdura consumi al giorno?",
        options: [
          { value: "0-1", label: "0-1 porzioni", points: 0 },
          { value: "2-3", label: "2-3 porzioni", points: 2 },
          { value: "4-5", label: "4-5 porzioni", points: 3 },
          { value: "5+", label: "Più di 5 porzioni", points: 4 },
        ],
      },
      {
        id: "nutrition_protein",
        type: "choice",
        label:
          "Con che frequenza consumi una fonte proteica (animale o vegetale) ad ogni pasto principale?",
        options: [
          { value: "rarely", label: "Raramente / mai", points: 0 },
          { value: "sometimes", label: "Qualche volta", points: 2 },
          { value: "almost_always", label: "Quasi sempre", points: 3 },
          { value: "always", label: "Sempre", points: 4 },
        ],
      },
      {
        id: "nutrition_water",
        type: "choice",
        label: "Quanta acqua bevi mediamente al giorno?",
        options: [
          { value: "lt1", label: "Meno di 1 litro", points: 0 },
          { value: "1-1.5", label: "1 - 1,5 litri", points: 1 },
          { value: "1.5-2.5", label: "1,5 - 2,5 litri", points: 3 },
          { value: "gt2.5", label: "Più di 2,5 litri", points: 4 },
        ],
      },
      {
        id: "nutrition_supplements_awareness",
        type: "choice",
        label: "Se assumi integratori, sai perché li stai assumendo?",
        options: [
          { value: "none", label: "Non assumo integratori", points: 2 },
          { value: "no_idea", label: "Sì, ma non so bene il motivo", points: 1 },
          { value: "generic_advice", label: "Sì, su consiglio generico / sentito dire", points: 2 },
          {
            value: "targeted",
            label: "Sì, con indicazione mirata da un professionista",
            points: 4,
          },
        ],
      },
    ],
    extraFields: [
      {
        id: "nutrition_supplements_list",
        type: "text",
        label: "Quali integratori assumi e perché?",
        placeholder: "Es. vitamina D per carenza rilevata da esami, magnesio per il sonno...",
      },
    ],
  },
  {
    key: "sleep",
    title: "Sonno",
    description: "Durata, qualità e igiene del sonno.",
    maxScore: 20,
    questions: [
      {
        id: "sleep_hours",
        type: "choice",
        label: "Quante ore dormi mediamente per notte?",
        options: [
          { value: "lt5", label: "Meno di 5 ore", points: 1 },
          { value: "5-6", label: "5-6 ore", points: 3 },
          { value: "6-7", label: "6-7 ore", points: 4 },
          { value: "7-9", label: "7-9 ore", points: 5 },
          { value: "gt9", label: "Più di 9 ore", points: 4 },
        ],
      },
      {
        id: "sleep_restfulness",
        type: "choice",
        label: "Al risveglio ti senti riposato/a?",
        options: [
          { value: "never", label: "Mai", points: 0 },
          { value: "rarely", label: "Raramente", points: 1.5 },
          { value: "often", label: "Spesso", points: 3.5 },
          { value: "almost_always", label: "Quasi sempre", points: 5 },
        ],
      },
      {
        id: "sleep_awakenings",
        type: "choice",
        label: "Quanto spesso ti svegli durante la notte?",
        options: [
          { value: "every_night", label: "Tutte le notti", points: 0 },
          { value: "often", label: "Spesso", points: 2 },
          { value: "rarely", label: "Raramente", points: 4 },
          { value: "never", label: "Mai / quasi mai", points: 5 },
        ],
      },
      {
        id: "sleep_screens",
        type: "choice",
        label: "Usi schermi (telefono, TV, PC) nell'ora prima di dormire?",
        options: [
          { value: "always", label: "Sempre, a lungo", points: 0 },
          { value: "often", label: "Spesso", points: 2 },
          { value: "sometimes", label: "Qualche volta", points: 3.5 },
          { value: "rarely", label: "Mai / raramente", points: 5 },
        ],
      },
    ],
  },
  {
    key: "stress",
    title: "Gestione dello stress",
    description: "Stress percepito, energia, lucidità mentale e cura di sé.",
    maxScore: 20,
    questions: [
      {
        id: "stress_level",
        type: "choice",
        label: "Come valuteresti il tuo livello di stress percepito nell'ultimo mese?",
        options: [
          { value: "very_high", label: "Molto alto", points: 0 },
          { value: "high", label: "Alto", points: 2 },
          { value: "moderate", label: "Moderato", points: 3.5 },
          { value: "low", label: "Basso", points: 5 },
        ],
      },
      {
        id: "stress_self_care",
        type: "choice",
        label:
          "Quanto tempo dedichi a te stesso/a (hobby, relax, mindfulness) durante la settimana?",
        options: [
          { value: "none", label: "Nessuno", points: 0 },
          { value: "occasional", label: "Poco / occasionale", points: 2 },
          { value: "some_hours", label: "Alcune ore a settimana", points: 3.5 },
          { value: "daily", label: "Regolarmente, quasi ogni giorno", points: 5 },
        ],
      },
      {
        id: "stress_energy",
        type: "choice",
        label: "Come valuteresti il tuo livello di energia medio durante la giornata?",
        options: [
          { value: "very_low", label: "Molto basso", points: 0 },
          { value: "low", label: "Basso", points: 2 },
          { value: "good", label: "Buono", points: 3.5 },
          { value: "very_high", label: "Molto alto", points: 5 },
        ],
      },
      {
        id: "stress_clarity",
        type: "choice",
        label: "Come valuteresti la tua lucidità mentale e capacità di concentrazione?",
        options: [
          { value: "poor", label: "Scarsa", points: 0 },
          { value: "sufficient", label: "Sufficiente", points: 2 },
          { value: "good", label: "Buona", points: 3.5 },
          { value: "excellent", label: "Ottima", points: 5 },
        ],
      },
    ],
  },
  {
    key: "prevention",
    title: "Prevenzione",
    description: "Controlli medici, esami e conoscenza dei propri parametri.",
    maxScore: 20,
    questions: [
      {
        id: "prevention_bloodwork",
        type: "choice",
        label: "Quando hai fatto l'ultimo controllo con esami del sangue completi?",
        options: [
          { value: "never", label: "Mai / non ricordo", points: 0 },
          { value: "gt2y", label: "Più di 2 anni fa", points: 1.5 },
          { value: "1-2y", label: "1-2 anni fa", points: 3 },
          { value: "lt1y", label: "Nell'ultimo anno", points: 5 },
        ],
      },
      {
        id: "prevention_cardio_check",
        type: "choice",
        label: "Hai mai effettuato una visita cardiologica con ECG?",
        options: [
          { value: "never", label: "No, mai", points: 0 },
          { value: "gt3y", label: "Sì, più di 3 anni fa", points: 2 },
          { value: "1-3y", label: "Sì, negli ultimi 1-3 anni", points: 3.5 },
          { value: "lt1y", label: "Sì, nell'ultimo anno", points: 5 },
        ],
      },
      {
        id: "prevention_vo2max",
        type: "choice",
        label:
          "Conosci il tuo VO2 max o hai mai effettuato un test della capacità aerobica?",
        options: [
          { value: "no", label: "No, non lo conosco", points: 0 },
          { value: "heard", label: "Ne ho sentito parlare, non l'ho mai misurato", points: 1.5 },
          { value: "estimated", label: "Sì, stimato (smartwatch / test indiretto)", points: 3.5 },
          { value: "measured", label: "Sì, misurato con test specifico", points: 5 },
        ],
      },
      {
        id: "prevention_screenings",
        type: "choice",
        label:
          "Effettui controlli di prevenzione specifici per età/sesso/familiarità (screening oncologici, densitometria ossea, ecc.)?",
        options: [
          { value: "never", label: "Mai", points: 0 },
          { value: "on_symptoms", label: "Solo se necessario / su sintomi", points: 2 },
          { value: "occasionally", label: "Occasionalmente", points: 3.5 },
          { value: "regularly", label: "Regolarmente, secondo le linee guida", points: 5 },
        ],
      },
    ],
    extraFields: [
      {
        id: "prevention_last_exams_notes",
        type: "text",
        label: "Ultimi esami/test effettuati (facoltativo)",
        placeholder: "Es. emocromo e pannello lipidico a marzo 2026, ecografia addome nel 2024...",
      },
    ],
  },
];

export function categoryMaxRawPoints(category: Category): number {
  return category.questions.reduce(
    (sum, q) => sum + Math.max(...q.options.map((o) => o.points)),
    0,
  );
}
