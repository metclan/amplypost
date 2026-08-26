"use client";

import Image from "next/image";
import { useCallback, useMemo, useState } from "react";
import { CalendarDays, CheckCircle2, Clock3, ExternalLink, FileText, Layers3, Loader2, Send, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCachedResource } from "@/lib/client-cache";
import {
    ACCOUNTS_CACHE_KEY,
    CACHE_TTL,
    POSTS_CACHE_PREFIX,
    fetchAccounts,
    getPlatformLogo,
} from "@/lib/client-data";
import {
    DetailSkeleton,
    PlatformPostPreview,
    extractPostDetails,
    getStatusClasses,
    type CalendarPost,
} from "@/app/(protected)/dashboard/calendar-view";
import { backendApiUrl } from "@/util/backend-api";

type PostStatus = "published" | "failed" | "scheduled" | "pending" | "processing" | "publishing" | string;

type Post = {
    id: string;
    groupId: string | null;
    provider: string;
    accountId: string | null;
    status: PostStatus;
    postType: string;
    isStory: boolean;
    scheduledFor: string | null;
    timezone: string | null;
    publishedAt: string | null;
    failedAt: string | null;
    createdAt: string;
    updatedAt: string | null;
    accountName: string | null;
    caption: string;
    postUrl: string | null;
    imageUrls: string[];
    videoUrls: string[];
    attemptCount: number | null;
    nextAttemptAt: string | null;
    lastError: string | null;
};

type PostsResponse = {
    data?: {
        posts?: RawPost[];
    };
    posts?: RawPost[];
};

type PostGroup = {
    id: string;
    postsCount: number;
    createdAt: string;
    updatedAt: string;
    posts: Post[];
};

type PostGroupsResponse = {
    data?: {
        groups?: RawPostGroup[];
        pagination?: {
            page?: number;
            limit?: number;
            total?: number;
            totalPages?: number;
        };
    };
    groups?: RawPostGroup[];
};

