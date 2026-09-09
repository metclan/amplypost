"use client";

import Image from "next/image";
import { useCallback, useMemo, useState } from "react";
import { Bookmark, Clock3, FileText, Heart, MessageCircle, MoreHorizontal, Repeat2, Send, Share2, ThumbsUp, VolumeX, X } from "lucide-react";

import { getDaysInMonth, getFirstDayOfMonth, getMonthName, isToday } from "@/util/date-utils";
import { useCachedResource } from "@/lib/client-cache";
import { CACHE_TTL, POSTS_CACHE_PREFIX, getPlatformLogo } from "@/lib/client-data";
import { apiFetch } from "@/util/backend-api";

type PostStatus = "published" | "failed" | "scheduled" | "pending" | "processing" | string;

export type CalendarPost = {
    id: string;
    groupId?: string;
    provider: string;
    status: PostStatus;
    postType: string;
    isStory?: boolean;
    scheduledFor: string | null;
    timezone: string | null;
    publishedAt: string | null;
    createdAt: string;
    updatedAt?: string;
    failedAt?: string | null;
    nextAttemptAt?: string | null;
    postUrl?: string | null;
    attemptCount?: number;
    lastError?: string | null;
    externalPostId?: string | null;
    externalContainerId?: string | null;
    accountName?: string | null;
    caption?: string;
    imageUrls?: string[];
    videoUrls?: string[];
};

type PostsResponse = {
    data?: {
        posts?: CalendarPost[];
    };
    posts?: CalendarPost[];
};

type RawPost = Record<string, unknown>;

function getMonthRange(date: Date) {
    const from = new Date(date.getFullYear(), date.getMonth(), 1, 0, 0, 0, 0);
    const to = new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999);
    return { from: from.toISOString(), to: to.toISOString() };
}

function getPostDate(post: CalendarPost) {
    return new Date(post.scheduledFor || post.publishedAt || post.createdAt);
}

export function getStatusClasses(status: PostStatus) {
    switch (status) {
        case "scheduled":
            return "border-blue-500/25 bg-blue-500/10 text-blue-700 hover:bg-blue-500/15 dark:text-blue-200";
        case "published":
            return "border-emerald-500/25 bg-emerald-500/10 text-emerald-700 hover:bg-emerald-500/15 dark:text-emerald-200";
        case "failed":
            return "border-red-500/25 bg-red-500/10 text-red-700 hover:bg-red-500/15 dark:text-red-200";
        case "processing":
        case "pending":
        case "publishing":
            return "border-amber-500/25 bg-amber-500/10 text-amber-700 hover:bg-amber-500/15 dark:text-amber-200";
        default:
            return "border-muted bg-muted/60 text-muted-foreground hover:bg-muted";
    }
}

function getString(raw: RawPost, key: string) {
    const value = raw[key];
    return typeof value === "string" ? value : undefined;
}

function getBoolean(raw: RawPost, key: string) {
    const value = raw[key];
    return typeof value === "boolean" ? value : undefined;
}

function getStringArray(raw: RawPost, key: string) {
    const value = raw[key];
    return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : undefined;
}

function getNumber(raw: RawPost, key: string) {
    const value = raw[key];
    return typeof value === "number" ? value : undefined;
}

function getMediaUrls(raw: RawPost, mediaType: "image" | "video") {
    const value = raw.mediaUrls ?? raw.media_urls;
    if (!Array.isArray(value)) return [];

    return value.flatMap((item) => {
        if (!isRawPost(item)) return [];
        const url = getString(item, "mediaUrl") ?? getString(item, "media_url");
        const type = getString(item, "mediaType") ?? getString(item, "media_type");
        return url && type?.toLowerCase() === mediaType ? [url] : [];
    });
}

