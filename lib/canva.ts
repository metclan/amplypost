import { authFetch, backendAuthUrl } from "@/util/backend-api";

export const CANVA_CONNECT_URL = backendAuthUrl("integrations/canva/connect");
export type CanvaStatus = { connected: boolean; capabilities?: { browseDesigns: boolean; exportDesigns: boolean; readProfile: boolean } };
export type CanvaDesign = { id: string; title?: string; thumbnail?: { url: string }; page_count?: number; urls?: { edit_url?: string } };
export type CanvaMedia = { mediaUrl: string; mediaType: "image" | "video"; mimeType: string; size: number; width?: number; height?: number };
export type CanvaFormat = "png" | "jpg" | "mp4";
export type CanvaFormats = Partial<Record<CanvaFormat, { page_numbers?: number[] }>>;
export type CanvaJob = { id: string; status: string; error?: { message?: string } };
export class CanvaError extends Error {
    constructor(message: string, public code: string, public status: number, public retryAfter = 2000) { super(message); }
}
export function canvaErrorMessage(error: unknown) {
    if (error instanceof CanvaError) {
        if (error.status === 401) return "Sign in to Amplypost to use Canva.";
        if (error.code === "CANVA_SCOPE_REQUIRED") return "Canva permission is missing. Reconnect to grant access.";
        if (error.code === "CANVA_MEDIA_TOO_LARGE") return "This export is too large. Choose fewer pages or lower quality.";
        if (error.code === "CANVA_FORBIDDEN") return "Your Canva account cannot access this design or export. Check its permissions and your Canva plan.";
    }
    return error instanceof Error ? error.message : "Unable to reach Canva. Please retry.";
}
export function delay(ms: number, signal: AbortSignal): Promise<void> {
    return new Promise((resolve, reject) => {
        signal.throwIfAborted();
        const abort = () => { clearTimeout(timer); reject(new DOMException("Cancelled", "AbortError")); };
        const timer = setTimeout(() => { signal.removeEventListener("abort", abort); resolve(); }, ms);
        signal.addEventListener("abort", abort, { once: true });
    });
}
export async function canvaRequest<T>(path: string, init: RequestInit = {}): Promise<T> {
    const response = await authFetch(`integrations/canva${path}`, init);
    const body = await response.json().catch(() => ({}));
    if (!response.ok) {
        const retry = response.headers.get("Retry-After");
        const ms = retry ? (/^\d+$/.test(retry) ? Number(retry) * 1000 : Date.parse(retry) - Date.now()) : 2000;
        throw new CanvaError(body.message || "Canva request failed. Please retry.", body.code || "", response.status, Number.isFinite(ms) ? Math.max(2000, ms) : 2000);
    }
    return body as T;
}
export async function canvaRetry<T>(path: string, init: RequestInit, signal: AbortSignal): Promise<T> {
    for (let attempt = 0; ; attempt++) {
        try { return await canvaRequest<T>(path, { ...init, signal }); }
        catch (error) {
            if (!(error instanceof CanvaError) || error.status !== 429 || attempt >= 2) throw error;
            await delay(error.retryAfter, signal);
        }
    }
}
export function exportFormat(type: CanvaFormat, pages: string, formats: CanvaFormats, quality: string) {
    if (!formats[type]) throw new Error("Choose a supported export format.");
    const selected = pages.trim() ? pages.split(",").map(value => Number(value.trim())) : formats[type]?.page_numbers;
    if (selected && (!selected.length || selected.length > 100 || new Set(selected).size !== selected.length || selected.some(page => !Number.isInteger(page) || page < 1 || (formats[type]?.page_numbers && !formats[type]!.page_numbers!.includes(page))))) {
        throw new Error("Choose up to 100 unique, supported page numbers, starting at 1.");
    }
    if (type === "jpg" && (!Number.isInteger(Number(quality)) || Number(quality) < 1 || Number(quality) > 100)) throw new Error("JPEG quality must be between 1 and 100.");
    if (type === "mp4" && !/^(horizontal|vertical)_(480p|720p|1080p|4k)$/.test(quality)) throw new Error("Choose a video quality.");
    return { type, ...(selected ? { pages: selected } : {}), ...(type === "jpg" ? { quality: Number(quality) } : type === "mp4" ? { quality } : {}) };
}
// Resume an existing job on retry; successful imports are idempotent on the backend.
export async function importCanvaJob(jobId: string, signal: AbortSignal, progress: (value: string) => void): Promise<CanvaMedia[]> {
    const deadline = Date.now() + 180_000;
    let attempts = 0;
    while (Date.now() < deadline) {
        const { job } = await canvaRetry<{ job: CanvaJob }>(`/exports/${encodeURIComponent(jobId)}`, {}, signal);
        if (job.status === "failed") throw new CanvaError(job.error?.message || "Export failed. Start a new export.", "EXPORT_FAILED", 400);
        if (job.status === "success") {
            progress("Saving media…");
            try {
                const result = await canvaRetry<{ media: CanvaMedia[] }>(`/exports/${encodeURIComponent(jobId)}/import`, { method: "POST" }, signal);
                signal.throwIfAborted();
                return result.media;
            } catch (error) {
                if (!(error instanceof CanvaError) || error.code !== "CANVA_EXPORT_NOT_READY") throw error;
            }
        }
        progress("Exporting…");
        await delay(Math.min(2000 * 1.3 ** attempts++, 8000), signal);
    }
    throw new Error("Canva is taking longer than expected. Retry to check this export again.");
}
