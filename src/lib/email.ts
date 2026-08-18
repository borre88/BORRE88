import "server-only";
import { Resend } from "resend";

const FROM_ADDRESS = process.env.EMAIL_FROM || "Nutrition & Performance <onboarding@resend.dev>";

function getResend() {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return null;
  return new Resend(apiKey);
}

export async function sendWeeklyCheckinReminder(to: string, clientName: string) {
  const resend = getResend();
  if (!resend) return { skipped: true as const };

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

  return resend.emails.send({
    from: FROM_ADDRESS,
    to,
    subject: "Il tuo check settimanale — Nutrition & Performance",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto;">
        <p>Ciao ${clientName || ""},</p>
        <p>È il momento del tuo check settimanale: bastano un paio di minuti per registrare peso, allenamenti fatti, ore di sonno, stress, stanchezza, energia e come è andata l'alimentazione questa settimana.</p>
        <p>
          <a href="${siteUrl}/cliente/valutazione/check-in" style="display:inline-block;background:#0E5C53;color:#fff;padding:10px 18px;border-radius:8px;text-decoration:none;">
            Compila il check
          </a>
        </p>
        <p style="color:#8A9490;font-size:12px;">Nutrition &amp; Performance — Dott. Borrelli Simone</p>
      </div>
    `,
  });
}

export async function sendWorkoutAssignedEmail(
  to: string,
  clientName: string,
  workoutName: string,
  dateIso: string
) {
  const resend = getResend();
  if (!resend) return { skipped: true as const };

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const dateLabel = new Date(dateIso + "T00:00:00").toLocaleDateString("it-IT", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  return resend.emails.send({
    from: FROM_ADDRESS,
    to,
    subject: "Nuovo allenamento nel tuo calendario — Nutrition & Performance",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto;">
        <p>Ciao ${clientName || ""},</p>
        <p>Il tuo trainer ha appena caricato un nuovo allenamento — <strong>${workoutName}</strong> — per ${dateLabel}.</p>
        <p>
          <a href="${siteUrl}/cliente/allenamenti" style="display:inline-block;background:#0E5C53;color:#fff;padding:10px 18px;border-radius:8px;text-decoration:none;">
            Apri il calendario
          </a>
        </p>
        <p style="color:#8A9490;font-size:12px;">Nutrition &amp; Performance — Dott. Borrelli Simone</p>
      </div>
    `,
  });
}
