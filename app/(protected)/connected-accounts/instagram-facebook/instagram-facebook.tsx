"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";
import { Spinner } from "@/components/ui/spinner";
import { invalidateAccountData } from "@/lib/client-data";
import { isSubscriptionRequiredError, parseApiErrorResponse } from "@/lib/client-errors";
import { config } from "@/util/config";

export default function InstagramCallback() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const code = searchParams.get('code');
    const error = searchParams.get('error');
    const errorReason = searchParams.get('error_reason');
    const errorDescription = searchParams.get('error_description');

    const [loading, setLoading] = useState<boolean>(true);
    const [apiError, setApiError] = useState<string | null>(null);
    const processedRef = useRef(false);

    useEffect(() => {
        const connectInstagram = async () => {
            // Prevent double-execution in Strict Mode
            if (processedRef.current) return;
            processedRef.current = true;

            if (error) {
                setLoading(false);
                return;
            }

            if (!code) {
                setApiError("No authorization code received.");
                setLoading(false);
                return;
            }

            try {
                const response = await fetch(`${config.backendUrl}auth/instagram-facebook`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    credentials: "include",
                    body: JSON.stringify({ code }),
                });

                if (!response.ok) {
                    await parseApiErrorResponse(response, "Failed to connect Instagram account");
                }

                invalidateAccountData();
            } catch (err) {
                console.error('Error during Instagram authorization:', err);
                if (isSubscriptionRequiredError(err)) {
                    router.push("/subscribe");
                    return;
                }
                setApiError(err instanceof Error ? err.message : 'An unexpected error occurred');
            } finally {
                setLoading(false);
            }
        };

        connectInstagram();
    }, [code, error]);

    // Error from URL query params (User cancelled, etc.)
    if (error) {
        const isUserCancelled = errorReason === 'user_denied' || errorDescription?.includes('user denied');
        return (
            <div className="space-y-6">
                <div className="border-b border-border pb-5">
                    <div className="flex items-center gap-3">
                        <Image
                            src="/instagram-logo.svg"
                            alt="Instagram"
                            width={32}
                            height={32}
                            className="h-8 w-8"
                        />
                        <h1 className="text-3xl font-bold tracking-tight text-foreground">
                            Link Instagram
                        </h1>
                    </div>
                </div>

                <div className="rounded-2xl border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-950/20 p-8 space-y-4">
                    <div className="flex items-start gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30 flex-shrink-0">
                            <svg className="h-6 w-6 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </div>
                        <div className="flex-1 space-y-2">
                            <h2 className="text-xl font-semibold text-foreground">
                                {isUserCancelled ? "Connection Cancelled" : "Connection Error 😞"}
                            </h2>
                            <p className="text-muted-foreground">
                                {isUserCancelled
                                    ? "You cancelled the Instagram connection request. No worries! You can try again whenever you're ready."
                                    : errorDescription || "There was an error connecting your Instagram account."}
                            </p>
                        </div>
                    </div>
                    <div className="flex justify-end pt-2">
                        <Link href="/connected-accounts">
                            <Button className="cursor-pointer text-white">Back to Connected Accounts</Button>
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    // Loading State
    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
                <Spinner />
                <p className="text-muted-foreground text-lg">Connecting your Instagram account...</p>
                <p className="text-sm text-muted-foreground/80">Please do not close this window.</p>
            </div>
        );
    }

    // API Error State
    if (apiError) {
        return (
            <div className="space-y-6">
                <div className="border-b border-border pb-5">
                    <div className="flex items-center gap-3">
                        <Image
                            src="/instagram-logo.svg"
                            alt="Instagram"
                            width={32}
                            height={32}
                            className="h-8 w-8"
                        />
                        <h1 className="text-3xl font-bold tracking-tight text-foreground">
                            Link Instagram
                        </h1>
                    </div>
                </div>

                <div className="rounded-2xl border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-950/20 p-8 space-y-4">
                    <div className="flex items-start gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30 flex-shrink-0">
                            <svg className="h-6 w-6 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                        </div>
                        <div className="flex-1 space-y-2">
                            <h2 className="text-xl font-semibold text-foreground">Connection Failed</h2>
                            <p className="text-muted-foreground">
                                We encountered an error while trying to connect your Instagram account.
                            </p>
                            <div className="text-sm text-red-600 dark:text-red-400 mt-2 font-mono bg-red-100 dark:bg-red-900/20 p-3 rounded-md break-all">
                                {apiError}
                            </div>
                        </div>
                    </div>
                    <div className="flex justify-end pt-2">
                        <Link href="/connected-accounts">
                            <Button className="cursor-pointer text-white">Back to Connected Accounts</Button>
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    // Success State
    return (
        <div className="space-y-6">
            <div className="border-b border-border pb-5">
                <div className="flex items-center gap-3">
                    <Image
                        src="/instagram-logo.svg"
                        alt="Instagram"
                        width={32}
                        height={32}
                        className="h-8 w-8"
                    />
                    <h1 className="text-3xl font-bold tracking-tight text-foreground">
                        Link Instagram
                    </h1>
                </div>
            </div>

            <div className="rounded-2xl border border-green-200 dark:border-green-900/50 bg-green-50 dark:bg-green-950/20 p-8 space-y-4">
                <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30 flex-shrink-0">
                        <svg className="h-6 w-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                    <div className="flex-1 space-y-2">
                        <h2 className="text-xl font-semibold text-foreground">Instagram Connected! 🎉</h2>
                        <p className="text-muted-foreground">
                            Your Instagram account has been successfully connected. You can now start scheduling and publishing posts.
                        </p>
                    </div>
                </div>
                <div className="flex justify-end pt-2">
                    <Link href="/connected-accounts">
                        <Button className="cursor-pointer bg-green-600 hover:bg-green-700 text-white">
                            Back to Connected Accounts
                        </Button>
                    </Link>
                </div>
            </div>
        </div>
    );
}
