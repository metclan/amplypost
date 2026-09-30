"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { BarChart3, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { fetchAccounts, getPlatformLogo, type ConnectedAccount } from "@/lib/client-data";
import { Loading, RequestError } from "./analytics-shared";

const AnalyticsAccountContext = createContext<ConnectedAccount | null>(null);
export const useAnalyticsAccount = () => useContext(AnalyticsAccountContext);

function AccountCircle({ account, selected }: { account: ConnectedAccount; selected: boolean }) {
    const [failed, setFailed] = useState(false);
    const name = account.account_name || account.account_username || account.provider;
    return <Link href={`/analytics/${encodeURIComponent(account.provider)}?account=${encodeURIComponent(account.id)}`}
        prefetch={false} aria-current={selected ? "page" : undefined} aria-label={`${name} · ${account.provider}`}
        className="group flex w-24 shrink-0 flex-col items-center gap-3 rounded-lg py-1 outline-offset-4 focus-visible:outline-2 focus-visible:outline-primary">
        <span className={`relative flex h-16 w-16 items-center justify-center rounded-full bg-muted text-xl font-semibold transition-shadow sm:h-[72px] sm:w-[72px] ${selected ? "ring-2 ring-primary ring-offset-4 ring-offset-background" : "ring-1 ring-border group-hover:ring-2 group-hover:ring-primary/40"}`}>
            {account.profilePicture && !failed ? <Image src={account.profilePicture!} alt="" fill sizes="72px" unoptimized className="rounded-full object-cover" onError={() => setFailed(true)} /> : <span aria-hidden="true">{name.slice(0, 2).toUpperCase()}</span>}
            <span className="absolute bottom-0 right-0 flex h-7 w-7 items-center justify-center rounded-full border-2 border-background bg-white p-1 shadow-sm"><Image src={getPlatformLogo(account.provider)} alt="" width={18} height={18} className="h-4 w-4 object-contain" /></span>
        </span>
        <span className={`w-full truncate text-center text-xs ${selected ? "font-semibold text-foreground" : "text-muted-foreground"}`} title={name}>{name}</span>
    </Link>;
}

export default function AnalyticsShell({ children }: { children: ReactNode }) {
    const [accounts, setAccounts] = useState<ConnectedAccount[]>();
    const [error, setError] = useState<Error>();
    const [attempt, setAttempt] = useState(0);
    const pathname = usePathname();
    const query = useSearchParams();
    const router = useRouter();
    const platform = pathname.split("/")[2];
    const requestedId = query.get("account");
    const selected = accounts?.find(account => account.id === requestedId && (!platform || account.provider === platform))
        ?? accounts?.find(account => account.provider === (platform || "tiktok"))
        ?? (!platform ? accounts?.[0] : undefined);
    useEffect(() => {
        let current = true;
        fetchAccounts().then(result => { if (current) { setAccounts(result); setError(undefined); } })
            .catch(error => { if (current) setError(error instanceof Error ? error : new Error("Unable to load accounts.")); });
        return () => { current = false; };
    }, [attempt]);
    useEffect(() => {
        if (!platform && selected) router.replace(`/analytics/${selected.provider}?account=${encodeURIComponent(selected.id)}`);
    }, [platform, selected, router]);

    return <div className="space-y-7">
        <header><h1 className="text-3xl font-bold tracking-tight">Analytics</h1><p className="mt-2 text-sm text-muted-foreground">Your audience, your content, and what’s getting noticed.</p></header>
        {error ? <RequestError error={error} retry={() => { setError(undefined); setAttempt(value => value + 1); }} /> : !accounts ? <Loading label="Loading connected accounts…" /> : accounts.length === 0 ?
            <div className="space-y-4 rounded-2xl border border-dashed border-border p-10 text-center"><BarChart3 className="mx-auto h-10 w-10 text-muted-foreground" aria-hidden="true" /><h2 className="text-xl font-semibold">See how your content performs</h2><p className="text-sm text-muted-foreground">Connect a TikTok account to get started.</p><Button asChild><Link href="/connected-accounts">Connect an account</Link></Button></div> : <>
                <nav aria-label="Social media accounts" className="border-b border-border pb-3">
                    <div className="flex items-start gap-3 overflow-x-auto px-2 pb-3 pt-2 sm:gap-5">
                        {accounts.map(account => <AccountCircle key={account.id} account={account} selected={account.id === selected?.id} />)}
                        <Link href="/connected-accounts" className="flex w-24 shrink-0 flex-col items-center gap-3 py-1 text-muted-foreground hover:text-foreground"><span className="flex h-16 w-16 items-center justify-center rounded-full border border-dashed border-border sm:h-[72px] sm:w-[72px]"><Plus className="h-5 w-5" aria-hidden="true" /></span><span className="text-xs">Add account</span></Link>
                    </div>
                </nav>
                {!platform ? <Loading label="Opening analytics…" /> : selected ? <AnalyticsAccountContext.Provider value={selected}><div key={selected.id}>{children}</div></AnalyticsAccountContext.Provider> :
                    <div className="rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">Select an account above to view its analytics.</div>}
            </>}
    </div>;
}
