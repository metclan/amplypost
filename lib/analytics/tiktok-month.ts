import type { AnalyticsPost, AnalyticsResponse } from "../analytics";

export type TikTokMonth = {
    items: AnalyticsPost[];
    updatedAt: string;
    stale: boolean;
    refreshFailed: boolean;
};

export function currentMonth(now = new Date()) {
    return `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, "0")}`;
}

export function monthBounds(month: string) {
    if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(month)) throw new Error("Choose a valid month.");
    const [year, index] = month.split("-").map(Number);
    if (year < 2000 || year > 9998) throw new Error("Choose a valid month.");
    return { start: Date.UTC(year, index - 1, 1), end: Date.UTC(year, index, 1) };
}

export function monthLabel(month: string) {
    return new Date(monthBounds(month).start).toLocaleDateString(undefined, { month: "long", year: "numeric", timeZone: "UTC" });
}

export function shiftMonth(month: string, delta: number) {
    const date = new Date(monthBounds(month).start);
    date.setUTCMonth(date.getUTCMonth() + delta);
    return currentMonth(date);
}

// TikTok accepts a timestamp cursor to start before the month boundary. Walk
// every page in this month, preserving the oldest successful fetch timestamp.
// Never return a partial month as if it were complete.
export async function loadTikTokMonth(
    month: string,
    fetchPage: (cursor: string, signal: AbortSignal) => Promise<AnalyticsResponse>,
    signal: AbortSignal,
    onProgress?: (videos: number) => void,
): Promise<TikTokMonth> {
    const { start, end } = monthBounds(month);
    const posts = new Map<string, AnalyticsPost>();
    let cursor = String(end);
    let oldestUpdate = Infinity;
    let stale = false;
    let refreshFailed = false;
    for (let page = 0; page < 100; page++) {
        signal.throwIfAborted();
        const result = await fetchPage(cursor, signal);
        signal.throwIfAborted();
        oldestUpdate = Math.min(oldestUpdate, Date.parse(result.updatedAt));
        stale ||= result.stale;
        refreshFailed ||= result.refreshFailed;
        let crossedStart = false;
        for (const post of result.payload.items ?? []) {
            const time = post.metadata.create_time;
            if (typeof time !== "number" || !Number.isFinite(time)) {
                throw new Error("A video is missing its publish date. Please retry loading the month.");
            }
            const milliseconds = time * 1000;
            if (milliseconds < start) crossedStart = true;
            if (milliseconds >= start && milliseconds < end) posts.set(post.externalId, post);
        }
        onProgress?.(posts.size);
        if (crossedStart || !result.payload.pagination?.hasMore) {
            return {
                items: [...posts.values()].sort((a, b) => b.metadata.create_time! - a.metadata.create_time!),
                updatedAt: new Date(oldestUpdate).toISOString(), stale, refreshFailed,
            };
        }
        const next = result.payload.pagination.nextCursor;
        if (!next || !/^\d+$/.test(next) || !Number.isSafeInteger(Number(next)) || Number(next) >= Number(cursor)) {
            throw new Error("TikTok pagination stopped progressing. Please retry loading the month.");
        }
        cursor = next;
    }
    throw new Error("This month has too many video pages to load in one request. No partial chart is shown.");
}
