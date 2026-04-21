import { createClient, SupabaseClient } from "@supabase/supabase-js";

/**
 * Anon Supabase client for server routes that call insert_registry_intent (SECURITY DEFINER RPC).
 * Inserts use RPC, not direct table INSERT, so RLS on registry_intents does not apply.
 */
export function supabaseForRegistryWrite(): SupabaseClient {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } }
  );
}
