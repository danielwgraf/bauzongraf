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

function encodeQueryValue(value: string) {
  // encodeURIComponent keeps spaces as %20 instead of '+'
  // which Venmo displays more reliably in notes.
  return encodeURIComponent(value);
}

function buildQueryString(params: Record<string, string | undefined>) {
  const entries = Object.entries(params).filter(([, v]) => typeof v === "string" && v.length > 0);
  return entries.map(([k, v]) => `${encodeQueryValue(k)}=${encodeQueryValue(v!)}`).join("&");
}

function venmoHandleFromProfileUrl(profileUrl: string) {
  try {
    const u = new URL(profileUrl);
    const parts = u.pathname.split("/").filter(Boolean);
    // Supports venmo.com/u/<handle> and venmo.com/<handle>
    if (parts[0] === "u" && parts[1]) return parts[1];
    if (parts[0]) return parts[0];
  } catch {
    // ignore malformed URL; caller will fall back to web URL
  }
  return "";
}

/**
 * Prefill amount + note on the recipient profile URL.
 * Venmo commonly supports: ?txn=pay&amount=12.34&note=...
 */
export function buildVenmoPayUrl(profileUrl: string, amountUsd: number, note: string) {
  const u = new URL(profileUrl);
  const trimmed = note.trim().slice(0, 200);
  const query = buildQueryString({
    txn: "pay",
    amount: amountUsd.toFixed(2),
    note: trimmed || undefined,
  });
  u.search = query;
  return u.toString();
}

/**
 * Mobile app deep link + web fallback URL for Venmo.
 */
export function buildVenmoPaymentUrls(profileUrl: string, amountUsd: number, note: string) {
  const webUrl = buildVenmoPayUrl(profileUrl, amountUsd, note);
  const handle = venmoHandleFromProfileUrl(profileUrl);
  if (!handle) return { appUrl: webUrl, webUrl };

  const trimmed = note.trim().slice(0, 200);
  const appQuery = buildQueryString({
    txn: "pay",
    recipients: handle,
    amount: amountUsd.toFixed(2),
    note: trimmed || undefined,
  });
  const appUrl = `venmo://paycharge?${appQuery}`;
  return { appUrl, webUrl };
}
