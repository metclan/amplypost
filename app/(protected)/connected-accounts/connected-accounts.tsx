"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
    ChevronDown,
    ExternalLink,
    Plus,
    RefreshCw,
    Shield,
    X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import {
    connectFacebook,
    connectInstagram,
    connectInstagramUsingFacebook,
    connectGoogleBusinessProfile,
    connectLinkedIn,
    connectPinterest,
    connectThread,
    connectTiktok,
    connectYouTube,
    connectX,
} from "@/util/social-connect";
import DeleteConfirmationModal from "@/app/components/delete-confirmation-modal";
import ConnectConfirmationModal from "@/app/components/connect-confirmation-modal";
import InstagramConnectionModal from "@/app/components/instagram-connection-modal";
import { toast } from "sonner";
import { useCachedResource } from "@/lib/client-cache";
import { SubscriptionRequiredError, parseApiErrorResponse } from "@/lib/client-errors";
import {
    ACCOUNTS_CACHE_KEY,
    CACHE_TTL,
    fetchAccounts,
    getPlatformLogo,
    invalidateAccountData,
    type ConnectedAccount,
} from "@/lib/client-data";
import { backendApiUrl } from "@/util/backend-api";

type Platform = {
    id: string;
    name: string;
    logo: string;
    description: string;
    onClick: () => void | Promise<void>;
};

const AccountRowSkeleton = () => (
    <div className="grid animate-pulse grid-cols-1 gap-4 border-t border-border px-4 py-3 md:grid-cols-[2.6fr_0.6fr_1fr] md:items-center">
        <div className="h-10 rounded-md bg-muted" />
        <div className="h-8 w-8 rounded-md bg-muted" />
        <div className="h-10 rounded-md bg-muted" />
    </div>
);

function accountNeedsAttention(account: ConnectedAccount) {
    return !account.isActive || account.accessTokenExpired || account.refreshTokenExpired;
}

function normalizeProviderId(provider: string) {
    return provider.trim().toLowerCase().replaceAll("_", "-");
}

