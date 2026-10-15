"use client";

import { useEffect, useRef, useState } from "react";
import { fetchAnalytics, safeWebUrl, type AnalyticsPost, type AnalyticsResponse } from "@/lib/analytics";
import { VideoThumbnail } from "./analytics-shared";

export function AnalyticsPostPreview({ post }: { post: AnalyticsPost }) {
    const href = safeWebUrl(post.metadata.share_url);
    return <div className="flex items-center gap-3 text-left">
        <VideoThumbnail post={post} />
        <div className="min-w-0"><p className="line-clamp-2 text-sm font-medium">{post.metadata.title || "Untitled post"}</p><p className="mt-1 text-xs text-muted-foreground">{post.metadata.media_type} {post.metadata.create_time ? `· ${new Date(post.metadata.create_time * 1000).toLocaleDateString(undefined, { timeZone: "UTC" })}` : ""}</p>
            {href && <a href={href} target="_blank" rel="noopener noreferrer" className="mt-1 inline-block text-xs font-medium text-primary hover:underline">View post ↗<span className="sr-only"> (opens in a new tab)</span></a>}
        </div>
    </div>;
}

// Load pages only when a day is explored, and reuse them as the user moves.
export function AnalyticsDayPosts({ accountId, time, periodEnd }: { accountId: string; time: number; periodEnd?: string }) {
    const pages = useRef(new Map<string, AnalyticsResponse>());
    const date = periodEnd ?? new Date(time).toISOString().slice(0, 10);
    const [result, setResult] = useState<{ date: string; posts?: AnalyticsPost[]; error?: string }>();
    const [attempt, setAttempt] = useState(0);
    useEffect(() => {
        const controller = new AbortController();
        const timer = setTimeout(async () => {
            try {
                const start = periodEnd ? Date.parse(periodEnd) / 1000 - 86400 : Date.parse(`${date}T00:00:00Z`) / 1000;
                const end = start + 86400;
                const matches = new Map<string, AnalyticsPost>();
                const seen = new Set<string>();
                let cursor: string | undefined;
                for (let index = 0; index < 100; index++) {
                    controller.signal.throwIfAborted();
                    const key = `${accountId}:${cursor ?? "first"}`;
                    if (seen.has(key)) throw new Error("Post pagination stopped progressing.");
                    seen.add(key);
                    const page = pages.current.get(key) ?? await fetchAnalytics(accountId, "posts", cursor, controller.signal);
                    controller.signal.throwIfAborted();
                    pages.current.set(key, page);
                    const posts = page.payload.items ?? [];
                    for (const post of posts) {
                        if (typeof post.metadata.create_time !== "number") throw new Error("A post is missing its publish date.");
                        if (post.metadata.create_time >= start && post.metadata.create_time < end) matches.set(post.externalId, post);
                    }
                    if (posts.some(post => post.metadata.create_time! < start) || !page.payload.pagination?.hasMore) {
                        setResult({ date, posts: [...matches.values()] });
                        return;
                    }
                    cursor = page.payload.pagination.nextCursor ?? undefined;
                    if (!cursor) throw new Error("The provider did not return the next page.");
                }
                throw new Error("Too many pages to load this day. Try a more recent date.");
            } catch (error) {
                if (!controller.signal.aborted) setResult({ date, error: error instanceof Error ? error.message : "Unable to load posts." });
            }
        }, 250);
        return () => { clearTimeout(timer); controller.abort(); };
    }, [accountId, date, periodEnd, attempt]);
    return <div className="space-y-2">
        <p className="text-xs font-medium">{periodEnd ? "Posts published in this reporting period" : "Posts published this day · UTC"}</p>
        <p className="text-xs text-muted-foreground">Daily metrics can include activity on older posts too.</p>
        {result?.date !== date ? <p role="status" className="text-xs text-muted-foreground">Loading posts…</p> : result.error ? <div role="alert" className="text-xs"><p>{result.error}</p><button className="mt-1 cursor-pointer text-primary hover:underline" onClick={() => { setResult(undefined); setAttempt(value => value + 1); }}>Try again</button></div> : result.posts?.length ? <div className="max-h-56 space-y-3 overflow-y-auto">{result.posts.map(post => <AnalyticsPostPreview key={post.externalId} post={post} />)}</div> : <p className="text-xs text-muted-foreground">No posts published this day.</p>}
    </div>;
}
