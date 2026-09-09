"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
    AlertCircle,
    ArrowRight,
    Calendar,
    Check,
    CheckCircle2,
    ChevronLeft,
    ChevronRight,
    Clock,
    CreditCard,
    Loader2,
    Zap,
} from "lucide-react";
import { useCachedResource } from "@/lib/client-cache";
import { CACHE_TTL } from "@/lib/client-data";
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
    description?: string;
    planCode: string;
    dodoProductId?: string;
    price: number;
    currency: string;
    interval: string;
    trialPeriodDays?: number;
    features?: PlanFeatures;
    isActive?: boolean;
}

interface Subscription {
    id: string;
    planId: string;
    status: "pending" | "active" | "on_hold" | "cancelled" | "failed" | "expired" | string;
    trialStartedAt: string | null;
    trialEndsAt: string | null;
    trialPeriodDays: number | null;
    currentPeriodStart: string | null;
    currentPeriodEnd: string | null;
    cancelAtPeriodEnd: boolean;
    canceledAt: string | null;
    createdAt: string;
    updatedAt: string;
    plan: Plan;
    isTrialing: boolean;
    hasAccess: boolean;
}

interface PaginationInfo {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
}

type ApiResponse<T> = {
    message?: string;
    data: T;
};

type PlansPayload = Plan[] | { plans?: Plan[] };
type BillingTab = "subscription" | "payments" | "plans";

const currency = "USD";
const BILLING_CURRENT_CACHE_KEY = "billing:subscriptions:current";
const BILLING_PLANS_CACHE_KEY = "billing:plans";
const BILLING_HISTORY_CACHE_PREFIX = "billing:subscriptions:history";

const emptyPagination: PaginationInfo = {
    page: 1,
    limit: 5,
    total: 0,
    totalPages: 0,
};

function getCurrencySymbol(currency: string) {
    const symbols: Record<string, string> = {
        USD: "$",
        EUR: "€",
        GBP: "£",
    };

    return symbols[currency.toUpperCase()] || currency.toUpperCase();
}

function toTitleCase(value: string) {
    return value.replace(/_/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());
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

function formatDate(dateString: string | null) {
    if (!dateString) return "N/A";

    return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
    });
}

