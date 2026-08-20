"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
    AlertTriangle,
    CalendarClock,
    CheckCircle2,
    Clock3,
    Link2,
    Loader2,
    Send,
} from "lucide-react";

interface DashboardTotals {
    posts: number;
    pendingPosts: number;
    scheduledPosts: number;
    accounts: number;
    accountsRequiringAttention: number;
}

interface DashboardResponse {
    data?: {
        totals?: Partial<DashboardTotals>;
    };
    message?: string;
}

interface RecentPost {
    provider: string;
    status: string;
    isStory: boolean;
    createdAt: string;
}

interface RecentPostsResponse {
    data?: RecentPost[];
    message?: string;
}

function getMonthRange(date: Date) {
    const from = new Date(date.getFullYear(), date.getMonth(), 1, 0, 0, 0, 0);
    const to = new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999);

    return {
        from: from.toISOString(),
        to: to.toISOString(),
    };
}

function formatMonth(date: Date) {
    return date.toLocaleDateString(undefined, {
        month: "long",
        year: "numeric",
    });
}

function formatDate(value: string) {
    return new Date(value).toLocaleString(undefined, {
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
    });
}

function statusColor(status: string) {
    const colors: Record<string, string> = {
        scheduled: "bg-blue-500/15 text-blue-400 border-blue-500/25",
        published: "bg-green-500/15 text-green-400 border-green-500/25",
        publishing: "bg-orange-500/15 text-orange-400 border-orange-500/25",
        failed: "bg-red-500/15 text-red-400 border-red-500/25",
        pending: "bg-amber-500/15 text-amber-400 border-amber-500/25",
    };
    return colors[status] || "bg-gray-500/15 text-gray-400 border-gray-500/25";
}

const emptyTotals: DashboardTotals = {
    posts: 0,
    pendingPosts: 0,
    scheduledPosts: 0,
    accounts: 0,
    accountsRequiringAttention: 0,
};

