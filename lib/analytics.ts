import { apiFetch } from "@/util/backend-api";
import { parseApiErrorResponse } from "@/lib/client-errors";

export type Metrics = Record<string, number | null>;
export type AnalyticsResource = "account" | "posts";
export type AnalyticsResponse = {
    accountId: string;
    provider: string;
    resource: AnalyticsResource;
    updatedAt: string;
    stale: boolean;
    refreshFailed: boolean;
    payload: {
        schemaVersion: number;
        period: string;
        metrics?: Metrics;
        items?: AnalyticsPost[];
        pagination?: { hasMore: boolean; nextCursor: string | null };
    };
};
export type AnalyticsPost = {
    externalId: string;
    metadata: {
        title?: string;
        video_description?: string;
        cover_image_url?: string;
        share_url?: string;
        create_time?: number;
    };
    metrics: Metrics;
};

export const analyticsProviders: Record<string, {
    name: string;
    accountMetrics: { key: string; label: string }[];
    postMetrics: { key: string; label: string }[];
}> = {
    tiktok: {
        name: "TikTok",
        accountMetrics: [
            { key: "follower_count", label: "Followers" },
            { key: "following_count", label: "Following" },
            { key: "likes_count", label: "Total likes received" },
            { key: "video_count", label: "Public videos" },
        ],
        postMetrics: [
            { key: "view_count", label: "Views" },
            { key: "like_count", label: "Likes" },
            { key: "comment_count", label: "Comments" },
            { key: "share_count", label: "Shares" },
        ],
    },
};

export class AnalyticsRequestError extends Error {
    constructor(message: string, public code?: string) { super(message); }
}

export function formatMetric(value: number | null | undefined) {
    return typeof value === "number" && Number.isFinite(value) ? value.toLocaleString() : "—";
}

export function safeWebUrl(value: string | undefined) {
    if (!value) return undefined;
    try {
        const url = new URL(value);
        return url.protocol === "https:" ? url.href : undefined;
    } catch { return undefined; }
}

export async function fetchAnalytics(accountId: string, resource: AnalyticsResource, cursor: string | undefined, signal: AbortSignal): Promise<AnalyticsResponse> {
    const params = new URLSearchParams();
    if (cursor !== undefined) params.set("cursor", cursor);
    const path = `accounts/${encodeURIComponent(accountId)}/analytics${resource === "posts" ? "/posts" : ""}`;
    const response = await apiFetch(`${path}${params.size ? `?${params}` : ""}`, { signal, cache: "no-store" });
    if (!response.ok) {
        const body = await response.clone().json().catch(() => null);
        if (["RECONNECT_REQUIRED", "UNSUPPORTED_PROVIDER", "ACCOUNT_NOT_FOUND"].includes(body?.code)) {
            throw new AnalyticsRequestError(body.message, body.code);
        }
        await parseApiErrorResponse(response, "We couldn’t load analytics. Please try again.");
    }
    const body = await response.json();
    const data = body?.data as AnalyticsResponse | undefined;
    if (!data || data.accountId !== accountId || data.resource !== resource ||
        !Number.isFinite(Date.parse(data.updatedAt)) || data.payload?.schemaVersion !== 1 ||
        (resource === "account" && (!data.payload.metrics || typeof data.payload.metrics !== "object")) ||
        (resource === "posts" && (!Array.isArray(data.payload.items) || !data.payload.pagination))) {
        throw new AnalyticsRequestError("Analytics returned an unexpected response. Please try again.");
    }
    return data;
}
