"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
    AlertCircle,
    Calendar,
    Check,
    CheckCircle2,
    ChevronLeft,
    ChevronRight,
    Clock,
    CreditCard,
    ExternalLink,
    Loader2,
    Zap,
} from "lucide-react";

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

const currency = "USD";

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

export function Billing() {
    const router = useRouter();

    const [currentSubscription, setCurrentSubscription] = useState<Subscription | null>(null);
    const [subscriptionHistory, setSubscriptionHistory] = useState<Subscription[]>([]);
    const [plans, setPlans] = useState<Plan[]>([]);
    const [pagination, setPagination] = useState<PaginationInfo>(emptyPagination);
    const [isLoadingCurrent, setIsLoadingCurrent] = useState(true);
    const [isLoadingPlans, setIsLoadingPlans] = useState(true);
    const [isLoadingHistory, setIsLoadingHistory] = useState(true);
    const [subscribingPlanId, setSubscribingPlanId] = useState<string | null>(null);
    const [isOpeningPortal, setIsOpeningPortal] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [portalError, setPortalError] = useState<string | null>(null);

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
        let ignore = false;

        async function fetchCurrentSubscription() {
            try {
                setIsLoadingCurrent(true);
                setError(null);
                const response = await fetch("/api/billing/subscriptions/current", {
                    credentials: "include",
                    cache: "no-store",
                });

                if (handleUnauthorized(response)) return;

                const json = await readApiResponse<Subscription | null>(response);
                if (!ignore) setCurrentSubscription(json.data ?? null);
            } catch (fetchError) {
                if (!ignore) {
                    setError(fetchError instanceof Error ? fetchError.message : "Failed to load subscription.");
                }
            } finally {
                if (!ignore) setIsLoadingCurrent(false);
            }
        }

        fetchCurrentSubscription();

        return () => {
            ignore = true;
        };
    }, [router]);

    useEffect(() => {
        let ignore = false;

        async function fetchPlans() {
            try {
                setIsLoadingPlans(true);
                const response = await fetch("/api/billing/plans", {
                    credentials: "include",
                    cache: "no-store",
                });

                if (handleUnauthorized(response)) return;

                const json = await readApiResponse<PlansPayload>(response);
                if (!ignore) {
                    const planData = Array.isArray(json.data) ? json.data : json.data?.plans ?? [];
                    setPlans(planData.filter((plan) => plan.isActive !== false));
                }
            } catch (fetchError) {
                if (!ignore) {
                    setError(fetchError instanceof Error ? fetchError.message : "Failed to load plans.");
                }
            } finally {
                if (!ignore) setIsLoadingPlans(false);
            }
        }

        fetchPlans();

        return () => {
            ignore = true;
        };
    }, [router]);

    useEffect(() => {
        let ignore = false;

        async function fetchSubscriptionHistory() {
            try {
                setIsLoadingHistory(true);
                const response = await fetch(
                    `/api/billing/subscriptions/history?page=${pagination.page}&limit=${pagination.limit}`,
                    {
                        credentials: "include",
                        cache: "no-store",
                    },
                );

                if (handleUnauthorized(response)) return;

                const json = await readApiResponse<{
                    items: Subscription[];
                    pagination: PaginationInfo;
                }>(response);

                if (!ignore) {
                    setSubscriptionHistory(json.data?.items ?? []);
                    setPagination(json.data?.pagination ?? emptyPagination);
                }
            } catch (fetchError) {
                console.error("Error fetching subscription history:", fetchError);
            } finally {
                if (!ignore) setIsLoadingHistory(false);
            }
        }

        fetchSubscriptionHistory();

        return () => {
            ignore = true;
        };
    }, [pagination.page, pagination.limit, router]);

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
            const response = await fetch("/api/billing/subscriptions/checkout", {
                method: "POST",
                credentials: "include",
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

    const openCustomerPortal = async () => {
        setIsOpeningPortal(true);
        setPortalError(null);

        try {
            const response = await fetch("/api/billing/customer-portal", {
                method: "POST",
                credentials: "include",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    returnUrl: `${window.location.origin}/billing`,
                    sendEmail: false,
                }),
            });

            if (handleUnauthorized(response)) return;

            if (response.status === 404) {
                setPortalError("Subscribe first to manage billing in the customer portal.");
                return;
            }

            const json = await readApiResponse<{ portalUrl: string }>(response);
            if (!json.data?.portalUrl) {
                throw new Error("Customer portal URL was not returned. Please try again.");
            }

            window.location.href = json.data.portalUrl;
        } catch (portalOpenError) {
            setPortalError(
                portalOpenError instanceof Error
                    ? portalOpenError.message
                    : "Unable to open the customer portal right now.",
            );
        } finally {
            setIsOpeningPortal(false);
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

    return (
        <div className="mx-auto max-w-7xl space-y-8">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-foreground sm:text-3xl">
                        Billing &amp; Subscription
                    </h1>
                    <p className="mt-1 text-sm text-muted-foreground">
                        Manage your subscription, checkout, and billing portal.
                    </p>
                </div>

                {currentSubscription && (
                    <button
                        type="button"
                        onClick={openCustomerPortal}
                        disabled={isOpeningPortal}
                        className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-primary px-4 text-sm font-semibold text-white transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        {isOpeningPortal ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                            <ExternalLink className="h-4 w-4" />
                        )}
                        Manage billing
                    </button>
                )}
            </div>

            {error && (
                <div className="flex items-start gap-3 rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-600">
                    <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                    <p>{error}</p>
                </div>
            )}

            {portalError && (
                <div className="flex items-start gap-3 rounded-xl border border-amber-500/20 bg-amber-500/10 p-4 text-sm text-amber-700">
                    <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                    <p>{portalError}</p>
                </div>
            )}

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
                                    Your subscription needs attention. Use Manage billing to update payment details or contact support.
                                </div>
                            )}
                        </div>
                    ) : (
                        <div>
                            <p className="font-medium text-foreground">No active subscription</p>
                            <p className="mt-1 text-sm text-muted-foreground">
                                Choose a plan below to start scheduling and publishing content.
                            </p>
                        </div>
                    )}
                </div>
            </section>

            <section className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
                <div className="border-b border-border p-5">
                    <h2 className="text-lg font-semibold text-foreground">Available Plans</h2>
                    <p className="mt-1 text-sm text-muted-foreground">
                        Checkout is hosted by Dodo Payments. Use a plan ID internally; product IDs stay on the backend.
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
                                        className={`relative flex flex-col rounded-xl border p-5 shadow-sm transition hover:shadow-md ${
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

                                        {plan.trialPeriodDays && plan.trialPeriodDays > 0 && (
                                            <p className="mt-4 text-xs text-muted-foreground">
                                                Includes {plan.trialPeriodDays}-day free trial
                                            </p>
                                        )}

                                        <button
                                            type="button"
                                            onClick={() => startCheckout(plan)}
                                            disabled={subscribingPlanId === plan.id}
                                            className={`mt-6 inline-flex h-10 w-full items-center justify-center rounded-lg text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-60 ${
                                                isPopular
                                                    ? "bg-primary text-white hover:bg-primary/90"
                                                    : "border border-border bg-background text-foreground hover:bg-muted"
                                            }`}
                                        >
                                            {subscribingPlanId === plan.id ? "Redirecting..." : "Choose plan"}
                                        </button>
                                    </article>
                                );
                            })}
                        </div>
                    )}
                </div>
            </section>

            <section className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
                <div className="border-b border-border p-5">
                    <h2 className="text-lg font-semibold text-foreground">Subscription History</h2>
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

                        {pagination.totalPages > 1 && (
                            <div className="flex flex-col gap-3 border-t border-border bg-muted/30 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                                <p className="text-sm text-muted-foreground">
                                    Page {pagination.page} of {pagination.totalPages}
                                </p>
                                <div className="flex gap-2">
                                    <button
                                        type="button"
                                        onClick={() => goToPage(pagination.page - 1)}
                                        disabled={pagination.page === 1}
                                        className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-background text-foreground hover:bg-accent disabled:cursor-not-allowed disabled:opacity-50"
                                        aria-label="Previous page"
                                    >
                                        <ChevronLeft className="h-4 w-4" />
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => goToPage(pagination.page + 1)}
                                        disabled={pagination.page === pagination.totalPages}
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
        </div>
    );
}