export function normalizePost(raw: RawPost): CalendarPost {
    const imageUrlStrings = getStringArray(raw, "imageUrls") ?? getStringArray(raw, "image_urls") ?? [];
    const videoUrlStrings = getStringArray(raw, "videoUrls") ?? getStringArray(raw, "video_urls") ?? [];
    const imageUrls = imageUrlStrings.length > 0 ? imageUrlStrings : getMediaUrls(raw, "image");
    const videoUrls = videoUrlStrings.length > 0 ? videoUrlStrings : getMediaUrls(raw, "video");

    return {
        id: getString(raw, "id") ?? "",
        groupId: getString(raw, "groupId") ?? getString(raw, "group_id"),
        provider: getString(raw, "provider") ?? "unknown",
        status: getString(raw, "status") ?? "pending",
        postType: getString(raw, "postType") ?? getString(raw, "post_type") ?? "POST",
        isStory: getBoolean(raw, "isStory") ?? getBoolean(raw, "is_story") ?? false,
        scheduledFor: getString(raw, "scheduledFor") ?? getString(raw, "scheduled_for") ?? null,
        timezone: getString(raw, "timezone") ?? null,
        publishedAt: getString(raw, "publishedAt") ?? getString(raw, "published_at") ?? null,
        createdAt: getString(raw, "createdAt") ?? getString(raw, "created_at") ?? new Date().toISOString(),
        updatedAt: getString(raw, "updatedAt") ?? getString(raw, "updated_at"),
        failedAt: getString(raw, "failedAt") ?? getString(raw, "failed_at") ?? null,
        nextAttemptAt: getString(raw, "nextAttemptAt") ?? getString(raw, "next_attempt_at") ?? null,
        postUrl: getString(raw, "postUrl") ?? getString(raw, "post_url") ?? null,
        attemptCount: getNumber(raw, "attemptCount") ?? getNumber(raw, "attempt_count"),
        lastError: getString(raw, "lastError") ?? getString(raw, "last_error") ?? null,
        externalPostId: getString(raw, "externalPostId") ?? getString(raw, "external_post_id") ?? null,
        externalContainerId: getString(raw, "externalContainerId") ?? getString(raw, "external_container_id") ?? null,
        accountName: getString(raw, "accountName") ?? getString(raw, "account_name") ?? null,
        caption: getString(raw, "caption"),
        imageUrls,
        videoUrls,
    };
}

function getProviderName(post: CalendarPost) {
    return post.accountName || `${post.provider.charAt(0).toUpperCase()}${post.provider.slice(1)} account`;
}

function getFirstMedia(post: CalendarPost) {
    const video = post.videoUrls?.[0];
    if (video) return { url: video, type: "video" as const };
    const image = post.imageUrls?.[0];
    if (image) return { url: image, type: "image" as const };
    return null;
}

function MediaFrame({ post, className = "aspect-square" }: { post: CalendarPost; className?: string }) {
    const media = getFirstMedia(post);

    if (!media) {
        return (
            <div className={`${className} flex items-center justify-center bg-muted text-muted-foreground`}>
                <FileText className="h-10 w-10" />
            </div>
        );
    }

    if (media.type === "video") {
        return <video src={media.url} controls playsInline className={`${className} w-full bg-black object-cover`} />;
    }

    return <img src={media.url} alt="Post media preview" className={`${className} w-full object-cover`} />;
}

function InstagramPreview({ post }: { post: CalendarPost }) {
    return (
        <div className="mx-auto max-w-[430px] overflow-hidden rounded-2xl border border-zinc-800 bg-[#05070a] text-white shadow-xl">
            <div className="relative">
                <MediaFrame post={post} className="aspect-[9/12]" />
                <div className="absolute inset-x-0 top-0 flex items-start justify-between bg-gradient-to-b from-black/65 to-transparent p-4">
                    <div className="flex items-center gap-3">
                        <span className="rounded-full bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600 p-0.5">
                            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-black p-1">
                                <Image src={getPlatformLogo(post.provider)} alt={post.provider} width={26} height={26} className="h-6 w-6 object-contain" />
                            </span>
                        </span>
                        <div>
                            <p className="font-bold leading-tight">{getProviderName(post)}</p>
                            <p className="text-sm leading-tight text-white/85">{post.isStory ? "Story" : "Original audio"}</p>
                        </div>
                    </div>
                    <MoreHorizontal className="h-6 w-6" />
                </div>
                {post.postType.toLowerCase() === "video" && (
                    <span className="absolute bottom-4 right-4 rounded-full bg-black/55 p-3">
                        <VolumeX className="h-5 w-5" />
                    </span>
                )}
            </div>
            <div className="border-t border-zinc-800 p-4">
                <div className="mb-3 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Heart className="h-7 w-7 fill-red-500 text-red-500" />
                        <MessageCircle className="h-7 w-7" />
                        <Send className="h-7 w-7" />
                    </div>
                    <Bookmark className="h-7 w-7" />
                </div>
                <p className="text-sm leading-6">
                    <span className="font-bold">{getProviderName(post)}</span>{" "}
                    {post.caption || "No caption"}
                </p>
            </div>
        </div>
    );
}

