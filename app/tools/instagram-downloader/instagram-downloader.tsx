"use client";

import { useState, useRef } from "react";
import { GetAmplypostCard } from "@/app/components/get-amplypost-card";

type MediaDetail = {
    type: "video" | "image";
    dimensions?: { height: number; width: number };
    video_view_count?: number;
    url: string;
    thumbnail?: string;
};

type PostInfo = {
    owner_username?: string;
    owner_fullname?: string;
    is_verified?: boolean;
    likes?: number;
    caption?: string;
};

type VideoResult = {
    results_number: number;
    url_list: string[];
    post_info?: PostInfo;
    media_details?: MediaDetail[];
};

export default function InstagramDownloader() {
    const [url, setUrl] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [result, setResult] = useState<VideoResult | null>(null);
    const [loadedImages, setLoadedImages] = useState<Set<number>>(new Set());
    const [downloadingIndex, setDownloadingIndex] = useState<number | null>(null);

    const inputRef = useRef<HTMLInputElement>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const trimmed = url.trim();
        if (!trimmed) return;

        setLoading(true);
        setError(null);
        setResult(null);

        try {
            const res = await fetch("/api/tools/instagram-downloader", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ url: trimmed }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || "Something went wrong");
            }

            setResult(data.data);
        } catch (err) {
            setError(
                err instanceof Error ? err.message : "Failed to resolve video"
            );
        } finally {
            setLoading(false);
        }
    };

    const handleDownload = async (mediaUrl: string, index: number, type: string) => {
        setDownloadingIndex(index);

        // Directly open the Instagram URL in a new tab.
        // Some browsers will play it, some will download it, but it avoids the proxy bottleneck.
        window.open(mediaUrl, "_blank");

        // Flash the "Preparing..." state briefly to give feedback
        setTimeout(() => setDownloadingIndex(null), 1000);
    };


    const handleReset = () => {
        setUrl("");
        setResult(null);
        setError(null);
        setLoadedImages(new Set());
        inputRef.current?.focus();
    };

    const mediaItems = result?.media_details?.length
        ? result.media_details
        : result?.url_list?.length
            ? result.url_list.map((u) => ({ type: "video" as const, url: u, thumbnail: undefined }))
            : [];

    return (
        <div className="space-y-8">
            {/* Input form */}
            <form onSubmit={handleSubmit} className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <div className="relative flex-1">
                    <input
                        ref={inputRef}
                        id="instagram-url-input"
                        type="url"
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        placeholder="Paste Instagram Reel or post link here…"
                        className="w-full rounded-xl border border-border bg-background px-5 py-4 pr-14 text-base text-foreground placeholder-muted-foreground shadow-sm transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                        required
                    />
                    {url && (
                        <button
                            type="button"
                            onClick={() => setUrl("")}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
                            aria-label="Clear input"
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 20 20"
                                fill="currentColor"
                                className="h-5 w-5"
                            >
                                <path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z" />
                            </svg>
                        </button>
                    )}
                </div>

                <button
                    type="submit"
                    disabled={loading || !url.trim()}
                    id="download-button"
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#f09433] via-[#e6683c] via-[#dc2743] via-[#cc2366] to-[#bc1888] px-6 py-4 text-base font-semibold text-white transition-all hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto sm:flex-shrink-0"
                >
                    {loading ? (
                        <>
                            <svg
                                className="h-5 w-5 animate-spin"
                                fill="none"
                                viewBox="0 0 24 24"
                            >
                                <circle
                                    className="opacity-25"
                                    cx="12"
                                    cy="12"
                                    r="10"
                                    stroke="currentColor"
                                    strokeWidth="4"
                                />
                                <path
                                    className="opacity-75"
                                    fill="currentColor"
                                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                                />
                            </svg>
                            Processing…
                        </>
                    ) : (
                        <>
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 20 20"
                                fill="currentColor"
                                className="h-5 w-5"
                            >
                                <path d="M10.75 2.75a.75.75 0 0 0-1.5 0v8.614L6.295 8.235a.75.75 0 1 0-1.09 1.03l4.25 4.5a.75.75 0 0 0 1.09 0l4.25-4.5a.75.75 0 0 0-1.09-1.03l-2.955 3.129V2.75Z" />
                                <path d="M3.5 12.75a.75.75 0 0 0-1.5 0v2.5A2.75 2.75 0 0 0 4.75 18h10.5A2.75 2.75 0 0 0 18 15.25v-2.5a.75.75 0 0 0-1.5 0v2.5c0 .69-.56 1.25-1.25 1.25H4.75c-.69 0-1.25-.56-1.25-1.25v-2.5Z" />
                            </svg>
                            Download
                        </>
                    )}
                </button>
            </form>

            {/* Skeleton */}
            {loading && (
                <div className="space-y-5 rounded-2xl border border-border bg-card p-6 shadow-sm animate-pulse">
                    {/* Post info skeleton */}
                    <div className="flex items-start gap-3 border-b border-border pb-4">
                        <div className="flex-1 space-y-2">
                            <div className="h-3.5 w-36 rounded-md bg-muted" />
                            <div className="h-3 w-24 rounded-md bg-muted" />
                            <div className="h-3 w-full rounded-md bg-muted mt-2" />
                            <div className="h-3 w-4/5 rounded-md bg-muted" />
                        </div>
                        <div className="flex items-center gap-1.5 flex-shrink-0">
                            <div className="h-4 w-4 rounded-full bg-muted" />
                            <div className="h-3 w-12 rounded-md bg-muted" />
                        </div>
                    </div>

                    {/* Media skeleton column */}
                    <div className="mx-auto flex w-full max-w-[280px] flex-col space-y-3">
                        {/* Thumbnail skeleton */}
                        <div className="aspect-[9/16] w-full rounded-xl bg-muted" />

                        {/* Button skeleton */}
                        <div className="h-11 w-full rounded-xl bg-muted" />
                    </div>
                </div>
            )}

            {/* Error */}
            {error && (
                <div className="flex items-start gap-3 rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        className="mt-0.5 h-5 w-5 flex-shrink-0"
                    >
                        <path
                            fillRule="evenodd"
                            d="M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0Zm-8-5a.75.75 0 0 1 .75.75v4.5a.75.75 0 0 1-1.5 0v-4.5A.75.75 0 0 1 10 5Zm0 10a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z"
                            clipRule="evenodd"
                        />
                    </svg>
                    <p>{error}</p>
                </div>
            )}

            {/* Result */}
            {result && mediaItems.length > 0 && (
                <div className="space-y-5 rounded-2xl border border-border bg-card p-6 shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-500">
                    {/* Post info */}
                    {result.post_info && (
                        <div className="flex items-start gap-3 border-b border-border pb-4">
                            <div className="flex-1 min-w-0">
                                {result.post_info.owner_fullname && (
                                    <p className="font-semibold text-sm text-foreground truncate">
                                        {result.post_info.owner_fullname}
                                        {result.post_info.is_verified && (
                                            <span className="ml-1 inline-flex items-center">
                                                <svg className="h-4 w-4 text-blue-500" viewBox="0 0 20 20" fill="currentColor">
                                                    <path fillRule="evenodd" d="M16.403 12.652a3 3 0 0 0 0-5.304 3 3 0 0 0-3.75-3.751 3 3 0 0 0-5.305 0 3 3 0 0 0-3.751 3.75 3 3 0 0 0 0 5.305 3 3 0 0 0 3.75 3.751 3 3 0 0 0 5.305 0 3 3 0 0 0 3.751-3.75Zm-2.546-4.46a.75.75 0 0 0-1.214-.883l-3.483 4.79-1.88-1.88a.75.75 0 1 0-1.06 1.061l2.5 2.5a.75.75 0 0 0 1.137-.089l4-5.5Z" clipRule="evenodd" />
                                                </svg>
                                            </span>
                                        )}
                                    </p>
                                )}
                                {result.post_info.owner_username && (
                                    <p className="text-xs text-muted-foreground">@{result.post_info.owner_username}</p>
                                )}
                                {result.post_info.caption && (
                                    <p className="mt-2 text-xs text-muted-foreground line-clamp-2">{result.post_info.caption}</p>
                                )}
                            </div>
                            {result.post_info.likes !== undefined && (
                                <div className="flex items-center gap-1 text-xs text-muted-foreground flex-shrink-0">
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4 text-rose-500">
                                        <path d="m9.653 16.915-.005-.003-.019-.01a20.759 20.759 0 0 1-1.162-.682 22.045 22.045 0 0 1-2.582-2.184C4.045 12.733 2 10.352 2 7.5a4.5 4.5 0 0 1 8-2.828A4.5 4.5 0 0 1 18 7.5c0 2.852-2.044 5.233-3.885 6.936a22.049 22.049 0 0 1-3.744 2.582l-.019.01-.005.003h-.002a.739.739 0 0 1-.69.001l-.002-.001Z" />
                                    </svg>
                                    {result.post_info.likes.toLocaleString()}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Media previews and download buttons */}
                    <div className={`grid gap-4 ${mediaItems.length > 1 ? "sm:grid-cols-2" : "grid-cols-1"}`}>
                        {mediaItems.map((item, index) => (
                            <div key={index} className="mx-auto flex w-full max-w-[280px] flex-col space-y-3">
                                {/* Thumbnail */}
                                {item.thumbnail && (
                                    <div className="relative overflow-hidden rounded-xl border border-border bg-muted aspect-[9/16]">
                                        {/* Shimmer placeholder shown while image loads */}
                                        {!loadedImages.has(index) && (
                                            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 animate-pulse">
                                                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted-foreground/10">
                                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-7 w-7 text-muted-foreground/40">
                                                        <path d="M12 9a3.75 3.75 0 1 0 0 7.5A3.75 3.75 0 0 0 12 9Z" />
                                                        <path fillRule="evenodd" d="M9.344 3.071a49.52 49.52 0 0 1 5.312 0c.967.052 1.83.585 2.332 1.39l.821 1.317c.24.383.645.643 1.11.71.386.054.77.113 1.152.177 1.432.239 2.429 1.493 2.429 2.909V18a3 3 0 0 1-3 3h-15a3 3 0 0 1-3-3V9.574c0-1.416.997-2.67 2.429-2.909.382-.064.766-.123 1.151-.177a1.56 1.56 0 0 0 1.11-.71l.822-1.318a2.849 2.849 0 0 1 2.332-1.389Zm6.406 5.504a.75.75 0 0 0-.75-.75h-.008a.75.75 0 0 0-.75.75v.008c0 .414.336.75.75.75h.008a.75.75 0 0 0 .75-.75V8.575ZM12 7.5a4.5 4.5 0 1 0 0 9 4.5 4.5 0 0 0 0-9Z" clipRule="evenodd" />
                                                    </svg>
                                                </div>
                                                <p className="text-xs text-muted-foreground/60 font-medium">Loading preview…</p>
                                            </div>
                                        )}
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        <img
                                            src={`/api/proxy-image?url=${encodeURIComponent(item.thumbnail)}`}
                                            alt={`Media ${index + 1}`}
                                            className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-500 ${loadedImages.has(index) ? "opacity-100" : "opacity-0"
                                                }`}
                                            onLoad={() => setLoadedImages(prev => new Set(prev).add(index))}
                                        />
                                        {item.type === "video" && item.video_view_count !== undefined && (
                                            <span className="absolute bottom-2 left-2 rounded-md bg-black/70 px-2 py-0.5 text-xs font-medium text-white backdrop-blur-sm">
                                                {item.video_view_count.toLocaleString()} views
                                            </span>
                                        )}
                                        {item.dimensions && (
                                            <span className="absolute bottom-2 right-2 rounded-md bg-black/70 px-2 py-0.5 text-xs font-medium text-white backdrop-blur-sm">
                                                {item.dimensions.width}×{item.dimensions.height}
                                            </span>
                                        )}
                                    </div>
                                )}

                                {/* Download button */}
                                <button
                                    onClick={() => handleDownload(item.url, index, item.type)}
                                    disabled={downloadingIndex === index}
                                    id={`download-media-${index}`}
                                    className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#f09433] via-[#dc2743] to-[#bc1888] px-5 py-3 text-sm font-semibold text-white shadow-sm transition-all hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-80"
                                >
                                    {downloadingIndex === index ? (
                                        <>
                                            <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                            </svg>
                                            Preparing download…
                                        </>
                                    ) : (
                                        <>
                                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
                                                <path d="M10.75 2.75a.75.75 0 0 0-1.5 0v8.614L6.295 8.235a.75.75 0 1 0-1.09 1.03l4.25 4.5a.75.75 0 0 0 1.09 0l4.25-4.5a.75.75 0 0 0-1.09-1.03l-2.955 3.129V2.75Z" />
                                                <path d="M3.5 12.75a.75.75 0 0 0-1.5 0v2.5A2.75 2.75 0 0 0 4.75 18h10.5A2.75 2.75 0 0 0 18 15.25v-2.5a.75.75 0 0 0-1.5 0v2.5c0 .69-.56 1.25-1.25 1.25H4.75c-.69 0-1.25-.56-1.25-1.25v-2.5Z" />
                                            </svg>
                                            Download {item.type === "video" ? "Video" : "Image"} {mediaItems.length > 1 ? `${index + 1}` : ""}
                                        </>
                                    )}
                                </button>
                            </div>
                        ))}
                    </div>

                    {/* Download another */}
                    <button
                        onClick={handleReset}
                        className="mx-auto flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 16 16"
                            fill="currentColor"
                            className="h-4 w-4"
                        >
                            <path
                                fillRule="evenodd"
                                d="M13.836 2.477a.75.75 0 0 1 .75.75v3.182a.75.75 0 0 1-.75.75h-3.182a.75.75 0 0 1 0-1.5h1.37l-.84-.841a4.5 4.5 0 0 0-7.08.932.75.75 0 0 1-1.3-.75 6 6 0 0 1 9.44-1.242l.842.84V3.227a.75.75 0 0 1 .75-.75Zm-.911 7.5A.75.75 0 0 1 13.199 11a6 6 0 0 1-9.44 1.241l-.84-.84v1.371a.75.75 0 0 1-1.5 0V9.591a.75.75 0 0 1 .75-.75H5.35a.75.75 0 1 1 0 1.5H3.98l.841.841a4.5 4.5 0 0 0 7.08-.932.75.75 0 0 1 1.025-.273Z"
                                clipRule="evenodd"
                            />
                        </svg>
                        Download another post
                    </button>
                </div>
            )}

            {/* Amplypost promo */}
            <GetAmplypostCard />

            {/* How it works */}
            <div className="rounded-2xl border border-border bg-card/50 p-6">
                <h3 className="text-base font-semibold text-foreground">
                    How it works
                </h3>
                <div className="mt-4 grid gap-4 sm:grid-cols-3">
                    {[
                        {
                            step: "1",
                            title: "Copy the link",
                            desc: "Open Instagram, tap the share icon on any Reel or post and copy the link.",
                        },
                        {
                            step: "2",
                            title: "Paste & download",
                            desc: "Paste the link above and hit the download button.",
                        },
                        {
                            step: "3",
                            title: "Save to device",
                            desc: "The video or image will be saved directly to your device in full quality.",
                        },
                    ].map((item) => (
                        <div key={item.step} className="flex gap-3">
                            <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-primary/10 text-sm font-bold text-primary">
                                {item.step}
                            </span>
                            <div>
                                <p className="text-sm font-semibold text-foreground">
                                    {item.title}
                                </p>
                                <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
                                    {item.desc}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
