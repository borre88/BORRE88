import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getAnthropicClient, DIET_REVIEW_MODEL } from "@/lib/anthropic";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const session = await getSession();
  if (!session || session.profile.role !== "trainer") {
    return NextResponse.json({ error: "Non autorizzato." }, { status: 401 });
  }

  const anthropic = getAnthropicClient();
  if (!anthropic) {
    return NextResponse.json(
      { error: "Assistente AI non configurato: manca ANTHROPIC_API_KEY nelle variabili d'ambiente." },
      { status: 503 }
    );
  }

  const body = await request.json().catch(() => null);
  const planName = (body?.planName as string | undefined) ?? "il piano";
  const phase = body?.phase as string | null | undefined;
  const targetKcal = body?.targetKcal as number | null | undefined;
  const targetProtein = body?.targetProtein as number | null | undefined;
  const targetCarbs = body?.targetCarbs as number | null | undefined;
  const targetFat = body?.targetFat as number | null | undefined;
  const supplementNames = (body?.supplementNames as string[] | undefined) ?? [];

  const prompt = `Sei un assistente che aiuta un biologo nutrizionista a scrivere rapidamente note e indicazioni pratiche per un piano alimentare, da mostrare al cliente. Scrivi in italiano, tono professionale ma diretto e colloquiale, senza titoli o elenchi puntati: 2-4 frasi scorrevoli.

PIANO: "${planName}"
Fase: ${phase ?? "non specificata"}
Target: ${targetKcal ?? "-"} kcal, P ${targetProtein ?? "-"}g, C ${targetCarbs ?? "-"}g, G ${targetFat ?? "-"}g
Integratori già consigliati nel piano: ${supplementNames.length > 0 ? supplementNames.join(", ") : "nessuno"}

Suggerisci anche un target di idratazione giornaliera in ml (in genere 2000-3500 ml a seconda del target calorico e della fase), oppure null se preferisci lasciare lo standard dell'app (2000 ml).

Rispondi SOLO con un oggetto JSON valido, senza testo prima o dopo, con esattamente questa forma:
{"hydration_ml": <numero o null>, "notes": "<testo delle note>"}`;

  try {
    const response = await anthropic.messages.create({
      model: DIET_REVIEW_MODEL,
      max_tokens: 500,
      messages: [{ role: "user", content: prompt }],
    });

    const text = response.content.map((block) => (block.type === "text" ? block.text : "")).join("");
    const match = text.match(/\{[\s\S]*\}/);
    if (!match) return NextResponse.json({ error: "Risposta dell'assistente non valida." }, { status: 502 });

    const parsed = JSON.parse(match[0]) as { hydration_ml: number | null; notes: string };
    return NextResponse.json(parsed);
  } catch {
    return NextResponse.json({ error: "L'assistente AI non è riuscito a rispondere. Riprova tra poco." }, { status: 502 });
  }
}
