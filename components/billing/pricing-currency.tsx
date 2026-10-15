"use client";
import { useEffect, useState } from "react";
export type PricingCurrency = "USD" | "NGN";
export function usePricingCurrency() {
    const [currency, setCurrency] = useState<PricingCurrency>("USD");
    const [isLoadingCurrency, setLoading] = useState(true);
    useEffect(() => {
        const controller = new AbortController();
        fetch("/api/billing/pricing-context", { credentials: "include", cache: "no-store", signal: controller.signal })
            .then(async response => { if (!response.ok) return; const body = await response.json(); if (!controller.signal.aborted && ["USD", "NGN"].includes(body.data?.currency)) setCurrency(body.data.currency); })
            .catch(() => {}).finally(() => { if (!controller.signal.aborted) setLoading(false); });
        return () => controller.abort();
    }, []);
    return { currency, setCurrency, isLoadingCurrency };
}
export function CurrencyToggle({ currency, onChange, disabled = false }: { currency: PricingCurrency; onChange: (value: PricingCurrency) => void; disabled?: boolean }) {
    return <div role="group" aria-label="Pricing currency" className="inline-flex gap-1 rounded-xl border border-border bg-muted/50 p-1">
        {(["USD", "NGN"] as const).map(value => <button key={value} type="button" disabled={disabled} aria-pressed={currency === value} onClick={() => onChange(value)} className={`cursor-pointer rounded-lg px-4 py-2 text-sm font-semibold transition-colors disabled:cursor-wait disabled:opacity-60 focus-visible:outline-2 focus-visible:outline-primary ${currency === value ? "bg-background text-primary shadow-sm" : "text-muted-foreground hover:text-foreground"}`}>{value === "USD" ? "$ USD" : "₦ NGN"}</button>)}
    </div>;
}
export function plansForCurrency<T extends { currency: string; price: number; ngnPrice?: number | null; trialPeriodDays?: number }>(plans: T[], currency: PricingCurrency): T[] {
    if (currency === "USD") return plans.filter(plan => plan.currency?.toUpperCase() === "USD");
    return plans.filter(plan => plan.currency?.toUpperCase() === "USD" && typeof plan.ngnPrice === "number" && plan.ngnPrice > 0)
        .map(plan => ({ ...plan, price: plan.ngnPrice!, currency: "NGN", trialPeriodDays: 0 }));
}
