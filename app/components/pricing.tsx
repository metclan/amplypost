"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowRight, Check, Zap } from "lucide-react";
import { apiFetch } from "@/util/backend-api";

interface PlanFeatures {
    platforms?: Record<string, boolean>;
    scheduling?: { unlimited?: boolean; monthly_limit?: number | null };
    integrations?: Record<string, boolean>;
    social_accounts?: { max?: number };
    publishing_tools?: Record<string, boolean>;
}

interface Plan {
    id: string;
    name: string;
    planCode: string;
    description: string;
    price: number;
    currency: string;
    interval: string;
    trialPeriodDays?: number;
    features?: PlanFeatures;
    isActive?: boolean;
}

type ApiResponse<T> = {
    message?: string;
    data: T;
};

type PlansPayload = Plan[] | { plans?: Plan[] };

const currency = "USD";

async function readApiResponse<T>(response: Response): Promise<ApiResponse<T>> {
    const json = (await response.json().catch(() => null)) as
        | (Partial<ApiResponse<T>> & { errors?: unknown })
        | null;

    if (!response.ok) {
        const message =
            json?.message ||
            (response.status >= 500
                ? "Something went wrong. Please try again or contact support."
                : "Request failed.");
        throw new Error(message);
    }

    return json as ApiResponse<T>;
}

function toTitleCase(value: string) {
    return value
        .replace(/_/g, " ")
        .replace(/\b\w/g, (char) => char.toUpperCase());
}

function getCurrencySymbol(currency: string) {
    const symbols: Record<string, string> = {
        USD: "$",
        EUR: "EUR",
        GBP: "GBP",
    };
    return symbols[currency.toUpperCase()] || currency.toUpperCase();
}

function getFeatureLines(features?: PlanFeatures) {
    if (!features) return [];

    const lines: string[] = [];

    if (features.social_accounts?.max) {
        lines.push(`Up to ${features.social_accounts.max} social accounts`);
    }

    if (features.scheduling?.unlimited) {
        lines.push("Unlimited post scheduling");
    } else if (features.scheduling?.monthly_limit) {
        lines.push(`${features.scheduling.monthly_limit} posts/month`);
    }

    if (features.platforms) {
        const enabledPlatforms = Object.entries(features.platforms)
            .filter(([, enabled]) => enabled)
            .map(([name]) => toTitleCase(name));

        if (enabledPlatforms.length > 0) {
            lines.push(`Platforms: ${enabledPlatforms.join(", ")}`);
        }
    }

    if (features.publishing_tools) {
        Object.entries(features.publishing_tools)
            .filter(([, enabled]) => enabled)
            .forEach(([tool]) => lines.push(toTitleCase(tool)));
    }

    if (features.integrations) {
        const enabledIntegrations = Object.entries(features.integrations)
            .filter(([, enabled]) => enabled)
            .map(([name]) => toTitleCase(name));

        if (enabledIntegrations.length > 0) {
            lines.push(`Integrations: ${enabledIntegrations.join(", ")}`);
        }
    }

    return lines;
}

