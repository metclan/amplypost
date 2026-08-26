"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
    BriefcaseBusiness,
    Check,
    Edit3,
    Loader2,
    Plus,
    Search,
    Trash2,
    Users,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ACCOUNTS_CACHE_KEY, CACHE_TTL, fetchAccounts } from "@/lib/client-data";
import { useCachedResource } from "@/lib/client-cache";
import { deleteWorkspace, type Workspace } from "@/lib/workspaces";
import { useWorkspace } from "@/app/components/workspace-provider";

function getWorkspaceAccountCount(workspace: Workspace) {
    if (workspace.isDefault) return "All";
    return (workspace.socialMediaAccountIds ?? []).length;
}

function getWorkspaceMemberCount(workspace: Workspace) {
    return (workspace.userIds ?? []).length;
}

export default function WorkspacesManager() {
    const {
        workspaces,
        selectedWorkspaceId,
        selectWorkspace,
        refreshWorkspaces,
        isLoadingWorkspaces,
        workspaceError,
    } = useWorkspace();
    const { data: accounts = [] } = useCachedResource(ACCOUNTS_CACHE_KEY, fetchAccounts, { ttl: CACHE_TTL });
    const [workspaceSearch, setWorkspaceSearch] = useState("");
    const [deletingWorkspaceId, setDeletingWorkspaceId] = useState<string | null>(null);
    const [confirmDeleteWorkspaceId, setConfirmDeleteWorkspaceId] = useState<string | null>(null);

    const accountNamesById = useMemo(
        () => new Map(accounts.map((account) => [account.id, account.account_name])),
        [accounts],
    );

    const filteredWorkspaces = useMemo(() => {
        const query = workspaceSearch.trim().toLowerCase();
        if (!query) return workspaces;
        return workspaces.filter((workspace) => workspace.name.toLowerCase().includes(query));
    }, [workspaceSearch, workspaces]);

    const workspaceAccountPreview = (workspace: Workspace) => {
        if (workspace.isDefault) return "All active connected accounts are available in this workspace.";

        const accountIds = workspace.socialMediaAccountIds ?? [];
        if (accountIds.length === 0) return "No accounts assigned";

        const visibleAccounts = accountIds
            .map((accountId) => accountNamesById.get(accountId))
            .filter(Boolean)
            .slice(0, 3);

        if (visibleAccounts.length === 0) {
            return `${accountIds.length} account${accountIds.length === 1 ? "" : "s"} assigned`;
        }

        const remainingCount = accountIds.length - visibleAccounts.length;
        return remainingCount > 0
            ? `${visibleAccounts.join(", ")} +${remainingCount} more`
            : visibleAccounts.join(", ");
    };

    const handleDelete = async (workspace: Workspace) => {
        if (confirmDeleteWorkspaceId !== workspace.id) {
            setConfirmDeleteWorkspaceId(workspace.id);
            return;
        }

        setDeletingWorkspaceId(workspace.id);
        try {
            await deleteWorkspace(workspace.id);
            if (selectedWorkspaceId === workspace.id) {
                selectWorkspace(null);
            }
            await refreshWorkspaces();
            setConfirmDeleteWorkspaceId(null);
            toast.success("Workspace deleted.");
        } catch (error) {
            console.error("Failed to delete workspace:", error);
            toast.error(error instanceof Error ? error.message : "Failed to delete workspace.");
        } finally {
            setDeletingWorkspaceId(null);
        }
    };

    return (
        <div className="space-y-6 text-foreground">
            <div className="flex flex-col justify-between gap-4 border-b border-border pb-5 md:flex-row md:items-end">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-foreground">Workspaces</h1>
                    <p className="mt-2 max-w-3xl text-sm text-muted-foreground">
                        Manage the brands, clients, or teams that decide which accounts are available when creating posts.
                    </p>
                </div>
                <Button asChild className="h-11 cursor-pointer bg-violet-600 px-4 text-white hover:bg-violet-500">
                    <Link href="/workspaces/create">
                        <Plus className="h-4 w-4" />
                        New workspace
                    </Link>
                </Button>
            </div>

            {workspaceError && (
                <div className="rounded-xl border border-red-500/25 bg-red-500/10 p-4 text-sm text-red-600 dark:text-red-200">
                    {workspaceError.message}
                </div>
            )}

            <div className="relative max-w-2xl">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                    value={workspaceSearch}
                    onChange={(event) => setWorkspaceSearch(event.target.value)}
                    placeholder="Search workspaces"
                    className="h-11 pl-9"
                />
            </div>

            {isLoadingWorkspaces ? (
                <div className="rounded-xl border border-border bg-card p-10 text-center text-muted-foreground">
                    <Loader2 className="mx-auto mb-3 h-5 w-5 animate-spin" />
                    Loading workspaces...
                </div>
            ) : filteredWorkspaces.length === 0 ? (
                <div className="rounded-xl border border-dashed border-border bg-card p-10 text-center">
                    <BriefcaseBusiness className="mx-auto h-10 w-10 text-muted-foreground" />
                    <h2 className="mt-4 text-lg font-semibold text-foreground">No workspaces found</h2>
                    <p className="mt-2 text-sm text-muted-foreground">
                        Create a workspace to group accounts for a brand, client, or team.
                    </p>
                    <Button asChild className="mt-5 bg-violet-600 text-white hover:bg-violet-500">
                        <Link href="/workspaces/create">Create workspace</Link>
                    </Button>
                </div>
            ) : (
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                    {filteredWorkspaces.map((workspace) => {
                        const isActive = workspace.id === selectedWorkspaceId;
                        const isDeleting = workspace.id === deletingWorkspaceId;
                        const isConfirmingDelete = workspace.id === confirmDeleteWorkspaceId;

                        return (
                            <article
                                key={workspace.id}
                                className={[
                                    "flex min-h-64 flex-col rounded-xl border bg-card p-5 shadow-sm transition hover:border-primary/40",
                                    isActive ? "border-primary/70 ring-1 ring-primary/25" : "border-border",
                                ].join(" ")}
                            >
                                <div className="flex items-start justify-between gap-3">
                                    <div className="flex min-w-0 items-start gap-3">
                                        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                            <BriefcaseBusiness className="h-5 w-5" />
                                        </span>
                                        <div className="min-w-0">
                                            <div className="flex items-center gap-2">
                                                <h2 className="truncate text-lg font-semibold text-foreground">{workspace.name}</h2>
                                                {workspace.isDefault && (
                                                    <span className="shrink-0 rounded-full border border-primary/30 bg-primary/10 px-2 py-0.5 text-[11px] font-semibold text-primary">
                                                        Default
                                                    </span>
                                                )}
                                                {isActive && <Check className="h-4 w-4 shrink-0 text-primary" />}
                                            </div>
                                            <p className="mt-1 text-xs text-muted-foreground">
                                                {workspace.isDefault
                                                    ? "All accounts"
                                                    : `${getWorkspaceAccountCount(workspace)} account${getWorkspaceAccountCount(workspace) === 1 ? "" : "s"}`} · {getWorkspaceMemberCount(workspace)} member{getWorkspaceMemberCount(workspace) === 1 ? "" : "s"}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <p className="mt-4 line-clamp-3 text-sm leading-6 text-muted-foreground">
                                    {workspaceAccountPreview(workspace)}
                                </p>

                                <div className="mt-4 inline-flex w-fit items-center gap-2 rounded-full bg-muted px-3 py-1 text-xs text-muted-foreground">
                                    <Users className="h-3.5 w-3.5" />
                                    {getWorkspaceMemberCount(workspace)} member{getWorkspaceMemberCount(workspace) === 1 ? "" : "s"}
                                </div>

                                <div className="mt-auto flex flex-wrap gap-2 pt-6">
                                    <Button
                                        type="button"
                                        variant={isActive ? "secondary" : "outline"}
                                        size="sm"
                                        onClick={() => selectWorkspace(workspace.id)}
                                        className="cursor-pointer"
                                    >
                                        {isActive ? "Current" : "Switch"}
                                    </Button>
                                    <Button asChild variant="outline" size="sm" className="cursor-pointer">
                                        <Link href={`/workspaces/${workspace.id}/edit`}>
                                            <Edit3 className="h-3.5 w-3.5" />
                                            Edit
                                        </Link>
                                    </Button>
                                    <Button
                                        type="button"
                                        variant={isConfirmingDelete ? "destructive" : "outline"}
                                        size="sm"
                                        disabled={isDeleting || workspace.isDefault}
                                        onClick={() => handleDelete(workspace)}
                                        className="cursor-pointer"
                                    >
                                        {isDeleting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
                                        {isConfirmingDelete ? "Confirm" : "Delete"}
                                    </Button>
                                </div>
                            </article>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
