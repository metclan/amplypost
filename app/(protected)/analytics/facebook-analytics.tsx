"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { fetchAnalytics, formatMetric, type AnalyticsResponse } from "@/lib/analytics";
import { useAnalyticsAccount } from "./analytics-shell";
import { AccountOverview, Freshness, Loading, RequestError } from "./analytics-shared";
import AnalyticsDailyChart from "./analytics-daily-chart";
import AnalyticsPosts from "./analytics-posts";

const dailyMetrics = [
    { key: "page_media_view", label: "Content views", unit: "views" },
    { key: "page_post_engagements", label: "Post engagements", unit: "engagements" },
    { key: "page_views_total", label: "Page views", unit: "views" },
];

function PageInsights({ id, retry }: { id: string; retry: () => void }) {
    const [data, setData] = useState<AnalyticsResponse>();
    const [error, setError] = useState<Error>();
    const [selected, setSelected] = useState(0);
    useEffect(() => {
        const controller = new AbortController();
        fetchAnalytics(id, "account", undefined, controller.signal)
            .then(data => { if (!controller.signal.aborted) setData(data); })
            .catch(error => { if (!controller.signal.aborted) setError(error); });
        return () => controller.abort();
    }, [id]);
    if (error) return <RequestError error={error} retry={retry} />;
    if (!data) return <Loading label="Loading Facebook Page insights…" />;
    const metric = dailyMetrics[selected];
    return <section className="space-y-4">
        <div><h3 className="text-lg font-semibold">Your last 28 days</h3><p className="text-xs text-muted-foreground">Totals from available daily reports. Missing days are excluded; — means unavailable.</p></div>
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">{dailyMetrics.map(item => <div key={item.key} className="rounded-xl border border-border bg-card px-4 py-3"><p className="text-sm text-muted-foreground">{item.label}</p><p className="mt-1 text-2xl font-semibold tabular-nums">{formatMetric(data.payload.summary?.[item.key])}</p><p className="mt-1 text-xs text-muted-foreground">{data.payload.dailySeries?.[item.key]?.length ?? 0} days reported</p></div>)}</div>
        <div role="tablist" aria-label="Facebook daily metric" className="flex flex-wrap gap-1 rounded-lg bg-muted/60 p-1">{dailyMetrics.map((item, index) => <button type="button" key={item.key} id={`daily-${item.key}`} role="tab" aria-selected={selected === index} aria-controls="facebook-daily-chart" tabIndex={selected === index ? 0 : -1} onClick={() => setSelected(index)} onKeyDown={event => {
            if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
            event.preventDefault();
            const next = event.key === "Home" ? 0 : event.key === "End" ? dailyMetrics.length - 1 : (index + (event.key === "ArrowRight" ? 1 : -1) + dailyMetrics.length) % dailyMetrics.length;
            setSelected(next); document.getElementById(`daily-${dailyMetrics[next].key}`)?.focus();
        }} className={`cursor-pointer rounded-md px-3 py-1.5 text-xs font-medium focus-visible:outline-2 focus-visible:outline-primary ${selected === index ? "bg-background shadow-sm" : "text-muted-foreground hover:text-foreground"}`}>{item.label}</button>)}</div>
        <div id="facebook-daily-chart" role="tabpanel" aria-labelledby={`daily-${metric.key}`}><AnalyticsDailyChart key={metric.key} accountId={id} series={data.payload.dailySeries?.[metric.key] ?? []} title={`Daily ${metric.label.toLowerCase()}`} unit={metric.unit} description="Facebook daily reporting periods, labeled by their end date in UTC." /></div>
        <Freshness data={data} />
    </section>;
}

export default function FacebookAnalytics() {
    const account = useAnalyticsAccount();
    const [revision, setRevision] = useState(0);
    if (!account) return null;
    return <div className="space-y-5"><header className="flex flex-wrap items-center justify-between gap-3"><div><h2 className="text-2xl font-semibold">Facebook analytics</h2><p className="text-sm text-muted-foreground">{account.account_name || account.account_username}</p></div><Button variant="outline" onClick={() => setRevision(value => value + 1)}>Refresh</Button></header>
        <section className="space-y-3"><h3 className="text-lg font-semibold">Current Page totals</h3><AccountOverview key={`account:${revision}`} account={account} retry={() => setRevision(value => value + 1)} /></section>
        <PageInsights key={`insights:${revision}`} id={account.id} retry={() => setRevision(value => value + 1)} />
        <AnalyticsPosts key={`posts:${revision}`} id={account.id} provider="facebook" />
        <p className="text-xs text-muted-foreground">Statistics refresh on demand when over an hour old. Insights depend on the Page, content type, and permissions granted.</p>
    </div>;
}
