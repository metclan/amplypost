"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { CanvaDialog } from "./dialog";
import { CANVA_CONNECT_URL, CanvaDesign, CanvaError, CanvaFormat, CanvaFormats, CanvaJob, CanvaMedia, canvaErrorMessage, canvaRetry, exportFormat, importCanvaJob } from "@/lib/canva";
import Link from "next/link";
import Image from "next/image";
import * as SelectPrimitive from "@radix-ui/react-select";
import { ArrowLeft, ArrowRight, Check, ChevronDown, ImageIcon, Loader2, Plus, Search } from "lucide-react";

function PickerSelect({ value, onChange, options, label, disabled }: { value: string; onChange: (value: string) => void; options: [string, string][]; label: string; disabled?: boolean }) {
    return <SelectPrimitive.Root value={value} onValueChange={onChange} disabled={disabled}>
        <SelectPrimitive.Trigger aria-label={label} className="flex h-10 w-full min-w-32 items-center justify-between gap-3 rounded-xl border border-border bg-background px-3 text-sm shadow-sm outline-none focus:ring-2 focus:ring-violet-500 disabled:opacity-50"><SelectPrimitive.Value placeholder="Choose format" /><SelectPrimitive.Icon><ChevronDown className="size-4 text-muted-foreground" /></SelectPrimitive.Icon></SelectPrimitive.Trigger>
        <SelectPrimitive.Content position="popper" sideOffset={6} className="z-50 max-h-64 min-w-[var(--radix-select-trigger-width)] overflow-y-auto rounded-xl border border-border bg-popover p-1 text-popover-foreground shadow-xl">
            <SelectPrimitive.Viewport>{options.map(([key, text]) => <SelectPrimitive.Item key={key} value={key} className="relative cursor-pointer rounded-lg py-2 pl-3 pr-9 text-sm outline-none data-[highlighted]:bg-violet-100 dark:data-[highlighted]:bg-violet-500/20"><SelectPrimitive.ItemText>{text}</SelectPrimitive.ItemText><SelectPrimitive.ItemIndicator className="absolute right-3 top-2.5"><Check className="size-4" /></SelectPrimitive.ItemIndicator></SelectPrimitive.Item>)}</SelectPrimitive.Viewport>
        </SelectPrimitive.Content>
    </SelectPrimitive.Root>;
}
function DesignSkeleton() {
    return <div aria-hidden="true" className="animate-pulse overflow-hidden rounded-2xl border border-border bg-card"><div className="h-40 bg-muted" /><div className="space-y-3 p-3"><div className="h-4 w-3/4 rounded bg-muted" /><div className="h-3 w-1/3 rounded bg-muted" /><div className="h-9 rounded-xl bg-muted" /></div></div>;
}

