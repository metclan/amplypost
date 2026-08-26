"use client";

import Link from "next/link";
import Image from "next/image";

interface ConnectedAccount {
    id: string;
    provider: string;
    account_id: string;
    account_name: string;
    account_username: string | null;
    profile_picture: string;
}

interface MediaAccountsProps {
    accounts: ConnectedAccount[];
    isLoadingAccounts: boolean;
    selectedAccounts: string[];
    onToggleAccount: (accountId: string) => void;
    onSelectAll?: (accountIds: string[]) => void;
    onDeselectAll?: () => void;
    onRetryFetchAccounts?: () => void;
    renderAccountConfig?: (accountId: string, provider: string) => React.ReactNode;
    showPlatformLogoOnly?: boolean;
    maxVisibleAccounts?: number;
    disabledAccountIds?: string[];
    getDisabledReason?: (account: ConnectedAccount) => string | undefined;
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

// Get provider color
const getProviderColor = (provider: string) => {
    const colorMap: Record<string, string> = {
        facebook: "from-blue-500 to-blue-600",
        instagram: "from-pink-500 via-purple-500 to-orange-500",
        tiktok: "from-black to-gray-800",
        linkedin: "from-blue-600 to-blue-700",
        youtube: "from-red-500 to-red-600",
        twitter: "from-sky-400 to-sky-500",
        threads: "from-sky-400 to-sky-500",
        bluesky: "from-sky-400 to-blue-500",
        "google-business-profile": "from-blue-500 to-emerald-500",
        google_business_profile: "from-blue-500 to-emerald-500",
    };
    return colorMap[provider.toLowerCase()] || "from-gray-500 to-gray-600";
};

const getProviderLabel = (provider: string) => {
    const labelMap: Record<string, string> = {
        facebook: "Facebook",
        instagram: "Instagram",
        tiktok: "TikTok",
        linkedin: "LinkedIn",
        youtube: "YouTube",
        twitter: "X (Twitter)",
        threads: "Threads",
        bluesky: "Bluesky",
        "google-business-profile": "Google Business Profile",
        google_business_profile: "Google Business Profile",
    };

    return labelMap[provider.toLowerCase()] || provider;
};

export default function MediaAccounts({
    accounts,
    isLoadingAccounts,
    selectedAccounts,
    onToggleAccount,
    onSelectAll,
    onDeselectAll,
    onRetryFetchAccounts,
    renderAccountConfig,
    showPlatformLogoOnly = false,
    maxVisibleAccounts,
    disabledAccountIds = [],
    getDisabledReason,
}: MediaAccountsProps) {
    const selectableAccounts = accounts.filter((account) => !disabledAccountIds.includes(account.id));
    // Check if all accounts are selected
    const allSelected = selectableAccounts.length > 0 && selectableAccounts.every((account) => selectedAccounts.includes(account.id));
    const someSelected = selectedAccounts.length > 0 && selectedAccounts.length < accounts.length;

    // Handle select all toggle
    const handleSelectAllToggle = () => {
        if (allSelected) {
            // Deselect all
            if (onDeselectAll) {
                onDeselectAll();
            } else {
                // Fallback: toggle each account individually
                selectableAccounts.forEach(account => {
                    if (selectedAccounts.includes(account.id)) {
                        onToggleAccount(account.id);
                    }
                });
            }
        } else {
            // Select all
            if (onSelectAll) {
                onSelectAll(selectableAccounts.map(a => a.id));
            } else {
                // Fallback: toggle each account individually
                selectableAccounts.forEach(account => {
                    if (!selectedAccounts.includes(account.id)) {
                        onToggleAccount(account.id);
                    }
                });
            }
        }
    };

    const listMaxHeightStyle = maxVisibleAccounts
        ? { maxHeight: `${maxVisibleAccounts * 86}px` }
        : undefined;

    return (
        <div className="rounded-2xl border border-border bg-card p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                <div className="flex items-center gap-2">
                    <h2 className="text-lg font-semibold text-foreground">
                        Select Accounts
                    </h2>
                    {selectedAccounts.length > 0 && (
                        <span className="inline-flex items-center justify-center bg-muted px-2 py-0.5 rounded-full text-xs font-medium text-muted-foreground">
                            {selectedAccounts.length} selected
                        </span>
                    )}
                </div>

                {/* Select All Checkbox */}
                {!isLoadingAccounts && accounts.length > 0 && (
                    <button
                        onClick={handleSelectAllToggle}
                        className="self-start sm:self-auto flex items-center gap-2 px-2.5 py-1.5 rounded-md border border-border hover:bg-muted transition-colors text-xs font-medium text-foreground cursor-pointer"
                    >
                        <div
                            className={`flex-shrink-0 h-3.5 w-3.5 rounded border-[1.5px] flex items-center justify-center transition-colors ${allSelected
                                ? "border-primary bg-primary"
                                : someSelected
                                    ? "border-primary bg-primary"
                                    : "border-muted-foreground"
                                }`}
                        >
                            {allSelected && (
                                <svg
                                    className="h-2.5 w-2.5 text-primary-foreground"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={3}
                                        d="M5 13l4 4L19 7"
                                    />
                                </svg>
                            )}
                            {someSelected && (
                                <svg
                                    className="h-2.5 w-2.5 text-primary-foreground"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={3}
                                        d="M5 12h14"
                                    />
                                </svg>
                            )}
                        </div>
                        <span>{allSelected ? "Deselect All" : "Select All"}</span>
                    </button>
                )}
            </div>

            {/* Loading State */}
            {isLoadingAccounts && (
                <div className="space-y-3">
                    {[1, 2].map((i) => (
                        <div key={i} className="rounded-lg border border-border bg-muted/30 p-3 animate-pulse">
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-full bg-muted" />
                                <div className="flex-1 space-y-2">
                                    <div className="h-3 w-24 bg-muted rounded" />
                                    <div className="h-2 w-32 bg-muted rounded" />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Accounts List */}
            {!isLoadingAccounts && accounts.length > 0 && (
                <div
                    className={`space-y-4 ${maxVisibleAccounts ? "overflow-y-auto pr-1" : ""}`}
                    style={listMaxHeightStyle}
                >
                    {accounts.map((account) => {
                        const isSelected = selectedAccounts.includes(account.id);
                        const isDisabled = disabledAccountIds.includes(account.id);
                        const disabledReason = getDisabledReason?.(account);
                        const accountPrimaryText = account.account_username
                            ? `@${account.account_username}`
                            : account.account_name;

                        return (
                            <div
                                key={account.id}
                                className={`w-full rounded-lg border transition-all ${isSelected
                                    ? "border-primary bg-primary/5 shadow-sm"
                                    : isDisabled
                                    ? "border-border bg-background opacity-55"
                                    : "border-border bg-background hover:border-primary/50"
                                    }`}
                            >
                                {/* Header / Selection Area */}
                                <div
                                    onClick={() => {
                                        if (!isDisabled) {
                                            onToggleAccount(account.id);
                                        }
                                    }}
                                    title={disabledReason}
                                    className={`flex items-center gap-3 p-3 ${isDisabled ? "cursor-not-allowed" : "cursor-pointer"}`}
                                >
                                    {/* Checkbox */}
                                    <div
                                        className={`flex-shrink-0 h-5 w-5 rounded border-2 flex items-center justify-center transition-colors ${isSelected
                                            ? "border-primary bg-primary"
                                            : "border-muted-foreground"
                                            }`}
                                    >
                                        {isSelected && (
                                            <svg
                                                className="h-3 w-3 text-primary-foreground"
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={3}
                                                    d="M5 13l4 4L19 7"
                                                />
                                            </svg>
                                        )}
                                    </div>

                                    <div className="relative flex-shrink-0">
                                        <div
                                            className={`h-10 w-10 rounded-full bg-gradient-to-br ${getProviderColor(
                                                account.provider
                                            )} p-0.5`}
                                        >
                                            <div className="h-full w-full rounded-full bg-card p-0.5">
                                                <Image
                                                    src={account.profile_picture}
                                                    alt={account.account_name}
                                                    unoptimized
                                                    referrerPolicy="no-referrer"
                                                    width={40}
                                                    height={40}
                                                    className="h-full w-full rounded-full object-cover"
                                                />
                                            </div>
                                        </div>
                                        <span className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-md border border-border bg-card">
                                            <Image
                                                src={getPlatformLogo(account.provider)}
                                                alt={account.provider}
                                                width={14}
                                                height={14}
                                                className="h-3.5 w-3.5 object-contain"
                                            />
                                        </span>
                                    </div>

                                    {/* Account Info */}
                                    <div className="flex-1 text-left min-w-0">
                                        {showPlatformLogoOnly ? (
                                            <>
                                                <p className="text-sm font-semibold text-foreground truncate">
                                                    {accountPrimaryText}
                                                </p>
                                                <p className="text-xs text-muted-foreground truncate">
                                                    {getProviderLabel(account.provider)}
                                                </p>
                                                {isDisabled && disabledReason && (
                                                    <p className="mt-1 text-[11px] text-amber-300">
                                                        {disabledReason}
                                                    </p>
                                                )}
                                            </>
                                        ) : (
                                            <>
                                                <div className="flex items-center gap-1.5 mb-0.5">
                                                    <Image
                                                        src={getPlatformLogo(account.provider)}
                                                        alt={account.provider}
                                                        width={14}
                                                        height={14}
                                                        className="h-3.5 w-3.5"
                                                    />
                                                    <span className="text-xs font-semibold text-muted-foreground uppercase">
                                                        {account.provider}
                                                    </span>
                                                </div>
                                                <p className="text-sm font-semibold text-foreground truncate">
                                                    {account.account_name}
                                                </p>
                                                {account.account_username && (
                                                    <p className="text-xs text-muted-foreground truncate">
                                                        @{account.account_username}
                                                    </p>
                                                )}
                                                {isDisabled && disabledReason && (
                                                    <p className="mt-1 text-[11px] text-amber-300">
                                                        {disabledReason}
                                                    </p>
                                                )}
                                            </>
                                        )}
                                    </div>
                                </div>

                                {/* Configuration Area */}
                                {isSelected && renderAccountConfig && (
                                    <div className="px-3 pb-3">
                                        {renderAccountConfig(account.id, account.provider)}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Empty State */}
            {!isLoadingAccounts && accounts.length === 0 && (
                <div className="rounded-xl border border-dashed border-border bg-muted/30 p-8 text-center">
                    <p className="text-sm text-muted-foreground">
                        No connected accounts. Connect your social media accounts to post.
                    </p>
                    <div className="mt-3 flex flex-col items-center justify-center gap-2 sm:flex-row">
                        {onRetryFetchAccounts && (
                            <button
                                type="button"
                                onClick={onRetryFetchAccounts}
                                className="inline-flex items-center gap-2 rounded-lg border border-border bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted cursor-pointer"
                            >
                                Retry
                            </button>
                        )}
                        <Link
                            href="/connected-accounts"
                            className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary/90 cursor-pointer"
                        >
                            Connect Accounts
                        </Link>
                    </div>
                </div>
            )}
        </div>
    );
}