function getDaysUntil(dateString: string | null) {
    if (!dateString) return 0;

    const diff = new Date(dateString).getTime() - Date.now();
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

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

class UnauthorizedError extends Error {
    constructor() {
        super("Please sign in to continue.");
        this.name = "UnauthorizedError";
    }
}

async function fetchCurrentSubscription() {
    const response = await apiFetch("billing/subscriptions/current", {
        cache: "no-store",
    });

    if (response.status === 401) throw new UnauthorizedError();

    const json = await readApiResponse<Subscription | null>(response);
    return json.data ?? null;
}

async function fetchBillingPlans() {
    const response = await apiFetch("billing/plans", {
        cache: "no-store",
    });

    if (response.status === 401) throw new UnauthorizedError();

    const json = await readApiResponse<PlansPayload>(response);
    const planData = Array.isArray(json.data) ? json.data : json.data?.plans ?? [];
    return planData.filter((plan) => plan.isActive !== false);
}

function getBillingHistoryCacheKey(page: number, limit: number) {
    return `${BILLING_HISTORY_CACHE_PREFIX}:${page}:${limit}`;
}

async function fetchSubscriptionHistory(page: number, limit: number) {
    const response = await apiFetch(
        `billing/subscriptions/history?page=${page}&limit=${limit}`,
        {
            cache: "no-store",
        },
    );

    if (response.status === 401) throw new UnauthorizedError();

    const json = await readApiResponse<{
        items: Subscription[];
        pagination: PaginationInfo;
    }>(response);

    return {
        items: json.data?.items ?? [],
        pagination: json.data?.pagination ?? emptyPagination,
    };
}

export function Billing() {
    const router = useRouter();

    const [pagination, setPagination] = useState<PaginationInfo>(emptyPagination);
    const [subscribingPlanId, setSubscribingPlanId] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<BillingTab>("subscription");
    const historyCacheKey = getBillingHistoryCacheKey(pagination.page, pagination.limit);
    const historyInitialData = useMemo(
        () => ({ items: [], pagination }),
        [pagination],
    );
    const historyFetcher = useCallback(
        () => fetchSubscriptionHistory(pagination.page, pagination.limit),
        [pagination.limit, pagination.page],
    );
    const {
        data: currentSubscription = null,
        error: currentSubscriptionError,
        isLoading: isLoadingCurrent,
    } = useCachedResource(BILLING_CURRENT_CACHE_KEY, fetchCurrentSubscription, { ttl: CACHE_TTL });
    const {
        data: plans = [],
        error: plansError,
        isLoading: isLoadingPlans,
    } = useCachedResource(BILLING_PLANS_CACHE_KEY, fetchBillingPlans, { ttl: CACHE_TTL });
    const {
        data: historyData,
        error: historyError,
        isLoading: isLoadingHistory,
    } = useCachedResource(
        historyCacheKey,
        historyFetcher,
        { ttl: CACHE_TTL, initialData: historyInitialData },
    );
    const subscriptionHistory = historyData?.items ?? [];
    const historyPagination = historyData?.pagination ?? pagination;
    const loadingError = currentSubscriptionError ?? plansError;

    const filteredPlans = useMemo(
        () => plans.filter((plan) => plan.currency.toUpperCase() === currency),
        [plans],
    );

    const handleUnauthorized = (response: Response) => {
        if (response.status === 401) {
            router.push("/login");
            return true;
        }

        return false;
    };

    useEffect(() => {
        if (
            currentSubscriptionError instanceof UnauthorizedError ||
            plansError instanceof UnauthorizedError ||
            historyError instanceof UnauthorizedError
        ) {
            router.push("/login");
        }
    }, [currentSubscriptionError, historyError, plansError, router]);

    const getStatusBadge = (subscription: Subscription) => {
        const status = subscription.isTrialing ? "trialing" : subscription.status;
        const statusConfig: Record<string, { bg: string; text: string; icon: React.ElementType }> = {
            active: { bg: "bg-green-500/10", text: "text-green-600", icon: CheckCircle2 },
            trialing: { bg: "bg-blue-500/10", text: "text-blue-600", icon: Clock },
            pending: { bg: "bg-amber-500/10", text: "text-amber-600", icon: Clock },
            on_hold: { bg: "bg-orange-500/10", text: "text-orange-600", icon: AlertCircle },
            failed: { bg: "bg-red-500/10", text: "text-red-600", icon: AlertCircle },
            expired: { bg: "bg-red-500/10", text: "text-red-600", icon: AlertCircle },
            cancelled: { bg: "bg-zinc-500/10", text: "text-zinc-600", icon: AlertCircle },
        };
        const config = statusConfig[status] || statusConfig.pending;
        const Icon = config.icon;

        return (
            <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${config.bg} ${config.text}`}>
                <Icon className="h-3.5 w-3.5" />
                {status.charAt(0).toUpperCase() + status.slice(1).replace("_", " ")}
            </span>
        );
    };

    const startCheckout = async (plan: Plan) => {
        setSubscribingPlanId(plan.id);
        setError(null);

        try {
            const response = await apiFetch("billing/subscriptions/checkout", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    planId: plan.id,
                    returnUrl: `${window.location.origin}/billing/payment-status`,
                    cancelUrl: `${window.location.origin}/billing`,
                }),
            });

            if (handleUnauthorized(response)) return;

            const json = await readApiResponse<{ checkoutUrl: string }>(response);
            if (!json.data?.checkoutUrl) {
                throw new Error("Checkout URL was not returned. Please try again.");
            }

            window.location.href = json.data.checkoutUrl;
        } catch (checkoutError) {
            setError(checkoutError instanceof Error ? checkoutError.message : "Failed to start checkout.");
        } finally {
            setSubscribingPlanId(null);
        }
    };

    const goToPage = (page: number) => {
        setPagination((prev) => ({
            ...prev,
            page,
        }));
    };

    const subscriptionEndDate = currentSubscription?.isTrialing
        ? currentSubscription.trialEndsAt
        : currentSubscription?.currentPeriodEnd ?? null;
    const shouldShowPlansImmediately = !currentSubscription || currentSubscription.isTrialing || !currentSubscription.hasAccess;
    const shouldShowTabs = Boolean(currentSubscription && !currentSubscription.isTrialing && currentSubscription.hasAccess);
    const shouldShowSubscriptionSection = shouldShowPlansImmediately || activeTab === "subscription";
    const shouldShowPlansSection = shouldShowPlansImmediately || activeTab === "plans";
    const shouldShowPaymentsSection = !shouldShowPlansImmediately && activeTab === "payments";

    const switchToPlans = () => {
        setActiveTab("plans");
        requestAnimationFrame(() => {
            document.getElementById("billing-plans")?.scrollIntoView({ behavior: "smooth", block: "start" });
        });
    };

    return (
        <div className="mx-auto max-w-7xl space-y-8">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-foreground sm:text-3xl">
                        Billing &amp; Subscription
                    </h1>
                    <p className="mt-1 text-sm text-muted-foreground">
                        Manage your subscription, checkout, and payment history.
                    </p>
                </div>
            </div>

            {(error || loadingError) && (
                <div className="flex items-start gap-3 rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-600">
                    <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                    <p>{error || loadingError?.message}</p>
                </div>
            )}

            {shouldShowTabs && (
                <div className="inline-flex rounded-xl border border-border bg-card p-1 shadow-sm">
                    {([
                        ["subscription", "Subscription"],
                        ["payments", "Payments"],
                        ["plans", "Plans"],
                    ] as const).map(([tab, label]) => (
                        <button
                            key={tab}
                            type="button"
                            onClick={() => setActiveTab(tab)}
                            className={`h-10 cursor-pointer rounded-lg px-4 text-sm font-semibold transition ${
                                activeTab === tab
                                    ? "bg-primary text-white shadow-sm"
                                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                            }`}
                        >
                            {label}
                        </button>
                    ))}
                </div>
            )}

            {shouldShowSubscriptionSection && (
            <section className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
                <div className="flex items-center gap-2 border-b border-border p-5">
                    <CreditCard className="h-5 w-5 text-primary" />
                    <h2 className="text-lg font-semibold text-foreground">Current Subscription</h2>
                </div>

                <div className="p-6">
                    {isLoadingCurrent ? (
                        <div className="space-y-3 animate-pulse">
                            <div className="h-5 w-40 rounded bg-muted" />
                            <div className="h-4 w-64 rounded bg-muted" />
                            <div className="h-8 w-24 rounded bg-muted" />
                        </div>
                    ) : currentSubscription ? (
                        <div className="space-y-5">
                            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                                <div>
                                    <div className="flex flex-wrap items-center gap-3">
                                        <h3 className="text-xl font-semibold text-foreground">
                                            {currentSubscription.plan.name}
                                        </h3>
                                        {getStatusBadge(currentSubscription)}
                                    </div>
                                    {currentSubscription.plan.description && (
                                        <p className="mt-2 text-sm text-muted-foreground">
                                            {currentSubscription.plan.description}
                                        </p>
                                    )}
                                </div>

                                <div className="text-left sm:text-right">
                                    <p className="text-2xl font-bold text-foreground">
                                        {getCurrencySymbol(currentSubscription.plan.currency)}
                                        {currentSubscription.plan.price.toLocaleString()}
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                        / {currentSubscription.plan.interval}
                                    </p>
                                </div>
                            </div>

                            <div className="grid gap-3 sm:grid-cols-3">
                                <div className="rounded-xl border border-border bg-muted/30 p-4">
                                    <p className="text-xs font-medium text-muted-foreground">Access</p>
                                    <p className="mt-1 font-semibold text-foreground">
                                        {currentSubscription.hasAccess ? "Enabled" : "Not enabled"}
                                    </p>
                                </div>
                                <div className="rounded-xl border border-border bg-muted/30 p-4">
                                    <p className="text-xs font-medium text-muted-foreground">
                                        {currentSubscription.isTrialing ? "Trial ends" : "Current period ends"}
                                    </p>
                                    <p className="mt-1 font-semibold text-foreground">
                                        {formatDate(subscriptionEndDate)}
                                    </p>
                                </div>
                                <div className="rounded-xl border border-border bg-muted/30 p-4">
                                    <p className="text-xs font-medium text-muted-foreground">Days remaining</p>
                                    <p className="mt-1 font-semibold text-foreground">
                                        {getDaysUntil(subscriptionEndDate)}
                                    </p>
                                </div>
                            </div>

                            {["on_hold", "failed", "expired"].includes(currentSubscription.status) && (
                                <div className="rounded-xl border border-orange-500/20 bg-orange-500/10 p-4 text-sm text-orange-700">
                                    Your subscription needs attention. Review your plans or contact support for help.
                                </div>
                            )}

                            {shouldShowTabs && (
                                <div className="flex flex-col gap-3 rounded-xl border border-border bg-muted/30 p-4 sm:flex-row sm:items-center sm:justify-between">
                                    <div>
                                        <p className="text-sm font-semibold text-foreground">Looking ahead?</p>
                                        <p className="mt-1 text-sm text-muted-foreground">
                                            Review available plans when you are ready to renew or change your subscription.
                                        </p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={switchToPlans}
                                        className="inline-flex h-10 cursor-pointer items-center justify-center gap-2 rounded-lg border border-border bg-background px-4 text-sm font-semibold text-foreground hover:bg-muted"
                                    >
                                        View plans
                                        <ArrowRight className="h-4 w-4" />
                                    </button>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div>
                            <p className="font-medium text-foreground">No active subscription</p>
                            <p className="mt-1 text-sm text-muted-foreground">
                                Choose a plan below to start your free trial and begin scheduling content.
                            </p>
                        </div>
                    )}
                </div>
            </section>
            )}

            {shouldShowPlansSection && (
            <section id="billing-plans" className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
                <div className="border-b border-border p-5">
                    <h2 className="text-lg font-semibold text-foreground">
                        {shouldShowPlansImmediately ? "Choose a plan" : "Plans"}
                    </h2>
                    <p className="mt-1 text-sm text-muted-foreground">
                        Start with a free trial. Your card will not be charged during the trial period.
                    </p>
                </div>

                <div className="p-6">
                    {isLoadingPlans ? (
                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                            {[0, 1, 2].map((item) => (
                                <div key={item} className="h-56 animate-pulse rounded-xl border border-border bg-muted/40" />
                            ))}
                        </div>
                    ) : filteredPlans.length === 0 ? (
                        <p className="py-8 text-center text-sm text-muted-foreground">
                            No plans available in {currency} right now.
                        </p>
                    ) : (
                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                            {filteredPlans.map((plan, index) => {
                                const isPopular = index === 0;
                                const featureLines = getFeatureLines(plan.features);

                                return (
                                    <article
                                        key={plan.id}
                                        className={`relative flex min-h-[560px] flex-col rounded-xl border p-5 shadow-sm transition hover:shadow-md ${
                                            isPopular ? "border-primary/50 bg-primary/5" : "border-border bg-card"
                                        }`}
                                    >
                                        {isPopular && (
                                            <span className="absolute -top-3 left-4 inline-flex items-center gap-1 rounded-full bg-primary px-2.5 py-0.5 text-[10px] font-semibold text-white">
                                                <Zap className="h-2.5 w-2.5" />
                                                Popular
                                            </span>
                                        )}

                                        <div>
                                            <h3 className="text-lg font-semibold text-foreground">{plan.name}</h3>
                                            {plan.description && (
                                                <p className="mt-1 text-sm leading-6 text-muted-foreground">
                                                    {plan.description}
                                                </p>
                                            )}
                                        </div>

                                        <div className="mt-5 flex items-baseline gap-1">
                                            <span className="text-3xl font-bold text-foreground">
                                                {getCurrencySymbol(plan.currency)}
                                                {plan.price.toLocaleString()}
                                            </span>
                                            <span className="text-sm text-muted-foreground">/ {plan.interval}</span>
                                        </div>

                                        {featureLines.length > 0 && (
                                            <ul className="mt-5 flex-1 space-y-2">
                                                {featureLines.map((line) => (
                                                    <li key={line} className="flex items-start gap-2 text-sm text-foreground">
                                                        <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                                                        <span>{line}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        )}

                                        <div className="mt-auto pt-6">
                                            <button
                                                type="button"
                                                onClick={() => startCheckout(plan)}
                                                disabled={subscribingPlanId === plan.id}
                                                className={`inline-flex h-11 w-full cursor-pointer items-center justify-center gap-2 rounded-lg text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-60 ${
                                                    isPopular
                                                        ? "bg-primary text-white hover:bg-primary/90"
                                                        : "border border-border bg-background text-foreground hover:bg-muted"
                                                }`}
                                            >
                                                {subscribingPlanId === plan.id ? (
                                                    "Redirecting..."
                                                ) : (
                                                    <>
                                                        {plan.trialPeriodDays && plan.trialPeriodDays > 0
                                                            ? `Start ${plan.trialPeriodDays}-day free trial`
                                                            : "Choose plan"}
                                                        <ArrowRight className="h-4 w-4" />
                                                    </>
                                                )}
                                            </button>

                                            {plan.trialPeriodDays && plan.trialPeriodDays > 0 && (
                                                <p className="mt-3 text-center text-xs font-medium text-muted-foreground">
                                                    $0.00 due today. Your card will not be charged during trial.
                                                </p>
                                            )}
                                        </div>
                                    </article>
                                );
                            })}
                        </div>
                    )}
                </div>
            </section>
            )}

            {shouldShowPaymentsSection && (
            <section className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
                <div className="border-b border-border p-5">
                    <h2 className="text-lg font-semibold text-foreground">Payments</h2>
                    <p className="mt-1 text-sm text-muted-foreground">
                        Previous and current subscription records.
                    </p>
                </div>

                {isLoadingHistory ? (
                    <div className="p-6">
                        <div className="h-40 animate-pulse rounded-xl bg-muted" />
                    </div>
                ) : subscriptionHistory.length === 0 ? (
                    <p className="p-8 text-center text-sm text-muted-foreground">
                        No subscription history found.
                    </p>
                ) : (
                    <>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="border-b border-border bg-muted/50">
                                    <tr>
                                        {["Plan", "Status", "Price", "Started", "Ends"].map((heading) => (
                                            <th key={heading} className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-foreground">
                                                {heading}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border">
                                    {subscriptionHistory.map((subscription) => (
                                        <tr key={subscription.id} className="hover:bg-muted/30">
                                            <td className="px-5 py-4">
                                                <p className="text-sm font-medium text-foreground">
                                                    {subscription.plan.name}
                                                </p>
                                                <p className="text-xs text-muted-foreground">
                                                    {subscription.plan.planCode}
                                                </p>
                                            </td>
                                            <td className="px-5 py-4">{getStatusBadge(subscription)}</td>
                                            <td className="px-5 py-4 text-sm text-foreground">
                                                {getCurrencySymbol(subscription.plan.currency)}
                                                {subscription.plan.price.toLocaleString()} / {subscription.plan.interval}
                                            </td>
                                            <td className="px-5 py-4 text-sm text-foreground">
                                                {formatDate(subscription.createdAt)}
                                            </td>
                                            <td className="px-5 py-4 text-sm text-foreground">
                                                <span className="inline-flex items-center gap-1">
                                                    <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                                                    {formatDate(subscription.isTrialing ? subscription.trialEndsAt : subscription.currentPeriodEnd)}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {historyPagination.totalPages > 1 && (
                            <div className="flex flex-col gap-3 border-t border-border bg-muted/30 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                                <p className="text-sm text-muted-foreground">
                                    Page {historyPagination.page} of {historyPagination.totalPages}
                                </p>
                                <div className="flex gap-2">
                                    <button
                                        type="button"
                                        onClick={() => goToPage(historyPagination.page - 1)}
                                        disabled={historyPagination.page === 1}
                                        className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-background text-foreground hover:bg-accent disabled:cursor-not-allowed disabled:opacity-50"
                                        aria-label="Previous page"
                                    >
                                        <ChevronLeft className="h-4 w-4" />
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => goToPage(historyPagination.page + 1)}
                                        disabled={historyPagination.page === historyPagination.totalPages}
                                        className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-background text-foreground hover:bg-accent disabled:cursor-not-allowed disabled:opacity-50"
                                        aria-label="Next page"
                                    >
                                        <ChevronRight className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </section>
            )}
        </div>
    );
}
