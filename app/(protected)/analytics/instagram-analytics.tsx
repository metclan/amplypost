"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { analyticsProviders, fetchAnalytics, formatMetric, type AnalyticsResponse, type Metrics } from "@/lib/analytics";
import { useAnalyticsAccount } from "./analytics-shell";
import { Loading, RequestError, Freshness } from "./analytics-shared";

import AnalyticsPosts from "./analytics-posts";
import InstagramReachChart from "./instagram-reach-chart";

function Cards({ metrics, definitions }: { metrics?: Metrics; definitions: { key: string; label: string }[] }) {
    return <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">{definitions.map(({ key, label }) => <div key={key} className="rounded-xl border border-border bg-card px-4 py-3"><p className="text-sm text-muted-foreground">{label}</p><p className="mt-1 text-2xl font-semibold tabular-nums">{formatMetric(metrics?.[key])}</p></div>)}</div>;
}

function Overview({ id, retry }: { id: string; retry: () => void }) {
    const [data, setData] = useState<AnalyticsResponse>();
    const [error, setError] = useState<Error>();
    useEffect(() => {
        const controller = new AbortController();
        fetchAnalytics(id, "account", undefined, controller.signal).then(data => { if (!controller.signal.aborted) setData(data); }).catch(error => { if (!controller.signal.aborted) setError(error); });
        return () => controller.abort();
    }, [id]);
    if (error) return <RequestError error={error} retry={retry} />;
    if (!data) return <Loading label="Loading Instagram insights…" />;
    const series = data.payload.series ?? [];
    const interactions = ["likes", "comments", "shares", "saves"];
    const interactionMax = Math.max(1, ...interactions.map(key => data.payload.summary?.[key] ?? 0));
    return <div className="space-y-5">
        <h3 className="text-lg font-semibold">Current account totals</h3>
        <Cards metrics={data.payload.metrics} definitions={analyticsProviders.instagram.accountMetrics} />
        <div><h3 className="text-lg font-semibold">Last 28 complete days</h3><p className="text-xs text-muted-foreground">{data.payload.since && new Date(data.payload.since).toLocaleDateString(undefined, { timeZone: "UTC" })} – {data.payload.until && new Date(Date.parse(data.payload.until) - 1).toLocaleDateString(undefined, { timeZone: "UTC" })} · UTC</p></div>
        <Cards metrics={data.payload.summary} definitions={[{ key: "views", label: "Views" }, { key: "reach", label: "Accounts reached" }, { key: "accounts_engaged", label: "Accounts engaged" }, { key: "total_interactions", label: "Interactions" }]} />
        <div className="grid grid-cols-1 gap-5">
            <InstagramReachChart series={series} accountId={id} />
            <section className="space-y-5 rounded-xl border border-border bg-card p-4"><h3 className="font-semibold">Interaction breakdown</h3>{interactions.map(key => { const value = data.payload.summary?.[key]; return <div key={key}><div className="mb-2 flex justify-between text-sm"><span className="capitalize">{key}</span><span>{formatMetric(value)}</span></div>{value != null && <div className="h-3 cursor-pointer rounded bg-muted"><div className="h-full rounded bg-primary" style={{ width: `${value / interactionMax * 100}%` }} /></div>}</div>; })}</section>
        </div><Freshness data={data} />
    </div>;
}

export default function InstagramAnalytics() {
    const account = useAnalyticsAccount();
    const [revision, setRevision] = useState(0);
    if (!account) return null;
    return <div className="space-y-5"><header className="flex flex-wrap items-center justify-between gap-3"><div><h2 className="text-2xl font-semibold">Instagram analytics</h2><p className="text-sm text-muted-foreground">{account.account_username ? `@${account.account_username}` : account.account_name}</p></div><Button variant="outline" onClick={() => setRevision(value => value + 1)}>Refresh</Button></header><Overview key={`overview:${account.id}:${revision}`} id={account.id} retry={() => setRevision(value => value + 1)} /><AnalyticsPosts provider="instagram" key={`posts:${account.id}:${revision}`} id={account.id} /><p className="text-xs text-muted-foreground">Statistics refresh on demand when over an hour old. Insights availability depends on media type and account eligibility.</p></div>;
}