type Selection = { design: CanvaDesign; formats: CanvaFormats; type: CanvaFormat; pages: string; quality: string; jobId?: string; state?: string; error?: unknown; added?: boolean };
const inputClass = "h-10 min-w-0 rounded-xl border border-border bg-background px-3 text-sm shadow-sm outline-none focus:ring-2 focus:ring-violet-500";
export function CanvaPicker({ onClose, onAdd, beforeConnect, canExport }: { onClose: () => void; onAdd: (media: CanvaMedia[]) => void; beforeConnect: () => void; canExport: boolean }) {
    const [step, setStep] = useState<"select" | "review">("select");
    const contentRef = useRef<HTMLDivElement>(null);
    const headingRef = useRef<HTMLHeadingElement>(null);
    useEffect(() => {
        contentRef.current?.scrollTo({ top: 0 });
        headingRef.current?.focus();
    }, [step]);
    const [query, setQuery] = useState("");
    const [ownership, setOwnership] = useState("any");
    const [sort, setSort] = useState("modified_descending");
    const [items, setItems] = useState<CanvaDesign[]>([]);
    const [continuation, setContinuation] = useState<string>();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<unknown>();
    const [selections, setSelections] = useState<Selection[]>([]);
    const [busy, setBusy] = useState(false);
    const searchRef = useRef<AbortController | null>(null);
    const workRef = useRef<AbortController | null>(null);
    const selectionLocks = useRef(new Set<string>());
    const detailControllers = useRef(new Set<AbortController>());
    const alive = useRef(true);
    const editing = useRef<string | undefined>(undefined);
    const [revision, setRevision] = useState(0);
    const thumbnailRetries = useRef(new Set<string>());
    useEffect(() => { const controllers = detailControllers.current; alive.current = true; return () => { alive.current = false; searchRef.current?.abort(); workRef.current?.abort(); controllers.forEach(c => c.abort()); }; }, []);
    const load = useCallback(async (token?: string) => {
        searchRef.current?.abort();
        const controller = new AbortController(); searchRef.current = controller;
        setLoading(true); setError(undefined);
        const params = new URLSearchParams({ query, ownership, sort_by: sort, limit: "25" });
        if (token) params.set("continuation", token);
        try {
            const result = await canvaRetry<{ items: CanvaDesign[]; continuation?: string }>(`/designs?${params}`, {}, controller.signal);
            controller.signal.throwIfAborted();
            setItems(previous => token ? [...previous, ...result.items.filter(item => !previous.some(old => old.id === item.id))] : result.items);
            setContinuation(result.continuation);
        } catch (err) { if (!controller.signal.aborted) setError(err); }
        finally { if (!controller.signal.aborted) setLoading(false); }
    }, [query, ownership, sort]);
    useEffect(() => {
        searchRef.current?.abort(); setItems([]); setContinuation(undefined); setLoading(true);
        const timer = setTimeout(() => void load(), 350);
        return () => { clearTimeout(timer); searchRef.current?.abort(); };
    }, [load, revision]);
    useEffect(() => {
        const refresh = () => {
            if (!editing.current) return;
            const id = editing.current; editing.current = undefined;
            // Editing invalidates the previous page/format choices and export job.
            setSelections(previous => previous.filter(item => item.design.id !== id || item.added));
            setRevision(value => value + 1);
        };
        window.addEventListener("focus", refresh);
        return () => window.removeEventListener("focus", refresh);
    }, []);
    function update(id: string, patch: Partial<Selection>) {
        setSelections(previous => previous.map(item => item.design.id === id ? { ...item, ...patch } : item));
    }
    async function select(design: CanvaDesign): Promise<Selection | undefined> {
        if (busy || selectionLocks.current.has(design.id)) return;
        const existing = selections.find(item => item.design.id === design.id);
        if (existing) { setSelections(previous => previous.filter(item => item.design.id !== design.id)); return; }
        selectionLocks.current.add(design.id);
        // Reserve the position immediately so network completion cannot reorder selections.
        setSelections(previous => [...previous, { design, formats: {}, type: "png", pages: "", quality: "90", state: "Loading formats…" }]);
        const controller = new AbortController(); detailControllers.current.add(controller);
        try {
            const [{ design: details }, { formats }] = await Promise.all([
                canvaRetry<{ design: CanvaDesign }>(`/designs/${encodeURIComponent(design.id)}`, {}, controller.signal),
                canvaRetry<{ formats: CanvaFormats }>(`/designs/${encodeURIComponent(design.id)}/export-formats`, {}, controller.signal),
            ]);
            const type = (["png", "jpg", "mp4"] as const).find(value => formats[value]);
            if (!type) throw new Error("This design has no supported PNG, JPEG or MP4 export.");
            const ready: Selection = { design: details, formats, type, pages: "", quality: type === "mp4" ? "vertical_1080p" : "90" };
            update(design.id, { ...ready, state: undefined });
            return ready;
        } catch (err) { if (!controller.signal.aborted) update(design.id, { error: err, state: undefined }); }
        finally { selectionLocks.current.delete(design.id); detailControllers.current.delete(controller); }
    }
    async function edit(design: CanvaDesign) {
        const tab = window.open("about:blank", "_blank");
        if (!tab) { setError(new Error("Allow pop-ups to open the Canva editor.")); return; }
        tab.opener = null;
        const controller = new AbortController(); detailControllers.current.add(controller);
        try {
            const { design: details } = await canvaRetry<{ design: CanvaDesign }>(`/designs/${encodeURIComponent(design.id)}`, {}, controller.signal);
            const url = new URL(details.urls?.edit_url || "");
            if (url.protocol !== "https:" || !(url.hostname === "canva.com" || url.hostname.endsWith(".canva.com"))) throw new Error("No Canva editor link is available.");
            editing.current = design.id; tab.location.href = url.href;
        } catch (err) { tab.close(); if (!controller.signal.aborted) setError(err); }
        finally { detailControllers.current.delete(controller); }
    }
    async function add(targets = selections) {
        if (workRef.current || targets.some(item => selectionLocks.current.has(item.design.id))) return;
        let invalid = false;
        for (const selection of targets.filter(item => !item.added)) {
            try { exportFormat(selection.type, selection.pages, selection.formats, selection.quality); }
            catch (err) { update(selection.design.id, { error: err }); invalid = true; }
        }
        if (invalid) return;
        const controller = new AbortController(); workRef.current = controller; setBusy(true); setError(undefined);
        // One active job bounds concurrency and preserves the exact selection order.
        for (const selection of targets) {
            if (selection.added) continue;
            const id = selection.design.id;
            try {
                update(id, { error: undefined, state: "Starting export…" });
                let jobId = selection.jobId;
                if (!jobId) {
                    const format = exportFormat(selection.type, selection.pages, selection.formats, selection.quality);
                    const { job } = await canvaRetry<{ job: CanvaJob }>("/exports", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ design_id: id, format }) }, controller.signal);
                    jobId = job.id; update(id, { jobId });
                }
                const media = await importCanvaJob(jobId, controller.signal, state => { if (alive.current) update(id, { state }); });
                controller.signal.throwIfAborted();
                onAdd(media);
                update(id, { added: true, state: "Added to post" });
            } catch (err) {
                if (controller.signal.aborted) break;
                const restart = err instanceof CanvaError && ["EXPORT_FAILED", "CANVA_EXPORT_NOT_FOUND", "CANVA_NOT_FOUND"].includes(err.code);
                update(id, { error: err, state: undefined, ...(restart ? { jobId: undefined } : {}) });
                break; // Retry from this selection before appending later designs.
            }
        }
        workRef.current = null;
        if (alive.current) setBusy(false);
    }
    function reconnect() { try { beforeConnect(); window.location.assign(CANVA_CONNECT_URL); } catch (err) { setError(err); } }
    function showError(issue: unknown) {
        return <div role="alert" className="space-y-2 text-sm text-red-600"><p>{canvaErrorMessage(issue)}</p>{issue instanceof CanvaError && issue.status === 401 ? <Link href="/login" onClick={event => { try { beforeConnect(); } catch (err) { event.preventDefault(); setError(err); } }}>Sign in to Amplypost</Link> : issue instanceof CanvaError && ["CANVA_NOT_CONNECTED", "CANVA_RECONNECT_REQUIRED", "CANVA_SCOPE_REQUIRED"].includes(issue.code) ? <Button type="button" variant="outline" onClick={reconnect}>Reconnect Canva</Button> : null}</div>;
    }
    return <CanvaDialog onClose={() => { workRef.current?.abort(); onClose(); }}>
        <div ref={contentRef} className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 py-5 sm:px-6">
        <div className="mb-5">
            <p className="mb-1 text-xs font-medium text-violet-600 dark:text-violet-300">Step {step === "select" ? "1" : "2"} of 2</p>
            <h3 ref={headingRef} tabIndex={-1} className="text-lg font-semibold outline-none">{step === "select" ? "Select your designs" : "Review & customize"}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{step === "select" ? "Select the designs you want to add to your post." : "Set the file format and pages for each design."}</p>
        </div>
        {step === "select" ? <>

        <div className="mb-5 grid gap-3 sm:grid-cols-3">
            <label className="grid gap-1.5 text-xs font-medium text-muted-foreground">Search designs<div className="relative"><Search className="absolute left-3 top-3 size-4" /><input className={`${inputClass} w-full pl-9 text-foreground`} placeholder="Search your designs…" value={query} maxLength={255} onChange={e => setQuery(e.target.value)} /></div></label>
            <div className="grid gap-1.5 text-xs font-medium text-muted-foreground"><span>Ownership</span><PickerSelect label="Ownership" value={ownership} onChange={setOwnership} options={[["any", "All designs"], ["owned", "Owned by me"], ["shared", "Shared with me"]]} /></div>
            <div className="grid gap-1.5 text-xs font-medium text-muted-foreground"><span>Sort by</span><PickerSelect label="Sort designs" value={sort} onChange={setSort} options={Object.entries({ relevance: "Relevance", modified_descending: "Recently modified", modified_ascending: "Oldest modified", title_ascending: "Title A–Z", title_descending: "Title Z–A" })} /></div>
        </div>
        {error ? <div className="mb-3">{showError(error)}<Button type="button" variant="outline" onClick={() => void load(continuation)}>Retry</Button></div> : null}
        <div aria-busy={loading} className="grid grid-cols-1 gap-4 min-[400px]:grid-cols-2 sm:grid-cols-3">
            {items.map(design => {
                const selected = selections.find(item => item.design.id === design.id);
                const preparing = selected?.state === "Loading formats…";
                return <article key={design.id} className={`group overflow-hidden rounded-2xl border bg-card shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-md ${selected ? "border-violet-500 ring-2 ring-violet-500/20" : "border-border"}`}>
                <button type="button" disabled={busy || !canExport || preparing || selected?.added} aria-label={`Select ${design.title || "Untitled design"}`} aria-pressed={!!selected} onClick={() => void select(design)} className="relative block w-full text-left outline-offset-[-3px] focus-visible:outline-violet-500 disabled:opacity-70">
                    <div className="flex h-40 items-center justify-center bg-gradient-to-br from-muted/40 to-muted p-3">
                    {design.thumbnail?.url ? <Image unoptimized width={320} height={160} className="h-full w-full rounded-lg object-contain transition-transform duration-200 group-hover:scale-[1.03]" src={design.thumbnail.url} alt="" onError={() => { if (!thumbnailRetries.current.has(design.id)) { thumbnailRetries.current.add(design.id); setRevision(value => value + 1); } else setItems(previous => previous.map(item => item.id === design.id ? { ...item, thumbnail: undefined } : item)); }} /> : <div className="flex flex-col items-center gap-2 text-sm text-muted-foreground"><ImageIcon className="size-8" />No preview</div>}
                    </div>
                    <span className={`absolute right-3 top-3 flex size-6 items-center justify-center rounded-full border shadow-sm ${selected ? "border-violet-600 bg-violet-600 text-white" : "border-border bg-background/90"}`}>{selected && <Check className="size-4" />}</span>
                    <div className="px-3 pt-3"><p className="truncate font-medium">{design.title || "Untitled design"}</p><p className="mt-1 text-xs text-muted-foreground">{design.page_count ? `${design.page_count} ${design.page_count === 1 ? "page" : "pages"}` : "Canva design"}</p></div>
                </button>
                <div className="grid gap-1 p-3">
                    <Button type="button" size="sm" className="rounded-xl bg-violet-600 text-white hover:bg-violet-700" disabled={busy || !canExport || preparing || selected?.added} onClick={() => void select(design)}>{preparing ? <Loader2 className="size-4 animate-spin" /> : selected ? <Check className="size-4" /> : <Plus className="size-4" />}{preparing ? "Preparing…" : selected?.added ? "Added to post" : selected ? "Selected" : "Select design"}</Button>
                    {selected?.error ? showError(selected.error) : null}
                    <Button type="button" size="sm" variant="ghost" className="rounded-xl text-xs text-muted-foreground" disabled={busy} onClick={() => void edit(design)}>Open in Canva ↗</Button>
                </div>
            </article>; })}
            {loading && Array.from({ length: items.length ? 3 : 6 }, (_, index) => <DesignSkeleton key={`skeleton-${index}`} />)}
        </div>
        <p role="status" className={loading ? "sr-only" : "my-3 text-center text-sm text-muted-foreground"}>{loading ? "Loading designs…" : !items.length && !error ? "No designs found. Try another search or filter." : ""}</p>
        {continuation && <div className="mt-4 text-center"><Button type="button" variant="outline" className="rounded-xl" disabled={loading} onClick={() => void load(continuation)}>Load more</Button></div>}
        {!canExport && <p className="my-3 text-sm">Reconnect Canva to grant export permission. <Button type="button" variant="outline" onClick={reconnect}>Reconnect</Button></p>}
        </> : <>
        {error ? <div className="mb-3">{showError(error)}</div> : null}
        {!selections.length && <p className="py-8 text-center text-muted-foreground">No designs selected. Go back to choose designs.</p>}
        <div className="space-y-4">
            {selections.map((selection, index) => <fieldset key={selection.design.id} disabled={busy || selection.added || selection.state === "Loading formats…"} className="space-y-3 rounded-2xl border border-border bg-muted/20 p-4">
                <legend className="sr-only">{index + 1}. {selection.design.title || "Untitled design"}</legend>
                <div className="flex items-center gap-4">
                    <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-muted">
                        {selection.design.thumbnail?.url ? <Image unoptimized width={80} height={80} src={selection.design.thumbnail.url} alt={selection.design.title || "Selected design"} className="h-full w-full object-contain" /> : <ImageIcon className="size-7 text-muted-foreground" />}
                    </div>
                    <div className="min-w-0 space-y-1">
                        <p className="text-xs font-medium text-muted-foreground">Design {index + 1}</p>
                        <h4 className="break-words text-sm font-semibold leading-5 text-foreground">{selection.design.title || "Untitled design"}</h4>
                        <p className="text-xs text-muted-foreground">{selection.design.page_count ? `${selection.design.page_count} ${selection.design.page_count === 1 ? "page" : "pages"}` : "Canva design"}</p>
                    </div>
                </div>
                {selection.state === "Loading formats…" ? <div aria-hidden="true" className="grid animate-pulse grid-cols-2 gap-3"><div className="h-14 rounded-xl bg-muted" /><div className="h-14 rounded-xl bg-muted" /></div> : <div className="grid items-start gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    <div className="grid gap-1.5 text-xs font-medium"><span>File format</span><PickerSelect label={`Format for ${selection.design.title || "design"}`} disabled={busy || selection.added || !Object.keys(selection.formats).length} value={selection.type} onChange={value => update(selection.design.id, { type: value as CanvaFormat, pages: "", quality: value === "mp4" ? "vertical_1080p" : "90", jobId: undefined, error: undefined })} options={(["png", "jpg", "mp4"] as const).filter(type => selection.formats[type]).map(type => [type, type === "jpg" ? "JPEG" : type.toUpperCase()])} /></div>
                    <label className="grid gap-1.5 text-xs font-medium">Pages<input className={inputClass} value={selection.pages} placeholder="All pages" onChange={e => update(selection.design.id, { pages: e.target.value, jobId: undefined })} /><span className="font-normal leading-5 text-muted-foreground">Leave blank for all available pages, or enter page numbers like 1, 2, 3.</span></label>
                    {selection.type === "jpg" && <label className="grid gap-1.5 text-xs font-medium">Image quality (1–100)<input className={inputClass} type="number" min={1} max={100} value={selection.quality} onChange={e => update(selection.design.id, { quality: e.target.value, jobId: undefined })} /></label>}
                    {selection.type === "mp4" && <div className="grid gap-1.5 text-xs font-medium"><span>Video quality</span><PickerSelect label="Video quality" disabled={busy || selection.added} value={selection.quality} onChange={value => update(selection.design.id, { quality: value, jobId: undefined })} options={["vertical", "horizontal"].flatMap(direction => ["480p", "720p", "1080p", "4k"].map(size => [`${direction}_${size}`, `${direction === "vertical" ? "Portrait" : "Landscape"} ${size}`] as [string, string]))} /></div>}
                </div>}
                {selection.formats[selection.type]?.page_numbers && <p className="text-xs text-muted-foreground">Available in this format: {selection.formats[selection.type]?.page_numbers?.join(", ")}</p>}
                <p role="status" className="text-sm">{selection.state}</p>{selection.error ? showError(selection.error) : null}
                {!selection.added && <div className="flex gap-2"><Button type="button" variant="ghost" className="text-red-600! hover:bg-red-50 hover:text-red-700! dark:text-red-400! dark:hover:bg-red-500/10 dark:hover:text-red-300!" onClick={() => setSelections(previous => previous.filter(item => item.design.id !== selection.design.id))}>Remove design</Button>{selection.jobId && <Button type="button" variant="outline" onClick={() => update(selection.design.id, { jobId: undefined, error: undefined })}>Start new export</Button>}</div>}
            </fieldset>)}
        </div>
        <p className="my-3 text-xs text-muted-foreground">Exports depend on your Canva plan. Up to 100 files per design, 100 MiB per file.</p>
        </>}
        </div>
        {(selections.length > 0 || step === "review") && <div className="shrink-0 px-4 pb-4 pt-2 sm:px-6"><div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-violet-500/25 bg-background/95 p-3 shadow-[0_-4px_24px_rgba(0,0,0,0.08)] backdrop-blur-xl">
            {step === "review" ? <Button type="button" variant="ghost" disabled={busy} onClick={() => setStep("select")}><ArrowLeft className="size-4" />Back</Button> : null}
            <p role="status" className="text-sm font-medium">{busy ? "Adding designs…" : `${selections.length} ${selections.length === 1 ? "design" : "designs"} selected`}</p>
            {step === "select" ? <Button type="button" className="rounded-xl bg-violet-600 text-white hover:bg-violet-700" onClick={() => setStep("review")}>Review designs<ArrowRight className="size-4" /></Button> : selections.length > 0 && selections.every(item => item.added) ? <Button type="button" onClick={onClose}>Done</Button> : <Button type="button" className="rounded-xl bg-violet-600 text-white hover:bg-violet-700" disabled={busy || !canExport || !selections.length || selections.some(item => !item.added && (item.state === "Loading formats…" || !item.formats[item.type]))} onClick={() => void add()}>{busy && <Loader2 className="size-4 animate-spin" />}{busy ? "Adding designs…" : "Add to post"}</Button>}
        </div></div>}

    </CanvaDialog>;
}