export default function ConnectedAccounts() {
    const router = useRouter();
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [facebookModalOpen, setFacebookModalOpen] = useState(false);
    const [instagramModalOpen, setInstagramModalOpen] = useState(false);
    const [blueskyModalOpen, setBlueskyModalOpen] = useState(false);
    const [accountToDelete, setAccountToDelete] = useState<string | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [loadingPlatform, setLoadingPlatform] = useState<string | null>(null);
    const [blueskyIdentifier, setBlueskyIdentifier] = useState("");
    const [blueskyPassword, setBlueskyPassword] = useState("");
    const [isConnectingBluesky, setIsConnectingBluesky] = useState(false);
    const {
        data: accounts = [],
        error: accountsError,
        isLoading,
        refetch: refetchAccounts,
    } = useCachedResource(ACCOUNTS_CACHE_KEY, fetchAccounts, { ttl: CACHE_TTL });

    useEffect(() => {
        void refetchAccounts().catch((error) => {
            console.error("Failed to refresh connected accounts:", error);
        });
    }, [refetchAccounts]);

    const platforms: Platform[] = useMemo(
        () => [
            {
                id: "instagram",
                name: "Instagram",
                logo: "/instagram-logo.svg",
                description: "Connect your Instagram account to publish posts, reels and stories.",
                onClick: () => setInstagramModalOpen(true),
            },
            {
                id: "facebook",
                name: "Facebook",
                logo: "/facebook-logo.svg",
                description: "Connect your Facebook Page to schedule and publish content.",
                onClick: () => setFacebookModalOpen(true),
            },
            {
                id: "tiktok",
                name: "TikTok",
                logo: "/tiktok-logo.png",
                description: "Connect your TikTok account to create and schedule videos.",
                onClick: connectTiktok,
            },
            {
                id: "threads",
                name: "Threads",
                logo: "/threads-logo.png",
                description: "Connect your Threads account to share short updates.",
                onClick: connectThread,
            },
            {
                id: "linkedin",
                name: "LinkedIn",
                logo: "/linkedin-logo.svg",
                description: "Connect your LinkedIn profile or page to share professional content.",
                onClick: connectLinkedIn,
            },
            {
                id: "youtube",
                name: "YouTube",
                logo: "/youtube-logo.svg",
                description: "Connect your YouTube channel to manage shorts and videos.",
                onClick: connectYouTube,
            },
            {
                id: "google-business-profile",
                name: "Google Business Profile",
                logo: "/google-my-business-logo.svg",
                description: "Connect your Google Business Profile to publish business updates.",
                onClick: connectGoogleBusinessProfile,
            },
            {
                id: "pinterest",
                name: "Pinterest",
                logo: "/pinterest-logo.svg",
                description: "Connect your Pinterest account to schedule Pins and board content.",
                onClick: connectPinterest,
            },
            {
                id: "bluesky",
                name: "Bluesky",
                logo: "/bluesky-logo.svg",
                description: "Connect your Bluesky account with an app password to schedule posts.",
                onClick: () => setBlueskyModalOpen(true),
            },
            {
                id: "x",
                name: "X (Twitter)",
                logo: "/twitter-logo.png",
                description: "Connect your X account to publish tweets and updates.",
                onClick: connectX,
            },
        ],
        []
    );

    const handleConnectBluesky = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        const identifier = blueskyIdentifier.trim().replace(/^@/, "");
        const password = blueskyPassword.trim();

        if (!identifier || !password) {
            toast.error("Enter your Bluesky handle and app password.");
            return;
        }

        setIsConnectingBluesky(true);
        try {
            const response = await fetch(backendApiUrl("accounts/bluesky/connect"), {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                credentials: "include",
                body: JSON.stringify({
                    identifier,
                    password,
                    service: "https://bsky.social",
                }),
            });

            if (!response.ok) {
                await parseApiErrorResponse(response, "Failed to connect Bluesky account.");
            }

            const data = await response.json().catch(() => null);
            toast.success(data?.message || "Bluesky account connected.");
            setBlueskyIdentifier("");
            setBlueskyPassword("");
            setBlueskyModalOpen(false);
            invalidateAccountData();
            await refetchAccounts();
        } catch (error) {
            console.error("Failed to connect Bluesky account:", error);
            if (error instanceof SubscriptionRequiredError) {
                toast.error(error.message);
                router.push("/subscribe");
                return;
            }
            toast.error(error instanceof Error ? error.message : "Failed to connect Bluesky account.");
        } finally {
            setIsConnectingBluesky(false);
            setLoadingPlatform(null);
        }
    };

    const handlePlatformClick = async (platformId: string, onClick: () => void | Promise<void>) => {
        setLoadingPlatform(platformId);
        try {
            await Promise.resolve(onClick());
        } finally {
            // For callbacks that don't navigate away (e.g. toast), avoid stuck loading state.
            setTimeout(() => setLoadingPlatform(null), 450);
        }
    };

    const handleDeleteClick = (accountId: string) => {
        setAccountToDelete(accountId);
        setDeleteModalOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (!accountToDelete) return;

        try {
            setIsDeleting(true);

            const response = await fetch(backendApiUrl(`accounts/${accountToDelete}`), {
                method: "DELETE",
                credentials: "include",
            });

            const data = await response.json().catch(() => null);

            if (!response.ok) {
                throw new Error(data?.message || data?.error || "Failed to disconnect account.");
            }

            invalidateAccountData();
            await refetchAccounts();
            toast.success(data?.message || "Account disconnected.");
            setDeleteModalOpen(false);
            setAccountToDelete(null);
        } catch (error) {
            console.error("Failed to disconnect account:", error);
            toast.error(error instanceof Error ? error.message : "Failed to disconnect account.");
        } finally {
            setIsDeleting(false);
        }
    };

    const handleCloseModal = () => {
        if (!isDeleting) {
            setDeleteModalOpen(false);
            setAccountToDelete(null);
        }
    };

    const totalConnected = accounts.length;
    return (
        <div className="space-y-6 text-foreground">
            <div className="flex flex-col justify-between gap-4 border-b border-border pb-5 md:flex-row md:items-end">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-foreground">Connected Accounts</h1>
                    <p className="mt-2 text-sm text-muted-foreground">
                        Connect your social media accounts to create, schedule and publish content across
                        platforms.
                    </p>
                </div>
            </div>

            <section className="space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                        <h2 className="text-xl font-semibold">Connected Accounts</h2>
                        <span className="rounded-full bg-primary/10 px-3 py-0.5 text-sm font-medium text-primary">
                            {totalConnected}
                        </span>
                    </div>
                    <button className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-border bg-card px-4 py-2 text-sm text-foreground shadow-sm hover:bg-muted">
                        Sort by: Recently Added
                        <ChevronDown className="h-4 w-4" />
                    </button>
                </div>

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

                <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
                    {isLoading ? (
                        <div className="divide-y divide-border">
                            {Array.from({ length: 4 }).map((_, idx) => (
                                <AccountRowSkeleton key={idx} />
                            ))}
                        </div>
                    ) : accounts.length === 0 ? (
                        <div className="px-4 py-8 text-center text-sm text-muted-foreground">
                            No connected accounts yet.
                        </div>
                    ) : (
                        accounts.map((account) => {
                            const provider = normalizeProviderId(account.provider);
                            const platform = platforms.find((p) => p.id === provider);
                            const providerLogo = platform?.logo || getPlatformLogo(provider);
                            const needsAttention = accountNeedsAttention(account);

                            return (
                                <div
                                    key={account.id}
                                    className="grid grid-cols-1 gap-4 border-t border-border px-4 py-3 first:border-t-0 md:grid-cols-[2.4fr_0.5fr_1.6fr] md:items-center"
                                >
                                    <div className="flex min-w-0 items-center gap-3">
                                        <div className="relative h-12 w-12 overflow-hidden rounded-full ring-1 ring-border">
                                            <Image
                                                src={account.profile_picture}
                                                alt={account.account_name}
                                                unoptimized
                                                referrerPolicy="no-referrer"
                                                width={48}
                                                height={48}
                                                className="h-full w-full object-cover"
                                            />
                                        </div>
                                        <div className="min-w-0">
                                            <p className="truncate text-base font-semibold">{account.account_name}</p>
                                            <p className="truncate text-xs text-muted-foreground">
                                                {account.account_username
                                                    ? `@${account.account_username}`
                                                    : account.account_id}
                                            </p>
                                            {account.scopes.length > 0 && (
                                                <p className="mt-1 truncate text-[11px] text-muted-foreground">
                                                    {account.scopes.join(", ")}
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex items-center md:justify-center">
                                        <div className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-border bg-muted/40">
                                            <Image
                                                src={providerLogo}
                                                alt={account.provider}
                                                width={18}
                                                height={18}
                                                className="h-[18px] w-[18px]"
                                            />
                                        </div>
                                    </div>

                                    <div className="flex flex-wrap items-center gap-2 md:justify-end">
                                        <span
                                            className={[
                                                "rounded-full px-2.5 py-1 text-xs font-medium",
                                                !needsAttention
                                                    ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-200"
                                                    : "bg-amber-500/15 text-amber-700 dark:text-amber-200",
                                            ].join(" ")}
                                        >
                                            {!needsAttention ? "Active" : "Needs attention"}
                                        </span>
                                        {needsAttention && platform && (
                                            <Button
                                                type="button"
                                                variant="outline"
                                                onClick={() => handlePlatformClick(platform.id, platform.onClick)}
                                                disabled={loadingPlatform !== null || isDeleting}
                                                className="cursor-pointer border-amber-400/45 bg-amber-500/15 text-amber-700 hover:bg-amber-500/25 disabled:opacity-55 dark:text-amber-100"
                                            >
                                                {loadingPlatform === platform.id ? (
                                                    <>
                                                        <RefreshCw className="h-4 w-4 animate-spin" />
                                                        Reconnecting...
                                                    </>
                                                ) : (
                                                    <>
                                                        <RefreshCw className="h-4 w-4" />
                                                        Reconnect
                                                    </>
                                                )}
                                            </Button>
                                        )}
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={() => handleDeleteClick(account.id)}
                                            disabled={isDeleting}
                                            className="cursor-pointer border-red-500/50 bg-red-600 text-white hover:bg-red-500"
                                        >
                                            Disconnect
                                        </Button>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </section>

            <section className="space-y-3">
                <div className="flex items-center gap-3">
                    <h2 className="text-xl font-semibold">Available Platforms</h2>
                    <span className="rounded-full bg-primary/10 px-3 py-0.5 text-sm font-medium text-primary">
                        {platforms.length}
                    </span>
                </div>

                <div className="grid grid-cols-[repeat(auto-fit,minmax(230px,1fr))] gap-3">
                    {platforms.map((platform) => (
                        <div
                            key={platform.id}
                            className="flex min-h-[205px] flex-col rounded-xl border border-border bg-card p-4 shadow-sm"
                        >
                            <div className="mb-3 flex items-center gap-3">
                                <Image src={platform.logo} alt={platform.name} width={34} height={34} className="h-[34px] w-[34px]" />
                                <h3 className="text-lg font-semibold">{platform.name}</h3>
                            </div>
                            <p className="text-sm leading-6 text-muted-foreground">{platform.description}</p>
                            <Button
                                onClick={() => handlePlatformClick(platform.id, platform.onClick)}
                                disabled={loadingPlatform !== null}
                                className="mt-auto h-11 w-full cursor-pointer bg-violet-600 px-4 text-sm font-semibold text-white hover:bg-violet-500 disabled:opacity-55"
                            >
                                {loadingPlatform === platform.id ? (
                                    <>
                                        <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                                        Connecting...
                                    </>
                                ) : (
                                    <>
                                        <Plus className="mr-2 h-4 w-4" />
                                        Connect
                                    </>
                                )}
                            </Button>
                        </div>
                    ))}
                </div>
            </section>

            <section className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-border bg-card p-4 shadow-sm">
                <div className="flex items-center gap-4">
                    <div className="rounded-2xl bg-primary/10 p-4 ring-1 ring-primary/20">
                        <Shield className="h-8 w-8 text-primary" />
                    </div>
                    <div>
                        <h3 className="text-xl font-semibold">Your data is secure</h3>
                        <p className="max-w-2xl text-sm text-muted-foreground">
                            We use industry-standard encryption to keep your account connections safe and
                            private. We never post without your permission.
                        </p>
                    </div>
                </div>
                <Link href="/privacy" className="cursor-pointer text-base font-medium text-primary hover:text-primary/80">
                    Learn more about security
                </Link>
            </section>

            <DeleteConfirmationModal
                isOpen={deleteModalOpen}
                onClose={handleCloseModal}
                onConfirm={handleConfirmDelete}
                title="Delete Connected Account"
                description="Are you sure you want to disconnect this account? You will need to reconnect it to schedule posts to this account."
                isDeleting={isDeleting}
            />

            <ConnectConfirmationModal
                isOpen={facebookModalOpen}
                onClose={() => {
                    setFacebookModalOpen(false);
                    setLoadingPlatform(null);
                }}
                onConfirm={() => {
                    setFacebookModalOpen(false);
                    connectFacebook();
                }}
                title="Connect Facebook Page"
                description={
                    <div className="space-y-2">
                        <p className="font-medium text-foreground">Must be a Page</p>
                        <p>
                            Amplypost only supports connecting Facebook Pages. Personal profiles and
                            Groups are not supported.
                        </p>
                    </div>
                }
                icon="/facebook-logo.svg"
            />

            <InstagramConnectionModal
                isOpen={instagramModalOpen}
                onClose={() => {
                    setInstagramModalOpen(false);
                    setLoadingPlatform(null);
                }}
                onConnectInstagram={() => {
                    setInstagramModalOpen(false);
                    connectInstagram();
                }}
                onConnectFacebook={() => {
                    setInstagramModalOpen(false);
                    connectInstagramUsingFacebook();
                }}
            />

            {blueskyModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
                    <div className="w-full max-w-lg rounded-2xl border border-border bg-card shadow-2xl">
                        <div className="flex items-center justify-between border-b border-border px-6 py-4">
                            <div className="flex items-center gap-3">
                                <Image
                                    src="/bluesky-logo.svg"
                                    alt="Bluesky"
                                    width={32}
                                    height={32}
                                    className="h-8 w-8"
                                />
                                <h2 className="text-xl font-semibold text-foreground">Connect Bluesky</h2>
                            </div>
                            <button
                                type="button"
                                onClick={() => {
                                    setBlueskyModalOpen(false);
                                    setLoadingPlatform(null);
                                }}
                                disabled={isConnectingBluesky}
                                className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <form onSubmit={handleConnectBluesky} className="space-y-5 px-6 py-5">
                            <div className="space-y-2">
                                <label htmlFor="bluesky-identifier" className="text-sm font-medium text-foreground">
                                    Bluesky handle
                                </label>
                                <Input
                                    id="bluesky-identifier"
                                    value={blueskyIdentifier}
                                    onChange={(event) => setBlueskyIdentifier(event.target.value)}
                                    placeholder="username.bsky.social"
                                    autoComplete="username"
                                    className="bg-background"
                                />
                            </div>

                            <div className="space-y-2">
                                <div className="flex flex-wrap items-center justify-between gap-2">
                                    <label htmlFor="bluesky-password" className="text-sm font-medium text-foreground">
                                        App password
                                    </label>
                                    <a
                                        href="https://bsky.app/settings/app-passwords"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-1 text-xs font-medium text-sky-600 hover:text-sky-500 dark:text-sky-300 dark:hover:text-sky-200"
                                    >
                                        Generate app password
                                        <ExternalLink className="h-3.5 w-3.5" />
                                    </a>
                                </div>
                                <Input
                                    id="bluesky-password"
                                    type="password"
                                    value={blueskyPassword}
                                    onChange={(event) => setBlueskyPassword(event.target.value)}
                                    placeholder="xxxx-xxxx-xxxx-xxxx"
                                    autoComplete="off"
                                    className="bg-background"
                                />
                            </div>

                            <div className="rounded-xl border border-sky-400/20 bg-sky-400/10 p-3 text-sm leading-6 text-sky-800 dark:text-sky-50/85">
                                Use an app password from Bluesky settings, not your main account password.
                            </div>

                            <div className="flex justify-end gap-3 border-t border-border pt-5">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => {
                                        setBlueskyModalOpen(false);
                                        setLoadingPlatform(null);
                                    }}
                                    disabled={isConnectingBluesky}
                                    className="border-border bg-background text-foreground hover:bg-muted"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={isConnectingBluesky}
                                    className="bg-violet-600 text-white hover:bg-violet-500"
                                >
                                    {isConnectingBluesky ? (
                                        <>
                                            <RefreshCw className="h-4 w-4 animate-spin" />
                                            Connecting...
                                        </>
                                    ) : (
                                        "Connect Bluesky"
                                    )}
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
