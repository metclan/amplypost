"use client";

import { useEffect, useId, useRef, useState } from "react";
import { ExternalLink } from "lucide-react";
import { analyticsProviders, formatMetric, safeWebUrl, type AnalyticsPost } from "@/lib/analytics";
import { monthBounds, monthLabel } from "@/lib/analytics/tiktok-month";
import { VideoThumbnail } from "./analytics-shared";

const compact = new Intl.NumberFormat(undefined, { notation: "compact", maximumFractionDigits: 1 });
const title = (post: AnalyticsPost) => post.metadata.title || post.metadata.video_description || "Untitled video";

export default function TikTokMonthChart({ items, month }: { items: AnalyticsPost[]; month: string }) {
    const [metricKey, setMetricKey] = useState("view_count");
    const [activeId, setActiveId] = useState<string>();
    const [width, setWidth] = useState(800);
    const container = useRef<HTMLDivElement>(null);
    const gradientId = useId().replaceAll(":", "");
    const metric = analyticsProviders.tiktok.postMetrics.find(item => item.key === metricKey)!;
    useEffect(() => {
        if (!container.current) return;
        const observer = new ResizeObserver(entries => setWidth(Math.max(260, entries[0].contentRect.width)));
        observer.observe(container.current);
        return () => observer.disconnect();
    }, []);

    const { start, end } = monthBounds(month);
    const ordered = [...items].sort((a, b) => a.metadata.create_time! - b.metadata.create_time!);
    const known = ordered.filter(post => typeof post.metrics[metricKey] === "number" && Number.isFinite(post.metrics[metricKey]));
    const maximum = Math.max(0, ...known.map(post => post.metrics[metricKey]!));
    const magnitude = 10 ** Math.floor(Math.log10(Math.max(1, maximum)));
    const step = Math.max(1, Math.ceil(maximum / magnitude / 4) * magnitude);
    const ceiling = step * 4;
    const left = 48, right = width - 20, top = 24, bottom = 252;
    const x = (post: AnalyticsPost) => left + ((post.metadata.create_time! * 1000 - start) / (end - start)) * (right - left);
    const y = (post: AnalyticsPost) => bottom - post.metrics[metricKey]! / ceiling * (bottom - top);
    // Missing metrics break the line; they are never plotted as zero.
    const segments: AnalyticsPost[][] = [];
    let segment: AnalyticsPost[] = [];
    for (const post of ordered) {
        if (typeof post.metrics[metricKey] === "number" && Number.isFinite(post.metrics[metricKey])) segment.push(post);
        else if (segment.length) { segments.push(segment); segment = []; }
    }
    if (segment.length) segments.push(segment);
    const active = known.find(post => post.externalId === activeId);
    const peak = known.reduce<AnalyticsPost | undefined>((best, post) => !best || post.metrics[metricKey]! > best.metrics[metricKey]! ? post : best, undefined);
    const days = Math.round((end - start) / 86400000);
    const ticks = [1, 8, 15, 22, days];
    const tooltipWidth = Math.min(280, width - 24);
    const tooltipLeft = active ? Math.max(8, Math.min(width - tooltipWidth - 8, x(active) - tooltipWidth / 2)) : 0;
    const selectNearest = (event: React.PointerEvent<SVGSVGElement>) => {
        if (!known.length) return;
        const rect = event.currentTarget.getBoundingClientRect();
        const px = (event.clientX - rect.left) * width / rect.width;
        const py = (event.clientY - rect.top) * 290 / rect.height;
        const nearest = known.reduce((a, b) => Math.hypot(x(a) - px, (y(a) - py) * 0.3) <= Math.hypot(x(b) - px, (y(b) - py) * 0.3) ? a : b);
        setActiveId(nearest.externalId);
    };

    return <section className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm" aria-label="Monthly video performance chart">
        <div className="flex flex-wrap items-start justify-between gap-4 px-5 pt-5 sm:px-6">
            <div><h3 className="text-lg font-semibold">Video performance</h3><p className="mt-1 text-xs text-muted-foreground">{monthLabel(month)} · {items.length} public {items.length === 1 ? "video" : "videos"}</p></div>
            <div role="group" aria-label="Chart metric" className="flex flex-wrap gap-1 rounded-lg bg-muted/60 p-1">
                {analyticsProviders.tiktok.postMetrics.map(item => <button key={item.key} type="button" aria-pressed={item.key === metricKey} onClick={() => { setMetricKey(item.key); setActiveId(undefined); }} className={`rounded-md px-3 py-1.5 text-xs font-medium focus-visible:outline-2 focus-visible:outline-primary ${item.key === metricKey ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}>{item.label}</button>)}
            </div>
        </div>
        <div className="px-3 pb-3 pt-5 sm:px-5">
            <div ref={container} className="relative" onPointerLeave={event => { if (event.pointerType === "mouse") setActiveId(undefined); }}>
                <svg width="100%" height="290" viewBox={`0 0 ${width} 290`} role="img" tabIndex={known.length ? 0 : undefined}
                    aria-label={`${metric.label} for videos published in ${monthLabel(month)}. Each point is a video’s current lifetime total. Use arrow keys to explore videos.`}
                    className="overflow-visible rounded-lg text-muted-foreground outline-offset-2 focus-visible:outline-2 focus-visible:outline-primary"
                    onPointerMove={selectNearest} onPointerDown={selectNearest} onFocus={() => setActiveId(value => value ?? peak?.externalId)} onBlur={() => setActiveId(undefined)}
                    onKeyDown={event => {
                        if (event.key === "Escape") { setActiveId(undefined); return; }
                        if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key) || !known.length) return;
                        event.preventDefault();
                        const index = known.findIndex(post => post.externalId === activeId);
                        const next = event.key === "Home" ? 0 : event.key === "End" ? known.length - 1 : Math.max(0, Math.min(known.length - 1, index + (event.key === "ArrowRight" ? 1 : -1)));
                        setActiveId(known[next].externalId);
                    }}>
                    <defs><linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="var(--primary)" stopOpacity="0.18" /><stop offset="100%" stopColor="var(--primary)" stopOpacity="0.01" /></linearGradient></defs>
                    {[0, 1, 2, 3, 4].map(tick => { const py = bottom - tick / 4 * (bottom - top); return <g key={tick} aria-hidden="true"><line x1={left} x2={right} y1={py} y2={py} stroke="currentColor" strokeOpacity="0.16" strokeDasharray="3 5" /><text x={left - 10} y={py + 4} textAnchor="end" fill="currentColor" fontSize="10">{compact.format(step * tick)}</text></g>; })}
                    {ticks.map(day => <text key={day} aria-hidden="true" x={left + (day - 1) / days * (right - left)} y="278" fill="currentColor" textAnchor="middle" fontSize="11">{day}</text>)}
                    {segments.map((posts, index) => {
                        const line = posts.map((post, i) => `${i === 0 ? "M" : "L"} ${x(post)} ${y(post)}`).join(" ");
                        return <g key={index} aria-hidden="true"><path d={`${line} L ${x(posts[posts.length - 1])} ${bottom} L ${x(posts[0])} ${bottom} Z`} fill={`url(#${gradientId})`} /><path d={line} fill="none" stroke="var(--primary)" strokeWidth="2.5" strokeLinejoin="round" /></g>;
                    })}
                    {known.map(post => <circle key={post.externalId} cx={x(post)} cy={y(post)} r={post.externalId === activeId ? 5 : 3.5} fill="var(--primary)" stroke="var(--card)" strokeWidth="2" aria-hidden="true" />)}
                    {active && <line x1={x(active)} x2={x(active)} y1={top} y2={bottom} stroke="var(--primary)" strokeOpacity="0.4" strokeDasharray="4 4" aria-hidden="true" />}
                </svg>
                {!known.length && <div className="pointer-events-none absolute inset-0 flex items-center justify-center px-10 text-center"><p className="rounded-lg bg-card/95 p-4 text-sm text-muted-foreground">{items.length ? `${metric.label} aren’t available for these videos.` : "No public videos were published this month."}</p></div>}
                {active && <div role="tooltip" className="pointer-events-none absolute z-10 rounded-xl border border-border bg-popover p-3 text-popover-foreground shadow-lg" style={{ width: tooltipWidth, left: tooltipLeft, top: Math.max(6, y(active) - 120) }}>
                    <div className="flex gap-3"><VideoThumbnail post={active} /><div className="min-w-0"><p className="line-clamp-2 text-xs font-semibold">{title(active)}</p><p className="mt-1 text-[11px] text-muted-foreground">{new Date(active.metadata.create_time! * 1000).toLocaleDateString(undefined, { month: "short", day: "numeric", timeZone: "UTC" })}</p><p className="mt-2 text-sm font-semibold tabular-nums">{formatMetric(active.metrics[metricKey])} <span className="font-normal text-muted-foreground">{metric.label.toLowerCase()}</span></p></div></div>
                </div>}
            </div>
            <p className="px-2 text-xs leading-5 text-muted-foreground">Publish date (UTC) · Each point shows a video’s current lifetime {metric.label.toLowerCase()}. Hover, tap, or use arrow keys to explore.{known.length < items.length && ` ${items.length - known.length} videos have no ${metric.label.toLowerCase()} data.`}</p>
            <span className="sr-only" aria-live="polite">{active ? `${title(active)}: ${formatMetric(active.metrics[metricKey])} ${metric.label}` : ""}</span>
        </div>
        {peak && <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border bg-muted/20 px-5 py-4 sm:px-6">
            <div className="min-w-0 flex-1"><p className="text-xs text-muted-foreground">Top video in {monthLabel(month)} by {metric.label.toLowerCase()}</p><p className="mt-1 truncate text-sm font-medium" title={title(peak)}>{title(peak)}</p>{safeWebUrl(peak.metadata.share_url) && <a href={safeWebUrl(peak.metadata.share_url)} target="_blank" rel="noopener noreferrer" className="mt-1 inline-flex items-center gap-1 text-xs text-primary hover:underline">View on TikTok<ExternalLink className="h-3 w-3" aria-hidden="true" /><span className="sr-only"> (opens in a new tab)</span></a>}</div>
            <p className="text-right text-xl font-semibold tabular-nums">{formatMetric(peak.metrics[metricKey])}<span className="mt-1 block text-xs font-normal text-muted-foreground">Lifetime {metric.label.toLowerCase()}</span></p>
        </div>}
    </section>;
}
