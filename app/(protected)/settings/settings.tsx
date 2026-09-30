"use client";

import { useEffect, useState, type FormEvent } from "react";
import { KeyRound, Loader2, ShieldAlert, UserRound } from "lucide-react";
import { apiFetch, authFetch } from "@/util/backend-api";
import { invalidateCachedResource } from "@/lib/client-cache";
import { ORGANIZATION_USERS_CACHE_KEY } from "@/lib/organization-users";

type AccountSettings = {
    id: string;
    name: string;
    email: string;
    hasPassword: boolean;
    isOwner: boolean;
    deletionPending: boolean;
};

async function request(path: string, method = "GET", body?: unknown) {
    const response = await apiFetch(`settings${path}`, {
        method,
        cache: "no-store",
        ...(body !== undefined ? {
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
        } : {}),
    });
    const result = await response.json().catch(() => null);
    if (!response.ok) throw new Error(result?.message ?? "Something went wrong. Please try again.");
    return result;
}

const inputClass = "w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary disabled:opacity-60";
const buttonClass = "inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50";

export default function Settings() {
    const [account, setAccount] = useState<AccountSettings | null>(null);
    const [name, setName] = useState("");
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [confirmation, setConfirmation] = useState("");
    const [busy, setBusy] = useState<"profile" | "password" | "delete" | null>(null);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    useEffect(() => {
        let active = true;
        request("").then((result) => {
            if (active) {
                setAccount(result.data);
                setName(result.data.name);
            }
        }).catch((error: Error) => { if (active) setError(error.message); });
        return () => { active = false; };
    }, []);

    async function saveProfile(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        if (busy || !account) return;
        setBusy("profile"); setError(""); setSuccess("");
        try {
            const result = await request("/profile", "PATCH", { name: name.trim() });
            setAccount({ ...account, name: result.data.name });
            setName(result.data.name);
            invalidateCachedResource(ORGANIZATION_USERS_CACHE_KEY);
            setSuccess("Your name has been updated.");
        } catch (error) {
            setError(error instanceof Error ? error.message : "Unable to update your name.");
        } finally { setBusy(null); }
    }

    async function savePassword(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        if (busy || !account) return;
        setError(""); setSuccess("");
        if (newPassword !== confirmPassword) { setError("The new passwords do not match."); return; }
        setBusy("password");
        try {
            await request("/password", "POST", {
                newPassword,
                ...(account.hasPassword ? { currentPassword } : {}),
            });
            setSuccess(account.hasPassword ? "Password updated. Your other sessions have been signed out." : "Password set. You can now sign in with your email and password.");
            setAccount({ ...account, hasPassword: true });
            setCurrentPassword(""); setNewPassword(""); setConfirmPassword("");
        } catch (error) {
            setError(error instanceof Error ? error.message : "Unable to save your password.");
        } finally { setBusy(null); }
    }

    async function removeAccount(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        if (busy || !account?.isOwner || confirmation !== "delete-my-account") return;
        setBusy("delete"); setError(""); setSuccess("");
        try {
            await request("/account", "DELETE", { confirmation });
            // The backend has revoked every session. Clear browser cookies and
            // account caches as well, then reload to discard in-memory data.
            await authFetch("auth/sign-out", { method: "POST" }).catch(() => undefined);
            try {
                for (const storage of [localStorage, sessionStorage]) {
                    for (const key of Object.keys(storage)) {
                        if (key.startsWith("amplypost")) storage.removeItem(key);
                    }
                }
            } catch { /* Storage may be unavailable. */ }
            window.location.replace("/login?message=account_deleted");
        } catch (error) {
            setError(error instanceof Error ? error.message : "Unable to delete your account.");
            const result = await request("").catch(() => null);
            if (result?.data) setAccount(result.data);
            setBusy(null);
        }
    }

    const disabled = Boolean(busy) || Boolean(account?.deletionPending);

    return (
        <div className="mx-auto max-w-7xl space-y-8">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-foreground sm:text-3xl">Settings</h1>
                    <p className="mt-1 text-sm text-muted-foreground">Manage your profile, sign-in details, and account.</p>
                </div>
            </div>

            {error && <div role="alert" className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-600 dark:text-red-400">{error}</div>}
            {success && <div role="status" className="rounded-xl border border-green-500/30 bg-green-500/10 p-4 text-sm text-green-700 dark:text-green-400">{success}</div>}
            {!account && (error ? <button onClick={() => window.location.reload()} className={buttonClass}>Try again</button> :
                <p role="status" className="flex items-center gap-2 text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" />Loading settings…</p>)}

            {account && <>
                {account.deletionPending && <div role="status" className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-sm">Account deletion has started. Your account is paused. Retry deletion below to finish removing your data.</div>}

                <section className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm" aria-labelledby="profile-heading">
                    <div className="border-b border-border p-5">
                        <h2 id="profile-heading" className="flex items-center gap-2 text-lg font-semibold text-foreground"><UserRound className="h-5 w-5 shrink-0 text-primary" />Profile</h2>
                        <p className="mt-1 text-sm text-muted-foreground">Update your name and view the email associated with your account.</p>
                    </div>
                    <form onSubmit={saveProfile} className="space-y-5 p-5 sm:p-6">
                        <div className="grid gap-5 md:grid-cols-2">
                            <div className="space-y-2">
                                <label htmlFor="name" className="block text-sm font-medium">Full name</label>
                                <input id="name" name="name" autoComplete="name" required maxLength={100} value={name} onChange={(event) => setName(event.target.value)} disabled={disabled} className={inputClass} />
                            </div>
                            <div className="space-y-2">
                                <label htmlFor="email" className="block text-sm font-medium">Email address</label>
                                <input id="email" type="email" autoComplete="email" value={account.email} readOnly className={`${inputClass} text-muted-foreground`} />
                            </div>
                        </div>
                        <button disabled={disabled || !name.trim() || name.trim() === account.name} className={buttonClass}>{busy === "profile" && <Loader2 className="h-4 w-4 animate-spin" />}Save name</button>
                    </form>
                </section>

                <section className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm" aria-labelledby="password-heading">
                    <div className="border-b border-border p-5">
                        <h2 id="password-heading" className="flex items-center gap-2 text-lg font-semibold text-foreground"><KeyRound className="h-5 w-5 shrink-0 text-primary" />{account.hasPassword ? "Change password" : "Set a password"}</h2>
                        <p className="mt-1 text-sm text-muted-foreground">{account.hasPassword ? "Choose a password of 8–128 characters. Changing it signs out your other sessions." : "Add a password to sign in with your email. You can continue using Google or email codes."}</p>
                    </div>
                    <form onSubmit={savePassword} className="space-y-5 p-5 sm:p-6">
                        <input type="hidden" name="username" autoComplete="username" value={account.email} />
                        {account.hasPassword && <div className="grid gap-5 md:grid-cols-2">
                            <div className="space-y-2">
                                <label htmlFor="current-password" className="block text-sm font-medium">Current password</label>
                                <input id="current-password" type="password" autoComplete="current-password" required maxLength={128} value={currentPassword} onChange={(event) => setCurrentPassword(event.target.value)} disabled={disabled} className={inputClass} />
                            </div>
                        </div>}
                        <div className="grid gap-5 md:grid-cols-2">
                            <div className="space-y-2">
                                <label htmlFor="new-password" className="block text-sm font-medium">New password</label>
                                <input id="new-password" type="password" autoComplete="new-password" required minLength={8} maxLength={128} value={newPassword} onChange={(event) => setNewPassword(event.target.value)} disabled={disabled} className={inputClass} />
                            </div>
                            <div className="space-y-2">
                                <label htmlFor="confirm-password" className="block text-sm font-medium">Confirm new password</label>
                                <input id="confirm-password" type="password" autoComplete="new-password" required minLength={8} maxLength={128} value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} disabled={disabled} className={inputClass} />
                            </div>
                        </div>
                        <button disabled={disabled} className={buttonClass}>{busy === "password" && <Loader2 className="h-4 w-4 animate-spin" />}{account.hasPassword ? "Update password" : "Set password"}</button>
                    </form>
                </section>

                {account.isOwner && <section className="overflow-hidden rounded-2xl border border-red-500/30 bg-card shadow-sm" aria-labelledby="delete-heading">
                    <div className="border-b border-red-500/20 bg-red-500/5 p-5">
                        <h2 id="delete-heading" className="flex items-center gap-2 text-lg font-semibold text-red-600 dark:text-red-400"><ShieldAlert className="h-5 w-5" />Delete account</h2>
                    </div>
                    <div className="p-5 sm:p-6">
                        <p id="delete-description" className="text-sm leading-6 text-muted-foreground">This permanently deletes your entire Amplypost organization and all its users, workspaces, connected-account details, posts, and account records. Active subscriptions will be cancelled. Everyone in the organization will lose access. This cannot be undone.</p>
                        <form onSubmit={removeAccount} className="mt-6 max-w-xl space-y-4">
                            <label htmlFor="delete-confirmation" className="block text-sm font-medium">Type <code className="rounded bg-muted px-1.5 py-0.5">delete-my-account</code> to confirm.</label>
                            <input id="delete-confirmation" aria-describedby="delete-description" autoComplete="off" spellCheck={false} value={confirmation} onChange={(event) => setConfirmation(event.target.value)} disabled={Boolean(busy)} className={`${inputClass} focus:ring-red-500`} />
                            <button disabled={Boolean(busy) || confirmation !== "delete-my-account"} className={`${buttonClass} bg-red-600 text-white`}>{busy === "delete" && <Loader2 className="h-4 w-4 animate-spin" />}{busy === "delete" ? "Deleting account…" : account.deletionPending ? "Retry account deletion" : "Permanently delete account"}</button>
                        </form>
                    </div>
                </section>}
            </>}
        </div>
    );
}
