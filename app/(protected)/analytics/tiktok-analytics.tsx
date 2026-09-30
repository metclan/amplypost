"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, ExternalLink, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { analyticsProviders, AnalyticsRequestError, fetchAnalytics, formatMetric, safeWebUrl } from "@/lib/analytics";
import { currentMonth, monthLabel, shiftMonth, loadTikTokMonth, type TikTokMonth } from "@/lib/analytics/tiktok-month";
import { useAnalyticsAccount } from "./analytics-shell";
import { Loading, RequestError, Freshness, AccountOverview, VideoThumbnail } from "./analytics-shared";
import TikTokMonthChart from "./tiktok-month-chart";

function MonthlyVideos({ accountId, month, retry }: { accountId: string; month: string; retry: () => void }) {
    const [data, setData] = useState<TikTokMonth>();
    const [error, setError] = useState<Error>();
    const [loaded, setLoaded] = useState(0);
    const [page, setPage] = useState(1);
    useEffect(() => {
        const controller = new AbortController();
        loadTikTokMonth(month, (cursor, signal) => fetchAnalytics(accountId, "posts", cursor, signal), controller.signal,
            count => { if (!controller.signal.aborted) setLoaded(count); })
            .then(result => { if (!controller.signal.aborted) setData(result); })
            .catch(error => { if (!controller.signal.aborted) setError(error instanceof Error ? error : new Error("Unable to load this month.")); });
        return () => controller.abort();
    }, [accountId, month]);
    if (error) return <RequestError error={error} retry={retry} />;
    if (!data) return <Loading label={loaded ? `Loading the full month… ${loaded} videos found` : "Loading this month’s videos…"} />;
    const pages = Math.max(1, Math.ceil(data.items.length / 20));
    const items = data.items.slice((page - 1) * 20, page * 20);
    return <div className="space-y-5">
        <TikTokMonthChart items={data.items} month={month} />
        <Freshness data={data} />
        {data.items.length > 0 && <section className="space-y-4" aria-label="Videos published this month">
            <div className="flex flex-wrap items-center justify-between gap-2"><h3 className="text-lg font-semibold">Videos published in {monthLabel(month)}</h3><p className="text-xs text-muted-foreground">{data.items.length} videos · Newest first</p></div>
            <div className="overflow-x-auto rounded-xl border border-border bg-card"><table className="w-full min-w-[680px] text-left text-sm">
                <caption className="sr-only">TikTok video performance in {monthLabel(month)}, page {page}</caption>
                <thead className="border-b border-border bg-muted/40 text-xs text-muted-foreground"><tr><th scope="col" className="p-4 font-medium">Video</th>{analyticsProviders.tiktok.postMetrics.map(metric => <th key={metric.key} scope="col" className="p-4 text-right font-medium">{metric.label}</th>)}</tr></thead>
                <tbody className="divide-y divide-border">{items.map(post => { const href = safeWebUrl(post.metadata.share_url); const title = post.metadata.title || post.metadata.video_description || "Untitled video"; return <tr key={post.externalId} className="hover:bg-muted/20">
                    <td className="p-4"><div className="flex items-center gap-3"><VideoThumbnail post={post} /><div className="max-w-xs space-y-1">{href ? <a href={href} target="_blank" rel="noopener noreferrer" className="inline-flex items-start gap-1.5 font-medium hover:underline"><span className="line-clamp-2">{title}</span><ExternalLink className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" /><span className="sr-only"> (opens in a new tab)</span></a> : <p className="line-clamp-2 font-medium">{title}</p>}<p className="text-xs text-muted-foreground">{new Date(post.metadata.create_time! * 1000).toLocaleDateString(undefined, { timeZone: "UTC" })}</p></div></div></td>
                    {analyticsProviders.tiktok.postMetrics.map(metric => <td key={metric.key} className="p-4 text-right tabular-nums"><span aria-label={post.metrics[metric.key] == null ? "Not available" : undefined}>{formatMetric(post.metrics[metric.key])}</span></td>)}
                </tr>; })}</tbody>
            </table></div>
            <div className="flex flex-wrap items-center justify-between gap-3"><p className="text-xs text-muted-foreground">Page {page} of {pages} · Lifetime totals · — means unavailable</p><div className="flex gap-2"><Button variant="outline" disabled={page === 1} onClick={() => setPage(value => value - 1)}><ChevronLeft aria-hidden="true" />Previous</Button><Button variant="outline" disabled={page === pages} onClick={() => setPage(value => value + 1)}>Next<ChevronRight aria-hidden="true" /></Button></div></div>
        </section>}
    </div>;
}

export default function TikTokAnalytics() {
    const account = useAnalyticsAccount();
    const [month, setMonth] = useState(() => currentMonth());
    const [revision, setRevision] = useState(0);
    const [videoRevision, setVideoRevision] = useState(0);
    if (!account) return null;
    if (account.isActive === false) return <RequestError error={new AnalyticsRequestError("Reconnect this account.", "RECONNECT_REQUIRED")} retry={() => {}} />;
    return <div className="space-y-7">
        <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="flex items-center gap-3"><div className="flex h-11 w-11 items-center justify-center rounded-xl border border-border bg-card"><Image src="/tiktok-logo.png" alt="" width={24} height={24} /></div><div><h2 className="text-2xl font-semibold tracking-tight">TikTok analytics</h2><p className="mt-1 text-sm text-muted-foreground">{account.account_username ? `@${account.account_username}` : account.account_name}</p></div></div>
            <Button variant="outline" onClick={() => { setRevision(value => value + 1); setVideoRevision(value => value + 1); }}><RefreshCw aria-hidden="true" />Refresh</Button>
        </div>
        <section className="space-y-3" aria-label="Account statistics"><div><h3 className="text-sm font-medium">Account overview</h3><p className="mt-1 text-xs text-muted-foreground">Current account totals across all your videos.</p></div><AccountOverview key={revision} account={account} retry={() => setRevision(value => value + 1)} /></section>
        <section className="space-y-5" aria-label="Monthly TikTok performance">
            <div className="flex flex-wrap items-center justify-between gap-3"><div><h3 className="text-lg font-semibold">Your month on TikTok</h3><p className="mt-1 text-sm text-muted-foreground">Find the videos that stood out.</p></div><div className="flex items-center gap-1 rounded-xl border border-border bg-card p-1">
                <Button size="icon" variant="ghost" aria-label="Previous month" disabled={month <= "2000-01"} onClick={() => setMonth(value => shiftMonth(value, -1))}><ChevronLeft aria-hidden="true" /></Button>
                <label htmlFor="tiktok-month" className="sr-only">Video publish month</label><input id="tiktok-month" type="month" min="2000-01" max={currentMonth()} value={month} onChange={event => { if (/^\d{4}-(0[1-9]|1[0-2])$/.test(event.target.value) && event.target.value >= "2000-01" && event.target.value <= currentMonth()) setMonth(event.target.value); }} className="max-w-44 rounded-md bg-transparent px-1 py-2 text-sm font-medium text-foreground focus-visible:outline-2 focus-visible:outline-primary" />
                <Button size="icon" variant="ghost" aria-label="Next month" disabled={month >= currentMonth()} onClick={() => setMonth(value => shiftMonth(value, 1))}><ChevronRight aria-hidden="true" /></Button>
            </div></div>
            <MonthlyVideos key={`${account.id}:${month}:${videoRevision}`} accountId={account.id} month={month} retry={() => setVideoRevision(value => value + 1)} />
        </section>
        <p className="text-xs text-muted-foreground">Statistics refresh on demand when they’re over an hour old.</p>
    </div>;
}
