"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight, RefreshCw, AlertCircle, CalendarDays, CheckCircle2, Clock3, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useWorkspace } from "@/app/components/workspace-provider";
import { getPlatformLogo } from "@/lib/client-data";
import { analyticsProviders, formatMetric, safeWebUrl } from "@/lib/analytics";
import { fetchAnalyticsOverview, type AnalyticsOverviewData, type OverviewMetric, type OverviewPost } from "@/lib/analytics-overview";
import AnalyticsDailyChart from "./analytics-daily-chart";
import { Loading, RequestError } from "./analytics-shared";

const providerName = (provider: string) => analyticsProviders[provider]?.name ?? provider.replaceAll("_", " ");
const visibility = ["followers", "views", "impressions", "reach"];
const engagement = ["likes", "comments", "shares", "saves", "replies", "reposts", "quotes", "engagements"];
const actions = ["pinClicks", "outboundClicks", "websiteClicks", "callClicks", "directions", "bookings", "menuClicks"];
const accountLink = (id: string, provider: string) => `/analytics/${provider}?account=${encodeURIComponent(id)}`;
function MetricCards({ metrics, keys }: { metrics: OverviewMetric[]; keys: string[] }) {
    return <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">{keys.map(key => {
        const metric = metrics.find(metric => metric.key === key)!;
        return <div key={key} className="min-w-0 rounded-xl border border-border bg-card p-4">
            <h3 className="text-sm text-muted-foreground">{metric.label}</h3>
            <p className="mt-2 break-words text-2xl font-semibold tabular-nums">{formatMetric(metric.value)}</p>
            <p className="mt-1 text-xs text-muted-foreground">{key === "followers" ? "Current snapshot" : "Last 28 complete days"} · {metric.reporting} reporting {metric.reporting === 1 ? "profile" : "profiles"}</p>
            <p className="mt-2 text-xs text-muted-foreground">{metric.providers.map(providerName).join(" · ") || "No available data"}</p>
        </div>;
    })}</div>;
}
function PostList({ title, posts, upcoming = false }: { title: string; posts: OverviewPost[]; upcoming?: boolean }) {
    return <section className="rounded-xl border border-border bg-card p-4">
        <div className="mb-4 flex items-center justify-between gap-3"><h3 className="text-lg font-semibold">{title}</h3><Link href="/posts" className="text-xs text-primary hover:underline">Manage posts ↗</Link></div>
        {!posts.length ? <p className="py-8 text-sm text-muted-foreground">{upcoming ? "No upcoming scheduled posts." : "No recent publishing activity."}</p> : <ul className="divide-y divide-border">{posts.map(post => <li key={post.id} className="flex items-start justify-between gap-3 py-3">
            <div className="min-w-0"><p className="line-clamp-2 text-sm font-medium">{post.caption || "Untitled post"}</p><p className="mt-1 text-xs text-muted-foreground">{providerName(post.provider ?? "unknown")} {post.isStory ? "· Story" : ""}</p>
                <p className="mt-1 text-xs text-muted-foreground">{new Date((upcoming ? post.scheduledFor : post.updatedAt) || post.createdAt).toLocaleString()}</p></div>
            <span className={`shrink-0 rounded-full px-2 py-1 text-xs ${post.status === "failed" ? "bg-red-500/10 text-red-600 dark:text-red-300" : post.status === "published" ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300" : "bg-muted text-muted-foreground"}`}>{post.status}</span>
        </li>)}</ul>}
    </section>;
}
function OverviewContent({ workspaceId, name }: { workspaceId: string | null; name: string }) {
    const [data, setData] = useState<AnalyticsOverviewData>();
    const [error, setError] = useState<Error>();
    const [revision, setRevision] = useState(0);
    const [chart, setChart] = useState("published");
    const [polling, setPolling] = useState(false);
    useEffect(() => {
        const controller = new AbortController();
        let timer: ReturnType<typeof setTimeout> | undefined;
        let polls = 0;
        async function load() {
            try {
                const result = await fetchAnalyticsOverview(workspaceId, controller.signal);
                if (controller.signal.aborted) return;
                setData(result); setError(undefined);
                const keepPolling = result.refreshing && polls++ < 12;
                setPolling(keepPolling);
                if (keepPolling) timer = setTimeout(load, 5000);
            } catch (error) {
                if (!controller.signal.aborted) { setError(error instanceof Error ? error : new Error("Unable to load overview")); setPolling(false); }
            }
        }
        void load();
        return () => { controller.abort(); if (timer) clearTimeout(timer); };
    }, [workspaceId, revision]);
    const refresh = () => setRevision(value => value + 1);
    if (!data && error) return <RequestError error={error} retry={refresh} />;
    if (!data) return <Loading label="Loading your overview…" />;
    const issues = data.accounts.filter(account => account.issue || account.tokenAttention);
    const providers = [...new Set(data.accounts.map(account => account.provider))];
    const chartMetrics = data.metrics.filter(metric => data.dailySeries[metric.key]?.length);
    const selectedMetric = data.metrics.find(metric => metric.key === chart);
    const series = chart === "published" ? data.publishing.dailySeries : data.dailySeries[chart] ?? [];
    const dates = `${new Date(`${data.since}T00:00:00Z`).toLocaleDateString(undefined, { timeZone: "UTC", month: "short", day: "numeric" })} – ${new Date(`${data.until}T00:00:00Z`).toLocaleDateString(undefined, { timeZone: "UTC", month: "short", day: "numeric", year: "numeric" })}`;
    return <div className="space-y-7 [&_button]:cursor-pointer">
        <header className="flex flex-wrap items-start justify-between gap-4"><div><p className="text-xs font-medium uppercase tracking-wider text-primary">{name}</p><h2 className="mt-1 text-2xl font-semibold">Overview</h2><p className="mt-1 text-sm text-muted-foreground">{dates} · Last 28 complete days</p></div><Button variant="outline" onClick={refresh}><RefreshCw className={polling ? "animate-spin" : ""} aria-hidden="true" />Refresh</Button></header>
        {error && <RequestError error={error} retry={refresh} />}
        <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-border bg-muted/30 px-4 py-3 text-sm">
            <p><span className="font-medium">{data.coverage.reporting} of {data.coverage.total} connections reporting</span><span className="text-muted-foreground"> · {data.coverage.uniqueReporting} unique profiles · {data.coverage.stale} stale</span></p>
            <p role="status" className="text-xs text-muted-foreground">{polling ? "Updating stale analytics in the background…" : data.refreshing ? "Updates are still running. Refresh shortly to see the latest." : `Overview checked ${new Date(data.generatedAt).toLocaleTimeString()}`}</p>
        </div>
        <section className="space-y-3"><div><h3 className="text-lg font-semibold">Publishing</h3><p className="text-xs text-muted-foreground">Each destination and Story counts as one publication.</p></div><div className="grid grid-cols-2 gap-3 lg:grid-cols-4">{[
            { label: "Published", value: data.publishing.published, note: "Last 28 complete days", icon: CheckCircle2 },
            { label: "Failed", value: data.publishing.failed, note: "Failures in the last 28 complete days", icon: AlertCircle },
            { label: "Scheduled", value: data.publishing.scheduled, note: "Next 28 days", icon: CalendarDays },
            { label: "In queue", value: data.publishing.queued, note: "Pending, retrying, or publishing now", icon: Clock3 },
        ].map(item => <div key={item.label} className="rounded-xl border border-border bg-card p-4"><div className="flex items-center justify-between text-sm text-muted-foreground">{item.label}<item.icon className="h-4 w-4" aria-hidden="true" /></div><p className="mt-2 text-3xl font-semibold tabular-nums">{formatMetric(item.value)}</p><p className="mt-1 text-xs text-muted-foreground">{item.note}</p></div>)}</div></section>
        <section className="space-y-3"><div className="flex items-center gap-2"><Users className="h-5 w-5" aria-hidden="true" /><h3 className="text-lg font-semibold">Audience and visibility</h3></div><MetricCards metrics={data.metrics} keys={visibility} /><p className="text-xs text-muted-foreground">Followers can overlap across accounts. Views, impressions, and reach use different provider definitions. Reach is a sum of account totals, not unique people across the app. Pinterest account-wide results are counted once across boards.</p></section>
        <section className="space-y-3"><h3 className="text-lg font-semibold">Performance over time</h3><label className="flex items-center gap-3 text-sm">Show<select value={chart} onChange={event => setChart(event.target.value)} className="rounded-lg border border-border bg-background px-3 py-2"><option value="published">Published posts</option>{chartMetrics.map(metric => <option key={metric.key} value={metric.key}>{metric.label}</option>)}</select></label>
            <AnalyticsDailyChart key={chart} accountId="overview" title={chart === "published" ? "Daily publications" : `Daily ${selectedMetric?.label.toLowerCase() ?? chart}`} description={chart === "published" ? "Publications recorded by Amplypost, by UTC publish date." : "Available daily reports from connected profiles. Totals include only reporting profiles for each day."} unit={chart === "published" ? "publications" : selectedMetric?.label.toLowerCase() ?? chart} series={series} previewPosts={false} note="Missing provider days remain gaps. Reporting coverage can vary between days. Daily reach cannot be added to calculate unique reach for the period." />
        </section>
        <section className="space-y-3"><h3 className="text-lg font-semibold">Engagement</h3><MetricCards metrics={data.metrics} keys={engagement} /><p className="text-xs text-muted-foreground">Provider-reported engagements may overlap with likes, comments, and other actions. These cards should not be added together.</p></section>
        <section className="space-y-3"><h3 className="text-lg font-semibold">Traffic and business actions</h3><MetricCards metrics={data.metrics} keys={actions} /><p className="text-xs text-muted-foreground">Call-button clicks measure intent, not completed calls. Bookings and menu data depend on business features. — means unavailable.</p></section>
        <section className="space-y-3"><h3 className="text-lg font-semibold">Platform comparison</h3><div className="overflow-x-auto rounded-xl border border-border"><table className="w-full min-w-[700px] text-sm"><caption className="sr-only">Performance by platform over the last 28 complete days</caption><thead className="bg-muted/40"><tr>{["Platform", "Connections", "Published", "Followers", "Views", "Impressions", "Reach"].map(label => <th key={label} scope="col" className="p-3 text-left">{label}</th>)}</tr></thead><tbody>{providers.map(provider => {
            const accounts = data.accounts.filter(account => account.provider === provider);
            const total = (key: string) => { const values = accounts.map(account => account.values[key]).filter((value): value is number => typeof value === "number"); return values.length ? values.reduce((sum, value) => sum + value, 0) : null; };
            return <tr key={provider} className="border-t border-border"><td className="p-3"><Link href={accountLink(accounts[0].id, provider)} className="flex items-center gap-2 hover:underline"><Image src={getPlatformLogo(provider)} width={20} height={20} alt="" />{providerName(provider)}</Link></td><td className="p-3">{accounts.length}</td><td className="p-3">{data.publishing.byProvider[provider] ?? 0}</td>{["followers", "views", "impressions", "reach"].map(key => <td key={key} className="p-3 tabular-nums">{formatMetric(total(key))}</td>)}</tr>;
        })}</tbody></table></div></section>
        <section className="space-y-3"><div><h3 className="text-lg font-semibold">Top posts by platform</h3><p className="text-xs text-muted-foreground">Ranked within cached recent-post pages, not your entire publishing history. Lifetime totals and period totals are kept separate.</p></div>
            {!data.topPosts.length ? <p className="rounded-xl border border-dashed border-border p-6 text-sm text-muted-foreground">No cached post metrics yet. Available post pages will load in the background.</p> : <div className="grid gap-4 lg:grid-cols-2">{data.topPosts.map(group => <div key={group.provider} className="rounded-xl border border-border bg-card p-4"><h4 className="font-medium">{providerName(group.provider)}</h4><p className="mt-1 text-xs text-muted-foreground">{group.metric === "IMPRESSION" ? "Impressions" : "Views"} · {group.period === "last_28_days" ? "Last 28 complete days" : "Lifetime totals"} · {group.candidates} cached posts with metrics</p><ol className="mt-3 space-y-3">{group.items.map((post, index) => {
                const url = safeWebUrl(post.url ?? undefined), thumbnail = safeWebUrl(post.thumbnail ?? undefined);
                return <li key={post.id} className="flex items-center gap-3"><span className="text-sm text-muted-foreground">{index + 1}</span>{thumbnail && <Image src={thumbnail} unoptimized alt="" width={40} height={52} className="h-14 w-10 shrink-0 rounded object-cover" />}<div className="min-w-0 flex-1">{url ? <a href={url} target="_blank" rel="noopener noreferrer" className="line-clamp-2 text-sm hover:underline">{post.title}<ArrowUpRight className="ml-1 inline h-3 w-3" aria-label="opens in a new tab" /></a> : <p className="line-clamp-2 text-sm">{post.title}</p>}<Link href={accountLink(post.accountId, group.provider)} className="text-xs text-primary hover:underline">Account insights</Link></div><span className="text-sm font-semibold tabular-nums">{formatMetric(post.value)}</span></li>;
            })}</ol></div>)}</div>}
        </section>
        <section className="space-y-3"><h3 className="text-lg font-semibold">Account health and data freshness</h3>{!issues.length && <p className="text-sm text-muted-foreground">No connection issues detected.</p>}<div className="grid gap-3 md:grid-cols-2">{data.accounts.map(account => <div key={account.id} className="rounded-xl border border-border bg-card p-4"><Link href={accountLink(account.id, account.provider)} className="font-medium hover:underline">{account.name}</Link><p className="mt-1 text-xs text-muted-foreground">{providerName(account.provider)} · {account.reporting ? account.stale ? "Stale data" : "Cached analytics available" : "Not reporting"}{account.duplicate ? " · Shares account-wide totals with another connection" : ""}</p><p className="mt-1 text-xs text-muted-foreground">{account.updatedAt ? `Last fetched ${new Date(account.updatedAt).toLocaleString()}` : "No saved analytics yet"}</p>{account.reporting && !account.periodAligned && account.provider !== "tiktok" && <p className="mt-2 text-xs text-amber-700 dark:text-amber-300">Saved activity covers an earlier period and is excluded from these period totals.</p>}{(account.issue || account.tokenAttention) && <p className="mt-2 text-xs text-amber-700 dark:text-amber-300">{account.issue || "Connection credentials need attention."}</p>}{account.supported && (account.issue || account.tokenAttention) && <Link href="/connected-accounts" className="mt-2 inline-block text-xs text-primary hover:underline">Manage connection</Link>}</div>)}</div></section>
        <div className="grid gap-5 lg:grid-cols-2"><PostList title="Recent publishing activity" posts={data.recentPosts} /><PostList title="Upcoming posts" posts={data.upcomingPosts} upcoming /></div>
        <p className="text-xs text-muted-foreground">Analytics reuse saved provider responses and refresh when over an hour old. Unsupported metrics and unavailable connections are excluded, never treated as zero. TikTok lifetime video statistics are shown only in its post rankings.</p>
    </div>;
}
export default function AnalyticsOverview() {
    const { selectedWorkspaceId, selectedWorkspace, isLoadingWorkspaces } = useWorkspace();
    if (isLoadingWorkspaces) return <Loading label="Loading workspace…" />;
    return <OverviewContent key={selectedWorkspaceId ?? "all"} workspaceId={selectedWorkspaceId} name={selectedWorkspace?.name ?? "Your connected accounts"} />;
}
