"use client";

import { useState, useRef } from "react";
import { GetAmplypostCard } from "@/app/components/get-amplypost-card";
import { apiFetch } from "@/util/backend-api";

type VideoResult = {
    downloadUrl?: string;
    title?: string;
    thumbnail?: string;
    duration?: string;
    author?: string;
};

export default function YouTubeDownloader() {
    const [url, setUrl] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [result, setResult] = useState<VideoResult | null>(null);
    const [downloading, setDownloading] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const trimmed = url.trim();
        if (!trimmed) return;

        setLoading(true);
        setError(null);
        setResult(null);

        try {
            const res = await apiFetch("tools/youtube-downloader", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ url: trimmed }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || "Something went wrong");
            }

            setResult(data.videoUrl);
        } catch (err) {
            setError(
                err instanceof Error ? err.message : "Failed to resolve video"
            );
        } finally {
            setLoading(false);
        }
    };

    const handleDownload = async (videoUrl: string) => {
        setDownloading(true);
        try {
            // Because YouTube video URLs can be locked to an IP or restricted by CORS, 
            // directly opening in a new tab to prompt video download is usually the safest fallback
            // for these signed URLs if proxying the stream isn't implemented.
            const response = await fetch(videoUrl);
            const blob = await response.blob();
            const blobUrl = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = blobUrl;
            a.download = `youtube-video-${Date.now()}.mp4`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(blobUrl);
        } catch {
            // Fallback: open in new tab
            window.open(videoUrl, "_blank");
        } finally {
            setDownloading(false);
        }
    };

    const handleReset = () => {
        setUrl("");
        setResult(null);
        setError(null);
        inputRef.current?.focus();
    };

    const durationSecs = result?.duration ? parseInt(result.duration, 10) : 0;

    return (
        <div className="space-y-8">
            {/* Input form */}
            <form onSubmit={handleSubmit} className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <div className="relative flex-1">
                    <input
                        ref={inputRef}
                        id="youtube-url-input"
                        type="url"
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        placeholder="Paste YouTube video or Shorts link here…"
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
                    id="resolve-button"
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#FF0000] px-6 py-4 text-base font-semibold text-white transition-all hover:bg-[#CC0000] disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto sm:flex-shrink-0"
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
                            Explore
                        </>
                    )}
                </button>
            </form>

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
            {result && (
                <div className="space-y-5 rounded-2xl border border-border bg-card p-6 shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-500">

                    {/* Video Info Header */}
                    <div className="flex items-start gap-4 border-b border-border pb-5">
                        {/* Video Thumbnail Snippet */}
                        {result.thumbnail && (
                            <div className="relative h-20 w-36 flex-shrink-0 overflow-hidden rounded-lg border border-border bg-muted shadow-sm sm:h-24 sm:w-40">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                    src={result.thumbnail}
                                    alt="Video thumbnail"
                                    className="h-full w-full object-cover"
                                />
                                {durationSecs > 0 && (
                                    <span className="absolute bottom-1.5 right-1.5 rounded bg-black/80 px-1.5 py-0.5 text-xs font-medium text-white backdrop-blur-sm">
                                        {Math.floor(durationSecs / 60)}:
                                        {String(durationSecs % 60).padStart(2, "0")}
                                    </span>
                                )}
                            </div>
                        )}
                        <div className="flex flex-col overflow-hidden">
                            {result.title && (
                                <h2 className="line-clamp-2 text-base font-semibold text-foreground sm:text-lg" title={result.title}>
                                    {result.title}
                                </h2>
                            )}
                            {result.author && (
                                <p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
                                        <path fillRule="evenodd" d="M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0Zm-5.5-2.5a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0ZM10 12a5.99 5.99 0 0 0-4.793 2.39A6.483 6.483 0 0 0 10 16.5a6.483 6.483 0 0 0 4.793-2.11A5.99 5.99 0 0 0 10 12Z" clipRule="evenodd" />
                                    </svg>
                                    <span className="truncate">{result.author}</span>
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Download button */}
                    {result.downloadUrl && (
                        <div className="pt-2">
                            <button
                                onClick={() => handleDownload(result.downloadUrl!)}
                                disabled={downloading}
                                id="download-button"
                                className="mx-auto flex w-full max-w-sm items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3.5 text-sm font-semibold text-primary-foreground shadow-md shadow-primary/20 transition-all hover:shadow-lg hover:shadow-primary/30 hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-80"
                            >
                                {downloading ? (
                                    <>
                                        <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                        </svg>
                                        Preparing download…
                                    </>
                                ) : (
                                    <>
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            viewBox="0 0 20 20"
                                            fill="currentColor"
                                            className="h-5 w-5 flex-shrink-0"
                                        >
                                            <path d="M10.75 2.75a.75.75 0 0 0-1.5 0v8.614L6.295 8.235a.75.75 0 1 0-1.09 1.03l4.25 4.5a.75.75 0 0 0 1.09 0l4.25-4.5a.75.75 0 0 0-1.09-1.03l-2.955 3.129V2.75Z" />
                                            <path d="M3.5 12.75a.75.75 0 0 0-1.5 0v2.5A2.75 2.75 0 0 0 4.75 18h10.5A2.75 2.75 0 0 0 18 15.25v-2.5a.75.75 0 0 0-1.5 0v2.5c0 .69-.56 1.25-1.25 1.25H4.75c-.69 0-1.25-.56-1.25-1.25v-2.5Z" />
                                        </svg>
                                        Download Video
                                    </>
                                )}
                            </button>
                        </div>
                    )}

                    {/* Download another */}
                    <button
                        onClick={handleReset}
                        className="mx-auto mt-4 flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
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
                        Download another video
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
                            desc: "Open YouTube, click Share on the video or Short and copy the link.",
                        },
                        {
                            step: "2",
                            title: "Paste & explore",
                            desc: "Paste the link above and hit the Explore button.",
                        },
                        {
                            step: "3",
                            title: "Save to device",
                            desc: "Click the download button to grab the video file directly.",
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
