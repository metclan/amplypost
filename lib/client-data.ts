"use client";

import { fetchCachedResource, invalidateCachedResource } from "@/lib/client-cache";
import { parseApiErrorResponse } from "@/lib/client-errors";
import { apiFetch } from "@/util/backend-api";

export const ACCOUNTS_CACHE_KEY = "accounts:v3";
export const DASHBOARD_CACHE_PREFIX = "dashboard";
export const RECENT_POSTS_CACHE_KEY = "dashboard:recent-posts:5";
export const POSTS_CACHE_PREFIX = "posts";
export const CACHE_TTL = 60_000;

export type BackendAccount = {
    id: string;
    provider: string;
    accountId: string;
    accountName: string;
    accountUsername: string | null;
    profilePicture: string | null;
    accessTokenExpiresAt?: string | null;
    refreshTokenExpiresAt?: string | null;
    scopes?: string[] | null;
    createdAt?: string;
    updatedAt?: string;
    isActive?: boolean;
    hasRefreshToken?: boolean;
    accessTokenExpired?: boolean;
    refreshTokenExpired?: boolean;
};

export type ConnectedAccount = BackendAccount & {
    account_id: string;
    account_name: string;
    account_username: string | null;
    profile_picture: string;
    scopes: string[];
};

type AccountsResponse = {
    message?: string;
    data?: BackendAccount[];
};

export type DashboardTotals = {
    posts: number;
    pendingPosts: number;
    scheduledPosts: number;
    accounts: number;
    accountsRequiringAttention: number;
};

type DashboardResponse = {
    data?: {
        totals?: Partial<DashboardTotals>;
    };
    message?: string;
};

export type RecentPost = {
    provider: string;
    status: string;
    isStory: boolean;
    createdAt: string;
};

type RecentPostsResponse = {
    data?: RecentPost[];
    message?: string;
};

export const emptyDashboardTotals: DashboardTotals = {
    posts: 0,
    pendingPosts: 0,
    scheduledPosts: 0,
    accounts: 0,
    accountsRequiringAttention: 0,
};

export function getPlatformLogo(provider: string) {
    const normalized = provider.toLowerCase();
    const logos: Record<string, string> = {
        facebook: "/facebook-logo.svg",
        instagram: "/instagram-logo.svg",
        linkedin: "/linkedin-logo.svg",
        pinterest: "/pinterest-logo.svg",
        tiktok: "/tiktok-logo.png",
        youtube: "/youtube-logo.svg",
        x: "/twitter-logo.png",
        twitter: "/twitter-logo.png",
        threads: "/threads-logo.png",
        thread: "/threads-logo.png",
        bluesky: "/bluesky-logo.svg",
        "google-business-profile": "/google-my-business-logo.svg",
        google_business_profile: "/google-my-business-logo.svg",
    };

    return logos[normalized] || "/amplypost-logo.png";
}

export function normalizeAccount(account: BackendAccount): ConnectedAccount {
    return {
        ...account,
        account_id: account.accountId,
        account_name: account.accountName,
        account_username: account.accountUsername,
        profile_picture: account.profilePicture || getPlatformLogo(account.provider),
        scopes: account.scopes ?? [],
    };
}

export async function fetchAccounts() {
    const response = await apiFetch("accounts");
    if (!response.ok) {
        await parseApiErrorResponse(response, "Failed to fetch connected accounts.");
    }

    const data = (await response.json().catch(() => null)) as AccountsResponse | null;
    return (data?.data ?? []).map(normalizeAccount);
}

export function getDashboardCacheKey(params: URLSearchParams) {
    return `${DASHBOARD_CACHE_PREFIX}:totals:${params.toString()}`;
}

export async function fetchDashboardTotals(params: URLSearchParams) {
    const response = await apiFetch(`dashboard?${params.toString()}`);
    if (!response.ok) {
        await parseApiErrorResponse(response, "Failed to load dashboard.");
    }

    const data = (await response.json().catch(() => null)) as DashboardResponse | null;
    return {
        ...emptyDashboardTotals,
        ...(data?.data?.totals ?? {}),
    };
}

export async function fetchRecentPosts(limit = 5) {
    const response = await apiFetch(`dashboard/recent-posts?limit=${limit}`);
    if (!response.ok) {
        await parseApiErrorResponse(response, "Failed to load recent posts.");
    }

    const data = (await response.json().catch(() => null)) as RecentPostsResponse | null;
    return data?.data ?? [];
}

export function prefetchProtectedData() {
    const now = new Date();
    const from = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
    const to = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
    const dashboardParams = new URLSearchParams({
        from: from.toISOString(),
        to: to.toISOString(),
    });

    void fetchCachedResource({
        key: ACCOUNTS_CACHE_KEY,
        fetcher: fetchAccounts,
        ttl: CACHE_TTL,
    }).catch(() => undefined);

    void fetchCachedResource({
        key: getDashboardCacheKey(dashboardParams),
        fetcher: () => fetchDashboardTotals(dashboardParams),
        ttl: CACHE_TTL,
    }).catch(() => undefined);

    void fetchCachedResource({
        key: RECENT_POSTS_CACHE_KEY,
        fetcher: () => fetchRecentPosts(5),
        ttl: CACHE_TTL,
    }).catch(() => undefined);
}

export function invalidateAccountData() {
    invalidateCachedResource(ACCOUNTS_CACHE_KEY);
    invalidateCachedResource(DASHBOARD_CACHE_PREFIX);
}
