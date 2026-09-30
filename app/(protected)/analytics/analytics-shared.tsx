"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Loader2, Video } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ConnectedAccount } from "@/lib/client-data";
import { analyticsProviders, AnalyticsRequestError, fetchAnalytics, formatMetric, safeWebUrl, type AnalyticsResponse, type AnalyticsResource, type AnalyticsPost } from "@/lib/analytics";
import { connectTiktok } from "@/util/social-connect";

export function Loading({ label }: { label: string }) {
    return <div role="status" className="flex min-h-40 items-center justify-center gap-2 p-6 text-sm text-muted-foreground"><Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />{label}</div>;
}

export function RequestError({ error, retry }: { error: Error; retry: () => void }) {
    const code = error instanceof AnalyticsRequestError ? error.code : undefined;
    return <div role="alert" className="space-y-3 rounded-xl border border-border bg-muted/30 p-5">
        <p className="text-sm text-foreground">{code === "RECONNECT_REQUIRED" ? "Reconnect TikTok and allow access to your statistics and public videos to see analytics." : error.message}</p>
        {code === "RECONNECT_REQUIRED" ? <Button onClick={connectTiktok}>Reconnect TikTok</Button> :
            code === "ACCOUNT_NOT_FOUND" ? <Button asChild variant="outline"><Link href="/connected-accounts">Manage accounts</Link></Button> :
            <Button variant="outline" onClick={retry}>Try again</Button>}
    </div>;
}

export function Freshness({ data }: { data: Pick<AnalyticsResponse, "updatedAt" | "stale" | "refreshFailed"> }) {
    return <div className="space-y-2 text-xs text-muted-foreground">
        <p>Updated <time dateTime={data.updatedAt}>{new Date(data.updatedAt).toLocaleString()}</time></p>
        {(data.stale || data.refreshFailed) && <p role="status" className="rounded-lg bg-amber-500/10 p-3 text-amber-800 dark:text-amber-200">We couldn’t update these statistics. Showing the last saved data. Try refreshing again shortly.</p>}
    </div>;
}

// These requests run only on mount or a user action. The backend owns freshness;
// analytics are not stored in the browser cache or refreshed by a timer.
function useAnalytics(accountId: string, resource: AnalyticsResource, cursor?: string) {
    const [state, setState] = useState<{ data?: AnalyticsResponse; error?: Error }>({});
    useEffect(() => {
        const controller = new AbortController();
        fetchAnalytics(accountId, resource, cursor, controller.signal)
            .then(data => { if (!controller.signal.aborted) setState({ data }); })
            .catch(error => { if (!controller.signal.aborted) setState({ error: error instanceof Error ? error : new Error("Unable to load analytics.") }); });
        return () => controller.abort();
    }, [accountId, resource, cursor]);
    return state;
}

export function AccountOverview({ account, retry }: { account: ConnectedAccount; retry: () => void }) {
    const { data, error } = useAnalytics(account.id, "account");
    const provider = analyticsProviders[account.provider];
    if (error) return <RequestError error={error} retry={retry} />;
    if (!data) return <Loading label="Loading account statistics…" />;
    return <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
            {provider.accountMetrics.map(metric => <div key={metric.key} className="rounded-xl border border-border bg-card p-5 shadow-sm">
                <p className="text-sm text-muted-foreground">{metric.label}</p>
                <p className="mt-3 break-all text-3xl font-semibold tabular-nums text-foreground">{formatMetric(data.payload.metrics?.[metric.key])}</p>
            </div>)}
        </div>
        <Freshness data={data} />
    </div>;
}

export function VideoThumbnail({ post }: { post: AnalyticsPost }) {
    const [failed, setFailed] = useState(false);
    const url = safeWebUrl(post.metadata.cover_image_url);
    return <div className="relative flex h-20 w-14 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-muted">
        {url && !failed ? <Image src={url} alt="" fill unoptimized sizes="56px" className="object-cover" onError={() => setFailed(true)} /> : <Video className="h-5 w-5 text-muted-foreground" aria-hidden="true" />}
    </div>;
}

