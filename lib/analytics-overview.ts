import { apiFetch } from "@/util/backend-api";
import { parseApiErrorResponse } from "@/lib/client-errors";
export type OverviewMetric = { key: string; label: string; period: string; value: number | null; reporting: number; providers: string[] };
export type OverviewAccount = { id: string; provider: string; name: string; supported: boolean; active: boolean; reporting: boolean; stale: boolean; duplicate: boolean; periodAligned: boolean; updatedAt: string | null; issue: string | null; tokenAttention: boolean; values: Record<string, number | null> };
export type OverviewPost = { id: string; provider: string | null; caption: string | null; status: string; isStory: boolean; createdAt: string; updatedAt: string; publishedAt: string | null; scheduledFor: string | null };
export type AnalyticsOverviewData = {
    since: string; until: string; generatedAt: string; workspaceId: string | null; refreshing: boolean;
    coverage: { total: number; supported: number; reporting: number; stale: number; uniqueReporting: number };
    metrics: OverviewMetric[]; accounts: OverviewAccount[];
    dailySeries: Record<string, { date: string; value: number; reporting: number }[]>;
    publishing: { published: number; failed: number; queued: number; scheduled: number; dailySeries: { date: string; value: number }[]; byProvider: Record<string, number> };
    topPosts: { provider: string; metric: string; period: string; candidates: number; items: { id: string; title: string; thumbnail: string | null; url: string | null; value: number; accountId: string }[] }[];
    recentPosts: OverviewPost[]; upcomingPosts: OverviewPost[];
};
export async function fetchAnalyticsOverview(workspaceId: string | null, signal: AbortSignal): Promise<AnalyticsOverviewData> {
    const query = new URLSearchParams(workspaceId ? { workspaceId } : {});
    const response = await apiFetch(`accounts/analytics-overview${query.size ? `?${query}` : ""}`, { cache: "no-store", signal });
    if (!response.ok) await parseApiErrorResponse(response, "Unable to load analytics overview");
    const { data } = await response.json();
    if (!data || !Array.isArray(data.metrics) || !data.coverage || !data.publishing) throw new Error("Overview returned an unexpected response");
    return data;
}