export default function Pricing() {
    const [plans, setPlans] = useState<Plan[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let ignore = false;

        async function fetchPlans() {
            try {
                setIsLoading(true);
                setError(null);
                const response = await apiFetch("billing/plans", {
                    cache: "no-store",
                });

                const json = await readApiResponse<PlansPayload>(response);
                const planData = Array.isArray(json.data) ? json.data : json.data?.plans ?? [];
                const activePlans: Plan[] = (planData || []).filter(
                    (plan: Plan) => plan.isActive !== false
                );

                if (!ignore) {
                    setPlans(activePlans);
                }
            } catch (fetchError) {
                console.error("Failed to load pricing plans:", fetchError);
                if (!ignore) {
                    setError("Unable to load plans right now. Please try again shortly.");
                }
            } finally {
                if (!ignore) {
                    setIsLoading(false);
                }
            }
        }

        fetchPlans();

        return () => {
            ignore = true;
        };
    }, []);

    const filteredPlans = plans.filter(
        (plan) => plan.currency?.toUpperCase() === currency
    );
    const planGridClassName =
        filteredPlans.length === 1
            ? "mx-auto grid max-w-md grid-cols-1 gap-6"
            : filteredPlans.length === 2
                ? "mx-auto grid max-w-4xl gap-6 sm:grid-cols-2"
                : "mx-auto grid max-w-7xl gap-6 sm:grid-cols-2 lg:grid-cols-3";

    return (
        <section id="pricing" className="bg-muted/30 px-4 py-20 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-7xl">
                <div className="text-center">
                    <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                        Simple pricing for better social media management
                    </h2>
                    <p className="mt-4 text-lg text-muted-foreground">
                        Choose a plan that fits your publishing workflow.
                    </p>
                </div>

                <div className="mt-12">
                    {isLoading ? (
                        <div className="mx-auto grid max-w-7xl gap-6 sm:grid-cols-2 lg:grid-cols-3">
                            {[0, 1, 2].map((item) => (
                                <div
                                    key={item}
                                    className="rounded-2xl border border-border bg-card p-6 shadow-sm"
                                >
                                    <div className="h-6 w-24 animate-pulse rounded bg-muted" />
                                    <div className="mt-3 h-4 w-44 animate-pulse rounded bg-muted" />
                                    <div className="mt-6 h-8 w-28 animate-pulse rounded bg-muted" />
                                    <div className="mt-6 space-y-2">
                                        <div className="h-4 w-full animate-pulse rounded bg-muted" />
                                        <div className="h-4 w-5/6 animate-pulse rounded bg-muted" />
                                        <div className="h-4 w-4/6 animate-pulse rounded bg-muted" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : error ? (
                        <p className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-center text-sm text-red-600">
                            {error}
                        </p>
                    ) : filteredPlans.length === 0 ? (
                        <p className="text-center text-sm text-muted-foreground">
                            No plans available in {currency} right now.
                        </p>
                    ) : (
                        <div className={planGridClassName}>
                            {filteredPlans.map((plan, index) => {
                                const isPopular = index === 0;
                                const featureLines = getFeatureLines(plan.features);
                                const formattedPrice =
                                    typeof plan.price === "number"
                                        ? plan.price.toLocaleString()
                                        : String(plan.price);

                                return (
                                    <div
                                        key={plan.id}
                                        className={`relative flex min-h-[620px] flex-col rounded-2xl border p-6 shadow-sm transition-shadow hover:shadow-lg ${isPopular
                                                ? "border-primary/50 bg-primary/5"
                                                : "border-border bg-card"
                                            }`}
                                    >
                                        {isPopular && (
                                            <span className="absolute -top-3 left-4 inline-flex items-center gap-1 rounded-full bg-primary px-2.5 py-0.5 text-[10px] font-semibold text-white">
                                                <Zap className="h-2.5 w-2.5" />
                                                Popular
                                            </span>
                                        )}

                                        <div>
                                            <h3 className="text-xl font-bold text-foreground">
                                                {plan.name}
                                            </h3>
                                            {plan.description && (
                                                <p className="mt-2 text-sm text-muted-foreground">
                                                    {plan.description}
                                                </p>
                                            )}
                                        </div>

                                        <div className="mt-6 flex items-baseline justify-center gap-1 text-center">
                                            <span className="text-4xl font-bold text-foreground">
                                                {getCurrencySymbol(plan.currency)}
                                                {formattedPrice}
                                            </span>
                                            <span className="text-muted-foreground">
                                                /{plan.interval}
                                            </span>
                                        </div>

                                        {featureLines.length > 0 && (
                                            <ul className="mt-6 flex-1 space-y-3">
                                                {featureLines.map((line) => (
                                                    <li
                                                        key={line}
                                                        className="flex items-start gap-2 text-sm text-foreground"
                                                    >
                                                        <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-primary" />
                                                        <span>{line}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        )}

                                        <div className="mt-auto pt-8">
                                            <Link
                                                href="/create-account"
                                                className={`inline-flex h-12 w-full items-center justify-center gap-2 rounded-lg px-4 text-sm font-semibold transition-all active:scale-[0.98] ${isPopular
                                                        ? "bg-primary text-white hover:bg-primary/90"
                                                        : "border border-border bg-background text-foreground hover:bg-muted"
                                                    }`}
                                            >
                                                {plan.trialPeriodDays && plan.trialPeriodDays > 0
                                                    ? `Start ${plan.trialPeriodDays}-day free trial`
                                                    : "Start now"}
                                                <ArrowRight className="h-4 w-4" />
                                            </Link>

                                            {plan.trialPeriodDays && plan.trialPeriodDays > 0 && (
                                                <p className="mt-3 text-center text-xs font-medium text-muted-foreground">
                                                    $0.00 due today. No card required.
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
}
