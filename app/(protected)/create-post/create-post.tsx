"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { X } from "lucide-react";

import { useCachedResource } from "@/lib/client-cache";
import { SubscriptionRequiredError } from "@/lib/client-errors";
import { ACCOUNTS_CACHE_KEY, CACHE_TTL } from "@/lib/client-data";
import { accountBelongsToWorkspace } from "@/lib/workspaces";
import { useWorkspace } from "@/app/components/workspace-provider";
import { fetchConnectedAccounts } from "./accounts";
import ShortVideoClient from "./short-video/client";
import { Button } from "@/components/ui/button";
import { useState } from "react";

export default function CreatePost() {
    const router = useRouter();
    const { selectedWorkspace } = useWorkspace();
    const [isNoAccountsPromptOpen, setIsNoAccountsPromptOpen] = useState(true);
    const {
        data: allAccounts = [],
        isLoading: isLoadingAccounts,
        error: accountsError,
    } = useCachedResource(ACCOUNTS_CACHE_KEY, fetchConnectedAccounts, { ttl: CACHE_TTL });
    const accounts = allAccounts.filter((account) =>
        accountBelongsToWorkspace(account.id, selectedWorkspace),
    );

    return (
        <div className="relative space-y-6 text-foreground">
            {accountsError instanceof SubscriptionRequiredError && (
                <div className="rounded-xl border border-amber-500/25 bg-amber-500/10 p-4 text-sm text-amber-700 dark:text-amber-200">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                        <span>{accountsError.message}</span>
                        <Button
                            type="button"
                            size="sm"
                            onClick={() => router.push("/subscribe")}
                            className="bg-violet-600 text-white hover:bg-violet-500"
                        >
                            View plans
                        </Button>
                    </div>
                </div>
            )}

            {accountsError && !(accountsError instanceof SubscriptionRequiredError) && (
                <div className="rounded-xl border border-red-500/25 bg-red-500/10 p-4 text-sm text-red-600 dark:text-red-200">
                    {accountsError.message}
                </div>
            )}

            {!accountsError && !isLoadingAccounts && accounts.length === 0 && isNoAccountsPromptOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-md">
                    <div className="w-full max-w-md rounded-2xl border border-border bg-card p-8 text-center shadow-xl">
                        <button
                            type="button"
                            onClick={() => setIsNoAccountsPromptOpen(false)}
                            className="ml-auto flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                            aria-label="Close account connection prompt"
                        >
                            <X className="h-5 w-5" />
                        </button>
                        <div className="space-y-3">
                            <h2 className="text-2xl font-bold text-foreground">Connect Your Accounts</h2>
                            <p className="mt-2 text-muted-foreground">
                                {selectedWorkspace
                                    ? `Add at least one social media account to ${selectedWorkspace.name} to start creating and scheduling posts.`
                                    : "You need to connect at least one social media account to start creating and scheduling posts."}
                            </p>
                        </div>
                        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                            <Button asChild className="h-11 flex-1 bg-violet-600 text-white hover:bg-violet-500 [&_*]:text-white">
                                <Link href="/connected-accounts">Connect account</Link>
                            </Button>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setIsNoAccountsPromptOpen(false)}
                                className="h-11 flex-1"
                            >
                                Not now
                            </Button>
                        </div>
                    </div>
                </div>
            )}
            
            <ShortVideoClient />
        </div>
    );
}
