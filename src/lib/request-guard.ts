import { NextRequest, NextResponse } from "next/server";

type RateBucket = { timestamps: number[] };

const RATE_LIMIT_STORE = new Map<string, RateBucket>();

function pruneOld(timestamps: number[], nowMs: number, windowMs: number) {
  return timestamps.filter((ts) => nowMs - ts < windowMs);
}

export function getClientIp(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first;
  }
  const real = request.headers.get("x-real-ip")?.trim();
  if (real) return real;
  return "unknown";
}

export function checkHoneypot(value: unknown) {
  return typeof value === "string" && value.trim().length > 0;
}

export function checkRateLimit(key: string, maxRequests: number, windowMs: number) {
  const nowMs = Date.now();
  const bucket = RATE_LIMIT_STORE.get(key) ?? { timestamps: [] };
  bucket.timestamps = pruneOld(bucket.timestamps, nowMs, windowMs);

  if (bucket.timestamps.length >= maxRequests) {
    const oldest = bucket.timestamps[0];
    const retryAfterMs = Math.max(0, windowMs - (nowMs - oldest));
    RATE_LIMIT_STORE.set(key, bucket);
    return { ok: false, retryAfterSeconds: Math.ceil(retryAfterMs / 1000) };
  }

  bucket.timestamps.push(nowMs);
  RATE_LIMIT_STORE.set(key, bucket);
  return { ok: true, retryAfterSeconds: 0 };
}

export function rateLimitResponse(retryAfterSeconds: number) {
  return NextResponse.json(
    { error: "Too many attempts. Please wait a minute and try again." },
    { status: 429, headers: { "Retry-After": String(Math.max(1, retryAfterSeconds)) } }
  );
}