function FacebookPreview({ post }: { post: CalendarPost }) {
    return (
        <div className="mx-auto max-w-[520px] rounded-2xl border border-border bg-card p-4 shadow-sm">
            <div className="flex items-center gap-3">
                <Image src={getPlatformLogo(post.provider)} alt={post.provider} width={42} height={42} className="h-10 w-10 rounded-full object-contain" />
                <div>
                    <p className="font-semibold text-foreground">{getProviderName(post)}</p>
                    <p className="text-xs text-muted-foreground">Just now · Public</p>
                </div>
                <MoreHorizontal className="ml-auto h-5 w-5 text-muted-foreground" />
            </div>
            {post.caption && <p className="mt-4 whitespace-pre-wrap text-sm leading-6 text-foreground">{post.caption}</p>}
            <div className="mt-4 overflow-hidden rounded-xl border border-border">
                <MediaFrame post={post} className="aspect-video" />
            </div>
            <div className="mt-3 flex justify-around border-t border-border pt-3 text-sm font-medium text-muted-foreground">
                <span className="inline-flex items-center gap-2"><ThumbsUp className="h-4 w-4" /> Like</span>
                <span className="inline-flex items-center gap-2"><MessageCircle className="h-4 w-4" /> Comment</span>
                <span className="inline-flex items-center gap-2"><Share2 className="h-4 w-4" /> Share</span>
            </div>
        </div>
    );
}

