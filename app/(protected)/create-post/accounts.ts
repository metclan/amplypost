export interface ConnectedAccount {
    id: string;
    provider: string;
    account_id: string;
    account_name: string;
    account_username: string | null;
    profile_picture: string;
}

interface BackendAccount {
    id: string;
    provider: string;
    accountId: string;
    accountName: string;
    accountUsername: string | null;
    profilePicture: string | null;
}

interface AccountsResponse {
    message?: string;
    data?: BackendAccount[];
}

function normalizeAccount(account: BackendAccount): ConnectedAccount {
    return {
        id: account.id,
        provider: account.provider,
        account_id: account.accountId,
        account_name: account.accountName,
        account_username: account.accountUsername,
        profile_picture: account.profilePicture || `/${account.provider.toLowerCase()}-logo.svg`,
    };
}

export async function fetchConnectedAccounts(): Promise<ConnectedAccount[]> {
    const response = await fetch("/api/accounts", {
        credentials: "include",
        cache: "no-store",
    });

    const data = (await response.json().catch(() => null)) as AccountsResponse | null;

    if (!response.ok) {
        throw new Error(data?.message || "Failed to fetch connected accounts.");
    }

    return (data?.data ?? []).map(normalizeAccount);
}
