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
        scope?: "account" | "board" | "location";
        metrics?: Metrics;
        summary?: Metrics;
        since?: string;
        until?: string;
        dailySeries?: Record<string, { date: string; value: number }[]>;
        series?: { date: string; reach: number }[];
        items?: AnalyticsPost[];
        pagination?: { hasMore: boolean; nextCursor: string | null };
    };
};
export type AnalyticsPost = {
    externalId: string;
    metadata: {
        media_type?: string;
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
    google_business_profile: {
        name: "Google Business Profile",
        accountMetrics: [
            { key: "BUSINESS_IMPRESSIONS_DESKTOP_SEARCH", label: "Search impressions · desktop" },
            { key: "BUSINESS_IMPRESSIONS_MOBILE_SEARCH", label: "Search impressions · mobile" },
            { key: "BUSINESS_IMPRESSIONS_DESKTOP_MAPS", label: "Maps impressions · desktop" },
            { key: "BUSINESS_IMPRESSIONS_MOBILE_MAPS", label: "Maps impressions · mobile" },
            { key: "WEBSITE_CLICKS", label: "Website clicks" },
            { key: "CALL_CLICKS", label: "Call-button clicks" },
            { key: "BUSINESS_DIRECTION_REQUESTS", label: "Direction requests" },
            { key: "BUSINESS_BOOKINGS", label: "Bookings" },
            { key: "BUSINESS_FOOD_MENU_CLICKS", label: "Menu clicks" },
        ],
        postMetrics: [],
    },
    pinterest: {
        name: "Pinterest",
        accountMetrics: [
            { key: "IMPRESSION", label: "Impressions" }, { key: "SAVE", label: "Saves" },
            { key: "PIN_CLICK", label: "Pin clicks" }, { key: "OUTBOUND_CLICK", label: "Outbound clicks" },
            { key: "ENGAGEMENT", label: "Engagements" },
        ],
        postMetrics: [
            { key: "IMPRESSION", label: "Impressions" }, { key: "SAVE", label: "Saves" },
            { key: "PIN_CLICK", label: "Pin clicks" }, { key: "OUTBOUND_CLICK", label: "Outbound clicks" },
            { key: "VIDEO_MRC_VIEW", label: "Video views" },
        ],
    },
    threads: {
        name: "Threads",
        accountMetrics: [{ key: "followers_count", label: "Followers" }],
        postMetrics: [
            { key: "views", label: "Views" }, { key: "likes", label: "Likes" },
            { key: "replies", label: "Replies" }, { key: "reposts", label: "Reposts" },
            { key: "quotes", label: "Quotes" }, { key: "shares", label: "Shares" },
        ],
    },
    facebook: {
        name: "Facebook",
        accountMetrics: [{ key: "followers_count", label: "Followers" }, { key: "fan_count", label: "Page likes" }],
        postMetrics: [
            { key: "post_media_view", label: "Views" }, { key: "reactions", label: "Reactions" },
            { key: "comments", label: "Comments" }, { key: "shares", label: "Shares" },
        ],
    },
    instagram: {
        name: "Instagram",
        accountMetrics: [
            { key: "followers_count", label: "Followers" },
            { key: "follows_count", label: "Following" },
            { key: "media_count", label: "Posts" },
        ],
        postMetrics: [
            { key: "views", label: "Views" }, { key: "reach", label: "Reach" },
            { key: "likes", label: "Likes" }, { key: "comments", label: "Comments" },
            { key: "saved", label: "Saves" }, { key: "shares", label: "Shares" },
            { key: "total_interactions", label: "Interactions" },
        ],
    },
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
        if (["RECONNECT_REQUIRED", "UNSUPPORTED_PROVIDER", "ACCOUNT_NOT_FOUND", "ANALYTICS_ACCESS_DENIED", "SANDBOX_ANALYTICS_UNAVAILABLE", "ANALYTICS_SETUP_REQUIRED", "LOCATION_NOT_FOUND", "RATE_LIMITED"].includes(body?.code)) {
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
