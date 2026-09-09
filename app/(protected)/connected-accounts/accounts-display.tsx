"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import AccountCard from "./account-card";
import DeleteConfirmationModal from "@/app/components/delete-confirmation-modal";
import { apiFetch } from "@/util/backend-api";

interface ConnectedAccount {
    id: string;
    provider: string;
    account_id: string;
    account_name: string;
    account_username: string | null;
    profile_picture: string;
}

// Skeleton loader component
function AccountCardSkeleton() {
    return (
        <div className="rounded-xl border border-border bg-card p-3 sm:p-4 shadow-sm animate-pulse">
            <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-full bg-muted flex-shrink-0" />
                <div className="flex-1 space-y-2">
                    <div className="h-3 w-20 bg-muted rounded" />
                    <div className="h-4 w-32 bg-muted rounded" />
                    <div className="h-3 w-24 bg-muted rounded" />
                </div>
            </div>
        </div>
    );
}

// Get provider logo
const getPlatformLogo = (provider: string) => {
    const logoMap: Record<string, string> = {
        facebook: "/facebook-logo.svg",
        instagram: "/instagram-logo.svg",
        tiktok: "/tiktok-logo.png",
        linkedin: "/linkedin-logo.svg",
        youtube: "/youtube-logo.svg",
        pinterest: "/pinterest-logo.svg",
        twitter: "/twitter-logo.png",
        threads: "/threads-logo.png",
        bluesky: "/bluesky-logo.svg",
        "google-business-profile": "/google-my-business-logo.svg",
        google_business_profile: "/google-my-business-logo.svg",
    };
    return logoMap[provider.toLowerCase()] || "/default-logo.svg";
};
export default function AccountsDisplay() {
    const [accounts, setAccounts] = useState<ConnectedAccount[]>([]);
    const [allProviders, setAllProviders] = useState<string[]>([]);
    const [providerCounts, setProviderCounts] = useState<Record<string, number>>({});
    const [isLoading, setIsLoading] = useState(true);
    const [selectedFilter, setSelectedFilter] = useState<string>("all");
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [accountToDelete, setAccountToDelete] = useState<string | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    // Fetch connected accounts
    useEffect(() => {
        async function fetchAccounts() {
            try {
                setIsLoading(true);
                const path = selectedFilter === "all"
                    ? "connected-accounts"
                    : `connected-accounts?provider=${encodeURIComponent(selectedFilter)}`;

                const response = await apiFetch(path);
                if (response.ok) {
                    const data: ConnectedAccount[] = await response.json();
                    setAccounts(data);

                    // Update providers list only when fetching all accounts
                    if (selectedFilter === "all") {
                        const uniqueProviders = Array.from(new Set(data.map((acc) => acc.provider)));
                        setAllProviders(uniqueProviders);

                        // Calculate counts for each provider
                        const counts: Record<string, number> = {};
                        data.forEach((acc) => {
                            counts[acc.provider] = (counts[acc.provider] || 0) + 1;
                        });
                        setProviderCounts(counts);
                    }
                }
            } catch (error) {
                console.error("Failed to fetch connected accounts:", error);
            } finally {
                setIsLoading(false);
            }
        }

        fetchAccounts();
    }, [selectedFilter]);

    // Get unique providers for filter tags
    const providers = ["all", ...allProviders];

    // Handle delete button click - open confirmation modal
    const handleDeleteClick = (accountId: string) => {
        setAccountToDelete(accountId);
        setDeleteModalOpen(true);
    };

    // Handle confirmed deletion
    const handleConfirmDelete = async () => {
        if (!accountToDelete) return;

        try {
            setIsDeleting(true);
            const response = await apiFetch(`connected-accounts/${accountToDelete}`, {
                method: "DELETE",
            });

            if (response.ok) {
                // Remove from UI
                setAccounts(accounts.filter((acc) => acc.id !== accountToDelete));

                // Update provider counts if we're on "all" filter
                if (selectedFilter === "all") {
                    const deletedAccount = accounts.find((acc) => acc.id === accountToDelete);
                    if (deletedAccount) {
                        setProviderCounts((prev) => ({
                            ...prev,
                            [deletedAccount.provider]: (prev[deletedAccount.provider] || 1) - 1,
                        }));
                    }
                }

                // Close modal
                setDeleteModalOpen(false);
                setAccountToDelete(null);
            } else {
                console.error("Failed to delete account");
                // TODO: Show error toast
            }
        } catch (error) {
            console.error("Error deleting account:", error);
            // TODO: Show error toast
        } finally {
            setIsDeleting(false);
        }
    };

    // Handle modal close
    const handleCloseModal = () => {
        if (!isDeleting) {
            setDeleteModalOpen(false);
            setAccountToDelete(null);
        }
    };

    return (
        <div className="space-y-4 sm:space-y-6">
            {/* Filter Tags */}
            {allProviders.length > 0 && (
                <div className="flex flex-wrap gap-2">
                    {providers.map((provider) => (
                        <button
                            key={provider}
                            onClick={() => setSelectedFilter(provider)}
                            className={`inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full text-xs sm:text-sm font-medium transition-all cursor-pointer touch-manipulation ${selectedFilter === provider
                                ? "bg-primary text-white shadow-md"
                                : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground active:bg-muted/70"
                                }`}
                        >
                            {provider !== "all" && (
                                <Image
                                    src={getPlatformLogo(provider)}
                                    alt={provider}
                                    width={16}
                                    height={16}
                                    className="h-3.5 w-3.5 sm:h-4 sm:w-4"
                                />
                            )}
                            {provider === "all" && (
                                <svg
                                    className="h-3.5 w-3.5 sm:h-4 sm:w-4"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M4 6h16M4 12h16M4 18h16"
                                    />
                                </svg>
                            )}
                            <span>{provider.charAt(0).toUpperCase() + provider.slice(1)}</span>
                            {provider !== "all" && (
                                <span className="ml-0.5 px-1.5 py-0.5 rounded-full bg-background/20 text-[10px] sm:text-xs font-semibold">
                                    {providerCounts[provider] || 0}
                                </span>
                            )}
                        </button>
                    ))}
                </div>
            )}

            {/* Loading State */}
            {isLoading && (
                <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {[1, 2, 3, 4].map((i) => (
                        <AccountCardSkeleton key={i} />
                    ))}
                </div>
            )}

            {/* Connected Accounts Cards */}
            {!isLoading && accounts.length > 0 && (
                <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {accounts.map((account) => (
                        <AccountCard
                            key={account.account_id}
                            account={account}
                            onDelete={handleDeleteClick}
                        />
                    ))}
                </div>
            )}

            {/* Empty State */}
            {!isLoading && accounts.length === 0 && (
                <div className="rounded-2xl border border-dashed border-border bg-muted/30 p-8 sm:p-12 text-center">
                    <div className="mx-auto flex h-12 w-12 sm:h-16 sm:w-16 items-center justify-center rounded-full bg-blue-500/10">
                        <svg
                            className="h-6 w-6 sm:h-8 sm:w-8 text-blue-500"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
                            />
                        </svg>
                    </div>
                    <h3 className="mt-3 sm:mt-4 text-base sm:text-lg font-semibold text-foreground">
                        No accounts connected
                    </h3>
                    <p className="mt-1.5 sm:mt-2 text-xs sm:text-sm text-muted-foreground px-4">
                        Connect your social media accounts to start scheduling posts.
                    </p>
                </div>
            )}

            {/* No Results State */}
            {!isLoading &&
                selectedFilter !== "all" &&
                accounts.length === 0 && (
                    <div className="rounded-2xl border border-dashed border-border bg-muted/30 p-8 sm:p-12 text-center">
                        <div className="mx-auto flex h-12 w-12 sm:h-16 sm:w-16 items-center justify-center rounded-full bg-orange-500/10">
                            <svg
                                className="h-6 w-6 sm:h-8 sm:w-8 text-orange-500"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                                />
                            </svg>
                        </div>
                        <h3 className="mt-3 sm:mt-4 text-base sm:text-lg font-semibold text-foreground">
                            No {selectedFilter} accounts found
                        </h3>
                        <p className="mt-1.5 sm:mt-2 text-xs sm:text-sm text-muted-foreground px-4">
                            Try selecting a different filter or connect a new account.
                        </p>
                    </div>
                )}

            {/* Delete Confirmation Modal */}
            <DeleteConfirmationModal
                isOpen={deleteModalOpen}
                onClose={handleCloseModal}
                onConfirm={handleConfirmDelete}
                title="Delete Connected Account"
                description="Are you sure you want to disconnect this account? You will need to reconnect it to schedule posts to this account."
                isDeleting={isDeleting}
            />
        </div>
    );
}
