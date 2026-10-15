"use client";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { analyticsProviders, fetchAnalytics, formatMetric, safeWebUrl, type AnalyticsResponse } from "@/lib/analytics";
import { Loading, RequestError, Freshness, VideoThumbnail } from "./analytics-shared";
import { AnalyticsSortHeader, type AnalyticsSort } from "./analytics-sort-header";
import { AnalyticsPostPreview } from "./analytics-post-preview";

export default function AnalyticsPosts({ id, provider }: { id: string; provider: "instagram" | "facebook" | "threads" | "pinterest" }) {
    const [cursors, setCursors] = useState<(string | undefined)[]>([undefined]);
    const [attempt, setAttempt] = useState(0);
    const [metric, setMetric] = useState(analyticsProviders[provider].postMetrics[0].key);
    const [hovered, setHovered] = useState<string>();
    const [sort, setSort] = useState<AnalyticsSort>({ key: analyticsProviders[provider].postMetrics[0].key, direction: "descending" });
    const [state, setState] = useState<{ data?: AnalyticsResponse; error?: Error; loading: boolean }>({ loading: true });
    const cursor = cursors[cursors.length - 1];
    useEffect(() => {
        const controller = new AbortController();
        fetchAnalytics(id, "posts", cursor, controller.signal).then(data => { if (!controller.signal.aborted) setState({ data, loading: false }); }).catch(error => { if (!controller.signal.aborted) setState({ error, loading: false }); });
        return () => controller.abort();
    }, [id, cursor, attempt]);
    const retry = () => { setState({ loading: true }); setAttempt(value => value + 1); };
    if (state.loading) return <Loading label="Loading post performance…" />;
    if (state.error) return <RequestError error={state.error} retry={retry} />;
    const data = state.data!;
    const items = data.payload.items ?? [];
    const periodLabel = data.payload.period === "last_28_days" ? "Last 28 complete days · UTC" : "Lifetime totals";
    const contentLabel = provider === "pinterest" ? "Pin" : "Post";
    const definitions = analyticsProviders[provider].postMetrics;
    const max = Math.max(1, ...items.map(post => post.metrics[metric] ?? 0));
    const sorted = [...items].sort((a, b) => {
        const av = a.metrics[sort.key], bv = b.metrics[sort.key];
        if (av == null) return bv == null ? 0 : 1;
        if (bv == null) return -1;
        return sort.direction === "ascending" ? av - bv : bv - av;
    });
    const next = data.payload.pagination?.nextCursor;
    return <section className="space-y-5"><div><h3 className="text-lg font-semibold">{contentLabel} performance</h3><p className="text-sm text-muted-foreground">{periodLabel} · Sorting applies to this page · Page {cursors.length} · — means unavailable</p></div>
        {provider === "pinterest" && <p className="text-xs text-muted-foreground">{data.payload.scope === "board" ? "Pins on the selected board." : "Pins belonging to this account."} Metrics cover activity during the last 28 complete days, including activity on older Pins. Saved Pins from other creators may not expose insights. Video views apply only to video Pins.</p>}
        {!items.length ? <p className="rounded-xl border border-dashed p-8 text-center text-muted-foreground">No {provider === "pinterest" ? "Pins" : "posts"} to display.</p> : <>
            <div className="space-y-3 rounded-xl border border-border bg-card p-4">
                <div role="tablist" aria-label="Compare posts by" className="flex flex-wrap gap-1 rounded-lg bg-muted/60 p-1">
                    {definitions.map((item, index) => <button key={item.key} type="button" role="tab" id={`compare-${item.key}`} aria-controls="post-comparison" aria-selected={metric === item.key} tabIndex={metric === item.key ? 0 : -1}
                        onClick={() => { setMetric(item.key); setHovered(undefined); }}
                        onKeyDown={event => {
                            if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
                            event.preventDefault();
                            const next = event.key === "Home" ? 0 : event.key === "End" ? definitions.length - 1 : (index + (event.key === "ArrowRight" ? 1 : -1) + definitions.length) % definitions.length;
                            setMetric(definitions[next].key); setHovered(undefined);
                            document.getElementById(`compare-${definitions[next].key}`)?.focus();
                        }}
                        className={`cursor-pointer rounded-md px-3 py-1.5 text-xs font-medium focus-visible:outline-2 focus-visible:outline-primary ${metric === item.key ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}>{item.label}</button>)}
                </div>
                <div id="post-comparison" role="tabpanel" aria-labelledby={`compare-${metric}`} className="space-y-2">
                    {items.map((post, index) => <div key={post.externalId} className="relative" onPointerEnter={() => setHovered(post.externalId)} onPointerLeave={() => setHovered(undefined)} onFocus={() => setHovered(post.externalId)} onBlur={event => { if (!event.currentTarget.contains(event.relatedTarget)) setHovered(undefined); }} onKeyDown={event => { if (event.key === "Escape") setHovered(undefined); }}>
                        <button type="button" aria-expanded={hovered === post.externalId} aria-controls={`preview-${post.externalId}`} onClick={() => setHovered(post.externalId)} className="grid w-full cursor-pointer grid-cols-[6rem_1fr_5rem] items-center gap-3 rounded-md py-1 text-sm focus-visible:outline-2 focus-visible:outline-primary">
                            <span className="truncate text-left">Post {index + 1}</span><span className="h-3 rounded bg-muted"><span className="block h-full rounded bg-primary transition-[width,opacity] duration-500 ease-out motion-reduce:transition-none" style={{ width: `${(post.metrics[metric] ?? 0) / max * 100}%`, opacity: post.metrics[metric] == null ? 0 : 1 }} /></span><span className="text-right tabular-nums">{formatMetric(post.metrics[metric])}</span>
                        </button>
                        {hovered === post.externalId && <div id={`preview-${post.externalId}`} className="absolute left-12 top-full z-20 w-72 max-w-[calc(100%-3rem)] rounded-xl border border-border bg-popover p-3 text-popover-foreground shadow-lg"><AnalyticsPostPreview post={post} /></div>}
                    </div>)}
                </div>
            </div>
            <div className="overflow-x-auto rounded-xl border border-border"><table className="w-full min-w-[900px] text-sm"><caption className="sr-only">{analyticsProviders[provider].name} {periodLabel} post metrics</caption><thead className="bg-muted/40"><tr><th scope="col" className="p-3 text-left">Post</th>{definitions.map(item => <AnalyticsSortHeader key={item.key} column={item.key} label={item.label} sort={sort} onSort={setSort} />)}<th scope="col" className="p-3 text-right">Link</th></tr></thead><tbody>{sorted.map((post) => { const href = safeWebUrl(post.metadata.share_url); return <tr key={post.externalId} className="border-t border-border"><td className="p-3"><div className="flex items-center gap-3"><VideoThumbnail post={post} /><div className="max-w-xs"><p className="text-xs text-muted-foreground">Post {items.findIndex(item => item.externalId === post.externalId) + 1} · {post.metadata.media_type}</p>{href ? <a className="line-clamp-2 font-medium hover:underline" href={href} target="_blank" rel="noopener noreferrer">{post.metadata.title || "View post"}<span className="sr-only"> (opens in a new tab)</span></a> : <p className="line-clamp-2">{post.metadata.title || "Untitled post"}</p>}<p className="text-xs text-muted-foreground">{post.metadata.create_time && new Date(post.metadata.create_time * 1000).toLocaleDateString()}</p></div></div></td>{definitions.map(item => <td key={item.key} className="p-3 text-right tabular-nums">{formatMetric(post.metrics[item.key])}</td>)}<td className="p-3 text-right">{href ? <a href={href} target="_blank" rel="noopener noreferrer" className="whitespace-nowrap font-medium text-primary hover:underline">View post ↗<span className="sr-only"> (opens in a new tab)</span></a> : <span className="text-muted-foreground">—</span>}</td></tr>; })}</tbody></table></div>
        </>}
        <div className="flex justify-end gap-2"><Button className="cursor-pointer" variant="outline" disabled={cursors.length === 1} onClick={() => { setState({ loading: true }); setCursors(value => value.slice(0, -1)); }}>Previous</Button><Button className="cursor-pointer" variant="outline" disabled={!next || cursors.includes(next)} onClick={() => { if (next) { setState({ loading: true }); setCursors(value => [...value, next]); } }}>Next</Button></div><Freshness data={data} />
    </section>;
}