export default function DashboardClient() {
    const [currentMonth, setCurrentMonth] = useState(() => new Date());
    const [totals, setTotals] = useState<DashboardTotals>(emptyTotals);
    const [recentPosts, setRecentPosts] = useState<RecentPost[]>([]);
    const [isLoadingDashboard, setIsLoadingDashboard] = useState(true);
    const [isLoadingRecentPosts, setIsLoadingRecentPosts] = useState(true);
    const [dashboardError, setDashboardError] = useState<string | null>(null);
    const [recentPostsError, setRecentPostsError] = useState<string | null>(null);

    const monthRange = useMemo(() => getMonthRange(currentMonth), [currentMonth]);

    useEffect(() => {
        let isCurrent = true;

        async function fetchDashboard() {
            setIsLoadingDashboard(true);
            setDashboardError(null);

            try {
                const params = new URLSearchParams(monthRange);
                const response = await fetch(`/api/dashboard?${params.toString()}`, {
                    credentials: "include",
                    cache: "no-store",
                });
                const data = (await response.json().catch(() => null)) as DashboardResponse | null;

                if (!response.ok) {
                    throw new Error(data?.message || "Failed to load dashboard.");
                }

                if (isCurrent) {
                    setTotals({
                        ...emptyTotals,
                        ...(data?.data?.totals ?? {}),
                    });
                }
            } catch (error) {
                if (isCurrent) {
                    setDashboardError(error instanceof Error ? error.message : "Failed to load dashboard.");
                }
            } finally {
                if (isCurrent) {
                    setIsLoadingDashboard(false);
                }
            }
        }

        fetchDashboard();

        return () => {
            isCurrent = false;
        };
    }, [monthRange]);

    useEffect(() => {
        let isCurrent = true;

        async function fetchRecentPosts() {
            setIsLoadingRecentPosts(true);
            setRecentPostsError(null);

            try {
                const response = await fetch("/api/dashboard/recent-posts?limit=5", {
                    credentials: "include",
                    cache: "no-store",
                });
                const data = (await response.json().catch(() => null)) as RecentPostsResponse | null;

                if (!response.ok) {
                    throw new Error(data?.message || "Failed to load recent posts.");
                }

                if (isCurrent) {
                    setRecentPosts(data?.data ?? []);
                }
            } catch (error) {
                if (isCurrent) {
                    setRecentPostsError(error instanceof Error ? error.message : "Failed to load recent posts.");
                }
            } finally {
                if (isCurrent) {
                    setIsLoadingRecentPosts(false);
                }
            }
        }

        fetchRecentPosts();

        return () => {
            isCurrent = false;
        };
    }, []);

    const postSummary = [
        {
            label: "Posts",
            value: totals.posts,
            icon: Send,
            tone: "bg-violet-100/10 text-violet-900",
        },
        {
            label: "Scheduled",
            value: totals.scheduledPosts,
            icon: CalendarClock,
            tone: "bg-blue-100/10 text-blue-900",
        },
        {
            label: "Pending",
            value: totals.pendingPosts,
            icon: Clock3,
            tone: "bg-amber-100/10 text-amber-900",
        },
    ];
    const accountSummary = [
        {
            label: "Connected accounts",
            value: totals.accounts,
            icon: Link2,
            tone: "bg-emerald-100/10 text-emerald-900",
        },
        {
            label: "Need attention",
            value: totals.accountsRequiringAttention,
            icon: AlertTriangle,
            tone: "bg-red-100/10 text-red-900",
        },
    ];

    return (
        <div className="space-y-6">
            <div className="flex flex-col justify-between gap-4 border-b border-border pb-5 md:flex-row md:items-end">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-foreground">Dashboard</h1>
                    <p className="mt-2 text-sm text-muted-foreground">
                        Track posting activity and connected account health.
                    </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                    <div className="flex items-center gap-2 rounded-xl border border-border bg-card p-1">
                        <button
                            type="button"
                            onClick={() => setCurrentMonth((value) => new Date(value.getFullYear(), value.getMonth() - 1, 1))}
                            className="cursor-pointer rounded-lg px-3 py-2 text-sm font-medium text-foreground hover:bg-accent"
                        >
                            Prev
                        </button>
                        <div className="min-w-36 px-3 text-center text-sm font-semibold text-foreground">
                            {formatMonth(currentMonth)}
                        </div>
                        <button
                            type="button"
                            onClick={() => setCurrentMonth((value) => new Date(value.getFullYear(), value.getMonth() + 1, 1))}
                            className="cursor-pointer rounded-lg px-3 py-2 text-sm font-medium text-foreground hover:bg-accent"
                        >
                            Next
                        </button>
                    </div>
                </div>
            </div>

            {dashboardError && (
                <div className="rounded-xl border border-red-500/25 bg-red-500/10 p-4 text-sm text-red-600 dark:text-red-200">
                    {dashboardError}
                </div>
            )}

            <section className="space-y-3">
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold text-foreground">Post Summary</h2>
                    <p className="text-xs text-muted-foreground">{formatMonth(currentMonth)}</p>
                </div>
                <div className="grid gap-3 sm:grid-cols-3">
                    {postSummary.map((item) => {
                        const Icon = item.icon;

                        return (
                            <div key={item.label} className="rounded-xl border border-border bg-card p-4 shadow-sm">
                                <div className="flex items-start justify-between gap-3">
                                    <div>
                                        <p className="text-sm text-muted-foreground">{item.label}</p>
                                        <p className="mt-2 text-3xl font-semibold text-foreground">
                                            {isLoadingDashboard ? "-" : item.value}
                                        </p>
                                    </div>
                                    <div className={`rounded-lg p-2 ${item.tone}`}>
                                        <Icon className="h-5 w-5 text-foreground" />
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </section>

            <section className="space-y-3">
                <div>
                    <h2 className="text-xl font-semibold text-foreground">Accounts</h2>
                    <p className="mt-1 text-xs text-muted-foreground">Account totals are not affected by the selected month.</p>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                    {accountSummary.map((item) => {
                        const Icon = item.icon;

                        return (
                            <div key={item.label} className="rounded-xl border border-border bg-card p-4 shadow-sm">
                                <div className="flex items-start justify-between gap-3">
                                    <div>
                                        <p className="text-sm text-muted-foreground">{item.label}</p>
                                        <p className="mt-2 text-3xl font-semibold text-foreground">
                                            {isLoadingDashboard ? "-" : item.value}
                                        </p>
                                    </div>
                                    <div className={`rounded-lg p-2 ${item.tone}`}>
                                        <Icon className="h-5 w-5 text-foreground" />
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </section>

            <section className="rounded-xl border border-border bg-card shadow-sm">
                <div className="flex items-center justify-between border-b border-border p-4">
                    <div>
                        <h2 className="text-xl font-semibold text-foreground">Recent Posts</h2>
                        <p className="mt-1 text-xs text-muted-foreground">Latest activity across platforms.</p>
                    </div>
                    <div className="flex items-center gap-3">
                        {isLoadingRecentPosts && <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />}
                        <Link
                            href="/calendar"
                            className="inline-flex h-9 items-center justify-center rounded-lg border border-border bg-background px-3 text-sm font-medium text-foreground hover:bg-accent"
                        >
                            View more
                        </Link>
                    </div>
                </div>

                {recentPostsError ? (
                    <div className="p-4 text-sm text-red-600 dark:text-red-200">{recentPostsError}</div>
                ) : recentPosts.length === 0 && !isLoadingRecentPosts ? (
                    <div className="p-8 text-center text-sm text-muted-foreground">No recent posts yet.</div>
                ) : (
                    <div className="divide-y divide-border">
                        {recentPosts.map((post, index) => (
                            <div key={`${post.provider}-${post.createdAt}-${index}`} className="flex items-center justify-between gap-3 p-4">
                                <div className="flex min-w-0 items-center gap-3">
                                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted">
                                        <img
                                            src={`/${post.provider.toLowerCase()}-logo.svg`}
                                            alt=""
                                            className="h-5 w-5"
                                        />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="truncate text-sm font-semibold capitalize text-foreground">{post.provider}</p>
                                        <p className="text-xs text-muted-foreground">{formatDate(post.createdAt)}</p>
                                    </div>
                                </div>
<div className="flex shrink-0 items-center gap-2">
                                     {post.isStory && (
                                         <span className="rounded-full border border-violet-400/25 bg-violet-500/15 px-2 py-1 text-xs font-medium text-violet-900">
                                             Story
                                         </span>
                                     )}
                                     <span className={`inline-flex items-center gap-1 rounded-full ${statusColor(post.status)} px-2 py-1 text-xs font-medium capitalize`}>
                                         <CheckCircle2 className="h-3 w-3" />
                                         {post.status}
                                     </span>
                                 </div>
                            </div>
                        ))}
                    </div>
                )}
            </section>
        </div>
    );
}
