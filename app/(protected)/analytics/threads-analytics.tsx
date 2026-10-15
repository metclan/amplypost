"use client";

import { useEffect, useState } from "react";
import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { analyticsProviders, fetchAnalytics, formatMetric, type AnalyticsResponse } from "@/lib/analytics";
import { useAnalyticsAccount } from "./analytics-shell";
import { Freshness, Loading, RequestError } from "./analytics-shared";
import AnalyticsDailyChart from "./analytics-daily-chart";
import AnalyticsPosts from "./analytics-posts";

const activityMetrics = analyticsProviders.threads.postMetrics.filter(metric => metric.key !== "shares");

function ThreadsOverview({ id, retry }: { id: string; retry: () => void }) {
    const [data, setData] = useState<AnalyticsResponse>();
    const [error, setError] = useState<Error>();
    useEffect(() => {
        const controller = new AbortController();
        fetchAnalytics(id, "account", undefined, controller.signal)
            .then(result => { if (!controller.signal.aborted) setData(result); })
            .catch(error => { if (!controller.signal.aborted) setError(error); });
        return () => controller.abort();
    }, [id]);
    if (error) return <RequestError error={error} retry={retry} />;
    if (!data) return <Loading label="Loading Threads insights…" />;
    return <section className="space-y-5" aria-label="Threads account insights">
        <div className="rounded-xl border border-border bg-card px-4 py-3">
            <h3 className="text-sm text-muted-foreground">Followers</h3>
            <p className="mt-1 text-2xl font-semibold tabular-nums">{formatMetric(data.payload.metrics?.followers_count)}</p>
            <p className="mt-1 text-xs text-muted-foreground">Current total</p>
        </div>
        <div className="space-y-3">
            <div><h3 className="text-lg font-semibold">Your last 28 days</h3><p className="text-xs text-muted-foreground">Activity across your Threads account · — means unavailable</p></div>
            <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">{activityMetrics.map(metric => <div key={metric.key} className="rounded-xl border border-border bg-card px-4 py-3">
                <p className="text-sm text-muted-foreground">{metric.label}</p>
                <p className="mt-1 text-2xl font-semibold tabular-nums">{formatMetric(data.payload.summary?.[metric.key])}</p>
            </div>)}</div>
        </div>
        <AnalyticsDailyChart accountId={id} title="Daily views" unit="views" series={data.payload.dailySeries?.views ?? []}
            description="Views reported by Threads over the last 28 complete days." previewPosts={false}
            note="Only available daily reports are shown." />
        <Freshness data={data} />
    </section>;
}

export default function ThreadsAnalytics() {
    const account = useAnalyticsAccount();
    const [revision, setRevision] = useState(0);
    if (!account) return null;
    const refresh = () => setRevision(value => value + 1);
    return <div className="space-y-5 [&_button]:cursor-pointer">
        <header className="flex flex-wrap items-center justify-between gap-3">
            <div><h2 className="text-2xl font-semibold">Threads analytics</h2><p className="text-sm text-muted-foreground">{account.account_username ? `@${account.account_username}` : account.account_name}</p></div>
            <Button variant="outline" onClick={refresh}><RefreshCw aria-hidden="true" />Refresh</Button>
        </header>
        <ThreadsOverview key={`overview:${account.id}:${revision}`} id={account.id} retry={refresh} />
        <AnalyticsPosts key={`posts:${account.id}:${revision}`} id={account.id} provider="threads" />
        <p className="text-xs text-muted-foreground">Statistics refresh on demand when over an hour old. Metric availability depends on the post type and permissions granted.</p>
    </div>;
}
