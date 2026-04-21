import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { insertRegistryIntent } from "@/lib/registry-intent-insert";
import { checkHoneypot, checkRateLimit, getClientIp, rateLimitResponse } from "@/lib/request-guard";

const supabaseWithUser = (accessToken: string) =>
  createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    global: {
      headers: { Authorization: `Bearer ${accessToken}` },
    },
  });

/** Logged-in admin: list gift intents */
export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7).trim() : null;
  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = supabaseWithUser(token);
  const {
    data: { user },
    error: userErr,
  } = await supabase.auth.getUser();
  if (userErr || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data, error } = await supabase
    .from("registry_intents")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data: data ?? [] });
}

/** Public: record a Venmo intent before opening Venmo */
export async function POST(request: NextRequest) {
  const body = (await request.json().catch(() => ({}))) as {
    fund?: string;
    amountUsd?: number | string;
    note?: string;
    paymentChannel?: string;
    venmoRecipient?: string;
    coverStripeFees?: boolean;
    website?: string;
  };

  if (checkHoneypot(body.website)) {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const ip = getClientIp(request);
  const limit = checkRateLimit(`registry-intents:${ip}`, 8, 60_000);
  if (!limit.ok) {
    return rateLimitResponse(limit.retryAfterSeconds);
  }

  const fund = body.fund;
  const amountRaw = body.amountUsd;
  const paymentChannel = body.paymentChannel;
  const venmoRecipient = body.venmoRecipient?.trim() || null;
  const note = typeof body.note === "string" ? body.note.trim().slice(0, 2000) : "";
  const coverStripeFees = Boolean(body.coverStripeFees);

  if (!fund || !["honeymoon", "dog", "donation", "castle"].includes(fund)) {
    return NextResponse.json({ error: "Invalid fund." }, { status: 400 });
  }
  if (paymentChannel !== "venmo") {
    return NextResponse.json({ error: "Use Stripe checkout for card payments." }, { status: 400 });
  }
  const amountNum = typeof amountRaw === "string" ? Number(amountRaw) : amountRaw;
  if (amountNum === undefined || !Number.isFinite(amountNum) || amountNum < 0.5) {
    return NextResponse.json({ error: "Amount must be at least $0.50." }, { status: 400 });
  }
  if (!venmoRecipient || !["macy", "daniel"].includes(venmoRecipient)) {
    return NextResponse.json({ error: "Invalid Venmo recipient." }, { status: 400 });
  }

  const { data, error } = await insertRegistryIntent({
    fund,
    amount_usd: amountNum,
    charged_amount_usd: amountNum,
    cover_stripe_fees: coverStripeFees,
    note: note || null,
    payment_channel: "venmo",
    venmo_recipient: venmoRecipient,
    stripe_checkout_session_id: null,
    status: "venmo_opened",
  });

  if (error) {
    console.error("registry_intents insert:", error);
    return NextResponse.json(
      {
        error:
          "Could not save gift details. Run the SQL in sql/registry_intents.sql in Supabase (includes insert_registry_intent RPC).",
      },
      { status: 500 }
    );
  }

  return NextResponse.json({ id: data });
}