type PostGroupsResult = {
    groups: PostGroup[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
};

type PostGroupPostsResponse = {
    data?: RawPostGroup & {
        posts?: RawPost[];
    };
};

type RawPost = Record<string, unknown>;
type RawPostGroup = Record<string, unknown>;

const ALL_PLATFORMS = "all";
const POSTS_TAB = "posts";
const GROUPS_TAB = "groups";
const PAGE_SIZE_OPTIONS = [10, 20, 50, 100];

function toDateInputValue(date: Date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
}

function getDefaultDateRange() {
    const now = new Date();
    return {
        from: toDateInputValue(new Date(now.getFullYear(), now.getMonth(), 1)),
        to: toDateInputValue(new Date(now.getFullYear(), now.getMonth() + 1, 0)),
    };
}

function getString(raw: RawPost, key: string) {
    const value = raw[key];
    return typeof value === "string" ? value : undefined;
}

function getBoolean(raw: RawPost, key: string) {
    const value = raw[key];
    return typeof value === "boolean" ? value : undefined;
}

function getNumber(raw: RawPost, key: string) {
    const value = raw[key];
    return typeof value === "number" ? value : undefined;
}

function getStringArray(raw: RawPost, key: string) {
    const value = raw[key];
    return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : undefined;
}

function isRawRecord(value: unknown): value is RawPost {
    return Boolean(value && typeof value === "object" && !Array.isArray(value));
}

function getMediaUrls(raw: RawPost, mediaType: "image" | "video") {
    const value = raw.mediaUrls ?? raw.media_urls;
    if (!Array.isArray(value)) return [];

    return value.flatMap((item) => {
        if (!isRawRecord(item)) return [];
        const url = getString(item, "mediaUrl") ?? getString(item, "media_url");
        const type = getString(item, "mediaType") ?? getString(item, "media_type");
        return url && type?.toLowerCase() === mediaType ? [url] : [];
    });
}

function normalizePost(raw: RawPost): Post {
    const imageUrlStrings = getStringArray(raw, "imageUrls") ?? getStringArray(raw, "image_urls") ?? [];
    const videoUrlStrings = getStringArray(raw, "videoUrls") ?? getStringArray(raw, "video_urls") ?? [];

    return {
        id: getString(raw, "id") ?? "",
        groupId: getString(raw, "groupId") ?? getString(raw, "group_id") ?? null,
        provider: getString(raw, "provider") ?? "unknown",
        accountId: getString(raw, "accountId") ?? getString(raw, "account_id") ?? null,
        status: getString(raw, "status") ?? "pending",
        postType: getString(raw, "postType") ?? getString(raw, "post_type") ?? "POST",
        isStory: getBoolean(raw, "isStory") ?? getBoolean(raw, "is_story") ?? false,
        scheduledFor: getString(raw, "scheduledFor") ?? getString(raw, "scheduled_for") ?? null,
        timezone: getString(raw, "timezone") ?? null,
        publishedAt: getString(raw, "publishedAt") ?? getString(raw, "published_at") ?? null,
        failedAt: getString(raw, "failedAt") ?? getString(raw, "failed_at") ?? null,
        createdAt: getString(raw, "createdAt") ?? getString(raw, "created_at") ?? new Date().toISOString(),
        updatedAt: getString(raw, "updatedAt") ?? getString(raw, "updated_at") ?? null,
        accountName: getString(raw, "accountName") ?? getString(raw, "account_name") ?? null,
        caption: getString(raw, "caption") ?? "",
        postUrl: getString(raw, "postUrl") ?? getString(raw, "post_url") ?? null,
        imageUrls: imageUrlStrings.length > 0 ? imageUrlStrings : getMediaUrls(raw, "image"),
        videoUrls: videoUrlStrings.length > 0 ? videoUrlStrings : getMediaUrls(raw, "video"),
        attemptCount: getNumber(raw, "attemptCount") ?? getNumber(raw, "attempt_count") ?? null,
        nextAttemptAt: getString(raw, "nextAttemptAt") ?? getString(raw, "next_attempt_at") ?? null,
        lastError: getString(raw, "lastError") ?? getString(raw, "last_error") ?? null,
    };
}

function normalizePostGroup(raw: RawPostGroup): PostGroup {
    const rawPosts = Array.isArray(raw.posts) ? raw.posts.filter((item): item is RawPost => Boolean(item && typeof item === "object")) : [];

    return {
        id: getString(raw, "id") ?? "",
        postsCount: getNumber(raw, "postsCount") ?? getNumber(raw, "posts_count") ?? rawPosts.length,
        createdAt: getString(raw, "createdAt") ?? getString(raw, "created_at") ?? new Date().toISOString(),
        updatedAt: getString(raw, "updatedAt") ?? getString(raw, "updated_at") ?? new Date().toISOString(),
        posts: rawPosts.map(normalizePost),
    };
}

function buildPostsParams(fromDate: string, toDate: string, platform: string) {
    const from = new Date(`${fromDate}T00:00:00`);
    const to = new Date(`${toDate}T23:59:59.999`);
    const params = new URLSearchParams({
        from: from.toISOString(),
        to: to.toISOString(),
    });

    if (platform !== ALL_PLATFORMS) {
        params.set("provider", platform);
    }

    return params;
}

async function fetchPosts(params: URLSearchParams) {
    const response = await fetch(backendApiUrl(`posts?${params.toString()}`), {
        credentials: "include",
    });

    if (!response.ok) {
        throw new Error("Failed to fetch posts.");
    }

    const payload = (await response.json().catch(() => null)) as PostsResponse | null;
    return (payload?.data?.posts ?? payload?.posts ?? []).map(normalizePost);
}

function buildPostGroupsParams(fromDate: string, toDate: string, platform: string, page: number, limit: number) {
    const from = new Date(`${fromDate}T00:00:00`);
    const to = new Date(`${toDate}T23:59:59.999`);
    const params = new URLSearchParams({
        from: from.toISOString(),
        to: to.toISOString(),
        page: String(page),
        limit: String(limit),
    });

    if (platform !== ALL_PLATFORMS) {
        params.set("provider", platform);
    }

    return params;
}

async function fetchPostGroups(params: URLSearchParams): Promise<PostGroupsResult> {
    const response = await fetch(backendApiUrl(`post-groups?${params.toString()}`), {
        credentials: "include",
    });

    if (!response.ok) {
        throw new Error("Failed to fetch post groups.");
    }

    const payload = (await response.json().catch(() => null)) as PostGroupsResponse | null;
    const groups = (payload?.data?.groups ?? payload?.groups ?? []).map(normalizePostGroup);
    const pagination = payload?.data?.pagination;

    return {
        groups,
        pagination: {
            page: pagination?.page ?? 1,
            limit: pagination?.limit ?? groups.length,
            total: pagination?.total ?? groups.length,
            totalPages: pagination?.totalPages ?? getTotalPages(groups.length, Math.max(1, pagination?.limit ?? (groups.length || 1))),
        },
    };
}

async function fetchPostGroupPosts(groupId: string) {
    const response = await fetch(backendApiUrl(`post-groups/${groupId}/posts`), {
        credentials: "include",
    });

    if (!response.ok) {
        throw new Error("Failed to fetch post group posts.");
    }

    const payload = (await response.json().catch(() => null)) as PostGroupPostsResponse | null;
    return normalizePostGroup(payload?.data ?? { id: groupId, posts: [] });
}

function getPostDate(post: Post) {
    return post.scheduledFor || post.publishedAt || post.createdAt;
}

function formatRelativeTime(value: string) {
    const date = new Date(value);
    const diffMs = Date.now() - date.getTime();
    const isFuture = diffMs < 0;
    const diffSeconds = Math.floor(Math.abs(diffMs) / 1000);
    const diffMinutes = Math.floor(diffSeconds / 60);
    const diffHours = Math.floor(diffMinutes / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (isFuture) {
        if (diffMinutes < 1) return "soon";
        if (diffMinutes < 60) return `in ${diffMinutes} minute${diffMinutes === 1 ? "" : "s"}`;
        if (diffHours < 24) return `in ${diffHours} hour${diffHours === 1 ? "" : "s"}`;
        if (diffDays === 1) return "tomorrow";
        if (diffDays < 7) return `in ${diffDays} days`;
    }

    if (diffSeconds < 60) return "just now";
    if (diffMinutes < 60) return `${diffMinutes} minute${diffMinutes === 1 ? "" : "s"} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours === 1 ? "" : "s"} ago`;
    if (diffDays === 1) return "yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;

    return date.toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
        year: date.getFullYear() === new Date().getFullYear() ? undefined : "numeric",
    });
}