function XPreview({ post }: { post: CalendarPost }) {
    return (
        <div className="mx-auto max-w-[520px] rounded-2xl border border-border bg-card p-4 shadow-sm">
            <div className="flex gap-3">
                <Image src={getPlatformLogo(post.provider)} alt={post.provider} width={42} height={42} className="h-10 w-10 rounded-full object-contain" />
                <div className="min-w-0 flex-1">
                    <p className="font-bold text-foreground">{getProviderName(post)} <span className="font-normal text-muted-foreground">@{post.provider} · now</span></p>
                    {post.caption && <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-foreground">{post.caption}</p>}
                    <div className="mt-3 overflow-hidden rounded-2xl border border-border">
                        <MediaFrame post={post} className="aspect-video" />
                    </div>
                    <div className="mt-4 flex justify-between text-muted-foreground">
                        <MessageCircle className="h-5 w-5" />
                        <Repeat2 className="h-5 w-5" />
                        <Heart className="h-5 w-5" />
                        <Share2 className="h-5 w-5" />
                    </div>
                </div>
            </div>
        </div>
    );
}

function LinkedInPreview({ post }: { post: CalendarPost }) {
    return (
        <div className="mx-auto max-w-[540px] rounded-2xl border border-border bg-card shadow-sm">
            <div className="p-4">
                <div className="flex items-center gap-3">
                    <Image src={getPlatformLogo(post.provider)} alt={post.provider} width={44} height={44} className="h-11 w-11 rounded-md object-contain" />
                    <div>
                        <p className="font-semibold text-foreground">{getProviderName(post)}</p>
                        <p className="text-xs text-muted-foreground">Company page · now</p>
                    </div>
                </div>
                {post.caption && <p className="mt-4 whitespace-pre-wrap text-sm leading-6 text-foreground">{post.caption}</p>}
            </div>
            <MediaFrame post={post} className="aspect-video" />
            <div className="flex justify-around border-t border-border p-3 text-sm font-medium text-muted-foreground">
                <span>Like</span><span>Comment</span><span>Repost</span><span>Send</span>
            </div>
        </div>
    );
}

function VideoFirstPreview({ post }: { post: CalendarPost }) {
    return (
        <div className="mx-auto max-w-[360px] overflow-hidden rounded-[28px] border border-zinc-800 bg-black text-white shadow-xl">
            <div className="relative">
                <MediaFrame post={post} className="aspect-[9/16]" />
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 to-transparent p-4">
                    <p className="font-bold">{getProviderName(post)}</p>
                    <p className="mt-1 line-clamp-3 text-sm leading-5 text-white/90">{post.caption || "No caption"}</p>
                </div>
                <div className="absolute right-3 top-1/3 space-y-4 text-center">
                    <Heart className="h-7 w-7" />
                    <MessageCircle className="h-7 w-7" />
                    <Share2 className="h-7 w-7" />
                </div>
            </div>
        </div>
    );
}

function PinterestPreview({ post }: { post: CalendarPost }) {
    return (
        <div className="mx-auto max-w-[360px] overflow-hidden rounded-3xl border border-border bg-card shadow-sm">
            <MediaFrame post={post} className="aspect-[3/4]" />
            <div className="p-4">
                <p className="font-semibold text-foreground">{post.caption || "Pinterest pin"}</p>
                <p className="mt-2 text-xs text-muted-foreground">{getProviderName(post)}</p>
            </div>
        </div>
    );
}

export function PlatformPostPreview({ post }: { post: CalendarPost }) {
    const provider = post.provider.toLowerCase();
    if (provider === "instagram") return <InstagramPreview post={post} />;
    if (provider === "facebook") return <FacebookPreview post={post} />;
    if (provider === "x" || provider === "twitter" || provider === "threads" || provider === "bluesky") return <XPreview post={post} />;
    if (provider === "linkedin") return <LinkedInPreview post={post} />;
    if (provider === "tiktok" || provider === "youtube") return <VideoFirstPreview post={post} />;
    if (provider === "pinterest") return <PinterestPreview post={post} />;
    return <FacebookPreview post={post} />;
}

function isRawPost(value: unknown): value is RawPost {
    return Boolean(value && typeof value === "object" && !Array.isArray(value));
}

export function extractPostDetails(payload: unknown, fallback: CalendarPost): CalendarPost {
    const root = isRawPost(payload) ? payload : {};
    const data = isRawPost(root.data) ? root.data : undefined;
    const posts = Array.isArray(root.posts) ? root.posts : undefined;
    const raw = (data && isRawPost(data.post) && data.post) || (data && isRawPost(data) && data) || (isRawPost(root.post) && root.post) || (posts && isRawPost(posts[0]) && posts[0]) || fallback;
    return normalizePost({ ...fallback, ...raw });
}

export function DetailSkeleton() {
    return (
        <div className="space-y-6 p-6">
            <div className="h-5 w-40 animate-pulse rounded bg-muted" />
            <div className="space-y-2">
                <div className="h-4 w-full animate-pulse rounded bg-muted" />
                <div className="h-4 w-3/4 animate-pulse rounded bg-muted" />
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
                <div className="h-24 animate-pulse rounded-xl bg-muted" />
                <div className="h-24 animate-pulse rounded-xl bg-muted" />
            </div>
            <div className="h-32 animate-pulse rounded-xl bg-muted" />
        </div>
    );
}

async function fetchCalendarPosts(params: URLSearchParams) {
    const response = await apiFetch(`posts?${params.toString()}`);

    if (!response.ok) throw new Error("Failed to fetch posts");

    const data = (await response.json()) as PostsResponse;
    return (data.data?.posts ?? data.posts ?? []).map(normalizePost);
}

export default function CalendarView() {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedPost, setSelectedPost] = useState<CalendarPost | null>(null);
    const [isLoadingPostDetails, setIsLoadingPostDetails] = useState(false);
    const [postDetailsError, setPostDetailsError] = useState<string | null>(null);

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const daysInMonth = getDaysInMonth(year, month);
    const firstDayOfMonth = getFirstDayOfMonth(year, month);
    const postsParams = useMemo(
        () =>
            new URLSearchParams({
                ...getMonthRange(currentDate),
                page: "1",
                limit: "100",
            }),
        [currentDate],
    );
    const postsCacheKey = useMemo(() => `${POSTS_CACHE_PREFIX}:month:${postsParams.toString()}`, [postsParams]);
    const fetchPosts = useCallback(() => fetchCalendarPosts(postsParams), [postsParams]);
    const {
        data: posts = [],
        error,
        isLoading,
    } = useCachedResource(postsCacheKey, fetchPosts, { ttl: CACHE_TTL });

    const calendarDays = useMemo(() => {
        const days: (number | null)[] = [];
        for (let i = 0; i < firstDayOfMonth; i++) days.push(null);
        for (let day = 1; day <= daysInMonth; day++) days.push(day);
        return days;
    }, [daysInMonth, firstDayOfMonth]);

    const getPostsForDay = (day: number) => {
        return posts.filter((post) => {
            const postDate = getPostDate(post);
            return postDate.getDate() === day && postDate.getMonth() === month && postDate.getFullYear() === year;
        });
    };

    const handlePostClick = async (post: CalendarPost) => {
        setSelectedPost(post);
        setIsLoadingPostDetails(true);
        setPostDetailsError(null);

        try {
            const response = await apiFetch(`posts/${post.id}`, {
                cache: "no-store",
            });
            if (!response.ok) throw new Error("Failed to fetch post details");

            const data = await response.json();
            setSelectedPost(extractPostDetails(data, post));
        } catch (err) {
            console.error("Error fetching post details:", err);
            setPostDetailsError(err instanceof Error ? err.message : "Failed to fetch post details");
        } finally {
            setIsLoadingPostDetails(false);
        }
    };

    const closePostDetails = () => {
        setSelectedPost(null);
        setPostDetailsError(null);
    };

    const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

    return (
        <div className="space-y-6">
            <div className="flex flex-col justify-between gap-4 border-b border-border pb-5 md:flex-row md:items-end">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-foreground">Calendar</h1>
                    <p className="mt-2 text-sm text-muted-foreground">
                        {isLoading ? "Loading posts..." : "View published, scheduled, and processing posts."}
                    </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                    <button
                        onClick={() => setCurrentDate(new Date())}
                        disabled={isLoading}
                        className="cursor-pointer rounded-lg border border-border bg-background px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        Today
                    </button>
                    <div className="flex items-center gap-2 rounded-xl border border-border bg-card p-1 shadow-sm">
                        <button
                            onClick={() => setCurrentDate(new Date(year, month - 1, 1))}
                            disabled={isLoading}
                            className="cursor-pointer rounded-lg px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            Prev
                        </button>
                        <div className="min-w-32 px-3 text-center text-sm font-semibold text-foreground sm:min-w-36">
                            {getMonthName(month)} {year}
                        </div>
                        <button
                            onClick={() => setCurrentDate(new Date(year, month + 1, 1))}
                            disabled={isLoading}
                            className="cursor-pointer rounded-lg px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            Next
                        </button>
                    </div>
                </div>
            </div>

            {error && (
                <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-700 dark:text-red-200">
                    {error.message}
                </div>
            )}

            <div className="flex flex-wrap items-center gap-4 rounded-2xl border border-border bg-card p-4 shadow-sm sm:gap-6">
                {[
                    ["Scheduled", "bg-blue-500"],
                    ["Published", "bg-emerald-500"],
                    ["Processing/Pending", "bg-amber-500"],
                    ["Failed", "bg-red-500"],
                ].map(([label, color]) => (
                    <div key={label} className="flex items-center gap-2">
                        <div className={`h-3 w-3 rounded-full ${color}`} />
                        <span className="text-sm text-muted-foreground">{label}</span>
                    </div>
                ))}
            </div>

            <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
                <div className="grid grid-cols-7 border-b border-border bg-muted/50">
                    {weekDays.map((day) => (
                        <div key={day} className="border-r border-border p-2 text-center text-xs font-semibold text-foreground last:border-r-0 sm:p-4 sm:text-sm">
                            {day}
                        </div>
                    ))}
                </div>

                <div className="grid grid-cols-7">
                    {calendarDays.map((day, index) => {
                        const dayPosts = day ? getPostsForDay(day) : [];
                        const today = day ? isToday(day, month, year) : false;

                        return (
                            <div
                                key={index}
                                className={`flex h-28 min-w-0 flex-col border-b border-r border-border p-1.5 last:border-r-0 sm:h-40 sm:p-2 lg:h-[190px] lg:p-3 ${
                                    day === null ? "bg-muted/30" : today ? "bg-primary/5" : "bg-background"
                                }`}
                            >
                                {day !== null && (
                                    <>
                                        <div className="mb-1 flex shrink-0 items-center justify-between sm:mb-2">
                                            <span className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold sm:h-7 sm:w-7 sm:text-sm ${today ? "bg-primary text-primary-foreground" : "text-foreground"}`}>
                                                {day}
                                            </span>
                                            {dayPosts.length > 0 && <span className="text-[10px] text-muted-foreground sm:text-xs">{dayPosts.length}</span>}
                                        </div>

                                        <div className="flex-1 space-y-1 overflow-y-auto pr-1">
                                            {dayPosts.map((post) => {
                                                const displayDate = getPostDate(post);
                                                return (
                                                    <button
                                                        key={post.id}
                                                        type="button"
                                                        onClick={() => handlePostClick(post)}
                                                        className={`w-full cursor-pointer rounded-lg border px-1.5 py-1.5 text-left text-[10px] transition sm:px-2 sm:text-xs ${getStatusClasses(post.status)}`}
                                                    >
                                                        <div className="flex min-w-0 items-center gap-1.5">
                                                            <Image
                                                                src={getPlatformLogo(post.provider)}
                                                                alt={post.provider}
                                                                width={16}
                                                                height={16}
                                                                className="h-4 w-4 shrink-0 object-contain"
                                                            />
                                                            <span className="truncate font-semibold capitalize">{post.provider}</span>
                                                        </div>
                                                        <div className="mt-1 flex min-w-0 items-center justify-between gap-1">
                                                            <span className="truncate uppercase">{post.postType}</span>
                                                            <span className="shrink-0 text-[10px] opacity-75">
                                                                {displayDate.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                                                            </span>
                                                        </div>
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>

            {selectedPost && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm" onClick={closePostDetails}>
                    <div className="flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-2xl" onClick={(event) => event.stopPropagation()}>
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
                            <button onClick={closePostDetails} className="rounded-lg p-2 transition-colors hover:bg-accent">
                                <X className="h-5 w-5 text-muted-foreground" />
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
