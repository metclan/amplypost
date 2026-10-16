"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { apiFetch } from "@/util/backend-api";
import { fetchAccounts, type ConnectedAccount } from "@/lib/client-data";
import { invalidateCachedResource } from "@/lib/client-cache";
import YouTubePublishConfig, { type YouTubeConfigState } from "../create-post/youtube-publish-config";
import TikTokPublishConfig, { type TikTokConfigState } from "../create-post/tiktok-publish-config";

type Media = { mediaUrl: string; mediaType: "image" | "video" };
type Post = { accountId: string; caption: string | null; status: string; attemptCount: number; isStory: boolean; mediaUrls: Media[]; scheduledFor: string; timezone: string | null; platformConfig: Record<string, unknown> | null };
type Selection = { caption: string; platformConfig: Record<string, unknown> };
const youtubeDefaults: YouTubeConfigState = { title: "", description: "", tags: [], categoryId: "22", privacyStatus: "private", madeForKids: false, notifySubscribers: true, embeddable: true, license: "youtube" };
const tiktokDefaults: TikTokConfigState = { allowComments: false, allowDuet: false, allowStitch: false, isAIGC: false, brandContentToggle: false, isYourBrand: false, isBrandedContent: false, autoAddMusic: false, draftPost: false, agreedToTerms: false };