function formatPlatform(provider: string) {
    if (provider.toLowerCase() === "x") return "X";
    return provider.replace(/[-_]/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function statusColor(status: string) {
    const colors: Record<string, string> = {
        scheduled: "border-blue-500/25 bg-blue-500/10 text-blue-700 dark:text-blue-200",
        published: "border-emerald-500/25 bg-emerald-500/10 text-emerald-700 dark:text-emerald-200",
        publishing: "border-orange-500/25 bg-orange-500/10 text-orange-700 dark:text-orange-200",
        processing: "border-amber-500/25 bg-amber-500/10 text-amber-700 dark:text-amber-200",
        failed: "border-red-500/25 bg-red-500/10 text-red-700 dark:text-red-200",
        pending: "border-amber-500/25 bg-amber-500/10 text-amber-700 dark:text-amber-200",
    };
    return colors[status] || "border-muted bg-muted/60 text-muted-foreground";
}

function isPostInDateRange(post: Post, fromDate: string, toDate: string) {
    const value = new Date(getPostDate(post)).getTime();
    const from = new Date(`${fromDate}T00:00:00`).getTime();
    const to = new Date(`${toDate}T23:59:59.999`).getTime();
    return value >= from && value <= to;
}

function getGroupProviders(group: PostGroup) {
    return Array.from(new Set(group.posts.map((post) => post.provider.toLowerCase()))).sort();
}

function getGroupStatusCounts(group: PostGroup) {
    return group.posts.reduce<Record<string, number>>((counts, post) => {
        counts[post.status] = (counts[post.status] ?? 0) + 1;
        return counts;
    }, {});
}

function getPageItems<T>(items: T[], page: number, pageSize: number) {
    const start = (page - 1) * pageSize;
    return items.slice(start, start + pageSize);
}

function getTotalPages(totalItems: number, pageSize: number) {
    return Math.max(1, Math.ceil(totalItems / pageSize));
}

function toCalendarPost(post: Post): CalendarPost {
    return {
        id: post.id,
        groupId: post.groupId ?? undefined,
        provider: post.provider,
        status: post.status,
        postType: post.postType,
        isStory: post.isStory,
        scheduledFor: post.scheduledFor,
        timezone: post.timezone,
        publishedAt: post.publishedAt,
        createdAt: post.createdAt,
        updatedAt: post.updatedAt ?? undefined,
        failedAt: post.failedAt,
        nextAttemptAt: post.nextAttemptAt,
        postUrl: post.postUrl,
        attemptCount: post.attemptCount ?? undefined,
        lastError: post.lastError,
        accountName: post.accountName,
        caption: post.caption,
        imageUrls: post.imageUrls,
        videoUrls: post.videoUrls,
    };
}

function PaginationControls({
    page,
    pageSize,
    totalItems,
    onPageChange,
    onPageSizeChange,
}: {
    page: number;
    pageSize: number;
    totalItems: number;
    onPageChange: (page: number) => void;
    onPageSizeChange: (pageSize: number) => void;
}) {
    const totalPages = getTotalPages(totalItems, pageSize);
    const startItem = totalItems === 0 ? 0 : (page - 1) * pageSize + 1;
    const endItem = Math.min(totalItems, page * pageSize);

    return (
        <div className="flex flex-col gap-3 border-t border-border p-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>Rows</span>
                <Select
                    value={String(pageSize)}
                    onValueChange={(value) => onPageSizeChange(Number(value))}
                >
                    <SelectTrigger className="h-9 w-24">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        {PAGE_SIZE_OPTIONS.map((value) => (
                            <SelectItem key={value} value={String(value)}>
                                {value}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                <span>
                    {startItem}-{endItem} of {totalItems}
                </span>
            </div>

            <div className="flex items-center gap-2">
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => onPageChange(Math.max(1, page - 1))}
                    disabled={page <= 1}
                    className="cursor-pointer"
                >
                    Prev
                </Button>
                <div className="flex items-center gap-1">
                    {Array.from({ length: totalPages }, (_, index) => index + 1)
                        .filter((pageNumber) => (
                            pageNumber === 1
                            || pageNumber === totalPages
                            || Math.abs(pageNumber - page) <= 1
                        ))
                        .map((pageNumber, index, visiblePages) => {
                            const previousPage = visiblePages[index - 1];
                            const showGap = previousPage !== undefined && pageNumber - previousPage > 1;

                            return (
                                <div key={pageNumber} className="flex items-center gap-1">
                                    {showGap && <span className="px-1 text-sm text-muted-foreground">...</span>}
                                    <button
                                        type="button"
                                        onClick={() => onPageChange(pageNumber)}
                                        className={[
                                            "h-8 min-w-8 cursor-pointer rounded-md px-2 text-sm font-medium transition",
                                            pageNumber === page
                                                ? "bg-primary text-primary-foreground"
                                                : "text-muted-foreground hover:bg-muted hover:text-foreground",
                                        ].join(" ")}
                                    >
                                        {pageNumber}
                                    </button>
                                </div>
                            );
                        })}
                </div>
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => onPageChange(Math.min(totalPages, page + 1))}
                    disabled={page >= totalPages}
                    className="cursor-pointer"
                >
                    Next
                </Button>
            </div>
        </div>
    );
}

export default function PostsClient() {
    const defaultDateRange = useMemo(() => getDefaultDateRange(), []);
    const [activeTab, setActiveTab] = useState<typeof POSTS_TAB | typeof GROUPS_TAB>(POSTS_TAB);
    const [fromDate, setFromDate] = useState(defaultDateRange.from);
    const [toDate, setToDate] = useState(defaultDateRange.to);
    const [platform, setPlatform] = useState(ALL_PLATFORMS);
    const [postsPage, setPostsPage] = useState(1);
    const [postsPageSize, setPostsPageSize] = useState(10);
    const [groupsPage, setGroupsPage] = useState(1);
    const [groupsPageSize, setGroupsPageSize] = useState(10);
    const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
    const [selectedGroupModal, setSelectedGroupModal] = useState<PostGroup | null>(null);
    const [selectedPost, setSelectedPost] = useState<CalendarPost | null>(null);
    const [isLoadingPostDetails, setIsLoadingPostDetails] = useState(false);
    const [postDetailsError, setPostDetailsError] = useState<string | null>(null);
    const effectiveFromDate = fromDate || defaultDateRange.from;
    const effectiveToDate = toDate || defaultDateRange.to;

    const postsParams = useMemo(
        () => buildPostsParams(effectiveFromDate, effectiveToDate, platform),
        [effectiveFromDate, effectiveToDate, platform],
    );
    const postsCacheKey = useMemo(() => `${POSTS_CACHE_PREFIX}:list:${postsParams.toString()}`, [postsParams]);
    const fetchFilteredPosts = useCallback(() => fetchPosts(postsParams), [postsParams]);
    const postGroupsParams = useMemo(
        () => buildPostGroupsParams(effectiveFromDate, effectiveToDate, platform, groupsPage, groupsPageSize),
        [effectiveFromDate, effectiveToDate, groupsPage, groupsPageSize, platform],
    );
    const postGroupsCacheKey = useMemo(() => `${POSTS_CACHE_PREFIX}:groups:${postGroupsParams.toString()}`, [postGroupsParams]);
    const fetchFilteredPostGroups = useCallback(() => fetchPostGroups(postGroupsParams), [postGroupsParams]);

    const {
        data: posts = [],
        error,
        isLoading,
        isRefreshing,
        refetch,
    } = useCachedResource(postsCacheKey, fetchFilteredPosts, { ttl: CACHE_TTL });
    const {
        data: postGroupsResult,
        error: groupsError,
        isLoading: isLoadingGroups,
        isRefreshing: isRefreshingGroups,
        refetch: refetchGroups,
    } = useCachedResource(postGroupsCacheKey, fetchFilteredPostGroups, { ttl: CACHE_TTL });
    const postGroups = postGroupsResult?.groups ?? [];
    const postGroupsPagination = postGroupsResult?.pagination ?? {
        page: groupsPage,
        limit: groupsPageSize,
        total: postGroups.length,
        totalPages: getTotalPages(postGroups.length, groupsPageSize),
    };
    const selectedGroupCacheKey = selectedGroupId
        ? `${POSTS_CACHE_PREFIX}:groups:${selectedGroupId}:posts`
        : `${POSTS_CACHE_PREFIX}:groups:none`;
    const fetchSelectedGroup = useCallback(
        () => selectedGroupId ? fetchPostGroupPosts(selectedGroupId) : Promise.resolve(null),
        [selectedGroupId],
    );
    const {
        data: selectedGroupDetails,
        error: selectedGroupError,
        isLoading: isLoadingSelectedGroup,
    } = useCachedResource(selectedGroupCacheKey, fetchSelectedGroup, {
        enabled: Boolean(selectedGroupId),
        ttl: CACHE_TTL,
    });
    const { data: accounts = [] } = useCachedResource(ACCOUNTS_CACHE_KEY, fetchAccounts, { ttl: CACHE_TTL });

    const platformOptions = useMemo(() => {
        const providers = new Set<string>();
        accounts.forEach((account) => providers.add(account.provider.toLowerCase()));
        posts.forEach((post) => providers.add(post.provider.toLowerCase()));
        return Array.from(providers).sort((a, b) => formatPlatform(a).localeCompare(formatPlatform(b)));
    }, [accounts, posts]);

    const filteredPosts = useMemo(() => {
        return posts
            .filter((post) => platform === ALL_PLATFORMS || post.provider.toLowerCase() === platform)
            .filter((post) => isPostInDateRange(post, effectiveFromDate, effectiveToDate))
            .sort((a, b) => new Date(getPostDate(b)).getTime() - new Date(getPostDate(a)).getTime());
    }, [effectiveFromDate, effectiveToDate, platform, posts]);

    const resetFilters = () => {
        setFromDate(defaultDateRange.from);
        setToDate(defaultDateRange.to);
        setPlatform(ALL_PLATFORMS);
        setPostsPage(1);
        setGroupsPage(1);
    };

    const visibleSelectedGroup = selectedGroupDetails ?? postGroups.find((group) => group.id === selectedGroupId) ?? null;
    const effectivePostsPage = Math.min(postsPage, getTotalPages(filteredPosts.length, postsPageSize));
    const visiblePosts = useMemo(() => getPageItems(filteredPosts, effectivePostsPage, postsPageSize), [effectivePostsPage, filteredPosts, postsPageSize]);
    const visibleGroups = postGroups;
    const isPostsView = activeTab === POSTS_TAB;
    const activeError = isPostsView ? error : groupsError;
    const isActiveRefreshing = isPostsView ? isRefreshing : isRefreshingGroups;
    const refreshActiveView = () => {
        if (isPostsView) {
            void refetch();
        } else {
            void refetchGroups();
        }
    };

    const handlePostClick = async (post: Post) => {
        const fallbackPost = toCalendarPost(post);
        setSelectedPost(fallbackPost);
        setIsLoadingPostDetails(true);
        setPostDetailsError(null);

        try {
            const response = await fetch(backendApiUrl(`posts/${post.id}`), {
                credentials: "include",
                cache: "no-store",
            });
            if (!response.ok) throw new Error("Failed to fetch post details");

            const data = await response.json();
            setSelectedPost(extractPostDetails(data, fallbackPost));
        } catch (error) {
            console.error("Error fetching post details:", error);
            setPostDetailsError(error instanceof Error ? error.message : "Failed to fetch post details");
        } finally {
            setIsLoadingPostDetails(false);
        }
    };

    const closePostDetails = () => {
        setSelectedPost(null);
        setPostDetailsError(null);
    };

    const openGroupModal = (group: PostGroup) => {
        setSelectedGroupId(group.id);
        setSelectedGroupModal(group);
    };

    const closeGroupModal = () => {
        setSelectedGroupModal(null);
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col justify-between gap-4 border-b border-border pb-5 md:flex-row md:items-end">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-foreground">Posts</h1>
                    <p className="mt-2 text-sm text-muted-foreground">
                        Review published, scheduled, pending, and failed posts across every platform.
                    </p>
                </div>

                <Button
                    type="button"
                    variant="outline"
                    onClick={refreshActiveView}
                    disabled={isActiveRefreshing}
                    className="h-10 cursor-pointer"
                >
                    {isActiveRefreshing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                    Refresh
                </Button>
            </div>

            <div className="inline-flex rounded-lg border border-border bg-card p-1 shadow-sm">
                <button
                    type="button"
                    onClick={() => setActiveTab(POSTS_TAB)}
                    className={[
                        "flex h-9 cursor-pointer items-center gap-2 rounded-md px-3 text-sm font-medium transition",
                        activeTab === POSTS_TAB ? "bg-primary text-white" : "text-foreground hover:bg-muted",
                    ].join(" ")}
                >
                    <FileText className="h-4 w-4" />
                    Posts
                </button>
                <button
                    type="button"
                    onClick={() => setActiveTab(GROUPS_TAB)}
                    className={[
                        "flex h-9 cursor-pointer items-center gap-2 rounded-md px-3 text-sm font-medium transition",
                        activeTab === GROUPS_TAB ? "bg-primary text-white" : "text-foreground hover:bg-muted",
                    ].join(" ")}
                >
                    <Layers3 className="h-4 w-4" />
                    Post Groups
                </button>
            </div>

            <section className="rounded-xl border border-border bg-card p-4 shadow-sm">
                <div className="grid gap-3 md:grid-cols-[minmax(140px,180px)_minmax(140px,180px)_minmax(170px,220px)_auto] md:items-end">
                    <div className="space-y-2">
                        <label htmlFor="posts-from-date" className="text-xs font-medium text-muted-foreground">
                            From
                        </label>
                        <Input
                            id="posts-from-date"
                            type="date"
                            value={fromDate}
                            onChange={(event) => {
                                setFromDate(event.target.value);
                                setPostsPage(1);
                                setGroupsPage(1);
                            }}
                            className="h-10"
                        />
                    </div>

                    <div className="space-y-2">
                        <label htmlFor="posts-to-date" className="text-xs font-medium text-muted-foreground">
                            To
                        </label>
                        <Input
                            id="posts-to-date"
                            type="date"
                            value={toDate}
                            onChange={(event) => {
                                setToDate(event.target.value);
                                setPostsPage(1);
                                setGroupsPage(1);
                            }}
                            className="h-10"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-medium text-muted-foreground">Platform</label>
                        <Select
                            value={platform}
                            onValueChange={(value) => {
                                setPlatform(value);
                                setPostsPage(1);
                                setGroupsPage(1);
                            }}
                        >
                            <SelectTrigger className="h-10 w-full">
                                <SelectValue placeholder="All platforms" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value={ALL_PLATFORMS}>All platforms</SelectItem>
                                {platformOptions.map((provider) => (
                                    <SelectItem key={provider} value={provider}>
                                        <Image
                                            src={getPlatformLogo(provider)}
                                            alt=""
                                            width={16}
                                            height={16}
                                            className="h-4 w-4 object-contain"
                                        />
                                        {formatPlatform(provider)}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <Button type="button" variant="outline" onClick={resetFilters} className="h-10 cursor-pointer">
                        Reset
                    </Button>
                </div>
            </section>

            {activeError && (
                <div className="rounded-xl border border-red-500/25 bg-red-500/10 p-4 text-sm text-red-600 dark:text-red-200">
                    {activeError.message}
                </div>
            )}

            {isPostsView ? (
                <section className="rounded-xl border border-border bg-card shadow-sm">
                    <div className="flex flex-col gap-2 border-b border-border p-4 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <h2 className="text-xl font-semibold text-foreground">All Posts</h2>
                            <p className="mt-1 text-xs text-muted-foreground">
                                {isLoading ? "Loading posts..." : `${filteredPosts.length} post${filteredPosts.length === 1 ? "" : "s"} in this view`}
                            </p>
                        </div>
                        {isLoading && <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />}
                    </div>

                    {filteredPosts.length === 0 && !isLoading ? (
                        <div className="flex flex-col items-center justify-center p-10 text-center">
                            <FileText className="h-10 w-10 text-muted-foreground" />
                            <h3 className="mt-4 text-lg font-semibold text-foreground">No posts found</h3>
                            <p className="mt-2 max-w-md text-sm text-muted-foreground">
                                Try a different platform or date range.
                            </p>
                        </div>
                    ) : (
                        <div className="divide-y divide-border">
                            {visiblePosts.map((post) => {
                                const displayDate = getPostDate(post);

                                return (
                                    <button
                                        key={post.id}
                                        type="button"
                                        onClick={() => handlePostClick(post)}
                                        className="grid w-full cursor-pointer gap-4 p-4 text-left transition hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center"
                                    >
                                        <div className="flex min-w-0 gap-3">
                                            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-muted">
                                                <Image
                                                    src={getPlatformLogo(post.provider)}
                                                    alt={post.provider}
                                                    width={24}
                                                    height={24}
                                                    className="h-6 w-6 object-contain"
                                                />
                                            </div>

                                            <div className="min-w-0 flex-1">
                                                <div className="flex flex-wrap items-center gap-2">
                                                    <h3 className="truncate text-sm font-semibold text-foreground">
                                                        {post.accountName || `${formatPlatform(post.provider)} account`}
                                                    </h3>
                                                    <span className="text-xs capitalize text-muted-foreground">{formatPlatform(post.provider)}</span>
                                                    {post.isStory && (
                                                        <span className="rounded-full border border-violet-400/25 bg-violet-500/10 px-2 py-0.5 text-xs font-medium text-violet-700 dark:text-violet-200">
                                                            Story
                                                        </span>
                                                    )}
                                                </div>

                                                <p className="mt-1 line-clamp-2 text-sm leading-6 text-muted-foreground">
                                                    {post.caption || "No caption"}
                                                </p>

                                                <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                                                    <span className="inline-flex items-center gap-1">
                                                        <CalendarDays className="h-3.5 w-3.5" />
                                                        {formatRelativeTime(displayDate)}
                                                    </span>
                                                    <span className="inline-flex items-center gap-1 uppercase">
                                                        <FileText className="h-3.5 w-3.5" />
                                                        {post.postType}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex shrink-0 flex-wrap items-center gap-2 lg:justify-end">
                                            <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-medium capitalize ${statusColor(post.status)}`}>
                                                {post.status === "scheduled" || post.status === "pending" ? (
                                                    <Clock3 className="h-3 w-3" />
                                                ) : (
                                                    <CheckCircle2 className="h-3 w-3" />
                                                )}
                                                {post.status}
                                            </span>
                                            {post.postUrl && (
                                                <span className="inline-flex items-center gap-1 rounded-lg border border-border bg-background px-2.5 py-1 text-xs font-medium text-foreground">
                                                    <ExternalLink className="h-3.5 w-3.5" />
                                                    Open
                                                </span>
                                            )}
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    )}

                    <PaginationControls
                        page={effectivePostsPage}
                        pageSize={postsPageSize}
                        totalItems={filteredPosts.length}
                        onPageChange={setPostsPage}
                        onPageSizeChange={(value) => {
                            setPostsPageSize(value);
                            setPostsPage(1);
                        }}
                    />
                </section>
            ) : (
                <section className="rounded-xl border border-border bg-card shadow-sm">
                    <div className="flex flex-col gap-2 border-b border-border p-4 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <h2 className="text-xl font-semibold text-foreground">Post Groups</h2>
                            <p className="mt-1 text-xs text-muted-foreground">
                                {isLoadingGroups ? "Loading groups..." : `${postGroupsPagination.total} group${postGroupsPagination.total === 1 ? "" : "s"} in this view`}
                            </p>
                        </div>
                        {isLoadingGroups && <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />}
                    </div>

                    {postGroups.length === 0 && !isLoadingGroups ? (
                        <div className="flex flex-col items-center justify-center p-10 text-center">
                            <Layers3 className="h-10 w-10 text-muted-foreground" />
                            <h3 className="mt-4 text-lg font-semibold text-foreground">No post groups found</h3>
                            <p className="mt-2 max-w-md text-sm text-muted-foreground">
                                Try a different platform or date range.
                            </p>
                        </div>
                    ) : (
                        <div className="divide-y divide-border">
                            {visibleGroups.map((group) => {
                                const providers = getGroupProviders(group);
                                const statusCounts = getGroupStatusCounts(group);

                                return (
                                    <button
                                        key={group.id}
                                        type="button"
                                        onClick={() => openGroupModal(group)}
                                        className="w-full cursor-pointer p-4 text-left transition hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                                    >
                                        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                                            <div className="min-w-0">
                                                <div className="flex flex-wrap items-center gap-2">
                                                    <h3 className="truncate text-sm font-semibold text-foreground">
                                                        Group {group.id.slice(0, 8)}
                                                    </h3>
                                                    <span className="rounded-full border border-border bg-background px-2 py-0.5 text-xs text-muted-foreground">
                                                        {group.postsCount} post{group.postsCount === 1 ? "" : "s"}
                                                    </span>
                                                </div>
                                                <p className="mt-1 text-xs text-muted-foreground">
                                                    Created {formatRelativeTime(group.createdAt)}
                                                </p>
                                            </div>

                                            <div className="flex shrink-0 flex-wrap gap-1.5">
                                                {providers.map((provider) => (
                                                    <span key={provider} className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted">
                                                        <Image
                                                            src={getPlatformLogo(provider)}
                                                            alt={provider}
                                                            width={18}
                                                            height={18}
                                                            className="h-[18px] w-[18px] object-contain"
                                                        />
                                                    </span>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="mt-3 flex flex-wrap gap-2">
                                            {Object.entries(statusCounts).map(([status, count]) => (
                                                <span key={status} className={`rounded-full border px-2 py-1 text-xs font-medium capitalize ${statusColor(status)}`}>
                                                    {status}: {count}
                                                </span>
                                            ))}
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    )}

                    <PaginationControls
                        page={postGroupsPagination.page || groupsPage}
                        pageSize={groupsPageSize}
                        totalItems={postGroupsPagination.total}
                        onPageChange={setGroupsPage}
                        onPageSizeChange={(value) => {
                            setGroupsPageSize(value);
                            setGroupsPage(1);
                        }}
                    />
                </section>
            )}

            {selectedGroupModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm" onClick={closeGroupModal}>
                    <div
                        className="flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-2xl"
                        onClick={(event) => event.stopPropagation()}
                    >
                        <div className="flex shrink-0 items-center justify-between border-b border-border p-4">
                            <div className="min-w-0">
                                <h3 className="truncate text-lg font-semibold text-foreground">
                                    Post Group {selectedGroupModal.id.slice(0, 8)}
                                </h3>
                                <p className="mt-1 text-xs text-muted-foreground">
                                    {visibleSelectedGroup?.posts.length ?? selectedGroupModal.postsCount} post{(visibleSelectedGroup?.posts.length ?? selectedGroupModal.postsCount) === 1 ? "" : "s"} · Created {formatRelativeTime(selectedGroupModal.createdAt)}
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={closeGroupModal}
                                className="rounded-lg p-2 text-muted-foreground transition hover:bg-accent hover:text-foreground"
                                aria-label="Close post group"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        {selectedGroupError ? (
                            <div className="p-4 text-sm text-red-600 dark:text-red-200">{selectedGroupError.message}</div>
                        ) : isLoadingSelectedGroup ? (
                            <div className="flex min-h-72 items-center justify-center p-8 text-sm text-muted-foreground">
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Loading group posts...
                            </div>
                        ) : (
                            <div className="min-h-0 divide-y divide-border overflow-y-auto">
                                {(visibleSelectedGroup?.posts ?? selectedGroupModal.posts).map((post) => (
                                    <button
                                        key={`${post.id}-${post.status}`}
                                        type="button"
                                        onClick={() => handlePostClick(post)}
                                        className="grid w-full cursor-pointer gap-4 p-4 text-left transition hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 md:grid-cols-[minmax(0,1fr)_auto] md:items-center"
                                    >
                                        <div className="flex min-w-0 gap-3">
                                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted">
                                                <Image
                                                    src={getPlatformLogo(post.provider)}
                                                    alt={post.provider}
                                                    width={22}
                                                    height={22}
                                                    className="h-[22px] w-[22px] object-contain"
                                                />
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <div className="flex flex-wrap items-center gap-2">
                                                    <p className="text-sm font-semibold text-foreground">{formatPlatform(post.provider)}</p>
                                                    {post.isStory && (
                                                        <span className="rounded-full border border-violet-400/25 bg-violet-500/10 px-2 py-0.5 text-xs font-medium text-violet-700 dark:text-violet-200">
                                                            Story
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="mt-1 line-clamp-2 text-sm leading-6 text-muted-foreground">
                                                    {post.caption || "No caption"}
                                                </p>
                                                <p className="mt-2 text-xs text-muted-foreground">{formatRelativeTime(getPostDate(post))}</p>
                                                {post.lastError && (
                                                    <p className="mt-2 rounded-lg border border-red-500/20 bg-red-500/10 p-2 text-xs text-red-600 dark:text-red-200">
                                                        {post.lastError}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex shrink-0 flex-wrap items-center gap-2 md:justify-end">
                                            <span className={`rounded-full border px-2.5 py-1 text-xs font-medium capitalize ${statusColor(post.status)}`}>
                                                {post.status}
                                            </span>
                                            <span className="rounded-full border border-border bg-background px-2.5 py-1 text-xs font-medium uppercase text-muted-foreground">
                                                {post.postType}
                                            </span>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {selectedPost && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm" onClick={closePostDetails}>
                    <div
                        className="flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-2xl"
                        onClick={(event) => event.stopPropagation()}
                    >
                        <div className="z-10 flex shrink-0 items-center justify-between border-b border-border bg-card p-4 shadow-sm">
                            <div className="flex min-w-0 items-center gap-3">
                                <Image
                                    src={getPlatformLogo(selectedPost.provider)}
                                    alt={selectedPost.provider}
                                    width={28}
                                    height={28}
                                    className="h-7 w-7 object-contain"
                                />
                                <div className="min-w-0">
                                    <h3 className="truncate text-lg font-semibold text-foreground">Post Details</h3>
                                    <p className="text-xs capitalize text-muted-foreground">{selectedPost.provider}</p>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={closePostDetails}
                                className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                                aria-label="Close post details"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        {isLoadingPostDetails ? (
                            <DetailSkeleton />
                        ) : (
                            <div className="space-y-6 overflow-y-auto p-6">
                                {postDetailsError && (
                                    <div className="rounded-xl border border-amber-500/20 bg-amber-500/10 p-3 text-sm text-amber-700 dark:text-amber-200">
                                        {postDetailsError}
                                    </div>
                                )}

                                <div>
                                    <h4 className="mb-3 text-sm font-semibold text-foreground">Platform Preview</h4>
                                    <PlatformPostPreview post={selectedPost} />
                                </div>

                                <div className="grid gap-3 sm:grid-cols-2">
                                    <div className="rounded-xl border border-border bg-muted/30 p-4">
                                        <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                                            <FileText className="h-4 w-4 text-primary" />
                                            Type
                                        </div>
                                        <p className="mt-2 text-sm uppercase text-muted-foreground">{selectedPost.postType}</p>
                                    </div>
                                    <div className="rounded-xl border border-border bg-muted/30 p-4">
                                        <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                                            <Clock3 className="h-4 w-4 text-primary" />
                                            Status
                                        </div>
                                        <span className={`mt-2 inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold capitalize ${getStatusClasses(selectedPost.status)}`}>
                                            {selectedPost.status}
                                        </span>
                                    </div>
                                </div>

                                {selectedPost.caption && (
                                    <div>
                                        <h4 className="mb-2 text-sm font-semibold text-foreground">Caption</h4>
                                        <p className="whitespace-pre-wrap rounded-xl border border-border bg-muted/30 p-4 text-sm leading-6 text-muted-foreground">
                                            {selectedPost.caption}
                                        </p>
                                    </div>
                                )}

                                <div className="grid gap-4 sm:grid-cols-2">
                                    {[
                                        ["Created", selectedPost.createdAt],
                                        ["Scheduled", selectedPost.scheduledFor],
                                        ["Published", selectedPost.publishedAt],
                                        ["Failed", selectedPost.failedAt],
                                        ["Next attempt", selectedPost.nextAttemptAt],
                                        ["Updated", selectedPost.updatedAt],
                                    ].map(([label, value]) => (
                                        <div key={label} className="rounded-xl border border-border bg-card p-4">
                                            <p className="text-xs font-medium text-muted-foreground">{label}</p>
                                            <p className="mt-1 text-sm font-semibold text-foreground">
                                                {value ? new Date(value).toLocaleString() : "Not set"}
                                            </p>
                                        </div>
                                    ))}
                                </div>

                                {(selectedPost.postUrl || selectedPost.lastError || selectedPost.attemptCount !== undefined) && (
                                    <div className="rounded-xl border border-border bg-muted/30 p-4">
                                        <h4 className="text-sm font-semibold text-foreground">Publishing Info</h4>
                                        <dl className="mt-3 grid gap-3 text-sm sm:grid-cols-2">
                                            {selectedPost.attemptCount !== undefined && (
                                                <div>
                                                    <dt className="text-muted-foreground">Attempts</dt>
                                                    <dd className="font-medium text-foreground">{selectedPost.attemptCount}</dd>
                                                </div>
                                            )}
                                            {selectedPost.postUrl && (
                                                <div>
                                                    <dt className="text-muted-foreground">Post URL</dt>
                                                    <dd>
                                                        <a href={selectedPost.postUrl} target="_blank" rel="noopener noreferrer" className="break-all font-medium text-primary hover:underline">
                                                            Open post
                                                        </a>
                                                    </dd>
                                                </div>
                                            )}
                                            {selectedPost.lastError && (
                                                <div className="sm:col-span-2">
                                                    <dt className="text-muted-foreground">Last error</dt>
                                                    <dd className="mt-1 rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-red-700 dark:text-red-200">
                                                        {selectedPost.lastError}
                                                    </dd>
                                                </div>
                                            )}
                                        </dl>
                                    </div>
                                )}

                                {selectedPost.isStory && (
                                    <div className="rounded-xl border border-border bg-muted/30 p-4 text-sm text-muted-foreground">
                                        This post is marked as a story.
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
