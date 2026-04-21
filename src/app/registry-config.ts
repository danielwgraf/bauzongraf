/**
 * Public env vars only (safe for the browser). Set in `.env.local`:
 *
 * NEXT_PUBLIC_VENMO_MACY=https://venmo.com/u/YourMacyHandle
 * NEXT_PUBLIC_VENMO_DANIEL=https://venmo.com/u/YourDanielHandle
 */

export type VenmoRecipientId = "macy" | "daniel";

export type VenmoLink = { id: VenmoRecipientId; label: string; href: string };

export function getVenmoLinks(): VenmoLink[] {
  const macy = process.env.NEXT_PUBLIC_VENMO_MACY?.trim();
  const daniel = process.env.NEXT_PUBLIC_VENMO_DANIEL?.trim();
  const out: VenmoLink[] = [];
  if (macy) out.push({ id: "macy", label: "Venmo — Macy", href: macy });
  if (daniel) out.push({ id: "daniel", label: "Venmo — Daniel", href: daniel });
  return out;
}

/**
 * Prefill amount + note on the recipient profile URL.
 * Venmo commonly supports: ?txn=pay&amount=12.34&note=...
 */
export function buildVenmoPayUrl(profileUrl: string, amountUsd: number, note: string) {
  const u = new URL(profileUrl);
  u.searchParams.set("txn", "pay");
  u.searchParams.set("amount", amountUsd.toFixed(2));
  const trimmed = note.trim().slice(0, 200);
  if (trimmed) u.searchParams.set("note", trimmed);
  return u.toString();
}