export default function EditScheduledPost({ groupId, onClose, onSaved }: { groupId: string; onClose: () => void; onSaved: () => void }) {
    const [accounts, setAccounts] = useState<ConnectedAccount[]>([]);
    const [posts, setPosts] = useState<Post[]>([]);
    const [selected, setSelected] = useState<Record<string, Selection>>({});
    const [publishDate, setPublishDate] = useState("");
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    useEffect(() => {
        let active = true;
        async function load() {
            try {
                const [response, connected] = await Promise.all([apiFetch(`post-groups/${groupId}/posts`), fetchAccounts()]);
                const result = await response.json();
                if (!response.ok) throw new Error(result.message || "Unable to load scheduled posts");
                const members: Post[] = result.data.posts;
                if (!members.length || members.some(p => p.status !== "scheduled" || p.attemptCount > 0)) throw new Error("This group has already started publishing and cannot be edited.");
                if (!active) return;
                setAccounts(connected); setPosts(members);
                const selections: Record<string, Selection> = {};
                for (const p of members) selections[p.accountId] = { caption: p.caption || "", platformConfig: p.platformConfig || {} };
                setSelected(selections);
                const date = new Date(members[0].scheduledFor);
                setPublishDate(new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 16));
            } catch (e) { if (active) setError(e instanceof Error ? e.message : "Unable to load scheduled posts"); }
            finally { if (active) setLoading(false); }
        }
        void load();
        return () => { active = false; };
    }, [groupId]);
    const media = posts.find(p => !p.isStory)?.mediaUrls || posts.filter(p => p.accountId === posts[0]?.accountId).flatMap(p => p.mediaUrls);
    function update(id: string, value: Partial<Selection>) { setSelected(current => ({ ...current, [id]: { ...current[id], ...value } })); }
    async function save() {
        setError("");
        const date = new Date(publishDate);
        if (!publishDate || !Number.isFinite(date.getTime()) || date.getTime() <= Date.now()) { setError("Choose a publish date in the future."); return; }
        if (!Object.keys(selected).length) { setError("Select at least one account."); return; }
        setSaving(true);
        try {
            const selectedAccounts = Object.entries(selected).map(([id, value]) => {
                const account = accounts.find(a => a.id === id);
                if (!account) throw new Error("A selected account is disconnected. Deselect it to continue.");
                if (account.provider === "tiktok") {
                    const config = { ...tiktokDefaults, ...value.platformConfig };
                    if (!config.privacy) throw new Error(`Choose TikTok privacy for ${account.accountName}.`);
                    if (!config.agreedToTerms) throw new Error(`Agree to TikTok's terms for ${account.accountName}.`);
                    if (config.brandContentToggle && !config.isYourBrand && !config.isBrandedContent) throw new Error(`Choose content disclosure options for ${account.accountName}.`);
                }
                if (account.provider === "youtube" && !(String(value.platformConfig.title || "").trim())) throw new Error(`Enter a YouTube title for ${account.accountName}.`);
                return { id, provider: account.provider, account_id: account.accountId, caption: value.caption, ...(account.provider === "tiktok" ? { tiktokConfig: { ...tiktokDefaults, ...value.platformConfig } } : { platformConfig: account.provider === "youtube" ? { ...youtubeDefaults, ...value.platformConfig } : value.platformConfig }) };
            });
            const response = await apiFetch(`post-groups/${groupId}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ selectedAccounts, media, postAsStory: posts.some(p => p.isStory), storyOnly: posts.every(p => p.isStory), scheduledPublishDate: date.toISOString(), scheduledTimezone: Intl.DateTimeFormat().resolvedOptions().timeZone }) });
            const result = await response.json();
            if (!response.ok) throw new Error(result.message || "Unable to save changes");
            invalidateCachedResource("posts"); invalidateCachedResource("dashboard");
            onSaved();
        } catch (e) { setError(e instanceof Error ? e.message : "Unable to save changes"); }
        finally { setSaving(false); }
    }
    return <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" role="dialog" aria-modal="true" aria-labelledby="edit-scheduled-title">
        <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-border bg-card p-6 space-y-5">
            <h2 id="edit-scheduled-title" className="text-lg font-semibold">Edit scheduled post</h2>
            <p className="text-sm text-muted-foreground">Changes apply to all platforms in this post group.</p>
            {error && <p role="alert" className="text-sm text-red-500">{error}</p>}
            {loading ? <p>Loading scheduled post…</p> : posts.length > 0 && <fieldset disabled={saving} className="space-y-5">
                <label className="block space-y-2"><span>Publish date ({Intl.DateTimeFormat().resolvedOptions().timeZone})</span><Input type="datetime-local" value={publishDate} onChange={e => setPublishDate(e.target.value)} /></label>
                {Object.keys(selected).filter(id => !accounts.some(a => a.id === id)).map(id => <label key={id} className="block"><input type="checkbox" checked onChange={() => setSelected(current => { const next = { ...current }; delete next[id]; return next; })} /> Disconnected account — remove to save</label>)}
                {accounts.map(account => <div key={account.id} className="rounded-xl border border-border p-4 space-y-3">
                    <label className="flex items-center gap-2"><input type="checkbox" checked={!!selected[account.id]} onChange={e => setSelected(current => { const next = { ...current }; if (e.target.checked) next[account.id] = { caption: posts[0]?.caption || "", platformConfig: {} }; else delete next[account.id]; return next; })} />{account.accountName} ({account.provider})</label>
                    {selected[account.id] && <>
                        <label className="block space-y-2"><span>Caption</span><textarea className="min-h-28 w-full rounded-md border border-border bg-background p-3" value={selected[account.id].caption} onChange={e => update(account.id, { caption: e.target.value })} /></label>
                        {account.provider === "youtube" && <YouTubePublishConfig value={{ ...youtubeDefaults, ...selected[account.id].platformConfig } as YouTubeConfigState} onChange={value => update(account.id, { platformConfig: { ...selected[account.id].platformConfig, ...value } })} />}
                        {account.provider === "tiktok" && <TikTokPublishConfig accountId={account.id} mediaType={media.some(m => m.mediaType === "video") ? "video" : "image"} value={{ ...tiktokDefaults, ...selected[account.id].platformConfig } as TikTokConfigState} onChange={value => update(account.id, { platformConfig: { ...selected[account.id].platformConfig, ...value } })} />}
                    </>}
                </div>)}
            </fieldset>}
            <div className="flex justify-end gap-3"><Button variant="outline" disabled={saving} onClick={onClose}>Cancel</Button><Button disabled={loading || saving || !posts.length} onClick={save}>{saving ? "Saving…" : "Save changes"}</Button></div>
        </div>
    </div>;
}
