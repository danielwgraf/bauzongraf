import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { insertRegistryIntent } from "@/lib/registry-intent-insert";
import { checkHoneypot, checkRateLimit, getClientIp, rateLimitResponse } from "@/lib/request-guard";

export async function POST(request: NextRequest) {
  const secretKey = process.env.STRIPE_SECRET_KEY;

  if (!secretKey) {
    return NextResponse.json(
      {
        error: "Card checkout is not configured yet. Add STRIPE_SECRET_KEY to the server environment.",
      },
      { status: 503 }
    );
  }

  const stripe = new Stripe(secretKey);

  const stripeProductByFund: Record<string, string | undefined> = {
    honeymoon: process.env.STRIPE_PRODUCT_HONEYMOON,
    dogs: process.env.STRIPE_PRODUCT_DOGS,
    donation: process.env.STRIPE_PRODUCT_DONATION,
    castle: process.env.STRIPE_PRODUCT_CASTLE,
  };

  const origin =
    request.headers.get("origin") ??
    process.env.NEXT_PUBLIC_BASE_URL ??
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null) ??
    "http://localhost:3000";

  try {
    const body = (await request.json().catch(() => ({}))) as {
      fund?: string;
      amount?: number | string;
      coverStripeFees?: boolean;
      note?: string;
      website?: string;
    };

    if (checkHoneypot(body.website)) {
      return NextResponse.json({ error: "Invalid request." }, { status: 400 });
    }

    const ip = getClientIp(request);
    const limit = checkRateLimit(`checkout:${ip}`, 6, 60_000);
    if (!limit.ok) {
      return rateLimitResponse(limit.retryAfterSeconds);
    }

    const fund = body.fund;
    const amountRaw = body.amount;
    const coverStripeFees = Boolean(body.coverStripeFees);
    const noteRaw = typeof body.note === "string" ? body.note.trim().slice(0, 2000) : "";

    if (
      !fund ||
      !["honeymoon", "dogs", "donation", "castle"].includes(fund) ||
      amountRaw === undefined
    ) {
      return NextResponse.json({ error: "Missing checkout info (fund and amount)." }, { status: 400 });
    }

    const amountNum = typeof amountRaw === "string" ? Number(amountRaw) : amountRaw;
    if (!Number.isFinite(amountNum) || amountNum <= 0) {
      return NextResponse.json({ error: "Amount must be a positive number." }, { status: 400 });
    }

    // Stripe expects integer cents for unit_amount
    const amountCents = Math.round(amountNum * 100);
    if (amountCents < 50) {
      return NextResponse.json({ error: "Minimum amount is $0.50." }, { status: 400 });
    }

    const productId = stripeProductByFund[fund];
    if (!productId) {
      return NextResponse.json(
        { error: `Stripe product for fund '${fund}' is not configured.` },
        { status: 503 }
      );
    }

    // Optional: estimate processing fees so the recipient gets the full “amount”.
    // This is an approximation based on typical card processing fees.
    const feePercentRaw = Number(process.env.STRIPE_FEE_PERCENT ?? "0.029"); // 2.9%
    const feeFixedCentsRaw = Number(process.env.STRIPE_FEE_FIXED_CENTS ?? "30"); // $0.30
    const feePercent = Number.isFinite(feePercentRaw) ? feePercentRaw : 0.029;
    const feeFixedCents = Number.isFinite(feeFixedCentsRaw) ? feeFixedCentsRaw : 30;
    const safeFeePercent = feePercent > 0 && feePercent < 0.2 ? feePercent : 0.029; // sanity guard

    const chargedAmountCents = coverStripeFees
      ? Math.ceil((amountCents + feeFixedCents) / (1 - safeFeePercent))
      : amountCents;

    if (chargedAmountCents < 50) {
      return NextResponse.json({ error: "Amount after fees is below the $0.50 minimum." }, { status: 400 });
    }

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: "usd",
            unit_amount: chargedAmountCents,
            product: productId,
          },
        },
      ],
      metadata: {
        fund,
        amountUsd: amountNum.toFixed(2),
        coverStripeFees: coverStripeFees ? "true" : "false",
        chargedAmountUsd: (chargedAmountCents / 100).toFixed(2),
        ...(noteRaw ? { guestNote: noteRaw.slice(0, 400) } : {}),
      },
      success_url: `${origin}/?tab=registry&checkout=success`,
      cancel_url: `${origin}/?tab=registry&checkout=cancel`,
    });

    if (!session.url) {
      return NextResponse.json({ error: "Could not start checkout." }, { status: 500 });
    }

    const { error: registryLogError } = await insertRegistryIntent({
      fund,
      amount_usd: amountNum,
      charged_amount_usd: chargedAmountCents / 100,
      cover_stripe_fees: coverStripeFees,
      note: noteRaw || null,
      payment_channel: "stripe",
      venmo_recipient: null,
      stripe_checkout_session_id: session.id,
      status: "checkout_created",
    });
    if (registryLogError) {
      console.error("registry_intents insert (stripe):", registryLogError);
    }

    return NextResponse.json({ url: session.url });
  } catch (e) {
    console.error("Stripe checkout error:", e);
    return NextResponse.json({ error: "Checkout failed. Please try again later." }, { status: 500 });
  }
}
