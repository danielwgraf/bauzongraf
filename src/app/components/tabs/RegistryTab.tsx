"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { buildVenmoPaymentUrls, getVenmoLinks, type VenmoLink } from "../../registry-config";
import {
  REGISTRY_FUNDS,
  type RegistryFundId,
  registryFundLabel,
} from "../../registry-funds";

const STRIPE_FEE_PERCENT_ESTIMATE = 0.029; // 2.9%
const STRIPE_FEE_FIXED_USD_ESTIMATE = 0.3; // $0.30

function formatUsd(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

function stripAmountDecorators(raw: string) {
  return raw.replace(/[$,\s]/g, "");
}

/** Allow typing digits and a single decimal point. */
function sanitizeAmountTyping(raw: string) {
  let v = stripAmountDecorators(raw).replace(/[^0-9.]/g, "");
  const firstDot = v.indexOf(".");
  if (firstDot !== -1) {
    v = v.slice(0, firstDot + 1) + v.slice(firstDot + 1).replace(/\./g, "");
  }
  return v;
}

function venmoNoteForUrl(fund: RegistryFundId, giverName: string, guestNote: string) {
  const label = registryFundLabel(fund);
  const base = `Wedding gift — ${label}`;
  const from = giverName.trim() ? ` from ${giverName.trim()}` : "";
  const extra = guestNote.trim();
  const combined = extra ? `${base}${from}. ${extra}` : `${base}${from}`;
  return combined.slice(0, 200);
}

export default function RegistryTab() {
  const t = useTranslations("Registry");
  const searchParams = useSearchParams();
  const checkoutFlag = searchParams.get("checkout");
  const [step, setStep] = useState<1 | 2>(1);
  const [method, setMethod] = useState<"venmo" | "card">("venmo");
  const [stripeLoading, setStripeLoading] = useState(false);
  const [stripeError, setStripeError] = useState("");
  const [venmoError, setVenmoError] = useState("");
  const [venmoSaving, setVenmoSaving] = useState(false);

  const venmoLinks = useMemo(() => getVenmoLinks(), []);
  const [fund, setFund] = useState<RegistryFundId>("honeymoon");
  const selectedFund = useMemo(() => REGISTRY_FUNDS.find((f) => f.id === fund), [fund]);
  const [amount, setAmount] = useState<string>("");
  const [giverName, setGiverName] = useState("");
  const [guestNote, setGuestNote] = useState("");
  const [coverStripeFees, setCoverStripeFees] = useState(false);
  const [website, setWebsite] = useState("");

  const amountNum = Number(stripAmountDecorators(amount));
  const amountIsValid = Number.isFinite(amountNum) && amountNum >= 0.5;
  const baseAmount = amountIsValid ? amountNum : 0;
  const estimatedCharge = coverStripeFees
    ? (baseAmount + STRIPE_FEE_FIXED_USD_ESTIMATE) / (1 - STRIPE_FEE_PERCENT_ESTIMATE)
    : baseAmount;
  const estimatedFee = Math.max(0, estimatedCharge - baseAmount);
  const giverNameTrimmed = giverName.trim();
  const canContinue = amountIsValid && giverNameTrimmed.length > 0;

  const openVenmo = async (link: VenmoLink) => {
    setVenmoError("");
    if (!giverNameTrimmed) {
      setVenmoError(t("errorNameVenmo"));
      return;
    }
    if (!amountIsValid) {
      setVenmoError(t("errorAmountVenmo"));
      return;
    }
    setVenmoSaving(true);
    try {
      const res = await fetch("/api/registry-intents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fund,
          amountUsd: baseAmount,
          giverName: giverNameTrimmed,
          note: guestNote.trim() || undefined,
          paymentChannel: "venmo",
          venmoRecipient: link.id,
          website,
        }),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) {
        setVenmoError(data.error ?? t("errorCouldNotSave"));
        return;
      }
      const { appUrl, webUrl } = buildVenmoPaymentUrls(
        link.href,
        baseAmount,
        venmoNoteForUrl(fund, giverNameTrimmed, guestNote)
      );
      const isMobile = /android|iphone|ipad|ipod/i.test(navigator.userAgent);

      if (isMobile) {
        window.location.href = appUrl;
        window.setTimeout(() => {
          window.location.href = webUrl;
        }, 900);
      } else {
        window.open(webUrl, "_blank", "noopener,noreferrer");
      }
    } catch {
      setVenmoError(t("errorGeneric"));
    } finally {
      setVenmoSaving(false);
    }
  };

  const startStripeCheckout = async () => {
    setStripeLoading(true);
    setStripeError("");
    try {
      if (!giverNameTrimmed) {
        setStripeError(t("errorNameStripe"));
        return;
      }
      if (!Number.isFinite(amountNum) || amountNum <= 0) {
        setStripeError(t("errorAmountStripe"));
        return;
      }

      if (amountNum < 0.5) {
        setStripeError(t("errorMinAmount"));
        return;
      }

      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fund,
          amount: amountNum,
          giverName: giverNameTrimmed,
          coverStripeFees,
          note: guestNote.trim() || undefined,
          website,
        }),
      });
      const data = (await res.json()) as { url?: string; error?: string };
      if (!res.ok) {
        setStripeError(data.error ?? t("errorCheckoutFailed"));
        return;
      }
      if (data.url) {
        window.location.href = data.url;
        return;
      }
      setStripeError(t("errorNoCheckoutUrl"));
    } catch {
      setStripeError(t("errorGeneric"));
    } finally {
      setStripeLoading(false);
    }
  };

  return (
    <section className="min-h-dvh pt-24 pb-16 px-4 bg-secondary">
      <div className="max-w-3xl mx-auto">
        <p className="font-oldforge uppercase text-2xl text-primary mb-2">{t("sectionTitle")}</p>
        <h2 className="font-parochus-original text-4xl md:text-5xl text-primary mb-6">{t("heading")}</h2>
        <div className="w-24 h-[1px] bg-primary mb-10" />

        {checkoutFlag === "success" ? (
          <p
            className="font-oldforge text-stone-800 bg-white/60 border border-primary/20 rounded-xl px-4 py-3 mb-8"
            role="status"
          >
            {t("checkoutSuccess")}
          </p>
        ) : null}
        {checkoutFlag === "cancel" ? (
          <p className="font-oldforge text-stone-600 bg-stone-100/80 border border-stone-200 rounded-xl px-4 py-3 mb-8">
            {t("checkoutCancel")}
          </p>
        ) : null}

        <p className="font-oldforge text-lg text-stone-800 leading-relaxed mb-6">
        {t("intro1")}
        <br />
        <br />
        {t("intro2")}
        </p>
        <p className="font-oldforge text-sm text-stone-600 mb-8">{t("stepOf", { step })}</p>

        {step === 1 ? (
          <div className="rounded-xl border border-primary/20 bg-white/50 p-5 md:p-6 space-y-6 mb-10">
            <div>
              <p className="font-oldforge uppercase text-xs tracking-wider text-primary mb-2">{t("fundLabel")}</p>
              <div className="flex flex-wrap gap-2" role="group" aria-label="Choose a gift fund">
                {REGISTRY_FUNDS.map((f) => (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => setFund(f.id)}
                    className={`font-oldforge uppercase text-xs border px-3 py-2 rounded-md transition-colors ${
                      fund === f.id
                        ? "bg-primary text-secondary border-primary"
                        : "bg-transparent text-primary border-primary/50 hover:border-primary"
                    }`}
                    aria-pressed={fund === f.id}
                    aria-describedby="registry-fund-description"
                  >
                    {t(`funds.${f.id}.label`)}
                  </button>
                ))}
              </div>
              {selectedFund ? (
                <p
                  id="registry-fund-description"
                  className="font-oldforge text-sm text-stone-700 leading-relaxed border-l-2 border-primary/35 pl-3 mt-3"
                  role="region"
                  aria-live="polite"
                >
                  {t(`funds.${selectedFund.id}.description`)}
                </p>
              ) : null}
            </div>

            <div>
              <label htmlFor="registry-amount" className="font-oldforge uppercase text-xs tracking-wider text-primary mb-2 block">
                {t("amountLabel")}
              </label>
              <div className="relative">
                <span
                  className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 font-oldforge text-stone-600 select-none"
                  aria-hidden
                >
                  $
                </span>
                <input
                  id="registry-amount"
                  inputMode="decimal"
                  type="text"
                  autoComplete="off"
                  value={amount}
                  placeholder="0.00"
                  onChange={(e) => setAmount(sanitizeAmountTyping(e.target.value))}
                  onBlur={() => {
                    const raw = stripAmountDecorators(amount).trim();
                    if (!raw) {
                      setAmount("");
                      return;
                    }
                    const n = Number(raw);
                    if (!Number.isFinite(n)) {
                      setAmount("");
                      return;
                    }
                    setAmount(n.toFixed(2));
                  }}
                  className="w-full font-oldforge text-stone-800 border border-primary/20 bg-white/70 rounded-md pl-8 pr-4 py-3 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                />
              </div>
              {/* <p className="font-oldforge text-stone-600 text-xs mt-2">Minimum $0.50</p> */}
            </div>

            <div>
              <label htmlFor="registry-giver-name" className="font-oldforge uppercase text-xs tracking-wider text-primary">
                {t("yourNameLabel")}
              </label>
              <input
                id="registry-giver-name"
                type="text"
                value={giverName}
                onChange={(e) => setGiverName(e.target.value.slice(0, 120))}
                placeholder={t("yourNamePlaceholder")}
                required
                className="mt-2 w-full font-oldforge text-stone-800 border border-primary/20 bg-white/70 rounded-md px-4 py-3 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
              />
              <p className="font-oldforge text-stone-600 text-xs mt-2">{t("requiredHint")}</p>
            </div>

            <div>
              <label htmlFor="registry-note" className="font-oldforge uppercase text-xs tracking-wider text-primary">
                {t("noteLabel")}
              </label>
              <textarea
                id="registry-note"
                rows={3}
                value={guestNote}
                onChange={(e) => setGuestNote(e.target.value.slice(0, 2000))}
                placeholder={t("notePlaceholder")}
                className="mt-2 w-full font-oldforge text-stone-800 border border-primary/20 bg-white/70 rounded-md px-4 py-3 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 resize-y min-h-[5rem]"
              />
            </div>

            <div className="sr-only" aria-hidden="true">
              <label htmlFor="registry-website">Website</label>
              <input
                id="registry-website"
                name="website"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                autoComplete="off"
                tabIndex={-1}
              />
            </div>

            <button
              type="button"
              onClick={() => setStep(2)}
              disabled={!canContinue}
              className="font-oldforge uppercase border-2 border-primary bg-primary text-secondary px-5 py-3 rounded-md hover:brightness-110 transition-[filter] disabled:opacity-50 disabled:pointer-events-none"
            >
              {t("continueToPayment")}
            </button>
          </div>
        ) : (
          <div className="space-y-6 mb-10">
            <div className="rounded-xl border border-primary/20 bg-white/50 p-5 md:p-6">
              <p className="font-oldforge text-xs uppercase tracking-wider text-primary mb-3">{t("giftSummary")}</p>
              <div className="space-y-1 font-oldforge text-sm text-stone-800">
                <p>
                  <span className="font-semibold">{t("fundSummaryLabel")}</span> {t(`funds.${fund}.label`)}
                </p>
                <p className="font-oldforge text-stone-600 text-sm leading-relaxed pt-1">
                  {t(`funds.${fund}.description`)}
                </p>
                <p>
                  <span className="font-semibold">{t("giftAmountLabel")}</span> {formatUsd(baseAmount)}
                </p>
                {giverName.trim() ? (
                  <p>
                    <span className="font-semibold">{t("fromLabel")}</span> {giverName.trim()}
                  </p>
                ) : null}
                <p>
                  <span className="font-semibold">{t("cardChargeLabel")}</span>{" "}
                  {formatUsd(coverStripeFees ? estimatedCharge : baseAmount)}
                  {coverStripeFees ? ` ${t("includesFees", { fee: formatUsd(estimatedFee) })}` : ""}
                </p>
                {guestNote.trim() ? (
                  <p>
                    <span className="font-semibold">{t("noteDisplayLabel")}</span> {guestNote.trim()}
                  </p>
                ) : null}
              </div>
              <button
                type="button"
                onClick={() => setStep(1)}
                className="mt-4 font-oldforge text-xs uppercase tracking-wider text-primary underline underline-offset-2"
              >
                {t("editDetails")}
              </button>
            </div>

            <div className="rounded-xl border border-primary/20 bg-white/50 p-5 md:p-6 space-y-5">
              <div>
                <p className="font-oldforge uppercase text-xs tracking-wider text-primary mb-2">{t("paymentMethod")}</p>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => setMethod("venmo")}
                    className={`font-oldforge uppercase text-xs border px-3 py-2 rounded-md transition-colors ${
                      method === "venmo"
                        ? "bg-primary text-secondary border-primary"
                        : "bg-transparent text-primary border-primary/50 hover:border-primary"
                    }`}
                    aria-pressed={method === "venmo"}
                  >
                    {t("venmo")}
                  </button>
                  <button
                    type="button"
                    onClick={() => setMethod("card")}
                    className={`font-oldforge uppercase text-xs border px-3 py-2 rounded-md transition-colors ${
                      method === "card"
                        ? "bg-primary text-secondary border-primary"
                        : "bg-transparent text-primary border-primary/50 hover:border-primary"
                    }`}
                    aria-pressed={method === "card"}
                  >
                    {t("cardStripe")}
                  </button>
                </div>
              </div>

              {method === "card" ? (
                <div className="flex items-start gap-3 rounded-xl border border-primary/15 bg-white/40 px-4 py-3">
                  <input
                    id="cover-stripe-fees"
                    type="checkbox"
                    checked={coverStripeFees}
                    onChange={(e) => setCoverStripeFees(e.target.checked)}
                    className="mt-1 h-4 w-4 text-primary border-primary/40 rounded focus:ring-primary/30"
                  />
                  <label htmlFor="cover-stripe-fees" className="cursor-pointer">
                    <span className="font-oldforge uppercase text-xs tracking-wider text-primary">
                      {t("coverStripeFees")}
                    </span>
                    <p className="font-oldforge text-stone-600 text-xs mt-1 leading-relaxed">
                      {t("coverStripeFeesDesc")}
                    </p>
                  </label>
                </div>
              ) : null}

              {method === "venmo" ? (
                <>
                  {venmoLinks.length > 0 ? (
                    <div className="flex flex-col sm:flex-row gap-3">
                      {venmoLinks.map((link) => (
                        <button
                          key={link.id}
                          type="button"
                          disabled={venmoSaving || !amountIsValid}
                          onClick={() => openVenmo(link)}
                          className="font-oldforge uppercase text-center inline-flex items-center justify-center border-2 border-primary bg-primary text-secondary px-5 py-3 rounded-md hover:brightness-110 transition-[filter] disabled:opacity-50 disabled:pointer-events-none"
                        >
                          {venmoSaving ? t("saving") : `${link.label} — ${amountIsValid ? formatUsd(baseAmount) : "—"}`}
                        </button>
                      ))}
                    </div>
                  ) : process.env.NODE_ENV === "development" ? (
                    <p className="font-oldforge text-stone-600 text-base leading-relaxed">
                      Venmo links are not set yet. Add{" "}
                      <code className="text-sm bg-stone-200/80 px-1 rounded">NEXT_PUBLIC_VENMO_MACY</code> and/or{" "}
                      <code className="text-sm bg-stone-200/80 px-1 rounded">NEXT_PUBLIC_VENMO_DANIEL</code> in{" "}
                      <code className="text-sm bg-stone-200/80 px-1 rounded">.env.local</code>.
                    </p>
                  ) : (
                    <p className="font-oldforge text-stone-600 text-base leading-relaxed">
                      {t("venmoNotReady")}
                    </p>
                  )}
                  {venmoError ? (
                    <p className="font-oldforge text-sm text-red-800 mt-3" role="alert">
                      {venmoError}
                    </p>
                  ) : null}
                </>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={startStripeCheckout}
                    disabled={stripeLoading}
                    className="font-oldforge uppercase border-2 border-primary text-primary bg-transparent px-5 py-3 rounded-md hover:bg-primary/10 transition-colors disabled:opacity-50 disabled:pointer-events-none"
                  >
                    {stripeLoading
                      ? t("openingCheckout")
                      : amountIsValid
                        ? t("payAmountWithCard", { amount: formatUsd(coverStripeFees ? estimatedCharge : baseAmount) })
                        : t("payWithCard")}
                  </button>
                  {stripeError ? (
                    <p className="font-oldforge text-sm text-red-800 mt-3 max-w-prose" role="alert">
                      {stripeError}
                    </p>
                  ) : null}
                </>
              )}
            </div>
          </div>
        )}

        {process.env.NODE_ENV === "development" ? (
          <p className="font-oldforge text-stone-500 text-sm mt-6 leading-relaxed max-w-prose">
            Stripe: <code className="bg-stone-200/80 px-1 rounded">STRIPE_SECRET_KEY</code> and product IDs{" "}
            <code className="bg-stone-200/80 px-1 rounded">STRIPE_PRODUCT_*</code>. Database: run{" "}
            <code className="bg-stone-200/80 px-1 rounded">sql/registry_intents.sql</code> in Supabase.
          </p>
        ) : null}
      </div>
    </section>
  );
}
