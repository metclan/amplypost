"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useCachedResource, invalidateCachedResource } from "@/lib/client-cache";
import { CANVA_CONNECT_URL, canvaRequest, CanvaStatus, canvaErrorMessage } from "@/lib/canva";

const statusFetcher = () => canvaRequest<CanvaStatus>("/status");
const profileFetcher = () => canvaRequest<{ profile: { display_name?: string } }>("/profile");
export function CanvaIcon() {
    return <span aria-hidden="true" className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-cyan-400 to-violet-600 font-serif text-2xl italic text-white">C</span>;
}
export function CanvaConnection({ beforeConnect, onBrowse, disabled = false }: { beforeConnect?: () => void; onBrowse?: (canExport: boolean) => void; disabled?: boolean }) {
    const status = useCachedResource("canva:status", statusFetcher);
    const profile = useCachedResource("canva:profile", profileFetcher, { enabled: !!status.data?.connected && !!status.data?.capabilities?.readProfile, ttl: 300_000 });
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState<unknown>();
    const { refetch } = status;
    const refreshProfile = profile.refetch;
    useEffect(() => {
        const url = new URL(window.location.href);
        const result = url.searchParams.get("canva");
        if (result !== "connected" && result !== "error") return;
        url.searchParams.delete("canva");
        window.history.replaceState(window.history.state, "", url);
        invalidateCachedResource("canva:");
        toast[result === "connected" ? "success" : "error"](result === "connected" ? "Canva connected." : "Canva connection failed. Please try again.");
        void refetch().then(async value => {
            if (value.capabilities?.readProfile) await refreshProfile();
        }).catch(setError);
    }, [refetch, refreshProfile]);
    async function disconnect() {
        if (busy || !window.confirm("Disconnect Canva? Media already added to your posts will remain available.")) return;
        setBusy(true); setError(undefined);
        try {
            await canvaRequest("/", { method: "DELETE" });
            invalidateCachedResource("canva:");
            await status.refetch();
            toast.success("Canva disconnected.");
        } catch (err) { setError(err); } finally { setBusy(false); }
    }
    function connect() {
        try { beforeConnect?.(); window.location.assign(CANVA_CONNECT_URL); }
        catch (err) { setError(err); }
    }
    const connected = status.data?.connected;
    const issue = error || status.error || (connected && status.data?.capabilities?.readProfile ? profile.error : undefined);
    return <section aria-label="Canva connection" className="space-y-4 rounded-2xl border border-violet-200/70 bg-gradient-to-br from-violet-50/70 via-card to-cyan-50/50 p-5 shadow-sm dark:border-violet-500/25 dark:from-violet-500/10 dark:to-cyan-500/5 [&_button]:cursor-pointer [&_a]:cursor-pointer [&_button:disabled]:cursor-not-allowed dark:[&_button]:text-white dark:[&_a]:text-white">
        <div className="flex items-center gap-3"><CanvaIcon /><div><h3 className="font-semibold">{connected ? profile.data?.profile.display_name || "Canva account" : "Canva"}</h3><p className="text-sm text-muted-foreground">{status.isLoading ? "Checking connection…" : connected ? "Connected · Ready to create" : "Connect to bring your designs into a post."}</p></div></div>
        {connected && !status.data?.capabilities?.readProfile && <p className="text-sm text-muted-foreground">Reconnect to show your Canva profile</p>}
        {issue ? <p role="alert" className="text-sm text-red-600">{canvaErrorMessage(issue)} <Link className="underline" href="/login">Sign in</Link></p> : null}
        <div className="flex flex-wrap items-center gap-2 border-t border-border/60 pt-4">
            <Button type="button" variant="outline" className={connected ? "rounded-xl dark:bg-white/5" : "rounded-xl border-violet-600 bg-violet-600 text-white hover:bg-violet-700 hover:text-white"} disabled={busy || disabled || status.isLoading} onClick={connect}>{connected ? "Reconnect Canva" : "Connect Canva"}</Button>
            {connected && status.data?.capabilities?.browseDesigns && (onBrowse ? <Button type="button" className="rounded-xl bg-violet-600 text-white hover:bg-violet-700" disabled={busy || disabled} onClick={() => onBrowse(!!status.data?.capabilities?.exportDesigns)}>Choose from Canva</Button> : <Button asChild className="rounded-xl bg-violet-600 text-white hover:bg-violet-700"><Link href="/create-post?canvaPicker=open">Browse designs</Link></Button>)}
            {connected && <Button type="button" variant="destructive" className="rounded-xl bg-red-600 text-white hover:bg-red-700 dark:bg-red-600 dark:hover:bg-red-700" disabled={busy || disabled} onClick={disconnect}>{busy ? "Disconnecting…" : "Disconnect"}</Button>}
            {status.error && <Button type="button" variant="ghost" onClick={() => void status.refetch().catch(setError)}>Retry</Button>}
        </div>
    </section>;
}
