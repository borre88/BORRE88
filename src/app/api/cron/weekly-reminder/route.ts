import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendWeeklyCheckinReminder } from "@/lib/email";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const admin = createAdminClient();
  const { data: clients, error } = await admin
    .from("clients")
    .select("full_name, email, profile_id")
    .not("profile_id", "is", null);

  if (error) {
    return NextResponse.json({ error: "Impossibile leggere i clienti" }, { status: 500 });
  }

  let sent = 0;
  let skipped = 0;
  const failed: string[] = [];

  for (const client of clients ?? []) {
    if (!client.email) {
      skipped++;
      continue;
    }
    try {
      const result = await sendWeeklyCheckinReminder(client.email, client.full_name);
      if (result && "skipped" in result) skipped++;
      else sent++;
    } catch {
      failed.push(client.email);
    }
  }

  return NextResponse.json({ sent, skipped, failed });
}
