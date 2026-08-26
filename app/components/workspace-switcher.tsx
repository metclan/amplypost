"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
    BriefcaseBusiness,
    Check,
    ChevronDown,
    Loader2,
    Search,
    Settings2,
    Users,
    X,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ACCOUNTS_CACHE_KEY, CACHE_TTL, fetchAccounts } from "@/lib/client-data";
import { useCachedResource } from "@/lib/client-cache";
import { type Workspace } from "@/lib/workspaces";
import { useWorkspace } from "./workspace-provider";

type WorkspaceSwitcherProps = {
    collapsed?: boolean;
};

function getAccountName(account: { account_name: string; account_username: string | null; provider: string }) {
    const username = account.account_username ? `@${account.account_username}` : account.account_name;
    return `${username} · ${account.provider}`;
}

export default function WorkspaceSwitcher({ collapsed = false }: WorkspaceSwitcherProps) {
    const {
        workspaces,
        selectedWorkspace,
        selectedWorkspaceId,
        isLoadingWorkspaces,
        workspaceError,
        selectWorkspace,
    } = useWorkspace();
    const { data: accounts = [] } = useCachedResource(ACCOUNTS_CACHE_KEY, fetchAccounts, { ttl: CACHE_TTL });
    const [isOpen, setIsOpen] = useState(false);
    const [searchValue, setSearchValue] = useState("");

    const filteredWorkspaces = useMemo(() => {
        const query = searchValue.trim().toLowerCase();
        if (!query) return workspaces;
        return workspaces.filter((workspace) => workspace.name.toLowerCase().includes(query));
    }, [searchValue, workspaces]);

    const accountNamesById = useMemo(
        () => new Map(accounts.map((account) => [account.id, getAccountName(account)])),
        [accounts],
    );

    const workspaceAccountSummary = (workspace: Workspace) => {
        if (workspace.isDefault) return "All active connected accounts";

        const accountIds = workspace.socialMediaAccountIds ?? [];
        if (accountIds.length === 0) return "No accounts";

        const visibleAccounts = accountIds
            .map((accountId) => accountNamesById.get(accountId))
            .filter(Boolean)
            .slice(0, 2);

        if (visibleAccounts.length === 0) {
            return `${accountIds.length} account${accountIds.length === 1 ? "" : "s"}`;
        }

        const remainingCount = accountIds.length - visibleAccounts.length;
        return remainingCount > 0
            ? `${visibleAccounts.join(", ")} +${remainingCount} more`
            : visibleAccounts.join(", ");
    };

    const handleOpen = () => {
        setIsOpen(true);
        setSearchValue("");
    };

    const handleSwitchWorkspace = (workspaceId: string | null) => {
        selectWorkspace(workspaceId);
        setIsOpen(false);
    };

    return (
        <>
            <button
                type="button"
                onClick={handleOpen}
                title={selectedWorkspace ? `Workspace: ${selectedWorkspace.name}` : "Workspace"}
                className={[
                    "group cursor-pointer transition hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                    collapsed
                        ? "flex h-12 w-12 items-center justify-center rounded-2xl text-muted-foreground"
                        : "w-full rounded-xl border border-sidebar-border bg-background/60 px-3 py-2.5 text-left shadow-sm hover:border-primary/35",
                ].join(" ")}
            >
                {collapsed ? (
                    isLoadingWorkspaces ? <Loader2 className="h-5 w-5 animate-spin" /> : <BriefcaseBusiness className="h-5 w-5" />
                ) : (
                    <div className="flex items-center gap-3">
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                            <BriefcaseBusiness className="h-4 w-4" />
                        </span>
                        <div className="min-w-0 flex-1">
                            <div className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                                Workspace
                            </div>
                            <div className="truncate text-sm font-semibold text-foreground">
                                {selectedWorkspace ? selectedWorkspace.name : "Select workspace"}
                            </div>
                        </div>
                        <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground transition group-hover:text-foreground" />
                    </div>
                )}
            </button>

            {isOpen && (
                <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/55 p-4 backdrop-blur-sm">
                    <div className="absolute inset-0" onClick={() => setIsOpen(false)} />
                    <div className="relative flex max-h-[86vh] w-full max-w-xl flex-col overflow-hidden rounded-xl border border-border bg-card shadow-2xl">
                        <div className="flex shrink-0 items-center justify-between border-b border-border px-5 py-4">
                            <div className="min-w-0">
                                <h2 className="text-lg font-semibold text-foreground">Switch Workspace</h2>
                                <p className="mt-1 text-sm text-muted-foreground">
                                    Choose which accounts are available while creating posts.
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setIsOpen(false)}
                                className="cursor-pointer rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground"
                                aria-label="Close workspace selector"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <div className="min-h-0 flex-1 overflow-y-auto p-5">
                            <div className="relative">
                                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                    value={searchValue}
                                    onChange={(event) => setSearchValue(event.target.value)}
                                    placeholder="Search workspaces"
                                    className="h-11 pl-9"
                                />
                            </div>

                            {workspaceError && (
                                <div className="mt-4 rounded-xl border border-red-500/25 bg-red-500/10 p-3 text-sm text-red-600 dark:text-red-200">
                                    {workspaceError.message}
                                </div>
                            )}

                            <div className="mt-4 space-y-2">
                                {isLoadingWorkspaces ? (
                                    <div className="flex items-center justify-center rounded-xl border border-border p-8 text-muted-foreground">
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Loading workspaces...
                                    </div>
                                ) : filteredWorkspaces.length === 0 ? (
                                    <div className="rounded-xl border border-border p-8 text-center text-sm text-muted-foreground">
                                        No workspaces match your search.
                                    </div>
                                ) : (
                                    filteredWorkspaces.map((workspace) => {
                                        const isSelected = workspace.id === selectedWorkspaceId;

                                        return (
                                            <button
                                                key={workspace.id}
                                                type="button"
                                                onClick={() => handleSwitchWorkspace(workspace.id)}
                                                className={[
                                                    "flex w-full cursor-pointer items-start justify-between gap-3 rounded-xl border p-4 text-left transition",
                                                    isSelected ? "border-primary bg-primary/10" : "border-border hover:bg-muted/50",
                                                ].join(" ")}
                                            >
                                                <div className="min-w-0">
                                                    <div className="flex items-center gap-2">
                                                        <p className="truncate font-semibold text-foreground">{workspace.name}</p>
                                                        {workspace.isDefault && (
                                                            <span className="shrink-0 rounded-full border border-primary/30 bg-primary/10 px-2 py-0.5 text-[10px] font-semibold uppercase text-primary">
                                                                Default
                                                            </span>
                                                        )}
                                                        {isSelected && <Check className="h-4 w-4 text-primary" />}
                                                    </div>
                                                    <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                                                        {workspaceAccountSummary(workspace)}
                                                    </p>
                                                    <p className="mt-2 inline-flex items-center gap-1 text-xs text-muted-foreground">
                                                        <Users className="h-3.5 w-3.5" />
                                                        {(workspace.userIds ?? []).length} member{(workspace.userIds ?? []).length === 1 ? "" : "s"}
                                                    </p>
                                                </div>
                                            </button>
                                        );
                                    })
                                )}
                            </div>
                        </div>

                        <div className="flex shrink-0 items-center justify-between gap-3 border-t border-border p-4">
                            <Button asChild variant="outline" className="cursor-pointer">
                                <Link href="/workspaces" onClick={() => setIsOpen(false)}>
                                    <Settings2 className="h-4 w-4" />
                                    Manage workspaces
                                </Link>
                            </Button>
                            <Button type="button" onClick={() => setIsOpen(false)} className="cursor-pointer bg-violet-600 text-white hover:bg-violet-500">
                                Done
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
