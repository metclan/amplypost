"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { GetAmplypostCard } from "@/app/components/get-amplypost-card";
import { Button } from "@/components/ui/button";
import { apiFetch } from "@/util/backend-api";

type OutputFormat = "jpeg" | "png" | "webp" | "avif" | "tiff" | "gif" | "heif";
type SourceMode = "upload" | "url";

type ConvertedFile = {
    url: string;
    filename: string;
    mimeType: string;
    size: number;
};

const FORMAT_OPTIONS: { value: OutputFormat; label: string }[] = [
    { value: "webp", label: "WebP (.webp)" },
    { value: "avif", label: "AVIF (.avif)" },
    { value: "jpeg", label: "JPEG (.jpg)" },
    { value: "png", label: "PNG (.png)" },
    { value: "tiff", label: "TIFF (.tiff)" },
    { value: "gif", label: "GIF (.gif)" },
    { value: "heif", label: "HEIF (.heif)" },
];

function formatBytes(bytes: number) {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function extractFilename(headerValue: string | null, fallbackFormat: OutputFormat) {
    if (!headerValue) return `converted-image.${fallbackFormat}`;
    const match = headerValue.match(/filename="?([^"]+)"?/i);
    return match?.[1] || `converted-image.${fallbackFormat}`;
}

