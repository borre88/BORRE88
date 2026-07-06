"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { CATEGORIES } from "@/lib/longevity/questions";
import { computeScores, findUnansweredQuestions, type Answers } from "@/lib/longevity/scoring";

export type AssessmentFormState = {
  error?: string;
};

function readAnswers(formData: FormData): Answers {
  const answers: Answers = {};
  for (const category of CATEGORIES) {
    for (const question of category.questions) {
      const value = formData.get(question.id);
      if (typeof value === "string" && value) answers[question.id] = value;
    }
    for (const field of category.extraFields ?? []) {
      const value = formData.get(field.id);
      if (typeof value !== "string" || !value.trim()) continue;
      answers[field.id] = field.type === "number" ? Number(value) : value.trim();
    }
  }
  return answers;
}

export async function createAssessmentAction(
  _prevState: AssessmentFormState,
  formData: FormData,
): Promise<AssessmentFormState> {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "Sessione scaduta, effettua di nuovo l'accesso." };
  }

  const answers = readAnswers(formData);
  const missing = findUnansweredQuestions(answers);
  if (missing.length > 0) {
    return { error: `Rispondi a tutte le domande prima di inviare (mancano ${missing.length}).` };
  }

  const scores = computeScores(answers);

  await prisma.longevityAssessment.create({
    data: {
      userId: session.user.id,
      answersJson: JSON.stringify(answers),
      trainingScore: scores.training,
      nutritionScore: scores.nutrition,
      sleepScore: scores.sleep,
      stressScore: scores.stress,
      preventionScore: scores.prevention,
      totalScore: scores.total,
    },
  });

  revalidatePath("/dashboard/longevity");
  revalidatePath("/admin/longevity");
  redirect("/dashboard/longevity");
}
