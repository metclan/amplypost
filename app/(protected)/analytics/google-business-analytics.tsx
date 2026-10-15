"use client";

import { useEffect, useState } from "react";
import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { analyticsProviders, fetchAnalytics, formatMetric, type AnalyticsResponse } from "@/lib/analytics";
import { useAnalyticsAccount } from "./analytics-shell";
import { Freshness, Loading, RequestError } from "./analytics-shared";
import AnalyticsDailyChart from "./analytics-daily-chart";

const definitions = analyticsProviders.google_business_profile.accountMetrics;

function GoogleBusinessOverview({ id, retry }: { id: string; retry: () => void }) {
    const [data, setData] = useState<AnalyticsResponse>();
    const [error, setError] = useState<Error>();
    const [metric, setMetric] = useState(definitions[0].key);
    useEffect(() => {
        const controller = new AbortController();
        fetchAnalytics(id, "account", undefined, controller.signal)
            .then(result => { if (!controller.signal.aborted) setData(result); })
            .catch(error => { if (!controller.signal.aborted) setError(error); });
        return () => controller.abort();
    }, [id]);
    if (error) return <RequestError error={error} retry={retry} />;
    if (!data) return <Loading label="Loading Google Business Profile insights…" />;
    const selected = definitions.find(item => item.key === metric)!;
    return <section className="space-y-5" aria-label="Google Business Profile account insights">
        <div className="space-y-3">
            <div><h3 className="text-lg font-semibold">Your last 28 days</h3>
                <p className="text-xs text-muted-foreground">Performance for this business location · Google reporting dates · — means unavailable</p></div>
            <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">{definitions.map(item => <button type="button" key={item.key} aria-pressed={metric === item.key}
                onClick={() => setMetric(item.key)} className={`rounded-xl border bg-card px-4 py-3 text-left focus-visible:outline-2 focus-visible:outline-primary ${metric === item.key ? "border-primary ring-1 ring-primary/20" : "border-border hover:border-primary/50"}`}>
                <span className="block text-sm text-muted-foreground">{item.label}</span>
                <span className="mt-1 block text-2xl font-semibold tabular-nums">{formatMetric(data.payload.summary?.[item.key])}</span>
            </button>)}</div>
        </div>
        <AnalyticsDailyChart key={metric} accountId={id} title={`Daily ${selected.label.toLowerCase()}`} unit={selected.label.toLowerCase()}
            series={data.payload.dailySeries?.[metric] ?? []} previewPosts={false}
            description="Activity for this location over the last 28 complete reporting dates."
            note="Google may delay recent reports. Totals include only reported days; gaps are left blank. Impressions are measured separately for each device and surface. Call-button clicks do not count completed calls." />
        <Freshness data={data} />
    </section>;
}

export default function GoogleBusinessAnalytics() {
    const account = useAnalyticsAccount();
    const [revision, setRevision] = useState(0);
    if (!account) return null;
    const refresh = () => setRevision(value => value + 1);
    return <div className="space-y-5 [&_button]:cursor-pointer">
        <header className="flex flex-wrap items-center justify-between gap-3">
            <div><h2 className="text-2xl font-semibold">Google Business Profile analytics</h2><p className="text-sm text-muted-foreground">{account.account_name}</p></div>
            <Button variant="outline" onClick={refresh}><RefreshCw aria-hidden="true" />Refresh</Button>
        </header>
        <GoogleBusinessOverview key={`overview:${account.id}:${revision}`} id={account.id} retry={refresh} />
        <section className="rounded-xl border border-border bg-card p-4 text-sm text-muted-foreground">
            These insights measure your business location across Google Search and Maps. Individual post analytics are unavailable.
            Bookings and menu clicks depend on the features available for your business.
        </section>
        <p className="text-xs text-muted-foreground">Statistics refresh on demand when over an hour old. Access requires permission to manage this location and the Business Profile Performance API enabled for the connected app.</p>
    </div>;
}