export default function ConvertImage() {
    const [sourceMode, setSourceMode] = useState<SourceMode>("upload");
    const [format, setFormat] = useState<OutputFormat>("webp");
    const [urlInput, setUrlInput] = useState("");
    const [selectedFile, setSelectedFile] = useState<File | null>(null);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [converted, setConverted] = useState<ConvertedFile | null>(null);
    const [isDragging, setIsDragging] = useState(false);

    const [inputPreview, setInputPreview] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (!selectedFile) {
            setInputPreview(null);
            return;
        }
        const previewUrl = URL.createObjectURL(selectedFile);
        setInputPreview(previewUrl);
        return () => URL.revokeObjectURL(previewUrl);
    }, [selectedFile]);

    useEffect(() => {
        return () => {
            if (converted?.url) {
                URL.revokeObjectURL(converted.url);
            }
        };
    }, [converted]);

    const canSubmit = useMemo(() => {
        if (loading) return false;
        return sourceMode === "upload" ? Boolean(selectedFile) : Boolean(urlInput.trim());
    }, [loading, selectedFile, sourceMode, urlInput]);

    const resetResult = () => {
        if (converted?.url) {
            URL.revokeObjectURL(converted.url);
        }
        setConverted(null);
    };

    const clearAll = () => {
        setSelectedFile(null);
        setUrlInput("");
        setError(null);
        setIsDragging(false);
        resetResult();
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    const handleFileChange = (files: FileList | null) => {
        if (!files || files.length === 0) return;
        setSelectedFile(files[0]);
        setError(null);
        resetResult();
    };

    const handleUploadClick = () => {
        fileInputRef.current?.click();
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        handleFileChange(e.target.files);
    };

    const handleDragEnter = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
        handleFileChange(e.dataTransfer.files);
    };

    const handleConvert = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!canSubmit) return;

        setLoading(true);
        setError(null);
        resetResult();

        try {
            const body = new FormData();
            body.append("format", format);

            if (sourceMode === "upload" && selectedFile) {
                body.append("file", selectedFile);
            }

            if (sourceMode === "url") {
                body.append("url", urlInput.trim());
            }

            const response = await apiFetch("tools/convert-image", {
                method: "POST",
                body,
            });

            if (!response.ok) {
                const payload = await response.json().catch(() => null);
                throw new Error(payload?.error || "Image conversion failed");
            }

            const blob = await response.blob();
            const blobUrl = URL.createObjectURL(blob);
            const filename = extractFilename(response.headers.get("content-disposition"), format);
            const mimeType = response.headers.get("content-type") || "application/octet-stream";

            setConverted({
                url: blobUrl,
                filename,
                mimeType,
                size: blob.size,
            });
        } catch (err) {
            setError(err instanceof Error ? err.message : "Image conversion failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-8">
            <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
                <form onSubmit={handleConvert} className="space-y-5">
                    <div className="grid grid-cols-2 gap-2 rounded-xl bg-muted p-1">
                        <button
                            type="button"
                            onClick={() => {
                                setSourceMode("upload");
                                setError(null);
                            }}
                            className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${sourceMode === "upload"
                                    ? "bg-background text-foreground shadow-sm"
                                    : "text-muted-foreground hover:text-foreground"
                                }`}
                        >
                            Upload image
                        </button>
                        <button
                            type="button"
                            onClick={() => {
                                setSourceMode("url");
                                setError(null);
                            }}
                            className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${sourceMode === "url"
                                    ? "bg-background text-foreground shadow-sm"
                                    : "text-muted-foreground hover:text-foreground"
                                }`}
                        >
                            Use image URL
                        </button>
                    </div>

                    {sourceMode === "upload" ? (
                        <div className="space-y-2">
                            <label
                                htmlFor="image-file-input"
                                className="block text-sm font-medium text-foreground"
                            >
                                Source image
                            </label>
                            <input
                                ref={fileInputRef}
                                id="image-file-input"
                                type="file"
                                accept="image/*,.heic,.heif,.avif,.tiff,.tif,.webp,.svg,.gif,.png,.jpeg,.jpg"
                                onChange={handleInputChange}
                                className="hidden"
                            />
                            <div
                                onClick={handleUploadClick}
                                onDragEnter={handleDragEnter}
                                onDragOver={handleDragOver}
                                onDragLeave={handleDragLeave}
                                onDrop={handleDrop}
                                className={`rounded-xl border border-dashed p-8 text-center transition-all cursor-pointer ${isDragging
                                        ? "border-primary bg-primary/10"
                                        : "border-primary/50 bg-background/40 hover:bg-muted/40"
                                    }`}
                            >
                                <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-primary/20">
                                    <svg
                                        className="h-7 w-7 text-primary"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                                        />
                                    </svg>
                                </div>
                                <p className="text-base text-foreground">Drag & drop your image here</p>
                                <p className="mt-1 text-sm text-muted-foreground">or</p>
                                <Button
                                    type="button"
                                    className="mt-3 cursor-pointer bg-gradient-to-r from-violet-600 to-purple-600 text-white hover:from-violet-500 hover:to-purple-500"
                                >
                                    Upload Image
                                </Button>
                                <p className="mt-4 text-xs text-muted-foreground">
                                    JPEG, PNG, WebP, AVIF, TIFF, GIF, SVG, HEIF/HEIC
                                </p>
                            </div>
                            {selectedFile && (
                                <div className="rounded-lg border border-border bg-background/40 p-3">
                                    <p className="text-sm font-medium text-foreground">{selectedFile.name}</p>
                                    <p className="mt-1 text-xs text-muted-foreground">{formatBytes(selectedFile.size)}</p>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="space-y-2">
                            <label htmlFor="image-url-input" className="block text-sm font-medium text-foreground">
                                Source image URL
                            </label>
                            <input
                                id="image-url-input"
                                type="url"
                                value={urlInput}
                                onChange={(e) => setUrlInput(e.target.value)}
                                placeholder="https://example.com/image.jpg"
                                className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground placeholder-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                            />
                        </div>
                    )}

                    <div className="space-y-2">
                        <label htmlFor="output-format" className="block text-sm font-medium text-foreground">
                            Output format
                        </label>
                        <select
                            id="output-format"
                            value={format}
                            onChange={(e) => setFormat(e.target.value as OutputFormat)}
                            className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                        >
                            {FORMAT_OPTIONS.map((option) => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="flex flex-col gap-3 sm:flex-row">
                        <button
                            type="submit"
                            disabled={!canSubmit}
                            className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition-all hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {loading ? (
                                <>
                                    <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 0 1 8-8V0C5.373 0 0 5.373 0 12h4Z" />
                                    </svg>
                                    Converting...
                                </>
                            ) : (
                                "Convert image"
                            )}
                        </button>
                        <button
                            type="button"
                            onClick={clearAll}
                            className="w-full rounded-xl border border-border bg-background px-5 py-3 text-sm font-semibold text-foreground transition-colors hover:bg-accent"
                        >
                            Reset
                        </button>
                    </div>
                </form>
            </div>

            {error && (
                <div className="flex items-start gap-3 rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="mt-0.5 h-5 w-5 flex-shrink-0">
                        <path
                            fillRule="evenodd"
                            d="M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0Zm-8-5a.75.75 0 0 1 .75.75v4.5a.75.75 0 0 1-1.5 0v-4.5A.75.75 0 0 1 10 5Zm0 10a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z"
                            clipRule="evenodd"
                        />
                    </svg>
                    <p>{error}</p>
                </div>
            )}

            {(inputPreview || converted) && (
                <div className="grid gap-4 sm:grid-cols-2">
                    <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
                        <p className="mb-3 text-sm font-semibold text-foreground">Input</p>
                        <div className="overflow-hidden rounded-xl border border-border bg-muted">
                            {inputPreview ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img src={inputPreview} alt="Input preview" className="h-52 w-full object-contain" />
                            ) : (
                                <div className="flex h-52 items-center justify-center text-xs text-muted-foreground">
                                    URL source selected
                                </div>
                            )}
                        </div>
                    </div>

                    {converted && (
                        <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
                            <p className="mb-3 text-sm font-semibold text-foreground">Output</p>
                            <div className="overflow-hidden rounded-xl border border-border bg-muted">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img src={converted.url} alt="Converted output" className="h-52 w-full object-contain" />
                            </div>
                            <div className="mt-3 space-y-1 text-xs text-muted-foreground">
                                <p>{converted.filename}</p>
                                <p>{converted.mimeType}</p>
                                <p>{formatBytes(converted.size)}</p>
                            </div>
                            <a
                                href={converted.url}
                                download={converted.filename}
                                className="mt-4 inline-flex w-full items-center justify-center rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-all hover:brightness-110"
                            >
                                Download converted image
                            </a>
                        </div>
                    )}
                </div>
            )}

            <GetAmplypostCard />

            <div className="rounded-2xl border border-border bg-card/50 p-6">
                <h3 className="text-base font-semibold text-foreground">How it works</h3>
                <div className="mt-4 grid gap-4 sm:grid-cols-3">
                    {[
                        {
                            step: "1",
                            title: "Choose source",
                            desc: "Upload an image file or paste a direct image URL.",
                        },
                        {
                            step: "2",
                            title: "Select format",
                            desc: "Pick JPEG, PNG, WebP, AVIF, TIFF, GIF, or HEIF output.",
                        },
                        {
                            step: "3",
                            title: "Convert and save",
                            desc: "Click convert, preview the result, then download instantly.",
                        },
                    ].map((item) => (
                        <div key={item.step} className="flex gap-3">
                            <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-primary/10 text-sm font-bold text-primary">
                                {item.step}
                            </span>
                            <div>
                                <p className="text-sm font-semibold text-foreground">{item.title}</p>
                                <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">{item.desc}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
