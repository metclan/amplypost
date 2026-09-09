"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { AlertCircle, ArrowRight, CheckCircle2, CreditCard, Loader2, Mail } from "lucide-react";
import { invalidateCachedResource } from "@/lib/client-cache";
import { apiFetch } from "@/util/backend-api";

type Subscription = {
    status?: string;
    hasAccess?: boolean;
};

type PageState = "loading" | "success" | "pending" | "failed";

const POLL_ATTEMPTS = 10;
const POLL_INTERVAL_MS = 2_000;
const FAILED_RETURN_STATUSES = new Set(["failed", "cancelled", "canceled"]);

function wait(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchCurrentSubscription() {
    const response = await apiFetch("billing/subscriptions/current", {
        cache: "no-store",
    });

    if (!response.ok) {
        throw new Error("Unable to confirm your subscription right now.");
    }

    const json = (await response.json().catch(() => null)) as { data?: Subscription | null } | null;
    return json?.data ?? null;
}

async function waitForSubscription(signal: AbortSignal) {
    for (let attempt = 0; attempt < POLL_ATTEMPTS; attempt += 1) {
        if (signal.aborted) return null;

        const subscription = await fetchCurrentSubscription();
        if (subscription?.hasAccess) {
            return subscription;
        }

        if (attempt < POLL_ATTEMPTS - 1) {
            await wait(POLL_INTERVAL_MS);
        }
    }

    return null;
}

export function PaymentStatus() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const statusParam = searchParams.get("status")?.toLowerCase() ?? "";
    const subscriptionId = searchParams.get("subscription_id");
    const email = searchParams.get("email");
    const abortControllerRef = useRef<AbortController | null>(null);
    const redirectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const [pageState, setPageState] = useState<PageState>("loading");
    const [isCheckingAgain, setIsCheckingAgain] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const confirmSubscription = useCallback(async (isManualRetry = false) => {
        abortControllerRef.current?.abort();
        const controller = new AbortController();
        abortControllerRef.current = controller;

        setPageState("loading");
        setErrorMessage(null);
        setIsCheckingAgain(isManualRetry);

        try {
            const subscription = await waitForSubscription(controller.signal);
            if (controller.signal.aborted) return;

            if (subscription?.hasAccess) {
                invalidateCachedResource("billing:");
                setPageState("success");
                redirectTimeoutRef.current = setTimeout(() => {
                    router.push("/dashboard");
                }, 1_500);
                return;
            }

            if (FAILED_RETURN_STATUSES.has(statusParam)) {
                setPageState("failed");
                return;
            }

            setPageState("pending");
        } catch (error) {
            if (controller.signal.aborted) return;

            setErrorMessage(error instanceof Error ? error.message : "Unable to confirm your subscription right now.");
            setPageState(FAILED_RETURN_STATUSES.has(statusParam) ? "failed" : "pending");
        } finally {
            if (!controller.signal.aborted) {
                setIsCheckingAgain(false);
            }
        }
    }, [router, statusParam]);

    useEffect(() => {
        void confirmSubscription();

        return () => {
            abortControllerRef.current?.abort();
            if (redirectTimeoutRef.current) {
                clearTimeout(redirectTimeoutRef.current);
            }
        };
    }, [confirmSubscription]);

    const content = {
        loading: {
            icon: <Loader2 className="h-12 w-12 animate-spin text-primary" />,
            bg: "bg-primary/10",
            title: "Confirming your subscription...",
            description: "We are checking your subscription with the backend before unlocking your account.",
        },
        success: {
            icon: <CheckCircle2 className="h-12 w-12 text-green-600" />,
            bg: "bg-green-500/10",
            title: "Your subscription is active",
            description: "You are all set. Taking you to your dashboard now.",
        },
        pending: {
            icon: <Loader2 className="h-12 w-12 animate-spin text-blue-600" />,
            bg: "bg-blue-500/10",
            title: "We’re still confirming your payment. This can take a moment.",
            description: errorMessage ?? "Payment processors can take a little time to finish syncing the subscription.",
        },
        failed: {
            icon: <AlertCircle className="h-12 w-12 text-red-600" />,
            bg: "bg-red-500/10",
            title: "We couldn’t confirm this subscription.",
            description: errorMessage ?? "The backend has not confirmed access for this subscription.",
        },
    }[pageState];

    return (
        <div className="flex min-h-[80vh] items-center justify-center p-4">
            <div className="w-full max-w-md rounded-xl border border-border bg-card p-6 text-center shadow-sm sm:p-8">
                <div className="mb-6 flex justify-center">
                    <div className={`rounded-full p-4 ${content.bg}`}>
                        {content.icon}
                    </div>
                </div>

                <h1 className="mb-3 text-2xl font-bold text-foreground">{content.title}</h1>
                <p className="mb-6 text-sm leading-relaxed text-muted-foreground sm:text-base">
                    {content.description}
                </p>

                {(subscriptionId || email || statusParam) && (
                    <div className="mb-6 rounded-lg border border-border bg-muted/30 p-3 text-left text-xs text-muted-foreground">
                        {subscriptionId && <p className="truncate">Subscription: {subscriptionId}</p>}
                        {email && <p className="truncate">Email: {email}</p>}
                        {statusParam && <p className="truncate">Return status: {statusParam}</p>}
                    </div>
                )}

                {pageState === "pending" && (
                    <div className="space-y-3">
                        <button
                            type="button"
                            onClick={() => confirmSubscription(true)}
                            disabled={isCheckingAgain}
                            className="inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {isCheckingAgain ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-4 w-4" />}
                            Check again
                        </button>
                        <Link
                            href="/billing"
                            className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-border bg-background px-4 py-3 text-sm font-semibold text-foreground transition hover:bg-muted"
                        >
                            <CreditCard className="h-4 w-4" />
                            Go to billing
                        </Link>
                    </div>
                )}

                {pageState === "failed" && (
                    <div className="space-y-3">
                        <Link
                            href="/billing"
                            className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90"
                        >
                            <CreditCard className="h-4 w-4" />
                            Try again
                        </Link>
                        <Link
                            href="/support"
                            className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-border bg-background px-4 py-3 text-sm font-semibold text-foreground transition hover:bg-muted"
                        >
                            <Mail className="h-4 w-4" />
                            Contact support
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
}
