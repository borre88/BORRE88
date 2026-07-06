import { CATEGORIES, categoryMaxRawPoints, type Category, type CategoryKey } from "./questions";

export type AnswerValue = string | number | undefined;
export type Answers = Record<string, AnswerValue>;

export type CategoryScores = Record<CategoryKey, number>;

export type LongevityScores = CategoryScores & { total: number };

function scoreCategory(category: Category, answers: Answers): number {
  const rawTotal = category.questions.reduce((sum, question) => {
    const selected = answers[question.id];
    const option = question.options.find((o) => o.value === selected);
    return sum + (option?.points ?? 0);
  }, 0);

  const maxRaw = categoryMaxRawPoints(category);
  const normalized = maxRaw > 0 ? (rawTotal / maxRaw) * category.maxScore : 0;

  return Math.min(category.maxScore, Math.max(1, Math.round(normalized)));
}

export function computeScores(answers: Answers): LongevityScores {
  const scores = {} as CategoryScores;
  for (const category of CATEGORIES) {
    scores[category.key] = scoreCategory(category, answers);
  }
  const total = CATEGORIES.reduce((sum, category) => sum + scores[category.key], 0);
  return { ...scores, total };
}

export function findUnansweredQuestions(answers: Answers): string[] {
  const missing: string[] = [];
  for (const category of CATEGORIES) {
    for (const question of category.questions) {
      if (!answers[question.id]) missing.push(question.label);
    }
  }
  return missing;
}
