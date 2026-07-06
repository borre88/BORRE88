import { CATEGORIES } from "./questions";
import type { Answers } from "./scoring";

export type AnsweredQuestion = { category: string; label: string; answer: string };
export type AnsweredExtra = { category: string; label: string; value: string };

// Turns the raw stored answers back into human-readable rows, for the
// nutritionist's detail view (admin side).
export function describeAnswers(answers: Answers): {
  questions: AnsweredQuestion[];
  extras: AnsweredExtra[];
} {
  const questions: AnsweredQuestion[] = [];
  const extras: AnsweredExtra[] = [];

  for (const category of CATEGORIES) {
    for (const question of category.questions) {
      const value = answers[question.id];
      const option = question.options.find((o) => o.value === value);
      questions.push({
        category: category.title,
        label: question.label,
        answer: option?.label ?? "—",
      });
    }

    for (const field of category.extraFields ?? []) {
      const value = answers[field.id];
      if (value === undefined || value === "") continue;
      const formatted =
        field.type === "number" ? `${value}${field.unit ? ` ${field.unit}` : ""}` : String(value);
      extras.push({ category: category.title, label: field.label, value: formatted });
    }
  }

  return { questions, extras };
}
