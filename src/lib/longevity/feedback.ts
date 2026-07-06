import { CATEGORIES, type CategoryKey } from "./questions";
import type { LongevityScores } from "./scoring";

export type Tier = "critical" | "improve" | "good" | "excellent";

const TIER_LABELS: Record<Tier, string> = {
  critical: "Area critica",
  improve: "Da migliorare",
  good: "Buono",
  excellent: "Ottimo",
};

export function tierForCategoryScore(score: number): Tier {
  if (score <= 8) return "critical";
  if (score <= 13) return "improve";
  if (score <= 17) return "good";
  return "excellent";
}

export function tierForTotalScore(total: number): Tier {
  if (total <= 40) return "critical";
  if (total <= 60) return "improve";
  if (total <= 80) return "good";
  return "excellent";
}

export function tierLabel(tier: Tier): string {
  return TIER_LABELS[tier];
}

const CATEGORY_ADVICE: Record<CategoryKey, Record<Tier, string>> = {
  training: {
    critical:
      "L'attività fisica è quasi assente: inizia con 2 sedute a settimana di attività moderata (camminata veloce, forza a corpo libero) per costruire l'abitudine.",
    improve:
      "Ci sono le basi, ma serve più costanza o varietà: prova ad aggiungere una seduta di forza a settimana e a mantenerla nel tempo.",
    good:
      "Un buon livello di attività fisica: per progredire ulteriormente, lavora su forza e mobilità in modo più strutturato.",
    excellent:
      "Livello di allenamento eccellente: mantieni la costanza e monitora periodicamente i progressi su forza e capacità aerobica.",
  },
  nutrition: {
    critical:
      "L'alimentazione richiede attenzione immediata: aumenta il consumo di frutta e verdura, l'idratazione e riduci gli alcolici.",
    improve:
      "Ci sono margini di miglioramento: cura la distribuzione delle proteine nei pasti e verifica con il tuo nutrizionista l'eventuale utilità degli integratori che assumi.",
    good:
      "Buone abitudini alimentari: continua così, prestando attenzione a idratazione e varietà di frutta e verdura.",
    excellent:
      "Alimentazione e integrazione ben gestite: mantieni le abitudini attuali e rivedile periodicamente con il tuo nutrizionista.",
  },
  sleep: {
    critical:
      "Il sonno è un'area critica: prova a fissare un orario regolare per andare a letto e a ridurre l'uso di schermi nell'ora precedente.",
    improve:
      "La qualità del sonno è migliorabile: valuta di ridurre gli stimoli serali (schermi, caffeina) e di mantenere orari regolari.",
    good:
      "Il sonno è generalmente buono: mantieni le abitudini attuali di igiene del sonno.",
    excellent:
      "Ottima qualità del sonno: continua a proteggere questa routine, è una delle basi della longevità.",
  },
  stress: {
    critical:
      "Il livello di stress percepito è alto e l'energia/lucidità ne risentono: introduci momenti quotidiani di recupero (respirazione, breve camminata, pause reali).",
    improve:
      "Lo stress è gestito solo in parte: prova a ritagliarti con regolarità del tempo per te stesso/a, anche poche decine di minuti al giorno.",
    good:
      "Buona gestione dello stress: mantieni gli spazi di recupero che già ti ritagli.",
    excellent:
      "Ottima gestione dello stress, energia e lucidità mentale: continua con le strategie che già utilizzi.",
  },
  prevention: {
    critical:
      "La prevenzione è trascurata: pianifica al più presto un pannello di esami del sangue completo e una visita di controllo generale.",
    improve:
      "Alcuni controlli mancano o non sono recenti: programma gli esami e le visite di screening indicati per la tua età e la tua storia familiare.",
    good:
      "Un buon livello di prevenzione: mantieni la cadenza attuale dei controlli.",
    excellent:
      "Ottimo livello di prevenzione e conoscenza dei propri parametri: continua con i controlli periodici.",
  },
};

const TOTAL_SUMMARY: Record<Tier, string> = {
  critical:
    "Il punteggio complessivo segnala diverse aree che meritano attenzione immediata. Meglio concentrarsi su un paio di priorità alla volta invece di cambiare tutto insieme.",
  improve:
    "Ci sono buone basi ma anche margini di miglioramento concreti: lavorando sulle aree più deboli il punteggio complessivo può salire in modo significativo.",
  good:
    "Il profilo di longevity è complessivamente buono: con qualche accorgimento mirato sulle aree più deboli si può puntare a un livello eccellente.",
  excellent:
    "Il profilo di longevity è eccellente in quasi tutte le aree: l'obiettivo ora è mantenere la costanza nel tempo.",
};

export type CategoryFeedback = {
  key: CategoryKey;
  title: string;
  score: number;
  maxScore: number;
  tier: Tier;
  tierLabel: string;
  advice: string;
};

export type AssessmentFeedback = {
  categories: CategoryFeedback[];
  total: number;
  totalTier: Tier;
  totalTierLabel: string;
  summary: string;
  focusAreas: CategoryFeedback[];
};

export function buildFeedback(scores: LongevityScores): AssessmentFeedback {
  const categories: CategoryFeedback[] = CATEGORIES.map((category) => {
    const score = scores[category.key];
    const tier = tierForCategoryScore(score);
    return {
      key: category.key,
      title: category.title,
      score,
      maxScore: category.maxScore,
      tier,
      tierLabel: tierLabel(tier),
      advice: CATEGORY_ADVICE[category.key][tier],
    };
  });

  const totalTier = tierForTotalScore(scores.total);
  const focusAreas = [...categories]
    .sort((a, b) => a.score - b.score)
    .filter((c) => c.tier === "critical" || c.tier === "improve")
    .slice(0, 2);

  return {
    categories,
    total: scores.total,
    totalTier,
    totalTierLabel: tierLabel(totalTier),
    summary: TOTAL_SUMMARY[totalTier],
    focusAreas,
  };
}
