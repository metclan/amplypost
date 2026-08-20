import Image from "next/image";

interface ConnectedAccount {
    id: string;
    provider: string;
    account_id: string;
    account_name: string;
    account_username: string | null;
    profile_picture: string;
}

interface AccountCardProps {
    account: ConnectedAccount;
    onDelete?: (accountId: string) => void;
}

// Get provider logo
const getProviderLogo = (provider: string) => {
    const logoMap: Record<string, string> = {
        facebook: "/facebook-logo.svg",
        instagram: "/instagram-logo.svg",
        tiktok: "/tiktok-logo.svg",
        linkedin: "/linkedin-logo.svg",
        youtube: "/youtube-logo.svg",
        pinterest: "/pinterest-logo.svg",
        twitter: "/twitter-logo.svg",
        threads: "/thread-logo.svg",
        bluesky: "/bluesky-logo.svg",
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
        pinterest: "from-red-600 to-red-700",
        twitter: "from-sky-400 to-sky-500",
        threads: "from-sky-400 to-sky-500",
        bluesky: "from-sky-400 to-blue-500",
    };
    return colorMap[provider.toLowerCase()] || "from-gray-500 to-gray-600";
};

export default function AccountCard({ account, onDelete }: AccountCardProps) {
    return (
        <div className="group relative rounded-xl border border-border bg-card p-2.5 shadow-sm transition-all hover:bg-muted/40 hover:shadow-md active:scale-[0.98] sm:p-3">
            {/* Delete Button - Always visible on mobile, hover on desktop */}
            {onDelete && (
                <button
                    onClick={() => onDelete(account.id)}
                    className="absolute right-1.5 top-1.5 cursor-pointer touch-manipulation rounded-lg bg-red-500/15 p-1.5 text-red-300 transition-opacity hover:bg-red-500/25 active:bg-red-500/30 sm:right-2 sm:top-2 sm:opacity-0 sm:group-hover:opacity-100"
                    aria-label="Delete account"
                >
                    <svg
                        className="h-3.5 w-3.5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                    </svg>
                </button>
            )}

            <div className="flex items-center gap-3 pr-6 sm:pr-0">
                {/* Profile Picture with gradient border */}
                <div className="relative flex-shrink-0">
                    <div
                        className={`absolute inset-0 rounded-full bg-gradient-to-br ${getProviderColor(
                            account.provider
                        )} opacity-20 blur-sm`}
                    />
                        <div
                            className={`relative h-10 w-10 rounded-full bg-gradient-to-br ${getProviderColor(
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
                </div>

                {/* Account Info */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 mb-0.5">
                        <Image
                            src={getProviderLogo(account.provider)}
                            alt={account.provider}
                            width={12}
                            height={12}
                            className="h-3 w-3"
                        />
                        <span className="text-[10px] font-semibold uppercase text-muted-foreground">
                            {account.provider}
                        </span>
                    </div>
                    <h3 className="truncate text-sm font-bold leading-tight text-foreground">
                        {account.account_name}
                    </h3>
                    {account.account_username && (
                        <p className="truncate text-xs text-muted-foreground">
                            @{account.account_username}
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
}
