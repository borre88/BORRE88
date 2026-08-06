import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "@/lib/database.types";

export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    // The recovery/password-setup page parses the URL itself (see
    // src/app/imposta-password/page.tsx) to avoid a race with the SDK's
    // own async auto-detection, which can miss the PASSWORD_RECOVERY event.
    { auth: { detectSessionInUrl: false } }
  );
}
