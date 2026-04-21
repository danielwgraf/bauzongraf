import { supabaseForRegistryWrite } from "@/lib/supabase-registry-write";

export type RegistryIntentRow = {
  fund: string;
  amount_usd: number;
  charged_amount_usd: number;
  cover_stripe_fees: boolean;
  note: string | null;
  payment_channel: "venmo" | "stripe";
  venmo_recipient: string | null;
  stripe_checkout_session_id: string | null;
  status: string;
};

/**
 * Inserts via public.insert_registry_intent (SECURITY DEFINER) so RLS does not block anon callers.
 * Requires sql/registry_intents.sql (RPC + grants) applied in Supabase.
 */
export async function insertRegistryIntent(row: RegistryIntentRow) {
  const supabase = supabaseForRegistryWrite();
  return supabase.rpc("insert_registry_intent", {
    p_fund: row.fund,
    p_amount_usd: row.amount_usd,
    p_charged_amount_usd: row.charged_amount_usd,
    p_cover_stripe_fees: row.cover_stripe_fees,
    p_note: row.note,
    p_payment_channel: row.payment_channel,
    p_venmo_recipient: row.venmo_recipient,
    p_stripe_checkout_session_id: row.stripe_checkout_session_id,
    p_status: row.status,
  });
}
