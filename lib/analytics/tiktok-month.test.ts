import assert from "node:assert/strict";
import { test } from "node:test";
import { loadTikTokMonth, monthBounds, shiftMonth } from "./tiktok-month";
import type { AnalyticsPost, AnalyticsResponse } from "../analytics";

const video = (id: string, day: string): AnalyticsPost => ({ externalId: id, metadata: { create_time: Date.parse(day) / 1000 }, metrics: { view_count: 10 } });
const response = (items: AnalyticsPost[], nextCursor: string | null, options: Partial<AnalyticsResponse> = {}): AnalyticsResponse => ({
    accountId: "test", provider: "tiktok", resource: "posts", updatedAt: "2026-09-30T12:00:00Z", stale: false, refreshFailed: false,
    payload: { schemaVersion: 1, period: "lifetime", items, pagination: { hasMore: nextCursor !== null, nextCursor } }, ...options,
});
const signal = () => new AbortController().signal;

test("loads the whole month across pages, deduplicates, and stops at the lower boundary", async () => {
    const cursors: string[] = [];
    const first = Array.from({ length: 20 }, (_, i) => video(`v${i}`, `2026-09-${String(30 - i).padStart(2, "0")}T12:00:00Z`));
    const next = String(Date.parse("2026-09-11T00:00:00Z"));
    const result = await loadTikTokMonth("2026-09", async cursor => {
        cursors.push(cursor);
        return cursors.length === 1 ? response(first, next) : response([
            first[19], video("extra", "2026-09-01T00:00:00Z"), video("old", "2026-08-31T23:59:59Z"),
        ], String(Date.parse("2026-08-31T00:00:00Z")));
    }, signal());
    assert.deepEqual(cursors, [String(Date.parse("2026-10-01T00:00:00Z")), next]);
    assert.equal(result.items.length, 21);
    assert.equal(result.items.at(-1)?.externalId, "extra");
});

test("filters the upper month boundary and preserves the oldest refresh and stale flags", async () => {
    let calls = 0;
    const result = await loadTikTokMonth("2026-09", async () => ++calls === 1
        ? response([video("next-month", "2026-10-01T00:00:00Z"), video("in-month", "2026-09-30T23:59:59Z")], String(Date.parse("2026-09-15T00:00:00Z")))
        : response([], null, { updatedAt: "2026-09-30T09:00:00Z", stale: true, refreshFailed: true }), signal());
    assert.deepEqual(result.items.map(post => post.externalId), ["in-month"]);
    assert.equal(result.updatedAt, "2026-09-30T09:00:00.000Z");
    assert.equal(result.stale, true);
    assert.equal(result.refreshFailed, true);
});

test("repeated cursor fails instead of displaying an incomplete month", async () => {
    await assert.rejects(loadTikTokMonth("2026-09", async cursor => response([], cursor), signal()), /stopped progressing/);
});

test("a failed later page does not return partial analytics", async () => {
    let calls = 0;
    await assert.rejects(loadTikTokMonth("2026-09", async () => {
        if (++calls === 2) throw new Error("Rate limited");
        return response([video("one", "2026-09-20T00:00:00Z")], String(Date.parse("2026-09-19T00:00:00Z")));
    }, signal()), /Rate limited/);
});

test("aborted account/month requests do not continue fetching", async () => {
    const controller = new AbortController();
    let calls = 0;
    await assert.rejects(loadTikTokMonth("2026-09", async () => {
        calls++;
        controller.abort();
        return response([], "1");
    }, controller.signal), { name: "AbortError" });
    assert.equal(calls, 1);
});

test("missing dates cannot produce misleading monthly results", async () => {
    await assert.rejects(loadTikTokMonth("2026-09", async () => response([{ externalId: "no-date", metadata: {}, metrics: {} }], null), signal()), /missing its publish date/);
});

test("UTC month navigation handles leap years and year rollover", () => {
    const leap = monthBounds("2024-02");
    assert.equal((leap.end - leap.start) / 86400000, 29);
    assert.equal(shiftMonth("2026-12", 1), "2027-01");
    assert.equal(shiftMonth("2026-01", -1), "2025-12");
    assert.throws(() => monthBounds("2026-13"), /valid month/);
});
