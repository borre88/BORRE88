import "server-only";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/database.types";

/**
 * Uses the service_role secret key: bypasses Row Level Security entirely.
 * Only ever import this from server-side code (Server Actions), and only
 * to perform actions a trainer is explicitly authorized to do (e.g.
 * creating a client's login account). Never expose this client or its key
 * to the browser.
 */
export function createAdminClient() {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}
