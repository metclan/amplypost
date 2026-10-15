"use client";

import { useEffect, useId, useRef, useState } from "react";
import { formatMetric } from "@/lib/analytics";

import { AnalyticsDayPosts } from "./analytics-post-preview";

type Point = { date: string; value: number };
const day = 86_400_000;
const label = (time: number) => new Date(time).toLocaleDateString(undefined, { month: "short", day: "numeric", timeZone: "UTC" });

export default function AnalyticsDailyChart({ series, accountId, title, description, unit, note, previewPosts = true }: {
    series: Point[]; accountId: string; title: string; description: string; unit: string; note?: string; previewPosts?: boolean;
}) {
    const container = useRef<HTMLDivElement>(null);
    const gradient = useId().replaceAll(":", "");
    const [width, setWidth] = useState(600);
    const [active, setActive] = useState<number>();
    useEffect(() => {
        if (!container.current) return;
        const observer = new ResizeObserver(entries => setWidth(Math.max(260, entries[0].contentRect.width)));
        observer.observe(container.current);
        return () => observer.disconnect();
    }, []);
    // Meta supplies the end of each daily bucket. Label the day it measures.
    const points = series.filter(point => Number.isFinite(Date.parse(point.date)) && Number.isFinite(point.value) && point.value >= 0)
        .map(point => ({ ...point, time: Date.parse(point.date) - 1 }))
        .sort((a, b) => a.time - b.time);
    const left = 48, right = width - 20, top = 18, bottom = 220;
    const maximum = Math.max(1, ...points.map(point => point.value));
    const magnitude = 10 ** Math.floor(Math.log10(maximum));
    const step = Math.max(1, Math.ceil(maximum / magnitude / 4) * magnitude);
    const ceiling = step * 4;
    const first = points[0]?.time ?? 0;
    const last = points[points.length - 1]?.time ?? first;
    const x = (time: number) => first === last ? (left + right) / 2 : left + (time - first) / (last - first) * (right - left);
    const y = (value: number) => bottom - value / ceiling * (bottom - top);
    const selected = active === undefined ? undefined : points[active];
    const segments: typeof points[] = [];
    points.forEach((point, index) => {
        if (!index || point.time - points[index - 1].time > day * 1.5) segments.push([]);
        segments[segments.length - 1].push(point);
    });
    const ticks = [...new Set([0, Math.floor((points.length - 1) / 2), points.length - 1])].filter(index => index >= 0);
    const compact = new Intl.NumberFormat(undefined, { notation: "compact" });
    return <section className="min-w-0 rounded-xl border border-border bg-card p-4">
        <h3 className="font-semibold">{title}</h3>
        <p className="mt-1 text-xs text-muted-foreground">{description} Hover or tap to explore.</p>
        {!points.length ? <p className="py-12 text-sm text-muted-foreground">{title} isn’t available for this account yet.</p> : <>
            <div className="mt-4 flex min-h-10 items-baseline justify-between gap-2 text-sm" aria-live="polite" aria-atomic="true">
                <span className="text-muted-foreground">{selected ? label(selected.time) : "Last 28 complete days"}</span>
                <span className="font-semibold tabular-nums">{selected ? `${formatMetric(selected.value)} ${unit}` : title}</span>
            </div>
            <div ref={container} className="relative" onBlur={event => { if (!event.currentTarget.contains(event.relatedTarget)) setActive(undefined); }} onKeyDown={event => { if (event.key === "Escape") setActive(undefined); }} onPointerLeave={event => { if (event.pointerType === "mouse") setActive(undefined); }}>
                <svg viewBox={`0 0 ${width} 260`} width="100%" height="260" role="img" tabIndex={0}
                    className="cursor-pointer rounded outline-offset-2 focus-visible:outline-2 focus-visible:outline-primary"
                    aria-label={`${title} line chart. Use left and right arrow keys to explore dates. Exact values are available below.`}
                    onFocus={() => setActive(points.length - 1)}
                    onPointerMove={event => {
                        const rect = event.currentTarget.getBoundingClientRect();
                        const position = (event.clientX - rect.left) * width / rect.width;
                        let nearest = 0;
                        points.forEach((point, index) => { if (Math.abs(x(point.time) - position) < Math.abs(x(points[nearest].time) - position)) nearest = index; });
                        setActive(nearest);
                    }}
                    onPointerDown={event => {
                        const rect = event.currentTarget.getBoundingClientRect();
                        const position = (event.clientX - rect.left) * width / rect.width;
                        let nearest = 0;
                        points.forEach((point, index) => { if (Math.abs(x(point.time) - position) < Math.abs(x(points[nearest].time) - position)) nearest = index; });
                        setActive(nearest);
                    }}
                    onKeyDown={event => {
                        if (event.key === "Escape") { setActive(undefined); return; }
                        if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
                        event.preventDefault();
                        setActive(index => event.key === "Home" ? 0 : event.key === "End" ? points.length - 1 : Math.max(0, Math.min(points.length - 1, (index ?? 0) + (event.key === "ArrowRight" ? 1 : -1))));
                    }}>
                    <defs><linearGradient id={gradient} x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="var(--primary)" stopOpacity="0.22" /><stop offset="100%" stopColor="var(--primary)" stopOpacity="0.02" /></linearGradient></defs>
                    {[0, 1, 2, 3, 4].map(tick => <g key={tick} aria-hidden="true"><line x1={left} x2={right} y1={y(tick * step)} y2={y(tick * step)} stroke="currentColor" strokeOpacity="0.12" strokeDasharray="3 5" /><text x={left - 8} y={y(tick * step) + 4} textAnchor="end" fill="currentColor" className="text-muted-foreground" fontSize="11">{compact.format(tick * step)}</text></g>)}
                    {ticks.map(index => <text key={index} x={x(points[index].time)} y="248" textAnchor="middle" fill="currentColor" className="text-muted-foreground" fontSize="11">{label(points[index].time)}</text>)}
                    {segments.map((segment, index) => {
                        const path = segment.map((point, i) => `${i ? "L" : "M"} ${x(point.time)} ${y(point.value)}`).join(" ");
                        return <g key={index} aria-hidden="true"><path d={`${path} L ${x(segment[segment.length - 1].time)} ${bottom} L ${x(segment[0].time)} ${bottom} Z`} fill={`url(#${gradient})`} /><path d={path} fill="none" stroke="var(--primary)" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" /></g>;
                    })}
                    {points.map((point, index) => <circle key={`${point.date}:${index}`} cx={x(point.time)} cy={y(point.value)} r={points.length === 1 ? 4 : 2.5} fill="var(--primary)" aria-hidden="true" />)}
                    {selected && <g aria-hidden="true"><line x1={x(selected.time)} x2={x(selected.time)} y1={top} y2={bottom} stroke="var(--primary)" strokeOpacity="0.5" strokeDasharray="4 4" /><circle cx={x(selected.time)} cy={y(selected.value)} r="6" fill="var(--primary)" stroke="var(--background)" strokeWidth="3" /></g>}
                </svg>
                {selected && <div className="absolute top-4 z-20 w-64 max-w-[calc(100%-1rem)] rounded-xl border border-border bg-popover p-3 text-popover-foreground shadow-lg" style={{ left: Math.max(0, Math.min(width - 264, x(selected.time) - 128)) }}>
                    <div className="mb-2 flex justify-between gap-2 text-xs font-semibold"><span>{label(selected.time)}</span><span>{formatMetric(selected.value)} {unit}</span></div>
                    {previewPosts && <AnalyticsDayPosts accountId={accountId} time={selected.time} periodEnd={selected.date} />}
                </div>}
            </div>
            <p className="text-xs text-muted-foreground">{note} Gaps indicate unavailable days.</p>
            <details className="mt-4 text-sm"><summary className="cursor-pointer">View daily values</summary><table className="mt-3 w-full"><caption className="sr-only">{title}</caption><thead><tr><th scope="col" className="text-left">Day</th><th scope="col" className="text-right">{unit}</th></tr></thead><tbody>{points.map((point, index) => <tr key={`${point.date}:${index}`}><td>{label(point.time)}</td><td className="text-right tabular-nums">{formatMetric(point.value)}</td></tr>)}</tbody></table></details>
        </>}
    </section>;
}
